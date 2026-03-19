export default function InspectPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-100">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Dashboard</h1>
        <div className="mb-8">
          <p style={{fontSize: '1.2rem', color: '#374151'}}>Welcome to the Magical Eye Dashboard.<br/>Webcam and inspection features are temporarily disabled for urgent access.<br/>You can view alerts and analytics from the sidebar.</p>
        </div>
      </div>
    </div>
  );
}
