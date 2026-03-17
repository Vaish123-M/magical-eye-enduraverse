import { useMemo, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const PIE_COLORS = ['#10b981', '#ef4444']

const makeDefects = (seed = 0) => ({
  crack: 8 + seed,
  scratch: 12 + Math.floor(seed / 2),
  misalignment: 5 + (seed % 3),
  missing_part: 4 + Math.floor(seed / 3),
})

export default function AnalyticsSection() {
  const [simCount, setSimCount] = useState(0)
  const [okCount, setOkCount] = useState(86)
  const [notOkCount, setNotOkCount] = useState(14)
  const [defects, setDefects] = useState(makeDefects(0))

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

  return (
    <section id="dashboard" className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">Dashboard</p>
          <h2 className="mt-2 text-3xl font-black text-white md:text-4xl">Analytics Snapshot</h2>
        </div>
        <button
          onClick={simulate}
          className="w-fit rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:scale-105"
        >
          Simulate Inspection
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
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
