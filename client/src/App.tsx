import React, { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { ResponsiveLayout } from "@/components/responsive-layout";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Login from "@/pages/login";

// Direct imports - no lazy loading to eliminate Suspense issues
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import CustomerDashboard from "@/pages/customer-dashboard";
import Analytics from "@/pages/analytics";
import DataCollection from "@/pages/data-collection";
import GlobalSources from "@/pages/global-sources";
import RegulatoryUpdates from "@/pages/regulatory-updates-fixed-complete";
import Administration from "@/pages/administration";
import UserManagement from "@/pages/user-management";
import KnowledgeBase from "@/pages/knowledge-base";
import NewsletterAdmin from "@/pages/newsletter-admin";
import EmailManagement from "@/pages/email-management-new";
import ZulassungenGlobal from "@/pages/zulassungen-global";
import LaufendeZulassungen from "@/pages/laufende-zulassungen";
import Rechtsprechung from "@/pages/rechtsprechung-fixed";
import SyncManager from "@/pages/sync-manager-new";
import AIInsights from "@/pages/ai-insights";
import HistoricalData from "@/pages/historical-data-simple";
import AdminCustomers from "@/pages/admin-customers";
import AuditLogs from "@/pages/audit-logs";
import SystemSettings from "@/pages/system-settings";
import IntelligentSearch from "@/pages/intelligent-search";

// JSON-based Navigation State
interface AppState {
  currentPage: string;
  userData: any;
  isLoading: boolean;
}

// JSON-based page renderer with all essential routes
function renderCurrentPage(page: string, userData: any) {
  switch (page) {
    case '/':
    case '/dashboard':
      return <Dashboard />;
    
    // Customer Area - Multiple paths
    case '/customer-dashboard':
    case '/customer/dashboard':
    case '/customer-area':
    case '/tenant/dashboard':
    case '/tenant/demo-medical':
    case '/tenant/demo-medical/dashboard':
      return <CustomerDashboard />;
    
    // Admin Pages
    case '/analytics':
      return <Analytics />;
    case '/data-collection':
      return <DataCollection />;
    case '/global-sources':
      return <GlobalSources />;
    case '/regulatory-updates':
      return <RegulatoryUpdates />;
    case '/administration':
      return <Administration />;
    case '/user-management':
      return <UserManagement />;
    case '/knowledge-base':
      return <KnowledgeBase />;
    
    // Data Management
    case '/newsletter-admin':
      return <NewsletterAdmin />;
    case '/email-management':
      return <EmailManagement />;
    
    // Compliance & Regulation
    case '/rechtsprechung':
      return <Rechtsprechung />;
    
    // Approvals & Registration
    case '/zulassungen/global':
      return <ZulassungenGlobal />;
    case '/zulassungen/laufende':
      return <LaufendeZulassungen />;
    
    // Advanced Features
    case '/sync-manager':
      return <SyncManager />;
    case '/ai-insights':
    case '/ki-insights':
      return <AIInsights />;
    case '/historical-data':
      return <HistoricalData />;
    case '/admin-customers':
      return <AdminCustomers />;
    case '/audit-logs':
      return <AuditLogs />;
    case '/system-settings':
      return <SystemSettings />;
    case '/intelligent-search':
      return <IntelligentSearch />;
    
    case '/404':
      return <NotFound />;
    default:
      return <NotFound />;
  }
}

// JSON-based Simple App with working navigation
function App() {
  const [location] = useLocation(); // Use wouter for navigation
  const [appState, setAppState] = useState<AppState>({
    currentPage: location,
    userData: null,
    isLoading: true
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Update current page when location changes
  useEffect(() => {
    setAppState(prev => ({ ...prev, currentPage: location }));
  }, [location]);

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

  // Navigation is now handled by wouter automatically

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
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <div className="min-h-screen bg-gray-50">
            <Toaster />
            <Login onLogin={() => setIsAuthenticated(true)} />
          </div>
        </QueryClientProvider>
      </LanguageProvider>
    );
  }

  // Main app with JSON-based navigation
  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-gray-50">
          <Toaster />
          <ResponsiveLayout>
            {renderCurrentPage(location, appState.userData)}
          </ResponsiveLayout>
        </div>
      </QueryClientProvider>
    </LanguageProvider>
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