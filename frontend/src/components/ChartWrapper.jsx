

import React from 'react'

export default function ChartWrapper({ title, children }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-100 shadow-lg border border-blue-100/40 p-6 mb-8">
      {title && <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">{title}</h2>}
      {children}
    </div>
  )
}
