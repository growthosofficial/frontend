'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Calendar, Tag, ChevronDown, ChevronUp, Edit, Trash2 } from 'lucide-react'

export default function KnowledgeView() {
  const [knowledgeItems, setKnowledgeItems] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTag, setSelectedTag] = useState('all')
  const [expandedItems, setExpandedItems] = useState(new Set())
  const [isLoading, setIsLoading] = useState(true)

  // Mock data for demonstration
  useEffect(() => {
    setTimeout(() => {
      const mockData = [
        {
          id: '1',
          category: 'Learning Notes',
          content: '# React Hooks\n\n## Key Concepts\nReact Hooks are functions that let you use state and other React features in functional components.\n\n## Learning Objectives\n- Understand useState and useEffect\n- Apply hooks practically\n- Connect to component lifecycle',
          tags: ['react', 'hooks', 'frontend'],
          created_at: '2024-01-15T10:30:00Z',
          last_updated: '2024-01-15T10:30:00Z',
          preview: 'React Hooks are functions that let you use state and other React features...'
        },
        {
          id: '2',
          category: 'Reference Materials',
          content: '## API Design Principles\n\n**Definition:** Guidelines for creating consistent, maintainable APIs\n\n**Examples:**\n- RESTful conventions\n- GraphQL schemas\n\n**Related Concepts:**\n- HTTP methods\n- Status codes',
          tags: ['api', 'design', 'backend'],
          created_at: '2024-01-14T14:20:00Z',
          last_updated: '2024-01-14T14:20:00Z',
          preview: 'Guidelines for creating consistent, maintainable APIs...'
        },
        {
          id: '3',
          category: 'Actionable Insights',
          content: '# Performance Optimization\n\n**Core Insight:** Premature optimization is the root of all evil, but measured optimization is essential\n\n## Implementation Steps\n1. Measure current performance\n2. Identify bottlenecks\n3. Apply targeted optimizations\n4. Measure results\n\n## Next Actions\n- [ ] Set up performance monitoring\n- [ ] Create optimization checklist',
          tags: ['performance', 'optimization', 'development'],
          created_at: '2024-01-13T09:15:00Z',
          last_updated: '2024-01-13T09:15:00Z',
          preview: 'Premature optimization is the root of all evil, but measured optimization...'
        }
      ]
      
      setKnowledgeItems(mockData)
      setIsLoading(false)
    }, 1000)
  }, [])

  const categories = ['all', ...Array.from(new Set(knowledgeItems.map(item => item.category)))]
  const allTags = ['all', ...Array.from(new Set(knowledgeItems.flatMap(item => item.tags)))]

  const filteredItems = knowledgeItems.filter(item => {
    const matchesSearch = item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesTag = selectedTag === 'all' || item.tags.includes(selectedTag)
    
    return matchesSearch && matchesCategory && matchesTag
  })

  const toggleExpanded = (itemId) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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
            Knowledge Base
          </h1>
          <p className="text-gray-600">
            Browse, search, and manage your curated knowledge collection.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search knowledge..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Tag Filter */}
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
              >
                {allTags.map(tag => (
                  <option key={tag} value={tag}>
                    {tag === 'all' ? 'All Tags' : tag}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {filteredItems.length} of {knowledgeItems.length} items
              {searchTerm && ` for "${searchTerm}"`}
              {selectedCategory !== 'all' && ` in ${selectedCategory}`}
              {selectedTag !== 'all' && ` tagged with ${selectedTag}`}
            </p>
          </div>
        </div>

        {/* Knowledge Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No knowledge items found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory !== 'all' || selectedTag !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Start by curating some knowledge to see it here'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {item.category}
                      </span>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(item.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content Preview */}
                <div className="mb-4">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {expandedItems.has(item.id) ? item.content : item.preview}
                  </p>
                  
                  <button
                    onClick={() => toggleExpanded(item.id)}
                    className="mt-2 flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                  >
                    {expandedItems.has(item.id) ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        <span>Show less</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        <span>Show more</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-blue-100 hover:text-blue-800 cursor-pointer transition-colors"
                      onClick={() => setSelectedTag(tag)}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}