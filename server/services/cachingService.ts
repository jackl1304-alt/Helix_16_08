import { Logger } from './logger.service';

const logger = new Logger('CachingService');

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * In-memory caching service for API responses and database queries
 * Implements TTL-based expiration and memory-efficient storage
 */
export class CachingService {
  private static instance: CachingService;
  private cache = new Map<string, CacheEntry<any>>();
  private readonly maxCacheSize = 1000; // Prevent memory overflow
  private cleanupInterval: NodeJS.Timeout;

  private constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredEntries();
    }, 5 * 60 * 1000);

    logger.info('Caching service initialized', { maxCacheSize: this.maxCacheSize });
  }

  static getInstance(): CachingService {
    if (!CachingService.instance) {
      CachingService.instance = new CachingService();
    }
    return CachingService.instance;
  }

  /**
   * Get cached data if valid and not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      logger.debug('Cache entry expired and removed', { key });
      return null;
    }

    logger.debug('Cache hit', { key });
    return entry.data as T;
  }

  /**
   * Set cached data with TTL in milliseconds
   */
  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    // Prevent cache from growing too large
    if (this.cache.size >= this.maxCacheSize) {
      this.evictOldestEntries(Math.floor(this.maxCacheSize * 0.1)); // Remove 10%
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    };

    this.cache.set(key, entry);
    logger.debug('Cache entry set', { key, ttlMs, cacheSize: this.cache.size });
  }

  /**
   * Delete specific cache entry
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      logger.debug('Cache entry deleted', { key });
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    const previousSize = this.cache.size;
    this.cache.clear();
    logger.info('Cache cleared', { previousSize });
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      entries: Array.from(this.cache.keys())
    };
  }

  /**
   * Cached wrapper for async functions
   */
  async cached<T>(
    key: string, 
    asyncFn: () => Promise<T>, 
    ttlMs: number = 5 * 60 * 1000
  ): Promise<T> {
    // Try to get from cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    try {
      const result = await asyncFn();
      this.set(key, result, ttlMs);
      return result;
    } catch (error) {
      logger.error('Error in cached function execution', { key, error });
      throw error;
    }
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      logger.debug('Cleaned up expired cache entries', { 
        removedCount, 
        remainingSize: this.cache.size 
      });
    }
  }

  private evictOldestEntries(count: number): void {
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .slice(0, count);

    for (const [key] of entries) {
      this.cache.delete(key);
    }

    logger.debug('Evicted oldest cache entries', { 
      evictedCount: count, 
      remainingSize: this.cache.size 
    });
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
    logger.info('Caching service destroyed');
  }
}

export const cachingService = CachingService.getInstance();