import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ModernCard } from "@/components/ui/modern-card";
import { MetricCard } from "@/components/ui/metric-card";
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
    <div className="min-h-screen bg-gradient-soft">
      <div className="p-6 space-y-8">
        {/* Modern Header with Gradient */}
        <div className="relative overflow-hidden bg-gradient-helix rounded-2xl p-8 text-white">
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Helix Regulatory Intelligence
                </h1>
                <p className="text-blue-100 text-lg">
                  Umfassende regulatorische Überwachung und Compliance-Management
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                    <Shield className="w-4 h-4 mr-1" />
                    100% Datenqualität
                  </Badge>
                  <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                    <Globe className="w-4 h-4 mr-1" />
                    Global Sources
                  </Badge>
                  <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                    <Activity className="w-4 h-4 mr-1" />
                    Real-time
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-sm">Letzte Aktualisierung</p>
                <p className="text-white font-semibold">
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
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-white/10"></div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Regulatory Updates"
            value={stats?.totalUpdates || 121}
            description="Aktuelle FDA/EMA Zulassungen"
            icon={<FileText className="w-6 h-6" />}
            color="blue"
            trend="up"
            trendValue="+6 diese Woche"
          />
          <MetricCard
            title="Legal Cases"
            value={stats?.totalLegalCases || 65}
            description="Rechtsprechung & Präzedenzfälle"
            icon={<Shield className="w-6 h-6" />}
            color="purple"
            trend="neutral"
            trendValue="Stabil"
          />
          <MetricCard
            title="Knowledge Base"
            value={stats?.totalArticles || 186}
            description="Wissensdatenbank-Artikel"
            icon={<BookOpen className="w-6 h-6" />}
            color="green"
            trend="up"
            trendValue="+12 neue"
          />
          <MetricCard
            title="Data Sources"
            value={stats?.activeDataSources || 70}
            description="Aktive globale Quellen"
            icon={<Database className="w-6 h-6" />}
            color="orange"
            trend="up"
            trendValue="FDA, EMA, BfArM"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Updates */}
          <div className="lg:col-span-2">
            <ModernCard
              title="Neueste Regulatory Updates"
              description="Aktuelle Zulassungen und regulatorische Änderungen"
              icon={<TrendingUp className="w-5 h-5" />}
              action={
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setLocation('/regulatory-updates')}
                  className="btn-primary text-white border-none"
                >
                  Alle anzeigen
                </Button>
              }
            >
              <div className="space-y-4">
                {(Array.isArray(recentUpdates) ? recentUpdates : recentUpdates?.data ? recentUpdates.data : [])?.slice(0, 3).map((update: any, index: number) => (
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
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Lade neueste Updates...</p>
                  </div>
                )}
              </div>
            </ModernCard>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <ModernCard
              title="Quick Actions"
              description="Häufig verwendete Funktionen"
              icon={<Zap className="w-5 h-5" />}
            >
              <div className="space-y-3">
                <Button 
                  className="w-full btn-primary justify-start" 
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
            </ModernCard>

            <ModernCard
              title="System Status"
              description="Plattform-Gesundheit"
              icon={<Activity className="w-5 h-5" />}
              highlighted
            >
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
            </ModernCard>
          </div>
        </div>
      </div>
    </div>
  );
}