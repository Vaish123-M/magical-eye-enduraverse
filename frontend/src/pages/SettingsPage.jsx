export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-slate-100">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-1">Configure your system and integrations</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Backend API Configuration */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-amber-100 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔌</span>
                <h2 className="text-lg font-bold text-gray-900">Backend API</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 font-medium mb-2">Connection Status</p>
                <p className="text-sm text-blue-800">✓ Connected to <code className="bg-white px-2 py-1 rounded border border-blue-200 font-mono">http://127.0.0.1:8000</code></p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Configuration</p>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-600 font-mono">vite.config.js proxy → http://127.0.0.1:8000</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                The frontend is configured to proxy requests to the backend API. This ensures proper CORS handling during development.
              </p>
            </div>
          </div>

          {/* Environment Configuration */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-purple-100 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚙️</span>
                <h2 className="text-lg font-bold text-gray-900">Environment Configuration</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-700 mb-4">
                Configure backend settings by editing the <code className="bg-gray-100 px-2 py-1 rounded font-mono text-gray-900">.env</code> file in the backend folder:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">🌩️ Cloud Sync</p>
                  <p className="text-xs text-gray-600">Configure AWS S3, Google Cloud Storage, or Azure Blob Storage for inspection data backup</p>
                </div>
                <hr className="border-gray-200" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">📧 SMTP Alerts</p>
                  <p className="text-xs text-gray-600">Set up email notifications for critical inspection failures and system alerts</p>
                </div>
                <hr className="border-gray-200" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">💾 Storage Backend</p>
                  <p className="text-xs text-gray-600">Choose between SQLite (local), PostgreSQL, or MySQL for inspection records storage</p>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-yellow-900 font-medium">💡 Tip</p>
                <p className="text-sm text-yellow-800 mt-1">Restart the backend server after making changes to the .env file</p>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-green-100 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-2xl">ℹ️</span>
                <h2 className="text-lg font-bold text-gray-900">System Information</h2>
              </div>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Frontend Version</p>
                <p className="text-sm text-gray-900 font-medium mt-1">React 18 + Vite 5</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Backend Version</p>
                <p className="text-sm text-gray-900 font-medium mt-1">FastAPI + Python 3.14</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Database</p>
                <p className="text-sm text-gray-900 font-medium mt-1">SQLAlchemy ORM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
