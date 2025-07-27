import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Download, Search, Scale, AlertTriangle, Clock, FileText, Globe, Users, Smartphone, Monitor, Tablet } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ChangeComparison } from "@/components/change-comparison";
import { DocumentViewer, DocumentLink } from "@/components/document-viewer";
import { useDevice } from "@/hooks/use-device";
import { ResponsiveGrid } from "@/components/responsive-layout";
import { HistoricalDataRecord, ChangeDetection } from "@shared/schema";
import { cn } from "@/lib/utils";

interface LegalReport {
  totalCases: number;
  timeRange: { start: string; end: string };
  changesDetected: number;
  highImpactChanges: number;
  caseTypes: Record<string, number>;
  languageDistribution: Record<string, number>;
  recentActivity: ChangeDetection[];
}

export default function LegalCases() {
  const device = useDevice();
  const [selectedSource, setSelectedSource] = useState<string>("us_federal_courts");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch legal data sources
  const { data: legalSources = {} } = useQuery({
    queryKey: ['/api/legal/sources'],
    staleTime: 30000,
  });

  // Fetch legal cases
  const { data: legalData = [], isLoading: isLoadingData, error: legalDataError } = useQuery<HistoricalDataRecord[]>({
    queryKey: ['/api/legal/data', selectedSource, dateRange.start, dateRange.end],
    queryFn: async () => {
      if (!selectedSource) throw new Error('No source selected');
      
      const params = new URLSearchParams({
        sourceId: selectedSource,
        ...(dateRange.start && { startDate: dateRange.start }),
        ...(dateRange.end && { endDate: dateRange.end })
      });
      
      const response = await fetch(`/api/legal/data?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
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
        <div className="flex items-center gap-4">
          {/* Device Type Selection */}
          <div className="flex gap-2">
            <Button
              variant={selectedDeviceType === "mobile" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDeviceType("mobile")}
              className="flex items-center gap-1"
              title="Mobile Geräte"
            >
              <Smartphone className="h-4 w-4" />
            </Button>
            <Button
              variant={selectedDeviceType === "desktop" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDeviceType("desktop")}
              className="flex items-center gap-1"
              title="Desktop-Systeme"
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={selectedDeviceType === "tablet" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDeviceType("tablet")}
              className="flex items-center gap-1"
              title="Tablet-Geräte"
            >
              <Tablet className="h-4 w-4" />
            </Button>
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
                  {legalSources && Object.entries(legalSources as Record<string, { name: string; country: string }>).map(([id, source]) => (
                    <SelectItem key={id} value={id}>
                      {source.name} ({source.country})
                    </SelectItem>
                  ))}
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cases">Rechtsfälle</TabsTrigger>
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
                      <TableRow key={legalCase.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <DocumentLink document={legalCase} />
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
                            <DocumentViewer 
                              document={legalCase}
                              trigger={
                                <Button variant="outline" size="sm">
                                  <Scale className="h-4 w-4 mr-1" />
                                  Entscheidung
                                </Button>
                              }
                            />
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
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
                            {legalCase.documentUrl && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => window.open(legalCase.documentUrl, '_blank', 'noopener,noreferrer')}
                                title="Original öffnen"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
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
                      {Object.entries(report.caseTypes).map(([type, count]) => (
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
                      {Object.entries(report.languageDistribution).map(([lang, count]) => (
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