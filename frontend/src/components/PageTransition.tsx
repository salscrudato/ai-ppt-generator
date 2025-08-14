/**
 * Page Transition Components
 * 
 * Provides smooth page transitions and animations for better UX.
 * Includes fade, slide, and scale transitions with accessibility support.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  /** Unique key for the page/component */
  pageKey: string;
  /** Animation variant */
  variant?: 'fade' | 'slide' | 'scale' | 'slideUp' | 'slideDown';
  /** Animation duration in seconds */
  duration?: number;
  /** Custom class name */
  className?: string;
}

// Animation variants
const pageVariants: Record<string, Variants> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slide: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 }
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  }
};

export default function PageTransition({
  children,
  pageKey,
  variant = 'fade',
  duration = 0.3,
  className = ''
}: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        variants={pageVariants[variant]}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          duration,
          ease: 'easeInOut'
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Staggered Children Animation
 */
interface StaggeredAnimationProps {
  children: React.ReactNode;
  /** Stagger delay between children */
  staggerDelay?: number;
  /** Animation variant for children */
  childVariant?: 'fadeUp' | 'fadeIn' | 'scaleIn';
  /** Custom class name */
  className?: string;
}



const childVariants: Record<string, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' }
    }
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.4, ease: 'easeOut' }
    }
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: 'easeOut' }
    }
  }
};

export function StaggeredAnimation({
  children,
  staggerDelay = 0.1,
  childVariant = 'fadeUp',
  className = ''
}: StaggeredAnimationProps) {
  const containerVariantsWithDelay: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay
      }
    }
  };

  return (
    <motion.div
      variants={containerVariantsWithDelay}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={childVariants[childVariant]}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

/**
 * Slide In Animation Hook
 */
export function useSlideInAnimation(direction: 'left' | 'right' | 'up' | 'down' = 'up') {
  const directions = {
    left: { x: -20, y: 0 },
    right: { x: 20, y: 0 },
    up: { x: 0, y: 20 },
    down: { x: 0, y: -20 }
  };

  return {
    initial: { 
      opacity: 0, 
      ...directions[direction]
    },
    animate: { 
      opacity: 1, 
      x: 0, 
      y: 0 
    },
    transition: { 
      duration: 0.4, 
      ease: 'easeOut' 
    }
  };
}

/**
 * Card Animation Component
 */
interface AnimatedCardProps {
  children: React.ReactNode;
  /** Hover animation */
  hoverEffect?: 'lift' | 'scale' | 'glow' | 'none';
  /** Click animation */
  tapEffect?: boolean;
  /** Custom class name */
  className?: string;
  /** Delay before animation starts */
  delay?: number;
}

export function AnimatedCard({
  children,
  hoverEffect = 'lift',
  tapEffect = true,
  className = '',
  delay = 0
}: AnimatedCardProps) {
  const hoverEffects = {
    lift: { y: -4, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)' },
    scale: { scale: 1.02 },
    glow: { boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' },
    none: {}
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileHover={hoverEffect !== 'none' ? hoverEffects[hoverEffect] : undefined}
      whileTap={tapEffect ? { scale: 0.98 } : undefined}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Loading Skeleton Animation
 */
interface SkeletonAnimationProps {
  /** Number of skeleton items */
  count?: number;
  /** Height of each skeleton */
  height?: string;
  /** Custom class name */
  className?: string;
}

export function SkeletonAnimation({
  count = 3,
  height = 'h-4',
  className = ''
}: SkeletonAnimationProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className={`bg-slate-200 rounded animate-pulse ${height}`}
          style={{ width: index === count - 1 ? '75%' : '100%' }}
        />
      ))}
    </div>
  );
}

/**
 * Floating Animation Component
 */
interface FloatingAnimationProps {
  children: React.ReactNode;
  /** Floating intensity */
  intensity?: 'subtle' | 'normal' | 'strong';
  /** Animation duration */
  duration?: number;
  /** Custom class name */
  className?: string;
}

export function FloatingAnimation({
  children,
  intensity = 'normal',
  duration = 3,
  className = ''
}: FloatingAnimationProps) {
  const intensityMap = {
    subtle: 5,
    normal: 10,
    strong: 15
  };

  return (
    <motion.div
      animate={{
        y: [-intensityMap[intensity], intensityMap[intensity], -intensityMap[intensity]]
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Pulse Animation Component
 */
interface PulseAnimationProps {
  children: React.ReactNode;
  /** Pulse intensity */
  intensity?: 'subtle' | 'normal' | 'strong';
  /** Animation duration */
  duration?: number;
  /** Custom class name */
  className?: string;
}

export function PulseAnimation({
  children,
  intensity = 'normal',
  duration = 2,
  className = ''
}: PulseAnimationProps) {
  const intensityMap = {
    subtle: [1, 1.02, 1],
    normal: [1, 1.05, 1],
    strong: [1, 1.1, 1]
  };

  return (
    <motion.div
      animate={{
        scale: intensityMap[intensity]
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
