/**
 * Mobile Navigation Component
 * 
 * Provides mobile-friendly navigation with touch-optimized buttons
 * and responsive layout for the AI PowerPoint Generator.
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  HiHome,
  HiPencil,
  HiRectangleStack,
  HiArrowLeft,
  HiSparkles
} from 'react-icons/hi2';
import clsx from 'clsx';

interface MobileNavigationProps {
  /** Current step in the application flow */
  currentStep: 'input' | 'edit' | 'presentation';
  /** Current mode (single slide or presentation) */
  mode: 'single' | 'presentation';
  /** Whether generation is in progress */
  loading?: boolean;
  /** Callback for navigation actions */
  onNavigate?: (action: 'back' | 'home' | 'switch-mode') => void;
  /** Callback for primary action */
  onPrimaryAction?: () => void;
  /** Primary action label */
  primaryActionLabel?: string;
  /** Whether primary action is disabled */
  primaryActionDisabled?: boolean;
}

export default function MobileNavigation({
  currentStep,
  mode,
  loading = false,
  onNavigate,
  onPrimaryAction,
  primaryActionLabel,
  primaryActionDisabled = false
}: MobileNavigationProps) {
  const getStepIcon = (step: string) => {
    switch (step) {
      case 'input':
        return HiHome;
      case 'edit':
        return HiPencil;
      case 'presentation':
        return HiRectangleStack;
      default:
        return HiHome;
    }
  };

  const getStepLabel = (step: string) => {
    switch (step) {
      case 'input':
        return 'Input';
      case 'edit':
        return 'Edit';
      case 'presentation':
        return 'Presentation';
      default:
        return 'Home';
    }
  };

  const canGoBack = currentStep !== 'input';
  const showModeSwitch = currentStep === 'edit' || currentStep === 'presentation';

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-2 z-50 safe-area-inset-bottom sm:hidden"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-between max-w-sm mx-auto">
        {/* Back Button */}
        <motion.button
          onClick={() => onNavigate?.('back')}
          disabled={!canGoBack || loading}
          className={clsx(
            'flex flex-col items-center justify-center p-2 rounded-lg transition-all touch-target',
            canGoBack && !loading
              ? 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
              : 'text-gray-300 cursor-not-allowed'
          )}
          whileTap={canGoBack && !loading ? { scale: 0.95 } : {}}
          aria-label="Go back"
        >
          <HiArrowLeft className="w-5 h-5" />
          <span className="text-xs mt-1">Back</span>
        </motion.button>

        {/* Step Indicator */}
        <div className="flex items-center space-x-1">
          {['input', 'edit', 'presentation'].map((step, _index) => {
            const StepIcon = getStepIcon(step);
            const isActive = step === currentStep;
            const isCompleted = 
              (step === 'input' && (currentStep === 'edit' || currentStep === 'presentation')) ||
              (step === 'edit' && currentStep === 'presentation');

            return (
              <motion.div
                key={step}
                className={clsx(
                  'flex flex-col items-center p-2 rounded-lg transition-all',
                  isActive
                    ? 'bg-indigo-100 text-indigo-700'
                    : isCompleted
                    ? 'text-green-600'
                    : 'text-gray-400'
                )}
                animate={{
                  scale: isActive ? 1.1 : 1,
                  opacity: isActive ? 1 : 0.7
                }}
              >
                <StepIcon className="w-4 h-4" />
                <span className="text-xs mt-1">{getStepLabel(step)}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Mode Switch / Primary Action */}
        {showModeSwitch ? (
          <motion.button
            onClick={() => onNavigate?.('switch-mode')}
            disabled={loading}
            className={clsx(
              'flex flex-col items-center justify-center p-2 rounded-lg transition-all touch-target',
              loading
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100'
            )}
            whileTap={!loading ? { scale: 0.95 } : {}}
            aria-label={`Switch to ${mode === 'single' ? 'presentation' : 'single slide'} mode`}
          >
            <HiRectangleStack className="w-5 h-5" />
            <span className="text-xs mt-1">
              {mode === 'single' ? 'Multi' : 'Single'}
            </span>
          </motion.button>
        ) : (
          <motion.button
            onClick={onPrimaryAction}
            disabled={primaryActionDisabled || loading}
            className={clsx(
              'flex flex-col items-center justify-center p-2 rounded-lg transition-all touch-target',
              primaryActionDisabled || loading
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100'
            )}
            whileTap={!primaryActionDisabled && !loading ? { scale: 0.95 } : {}}
            aria-label={primaryActionLabel || 'Primary action'}
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full"
              />
            ) : (
              <HiSparkles className="w-5 h-5" />
            )}
            <span className="text-xs mt-1">
              {loading ? 'Loading' : primaryActionLabel || 'Generate'}
            </span>
          </motion.button>
        )}
      </div>

      {/* Progress Bar */}
      {loading && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 origin-left"
          style={{ width: '100%' }}
        />
      )}
    </motion.nav>
  );
}

// Hook for mobile navigation state
export function useMobileNavigation() {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsVisible(window.innerWidth < 640); // sm breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return { isVisible };
}

// Mobile-specific layout wrapper
interface MobileLayoutProps {
  children: React.ReactNode;
  hasNavigation?: boolean;
}

export function MobileLayout({ children, hasNavigation = false }: MobileLayoutProps) {
  return (
    <div className={clsx(
      'min-h-screen',
      hasNavigation && 'pb-20 sm:pb-0' // Add bottom padding for mobile nav
    )}>
      {children}
    </div>
  );
}
