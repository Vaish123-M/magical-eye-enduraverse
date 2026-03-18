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
            <div key={step.title} className="relative">
              <div className="group rounded-2xl border border-white/20 bg-white/10 p-5 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-[1.03] hover:border-cyan-300/50 hover:shadow-cyan-400/25">
                <div className="mb-3 inline-flex rounded-lg bg-gradient-to-br from-cyan-500/30 to-indigo-500/30 p-2 text-cyan-100">
                  <Icon size={18} />
                </div>
                <h3 className="text-sm font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">{step.text}</p>
              </div>

              {idx < STEPS.length - 1 && (
                <div className="pointer-events-none absolute -right-8 top-1/2 hidden w-14 -translate-y-1/2 md:block">
                  <svg viewBox="0 0 100 24" className="h-6 w-full overflow-visible">
                    <defs>
                      <marker id={`arrow-head-${idx}`} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                        <polygon points="0 0, 7 3.5, 0 7" fill="#67e8f9" />
                      </marker>
                    </defs>
                    <path
                      d="M2 12 H94"
                      stroke="#67e8f9"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      markerEnd={`url(#arrow-head-${idx})`}
                      className="workflow-connector"
                    />
                  </svg>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
