import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Headphones, AlertCircle, Play, Pause, ChevronRight, ArrowLeft, Loader } from 'lucide-react';
import axios from 'axios';
import Timer from './Timer';
import { API_BASE_URL } from '../config';

interface ListeningModuleProps {
  testId?: string;
  onComplete: (results: { score: number; answers: (string | number)[]; timeSpent: number }) => void;
  onCancel?: () => void;
}

const ListeningModule: React.FC<ListeningModuleProps> = ({ testId, onComplete, onCancel }) => {
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // States for showing results
  const [submitted, setSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchTest = async () => {
      try {
        setLoading(true);
        const url = testId ? `${API_BASE_URL}/api/listening/${testId}` : `${API_BASE_URL}/api/listening`;
        const res = await axios.get(url);
        const testData = Array.isArray(res.data) ? res.data[0] : res.data;
        
        if (!testData) throw new Error('No listening test found');
        if (isMounted) setTest(testData);
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to load test');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchTest();
    return () => { isMounted = false; };
  }, [testId]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const submitTest = () => {
    if (!test) return;
    let score = 0;
    const finalAnswers: string[] = [];

    test.sections.forEach((section: any) => {
      section.questions.forEach((q: any) => {
        // Use q.number as the key to perfectly match the DetailedReview component
        const storedAnswer = answers[q.number] || '';
        const userAnswer = storedAnswer.trim().toLowerCase();
        
        finalAnswers.push(userAnswer);
        
        // Ensure correctAnswer exists and compare safely
        if (q.correctAnswer && userAnswer === q.correctAnswer.trim().toLowerCase()) {
            score++;
        }
      });
    });

    setFinalScore(score);
    setSubmitted(true);
    
    // Stop audio when test is submitted
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    onComplete({ score, answers: finalAnswers, timeSpent: 1800 });
  };

  if (loading) return <div className="flex justify-center py-20"><Loader className="animate-spin text-indigo-600" size={40} /></div>;
  if (error || !test) return <div className="text-center text-red-600 py-20"><AlertCircle size={48} className="mx-auto mb-4" /><p>{error}</p></div>;

  // --- RESULTS VIEW ---
  if (submitted) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Listening Test Complete</h2>
          <div className="text-6xl font-bold text-blue-600 mb-4">
            {finalScore} <span className="text-2xl text-gray-500">/ {test.sections.reduce((acc: number, sec: any) => acc + sec.questions.length, 0)}</span>
          </div>
          <p className="text-gray-600 mb-8">
            You have completed the listening test. Review your answers below.
          </p>
          <button
            onClick={() => window.location.href = '/'} // Redirects to home/dashboard
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>

        {/* Detailed Review Component */}
        <DetailedReview 
          sections={test.sections} 
          userAnswers={answers} 
        />
      </div>
    );
  }

  // --- ACTIVE TEST VIEW ---
  const section = test.sections[0];
  
const rawAudioUrl = section?.audioUrl || test?.audioUrl || "";

const audioUrl = (typeof rawAudioUrl === 'string' && rawAudioUrl.startsWith('http')) 
    ? rawAudioUrl 
    : `${API_BASE_URL}${rawAudioUrl}`;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto p-6">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
             {onCancel && (
              <button onClick={onCancel} title="Back to Dashboard" className="mr-2 hover:bg-white/20 p-2 rounded-full transition-colors flex items-center justify-center">
                <ArrowLeft size={24} />
              </button>
            )}
            <Headphones size={28} />
            <h2 className="text-2xl font-bold">{test.title}</h2>
          </div>
          <Timer initialSeconds={1800} onTimeUp={submitTest} />
        </div>

        <div className="p-8 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Test Audio</h3>
            <p className="text-slate-500">Listen carefully. You will hear the recording only once.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-full shadow-md border border-slate-200">
            <button onClick={togglePlay} className="flex items-center justify-center w-14 h-14 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition shadow-lg hover:scale-105">
              {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
            </button>
            <div className="text-slate-600 font-medium w-32 text-center">
              {isPlaying ? "Playing..." : "Paused"}
            </div>
            {/* The Audio Player */}
            <audio 
              ref={audioRef} 
              src={audioUrl} 
              onEnded={() => setIsPlaying(false)} 
              className="hidden" 
            />
          </div>
        </div>

        <div className="p-8 bg-white h-[55vh] overflow-y-auto">
          <h3 className="text-lg font-bold mb-6 text-slate-800 border-b pb-2">Questions</h3>
          <div className="space-y-8">
            {section.questions.map((q: any, idx: number) => (
              <div key={q.number || idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors">
                <p className="font-semibold text-slate-800 mb-5 text-lg">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold mr-3 text-sm">
                    {q.number}
                  </span>
                  {q.text}
                </p>
                
                {q.type === 'multiple_choice' ? (
                  <div className="space-y-3 ml-11">
                    {q.options?.map((opt: string, i: number) => (
                      <label key={i} className="flex items-center gap-3 cursor-pointer group bg-white p-3 rounded-xl border border-slate-200 hover:bg-indigo-50 transition-colors">
                        <input 
                          type="radio" 
                          name={`q_${q.number}`} 
                          value={opt} 
                          // Saving via q.number to ensure DetailedReview matches it exactly
                          checked={answers[q.number] === opt} 
                          onChange={(e) => setAnswers({...answers, [q.number]: e.target.value})} 
                          className="w-5 h-5 text-indigo-600 focus:ring-indigo-500" 
                        />
                        <span className="text-slate-700 group-hover:text-indigo-900 font-medium">{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="ml-11">
                    <input 
                      type="text" 
                      value={answers[q.number] || ''} 
                      onChange={(e) => setAnswers({...answers, [q.number]: e.target.value})} 
                      placeholder="Type your exact answer..." 
                      className="w-full md:w-1/2 px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-medium text-slate-700" 
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 border-t border-slate-200 p-6 flex justify-end">
           <button onClick={submitTest} className="px-10 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-transform hover:scale-105 text-lg flex items-center gap-2">
             Submit Test <ChevronRight size={24} />
           </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ListeningModule;