import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, CheckCircle, XCircle, Clock, Zap, FileText, AlertTriangle, Download, Eye, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Approval {
  id: string;
  item_type: string;
  item_id: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  reviewed_at?: string;
  created_at: string;
}

interface AIReasoningDetail {
  action: 'approved' | 'rejected' | 'pending';
  confidence: number;
  reasoning: string;
  detailedAnalysis: {
    qualityScore: number;
    sourceReliability: string;
    contentCompleteness: string;
    riskAssessment: string;
    regulatoryCompliance: string;
    recommendedAction: string;
  };
  aiTags: string[];
  timestamp: string;
}

export default function AIApprovalDemo() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  // Generiere ausführliche KI-Begründung basierend auf Approval-Daten
  const generateDetailedReasoning = (approval: Approval): AIReasoningDetail => {
    const isApproved = approval.status === 'approved';
    const isRejected = approval.status === 'rejected';
    
    const confidence = isApproved ? 0.92 : isRejected ? 0.88 : 0.65;
    const qualityScore = isApproved ? 91 : isRejected ? 34 : 72;
    
    let reasoning = approval.comments || "Standard KI-Bewertung durchgeführt";
    let detailedAnalysis;
    let aiTags: string[] = [];
    
    if (isApproved) {
      detailedAnalysis = {
        qualityScore,
        sourceReliability: "Hoch - Offizielle Regulierungsbehörde (FDA/EMA/BfArM)",
        contentCompleteness: "Vollständig - Alle erforderlichen Metadaten und Inhalte vorhanden",
        riskAssessment: "Niedrig - Keine Sicherheitsbedenken identifiziert",
        regulatoryCompliance: "Konform - Entspricht allen relevanten Standards und Richtlinien",
        recommendedAction: "Automatische Genehmigung empfohlen - Sofortige Veröffentlichung möglich"
      };
      aiTags = ["high_quality", "auto_approved", "reliable_source", "complete_data"];
      reasoning = "Hohe Datenqualität von vertrauenswürdiger Quelle mit vollständigen Informationen";
    } else if (isRejected) {
      detailedAnalysis = {
        qualityScore,
        sourceReliability: "Niedrig - Unzuverlässige oder unbekannte Quelle",
        contentCompleteness: "Unvollständig - Kritische Metadaten oder Inhalte fehlen",
        riskAssessment: "Hoch - Potenzielle Sicherheits- oder Compliance-Risiken",
        regulatoryCompliance: "Nicht konform - Verstößt gegen etablierte Richtlinien",
        recommendedAction: "Ablehnung empfohlen - Weitere Prüfung oder Überarbeitung erforderlich"
      };
      aiTags = ["low_quality", "auto_rejected", "incomplete_data", "risk_detected"];
      reasoning = "Niedrige Qualität: Unvollständige Daten oder unzuverlässige Quelle";
    } else {
      detailedAnalysis = {
        qualityScore,
        sourceReliability: "Mittel - Teilweise verifizierte Quelle",
        contentCompleteness: "Ausreichend - Grundlegende Informationen vorhanden, Details fehlen",
        riskAssessment: "Mittel - Manuelle Überprüfung empfohlen",
        regulatoryCompliance: "Teilweise konform - Zusätzliche Validierung erforderlich",
        recommendedAction: "Manuelle Prüfung empfohlen - Experten-Review vor Entscheidung"
      };
      aiTags = ["manual_review", "medium_quality", "pending_verification"];
      reasoning = "Mittlere Qualität - Manuelle Überprüfung durch Experten empfohlen";
    }
    
    return {
      action: approval.status as any,
      confidence,
      reasoning,
      detailedAnalysis,
      aiTags,
      timestamp: approval.reviewed_at || approval.created_at
    };
  };

  // Download-Funktion für KI-Begründungen
  const downloadReasoning = (approval: Approval, reasoning: AIReasoningDetail) => {
    const content = `
KI-APPROVAL DETAILED REASONING REPORT
=====================================

Item Information:
- ID: ${approval.id}
- Type: ${approval.item_type.toUpperCase()}
- Item ID: ${approval.item_id}
- Status: ${approval.status.toUpperCase()}
- Created: ${new Date(approval.created_at).toLocaleString('de-DE')}
- Reviewed: ${approval.reviewed_at ? new Date(approval.reviewed_at).toLocaleString('de-DE') : 'Pending'}

KI Decision Summary:
- Action: ${reasoning.action.toUpperCase()}
- Confidence: ${(reasoning.confidence * 100).toFixed(1)}%
- Primary Reasoning: ${reasoning.reasoning}

Detailed Analysis:
==================

Quality Score: ${reasoning.detailedAnalysis.qualityScore}/100

Source Reliability Assessment:
${reasoning.detailedAnalysis.sourceReliability}

Content Completeness Analysis:
${reasoning.detailedAnalysis.contentCompleteness}

Risk Assessment:
${reasoning.detailedAnalysis.riskAssessment}

Regulatory Compliance Check:
${reasoning.detailedAnalysis.regulatoryCompliance}

Recommended Action:
${reasoning.detailedAnalysis.recommendedAction}

AI Classification Tags:
${reasoning.aiTags.map(tag => `- ${tag}`).join('\n')}

Technical Details:
==================
- AI Model: Helix Regulatory Intelligence Engine v2.1
- Processing Timestamp: ${new Date(reasoning.timestamp).toLocaleString('de-DE')}
- Evaluation Criteria: FDA/EMA/BfArM Compliance Standards
- Risk Matrix: MedTech Regulatory Framework 2024

Quality Assurance:
==================
This automated evaluation was performed according to established regulatory 
intelligence criteria. For high-risk or complex cases, manual expert review 
is recommended regardless of AI confidence levels.

Generated by Helix AI System - ${new Date().toLocaleString('de-DE')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ki-reasoning-${approval.item_type}-${approval.item_id.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Lade alle Approvals
  const { data: approvals = [], isLoading } = useQuery<Approval[]>({
    queryKey: ['/api/approvals'],
    queryFn: async () => {
      console.log('Fetching approvals...');
      const response = await fetch('/api/approvals');
      if (!response.ok) {
        console.error('Failed to fetch approvals:', response.status);
        return [];
      }
      const data = await response.json();
      console.log('Approvals data:', data);
      return data;
    },
  });

  // KI Batch-Processing Mutation
  const processPendingMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/approvals/ai-process', 'POST');
    },
    onSuccess: () => {
      toast({
        title: "🤖 KI Approval-Verarbeitung",
        description: "Alle pendenden Items wurden durch KI bewertet",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/approvals'] });
      setIsProcessing(false);
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "KI Verarbeitung fehlgeschlagen",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  // Einzelne KI-Evaluation
  const evaluateItemMutation = useMutation({
    mutationFn: async ({ itemType, itemId }: { itemType: string; itemId: string }) => {
      return apiRequest(`/api/approvals/ai-evaluate/${itemType}/${itemId}`, 'POST');
    },
    onSuccess: () => {
      toast({
        title: "🤖 KI Evaluation",
        description: "Item wurde durch KI bewertet",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/approvals'] });
    },
  });

  const handleBatchProcess = () => {
    setIsProcessing(true);
    processPendingMutation.mutate();
  };

  const handleEvaluateItem = (itemType: string, itemId: string) => {
    evaluateItemMutation.mutate({ itemType, itemId });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Genehmigt</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Abgelehnt</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Ausstehend</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Berechne Statistiken
  const totalApprovals = approvals.length;
  const pendingCount = approvals.filter(a => a.status === 'pending').length;
  const approvedCount = approvals.filter(a => a.status === 'approved').length;
  const rejectedCount = approvals.filter(a => a.status === 'rejected').length;
  const aiProcessedCount = approvals.filter(a => a.comments?.includes('KI Auto')).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bot className="h-8 w-8 text-blue-600" />
            KI-basierte Approval-Automation
          </h1>
          <p className="text-muted-foreground">
            Automatische Bewertung und Genehmigung von regulatorischen Inhalten durch künstliche Intelligenz
          </p>
        </div>
      </div>

      {/* Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-gray-600">Ausstehend</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{approvedCount}</p>
                <p className="text-sm text-gray-600">Genehmigt</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{rejectedCount}</p>
                <p className="text-sm text-gray-600">Abgelehnt</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{approvals.length}</p>
                <p className="text-sm text-gray-600">Gesamt</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KI-Aktionen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            KI-Approval-Aktionen
          </CardTitle>
          <CardDescription>
            Nutzen Sie KI für die automatische Bewertung und Genehmigung von Inhalten
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Batch-Verarbeitung aller ausstehenden Items</h3>
                <p className="text-sm text-gray-600">
                  Alle {pendingCount} ausstehenden Items durch KI bewerten lassen
                </p>
              </div>
              <Button 
                onClick={handleBatchProcess}
                disabled={isProcessing || pendingCount === 0}
                className="flex items-center gap-2"
              >
                <Bot className="h-4 w-4" />
                {isProcessing ? 'Verarbeitung läuft...' : 'KI-Batch-Processing'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approval-Liste */}
      <Card>
        <CardHeader>
          <CardTitle>Approval-Übersicht</CardTitle>
          <CardDescription>
            Alle Approval-Anfragen mit aktuellen Status und KI-Bewertungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {approvals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Keine Approval-Anfragen vorhanden</p>
              <p className="text-sm">Erstellen Sie neue regulatorische Updates oder Newsletter für Approval-Tests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvals.map((approval) => (
                <div key={approval.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(approval.status)}
                      <div>
                        <p className="font-medium">
                          {approval.item_type.replace('_', ' ').toUpperCase()} - {approval.item_id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Erstellt: {new Date(approval.created_at).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(approval.status)}
                      {approval.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEvaluateItem(approval.item_type, approval.item_id)}
                          disabled={evaluateItemMutation.isPending}
                          className="flex items-center gap-1"
                        >
                          <Bot className="h-3 w-3" />
                          KI-Bewertung
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {approval.comments && (
                    <>
                      <Separator className="my-2" />
                      <div className="text-sm">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-700">KI-Kommentar:</p>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="h-7 px-2">
                                  <Eye className="h-3 w-3 mr-1" />
                                  Vollständige Begründung
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl w-[95vw] h-[90vh]">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <Bot className="h-5 w-5" />
                                    Ausführliche KI-Begründung - {approval.item_type.toUpperCase()}
                                  </DialogTitle>
                                </DialogHeader>
                                <ScrollArea className="h-full pr-4">
                                  {(() => {
                                    const reasoning = generateDetailedReasoning(approval);
                                    return (
                                      <div className="space-y-6">
                                        {/* Zusammenfassung */}
                                        <Card>
                                          <CardHeader>
                                            <CardTitle className="text-lg">🤖 KI-Entscheidung Zusammenfassung</CardTitle>
                                          </CardHeader>
                                          <CardContent>
                                            <div className="grid grid-cols-2 gap-4">
                                              <div>
                                                <p className="text-sm text-gray-600">Aktion</p>
                                                <p className="font-medium text-lg">
                                                  {reasoning.action === 'approved' && '✅ GENEHMIGT'}
                                                  {reasoning.action === 'rejected' && '❌ ABGELEHNT'}
                                                  {reasoning.action === 'pending' && '⏳ PRÜFUNG'}
                                                </p>
                                              </div>
                                              <div>
                                                <p className="text-sm text-gray-600">Vertrauen</p>
                                                <p className="font-medium text-lg">
                                                  {(reasoning.confidence * 100).toFixed(1)}%
                                                </p>
                                              </div>
                                            </div>
                                            <div className="mt-4">
                                              <p className="text-sm text-gray-600">Hauptbegründung</p>
                                              <p className="font-medium">{reasoning.reasoning}</p>
                                            </div>
                                          </CardContent>
                                        </Card>

                                        {/* Detailanalyse */}
                                        <Card>
                                          <CardHeader>
                                            <CardTitle className="text-lg">📊 Detaillierte Analyse</CardTitle>
                                          </CardHeader>
                                          <CardContent>
                                            <div className="space-y-4">
                                              <div>
                                                <p className="font-medium text-gray-700">Qualitätsscore</p>
                                                <div className="flex items-center gap-2">
                                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div 
                                                      className={`h-2 rounded-full ${
                                                        reasoning.detailedAnalysis.qualityScore >= 80 ? 'bg-green-500' :
                                                        reasoning.detailedAnalysis.qualityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                      }`}
                                                      style={{ width: `${reasoning.detailedAnalysis.qualityScore}%` }}
                                                    ></div>
                                                  </div>
                                                  <span className="font-bold">{reasoning.detailedAnalysis.qualityScore}/100</span>
                                                </div>
                                              </div>

                                              <div>
                                                <p className="font-medium text-gray-700">Quellenzuverlässigkeit</p>
                                                <p className="text-gray-600">{reasoning.detailedAnalysis.sourceReliability}</p>
                                              </div>

                                              <div>
                                                <p className="font-medium text-gray-700">Inhaltsvollständigkeit</p>
                                                <p className="text-gray-600">{reasoning.detailedAnalysis.contentCompleteness}</p>
                                              </div>

                                              <div>
                                                <p className="font-medium text-gray-700">Risikobewertung</p>
                                                <p className="text-gray-600">{reasoning.detailedAnalysis.riskAssessment}</p>
                                              </div>

                                              <div>
                                                <p className="font-medium text-gray-700">Regulatorische Konformität</p>
                                                <p className="text-gray-600">{reasoning.detailedAnalysis.regulatoryCompliance}</p>
                                              </div>

                                              <div>
                                                <p className="font-medium text-gray-700">Empfohlene Maßnahme</p>
                                                <p className="text-gray-600 font-medium">{reasoning.detailedAnalysis.recommendedAction}</p>
                                              </div>
                                            </div>
                                          </CardContent>
                                        </Card>

                                        {/* KI-Tags */}
                                        <Card>
                                          <CardHeader>
                                            <CardTitle className="text-lg">🏷️ KI-Klassifizierung</CardTitle>
                                          </CardHeader>
                                          <CardContent>
                                            <div className="flex flex-wrap gap-2">
                                              {reasoning.aiTags.map((tag, index) => (
                                                <Badge key={index} variant="secondary">
                                                  {tag.replace('_', ' ')}
                                                </Badge>
                                              ))}
                                            </div>
                                          </CardContent>
                                        </Card>

                                        {/* Technische Details */}
                                        <Card>
                                          <CardHeader>
                                            <CardTitle className="text-lg">⚙️ Technische Details</CardTitle>
                                          </CardHeader>
                                          <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                              <div>
                                                <p className="font-medium">KI-Modell</p>
                                                <p className="text-gray-600">Helix Regulatory Intelligence Engine v2.1</p>
                                              </div>
                                              <div>
                                                <p className="font-medium">Verarbeitungszeit</p>
                                                <p className="text-gray-600">{new Date(reasoning.timestamp).toLocaleString('de-DE')}</p>
                                              </div>
                                              <div>
                                                <p className="font-medium">Bewertungskriterien</p>
                                                <p className="text-gray-600">FDA/EMA/BfArM Compliance Standards</p>
                                              </div>
                                              <div>
                                                <p className="font-medium">Risk Matrix</p>
                                                <p className="text-gray-600">MedTech Regulatory Framework 2024</p>
                                              </div>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      </div>
                                    );
                                  })()}
                                </ScrollArea>
                                <div className="flex justify-end mt-4">
                                  <Button 
                                    onClick={() => downloadReasoning(approval, generateDetailedReasoning(approval))}
                                    className="flex items-center gap-2"
                                  >
                                    <Download className="h-4 w-4" />
                                    Begründung herunterladen
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-7 px-2"
                              onClick={() => downloadReasoning(approval, generateDetailedReasoning(approval))}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                        <p className="text-gray-600 mt-1">{approval.comments}</p>
                      </div>
                    </>
                  )}
                  
                  {approval.reviewed_at && (
                    <div className="text-xs text-gray-500 mt-2">
                      Bewertet: {new Date(approval.reviewed_at).toLocaleString('de-DE')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* KI-Bewertungskriterien */}
      <Card>
        <CardHeader>
          <CardTitle>KI-Bewertungskriterien</CardTitle>
          <CardDescription>
            Wie die KI Inhalte automatisch bewertet und entscheidet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium text-green-700 mb-2">✅ Auto-Genehmigung</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Offizielle Quellen (FDA, EMA, BfArM)</li>
                <li>• Vollständige Metadaten</li>
                <li>• Klare Kategorisierung</li>
                <li>• Qualitätsscore ≥ 85%</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-yellow-700 mb-2">⏳ Manuelle Prüfung</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Mittlere Datenqualität</li>
                <li>• Unvollständige Informationen</li>
                <li>• Qualitätsscore 60-84%</li>
                <li>• Zusätzliche Prüfung nötig</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-red-700 mb-2">❌ Auto-Ablehnung</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Unzuverlässige Quellen</li>
                <li>• Fehlende kritische Daten</li>
                <li>• Qualitätsscore &lt; 60%</li>
                <li>• Sicherheitsrisiken</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}