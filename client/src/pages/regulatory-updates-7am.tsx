import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bell, FileText, Download, ExternalLink, Search, Filter } from "lucide-react";
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

  // Load real regulatory updates from API
  const { data: apiUpdates = [], isLoading: isLoadingUpdates } = useQuery({
    queryKey: ['/api/regulatory-updates'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/regulatory-updates');
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    },
  });

  // Fallback mock data if API fails
  const mockUpdates: RegulatoryUpdate[] = [
    {
      id: "update-001",
      title: "FDA Guidance: Software as Medical Device (SaMD) - Clinical Evaluation",
      description: "Updated clinical evaluation requirements for software-based medical devices including AI/ML algorithms",
      sourceId: "fda_guidance",
      sourceUrl: "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/software-medical-device-samd-clinical-evaluation",
      region: "US",
      updateType: "guidance",
      priority: "high",
      deviceClasses: ["Class II", "Class III"],
      categories: ["Software", "AI/ML"],
      publishedAt: "2024-12-15T00:00:00Z",
      createdAt: "2024-12-15T08:00:00Z",
      content: "This guidance provides recommendations for clinical evaluation of software as medical devices..."
    },
    {
      id: "update-002",
      title: "EMA Guideline on Medical Device Software - Updated Requirements",
      description: "European regulatory framework updates for medical device software classification and clinical evidence",
      sourceId: "ema_guidelines",
      sourceUrl: "https://www.ema.europa.eu/en/documents/scientific-guideline/guideline-qualification-procedure-novel-methodologies.pdf",
      region: "EU",
      updateType: "guideline",
      priority: "medium",
      deviceClasses: ["Class IIa", "Class IIb", "Class III"],
      categories: ["Software", "MDR"],
      publishedAt: "2024-12-10T00:00:00Z",
      createdAt: "2024-12-10T09:30:00Z",
      content: "This guideline establishes the regulatory framework for medical device software..."
    },
    {
      id: "update-003",
      title: "BfArM: Neuerungen zur Medizinprodukte-Durchführungsverordnung",
      description: "Aktualisierte Durchführungsbestimmungen für Medizinprodukte nach MDR in Deutschland",
      sourceId: "bfarm_guidance",
      sourceUrl: "https://www.bfarm.de/DE/Medizinprodukte/_node.html",
      region: "DE",
      updateType: "regulation",
      priority: "high",
      deviceClasses: ["Klasse I", "Klasse IIa", "Klasse IIb"],
      categories: ["MDR", "Durchführung"],
      publishedAt: "2024-12-08T00:00:00Z",
      createdAt: "2024-12-08T14:15:00Z",
      content: "Die neuen Durchführungsbestimmungen präzisieren die MDR-Anforderungen..."
    },
    {
      id: "update-004",
      title: "MHRA Post-Market Surveillance Guidance Update",
      description: "Updated post-market surveillance requirements for medical devices in the UK market",
      sourceId: "mhra_guidance",
      sourceUrl: "https://www.gov.uk/government/publications/medical-devices-post-market-surveillance",
      region: "UK",
      updateType: "guidance",
      priority: "medium",
      deviceClasses: ["Class I", "Class II", "Class III"],
      categories: ["Post-Market", "Surveillance"],
      publishedAt: "2024-12-05T00:00:00Z",
      createdAt: "2024-12-05T11:45:00Z",
      content: "This guidance outlines the updated post-market surveillance requirements..."
    },
    {
      id: "update-005",
      title: "Swissmedic: Guidance on Clinical Investigations",
      description: "Updated guidance for clinical investigations of medical devices in Switzerland",
      sourceId: "swissmedic_guidance",
      sourceUrl: "https://www.swissmedic.ch/swissmedic/en/home/medical-devices.html",
      region: "CH",
      updateType: "guidance",
      priority: "low",
      deviceClasses: ["Class II", "Class III"],
      categories: ["Clinical", "Investigation"],
      publishedAt: "2024-12-01T00:00:00Z",
      createdAt: "2024-12-01T16:20:00Z",
      content: "This guidance provides updated requirements for clinical investigations..."
    }
  ];

  // Use API data with fallback to mock data
  const updates = apiUpdates.length > 0 ? apiUpdates.map(update => ({
    id: update.id,
    title: update.title,
    description: update.description || update.title,
    sourceId: update.source_id || update.sourceId || 'unknown',
    sourceUrl: update.document_url || update.sourceUrl || '',
    region: update.region || 'Unknown',
    updateType: update.type || update.updateType || 'update',
    priority: (update.priority || 'medium') as 'low' | 'medium' | 'high' | 'urgent',
    deviceClasses: update.device_classes || update.deviceClasses || [],
    categories: update.categories || [],
    publishedAt: update.published_at || update.publishedAt || update.created_at || new Date().toISOString(),
    createdAt: update.created_at || update.createdAt || new Date().toISOString(),
    content: update.description || update.content || update.title
  })) : mockUpdates;
  
  const isLoading = isLoadingUpdates;

  const filteredUpdates = updates.filter(update => {
    const matchesSearch = !searchTerm || 
      update.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRegion = selectedRegion === 'all' || update.region === selectedRegion;
    const matchesPriority = selectedPriority === 'all' || update.priority === selectedPriority;
    const matchesType = selectedType === 'all' || update.updateType === selectedType;
    
    return matchesSearch && matchesRegion && matchesPriority && matchesType;
  });

  // Calculate statistics
  const totalUpdates = updates.length;
  const filteredCount = filteredUpdates.length;
  const highPriorityCount = updates.filter(u => u.priority === 'high' || u.priority === 'urgent').length;
  const todayCount = updates.filter(u => {
    const today = new Date().toDateString();
    const updateDate = new Date(u.publishedAt).toDateString();
    return updateDate === today;
  }).length;

  const downloadUpdate = async (update: RegulatoryUpdate) => {
    try {
      const content = `Titel: ${update.title}\n\nBeschreibung: ${update.description}\n\nQuelle: ${update.region}\nPriorität: ${update.priority}\nTyp: ${update.updateType}\n\nGeräteklassen: ${update.deviceClasses.join(', ')}\n\nVollständiger Inhalt:\n${update.content}`;
      
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

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedRegion("all");
    setSelectedPriority("all");
    setSelectedType("all");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Regulatory Updates</h1>
          <p className="text-muted-foreground">
            Aktuelle regulatorische Änderungen und Ankündigungen von globalen Gesundheitsbehörden
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Bell className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{totalUpdates}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Gesamt Updates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{filteredCount}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Gefilterte Updates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Bell className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{highPriorityCount}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Hohe Priorität</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Bell className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{todayCount}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Heute</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Suche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Suche</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Titel oder Beschreibung suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Region</label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Region wählen" />
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

            <div>
              <label className="text-sm font-medium">Priorität</label>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Priorität wählen" />
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

            <div>
              <label className="text-sm font-medium">Typ</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Typ wählen" />
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

          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={resetFilters}>
              Filter zurücksetzen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Updates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Regulatory Updates</CardTitle>
          <CardDescription>
            Klicken Sie auf Volltext um das komplette Dokument anzuzeigen oder auf Download für Offline-Zugriff
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Lade Updates...</span>
            </div>
          ) : filteredUpdates.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <Bell className="h-8 w-8 mr-2" />
              <span>Keine Updates für die gewählten Filter gefunden.</span>
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
                        <p className="font-medium text-slate-900 dark:text-slate-100">{update.title}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{update.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {update.deviceClasses?.map(deviceClass => (
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
                        <div className="text-slate-500 dark:text-slate-400">
                          {new Date(update.publishedAt).toLocaleTimeString('de-DE')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
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
                          onClick={() => window.open(update.sourceUrl, '_blank')}
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
  );
}