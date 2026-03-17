import axios from 'axios'

const http = axios.create({ baseURL: '/api/v1' })

// ── Inspections ───────────────────────────────────────────────────────────────
export const uploadImage = (file, productId) => {
  const fd = new FormData()
  fd.append('file', file)
  if (productId) fd.append('product_id', productId)
  return http.post('/inspections/upload', fd)
}

export const captureFrame = (imageBase64, filename = 'camera.jpg', productId) =>
  http.post('/inspections/capture', {
    image_base64: imageBase64,
    filename,
    product_id: productId,
  })

export const getInspections = (params = {}) =>
  http.get('/inspections', { params })

export const getInspection = (id) =>
  http.get(`/inspections/${id}`)

export const overrideInspection = (id, payload) =>
  http.patch(`/inspections/${id}/override`, payload)

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const getDashboardStats = () => http.get('/dashboard/stats')
export const getRecentInspections = (limit = 10) =>
  http.get('/dashboard/recent', { params: { limit } })

// ── Alerts ────────────────────────────────────────────────────────────────────
export const getAlerts = (unreadOnly = false) =>
  http.get('/alerts', { params: { unread_only: unreadOnly } })

export const acknowledgeAlert = (id, payload) =>
  http.patch(`/alerts/${id}/acknowledge`, payload)
