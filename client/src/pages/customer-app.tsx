import React, { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CustomerProvider, useCustomer } from "@/contexts/CustomerContext";
import CustomerLogin from "@/pages/customer-login";
import NotFound from "@/pages/not-found";

// Customer Pages (lazy loaded)
const CustomerArea = React.lazy(() => import("@/pages/customer-area"));
const CustomerSettings = React.lazy(() => import("@/pages/customer-settings"));

function CustomerAppContent() {
  const { customer, isAuthenticated, login } = useCustomer();

  if (!isAuthenticated) {
    return <CustomerLogin onLogin={login} />;
  }

  return (
    <React.Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <Switch>
        <Route path="/customer-area" component={CustomerArea} />
        <Route path="/customer-area/settings" component={CustomerSettings} />
        <Route path="/customer-area/:rest*">
          {(params: { rest?: string }) => (
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">
                {params.rest} - Coming Soon
              </h1>
              <p className="text-gray-600">
                Diese Seite ist für Ihr Abonnement ({customer?.subscription}) verfügbar 
                und wird bald implementiert.
              </p>
            </div>
          )}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </React.Suspense>
  );
}

export default function CustomerApp() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <CustomerProvider>
            <TooltipProvider>
              <Toaster />
              <CustomerAppContent />
            </TooltipProvider>
          </CustomerProvider>
        </QueryClientProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}