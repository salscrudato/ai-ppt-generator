/**
 * Multi-Stage Progress Indicator
 * 
 * Comprehensive progress tracking system for PowerPoint generation with:
 * - Multi-stage progress visualization
 * - Real-time status updates
 * - Estimated time remaining
 * - Error handling and retry options
 * - Accessibility support with screen reader announcements
 * - Mobile-responsive design
 * 
 * @version 2.0.0
 * @author AI PowerPoint Generator Team
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

// Icons
import { 
  HiCheck, 
  HiX, 
  HiExclamation,
  HiRefresh,
  HiClock,
  HiLightningBolt,
  HiDocumentText,
  HiColorSwatch,
  HiPhotograph,
  HiDownload
} from 'react-icons/hi';

// Components
import Button from './Button';
import { LoadingSpinner } from './LoadingSpinner';

export interface ProgressStage {
  /** Unique stage identifier */
  id: string;
  /** Display name for the stage */
  name: string;
  /** Detailed description of what's happening */
  description: string;
  /** Icon component for the stage */
  icon: React.ComponentType<{ className?: string }>;
  /** Estimated duration in milliseconds */
  estimatedDuration: number;
  /** Current progress percentage (0-100) */
  progress: number;
  /** Stage status */
  status: 'pending' | 'active' | 'completed' | 'error' | 'skipped';
  /** Error message if status is 'error' */
  error?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

export interface MultiStageProgressProps {
  /** Array of progress stages */
  stages: ProgressStage[];
  /** Current active stage ID */
  currentStageId?: string;
  /** Overall progress percentage (0-100) */
  overallProgress: number;
  /** Whether the process is complete */
  isComplete: boolean;
  /** Whether the process has failed */
  hasFailed: boolean;
  /** Estimated time remaining in milliseconds */
  estimatedTimeRemaining?: number;
  /** Callback when retry is requested */
  onRetry?: () => void;
  /** Callback when cancel is requested */
  onCancel?: () => void;
  /** Whether to show detailed progress */
  showDetails?: boolean;
  /** Whether to show time estimates */
  showTimeEstimates?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Compact mode for smaller displays */
  compact?: boolean;
}

/**
 * Default stages for PowerPoint generation
 */
export const DEFAULT_POWERPOINT_STAGES: ProgressStage[] = [
  {
    id: 'content-generation',
    name: 'Generating Content',
    description: 'AI is creating slide content based on your input',
    icon: HiDocumentText,
    estimatedDuration: 15000,
    progress: 0,
    status: 'pending'
  },
  {
    id: 'layout-optimization',
    name: 'Optimizing Layout',
    description: 'Applying professional layouts and formatting',
    icon: HiColorSwatch,
    estimatedDuration: 8000,
    progress: 0,
    status: 'pending'
  },
  {
    id: 'image-generation',
    name: 'Creating Images',
    description: 'Generating AI-powered visuals for your slides',
    icon: HiPhotograph,
    estimatedDuration: 20000,
    progress: 0,
    status: 'pending'
  },
  {
    id: 'powerpoint-assembly',
    name: 'Building Presentation',
    description: 'Assembling your PowerPoint file with themes and formatting',
    icon: HiLightningBolt,
    estimatedDuration: 10000,
    progress: 0,
    status: 'pending'
  },
  {
    id: 'finalization',
    name: 'Finalizing',
    description: 'Adding final touches and preparing for download',
    icon: HiDownload,
    estimatedDuration: 3000,
    progress: 0,
    status: 'pending'
  }
];

/**
 * Format time duration for display
 */
function formatDuration(milliseconds: number): string {
  const seconds = Math.ceil(milliseconds / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
}

/**
 * Individual stage component
 */
interface StageItemProps {
  stage: ProgressStage;
  isActive: boolean;
  showDetails: boolean;
  showTimeEstimates: boolean;
  compact: boolean;
}

function StageItem({ stage, isActive, showDetails, showTimeEstimates, compact }: StageItemProps) {
  const Icon = stage.icon;

  const getStatusColor = () => {
    switch (stage.status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'active':
        return 'text-blue-600 bg-blue-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'skipped':
        return 'text-gray-400 bg-gray-100';
      default:
        return 'text-gray-400 bg-gray-100';
    }
  };

  const getStatusIcon = () => {
    switch (stage.status) {
      case 'completed':
        return <HiCheck className="w-4 h-4" />;
      case 'error':
        return <HiX className="w-4 h-4" />;
      case 'active':
        return <LoadingSpinner size="sm" />;
      default:
        return <Icon className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      className={clsx(
        'stage-item flex items-start space-x-3 p-3 rounded-lg transition-all duration-200',
        isActive && 'bg-blue-50 border border-blue-200',
        stage.status === 'error' && 'bg-red-50 border border-red-200',
        stage.status === 'completed' && 'bg-green-50 border border-green-200'
      )}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Status Icon */}
      <div className={clsx(
        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
        getStatusColor()
      )}>
        {getStatusIcon()}
      </div>

      {/* Stage Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className={clsx(
            'font-medium',
            compact ? 'text-sm' : 'text-base',
            stage.status === 'completed' ? 'text-green-900' :
            stage.status === 'error' ? 'text-red-900' :
            isActive ? 'text-blue-900' : 'text-gray-900'
          )}>
            {stage.name}
          </h3>

          {/* Time Estimate */}
          {showTimeEstimates && stage.status === 'active' && (
            <div className="flex items-center text-xs text-gray-500">
              <HiClock className="w-3 h-3 mr-1" />
              {formatDuration(stage.estimatedDuration)}
            </div>
          )}
        </div>

        {/* Description */}
        {showDetails && (
          <p className={clsx(
            'text-gray-600 mt-1',
            compact ? 'text-xs' : 'text-sm'
          )}>
            {stage.description}
          </p>
        )}

        {/* Progress Bar */}
        {stage.status === 'active' && stage.progress > 0 && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{Math.round(stage.progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-blue-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${stage.progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Error Message */}
        {stage.status === 'error' && stage.error && (
          <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-sm text-red-700">
            <div className="flex items-start space-x-2">
              <HiExclamation className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{stage.error}</span>
            </div>
          </div>
        )}

        {/* Metadata */}
        {showDetails && stage.metadata && Object.keys(stage.metadata).length > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            {Object.entries(stage.metadata).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                <span>{String(value)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Main multi-stage progress indicator component
 */
export default function MultiStageProgressIndicator({
  stages,
  currentStageId,
  overallProgress,
  isComplete,
  hasFailed,
  estimatedTimeRemaining,
  onRetry,
  onCancel,
  showDetails = true,
  showTimeEstimates = true,
  className,
  compact = false
}: MultiStageProgressProps) {
  const [expandedDetails, setExpandedDetails] = useState(!compact);

  // Announce progress changes to screen readers
  useEffect(() => {
    if (currentStageId) {
      const currentStage = stages.find(stage => stage.id === currentStageId);
      if (currentStage) {
        const announcement = `${currentStage.name}: ${currentStage.description}`;
        // Create a live region announcement
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.textContent = announcement;
        document.body.appendChild(liveRegion);
        
        setTimeout(() => {
          document.body.removeChild(liveRegion);
        }, 1000);
      }
    }
  }, [currentStageId, stages]);

  const completedStages = stages.filter(stage => stage.status === 'completed').length;
  const totalStages = stages.length;

  return (
    <div className={clsx('multi-stage-progress', className)}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className={clsx(
            'font-semibold text-gray-900',
            compact ? 'text-lg' : 'text-xl'
          )}>
            {isComplete ? 'Generation Complete!' : 
             hasFailed ? 'Generation Failed' : 
             'Generating Presentation...'}
          </h2>

          {/* Toggle Details */}
          {!compact && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setExpandedDetails(!expandedDetails)}
            >
              {expandedDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          )}
        </div>

        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Overall Progress ({completedStages}/{totalStages} stages)</span>
            <div className="flex items-center space-x-2">
              {estimatedTimeRemaining && estimatedTimeRemaining > 0 && (
                <span className="flex items-center">
                  <HiClock className="w-4 h-4 mr-1" />
                  {formatDuration(estimatedTimeRemaining)} remaining
                </span>
              )}
              <span>{Math.round(overallProgress)}%</span>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className={clsx(
                'h-3 rounded-full transition-colors duration-300',
                isComplete ? 'bg-green-500' :
                hasFailed ? 'bg-red-500' : 'bg-blue-500'
              )}
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Stages List */}
      <div className="space-y-3">
        <AnimatePresence>
          {stages.map((stage) => (
            <StageItem
              key={stage.id}
              stage={stage}
              isActive={stage.id === currentStageId}
              showDetails={expandedDetails && showDetails}
              showTimeEstimates={showTimeEstimates}
              compact={compact}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      {(hasFailed || isComplete) && (
        <div className="mt-6 flex justify-center space-x-3">
          {hasFailed && onRetry && (
            <Button
              variant="primary"
              onClick={onRetry}
              icon={<HiRefresh className="w-4 h-4" />}
            >
              Retry Generation
            </Button>
          )}
          
          {onCancel && !isComplete && (
            <Button
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
        </div>
      )}

      {/* Success Message */}
      {isComplete && (
        <motion.div
          className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <HiCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-green-900">
                Your presentation is ready!
              </h3>
              <p className="text-sm text-green-700 mt-1">
                All stages completed successfully. You can now download your PowerPoint presentation.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
