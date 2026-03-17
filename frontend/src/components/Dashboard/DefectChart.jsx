import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS = ['#6366f1', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']

export default function DefectChart({ data }) {
  if (!data) return null
  const rows = Object.entries(data).map(([name, count]) => ({ name, count }))
  if (rows.length === 0) return null

  return (
    <div className="bg-white rounded-xl shadow-sm border p-5">
      <h2 className="text-sm font-semibold text-gray-600 mb-4">Defect Breakdown</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={rows} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {rows.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
