import { useLocation, useParams } from "wouter";
import { lazy, Suspense } from "react";

// Lazy load components to avoid circular dependencies
const CustomerDashboard = lazy(() => import("@/pages/customer-dashboard"));
const CustomerSettings = lazy(() => import("@/pages/customer-settings"));
const CustomerAIInsightsClean = lazy(() => import("@/pages/customer-ai-insights-clean"));
const CustomerRegulatoryUpdates = lazy(() => import("@/pages/customer-regulatory-updates"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

export default function CustomerRouter() {
  const [location] = useLocation();
  const params = useParams();

  const renderComponent = () => {
    // Check if it's a tenant-specific route
    if (location.includes('/tenant/')) {
      // Extract the route part after tenant ID
      const routePart = location.split('/').slice(3).join('/'); // Get everything after /tenant/:id
      
      switch (routePart) {
        case "customer-dashboard":
          return <CustomerDashboard />;
        case "customer/regulatory-updates":
          return <CustomerRegulatoryUpdates />;
        case "customer-ai-insights":
          return <CustomerAIInsightsClean />;
        case "customer-settings":
          return <CustomerSettings />;
        default:
          return <CustomerDashboard />;
      }
    }

    // Standard customer routes (non-tenant specific)
    switch (location) {
      case "/customer-dashboard":
        return <CustomerDashboard />;
      case "/customer-settings":
        return <CustomerSettings />;
      case "/customer-ai-insights":
        return <CustomerAIInsightsClean />;
      case "/customer/regulatory-updates":
        return <CustomerRegulatoryUpdates />;
      case "/customer/legal-cases":
        return <CustomerDashboard />; // Placeholder
      case "/customer/knowledge-base":
        return <CustomerDashboard />; // Placeholder
      case "/customer/newsletters":
        return <CustomerDashboard />; // Placeholder
      case "/customer/analytics":
        return <CustomerDashboard />; // Placeholder
      case "/customer/advanced-analytics":
        return <CustomerDashboard />; // Placeholder
      case "/customer/global-sources":
        return <CustomerDashboard />; // Placeholder
      case "/customer/data-collection":
        return <CustomerDashboard />; // Placeholder
      case "/customer/historical-data":
        return <CustomerDashboard />; // Placeholder
      default:
        return <CustomerDashboard />;
    }
  };

  return (
    <Suspense fallback={<LoadingFallback />}>
      {renderComponent()}
    </Suspense>
  );
}