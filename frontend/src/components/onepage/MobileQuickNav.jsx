import { useEffect, useState } from 'react'

const ITEMS = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'workflow', label: 'Flow', icon: '🧭' },
  { id: 'dashboard', label: 'Data', icon: '📊' },
  { id: 'inspect', label: 'Inspect', icon: '🔬' },
  { id: 'alerts', label: 'Alerts', icon: '🔔' },
]

export default function MobileQuickNav({ activeSection, onNavigate }) {
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
    <div className="fixed bottom-3 left-1/2 z-50 w-[96%] max-w-md -translate-x-1/2 rounded-2xl border border-white/15 bg-slate-950/75 p-2 backdrop-blur-xl lg:hidden">
      <div className="mb-2 flex items-center justify-between rounded-xl border border-cyan-200/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold">
        <span className={deviceHealth.online ? 'text-emerald-300' : 'text-rose-300'}>
          {deviceHealth.online ? 'Online' : 'Offline'}
        </span>
        <span className="text-cyan-100">{deviceHealth.latencyMs}ms</span>
        <span className="text-slate-200">Camera</span>
      </div>

      <div className="grid grid-cols-5 gap-1">
        {ITEMS.map((item) => {
          const isActive = activeSection === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={
                `flex flex-col items-center rounded-xl px-1 py-2 text-[10px] font-semibold transition ` +
                (isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white'
                  : 'text-slate-300 hover:bg-white/10')
              }
            >
              <span className="text-sm">{item.icon}</span>
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
