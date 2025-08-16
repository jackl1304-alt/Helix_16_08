import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import { ResponsiveLayout } from "@/components/responsive-layout";
import { performanceMonitor, preloadCriticalResources } from "@/utils/performance";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { CustomerThemeProvider } from "@/contexts/customer-theme-context";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { useAuth } from "@/hooks/use-auth";
import Login from "@/pages/login";

// Initialize performance monitoring and preload resources
if (typeof window !== 'undefined') {
  preloadCriticalResources();
}

// Critical pages loaded immediately
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";

// Lazy load components for better performance
const CustomerRouter = lazy(() => import("@/components/customer/customer-router"));
const DataCollection = lazy(() => import("@/pages/data-collection"));
const Analytics = lazy(() => import("@/pages/analytics"));
const Administration = lazy(() => import("@/pages/administration"));
const UserManagement = lazy(() => import("@/pages/user-management"));
const RegulatoryUpdates = lazy(() => import("@/pages/regulatory-updates-fixed-complete"));
const KnowledgeBase = lazy(() => import("@/pages/knowledge-base"));

// Additional Admin Pages
const NewsletterAdmin = lazy(() => import("@/pages/newsletter-admin"));
const EmailManagement = lazy(() => import("@/pages/email-management"));
const Rechtsprechung = lazy(() => import("@/pages/rechtsprechung-fixed"));
const ZulassungenGlobal = lazy(() => import("@/pages/zulassungen-global"));
const LaufendeZulassungen = lazy(() => import("@/pages/laufende-zulassungen"));
const SyncManager = lazy(() => import("@/pages/sync-manager"));
const GlobalSources = lazy(() => import("@/pages/global-sources"));
const NewsletterManager = lazy(() => import("@/pages/newsletter-manager"));
const HistoricalData = lazy(() => import("@/pages/historical-data"));
const AdminCustomers = lazy(() => import("@/pages/admin-customers"));
const AuditLogs = lazy(() => import("@/pages/audit-logs"));
const AIContentAnalysis = lazy(() => import("@/pages/ai-content-analysis"));
const AIInsights = lazy(() => import("@/pages/ai-insights"));
const GripIntegration = lazy(() => import("@/pages/grip-integration"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

function Router() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        {/* Admin Dashboard */}
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        
        {/* Data Management */}
        <Route path="/data-collection" component={DataCollection} />
        <Route path="/newsletter-admin" component={NewsletterAdmin} />
        <Route path="/email-management" component={EmailManagement} />
        <Route path="/knowledge-base" component={KnowledgeBase} />
        
        {/* Analytics & Reporting */}
        <Route path="/analytics" component={Analytics} />
        
        {/* Compliance & Regulation */}
        <Route path="/regulatory-updates" component={RegulatoryUpdates} />
        <Route path="/rechtsprechung" component={Rechtsprechung} />
        
        {/* Approvals & Registration */}
        <Route path="/zulassungen/global" component={ZulassungenGlobal} />
        <Route path="/zulassungen/laufende" component={LaufendeZulassungen} />
        
        {/* Advanced Features */}
        <Route path="/sync-manager" component={SyncManager} />
        <Route path="/global-sources" component={GlobalSources} />
        <Route path="/newsletter-manager" component={NewsletterManager} />
        <Route path="/historical-data" component={HistoricalData} />
        <Route path="/admin-customers" component={AdminCustomers} />
        <Route path="/user-management" component={UserManagement} />
        <Route path="/administration" component={Administration} />
        <Route path="/audit-logs" component={AuditLogs} />
        
        {/* AI Features */}
        <Route path="/ai-content-analysis" component={AIContentAnalysis} />
        <Route path="/ki-insights" component={AIInsights} />
        <Route path="/grip-integration" component={GripIntegration} />
        
        {/* Fallback */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <LanguageProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Login />
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
          <DashboardProvider>
            <TooltipProvider>
              <Toaster />
            <Switch>
              {/* Customer Portal - Multi-Tenant */}
              <Route path="/customer-dashboard">
                <CustomerThemeProvider>
                  <Suspense fallback={<LoadingFallback />}>
                    <CustomerRouter />
                  </Suspense>
                </CustomerThemeProvider>
              </Route>
              <Route path="/customer/*">
                <CustomerThemeProvider>
                  <Suspense fallback={<LoadingFallback />}>
                    <CustomerRouter />
                  </Suspense>
                </CustomerThemeProvider>
              </Route>
              <Route path="/tenant/*">
                <CustomerThemeProvider>
                  <Suspense fallback={<LoadingFallback />}>
                    <CustomerRouter />
                  </Suspense>
                </CustomerThemeProvider>
              </Route>
              
              {/* Admin Pages with Sidebar - ONLY for admin routes */}
              <Route path="/(:path*)?" nest>
                {(params) => {
                  const path = (params as any).path || '';
                  // Only render admin layout for admin paths
                  const isAdminPath = [
                    '', 'dashboard', 'data-collection', 'newsletter-admin', 'email-management', 
                    'knowledge-base', 'analytics', 'regulatory-updates', 'rechtsprechung', 
                    'zulassungen', 'sync-manager', 'global-sources', 'newsletter-manager', 
                    'historical-data', 'admin-customers', 'user-management', 'administration', 
                    'audit-logs', 'ai-content-analysis', 'ki-insights', 'grip-integration'
                  ].some(adminPath => path.startsWith(adminPath));
                  
                  return isAdminPath ? (
                    <ResponsiveLayout>
                      <Router />
                    </ResponsiveLayout>
                  ) : (
                    <NotFound />
                  );
                }}
              </Route>
            </Switch>
          </TooltipProvider>
          </DashboardProvider>
        </QueryClientProvider>
      </LanguageProvider>
    </ErrorBoundary>
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