/**
 * ProgressTracker Component
 * 
 * Multi-stage progress indicator for AI PowerPoint generation pipeline.
 * Provides clear visual feedback during content → layout → images → build process.
 * 
 * Features:
 * - Animated progress bar with stage transitions
 * - Descriptive text for each generation stage
 * - Error state handling with actionable messages
 * - Accessibility-compliant with ARIA live regions
 * - Smooth animations and professional styling
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiSparkles,
  HiCog6Tooth,
  HiPhoto,
  HiDocumentArrowDown,
  HiCheckCircle,
  HiExclamationTriangle
} from 'react-icons/hi2';
import clsx from 'clsx';
import { PROGRESS_STAGES, type ProgressStage } from '../constants/slideConstants';

interface ProgressTrackerProps {
  /** Current stage of the generation process */
  stage: ProgressStage;
  /** Whether the process is currently active */
  isActive: boolean;
  /** Error message if generation failed */
  error?: string;
  /** Custom stage descriptions */
  customStages?: Partial<typeof PROGRESS_STAGES>;
  /** Callback when user dismisses error */
  onErrorDismiss?: () => void;
  /** Additional CSS classes */
  className?: string;
}

// Stage icons mapping
const STAGE_ICONS = {
  preparing: HiCog6Tooth,
  generating: HiSparkles,
  refining: HiCog6Tooth,
  images: HiPhoto,
  building: HiDocumentArrowDown,
  complete: HiCheckCircle
} as const;

export default function ProgressTracker({
  stage,
  isActive,
  error,
  customStages,
  onErrorDismiss,
  className = ''
}: ProgressTrackerProps) {
  const [displayStage, setDisplayStage] = useState<ProgressStage>(stage);
  const [animationKey, setAnimationKey] = useState(0);

  // Merge custom stages with defaults
  const stages = { ...PROGRESS_STAGES, ...customStages };
  const currentStage = stages[displayStage];
  const IconComponent = STAGE_ICONS[displayStage];

  // Update display stage with smooth transitions
  useEffect(() => {
    if (stage !== displayStage) {
      const timer = setTimeout(() => {
        setDisplayStage(stage);
        setAnimationKey(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [stage, displayStage]);

  // Error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={clsx(
          'bg-red-50 border border-red-200 rounded-lg p-4',
          className
        )}
        role="alert"
        aria-live="assertive"
      >
        <div className="flex items-start gap-3">
          <HiExclamationTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Generation Failed
            </h3>
            <p className="text-sm text-red-700 mt-1">
              {error}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={onErrorDismiss}
                className="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Inactive state
  if (!isActive) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={clsx(
        'bg-white border border-slate-200 rounded-lg p-4 shadow-sm',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={`Generation progress: ${currentStage.label}`}
    >
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-slate-600">
            Progress
          </span>
          <span className="text-xs text-slate-500">
            {currentStage.progress}%
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${currentStage.progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Stage Information */}
      <AnimatePresence mode="wait">
        <motion.div
          key={animationKey}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3"
        >
          {/* Animated Icon */}
          <div className="relative">
            <motion.div
              animate={{ 
                rotate: displayStage === 'generating' || displayStage === 'refining' ? 360 : 0,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1.5, repeat: Infinity }
              }}
              className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center',
                displayStage === 'complete' 
                  ? 'bg-green-100 text-green-600'
                  : 'bg-blue-100 text-blue-600'
              )}
            >
              <IconComponent className="w-4 h-4" />
            </motion.div>
            
            {/* Pulse effect for active stages */}
            {displayStage !== 'complete' && (
              <motion.div
                className="absolute inset-0 rounded-full bg-blue-400"
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </div>

          {/* Stage Text */}
          <div className="flex-1">
            <h3 className="text-sm font-medium text-slate-900">
              {currentStage.label}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              {currentStage.description}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Stage Indicators */}
      <div className="mt-4 flex justify-center gap-2">
        {Object.keys(stages).map((stageKey, index) => {
          const isCurrentOrPast = stages[stageKey as ProgressStage].progress <= currentStage.progress;
          const isCurrent = stageKey === displayStage;
          
          return (
            <motion.div
              key={stageKey}
              className={clsx(
                'w-2 h-2 rounded-full transition-colors duration-300',
                isCurrent 
                  ? 'bg-blue-500 ring-2 ring-blue-200'
                  : isCurrentOrPast 
                    ? 'bg-blue-300' 
                    : 'bg-slate-200'
              )}
              animate={isCurrent ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              transition={{ duration: 0.5, repeat: isCurrent ? Infinity : 0 }}
            />
          );
        })}
      </div>
    </motion.div>
  );
}

/**
 * Hook for managing progress state
 */
export function useProgressTracker() {
  const [stage, setStage] = useState<ProgressStage>('preparing');
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const startProgress = () => {
    setIsActive(true);
    setStage('preparing');
    setError(undefined);
  };

  const updateStage = (newStage: ProgressStage) => {
    setStage(newStage);
  };

  const setProgressError = (errorMessage: string) => {
    setError(errorMessage);
    setIsActive(false);
  };

  const completeProgress = () => {
    setStage('complete');
    setTimeout(() => {
      setIsActive(false);
    }, 2000); // Show complete state for 2 seconds
  };

  const resetProgress = () => {
    setIsActive(false);
    setStage('preparing');
    setError(undefined);
  };

  return {
    stage,
    isActive,
    error,
    startProgress,
    updateStage,
    setProgressError,
    completeProgress,
    resetProgress
  };
}
