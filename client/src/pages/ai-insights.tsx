import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { apiRequest, queryClient } from "@/lib/queryClient";
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

const mockAnalyses: AIAnalysis[] = [
  {
    id: "1",
    query: "Vergleiche FDA und EMA Anforderungen für AI/ML Medizinprodukte",
    status: "completed",
    result: "Detaillierte Analyse zeigt unterschiedliche Schwerpunkte: FDA fokussiert auf algorithmische Bias-Reduzierung, während EMA verstärkt auf Datenqualität und -transparenz setzt.",
    insights: [
      "FDA verlangt spezifische Bias-Mitigation-Strategien",
      "EMA fordert detaillierte Datensatz-Dokumentation",
      "Beide Behörden erwarten kontinuierliche Post-Market-Überwachung"
    ],
    createdAt: "2025-01-27T09:15:00Z",
    processingTime: 45
  },
  {
    id: "2",
    query: "Analyse der Cybersecurity-Trends in der MedTech-Branche 2024-2025",
    status: "processing",
    createdAt: "2025-01-27T11:00:00Z"
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

  const { data: insights = mockInsights, isLoading: insightsLoading } = useQuery<AIInsight[]>({
    queryKey: ["/api/ai-insights"],
    enabled: false // Use mock data
  });

  const { data: analyses = mockAnalyses, isLoading: analysesLoading } = useQuery<AIAnalysis[]>({
    queryKey: ["/api/ai-analyses"],
    enabled: false // Use mock data
  });

  const createAnalysisMutation = useMutation({
    mutationFn: async (query: string) => {
      return await apiRequest("/api/ai-analyses", "POST", { query });
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
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Brain className="mr-3 h-8 w-8 text-primary" />
            KI-Insights
          </h1>
          <p className="text-muted-foreground">
            KI-gestützte Analyse und Vorhersagen für regulatorische Trends
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => {
              toast({
                title: "Aktualisierung",
                description: "KI-Insights werden aktualisiert..."
              });
              queryClient.invalidateQueries({ queryKey: ["/api/ai-insights"] });
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Aktualisieren
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              toast({
                title: "Export",
                description: "Report wird vorbereitet..."
              });
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Report exportieren
          </Button>
        </div>
      </div>

      {/* Quick Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Analysen</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {insights.filter(i => i.category === 'trend_analysis').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Laufende Trend-Analysen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kritische Erkenntnisse</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {insights.filter(i => i.severity === 'critical' || i.severity === 'high').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Hohe Priorität Items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Gaps</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {insights.filter(i => i.category === 'compliance_gap').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Identifizierte Lücken
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Durchschnittliches Vertrauen</CardTitle>
            <Sparkles className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(insights.reduce((sum, insight) => sum + insight.confidence, 0) / insights.length)}%
            </div>
            <p className="text-xs text-muted-foreground">
              KI-Vertrauen Score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Summary Statistics */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Schnelle Übersicht
          </CardTitle>
          <CardDescription>
            Zusammenfassung der wichtigsten KI-Erkenntnisse und Trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Kategorien-Verteilung</h4>
              <div className="space-y-1">
                {[
                  { key: 'trend_analysis', label: 'Trend-Analysen', color: 'bg-blue-500' },
                  { key: 'risk_assessment', label: 'Risiko-Bewertungen', color: 'bg-red-500' },
                  { key: 'compliance_gap', label: 'Compliance Lücken', color: 'bg-orange-500' },
                  { key: 'market_intelligence', label: 'Markt-Intelligence', color: 'bg-green-500' }
                ].map(cat => (
                  <div key={cat.key} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${cat.color}`}></div>
                      <span>{cat.label}</span>
                    </div>
                    <Badge variant="outline">
                      {insights.filter(i => i.category === cat.key).length}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Auswirkungsbereich</h4>
              <div className="space-y-1">
                {[
                  { key: 'high', label: 'Hohe Auswirkung', color: 'text-red-600' },
                  { key: 'medium', label: 'Mittlere Auswirkung', color: 'text-orange-600' },
                  { key: 'low', label: 'Geringe Auswirkung', color: 'text-green-600' }
                ].map(impact => (
                  <div key={impact.key} className="flex items-center justify-between text-sm">
                    <span className={impact.color}>{impact.label}</span>
                    <Badge variant="outline">
                      {insights.filter(i => i.impact === impact.key).length}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Zeitrahmen</h4>
              <div className="space-y-1">
                {[
                  { key: 'immediate', label: 'Sofort', color: 'text-red-600' },
                  { key: 'short_term', label: 'Kurzfristig', color: 'text-orange-600' },
                  { key: 'medium_term', label: 'Mittelfristig', color: 'text-blue-600' },
                  { key: 'long_term', label: 'Langfristig', color: 'text-green-600' }
                ].map(timeframe => (
                  <div key={timeframe.key} className="flex items-center justify-between text-sm">
                    <span className={timeframe.color}>{timeframe.label}</span>
                    <Badge variant="outline">
                      {insights.filter(i => i.timeframe === timeframe.key).length}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList>
          <TabsTrigger value="insights">KI-Insights</TabsTrigger>
          <TabsTrigger value="analysis">Neue Analyse</TabsTrigger>
          <TabsTrigger value="history">Verlauf</TabsTrigger>
        </TabsList>

        <TabsContent value="insights">
          {/* Filter Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="mr-2 h-5 w-5" />
                Filter & Suche
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Suche</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Insights durchsuchen..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Kategorie</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
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
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Schweregrad</label>
                  <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Schweregrade</SelectItem>
                      <SelectItem value="critical">🔴 Kritisch</SelectItem>
                      <SelectItem value="high">🟠 Hoch</SelectItem>
                      <SelectItem value="medium">🟡 Mittel</SelectItem>
                      <SelectItem value="low">🔵 Niedrig</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setSelectedCategory("all");
                      setSelectedSeverity("all");
                      setSearchQuery("");
                    }}
                  >
                    Filter zurücksetzen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insights Grid */}
          <div className="grid gap-6">
            {filteredInsights.map((insight) => (
              <Card key={insight.id} className="hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <Badge className={severityColors[insight.severity]} variant="outline">
                        {insight.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="secondary">
                        {categoryLabels[insight.category]}
                      </Badge>
                      <Badge className={impactColors[insight.impact]} variant="secondary">
                        Impact: {insight.impact}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${getConfidenceColor(insight.confidence)}`}>
                        {insight.confidence}% Vertrauen
                      </span>
                      <Progress value={insight.confidence} className="w-20" />
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl mb-2">{insight.title}</CardTitle>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{timeframeLabels[insight.timeframe]}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Target className="h-4 w-4" />
                      <span>{insight.relevantRegions.join(", ")}</span>
                    </div>
                    <span>{formatDate(insight.createdAt)}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <CardDescription className="text-base">
                    {insight.description}
                  </CardDescription>

                  {insight.affectedDeviceClasses.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Betroffene Geräteklassen:</p>
                      <div className="flex flex-wrap gap-2">
                        {insight.affectedDeviceClasses.map((deviceClass) => (
                          <Badge key={deviceClass} variant="outline">
                            {deviceClass}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium mb-2">Datenquellen:</p>
                    <div className="flex flex-wrap gap-2">
                      {insight.sources.map((source, index) => (
                        <div key={source} className="flex items-center gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs hover:bg-blue-50"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                {source}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl w-[95vw] h-[90vh]">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <FileText className="h-5 w-5" />
                                  {source} - Dokument
                                </DialogTitle>
                              </DialogHeader>
                              <div className="flex-1 overflow-auto">
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">Quelle:</span>
                                      <Badge variant="outline">{source}</Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          try {
                                            const content = `Dokument: ${source}\n\nBezug zu KI-Insight: ${insight.title}\n\nBeschreibung:\n${insight.description}\n\nEmpfehlungen:\n${insight.recommendations.join('\n- ')}\n\nRelevante Regionen: ${insight.relevantRegions.join(', ')}\nBetroffene Geräteklassen: ${insight.affectedDeviceClasses.join(', ')}\n\nErstellt: ${insight.createdAt}\nVertrauen: ${insight.confidence}%\nSchweregrad: ${insight.severity}\nKategorie: ${insight.category}`;
                                            
                                            const blob = new Blob([content], { type: 'text/plain' });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `${source.replace(/[^a-zA-Z0-9]/g, '_')}_insight.txt`;
                                            document.body.appendChild(a);
                                            a.click();
                                            document.body.removeChild(a);
                                            URL.revokeObjectURL(url);
                                          } catch (error) {
                                            console.error('Download error:', error);
                                          }
                                        }}
                                      >
                                        <Download className="h-3 w-3 mr-1" />
                                        Download
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          // Open original source in new tab
                                          let url = '#';
                                          if (source.includes('EMA')) {
                                            url = 'https://www.ema.europa.eu/en/documents';
                                          } else if (source.includes('FDA')) {
                                            url = 'https://www.fda.gov/medical-devices/guidance-documents-medical-devices-and-radiation-emitting-products';
                                          } else if (source.includes('MDR')) {
                                            url = 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32017R0745';
                                          } else if (source.includes('MDCG')) {
                                            url = 'https://health.ec.europa.eu/medical-devices-coordination-group-mdcg/mdcg-documents_en';
                                          } else if (source.includes('BfArM')) {
                                            url = 'https://www.bfarm.de/DE/Medizinprodukte/_node.html';
                                          }
                                          window.open(url, '_blank');
                                        }}
                                      >
                                        <ExternalLink className="h-3 w-3 mr-1" />
                                        Original
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  <div className="prose max-w-none">
                                    <h3>Dokumenteninhalt:</h3>
                                    <div className="bg-white p-4 border rounded-lg">
                                      <h4 className="font-semibold mb-2">Bezug zu KI-Insight:</h4>
                                      <p className="mb-4">{insight.title}</p>
                                      
                                      <h4 className="font-semibold mb-2">Beschreibung:</h4>
                                      <p className="mb-4">{insight.description}</p>
                                      
                                      <h4 className="font-semibold mb-2">Relevante Auszüge:</h4>
                                      <div className="space-y-2">
                                        {source.includes('MDR') && (
                                          <div className="bg-blue-50 p-3 rounded">
                                            <p className="text-sm"><strong>MDR Artikel 61:</strong> "Der Hersteller führt für jedes Medizinprodukt eine systematische Überwachung nach dem Inverkehrbringen durch..."</p>
                                          </div>
                                        )}
                                        {source.includes('EMA') && (
                                          <div className="bg-green-50 p-3 rounded">
                                            <p className="text-sm"><strong>EMA Guidance:</strong> "Machine learning algorithms require specific validation approaches and continuous monitoring..."</p>
                                          </div>
                                        )}
                                        {source.includes('FDA') && (
                                          <div className="bg-orange-50 p-3 rounded">
                                            <p className="text-sm"><strong>FDA Guidance:</strong> "AI/ML-based medical devices require predetermined change control plans..."</p>
                                          </div>
                                        )}
                                        <div className="bg-gray-50 p-3 rounded">
                                          <p className="text-sm"><strong>Spezifische Anforderungen:</strong> {insight.recommendations.join('; ')}</p>
                                        </div>
                                      </div>
                                      
                                      <h4 className="font-semibold mb-2 mt-4">Metadaten:</h4>
                                      <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div><strong>Vertrauen:</strong> {insight.confidence}%</div>
                                        <div><strong>Schweregrad:</strong> {insight.severity}</div>
                                        <div><strong>Kategorie:</strong> {insight.category}</div>
                                        <div><strong>Zeitrahmen:</strong> {insight.timeframe}</div>
                                        <div><strong>Regionen:</strong> {insight.relevantRegions.join(', ')}</div>
                                        <div><strong>Geräteklassen:</strong> {insight.affectedDeviceClasses.join(', ')}</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => {
                              // Navigate to appropriate data collection page based on source
                              if (source.includes('EMA') || source.includes('MDCG') || source.includes('MDR')) {
                                setLocation('/global-sources');
                              } else if (source.includes('FDA')) {
                                setLocation('/data-collection');
                              } else {
                                setLocation('/historical-data');
                              }
                              toast({
                                title: "Navigation",
                                description: `Wechsle zu ${source} Datenquelle...`
                              });
                            }}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center">
                      <Lightbulb className="h-4 w-4 mr-1" />
                      Empfohlene Maßnahmen:
                    </p>
                    <ul className="space-y-1">
                      {insight.recommendations.map((recommendation, index) => (
                        <li key={index} className="text-sm flex items-start">
                          <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                          {recommendation}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {insight.tags.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Tags:</p>
                      <div className="flex flex-wrap gap-1">
                        {insight.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredInsights.length === 0 && (
            <div className="text-center py-12">
              <Brain className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Keine Insights gefunden</h3>
              <p className="text-muted-foreground">
                Passen Sie Ihre Filter an oder starten Sie eine neue KI-Analyse.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="mr-2 h-5 w-5" />
                Neue KI-Analyse starten
              </CardTitle>
              <CardDescription>
                Stellen Sie eine Frage zu regulatorischen Trends oder bitten Sie um eine spezifische Analyse
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Analyseanfrage</label>
                <Textarea
                  placeholder="z.B. 'Vergleiche die Cybersecurity-Anforderungen zwischen FDA und EU MDR für Klasse III Geräte' oder 'Analysiere die Trends bei Digital Health Apps in Deutschland'"
                  value={newAnalysisQuery}
                  onChange={(e) => setNewAnalysisQuery(e.target.value)}
                  rows={4}
                />
              </div>
              
              <Alert>
                <MessageSquare className="h-4 w-4" />
                <AlertDescription>
                  Die KI-Analyse nutzt aktuelle regulatorische Daten aus über 25 globalen Quellen und liefert in der Regel Ergebnisse innerhalb von 30-60 Sekunden.
                </AlertDescription>
              </Alert>

              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Verfügbare Analysebereiche: Compliance-Vergleiche, Trend-Vorhersagen, Risikobewertungen, Marktintelligenz
                </div>
                <Button 
                  onClick={handleNewAnalysis}
                  disabled={!newAnalysisQuery.trim() || createAnalysisMutation.isPending}
                >
                  {createAnalysisMutation.isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Analysiere...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Analyse starten
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Analyse-Verlauf</CardTitle>
              <CardDescription>
                Übersicht über alle durchgeführten KI-Analysen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyses.map((analysis) => (
                  <div key={analysis.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{analysis.query}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(analysis.createdAt)}
                          {analysis.processingTime && ` • ${analysis.processingTime}s Verarbeitungszeit`}
                        </p>
                      </div>
                      <Badge 
                        variant={analysis.status === 'completed' ? 'default' : 
                                analysis.status === 'processing' ? 'secondary' : 'destructive'}
                      >
                        {analysis.status === 'completed' && 'Abgeschlossen'}
                        {analysis.status === 'processing' && 'In Bearbeitung'}
                        {analysis.status === 'pending' && 'Wartend'}
                        {analysis.status === 'failed' && 'Fehlgeschlagen'}
                      </Badge>
                    </div>

                    {analysis.status === 'processing' && (
                      <div className="mb-3">
                        <Progress value={65} className="w-full" />
                        <p className="text-xs text-muted-foreground mt-1">Analysiere Datenquellen...</p>
                      </div>
                    )}

                    {analysis.result && (
                      <div className="bg-muted p-3 rounded mb-3">
                        <p className="text-sm">{analysis.result}</p>
                      </div>
                    )}

                    {analysis.insights && analysis.insights.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Wichtige Erkenntnisse:</p>
                        <ul className="space-y-1">
                          {analysis.insights.map((insight, index) => (
                            <li key={index} className="text-sm flex items-start">
                              <TrendingUp className="h-4 w-4 mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
                              {insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}