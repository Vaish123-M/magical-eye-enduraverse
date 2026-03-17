export default function SettingsPage() {
  return (
    <div className="p-6 max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="bg-white rounded-xl border shadow-sm p-5 space-y-3">
        <p className="text-sm font-semibold text-gray-700">Backend API</p>
        <p className="text-sm text-gray-400">Configured via vite.config.js proxy → http://localhost:8000</p>
      </div>
      <div className="bg-white rounded-xl border shadow-sm p-5 space-y-3">
        <p className="text-sm font-semibold text-gray-700">Environment</p>
        <p className="text-sm text-gray-400">Edit <code className="bg-gray-100 px-1 rounded">.env</code> in the backend folder to configure cloud sync, SMTP alerts, and storage backend.</p>
      </div>
    </div>
  )
}
