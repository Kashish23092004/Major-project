import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Headphones, PenTool, Mic, PlayCircle, RotateCcw, BarChart2, X, Loader } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import './WelcomeScreen.css';
import { API_BASE_URL } from '../config';

interface WelcomeScreenProps {
  onStart: (module?: 'listening' | 'reading' | 'writing' | 'speaking', testId?: string) => void;
}

const PracticeHub: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [activeTab, setActiveTab] = useState<'full' | 'reading' | 'listening' | 'writing' | 'speaking'>('full');
  const [tests, setTests] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysisModal, setAnalysisModal] = useState<any[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch User History Safely (Won't crash if Analytics doesn't exist)
      try {
        const historyRes = await axios.get('${API_BASE_URL}/api/analytics/dashboard', { headers });
        setHistory(historyRes.data.progress?.attemptsHistory || []);
      } catch (error) {
        console.log('Analytics history skipped or backend missing analytics route.');
      }

      // 2. Fetch Tests Safely
      try {
        if (activeTab !== 'full') {
          const testRes = await axios.get(`${API_BASE_URL}/api/${activeTab}`);
          setTests(testRes.data);
        } else {
          // Generate 10 Full Tests for the UI
          setTests(Array.from({ length: 10 }, (_, i) => ({ _id: `full_${i+1}`, title: `Full Mock Test ${i + 1}`, isFull: true })));
        }
      } catch (error) {
        console.error('Error fetching tests! Make sure your backend server is running.', error);
        alert('Network Error: Cannot connect to the backend server (localhost:5000). Please make sure your Node.js server is running!');
      }
      
      setLoading(false);
    };
    fetchData();
  }, [activeTab]);

  const openAnalysis = (testId: string) => {
    const attempts = history.filter(h => h.testId === testId).reverse();
    const chartData = attempts.map((a, idx) => ({
      name: `Attempt ${idx + 1}`,
      score: a.score,
      date: new Date(a.attemptDate).toLocaleDateString()
    }));
    setAnalysisModal(chartData);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] left-[50%] translate-x-[-50%] w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black mb-4">Practice <span className="text-cyan-400">Arena</span></h1>
          <p className="text-slate-400 text-lg">Select a section to practice. Your progress and scores are automatically saved.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <button onClick={() => setActiveTab('full')} className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${activeTab === 'full' ? 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:bg-slate-800'}`}><BookOpen size={18}/> Full Mock Tests (10)</button>
          <button onClick={() => setActiveTab('reading')} className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${activeTab === 'reading' ? 'bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:bg-slate-800'}`}><BookOpen size={18}/> Reading (20)</button>
          <button onClick={() => setActiveTab('listening')} className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${activeTab === 'listening' ? 'bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]' : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:bg-slate-800'}`}><Headphones size={18}/> Listening (20)</button>
          <button onClick={() => setActiveTab('writing')} className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${activeTab === 'writing' ? 'bg-pink-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.4)]' : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:bg-slate-800'}`}><PenTool size={18}/> Writing (20)</button>
          <button onClick={() => setActiveTab('speaking')} className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${activeTab === 'speaking' ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:bg-slate-800'}`}><Mic size={18}/> Speaking (20)</button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20"><Loader className="animate-spin text-cyan-400" size={40} /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.length === 0 && (
                <div className="col-span-full text-center py-20 text-red-400 border border-red-400/30 bg-red-400/10 rounded-2xl">
                    <h3 className="text-xl font-bold mb-2">Backend Disconnected</h3>
                    <p>We couldn't fetch the tests. Please ensure your backend server is running.</p>
                </div>
            )}
            
            {tests.map((test, index) => {
              const attemptsForTest = history.filter(h => h.testId === test._id);
              const isAttempted = attemptsForTest.length > 0;
              const bestScore = isAttempted ? Math.max(...attemptsForTest.map(a => a.score)) : null;

              return (
                <motion.div key={test._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                  className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 flex flex-col justify-between hover:bg-slate-800/80 transition-all"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-white">{test.title || `${activeTab.toUpperCase()} Test ${index + 1}`}</h3>
                      {isAttempted && <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full border border-green-500/30">Attempted</span>}
                    </div>
                    {isAttempted && (
                      <p className="text-slate-400 mb-4 flex items-center gap-2">
                        Best Score: <strong className="text-cyan-400 text-lg">{bestScore} {activeTab !== 'reading' && activeTab !== 'listening' ? 'Bands' : '/ 40'}</strong>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 mt-4">
                    {!isAttempted ? (
                      <button onClick={() => onStart(activeTab === 'full' ? undefined : activeTab, test._id)} className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all">
                        <PlayCircle size={18} /> Start Test
                      </button>
                    ) : (
                      <>
                        <button onClick={() => onStart(activeTab === 'full' ? undefined : activeTab, test._id)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all">
                          <RotateCcw size={18} /> Retry
                        </button>
                        <button onClick={() => openAnalysis(test._id)} className="flex-1 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all">
                          <BarChart2 size={18} /> Analysis
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {analysisModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 w-full max-w-3xl relative shadow-2xl">
              <button onClick={() => setAnalysisModal(null)} className="absolute top-6 right-6 text-slate-400 hover:text-white"><X size={24} /></button>
              <h2 className="text-2xl font-bold mb-2">Performance Analysis</h2>
              <p className="text-slate-400 mb-8">Compare your scores across multiple attempts of this specific test.</p>
              
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                {analysisModal.length < 2 ? (
                  <div className="text-center py-10 text-slate-400">Take this test at least twice to see a progression graph!</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analysisModal}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" domain={[0, 'auto']} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                      <Line type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={4} dot={{ r: 6, fill: '#06b6d4' }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PracticeHub;