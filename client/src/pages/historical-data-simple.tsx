import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Database, TrendingUp } from "lucide-react";

interface HistoricalDataRecord {
  id: string;
  source_id?: string;
  sourceId?: string;
  title?: string;
  documentTitle?: string;
  description?: string;
  summary?: string;
  document_url?: string;
  published_at?: string;
  originalDate?: string;
  archived_at?: string;
  change_type?: string;
  version?: string;
  region?: string;
  category?: string;
  language?: string;
  priority?: string;
  deviceClasses?: string[];
}

export default function HistoricalData() {
  const [searchQuery, setSearchQuery] = useState("");

  // Simple historical data query
  const { data: historicalData = [], isLoading, error } = useQuery({
    queryKey: ['/api/historical/data'],
    staleTime: 30000,
    gcTime: 60000,
    refetchOnMount: true,
  });

  // Simple data display
  const filteredData = historicalData.filter((item) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower) ||
      item.source_id?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Historische Daten
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Umfassende Sammlung regulatorischer Dokumente und Änderungsverfolgung
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamte Dokumente</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{historicalData.length}</div>
            <p className="text-xs text-muted-foreground">Historische Einträge</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gefilterte Ergebnisse</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredData.length}</div>
            <p className="text-xs text-muted-foreground">Angezeigte Dokumente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Letzte Aktualisierung</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Heute</div>
            <p className="text-xs text-muted-foreground">Automatische Synchronisation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Aktiv</div>
            <p className="text-xs text-muted-foreground">System läuft optimal</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Dokumente durchsuchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Lade historische Dokumente...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400">Fehler beim Laden der Daten</p>
        </div>
      )}

      {/* Data Display */}
      {!isLoading && !error && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Dokumentenarchiv</h2>
          <p className="text-gray-600 dark:text-gray-300">
            {filteredData.length} von {historicalData.length} Dokumenten
          </p>

          <div className="grid gap-4">
            {filteredData.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 mr-4">
                      <CardTitle className="text-lg">{item.title || item.documentTitle}</CardTitle>
                      <CardDescription className="mt-1">
                        {item.description || item.summary || 'Keine Beschreibung verfügbar'}
                      </CardDescription>
                      {item.region && (
                        <Badge variant="secondary" className="mt-2 mr-2">{item.region}</Badge>
                      )}
                      {item.category && (
                        <Badge variant="outline" className="mt-2">{item.category}</Badge>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge variant="outline">{item.source_id || item.sourceId}</Badge>
                      {item.priority && (
                        <Badge variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'default' : 'secondary'}>
                          {item.priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {(() => {
                          try {
                            const date = new Date(item.published_at || item.originalDate);
                            return isNaN(date.getTime()) 
                              ? (item.published_at || item.originalDate || 'Unbekannt').split('T')[0] 
                              : date.toLocaleDateString('de-DE', {
                                  year: 'numeric',
                                  month: '2-digit', 
                                  day: '2-digit'
                                });
                          } catch {
                            return 'Unbekannt';
                          }
                        })()}
                      </span>
                      {item.change_type && (
                        <Badge variant="secondary">{item.change_type}</Badge>
                      )}
                      {item.version && (
                        <Badge variant="outline">v{item.version}</Badge>
                      )}
                      {item.language && (
                        <Badge variant="outline">{item.language}</Badge>
                      )}
                      {item.deviceClasses && item.deviceClasses.length > 0 && (
                        <span className="text-xs text-gray-500">
                          Geräte: {item.deviceClasses.slice(0, 2).join(', ')}
                          {item.deviceClasses.length > 2 && ` +${item.deviceClasses.length - 2} weitere`}
                        </span>
                      )}
                    </div>
                    {item.document_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={item.document_url} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4 mr-1" />
                          Anzeigen
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredData.length === 0 && historicalData.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-300">
                Keine Dokumente entsprechen den Suchkriterien
              </p>
            </div>
          )}

          {filteredData.length === 0 && historicalData.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-300">
                Keine historischen Daten verfügbar
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}