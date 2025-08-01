import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  BookOpen, 
  RefreshCw, 
  Search, 
  Filter, 
  Globe, 
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Database,
  Zap,
  Download,
  Eye,
  ExternalLink,
  Mail,
  Tag
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { KnowledgeExtractionPanel } from "@/components/knowledge/KnowledgeExtractionPanel";

interface KnowledgeSource {
  id: string;
  name: string;
  url: string;
  category: 'medtech_knowledge' | 'regulatory_updates' | 'legal_cases' | 'industry_newsletter' | 'regulatory_newsletter';
  authority: string;
  region: string;
  language: string;
  priority: 'high' | 'medium' | 'low';
  updateFrequency: number;
  lastChecked: string;
  status: 'active' | 'pending' | 'error';
}

interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  authority: string;
  region: string;
  category: 'medtech_knowledge' | 'regulatory_updates' | 'legal_cases' | 'industry_newsletter' | 'regulatory_newsletter' | 'legal_research' | 'technical_standards' | 'medical_research' | string;
  published_at: string;
  priority: string;
  tags: string[];
  url?: string;
  summary?: string;
  language: string;
  source: string;
}

interface CollectionResult {
  success: boolean;
  summary: {
    totalSources: number;
    successfulSources: number;
    totalArticles: number;
    categoryBreakdown: Record<string, number>;
    processedAt: string;
  };
}

export default function KnowledgeBasePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch knowledge sources status
  const { data: sourcesData, isLoading: sourcesLoading } = useQuery({
    queryKey: ['/api/knowledge/sources-status'],
    refetchInterval: 30000
  });

  // Load real knowledge articles from database - FIXED DATA STRUCTURE
  const { data: articlesResponse, isLoading: articlesLoading } = useQuery({
    queryKey: ['/api/knowledge/articles'],
    refetchInterval: 30000
  });

  // Extract articles from API response structure - FIXED TYPE SAFETY
  const realArticlesData = (articlesResponse as any)?.data || [];
  console.log('Knowledge Base Articles Data:', {
    response: articlesResponse,
    articles: realArticlesData,
    count: realArticlesData.length
  });

  // Deep scraping mutation for comprehensive articles
  const deepScrapingMutation = useMutation({
    mutationFn: () => fetch('/api/knowledge/deep-scraping', { method: 'POST' }).then(res => res.json()),
    onSuccess: (data: any) => {
      const articlesCount = data?.articlesStored || 0;
      const message = articlesCount > 0 
        ? `${articlesCount} neue umfassende Medizintechnik-Artikel hinzugefügt` 
        : "Deep Scraping vollständig - alle 17 Artikel bereits in Datenbank vorhanden";
      
      toast({
        title: "Deep Scraping erfolgreich",
        description: message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge/sources-status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge/articles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/regulatory-updates'] });
    },
    onError: (error: any) => {
      toast({
        title: "Deep Scraping Fehler",
        description: error.message || "Fehler beim Deep Scraping der Artikel",
        variant: "destructive",
      });
    },
  });

  // Collection mutation
  const collectMutation = useMutation({
    mutationFn: () => fetch('/api/knowledge/extract-all-sources', { method: 'POST' }).then(res => res.json()),
    onSuccess: (data: any) => {
      if (data.success) {
        toast({
          title: "Knowledge Collection Erfolgreich",
          description: `${data.stats.articlesExtracted} Artikel von ${data.stats.processedSources} Quellen gesammelt`,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/knowledge/articles'] });
        queryClient.invalidateQueries({ queryKey: ['/api/knowledge/sources-status'] });
      } else {
        toast({
          title: "Collection Fehler",
          description: "Fehler beim Sammeln der Knowledge Articles",
          variant: "destructive"
        });
      }
    }
  });

  // Newsletter extraction mutation
  const newsletterMutation = useMutation({
    mutationFn: () => fetch('/api/knowledge/extract-newsletters', { method: 'POST' }).then(res => res.json()),
    onSuccess: (data: any) => {
      if (data.success) {
        toast({
          title: "Newsletter Extraktion Erfolgreich",
          description: `${data.stats.articlesExtracted} Newsletter-Artikel von ${data.stats.processedSources} MedTech-Quellen extrahiert`,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/knowledge/articles'] });
        queryClient.invalidateQueries({ queryKey: ['/api/knowledge/sources-status'] });
      } else {
        toast({
          title: "Newsletter Extraktion Fehler",
          description: "Fehler beim Extrahieren der Newsletter-Inhalte",
          variant: "destructive"
        });
      }
    }
  });

  // Sync specific source mutation
  const syncSourceMutation = useMutation({
    mutationFn: (sourceId: string) => 
      fetch(`/api/knowledge/sync-source/${sourceId}`, { method: 'POST' }).then(res => res.json()),
    onSuccess: (data, sourceId) => {
      if (data.success) {
        toast({
          title: "Quelle Synchronisiert",
          description: `${data.result.articlesCreated} neue Artikel von ${sourceId} hinzugefügt`,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/regulatory-updates'] });
        queryClient.invalidateQueries({ queryKey: ['/api/knowledge/sources-status'] });
      }
    }
  });

  const sources: KnowledgeSource[] = (sourcesData as any)?.sources || [];
  const articles: KnowledgeArticle[] = realArticlesData || [];

  // Filter articles
  const filteredArticles = articles.filter(article => {
    const matchesSearch = !searchTerm || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.authority.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    const matchesRegion = selectedRegion === "all" || article.region === selectedRegion;
    const matchesSource = selectedSource === "all" || article.authority === selectedSource;
    
    return matchesSearch && matchesCategory && matchesRegion && matchesSource;
  });

  // Article actions
  const openArticle = (article: KnowledgeArticle) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const downloadArticle = (article: KnowledgeArticle) => {
    const content = `KNOWLEDGE BASE ARTIKEL - VOLLSTÄNDIGER EXPORT
========================================

Titel: ${article.title}
Autor/Quelle: ${article.authority}
Region: ${article.region}
Kategorie: ${article.category}
Priorität: ${article.priority}
Sprache: ${article.language}
Veröffentlicht: ${new Date(article.published_at).toLocaleDateString('de-DE')}

ZUSAMMENFASSUNG:
${article.summary || 'Keine Zusammenfassung verfügbar'}

VOLLSTÄNDIGER INHALT:
${article.content}

TAGS:
${article.tags.join(', ')}

QUELLE:
${article.source}

========================================
Export erstellt am: ${new Date().toLocaleDateString('de-DE')} um ${new Date().toLocaleTimeString('de-DE')}
Helix Regulatory Intelligence Platform
`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HELIX_KB_${article.title.replace(/[^a-z0-9äöüß\s]/gi, '_').replace(/\s+/g, '_')}_${article.id.slice(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download gestartet",
      description: `Artikel "${article.title}" wurde heruntergeladen.`
    });
  };

  // Statistics
  const stats = {
    totalSources: sources.length,
    activeSources: sources.filter(s => s.status === 'active').length,
    totalArticles: articles.length,
    categories: {
      medtech_knowledge: articles.filter(a => a.category === 'medtech_knowledge').length,
      regulatory_updates: articles.filter(a => a.category === 'regulatory_updates').length,
      legal_cases: articles.filter(a => a.category === 'legal_cases').length
    },
    regions: Array.from(new Set(articles.map(a => a.region))).length,
    languages: Array.from(new Set(articles.map(a => a.language))).length
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            🧪 Knowledge Base [DEMO]
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Medizintechnik Wissensartikel, Regulatorische Updates und Rechtsfälle
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mt-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ <strong>DEMO-MODUS:</strong> Diese Inhalte sind Beispieldaten für Testzwecke. 
              In der Produktionsversion werden hier echte regulatorische Artikel angezeigt.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => newsletterMutation.mutate()}
            disabled={newsletterMutation.isPending}
            className="deltaways-button-primary bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-navy-900"
          >
            {newsletterMutation.isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Mail className="h-4 w-4 mr-2" />
            )}
            Newsletter Extraktion
          </Button>

          <Button
            onClick={() => deepScrapingMutation.mutate()}
            disabled={deepScrapingMutation.isPending}
            className="deltaways-button-primary"
          >
            {deepScrapingMutation.isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Deep Scraping
          </Button>
          
          <Button
            onClick={() => collectMutation.mutate()}
            disabled={collectMutation.isPending}
            className="deltaways-button-primary"
          >
            {collectMutation.isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Alle Quellen Synchronisieren
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt Artikel</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalArticles}</div>
            <p className="text-xs text-muted-foreground">
              In Knowledge Base verfügbar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Quellen</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSources}</div>
            <p className="text-xs text-muted-foreground">
              Von {stats.totalSources} Quellen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regionen</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.regions}</div>
            <p className="text-xs text-muted-foreground">
              Globale Abdeckung
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sprachen</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.languages}</div>
            <p className="text-xs text-muted-foreground">
              Mehrsprachiger Inhalt
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Suche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Nach Artikeln suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Kategorie wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kategorien</SelectItem>
                <SelectItem value="medtech_knowledge">MedTech Wissen</SelectItem>
                <SelectItem value="regulatory_updates">Regulatorische Updates</SelectItem>
                <SelectItem value="legal_cases">Rechtsfälle</SelectItem>
                <SelectItem value="industry_newsletter">📧 Branchen-Newsletter</SelectItem>
                <SelectItem value="regulatory_newsletter">📋 Regulatory Newsletter</SelectItem>
                <SelectItem value="legal_research">⚖️ Rechtswissenschaft</SelectItem>
                <SelectItem value="technical_standards">🔧 Technische Standards</SelectItem>
                <SelectItem value="medical_research">🧬 Medizinische Forschung</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <SelectValue placeholder="Region wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Regionen</SelectItem>
                <SelectItem value="Global">Global</SelectItem>
                <SelectItem value="Europe">Europa</SelectItem>
                <SelectItem value="USA">USA</SelectItem>
                <SelectItem value="Germany">Deutschland</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger>
                <SelectValue placeholder="Quelle wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Quellen</SelectItem>
                <SelectItem value="JAMA Network">JAMA Network</SelectItem>
                <SelectItem value="FDA">FDA</SelectItem>
                <SelectItem value="EMA">EMA</SelectItem>
                <SelectItem value="BfArM">BfArM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="articles" className="space-y-6">
        <TabsList>
          <TabsTrigger value="articles">Knowledge Articles ({filteredArticles.length})</TabsTrigger>
          <TabsTrigger value="sources">Datenquellen ({sources.length})</TabsTrigger>
          <TabsTrigger value="extraction">Extraktion Panel</TabsTrigger>
        </TabsList>

        <TabsContent value="articles">
          {articlesLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Lade Knowledge Articles...
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredArticles.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Keine Knowledge Articles gefunden
                    </h3>
                    <p className="text-gray-500 text-center mb-4">
                      Nutzen Sie die Synchronisation-Buttons oben, um Artikel zu laden.
                    </p>
                    <Button 
                      onClick={() => collectMutation.mutate()}
                      disabled={collectMutation.isPending}
                    >
                      Artikel sammeln
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredArticles.map((article) => (
                  <Card key={article.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{article.title}</CardTitle>
                          <CardDescription className="mt-2">
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                {article.authority}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(article.published_at).toLocaleDateString('de-DE')}
                              </span>
                              <Badge variant="secondary">{article.region}</Badge>
                              <Badge 
                                variant={article.priority === 'high' ? 'destructive' : 'default'}
                              >
                                {article.priority}
                              </Badge>
                            </div>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        {article.summary || article.content?.substring(0, 200) + '...'}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {article.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          Kategorie: {article.category}
                        </span>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openArticle(article)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Volltext
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => downloadArticle(article)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          {article.url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={article.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Quelle
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sources">
          <div className="grid gap-4">
            {sources.map((source) => (
              <Card key={source.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{source.name}</CardTitle>
                      <CardDescription>
                        {source.authority} • {source.region} • {source.category}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={source.status === 'active' ? 'default' : 'secondary'}
                      >
                        {source.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => syncSourceMutation.mutate(source.id)}
                        disabled={syncSourceMutation.isPending}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Letzte Prüfung: {new Date(source.lastChecked).toLocaleString('de-DE')}</span>
                    <span>Priorität: {source.priority}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="extraction">
          <KnowledgeExtractionPanel />
        </TabsContent>
      </Tabs>

      {/* Article Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          {selectedArticle && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  {selectedArticle.title}
                </DialogTitle>
                <DialogDescription>
                  <div className="flex items-center gap-4 text-sm mt-2">
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {selectedArticle.authority}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(selectedArticle.published_at).toLocaleDateString('de-DE')}
                    </span>
                    <Badge variant="secondary">{selectedArticle.region}</Badge>
                    <Badge 
                      variant={selectedArticle.priority === 'high' ? 'destructive' : 'default'}
                    >
                      {selectedArticle.priority}
                    </Badge>
                  </div>
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {selectedArticle.summary && (
                  <div>
                    <h4 className="font-semibold mb-2">Zusammenfassung:</h4>
                    <p className="text-gray-700 dark:text-gray-300">
                      {selectedArticle.summary}
                    </p>
                  </div>
                )}
                
                <div>
                  <h4 className="font-semibold mb-2">Vollständiger Inhalt:</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                      {selectedArticle.content}
                    </pre>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-sm text-gray-500">
                    Quelle: {selectedArticle.source}
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => downloadArticle(selectedArticle)}
                      variant="outline"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    {selectedArticle.url && (
                      <Button variant="outline" asChild>
                        <a href={selectedArticle.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Original Quelle
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}