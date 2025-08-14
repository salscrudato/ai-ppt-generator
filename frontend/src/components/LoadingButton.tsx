/**
 * LoadingButton Component
 * 
 * Enhanced button component with loading states, animations, and accessibility.
 * Provides visual feedback during async operations with inline spinners.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { SimpleSpinner } from './LoadingSpinner';
import clsx from 'clsx';

interface LoadingButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onAnimationEnd' | 'onDragStart' | 'onDrag' | 'onDragEnd'> {
  /** Whether the button is in loading state */
  loading?: boolean;
  /** Loading text to show */
  loadingText?: string;
  /** Spinner size */
  spinnerSize?: 'xs' | 'sm' | 'md';
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Icon to show before text */
  icon?: React.ReactNode;
  /** Whether button should be full width */
  fullWidth?: boolean;
  /** Custom class name */
  className?: string;
  /** Children content */
  children: React.ReactNode;
}

export default function LoadingButton({
  loading = false,
  loadingText,
  spinnerSize = 'sm',
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth = false,
  className = '',
  disabled,
  children,
  ...props
}: LoadingButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 relative overflow-hidden';

  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 disabled:bg-indigo-400 shadow-sm hover:shadow-md',
    secondary: 'bg-slate-600 text-white hover:bg-slate-700 focus:ring-slate-500 disabled:bg-slate-400 shadow-sm hover:shadow-md',
    outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500 disabled:border-indigo-300 disabled:text-indigo-300 hover:shadow-sm',
    ghost: 'text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500 disabled:text-indigo-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400 shadow-sm hover:shadow-md'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5'
  };

  const isDisabled = disabled || loading;
  const spinnerVariant = variant === 'outline' || variant === 'ghost' ? 'primary' : 'white';

  return (
    <motion.button
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        isDisabled && 'cursor-not-allowed',
        loading && 'pointer-events-none',
        className
      )}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.02 } : undefined}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
      {...props}
    >
      {/* Loading overlay */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-current opacity-10"
        />
      )}

      {/* Content */}
      <div className="flex items-center justify-center gap-inherit">
        {loading ? (
          <SimpleSpinner
            size={spinnerSize}
            variant={spinnerVariant}
            className="flex-shrink-0"
          />
        ) : (
          icon && <span className="flex-shrink-0">{icon}</span>
        )}
        
        <motion.span
          key={loading ? 'loading' : 'normal'}
          initial={{ opacity: 0, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {loading && loadingText ? loadingText : children}
        </motion.span>
      </div>
    </motion.button>
  );
}

/**
 * Icon Button with Loading State
 */
interface LoadingIconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onAnimationEnd' | 'onDragStart' | 'onDrag' | 'onDragEnd'> {
  loading?: boolean;
  icon: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  className?: string;
}

export function LoadingIconButton({
  loading = false,
  icon,
  size = 'md',
  variant = 'primary',
  className = '',
  disabled,
  ...props
}: LoadingIconButtonProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-slate-600 text-white hover:bg-slate-700 focus:ring-slate-500',
    outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500',
    ghost: 'text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };

  const isDisabled = disabled || loading;
  const spinnerVariant = variant === 'outline' || variant === 'ghost' ? 'primary' : 'white';

  return (
    <motion.button
      className={clsx(
        'inline-flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm hover:shadow-md',
        sizeClasses[size],
        variantClasses[variant],
        isDisabled && 'cursor-not-allowed opacity-75',
        className
      )}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.05 } : undefined}
      whileTap={!isDisabled ? { scale: 0.95 } : undefined}
      {...props}
    >
      {loading ? (
        <SimpleSpinner size="xs" variant={spinnerVariant} />
      ) : (
        icon
      )}
    </motion.button>
  );
}

/**
 * Floating Action Button with Loading State
 */
interface LoadingFABProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onAnimationEnd' | 'onDragStart' | 'onDrag' | 'onDragEnd'> {
  loading?: boolean;
  icon: React.ReactNode;
  size?: 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
}

export function LoadingFAB({
  loading = false,
  icon,
  size = 'lg',
  variant = 'primary',
  className = '',
  disabled,
  ...props
}: LoadingFABProps) {
  const sizeClasses = {
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl'
  };

  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-lg hover:shadow-xl',
    secondary: 'bg-slate-600 text-white hover:bg-slate-700 focus:ring-slate-500 shadow-lg hover:shadow-xl',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-lg hover:shadow-xl'
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      className={clsx(
        'fixed bottom-6 right-6 inline-flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 z-50',
        sizeClasses[size],
        variantClasses[variant],
        isDisabled && 'cursor-not-allowed opacity-75',
        className
      )}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.1, rotate: 5 } : undefined}
      whileTap={!isDisabled ? { scale: 0.9 } : undefined}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      {...props}
    >
      <motion.div
        animate={loading ? { rotate: 360 } : { rotate: 0 }}
        transition={loading ? { duration: 1, repeat: Infinity, ease: 'linear' } : { duration: 0.2 }}
      >
        {loading ? (
          <SimpleSpinner size="sm" variant="white" />
        ) : (
          icon
        )}
      </motion.div>
    </motion.button>
  );
}

/**
 * Button Group with Loading States
 */
interface LoadingButtonGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function LoadingButtonGroup({ children, className = '' }: LoadingButtonGroupProps) {
  return (
    <div className={clsx('inline-flex rounded-lg shadow-sm', className)} role="group">
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          const childProps = child.props as any;
          return React.cloneElement(child as React.ReactElement<any>, {
            className: clsx(
              childProps.className,
              'focus:z-10',
              index === 0 && 'rounded-r-none',
              index === React.Children.count(children) - 1 && 'rounded-l-none',
              index > 0 && index < React.Children.count(children) - 1 && 'rounded-none',
              index > 0 && '-ml-px'
            )
          });
        }
        return child;
      })}
    </div>
  );
}
