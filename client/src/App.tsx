import React from "react";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <div className="h-32 w-32 bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-700 rounded-xl ring-4 ring-blue-100 flex items-center justify-center text-white font-bold text-6xl mx-auto mb-6">
            J
          </div>
          <h1 className="text-6xl font-bold text-gray-800 mb-4">JONS</h1>
          <p className="text-xl text-gray-600">Einfache und saubere Lösung</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">System Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Status:</span>
              <span className="text-green-600 font-medium">✅ Aktiv</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Verbindungen:</span>
              <span className="text-blue-600 font-medium">🔗 Bereit</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Fehler:</span>
              <span className="text-red-600 font-medium">❌ Keine</span>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>© 2025 JONS System - Einfach und Zuverlässig</p>
        </div>
      </div>
    </div>
  );
}

export default App;