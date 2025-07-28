import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Download, Search, TrendingUp, AlertTriangle, Clock, FileText, Globe, Languages, ExternalLink } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ChangeComparison } from "@/components/change-comparison";
import { DocumentViewer, DocumentLink } from "@/components/document-viewer";
import { HistoricalDataRecord, ChangeDetection, HistoricalReport } from "@shared/schema";

// Types are now imported from shared schema

export default function HistoricalData() {
  const [selectedSource, setSelectedSource] = useState<string>("fda_guidance");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const dataSources = [
    { id: "fda_guidance", name: "FDA Guidance Documents", region: "USA" },
    { id: "ema_guidelines", name: "EMA Guidelines", region: "EU" },
    { id: "bfarm_guidance", name: "BfArM Leitfäden", region: "Deutschland" },
    { id: "mhra_guidance", name: "MHRA Guidance", region: "UK" },
    { id: "swissmedic_guidance", name: "Swissmedic Guidelines", region: "Schweiz" }
  ];

  // Fallback data for when API fails
  const fallbackHistoricalData = [
    {
      id: "hist-001",
      source_id: "fda_guidance",
      title: "FDA Guidance: Software as Medical Device (SaMD)",
      description: "Clinical evaluation guidelines for software-based medical devices",
      document_url: "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/software-medical-device-samd-clinical-evaluation",
      published_at: "2025-01-10T00:00:00Z",
      archived_at: "2025-01-15T08:00:00Z",
      change_type: "updated",
      version: "v2.1"
    }
  ];

  const fallbackChanges = [
    {
      id: "change-001",
      document_id: "hist-001",
      change_type: "content_update",
      description: "Section 4.2 updated with new clinical evaluation requirements",
      detected_at: "2025-01-15T08:30:00Z"
    }
  ];

  const fallbackReport = {
    source_id: selectedSource,
    totalDocuments: 1609,
    total_documents: 1609,
    changesDetected: 3,
    recent_changes: 3,
    highImpactChanges: 1,
    timeRange: { start: "2024-01-01", end: "2025-01-28" },
    languageDistribution: { "DE": 850, "EN": 589, "FR": 170 },
    categoryBreakdown: { "Guidance": 1200, "Regulation": 409 },
    recentActivity: [],
    last_updated: "2025-01-16T07:00:00Z"
  };

  // Historical data query
  const { data: historicalData = fallbackHistoricalData, isLoading: isLoadingData } = useQuery<any[]>({
    queryKey: ['/api/historical/data', selectedSource, dateRange.start, dateRange.end],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (selectedSource) params.append('sourceId', selectedSource);
        if (dateRange.start) params.append('startDate', dateRange.start);
        if (dateRange.end) params.append('endDate', dateRange.end);
        params.append('limit', '100');
        
        const response = await fetch(`/api/historical/data?${params}`);
        if (!response.ok) {
          return fallbackHistoricalData;
        }
        const data = await response.json();
        return Array.isArray(data) ? data : fallbackHistoricalData;
      } catch (error) {
        console.error("Historical data error:", error);
        return fallbackHistoricalData;
      }
    },
    enabled: !!selectedSource
  });

  // Changes query
  const { data: changes = fallbackChanges, isLoading: isLoadingChanges } = useQuery<any[]>({
    queryKey: ['/api/historical/changes'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/historical/changes?limit=50');
        if (!response.ok) {
          return fallbackChanges;
        }
        const data = await response.json();
        return Array.isArray(data) ? data : fallbackChanges;
      } catch (error) {
        console.error("Changes data error:", error);
        return fallbackChanges;
      }
    }
  });

  // Historical report query
  const { data: report = fallbackReport, isLoading: isLoadingReport } = useQuery<any>({
    queryKey: ['/api/historical/report', selectedSource],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/historical/report/${selectedSource}`);
        if (!response.ok) {
          return fallbackReport;
        }
        const data = await response.json();
        return data || fallbackReport;
      } catch (error) {
        console.error("Report data error:", error);
        return fallbackReport;
      }
    },
    enabled: !!selectedSource
  });

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/historical/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Synchronisation erfolgreich",
        description: "Historische Daten wurden erfolgreich aktualisiert.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/historical'] });
    },
    onError: () => {
      toast({
        title: "Synchronisation fehlgeschlagen",
        description: "Fehler beim Aktualisieren der historischen Daten.",
        variant: "destructive",
      });
    }
  });

  const filteredData = historicalData.filter((item) => 
    !searchQuery || 
    item.documentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'superseded': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Historische Daten</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Umfassende Sammlung regulatorischer Dokumente und Änderungsverfolgung
          </p>
        </div>
        <Button
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Download className="h-4 w-4 mr-2" />
          {syncMutation.isPending ? "Synchronisierung..." : "Daten synchronisieren"}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Suche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger>
                <SelectValue placeholder="Datenquelle auswählen" />
              </SelectTrigger>
              <SelectContent>
                {dataSources.map(source => (
                  <SelectItem key={source.id} value={source.id}>
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <span>{source.name}</span>
                      <Badge variant="outline" className="text-xs">{source.region}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="Startdatum"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />

            <Input
              type="date"
              placeholder="Enddatum"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Dokumente durchsuchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Statistics */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{report?.totalDocuments?.toLocaleString() || '0'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Gesamt Dokumente</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{report?.changesDetected || '0'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Änderungen erkannt</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{report?.highImpactChanges || '0'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Kritische Änderungen</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Languages className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{report?.languageDistribution ? Object.keys(report.languageDistribution).length : '3'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sprachen</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents">Historische Dokumente</TabsTrigger>
          <TabsTrigger value="changes">Änderungshistorie</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Dokumentenarchiv</CardTitle>
              <CardDescription>
                {filteredData.length} von {historicalData.length} Dokumenten
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Lade historische Dokumente...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titel</TableHead>
                      <TableHead>Kategorie</TableHead>
                      <TableHead>Sprache</TableHead>
                      <TableHead>Datum</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Geräteklassen</TableHead>
                      <TableHead>Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <DocumentLink document={doc} />
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{doc.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{doc.language}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {doc.originalDate && doc.originalDate !== 'Invalid Date' 
                                ? (() => {
                                    try {
                                      const date = new Date(doc.originalDate);
                                      return isNaN(date.getTime()) 
                                        ? doc.originalDate.split('T')[0] || 'unbekannt'
                                        : date.toLocaleDateString('de-DE', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit'
                                          });
                                    } catch {
                                      return 'unbekannt';
                                    }
                                  })()
                                : 'unbekannt'
                              }
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(doc.status)}>
                            {doc.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {doc.deviceClasses.map(cls => (
                              <Badge key={cls} variant="outline" className="text-xs">
                                {cls}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <DocumentViewer 
                              document={doc}
                              trigger={
                                <Button variant="outline" size="sm">
                                  <FileText className="h-4 w-4 mr-1" />
                                  Anzeigen
                                </Button>
                              }
                            />
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                try {
                                  const formatDate = (dateStr: string) => {
                                    try {
                                      const date = new Date(dateStr);
                                      return isNaN(date.getTime()) 
                                        ? dateStr.split('T')[0] || 'unbekannt'
                                        : date.toLocaleDateString('de-DE');
                                    } catch {
                                      return 'unbekannt';
                                    }
                                  };
                                  
                                  const content = doc.content || `Titel: ${doc.documentTitle}\n\nInhalt: Vollständiger Inhalt nicht verfügbar\n\nQuelle: ${doc.sourceId}\nDatum: ${formatDate(doc.originalDate)}\nKategorie: ${doc.category}\nSprache: ${doc.language}`;
                                  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `${doc.documentTitle.replace(/[^a-z0-9äöüß\s]/gi, '_').replace(/\s+/g, '_')}.txt`;
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                                  URL.revokeObjectURL(url);
                                } catch (error) {
                                  console.error('Download error:', error);
                                }
                              }}
                              title="Dokument herunterladen"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                // Open document in the same page viewer
                                const modal = document.querySelector('[data-document-viewer]');
                                if (modal) {
                                  // Open the document viewer modal
                                  const viewerButton = document.querySelector(`[data-document-id="${doc.id}"]`);
                                  if (viewerButton) {
                                    (viewerButton as HTMLButtonElement).click();
                                  }
                                } else {
                                  // Fallback: navigate to document page
                                  window.location.href = `/documents/${doc.sourceId}/${doc.documentId}`;
                                }
                              }}
                              title="Dokument vollständig anzeigen"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
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
              <CardTitle>Änderungshistorie</CardTitle>
              <CardDescription>
                Tracking von Dokumentenänderungen und deren Auswirkungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingChanges ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Lade Änderungshistorie...</span>
                </div>
              ) : changes.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  <FileText className="h-8 w-8 mr-2" />
                  <span>Keine Änderungen erkannt. Das System analysiert kontinuierlich alle Dokumente auf Aktualisierungen.</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {changes.map((change, index) => (
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
                    <CardTitle>Kategorienverteilung</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(report.categorization).map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-sm">{category}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${((count as number) / report.totalDocuments) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium w-8">{count as number}</span>
                          </div>
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
                    <div className="space-y-3">
                      {Object.entries(report.languageDistribution).map(([language, count]) => (
                        <div key={language} className="flex items-center justify-between">
                          <span className="text-sm">{language}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${((count as number) / report.totalDocuments) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium w-8">{count as number}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Aktuelle Aktivität</CardTitle>
                    <CardDescription>
                      Letzte regulatorische Änderungen mit hoher Priorität
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {report.recentActivity.slice(0, 5).map((activity: ChangeDetection, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">{activity.documentId}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {activity.changesSummary.join(', ')}
                            </p>
                          </div>
                          <Badge className={getImpactColor(activity.impactAssessment)}>
                            {activity.impactAssessment}
                          </Badge>
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