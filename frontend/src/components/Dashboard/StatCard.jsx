import React from 'react'

const ICON_BG = {
  '📊': 'bg-gradient-to-br from-blue-400 to-cyan-500',
  '✓': 'bg-gradient-to-br from-emerald-400 to-green-500',
  '⚠': 'bg-gradient-to-br from-rose-400 to-red-500',
  '📈': 'bg-gradient-to-br from-purple-400 to-blue-500',
}

export default function StatCard({ label, value, color = 'text-gray-900', icon = '📊' }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-white via-blue-50 to-purple-100 shadow-lg border border-blue-100/40 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
      <div className="p-6 flex flex-col gap-2">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold group-hover:text-blue-700 transition">{label}</p>
          <span className={`w-10 h-10 flex items-center justify-center rounded-xl text-2xl shadow-md ${ICON_BG[icon] || 'bg-blue-400'} group-hover:scale-110 transition-transform`}>{icon}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <p className={`text-4xl font-extrabold ${color} group-hover:scale-105 transition-transform animate-fadeIn`}>{value ?? '—'}</p>
        </div>
      </div>
      <div className="h-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 animate-gradient-x"></div>
    </div>
  )
}
