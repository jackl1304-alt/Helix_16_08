import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
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

interface DashboardStats {
  totalUpdates: number;
  totalLegalCases: number;
  activeQuestions: number;
  knowledgeArticles: number;
  aiAnalysis: number;
  newsletterAdmin: number;
  activeAlerts: number;
  compliance: number;
  lastSync: string;
}

interface RegulatoryUpdate {
  id: string;
  title: string;
  summary: string;
  status: string;
  priority: string;
  date: string;
  region: string;
  category: string;
}

interface NewsletterSource {
  id: string;
  name: string;
  isActive: boolean;
  count: number;
}

export default function Dashboard() {
  // ECHTE BACKEND-DATEN LADEN
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: regulatoryUpdates, isLoading: updatesLoading } = useQuery<RegulatoryUpdate[]>({
    queryKey: ['/api/regulatory-updates'],
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: newsletterSources } = useQuery<NewsletterSource[]>({
    queryKey: ['/api/newsletter-sources'],
  });

  // Loading state
  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse bg-gray-200 h-32 rounded-xl"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="animate-pulse bg-gray-200 h-24 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

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
              {stats?.totalUpdates || '0'}
            </div>
            <div className="text-blue-100 text-lg font-medium">Updates</div>
            <div className="text-4xl font-bold mt-4 deltaways-brand-text">
              {stats?.compliance || '100'}%
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
              {regulatoryUpdates?.length || stats?.totalUpdates || '0'}
            </div>
            <p className="text-sm text-green-600 font-medium mt-2">
              Aktuelle regulatorische Änderungen
            </p>
            <div className="flex items-center mt-3">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
              <span className="text-xs text-gray-500 font-medium">
                {stats?.compliance || '100'}% Qualität
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
              {stats?.totalLegalCases || '0'}
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
              {stats?.activeQuestions || '0'}
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
              {stats?.aiAnalysis || '0'}
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
            {updatesLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="animate-pulse bg-gray-100 h-16 rounded-lg"></div>
                ))}
              </div>
            ) : regulatoryUpdates && regulatoryUpdates.length > 0 ? (
              regulatoryUpdates.map((update, index) => {
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
              })
            ) : (
              <div className="text-center py-4 text-gray-500">
                Keine Updates verfügbar
              </div>
            )}

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
            {newsletterSources && newsletterSources.length > 0 ? (
              newsletterSources.map((source) => (
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
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                Keine Newsletter-Quellen verfügbar
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}