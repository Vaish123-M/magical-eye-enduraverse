import { Link } from 'react-router-dom'

const STATUS_STYLE = {
  OK:     'bg-ok-light text-ok',
  NOT_OK: 'bg-notok-light text-notok',
}

export default function InspectionRow({ record }) {
  return (
    <Link
      to={`/history`}
      className="flex items-center justify-between bg-white border rounded-xl px-4 py-3 hover:shadow-sm transition-shadow"
    >
      <div className="flex items-center gap-3">
        {record.image_path && (
          <img
            src={`/storage/${record.image_path.split('/').pop()}`}
            alt=""
            className="h-10 w-10 rounded-lg object-cover"
          />
        )}
        <div>
          <p className="text-sm font-medium">{record.product_id ?? record.id.slice(0, 8)}</p>
          <p className="text-xs text-gray-400">{new Date(record.created_at).toLocaleString()}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {record.defect_type && (
          <span className="text-xs text-gray-500">{record.defect_type}</span>
        )}
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[record.status]}`}>
          {record.status}
        </span>
        {record.override_status && (
          <span className="text-xs text-purple-600 font-medium">(Overridden)</span>
        )}
      </div>
    </Link>
  )
}
