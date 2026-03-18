import { Camera, Brain, BadgeCheck, BellRing, Database } from 'lucide-react'

const STEPS = [
  {
    icon: Camera,
    title: 'Hardware Scan',
    text: 'A camera captures each item surface with guided lighting.',
  },
  {
    icon: Brain,
    title: 'AI Analysis',
    text: 'The system analyzes the image and estimates defect confidence.',
  },
  {
    icon: BadgeCheck,
    title: 'Traceable Classification',
    text: 'Each item is marked Pass or Needs Review with supporting details.',
  },
  {
    icon: BellRing,
    title: 'Operator Alert',
    text: 'Porosity detections trigger alert cards for immediate quality response.',
  },
  {
    icon: Database,
    title: 'Factory Records',
    text: 'Inspection history is persisted for line analytics and part-level traceability.',
  },
]

export default function WorkflowSection() {
  return (
    <section id="workflow" className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">Workflow</p>
        <h2 className="mt-2 text-3xl font-black text-white md:text-4xl">Inspection Flowchart</h2>
      </div>

      <div className="grid gap-5 md:grid-cols-5">
        {STEPS.map((step, idx) => {
          const Icon = step.icon
          return (
            <div
              key={step.title}
              className="relative group transition-transform duration-500 ease-out hover:scale-105"
              style={{ zIndex: 10 - idx }}
            >
              <div
                className="rounded-2xl border border-amber-200/40 bg-gradient-to-br from-amber-50 via-cyan-50 to-indigo-100 p-5 shadow-2xl backdrop-blur-md transition-all duration-500 hover:border-cyan-300/60 hover:shadow-cyan-400/25"
                style={{
                  boxShadow: '0 6px 32px 0 rgba(16, 185, 129, 0.08), 0 1.5px 8px 0 rgba(251, 191, 36, 0.08)',
                  animation: `fadeInUp 0.7s cubic-bezier(.23,1.01,.32,1) ${idx * 0.12 + 0.1}s both`,
                }}
              >
                <div className="mb-3 inline-flex rounded-lg bg-gradient-to-br from-cyan-400/30 to-amber-400/30 p-2 text-cyan-900 shadow">
                  <Icon size={22} />
                </div>
                <h3 className="text-sm font-bold text-cyan-900">{step.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{step.text}</p>
              </div>

              {idx < STEPS.length - 1 && (
                <div className="pointer-events-none absolute -right-8 top-1/2 hidden w-14 -translate-y-1/2 md:block">
                  <svg viewBox="0 0 100 24" className="h-6 w-full overflow-visible">
                    <defs>
                      <linearGradient id={`arrow-gradient-${idx}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                      <marker id={`arrow-head-${idx}`} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                        <polygon points="0 0, 7 3.5, 0 7" fill="#06b6d4" />
                      </marker>
                    </defs>
                    <path
                      d="M2 12 H94"
                      stroke={`url(#arrow-gradient-${idx})`}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      markerEnd={`url(#arrow-head-${idx})`}
                      className="workflow-connector"
                      style={{
                        strokeDasharray: 120,
                        strokeDashoffset: 120,
                        animation: `dashIn 1s cubic-bezier(.23,1.01,.32,1) ${idx * 0.18 + 0.3}s forwards`,
                      }}
                    />
                  </svg>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(32px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes dashIn {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </section>
  )
}
