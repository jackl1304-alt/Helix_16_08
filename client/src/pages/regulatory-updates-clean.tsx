import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, FileText, Brain, Globe, Search, Download, ExternalLink, Clock, Calendar, Filter, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Device detection for responsive design
const useDeviceDetection = () => {
  const [device, setDevice] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true
  });

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setDevice({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024
      });
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return device;
};

interface RegulatoryUpdate {
  id: string;
  title: string;
  description?: string;
  fullText?: string;
  content?: string;
  summary?: string;
  source_id?: string;
  authority?: string;
  region: string;
  type?: string;
  update_type?: string;
  status?: string;
  priority: string;
  language?: string;
  published_at: string;
  effective_date?: string;
  created_at: string;
  tags?: string[];
  source_url?: string;
  sourceUrl?: string;
  document_url?: string;
  device_classes?: any[];
  categories?: any;
  raw_data?: any;
}

// Neue API-Funktion mit direkter Backend-Verbindung
async function fetchRegulatoryUpdates(): Promise<RegulatoryUpdate[]> {
  console.log('[FRONTEND] Fetching regulatory updates...');
  
  const response = await fetch('/api/regulatory-updates/recent?limit=5000', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('[FRONTEND] Raw API response:', data);
  
  if (!data.success || !Array.isArray(data.data)) {
    throw new Error('Invalid API response format');
  }
  
  console.log('[FRONTEND] Successfully fetched', data.data.length, 'updates');
  return data.data;
}

// Entfernt - wird nicht mehr verwendet

export default function RegulatoryUpdatesClean() {
  const device = useDeviceDetection();
  const { toast } = useToast();
  
  // State management
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedAuthority, setSelectedAuthority] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(device.isMobile ? 5 : device.isTablet ? 8 : 12);
  const [selectedUpdate, setSelectedUpdate] = useState<RegulatoryUpdate | null>(null);

  // Neue Query mit direkter API-Verbindung
  const { data: updates = [], isLoading, error } = useQuery({
    queryKey: ['regulatory-updates-clean'],
    queryFn: fetchRegulatoryUpdates,
    refetchOnWindowFocus: false,
    retry: 2
  });

  console.log('[FRONTEND] Query state:', { 
    updatesCount: updates.length, 
    isLoading, 
    hasError: !!error 
  });

  // Filter logic
  const filteredUpdates = useMemo(() => {
    return updates.filter(update => {
      const matchesRegion = selectedRegion === 'all' || update.region === selectedRegion;
      const matchesAuthority = selectedAuthority === 'all' || update.authority === selectedAuthority;
      const matchesType = selectedType === 'all' || update.update_type === selectedType || update.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || update.status === selectedStatus;
      const matchesPriority = selectedPriority === 'all' || update.priority === selectedPriority;
      const matchesSearch = !searchTerm || 
        update.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        update.description?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesRegion && matchesAuthority && matchesType && matchesStatus && matchesPriority && matchesSearch;
    });
  }, [updates, selectedRegion, selectedAuthority, selectedType, selectedStatus, selectedPriority, searchTerm]);

  // Get unique values for filters
  const regions = useMemo(() => [...new Set(updates.map(u => u.region).filter(Boolean))], [updates]);
  const authorities = useMemo(() => [...new Set(updates.map(u => u.authority).filter(Boolean))], [updates]);
  const types = useMemo(() => [...new Set(updates.map(u => u.update_type || u.type).filter(Boolean))], [updates]);
  const statuses = useMemo(() => [...new Set(updates.map(u => u.status).filter(Boolean))], [updates]);
  const priorities = useMemo(() => [...new Set(updates.map(u => u.priority).filter(Boolean))], [updates]);

  // Pagination
  const totalPages = Math.ceil(filteredUpdates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUpdates = filteredUpdates.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRegion, selectedAuthority, selectedType, selectedStatus, selectedPriority, searchTerm]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade regulatorische Updates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold">Verbindungsfehler</h3>
          <p className="text-red-600 mt-2">
            {error instanceof Error ? error.message : 'Unbekannter Fehler'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Regulatorische Updates Übersicht
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {filteredUpdates.length} von {updates.length} regulatorische Updates verfügbar
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gesamt Updates</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{updates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hohe Priorität</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {updates.filter(u => u.priority === 'high').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aktuelle Woche</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {updates.filter(u => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return new Date(u.published_at) > weekAgo;
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gefilterte</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredUpdates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Erweiterte Filter
          </CardTitle>
          <CardDescription>
            Filtern Sie die regulatorischen Updates nach verschiedenen Kriterien
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <label className="text-sm font-medium">Region</label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Region wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Regionen</SelectItem>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Behörde</label>
              <Select value={selectedAuthority} onValueChange={setSelectedAuthority}>
                <SelectTrigger>
                  <SelectValue placeholder="Behörde wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Behörden</SelectItem>
                  {authorities.map((authority) => (
                    <SelectItem key={authority} value={authority}>
                      {authority || 'Unbekannt'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Typ</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Typ wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Typen</SelectItem>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type || 'Unbekannt'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status || 'Unbekannt'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Priorität</label>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Priorität wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Prioritäten</SelectItem>
                  {priorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Suche</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Updates, Behörde oder Begriff suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {paginatedUpdates.map((update) => (
          <Card key={update.id} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold mb-2">
                    {update.title}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline" className="text-blue-600">
                      {update.region}
                    </Badge>
                    <Badge 
                      variant={update.priority === 'high' ? 'destructive' : update.priority === 'medium' ? 'default' : 'secondary'}
                      className={cn(
                        update.priority === 'high' && 'bg-red-500 text-white',
                        update.priority === 'medium' && 'bg-yellow-500 text-white',
                        update.priority === 'low' && 'bg-green-500 text-white'
                      )}
                    >
                      {update.priority}
                    </Badge>
                    {update.update_type && (
                      <Badge variant="outline" className="text-purple-600">
                        {update.update_type}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-gray-600">
                      {update.language || 'DE'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 whitespace-pre-wrap">
                {update.fullText ? update.fullText.substring(0, 300) + '...' : 
                 update.description || update.summary || 'Keine Beschreibung verfügbar'}
              </div>



              {update.tags && update.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {update.tags.slice(0, 5).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {update.tags.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{update.tags.length - 5} weitere
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(update.published_at).toLocaleDateString('de-DE')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(update.created_at).toLocaleDateString('de-DE')}
                  </span>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedUpdate(update)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Details & Analyse
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="max-w-4xl w-[95vw] h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        {update.title}
                      </DialogTitle>
                    </DialogHeader>

                    <Tabs defaultValue="overview" className="w-full mt-6">
                      <TabsList className="grid w-full grid-cols-6">
                        <TabsTrigger value="overview">Übersicht</TabsTrigger>
                        <TabsTrigger value="summary">Zusammenfassung</TabsTrigger>
                        <TabsTrigger value="content">Vollständiger Inhalt</TabsTrigger>
                        <TabsTrigger value="finance">Finanzanalyse</TabsTrigger>
                        <TabsTrigger value="ai">KI-Analyse</TabsTrigger>
                        <TabsTrigger value="metadata">Metadaten</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="mt-4">
                        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                          <h4 className="font-semibold mb-4">Übersicht</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><strong>Region:</strong> {update.region}</div>
                            <div><strong>Priorität:</strong> {update.priority}</div>
                            <div><strong>Veröffentlicht:</strong> {new Date(update.published_at).toLocaleDateString('de-DE')}</div>
                            <div><strong>Update-ID:</strong> {update.id}</div>
                          </div>
                          <div className="mt-4">
                            <strong>Beschreibung:</strong>
                            <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed mt-2">
                              {update.description || 'Keine Beschreibung verfügbar'}
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="summary" className="mt-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                          <h4 className="font-semibold mb-4 text-blue-800 dark:text-blue-300">
                            Zusammenfassung
                          </h4>
                          <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                            {update.summary || update.description || (update.fullText ? update.fullText.substring(0, 500) + '...' : 'Keine Zusammenfassung verfügbar')}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="content" className="mt-4">
                        <div className="bg-white dark:bg-gray-800 border p-6 rounded-lg">
                          <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Vollständiger Inhalt
                          </h4>
                          <div className="prose max-w-none">
                            <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                              {update.fullText || update.content || update.description || 'Kein vollständiger Inhalt verfügbar'}
                            </div>
                          </div>
                          


                          {/* Action Buttons */}
                          <div className="flex gap-4 pt-4 border-t mt-6">
                            <Button 
                              onClick={() => {
                                try {
                                  const content = `${update.title}\n\n${update.summary || update.description || ''}\n\n${update.fullText || update.content || update.description || 'Kein Inhalt verfügbar'}`;
                                  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `Regulatorisches_Update_${update.title?.replace(/[^a-z0-9äöüß\s]/gi, '_').replace(/\s+/g, '_') || 'update'}.txt`;
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                                  URL.revokeObjectURL(url);
                                  toast({
                                    title: "Download gestartet",
                                    description: "Das regulatorische Update wird heruntergeladen.",
                                  });
                                } catch (error) {
                                  console.error('Download error:', error);
                                  toast({
                                    title: "Download fehlgeschlagen",
                                    description: "Es gab ein Problem beim Herunterladen der Datei.",
                                    variant: "destructive",
                                  });
                                }
                              }}
                              className="flex items-center gap-2"
                            >
                              <Download className="h-4 w-4" />
                              Update herunterladen
                            </Button>
                            {(update.source_url || update.sourceUrl || update.document_url) && (
                              <Button 
                                variant="outline"
                                onClick={() => window.open(update.source_url || update.sourceUrl || update.document_url, '_blank')}
                                className="flex items-center gap-2"
                              >
                                <ExternalLink className="h-4 w-4" />
                                Original-Quelle öffnen
                              </Button>
                            )}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="finance" className="mt-4">
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg">
                          <h4 className="font-semibold mb-4 text-orange-800 dark:text-orange-300">
                            🔥 KI-gestützte Finanzanalyse
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            Detaillierte Finanzanalyse für dieses regulatorische Update wird hier angezeigt.
                          </p>
                        </div>
                      </TabsContent>

                      <TabsContent value="ai" className="mt-4">
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                          <h4 className="font-semibold mb-4 text-purple-800 dark:text-purple-300 flex items-center gap-2">
                            <Brain className="h-5 w-5" />
                            KI-gestützte Compliance-Analyse
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            Intelligente KI-Analyse zur Bewertung und Kategorisierung wird hier angezeigt.
                          </p>
                        </div>
                      </TabsContent>

                      <TabsContent value="metadata" className="mt-4">
                        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                          <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            Technische Metadaten
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div><strong>Update-ID:</strong> {update.id}</div>
                            <div><strong>Erstellt am:</strong> {new Date(update.created_at).toLocaleDateString('de-DE')}</div>
                            <div><strong>Datenformat:</strong> JSON</div>
                            <div><strong>Region:</strong> {update.region}</div>
                            <div><strong>Priorität:</strong> {update.priority}</div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Vorherige
          </Button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
            return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            );
          })}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Nächste
          </Button>
        </div>
      )}

      {filteredUpdates.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500">Keine regulatorischen Updates gefunden</p>
          <p className="text-sm text-gray-400 mt-2">
            Versuchen Sie andere Filtereinstellungen
          </p>
        </div>
      )}
    </div>
  );
}