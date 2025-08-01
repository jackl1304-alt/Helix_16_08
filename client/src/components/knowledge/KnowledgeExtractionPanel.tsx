import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, Download, Play, Eye, Trash2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExtractionStats {
  totalProcessed: number;
  articlesExtracted: number;
  duplicatesSkipped: number;
  errorsEncountered: number;
  sourcesProcessed: string[];
}

interface ExtractionStatus {
  totalArticles: number;
  autoExtractedArticles?: number;
  needsReviewArticles?: number;
  publishedArticles?: number;
  draftArticles?: number;
  availableSourceData?: {
    regulatoryUpdates: number;
    legalCases: number;
    totalSources: number;
  };
  extractionPotential: {
    unprocessedRegulatory: number;
    unprocessedLegal: number;
  };
}

interface ExtractableItem {
  id: string;
  title: string;
  source: string;
  region: string;
  type: string;
  url: string;
  category: string;
}

interface ExtractionPreview {
  extractableCount: number;
  regulatory: ExtractableItem[];
  legal: ExtractableItem[];
  summary: {
    totalExtractable: number;
    regulatoryCount: number;
    legalCount: number;
    existingArticles: number;
  };
}

export function KnowledgeExtractionPanel() {
  const [extractionInProgress, setExtractionInProgress] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Hole aktuellen Status
  const { data: statusResponse, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/knowledge-extraction/status'],
    refetchInterval: 30000, // Aktualisiere alle 30 Sekunden
  });

  // Extract data from API response wrapper
  const status = (statusResponse as any)?.data || statusResponse;

  // Hole Vorschau der extrahierbaren Artikel
  const { data: previewResponse, isLoading: previewLoading } = useQuery({
    queryKey: ['/api/knowledge-extraction/preview'],
    enabled: !!status,
  });

  // Extract data from API response wrapper
  const preview = (previewResponse as any)?.data || previewResponse;

  // Vollständige Extraktion
  const extractAllMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/knowledge-extraction/extract-all', {
        method: 'POST',
        body: JSON.stringify({}),
      });
    },
    onMutate: () => {
      setExtractionInProgress(true);
    },
    onSuccess: (data) => {
      toast({
        title: "Extraktion erfolgreich",
        description: `${data.stats.articlesExtracted} Artikel wurden extrahiert`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge-extraction/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge-extraction/preview'] });
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge/articles'] });
    },
    onError: (error) => {
      toast({
        title: "Extraktion fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setExtractionInProgress(false);
    },
  });

  // Automatisch extrahierte Artikel löschen
  const deleteAutoExtractedMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/knowledge-extraction/auto-extracted', {
        method: 'DELETE',
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Artikel gelöscht",
        description: `${data.deletedCount} automatisch extrahierte Artikel wurden gelöscht`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge-extraction/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge/articles'] });
    },
    onError: (error) => {
      toast({
        title: "Löschen fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleExtractAll = () => {
    extractAllMutation.mutate();
  };

  const handleDeleteAutoExtracted = () => {
    if (confirm('Sind Sie sicher, dass Sie alle automatisch extrahierten Artikel löschen möchten?')) {
      deleteAutoExtractedMutation.mutate();
    }
  };

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Lade Status...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Knowledge Article Extraktion</h2>
          <p className="text-muted-foreground">
            Automatische Erstellung von Knowledge Articles aus Datenquellen
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => queryClient.invalidateQueries()}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Aktualisieren
          </Button>
        </div>
      </div>

      {/* Status Übersicht */}
      {status && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Gesamt Artikel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{status.totalArticles}</div>
              <p className="text-xs text-muted-foreground">
                {status.publishedArticles || 0} veröffentlicht
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Auto-Extrahiert</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {status.autoExtractedArticles || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Automatisch erstellt
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Benötigt Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {status.needsReviewArticles || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Manuelle Überprüfung
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Verfügbare Quellen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {status.availableSourceData?.totalSources || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Datenquellen verfügbar
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Extraktions-Potenzial */}
      {status && (
        <Alert>
          <Download className="h-4 w-4" />
          <AlertDescription>
            <strong>Extraktions-Potenzial:</strong> {' '}
            {status?.extractionPotential?.unprocessedRegulatory || 0} regulatorische Updates und{' '}
            {status?.extractionPotential?.unprocessedLegal || 0} Rechtsfälle können noch extrahiert werden.
          </AlertDescription>
        </Alert>
      )}

      {/* Hauptfunktionen */}
      <Tabs defaultValue="extract" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="extract">Extraktion</TabsTrigger>
          <TabsTrigger value="preview">Vorschau</TabsTrigger>
          <TabsTrigger value="manage">Verwaltung</TabsTrigger>
        </TabsList>
        
        <TabsContent value="extract" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vollständige Extraktion</CardTitle>
              <CardDescription>
                Extrahiert alle verfügbaren Artikel aus regulatorischen Updates und Rechtsfällen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {extractionInProgress && (
                <div className="space-y-2">
                  <Progress value={undefined} className="w-full" />
                  <p className="text-sm text-muted-foreground">
                    Extraktion läuft... Dies kann einige Minuten dauern.
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  onClick={handleExtractAll}
                  disabled={extractionInProgress}
                  className="flex-1"
                >
                  {extractionInProgress ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Alle Artikel extrahieren
                </Button>
              </div>
              
              {status && status.extractionPotential.unprocessedRegulatory === 0 && 
               status.extractionPotential.unprocessedLegal === 0 && (
                <Alert>
                  <AlertDescription>
                    Alle verfügbaren Artikel wurden bereits extrahiert.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Extraktions-Vorschau</CardTitle>
              <CardDescription>
                Zeigt die nächsten extrahierbaren Artikel an
              </CardDescription>
            </CardHeader>
            <CardContent>
              {previewLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : preview ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">{preview.summary.totalExtractable}</div>
                      <p className="text-sm text-muted-foreground">Extrahierbar</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{preview.summary.regulatoryCount}</div>
                      <p className="text-sm text-muted-foreground">Regulatorisch</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{preview.summary.legalCount}</div>
                      <p className="text-sm text-muted-foreground">Rechtsfälle</p>
                    </div>
                  </div>
                  
                  {preview.regulatory.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Regulatorische Updates</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {preview.regulatory.slice(0, 5).map((item: any) => (
                          <div key={item.id} className="flex justify-between items-center p-2 bg-muted rounded">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{item.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.source} • {item.region}
                              </p>
                            </div>
                            <Badge variant="outline">{item.category}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {preview.legal.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Rechtsfälle</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {preview.legal.slice(0, 5).map((item: any) => (
                          <div key={item.id} className="flex justify-between items-center p-2 bg-muted rounded">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{item.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.source} • {item.region}
                              </p>
                            </div>
                            <Badge variant="outline">{item.category}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Keine Vorschau verfügbar</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Artikel-Verwaltung</CardTitle>
              <CardDescription>
                Verwaltung der automatisch extrahierten Artikel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded">
                <div>
                  <h4 className="font-semibold">Automatisch extrahierte Artikel löschen</h4>
                  <p className="text-sm text-muted-foreground">
                    Entfernt alle Artikel mit dem Tag "auto-extracted"
                  </p>
                </div>
                <Button
                  onClick={handleDeleteAutoExtracted}
                  variant="destructive"
                  disabled={deleteAutoExtractedMutation.isPending || !status?.autoExtractedArticles}
                >
                  {deleteAutoExtractedMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Löschen ({status?.autoExtractedArticles || 0})
                </Button>
              </div>
              
              <Alert>
                <AlertDescription>
                  <strong>Hinweis:</strong> Automatisch extrahierte Artikel sind als Entwürfe markiert 
                  und benötigen eine manuelle Überprüfung vor der Veröffentlichung.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}