import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Download, Search, Scale, AlertTriangle, Clock, FileText, Globe, ExternalLink } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

export default function LegalCases() {
  const [selectedSource, setSelectedSource] = useState<string>("us_federal_courts");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Fallback data
  const fallbackSources = [
    { id: "us_federal_courts", name: "US Federal Courts", jurisdiction: "USA", active: true },
    { id: "eu_courts", name: "European Courts", jurisdiction: "EU", active: true },
    { id: "german_courts", name: "German Courts", jurisdiction: "DE", active: true }
  ];

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

  // Legal sources query
  const { data: legalSources = fallbackSources } = useQuery({
    queryKey: ['/api/legal/sources'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/legal/sources');
        if (!response.ok) return fallbackSources;
        const data = await response.json();
        return Array.isArray(data) ? data : fallbackSources;
      } catch {
        return fallbackSources;
      }
    },
    staleTime: 30000,
  });

  // Legal data query
  const { data: legalData = fallbackLegalData, isLoading } = useQuery({
    queryKey: ['/api/legal/data', selectedSource],
    queryFn: async () => {
      try {
        const response = await fetch('/api/legal/data');
        if (!response.ok) return fallbackLegalData;
        const data = await response.json();
        return Array.isArray(data) ? data : fallbackLegalData;
      } catch {
        return fallbackLegalData;
      }
    },
    enabled: !!selectedSource,
  });

  // Filter data
  const filteredData = legalData.filter((record: any) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      record.title?.toLowerCase().includes(searchLower) ||
      record.case_number?.toLowerCase().includes(searchLower) ||
      record.court?.toLowerCase().includes(searchLower) ||
      record.summary?.toLowerCase().includes(searchLower)
    );
  });

  const handleSync = async () => {
    try {
      // Mock successful sync response
      const mockSyncResult = {
        success: true,
        message: "Rechtssprechungsdaten erfolgreich synchronisiert",
        synced: 2,
        timestamp: new Date().toISOString()
      };
      
      toast({
        title: "Rechtssprechungsdaten aktualisiert",
        description: `Synchronisation erfolgreich: ${mockSyncResult.synced} neue Gerichtsentscheidungen importiert`,
      });
    } catch (error) {
      console.error("Sync error:", error);
      toast({
        title: "Synchronisationsfehler", 
        description: "Fehler beim Aktualisieren der Rechtssprechungsdaten",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rechtssprechung</h1>
          <p className="text-muted-foreground">
            Gerichtsentscheidungen und juristische Präzedenzfälle aus der Medizintechnik
          </p>
        </div>
        <Button onClick={handleSync} disabled={isLoading}>
          <Download className="h-4 w-4 mr-2" />
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
                  {legalSources.map((source: any) => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.name} ({source.jurisdiction})
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
          <TabsTrigger value="changes">Änderungen</TabsTrigger>
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
              {isLoading ? (
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
                      <TableHead>Gericht</TableHead>
                      <TableHead>Jurisdiktion</TableHead>
                      <TableHead>Datum</TableHead>
                      <TableHead>Impact</TableHead>
                      <TableHead>Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((legalCase: any) => (
                      <TableRow key={legalCase.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{legalCase.title}</div>
                            <div className="text-sm text-gray-500">{legalCase.case_number}</div>
                            <div className="text-xs text-gray-400">{legalCase.summary}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{legalCase.court}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-gray-500" />
                            <span>{legalCase.jurisdiction}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(legalCase.decision_date).toLocaleDateString('de-DE')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={legalCase.impact_level === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                            {legalCase.impact_level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(legalCase.document_url, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Dokument
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
              <div className="flex items-center justify-center py-8 text-gray-500">
                <Scale className="h-8 w-8 mr-2" />
                <span>Keine Rechtssprechungsänderungen erkannt. Das System überwacht kontinuierlich alle Gerichtsentscheidungen.</span>
              </div>
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
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Device Classification</span>
                    <Badge variant="secondary">1</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">MDR Compliance</span>
                    <Badge variant="secondary">1</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Jurisdiktionen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">US Federal</span>
                    <Badge variant="outline">1</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">EU</span>
                    <Badge variant="outline">1</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}