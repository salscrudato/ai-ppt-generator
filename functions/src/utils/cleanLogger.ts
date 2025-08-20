/**
 * Clean Logger for AI PowerPoint Generator
 * Critical-only, user-friendly logging with clear separation
 * 
 * @version 3.0.0 - Production-ready minimal logging
 */

export type LogLevel = 'ERROR' | 'SUCCESS' | 'INFO';

export interface LogContext {
  requestId?: string;
  operation?: string;
}

class CleanLogger {
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Generate unique request ID for tracking
   */
  generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  /**
   * Format timestamp for readability
   */
  private getTimestamp(): string {
    return new Date().toISOString().replace('T', ' ').slice(0, 19);
  }

  /**
   * AI-optimized logging: structured, minimal, debugger-friendly
   */
  private output(level: LogLevel, message: string, context: LogContext = {}): void {
    const timestamp = new Date().toISOString().slice(11, 23); // HH:MM:SS.mmm
    const emoji = {
      ERROR: '🔴',
      SUCCESS: '🟢',
      INFO: '🔵'
    }[level];

    const requestId = context.requestId ? `[${context.requestId.slice(-8)}]` : '';
    const operation = context.operation ? `[${context.operation}]` : '';

    // Structured format for AI parsing: [LEVEL] timestamp | context | message
    console.log(`${emoji} [${level}] ${timestamp} ${requestId}${operation} | ${message}`);
  }

  /**
   * Error logging - Always shown
   */
  error(message: string, context: LogContext = {}, error?: Error): void {
    let fullMessage = message;
    
    if (error) {
      fullMessage += `\nError: ${error.message}`;
      if (!this.isProduction && error.stack) {
        fullMessage += `\nStack: ${error.stack}`;
      }
    }
    
    this.output('ERROR', fullMessage, context);
  }

  /**
   * Success logging - Important milestones only
   */
  success(message: string, context: LogContext = {}): void {
    this.output('SUCCESS', message, context);
  }

  /**
   * Info logging - Critical information only
   */
  info(message: string, context: LogContext = {}): void {
    // Only show info logs in development or for critical operations
    if (!this.isProduction || context.operation === 'startup' || context.operation === 'generation') {
      this.output('INFO', message, context);
    }
  }

  /**
   * Application startup
   */
  startup(message: string): void {
    this.info(message, { operation: 'startup' });
  }

  /**
   * PowerPoint generation events
   */
  generation(message: string, requestId?: string): void {
    this.info(message, { operation: 'generation', requestId });
  }

  /**
   * API key validation
   */
  apiKey(message: string): void {
    this.info(message, { operation: 'api-key' });
  }
}

// Export singleton instance
export const logger = new CleanLogger();
export default logger;
