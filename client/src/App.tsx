import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Router, Route, Switch } from "wouter";
import { ResponsiveLayout } from "@/components/responsive-layout";
import { useAuth } from "@/hooks/use-auth";
import Login from "@/pages/login";

// Direct imports - no lazy loading to eliminate Suspense issues
import Dashboard from "@/pages/dashboard";
import RegulatoryUpdates from "@/pages/regulatory-updates";
import NotFound from "@/pages/not-found";

// Hauptkomponente mit wouter-Routing
function App() {
  const { isAuthenticated, isLoading, login } = useAuth();

  // Loading state
  if (isLoading) {
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
        <div className="min-h-screen bg-gray-50">
          <Toaster />
          <Login onLogin={login} />
        </div>
      </QueryClientProvider>
    );
  }

  // Main app with proper wouter routing
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ResponsiveLayout>
          <Toaster />
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/regulatory-updates" component={RegulatoryUpdates} />
            <Route path="/analytics" component={NotFound} />
            <Route path="/data-collection" component={NotFound} />
            <Route path="/knowledge-base" component={NotFound} />
            <Route path="/user-management" component={NotFound} />
            <Route path="/system-settings" component={NotFound} />
            <Route component={NotFound} />
          </Switch>
        </ResponsiveLayout>
      </Router>
    </QueryClientProvider>
  );
}

export default App;