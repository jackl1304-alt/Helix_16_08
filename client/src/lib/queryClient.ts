import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { createCacheKey } from "@/utils/performance";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  url: string,
  method: string,
  data?: unknown | undefined,
): Promise<any> {
  const options: RequestInit = {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    credentials: "include",
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const res = await fetch(url, options);

  await throwIfResNotOk(res);
  
  // Return JSON if response has content, otherwise return empty object
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await res.json();
  }
  return {};
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Use custom queryFn for better error handling
      queryFn: async ({ queryKey }) => {
        console.log(`[QUERY CLIENT] Fetching: ${queryKey.join("/")}`);
        const response = await fetch(queryKey.join("/") as string, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: "include",
        });

        console.log(`[QUERY CLIENT] Response status: ${response.status} for ${queryKey.join("/")}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[QUERY CLIENT] Error: ${response.status} - ${errorText}`);
          throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
        }

        const data = await response.json();
        console.log(`[QUERY CLIENT] Success: ${typeof data} data for ${queryKey.join("/")}`);
        return data;
      },
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30 seconds for live updates
      gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
      retry: (failureCount, error) => {
        console.log(`[QUERY CLIENT] Retry ${failureCount} for error:`, error);
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => {
        const delay = Math.min(1000 * 2 ** attemptIndex, 5000);
        console.log(`[QUERY CLIENT] Retry delay: ${delay}ms`);
        return delay;
      },
    },
    mutations: {
      retry: 2,
    },
  },
});
