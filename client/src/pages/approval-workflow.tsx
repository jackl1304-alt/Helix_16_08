import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
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
  itemType: string;
  itemId: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  reviewerId?: string;
  reviewedAt?: string;
  createdAt: string;
  // Virtual fields that would come from joins
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
    queryKey: ["/api/approvals", { status: statusFilter === 'all' ? undefined : statusFilter }],
  });

  const updateApprovalMutation = useMutation({
    mutationFn: async ({ id, status, comments }: { id: string; status: string; comments?: string }) => {
      await apiRequest("PATCH", `/api/approvals/${id}`, { 
        status, 
        comments, 
        reviewerId: "current-user" // In real app, this would come from auth context
      });
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update approval status.",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (approval: Approval, comments?: string) => {
    updateApprovalMutation.mutate({ 
      id: approval.id, 
      status: "approved",
      comments 
    });
  };

  const handleReject = (approval: Approval, comments?: string) => {
    updateApprovalMutation.mutate({ 
      id: approval.id, 
      status: "rejected",
      comments 
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

  const getItemTypeIcon = (itemType: string) => {
    switch (itemType) {
      case 'regulatory_update':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'newsletter':
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getItemTypeLabel = (itemType: string) => {
    switch (itemType) {
      case 'regulatory_update':
        return 'Regulatory Update';
      case 'newsletter':
        return 'Newsletter';
      default:
        return itemType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getPriorityLevel = (approval: Approval): 'low' | 'medium' | 'high' => {
    const createdAt = new Date(approval.createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > 48) return 'high';
    if (hoursDiff > 24) return 'medium';
    return 'low';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="grid gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Approval Workflow</h1>
              <p className="text-gray-600 mt-1">Review and approve content before publication</p>
            </div>

            <Tabs defaultValue="pending" className="space-y-6">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
                
                <div className="flex space-x-4">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Items</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <TabsContent value="pending" className="space-y-4">
                {!approvals || approvals.filter(a => a.status === 'pending').length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Check className="mx-auto h-12 w-12 text-green-500 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Approvals</h3>
                      <p className="text-gray-600">All items have been reviewed and processed.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {approvals
                      .filter(approval => approval.status === 'pending')
                      .map((approval) => {
                        const priority = getPriorityLevel(approval);
                        const priorityColors = {
                          low: 'border-gray-200 bg-white',
                          medium: 'border-yellow-200 bg-yellow-50',
                          high: 'border-red-200 bg-red-50'
                        };
                        
                        return (
                          <Card key={approval.id} className={`${priorityColors[priority]} hover:shadow-md transition-shadow`}>
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-3">
                                    {getItemTypeIcon(approval.itemType)}
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      {approval.itemTitle || `${getItemTypeLabel(approval.itemType)} Review`}
                                    </h3>
                                    {getStatusBadge(approval.status)}
                                    {priority === 'high' && (
                                      <Badge variant="destructive" className="text-xs">
                                        Urgent
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <p className="text-gray-600 mb-4">
                                    {approval.itemDescription || `Review required for ${getItemTypeLabel(approval.itemType).toLowerCase()}`}
                                  </p>
                                  
                                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                                    <div className="flex items-center space-x-2">
                                      <Clock className="h-4 w-4" />
                                      <span>Submitted: {new Date(approval.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      <span className="font-medium">Type:</span>
                                      <Badge variant="outline">{getItemTypeLabel(approval.itemType)}</Badge>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      <span className="font-medium">ID:</span>
                                      <span className="font-mono text-xs">{approval.itemId.substring(0, 8)}...</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex space-x-2 ml-4">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="sm" onClick={() => setSelectedApproval(approval)}>
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                      <DialogHeader>
                                        <DialogTitle>Review Item</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div>
                                          <h4 className="font-medium mb-2">Item Details</h4>
                                          <div className="bg-gray-50 p-4 rounded-lg">
                                            <p><strong>Type:</strong> {getItemTypeLabel(approval.itemType)}</p>
                                            <p><strong>Title:</strong> {approval.itemTitle || 'No title available'}</p>
                                            <p><strong>Description:</strong> {approval.itemDescription || 'No description available'}</p>
                                            <p><strong>Submitted:</strong> {new Date(approval.createdAt).toLocaleString()}</p>
                                          </div>
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
                                            variant="outline"
                                            onClick={() => handleReject(approval, reviewComments)}
                                            disabled={updateApprovalMutation.isPending}
                                          >
                                            <X className="mr-2 h-4 w-4" />
                                            Reject
                                          </Button>
                                          <Button
                                            onClick={() => handleApprove(approval, reviewComments)}
                                            disabled={updateApprovalMutation.isPending}
                                          >
                                            <Check className="mr-2 h-4 w-4" />
                                            Approve
                                          </Button>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleReject(approval)}
                                    disabled={updateApprovalMutation.isPending}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                  
                                  <Button
                                    size="sm"
                                    className="text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 border-green-200"
                                    onClick={() => handleApprove(approval)}
                                    disabled={updateApprovalMutation.isPending}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="approved" className="space-y-4">
                <div className="space-y-4">
                  {approvals
                    ?.filter(approval => approval.status === 'approved')
                    .map((approval) => (
                      <Card key={approval.id} className="border-green-200 bg-green-50">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                {getItemTypeIcon(approval.itemType)}
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {approval.itemTitle || `${getItemTypeLabel(approval.itemType)} Review`}
                                </h3>
                                {getStatusBadge(approval.status)}
                              </div>
                              
                              <p className="text-gray-600 mb-4">
                                {approval.itemDescription || `Approved ${getItemTypeLabel(approval.itemType).toLowerCase()}`}
                              </p>
                              
                              <div className="flex items-center space-x-6 text-sm text-gray-500">
                                <span>Approved: {approval.reviewedAt ? new Date(approval.reviewedAt).toLocaleDateString() : 'Recently'}</span>
                                {approval.comments && (
                                  <span>Comments: {approval.comments.substring(0, 50)}...</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="rejected" className="space-y-4">
                <div className="space-y-4">
                  {approvals
                    ?.filter(approval => approval.status === 'rejected')
                    .map((approval) => (
                      <Card key={approval.id} className="border-red-200 bg-red-50">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                {getItemTypeIcon(approval.itemType)}
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {approval.itemTitle || `${getItemTypeLabel(approval.itemType)} Review`}
                                </h3>
                                {getStatusBadge(approval.status)}
                              </div>
                              
                              <p className="text-gray-600 mb-4">
                                {approval.itemDescription || `Rejected ${getItemTypeLabel(approval.itemType).toLowerCase()}`}
                              </p>
                              
                              <div className="flex items-center space-x-6 text-sm text-gray-500">
                                <span>Rejected: {approval.reviewedAt ? new Date(approval.reviewedAt).toLocaleDateString() : 'Recently'}</span>
                                {approval.comments && (
                                  <span>Reason: {approval.comments}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="all" className="space-y-4">
                <div className="space-y-4">
                  {approvals?.map((approval) => (
                    <Card key={approval.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              {getItemTypeIcon(approval.itemType)}
                              <h3 className="text-lg font-semibold text-gray-900">
                                {approval.itemTitle || `${getItemTypeLabel(approval.itemType)} Review`}
                              </h3>
                              {getStatusBadge(approval.status)}
                            </div>
                            
                            <p className="text-gray-600 mb-4">
                              {approval.itemDescription || `${getItemTypeLabel(approval.itemType)} approval item`}
                            </p>
                            
                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                              <span>Created: {new Date(approval.createdAt).toLocaleDateString()}</span>
                              {approval.reviewedAt && (
                                <span>Reviewed: {new Date(approval.reviewedAt).toLocaleDateString()}</span>
                              )}
                              <Badge variant="outline">{getItemTypeLabel(approval.itemType)}</Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
