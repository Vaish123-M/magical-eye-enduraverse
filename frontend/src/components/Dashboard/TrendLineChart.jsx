import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function TrendLineChart({ data }) {
  if (!data || data.length === 0) return null

  const rows = data.map((row) => ({
    ...row,
    shortDate: row.date?.slice(5) || row.date,
  }))

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={rows} margin={{ top: 20, right: 24, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="shortDate" tick={{ fill: '#6b7280', fontSize: 12 }} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              borderRadius: '10px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
            }}
          />
          <Line type="monotone" dataKey="failures" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="failure_rate" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
