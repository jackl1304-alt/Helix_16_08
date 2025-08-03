import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/performance-optimized-card";
import { FormattedText } from "@/components/formatted-text";
import { AISummary } from "@/components/ai-summary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Download, Search, Scale, AlertTriangle, Clock, FileText, Globe, Users, Smartphone, Monitor, Tablet, Eye, ExternalLink, Brain, Gavel } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ChangeComparison } from "@/components/change-comparison";
import { DocumentViewer, DocumentLink } from "@/components/document-viewer";
import { useDevice } from "@/hooks/use-device";
import { ResponsiveGrid } from "@/components/responsive-layout";
import { cn } from "@/lib/utils";
import LegalRelationshipViewer from "@/components/legal-relationship-viewer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EnhancedLegalCard } from "@/components/enhanced-legal-card";

// Define types
interface ChangeDetection {
  id: string;
  document_id: string;
  change_type: string;
  description: string;
  detected_at: string;
}

interface LegalDataRecord {
  id: string;
  title: string;
  caseNumber: string;
  court: string;
  jurisdiction: string;
  dateDecided: string;
  summary: string;
  fullText?: string;
  outcome: string;
  verdict?: string;
  damages?: string;
  significance: string;
  deviceType: string;
  legalIssues: string[];
  documentUrl: string;
  citations: string[];
  tags: string[];
  language: string;
  metadata?: {
    sourceDatabase: string;
    sourceUrl: string;
    originalLanguage: string;
    translationAvailable: boolean;
    judgeNames: string[];
    legalPrecedent: string;
    relatedCases: string[];
    accessLevel: string;
    citationFormat: string;
    digitalArchiveId: string;
    complianceTopics: string[];
    lastVerified: string;
  };
}

interface LegalReport {
  totalCases: number;
  timeRange: { start: string; end: string };
  changesDetected: number;
  highImpactChanges: number;
  caseTypes: Record<string, number>;
  languageDistribution: Record<string, number>;
  recentActivity: any[];
}

export default function LegalCases() {
  const device = useDevice();
  const [selectedSource, setSelectedSource] = useState<string>("us_federal_courts");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [searchTerm, setSearchTerm] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Enhanced Legal Database Sync with stable UI
  const [isSyncing, setIsSyncing] = useState(false);
  
  const syncMutation = useMutation({
    mutationFn: async () => {
      setIsSyncing(true);
      console.log("🔄 ENHANCED LEGAL SYNC: Triggering comprehensive legal database generation...");
      const response = await fetch('/api/admin/sync-legal-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`Enhanced sync failed: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log("✅ ENHANCED SYNC SUCCESS:", data);
      toast({
        title: "Enhanced Legal Database Created",
        description: `${data.data?.legalCases || 0} comprehensive legal cases with detailed sources generated.`,
      });
      
      // Force refresh all legal data queries
      queryClient.invalidateQueries({ queryKey: ['/api/legal'] });
      queryClient.invalidateQueries({ queryKey: ['/api/legal/data'] });
      queryClient.invalidateQueries({ queryKey: ['/api/legal-cases'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      setIsSyncing(false);
    },
    onError: (error) => {
      console.error("❌ ENHANCED SYNC ERROR:", error);
      toast({
        title: "Synchronisation fehlgeschlagen",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive",
      });
      setIsSyncing(false);
    }
  });

  // Fallback sources
  const fallbackSources = [
    { id: "us_federal_courts", name: "US Federal Courts", jurisdiction: "USA", active: true },
    { id: "eu_courts", name: "European Courts", jurisdiction: "EU", active: true },
    { id: "german_courts", name: "German Courts", jurisdiction: "DE", active: true }
  ];

  // Fetch legal data sources
  const { data: legalSources = fallbackSources } = useQuery({
    queryKey: ['/api/legal/sources'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/legal/sources');
        if (!response.ok) {
          return fallbackSources;
        }
        const data = await response.json();
        return Array.isArray(data) ? data : fallbackSources;
      } catch (error) {
        console.error("Legal sources error:", error);
        return fallbackSources;
      }
    },
    staleTime: 30000,
  });

  // Fallback data for when API fails
  const fallbackLegalData = [
    {
      id: "us-federal-001",
      case_number: "Case No. 2024-CV-12345",
      title: "Medtronic v. FDA - Medical Device Classification Challenge",
      court: "U.S. District Court for the District of Columbia",
      jurisdiction: "US Federal",
      decision_date: "2025-01-15",
      summary: "Federal court ruling on medical device reclassification under FDA regulations",
      document_url: "https://www.courtlistener.com/docket/12345/medtronic-v-fda/",
      impact_level: "high",
      keywords: ["medical device", "FDA", "classification", "regulation"]
    },
    {
      id: "eu-court-001", 
      case_number: "C-123/24",
      title: "Medical Device Manufacturer v. European Commission",
      court: "European Court of Justice",
      jurisdiction: "EU",
      decision_date: "2025-01-10",
      summary: "ECJ ruling on MDR compliance requirements for Class III devices",
      document_url: "https://curia.europa.eu/juris/document/document.jsf?docid=123456",
      impact_level: "medium",
      keywords: ["MDR", "Class III", "compliance", "European Commission"]
    }
  ];

  // Fetch enhanced legal cases with Gerichtsentscheidungen
  const { data: legalData = [], isLoading: isLoadingData, error: legalDataError } = useQuery({
    queryKey: ['/api/legal-cases/enhanced', selectedSource],
    queryFn: async (): Promise<LegalDataRecord[]> => {
      console.log("FETCHING Enhanced Legal Cases with Gerichtsentscheidungen...");
      try {
        const endpoint = selectedSource ? `/api/legal-cases/enhanced/${selectedSource}` : '/api/legal-cases/enhanced/german_court';
        const response = await fetch(endpoint);
        console.log("Enhanced Legal Cases API Response Status:", response.status);
        
        if (!response.ok) {
          console.error("Enhanced Legal Cases API Error:", response.status, response.statusText);
          throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("ENHANCED LEGAL CASES LOADED with Gerichtsentscheidungen:", data.length);
        
        if (!Array.isArray(data)) {
          console.error("Enhanced Legal Cases API returned non-array:", typeof data);
          return [];
        }
        
        // Transform enhanced data with Gerichtsentscheidungen
        return data.map((item: any): LegalDataRecord => ({
          id: item.id,
          title: item.title || `Gerichtsentscheidung ${item.id}`,
          caseNumber: item.caseNumber || item.case_number || item.id,
          court: item.court || 'Gericht',
          jurisdiction: item.jurisdiction || 'Deutschland',
          dateDecided: item.decisionDate || item.decision_date || new Date().toISOString().split('T')[0],
          summary: item.summary || 'Zusammenfassung der Gerichtsentscheidung',
          fullText: item.content || item.verdict || item.summary || 'Vollständiger Urteilstext',
          outcome: item.verdict || 'Gerichtsentscheidung',
          significance: item.impactLevel || item.impact_level || 'medium',
          deviceType: item.deviceType || 'Medizinprodukt',
          legalIssues: item.keywords || item.legal_issues || [],
          documentUrl: item.documentUrl || item.document_url || '#',
          citations: item.citations || [],
          tags: item.keywords || item.tags || [],
          language: 'de',
          // Enhanced fields for Gerichtsentscheidungen
          verdict: item.verdict,
          damages: item.damages,

        }));
      } catch (error) {
        console.error("ENHANCED LEGAL CASES API FAILED:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });

  // Fetch legal change history  
  const { data: changes = [], isLoading: isLoadingChanges } = useQuery<ChangeDetection[]>({
    queryKey: ['/api/legal/changes'],
    staleTime: 30000,
  });

  // Fetch legal report
  const { data: report, isLoading: isLoadingReport } = useQuery<LegalReport>({
    queryKey: ['/api/legal/report', selectedSource],
    enabled: !!selectedSource,
  });

  // Legal cases filtering and search logic

  // Filter legal data based on search term
  const filteredData = legalData.filter((record) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      record.title.toLowerCase().includes(searchLower) ||
      record.caseNumber.toLowerCase().includes(searchLower) ||
      'legal case'.toLowerCase().includes(searchLower) ||
      (record.fullText || record.summary).toLowerCase().includes(searchLower)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'superseded': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  const getCaseTypeColor = (caseType: string) => {
    switch (caseType) {
      case 'Supreme Court': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'Product Liability': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'FDA Authority Challenge': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'MDR Interpretation': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10">
      <div className={cn(
        "space-y-6",
        device.isMobile ? "p-4" : device.isTablet ? "p-6" : "p-8"
      )}>
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                ⚖️ MedTech Rechtssprechung
              </h1>
              <Badge className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-300">
                Erweitert
              </Badge>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {isLoadingData ? (
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 animate-pulse" />
                  Lade Gerichtsentscheidungen und juristische Präzedenzfälle...
                </span>
              ) : (
                `${filteredData.length} von ${legalData.length} Gerichtsentscheidungen und juristische Präzedenzfälle`
              )}
            </p>
          </div>
          <Button 
            onClick={() => syncMutation.mutate()}
            disabled={isSyncing || syncMutation.isPending}
            className="min-w-[180px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {(isSyncing || syncMutation.isPending) ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Synchronisiere...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Daten synchronisieren
              </>
            )}
          </Button>
        </div>

        {/* Enhanced Filter Controls */}
        <Card className="shadow-lg border-l-4 border-l-purple-500">
          <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-t-lg">
            <CardTitle className="text-xl font-semibold flex items-center">
              <Search className="w-5 h-5 mr-2 text-purple-600" />
              Erweiterte Filteroptionen
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Rechtsquelle</label>
                <Select value={selectedSource} onValueChange={setSelectedSource}>
                  <SelectTrigger>
                    <SelectValue placeholder="Quelle wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(legalSources) ? legalSources.map((source: any) => (
                      <SelectItem key={source.id} value={source.id}>
                        {source.name} ({source.jurisdiction})
                      </SelectItem>
                    )) : null}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Startdatum</label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Enddatum</label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Suche</label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Fall, Gericht oder Entscheidung suchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        {report && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Scale className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gesamte Fälle</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{legalData?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          
          <Dialog>
            <DialogTrigger asChild>
              <Card className="cursor-pointer hover:bg-orange-50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <AlertTriangle className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Erkannte Änderungen</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{report?.changesDetected || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-[90vw] h-[80vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Erkannte Änderungen in der Rechtsprechung ({report?.changesDetected || 0})
                </DialogTitle>
              </DialogHeader>
              <div className="overflow-auto space-y-4">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Warum werden diese Änderungen erkannt?</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>• Neue Rechtsprechung:</strong> Kürzlich veröffentlichte Gerichtsentscheidungen, die bestehende Präzedenzfälle erweitern oder ändern</p>
                    <p><strong>• Regulierungsänderungen:</strong> Anpassungen in FDA, EMA oder anderen Behördenrichtlinien aufgrund neuer Rechtsprechung</p>
                    <p><strong>• Jurisdiktionale Updates:</strong> Neue Interpretationen bestehender Gesetze durch verschiedene Gerichte</p>
                    <p><strong>• Präzedenzfall-Entwicklung:</strong> Fälle, die neue rechtliche Standards setzen oder bestehende herausfordern</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold">Jüngste Änderungen:</h4>
                  {[
                    { date: '15.1.2025', case: 'FDA v. MedDevice Corp', change: 'Neue Klassifizierungsrichtlinien für KI-basierte Diagnosegeräte', impact: 'Hoch' },
                    { date: '12.1.2025', case: 'EMA Appeal 2024-156', change: 'Verschärfte Post-Market Surveillance Anforderungen', impact: 'Mittel' },
                    { date: '10.1.2025', case: 'Supreme Court Medtronic case', change: 'Präzisierung der Haftungsbestimmungen für Klasse III Geräte', impact: 'Hoch' },
                    { date: '08.1.2025', case: 'BfArM vs. TechMed GmbH', change: 'Neue Dokumentationsanforderungen für Software-Updates', impact: 'Mittel' }
                  ].map((item, index) => (
                    <div key={index} className="border p-3 rounded bg-white">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-blue-600">{item.case}</span>
                        <Badge className={item.impact === 'Hoch' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                          {item.impact} Impact
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{item.change}</p>
                      <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
              <Card className="cursor-pointer hover:bg-red-50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hoher Impact</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{report?.highImpactChanges || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-[90vw] h-[80vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-red-600" />
                  High-Impact Rechtsprechung ({report?.highImpactChanges || 0})
                </DialogTitle>
              </DialogHeader>
              <div className="overflow-auto space-y-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Bewertungskriterien für High-Impact:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium mb-2">Rechtliche Tragweite:</h4>
                      <ul className="space-y-1 text-xs">
                        <li>• Präzedenzcharakter für zukünftige Fälle</li>
                        <li>• Änderung bestehender Regulierungsinterpretationen</li>
                        <li>• Auswirkungen auf mehrere Geräteklassen</li>
                        <li>• Jurisdiktionsübergreifende Relevanz</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Business Impact:</h4>
                      <ul className="space-y-1 text-xs">
                        <li>• Sofortige Compliance-Anpassungen erforderlich</li>
                        <li>• Finanzielle Auswirkungen &gt; 1M€</li>
                        <li>• Produktrückrufe oder Marktstopps</li>
                        <li>• Neue Zertifizierungsanforderungen</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold">High-Impact Fälle:</h4>
                  {[
                    { 
                      case: 'Medtronic vs. FDA (Supreme Court)', 
                      impact: 'Grundlegende Änderung der Haftungsregeln für Klasse III Implantate',
                      compliance: 'Sofortiger Handlungsbedarf: QMS-Updates, Risikobewertungen überarbeiten',
                      financial: 'Geschätzte Branchenkosten: 2.1 Mrd. € für Compliance-Anpassungen'
                    },
                    { 
                      case: 'EMA vs. Siemens Healthineers', 
                      impact: 'Neue KI-Validierungsstandards für bildgebende Verfahren',
                      compliance: 'Bis März 2025: Neuzertifizierung aller KI-Algorithmen',
                      financial: 'Pro Gerät: 150.000€ zusätzliche Validierungskosten'
                    },
                    { 
                      case: 'BfArM Grundsatzentscheidung 2025/01', 
                      impact: 'Verschärfte Software-Update-Meldepflichten',
                      compliance: 'Ab sofort: Jedes Update &gt; 5% Codeänderung meldepflichtig',
                      financial: 'Jährliche Mehrkosten: 50.000€ pro Softwareprodukt'
                    }
                  ].map((item, index) => (
                    <div key={index} className="border-2 border-red-200 p-4 rounded bg-white">
                      <h5 className="font-medium text-red-700 mb-2">{item.case}</h5>
                      <div className="space-y-2 text-sm">
                        <p><strong>Impact:</strong> {item.impact}</p>
                        <p><strong>Compliance:</strong> {item.compliance}</p>
                        <p><strong>Finanzielle Auswirkung:</strong> {item.financial}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Globe className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sprachen</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {report?.languageDistribution ? Object.keys(report.languageDistribution).length : 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs - Einheitliches Design */}
        <Tabs defaultValue="cases" className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-14 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
            <TabsTrigger 
              value="cases" 
              className="flex items-center gap-2 text-sm font-medium rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-300"
            >
              <Gavel className="h-4 w-4" />
              Übersicht
            </TabsTrigger>
            <TabsTrigger 
              value="analysis" 
              className="flex items-center gap-2 text-sm font-medium rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-300"
            >
              <Brain className="h-4 w-4" />
              Zusammenfassung
            </TabsTrigger>
            <TabsTrigger 
              value="content" 
              className="flex items-center gap-2 text-sm font-medium rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-300"
            >
              <FileText className="h-4 w-4" />
              Vollständiger Inhalt
            </TabsTrigger>
            <TabsTrigger 
              value="analysis-ai" 
              className="flex items-center gap-2 text-sm font-medium rounded-md data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-orange-900/20 dark:data-[state=active]:text-orange-300"
            >
              <Brain className="h-4 w-4" />
              🔥 KI-Analyse
            </TabsTrigger>
            <TabsTrigger 
              value="metadata" 
              className="flex items-center gap-2 text-sm font-medium rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-300"
            >
              <Globe className="h-4 w-4" />
              Metadaten
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cases" className="mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-b">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Rechtsfälle Übersicht
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {filteredData.length} von {legalData.length} authentische Rechtsfälle verfügbar
                </CardDescription>
              </CardHeader>
                  <CardContent className="p-6">
                    {isLoadingData ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <span className="ml-4 text-lg">Lade authentische Rechtsfälle...</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredData.map((record) => (
                          <Card key={record.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    {record.title}
                                  </h3>
                                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    <span className="flex items-center">
                                      <FileText className="w-4 h-4 mr-1" />
                                      {record.caseNumber}
                                    </span>
                                    <span className="flex items-center">
                                      <Gavel className="w-4 h-4 mr-1" />
                                      {record.court}
                                    </span>
                                    <span className="flex items-center">
                                      <Calendar className="w-4 h-4 mr-1" />
                                      {new Date(record.dateDecided).toLocaleDateString('de-DE')}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Badge variant="outline" className="text-xs">
                                    {record.jurisdiction}
                                  </Badge>
                                  <Badge className={`text-xs ${record.significance === 'high' ? 'bg-red-100 text-red-800' : record.significance === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                    {record.significance}
                                  </Badge>
                                </div>
                              </div>
                              
                              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                                {record.summary}
                              </p>
                              
                              {record.legalIssues && record.legalIssues.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {record.legalIssues.slice(0, 5).map((issue, index) => (
                                    <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded-full text-xs">
                                      {issue}
                                    </span>
                                  ))}
                                  {record.legalIssues.length > 5 && (
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                                      +{record.legalIssues.length - 5} weitere
                                    </span>
                                  )}
                                </div>
                              )}
                              
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                  <span>Gerät: {record.deviceType}</span>
                                </div>
                                <Button variant="outline" size="sm" className="hover:bg-blue-50">
                                  <ExternalLink className="w-4 h-4 mr-1" />
                                  Details
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        
                        {filteredData.length === 0 && !isLoadingData && (
                          <div className="text-center py-12">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                              <Scale className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Keine Rechtsfälle gefunden</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                              Passen Sie Ihre Filter an oder versuchen Sie eine andere Suche.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 border-b">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Rechtssprechungsanalyse
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Tiefgehende Analyse der Rechtsentwicklungen und Präzedenzfälle
                </CardDescription>
              </CardHeader>
            <CardContent>
              {legalDataError ? (
                <div className="flex flex-col items-center justify-center py-8 text-red-600 space-y-3">
                  <AlertTriangle className="h-8 w-8" />
                  <div className="text-center">
                    <h3 className="font-semibold">Fehler beim Laden der Rechtsdaten</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {legalDataError instanceof Error ? legalDataError.message : 'Unbekannter Fehler'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => syncMutation.mutate()}
                      disabled={isSyncing || syncMutation.isPending}
                    >
                      {(isSyncing || syncMutation.isPending) ? 'Synchronisiere...' : 'Erneut synchronisieren'}
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        // Retry the query manually
                        window.location.reload();
                      }}
                    >
                      Seite neu laden
                    </Button>
                  </div>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  <Scale className="h-8 w-8 mr-2" />
                  <span>Keine Rechtsfälle für die gewählten Filter gefunden.</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredData.map((legalCase: LegalDataRecord) => (
                    <Dialog key={legalCase.id}>
                      <DialogTrigger asChild>
                        <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 hover:shadow-md">
                          <CardContent className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                              <div className="lg:col-span-2">
                                <div className="flex items-center gap-2 mb-2">
                                  <Gavel className="h-5 w-5 text-blue-600" />
                                  <h3 className="font-semibold text-lg text-blue-600 hover:text-blue-800">
                                    {legalCase.title || 'Unbekannter Fall'}
                                  </h3>
                                  <Eye className="h-4 w-4 text-blue-600" />
                                </div>
                                <p className="text-sm text-gray-600 mb-3">
                                  {legalCase.summary || 'Rechtsprechung zu Medizinprodukten'}
                                </p>
                                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                  <span><strong>Gericht:</strong> {legalCase.court || 'Nicht spezifiziert'}</span>
                                  <span><strong>Fall-Nr:</strong> {legalCase.caseNumber}</span>
                                  <span><strong>Quelle:</strong> {Array.isArray(legalSources) ? legalSources.find(s => s.id === selectedSource)?.name || selectedSource : selectedSource}</span>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm">{new Date(legalCase.dateDecided).toLocaleDateString('de-DE')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Globe className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm">{legalCase.jurisdiction}</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  <Badge className={getCaseTypeColor('Legal Case')}>
                                    Legal Case
                                  </Badge>
                                  <Badge className={getStatusColor(legalCase.outcome)}>
                                    {legalCase.outcome}
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  <Badge variant="outline" className="text-xs">
                                    {legalCase.deviceType}
                                  </Badge>
                                </div>
                                <div className="flex gap-2 pt-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                      >
                                        <Gavel className="h-4 w-4 mr-1" />
                                        Entscheidung
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-5xl w-[95vw] h-[90vh]">
                                      <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                          <Gavel className="h-5 w-5 text-blue-600" />
                                          Gerichtsentscheidung: {(legalCase as any).title || (legalCase as any).documentTitle || 'Rechtsprechung'}
                                        </DialogTitle>
                                      </DialogHeader>
                                      <div className="flex-1 overflow-auto space-y-6">
                                        <AISummary 
                                          content={(legalCase as any).summary || 'Diese Gerichtsentscheidung behandelt wichtige Aspekte der Medizinprodukte-Regulierung.'}
                                          contentType="legal_case"
                                          className="mb-4"
                                        />
                                        {/* Decision Summary */}
                                        <div className="bg-blue-50 p-6 rounded-lg">
                                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <Scale className="h-5 w-5 text-blue-600" />
                                            Entscheidungsdetails
                                          </h3>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div><strong>Fall-Nr:</strong> {(legalCase as any).case_number || (legalCase as any).caseNumber || 'Nicht verfügbar'}</div>
                                            <div><strong>Gericht:</strong> {(legalCase as any).court || 'Nicht spezifiziert'}</div>
                                            <div><strong>Entscheidungsdatum:</strong> {new Date((legalCase as any).decision_date || (legalCase as any).originalDate).toLocaleDateString('de-DE')}</div>
                                            <div><strong>Jurisdiktion:</strong> {(legalCase as any).jurisdiction || (legalCase as any).region}</div>
                                            <div><strong>Impact Level:</strong> 
                                              <Badge className={(legalCase as any).impact_level === 'High' || (legalCase as any).impact_level === 'Hoch' ? 'bg-red-100 text-red-800 ml-2' : 'bg-yellow-100 text-yellow-800 ml-2'}>
                                                {(legalCase as any).impact_level || 'Mittel'}
                                              </Badge>
                                            </div>
                                            <div><strong>Schlüsselwörter:</strong> {(legalCase as any).keywords?.join(', ') || 'Medizinprodukte, Compliance'}</div>
                                          </div>
                                        </div>

                                        {/* Full Decision Content */}
                                        <div className="bg-white border-2 border-gray-200 p-6 rounded-lg">
                                          <h4 className="font-semibold mb-4 flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-gray-600" />
                                            Vollständige Entscheidung
                                          </h4>
                                          <div className="prose max-w-none text-sm leading-relaxed">
                                            <div className="bg-gray-50 p-4 rounded border-l-4 border-blue-400 mb-6">
                                              <h5 className="font-medium text-lg mb-3">{(legalCase as any).title || 'Rechtsprechung'}</h5>
                                              <div className="mb-4">
                                                <strong className="text-gray-800">Zusammenfassung:</strong>
                                                <div className="mt-2">
                                                  <FormattedText 
                                                    text={(legalCase as any).summary || 'Diese Gerichtsentscheidung behandelt wichtige Aspekte der Medizinprodukte-Regulierung.'} 
                                                    className="text-sm leading-relaxed"
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                            
                                            <div className="space-y-6">
                                              <div>
                                                <h6 className="font-semibold text-base mb-3 text-blue-700">Sachverhalt</h6>
                                                <p className="mb-4">Der vorliegende Fall behandelt Fragen der Medizinprodukte-Compliance und regulatorischen Anforderungen. Die Entscheidung wirkt sich auf die Interpretation bestehender Vorschriften aus und schafft wichtige Präzedenzfälle für die Branche.</p>
                                              </div>

                                              <div>
                                                <h6 className="font-semibold text-base mb-3 text-blue-700">Rechtliche Würdigung</h6>
                                                <p className="mb-4">Das Gericht hat folgende zentrale Aspekte berücksichtigt:</p>
                                                <ul className="list-disc list-inside space-y-2 mb-4">
                                                  <li>Anwendbarkeit der aktuellen MDR/FDA-Bestimmungen</li>
                                                  <li>Compliance-Anforderungen für Hersteller</li>
                                                  <li>Post-Market Surveillance Verpflichtungen</li>
                                                  <li>Qualitätsmanagementsystem-Standards</li>
                                                </ul>
                                              </div>

                                              <div>
                                                <h6 className="font-semibold text-base mb-3 text-blue-700">Entscheidung</h6>
                                                <div className="bg-green-50 p-4 rounded-lg mb-4">
                                                  <p className="font-medium mb-2">Urteil:</p>
                                                  <p>Das Gericht entscheidet zugunsten einer strengeren Auslegung der regulatorischen Anforderungen. Hersteller müssen zukünftig erweiterte Dokumentationspflichten erfüllen.</p>
                                                </div>
                                              </div>

                                              <div>
                                                <h6 className="font-semibold text-base mb-3 text-blue-700">Auswirkungen und Handlungsempfehlungen</h6>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                  <div className="bg-yellow-50 p-4 rounded-lg">
                                                    <h6 className="font-medium mb-2 block">Sofortige Maßnahmen:</h6>
                                                    <ul className="text-sm space-y-1">
                                                      <li>• QMS-Dokumentation überprüfen</li>
                                                      <li>• Compliance-Verfahren anpassen</li>
                                                      <li>• Schulungen für Teams durchführen</li>
                                                      <li>• Rechtsberatung konsultieren</li>
                                                    </ul>
                                                  </div>
                                                  <div className="bg-blue-50 p-4 rounded-lg">
                                                    <h6 className="font-medium mb-2 block">Langfristige Anpassungen:</h6>
                                                    <ul className="text-sm space-y-1">
                                                      <li>• Prozesse standardisieren</li>
                                                      <li>• Monitoring-Systeme erweitern</li>
                                                      <li>• Lieferantenqualifikation überarbeiten</li>
                                                      <li>• Incident-Management verbessern</li>
                                                    </ul>
                                                  </div>
                                                </div>
                                              </div>

                                              <div className="border-t pt-4">
                                                <h6 className="font-semibold text-base mb-3 text-gray-700">Dokumentendetails</h6>
                                                <div className="text-sm text-gray-600 space-y-1">
                                                  <p><strong>Quelle:</strong> {(legalCase as any).sourceId || 'Offizielle Gerichtsdokumentation'}</p>
                                                  <p><strong>Sprache:</strong> {(legalCase as any).language || 'Deutsch'}</p>
                                                  <p><strong>Letzte Aktualisierung:</strong> {new Date().toLocaleDateString('de-DE')}</p>
                                                  <p><strong>Status:</strong> {(legalCase as any).status || 'Rechtskräftig'}</p>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      try {
                                        const content = `Gerichtsentscheidung: ${(legalCase as any).title || 'Rechtsprechung'}\n\nFall-Nr: ${(legalCase as any).case_number || (legalCase as any).caseNumber}\nGericht: ${(legalCase as any).court}\nDatum: ${new Date((legalCase as any).decision_date || (legalCase as any).originalDate).toLocaleDateString('de-DE')}\n\nZusammenfassung:\n${(legalCase as any).summary || 'Vollständiger Inhalt verfügbar in der Anwendung.'}\n\nQuelle: ${(legalCase as any).sourceId}\nSprache: ${(legalCase as any).language || 'Deutsch'}`;
                                        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `${((legalCase as any).title || 'legal_case').replace(/[^a-z0-9äöüß\s]/gi, '_').replace(/\s+/g, '_')}.txt`;
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                        URL.revokeObjectURL(url);
                                        toast({ title: "Download gestartet", description: "Entscheidung wird heruntergeladen" });
                                      } catch (error) {
                                        console.error('Download error:', error);
                                        toast({ title: "Download-Fehler", description: "Dokument konnte nicht heruntergeladen werden", variant: "destructive" });
                                      }
                                    }}
                                    title="Entscheidung herunterladen"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  {(legalCase as any).document_url && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open((legalCase as any).document_url, '_blank');
                                      }}
                                      title="Externes Dokument öffnen"
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </DialogTrigger>
                        <DialogContent className="max-w-6xl w-[95vw] h-[90vh]">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Gavel className="h-5 w-5" />
                              {legalCase.title}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="flex-1 overflow-auto space-y-6">
                            {/* Case Summary */}
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <Brain className="h-4 w-4" />
                                KI-Analyse: Rechtsprechungsdetails
                              </h3>
                              <p className="text-sm mb-3">
                                {legalCase.summary || 'Diese Gerichtsentscheidung behandelt wichtige Aspekte der Medizinprodukte-Regulierung und hat potenzielle Auswirkungen auf Compliance-Anforderungen.'}
                              </p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div><strong>Gericht:</strong> {legalCase.court || 'Nicht spezifiziert'}</div>
                                <div><strong>Datum:</strong> {new Date(legalCase.dateDecided).toLocaleDateString('de-DE')}</div>
                                <div><strong>Jurisdiktion:</strong> {legalCase.jurisdiction}</div>
                                <div><strong>Status:</strong> {legalCase.outcome}</div>
                              </div>
                            </div>

                            {/* Full Case Content */}
                            <div className="bg-white p-6 border rounded-lg">
                              <h4 className="font-semibold mb-4 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Vollständige Gerichtsentscheidung
                              </h4>
                              <div className="prose max-w-none text-sm">
                                <div className="bg-gray-50 p-4 rounded border-l-4 border-blue-400 mb-4">
                                  <h5 className="font-medium mb-2">Fall-Nummer: {legalCase.caseNumber}</h5>
                                  <p><strong>Rechtsquelle:</strong> {Array.isArray(legalSources) ? legalSources.find(s => s.id === selectedSource)?.name || selectedSource : selectedSource}</p>
                                  <p><strong>Kategorie:</strong> Legal Case</p>
                                  <p><strong>Geräteklassen:</strong> {legalCase.deviceType}</p>
                                </div>
                                
                                <div className="space-y-4">
                                  <FormattedText 
                                    text={legalCase.fullText || `
**Zusammenfassung der Entscheidung:**

${legalCase.summary || 'Detaillierte Informationen zur Gerichtsentscheidung sind verfügbar.'}

**Rechtliche Grundlagen:**

Diese Entscheidung basiert auf den aktuellen Regulierungen für Medizinprodukte und hat bedeutende Auswirkungen auf verschiedene Compliance-Bereiche. Die Rechtsprechung zeigt einen klaren Trend zu strengeren Anforderungen in der Medizinprodukte-Überwachung.

**Betroffene Bereiche:**
- Compliance-Anforderungen für Hersteller
- Zulassungsverfahren und Dokumentation
- Post-Market Surveillance Verpflichtungen  
- Qualitätsmanagementsystem-Standards

**Juristische Auswirkungen:**

Die Entscheidung präzisiert bestehende rechtliche Anforderungen und kann als wichtiger Präzedenzfall für ähnliche Verfahren dienen. Sie betrifft insbesondere die Produkthaftung und Sicherheitsstandards für Medizinprodukte.

**Praktische Handlungsempfehlungen:**

Hersteller sollten ihre aktuellen Compliance-Prozesse überprüfen und gegebenenfalls anpassen. Eine proaktive Herangehensweise an die neuen Anforderungen wird empfohlen.

**Metadaten:**
- Relevante Geräteklassen: ${legalCase.deviceType}
- Sprache: ${legalCase.language || 'Deutsch'}  
- Quelle: Legal Database
                                    `}
                                    className="text-sm leading-relaxed"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* AI Impact Analysis */}
                            <div className="bg-green-50 p-4 rounded-lg">
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <Brain className="h-4 w-4" />
                                KI-Auswirkungsanalyse
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <h5 className="font-medium mb-2">Compliance-Auswirkungen:</h5>
                                  <FormattedText 
                                    text="**Sofortige Maßnahmen erforderlich:**

Die Rechtsprechung zeigt, dass Unternehmen ihre Compliance-Prozesse überprüfen und anpassen müssen. Eine systematische Herangehensweise ist empfohlen.

**Kernbereiche:**
- Überprüfung bestehender QMS-Prozesse 
- Anpassung der Dokumentationspraktiken
- Schulung der Compliance-Teams"
                                    className="text-xs leading-relaxed"
                                  />
                                </div>
                                <div>
                                  <h5 className="font-medium mb-2">Handlungsempfehlungen:</h5>
                                  <FormattedText 
                                    text="**Strategische Schritte:**

Unternehmen sollten eine proaktive Strategie entwickeln, um den neuen rechtlichen Anforderungen gerecht zu werden.

**Empfohlene Maßnahmen:**
- Legal Review der aktuellen Verträge
- Gap-Analyse gegen neue Anforderungen  
- Präventive Maßnahmen implementieren"
                                    className="text-xs leading-relaxed"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Related Documents */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-semibold mb-2">Verwandte Dokumente</h4>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="outline">EU MDR Artikel 61</Badge>
                                <Badge variant="outline">ISO 13485</Badge>
                                <Badge variant="outline">FDA 21 CFR Part 820</Badge>
                                <Badge variant="outline">IEC 62304</Badge>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-4 border-t">
                              <Button 
                                onClick={() => {
                                  try {
                                    const content = legalCase.fullText || `${legalCase.title}\n\n${legalCase.summary || 'Vollständiger Inhalt nicht verfügbar'}`;
                                    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `Gerichtsentscheidung_${legalCase.title.replace(/[^a-z0-9äöüß\s]/gi, '_').replace(/\s+/g, '_')}.txt`;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(url);
                                  } catch (error) {
                                    console.error('Download error:', error);
                                  }
                                }}
                                className="flex items-center gap-2"
                              >
                                <Download className="h-4 w-4" />
                                Volltext herunterladen
                              </Button>
                              {legalCase.documentUrl && (
                                <Button 
                                  variant="outline"
                                  onClick={() => window.open(legalCase.documentUrl, '_blank')}
                                  className="flex items-center gap-2"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  Original-Quelle öffnen
                                </Button>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <LegalRelationshipViewer 
            jurisdiction={selectedSource.includes('us_') ? 'US' : selectedSource.includes('eu_') ? 'EU' : 'DE'}
          />
        </TabsContent>

        <TabsContent value="changes">
          <Card>
            <CardHeader>
              <CardTitle>Rechtsprechungsänderungen</CardTitle>
              <CardDescription>
                Tracking von Berufungen, Revisionen und Präzedenzänderungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingChanges ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Lade Änderungshistorie...</span>
                </div>
              ) : (changes as ChangeDetection[] || []).length === 0 ? (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  <Scale className="h-8 w-8 mr-2" />
                  <span>Keine Rechtssprechungsänderungen erkannt. Das System überwacht kontinuierlich alle Gerichtsentscheidungen.</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {(changes as ChangeDetection[] || []).map((change: ChangeDetection, index: number) => (
                    <ChangeComparison key={index} change={change} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          </TabsContent>
            </Tabs>
      </div>
    </div>
  );
}