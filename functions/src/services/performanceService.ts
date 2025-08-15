/**
 * Performance Monitoring Service
 * 
 * Provides comprehensive performance monitoring and optimization including:
 * - Real-time performance tracking
 * - Memory usage monitoring
 * - API response time analysis
 * - Resource utilization metrics
 * - Performance alerts and recommendations
 * 
 * This service helps identify bottlenecks and optimize application performance.
 * 
 * @version 1.0.0
 */

import { performance } from 'perf_hooks';

/**
 * Performance metric interface
 */
export interface PerformanceMetric {
  id: string;
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  memoryUsage?: NodeJS.MemoryUsage;
  metadata?: Record<string, any>;
  status: 'running' | 'completed' | 'failed';
  error?: string;
}

/**
 * Performance summary interface
 */
export interface PerformanceSummary {
  totalOperations: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  successRate: number;
  memoryUsage: {
    average: number;
    peak: number;
    current: NodeJS.MemoryUsage;
  };
  slowestOperations: Array<{
    operation: string;
    duration: number;
    timestamp: number;
  }>;
  recommendations: string[];
}

/**
 * Performance alert interface
 */
export interface PerformanceAlert {
  type: 'warning' | 'critical';
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: number;
  recommendations: string[];
}

/**
 * Performance thresholds
 */
interface PerformanceThresholds {
  responseTime: {
    warning: number;
    critical: number;
  };
  memoryUsage: {
    warning: number;
    critical: number;
  };
  errorRate: {
    warning: number;
    critical: number;
  };
}

/**
 * Main Performance Service Implementation
 */
export class PerformanceService {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private completedMetrics: PerformanceMetric[] = [];
  private alerts: PerformanceAlert[] = [];
  private maxStoredMetrics = 1000; // Limit stored metrics to prevent memory leaks

  private thresholds: PerformanceThresholds = {
    responseTime: {
      warning: 5000, // 5 seconds
      critical: 10000 // 10 seconds
    },
    memoryUsage: {
      warning: 512 * 1024 * 1024, // 512MB
      critical: 1024 * 1024 * 1024 // 1GB
    },
    errorRate: {
      warning: 0.05, // 5%
      critical: 0.10 // 10%
    }
  };

  /**
   * Start tracking a performance metric
   */
  startTracking(operation: string, metadata?: Record<string, any>): string {
    const id = `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const metric: PerformanceMetric = {
      id,
      operation,
      startTime: performance.now(),
      memoryUsage: process.memoryUsage(),
      metadata,
      status: 'running'
    };

    this.metrics.set(id, metric);
    console.log(`📊 Started tracking: ${operation} (${id})`);

    return id;
  }

  /**
   * End tracking a performance metric
   */
  endTracking(id: string, success: boolean = true, error?: string, additionalMetadata?: Record<string, any>): PerformanceMetric | null {
    const metric = this.metrics.get(id);
    if (!metric) {
      console.warn(`Performance metric not found: ${id}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;
    const currentMemory = process.memoryUsage();

    metric.endTime = endTime;
    metric.duration = duration;
    metric.status = success ? 'completed' : 'failed';
    metric.error = error;
    
    if (additionalMetadata) {
      metric.metadata = { ...metric.metadata, ...additionalMetadata };
    }

    // Remove from active tracking
    this.metrics.delete(id);

    // Add to completed metrics
    this.completedMetrics.push(metric);

    // Limit stored metrics
    if (this.completedMetrics.length > this.maxStoredMetrics) {
      this.completedMetrics = this.completedMetrics.slice(-this.maxStoredMetrics);
    }

    console.log(`📊 Completed tracking: ${metric.operation} (${duration.toFixed(2)}ms)`);

    // Check for performance alerts
    this.checkPerformanceAlerts(metric);

    return metric;
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(timeWindow?: number): PerformanceSummary {
    const now = Date.now();
    const windowStart = timeWindow ? now - timeWindow : 0;
    
    const relevantMetrics = this.completedMetrics.filter(metric => 
      metric.endTime && metric.endTime >= windowStart
    );

    if (relevantMetrics.length === 0) {
      return this.getEmptySummary();
    }

    const durations = relevantMetrics
      .filter(m => m.duration !== undefined)
      .map(m => m.duration!);

    const successfulOperations = relevantMetrics.filter(m => m.status === 'completed').length;
    const totalOperations = relevantMetrics.length;

    const memoryUsages = relevantMetrics
      .filter(m => m.memoryUsage)
      .map(m => m.memoryUsage!.heapUsed);

    const slowestOperations = relevantMetrics
      .filter(m => m.duration !== undefined)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, 5)
      .map(m => ({
        operation: m.operation,
        duration: m.duration!,
        timestamp: m.startTime
      }));

    return {
      totalOperations,
      averageResponseTime: durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0,
      minResponseTime: durations.length > 0 ? Math.min(...durations) : 0,
      maxResponseTime: durations.length > 0 ? Math.max(...durations) : 0,
      successRate: totalOperations > 0 ? successfulOperations / totalOperations : 1,
      memoryUsage: {
        average: memoryUsages.length > 0 ? memoryUsages.reduce((sum, m) => sum + m, 0) / memoryUsages.length : 0,
        peak: memoryUsages.length > 0 ? Math.max(...memoryUsages) : 0,
        current: process.memoryUsage()
      },
      slowestOperations,
      recommendations: this.generateRecommendations(relevantMetrics)
    };
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(limit: number = 10): PerformanceAlert[] {
    return this.alerts
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Clear old metrics and alerts
   */
  cleanup(olderThan: number = 24 * 60 * 60 * 1000): void { // Default: 24 hours
    const cutoff = Date.now() - olderThan;
    
    // Clean up completed metrics
    this.completedMetrics = this.completedMetrics.filter(metric => 
      metric.endTime && metric.endTime > cutoff
    );

    // Clean up alerts
    this.alerts = this.alerts.filter(alert => alert.timestamp > cutoff);

    console.log(`🧹 Cleaned up old performance data (older than ${olderThan}ms)`);
  }

  /**
   * Get current system metrics
   */
  getSystemMetrics(): {
    memory: NodeJS.MemoryUsage;
    uptime: number;
    activeMetrics: number;
    completedMetrics: number;
  } {
    return {
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      activeMetrics: this.metrics.size,
      completedMetrics: this.completedMetrics.length
    };
  }

  /**
   * Check for performance alerts
   */
  private checkPerformanceAlerts(metric: PerformanceMetric): void {
    const alerts: PerformanceAlert[] = [];

    // Check response time
    if (metric.duration) {
      if (metric.duration > this.thresholds.responseTime.critical) {
        alerts.push({
          type: 'critical',
          message: `Critical response time: ${metric.operation} took ${metric.duration.toFixed(2)}ms`,
          metric: 'response_time',
          value: metric.duration,
          threshold: this.thresholds.responseTime.critical,
          timestamp: Date.now(),
          recommendations: [
            'Consider optimizing the operation',
            'Check for database query performance',
            'Review API call efficiency',
            'Consider implementing caching'
          ]
        });
      } else if (metric.duration > this.thresholds.responseTime.warning) {
        alerts.push({
          type: 'warning',
          message: `Slow response time: ${metric.operation} took ${metric.duration.toFixed(2)}ms`,
          metric: 'response_time',
          value: metric.duration,
          threshold: this.thresholds.responseTime.warning,
          timestamp: Date.now(),
          recommendations: [
            'Monitor operation performance',
            'Consider performance optimization'
          ]
        });
      }
    }

    // Check memory usage
    if (metric.memoryUsage) {
      const heapUsed = metric.memoryUsage.heapUsed;
      if (heapUsed > this.thresholds.memoryUsage.critical) {
        alerts.push({
          type: 'critical',
          message: `Critical memory usage: ${(heapUsed / 1024 / 1024).toFixed(2)}MB`,
          metric: 'memory_usage',
          value: heapUsed,
          threshold: this.thresholds.memoryUsage.critical,
          timestamp: Date.now(),
          recommendations: [
            'Check for memory leaks',
            'Optimize data structures',
            'Consider garbage collection tuning',
            'Review caching strategies'
          ]
        });
      } else if (heapUsed > this.thresholds.memoryUsage.warning) {
        alerts.push({
          type: 'warning',
          message: `High memory usage: ${(heapUsed / 1024 / 1024).toFixed(2)}MB`,
          metric: 'memory_usage',
          value: heapUsed,
          threshold: this.thresholds.memoryUsage.warning,
          timestamp: Date.now(),
          recommendations: [
            'Monitor memory usage trends',
            'Consider memory optimization'
          ]
        });
      }
    }

    // Add alerts
    this.alerts.push(...alerts);

    // Log alerts
    alerts.forEach(alert => {
      if (alert.type === 'critical') {
        console.error(`🚨 CRITICAL ALERT: ${alert.message}`);
      } else {
        console.warn(`⚠️ WARNING: ${alert.message}`);
      }
    });
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(metrics: PerformanceMetric[]): string[] {
    const recommendations: string[] = [];

    if (metrics.length === 0) return recommendations;

    const avgDuration = metrics
      .filter(m => m.duration)
      .reduce((sum, m) => sum + m.duration!, 0) / metrics.length;

    const errorRate = metrics.filter(m => m.status === 'failed').length / metrics.length;

    // Response time recommendations
    if (avgDuration > 3000) {
      recommendations.push('Consider implementing caching to reduce response times');
      recommendations.push('Review database query performance and add indexes where needed');
    }

    if (avgDuration > 1000) {
      recommendations.push('Consider optimizing API calls and reducing external dependencies');
    }

    // Error rate recommendations
    if (errorRate > 0.05) {
      recommendations.push('High error rate detected - review error handling and input validation');
      recommendations.push('Consider implementing circuit breakers for external services');
    }

    // Memory recommendations
    const currentMemory = process.memoryUsage().heapUsed;
    if (currentMemory > 256 * 1024 * 1024) { // 256MB
      recommendations.push('Consider optimizing memory usage and implementing data cleanup');
    }

    return recommendations;
  }

  /**
   * Get empty summary for when no metrics are available
   */
  private getEmptySummary(): PerformanceSummary {
    return {
      totalOperations: 0,
      averageResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      successRate: 1,
      memoryUsage: {
        average: 0,
        peak: 0,
        current: process.memoryUsage()
      },
      slowestOperations: [],
      recommendations: []
    };
  }
}

// Export singleton instance
export const performanceService = new PerformanceService();
export default performanceService;
