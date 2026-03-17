import { ArrowDownRight, Radar } from 'lucide-react'

export default function HeroSection({ onStart }) {
  return (
    <section id="home" className="relative overflow-hidden px-4 pb-24 pt-20 md:px-6 md:pt-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.25),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(99,102,241,0.22),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

      <div className="relative mx-auto max-w-6xl rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl shadow-cyan-900/20 backdrop-blur-xl md:p-12">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-200/30 bg-cyan-400/15 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-cyan-100">
          <Radar size={14} />
          AI Defect Detection Demo
        </div>

        <h1 className="max-w-3xl text-4xl font-black leading-tight text-white md:text-6xl">
          MagicalEye: Smart Manufacturing Quality in One Scroll
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-200 md:text-lg">
          Capture product images, run AI inference, classify defects, trigger alerts, and review history with a modern real-time interface built for your hackathon demo.
        </p>

        <button
          onClick={onStart}
          className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-indigo-900/30 transition-all hover:scale-105 hover:shadow-cyan-500/30"
        >
          Explore Workflow
          <ArrowDownRight size={16} className="transition-transform group-hover:translate-x-1 group-hover:translate-y-1" />
        </button>
      </div>
    </section>
  )
}
