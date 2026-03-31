import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, AlertCircle, Square, ChevronRight, UserCircle, ShieldAlert, Loader } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

interface SpeakingModuleProps {
  testId?: string;
  onComplete: (results: any) => void;
}

const SpeakingModule: React.FC<SpeakingModuleProps> = ({ testId, onComplete }) => {
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [hasStarted, setHasStarted] = useState(false);
  const [currentPart, setCurrentPart] = useState<1 | 2 | 3>(1);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  
  const [isExaminerSpeaking, setIsExaminerSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  const [liveTranscript, setLiveTranscript] = useState('');
  const finalTranscriptRef = useRef(''); 
  const [responses, setResponses] = useState<string[]>([]);
  const [examinerPrompt, setExaminerPrompt] = useState('Welcome to your speaking test.');

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchTest = async () => {
      try {
        setLoading(true);
        const url = testId ? `${API_BASE_URL}/api/speaking/${testId}` : `${API_BASE_URL}/api/speaking`;
        const res = await axios.get(url);
        const testData = Array.isArray(res.data) ? res.data[0] : res.data;
        if (!testData) throw new Error('No speaking test found');
        if (isMounted) setTest(testData);
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to load test');
      } finally { 
        if (isMounted) setLoading(false); 
      }
    };
    fetchTest();

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscriptRef.current += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setLiveTranscript(finalTranscriptRef.current + interimTranscript);
      };
      
      recognitionRef.current = recognition;
    }

    return () => { isMounted = false; };
  }, [testId]);

  const askQuestion = (text: string) => {
    setExaminerPrompt(text);
    setIsExaminerSpeaking(true);
    window.speechSynthesis.cancel();
    
    const voices = window.speechSynthesis.getVoices();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; 
    
    const englishVoice = voices.find(v => v.lang.includes('en-US') || v.lang.includes('en-GB'));
    if (englishVoice) utterance.voice = englishVoice;
    
    utterance.onend = () => setIsExaminerSpeaking(false);
    
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 500);
  };

  const startInterview = () => {
    setHasStarted(true);
    const initialPrompt = test.part1.questions[0] || "Hello, let's begin the interview.";
    askQuestion(initialPrompt);
  };

  const startRecording = () => {
    if (isExaminerSpeaking) return;
    if (!SpeechRecognition) return alert("Browser doesn't support voice recognition. Use Chrome.");
    
    finalTranscriptRef.current = '';
    setLiveTranscript('');
    setIsRecording(true);
    
    try { recognitionRef.current.start(); } catch(e) {}
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const evaluateAndFinish = async (allResponses: string[]) => {
    setIsEvaluating(true);
    try {
      const transcriptStr = allResponses.join(' \n ');
      const res = await axios.post(`${API_BASE_URL}/api/speaking/evaluate`, {
        transcript: transcriptStr,
        partNumber: 3
      });

      const evalData = res.data.evaluation;
      onComplete({ 
        part1Score: evalData?.overallBand || 0, 
        part2Score: evalData?.overallBand || 0, 
        part3Score: evalData?.overallBand || 0, 
        responses: allResponses, 
        timeSpent: 900,
        evaluation: evalData
      });

    } catch (err) {
      console.error("AI Speaking Evaluation Failed", err);
      onComplete({ part1Score: 0, part2Score: 0, part3Score: 0, responses: allResponses, timeSpent: 900 });
    }
  };

  const handleNext = () => {
    if (isExaminerSpeaking) return;
    
    let currentResponse = liveTranscript.trim();
    if (isRecording) stopRecording();
    
    const updatedResponses = currentResponse.length > 0 ? [...responses, currentResponse] : [...responses, "(No answer provided)"];
    setResponses(updatedResponses);

    const partKey = `part${currentPart}` as 'part1' | 'part2' | 'part3';
    const totalQuestions = currentPart === 2 ? 1 : (test[partKey]?.questions?.length || 1);

    let nextPart = currentPart;
    let nextIdx = currentQuestionIdx;

    if (currentQuestionIdx < totalQuestions - 1) {
      nextIdx++;
    } else if (currentPart < 3) {
      nextPart++;
      nextIdx = 0;
    } else {
      evaluateAndFinish(updatedResponses);
      return;
    }

    setCurrentPart(nextPart as 1 | 2 | 3);
    setCurrentQuestionIdx(nextIdx);

    const nextTestPartKey = `part${nextPart}` as 'part1' | 'part2' | 'part3';
    
    let nextPromptText = "Please continue.";
    if (nextPart === 2) {
         nextPromptText = test.part2?.cueCard || "Please speak about a topic of your choice.";
    } else if (test[nextTestPartKey]?.questions) {
         nextPromptText = test[nextTestPartKey].questions[nextIdx];
    }
    
    finalTranscriptRef.current = '';
    setLiveTranscript('');
    askQuestion(nextPromptText);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader className="animate-spin text-emerald-500" size={40} /></div>;
  if (error || !test) return <div className="text-center text-red-600 py-20"><AlertCircle size={48} className="mx-auto mb-4" /><p>{error}</p></div>;

  if (isEvaluating) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8">
        <Loader size={64} className="animate-spin text-emerald-500 mb-6" />
        <h2 className="text-3xl font-black text-slate-800 mb-4">AI is Evaluating Your Speech...</h2>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto p-6 min-h-screen">
      <div className="bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-700 flex flex-col">
        
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center px-8">
          <div className="flex items-center gap-3 text-emerald-400">
            <Mic size={24} />
            <h2 className="text-xl font-bold tracking-wide uppercase">Official Speaking Interview</h2>
          </div>
          <div className="text-slate-400 font-mono">PART {currentPart} / 3</div>
        </div>

        {!hasStarted ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-6">
            <ShieldAlert size={64} className="text-emerald-500 mb-6" />
            <h2 className="text-3xl font-black text-white mb-4">Interview Setup</h2>
            <p className="text-slate-400 text-lg max-w-xl mb-8 leading-relaxed">
              The AI Examiner will speak out loud. <b>You cannot record while the Examiner is speaking.</b> Grant microphone permissions when prompted.
            </p>
            <button onClick={startInterview} className="px-12 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold text-xl transition-all">
              Enter Interview Room
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 h-[75vh]">
            
            <div className="bg-slate-800/50 p-10 flex flex-col items-center justify-center border-r border-slate-700 relative">
              <div className="absolute top-6 left-6 bg-slate-800 px-4 py-1 rounded-full text-xs font-bold text-slate-400 tracking-widest border border-slate-700">Examiner</div>
              <div className={`relative mb-8 rounded-full p-2 ${isExaminerSpeaking ? 'bg-emerald-500/20' : 'bg-transparent'}`}>
                {isExaminerSpeaking && <div className="absolute inset-0 border-4 border-emerald-500 rounded-full animate-ping opacity-50"></div>}
                <UserCircle size={140} className={isExaminerSpeaking ? "text-emerald-400" : "text-slate-600"} />
              </div>
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 w-full shadow-inner min-h-[150px] flex items-center justify-center text-center">
                <p className={`text-xl leading-relaxed font-medium ${isExaminerSpeaking ? 'text-white' : 'text-slate-400'}`}>"{examinerPrompt}"</p>
              </div>
            </div>

            <div className="bg-slate-900 p-10 flex flex-col justify-between relative">
              <div className="absolute top-6 left-6 bg-slate-800 px-4 py-1 rounded-full text-xs font-bold text-slate-400 tracking-widest border border-slate-700">Candidate (You)</div>

              <div className="flex-1 mt-12 bg-slate-800/30 rounded-2xl border border-slate-700 p-6 overflow-y-auto mb-8 relative">
                {!liveTranscript && !isRecording && <p className="text-slate-500 text-center mt-10">Press "Record Answer" and start speaking...</p>}
                {isRecording && !liveTranscript && <p className="text-emerald-500 text-center mt-10 animate-pulse">Listening to your microphone...</p>}
                <p className="text-white text-lg leading-relaxed">{liveTranscript}</p>
              </div>

              <div className="flex flex-col items-center gap-6">
                <div className="flex gap-4 w-full">
                  {!isRecording ? (
                    <button onClick={startRecording} disabled={isExaminerSpeaking} className={`flex-1 flex flex-col items-center justify-center py-4 rounded-2xl transition-all ${isExaminerSpeaking ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' : 'bg-red-500 hover:bg-red-600 text-white'}`}>
                      <Mic size={28} className="mb-2" />
                      <span className="font-bold tracking-widest uppercase text-sm">Record Answer</span>
                    </button>
                  ) : (
                    <button onClick={stopRecording} className="flex-1 flex flex-col items-center justify-center py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 animate-pulse">
                      <Square size={28} className="mb-2 text-red-500" />
                      <span className="font-bold tracking-widest uppercase text-sm">Stop Recording</span>
                    </button>
                  )}
                  
                  <button onClick={handleNext} disabled={isExaminerSpeaking} className={`flex-1 flex flex-col items-center justify-center py-4 rounded-2xl transition-all ${isExaminerSpeaking ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}>
                    <ChevronRight size={28} className="mb-2" />
                    <span className="font-bold tracking-widest uppercase text-sm">Next Question</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SpeakingModule;