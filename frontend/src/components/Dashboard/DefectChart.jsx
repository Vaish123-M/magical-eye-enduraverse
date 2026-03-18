import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS = [
  'url(#bar-gradient-blue)',
  'url(#bar-gradient-red)',
  'url(#bar-gradient-yellow)',
  'url(#bar-gradient-green)',
  'url(#bar-gradient-cyan)',
  'url(#bar-gradient-purple)'
]

export default function DefectChart({ data }) {
  if (!data) return null
  const rows = Object.entries(data).map(([name, count]) => ({ name, count }))
  if (rows.length === 0) return null

  return (
    <div className="rounded-2xl bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-100 shadow-lg border border-blue-100/40 overflow-hidden">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart 
          data={rows} 
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="bar-gradient-blue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#a5b4fc" stopOpacity={0.7} />
            </linearGradient>
            <linearGradient id="bar-gradient-red" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#fca5a5" stopOpacity={0.7} />
            </linearGradient>
            <linearGradient id="bar-gradient-yellow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#fde68a" stopOpacity={0.7} />
            </linearGradient>
            <linearGradient id="bar-gradient-green" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#6ee7b7" stopOpacity={0.7} />
            </linearGradient>
            <linearGradient id="bar-gradient-cyan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#bae6fd" stopOpacity={0.7} />
            </linearGradient>
            <linearGradient id="bar-gradient-purple" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#ddd6fe" stopOpacity={0.7} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 13, fill: '#6366f1', fontWeight: 600 }}
            axisLine={{ stroke: '#e0e7ff' }}
          />
          <YAxis 
            allowDecimals={false} 
            tick={{ fontSize: 13, fill: '#6366f1', fontWeight: 600 }}
            axisLine={{ stroke: '#e0e7ff' }}
          />
          <Tooltip 
            contentStyle={{
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
              border: '2px solid #a5b4fc',
              borderRadius: '12px',
              boxShadow: '0 6px 24px rgba(99,102,241,0.10)'
            }}
            cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }}
            formatter={(value) => [`${value} incidents`, 'Count']}
          />
          <Bar dataKey="count" radius={[12, 12, 0, 0]} animationDuration={900} isAnimationActive>
            {rows.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
