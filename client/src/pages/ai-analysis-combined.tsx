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
  Calendar,
  Building,
  Award,
  Globe,
  Star
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

export default function AIAnalysisCombined() {
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
      
      setAnalysisResult(response);
      toast({
        title: "Analyse abgeschlossen",
        description: "Der Inhalt wurde erfolgreich analysiert.",
      });
    } catch (error) {
      console.error('Error analyzing content:', error);
      toast({
        title: "Fehler",
        description: "Die Analyse konnte nicht durchgeführt werden.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const ContentAnalysisTab = () => (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Content-Eingabe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Fügen Sie hier den zu analysierenden Inhalt ein (regulatorische Dokumente, Guidelines, Updates, etc.)..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[200px] resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {content.length} Zeichen
            </span>
            <Button 
              onClick={handleAnalyzeContent}
              disabled={!content.trim() || isAnalyzing}
              className="flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analysiere...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  Analysieren
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
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
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
                  {analysisResult.categorization.deviceTypes.map((type, idx) => (
                    <Badge key={idx} variant="secondary">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Therapeutischer Bereich
                  </label>
                  <p className="text-sm mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    {analysisResult.categorization.therapeuticArea}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Risikostufe
                  </label>
                  <Badge 
                    variant={
                      analysisResult.categorization.riskLevel === 'Hoch' ? 'destructive' :
                      analysisResult.categorization.riskLevel === 'Mittel' ? 'default' : 'secondary'
                    }
                    className="mt-1"
                  >
                    {analysisResult.categorization.riskLevel}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  Vertrauensgrad
                  <Target className="h-4 w-4" />
                </label>
                <div className="mt-2">
                  <Progress value={analysisResult.categorization.confidence} className="h-2" />
                  <span className="text-xs text-gray-500 mt-1">
                    {analysisResult.categorization.confidence}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evaluation Results */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Bewertung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Priorität
                  </label>
                  <Badge 
                    variant={
                      analysisResult.evaluation.priority === 'Hoch' ? 'destructive' :
                      analysisResult.evaluation.priority === 'Mittel' ? 'default' : 'secondary'
                    }
                    className="mt-1"
                  >
                    {analysisResult.evaluation.priority}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Zeitkritisch
                  </label>
                  <p className="text-sm mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    {analysisResult.evaluation.timelineSensitivity}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Qualitätsbewertung
                </label>
                <div className="mt-2">
                  <Progress value={analysisResult.evaluation.qualityScore} className="h-2" />
                  <span className="text-xs text-gray-500 mt-1">
                    {analysisResult.evaluation.qualityScore}/100
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sentiment
                </label>
                <Badge 
                  variant={
                    analysisResult.evaluation.sentiment === 'Positiv' ? 'default' :
                    analysisResult.evaluation.sentiment === 'Negativ' ? 'destructive' : 'secondary'
                  }
                  className="mt-1"
                >
                  {analysisResult.evaluation.sentiment}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Insights */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Erkenntnisse & Empfehlungen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Zusammenfassung
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
        </div>
      )}
    </div>
  );

  const KIInsightsTab = () => (
    <div className="space-y-6">
      {insightsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Building className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Case Studies</p>
                    <p className="text-2xl font-bold">{insights?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Erfolgsrate</p>
                    <p className="text-2xl font-bold">98%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Märkte</p>
                    <p className="text-2xl font-bold">15+</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">ROI</p>
                    <p className="text-2xl font-bold">340%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Case Studies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {insights?.map((insight: any, idx: number) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <Badge variant="secondary" className="text-xs">
                        {insight.category}
                      </Badge>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {insight.timeline}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{insight.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {insight.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Investment</span>
                      <span className="text-sm font-medium">{insight.investment}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">ROI</span>
                      <span className="text-sm font-medium text-green-600">{insight.roi}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Market Size</span>
                      <span className="text-sm font-medium">{insight.marketSize}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex flex-wrap gap-1">
                      {insight.technologies?.slice(0, 3).map((tech: string, techIdx: number) => (
                        <Badge key={techIdx} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            KI-Analyse
          </h1>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Content-Analyse
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            KI Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analysis">
          <ContentAnalysisTab />
        </TabsContent>

        <TabsContent value="insights">
          <KIInsightsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}