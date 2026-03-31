import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, AlertCircle, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import Timer from './Timer';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface ReadingModuleProps {
  testId?: string;
  onComplete: (results: { score: number; answers: (string | number)[]; timeSpent: number }) => void;
  onCancel?: () => void; // FIX: Receive cancel function
}

const ReadingModule: React.FC<ReadingModuleProps> = ({ testId, onComplete, onCancel }) => {
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true; 
    const fetchTest = async () => {
      try {
        setLoading(true);
        const url = testId 
          ? `${API_BASE_URL}/api/reading/${testId}` 
          : `${API_BASE_URL}/api/reading`;
          
        const res = await axios.get(url);
        const testData = Array.isArray(res.data) ? res.data[0] : res.data;
        if (!testData) throw new Error('No reading test found');
        if (isMounted) setTest(testData);
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to load reading test');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchTest();
    return () => { isMounted = false; };
  }, [testId]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const submitTest = () => {
    if (!test) return;
    let score = 0;
    const finalAnswers: string[] = [];

    test.sections.forEach((section: any) => {
      section.questions.forEach((q: any) => {
        const userAnswer = (answers[q._id] || '').trim().toLowerCase();
        finalAnswers.push(userAnswer);
        if (userAnswer === q.correctAnswer.trim().toLowerCase()) score++;
      });
    });

    onComplete({ score, answers: finalAnswers, timeSpent: 3600 });
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;
  if (error || !test) return <div className="text-center text-red-600 py-20"><AlertCircle size={48} className="mx-auto mb-4" /><p>{error}</p></div>;

  const section = test.sections[currentSection];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* FIX: Add the visual Back Button to the Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {onCancel && (
              <button onClick={onCancel} title="Back to Dashboard" className="mr-2 hover:bg-white/20 p-2 rounded-full transition-colors flex items-center justify-center">
                <ArrowLeft size={24} />
              </button>
            )}
            <BookOpen size={28} />
            <h2 className="text-2xl font-bold">{test.title} - Section {currentSection + 1}</h2>
          </div>
          <Timer initialSeconds={3600} onTimeUp={submitTest} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 h-[calc(100vh-250px)]">
          <div className="p-8 border-r border-slate-200 overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6 text-slate-800">{section.title}</h3>
            <div className="prose prose-lg text-slate-700" dangerouslySetInnerHTML={{ __html: section.passage }} />
          </div>

          <div className="p-8 bg-slate-50 overflow-y-auto">
            <div className="space-y-8">
              {section.questions.map((q: any, idx: number) => (
                <div key={q._id || idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <p className="font-medium text-slate-800 mb-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold mr-3">{q.number}</span>
                    {q.text}
                  </p>
                  {q.type === 'multiple_choice' || q.type === 'true_false_not_given' ? (
                    <div className="space-y-3 ml-11">
                      {q.options?.map((opt: string, i: number) => (
                        <label key={i} className="flex items-start gap-3 cursor-pointer group">
                          <input type="radio" name={q._id || `q${idx}`} value={opt} checked={answers[q._id] === opt} onChange={(e) => handleAnswerChange(q._id, e.target.value)} className="mt-1 text-indigo-600 focus:ring-indigo-500" />
                          <span className="text-slate-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="ml-11">
                      <input type="text" value={answers[q._id] || ''} onChange={(e) => handleAnswerChange(q._id, e.target.value)} placeholder="Type answer..." className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 border-t border-slate-200 p-6 flex justify-between items-center">
          <button onClick={() => setCurrentSection(Math.max(0, currentSection - 1))} disabled={currentSection === 0} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium ${currentSection === 0 ? 'bg-slate-200 text-slate-400' : 'bg-white text-indigo-600 border border-indigo-600'}`}><ChevronLeft size={20} /> Previous</button>
          {currentSection === test.sections.length - 1 ? (
            <button onClick={submitTest} className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg">Submit Test</button>
          ) : (
            <button onClick={() => setCurrentSection(Math.min(test.sections.length - 1, currentSection + 1))} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg">Next <ChevronRight size={20} /></button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ReadingModule;