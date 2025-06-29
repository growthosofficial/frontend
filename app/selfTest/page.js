'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SidebarNavigation from '../../components/SidebarNavigation';
import { 
  getCategories, 
  getStats, 
  generateFreeTextQuestions, 
  generateMultipleChoiceQuestions,
  evaluateFreeTextAnswers,
  evaluateMultipleChoiceAnswers,
  checkBackendStatus
} from '../../lib/api';
import { 
  Brain, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target, 
  BookOpen, 
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  Lightbulb,
  FileText,
  List,
  Zap,
  Wifi,
  WifiOff
} from 'lucide-react';

export default function SelfTestPage() {
  const [testMode, setTestMode] = useState('free-text'); // 'free-text' or 'multiple-choice'
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluations, setEvaluations] = useState([]);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [numQuestions, setNumQuestions] = useState(3);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [backendStatus, setBackendStatus] = useState('checking'); // 'checking', 'connected', 'disconnected'
  const router = useRouter();

  // Load categories and stats on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    // Check backend status first
    const status = await checkBackendStatus();
    setBackendStatus(status.status);
    
    if (status.status === 'connected') {
      try {
        await Promise.all([
          loadCategories(),
          loadStats()
        ]);
      } catch (error) {
        console.error('Failed to load initial data:', error);
        setError('Failed to load initial data. Please refresh the page.');
      }
    } else {
      setError('Backend is not available. Please check your connection.');
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
      throw error;
    }
  };

  const loadStats = async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
      throw error;
    }
  };

  const generateQuestions = async () => {
    if (backendStatus !== 'connected') {
      setError('Backend is not available. Please check your connection.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccessMessage('');

    try {
      let data;
      
      if (testMode === 'free-text') {
        const params = new URLSearchParams({
          num_questions: numQuestions.toString(),
          main_category: selectedCategory || null
        });
        data = await generateFreeTextQuestions(numQuestions, selectedCategory || null);
      } else {
        const params = new URLSearchParams({
          num_questions: numQuestions.toString(),
          main_category: selectedCategory || null
        });
        data = await generateMultipleChoiceQuestions(numQuestions, selectedCategory || null);
      }

      setQuestions(data.questions || []);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setTestStarted(true);
      setTestCompleted(false);
      setEvaluations([]);
      
      setSuccessMessage(`Generated ${data.total_questions} ${testMode === 'free-text' ? 'free-text' : 'multiple-choice'} questions!`);
    } catch (error) {
      setError(`Failed to generate questions: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleMultipleChoiceAnswer = (questionId, selectedIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: selectedIndex
    }));
  };

  const submitAnswers = async () => {
    if (questions.length === 0) return;

    setIsEvaluating(true);
    setError('');

    try {
      let data;
      
      if (testMode === 'free-text') {
        const answersData = questions.map((q, index) => ({
          knowledge_id: q.knowledge_id,
          question_text: q.question_text,
          answer: answers[`${q.knowledge_id}_${index}`] || ''
        }));
        data = await evaluateFreeTextAnswers(answersData);
      } else {
        const answersData = questions.map((q, index) => ({
          question_id: q.question_id,
          selected_answer_index: answers[`${q.question_id}_${index}`] || 0
        }));
        data = await evaluateMultipleChoiceAnswers(answersData);
      }

      setEvaluations(data.evaluations || []);
      setTestCompleted(true);
      
      setSuccessMessage(`Evaluation complete! You answered ${data.total_evaluated} questions.`);
    } catch (error) {
      setError(`Failed to evaluate answers: ${error.message}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  const resetTest = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTestStarted(false);
    setTestCompleted(false);
    setEvaluations([]);
    setError('');
    setSuccessMessage('');
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const getMasteryLevel = (mastery) => {
    if (mastery >= 0.9) return { level: 'Expert', color: 'text-green-500', bg: 'bg-green-100' };
    if (mastery >= 0.7) return { level: 'Advanced', color: 'text-blue-500', bg: 'bg-blue-100' };
    if (mastery >= 0.5) return { level: 'Intermediate', color: 'text-yellow-500', bg: 'bg-yellow-100' };
    if (mastery >= 0.3) return { level: 'Beginner', color: 'text-orange-500', bg: 'bg-orange-100' };
    return { level: 'Novice', color: 'text-red-500', bg: 'bg-red-100' };
  };

  const getScoreColor = (score, testMode, isCorrect = null) => {
    if (testMode === 'free-text') {
      // Free-text uses 1-5 scale
      if (score >= 4) return 'text-green-500';
      if (score >= 3) return 'text-blue-500';
      if (score >= 2) return 'text-yellow-500';
      return 'text-red-500';
    } else {
      // Multiple-choice uses binary correct/incorrect
      return isCorrect ? 'text-green-500' : 'text-red-500';
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  const handleCategoryClick = (categoryType, categoryName) => {
    // Show category information or filter questions
    const message = `${categoryType}: ${categoryName}`;
    console.log(message);
    // You could add a toast notification or modal here
    alert(`${categoryType}: ${categoryName}\n\nThis could be used to:\n- Filter questions by category\n- Show category statistics\n- Navigate to category-specific tests`);
  };

  const handleSubCategoryClick = (subCategoryName) => {
    const message = `Sub Category: ${subCategoryName}`;
    console.log(message);
    alert(`Sub Category: ${subCategoryName}\n\nThis could be used to:\n- Filter by specific sub-categories\n- Show detailed topic information\n- Navigate to related content`);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="flex h-full">
        <SidebarNavigation currentPage="test" />
        
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Brain size={32} className="text-blue-400" />
              <h1 className="text-3xl font-bold text-white">Self Test</h1>
              <div className="flex items-center gap-2 ml-auto">
                {backendStatus === 'connected' ? (
                  <div className="flex items-center gap-1 text-green-400">
                    <Wifi size={16} />
                    <span className="text-sm">Connected</span>
                  </div>
                ) : backendStatus === 'disconnected' ? (
                  <div className="flex items-center gap-1 text-red-400">
                    <WifiOff size={16} />
                    <span className="text-sm">Disconnected</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-yellow-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-400 border-t-transparent"></div>
                    <span className="text-sm">Checking...</span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-gray-400">Test your knowledge and track your mastery progress</p>
          </div>

          {/* Backend Status Warning */}
          {backendStatus === 'disconnected' && (
            <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <WifiOff size={20} className="text-red-400" />
                <p className="text-red-400">Backend is not available. Some features may not work properly.</p>
              </div>
            </div>
          )}

          {/* Stats Overview */}
          {stats && backendStatus === 'connected' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-3">
                  <BookOpen className="text-blue-400" size={20} />
                  <div>
                    <p className="text-gray-400 text-sm">Total Items</p>
                    <p className="text-white text-xl font-bold">{stats.total_items}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-3">
                  <Target className="text-green-400" size={20} />
                  <div>
                    <p className="text-gray-400 text-sm">Categories</p>
                    <p className="text-white text-xl font-bold">{stats.unique_main_categories}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-3">
                  <BarChart3 className="text-purple-400" size={20} />
                  <div>
                    <p className="text-gray-400 text-sm">Avg Mastery</p>
                    <p className="text-white text-xl font-bold">
                      {stats.avg_strength_score ? `${(stats.avg_strength_score * 100).toFixed(1)}%` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-3">
                  <Zap className="text-yellow-400" size={20} />
                  <div>
                    <p className="text-gray-400 text-sm">Strong Items</p>
                    <p className="text-white text-xl font-bold">{stats.strong_items || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Test Setup */}
          {!testStarted && (
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-gray-700 mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Create Your Test</h2>
              
              {/* Test Mode Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">Test Type</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setTestMode('free-text')}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                      testMode === 'free-text'
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <FileText size={20} />
                    Free Text Questions
                  </button>
                  <button
                    onClick={() => setTestMode('multiple-choice')}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                      testMode === 'multiple-choice'
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <List size={20} />
                    Multiple Choice
                  </button>
                </div>
              </div>

              {/* Test Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Number of Questions
                  </label>
                  <select
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[3, 5, 10, 15, 20].map(num => (
                      <option key={num} value={num}>{num} questions</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category (Optional)
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.main_category} value={cat.main_category}>
                        {cat.main_category} ({cat.total_items} items)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateQuestions}
                disabled={isGenerating || backendStatus !== 'connected'}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <Play size={20} />
                    Start Test
                  </>
                )}
              </button>
            </div>
          )}

          {/* Error and Success Messages */}
          {error && (
            <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-4 mb-6">
              <p className="text-red-400">❌ {error}</p>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-600/20 border border-green-600/50 rounded-lg p-4 mb-6">
              <p className="text-green-400">✅ {successMessage}</p>
            </div>
          )}

          {/* Test Interface */}
          {testStarted && questions.length > 0 && !testCompleted && (
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-gray-700">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                  <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Question */}
              <div className="mb-6 bg">
                <div className="flex items-center gap-2 mb-4">
                  <span 
                    className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium cursor-pointer hover:bg-blue-700 transition-colors"
                    title={`Main Category: ${currentQuestion.main_category}`}
                    onClick={() => handleCategoryClick('Main Category', currentQuestion.main_category)}
                  >
                    {currentQuestion.main_category}
                  </span>
                  <span 
                    className="bg-gray-600 text-gray-300 px-2 py-1 rounded text-sm cursor-pointer hover:bg-gray-500 transition-colors"
                    title={`Sub Category: ${currentQuestion.sub_category}`}
                    onClick={() => handleSubCategoryClick(currentQuestion.sub_category)}
                  >
                    {currentQuestion.sub_category}
                  </span>
                </div>
                
                <h3 className="text-lg font-medium text-white mb-4">
                  {currentQuestion.question_text}
                </h3>

                {/* Category badges for multiple choice questions */}
                {testMode === 'multiple-choice' && (
                  <div className="flex items-center gap-2 mb-4">
                    {currentQuestion.main_category && (
                      <span 
                        className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium cursor-pointer hover:bg-blue-700 transition-colors"
                        title={`Main Category: ${currentQuestion.main_category}`}
                        onClick={() => handleCategoryClick('Main Category', currentQuestion.main_category)}
                      >
                        {currentQuestion.main_category}
                      </span>
                    )}
                    {currentQuestion.sub_category && (
                      <span 
                        className="bg-gray-600 text-gray-300 px-2 py-1 rounded text-sm cursor-pointer hover:bg-gray-500 transition-colors"
                        title={`Sub Category: ${currentQuestion.sub_category}`}
                        onClick={() => handleSubCategoryClick(currentQuestion.sub_category)}
                      >
                        {currentQuestion.sub_category}
                      </span>
                    )}
                  </div>
                )}

                {/* Answer Input */}
                {testMode === 'free-text' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Your Answer
                    </label>
                    <textarea
                      value={answers[`${currentQuestion.knowledge_id}_${currentQuestionIndex}`] || ''}
                      onChange={(e) => handleAnswerChange(`${currentQuestion.knowledge_id}_${currentQuestionIndex}`, e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full h-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Select the best answer:
                    </label>
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleMultipleChoiceAnswer(`${currentQuestion.question_id}_${currentQuestionIndex}`, index)}
                          className={`w-full text-left p-3 rounded-lg border transition-all ${
                            answers[`${currentQuestion.question_id}_${currentQuestionIndex}`] === index
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={prevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-all"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                {currentQuestionIndex === questions.length - 1 ? (
                  <button
                    onClick={submitAnswers}
                    disabled={isEvaluating}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white rounded-lg transition-all"
                  >
                    {isEvaluating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Evaluating...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        Submit Test
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={nextQuestion}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Results */}
          {testCompleted && evaluations.length > 0 && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">Test Results</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Total Questions</p>
                    <p className="text-white text-2xl font-bold">{evaluations.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Average Score</p>
                    <p className="text-white text-2xl font-bold">
                      {testMode === 'free-text' 
                        ? `${((evaluations.reduce((sum, evaluation) => sum + (evaluation.score || 0), 0) / evaluations.length) * 20).toFixed(1)}%`
                        : `${((evaluations.reduce((sum, evaluation) => sum + (evaluation.is_correct ? 1 : 0), 0) / evaluations.length) * 100).toFixed(1)}%`
                      }
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">
                      {testMode === 'free-text' ? 'Strong Answers' : 'Correct Answers'}
                    </p>
                    <p className="text-white text-2xl font-bold">
                      {testMode === 'free-text'
                        ? evaluations.filter(evaluation => (evaluation.score || 0) >= 4).length
                        : evaluations.filter(evaluation => evaluation.is_correct).length
                      }
                    </p>
                  </div>
                </div>

                <button
                  onClick={resetTest}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
                >
                  <RefreshCw size={16} />
                  Take Another Test
                </button>
              </div>

              {/* Detailed Results */}
              <div className="space-y-4">
                {evaluations.map((evaluation, index) => (
                  <div key={index} className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-gray-700">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        {testMode === 'free-text' ? (
                          <>
                            <h3 className="text-lg font-medium text-white mb-2">
                              Question {index + 1}
                            </h3>
                            <p className="text-gray-300 mb-3">{evaluation.question_text}</p>
                            <div className="mb-3">
                              <p className="text-sm text-gray-400 mb-1">Your Answer:</p>
                              <p className="text-gray-300 bg-gray-700 p-3 rounded">{evaluation.answer}</p>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-white mb-2">
                                Question {index + 1}
                              </h3>
                              <p className="text-gray-300">{evaluation.question_text}</p>
                            </div>
                            <div className="ml-4 text-right">
                              <div className={`text-2xl font-bold ${getScoreColor(evaluation.score, testMode, evaluation.is_correct)} flex items-center gap-2`}>
                                {evaluation.is_correct ? (
                                  <>
                                    <CheckCircle size={20} className="text-green-500" />
                                    Correct
                                  </>
                                ) : (
                                  <>
                                    <XCircle size={20} className="text-red-500" />
                                    Incorrect
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {testMode === 'multiple-choice' && evaluation.options && (
                          <div className="mb-3">
                            <p className="text-sm text-gray-400 mb-2">Your Selection:</p>
                            <div className="space-y-1">
                              {evaluation.options.map((option, optIndex) => (
                                <div
                                  key={optIndex}
                                  className={`p-2 rounded ${
                                    optIndex === evaluation.selected_index
                                      ? evaluation.is_correct
                                        ? 'bg-green-600/20 border border-green-500 text-green-300'
                                        : 'bg-red-600/20 border border-red-500 text-red-300'
                                      : optIndex === evaluation.correct_answer_index
                                      ? 'bg-green-600/20 border border-green-500 text-green-300'
                                      : 'bg-gray-700 text-gray-300'
                                  }`}
                                >
                                  <span className="font-medium mr-2">{String.fromCharCode(65 + optIndex)}.</span>
                                  {option}
                                  {optIndex === evaluation.correct_answer_index && (
                                    <span className="ml-2 text-green-400">✓ Correct</span>
                                  )}
                                  {optIndex === evaluation.selected_index && !evaluation.is_correct && (
                                    <span className="ml-2 text-red-400">✗ Your Answer</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {testMode === 'free-text' && (
                        <div className="ml-4 text-right">
                          <div className={`text-2xl font-bold ${getScoreColor(evaluation.score, testMode, evaluation.is_correct)}`}>
                            {evaluation.score ? `${(evaluation.score * 20).toFixed(0)}%` : 'N/A'}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-sm text-gray-400">
                              Score: {evaluation.score || 'N/A'}/5
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Feedback */}
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Feedback</h4>
                      <p className="text-gray-300 text-sm">{evaluation.feedback}</p>
                    </div>

                    {/* Mastery Update */}
                    {evaluation.mastery !== undefined && evaluation.mastery !== null && (
                      <div className="mt-4 p-3 bg-gray-700/30 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-400">Mastery Level</p>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${getMasteryLevel(evaluation.mastery).color}`}>
                                {getMasteryLevel(evaluation.mastery).level}
                              </span>
                              <span className="text-sm text-gray-400">
                                ({evaluation.mastery !== null && evaluation.mastery !== undefined ? `${(evaluation.mastery * 100).toFixed(1)}%` : 'N/A'})
                              </span>
                            </div>
                          </div>
                          <Lightbulb size={16} className="text-yellow-400" />
                        </div>
                        {evaluation.mastery_explanation && (
                          <p className="text-xs text-gray-400 mt-1">{evaluation.mastery_explanation}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
