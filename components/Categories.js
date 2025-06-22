'use client'

import { useState, useEffect } from 'react'
import { Folder, FileText, Tag, TrendingUp, Calendar } from 'lucide-react'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mock data for demonstration
    setTimeout(() => {
      const mockCategories = [
        {
          name: 'Learning Notes',
          itemCount: 12,
          recentActivity: 3,
          topTags: ['react', 'javascript', 'frontend', 'hooks'],
          lastUpdated: '2024-01-15T10:30:00Z',
          description: 'Structured learning materials with clear objectives and key concepts'
        },
        {
          name: 'Reference Materials',
          itemCount: 8,
          recentActivity: 1,
          topTags: ['api', 'documentation', 'design', 'patterns'],
          lastUpdated: '2024-01-14T14:20:00Z',
          description: 'Comprehensive reference documents with detailed explanations and examples'
        },
        {
          name: 'Actionable Insights',
          itemCount: 15,
          recentActivity: 5,
          topTags: ['performance', 'optimization', 'productivity', 'strategy'],
          lastUpdated: '2024-01-13T09:15:00Z',
          description: 'Practical insights with clear implementation steps and next actions'
        },
        {
          name: 'Research Notes',
          itemCount: 6,
          recentActivity: 2,
          topTags: ['research', 'analysis', 'data', 'trends'],
          lastUpdated: '2024-01-12T16:45:00Z',
          description: 'In-depth research findings and analytical observations'
        },
        {
          name: 'Meeting Notes',
          itemCount: 9,
          recentActivity: 1,
          topTags: ['meetings', 'decisions', 'action-items', 'team'],
          lastUpdated: '2024-01-11T11:30:00Z',
          description: 'Meeting summaries with key decisions and follow-up actions'
        }
      ]
      
      setCategories(mockCategories)
      setIsLoading(false)
    }, 1000)
  }, [])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getTotalItems = () => categories.reduce((sum, cat) => sum + cat.itemCount, 0)
  const getTotalActivity = () => categories.reduce((sum, cat) => sum + cat.recentActivity, 0)

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Knowledge Categories
          </h1>
          <p className="text-gray-600">
            Explore how your knowledge is organized across different categories.
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Categories</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
              <Folder className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{getTotalItems()}</p>
              </div>
              <FileText className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent Activity</p>
                <p className="text-2xl font-bold text-gray-900">{getTotalActivity()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {categories.map((category) => (
            <div
              key={category.name}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Folder className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {category.itemCount} items
                    </p>
                  </div>
                </div>
                
                {category.recentActivity > 0 && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    <TrendingUp className="w-3 h-3" />
                    <span>{category.recentActivity} recent</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {category.description}
              </p>

              {/* Stats */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <FileText className="w-4 h-4" />
                    <span>{category.itemCount} items</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(category.lastUpdated)}</span>
                  </div>
                </div>
              </div>

              {/* Top Tags */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Top Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.topTags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {category.topTags.length > 4 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{category.topTags.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Category Distribution Chart Placeholder */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Category Distribution
          </h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Chart visualization coming soon</p>
              <p className="text-sm text-gray-500">
                Visual representation of knowledge distribution across categories
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}