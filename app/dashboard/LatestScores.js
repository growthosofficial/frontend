import { ChevronRight } from 'lucide-react';
import { getScoreGradientColor } from '../../utils/cn';

export default function LatestScores({ latestScores, loading, error }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-lime-100">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Latest Scores</h2>
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-lime-500 border-t-transparent mx-auto mb-2"></div>
            <p className="text-gray-500">Loading test data...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-2">Failed to load test data</p>
            <button 
              onClick={() => window.location.reload()} 
              className="text-sm text-lime-600 hover:text-lime-700"
            >
              Try again
            </button>
          </div>
        ) : latestScores.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No test data available</p>
            <p className="text-sm text-gray-400 mt-1">Take your first test to see your scores here</p>
          </div>
        ) : (
          latestScores.map((score, index) => {
            score.score = Math.round(score.score);
            return (
            <div
              key={score.id || index}
              className="flex items-center justify-between gap-4 bg-lime-50 p-4 rounded-lg cursor-pointer hover:bg-lime-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    score.score >= 90
                      ? 'bg-lime-500'
                      : score.score >= 80
                      ? 'bg-lime-600'
                      : score.score >= 70
                      ? 'bg-lime-700'
                      : 'bg-lime-800'
                  }`}
                />
                <span className="text-gray-700">{score.subject}</span>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className="text-lg font-semibold"
                  style={{ color: getScoreGradientColor(score.score / 100) }}
                >
                  {score.score}%
                </span>
                <span className="text-gray-500 text-sm">{score.date}</span>
                <ChevronRight className="w-5 h-5 text-lime-600" />
              </div>
            </div>
          )})
        )}
      </div>
    </div>
  );
} 