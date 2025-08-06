import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  RefreshCw, 
  Play, 
  Database, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Download
} from 'lucide-react';

// Neue, saubere API-Funktion
async function apiCall(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any) {
  console.log(`[API] ${method} ${endpoint}`, data);
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  };

  if (method === 'POST' && data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(endpoint, options);
  console.log(`[API] Response ${response.status} for ${endpoint}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status}: ${errorText}`);
  }

  const result = await response.json();
  console.log(`[API] Success:`, result);
  return result;
}

interface DataSource {
  id: string;
  name: string;
  is_active: boolean;
  type: string;
  last_sync?: string;
}

interface SyncResult {
  success: boolean;
  message: string;
  total: number;
  successful: number;
  failed: number;
  totalNewUpdates: number;
  totalDuration: number;
}

export default function SyncManagerNew() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // States für Live-Updates
  const [syncProgress, setSyncProgress] = useState<Record<string, 'idle' | 'syncing' | 'success' | 'error'>>({});
  const [bulkSyncActive, setBulkSyncActive] = useState(false);

  // Lade Datenquellen
  const { data: dataSources = [], isLoading: sourcesLoading } = useQuery({
    queryKey: ['/api/data-sources'],
    queryFn: () => apiCall('/api/data-sources'),
  });

  // Dashboard Stats
  const { data: dashboardStats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    queryFn: () => apiCall('/api/dashboard/stats'),
    refetchInterval: 5000,
  });

  // Einzelne Datenquelle synchronisieren
  const singleSyncMutation = useMutation({
    mutationFn: async (sourceId: string) => {
      console.log(`[SYNC] Starting sync for ${sourceId}`);
      setSyncProgress(prev => ({ ...prev, [sourceId]: 'syncing' }));
      
      const result = await apiCall(`/api/data-sources/${sourceId}/sync`, 'POST', {
        optimized: true,
        realTime: true
      });
      
      return { sourceId, ...result };
    },
    onSuccess: (data) => {
      console.log(`[SYNC] Success for ${data.sourceId}:`, data);
      setSyncProgress(prev => ({ ...prev, [data.sourceId]: 'success' }));
      
      toast({
        title: "✅ Synchronisation erfolgreich",
        description: `${data.sourceId}: ${data.message || 'Synchronisation abgeschlossen'}`,
      });

      queryClient.invalidateQueries({ queryKey: ['/api/data-sources'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
    onError: (error: any, sourceId) => {
      console.error(`[SYNC] Error for ${sourceId}:`, error);
      setSyncProgress(prev => ({ ...prev, [sourceId]: 'error' }));
      
      toast({
        title: "❌ Synchronisation fehlgeschlagen",
        description: `${sourceId}: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Bulk-Synchronisation
  const bulkSyncMutation = useMutation({
    mutationFn: async () => {
      console.log(`[BULK SYNC] Starting bulk sync for all sources`);
      setBulkSyncActive(true);
      
      // Setze alle aktiven Quellen auf syncing
      const activeSourceIds = dataSources.filter((s: DataSource) => s.is_active).map((s: DataSource) => s.id);
      const initialProgress: Record<string, 'syncing'> = {};
      activeSourceIds.forEach((id: string) => initialProgress[id] = 'syncing');
      setSyncProgress(initialProgress);

      try {
        // Direct fetch API call für bessere Kontrolle
        const response = await fetch('/api/data-sources/sync-all', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            optimized: true,
            backgroundProcessing: true 
          })
        });

        console.log(`[BULK SYNC] Response status:`, response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log(`[BULK SYNC] Response data:`, result);
        return result;
      } catch (error) {
        console.error(`[BULK SYNC] Fetch error:`, error);
        setBulkSyncActive(false);
        throw error;
      }

    },
    onSuccess: (data: SyncResult) => {
      console.log(`[BULK SYNC] Success:`, data);
      setBulkSyncActive(false);
      
      // Setze alle auf success
      const successProgress: Record<string, 'success'> = {};
      dataSources.filter((s: DataSource) => s.is_active).forEach((s: DataSource) => successProgress[s.id] = 'success');
      setSyncProgress(successProgress);

      const durationSec = Math.round((data.totalDuration || 0) / 1000);
      
      if (data.totalNewUpdates > 0) {
        toast({
          title: "✅ Bulk-Synchronisation erfolgreich",
          description: `${data.successful}/${data.total} Quellen: ${data.totalNewUpdates} neue Updates in ${durationSec}s`,
        });
      } else {
        toast({
          title: "ℹ️ Bulk-Synchronisation abgeschlossen", 
          description: `${data.successful}/${data.total} Quellen überprüft: Keine neuen Updates in ${durationSec}s`,
        });
      }

      queryClient.invalidateQueries({ queryKey: ['/api/data-sources'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
    onError: (error: any) => {
      console.error(`[BULK SYNC] Error:`, error);
      setBulkSyncActive(false);
      setSyncProgress({});
      
      toast({
        title: "❌ Bulk-Synchronisation fehlgeschlagen",
        description: `Fehler: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const getStatusIcon = (sourceId: string) => {
    const status = syncProgress[sourceId] || 'idle';
    switch (status) {
      case 'syncing': return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Database className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (sourceId: string) => {
    const status = syncProgress[sourceId] || 'idle';
    switch (status) {
      case 'syncing': return 'border-blue-200 bg-blue-50';
      case 'success': return 'border-green-200 bg-green-50';
      case 'error': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  if (sourcesLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const activeSources = dataSources.filter((s: DataSource) => s.is_active);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Datenquellen-Synchronisation
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Neue, saubere Frontend-Backend Verbindung - {activeSources.length} aktive Quellen
          </p>
        </div>
        <Button 
          onClick={() => {
            console.log('[UI] Bulk sync button clicked');
            console.log('[UI] Current mutation state:', { 
              isActive: bulkSyncActive, 
              isPending: bulkSyncMutation.isPending 
            });
            bulkSyncMutation.mutate();
          }}
          disabled={bulkSyncActive || bulkSyncMutation.isPending}
          className="bg-[#d95d2c] hover:bg-[#b8441f] text-white"
        >
          {bulkSyncActive ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          Alle synchronisieren ({activeSources.length})
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Aktive Quellen</p>
                <p className="font-semibold text-green-600">{activeSources.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Updates Gesamt</p>
                <p className="font-semibold text-blue-600">{dashboardStats?.totalUpdates || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Legal Cases</p>
                <p className="font-semibold text-purple-600">{dashboardStats?.totalLegalCases || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Pending Approvals</p>
                <p className="font-semibold text-orange-600">{dashboardStats?.pendingApprovals || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Sync Status */}
      {bulkSyncActive && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
              <div>
                <p className="font-semibold text-blue-800">Bulk-Synchronisation läuft...</p>
                <p className="text-sm text-blue-600">
                  {Object.values(syncProgress).filter(s => s === 'success').length} von {activeSources.length} Quellen abgeschlossen
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dataSources.map((source: DataSource) => (
          <Card key={source.id} className={`${getStatusColor(source.id)} transition-all duration-300`}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(source.id)}
                  <div>
                    <h3 className="font-semibold text-gray-800">{source.name}</h3>
                    <p className="text-sm text-gray-600">ID: {source.id}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Badge variant={source.is_active ? "default" : "secondary"}>
                    {source.is_active ? "Aktiv" : "Inaktiv"}
                  </Badge>
                  {source.type && (
                    <Badge variant="outline">{source.type}</Badge>
                  )}
                </div>
              </div>
              
              {source.last_sync && (
                <p className="text-xs text-gray-500 mb-3">
                  Letzte Sync: {new Date(source.last_sync).toLocaleString('de-DE')}
                </p>
              )}

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Status: {syncProgress[source.id] || 'Bereit'}
                </span>
                <Button
                  size="sm"
                  onClick={() => {
                    console.log(`[UI] Single sync clicked for ${source.id}`);
                    singleSyncMutation.mutate(source.id);
                  }}
                  disabled={!source.is_active || syncProgress[source.id] === 'syncing'}
                  variant="outline"
                >
                  {syncProgress[source.id] === 'syncing' ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    "Synchronisieren"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Debug Info */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Debug Information</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Geladene Datenquellen: {dataSources.length}</p>
            <p>Aktive Quellen: {activeSources.length}</p>
            <p>Bulk Sync Status: {bulkSyncActive ? 'Läuft' : 'Bereit'}</p>
            <p>Dashboard Stats: {dashboardStats ? 'Geladen' : 'Lädt...'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}