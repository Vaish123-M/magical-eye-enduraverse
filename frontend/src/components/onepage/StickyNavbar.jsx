import { useEffect, useMemo, useState } from 'react'
import { LogOut, Sparkles, Wifi } from 'lucide-react'

const ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'workflow', label: 'Workflow' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'inspect', label: 'Inspect' },
  { id: 'history', label: 'History' },
  { id: 'alerts', label: 'Alerts' },
  { id: 'settings', label: 'Settings' },
]

export default function StickyNavbar({ activeSection, onNavigate, onLogout }) {
  const activeId = useMemo(() => activeSection || 'home', [activeSection])
  const [deviceHealth, setDeviceHealth] = useState({
    deviceId: 'esp32-cam-laser',
    online: true,
    latencyMs: 148,
  })

  useEffect(() => {
    const handler = (event) => {
      if (!event?.detail) return
      setDeviceHealth({
        deviceId: event.detail.deviceId || 'unknown-device',
        online: Boolean(event.detail.online),
        latencyMs: Number(event.detail.latencyMs || 0),
      })
    }
    window.addEventListener('magical-eye:device-health', handler)
    return () => window.removeEventListener('magical-eye:device-health', handler)
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <button
          onClick={() => onNavigate('home')}
          className="group flex items-center gap-2 rounded-lg px-2 py-1 text-white"
        >
          <span className="rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-500 p-2 shadow-lg shadow-cyan-500/30">
            <Sparkles size={16} />
          </span>
          <span className="text-sm font-bold tracking-wide md:text-base">MagicalEye</span>
        </button>

        <nav className="mx-2 flex flex-1 items-center gap-1 overflow-x-auto px-1">
          {ITEMS.map((item) => {
            const isActive = activeId === item.id
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={
                  `rounded-full px-4 py-2 text-sm font-medium transition-all ` +
                  (isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-md shadow-cyan-500/30'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white')
                }
              >
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="hidden items-center gap-2 md:inline-flex">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/25 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-semibold text-cyan-100">
            <Wifi size={12} className={deviceHealth.online ? 'text-emerald-300' : 'text-rose-300'} />
            <span>{deviceHealth.online ? 'Online' : 'Offline'}</span>
            <span className="text-slate-300">{deviceHealth.latencyMs}ms</span>
          </div>

          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>

        <button
          onClick={onLogout}
          className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10 md:hidden"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </header>
  )
}
