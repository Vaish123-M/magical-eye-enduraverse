import { useEffect, useMemo, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import toast from 'react-hot-toast'

import { ingestDeviceFrame } from '@/services/api'

const PIE_COLORS = [
  'url(#pie-green)',
  'url(#pie-red)'
]

const makeDefects = (seed = 0) => ({
  porosity: 12 + seed,
  surface_void: 5 + (seed % 3),
  crack: 8 + Math.floor(seed / 2),
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
            className="w-fit rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-2 text-sm font-bold text-white shadow transition-all duration-200 hover:scale-105 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 active:scale-98"
            tabIndex={0}
            type="button"
          >
            Demo Inspection
          </button>
          <button
            onClick={simulateDeviceInspection}
            disabled={deviceLoading}
            className="w-fit rounded-lg border border-cyan-300/60 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-100 shadow transition-all duration-200 hover:scale-105 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 active:scale-98 disabled:opacity-50"
            tabIndex={0}
            type="button"
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


        <div className="rounded-2xl border border-emerald-300/20 bg-gradient-to-br from-emerald-50 via-amber-50 to-rose-100 p-5 shadow-xl backdrop-blur-md relative overflow-visible">
          <h3 className="mb-4 text-sm font-bold text-emerald-900">Pass vs Fail</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <defs>
                <radialGradient id="pie-green" cx="50%" cy="50%" r="80%">
                  <stop offset="0%" stopColor="#a7f3d0" />
                  <stop offset="100%" stopColor="#10b981" />
                </radialGradient>
                <radialGradient id="pie-red" cx="50%" cy="50%" r="80%">
                  <stop offset="0%" stopColor="#fecaca" />
                  <stop offset="100%" stopColor="#ef4444" />
                </radialGradient>
              </defs>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                isAnimationActive={true}
                animationDuration={1200}
                animationEasing="ease-out"
                stroke="#fff6"
                strokeWidth={2}
                cornerRadius={12}
              >
                {pieData.map((entry, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'rgba(255,255,255,0.95)', borderRadius: 12, color: '#334155', fontWeight: 600 }}
                itemStyle={{ color: '#334155' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute right-6 top-6 flex flex-col gap-2 bg-white/80 rounded-xl px-3 py-2 shadow-md">
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full" style={{ background: 'radial-gradient(circle at 60% 40%, #a7f3d0, #10b981)' }}></span>
              <span className="text-xs font-semibold text-emerald-700">OK</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full" style={{ background: 'radial-gradient(circle at 60% 40%, #fecaca, #ef4444)' }}></span>
              <span className="text-xs font-semibold text-rose-700">NOT_OK</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-300/20 bg-gradient-to-br from-amber-50 via-cyan-50 to-indigo-100 p-5 shadow-xl backdrop-blur-md">
          <h3 className="mb-4 text-sm font-bold text-amber-900">Defect Types</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" />
              <XAxis dataKey="name" tick={{ fill: '#334155', fontSize: 12, fontWeight: 600 }} />
              <YAxis tick={{ fill: '#334155', fontSize: 12, fontWeight: 600 }} />
              <Tooltip
                contentStyle={{ background: 'rgba(255,255,255,0.95)', borderRadius: 12, color: '#334155', fontWeight: 600 }}
                itemStyle={{ color: '#334155' }}
              />
              <Bar
                dataKey="value"
                radius={[12, 12, 0, 0]}
                fill="url(#bar-blue)"
                isAnimationActive={true}
                animationDuration={1200}
                animationEasing="ease-out"
              />
              <defs>
                <linearGradient id="bar-blue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}
