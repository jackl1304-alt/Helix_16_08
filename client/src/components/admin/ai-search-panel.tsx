import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, Brain, TrendingUp, FileText, ExternalLink, Zap, AlertTriangle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface SearchResult {
  content: string;
  citations: string[];
  relatedQuestions: string[];
}

interface TrendAnalysis {
  emergingTopics: string[];
  riskAlerts: string[];
  complianceUpdates: string[];
  marketInsights: string[];
}

export function AISearchPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const queryClient = useQueryClient();

  // Trend Analysis Query
  const { data: trends, isLoading: trendsLoading } = useQuery({
    queryKey: ['/api/ai/trends', selectedTimeframe],
    enabled: true
  });

  // Search Mutation
  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      console.log('[AI-SEARCH] Starting regulatory search:', query);
      const response = await fetch('/api/ai/search/regulatory', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          query: query.trim(), 
          domain: 'fda.gov',
          searchType: 'regulatory'
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[AI-SEARCH] Response error:', response.status, errorText);
        throw new Error(`Search failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('[AI-SEARCH] Search result received:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('[AI-SEARCH] Search completed successfully');
      queryClient.invalidateQueries({ queryKey: ['/api/ai/search'] });
    },
    onError: (error) => {
      console.error('[AI-SEARCH] Search failed:', error);
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchMutation.mutate(searchQuery);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">KI-Powered Intelligence</h2>
          <p className="text-gray-600">Intelligente Suche und Analyse mit Perplexity AI</p>
        </div>
        <Badge variant="secondary" className="bg-purple-100 text-purple-900">
          <Brain className="h-3 w-3 mr-1" />
          Powered by Perplexity
        </Badge>
      </div>

      <Tabs defaultValue="search" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search" data-testid="tab-search">
            <Search className="h-4 w-4 mr-2" />
            Intelligente Suche
          </TabsTrigger>
          <TabsTrigger value="trends" data-testid="tab-trends">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trend-Analyse
          </TabsTrigger>
          <TabsTrigger value="analysis" data-testid="tab-analysis">
            <Brain className="h-4 w-4 mr-2" />
            Content-Analyse
          </TabsTrigger>
          <TabsTrigger value="insights" data-testid="tab-insights">
            <Zap className="h-4 w-4 mr-2" />
            Smart Insights
          </TabsTrigger>
        </TabsList>

        {/* Intelligente Suche */}
        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-blue-600" />
                <span>Regulatory Intelligence Search</span>
              </CardTitle>
              <CardDescription>
                Durchsuchen Sie aktuelle regulatorische Informationen mit KI-Unterstützung
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSearch} className="flex space-x-2">
                <Input
                  placeholder="z.B. 'Neue FDA Cybersecurity-Richtlinien für Medizingeräte'"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                  data-testid="input-search-query"
                />
                <Button 
                  type="submit" 
                  disabled={searchMutation.isPending}
                  data-testid="button-search"
                >
                  {searchMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Suchen
                </Button>
              </form>

              {searchMutation.data && (
                <div className="space-y-4">
                  <Alert className="bg-green-50 border-green-200">
                    <Brain className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-900">
                      KI-Analyse abgeschlossen für: "{searchMutation.variables}"
                    </AlertDescription>
                  </Alert>

                  <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <CardHeader>
                      <CardTitle className="text-lg">Suchergebnisse</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="prose max-w-none">
                        <p className="text-gray-700">{searchMutation.data.result.content}</p>
                      </div>

                      {searchMutation.data.result.citations.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Quellen
                          </h4>
                          <div className="space-y-2">
                            {searchMutation.data.result.citations.map((citation: string, index: number) => (
                              <a
                                key={index}
                                href={citation}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm block"
                              >
                                {citation}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {searchMutation.data.result.relatedQuestions.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Verwandte Fragen</h4>
                          <div className="flex flex-wrap gap-2">
                            {searchMutation.data.result.relatedQuestions.map((question: string, index: number) => (
                              <Badge key={index} variant="outline" className="cursor-pointer">
                                {question}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {searchMutation.error && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertDescription className="text-red-900">
                    Fehler bei der KI-Suche: {searchMutation.error.message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trend-Analyse */}
        <TabsContent value="trends" className="space-y-4">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant={selectedTimeframe === 'week' ? 'default' : 'outline'}
              onClick={() => setSelectedTimeframe('week')}
              data-testid="button-timeframe-week"
            >
              Woche
            </Button>
            <Button
              variant={selectedTimeframe === 'month' ? 'default' : 'outline'}
              onClick={() => setSelectedTimeframe('month')}
              data-testid="button-timeframe-month"
            >
              Monat
            </Button>
            <Button
              variant={selectedTimeframe === 'quarter' ? 'default' : 'outline'}
              onClick={() => setSelectedTimeframe('quarter')}
              data-testid="button-timeframe-quarter"
            >
              Quartal
            </Button>
          </div>

          {trendsLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2">KI-Trend-Analyse läuft...</span>
              </CardContent>
            </Card>
          ) : trends ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-green-50 to-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-green-900">
                    <TrendingUp className="h-5 w-5" />
                    <span>Emerging Topics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {trends.trends.emergingTopics.map((topic: string, index: number) => (
                      <Badge key={index} className="mr-2 mb-2 bg-green-100 text-green-900">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-red-900">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Risk Alerts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {trends.trends.riskAlerts.map((alert: string, index: number) => (
                      <div key={index} className="p-2 bg-red-100 rounded-lg text-red-900 text-sm">
                        {alert}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-900">
                    <FileText className="h-5 w-5" />
                    <span>Compliance Updates</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {trends.trends.complianceUpdates.map((update: string, index: number) => (
                      <div key={index} className="p-2 bg-blue-100 rounded-lg text-blue-900 text-sm">
                        {update}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-purple-900">
                    <Zap className="h-5 w-5" />
                    <span>Market Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {trends.trends.marketInsights.map((insight: string, index: number) => (
                      <div key={index} className="p-2 bg-purple-100 rounded-lg text-purple-900 text-sm">
                        {insight}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Alert>
              <AlertDescription>
                Keine Trend-Daten verfügbar. Bitte versuchen Sie es erneut.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Content-Analyse */}
        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <span>KI-basierte Content-Analyse</span>
              </CardTitle>
              <CardDescription>
                Automatische Qualitätsbewertung und Compliance-Prüfung
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="bg-blue-50 border-blue-200">
                <Brain className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  Content-Analyse-Features sind in Entwicklung. Diese werden automatisch 
                  regulatorische Inhalte bewerten und Verbesserungsvorschläge liefern.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Smart Insights */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-orange-600" />
                <span>Smart Insights & Predictions</span>
              </CardTitle>
              <CardDescription>
                KI-generierte Einblicke und Vorhersagen für strategische Entscheidungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="bg-orange-50 border-orange-200">
                <Zap className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-900">
                  Smart Insights werden entwickelt. Diese Features umfassen predictive Analytics,
                  strategische Empfehlungen und automatisierte Compliance-Vorhersagen.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}