import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Search,
  Brain,
  FileText,
  Scale,
  Clock,
  Globe,
  Star,
  ExternalLink,
  Download,
  Filter,
  Zap,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  Eye
} from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  type: 'regulatory' | 'legal' | 'knowledge' | 'historical';
  source: string;
  dataSource: 'database' | 'ai' | 'hybrid'; // Neue Eigenschaft für Datenquelle
  relevance: number;
  date: string;
  url?: string;
  metadata: {
    region?: string;
    deviceClass?: string;
    category?: string;
    tags?: string[];
    language?: string;
    aiConfidence?: number; // Für KI-generierte Ergebnisse
  };
}

interface IntelligentAnswer {
  query: string;
  answer: string;
  confidence: number;
  sources: string[];
  recommendations: string[];
  relatedTopics: string[];
  timestamp: string;
}

export default function IntelligentSearch() {
  const { toast } = useToast();
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    type: "all",
    region: "all",
    timeframe: "all"
  });
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [intelligentAnswer, setIntelligentAnswer] = useState<IntelligentAnswer | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Automatische Suche bei URL-Query-Parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('q');
    if (queryParam && queryParam.trim()) {
      setSearchQuery(queryParam.trim());
      // Automatisch suchen wenn aus Sidebar kommt
      setIsSearching(true);
      searchMutation.mutate(queryParam.trim());
    }
  }, [location]);

  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      console.log('[INTELLIGENT-SEARCH] Starting search for:', query);
      return await apiRequest("/api/intelligent-search", "POST", { 
        query, 
        filters: selectedFilters 
      });
    },
    onSuccess: (data: any) => {
      console.log('[INTELLIGENT-SEARCH] Search results received:', data);
      setSearchResults(data.results || []);
      setIntelligentAnswer(data.answer || null);
      setIsSearching(false);
    },
    onError: (error) => {
      console.error('[INTELLIGENT-SEARCH] Search error:', error);
      toast({
        title: "Suchfehler",
        description: "Fehler bei der intelligenten Suche",
        variant: "destructive"
      });
      setIsSearching(false);
    }
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      searchMutation.mutate(searchQuery.trim());
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'regulatory': return <FileText className="h-4 w-4" />;
      case 'legal': return <Scale className="h-4 w-4" />;
      case 'knowledge': return <Brain className="h-4 w-4" />;
      case 'historical': return <Clock className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'regulatory': return 'bg-blue-100 text-blue-800';
      case 'legal': return 'bg-purple-100 text-purple-800';
      case 'knowledge': return 'bg-green-100 text-green-800';
      case 'historical': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600";
    if (confidence >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Brain className="mr-3 h-8 w-8 text-primary" />
            Intelligente Suche
          </h1>
          <p className="text-muted-foreground">
            KI-gestützte Suche durch alle Helix-Datenquellen mit intelligenten Antworten
          </p>
        </div>
      </div>

      {/* Search Interface */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="mr-2 h-5 w-5" />
            Intelligente Abfrage
          </CardTitle>
          <CardDescription>
            Stellen Sie Fragen zu regulatorischen Daten, Rechtsfällen oder der Knowledge Base
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                placeholder="z.B. 'Was sind die MDR-Anforderungen für Klasse III Geräte?' oder 'Aktuelle FDA-Guidance zu Cybersecurity'"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="text-base"
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={!searchQuery.trim() || isSearching}
              className="px-8"
            >
              {isSearching ? (
                <>
                  <Zap className="mr-2 h-4 w-4 animate-spin" />
                  Suche...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Suchen
                </>
              )}
            </Button>
          </div>

          {/* Quick Filter Options */}
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={selectedFilters.type === "all" ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedFilters({...selectedFilters, type: "all"})}
            >
              Alle Quellen
            </Button>
            <Button 
              variant={selectedFilters.type === "regulatory" ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedFilters({...selectedFilters, type: "regulatory"})}
            >
              <FileText className="mr-1 h-3 w-3" />
              Regulatorisch
            </Button>
            <Button 
              variant={selectedFilters.type === "legal" ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedFilters({...selectedFilters, type: "legal"})}
            >
              <Scale className="mr-1 h-3 w-3" />
              Rechtsfälle
            </Button>
            <Button 
              variant={selectedFilters.type === "knowledge" ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedFilters({...selectedFilters, type: "knowledge"})}
            >
              <Brain className="mr-1 h-3 w-3" />
              Knowledge Base
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Intelligent Answer */}
      {intelligentAnswer && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center text-primary">
              <MessageSquare className="mr-2 h-5 w-5" />
              KI-Antwort
              <Badge className={`ml-2 ${getConfidenceColor(intelligentAnswer.confidence)}`} variant="outline">
                {intelligentAnswer.confidence}% Vertrauen
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose max-w-none">
              <p className="text-base leading-relaxed">{intelligentAnswer.answer}</p>
            </div>

            {intelligentAnswer.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                  Empfehlungen:
                </h4>
                <ul className="space-y-1">
                  {intelligentAnswer.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm flex items-start">
                      <Star className="mr-2 h-3 w-3 mt-0.5 text-yellow-500 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {intelligentAnswer.relatedTopics.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Verwandte Themen:</h4>
                <div className="flex flex-wrap gap-2">
                  {intelligentAnswer.relatedTopics.map((topic, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer"
                      onClick={() => setSearchQuery(topic)}
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
              <div className="flex items-center space-x-4">
                <span>Quellen: {intelligentAnswer.sources.length}</span>
                <span>{new Date(intelligentAnswer.timestamp).toLocaleString('de-DE')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Suchergebnisse ({searchResults.length})
            </h2>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Nach Relevanz sortiert</span>
            </div>
          </div>

          <div className="grid gap-4">
            {searchResults.map((result) => (
              <Card key={result.id} className="hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-3">
                      <Badge className={getTypeColor(result.type)} variant="secondary">
                        {getTypeIcon(result.type)}
                        <span className="ml-1 capitalize">{result.type}</span>
                      </Badge>
                      <Badge variant="outline">
                        {result.source}
                      </Badge>
                      {/* Datenquelle anzeigen */}
                      <Badge 
                        variant={result.dataSource === 'database' ? 'default' : result.dataSource === 'ai' ? 'destructive' : 'secondary'}
                        className={result.dataSource === 'database' ? 'bg-blue-100 text-blue-800' : 
                                  result.dataSource === 'ai' ? 'bg-purple-100 text-purple-800' : 
                                  'bg-orange-100 text-orange-800'}
                      >
                        {result.dataSource === 'database' ? '🗄️ Eigene Daten' : 
                         result.dataSource === 'ai' ? '🤖 KI-Ergebnis' : 
                         '🔄 Hybrid'}
                      </Badge>
                      {result.metadata.region && (
                        <Badge variant="outline">
                          <Globe className="mr-1 h-3 w-3" />
                          {result.metadata.region}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-green-600">
                        {Math.round(result.relevance * 100)}% Relevanz
                      </span>
                      {result.metadata.aiConfidence && (
                        <span className="text-xs text-purple-600">
                          KI: {result.metadata.aiConfidence}%
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg leading-tight">{result.title}</CardTitle>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(result.date).toLocaleDateString('de-DE')}</span>
                    </div>
                    {result.metadata.deviceClass && (
                      <div className="flex items-center space-x-1">
                        <Info className="h-4 w-4" />
                        <span>{result.metadata.deviceClass}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {result.excerpt}
                  </p>

                  {result.metadata.tags && result.metadata.tags.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {result.metadata.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="text-sm text-muted-foreground">
                      {result.metadata.language && (
                        <span className="uppercase">{result.metadata.language}</span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-3 w-3" />
                        Details
                      </Button>
                      {result.url && (
                        <Button variant="outline" size="sm">
                          <ExternalLink className="mr-2 h-3 w-3" />
                          Quelle
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {searchQuery && !isSearching && searchResults.length === 0 && !intelligentAnswer && (
        <div className="text-center py-12">
          <Search className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Keine Ergebnisse gefunden</h3>
          <p className="text-muted-foreground">
            Versuchen Sie andere Suchbegriffe oder erweitern Sie Ihre Anfrage.
          </p>
        </div>
      )}

      {/* Search Suggestions */}
      {!searchQuery && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="mr-2 h-5 w-5" />
              Beispielanfragen
            </CardTitle>
            <CardDescription>
              Probieren Sie diese intelligenten Suchanfragen aus:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "MDR-Anforderungen für Klasse III Medizinprodukte",
                "FDA 510(k) Einreichungsverfahren 2025", 
                "Cybersecurity-Guidelines für Connected Devices",
                "EMA-Guidance zu Clinical Evidence",
                "BfArM Stellungnahmen zu KI-Medizinprodukten",
                "Swissmedic Zulassungsverfahren Timeline"
              ].map((suggestion, index) => (
                <Button 
                  key={index}
                  variant="outline" 
                  className="h-auto p-4 text-left justify-start"
                  onClick={() => setSearchQuery(suggestion)}
                >
                  <MessageSquare className="mr-3 h-4 w-4 flex-shrink-0" />
                  <span>{suggestion}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}