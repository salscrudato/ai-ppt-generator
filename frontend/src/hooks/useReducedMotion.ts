/**
 * Reduced Motion Hook
 * 
 * Provides accessibility-aware animation controls that respect user preferences
 * for reduced motion. Automatically detects system preferences and provides
 * manual override controls.
 */

import { useState, useEffect } from 'react';

/**
 * Hook to detect and manage reduced motion preferences
 */
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [manualOverride, setManualOverride] = useState<boolean | null>(null);

  useEffect(() => {
    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Check localStorage for user preference
  useEffect(() => {
    const stored = localStorage.getItem('prefer-reduced-motion');
    if (stored !== null) {
      setManualOverride(stored === 'true');
    }
  }, []);

  const shouldReduceMotion = manualOverride !== null ? manualOverride : prefersReducedMotion;

  const setReducedMotion = (reduce: boolean) => {
    setManualOverride(reduce);
    localStorage.setItem('prefer-reduced-motion', reduce.toString());
  };

  const clearOverride = () => {
    setManualOverride(null);
    localStorage.removeItem('prefer-reduced-motion');
  };

  return {
    shouldReduceMotion,
    prefersReducedMotion,
    manualOverride,
    setReducedMotion,
    clearOverride
  };
}

/**
 * Animation configuration that respects reduced motion preferences
 */
export function useAccessibleAnimation(
  normalAnimation: any,
  reducedAnimation?: any
) {
  const { shouldReduceMotion } = useReducedMotion();

  if (shouldReduceMotion) {
    return reducedAnimation || {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.1 }
    };
  }

  return normalAnimation;
}

/**
 * Transition configuration that respects reduced motion
 */
export function useAccessibleTransition(
  normalTransition: any,
  reducedTransition?: any
) {
  const { shouldReduceMotion } = useReducedMotion();

  if (shouldReduceMotion) {
    return reducedTransition || { duration: 0.1 };
  }

  return normalTransition;
}

/**
 * Spring configuration that respects reduced motion
 */
export function useAccessibleSpring() {
  const { shouldReduceMotion } = useReducedMotion();

  if (shouldReduceMotion) {
    return {
      type: 'tween',
      duration: 0.1
    };
  }

  return {
    type: 'spring',
    stiffness: 260,
    damping: 20
  };
}

/**
 * Hover animation that respects reduced motion
 */
export function useAccessibleHover(
  normalHover: any,
  reducedHover?: any
) {
  const { shouldReduceMotion } = useReducedMotion();

  if (shouldReduceMotion) {
    return reducedHover || {};
  }

  return normalHover;
}

/**
 * Animation variants that respect reduced motion
 */
export const accessibleVariants = {
  normal: {
    fadeIn: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    slideIn: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.05 },
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  },
  reduced: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.1 }
    },
    slideIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.1 }
    },
    scaleIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.1 }
    }
  }
};

/**
 * Get appropriate animation variant based on motion preference
 */
export function useAnimationVariant(variantName: keyof typeof accessibleVariants.normal) {
  const { shouldReduceMotion } = useReducedMotion();
  
  return shouldReduceMotion 
    ? accessibleVariants.reduced[variantName]
    : accessibleVariants.normal[variantName];
}


