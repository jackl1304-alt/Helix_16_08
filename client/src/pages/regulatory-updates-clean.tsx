import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, FileText, Brain, Globe } from 'lucide-react';

interface RegulatoryUpdate {
  id: string;
  title: string;
  description?: string;
  fullText?: string;
  content?: string;
  summary?: string;
  region: string;
  priority: string;
  published_at: string;
  created_at: string;
}

// Neue API-Funktion mit direkter Backend-Verbindung
async function fetchRegulatoryUpdates(): Promise<RegulatoryUpdate[]> {
  console.log('[FRONTEND] Fetching regulatory updates...');
  
  const response = await fetch('/api/regulatory-updates/recent?limit=5000', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('[FRONTEND] Raw API response:', data);
  
  if (!data.success || !Array.isArray(data.data)) {
    throw new Error('Invalid API response format');
  }
  
  console.log('[FRONTEND] Successfully fetched', data.data.length, 'updates');
  return data.data;
}

// Neue Text-Komponente
function CleanText({ text }: { text: string }) {
  if (!text) {
    return <p className="text-gray-500 italic">Kein Inhalt verfügbar</p>;
  }

  const cleanedText = text
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .trim();

  return (
    <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
      {cleanedText}
    </div>
  );
}

export default function RegulatoryUpdatesClean() {
  const [selectedUpdate, setSelectedUpdate] = useState<RegulatoryUpdate | null>(null);

  // Neue Query mit direkter API-Verbindung
  const { data: updates = [], isLoading, error } = useQuery({
    queryKey: ['regulatory-updates-clean'],
    queryFn: fetchRegulatoryUpdates,
    refetchOnWindowFocus: false,
    retry: 2
  });

  console.log('[FRONTEND] Query state:', { 
    updatesCount: updates.length, 
    isLoading, 
    hasError: !!error 
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade regulatorische Updates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold">Verbindungsfehler</h3>
          <p className="text-red-600 mt-2">
            {error instanceof Error ? error.message : 'Unbekannter Fehler'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Regulatorische Updates
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {updates.length} von {updates.length} regulatorische Updates verfügbar
        </p>
      </div>

      <div className="grid gap-6">
        {updates.map((update) => (
          <Card key={update.id} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold mb-2">
                    {update.title}
                  </CardTitle>
                  <div className="flex gap-2 mb-3">
                    <Badge variant="secondary">{update.region}</Badge>
                    <Badge 
                      variant={update.priority === 'high' ? 'destructive' : 'outline'}
                    >
                      {update.priority}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {update.description || 'Keine Beschreibung verfügbar'}
              </p>

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-sm text-gray-500">
                  {new Date(update.published_at).toLocaleDateString('de-DE')}
                </span>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedUpdate(update)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Details & Analyse
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="max-w-4xl w-[95vw] h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        {update.title}
                      </DialogTitle>
                    </DialogHeader>

                    <Tabs defaultValue="overview" className="w-full mt-6">
                      <TabsList className="grid w-full grid-cols-6">
                        <TabsTrigger value="overview">Übersicht</TabsTrigger>
                        <TabsTrigger value="summary">Zusammenfassung</TabsTrigger>
                        <TabsTrigger value="content">Vollständiger Inhalt</TabsTrigger>
                        <TabsTrigger value="finance">Finanzanalyse</TabsTrigger>
                        <TabsTrigger value="ai">KI-Analyse</TabsTrigger>
                        <TabsTrigger value="metadata">Metadaten</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="mt-4">
                        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                          <h4 className="font-semibold mb-4">Übersicht</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><strong>Region:</strong> {update.region}</div>
                            <div><strong>Priorität:</strong> {update.priority}</div>
                            <div><strong>Veröffentlicht:</strong> {new Date(update.published_at).toLocaleDateString('de-DE')}</div>
                            <div><strong>Update-ID:</strong> {update.id}</div>
                          </div>
                          <div className="mt-4">
                            <strong>Beschreibung:</strong>
                            <CleanText text={update.description || 'Keine Beschreibung verfügbar'} />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="summary" className="mt-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                          <h4 className="font-semibold mb-4 text-blue-800 dark:text-blue-300">
                            Zusammenfassung
                          </h4>
                          <CleanText text={
                            update.summary || 
                            update.description || 
                            (update.fullText ? update.fullText.substring(0, 500) + '...' : 'Keine Zusammenfassung verfügbar')
                          } />
                        </div>
                      </TabsContent>

                      <TabsContent value="content" className="mt-4">
                        <div className="bg-white dark:bg-gray-800 border p-6 rounded-lg">
                          <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Vollständiger Inhalt
                          </h4>
                          <CleanText text={
                            update.fullText || 
                            update.content || 
                            update.description || 
                            'Kein Inhalt verfügbar'
                          } />
                          
                          {/* Debug-Info wenn keine Daten */}
                          {!update.fullText && !update.content && (
                            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                              <p className="text-yellow-800 text-sm">
                                <strong>Debug:</strong><br/>
                                Title: {update.title}<br/>
                                Description: {update.description ? 'Verfügbar' : 'Nicht verfügbar'}<br/>
                                FullText: {update.fullText ? 'Verfügbar' : 'Nicht verfügbar'}<br/>
                                Content: {update.content ? 'Verfügbar' : 'Nicht verfügbar'}
                              </p>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="finance" className="mt-4">
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg">
                          <h4 className="font-semibold mb-4 text-orange-800 dark:text-orange-300">
                            🔥 KI-gestützte Finanzanalyse
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            Detaillierte Finanzanalyse für dieses regulatorische Update wird hier angezeigt.
                          </p>
                        </div>
                      </TabsContent>

                      <TabsContent value="ai" className="mt-4">
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                          <h4 className="font-semibold mb-4 text-purple-800 dark:text-purple-300 flex items-center gap-2">
                            <Brain className="h-5 w-5" />
                            KI-gestützte Compliance-Analyse
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            Intelligente KI-Analyse zur Bewertung und Kategorisierung wird hier angezeigt.
                          </p>
                        </div>
                      </TabsContent>

                      <TabsContent value="metadata" className="mt-4">
                        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                          <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            Technische Metadaten
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div><strong>Update-ID:</strong> {update.id}</div>
                            <div><strong>Erstellt am:</strong> {new Date(update.created_at).toLocaleDateString('de-DE')}</div>
                            <div><strong>Datenformat:</strong> JSON</div>
                            <div><strong>Region:</strong> {update.region}</div>
                            <div><strong>Priorität:</strong> {update.priority}</div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {updates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Keine regulatorischen Updates verfügbar</p>
        </div>
      )}
    </div>
  );
}