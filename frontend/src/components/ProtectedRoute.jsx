import { Navigate, useLocation } from 'react-router-dom'

import { useAuthStore } from '@/store/auth'
import { getAuthToken } from '@/services/api'

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const hasToken = Boolean(getAuthToken())
  const location = useLocation()

  if (!isAuthenticated || !hasToken) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
