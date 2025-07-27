import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentViewer } from "@/components/document-viewer";
import { Search, Filter, Bell, AlertTriangle, FileText, Download, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RegulatoryUpdate {
  id: string;
  title: string;
  description: string;
  sourceId: string;
  sourceUrl: string;
  region: string;
  updateType: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deviceClasses: string[];
  categories: string[];
  publishedAt: string;
  createdAt: string;
  content: string;
  rawData?: {
    source: string;
    documentType: string;
    pages: number;
    language: string;
  };
}

const priorityColors = {
  urgent: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  low: 'bg-blue-50 text-blue-700 border-blue-200'
};

const priorityLabels = {
  urgent: 'Dringend',
  high: 'Hoch',
  medium: 'Mittel',
  low: 'Niedrig'
};

export default function RegulatoryUpdates() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  const { data: updates, isLoading } = useQuery<RegulatoryUpdate[]>({
    queryKey: ["/api/regulatory-updates", { 
      region: selectedRegion === 'all' ? undefined : selectedRegion,
      priority: selectedPriority === 'all' ? undefined : selectedPriority,
      limit: 100 
    }],
    select: (data) => Array.isArray(data) ? data : [],
  });

  const filteredUpdates = (updates || []).filter(update => {
    const matchesSearch = !searchTerm || 
      update.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || update.updateType === selectedType;
    
    return matchesSearch && matchesType;
  });

  const downloadUpdate = async (update: RegulatoryUpdate) => {
    try {
      const response = await fetch(`/api/regulatory-updates/${update.id}`);
      const fullUpdate = await response.json();
      const content = fullUpdate.content || `Titel: ${update.title}\n\nBeschreibung: ${update.description}\n\nQuelle: ${update.region}\nPriorität: ${update.priority}\nTyp: ${update.updateType}\n\nVollständiger Inhalt:\n${update.content}`;
      
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${update.title.replace(/[^a-z0-9äöüß\s]/gi, '_').replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download gestartet",
        description: "Regulatorisches Update wird heruntergeladen."
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download-Fehler",
        description: "Dokument konnte nicht heruntergeladen werden.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Regulatory Updates</h1>
          <p className="text-gray-600 mt-2">
            Aktuelle regulatorische Änderungen und Ankündigungen von globalen Gesundheitsbehörden
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter & Suche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Suche</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Titel oder Beschreibung..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Region</label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Alle Regionen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Regionen</SelectItem>
                    <SelectItem value="US">USA (FDA)</SelectItem>
                    <SelectItem value="EU">Europa (EMA)</SelectItem>
                    <SelectItem value="DE">Deutschland (BfArM)</SelectItem>
                    <SelectItem value="CH">Schweiz (Swissmedic)</SelectItem>
                    <SelectItem value="UK">UK (MHRA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priorität</label>
                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Alle Prioritäten" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Prioritäten</SelectItem>
                    <SelectItem value="urgent">Dringend</SelectItem>
                    <SelectItem value="high">Hoch</SelectItem>
                    <SelectItem value="medium">Mittel</SelectItem>
                    <SelectItem value="low">Niedrig</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Typ</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Alle Typen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Typen</SelectItem>
                    <SelectItem value="approval">Zulassung</SelectItem>
                    <SelectItem value="guidance">Leitfaden</SelectItem>
                    <SelectItem value="recall">Rückruf</SelectItem>
                    <SelectItem value="safety_alert">Sicherheitshinweis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Regulatory Updates ({filteredUpdates.length})
              </CardTitle>
              <Badge variant="outline" className="text-sm">
                {filteredUpdates.length} von {(updates || []).length} Updates
              </Badge>
            </div>
            <CardDescription>
              Klicken Sie auf "Volltext" um das komplette Dokument anzuzeigen oder auf "Download" für Offline-Zugriff
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredUpdates.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-gray-500">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">Keine Updates gefunden</p>
                  <p className="text-sm">Versuchen Sie andere Filterkriterien</p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Update</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Priorität</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUpdates.map((update) => (
                    <TableRow key={update.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">{update.title}</p>
                          <p className="text-sm text-gray-600 line-clamp-2">{update.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {update.deviceClasses.map(deviceClass => (
                              <Badge key={deviceClass} variant="secondary" className="text-xs">
                                {deviceClass}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{update.region}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {update.updateType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={priorityColors[update.priority]}>
                          {priorityLabels[update.priority]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(update.publishedAt).toLocaleDateString('de-DE')}</div>
                          <div className="text-gray-500">{new Date(update.publishedAt).toLocaleTimeString('de-DE')}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <DocumentViewer 
                            document={{
                              id: update.id,
                              documentTitle: update.title,
                              content: update.content,
                              sourceId: update.sourceId,
                              originalDate: update.publishedAt,
                              category: update.updateType,
                              language: update.rawData?.language || 'de',
                              deviceClasses: update.deviceClasses,
                              metadata: {
                                fileType: 'Regulatory Update',
                                pageCount: update.rawData?.pages || 1,
                                language: update.rawData?.language || 'de',
                                lastModified: update.createdAt
                              },
                              downloadedAt: update.createdAt
                            }}
                            trigger={
                              <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4 mr-1" />
                                Volltext
                              </Button>
                            }
                          />
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => downloadUpdate(update)}
                            title="Dokument herunterladen"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.location.href = `/documents/${update.sourceId}/${update.id}`}
                            title="In neuem Fenster öffnen"
                          >
                            <ExternalLink className="h-4 w-4" />
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
      </div>
    </div>
  );
}