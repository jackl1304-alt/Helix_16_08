import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Download, Search, TrendingUp, AlertTriangle, Clock, FileText, Globe, Languages } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface HistoricalDataRecord {
  id: string;
  sourceId: string;
  documentId: string;
  documentTitle: string;
  documentUrl: string;
  content: string;
  metadata: Record<string, any>;
  originalDate: string;
  downloadedAt: string;
  version: number;
  checksum: string;
  language: string;
  region: string;
  category: string;
  deviceClasses: string[];
  status: 'active' | 'superseded' | 'archived';
}

interface ChangeDetection {
  documentId: string;
  changeType: 'new' | 'modified' | 'deleted' | 'superseded';
  previousVersion?: HistoricalDataRecord;
  currentVersion: HistoricalDataRecord;
  changesSummary: string[];
  impactAssessment: 'low' | 'medium' | 'high' | 'critical';
  affectedStakeholders: string[];
}

interface HistoricalReport {
  totalDocuments: number;
  timeRange: { start: string; end: string };
  changesDetected: number;
  highImpactChanges: number;
  categorization: Record<string, number>;
  languageDistribution: Record<string, number>;
  recentActivity: ChangeDetection[];
}

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

  // Historical data query
  const { data: historicalData = [], isLoading: isLoadingData } = useQuery<HistoricalDataRecord[]>({
    queryKey: ['/api/historical/data', selectedSource, dateRange.start, dateRange.end],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedSource) params.append('sourceId', selectedSource);
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);
      params.append('limit', '100');
      
      const response = await fetch(`/api/historical/data?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    enabled: !!selectedSource
  });

  // Changes query
  const { data: changes = [], isLoading: isLoadingChanges } = useQuery<ChangeDetection[]>({
    queryKey: ['/api/historical/changes'],
    queryFn: async () => {
      const response = await fetch('/api/historical/changes?limit=50');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    }
  });

  // Historical report query
  const { data: report, isLoading: isLoadingReport } = useQuery<HistoricalReport>({
    queryKey: ['/api/historical/report', selectedSource],
    queryFn: async () => {
      const response = await fetch(`/api/historical/report/${selectedSource}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{doc.documentTitle}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{doc.documentId}</p>
                          </div>
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
                            <span>{new Date(doc.originalDate).toLocaleDateString('de-DE')}</span>
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
                </div>
              ) : (
                <div className="space-y-4">
                  {changes.map((change, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{change.documentId}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge className={getImpactColor(change.impactAssessment)}>
                            {change.impactAssessment}
                          </Badge>
                          <Badge variant="outline">{change.changeType}</Badge>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(change.currentVersion.originalDate).toLocaleDateString('de-DE')}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Änderungen:</p>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
                          {change.changesSummary.map((summary, idx) => (
                            <li key={idx}>{summary}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-medium">Betroffene Stakeholder:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {change.affectedStakeholders.map(stakeholder => (
                            <Badge key={stakeholder} variant="secondary" className="text-xs">
                              {stakeholder}
                            </Badge>
                          ))}
                        </div>
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