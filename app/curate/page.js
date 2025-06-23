'use client';

import { useState, useEffect } from 'react';
import { processText, getCategories, getDatabaseStats } from '../../lib/api';
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
  const [inputMode, setInputMode] = useState('upload'); // 'upload' or 'text'
  const [similarityThreshold, setSimilarityThreshold] = useState(0.8);

  // Load categories and stats on component mount
  useEffect(() => {
    loadCategories();
    loadStats();
  }, []);

  const loadCategories = async () => {
    try {
      // Get categories from Supabase instead of backend
      const data = await knowledgeAPI.getAll();
      const uniqueCategories = [...new Set(data.map(item => item.category))];
      setCategories(uniqueCategories.map(cat => ({ category: cat })));
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadStats = async () => {
    try {
      // Get stats from Supabase instead of backend
      const data = await knowledgeAPI.getAll();
      const uniqueTags = new Set();
      data.forEach(item => {
        if (item.tags) {
          item.tags.forEach(tag => uniqueTags.add(tag));
        }
      });

      setStats({
        total_knowledge_items: data.length,
        unique_tags: uniqueTags.size,
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
      // Call backend for AI processing and recommendations
      const result = await processText(inputText, similarityThreshold);
      console.log('Backend response:', result); // Debug log
      
      // Handle the new response structure
      setRecommendations(result.recommendations);
      setSimilarMainCategory(result.similar_main_category);
      setSimilarSubCategory(result.similar_sub_category);
      setSimilarityScore(result.similarity_score);
    } catch (error) {
      setError(`Processing failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyRecommendation = async recommendation => {
    setIsProcessing(true);
    setError(null);

    try {
      console.log('🚀 Applying recommendation:', recommendation.main_category, '→', recommendation.sub_category);
      console.log('📝 Content length:', recommendation.updated_text.length);
      console.log('🏷️ Tags:', recommendation.tags);

      // Use the new schema fields from the recommendation
      let tags = [];
      if (recommendation.tags && Array.isArray(recommendation.tags)) {
        tags = recommendation.tags;
      } else {
        // Fallback if tags are missing or malformed
        tags = ['knowledge'];
      }

      // Create knowledge item directly in Supabase using new schema
      const knowledgeItem = {
        main_category: recommendation.main_category,
        sub_category: recommendation.sub_category,
        content: recommendation.updated_text || inputText,
        tags: tags, // Use the meaningful tags from LLM
      };

      console.log('⚡ Starting knowledge item creation (this will generate embedding)...');

      const result = await knowledgeAPI.create(knowledgeItem);

      console.log('✅ Knowledge item created successfully:', result.id);

      setSuccessMessage(`✅ Successfully created: ${recommendation.main_category} → ${recommendation.sub_category}`);

      // Refresh categories and stats
      await loadCategories();
      await loadStats();

      // Clear recommendations after successful application
      setRecommendations(null);
      setSimilarMainCategory(null);
      setSimilarSubCategory(null);
      setSimilarityScore(null);
      setInputText('');
    } catch (error) {
      console.error('❌ Application failed:', error);
      setError(`Failed to apply recommendation: ${error.message}`);
    } finally {
      setIsProcessing(false);
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleProcessText();
    }
  };

  return (
    <div className="flex h-screen bg-main-bg bg-gradient-to-br from-blue-600 via-navy-600 to-white">
      {/* Sidebar Navigation */}
      <SidebarNavigation currentPage="curate" stats={stats} />

      {/* Main Content Area */}
      <div className="flex-1 p-6">
        {/* Input Mode Toggle */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setInputMode('upload')}
            className={`px-4 py-2 rounded text-sm ${
              inputMode === 'upload'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            📄 Upload File
          </button>
          <button
            onClick={() => setInputMode('text')}
            className={`px-4 py-2 rounded text-sm ${
              inputMode === 'text'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            ✏️ Enter Text
          </button>
        </div>

        {/* Upload Area or Text Input */}
        {inputMode === 'upload' ? (
          <div className="bg-white rounded-lg p-8 mb-6 border-2 border-dashed border-gray-300 text-center">
            <div className="text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-lg font-medium text-gray-700 mb-2">Drop files here or click to upload</div>
            <div className="text-sm text-gray-500">Supports: .txt, .md, .pdf, .docx</div>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-6 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              💭 What did you learn today?
            </label>
            <textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share insights, discoveries, or any knowledge you want to organize..."
              className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all"
            />

            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">{inputText.length} characters</div>
              <button
                onClick={handleProcessText}
                disabled={!inputText.trim() || isProcessing}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <span>{isProcessing ? '🔄 Processing...' : '🚀 Process'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && <div className="bg-red-600 text-white p-4 rounded-lg mb-6">❌ {error}</div>}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-600 text-white p-4 rounded-lg mb-6">{successMessage}</div>
        )}

        {/* Summary & Analysis Card */}
        {recommendations && (
          <div className="bg-white rounded-lg p-6 mb-6">
            <div className="border-l-4 border-accent pl-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Summary & Analysis:</h2>
            </div>

            {/* Context Section */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                📊 CONTEXT:
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {inputText.substring(0, 500)}...
              </p>
            </div>

            {/* Similar Category Info - Updated for new schema */}
            {similarMainCategory && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">
                  📊 Similar Content Found:
                </h3>
                <p className="text-blue-700 text-sm">
                  Found similar content in category: <strong>{similarMainCategory}</strong>
                  {similarSubCategory && (
                    <> → <strong>{similarSubCategory}</strong></>
                  )}
                  {similarityScore && (
                    <> (similarity: {(similarityScore * 100).toFixed(1)}%)</>
                  )}
                </p>
              </div>
            )}

            {/* Suggestions Section - Updated for new schema */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">💡 SUGGESTIONS:</h3>
              <p className="text-gray-700 text-sm mb-3">
                Reviewing your existing knowledge database, here are three options for handling this
                information:
              </p>
              <ul className="text-gray-700 text-sm space-y-3 ml-4">
                {recommendations.map(rec => (
                  <li
                    key={rec.option_number}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-semibold text-blue-600">
                        Option {rec.option_number}:
                      </span>
                      <div className="flex-1">
                        <div className="mb-2">
                          <span className="font-medium text-gray-800">
                            {rec.main_category} → {rec.sub_category}
                          </span>
                        </div>
                        <div className="mb-2">
                          <span className="text-gray-600">{rec.change}</span>
                        </div>
                        <div className="mb-3">
                          <div className="bg-white rounded p-2 text-xs text-gray-600 border">
                            {rec.preview || rec.updated_text.substring(0, 150) + '...'}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {rec.tags && rec.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={() => handleApplyRecommendation(rec)}
                          disabled={isProcessing}
                          className="bg-blue-600 text-white px-4 py-2 rounded text-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isProcessing ? 'Applying...' : `Apply Option ${rec.option_number}`}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button
                onClick={handleDoNothing}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
              >
                🗑️ Discard Input
              </button>
            </div>
          </div>
        )}

        {/* Bottom Stats */}
        {stats && (
          <div className="bg-white rounded-lg p-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>📚 Total Items: {stats.total_knowledge_items}</span>
              <span>🏷️ Unique Tags: {stats.unique_tags}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}