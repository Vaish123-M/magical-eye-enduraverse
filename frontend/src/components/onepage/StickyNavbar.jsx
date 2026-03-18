import { useEffect, useMemo, useState } from 'react'
import { LogOut, Sparkles, Wifi } from 'lucide-react'

const ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'workflow', label: 'Workflow' },
  { id: 'inspect', label: 'Inspect' },
  { id: 'dashboard', label: 'Dashboard' },
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
    <header className="sticky top-0 z-50 border-b border-blue-100/30 bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-100/80 backdrop-blur-xl shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        <button
          onClick={() => onNavigate('home')}
          className="group flex items-center gap-2 rounded-xl px-3 py-2 text-blue-900 hover:bg-cyan-100/60 transition"
        >
          <span className="rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 p-2 shadow-lg shadow-cyan-500/30">
            <Sparkles size={18} />
          </span>
          <span className="text-lg font-extrabold tracking-wide md:text-xl">MagicalEye</span>
        </button>

        <nav className="mx-2 flex flex-1 items-center gap-2 overflow-x-auto px-1">
          {ITEMS.map((item) => {
            const isActive = activeId === item.id
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={
                  `rounded-full px-5 py-2 text-base font-semibold transition-all duration-200 ` +
                  (isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-md shadow-cyan-500/30 scale-105'
                    : 'text-blue-900 hover:bg-cyan-100/60 hover:text-blue-900')
                }
              >
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="hidden items-center gap-3 md:inline-flex">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/25 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-900 shadow-sm">
            <Wifi size={14} className={deviceHealth.online ? 'text-emerald-400' : 'text-rose-400'} />
            <span>{deviceHealth.online ? 'Online' : 'Offline'}</span>
            <span className="text-blue-400">{deviceHealth.latencyMs}ms</span>
          </div>

          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-blue-200/40 px-4 py-2 text-xs font-bold text-blue-900 transition hover:bg-cyan-100/60 hover:text-blue-900"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        <button
          onClick={onLogout}
          className="inline-flex items-center gap-2 rounded-xl border border-blue-200/40 px-4 py-2 text-xs font-bold text-blue-900 transition hover:bg-cyan-100/60 hover:text-blue-900 md:hidden"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  )
}
