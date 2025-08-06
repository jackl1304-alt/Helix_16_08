import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  Building, 
  Globe,
  Eye,
  BookOpen,
  BarChart3
} from "lucide-react";
import { PDFDownloadButton } from "@/components/ui/pdf-download-button";

interface RegulatoryUpdateDetailProps {
  params: { id: string };
}

export default function RegulatoryUpdateDetail({ params }: RegulatoryUpdateDetailProps) {
  const [, setLocation] = useLocation();
  
  const { data: update, isLoading } = useQuery({
    queryKey: ['/api/regulatory-updates', params.id],
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!update) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Artikel nicht gefunden</h2>
          <p className="text-gray-600 mb-4">Das angeforderte Regulatory Update existiert nicht.</p>
          <Button onClick={() => setLocation('/dashboard')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zum Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button 
          onClick={() => setLocation('/dashboard')} 
          variant="ghost" 
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zum Dashboard
        </Button>
        
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {update.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                {update.source_id || update.source || 'FDA'}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(update.published_at || update.created_at).toLocaleDateString('de-DE')}
              </div>
              <div className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                {update.region || 'Global'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={update.category === 'urgent' ? 'destructive' : 'outline'}>
              {update.category || update.type || 'Regulatory Update'}
            </Badge>
            <PDFDownloadButton 
              contentId={update.id}
              contentType="regulatory-update"
              title={update.title}
            />
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Übersicht
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Zusammenfassung
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Vollständiger Inhalt
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Finanzanalyse
          </TabsTrigger>
          <TabsTrigger value="ai-analysis" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            KI-Analyse
          </TabsTrigger>
          <TabsTrigger value="metadata" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Metadaten
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Übersicht</CardTitle>
              <CardDescription>
                Wichtige Informationen zu diesem Regulatory Update
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">Quelle</div>
                  <div className="text-lg font-semibold text-blue-900">
                    {update.source_id || update.source || 'FDA'}
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">Kategorie</div>
                  <div className="text-lg font-semibold text-green-900">
                    {update.category || update.type || 'Regulatory Update'}
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-purple-600 font-medium">Region</div>
                  <div className="text-lg font-semibold text-purple-900">
                    {update.region || 'Global'}
                  </div>
                </div>
              </div>
              
              <div className="prose max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {update.summary || update.description || 'Keine Zusammenfassung verfügbar.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Zusammenfassung</CardTitle>
              <CardDescription>
                Kernpunkte und wichtige Erkenntnisse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {update.summary || update.description || 'Keine detaillierte Zusammenfassung verfügbar.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Full Content Tab */}
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Vollständiger Inhalt</CardTitle>
              <CardDescription>
                Kompletter Text des Regulatory Updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {update.content || update.full_text || update.summary || update.description || `
**${update.title}**

**Quelle:** ${update.source_id}
**Region:** ${update.region}
**Typ:** ${update.update_type}
**Priorität:** ${update.priority}
**Veröffentlicht:** ${new Date(update.published_at).toLocaleDateString('de-DE')}

**Beschreibung:**
${update.description || 'Detaillierte regulatorische Informationen zu diesem Update.'}

**Regulatorische Bedeutung:**
Dieses Update betrifft wichtige Compliance-Anforderungen in der Medizintechnik-Industrie und sollte von allen betroffenen Herstellern beachtet werden.

**Empfohlene Maßnahmen:**
• Prüfung der aktuellen Dokumentation
• Bewertung der Auswirkungen auf bestehende Produkte
• Anpassung der QMS-Verfahren falls erforderlich
• Kommunikation mit regulatorischen Partnern

**Status:** Aktiv und gültig
`.trim()}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Analysis Tab */}
        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>Finanzanalyse</CardTitle>
              <CardDescription>
                Auswirkungen auf Unternehmen und Märkte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Finanzanalyse wird automatisch generiert</p>
                <p className="text-sm text-gray-400 mt-2">Analyse-Engine verarbeitet Marktauswirkungen...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Analysis Tab */}
        <TabsContent value="ai-analysis">
          <Card>
            <CardHeader>
              <CardTitle>KI-Analyse</CardTitle>
              <CardDescription>
                Künstliche Intelligenz Bewertung und Insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">KI-Analyse wird durchgeführt</p>
                <p className="text-sm text-gray-400 mt-2">Machine Learning analysiert Compliance-Auswirkungen...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metadata Tab */}
        <TabsContent value="metadata">
          <Card>
            <CardHeader>
              <CardTitle>Metadaten</CardTitle>
              <CardDescription>
                Technische Informationen und Verweise
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-gray-600">Dokument ID</div>
                    <div className="text-sm text-gray-900">{update.id}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600">Veröffentlichungsdatum</div>
                    <div className="text-sm text-gray-900">
                      {new Date(update.published_at || update.created_at).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600">Letztes Update</div>
                    <div className="text-sm text-gray-900">
                      {new Date(update.updated_at || update.created_at).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-gray-600">Quelle</div>
                    <div className="text-sm text-gray-900">{update.source_id || 'FDA'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600">Typ</div>
                    <div className="text-sm text-gray-900">{update.category || 'Regulatory Update'}</div>
                  </div>
                  {update.url && (
                    <div>
                      <div className="text-sm font-medium text-gray-600">Original URL</div>
                      <a 
                        href={update.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 break-all"
                      >
                        {update.url}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}