import { useEffect, useState } from 'react'
import { getDashboardStats, getRecentInspections } from '@/services/api'
import StatCard      from '@/components/Dashboard/StatCard'
import DefectChart   from '@/components/Dashboard/DefectChart'
import InspectionRow from '@/components/InspectionPanel/InspectionRow'

export default function DashboardPage() {
  const [stats,  setStats]  = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getDashboardStats().then(r => setStats(r.data)),
      getRecentInspections(8).then(r => setRecent(r.data))
    ]).finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Hero Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Real-time inspection metrics and insights</p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
            </div>
            <span className="ml-3 text-gray-600 text-lg">Loading dashboard...</span>
          </div>
        )}

        {!loading && stats && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total Inspected"  value={stats.total} icon="📊"         />
              <StatCard label="Passed (OK)"       value={stats.ok}     color="text-emerald-600" icon="✓" />
              <StatCard label="Defective"         value={stats.not_ok} color="text-red-600" icon="⚠" />
              <StatCard label="Pass Rate"         value={`${stats.pass_rate}%`} color="text-blue-600" icon="📈" />
            </div>

            {/* Defect Chart */}
            {stats.defect_breakdown && stats.defect_breakdown.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  Defect Distribution
                </h2>
                <DefectChart data={stats.defect_breakdown} />
              </div>
            )}

            {/* Recent Inspections Section */}
            <section className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">⏱️</span>
                  Recent Inspections
                </h2>
              </div>
              {recent.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl">📭</span>
                  </div>
                  <p className="text-gray-600 text-lg font-medium">No inspections yet</p>
                  <p className="text-gray-500 text-sm mt-1">Start by running your first inspection</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {recent.map(r => (
                    <div key={r.id} className="hover:bg-gray-50 transition-colors">
                      <InspectionRow record={r} />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}
