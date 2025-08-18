/**
 * Environment Configuration
 * 
 * Secure configuration management for local and production deployments
 */

import { logger } from '../utils/smartLogger';

export interface EnvironmentConfig {
  openaiApiKey: string;
  nodeEnv: 'development' | 'production' | 'test';
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;
  port: number;
  corsOrigins: string[];
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

class EnvironmentManager {
  private config: EnvironmentConfig;
  private initialized = false;

  constructor() {
    this.config = this.loadConfiguration();
    this.validateConfiguration();
    this.initialized = true;
  }

  /**
   * Load configuration from environment variables with fallbacks
   */
  private loadConfiguration(): EnvironmentConfig {
    const nodeEnv = (process.env.NODE_ENV || 'development') as EnvironmentConfig['nodeEnv'];
    
    // OpenAI API Key with multiple sources
    const openaiApiKey = this.loadOpenAIApiKey();
    
    return {
      openaiApiKey,
      nodeEnv,
      isProduction: nodeEnv === 'production',
      isDevelopment: nodeEnv === 'development',
      isTest: nodeEnv === 'test',
      port: parseInt(process.env.PORT || '5001', 10),
      corsOrigins: this.loadCorsOrigins(),
      logLevel: (process.env.LOG_LEVEL || 'info') as EnvironmentConfig['logLevel']
    };
  }

  /**
   * Load OpenAI API key from multiple sources with priority
   */
  private loadOpenAIApiKey(): string {
    // Priority order:
    // 1. Environment variable (production)
    // 2. Firebase config (production)
    // 3. Local development key (development only)
    
    // Check environment variable first
    if (process.env.OPENAI_API_KEY) {
      logger.info('OpenAI API key loaded from environment variable');
      return process.env.OPENAI_API_KEY;
    }

    // Check Firebase functions config
    if (process.env.FUNCTIONS_EMULATOR !== 'true') {
      try {
        const functions = require('firebase-functions');
        const config = functions.config();
        if (config.openai?.api_key) {
          logger.info('OpenAI API key loaded from Firebase config');
          return config.openai.api_key;
        }
      } catch (error) {
        logger.debug('Firebase config not available', {}, error);
      }
    }

    // Development fallback - load from environment variable
    if (process.env.NODE_ENV !== 'production') {
      const devKey = process.env.OPENAI_API_KEY_DEV || process.env.OPENAI_API_KEY;
      if (devKey) {
        logger.info('OpenAI API key loaded from development environment');
        return devKey;
      }
      logger.warn('No OpenAI API key found in environment variables');
    }

    throw new Error('OpenAI API key not found in any configuration source');
  }

  /**
   * Load CORS origins based on environment
   */
  private loadCorsOrigins(): string[] {
    if (process.env.NODE_ENV === 'production') {
      return [
        'https://plsfixthx-ai.web.app',
        'https://plsfixthx-ai.firebaseapp.com'
      ];
    }
    
    return [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173'
    ];
  }

  /**
   * Validate required configuration
   */
  private validateConfiguration(): void {
    const errors: string[] = [];

    if (!this.config.openaiApiKey) {
      errors.push('OpenAI API key is required');
    } else if (!this.config.openaiApiKey.startsWith('sk-')) {
      errors.push('OpenAI API key format is invalid');
    }

    if (this.config.port < 1 || this.config.port > 65535) {
      errors.push('Port must be between 1 and 65535');
    }

    if (errors.length > 0) {
      const errorMessage = `Configuration validation failed: ${errors.join(', ')}`;
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    logger.success('Environment configuration validated successfully', {
      operation: 'config-validation'
    }, {
      nodeEnv: this.config.nodeEnv,
      port: this.config.port,
      corsOrigins: this.config.corsOrigins.length,
      hasApiKey: !!this.config.openaiApiKey,
      apiKeyPrefix: this.config.openaiApiKey.substring(0, 7) + '...'
    });
  }

  /**
   * Get configuration
   */
  getConfig(): EnvironmentConfig {
    if (!this.initialized) {
      throw new Error('Environment manager not initialized');
    }
    return { ...this.config };
  }

  /**
   * Get OpenAI API key safely
   */
  getOpenAIApiKey(): string {
    return this.config.openaiApiKey;
  }

  /**
   * Check if running in production
   */
  isProduction(): boolean {
    return this.config.isProduction;
  }

  /**
   * Check if running in development
   */
  isDevelopment(): boolean {
    return this.config.isDevelopment;
  }

  /**
   * Get CORS origins
   */
  getCorsOrigins(): string[] {
    return [...this.config.corsOrigins];
  }

  /**
   * Update configuration (for testing)
   */
  updateConfig(updates: Partial<EnvironmentConfig>): void {
    if (this.config.isProduction) {
      throw new Error('Cannot update configuration in production');
    }
    
    this.config = { ...this.config, ...updates };
    logger.info('Configuration updated', { operation: 'config-update' }, updates);
  }

  /**
   * Get safe config for logging (without sensitive data)
   */
  getSafeConfig(): Omit<EnvironmentConfig, 'openaiApiKey'> & { hasApiKey: boolean } {
    const { openaiApiKey, ...safeConfig } = this.config;
    return {
      ...safeConfig,
      hasApiKey: !!openaiApiKey
    };
  }
}

// Export singleton instance
export const env = new EnvironmentManager();
export default env;
