import { useState, useEffect } from "react";
import { Router, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "@/lib/queryClient";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Login from "@/pages/login";

// Direct imports - no lazy loading to eliminate Suspense issues
import Dashboard from "@/pages/dashboard";
import RegulatoryUpdates from "@/pages/regulatory-updates";
import KnowledgeBase from "@/pages/knowledge-base";
import Analytics from "@/pages/analytics";
import GlobalSources from "@/pages/global-sources";
import HistoricalData from "@/pages/historical-data";
import SystemSettings from "@/pages/system-settings";
import NotFound from "@/pages/not-found";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Initialize authentication
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check authentication
        const authStatus = localStorage.getItem('isAuthenticated') === 'true';
        setIsAuthenticated(authStatus);
      } catch (error) {
        console.error('App initialization error:', error);
        setIsAuthenticated(false);
      }
    };

    initializeApp();
  }, []);

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading Helix Platform...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (isAuthenticated === false) {
    return <Login />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <div className="min-h-screen bg-gray-50">
          <Toaster />
          <Router>
            <Route path="/" component={Dashboard} />
            <Route path="/regulatory-updates" component={RegulatoryUpdates} />
            <Route path="/knowledge-base" component={KnowledgeBase} />
            <Route path="/analytics" component={Analytics} />
            <Route path="/global-sources" component={GlobalSources} />
            <Route path="/historical-data" component={HistoricalData} />
            <Route path="/system-settings" component={SystemSettings} />
            <Route path="/data-collection" component={GlobalSources} />
            <Route path="/newsletter-manager" component={GlobalSources} />
            <Route path="/legal-cases" component={HistoricalData} />
            <Route path="/user-management" component={SystemSettings} />
            <Route path="/audit-logs" component={SystemSettings} />
            <Route path="/newsletter-admin" component={GlobalSources} />
            <Route path="/email-management" component={SystemSettings} />
            <Route path="/rechtsprechung" component={HistoricalData} />
            <Route path="/zulassungen/global" component={GlobalSources} />
            <Route path="/zulassungen/laufende" component={GlobalSources} />
            <Route path="/sync-manager" component={SystemSettings} />
            <Route path="/admin-customers" component={SystemSettings} />
            <Route path="/administration" component={SystemSettings} />
            <Route path="/ai-content-analysis" component={Analytics} />
            <Route path="/ki-insights" component={Analytics} />
            <Route path="/grip-integration" component={GlobalSources} />
            <Route path="/intelligent-search" component={GlobalSources} />
            <Route path="/customer-area" component={SystemSettings} />
            <Route component={NotFound} />
          </Router>
        </div>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;