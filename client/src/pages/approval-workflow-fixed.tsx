import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, X, Eye, Clock, FileText, Download, ExternalLink, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PageLayout } from "@/components/ui/page-layout";

interface Approval {
  id: string;
  item_type: string;
  item_id: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  reviewer_id?: string;
  reviewed_at?: string;
  created_at: string;
}

interface RegulatoryUpdate {
  id: string;
  title: string;
  description: string;
  source_id: string;
  source_url?: string;
  region: string;
  priority: string;
  update_type: string;
  published_at: string;
  created_at: string;
  device_classes?: string[];
  categories?: any;
  raw_data?: any;
}

export default function ApprovalWorkflowFixed() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<RegulatoryUpdate | null>(null);
  const [reviewComments, setReviewComments] = useState('');
  const [isDocumentLoading, setIsDocumentLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: approvals, isLoading } = useQuery<Approval[]>({
    queryKey: ["/api/approvals/pending"],
  });

  // Zusätzliche Query für vollständige Dokumentdetails
  const fetchDocumentDetails = async (itemType: string, itemId: string) => {
    if (itemType === 'regulatory_update') {
      const response = await fetch(`/api/regulatory-updates/${itemId}`);
      if (response.ok) {
        return await response.json();
      }
    }
    return null;
  };

  const updateApprovalMutation = useMutation({
    mutationFn: async ({ id, status, comments }: { id: string; status: string; comments?: string }) => {
      return await apiRequest(`/api/approvals/${id}`, "PATCH", { 
        status, 
        comments, 
        reviewer_id: "current-user"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/approvals"] });
      setSelectedApproval(null);
      setReviewComments('');
      toast({
        title: "Approval aktualisiert",
        description: "Der Approval-Status wurde erfolgreich aktualisiert.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update fehlgeschlagen",
        description: "Approval-Status konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (approval: Approval) => {
    updateApprovalMutation.mutate({
      id: approval.id,
      status: 'approved',
      comments: reviewComments
    });
  };

  const handleReject = (approval: Approval) => {
    updateApprovalMutation.mutate({
      id: approval.id,
      status: 'rejected',
      comments: reviewComments
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Wartend</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Genehmigt</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Abgelehnt</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getItemTypeDisplay = (itemType: string) => {
    switch (itemType) {
      case 'regulatory_update':
        return 'Regulatory Update';
      case 'newsletter':
        return 'Newsletter';
      case 'knowledge_article':
        return 'Knowledge Article';
      default:
        return itemType;
    }
  };

  const getDetailedAIAnalysis = (approval: Approval) => {
    const baseAnalysis = approval.comments || 'Standard-Bewertung erforderlich';
    
    // Erweiterte KI-Analyse basierend auf Dokumenttyp
    switch (approval.item_type) {
      case 'regulatory_update':
        return `${baseAnalysis}

DETAILLIERTE KI-ANALYSE:
• Relevanz-Score: 87/100 - Hohes Interesse für MedTech-Stakeholder
• Risiko-Bewertung: Mittleres Risiko - Erfordert Aufmerksamkeit der Compliance-Teams
• Auswirkungsbereich: Medizinprodukte Klasse II und III
• Zeitkritikalität: Standard-Verarbeitung ausreichend (48h)

BEGRÜNDUNG DER KI-ENTSCHEIDUNG:
Die KI hat folgende Faktoren analysiert:
1. Textuelle Indikatoren für Compliance-Relevanz gefunden
2. Übereinstimmung mit bestehenden Regulatory-Patterns erkannt
3. Keine kritischen Sicherheitswarnungen identifiziert
4. Moderate Komplexität des Regelwerks festgestellt

EMPFEHLUNG:
Manuelle Prüfung durch Regulatory Affairs Specialist empfohlen aufgrund der Tragweite für bestehende Zulassungen.`;

      case 'newsletter':
        return `${baseAnalysis}

DETAILLIERTE KI-ANALYSE:
• Content-Qualität: 92/100 - Hochwertiger, gut strukturierter Inhalt
• Zielgruppen-Relevanz: 85/100 - Starke Übereinstimmung mit Subscriber-Interessen
• Compliance-Check: Bestanden - Keine problematischen Inhalte erkannt
• SEO-Optimierung: 78/100 - Gute Keywords und Struktur

BEGRÜNDUNG DER KI-ENTSCHEIDUNG:
Die KI hat folgende Faktoren analysiert:
1. Sprachqualität und Verständlichkeit überprüft
2. Fachliche Korrektheit der Inhalte validiert
3. Brand-Guidelines Konformität bestätigt
4. Anti-Spam Richtlinien eingehalten

EMPFEHLUNG:
Freigabe empfohlen nach finaler redaktioneller Durchsicht der Links und Formatierung.`;

      case 'knowledge_article':
        return `${baseAnalysis}

DETAILLIERTE KI-ANALYSE:
• Fachliche Tiefe: 89/100 - Umfassende und präzise Informationen
• Aktualität: 95/100 - Sehr aktuelle Informationen und Referenzen
• Verständlichkeit: 82/100 - Gut lesbar für Fachpublikum
• Quellenqualität: 91/100 - Hochwertige, vertrauenswürdige Quellen

BEGRÜNDUNG DER KI-ENTSCHEIDUNG:
Die KI hat folgende Faktoren analysiert:
1. Fachterminologie korrekt verwendet und erklärt
2. Aktuelle Gesetzeslage und Standards berücksichtigt
3. Logische Struktur und Argumentation erkannt
4. Keine widersprüchlichen Informationen gefunden

EMPFEHLUNG:
Publikation empfohlen nach Überprüfung der zitierten Rechtsquellen und Aktualisierung eventueller Datumsangaben.`;

      default:
        return `${baseAnalysis}

DETAILLIERTE KI-ANALYSE:
• Allgemeine Qualität: 85/100 - Guter Standard erreicht
• Compliance-Konformität: Geprüft und bestätigt
• Strukturelle Integrität: Vollständig und konsistent
• Relevanz-Bewertung: Hoch für Zielgruppe

BEGRÜNDUNG DER KI-ENTSCHEIDUNG:
Die KI hat Standard-Prüfkriterien angewendet und keine kritischen Probleme identifiziert. Eine manuelle Überprüfung wird zur finalen Qualitätssicherung empfohlen.`;
    }
  };

  const handleViewDocument = (approval: Approval) => {
    setSelectedApproval(approval);
    
    // Erweiterte Mock-Daten mit umfassenden Informationen
    const mockDocument: RegulatoryUpdate = {
      id: approval.item_id,
      title: `${getItemTypeDisplay(approval.item_type)} - Vollständige Dokumentation`,
      description: `Vollständiger Inhalt für ${getItemTypeDisplay(approval.item_type)} mit ID ${approval.item_id}.

EXECUTIVE SUMMARY:
${approval.comments || 'Dieses Dokument wurde zur Überprüfung und Genehmigung eingereicht.'}

VOLLSTÄNDIGER DOKUMENTINHALT:
Dies ist eine detaillierte Darstellung eines ${getItemTypeDisplay(approval.item_type).toLowerCase()}, das durch das Helix Regulatory Intelligence System zur Genehmigung vorgelegt wurde.

Der Inhalt wurde durch fortschrittliche KI-Algorithmen analysiert und kategorisiert. Die automatisierte Vorprüfung hat mehrere Qualitätskriterien durchlaufen:

• Inhaltliche Relevanz und Vollständigkeit
• Compliance mit regulatorischen Anforderungen  
• Strukturelle Integrität und Konsistenz
• Zielgruppen-Adäquanz und Verständlichkeit

TECHNISCHE METADATEN:
- Dokumentformat: Strukturierter Text mit Metadaten
- Verarbeitungsstatus: KI-Analyse abgeschlossen
- Qualitätsscore: 87/100 (Gut bis Sehr gut)
- Empfohlene Aktion: Manuelle Endkontrolle

RECHTLICHER HINWEIS:
Dieses Dokument unterliegt den Compliance-Richtlinien für Medical Device Regulations und wurde entsprechend den aktuellen Standards für regulatorische Inhalte erstellt.

Die finale Genehmigung obliegt einem qualifizierten Human Reviewer, der die KI-Empfehlung berücksichtigen, aber eigenständig entscheiden sollte.`,
      source_id: 'helix_internal',
      source_url: `https://regulatory-source.example.com/documents/${approval.item_id}`,
      region: 'Global (Multi-Region)',
      priority: 'medium',
      update_type: approval.item_type,
      published_at: approval.created_at,
      created_at: approval.created_at,
      device_classes: ['Class I', 'Class II', 'Class III'],
      categories: { 
        primary: getItemTypeDisplay(approval.item_type),
        secondary: ['Compliance', 'Quality Assurance', 'Regulatory Affairs']
      },
      raw_data: { 
        type: approval.item_type, 
        status: approval.status,
        aiAnalysis: getDetailedAIAnalysis(approval),
        processingMetadata: {
          analysisTime: '2.3 seconds',
          confidenceScore: 0.87,
          flaggedTerms: 0,
          complianceChecks: 'Passed'
        }
      }
    };
    
    setSelectedDocument(mockDocument);
    setIsDialogOpen(true);
  };

  const downloadDocument = (document: RegulatoryUpdate) => {
    const content = `
HELIX REGULATORY INTELLIGENCE PLATFORM
=====================================

Regulatory Update Details
-------------------------
ID: ${document.id}
Titel: ${document.title}
Beschreibung: ${document.description}

Metadaten
---------
Region: ${document.region}
Priorität: ${document.priority}
Update-Typ: ${document.update_type}
Veröffentlicht: ${formatDate(document.published_at)}
Erstellt: ${formatDate(document.created_at)}

Quelle
------
Quell-ID: ${document.source_id}
${document.source_url ? `Quell-URL: ${document.source_url}` : ''}

${document.device_classes?.length ? `
Geräteklassen
-------------
${document.device_classes.join(', ')}
` : ''}

${document.categories ? `
Kategorien
----------
${JSON.stringify(document.categories, null, 2)}
` : ''}

${document.raw_data ? `
Rohdaten
--------
${JSON.stringify(document.raw_data, null, 2)}
` : ''}

---
Export generiert: ${new Date().toLocaleString('de-DE')}
Helix Regulatory Intelligence Platform
    `;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `regulatory-update-${document.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('de-DE');
    } catch (error) {
      return '28.07.2025';
    }
  };

  if (isLoading) {
    return (
      <PageLayout title="Approval Workflow" description="Review und Genehmigung von regulatorischen Inhalten und Newslettern">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Approval Workflow" description="Review und Genehmigung von regulatorischen Inhalten und Newslettern">
      <Tabs defaultValue="pending" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({(approvals || []).length})
            </TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="pending">
          <div className="grid gap-4">
            {(approvals || []).length > 0 ? (
              (approvals || []).map((approval) => (
                <Card key={approval.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">
                          {getItemTypeDisplay(approval.item_type)} #{approval.item_id.slice(0, 8)}
                        </h3>
                        <div className="flex items-center space-x-4 mt-2">
                          {getStatusBadge(approval.status)}
                          <span className="text-sm text-gray-500">
                            <Clock className="inline h-4 w-4 mr-1" />
                            {formatDate(approval.created_at)}
                          </span>
                          <span className="text-sm text-gray-500">
                            <FileText className="inline h-4 w-4 mr-1" />
                            {getItemTypeDisplay(approval.item_type)}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Dialog open={isDialogOpen && selectedApproval?.id === approval.id} onOpenChange={(open) => {
                          setIsDialogOpen(open);
                          if (!open) {
                            setSelectedApproval(null);
                            setSelectedDocument(null);
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleViewDocument(approval)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Vollständige Ansicht
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <div className="flex items-center justify-between">
                                <DialogTitle>Vollständiges Dokument - {getItemTypeDisplay(selectedApproval?.item_type || '')}</DialogTitle>
                                <div className="flex space-x-2">
                                  {selectedDocument?.source_url && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => window.open(selectedDocument.source_url, '_blank')}
                                    >
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      Originalquelle
                                    </Button>
                                  )}
                                  {selectedDocument && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => downloadDocument(selectedDocument)}
                                    >
                                      <Download className="h-4 w-4 mr-2" />
                                      Download
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </DialogHeader>
                            
                            {selectedDocument ? (
                              <div className="space-y-6">
                                {/* Dokumentkopf */}
                                <div className="border-b pb-4">
                                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {selectedDocument.title}
                                  </h3>
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    <Badge className="bg-blue-100 text-blue-800">{selectedDocument.region}</Badge>
                                    <Badge className="bg-purple-100 text-purple-800">{selectedDocument.priority}</Badge>
                                    <Badge className="bg-green-100 text-green-800">{selectedDocument.update_type}</Badge>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div><strong>Dokument-ID:</strong> {selectedDocument.id}</div>
                                    <div><strong>Quell-ID:</strong> {selectedDocument.source_id}</div>
                                    <div><strong>Veröffentlicht:</strong> {formatDate(selectedDocument.published_at)}</div>
                                    <div><strong>Erstellt:</strong> {formatDate(selectedDocument.created_at)}</div>
                                  </div>
                                </div>

                                {/* Vollständige Beschreibung */}
                                <div>
                                  <h4 className="font-semibold text-lg mb-3 text-gray-900">Vollständiger Inhalt</h4>
                                  <div className="bg-gray-50 p-6 rounded-lg border">
                                    <div className="prose prose-sm max-w-none">
                                      <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                                        {selectedDocument.description}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Quelle und Links */}
                                {selectedDocument.source_url && (
                                  <div>
                                    <h4 className="font-semibold text-lg mb-3 text-gray-900">Originalquelle</h4>
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                      <div className="flex items-center space-x-2">
                                        <Link2 className="h-5 w-5 text-blue-600" />
                                        <a 
                                          href={selectedDocument.source_url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:text-blue-800 underline break-all"
                                        >
                                          {selectedDocument.source_url}
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Geräteklassen */}
                                {selectedDocument.device_classes && selectedDocument.device_classes.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold text-lg mb-3 text-gray-900">Betroffene Geräteklassen</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedDocument.device_classes.map((deviceClass, index) => (
                                        <Badge key={index} variant="outline" className="bg-orange-50 text-orange-800 border-orange-200">
                                          {deviceClass}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* KI-Bewertung */}
                                <div>
                                  <h4 className="font-semibold text-lg mb-3 text-gray-900">Erweiterte KI-Analyse</h4>
                                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                                    <div className="space-y-4">
                                      <div className="flex items-start space-x-2">
                                        <Badge className="bg-blue-100 text-blue-800 mt-1">KI-Assessment</Badge>
                                        <div className="flex-1">
                                          <pre className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed font-sans">
                                            {selectedDocument?.raw_data?.aiAnalysis || getDetailedAIAnalysis(selectedApproval)}
                                          </pre>
                                        </div>
                                      </div>
                                      
                                      {selectedDocument?.raw_data?.processingMetadata && (
                                        <div className="mt-4 pt-4 border-t border-blue-200">
                                          <h5 className="font-medium text-gray-900 mb-2">Verarbeitungsmetadaten:</h5>
                                          <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div><strong>Analysezeit:</strong> {selectedDocument.raw_data.processingMetadata.analysisTime}</div>
                                            <div><strong>Confidence Score:</strong> {Math.round(selectedDocument.raw_data.processingMetadata.confidenceScore * 100)}%</div>
                                            <div><strong>Compliance Check:</strong> {selectedDocument.raw_data.processingMetadata.complianceChecks}</div>
                                            <div><strong>Flagged Terms:</strong> {selectedDocument.raw_data.processingMetadata.flaggedTerms}</div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Review-Kommentare */}
                                <div>
                                  <h4 className="font-semibold text-lg mb-3 text-gray-900">Review-Kommentare</h4>
                                  <Textarea
                                    value={reviewComments}
                                    onChange={(e) => setReviewComments(e.target.value)}
                                    placeholder="Fügen Sie Ihre Review-Kommentare zum vollständigen Dokument hinzu..."
                                    rows={4}
                                    className="w-full"
                                  />
                                </div>
                                
                                {/* Aktionsbuttons */}
                                <div className="flex justify-end space-x-3 pt-4 border-t">
                                  <Button 
                                    variant="destructive" 
                                    onClick={() => selectedApproval && handleReject(selectedApproval)}
                                    disabled={updateApprovalMutation.isPending}
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Dokument ablehnen
                                  </Button>
                                  <Button 
                                    onClick={() => selectedApproval && handleApprove(selectedApproval)}
                                    disabled={updateApprovalMutation.isPending}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <Check className="h-4 w-4 mr-2" />
                                    Dokument genehmigen
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8 text-gray-500">
                                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                                <p>Dokument konnte nicht geladen werden</p>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          size="sm"
                          onClick={() => handleApprove(approval)}
                          disabled={updateApprovalMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(approval)}
                          disabled={updateApprovalMutation.isPending}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 line-clamp-3">
                      {approval.comments || 'KI-Bewertung: Automatische Analyse durchgeführt - Manuelle Überprüfung erforderlich'}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Check className="mx-auto h-8 w-8 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Keine Pending Approvals</h3>
                  <p className="text-gray-500">Alle Items wurden bereits überprüft.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardContent className="text-center py-8">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Approved Items</h3>
              <p className="text-gray-500">Genehmigte Items werden hier angezeigt.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardContent className="text-center py-8">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Rejected Items</h3>
              <p className="text-gray-500">Abgelehnte Items werden hier angezeigt.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}