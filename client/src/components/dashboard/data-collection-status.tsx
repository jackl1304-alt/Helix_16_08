import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderSync, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useState } from "react";

interface DataSource {
  id: string;
  name: string;
  type: string;
  category: string; // "current" or "historical"
  isActive: boolean;
  lastSyncAt: string | null;
  region: string;
  language: string;
  frequency: string;
}

export function DataCollectionStatus() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [isCurrentExpanded, setIsCurrentExpanded] = useState(true);
  const [isHistoricalExpanded, setIsHistoricalExpanded] = useState(false);
  
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
        title: "Synchronisation gestartet",
        description: "Datenquelle wird synchronisiert.",
      });
    },
    onError: (error) => {
      toast({
        title: "Synchronisation fehlgeschlagen",
        description: "Datenquelle konnte nicht synchronisiert werden.",
        variant: "destructive",
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ sourceId, isActive }: { sourceId: string; isActive: boolean }) => {
      await apiRequest("PATCH", `/api/data-sources/${sourceId}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/data-sources"] });
      toast({
        title: "Status geändert",
        description: "Datenquelle wurde aktiviert/deaktiviert.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: "Status konnte nicht geändert werden.",
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

  // Separate current and historical sources (with fallback for missing category)
  const currentSources = sources.filter(source => source.category === "current" || !source.category);
  const historicalSources = sources.filter(source => source.category === "historical");

  return (
    <div className="space-y-6">
      {/* Current Data Sources (2025+) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => setIsCurrentExpanded(!isCurrentExpanded)}
            >
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Aktuelle Datenquellen (2025+)</h2>
                <p className="text-sm text-gray-600">Live regulatory data collection since January 1, 2025</p>
              </div>
              <div className="ml-4">
                {isCurrentExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setLocation("/global-sources")}
              >
                Manage Sources
              </Button>
              <Badge variant="outline" className="text-xs">
                {currentSources.length} sources
              </Badge>
            </div>
          </div>
        </CardHeader>
        {isCurrentExpanded && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentSources.map((source) => (
              <div key={source.id} className="flex items-center space-x-3 p-4 border border-green-200 rounded-lg bg-green-50">
                <div className="flex-shrink-0">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(source)}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{source.name}</p>
                  <p className="text-xs text-gray-600">{source.region} • daily</p>
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
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-xs"
                        onClick={() => syncMutation.mutate(source.id)}
                        disabled={syncMutation.isPending}
                      >
                        <FolderSync className="h-3 w-3" />
                      </Button>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={source.isActive}
                          onChange={(e) => toggleActiveMutation.mutate({ 
                            sourceId: source.id, 
                            isActive: e.target.checked 
                          })}
                          disabled={toggleActiveMutation.isPending}
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        )}
      </Card>

      {/* Historical Data Sources (bis 31.12.2024) */}
      {historicalSources.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div 
                className="flex items-center cursor-pointer"
                onClick={() => setIsHistoricalExpanded(!isHistoricalExpanded)}
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Historische Archive (bis 31.12.2024)</h2>
                  <p className="text-sm text-gray-600">Archived regulatory data through December 31, 2024</p>
                </div>
                <div className="ml-4">
                  {isHistoricalExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setLocation("/historical-data")}
                >
                  View Archive
                </Button>
                <Badge variant="outline" className="text-xs">
                  {historicalSources.length} archives
                </Badge>
              </div>
            </div>
          </CardHeader>
          {isHistoricalExpanded && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {historicalSources.map((source) => (
                <div key={source.id} className="flex items-center space-x-3 p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{source.name}</p>
                    <p className="text-xs text-gray-600">{source.region} • Archived</p>
                    <p className="text-xs text-gray-600">Final sync: {getLastSyncText(source)}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge
                        variant="outline"
                        className="text-xs text-blue-600 border-blue-200"
                      >
                        Archived
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-xs"
                        onClick={() => setLocation("/historical-data")}
                      >
                        View Archive
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
