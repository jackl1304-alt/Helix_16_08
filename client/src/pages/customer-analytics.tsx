import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from 'wouter';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CustomerNavigation, { type CustomerPermissions } from '@/components/customer/customer-navigation';
import { useLiveTenantPermissions } from '@/hooks/use-live-tenant-permissions';
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from '@/components/LanguageSelector';
import { 
  TrendingUp, 
  Globe, 
  Calendar, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Filter,
  Download,
  BarChart3
} from "lucide-react";

// Mock tenant ID
const mockTenantId = "030d3e01-32c4-4f95-8d54-98be948e8d4b";

interface AnalyticsData {
  regionDistribution: Array<{ region: string; count: number; percentage: number }>;
  categoryBreakdown: Array<{ category: string; count: number; color: string }>;
  timelineData: Array<{ date: string; updates: number; approvals: number }>;
  priorityStats: Array<{ priority: string; count: number; color: string }>;
  sourcePerformance: Array<{ source: string; updates: number; lastSync: string; status: string }>;
  languageDistribution: Array<{ language: string; count: number }>;
  monthlyTrends: Array<{ month: string; total: number; regulations: number; standards: number; rulings: number }>;
}

const COLORS = {
  primary: "#3b82f6",
  secondary: "#10b981", 
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#6366f1",
  success: "#22c55e"
};

export default function CustomerAnalytics() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedRegion, setSelectedRegion] = useState('all');
  
  const params = useParams();
  const tenantId = params.tenantId || mockTenantId;
  const { t } = useLanguage();

  // Use live tenant permissions hook for real-time updates
  const { 
    permissions: livePermissions, 
    tenantName: liveTenantName, 
    isLoading: isTenantLoading 
  } = useLiveTenantPermissions({ 
    tenantId,
    pollInterval: 3000
  });

  // Use live permissions with fallback
  const permissions = livePermissions || {
    dashboard: true,
    regulatoryUpdates: true,
    legalCases: true,
    knowledgeBase: true,
    newsletters: false,
    analytics: true,
    reports: false,
    dataCollection: false,
    globalSources: false,
    historicalData: false,
    administration: false,
    userManagement: false,
    systemSettings: false,
    auditLogs: false,
    aiInsights: false,
    advancedAnalytics: false
  };

  // Fetch analytics data - only if user has permission
  const { data: analyticsData, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics', tenantId, selectedTimeRange, selectedRegion],
    queryFn: async () => {
      const params = new URLSearchParams({
        timeRange: selectedTimeRange,
        region: selectedRegion
      });
      const response = await fetch(`/api/analytics?${params}`);
      if (!response.ok) throw new Error('Failed to fetch analytics data');
      return await response.json();
    },
    enabled: Boolean(permissions?.analytics)
  });

  if (isTenantLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex items-center justify-center w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Check permission
  if (!permissions?.analytics) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Language Selector - Top Right */}
        <div className="fixed top-4 right-4 z-50">
          <LanguageSelector />
        </div>
        
        <CustomerNavigation 
          permissions={permissions} 
          tenantName={liveTenantName || "Customer Portal"} 
        />
        
        <main className="ml-64 flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t('access.restricted')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Sie haben keine Berechtigung für den Zugriff auf Analytics. 
                Kontaktieren Sie Ihren Administrator für weitere Informationen.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Language Selector - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSelector />
      </div>
      
      <CustomerNavigation 
        permissions={permissions} 
        tenantName={liveTenantName || "Customer Portal"} 
      />
      
      <main className="ml-64 flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t('analytics.title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Datenanalyse und Berichte über regulatorische Entwicklungen
              </p>
            </div>
            <div className="flex gap-3">
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 Tage</SelectItem>
                  <SelectItem value="30d">30 Tage</SelectItem>
                  <SelectItem value="90d">90 Tage</SelectItem>
                  <SelectItem value="12m">12 Monate</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Regionen</SelectItem>
                  <SelectItem value="eu">Europa</SelectItem>
                  <SelectItem value="usa">USA</SelectItem>
                  <SelectItem value="asia">Asien</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : analyticsData ? (
            <div className="space-y-6">
              {/* Region Distribution */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Regionale Verteilung
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={analyticsData.regionDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="count"
                        >
                          {analyticsData.regionDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Kategorie-Aufschlüsselung
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={analyticsData.categoryBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill={COLORS.primary} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Prioritätsverteilung
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analyticsData.priorityStats.map((stat) => (
                        <div key={stat.priority} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: stat.color }}
                            ></div>
                            <span className="text-sm capitalize">{stat.priority}</span>
                          </div>
                          <Badge variant="outline">{stat.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Timeline Data */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Zeitlicher Verlauf
                  </CardTitle>
                  <CardDescription>
                    Updates und Zulassungen über Zeit
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData.timelineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="updates" stroke={COLORS.primary} strokeWidth={2} />
                      <Line type="monotone" dataKey="approvals" stroke={COLORS.secondary} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Monthly Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Monatliche Trends
                  </CardTitle>
                  <CardDescription>
                    Aufschlüsselung nach Dokumenttypen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analyticsData.monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="regulations" stackId="1" stroke={COLORS.primary} fill={COLORS.primary} />
                      <Area type="monotone" dataKey="standards" stackId="1" stroke={COLORS.secondary} fill={COLORS.secondary} />
                      <Area type="monotone" dataKey="rulings" stackId="1" stroke={COLORS.warning} fill={COLORS.warning} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Source Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Quellenleistung
                  </CardTitle>
                  <CardDescription>
                    Übersicht über Datenquellen und deren Status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.sourcePerformance.map((source) => (
                      <div key={source.source} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">{source.source}</h4>
                          <p className="text-sm text-gray-500">
                            Letzter Sync: {new Date(source.lastSync).toLocaleDateString('de-DE')}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{source.updates}</div>
                          <Badge variant={source.status === 'active' ? 'default' : 'secondary'}>
                            {source.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Keine Analytics-Daten verfügbar
                </h3>
                <p className="text-gray-500">
                  Derzeit sind keine Analysedaten verfügbar.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}