import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl border border-blue-200 dark:border-blue-700">
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-5 w-5 text-blue-600" />
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

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Gefiltert</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{filteredUpdates.length}</p>
                </div>
                <Filter className="h-12 w-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Quellen</p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                    {new Set((updates || []).map((u: RegulatoryUpdate) => u.source_id || u.source || 'Unbekannt')).size}
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
                    {new Set((updates || []).map((u: RegulatoryUpdate) => u.update_type || 'Sonstiges')).size}
                  </p>
                </div>
                <BarChart3 className="h-12 w-12 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs - Direkt in der Frontansicht */}
        <Tabs defaultValue="updates" className="w-full">
          <TabsList className="grid w-full grid-cols-6 h-14 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
            <TabsTrigger 
              value="updates" 
              className="flex items-center gap-2 text-sm font-medium rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-300"
            >
              <FileText className="h-4 w-4" />
              Übersicht
            </TabsTrigger>
            <TabsTrigger 
              value="summary" 
              className="flex items-center gap-2 text-sm font-medium rounded-md data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-purple-900/20 dark:data-[state=active]:text-purple-300"
            >
              <Brain className="h-4 w-4" />
              Zusammenfassung
            </TabsTrigger>
            <TabsTrigger 
              value="content" 
              className="flex items-center gap-2 text-sm font-medium rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-300"
            >
              <FileText className="h-4 w-4" />
              Vollständiger Inhalt
            </TabsTrigger>
            <TabsTrigger 
              value="finance" 
              className="flex items-center gap-2 text-sm font-medium rounded-md data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-orange-900/20 dark:data-[state=active]:text-orange-300"
            >
              <TrendingUp className="h-4 w-4" />
              Finanzanalyse
            </TabsTrigger>
            <TabsTrigger 
              value="ai-analysis" 
              className="flex items-center gap-2 text-sm font-medium rounded-md data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-purple-900/20 dark:data-[state=active]:text-purple-300"
            >
              <Brain className="h-4 w-4" />
              KI-Analyse
            </TabsTrigger>
            <TabsTrigger 
              value="metadata" 
              className="flex items-center gap-2 text-sm font-medium rounded-md data-[state=active]:bg-gray-50 data-[state=active]:text-gray-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900/20 dark:data-[state=active]:text-gray-300"
            >
              <Globe className="h-4 w-4" />
              Metadaten
            </TabsTrigger>
          </TabsList>

          <TabsContent value="updates" className="mt-6">
            <Card className="border-2 border-blue-200 shadow-lg bg-white dark:bg-gray-900">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-b border-blue-200">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                  Regulatorische Updates Übersicht
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {filteredUpdates.length} von {updates?.length || 0} authentische Updates verfügbar
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <div className="space-y-4">
                    <div className="space-y-3">
          {paginatedUpdates.map((update: RegulatoryUpdate) => (
            <Card key={update.id} className="p-4 hover:shadow-lg transition-all duration-200 border border-blue-200 dark:border-blue-700 bg-gradient-to-r from-blue-50/30 to-white dark:from-blue-900/10 dark:to-gray-800 rounded-lg shadow-sm">
              <CardContent className="p-0">
                <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {update.title}
                  </h3>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      {update.region}
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 text-xs"
                    onClick={() => setSelectedUpdate(update)}
                  >
                    <Eye className="h-3 w-3" />
                    Details anzeigen
                  </Button>
                </div>
                </div>
              </CardContent>
            </Card>
          ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Zusammenfassung Tab - Individuelle Inhalte aller Artikel */}
          <TabsContent value="summary" className="mt-6">
            <Card className="border-2 border-purple-200 shadow-lg bg-white dark:bg-gray-900">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-b border-purple-200">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Brain className="h-6 w-6 text-purple-600" />
                  Zusammenfassungen aller Updates
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Kompakte Übersicht aller {filteredUpdates.length} regulatorischen Updates
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {paginatedUpdates.map((update: RegulatoryUpdate, index: number) => (
                    <Card key={update.id} className="p-4 border border-purple-200 dark:border-purple-700 bg-gradient-to-r from-purple-50/30 to-white dark:from-purple-900/10 dark:to-gray-800 rounded-lg">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                            {update.title}
                          </h4>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                              {update.region}
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
                        </div>
                        
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                          <h5 className="font-medium text-purple-800 dark:text-purple-300 mb-2">Zusammenfassung</h5>
                          <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {update.summary || update.description?.split('\n').slice(0, 3).join('\n') || update.content?.substring(0, 300) + '...' || 'Keine Zusammenfassung verfügbar'}
                          </div>
                        </div>

                        {/* Wichtige Punkte extrahieren */}
                        {update.description?.includes('WICHTIGE ÄNDERUNGEN:') && (
                          <div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-purple-400">
                            <h6 className="font-medium text-purple-700 dark:text-purple-300 mb-2">Wichtige Änderungen</h6>
                            <div className="text-sm space-y-1">
                              {update.description.split('\n').slice(2, 6).map((line, idx) => 
                                line.trim().startsWith('•') && (
                                  <div key={idx} className="text-gray-700 dark:text-gray-300">{line}</div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Veröffentlicht: {new Date(update.published_at).toLocaleDateString('de-DE')}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUpdate(update)}
                            className="text-xs"
                          >
                            Details anzeigen
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vollständiger Inhalt Tab */}
          <TabsContent value="content" className="mt-6">
            <Card className="border-2 border-blue-200 shadow-lg bg-white dark:bg-gray-900">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-b border-blue-200">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                  Vollständiger Inhalt aller Updates
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Detaillierter Inhalt aller {filteredUpdates.length} regulatorischen Updates
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {paginatedUpdates.map((update: RegulatoryUpdate, index: number) => (
                    <Card key={update.id} className="p-6 border border-blue-200 dark:border-blue-700 bg-gradient-to-r from-blue-50/30 to-white dark:from-blue-900/10 dark:to-gray-800 rounded-lg">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-xl">
                            {update.title}
                          </h4>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              {new Date(update.published_at).toLocaleDateString('de-DE')}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-800 border p-4 rounded-lg">
                          <h5 className="font-medium mb-3 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            Vollständiger Inhalt
                          </h5>
                          <div className="prose max-w-none">
                            <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed text-sm">
                              {update.fullText || update.content || update.description || 'Kein vollständiger Inhalt verfügbar'}
                            </div>
                          </div>
                          
                          <div className="flex gap-4 pt-4 border-t mt-4">
                            <Button 
                              size="sm"
                              onClick={() => {
                                try {
                                  const content = `${update.title}\n\n${update.summary || update.description || ''}\n\n${update.fullText || update.content || update.description || 'Kein Inhalt verfügbar'}`;
                                  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `Update_${update.title?.replace(/[^a-z0-9äöüß\s]/gi, '_').replace(/\s+/g, '_') || 'update'}.txt`;
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                                  URL.revokeObjectURL(url);
                                  toast({
                                    title: "Download gestartet",
                                    description: "Das Update wird heruntergeladen.",
                                  });
                                } catch (error) {
                                  console.error('Download error:', error);
                                  toast({
                                    title: "Download fehlgeschlagen",
                                    description: "Es gab ein Problem beim Herunterladen.",
                                    variant: "destructive",
                                  });
                                }
                              }}
                              className="flex items-center gap-2 text-xs"
                            >
                              <Download className="h-3 w-3" />
                              Download
                            </Button>
                            {(update.source_url || update.sourceUrl || update.document_url) && (
                              <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(update.source_url || update.sourceUrl || update.document_url, '_blank')}
                                className="flex items-center gap-2 text-xs"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Quelle öffnen
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Finanzanalyse Tab */}
          <TabsContent value="finance" className="mt-6">
            <Card className="border-2 border-orange-200 shadow-lg bg-white dark:bg-gray-900">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-b border-orange-200">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                  Finanzanalyse aller Updates
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Kostenschätzungen und Finanzauswirkungen der {filteredUpdates.length} Updates
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {paginatedUpdates.map((update: RegulatoryUpdate) => (
                    <Card key={update.id} className="p-4 border border-orange-200 dark:border-orange-700 bg-gradient-to-r from-orange-50/30 to-white dark:from-orange-900/10 dark:to-gray-800 rounded-lg">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                          {update.title}
                        </h4>
                        
                        <div className="space-y-3">
                          {update.description?.includes('ML-') || update.title?.toLowerCase().includes('machine learning') ? (
                            <div className="bg-white dark:bg-gray-800 p-4 rounded border-l-4 border-orange-400">
                              <h5 className="font-medium text-orange-800 dark:text-orange-300 mb-2">ML-Implementierungskosten</h5>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><strong>Personal & Schulung:</strong> €75.000 - €150.000</div>
                                <div><strong>Software-Updates:</strong> €25.000 - €50.000</div>
                                <div><strong>Dokumentation:</strong> €15.000 - €30.000</div>
                                <div><strong>Compliance-Audit:</strong> €20.000 - €40.000</div>
                              </div>
                              <div className="mt-3 pt-3 border-t">
                                <strong className="text-orange-700">Gesamtkosten: €135.000 - €270.000</strong>
                              </div>
                            </div>
                          ) : update.description?.includes('ÄNDERUNGEN:') ? (
                            <div className="bg-white dark:bg-gray-800 p-4 rounded border-l-4 border-orange-400">
                              <h5 className="font-medium text-orange-800 dark:text-orange-300 mb-2">Compliance-Kosten</h5>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><strong>Prozessanpassungen:</strong> €30.000 - €60.000</div>
                                <div><strong>Schulungsmaßnahmen:</strong> €15.000 - €25.000</div>
                                <div><strong>Dokumentationsupdate:</strong> €10.000 - €20.000</div>
                                <div><strong>Externe Beratung:</strong> €20.000 - €40.000</div>
                              </div>
                              <div className="mt-3 pt-3 border-t">
                                <strong className="text-orange-700">Gesamtkosten: €75.000 - €145.000</strong>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-white dark:bg-gray-800 p-4 rounded border-l-4 border-orange-400">
                              <h5 className="font-medium text-orange-800 dark:text-orange-300 mb-2">Standard Compliance-Kosten</h5>
                              <div className="text-sm space-y-2">
                                <div><strong>Bewertung & Analyse:</strong> €5.000 - €15.000</div>
                                <div><strong>Umsetzungsplanung:</strong> €10.000 - €25.000</div>
                                <div><strong>Implementierung:</strong> €20.000 - €50.000</div>
                              </div>
                              <div className="mt-3 pt-3 border-t">
                                <strong className="text-orange-700">Gesamtkosten: €35.000 - €90.000</strong>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* KI-Analyse Tab */}
          <TabsContent value="ai-analysis" className="mt-6">
            <Card className="border-2 border-purple-200 shadow-lg bg-white dark:bg-gray-900">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-b border-purple-200">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Brain className="h-6 w-6 text-purple-600" />
                  KI-Analyse aller Updates
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Intelligente Bewertung und Compliance-Analyse der {filteredUpdates.length} Updates
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {paginatedUpdates.map((update: RegulatoryUpdate) => (
                    <Card key={update.id} className="p-4 border border-purple-200 dark:border-purple-700 bg-gradient-to-r from-purple-50/30 to-white dark:from-purple-900/10 dark:to-gray-800 rounded-lg">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                          {update.title}
                        </h4>
                        
                        <div className="space-y-3">
                          {update.priority === 'high' && (
                            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded border-l-4 border-red-400">
                              <h5 className="font-medium text-red-800 dark:text-red-300 mb-2">🚨 Hohe Priorität - Sofortiger Handlungsbedarf</h5>
                              <div className="text-sm space-y-2">
                                <div><strong>Risikobewertung:</strong> Kritisch - Sofortige Compliance-Anpassungen erforderlich</div>
                                <div><strong>Betroffene Bereiche:</strong> QM-System, Dokumentation, Prozesse</div>
                                <div><strong>Empfohlene Maßnahmen:</strong> Sofortige Bewertung bestehender Systeme, Team-Briefing, Umsetzungsplan erstellen</div>
                              </div>
                            </div>
                          )}
                          
                          {(update.description?.includes('ML-') || update.title?.toLowerCase().includes('machine learning')) && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded border-l-4 border-blue-400">
                              <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-2">🤖 Machine Learning Compliance-Analyse</h5>
                              <div className="text-sm space-y-2">
                                <div><strong>Betroffene Systeme:</strong> Bildgebung, Diagnostik mit KI-Komponenten</div>
                                <div><strong>Validierungsanforderungen:</strong> Algorithmus-Performance, Trainingsdaten-Qualität</div>
                                <div><strong>Monitoring:</strong> Kontinuierliche Performance-Überwachung implementieren</div>
                                <div><strong>Risk Management:</strong> Adaptive Systeme erfordern erweiterte Risikobewertung</div>
                              </div>
                            </div>
                          )}

                          <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                            <h5 className="font-medium mb-2">📊 Compliance-Impact-Analyse</h5>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <strong>Update-Typ:</strong> {update.update_type}
                                <br />
                                <strong>Region:</strong> {update.region}
                              </div>
                              <div>
                                <strong>Priorität:</strong> {update.priority}
                                <br />
                                <strong>Umsetzungsfrist:</strong> {update.description?.includes('2025') ? 'Bis 2025' : 'Nach Veröffentlichung'}
                              </div>
                            </div>
                          </div>

                          {update.description?.includes('NÄCHSTE SCHRITTE:') && (
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded border-l-4 border-green-400">
                              <h5 className="font-medium text-green-800 dark:text-green-300 mb-2">✅ Empfohlene nächste Schritte</h5>
                              <div className="text-sm space-y-1">
                                {update.description.split('NÄCHSTE SCHRITTE:')[1]?.split('\n').filter(line => line.trim().match(/^\d+\./)).map((step, idx) => (
                                  <div key={idx} className="flex items-start gap-2">
                                    <span className="text-green-600 font-medium">{idx + 1}.</span>
                                    <span>{step.replace(/^\d+\.\s*/, '')}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Metadaten Tab */}
          <TabsContent value="metadata" className="mt-6">
            <Card className="border-2 border-gray-200 shadow-lg bg-white dark:bg-gray-900">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border-b border-gray-200">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Globe className="h-6 w-6 text-gray-600" />
                  Metadaten aller Updates
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Detaillierte Metadaten und Quelleninformationen der {filteredUpdates.length} Updates
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {paginatedUpdates.map((update: RegulatoryUpdate) => (
                    <Card key={update.id} className="p-4 border border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50/30 to-white dark:from-gray-900/10 dark:to-gray-800 rounded-lg">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                          {update.title}
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><strong>Update-ID:</strong> {update.id}</div>
                          <div><strong>Quelle:</strong> {update.source_id || update.source || 'Unbekannt'}</div>
                          <div><strong>Region:</strong> {update.region}</div>
                          <div><strong>Update-Typ:</strong> {update.update_type}</div>
                          <div><strong>Priorität:</strong> {update.priority}</div>
                          <div><strong>Veröffentlicht:</strong> {new Date(update.published_at).toLocaleDateString('de-DE')}</div>
                          <div><strong>Erstellt:</strong> {new Date(update.created_at).toLocaleDateString('de-DE')}</div>
                          <div><strong>Sprache:</strong> {update.language || 'DE'}</div>
                        </div>
                        
                        {update.device_classes && update.device_classes.length > 0 && (
                          <div>
                            <strong>Geräteklassen:</strong>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {update.device_classes.map((deviceClass, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {deviceClass}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {(update.source_url || update.document_url) && (
                          <div>
                            <strong>Verknüpfungen:</strong>
                            <div className="space-y-2 mt-2">
                              {update.source_url && (
                                <div className="text-xs">
                                  <span className="text-gray-600">Quelle:</span> 
                                  <a href={update.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                                    {update.source_url}
                                  </a>
                                </div>
                              )}
                              {update.document_url && (
                                <div className="text-xs">
                                  <span className="text-gray-600">Dokument:</span> 
                                  <a href={update.document_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                                    {update.document_url}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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