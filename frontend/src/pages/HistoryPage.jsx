import { useEffect, useState } from 'react'
import { getInspections } from '@/services/api'
import InspectionRow from '@/components/InspectionPanel/InspectionRow'

export default function HistoryPage() {
  const [records, setRecords] = useState([])
  const [page,    setPage]    = useState(0)
  const limit = 20

  useEffect(() => {
    getInspections({ skip: page * limit, limit }).then(r => setRecords(r.data))
  }, [page])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Inspection History</h1>
      <div className="space-y-2">
        {records.map(r => <InspectionRow key={r.id} record={r} />)}
      </div>
      <div className="flex gap-4 pt-2">
        <button
          disabled={page === 0}
          onClick={() => setPage(p => p - 1)}
          className="px-4 py-2 rounded bg-gray-200 disabled:opacity-40"
        >
          Previous
        </button>
        <button
          disabled={records.length < limit}
          onClick={() => setPage(p => p + 1)}
          className="px-4 py-2 rounded bg-gray-200 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
}
