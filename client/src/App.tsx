import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import DataCollection from "@/pages/data-collection";
import GlobalSources from "@/pages/global-sources";
import RegulatoryUpdates from "@/pages/regulatory-updates";
import NewsletterManager from "@/pages/newsletter-manager";
import ApprovalWorkflow from "@/pages/approval-workflow";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/data-collection" component={DataCollection} />
      <Route path="/global-sources" component={GlobalSources} />
      <Route path="/regulatory-updates" component={RegulatoryUpdates} />
      <Route path="/newsletter-manager" component={NewsletterManager} />
      <Route path="/approval-workflow" component={ApprovalWorkflow} />
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
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
