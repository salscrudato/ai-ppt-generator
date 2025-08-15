/**
 * Enhanced API Client with Comprehensive Debugging
 * Provides automatic request/response logging, error tracking, and performance monitoring
 */

import { API_ENDPOINTS } from '../config';
import { frontendDebugLogger, DebugCategory } from './debugLogger';

// API response wrapper
interface APIResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  success: boolean;
  metadata?: {
    requestId?: string;
    duration?: number;
    timestamp: string;
  };
}

// Request options
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

// Default options
const DEFAULT_OPTIONS: RequestOptions = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
  retries: 2,
  retryDelay: 1000 // 1 second
};

class APIClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string, defaultHeaders: Record<string, string> = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': `AI-PPT-Generator-Frontend/${window.location.hostname}`,
      ...defaultHeaders
    };

    frontendDebugLogger.info('API Client initialized', DebugCategory.API, {
      baseURL,
      defaultHeaders: this.defaultHeaders,
      userAgent: navigator.userAgent
    });
  }

  // Core request method with comprehensive debugging
  async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<APIResponse<T>> {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    const url = `${this.baseURL}${endpoint}`;
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Start tracking
    const apiCallId = frontendDebugLogger.trackAPICall(url, mergedOptions.method || 'GET', mergedOptions.body);
    const perfId = frontendDebugLogger.startPerformanceTracking(`API ${mergedOptions.method} ${endpoint}`, {
      requestId,
      endpoint,
      method: mergedOptions.method
    });

    const startTime = performance.now();

    try {
      frontendDebugLogger.debug('Starting API request', DebugCategory.API, {
        requestId,
        url,
        method: mergedOptions.method,
        headers: { ...this.defaultHeaders, ...mergedOptions.headers },
        bodyPreview: mergedOptions.body ? JSON.stringify(mergedOptions.body).substring(0, 200) + '...' : undefined,
        timeout: mergedOptions.timeout
      });

      const response = await this.executeRequest(url, mergedOptions, requestId);
      const duration = performance.now() - startTime;

      // Parse response
      let responseData: T | undefined;
      let errorMessage: string | undefined;

      try {
        const responseText = await response.text();
        if (responseText) {
          responseData = JSON.parse(responseText);
        }
      } catch (parseError) {
        errorMessage = `Failed to parse response: ${parseError instanceof Error ? parseError.message : String(parseError)}`;
        frontendDebugLogger.warn('Response parsing failed', DebugCategory.API, {
          requestId,
          parseError: errorMessage,
          status: response.status
        });
      }

      const success = response.ok;
      const apiResponse: APIResponse<T> = {
        data: responseData,
        error: !success ? (responseData as any)?.error || response.statusText || errorMessage : undefined,
        status: response.status,
        success,
        metadata: {
          requestId,
          duration,
          timestamp: new Date().toISOString()
        }
      };

      // Complete tracking
      frontendDebugLogger.completeAPICall(
        apiCallId,
        response.status,
        responseData,
        !success ? apiResponse.error : undefined
      );

      frontendDebugLogger.endPerformanceTracking(perfId, {
        success,
        status: response.status,
        responseSize: JSON.stringify(responseData || {}).length,
        duration
      });

      if (success) {
        frontendDebugLogger.info(`API request successful: ${mergedOptions.method} ${endpoint}`, DebugCategory.API, {
          requestId,
          status: response.status,
          duration: `${duration.toFixed(2)}ms`,
          responseSize: `${JSON.stringify(responseData || {}).length} bytes`
        });
      } else {
        frontendDebugLogger.error(`API request failed: ${mergedOptions.method} ${endpoint}`, {
          requestId,
          status: response.status,
          error: apiResponse.error,
          duration: `${duration.toFixed(2)}ms`
        });
      }

      return apiResponse;

    } catch (error) {
      const duration = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      frontendDebugLogger.completeAPICall(apiCallId, 0, null, errorMessage);
      frontendDebugLogger.endPerformanceTracking(perfId, {
        success: false,
        error: errorMessage,
        duration
      });

      frontendDebugLogger.error(`API request error: ${mergedOptions.method} ${endpoint}`, {
        requestId,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        duration: `${duration.toFixed(2)}ms`,
        url
      });

      return {
        data: undefined,
        error: errorMessage,
        status: 0,
        success: false,
        metadata: {
          requestId,
          duration,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  // Execute request with retry logic
  private async executeRequest(
    url: string,
    options: RequestOptions,
    requestId: string,
    attempt: number = 1
  ): Promise<Response> {
    const { timeout, retries, retryDelay, ...fetchOptions } = options;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        headers: { ...this.defaultHeaders, ...fetchOptions.headers },
        body: fetchOptions.body ? JSON.stringify(fetchOptions.body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response;

    } catch (error) {
      const isLastAttempt = attempt >= (retries || 0) + 1;

      if (!isLastAttempt && this.shouldRetry(error)) {
        frontendDebugLogger.warn(`API request retry ${attempt}/${retries}`, DebugCategory.API, {
          requestId,
          attempt,
          error: error instanceof Error ? error.message : String(error),
          retryDelay
        });

        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return this.executeRequest(url, options, requestId, attempt + 1);
      }

      throw error;
    }
  }

  // Determine if error is retryable
  private shouldRetry(error: any): boolean {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return true; // Network error
    }
    if (error.name === 'AbortError') {
      return true; // Timeout
    }
    return false;
  }

  // Convenience methods for different HTTP verbs
  async get<T = any>(endpoint: string, options: Omit<RequestOptions, 'method'> = {}): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body: data });
  }

  async put<T = any>(endpoint: string, data?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body: data });
  }

  async delete<T = any>(endpoint: string, options: Omit<RequestOptions, 'method'> = {}): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // Health check with detailed diagnostics
  async healthCheck(): Promise<APIResponse<any>> {
    frontendDebugLogger.info('Starting health check', DebugCategory.API);

    const result = await this.get('/health');

    if (result.success) {
      frontendDebugLogger.info('Health check passed', DebugCategory.API, {
        status: result.status,
        data: result.data,
        responseTime: result.metadata?.duration
      });
    } else {
      frontendDebugLogger.error('Health check failed', {
        status: result.status,
        error: result.error,
        responseTime: result.metadata?.duration
      });
    }

    return result;
  }

  // Get API statistics
  getStats() {
    return frontendDebugLogger.getAPICallStats();
  }
}

// Create singleton instance
const apiClient = new APIClient(API_ENDPOINTS.health.replace('/health', ''));

// Export convenience functions with enhanced error handling
export const api = {
  // Raw verb passthroughs for custom endpoints
  get: <T = any>(endpoint: string, options: Omit<RequestOptions, 'method'> = {}) => apiClient.get<T>(endpoint, options),
  post: <T = any>(endpoint: string, data?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}) => apiClient.post<T>(endpoint, data, options),

  // Health check
  healthCheck: () => apiClient.healthCheck(),

  // Enhanced generation with progress tracking
  generateWithProgress: async (
    spec: any,
    options: {
      themeId?: string;
      withValidation?: boolean;
      onProgress?: (stage: string, progress: number) => void
    } = {}
  ) => {
    const { themeId = 'corporate-blue', withValidation = true, onProgress } = options;

    try {
      // Stage 1: Preparing
      onProgress?.('preparing', 10);

      // Stage 2: Processing
      onProgress?.('generating', 30);

      const response = await fetch(API_ENDPOINTS.generate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spec,
          themeId,
          withValidation
        })
      });

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`);
      }

      // Stage 3: Building
      onProgress?.('building', 90);

      // Handle blob response for PowerPoint files
      const blob = await response.blob();

      // Stage 4: Complete
      onProgress?.('complete', 100);

      return {
        success: true,
        data: blob,
        headers: {
          contentType: response.headers.get('content-type'),
          contentDisposition: response.headers.get('content-disposition')
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Generation failed'
      };
    }
  },

  // Draft generation with enhanced error context
  generateDraft: async (params: any) => {
    try {
      const result = await apiClient.post('/draft', params);
      return result;
    } catch (error) {
      console.error('Draft generation API error:', error);
      throw new Error(`Draft generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // PowerPoint generation with enhanced error context
  generatePowerPoint: async (params: any) => {
    try {
      const result = await apiClient.post('/generate', params);
      return result;
    } catch (error) {
      console.error('PowerPoint generation API error:', error);
      throw new Error(`PowerPoint generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Content validation
  validateContent: (content: any) => apiClient.post('/validate-content', content),

  // Theme recommendations (AI suggested themes)
  getThemes: (params: any) => apiClient.post('/themes', params),

  // Theme presets (static catalog for gallery)
  getThemePresets: () => apiClient.get('/theme-presets'),

  // Get API statistics
  getStats: () => apiClient.getStats()
};

export { APIClient };
export type { APIResponse, RequestOptions };
export default apiClient;
