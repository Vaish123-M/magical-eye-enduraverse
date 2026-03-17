export default function SettingsSection() {
  return (
    <section id="settings" className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">Settings</p>
        <h2 className="mt-2 text-3xl font-black text-white md:text-4xl">Configuration</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">
          <p className="text-xs uppercase tracking-widest text-slate-300">Backend API</p>
          <p className="mt-2 text-sm font-semibold text-white">http://127.0.0.1:8000</p>
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">
          <p className="text-xs uppercase tracking-widest text-slate-300">Storage</p>
          <p className="mt-2 text-sm font-semibold text-white">Local / S3 abstraction enabled</p>
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">
          <p className="text-xs uppercase tracking-widest text-slate-300">Cloud Sync</p>
          <p className="mt-2 text-sm font-semibold text-white">Offline-first sync pipeline ready</p>
        </div>
      </div>
    </section>
  )
}
