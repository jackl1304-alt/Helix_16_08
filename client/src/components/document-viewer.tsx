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

  const openDocumentInNewTab = () => {
    // Erstelle eine neue Seite mit dem vollständigen Dokumentinhalt
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html lang="de">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${document.documentTitle}</title>
          <style>
            body {
              font-family: monospace;
              line-height: 1.6;
              margin: 0;
              padding: 20px;
              background-color: #f9fafb;
            }
            .header {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .content {
              background: white;
              padding: 20px;
              border-radius: 8px;
              white-space: pre-wrap;
              word-wrap: break-word;
              border-left: 4px solid #2563eb;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .meta {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 10px;
              margin-top: 15px;
            }
            .meta-item {
              padding: 8px;
              background: #f3f4f6;
              border-radius: 4px;
              font-size: 14px;
            }
            .badge {
              display: inline-block;
              padding: 2px 8px;
              background: #dbeafe;
              color: #1e40af;
              border-radius: 12px;
              font-size: 12px;
              margin: 2px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${document.documentTitle}</h1>
            <div class="meta">
              <div class="meta-item"><strong>Status:</strong> ${document.status}</div>
              <div class="meta-item"><strong>Datum:</strong> ${new Date(document.originalDate).toLocaleDateString('de-DE')}</div>
              <div class="meta-item"><strong>Region:</strong> ${document.region}</div>
              <div class="meta-item"><strong>Sprache:</strong> ${document.language}</div>
              <div class="meta-item"><strong>Kategorie:</strong> ${document.category}</div>
              <div class="meta-item"><strong>Behörde:</strong> ${document.metadata.authority}</div>
            </div>
            <div style="margin-top: 15px;">
              <strong>Geräteklassen:</strong><br>
              ${document.deviceClasses.map(cls => `<span class="badge">${cls}</span>`).join('')}
            </div>
          </div>
          <div class="content">${document.content}</div>
        </body>
        </html>
      `);
      newWindow.document.close();
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

      <DialogContent className="max-w-7xl w-[95vw] h-[95vh] flex flex-col" aria-describedby="document-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-8">
            <FileText className="h-5 w-5" />
            {document.documentTitle}
          </DialogTitle>
          <div id="document-description" className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Vollständiges Rechtsdokument - ROTE SCROLLBARS zeigen Scroll-Bereiche an. Klicken und ziehen Sie die roten Scrollbars.
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
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
                    onClick={openDocumentInNewTab} 
                    className="w-full" 
                    size="sm"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    In neuem Tab öffnen
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
          <div className="lg:col-span-2 flex flex-col min-h-0">
            <Card className="flex-1 flex flex-col">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Dokument-Volltext</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const contentDiv = window.document.getElementById('document-content');
                        if (contentDiv) {
                          const currentSize = parseInt(contentDiv.style.fontSize) || 14;
                          contentDiv.style.fontSize = `${currentSize === 14 ? 16 : currentSize === 16 ? 18 : 14}px`;
                        }
                      }}
                    >
                      Text vergrößern
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openDocumentInNewTab}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Neuer Tab
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadDocument}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <div 
                  className="h-[500px] w-full border-4 border-red-600 rounded-lg document-viewer-scroll-container"
                  style={{
                    overflow: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    overscrollBehavior: 'contain'
                  }}
                >
                  <div 
                    id="document-content"
                    className="p-6 font-mono text-sm leading-relaxed bg-white dark:bg-gray-900 select-text"
                    style={{ 
                      minHeight: '1500px',
                      borderLeft: '4px solid #2563eb',
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'break-word',
                      wordBreak: 'break-word'
                    }}
                  >
                    {formatContent(document.content).map((line, index) => (
                      <div 
                        key={index} 
                        className="mb-2 p-2 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                        style={{
                          backgroundColor: index % 2 === 0 ? '#f8fafc' : '#ffffff'
                        }}
                      >
                        <span 
                          className="text-gray-500 dark:text-gray-400 mr-4 select-none font-mono text-xs inline-block w-12 text-right"
                        >
                          {String(index + 1).padStart(3, '0')}:
                        </span>
                        <span className="inline-block">{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
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