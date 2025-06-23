'use client';

import React, { useState, useEffect } from 'react';
import { knowledgeAPI } from '../../lib/supabase';
import SidebarNavigation from '../../components/SidebarNavigation';
import Link from 'next/link';

// Knowledge Item Card Component with new schema support
const KnowledgeCard = ({ 
  id,
  main_category, 
  sub_category, 
  content, 
  tags, 
  source,
  strength_score,
  created_at, 
  last_updated 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const truncateLength = 200;
  const shouldTruncate = content.length > truncateLength;

  // Handle strength score display
  const getStrengthColor = (score) => {
    if (!score) return 'bg-gray-200';
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-500';
    if (score >= 0.4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStrengthLabel = (score) => {
    if (!score) return 'Not Scored';
    if (score >= 0.8) return 'Strong';
    if (score >= 0.6) return 'Good';
    if (score >= 0.4) return 'Weak';
    return 'Very Weak';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Category Header with new schema */}
      <div className="border-b border-gray-200 pb-3 mb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="text-sm text-blue-600 font-medium mb-1">
              {main_category}
            </div>
            <h3 className="font-semibold text-gray-800 text-lg">
              {sub_category}
            </h3>
          </div>
          {/* Strength Score Indicator */}
          {strength_score !== null && strength_score !== undefined && (
            <div className="flex items-center gap-2 ml-4">
              <div 
                className={`w-3 h-3 rounded-full ${getStrengthColor(strength_score)}`}
                title={`Strength: ${(strength_score * 100).toFixed(0)}% - ${getStrengthLabel(strength_score)}`}
              ></div>
              <span className="text-xs text-gray-500">
                {(strength_score * 100).toFixed(0)}%
              </span>
            </div>
          )}
        </div>
        
        {/* Source indicator */}
        {source && source !== 'text' && (
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              📄 {source}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="mb-4">
        <div className="text-gray-600 text-sm leading-relaxed">
          {shouldTruncate && !isExpanded ? `${content.substring(0, truncateLength)}...` : content}
        </div>
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          >
            {isExpanded ? 'Read Less' : 'Read More'}
          </button>
        )}
      </div>

      {/* Tags Section */}
      {tags && tags.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Timestamp Footer */}
      <div className="text-xs text-gray-400 border-t border-gray-100 pt-2">
        <div className="flex justify-between items-center">
          <div>
            Created: {new Date(created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
          <div className="text-xs text-gray-500">
            ID: {id}
          </div>
        </div>
        {last_updated !== created_at && (
          <div className="mt-1">
            Updated: {new Date(last_updated).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Category Filter Component
const CategoryFilter = ({ categories, selectedMainCategory, selectedSubCategory, onFilterChange }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <h3 className="font-semibold text-gray-800 mb-3">Filter by Category</h3>
      
      {/* Main Category Filter */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Main Category</label>
        <select
          value={selectedMainCategory}
          onChange={(e) => onFilterChange(e.target.value, '')}
          className="w-full p-2 border border-gray-300 rounded text-sm"
        >
          <option value="">All Main Categories</option>
          {Object.keys(categories).sort().map(mainCat => (
            <option key={mainCat} value={mainCat}>
              {mainCat} ({categories[mainCat].total_items})
            </option>
          ))}
        </select>
      </div>

      {/* Sub Category Filter */}
      {selectedMainCategory && categories[selectedMainCategory] && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category</label>
          <select
            value={selectedSubCategory}
            onChange={(e) => onFilterChange(selectedMainCategory, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm"
          >
            <option value="">All Sub Categories</option>
            {categories[selectedMainCategory].sub_categories.sort().map(subCat => (
              <option key={subCat} value={subCat}>
                {subCat}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default function KnowledgeViewPage() {
  const [knowledgeItems, setKnowledgeItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState({});
  const [selectedMainCategory, setSelectedMainCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch knowledge items and organize by categories
  useEffect(() => {
    async function fetchKnowledgeItems() {
      try {
        setLoading(true);
        setError(null);

        const [data, statsData, groupedCategories] = await Promise.all([
          knowledgeAPI.getAll(),
          knowledgeAPI.getStats(),
          knowledgeAPI.getCategoriesGrouped()
        ]);

        setKnowledgeItems(data || []);
        setFilteredItems(data || []);
        setStats(statsData);
        setCategories(groupedCategories);

      } catch (err) {
        console.error('Error fetching knowledge items:', err);
        setError('Failed to load knowledge items. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchKnowledgeItems();
  }, []);

  // Filter items based on selected categories and search term
  useEffect(() => {
    let filtered = knowledgeItems;

    // Filter by main category
    if (selectedMainCategory) {
      filtered = filtered.filter(item => item.main_category === selectedMainCategory);
    }

    // Filter by sub category
    if (selectedSubCategory) {
      filtered = filtered.filter(item => item.sub_category === selectedSubCategory);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.content.toLowerCase().includes(search) ||
        item.main_category.toLowerCase().includes(search) ||
        item.sub_category.toLowerCase().includes(search) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(search)))
      );
    }

    setFilteredItems(filtered);
  }, [knowledgeItems, selectedMainCategory, selectedSubCategory, searchTerm]);

  const handleFilterChange = (mainCategory, subCategory) => {
    setSelectedMainCategory(mainCategory);
    setSelectedSubCategory(subCategory);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Navigation Component */}
      <SidebarNavigation currentPage="knowledge" stats={stats} />

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Knowledge Database</h1>
            <p className="text-gray-600">
              {loading ? 'Loading knowledge items...' : 
               `${filteredItems.length} of ${knowledgeItems.length} knowledge items`}
              {selectedMainCategory && ` in ${selectedMainCategory}`}
              {selectedSubCategory && ` → ${selectedSubCategory}`}
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search knowledge items..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute left-3 top-3 text-gray-400">
                🔍
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <CategoryFilter
            categories={categories}
            selectedMainCategory={selectedMainCategory}
            selectedSubCategory={selectedSubCategory}
            onFilterChange={handleFilterChange}
          />

          {/* Stats Summary */}
          {stats && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{stats.total_items}</div>
                  <div className="text-xs text-gray-600">Total Items</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.unique_main_categories}</div>
                  <div className="text-xs text-gray-600">Main Categories</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{stats.unique_sub_categories}</div>
                  <div className="text-xs text-gray-600">Sub Categories</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{stats.unique_tags}</div>
                  <div className="text-xs text-gray-600">Unique Tags</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {stats.avg_strength_score ? (stats.avg_strength_score * 100).toFixed(0) + '%' : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-600">Avg Strength</div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading knowledge items...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="text-red-600 mr-2">⚠️</div>
                <div>
                  <h3 className="text-red-800 font-medium">Error</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          )}

          {/* Knowledge Items Grid */}
          {!loading && !error && filteredItems.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map(item => (
                <KnowledgeCard
                  key={item.id}
                  id={item.id}
                  main_category={item.main_category}
                  sub_category={item.sub_category}
                  content={item.content}
                  tags={item.tags}
                  source={item.source}
                  strength_score={item.strength_score}
                  created_at={item.created_at}
                  last_updated={item.last_updated}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredItems.length === 0 && knowledgeItems.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📚</div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">No knowledge items found</h3>
              <p className="text-gray-500 mb-4">
                Your knowledge database is empty. Start adding knowledge to see it here.
              </p>
              <Link
                href="/curate"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block"
              >
                Add Knowledge Item
              </Link>
            </div>
          )}

          {/* Filtered Empty State */}
          {!loading && !error && filteredItems.length === 0 && knowledgeItems.length > 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">No items match your filters</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search term or category filters.
              </p>
              <button
                onClick={() => {
                  setSelectedMainCategory('');
                  setSelectedSubCategory('');
                  setSearchTerm('');
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}