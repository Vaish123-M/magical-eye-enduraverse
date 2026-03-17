import { useEffect, useState } from 'react'
import { getAlerts, acknowledgeAlert } from '@/services/api'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([])
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)

  const load = async () => {
    try {
      const r = await getAlerts()
      setAlerts(r.data)
    } catch (err) {
      if (err?.response?.status === 401) {
        logout()
        navigate('/login')
      }
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        load()
      }
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const ack = async (id) => {
    await acknowledgeAlert(id, { acknowledged_by: 'operator' })
    toast.success('Alert acknowledged.')
    load()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Alerts</h1>
              <p className="text-gray-600 mt-1">System notifications and warnings</p>
            </div>
          </div>
        </div>

        {/* Alerts Container */}
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-gray-900">All clear!</p>
              <p className="text-gray-600 mt-2">No active alerts at the moment</p>
            </div>
          ) : (
            alerts.map(a => {
              const isAcknowledged = a.acknowledged
              const bgColor = isAcknowledged ? 'bg-gray-50' : 'bg-red-50'
              const borderColor = isAcknowledged ? 'border-gray-200' : 'border-red-200'
              
              return (
                <div
                  key={a.id}
                  className={`rounded-xl border-2 shadow-md overflow-hidden transition-all hover:shadow-lg ${
                    bgColor
                  } ${
                    borderColor
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 ${
                        isAcknowledged ? 'bg-gray-100' : 'bg-red-100'
                      } rounded-lg flex items-center justify-center flex-shrink-0 mt-1`}>
                        <span className="text-lg">{isAcknowledged ? '✓' : '⚠'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-gray-900">{a.message}</p>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                              <span>📅 {new Date(a.created_at).toLocaleString()}</span>
                              <span>•</span>
                              <span className={`font-medium ${
                                a.severity === 'critical' ? 'text-red-600' :
                                a.severity === 'high' ? 'text-orange-600' :
                                'text-yellow-600'
                              }`}>
                                Severity: {a.severity.toUpperCase()}
                              </span>
                              {isAcknowledged && <span>• ✓ Acknowledged</span>}
                            </div>
                          </div>
                          {!isAcknowledged && (
                            <button
                              onClick={() => ack(a.id)}
                              className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap shadow-md"
                            >
                              Acknowledge
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
