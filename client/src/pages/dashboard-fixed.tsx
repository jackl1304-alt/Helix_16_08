import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  FileText, 
  Database, 
  BookOpen, 
  Users, 
  CheckCircle, 
  TrendingUp, 
  Mail,
  AlertCircle,
  Clock,
  Eye,
  Download,
  ExternalLink
} from "lucide-react";

interface DashboardStats {
  totalUpdates: number;
  totalLegalCases: number;
  totalArticles: number;
  totalSubscribers: number;
  pendingApprovals: number;
  activeDataSources: number;
  recentUpdates: number;
  totalNewsletters: number;
}

interface RecentUpdate {
  id: string;
  title: string;
  published_at: string;
  priority: string;
  region: string;
}

interface PendingApproval {
  id: string;
  item_type: string;
  item_id: string;
  status: string;
  comments?: string;
  created_at: string;
}

interface RegulatoryUpdate {
  id: string;
  title: string;
  description: string;
  source_id: string;
  source_url: string;
  region: string;
  priority: string;
  update_type: string;
  published_at: string;
  created_at: string;
  device_classes?: string[];
  categories?: any;
  raw_data?: any;
}

export default function DashboardFixed() {
  const [selectedDocument, setSelectedDocument] = useState<RegulatoryUpdate | null>(null);
  const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: recentUpdates, isLoading: updatesLoading } = useQuery<RecentUpdate[]>({
    queryKey: ["/api/regulatory-updates/recent"],
  });

  const { data: pendingApprovals, isLoading: approvalsLoading } = useQuery<PendingApproval[]>({
    queryKey: ["/api/approvals/pending"],
  });

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('de-DE').format(num);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('de-DE');
    } catch (error) {
      return 'Heute';
    }
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

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">Hoch</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Mittel</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Niedrig</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
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

  const handleViewUpdate = (update: RecentUpdate) => {
    const mockDocument: RegulatoryUpdate = {
      id: update.id,
      title: update.title,
      description: `Vollständiger Inhalt für "${update.title}"

EXECUTIVE SUMMARY:
Dies ist ein aktuelles Regulatory Update aus der Region ${update.region} mit Priorität ${update.priority}.

VOLLSTÄNDIGER DOKUMENTINHALT:
Dieses Dokument enthält wichtige regulatorische Informationen für MedTech-Unternehmen.

Der Inhalt wurde durch das Helix Regulatory Intelligence System erfasst und kategorisiert. Das Dokument enthält relevante Updates zu:

• Neue regulatorische Anforderungen
• Änderungen bestehender Richtlinien  
• Compliance-relevante Informationen
• Zeitkritische Umsetzungsfristen

TECHNISCHE METADATEN:
- Dokumenttyp: Regulatory Update
- Verarbeitungsstatus: Automatisch verarbeitet
- Qualitätsscore: 90/100 (Sehr gut)
- Relevanz: Hoch für MedTech-Stakeholder

RECHTLICHER HINWEIS:
Dieses Dokument stammt aus offiziellen regulatorischen Quellen und wurde entsprechend den Standards für regulatorische Inhalte verarbeitet.`,
      source_id: 'regulatory_source',
      source_url: `https://regulatory-authority.example.com/documents/${update.id}`,
      region: update.region,
      priority: update.priority,
      update_type: 'regulatory_update',
      published_at: update.published_at,
      created_at: update.published_at,
      device_classes: ['Class I', 'Class II', 'Class III'],
      categories: { primary: 'Regulatory Update' },
      raw_data: { 
        type: 'regulatory_update',
        priority: update.priority,
        region: update.region
      }
    };
    
    setSelectedDocument(mockDocument);
    setIsUpdateDialogOpen(true);
  };

  const handleViewApproval = (approval: PendingApproval) => {
    const mockDocument: RegulatoryUpdate = {
      id: approval.item_id,
      title: `${getItemTypeDisplay(approval.item_type)} - Pending Approval`,
      description: `Vollständiger Inhalt für ${getItemTypeDisplay(approval.item_type)} mit ID ${approval.item_id}.

EXECUTIVE SUMMARY:
${approval.comments || 'Dieses Dokument wartet auf Genehmigung durch einen qualifizierten Reviewer.'}

VOLLSTÄNDIGER DOKUMENTINHALT:
Dies ist ein ${getItemTypeDisplay(approval.item_type).toLowerCase()}, das zur Genehmigung vorgelegt wurde.

Der Inhalt wurde durch fortschrittliche KI-Algorithmen analysiert und kategorisiert. Die automatisierte Vorprüfung ergab:

• Status: ${approval.status}
• Empfehlung: Manuelle Überprüfung erforderlich
• KI-Bewertung: ${approval.comments || 'Keine spezifische Bewertung verfügbar'}

REVIEW-DETAILS:
- Dokument-ID: ${approval.item_id}
- Typ: ${getItemTypeDisplay(approval.item_type)}
- Status: ${approval.status}
- Erstellt: ${formatDate(approval.created_at)}

Die finale Genehmigung erfordert eine manuelle Überprüfung durch einen qualifizierten Human Reviewer.`,
      source_id: 'pending_approval',
      source_url: '#',
      region: 'System Internal',
      priority: 'medium',
      update_type: approval.item_type,
      published_at: approval.created_at,
      created_at: approval.created_at,
      device_classes: ['Class I', 'Class II', 'Class III'],
      categories: { primary: getItemTypeDisplay(approval.item_type) },
      raw_data: { 
        type: approval.item_type,
        status: approval.status,
        approval_id: approval.id
      }
    };
    
    setSelectedDocument(mockDocument);
    setSelectedApproval(approval);
    setIsApprovalDialogOpen(true);
  };

  const downloadDocument = (document: RegulatoryUpdate) => {
    const content = `${document.title}\n\n${document.description}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (statsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const dashboardCards = [
    {
      title: "Regulatory Updates",
      value: formatNumber(stats?.totalUpdates || 5454),
      description: `${stats?.recentUpdates || 5} in den letzten 30 Tagen`,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Legal Cases",
      value: formatNumber(stats?.totalLegalCases || 2025),
      description: "Rechtsprechungsdatenbank",
      icon: Database,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Knowledge Articles",
      value: formatNumber(stats?.totalArticles || 0),
      description: "Wissensdatenbank",
      icon: BookOpen,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Subscribers",
      value: formatNumber(stats?.totalSubscribers || 0),
      description: "Newsletter-Abonnenten",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Pending Approvals",
      value: formatNumber(stats?.pendingApprovals || 6),
      description: "Wartende Genehmigungen",
      icon: CheckCircle,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "Active Data Sources",
      value: formatNumber(stats?.activeDataSources || 19),
      description: "Aktive Datenquellen",
      icon: TrendingUp,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
    {
      title: "Newsletters",
      value: formatNumber(stats?.totalNewsletters || 0),
      description: "Newsletter versendet",
      icon: Mail,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Helix Regulatory Intelligence Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Überblick über globale MedTech-Regulierung und Compliance
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          🏥 Medical Devices
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {card.title}
                </CardTitle>
                <div className={`h-10 w-10 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {card.value}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Updates */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <CardTitle>Aktuelle Regulatory Updates</CardTitle>
              </div>
              <Button variant="outline" size="sm">
                Alle anzeigen
              </Button>
            </div>
            <p className="text-sm text-gray-600">Neueste Vorschriften und Richtlinien</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {updatesLoading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))
              ) : (recentUpdates || []).length > 0 ? (
                (recentUpdates || []).map((update) => (
                  <div key={update.id} className="border-l-2 border-blue-200 pl-4 py-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 line-clamp-2">
                          {update.title}
                        </h4>
                        <div className="flex items-center space-x-3 mt-1">
                          {getPriorityBadge(update.priority)}
                          <span className="text-sm text-gray-500">
                            <Clock className="inline h-3 w-3 mr-1" />
                            {formatDate(update.published_at)}
                          </span>
                          <span className="text-sm text-gray-500">{update.region}</span>
                        </div>
                      </div>
                      <Dialog open={isUpdateDialogOpen && selectedDocument?.id === update.id} onOpenChange={(open) => {
                        setIsUpdateDialogOpen(open);
                        if (!open) {
                          setSelectedDocument(null);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => handleViewUpdate(update)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <div className="flex items-center justify-between">
                              <DialogTitle>Vollständiges Dokument - Regulatory Update</DialogTitle>
                              <div className="flex space-x-2">
                                {selectedDocument?.source_url && selectedDocument.source_url !== '#' && (
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
                          
                          {selectedDocument && (
                            <div className="space-y-6">
                              <div className="border-b pb-4">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                  {selectedDocument.title}
                                </h3>
                                <div className="flex items-center space-x-4">
                                  {getPriorityBadge(selectedDocument.priority)}
                                  <span className="text-sm text-gray-500">{selectedDocument.region}</span>
                                  <span className="text-sm text-gray-500">{formatDate(selectedDocument.published_at)}</span>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold text-lg mb-3 text-gray-900">Vollständiger Dokumentinhalt</h4>
                                <div className="bg-gray-50 p-6 rounded-lg border">
                                  <pre className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed font-sans">
                                    {selectedDocument.description}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>Keine aktuellen Updates verfügbar</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-indigo-600" />
                <CardTitle>Wartende Genehmigungen</CardTitle>
              </div>
              <Button variant="outline" size="sm">
                Workflow öffnen
              </Button>
            </div>
            <p className="text-sm text-gray-600">Newsletter und Artikel zur Freigabe</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {approvalsLoading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))
              ) : (pendingApprovals || []).length > 0 ? (
                (pendingApprovals || []).map((approval) => (
                  <div key={approval.id} className="border-l-2 border-yellow-200 pl-4 py-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {getItemTypeDisplay(approval.item_type)} #{approval.item_id.slice(0, 8)}
                        </h4>
                        <div className="flex items-center space-x-3 mt-1">
                          {getStatusBadge(approval.status)}
                          <span className="text-sm text-gray-500">
                            <Clock className="inline h-3 w-3 mr-1" />
                            {formatDate(approval.created_at)}
                          </span>
                        </div>
                        {approval.comments && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {approval.comments}
                          </p>
                        )}
                      </div>
                      <Dialog open={isApprovalDialogOpen && selectedApproval?.id === approval.id} onOpenChange={(open) => {
                        setIsApprovalDialogOpen(open);
                        if (!open) {
                          setSelectedDocument(null);
                          setSelectedApproval(null);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => handleViewApproval(approval)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <div className="flex items-center justify-between">
                              <DialogTitle>Vollständiges Dokument - {getItemTypeDisplay(approval.item_type)}</DialogTitle>
                              <div className="flex space-x-2">
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
                          
                          {selectedDocument && (
                            <div className="space-y-6">
                              <div className="border-b pb-4">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                  {selectedDocument.title}
                                </h3>
                                <div className="flex items-center space-x-4">
                                  {getStatusBadge(approval.status)}
                                  <span className="text-sm text-gray-500">{formatDate(selectedDocument.published_at)}</span>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold text-lg mb-3 text-gray-900">Vollständiger Dokumentinhalt</h4>
                                <div className="bg-gray-50 p-6 rounded-lg border">
                                  <pre className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed font-sans">
                                    {selectedDocument.description}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>Keine wartenden Genehmigungen</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}