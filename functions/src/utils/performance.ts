/**
 * Performance Monitoring and Optimization Utilities
 *
 * Provides comprehensive performance tracking, warmup functions,
 * and optimization utilities for Firebase Functions.
 *
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import { logger } from 'firebase-functions';

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  requestId: string;
  endpoint: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  errorType?: string;
  userAgent?: string;
  contentLength?: number;
  slideCount?: number;
  themeUsed?: string;
  aiSteps?: number;
  memoryUsage?: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  cpuUsage?: {
    user: number;
    system: number;
  };
}

/**
 * Global performance metrics store
 */
const performanceMetrics: PerformanceMetrics[] = [];
const MAX_METRICS_HISTORY = 1000;

/**
 * Start performance tracking for a request
 */
export function startPerformanceTracking(
  endpoint: string,
  req: any
): PerformanceMetrics {
  const metric: PerformanceMetrics = {
    requestId: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    endpoint,
    startTime: Date.now(),
    success: false,
    userAgent: req.headers['user-agent'],
    contentLength: req.headers['content-length']
      ? parseInt(req.headers['content-length'])
      : undefined,
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage()
  };

  performanceMetrics.push(metric);
  return metric;
}

/**
 * Complete performance tracking for a request
 */
export function completePerformanceTracking(
  metric: PerformanceMetrics,
  success: boolean = true,
  errorType?: string,
  additionalData?: Partial<PerformanceMetrics>
): void {
  metric.endTime = Date.now();
  metric.duration = metric.endTime - metric.startTime;
  metric.success = success;
  metric.errorType = errorType;

  // Add additional data if provided
  if (additionalData) {
    Object.assign(metric, additionalData);
  }

  // Calculate resource usage
  const endMemory = process.memoryUsage();
  const endCpu = process.cpuUsage(metric.cpuUsage);

  metric.memoryUsage = {
    heapUsed: endMemory.heapUsed - (metric.memoryUsage?.heapUsed || 0),
    heapTotal: endMemory.heapTotal,
    external: endMemory.external - (metric.memoryUsage?.external || 0)
  };

  metric.cpuUsage = {
    user: endCpu.user,
    system: endCpu.system
  };

  // Log performance metric
  logger.info('Performance metric', {
    requestId: metric.requestId,
    endpoint: metric.endpoint,
    duration: metric.duration,
    success: metric.success,
    memoryDelta: metric.memoryUsage.heapUsed,
    cpuUser: metric.cpuUsage.user,
    cpuSystem: metric.cpuUsage.system
  });

  // Maintain metrics history limit
  if (performanceMetrics.length > MAX_METRICS_HISTORY) {
    performanceMetrics.splice(0, performanceMetrics.length - MAX_METRICS_HISTORY);
  }
}

/**
 * Get performance statistics
 */
export function getPerformanceStats(): {
  totalRequests: number;
  successRate: number;
  averageDuration: number;
  p95Duration: number;
  p99Duration: number;
  averageMemoryUsage: number;
  recentErrors: string[];
} {
  if (performanceMetrics.length === 0) {
    return {
      totalRequests: 0,
      successRate: 0,
      averageDuration: 0,
      p95Duration: 0,
      p99Duration: 0,
      averageMemoryUsage: 0,
      recentErrors: []
    };
  }

  const completedMetrics = performanceMetrics.filter(m => m.duration !== undefined);
  const durations = completedMetrics.map(m => m.duration!).sort((a, b) => a - b);
  const successfulRequests = completedMetrics.filter(m => m.success).length;

  const p95Index = Math.floor(durations.length * 0.95);
  const p99Index = Math.floor(durations.length * 0.99);

  const recentErrors = performanceMetrics
    .filter(m => !m.success && m.errorType)
    .slice(-10)
    .map(m => m.errorType!);

  return {
    totalRequests: performanceMetrics.length,
    successRate: completedMetrics.length > 0 ? successfulRequests / completedMetrics.length : 0,
    averageDuration: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
    p95Duration: durations.length > 0 ? durations[p95Index] || 0 : 0,
    p99Duration: durations.length > 0 ? durations[p99Index] || 0 : 0,
    averageMemoryUsage: completedMetrics.length > 0
      ? completedMetrics.reduce((sum, m) => sum + (m.memoryUsage?.heapUsed || 0), 0) / completedMetrics.length
      : 0,
    recentErrors
  };
}

/**
 * Warmup function to initialize heavy dependencies
 */
export async function warmupFunction(): Promise<void> {
  const startTime = Date.now();
  logger.info('Starting function warmup...');

  try {
    // Pre-load heavy modules
    await Promise.all([
      // Lazy load OpenAI client
      import('../llm').then(module => {
        logger.info('OpenAI client module loaded');
        return module;
      }),

      // Lazy load PptxGenJS
      import('../pptGenerator').then(module => {
        logger.info('PptxGenJS module loaded');
        return module;
      }),

      // Pre-compile theme data
      import('../professionalThemes').then(module => {
        logger.info('Theme system loaded');
        return module;
      }),

      // Pre-load validation schemas
      import('../schema').then(module => {
        logger.info('Validation schemas loaded');
        return module;
      })
    ]);

    // Pre-allocate some memory buffers
    const bufferSizes = [1024, 4096, 16384]; // 1KB, 4KB, 16KB
    bufferSizes.forEach(size => {
      Buffer.alloc(size);
    });

    const warmupTime = Date.now() - startTime;
    logger.info(`Function warmup completed in ${warmupTime}ms`);

  } catch (error) {
    logger.error('Function warmup failed:', error);
    throw error;
  }
}

/**
 * Memory optimization utilities
 */
export class MemoryManager {
  private static bufferPool: Map<number, Buffer[]> = new Map();

  /**
   * Get a buffer from the pool or create a new one
   */
  static getBuffer(size: number): Buffer {
    const pool = this.bufferPool.get(size) || [];
    const buffer = pool.pop();

    if (buffer) {
      buffer.fill(0); // Clear the buffer
      return buffer;
    }

    return Buffer.alloc(size);
  }

  /**
   * Return a buffer to the pool for reuse
   */
  static returnBuffer(buffer: Buffer): void {
    const size = buffer.length;
    const pool = this.bufferPool.get(size) || [];

    if (pool.length < 10) { // Limit pool size
      pool.push(buffer);
      this.bufferPool.set(size, pool);
    }
  }

  /**
   * Force garbage collection if available
   */
  static forceGC(): void {
    if (global.gc) {
      global.gc();
      logger.info('Forced garbage collection');
    }
  }

  /**
   * Get current memory usage
   */
  static getMemoryUsage(): NodeJS.MemoryUsage {
    return process.memoryUsage();
  }

  /**
   * Check if memory usage is approaching limits
   */
  static isMemoryPressure(threshold: number = 0.8): boolean {
    const usage = process.memoryUsage();
    const totalMemory = usage.heapTotal;
    const usedMemory = usage.heapUsed;

    return (usedMemory / totalMemory) > threshold;
  }
}