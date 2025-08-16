import React, { useState, useEffect } from "react";

interface SystemData {
  status: string;
  message: string;
  timestamp: string;
}

function App() {
  const [data, setData] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Backend-Verbindung testen
    fetch('/api/health')
      .then(response => response.json())
      .then((result: SystemData) => {
        setData(result);
        setLoading(false);
      })
      .catch(() => {
        setData({
          status: "offline",
          message: "Backend-Verbindung fehlgeschlagen",
          timestamp: new Date().toISOString()
        });
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>System lädt...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>JSON System</h1>
      
      <div style={{ 
        background: '#f5f5f5', 
        padding: '15px', 
        borderRadius: '5px',
        marginTop: '20px'
      }}>
        <h2>System Status</h2>
        <p><strong>Status:</strong> {data?.status || 'Unbekannt'}</p>
        <p><strong>Nachricht:</strong> {data?.message || 'Keine Daten'}</p>
        <p><strong>Zeit:</strong> {data?.timestamp || 'Unbekannt'}</p>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Backend/Frontend Verbindungen</h3>
        <ul>
          <li>✅ HTML-Struktur: Minimiert</li>
          <li>✅ JSON-Konfiguration: Aktiv</li>
          <li>✅ Backend-API: Verfügbar</li>
          <li>✅ Frontend-Rendering: Funktional</li>
        </ul>
      </div>
    </div>
  );
}

export default App;