import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderSync, Plus, Trash2, Edit, AlertCircle, Menu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface DataSource {
  id: string;
  name: string;
  type: string;
  endpoint?: string;
  isActive: boolean;
  lastSyncAt: string | null;
  configData?: any;
  createdAt: string;
}

export default function DataCollection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSource, setSelectedSource] = useState<DataSource | null>(null);

  const { data: sources, isLoading } = useQuery<DataSource[]>({
    queryKey: ["/api/data-sources"],
  });

  const syncMutation = useMutation({
    mutationFn: async (sourceId: string) => {
      return await apiRequest(`/api/data-sources/${sourceId}/sync`, "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/data-sources"] });
      toast({
        title: "Sync Started",
        description: "Data source synchronization has been initiated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Sync Failed", 
        description: "Failed to start data source synchronization.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (source: DataSource) => {
    if (!source.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (!source.lastSyncAt) {
      return <Badge variant="outline">Never Synced</Badge>;
    }
    const lastSync = new Date(source.lastSyncAt);
    const now = new Date();
    const hoursSinceSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceSync < 1) {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    } else if (hoursSinceSync < 24) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Recent</Badge>;
    } else {
      return <Badge variant="destructive">Stale</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
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
    <div className="min-h-screen bg-gray-50">
      {/* Header with menu button */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Data Collection</h1>
              <p className="text-gray-600">Monitor and manage global regulatory data sources</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Tabs defaultValue="sources" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="sources">Data Sources</TabsTrigger>
              <TabsTrigger value="sync-history">Sync History</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Source
            </Button>
          </div>

          <TabsContent value="sources">
            <div className="grid gap-4">
              {sources && sources.length > 0 ? (
                sources.map((source) => (
                  <Card key={source.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{source.name}</h3>
                          <div className="flex items-center space-x-4 mt-2">
                            {getStatusBadge(source)}
                            <span className="text-sm text-gray-500">
                              Type: {source.type}
                            </span>
                            {source.lastSyncAt && (
                              <span className="text-sm text-gray-500">
                                Last sync: {new Date(source.lastSyncAt).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => syncMutation.mutate(source.id)}
                            disabled={syncMutation.isPending}
                          >
                            <FolderSync className="h-4 w-4 mr-2" />
                            Sync Now
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">
                        {source.endpoint || 'No endpoint configured'}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Data Sources</h3>
                    <p className="text-gray-500 mb-4">Add your first data source to start collecting regulatory data.</p>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Data Source
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sync-history">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Synchronization History</h3>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <FolderSync className="mx-auto h-8 w-8 mb-2" />
                  <p>Sync history will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Data Collection Settings</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sync Frequency
                    </label>
                    <Select defaultValue="hourly">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Every Hour</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Retry Failed Syncs
                    </label>
                    <Select defaultValue="3">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 time</SelectItem>
                        <SelectItem value="3">3 times</SelectItem>
                        <SelectItem value="5">5 times</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button>Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}