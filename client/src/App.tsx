import React, { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ResponsiveLayout } from "@/components/responsive-layout";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { LanguageProvider } from "@/contexts/LanguageContext";

// Core Pages (eager loading)
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

// Lazy loaded pages (code splitting!)
const Dashboard = React.lazy(() => import("@/pages/dashboard"));
const Analytics = React.lazy(() => import("@/pages/analytics"));
const SystemSettings = React.lazy(() => import("@/pages/system-settings"));
const RegulatoryUpdates = React.lazy(() => import("@/pages/regulatory-updates"));
const DataCollection = React.lazy(() => import("@/pages/data-collection"));
const NewsletterAdmin = React.lazy(() => import("@/pages/newsletter-admin"));
const EmailManagement = React.lazy(() => import("@/pages/email-management"));
const KnowledgeBase = React.lazy(() => import("@/pages/knowledge-base"));
const RechtsprechungFixed = React.lazy(() => import("@/pages/rechtsprechung-fixed"));
const ZulassungenGlobal = React.lazy(() => import("@/pages/zulassungen-global"));
const LaufendeZulassungen = React.lazy(() => import("@/pages/laufende-zulassungen"));
const SyncManager = React.lazy(() => import("@/pages/sync-manager"));
const GlobalSources = React.lazy(() => import("@/pages/global-sources"));
const NewsletterManager = React.lazy(() => import("@/pages/newsletter-manager"));
const HistoricalData = React.lazy(() => import("@/pages/historical-data"));
const AdminCustomers = React.lazy(() => import("@/pages/admin-customers"));
const UserManagement = React.lazy(() => import("@/pages/user-management"));
const Administration = React.lazy(() => import("@/pages/administration"));
const AuditLogs = React.lazy(() => import("@/pages/audit-logs"));
const AiContentAnalysis = React.lazy(() => import("@/pages/ai-content-analysis"));
const AiInsights = React.lazy(() => import("@/pages/ai-insights"));
const GripIntegration = React.lazy(() => import("@/pages/grip-integration"));
const CustomerDashboard = React.lazy(() => import("@/pages/customer-dashboard"));

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
              <React.Suspense fallback={
                <div className="flex items-center justify-center min-h-screen">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              }>
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
                  
                  {/* Customer Area */}
                  <Route path="/customer-dashboard" component={CustomerDashboard} />
                  
                  <Route component={NotFound} />
                </Switch>
              </React.Suspense>
            </ResponsiveLayout>
          </TooltipProvider>
        </QueryClientProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;