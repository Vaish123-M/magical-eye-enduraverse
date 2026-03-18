import React from 'react'

export default function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-100 shadow-lg border border-blue-100/40 p-6 transition-all duration-300 hover:shadow-2xl ${className}`}>
      {children}
    </div>
  )
}
