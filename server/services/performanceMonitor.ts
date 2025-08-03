import { Logger } from './logger.service';
import { cachingService } from './cachingService';

const logger = new Logger('PerformanceMonitor');

interface PerformanceMetrics {
  endpoint: string;
  method: string;
  duration: number;
  statusCode: number;
  timestamp: Date;
  cacheHit?: boolean;
  memoryUsage?: number;
}

/**
 * Production-ready performance monitoring service
 * Tracks API response times, cache effectiveness, and system health
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private readonly maxMetricsHistory = 1000;

  private constructor() {
    // Clean up old metrics every 10 minutes
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 10 * 60 * 1000);
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Track API endpoint performance
   */
  trackApiCall(
    endpoint: string,
    method: string,
    duration: number,
    statusCode: number,
    cacheHit: boolean = false
  ): void {
    const metric: PerformanceMetrics = {
      endpoint,
      method,
      duration,
      statusCode,
      timestamp: new Date(),
      cacheHit,
      memoryUsage: this.getMemoryUsage()
    };

    this.metrics.push(metric);

    // Log slow requests
    if (duration > 2000) {
      logger.warn('Slow API request detected', {
        endpoint,
        method,
        duration,
        statusCode,
        cacheHit
      });
    }

    // Keep metrics array manageable
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }
  }

  /**
   * Get performance statistics for the last N minutes
   */
  getPerformanceStats(lastMinutes: number = 60) {
    const cutoffTime = new Date(Date.now() - lastMinutes * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp > cutoffTime);

    if (recentMetrics.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        cacheHitRate: 0,
        errorRate: 0,
        slowRequestCount: 0,
        endpoints: {}
      };
    }

    const totalRequests = recentMetrics.length;
    const averageResponseTime = recentMetrics.reduce((sum, m) => sum + m.duration, 0) / totalRequests;
    const cacheHits = recentMetrics.filter(m => m.cacheHit).length;
    const cacheHitRate = (cacheHits / totalRequests) * 100;
    const errors = recentMetrics.filter(m => m.statusCode >= 400).length;
    const errorRate = (errors / totalRequests) * 100;
    const slowRequestCount = recentMetrics.filter(m => m.duration > 2000).length;

    // Group by endpoint
    const endpointStats = recentMetrics.reduce((acc, metric) => {
      if (!acc[metric.endpoint]) {
        acc[metric.endpoint] = {
          count: 0,
          totalDuration: 0,
          errors: 0,
          cacheHits: 0
        };
      }
      acc[metric.endpoint].count++;
      acc[metric.endpoint].totalDuration += metric.duration;
      if (metric.statusCode >= 400) acc[metric.endpoint].errors++;
      if (metric.cacheHit) acc[metric.endpoint].cacheHits++;
      return acc;
    }, {} as Record<string, any>);

    // Calculate averages for each endpoint
    const endpoints = Object.entries(endpointStats).reduce((acc, [endpoint, stats]: [string, any]) => {
      acc[endpoint] = {
        count: stats.count,
        averageResponseTime: Math.round(stats.totalDuration / stats.count),
        errorRate: Math.round((stats.errors / stats.count) * 100),
        cacheHitRate: Math.round((stats.cacheHits / stats.count) * 100)
      };
      return acc;
    }, {} as Record<string, any>);

    return {
      totalRequests,
      averageResponseTime: Math.round(averageResponseTime),
      cacheHitRate: Math.round(cacheHitRate),
      errorRate: Math.round(errorRate),
      slowRequestCount,
      currentMemoryUsage: this.getMemoryUsage(),
      endpoints
    };
  }

  /**
   * Get system health summary
   */
  getHealthSummary() {
    const stats = this.getPerformanceStats(15); // Last 15 minutes
    const cacheStats = cachingService.getStats();
    
    let healthScore = 100;
    const issues: string[] = [];

    // Deduct points for performance issues
    if (stats.averageResponseTime > 1000) {
      healthScore -= 20;
      issues.push('High average response time');
    }
    
    if (stats.errorRate > 5) {
      healthScore -= 25;
      issues.push('High error rate');
    }
    
    if (stats.slowRequestCount > 0) {
      healthScore -= 10;
      issues.push('Slow requests detected');
    }
    
    if (cacheStats.size > cacheStats.maxSize * 0.9) {
      healthScore -= 5;
      issues.push('Cache nearly full');
    }

    const memoryUsage = this.getMemoryUsage();
    if (memoryUsage > 80) {
      healthScore -= 15;
      issues.push('High memory usage');
    }

    return {
      healthScore: Math.max(0, healthScore),
      status: healthScore >= 90 ? 'excellent' : 
              healthScore >= 70 ? 'good' : 
              healthScore >= 50 ? 'fair' : 'poor',
      issues,
      performance: stats,
      cache: cacheStats,
      uptime: process.uptime(),
      memoryUsage
    };
  }

  /**
   * Create Express middleware for automatic performance tracking
   */
  createMiddleware() {
    return (req: any, res: any, next: any) => {
      const startTime = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        const cacheHit = res.getHeader('X-Cache-Hit') === 'true';
        
        this.trackApiCall(
          req.path,
          req.method,
          duration,
          res.statusCode,
          cacheHit
        );
      });
      
      next();
    };
  }

  private getMemoryUsage(): number {
    const usage = process.memoryUsage();
    return Math.round((usage.heapUsed / usage.heapTotal) * 100);
  }

  private cleanupOldMetrics(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const initialCount = this.metrics.length;
    this.metrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
    
    const cleaned = initialCount - this.metrics.length;
    if (cleaned > 0) {
      logger.debug('Cleaned up old performance metrics', { 
        cleaned, 
        remaining: this.metrics.length 
      });
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();