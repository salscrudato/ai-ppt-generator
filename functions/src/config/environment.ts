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
    try {
      this.config = this.loadConfiguration();
      this.validateConfiguration();
      this.initialized = true;

      logger.info('Environment configuration loaded successfully', {
        nodeEnv: this.config.nodeEnv,
        hasOpenAIKey: !!this.config.openaiApiKey && this.config.openaiApiKey !== 'EMULATOR_PLACEHOLDER',
        isEmulator: process.env.FUNCTIONS_EMULATOR === 'true'
      });
    } catch (error) {
      // In emulator environment, provide more helpful error handling
      if (process.env.FUNCTIONS_EMULATOR === 'true') {
        logger.warn('Environment configuration partially loaded in emulator mode', {}, error);
        // Provide minimal config for emulator
        this.config = {
          openaiApiKey: 'EMULATOR_PLACEHOLDER',
          nodeEnv: (process.env.NODE_ENV || 'development') as EnvironmentConfig['nodeEnv'],
          isProduction: false,
          isDevelopment: true,
          isTest: false,
          port: parseInt(process.env.PORT || '5001', 10),
          corsOrigins: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
          logLevel: (process.env.LOG_LEVEL as EnvironmentConfig['logLevel']) || 'debug'
        };
        this.initialized = true;
      } else {
        logger.error('Failed to load environment configuration', {}, error);
        throw error;
      }
    }
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
   * Enhanced to handle emulator environment gracefully
   */
  private loadOpenAIApiKey(): string {
    // Priority order:
    // 1. Environment variable (production and development)
    // 2. Firebase config (production)
    // 3. Graceful fallback for emulator environment

    // Check environment variable first (works in all environments)
    if (process.env.OPENAI_API_KEY) {
      logger.info('OpenAI API key loaded from environment variable');
      return process.env.OPENAI_API_KEY;
    }

    // Check Firebase functions config (production only)
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

    // Development and emulator fallback
    if (process.env.NODE_ENV !== 'production' || process.env.FUNCTIONS_EMULATOR === 'true') {
      const devKey = process.env.OPENAI_API_KEY_DEV || process.env.OPENAI_API_KEY;
      if (devKey) {
        logger.info('OpenAI API key loaded from development environment');
        return devKey;
      }

      // In emulator environment, provide a more helpful warning
      if (process.env.FUNCTIONS_EMULATOR === 'true') {
        logger.warn('No OpenAI API key found in emulator environment. Set OPENAI_API_KEY in functions/.env file');
        // Return a placeholder that will be replaced by the secret system
        return 'EMULATOR_PLACEHOLDER';
      } else if (process.env.NODE_ENV === 'production' || process.env.GCLOUD_PROJECT) {
        // During deployment/build, the secret won't be available yet
        logger.warn('No OpenAI API key found during build - will be loaded from secrets at runtime');
        return 'BUILD_PLACEHOLDER';
      } else {
        logger.warn('No OpenAI API key found in environment variables');
      }
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
   * Validate required configuration with emulator support
   */
  private validateConfiguration(): void {
    const errors: string[] = [];
    const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';
    const isBuild = process.env.NODE_ENV === 'production' || process.env.GCLOUD_PROJECT;

    // OpenAI API key validation with emulator and build exceptions
    if (!this.config.openaiApiKey) {
      errors.push('OpenAI API key is required');
    } else if (this.config.openaiApiKey === 'BUILD_PLACEHOLDER') {
      // During build/deployment, log a helpful message instead of an error
      logger.info('Running in build mode with placeholder API key - will be loaded from secrets at runtime');
    } else if (this.config.openaiApiKey === 'EMULATOR_PLACEHOLDER') {
      // In emulator mode, log a helpful message instead of an error
      logger.info('Running in emulator mode with placeholder API key');
    } else if (!isEmulator && !isBuild && !this.config.openaiApiKey.startsWith('sk-')) {
      // Only validate format in non-emulator, non-build environments
      errors.push('OpenAI API key format is invalid');
    }

    // Port validation
    if (this.config.port < 1 || this.config.port > 65535) {
      errors.push('Port must be between 1 and 65535');
    }

    // Only throw errors for critical validation failures
    if (errors.length > 0) {
      const errorMessage = `Configuration validation failed: ${errors.join(', ')}`;
      if (isEmulator) {
        // In emulator mode, log warnings instead of throwing errors
        logger.warn(errorMessage);
      } else {
        logger.error(errorMessage);
        throw new Error(errorMessage);
      }
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
