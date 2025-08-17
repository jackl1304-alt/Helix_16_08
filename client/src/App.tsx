import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient-clean";
import { Toaster } from "@/components/ui/toaster";
import { Router, Route, Switch } from "wouter";
import { ResponsiveLayout } from "@/components/responsive-layout";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CustomerThemeProvider } from "@/contexts/customer-theme-context";
import { useAuth } from "@/hooks/use-auth";

// Authentication Pages
import Login from "@/pages/login";
import TenantAuth from "@/pages/tenant-auth";

// Admin Dashboard & Pages
import Dashboard from "@/pages/dashboard";
import Administration from "@/pages/administration";
import RegulatoryUpdates from "@/pages/regulatory-updates";
import RegulatoryUpdateDetail from "@/pages/regulatory-update-detail";
import Analytics from "@/pages/analytics";
import AdvancedAnalytics from "@/pages/advanced-analytics";
import DataCollection from "@/pages/data-collection";
import GlobalSources from "@/pages/global-sources";
import HistoricalData from "@/pages/historical-data";
import KnowledgeBase from "@/pages/knowledge-base";
import IntelligentSearch from "@/pages/intelligent-search";
import AiInsights from "@/pages/ai-insights";
import AiAnalysisCombined from "@/pages/ai-analysis-combined";
import ApprovalWorkflow from "@/pages/approval-workflow";
import LaufendeZulassungen from "@/pages/laufende-zulassungen";
import CustomerLegalCases from "@/pages/customer-legal-cases";
import RechtsprechungKompaktClean from "@/pages/rechtsprechung-kompakt-clean";
import NewsletterManager from "@/pages/newsletter-manager";
import EmailManagement from "@/pages/email-management";
import ChatSupport from "@/pages/chat-support";
import TerminologyGlossary from "@/pages/terminology-glossary";
import DocumentViewer from "@/pages/document-viewer";
import UserManagement from "@/pages/user-management";
import SystemSettings from "@/pages/system-settings";
import AuditLogs from "@/pages/audit-logs";
import GripIntegration from "@/pages/grip-integration";
import SyncManager from "@/pages/sync-manager";

// Customer/Tenant Dashboard
import TenantDashboard from "@/pages/tenant-dashboard";
import CustomerDashboard from "@/pages/customer-dashboard";
import CustomerRegulatoryUpdates from "@/pages/customer-regulatory-updates";
import CustomerAiInsights from "@/pages/customer-ai-insights";
import CustomerAnalytics from "@/pages/customer-analytics";
import CustomerDataCollection from "@/pages/customer-data-collection";
import CustomerGlobalSources from "@/pages/customer-global-sources";
import CustomerHistoricalData from "@/pages/customer-historical-data";
import CustomerKnowledgeBase from "@/pages/customer-knowledge-base";
import CustomerNewsletters from "@/pages/customer-newsletters";
import CustomerSettings from "@/pages/customer-settings";

// Error Pages
import NotFound from "@/pages/not-found";

// Main App Component with Multi-Tenant Support
function App() {
  const { isAuthenticated, isLoading, login, userRole } = useAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="relative">
            {/* HELIX Logo */}
            <div className="relative h-24 w-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-xl ring-2 ring-blue-200 shadow-lg flex items-center justify-center text-white mx-auto mb-6 animate-pulse">
              <div className="flex flex-col items-center">
                <div className="text-2xl font-black tracking-tight mb-1">H</div>
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-white rounded-full opacity-80 animate-ping"></div>
                  <div className="w-1 h-1 bg-white rounded-full opacity-60"></div>
                  <div className="w-1 h-1 bg-white rounded-full opacity-80 animate-ping"></div>
                </div>
                <div className="flex space-x-1 mt-1">
                  <div className="w-1 h-1 bg-white rounded-full opacity-60"></div>
                  <div className="w-1 h-1 bg-white rounded-full opacity-80 animate-ping"></div>
                  <div className="w-1 h-1 bg-white rounded-full opacity-60"></div>
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">HELIX</h2>
            <p className="text-gray-600 mb-4">Regulatory Intelligence Platform</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return (
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <Router>
            <Toaster />
            <Switch>
              <Route path="/tenant/auth" component={() => <TenantAuth />} />
              <Route path="/tenant/:tenantId" component={() => <TenantAuth />} />
              <Route path="/" component={() => <Login onLogin={login} />} />
              <Route component={() => <Login onLogin={login} />} />
            </Switch>
          </Router>
        </QueryClientProvider>
      </LanguageProvider>
    );
  }

  // Main authenticated app with comprehensive routing
  return (
    <LanguageProvider>
      <CustomerThemeProvider>
        <QueryClientProvider client={queryClient}>
          <Router>
            <Toaster />
            <Switch>
              {/* Tenant/Customer Dashboard Routes */}
              <Route path="/tenant/dashboard" component={TenantDashboard} />
              <Route path="/tenant/:tenantId/dashboard" component={CustomerDashboard} />
              <Route path="/customer/dashboard" component={CustomerDashboard} />
              <Route path="/customer/regulatory-updates" component={CustomerRegulatoryUpdates} />
              <Route path="/customer/ai-insights" component={CustomerAiInsights} />
              <Route path="/customer/analytics" component={CustomerAnalytics} />
              <Route path="/customer/data-collection" component={CustomerDataCollection} />
              <Route path="/customer/global-sources" component={CustomerGlobalSources} />
              <Route path="/customer/historical-data" component={CustomerHistoricalData} />
              <Route path="/customer/knowledge-base" component={CustomerKnowledgeBase} />
              <Route path="/customer/newsletters" component={CustomerNewsletters} />
              <Route path="/customer/legal-cases" component={CustomerLegalCases} />
              <Route path="/customer/settings" component={CustomerSettings} />

              {/* Admin Dashboard Routes - Main Navigation */}
              <Route path="/" component={Dashboard} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/administration" component={Administration} />
              
              {/* Regulatory & Data Management */}
              <Route path="/regulatory-updates" component={RegulatoryUpdates} />
              <Route path="/regulatory-updates/:id" component={RegulatoryUpdateDetail} />
              <Route path="/data-collection" component={DataCollection} />
              <Route path="/global-sources" component={GlobalSources} />
              <Route path="/historical-data" component={HistoricalData} />
              <Route path="/grip-integration" component={GripIntegration} />
              <Route path="/sync-manager" component={SyncManager} />
              
              {/* Analytics & AI */}
              <Route path="/analytics" component={Analytics} />
              <Route path="/advanced-analytics" component={AdvancedAnalytics} />
              <Route path="/intelligent-search" component={IntelligentSearch} />
              <Route path="/ai-insights" component={AiInsights} />
              <Route path="/ai-analysis-combined" component={AiAnalysisCombined} />
              
              {/* Legal & Compliance */}
              <Route path="/approval-workflow" component={ApprovalWorkflow} />
              <Route path="/laufende-zulassungen" component={LaufendeZulassungen} />
              <Route path="/rechtsprechung-kompakt" component={RechtsprechungKompaktClean} />
              
              {/* Communication */}
              <Route path="/newsletter-manager" component={NewsletterManager} />
              <Route path="/email-management" component={EmailManagement} />
              <Route path="/chat-support" component={ChatSupport} />
              
              {/* Knowledge Management */}
              <Route path="/knowledge-base" component={KnowledgeBase} />
              <Route path="/terminology-glossary" component={TerminologyGlossary} />
              <Route path="/document-viewer" component={DocumentViewer} />
              
              {/* Administration */}
              <Route path="/user-management" component={UserManagement} />
              <Route path="/system-settings" component={SystemSettings} />
              <Route path="/audit-logs" component={AuditLogs} />
              
              {/* Fallback */}
              <Route component={NotFound} />
            </Switch>
          </Router>
        </QueryClientProvider>
      </CustomerThemeProvider>
    </LanguageProvider>
  );
}

export default App;