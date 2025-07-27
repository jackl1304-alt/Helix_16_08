import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  ExternalLink, 
  Download, 
  Calendar,
  Globe,
  Tag,
  Hash,
  Languages,
  Building
} from "lucide-react";
import { HistoricalDataRecord } from "@shared/schema";

interface DocumentViewerProps {
  document: HistoricalDataRecord;
  trigger?: React.ReactNode;
}

export function DocumentViewer({ document, trigger }: DocumentViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatContent = (content: string) => {
    // Formatiere den Inhalt für bessere Lesbarkeit
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'superseded': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  const openInNewWindow = () => {
    if (document.documentUrl) {
      window.open(document.documentUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const downloadDocument = () => {
    // Erstelle einen Download-Link für das Dokument
    const blob = new Blob([document.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.documentTitle.replace(/[^a-z0-9]/gi, '_')}.txt`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="h-auto p-0 font-normal justify-start">
            <FileText className="h-4 w-4 mr-2" />
            {document.documentTitle}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-8">
            <FileText className="h-5 w-5" />
            {document.documentTitle}
          </DialogTitle>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Vollständiges Rechtsdokument - Klicken Sie auf die Links unten für weitere Details oder Download
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(90vh-8rem)]">
          {/* Dokument-Metadaten */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-base">Dokument-Informationen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge className={getStatusColor(document.status)}>
                      {document.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Version:</span>
                    <Badge variant="outline">{document.version}</Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {new Date(document.originalDate).toLocaleDateString('de-DE')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{document.region}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{document.language}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{document.category}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{document.documentId}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{document.metadata.authority}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium">Geräteklassen:</span>
                    <div className="flex flex-wrap gap-1">
                      {document.deviceClasses.map(deviceClass => (
                        <Badge key={deviceClass} variant="secondary" className="text-xs">
                          {deviceClass}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium">Metadaten:</span>
                    <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                      <div>Dateityp: {document.metadata.fileType}</div>
                      <div>Seiten: {document.metadata.pageCount}</div>
                      <div>Sprache: {document.metadata.language}</div>
                      <div>Heruntergeladen: {new Date(document.downloadedAt).toLocaleDateString('de-DE')}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <Button 
                    onClick={openInNewWindow} 
                    className="w-full" 
                    size="sm"
                    disabled={!document.documentUrl}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Original öffnen
                  </Button>
                  
                  <Button 
                    onClick={downloadDocument} 
                    variant="outline" 
                    className="w-full" 
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Herunterladen
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dokument-Inhalt */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-base">Dokument-Inhalt</CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-4rem)]">
                <ScrollArea className="h-full">
                  <div className="space-y-4 pr-4">
                    {formatContent(document.content).map((paragraph, index) => (
                      <div key={index} className="text-sm leading-relaxed">
                        {paragraph.startsWith('#') ? (
                          <h3 className="font-semibold text-base mb-2 text-blue-700 dark:text-blue-300">
                            {paragraph.replace(/^#+\s*/, '')}
                          </h3>
                        ) : paragraph.startsWith('##') ? (
                          <h4 className="font-medium text-sm mb-1 text-gray-700 dark:text-gray-300">
                            {paragraph.replace(/^#+\s*/, '')}
                          </h4>
                        ) : paragraph.startsWith('*') || paragraph.startsWith('-') ? (
                          <li className="ml-4 list-disc text-gray-600 dark:text-gray-400">
                            {paragraph.replace(/^[*-]\s*/, '')}
                          </li>
                        ) : (
                          <p className="text-gray-700 dark:text-gray-300">
                            {paragraph}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Vereinfachte Link-Komponente für Tabellen
export function DocumentLink({ document }: { document: HistoricalDataRecord }) {
  return (
    <DocumentViewer 
      document={document}
      trigger={
        <Button 
          variant="link" 
          className="h-auto p-0 font-normal justify-start text-left"
          style={{ minHeight: 'auto' }}
        >
          <div>
            <p className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
              {document.documentTitle}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {document.documentId}
            </p>
          </div>
        </Button>
      }
    />
  );
}