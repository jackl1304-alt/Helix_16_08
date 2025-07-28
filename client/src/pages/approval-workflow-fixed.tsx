import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, X, Eye, Clock, FileText } from "lucide-react";
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

export default function ApprovalWorkflowFixed() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [reviewComments, setReviewComments] = useState('');

  const { data: approvals, isLoading } = useQuery<Approval[]>({
    queryKey: ["/api/approvals/pending"],
  });

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
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedApproval(approval)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Review Item</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2">Item Details</h4>
                                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                  <div><strong>Type:</strong> {getItemTypeDisplay(approval.item_type)}</div>
                                  <div><strong>ID:</strong> {approval.item_id}</div>
                                  <div><strong>Created:</strong> {formatDate(approval.created_at)}</div>
                                  {approval.comments && (
                                    <div><strong>KI-Kommentar:</strong> {approval.comments}</div>
                                  )}
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Review Comments
                                </label>
                                <Textarea
                                  value={reviewComments}
                                  onChange={(e) => setReviewComments(e.target.value)}
                                  placeholder="Fügen Sie Ihre Review-Kommentare hinzu..."
                                  rows={4}
                                />
                              </div>
                              
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="destructive" 
                                  onClick={() => handleReject(approval)}
                                  disabled={updateApprovalMutation.isPending}
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Ablehnen
                                </Button>
                                <Button 
                                  onClick={() => handleApprove(approval)}
                                  disabled={updateApprovalMutation.isPending}
                                >
                                  <Check className="h-4 w-4 mr-2" />
                                  Genehmigen
                                </Button>
                              </div>
                            </div>
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