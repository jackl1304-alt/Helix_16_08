import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { 
  Zap,
  Database,
  Activity,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Globe,
  Shield,
  Microscope,
  Heart,
  BarChart3,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SyncResult {
  success: boolean;
  summary: any;
}

interface QualityMetrics {
  completeness: number;
  consistency: number;
  accuracy: number;
  freshness: number;
  overall: number;
}

export default function RealTimeIntegration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeOperation, setActiveOperation] = useState<string | null>(null);

  // Real-Time API Sync Mutations
  const fdaSyncMutation = useMutation({
    mutationFn: () => apiRequest('/api/realtime/sync-fda', 'POST'),
    onSuccess: (data: SyncResult) => {
      toast({
        title: "FDA Sync Complete",
        description: `Successfully synced ${data.summary?.totalRecords || 0} FDA records`,
      });
      setActiveOperation(null);
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "FDA Sync Failed",
        description: error.message,
        variant: "destructive",
      });
      setActiveOperation(null);
    }
  });

  const clinicalTrialsSyncMutation = useMutation({
    mutationFn: () => apiRequest('/api/realtime/sync-clinical-trials', 'POST'),
    onSuccess: (data: SyncResult) => {
      toast({
        title: "Clinical Trials Sync Complete",
        description: `Successfully synced ${data.summary?.totalRecords || 0} clinical trials`,
      });
      setActiveOperation(null);
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Clinical Trials Sync Failed",
        description: error.message,
        variant: "destructive",
      });
      setActiveOperation(null);
    }
  });

  const whoSyncMutation = useMutation({
    mutationFn: () => apiRequest('/api/realtime/sync-who', 'POST'),
    onSuccess: (data: SyncResult) => {
      toast({
        title: "WHO Sync Complete",
        description: `Successfully synced ${data.summary?.totalRecords || 0} health indicators`,
      });
      setActiveOperation(null);
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "WHO Sync Failed",
        description: error.message,
        variant: "destructive",
      });
      setActiveOperation(null);
    }
  });

  const comprehensiveSyncMutation = useMutation({
    mutationFn: () => apiRequest('/api/realtime/sync-all', 'POST'),
    onSuccess: (data: SyncResult) => {
      toast({
        title: "Comprehensive Sync Complete",
        description: `Successfully synced from ${data.summary?.successfulSources || 0} sources`,
      });
      setActiveOperation(null);
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Comprehensive Sync Failed",
        description: error.message,
        variant: "destructive",
      });
      setActiveOperation(null);
    }
  });

  // Data Quality Mutations
  const detectDuplicatesMutation = useMutation({
    mutationFn: () => apiRequest('/api/quality/detect-duplicates', 'POST', { keyFields: ['title', 'authority'] }),
    onSuccess: (data: any) => {
      toast({
        title: "Duplicate Detection Complete",
        description: `Found ${data.report?.duplicatesFound || 0} duplicates in ${data.report?.totalRecords || 0} records`,
      });
      setActiveOperation(null);
    },
    onError: (error: any) => {
      toast({
        title: "Duplicate Detection Failed",
        description: error.message,
        variant: "destructive",
      });
      setActiveOperation(null);
    }
  });

  const standardizeDataMutation = useMutation({
    mutationFn: () => apiRequest('/api/quality/standardize', 'POST'),
    onSuccess: (data: any) => {
      toast({
        title: "Data Standardization Complete",
        description: `Standardized ${(data.report?.countriesStandardized || 0) + (data.report?.datesFixed || 0)} items`,
      });
      setActiveOperation(null);
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Data Standardization Failed",
        description: error.message,
        variant: "destructive",
      });
      setActiveOperation(null);
    }
  });

  const qualityValidationMutation = useMutation({
    mutationFn: () => apiRequest('/api/quality/validate-all', 'POST'),
    onSuccess: (data: any) => {
      toast({
        title: "Quality Validation Complete",
        description: `Overall quality score: ${data.report?.qualityMetrics?.overall || 0}%`,
      });
      setActiveOperation(null);
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Quality Validation Failed",
        description: error.message,
        variant: "destructive",
      });
      setActiveOperation(null);
    }
  });

  // Master Sync Mutation
  const masterSyncMutation = useMutation({
    mutationFn: () => apiRequest('/api/master/sync-all', 'POST'),
    onSuccess: (data: any) => {
      toast({
        title: "Master Sync Complete",
        description: data.message,
      });
      setActiveOperation(null);
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Master Sync Failed",
        description: error.message,
        variant: "destructive",
      });
      setActiveOperation(null);
    }
  });

  // Quality Metrics Query
  const { data: qualityMetrics } = useQuery({
    queryKey: ['/api/quality/metrics'],
    refetchInterval: 300000 // Refresh every 5 minutes
  });

  // RSS Feed Status Query
  const { data: rssStatus } = useQuery({
    queryKey: ['/api/rss/feeds-status'],
    refetchInterval: 60000 // Refresh every minute
  });

  // RSS Monitoring Mutation
  const rssMonitorMutation = useMutation({
    mutationFn: () => apiRequest('/api/rss/monitor-all', 'POST'),
    onSuccess: (data: any) => {
      const newItems = data.results?.reduce((sum: number, r: any) => sum + r.newItems, 0) || 0;
      toast({
        title: "RSS Monitoring Complete",
        description: `Found ${newItems} new items from ${data.results?.filter((r: any) => r.success).length || 0} feeds`,
      });
      setActiveOperation(null);
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/rss/feeds-status'] });
    },
    onError: (error: any) => {
      toast({
        title: "RSS Monitoring Failed",
        description: error.message,
        variant: "destructive",
      });
      setActiveOperation(null);
    }
  });

  const handleOperation = (operationType: string, mutation: any) => {
    setActiveOperation(operationType);
    mutation.mutate();
  };

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getQualityBadgeVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 75) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Real-Time API Integration</h1>
        <p className="text-muted-foreground">
          Live data synchronization from FDA, Clinical Trials, WHO und erweiterte Datenqualitäts-Services
        </p>
      </div>

      {/* Master Control */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Master Data Synchronization
          </CardTitle>
          <CardDescription>
            Comprehensive sync: Real-Time APIs + Data Quality Enhancement + AI Analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => handleOperation('master-sync', masterSyncMutation)}
            disabled={!!activeOperation}
            className="w-full"
            size="lg"
          >
            {activeOperation === 'master-sync' ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Running Master Sync...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Execute Master Sync
              </>
            )}
          </Button>
          {masterSyncMutation.data && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800">Master Sync Results:</h4>
              <div className="text-sm text-blue-700 mt-2 space-y-1">
                {Object.entries(masterSyncMutation.data.masterReport || {}).map(([service, result]: [string, any]) => (
                  <div key={service} className="flex justify-between">
                    <span className="capitalize">{service.replace(/([A-Z])/g, ' $1').trim()}:</span>
                    <Badge variant={result.success ? 'default' : 'destructive'}>
                      {result.success ? 'Success' : 'Failed'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="real-time-apis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="real-time-apis">Real-Time APIs</TabsTrigger>
          <TabsTrigger value="data-quality">Data Quality</TabsTrigger>
          <TabsTrigger value="quality-metrics">Quality Metrics</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        {/* Real-Time APIs Tab */}
        <TabsContent value="real-time-apis" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  FDA OpenFDA
                </CardTitle>
                <CardDescription>
                  510(k), PMA, Device Recalls
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleOperation('fda-sync', fdaSyncMutation)}
                  disabled={!!activeOperation}
                  className="w-full"
                >
                  {activeOperation === 'fda-sync' ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Sync FDA Data
                    </>
                  )}
                </Button>
                {fdaSyncMutation.data && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Last sync: {fdaSyncMutation.data.summary?.totalRecords || 0} records
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Microscope className="h-5 w-5" />
                  Clinical Trials
                </CardTitle>
                <CardDescription>
                  ClinicalTrials.gov Medical Devices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleOperation('clinical-sync', clinicalTrialsSyncMutation)}
                  disabled={!!activeOperation}
                  className="w-full"
                >
                  {activeOperation === 'clinical-sync' ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Microscope className="mr-2 h-4 w-4" />
                      Sync Clinical Trials
                    </>
                  )}
                </Button>
                {clinicalTrialsSyncMutation.data && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Last sync: {clinicalTrialsSyncMutation.data.summary?.totalRecords || 0} trials
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  WHO Global Health
                </CardTitle>
                <CardDescription>
                  Global Health Observatory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleOperation('who-sync', whoSyncMutation)}
                  disabled={!!activeOperation}
                  className="w-full"
                >
                  {activeOperation === 'who-sync' ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Globe className="mr-2 h-4 w-4" />
                      Sync WHO Data
                    </>
                  )}
                </Button>
                {whoSyncMutation.data && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Last sync: {whoSyncMutation.data.summary?.totalRecords || 0} indicators
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  RSS Monitoring
                </CardTitle>
                <CardDescription>
                  Enhanced RSS Feed Monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleOperation('rss-monitoring', rssMonitorMutation)}
                  disabled={!!activeOperation}
                  className="w-full"
                >
                  {activeOperation === 'rss-monitoring' ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Monitoring...
                    </>
                  ) : (
                    <>
                      <Activity className="mr-2 h-4 w-4" />
                      Monitor RSS Feeds
                    </>
                  )}
                </Button>
                {rssMonitorMutation.data && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Feeds: {rssMonitorMutation.data.results?.filter((r: any) => r.success).length || 0}/{rssMonitorMutation.data.results?.length || 0}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Comprehensive Sync
                </CardTitle>
                <CardDescription>
                  All Real-Time Sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleOperation('comprehensive-sync', comprehensiveSyncMutation)}
                  disabled={!!activeOperation}
                  className="w-full"
                >
                  {activeOperation === 'comprehensive-sync' ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Syncing All...
                    </>
                  ) : (
                    <>
                      <Activity className="mr-2 h-4 w-4" />
                      Sync All Sources
                    </>
                  )}
                </Button>
                {comprehensiveSyncMutation.data && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Sources: {comprehensiveSyncMutation.data.summary?.successfulSources || 0}/{comprehensiveSyncMutation.data.summary?.totalSources || 0}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RSS Feed Status Display */}
          {rssStatus?.feeds && (
            <Card>
              <CardHeader>
                <CardTitle>RSS Feed Status</CardTitle>
                <CardDescription>Real-time monitoring of regulatory RSS feeds</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rssStatus.feeds.map((feed: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{feed.name}</div>
                        <div className="text-xs text-muted-foreground">{feed.authority} - {feed.region}</div>
                      </div>
                      <Badge variant={feed.status === 'active' ? 'default' : 'destructive'}>
                        {feed.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sync Results Display */}
          {(fdaSyncMutation.data || clinicalTrialsSyncMutation.data || whoSyncMutation.data || rssMonitorMutation.data || comprehensiveSyncMutation.data) && (
            <Card>
              <CardHeader>
                <CardTitle>Latest Sync Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {fdaSyncMutation.data && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {fdaSyncMutation.data.summary?.totalRecords || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">FDA Records</div>
                    </div>
                  )}
                  {clinicalTrialsSyncMutation.data && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {clinicalTrialsSyncMutation.data.summary?.totalRecords || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Clinical Trials</div>
                    </div>
                  )}
                  {whoSyncMutation.data && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {whoSyncMutation.data.summary?.totalRecords || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">WHO Indicators</div>
                    </div>
                  )}
                  {rssMonitorMutation.data && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {rssMonitorMutation.data.results?.reduce((sum: number, r: any) => sum + r.newItems, 0) || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">RSS New Items</div>
                    </div>
                  )}
                  {comprehensiveSyncMutation.data && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">
                        {comprehensiveSyncMutation.data.summary?.successfulSources || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Sources</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Data Quality Tab */}
        <TabsContent value="data-quality" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Duplicate Detection
                </CardTitle>
                <CardDescription>
                  Find and identify duplicate records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleOperation('detect-duplicates', detectDuplicatesMutation)}
                  disabled={!!activeOperation}
                  className="w-full"
                >
                  {activeOperation === 'detect-duplicates' ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Detecting...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Detect Duplicates
                    </>
                  )}
                </Button>
                {detectDuplicatesMutation.data && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Found {detectDuplicatesMutation.data.report?.duplicatesFound || 0} duplicates
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Data Standardization
                </CardTitle>
                <CardDescription>
                  Standardize formats and codes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleOperation('standardize-data', standardizeDataMutation)}
                  disabled={!!activeOperation}
                  className="w-full"
                >
                  {activeOperation === 'standardize-data' ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Standardizing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Standardize Data
                    </>
                  )}
                </Button>
                {standardizeDataMutation.data && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Standardized {(standardizeDataMutation.data.report?.countriesStandardized || 0) + 
                    (standardizeDataMutation.data.report?.datesFixed || 0)} items
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Quality Validation
                </CardTitle>
                <CardDescription>
                  Comprehensive quality assessment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleOperation('quality-validation', qualityValidationMutation)}
                  disabled={!!activeOperation}
                  className="w-full"
                >
                  {activeOperation === 'quality-validation' ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Validate Quality
                    </>
                  )}
                </Button>
                {qualityValidationMutation.data && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Quality Score: {qualityValidationMutation.data.report?.qualityMetrics?.overall || 0}%
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Quality Metrics Tab */}
        <TabsContent value="quality-metrics" className="space-y-6">
          {qualityMetrics?.metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Completeness
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold">
                        {qualityMetrics.metrics.completeness}%
                      </span>
                      <Badge variant={getQualityBadgeVariant(qualityMetrics.metrics.completeness)}>
                        {qualityMetrics.metrics.completeness >= 90 ? 'Excellent' :
                         qualityMetrics.metrics.completeness >= 75 ? 'Good' :
                         qualityMetrics.metrics.completeness >= 60 ? 'Fair' : 'Poor'}
                      </Badge>
                    </div>
                    <Progress value={qualityMetrics.metrics.completeness} className="w-full" />
                    <p className="text-sm text-muted-foreground">
                      Percentage of records with all required fields
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Consistency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold">
                        {qualityMetrics.metrics.consistency}%
                      </span>
                      <Badge variant={getQualityBadgeVariant(qualityMetrics.metrics.consistency)}>
                        {qualityMetrics.metrics.consistency >= 90 ? 'Excellent' :
                         qualityMetrics.metrics.consistency >= 75 ? 'Good' :
                         qualityMetrics.metrics.consistency >= 60 ? 'Fair' : 'Poor'}
                      </Badge>
                    </div>
                    <Progress value={qualityMetrics.metrics.consistency} className="w-full" />
                    <p className="text-sm text-muted-foreground">
                      Data format standardization level
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Accuracy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold">
                        {qualityMetrics.metrics.accuracy}%
                      </span>
                      <Badge variant={getQualityBadgeVariant(qualityMetrics.metrics.accuracy)}>
                        {qualityMetrics.metrics.accuracy >= 90 ? 'Excellent' :
                         qualityMetrics.metrics.accuracy >= 75 ? 'Good' :
                         qualityMetrics.metrics.accuracy >= 60 ? 'Fair' : 'Poor'}
                      </Badge>
                    </div>
                    <Progress value={qualityMetrics.metrics.accuracy} className="w-full" />
                    <p className="text-sm text-muted-foreground">
                      Data validation and integrity score
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Freshness
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold">
                        {qualityMetrics.metrics.freshness}%
                      </span>
                      <Badge variant={getQualityBadgeVariant(qualityMetrics.metrics.freshness)}>
                        {qualityMetrics.metrics.freshness >= 90 ? 'Excellent' :
                         qualityMetrics.metrics.freshness >= 75 ? 'Good' :
                         qualityMetrics.metrics.freshness >= 60 ? 'Fair' : 'Poor'}
                      </Badge>
                    </div>
                    <Progress value={qualityMetrics.metrics.freshness} className="w-full" />
                    <p className="text-sm text-muted-foreground">
                      Percentage of recent data (last 2 years)
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Overall Quality Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className={`text-4xl font-bold ${getQualityColor(qualityMetrics.metrics.overall)}`}>
                        {qualityMetrics.metrics.overall}%
                      </span>
                      <Badge 
                        variant={getQualityBadgeVariant(qualityMetrics.metrics.overall)}
                        className="text-lg px-4 py-2"
                      >
                        {qualityMetrics.metrics.overall >= 90 ? 'Excellent' :
                         qualityMetrics.metrics.overall >= 75 ? 'Good' :
                         qualityMetrics.metrics.overall >= 60 ? 'Fair' : 'Needs Improvement'}
                      </Badge>
                    </div>
                    <Progress value={qualityMetrics.metrics.overall} className="w-full h-3" />
                    <p className="text-sm text-muted-foreground">
                      Weighted average of all quality dimensions
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Real-Time Data Sources</CardTitle>
                <CardDescription>
                  Connected APIs and data synchronization status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">FDA OpenFDA API</span>
                    </div>
                    <Badge variant="outline">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Microscope className="h-4 w-4 text-green-600" />
                      <span className="font-medium">ClinicalTrials.gov</span>
                    </div>
                    <Badge variant="outline">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">WHO Global Health Observatory</span>
                    </div>
                    <Badge variant="outline">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-orange-600" />
                      <span className="font-medium">Enhanced RSS Monitoring</span>
                    </div>
                    <Badge variant="outline">6 Feeds Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Quality Services</CardTitle>
                <CardDescription>
                  Automated quality enhancement and monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Duplicate Detection</span>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Data Standardization</span>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Quality Monitoring</span>
                    <Badge variant="outline">Real-time</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Validation Rules</span>
                    <Badge variant="outline">Automated</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Implementation Status</CardTitle>
              <CardDescription>
                Real-time API integration and data quality enhancement implementation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Implemented APIs</h4>
                  <ul className="space-y-2 text-sm">
                    <li>✅ FDA OpenFDA Device APIs (510k, PMA, Recalls)</li>
                    <li>✅ ClinicalTrials.gov Medical Device Studies</li>
                    <li>✅ WHO Global Health Observatory Indicators</li>
                    <li>✅ Enhanced RSS Feed Monitoring (6 Feeds)</li>
                    <li>✅ Real-time Data Synchronization</li>
                    <li>✅ Comprehensive Quality Enhancement</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Quality Features</h4>
                  <ul className="space-y-2 text-sm">
                    <li>✅ Automated Duplicate Detection</li>
                    <li>✅ Data Format Standardization</li>
                    <li>✅ Country Code Normalization</li>
                    <li>✅ Date Format Validation</li>
                    <li>✅ Real-time Quality Metrics</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}