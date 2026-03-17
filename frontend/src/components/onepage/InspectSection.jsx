import InspectPage from '@/pages/InspectPage'

export default function InspectSection() {
  return (
    <section id="inspect" className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">Inspect</p>
        <h2 className="mt-2 text-3xl font-black text-white md:text-4xl">Live Inspection Panel</h2>
      </div>

      <div className="rounded-3xl border border-cyan-200/30 bg-white/10 p-2 shadow-2xl shadow-cyan-900/20 backdrop-blur-xl">
        <InspectPage embedded />
      </div>
    </section>
  )
}
