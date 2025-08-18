/**
 * Performance Monitoring System
 * 
 * Comprehensive performance tracking, bottleneck identification,
 * and optimization recommendations for PowerPoint generation.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import { logger, type LogContext } from './smartLogger';

/**
 * Performance metric types
 */
export type MetricType = 
  | 'duration'
  | 'memory'
  | 'throughput'
  | 'error_rate'
  | 'file_size'
  | 'cpu_usage';

/**
 * Performance measurement interface
 */
export interface PerformanceMeasurement {
  id: string;
  name: string;
  type: MetricType;
  value: number;
  unit: string;
  timestamp: Date;
  context?: LogContext;
  metadata?: Record<string, any>;
}

/**
 * Performance benchmark interface
 */
export interface PerformanceBenchmark {
  name: string;
  target: number;
  warning: number;
  critical: number;
  unit: string;
  description: string;
}

/**
 * Performance analysis result
 */
export interface PerformanceAnalysis {
  overall: 'excellent' | 'good' | 'fair' | 'poor';
  score: number; // 0-100
  bottlenecks: string[];
  recommendations: string[];
  metrics: PerformanceMeasurement[];
  benchmarkResults: Record<string, 'pass' | 'warning' | 'fail'>;
}

/**
 * Performance monitoring configuration
 */
export interface PerformanceConfig {
  enableMonitoring: boolean;
  enableBenchmarking: boolean;
  enableRecommendations: boolean;
  sampleRate: number; // 0-1
  retentionDays: number;
  alertThresholds: Record<string, number>;
}

/**
 * Performance Monitor Class
 */
export class PerformanceMonitor {
  private config: PerformanceConfig;
  private measurements: Map<string, PerformanceMeasurement[]> = new Map();
  private activeTimers: Map<string, { start: number; context?: LogContext }> = new Map();
  private benchmarks: Map<string, PerformanceBenchmark> = new Map();

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enableMonitoring: true,
      enableBenchmarking: true,
      enableRecommendations: true,
      sampleRate: 1.0,
      retentionDays: 7,
      alertThresholds: {
        generation_time: 30000, // 30 seconds
        memory_usage: 512 * 1024 * 1024, // 512MB
        file_size: 50 * 1024 * 1024, // 50MB
        error_rate: 0.05 // 5%
      },
      ...config
    };

    this.initializeDefaultBenchmarks();
  }

  /**
   * Start timing a performance measurement
   */
  startTimer(name: string, context?: LogContext): string {
    if (!this.config.enableMonitoring || Math.random() > this.config.sampleRate) {
      return '';
    }

    const id = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.activeTimers.set(id, {
      start: performance.now(),
      context
    });

    logger.debug('Performance timer started', context, { name, timerId: id });
    return id;
  }

  /**
   * End timing and record measurement
   */
  endTimer(timerId: string, metadata?: Record<string, any>): PerformanceMeasurement | null {
    if (!timerId || !this.activeTimers.has(timerId)) {
      return null;
    }

    const timer = this.activeTimers.get(timerId)!;
    const duration = performance.now() - timer.start;
    this.activeTimers.delete(timerId);

    const measurement: PerformanceMeasurement = {
      id: timerId,
      name: timerId.split('_')[0],
      type: 'duration',
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      context: timer.context,
      metadata
    };

    this.recordMeasurement(measurement);
    
    logger.debug('Performance timer ended', timer.context, {
      name: measurement.name,
      duration: `${duration.toFixed(2)}ms`,
      metadata
    });

    return measurement;
  }

  /**
   * Record a custom measurement
   */
  recordMeasurement(measurement: PerformanceMeasurement): void {
    if (!this.config.enableMonitoring) return;

    const key = measurement.name;
    if (!this.measurements.has(key)) {
      this.measurements.set(key, []);
    }

    this.measurements.get(key)!.push(measurement);
    this.cleanupOldMeasurements();

    // Check for alerts
    this.checkAlerts(measurement);
  }

  /**
   * Record memory usage
   */
  recordMemoryUsage(name: string, context?: LogContext): void {
    if (!this.config.enableMonitoring) return;

    const memUsage = process.memoryUsage();
    
    this.recordMeasurement({
      id: `memory_${Date.now()}`,
      name,
      type: 'memory',
      value: memUsage.heapUsed,
      unit: 'bytes',
      timestamp: new Date(),
      context,
      metadata: {
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external,
        rss: memUsage.rss
      }
    });
  }

  /**
   * Record file size measurement
   */
  recordFileSize(name: string, size: number, context?: LogContext): void {
    if (!this.config.enableMonitoring) return;

    this.recordMeasurement({
      id: `filesize_${Date.now()}`,
      name,
      type: 'file_size',
      value: size,
      unit: 'bytes',
      timestamp: new Date(),
      context,
      metadata: {
        sizeKB: Math.round(size / 1024),
        sizeMB: Math.round(size / (1024 * 1024))
      }
    });
  }

  /**
   * Record throughput measurement
   */
  recordThroughput(name: string, itemsProcessed: number, duration: number, context?: LogContext): void {
    if (!this.config.enableMonitoring) return;

    const throughput = itemsProcessed / (duration / 1000); // items per second

    this.recordMeasurement({
      id: `throughput_${Date.now()}`,
      name,
      type: 'throughput',
      value: throughput,
      unit: 'items/sec',
      timestamp: new Date(),
      context,
      metadata: {
        itemsProcessed,
        duration,
        itemsPerMinute: throughput * 60
      }
    });
  }

  /**
   * Analyze performance and provide recommendations
   */
  analyzePerformance(timeWindow?: number): PerformanceAnalysis {
    const windowMs = timeWindow || (24 * 60 * 60 * 1000); // 24 hours default
    const cutoff = new Date(Date.now() - windowMs);
    
    const recentMeasurements = this.getRecentMeasurements(cutoff);
    const benchmarkResults = this.runBenchmarks(recentMeasurements);
    const bottlenecks = this.identifyBottlenecks(recentMeasurements);
    const recommendations = this.generateRecommendations(recentMeasurements, bottlenecks);
    const score = this.calculatePerformanceScore(benchmarkResults);
    
    let overall: 'excellent' | 'good' | 'fair' | 'poor';
    if (score >= 90) overall = 'excellent';
    else if (score >= 75) overall = 'good';
    else if (score >= 60) overall = 'fair';
    else overall = 'poor';

    return {
      overall,
      score,
      bottlenecks,
      recommendations,
      metrics: recentMeasurements,
      benchmarkResults
    };
  }

  /**
   * Get performance statistics
   */
  getStatistics(metricName?: string): Record<string, any> {
    const stats: Record<string, any> = {};

    const metricsToAnalyze = metricName 
      ? [metricName] 
      : Array.from(this.measurements.keys());

    for (const name of metricsToAnalyze) {
      const measurements = this.measurements.get(name) || [];
      if (measurements.length === 0) continue;

      const values = measurements.map(m => m.value);
      const sorted = values.sort((a, b) => a - b);
      
      stats[name] = {
        count: measurements.length,
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((sum, val) => sum + val, 0) / values.length,
        median: sorted[Math.floor(sorted.length / 2)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        p99: sorted[Math.floor(sorted.length * 0.99)],
        unit: measurements[0].unit,
        lastUpdated: measurements[measurements.length - 1].timestamp
      };
    }

    return stats;
  }

  /**
   * Clear all measurements
   */
  clearMeasurements(): void {
    this.measurements.clear();
    this.activeTimers.clear();
    logger.info('Performance measurements cleared');
  }

  /**
   * Add custom benchmark
   */
  addBenchmark(name: string, benchmark: PerformanceBenchmark): void {
    this.benchmarks.set(name, benchmark);
  }

  /**
   * Get recent measurements within time window
   */
  private getRecentMeasurements(cutoff: Date): PerformanceMeasurement[] {
    const recent: PerformanceMeasurement[] = [];
    
    for (const measurements of this.measurements.values()) {
      recent.push(...measurements.filter(m => m.timestamp >= cutoff));
    }
    
    return recent.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Run benchmarks against recent measurements
   */
  private runBenchmarks(measurements: PerformanceMeasurement[]): Record<string, 'pass' | 'warning' | 'fail'> {
    const results: Record<string, 'pass' | 'warning' | 'fail'> = {};
    
    if (!this.config.enableBenchmarking) return results;

    for (const [name, benchmark] of this.benchmarks) {
      const relevantMeasurements = measurements.filter(m => m.name === name);
      if (relevantMeasurements.length === 0) continue;

      const avgValue = relevantMeasurements.reduce((sum, m) => sum + m.value, 0) / relevantMeasurements.length;
      
      if (avgValue <= benchmark.target) {
        results[name] = 'pass';
      } else if (avgValue <= benchmark.warning) {
        results[name] = 'warning';
      } else {
        results[name] = 'fail';
      }
    }

    return results;
  }

  /**
   * Identify performance bottlenecks
   */
  private identifyBottlenecks(measurements: PerformanceMeasurement[]): string[] {
    const bottlenecks: string[] = [];
    
    // Group by measurement name and analyze
    const grouped = measurements.reduce((acc, m) => {
      if (!acc[m.name]) acc[m.name] = [];
      acc[m.name].push(m);
      return acc;
    }, {} as Record<string, PerformanceMeasurement[]>);

    for (const [name, measures] of Object.entries(grouped)) {
      if (measures.length < 2) continue;

      const values = measures.map(m => m.value);
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      const max = Math.max(...values);
      
      // Check for high variance (potential bottleneck)
      if (max > avg * 2) {
        bottlenecks.push(`High variance in ${name} (max: ${max.toFixed(2)}, avg: ${avg.toFixed(2)})`);
      }

      // Check against thresholds
      const threshold = this.config.alertThresholds[name];
      if (threshold && avg > threshold) {
        bottlenecks.push(`${name} exceeds threshold (${avg.toFixed(2)} > ${threshold})`);
      }
    }

    return bottlenecks;
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(measurements: PerformanceMeasurement[], bottlenecks: string[]): string[] {
    if (!this.config.enableRecommendations) return [];

    const recommendations: string[] = [];
    
    // Analyze memory usage
    const memoryMeasurements = measurements.filter(m => m.type === 'memory');
    if (memoryMeasurements.length > 0) {
      const avgMemory = memoryMeasurements.reduce((sum, m) => sum + m.value, 0) / memoryMeasurements.length;
      if (avgMemory > 256 * 1024 * 1024) { // 256MB
        recommendations.push('Consider implementing memory optimization strategies');
      }
    }

    // Analyze generation times
    const generationMeasurements = measurements.filter(m => m.name.includes('generation'));
    if (generationMeasurements.length > 0) {
      const avgTime = generationMeasurements.reduce((sum, m) => sum + m.value, 0) / generationMeasurements.length;
      if (avgTime > 10000) { // 10 seconds
        recommendations.push('PowerPoint generation is slow - consider optimizing slide complexity');
      }
    }

    // Analyze file sizes
    const fileSizeMeasurements = measurements.filter(m => m.type === 'file_size');
    if (fileSizeMeasurements.length > 0) {
      const avgSize = fileSizeMeasurements.reduce((sum, m) => sum + m.value, 0) / fileSizeMeasurements.length;
      if (avgSize > 10 * 1024 * 1024) { // 10MB
        recommendations.push('Generated files are large - enable compression and image optimization');
      }
    }

    // Bottleneck-specific recommendations
    if (bottlenecks.some(b => b.includes('memory'))) {
      recommendations.push('Implement garbage collection and memory cleanup strategies');
    }
    
    if (bottlenecks.some(b => b.includes('generation'))) {
      recommendations.push('Consider caching frequently used templates and themes');
    }

    return recommendations;
  }

  /**
   * Calculate overall performance score
   */
  private calculatePerformanceScore(benchmarkResults: Record<string, 'pass' | 'warning' | 'fail'>): number {
    if (Object.keys(benchmarkResults).length === 0) return 100;

    let score = 0;
    let total = 0;

    for (const result of Object.values(benchmarkResults)) {
      total++;
      switch (result) {
        case 'pass': score += 100; break;
        case 'warning': score += 70; break;
        case 'fail': score += 30; break;
      }
    }

    return Math.round(score / total);
  }

  /**
   * Check for performance alerts
   */
  private checkAlerts(measurement: PerformanceMeasurement): void {
    const threshold = this.config.alertThresholds[measurement.name];
    if (threshold && measurement.value > threshold) {
      logger.warn('Performance alert triggered', measurement.context, {
        metric: measurement.name,
        value: measurement.value,
        threshold,
        unit: measurement.unit
      });
    }
  }

  /**
   * Clean up old measurements based on retention policy
   */
  private cleanupOldMeasurements(): void {
    const cutoff = new Date(Date.now() - (this.config.retentionDays * 24 * 60 * 60 * 1000));
    
    for (const [name, measurements] of this.measurements) {
      const filtered = measurements.filter(m => m.timestamp >= cutoff);
      this.measurements.set(name, filtered);
    }
  }

  /**
   * Initialize default performance benchmarks
   */
  private initializeDefaultBenchmarks(): void {
    this.addBenchmark('ppt_generation', {
      name: 'PowerPoint Generation Time',
      target: 5000, // 5 seconds
      warning: 15000, // 15 seconds
      critical: 30000, // 30 seconds
      unit: 'ms',
      description: 'Time to generate PowerPoint presentation'
    });

    this.addBenchmark('slide_processing', {
      name: 'Slide Processing Time',
      target: 500, // 500ms per slide
      warning: 1500, // 1.5 seconds
      critical: 3000, // 3 seconds
      unit: 'ms',
      description: 'Average time to process each slide'
    });

    this.addBenchmark('memory_usage', {
      name: 'Memory Usage',
      target: 128 * 1024 * 1024, // 128MB
      warning: 256 * 1024 * 1024, // 256MB
      critical: 512 * 1024 * 1024, // 512MB
      unit: 'bytes',
      description: 'Peak memory usage during generation'
    });

    this.addBenchmark('file_size', {
      name: 'Generated File Size',
      target: 2 * 1024 * 1024, // 2MB
      warning: 10 * 1024 * 1024, // 10MB
      critical: 25 * 1024 * 1024, // 25MB
      unit: 'bytes',
      description: 'Size of generated PowerPoint file'
    });
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor;
