import React, { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

// TypeScript Interface für Stats
interface DashboardStats {
  totalUpdates: number;
  activeAlerts: number;
  compliance: number;
  lastSync: string;
  dataCollection: number;
  totalDocuments: number;
  activeUsers: number;
}

// Einfaches Dashboard
function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Fehler beim Laden der Stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Helix Regulatory Intelligence</h1>
            <div className="text-sm text-gray-500">MedTech Platform</div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Regulatory Updates */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Regulatory Updates</h3>
              <div className="text-2xl">📋</div>
            </div>
            <div className="mt-2">
              <div className="text-3xl font-bold text-gray-900">{stats?.totalUpdates || 0}</div>
              <p className="text-sm text-green-600">Aktuelle Meldungen</p>
            </div>
          </div>

          {/* Data Collection */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Data Collection</h3>
              <div className="text-2xl">🗃️</div>
            </div>
            <div className="mt-2">
              <div className="text-3xl font-bold text-gray-900">{stats?.dataCollection || 0}%</div>
              <p className="text-sm text-blue-600">Completion Rate</p>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Documents</h3>
              <div className="text-2xl">📊</div>
            </div>
            <div className="mt-2">
              <div className="text-3xl font-bold text-gray-900">{stats?.totalDocuments || 0}</div>
              <p className="text-sm text-purple-600">Total Documents</p>
            </div>
          </div>

          {/* Active Users */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
              <div className="text-2xl">👥</div>
            </div>
            <div className="mt-2">
              <div className="text-3xl font-bold text-gray-900">{stats?.activeUsers || 0}</div>
              <p className="text-sm text-orange-600">Online now</p>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">✅</div>
              <div className="font-medium text-green-800">Backend</div>
              <div className="text-sm text-green-600">Online</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium text-blue-800">API</div>
              <div className="text-sm text-blue-600">Funktional</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl mb-2">🔄</div>
              <div className="font-medium text-purple-800">Sync</div>
              <div className="text-sm text-purple-600">{stats?.compliance || 0}% Compliance</div>
            </div>
          </div>
          
          {stats && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">
                Letzter Sync: {new Date(stats.lastSync).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Haupt-App Komponente
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen">
        <Toaster />
        <Dashboard />
      </div>
    </QueryClientProvider>
  );
}

export default App;