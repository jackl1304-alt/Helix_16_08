import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { KnowledgeExtractionPanel } from "@/components/knowledge/KnowledgeExtractionPanel";

interface KnowledgeSource {
  id: string;
  name: string;
  url: string;
  category: 'medtech_knowledge' | 'regulatory_updates' | 'legal_cases';
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
  category: string;
  published_at: string;
  priority: string;
  tags: string[];
  url: string;
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
    refetchInterval: 30000 // Refresh every 30 seconds to show new collected articles
  });

  // Extract articles from API response structure
  const realArticlesData = articlesResponse?.data || [];
  console.log('Knowledge Base Articles Data:', {
    response: articlesResponse,
    articles: realArticlesData,
    count: realArticlesData.length
  });

  // Use the real articles data directly
      const demoArticles = [
        {
          id: 'jama-001',
          title: 'Advanced Medical Device Safety Standards',
          content: 'Comprehensive analysis of new medical device safety protocols and their impact on regulatory compliance.',
          authority: 'JAMA Network',
          region: 'Global',
          category: 'medtech_knowledge',
          published_at: '2025-07-31T07:00:00Z',
          priority: 'high',
          tags: ['safety', 'standards', 'compliance'],
          url: 'https://jamanetwork.com/collections/5738/medical-devices-and-equipment',
          summary: 'New safety standards for medical devices...',
          language: 'en',
          source: 'Knowledge: JAMA Network'
        },
        {
          id: 'pmc-001',
          title: 'Medical Device Regulation Framework',
          content: 'In-depth review of current medical device regulation frameworks across different jurisdictions.',
          authority: 'PubMed Central',
          region: 'Global',
          category: 'regulatory_updates',
          published_at: '2025-07-31T06:30:00Z',
          priority: 'high',
          tags: ['regulation', 'framework', 'global'],
          url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8968778/',
          summary: 'Comprehensive regulatory framework analysis...',
          language: 'en',
          source: 'Knowledge: PMC'
        },
        {
          id: 'johner-001',
          title: 'MDR Implementierung in Deutschland',
          content: 'Praktische Leitlinien zur Umsetzung der MDR-Verordnung für deutsche Medizintechnik-Unternehmen.',
          authority: 'Johner Institute',
          region: 'Germany',
          category: 'regulatory_updates',
          published_at: '2025-07-31T06:00:00Z',
          priority: 'high',
          tags: ['MDR', 'Deutschland', 'Umsetzung'],
          url: 'https://blog.johner-institute.com/',
          summary: 'MDR-Implementierung Leitfaden für deutsche Unternehmen...',
          language: 'de',
          source: 'Knowledge: Johner Institute'
        },
        {
          id: 'mdr-001',
          title: 'EU Medical Device Market Updates',
          content: 'Latest developments in the European medical device market and regulatory changes.',
          authority: 'MDR Regulator',
          region: 'European Union',
          category: 'regulatory_updates',
          published_at: '2025-07-31T05:30:00Z',
          priority: 'high',
          tags: ['EU', 'market', 'updates'],
          url: 'https://mdrregulator.com/news',
          summary: 'European market regulatory updates...',
          language: 'en',
          source: 'Knowledge: MDR Regulator'
        },
        {
          id: 'lsu-001',
          title: 'Medical Device Litigation Case Study',
          content: 'Analysis of recent medical device litigation cases and their implications for manufacturers.',
          authority: 'Louisiana State University',
          region: 'United States',
          category: 'legal_cases',
          published_at: '2025-07-31T05:00:00Z',
          priority: 'medium',
          tags: ['litigation', 'case-study', 'manufacturers'],
          url: 'https://biotech.law.lsu.edu/cases/devices/index.htm',
          summary: 'Recent litigation cases analysis...',
          language: 'en',
          source: 'Knowledge: LSU Legal'
        },
        {
          id: 'regrap-001',
          title: 'Medical Device Standards Update May 2025',
          content: 'Comprehensive update on medical device standards released in May 2025.',
          authority: 'Regulatory Rapporteur',
          region: 'Global',
          category: 'regulatory_updates',
          published_at: '2025-07-31T04:30:00Z',
          priority: 'high',
          tags: ['standards', 'update', '2025'],
          url: 'https://www.regulatoryrapporteur.org/medical-device-standards-update-may-2025/898.article',
          summary: 'May 2025 standards update...',
          language: 'en',
          source: 'Knowledge: Regulatory Rapporteur'
        },
        {
          id: 'emergo-001',
          title: 'Global Regulatory Updates Q2 2025',
          content: 'Quarterly regulatory updates from major jurisdictions worldwide.',
          authority: 'Emergo by UL',
          region: 'Global',
          category: 'regulatory_updates',
          published_at: '2025-07-31T04:00:00Z',
          priority: 'high',
          tags: ['global', 'quarterly', 'updates'],
          url: 'https://www.emergobyul.com/news/regulatory-updates',
          summary: 'Q2 2025 global regulatory updates...',
          language: 'en',
          source: 'Knowledge: Emergo by UL'
        },
        {
          id: 'medicept-001',
          title: 'Top 5 Upcoming FDA and EU Regulations 2025',
          content: 'Preview of the most important FDA and EU regulations coming in 2025.',
          authority: 'Medicept',
          region: 'Global',
          category: 'regulatory_updates',
          published_at: '2025-07-31T03:30:00Z',
          priority: 'high',
          tags: ['FDA', 'EU', '2025', 'upcoming'],
          url: 'https://www.medicept.com/top-5-upcoming-fda-and-eu-regulations-what-to-know-for-2025/',
          summary: 'Top 5 upcoming regulations for 2025...',
          language: 'en',
          source: 'Knowledge: Medicept'
        },
        {
          id: 'rephine-001',
          title: 'MedTech EU Regulatory Updates',
          content: 'Latest MedTech regulatory updates from the European Union.',
          authority: 'Rephine',
          region: 'European Union',
          category: 'regulatory_updates',
          published_at: '2025-07-31T03:00:00Z',
          priority: 'high',
          tags: ['MedTech', 'EU', 'regulatory'],
          url: 'https://www.rephine.com/medical-devices/medtech-eu-regulatory-updates/',
          summary: 'EU MedTech regulatory updates...',
          language: 'en',
          source: 'Knowledge: Rephine'
        },
        {
          id: 'rapoport-001',
          title: 'Bausch v. Stryker Corp: Major Victory for Plaintiffs',
          content: 'Analysis of the Bausch v. Stryker Corp case and its implications for medical device litigation.',
          authority: 'Rapoport Law',
          region: 'United States',
          category: 'legal_cases',
          published_at: '2025-07-31T02:30:00Z',
          priority: 'medium',
          tags: ['Bausch', 'Stryker', 'litigation'],
          url: 'https://rapoportlaw.com/bausch-v-stryker-corp-a-major-victory-for-plaintiffs-in-medical-device-cases/',
          summary: 'Major victory in Bausch v. Stryker case...',
          language: 'en',
          source: 'Knowledge: Rapoport Law'
        },
        {
          id: 'advamed-001',
          title: 'Medical Device Industry Litigation Trends',
          content: 'Current trends in medical device industry litigation and their impact.',
          authority: 'AdvaMed',
          region: 'United States',
          category: 'legal_cases',
          published_at: '2025-07-31T02:00:00Z',
          priority: 'high',
          tags: ['industry', 'litigation', 'trends'],
          url: 'https://www.advamed.org/2022/05/31/litigation-in-the-medical-device-industry/',
          summary: 'Industry litigation trends analysis...',
          language: 'en',
          source: 'Knowledge: AdvaMed'
        },
        {
          id: 'selegal-001',
          title: 'Rechtsberatung für Medizinprodukte-Unternehmen',
          content: 'Rechtliche Beratung für Unternehmen in der Medizinprodukte und Medizintechnik Branche.',
          authority: 'SE Legal',
          region: 'Germany',
          category: 'legal_cases',
          published_at: '2025-07-31T01:30:00Z',
          priority: 'medium',
          tags: ['Rechtsberatung', 'Medizinprodukte', 'Deutschland'],
          url: 'https://se-legal.de/branchenspezialisierte-rechtsanwalte/',
          summary: 'Rechtliche Beratung für Medizintechnik...',
          language: 'de',
          source: 'Knowledge: SE Legal'
        },
        {
          id: 'motley-001',
          title: 'Defective Medical Device Lawsuits Overview',
          content: 'Overview of defective medical device lawsuits and legal precedents.',
          authority: 'Motley Rice',
          region: 'United States',
          category: 'legal_cases',
          published_at: '2025-07-31T01:00:00Z',
          priority: 'medium',
          tags: ['defective', 'lawsuits', 'precedents'],
          url: 'https://www.motleyrice.com/medical-devices',
          summary: 'Defective device lawsuits overview...',
          language: 'en',
          source: 'Knowledge: Motley Rice'
        },
        {
          id: 'mtd-001',
          title: 'Medizintechnik Fachartikel: Aktuelle Entwicklungen',
          content: 'Aktuelle Entwicklungen und Trends in der deutschen Medizintechnik-Branche.',
          authority: 'MTD',
          region: 'Germany',
          category: 'medtech_knowledge',
          published_at: '2025-07-31T00:30:00Z',
          priority: 'medium',
          tags: ['Medizintechnik', 'Entwicklungen', 'Deutschland'],
          url: 'https://mtd.de/medizintechnik-fachartikel/',
          summary: 'Aktuelle Medizintechnik Entwicklungen...',
          language: 'de',
          source: 'Knowledge: MTD'
        },
        {
          id: 'mt-001',
          title: 'mt-medizintechnik News: Branchenneuigkeiten',
          content: 'Neueste Nachrichten und Entwicklungen aus der Medizintechnik-Branche.',
          authority: 'mt-medizintechnik',
          region: 'Germany',
          category: 'medtech_knowledge',
          published_at: '2025-07-31T00:00:00Z',
          priority: 'medium',
          tags: ['News', 'Branche', 'Medizintechnik'],
          url: 'https://mt-medizintechnik.de/',
          summary: 'Neueste Branchennachrichten...',
          language: 'de',
          source: 'Knowledge: mt-medizintechnik'
        },
        {
          id: 'frontiers-001',
          title: 'Frontiers in Medical Technology Research',
          content: 'Latest research findings in medical technology and innovation.',
          authority: 'Frontiers',
          region: 'Global',
          category: 'medtech_knowledge',
          published_at: '2025-07-30T23:30:00Z',
          priority: 'high',
          tags: ['research', 'technology', 'innovation'],
          url: 'https://www.frontiersin.org/journals/medical-technology',
          summary: 'Latest medical technology research...',
          language: 'en',
          source: 'Knowledge: Frontiers'
        }
      ];
      
      // Try to fetch real knowledge articles from regulatory updates
      try {
        const response = await fetch('/api/regulatory-updates');
        const data = await response.json();
        
        const realArticles = Array.isArray(data) ? data : (data.updates || []);
        const knowledgeArticles = realArticles
          .filter((update: any) => 
            update.source_id && 
            (update.title?.includes('Knowledge:') || 
             update.description?.includes('Knowledge:') ||
             update.source_id?.includes('knowledge'))
          )
          .map((update: any) => ({
            id: update.id,
            title: update.title,
            content: update.description || 'Content available from source',
            authority: update.source_id?.split('-')[0] || 'Unknown',
            region: update.region || 'Global',
            category: 'medtech_knowledge',
            published_at: update.published_at,
            priority: update.priority || 'medium',
            tags: update.device_classes || [],
            url: update.source_url || '',
            summary: update.description?.slice(0, 200) || 'Summary available',
            language: update.region === 'Germany' ? 'de' : 'en',
            source: `Knowledge: ${update.source_id}`
          }));
        
        // Combine demo articles with any real articles found
        const combinedArticles = [...demoArticles, ...knowledgeArticles];
        return combinedArticles;
      } catch (error) {
        console.error('Error fetching real articles, using demo data:', error);
        return demoArticles;
      }
    }
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
    mutationFn: () => fetch('/api/knowledge/collect-articles', { method: 'POST' }).then(res => res.json()),
    onSuccess: (data: CollectionResult) => {
      if (data.success) {
        toast({
          title: "Knowledge Collection Erfolgreich",
          description: `${data.summary.totalArticles} Artikel von ${data.summary.successfulSources} Quellen gesammelt`,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/regulatory-updates'] });
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medtech_knowledge': return <BookOpen className="h-4 w-4" />;
      case 'regulatory_updates': return <FileText className="h-4 w-4" />;
      case 'legal_cases': return <AlertCircle className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'medtech_knowledge': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'regulatory_updates': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'legal_cases': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Database className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'Never') return 'Nie';
    return new Date(dateString).toLocaleString('de-DE');
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Knowledge Base</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Medizintechnik Wissensartikel, Regulatorische Updates und Rechtsfälle
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => deepScrapingMutation.mutate()}
            disabled={deepScrapingMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700"
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
            className="bg-blue-600 hover:bg-blue-700"
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
            <CardTitle className="text-sm font-medium">Quellen</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSources}/{stats.totalSources}</div>
            <p className="text-xs text-muted-foreground">Aktive Datenquellen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Knowledge Articles</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalArticles}</div>
            <p className="text-xs text-muted-foreground">Gesamt Artikel</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regionen</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.regions}</div>
            <p className="text-xs text-muted-foreground">Abgedeckte Regionen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sprachen</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.languages}</div>
            <p className="text-xs text-muted-foreground">Unterstützte Sprachen</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="articles" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="articles">Knowledge Articles</TabsTrigger>
          <TabsTrigger value="extraction">
            <Download className="h-4 w-4 mr-2" />
            Extraktion
          </TabsTrigger>
          <TabsTrigger value="sources">Datenquellen</TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Suche und Filter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                  placeholder="Suche nach Titel, Inhalt oder Behörde..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Kategorien</SelectItem>
                    <SelectItem value="medtech_knowledge">Medizintechnik Wissen</SelectItem>
                    <SelectItem value="regulatory_updates">Regulatorische Updates</SelectItem>
                    <SelectItem value="legal_cases">Rechtsfälle</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Regionen</SelectItem>
                    {Array.from(new Set(articles.map(a => a.region))).map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedSource} onValueChange={setSelectedSource}>
                  <SelectTrigger>
                    <SelectValue placeholder="Quelle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Quellen</SelectItem>
                    {Array.from(new Set(articles.map(a => a.authority))).map(authority => (
                      <SelectItem key={authority} value={authority}>{authority}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                {filteredArticles.length} von {articles.length} Artikeln angezeigt
              </div>
            </CardContent>
          </Card>

          {/* Articles List */}
          <div className="space-y-4">
            {articlesLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Lade Knowledge Articles...</p>
              </div>
            ) : filteredArticles.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Keine Artikel gefunden</h3>
                  <p className="text-muted-foreground mb-4">
                    Versuchen Sie andere Suchbegriffe oder synchronisieren Sie neue Artikel.
                  </p>
                  <Button onClick={() => collectMutation.mutate()}>
                    Quellen Synchronisieren
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {filteredArticles.map((article) => (
                    <Card key={article.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2">{article.title}</CardTitle>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getCategoryColor(article.category)}>
                                {getCategoryIcon(article.category)}
                                <span className="ml-1">
                                  {article.category === 'medtech_knowledge' && 'Medizintechnik'}
                                  {article.category === 'regulatory_updates' && 'Regulatorisch'}
                                  {article.category === 'legal_cases' && 'Rechtsfälle'}
                                </span>
                              </Badge>
                              <Badge variant="outline">
                                <Globe className="h-3 w-3 mr-1" />
                                {article.region}
                              </Badge>
                              <Badge variant="outline">{article.language}</Badge>
                            </div>
                            <CardDescription className="text-sm">
                              {article.authority} • {formatDate(article.published_at)}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {article.summary || article.content?.slice(0, 200) + '...'}
                        </p>
                        
                        {article.tags && article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {article.tags.slice(0, 5).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDate(article.published_at)}
                          </div>
                          {article.url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={article.url} target="_blank" rel="noopener noreferrer">
                                Quelle öffnen
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </TabsContent>

        <TabsContent value="extraction" className="space-y-6">
          <KnowledgeExtractionPanel />
        </TabsContent>

        <TabsContent value="sources" className="space-y-6">
          <div className="grid gap-4">
            {sourcesLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Lade Datenquellen...</p>
              </div>
            ) : (
              sources.map((source) => (
                <Card key={source.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          {getStatusIcon(source.status)}
                          {source.name}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {source.authority} • {source.region} • {source.language}
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => syncSourceMutation.mutate(source.id)}
                        disabled={syncSourceMutation.isPending}
                      >
                        {syncSourceMutation.isPending ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                        Sync
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <Badge className={getCategoryColor(source.category)}>
                          {getCategoryIcon(source.category)}
                          <span className="ml-1">
                            {source.category === 'medtech_knowledge' && 'Medizintechnik'}
                            {source.category === 'regulatory_updates' && 'Regulatorisch'}
                            {source.category === 'legal_cases' && 'Rechtsfälle'}
                          </span>
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Update: alle {source.updateFrequency}h
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Priorität: {source.priority}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Letzte Prüfung: {formatDate(source.lastChecked)}</span>
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Quelle besuchen
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}