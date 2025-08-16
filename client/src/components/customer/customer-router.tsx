import { useLocation, useParams } from "wouter";
import { lazy, Suspense, useState, useEffect } from "react";

// Lazy load customer components with proper error handling
const CustomerDashboard = lazy(() => import("@/pages/customer-dashboard"));
const CustomerSettings = lazy(() => import("@/pages/customer-settings"));
const CustomerAIInsights = lazy(() => import("@/pages/customer-ai-insights-clean"));
const CustomerRegulatoryUpdates = lazy(() => import("@/pages/customer-regulatory-updates"));
const CustomerLegalCases = lazy(() => import("@/pages/customer-legal-cases"));
const CustomerKnowledgeBase = lazy(() => import("@/pages/customer-knowledge-base"));
const CustomerNewsletters = lazy(() => import("@/pages/customer-newsletters"));
const CustomerAnalytics = lazy(() => import("@/pages/customer-analytics"));

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
          return <CustomerAIInsights />;
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
        return <CustomerAIInsights />;
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