// Komplett neues, minimales App ohne komplexe Dependencies
import React, { useState } from "react";

// Einfaches Dashboard
function MinimalDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Helix Regulatory Intelligence</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Regulatory Updates</h3>
              <span className="text-2xl">📋</span>
            </div>
            <div className="mt-2">
              <div className="text-3xl font-bold text-gray-900">147</div>
              <p className="text-sm text-green-600">+12% von letztem Monat</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Data Collection</h3>
              <span className="text-2xl">🗃️</span>
            </div>
            <div className="mt-2">
              <div className="text-3xl font-bold text-gray-900">89%</div>
              <p className="text-sm text-blue-600">Completion Rate</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Analytics</h3>
              <span className="text-2xl">📊</span>
            </div>
            <div className="mt-2">
              <div className="text-3xl font-bold text-gray-900">2,345</div>
              <p className="text-sm text-purple-600">Total Documents</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
              <span className="text-2xl">👥</span>
            </div>
            <div className="mt-2">
              <div className="text-3xl font-bold text-gray-900">23</div>
              <p className="text-sm text-orange-600">Online now</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Backend-Verbindung Test</h2>
          <BackendTest />
        </div>
      </div>
    </div>
  );
}

// Backend-Test Komponente
function BackendTest() {
  const [status, setStatus] = useState("Nicht getestet");
  const [loading, setLoading] = useState(false);

  const testBackend = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setStatus(`✅ Backend läuft: ${JSON.stringify(data)}`);
    } catch (error) {
      setStatus(`❌ Backend-Fehler: ${error}`);
    }
    setLoading(false);
  };

  return (
    <div>
      <button 
        onClick={testBackend}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Teste..." : "Backend testen"}
      </button>
      <div className="mt-4 p-3 bg-gray-100 rounded">
        Status: {status}
      </div>
    </div>
  );
}

// Minimale App-Komponente
export default function MinimalApp() {
  return <MinimalDashboard />;
}