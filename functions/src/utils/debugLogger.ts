/**
 * Advanced Debugging System for AI PowerPoint Generator
 * Provides comprehensive logging, tracing, and monitoring capabilities
 */

import { v4 as uuidv4 } from 'uuid';

// Debug levels for granular control
export enum DebugLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

// Debug categories for organized logging
export enum DebugCategory {
  API = 'API',
  AI_MODEL = 'AI_MODEL',
  PPT_GENERATION = 'PPT_GENERATION',
  VALIDATION = 'VALIDATION',
  PERFORMANCE = 'PERFORMANCE',
  ERROR = 'ERROR',
  USER_ACTION = 'USER_ACTION',
  SYSTEM = 'SYSTEM'
}

// Configuration interface
interface DebugConfig {
  enabled: boolean;
  level: DebugLevel;
  categories: DebugCategory[];
  includeStackTrace: boolean;
  includeTimestamp: boolean;
  colorOutput: boolean;
  logToFile: boolean;
  maxLogSize: number;
}

// Default configuration
const DEFAULT_CONFIG: DebugConfig = {
  enabled: process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true',
  level: process.env.DEBUG_LEVEL ? parseInt(process.env.DEBUG_LEVEL) : DebugLevel.INFO,
  categories: Object.values(DebugCategory),
  includeStackTrace: true,
  includeTimestamp: true,
  colorOutput: true,
  logToFile: false,
  maxLogSize: 10000
};

// Color codes for console output
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Level colors
const LEVEL_COLORS = {
  [DebugLevel.ERROR]: COLORS.red,
  [DebugLevel.WARN]: COLORS.yellow,
  [DebugLevel.INFO]: COLORS.green,
  [DebugLevel.DEBUG]: COLORS.blue,
  [DebugLevel.TRACE]: COLORS.cyan
};

// Category colors
const CATEGORY_COLORS = {
  [DebugCategory.API]: COLORS.green,
  [DebugCategory.AI_MODEL]: COLORS.magenta,
  [DebugCategory.PPT_GENERATION]: COLORS.blue,
  [DebugCategory.VALIDATION]: COLORS.yellow,
  [DebugCategory.PERFORMANCE]: COLORS.cyan,
  [DebugCategory.ERROR]: COLORS.red,
  [DebugCategory.USER_ACTION]: COLORS.white,
  [DebugCategory.SYSTEM]: COLORS.bright
};

// Request context for tracing
interface RequestContext {
  requestId: string;
  userId?: string;
  endpoint: string;
  startTime: number;
  userAgent?: string;
  ip?: string;
}

// Performance metrics
interface PerformanceMetrics {
  requestId: string;
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  memoryUsage?: NodeJS.MemoryUsage;
  metadata?: Record<string, any>;
}

// Log entry structure
interface LogEntry {
  id: string;
  timestamp: string;
  level: DebugLevel;
  category: DebugCategory;
  message: string;
  requestId?: string;
  metadata?: Record<string, any>;
  stackTrace?: string;
  performance?: PerformanceMetrics;
}

class DebugLogger {
  private config: DebugConfig;
  private logs: LogEntry[] = [];
  private activeRequests: Map<string, RequestContext> = new Map();
  private performanceMetrics: Map<string, PerformanceMetrics> = new Map();

  constructor(config: Partial<DebugConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // Update configuration
  updateConfig(config: Partial<DebugConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Create request context
  createRequestContext(endpoint: string, metadata?: Record<string, any>): string {
    const requestId = uuidv4();
    const context: RequestContext = {
      requestId,
      endpoint,
      startTime: Date.now(),
      ...metadata
    };
    this.activeRequests.set(requestId, context);
    
    this.log(DebugLevel.INFO, DebugCategory.API, `🚀 Request started: ${endpoint}`, requestId, {
      endpoint,
      timestamp: new Date().toISOString(),
      ...metadata
    });
    
    return requestId;
  }

  // End request context
  endRequestContext(requestId: string, success: boolean = true, metadata?: Record<string, any>): void {
    const context = this.activeRequests.get(requestId);
    if (context) {
      const duration = Date.now() - context.startTime;
      const status = success ? '✅' : '❌';
      
      this.log(
        success ? DebugLevel.INFO : DebugLevel.ERROR,
        DebugCategory.API,
        `${status} Request completed: ${context.endpoint} (${duration}ms)`,
        requestId,
        {
          endpoint: context.endpoint,
          duration,
          success,
          ...metadata
        }
      );
      
      this.activeRequests.delete(requestId);
    }
  }

  // Start performance tracking
  startPerformanceTracking(operation: string, requestId?: string): string {
    const perfId = uuidv4();
    const metrics: PerformanceMetrics = {
      requestId: requestId || 'standalone',
      operation,
      startTime: Date.now(),
      memoryUsage: process.memoryUsage()
    };
    
    this.performanceMetrics.set(perfId, metrics);
    
    this.log(DebugLevel.DEBUG, DebugCategory.PERFORMANCE, `⏱️ Performance tracking started: ${operation}`, requestId, {
      perfId,
      operation,
      memoryUsage: metrics.memoryUsage
    });
    
    return perfId;
  }

  // End performance tracking
  endPerformanceTracking(perfId: string, metadata?: Record<string, any>): PerformanceMetrics | null {
    const metrics = this.performanceMetrics.get(perfId);
    if (metrics) {
      metrics.endTime = Date.now();
      metrics.duration = metrics.endTime - metrics.startTime;
      metrics.metadata = metadata;
      
      const finalMemory = process.memoryUsage();
      const memoryDelta = {
        heapUsed: finalMemory.heapUsed - (metrics.memoryUsage?.heapUsed || 0),
        heapTotal: finalMemory.heapTotal - (metrics.memoryUsage?.heapTotal || 0)
      };
      
      this.log(DebugLevel.DEBUG, DebugCategory.PERFORMANCE, 
        `⏱️ Performance tracking completed: ${metrics.operation} (${metrics.duration}ms)`,
        metrics.requestId,
        {
          perfId,
          operation: metrics.operation,
          duration: metrics.duration,
          memoryDelta,
          finalMemory,
          ...metadata
        }
      );
      
      this.performanceMetrics.delete(perfId);
      return metrics;
    }
    return null;
  }

  // Core logging method
  private log(level: DebugLevel, category: DebugCategory, message: string, requestId?: string, metadata?: Record<string, any>): void {
    if (!this.config.enabled || level > this.config.level || !this.config.categories.includes(category)) {
      return;
    }

    const logEntry: LogEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      requestId,
      metadata,
      stackTrace: this.config.includeStackTrace && level <= DebugLevel.WARN ? new Error().stack : undefined
    };

    this.logs.push(logEntry);
    
    // Trim logs if they exceed max size
    if (this.logs.length > this.config.maxLogSize) {
      this.logs = this.logs.slice(-this.config.maxLogSize);
    }

    this.outputLog(logEntry);
  }

  // Format and output log entry
  private outputLog(entry: LogEntry): void {
    const levelName = DebugLevel[entry.level];
    const timestamp = this.config.includeTimestamp ? `[${entry.timestamp}] ` : '';
    const requestId = entry.requestId ? `[${entry.requestId.slice(0, 8)}] ` : '';
    
    let output = `${timestamp}${requestId}[${levelName}] [${entry.category}] ${entry.message}`;
    
    if (this.config.colorOutput) {
      const levelColor = LEVEL_COLORS[entry.level] || COLORS.white;
      const categoryColor = CATEGORY_COLORS[entry.category] || COLORS.white;
      output = `${COLORS.bright}${timestamp}${COLORS.reset}${COLORS.cyan}${requestId}${COLORS.reset}${levelColor}[${levelName}]${COLORS.reset} ${categoryColor}[${entry.category}]${COLORS.reset} ${entry.message}`;
    }
    
    console.log(output);
    
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      console.log('  📊 Metadata:', JSON.stringify(entry.metadata, null, 2));
    }
    
    if (entry.stackTrace && entry.level <= DebugLevel.WARN) {
      console.log('  📍 Stack Trace:', entry.stackTrace);
    }
  }

  // Public logging methods
  error(message: string, requestId?: string, metadata?: Record<string, any>): void {
    this.log(DebugLevel.ERROR, DebugCategory.ERROR, `❌ ${message}`, requestId, metadata);
  }

  warn(message: string, category: DebugCategory = DebugCategory.SYSTEM, requestId?: string, metadata?: Record<string, any>): void {
    this.log(DebugLevel.WARN, category, `⚠️ ${message}`, requestId, metadata);
  }

  info(message: string, category: DebugCategory = DebugCategory.SYSTEM, requestId?: string, metadata?: Record<string, any>): void {
    this.log(DebugLevel.INFO, category, `ℹ️ ${message}`, requestId, metadata);
  }

  debug(message: string, category: DebugCategory = DebugCategory.SYSTEM, requestId?: string, metadata?: Record<string, any>): void {
    this.log(DebugLevel.DEBUG, category, `🔍 ${message}`, requestId, metadata);
  }

  trace(message: string, category: DebugCategory = DebugCategory.SYSTEM, requestId?: string, metadata?: Record<string, any>): void {
    this.log(DebugLevel.TRACE, category, `🔬 ${message}`, requestId, metadata);
  }

  // AI Model specific logging
  aiModelCall(model: string, prompt: string, requestId?: string, metadata?: Record<string, any>): void {
    this.log(DebugLevel.INFO, DebugCategory.AI_MODEL, `🤖 AI Model Call: ${model}`, requestId, {
      model,
      promptLength: prompt.length,
      promptPreview: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
      ...metadata
    });
  }

  aiModelResponse(model: string, response: any, requestId?: string, metadata?: Record<string, any>): void {
    this.log(DebugLevel.INFO, DebugCategory.AI_MODEL, `🤖 AI Model Response: ${model}`, requestId, {
      model,
      responseLength: typeof response === 'string' ? response.length : JSON.stringify(response).length,
      responsePreview: typeof response === 'string' ? 
        response.substring(0, 100) + (response.length > 100 ? '...' : '') :
        JSON.stringify(response).substring(0, 100) + '...',
      ...metadata
    });
  }

  // PowerPoint generation specific logging
  pptGenerationStart(slideCount: number, theme: string, requestId?: string): void {
    this.log(DebugLevel.INFO, DebugCategory.PPT_GENERATION, `📊 PPT Generation Started`, requestId, {
      slideCount,
      theme,
      startTime: new Date().toISOString()
    });
  }

  pptGenerationComplete(filename: string, fileSize: number, requestId?: string, metadata?: Record<string, any>): void {
    this.log(DebugLevel.INFO, DebugCategory.PPT_GENERATION, `📊 PPT Generation Complete: ${filename}`, requestId, {
      filename,
      fileSize,
      fileSizeMB: (fileSize / 1024 / 1024).toFixed(2),
      ...metadata
    });
  }

  // User action logging
  userAction(action: string, requestId?: string, metadata?: Record<string, any>): void {
    this.log(DebugLevel.INFO, DebugCategory.USER_ACTION, `👤 User Action: ${action}`, requestId, metadata);
  }

  // Validation logging
  validationResult(type: string, passed: boolean, score?: number, requestId?: string, metadata?: Record<string, any>): void {
    const status = passed ? '✅' : '❌';
    const scoreText = score !== undefined ? ` (Score: ${score})` : '';
    this.log(DebugLevel.INFO, DebugCategory.VALIDATION, `${status} Validation: ${type}${scoreText}`, requestId, metadata);
  }

  // Get logs for debugging
  getLogs(filter?: { level?: DebugLevel; category?: DebugCategory; requestId?: string }): LogEntry[] {
    let filteredLogs = this.logs;
    
    if (filter) {
      filteredLogs = this.logs.filter(log => {
        if (filter.level !== undefined && log.level > filter.level) return false;
        if (filter.category && log.category !== filter.category) return false;
        if (filter.requestId && log.requestId !== filter.requestId) return false;
        return true;
      });
    }
    
    return filteredLogs;
  }

  // Get active requests
  getActiveRequests(): RequestContext[] {
    return Array.from(this.activeRequests.values());
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
  }

  // Export logs as JSON
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Create singleton instance
export const debugLogger = new DebugLogger();

// Export types and enums
export { DebugConfig, LogEntry, RequestContext, PerformanceMetrics };
