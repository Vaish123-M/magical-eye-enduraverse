import { Routes, Route } from 'react-router-dom'

import SinglePageApp from '@/pages/SinglePageApp'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SinglePageApp />} />
      <Route path="/:section" element={<SinglePageApp />} />
      <Route path="*" element={<SinglePageApp />} />
    </Routes>
  )
}
