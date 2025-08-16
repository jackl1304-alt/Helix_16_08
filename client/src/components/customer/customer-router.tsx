import { useLocation, useParams } from "wouter";
import { lazy, Suspense, useState, useEffect } from "react";

// Lazy load components with better error handling
const CustomerDashboard = lazy(() => import("@/pages/customer-dashboard").catch(err => {
  console.error('Failed to load CustomerDashboard:', err);
  return { default: () => <div>Error loading dashboard</div> };
}));
const CustomerSettings = lazy(() => import("@/pages/customer-settings").catch(err => {
  console.error('Failed to load CustomerSettings:', err);
  return { default: () => <div>Error loading settings</div> };
}));
const CustomerAIInsightsClean = lazy(() => import("@/pages/customer-ai-insights-clean").catch(err => {
  console.error('Failed to load CustomerAIInsightsClean:', err);
  return { default: () => <div>Error loading AI insights</div> };
}));
const CustomerRegulatoryUpdates = lazy(() => import("@/pages/customer-regulatory-updates").catch(err => {
  console.error('Failed to load CustomerRegulatoryUpdates:', err);
  return { default: () => <div>Error loading regulatory updates</div> };
}));
const CustomerLegalCases = lazy(() => import("@/pages/customer-legal-cases").catch(err => {
  console.error('Failed to load CustomerLegalCases:', err);
  return { default: () => <div>Error loading legal cases</div> };
}));
const CustomerKnowledgeBase = lazy(() => import("@/pages/customer-knowledge-base").catch(err => {
  console.error('Failed to load CustomerKnowledgeBase:', err);
  return { default: () => <div>Error loading knowledge base</div> };
}));
const CustomerNewsletters = lazy(() => import("@/pages/customer-newsletters").catch(err => {
  console.error('Failed to load CustomerNewsletters:', err);
  return { default: () => <div>Error loading newsletters</div> };
}));
const CustomerAnalytics = lazy(() => import("@/pages/customer-analytics").catch(err => {
  console.error('Failed to load CustomerAnalytics:', err);
  return { default: () => <div>Error loading analytics</div> };
}));
const CustomerGlobalSources = lazy(() => import("@/pages/customer-global-sources").catch(err => {
  console.error('Failed to load CustomerGlobalSources:', err);
  return { default: () => <div>Error loading global sources</div> };
}));
const CustomerDataCollection = lazy(() => import("@/pages/customer-data-collection").catch(err => {
  console.error('Failed to load CustomerDataCollection:', err);
  return { default: () => <div>Error loading data collection</div> };
}));
const CustomerHistoricalData = lazy(() => import("@/pages/customer-historical-data").catch(err => {
  console.error('Failed to load CustomerHistoricalData:', err);
  return { default: () => <div>Error loading historical data</div> };
}));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Customer Portal wird geladen...</p>
    </div>
  </div>
);

export default function CustomerRouter() {
  const [location] = useLocation();
  const params = useParams();
  const [isReady, setIsReady] = useState(false);

  // Delay rendering to avoid Suspense conflicts
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return <LoadingFallback />;
  }

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
          return <CustomerLegalCases />;
        case "knowledge-base":
          return <CustomerKnowledgeBase />;
        case "newsletters":
          return <CustomerNewsletters />;
        case "analytics":
          return <CustomerAnalytics />;
        case "advanced-analytics":
          return <CustomerAnalytics />;
        case "global-sources":
          return <CustomerGlobalSources />;
        case "data-collection":
          return <CustomerDataCollection />;
        case "historical-data":
          return <CustomerHistoricalData />;
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
        return <CustomerLegalCases />;
      case "/customer/knowledge-base":
        return <CustomerKnowledgeBase />;
      case "/customer/newsletters":
        return <CustomerNewsletters />;
      case "/customer/analytics":
        return <CustomerAnalytics />;
      case "/customer/advanced-analytics":
        return <CustomerAnalytics />;
      case "/customer/global-sources":
        return <CustomerGlobalSources />;
      case "/customer/data-collection":
        return <CustomerDataCollection />;
      case "/customer/historical-data":
        return <CustomerHistoricalData />;
      default:
        return <CustomerDashboard />;
    }
  };

  // Remove double Suspense wrapping to prevent conflicts
  return renderComponent();
}