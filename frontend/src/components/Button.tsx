/**
 * Optimized Button Component for AI PowerPoint Generator
 *
 * Streamlined button component with essential variants and animations.
 * Focuses on the most commonly used button types while maintaining
 * professional appearance and accessibility.
 *
 * @version 3.1.0-optimized
 * @author AI PowerPoint Generator Team
 */

import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

// Simplified type definitions for essential button variants
export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button visual style variant */
  variant?: ButtonVariant;

  /** Button size */
  size?: ButtonSize;

  /** Loading state with spinner */
  loading?: boolean;

  /** Optional icon element */
  icon?: React.ReactNode;

  /** Icon position relative to text */
  iconPosition?: 'left' | 'right';

  /** Full width button */
  fullWidth?: boolean;

  /** Button content */
  children: React.ReactNode;
}

// Optimized button variant classes
const buttonVariants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  accent: 'btn-accent',
  ghost: 'btn-ghost'
};

// Simplified button size classes
const buttonSizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg'
};

/**
 * Main Button Component
 * Optimized for performance and simplicity while maintaining professional appearance
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  // Filter out conflicting props to avoid conflicts with motion.button
  const {
    onAnimationStart,
    onAnimationEnd,
    onAnimationIteration,
    onDragStart,
    onDragEnd,
    onDrag,
    ...buttonProps
  } = props;

  return (
    <motion.button
      className={clsx(
        'btn',
        buttonVariants[variant],
        buttonSizes[size],
        fullWidth && 'w-full',
        isDisabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.02, y: -1 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2 }}
      {...buttonProps}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <motion.div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <span>Loading...</span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          {icon && iconPosition === 'left' && icon}
          {children}
          {icon && iconPosition === 'right' && icon}
        </div>
      )}
    </motion.button>
  );
}

/**
 * Icon Button Component
 * Simplified icon-only button for common UI actions
 */
interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export function IconButton({
  icon,
  size = 'md',
  variant = 'ghost',
  className,
  ...props
}: IconButtonProps) {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  // Filter out conflicting props to avoid conflicts with motion.button
  const {
    onAnimationStart,
    onAnimationEnd,
    onAnimationIteration,
    onDragStart,
    onDragEnd,
    onDrag,
    ...buttonProps
  } = props;

  return (
    <motion.button
      className={clsx(
        'btn',
        buttonVariants[variant],
        iconSizes[size],
        'p-0 flex items-center justify-center',
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      {...buttonProps}
    >
      {icon}
    </motion.button>
  );
}
