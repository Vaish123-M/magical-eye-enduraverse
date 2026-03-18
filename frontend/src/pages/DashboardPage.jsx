import { useEffect, useState } from 'react'
import { useInspectionStore } from '@/store'
import { getDashboardStats, getDashboardTrends, getRecentInspections, simulateInspection } from '@/services/api'
import StatCard      from '@/components/Dashboard/StatCard'
import DefectChart   from '@/components/Dashboard/DefectChart'
import TrendLineChart from '@/components/Dashboard/TrendLineChart'
import InspectionRow from '@/components/InspectionPanel/InspectionRow'

export default function DashboardPage() {
  const refreshDashboard = useInspectionStore(state => state.refreshDashboard)
  const [stats,  setStats]  = useState(null)
  const [trends, setTrends] = useState([])
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)
  const [simLoading, setSimLoading] = useState(false)

  const handleSimulate = async () => {
    setSimLoading(true)
    try {
      await simulateInspection()
      // Refresh dashboard data after simulation
      const [statsRes, trendsRes, recentRes] = await Promise.all([
        getDashboardStats(),
        getDashboardTrends(14),
        getRecentInspections(8),
      ])
      setStats(statsRes.data)
      setTrends(trendsRes.data)
      setRecent(recentRes.data)
    } finally {
      setSimLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    const load = async ({ withLoading = false } = {}) => {
      if (withLoading) setLoading(true)
      try {
        const [statsRes, trendsRes, recentRes] = await Promise.all([
          getDashboardStats(),
          getDashboardTrends(14),
          getRecentInspections(8),
        ])
        if (!mounted) return
        setStats(statsRes.data)
        setTrends(trendsRes.data)
        setRecent(recentRes.data)
      } finally {
        if (withLoading && mounted) setLoading(false)
      }
    }

    load({ withLoading: true })

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        load()
      }
    }, 10000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [refreshDashboard])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Hero Section + Simulate Button */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3 mb-2 md:mb-0">
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
          <button
            onClick={handleSimulate}
            disabled={simLoading}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition disabled:opacity-60 disabled:cursor-not-allowed"
            title="Simulate an inspection"
          >
            {simLoading ? (
              <span className="flex items-center"><svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>Simulating...</span>
            ) : (
              <span className="flex items-center"><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>Simulate Inspection</span>
            )}
          </button>
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

            {/* Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="rounded-2xl bg-gradient-to-br from-amber-50 via-cyan-50 to-indigo-100 border border-indigo-100 shadow-lg p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">Failure Rate</p>
                <p className="text-3xl font-bold text-indigo-700 mt-1">{stats.failure_rate ?? 0}%</p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-rose-50 via-amber-50 to-red-100 border border-red-100 shadow-lg p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-red-500">Top Defect</p>
                <p className="text-2xl font-bold text-red-700 mt-2">{stats.most_frequent_defect || 'None'}</p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-100 border border-emerald-100 shadow-lg p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500">Realtime Feed</p>
                <p className="text-2xl font-bold text-emerald-700 mt-2">Auto-refresh 10s</p>
              </div>
            </div>

            {/* Trend Chart */}
            {trends.length > 0 && (
              <div className="rounded-2xl bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-100 shadow-lg p-6 mb-8 border border-blue-100/40">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="text-2xl">📉</span>
                  Failure Trend (14 days)
                </h2>
                <TrendLineChart data={trends} />
              </div>
            )}

            {/* Defect Chart */}
            {stats.defect_breakdown && Object.keys(stats.defect_breakdown).length > 0 && (
              <div className="rounded-2xl bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-100 shadow-lg p-6 mb-8 border border-blue-100/40">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  Defect Distribution
                </h2>
                <DefectChart data={stats.defect_breakdown} />
              </div>
            )}

            {/* Recent Inspections Section */}
            <section className="rounded-2xl bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-100 shadow-lg overflow-hidden border border-blue-100/40">
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
