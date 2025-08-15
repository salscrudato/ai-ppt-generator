/**
 * Custom Hook for API Calls with Enhanced Notifications
 * 
 * Provides a unified interface for making API calls with automatic
 * error handling, retry logic, and user-friendly notifications.
 * 
 * Features:
 * - Automatic error categorization and user-friendly messages
 * - Retry mechanisms for recoverable errors
 * - Loading state management
 * - Success notifications
 * - Integration with notification system
 * 
 * @version 1.0.0
 */

import { useState, useCallback } from 'react';
import { useNotifications } from '../components/NotificationSystem';
import apiClient from '../utils/apiClient';

/**
 * API call options
 */
export interface ApiCallOptions {
  showSuccessNotification?: boolean;
  successMessage?: string;
  showErrorNotification?: boolean;
  retryable?: boolean;
  loadingMessage?: string;
  context?: string;
}

/**
 * API call state
 */
export interface ApiCallState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

/**
 * Hook return type
 */
export interface UseApiWithNotificationsReturn<T = any> {
  state: ApiCallState<T>;
  execute: (endpoint: string, options?: RequestInit & ApiCallOptions) => Promise<T | null>;
  reset: () => void;
  retry: () => Promise<T | null>;
}

/**
 * Custom hook for API calls with notifications
 */
export function useApiWithNotifications<T = any>(): UseApiWithNotificationsReturn<T> {
  const notifications = useNotifications();
  const [state, setState] = useState<ApiCallState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false
  });
  const [lastCall, setLastCall] = useState<{ endpoint: string; options?: RequestInit & ApiCallOptions } | null>(null);

  const execute = useCallback(async (
    endpoint: string, 
    options: RequestInit & ApiCallOptions = {}
  ): Promise<T | null> => {
    const {
      showSuccessNotification = false,
      successMessage,
      showErrorNotification = true,
      retryable = true,
      loadingMessage,
      context,
      ...requestOptions
    } = options;

    // Store call details for retry
    setLastCall({ endpoint, options });

    // Set loading state
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      success: false
    }));

    // Show loading notification if message provided
    if (loadingMessage) {
      notifications.showInfo('Processing', loadingMessage, { duration: 0, persistent: true });
    }

    try {
      // Map RequestInit to RequestOptions
      const apiOptions = {
        method: requestOptions.method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | undefined,
        headers: requestOptions.headers as Record<string, string> | undefined,
        body: requestOptions.body,
      };

      const response = await apiClient.request<T>(endpoint, apiOptions);

      if (response.success && response.data) {
        setState({
          data: response.data,
          loading: false,
          error: null,
          success: true
        });

        // Clear any persistent loading notifications
        notifications.clearAll();

        // Show success notification if requested
        if (showSuccessNotification) {
          notifications.showSuccess(
            'Success',
            successMessage || 'Operation completed successfully'
          );
        }

        return response.data;
      } else {
        throw new Error(response.error || 'API call failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));

      // Clear any persistent loading notifications
      notifications.clearAll();

      // Show error notification if requested
      if (showErrorNotification) {
        const retryFn = retryable ? () => retry() : undefined;
        notifications.handleApiError(error, context, retryFn);
      }

      return null;
    }
  }, [notifications]);

  const retry = useCallback(async (): Promise<T | null> => {
    if (!lastCall) {
      console.warn('No previous call to retry');
      return null;
    }

    return execute(lastCall.endpoint, lastCall.options);
  }, [lastCall, execute]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false
    });
    setLastCall(null);
  }, []);

  return {
    state,
    execute,
    reset,
    retry
  };
}

/**
 * Specialized hooks for common API operations
 */

/**
 * Hook for PowerPoint generation with enhanced error handling
 */
export function usePowerPointGeneration() {
  const api = useApiWithNotifications<Buffer>();

  const generatePowerPoint = useCallback(async (slideSpec: any, theme?: string) => {
    return api.execute('/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spec: slideSpec, themeId: theme }),
      showSuccessNotification: true,
      successMessage: 'PowerPoint generated successfully!',
      loadingMessage: 'Generating your PowerPoint presentation...',
      context: 'PowerPoint Generation',
      retryable: true
    });
  }, [api]);

  return {
    ...api,
    generatePowerPoint
  };
}

/**
 * Hook for content validation with detailed feedback
 */
export function useContentValidation() {
  const api = useApiWithNotifications<any>();

  const validateContent = useCallback(async (content: any) => {
    return api.execute('/validate-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content),
      showSuccessNotification: false, // Validation success is implicit
      showErrorNotification: true,
      loadingMessage: 'Validating content...',
      context: 'Content Validation',
      retryable: false // Validation errors are usually not retryable
    });
  }, [api]);

  return {
    ...api,
    validateContent
  };
}

/**
 * Hook for theme recommendations
 */
export function useThemeRecommendations() {
  const api = useApiWithNotifications<any>();

  const getThemeRecommendations = useCallback(async (params: any) => {
    return api.execute('/themes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      showSuccessNotification: false,
      showErrorNotification: true,
      loadingMessage: 'Getting theme recommendations...',
      context: 'Theme Recommendations',
      retryable: true
    });
  }, [api]);

  return {
    ...api,
    getThemeRecommendations
  };
}

/**
 * Hook for health checks and connectivity
 */
export function useHealthCheck() {
  const api = useApiWithNotifications<any>();

  const checkHealth = useCallback(async () => {
    return api.execute('/health', {
      method: 'GET',
      showSuccessNotification: false,
      showErrorNotification: false, // Health check errors are handled separately
      context: 'Health Check',
      retryable: true
    });
  }, [api]);

  return {
    ...api,
    checkHealth
  };
}

export default useApiWithNotifications;
