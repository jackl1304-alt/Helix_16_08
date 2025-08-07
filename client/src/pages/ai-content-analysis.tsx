import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { 
  Brain, 
  Search, 
  BarChart3, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Target,
  Lightbulb,
  Shield,
  Bot,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';

interface AnalysisResult {
  categorization: {
    categories: string[];
    deviceTypes: string[];
    therapeuticArea: string;
    riskLevel: string;
    confidence: number;
  };
  evaluation: {
    priority: string;
    timelineSensitivity: string;
    qualityScore: number;
    sentiment: string;
  };
  insights: {
    keyPoints: string[];
    entities: string[];
    summary: string;
    complianceAreas: string[];
    requirements: string[];
    risks: string[];
    recommendations: string[];
  };
  metadata: {
    processedAt: string;
    contentLength: number;
    analysisVersion: string;
    processingTime: string;
  };
}

export default function AIContentAnalysis() {
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState('analysis');

  // KI Insights data
  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ['/api/ai-insights'],
    queryFn: () => fetch('/api/ai-insights').then(res => res.json())
  });

  const handleAnalyzeContent = async () => {
    if (!content.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie Inhalt zum Analysieren ein.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await apiRequest('/api/ai/analyze-content', 'POST', {
        content: content.trim(),
        contentType: 'regulatory'
      });
      
      setAnalysisResult(response.data);
      toast({
        title: "Analyse abgeschlossen",
        description: response.message || "AI-Analyse erfolgreich durchgeführt",
      });
    } catch (error: any) {
      console.error('AI Content Analysis failed:', error);
      toast({
        title: "Analyse fehlgeschlagen",
        description: error.message || "Ein Fehler ist aufgetreten",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center gap-3 mb-8">
        <Brain className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI Content Analysis
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Automatische Kategorisierung und Bewertung von Regulatory Content
          </p>
        </div>
      </div>

      {/* Input Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Content Input
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="🔴 MOCK DATA - Geben Sie hier den zu analysierenden Regulatory Content ein - AUTHENTIC AI SERVICE REQUIRED"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full"
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {content.length} Zeichen
            </span>
            <Button 
              onClick={handleAnalyzeContent}
              disabled={isAnalyzing || !content.trim()}
              className="flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Analysiere...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Inhalt analysieren
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Categorization Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Kategorisierung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Kategorien
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {analysisResult.categorization.categories.map((category, idx) => (
                    <Badge key={idx} variant="default">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Gerätetypen
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {analysisResult.categorization.deviceTypes.map((device, idx) => (
                    <Badge key={idx} variant="outline">
                      {device}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Therapeutischer Bereich
                  </label>
                  <p className="text-sm mt-1">{analysisResult.categorization.therapeuticArea}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Risikostufe
                  </label>
                  <Badge variant={getRiskColor(analysisResult.categorization.riskLevel)} className="mt-1">
                    {analysisResult.categorization.riskLevel}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Konfidenz-Score
                </label>
                <div className="mt-2">
                  <Progress 
                    value={analysisResult.categorization.confidence * 100} 
                    className="h-2"
                  />
                  <span className="text-sm text-gray-500 mt-1">
                    {Math.round(analysisResult.categorization.confidence * 100)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evaluation Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Bewertung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Priorität
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(analysisResult.evaluation.priority)}`}></div>
                    <span className="text-sm capitalize">{analysisResult.evaluation.priority}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Zeitkritikalität
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{analysisResult.evaluation.timelineSensitivity}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Qualitäts-Score
                  </label>
                  <div className="mt-2">
                    <Progress 
                      value={analysisResult.evaluation.qualityScore} 
                      className="h-2"
                    />
                    <span className="text-sm text-gray-500 mt-1">
                      {analysisResult.evaluation.qualityScore}%
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Sentiment
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    {analysisResult.evaluation.sentiment === 'positive' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {analysisResult.evaluation.sentiment === 'negative' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    {analysisResult.evaluation.sentiment === 'neutral' && <div className="w-4 h-4 rounded-full bg-gray-400" />}
                    <span className="text-sm capitalize">{analysisResult.evaluation.sentiment}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Insights */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                Erkenntnisse & Zusammenfassung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  KI-Zusammenfassung
                </label>
                <p className="text-sm mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  {analysisResult.insights.summary}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Schlüsselpunkte
                  </label>
                  <ul className="text-sm mt-2 space-y-1">
                    {analysisResult.insights.keyPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Erkannte Entitäten
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {analysisResult.insights.entities.slice(0, 8).map((entity, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {entity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Compliance-Bereiche
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {analysisResult.insights.complianceAreas.map((area, idx) => (
                      <Badge key={idx} variant="default">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Empfehlungen
                  </label>
                  <ul className="text-sm mt-2 space-y-1">
                    {analysisResult.insights.recommendations.slice(0, 3).map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Lightbulb className="h-3 w-3 text-yellow-500 mt-1 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm">
                Analyse-Metadaten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Verarbeitet am:</span>
                  <br />
                  {new Date(analysisResult.metadata.processedAt).toLocaleString('de-DE')}
                </div>
                <div>
                  <span className="font-medium">Content-Länge:</span>
                  <br />
                  {analysisResult.metadata.contentLength} Zeichen
                </div>
                <div>
                  <span className="font-medium">Analyse-Version:</span>
                  <br />
                  {analysisResult.metadata.analysisVersion}
                </div>
                <div>
                  <span className="font-medium">Verarbeitungszeit:</span>
                  <br />
                  {analysisResult.metadata.processingTime}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}