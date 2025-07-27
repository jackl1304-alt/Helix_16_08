import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";

interface Approval {
  id: string;
  itemType: string;
  itemId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  // Virtual fields from join
  itemTitle?: string;
  itemDescription?: string;
}

export function ApprovalWorkflow() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { data: approvals, isLoading } = useQuery<Approval[]>({
    queryKey: ["/api/approvals", { status: "pending" }],
  });

  const updateApprovalMutation = useMutation({
    mutationFn: async ({ id, status, comments }: { id: string; status: string; comments?: string }) => {
      await apiRequest("PATCH", `/api/approvals/${id}`, { status, comments, reviewerId: "current-user" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/approvals"] });
      toast({
        title: "Approval Updated",
        description: "The approval status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update approval status.",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (approvalId: string) => {
    updateApprovalMutation.mutate({ id: approvalId, status: "approved" });
  };

  const handleReject = (approvalId: string) => {
    updateApprovalMutation.mutate({ id: approvalId, status: "rejected" });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                Loading...
              </Badge>
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </div>
          </div>
        </CardHeader>
        {isExpanded && (
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        )}
      </Card>
    );
  }

  if (!approvals || approvals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                0 pending
              </Badge>
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </div>
          </div>
        </CardHeader>
        {isExpanded && (
        <CardContent>
          <div className="text-center py-8">
            <Check className="mx-auto h-12 w-12 text-green-500 mb-3" />
            <p className="text-gray-500">No pending approvals</p>
            <p className="text-sm text-gray-400 mt-1">All items have been reviewed</p>
          </div>
        </CardContent>
        )}
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
              {approvals.length} pending
            </Badge>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
      <CardContent>
        <div className="space-y-4">
          {approvals.map((approval) => (
            <div key={approval.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {approval.itemTitle || `${approval.itemType.replace('_', ' ')} Item`}
                </p>
                <p className="text-xs text-gray-600">
                  {approval.itemDescription || `${approval.itemType} - ${approval.itemId}`}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Created: {new Date(approval.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleReject(approval.id)}
                  disabled={updateApprovalMutation.isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={() => handleApprove(approval.id)}
                  disabled={updateApprovalMutation.isPending}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <Button variant="ghost" size="sm">
            View All <ExternalLink className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
      )}
    </Card>
  );
}
