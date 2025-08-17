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
  Mail
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* DELTAWAYS Dashboard Header - Exact Screenshot Recreation */}
      <div className="deltaways-dashboard-card bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-3 flex items-center gap-3 deltaways-brand-text">
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
            <div className="text-6xl font-bold mb-2 deltaways-brand-text">66</div>
            <div className="text-blue-100 text-lg font-medium">Updates</div>
            <div className="text-4xl font-bold mt-4 deltaways-brand-text">100%</div>
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
            <div className="text-4xl font-bold text-gray-900 deltaways-brand-text">66</div>
            <p className="text-sm text-green-600 font-medium mt-2">
              Aktuelle regulatorische Änderungen
            </p>
            <div className="flex items-center mt-3">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
              <span className="text-xs text-gray-500 font-medium">100% Qualität</span>
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
            <div className="text-4xl font-bold text-gray-900 deltaways-brand-text">65</div>
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
            <div className="text-4xl font-bold text-gray-900 deltaways-brand-text">70</div>
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
            <div className="text-4xl font-bold text-gray-900 deltaways-brand-text">24</div>
            <p className="text-sm text-orange-600 font-medium mt-2">
              KI-gestützte Analysen
            </p>
            <div className="flex items-center mt-3">
              <div className="h-2 w-2 rounded-full bg-orange-500 mr-2"></div>
              <span className="text-xs text-gray-500 font-medium">In Bearbeitung</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Newsletter
            </CardTitle>
            <Mail className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">7</div>
            <p className="text-xs text-red-600 font-medium mt-1">
              Newsletter-Abonnements
            </p>
            <div className="flex items-center mt-2">
              <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
              <span className="text-xs text-gray-500">Aktiv</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-pink-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              AI Analysis
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">24</div>
            <p className="text-xs text-pink-600 font-medium mt-1">
              KI-basierte Analysen
            </p>
            <div className="flex items-center mt-2">
              <div className="h-2 w-2 rounded-full bg-pink-500 mr-2"></div>
              <span className="text-xs text-gray-500">Powered by Perplexity</span>
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
            <div className="border-l-4 border-l-blue-500 pl-4 py-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">FDA 510(k): Iconic Speed Anchor, Iconic Speed HA+ Anchor (K252344)</p>
                  <p className="text-xs text-gray-500">Oct 23th • Regulatory Update</p>
                </div>
                <Badge className="bg-blue-100 text-blue-700 text-xs">30.7.2025</Badge>
              </div>
            </div>

            <div className="border-l-4 border-l-green-500 pl-4 py-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">FDA 510(k): IntiMAX System (K252751)</p>
                  <p className="text-xs text-gray-500">Oct 23th • Regulatory Update</p>
                </div>
                <Badge className="bg-green-100 text-green-700 text-xs">25.7.2025</Badge>
              </div>
            </div>

            <div className="border-l-4 border-l-purple-500 pl-4 py-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">FDA 510(k): MF QC GENZ Facial Toning System (K252319)</p>
                  <p className="text-xs text-gray-500">Oct 23th • Regulatory Update</p>
                </div>
                <Badge className="bg-purple-100 text-purple-700 text-xs">18.7.2025</Badge>
              </div>
            </div>

            <div className="border-l-4 border-l-orange-500 pl-4 py-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">FDA 510(k): Iconic Speed Anchor, Iconic Speed HA+ Anchor</p>
                  <p className="text-xs text-gray-500">Jul 30th • Quality System</p>
                </div>
                <Badge className="bg-orange-100 text-orange-700 text-xs">30.7.2025</Badge>
              </div>
            </div>

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
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-3"></div>
                <div>
                  <p className="font-medium text-sm">FDA News & Updates</p>
                  <p className="text-xs text-gray-500">Offizielle FDA Updates</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700">Aktiv</Badge>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-3"></div>
                <div>
                  <p className="font-medium text-sm">EMA Newsletter</p>
                  <p className="text-xs text-gray-500">Europäische Arzneimittel-Agentur</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700">Aktiv</Badge>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-3"></div>
                <div>
                  <p className="font-medium text-sm">MedTech Dive</p>
                  <p className="text-xs text-gray-500">Medizintechnik-Industrie News</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700">Aktiv</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KI-Powered Intelligence Section exactly like screenshot */}
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

      {/* Schnelle Aktionen exactly like screenshot */}
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
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Database className="h-6 w-6 text-orange-600" />
              </div>
              <p className="text-sm font-medium">Datenquellen Sync</p>
              <p className="text-xs text-gray-500">FDA, EMA, WHO</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-sm font-medium">Newsletter Sync</p>
              <p className="text-xs text-gray-500">MedTech Sources</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Lightbulb className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-sm font-medium">Knowledge Base</p>
              <p className="text-xs text-gray-500">Artikel strukturieren</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Mail className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-sm font-medium">Newsletter</p>
              <p className="text-xs text-gray-500">Neue Ausgabe erstellen</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <BarChart3 className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-sm font-medium">Analytics</p>
              <p className="text-xs text-gray-500">Erweiterte Trends</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <MessageSquare className="h-8 w-8 text-gray-600" />
              </div>
              <p className="text-sm font-medium">Support Chat</p>
              <p className="text-xs text-gray-500">Direkte Administrator-Sprechzeiten</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}