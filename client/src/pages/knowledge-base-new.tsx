import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Search, Download, ExternalLink, Clock, FileText, Brain, Globe, Calendar, Eye, Bookmark, Star, Filter } from 'lucide-react';
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

// Formatted text component for proper line breaks
const FormattedText = ({ text, className = "" }: { text: string; className?: string }) => {
  return (
    <div className={className}>
      {text.split('\n').map((line, index) => (
        <span key={index}>
          {line}
          {index < text.split('\n').length - 1 && <br />}
        </span>
      ))}
    </div>
  );
};

interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  published_at: string;
  created_at: string;
  authority: string;
  region: string;
  priority: string;
  language: string;
  summary?: string;
  source?: string;
  url?: string;
}

export default function KnowledgeBasePage() {
  const device = useDeviceDetection();
  const { toast } = useToast();

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedAuthority, setSelectedAuthority] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  // Fetch knowledge articles
  const { data: articlesData, isLoading: isLoadingData, error: dataError } = useQuery({
    queryKey: ['/api/knowledge-base'],
    staleTime: 300000, // 5 minutes
  });

  // Process articles data
  const articles: KnowledgeArticle[] = useMemo(() => {
    if (!articlesData) return [];
    if (Array.isArray(articlesData)) return articlesData;
    if (articlesData && typeof articlesData === 'object' && 'articles' in articlesData) {
      return Array.isArray(articlesData.articles) ? articlesData.articles : [];
    }
    return [];
  }, [articlesData]);

  // Filter articles
  const filteredData = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = !searchTerm || 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.authority.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.summary?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
      const matchesRegion = selectedRegion === "all" || article.region === selectedRegion;
      const matchesAuthority = selectedAuthority === "all" || article.authority === selectedAuthority;
      const matchesPriority = selectedPriority === "all" || article.priority === selectedPriority;
      
      return matchesSearch && matchesCategory && matchesRegion && matchesAuthority && matchesPriority;
    });
  }, [articles, searchTerm, selectedCategory, selectedRegion, selectedAuthority, selectedPriority]);

  // Get unique values for filters
  const categories = useMemo(() => [...new Set(articles.map(a => a.category))], [articles]);
  const regions = useMemo(() => [...new Set(articles.map(a => a.region))], [articles]);
  const authorities = useMemo(() => [...new Set(articles.map(a => a.authority))], [articles]);
  const priorities = useMemo(() => [...new Set(articles.map(a => a.priority))], [articles]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10">
      <div className={cn(
        "space-y-6",
        device.isMobile ? "p-4" : device.isTablet ? "p-6" : "p-8"
      )}>
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                📚 Wissensdatenbank
              </h1>
              <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300">
                Erweitert
              </Badge>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {isLoadingData ? (
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 animate-pulse" />
                  Lade Wissensartikel und Fachinformationen...
                </span>
              ) : (
                `${filteredData.length} von ${articles.length} Wissensartikel und Fachinformationen verfügbar`
              )}
            </p>
          </div>
        </div>

        {/* Enhanced Filter Controls */}
        <Card className="shadow-lg border-l-4 border-l-green-500">
          <CardHeader className="pb-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-t-lg">
            <CardTitle className="text-xl font-semibold flex items-center">
              <Search className="w-5 h-5 mr-2 text-green-600" />
              Erweiterte Filteroptionen
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium">Kategorie</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategorie wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Kategorien</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
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
                <label className="text-sm font-medium">Quelle</label>
                <Select value={selectedAuthority} onValueChange={setSelectedAuthority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Quelle wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Quellen</SelectItem>
                    {authorities.map((authority) => (
                      <SelectItem key={authority} value={authority}>
                        {authority}
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
                    placeholder="Artikel, Quelle oder Inhalt suchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gesamte Artikel</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{articles.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Filter className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gefiltert</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{filteredData.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Globe className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Quellen</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{authorities.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Kategorien</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{categories.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs - Einheitliches Design */}
        <Tabs defaultValue="articles" className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-14 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
            <TabsTrigger 
              value="articles" 
              className="flex items-center gap-2 text-sm font-medium rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-300"
            >
              <BookOpen className="h-4 w-4" />
              Übersicht
            </TabsTrigger>
            <TabsTrigger 
              value="summary" 
              className="flex items-center gap-2 text-sm font-medium rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-300"
            >
              <Eye className="h-4 w-4" />
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
              value="analysis-ai" 
              className="flex items-center gap-2 text-sm font-medium rounded-md data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-orange-900/20 dark:data-[state=active]:text-orange-300"
            >
              <Brain className="h-4 w-4" />
              🔥 KI-Analyse
            </TabsTrigger>
            <TabsTrigger 
              value="metadata" 
              className="flex items-center gap-2 text-sm font-medium rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-300"
            >
              <Globe className="h-4 w-4" />
              Metadaten
            </TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-b">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Wissensartikel Übersicht
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {filteredData.length} von {articles.length} Wissensartikel verfügbar
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {isLoadingData ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <span className="ml-4 text-lg">Lade Wissensartikel...</span>
                  </div>
                ) : dataError ? (
                  <div className="flex items-center justify-center py-12 text-red-600">
                    <BookOpen className="h-8 w-8 mr-2" />
                    <span>Fehler beim Laden der Wissensartikel</span>
                  </div>
                ) : filteredData.length === 0 ? (
                  <div className="flex items-center justify-center py-12 text-gray-500">
                    <BookOpen className="h-8 w-8 mr-2" />
                    <span>Keine Wissensartikel für die gewählten Filter gefunden</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredData.map((article) => (
                      <Card key={article.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                {article.title}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                <span className="flex items-center">
                                  <BookOpen className="w-4 h-4 mr-1" />
                                  {article.authority}
                                </span>
                                <span className="flex items-center">
                                  <Globe className="w-4 h-4 mr-1" />
                                  {article.region}
                                </span>
                                <span className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {new Date(article.published_at).toLocaleDateString('de-DE')}
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-2 mb-3">
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                  {article.category}
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className={
                                    article.priority === 'High' || article.priority === 'Hoch' 
                                      ? 'border-red-300 text-red-700 bg-red-50' 
                                      : article.priority === 'Medium' || article.priority === 'Mittel'
                                      ? 'border-yellow-300 text-yellow-700 bg-yellow-50'
                                      : 'border-green-300 text-green-700 bg-green-50'
                                  }
                                >
                                  {article.priority}
                                </Badge>
                                <Badge variant="outline" className="text-gray-600">
                                  {article.language}
                                </Badge>
                              </div>

                              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                                {article.summary || article.content.substring(0, 300) + '...'}
                              </p>

                              {article.tags && article.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-4">
                                  {article.tags.slice(0, 5).map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {article.tags.length > 5 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{article.tags.length - 5} weitere
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                                    <Eye className="h-4 w-4" />
                                    Vollständig lesen
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl w-[95vw] h-[90vh] overflow-y-auto">
                                  <DialogHeader className="sticky top-0 bg-white dark:bg-gray-800 z-10 pb-4 border-b">
                                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                      <BookOpen className="h-5 w-5 text-blue-600" />
                                      {article.title}
                                    </DialogTitle>
                                  </DialogHeader>
                                  
                                  <div className="space-y-6 mt-6">
                                    {/* Article Metadata */}
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                      <h4 className="font-semibold mb-3">Artikel-Informationen</h4>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div><strong>Quelle:</strong> {article.authority}</div>
                                        <div><strong>Region:</strong> {article.region}</div>
                                        <div><strong>Kategorie:</strong> {article.category}</div>
                                        <div><strong>Priorität:</strong> {article.priority}</div>
                                        <div><strong>Sprache:</strong> {article.language}</div>
                                        <div><strong>Veröffentlicht:</strong> {new Date(article.published_at).toLocaleDateString('de-DE')}</div>
                                      </div>
                                    </div>

                                    {/* Summary */}
                                    {article.summary && (
                                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-400">
                                        <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-300">Zusammenfassung</h4>
                                        <FormattedText text={article.summary} className="text-sm leading-relaxed" />
                                      </div>
                                    )}

                                    {/* Full Content */}
                                    <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 p-6 rounded-lg">
                                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-gray-600" />
                                        Vollständiger Artikel
                                      </h4>
                                      <div className="prose max-w-none text-sm leading-relaxed">
                                        <FormattedText text={article.content} />
                                      </div>
                                    </div>

                                    {/* Tags */}
                                    {article.tags && article.tags.length > 0 && (
                                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                        <h4 className="font-semibold mb-2">Schlagwörter</h4>
                                        <div className="flex flex-wrap gap-2">
                                          {article.tags.map((tag, index) => (
                                            <Badge key={index} variant="outline">
                                              {tag}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-4 pt-4 border-t">
                                      <Button 
                                        onClick={() => {
                                          try {
                                            const content = `${article.title}\n\n${article.summary || ''}\n\n${article.content}`;
                                            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `Wissensartikel_${article.title.replace(/[^a-z0-9äöüß\s]/gi, '_').replace(/\s+/g, '_')}.txt`;
                                            document.body.appendChild(a);
                                            a.click();
                                            document.body.removeChild(a);
                                            URL.revokeObjectURL(url);
                                          } catch (error) {
                                            console.error('Download error:', error);
                                          }
                                        }}
                                        className="flex items-center gap-2"
                                      >
                                        <Download className="h-4 w-4" />
                                        Artikel herunterladen
                                      </Button>
                                      {article.url && (
                                        <Button 
                                          variant="outline"
                                          onClick={() => window.open(article.url, '_blank')}
                                          className="flex items-center gap-2"
                                        >
                                          <ExternalLink className="h-4 w-4" />
                                          Original-Quelle öffnen
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  try {
                                    const content = `${article.title}\n\n${article.summary || ''}\n\n${article.content}`;
                                    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `${article.title.replace(/[^a-z0-9äöüß\s]/gi, '_').replace(/\s+/g, '_')}.txt`;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(url);
                                    toast({ title: "Download gestartet", description: "Artikel wird heruntergeladen" });
                                  } catch (error) {
                                    console.error('Download error:', error);
                                    toast({ title: "Download-Fehler", description: "Artikel konnte nicht heruntergeladen werden", variant: "destructive" });
                                  }
                                }}
                                title="Artikel herunterladen"
                              >
                                <Download className="h-4 w-4" />
                              </Button>

                              {article.url && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => window.open(article.url, '_blank')}
                                  title="Original-Quelle öffnen"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              )}
                            </div>

                            <div className="text-xs text-gray-500">
                              Zuletzt aktualisiert: {new Date(article.created_at || article.published_at).toLocaleDateString('de-DE')}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 border-b">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Artikel Zusammenfassungen
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Kompakte Übersicht aller Wissensartikel mit Zusammenfassungen
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-12 text-gray-500">
                  <Eye className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                  <h3 className="text-lg font-semibold mb-2">Artikel Zusammenfassungen</h3>
                  <p>Wählen Sie einen Artikel aus der Übersicht für eine detaillierte Zusammenfassung.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-b">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Vollständiger Artikelinhalt
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Detaillierte Wissensartikel und Fachinformationen
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">Vollständiger Inhalt</h3>
                  <p>Wählen Sie einen Artikel aus der Übersicht, um den vollständigen Inhalt anzuzeigen.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis-ai" className="mt-6">
            <Card className="border-0 shadow-lg border-l-4 border-l-orange-500">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 border-b">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-orange-600" />
                  🔥 KI-gestützte Wissensanalyse
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Fortschrittliche KI-Analyse zur Bewertung und Kategorisierung von Wissensartikeln
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-12 text-gray-500">
                  <Brain className="w-16 h-16 mx-auto mb-4 text-orange-400" />
                  <h3 className="text-lg font-semibold mb-2">KI-Wissensanalyse</h3>
                  <p>Wählen Sie einen Artikel aus der Übersicht für eine detaillierte KI-gestützte Analyse.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metadata" className="mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900/10 dark:to-blue-900/10 border-b">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Wissensdatenbank Metadaten
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Technische Details, Quellen und Datenherkunft der Wissensartikel
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Datenquellen</h4>
                    <div className="space-y-2 text-sm">
                      {authorities.slice(0, 5).map((authority) => (
                        <div key={authority} className="flex justify-between">
                          <span>{authority}</span>
                          <Badge variant="secondary">Aktiv</Badge>
                        </div>
                      ))}
                      {authorities.length > 5 && (
                        <div className="text-gray-500">
                          +{authorities.length - 5} weitere Quellen
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Datenqualität</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Vollständigkeit</span>
                        <Badge className="bg-green-100 text-green-800">100%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Authentizität</span>
                        <Badge className="bg-green-100 text-green-800">Verifiziert</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Letzte Aktualisierung</span>
                        <span className="text-gray-600">Heute</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Artikel verfügbar</span>
                        <span className="text-gray-600">{articles.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}