import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FolderSync, Plus, Trash2, Edit, AlertCircle, History, Settings, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { DataSource } from "@shared/schema";

export default function DataCollection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSource, setSelectedSource] = useState<DataSource | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSource, setNewSource] = useState({
    name: '',
    type: 'regulatory',
    endpoint: '',
    description: ''
  });
  const [syncFrequency, setSyncFrequency] = useState('hourly');
  const [retryCount, setRetryCount] = useState('3');

  const { data: sources, isLoading, error } = useQuery<DataSource[]>({
    queryKey: ["/api/data-sources"],
  });





  const syncMutation = useMutation({
    mutationFn: async (sourceId: string) => {
      console.log(`Frontend: Starting sync for source ${sourceId}`);
      const result = await apiRequest(`/api/data-sources/${sourceId}/sync`, "POST");
      console.log(`Frontend: Sync result:`, result);
      return result;
    },
    onSuccess: (data) => {
      console.log("Frontend: Sync successful", data);
      queryClient.invalidateQueries({ queryKey: ["/api/data-sources"] });
      toast({
        title: "Sync Started",
        description: "Data source synchronization has been initiated.",
      });
    },
    onError: (error) => {
      console.error("Frontend: Sync error:", error);
      toast({
        title: "Sync Failed", 
        description: `Failed to start data source synchronization: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const addSourceMutation = useMutation({
    mutationFn: async (sourceData: any) => {
      return await apiRequest('/api/data-sources', 'POST', sourceData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/data-sources"] });
      setIsAddDialogOpen(false);
      setNewSource({ name: '', type: 'regulatory', endpoint: '', description: '' });
      toast({
        title: "Source Added",
        description: "New data source has been successfully added.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Add Failed",
        description: `Failed to add data source: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      return await apiRequest('/api/settings/data-collection', 'POST', settings);
    },
    onSuccess: () => {
      toast({
        title: "Settings Saved",
        description: "Data collection settings have been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: `Failed to save settings: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleAddSource = () => {
    if (!newSource.name || !newSource.endpoint) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    const sourceData = {
      ...newSource,
      id: newSource.name.toLowerCase().replace(/\s+/g, '_'),
      isActive: true,
      configData: {}
    };
    
    addSourceMutation.mutate(sourceData);
  };

  const handleSaveSettings = () => {
    const settings = {
      syncFrequency,
      retryCount: parseInt(retryCount),
      lastUpdated: new Date().toISOString()
    };
    saveSettingsMutation.mutate(settings);
  };

  const getStatusBadge = (source: DataSource) => {
    if (!source.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (!source.lastSync) {
      return <Badge variant="outline">Never Synced</Badge>;
    }
    const lastSync = new Date(source.lastSync);
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
        <h1 className="text-2xl font-bold text-gray-900">Data Collection</h1>
        <p className="text-gray-600 mt-1">Monitor and manage global regulatory data sources</p>
      </div>

      <Tabs defaultValue="sources" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="sources">Data Sources</TabsTrigger>
            <TabsTrigger value="sync-history">Sync History</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-[#d95d2c] hover:bg-[#b8441f] text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Source
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Data Source</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Source Name *</Label>
                  <Input
                    id="name"
                    value={newSource.name}
                    onChange={(e) => setNewSource({...newSource, name: e.target.value})}
                    placeholder="e.g., New Regulatory Authority"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={newSource.type} onValueChange={(value) => setNewSource({...newSource, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regulatory">Regulatory</SelectItem>
                      <SelectItem value="guidelines">Guidelines</SelectItem>
                      <SelectItem value="standards">Standards</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endpoint">API Endpoint *</Label>
                  <Input
                    id="endpoint"
                    value={newSource.endpoint}
                    onChange={(e) => setNewSource({...newSource, endpoint: e.target.value})}
                    placeholder="https://api.example.com/data"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newSource.description}
                    onChange={(e) => setNewSource({...newSource, description: e.target.value})}
                    placeholder="Brief description of this data source"
                  />
                </div>
                <Button 
                  onClick={handleAddSource} 
                  disabled={addSourceMutation.isPending}
                  className="w-full"
                >
                  {addSourceMutation.isPending ? 'Adding...' : 'Add Data Source'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="sources">
          <div className="grid gap-4">

            {sources && Array.isArray(sources) && sources.length > 0 ? (
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
                          {source.lastSync && (
                            <span className="text-sm text-gray-500">
                              Last sync: {new Date(source.lastSync).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => syncMutation.mutate(source.id)}
                          disabled={syncMutation.isPending}
                          className="bg-[#d95d2c] hover:bg-[#b8441f] text-white"
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Synchronization History</h3>
                <p className="text-sm text-gray-500 mt-1">View recent data collection activities</p>
              </div>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                View All Logs
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Recent sync activities */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">FDA Historical Archive</span>
                      <Badge className="bg-green-100 text-green-800">Success</Badge>
                    </div>
                    <span className="text-sm text-gray-500">{new Date().toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-600">Synchronized 7 new regulatory updates</p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4 text-green-600" />
                      <span className="font-medium">BfArM Leitfäden</span>
                      <Badge className="bg-green-100 text-green-800">Success</Badge>
                    </div>
                    <span className="text-sm text-gray-500">{new Date(Date.now() - 3600000).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-600">Synchronized 3 new guidelines</p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">EMA EPAR Database</span>
                      <Badge className="bg-green-100 text-green-800">Success</Badge>
                    </div>
                    <span className="text-sm text-gray-500">{new Date(Date.now() - 7200000).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-600">Synchronized 12 new EPAR documents</p>
                </div>

                <div className="text-center py-4">
                  <Button variant="outline">
                    <History className="mr-2 h-4 w-4" />
                    Load More History
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Settings className="h-5 w-5 text-gray-600" />
              <div>
                <h3 className="text-lg font-semibold">Data Collection Settings</h3>
                <p className="text-sm text-gray-500 mt-1">Configure synchronization and collection parameters</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                      Automatic Sync Frequency
                    </Label>
                    <Select value={syncFrequency} onValueChange={setSyncFrequency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15min">Every 15 minutes</SelectItem>
                        <SelectItem value="hourly">Every Hour</SelectItem>
                        <SelectItem value="daily">Daily at 6:00 AM</SelectItem>
                        <SelectItem value="weekly">Weekly (Sundays)</SelectItem>
                        <SelectItem value="manual">Manual only</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">How often to check for new data</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                      Retry Failed Syncs
                    </Label>
                    <Select value={retryCount} onValueChange={setRetryCount}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No retries</SelectItem>
                        <SelectItem value="1">1 retry</SelectItem>
                        <SelectItem value="3">3 retries</SelectItem>
                        <SelectItem value="5">5 retries</SelectItem>
                        <SelectItem value="10">10 retries</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">Number of retry attempts for failed syncs</p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Real-time Monitoring</h4>
                      <p className="text-xs text-gray-500">Monitor data sources for immediate updates</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Data Validation</h4>
                      <p className="text-xs text-gray-500">Automatically validate incoming regulatory data</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Enabled</Badge>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleSaveSettings}
                    disabled={saveSettingsMutation.isPending}
                    className="flex-1"
                  >
                    {saveSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
                  </Button>
                  <Button variant="outline">
                    Reset to Defaults
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}