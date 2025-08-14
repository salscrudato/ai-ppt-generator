/**
 * Enhanced Loading Components
 *
 * Comprehensive loading indicators with multiple variants, animations,
 * and accessibility support. Includes spinners, progress bars, and overlays.
 *
 * @version 4.0.0-enhanced
 * @author AI PowerPoint Generator Team
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSparkles } from 'react-icons/hi2';
import { useReducedMotion } from '../hooks/useReducedMotion';
import clsx from 'clsx';

interface LoadingSpinnerProps {
  /** Spinner size */
  size?: 'sm' | 'md' | 'lg';

  /** Visual variant */
  variant?: 'primary' | 'accent' | 'minimal';

  /** Optional loading message */
  message?: string;

  /** Additional CSS classes */
  className?: string;
}

export default function LoadingSpinner({
  size = 'md',
  variant = 'primary',
  message,
  className = ''
}: LoadingSpinnerProps) {
  const { shouldReduceMotion } = useReducedMotion();

  // Simplified size configurations
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const containerSizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  // Optimized variant styles
  const variantClasses = {
    primary: 'text-indigo-600',
    accent: 'text-pink-600',
    minimal: 'text-slate-400'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {/* Optimized Spinner */}
      <div className={`relative ${containerSizeClasses[size]}`}>
        {/* Main Spinner Ring */}
        <motion.div
          className={`absolute inset-0 rounded-full border-2 border-transparent`}
          style={{
            borderTopColor: variant === 'primary' ? '#4f46e5' : variant === 'accent' ? '#ec4899' : '#94a3b8',
            borderRightColor: variant === 'primary' ? '#4f46e5' : variant === 'accent' ? '#ec4899' : '#94a3b8',
          }}
          animate={{ rotate: shouldReduceMotion ? 0 : 360 }}
          transition={shouldReduceMotion ? {} : {
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Center Icon */}
        <motion.div
          className={`absolute inset-0 flex items-center justify-center ${variantClasses[variant]}`}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <HiSparkles className={sizeClasses[size]} />
        </motion.div>
      </div>

      {/* Loading Message */}
      {message && (
        <motion.p
          className={`text-sm font-medium ${variantClasses[variant]} text-center max-w-xs`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}

/**
 * Simple Spinner Component (for inline use)
 */
interface SimpleSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'white' | 'gray';
  className?: string;
}

export function SimpleSpinner({ size = 'md', variant = 'primary', className = '' }: SimpleSpinnerProps) {
  const sizeClasses = {
    xs: 'w-3 h-3 border-[1.5px]',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-4'
  };

  const variantClasses = {
    primary: 'border-indigo-600 border-t-transparent',
    secondary: 'border-slate-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-400 border-t-transparent'
  };

  return (
    <div
      className={clsx(
        'rounded-full animate-spin',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Loading Overlay Component
 */
interface LoadingOverlayProps {
  /** Whether the overlay is visible */
  visible: boolean;
  /** Loading message */
  message?: string;
  /** Progress percentage (0-100) */
  progress?: number;
  /** Whether to blur the background */
  blur?: boolean;
  /** Custom class name */
  className?: string;
  /** Children to render instead of default spinner */
  children?: React.ReactNode;
}

export function LoadingOverlay({
  visible,
  message = 'Loading...',
  progress,
  blur = true,
  className = '',
  children
}: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={clsx(
            'fixed inset-0 z-50 flex items-center justify-center',
            blur ? 'backdrop-blur-sm bg-black/20' : 'bg-black/50',
            className
          )}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm mx-4 text-center"
          >
            {children || (
              <>
                <LoadingSpinner size="lg" message={message} />
                {typeof progress === 'number' && (
                  <div className="mt-6">
                    <ProgressBar progress={progress} showPercentage />
                  </div>
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Progress Bar Component
 */
interface ProgressBarProps {
  progress: number;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  className?: string;
  label?: string;
}

export function ProgressBar({
  progress,
  variant = 'primary',
  size = 'md',
  showPercentage = false,
  className = '',
  label = 'Progress'
}: ProgressBarProps) {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const variantClasses = {
    primary: 'bg-indigo-600',
    secondary: 'bg-slate-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600'
  };

  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={clsx('w-full', className)}>
      {showPercentage && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-700">{label}</span>
          <span className="text-sm text-slate-500">{Math.round(clampedProgress)}%</span>
        </div>
      )}
      <div className={clsx('w-full bg-slate-200 rounded-full overflow-hidden', sizeClasses[size])}>
        <motion.div
          className={clsx('h-full rounded-full', variantClasses[variant])}
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label}: ${Math.round(clampedProgress)}%`}
        />
      </div>
    </div>
  );
}
