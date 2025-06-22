'use client'

import { useState } from 'react'
import { Brain, Lightbulb, Tag, Clock, AlertCircle, CheckCircle } from 'lucide-react'

export default function CurateKnowledge() {
  const [inputText, setInputText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const [selectedRecommendation, setSelectedRecommendation] = useState(null)

  const handleProcess = async () => {
    if (!inputText.trim()) return
    
    setIsProcessing(true)
    
    // Simulate API call with AI processing
    setTimeout(() => {
      const mockResult = {
        recommendations: [
          {
            option_number: 1,
            change: "Organize as a structured learning note with clear objectives and key concepts",
            updated_text: `# ${inputText.split(' ').slice(0, 3).join(' ')}\n\n## Key Concepts\n${inputText}\n\n## Learning Objectives\n- Understand core principles\n- Apply concepts practically\n- Connect to related knowledge`,
            category: "Learning Notes",
            tags: ["learning", "concepts", "study"],
            preview: "Structured learning note with clear objectives..."
          },
          {
            option_number: 2,
            change: "Create a reference document with detailed explanations and examples",
            updated_text: `## Reference: ${inputText.split(' ').slice(0, 4).join(' ')}\n\n**Definition:** ${inputText}\n\n**Examples:**\n- Example 1\n- Example 2\n\n**Related Concepts:**\n- Concept A\n- Concept B`,
            category: "Reference Materials",
            tags: ["reference", "documentation", "examples"],
            preview: "Comprehensive reference with examples and connections..."
          },
          {
            option_number: 3,
            change: "Transform into actionable insights with implementation steps",
            updated_text: `# Actionable Insights\n\n**Core Insight:** ${inputText}\n\n## Implementation Steps\n1. Analyze current situation\n2. Apply the concept\n3. Measure results\n4. Iterate and improve\n\n## Next Actions\n- [ ] Research further\n- [ ] Create implementation plan`,
            category: "Actionable Insights",
            tags: ["action", "implementation", "insights"],
            preview: "Actionable framework with clear implementation steps..."
          }
        ],
        similar_category: Math.random() > 0.5 ? "Learning Notes" : undefined,
        similarity_score: Math.random() > 0.5 ? 0.85 : undefined,
        status: "success"
      }
      
      setResult(mockResult)
      setIsProcessing(false)
    }, 2000)
  }

  const handleApplyRecommendation = (recommendation) => {
    // TODO: Save to database
    console.log('Applying recommendation:', recommendation)
    setSelectedRecommendation(recommendation.option_number)
    
    // Show success message
    setTimeout(() => {
      setInputText('')
      setResult(null)
      setSelectedRecommendation(null)
    }, 2000)
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Curate Knowledge
          </h1>
          <p className="text-gray-600">
            Add new information and get AI-powered recommendations for optimal organization.
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Enter Knowledge to Curate
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Share what you've learned, discovered, or want to remember..."
            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all"
          />
          
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
              {inputText.length} characters
            </div>
            <button
              onClick={handleProcess}
              disabled={!inputText.trim() || isProcessing}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Brain className="w-4 h-4" />
              <span>{isProcessing ? 'Processing...' : 'Generate Recommendations'}</span>
            </button>
          </div>
        </div>

        {/* Processing State */}
        {isProcessing && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div className="text-lg font-medium text-gray-900">
                AI is analyzing your content...
              </div>
            </div>
            <div className="mt-4 text-center text-gray-600">
              Finding similar content, generating categories, and creating optimization suggestions
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Summary & Analysis */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <span>Summary & Analysis</span>
              </h2>
              
              {/* Context */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Context</h3>
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                  {inputText.substring(0, 200)}
                  {inputText.length > 200 && '...'}
                </div>
              </div>

              {/* Similar Content Alert */}
              {result.similar_category && result.similarity_score && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Similar content detected
                    </span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    Found {Math.round(result.similarity_score * 100)}% similarity with "{result.similar_category}" category
                  </p>
                </div>
              )}

              {/* AI Recommendation */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Brain className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">AI Recommendation</span>
                </div>
                <p className="text-sm text-blue-700">
                  Based on the content analysis, I recommend structuring this as a learning note 
                  with clear objectives to maximize retention and future reference value.
                </p>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Organization Recommendations
              </h2>
              
              <div className="space-y-4">
                {result.recommendations.map((rec) => (
                  <div
                    key={rec.option_number}
                    className={`border rounded-lg p-4 transition-all ${
                      selectedRecommendation === rec.option_number
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                          {rec.option_number}
                        </div>
                        <h3 className="font-medium text-gray-900">
                          {rec.category}
                        </h3>
                      </div>
                      
                      {selectedRecommendation === rec.option_number ? (
                        <div className="flex items-center space-x-2 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Applied</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleApplyRecommendation(rec)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Apply
                        </button>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">
                      {rec.change}
                    </p>
                    
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700 font-mono">
                        {rec.preview}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Tag className="w-3 h-3" />
                        <span>Tags:</span>
                        <div className="flex space-x-1">
                          {rec.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}