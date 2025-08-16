/**
 * Query Cache Middleware for Database Performance Optimization
 * Helix Platform - Database Layer Performance Enhancement
 */

import { Request, Response, NextFunction } from 'express';

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

class QueryCache {
  private cache = new Map<string, CacheEntry>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default cache

  // Create cache key from request
  private createCacheKey(req: Request): string {
    const { method, url, query, body } = req;
    return `${method}:${url}:${JSON.stringify(query)}:${JSON.stringify(body || {})}`;
  }

  // Check if cache entry is valid
  private isValidEntry(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  // Get cached response
  get(req: Request): any | null {
    const key = this.createCacheKey(req);
    const entry = this.cache.get(key);
    
    if (entry && this.isValidEntry(entry)) {
      console.log(`[CACHE HIT] ${key}`);
      return entry.data;
    }
    
    if (entry) {
      // Entry expired, remove it
      this.cache.delete(key);
      console.log(`[CACHE EXPIRED] ${key}`);
    }
    
    return null;
  }

  // Set cached response
  set(req: Request, data: any, customTTL?: number): void {
    const key = this.createCacheKey(req);
    const ttl = customTTL || this.defaultTTL;
    
    this.cache.set(key, {
      data: JSON.parse(JSON.stringify(data)), // Deep copy to prevent mutations
      timestamp: Date.now(),
      ttl
    });
    
    console.log(`[CACHE SET] ${key} (TTL: ${ttl}ms)`);
  }

  // Clear cache
  clear(): void {
    this.cache.clear();
    console.log('[CACHE] Cache cleared');
  }

  // Clear expired entries (garbage collection)
  cleanup(): void {
    const now = Date.now();
    let removed = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (!this.isValidEntry(entry)) {
        this.cache.delete(key);
        removed++;
      }
    }
    
    if (removed > 0) {
      console.log(`[CACHE CLEANUP] Removed ${removed} expired entries`);
    }
  }

  // Get cache statistics
  getStats(): { size: number; hitRate?: number } {
    return {
      size: this.cache.size,
      // Could track hit rate if needed
    };
  }
}

// Singleton cache instance
const queryCache = new QueryCache();

// Cleanup expired entries every 10 minutes
setInterval(() => {
  queryCache.cleanup();
}, 10 * 60 * 1000);

// Cache middleware factory
export function cacheMiddleware(ttl?: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests and admin-specific routes
    if (req.method !== 'GET' || req.url.includes('/admin/user')) {
      return next();
    }

    // Check cache first
    const cachedData = queryCache.get(req);
    if (cachedData) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cachedData);
    }

    // Override res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = function(body: any) {
      // Cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        queryCache.set(req, body, ttl);
        res.setHeader('X-Cache', 'MISS');
      }
      
      return originalJson(body);
    };

    next();
  };
}

// Cache invalidation for specific endpoints
export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    queryCache.clear();
    return;
  }
  
  // Simple pattern matching for cache invalidation
  // Could be enhanced with regex patterns if needed
  console.log(`[CACHE] Invalidation pattern: ${pattern} (not implemented yet)`);
}

// Export cache instance for direct access
export { queryCache };

// Cache configuration for different endpoints - AGGRESSIVE CACHING
export const CACHE_CONFIG = {
  SHORT: 5 * 60 * 1000,         // 5 minutes (increased from 1)
  MEDIUM: 15 * 60 * 1000,       // 15 minutes (increased from 5)
  LONG: 60 * 60 * 1000,         // 60 minutes (increased from 30)
  DASHBOARD: 10 * 60 * 1000,    // 10 minutes (increased from 2) 
  ARTICLES: 30 * 60 * 1000,     // 30 minutes (increased from 10)
  REGULATORY: 15 * 60 * 1000,   // 15 minutes (increased from 5) 
};