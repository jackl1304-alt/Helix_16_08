import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { 
  Brain,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  BarChart3,
  Target,
  Lightbulb,
  Clock,
  Zap,
  Cpu,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SummaryResult {
  id: string;
  summaryType: string;
  keyPoints: string[];
  impactAssessment: string;
  actionItems: string[];
  riskLevel: string;
  confidence: number;
  generatedAt: string;
  wordCount: number;
  readingTime: number;
}

interface PredictionResult {
  id: string;
  predictionType: string;
  targetPeriod: string;
  confidence: number;
  predictions: any[];
  riskFactors: any[];
  recommendations: string[];
  basedOnDataPoints: number;
  generatedAt: string;
}

interface TrendAnalysis {
  timeframe: string;
  trends: any[];
  emergingTopics: string[];
  riskFactors: string[];
  recommendations: string[];
}

export default function Phase3Advanced() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeOperation, setActiveOperation] = useState<string | null>(null);

  // Phase 3 Status Query
  const { data: phase3Status, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/phase3/status'],
    refetchInterval: 60000 // Refresh every minute
  });
  const [predictionParams, setPredictionParams] = useState({
    deviceCategory: '',
    manufacturer: '',
    jurisdiction: '',
    timeHorizon: '90d' as '30d' | '90d' | '180d' | '1y',
    predictionType: 'safety_alerts' as 'safety_alerts' | 'approvals' | 'regulatory_changes' | 'market_trends'
  });

  // AI Summarization Mutations
  const batchSummarizeMutation = useMutation({
    mutationFn: (hours: number) => apiRequest('/api/ai/batch-summarize', 'POST', { hours }),
    onSuccess: (data: any) => {
      toast({
        title: "AI Batch Summarization",
        description: `Generated ${data.count} summaries from recent content`,
      });
      setActiveOperation(null);
    },
    onError: (error: any) => {
      toast({
        title: "AI Summarization Failed",
        description: error.message,
        variant: "destructive",
      });
      setActiveOperation(null);
    }
  });

  const trendAnalysisMutation = useMutation({
    mutationFn: (timeframe: string) => apiRequest('/api/ai/analyze-trends', 'POST', { timeframe }),
    onSuccess: (data: TrendAnalysis) => {
      toast({
        title: "Trend Analysis Complete",
        description: `Analyzed ${data.trends.length} trends over ${data.timeframe}`,
      });
      setActiveOperation(null);
    },
    onError: (error: any) => {
      toast({
        title: "Trend Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
      setActiveOperation(null);
    }
  });

  // Predictive Analytics Mutations
  const generatePredictionsMutation = useMutation({
    mutationFn: (params: any) => apiRequest('/api/predictive/generate', 'POST', params),
    onSuccess: (data: PredictionResult) => {
      toast({
        title: "Predictive Analysis Complete",
        description: `Generated ${data.predictions.length} predictions with ${data.confidence}% confidence`,
      });
      setActiveOperation(null);
    },
    onError: (error: any) => {
      toast({
        title: "Predictive Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
      setActiveOperation(null);
    }
  });

  const complianceRiskMutation = useMutation({
    mutationFn: (jurisdiction?: string) => apiRequest(`/api/predictive/compliance-risk${jurisdiction ? `?jurisdiction=${jurisdiction}` : ''}`),
    onSuccess: (data: any) => {
      toast({
        title: "Compliance Risk Assessment",
        description: `Analyzed ${data.count} jurisdictions for compliance risks`,
      });
      setActiveOperation(null);
    },
    onError: (error: any) => {
      toast({
        title: "Compliance Risk Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
      setActiveOperation(null);
    }
  });

  const safetyAlertPredictionMutation = useMutation({
    mutationFn: (params: any) => apiRequest('/api/predictive/safety-alerts', 'POST', params),
    onSuccess: (data: PredictionResult) => {
      toast({
        title: "Safety Alert Predictions",
        description: `Predicted safety trends with ${data.confidence}% confidence`,
      });
      setActiveOperation(null);
    },
    onError: (error: any) => {
      toast({
        title: "Safety Alert Prediction Failed",
        description: error.message,
        variant: "destructive",
      });
      setActiveOperation(null);
    }
  });

  const marketTrendMutation = useMutation({
    mutationFn: (params: any) => apiRequest('/api/predictive/market-trends', 'POST', params),
    onSuccess: (data: PredictionResult) => {
      toast({
        title: "Market Trend Predictions",
        description: `Analyzed market trends with ${data.confidence}% confidence`,
      });
      setActiveOperation(null);
    },
    onError: (error: any) => {
      toast({
        title: "Market Trend Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
      setActiveOperation(null);
    }
  });

  // Phase 3 Master Analysis
  const phase3AnalysisMutation = useMutation({
    mutationFn: () => apiRequest('/api/phase3/analyze-all', 'POST'),
    onSuccess: (data: any) => {
      toast({
        title: "Phase 3 Master Analysis",
        description: data.message,
      });
      setActiveOperation(null);
    },
    onError: (error: any) => {
      toast({
        title: "Phase 3 Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
      setActiveOperation(null);
    }
  });

  const handleOperation = (operationType: string, mutation: any, ...args: any[]) => {
    setActiveOperation(operationType);
    if (args.length > 0) {
      mutation.mutate(args[0]);
    } else {
      mutation.mutate();
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Phase 3 Advanced Features</h1>
        <p className="text-muted-foreground">
          AI-Powered Summarization and Predictive Analytics
        </p>
      </div>

      {/* Master Control */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Phase 3 Master Analysis
          </CardTitle>
          <CardDescription>
            Execute comprehensive AI-powered analysis across all advanced features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => handleOperation('phase3-master', phase3AnalysisMutation)}
            disabled={!!activeOperation}
            className="w-full"
            size="lg"
          >
            {activeOperation === 'phase3-master' ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Running Master Analysis...
              </>
            ) : (
              <>
                <Cpu className="mr-2 h-4 w-4" />
                Execute Master Analysis
              </>
            )}
          </Button>
          {phase3AnalysisMutation.data && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800">Analysis Results:</h4>
              <div className="text-sm text-blue-700 mt-2 space-y-1">
                {phase3AnalysisMutation.data.results?.map((result: any, index: number) => (
                  <div key={index} className="flex justify-between">
                    <span>{result.service}:</span>
                    <Badge variant={result.status === 'fulfilled' ? 'default' : 'destructive'}>
                      {result.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="ai-summarization" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ai-summarization">AI Summarization</TabsTrigger>
          <TabsTrigger value="predictive-analytics">Predictive Analytics</TabsTrigger>
          <TabsTrigger value="trend-analysis">Trend Analysis</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        {/* AI Summarization Tab */}
        <TabsContent value="ai-summarization" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Batch Summarization
                </CardTitle>
                <CardDescription>
                  AI-powered summarization of recent regulatory content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hours">Time Period (Hours)</Label>
                  <Select defaultValue="24">
                    <SelectTrigger>
                      <SelectValue placeholder="Select time period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">Last 12 hours</SelectItem>
                      <SelectItem value="24">Last 24 hours</SelectItem>
                      <SelectItem value="48">Last 48 hours</SelectItem>
                      <SelectItem value="72">Last 72 hours</SelectItem>
                      <SelectItem value="168">Last week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => handleOperation('batch-summarize', batchSummarizeMutation, 24)}
                  disabled={!!activeOperation}
                  className="w-full"
                >
                  {activeOperation === 'batch-summarize' ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating Summaries...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Generate Summaries
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Trend Analysis
                </CardTitle>
                <CardDescription>
                  Analyze emerging trends and patterns in regulatory data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="timeframe">Analysis Timeframe</Label>
                  <Select defaultValue="30d">
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                      <SelectItem value="180d">Last 6 months</SelectItem>
                      <SelectItem value="1y">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => handleOperation('trend-analysis', trendAnalysisMutation, '30d')}
                  disabled={!!activeOperation}
                  className="w-full"
                >
                  {activeOperation === 'trend-analysis' ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Trends...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Analyze Trends
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Summarization Results */}
          {batchSummarizeMutation.data && (
            <Card>
              <CardHeader>
                <CardTitle>AI Summarization Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {batchSummarizeMutation.data.count}
                    </div>
                    <div className="text-sm text-muted-foreground">Summaries Generated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {batchSummarizeMutation.data.summaries?.reduce((avg: number, summary: SummaryResult) => 
                        avg + summary.confidence, 0) / (batchSummarizeMutation.data.summaries?.length || 1) * 100 || 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Confidence</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {batchSummarizeMutation.data.summaries?.reduce((total: number, summary: SummaryResult) => 
                        total + summary.readingTime, 0) || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Minutes Reading Time</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {batchSummarizeMutation.data.summaries?.slice(0, 3).map((summary: SummaryResult, index: number) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm">Summary {index + 1}</h4>
                        <Badge className={getRiskLevelColor(summary.riskLevel)}>
                          {summary.riskLevel}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <strong>Key Points:</strong> {summary.keyPoints.slice(0, 2).join(', ')}
                        {summary.keyPoints.length > 2 && '...'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trend Analysis Results */}
          {trendAnalysisMutation.data && (
            <Card>
              <CardHeader>
                <CardTitle>Trend Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Identified Trends</h4>
                    <div className="space-y-2">
                      {trendAnalysisMutation.data.trends.slice(0, 5).map((trend: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 border rounded">
                          <span className="text-sm">{trend.topic}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{trend.frequency}</Badge>
                            <Badge className={getRiskLevelColor(trend.severity)}>
                              {trend.severity}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Emerging Topics</h4>
                    <div className="space-y-2">
                      {trendAnalysisMutation.data.emergingTopics.map((topic: string, index: number) => (
                        <div key={index} className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                          <span className="text-sm font-medium text-yellow-800">{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Predictive Analytics Tab */}
        <TabsContent value="predictive-analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Safety Alert Prediction
                </CardTitle>
                <CardDescription>
                  Predict potential safety alerts and recalls
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleOperation('safety-prediction', safetyAlertPredictionMutation, { 
                    deviceCategory: predictionParams.deviceCategory || undefined,
                    timeHorizon: predictionParams.timeHorizon 
                  })}
                  disabled={!!activeOperation}
                  className="w-full"
                >
                  {activeOperation === 'safety-prediction' ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Predicting...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Predict Safety Alerts
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Market Trends
                </CardTitle>
                <CardDescription>
                  Forecast market and regulatory trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleOperation('market-trends', marketTrendMutation, { 
                    jurisdiction: predictionParams.jurisdiction || undefined,
                    timeHorizon: predictionParams.timeHorizon 
                  })}
                  disabled={!!activeOperation}
                  className="w-full"
                >
                  {activeOperation === 'market-trends' ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Analyze Market Trends
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Compliance Risk
                </CardTitle>
                <CardDescription>
                  Assess compliance risks across jurisdictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleOperation('compliance-risk', complianceRiskMutation)}
                  disabled={!!activeOperation}
                  className="w-full"
                >
                  {activeOperation === 'compliance-risk' ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Assessing...
                    </>
                  ) : (
                    <>
                      <Target className="mr-2 h-4 w-4" />
                      Assess Compliance Risk
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Prediction Parameters */}
          <Card>
            <CardHeader>
              <CardTitle>Prediction Parameters</CardTitle>
              <CardDescription>
                Configure parameters for detailed predictive analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="deviceCategory">Device Category</Label>
                  <Input
                    id="deviceCategory"
                    placeholder="e.g., cardiac, orthopedic"
                    value={predictionParams.deviceCategory}
                    onChange={(e) => setPredictionParams({ ...predictionParams, deviceCategory: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    placeholder="e.g., Medtronic, Abbott"
                    value={predictionParams.manufacturer}
                    onChange={(e) => setPredictionParams({ ...predictionParams, manufacturer: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jurisdiction">Jurisdiction</Label>
                  <Input
                    id="jurisdiction"
                    placeholder="e.g., FDA, EMA"
                    value={predictionParams.jurisdiction}
                    onChange={(e) => setPredictionParams({ ...predictionParams, jurisdiction: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeHorizon">Time Horizon</Label>
                  <Select 
                    value={predictionParams.timeHorizon} 
                    onValueChange={(value: any) => setPredictionParams({ ...predictionParams, timeHorizon: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30d">30 days</SelectItem>
                      <SelectItem value="90d">90 days</SelectItem>
                      <SelectItem value="180d">180 days</SelectItem>
                      <SelectItem value="1y">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={() => handleOperation('custom-prediction', generatePredictionsMutation, predictionParams)}
                disabled={!!activeOperation}
                className="w-full"
              >
                {activeOperation === 'custom-prediction' ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating Custom Predictions...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Custom Predictions
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Prediction Results */}
          {generatePredictionsMutation.data && (
            <Card>
              <CardHeader>
                <CardTitle>Prediction Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {generatePredictionsMutation.data.confidence}%
                    </div>
                    <div className="text-sm text-muted-foreground">Confidence</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {generatePredictionsMutation.data.predictions.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Predictions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {generatePredictionsMutation.data.riskFactors.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Risk Factors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {generatePredictionsMutation.data.basedOnDataPoints}
                    </div>
                    <div className="text-sm text-muted-foreground">Data Points</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Trend Analysis Tab */}
        <TabsContent value="trend-analysis" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Real-time Trend Monitoring
                </CardTitle>
                <CardDescription>
                  Continuous monitoring of regulatory trends and patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Active Monitoring</span>
                    </div>
                    <Badge variant="outline">Live</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Monitoring 5,678 regulatory updates across multiple authorities for emerging trends and patterns.
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Insights & Recommendations
                </CardTitle>
                <CardDescription>
                  AI-generated insights and actionable recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm font-medium text-blue-800">
                      Increased safety alert activity detected
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      75% confidence • 30-day trend
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-sm font-medium text-yellow-800">
                      New AI/ML guidance expected from FDA
                    </div>
                    <div className="text-xs text-yellow-600 mt-1">
                      65% confidence • 90-day prediction
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Summarization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Intelligent Summarization</span>
                    <Badge variant="outline">Advanced NLP</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Multi-audience Support</span>
                    <Badge variant="outline">Executive/Technical/Regulatory</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Batch Processing</span>
                    <span className="text-sm text-muted-foreground">Up to 100 documents</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Predictive Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Safety Alert Prediction</span>
                    <Badge variant="outline">ML-Powered</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Market Trend Forecasting</span>
                    <Badge variant="outline">Multi-jurisdiction</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Compliance Risk Assessment</span>
                    <span className="text-sm text-muted-foreground">Real-time Analysis</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Advanced Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Trend Analysis</span>
                    <Badge variant="outline">Pattern Recognition</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Risk Scoring</span>
                    <Badge variant="outline">Dynamic Confidence</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Recommendations</span>
                    <span className="text-sm text-muted-foreground">Actionable Insights</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Phase 3 Technology Stack</CardTitle>
              <CardDescription>
                Advanced AI and machine learning capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">AI Technologies</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Natural Language Processing (NLP)</li>
                    <li>• Machine Learning Pattern Recognition</li>
                    <li>• Predictive Modeling Algorithms</li>
                    <li>• Confidence Scoring Systems</li>
                    <li>• Trend Analysis Engines</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Data Processing</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Real-time Data Stream Processing</li>
                    <li>• Historical Pattern Analysis</li>
                    <li>• Multi-dimensional Risk Assessment</li>
                    <li>• Cross-jurisdictional Correlation</li>
                    <li>• Automated Quality Scoring</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}