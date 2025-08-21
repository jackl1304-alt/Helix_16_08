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
    // Multi-tenant routing: /tenant/:tenantId/*
    if (location.includes('/tenant/') && params.tenantId) {
      // Extract the route part after tenant ID
      const urlParts = location.split('/');
      const tenantIndex = urlParts.indexOf('tenant');
      const routeParts = urlParts.slice(tenantIndex + 2); // Skip 'tenant' and tenantId
      const route = routeParts.join('/');
      
      switch (route) {
        case "":
        case "dashboard":
        case "customer-dashboard":
          return <CustomerDashboard />;
        case "regulatory-updates":
        case "customer/regulatory-updates":
          return <CustomerRegulatoryUpdates />;
        case "ai-insights":
        case "customer-ai-insights":
          return <CustomerAIInsightsClean />;
        case "settings":
        case "customer-settings":
          return <CustomerSettings />;
        case "legal-cases":
          return <CustomerDashboard />; // Placeholder
        case "knowledge-base":
          return <CustomerDashboard />; // Placeholder
        case "newsletters":
          return <CustomerDashboard />; // Placeholder
        case "analytics":
          return <CustomerDashboard />; // Placeholder
        case "advanced-analytics":
          return <CustomerDashboard />; // Placeholder
        case "global-sources":
          return <CustomerDashboard />; // Placeholder
        case "data-collection":
          return <CustomerDashboard />; // Placeholder
        case "historical-data":
          return <CustomerDashboard />; // Placeholder
        default:
          return <CustomerDashboard />;
      }
    }

    // Legacy customer routes (fallback for old URLs)
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