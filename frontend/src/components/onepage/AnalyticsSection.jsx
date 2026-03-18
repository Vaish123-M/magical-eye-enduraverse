import { useEffect, useMemo, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import toast from 'react-hot-toast'

import { ingestDeviceFrame } from '@/services/api'

const PIE_COLORS = ['#10b981', '#ef4444']

const makeDefects = (seed = 0) => ({
  porosity: 12 + seed,
  crack: 8 + Math.floor(seed / 2),
  surface_void: 5 + (seed % 3),
})

export default function AnalyticsSection() {
  const [simCount, setSimCount] = useState(0)
  const [okCount, setOkCount] = useState(86)
  const [notOkCount, setNotOkCount] = useState(14)
  const [defects, setDefects] = useState(makeDefects(0))
  const [deviceLoading, setDeviceLoading] = useState(false)
  const [health, setHealth] = useState({
    deviceId: 'esp32-cam-laser',
    online: true,
    latencyMs: 148,
    fps: 12,
    lastScan: 'No scan yet',
  })

  useEffect(() => {
    const t = setInterval(() => {
      setHealth((prev) => ({
        ...prev,
        online: true,
        latencyMs: Math.max(70, Math.min(220, prev.latencyMs + Math.floor(Math.random() * 25) - 12)),
        fps: Math.max(8, Math.min(18, prev.fps + (Math.random() > 0.5 ? 1 : -1))),
      }))
    }, 4500)

    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('magical-eye:device-health', { detail: health }))
  }, [health])

  const pieData = useMemo(
    () => [
      { name: 'OK', value: okCount },
      { name: 'NOT_OK', value: notOkCount },
    ],
    [okCount, notOkCount]
  )

  const barData = useMemo(
    () => Object.entries(defects).map(([name, value]) => ({ name, value })),
    [defects]
  )

  const simulate = () => {
    const next = simCount + 1
    setSimCount(next)
    setOkCount((p) => p + (next % 2 === 0 ? 4 : 2))
    setNotOkCount((p) => p + (next % 2 === 0 ? 1 : 3))
    setDefects(makeDefects(next * 2))
  }

  const simulateDeviceInspection = async () => {
    setDeviceLoading(true)
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 320
      canvas.height = 240
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas unavailable')
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = '#38bdf8'
      ctx.lineWidth = 4
      ctx.strokeRect(16, 16, 288, 208)
      ctx.fillStyle = '#f43f5e'
      ctx.beginPath()
      ctx.arc(170, 120, 28, 0, Math.PI * 2)
      ctx.fill()

      const imageBase64 = canvas.toDataURL('image/jpeg', 0.9)
      const partId = `PART-SIM-${Date.now().toString().slice(-5)}`
      const sourceDevice = Math.random() > 0.5 ? 'esp32-cam-laser' : 'raspberry-pi-led'
      await ingestDeviceFrame({ image_base64: imageBase64, part_id: partId, device_id: sourceDevice })
      setHealth((prev) => ({
        ...prev,
        deviceId: sourceDevice,
        online: true,
        latencyMs: 90 + Math.floor(Math.random() * 70),
        fps: 10 + Math.floor(Math.random() * 6),
        lastScan: new Date().toLocaleTimeString(),
      }))
      toast.success(`Scan complete for ${partId}`)
      simulate()
    } catch {
      setHealth((prev) => ({ ...prev, online: false }))
      toast.error('Live scan failed. Please try again.')
    } finally {
      setDeviceLoading(false)
    }
  }

  return (
    <section id="dashboard" className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">Dashboard</p>
          <h2 className="mt-2 text-3xl font-black text-white md:text-4xl">Analytics Snapshot</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={simulate}
            className="w-fit rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:scale-105"
          >
            Demo Inspection
          </button>
          <button
            onClick={simulateDeviceInspection}
            disabled={deviceLoading}
            className="w-fit rounded-lg border border-cyan-300/60 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-100 transition hover:scale-105 disabled:opacity-50"
          >
            {deviceLoading ? 'Running Live Scan...' : 'Run Live Scan'}
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 p-5 backdrop-blur-md lg:col-span-2">
          <h3 className="text-sm font-bold text-white">System Status</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-lg border border-white/15 bg-slate-900/40 p-3">
              <p className="text-[11px] uppercase tracking-wider text-slate-300">Camera</p>
              <p className="mt-1 text-sm font-semibold text-white">{health.deviceId}</p>
            </div>
            <div className="rounded-lg border border-white/15 bg-slate-900/40 p-3">
              <p className="text-[11px] uppercase tracking-wider text-slate-300">Status</p>
              <p className={`mt-1 text-sm font-semibold ${health.online ? 'text-emerald-300' : 'text-rose-300'}`}>
                {health.online ? 'Online' : 'Offline'}
              </p>
            </div>
            <div className="rounded-lg border border-white/15 bg-slate-900/40 p-3">
              <p className="text-[11px] uppercase tracking-wider text-slate-300">Latency</p>
              <p className="mt-1 text-sm font-semibold text-white">{health.latencyMs} ms</p>
            </div>
            <div className="rounded-lg border border-white/15 bg-slate-900/40 p-3">
              <p className="text-[11px] uppercase tracking-wider text-slate-300">Frame Rate</p>
              <p className="mt-1 text-sm font-semibold text-white">{health.fps} FPS</p>
            </div>
            <div className="rounded-lg border border-white/15 bg-slate-900/40 p-3">
              <p className="text-[11px] uppercase tracking-wider text-slate-300">Last Scan</p>
              <p className="mt-1 text-sm font-semibold text-white">{health.lastScan}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">
          <h3 className="mb-4 text-sm font-bold text-white">Pass vs Fail</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={65} outerRadius={95} paddingAngle={4}>
                {pieData.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">
          <h3 className="mb-4 text-sm font-bold text-white">Defect Types</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" />
              <XAxis dataKey="name" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
              <YAxis tick={{ fill: '#cbd5e1', fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#60a5fa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}
