/**
 * Accessibility Controls Component
 * 
 * Provides user controls for accessibility features including
 * high contrast mode, reduced motion, and font size adjustments.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiAdjustmentsHorizontal,
  HiEye,
  HiCog6Tooth,
  HiXMark
} from 'react-icons/hi2';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { AnimationSettings } from './AccessibleMotion';

interface AccessibilityControlsProps {
  className?: string;
}

export default function AccessibilityControls({ className = '' }: AccessibilityControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState('normal');
  const { shouldReduceMotion } = useReducedMotion();

  // Load saved preferences
  useEffect(() => {
    const savedHighContrast = localStorage.getItem('high-contrast') === 'true';
    const savedFontSize = localStorage.getItem('font-size') || 'normal';
    
    setHighContrast(savedHighContrast);
    setFontSize(savedFontSize);
    
    // Apply settings
    if (savedHighContrast) {
      document.documentElement.classList.add('theme-high-contrast');
    }
    document.documentElement.setAttribute('data-font-size', savedFontSize);
  }, []);

  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    localStorage.setItem('high-contrast', newValue.toString());
    
    if (newValue) {
      document.documentElement.classList.add('theme-high-contrast');
    } else {
      document.documentElement.classList.remove('theme-high-contrast');
    }
  };

  const changeFontSize = (size: string) => {
    setFontSize(size);
    localStorage.setItem('font-size', size);
    document.documentElement.setAttribute('data-font-size', size);
  };

  const resetToDefaults = () => {
    setHighContrast(false);
    setFontSize('normal');
    localStorage.removeItem('high-contrast');
    localStorage.removeItem('font-size');
    document.documentElement.classList.remove('theme-high-contrast');
    document.documentElement.setAttribute('data-font-size', 'normal');
  };

  return (
    <div className={`relative ${className}`}>
      {/* Accessibility Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 z-50 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Accessibility settings"
        aria-expanded={isOpen}
        aria-controls="accessibility-panel"
      >
        <HiAdjustmentsHorizontal className="w-6 h-6" />
      </motion.button>

      {/* Accessibility Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="accessibility-panel"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-20 left-4 z-50 w-80 bg-white rounded-lg shadow-xl border border-slate-200 p-6"
            role="dialog"
            aria-label="Accessibility Settings"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Accessibility Settings
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                aria-label="Close accessibility settings"
              >
                <HiXMark className="w-5 h-5" />
              </button>
            </div>

            {/* High Contrast Toggle */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="high-contrast" className="flex items-center gap-2 text-sm font-medium text-slate-900">
                  <HiEye className="w-4 h-4" />
                  High Contrast Mode
                </label>
                <button
                  id="high-contrast"
                  onClick={toggleHighContrast}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    highContrast ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                  role="switch"
                  aria-checked={highContrast}
                  aria-describedby="high-contrast-description"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      highContrast ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p id="high-contrast-description" className="text-xs text-slate-600">
                Increases contrast for better visibility
              </p>
            </div>

            {/* Font Size Controls */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-900 mb-3">
                <HiCog6Tooth className="w-4 h-4" />
                Font Size
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'small', label: 'Small' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'large', label: 'Large' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => changeFontSize(option.value)}
                    className={`px-3 py-2 text-sm rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      fontSize === option.value
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                    aria-pressed={fontSize === option.value}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Animation Settings */}
            <div className="mb-6">
              <AnimationSettings className="border-t border-slate-200 pt-4" />
            </div>

            {/* Reset Button */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <button
                onClick={resetToDefaults}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
              >
                Reset to Defaults
              </button>
              
              {/* Status Indicator */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className={`w-2 h-2 rounded-full ${
                  highContrast || fontSize !== 'normal' || shouldReduceMotion 
                    ? 'bg-indigo-500' 
                    : 'bg-slate-300'
                }`} />
                {highContrast || fontSize !== 'normal' || shouldReduceMotion 
                  ? 'Custom settings active' 
                  : 'Default settings'
                }
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Skip Links Component
 */
export function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="skip-link"
      >
        Skip to main content
      </a>
      <a
        href="#slide-list"
        className="skip-link"
      >
        Skip to slide list
      </a>
      <a
        href="#accessibility-controls"
        className="skip-link"
      >
        Skip to accessibility controls
      </a>
    </div>
  );
}

/**
 * Keyboard Navigation Indicator
 */
export function KeyboardNavigationIndicator() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation-active');
      }
    };

    const handleMouseDown = () => {
      document.body.classList.remove('keyboard-navigation-active');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return null; // This component only manages classes
}
