import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, FileText, Calendar, Clock, Brain, Download, ExternalLink } from 'lucide-react';
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

  // Filter und Suche
  const filteredUpdates = updates.filter((update: RegulatoryUpdate) => {
    const matchesSearch = !searchTerm || 
      update.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.fullText?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRegion = selectedRegion === 'all' || update.region === selectedRegion;
    
    return matchesSearch && matchesRegion;
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
            {filteredUpdates.length} von {updates.length} Updates verfügbar
          </p>
        </div>

        {/* Filter */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Updates durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger>
              <SelectValue placeholder="Region auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Regionen</SelectItem>
              <SelectItem value="Global">Global</SelectItem>
              <SelectItem value="Europe">Europa</SelectItem>
              <SelectItem value="North America">Nordamerika</SelectItem>
              <SelectItem value="Asia">Asien</SelectItem>
            </SelectContent>
          </Select>

          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
            Seite {currentPage} von {totalPages}
          </div>
        </div>

        {/* Updates Liste */}
        <div className="space-y-4 mb-8">
          {paginatedUpdates.map((update: RegulatoryUpdate) => (
            <Card key={update.id} className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {update.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant="outline" className="text-blue-600">
                        {update.region}
                      </Badge>
                      <Badge 
                        variant={update.priority === 'high' ? 'destructive' : 'default'}
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
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Direkte Anzeige des fullText */}
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  {update.fullText ? (
                    <div className="whitespace-pre-wrap">
                      {update.fullText.substring(0, 400)}
                      {update.fullText.length > 400 && '...'}
                    </div>
                  ) : update.description ? (
                    <div>{update.description}</div>
                  ) : (
                    <div className="text-gray-500 italic">Kein Inhalt verfügbar</div>
                  )}
                </div>

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

                  <Dialog onOpenChange={(open) => {
                    if (open) setSelectedUpdate(update);
                    else setSelectedUpdate(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline"
                      >
                        <Eye className="h-4 w-4 mr-2" />
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
                            
                            {/* DEBUG INFO */}
                            <div className="bg-red-100 p-3 rounded mb-4 text-xs">
                              <strong>DEBUG - Modal Update ID:</strong> {selectedUpdate.id}<br/>
                              <strong>Title:</strong> {selectedUpdate.title}<br/>
                              <strong>FullText Length:</strong> {selectedUpdate.fullText?.length || 0}
                            </div>

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