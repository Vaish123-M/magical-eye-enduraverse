import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import DashboardPage from '@/pages/DashboardPage'
import InspectPage   from '@/pages/InspectPage'
import HistoryPage   from '@/pages/HistoryPage'
import AlertsPage    from '@/pages/AlertsPage'
import SettingsPage  from '@/pages/SettingsPage'
import LandingPage   from '@/pages/LandingPage'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/inspect',   label: 'Inspect',   icon: '🔬' },
  { to: '/history',   label: 'History',   icon: '📋' },
  { to: '/alerts',    label: 'Alerts',    icon: '🔔' },
  { to: '/settings',  label: 'Settings',  icon: '⚙️'  },
]

function AppShell({ children }) {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f1f5f9' }}>

      {/* ── Top Navbar ── */}
      <header
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
          boxShadow: '0 4px 30px rgba(99,102,241,0.25)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>

            {/* Logo */}
            <button
              onClick={() => navigate('/')}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: 'none', border: 'none', cursor: 'pointer',
                textDecoration: 'none',
              }}
            >
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', boxShadow: '0 0 14px rgba(99,102,241,0.5)',
              }}>
                👁️
              </div>
              <span style={{ fontWeight: 800, fontSize: '18px', color: '#fff', letterSpacing: '-0.5px' }}>
                MagicalEye
              </span>
            </button>

            {/* Nav links */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {NAV.map(({ to, label, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/dashboard'}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', borderRadius: '10px',
                    fontSize: '14px', fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    color: isActive ? '#fff' : 'rgba(199,210,254,0.8)',
                    background: isActive
                      ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
                      : 'transparent',
                    boxShadow: isActive ? '0 4px 14px rgba(99,102,241,0.4)' : 'none',
                  })}
                  onMouseEnter={e => {
                    if (!e.currentTarget.style.background.includes('gradient')) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                      e.currentTarget.style.color = '#fff'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!e.currentTarget.classList.contains('active')) {
                      const isActive = e.currentTarget.getAttribute('aria-current') === 'page'
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = 'rgba(199,210,254,0.8)'
                      }
                    }
                  }}
                >
                  <span style={{ fontSize: '15px' }}>{icon}</span>
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Status badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '6px 14px', borderRadius: '20px',
              background: 'rgba(16,185,129,0.15)',
              border: '1px solid rgba(16,185,129,0.3)',
            }}>
              <span style={{
                width: '7px', height: '7px', borderRadius: '50%',
                background: '#10b981', display: 'block',
                boxShadow: '0 0 6px #10b981',
                animation: 'pulse 2s infinite',
              }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#6ee7b7' }}>
                System Online
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Page Content ── */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/"          element={<LandingPage />} />
      <Route path="/dashboard" element={<AppShell><DashboardPage /></AppShell>} />
      <Route path="/inspect"   element={<AppShell><InspectPage /></AppShell>}   />
      <Route path="/history"   element={<AppShell><HistoryPage /></AppShell>}   />
      <Route path="/alerts"    element={<AppShell><AlertsPage /></AppShell>}    />
      <Route path="/settings"  element={<AppShell><SettingsPage /></AppShell>}  />
    </Routes>
  )
}
