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

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const requestPath = error?.config?.url || ''
    const isAuthEndpoint = requestPath.includes('/auth/token') || requestPath.includes('/auth/login')

    if (status === 401 && !isAuthEndpoint) {
      clearAuthToken()
      if (window.location.pathname !== '/login') {
        window.location.replace('/login')
      }
    }

    return Promise.reject(error)
  }
)

// ── Inspections ───────────────────────────────────────────────────────────────
export const uploadImage = (file, productId, partId) => {
  const fd = new FormData()
  fd.append('file', file)
  if (productId) fd.append('product_id', productId)
  if (partId) fd.append('part_id', partId)
  return http.post('/inspections/upload', fd)
}

export const captureFrame = (imageBase64, filename = 'camera.jpg', productId, partId) =>
  http.post('/inspections/capture', {
    image_base64: imageBase64,
    filename,
    product_id: productId,
    part_id: partId,
  })

export const getInspections = (params = {}) =>
  http.get('/inspections/', { params })

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
  http.get('/alerts/', { params: { unread_only: unreadOnly } })

export const acknowledgeAlert = (id, payload) =>
  http.patch(`/alerts/${id}/acknowledge`, payload)

// ── Auth ─────────────────────────────────────────────────────────────────────
export const login = (username, password) =>
  http.post(
    '/auth/token',
    new URLSearchParams({ username, password }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  )

export const ingestDeviceFrame = (payload) =>
  http.post('/device/ingest', payload, {
    headers: {
      'x-device-key': import.meta.env.VITE_DEVICE_API_KEY || 'demo-device-key',
    },
  })

export default http
