'use client';

import { useState } from 'react';
import SidebarNavigation from '../../components/SidebarNavigation';
import {
  ChevronRight,
  PresentationChart,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Mock data for the performance chart
const performanceData = [
  { date: 'Jun 5', score: 52 },
  { date: 'Jun 7', score: 57 },
  { date: 'Jun 7', score: 67 },
  { date: 'Jun 8', score: 65 },
  { date: 'Jun 11', score: 58 },
  { date: 'Jun 11', score: 62 },
  { date: 'Jun 11', score: 71 },
  { date: 'Jun 12', score: 77 },
  { date: 'Jun 17', score: 66 },
  { date: 'Jun 18', score: 72 },
  { date: 'Jun 19', score: 75 },
  { date: 'Jun 24', score: 71 },
  { date: 'Jun 24', score: 70 },
  { date: 'Jun 24', score: 83 },
  { date: 'Jun 28', score: 74 },
  { date: 'Jun 28', score: 78 },
  { date: 'Jun 29', score: 86 },
  { date: 'Jun 30', score: 93 },
];

const mockGoals = [
  'Get into Y Combinator in 3 years.',
  'Get an internship offer at Meta.',
  'Achieve a GPA of over 3.5 for university.',
  'Read 20 Books by the end of the year.',
];

const mockLatestScores = [
  { subject: 'Computer Science', score: 93 },
  { subject: 'Biology', score: 88 },
  { subject: 'Computer Science', score: 84 },
  { subject: 'History', score: 73 },
];

const mockDates = [
  'June 30th, 2025',
  'June 29th, 2025',
  'June 28th, 2025',
  'June 28th, 2025',
];

// Update pie chart colors to use lime theme
const pieChartData = [
  { name: 'Computer Science', value: 35, color: '#84CC16' },  // lime-500
  { name: 'Biology', value: 25, color: '#65A30D' },          // lime-600
  { name: 'Physics', value: 20, color: '#4D7C0F' },          // lime-700
  { name: 'History', value: 20, color: '#3F6212' }           // lime-800
];

export function DashboardView() {
  const [selectedSubject, setSelectedSubject] = useState('Computer Science');
  const [selectedTimeRange, setSelectedTimeRange] = useState('Past Month');

  // Calculate average mastery score
  const averageMasteryScore = Math.round(
    mockLatestScores.reduce((acc, score) => acc + score.score, 0) / mockLatestScores.length
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-white via-lime-50 to-lime-100">
      <SidebarNavigation currentPage="dashboard" />
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-lime-100">
            <h1 className="text-2xl font-semibold flex items-center gap-2 text-gray-900">
              📊 Main Dashboard
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Goals Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-lime-100">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Your Goals</h2>
              <div className="space-y-3">
                {mockGoals.map((goal, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-lime-50 p-3 rounded-lg cursor-pointer hover:bg-lime-100 transition-colors"
                  >
                    <span className="flex-1 text-gray-700">{goal}</span>
                    <ChevronRight className="w-5 h-5 text-lime-600" />
                  </div>
                ))}
                <button className="text-sm text-lime-600 hover:text-lime-700 transition-colors mt-4">
                  View All
                </button>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-lime-100 lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="bg-lime-50 text-gray-700 px-3 py-1 rounded-lg border border-lime-200 hover:border-lime-300 focus:outline-none focus:ring-2 focus:ring-lime-500"
                >
                  <option>Computer Science</option>
                  <option>Biology</option>
                  <option>Physics</option>
                  <option>History</option>
                </select>
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="bg-lime-50 text-gray-700 px-3 py-1 rounded-lg border border-lime-200 hover:border-lime-300 focus:outline-none focus:ring-2 focus:ring-lime-500"
                >
                  <option>Past Month</option>
                  <option>Past Week</option>
                  <option>Past Year</option>
                </select>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="date"
                      stroke="#6B7280"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#6B7280"
                      fontSize={12}
                      tickLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        color: '#374151',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#84CC16"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Middle Row with Pie Chart and Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Pie Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-lime-100">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Subject Distribution</h2>
              <div className="h-[300px] flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        color: '#374151',
                      }}
                      formatter={(value, name) => [`${value}%`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Average Mastery Score Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900">
                      {averageMasteryScore}%
                    </div>
                    <div className="text-sm text-gray-500 mt-1">Mastery Score</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {pieChartData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Latest Scores Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-lime-100">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Latest Scores</h2>
              <div className="space-y-3">
                {mockLatestScores.map((score, index) => (
                  <div
                    key={index}
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
                      <span className="text-lg font-semibold text-gray-900">{score.score}%</span>
                      <span className="text-gray-500 text-sm">{mockDates[index]}</span>
                      <ChevronRight className="w-5 h-5 text-lime-600" />
                    </div>
                  </div>
                ))}
                <button className="text-sm text-lime-600 hover:text-lime-700 transition-colors mt-4">
                  View All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 