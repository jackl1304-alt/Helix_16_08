import { useQuery } from "@tanstack/react-query";
import { fetchApi, API_ENDPOINTS } from "@/lib/queryClient-clean";

// Hook für Regulatory Updates
export function useRegulatoryUpdates() {
  return useQuery({
    queryKey: ["regulatory-updates"],
    queryFn: () => fetchApi(API_ENDPOINTS.regulatory_updates),
  });
}

// Hook für Legal Cases  
export function useLegalCases() {
  return useQuery({
    queryKey: ["legal-cases"], 
    queryFn: () => fetchApi(API_ENDPOINTS.legal_cases),
  });
}

// Hook für Data Sources
export function useDataSources() {
  return useQuery({
    queryKey: ["data-sources"],
    queryFn: () => fetchApi(API_ENDPOINTS.data_sources),
  });
}

// Hook für Newsletter Sources
export function useNewsletterSources() {
  return useQuery({
    queryKey: ["newsletter-sources"],
    queryFn: () => fetchApi(API_ENDPOINTS.newsletter_sources),
  });
}

// Hook für Dashboard Stats
export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => fetchApi(API_ENDPOINTS.dashboard_stats),
  });
}

// Hook für Knowledge Base
export function useKnowledgeBase() {
  return useQuery({
    queryKey: ["knowledge-base"],
    queryFn: () => fetchApi(API_ENDPOINTS.knowledge_base),
  });
}

// Hook für AI Insights
export function useAiInsights() {
  return useQuery({
    queryKey: ["ai-insights"],
    queryFn: () => fetchApi(API_ENDPOINTS.ai_insights),
  });
}