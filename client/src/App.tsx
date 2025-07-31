import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import DataCollection from "@/pages/data-collection";
import GlobalSources from "@/pages/global-sources";
import Analytics from "@/pages/analytics";
import RegulatoryUpdates from "@/pages/regulatory-updates";
import NewsletterManager from "@/pages/newsletter-manager";
import ApprovalWorkflow from "@/pages/approval-workflow";
import UserManagement from "@/pages/user-management";
import SystemSettings from "@/pages/system-settings";
import AuditLogs from "@/pages/audit-logs";
import AIInsights from "@/pages/ai-insights";
import KnowledgeBase from "@/pages/knowledge-base";
import AIApprovalDemo from "@/pages/ai-approval-demo";
import HistoricalData from "@/pages/historical-data-simple";
import LegalCases from "@/pages/legal-cases";
import IntelligentSearch from "@/pages/intelligent-search";
import DocumentViewer from "@/pages/document-viewer";
import SyncManager from "@/pages/sync-manager";
import Phase1Integration from "@/pages/phase1-integration";
import Phase2Integration from "@/pages/phase2-integration";
import Phase3Advanced from "@/pages/phase3-advanced";
import { ResponsiveLayout } from "@/components/responsive-layout";

function Router() {
  return (
    <Switch>
      {/* Pages with Sidebar */}
      <Route path="/" component={Dashboard} />
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
      <Route path="/historical-data" component={HistoricalData} />
      <Route path="/legal-cases" component={LegalCases} />
      <Route path="/intelligent-search" component={IntelligentSearch} />
      <Route path="/ai-approval-demo" component={AIApprovalDemo} />
      <Route path="/phase1-integration" component={Phase1Integration} />
      <Route path="/phase2-integration" component={Phase2Integration} />
      <Route path="/phase3-advanced" component={Phase3Advanced} />
      <Route path="/documents/:sourceType/:documentId" component={DocumentViewer} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
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
  );
}

export default App;
