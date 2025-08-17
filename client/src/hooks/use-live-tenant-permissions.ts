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

  // Fetch tenant data with automatic polling
  const { data: tenantData, isLoading, error } = useQuery({
    queryKey: ['/api/customer/tenant', tenantId],
    queryFn: async () => {
      const response = await fetch(`/api/customer/tenant/${tenantId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch tenant data: ${response.status}`);
      }
      return await response.json();
    },
    refetchInterval: pollInterval,
    enabled: !!tenantId,
  });

  // Update local state when tenant data changes
  useEffect(() => {
    if (tenantData) {
      const newPermissions = tenantData.customerPermissions;
      const newName = tenantData.name;
      
      // Performance-optimized: shallow comparison instead of JSON.stringify
      const hasChanged = !newPermissions || !permissions || 
        Object.keys(newPermissions).some(key => newPermissions[key] !== permissions[key]) ||
        Object.keys(permissions).some(key => permissions[key] !== newPermissions[key]);
        
      if (hasChanged) {
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