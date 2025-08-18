/**
 * Enhanced Application Configuration
 * 
 * Centralized configuration management for the AI PowerPoint Generator.
 * Provides type-safe configuration with environment-specific overrides.
 * 
 * @version 3.2.0-enhanced
 * @author AI PowerPoint Generator Team
 */

/**
 * Deep partial type for configuration overrides
 */
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Application configuration interface
 */
export interface AppConfig {
  // Application metadata
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
    debug: boolean;
  };
  
  // AI/OpenAI configuration
  ai: {
    model: string;
    fallbackModel: string;
    maxTokens: number;
    temperature: number;
    maxRetries: number;
    retryDelay: number;
    timeoutMs: number;
  };
  
  // PowerPoint generation settings
  powerpoint: {
    defaultTheme: string;
    maxSlides: number;
    defaultQuality: 'draft' | 'standard' | 'high';
    enableSpeakerNotes: boolean;
    enableMetadata: boolean;
    optimizeFileSize: boolean;
  };
  
  // Performance and monitoring
  performance: {
    maxMemoryMB: number;
    requestTimeoutMs: number;
    enableMetrics: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
  };
  
  // Security settings
  security: {
    enableRateLimit: boolean;
    maxRequestsPerMinute: number;
    enableCors: boolean;
    trustedOrigins: string[];
  };
}

/**
 * Default configuration
 */
const defaultConfig: AppConfig = {
  app: {
    name: 'AI PowerPoint Generator',
    version: '3.2.0-enhanced',
    environment: 'development',
    debug: true
  },
  
  ai: {
    model: 'gpt-4o-mini',
    fallbackModel: 'gpt-4o',
    maxTokens: 1400,
    temperature: 0.7,
    maxRetries: 3,
    retryDelay: 400,
    timeoutMs: 30000
  },
  
  powerpoint: {
    defaultTheme: 'corporate-blue',
    maxSlides: 20,
    defaultQuality: 'standard',
    enableSpeakerNotes: true,
    enableMetadata: true,
    optimizeFileSize: true
  },
  
  performance: {
    maxMemoryMB: 500,
    requestTimeoutMs: 90000,
    enableMetrics: true,
    logLevel: 'info'
  },
  
  security: {
    enableRateLimit: true,
    maxRequestsPerMinute: 30,
    enableCors: true,
    trustedOrigins: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://ai-ppt-generator.web.app'
    ]
  }
};

/**
 * Environment-specific configuration overrides
 */
const environmentConfigs: Record<string, DeepPartial<AppConfig>> = {
  development: {
    app: {
      debug: true,
      environment: 'development'
    },
    ai: {
      model: 'gpt-4o-mini', // Use cheaper model for development
      maxRetries: 2
    },
    performance: {
      logLevel: 'debug'
    },
    security: {
      enableRateLimit: false // Disable rate limiting in development
    }
  },
  
  staging: {
    app: {
      debug: false,
      environment: 'staging'
    },
    ai: {
      model: 'gpt-4o-mini',
      maxRetries: 3
    },
    performance: {
      logLevel: 'info'
    }
  },
  
  production: {
    app: {
      debug: false,
      environment: 'production'
    },
    ai: {
      model: 'gpt-4o', // Use best model for production
      maxRetries: 3,
      timeoutMs: 60000 // Longer timeout for production
    },
    performance: {
      logLevel: 'warn',
      maxMemoryMB: 1000 // Higher memory limit for production
    },
    security: {
      enableRateLimit: true,
      maxRequestsPerMinute: 60 // Higher rate limit for production
    }
  }
};

/**
 * Deep merge utility for configuration objects
 */
function deepMerge<T>(target: T, source: DeepPartial<T>): T {
  const result = { ...target };

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue) &&
          targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue)) {
        result[key] = deepMerge(targetValue, sourceValue as DeepPartial<T[Extract<keyof T, string>]>);
      } else if (sourceValue !== undefined) {
        result[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
  }

  return result;
}

/**
 * Get the current application configuration
 */
export function getConfig(): AppConfig {
  const environment = process.env.NODE_ENV || 'development';
  const envConfig = environmentConfigs[environment] || {};
  
  // Merge default config with environment-specific overrides
  let config = deepMerge(defaultConfig, envConfig);
  
  // Apply environment variable overrides
  if (process.env.AI_MODEL) {
    config.ai.model = process.env.AI_MODEL;
  }
  
  if (process.env.AI_MAX_TOKENS) {
    config.ai.maxTokens = parseInt(process.env.AI_MAX_TOKENS, 10);
  }
  
  if (process.env.AI_TEMPERATURE) {
    config.ai.temperature = parseFloat(process.env.AI_TEMPERATURE);
  }
  
  if (process.env.DEFAULT_THEME) {
    config.powerpoint.defaultTheme = process.env.DEFAULT_THEME;
  }
  
  if (process.env.LOG_LEVEL) {
    config.performance.logLevel = process.env.LOG_LEVEL as any;
  }
  
  return config;
}

/**
 * Validate configuration
 */
export function validateConfig(config: AppConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate AI configuration
  if (config.ai.maxTokens < 100 || config.ai.maxTokens > 4000) {
    errors.push('AI maxTokens must be between 100 and 4000');
  }
  
  if (config.ai.temperature < 0 || config.ai.temperature > 2) {
    errors.push('AI temperature must be between 0 and 2');
  }
  
  if (config.ai.maxRetries < 1 || config.ai.maxRetries > 10) {
    errors.push('AI maxRetries must be between 1 and 10');
  }
  
  // Validate PowerPoint configuration
  if (config.powerpoint.maxSlides < 1 || config.powerpoint.maxSlides > 100) {
    errors.push('PowerPoint maxSlides must be between 1 and 100');
  }
  
  // Validate performance configuration
  if (config.performance.maxMemoryMB < 100 || config.performance.maxMemoryMB > 2000) {
    errors.push('Performance maxMemoryMB must be between 100 and 2000');
  }
  
  // Validate security configuration
  if (config.security.maxRequestsPerMinute < 1 || config.security.maxRequestsPerMinute > 1000) {
    errors.push('Security maxRequestsPerMinute must be between 1 and 1000');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get configuration summary for debugging
 */
export function getConfigSummary(): Record<string, any> {
  const config = getConfig();
  
  return {
    environment: config.app.environment,
    version: config.app.version,
    aiModel: config.ai.model,
    defaultTheme: config.powerpoint.defaultTheme,
    logLevel: config.performance.logLevel,
    rateLimit: config.security.enableRateLimit,
    debug: config.app.debug
  };
}

// Export the configuration instance
export const config = getConfig();

// Validate configuration on import
const validation = validateConfig(config);
if (!validation.valid) {
  console.warn('⚠️ Configuration validation failed:', validation.errors);
}
