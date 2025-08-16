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
        
        {/* Admin Pages */}
        <Route path="/data-collection" component={DataCollection} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/regulatory-updates" component={RegulatoryUpdates} />
        <Route path="/administration" component={Administration} />
        <Route path="/user-management" component={UserManagement} />
        
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
              
              {/* Admin Pages with Sidebar */}
              <Route>
                <ResponsiveLayout>
                  <Router />
                </ResponsiveLayout>
              </Route>
            </Switch>
          </TooltipProvider>
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