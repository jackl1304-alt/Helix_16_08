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
      {/* Header - KLEINER BALKEN & GROSSES HELIX ICON */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 rounded-lg p-4 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* GROSSES HELIX ICON */}
            <div className="bg-white/20 p-3 rounded-lg">
              <svg viewBox="0 0 64 64" className="h-12 w-12 text-white">
                <defs>
                  <linearGradient id="helixGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="1"/>
                    <stop offset="50%" stopColor="#e0e7ff" stopOpacity="0.9"/>
                    <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0.8"/>
                  </linearGradient>
                </defs>
                <path d="M12 16 Q20 8, 32 16 Q44 24, 52 16" stroke="url(#helixGradient)" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <path d="M12 24 Q20 16, 32 24 Q44 32, 52 24" stroke="url(#helixGradient)" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <path d="M12 32 Q20 24, 32 32 Q44 40, 52 32" stroke="url(#helixGradient)" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <path d="M12 40 Q20 32, 32 40 Q44 48, 52 40" stroke="url(#helixGradient)" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <path d="M12 48 Q20 40, 32 48 Q44 56, 52 48" stroke="url(#helixGradient)" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="2" fill="url(#helixGradient)"/>
                <circle cx="32" cy="24" r="2" fill="url(#helixGradient)"/>
                <circle cx="52" cy="32" r="2" fill="url(#helixGradient)"/>
                <circle cx="32" cy="40" r="2" fill="url(#helixGradient)"/>
                <circle cx="12" cy="48" r="2" fill="url(#helixGradient)"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Helix Regulatory Intelligence
              </h1>
              <p className="text-blue-100 text-sm">
                KI-gestützte Analyse • Echtzeit-Updates • 100% Datenqualität
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{stats?.totalUpdates || 66}</div>
              <div className="text-blue-100 text-sm">Updates</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">100%</div>
              <div className="text-blue-100 text-sm">Qualität</div>
            </div>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Sync
            </button>
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
              66
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
              65
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
              70
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

      {/* Main Content Grid - Exakt wie im Screenshot */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Regulatory Updates Section - Wie Screenshot */}
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
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Exakte Items aus Screenshot */}
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  FDA 510(k): Sonic Speed Anchor, Iconic Speed HA+ Anchor (K252144)
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  30.7.2025 • Regulatory Update
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  FDA 510(k): IntelliMAX System (K252215)
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  25.7.2025 • Regulatory Update
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  FDA 510(k): MF GC GBNz Facial Toning System (K252238)
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  18.7.2025 • Regulatory Update
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  FDA 510(k): Sonic Speed Anchor, Iconic Speed HA+ Anchor
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  30.7.2025 • Regulatory Update
                </p>
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="text-center text-sm text-gray-600">
                Synchronisierung...
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Newsletter Sources Section - Exakt wie Screenshot */}
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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    FDA News & Updates
                  </p>
                  <p className="text-xs text-gray-500">
                    Offizielle FDA Updates
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="bg-blue-600 text-white border-blue-600 hover:bg-blue-700 text-xs px-3">
                Aktiv
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    EMA Newsletter
                  </p>
                  <p className="text-xs text-gray-500">
                    Europäische Arzneimittel-Agentur
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="bg-blue-600 text-white border-blue-600 hover:bg-blue-700 text-xs px-3">
                Aktiv
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    MedTech Dive
                  </p>
                  <p className="text-xs text-gray-500">
                    Medizintechnik-Branche News
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="bg-blue-600 text-white border-blue-600 hover:bg-blue-700 text-xs px-3">
                Aktiv
              </Button>
            </div>
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