import React, { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Login from "@/pages/login";

// Direct imports - no lazy loading to eliminate Suspense issues
import Dashboard from "@/pages/dashboard";
import RegulatoryUpdates from "@/pages/regulatory-updates";
import KnowledgeBase from "@/pages/knowledge-base";
import Analytics from "@/pages/analytics";
import GlobalSources from "@/pages/global-sources";
import HistoricalData from "@/pages/historical-data";
import SystemSettings from "@/pages/system-settings";
import NotFound from "@/pages/not-found";

// JSON-based Navigation State
interface AppState {
  currentPage: string;
  userData: any;
  isLoading: boolean;
}

// Simple page renderer without complex routing
function renderCurrentPage(page: string, userData: any) {
  switch (page) {
    case '/':
    case '/dashboard':
      return <Dashboard />;
    case '/regulatory-updates':
      return <RegulatoryUpdates />;
    case '/knowledge-base':
      return <KnowledgeBase />;
    case '/analytics':
      return <Analytics />;
    case '/global-sources':
      return <GlobalSources />;
    case '/historical-data':
      return <HistoricalData />;
    case '/system-settings':
      return <SystemSettings />;
    case '/404':
    default:
      return <NotFound />;
  }
}

// JSON-based Simple App without React Suspense issues
function App() {
  const [appState, setAppState] = useState<AppState>({
    currentPage: window.location.pathname,
    userData: null,
    isLoading: true
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Initialize app with JSON data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check authentication
        const authStatus = localStorage.getItem('isAuthenticated') === 'true';
        setIsAuthenticated(authStatus);
        
        // Load user data from JSON endpoint if authenticated
        if (authStatus) {
          const userData = await fetch('/api/user/profile')
            .then(res => res.ok ? res.json() : null)
            .catch(() => null);
          
          setAppState(prev => ({
            ...prev,
            userData,
            isLoading: false
          }));
        } else {
          setAppState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('App initialization error:', error);
        setAppState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeApp();
  }, []);

  // Handle navigation via JSON state
  const handleNavigation = (page: string) => {
    setAppState(prev => ({ ...prev, currentPage: page }));
    window.history.pushState({}, '', page);
  };

  // Loading state
  if (appState.isLoading || isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Helix wird geladen...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <div className="min-h-screen bg-gray-50">
            <Toaster />
            <Login onLogin={() => setIsAuthenticated(true)} />
          </div>
        </LanguageProvider>
      </QueryClientProvider>
    );
  }

  // Main app with JSON-based navigation
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <div className="min-h-screen bg-gray-50">
          <Toaster />
          {renderCurrentPage(appState.currentPage, appState.userData)}
        </div>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;

// JSON API helper functions
export const jsonApi = {
  get: async (endpoint: string) => {
    try {
      const response = await fetch(endpoint);
      return response.ok ? await response.json() : null;
    } catch (error) {
      console.error('JSON API GET error:', error);
      return null;
    }
  },
  
  post: async (endpoint: string, data: any) => {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.ok ? await response.json() : null;
    } catch (error) {
      console.error('JSON API POST error:', error);
      return null;
    }
  }
};