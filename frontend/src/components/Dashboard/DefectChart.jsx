import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS = ['#6366f1', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']

export default function DefectChart({ data }) {
  if (!data) return null
  const rows = Object.entries(data).map(([name, count]) => ({ name, count }))
  if (rows.length === 0) return null

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart 
          data={rows} 
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          className="bg-gradient-to-br from-blue-50 to-purple-50"
        >
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            allowDecimals={false} 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#fff',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
            formatter={(value) => [`${value} incidents`, 'Count']}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]} animationDuration={500}>
            {rows.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
