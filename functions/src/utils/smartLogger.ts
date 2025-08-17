/**
 * Smart Logger for AI PowerPoint Generator
 * 
 * Innovative logging system designed for iterative testing and debugging
 * with structured output, performance tracking, and self-correction capabilities.
 */

export interface LogContext {
  requestId?: string;
  userId?: string;
  sessionId?: string;
  operation?: string;
  stage?: string;
  metadata?: Record<string, any>;
  [key: string]: any; // Allow additional properties
}

export interface LogEntry {
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' | 'PERF';
  message: string;
  context: LogContext;
  data?: any;
  duration?: number;
  memoryUsage?: NodeJS.MemoryUsage;
  stackTrace?: string;
}

export interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  memoryBefore: NodeJS.MemoryUsage;
  memoryAfter?: NodeJS.MemoryUsage;
  memoryDelta?: Partial<NodeJS.MemoryUsage>;
}

class SmartLogger {
  private logs: LogEntry[] = [];
  private performanceTrackers = new Map<string, PerformanceMetrics>();
  private isProduction = process.env.NODE_ENV === 'production';
  private maxLogs = this.isProduction ? 1000 : 5000;

  /**
   * Generate unique request ID for tracking
   */
  generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create structured log entry
   */
  private createLogEntry(
    level: LogEntry['level'],
    message: string,
    context: LogContext = {},
    data?: any,
    duration?: number
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: {
        requestId: context.requestId || 'unknown',
        ...context
      },
      data,
      duration,
      memoryUsage: process.memoryUsage?.()
    };

    if (level === 'ERROR') {
      entry.stackTrace = new Error().stack;
    }

    return entry;
  }

  /**
   * Add log entry and manage buffer
   */
  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Trim logs if exceeding max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output with formatting
    this.outputToConsole(entry);
  }

  /**
   * Format and output to console
   */
  private outputToConsole(entry: LogEntry): void {
    const emoji = {
      DEBUG: '🔍',
      INFO: 'ℹ️',
      WARN: '⚠️',
      ERROR: '❌',
      SUCCESS: '✅',
      PERF: '⚡'
    }[entry.level];

    const prefix = `${emoji} [${entry.level}] ${entry.timestamp}`;
    const context = entry.context.requestId ? `[${entry.context.requestId.slice(-8)}]` : '';
    const operation = entry.context.operation ? `[${entry.context.operation}]` : '';
    const stage = entry.context.stage ? `[${entry.context.stage}]` : '';
    
    let output = `${prefix} ${context}${operation}${stage} ${entry.message}`;
    
    if (entry.duration) {
      output += ` (${entry.duration}ms)`;
    }

    console.log(output);
    
    if (entry.data && !this.isProduction) {
      console.log('📊 Data:', JSON.stringify(entry.data, null, 2));
    }
    
    if (entry.level === 'ERROR' && entry.stackTrace && !this.isProduction) {
      console.log('🔥 Stack:', entry.stackTrace);
    }
  }

  /**
   * Debug logging
   */
  debug(message: string, context: LogContext = {}, data?: any): void {
    if (!this.isProduction) {
      this.addLog(this.createLogEntry('DEBUG', message, context, data));
    }
  }

  /**
   * Info logging
   */
  info(message: string, context: LogContext = {}, data?: any): void {
    this.addLog(this.createLogEntry('INFO', message, context, data));
  }

  /**
   * Warning logging
   */
  warn(message: string, context: LogContext = {}, data?: any): void {
    this.addLog(this.createLogEntry('WARN', message, context, data));
  }

  /**
   * Error logging
   */
  error(message: string, context: LogContext = {}, error?: Error | any): void {
    const data = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error;
    
    this.addLog(this.createLogEntry('ERROR', message, context, data));
  }

  /**
   * Success logging
   */
  success(message: string, context: LogContext = {}, data?: any): void {
    this.addLog(this.createLogEntry('SUCCESS', message, context, data));
  }

  /**
   * Start performance tracking
   */
  startPerf(trackerId: string, context: LogContext = {}): void {
    const metrics: PerformanceMetrics = {
      startTime: Date.now(),
      memoryBefore: process.memoryUsage?.() || {} as NodeJS.MemoryUsage
    };
    
    this.performanceTrackers.set(trackerId, metrics);
    this.debug(`Performance tracking started: ${trackerId}`, context);
  }

  /**
   * End performance tracking
   */
  endPerf(trackerId: string, context: LogContext = {}, data?: any): number {
    const metrics = this.performanceTrackers.get(trackerId);
    if (!metrics) {
      this.warn(`Performance tracker not found: ${trackerId}`, context);
      return 0;
    }

    metrics.endTime = Date.now();
    metrics.duration = metrics.endTime - metrics.startTime;
    metrics.memoryAfter = process.memoryUsage?.() || {} as NodeJS.MemoryUsage;
    
    if (metrics.memoryAfter) {
      metrics.memoryDelta = {
        heapUsed: metrics.memoryAfter.heapUsed - metrics.memoryBefore.heapUsed,
        heapTotal: metrics.memoryAfter.heapTotal - metrics.memoryBefore.heapTotal,
        external: metrics.memoryAfter.external - metrics.memoryBefore.external
      };
    }

    this.addLog(this.createLogEntry('PERF', `Performance: ${trackerId}`, context, {
      ...data,
      metrics: {
        duration: metrics.duration,
        memoryDelta: metrics.memoryDelta
      }
    }, metrics.duration));

    this.performanceTrackers.delete(trackerId);
    return metrics.duration;
  }

  /**
   * Log slide generation details
   */
  logSlideGeneration(slideIndex: number, spec: any, context: LogContext = {}): void {
    this.info(`Generating slide ${slideIndex + 1}`, {
      ...context,
      operation: 'slide-generation',
      stage: 'processing'
    }, {
      slideIndex,
      title: spec.title,
      layout: spec.layout,
      hasContent: {
        bullets: !!(spec.bullets && spec.bullets.length > 0),
        paragraph: !!spec.paragraph,
        image: !!spec.imagePrompt
      }
    });
  }

  /**
   * Log AI API calls
   */
  logAICall(prompt: string, response: any, context: LogContext = {}): void {
    this.info('AI API call completed', {
      ...context,
      operation: 'ai-generation',
      stage: 'api-call'
    }, {
      promptLength: prompt.length,
      responseType: typeof response,
      hasContent: !!response
    });
  }

  /**
   * Get recent logs for debugging
   */
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * Get logs by request ID
   */
  getLogsByRequestId(requestId: string): LogEntry[] {
    return this.logs.filter(log => log.context.requestId === requestId);
  }

  /**
   * Get error summary for self-correction
   */
  getErrorSummary(): { errors: LogEntry[], patterns: Record<string, number> } {
    const errors = this.logs.filter(log => log.level === 'ERROR');
    const patterns: Record<string, number> = {};
    
    errors.forEach(error => {
      const key = error.message.split(':')[0]; // Get error type
      patterns[key] = (patterns[key] || 0) + 1;
    });

    return { errors, patterns };
  }

  /**
   * Clear logs (for testing)
   */
  clear(): void {
    this.logs = [];
    this.performanceTrackers.clear();
  }
}

// Export singleton instance
export const logger = new SmartLogger();
export default logger;
