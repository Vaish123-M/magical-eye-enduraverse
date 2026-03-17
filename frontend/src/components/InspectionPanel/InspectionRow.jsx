import { Link } from 'react-router-dom'

const STATUS_STYLE = {
  OK:     'bg-ok-light text-ok',
  NOT_OK: 'bg-notok-light text-notok',
}

export default function InspectionRow({ record }) {
  const imageSrc = record.image_path?.startsWith('http')
    ? record.image_path
    : record.image_path?.startsWith('/storage/')
      ? record.image_path
      : `/storage/${record.image_path?.split('/').pop()}`

  const isOK = record.status === 'OK'
  const statusIcon = isOK ? '✓' : '⚠'
  const statusBgClass = isOK ? 'bg-emerald-100' : 'bg-red-100'
  const statusTextClass = isOK ? 'text-emerald-700' : 'text-red-700'

  return (
    <Link
      to={`/history`}
      className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
    >
      <div className="flex items-center gap-4 flex-1">
        {record.image_path ? (
          <img
            src={imageSrc}
            alt=""
            className="h-12 w-12 rounded-lg object-cover shadow-md"
          />
        ) : (
          <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400">
            <span className="text-lg">🖼️</span>
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">{record.product_id ?? record.id.slice(0, 8)}</p>
          <p className="text-xs text-gray-500 mt-1">📅 {new Date(record.created_at).toLocaleString()}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {record.defect_type && (
          <div className="text-right">
            <p className="text-xs font-medium text-gray-700">{record.defect_type}</p>
          </div>
        )}
        <div className={`px-3 py-1.5 rounded-lg ${statusBgClass} ${statusTextClass} flex items-center gap-1 font-semibold text-xs`}>
          <span>{statusIcon}</span>
          {record.status}
        </div>
        {record.override_status && (
          <span className="text-xs text-purple-600 font-semibold bg-purple-100 px-2 py-1 rounded-lg">✏️ Overridden</span>
        )}
      </div>
    </Link>
  )
}
