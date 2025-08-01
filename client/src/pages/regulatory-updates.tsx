import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AISummary } from "@/components/ai-summary";
import { FormattedText } from "@/components/formatted-text";
import { Bell, FileText, Download, ExternalLink, Search, Globe, AlertTriangle, Clock, Eye, Filter, Shield, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDevice } from "@/hooks/use-device";
import { ResponsiveGrid } from "@/components/responsive-layout";
import { cn } from "@/lib/utils";

interface RegulatoryUpdate {
  id: string;
  title: string;
  description: string;
  source_id: string;
  source_url: string;
  region: string;
  update_type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  device_classes: any[];
  categories: any;
  published_at: string;
  created_at: string;
  content?: string;
  raw_data?: any;
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
  const device = useDevice();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [dateRange, setDateRange] = useState({
    start: "",
    end: ""
  });

  // Fetch regulatory updates
  const { data: updates, isLoading } = useQuery<RegulatoryUpdate[]>({
    queryKey: ['/api/regulatory-updates/recent?limit=5000'],
    staleTime: 5 * 60 * 1000,
  });

  const updatesArray = Array.isArray(updates) ? updates : [];
  
  // Debug output für Datenverbindung
  console.log(`REGULATORY UPDATES LOADED: ${updatesArray.length} Updates verfügbar`);

  // Filter logic
  const filteredUpdates = updatesArray.filter((update) => {
    if (searchTerm && !update.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !update.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (selectedRegion !== "all" && update.region !== selectedRegion) return false;
    if (selectedPriority !== "all" && update.priority !== selectedPriority) return false;
    if (selectedType !== "all" && update.update_type !== selectedType) return false;
    if (dateRange.start && new Date(update.published_at) < new Date(dateRange.start)) return false;
    if (dateRange.end && new Date(update.published_at) > new Date(dateRange.end)) return false;
    return true;
  });

  // Calculate filtered data for different tabs
  const highPriorityUpdates = filteredUpdates.filter(u => u.priority === 'high' || u.priority === 'urgent');
  const recentUpdates = filteredUpdates.filter(u => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(u.published_at) >= weekAgo;
  });

  // Statistics
  const totalUpdates = updatesArray.length;
  const filteredCount = filteredUpdates.length;
  const highPriorityCount = updatesArray.filter(u => u.priority === 'high' || u.priority === 'urgent').length;

  // Download handler
  const handleDownload = async (update: RegulatoryUpdate) => {
    try {
      const content = `HELIX REGULATORY UPDATE EXPORT
=====================================

Titel: ${update.title}
Region: ${update.region}
Typ: ${update.update_type}
Priorität: ${priorityLabels[update.priority]}
Veröffentlicht: ${new Date(update.published_at).toLocaleDateString('de-DE')}
Quelle: ${update.source_url}

BESCHREIBUNG:
${update.description || 'Keine Beschreibung verfügbar'}

${update.device_classes?.length ? `GERÄTEKLASSEN:\n${update.device_classes.join(', ')}` : ''}

EXPORT DETAILS:
- Exportiert am: ${new Date().toLocaleString('de-DE')}
- Helix Platform v2.0
- ID: ${update.id}
`;
      
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HELIX_${update.title.replace(/[^a-z0-9äöüß\s]/gi, '_').replace(/\s+/g, '_')}_${update.id.slice(0, 8)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download gestartet",
        description: `Regulatory Update "${update.title}" wurde heruntergeladen.`
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

  return (
    <div className={cn(
      "space-y-6",
      device.isMobile ? "p-4" : device.isTablet ? "p-6" : "p-8"
    )}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Regulatory Updates
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Aktuelle regulatorische Änderungen und Bestimmungen von FDA, EMA, BfArM
          </p>
        </div>
        <Button 
          onClick={() => toast({ title: "Synchronisierung", description: "Updates werden synchronisiert..." })}
          className="min-w-[180px]"
        >
          <Download className="h-4 w-4 mr-2" />
          Updates synchronisieren
        </Button>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filteroptionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
            
            <div>
              <label className="text-sm font-medium">Von Datum</label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            
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
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="updates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="updates" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Aktuelle Updates
          </TabsTrigger>
          <TabsTrigger value="priority" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Hohe Priorität
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Letzte 7 Tage
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Übersicht
          </TabsTrigger>
        </TabsList>

        {/* Current Updates Tab */}
        <TabsContent value="updates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Regulatory Updates ({filteredUpdates.length})
              </CardTitle>
              <CardDescription>
                Aktuelle regulatorische Änderungen und Bestimmungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[300px]">Update</TableHead>
                      <TableHead className="w-20">Region</TableHead>
                      <TableHead className="w-24">Typ</TableHead>
                      <TableHead className="w-24">Priorität</TableHead>
                      <TableHead className="w-32">Datum</TableHead>
                      <TableHead className="w-32">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={6}>
                            <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : filteredUpdates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                          <p className="text-lg font-medium">Keine Updates gefunden</p>
                          <p className="text-sm text-slate-600">Versuchen Sie andere Filterkriterien</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUpdates.map((update) => (
                        <TableRow key={update.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <TableCell>
                            <div className="space-y-2">
                              <p className="font-medium line-clamp-2">{update.title}</p>
                              <FormattedText 
                                content={update.description?.substring(0, 120) + '...' || 'Keine Beschreibung verfügbar'}
                                className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2"
                              />
                              <div className="flex flex-wrap gap-1">
                                {update.device_classes?.slice(0, 2).map((deviceClass, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {deviceClass}
                                  </Badge>
                                ))}
                                {update.device_classes?.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{update.device_classes.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{update.region}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs capitalize">{update.update_type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${priorityColors[update.priority]} text-xs`}>
                              {priorityLabels[update.priority]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            <div>{new Date(update.published_at).toLocaleDateString('de-DE')}</div>
                            <div className="text-slate-500">
                              {new Date(update.published_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle className="text-xl font-bold">{update.title}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-6">
                                    <AISummary 
                                      title={update.title}
                                      content={update.description}
                                      type="regulatory"
                                      priority={update.priority}
                                    />
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                      <div>
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Region</label>
                                        <p className="text-sm font-semibold">{update.region}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Typ</label>
                                        <p className="text-sm font-semibold capitalize">{update.update_type}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Priorität</label>
                                        <Badge className={priorityColors[update.priority]}>
                                          {priorityLabels[update.priority]}
                                        </Badge>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Veröffentlicht</label>
                                        <p className="text-sm">{new Date(update.published_at).toLocaleDateString('de-DE')}</p>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h3 className="text-lg font-semibold mb-3">Vollständige Beschreibung</h3>
                                      <FormattedText 
                                        content={update.description || 'Keine detaillierte Beschreibung verfügbar.'}
                                        className="text-sm leading-relaxed"
                                      />
                                    </div>

                                    {update.device_classes && update.device_classes.length > 0 && (
                                      <div>
                                        <h3 className="text-lg font-semibold mb-3">Betroffene Geräteklassen</h3>
                                        <div className="flex flex-wrap gap-2">
                                          {update.device_classes.map((deviceClass, idx) => (
                                            <Badge key={idx} variant="secondary">
                                              {deviceClass}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    <div className="flex gap-2 pt-4">
                                      <Button
                                        onClick={() => handleDownload(update)}
                                        className="flex items-center gap-2"
                                      >
                                        <Download className="h-4 w-4" />
                                        Volltext herunterladen
                                      </Button>
                                      
                                      <Button
                                        variant="outline"
                                        onClick={() => window.open(update.source_url, '_blank')}
                                        className="flex items-center gap-2"
                                        title="Originaldokument öffnen"
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                        Quelle öffnen
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(update)}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(update.source_url, '_blank')}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* High Priority Tab */}
        <TabsContent value="priority">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Hohe Priorität ({highPriorityUpdates.length})
              </CardTitle>
              <CardDescription>
                Updates mit hoher oder dringender Priorität
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveGrid cols={device.isMobile ? 1 : device.isTablet ? 2 : 3}>
                {highPriorityUpdates.map((update) => (
                  <Card key={update.id} className="border-l-4 border-l-red-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold line-clamp-2 text-sm">{update.title}</h3>
                        <Badge className={priorityColors[update.priority]}>
                          {priorityLabels[update.priority]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Badge variant="outline">{update.region}</Badge>
                        <span>•</span>
                        <span>{new Date(update.published_at).toLocaleDateString('de-DE')}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <FormattedText 
                        content={update.description?.substring(0, 150) + '...' || 'Keine Beschreibung verfügbar'}
                        className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3"
                      />
                      <div className="flex items-center gap-2 mt-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="flex-1">
                              <Eye className="h-3 w-3 mr-1" />
                              Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{update.title}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <AISummary 
                                title={update.title}
                                content={update.description}
                                type="regulatory"
                                priority={update.priority}
                              />
                              <FormattedText 
                                content={update.description || 'Keine detaillierte Beschreibung verfügbar.'}
                                className="text-sm leading-relaxed"
                              />
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(update.source_url, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </ResponsiveGrid>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Tab */}
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Letzte 7 Tage ({recentUpdates.length})
              </CardTitle>
              <CardDescription>
                Updates der letzten Woche
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUpdates.map((update) => (
                  <div key={update.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium line-clamp-2">{update.title}</h3>
                        <Badge className={priorityColors[update.priority]}>
                          {priorityLabels[update.priority]}
                        </Badge>
                      </div>
                      <FormattedText 
                        content={update.description?.substring(0, 200) + '...' || 'Keine Beschreibung verfügbar'}
                        className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2"
                      />
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <Badge variant="outline">{update.region}</Badge>
                        <span className="capitalize">{update.update_type}</span>
                        <span>{new Date(update.published_at).toLocaleDateString('de-DE')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{update.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <AISummary 
                              title={update.title}
                              content={update.description}
                              type="regulatory"
                              priority={update.priority}
                            />
                            <FormattedText 
                              content={update.description || 'Keine detaillierte Beschreibung verfügbar.'}
                              className="text-sm leading-relaxed"
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(update.source_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Gesamt Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUpdates}</div>
                <p className="text-xs text-gray-600">Alle verfügbaren Updates</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Hohe Priorität</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{highPriorityCount}</div>
                <p className="text-xs text-gray-600">Dringend oder hoch</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Diese Woche</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{recentUpdates.length}</div>
                <p className="text-xs text-gray-600">Letzte 7 Tage</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Gefiltert</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{filteredCount}</div>
                <p className="text-xs text-gray-600">Aktuelle Auswahl</p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Regionale Verteilung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {["US", "EU", "DE", "CH", "UK", "Global"].map(region => {
                  const count = updatesArray.filter(u => u.region === region).length;
                  return (
                    <div key={region} className="text-center">
                      <div className="text-lg font-bold">{count}</div>
                      <div className="text-sm text-gray-600">{region}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}