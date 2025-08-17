import React, { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ResponsiveLayout } from "@/components/responsive-layout";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { LanguageProvider } from "@/contexts/LanguageContext";

// Pages
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import SystemSettings from "@/pages/system-settings";
import Analytics from "@/pages/analytics";
import RegulatoryUpdates from "@/pages/regulatory-updates";
import DataCollection from "@/pages/data-collection";
import NewsletterAdmin from "@/pages/newsletter-admin";
import EmailManagement from "@/pages/email-management";
import KnowledgeBase from "@/pages/knowledge-base";
import RechtsprechungFixed from "@/pages/rechtsprechung-fixed";
import ZulassungenGlobal from "@/pages/zulassungen-global";
import LaufendeZulassungen from "@/pages/laufende-zulassungen";
import SyncManager from "@/pages/sync-manager";
import GlobalSources from "@/pages/global-sources";
import NewsletterManager from "@/pages/newsletter-manager";
import HistoricalData from "@/pages/historical-data";
import AdminCustomers from "@/pages/admin-customers";
import UserManagement from "@/pages/user-management";
import Administration from "@/pages/administration";
import AuditLogs from "@/pages/audit-logs";
import AiContentAnalysis from "@/pages/ai-content-analysis";
import AiInsights from "@/pages/ai-insights";
import GripIntegration from "@/pages/grip-integration";

// Simple Auth Hook
function useSimpleAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    setIsAuthenticated(authStatus === "true");
    setIsLoading(false);
  }, []);

  const login = () => {
    localStorage.setItem("isAuthenticated", "true");
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    localStorage.removeItem("loginTime");
    setIsAuthenticated(false);
  };

  return { isAuthenticated, isLoading, login, logout };
}

function App() {
  const { isAuthenticated, isLoading, login } = useSimpleAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <LanguageProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Login onLogin={login} />
            </TooltipProvider>
          </QueryClientProvider>
        </LanguageProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <ResponsiveLayout>
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/analytics" component={Analytics} />
                <Route path="/system-settings" component={SystemSettings} />
                
                {/* Data Management */}
                <Route path="/data-collection" component={DataCollection} />
                <Route path="/newsletter-admin" component={NewsletterAdmin} />
                <Route path="/email-management" component={EmailManagement} />
                <Route path="/knowledge-base" component={KnowledgeBase} />
                
                {/* Compliance & Regulation */}
                <Route path="/regulatory-updates" component={RegulatoryUpdates} />
                <Route path="/rechtsprechung" component={RechtsprechungFixed} />
                
                {/* Approvals & Registration */}
                <Route path="/zulassungen/global" component={ZulassungenGlobal} />
                <Route path="/zulassungen/laufende" component={LaufendeZulassungen} />
                
                {/* Advanced */}
                <Route path="/sync-manager" component={SyncManager} />
                <Route path="/global-sources" component={GlobalSources} />
                <Route path="/newsletter-manager" component={NewsletterManager} />
                <Route path="/historical-data" component={HistoricalData} />
                <Route path="/admin-customers" component={AdminCustomers} />
                <Route path="/user-management" component={UserManagement} />
                <Route path="/administration" component={Administration} />
                <Route path="/audit-logs" component={AuditLogs} />
                <Route path="/ai-content-analysis" component={AiContentAnalysis} />
                <Route path="/ki-insights" component={AiInsights} />
                <Route path="/grip-integration" component={GripIntegration} />
                
                <Route component={NotFound} />
              </Switch>
            </ResponsiveLayout>
          </TooltipProvider>
        </QueryClientProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;