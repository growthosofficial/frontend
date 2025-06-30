import { ChevronRight } from 'lucide-react';

export default function GoalsSection({ goals, loading, error }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-lime-100">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Your Goals</h2>
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-lime-500 border-t-transparent mx-auto mb-2"></div>
            <p className="text-gray-500">Loading goals...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <span className="text-red-500">{error}</span>
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No goals available</p>
            <p className="text-sm text-gray-400 mt-1">Add a goal to see it here</p>
          </div>
        ) : (
          goals.map((goal, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-lime-50 p-3 rounded-lg cursor-pointer hover:bg-lime-100 transition-colors"
            >
              <span className="flex-1 text-gray-700">{goal}</span>
              <ChevronRight className="w-5 h-5 text-lime-600" />
            </div>
          ))
        )}
      </div>
    </div>
  );
} 