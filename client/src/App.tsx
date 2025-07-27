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
import HistoricalData from "@/pages/historical-data";
import LegalCases from "@/pages/legal-cases";
import { ResponsiveLayout } from "@/components/responsive-layout";

function Router() {
  return (
    <Switch>
      {/* Pages without Sidebar */}
      <Route path="/landing">
        <Landing />
      </Route>
      <Route path="/404">
        <NotFound />
      </Route>
      
      {/* Pages with Sidebar */}
      <Route>
        <ResponsiveLayout>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/data-collection" component={DataCollection} />
            <Route path="/global-sources" component={GlobalSources} />
            <Route path="/analytics" component={Analytics} />
            <Route path="/regulatory-updates" component={RegulatoryUpdates} />
            <Route path="/newsletter-manager" component={NewsletterManager} />
            <Route path="/approval-workflow" component={ApprovalWorkflow} />
            <Route path="/user-management" component={UserManagement} />
            <Route path="/system-settings" component={SystemSettings} />
            <Route path="/audit-logs" component={AuditLogs} />
            <Route path="/ai-insights" component={AIInsights} />
            <Route path="/knowledge-base" component={KnowledgeBase} />
            <Route path="/historical-data" component={HistoricalData} />
            <Route path="/legal-cases" component={LegalCases} />
            {/* Fallback to 404 */}
            <Route component={() => <NotFound />} />
          </Switch>
        </ResponsiveLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
