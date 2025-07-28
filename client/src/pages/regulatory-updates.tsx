import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DocumentViewer } from "@/components/document-viewer";
import { PageLayout, SectionCard } from "@/components/ui/page-layout";
import { FilterBar } from "@/components/ui/filter-bar";
import { DataTable } from "@/components/ui/data-table";
import { Bell, FileText, Download, ExternalLink } from "lucide-react";
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
    queryKey: ["/api/regulatory-updates"],
    select: (data) => Array.isArray(data) ? data : [],
  });

  const filteredUpdates = (updates || []).filter(update => {
    const matchesSearch = !searchTerm || 
      update.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRegion = selectedRegion === 'all' || update.region === selectedRegion;
    const matchesPriority = selectedPriority === 'all' || update.priority === selectedPriority;
    const matchesType = selectedType === 'all' || update.updateType === selectedType;
    
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
- Quelle: ${update.sourceId}
- Region: ${update.region}
- Priorität: ${update.priority}
- Typ: ${update.updateType}
- Veröffentlichungsdatum: ${update.publishedAt ? new Date(update.publishedAt).toLocaleDateString('de-DE') : 'Unbekannt'}
- Erstellt am: ${update.createdAt ? new Date(update.createdAt).toLocaleDateString('de-DE') : 'Unbekannt'}

GERÄTEKLASSEN:
${update.deviceClasses?.length ? update.deviceClasses.join(', ') : 'Nicht spezifiziert'}

KATEGORIEN:
${update.categories ? JSON.stringify(update.categories, null, 2) : 'Keine Kategorien verfügbar'}

QUELLE-URL:
${update.sourceUrl || 'Nicht verfügbar'}

VOLLSTÄNDIGE ROHDATEN:
${JSON.stringify(update.rawData, null, 2)}

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
            {update.deviceClasses?.map(deviceClass => (
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
      key: "updateType",
      header: "Typ",
      render: (update: RegulatoryUpdate) => (
        <Badge variant="outline" className="capitalize">
          {update.updateType}
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
      key: "publishedAt",
      header: "Datum",
      render: (update: RegulatoryUpdate) => (
        <div className="text-sm">
          <div>{new Date(update.publishedAt).toLocaleDateString('de-DE')}</div>
          <div className="text-slate-500 dark:text-slate-400">
            {new Date(update.publishedAt).toLocaleTimeString('de-DE')}
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
  const totalUpdates = updates?.length || 0;
  const filteredCount = filteredUpdates.length;
  const highPriorityCount = (updates || []).filter(u => u.priority === 'high' || u.priority === 'urgent').length;
  const todayCount = (updates || []).filter(u => {
    const today = new Date().toDateString();
    const updateDate = new Date(u.publishedAt).toDateString();
    return updateDate === today;
  }).length;

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

      <DataTable
        title="Regulatory Updates"
        description="Klicken Sie auf Volltext um das komplette Dokument anzuzeigen oder auf Download für Offline-Zugriff"
        icon={Bell}
        data={filteredUpdates}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Keine Updates gefunden"
        emptyDescription="Versuchen Sie andere Filterkriterien"
        stats={{
          total: (updates || []).length,
          filtered: filteredUpdates.length
        }}
        rowActions={(update) => (
          <>
            <DocumentViewer 
              document={{
                id: update.id,
                documentTitle: update.title,
                content: `
**Titel:** ${update.title}

**Beschreibung:** ${update.description}

**Quelle:** ${update.sourceId}

**Priorität:** ${update.priority}

**Typ:** ${update.updateType}

**Region:** ${update.region}

**Veröffentlichungsdatum:** ${update.publishedAt ? new Date(update.publishedAt).toLocaleDateString('de-DE') : 'Unbekannt'}

**Geräteklassen:** ${update.deviceClasses?.length ? update.deviceClasses.join(', ') : 'Nicht spezifiziert'}

**Kategorien:** ${update.categories ? JSON.stringify(update.categories, null, 2) : 'Keine Kategorien'}

**Vollständiger Inhalt:**
${update.description}

**Rohdaten:**
\`\`\`json
${JSON.stringify(update.rawData, null, 2)}
\`\`\`

**Quelle-URL:** ${update.sourceUrl || 'Nicht verfügbar'}
                `,
                sourceId: update.sourceId,
                originalDate: update.publishedAt,
                category: update.updateType,
                language: update.rawData?.language || 'de',
                deviceClasses: update.deviceClasses || [],
                metadata: {
                  fileType: 'Regulatory Update',
                  pageCount: update.rawData?.pages || 1,
                  language: update.rawData?.language || 'de',
                  lastModified: update.createdAt,
                  priority: update.priority,
                  region: update.region,
                  updateType: update.updateType
                },
                downloadedAt: update.createdAt
              }}
              trigger={
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4" />
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
              onClick={() => {
                if (update.sourceUrl) {
                  window.open(update.sourceUrl, '_blank');
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
    </PageLayout>
  );
}