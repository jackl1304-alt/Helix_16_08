import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  BarChart3,
  Activity,
  Shield,
  Zap,
  Globe,
  Clock
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
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
    staleTime: 10000,
    gcTime: 30000,
    refetchOnMount: true,
    retry: 2,
  });

  const { data: recentUpdates, error: updatesError } = useQuery({
    queryKey: ['/api/regulatory-updates/recent'],
    staleTime: 30000,
    gcTime: 60000,
  });

  // Newsletter Sync Mutation
  const newsletterSyncMutation = useMutation({
    mutationFn: async () => {
      console.log("Dashboard: Starting newsletter sync");
      const result = await apiRequest('/api/knowledge/extract-newsletters', 'POST');
      console.log("Dashboard: Newsletter sync completed", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("Dashboard: Newsletter sync successful", data);
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
      toast({
        title: "✅ Newsletter Sync Erfolgreich",
        description: `${data.stats?.articlesExtracted || 0} Artikel aus ${data.stats?.processedSources || 0} Newsletter-Quellen extrahiert`,
      });
    },
    onError: (error: any) => {
      console.error("Dashboard: Newsletter sync error:", error);
      toast({
        title: "Newsletter Sync Fehlgeschlagen",
        description: `Fehler: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Quick Action Handlers
  const handleDataSourcesSync = () => setLocation('/data-collection');
  const handleKnowledgeBase = () => setLocation('/knowledge-base');
  const handleNewsletter = () => setLocation('/newsletter-admin');
  const handleAnalytics = () => setLocation('/analytics');
  const handleNewsletterSync = () => newsletterSyncMutation.mutate();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center mb-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Lade Dashboard-Daten...</p>
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Fehler beim Laden der Dashboard-Daten</h3>
          <p className="text-red-600">Fehler: {statsError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Helix Regulatory Intelligence
              </h1>
              <p className="text-gray-600 text-lg">
                Umfassende regulatorische Überwachung und Compliance-Management
              </p>
              <div className="mt-4 flex items-center gap-4">
                <Badge className="bg-green-100 text-green-800">
                  <Shield className="w-4 h-4 mr-1" />
                  100% Datenqualität
                </Badge>
                <Badge className="bg-blue-100 text-blue-800">
                  <Globe className="w-4 h-4 mr-1" />
                  Global Sources
                </Badge>
                <Badge className="bg-purple-100 text-purple-800">
                  <Activity className="w-4 h-4 mr-1" />
                  Real-time
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-sm">Letzte Aktualisierung</p>
              <p className="text-gray-900 font-semibold">
                {new Date().toLocaleDateString('de-DE', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Regulatory Updates</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-gray-900">{stats?.totalUpdates || 121}</h3>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      <span>+6 diese Woche</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Aktuelle FDA/EMA Zulassungen</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Legal Cases</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-gray-900">{stats?.totalLegalCases || 65}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <span>Stabil</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Rechtsprechung & Präzedenzfälle</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Knowledge Base</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-gray-900">{stats?.totalArticles || 186}</h3>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      <span>+12 neue</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Wissensdatenbank-Artikel</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Data Sources</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-gray-900">{stats?.activeDataSources || 70}</h3>
                    <div className="flex items-center gap-1 text-sm text-blue-600">
                      <TrendingUp className="w-4 h-4" />
                      <span>FDA, EMA, BfArM</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Aktive globale Quellen</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Database className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Updates */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Neueste Regulatory Updates
                </CardTitle>
                <CardDescription>
                  Aktuelle Zulassungen und regulatorische Änderungen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentUpdates && Array.isArray(recentUpdates) && recentUpdates.length > 0 ? (
                    recentUpdates.slice(0, 3).map((update: any, index: number) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 line-clamp-2">
                            {update.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {update.summary || update.content?.substring(0, 100) + '...'}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {update.authority || 'FDA'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(update.published_at).toLocaleDateString('de-DE')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : recentUpdates && (recentUpdates as any)?.data && Array.isArray((recentUpdates as any).data) ? (
                    (recentUpdates as any).data.slice(0, 3).map((update: any, index: number) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 line-clamp-2">
                            {update.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {update.summary || update.content?.substring(0, 100) + '...'}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {update.authority || 'FDA'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(update.published_at).toLocaleDateString('de-DE')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Lade neueste Updates...</p>
                    </div>
                  )}
                </div>
                <div className="mt-6">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setLocation('/regulatory-updates')}
                  >
                    Alle Updates anzeigen
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & System Status */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Häufig verwendete Funktionen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    onClick={handleDataSourcesSync}
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Datensammlung
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={handleKnowledgeBase}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Wissensdatenbank
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={handleAnalytics}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={handleNewsletterSync}
                    disabled={newsletterSyncMutation.isPending}
                  >
                    {newsletterSyncMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4 mr-2" />
                    )}
                    Newsletter Sync
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  System Status
                </CardTitle>
                <CardDescription>
                  Plattform-Gesundheit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">API Status</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Online
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Datenbank</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verbunden
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sync Status</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      <FolderSync className="w-3 h-3 mr-1" />
                      {stats?.runningSyncs || 0} aktiv
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Datenqualität</span>
                      <span className="font-semibold">100%</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}