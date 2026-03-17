import { Routes, Route } from 'react-router-dom'
import LoginPage from '@/pages/LoginPage'
import SinglePageApp from '@/pages/SinglePageApp'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/login"     element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><SinglePageApp /></ProtectedRoute>} />
    </Routes>
  )
}
