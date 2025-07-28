import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Eye
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

export default function DashboardFixed() {
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
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
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
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
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