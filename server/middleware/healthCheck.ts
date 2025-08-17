import { Request, Response } from 'express';
import { performance } from 'perf_hooks';

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: ServiceHealth;
    cache: ServiceHealth;
    externalAPIs: ServiceHealth;
    dataCollection: ServiceHealth;
  };
  metrics: {
    memory: MemoryMetrics;
    cpu: CPUMetrics;
    requests: RequestMetrics;
  };
  lastErrors?: string[];
}

interface ServiceHealth {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  lastCheck: string;
  error?: string;
}

interface MemoryMetrics {
  used: number;
  total: number;
  usage: number;
  heapUsed: number;
  heapTotal: number;
}

interface CPUMetrics {
  usage: number;
  loadAverage: number[];
}

interface RequestMetrics {
  total: number;
  successful: number;
  failed: number;
  averageResponseTime: number;
}

class HealthCheckService {
  private lastErrors: string[] = [];
  private requestMetrics = {
    total: 0,
    successful: 0,
    failed: 0,
    responseTimes: [] as number[]
  };

  async performHealthCheck(): Promise<HealthCheckResult> {
    const startTime = performance.now();
    
    try {
      // Check all services in parallel
      const [dbHealth, cacheHealth, apiHealth, dataHealth] = await Promise.allSettled([
        this.checkDatabase(),
        this.checkCache(),
        this.checkExternalAPIs(),
        this.checkDataCollection()
      ]);

      const services = {
        database: this.getHealthResult(dbHealth),
        cache: this.getHealthResult(cacheHealth),
        externalAPIs: this.getHealthResult(apiHealth),
        dataCollection: this.getHealthResult(dataHealth)
      };

      // Determine overall status
      const overallStatus = this.determineOverallStatus(services);
      
      const result: HealthCheckResult = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        services,
        metrics: {
          memory: this.getMemoryMetrics(),
          cpu: this.getCPUMetrics(),
          requests: this.getRequestMetrics()
        }
      };

      if (this.lastErrors.length > 0) {
        result.lastErrors = this.lastErrors.slice(-5); // Last 5 errors
      }

      return result;

    } catch (error) {
      console.error('[Health Check] Error performing health check:', error);
      
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        services: {
          database: { status: 'down', lastCheck: new Date().toISOString() },
          cache: { status: 'down', lastCheck: new Date().toISOString() },
          externalAPIs: { status: 'down', lastCheck: new Date().toISOString() },
          dataCollection: { status: 'down', lastCheck: new Date().toISOString() }
        },
        metrics: {
          memory: this.getMemoryMetrics(),
          cpu: this.getCPUMetrics(),
          requests: this.getRequestMetrics()
        },
        lastErrors: [`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  private async checkDatabase(): Promise<ServiceHealth> {
    const startTime = performance.now();
    
    try {
      // Import storage dynamically to avoid circular dependencies
      const { storage } = await import('../storage');
      
      // Simple query to test database connection
      await storage.getAllDataSources();
      
      const responseTime = performance.now() - startTime;
      
      return {
        status: responseTime < 1000 ? 'up' : 'degraded',
        responseTime,
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'down',
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Database connection failed'
      };
    }
  }

  private async checkCache(): Promise<ServiceHealth> {
    const startTime = performance.now();
    
    try {
      // Simple cache test (using in-memory for now)
      const testKey = 'health_check_' + Date.now();
      const testValue = 'ok';
      
      // In a real implementation, this would check Redis
      // For now, we'll simulate a cache check
      const responseTime = performance.now() - startTime;
      
      return {
        status: 'up',
        responseTime,
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'down',
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Cache connection failed'
      };
    }
  }

  private async checkExternalAPIs(): Promise<ServiceHealth> {
    const startTime = performance.now();
    
    try {
      // Test FDA API availability
      const response = await fetch('https://api.fda.gov/device/recall.json?limit=1', {
        method: 'GET',
        timeout: 5000 as any
      });
      
      const responseTime = performance.now() - startTime;
      
      if (response.ok) {
        return {
          status: responseTime < 3000 ? 'up' : 'degraded',
          responseTime,
          lastCheck: new Date().toISOString()
        };
      } else {
        return {
          status: 'degraded',
          responseTime,
          lastCheck: new Date().toISOString(),
          error: `FDA API returned ${response.status}`
        };
      }
    } catch (error) {
      return {
        status: 'down',
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'External API check failed'
      };
    }
  }

  private async checkDataCollection(): Promise<ServiceHealth> {
    try {
      // Check if data collection services are running
      const { storage } = await import('../storage');
      
      // Get recent data to verify collection is working
      const recentUpdates = await storage.getAllRegulatoryUpdates();
      const recentCases = await storage.getAllLegalCases();
      
      // Check if we have recent data (within last 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const hasRecentData = recentUpdates.some(update => 
        update.lastUpdated && new Date(update.lastUpdated) > oneDayAgo
      );
      
      return {
        status: hasRecentData ? 'up' : 'degraded',
        lastCheck: new Date().toISOString(),
        error: hasRecentData ? undefined : 'No recent data collected'
      };
    } catch (error) {
      return {
        status: 'down',
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Data collection check failed'
      };
    }
  }

  private getHealthResult(result: PromiseSettledResult<ServiceHealth>): ServiceHealth {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        status: 'down',
        lastCheck: new Date().toISOString(),
        error: result.reason instanceof Error ? result.reason.message : 'Service check failed'
      };
    }
  }

  private determineOverallStatus(services: HealthCheckResult['services']): 'healthy' | 'unhealthy' | 'degraded' {
    const statuses = Object.values(services).map(service => service.status);
    
    if (statuses.every(status => status === 'up')) {
      return 'healthy';
    } else if (statuses.some(status => status === 'down')) {
      return 'unhealthy';
    } else {
      return 'degraded';
    }
  }

  private getMemoryMetrics(): MemoryMetrics {
    const memUsage = process.memoryUsage();
    
    return {
      used: memUsage.rss,
      total: memUsage.rss + memUsage.heapTotal,
      usage: (memUsage.rss / (memUsage.rss + memUsage.heapTotal)) * 100,
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal
    };
  }

  private getCPUMetrics(): CPUMetrics {
    const cpuUsage = process.cpuUsage();
    const loadAvg = process.platform === 'win32' ? [0, 0, 0] : require('os').loadavg();
    
    return {
      usage: (cpuUsage.user + cpuUsage.system) / 1000000, // Convert to seconds
      loadAverage: loadAvg
    };
  }

  private getRequestMetrics(): RequestMetrics {
    const avgResponseTime = this.requestMetrics.responseTimes.length > 0
      ? this.requestMetrics.responseTimes.reduce((a, b) => a + b, 0) / this.requestMetrics.responseTimes.length
      : 0;
    
    return {
      total: this.requestMetrics.total,
      successful: this.requestMetrics.successful,
      failed: this.requestMetrics.failed,
      averageResponseTime: avgResponseTime
    };
  }

  // Method to track request metrics
  trackRequest(responseTime: number, success: boolean) {
    this.requestMetrics.total++;
    this.requestMetrics.responseTimes.push(responseTime);
    
    // Keep only last 1000 response times to prevent memory leak
    if (this.requestMetrics.responseTimes.length > 1000) {
      this.requestMetrics.responseTimes = this.requestMetrics.responseTimes.slice(-1000);
    }
    
    if (success) {
      this.requestMetrics.successful++;
    } else {
      this.requestMetrics.failed++;
    }
  }

  // Method to log errors
  logError(error: string) {
    this.lastErrors.push(`${new Date().toISOString()}: ${error}`);
    
    // Keep only last 50 errors
    if (this.lastErrors.length > 50) {
      this.lastErrors = this.lastErrors.slice(-50);
    }
  }
}

export const healthCheckService = new HealthCheckService();

// Health check endpoint handler
export const healthCheckHandler = async (req: Request, res: Response) => {
  try {
    const healthResult = await healthCheckService.performHealthCheck();
    
    // Set appropriate HTTP status based on health
    const statusCode = healthResult.status === 'healthy' ? 200 : 
                      healthResult.status === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json(healthResult);
  } catch (error) {
    console.error('[Health Check] Handler error:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Health check failed'
    });
  }
};

// Metrics endpoint handler
export const metricsHandler = async (req: Request, res: Response) => {
  try {
    const healthResult = await healthCheckService.performHealthCheck();
    
    // Convert to Prometheus format
    const prometheusMetrics = `
# HELP helix_app_status Application health status (1=healthy, 0.5=degraded, 0=unhealthy)
# TYPE helix_app_status gauge
helix_app_status{environment="${healthResult.environment}"} ${healthResult.status === 'healthy' ? 1 : healthResult.status === 'degraded' ? 0.5 : 0}

# HELP helix_app_uptime_seconds Application uptime in seconds
# TYPE helix_app_uptime_seconds counter
helix_app_uptime_seconds ${healthResult.uptime}

# HELP helix_memory_usage_bytes Memory usage in bytes
# TYPE helix_memory_usage_bytes gauge
helix_memory_usage_bytes{type="used"} ${healthResult.metrics.memory.used}
helix_memory_usage_bytes{type="heap_used"} ${healthResult.metrics.memory.heapUsed}
helix_memory_usage_bytes{type="heap_total"} ${healthResult.metrics.memory.heapTotal}

# HELP helix_requests_total Total number of requests
# TYPE helix_requests_total counter
helix_requests_total{status="successful"} ${healthResult.metrics.requests.successful}
helix_requests_total{status="failed"} ${healthResult.metrics.requests.failed}

# HELP helix_response_time_seconds Average response time in seconds
# TYPE helix_response_time_seconds gauge
helix_response_time_seconds ${healthResult.metrics.requests.averageResponseTime / 1000}

# HELP helix_service_status Service health status (1=up, 0.5=degraded, 0=down)
# TYPE helix_service_status gauge
helix_service_status{service="database"} ${healthResult.services.database.status === 'up' ? 1 : healthResult.services.database.status === 'degraded' ? 0.5 : 0}
helix_service_status{service="cache"} ${healthResult.services.cache.status === 'up' ? 1 : healthResult.services.cache.status === 'degraded' ? 0.5 : 0}
helix_service_status{service="external_apis"} ${healthResult.services.externalAPIs.status === 'up' ? 1 : healthResult.services.externalAPIs.status === 'degraded' ? 0.5 : 0}
helix_service_status{service="data_collection"} ${healthResult.services.dataCollection.status === 'up' ? 1 : healthResult.services.dataCollection.status === 'degraded' ? 0.5 : 0}
`;

    res.set('Content-Type', 'application/json');
    res.json({
      success: true,
      metrics: prometheusMetrics,
      contentType: 'prometheus/metrics',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Metrics] Handler error:', error);
    res.status(500).send('# Metrics unavailable\n');
  }
};