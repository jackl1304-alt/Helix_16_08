import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderSync, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface DataSource {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  lastSyncAt: string | null;
}

export function DataCollectionStatus() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  const { data: sources, isLoading } = useQuery<DataSource[]>({
    queryKey: ["/api/data-sources"],
  });

  const syncMutation = useMutation({
    mutationFn: async (sourceId: string) => {
      await apiRequest("POST", `/api/data-sources/${sourceId}/sync`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/data-sources"] });
      toast({
        title: "FolderSync Initiated",
        description: "Data source synchronization has been started.",
      });
    },
    onError: (error) => {
      toast({
        title: "FolderSync Failed",
        description: "Failed to initiate data source synchronization.",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (source: DataSource): string => {
    if (!source.isActive) return "bg-gray-500";
    if (!source.lastSyncAt) return "bg-yellow-500";
    
    const lastSync = new Date(source.lastSyncAt);
    const now = new Date();
    const hoursSinceSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceSync > 24) return "bg-red-500";
    if (hoursSinceSync > 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusText = (source: DataSource): string => {
    if (!source.isActive) return "Inactive";
    if (!source.lastSyncAt) return "Never synced";
    
    const lastSync = new Date(source.lastSyncAt);
    const now = new Date();
    const hoursSinceSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceSync > 24) return "Delayed";
    if (hoursSinceSync > 4) return "Delayed";
    return "Active";
  };

  const getLastSyncText = (source: DataSource): string => {
    if (!source.lastSyncAt) return "Never";
    
    const lastSync = new Date(source.lastSyncAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastSync.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Data Collection Status</h2>
            <Skeleton className="h-8 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
                <Skeleton className="w-3 h-3 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-32 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!sources || sources.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Data Collection Status</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setLocation("/global-sources")}
            >
              Configure Sources
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-3" />
            <p className="text-gray-500">No data sources configured</p>
            <p className="text-sm text-gray-400 mt-1">Add data sources to start collecting regulatory data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Data Collection Status</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setLocation("/global-sources")}
          >
            Manage Sources
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sources.map((source) => (
            <div key={source.id} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
              <div className="flex-shrink-0">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(source)}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{source.name}</p>
                <p className="text-xs text-gray-600">Last sync: {getLastSyncText(source)}</p>
                <div className="flex items-center justify-between mt-2">
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      getStatusText(source) === 'Active' ? 'text-green-600 border-green-200' :
                      getStatusText(source) === 'Inactive' ? 'text-gray-600 border-gray-200' :
                      'text-yellow-600 border-yellow-200'
                    }`}
                  >
                    {getStatusText(source)}
                  </Badge>
                  {source.isActive && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="p-1 h-6 w-6"
                      onClick={() => syncMutation.mutate(source.id)}
                      disabled={syncMutation.isPending}
                    >
                      <FolderSync className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
