import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { getAlerts, acknowledgeAlert } from '@/services/api'

const severityStyles = {
  high: 'border-red-300/50 bg-red-500/10',
  medium: 'border-amber-300/50 bg-amber-500/10',
  low: 'border-cyan-300/50 bg-cyan-500/10',
}

export default function AlertsSection() {
  const [alerts, setAlerts] = useState([])

  const load = async () => {
    const r = await getAlerts()
    setAlerts(r.data || [])
  }

  useEffect(() => {
    load()
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') load()
    }, 8000)
    return () => clearInterval(t)
  }, [])

  const acknowledge = async (id) => {
    await acknowledgeAlert(id, { acknowledged_by: 'operator' })
    toast.success('Alert acknowledged')
    load()
  }

  return (
    <section id="alerts" className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">Alerts</p>
        <h2 className="mt-2 text-3xl font-black text-white md:text-4xl">Live Alert Stream</h2>
      </div>

      <div className="space-y-4">
        {alerts.map((a) => {
          const sev = String(a.severity || 'high').toLowerCase()
          const cls = severityStyles[sev] || severityStyles.high
          const active = !a.acknowledged
          return (
            <div
              key={a.id}
              className={`rounded-2xl border p-4 backdrop-blur-md ${cls} ${active ? 'animate-pulse-soft' : ''}`}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{a.message}</p>
                  <p className="mt-1 text-xs text-slate-300">{new Date(a.created_at).toLocaleString()} • {a.severity}</p>
                </div>
                {!a.acknowledged && (
                  <button
                    onClick={() => acknowledge(a.id)}
                    className="rounded-lg bg-red-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-600"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {alerts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/30 bg-white/5 p-8 text-center text-slate-300">
            No active alerts.
          </div>
        )}
      </div>
    </section>
  )
}
