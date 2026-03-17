import { useEffect, useState } from 'react'
import { getDashboardStats, getRecentInspections } from '@/services/api'
import StatCard      from '@/components/Dashboard/StatCard'
import DefectChart   from '@/components/Dashboard/DefectChart'
import InspectionRow from '@/components/InspectionPanel/InspectionRow'

export default function DashboardPage() {
  const [stats,  setStats]  = useState(null)
  const [recent, setRecent] = useState([])

  useEffect(() => {
    getDashboardStats().then(r => setStats(r.data))
    getRecentInspections(8).then(r => setRecent(r.data))
  }, [])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Inspected"  value={stats.total}                           />
          <StatCard label="Passed (OK)"       value={stats.ok}     color="text-ok"          />
          <StatCard label="Defective"         value={stats.not_ok} color="text-notok"       />
          <StatCard label="Pass Rate"         value={`${stats.pass_rate}%`}                 />
        </div>
      )}

      {stats && <DefectChart data={stats.defect_breakdown} />}

      <section>
        <h2 className="text-lg font-semibold mb-3">Recent Inspections</h2>
        <div className="space-y-2">
          {recent.map(r => <InspectionRow key={r.id} record={r} />)}
        </div>
      </section>
    </div>
  )
}
