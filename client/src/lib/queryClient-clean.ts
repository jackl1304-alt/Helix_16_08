import { QueryClient } from "@tanstack/react-query";

// Clean Query Client mit sauberer JSON-API Kommunikation
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 Minuten
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Einfache Fetch-Funktion für JSON-APIs
export async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} - ${response.statusText}`);
  }

  // Stellen Sie sicher, dass wir JSON erhalten
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error(`Expected JSON response, got ${contentType}`);
  }

  const data = await response.json();
  return data;
}

// API-Endpunkte
export const API_ENDPOINTS = {
  regulatory_updates: "/api/regulatory-updates",
  legal_cases: "/api/legal-cases", 
  data_sources: "/api/data-sources",
  newsletter_sources: "/api/newsletter-sources",
  dashboard_stats: "/api/dashboard/stats",
  knowledge_base: "/api/knowledge-base",
  ai_insights: "/api/ai-insights",
  health: "/api/health"
} as const;