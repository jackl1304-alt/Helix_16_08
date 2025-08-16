import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';

interface DashboardStats {
  totalUpdates: number;
  uniqueUpdates: number;
  totalLegalCases: number;
  uniqueLegalCases: number;
  recentUpdates: number;
  recentLegalCases: number;
  activeDataSources: number;
  currentData: number;
  archivedData: number;
  duplicatesRemoved: string;
  dataQuality: string;
  totalArticles: number;
  totalSubscribers: number;
  totalNewsletters: number;
  runningSyncs: number;
  recentSyncs: number;
  pendingSyncs: number;
}

interface DashboardContextType {
  stats?: DashboardStats;
  isLoading: boolean;
  error?: Error;
  refetch: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  console.log('🎯 DashboardProvider: EINZIGER API-CALL für alle Components');
  
  const { data: stats, isLoading, error, refetch } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    queryFn: async () => {
      console.log('[CENTRALIZED] Fetching dashboard stats - EINZIGER CALL');
      const response = await fetch('/api/dashboard/stats', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[CENTRALIZED] Dashboard stats loaded successfully');
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - AGGRESSIVE CACHING
    gcTime: 15 * 60 * 1000, // 15 minutes cache
    refetchOnMount: false, // Don't refetch on every mount
    refetchOnWindowFocus: false, // Don't refetch on focus
    retry: 1,
  });

  const contextValue: DashboardContextType = {
    stats,
    isLoading,
    error: error as Error,
    refetch,
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardStats(): DashboardContextType {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboardStats must be used within a DashboardProvider');
  }
  return context;
}

// Export type for other components
export type { DashboardStats };