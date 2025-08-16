import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CustomerNavigation, { type CustomerPermissions } from '@/components/customer/customer-navigation';
import { useLiveTenantPermissions } from '@/hooks/use-live-tenant-permissions';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Database, Activity, CheckCircle, AlertTriangle, Clock, Play, Pause, RotateCcw, Download } from 'lucide-react';

// Mock tenant ID
const mockTenantId = "030d3e01-32c4-4f95-8d54-98be948e8d4b";

interface CollectionJob {
  id: string;
  name: string;
  source: string;
  status: 'running' | 'completed' | 'failed' | 'paused' | 'scheduled';
  progress: number;
  recordsCollected: number;
  totalRecords: number;
  startTime: string;
  endTime?: string;
  nextRun?: string;
  errors: number;
  warnings: number;
  schedule: string;
  region: string;
  dataType: string;
}

interface CollectionStats {
  totalJobs: number;
  activeJobs: number;
  successfulJobs: number;
  failedJobs: number;
  totalRecords: number;
  averageSuccess: number;
}

export default function CustomerDataCollection() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedDataType, setSelectedDataType] = useState('all');
  
  const params = useParams();
  const tenantId = params.tenantId || mockTenantId;
  const { t } = useLanguage();

  // Use live tenant permissions hook for real-time updates
  const { 
    permissions: livePermissions, 
    tenantName: liveTenantName, 
    isLoading: isTenantLoading 
  } = useLiveTenantPermissions({ 
    tenantId,
    pollInterval: 3000
  });

  // Use live permissions with fallback
  const permissions = livePermissions || {
    dashboard: true,
    regulatoryUpdates: true,
    legalCases: true,
    knowledgeBase: true,
    newsletters: true,
    analytics: false,
    reports: false,
    dataCollection: true,
    globalSources: false,
    historicalData: false,
    administration: false,
    userManagement: false,
    systemSettings: false,
    auditLogs: false,
    aiInsights: false,
    advancedAnalytics: false
  };

  // Fetch collection data - only if user has permission
  const { data: collectionData, isLoading } = useQuery({
    queryKey: ['/api/data-collection', tenantId],
    queryFn: async () => {
      const response = await fetch('/api/data-collection');
      if (!response.ok) throw new Error('Failed to fetch collection data');
      return await response.json();
    },
    enabled: Boolean(permissions?.dataCollection),
    refetchInterval: 5000 // Update every 5 seconds for real-time data
  });

  if (isTenantLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex items-center justify-center w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Check permission
  if (!permissions?.dataCollection) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Language Selector - Top Right */}
        <div className="fixed top-4 right-4 z-50">
          <LanguageSelector />
        </div>
        
        <CustomerNavigation 
          permissions={permissions} 
          tenantName={liveTenantName || "Customer Portal"} 
        />
        
        <main className="ml-64 flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                {t('access.restricted')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Sie haben keine Berechtigung für den Zugriff auf Datensammlung. 
                Kontaktieren Sie Ihren Administrator für weitere Informationen.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const jobs: CollectionJob[] = collectionData?.jobs || [];
  const stats: CollectionStats = collectionData?.stats || {
    totalJobs: 0,
    activeJobs: 0,
    successfulJobs: 0,
    failedJobs: 0,
    totalRecords: 0,
    averageSuccess: 0
  };

  // Filter jobs
  const filteredJobs = jobs.filter((job: CollectionJob) => {
    const matchesStatus = selectedStatus === 'all' || job.status === selectedStatus;
    const matchesRegion = selectedRegion === 'all' || job.region === selectedRegion;
    const matchesDataType = selectedDataType === 'all' || job.dataType === selectedDataType;
    
    return matchesStatus && matchesRegion && matchesDataType;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Activity className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'paused':
        return <Pause className="w-5 h-5 text-yellow-500" />;
      case 'scheduled':
        return <Clock className="w-5 h-5 text-gray-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      running: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      paused: 'bg-yellow-100 text-yellow-800',
      scheduled: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || variants.scheduled}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Language Selector - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSelector />
      </div>
      
      <CustomerNavigation 
        permissions={permissions} 
        tenantName={liveTenantName || "Customer Portal"} 
      />
      
      <main className="ml-64 flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Datensammlung
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Übersicht über laufende und geplante Datensammlung-Prozesse
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Gesamt Jobs</p>
                    <div className="text-2xl font-bold">{stats.totalJobs}</div>
                  </div>
                  <Database className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Aktive Jobs</p>
                    <div className="text-2xl font-bold text-blue-600">{stats.activeJobs}</div>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Erfolgreiche Jobs</p>
                    <div className="text-2xl font-bold text-green-600">{stats.successfulJobs}</div>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Gesamt Datensätze</p>
                    <div className="text-2xl font-bold text-purple-600">{stats.totalRecords.toLocaleString()}</div>
                  </div>
                  <Download className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Status</SelectItem>
                      <SelectItem value="running">Läuft</SelectItem>
                      <SelectItem value="completed">Abgeschlossen</SelectItem>
                      <SelectItem value="failed">Fehlgeschlagen</SelectItem>
                      <SelectItem value="paused">Pausiert</SelectItem>
                      <SelectItem value="scheduled">Geplant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Regionen</SelectItem>
                      <SelectItem value="eu">Europa</SelectItem>
                      <SelectItem value="usa">USA</SelectItem>
                      <SelectItem value="asia">Asien</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={selectedDataType} onValueChange={setSelectedDataType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Datentyp" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Typen</SelectItem>
                      <SelectItem value="regulations">Regulierungen</SelectItem>
                      <SelectItem value="approvals">Zulassungen</SelectItem>
                      <SelectItem value="legal">Rechtsprechung</SelectItem>
                      <SelectItem value="news">News</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Jobs List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                </div>
              ))}
            </div>
          ) : filteredJobs && filteredJobs.length > 0 ? (
            <div className="space-y-4">
              {filteredJobs.map((job: CollectionJob) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(job.status)}
                        <div>
                          <h3 className="text-lg font-semibold">{job.name}</h3>
                          <p className="text-sm text-gray-500">{job.source}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(job.status)}
                        <Badge variant="outline">{job.region}</Badge>
                        <Badge variant="outline">{job.dataType}</Badge>
                      </div>
                    </div>

                    {job.status === 'running' && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span>Fortschritt: {job.recordsCollected.toLocaleString()} / {job.totalRecords.toLocaleString()}</span>
                          <span>{job.progress}%</span>
                        </div>
                        <Progress value={job.progress} />
                      </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 text-sm">
                      <div>
                        <div className="text-gray-500">Start:</div>
                        <div className="font-medium">
                          {new Date(job.startTime).toLocaleString('de-DE')}
                        </div>
                      </div>
                      {job.endTime && (
                        <div>
                          <div className="text-gray-500">Ende:</div>
                          <div className="font-medium">
                            {new Date(job.endTime).toLocaleString('de-DE')}
                          </div>
                        </div>
                      )}
                      {job.nextRun && (
                        <div>
                          <div className="text-gray-500">Nächster Lauf:</div>
                          <div className="font-medium">
                            {new Date(job.nextRun).toLocaleString('de-DE')}
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="text-gray-500">Zeitplan:</div>
                        <div className="font-medium">{job.schedule}</div>
                      </div>
                    </div>

                    {(job.errors > 0 || job.warnings > 0) && (
                      <div className="flex items-center gap-4 mt-4 text-sm">
                        {job.errors > 0 && (
                          <div className="flex items-center gap-1 text-red-600">
                            <AlertTriangle className="w-4 h-4" />
                            {job.errors} Fehler
                          </div>
                        )}
                        {job.warnings > 0 && (
                          <div className="flex items-center gap-1 text-yellow-600">
                            <AlertTriangle className="w-4 h-4" />
                            {job.warnings} Warnungen
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      {job.status === 'running' && (
                        <Button variant="outline" size="sm">
                          <Pause className="w-4 h-4 mr-1" />
                          Pausieren
                        </Button>
                      )}
                      {job.status === 'paused' && (
                        <Button variant="outline" size="sm">
                          <Play className="w-4 h-4 mr-1" />
                          Fortsetzen
                        </Button>
                      )}
                      {(job.status === 'failed' || job.status === 'completed') && (
                        <Button variant="outline" size="sm">
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Wiederholen
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        Details anzeigen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Database className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Keine Datensammlung-Jobs verfügbar
                </h3>
                <p className="text-gray-500">
                  {selectedStatus !== 'all' || selectedRegion !== 'all' || selectedDataType !== 'all' 
                    ? 'Ihre Filterkriterien ergaben keine Treffer.' 
                    : 'Aktuell sind keine Datensammlung-Jobs konfiguriert.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}