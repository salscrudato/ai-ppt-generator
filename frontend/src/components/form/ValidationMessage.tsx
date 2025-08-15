/**
 * Validation Message Components
 * 
 * Provides inline error, warning, and success messages for form fields.
 * Includes animations and proper accessibility support.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import {
  HiExclamationTriangle,
  HiExclamationCircle,
  HiCheckCircle,
  HiInformationCircle
} from 'react-icons/hi2';

/**
 * Validation message types
 */
export type ValidationMessageType = 'error' | 'warning' | 'success' | 'info';

/**
 * Props for ValidationMessage component
 */
export interface ValidationMessageProps {
  /** Message text to display */
  message?: string;
  /** Type of message */
  type?: ValidationMessageType;
  /** Whether to show the message */
  show?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show an icon */
  showIcon?: boolean;
  /** Custom icon to display */
  icon?: React.ReactNode;
  /** Accessibility label */
  ariaLabel?: string;
}

/**
 * Get icon for message type
 */
function getMessageIcon(type: ValidationMessageType): React.ReactNode {
  switch (type) {
    case 'error':
      return <HiExclamationCircle className="w-4 h-4" />;
    case 'warning':
      return <HiExclamationTriangle className="w-4 h-4" />;
    case 'success':
      return <HiCheckCircle className="w-4 h-4" />;
    case 'info':
      return <HiInformationCircle className="w-4 h-4" />;
    default:
      return <HiInformationCircle className="w-4 h-4" />;
  }
}

/**
 * Get styling classes for message type
 */
function getMessageClasses(type: ValidationMessageType): string {
  switch (type) {
    case 'error':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'warning':
      return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'success':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'info':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

/**
 * Inline validation message component
 */
export function ValidationMessage({
  message,
  type = 'error',
  show = true,
  className,
  showIcon = true,
  icon,
  ariaLabel
}: ValidationMessageProps) {
  if (!message || !show) {
    return null;
  }

  const messageIcon = icon || (showIcon ? getMessageIcon(type) : null);
  const messageClasses = getMessageClasses(type);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0, marginTop: 0 }}
        animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
        exit={{ opacity: 0, height: 0, marginTop: 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className={clsx(
          'flex items-start gap-2 px-3 py-2 rounded-lg border text-sm',
          messageClasses,
          className
        )}
        role="alert"
        aria-label={ariaLabel || `${type} message`}
      >
        {messageIcon && (
          <div className="flex-shrink-0 mt-0.5">
            {messageIcon}
          </div>
        )}
        <span className="flex-1 leading-relaxed">{message}</span>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Field validation wrapper component
 */
export interface FieldValidationProps {
  /** Field name for accessibility */
  fieldName: string;
  /** Error message */
  error?: string;
  /** Warning message */
  warning?: string;
  /** Success message */
  success?: string;
  /** Info message */
  info?: string;
  /** Whether the field has been touched */
  touched?: boolean;
  /** Whether to show validation only after touch */
  showOnlyWhenTouched?: boolean;
  /** Children (form field) */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Wrapper component that handles field validation display
 */
export function FieldValidation({
  fieldName,
  error,
  warning,
  success,
  info,
  touched = false,
  showOnlyWhenTouched = true,
  children,
  className
}: FieldValidationProps) {
  const shouldShow = !showOnlyWhenTouched || touched;

  return (
    <div className={clsx('space-y-1', className)}>
      {children}
      
      {shouldShow && error && (
        <ValidationMessage
          message={error}
          type="error"
          ariaLabel={`Error for ${fieldName}`}
        />
      )}
      
      {shouldShow && !error && warning && (
        <ValidationMessage
          message={warning}
          type="warning"
          ariaLabel={`Warning for ${fieldName}`}
        />
      )}
      
      {shouldShow && !error && !warning && success && (
        <ValidationMessage
          message={success}
          type="success"
          ariaLabel={`Success for ${fieldName}`}
        />
      )}
      
      {shouldShow && !error && !warning && !success && info && (
        <ValidationMessage
          message={info}
          type="info"
          ariaLabel={`Information for ${fieldName}`}
        />
      )}
    </div>
  );
}

/**
 * Character count component with validation styling
 */
export interface CharacterCountProps {
  /** Current character count */
  current: number;
  /** Maximum allowed characters */
  max: number;
  /** Minimum required characters */
  min?: number;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show as a progress bar */
  showProgress?: boolean;
}

/**
 * Character count display with validation states
 */
export function CharacterCount({
  current,
  max,
  min = 0,
  className,
  showProgress = false
}: CharacterCountProps) {
  const percentage = (current / max) * 100;
  const isOverLimit = current > max;
  const isUnderMin = current < min;
  const isWarning = percentage > 80 && !isOverLimit;
  
  const getCountClasses = () => {
    if (isOverLimit) return 'text-red-600 bg-red-100';
    if (isWarning) return 'text-amber-600 bg-amber-100';
    if (isUnderMin) return 'text-gray-400 bg-gray-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getProgressClasses = () => {
    if (isOverLimit) return 'bg-red-500';
    if (isWarning) return 'bg-amber-500';
    return 'bg-blue-500';
  };

  return (
    <div className={clsx('space-y-2', className)}>
      <div className={clsx(
        'inline-flex items-center px-2 py-1 rounded text-xs font-medium',
        getCountClasses()
      )}>
        {current}/{max}
        {min > 0 && current < min && (
          <span className="ml-1 text-xs">
            (min: {min})
          </span>
        )}
      </div>
      
      {showProgress && (
        <div className="w-full bg-gray-200 rounded-full h-1">
          <motion.div
            className={clsx('h-1 rounded-full transition-colors', getProgressClasses())}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentage, 100)}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Form validation summary component
 */
export interface ValidationSummaryProps {
  /** All field errors */
  errors: Record<string, string[]>;
  /** Whether to show the summary */
  show?: boolean;
  /** Title for the summary */
  title?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Summary of all form validation errors
 */
export function ValidationSummary({
  errors,
  show = true,
  title = 'Please fix the following errors:',
  className
}: ValidationSummaryProps) {
  const errorEntries = Object.entries(errors).filter(([_, errs]) => errs.length > 0);
  
  if (!show || errorEntries.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={clsx(
        'p-4 bg-red-50 border border-red-200 rounded-lg',
        className
      )}
      role="alert"
      aria-label="Form validation errors"
    >
      <div className="flex items-start gap-3">
        <HiExclamationCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 mb-2">
            {title}
          </h3>
          <ul className="space-y-1 text-sm text-red-700">
            {errorEntries.map(([field, fieldErrors]) => (
              <li key={field} className="flex items-start gap-2">
                <span className="font-medium capitalize">
                  {field.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                </span>
                <span>{fieldErrors[0]}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
