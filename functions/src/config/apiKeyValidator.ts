/**
 * Robust API Key Configuration Validator
 * 
 * Comprehensive validation system for OpenAI API key configuration
 * across development and production environments with detailed diagnostics.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import { logger } from 'firebase-functions';

export interface APIKeyValidationResult {
  isValid: boolean;
  source: 'firebase-secret' | 'environment-variable' | 'none';
  keyPreview: string;
  environment: 'development' | 'production' | 'unknown';
  diagnostics: {
    hasFirebaseSecret: boolean;
    hasEnvironmentVariable: boolean;
    keyFormat: 'valid' | 'invalid' | 'missing';
    keyLength: number;
    recommendations: string[];
  };
}

/**
 * Comprehensive API Key Validator
 */
export class APIKeyValidator {
  private static instance: APIKeyValidator;
  private secretProvider: any = null;

  constructor() {
    this.initializeSecretProvider();
  }

  static getInstance(): APIKeyValidator {
    if (!APIKeyValidator.instance) {
      APIKeyValidator.instance = new APIKeyValidator();
    }
    return APIKeyValidator.instance;
  }

  /**
   * Initialize Firebase secret provider
   */
  private initializeSecretProvider(): void {
    try {
      // Try to load Firebase secrets
      const params = require('firebase-functions/params');
      if (params?.defineSecret) {
        this.secretProvider = params.defineSecret('OPENAI_API_KEY');
        logger.info('✅ Firebase secret provider initialized');
      }
    } catch (error) {
      logger.warn('⚠️ Firebase secret provider not available:', error);
    }
  }

  /**
   * Validate API key configuration with comprehensive diagnostics
   */
  validateConfiguration(): APIKeyValidationResult {
    const result: APIKeyValidationResult = {
      isValid: false,
      source: 'none',
      keyPreview: '',
      environment: this.detectEnvironment(),
      diagnostics: {
        hasFirebaseSecret: false,
        hasEnvironmentVariable: false,
        keyFormat: 'missing',
        keyLength: 0,
        recommendations: []
      }
    };

    // Check Firebase secret
    let secretKey: string | undefined;
    try {
      secretKey = this.secretProvider?.value?.();
      result.diagnostics.hasFirebaseSecret = !!secretKey;
    } catch (error) {
      logger.warn('Failed to access Firebase secret:', error);
    }

    // Check environment variable
    const envKey = process.env.OPENAI_API_KEY;
    result.diagnostics.hasEnvironmentVariable = !!envKey;

    // Determine which key to use
    const apiKey = secretKey || envKey;
    
    if (apiKey) {
      result.isValid = this.validateKeyFormat(apiKey);
      result.source = secretKey ? 'firebase-secret' : 'environment-variable';
      result.keyPreview = this.createKeyPreview(apiKey);
      result.diagnostics.keyFormat = this.validateKeyFormat(apiKey) ? 'valid' : 'invalid';
      result.diagnostics.keyLength = apiKey.length;
    }

    // Generate recommendations
    result.diagnostics.recommendations = this.generateRecommendations(result);

    // Log validation results
    this.logValidationResults(result);

    return result;
  }

  /**
   * Validate OpenAI API key format
   */
  private validateKeyFormat(key: string): boolean {
    // OpenAI API keys should start with 'sk-' and be at least 40 characters
    return key.startsWith('sk-') && key.length >= 40;
  }

  /**
   * Create a safe preview of the API key
   */
  private createKeyPreview(key: string): string {
    if (key.length < 10) return '[INVALID]';
    return `${key.substring(0, 7)}...${key.substring(key.length - 4)}`;
  }

  /**
   * Detect current environment
   */
  private detectEnvironment(): 'development' | 'production' | 'unknown' {
    if (process.env.NODE_ENV === 'production') return 'production';
    if (process.env.NODE_ENV === 'development') return 'development';
    if (process.env.FUNCTIONS_EMULATOR === 'true') return 'development';
    if (process.env.GCLOUD_PROJECT) return 'production';
    return 'unknown';
  }

  /**
   * Generate configuration recommendations
   */
  private generateRecommendations(result: APIKeyValidationResult): string[] {
    const recommendations: string[] = [];

    if (!result.isValid) {
      if (!result.diagnostics.hasFirebaseSecret && !result.diagnostics.hasEnvironmentVariable) {
        recommendations.push('Configure OpenAI API key using Firebase Secret Manager or environment variable');
        recommendations.push('Run: firebase functions:secrets:set OPENAI_API_KEY');
      } else if (result.diagnostics.keyFormat === 'invalid') {
        recommendations.push('API key format is invalid - ensure it starts with "sk-" and is at least 40 characters');
        recommendations.push('Verify the API key is copied correctly from OpenAI dashboard');
      }
    }

    if (result.environment === 'production' && !result.diagnostics.hasFirebaseSecret) {
      recommendations.push('Use Firebase Secret Manager for production instead of environment variables');
      recommendations.push('Environment variables are less secure in production');
    }

    if (result.environment === 'development' && !result.diagnostics.hasEnvironmentVariable) {
      recommendations.push('Consider adding OPENAI_API_KEY to functions/.env for local development');
    }

    if (result.isValid && result.source === 'environment-variable' && result.environment === 'production') {
      recommendations.push('Migrate to Firebase Secret Manager for enhanced security');
    }

    return recommendations;
  }

  /**
   * Log validation results with appropriate log levels
   */
  private logValidationResults(result: APIKeyValidationResult): void {
    const logData = {
      isValid: result.isValid,
      source: result.source,
      environment: result.environment,
      keyPreview: result.keyPreview,
      diagnostics: result.diagnostics
    };

    if (result.isValid) {
      logger.info('✅ OpenAI API key validation successful', logData);
    } else {
      logger.error('❌ OpenAI API key validation failed', logData);
    }

    // Log recommendations
    if (result.diagnostics.recommendations.length > 0) {
      logger.warn('💡 Configuration recommendations:', {
        recommendations: result.diagnostics.recommendations
      });
    }
  }

  /**
   * Test API key by making a simple OpenAI API call
   */
  async testAPIKey(): Promise<{ success: boolean; error?: string; model?: string }> {
    try {
      const validation = this.validateConfiguration();
      if (!validation.isValid) {
        return { success: false, error: 'API key validation failed' };
      }

      // Import OpenAI dynamically to avoid circular dependencies
      const OpenAI = (await import('openai')).default;
      const apiKey = this.secretProvider?.value?.() || process.env.OPENAI_API_KEY;
      
      const openai = new OpenAI({ apiKey });
      
      // Make a simple API call to test the key
      const response = await openai.models.list();
      const models = response.data;
      
      if (models && models.length > 0) {
        logger.info('✅ OpenAI API key test successful', {
          modelCount: models.length,
          firstModel: models[0]?.id
        });
        return { success: true, model: models[0]?.id };
      } else {
        return { success: false, error: 'No models returned from OpenAI API' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('❌ OpenAI API key test failed', { error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get current API key (for internal use)
   */
  getAPIKey(): string {
    const validation = this.validateConfiguration();
    if (!validation.isValid) {
      throw new Error(`OpenAI API key is not properly configured. Source: ${validation.source}, Environment: ${validation.environment}`);
    }

    const apiKey = this.secretProvider?.value?.() || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is not available');
    }

    return apiKey;
  }

  /**
   * Generate configuration status report
   */
  generateStatusReport(): string {
    const validation = this.validateConfiguration();
    
    let report = '🔐 OpenAI API Key Configuration Status\n';
    report += '=====================================\n\n';
    
    report += `✅ Status: ${validation.isValid ? 'VALID' : 'INVALID'}\n`;
    report += `🌍 Environment: ${validation.environment}\n`;
    report += `📍 Source: ${validation.source}\n`;
    report += `🔑 Key Preview: ${validation.keyPreview}\n\n`;
    
    report += '📊 Diagnostics:\n';
    report += `  • Firebase Secret: ${validation.diagnostics.hasFirebaseSecret ? '✅' : '❌'}\n`;
    report += `  • Environment Variable: ${validation.diagnostics.hasEnvironmentVariable ? '✅' : '❌'}\n`;
    report += `  • Key Format: ${validation.diagnostics.keyFormat}\n`;
    report += `  • Key Length: ${validation.diagnostics.keyLength} characters\n\n`;
    
    if (validation.diagnostics.recommendations.length > 0) {
      report += '💡 Recommendations:\n';
      validation.diagnostics.recommendations.forEach((rec, index) => {
        report += `  ${index + 1}. ${rec}\n`;
      });
    }
    
    return report;
  }
}

// Export singleton instance
export const apiKeyValidator = APIKeyValidator.getInstance();
