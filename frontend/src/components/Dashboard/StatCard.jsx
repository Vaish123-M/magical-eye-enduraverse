export default function StatCard({ label, value, color = 'text-gray-900', icon = '📊' }) {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{label}</p>
          </div>
          <span className="text-3xl">{icon}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <p className={`text-4xl font-bold ${color}`}>{value ?? '—'}</p>
        </div>
      </div>
      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
    </div>
  )
}
