import React, { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Login from "@/pages/login";

// Direct imports - no lazy loading to eliminate Suspense issues
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";

// Admin Pages
import Administration from "@/pages/administration";
import AdminCustomers from "@/pages/admin-customers";
import AdminGlossary from "@/pages/admin-glossary";
import DataSourcesAdmin from "@/pages/DataSourcesAdmin";
import UserManagement from "@/pages/user-management";
import SystemSettings from "@/pages/system-settings";
import AuditLogs from "@/pages/audit-logs";

// Customer Pages
import CustomerDashboard from "@/pages/customer-dashboard";
import CustomerAiInsights from "@/pages/customer-ai-insights-clean";
import CustomerAnalytics from "@/pages/customer-analytics";
import CustomerSettings from "@/pages/customer-settings";
import CustomerDataCollection from "@/pages/customer-data-collection";
import CustomerGlobalSources from "@/pages/customer-global-sources";
import CustomerHistoricalData from "@/pages/customer-historical-data";
import CustomerKnowledgeBase from "@/pages/customer-knowledge-base";
import CustomerLegalCases from "@/pages/customer-legal-cases";
import CustomerNewsletters from "@/pages/customer-newsletters";
import CustomerRegulatoryUpdates from "@/pages/customer-regulatory-updates";

// Main Pages
import Analytics from "@/pages/analytics";
import AdvancedAnalytics from "@/pages/advanced-analytics";
import AiInsights from "@/pages/ai-insights";
import AiAnalysisCombined from "@/pages/ai-analysis-combined";
import AiContentAnalysis from "@/pages/ai-content-analysis";
import ApprovalWorkflow from "@/pages/approval-workflow";
import DataCollection from "@/pages/data-collection";
import EmailManagement from "@/pages/email-management-new";
import GlobalSources from "@/pages/global-sources";
import GripData from "@/pages/grip-data";
import GripIntegration from "@/pages/grip-integration";
import HistoricalData from "@/pages/historical-data";
import IntelligentSearch from "@/pages/intelligent-search";
import KnowledgeBase from "@/pages/knowledge-base-new";
import NewsletterAdmin from "@/pages/newsletter-admin";
import NewsletterManager from "@/pages/newsletter-manager";
import RegulatoryUpdates from "@/pages/regulatory-updates-clean";
import SyncManager from "@/pages/sync-manager-new";
import TerminologyGlossary from "@/pages/terminology-glossary";
import ZulassungenGlobal from "@/pages/zulassungen-global";
import LaufendeZulassungen from "@/pages/laufende-zulassungen";
import RechtsprechungFixed from "@/pages/rechtsprechung-fixed";
import ChatSupport from "@/pages/chat-support";

// Tenant Pages
import TenantAuth from "@/pages/tenant-auth";
import TenantDashboard from "@/pages/tenant-dashboard";
import TenantOnboarding from "@/pages/tenant-onboarding";

// JSON-based Navigation State
interface AppState {
  currentPage: string;
  userData: any;
  isLoading: boolean;
}

// Enhanced page renderer with all routes activated
function renderCurrentPage(page: string, userData: any) {
  switch (page) {
    // Main Routes
    case '/':
    case '/dashboard':
      return <Dashboard />;
    
    // Admin Routes
    case '/administration':
      return <Administration />;
    case '/admin/customers':
      return <AdminCustomers />;
    case '/admin/glossary':
      return <AdminGlossary />;
    case '/admin/data-sources':
      return <DataSourcesAdmin />;
    case '/admin/users':
      return <UserManagement />;
    case '/admin/settings':
      return <SystemSettings />;
    case '/admin/audit-logs':
      return <AuditLogs />;
    case '/admin/newsletters':
      return <NewsletterAdmin />;
    case '/admin/newsletter-manager':
      return <NewsletterManager />;
    
    // Customer Routes
    case '/customer':
    case '/customer/dashboard':
      return <CustomerDashboard />;
    case '/customer/ai-insights':
      return <CustomerAiInsights />;
    case '/customer/analytics':
      return <CustomerAnalytics />;
    case '/customer/settings':
      return <CustomerSettings />;
    case '/customer/data-collection':
      return <CustomerDataCollection />;
    case '/customer/global-sources':
      return <CustomerGlobalSources />;
    case '/customer/historical-data':
      return <CustomerHistoricalData />;
    case '/customer/knowledge-base':
      return <CustomerKnowledgeBase />;
    case '/customer/legal-cases':
      return <CustomerLegalCases />;
    case '/customer/newsletters':
      return <CustomerNewsletters />;
    case '/customer/regulatory-updates':
      return <CustomerRegulatoryUpdates />;
    
    // Analytics & AI
    case '/analytics':
      return <Analytics />;
    case '/advanced-analytics':
      return <AdvancedAnalytics />;
    case '/ai-insights':
      return <AiInsights />;
    case '/ai-analysis':
      return <AiAnalysisCombined />;
    case '/ai-content-analysis':
      return <AiContentAnalysis />;
    
    // Data & Content Management
    case '/data-collection':
      return <DataCollection />;
    case '/historical-data':
      return <HistoricalData />;
    case '/global-sources':
      return <GlobalSources />;
    case '/knowledge-base':
      return <KnowledgeBase />;
    case '/regulatory-updates':
      return <RegulatoryUpdates />;
    case '/approval-workflow':
      return <ApprovalWorkflow />;
    
    // Integration & External Data
    case '/grip-data':
      return <GripData />;
    case '/grip-integration':
      return <GripIntegration />;
    case '/sync-manager':
      return <SyncManager />;
    
    // Search & Tools
    case '/intelligent-search':
      return <IntelligentSearch />;
    case '/terminology-glossary':
      return <TerminologyGlossary />;
    
    // Communication
    case '/email-management':
      return <EmailManagement />;
    case '/chat-support':
      return <ChatSupport />;
    
    // Regulatory & Legal
    case '/zulassungen-global':
      return <ZulassungenGlobal />;
    case '/laufende-zulassungen':
      return <LaufendeZulassungen />;
    case '/rechtsprechung':
      return <RechtsprechungFixed />;
    
    // Tenant Management
    case '/tenant/auth':
      return <TenantAuth />;
    case '/tenant/dashboard':
      return <TenantDashboard />;
    case '/tenant/onboarding':
      return <TenantOnboarding />;
    
    // Error Routes
    case '/404':
    case '/not-found':
      return <NotFound />;
    
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