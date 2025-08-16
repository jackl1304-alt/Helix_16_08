import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
// Customer permissions interface
interface CustomerPermissions {
  dashboard: boolean;
  regulatoryUpdates: boolean;
  legalCases: boolean;
  knowledgeBase: boolean;
  newsletters: boolean;
  analytics: boolean;
  reports: boolean;
  dataCollection: boolean;
  globalSources: boolean;
  historicalData: boolean;
  administration: boolean;
  userManagement: boolean;
  systemSettings: boolean;
  auditLogs: boolean;
  aiInsights: boolean;
  advancedAnalytics: boolean;
}

interface UseLiveTenantPermissionsOptions {
  tenantId: string;
  pollInterval?: number;
}

export function useLiveTenantPermissions({ 
  tenantId, 
  pollInterval = 3000 
}: UseLiveTenantPermissionsOptions) {
  const [permissions, setPermissions] = useState<CustomerPermissions | null>(null);
  const [tenantName, setTenantName] = useState<string>('');

  // Fetch tenant data ONCE - no polling to prevent spam
  const { data: tenantData, isLoading, error } = useQuery({
    queryKey: ['/api/customer/tenant-new', tenantId],
    queryFn: async () => {
      const response = await fetch(`/api/customer/tenant-new/${tenantId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch tenant data: ${response.status}`);
      }
      return await response.json();
    },
    // REMOVED: refetchInterval to stop constant polling
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!tenantId,
  });

  // Update local state when tenant data changes
  useEffect(() => {
    if (tenantData) {
      const newPermissions = tenantData.customerPermissions;
      const newName = tenantData.name;
      
      // Only update if permissions actually changed
      if (JSON.stringify(newPermissions) !== JSON.stringify(permissions)) {
        setPermissions(newPermissions);
        console.log('[LIVE PERMISSIONS] Updated for tenant:', tenantId, newPermissions);
      }
      
      if (newName !== tenantName) {
        setTenantName(newName);
      }
    }
  }, [tenantData, tenantId]);

  return {
    permissions,
    tenantName,
    isLoading,
    error,
    refetch: () => {
      // Force immediate refresh
      window.location.reload();
    }
  };
}