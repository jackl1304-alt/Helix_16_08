/**
 * Advanced Caching Strategies
 * Basierend auf Optimierungsbericht für bessere Performance
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class AdvancedCache<T = any> {
  private cache = new Map<string, CacheItem<T>>();
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize = 100, defaultTTL = 300000) { // 5 minutes default
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);

    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = Array.from(this.cache.keys())[0];
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  getStats() {
    const now = Date.now();
    const items = Array.from(this.cache.values());
    const expired = items.filter(item => now > item.expiresAt).length;
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      expired,
      valid: this.cache.size - expired,
      utilization: (this.cache.size / this.maxSize) * 100
    };
  }
}

// Global cache instances
export const apiCache = new AdvancedCache(200, 300000); // 5 minutes
export const imageCache = new AdvancedCache(50, 1800000); // 30 minutes
export const staticCache = new AdvancedCache(100, 3600000); // 1 hour

// Cache-aware fetch function
export const cachedFetch = async <T>(
  url: string,
  options?: RequestInit,
  cacheKey?: string,
  ttl?: number
): Promise<T> => {
  const key = cacheKey || url;
  
  // Check cache first
  const cached = apiCache.get(key);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    apiCache.set(key, data, ttl);
    return data;
  } catch (error) {
    console.error('Cached fetch failed:', error);
    throw error;
  }
};

// Browser storage utilities
export const browserStorage = {
  // LocalStorage with expiration
  setWithExpiry: (key: string, value: any, ttl: number) => {
    const item = {
      data: value,
      expiresAt: Date.now() + ttl
    };
    try {
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.warn('LocalStorage failed:', error);
    }
  },

  getWithExpiry: <T>(key: string): T | null => {
    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return null;

      const item = JSON.parse(itemStr);
      if (Date.now() > item.expiresAt) {
        localStorage.removeItem(key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.warn('LocalStorage read failed:', error);
      return null;
    }
  },

  // SessionStorage wrapper
  session: {
    set: (key: string, value: any) => {
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn('SessionStorage failed:', error);
      }
    },

    get: <T>(key: string): T | null => {
      try {
        const item = sessionStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (error) {
        console.warn('SessionStorage read failed:', error);
        return null;
      }
    }
  }
};

// Service Worker cache management
export const swCache = {
  register: async () => {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      try {
        await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.warn('Service Worker registration failed:', error);
      }
    }
  },

  update: async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
      }
    }
  }
};

// Periodic cache cleanup
setInterval(() => {
  apiCache.cleanup();
  imageCache.cleanup();
  staticCache.cleanup();
}, 60000); // Every minute

// Development cache stats
if (import.meta.env.DEV) {
  (window as any).cacheStats = () => {
    console.group('📦 Cache Statistics');
    console.log('API Cache:', apiCache.getStats());
    console.log('Image Cache:', imageCache.getStats());
    console.log('Static Cache:', staticCache.getStats());
    console.groupEnd();
  };
}