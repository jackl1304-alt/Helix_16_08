import React from 'react';
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
  Zap
} from "lucide-react";

// NEUE LOKALE JSON-DATENSTRUKTUR - KEINE BACKEND-VERBINDUNGEN
const dashboardData = {
  stats: {
    totalUpdates: 2847,
    totalLegalCases: 65,
    activeQuestions: 70,
    knowledgeArticles: 89,
    aiAnalysis: 24,
    newsletterAdmin: 7,
    activeAlerts: 12,
    compliance: 98.5,
    lastSync: new Date().toISOString()
  },
  regulatoryUpdates: [
    {
      id: "ru_001",
      title: "FDA Device Classification Update",
      summary: "Neue Klassifizierung für KI-basierte Medizingeräte",
      status: "active",
      priority: "high",
      date: new Date().toISOString(),
      region: "USA",
      category: "Medical Devices"
    },
    {
      id: "ru_002", 
      title: "EU MDR Amendment 2024",
      summary: "Wichtige Änderungen zur Medizinprodukteverordnung",
      status: "pending",
      priority: "medium",
      date: new Date(Date.now() - 86400000).toISOString(),
      region: "EU",
      category: "Regulatory"
    },
    {
      id: "ru_003",
      title: "ISO 14155 Revision",
      summary: "Neue Standards für klinische Prüfungen", 
      status: "draft",
      priority: "low",
      date: new Date(Date.now() - 172800000).toISOString(),
      region: "International",
      category: "Standards"
    }
  ],
  newsletterSources: [
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
      count: 5
    },
    {
      id: "ns_3",
      name: "MedTech Dive",
      isActive: true,
      count: 12
    }
  ]
};

export default function Dashboard() {
  // LOKALE JSON-DATEN VERWENDEN - KEINE API-AUFRUFE
  const stats = dashboardData.stats;
  const regulatoryUpdates = dashboardData.regulatoryUpdates;
  const newsletterSources = dashboardData.newsletterSources;

  return (
    <div className="space-y-6">
      {/* DELTAWAYS Dashboard Header - Exact Screenshot Recreation */}
      <div className="deltaways-dashboard-card bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-3 flex items-center gap-3 deltaways-brand-text deltaways-text-animate">
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
            <div className="text-6xl font-bold mb-2 deltaways-brand-text">
              {stats.totalUpdates}
            </div>
            <div className="text-blue-100 text-lg font-medium">Updates</div>
            <div className="text-4xl font-bold mt-4 deltaways-brand-text">
              {stats.compliance}%
            </div>
            <div className="text-blue-100 text-lg font-medium">Qualität</div>
          </div>
        </div>
      </div>

      {/* Main Stats Cards exactly like screenshot */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="deltaways-stats-card border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Regulatory Updates
            </CardTitle>
            <FileText className="h-6 w-6 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900 deltaways-brand-text">
              {stats.totalUpdates}
            </div>
            <p className="text-sm text-green-600 font-medium mt-2">
              Aktuelle regulatorische Änderungen
            </p>
            <div className="flex items-center mt-3">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
              <span className="text-xs text-gray-500 font-medium">
                {stats.compliance}% Qualität
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="deltaways-stats-card border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Legal Cases
            </CardTitle>
            <Scale className="h-6 w-6 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900 deltaways-brand-text">
              {stats.totalLegalCases}
            </div>
            <p className="text-sm text-blue-600 font-medium mt-2">
              Rechtsprechung und Präzedenzfälle
            </p>
            <div className="flex items-center mt-3">
              <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-xs text-gray-500 font-medium">Vollständig analysiert</span>
            </div>
          </CardContent>
        </Card>

        <Card className="deltaways-stats-card border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Data Sources
            </CardTitle>
            <Database className="h-6 w-6 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900 deltaways-brand-text">
              {stats.activeQuestions}
            </div>
            <p className="text-sm text-green-600 font-medium mt-2">
              Aktive Datenquellen global
            </p>
            <div className="flex items-center mt-3">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
              <span className="text-xs text-gray-500 font-medium">Live verbunden</span>
            </div>
          </CardContent>
        </Card>

        <Card className="deltaways-stats-card border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              AI Analysis
            </CardTitle>
            <Lightbulb className="h-6 w-6 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900 deltaways-brand-text">
              {stats.aiAnalysis}
            </div>
            <p className="text-sm text-orange-600 font-medium mt-2">
              KI-gestützte Analysen
            </p>
            <div className="flex items-center mt-3">
              <div className="h-2 w-2 rounded-full bg-orange-500 mr-2"></div>
              <span className="text-xs text-gray-500 font-medium">In Bearbeitung</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Section Layout exactly like screenshot */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Regulatory Updates Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Regulatory Updates
              </CardTitle>
              <CardDescription>
                Neueste regulatorische Änderungen von großen Behörden
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {regulatoryUpdates.map((update, index) => {
              const borderColor = index === 0 ? 'border-l-blue-500' : 
                                 index === 1 ? 'border-l-green-500' : 
                                 index === 2 ? 'border-l-purple-500' : 'border-l-orange-500';
              const badgeColor = index === 0 ? 'bg-blue-100 text-blue-700' : 
                                 index === 1 ? 'bg-green-100 text-green-700' : 
                                 index === 2 ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700';
              
              return (
                <div key={update.id} className={`border-l-4 ${borderColor} pl-4 py-2`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{update.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(update.date).toLocaleDateString('de-DE')} • {update.category}
                      </p>
                    </div>
                    <Badge className={`${badgeColor} text-xs`}>
                      {update.region}
                    </Badge>
                  </div>
                </div>
              );
            })}

            <div className="pt-2 border-t">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: '65%'}}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Synchronisierung 65%</p>
            </div>
          </CardContent>
        </Card>

        {/* Newsletter Sources Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Newsletter Sources
              </CardTitle>
              <CardDescription>
                Automatische MedTech-Newsletter für automatische Datenextraktion
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {newsletterSources.map((source) => (
              <div key={source.id} className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div className={`h-3 w-3 rounded-full ${source.isActive ? 'bg-green-500' : 'bg-gray-400'} mr-3`}></div>
                  <div>
                    <p className="font-medium text-sm">{source.name}</p>
                    <p className="text-xs text-gray-500">{source.count} Updates</p>
                  </div>
                </div>
                <Badge className={source.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                  {source.isActive ? 'Aktiv' : 'Inaktiv'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* KI-Powered Intelligence Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
              KI-Powered Intelligence
            </CardTitle>
            <CardDescription>
              Intelligente Suche und Analyse mit Perplexity AI
            </CardDescription>
          </div>
          <Badge className="bg-purple-100 text-purple-700">
            Powered by Perplexity
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <Search className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-sm font-medium">Intelligente Suche</p>
            </div>
            <div className="text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm font-medium">Trend-Analyse</p>
            </div>
            <div className="text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="text-sm font-medium">Content-Analyse</p>
            </div>
            <div className="text-center">
              <Lightbulb className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <p className="text-sm font-medium">Smart Insights</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Regulatory Intelligence Search
            </h3>
            <p className="text-sm text-gray-600 mb-3">Durchsuchen Sie die umfangreichste MedTech-Wissensdatenbank mit KI-Unterstützung</p>
            <div className="relative">
              <input 
                type="text" 
                placeholder="z.B. 'Neue FDA Cybersecurity-Richtlinien für Medizingeräte'"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700">
                Suchen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schnelle Aktionen */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-lg font-semibold flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Schnelle Aktionen
            </CardTitle>
            <CardDescription>
              Helix vereinfacht Ihre Funktionen für effiziente Aktionen
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
              <FileText className="h-6 w-6" />
              <span className="text-xs">Neuer Report</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
              <Search className="h-6 w-6" />
              <span className="text-xs">KI-Suche</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
              <Database className="h-6 w-6" />
              <span className="text-xs">Daten Export</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
              <AlertTriangle className="h-6 w-6" />
              <span className="text-xs">Alert Setup</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}