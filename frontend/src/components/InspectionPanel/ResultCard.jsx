const STATUS_STYLE = {
  OK:     'bg-ok-light border-ok text-ok',
  NOT_OK: 'bg-notok-light border-notok text-notok',
}

export default function ResultCard({ record }) {
  const effective = record.override_status ?? record.status
  return (
    <div className={`rounded-xl border-2 p-5 ${STATUS_STYLE[effective]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-2xl font-extrabold tracking-tight">{effective}</p>
          {record.defect_type && (
            <p className="text-sm mt-1 opacity-80">Defect type: <strong>{record.defect_type}</strong></p>
          )}
          <p className="text-sm opacity-70">Confidence: {(record.confidence * 100).toFixed(1)}%</p>
        </div>
        {record.override_status && (
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
            Human overridden
          </span>
        )}
      </div>
      {record.override_note && (
        <p className="mt-3 text-sm italic opacity-70">"{record.override_note}"</p>
      )}
    </div>
  )
}
