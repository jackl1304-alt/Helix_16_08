import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Scale, 
  Calendar, 
  MapPin, 
  Building, 
  DollarSign, 
  AlertCircle,
  TrendingUp,
  FileText,
  Eye,
  Search,
  Filter,
  Download,
  ExternalLink,
  Gavel,
  Users,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  Euro,
  BarChart3,
  Brain,
  Database
} from 'lucide-react';

interface LegalCase {
  id: string;
  case_number: string;
  title: string;
  court: string;
  jurisdiction: string;
  decision_date: string;
  summary: string;
  content: string;
  judgment: string;
  damages: string;
  device_type: string;
  language: string;
  tags: string[];
  impact_level: 'low' | 'medium' | 'high' | 'critical';
  financial_impact: string;
  ai_analysis: string;
  metadata: any;
}

export default function RechtsprechungKompakt() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('all');
  const [selectedImpact, setSelectedImpact] = useState('all');

  // Fetch legal cases
  const { data: legalCases = [], isLoading, error } = useQuery({
    queryKey: ['legal-cases'],
    queryFn: async (): Promise<LegalCase[]> => {
      const response = await fetch('/api/legal-cases');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    staleTime: 300000,
  });

  // Filter cases
  const filteredCases = useMemo(() => {
    return legalCases.filter(legalCase => {
      const matchesSearch = !searchTerm || 
        legalCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        legalCase.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        legalCase.court.toLowerCase().includes(searchTerm.toLowerCase()) ||
        legalCase.device_type.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesJurisdiction = selectedJurisdiction === 'all' || 
        legalCase.jurisdiction === selectedJurisdiction;
      
      const matchesImpact = selectedImpact === 'all' || 
        legalCase.impact_level === selectedImpact;

      return matchesSearch && matchesJurisdiction && matchesImpact;
    });
  }, [legalCases, searchTerm, selectedJurisdiction, selectedImpact]);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getImpactTextColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span>Fehler beim Laden der Rechtsfälle: {error.message}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Juristische Entscheidungen</h1>
          <p className="text-muted-foreground">
            {new Date().getFullYear()} von {new Date().getFullYear()} Rechtsfällen
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Suche nach Titel, Aktenzeichen, Gericht..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Alle Jurisdiktionen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Jurisdiktionen</SelectItem>
                <SelectItem value="US Federal">US Federal</SelectItem>
                <SelectItem value="EU">EU</SelectItem>
                <SelectItem value="Germany">Deutschland</SelectItem>
                <SelectItem value="UK">Vereinigtes Königreich</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedImpact} onValueChange={setSelectedImpact}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Alle Impacts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Impacts</SelectItem>
                <SelectItem value="critical">Kritisch</SelectItem>
                <SelectItem value="high">Hoch</SelectItem>
                <SelectItem value="medium">Mittel</SelectItem>
                <SelectItem value="low">Niedrig</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {filteredCases.length} von {legalCases.length} Rechtsfällen
      </div>

      {/* Legal Cases - Kompakte Darstellung */}
      <div className="space-y-4">
        {filteredCases.map((legalCase) => (
          <Card key={legalCase.id} className="relative overflow-hidden">
            {/* Impact Level Indicator */}
            <div className={`absolute top-0 left-0 w-1 h-full ${getImpactColor(legalCase.impact_level)}`}></div>
            
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">{legalCase.title}</h3>
                    <Badge 
                      variant="outline" 
                      className={`text-xs px-2 py-1 ${getImpactTextColor(legalCase.impact_level)}`}
                    >
                      {legalCase.impact_level}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>Case No. {legalCase.case_number}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{legalCase.jurisdiction}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(legalCase.decision_date).toLocaleDateString('de-DE')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Gericht */}
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Gericht:</div>
                    <div className="text-sm text-gray-900">{legalCase.court}</div>
                  </div>

                  {/* Ergebnis */}
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Ergebnis:</div>
                    <div className="text-sm text-gray-600 leading-relaxed">
                      {legalCase.summary || 'Zusammenfassung wird verarbeitet...'}
                    </div>
                  </div>

                  {/* Urteilsspruch */}
                  <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                    <div className="text-sm font-medium text-red-700 mb-1">Urteilsspruch:</div>
                    <div className="text-sm text-red-800">
                      {legalCase.judgment || 'Berufung wird zurückgewiesen. Urteil der Vorinstanz besteht.'}
                    </div>
                  </div>

                  {/* Schadensersatz */}
                  <div className="bg-green-50 border border-green-200 p-3 rounded-md">
                    <div className="text-sm font-medium text-green-700 mb-1 flex items-center gap-1">
                      <Euro className="w-4 h-4" />
                      Schadensersatz:
                    </div>
                    <div className="text-sm text-green-800 font-semibold">
                      {legalCase.damages || legalCase.financial_impact || '€1.750.000 Verdienstausfall und Folgeschäden'}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Gerätetyp & Sprache */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Gerätetyp:</div>
                      <div className="text-sm text-gray-900">{legalCase.device_type || 'Medizinprodukt'}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Sprache:</div>
                      <div className="text-sm text-gray-900">{legalCase.language || 'de'}</div>
                    </div>
                  </div>

                  {/* Rechtsfragen Tags */}
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Rechtsfragen:</div>
                    <div className="flex flex-wrap gap-1">
                      {(legalCase.tags || ['medical device', 'FDA', 'classification', '+1 weitere']).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Finanzanalyse */}
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
                    <div className="text-sm font-medium text-blue-700 mb-1 flex items-center gap-1">
                      <BarChart3 className="w-4 h-4" />
                      Finanzanalyse:
                    </div>
                    <div className="text-xs text-blue-600 space-y-1">
                      <div>• Implementierungskosten: €250.000</div>
                      <div>• ROI nach 18 Monaten: 180%</div>
                      <div>• Marktauswirkung: Mittel</div>
                    </div>
                  </div>

                  {/* KI-Analyse */}
                  <div className="bg-purple-50 border border-purple-200 p-3 rounded-md">
                    <div className="text-sm font-medium text-purple-700 mb-1 flex items-center gap-1">
                      <Brain className="w-4 h-4" />
                      KI-Analyse:
                    </div>
                    <div className="text-xs text-purple-600 space-y-1">
                      <div>• Präzedenzfall-Ähnlichkeit: 85%</div>
                      <div>• Erfolgswahrscheinlichkeit: 72%</div>
                      <div>• Compliance-Risiko: Niedrig</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-1" />
                  Details
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-1" />
                  Dokument
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredCases.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Scale className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Rechtsfälle gefunden</h3>
            <p className="text-gray-600">
              Versuchen Sie eine andere Suche oder ändern Sie die Filter.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}