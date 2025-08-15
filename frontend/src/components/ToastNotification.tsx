/**
 * Toast Notification System
 * 
 * Provides toast notifications for success, error, warning, and info messages
 * with auto-dismiss, action buttons, and accessibility support.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiCheckCircle,
  HiExclamationTriangle,
  HiInformationCircle,
  HiXCircle,
  HiXMark
} from 'react-icons/hi2';
import clsx from 'clsx';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
}

interface ToastNotificationProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: HiCheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-600',
    titleColor: 'text-green-900',
    messageColor: 'text-green-700'
  },
  error: {
    icon: HiXCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-600',
    titleColor: 'text-red-900',
    messageColor: 'text-red-700'
  },
  warning: {
    icon: HiExclamationTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-600',
    titleColor: 'text-yellow-900',
    messageColor: 'text-yellow-700'
  },
  info: {
    icon: HiInformationCircle,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-900',
    messageColor: 'text-blue-700'
  }
};

export default function ToastNotification({ toast, onDismiss }: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const config = toastConfig[toast.type];
  const IconComponent = config.icon;

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onDismiss(toast.id), 300); // Wait for exit animation
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.duration, toast.id, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={clsx(
            'max-w-sm w-full shadow-lg rounded-lg border pointer-events-auto',
            config.bgColor,
            config.borderColor
          )}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <IconComponent className={clsx('w-5 h-5', config.iconColor)} />
              </div>
              
              <div className="ml-3 w-0 flex-1">
                <p className={clsx('text-sm font-medium', config.titleColor)}>
                  {toast.title}
                </p>
                
                {toast.message && (
                  <p className={clsx('mt-1 text-sm', config.messageColor)}>
                    {toast.message}
                  </p>
                )}
                
                {toast.action && (
                  <div className="mt-3">
                    <button
                      onClick={toast.action.onClick}
                      className={clsx(
                        'text-sm font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 rounded',
                        toast.type === 'success' && 'text-green-700 focus:ring-green-500',
                        toast.type === 'error' && 'text-red-700 focus:ring-red-500',
                        toast.type === 'warning' && 'text-yellow-700 focus:ring-yellow-500',
                        toast.type === 'info' && 'text-blue-700 focus:ring-blue-500'
                      )}
                    >
                      {toast.action.label}
                    </button>
                  </div>
                )}
              </div>
              
              {toast.dismissible !== false && (
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    onClick={handleDismiss}
                    className={clsx(
                      'rounded-md inline-flex focus:outline-none focus:ring-2 focus:ring-offset-2',
                      config.iconColor,
                      toast.type === 'success' && 'hover:text-green-500 focus:ring-green-500',
                      toast.type === 'error' && 'hover:text-red-500 focus:ring-red-500',
                      toast.type === 'warning' && 'hover:text-yellow-500 focus:ring-yellow-500',
                      toast.type === 'info' && 'hover:text-blue-500 focus:ring-blue-500'
                    )}
                    aria-label="Dismiss notification"
                  >
                    <HiXMark className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Toast Container Component
interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export function ToastContainer({ 
  toasts, 
  onDismiss, 
  position = 'top-right' 
}: ToastContainerProps) {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  return (
    <div
      className={clsx(
        'fixed z-50 pointer-events-none',
        positionClasses[position]
      )}
      aria-live="polite"
      aria-label="Notifications"
    >
      <div className="flex flex-col space-y-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastNotification
              key={toast.id}
              toast={toast}
              onDismiss={onDismiss}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Hook for managing toasts
export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      duration: 5000, // Default 5 seconds
      dismissible: true,
      ...toast
    };
    
    setToasts(prev => [...prev, newToast]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  // Convenience methods
  const showSuccess = (title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ type: 'success', title, message, ...options });
  };

  const showError = (title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ type: 'error', title, message, duration: 0, ...options }); // Errors don't auto-dismiss
  };

  const showWarning = (title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ type: 'warning', title, message, ...options });
  };

  const showInfo = (title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ type: 'info', title, message, ...options });
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
}
