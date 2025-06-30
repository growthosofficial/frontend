import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const COLORS = [
  '#84CC16', '#65A30D', '#4D7C0F', '#3F6212', '#22d3ee', '#818cf8', '#f472b6', '#facc15', '#f87171', '#a3e635', '#fbbf24', '#f59e42'
];

export default function PieChartSection({ pieChartData, totalCount, loading, error }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-lime-100">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Subject Distribution</h2>
      <div className="h-[300px] flex items-center justify-center relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-lime-500 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-red-500">{error}</span>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    color: '#374151',
                  }}
                  formatter={(value, name, props) => [
                    `${value} (${props.payload.percentage}%)`,
                    name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Total Count Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">
                  {totalCount}
                </div>
                <div className="text-sm text-gray-500 mt-1">Total Items</div>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        {pieChartData.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-sm text-gray-600">{item.name}</span>
            <span className="text-xs text-gray-400 ml-2">{item.value} ({item.percentage}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
