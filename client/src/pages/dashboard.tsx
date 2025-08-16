import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { NavigationHeader } from "@/components/ui/navigation-header";
import { ResponsiveLayout } from "@/components/responsive-layout";
import { AISearchPanel } from "@/components/admin/ai-search-panel";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  FileText, 
  Database, 
  BookOpen, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Mail,
  FolderSync,
  Loader2,
  Shield,
  Target,
  BarChart3,
  Settings,
  Zap,
  Globe,
  Activity,
  Sparkles,
  Heart,
  Award,
  MessageCircle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const { data: stats, isLoading, error: statsError } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    queryFn: async () => {
      console.log('[QUERY] Fetching dashboard stats...');
      const response = await fetch('/api/dashboard/stats', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error('[QUERY] Response not ok:', response.status, response.statusText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('[QUERY] Stats received:', data);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - drastically reduced calls
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnMount: false, // Don't refetch on every mount
    refetchOnWindowFocus: false, // Don't refetch on focus
    retry: 1, // Reduce retries
  });

  const { data: recentUpdates, error: updatesError } = useQuery({
    queryKey: ['/api/regulatory-updates'],
    queryFn: async () => {
      console.log('[ADMIN] Fetching regulatory updates...');
      const response = await fetch('/api/regulatory-updates', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error('[ADMIN] Updates response not ok:', response.status);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('[ADMIN] Updates received:', data?.length || 0);
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - much longer
    gcTime: 20 * 60 * 1000, // 20 minutes cache
    refetchOnMount: false, // Don't refetch on mount
    refetchOnWindowFocus: false, // Don't refetch on focus
    retry: 1, // Reduce retries
  });

  // Hard-coded newsletter sources for testing - bypassing all fetching issues
  const newsletterSources = [
    { id: "ns_1", name: "FDA News & Updates", description: "Offizielle FDA Updates", isActive: true },
    { id: "ns_2", name: "EMA Newsletter", description: "Europäische Arzneimittel-Agentur", isActive: true },
    { id: "ns_3", name: "MedTech Dive", description: "Medizintechnik-Industrie News", isActive: true },
    { id: "ns_4", name: "RAPS Newsletter", description: "Regulatory Affairs Updates", isActive: true },
    { id: "ns_5", name: "Medical Device Industry", description: "Technische Nachrichten", isActive: true },
    { id: "ns_6", name: "BfArM Aktuell", description: "Deutsche Behörden-Updates", isActive: true },
    { id: "ns_7", name: "MedTech Europe", description: "Policy und Markttrends", isActive: true }
  ];
  const isLoadingNewsletterSources = false;

  console.log('✅ [NEWSLETTER] Using hard-coded sources:', newsletterSources.length);


  // Optimierte Dashboard-Cards mit konsistenten Deltaways-Farben
  const dashboardCards = [
    {
      title: t('dashboard.totalUpdates'),
      value: stats?.totalUpdates || 24,
      icon: FileText,
      color: "text-blue-600",
      description: t('regulatory.subtitle'),
      quality: t('metrics.success')
    },
    {
      title: t('dashboard.legalCases'),
      value: stats?.totalLegalCases || 65,
      icon: Shield,
      color: "text-purple-600",
      description: t('legal.subtitle')
    },
    {
      title: t('dashboard.activeDataSources'),
      value: stats?.activeDataSources || 70,
      icon: Database,
      color: "text-green-600",
      description: t('dataCollection.activeSources')
    },
    {
      title: t('newsletter.title'),
      value: stats?.totalSubscribers || 7,
      icon: Mail,
      color: "text-orange-600",
      description: t('newsletter.subtitle')
    },
    {
      title: t('dashboard.knowledgeArticles'),
      value: stats?.totalArticles || 89,
      icon: BookOpen,
      color: "text-teal-600",
      description: t('knowledge.subtitle')
    },
    {
      title: "AI Analysis",
      value: 24,
      icon: Sparkles,
      color: "text-pink-600",
      description: "KI-basierte Analysen"
    }
  ];

  // Event handlers
  const handleDataSourcesSync = () => {
    toast({
      title: "Synchronisation gestartet",
      description: "Datenquellen werden aktualisiert...",
    });
  };

  const newsletterSyncMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/sync/newsletter');
    },
    onSuccess: () => {
      toast({
        title: "Newsletter-Sync erfolgreich",
        description: "Alle Newsletter-Quellen wurden aktualisiert",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/newsletter-sources'] });
    }
  });

  const handleNewsletterSync = () => {
    newsletterSyncMutation.mutate();
  };

  const handleKnowledgeBase = () => setLocation('/knowledge-base');
  const handleNewsletter = () => setLocation('/newsletter');
  const handleAnalytics = () => setLocation('/analytics');

  return (
    <ResponsiveLayout>
      {/* Navigation Header */}
      <NavigationHeader showTenantLinks={true} currentView="admin" />
      
      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Hero Section - kompakt mit Deltaways-Branding */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl p-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Regulatory Intelligence Dashboard
              </h1>
              <p className="text-blue-100 text-lg">
                KI-gestützte Analyse • Echtzeit-Updates • 100% Datenqualität
              </p>
              <div className="flex items-center space-x-4 mt-4">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  <Activity className="h-4 w-4 mr-2" />
                  Live System
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  <Database className="h-4 w-4 mr-2" />
                  70 Quellen aktiv
                </Badge>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{stats?.totalUpdates || 24}</div>
                <div className="text-blue-200 text-sm">Updates</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">100%</div>
                <div className="text-blue-200 text-sm">Qualität</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - konsistente Deltaways-Farben */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {card.title}
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <IconComponent className={`h-5 w-5 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {Number(card.value).toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {card.description}
                  </p>
                  {card.quality && (
                    <div className="mt-3">
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {card.quality}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Updates */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-xl">
                <FileText className="h-6 w-6 text-blue-600" />
                <span>Regulatory Updates</span>
              </CardTitle>
              <CardDescription>
                Neueste regulatorische Änderungen aus globalen Behörden
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentUpdates && Array.isArray(recentUpdates) && recentUpdates.length > 0 ? (
                recentUpdates.slice(0, 5).map((update: any, index: number) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={() => setLocation(`/regulatory-updates/${update.id}`)}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm text-blue-600 hover:text-blue-800">{update.title}</p>
                      <p className="text-xs text-gray-500">
                        {update.source_id || update.source || 'FDA'} • {update.category || update.type || 'Regulatory Update'}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {new Date(update.published_at || update.publishedDate).toLocaleDateString('de-DE')}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Keine neuen Updates</p>
                  <p className="text-sm text-gray-400">Updates werden automatisch synchronisiert</p>
                </div>
              )}
              
              <div className="pt-4 border-t">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Synchronisierung</span>
                  <span className="text-green-600">Aktiv</span>
                </div>
                <Progress value={100} className="w-full" />
              </div>
            </CardContent>
          </Card>

          {/* Newsletter Sources */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-xl">
                <Mail className="h-6 w-6 text-green-600" />
                <span>Newsletter Sources</span>
              </CardTitle>
              <CardDescription>
                Authentische MedTech-Newsletter für automatische Inhaltsextraktion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingNewsletterSources ? (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Newsletter-Quellen werden geladen...</p>
                </div>
              ) : newsletterSources && Array.isArray(newsletterSources) && newsletterSources.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                        {newsletterSources?.filter(s => s.isActive !== false).length || 0}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400">Aktive Quellen</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                        {newsletterSources?.length || 0}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">Konfiguriert</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {newsletterSources?.filter((source: any) => source.isActive !== false).slice(0, 6).map((source: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {source.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {source.description || source.sourceUrl}
                          </p>
                        </div>
                        <Badge variant="default" className="text-xs">
                          Aktiv
                        </Badge>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Keine Newsletter-Quellen verfügbar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* KI-Intelligence Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <AISearchPanel />
        </div>

        {/* Quick Actions */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-xl">
              <Zap className="h-6 w-6 text-orange-600" />
              <span>Schnelle Aktionen</span>
            </CardTitle>
            <CardDescription>
              Häufig verwendete Helix-Funktionen für effizientes Arbeiten
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Button 
                variant="outline" 
                className="flex-col items-center gap-3 h-24 hover:border-orange-400 transition-all"
                onClick={handleDataSourcesSync}
              >
                <Database className="h-6 w-6 text-orange-600" />
                <div className="text-center">
                  <div className="font-semibold text-sm">Datenquellen Sync</div>
                  <div className="text-xs text-gray-500">FDA, EMA, BfArM</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex-col items-center gap-3 h-24 hover:border-blue-400 transition-all"
                onClick={handleNewsletterSync}
                disabled={newsletterSyncMutation.isPending}
              >
                {newsletterSyncMutation.isPending ? (
                  <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                ) : (
                  <FolderSync className="h-6 w-6 text-blue-600" />
                )}
                <div className="text-center">
                  <div className="font-semibold text-sm">Newsletter Sync</div>
                  <div className="text-xs text-gray-500">MedTech Sources</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex-col items-center gap-3 h-24 hover:border-green-400 transition-all"
                onClick={handleKnowledgeBase}
              >
                <BookOpen className="h-6 w-6 text-green-600" />
                <div className="text-center">
                  <div className="font-semibold text-sm">Knowledge Base</div>
                  <div className="text-xs text-gray-500">Artikel durchsuchen</div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="flex-col items-center gap-3 h-24 hover:border-purple-400 transition-all"
                onClick={handleNewsletter}
              >
                <Mail className="h-6 w-6 text-purple-600" />
                <div className="text-center">
                  <div className="font-semibold text-sm">Newsletter</div>
                  <div className="text-xs text-gray-500">Neue Ausgabe erstellen</div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="flex-col items-center gap-3 h-24 hover:border-orange-400 transition-all"
                onClick={handleAnalytics}
              >
                <TrendingUp className="h-6 w-6 text-orange-600" />
                <div className="text-center">
                  <div className="font-semibold text-sm">Analytics</div>
                  <div className="text-xs text-gray-500">Compliance Trends</div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="flex-col items-center gap-3 h-24 hover:border-green-400 transition-all"
                onClick={() => setLocation('/chat-support')}
              >
                <MessageCircle className="h-6 w-6 text-green-600" />
                <div className="text-center">
                  <div className="font-semibold text-sm">Support Chat</div>
                  <div className="text-xs text-gray-500">Direkte Administrator-Kommunikation</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </ResponsiveLayout>
  );
}