/**
 * Optimized Loading Spinner Component
 *
 * Simplified loading spinner with essential variants and smooth animations.
 * Focuses on performance and visual appeal while maintaining accessibility.
 *
 * @version 3.1.0-optimized
 * @author AI PowerPoint Generator Team
 */

import { motion } from 'framer-motion';
import { HiSparkles } from 'react-icons/hi2';

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
          animate={{ rotate: 360 }}
          transition={{
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
