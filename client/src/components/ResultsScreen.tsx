import React, { useEffect, useRef, useState } from 'react';
import { Award, TrendingUp, BookOpen, Target, Save, CheckCircle } from 'lucide-react';
import { TestResults } from '../App';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface ResultsScreenProps {
  results: TestResults;
  onReset: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ results, onReset }) => {
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'error'>('saving');
  const hasSaved = useRef(false);

  const calculateOverallBand = () => {
    let totalScore = 0;
    let sectionCount = 0;

    if (results.listening) { totalScore += results.listening.score; sectionCount++; }
    if (results.reading) { totalScore += results.reading.score; sectionCount++; }
    if (results.writing) { totalScore += ((results.writing.task1Score || 0) + (results.writing.task2Score || 0)) / 2; sectionCount++; }
    if (results.speaking) { totalScore += ((results.speaking.part1Score || 0) + (results.speaking.part2Score || 0) + (results.speaking.part3Score || 0)) / 3; sectionCount++; }

    if (sectionCount === 0) return 0;
    const average = totalScore / sectionCount;
    return Math.round(average * 2) / 2; 
  };

  const overallBand = calculateOverallBand();

  // THE NEW AUTO-SAVE LOGIC
  useEffect(() => {
    const saveToDashboard = async () => {
      // Prevent double-saving due to React Strict Mode
      if (hasSaved.current) return;
      hasSaved.current = true;

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setSaveStatus('error');
          return;
        }

        // Determine which module was taken to tag it on the graph
        let activeModule = 'full';
        let activeTestId = 'full_1';
        if (results.listening && !results.reading) { activeModule = 'listening'; activeTestId = 'listening_1'; }
        if (results.reading && !results.listening) { activeModule = 'reading'; activeTestId = 'reading_1'; }
        if (results.writing && !results.reading) { activeModule = 'writing'; activeTestId = 'writing_1'; }
        if (results.speaking && !results.reading) { activeModule = 'speaking'; activeTestId = 'speaking_1'; }

        await axios.post(`${API_BASE_URL}/api/analytics/save`, {
          score: overallBand,
          module: activeModule,
          testId: activeTestId
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setSaveStatus('saved');
      } catch (error) {
        console.error('Failed to save scores:', error);
        setSaveStatus('error');
      }
    };

    saveToDashboard();
  }, [overallBand, results]);

  const getBandColor = (band: number) => {
    if (band >= 8.5) return 'text-green-600 bg-green-50 border-green-200';
    if (band >= 7.0) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (band >= 6.0) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (band >= 5.0) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getBandDescription = (band: number) => {
    if (band >= 8.5) return 'Very Good to Expert User';
    if (band >= 7.0) return 'Good to Very Good User';
    if (band >= 6.0) return 'Competent to Good User';
    if (band >= 5.0) return 'Modest to Competent User';
    return 'Limited User or below';
  };

  const generateStudyPlan = () => {
    const scores = [
      { skill: 'Listening', score: results.listening?.score || 0 },
      { skill: 'Reading', score: results.reading?.score || 0 },
      { skill: 'Writing', score: ((results.writing?.task1Score || 0) + (results.writing?.task2Score || 0)) / 2 },
      { skill: 'Speaking', score: ((results.speaking?.part1Score || 0) + (results.speaking?.part2Score || 0) + (results.speaking?.part3Score || 0)) / 3 }
    ];
    scores.sort((a, b) => a.score - b.score);
    return scores.slice(0, 2).map(skill => skill.skill);
  };

  const studyRecommendations = generateStudyPlan();

  const extractStrengths = () => {
    const strengths: string[] = [];
    if (results.writing?.feedback?.task1?.strengths) strengths.push(...results.writing.feedback.task1.strengths.slice(0, 1));
    if (results.writing?.feedback?.task2?.strengths) strengths.push(...results.writing.feedback.task2.strengths.slice(0, 1));
    if (results.speaking?.evaluation?.overallBand && results.speaking.evaluation.overallBand >= 7.0) strengths.push('Strong speaking fluency and coherence');
    if (results.listening?.score && results.listening.score >= 7.0) strengths.push('Strong listening comprehension skills');
    if (results.reading?.score && results.reading.score >= 7.0) strengths.push('Excellent reading and analytical abilities');
    strengths.push('Completed all sections within time limits');
    return strengths.slice(0, 5); 
  };

  const extractAreasForImprovement = () => {
    const areas: string[] = [];
    if (results.writing?.feedback?.task1?.areasForImprovement) areas.push(...results.writing.feedback.task1.areasForImprovement.slice(0, 1));
    if (results.writing?.feedback?.task2?.areasForImprovement) areas.push(...results.writing.feedback.task2.areasForImprovement.slice(0, 1));
    if (results.speaking?.evaluation?.fluency && results.speaking.evaluation.fluency < 7.0) areas.push('Work on reducing hesitations and filler words');
    if (studyRecommendations.includes('Listening') && results.listening) areas.push('Focus on understanding different accents and speech patterns');
    if (studyRecommendations.includes('Reading') && results.reading) areas.push('Practice skimming and scanning techniques');
    return areas.slice(0, 5); 
  };

  const strengths = extractStrengths();
  const areasForImprovement = extractAreasForImprovement();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Save Status Banner */}
        <div className="flex justify-center mb-6">
          {saveStatus === 'saving' && <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-medium shadow-sm"><Save className="w-4 h-4 animate-pulse" /> Saving to Dashboard...</div>}
          {saveStatus === 'saved' && <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-medium shadow-sm"><CheckCircle className="w-4 h-4" /> Scores Saved to Dashboard</div>}
          {saveStatus === 'error' && <div className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full font-medium shadow-sm">Failed to save scores.</div>}
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <Award className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-800 mb-2">IELTS Test Results</h1>
          <p className="text-xl text-gray-600">Complete Performance Analysis</p>
        </div>

        {/* Overall Score */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center border-t-4 border-indigo-500">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Overall Band Score</h2>
          <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-4 shadow-inner ${getBandColor(overallBand)} mb-4`}>
            <span className="text-4xl font-bold">{overallBand}</span>
          </div>
          <p className="text-xl font-semibold text-gray-700">{getBandDescription(overallBand)}</p>
        </div>

        {/* Individual Scores */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Listening */}
          <div className={`bg-white rounded-xl shadow-md p-6 ${!results.listening ? 'opacity-50' : 'border-b-4 border-purple-500'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Listening</h3>
              {results.listening ? (
                <div className={`px-3 py-1 rounded-full text-sm font-bold border ${getBandColor(results.listening.score)}`}>{results.listening.score}</div>
              ) : (<span className="text-gray-400 text-sm">Not taken</span>)}
            </div>
            {results.listening && (
              <div className="text-sm text-gray-600 font-medium">
                <p>Correct Answers: {results.listening.score}/15</p>
                <p>Time: {Math.floor(results.listening.timeSpent / 60)} min</p>
              </div>
            )}
          </div>

          {/* Reading */}
          <div className={`bg-white rounded-xl shadow-md p-6 ${!results.reading ? 'opacity-50' : 'border-b-4 border-blue-500'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Reading</h3>
              {results.reading ? (
                <div className={`px-3 py-1 rounded-full text-sm font-bold border ${getBandColor(results.reading.score)}`}>{results.reading.score}</div>
              ) : (<span className="text-gray-400 text-sm">Not taken</span>)}
            </div>
            {results.reading && (
              <div className="text-sm text-gray-600 font-medium">
                <p>Correct Answers: {results.reading.score}/15</p>
                <p>Time: {Math.floor(results.reading.timeSpent / 60)} min</p>
              </div>
            )}
          </div>

          {/* Writing */}
          <div className={`bg-white rounded-xl shadow-md p-6 ${!results.writing ? 'opacity-50' : 'border-b-4 border-pink-500'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Writing</h3>
              {results.writing ? (
                <div className={`px-3 py-1 rounded-full text-sm font-bold border ${getBandColor(((results.writing.task1Score || 0) + (results.writing.task2Score || 0)) / 2)}`}>
                  {Math.round(((results.writing.task1Score || 0) + (results.writing.task2Score || 0)) / 2 * 2) / 2}
                </div>
              ) : (<span className="text-gray-400 text-sm">Not taken</span>)}
            </div>
            {results.writing && (
              <div className="text-sm text-gray-600">
                <p className="font-medium">Task 1: Band {results.writing.task1Score || 0}</p>
                <p className="font-medium">Task 2: Band {results.writing.task2Score || 0}</p>
                {results.writing.feedback && (
                  <div className="mt-3 pt-3 border-t text-xs text-gray-500">AI Feedback Generated Successfully</div>
                )}
              </div>
            )}
          </div>

          {/* Speaking */}
          <div className={`bg-white rounded-xl shadow-md p-6 ${!results.speaking ? 'opacity-50' : 'border-b-4 border-emerald-500'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Speaking</h3>
              {results.speaking ? (
                <div className={`px-3 py-1 rounded-full text-sm font-bold border ${getBandColor(((results.speaking.part1Score || 0) + (results.speaking.part2Score || 0) + (results.speaking.part3Score || 0)) / 3)}`}>
                  {Math.round(((results.speaking.part1Score || 0) + (results.speaking.part2Score || 0) + (results.speaking.part3Score || 0)) / 3 * 2) / 2}
                </div>
              ) : (<span className="text-gray-400 text-sm">Not taken</span>)}
            </div>
            {results.speaking && (
              <div className="text-sm text-gray-600">
                {results.speaking.evaluation && (
                  <div className="mt-2 space-y-1 font-medium">
                    <p>Fluency: {results.speaking.evaluation.fluency?.toFixed(1) || 'N/A'}</p>
                    <p>Lexical: {results.speaking.evaluation.vocabulary?.toFixed(1) || 'N/A'}</p>
                    <p>Grammar: {results.speaking.evaluation.grammar?.toFixed(1) || 'N/A'}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Detailed Feedback */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 mr-3 text-indigo-500" />
              AI Performance Analysis
            </h3>

            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-green-600 mb-3 bg-green-50 px-4 py-2 rounded-lg">Top Strengths</h4>
                <ul className="text-sm text-gray-700 space-y-2 px-4">
                  {strengths.length > 0 ? (
                    strengths.map((strength, idx) => (<li key={idx} className="flex items-start gap-2"><span className="text-green-500 font-bold">•</span> {strength}</li>))
                  ) : (<li>Good attempt across all sections</li>)}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-orange-600 mb-3 bg-orange-50 px-4 py-2 rounded-lg">Areas for Improvement</h4>
                <ul className="text-sm text-gray-700 space-y-2 px-4">
                  {areasForImprovement.length > 0 ? (
                    areasForImprovement.map((area, idx) => (<li key={idx} className="flex items-start gap-2"><span className="text-orange-500 font-bold">•</span> {area}</li>))
                  ) : (<li>Continue regular practice to maintain performance</li>)}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Target className="w-6 h-6 mr-3 text-indigo-500" />
              Personalized Study Plan
            </h3>

            <div className="space-y-5">
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
                <h4 className="font-bold text-indigo-900 mb-2">Priority Focus Areas</h4>
                <p className="text-indigo-700 text-sm font-medium">
                  Based on your AI evaluation, focus heavily on: <strong>{studyRecommendations.join(' and ')}</strong>
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-3">AI Recommendations</h4>
                <div className="space-y-3 text-sm text-gray-600">
                  {results.writing?.feedback?.task1?.recommendations && (
                    <div className="p-3 bg-pink-50 border border-pink-100 rounded-lg">
                      <p className="font-bold text-pink-700 mb-1">Writing:</p>
                      <p>{results.writing.feedback.task1.recommendations[0]}</p>
                    </div>
                  )}
                  {results.speaking?.evaluation?.recommendations && (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                      <p className="font-bold text-emerald-700 mb-1">Speaking:</p>
                      <p>{results.speaking.evaluation.recommendations[0]}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4 pt-4 border-t border-gray-200">
          <button
            onClick={onReset}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            Return to Practice Hub
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;