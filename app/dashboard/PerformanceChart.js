import { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell, LabelList } from 'recharts';
import { getScoreGradientColor } from '../../utils/cn';
import { getDateRangeForTimeRange, getTests } from '../../lib/api';

const TIME_RANGES = [
  'Past Week',
  'Past Month',
  'Past Year',
];

export default function PerformanceChart({
  selectedSubject,
  setSelectedSubject,
  categories,
  selectedTimeRange,
  setSelectedTimeRange,
}) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const categoryNames = categories.map(category => category.name);

  useEffect(() => {
    const fetchChartData = async () => {
      if (!selectedSubject) return;
      setLoading(true);
      try {
        const { start, end } = getDateRangeForTimeRange(selectedTimeRange);
        let query = `category=${encodeURIComponent(selectedSubject)}&sort_order=asc`;
        if (start) query += `&start_date=${encodeURIComponent(start)}`;
        if (end) query += `&end_date=${encodeURIComponent(end)}`;
        const data = await getTests(query);
        // Sort by created_at ascending (if not already)
        const sorted = (data.tests || []).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        setChartData(
          sorted.map(test => ({
            date: new Date(test.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
            score: Math.round((test.percentage) || 0),
          }))
        );
      } catch (err) {
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchChartData();
  }, [selectedSubject, selectedTimeRange]);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-lime-100 lg:col-span-2">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Test Performance</h2>
      <div className="flex justify-between items-center mb-6">
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="bg-lime-50 text-gray-700 px-3 py-1 rounded-lg border border-lime-200 hover:border-lime-300 focus:outline-none focus:ring-2 focus:ring-lime-500"
        >
          {categoryNames.map(subject => (
            <option key={subject}>{subject}</option>
          ))}
        </select>
        <select
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value)}
          className="bg-lime-50 text-gray-700 px-3 py-1 rounded-lg border border-lime-200 hover:border-lime-300 focus:outline-none focus:ring-2 focus:ring-lime-500"
        >
          {TIME_RANGES.map(range => (
            <option key={range}>{range}</option>
          ))}
        </select>
      </div>
      <div className="h-[300px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 32 }}>
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
            <Bar
              dataKey="score"
              radius={[3, 3, 0, 0]}
              isAnimationActive={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getScoreGradientColor((entry.score || 0) / 100)} />
              ))}
              {
                chartData.length < 20 && (
                  <LabelList dataKey="score" position="top" formatter={(value) => `${value}`} />
                )
              }
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-lime-500 border-t-transparent"></div>
          </div>
        )}
      </div>
    </div>
  );
} 