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

  // Mock fallback data
  const mockInsights: AIInsight[] = [
    {
      id: "ai_insight_1",
      title: "Erhöhte FDA-Aktivität bei Herzschrittmachern",
      content: "KI-Analyse zeigt eine 47% Zunahme der FDA-Aktivitäten im Bereich Herzschrittmacher in den letzten 30 Tagen. Dies deutet auf mögliche neue Regulierungen hin.",
      category: "Regulatory Trends",
      confidence: 92,
      priority: "high",
      createdAt: "2025-08-10T10:30:00Z",
      tags: ["FDA", "Herzschrittmacher", "Regulatory"],
      summary: "Wichtige regulatorische Entwicklungen bei Herzschrittmachern erkannt"
    },
    {
      id: "ai_insight_2", 
      title: "Neue Compliance-Anforderungen in EU",
      content: "Prädiktive Analyse identifiziert wahrscheinliche neue MDR-Anforderungen für Klasse III Geräte basierend auf aktuellen Rechtsprechungsmustern.",
      category: "Compliance Prediction",
      confidence: 78,
      priority: "medium",
      createdAt: "2025-08-10T09:15:00Z",
      tags: ["EU", "MDR", "Klasse III"],
      summary: "Vorhersage neuer EU-Compliance-Anforderungen"
    },
    {
      id: "ai_insight_3",
      title: "Marktchancen in Südostasien",
      content: "ML-Analyse der Zulassungsdaten zeigt optimale Markteintrittschancen für innovative Diagnostikgeräte in Vietnam und Thailand.",
      category: "Market Intelligence",
      confidence: 85,
      priority: "medium",
      createdAt: "2025-08-10T08:45:00Z",
      tags: ["Südostasien", "Diagnostik", "Marktchancen"],
      summary: "Neue Marktchancen in Südostasien identifiziert"
    }
  ];

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
            <Button className={colors.primary}>
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
          {!isInsightsLoading && !insightsError && displayInsights && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {displayInsights.map((insight) => (
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
                  
                  <CardTitle className={`${colors.textPrimary} line-clamp-2`}>
                    {insight.title}
                  </CardTitle>
                  <CardDescription className={colors.textSecondary}>
                    {insight.summary}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className={`text-sm ${colors.textSecondary} line-clamp-3`}>
                    {insight.content}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {insight.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
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
            <Card className={colors.cardBg}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-lg ${colors.textPrimary} flex items-center gap-2`}>
                  <TrendingUp className={`h-5 w-5 ${colors.accent}`} />
                  Trends erkannt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">12</div>
                <p className={`text-sm ${colors.textSecondary}`}>Neue Trends in den letzten 7 Tagen</p>
              </CardContent>
            </Card>

            <Card className={colors.cardBg}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-lg ${colors.textPrimary} flex items-center gap-2`}>
                  <Target className={`h-5 w-5 ${colors.accent}`} />
                  Vorhersagen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">8</div>
                <p className={`text-sm ${colors.textSecondary}`}>Aktuelle Marktprognosen</p>
              </CardContent>
            </Card>

            <Card className={colors.cardBg}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-lg ${colors.textPrimary} flex items-center gap-2`}>
                  <AlertTriangle className={`h-5 w-5 ${colors.accent}`} />
                  Warnungen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">3</div>
                <p className={`text-sm ${colors.textSecondary}`}>Kritische Compliance-Risiken</p>
              </CardContent>
            </Card>
          </div>

          {/* Action Items */}
          <Card className={colors.cardBg}>
            <CardHeader>
              <CardTitle className={`${colors.textPrimary} flex items-center gap-2`}>
                <CheckCircle className={`h-5 w-5 ${colors.accent}`} />
                Empfohlene Maßnahmen
              </CardTitle>
              <CardDescription className={colors.textSecondary}>
                Basierend auf KI-Analyse generierte Handlungsempfehlungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className={`p-4 border-l-4 border-orange-400 ${colors.cardBg} rounded-r-lg`}>
                  <h4 className={`font-semibold ${colors.textPrimary}`}>FDA-Entwicklungen überwachen</h4>
                  <p className={`text-sm ${colors.textSecondary} mt-1`}>
                    Erhöhte Aufmerksamkeit für Herzschrittmacher-Regulierungen empfohlen
                  </p>
                </div>
                <div className={`p-4 border-l-4 border-blue-400 ${colors.cardBg} rounded-r-lg`}>
                  <h4 className={`font-semibold ${colors.textPrimary}`}>EU-Compliance vorbereiten</h4>
                  <p className={`text-sm ${colors.textSecondary} mt-1`}>
                    Proaktive Anpassung an wahrscheinliche MDR-Änderungen
                  </p>
                </div>
                <div className={`p-4 border-l-4 border-green-400 ${colors.cardBg} rounded-r-lg`}>
                  <h4 className={`font-semibold ${colors.textPrimary}`}>Marktexpansion prüfen</h4>
                  <p className={`text-sm ${colors.textSecondary} mt-1`}>
                    Südostasien-Strategie für Diagnostikgeräte entwickeln
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}