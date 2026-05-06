import { cache } from './redis-client';

export interface PerformanceMetrics {
  requestCount: number;
  responseTime: number;
  errorRate: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  databaseConnections: number;
  cacheHitRate: number;
}

export interface AlertThresholds {
  responseTime: number; // ms
  errorRate: number; // percentage
  memoryUsage: number; // percentage
  cpuUsage: number; // percentage
  databaseConnections: number;
  cacheHitRate: number; // percentage
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics;
  private alerts: AlertThresholds;
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
    this.metrics = {
      requestCount: 0,
      responseTime: 0,
      errorRate: 0,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      databaseConnections: 0,
      cacheHitRate: 0,
    };

    this.alerts = {
      responseTime: 1000, // 1 second
      errorRate: 5, // 5%
      memoryUsage: 80, // 80%
      cpuUsage: 70, // 70%
      databaseConnections: 15, // out of 20 max
      cacheHitRate: 80, // 80%
    };
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Record a request
  recordRequest(responseTime: number, isError: boolean = false): void {
    this.metrics.requestCount++;
    this.metrics.responseTime = (this.metrics.responseTime + responseTime) / 2;
    
    if (isError) {
      this.metrics.errorRate = (this.metrics.errorRate + (1 / this.metrics.requestCount) * 100);
    }
  }

  // Update system metrics
  async updateSystemMetrics(): Promise<void> {
    this.metrics.memoryUsage = process.memoryUsage();
    this.metrics.cpuUsage = process.cpuUsage();
    
    // Get database connection count
    try {
      const poolStats = await this.getDatabaseStats();
      this.metrics.databaseConnections = poolStats.totalCount;
    } catch (error) {
      console.error('Failed to get database stats:', error);
    }

    // Get cache hit rate
    try {
      const cacheStats = await this.getCacheStats();
      this.metrics.cacheHitRate = cacheStats.hitRate;
    } catch (error) {
      console.error('Failed to get cache stats:', error);
    }
  }

  // Get current metrics
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Check for performance alerts
  checkAlerts(): string[] {
    const alerts: string[] = [];
    const metrics = this.metrics;

    // Memory usage alert
    const memoryPercent = (metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal) * 100;
    if (memoryPercent > this.alerts.memoryUsage) {
      alerts.push(`High memory usage: ${memoryPercent.toFixed(2)}%`);
    }

    // Response time alert
    if (metrics.responseTime > this.alerts.responseTime) {
      alerts.push(`High response time: ${metrics.responseTime.toFixed(2)}ms`);
    }

    // Error rate alert
    if (metrics.errorRate > this.alerts.errorRate) {
      alerts.push(`High error rate: ${metrics.errorRate.toFixed(2)}%`);
    }

    // Database connections alert
    if (metrics.databaseConnections > this.alerts.databaseConnections) {
      alerts.push(`High database connections: ${metrics.databaseConnections}`);
    }

    // Cache hit rate alert
    if (metrics.cacheHitRate < this.alerts.cacheHitRate) {
      alerts.push(`Low cache hit rate: ${metrics.cacheHitRate.toFixed(2)}%`);
    }

    return alerts;
  }

  // Get database stats
  private async getDatabaseStats(): Promise<{ totalCount: number; idleCount: number }> {
    // This would be implemented based on your database pool
    // For now, return mock data
    return {
      totalCount: 5,
      idleCount: 3,
    };
  }

  // Get cache stats
  private async getCacheStats(): Promise<{ hitRate: number; totalHits: number; totalMisses: number }> {
    try {
      const info = await cache.getInfo();
      const lines = info.split('\r\n');
      
      let hits = 0;
      let misses = 0;
      
      for (const line of lines) {
        if (line.startsWith('keyspace_hits:')) {
          hits = parseInt(line.split(':')[1]);
        } else if (line.startsWith('keyspace_misses:')) {
          misses = parseInt(line.split(':')[1]);
        }
      }
      
      const total = hits + misses;
      const hitRate = total > 0 ? (hits / total) * 100 : 0;
      
      return { hitRate, totalHits: hits, totalMisses: misses };
    } catch (error) {
      console.error('Failed to get Redis info:', error);
      return { hitRate: 0, totalHits: 0, totalMisses: 0 };
    }
  }

  // Generate performance report
  generateReport(): string {
    const uptime = Date.now() - this.startTime;
    const uptimeHours = uptime / (1000 * 60 * 60);
    
    const memoryPercent = (this.metrics.memoryUsage.heapUsed / this.metrics.memoryUsage.heapTotal) * 100;
    
    return `
Performance Report
==================
Uptime: ${uptimeHours.toFixed(2)} hours
Request Count: ${this.metrics.requestCount}
Avg Response Time: ${this.metrics.responseTime.toFixed(2)}ms
Error Rate: ${this.metrics.errorRate.toFixed(2)}%
Memory Usage: ${memoryPercent.toFixed(2)}%
Database Connections: ${this.metrics.databaseConnections}
Cache Hit Rate: ${this.metrics.cacheHitRate.toFixed(2)}%

Memory Details:
- RSS: ${(this.metrics.memoryUsage.rss / 1024 / 1024).toFixed(2)} MB
- Heap Used: ${(this.metrics.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB
- Heap Total: ${(this.metrics.memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB
- External: ${(this.metrics.memoryUsage.external / 1024 / 1024).toFixed(2)} MB

Alerts:
${this.checkAlerts().length > 0 ? this.checkAlerts().join('\n') : 'No alerts'}
    `.trim();
  }

  // Reset metrics
  reset(): void {
    this.metrics = {
      requestCount: 0,
      responseTime: 0,
      errorRate: 0,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      databaseConnections: 0,
      cacheHitRate: 0,
    };
    this.startTime = Date.now();
  }
}

// Express/Next.js middleware for performance monitoring
export function createPerformanceMiddleware() {
  const monitor = PerformanceMonitor.getInstance();

  return (req: any, res: any, next: any) => {
    const startTime = Date.now();
    
    // Record response time when request finishes
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      const isError = res.statusCode >= 400;
      monitor.recordRequest(responseTime, isError);
    });

    next();
  };
}

// API endpoint for performance metrics
export async function getPerformanceMetrics(req: any, res: any) {
  try {
    const monitor = PerformanceMonitor.getInstance();
    await monitor.updateSystemMetrics();
    
    const metrics = monitor.getMetrics();
    const alerts = monitor.checkAlerts();
    
    res.json({
      metrics,
      alerts,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to get performance metrics:', error);
    res.status(500).json({ error: 'Failed to get performance metrics' });
  }
}

// Health check endpoint
export async function healthCheck(req: any, res: any) {
  try {
    const monitor = PerformanceMonitor.getInstance();
    await monitor.updateSystemMetrics();
    
    const alerts = monitor.checkAlerts();
    const isHealthy = alerts.length === 0;
    
    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      alerts,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Auto-update metrics every 30 seconds
setInterval(async () => {
  try {
    await performanceMonitor.updateSystemMetrics();
  } catch (error) {
    console.error('Failed to update system metrics:', error);
  }
}, 30000);
