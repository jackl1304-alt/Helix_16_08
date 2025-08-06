import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, X, Eye, Clock, AlertCircle, FileText, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Approval {
  id: string;
  item_type: string;
  item_id: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  reviewer_id?: string;
  reviewed_at?: string;
  created_at: string;
  itemTitle?: string;
  itemDescription?: string;
}

export default function ApprovalWorkflow() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [reviewComments, setReviewComments] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');

  const { data: approvals, isLoading } = useQuery<Approval[]>({
    queryKey: statusFilter === 'pending' ? ["/api/approvals/pending"] : ["/api/approvals"],
  });

  const updateApprovalMutation = useMutation({
    mutationFn: async ({ id, status, comments }: { id: string; status: string; comments?: string }) => {
      try {
        const response = await fetch(`/api/approvals/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            status, 
            comments, 
            reviewerId: "current-user"
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        console.error("Update approval error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/approvals"] });
      setSelectedApproval(null);
      setReviewComments('');
      toast({
        title: "Approval Updated",
        description: "The approval status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update approval status.",
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
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Approval Workflow</h1>
        <p className="text-gray-600 mt-1">Review and approve regulatory content and newsletters</p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="pending">Pending ({(approvals?.filter(a => a.status === 'pending') || []).length})</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All Items</TabsTrigger>
          </TabsList>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="pending">
          <div className="grid gap-4">
            {(approvals?.filter(a => a.status === 'pending') || []).length > 0 ? (
              (approvals?.filter(a => a.status === 'pending') || []).map((approval) => (
                <Card key={approval.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {approval.itemTitle || `${approval.item_type} #${approval.item_id.slice(0, 8)}`}
                        </h3>
                        <div className="flex items-center space-x-4 mt-2">
                          {getStatusBadge(approval.status)}
                          <span className="text-sm text-gray-500">
                            <Clock className="inline h-4 w-4 mr-1" />
                            {approval.created_at ? new Date(approval.created_at).toLocaleDateString('de-DE') : 'Unbekannt'}
                          </span>
                          <span className="text-sm text-gray-500">
                            <FileText className="inline h-4 w-4 mr-1" />
                            {approval.item_type}
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
                                <p className="text-gray-600">
                                  {approval.itemDescription || 'No description available'}
                                </p>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Review Comments
                                </label>
                                <Textarea
                                  value={reviewComments}
                                  onChange={(e) => setReviewComments(e.target.value)}
                                  placeholder="Add your review comments..."
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
                                  Reject
                                </Button>
                                <Button 
                                  onClick={() => handleApprove(approval)}
                                  disabled={updateApprovalMutation.isPending}
                                >
                                  <Check className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 line-clamp-3">
                      {approval.comments || 'Keine KI-Kommentare verfügbar'}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Check className="mx-auto h-8 w-8 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Pending Approvals</h3>
                  <p className="text-gray-500">All items have been reviewed.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="approved">
          <div className="grid gap-4">
            {approvals?.filter(a => a.status === 'approved').map((approval) => (
              <Card key={approval.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {approval.itemTitle || `${approval.itemType} #${approval.itemId}`}
                      </h3>
                      <div className="flex items-center space-x-4 mt-2">
                        {getStatusBadge(approval.status)}
                        <span className="text-sm text-gray-500">
                          Approved: {approval.reviewedAt ? new Date(approval.reviewedAt).toLocaleDateString() : 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                {approval.comments && (
                  <CardContent>
                    <div className="bg-green-50 p-3 rounded">
                      <p className="text-sm text-green-800">
                        <MessageSquare className="inline h-4 w-4 mr-1" />
                        {approval.comments}
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            )) || (
              <Card>
                <CardContent className="text-center py-8">
                  <AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-4" />
                  <p className="text-gray-500">No approved items yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="rejected">
          <div className="grid gap-4">
            {approvals?.filter(a => a.status === 'rejected').map((approval) => (
              <Card key={approval.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {approval.itemTitle || `${approval.itemType} #${approval.itemId}`}
                      </h3>
                      <div className="flex items-center space-x-4 mt-2">
                        {getStatusBadge(approval.status)}
                        <span className="text-sm text-gray-500">
                          Rejected: {approval.reviewedAt ? new Date(approval.reviewedAt).toLocaleDateString() : 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                {approval.comments && (
                  <CardContent>
                    <div className="bg-red-50 p-3 rounded">
                      <p className="text-sm text-red-800">
                        <MessageSquare className="inline h-4 w-4 mr-1" />
                        {approval.comments}
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            )) || (
              <Card>
                <CardContent className="text-center py-8">
                  <AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-4" />
                  <p className="text-gray-500">No rejected items</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="all">
          <div className="grid gap-4">
            {approvals && approvals.length > 0 ? (
              approvals.map((approval) => (
                <Card key={approval.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {approval.itemTitle || `${approval.itemType} #${approval.itemId}`}
                        </h3>
                        <div className="flex items-center space-x-4 mt-2">
                          {getStatusBadge(approval.status)}
                          <span className="text-sm text-gray-500">
                            <Clock className="inline h-4 w-4 mr-1" />
                            {new Date(approval.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  {approval.comments && (
                    <CardContent>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-700">
                          <MessageSquare className="inline h-4 w-4 mr-1" />
                          {approval.comments}
                        </p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Items Found</h3>
                  <p className="text-gray-500">No approval items match the current filter.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}