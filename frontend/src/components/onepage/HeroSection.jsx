import { ArrowDownRight, Cpu, Radar, ScanLine, ServerCog, ShieldCheck } from 'lucide-react'

export default function HeroSection({ onStart }) {
  const pipeline = [
    { icon: ScanLine, label: 'ESP32/RPi Scan' },
    { icon: Cpu, label: 'LED + Laser Assist' },
    { icon: ServerCog, label: 'FastAPI + ONNX' },
    { icon: ShieldCheck, label: 'Porosity Decision' },
  ]

  return (
    <section id="home" className="relative overflow-hidden px-4 pb-24 pt-20 md:px-6 md:pt-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.25),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(99,102,241,0.22),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

      <div className="relative mx-auto max-w-6xl rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl shadow-cyan-900/20 backdrop-blur-xl md:p-12">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-200/30 bg-cyan-400/15 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-cyan-100">
          <Radar size={14} />
          Smart-Factory Glass Prototype
        </div>

        <h1 className="max-w-3xl text-4xl font-black leading-tight text-white md:text-6xl">
          MagicalEye: ESP32 + AI Porosity Detection for Factory Parts
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-200 md:text-lg">
          Laser and LED-assisted image capture from ESP32-CAM or Raspberry Pi streams into this dashboard, where ONNX inference flags porosity and surface defects on aluminum and other industrial components in real time.
        </p>

        <button
          onClick={onStart}
          className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-indigo-900/30 transition-all hover:scale-105 hover:shadow-cyan-500/30"
        >
          Explore Workflow
          <ArrowDownRight size={16} className="transition-transform group-hover:translate-x-1 group-hover:translate-y-1" />
        </button>

        <div className="mt-8 rounded-2xl border border-cyan-200/25 bg-cyan-400/10 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-100">Hardware Pipeline</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {pipeline.map((step, idx) => {
              const Icon = step.icon
              return (
                <div
                  key={step.label}
                  className="relative rounded-xl border border-white/20 bg-slate-900/40 p-3 text-xs font-semibold text-slate-100"
                >
                  <div className="mb-2 inline-flex rounded-md bg-cyan-400/20 p-2 text-cyan-100">
                    <Icon size={14} />
                  </div>
                  <p>{step.label}</p>
                  {idx < pipeline.length - 1 && (
                    <span className="absolute -right-2 top-1/2 hidden -translate-y-1/2 text-cyan-300 lg:block">→</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
