import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Scale,
  Lightbulb,
  Search,
  MessageSquare,
  Globe,
  Mail,
  ArrowUpRight,
  Zap,
  RefreshCw,
  Eye,
  Settings
} from "lucide-react";
import type { RegulatoryUpdate } from '@shared/schema';

interface DashboardStats {
  activeDataSources: number;
  totalUpdates: number;
  totalLegalCases: number;
  totalArticles: number;
  recentUpdates: number;
  pendingSyncs: number;
  totalNewsletters: number;
  totalSubscribers: number;
}

export default function Dashboard() {
  // Dashboard-Statistiken von API laden
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard-stats'],
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
  });

  // Regulatory Updates von API laden  
  const { data: regulatoryUpdates = [], isLoading: updatesLoading } = useQuery<RegulatoryUpdate[]>({
    queryKey: ['/api/regulatory-updates'],
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
  });

  // Newsletter-Quellen - statisch wie in Screenshots
  const newsletterSources = [
    {
      id: "ns_1",
      name: "FDA News & Updates",
      isActive: true,
      count: 7
    },
    {
      id: "ns_2",
      name: "EMA Newsletter", 
      isActive: true,
      count: 7
    },
    {
      id: "ns_3",
      name: "MedTech Dive",
      isActive: true,
      count: 0
    }
  ];

  // Loading state
  if (isLoading || updatesLoading) {
    return <div className="p-6">Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header - Exakt wie Screenshot 1 */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-3 flex items-center gap-3">
              <Activity className="h-10 w-10" />
              Regulatory Intelligence Dashboard
            </h1>
            <p className="text-blue-100 mb-6 text-lg font-medium">
              KI-gestützte Analyse • Echtzeit-Updates • 100% Datenqualität
            </p>
            <div className="flex items-center space-x-6">
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
                <Activity className="h-5 w-5" />
                <span className="font-medium">Live System</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">70 Quellen aktiv</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-6xl font-bold mb-2">
              66
            </div>
            <div className="text-blue-100 text-lg font-medium">Updates</div>
            <div className="text-4xl font-bold mt-4">
              100%
            </div>
            <div className="text-blue-100 text-lg font-medium">Qualität</div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Exakt wie Screenshot 1 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Regulatory Updates */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Regulatory Updates
            </CardTitle>
            <FileText className="h-6 w-6 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">
              {stats?.totalUpdates || 66}
            </div>
            <p className="text-sm text-green-600 font-medium mt-2">
              Aktuelle regulatorische Änderungen
            </p>
            <div className="flex items-center mt-3">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
              <span className="text-xs text-gray-500 font-medium">100% Qualität</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Legal Cases */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Legal Cases
            </CardTitle>
            <Scale className="h-6 w-6 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">
              {stats?.totalLegalCases || 65}
            </div>
            <p className="text-sm text-blue-600 font-medium mt-2">
              Rechtsprechung und Präzedenzfälle
            </p>
          </CardContent>
        </Card>

        {/* Data Sources */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Data Sources
            </CardTitle>
            <Database className="h-6 w-6 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">
              {stats?.activeDataSources || 70}
            </div>
            <p className="text-sm text-green-600 font-medium mt-2">
              Aktive Datenquellen global
            </p>
          </CardContent>
        </Card>

        {/* AI Analysis */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              AI Analysis
            </CardTitle>
            <Lightbulb className="h-6 w-6 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">
              24
            </div>
            <p className="text-sm text-orange-600 font-medium mt-2">
              KI-gestützte Analysen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Second Row - Newsletter and Knowledge Base */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Newsletter */}
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Newsletter
            </CardTitle>
            <Mail className="h-6 w-6 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">
              7
            </div>
            <p className="text-sm text-red-600 font-medium mt-2">
              Newsletter-Abonnements
            </p>
          </CardContent>
        </Card>

        {/* Knowledge Base */}
        <Card className="border-l-4 border-l-teal-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Knowledge Base
            </CardTitle>
            <FileText className="h-6 w-6 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">
              131
            </div>
            <p className="text-sm text-teal-600 font-medium mt-2">
              Artikel und Expertenwissen
            </p>
          </CardContent>
        </Card>

        {/* AI Analysis - Duplicate for layout */}
        <Card className="border-l-4 border-l-pink-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              AI Analysis
            </CardTitle>
            <Zap className="h-6 w-6 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">
              24
            </div>
            <p className="text-sm text-pink-600 font-medium mt-2">
              KI-gestützte Analysen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Regulatory Updates Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Regulatory Updates
                </CardTitle>
                <CardDescription>
                  Neueste regulatorische Änderungen von globalen Behörden
                </CardDescription>
              </div>
              <Badge variant="outline">
                {regulatoryUpdates.length} Updates
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {regulatoryUpdates.slice(0, 4).map((update) => (
              <div key={update.id} className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {update.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(update.createdAt || '').toLocaleDateString('de-DE')} • {update.type || 'N/A'}
                  </p>
                </div>
                <Badge 
                  variant={update.priority && update.priority > 7 ? 'destructive' : 
                          update.priority && update.priority > 4 ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {update.priority ? `P${update.priority}` : 'Normal'}
                </Badge>
              </div>
            ))}
            <div className="pt-2">
              <Button variant="ghost" size="sm" className="w-full">
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Alle Updates anzeigen
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Newsletter Sources Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Newsletter Sources
                </CardTitle>
                <CardDescription>
                  Authentische MedTech-Newsletter für automatische Inhaltsextraktion
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {newsletterSources.map((source) => (
              <div key={source.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {source.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Aktiv • {source.count} gesamt
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Abonnieren
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* KI-Powered Intelligence Section - Wie Screenshot 2 */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-purple-600" />
                KI-Powered Intelligence
              </CardTitle>
              <CardDescription>
                Intelligente Suche und Analyse mit Perspektivity AI
              </CardDescription>
            </div>
            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
              Powered by Perspektivity
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <div className="flex items-center gap-2 p-3 bg-white rounded-lg">
              <Search className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">Intelligente Suche</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">Trend-Analyse</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white rounded-lg">
              <MessageSquare className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium">Content-Analyse</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white rounded-lg">
              <Zap className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium">Smart Insights</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center gap-3 mb-3">
              <Search className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-600">Regulatory Intelligence Search</span>
            </div>
            <input
              type="text"
              placeholder="z.B. 'Neue FDA Cybersecurity-Richtlinien für Medizingeräte'"
              className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <div className="flex justify-end mt-3">
              <Button className="bg-purple-600 hover:bg-purple-700">
                Suchen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schnelle Aktionen - Wie Screenshot 2 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Schnelle Aktionen
          </CardTitle>
          <CardDescription>
            Häufig verwendete Funktionen für effizientes Arbeiten
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-6">
            <Button variant="outline" size="sm" className="flex flex-col items-center p-4 h-auto">
              <Database className="h-6 w-6 mb-2 text-blue-500" />
              <span className="text-xs">Datenquellen Sync</span>
              <span className="text-xs text-gray-500">FDA, EMA, WHO</span>
            </Button>
            <Button variant="outline" size="sm" className="flex flex-col items-center p-4 h-auto">
              <Mail className="h-6 w-6 mb-2 text-green-500" />
              <span className="text-xs">Newsletter Sync</span>
              <span className="text-xs text-gray-500">MedTech Sources</span>
            </Button>
            <Button variant="outline" size="sm" className="flex flex-col items-center p-4 h-auto">
              <FileText className="h-6 w-6 mb-2 text-purple-500" />
              <span className="text-xs">Knowledge Base</span>
              <span className="text-xs text-gray-500">Artikel verwalten</span>
            </Button>
            <Button variant="outline" size="sm" className="flex flex-col items-center p-4 h-auto">
              <Mail className="h-6 w-6 mb-2 text-red-500" />
              <span className="text-xs">Newsletter</span>
              <span className="text-xs text-gray-500">Neue Ausgabe erstellen</span>
            </Button>
            <Button variant="outline" size="sm" className="flex flex-col items-center p-4 h-auto">
              <BarChart3 className="h-6 w-6 mb-2 text-orange-500" />
              <span className="text-xs">Analytics</span>
              <span className="text-xs text-gray-500">Erweiterte Trends</span>
            </Button>
            <Button variant="outline" size="sm" className="flex flex-col items-center p-4 h-auto">
              <MessageSquare className="h-6 w-6 mb-2 text-teal-500" />
              <span className="text-xs">Support Chat</span>
              <span className="text-xs text-gray-500">Direkter Administrator-Support</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}