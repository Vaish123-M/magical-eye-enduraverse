import { useEffect, useMemo, useState } from 'react'

import { getInspections } from '@/services/api'

export default function HistorySection() {
  const [records, setRecords] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [partFilter, setPartFilter] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    getInspections({ skip: 0, limit: 40, part_id: partFilter || undefined })
      .then((r) => setRecords(r.data || []))
      .finally(() => setLoading(false))
  }, [partFilter])

  const filtered = useMemo(() => {
    if (filter === 'ALL') return records
    return records.filter((r) => r.status === filter)
  }, [records, filter])

  const FILTERS = [
    { value: 'ALL', label: 'All' },
    { value: 'OK', label: 'Pass' },
    { value: 'NOT_OK', label: 'Needs Review' },
  ]

  return (
    <section id="history" className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">History</p>
          <h2 className="mt-2 text-3xl font-black text-white md:text-4xl">Inspection Records</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            value={partFilter}
            onChange={(e) => setPartFilter(e.target.value)}
            placeholder="Filter by Item ID"
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs text-white placeholder:text-slate-300"
          />
          <div className="inline-flex gap-2 rounded-xl border border-white/20 bg-white/10 p-1 backdrop-blur">
            {FILTERS.map((v) => (
              <button
                key={v.value}
                onClick={() => setFilter(v.value)}
                className={
                  `rounded-lg px-3 py-1.5 text-xs font-semibold transition ` +
                  (filter === v.value ? 'bg-cyan-500 text-white' : 'text-slate-200 hover:bg-white/10')
                }
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {!loading && filtered.map((r) => (
          <div key={r.id} className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-cyan-300/50 hover:shadow-lg hover:shadow-cyan-900/20">
            <p className="text-xs font-semibold text-slate-300">{new Date(r.created_at).toLocaleString()}</p>
            <p className="mt-2 text-sm font-bold text-white">Item: {r.part_id || 'Unlabeled'}</p>
            <p className="mt-1 text-xs text-slate-200">Reference: {r.product_id || r.id.slice(0, 8)}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className={
                `rounded-full px-2 py-1 text-xs font-bold ` +
                (r.status === 'OK' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-red-500/20 text-red-200')
              }>
                {r.status === 'OK' ? 'Pass' : 'Needs Review'}
              </span>
              <span className="text-xs text-slate-300">{Math.round((r.confidence || 0) * 100)}%</span>
            </div>
          </div>
        ))}

        {!loading && filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-white/30 bg-white/5 p-8 text-center text-slate-300">
            No records for selected filter.
          </div>
        )}
      </div>
    </section>
  )
}
