import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PageLayout, SectionCard } from "@/components/ui/page-layout";
import { FilterBar } from "@/components/ui/filter-bar";
import { DataTable } from "@/components/ui/data-table";
import { AISummary } from "@/components/ai-summary";
import { FormattedText } from "@/components/formatted-text";
import { Bell, FileText, Download, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RegulatoryUpdate {
  id: string;
  title: string;
  description: string;
  source_id: string;        // Nur snake_case, wie in der Datenbank
  source_url: string;       
  region: string;
  update_type: string;      // Nur snake_case, wie in der Datenbank
  priority: 'low' | 'medium' | 'high' | 'urgent';
  device_classes: any[];    // JSONB array aus der Datenbank
  categories: any;          // JSONB aus der Datenbank
  published_at: string;     // Nur snake_case, wie in der Datenbank
  created_at: string;       // Nur snake_case, wie in der Datenbank
  content?: string;
  raw_data?: any;           // Nur snake_case, wie in der Datenbank
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

  const { data: updates, isLoading, error: updatesError } = useQuery<any>({
    queryKey: ["/api/regulatory-updates/recent", { limit: 5000 }],
    staleTime: 30000,
    gcTime: 60000,
    refetchOnMount: true,
  });

  // Echte Regulatory Updates mit authentischen Inhalten werden geladen

  // Sicherstellen, dass updates ein Array ist
  const updatesArray = Array.isArray(updates) ? updates : ((updates as any)?.data || (updates as any)?.updates || []);
  
  // Filter GRIP-specific data
  const gripUpdates = (updatesArray || []).filter((update: RegulatoryUpdate) => update.source_id === 'grip_platform');
  
  const filteredUpdates = (updatesArray || []).filter((update: RegulatoryUpdate) => {
    const matchesSearch = !searchTerm || 
      update.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRegion = selectedRegion === 'all' || update.region === selectedRegion;
    const matchesPriority = selectedPriority === 'all' || update.priority === selectedPriority;
    const matchesType = selectedType === 'all' || update.update_type === selectedType;
    
    return matchesSearch && matchesRegion && matchesPriority && matchesType;
  });



  const downloadUpdate = async (update: RegulatoryUpdate) => {
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
- Veröffentlichungsdatum: ${update.published_at ? new Date(update.published_at).toLocaleDateString('de-DE') : 'Unbekannt'}
- Erstellt am: ${update.created_at ? new Date(update.created_at).toLocaleDateString('de-DE') : 'Unbekannt'}

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
      className: "min-w-[300px] max-w-[400px]",
      render: (update: RegulatoryUpdate) => (
        <div className="space-y-2">
          <p className="font-medium text-slate-900 dark:text-slate-100 line-clamp-2 leading-tight">
            {update.title}
          </p>
          <FormattedText 
            content={update.description?.substring(0, 120) + '...' || 'Keine Beschreibung verfügbar'}
            className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2"
            maxHeight="max-h-10"
          />
          <div className="flex flex-wrap gap-1">
            {update.device_classes?.slice(0, 2).map((deviceClass, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs py-0 px-1">
                {deviceClass}
              </Badge>
            ))}
            {update.device_classes?.length > 2 && (
              <Badge variant="secondary" className="text-xs py-0 px-1">
                +{update.device_classes.length - 2}
              </Badge>
            )}
          </div>
        </div>
      )
    },
    {
      key: "region",
      header: "Region",
      className: "min-w-[80px] w-[80px]",
      render: (update: RegulatoryUpdate) => (
        <Badge variant="outline" className="text-xs whitespace-nowrap">
          {update.region}
        </Badge>
      )
    },
    {
      key: "updateType",
      header: "Typ",
      className: "min-w-[100px] w-[100px]",
      render: (update: RegulatoryUpdate) => (
        <Badge variant="outline" className="text-xs capitalize whitespace-nowrap">
          {update.update_type}
        </Badge>
      )
    },
    {
      key: "priority",
      header: "Priorität",
      className: "min-w-[90px] w-[90px]",
      render: (update: RegulatoryUpdate) => (
        <Badge className={`${priorityColors[update.priority]} text-xs whitespace-nowrap`}>
          {priorityLabels[update.priority]}
        </Badge>
      )
    },
    {
      key: "publishedAt",
      header: "Datum",
      className: "min-w-[120px] w-[120px]",
      render: (update: RegulatoryUpdate) => (
        <div className="text-xs">
          <div className="font-medium">{new Date(update.published_at).toLocaleDateString('de-DE')}</div>
          <div className="text-slate-500 dark:text-slate-400">
            {new Date(update.published_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
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
        { value: "safety_alert", label: "Sicherheitshinweis" }
      ]
    }
  ];

  // Calculate statistics
  const totalUpdates = updatesArray?.length || 0;
  const filteredCount = filteredUpdates.length;
  const highPriorityCount = (updatesArray || []).filter((u: any) => u.priority === 'high' || u.priority === 'urgent').length;
  const todayCount = (updatesArray || []).filter((u: any) => {
    const today = new Date().toDateString();
    const updateDate = new Date(u.published_at).toDateString();
    return updateDate === today;
  }).length;

  return (
    <PageLayout
      title="Regulatory Updates"
      description="Authentische regulatorische Updates von FDA, EMA, BfArM - Demo Content für Helix Platform"
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

      <div className="overflow-x-auto">
        <DataTable
          title="Regulatory Updates"
          description="Klicken Sie auf Volltext um das komplette Dokument anzuzeigen oder auf Download für Offline-Zugriff"
          icon={Bell}
          data={filteredUpdates}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="Keine Updates gefunden"
          emptyDescription="Versuchen Sie andere Filterkriterien"
          className="min-w-[800px]"
          stats={{
            total: (updates || []).length,
            filtered: filteredUpdates.length
          }}
          rowActions={(update) => (
          <>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" title="Vollständige Details anzeigen">
                  <FileText className="h-4 w-4" />
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
                      <label className="text-sm font-medium text-gray-500">Region</label>
                      <Badge variant="outline">{update.region}</Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Priorität</label>
                      <Badge className={priorityColors[update.priority]}>{priorityLabels[update.priority]}</Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Typ</label>
                      <Badge variant="outline">{update.update_type}</Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Datum</label>
                      <p className="text-sm">{new Date(update.published_at).toLocaleDateString('de-DE')}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Beschreibung</label>
                    <div className="mt-1 bg-blue-50 p-4 rounded border">
                      <FormattedText 
                        content={update.description || 'Keine Beschreibung verfügbar'} 
                        className="text-sm leading-relaxed"
                        maxHeight="max-h-40"
                      />
                    </div>
                  </div>
                  
                  {update.content && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Vollständiger Inhalt</label>
                      <div className="mt-1 bg-yellow-50 p-3 rounded border max-h-60 overflow-y-auto">
                        <FormattedText 
                          content={update.content || 'Kein vollständiger Inhalt verfügbar'}
                          className="text-sm leading-relaxed"
                          maxHeight="max-h-52"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Vollständiger Inhalt</label>
                    <div className="mt-1 text-sm bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-2">
                      <div><strong>Titel:</strong> <span className="text-blue-600">{update.title || 'Nicht verfügbar'}</span></div>
                      <div><strong>Beschreibung:</strong> <span className="text-green-600">{update.description || 'Keine Beschreibung vorhanden'}</span></div>
                      <div><strong>Quelle ID:</strong> <span className="text-purple-600">{update.source_id || 'Keine Quelle-ID'}</span></div>
                      <div><strong>Region:</strong> <span className="text-orange-600">{update.region || 'Unbekannt'}</span></div>
                      <div><strong>Priorität:</strong> <span className="text-red-600">{priorityLabels[update.priority] || update.priority || 'Nicht gesetzt'}</span></div>
                      <div><strong>Typ:</strong> <span className="text-indigo-600">{update.update_type || 'Nicht klassifiziert'}</span></div>
                      <div><strong>Veröffentlicht am:</strong> <span className="text-gray-600">{update.published_at ? new Date(update.published_at).toLocaleDateString('de-DE') : 'Kein Datum'}</span></div>
                      {update.source_url && (
                        <div><strong>Quelle-URL:</strong> <span className="text-blue-500 break-all">{update.source_url}</span></div>
                      )}
                      {!update.source_url && (
                        <div><strong>Quelle-URL:</strong> <span className="text-gray-400">Nicht verfügbar</span></div>
                      )}
                    </div>
                  </div>
                  
                  {/* Entfernt: DEBUG-Sektion für finales System */}
                  
                  {(update.device_classes?.length > 0) && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Geräteklassen</label>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {(update.device_classes || []).map((deviceClass: string, idx: number) => (
                          <Badge key={idx} variant="secondary">{deviceClass}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {update.categories && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Kategorien</label>
                      <div className="mt-1 text-sm bg-blue-50 p-3 rounded space-y-1">
                        {typeof update.categories === 'object' && update.categories ? (
                          <>
                            {update.categories.deviceType && <div><strong>Gerätetyp:</strong> {update.categories.deviceType}</div>}
                            {update.categories.riskLevel && <div><strong>Risikostufe:</strong> {update.categories.riskLevel}</div>}
                            {update.categories.therapeuticArea && <div><strong>Therapiebereich:</strong> {update.categories.therapeuticArea}</div>}
                            {update.categories.regulatoryPathway && <div><strong>Zulassungsweg:</strong> {update.categories.regulatoryPathway}</div>}
                          </>
                        ) : (
                          <div>Keine Kategorien verfügbar</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {update.raw_data && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Dokumentenmetadaten</label>
                      <div className="mt-1 text-sm bg-green-50 p-3 rounded space-y-1">
                        {typeof update.raw_data === 'object' && update.raw_data ? (
                          <>
                            {update.raw_data.originalSource && <div><strong>Originalquelle:</strong> {update.raw_data.originalSource}</div>}
                            {update.raw_data.processingDate && <div><strong>Verarbeitet am:</strong> {new Date(update.raw_data.processingDate).toLocaleDateString('de-DE')}</div>}
                            {update.raw_data.dataQuality && <div><strong>Datenqualität:</strong> {update.raw_data.dataQuality}</div>}
                            {update.raw_data.verification && <div><strong>Verifizierung:</strong> {update.raw_data.verification}</div>}
                          </>
                        ) : (
                          <div>Keine Metadaten verfügbar</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-4 border-t">
                    <Button onClick={() => downloadUpdate(update)} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    {update.source_url && (
                      <Button onClick={() => {
                        const sourceUrl = update.source_url;
                        let fullUrl = sourceUrl;
                        
                        // Erstelle vollständige URLs für verschiedene Quellen
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
                        Quelle öffnen
                      </Button>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
              title="Quelle in neuem Fenster öffnen"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </>
        )}
        />
      </div>
    </PageLayout>
  );
}