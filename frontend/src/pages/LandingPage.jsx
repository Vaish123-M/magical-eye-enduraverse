import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

function Counter({ to, suffix = '', delay = 0 }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        observer.disconnect()
        const startTime = Date.now() + delay
        const duration = 2000
        const tick = () => {
          const elapsed = Date.now() - startTime
          if (elapsed < 0) { requestAnimationFrame(tick); return }
          const progress = Math.min(elapsed / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setVal(Math.floor(eased * to))
          if (progress < 1) requestAnimationFrame(tick)
        }
        setTimeout(() => requestAnimationFrame(tick), delay)
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [to, delay])
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

const STEPS = [
  {
    icon: '📷', step: '01', title: 'Capture Image',
    desc: 'Upload or stream a live camera feed of any manufactured component for analysis.',
    colorFrom: '#6366f1', colorTo: '#818cf8', glow: 'rgba(99,102,241,0.4)'
  },
  {
    icon: '🔬', step: '02', title: 'AI Analysis',
    desc: 'MobileNetV3 model processes the image in milliseconds, scanning for anomalies.',
    colorFrom: '#8b5cf6', colorTo: '#a78bfa', glow: 'rgba(139,92,246,0.4)'
  },
  {
    icon: '🏷️', step: '03', title: 'Classify Result',
    desc: 'Components labeled OK or NOT_OK with exact defect type identified.',
    colorFrom: '#10b981', colorTo: '#34d399', glow: 'rgba(16,185,129,0.4)'
  },
  {
    icon: '☁️', step: '04', title: 'Store & Sync',
    desc: 'Records saved with full audit trail and synced to cloud storage automatically.',
    colorFrom: '#06b6d4', colorTo: '#22d3ee', glow: 'rgba(6,182,212,0.4)'
  },
  {
    icon: '👁️', step: '05', title: 'Human Review',
    desc: 'Experts review AI decisions, override results, and continuously improve the model.',
    colorFrom: '#f59e0b', colorTo: '#fbbf24', glow: 'rgba(245,158,11,0.4)'
  },
]

const FEATURES = [
  {
    icon: '⚡',
    title: 'Fast & Automated',
    desc: 'Real-time AI inference under 200ms. Inspect thousands of components daily with zero manual effort.',
    accent: '#f59e0b',
  },
  {
    icon: '🎯',
    title: 'High Precision',
    desc: 'MobileNetV3 CNN classifier trained on manufacturing datasets delivering industry-grade accuracy.',
    accent: '#6366f1',
  },
  {
    icon: '🌐',
    title: 'Cloud-Ready',
    desc: 'Fully Dockerized. Deploy on-premise, AWS, GCP, or Azure instantly with a single command.',
    accent: '#06b6d4',
  },
  {
    icon: '🔒',
    title: 'Audit Trail',
    desc: 'Every inspection logged with timestamps, operator overrides, and confidence scores for compliance.',
    accent: '#10b981',
  },
]

const STATS = [
  { to: 10000, suffix: '+', label: 'Inspections / Day' },
  { to: 98, suffix: '%', label: 'Model Accuracy' },
  { to: 200, suffix: 'ms', label: 'Avg Inference Time' },
  { to: 99, suffix: '%', label: 'System Uptime' },
]

const TECH = ['FastAPI', 'PyTorch', 'ONNX', 'React 18', 'Docker', 'MobileNetV3', 'SQLAlchemy', 'Vite']

export default function LandingPage() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#080818] text-white overflow-x-hidden" style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>

      {/* ─── Fixed Navbar ─── */}
      <nav
        className="fixed top-0 inset-x-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? 'rgba(8,8,24,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
            >
              👁️
            </div>
            <span className="font-black text-lg tracking-tight">MagicalEye</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Workflow', 'Features', 'Stats'].map(s => (
              <a
                key={s}
                href={`#${s.toLowerCase()}`}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {s}
              </a>
            ))}
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5 active:scale-95"
            style={{
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              boxShadow: '0 0 20px rgba(99,102,241,0.3)',
            }}
          >
            Open Dashboard →
          </button>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

        {/* Animated gradient bg */}
        <div
          className="absolute inset-0 animate-gradient"
          style={{
            background: 'linear-gradient(135deg,#0f0c29,#1a1040,#302b63,#24243e,#0f0c29)',
            backgroundSize: '400% 400%',
          }}
        />

        {/* Grid overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/5 w-96 h-96 rounded-full blur-[120px] opacity-30 animate-pulse" style={{ background: '#6366f1' }} />
        <div className="absolute bottom-1/4 right-1/5 w-96 h-96 rounded-full blur-[120px] opacity-20 animate-pulse" style={{ background: '#8b5cf6', animationDelay: '1s' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[700px] h-[700px] rounded-full blur-[140px] opacity-10" style={{ background: '#06b6d4' }} />
        </div>

        {/* Floating particles */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              background: i % 2 === 0 ? '#6366f1' : '#8b5cf6',
              left: `${8 + i * 9}%`,
              top: `${15 + (i % 4) * 20}%`,
              animationDelay: `${i * 0.35}s`,
              animationDuration: `${3 + i * 0.4}s`,
              opacity: 0.6,
            }}
          />
        ))}

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-24">

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
            style={{
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.25)',
              color: '#a5b4fc',
            }}
          >
            <span className="animate-pulse" style={{ color: '#10b981' }}>●</span>
            AI-Powered Manufacturing Quality Control
          </div>

          {/* Headline */}
          <h1 className="font-black leading-none tracking-tight mb-6" style={{ fontSize: 'clamp(3.5rem, 10vw, 7rem)' }}>
            <span className="block text-white">Magical</span>
            <span
              className="block animate-gradient"
              style={{
                backgroundImage: 'linear-gradient(90deg,#818cf8,#c084fc,#22d3ee,#818cf8)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Eye
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-4 leading-relaxed">
            Smarter Quality Control with AI
          </p>
          <p className="text-base text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed">
            MagicalEye uses advanced computer vision to instantly detect manufacturing defects,
            providing real-time insights that elevate product quality and reduce production waste.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="group px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:-translate-y-1 active:scale-95"
              style={{
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                boxShadow: '0 8px 40px rgba(99,102,241,0.4)',
              }}
            >
              Launch Dashboard
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
            </button>
            <a
              href="#workflow"
              className="px-8 py-4 rounded-2xl font-semibold text-gray-300 transition-all hover:text-white"
              style={{ border: '1px solid rgba(255,255,255,0.12)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
            >
              Explore Workflow ↓
            </a>
          </div>

          {/* Tech stack pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {TECH.map(t => (
              <span
                key={t}
                className="px-3 py-1 rounded-full text-xs font-mono text-gray-500"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
          <div className="w-6 h-10 rounded-full flex justify-center pt-2" style={{ border: '2px solid rgba(255,255,255,0.3)' }}>
            <div className="w-1 h-3 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.6)' }} />
          </div>
        </div>
      </section>

      {/* ─── Workflow Section ─── */}
      <section id="workflow" className="py-28 px-6" style={{ background: '#0d0d1f' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#818cf8' }}>
              How It Works
            </span>
            <h2 className="text-4xl md:text-5xl font-black mt-3 mb-4 text-white">
              5-Step Inspection Workflow
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              From raw image to actionable quality insight — in under a second
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className="relative group p-6 rounded-2xl transition-all duration-300 cursor-default"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(10px)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-8px)'
                  e.currentTarget.style.boxShadow = `0 20px 60px ${step.glow}`
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                }}
              >
                {/* Step number */}
                <div className="text-xs font-mono mb-3" style={{ color: '#374151' }}>{step.step}</div>

                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-xl text-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg,${step.colorFrom},${step.colorTo})`,
                    boxShadow: `0 4px 20px ${step.glow}`,
                  }}
                >
                  {step.icon}
                </div>

                <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#9ca3af' }}>{step.desc}</p>

                {/* Arrow connector */}
                {i < STEPS.length - 1 && (
                  <div
                    className="hidden lg:block absolute top-12 -right-3 z-10 text-gray-600 text-lg"
                    style={{ lineHeight: 1 }}
                  >
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-28 px-6" style={{ background: 'linear-gradient(180deg,#0d0d1f 0%,#0f0c29 50%,#0d0d1f 100%)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#c084fc' }}>
              Why MagicalEye
            </span>
            <h2 className="text-4xl md:text-5xl font-black mt-3 mb-4 text-white">
              Built for Production
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Every feature designed to maximize inspection throughput and reliability
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((feat, i) => (
              <div
                key={i}
                className="group relative p-7 rounded-2xl overflow-hidden transition-all duration-300 cursor-default"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(10px)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.borderColor = `${feat.accent}40`
                  e.currentTarget.style.boxShadow = `0 12px 40px ${feat.accent}15`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {/* Glow on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 20% 50%,${feat.accent}10 0%,transparent 60%)` }}
                />

                <div className="relative z-10 flex items-start gap-5">
                  <div
                    className="w-14 h-14 rounded-xl text-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `${feat.accent}18`, border: `1px solid ${feat.accent}35` }}
                  >
                    {feat.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: '#9ca3af' }}>{feat.desc}</p>
                  </div>
                </div>

                {/* Bottom accent line */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ background: `linear-gradient(90deg,transparent,${feat.accent},transparent)` }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section id="stats" className="py-28 px-6" style={{ background: '#080818' }}>
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#22d3ee' }}>
            By the Numbers
          </span>
          <h2 className="text-4xl md:text-5xl font-black mt-3 mb-4 text-white">
            Performance at Scale
          </h2>
          <p className="text-gray-400 text-lg mb-16 max-w-2xl mx-auto">
            Demo metrics showcasing the system's design capabilities
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <div
                key={i}
                className="p-7 rounded-2xl transition-all duration-300 cursor-default"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)'
                  e.currentTarget.style.background = 'rgba(99,102,241,0.06)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                }}
              >
                <div
                  className="text-4xl md:text-5xl font-black mb-2"
                  style={{
                    backgroundImage: 'linear-gradient(135deg,#818cf8,#c084fc)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  <Counter to={stat.to} suffix={stat.suffix} delay={i * 150} />
                </div>
                <p className="text-sm font-medium" style={{ color: '#6b7280' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section
        className="py-24 px-6 relative overflow-hidden animate-gradient"
        style={{
          background: 'linear-gradient(135deg,#312e81,#4c1d95,#1e1b4b,#312e81)',
          backgroundSize: '300% 300%',
        }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.06) 1px,transparent 1px)',
            backgroundSize: '35px 35px',
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="text-6xl mb-6 animate-float">👁️</div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Ready to Inspect Smarter?
          </h2>
          <p className="text-indigo-200 text-lg mb-10">
            Launch the MagicalEye dashboard and run AI-powered inspections in seconds.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="group px-10 py-5 rounded-2xl font-bold text-lg text-indigo-900 bg-white transition-all hover:-translate-y-1 active:scale-95"
            style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 16px 60px rgba(0,0,0,0.5)'; e.currentTarget.style.background = '#f0f0ff' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 8px 40px rgba(0,0,0,0.4)'; e.currentTarget.style.background = '#ffffff' }}
          >
            Start Inspecting
            <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer
        className="py-8 px-6"
        style={{ background: '#080818', borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
            >
              👁️
            </div>
            <span className="font-bold text-white">MagicalEye</span>
            <span className="text-gray-600 text-sm">— Enduraverse Hackathon 2026</span>
          </div>
          <div className="flex items-center gap-4 text-sm" style={{ color: '#4b5563' }}>
            <span>FastAPI + PyTorch + React</span>
            <span>·</span>
            <span>AI Defect Detection System</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
