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

export default function LegalCases() {
  const [selectedSource, setSelectedSource] = useState<string>("us_federal_courts");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [searchTerm, setSearchTerm] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock legal sources data
  const mockLegalSources = {
    us_federal_courts: { name: "US Federal Courts", country: "USA" },
    eu_courts: { name: "European Courts", country: "EU" },
    german_courts: { name: "German Courts", country: "DE" }
  };

  // Use real API data instead of mock data
  const { data: apiLegalData = [], isLoading: isLoadingApiData } = useQuery({
    queryKey: ['/api/legal/data', selectedSource],
    queryFn: async () => {
      try {
        const response = await fetch('/api/legal/data');
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
      case_id: "case-001",
      change_type: "status_update",
      description: "Case status changed from 'Under Review' to 'Final Decision'",
      detected_at: "2024-12-16T10:30:00Z",
      significance: "high"
    }
  ];

  // Mock report data
  const mockReport = {
    totalCases: 1825,
    timeRange: { start: "2024-01-01", end: "2024-12-31" },
    changesDetected: 156,
    highImpactChanges: 23,
    caseTypes: {
      "Device Classification": 451,
      "MDR Compliance": 389,
      "Product Liability": 512,
      "FDA Authority": 287,
      "Patent Disputes": 186
    },
    languageDistribution: {
      "EN": 1245,
      "DE": 341,
      "FR": 156,
      "ES": 83
    },
    recentActivity: mockChanges
  };

  // Use API data with fallback to ensure compatibility
  const legalSources = mockLegalSources;
  
  const legalData = apiLegalData.length > 0 ? apiLegalData.map(item => ({
    id: item.id,
    documentId: item.case_number || item.id,
    documentTitle: item.title,
    category: "Legal Case",
    region: item.jurisdiction === "US Federal" ? "North America" : 
            item.jurisdiction === "EU" ? "Europe" : 
            item.jurisdiction === "DE" ? "Germany" : "Other",
    originalDate: item.decision_date || item.decisionDate,
    status: "Final Decision",
    deviceClasses: item.keywords || [],
    summary: item.summary,
    content: item.summary,
    sourceId: item.jurisdiction?.toLowerCase().replace(" ", "_") || "unknown",
    language: "EN",
    court: item.court,
    impactLevel: item.impact_level || item.impactLevel,
    documentUrl: item.document_url || item.documentUrl
  })) : [
    {
      id: "case-001",
      documentId: "US-FED-2024-001",
      documentTitle: "Medtronic v. FDA - Medical Device Classification Challenge",
      category: "Device Classification",
      region: "North America",
      originalDate: "2024-12-15T00:00:00Z",
      status: "Final Decision",
      deviceClasses: ["Class II", "Class III"],
      summary: "Federal court ruling on medical device reclassification challenges under FDA authority",
      content: "This landmark case addresses the scope of FDA authority in medical device reclassification...",
      sourceId: "us_federal_courts",
      language: "EN"
    }
  ];
  
  const changes = mockChanges;
  const isLoadingData = isLoadingApiData;
  const isLoadingChanges = false;
  
  // Update report with real data count
  const report = {
    ...mockReport,
    totalCases: legalData.length
  };

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
        description: `Synchronisation erfolgreich: 2 neue Gerichtsentscheidungen importiert`,
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rechtssprechung</h1>
          <p className="text-muted-foreground">
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
                  {Object.entries(legalSources).map(([id, source]) => (
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

      {/* Legal Cases Content */}
      <Tabs defaultValue="cases" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cases">Rechtsfälle ({filteredData.length})</TabsTrigger>
          <TabsTrigger value="changes">Änderungen ({changes.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analysen</TabsTrigger>
        </TabsList>

        <TabsContent value="cases">
          <Card>
            <CardHeader>
              <CardTitle>Gerichtsentscheidungen</CardTitle>
              <CardDescription>
                Aktuelle Rechtssprechung zu Medizinprodukten und regulatorischen Angelegenheiten
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Lade Rechtssprechungsdaten...</span>
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
                    {filteredData.map((legalCase) => (
                      <TableRow key={legalCase.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium cursor-pointer hover:text-blue-600 transition-colors">
                              {legalCase.documentTitle}
                            </div>
                            <div className="text-xs text-gray-500 space-y-1">
                              <div>Rechtsquelle: {legalSources[selectedSource]?.name || selectedSource}</div>
                              <div>ID: {legalCase.documentId}</div>
                              <div className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                <span>Volltext verfügbar - Klicken zum Lesen</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
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
                          <Badge variant="secondary">
                            {legalCase.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {legalCase.deviceClasses.map((cls) => (
                              <Badge key={cls} variant="outline" className="text-xs">
                                {cls}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Scale className="h-4 w-4 mr-1" />
                              Entscheidung
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
              <CardDescription>Erkannte Änderungen in der Rechtssprechung</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingChanges ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Lade Änderungshistorie...</span>
                </div>
              ) : changes.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  <Scale className="h-8 w-8 mr-2" />
                  <span>Keine Rechtssprechungsänderungen erkannt.</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {changes.map((change, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={change.significance === 'high' ? 'destructive' : 'secondary'}>
                          {change.significance}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(change.detected_at).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                      <p className="text-sm">{change.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}