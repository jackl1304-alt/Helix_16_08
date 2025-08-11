import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CustomerNavigation from "@/components/customer/customer-navigation";
import { useCustomerTheme } from "@/contexts/customer-theme-context";
import { useLiveTenantPermissions } from "@/hooks/use-live-tenant-permissions";
import { FileText, Calendar, Globe, Filter } from "lucide-react";

const mockTenantId = "030d3e01-32c4-4f95-8d54-98be948e8d4b";

export default function CustomerRegulatoryUpdates() {
  const { themeSettings, getThemeColors } = useCustomerTheme();
  const colors = getThemeColors();
  const params = useParams();
  
  // Use tenant ID from URL if available, otherwise use mock ID
  const tenantId = params.tenantId || mockTenantId;

  // Use live tenant permissions hook for real-time updates
  const { 
    permissions: livePermissions, 
    tenantName, 
    isLoading: isTenantLoading 
  } = useLiveTenantPermissions({ 
    tenantId,
    pollInterval: 3000 // Poll alle 3 Sekunden für schnelle Updates
  });

  // Use live permissions with fallback
  const permissions = livePermissions || {
    dashboard: true,
    regulatoryUpdates: true,
    legalCases: false,
    knowledgeBase: false,
    newsletters: false,
    analytics: false,
    reports: false,
    dataCollection: false,
    globalSources: false,
    historicalData: false,
    administration: false,
    userManagement: false,
    systemSettings: false,
    auditLogs: false,
    aiInsights: false,
    advancedAnalytics: false
  };

  // Fetch regulatory updates
  const { data: updates, isLoading: isUpdatesLoading } = useQuery({
    queryKey: ['/api/regulatory-updates/recent'],
    queryFn: async () => {
      const response = await fetch('/api/regulatory-updates/recent');
      if (!response.ok) throw new Error('Failed to fetch regulatory updates');
      return await response.json();
    },
    enabled: Boolean(permissions?.regulatoryUpdates)
  });

  if (isTenantLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex items-center justify-center w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerNavigation 
        permissions={permissions} 
        tenantName={tenantName || "Customer Portal"} 
      />
      
      <main className="ml-64 flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Regulatory Updates
            </h1>
            <p className="text-gray-600">
              Aktuelle regulatorische Änderungen und Updates
            </p>
          </div>

          {isUpdatesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                </div>
              ))}
            </div>
          ) : updates && Array.isArray(updates) && updates.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {updates.map((update: any) => (
                <Card key={update.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold line-clamp-2">
                        {update.title}
                      </CardTitle>
                      <Badge variant={update.priority === 'high' ? 'destructive' : 'default'}>
                        {update.priority}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {update.summary}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Globe className="w-4 h-4" />
                        <span>{update.region}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(update.published_date).toLocaleDateString('de-DE')}</span>
                      </div>
                    </div>
                    {update.device_types && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {update.device_types.slice(0, 3).map((type: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Keine Regulatory Updates verfügbar
                </h3>
                <p className="text-gray-500">
                  Aktuell sind keine regulatorischen Updates vorhanden.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}