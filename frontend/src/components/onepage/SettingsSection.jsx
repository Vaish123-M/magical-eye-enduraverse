export default function SettingsSection() {
  return (
    <section id="settings" className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">Settings</p>
        <h2 className="mt-2 text-3xl font-black text-white md:text-4xl">Configuration</h2>
      </div>

      <div className="mb-6 rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">
        <h3 className="text-sm font-bold text-white">Low-Cost Smart Glass Architecture</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-5">
          {[
            'ESP32-CAM / Raspberry Pi',
            'LED + Laser Illumination',
            'FastAPI Ingestion API',
            'ONNX Porosity Inference',
            'Part Traceability DB',
          ].map((node, idx, arr) => (
            <div key={node} className="relative rounded-xl border border-cyan-200/25 bg-cyan-400/10 p-3 text-xs font-semibold text-cyan-100">
              {node}
              {idx < arr.length - 1 && <span className="absolute -right-2 top-1/2 hidden -translate-y-1/2 text-cyan-300 md:block">➜</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">
        <h3 className="text-sm font-bold text-white">Prototype Cost Breakdown (Approx.)</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {[
            { item: 'ESP32-CAM module', cost: '$8' },
            { item: 'Raspberry Pi (optional)', cost: '$35' },
            { item: 'LED + laser pointer module', cost: '$6' },
            { item: 'Mount/Smart-glass frame', cost: '$12' },
          ].map((row) => (
            <div key={row.item} className="rounded-xl border border-emerald-200/20 bg-emerald-400/10 p-3">
              <p className="text-xs text-emerald-100">{row.item}</p>
              <p className="mt-2 text-base font-black text-white">{row.cost}</p>
            </div>
          ))}
        </div>
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
