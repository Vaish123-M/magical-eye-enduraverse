import { useState } from 'react'

export default function OverrideModal({ onSubmit, onClose }) {
  const [overrideStatus, setOverrideStatus] = useState('OK')
  const [reviewedBy,     setReviewedBy]     = useState('')
  const [note,           setNote]           = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!reviewedBy.trim()) return
    onSubmit({ override_status: overrideStatus, reviewed_by: reviewedBy, note })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">✏️</span>
            Human Review / Override
          </h2>
        </div>
        
        <form onSubmit={submit} className="p-6 space-y-5">
          {/* Decision Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Your Decision</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'OK', label: '✓ Passed', color: 'emerald' },
                { value: 'NOT_OK', label: '⚠ Defective', color: 'red' }
              ].map(({ value, label, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setOverrideStatus(value)}
                  className={`py-3 px-4 rounded-lg border-2 font-semibold text-sm transition-all ${
                    overrideStatus === value
                      ? color === 'emerald'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md'
                        : 'border-red-500 bg-red-50 text-red-700 shadow-md'
                      : 'border-gray-200 text-gray-500 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Reviewer Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Reviewer Name *</label>
            <input
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-colors"
              placeholder="e.g. John Smith"
              value={reviewedBy}
              onChange={e => setReviewedBy(e.target.value)}
              required
            />
          </div>
          
          {/* Note */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Note (optional)</label>
            <textarea
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-colors resize-none"
              rows={3}
              placeholder="Reason for this decision…"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>
          
          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-2.5 rounded-lg border-2 border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={!reviewedBy.trim()}
              className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Save Override
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
