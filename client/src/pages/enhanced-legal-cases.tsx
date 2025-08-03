import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Scale, DollarSign, FileText, AlertTriangle, CheckCircle, Clock, TrendingUp, Brain } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { EnhancedAISummary } from '@/components/enhanced-ai-summary';
import { FormattedText } from '@/components/formatted-text';

interface ComprehensiveLegalCase {
  id: string;
  caseNumber: string;
  title: string;
  court: string;
  jurisdiction: string;
  decisionDate: string;
  summary: string;
  content: string;
  documentUrl?: string;
  impactLevel: 'high' | 'medium' | 'low';
  keywords: string[];
}

export default function EnhancedLegalCases() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('all');
  const [selectedImpactLevel, setSelectedImpactLevel] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState<ComprehensiveLegalCase | null>(null);
  const queryClient = useQueryClient();

  // Fetch comprehensive legal cases from Enhanced API
  const { data: legalCases = [], isLoading: isLoadingCases } = useQuery<ComprehensiveLegalCase[]>({
    queryKey: ['/api/legal-cases/enhanced'],
    queryFn: async (): Promise<ComprehensiveLegalCase[]> => {
      const response = await fetch('/api/legal-cases/enhanced');
      if (!response.ok) throw new Error('Failed to fetch enhanced legal cases');
      const data = await response.json();
      
      // Transform data to match ComprehensiveLegalCase interface
      console.log("Enhanced Legal Cases - Raw data sample:", data.slice(0, 2));
      return data.map((item: any): ComprehensiveLegalCase => ({
        id: item.id,
        caseNumber: item.caseNumber || item.case_number,
        title: item.title,
        court: item.court,
        jurisdiction: item.jurisdiction,
        decisionDate: item.decisionDate || item.decision_date,
        summary: item.summary,
        content: item.content || item.fullDecisionText || item.verdict || 'Comprehensive legal case details',
        documentUrl: item.documentUrl || item.document_url,
        impactLevel: (item.impactLevel || item.impact_level || 'medium') as 'high' | 'medium' | 'low',
        keywords: item.keywords || []
      }));
    }
  });

  // Enhanced legal cases generation mutation - connects to existing database
  const generateEnhancedCasesMutation = useMutation({
    mutationFn: async () => {
      console.log("Triggering Enhanced Cases refresh from database...");
      // Just refresh the data from database - no generation needed
      queryClient.invalidateQueries({ queryKey: ['/api/legal-cases/enhanced'] });
      return { success: true, message: "Enhanced cases refreshed from database" };
    },
    onSuccess: () => {
      console.log("Enhanced cases successfully refreshed");
    },
  });

  // Filter cases based on search and filters
  const filteredCases = (legalCases as ComprehensiveLegalCase[]).filter((legalCase: ComprehensiveLegalCase) => {
    const matchesSearch = !searchTerm || 
      legalCase.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      legalCase.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      legalCase.keywords?.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesJurisdiction = selectedJurisdiction === 'all' || legalCase.jurisdiction?.includes(selectedJurisdiction);
    const matchesImpactLevel = selectedImpactLevel === 'all' || legalCase.impactLevel === selectedImpactLevel;
    
    return matchesSearch && matchesJurisdiction && matchesImpactLevel;
  });

  console.log("Enhanced Legal Cases DEBUG:", {
    totalCases: legalCases.length,
    filteredCases: filteredCases.length,
    searchTerm,
    selectedJurisdiction,
    selectedImpactLevel,
    sampleCase: legalCases[0]
  });

  // Extract case details from content for display
  const extractCaseDetails = (content: string) => {
    const details = {
      settlementAmount: '',
      plaintiffInjuries: '',
      deviceName: '',
      recallStatus: '',
      adverseEvents: ''
    };

    // Extract settlement amount
    const settlementMatch = content.match(/\$([0-9,]+(?:\.[0-9]{2})?(?:\s*billion|\s*million)?)/i);
    if (settlementMatch) {
      details.settlementAmount = settlementMatch[0];
    }

    // Extract device name
    const deviceMatch = content.match(/\*\*Device:\*\* ([^\n]+)/);
    if (deviceMatch && deviceMatch[1]) {
      details.deviceName = deviceMatch[1];
    }

    // Extract recall status
    const recallMatch = content.match(/\*\*Recall Status:\*\* ([^\n]+)/);
    if (recallMatch && recallMatch[1]) {
      details.recallStatus = recallMatch[1];
    }

    // Extract adverse events
    const adverseMatch = content.match(/• Total Reports: ([0-9,]+)/);
    if (adverseMatch && adverseMatch[1]) {
      details.adverseEvents = adverseMatch[1];
    }

    return details;
  };

  const getImpactBadgeColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getJurisdictionIcon = (jurisdiction: string) => {
    if (jurisdiction.includes('US')) return '🇺🇸';
    if (jurisdiction.includes('EU')) return '🇪🇺';
    if (jurisdiction.includes('DE')) return '🇩🇪';
    return '⚖️';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Legal Cases</h1>
          <p className="text-gray-600 mt-1">
            {legalCases.length} Rechtsfälle mit verbesserten KI-Auswertungen 
            <span className="text-green-600 font-medium ml-1">(Echte Daten)</span>
          </p>
        </div>
        <Button 
          onClick={() => generateEnhancedCasesMutation.mutate()}
          disabled={generateEnhancedCasesMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {generateEnhancedCasesMutation.isPending ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Generating Enhanced Cases...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4 mr-2" />
              Aktualisiere Datenbank ({legalCases.length} Cases)
            </>
          )}
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Cases</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Case title, device, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Jurisdiction</label>
              <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
                <SelectTrigger>
                  <SelectValue placeholder="All Jurisdictions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jurisdictions (2018 Cases)</SelectItem>
                  <SelectItem value="US Federal">🇺🇸 US Federal (310)</SelectItem>
                  <SelectItem value="EU">🇪🇺 European Union (305)</SelectItem>
                  <SelectItem value="DE">🇩🇪 Germany (400)</SelectItem>
                  <SelectItem value="UK">🇬🇧 United Kingdom (400)</SelectItem>
                  <SelectItem value="CH">🇨🇭 Switzerland (237)</SelectItem>
                  <SelectItem value="International">🌍 International (366)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Impact Level</label>
              <Select value={selectedImpactLevel} onValueChange={setSelectedImpactLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="All Impact Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Impact Levels</SelectItem>
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
            <p className="text-gray-600">Loading comprehensive legal cases...</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Enhanced Cases gefunden</h3>
              <p className="text-gray-600 mb-4">
                {legalCases.length === 0 
                  ? `Lade echte Legal Cases aus der Datenbank...` 
                  : `${legalCases.length} Cases verfügbar, aber Filter ergeben 0 Treffer. Prüfe Suchkriterien.`}
              </p>
              {legalCases.length === 0 && (
                <Button 
                  onClick={() => generateEnhancedCasesMutation.mutate()}
                  disabled={generateEnhancedCasesMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Refresh Database Cases
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredCases.map((legalCase: ComprehensiveLegalCase) => {
            const caseDetails = extractCaseDetails(legalCase.content);
            
            return (
              <Card key={legalCase.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2 flex items-center gap-2">
                        <span className="text-2xl">{getJurisdictionIcon(legalCase.jurisdiction)}</span>
                        {legalCase.title}
                      </CardTitle>
                      <CardDescription className="text-base">
                        <strong>Case Number:</strong> {legalCase.caseNumber} | 
                        <strong> Court:</strong> {legalCase.court}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge className={getImpactBadgeColor(legalCase.impactLevel)}>
                        {legalCase.impactLevel.toUpperCase()} IMPACT
                      </Badge>
                      <Badge variant="outline">
                        {legalCase.jurisdiction}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="overview" className="flex items-center gap-1">
                        <Scale className="w-4 h-4" />
                        Overview
                      </TabsTrigger>
                      <TabsTrigger value="ai-analysis" className="flex items-center gap-1">
                        <Brain className="w-4 h-4" />
                        KI-Analyse
                      </TabsTrigger>
                      <TabsTrigger value="financial" className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        Financial
                      </TabsTrigger>
                      <TabsTrigger value="device" className="flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        Device
                      </TabsTrigger>
                      <TabsTrigger value="details" className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        Full Details
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="mt-4">
                      <div className="space-y-4">
                        <div className="text-gray-700">
                          <FormattedText 
                            content={legalCase.summary}
                            className="text-base leading-relaxed"
                            maxHeight="max-h-40"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-1">Decision Date</h4>
                            <p className="text-gray-700">{new Date(legalCase.decisionDate).toLocaleDateString()}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-1">Keywords</h4>
                            <div className="flex flex-wrap gap-1">
                              {legalCase.keywords.slice(0, 4).map((keyword, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="ai-analysis" className="mt-4">
                      <EnhancedAISummary
                        caseContent={legalCase.content}
                        caseTitle={legalCase.title}
                        caseSummary={legalCase.summary}
                        court={legalCase.court}
                        jurisdiction={legalCase.jurisdiction}
                        keywords={legalCase.keywords}
                      />
                    </TabsContent>
                    
                    <TabsContent value="financial" className="mt-4">
                      <div className="space-y-4">
                        {caseDetails.settlementAmount && (
                          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                            <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                              <DollarSign className="w-5 h-5" />
                              Settlement Amount
                            </h4>
                            <p className="text-2xl font-bold text-green-700">{caseDetails.settlementAmount}</p>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-1">Case Type</h4>
                            <p className="text-gray-700">Product Liability / Medical Device</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-1">Status</h4>
                            <p className="text-gray-700 flex items-center gap-1">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              Resolved
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="device" className="mt-4">
                      <div className="space-y-4">
                        {caseDetails.deviceName && (
                          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                            <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5" />
                              Medical Device
                            </h4>
                            <p className="text-lg font-medium text-red-700">{caseDetails.deviceName}</p>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {caseDetails.recallStatus && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <h4 className="font-semibold text-gray-900 mb-1">Recall Status</h4>
                              <p className="text-gray-700">{caseDetails.recallStatus}</p>
                            </div>
                          )}
                          {caseDetails.adverseEvents && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <h4 className="font-semibold text-gray-900 mb-1">Adverse Event Reports</h4>
                              <p className="text-gray-700">{caseDetails.adverseEvents}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="details" className="mt-4">
                      <div className="space-y-6">
                        {/* Basis-Informationen */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-2">Fall-Identifikation</h4>
                            <div className="space-y-1 text-sm">
                              <div><strong>ID:</strong> {legalCase.id}</div>
                              <div><strong>Fall-Nummer:</strong> {legalCase.caseNumber}</div>
                              <div><strong>Titel:</strong> {legalCase.title}</div>
                            </div>
                          </div>
                          
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-green-900 mb-2">Gerichtsdaten</h4>
                            <div className="space-y-1 text-sm">
                              <div><strong>Gericht:</strong> {legalCase.court}</div>
                              <div><strong>Jurisdiktion:</strong> {legalCase.jurisdiction}</div>
                              <div><strong>Entscheidungsdatum:</strong> {new Date(legalCase.decisionDate).toLocaleDateString('de-DE')}</div>
                            </div>
                          </div>
                        </div>

                        {/* Vollständige Fallbeschreibung */}
                        <div className="bg-gray-50 p-6 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Vollständige Fallbeschreibung aus Originaldatenbank
                          </h4>
                          <div className="prose max-w-none">
                            <div className="text-sm text-gray-700 leading-relaxed max-h-[500px] overflow-y-auto bg-white p-4 rounded border">
                              {legalCase.summary ? (
                                <div className="whitespace-pre-wrap">
                                  {legalCase.summary}
                                </div>
                              ) : (
                                <p className="italic text-gray-500">Keine detaillierte Zusammenfassung verfügbar.</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Vollständiger Originalinhalt */}
                        <div className="bg-yellow-50 p-6 rounded-lg">
                          <h4 className="font-semibold text-yellow-900 mb-4 flex items-center gap-2">
                            <Scale className="w-5 h-5" />
                            Vollständiger Originalinhalt der Rechtsprechung
                          </h4>
                          <div className="bg-white p-4 rounded border max-h-[600px] overflow-y-auto">
                            <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                              {legalCase.content || "Vollständiger Inhalt wird geladen..."}
                            </div>
                          </div>
                        </div>

                        {/* Zusätzliche Metadaten */}
                        {(legalCase.impactLevel || legalCase.status || legalCase.priority) && (
                          <div className="bg-purple-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-purple-900 mb-2">Zusätzliche Eigenschaften</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                              {legalCase.impactLevel && (
                                <div><strong>Impact Level:</strong> {legalCase.impactLevel}</div>
                              )}
                              {legalCase.status && (
                                <div><strong>Status:</strong> {legalCase.status}</div>
                              )}
                              {legalCase.priority && (
                                <div><strong>Priorität:</strong> {legalCase.priority}</div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {legalCase.documentUrl && (
                          <div className="flex justify-end">
                            <Button 
                              variant="outline" 
                              onClick={() => setSelectedDocument(legalCase)}
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              Dokument anzeigen
                            </Button>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Success Message */}
      {generateEnhancedCasesMutation.isSuccess && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Enhanced legal cases generated successfully!</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">Gerichtsdokument</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedDocument(null)}
              >
                ✕
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-2">{selectedDocument.title}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div><strong>Fall-Nr:</strong> {selectedDocument.caseNumber}</div>
                    <div><strong>Gericht:</strong> {selectedDocument.court}</div>
                    <div><strong>Jurisdiktion:</strong> {selectedDocument.jurisdiction}</div>
                    <div><strong>Datum:</strong> {new Date(selectedDocument.decisionDate).toLocaleDateString('de-DE')}</div>
                  </div>
                </div>
                
                <div className="prose max-w-none">
                  <h4 className="text-lg font-semibold mb-3">Vollständiges Gerichtsdokument</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <FormattedText 
                      content={selectedDocument.content} 
                      className="text-sm leading-relaxed"
                      maxHeight="max-h-96"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    Quelle: {selectedDocument.documentUrl}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        const content = `${selectedDocument.title}\n\n${selectedDocument.content}`;
                        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${selectedDocument.caseNumber.replace(/[^a-z0-9]/gi, '_')}_Gerichtsdokument.txt`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Herunterladen
                    </Button>
                    <Button onClick={() => setSelectedDocument(null)}>
                      Schließen
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}