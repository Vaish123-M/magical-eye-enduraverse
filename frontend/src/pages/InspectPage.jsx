import { useEffect, useRef, useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { uploadImage, captureFrame, overrideInspection } from '@/services/api'
import ResultCard    from '@/components/InspectionPanel/ResultCard'
import OverrideModal from '@/components/InspectionPanel/OverrideModal'
import toast         from 'react-hot-toast'
import { UploadCloud } from 'lucide-react'

export default function InspectPage() {
  const [result,       setResult]       = useState(null)
  const [loading,      setLoading]      = useState(false)
  const [showOverride, setShowOverride] = useState(false)
  const [preview,      setPreview]      = useState(null)
  const [partId,       setPartId]       = useState('')
  const [cameraOn,     setCameraOn]     = useState(false)
  const [cameraError,  setCameraError]  = useState(null)
  const [captured,     setCaptured]     = useState(false)

  const videoRef    = useRef(null)
  const canvasRef   = useRef(null)
  const streamRef   = useRef(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    multiple: false,
    onDrop: async ([file]) => {
      if (!file) return
      setPreview(URL.createObjectURL(file))
      setResult(null)
      setCaptured(false)
      setLoading(true)
      try {
        const { data } = await uploadImage(file, undefined, partId || undefined)
        setResult(data)
        if (data.status === 'NOT_OK') toast.error(`Issue detected: ${data.defect_type}`)
        else toast.success('Item passed inspection.')
      } catch (err) {
        const status = err?.response?.status
        const detail = err?.response?.data?.detail
        if (status === 401) toast.error('Session expired. Please sign in again.')
        else toast.error(detail || 'Inspection failed. Please try again.')
      } finally {
        setLoading(false)
      }
    },
  })

  const stopCamera = useCallback(() => {
    // Clear srcObject FIRST so browser releases the track reference
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setCameraOn(false)
    setCameraError(null)
    setCaptured(false)
  }, [])

  // After cameraOn=true React renders the video as visible, then we assign srcObject
  useEffect(() => {
    if (cameraOn && !captured && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  }, [cameraOn, captured])

  const startCamera = async () => {
    setCameraError(null)
    // Release any existing stream and give the OS time to free the hardware
    if (videoRef.current) videoRef.current.srcObject = null
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    await new Promise(r => setTimeout(r, 300))

    const tryGetStream = async (constraints) => {
      return navigator.mediaDevices.getUserMedia(constraints)
    }

    try {
      let stream
      try {
        // Try with ideal constraints first
        stream = await tryGetStream({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: { ideal: 'user' } },
          audio: false,
        })
      } catch {
        // Fall back to simplest possible request
        stream = await tryGetStream({ video: true, audio: false })
      }
      streamRef.current = stream
      setCameraOn(true)
      setCaptured(false)
    } catch (err) {
      const msg =
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in your browser.'
          : err.name === 'NotFoundError'
          ? 'No camera found on this device.'
          : err.name === 'NotReadableError'
          ? 'Camera is in use by another app or tab. Close them and try again.'
          : 'Unable to access camera: ' + err.message
      setCameraError(msg)
      toast.error(msg)
    }
  }

  const captureFromCamera = async () => {
    if (!videoRef.current || !canvasRef.current) return
    const video  = videoRef.current
    const canvas = canvasRef.current

    if (video.readyState < 2) {
      toast.error('Camera is still loading. Wait a moment and try again.')
      return
    }

    canvas.width  = video.videoWidth  || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageBase64 = canvas.toDataURL('image/jpeg', 0.92)
    setPreview(imageBase64)
    setCaptured(true)
    setResult(null)
    setLoading(true)

    try {
      const { data } = await captureFrame(imageBase64, 'camera.jpg', undefined, partId || undefined)
      setResult(data)
      if (data.status === 'NOT_OK') toast.error(`Issue detected: ${data.defect_type}`)
      else toast.success('Item passed inspection.')
    } catch (err) {
      const status = err?.response?.status
      const detail = err?.response?.data?.detail
      if (status === 401) toast.error('Session expired. Please sign in again.')
      else toast.error(detail || 'Camera inspection failed.')
    } finally {
      setLoading(false)
    }
  }

  const retakePhoto = () => {
    setCaptured(false)
    setPreview(null)
    setResult(null)
  }

  const generatePartId = () => {
    const stamp = Date.now().toString().slice(-6)
    setPartId(`PART-${stamp}`)
  }

  useEffect(() => () => stopCamera(), [stopCamera])

  const handleOverride = async (payload) => {
    const { data } = await overrideInspection(result.id, payload)
    setResult(data)
    setShowOverride(false)
    toast.success('Override recorded.')
  }

  return (
    <div className="rounded-2xl" style={{ background: 'linear-gradient(135deg,#f8f9ff,#f3f0ff,#f8f9ff)' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '24px 20px' }}>

        {/* Header */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '14px',
              background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', boxShadow: '0 8px 24px rgba(124,58,237,0.35)',
            }}>⚡</div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e1b4b', margin: 0 }}>Run Inspection</h1>
              <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: '13px' }}>Upload an image or use your camera to detect defects</p>
            </div>
          </div>
        </div>

        <div style={{
          marginBottom: '14px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          <input
            value={partId}
            onChange={(e) => setPartId(e.target.value)}
            placeholder="Item ID (optional), e.g., ITEM-1001"
            style={{
              flex: 1,
              minWidth: '220px',
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1px solid #d1d5db',
              fontSize: '13px',
            }}
          />
          <button
            onClick={generatePartId}
            style={{
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1px solid #c7d2fe',
              background: '#eef2ff',
              color: '#3730a3',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Auto-Generate ID
          </button>
        </div>

        {/* Two column layout on large screens */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

          {/* ── Upload Card ── */}
          <div
            {...getRootProps()}
            style={{
              border: `2px dashed ${isDragActive ? '#7c3aed' : '#d1d5db'}`,
              borderRadius: '16px',
              padding: '32px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              background: isDragActive ? '#f5f3ff' : '#fff',
              transition: 'all 0.2s',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              minHeight: '220px',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.background = '#faf5ff' }}
            onMouseLeave={e => { if (!isDragActive) { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#fff' } }}
          >
            <input {...getInputProps()} />
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px',
              background: 'linear-gradient(135deg,#7c3aed18,#6d28d918)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '12px',
            }}>
              <UploadCloud style={{ width: '28px', height: '28px', color: '#7c3aed' }} />
            </div>
            <p style={{ fontWeight: 700, fontSize: '15px', color: '#1f2937', margin: '0 0 4px' }}>
              {isDragActive ? 'Drop image here' : 'Upload Image'}
            </p>
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>Drag & drop or click to browse</p>
            <p style={{ fontSize: '11px', color: '#d1d5db', marginTop: '8px' }}>JPG · PNG · WebP · GIF</p>
          </div>

          {/* ── Camera Card ── */}
          <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            {/* Camera header */}
            <div style={{
              padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'linear-gradient(135deg,#1e1b4b,#312e81)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>📹</span>
                <span style={{ fontWeight: 700, fontSize: '14px', color: '#e0e7ff' }}>Live Camera</span>
              </div>
              {cameraOn && !captured && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444',
                    animation: 'pulse 1.5s infinite',
                  }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#fca5a5' }}>LIVE</span>
                </div>
              )}
            </div>

            {/* Viewfinder area */}
            <div style={{ position: 'relative', background: '#0f172a', aspectRatio: '4/3', overflow: 'hidden' }}>

              {/* Video element — always in DOM so ref is stable */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  display: cameraOn && !captured ? 'block' : 'none',
                }}
              />

              {/* Captured freeze-frame */}
              {captured && preview && (
                <img src={preview} alt="Captured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}

              {/* Off state */}
              {!cameraOn && !captured && (
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: '10px',
                }}>
                  <div style={{ fontSize: '40px', opacity: 0.3 }}>📷</div>
                  <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0, textAlign: 'center', padding: '0 16px' }}>
                    {cameraError || 'Click "Start Camera" to begin'}
                  </p>
                </div>
              )}

              {/* Corner frame overlay (viewfinder brackets) */}
              {cameraOn && !captured && (
                <>
                  {/* Top-left */}
                  <div style={{ position: 'absolute', top: '20%', left: '20%', width: '22px', height: '22px',
                    borderTop: '3px solid #818cf8', borderLeft: '3px solid #818cf8', borderRadius: '2px 0 0 0' }} />
                  {/* Top-right */}
                  <div style={{ position: 'absolute', top: '20%', right: '20%', width: '22px', height: '22px',
                    borderTop: '3px solid #818cf8', borderRight: '3px solid #818cf8', borderRadius: '0 2px 0 0' }} />
                  {/* Bottom-left */}
                  <div style={{ position: 'absolute', bottom: '20%', left: '20%', width: '22px', height: '22px',
                    borderBottom: '3px solid #818cf8', borderLeft: '3px solid #818cf8', borderRadius: '0 0 0 2px' }} />
                  {/* Bottom-right */}
                  <div style={{ position: 'absolute', bottom: '20%', right: '20%', width: '22px', height: '22px',
                    borderBottom: '3px solid #818cf8', borderRight: '3px solid #818cf8', borderRadius: '0 0 2px 0' }} />
                  {/* Crosshair dot */}
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%,-50%)',
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: '#818cf8', opacity: 0.7,
                    boxShadow: '0 0 0 2px rgba(129,140,248,0.3)',
                  }} />
                  {/* Scan line animation */}
                  <div style={{
                    position: 'absolute', left: '20%', right: '20%', height: '2px',
                    background: 'linear-gradient(90deg,transparent,#818cf8,transparent)',
                    animation: 'scan 2.5s ease-in-out infinite',
                    top: '50%',
                  }} />
                  {/* Instruction */}
                  <div style={{
                    position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.6)', padding: '4px 12px', borderRadius: '20px',
                    color: '#c7d2fe', fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap',
                  }}>
                    Position component inside frame
                  </div>
                </>
              )}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>

            {/* Camera controls */}
            <div style={{ padding: '12px 14px', display: 'flex', gap: '8px', background: '#f8fafc' }}>
              {!cameraOn ? (
                <button
                  onClick={startCamera}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                    background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: '#fff',
                    fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(124,58,237,0.35)', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  🎬 Start Camera
                </button>
              ) : captured ? (
                <button
                  onClick={retakePhoto}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '10px', cursor: 'pointer',
                    border: '2px solid #e5e7eb', background: '#fff', color: '#374151',
                    fontWeight: 700, fontSize: '13px', transition: 'all 0.2s',
                  }}
                >
                  🔄 Retake
                </button>
              ) : (
                <>
                  <button
                    onClick={stopCamera}
                    style={{
                      padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
                      border: '2px solid #e5e7eb', background: '#fff', color: '#374151',
                      fontWeight: 600, fontSize: '13px', transition: 'all 0.2s',
                    }}
                  >
                    ⏹
                  </button>
                  <button
                    onClick={captureFromCamera}
                    disabled={loading}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                      background: loading ? '#9ca3af' : '#111827', color: '#fff',
                      fontWeight: 700, fontSize: '13px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#1f2937' }}
                    onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#111827' }}
                  >
                    📸 Capture & Inspect
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '32px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: '20px',
          }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              border: '3px solid #ede9fe', borderTopColor: '#7c3aed',
              animation: 'spin 0.8s linear infinite',
            }} />
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#4b5563' }}>Analyzing image with AI...</span>
          </div>
        )}

        {/* Captured image preview (only when NOT from camera, camera shows inline) */}
        {preview && !loading && !captured && (
          <div style={{
            background: '#fff', borderRadius: '16px', overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: '20px',
          }}>
            <div style={{ padding: '12px 18px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <p style={{ fontWeight: 700, fontSize: '13px', color: '#374151', margin: 0 }}>📷 Uploaded Image Preview</p>
            </div>
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
              <img src={preview} alt="Preview" style={{ maxHeight: '320px', objectFit: 'contain', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{ marginBottom: '20px' }}>
            <ResultCard record={result} />
            <button
              onClick={() => setShowOverride(true)}
              style={{
                width: '100%', marginTop: '12px', padding: '13px', borderRadius: '12px',
                border: '2px solid #7c3aed', background: 'transparent', color: '#7c3aed',
                fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f5f3ff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              ✏️ Human Review / Override
            </button>
          </div>
        )}

        {showOverride && (
          <OverrideModal onSubmit={handleOverride} onClose={() => setShowOverride(false)} />
        )}
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes scan {
          0%   { top: 20%; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 80%; opacity: 0; }
        }
      `}</style>
    </div>
  )
}
