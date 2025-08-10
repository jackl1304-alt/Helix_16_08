import { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CustomerPermissions } from '@/components/customer/customer-navigation';

interface CustomerPermissionsContextProps {
  permissions: CustomerPermissions | null;
  isLoading: boolean;
  tenantId?: string;
  tenantName?: string;
}

interface CustomerPermissionsProviderProps {
  children: ReactNode;
  tenantId?: string;
}

// Default permissions for new tenants
const DEFAULT_PERMISSIONS: CustomerPermissions = {
  dashboard: true,
  regulatoryUpdates: true,
  legalCases: true,
  knowledgeBase: true,
  newsletters: true,
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

// Mock tenant for development - in production this would come from authentication
const mockTenant = {
  id: "tenant_abc123",
  name: "MedTech Solutions GmbH",
  permissions: DEFAULT_PERMISSIONS
};

export function CustomerPermissionsProvider({ children, tenantId }: CustomerPermissionsProviderProps) {
  // Fetch tenant permissions from API
  const { data: tenantData, isLoading } = useQuery({
    queryKey: ['/api/customer/tenant', tenantId || mockTenant.id],
    queryFn: async () => {
      const response = await fetch(`/api/customer/tenant/${tenantId || mockTenant.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tenant permissions');
      }
      const data = await response.json();
      console.log('[CUSTOMER] Fetched tenant permissions:', data);
      return data;
    },
    enabled: true
  });

  const contextValue: CustomerPermissionsContextProps = {
    permissions: tenantData?.customerPermissions || DEFAULT_PERMISSIONS,
    isLoading,
    tenantId: tenantData?.id || mockTenant.id,
    tenantName: tenantData?.name || mockTenant.name
  };

  return (
    <CustomerPermissionsContext.Provider value={contextValue}>
      {children}
    </CustomerPermissionsContext.Provider>
  );
}

// React Context
import { createContext, useContext } from 'react';

const CustomerPermissionsContext = createContext<CustomerPermissionsContextProps>({
  permissions: null,
  isLoading: true
});

export function useCustomerPermissions() {
  const context = useContext(CustomerPermissionsContext);
  if (!context) {
    throw new Error('useCustomerPermissions must be used within CustomerPermissionsProvider');
  }
  return context;
}

// Permission check hook
export function useHasPermission(permission: keyof CustomerPermissions): boolean {
  const { permissions } = useCustomerPermissions();
  return permissions?.[permission] ?? false;
}

// Component wrapper for permission-based rendering
interface PermissionGuardProps {
  permission: keyof CustomerPermissions;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGuard({ permission, children, fallback }: PermissionGuardProps) {
  const hasPermission = useHasPermission(permission);
  
  if (!hasPermission) {
    return fallback ? <>{fallback}</> : null;
  }
  
  return <>{children}</>;
}

// Export types
export type { CustomerPermissions, CustomerPermissionsContextProps };