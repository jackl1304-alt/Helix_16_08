import React, { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Login from "@/pages/login";

// Direct imports - no lazy loading to eliminate Suspense issues
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";

// JSON-based Navigation State
interface AppState {
  currentPage: string;
  userData: any;
  isLoading: boolean;
}

// Navigation via props instead of context to avoid provider issues

// Simple page renderer with navigation prop
function renderCurrentPage(page: string, userData: any, navigate: (page: string) => void) {
  switch (page) {
    case '/':
    case '/dashboard':
      return <Dashboard navigate={navigate} />;
    case '/regulatory-updates':
      return <div className="p-8"><h1 className="text-2xl font-bold mb-4">Regulatory Updates</h1><p>Regulatory Updates Seite wird geladen...</p><button onClick={() => navigate('/dashboard')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Zurück zum Dashboard</button></div>;
    case '/knowledge-base':
      return <div className="p-8"><h1 className="text-2xl font-bold mb-4">Knowledge Base</h1><p>Knowledge Base Seite wird geladen...</p><button onClick={() => navigate('/dashboard')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Zurück zum Dashboard</button></div>;
    case '/analytics':
      return <div className="p-8"><h1 className="text-2xl font-bold mb-4">Analytics</h1><p>Analytics Seite wird geladen...</p><button onClick={() => navigate('/dashboard')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Zurück zum Dashboard</button></div>;
    case '/data-collection':
      return <div className="p-8"><h1 className="text-2xl font-bold mb-4">Data Collection</h1><p>Data Collection Seite wird geladen...</p><button onClick={() => navigate('/dashboard')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Zurück zum Dashboard</button></div>;
    case '/user-management':
      return <div className="p-8"><h1 className="text-2xl font-bold mb-4">User Management</h1><p>User Management Seite wird geladen...</p><button onClick={() => navigate('/dashboard')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Zurück zum Dashboard</button></div>;
    case '/chat-support':
      return <div className="p-8"><h1 className="text-2xl font-bold mb-4">Support Chat</h1><p>Support Chat wird geladen...</p><button onClick={() => navigate('/dashboard')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Zurück zum Dashboard</button></div>;
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

  // Handle navigation via JSON state
  const handleNavigation = (page: string) => {
    setAppState(prev => ({ ...prev, currentPage: page }));
    window.history.pushState({}, '', page);
  };

  // Navigation function passed as prop

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

  // Loading state
  if (appState.isLoading || isAuthenticated === null) {
    return (
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Helix wird geladen...</p>
            </div>
          </div>
        </LanguageProvider>
      </QueryClientProvider>
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
          {renderCurrentPage(appState.currentPage, appState.userData, handleNavigation)}
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