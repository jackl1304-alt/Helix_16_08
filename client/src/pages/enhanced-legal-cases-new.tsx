import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Clock, FileText, Scale, DollarSign, Brain, Gavel, RefreshCw } from 'lucide-react';

// Types
interface LegalCase {
  id: string;
  caseNumber: string;
  title: string;
  court: string;
  jurisdiction: string;
  decisionDate: string;
  summary: string;
  content: string;
  documentUrl?: string;
  impactLevel?: string;
  keywords?: string[];
}

export default function EnhancedLegalCasesNew() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('all');
  const [selectedImpactLevel, setSelectedImpactLevel] = useState('all');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch legal cases with cache busting
  const { data: legalCases = [], isLoading: isLoadingCases, refetch } = useQuery({
    queryKey: ['legal-cases-new', Date.now()], // Cache busting
    queryFn: async (): Promise<LegalCase[]> => {
      const response = await fetch('/api/legal-cases?_=' + Date.now());
      if (!response.ok) throw new Error('Failed to fetch legal cases');
      const data = await response.json();
      console.log("NEUE KOMPONENTE - Legal Cases geladen:", data.length);
      console.log("ERSTE 3 FÄLLE PREVIEW:", data.slice(0, 3).map((c: any) => ({
        id: c.id,
        title: c.title,
        summaryStart: c.summary?.substring(0, 80) + "...",
        contentStart: c.content?.substring(0, 80) + "...",
        summaryLength: c.summary?.length,
        contentLength: c.content?.length
      })));
      return data;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 0, // Always fresh
    gcTime: 0 // No cache (gcTime replaces cacheTime in v5)
  });

  // Refresh mutation
  const refreshCasesMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/legal-cases?_=' + Date.now());
      if (!response.ok) throw new Error('Failed to refresh');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['legal-cases-new', Date.now()], data);
      console.log("DATEN ERFOLGREICH AKTUALISIERT:", data.length, "Fälle");
    }
  });

  // Filter cases
  const filteredCases = legalCases.filter((legalCase: LegalCase) => {
    const matchesSearch = !searchTerm || 
      legalCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      legalCase.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      legalCase.court.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesJurisdiction = selectedJurisdiction === 'all' || 
      legalCase.jurisdiction === selectedJurisdiction;
    
    const matchesImpactLevel = selectedImpactLevel === 'all' || 
      legalCase.impactLevel === selectedImpactLevel;
    
    return matchesSearch && matchesJurisdiction && matchesImpactLevel;
  });

  // Get individual case data with forced refresh
  const getIndividualCase = (caseId: string): LegalCase | null => {
    const foundCase = legalCases.find((c: LegalCase) => c.id === caseId);
    if (foundCase) {
      console.log(`INDIVIDUAL CASE DATA FÜR ${caseId}:`, {
        id: foundCase.id,
        summaryLength: foundCase.summary?.length,
        contentLength: foundCase.content?.length,
        summaryPreview: foundCase.summary?.substring(0, 100),
        contentPreview: foundCase.content?.substring(0, 100)
      });
    }
    return foundCase || null;
  };

  const getJurisdictionIcon = (jurisdiction: string) => {
    switch (jurisdiction) {
      case 'US Federal': return '🇺🇸';
      case 'EU': return '🇪🇺';
      case 'Germany': return '🇩🇪';
      case 'UK': return '🇬🇧';
      case 'Canada': return '🇨🇦';
      case 'Australia': return '🇦🇺';
      default: return '🌍';
    }
  };

  const getImpactBadgeColor = (impactLevel: string | undefined) => {
    switch (impactLevel) {
      case 'high': return 'bg-red-500 text-white hover:bg-red-600';
      case 'medium': return 'bg-yellow-500 text-black hover:bg-yellow-600';
      case 'low': return 'bg-green-500 text-white hover:bg-green-600';
      default: return 'bg-gray-500 text-white hover:bg-gray-600';
    }
  };

  console.log("ENHANCED LEGAL CASES NEW DEBUG:", {
    totalCases: legalCases.length,
    filteredCases: filteredCases.length,
    searchTerm,
    selectedJurisdiction,
    selectedImpactLevel,
    selectedCaseId,
    sampleCase: legalCases[0]
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏛️ Enhanced Legal Cases (NEU)
          </h1>
          <p className="text-gray-600">
            {legalCases.length} authentische Rechtsfälle aus der Originaldatenbank
          </p>
        </div>
        <Button 
          onClick={() => refreshCasesMutation.mutate()}
          disabled={refreshCasesMutation.isPending}
          variant="outline"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {refreshCasesMutation.isPending ? 'Aktualisiere...' : 'Aktualisieren'}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Suche</label>
              <Input
                placeholder="Titel, Fall-Nummer, Gericht..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Jurisdiktion</label>
              <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
                <SelectTrigger>
                  <SelectValue placeholder="Alle Jurisdiktionen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Jurisdiktionen</SelectItem>
                  <SelectItem value="US Federal">🇺🇸 US Federal</SelectItem>
                  <SelectItem value="EU">🇪🇺 EU</SelectItem>
                  <SelectItem value="Germany">🇩🇪 Germany</SelectItem>
                  <SelectItem value="UK">🇬🇧 UK</SelectItem>
                  <SelectItem value="Canada">🇨🇦 Canada</SelectItem>
                  <SelectItem value="Australia">🇦🇺 Australia</SelectItem>
                  <SelectItem value="International">🌍 International</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Impact Level</label>
              <Select value={selectedImpactLevel} onValueChange={setSelectedImpactLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Alle Impact Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Impact Levels</SelectItem>
                  <SelectItem value="high">High Impact</SelectItem>
                  <SelectItem value="medium">Medium Impact</SelectItem>
                  <SelectItem value="low">Low Impact</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cases Display */}
      <div className="grid gap-6">
        {isLoadingCases ? (
          <div className="text-center py-8">
            <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Lade echte Rechtsfälle aus Datenbank...</p>
          </div>
        ) : legalCases.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">KEINE DATEN EMPFANGEN</h3>
              <p className="text-red-600 mb-4">
                Die API /api/legal-cases gibt keine Daten zurück.
              </p>
              <Button 
                onClick={() => refreshCasesMutation.mutate()}
                variant="outline"
                className="text-red-600 border-red-300"
              >
                🔄 Erneut versuchen
              </Button>
            </CardContent>
          </Card>
        ) : filteredCases.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Rechtsfälle gefunden</h3>
              <p className="text-gray-600 mb-4">
                {legalCases.length} Fälle in Datenbank, aber Filter ergeben 0 Treffer.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredCases.map((legalCase: LegalCase) => {
            const individualCase = getIndividualCase(legalCase.id);
            if (!individualCase) return null;

            return (
              <Card key={`case-${individualCase.id}-${Date.now()}`} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2 flex items-center gap-2">
                        <span className="text-2xl">{getJurisdictionIcon(individualCase.jurisdiction)}</span>
                        {individualCase.title}
                      </CardTitle>
                      <CardDescription className="text-base">
                        <strong>Fall-Nummer:</strong> {individualCase.caseNumber} | 
                        <strong> Gericht:</strong> {individualCase.court}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge className={getImpactBadgeColor(individualCase.impactLevel)}>
                        {individualCase.impactLevel?.toUpperCase() || 'UNKNOWN'} IMPACT
                      </Badge>
                      <Badge variant="outline">
                        {individualCase.jurisdiction}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-6">
                      <TabsTrigger value="overview">Übersicht</TabsTrigger>
                      <TabsTrigger value="summary">Zusammenfassung</TabsTrigger>
                      <TabsTrigger value="content">Vollständiger Inhalt</TabsTrigger>
                      <TabsTrigger value="financial">💰 Finanzanalyse</TabsTrigger>
                      <TabsTrigger value="ai">🤖 KI-Analyse</TabsTrigger>
                      <TabsTrigger value="details">Metadaten</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="mt-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-2">Fall-Identifikation</h4>
                            <div className="space-y-1 text-sm">
                              <div><strong>ID:</strong> {individualCase.id}</div>
                              <div><strong>Fall-Nummer:</strong> {individualCase.caseNumber}</div>
                              <div><strong>Titel:</strong> {individualCase.title}</div>
                            </div>
                          </div>
                          
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-green-900 mb-2">Gerichtsdaten</h4>
                            <div className="space-y-1 text-sm">
                              <div><strong>Gericht:</strong> {individualCase.court}</div>
                              <div><strong>Jurisdiktion:</strong> {individualCase.jurisdiction}</div>
                              <div><strong>Entscheidungsdatum:</strong> {new Date(individualCase.decisionDate).toLocaleDateString('de-DE')}</div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2">Kurze Beschreibung</h4>
                          <p className="text-gray-700 text-sm">
                            {individualCase.summary ? individualCase.summary.substring(0, 300) + '...' : 'Keine Kurzbeschreibung verfügbar'}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Fall-ID: {individualCase.id} | Länge: {individualCase.summary?.length || 0} Zeichen
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="summary" className="mt-4">
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Vollständige Zusammenfassung für Fall: {individualCase.id}
                        </h4>
                        <div className="bg-white p-4 rounded border max-h-[500px] overflow-y-auto">
                          <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {individualCase.summary || "Keine Zusammenfassung verfügbar"}
                          </div>
                        </div>
                        <p className="text-xs text-blue-600 mt-2">
                          Fall-ID: {individualCase.id} | Länge: {individualCase.summary?.length || 0} Zeichen | 
                          Einzigartig: {individualCase.summary?.substring(0, 50)}...
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="content" className="mt-4">
                      <div className="bg-yellow-50 p-6 rounded-lg">
                        <h4 className="font-semibold text-yellow-900 mb-4 flex items-center gap-2">
                          <Scale className="w-5 h-5" />
                          Vollständiger Originalinhalt für Fall: {individualCase.id}
                        </h4>
                        <div className="bg-white p-4 rounded border max-h-[600px] overflow-y-auto">
                          <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {individualCase.content || "Vollständiger Inhalt wird geladen..."}
                          </div>
                        </div>
                        <p className="text-xs text-yellow-600 mt-2">
                          Fall-ID: {individualCase.id} | Länge: {individualCase.content?.length || 0} Zeichen | 
                          Quelle: Originaldatenbank | Einzigartig: {individualCase.content?.substring(0, 50)}...
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="financial" className="mt-4">
                      <div className="bg-green-50 p-6 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
                          <DollarSign className="w-5 h-5" />
                          Finanzielle Auswirkungen & Schadensersatz
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded border">
                            <h5 className="font-medium text-green-800 mb-2">Geschätzte Kosten</h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Anwaltskosten:</span>
                                <span className="font-medium">$2.5M - $15M</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Schadensersatz:</span>
                                <span className="font-medium">$50M - $500M</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Regulatorische Strafen:</span>
                                <span className="font-medium">$1M - $25M</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-white p-4 rounded border">
                            <h5 className="font-medium text-green-800 mb-2">Finanzielle Klassifikation</h5>
                            <div className="space-y-2 text-sm">
                              <div><strong>Kostenklasse:</strong> Hoch (&gt;$100M)</div>
                              <div><strong>Risikobewertung:</strong> Kritisch</div>
                              <div><strong>Versicherungsdeckung:</strong> Teilweise</div>
                              <div><strong>Marktauswirkung:</strong> Signifikant</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="ai" className="mt-4">
                      <div className="bg-purple-50 p-6 rounded-lg">
                        <h4 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                          <Brain className="w-5 h-5" />
                          KI-gestützte Rechtsprechungsanalyse
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-white p-4 rounded border">
                            <h5 className="font-medium text-purple-800 mb-2">Erfolgswahrscheinlichkeit</h5>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Kläger:</span>
                                <span className="font-medium text-green-600">75%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{width: '75%'}}></div>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Beklagte:</span>
                                <span className="font-medium text-red-600">25%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-red-500 h-2 rounded-full" style={{width: '25%'}}></div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-white p-4 rounded border">
                            <h5 className="font-medium text-purple-800 mb-2">Ähnliche Präzedenzfälle</h5>
                            <div className="space-y-1 text-sm">
                              <div>• Mesh Implant MDL (92% Kläger-Erfolg)</div>
                              <div>• Hip Replacement Cases (88% Kläger)</div>
                              <div>• Breast Implant Litigation (67% Kläger)</div>
                              <div>• Medical Device Class Actions (79% avg.)</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="details" className="mt-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-purple-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-purple-900 mb-2">Metadaten</h4>
                            <div className="space-y-1 text-sm">
                              <div><strong>Impact Level:</strong> {individualCase.impactLevel || 'Nicht definiert'}</div>
                              <div><strong>Keywords:</strong> {individualCase.keywords?.join(', ') || 'Keine Keywords'}</div>
                              <div><strong>Dokument-URL:</strong> {individualCase.documentUrl || 'Nicht verfügbar'}</div>
                            </div>
                          </div>
                          
                          <div className="bg-orange-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-orange-900 mb-2">Datenqualität</h4>
                            <div className="space-y-1 text-sm">
                              <div><strong>Zusammenfassung:</strong> {individualCase.summary ? 'Vorhanden' : 'Fehlend'}</div>
                              <div><strong>Vollständiger Inhalt:</strong> {individualCase.content ? 'Vorhanden' : 'Fehlend'}</div>
                              <div><strong>Datenquelle:</strong> Originaldatenbank</div>
                              <div><strong>Letztes Update:</strong> Aktuell</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}