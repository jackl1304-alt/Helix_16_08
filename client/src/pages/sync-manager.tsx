import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Database, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Download,
  Play,
  Pause,
  X,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DataSource {
  id: string;
  name: string;
  country: string;
  type: string;
  url: string;
  isActive: boolean;
  description: string;
  lastSync?: string;
  status?: 'idle' | 'syncing' | 'success' | 'error';
}

export default function SyncManager() {
  const [syncProgress, setSyncProgress] = useState<Record<string, number>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showUpdatesSummary, setShowUpdatesSummary] = useState(false);
  const [modalUpdates, setModalUpdates] = useState<any[]>([]);
  const [loadingUpdates, setLoadingUpdates] = useState(false);

  const { data: dataSources = [], isLoading } = useQuery<DataSource[]>({
    queryKey: ['/api/data-sources'],
  });

  // Dashboard Stats für Live-Sync-Tracking
  const { data: dashboardStats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    refetchInterval: 30000, // Alle 30 Sekunden aktualisieren
    staleTime: 15000, // 15 Sekunden
  });

  // Funktion zum Laden der Updates für das Modal
  const loadRecentUpdatesForModal = async () => {
    setLoadingUpdates(true);
    try {
      const response = await fetch('/api/updates/modal-summary');
      const data = await response.json();
      
      if (data.success && Array.isArray(data.updates)) {
        setModalUpdates(data.updates);
      } else {
        setModalUpdates([]);
      }
    } catch (error) {
      console.error('Error loading modal updates:', error);
      setModalUpdates([]);
    } finally {
      setLoadingUpdates(false);
    }
  };

  // Updates laden wenn Modal geöffnet wird
  const handleOpenModal = () => {
    setShowUpdatesSummary(true);
    loadRecentUpdatesForModal();
  };

  // Live Sync Statistics - Zeigt nur neue Updates bei echten Sync-Vorgängen
  const [liveStats, setLiveStats] = useState({
    lastSync: "vor 2 Minuten",
    runningSyncs: 0,
    newUpdates: "0", // Startet mit 0 - zeigt nur neue Updates
    activeSources: 46
  });

  // Update live stats mit echten Dashboard-API-Daten
  useEffect(() => {
    if (dashboardStats) {
      setLiveStats(prev => ({
        ...prev,
        runningSyncs: dashboardStats.runningSyncs || 0,
        activeSources: dashboardStats.activeDataSources || prev.activeSources,
        newUpdates: dashboardStats.recentUpdates?.toString() || prev.newUpdates
      }));
    }
  }, [dashboardStats]);

  // Update live stats - verhindere Endlosschleife
  useEffect(() => {
    if (dataSources.length > 0) {
      const activeCount = dataSources.filter(s => s.isActive).length;
      setLiveStats(prev => {
        // Nur update wenn sich activeCount geändert hat
        if (prev.activeSources !== activeCount) {
          return {
            ...prev,
            activeSources: activeCount
          };
        }
        return prev; // Keine Änderung = keine Re-Render
      });
    }
  }, [dataSources]);

  const syncMutation = useMutation({
    mutationFn: async (sourceId: string) => {
      // Starte Sync-Anzeige
      setLiveStats(prev => ({
        ...prev,
        runningSyncs: prev.runningSyncs + 1
      }));
      
      console.log(`[SYNC-MANAGER] Starting optimized real-time sync for: ${sourceId}`);
      
      try {
        // Optimierte API-Requests mit korrekter Formatierung
        const result = await apiRequest(`/api/data-sources/${sourceId}/sync`, { 
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            sourceId,
            realTime: true,
            optimized: true
          })
        });
        
        console.log(`[SYNC-MANAGER] Sync completed for ${sourceId}:`, result);
        return result;
      } catch (error) {
        console.error(`[SYNC-MANAGER] Sync failed for ${sourceId}:`, error);
        throw error;
      } finally {
        // Reduziere laufende Syncs nach Abschluss
        setLiveStats(prev => ({
          ...prev,
          runningSyncs: Math.max(0, prev.runningSyncs - 1)
        }));
      }
    },
    onSuccess: (data, sourceId) => {
      console.log(`[SYNC-MANAGER] Success response for ${sourceId}:`, data);
      
      // Prüfe ob neue Updates gefunden wurden
      const newUpdatesFound = data?.newUpdatesCount || 0;
      const existingDataCount = data?.existingDataCount || 0; 
      const performanceMetrics = data?.performanceMetrics || {};
      const syncSuccess = data?.success !== false;
      
      if (newUpdatesFound > 0) {
        setLiveStats(prev => ({
          ...prev,
          newUpdates: String(parseInt(prev.newUpdates) + newUpdatesFound),
          lastSync: "gerade eben"
        }));
        
        toast({
          title: syncSuccess ? "✅ Optimierte Synchronisation erfolgreich" : "⚠️ Sync mit Warnungen",
          description: `${sourceId}: ${newUpdatesFound} neue Updates (${existingDataCount + newUpdatesFound} gesamt) | ${performanceMetrics.syncDuration || 0}ms`,
        });
      } else {
        toast({
          title: syncSuccess ? "ℹ️ Optimierter Sync abgeschlossen" : "⚠️ Sync abgeschlossen",
          description: `${sourceId}: Keine neuen Updates (${existingDataCount} bestehende) | Performance: ${performanceMetrics.throughput || 0} items/sec`,
        });
      }
      
      // Performance-Logging für Monitoring
      if (performanceMetrics.syncDuration) {
        console.log(`[SYNC-MANAGER] Performance metrics for ${sourceId}:`, {
          duration: `${performanceMetrics.syncDuration}ms`,
          memory: `${performanceMetrics.memoryUsage || 0}MB`,
          throughput: `${performanceMetrics.throughput || 0} items/sec`,
          errorRate: `${Math.round((performanceMetrics.errorRate || 0) * 100)}%`
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/data-sources'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
    onError: (error: any, sourceId) => {
      console.error(`[SYNC-MANAGER] Error for ${sourceId}:`, error);
      
      // Reduziere laufende Syncs auch bei Fehlern
      setLiveStats(prev => ({
        ...prev,
        runningSyncs: Math.max(0, prev.runningSyncs - 1)
      }));
      
      toast({
        title: "❌ Optimierte Synchronisation fehlgeschlagen", 
        description: `${sourceId}: ${error.message || 'Unbekannter Fehler'}`,
        variant: "destructive",
      });
    }
  });

  const syncAllMutation = useMutation({
    mutationFn: async () => {
      const activeSources = dataSources.filter(source => source.isActive);
      
      // Zeige realistische Bulk-Sync-Aktivität
      setLiveStats(prev => ({
        ...prev,
        runningSyncs: activeSources.length
      }));
      
      console.log(`Starting real bulk sync for ${activeSources.length} sources...`);
      
      // Setze alle als laufend
      setLiveStats(prev => ({
        ...prev,
        runningSyncs: activeSources.length
      }));
      
      try {
        // Optimierter Bulk-Sync API-Aufruf mit Performance-Tracking
        const result = await apiRequest('/api/data-sources/sync-all', { 
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            optimized: true,
            backgroundProcessing: true
          })
        });
        
        console.log('[SYNC-MANAGER] Bulk sync completed:', result);
        return result;
      } finally {
        // Reset nach Abschluss
        setLiveStats(prev => ({
          ...prev,
          runningSyncs: 0
        }));
      }
    },
    onSuccess: (data) => {
      console.log('[SYNC-MANAGER] Bulk sync success response:', data);
      
      const totalNewUpdates = data.totalNewUpdates || 0;
      const totalExisting = data.totalExisting || 0;
      const successful = data.successful || 0;
      const failed = data.failed || 0;
      const totalDuration = data.totalDuration || 0;
      
      if (totalNewUpdates > 0) {
        setLiveStats(prev => ({
          ...prev,
          newUpdates: String(parseInt(prev.newUpdates) + totalNewUpdates),
          lastSync: "gerade eben"
        }));
        
        toast({
          title: "✅ Optimierte Bulk-Synchronisation erfolgreich",
          description: `${successful}/${data.total} Quellen synchronisiert: ${totalNewUpdates} neue Updates | ${Math.round(totalDuration/1000)}s`,
        });
      } else {
        toast({
          title: "ℹ️ Optimierte Bulk-Synchronisation abgeschlossen",
          description: `${successful}/${data.total} Quellen überprüft: Keine neuen Updates | ${Math.round(totalDuration/1000)}s`,
        });
      }
      
      // Performance-Logging für Bulk-Sync
      console.log('[SYNC-MANAGER] Bulk sync performance:', {
        totalSources: data.total,
        successful,
        failed,
        duration: `${Math.round(totalDuration/1000)}s`,
        newUpdates: totalNewUpdates,
        throughput: `${Math.round(data.total / (totalDuration/1000))} sources/sec`
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/data-sources'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
    onError: (error: any) => {
      // Setze laufende Syncs auf 0 bei Fehlern
      setLiveStats(prev => ({
        ...prev,
        runningSyncs: 0
      }));
      
      toast({
        title: "❌ Bulk-Synchronisation fehlgeschlagen",
        description: `Fehler bei der Bulk-Synchronisation: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleSingleSync = (sourceId: string) => {
    syncMutation.mutate(sourceId);
  };

  const handleSyncAll = () => {
    syncAllMutation.mutate();
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'regulatory': return Database;
      case 'legal': return CheckCircle;
      default: return Database;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'syncing': return 'bg-blue-500';
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Datenquellen-Synchronisation
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Verwalten Sie die Synchronisation mit globalen Regulatory-Datenbanken
          </p>
        </div>
        <Button 
          onClick={handleSyncAll}
          disabled={syncAllMutation.isPending}
          className="bg-[#d95d2c] hover:bg-[#b8441f] text-white"
        >
          {syncAllMutation.isPending ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          Alle synchronisieren
        </Button>
      </div>

      {/* Sync Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Letzte Synchronisation</p>
                <p className="font-semibold text-green-600">
                  {liveStats.lastSync}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Aktive Quellen</p>
                <p className="font-semibold text-blue-600">{liveStats.activeSources}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleOpenModal}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Neue Updates</p>
                <p className="font-semibold text-purple-600">
                  {liveStats.newUpdates}
                </p>
                <p className="text-xs text-gray-500 mt-1">Klicken für Details</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Laufende Syncs</p>
                <p className="font-semibold text-orange-600">
                  {liveStats.runningSyncs}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Sources Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dataSources.map((source: DataSource) => {
          const Icon = getSourceIcon(source.type);
          const isCurrentlySyncing = syncMutation.isPending && syncMutation.variables === source.id;
          
          return (
            <Card key={source.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-6 w-6 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">{source.name}</CardTitle>
                      <CardDescription>{source.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={source.isActive ? "default" : "secondary"}>
                      {source.isActive ? "Aktiv" : "Inaktiv"}
                    </Badge>
                    <Badge variant="outline" className="uppercase">
                      {source.country}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Source Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Typ</p>
                    <p className="font-medium capitalize">{source.type}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Letzte Synchronisation</p>
                    <p className="font-medium">
                      {source.lastSync ? new Date(source.lastSync).toLocaleDateString('de-DE') : 'Nie'}
                    </p>
                  </div>
                </div>

                {/* Sync Status */}
                {isCurrentlySyncing && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-600">Synchronisierung läuft...</span>
                      <span>{syncProgress[source.id] || 0}%</span>
                    </div>
                    <Progress value={syncProgress[source.id] || 0} className="w-full" />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button
                    onClick={() => handleSingleSync(source.id)}
                    disabled={!source.isActive || isCurrentlySyncing}
                    className="flex-1 bg-[#d95d2c] hover:bg-[#b8441f] text-white"
                  >
                    {isCurrentlySyncing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Synchronisiert...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Synchronisieren
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(source.url, '_blank')}
                  >
                    <Database className="h-4 w-4" />
                  </Button>
                </div>

                {/* Source URL */}
                <div className="text-xs text-gray-500 truncate">
                  URL: {source.url}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Available Data Sources Info */}
      <Card>
        <CardHeader>
          <CardTitle>Verfügbare Datenquellen</CardTitle>
          <CardDescription>
            Helix synchronisiert mit führenden globalen Regulatory-Datenbanken
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">USA (FDA)</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• 510(k) Medical Device Clearances</li>
                <li>• Premarket Approvals (PMA)</li>
                <li>• FDA Guidance Documents</li>
                <li>• Warning Letters & Enforcement</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-600 mb-2">Europa (EMA)</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• EPAR Medicine Authorizations</li>
                <li>• MDR Device Approvals</li>
                <li>• Scientific Guidelines</li>
                <li>• Committee Opinions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-600 mb-2">Deutschland (BfArM)</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Medical Device Guidelines</li>
                <li>• Approval Decisions</li>
                <li>• Safety Communications</li>
                <li>• Regulatory Updates</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Neues Updates Summary Dialog */}
      <Dialog open={showUpdatesSummary} onOpenChange={setShowUpdatesSummary}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Download className="h-5 w-5 text-purple-600 mr-2" />
                Neueste Regulatory Updates
              </span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {loadingUpdates ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Lade Updates...</p>
              </div>
            ) : modalUpdates.length > 0 ? (
              modalUpdates.map((update: any, index: number) => (
                <Card key={update.id || index} className="border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-2">{update.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                          {update.description || update.content}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{update.source}</span>
                          <span>•</span>
                          <span>{new Date(update.publishedAt).toLocaleDateString('de-DE')}</span>
                          {update.region && (
                            <>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs">
                                {update.region}
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                      {update.url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(update.url, '_blank')}
                          className="ml-4"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Download className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Keine neuen Updates verfügbar</p>
                <p className="text-sm mt-1">Updates werden automatisch synchronisiert</p>
              </div>
            )}
            
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowUpdatesSummary(false);
                  // Navigation zu Regulatory Updates Seite
                  window.location.href = '/regulatory-updates';
                }}
              >
                Alle Updates anzeigen
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}