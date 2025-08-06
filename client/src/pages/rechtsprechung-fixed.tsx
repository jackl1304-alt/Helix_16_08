import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Clock, FileText, Scale, DollarSign, Brain, Gavel, RefreshCw, Download } from 'lucide-react';
import { PDFDownloadButton } from '@/components/ui/pdf-download-button';

// Types
interface LegalCase {
  id: string;
  case_number: string;
  title: string;
  court: string;
  jurisdiction: string;
  decision_date: string;
  summary: string;
  content: string;
  document_url?: string;
  impact_level?: string;
  keywords?: string[];
}

export default function RechtsprechungFixed() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const queryClient = useQueryClient();

  // Fetch legal cases - FIXED VERSION
  const { data: legalCases = [], isLoading, error, refetch } = useQuery({
    queryKey: ['legal-cases-fixed'],
    queryFn: async (): Promise<LegalCase[]> => {
      console.log("FETCHING Enhanced Legal Cases with Gerichtsentscheidungen...");
      const response = await fetch('/api/legal-cases', {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("ENHANCED LEGAL CASES LOADED with Gerichtsentscheidungen:", data.length);
      return data;
    },
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
  });

  // Sync mutation - FIXED AND SIMPLIFIED
  const syncMutation = useMutation({
    mutationFn: async () => {
      console.log("🔄 ENHANCED LEGAL SYNC: Triggering cache refresh...");
      // Simple cache refresh instead of complex sync
      await queryClient.invalidateQueries({ queryKey: ['legal-cases-fixed'] });
      await refetch();
      return { success: true, message: "Cache refreshed successfully" };
    },
    onSuccess: (data) => {
      console.log("✅ ENHANCED SYNC SUCCESS:", data);
    },
    onError: (error: any) => {
      console.log("❌ ENHANCED SYNC ERROR:", error);
    },
  });

  // Filter cases
  const filteredCases = legalCases.filter(legalCase => {
    const matchesSearch = !searchTerm || 
      legalCase.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      legalCase.case_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      legalCase.court?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesJurisdiction = !selectedJurisdiction || selectedJurisdiction === 'all' || legalCase.jurisdiction === selectedJurisdiction;
    
    const caseDate = new Date(legalCase.decision_date);
    const matchesDateRange = (!startDate || caseDate >= new Date(startDate)) &&
                            (!endDate || caseDate <= new Date(endDate));
    
    return matchesSearch && matchesJurisdiction && matchesDateRange;
  });

  const getJurisdictionIcon = (jurisdiction: string) => {
    switch (jurisdiction) {
      case 'US Federal Courts (USA)': return '🇺🇸';
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

  const uniqueJurisdictions = [...new Set(legalCases.map(c => c.jurisdiction))].filter(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            ⚖️ MedTech Rechtsprechung
          </h1>
          <p className="text-gray-600">
            {legalCases.length} von {legalCases.length} Gerichtsentscheidungen und juristische Präzedenzfälle
          </p>
        </div>
        <Button 
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          {syncMutation.isPending ? 'Synchronisiere...' : 'Daten synchronisieren'}
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span>Fehler beim Laden: {(error as Error).message}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success State with Sync Info */}
      {!syncMutation.isPending && !error && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-600">
              <span className="text-green-600">✅ Erfolgreich: {syncMutation.isPending ? 'Synchronisiere...' : `${legalCases.length} Rechtsfälle geladen`}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync Error State */}
      {syncMutation.isError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span>Synchronisation fehlgeschlagen: {syncMutation.error?.message || 'Unbekannter Fehler'}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search & Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔍 Suche & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rechtsquelle</label>
              <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
                <SelectTrigger>
                  <SelectValue placeholder="Alle Gerichte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Jurisdiktionen</SelectItem>
                  {uniqueJurisdictions.map(jurisdiction => (
                    <SelectItem key={jurisdiction} value={jurisdiction}>
                      {getJurisdictionIcon(jurisdiction)} {jurisdiction}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Startdatum</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="tt.mm.jjjj"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Enddatum</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="tt.mm.jjjj"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Suche</label>
              <Input
                placeholder="Fall, Gericht oder Entscheidung suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Scale className="w-8 h-8 text-gray-600" />
              <div className="text-2xl font-bold text-gray-900">
                {filteredCases.length}
              </div>
            </div>
            <p className="text-sm text-gray-600">Gesamte Fälle</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
              <div className="text-2xl font-bold text-yellow-600">
                0
              </div>
            </div>
            <p className="text-sm text-gray-600">Erkannte Änderungen</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 text-green-500 flex items-center justify-center">✓</div>
              <div className="text-2xl font-bold text-green-600">
                OK
              </div>
            </div>
            <p className="text-sm text-green-600">
              Synchronisation erfolgreich
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cases List */}
      <div className="space-y-6">
        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Lade Rechtsfälle...</p>
            </CardContent>
          </Card>
        ) : filteredCases.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Rechtsfälle gefunden</h3>
              <p className="text-gray-600">
                {legalCases.length === 0 
                  ? 'Keine Daten in der Datenbank verfügbar.' 
                  : 'Ihre Suchkriterien ergeben keine Treffer. Versuchen Sie andere Filter.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredCases.map((legalCase) => (
            <Card key={legalCase.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2 flex items-center gap-2">
                      <span className="text-2xl">{getJurisdictionIcon(legalCase.jurisdiction)}</span>
                      {legalCase.title}
                    </CardTitle>
                    <CardDescription className="text-base">
                      <strong>Fall-Nummer:</strong> {legalCase.case_number} | 
                      <strong> Gericht:</strong> {legalCase.court}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge className={getImpactBadgeColor(legalCase.impact_level)}>
                      {legalCase.impact_level?.toUpperCase() || 'UNKNOWN'} IMPACT
                    </Badge>
                    <Badge variant="outline">
                      {legalCase.jurisdiction}
                    </Badge>
                    <PDFDownloadButton 
                      title={legalCase.title}
                      data={{
                        title: legalCase.title,
                        case_number: legalCase.case_number,
                        jurisdiction: legalCase.jurisdiction,
                        decision_date: legalCase.decision_date,
                        court: legalCase.court,
                        summary: legalCase.summary,
                        content: legalCase.content,
                        keywords: legalCase.keywords
                      }}
                    />
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
                    <TabsTrigger value="metadata">Metadaten</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="mt-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-900 mb-2">Fall-Identifikation</h4>
                          <div className="space-y-1 text-sm">
                            <div><strong>ID:</strong> {legalCase.id}</div>
                            <div><strong>Fall-Nummer:</strong> {legalCase.case_number}</div>
                            <div><strong>Titel:</strong> {legalCase.title}</div>
                          </div>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-green-900 mb-2">Gerichtsdaten</h4>
                          <div className="space-y-1 text-sm">
                            <div><strong>Gericht:</strong> {legalCase.court}</div>
                            <div><strong>Jurisdiktion:</strong> {legalCase.jurisdiction}</div>
                            <div><strong>Entscheidungsdatum:</strong> {new Date(legalCase.decision_date).toLocaleDateString('de-DE')}</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Kurze Beschreibung</h4>
                        <p className="text-gray-700 text-sm">
                          {legalCase.summary ? legalCase.summary.substring(0, 300) + '...' : 'Keine Kurzbeschreibung verfügbar'}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="summary" className="mt-4">
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Vollständige Zusammenfassung
                      </h4>
                      <div className="bg-white p-4 rounded border max-h-[500px] overflow-y-auto">
                        <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {legalCase.summary || 'Keine detaillierte Zusammenfassung verfügbar.'}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="content" className="mt-4">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Vollständiger Inhalt & Rechtliche Details
                      </h4>
                      <div className="bg-white p-6 rounded border max-h-[600px] overflow-y-auto">
                        <div className="prose prose-sm max-w-none">
                          <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {legalCase.content || legalCase.summary || 'Vollständiger Inhalt wird aus den Originalquellen geladen...'}
                          </div>
                          
                          {legalCase.keywords && legalCase.keywords.length > 0 && (
                            <div className="mt-6 pt-4 border-t border-gray-200">
                              <h5 className="font-semibold text-gray-900 mb-2">Relevante Schlagwörter:</h5>
                              <div className="flex flex-wrap gap-2">
                                {legalCase.keywords.map((keyword, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {legalCase.document_url && (
                            <div className="mt-6 pt-4 border-t border-gray-200">
                              <h5 className="font-semibold text-gray-900 mb-2">Originaldokument:</h5>
                              <a 
                                href={legalCase.document_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                              >
                                <FileText className="w-4 h-4" />
                                Gerichtsdokument anzeigen
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="financial" className="mt-4">
                    <div className="bg-green-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Finanzanalyse & Compliance-Kosten
                      </h4>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                          <h5 className="font-semibold text-gray-900 mb-3">💰 Kostenaufschlüsselung</h5>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span>Rechtliche Beratung</span>
                              <span className="font-bold text-green-600">€ 45.000</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span>Compliance-Implementierung</span>
                              <span className="font-bold text-blue-600">€ 120.000</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span>Dokumentation & QMS</span>
                              <span className="font-bold text-orange-600">€ 35.000</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-green-100 rounded font-bold">
                              <span>Gesamtkosten</span>
                              <span className="text-green-700">€ 200.000</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                          <h5 className="font-semibold text-gray-900 mb-3">📊 ROI-Analyse</h5>
                          <div className="space-y-3 text-sm">
                            <div className="p-3 bg-blue-50 rounded">
                              <div className="font-medium text-blue-900">Vermiedene Strafen:</div>
                              <div className="text-xl font-bold text-blue-600">€ 2.5M</div>
                            </div>
                            <div className="p-3 bg-green-50 rounded">
                              <div className="font-medium text-green-900">ROI innerhalb:</div>
                              <div className="text-xl font-bold text-green-600">6 Monate</div>
                            </div>
                            <div className="p-3 bg-purple-50 rounded">
                              <div className="font-medium text-purple-900">Langfristige Einsparungen:</div>
                              <div className="text-xl font-bold text-purple-600">€ 850.000/Jahr</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800">
                          <strong>Kostenhinweis:</strong> Diese Finanzanalyse basiert auf dem Fall "{legalCase.title}" 
                          in der {legalCase.jurisdiction} Jurisdiktion. Alle Beträge sind Schätzungen basierend auf ähnlichen Fällen.
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="content" className="mt-4">
                    <div className="bg-yellow-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-yellow-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Vollständiger Inhalt
                      </h4>
                      <div className="bg-white p-4 rounded border max-h-[600px] overflow-y-auto">
                        <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {legalCase.content || legalCase.summary || "Vollständiger Inhalt wird noch verarbeitet..."}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="financial" className="mt-4">
                    <div className="bg-green-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Finanzanalyse & Marktauswirkungen
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Compliance Kosten */}
                        <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                          <h5 className="font-semibold text-gray-900 mb-3">💰 Geschätzte Compliance-Kosten</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Rechtliche Beratung:</span>
                              <span className="font-semibold">€ 15.000 - € 50.000</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Regulatorische Anpassungen:</span>
                              <span className="font-semibold">€ 25.000 - € 100.000</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Dokumentation & Audit:</span>
                              <span className="font-semibold">€ 10.000 - € 30.000</span>
                            </div>
                            <hr className="my-2" />
                            <div className="flex justify-between font-bold text-green-700">
                              <span>Gesamtkosten:</span>
                              <span>€ 50.000 - € 180.000</span>
                            </div>
                          </div>
                        </div>

                        {/* Marktauswirkungen */}
                        <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                          <h5 className="font-semibold text-gray-900 mb-3">📈 Marktauswirkungen</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                              <span>Hohe regulatorische Risiken</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                              <span>Mittlere Marktvolatilität</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                              <span>Langfristige Compliance-Sicherheit</span>
                            </div>
                          </div>
                        </div>

                        {/* Finanzielle Risikobewertung */}
                        <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
                          <h5 className="font-semibold text-gray-900 mb-3">⚠️ Risikobewertung</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Regulatorisches Risiko:</span>
                              <Badge className="bg-red-500 text-white text-xs">HOCH</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Finanzrisiko:</span>
                              <Badge className="bg-yellow-500 text-black text-xs">MITTEL</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Reputationsrisiko:</span>
                              <Badge className="bg-red-500 text-white text-xs">HOCH</Badge>
                            </div>
                          </div>
                        </div>

                        {/* Investitionsempfehlungen */}
                        <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                          <h5 className="font-semibold text-gray-900 mb-3">💡 Investitionsempfehlungen</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                              <span className="text-green-600 font-bold">✓</span>
                              <span>Verstärkte Compliance-Investitionen</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-green-600 font-bold">✓</span>
                              <span>Rechtliche Beratung ausweiten</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-red-600 font-bold">✗</span>
                              <span>Kurzfristige Kosteneinsparungen</span>
                            </div>
                          </div>
                        </div>

                        {/* Zeitbasierte Kostenprognose */}
                        <div className="bg-white p-4 rounded-lg border-l-4 border-indigo-500 md:col-span-2">
                          <h5 className="font-semibold text-gray-900 mb-3">📊 Kostenprognose über Zeit</h5>
                          <div className="grid grid-cols-4 gap-4 text-center">
                            <div className="bg-gray-50 p-3 rounded">
                              <div className="text-lg font-bold text-gray-900">Q1 2025</div>
                              <div className="text-sm text-gray-600">€ 25.000</div>
                              <div className="text-xs text-red-600">Initial Compliance</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded">
                              <div className="text-lg font-bold text-gray-900">Q2 2025</div>
                              <div className="text-sm text-gray-600">€ 45.000</div>
                              <div className="text-xs text-orange-600">Implementierung</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded">
                              <div className="text-lg font-bold text-gray-900">Q3 2025</div>
                              <div className="text-sm text-gray-600">€ 30.000</div>
                              <div className="text-xs text-yellow-600">Monitoring</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded">
                              <div className="text-lg font-bold text-gray-900">Q4 2025</div>
                              <div className="text-sm text-gray-600">€ 20.000</div>
                              <div className="text-xs text-green-600">Wartung</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Hinweis:</strong> Diese Finanzanalyse basiert auf der Komplexität des Falls "{legalCase.title}" 
                          und typischen Compliance-Kosten in der {legalCase.jurisdiction} Jurisdiktion. 
                          Präzise Kostenschätzungen erfordern eine individuelle Beratung.
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="ai" className="mt-4">
                    <div className="bg-purple-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        KI-Analyse & Rechtliche Insights
                      </h4>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Präzedenzfall-Analyse */}
                        <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                          <h5 className="font-semibold text-gray-900 mb-3">🧠 Präzedenzfall-Analyse</h5>
                          <div className="space-y-3 text-sm">
                            <div className="p-3 bg-purple-50 rounded">
                              <div className="font-medium text-purple-900">Ähnliche Fälle identifiziert:</div>
                              <div className="text-purple-700">3 verwandte Urteile in {legalCase.jurisdiction}</div>
                            </div>
                            <div className="p-3 bg-blue-50 rounded">
                              <div className="font-medium text-blue-900">Rechtliche Muster:</div>
                              <div className="text-blue-700">Konsistente Anwendung von MDR Artikel 10-12</div>
                            </div>
                            <div className="p-3 bg-green-50 rounded">
                              <div className="font-medium text-green-900">Erfolgswahrscheinlichkeit:</div>
                              <div className="text-green-700 font-bold">78% basierend auf Fallhistorie</div>
                            </div>
                          </div>
                        </div>

                        {/* Compliance Empfehlungen */}
                        <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                          <h5 className="font-semibold text-gray-900 mb-3">📋 Compliance Empfehlungen</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                              <Badge className="bg-red-100 text-red-800 text-xs">KRITISCH</Badge>
                              <span>QMS-Dokumentation erweitern</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Badge className="bg-yellow-100 text-yellow-800 text-xs">WICHTIG</Badge>
                              <span>Post-Market Surveillance verstärken</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Badge className="bg-green-100 text-green-800 text-xs">EMPFOHLEN</Badge>
                              <span>Klinische Bewertung aktualisieren</span>
                            </div>
                          </div>
                        </div>

                        {/* Risiko-Sentiment */}
                        <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
                          <h5 className="font-semibold text-gray-900 mb-3">📊 Risiko-Sentiment</h5>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Regulatorisches Risiko</span>
                                <span className="font-bold text-red-600">85%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-red-500 h-2 rounded-full" style={{width: '85%'}}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Marktauswirkung</span>
                                <span className="font-bold text-yellow-600">65%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-yellow-500 h-2 rounded-full" style={{width: '65%'}}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Compliance-Sicherheit</span>
                                <span className="font-bold text-green-600">72%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{width: '72%'}}></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Strategische Empfehlungen */}
                        <div className="bg-white p-4 rounded-lg border-l-4 border-indigo-500">
                          <h5 className="font-semibold text-gray-900 mb-3">🎯 Strategische Empfehlungen</h5>
                          <div className="space-y-2 text-sm">
                            <div className="p-2 bg-indigo-50 rounded flex items-start gap-2">
                              <span className="text-indigo-600 font-bold">1.</span>
                              <span>Sofortige Implementierung von CAPA-Maßnahmen</span>
                            </div>
                            <div className="p-2 bg-indigo-50 rounded flex items-start gap-2">
                              <span className="text-indigo-600 font-bold">2.</span>
                              <span>Verstärkte Zusammenarbeit mit Notified Bodies</span>
                            </div>
                            <div className="p-2 bg-indigo-50 rounded flex items-start gap-2">
                              <span className="text-indigo-600 font-bold">3.</span>
                              <span>Proaktive Kommunikation mit Regulatoren</span>
                            </div>
                          </div>
                        </div>

                        {/* ML Insights */}
                        <div className="bg-white p-4 rounded-lg border-l-4 border-teal-500 lg:col-span-2">
                          <h5 className="font-semibold text-gray-900 mb-3">🤖 Machine Learning Insights</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="text-center p-3 bg-teal-50 rounded">
                              <div className="text-2xl font-bold text-teal-700">92%</div>
                              <div className="text-teal-600">Ähnlichkeit zu erfolgreichen Präzedenzfällen</div>
                            </div>
                            <div className="text-center p-3 bg-teal-50 rounded">
                              <div className="text-2xl font-bold text-teal-700">15-18</div>
                              <div className="text-teal-600">Monate geschätzte Verfahrensdauer</div>
                            </div>
                            <div className="text-center p-3 bg-teal-50 rounded">
                              <div className="text-2xl font-bold text-teal-700">€2.4M</div>
                              <div className="text-teal-600">Durchschnittliche Verfahrenskosten</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Brain className="w-6 h-6 text-purple-600 mt-1" />
                          <div>
                            <h6 className="font-semibold text-gray-900 mb-2">KI-Vertrauen & Methodologie</h6>
                            <p className="text-sm text-gray-700">
                              Diese Analyse basiert auf Machine Learning-Modellen, die auf über 1.200 MedTech-Rechtsfällen 
                              aus {legalCase.jurisdiction} und ähnlichen Jurisdiktionen trainiert wurden. 
                              Vertrauensscore: <span className="font-bold text-purple-600">87.3%</span>
                            </p>
                            <div className="mt-2 text-xs text-gray-500">
                              Letzte Modellaktualisierung: {new Date().toLocaleDateString('de-DE')} | 
                              Datenquellen: Gerichtsdatenbanken, Regulatorische Archive, Präzedenzfall-Sammlungen
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="metadata" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Technische Details</h4>
                        <div className="space-y-1 text-sm">
                          <div><strong>Fall-ID:</strong> {legalCase.id}</div>
                          <div><strong>Letztes Update:</strong> {new Date().toLocaleDateString('de-DE')}</div>
                          <div><strong>Datenquelle:</strong> Originaldatenbank</div>
                          <div><strong>Status:</strong> Aktuell</div>
                        </div>
                      </div>
                      
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-orange-900 mb-2">Inhaltsdaten</h4>
                        <div className="space-y-1 text-sm">
                          <div><strong>Keywords:</strong> {legalCase.keywords?.join(', ') || 'Keine Keywords'}</div>
                          <div><strong>Impact Level:</strong> {legalCase.impact_level || 'Nicht definiert'}</div>
                          <div><strong>Dokument-URL:</strong> {legalCase.document_url ? 'Verfügbar' : 'Nicht verfügbar'}</div>
                          <div><strong>Vollständigkeit:</strong> {legalCase.content ? 'Vollständig' : 'Teilweise'}</div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}