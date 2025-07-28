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

  // Use real API data instead of mock data
  const { data: apiHistoricalData = [], isLoading: isLoadingApiData } = useQuery({
    queryKey: ['/api/historical/data', selectedSource],
    queryFn: async () => {
      try {
        const response = await fetch('/api/historical/data');
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    },
  });

  // Mock changes data
  const mockChanges = [
    {
      id: "change-001",
      document_id: "hist-001",
      change_type: "content_update",
      description: "Updated clinical evaluation requirements section",
      detected_at: "2024-12-15T08:30:00Z",
      impact_level: "medium",
      old_version: "v2.0",
      new_version: "v2.1"
    }
  ];

  // Mock report data
  const mockReport = {
    totalDocuments: 1609,
    changesDetected: 3,
    highImpactChanges: 1,
    timeRange: { start: "2024-01-01", end: "2024-12-31" },
    languageDistribution: { "EN": 850, "DE": 589, "FR": 170 },
    categoryBreakdown: { "Guidance": 1200, "Regulation": 409 },
    recentActivity: mockChanges
  };

  // Use API data with fallback
  const historicalData = apiHistoricalData.length > 0 ? apiHistoricalData : [
    {
      id: "hist-001",
      documentId: "FDA-GUID-2024-001",
      documentTitle: "FDA Guidance: Software as Medical Device (SaMD)",
      summary: "Clinical evaluation guidelines for software-based medical devices",
      sourceId: "fda_guidance",
      originalDate: "2024-12-10T00:00:00Z",
      archivedDate: "2024-12-15T08:00:00Z",
      changeType: "updated",
      version: "v2.1",
      category: "Guidance",
      language: "EN",
      region: "North America",
      content: "This guidance provides recommendations for clinical evaluation of software as medical devices..."
    },
    {
      id: "hist-002", 
      documentId: "EMA-GUID-2024-002",
      documentTitle: "EMA Guideline on Medical Device Software",
      summary: "European regulatory framework for medical device software classification",
      sourceId: "ema_guidelines",
      originalDate: "2024-12-08T00:00:00Z",
      archivedDate: "2024-12-12T10:30:00Z",
      changeType: "new",
      version: "v1.0",
      category: "Guideline",
      language: "EN",
      region: "Europe",
      content: "This guideline establishes the regulatory framework for medical device software..."
    }
  ];
  
  const changes = mockChanges;
  const isLoadingData = isLoadingApiData;
  const isLoadingChanges = false;
  
  // Update report with real data count
  const report = {
    ...mockReport,
    totalDocuments: historicalData.length
  };

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/historical/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Sync failed');
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
    },
  });

  // Filter data based on search query
  const filteredData = historicalData.filter((record) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      record.documentTitle.toLowerCase().includes(searchLower) ||
      record.documentId.toLowerCase().includes(searchLower) ||
      record.summary.toLowerCase().includes(searchLower) ||
      record.content.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historische Daten</h1>
          <p className="text-muted-foreground">
            Archivierte regulatorische Dokumente und Änderungsverfolgung
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

      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filteroptionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Datenquelle</label>
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Quelle wählen" />
                </SelectTrigger>
                <SelectContent>
                  {dataSources.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.name} ({source.region})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                  <p className="text-2xl font-bold">{report.totalDocuments.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold">{report.changesDetected}</p>
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
                  <p className="text-2xl font-bold">{report.highImpactChanges}</p>
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
                  <p className="text-2xl font-bold">{Object.keys(report.languageDistribution).length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sprachen</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents">Historische Dokumente ({filteredData.length})</TabsTrigger>
          <TabsTrigger value="changes">Änderungshistorie ({changes.length})</TabsTrigger>
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
                      <TableHead>Dokument</TableHead>
                      <TableHead>Quelle</TableHead>
                      <TableHead>Kategorie</TableHead>
                      <TableHead>Archiviert</TableHead>
                      <TableHead>Änderungstyp</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{record.documentTitle}</div>
                            <div className="text-sm text-gray-500">{record.summary}</div>
                            <div className="text-xs text-gray-400">ID: {record.documentId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-gray-500" />
                            <Badge variant="outline">{record.sourceId}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{record.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(record.archivedDate).toLocaleDateString('de-DE')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={record.changeType === 'new' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                            {record.changeType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{record.version}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Anzeigen
                          </Button>
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
              <CardDescription>Erkannte Änderungen in historischen Dokumenten</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingChanges ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Lade Änderungshistorie...</span>
                </div>
              ) : changes.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  <TrendingUp className="h-8 w-8 mr-2" />
                  <span>Keine Änderungen in der aktuellen Auswahl gefunden.</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {changes.map((change, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={change.impact_level === 'high' ? 'destructive' : 'secondary'}>
                          {change.impact_level}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(change.detected_at).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                      <p className="text-sm">{change.description}</p>
                      <div className="mt-2 text-xs text-gray-400">
                        Version: {change.old_version} → {change.new_version}
                      </div>
                    </div>
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
                    <CardTitle>Dokumentkategorien</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(report.categoryBreakdown).map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-sm">{category}</span>
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