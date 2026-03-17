import { useEffect, useState } from 'react'
import { getInspections } from '@/services/api'
import InspectionRow from '@/components/InspectionPanel/InspectionRow'

export default function HistoryPage() {
  const [records, setRecords] = useState([])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const limit = 20

  useEffect(() => {
    setLoading(true)
    getInspections({ skip: page * limit, limit })
      .then(r => setRecords(r.data))
      .finally(() => setLoading(false))
  }, [page])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Inspection History</h1>
          </div>
          <p className="text-gray-600 ml-13">Track and manage all past inspections</p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
              </div>
              <span className="ml-3 text-gray-600">Loading inspections...</span>
            </div>
          )}

          {/* Empty State */}
          {!loading && records.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-600 text-lg font-medium">No inspections yet</p>
              <p className="text-gray-500 text-sm mt-1">Start by creating a new inspection</p>
            </div>
          )}

          {/* Records List */}
          {!loading && records.length > 0 && (
            <>
              <div className="divide-y divide-gray-200">
                {records.map(r => (
                  <div key={r.id} className="hover:bg-gray-50 transition-colors">
                    <InspectionRow record={r} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page <span className="font-semibold text-gray-900">{page + 1}</span> • 
                  Showing <span className="font-semibold text-gray-900">{records.length}</span> inspections
                </div>
                <div className="flex gap-3">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                    className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    ← Previous
                  </button>
                  <button
                    disabled={records.length < limit}
                    onClick={() => setPage(p => p + 1)}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
