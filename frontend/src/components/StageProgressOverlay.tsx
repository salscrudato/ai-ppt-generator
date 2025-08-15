/**
 * Stage Progress Overlay Component
 * 
 * Enhanced loading overlay that shows multi-stage progress with transitions,
 * stage indicators, and error handling for the AI pipeline.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiSparkles,
  HiCog6Tooth,
  HiPhoto,
  HiDocumentText,
  HiCheckCircle,
  HiExclamationTriangle
} from 'react-icons/hi2';
import clsx from 'clsx';
import type { LoadingStage } from '../hooks/useLoadingState';

interface StageProgressOverlayProps {
  /** Whether the overlay is visible */
  visible: boolean;
  /** Current loading stage */
  currentStage?: LoadingStage;
  /** All stages for progress calculation */
  stages?: LoadingStage[];
  /** Current stage index */
  currentStageIndex?: number;
  /** Overall progress (0-100) */
  progress?: number;
  /** Error message if loading failed */
  error?: string;
  /** Success message when completed */
  successMessage?: string;
  /** Whether to show stage list */
  showStageList?: boolean;
  /** Custom class name */
  className?: string;
  /** Callback when overlay is dismissed */
  onDismiss?: () => void;
}

// Stage icon mapping
const getStageIcon = (stageId: string) => {
  switch (stageId) {
    case 'analyzing':
    case 'preparing':
      return HiCog6Tooth;
    case 'generating':
    case 'processing':
      return HiSparkles;
    case 'formatting':
    case 'applying-theme':
      return HiDocumentText;
    case 'building':
    case 'finalizing':
      return HiCheckCircle;
    case 'fetching':
    case 'optimizing':
      return HiPhoto;
    default:
      return HiSparkles;
  }
};

export default function StageProgressOverlay({
  visible,
  currentStage,
  stages = [],
  currentStageIndex = 0,
  progress = 0,
  error,
  successMessage,
  showStageList = true,
  className = '',
  onDismiss
}: StageProgressOverlayProps) {
  const IconComponent = currentStage ? getStageIcon(currentStage.id) : HiSparkles;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={clsx(
            'fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20',
            className
          )}
          onClick={error || successMessage ? onDismiss : undefined}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Error State */}
            {error && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center"
                >
                  <HiExclamationTriangle className="w-8 h-8 text-red-600" />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Something went wrong
                </h3>
                <p className="text-sm text-gray-600 mb-6">{error}</p>
                <button
                  onClick={onDismiss}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </>
            )}

            {/* Success State */}
            {successMessage && !error && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center"
                >
                  <HiCheckCircle className="w-8 h-8 text-green-600" />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Success!
                </h3>
                <p className="text-sm text-gray-600 mb-6">{successMessage}</p>
                <button
                  onClick={onDismiss}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Continue
                </button>
              </>
            )}

            {/* Loading State */}
            {!error && !successMessage && (
              <>
                {/* Main Loading Icon */}
                <motion.div
                  className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center"
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  <IconComponent className="w-8 h-8 text-indigo-600" />
                </motion.div>

                {/* Current Stage Message */}
                <motion.h3
                  key={currentStage?.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-lg font-semibold text-gray-900 mb-2"
                >
                  {currentStage?.message || 'Processing...'}
                </motion.h3>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                  <motion.div
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>

                {/* Stage List */}
                {showStageList && stages.length > 1 && (
                  <div className="space-y-3">
                    {stages.map((stage, index) => {
                      const isCompleted = index < currentStageIndex;
                      const isCurrent = index === currentStageIndex;
                      const StageIcon = getStageIcon(stage.id);

                      return (
                        <motion.div
                          key={stage.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={clsx(
                            'flex items-center gap-3 p-3 rounded-lg transition-all',
                            isCompleted
                              ? 'bg-green-50 text-green-700'
                              : isCurrent
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'bg-gray-50 text-gray-500'
                          )}
                        >
                          <div
                            className={clsx(
                              'w-8 h-8 rounded-full flex items-center justify-center',
                              isCompleted
                                ? 'bg-green-200'
                                : isCurrent
                                ? 'bg-indigo-200'
                                : 'bg-gray-200'
                            )}
                          >
                            {isCompleted ? (
                              <HiCheckCircle className="w-5 h-5" />
                            ) : (
                              <StageIcon
                                className={clsx(
                                  'w-4 h-4',
                                  isCurrent && 'animate-pulse'
                                )}
                              />
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="text-sm font-medium">
                              {stage.message}
                            </div>
                          </div>
                          {isCurrent && (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: 'linear'
                              }}
                              className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full"
                            />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* Progress Percentage */}
                <div className="mt-4 text-sm text-gray-500">
                  {Math.round(progress)}% complete
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
