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

        {/* Explore Workflow button removed as requested */}

        {/* Hardware Pipeline section removed as requested */}
      </div>
    </section>
  )
}
