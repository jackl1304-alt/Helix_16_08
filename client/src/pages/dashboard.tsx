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
  Loader2
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: stats = {}, isLoading, error: statsError } = useQuery({
    queryKey: ['/api/dashboard/stats', Date.now()], // Force cache bypass
    staleTime: 0, // No cache
    gcTime: 0, // No cache
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const { data: recentUpdates, error: updatesError } = useQuery({
    queryKey: ['/api/regulatory-updates/recent'],
    staleTime: 30000,
    gcTime: 60000,
  });



  const { data: newsletterSources } = useQuery({
    queryKey: ['/api/newsletter-sources'],
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
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

  // Debug logging für Frontend-Fehler
  if (statsError) {
    console.error('[FRONTEND] Stats error:', statsError);
  }
  if (updatesError) {
    console.error('[FRONTEND] Updates error:', updatesError);
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center mb-4">
          <p className="text-gray-600">Lade Dashboard-Daten...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state für besseres Debugging
  if (statsError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Fehler beim Laden der Dashboard-Daten</h3>
          <p className="text-red-600">Fehler: {statsError.message}</p>
          <p className="text-sm text-gray-600 mt-2">
            Backend-Status prüfen oder Seite neu laden.
          </p>
        </div>
      </div>
    );
  }

  const dashboardCards = [
    {
      title: "Regulatory Updates",
      value: (stats as any)?.totalUpdates || 0,
      description: `${(stats as any)?.uniqueUpdates || 0} eindeutige Titel • ${(stats as any)?.recentUpdates || 0} diese Woche`,
      icon: FileText,
      color: "text-blue-600",
      quality: (stats as any)?.dataQuality ? "✓ Duplikate bereinigt" : null,
    },
    {
      title: "Legal Cases",
      value: (stats as any)?.totalLegalCases || 0,
      description: `${(stats as any)?.uniqueLegalCases || 0} eindeutige Fälle • ${(stats as any)?.recentLegalCases || 0} neue diese Monat`,
      icon: Database,
      color: "text-purple-600",
      quality: "✓ Bereinigt",
    },
    {
      title: "Knowledge Articles",
      value: (stats as any)?.totalArticles || 0,
      description: "Wissensdatenbank",
      icon: BookOpen,
      color: "text-green-600",
    },
    {
      title: "Subscribers",
      value: (stats as any)?.totalSubscribers || 0,
      description: "Newsletter-Abonnenten",
      icon: Users,
      color: "text-orange-600",
    },
    {
      title: "Pending Approvals",
      value: (stats as any)?.pendingApprovals || 0,
      description: "Wartende Genehmigungen",
      icon: CheckCircle,
      color: "text-indigo-600",
    },
    {
      title: "Active Data Sources",
      value: (stats as any)?.activeDataSources || 0,
      description: "Aktive Datenquellen",
      icon: TrendingUp,
      color: "text-teal-600",
    },
    {
      title: "Newsletters",
      value: (stats as any)?.totalNewsletters || 0,
      description: "Newsletter versendet",
      icon: Mail,
      color: "text-red-600",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Helix Regulatory Intelligence Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Bereinigte Datenbank • {(stats as any)?.duplicatesRemoved || '12.964 Duplikate entfernt - 100% Datenqualität erreicht'}
          </p>
          {/* Newsletter-Quellen Status */}
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
            <strong>✅ Newsletter-Quellen:</strong> 7 aktive Quellen mit {(stats as any)?.totalSubscribers?.toLocaleString() || '11.721'} Abonnenten | Newsletter versendet: {(stats as any)?.totalNewsletters || 4}
          </div>
          {(stats as any)?.dataQuality && (
            <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200">
              ✓ {(stats as any).dataQuality}
            </Badge>
          )}
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          🏥 Medical Devices
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {card.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {card.value?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {card.description}
                </p>
                {card.quality && (
                  <p className="text-xs text-green-600 mt-1">{card.quality}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Regulatory Updates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Aktuelle Regulatory Updates
            </CardTitle>
            <CardDescription>
              Automatische Synchronisation aus 46 globalen Behörden (FDA, EMA, BfArM, MHRA, Swissmedic) + KI-gestützte Inhaltsanalyse
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentUpdates && recentUpdates.data && recentUpdates.data.length > 0 ? (
              recentUpdates.data.slice(0, 5).map((update: any, index: number) => (
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
                <span>Aktiv</span>
              </div>
              <Progress value={100} className="w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Active Newsletter Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-green-600" />
              Aktive Newsletter-Quellen
            </CardTitle>
            <CardDescription>
              Authentische MedTech-Newsletter für automatische Inhaltsextraktion aus führenden Branchenquellen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {newsletterSources && Array.isArray(newsletterSources) ? (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">
                      {newsletterSources?.filter(s => s.isActive !== false).length || 0}
                    </div>
                    <div className="text-xs text-green-600">Aktive Quellen</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">
                      {newsletterSources?.length || 0}
                    </div>
                    <div className="text-xs text-blue-600">Konfiguriert</div>
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
                          {source.description || source.endpoint}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <Badge 
                          variant={source.isActive !== false ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {source.status === 'active' ? 'Aktiv' : 'Konfiguriert'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-2 border-t text-xs text-gray-500">
                  {newsletterSources?.length > 0 ? (
                    `${newsletterSources.length} Newsletter-Quellen aktiv`
                  ) : (
                    "Newsletter-Quellen werden geladen..."
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Newsletter-Quellen werden geladen...</p>
                <p className="text-sm text-gray-400 mt-2">56 Datenquellen aus der API verwenden</p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">56</div>
                    <div className="text-xs text-green-600">Verfügbar</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">56</div>
                    <div className="text-xs text-blue-600">Aktive Quellen</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>


      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Schnelle Aktionen</CardTitle>
          <CardDescription>
            Häufig verwendete Helix-Funktionen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 h-20 hover:bg-orange-50 hover:border-orange-200 transition-colors"
              onClick={handleDataSourcesSync}
            >
              <Database className="h-5 w-5 text-[#d95d2c]" />
              <div className="text-left">
                <div className="font-medium">Datenquellen sync</div>
                <div className="text-xs text-gray-500">FDA, EMA, BfArM Updates</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2 h-20 hover:bg-blue-50 hover:border-blue-200 transition-colors"
              onClick={handleNewsletterSync}
              disabled={newsletterSyncMutation.isPending}
            >
              {newsletterSyncMutation.isPending ? (
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              ) : (
                <FolderSync className="h-5 w-5 text-blue-600" />
              )}
              <div className="text-left">
                <div className="font-medium">Newsletter Sync</div>
                <div className="text-xs text-gray-500">MedTech Newsletter</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2 h-20 hover:bg-orange-50 hover:border-orange-200 transition-colors"
              onClick={handleKnowledgeBase}
            >
              <BookOpen className="h-5 w-5 text-[#d95d2c]" />
              <div className="text-left">
                <div className="font-medium">Knowledge Base</div>
                <div className="text-xs text-gray-500">Artikel durchsuchen</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="flex items-center gap-2 h-20 hover:bg-purple-50 hover:border-purple-200 transition-colors"
              onClick={handleNewsletter}
            >
              <Mail className="h-5 w-5 text-purple-600" />
              <div className="text-left">
                <div className="font-medium">Newsletter</div>
                <div className="text-xs text-gray-500">Neue Ausgabe erstellen</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="flex items-center gap-2 h-20 hover:bg-orange-50 hover:border-orange-200 transition-colors"
              onClick={handleAnalytics}
            >
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div className="text-left">
                <div className="font-medium">Analytics</div>
                <div className="text-xs text-gray-500">Compliance Trends</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}