import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ColoredHashtagBadge } from "@/components/colored-hashtag-badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle,
  FileText,
  Search,
  Filter,
  Download,
  RefreshCw,
  MessageSquare,
  Lightbulb,
  BarChart3,
  Target,
  Clock,
  CheckCircle,
  Eye,
  ExternalLink
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface AIInsight {
  id: string;
  title: string;
  description: string;
  category: 'trend_analysis' | 'risk_assessment' | 'compliance_gap' | 'market_intelligence' | 'prediction';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  timeframe: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
  sources: string[];
  recommendations: string[];
  createdAt: string;
  relevantRegions: string[];
  affectedDeviceClasses: string[];
  tags: string[];
}

interface AIAnalysis {
  id: string;
  query: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: string;
  insights?: string[];
  createdAt: string;
  processingTime?: number;
}

const mockInsights: AIInsight[] = [
  {
    id: "1",
    title: "Emerging AI/ML Device Regulation Trend in EU",
    description: "KI-basierte Medizinprodukte zeigen verstärkte Regulierungsaktivitäten in der EU mit neuen Anforderungen für Algorithmus-Transparenz und Post-Market-Überwachung.",
    category: "trend_analysis",
    severity: "high",
    confidence: 89,
    impact: "high",
    timeframe: "medium_term",
    sources: ["EMA Guidelines", "MDR Updates", "MDCG Documents"],
    recommendations: [
      "Implementierung von AI-Transparenz-Dokumentation",
      "Verstärkung der Post-Market-Surveillance für KI-Komponenten",
      "Vorbereitung auf erweiterte Risikomanagement-Anforderungen"
    ],
    createdAt: "2025-01-27T10:00:00Z",
    relevantRegions: ["EU", "DE"],
    affectedDeviceClasses: ["Class IIa", "Class IIb", "Class III"],
    tags: ["AI", "ML", "Algorithmus", "Transparenz"]
  },
  {
    id: "2",
    title: "Cybersecurity Requirements Gap Analysis",
    description: "Analyse zeigt signifikante Lücken in Cybersecurity-Compliance zwischen FDA und EU MDR Anforderungen, besonders bei vernetzten Geräten.",
    category: "compliance_gap",
    severity: "critical",
    confidence: 94,
    impact: "high",
    timeframe: "immediate",
    sources: ["FDA Cybersecurity Guidance", "EU MDR Annex I", "IEC 62304"],
    recommendations: [
      "Harmonisierung der Cybersecurity-Dokumentation",
      "Implementierung einheitlicher Vulnerability-Management-Prozesse",
      "Erstellung regionsspezifischer Compliance-Checklisten"
    ],
    createdAt: "2025-01-27T08:30:00Z",
    relevantRegions: ["US", "EU"],
    affectedDeviceClasses: ["Class II", "Class III"],
    tags: ["Cybersecurity", "Compliance", "Vernetzte Geräte"]
  },
  {
    id: "3",
    title: "Digital Health Apps Market Acceleration",
    description: "Beschleunigte Markteinführung digitaler Gesundheitsanwendungen in Deutschland mit vereinfachten DiGA-Bewertungsverfahren prognostiziert.",
    category: "market_intelligence",
    severity: "medium",
    confidence: 76,
    impact: "medium",
    timeframe: "short_term",
    sources: ["BfArM DiGA Reports", "German Health Ministry Updates"],
    recommendations: [
      "Frühzeitige DiGA-Antragsstellung für qualifizierte Apps",
      "Vorbereitung auf beschleunigte Bewertungsverfahren",
      "Aufbau strategischer Partnerschaften mit Krankenkassen"
    ],
    createdAt: "2025-01-26T16:45:00Z",
    relevantRegions: ["DE"],
    affectedDeviceClasses: ["DiGA"],
    tags: ["Digital Health", "Apps", "DiGA", "Deutschland"]
  }
];

const categoryLabels = {
  trend_analysis: "Trend-Analyse",
  risk_assessment: "Risikobewertung", 
  compliance_gap: "Compliance-Lücke",
  market_intelligence: "Marktintelligenz",
  prediction: "Vorhersage"
};

const severityColors = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-blue-100 text-blue-800 border-blue-200"
};

const impactColors = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800"
};

const timeframeLabels = {
  immediate: "Sofort",
  short_term: "Kurzfristig",
  medium_term: "Mittelfristig", 
  long_term: "Langfristig"
};

export default function AIInsights() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [newAnalysisQuery, setNewAnalysisQuery] = useState("");

  const { data: rawInsights = [], isLoading: insightsLoading } = useQuery<any[]>({
    queryKey: ["/api/ai-insights"],
    enabled: true // Enable real API calls
  });

  // Transform database insights to AIInsight format
  const insights: AIInsight[] = rawInsights.map((article: any) => ({
    id: article.id,
    title: article.title,
    description: article.content?.substring(0, 200) + '...' || 'Zühlke MedTech Case Study',
    category: 'trend_analysis',
    severity: 'medium',
    confidence: 85,
    impact: 'high',
    timeframe: 'medium_term',
    sources: Array.isArray(article.tags) ? article.tags : [],
    recommendations: [],
    createdAt: article.created_at,
    relevantRegions: ['EU', 'US', 'APAC'],
    affectedDeviceClasses: ['Class II', 'Class III'],
    tags: Array.isArray(article.tags) ? article.tags : []
  }));

  const createAnalysisMutation = useMutation({
    mutationFn: async (query: string) => {
      try {
        const response = await fetch("/api/ai-analyses", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        console.error("AI analysis error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-analyses"] });
      setNewAnalysisQuery("");
      toast({
        title: "Analyse gestartet",
        description: "Die KI-Analyse wurde erfolgreich gestartet und wird in Kürze abgeschlossen."
      });
    }
  });

  const filteredInsights = insights.filter(insight => {
    const matchesSearch = searchQuery === "" ||
      insight.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      insight.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      insight.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "all" || insight.category === selectedCategory;
    const matchesSeverity = selectedSeverity === "all" || insight.severity === selectedSeverity;

    return matchesSearch && matchesCategory && matchesSeverity;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600";
    if (confidence >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const handleNewAnalysis = () => {
    if (newAnalysisQuery.trim()) {
      createAnalysisMutation.mutate(newAnalysisQuery.trim());
    }
  };

  return (
    <div className="container mx-auto py-4 px-4 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center">
            <Brain className="mr-2 sm:mr-3 h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            KI-Insights
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            KI-gestützte Analyse und Vorhersagen für regulatorische Trends
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
          <Button 
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => {
              toast({
                title: "Aktualisierung",
                description: "KI-Insights werden aktualisiert..."
              });
              queryClient.invalidateQueries({ queryKey: ["/api/ai-insights"] });
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            <span className="sm:inline">Aktualisieren</span>
          </Button>
          <Button 
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => {
              toast({
                title: "Export",
                description: "Report wird vorbereitet..."
              });
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            <span className="sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Quick Overview Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium line-clamp-2">Aktive Analysen</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">
              {insights.filter(i => i.category === 'trend_analysis').length}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              Laufende Trend-Analysen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium line-clamp-2">Kritische Risiken</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-xl sm:text-2xl font-bold text-red-600">
              {insights.filter(i => i.severity === 'critical').length}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              Sofortige Aufmerksamkeit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium line-clamp-2">Markt-Intelligence</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {insights.filter(i => i.category === 'market_intelligence').length}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              Marktchancen identifiziert
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Durchschnittl. Konfidenz</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(insights.reduce((acc, i) => acc + i.confidence, 0) / insights.length)}%
            </div>
            <p className="text-xs text-muted-foreground">
              KI-Vertrauen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6 sm:mb-8">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-base sm:text-lg">
            <Filter className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Filter & Suche
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="w-full">
            <Input
              placeholder="Nach Insights suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Kategorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kategorien</SelectItem>
                <SelectItem value="trend_analysis">Trend-Analyse</SelectItem>
                <SelectItem value="risk_assessment">Risikobewertung</SelectItem>
                <SelectItem value="compliance_gap">Compliance-Lücke</SelectItem>
                <SelectItem value="market_intelligence">Marktintelligenz</SelectItem>
                <SelectItem value="prediction">Vorhersage</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Priorität" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle</SelectItem>
                <SelectItem value="critical">Kritisch</SelectItem>
                <SelectItem value="high">Hoch</SelectItem>
                <SelectItem value="medium">Mittel</SelectItem>
                <SelectItem value="low">Niedrig</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredInsights.map((insight) => (
          <Card key={insight.id} className="h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex-1">{insight.title}</span>
                <Badge className={severityColors[insight.severity]}>
                  {insight.severity}
                </Badge>
              </CardTitle>
              <CardDescription>
                <Badge variant="outline" className="mr-2">
                  {categoryLabels[insight.category]}
                </Badge>
                <Badge variant="outline" className={impactColors[insight.impact]}>
                  Impact: {insight.impact}
                </Badge>
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {insight.description}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Konfidenz:</span>
                <div className="flex items-center space-x-2">
                  <Progress value={insight.confidence} className="w-16" />
                  <span className={`text-sm font-bold ${getConfidenceColor(insight.confidence)}`}>
                    {insight.confidence}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Zeitrahmen:</span>
                <Badge variant="outline">
                  {timeframeLabels[insight.timeframe]}
                </Badge>
              </div>

              <div>
                <span className="text-sm font-medium">Regionen:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {insight.relevantRegions.map((region) => (
                    <Badge key={region} variant="secondary" className="text-xs">
                      {region}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Farbkodierte Hashtags */}
              <div>
                <span className="text-sm font-medium">Tags:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {insight.tags.map((tag, index) => (
                    <ColoredHashtagBadge key={index} tag={tag} />
                  ))}
                </div>
              </div>

              <div>
                <span className="text-sm font-medium">Empfehlungen:</span>
                <ul className="list-disc list-inside text-xs text-muted-foreground mt-1 space-y-1">
                  {insight.recommendations.slice(0, 2).map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                  {insight.recommendations.length > 2 && (
                    <li className="font-medium">
                      +{insight.recommendations.length - 2} weitere...
                    </li>
                  )}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 border-t gap-3">
                <span className="text-xs text-muted-foreground">
                  {formatDate(insight.createdAt)}
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 sm:flex-none">
                    <Eye className="mr-1 h-3 w-3" />
                    <span className="sm:inline">Details</span>
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 sm:flex-none">
                    <ExternalLink className="mr-1 h-3 w-3" />
                    <span className="sm:inline">Export</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInsights.length === 0 && (
        <div className="text-center py-12">
          <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Keine Insights gefunden</h3>
          <p className="text-muted-foreground">
            Versuchen Sie, Ihre Suchkriterien zu ändern oder warten Sie auf neue Analysen.
          </p>
        </div>
      )}

      {/* New Analysis Input */}
      <Card className="mt-6 sm:mt-8">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-base sm:text-lg">
            <MessageSquare className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Neue KI-Analyse anfordern
          </CardTitle>
          <CardDescription className="text-sm">
            Stellen Sie eine spezifische Frage zur regulatorischen Landschaft
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="z.B. 'Vergleiche FDA und EMA Anforderungen für AI/ML Medizinprodukte'"
            value={newAnalysisQuery}
            onChange={(e) => setNewAnalysisQuery(e.target.value)}
            className="w-full resize-none"
            rows={3}
          />
          <Button 
            onClick={handleNewAnalysis} 
            disabled={createAnalysisMutation.isPending || !newAnalysisQuery.trim()}
            className="w-full sm:w-auto"
          >
            {createAnalysisMutation.isPending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Analyse läuft...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyse starten
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}