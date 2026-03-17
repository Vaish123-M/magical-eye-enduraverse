import axios from 'axios'

const http = axios.create({ baseURL: '/api/v1' })

const AUTH_TOKEN_KEY = 'magicaleye_token'

export const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY)
export const setAuthToken = (token) => localStorage.setItem(AUTH_TOKEN_KEY, token)
export const clearAuthToken = () => localStorage.removeItem(AUTH_TOKEN_KEY)

http.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

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
export const getDashboardTrends = (days = 7) => http.get('/dashboard/trends', { params: { days } })
export const getRecentInspections = (limit = 10) =>
  http.get('/dashboard/recent', { params: { limit } })

// ── Alerts ────────────────────────────────────────────────────────────────────
export const getAlerts = (unreadOnly = false) =>
  http.get('/alerts', { params: { unread_only: unreadOnly } })

export const acknowledgeAlert = (id, payload) =>
  http.patch(`/alerts/${id}/acknowledge`, payload)

// ── Auth ─────────────────────────────────────────────────────────────────────
export const login = (username, password) =>
  http.post(
    '/auth/token',
    new URLSearchParams({ username, password }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  )

export default http
