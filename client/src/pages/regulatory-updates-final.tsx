import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, FileText, Calendar, Clock, Brain, Download, ExternalLink, Search, Filter, Globe, BarChart3, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface RegulatoryUpdate {
  id: string;
  title: string;
  description?: string;
  content?: string;
  fullText?: string;
  summary?: string;
  source_id?: string;
  source_url?: string;
  sourceUrl?: string;
  document_url?: string;
  region: string;
  update_type: string;
  priority: string;
  device_classes?: string[];
  categories?: any;
  raw_data?: any;
  published_at: string;
  created_at: string;
  source?: string;
  tags?: string[];
  language?: string;
}

export default function RegulatoryUpdatesFinal() {
  const { toast } = useToast();
  const [selectedUpdate, setSelectedUpdate] = useState<RegulatoryUpdate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Direkte API-Verbindung
  const { data: updates = [], isLoading, error } = useQuery({
    queryKey: ['regulatory-updates-final'],
    queryFn: async () => {
      console.log('[FINAL] Fetching updates...');
      const response = await fetch('/api/regulatory-updates/recent?limit=5000');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      console.log('[FINAL] Raw response:', data);
      return data.data || [];
    },
    refetchOnWindowFocus: false
  });

  // Filter und Suche - sicherstellen dass updates existiert
  const filteredUpdates = (updates || []).filter((update: RegulatoryUpdate) => {
    const matchesSearch = !searchTerm || 
      update.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.fullText?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRegion = selectedRegion === 'all' || update.region === selectedRegion;
    
    const matchesCategory = selectedCategory === 'all' || 
      update.update_type?.toLowerCase() === selectedCategory.toLowerCase();
    
    const matchesSource = selectedSource === 'all' || 
      update.source_id?.toLowerCase().includes(selectedSource.toLowerCase()) ||
      update.source?.toLowerCase().includes(selectedSource.toLowerCase());
    
    const matchesPriority = selectedPriority === 'all' || 
      update.priority?.toLowerCase() === selectedPriority.toLowerCase();
    
    return matchesSearch && matchesRegion && matchesCategory && matchesSource && matchesPriority;
  });

  // Paginierung
  const totalPages = Math.ceil(filteredUpdates.length / itemsPerPage);
  const paginatedUpdates = filteredUpdates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="text-xl">Lade regulatorische Updates...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="text-xl text-red-600">Fehler beim Laden der Updates</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Regulatorische Updates
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {filteredUpdates.length} von {updates?.length || 0} Updates verfügbar
          </p>
        </div>

        {/* Erweiterte Filteroptionen */}
        <div className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-xl border border-green-200 dark:border-green-700">
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Erweiterte Filteroptionen</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kategorie</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Alle Kategorien" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Kategorien</SelectItem>
                  <SelectItem value="approval">Zulassungen</SelectItem>
                  <SelectItem value="guidance">Leitfäden</SelectItem>
                  <SelectItem value="regulation">Verordnungen</SelectItem>
                  <SelectItem value="alert">Warnungen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Region</label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Alle Regionen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Regionen</SelectItem>
                  <SelectItem value="Global">Global</SelectItem>
                  <SelectItem value="Europe">Europa</SelectItem>
                  <SelectItem value="North America">Nordamerika</SelectItem>
                  <SelectItem value="Asia">Asien</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quelle</label>
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Alle Quellen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Quellen</SelectItem>
                  <SelectItem value="EMA">EMA</SelectItem>
                  <SelectItem value="FDA">FDA</SelectItem>
                  <SelectItem value="BfArM">BfArM</SelectItem>
                  <SelectItem value="Swissmedic">Swissmedic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priorität</label>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Alle Prioritäten" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Prioritäten</SelectItem>
                  <SelectItem value="critical">Kritisch</SelectItem>
                  <SelectItem value="high">Hoch</SelectItem>
                  <SelectItem value="medium">Mittel</SelectItem>
                  <SelectItem value="low">Niedrig</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Suche</label>
              <Input
                placeholder="Artikel, Quelle oder Inhalt suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Statistik-Karten */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Gesamte Artikel</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{updates?.length || 0}</p>
                </div>
                <FileText className="h-12 w-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">Gefiltert</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100">{filteredUpdates.length}</p>
                </div>
                <Filter className="h-12 w-12 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Quellen</p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                    {new Set((updates || []).map(u => u.source_id || u.source || 'Unbekannt')).size}
                  </p>
                </div>
                <Globe className="h-12 w-12 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Kategorien</p>
                  <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                    {new Set((updates || []).map(u => u.update_type || 'Sonstiges')).size}
                  </p>
                </div>
                <BarChart3 className="h-12 w-12 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kompakte Updates Liste */}
        <div className="space-y-3 mb-8">
          {paginatedUpdates.map((update: RegulatoryUpdate) => (
            <Card key={update.id} className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {update.title}
                  </h3>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      {update.region}
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      {update.update_type}
                    </Badge>
                    <Badge variant="outline" className={cn(
                      "text-xs border",
                      update.priority === 'high' ? "bg-red-50 text-red-700 border-red-200" :
                      update.priority === 'medium' ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                      "bg-gray-50 text-gray-700 border-gray-200"
                    )}>
                      {update.priority}
                    </Badge>
                  </div>

                  {/* Kompakte Beschreibung */}
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {update.description?.split('\n')[0] || update.content?.substring(0, 100) + '...' || 'Keine Beschreibung verfügbar'}
                  </div>

                  {/* Wichtige Punkte anzeigen */}
                  {update.description?.includes('WICHTIGE ÄNDERUNGEN:') && (
                    <div className="text-sm space-y-1 mb-2">
                      {update.description.split('\n').slice(2, 6).map((line, idx) => 
                        line.trim().startsWith('•') && (
                          <div key={idx} className="text-gray-700 dark:text-gray-300">{line}</div>
                        )
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(update.published_at).toLocaleDateString('de-DE')}
                    </div>
                    {update.source_id && (
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {update.source_id}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="ml-4">
                  <Dialog onOpenChange={(open) => {
                    if (open) setSelectedUpdate(update);
                    else setSelectedUpdate(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 text-xs"
                      >
                        <Eye className="h-3 w-3" />
                        Details & Analyse
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-4xl w-[95vw] h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          {selectedUpdate?.title}
                        </DialogTitle>
                      </DialogHeader>

                      {selectedUpdate && (
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
                              <div><strong>Region:</strong> {selectedUpdate.region}</div>
                              <div><strong>Priorität:</strong> {selectedUpdate.priority}</div>
                              <div><strong>Veröffentlicht:</strong> {new Date(selectedUpdate.published_at).toLocaleDateString('de-DE')}</div>
                              <div><strong>Update-ID:</strong> {selectedUpdate.id}</div>
                            </div>
                            <div className="mt-4">
                              <strong>Beschreibung:</strong>
                              <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed mt-2">
                                {selectedUpdate.description || 'Keine Beschreibung verfügbar'}
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
                              {selectedUpdate.summary || selectedUpdate.description || (selectedUpdate.fullText ? selectedUpdate.fullText.substring(0, 500) + '...' : 'Keine Zusammenfassung verfügbar')}
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="content" className="mt-4">
                          <div className="bg-white dark:bg-gray-800 border p-6 rounded-lg">
                            <h4 className="font-semibold mb-4 flex items-center gap-2">
                              <FileText className="h-5 w-5" />
                              Vollständiger Inhalt
                            </h4>
                            


                            {/* DIREKTER VOLLTEXT */}
                            <div className="prose max-w-none">
                              <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed text-sm">
                                {selectedUpdate.fullText || selectedUpdate.content || selectedUpdate.description || 'Kein vollständiger Inhalt verfügbar'}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-4 border-t mt-6">
                              <Button 
                                onClick={() => {
                                  try {
                                    const content = `${selectedUpdate.title}\n\n${selectedUpdate.summary || selectedUpdate.description || ''}\n\n${selectedUpdate.fullText || selectedUpdate.content || selectedUpdate.description || 'Kein Inhalt verfügbar'}`;
                                    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `Regulatorisches_Update_${selectedUpdate.title?.replace(/[^a-z0-9äöüß\s]/gi, '_').replace(/\s+/g, '_') || 'update'}.txt`;
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
                              {(selectedUpdate.source_url || selectedUpdate.sourceUrl || selectedUpdate.document_url) && (
                                <Button 
                                  variant="outline"
                                  onClick={() => window.open(selectedUpdate.source_url || selectedUpdate.sourceUrl || selectedUpdate.document_url, '_blank')}
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
                            <h4 className="font-semibold mb-4">Metadaten</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div><strong>Update-ID:</strong> {selectedUpdate.id}</div>
                              <div><strong>Quelle:</strong> {selectedUpdate.source || 'Unbekannt'}</div>
                              <div><strong>Sprache:</strong> {selectedUpdate.language || 'DE'}</div>
                              <div><strong>Typ:</strong> {selectedUpdate.update_type || 'Unbekannt'}</div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Paginierung */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Zurück
            </Button>
            
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Seite {currentPage} von {totalPages}
            </span>
            
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Weiter
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}