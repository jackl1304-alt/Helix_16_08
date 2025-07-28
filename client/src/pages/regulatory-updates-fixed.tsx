import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PageLayout } from "@/components/ui/page-layout";
import { FilterBar } from "@/components/ui/filter-bar";
import { DataTable } from "@/components/ui/data-table";
import { Bell, FileText, Download, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RegulatoryUpdate {
  id: string;
  title: string;
  description: string;
  source_id: string;
  source_url: string;
  region: string;
  update_type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  device_classes: string[];
  categories: any;
  published_at: string;
  created_at: string;
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

export default function RegulatoryUpdatesFixed() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  const { data: updates, isLoading } = useQuery<RegulatoryUpdate[]>({
    queryKey: ["/api/regulatory-updates"],
    select: (data) => Array.isArray(data) ? data : [],
  });

  const filteredUpdates = (updates || []).filter(update => {
    const matchesSearch = !searchTerm || 
      update.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRegion = selectedRegion === 'all' || update.region === selectedRegion;
    const matchesPriority = selectedPriority === 'all' || update.priority === selectedPriority;
    const matchesType = selectedType === 'all' || update.update_type === selectedType;
    
    return matchesSearch && matchesRegion && matchesPriority && matchesType;
  });

  const downloadUpdate = (update: RegulatoryUpdate) => {
    try {
      const content = `
REGULATORY UPDATE - VOLLSTÄNDIGER EXPORT
========================================

Titel: ${update.title}
Beschreibung: ${update.description}

GRUNDINFORMATIONEN:
- ID: ${update.id}
- Quelle: ${update.source_id}
- Region: ${update.region}
- Priorität: ${update.priority}
- Typ: ${update.update_type}
- Veröffentlichungsdatum: ${new Date(update.published_at).toLocaleDateString('de-DE')}
- Erstellt am: ${new Date(update.created_at).toLocaleDateString('de-DE')}

GERÄTEKLASSEN:
${update.device_classes?.length ? update.device_classes.join(', ') : 'Nicht spezifiziert'}

KATEGORIEN:
${update.categories ? JSON.stringify(update.categories, null, 2) : 'Keine Kategorien verfügbar'}

QUELLE-URL:
${update.source_url || 'Nicht verfügbar'}

VOLLSTÄNDIGE ROHDATEN:
${JSON.stringify(update.raw_data, null, 2)}

========================================
Export erstellt am: ${new Date().toLocaleDateString('de-DE')} um ${new Date().toLocaleTimeString('de-DE')}
Helix Regulatory Intelligence Platform
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
        description: `Vollständiges Regulatory Update "${update.title}" wurde heruntergeladen.`
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

  const columns = [
    {
      key: "title",
      header: "Update",
      render: (update: RegulatoryUpdate) => (
        <div className="space-y-1">
          <p className="font-medium text-slate-900 dark:text-slate-100">{update.title}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{update.description}</p>
          <div className="flex flex-wrap gap-1">
            {update.device_classes?.map(deviceClass => (
              <Badge key={deviceClass} variant="secondary" className="text-xs">
                {deviceClass}
              </Badge>
            ))}
          </div>
        </div>
      )
    },
    {
      key: "region",
      header: "Region",
      render: (update: RegulatoryUpdate) => (
        <Badge variant="outline">{update.region}</Badge>
      )
    },
    {
      key: "update_type",
      header: "Typ",
      render: (update: RegulatoryUpdate) => (
        <Badge variant="outline" className="capitalize">
          {update.update_type}
        </Badge>
      )
    },
    {
      key: "priority",
      header: "Priorität",
      render: (update: RegulatoryUpdate) => (
        <Badge className={priorityColors[update.priority]}>
          {priorityLabels[update.priority]}
        </Badge>
      )
    },
    {
      key: "published_at",
      header: "Datum",
      render: (update: RegulatoryUpdate) => (
        <div className="text-sm">
          <div>{new Date(update.published_at).toLocaleDateString('de-DE')}</div>
          <div className="text-slate-500 dark:text-slate-400">
            {new Date(update.published_at).toLocaleTimeString('de-DE')}
          </div>
        </div>
      )
    }
  ];

  const filterOptions = [
    {
      label: "Region",
      value: selectedRegion,
      onChange: setSelectedRegion,
      options: [
        { value: "all", label: "Alle Regionen" },
        { value: "US", label: "USA (FDA)" },
        { value: "EU", label: "Europa (EMA)" },
        { value: "DE", label: "Deutschland (BfArM)" },
        { value: "CH", label: "Schweiz (Swissmedic)" },
        { value: "UK", label: "UK (MHRA)" }
      ]
    },
    {
      label: "Priorität",
      value: selectedPriority,
      onChange: setSelectedPriority,
      options: [
        { value: "all", label: "Alle Prioritäten" },
        { value: "urgent", label: "Dringend" },
        { value: "high", label: "Hoch" },
        { value: "medium", label: "Mittel" },
        { value: "low", label: "Niedrig" }
      ]
    },
    {
      label: "Typ",
      value: selectedType,
      onChange: setSelectedType,
      options: [
        { value: "all", label: "Alle Typen" },
        { value: "approval", label: "Zulassung" },
        { value: "guidance", label: "Leitfaden" },
        { value: "recall", label: "Rückruf" },
        { value: "standard", label: "Standard" },
        { value: "variation", label: "Variation" }
      ]
    }
  ];

  // Calculate statistics
  const totalUpdates = updates?.length || 0;
  const filteredCount = filteredUpdates.length;
  const highPriorityCount = (updates || []).filter(u => u.priority === 'high' || u.priority === 'urgent').length;
  const todayCount = (updates || []).filter(u => {
    const today = new Date().toDateString();
    const updateDate = new Date(u.published_at).toDateString();
    return updateDate === today;
  }).length;

  const DetailDialog = ({ update }: { update: RegulatoryUpdate }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" title="Vollständige Details anzeigen">
          <FileText className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-left">{update.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Region</label>
              <div><Badge variant="outline">{update.region}</Badge></div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Priorität</label>
              <div><Badge className={priorityColors[update.priority]}>{priorityLabels[update.priority]}</Badge></div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Typ</label>
              <div><Badge variant="outline">{update.update_type}</Badge></div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Datum</label>
              <p className="text-sm">{new Date(update.published_at).toLocaleDateString('de-DE')}</p>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Beschreibung</label>
            <p className="mt-1 text-sm">{update.description}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Vollständiger Inhalt & Details</label>
            <div className="mt-1 text-sm bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-2">
              <p><strong>Titel:</strong> {update.title}</p>
              <p><strong>Beschreibung:</strong> {update.description}</p>
              <p><strong>Quelle ID:</strong> {update.source_id}</p>
              <p><strong>Region:</strong> {update.region}</p>
              <p><strong>Priorität:</strong> {priorityLabels[update.priority]}</p>
              <p><strong>Typ:</strong> {update.update_type}</p>
              <p><strong>Veröffentlicht am:</strong> {new Date(update.published_at).toLocaleDateString('de-DE')}</p>
              <p><strong>Update ID:</strong> {update.id}</p>
              {update.source_url && (
                <p><strong>Quelle-URL:</strong> {update.source_url}</p>
              )}
            </div>
          </div>
          
          {update.device_classes?.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-500">Geräteklassen</label>
              <div className="mt-1 flex flex-wrap gap-1">
                {update.device_classes.map((deviceClass, idx) => (
                  <Badge key={idx} variant="secondary">{deviceClass}</Badge>
                ))}
              </div>
            </div>
          )}
          
          {update.categories && (
            <div>
              <label className="text-sm font-medium text-gray-500">Kategorien</label>
              <pre className="mt-1 text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto">
                {JSON.stringify(update.categories, null, 2)}
              </pre>
            </div>
          )}
          
          {update.raw_data && (
            <div>
              <label className="text-sm font-medium text-gray-500">Vollständige Rohdaten</label>
              <pre className="mt-1 text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto max-h-60">
                {JSON.stringify(update.raw_data, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={() => downloadUpdate(update)} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            {update.source_url && (
              <>
                <Button onClick={() => {
                  const sourceUrl = update.source_url;
                  let fullUrl = sourceUrl;
                  
                  if (!sourceUrl.startsWith('http')) {
                    if (sourceUrl.startsWith('/regulatory-updates/')) {
                      fullUrl = `https://www.accessdata.fda.gov${sourceUrl}`;
                    } else if (update.region === 'EU') {
                      fullUrl = `https://www.ema.europa.eu${sourceUrl}`;
                    } else if (update.region === 'DE') {
                      fullUrl = `https://www.bfarm.de${sourceUrl}`;
                    } else if (update.region === 'CH') {
                      fullUrl = `https://www.swissmedic.ch${sourceUrl}`;
                    } else {
                      fullUrl = `https://www.accessdata.fda.gov${sourceUrl}`;
                    }
                  }
                  
                  window.open(fullUrl, '_blank');
                }} variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Original-Quelle
                </Button>
                
                <Button onClick={() => {
                  // Alternative: Direkte Google-Suche nach dem Dokumententitel
                  const searchQuery = encodeURIComponent(`"${update.title}" site:bfarm.de OR site:ema.europa.eu OR site:fda.gov`);
                  const googleSearchUrl = `https://www.google.com/search?q=${searchQuery}`;
                  window.open(googleSearchUrl, '_blank');
                }} variant="outline" size="sm" title="Google-Suche nach diesem Dokument">
                  🔍 Suchen
                </Button>
                
                <Button onClick={() => {
                  // Bing-Suche für bessere internationale Ergebnisse
                  const searchQuery = encodeURIComponent(`"${update.title}" ${update.region} regulatory`);
                  const bingSearchUrl = `https://www.bing.com/search?q=${searchQuery}`;
                  window.open(bingSearchUrl, '_blank');
                }} variant="outline" size="sm" title="Bing-Suche nach diesem Dokument">
                  🔎 Bing
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <PageLayout
      title="Regulatory Updates"
      description="Aktuelle regulatorische Änderungen und Ankündigungen von globalen Gesundheitsbehörden"
      icon={Bell}
      stats={[
        { label: "Gesamt Updates", value: totalUpdates },
        { label: "Gefilterte Updates", value: filteredCount },
        { label: "Hohe Priorität", value: highPriorityCount },
        { label: "Heute", value: todayCount }
      ]}
    >
      <FilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Titel oder Beschreibung suchen..."
        filters={filterOptions}
        onReset={resetFilters}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="h-4 bg-blue-300 dark:bg-blue-700 rounded w-2/3"></div>
                  <div className="h-4 w-4 bg-blue-400 dark:bg-blue-600 rounded"></div>
                </div>
                <div className="h-6 bg-blue-200 dark:bg-blue-800 rounded w-full mb-2"></div>
                <div className="h-4 bg-blue-200 dark:bg-blue-800 rounded w-3/4"></div>
                <div className="flex justify-between items-center mt-3">
                  <div className="h-3 bg-blue-200 dark:bg-blue-800 rounded w-1/4"></div>
                  <div className="flex space-x-1">
                    <div className="h-6 w-6 bg-blue-300 dark:bg-blue-700 rounded"></div>
                    <div className="h-6 w-6 bg-blue-300 dark:bg-blue-700 rounded"></div>
                    <div className="h-6 w-6 bg-blue-300 dark:bg-blue-700 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DataTable
          title="Regulatory Updates"
          description="Klicken Sie auf das erste Icon für vollständige Details, das zweite für Download, das dritte für externe Quelle"
          icon={Bell}
          data={filteredUpdates}
          columns={columns}
          isLoading={false}
          emptyMessage="Keine Updates gefunden"
          emptyDescription="Versuchen Sie andere Filterkriterien"
          stats={{
            total: (updates || []).length,
            filtered: filteredUpdates.length
          }}
          rowActions={(update) => (
          <>
            <DetailDialog update={update} />
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => downloadUpdate(update)}
              title="Dokument herunterladen"
            >
              <Download className="h-4 w-4" />
            </Button>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  const sourceUrl = update.source_url;
                  if (sourceUrl && sourceUrl !== 'Nicht verfügbar') {
                    let fullUrl = sourceUrl;
                    
                    if (!sourceUrl.startsWith('http')) {
                      if (sourceUrl.startsWith('/regulatory-updates/')) {
                        fullUrl = `https://www.accessdata.fda.gov${sourceUrl}`;
                      } else if (update.region === 'EU') {
                        fullUrl = `https://www.ema.europa.eu${sourceUrl}`;
                      } else if (update.region === 'DE') {
                        fullUrl = `https://www.bfarm.de${sourceUrl}`;
                      } else if (update.region === 'CH') {
                        fullUrl = `https://www.swissmedic.ch${sourceUrl}`;
                      } else {
                        fullUrl = `https://www.accessdata.fda.gov${sourceUrl}`;
                      }
                    }
                    
                    window.open(fullUrl, '_blank');
                  } else {
                    toast({
                      title: "Link nicht verfügbar",
                      description: "Für dieses Update ist kein externer Link verfügbar.",
                      variant: "destructive"
                    });
                  }
                }}
                title="Original-Quelle öffnen"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  // Google-Suche nach dem Dokumententitel
                  const searchQuery = encodeURIComponent(`"${update.title}" site:bfarm.de OR site:ema.europa.eu OR site:fda.gov`);
                  const googleSearchUrl = `https://www.google.com/search?q=${searchQuery}`;
                  window.open(googleSearchUrl, '_blank');
                }}
                title="Google-Suche nach diesem Dokument"
                className="text-xs"
              >
                🔍
              </Button>
            </div>
          </>
        )}
        />
      )}
    </PageLayout>
  );
}