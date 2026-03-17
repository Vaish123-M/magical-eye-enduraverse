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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Human Review / Override</h2>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Your Decision</label>
            <div className="flex gap-3">
              {['OK', 'NOT_OK'].map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setOverrideStatus(v)}
                  className={`flex-1 py-2 rounded-lg border-2 font-semibold text-sm transition-colors ${
                    overrideStatus === v
                      ? v === 'OK' ? 'border-ok bg-ok-light text-ok' : 'border-notok bg-notok-light text-notok'
                      : 'border-gray-200 text-gray-500'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reviewer Name</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. John Smith"
              value={reviewedBy}
              onChange={e => setReviewedBy(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Note (optional)</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm"
              rows={3}
              placeholder="Reason for override…"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border text-sm text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700">
              Save Override
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
