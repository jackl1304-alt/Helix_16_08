import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Settings, 
  Database, 
  Rocket, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Play,
  Pause,
  RotateCcw,
  Download,
  FileText,
  Code2,
  Server,
  Search,
  Trash2,
  Shield
} from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface DevelopmentPhase {
  id: string;
  name: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending' | 'failed';
  progress: number;
  tasks: PhaseTask[];
  startDate?: string;
  completedDate?: string;
  estimatedDuration: string;
}

interface PhaseTask {
  id: string;
  name: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending' | 'failed';
  category: 'backend' | 'frontend' | 'database' | 'testing' | 'deployment';
  priority: 'high' | 'medium' | 'low';
}

export default function Administration() {
  const { toast } = useToast();
  const [activePhase, setActivePhase] = useState<string>('phase1');
  const [duplicateSearchLoading, setDuplicateSearchLoading] = useState(false);
  const [duplicateResults, setDuplicateResults] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Duplicate search function
  const handleDuplicateSearch = async () => {
    setDuplicateSearchLoading(true);
    try {
      const response = await fetch('/api/admin/search-duplicates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      const data = responseData.data;
      
      // Transform the data to match the expected format
      const transformedResults = {
        totalRecords: data.totalRegulatory + data.totalLegal,
        duplicatesFound: data.duplicateRegulatory + data.duplicateLegal,
        duplicateGroups: [],
        qualityScore: data.qualityScore,
        overallDuplicatePercentage: data.overallDuplicatePercentage,
        timestamp: data.timestamp
      };
      
      setDuplicateResults(transformedResults);
      toast({
        title: "Duplikate-Suche abgeschlossen",
        description: response.message || `${transformedResults.duplicatesFound} Duplikate gefunden`,
      });
    } catch (error: any) {
      console.error('Duplikate-Suche fehlgeschlagen:', error);
      toast({
        title: "Fehler bei der Duplikate-Suche",
        description: error.message || "Ein unbekannter Fehler ist aufgetreten.",
        variant: "destructive",
      });
    } finally {
      setDuplicateSearchLoading(false);
    }
  };

  // Automatic duplicate removal function
  const handleAutoRemoveDuplicates = async () => {
    setDeleteLoading(true);
    try {
      const response = await fetch('/api/admin/cleanup-duplicates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      
      toast({
        title: "Automatische Bereinigung abgeschlossen",
        description: `${responseData.data?.duplicatesRemoved || 0} Duplikate entfernt`,
      });
      
      // Clear results and refresh
      setDuplicateResults(null);
      await handleDuplicateSearch();
    } catch (error: any) {
      console.error('Automatische Duplikat-Entfernung fehlgeschlagen:', error);
      toast({
        title: "Fehler bei automatischer Bereinigung",
        description: error.message || "Ein unbekannter Fehler ist aufgetreten.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Delete duplicates function
  const handleDeleteDuplicates = async () => {
    if (!duplicateResults?.removalCandidates?.length) {
      toast({
        title: "Keine Duplikate zum Löschen",
        description: "Führe zuerst eine Duplikate-Suche durch.",
        variant: "destructive",
      });
      return;
    }

    setDeleteLoading(true);
    try {
      // Process duplicates in smaller batches to avoid payload limits
      const batchSize = 100;
      const candidates = duplicateResults.removalCandidates;
      let totalRemoved = 0;
      
      for (let i = 0; i < candidates.length; i += batchSize) {
        const batch = candidates.slice(i, i + batchSize);
        const response = await apiRequest('/api/quality/remove-duplicates', 'POST', { candidateIds: batch });
        totalRemoved += response.removedCount || 0;
      }
      
      toast({
        title: "Duplikate erfolgreich gelöscht",
        description: `${totalRemoved} Duplikate wurden entfernt.`,
      });
      
      // Refresh search results
      await handleDuplicateSearch();
    } catch (error: any) {
      console.error('Duplikate-Löschung fehlgeschlagen:', error);
      toast({
        title: "Fehler beim Löschen der Duplikate",
        description: error.message || "Ein unbekannter Fehler ist aufgetreten.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Fetch development phases
  const { data: phases, isLoading } = useQuery({
    queryKey: ['/api/admin/development-phases'],
    queryFn: async () => {
      // Mock data für Development Phases
      const mockPhases: DevelopmentPhase[] = [
        {
          id: 'phase1',
          name: 'Phase 1: System-Grundlagen',
          description: 'Grundlegende Systemarchitektur und Core-Funktionalitäten',
          status: 'completed',
          progress: 100,
          startDate: '2025-07-15T00:00:00Z',
          completedDate: '2025-07-31T00:00:00Z',
          estimatedDuration: '2 Wochen',
          tasks: [
            {
              id: 'p1-t1',
              name: 'Datenbank-Schema erstellen',
              description: 'PostgreSQL Schema für Knowledge Base, Legal Cases und Regulatory Updates',
              status: 'completed',
              category: 'database',
              priority: 'high'
            },
            {
              id: 'p1-t2',
              name: 'Backend API Grundgerüst',
              description: 'Express.js Server mit TypeScript und Drizzle ORM',
              status: 'completed',
              category: 'backend',
              priority: 'high'
            },
            {
              id: 'p1-t3',
              name: 'Frontend Basis-Setup',
              description: 'React mit TypeScript und Tailwind CSS',
              status: 'completed',
              category: 'frontend',
              priority: 'high'
            },
            {
              id: 'p1-t4',
              name: 'Authentication System',
              description: 'Replit OpenID Connect Integration',
              status: 'completed',
              category: 'backend',
              priority: 'medium'
            }
          ]
        },
        {
          id: 'phase2',
          name: 'Phase 2: Data Collection & AI',
          description: 'Automatisierte Datensammlung und KI-gestützte Analyse',
          status: 'completed',
          progress: 95,
          startDate: '2025-07-31T00:00:00Z',
          completedDate: '2025-08-01T00:00:00Z',
          estimatedDuration: '1 Woche',
          tasks: [
            {
              id: 'p2-t1',
              name: 'Universal Knowledge Extractor',
              description: '13 internationale Datenquellen Integration',
              status: 'completed',
              category: 'backend',
              priority: 'high'
            },
            {
              id: 'p2-t2',
              name: 'JAMA Network Integration',
              description: 'Spezielle Integration für medizinische Fachartikel',
              status: 'completed',
              category: 'backend',
              priority: 'high'
            },
            {
              id: 'p2-t3',
              name: 'Knowledge Base Frontend',
              description: 'Benutzeroberfläche für Knowledge Articles',
              status: 'completed',
              category: 'frontend',
              priority: 'medium'
            },
            {
              id: 'p2-t4',
              name: 'AI Content Analysis',
              description: 'Automatische Kategorisierung und Bewertung',
              status: 'in-progress',
              category: 'backend',
              priority: 'medium'
            }
          ]
        },
        {
          id: 'phase3',
          name: 'Phase 3: Production & Optimization',
          description: 'Production-Deployment und Performance-Optimierung',
          status: 'in-progress',
          progress: 75,
          startDate: '2025-08-01T00:00:00Z',
          estimatedDuration: '1 Woche',
          tasks: [
            {
              id: 'p3-t1',
              name: 'Production Deployment',
              description: 'Replit Deployment mit Custom Domain',
              status: 'completed',
              category: 'deployment',
              priority: 'high'
            },
            {
              id: 'p3-t2',
              name: 'Performance Monitoring',
              description: 'Winston Logging und Health Checks',
              status: 'completed',
              category: 'backend',
              priority: 'high'
            },
            {
              id: 'p3-t3',
              name: 'Security Hardening',
              description: 'Rate Limiting, Input Validation, HTTPS',
              status: 'completed',
              category: 'backend',
              priority: 'high'
            },
            {
              id: 'p3-t4',
              name: 'Documentation Suite',
              description: 'Umfassende System-Dokumentation',
              status: 'completed',
              category: 'backend',
              priority: 'medium'
            },
            {
              id: 'p3-t5',
              name: 'Advanced Analytics',
              description: 'Dashboard-Optimierung und Reporting',
              status: 'in-progress',
              category: 'frontend',
              priority: 'medium'
            },
            {
              id: 'p3-t6',
              name: 'User Experience Polish',
              description: 'UI/UX Verbesserungen und Mobile Optimierung',
              status: 'pending',
              category: 'frontend',
              priority: 'low'
            }
          ]
        }
      ];
      return mockPhases;
    }
  });

  // Execute phase action
  const executePhase = useMutation({
    mutationFn: async ({ phaseId, action }: { phaseId: string, action: 'start' | 'pause' | 'restart' }) => {
      try {
        const response = await fetch(`/api/admin/phases/${phaseId}/${action}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({})
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        console.error("Phase execution error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/development-phases'] });
      toast({
        title: "Phase-Aktion erfolgreich",
        description: "Die Entwicklungsphase wurde aktualisiert.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Download documentation
  const downloadDocs = useMutation({
    mutationFn: async (format: 'pdf' | 'zip') => {
      const response = await fetch(`/api/admin/download-documentation?format=${format}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `helix-documentation.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Download gestartet",
        description: "Die Dokumentation wird heruntergeladen.",
      });
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'completed': 'default',
      'in-progress': 'secondary',
      'pending': 'outline',
      'failed': 'destructive'
    } as const;

    const labels = {
      'completed': 'Abgeschlossen',
      'in-progress': 'In Bearbeitung',
      'pending': 'Ausstehend',
      'failed': 'Fehlgeschlagen'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'backend':
        return <Server className="h-4 w-4" />;
      case 'frontend':
        return <Code2 className="h-4 w-4" />;
      case 'database':
        return <Database className="h-4 w-4" />;
      case 'deployment':
        return <Rocket className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return <div className="p-6">Lade Administration...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Administration</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Entwicklungsphasen und System-Management
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => downloadDocs.mutate('zip')}
            disabled={downloadDocs.isPending}
          >
            <Download className="h-4 w-4 mr-2" />
            Dokumentation (.zip)
          </Button>
          <Button
            variant="outline"
            onClick={() => downloadDocs.mutate('pdf')}
            disabled={downloadDocs.isPending}
          >
            <FileText className="h-4 w-4 mr-2" />
            Dokumentation (.pdf)
          </Button>
        </div>
      </div>

      <Tabs value={activePhase} onValueChange={setActivePhase} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="phase1" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Phase 1
          </TabsTrigger>
          <TabsTrigger value="phase2" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Phase 2
          </TabsTrigger>
          <TabsTrigger value="phase3" className="flex items-center gap-2">
            <Rocket className="h-4 w-4" />
            Phase 3
          </TabsTrigger>
          <TabsTrigger value="duplicates" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Duplikate-Management
          </TabsTrigger>
        </TabsList>

        {phases?.map((phase) => (
          <TabsContent key={phase.id} value={phase.id} className="space-y-6">
            {/* Phase Overview Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-xl">{phase.name}</CardTitle>
                    {getStatusBadge(phase.status)}
                  </div>
                  
                  <div className="flex gap-2">
                    {phase.status === 'in-progress' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => executePhase.mutate({ phaseId: phase.id, action: 'pause' })}
                        disabled={executePhase.isPending}
                      >
                        <Pause className="h-4 w-4" />
                      </Button>
                    )}
                    {phase.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => executePhase.mutate({ phaseId: phase.id, action: 'start' })}
                        disabled={executePhase.isPending}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Starten
                      </Button>
                    )}
                    {(phase.status === 'failed' || phase.status === 'completed') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => executePhase.mutate({ phaseId: phase.id, action: 'restart' })}
                        disabled={executePhase.isPending}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400">
                  {phase.description}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Fortschritt</span>
                    <span>{phase.progress}%</span>
                  </div>
                  <Progress value={phase.progress} className="h-2" />
                </div>

                {/* Phase Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Geschätzte Dauer:</span>
                    <br />
                    {phase.estimatedDuration}
                  </div>
                  {phase.startDate && (
                    <div>
                      <span className="font-medium">Startdatum:</span>
                      <br />
                      {new Date(phase.startDate).toLocaleDateString('de-DE')}
                    </div>
                  )}
                  {phase.completedDate && (
                    <div>
                      <span className="font-medium">Abgeschlossen:</span>
                      <br />
                      {new Date(phase.completedDate).toLocaleDateString('de-DE')}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tasks Card */}
            <Card>
              <CardHeader>
                <CardTitle>Aufgaben ({phase.tasks.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {phase.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(task.status)}
                        {getCategoryIcon(task.category)}
                        <div>
                          <div className="font-medium">{task.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {task.description}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'outline'}>
                          {task.priority === 'high' ? 'Hoch' : task.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                        </Badge>
                        {getStatusBadge(task.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
        
        {/* Duplicates Management Tab */}
        <TabsContent value="duplicates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Duplikate-Management
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400">
                Suche und verwalte doppelte Einträge in der Datenbank
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Controls */}
              <div className="flex gap-4">
                <Button
                  onClick={handleDuplicateSearch}
                  disabled={duplicateSearchLoading}
                  className="flex items-center gap-2"
                >
                  {duplicateSearchLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Duplikate suchen
                </Button>
                
                <Button
                  onClick={handleAutoRemoveDuplicates}
                  disabled={deleteLoading}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                >
                  {deleteLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Automatisch bereinigen
                </Button>

                {duplicateResults && duplicateResults.duplicatesFound > 0 && (
                  <Button
                    onClick={handleDeleteDuplicates}
                    disabled={deleteLoading}
                    className="flex items-center gap-2 bg-[#d95d2c] hover:bg-[#b8441f] text-white"
                  >
                    {deleteLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Duplikate löschen ({duplicateResults.duplicatesFound})
                  </Button>
                )}
              </div>

              {/* Results Display */}
              {duplicateResults && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">
                          {duplicateResults.totalRecords}
                        </div>
                        <div className="text-sm text-gray-600">Gesamte Einträge</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-orange-600">
                          {duplicateResults.duplicatesFound}
                        </div>
                        <div className="text-sm text-gray-600">Duplikate gefunden</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-blue-600">
                          {duplicateResults.duplicateGroups?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">Duplikate-Gruppen</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Detailed Results */}
                  {duplicateResults.duplicateGroups && duplicateResults.duplicateGroups.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Gefundene Duplikate-Gruppen</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {duplicateResults.duplicateGroups.slice(0, 10).map((group: any, index: number) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <div className="font-medium">Gruppe {index + 1}</div>
                                <Badge variant="outline">
                                  {group.records?.length || 0} Einträge
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                {group.records?.slice(0, 3).map((record: any, recordIndex: number) => (
                                  <div key={recordIndex} className="truncate">
                                    • {record.title || record.id}
                                  </div>
                                ))}
                                {group.records?.length > 3 && (
                                  <div className="text-xs text-gray-500">
                                    ... und {group.records.length - 3} weitere
                                  </div>
                                )}
                              </div>
                              <div className="mt-2 text-xs">
                                Ähnlichkeit: {((group.confidence || 0) * 100).toFixed(1)}%
                              </div>
                            </div>
                          ))}
                          {duplicateResults.duplicateGroups.length > 10 && (
                            <div className="text-center text-sm text-gray-500 p-2">
                              ... und {duplicateResults.duplicateGroups.length - 10} weitere Gruppen
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {duplicateResults && duplicateResults.duplicatesFound === 0 && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Keine Duplikate gefunden</h3>
                    <p className="text-gray-600">Die Datenbank ist bereits bereinigt.</p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}