/**
 * Frontend Debug Logger - Comprehensive Client-Side Debugging System
 * Provides organized logging, API tracking, user interaction monitoring, and error reporting
 */

// Debug levels for granular control
export const DebugLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
} as const;

export type DebugLevel = typeof DebugLevel[keyof typeof DebugLevel];

// Helper to get level name from number
const DebugLevelNames = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'] as const;

// Debug categories for organized logging
export const DebugCategory = {
  API: 'API',
  USER_INTERACTION: 'USER_INTERACTION',
  COMPONENT: 'COMPONENT',
  PERFORMANCE: 'PERFORMANCE',
  ERROR: 'ERROR',
  VALIDATION: 'VALIDATION',
  NAVIGATION: 'NAVIGATION',
  STORAGE: 'STORAGE'
} as const;

export type DebugCategory = typeof DebugCategory[keyof typeof DebugCategory];

// Configuration interface
interface DebugConfig {
  enabled: boolean;
  level: DebugLevel;
  categories: DebugCategory[];
  persistLogs: boolean;
  maxLogSize: number;
  showInConsole: boolean;
  showVisualDebugger: boolean;
  apiTracking: boolean;
  performanceTracking: boolean;
}

// Default configuration
const DEFAULT_CONFIG: DebugConfig = {
  enabled: process.env.NODE_ENV === 'development' || localStorage.getItem('debug') === 'true',
  level: parseInt(localStorage.getItem('debugLevel') || '2') as DebugLevel,
  categories: Object.values(DebugCategory),
  persistLogs: true,
  maxLogSize: 1000,
  showInConsole: true,
  showVisualDebugger: process.env.NODE_ENV === 'development',
  apiTracking: true,
  performanceTracking: true
};

// Color schemes for different categories
const CATEGORY_COLORS = {
  [DebugCategory.API]: '#10B981',
  [DebugCategory.USER_INTERACTION]: '#3B82F6',
  [DebugCategory.COMPONENT]: '#8B5CF6',
  [DebugCategory.PERFORMANCE]: '#F59E0B',
  [DebugCategory.ERROR]: '#EF4444',
  [DebugCategory.VALIDATION]: '#F97316',
  [DebugCategory.NAVIGATION]: '#06B6D4',
  [DebugCategory.STORAGE]: '#84CC16'
};

// Log entry structure
interface LogEntry {
  id: string;
  timestamp: string;
  level: DebugLevel;
  category: DebugCategory;
  message: string;
  metadata?: Record<string, any>;
  stackTrace?: string;
  url?: string;
  userAgent?: string;
  sessionId: string;
}

// API call tracking
interface APICall {
  id: string;
  url: string;
  method: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status?: number;
  requestData?: any;
  responseData?: any;
  error?: string;
  sessionId: string;
}

// Performance metrics
interface PerformanceMetric {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
  sessionId: string;
}

// User interaction tracking
interface UserInteraction {
  id: string;
  type: 'click' | 'input' | 'navigation' | 'form_submit' | 'error' | 'custom';
  element?: string;
  data?: any;
  timestamp: string;
  sessionId: string;
}

class FrontendDebugLogger {
  public config: DebugConfig;
  private logs: LogEntry[] = [];
  private apiCalls: APICall[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private userInteractions: UserInteraction[] = [];
  private sessionId: string;
  private debugPanel?: HTMLElement;

  constructor(config: Partial<DebugConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionId = this.generateSessionId();
    
    if (this.config.persistLogs) {
      this.loadPersistedLogs();
    }
    
    if (this.config.showVisualDebugger) {
      this.createDebugPanel();
    }
    
    this.setupGlobalErrorHandling();
    this.setupPerformanceObserver();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Update configuration
  updateConfig(config: Partial<DebugConfig>): void {
    this.config = { ...this.config, ...config };
    if (config.showVisualDebugger !== undefined) {
      if (config.showVisualDebugger && !this.debugPanel) {
        this.createDebugPanel();
      } else if (!config.showVisualDebugger && this.debugPanel) {
        this.debugPanel.remove();
        this.debugPanel = undefined;
      }
    }
  }

  // Core logging method
  private log(level: DebugLevel, category: DebugCategory, message: string, metadata?: Record<string, any>): void {
    if (!this.config.enabled || level > this.config.level || !this.config.categories.includes(category)) {
      return;
    }

    const logEntry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      metadata,
      url: window.location.href,
      userAgent: navigator.userAgent,
      sessionId: this.sessionId,
      stackTrace: level <= DebugLevel.WARN ? new Error().stack : undefined
    };

    this.logs.push(logEntry);
    
    // Trim logs if they exceed max size
    if (this.logs.length > this.config.maxLogSize) {
      this.logs = this.logs.slice(-this.config.maxLogSize);
    }

    if (this.config.showInConsole) {
      this.outputToConsole(logEntry);
    }

    if (this.debugPanel) {
      this.updateDebugPanel();
    }

    if (this.config.persistLogs) {
      this.persistLogs();
    }
  }

  // Console output with styling
  private outputToConsole(entry: LogEntry): void {
    const levelName = DebugLevelNames[entry.level] || 'UNKNOWN';
    const color = CATEGORY_COLORS[entry.category];
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    
    const style = `color: ${color}; font-weight: bold;`;
    const messageStyle = 'color: inherit; font-weight: normal;';
    
    console.log(
      `%c[${timestamp}] [${levelName}] [${entry.category}]%c ${entry.message}`,
      style,
      messageStyle
    );
    
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      console.log('📊 Metadata:', entry.metadata);
    }
    
    if (entry.stackTrace && entry.level <= DebugLevel.WARN) {
      console.log('📍 Stack Trace:', entry.stackTrace);
    }
  }

  // Public logging methods
  error(message: string, metadata?: Record<string, any>): void {
    this.log(DebugLevel.ERROR, DebugCategory.ERROR, `❌ ${message}`, metadata);
  }

  warn(message: string, category: DebugCategory = DebugCategory.COMPONENT, metadata?: Record<string, any>): void {
    this.log(DebugLevel.WARN, category, `⚠️ ${message}`, metadata);
  }

  info(message: string, category: DebugCategory = DebugCategory.COMPONENT, metadata?: Record<string, any>): void {
    this.log(DebugLevel.INFO, category, `ℹ️ ${message}`, metadata);
  }

  debug(message: string, category: DebugCategory = DebugCategory.COMPONENT, metadata?: Record<string, any>): void {
    this.log(DebugLevel.DEBUG, category, `🔍 ${message}`, metadata);
  }

  trace(message: string, category: DebugCategory = DebugCategory.COMPONENT, metadata?: Record<string, any>): void {
    this.log(DebugLevel.TRACE, category, `🔬 ${message}`, metadata);
  }

  // API call tracking
  trackAPICall(url: string, method: string, requestData?: any): string {
    const apiCall: APICall = {
      id: `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url,
      method,
      startTime: Date.now(),
      requestData,
      sessionId: this.sessionId
    };

    this.apiCalls.push(apiCall);
    
    this.log(DebugLevel.INFO, DebugCategory.API, `🚀 API Call Started: ${method} ${url}`, {
      apiCallId: apiCall.id,
      requestData: requestData ? JSON.stringify(requestData).substring(0, 200) + '...' : undefined
    });

    return apiCall.id;
  }

  completeAPICall(apiCallId: string, status: number, responseData?: any, error?: string): void {
    const apiCall = this.apiCalls.find(call => call.id === apiCallId);
    if (apiCall) {
      apiCall.endTime = Date.now();
      apiCall.duration = apiCall.endTime - apiCall.startTime;
      apiCall.status = status;
      apiCall.responseData = responseData;
      apiCall.error = error;

      const success = status >= 200 && status < 300;
      const statusIcon = success ? '✅' : '❌';
      
      this.log(
        success ? DebugLevel.INFO : DebugLevel.ERROR,
        DebugCategory.API,
        `${statusIcon} API Call Completed: ${apiCall.method} ${apiCall.url} (${apiCall.duration}ms, ${status})`,
        {
          apiCallId,
          duration: apiCall.duration,
          status,
          success,
          error,
          responsePreview: responseData ? JSON.stringify(responseData).substring(0, 200) + '...' : undefined
        }
      );
    }
  }

  // Performance tracking
  startPerformanceTracking(name: string, metadata?: Record<string, any>): string {
    const metric: PerformanceMetric = {
      id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      startTime: performance.now(),
      metadata,
      sessionId: this.sessionId
    };

    this.performanceMetrics.push(metric);
    
    this.log(DebugLevel.DEBUG, DebugCategory.PERFORMANCE, `⏱️ Performance Tracking Started: ${name}`, {
      perfId: metric.id,
      ...metadata
    });

    return metric.id;
  }

  endPerformanceTracking(perfId: string, metadata?: Record<string, any>): PerformanceMetric | null {
    const metric = this.performanceMetrics.find(m => m.id === perfId);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      metric.metadata = { ...metric.metadata, ...metadata };

      this.log(DebugLevel.DEBUG, DebugCategory.PERFORMANCE, 
        `⏱️ Performance Tracking Completed: ${metric.name} (${metric.duration.toFixed(2)}ms)`,
        {
          perfId,
          duration: metric.duration,
          ...metadata
        }
      );

      return metric;
    }
    return null;
  }

  // User interaction tracking
  trackUserInteraction(type: UserInteraction['type'], element?: string, data?: any): void {
    const interaction: UserInteraction = {
      id: `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      element,
      data,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId
    };

    this.userInteractions.push(interaction);
    
    this.log(DebugLevel.DEBUG, DebugCategory.USER_INTERACTION, 
      `👤 User Interaction: ${type}${element ? ` on ${element}` : ''}`,
      { interactionId: interaction.id, data }
    );
  }

  // Global error handling
  private setupGlobalErrorHandling(): void {
    window.addEventListener('error', (event) => {
      this.error('Global JavaScript Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled Promise Rejection', {
        reason: event.reason,
        stack: event.reason?.stack
      });
    });
  }

  // Performance observer setup
  private setupPerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.log(DebugLevel.INFO, DebugCategory.PERFORMANCE,
              `🚀 Page Load Performance`, {
                loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
                domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
                totalTime: navEntry.loadEventEnd - navEntry.fetchStart
              }
            );
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['navigation', 'measure'] });
      } catch (e) {
        // Observer not supported for some entry types
      }
    }
  }

  // Persistence methods
  private persistLogs(): void {
    try {
      const data = {
        logs: this.logs.slice(-100), // Keep last 100 logs
        apiCalls: this.apiCalls.slice(-50),
        performanceMetrics: this.performanceMetrics.slice(-50),
        userInteractions: this.userInteractions.slice(-100)
      };
      localStorage.setItem('debugLogs', JSON.stringify(data));
    } catch (e) {
      // Storage quota exceeded or not available
    }
  }

  private loadPersistedLogs(): void {
    try {
      const data = localStorage.getItem('debugLogs');
      if (data) {
        const parsed = JSON.parse(data);
        this.logs = parsed.logs || [];
        this.apiCalls = parsed.apiCalls || [];
        this.performanceMetrics = parsed.performanceMetrics || [];
        this.userInteractions = parsed.userInteractions || [];
      }
    } catch (e) {
      // Invalid data or not available
    }
  }

  // Debug panel creation (will be expanded in next file)
  private createDebugPanel(): void {
    // This will be implemented in the debug dashboard component
    this.log(DebugLevel.INFO, DebugCategory.COMPONENT, 'Debug panel creation placeholder');
  }

  private updateDebugPanel(): void {
    // This will be implemented in the debug dashboard component
  }

  // Export methods
  exportLogs(): string {
    return JSON.stringify({
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      logs: this.logs,
      apiCalls: this.apiCalls,
      performanceMetrics: this.performanceMetrics,
      userInteractions: this.userInteractions
    }, null, 2);
  }

  clearLogs(): void {
    this.logs = [];
    this.apiCalls = [];
    this.performanceMetrics = [];
    this.userInteractions = [];
    if (this.config.persistLogs) {
      localStorage.removeItem('debugLogs');
    }
  }

  // Getters for accessing data
  getLogs(filter?: { level?: DebugLevel; category?: DebugCategory }): LogEntry[] {
    let filteredLogs = this.logs;
    
    if (filter) {
      filteredLogs = this.logs.filter(log => {
        if (filter.level !== undefined && log.level > filter.level) return false;
        if (filter.category && log.category !== filter.category) return false;
        return true;
      });
    }
    
    return filteredLogs;
  }

  getAPICallStats(): { total: number; successful: number; failed: number; averageTime: number } {
    const completed = this.apiCalls.filter(call => call.endTime);
    const successful = completed.filter(call => call.status && call.status >= 200 && call.status < 300);
    const failed = completed.filter(call => call.status && (call.status < 200 || call.status >= 300));
    const averageTime = completed.length > 0 
      ? completed.reduce((sum, call) => sum + (call.duration || 0), 0) / completed.length 
      : 0;

    return {
      total: completed.length,
      successful: successful.length,
      failed: failed.length,
      averageTime
    };
  }
}

// Create singleton instance
export const frontendDebugLogger = new FrontendDebugLogger();

// Export types
export type { DebugConfig, LogEntry, APICall, PerformanceMetric, UserInteraction };

// React Hook for debugging
import { useCallback } from 'react';

export function useDebugLogger() {
  const trackAPICall = useCallback((url: string, method: string, requestData?: any) => {
    return frontendDebugLogger.trackAPICall(url, method, requestData);
  }, []);

  const completeAPICall = useCallback((apiCallId: string, status: number, responseData?: any, error?: string) => {
    frontendDebugLogger.completeAPICall(apiCallId, status, responseData, error);
  }, []);

  const trackUserInteraction = useCallback((type: UserInteraction['type'], element?: string, data?: any) => {
    frontendDebugLogger.trackUserInteraction(type, element, data);
  }, []);

  const startPerformanceTracking = useCallback((name: string, metadata?: Record<string, any>) => {
    return frontendDebugLogger.startPerformanceTracking(name, metadata);
  }, []);

  const endPerformanceTracking = useCallback((perfId: string, metadata?: Record<string, any>) => {
    return frontendDebugLogger.endPerformanceTracking(perfId, metadata);
  }, []);

  const log = useCallback(() => ({
    error: (message: string, metadata?: Record<string, any>) => frontendDebugLogger.error(message, metadata),
    warn: (message: string, category?: DebugCategory, metadata?: Record<string, any>) => frontendDebugLogger.warn(message, category, metadata),
    info: (message: string, category?: DebugCategory, metadata?: Record<string, any>) => frontendDebugLogger.info(message, category, metadata),
    debug: (message: string, category?: DebugCategory, metadata?: Record<string, any>) => frontendDebugLogger.debug(message, category, metadata),
    trace: (message: string, category?: DebugCategory, metadata?: Record<string, any>) => frontendDebugLogger.trace(message, category, metadata)
  }), []);

  return {
    trackAPICall,
    completeAPICall,
    trackUserInteraction,
    startPerformanceTracking,
    endPerformanceTracking,
    log: log(),
    exportLogs: frontendDebugLogger.exportLogs.bind(frontendDebugLogger),
    clearLogs: frontendDebugLogger.clearLogs.bind(frontendDebugLogger),
    getLogs: frontendDebugLogger.getLogs.bind(frontendDebugLogger),
    getAPICallStats: frontendDebugLogger.getAPICallStats.bind(frontendDebugLogger)
  };
}
