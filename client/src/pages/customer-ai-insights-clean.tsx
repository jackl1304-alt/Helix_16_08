import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CustomerNavigation from "@/components/customer/customer-navigation";
import { useCustomerTheme } from "@/contexts/customer-theme-context";
import { 
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  BarChart3,
  Target,
  RefreshCw
} from "lucide-react";

// Mock tenant ID 
const mockTenantId = "030d3e01-32c4-4f95-8d54-98be948e8d4b";

interface AIInsight {
  id: string;
  title: string;
  content: string;
  category: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  tags: string[];
  summary: string;
}

export default function CustomerAIInsights() {
  const { themeSettings, getThemeColors } = useCustomerTheme();
  const colors = getThemeColors();
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    return () => {
      setMounted(false);
    };
  }, []);

  // Fetch tenant permissions
  const { data: tenantData, isLoading: isTenantLoading } = useQuery({
    queryKey: ['/api/customer/tenant', mockTenantId],
    queryFn: async () => {
      const response = await fetch(`/api/customer/tenant/${mockTenantId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tenant data');
      }
      return await response.json();
    },
    enabled: mounted,
    retry: 1
  });

  // Fetch AI insights from API
  const { data: insights, isLoading: isInsightsLoading, error: insightsError } = useQuery({
    queryKey: ['/api/customer/ai-analysis'],
    queryFn: async () => {
      const response = await fetch('/api/customer/ai-analysis');
      if (!response.ok) {
        throw new Error('Failed to fetch AI insights');
      }
      return await response.json();
    },
    enabled: mounted && tenantData?.customerPermissions?.aiInsights,
    retry: 1
  });

  // Extract permissions from tenant data
  const permissions = tenantData?.customerPermissions || {
    dashboard: true,
    aiInsights: true,
    regulatoryUpdates: false,
    legalCases: false,
    knowledgeBase: false,
    newsletters: false,
    analytics: false,
    reports: false,
    dataCollection: false,
    globalSources: false,
    historicalData: false,
    administration: false,
    userManagement: false,
    systemSettings: false,
    auditLogs: false,
    advancedAnalytics: false
  };

  if (isTenantLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse space-y-4 p-6 flex-1 ml-64">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Use insights data from API - guaranteed to be an array
  const displayInsights: AIInsight[] = insights || [];

  return (
    <div className={`flex min-h-screen ${colors.background}`}>
      {/* Navigation Sidebar */}
      <CustomerNavigation 
        permissions={permissions}
        tenantName={tenantData?.name}
      />
      
      {/* Main Content */}
      <div className="flex-1 ml-64">
        <div className="container mx-auto p-6 space-y-8 max-w-6xl">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className={`text-4xl font-bold ${colors.textPrimary} mb-2`}>
                KI-Insights
              </h1>
              <p className={`text-lg ${colors.textSecondary}`}>
                Intelligente Analysen und Vorhersagen für Ihr Unternehmen
              </p>
            </div>
            <Button className={`bg-gradient-to-r ${colors.primary} text-white hover:opacity-90`}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Insights aktualisieren
            </Button>
          </div>

          {/* Loading State */}
          {(isTenantLoading || isInsightsLoading) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className={`${colors.cardBg} animate-pulse`}>
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Error State */}
          {insightsError && (
            <Card className={`${colors.cardBg} border-red-200`}>
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Fehler beim Laden der KI-Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Die KI-Insights konnten nicht geladen werden. Bitte versuchen Sie es später erneut.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Insights Grid */}
          {!isInsightsLoading && !insightsError && displayInsights && displayInsights.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {displayInsights.map((insight: AIInsight) => (
                <Card key={insight.id} className={`${colors.cardBg} hover:shadow-lg transition-shadow`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Brain className={`h-5 w-5 ${colors.accent}`} />
                        <Badge variant={insight.priority === 'high' ? 'destructive' : insight.priority === 'medium' ? 'default' : 'secondary'}>
                          {insight.priority === 'high' ? 'Hoch' : insight.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">{insight.confidence}%</span>
                      </div>
                    </div>
                    <CardTitle className={`text-lg ${colors.textPrimary} mt-2`}>
                      {insight.title}
                    </CardTitle>
                    <CardDescription className={`${colors.textSecondary}`}>
                      {insight.summary}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className={`text-sm ${colors.textSecondary} mb-4 line-clamp-3`}>
                      {insight.content}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {insight.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {new Date(insight.createdAt).toLocaleDateString('de-DE')}
                      </div>
                      <Button variant="outline" size="sm">
                        Details anzeigen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* No Data State */}
          {!isInsightsLoading && !insightsError && (!displayInsights || displayInsights.length === 0) && (
            <Card className={`${colors.cardBg}`}>
              <CardHeader>
                <CardTitle className={`${colors.textPrimary} flex items-center gap-2`}>
                  <Brain className="h-5 w-5" />
                  Keine KI-Insights verfügbar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`${colors.textSecondary}`}>
                  Derzeit sind keine KI-Insights verfügbar. Das System analysiert kontinuierlich neue Daten.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className={`${colors.cardBg}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${colors.textSecondary}`}>
                  Insights gesamt
                </CardTitle>
                <BarChart3 className={`h-4 w-4 ${colors.accent}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${colors.textPrimary}`}>
                  {displayInsights.length}
                </div>
                <p className={`text-xs ${colors.textSecondary}`}>
                  Verfügbare KI-Analysen
                </p>
              </CardContent>
            </Card>

            <Card className={`${colors.cardBg}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${colors.textSecondary}`}>
                  Hohe Priorität
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${colors.textPrimary}`}>
                  {displayInsights.filter(insight => insight.priority === 'high').length}
                </div>
                <p className={`text-xs ${colors.textSecondary}`}>
                  Wichtige Erkenntnisse
                </p>
              </CardContent>
            </Card>

            <Card className={`${colors.cardBg}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${colors.textSecondary}`}>
                  Durchschnittliche Genauigkeit
                </CardTitle>
                <Target className={`h-4 w-4 ${colors.accent}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${colors.textPrimary}`}>
                  {displayInsights.length > 0 
                    ? Math.round(displayInsights.reduce((sum, insight) => sum + insight.confidence, 0) / displayInsights.length)
                    : 0}%
                </div>
                <p className={`text-xs ${colors.textSecondary}`}>
                  KI-Vertrauenswert
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}