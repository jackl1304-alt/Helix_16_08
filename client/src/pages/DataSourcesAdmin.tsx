import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Globe, 
  Key, 
  RefreshCw,
  Shield,
  Zap,
  Database,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";

interface DataSource {
  id: string;
  name: string;
  type: 'official_api' | 'web_scraping' | 'partner_api';
  endpoint?: string;
  requiresAuth: boolean;
  priority: 'high' | 'medium' | 'low';
  region: string;
  status: 'active' | 'inactive' | 'testing';
  lastSync?: string;
  errorCount: number;
}

interface HealthCheckResult {
  healthy: number;
  unhealthy: number;
  details: Array<{
    sourceId: string;
    status: 'healthy' | 'unhealthy';
    lastSync?: string;
    error?: string;
  }>;
}

export default function DataSourcesAdmin() {
  const [selectedSource, setSelectedSource] = useState<DataSource | null>(null);
  const [apiKey, setApiKey] = useState('');
  const queryClient = useQueryClient();

  // Fetch data sources
  const { data: dataSources = [], isLoading } = useQuery<DataSource[]>({
    queryKey: ['/api/admin/data-sources'],
  });

  // Health check query
  const { data: healthCheck, isLoading: healthLoading } = useQuery<HealthCheckResult>({
    queryKey: ['/api/admin/data-sources/health'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: (sourceId: string) => apiRequest(`/api/admin/data-sources/${sourceId}/sync`, {
      method: 'POST'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/data-sources'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/data-sources/health'] });
    }
  });

  // Configure API key mutation
  const configMutation = useMutation({
    mutationFn: ({ sourceId, apiKey }: { sourceId: string; apiKey: string }) => 
      apiRequest(`/api/admin/data-sources/${sourceId}/configure`, {
        method: 'POST',
        body: JSON.stringify({ apiKey })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/data-sources'] });
      setApiKey('');
      setSelectedSource(null);
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'testing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'official_api': return <Zap className="h-4 w-4" />;
      case 'web_scraping': return <Globe className="h-4 w-4" />;
      case 'partner_api': return <Shield className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Lade Datenquellen...</div>
      </div>
    );
  }

  const officialAPIs = dataSources.filter(ds => ds.type === 'official_api');
  const webScrapingSources = dataSources.filter(ds => ds.type === 'web_scraping');
  const partnerAPIs = dataSources.filter(ds => ds.type === 'partner_api');
  const unauthenticatedSources = dataSources.filter(ds => ds.requiresAuth && ds.status === 'testing');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Datenquellen-Administration</h1>
          <p className="text-gray-600">Verwalten Sie alle API-Verbindungen und Datenquellen</p>
        </div>
        
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/data-sources'] })}
          variant="outline"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Aktualisieren
        </Button>
      </div>

      {/* Health Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            System-Gesundheit
          </CardTitle>
        </CardHeader>
        <CardContent>
          {healthLoading ? (
            <div>Prüfe Systemstatus...</div>
          ) : healthCheck ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{healthCheck.healthy}</div>
                <div className="text-sm text-gray-600">Gesunde Quellen</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{healthCheck.unhealthy}</div>
                <div className="text-sm text-gray-600">Problematische Quellen</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{dataSources.length}</div>
                <div className="text-sm text-gray-600">Gesamt-Quellen</div>
              </div>
            </div>
          ) : (
            <div>Systemstatus nicht verfügbar</div>
          )}
        </CardContent>
      </Card>

      {/* Authentication Required Alert */}
      {unauthenticatedSources.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-1" />
              <div>
                <h3 className="font-medium text-yellow-800">Authentifizierung erforderlich</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {unauthenticatedSources.length} Datenquellen benötigen API-Schlüssel oder Zugangsdaten
                </p>
                <div className="mt-2 space-x-2">
                  {unauthenticatedSources.map(source => (
                    <Badge key={source.id} variant="outline" className="text-yellow-700">
                      {source.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="official-apis" className="space-y-4">
        <TabsList>
          <TabsTrigger value="official-apis">
            Offizielle APIs ({officialAPIs.length})
          </TabsTrigger>
          <TabsTrigger value="web-scraping">
            Web Scraping ({webScrapingSources.length})
          </TabsTrigger>
          <TabsTrigger value="partner-apis">
            Partner APIs ({partnerAPIs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="official-apis" className="space-y-4">
          <div className="grid gap-4">
            {officialAPIs.map((source) => (
              <Card key={source.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(source.type)}
                      <div>
                        <h3 className="font-medium">{source.name}</h3>
                        <p className="text-sm text-gray-600">{source.region}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(source.status)}>
                        {source.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {source.status === 'inactive' && <AlertCircle className="h-3 w-3 mr-1" />}
                        {source.status === 'testing' && <Clock className="h-3 w-3 mr-1" />}
                        {source.status}
                      </Badge>
                      
                      <span className={`text-sm font-medium ${getPriorityColor(source.priority)}`}>
                        {source.priority}
                      </span>
                      
                      {source.requiresAuth && source.status === 'testing' && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedSource(source)}
                            >
                              <Key className="h-4 w-4 mr-1" />
                              Konfigurieren
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{source.name} konfigurieren</DialogTitle>
                              <DialogDescription>
                                Diese Datenquelle benötigt einen API-Schlüssel oder Zugangsdaten.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="apiKey">API-Schlüssel</Label>
                                <Input
                                  id="apiKey"
                                  type="password"
                                  value={apiKey}
                                  onChange={(e) => setApiKey(e.target.value)}
                                  placeholder="Geben Sie Ihren API-Schlüssel ein"
                                />
                              </div>
                              <Button
                                onClick={() => source && configMutation.mutate({ sourceId: source.id, apiKey })}
                                disabled={!apiKey || configMutation.isPending}
                                className="w-full"
                              >
                                {configMutation.isPending ? 'Konfiguriere...' : 'API-Schlüssel speichern'}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      
                      <Button
                        size="sm"
                        onClick={() => syncMutation.mutate(source.id)}
                        disabled={syncMutation.isPending || source.status !== 'active'}
                      >
                        {syncMutation.isPending ? 'Sync...' : 'Synchronisieren'}
                      </Button>
                    </div>
                  </div>
                  
                  {source.lastSync && (
                    <div className="mt-3 text-xs text-gray-500">
                      Letzte Synchronisation: {new Date(source.lastSync).toLocaleString('de-DE')}
                    </div>
                  )}
                  
                  {source.errorCount > 0 && (
                    <div className="mt-2 text-xs text-red-600">
                      {source.errorCount} Fehler seit letzter erfolgreicher Synchronisation
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="web-scraping" className="space-y-4">
          <div className="grid gap-4">
            {webScrapingSources.map((source) => (
              <Card key={source.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(source.type)}
                      <div>
                        <h3 className="font-medium">{source.name}</h3>
                        <p className="text-sm text-gray-600">{source.region} • Web Scraping</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(source.status)}>
                        {source.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {source.status === 'inactive' && <AlertCircle className="h-3 w-3 mr-1" />}
                        {source.status}
                      </Badge>
                      
                      <Button
                        size="sm"
                        onClick={() => syncMutation.mutate(source.id)}
                        disabled={syncMutation.isPending}
                      >
                        {syncMutation.isPending ? 'Sync...' : 'Scraping starten'}
                      </Button>
                    </div>
                  </div>
                  
                  {source.lastSync && (
                    <div className="mt-3 text-xs text-gray-500">
                      Letztes Scraping: {new Date(source.lastSync).toLocaleString('de-DE')}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="partner-apis" className="space-y-4">
          <div className="grid gap-4">
            {partnerAPIs.map((source) => (
              <Card key={source.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(source.type)}
                      <div>
                        <h3 className="font-medium">{source.name}</h3>
                        <p className="text-sm text-gray-600">{source.region} • Partner Integration</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(source.status)}>
                        <Shield className="h-3 w-3 mr-1" />
                        {source.status}
                      </Badge>
                      
                      <Button
                        size="sm"
                        onClick={() => syncMutation.mutate(source.id)}
                        disabled={syncMutation.isPending}
                      >
                        {syncMutation.isPending ? 'Sync...' : 'Synchronisieren'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}