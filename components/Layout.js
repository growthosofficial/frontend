'use client'

import { useState } from 'react'
import { 
  Brain, 
  BookOpen, 
  Plus, 
  Search, 
  MessageCircle, 
  User, 
  ChevronDown,
  ChevronRight,
  Folder,
  Network,
  TestTube,
  Zap,
  StickyNote,
  Settings
} from 'lucide-react'
import ChatInterface from './ChatInterface'

export default function Layout({ children, currentPage, setCurrentPage }) {
  const [isKnowledgeExpanded, setIsKnowledgeExpanded] = useState(true)
  const [activeWorkspace, setActiveWorkspace] = useState(1)

  const isActive = (page) => currentPage === page

  const handleNavigation = (page) => {
    setCurrentPage(page)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8 text-blue-400" />
            <h1 className="text-xl font-bold">Second Brain</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-6">
          {/* User Section */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-gray-700">
              <User className="w-5 h-5 text-gray-300" />
              <span className="text-sm font-medium">Knowledge Master</span>
            </div>
          </div>

          {/* Knowledge Section */}
          <div className="space-y-2">
            <button
              onClick={() => setIsKnowledgeExpanded(!isKnowledgeExpanded)}
              className="flex items-center space-x-2 w-full px-3 py-2 text-left hover:bg-gray-700 rounded-lg transition-colors"
            >
              {isKnowledgeExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              <BookOpen className="w-5 h-5" />
              <span className="text-sm font-medium">Knowledge</span>
            </button>
            
            {isKnowledgeExpanded && (
              <div className="ml-6 space-y-1">
                <button
                  onClick={() => handleNavigation('curate')}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors w-full text-left ${
                    isActive('curate') 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Curate Knowledge</span>
                </button>
                <button
                  onClick={() => handleNavigation('knowledge')}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors w-full text-left ${
                    isActive('knowledge') 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  <span>View Knowledge</span>
                </button>
                <button
                  onClick={() => handleNavigation('categories')}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors w-full text-left ${
                    isActive('categories') 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Folder className="w-4 h-4" />
                  <span>View Categories</span>
                </button>
              </div>
            )}
          </div>

          {/* Additional Sections */}
          <div className="space-y-2">
            <button className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors w-full text-left">
              <Network className="w-5 h-5" />
              <span>Relationship Graph</span>
            </button>
          </div>

          {/* Action Items */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
              Actions
            </h3>
            <button className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors w-full text-left">
              <TestTube className="w-5 h-5" />
              <span>Self Test</span>
            </button>
            <button className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors w-full text-left">
              <Zap className="w-5 h-5" />
              <span>Deploy Agents</span>
            </button>
          </div>

          {/* Workspace Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
              Workspace
            </h3>
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                onClick={() => setActiveWorkspace(num)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm w-full text-left transition-colors ${
                  activeWorkspace === num
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <StickyNote className="w-4 h-4" />
                <span>Notes {num}</span>
              </button>
            ))}
            <button className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors w-full text-left">
              <Plus className="w-4 h-4" />
              <span>Add Workspace</span>
            </button>
          </div>
        </nav>

        {/* Settings */}
        <div className="p-4 border-t border-gray-700">
          <button className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors w-full text-left">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-auto">
          {children}
        </main>
        
        {/* Chat Interface */}
        <ChatInterface />
      </div>
    </div>
  )
}