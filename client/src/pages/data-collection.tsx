import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderSync, Plus, Trash2, Edit, AlertCircle } from "lucide-react";
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
        title: "FolderSync Started",
        description: "Data source synchronization has been initiated.",
      });
    },
    onError: (error) => {
      toast({
        title: "FolderSync Failed", 
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

    if (hoursSinceSync > 24) {
      return <Badge variant="destructive">Delayed</Badge>;
    } else if (hoursSinceSync > 4) {
      return <Badge variant="outline" className="border-yellow-300 text-yellow-700">Warning</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
    }
  };

  const getLastSyncText = (source: DataSource): string => {
    if (!source.lastSyncAt) return "Never synced";
    
    const lastSync = new Date(source.lastSyncAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastSync.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="grid gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
              <h1 className="text-2xl font-bold text-gray-900">Data Collection Management</h1>
              <p className="text-gray-600 mt-1">Configure and monitor regulatory data sources</p>
            </div>

            <Tabs defaultValue="sources" className="space-y-6">
              <TabsList>
                <TabsTrigger value="sources">Data Sources</TabsTrigger>
                <TabsTrigger value="configuration">Configuration</TabsTrigger>
                <TabsTrigger value="logs">FolderSync Logs</TabsTrigger>
              </TabsList>

              <TabsContent value="sources" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Active Data Sources</h2>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Source
                  </Button>
                </div>

                {!sources || sources.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Sources</h3>
                      <p className="text-gray-600 mb-6">No data sources have been configured yet.</p>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Source
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6">
                    {sources.map((source) => (
                      <Card key={source.id}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-medium text-gray-900">{source.name}</h3>
                                {getStatusBadge(source)}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                Type: {source.type.toUpperCase()} • Last sync: {getLastSyncText(source)}
                              </p>
                              {source.endpoint && (
                                <p className="text-xs text-gray-500">Endpoint: {source.endpoint}</p>
                              )}
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedSource(source)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => syncMutation.mutate(source.id)}
                                disabled={syncMutation.isPending || !source.isActive}
                              >
                                <FolderSync className={`h-4 w-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="configuration" className="space-y-6">
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Global Configuration</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">FolderSync Frequency</label>
                        <Select defaultValue="daily">
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
                        <label className="text-sm font-medium text-gray-700">Retry Attempts</label>
                        <Input type="number" defaultValue="3" min="1" max="10" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Data Retention (days)</label>
                      <Input type="number" defaultValue="365" min="30" max="3650" />
                    </div>
                    
                    <Button>Save Configuration</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="logs" className="space-y-6">
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Recent FolderSync Activity</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                      <p>FolderSync logs will appear here once data collection begins</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
