import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, CheckCircle, ExternalLink, Calendar, Youtube, ShoppingCart, Loader, BrainCircuit, List, HelpCircle } from 'lucide-react';
import axios from 'axios';
import './PreparationScreen.css';
import { API_BASE_URL } from '../config';

// ==========================================
// MASSIVE 10 BOOKS & 10 CHANNELS
// ==========================================
const RECOMMENDED_BOOKS = [
  { id: 1, title: 'Cambridge IELTS 18 Academic', desc: 'Real past exam papers.', link: 'https://www.amazon.com/s?k=Cambridge+IELTS+18' },
  { id: 2, title: 'The Official Cambridge Guide to IELTS', desc: 'Perfect for beginners.', link: 'https://www.amazon.com/s?k=Official+Cambridge+Guide+IELTS' },
  { id: 3, title: 'IELTS Advantage: Writing Skills', desc: 'Master Task 2 essays.', link: 'https://www.amazon.com/s?k=IELTS+Advantage+Writing' },
  { id: 4, title: 'Vocabulary for IELTS Advanced', desc: 'Band 8+ Lexical Resource.', link: 'https://www.amazon.com/s?k=Cambridge+Vocabulary+IELTS+Advanced' },
  { id: 5, title: 'Grammar for IELTS', desc: 'Fix complex sentence structures.', link: 'https://www.amazon.com/s?k=Cambridge+Grammar+IELTS' },
  { id: 6, title: 'Target Band 7: IELTS Academic Module', desc: 'Excellent strategies by Simone Braverman.', link: 'https://www.amazon.com/s?k=Target+Band+7+IELTS' },
  { id: 7, title: 'Barron’s IELTS Superpack', desc: 'Massive all-in-one guide.', link: 'https://www.amazon.com/s?k=Barrons+IELTS+Superpack' },
  { id: 8, title: 'IELTS Trainer 2 Academic', desc: '6 full practice tests with guidance.', link: 'https://www.amazon.com/s?k=IELTS+Trainer+2' },
  { id: 9, title: 'Ideas for IELTS Essay Topics', desc: 'Never run out of Task 2 ideas.', link: 'https://www.amazon.com/s?k=Ideas+for+IELTS+Essay+Topics' },
  { id: 10, title: 'Collins Speaking for IELTS', desc: 'Improve fluency and pronunciation.', link: 'https://www.amazon.com/s?k=Collins+Speaking+for+IELTS' }
];

const RECOMMENDED_CHANNELS = [
  { id: 1, name: 'Algorithmic Web', desc: 'Tech & IELTS Preparation strategies.', link: 'https://www.youtube.com/' },
  { id: 2, name: 'IELTS Advantage', desc: 'The most reliable channel for Writing Task 2.', link: 'https://www.youtube.com/c/IELTSAdvantage' },
  { id: 3, name: 'E2 IELTS', desc: 'Step-by-step methods from ex-examiners.', link: 'https://www.youtube.com/c/E2IELTS' },
  { id: 4, name: 'IELTS Liz', desc: 'Great fundamental tips and model answers.', link: 'https://www.youtube.com/user/ieltsliz' },
  { id: 5, name: 'Fastrack IELTS', desc: 'Fast-paced, modern preparation tips.', link: 'https://www.youtube.com/c/FastrackEducation' },
  { id: 6, name: 'IELTS Daily', desc: 'Daily mock tests and speaking interviews.', link: 'https://www.youtube.com/c/IELTSDaily' },
  { id: 7, name: 'English Speaking Success', desc: 'Keith O\'Hare\'s amazing speaking frameworks.', link: 'https://www.youtube.com/c/EnglishSpeakingSuccess' },
  { id: 8, name: 'IELTS Simon', desc: 'Classic, simple, and highly effective strategies.', link: 'https://www.youtube.com/c/IELTSsimon' },
  { id: 9, name: 'Asad Yaqub IELTS', desc: 'Excellent detailed reading breakdowns.', link: 'https://www.youtube.com/c/AsadYaqubOfficial' },
  { id: 10, name: 'AcademicEnglishHelp', desc: 'High-quality listening and speaking mocks.', link: 'https://www.youtube.com/c/AcademicEnglishHelp' }
];

const SYLLABUS_ITEMS = {
  reading: ['Skimming & Scanning', 'True/False/Not Given', 'Matching Headings', 'Multiple Choice', 'Summary Completion'],
  writing: ['Task 1: Graph Analysis', 'Task 1: Letter Writing', 'Task 2: Opinion Essays', 'Task 2: Problem/Solution', 'Complex Sentences'],
  speaking: ['Part 1: Personal Qs', 'Part 2: Cue Card (2 Min)', 'Part 3: Abstract Discussion', 'Pronunciation', 'Idioms'],
  listening: ['Map Labeling', 'Form/Note Completion', 'Multiple Choice', 'Matching Features', 'Following Distractors']
};

// ==========================================
// 16 QUESTION RIGOROUS DIAGNOSTIC
// ==========================================
const DIAGNOSTIC_QUESTIONS = [
  // READING
  { section: 'reading', type: 'Reading: True/False/Not Given', text: "Read: 'The Amazon rainforest is experiencing unprecedented drought.'\nQ: The drought is common.", options: ["True", "False", "Not Given"], correct: 1 },
  { section: 'reading', type: 'Reading: Vocabulary in Context', text: "Read: 'The arduous journey took 5 days.'\nWhat does 'arduous' mean?", options: ["Quick", "Difficult", "Expensive"], correct: 1 },
  { section: 'reading', type: 'Reading: Inference', text: "Read: 'While electric cars help, battery production hurts the environment.'\nQ: The author thinks electric cars are flawless.", options: ["True", "False", "Not Given"], correct: 1 },
  { section: 'reading', type: 'Reading: Summary', text: "Read: 'Solar power uses photovoltaic cells.'\nSolar energy is transformed by ________.", options: ["Sunlight", "Power", "Cells"], correct: 2 },
  
  // WRITING / GRAMMAR
  { section: 'grammar', type: 'Writing: Lexical Resource', text: "The government implemented the policy to ________ the crisis.", options: ["stop", "mitigate", "help"], correct: 1 },
  { section: 'grammar', type: 'Writing: Cohesion', text: "Which linking word shows contrast?", options: ["Furthermore", "Consequently", "Nevertheless"], correct: 2 },
  { section: 'grammar', type: 'Writing: Complex Sentences', text: "Identify the correct structure:", options: ["Although it rained, we went out.", "Although it rained but we went out.", "It rained, so we went out."], correct: 0 },
  { section: 'grammar', type: 'Writing: Academic Tone', text: "Which is appropriate for Task 1?", options: ["Numbers went up.", "Figures experienced an upward trend.", "Lots of people bought things."], correct: 1 },

  // LISTENING
  { section: 'listening', type: 'Listening: Distractors', text: "Heard: 'It begins at quarter to three, not half past two.'\nWhen does it start?", options: ["2:30", "2:45", "3:15"], correct: 1 },
  { section: 'listening', type: 'Listening: Synonyms', text: "Heard: 'The project is highly cost-effective.'\nQ: The project is ________.", options: ["Expensive", "Affordable", "Beautiful"], correct: 1 },
  { section: 'listening', type: 'Listening: Specific Details', text: "Heard: 'My number is oh-double-seven-eight, one-two-four.'\nWhat is the number?", options: ["0778124", "0788124", "0778144"], correct: 0 },
  { section: 'listening', type: 'Listening: Signposting', text: "Heard: 'Moving on to the next point...'\nWhat is the speaker doing?", options: ["Concluding", "Introducing new topic", "Giving example"], correct: 1 },

  // SPEAKING
  { section: 'speaking', type: 'Speaking: Fluency', text: "What should you do if you forget a word in Speaking Part 2?", options: ["Stop speaking.", "Paraphrase using other words.", "Ask the examiner for the word."], correct: 1 },
  { section: 'speaking', type: 'Speaking: Idioms', text: "Which idiom means 'to study hard'?", options: ["Hit the sack", "Hit the books", "Bite the bullet"], correct: 1 },
  { section: 'speaking', type: 'Speaking: Part 3 Depth', text: "In Part 3, how should you answer?", options: ["One short sentence.", "Give opinion, explain, give example.", "Ask the examiner their opinion."], correct: 1 },
  { section: 'speaking', type: 'Speaking: Pronunciation', text: "Which word has a silent 'b'?", options: ["Obvious", "Doubt", "Absolute"], correct: 1 }
];

const PreparationScreen: React.FC = () => {
  const navigate = useNavigate();
  
  const [appState, setAppState] = useState<'onboarding' | 'diagnostic' | 'analyzing' | 'dashboard'>('onboarding');
  const [activeTab, setActiveTab] = useState<'plan' | 'syllabus' | 'resources'>('plan');
  
  const [userLevel, setUserLevel] = useState('Intermediate');
  const [customPlan, setCustomPlan] = useState<any[]>([]);
  const [quizStep, setQuizStep] = useState(0);
  
  // Track scores for all 4 sections
  const [answers, setAnswers] = useState({ reading: 0, listening: 0, grammar: 0, speaking: 0 });

  const [completedItems, setCompletedItems] = useState<string[]>(() => {
    const saved = localStorage.getItem('ielts_syllabus_progress');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('ielts_syllabus_progress', JSON.stringify(completedItems));
  }, [completedItems]);

  const toggleItem = (item: string) => {
    setCompletedItems(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        let token = localStorage.getItem('token');
        if (!token || token === 'undefined' || token === 'null') return;
        
        const res = await axios.get(`${API_BASE_URL}/api/analytics/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.progress?.customPlan?.length > 0) {
          setCustomPlan(res.data.progress.customPlan);
          setAppState('dashboard');
        }
      } catch (err) { console.log('No existing plan.'); }
    };
    fetchDashboard();
  }, []);

  const handleManualSelection = async (level: string) => {
    setAppState('analyzing');
    setUserLevel(level);
    const defaultWeakAreas = level === 'Beginner' ? ["Basic Grammar", "Reading Strategies", "Speaking Fluency"] : ["Advanced Lexical Resource", "Task 2 Structure", "Listening Part 4"];
    await generateAIPlan(level, defaultWeakAreas);
  };

  const handleQuizAnswer = async (selectedIndex: number) => {
    const currentQ = DIAGNOSTIC_QUESTIONS[quizStep];
    const isCorrect = selectedIndex === currentQ.correct;
    
    setAnswers(prev => ({ ...prev, [currentQ.section]: prev[currentQ.section as keyof typeof prev] + (isCorrect ? 1 : 0) }));

    if (quizStep < DIAGNOSTIC_QUESTIONS.length - 1) {
      setQuizStep(prev => prev + 1);
    } else {
      setAppState('analyzing');
      const totalScore = answers.reading + answers.grammar + answers.listening + answers.speaking + (isCorrect ? 1 : 0);
      
      // Calculate level out of 16
      let calculatedLevel = totalScore >= 13 ? 'Advanced (Band 7.5+)' : (totalScore >= 8 ? 'Intermediate (Band 6.0-7.0)' : 'Beginner (Band 5.0)');
      setUserLevel(calculatedLevel);

      const weakAreas = [];
      if (answers.reading < 3) weakAreas.push("Reading Comprehension");
      if (answers.grammar < 3) weakAreas.push("Advanced Grammar/Writing");
      if (answers.listening < 3) weakAreas.push("Listening Distractors");
      if (answers.speaking < 3) weakAreas.push("Speaking Fluency & Idioms");
      if (weakAreas.length === 0) weakAreas.push("Full Mock Test Timing");

      await generateAIPlan(calculatedLevel, weakAreas);
    }
  };

  const generateAIPlan = async (level: string, weakAreas: string[]) => {
    try {
      let token = localStorage.getItem('token');
      if (!token || token === 'undefined' || token === 'null') {
         alert("Session expired. Please log in again.");
         navigate('/auth');
         return;
      }

      const res = await axios.post(`${API_BASE_URL}/api/analytics/generate-plan`, 
        { level, weakAreas }, { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setCustomPlan(res.data.plan);
      setAppState('dashboard');
    } catch (err) {
      console.error(err);
      alert("AI Generation took too long or backend is asleep. Try again.");
      setAppState('onboarding');
      setQuizStep(0);
      setAnswers({ reading: 0, listening: 0, grammar: 0, speaking: 0 });
    }
  };

  return (
    <div className="prep-container">
      <div className="prep-ambient-glow"></div>
      <div className="prep-top-bar">
        <motion.button className="back-btn" onClick={() => navigate('/selection')}><ArrowLeft className="back-icon" /> Back</motion.button>
        <h1 className="top-title">Preparation <span className="highlight-text">Hub</span></h1>
      </div>

      <AnimatePresence mode="wait">
        {appState === 'onboarding' && (
          <motion.div key="onboarding" className="onboarding-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 style={{ fontSize: '2.5rem', color: '#06b6d4', marginBottom: '10px' }}>Your AI Curriculum</h2>
            <p style={{ color: '#94a3b8', marginBottom: '30px', fontSize: '1.2rem' }}>How would you describe your English proficiency?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
              <button className="not-confident-btn" style={{background: 'rgba(30,41,59,0.8)', color: 'white'}} onClick={() => handleManualSelection('Beginner')}>Beginner (Band 5-6)</button>
              <button className="not-confident-btn" style={{background: 'rgba(30,41,59,0.8)', color: 'white'}} onClick={() => handleManualSelection('Intermediate')}>Intermediate (Band 6.5-7)</button>
              <button className="not-confident-btn" style={{background: 'rgba(30,41,59,0.8)', color: 'white'}} onClick={() => handleManualSelection('Advanced')}>Advanced (Band 7.5+)</button>
            </div>
            <button className="not-confident-btn" onClick={() => setAppState('diagnostic')}><BrainCircuit size={20} /> Not sure? Take 16-Question Diagnostic Test</button>
          </motion.div>
        )}

        {appState === 'diagnostic' && (
          <motion.div key="diagnostic" className="diagnostic-center glass-panel" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}>
            <h4 className="text-cyan-400 font-bold">{DIAGNOSTIC_QUESTIONS[quizStep].type} (Q{quizStep + 1}/16)</h4>
            <p className="quiz-question">{DIAGNOSTIC_QUESTIONS[quizStep].text}</p>
            <div className="quiz-options">
              {DIAGNOSTIC_QUESTIONS[quizStep].options.map((opt, idx) => (
                <button key={idx} className="quiz-opt-btn" onClick={() => handleQuizAnswer(idx)}>{opt}</button>
              ))}
            </div>
          </motion.div>
        )}

        {appState === 'analyzing' && (
          <motion.div key="analyzing" className="analyzing-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <BrainCircuit className="spinning-loader text-cyan-400" size={80} />
            <h2 style={{ fontSize: '2rem', marginTop: '20px' }}>Gemini AI is generating your 30-Day Plan...</h2>
          </motion.div>
        )}

        {appState === 'dashboard' && (
          <motion.div key="dashboard" className="hub-layout" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="hub-tabs">
              <button className={activeTab === 'plan' ? 'active' : ''} onClick={() => setActiveTab('plan')}><Calendar size={18}/> 30-Day Plan</button>
              <button className={activeTab === 'syllabus' ? 'active' : ''} onClick={() => setActiveTab('syllabus')}><List size={18}/> Syllabus To-Do List</button>
              <button className={activeTab === 'resources' ? 'active' : ''} onClick={() => setActiveTab('resources')}><BookOpen size={18}/> Books & Channels</button>
            </div>

            {activeTab === 'plan' && (
              <div className="plan-grid">
                <div className="level-indicator">Level: <span style={{color: '#06b6d4', fontWeight: 'bold'}}>{userLevel}</span></div>
                <div className="thirty-day-scroll">
                  {customPlan.map((day, index) => (
                    <div key={index} className="day-card glass-panel">
                      <div className="day-header">
                        <h4>Day {day.day}</h4>
                        <h3>{day.title}</h3>
                      </div>
                      <ul className="day-tasks">
                        {day.tasks.map((task: string, i: number) => <li key={i}><CheckCircle size={14} className="text-cyan-400"/> {task}</li>)}
                      </ul>
                      <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(day.searchQuery)}`} target="_blank" rel="noreferrer" className="youtube-search-btn">
                        <Youtube size={16} /> Watch Tutorial on YouTube
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'syllabus' && (
              <div className="syllabus-grid">
                {Object.entries(SYLLABUS_ITEMS).map(([module, items]) => (
                  <div key={module} className="glass-panel" style={{marginBottom: '20px'}}>
                    <h3 style={{color: '#06b6d4', textTransform: 'uppercase', marginBottom: '15px'}}>{module}</h3>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                      {items.map(item => {
                        const isDone = completedItems.includes(item);
                        return (
                          <div key={item} onClick={() => toggleItem(item)} style={{display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', background: isDone ? 'rgba(34, 197, 94, 0.1)' : 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px'}}>
                            <div style={{width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${isDone ? '#22c55e' : '#475569'}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                              {isDone && <CheckCircle size={14} color="#22c55e" />}
                            </div>
                            <span style={{textDecoration: isDone ? 'line-through' : 'none', color: isDone ? '#64748b' : 'white'}}>{item}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'resources' && (
               <div className="resources-grid">
               <div className="resource-col">
                 <h3 style={{ borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '20px' }}><ShoppingCart size={20} color="#06b6d4" style={{marginRight:'10px', display:'inline'}}/> Top 10 Books</h3>
                 {RECOMMENDED_BOOKS.map(book => (
                   <div key={book.id} className="resource-card glass-panel" style={{ marginBottom: '15px' }}>
                     <h4>{book.title}</h4>
                     <p style={{ color: '#94a3b8', fontSize:'0.9rem', margin: '5px 0 10px 0' }}>{book.desc}</p>
                     <a href={book.link} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 'bold' }}>Purchase Book <ExternalLink size={14} style={{display:'inline'}}/></a>
                   </div>
                 ))}
               </div>
               <div className="resource-col">
                 <h3 style={{ borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '20px' }}><Youtube size={20} color="#ef4444" style={{marginRight:'10px', display:'inline'}}/> Top 10 Channels</h3>
                 {RECOMMENDED_CHANNELS.map(channel => (
                   <div key={channel.id} className="resource-card glass-panel" style={{ marginBottom: '15px' }}>
                     <h4>{channel.name}</h4>
                     <p style={{ color: '#94a3b8', fontSize:'0.9rem', margin: '5px 0 10px 0' }}>{channel.desc}</p>
                     <a href={channel.link} target="_blank" rel="noreferrer" style={{ color: '#ef4444', textDecoration: 'none', fontWeight: 'bold' }}>Visit Channel <ExternalLink size={14} style={{display:'inline'}}/></a>
                   </div>
                 ))}
               </div>
             </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PreparationScreen;