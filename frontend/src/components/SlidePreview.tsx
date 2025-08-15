/**
 * Live Slide Preview Component
 * 
 * Provides real-time preview of slides that mirrors the final PowerPoint output.
 * Maintains 16:9 aspect ratio and uses exact spacing constants from the backend generator.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

// Types and constants
import type { SlideSpec } from '../types';
import type { ProfessionalTheme } from '../themes/professionalThemes';
import { PREVIEW_LAYOUT, PREVIEW_TYPOGRAPHY, PREVIEW_ANIMATION } from '../constants/slideConstants';

// Hooks
import { useDebouncedSlideSpec } from '../hooks/useDebounced';

// Layout renderers
import { TitleLayout } from './preview/TitleLayout';
import { TitleBulletsLayout } from './preview/TitleBulletsLayout';
import { TitleParagraphLayout } from './preview/TitleParagraphLayout';
import { TwoColumnLayout } from './preview/TwoColumnLayout';
import { ImageLeftLayout } from './preview/ImageLeftLayout';
import { ImageRightLayout } from './preview/ImageRightLayout';
import { ImageFullLayout } from './preview/ImageFullLayout';
import { QuoteLayout } from './preview/QuoteLayout';
import { ChartLayout } from './preview/ChartLayout';
import { ComparisonTableLayout } from './preview/ComparisonTableLayout';
import { TimelineLayout } from './preview/TimelineLayout';
import { ProcessFlowLayout } from './preview/ProcessFlowLayout';
import { MixedContentLayout } from './preview/MixedContentLayout';
import { ProblemSolutionLayout } from './preview/ProblemSolutionLayout';
import { BeforeAfterLayout } from './preview/BeforeAfterLayout';
import { AgendaLayout } from './preview/AgendaLayout';

/**
 * Props for SlidePreview component
 */
export interface SlidePreviewProps {
  /** Slide specification to preview */
  spec: SlideSpec;
  /** Theme for styling */
  theme: ProfessionalTheme;
  /** Optional CSS class name */
  className?: string;
  /** Whether to show debug information */
  debug?: boolean;
  /** Custom aspect ratio override */
  aspectRatio?: number;
}

/**
 * Main SlidePreview component
 * 
 * Renders a live preview of a slide that matches the final PowerPoint output.
 * Updates in real-time as the user edits content and switches themes.
 */
export function SlidePreview({
  spec,
  theme,
  className,
  debug = false,
  aspectRatio = 16 / 9
}: SlidePreviewProps) {
  // Debounce spec updates for smooth performance
  const debouncedSpec = useDebouncedSlideSpec(spec, PREVIEW_ANIMATION.UPDATE_DELAY);

  // Generate theme-aware CSS variables
  const themeStyles = useMemo(() => ({
    '--theme-primary': theme.colors.primary,
    '--theme-secondary': theme.colors.secondary,
    '--theme-accent': theme.colors.accent,
    '--theme-background': theme.colors.background,
    '--theme-surface': theme.colors.surface,
    '--theme-text-primary': theme.colors.text.primary,
    '--theme-text-secondary': theme.colors.text.secondary,
    '--theme-text-muted': theme.colors.text.muted,
    '--theme-text-inverse': theme.colors.text.inverse,
    '--theme-border-light': theme.colors.borders.light,
    '--theme-border-medium': theme.colors.borders.medium,
    '--theme-border-strong': theme.colors.borders.strong,
    '--theme-success': theme.colors.semantic.success,
    '--theme-warning': theme.colors.semantic.warning,
    '--theme-error': theme.colors.semantic.error,
    '--theme-info': theme.colors.semantic.info,
    '--theme-heading-font': theme.typography.headings.fontFamily,
    '--theme-body-font': theme.typography.body.fontFamily,
  } as React.CSSProperties), [theme]);

  // Render the appropriate layout component
  const renderLayout = () => {
    const layoutProps = { spec: debouncedSpec, theme };

    switch (debouncedSpec.layout) {
      case 'title':
        return <TitleLayout {...layoutProps} />;
      case 'title-bullets':
        return <TitleBulletsLayout {...layoutProps} />;
      case 'title-paragraph':
        return <TitleParagraphLayout {...layoutProps} />;
      case 'two-column':
        return <TwoColumnLayout {...layoutProps} />;
      case 'image-left':
        return <ImageLeftLayout {...layoutProps} />;
      case 'image-right':
        return <ImageRightLayout {...layoutProps} />;
      case 'image-full':
        return <ImageFullLayout {...layoutProps} />;
      case 'quote':
        return <QuoteLayout {...layoutProps} />;
      case 'chart':
        return <ChartLayout {...layoutProps} />;
      case 'comparison-table':
        return <ComparisonTableLayout {...layoutProps} />;
      case 'timeline':
        return <TimelineLayout {...layoutProps} />;
      case 'process-flow':
        return <ProcessFlowLayout {...layoutProps} />;
      case 'mixed-content':
        return <MixedContentLayout {...layoutProps} />;
      case 'problem-solution':
        return <ProblemSolutionLayout {...layoutProps} />;
      case 'before-after':
        return <BeforeAfterLayout {...layoutProps} />;
      case 'agenda':
        return <AgendaLayout {...layoutProps} />;
      default:
        // Fallback for unknown layouts
        return <TitleParagraphLayout {...layoutProps} />;
    }
  };

  return (
    <motion.div
      className={clsx(
        'slide-preview relative w-full bg-white rounded-lg shadow-sm border overflow-hidden',
        className
      )}
      style={{
        aspectRatio: `${aspectRatio}`,
        ...themeStyles,
        transition: `all ${PREVIEW_ANIMATION.THEME_TRANSITION} ease-in-out`,
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Slide Background */}
      <div 
        className="absolute inset-0"
        style={{ backgroundColor: 'var(--theme-background)' }}
      />

      {/* Slide Title */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-start"
        style={{
          height: `${PREVIEW_LAYOUT.contentY}%`,
          paddingLeft: `${PREVIEW_LAYOUT.contentPadding}%`,
          paddingRight: `${PREVIEW_LAYOUT.contentPadding}%`,
          paddingTop: '4%',
        }}
      >
        <h1
          className="font-bold leading-tight w-full"
          style={{
            fontSize: PREVIEW_TYPOGRAPHY.titleSize,
            fontFamily: 'var(--theme-heading-font)',
            color: 'var(--theme-text-primary)',
            lineHeight: '1.2',
          }}
        >
          {debouncedSpec.title || 'Slide Title'}
        </h1>
      </div>

      {/* Slide Content */}
      <div
        className="absolute"
        style={{
          top: `${PREVIEW_LAYOUT.contentY}%`,
          left: `${PREVIEW_LAYOUT.contentPadding}%`,
          right: `${PREVIEW_LAYOUT.contentPadding}%`,
          bottom: '3%',
          height: `${100 - PREVIEW_LAYOUT.contentY - 3}%`,
        }}
      >
        {renderLayout()}
      </div>

      {/* Debug Information */}
      {debug && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
          <div>Layout: {debouncedSpec.layout}</div>
          <div>Theme: {theme.name}</div>
          <div>Aspect: {aspectRatio.toFixed(2)}</div>
        </div>
      )}
    </motion.div>
  );
}

/**
 * Multi-slide preview component for presentation overview
 */
export interface SlidePreviewGridProps {
  /** Array of slide specifications */
  specs: SlideSpec[];
  /** Theme for styling */
  theme: ProfessionalTheme;
  /** Selected slide index */
  selectedIndex?: number;
  /** Callback when slide is selected */
  onSlideSelect?: (index: number) => void;
  /** Grid columns */
  columns?: number;
  /** Optional CSS class name */
  className?: string;
}

export function SlidePreviewGrid({
  specs,
  theme,
  selectedIndex,
  onSlideSelect,
  columns = 3,
  className
}: SlidePreviewGridProps) {
  return (
    <div
      className={clsx(
        'grid gap-4',
        className
      )}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
      }}
    >
      {specs.map((spec, index) => (
        <motion.div
          key={spec.id || index}
          className={clsx(
            'cursor-pointer transition-all duration-200',
            selectedIndex === index
              ? 'ring-2 ring-blue-500 ring-offset-2'
              : 'hover:shadow-lg'
          )}
          onClick={() => onSlideSelect?.(index)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <SlidePreview
            spec={spec}
            theme={theme}
            className="h-24 sm:h-32"
          />
          <div className="mt-2 text-center text-xs text-gray-600">
            Slide {index + 1}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
