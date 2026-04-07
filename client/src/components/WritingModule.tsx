import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PenTool, AlertCircle, ChevronRight, ChevronLeft, ArrowLeft, Loader } from 'lucide-react';
import Timer from './Timer';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface WritingModuleProps {
  testId?: string;
  onComplete: (results: any) => void;
  onCancel?: () => void;
}

const WritingModule: React.FC<WritingModuleProps> = ({ testId, onComplete, onCancel }) => {
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [currentTask, setCurrentTask] = useState<1 | 2>(1);
  const [answers, setAnswers] = useState<{ task1: string; task2: string }>({ task1: '', task2: '' });
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchTest = async () => {
      try {
        setLoading(true);
        const url = testId ? `${API_BASE_URL}/api/writing/${testId}` : `${API_BASE_URL}/api/writing`;
        const res = await axios.get(url);
        const testData = Array.isArray(res.data) ? res.data[0] : res.data;
        if (!testData) throw new Error('No writing test found');
        if (isMounted) setTest(testData);
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to load writing test');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchTest();
    return () => { isMounted = false; };
  }, [testId]);

  const wordCount = (text: string) => text.trim().split(/\s+/).filter(w => w.length > 0).length;

  // The Magic: Sending the essays to Gemini AI!
  const submitTest = async () => {
    if (!test) return;
    setIsEvaluating(true);

    try {
      let task1Feedback = null;
      let task2Feedback = null;

      // Evaluate Task 1
      if (answers.task1.trim().length > 10) {
        const res1 = await axios.post(`${API_BASE_URL}/api/writing/evaluate`, {
          text: answers.task1,
          taskType: 'task1'
        });
        task1Feedback = res1.data.feedback;
      }

      // Evaluate Task 2
      if (answers.task2.trim().length > 10) {
       const res2 = await axios.post(`${API_BASE_URL}/api/writing/evaluate`, {
          text: answers.task2,
          taskType: 'task2'
        });
        task2Feedback = res2.data.feedback;
      }

      onComplete({
        task1Score: task1Feedback?.overallBand || 0,
        task2Score: task2Feedback?.overallBand || 0,
        task1Response: answers.task1,
        task2Response: answers.task2,
        timeSpent: 3600,
        feedback: { task1: task1Feedback, task2: task2Feedback }
      });
    } catch (err) {
      console.error("AI Evaluation failed", err);
      alert("Error evaluating essays with AI. Please try again or check your backend Gemini API key.");
      setIsEvaluating(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader className="animate-spin text-pink-600" size={40} /></div>;
  if (error || !test) return <div className="text-center text-red-600 py-20"><AlertCircle size={48} className="mx-auto mb-4" /><p>{error}</p></div>;

  const currentPrompt = currentTask === 1 ? test.task1 : test.task2;
  const currentAnswer = currentTask === 1 ? answers.task1 : answers.task2;
  const currentWordCount = wordCount(currentAnswer);

  if (isEvaluating) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8">
        <Loader size={64} className="animate-spin text-pink-500 mb-6" />
        <h2 className="text-3xl font-black text-slate-800 mb-4">WE ARE Evaluating Your Essay...</h2>
        <p className="text-slate-500 text-lg max-w-md">We are analyzing your vocabulary, grammar, coherence, and task achievement to calculate your official IELTS Band Score.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        
        <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
             {onCancel && (
              <button onClick={onCancel} title="Back to Dashboard" className="mr-2 hover:bg-white/20 p-2 rounded-full transition-colors flex items-center justify-center">
                <ArrowLeft size={24} />
              </button>
            )}
            <PenTool size={28} />
            <h2 className="text-2xl font-bold">{test.title} - Task {currentTask}</h2>
          </div>
          <Timer initialSeconds={3600} onTimeUp={submitTest} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 h-[calc(100vh-250px)]">
          
          {/* Prompt Section */}
          <div className="p-8 border-r border-slate-200 overflow-y-auto bg-slate-50">
            <h3 className="text-xl font-bold mb-4 text-slate-800">Writing Task {currentTask}</h3>
      <div 
               className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6 whitespace-pre-line text-slate-700 leading-relaxed font-medium"
               dangerouslySetInnerHTML={{ __html: currentPrompt.prompt }}
            />
            {currentTask === 1 && currentPrompt.imageUrl && (
              <div className="rounded-2xl overflow-hidden border-2 border-slate-200 shadow-md">
                <img src={currentPrompt.imageUrl} alt="Task 1 Chart" className="w-full object-contain bg-white" />
              </div>
            )}
          </div>

          {/* Writing Area */}
          <div className="p-8 flex flex-col bg-white">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-slate-700">Your Response</span>
              <span className={`font-mono font-bold px-3 py-1 rounded-full text-sm ${currentWordCount < currentPrompt.minWords ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                Words: {currentWordCount} / {currentPrompt.minWords}
              </span>
            </div>
            <textarea
              value={currentAnswer}
              onChange={(e) => setAnswers(prev => ({ ...prev, [currentTask === 1 ? 'task1' : 'task2']: e.target.value }))}
              placeholder="Start writing here..."
              className="flex-1 w-full p-6 border-2 border-slate-200 rounded-2xl resize-none focus:ring-4 focus:ring-pink-100 focus:border-pink-500 transition-all text-lg leading-relaxed text-slate-700"
            />
          </div>
        </div>

        <div className="bg-slate-50 border-t border-slate-200 p-6 flex justify-between items-center">
          <button onClick={() => setCurrentTask(1)} disabled={currentTask === 1} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold ${currentTask === 1 ? 'bg-slate-200 text-slate-400' : 'bg-white text-pink-600 border border-pink-600 hover:bg-pink-50'}`}>
            <ChevronLeft size={20} /> Task 1
          </button>
          
          {currentTask === 2 ? (
            <button onClick={submitTest} className="px-10 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-transform hover:scale-105 text-lg flex items-center gap-2">
              Submit Both Tasks
            </button>
          ) : (
            <button onClick={() => setCurrentTask(2)} className="flex items-center gap-2 px-8 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold shadow-lg">
              Go to Task 2 <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default WritingModule;