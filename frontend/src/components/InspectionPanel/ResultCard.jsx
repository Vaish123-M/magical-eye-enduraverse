const STATUS_STYLE = {
  OK:     { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700', icon: '✓' },
  NOT_OK: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', icon: '⚠' },
}

export default function ResultCard({ record }) {
  const effective = record.override_status ?? record.status
  const style = STATUS_STYLE[effective] || STATUS_STYLE.OK
  
  return (
    <div className={`rounded-xl border-2 ${style.bg} ${style.border} overflow-hidden shadow-lg`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-lg ${style.bg} border-2 ${style.border} flex items-center justify-center`}>
              <span className="text-3xl">{style.icon}</span>
            </div>
            <div>
              <p className={`text-4xl font-extrabold ${style.text}`}>{effective}</p>
              <p className="text-sm text-gray-600 mt-1">{effective === 'OK' ? 'Passed inspection' : 'Defect detected'}</p>
            </div>
          </div>
          {record.override_status && (
            <div className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg font-semibold text-xs">
              ✏️ Overridden
            </div>
          )}
        </div>
        
        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-200">
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Prediction</p>
            <p className="text-sm font-bold text-gray-900 mt-1">{record.prediction}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Confidence</p>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all" 
                  style={{ width: `${record.confidence * 100}%` }}
                />
              </div>
              <p className="text-sm font-bold text-gray-900">{(record.confidence * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>
        
        {record.defect_type && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Defect Type</p>
            <p className="text-sm font-bold text-gray-900 mt-1">{record.defect_type}</p>
          </div>
        )}
        
        {record.override_note && (
          <div className="mt-3 pt-3 border-t border-gray-200 bg-white/50 rounded-lg p-3">
            <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-1">Review Note</p>
            <p className="text-sm text-gray-700 italic">"{record.override_note}"</p>
          </div>
        )}
      </div>
    </div>
  )
}
