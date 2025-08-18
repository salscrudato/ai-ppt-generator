/**
 * Advanced Error Handling System
 * 
 * Provides comprehensive error handling with graceful degradation,
 * detailed logging, recovery mechanisms, and user-friendly error messages.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import { logger, type LogContext } from './smartLogger';

/**
 * Error severity levels
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Error categories for better classification
 */
export type ErrorCategory = 
  | 'validation'
  | 'generation'
  | 'processing'
  | 'network'
  | 'filesystem'
  | 'memory'
  | 'timeout'
  | 'authentication'
  | 'configuration'
  | 'external_service';

/**
 * Enhanced error interface
 */
export interface EnhancedError extends Error {
  code?: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  context?: LogContext;
  userMessage?: string;
  technicalDetails?: Record<string, any>;
  recoverable?: boolean;
  retryable?: boolean;
  timestamp: Date;
  requestId?: string;
  cause?: Error;
}

/**
 * Recovery strategy interface
 */
export interface RecoveryStrategy {
  name: string;
  description: string;
  execute: (error: EnhancedError, context?: any) => Promise<any>;
  applicable: (error: EnhancedError) => boolean;
}

/**
 * Error handling configuration
 */
export interface ErrorHandlingConfig {
  enableRecovery: boolean;
  enableRetry: boolean;
  maxRetries: number;
  retryDelay: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableUserFriendlyMessages: boolean;
  enableTelemetry: boolean;
}

/**
 * Advanced Error Handler Class
 */
export class AdvancedErrorHandler {
  private config: ErrorHandlingConfig;
  private recoveryStrategies: RecoveryStrategy[] = [];
  private errorMetrics: Map<string, number> = new Map();

  constructor(config: Partial<ErrorHandlingConfig> = {}) {
    this.config = {
      enableRecovery: true,
      enableRetry: true,
      maxRetries: 3,
      retryDelay: 1000,
      logLevel: 'error',
      enableUserFriendlyMessages: true,
      enableTelemetry: true,
      ...config
    };

    this.initializeDefaultRecoveryStrategies();
  }

  /**
   * Create an enhanced error with comprehensive metadata
   */
  createError(
    message: string,
    options: {
      code?: string;
      severity?: ErrorSeverity;
      category?: ErrorCategory;
      context?: LogContext;
      userMessage?: string;
      technicalDetails?: Record<string, any>;
      recoverable?: boolean;
      retryable?: boolean;
      cause?: Error;
    } = {}
  ): EnhancedError {
    const error = new Error(message) as EnhancedError;
    
    error.code = options.code || 'UNKNOWN_ERROR';
    error.severity = options.severity || 'medium';
    error.category = options.category || 'processing';
    error.context = options.context;
    error.userMessage = options.userMessage || this.generateUserFriendlyMessage(error);
    error.technicalDetails = options.technicalDetails || {};
    error.recoverable = options.recoverable ?? true;
    error.retryable = options.retryable ?? false;
    error.timestamp = new Date();
    error.requestId = options.context?.requestId;

    if (options.cause) {
      error.cause = options.cause;
    }

    return error;
  }

  /**
   * Handle error with comprehensive processing
   */
  async handleError(
    error: Error | EnhancedError,
    context?: LogContext
  ): Promise<{
    handled: boolean;
    recovered: boolean;
    result?: any;
    userMessage: string;
    shouldRetry: boolean;
  }> {
    const enhancedError = this.enhanceError(error, context);
    
    // Log the error
    this.logError(enhancedError);
    
    // Update metrics
    this.updateErrorMetrics(enhancedError);
    
    // Attempt recovery if enabled and applicable
    let recovered = false;
    let result: any = null;
    
    if (this.config.enableRecovery && enhancedError.recoverable) {
      const recoveryResult = await this.attemptRecovery(enhancedError);
      recovered = recoveryResult.success;
      result = recoveryResult.result;
    }

    // Determine if retry should be attempted
    const shouldRetry = this.shouldRetry(enhancedError);

    return {
      handled: true,
      recovered,
      result,
      userMessage: enhancedError.userMessage || 'An error occurred',
      shouldRetry
    };
  }

  /**
   * Execute operation with comprehensive error handling
   */
  async executeWithHandling<T>(
    operation: () => Promise<T>,
    context?: LogContext,
    options?: {
      maxRetries?: number;
      retryDelay?: number;
      fallback?: () => Promise<T>;
    }
  ): Promise<T> {
    const opts = {
      maxRetries: this.config.maxRetries,
      retryDelay: this.config.retryDelay,
      ...options
    };

    let lastError: EnhancedError | null = null;
    
    for (let attempt = 1; attempt <= opts.maxRetries + 1; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = this.enhanceError(error as Error, {
          ...context,
          attempt,
          maxAttempts: opts.maxRetries + 1
        });

        const handleResult = await this.handleError(lastError, context);
        
        if (handleResult.recovered && handleResult.result !== null) {
          return handleResult.result;
        }

        if (attempt <= opts.maxRetries && handleResult.shouldRetry) {
          logger.info('Retrying operation', context, {
            attempt,
            maxAttempts: opts.maxRetries + 1,
            delay: opts.retryDelay
          });
          
          await this.delay(opts.retryDelay * attempt); // Exponential backoff
          continue;
        }

        break;
      }
    }

    // If we have a fallback, try it
    if (options?.fallback) {
      try {
        logger.info('Attempting fallback operation', context);
        return await options.fallback();
      } catch (fallbackError) {
        logger.error('Fallback operation failed', context, {
          fallbackError: fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
        });
      }
    }

    // All attempts failed
    throw lastError || new Error('Operation failed after all retry attempts');
  }

  /**
   * Add custom recovery strategy
   */
  addRecoveryStrategy(strategy: RecoveryStrategy): void {
    this.recoveryStrategies.push(strategy);
  }

  /**
   * Get error metrics for monitoring
   */
  getErrorMetrics(): Record<string, any> {
    return {
      errorCounts: Object.fromEntries(this.errorMetrics),
      totalErrors: Array.from(this.errorMetrics.values()).reduce((sum, count) => sum + count, 0),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clear error metrics
   */
  clearMetrics(): void {
    this.errorMetrics.clear();
  }

  /**
   * Enhance a regular error to an EnhancedError
   */
  private enhanceError(error: Error | EnhancedError, context?: LogContext): EnhancedError {
    if (this.isEnhancedError(error)) {
      return error;
    }

    // Analyze error to determine category and severity
    const analysis = this.analyzeError(error);
    
    return this.createError(error.message, {
      code: analysis.code,
      severity: analysis.severity,
      category: analysis.category,
      context,
      technicalDetails: {
        stack: error.stack,
        name: error.name,
        originalError: error.constructor.name
      },
      recoverable: analysis.recoverable,
      retryable: analysis.retryable,
      cause: error
    });
  }

  /**
   * Check if error is already enhanced
   */
  private isEnhancedError(error: Error): error is EnhancedError {
    return 'severity' in error && 'category' in error;
  }

  /**
   * Analyze error to determine characteristics
   */
  private analyzeError(error: Error): {
    code: string;
    severity: ErrorSeverity;
    category: ErrorCategory;
    recoverable: boolean;
    retryable: boolean;
  } {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    // Network errors
    if (message.includes('network') || message.includes('timeout') || message.includes('econnrefused')) {
      return {
        code: 'NETWORK_ERROR',
        severity: 'medium',
        category: 'network',
        recoverable: true,
        retryable: true
      };
    }

    // Validation errors
    if (message.includes('validation') || message.includes('invalid') || name.includes('validation')) {
      return {
        code: 'VALIDATION_ERROR',
        severity: 'low',
        category: 'validation',
        recoverable: false,
        retryable: false
      };
    }

    // Memory errors
    if (message.includes('memory') || message.includes('heap')) {
      return {
        code: 'MEMORY_ERROR',
        severity: 'high',
        category: 'memory',
        recoverable: true,
        retryable: false
      };
    }

    // File system errors
    if (message.includes('enoent') || message.includes('file') || message.includes('directory')) {
      return {
        code: 'FILESYSTEM_ERROR',
        severity: 'medium',
        category: 'filesystem',
        recoverable: true,
        retryable: true
      };
    }

    // Default classification
    return {
      code: 'GENERAL_ERROR',
      severity: 'medium',
      category: 'processing',
      recoverable: true,
      retryable: false
    };
  }

  /**
   * Generate user-friendly error message
   */
  private generateUserFriendlyMessage(error: EnhancedError): string {
    if (!this.config.enableUserFriendlyMessages) {
      return error.message;
    }

    const categoryMessages: Record<ErrorCategory, string> = {
      validation: 'Please check your input and try again.',
      generation: 'There was an issue generating your presentation. Please try again.',
      processing: 'We encountered a processing error. Please try again.',
      network: 'Network connection issue. Please check your connection and try again.',
      filesystem: 'File access error. Please try again.',
      memory: 'System resources are temporarily unavailable. Please try again.',
      timeout: 'The operation took too long. Please try again.',
      authentication: 'Authentication failed. Please check your credentials.',
      configuration: 'System configuration error. Please contact support.',
      external_service: 'External service is temporarily unavailable. Please try again.'
    };

    return categoryMessages[error.category] || 'An unexpected error occurred. Please try again.';
  }

  /**
   * Log error with appropriate level
   */
  private logError(error: EnhancedError): void {
    const logData = {
      code: error.code,
      severity: error.severity,
      category: error.category,
      userMessage: error.userMessage,
      technicalDetails: error.technicalDetails,
      recoverable: error.recoverable,
      retryable: error.retryable,
      timestamp: error.timestamp.toISOString()
    };

    switch (error.severity) {
      case 'critical':
        logger.error(error.message, error.context, logData);
        break;
      case 'high':
        logger.error(error.message, error.context, logData);
        break;
      case 'medium':
        logger.warn(error.message, error.context, logData);
        break;
      case 'low':
        logger.info(error.message, error.context, logData);
        break;
    }
  }

  /**
   * Update error metrics for monitoring
   */
  private updateErrorMetrics(error: EnhancedError): void {
    if (!this.config.enableTelemetry) return;

    const key = `${error.category}:${error.code}`;
    const current = this.errorMetrics.get(key) || 0;
    this.errorMetrics.set(key, current + 1);
  }

  /**
   * Attempt error recovery using available strategies
   */
  private async attemptRecovery(error: EnhancedError): Promise<{ success: boolean; result?: any }> {
    for (const strategy of this.recoveryStrategies) {
      if (strategy.applicable(error)) {
        try {
          logger.info('Attempting recovery strategy', error.context, { strategy: strategy.name });
          const result = await strategy.execute(error);
          logger.info('Recovery strategy succeeded', error.context, { strategy: strategy.name });
          return { success: true, result };
        } catch (recoveryError) {
          logger.warn('Recovery strategy failed', error.context, {
            strategy: strategy.name,
            recoveryError: recoveryError instanceof Error ? recoveryError.message : String(recoveryError)
          });
        }
      }
    }

    return { success: false };
  }

  /**
   * Determine if error should trigger a retry
   */
  private shouldRetry(error: EnhancedError): boolean {
    return this.config.enableRetry &&
           (error.retryable ?? false) &&
           error.severity !== 'critical';
  }

  /**
   * Delay utility for retry backoff
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Initialize default recovery strategies
   */
  private initializeDefaultRecoveryStrategies(): void {
    // Memory cleanup strategy
    this.addRecoveryStrategy({
      name: 'memory_cleanup',
      description: 'Attempt to free memory and retry',
      applicable: (error) => error.category === 'memory',
      execute: async () => {
        if (global.gc) {
          global.gc();
        }
        await this.delay(1000);
        return null;
      }
    });

    // Network retry strategy
    this.addRecoveryStrategy({
      name: 'network_retry',
      description: 'Wait and retry network operation',
      applicable: (error) => error.category === 'network',
      execute: async () => {
        await this.delay(2000);
        return null;
      }
    });

    // File system retry strategy
    this.addRecoveryStrategy({
      name: 'filesystem_retry',
      description: 'Retry file system operation',
      applicable: (error) => error.category === 'filesystem',
      execute: async () => {
        await this.delay(500);
        return null;
      }
    });
  }
}

// Export singleton instance
export const advancedErrorHandler = new AdvancedErrorHandler();
export default advancedErrorHandler;
