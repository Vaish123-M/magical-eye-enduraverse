import { Routes, Route, NavLink } from 'react-router-dom'
import DashboardPage   from '@/pages/DashboardPage'
import InspectPage     from '@/pages/InspectPage'
import HistoryPage     from '@/pages/HistoryPage'
import AlertsPage      from '@/pages/AlertsPage'
import SettingsPage    from '@/pages/SettingsPage'
import { Eye }         from 'lucide-react'

const NAV = [
  { to: '/',          label: 'Dashboard' },
  { to: '/inspect',   label: 'Inspect'   },
  { to: '/history',   label: 'History'   },
  { to: '/alerts',    label: 'Alerts'    },
  { to: '/settings',  label: 'Settings'  },
]

export default function App() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-700">
          <Eye className="h-6 w-6 text-indigo-400" />
          <span className="font-bold text-lg tracking-tight">MagicalEye</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/"         element={<DashboardPage />} />
          <Route path="/inspect"  element={<InspectPage />}   />
          <Route path="/history"  element={<HistoryPage />}   />
          <Route path="/alerts"   element={<AlertsPage />}    />
          <Route path="/settings" element={<SettingsPage />}  />
        </Routes>
      </main>
    </div>
  )
}
