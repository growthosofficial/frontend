'use client';

import { useState, useEffect } from 'react';
import { processText } from '../../lib/api';
import { knowledgeAPI } from '../../lib/supabase';
import SidebarNavigation from '../../components/SidebarNavigation';

export default function CurateKnowledgePage() {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [similarMainCategory, setSimilarMainCategory] = useState(null);
  const [similarSubCategory, setSimilarSubCategory] = useState(null);
  const [similarityScore, setSimilarityScore] = useState(null);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [inputMode, setInputMode] = useState('text'); // Default to text mode
  const [similarityThreshold, setSimilarityThreshold] = useState(0.8);
  const [isApplying, setIsApplying] = useState(false);

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
        const subCat = item.sub_category || item.category || 'unknown'; // Fallback for old schema
        
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
        const subCat = item.sub_category || item.category || 'unknown';
        
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

    try {
      console.log('🚀 Processing text with backend...');
      
      // Call backend for AI processing and recommendations
      const result = await processText(inputText, similarityThreshold);
      console.log('✅ Backend response:', result);
      
      // Handle the response structure
      if (result.status === 'success' && result.recommendations) {
        setRecommendations(result.recommendations);
        setSimilarMainCategory(result.similar_main_category);
        setSimilarSubCategory(result.similar_sub_category);
        setSimilarityScore(result.similarity_score);
        
        console.log(`📊 Found ${result.recommendations.length} recommendations`);
        if (result.similar_main_category) {
          console.log(`🔍 Similar content found: ${result.similar_main_category} → ${result.similar_sub_category}`);
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
      console.log('📝 Content length:', recommendation.updated_text?.length || 0);
      console.log('🏷️ Tags:', recommendation.tags);

      // Validate recommendation data
      if (!recommendation.main_category || !recommendation.sub_category) {
        throw new Error('Recommendation missing required category information');
      }

      if (!recommendation.updated_text) {
        throw new Error('Recommendation missing content');
      }

      // Ensure tags is an array
      let tags = [];
      if (recommendation.tags && Array.isArray(recommendation.tags)) {
        tags = recommendation.tags;
      } else if (recommendation.tags) {
        tags = [recommendation.tags]; // Convert single tag to array
      } else {
        tags = ['knowledge']; // Default fallback
      }

      // Create knowledge item using new schema
      const knowledgeItem = {
        main_category: recommendation.main_category,
        sub_category: recommendation.sub_category,
        content: recommendation.updated_text,
        tags: tags,
        source: 'text', // Default source
      };

      console.log('⚡ Creating knowledge item with new schema...');
      console.log('📋 Knowledge item:', knowledgeItem);

      const result = await knowledgeAPI.create(knowledgeItem);

      console.log('✅ Knowledge item created successfully:', result);

      setSuccessMessage(
        `✅ Successfully created: ${recommendation.main_category} → ${recommendation.sub_category}`
      );

      // Refresh categories and stats
      await loadCategories();
      await loadStats();

      // Clear recommendations after successful application
      setRecommendations(null);
      setSimilarMainCategory(null);
      setSimilarSubCategory(null);
      setSimilarityScore(null);
      setInputText('');

      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);

    } catch (error) {
      console.error('❌ Application failed:', error);
      setError(`Failed to apply recommendation: ${error.message}`);
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
    setInputText('');
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

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-600 via-navy-600 to-white">
      {/* Sidebar Navigation */}
      <SidebarNavigation currentPage="curate" stats={stats} />

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Curate Knowledge</h1>
            <p className="text-blue-100">Process and organize your knowledge with AI assistance</p>
          </div>

          {/* Input Mode Toggle */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setInputMode('upload')}
              className={`px-4 py-2 rounded text-sm transition-colors ${
                inputMode === 'upload'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              📄 Upload File
            </button>
            <button
              onClick={() => setInputMode('text')}
              className={`px-4 py-2 rounded text-sm transition-colors ${
                inputMode === 'text'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              ✏️ Enter Text
            </button>
          </div>

          {/* Upload Area or Text Input */}
          {inputMode === 'upload' ? (
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 mb-6 border-2 border-dashed border-white/30 text-center">
              <div className="text-white/70 mb-4">
                <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="text-lg font-medium text-white mb-2">Drop files here or click to upload</div>
              <div className="text-sm text-white/70">Supports: .txt, .md, .pdf, .docx</div>
              <div className="mt-4 text-sm text-yellow-200">📝 File upload coming soon - use text input for now</div>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-6">
              <label className="block text-sm font-medium text-white mb-3">
                💭 What did you learn today?
              </label>
              <textarea
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share insights, discoveries, or any knowledge you want to organize..."
                className="w-full h-40 px-4 py-3 bg-white/90 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none resize-none transition-all text-gray-800 placeholder-gray-500"
                disabled={isProcessing}
              />

              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-white/70">{inputText.length} characters</div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-white/70">Similarity threshold:</label>
                    <input
                      type="range"
                      min="0.5"
                      max="1.0"
                      step="0.1"
                      value={similarityThreshold}
                      onChange={e => setSimilarityThreshold(parseFloat(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-sm text-white/70">{(similarityThreshold * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <button
                  onClick={handleProcessText}
                  disabled={!inputText.trim() || isProcessing}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 shadow-md"
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
            <div className="bg-red-500/90 backdrop-blur-md text-white p-4 rounded-lg mb-6 border border-red-400">
              <div className="flex items-center gap-2">
                <span>❌</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-500/90 backdrop-blur-md text-white p-4 rounded-lg mb-6 border border-green-400">
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>{successMessage}</span>
              </div>
            </div>
          )}

          {/* Recommendations Card */}
          {recommendations && (
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-6 border border-white/20">
              <div className="border-l-4 border-blue-400 pl-4 mb-6">
                <h2 className="text-xl font-semibold text-white mb-2">AI Analysis & Recommendations</h2>
                <p className="text-blue-100 text-sm">Your knowledge has been analyzed. Choose how to proceed:</p>
              </div>

              {/* Context Section */}
              <div className="mb-6 bg-white/5 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-200 mb-3 flex items-center gap-2">
                  📊 INPUT CONTEXT:
                </h3>
                <div className="text-white/90 text-sm leading-relaxed max-h-32 overflow-y-auto">
                  {inputText}
                </div>
              </div>

              {/* Similar Category Info */}
              {similarMainCategory && (
                <div className="mb-6 p-4 bg-blue-500/20 rounded-lg border border-blue-400/30">
                  <h3 className="text-sm font-semibold text-blue-200 mb-2">
                    🔍 Similar Content Detected:
                  </h3>
                  <div className="text-blue-100 text-sm">
                    <div className="mb-1">
                      <span className="font-medium">Category:</span> {similarMainCategory}
                      {similarSubCategory && <> → {similarSubCategory}</>}
                    </div>
                    {similarityScore !== null && (
                      <div>
                        <span className="font-medium">Similarity:</span> {(similarityScore * 100).toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* AI Recommendations */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-blue-200 mb-4 flex items-center gap-2">
                  💡 AI RECOMMENDATIONS:
                </h3>
                <div className="space-y-4">
                  {recommendations.map(rec => (
                    <div
                      key={rec.option_number}
                      className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          {/* Option Header */}
                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold">
                                Option {rec.option_number}
                              </span>
                              <span className="text-white/70 text-xs">
                                {rec.change}
                              </span>
                            </div>
                            <div className="text-white font-medium">
                              {rec.main_category} → {rec.sub_category}
                            </div>
                          </div>

                          {/* Content Preview */}
                          <div className="mb-3">
                            <div className="bg-white/10 rounded p-3 text-sm text-white/80 max-h-24 overflow-y-auto">
                              {rec.preview || rec.updated_text?.substring(0, 200) + '...' || 'No preview available'}
                            </div>
                          </div>

                          {/* Tags */}
                          {rec.tags && rec.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {rec.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="bg-blue-400/20 text-blue-200 px-2 py-1 rounded text-xs border border-blue-400/30"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Apply Button */}
                        <button
                          onClick={() => handleApplyRecommendation(rec)}
                          disabled={isApplying || isProcessing}
                          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
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
              <div className="flex gap-4 pt-4 border-t border-white/20">
                <button
                  onClick={handleDoNothing}
                  disabled={isApplying || isProcessing}
                  className="px-6 py-2 bg-white/10 text-white rounded hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-white/30"
                >
                  🗑️ Discard Input
                </button>
              </div>
            </div>
          )}

          {/* Bottom Stats */}
          {stats && (
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{stats.total_knowledge_items}</div>
                  <div className="text-xs text-white/70">Total Items</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.unique_main_categories}</div>
                  <div className="text-xs text-white/70">Main Categories</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.unique_sub_categories}</div>
                  <div className="text-xs text-white/70">Sub Categories</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.unique_tags}</div>
                  <div className="text-xs text-white/70">Unique Tags</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}