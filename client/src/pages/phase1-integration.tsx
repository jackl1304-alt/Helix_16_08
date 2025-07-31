import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { 
  Activity, 
  Database, 
  Rss, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Download,
  RefreshCw,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QualityReport {
  metrics: {
    totalUpdates: number;
    validUpdates: number;
    averageQualityScore: number;
    duplicateCount: number;
    totalErrors: number;
    totalWarnings: number;
  };
  recommendations: string[];
}

interface RSSFeedStatus {
  id: string;
  name: string;
  authority: string;
  region: string;
  active: boolean;
  lastCheck: string;
  checkFrequency: number;
  status: string;
}

export default function Phase1Integration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeSync, setActiveSync] = useState<string | null>(null);

  // Phase 1 Status Query
  const { data: phase1Status, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/phase1/status'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // RSS Feeds Status Query
  const { data: rssStatus, isLoading: rssLoading } = useQuery({
    queryKey: ['/api/rss/feeds-status'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // FDA Sync Mutations
  const fda510kMutation = useMutation({
    mutationFn: () => apiRequest('/api/fda/sync-510k', 'POST'),
    onSuccess: () => {
      toast({
        title: "FDA 510(k) Sync",
        description: "Successfully synced FDA 510(k) clearances",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      setActiveSync(null);
    },
    onError: (error: any) => {
      toast({
        title: "FDA 510(k) Sync Failed",
        description: error.message,
        variant: "destructive",
      });
      setActiveSync(null);
    }
  });

  const fdaRecallsMutation = useMutation({
    mutationFn: () => apiRequest('/api/fda/sync-recalls', 'POST'),
    onSuccess: () => {
      toast({
        title: "FDA Recalls Sync",
        description: "Successfully synced FDA device recalls",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      setActiveSync(null);
    },
    onError: (error: any) => {
      toast({
        title: "FDA Recalls Sync Failed",
        description: error.message,
        variant: "destructive",
      });
      setActiveSync(null);
    }
  });

  const fdaCompleteMutation = useMutation({
    mutationFn: () => apiRequest('/api/fda/sync-all', 'POST'),
    onSuccess: () => {
      toast({
        title: "Complete FDA Sync",
        description: "Successfully synced all FDA data sources",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      setActiveSync(null);
    },
    onError: (error: any) => {
      toast({
        title: "Complete FDA Sync Failed",
        description: error.message,
        variant: "destructive",
      });
      setActiveSync(null);
    }
  });

  // RSS Monitoring Mutations
  const rssMonitorMutation = useMutation({
    mutationFn: () => apiRequest('/api/rss/monitor-feeds', 'POST'),
    onSuccess: () => {
      toast({
        title: "RSS Monitoring",
        description: "Successfully completed RSS monitoring cycle",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/rss/feeds-status'] });
      setActiveSync(null);
    },
    onError: (error: any) => {
      toast({
        title: "RSS Monitoring Failed",
        description: error.message,
        variant: "destructive",
      });
      setActiveSync(null);
    }
  });

  const rssStartMutation = useMutation({
    mutationFn: () => apiRequest('/api/rss/start-monitoring', 'POST'),
    onSuccess: () => {
      toast({
        title: "Continuous RSS Monitoring",
        description: "Started continuous RSS monitoring service",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/rss/feeds-status'] });
    },
    onError: (error: any) => {
      toast({
        title: "RSS Start Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Data Quality Mutations
  const qualityAnalysisMutation = useMutation({
    mutationFn: () => apiRequest('/api/quality/analyze', 'POST'),
    onSuccess: (data: QualityReport) => {
      toast({
        title: "Data Quality Analysis",
        description: `Analyzed ${data.metrics.totalUpdates} updates with average score ${data.metrics.averageQualityScore.toFixed(1)}`,
      });
      setActiveSync(null);
    },
    onError: (error: any) => {
      toast({
        title: "Quality Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
      setActiveSync(null);
    }
  });

  const duplicatesMutation = useMutation({
    mutationFn: (threshold: number) => apiRequest('/api/quality/find-duplicates', 'POST', { threshold }),
    onSuccess: (data: any) => {
      toast({
        title: "Duplicate Detection",
        description: `Found ${data.total} potential duplicates from ${data.analyzed} updates`,
      });
      setActiveSync(null);
    },
    onError: (error: any) => {
      toast({
        title: "Duplicate Detection Failed",
        description: error.message,
        variant: "destructive",
      });
      setActiveSync(null);
    }
  });

  // Combined Phase 1 Sync
  const phase1SyncMutation = useMutation({
    mutationFn: () => apiRequest('/api/phase1/sync-all', 'POST'),
    onSuccess: (data: any) => {
      toast({
        title: "Phase 1 Complete Sync",
        description: `Successfully completed comprehensive sync. Quality score: ${data.qualityReport.averageScore}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      setActiveSync(null);
    },
    onError: (error: any) => {
      toast({
        title: "Phase 1 Sync Failed",
        description: error.message,
        variant: "destructive",
      });
      setActiveSync(null);
    }
  });

  const handleSync = (syncType: string, mutation: any) => {
    setActiveSync(syncType);
    mutation.mutate();
  };

  const getRSSStatusColor = (status: string) => {
    switch (status) {
      case 'monitoring': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Phase 1 Integration Dashboard</h1>
        <p className="text-muted-foreground">
          Manage FDA OpenAPI, RSS Monitoring, and Data Quality Services
        </p>
      </div>

      {/* Quick Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Execute comprehensive Phase 1 synchronization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => handleSync('phase1-complete', phase1SyncMutation)}
            disabled={!!activeSync}
            className="w-full"
          >
            {activeSync === 'phase1-complete' ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Running Complete Phase 1 Sync...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Execute Complete Phase 1 Sync
              </>
            )}
          </Button>
          {phase1SyncMutation.data && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800">Last Sync Results:</h4>
              <ul className="text-sm text-green-700 mt-2">
                <li>Total Updates: {phase1SyncMutation.data.qualityReport.totalUpdates}</li>
                <li>Average Quality Score: {phase1SyncMutation.data.qualityReport.averageScore}</li>
                <li>Duplicates Found: {phase1SyncMutation.data.qualityReport.duplicates}</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="fda" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="fda">FDA OpenAPI</TabsTrigger>
          <TabsTrigger value="rss">RSS Monitoring</TabsTrigger>
          <TabsTrigger value="quality">Data Quality</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        {/* FDA OpenAPI Tab */}
        <TabsContent value="fda" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  FDA 510(k) Devices
                </CardTitle>
                <CardDescription>
                  Sync latest 510(k) clearances from FDA OpenAPI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleSync('fda-510k', fda510kMutation)}
                  disabled={!!activeSync}
                  className="w-full"
                >
                  {activeSync === 'fda-510k' ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Sync 510(k) Data
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  FDA Device Recalls
                </CardTitle>
                <CardDescription>
                  Sync latest device recalls from FDA OpenAPI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleSync('fda-recalls', fdaRecallsMutation)}
                  disabled={!!activeSync}
                  className="w-full"
                >
                  {activeSync === 'fda-recalls' ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Sync Recalls Data
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Complete FDA Sync
                </CardTitle>
                <CardDescription>
                  Comprehensive sync of all FDA data sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleSync('fda-complete', fdaCompleteMutation)}
                  disabled={!!activeSync}
                  className="w-full"
                >
                  {activeSync === 'fda-complete' ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Complete FDA Sync
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* RSS Monitoring Tab */}
        <TabsContent value="rss" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rss className="h-5 w-5" />
                  Monitor RSS Feeds
                </CardTitle>
                <CardDescription>
                  Run monitoring cycle for all active RSS feeds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleSync('rss-monitor', rssMonitorMutation)}
                  disabled={!!activeSync}
                  className="w-full"
                >
                  {activeSync === 'rss-monitor' ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Monitoring...
                    </>
                  ) : (
                    <>
                      <Rss className="mr-2 h-4 w-4" />
                      Run RSS Monitoring
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Start Continuous Monitoring
                </CardTitle>
                <CardDescription>
                  Enable automatic RSS monitoring service
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => rssStartMutation.mutate()}
                  disabled={rssStartMutation.isPending}
                  className="w-full"
                >
                  {rssStartMutation.isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Clock className="mr-2 h-4 w-4" />
                      Start Continuous Monitoring
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* RSS Feeds Status */}
          <Card>
            <CardHeader>
              <CardTitle>RSS Feeds Status</CardTitle>
              <CardDescription>
                Current status of all configured RSS feeds
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rssLoading ? (
                <div className="text-center py-4">Loading RSS status...</div>
              ) : rssStatus && rssStatus.length > 0 ? (
                <div className="space-y-3">
                  {rssStatus.map((feed: RSSFeedStatus) => (
                    <div key={feed.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getRSSStatusColor(feed.status)}`}></div>
                        <div>
                          <h4 className="font-semibold">{feed.name}</h4>
                          <p className="text-sm text-muted-foreground">{feed.authority} - {feed.region}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={feed.active ? 'default' : 'secondary'}>
                          {feed.active ? 'Active' : 'Inactive'}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Check every {feed.checkFrequency}min
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No RSS feeds configured
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Quality Tab */}
        <TabsContent value="quality" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Quality Analysis
                </CardTitle>
                <CardDescription>
                  Comprehensive data quality assessment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleSync('quality-analysis', qualityAnalysisMutation)}
                  disabled={!!activeSync}
                  className="w-full"
                >
                  {activeSync === 'quality-analysis' ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Run Quality Analysis
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Find Duplicates
                </CardTitle>
                <CardDescription>
                  Detect potential duplicate entries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleSync('duplicates', () => duplicatesMutation.mutate(0.85))}
                  disabled={!!activeSync}
                  className="w-full"
                >
                  {activeSync === 'duplicates' ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Detecting...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Find Duplicates (85%)
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Data Standardization
                </CardTitle>
                <CardDescription>
                  Clean and standardize data formats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => {
                    setActiveSync('clean-batch');
                    apiRequest('/api/quality/clean-batch', { method: 'POST' })
                      .then(() => {
                        toast({
                          title: "Data Cleaning",
                          description: "Successfully cleaned data batch",
                        });
                        setActiveSync(null);
                      })
                      .catch((error: any) => {
                        toast({
                          title: "Data Cleaning Failed",
                          description: error.message,
                          variant: "destructive",
                        });
                        setActiveSync(null);
                      });
                  }}
                  disabled={!!activeSync}
                  className="w-full"
                >
                  {activeSync === 'clean-batch' ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Cleaning...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Clean Data Batch
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quality Results */}
          {qualityAnalysisMutation.data && (
            <Card>
              <CardHeader>
                <CardTitle>Quality Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{qualityAnalysisMutation.data.metrics.totalUpdates}</div>
                    <div className="text-sm text-muted-foreground">Total Updates</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{qualityAnalysisMutation.data.metrics.validUpdates}</div>
                    <div className="text-sm text-muted-foreground">Valid Updates</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{qualityAnalysisMutation.data.metrics.averageQualityScore.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">Avg Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{qualityAnalysisMutation.data.metrics.duplicateCount}</div>
                    <div className="text-sm text-muted-foreground">Duplicates</div>
                  </div>
                </div>
                
                <Progress value={qualityAnalysisMutation.data.metrics.averageQualityScore} className="mb-4" />
                
                {qualityAnalysisMutation.data.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Recommendations:</h4>
                    <ul className="space-y-1">
                      {qualityAnalysisMutation.data.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-muted-foreground">• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  FDA OpenAPI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>510(k) Clearances</span>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Device Recalls</span>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Rate Limit</span>
                    <span className="text-sm text-muted-foreground">1/sec</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rss className="h-5 w-5" />
                  RSS Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Active Feeds</span>
                    <Badge variant="outline">{rssStatus?.filter((f: any) => f.active).length || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Authorities</span>
                    <span className="text-sm text-muted-foreground">6</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Check Frequency</span>
                    <span className="text-sm text-muted-foreground">30min</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Data Quality
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Quality Threshold</span>
                    <Badge variant="outline">70%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Duplicate Detection</span>
                    <span className="text-sm text-muted-foreground">85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Auto Cleaning</span>
                    <Badge variant="outline">Enabled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}