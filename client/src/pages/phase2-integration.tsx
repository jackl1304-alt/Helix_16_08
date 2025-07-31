import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { 
  Database,
  Network,
  Globe,
  MapPin,
  Clock,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Building,
  FileSearch,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RegionalAuthority {
  id: string;
  name: string;
  country: string;
  region: string;
  active: boolean;
  priority: string;
  dataTypes: string[];
  hasAPI: boolean;
  rssFeeds: number;
}

interface CrossRefResult {
  deviceMappings: any[];
  standardMappings: any[];
  clinicalMappings: any[];
  totalMappings: number;
}

export default function Phase2Integration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeSync, setActiveSync] = useState<string | null>(null);

  // Phase 2 Status Query
  const { data: phase2Status, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/phase2/status'],
    refetchInterval: 60000 // Refresh every minute
  });

  // Regional Authorities Status Query
  const { data: regionalStatus, isLoading: regionalLoading } = useQuery({
    queryKey: ['/api/regional/authorities-status'],
    refetchInterval: 60000 // Refresh every minute
  });

  // EUDAMED Sync Mutations
  const eudamedDevicesMutation = useMutation({
    mutationFn: () => apiRequest('/api/eudamed/sync-devices', 'POST'),
    onSuccess: () => {
      toast({
        title: "EUDAMED Device Sync",
        description: "Successfully synced EUDAMED device registrations",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      setActiveSync(null);
    },
    onError: (error: any) => {
      toast({
        title: "EUDAMED Device Sync Failed",
        description: error.message,
        variant: "destructive",
      });
      setActiveSync(null);
    }
  });

  const eudamedIncidentsMutation = useMutation({
    mutationFn: () => apiRequest('/api/eudamed/sync-incidents', 'POST'),
    onSuccess: () => {
      toast({
        title: "EUDAMED Incident Sync",
        description: "Successfully synced EUDAMED incident reports",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      setActiveSync(null);
    },
    onError: (error: any) => {
      toast({
        title: "EUDAMED Incident Sync Failed",
        description: error.message,
        variant: "destructive",
      });
      setActiveSync(null);
    }
  });

  const eudamedCompleteMutation = useMutation({
    mutationFn: () => apiRequest('/api/eudamed/sync-all', 'POST'),
    onSuccess: () => {
      toast({
        title: "Complete EUDAMED Sync",
        description: "Successfully synced all EUDAMED data sources",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      setActiveSync(null);
    },
    onError: (error: any) => {
      toast({
        title: "Complete EUDAMED Sync Failed",
        description: error.message,
        variant: "destructive",
      });
      setActiveSync(null);
    }
  });

  // Cross-Reference Mutations
  const deviceMappingMutation = useMutation({
    mutationFn: () => apiRequest('/api/crossref/map-devices', 'POST'),
    onSuccess: (data: any) => {
      toast({
        title: "Device Mapping",
        description: `Created ${data.count} device mappings across jurisdictions`,
      });
      setActiveSync(null);
    },
    onError: (error: any) => {
      toast({
        title: "Device Mapping Failed",
        description: error.message,
        variant: "destructive",
      });
      setActiveSync(null);
    }
  });

  const standardsMappingMutation = useMutation({
    mutationFn: () => apiRequest('/api/crossref/map-standards', 'POST'),
    onSuccess: (data: any) => {
      toast({
        title: "Standards Mapping",
        description: `Mapped ${data.count} standards to regulations`,
      });
      setActiveSync(null);
    },
    onError: (error: any) => {
      toast({
        title: "Standards Mapping Failed",
        description: error.message,
        variant: "destructive",
      });
      setActiveSync(null);
    }
  });

  const comprehensiveCrossRefMutation = useMutation({
    mutationFn: () => apiRequest('/api/crossref/comprehensive', 'POST'),
    onSuccess: (data: CrossRefResult) => {
      toast({
        title: "Comprehensive Cross-Reference",
        description: `Generated ${data.totalMappings} total cross-references`,
      });
      setActiveSync(null);
    },
    onError: (error: any) => {
      toast({
        title: "Comprehensive Cross-Reference Failed",
        description: error.message,
        variant: "destructive",
      });
      setActiveSync(null);
    }
  });

  // Regional Sync Mutations
  const regionalSyncAllMutation = useMutation({
    mutationFn: () => apiRequest('/api/regional/sync-all', 'POST'),
    onSuccess: () => {
      toast({
        title: "Regional Sync",
        description: "Successfully synced all regional authorities",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/regional/authorities-status'] });
      setActiveSync(null);
    },
    onError: (error: any) => {
      toast({
        title: "Regional Sync Failed",
        description: error.message,
        variant: "destructive",
      });
      setActiveSync(null);
    }
  });

  const regionalSyncSingleMutation = useMutation({
    mutationFn: (authorityId: string) => 
      apiRequest(`/api/regional/sync/${authorityId}`, 'POST'),
    onSuccess: (data: any, authorityId: string) => {
      toast({
        title: "Regional Authority Sync",
        description: `Successfully synced ${authorityId}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/regional/authorities-status'] });
    },
    onError: (error: any) => {
      toast({
        title: "Regional Authority Sync Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Combined Phase 2 Sync
  const phase2SyncMutation = useMutation({
    mutationFn: () => apiRequest('/api/phase2/sync-all', 'POST'),
    onSuccess: (data: any) => {
      toast({
        title: "Phase 2 Complete Sync",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      setActiveSync(null);
    },
    onError: (error: any) => {
      toast({
        title: "Phase 2 Sync Failed",
        description: error.message,
        variant: "destructive",
      });
      setActiveSync(null);
    }
  });

  const handleSync = (syncType: string, mutation: any, ...args: any[]) => {
    setActiveSync(syncType);
    if (args.length > 0) {
      mutation.mutate(args[0]);
    } else {
      mutation.mutate();
    }
  };

  const getRegionColor = (region: string) => {
    const colors: Record<string, string> = {
      'Asia': 'bg-blue-500',
      'Europe': 'bg-green-500',
      'Middle East': 'bg-yellow-500',
      'Africa': 'bg-purple-500',
      'North America': 'bg-red-500',
      'South America': 'bg-orange-500'
    };
    return colors[region] || 'bg-gray-500';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Phase 2 Strategic Extensions</h1>
        <p className="text-muted-foreground">
          EUDAMED Integration, Cross-Reference Engine, and Regional Expansion
        </p>
      </div>

      {/* Quick Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Phase 2 Master Control
          </CardTitle>
          <CardDescription>
            Execute comprehensive Phase 2 strategic extensions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => handleSync('phase2-complete', phase2SyncMutation)}
            disabled={!!activeSync}
            className="w-full"
          >
            {activeSync === 'phase2-complete' ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Running Complete Phase 2 Sync...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Execute Complete Phase 2 Sync
              </>
            )}
          </Button>
          {phase2SyncMutation.data && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800">Phase 2 Results:</h4>
              <div className="text-sm text-blue-700 mt-2 space-y-1">
                {phase2SyncMutation.data.results?.map((result: any, index: number) => (
                  <div key={index} className="flex justify-between">
                    <span>{result.service}:</span>
                    <Badge variant={result.status === 'fulfilled' ? 'default' : 'destructive'}>
                      {result.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="eudamed" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="eudamed">EUDAMED</TabsTrigger>
          <TabsTrigger value="crossref">Cross-Reference</TabsTrigger>
          <TabsTrigger value="regional">Regional Expansion</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        {/* EUDAMED Tab */}
        <TabsContent value="eudamed" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Device Registrations
                </CardTitle>
                <CardDescription>
                  Sync EU MDR device registrations from EUDAMED
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleSync('eudamed-devices', eudamedDevicesMutation)}
                  disabled={!!activeSync}
                  className="w-full"
                >
                  {activeSync === 'eudamed-devices' ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Sync Device Registrations
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Incident Reports
                </CardTitle>
                <CardDescription>
                  Sync incident reports and safety alerts from EUDAMED
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleSync('eudamed-incidents', eudamedIncidentsMutation)}
                  disabled={!!activeSync}
                  className="w-full"
                >
                  {activeSync === 'eudamed-incidents' ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Sync Incident Reports
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Complete EUDAMED
                </CardTitle>
                <CardDescription>
                  Comprehensive sync of all EUDAMED data sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleSync('eudamed-complete', eudamedCompleteMutation)}
                  disabled={!!activeSync}
                  className="w-full"
                >
                  {activeSync === 'eudamed-complete' ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Complete EUDAMED Sync
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>EUDAMED Information</CardTitle>
              <CardDescription>
                EU Database on Medical Devices - Critical for EU market access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Device Classes</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Class I (Low Risk)</li>
                    <li>• Class IIa (Medium-Low Risk)</li>
                    <li>• Class IIb (Medium-High Risk)</li>
                    <li>• Class III (High Risk)</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Data Types</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Device Registrations</li>
                    <li>• UDI Database</li>
                    <li>• Clinical Evidence</li>
                    <li>• Post-Market Surveillance</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Compliance</h4>
                  <ul className="text-sm space-y-1">
                    <li>• EU MDR Requirements</li>
                    <li>• Notified Body Assessment</li>
                    <li>• CE Marking Process</li>
                    <li>• Authorized Representatives</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cross-Reference Tab */}
        <TabsContent value="crossref" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Device Mapping
                </CardTitle>
                <CardDescription>
                  Map devices across multiple jurisdictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleSync('device-mapping', deviceMappingMutation)}
                  disabled={!!activeSync}
                  className="w-full"
                >
                  {activeSync === 'device-mapping' ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Mapping...
                    </>
                  ) : (
                    <>
                      <Network className="mr-2 h-4 w-4" />
                      Map Devices
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSearch className="h-5 w-5" />
                  Standards Mapping
                </CardTitle>
                <CardDescription>
                  Link ISO/IEC standards to regulations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleSync('standards-mapping', standardsMappingMutation)}
                  disabled={!!activeSync}
                  className="w-full"
                >
                  {activeSync === 'standards-mapping' ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Mapping...
                    </>
                  ) : (
                    <>
                      <FileSearch className="mr-2 h-4 w-4" />
                      Map Standards
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Comprehensive Cross-Ref
                </CardTitle>
                <CardDescription>
                  Generate complete cross-reference database
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleSync('comprehensive-crossref', comprehensiveCrossRefMutation)}
                  disabled={!!activeSync}
                  className="w-full"
                >
                  {activeSync === 'comprehensive-crossref' ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Globe className="mr-2 h-4 w-4" />
                      Generate Cross-Ref
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Cross-Reference Results */}
          {comprehensiveCrossRefMutation.data && (
            <Card>
              <CardHeader>
                <CardTitle>Cross-Reference Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {comprehensiveCrossRefMutation.data.deviceMappings.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Device Mappings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {comprehensiveCrossRefMutation.data.standardMappings.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Standard Mappings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {comprehensiveCrossRefMutation.data.clinicalMappings.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Clinical Links</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {comprehensiveCrossRefMutation.data.totalMappings}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Mappings</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Regional Expansion Tab */}
        <TabsContent value="regional" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Sync All Regions
                </CardTitle>
                <CardDescription>
                  Synchronize data from all regional authorities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleSync('regional-all', regionalSyncAllMutation)}
                  disabled={!!activeSync}
                  className="w-full"
                >
                  {activeSync === 'regional-all' ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Globe className="mr-2 h-4 w-4" />
                      Sync All Regional Authorities
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Regional Coverage
                </CardTitle>
                <CardDescription>
                  Monitoring authorities across 4 continents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Active Authorities</span>
                    <Badge variant="outline">
                      {regionalStatus?.filter((auth: RegionalAuthority) => auth.active).length || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Regions</span>
                    <span className="text-sm text-muted-foreground">
                      {new Set(regionalStatus?.map((auth: RegionalAuthority) => auth.region)).size || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>API Endpoints</span>
                    <span className="text-sm text-muted-foreground">
                      {regionalStatus?.filter((auth: RegionalAuthority) => auth.hasAPI).length || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Regional Authorities Status */}
          <Card>
            <CardHeader>
              <CardTitle>Regional Authorities Status</CardTitle>
              <CardDescription>
                Current status of all configured regional authorities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {regionalLoading ? (
                <div className="text-center py-4">Loading regional authorities...</div>
              ) : regionalStatus && regionalStatus.length > 0 ? (
                <div className="space-y-4">
                  {regionalStatus.map((authority: RegionalAuthority) => (
                    <div key={authority.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getRegionColor(authority.region)}`}></div>
                          <div>
                            <h4 className="font-semibold">{authority.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {authority.country} - {authority.region}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(authority.priority)}>
                            {authority.priority}
                          </Badge>
                          <Badge variant={authority.active ? 'default' : 'secondary'}>
                            {authority.active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => regionalSyncSingleMutation.mutate(authority.id)}
                            disabled={regionalSyncSingleMutation.isPending}
                          >
                            {regionalSyncSingleMutation.isPending ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <>Sync</>
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="font-medium">Data Types:</span>
                          <div className="text-muted-foreground">{authority.dataTypes.length} types</div>
                        </div>
                        <div>
                          <span className="font-medium">API:</span>
                          <div className="text-muted-foreground">{authority.hasAPI ? 'Available' : 'RSS Only'}</div>
                        </div>
                        <div>
                          <span className="font-medium">RSS Feeds:</span>
                          <div className="text-muted-foreground">{authority.rssFeeds} feeds</div>
                        </div>
                        <div>
                          <span className="font-medium">Priority:</span>
                          <div className="text-muted-foreground">{authority.priority}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No regional authorities configured
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  EUDAMED Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Device Registrations</span>
                    <Badge variant="outline">EU MDR</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Incident Reports</span>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Data Source</span>
                    <span className="text-sm text-muted-foreground">European Commission</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Cross-Reference Engine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Device Mapping</span>
                    <Badge variant="outline">Multi-Jurisdiction</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Standards Linking</span>
                    <Badge variant="outline">ISO/IEC</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Timeline Generation</span>
                    <span className="text-sm text-muted-foreground">Automated</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Regional Expansion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Authorities</span>
                    <Badge variant="outline">{regionalStatus?.length || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Regions</span>
                    <span className="text-sm text-muted-foreground">Asia, MENA, Africa</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Coverage</span>
                    <span className="text-sm text-muted-foreground">Global</span>
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