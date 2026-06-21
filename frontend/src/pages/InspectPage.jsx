import { useState } from 'react'
import { uploadImage } from '@/services/api'
import toast from 'react-hot-toast'

export default function InspectPage({ embedded = false }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select an image first')
      return
    }

    setLoading(true)
    try {
      const response = await uploadImage(file)
      setResult(response.data)
      toast.success('Inspection completed!')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to process image')
    } finally {
      setLoading(false)
    }
  }

  const containerClass = embedded 
    ? 'bg-white/5 backdrop-blur-xl' 
    : 'min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-100'

  const textClass = embedded ? 'text-white' : 'text-gray-900'

  return (
    <div className={containerClass}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        {!embedded && (
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Inspection Panel</h1>
        )}
        
        <div className="space-y-6">
          {/* Upload Section */}
          <div className="rounded-2xl border border-cyan-200/30 bg-white/10 p-6 backdrop-blur-xl">
            <div className="mb-4">
              <label className={`block text-sm font-semibold mb-2 ${textClass}`}>
                Upload Image for Inspection
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-500 file:text-white hover:file:bg-cyan-600"
              />
            </div>

            {preview && (
              <div className="mb-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded-lg border border-gray-300"
                />
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="w-full py-3 px-6 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Run Inspection'}
            </button>
          </div>

          {/* Results Section */}
          {result && (
            <div className={`rounded-2xl border p-6 backdrop-blur-xl ${
              result.status === 'OK' 
                ? 'border-emerald-500/50 bg-emerald-500/10' 
                : 'border-red-500/50 bg-red-500/10'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  result.status === 'OK' ? 'bg-emerald-500' : 'bg-red-500'
                }`}>
                  {result.status === 'OK' ? '✓' : '⚠'}
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${textClass}`}>
                    Status: {result.status}
                  </h3>
                  <p className={`text-sm ${textClass} opacity-80`}>
                    Confidence: {(result.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {result.defect_type && (
                <div className="mt-4 p-4 rounded-lg bg-black/20">
                  <p className={`text-sm font-semibold ${textClass}`}>
                    Defect Type: {result.defect_type}
                  </p>
                  <p className={`text-xs ${textClass} opacity-70 mt-1`}>
                    Class ID: {result.defect_class}
                  </p>
                </div>
              )}

              <div className="mt-4 text-xs text-gray-400">
                Inspection ID: {result.id}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
