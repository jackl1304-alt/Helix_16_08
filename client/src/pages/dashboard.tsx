import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  FileText, 
  Database, 
  BookOpen, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Mail
} from "lucide-react";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  
  const { data: stats = {}, isLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: recentUpdates } = useQuery({
    queryKey: ['/api/regulatory-updates/recent'],
    queryFn: () => fetch('/api/regulatory-updates/recent?limit=5').then(res => res.json()),
  });

  const { data: pendingApprovals } = useQuery({
    queryKey: ['/api/approvals/pending'],
    queryFn: () => fetch('/api/approvals/pending').then(res => res.json()),
  });

  // Quick Action Handlers
  const handleDataSourcesSync = () => setLocation('/sync-manager');
  const handleKnowledgeBase = () => setLocation('/knowledge-base');
  const handleNewsletter = () => setLocation('/newsletter-manager');
  const handleAnalytics = () => setLocation('/analytics');

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
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

  const dashboardCards = [
    {
      title: "Regulatory Updates",
      value: stats?.totalUpdates || 0,
      description: `${stats?.recentUpdates || 0} in den letzten 30 Tagen`,
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "Legal Cases",
      value: stats?.totalLegalCases || 0,
      description: "Rechtsprechungsdatenbank",
      icon: Database,
      color: "text-purple-600",
    },
    {
      title: "Knowledge Articles",
      value: stats?.totalArticles || 0,
      description: "Wissensdatenbank",
      icon: BookOpen,
      color: "text-green-600",
    },
    {
      title: "Subscribers",
      value: stats?.totalSubscribers || 0,
      description: "Newsletter-Abonnenten",
      icon: Users,
      color: "text-orange-600",
    },
    {
      title: "Pending Approvals",
      value: stats?.pendingApprovals || 0,
      description: "Wartende Genehmigungen",
      icon: CheckCircle,
      color: "text-indigo-600",
    },
    {
      title: "Active Data Sources",
      value: stats?.activeDataSources || 0,
      description: "Aktive Datenquellen",
      icon: TrendingUp,
      color: "text-teal-600",
    },
    {
      title: "Newsletters",
      value: stats?.totalNewsletters || 0,
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
            Überblick über globale MedTech-Regulierung und Compliance
          </p>
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
                  {card.value}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {card.description}
                </p>
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
              Neueste Vorschriften und Richtlinien
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentUpdates && recentUpdates.length > 0 ? (
              recentUpdates.slice(0, 5).map((update: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{update.title}</p>
                    <p className="text-xs text-gray-500">
                      {update.jurisdiction} • {update.type}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {new Date(update.publishedDate).toLocaleDateString('de-DE')}
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

        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-indigo-600" />
              Wartende Genehmigungen
            </CardTitle>
            <CardDescription>
              Newsletter und Artikel zur Freigabe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingApprovals && pendingApprovals.length > 0 ? (
              pendingApprovals.slice(0, 5).map((approval: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">
                      {approval.itemType === 'newsletter' ? 'Newsletter' : 
                       approval.itemType === 'article' ? 'Knowledge Article' : approval.itemType}
                    </p>
                    <p className="text-xs text-gray-500">
                      Angefragt: {new Date(approval.requestedAt).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    Wartend
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Keine wartenden Genehmigungen</p>
                <p className="text-sm text-gray-400">Alle Inhalte sind genehmigt</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 h-20 hover:bg-blue-50 hover:border-blue-200 transition-colors"
              onClick={handleDataSourcesSync}
            >
              <Database className="h-5 w-5 text-blue-600" />
              <div className="text-left">
                <div className="font-medium">Datenquellen sync</div>
                <div className="text-xs text-gray-500">FDA, EMA, BfArM Updates</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2 h-20 hover:bg-green-50 hover:border-green-200 transition-colors"
              onClick={handleKnowledgeBase}
            >
              <BookOpen className="h-5 w-5 text-green-600" />
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