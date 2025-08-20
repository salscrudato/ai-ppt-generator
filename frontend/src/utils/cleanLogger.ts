/**
 * Clean Frontend Logger
 * Critical-only, user-friendly logging for the frontend
 * 
 * @version 3.0.0 - Production-ready minimal logging
 */

export type LogLevel = 'ERROR' | 'SUCCESS' | 'INFO';

class CleanFrontendLogger {
  private isDevelopment = import.meta.env.DEV;
  private lastMessages = new Map<string, number>();
  private readonly DUPLICATE_THRESHOLD = 3000; // 3 seconds

  /**
   * AI-optimized logging: structured, minimal, debugger-friendly
   */
  private output(level: LogLevel, message: string, data?: any): void {
    // Prevent duplicate messages within threshold
    const messageKey = `${level}:${message}`;
    const now = Date.now();
    const lastTime = this.lastMessages.get(messageKey);

    if (lastTime && (now - lastTime) < this.DUPLICATE_THRESHOLD) {
      return; // Skip duplicate message
    }

    this.lastMessages.set(messageKey, now);

    const timestamp = new Date().toISOString().slice(11, 23); // HH:MM:SS.mmm
    const emoji = {
      ERROR: '🔴',
      SUCCESS: '🟢',
      INFO: '🔵'
    }[level];

    // Structured format for AI parsing: [LEVEL] timestamp | message
    console.log(`${emoji} [${level}] ${timestamp} | ${message}`);

    // Only show essential data for debugging
    if (data && this.isDevelopment && Object.keys(data).length > 0) {
      console.log(`  ├─ ${JSON.stringify(data, null, 0)}`);
    }
  }

  /**
   * Error logging - Always shown
   */
  error(message: string, error?: Error | any): void {
    let fullMessage = message;
    
    if (error) {
      if (error instanceof Error) {
        fullMessage += `\nError: ${error.message}`;
      } else if (typeof error === 'string') {
        fullMessage += `\nError: ${error}`;
      }
    }
    
    this.output('ERROR', fullMessage);
  }

  /**
   * Success logging - Important milestones only
   */
  success(message: string): void {
    this.output('SUCCESS', message);
  }

  /**
   * Info logging - Critical information only
   */
  info(message: string, data?: any): void {
    // Only show info logs in development
    if (this.isDevelopment) {
      this.output('INFO', message, data);
    }
  }

  /**
   * Group related operations to reduce noise
   */
  group(label: string, operations: () => void): void {
    if (this.isDevelopment) {
      console.group(`🔄 ${label}`);
      operations();
      console.groupEnd();
    } else {
      operations();
    }
  }

  /**
   * API call logging - only show important events
   */
  api(message: string): void {
    // Only log API errors and important events, not every call
    if (message.includes('failed') || message.includes('error')) {
      this.error(`API: ${message}`);
    }
  }

  /**
   * Generation progress logging
   */
  generation(message: string, id?: string): void {
    this.info(`🎯 ${message}${id ? ` (${id.slice(-8)})` : ''}`);
  }
}

// Export singleton instance
export const logger = new CleanFrontendLogger();
export default logger;
