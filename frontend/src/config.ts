/**
 * API Configuration - Robust Production/Development Detection
 *
 * Centralized configuration for all API endpoints with intelligent environment detection.
 * Automatically switches between development and production Firebase Functions.
 *
 * Production URLs (Firebase Hosting):
 * - API Base: https://us-central1-plsfixthx-ai.cloudfunctions.net/api

 * - Generate: https://us-central1-plsfixthx-ai.cloudfunctions.net/api/generate
 * - Health: https://us-central1-plsfixthx-ai.cloudfunctions.net/api/health
 *
 * Development URLs (Local Emulators):
 * - API Base: http://localhost:5001/plsfixthx-ai/us-central1/api
 * - Network: http://192.168.1.176:5001/plsfixthx-ai/us-central1/api
 *
 * @version 3.3.2-production-ready
 */

// Robust environment detection for API base URL
const getApiBaseUrl = () => {
  // 1. Explicit override via environment variable (highest priority)
  if (import.meta.env.VITE_API_BASE_URL) {
    console.log('🔧 Using explicit API URL from environment:', import.meta.env.VITE_API_BASE_URL);
    return import.meta.env.VITE_API_BASE_URL;
  }

  // 2. Production detection - multiple methods for reliability
  const isProduction =
    import.meta.env.PROD || // Vite production build
    window.location.hostname.includes('.web.app') || // Firebase Hosting
    window.location.hostname.includes('.firebaseapp.com') || // Firebase Hosting (legacy)
    window.location.hostname.includes('plsfixthx-ai') || // Our specific domain
    window.location.protocol === 'https:'; // HTTPS indicates production

  if (isProduction) {
    const productionUrl = 'https://us-central1-plsfixthx-ai.cloudfunctions.net/api';
    console.log('🚀 Production environment detected, using Firebase Functions:', productionUrl);
    return productionUrl;
  }

  // 3. Development environment - detect local vs network access
  const hostname = window.location.hostname;
  console.log('🛠️ Development environment detected, hostname:', hostname);

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Local development on same machine
    const localUrl = 'http://localhost:5001/plsfixthx-ai/us-central1/api';
    console.log('🏠 Local development, using emulator:', localUrl);
    return localUrl;
  } else {
    // Network access from another device - use the network IP
    const networkUrl = 'http://192.168.1.176:5001/plsfixthx-ai/us-central1/api';
    console.log('🌐 Network access detected, using network IP:', networkUrl);
    return networkUrl;
  }
};

export const API_BASE_URL = getApiBaseUrl();

// API endpoint definitions
export const API_ENDPOINTS = {
  /** Generate slide draft from user parameters */
  draft: `${API_BASE_URL}/draft`,

  /** Generate final PowerPoint file from slide specification */
  generate: `${API_BASE_URL}/generate`,

  /** Health check endpoint */
  health: `${API_BASE_URL}/health`,

  /** Get theme presets catalog */
  themePresets: `${API_BASE_URL}/theme-presets`,

  /** Get theme recommendations */
  themes: `${API_BASE_URL}/themes`,

  /** Validate content */
  validateContent: `${API_BASE_URL}/validate-content`,

  /** Enhanced endpoints */
  enhanced: {
    slide: `${API_BASE_URL}/enhanced/slide`,
    presentation: `${API_BASE_URL}/enhanced/presentation`,
    analytics: `${API_BASE_URL}/enhanced/analytics`,
    templates: `${API_BASE_URL}/enhanced/templates`,
    collaboration: `${API_BASE_URL}/enhanced/collaboration`,
    export: `${API_BASE_URL}/enhanced/export`
  }
} as const;

/**
 * Enhanced API connectivity verification with comprehensive debugging
 * This helps debug connection issues in production and development
 */
export const verifyApiConnection = async (): Promise<boolean> => {
  // Import debug logger dynamically to avoid circular dependencies
  const { frontendDebugLogger, DebugCategory } = await import('./utils/debugLogger');

  const apiCallId = frontendDebugLogger.trackAPICall(API_ENDPOINTS.health, 'GET');

  try {
    console.log('🔍 Verifying API connection to:', API_ENDPOINTS.health);

    frontendDebugLogger.info('Starting API connection verification', DebugCategory.API, {
      endpoint: API_ENDPOINTS.health,
      baseUrl: API_BASE_URL,
      hostname: window.location.hostname,
      userAgent: navigator.userAgent
    });

    const response = await fetch(API_ENDPOINTS.health, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout for faster failure detection
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API connection successful:', data);

      frontendDebugLogger.completeAPICall(apiCallId, response.status, data);
      frontendDebugLogger.info('API connection verification successful', DebugCategory.API, {
        status: response.status,
        responseData: data,
        responseTime: response.headers.get('x-response-time')
      });

      return true;
    } else {
      console.error('❌ API health check failed:', response.status, response.statusText);

      frontendDebugLogger.completeAPICall(apiCallId, response.status, null, `Health check failed: ${response.statusText}`);
      frontendDebugLogger.error('API health check failed', {
        status: response.status,
        statusText: response.statusText,
        url: API_ENDPOINTS.health
      });

      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ API connection error:', error);
    console.log('🔧 Current API configuration:', {
      baseUrl: API_BASE_URL,
      healthEndpoint: API_ENDPOINTS.health,
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      isProduction: import.meta.env.PROD
    });

    frontendDebugLogger.completeAPICall(apiCallId, 0, null, errorMessage);
    frontendDebugLogger.error('API connection verification failed', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      configuration: {
        baseUrl: API_BASE_URL,
        healthEndpoint: API_ENDPOINTS.health,
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        isProduction: import.meta.env.PROD
      }
    });

    return false;
  }
};

// Log current configuration on module load for debugging
console.log('🔧 API Configuration loaded:', {
  baseUrl: API_BASE_URL,
  endpoints: API_ENDPOINTS,
  environment: import.meta.env.PROD ? 'production' : 'development',
  hostname: window.location.hostname
});
