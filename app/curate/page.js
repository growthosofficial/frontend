'use client';

import { useState, useEffect, useRef } from 'react';
import { processText } from '../../lib/api';
import { knowledgeAPI } from '../../lib/supabase';
import SidebarNavigation from '../../components/SidebarNavigation';

export default function CurateKnowledgePage() {
  const [inputText, setInputText] = useState('');
  const [goal, setGoal] = useState(''); // New goal state
  const [isProcessing, setIsProcessing] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [similarMainCategory, setSimilarMainCategory] = useState(null);
  const [similarSubCategory, setSimilarSubCategory] = useState(null);
  const [similarityScore, setSimilarityScore] = useState(null);
  const [goalSummary, setGoalSummary] = useState(null); // New goal summary state
  const [goalRelevanceScore, setGoalRelevanceScore] = useState(null); // New goal relevance score state
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [inputMode, setInputMode] = useState('text'); // Default to text mode
  const [similarityThreshold, setSimilarityThreshold] = useState(0.8);
  const [isApplying, setIsApplying] = useState(false);
  const [showGoalDropdown, setShowGoalDropdown] = useState(false);
  const goalInputRef = useRef(null);
  const placeholderGoals = [
    'Learn machine learning for building recommendation systems',
    'Master React for frontend development'
  ];
  const fileInputRef = useRef(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState('');

  // Load categories and stats on component mount
  useEffect(() => {
    loadCategories();
    loadStats();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await knowledgeAPI.getAll();
      
      // Group by main_category and sub_category
      const categoryMap = new Map();
      
      data.forEach(item => {
        const mainCat = item.main_category || 'General Studies';
        const subCat = item.sub_category || 'unknown';
        
        if (!categoryMap.has(mainCat)) {
          categoryMap.set(mainCat, new Set());
        }
        categoryMap.get(mainCat).add(subCat);
      });
      
      // Convert to array format for display
      const categoriesArray = Array.from(categoryMap.entries()).map(([mainCat, subCats]) => ({
        main_category: mainCat,
        sub_categories: Array.from(subCats),
        total_items: data.filter(item => 
          (item.main_category || 'General Studies') === mainCat
        ).length
      }));
      
      setCategories(categoriesArray);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadStats = async () => {
    try {
      const data = await knowledgeAPI.getAll();
      const uniqueTags = new Set();
      const uniqueMainCategories = new Set();
      const uniqueSubCategories = new Set();
      
      data.forEach(item => {
        // Handle tags
        if (item.tags && Array.isArray(item.tags)) {
          item.tags.forEach(tag => uniqueTags.add(tag));
        }
        
        // Handle categories with new schema
        const mainCat = item.main_category || 'General Studies';
        const subCat = item.sub_category || 'unknown';
        
        uniqueMainCategories.add(mainCat);
        uniqueSubCategories.add(subCat);
      });

      setStats({
        total_knowledge_items: data.length,
        unique_tags: uniqueTags.size,
        unique_main_categories: uniqueMainCategories.size,
        unique_sub_categories: uniqueSubCategories.size,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleProcessText = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to process');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccessMessage('');
    setRecommendations(null);
    setGoalSummary(null);
    setGoalRelevanceScore(null);

    try {
      console.log('🚀 Starting parallel processing...');
      console.log('🎯 Goal provided:', !!goal);
      
      // 🚀 RUN BOTH APIs IN TRUE PARALLEL
      const [backendResult, previewResult] = await Promise.all([
        // Backend processing
        processText(inputText, similarityThreshold, goal.trim() || null)
          .catch(error => {
            console.error('❌ Backend processing failed:', error);
            throw new Error(`Backend processing failed: ${error.message}`);
          }),
        
        // Preview generation
        fetch('/api/generate-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input_text: inputText }),
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Preview API returned ${response.status}`);
          }
          return response.json();
        })
        .catch(error => {
          console.error('❌ Preview generation failed:', error);
          // Don't throw here, just return a fallback preview
          return { preview: 'Preview generation failed - processing continues...' };
        })
      ]);
      
      console.log('✅ Backend response:', backendResult);
      console.log('✅ Preview result:', previewResult);
      
      // Handle the backend response structure
      if (backendResult.status === 'success' && backendResult.recommendations) {
        // Map the new response structure to what the frontend expects
        const mappedRecommendations = backendResult.recommendations.map(rec => ({
          ...rec,
          // Add computed fields that the frontend expects
          updated_text: rec.instructions || '',
          preview: previewResult.preview || 'No preview available',
          is_goal_aware: backendResult.goal_provided && backendResult.goal_relevance_score !== null,
          relevance_score: backendResult.goal_relevance_score,
          goal_alignment: backendResult.goal_relevance_explanation,
          goal_priority: rec.goal_priority || 'medium',
          // Ensure all required fields are present
          option_number: rec.option_number || 0,
          change: rec.change || '',
          instructions: rec.instructions || '',
          main_category: rec.main_category || 'General Studies',
          sub_category: rec.sub_category || 'General',
          tags: rec.tags || [],
          action_type: rec.action_type || 'create_new'
        }));
        
        setRecommendations(mappedRecommendations);
        setSimilarMainCategory(backendResult.similar_main_category);
        setSimilarSubCategory(backendResult.similar_sub_category);
        setSimilarityScore(backendResult.similarity_score);
        setGoalSummary(backendResult.goal_relevance_explanation);
        setGoalRelevanceScore(backendResult.goal_relevance_score);
        
        console.log(`📊 Found ${backendResult.recommendations.length} recommendations with previews`);
        
        // Log goal-aware recommendations
        const goalAwareCount = backendResult.goal_provided ? backendResult.recommendations.length : 0;
        console.log(`🎯 Goal-aware recommendations: ${goalAwareCount}/${backendResult.recommendations.length}`);
        
        if (backendResult.similar_main_category) {
          console.log(`🔍 Similar content found: ${backendResult.similar_main_category} → ${backendResult.similar_sub_category} (${(backendResult.similarity_score * 100).toFixed(1)}% similarity)`);
        }
      } else {
        throw new Error('Invalid response format from backend');
      }
    } catch (error) {
      console.error('❌ Processing failed:', error);
      setError(`Processing failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyRecommendation = async recommendation => {
    setIsApplying(true);
    setError(null);

    try {
      console.log('🚀 Applying recommendation:', recommendation);
      console.log(`📂 Category: ${recommendation.main_category} → ${recommendation.sub_category}`);
      console.log('📝 Instructions length:', recommendation.instructions?.length || 0);
      console.log('🏷️ Tags:', recommendation.tags);

      // Validate recommendation data
      if (!recommendation.main_category || !recommendation.sub_category) {
        throw new Error('Recommendation missing required category information');
      }

      if (!recommendation.instructions) {
        throw new Error('Recommendation missing instructions');
      }

      // Call Phase 2 LLM processing
      console.log('🔄 Calling Phase 2 LLM processing...');
      const phase2Response = await fetch('/api/knowledge-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action_type: recommendation.action_type,
          input_text: inputText,
          instructions: recommendation.instructions,
          similar_knowledge: similarMainCategory ? `${similarMainCategory} → ${similarSubCategory}` : null,
          main_category: recommendation.main_category,
          sub_category: recommendation.sub_category,
          tags: recommendation.tags || []
        }),
      });

      if (!phase2Response.ok) {
        const errorData = await phase2Response.json();
        throw new Error(errorData.error || `Phase 2 processing failed: ${phase2Response.status}`);
      }

      const phase2Result = await phase2Response.json();
      console.log('✅ Phase 2 processing completed:', phase2Result);

      // Ensure tags is an array
      let tags = [];
      if (recommendation.tags && Array.isArray(recommendation.tags)) {
        tags = recommendation.tags;
      } else if (recommendation.tags) {
        tags = [recommendation.tags];
      } else {
        tags = ['knowledge'];
      }

      // Create knowledge item using the processed text and embedding from Phase 2
      const knowledgeItem = {
        main_category: recommendation.main_category,
        sub_category: recommendation.sub_category,
        content: phase2Result.processed_text,
        tags: tags,
        source: 'text',
        embedding: phase2Result.embedding,
        // Add goal-related metadata if available
        metadata: {
          action_type: recommendation.action_type,
          instructions: recommendation.instructions,
          change_description: recommendation.change,
          phase2_processed: true,
          ...(goal && {
            goal_aware: true,
            relevance_score: recommendation.relevance_score,
            goal_alignment: recommendation.goal_alignment,
            original_goal: goal
          })
        }
      };

      console.log('⚡ Processing knowledge item (create or update)...');
      console.log('📋 Knowledge item:', knowledgeItem);

      // Call the enhanced create method (handles both create and update)
      const result = await knowledgeAPI.create(knowledgeItem);

      console.log('✅ Knowledge item processed successfully:', result);

      // Show appropriate success message based on operation
      const operation = result.operation || 'processed';
      let successMessage;
      
      switch (operation) {
        case 'created':
          successMessage = `✨ Successfully created: ${recommendation.main_category} → ${recommendation.sub_category}`;
          break;
        case 'updated':
          successMessage = `🔄 Successfully updated: ${recommendation.main_category} → ${recommendation.sub_category}`;
          break;
        default:
          successMessage = `✅ Successfully processed: ${recommendation.main_category} → ${recommendation.sub_category}`;
      }
      
      // Add goal relevance info to success message if available
      if (goal && recommendation.relevance_score) {
        successMessage += ` (Goal relevance: ${recommendation.relevance_score}/10)`;
      }
      
      setSuccessMessage(successMessage);

      // Show additional info if there was similar content
      if (similarMainCategory && similarityScore >= similarityThreshold) {
        const similarityPercent = (similarityScore * 100).toFixed(1);
        setTimeout(() => {
          setSuccessMessage(prev => 
            prev + ` (${similarityPercent}% similarity detected - content was merged/updated)`
          );
        }, 1000);
      }

      // Refresh categories and stats
      await loadCategories();
      await loadStats();

      // Clear recommendations after successful application
      setRecommendations(null);
      setSimilarMainCategory(null);
      setSimilarSubCategory(null);
      setSimilarityScore(null);
      setGoalSummary(null);
      setGoalRelevanceScore(null); // Clear goal relevance score
      setInputText('');
      setGoal(''); // Clear goal too

      // Auto-clear success message after 7 seconds (longer to read the detailed message)
      setTimeout(() => {
        setSuccessMessage('');
      }, 7000);

    } catch (error) {
      console.error('❌ Application failed:', error);
      
      // Enhanced error handling
      if (error.message.includes('duplicate key')) {
        setError('This category already exists. Please try a different sub-category name.');
      } else if (error.message.includes('unique constraint')) {
        setError('A knowledge item with this category already exists. The system should have updated it - please try again.');
      } else {
        setError(`Failed to apply recommendation: ${error.message}`);
      }
    } finally {
      setIsApplying(false);
    }
  };
  
  const handleDoNothing = () => {
    // Clear everything and return to input state
    setRecommendations(null);
    setSimilarMainCategory(null);
    setSimilarSubCategory(null);
    setSimilarityScore(null);
    setGoalSummary(null); // Clear goal summary
    setGoalRelevanceScore(null); // Clear goal relevance score
    setInputText('');
    setGoal(''); // Clear goal
    setError(null);
    setSuccessMessage('📝 Input discarded. Ready for new knowledge.');

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter' && !e.shiftKey && !isProcessing) {
      e.preventDefault();
      handleProcessText();
    }
  };

  // Helper function to get similarity level description
  const getSimilarityLevel = (score) => {
    if (score >= 0.9) return { label: 'Very High', color: 'text-red-600 bg-red-100' };
    if (score >= 0.8) return { label: 'High', color: 'text-orange-600 bg-orange-100' };
    if (score >= 0.7) return { label: 'Medium', color: 'text-yellow-600 bg-yellow-100' };
    if (score >= 0.6) return { label: 'Low', color: 'text-blue-600 bg-blue-100' };
    return { label: 'Very Low', color: 'text-gray-600 bg-gray-100' };
  };

  // File upload handler
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await uploadAndParseFile(file);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFileError('');
    const file = e.dataTransfer.files[0];
    if (!file) return;
    await uploadAndParseFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const uploadAndParseFile = async (file) => {
    setFileLoading(true);
    setFileError('');
    try {
      const allowed = ['text/plain', 'text/markdown'];
      const allowedExt = ['txt', 'md'];
      const ext = file.name.split('.').pop().toLowerCase();
      if (!allowed.includes(file.type) && !allowedExt.includes(ext)) {
        if (ext === 'pdf' || ext === 'docx') {
          setFileError('PDF and DOCX support will be implemented in the future. Please upload a .txt or .md file.');
        } else {
          setFileError('Unsupported file type. Please upload a .txt or .md file.');
        }
        setFileLoading(false);
        return;
      }
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/parse-file', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setFileError(data.error || 'Failed to parse file.');
      } else {
        setInputText(data.text || '');
      }
    } catch (err) {
      setFileError('Failed to upload or parse file.');
    } finally {
      setFileLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-white via-lime-50 to-green-100">
      {/* Sidebar Navigation */}
      <SidebarNavigation currentPage="curate" stats={stats} />

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Curate Knowledge</h1>
            <p className="text-gray-700">Process and organize your knowledge with AI assistance</p>
          </div>

          {/* Input Mode Toggle */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setInputMode('upload')}
              className={`px-4 py-2 rounded text-sm transition-colors ${
                inputMode === 'upload'
                  ? 'bg-lime-600 text-white shadow-md'
                  : 'bg-white text-lime-700 hover:bg-lime-50 border border-lime-200'
              }`}
            >
              📄 Upload File
            </button>
            <button
              onClick={() => setInputMode('text')}
              className={`px-4 py-2 rounded text-sm transition-colors ${
                inputMode === 'text'
                  ? 'bg-lime-600 text-white shadow-md'
                  : 'bg-white text-lime-700 hover:bg-lime-50 border border-lime-200'
              }`}
            >
              ✏️ Enter Text
            </button>
          </div>

          {/* Goal Input Section */}
          {inputMode === 'text' && (
            <div className="bg-white rounded-lg p-6 mb-4 border border-lime-100 shadow-sm">
              <label className="block text-sm font-medium text-gray-900 mb-3">
                🎯 Learning Goal (Optional)
              </label>
              <div className="flex items-center gap-2 relative">
                <input
                  ref={goalInputRef}
                  type="text"
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                  placeholder="Type your learning goal or select from the list..."
                  className="flex-1 px-4 py-2 bg-white border border-lime-200 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400"
                  disabled={isProcessing}
                  maxLength={120}
                />
                <button
                  type="button"
                  className="px-3 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors text-sm font-medium shadow"
                  onClick={() => setShowGoalDropdown(v => !v)}
                  tabIndex={-1}
                >
                  ▼
                </button>
                {showGoalDropdown && (
                  <div className="absolute right-0 top-12 z-10 bg-white border border-lime-200 rounded-lg shadow-lg w-80 min-w-max">
                    {placeholderGoals.map((g, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="block w-full text-left px-4 py-2 hover:bg-lime-50 text-gray-900 text-sm"
                        onClick={() => {
                          setGoal(g);
                          setShowGoalDropdown(false);
                          if (goalInputRef.current) goalInputRef.current.focus();
                        }}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-gray-600">
                  Providing a goal helps AI prioritize and assess relevance of knowledge
                </p>
                <span className="text-xs text-gray-500">{goal.length}/120</span>
              </div>
            </div>
          )}

          {/* Upload Area or Text Input */}
          {inputMode === 'upload' ? (
            <div
              className={`bg-white rounded-lg p-8 mb-6 border-2 border-dashed border-lime-200 text-center shadow-sm transition-colors ${fileLoading ? 'opacity-60' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              style={{ cursor: fileLoading ? 'not-allowed' : 'pointer' }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md"
                className="hidden"
                onChange={handleFileChange}
                disabled={fileLoading}
              />
              <div className="text-lime-500 mb-4">
                <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="text-lg font-medium text-gray-900 mb-2">Drop files here or click to upload</div>
              <div className="text-sm text-gray-600">Supports: .txt, .md</div>
              {fileLoading && <div className="mt-4 text-lime-600">Parsing file...</div>}
              {fileError && <div className="mt-4 text-red-600">{fileError}</div>}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-6 mb-6 border border-lime-100 shadow-sm">
              <label className="block text-sm font-medium text-gray-900 mb-3">
                💭 What did you learn today?
              </label>
              <textarea
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share insights, discoveries, or any knowledge you want to organize..."
                className="w-full h-40 px-4 py-3 bg-white border border-lime-200 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent outline-none resize-none transition-all text-gray-900 placeholder-gray-400"
                disabled={isProcessing}
              />

              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">{inputText.length} characters</div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Similarity threshold:</label>
                    <input
                      type="range"
                      min="0.5"
                      max="1.0"
                      step="0.1"
                      value={similarityThreshold}
                      onChange={e => setSimilarityThreshold(parseFloat(e.target.value))}
                      className="w-20 accent-lime-600"
                    />
                    <span className="text-sm text-gray-600">{(similarityThreshold * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <button
                  onClick={handleProcessText}
                  disabled={!inputText.trim() || isProcessing}
                  className="px-6 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 shadow-md"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      <span>Process Knowledge</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6 border border-red-200">
              <div className="flex items-center gap-2">
                <span>❌</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-6 border border-green-200">
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>{successMessage}</span>
              </div>
            </div>
          )}

          {/* Goal Relevance Analysis */}
          {goal && goalSummary && (
            <div className="bg-lime-50 rounded-lg p-4 mb-6 border border-lime-200">
              <div className="flex items-center gap-2 mb-3">
                <span>🎯</span>
                <h3 className="font-medium text-lime-900">Goal Relevance Analysis</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-lime-800 text-sm font-medium">Relevance Score:</span>
                  <span className="px-3 py-1 bg-lime-100 text-lime-800 rounded-full text-sm font-semibold">
                    {goalRelevanceScore || 'N/A'}/10
                  </span>
                  {/* Priority badge */}
                  {goalRelevanceScore && (
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      goalRelevanceScore >= 7 ? 'bg-red-100 text-red-800' :
                      goalRelevanceScore >= 4 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {goalRelevanceScore >= 7 ? 'HIGH' : goalRelevanceScore >= 4 ? 'MEDIUM' : 'LOW'} PRIORITY
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-lime-800 text-sm font-medium block mb-1">Analysis:</span>
                  <p className="text-lime-800 text-sm leading-relaxed">{goalSummary}</p>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations Card */}
          {recommendations && (
            <div className="bg-white rounded-lg p-6 mb-6 border border-lime-100 shadow-sm">
              <div className="border-l-4 border-lime-400 pl-4 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">AI Analysis & Recommendations</h2>
                <p className="text-gray-700 text-sm">Your knowledge has been analyzed. Choose how to proceed:</p>
              </div>

              {/* Context Section */}
              <div className="mb-6 bg-lime-50 rounded-lg p-4 border border-lime-100">
                <h3 className="text-sm font-semibold text-lime-700 mb-3 flex items-center gap-2">
                  📊 INPUT CONTEXT:
                </h3>
                <div className="text-gray-900 text-sm leading-relaxed max-h-32 overflow-y-auto">
                  {inputText}
                </div>
              </div>

              {/* Enhanced Similar Category Info */}
              {similarMainCategory && (
                <div className="mb-6 p-4 bg-lime-50 rounded-lg border border-lime-200">
                  <h3 className="text-sm font-semibold text-lime-800 mb-3 flex items-center gap-2">
                    🔍 SIMILAR CONTENT DETECTED:
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-lime-700 text-sm">
                        <div className="mb-1">
                          <span className="font-medium">Category:</span> 
                          <span className="ml-2 bg-lime-100 px-2 py-1 rounded text-xs text-lime-800">
                            {similarMainCategory}
                          </span>
                          {similarSubCategory && (
                            <>
                              <span className="mx-2">→</span>
                              <span className="bg-green-100 px-2 py-1 rounded text-xs text-green-800">
                                {similarSubCategory}
                              </span>
                            </>
                          )}
                        </div>
                        {similarityScore !== null && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Similarity:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSimilarityLevel(similarityScore).color}`}>
                              {(similarityScore * 100).toFixed(1)}% - {getSimilarityLevel(similarityScore).label}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Similarity Warning */}
                    {similarityScore >= 0.8 && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-800">
                          <span>⚠️</span>
                          <span className="text-sm font-medium">
                            High similarity detected! Consider if this is truly new knowledge or if you should update existing content.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* AI Recommendations */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-lime-700 mb-4 flex items-center gap-2">
                  💡 AI RECOMMENDATIONS:
                </h3>
                <div className="space-y-4">
                  {recommendations.map(rec => (
                    <div
                      key={rec.option_number}
                      className="bg-lime-50 border border-lime-100 rounded-lg p-4 hover:bg-lime-100 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          {/* Option Header */}
                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-1 rounded text-xs font-semibold bg-lime-600 text-white`}>
                                Option {rec.option_number}
                              </span>
                              {/* Goal-oriented badge for options 1 and 2 */}
                              {rec.is_goal_aware && (rec.option_number === 1 || rec.option_number === 2) && (
                                <span className="text-xs px-2 py-1 rounded bg-gradient-to-r from-yellow-400/30 to-orange-500/30 text-yellow-800 border border-yellow-400/30">
                                  GOAL-ORIENTED
                                </span>
                              )}
                              <span className={`text-xs px-2 py-1 rounded bg-green-100 text-green-800`}>
                                {rec.action_type?.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            <div className="text-gray-900 font-medium">
                              {rec.main_category} → {rec.sub_category}
                            </div>
                            <div className="text-gray-600 text-sm mt-1">
                              {rec.change}
                            </div>
                          </div>

                          {/* Content Preview */}
                          <div className="mb-3">
                            <div className="bg-white rounded p-3 text-sm text-gray-900 max-h-24 overflow-y-auto">
                              {rec.preview ? (
                                rec.preview
                              ) : (
                                <div className="flex items-center gap-2 text-gray-500">
                                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-gray-300 border-t-gray-600"></div>
                                  <span>Generating preview...</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Tags - Simplified Display */}
                          {rec.tags && rec.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {rec.tags.slice(0, 3).map((tag, index) => ( // Only show first 3 tags
                                <span
                                  key={index}
                                  className="bg-lime-100 text-lime-800 px-2 py-1 rounded text-xs border border-lime-200"
                                >
                                  {tag}
                                </span>
                              ))}
                              {rec.tags.length > 3 && (
                                <span className="text-lime-600 text-xs px-2 py-1">
                                  +{rec.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Apply Button */}
                        <button
                          onClick={() => handleApplyRecommendation(rec)}
                          disabled={isApplying || isProcessing}
                          className="bg-lime-600 hover:bg-lime-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                        >
                          {isApplying ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                              <span>Applying...</span>
                            </>
                          ) : (
                            <>
                              <span>✓</span>
                              <span>Apply</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-lime-100">
                <button
                  onClick={handleDoNothing}
                  disabled={isApplying || isProcessing}
                  className="px-6 py-2 bg-white text-lime-700 rounded hover:bg-lime-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-lime-200"
                >
                  🗑️ Discard Input
                </button>
              </div>
            </div>
          )}

          {/* Bottom Stats */}
          {stats && (
            <div className="bg-white rounded-lg p-4 border border-lime-100 shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.total_knowledge_items}</div>
                  <div className="text-xs text-gray-600">Total Items</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.unique_main_categories}</div>
                  <div className="text-xs text-gray-600">Main Categories</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.unique_sub_categories}</div>
                  <div className="text-xs text-gray-600">Sub Categories</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.unique_tags}</div>
                  <div className="text-xs text-gray-600">Unique Tags</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}