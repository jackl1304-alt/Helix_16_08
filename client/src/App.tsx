import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Router, Route, Switch } from "wouter";
import { ResponsiveLayout } from "@/components/responsive-layout";
import { LanguageProvider } from "@/contexts/LanguageContext";
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
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <div className="min-h-screen bg-gray-50">
            <Toaster />
            <Login onLogin={login} />
          </div>
        </QueryClientProvider>
      </LanguageProvider>
    );
  }

  // Main app with proper wouter routing
  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Toaster />
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/regulatory-updates" component={RegulatoryUpdates} />
            <Route path="/analytics">{() => <ResponsiveLayout><div className="p-6"><h1 className="text-2xl font-bold">Analytics</h1><p>Analytics wird hier implementiert.</p></div></ResponsiveLayout>}</Route>
            <Route path="/data-collection">{() => <ResponsiveLayout><div className="p-6"><h1 className="text-2xl font-bold">Data Collection</h1><p>Data Collection wird hier implementiert.</p></div></ResponsiveLayout>}</Route>
            <Route path="/knowledge-base">{() => <ResponsiveLayout><div className="p-6"><h1 className="text-2xl font-bold">Knowledge Base</h1><p>Knowledge Base wird hier implementiert.</p></div></ResponsiveLayout>}</Route>
            <Route path="/user-management">{() => <ResponsiveLayout><div className="p-6"><h1 className="text-2xl font-bold">User Management</h1><p>User Management wird hier implementiert.</p></div></ResponsiveLayout>}</Route>
            <Route path="/system-settings">{() => <ResponsiveLayout><div className="p-6"><h1 className="text-2xl font-bold">System Settings</h1><p>System Settings wird hier implementiert.</p></div></ResponsiveLayout>}</Route>
            <Route component={NotFound} />
          </Switch>
        </Router>
      </QueryClientProvider>
    </LanguageProvider>
  );
}

export default App;