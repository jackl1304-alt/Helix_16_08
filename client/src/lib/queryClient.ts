import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { createCacheKey } from "@/utils/performance";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// FIXED: Robust API request function with proper error handling
export async function apiRequest(
  url: string,
  method: string = 'GET',
  data?: any
): Promise<any> {
  console.log(`[API] ${method} ${url}`, data);
  
  const requestOptions: RequestInit = {
    method: method.toUpperCase(),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: "include",
  };
  
  // Add body for POST, PUT, PATCH requests
  if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && data) {
    requestOptions.body = JSON.stringify(data);
    console.log(`[API] Request body:`, requestOptions.body);
  }
  
  try {
    const response = await fetch(url, requestOptions);
    console.log(`[API] Response ${response.status} for ${url}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] Error ${response.status}: ${errorText}`);
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
    }
    
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const result = await response.json();
      console.log(`[API] Success:`, result);
      return result;
    }
    
    console.log(`[API] Non-JSON response for ${url}`);
    return {};
  } catch (error) {
    console.error(`[API] Fetch error for ${method} ${url}:`, error);
    throw error;
  }
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
        let url = queryKey[0] as string;
        const params = queryKey[1] as Record<string, any> || {};
        
        // Build query string from parameters
        if (Object.keys(params).length > 0) {
          const searchParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              searchParams.append(key, String(value));
            }
          });
          url += `?${searchParams.toString()}`;
        }
        
        console.log(`[QUERY CLIENT] Fetching: ${url}`);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: "include",
        });

        console.log(`[QUERY CLIENT] Response status: ${response.status} for ${url}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[QUERY CLIENT] Error: ${response.status} - ${errorText}`);
          throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
        }

        const data = await response.json();
        console.log(`[QUERY CLIENT] Success: ${typeof data} data for ${url}`);
        return data;
      },
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes for better performance
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
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
