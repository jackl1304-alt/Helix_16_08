import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import { ResponsiveLayout } from "@/components/responsive-layout";
import { performanceMonitor, preloadCriticalResources } from "@/utils/performance";
import { ErrorBoundary } from "@/components/ui/error-boundary";

// Initialize performance monitoring and preload resources
if (typeof window !== 'undefined') {
  preloadCriticalResources();
}

// Critical pages loaded immediately
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";

// Lazy load non-critical pages for better performance
const Landing = lazy(() => import("@/pages/landing"));
const DataCollection = lazy(() => import("@/pages/data-collection"));
const GlobalSources = lazy(() => import("@/pages/global-sources"));
const Analytics = lazy(() => import("@/pages/analytics"));
const RegulatoryUpdates = lazy(() => import("@/pages/regulatory-updates"));
const NewsletterManager = lazy(() => import("@/pages/newsletter-manager"));
const ApprovalWorkflow = lazy(() => import("@/pages/approval-workflow"));
const UserManagement = lazy(() => import("@/pages/user-management"));
const SystemSettings = lazy(() => import("@/pages/system-settings"));
const AuditLogs = lazy(() => import("@/pages/audit-logs"));
const AIInsights = lazy(() => import("@/pages/ai-insights"));
const KnowledgeBase = lazy(() => import("@/pages/knowledge-base"));
const EnhancedLegalCases = lazy(() => import("@/pages/enhanced-legal-cases"));

const HistoricalData = lazy(() => import("@/pages/historical-data-simple"));
const LegalCases = lazy(() => import("@/pages/legal-cases"));
const IntelligentSearch = lazy(() => import("@/pages/intelligent-search"));
const DocumentViewer = lazy(() => import("@/pages/document-viewer"));
const SyncManager = lazy(() => import("@/pages/sync-manager"));
const Phase1Integration = lazy(() => import("@/pages/phase1-integration"));
const Phase2Integration = lazy(() => import("@/pages/phase2-integration"));
const Phase3Advanced = lazy(() => import("@/pages/phase3-advanced"));
const RealTimeIntegration = lazy(() => import("@/pages/real-time-integration"));
const DataSourcesAdmin = lazy(() => import("@/pages/DataSourcesAdmin"));
const Administration = lazy(() => import("@/pages/administration"));
const GripData = lazy(() => import("@/pages/grip-data"));

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
        {/* Critical pages loaded immediately */}
        <Route path="/" component={Dashboard} />
        
        {/* Lazy-loaded pages */}
        <Route path="/data-collection" component={DataCollection} />
        <Route path="/global-sources" component={GlobalSources} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/regulatory-updates" component={RegulatoryUpdates} />
        <Route path="/sync-manager" component={SyncManager} />
        <Route path="/newsletter-manager" component={NewsletterManager} />
        <Route path="/approval-workflow" component={ApprovalWorkflow} />
        <Route path="/user-management" component={UserManagement} />
        <Route path="/system-settings" component={SystemSettings} />
        <Route path="/audit-logs" component={AuditLogs} />
        <Route path="/ai-insights" component={AIInsights} />
        <Route path="/knowledge-base" component={KnowledgeBase} />
        <Route path="/enhanced-legal-cases" component={EnhancedLegalCases} />
        <Route path="/historical-data" component={HistoricalData} />
        <Route path="/legal-cases" component={LegalCases} />
        <Route path="/intelligent-search" component={IntelligentSearch} />

        <Route path="/phase1-integration" component={Phase1Integration} />
        <Route path="/phase2-integration" component={Phase2Integration} />
        <Route path="/phase3-advanced" component={Phase3Advanced} />
        <Route path="/real-time-integration" component={RealTimeIntegration} />
        <Route path="/administration/data-sources" component={DataSourcesAdmin} />
        <Route path="/administration" component={Administration} />
        <Route path="/grip-data" component={GripData} />
        <Route path="/documents/:sourceType/:documentId" component={DocumentViewer} />
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Switch>
            {/* Pages without Sidebar */}
            <Route path="/landing" component={Landing} />
            <Route path="/404" component={NotFound} />
            
            {/* All other pages with Sidebar */}
            <Route>
              <ResponsiveLayout>
                <Router />
              </ResponsiveLayout>
            </Route>
          </Switch>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
