/**
 * Accessibility-aware Motion Components
 * 
 * React components that respect user motion preferences and provide
 * accessible animation controls.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion, useAnimationVariant, accessibleVariants } from '../hooks/useReducedMotion';

/**
 * Accessibility-aware motion component wrapper
 */
interface AccessibleMotionProps {
  children: React.ReactNode;
  /** Animation variant */
  variant?: keyof typeof accessibleVariants.normal;
  /** Custom normal animation */
  normalAnimation?: any;
  /** Custom reduced animation */
  reducedAnimation?: any;
  /** Additional props for motion.div */
  [key: string]: any;
}

export function AccessibleMotion({
  children,
  variant = 'fadeIn',
  normalAnimation,
  reducedAnimation,
  ...props
}: AccessibleMotionProps) {
  const { shouldReduceMotion } = useReducedMotion();

  let animation;
  if (normalAnimation && reducedAnimation) {
    animation = shouldReduceMotion ? reducedAnimation : normalAnimation;
  } else {
    animation = useAnimationVariant(variant);
  }

  return (
    <motion.div {...animation} {...props}>
      {children}
    </motion.div>
  );
}

/**
 * Animation settings component for user preferences
 */
interface AnimationSettingsProps {
  className?: string;
}

export function AnimationSettings({ className = '' }: AnimationSettingsProps) {
  const { shouldReduceMotion, prefersReducedMotion, manualOverride, setReducedMotion, clearOverride } = useReducedMotion();

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Animation Preferences</h3>
        <p className="text-sm text-slate-600 mb-4">
          Control how animations behave in the application. Reducing motion can help with motion sensitivity and improve performance.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div>
            <div className="font-medium text-slate-900">System Preference</div>
            <div className="text-sm text-slate-600">
              {prefersReducedMotion ? 'Prefers reduced motion' : 'No preference set'}
            </div>
          </div>
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            prefersReducedMotion ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
          }`}>
            {prefersReducedMotion ? 'Reduced' : 'Normal'}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-900">Override Setting</label>
          <div className="flex gap-2">
            <button
              onClick={() => setReducedMotion(false)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                manualOverride === false
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Enable Animations
            </button>
            <button
              onClick={() => setReducedMotion(true)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                manualOverride === true
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Reduce Motion
            </button>
            <button
              onClick={clearOverride}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
            >
              Use System
            </button>
          </div>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>Current Setting:</strong> {shouldReduceMotion ? 'Reduced motion' : 'Normal animations'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccessibleMotion;
