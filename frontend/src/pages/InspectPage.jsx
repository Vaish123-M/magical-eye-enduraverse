import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { uploadImage, overrideInspection } from '@/services/api'
import ResultCard    from '@/components/InspectionPanel/ResultCard'
import OverrideModal from '@/components/InspectionPanel/OverrideModal'
import toast         from 'react-hot-toast'
import { UploadCloud } from 'lucide-react'

export default function InspectPage() {
  const [result,      setResult]      = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [showOverride, setShowOverride] = useState(false)
  const [preview,     setPreview]     = useState(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    multiple: false,
    onDrop: async ([file]) => {
      setPreview(URL.createObjectURL(file))
      setResult(null)
      setLoading(true)
      try {
        const { data } = await uploadImage(file)
        setResult(data)
        if (data.status === 'NOT_OK') toast.error(`Defect detected: ${data.defect_type}`)
        else toast.success('Component passed inspection!')
      } catch {
        toast.error('Inspection failed. Check API.')
      } finally {
        setLoading(false)
      }
    },
  })

  const handleOverride = async (payload) => {
    const { data } = await overrideInspection(result.id, payload)
    setResult(data)
    setShowOverride(false)
    toast.success('Override recorded.')
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Run Inspection</h1>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto h-10 w-10 text-gray-400 mb-2" />
        <p className="text-gray-500">Drag an image here, or click to select</p>
      </div>

      {loading && <p className="text-center text-indigo-500 animate-pulse">Analysing…</p>}

      {preview && !loading && (
        <img src={preview} alt="Preview" className="rounded-xl max-h-64 mx-auto object-contain shadow" />
      )}

      {result && (
        <>
          <ResultCard record={result} />
          <button
            onClick={() => setShowOverride(true)}
            className="text-sm text-indigo-600 underline"
          >
            Human review / override
          </button>
        </>
      )}

      {showOverride && (
        <OverrideModal
          onSubmit={handleOverride}
          onClose={() => setShowOverride(false)}
        />
      )}
    </div>
  )
}
