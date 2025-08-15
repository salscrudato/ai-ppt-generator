/**
 * Enhanced Notification System for User Feedback
 * 
 * Provides comprehensive user feedback for errors, success messages, and warnings
 * with accessibility support and graceful degradation strategies.
 * 
 * Features:
 * - Toast notifications with auto-dismiss
 * - Error categorization and user-friendly messages
 * - Accessibility support with ARIA live regions
 * - Retry mechanisms for recoverable errors
 * - Progress indicators for long operations
 * 
 * @version 1.0.0
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { HiCheckCircle, HiExclamationCircle, HiInformationCircle, HiXCircle, HiX } from 'react-icons/hi';

// Notification types and interfaces
export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export type ErrorCategory = 'validation' | 'network' | 'ai_service' | 'timeout' | 'rate_limit' | 'unknown';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  category?: ErrorCategory;
  duration?: number;
  persistent?: boolean;
  retryable?: boolean;
  onRetry?: () => void;
  metadata?: Record<string, any>;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  // Convenience methods
  showSuccess: (title: string, message: string, options?: Partial<Notification>) => string;
  showError: (title: string, message: string, options?: Partial<Notification>) => string;
  showWarning: (title: string, message: string, options?: Partial<Notification>) => string;
  showInfo: (title: string, message: string, options?: Partial<Notification>) => string;
  // Enhanced error handling
  handleApiError: (error: any, context?: string, retryFn?: () => void) => string;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

// Error message mapping for user-friendly messages
const ERROR_MESSAGES: Record<ErrorCategory, { title: string; getMessage: (error: any) => string }> = {
  validation: {
    title: 'Input Validation Error',
    getMessage: (error) => error.message || 'Please check your input and try again.'
  },
  network: {
    title: 'Connection Error',
    getMessage: () => 'Unable to connect to the server. Please check your internet connection and try again.'
  },
  ai_service: {
    title: 'AI Service Unavailable',
    getMessage: () => 'The AI service is temporarily unavailable. Please try again in a few moments.'
  },
  timeout: {
    title: 'Request Timeout',
    getMessage: () => 'The request took too long to complete. Please try again with a shorter prompt or simpler requirements.'
  },
  rate_limit: {
    title: 'Too Many Requests',
    getMessage: () => 'You\'ve made too many requests. Please wait a moment before trying again.'
  },
  unknown: {
    title: 'Unexpected Error',
    getMessage: (error) => error.message || 'An unexpected error occurred. Please try again.'
  }
};

// Notification Provider Component
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>): string => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      id,
      duration: 5000, // Default 5 seconds
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove non-persistent notifications
    if (!newNotification.persistent && newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const showSuccess = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({ type: 'success', title, message, ...options });
  }, [addNotification]);

  const showError = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({ 
      type: 'error', 
      title, 
      message, 
      duration: 8000, // Longer duration for errors
      ...options 
    });
  }, [addNotification]);

  const showWarning = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({ type: 'warning', title, message, ...options });
  }, [addNotification]);

  const showInfo = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({ type: 'info', title, message, ...options });
  }, [addNotification]);

  // Enhanced API error handling
  const handleApiError = useCallback((error: any, context?: string, retryFn?: () => void): string => {
    let category: ErrorCategory = 'unknown';
    
    // Categorize error based on error properties
    if (error?.code) {
      switch (error.code) {
        case 'VALIDATION_ERROR':
        case 'INVALID_SPEC_ERROR':
          category = 'validation';
          break;
        case 'AI_SERVICE_ERROR':
          category = 'ai_service';
          break;
        case 'TIMEOUT_ERROR':
          category = 'timeout';
          break;
        case 'RATE_LIMIT_ERROR':
          category = 'rate_limit';
          break;
        default:
          category = 'unknown';
      }
    } else if (error?.message) {
      const message = error.message.toLowerCase();
      if (message.includes('network') || message.includes('fetch')) {
        category = 'network';
      } else if (message.includes('timeout')) {
        category = 'timeout';
      } else if (message.includes('validation')) {
        category = 'validation';
      } else if (message.includes('rate limit')) {
        category = 'rate_limit';
      }
    }

    const errorConfig = ERROR_MESSAGES[category];
    const title = context ? `${errorConfig.title} - ${context}` : errorConfig.title;
    const message = errorConfig.getMessage(error);

    return addNotification({
      type: 'error',
      title,
      message,
      category,
      retryable: !!retryFn && category !== 'validation',
      onRetry: retryFn,
      duration: category === 'validation' ? 6000 : 8000,
      metadata: {
        originalError: error,
        context,
        timestamp: new Date().toISOString()
      }
    });
  }, [addNotification]);

  const contextValue: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    handleApiError
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Notification Container Component
const NotificationContainer: React.FC = () => {
  const context = useContext(NotificationContext);
  if (!context) return null;

  const { notifications, removeNotification } = context;

  return (
    <>
      {/* ARIA Live Region for screen readers */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="notification-announcements"
      >
        {notifications.map(notification => (
          <div key={notification.id}>
            {notification.title}: {notification.message}
          </div>
        ))}
      </div>

      {/* Visual notification container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {notifications.map(notification => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </>
  );
};

// Individual Notification Card Component
const NotificationCard: React.FC<{
  notification: Notification;
  onClose: () => void;
}> = ({ notification, onClose }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <HiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <HiXCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <HiExclamationCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <HiInformationCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'success':
        return 'border-green-200';
      case 'error':
        return 'border-red-200';
      case 'warning':
        return 'border-yellow-200';
      case 'info':
        return 'border-blue-200';
    }
  };

  return (
    <div
      className={`bg-white border-l-4 ${getBorderColor()} rounded-lg shadow-lg p-4 transition-all duration-300 ease-in-out`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-900">
            {notification.title}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {notification.message}
          </p>
          {notification.retryable && notification.onRetry && (
            <div className="mt-2">
              <button
                onClick={notification.onRetry}
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded"
            aria-label="Close notification"
          >
            <HiX className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook for using notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationProvider;
