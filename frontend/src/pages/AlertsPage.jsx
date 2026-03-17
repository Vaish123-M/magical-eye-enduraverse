import { useEffect, useState } from 'react'
import { getAlerts, acknowledgeAlert } from '@/services/api'
import toast from 'react-hot-toast'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([])

  const load = () => getAlerts().then(r => setAlerts(r.data))
  useEffect(() => { load() }, [])

  const ack = async (id) => {
    await acknowledgeAlert(id, { acknowledged_by: 'operator' })
    toast.success('Alert acknowledged.')
    load()
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Alerts</h1>
      {alerts.length === 0 && <p className="text-gray-400">No alerts.</p>}
      {alerts.map(a => (
        <div
          key={a.id}
          className={`p-4 rounded-xl border shadow-sm ${
            a.acknowledged ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-300'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium text-sm">{a.message}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(a.created_at).toLocaleString()} · Severity: {a.severity}
              </p>
            </div>
            {!a.acknowledged && (
              <button
                onClick={() => ack(a.id)}
                className="text-xs px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Acknowledge
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
