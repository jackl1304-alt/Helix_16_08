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

  // Loading state
  if (isLoading) {
    return <div className="p-6">Loading dashboard data...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ANALYTICS INTELLIGENCE HEADER EXAKT WIE SCREENSHOT */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-purple-500 p-3 rounded-lg">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Analytics Intelligence</h1>
                <div className="flex items-center gap-6 text-purple-100">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">Live Charts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    <span className="text-sm">Echtzeit-Metriken</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span className="text-sm">Globale Insights</span>
                  </div>
                </div>
                <p className="text-purple-100 mt-2">Umfassende Analyse der regulatorischen Datenlandschaft mit Executive-Insights</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold">90</div>
              <div className="text-purple-100 text-sm">Tage ...</div>
              <Button className="bg-white text-purple-700 hover:bg-purple-50 px-4 py-2 mt-2">
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* HAUPTSTATISTIKEN EXAKT WIE SCREENSHOT */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="bg-white shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">66</div>
                <div className="text-sm text-gray-600 mt-1">Gesamt Updates</div>
                <div className="text-xs text-gray-500 mt-1">+5.1% gegenüber letztem Monat</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">65</div>
                <div className="text-sm text-gray-600 mt-1">Rechtsfälle</div>
                <div className="text-xs text-gray-500 mt-1">+8.1% gegenüber letztem Monat</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">70</div>
                <div className="text-sm text-gray-600 mt-1">Aktive Datenquellen</div>
                <div className="text-xs text-gray-500 mt-1">Vollständig aktiv</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">242</div>
                <div className="text-sm text-gray-600 mt-1">Wissensartikel</div>
                <div className="text-xs text-gray-500 mt-1">Kontinuierlich wachsend</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CHARTS ROW */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* REGIONALE VERTEILUNG */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Regionale Verteilung</CardTitle>
              <CardDescription>Updates nach Regionen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Europa</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-blue-500 rounded"></div>
                    <span className="text-sm font-medium">24</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Nordamerika</span>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-2 bg-blue-400 rounded"></div>
                    <span className="text-sm font-medium">18</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Asien-Pazifik</span>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-2 bg-blue-300 rounded"></div>
                    <span className="text-sm font-medium">15</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Deutschland</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-2 bg-blue-200 rounded"></div>
                    <span className="text-sm font-medium">9</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KATEGORIE BREAKDOWN */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Kategorie Breakdown</CardTitle>
              <CardDescription>Verteilung nach Kategorien</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Regulatorische Updates: 66</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Rechtsfälle: 65</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">Knowledge Articles: 242</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 30-TAGE TREND */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">30-Tage Trend</CardTitle>
              <CardDescription>Updates und Änderungen über Zeit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-24 bg-gradient-to-r from-green-100 via-blue-100 to-green-100 rounded flex items-end justify-between px-2 py-2">
                <div className="w-2 bg-green-400 rounded-t" style={{height: '60%'}}></div>
                <div className="w-2 bg-blue-400 rounded-t" style={{height: '80%'}}></div>
                <div className="w-2 bg-green-400 rounded-t" style={{height: '70%'}}></div>
                <div className="w-2 bg-blue-400 rounded-t" style={{height: '90%'}}></div>
                <div className="w-2 bg-green-400 rounded-t" style={{height: '85%'}}></div>
                <div className="w-2 bg-blue-400 rounded-t" style={{height: '75%'}}></div>
                <div className="w-2 bg-green-400 rounded-t" style={{height: '95%'}}></div>
                <div className="w-2 bg-blue-400 rounded-t" style={{height: '80%'}}></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}