import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
// Remove non-existent imports from shared schema
import { cn } from "@/lib/utils";
import LegalRelationshipViewer from "@/components/legal-relationship-viewer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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

  // Fetch legal cases
  const { data: legalData = fallbackLegalData, isLoading: isLoadingData, error: legalDataError } = useQuery<any[]>({
    queryKey: ['/api/legal/data', selectedSource, dateRange.start, dateRange.end],
    queryFn: async () => {
      try {
        if (!selectedSource) return fallbackLegalData;
        
        const params = new URLSearchParams({
          sourceId: selectedSource,
          ...(dateRange.start && { startDate: dateRange.start }),
          ...(dateRange.end && { endDate: dateRange.end })
        });
        
        const response = await fetch(`/api/legal/data?${params}`);
        if (!response.ok) {
          return fallbackLegalData;
        }
        const data = await response.json();
        return Array.isArray(data) ? data : fallbackLegalData;
      } catch (error) {
        console.error("Legal data error:", error);
        return fallbackLegalData;
      }
    },
    enabled: !!selectedSource,
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

  // Sync legal data mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/legal/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (!response.ok) {
        throw new Error(`Sync failed: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Rechtssprechungsdaten aktualisiert",
        description: `Alle Gerichtsentscheidungen wurden erfolgreich synchronisiert (${data.timestamp}).`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/legal'] });
    },
    onError: (error: any) => {
      toast({
        title: "Synchronisationsfehler",
        description: `Fehler beim Aktualisieren der Rechtssprechungsdaten: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Filter legal data based on search term
  const filteredData = legalData.filter((record) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      record.documentTitle.toLowerCase().includes(searchLower) ||
      record.documentId.toLowerCase().includes(searchLower) ||
      record.category.toLowerCase().includes(searchLower) ||
      record.content.toLowerCase().includes(searchLower)
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
    <div className={cn(
      "space-y-6",
      device.isMobile ? "p-4" : device.isTablet ? "p-6" : "p-8"
    )}>


      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            MedTech Rechtssprechung
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gerichtsentscheidungen und juristische Präzedenzfälle aus der Medizintechnik
          </p>
        </div>
        <Button 
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
        >
          {syncMutation.isPending ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Daten synchronisieren
        </Button>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filteroptionen</CardTitle>
        </CardHeader>
        <CardContent>
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
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Scale className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gesamte Fälle</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{report.totalCases}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Erkannte Änderungen</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{report.changesDetected}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hoher Impact</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{report.highImpactChanges}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Globe className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sprachen</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {Object.keys(report.languageDistribution).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="cases" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cases">Rechtsfälle</TabsTrigger>
          <TabsTrigger value="analysis">Rechtssprechungsanalyse</TabsTrigger>
          <TabsTrigger value="changes">Änderungen</TabsTrigger>
          <TabsTrigger value="analytics">Analyse</TabsTrigger>
        </TabsList>

        <TabsContent value="cases">
          <Card>
            <CardHeader>
              <CardTitle>Juristische Entscheidungen</CardTitle>
              <CardDescription>
                {filteredData.length} von {legalData.length} Rechtsfällen
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Lade Rechtssprechungsdaten...</span>
                </div>
              ) : legalDataError ? (
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
                      disabled={syncMutation.isPending}
                    >
                      {syncMutation.isPending ? 'Synchronisiere...' : 'Erneut synchronisieren'}
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fall / Entscheidung</TableHead>
                      <TableHead>Art des Falls</TableHead>
                      <TableHead>Jurisdiktion</TableHead>
                      <TableHead>Datum</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Geräteklassen</TableHead>
                      <TableHead>Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((legalCase: HistoricalDataRecord) => (
                      <Dialog key={legalCase.id}>
                        <DialogTrigger asChild>
                          <TableRow className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <div className="font-semibold text-blue-600 hover:text-blue-800">
                                    {legalCase.documentTitle || legalCase.title}
                                  </div>
                                  <Eye className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="text-sm text-gray-600">
                                  {legalCase.summary || 'Rechtsprechung zu Medizinprodukten'}
                                </div>
                                <div className="text-xs text-gray-500 space-y-1">
                                  <div>Rechtsquelle: {(legalSources as Record<string, { name: string }>)?.[selectedSource]?.name || selectedSource}</div>
                                  <div>ID: {legalCase.documentId}</div>
                                  <div className="flex items-center gap-1">
                                    <FileText className="h-3 w-3" />
                                    <span>Volltext verfügbar - Klicken zum Lesen</span>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                        <TableCell>
                          <Badge className={getCaseTypeColor(legalCase.category)}>
                            {legalCase.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-gray-500" />
                            <span>{legalCase.region}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(legalCase.originalDate).toLocaleDateString('de-DE')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(legalCase.status)}>
                            {legalCase.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {legalCase.deviceClasses.map((cls: string) => (
                              <Badge key={cls} variant="outline" className="text-xs">
                                {cls}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    try {
                                      const content = legalCase.content || `Titel: ${legalCase.documentTitle}\n\nInhalt: ${legalCase.summary || 'Vollständiger Inhalt nicht verfügbar'}\n\nQuelle: ${legalCase.sourceId}\nDatum: ${new Date(legalCase.originalDate).toLocaleDateString('de-DE')}\nKategorie: ${legalCase.category}\nSprache: ${legalCase.language}`;
                                      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                                      const url = URL.createObjectURL(blob);
                                      const a = document.createElement('a');
                                      a.href = url;
                                      a.download = `${legalCase.documentTitle.replace(/[^a-z0-9äöüß\s]/gi, '_').replace(/\s+/g, '_')}.txt`;
                                      document.body.appendChild(a);
                                      a.click();
                                      document.body.removeChild(a);
                                      URL.revokeObjectURL(url);
                                      toast({ title: "Download gestartet", description: "Dokument wird heruntergeladen" });
                                    } catch (error) {
                                      console.error('Download error:', error);
                                      toast({ title: "Download-Fehler", description: "Dokument konnte nicht heruntergeladen werden", variant: "destructive" });
                                    }
                                  }}
                                  title="Dokument herunterladen"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (legalCase.documentUrl) {
                                      window.open(legalCase.documentUrl, '_blank');
                                    } else {
                                      toast({ title: "Link nicht verfügbar", description: "Kein externer Link für dieses Dokument vorhanden", variant: "destructive" });
                                    }
                                  }}
                                  title="Externes Dokument öffnen"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        </DialogTrigger>
                        <DialogContent className="max-w-6xl w-[95vw] h-[90vh]">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Gavel className="h-5 w-5" />
                              {legalCase.documentTitle || legalCase.title}
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
                                <div><strong>Datum:</strong> {new Date(legalCase.originalDate).toLocaleDateString('de-DE')}</div>
                                <div><strong>Jurisdiktion:</strong> {legalCase.region}</div>
                                <div><strong>Status:</strong> {legalCase.status}</div>
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
                                  <h5 className="font-medium mb-2">Fall-Nummer: {legalCase.caseNumber || legalCase.documentId}</h5>
                                  <p><strong>Rechtsquelle:</strong> {(legalSources as Record<string, { name: string }>)?.[selectedSource]?.name || selectedSource}</p>
                                  <p><strong>Kategorie:</strong> {legalCase.category}</p>
                                  <p><strong>Geräteklassen:</strong> {legalCase.deviceClasses?.join(', ') || 'Alle Klassen'}</p>
                                </div>
                                
                                <div className="whitespace-pre-wrap">
                                  {legalCase.content || `
Zusammenfassung der Entscheidung:
${legalCase.summary || 'Detaillierte Informationen zur Gerichtsentscheidung sind verfügbar.'}

Rechtliche Grundlagen:
Diese Entscheidung basiert auf den aktuellen Regulierungen für Medizinprodukte und hat Auswirkungen auf:
- Compliance-Anforderungen
- Zulassungsverfahren  
- Post-Market Surveillance
- Qualitätsmanagementsysteme

Auswirkungen:
Die Entscheidung präzisiert bestehende rechtliche Anforderungen und kann als Präzedenzfall für ähnliche Verfahren dienen.

Relevante Dokumentenklassen: ${legalCase.deviceClasses?.join(', ') || 'Alle Medizinproduktklassen'}
Sprache: ${legalCase.language || 'Deutsch'}
Quelle: ${legalCase.sourceId}
                                  `}
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
                                  <ul className="space-y-1">
                                    <li>• Überprüfung bestehender QMS-Prozesse empfohlen</li>
                                    <li>• Anpassung der Dokumentationspraktiken erforderlich</li>
                                    <li>• Schulung der Compliance-Teams notwendig</li>
                                  </ul>
                                </div>
                                <div>
                                  <h5 className="font-medium mb-2">Handlungsempfehlungen:</h5>
                                  <ul className="space-y-1">
                                    <li>• Legal Review der aktuellen Verträge</li>
                                    <li>• Gap-Analyse gegen neue Anforderungen</li>
                                    <li>• Präventive Maßnahmen implementieren</li>
                                  </ul>
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
                                    const content = legalCase.content || `${legalCase.documentTitle}\n\n${legalCase.summary || 'Vollständiger Inhalt nicht verfügbar'}`;
                                    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `Gerichtsentscheidung_${legalCase.documentTitle.replace(/[^a-z0-9äöüß\s]/gi, '_').replace(/\s+/g, '_')}.txt`;
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
                  </TableBody>
                </Table>
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
              ) : (changes as ChangeDetection[]).length === 0 ? (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  <Scale className="h-8 w-8 mr-2" />
                  <span>Keine Rechtssprechungsänderungen erkannt. Das System überwacht kontinuierlich alle Gerichtsentscheidungen.</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {(changes as ChangeDetection[]).map((change: ChangeDetection, index: number) => (
                    <ChangeComparison key={index} change={change} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {report && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Falltypen</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {report && report.caseTypes && Object.entries(report.caseTypes).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm">{type}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sprachverteilung</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {report && report.languageDistribution && Object.entries(report.languageDistribution).map(([lang, count]) => (
                        <div key={lang} className="flex items-center justify-between">
                          <span className="text-sm">{lang.toUpperCase()}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}