/**
 * Live Slide Preview Component
 *
 * Provides real-time preview of slides that mirrors the final PowerPoint output.
 * Maintains 16:9 aspect ratio and uses exact spacing constants from the backend generator.
 *
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import React, { useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
// import { PreviewOptionsProvider } from '../contexts/PreviewOptionsContext';
import clsx from 'clsx';

// Types and constants
import type { SlideSpec } from '../types';
import type { ProfessionalTheme } from '../themes/professionalThemes';
import { PREVIEW_LAYOUT, PREVIEW_TYPOGRAPHY, PREVIEW_ANIMATION } from '../constants/slideConstants';

// Hooks
import { useDebouncedSlideSpec } from '../hooks/useDebounced';
// import { usePreviewOptions } from '../contexts/PreviewOptionsContext';

// Layout renderers
import TitleLayout from './layouts/TitleLayout';
import TitleBulletsLayout from './layouts/TitleBulletsLayout';
import TitleParagraphLayout from './layouts/TitleParagraphLayout';
import TwoColumnLayout from './layouts/TwoColumnLayout';
import ImageLeftLayout from './layouts/ImageLeftLayout';
import ImageRightLayout from './layouts/ImageRightLayout';
import ImageFullLayout from './layouts/ImageFullLayout';
import QuoteLayout from './layouts/QuoteLayout';
import ChartLayout from './layouts/ChartLayout';
import ComparisonTableLayout from './layouts/ComparisonTableLayout';
import TimelineLayout from './layouts/TimelineLayout';
import ProcessFlowLayout from './layouts/ProcessFlowLayout';
import MixedContentLayout from './layouts/MixedContentLayout';
import ProblemSolutionLayout from './layouts/ProblemSolutionLayout';
import BeforeAfterLayout from './layouts/BeforeAfterLayout';
import AgendaLayout from './layouts/AgendaLayout';

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
  debug = true,
  aspectRatio = 16 / 9
}: SlidePreviewProps) {
  // Debounce spec updates for smooth performance
  const debouncedSpec = useDebouncedSlideSpec(spec, PREVIEW_ANIMATION.UPDATE_DELAY);

  // Debug logging
  useEffect(() => {
    console.log('SlidePreview received spec:', spec);
    console.log('SlidePreview debounced spec:', debouncedSpec);
  }, [spec, debouncedSpec]);

  // Test data fallback for debugging
  const testSpec = React.useMemo(() => {
    if (!debouncedSpec.title || debouncedSpec.title.trim() === '') {
      return {
        ...debouncedSpec,
        title: 'Test Slide Title',
        layout: 'title-bullets' as const,
        bullets: [
          'This is a test bullet point',
          'Another test bullet to verify rendering',
          'Third bullet point for good measure'
        ]
      };
    }
    return debouncedSpec;
  }, [debouncedSpec]);

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
  // Typography scaling (frontend mirror of backend logic)
  // const { compactMode, typographyScale } = usePreviewOptions();
  const compactMode = false; // Temporary fallback
  const typographyScale = 'medium'; // Temporary fallback
  const density: 'low' | 'medium' | 'high' = useMemo(() => {
    const len = (testSpec?.paragraph?.length || 0) + (testSpec?.bullets?.join(' ')?.length || 0);
    if (len < 120) return 'low';
    if (len > 380) return 'high';
    return 'medium';
  }, [testSpec]);

  const scaleFor = (role: 'title'|'subtitle'|'body'|'bullets') => {
    let mult = 1.0;
    if (typographyScale === 'large') mult = 1.1;
    else if (typographyScale === 'compact') mult = 0.95;
    else if (typographyScale === 'auto') {
      if (density === 'low') mult = role === 'title' ? 1.12 : 1.06;
      if (density === 'high') mult = (role === 'body' || role === 'bullets') ? 0.96 : 0.98;
    }
    if (compactMode && density === 'high') mult *= (role === 'body' || role === 'bullets') ? 0.97 : 0.99;
    return mult;
  };

  const renderLayout = () => {
    const layoutProps = { spec: testSpec, theme, scaleFor };

    switch (testSpec.layout) {
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
        'slide-preview relative w-full rounded-lg shadow-sm border overflow-hidden',
        className
      )}
      style={{
        aspectRatio: `${aspectRatio}`,
        backgroundColor: theme.colors.background,
        color: theme.colors.text.primary,
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

      {/* Slide Content - Let layout components handle all rendering */}
      <div
        className="absolute inset-0"
        style={{
          padding: `${PREVIEW_LAYOUT.contentPadding}%`,
        }}
      >
        {renderLayout()}
      </div>

      {/* Debug Information */}
      {debug && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs p-2 rounded max-w-xs">
          <div>Layout: {testSpec.layout}</div>
          <div>Theme: {theme.name}</div>
          <div>Aspect: {aspectRatio.toFixed(2)}</div>
          <div>Title: {testSpec.title?.substring(0, 20)}...</div>
          <div>Bullets: {testSpec.bullets?.length || 0}</div>
          <div>Paragraph: {testSpec.paragraph?.length || 0} chars</div>
          <div>Density: {density}</div>
          <div>Scale: {typographyScale}</div>
          <div>Compact: {compactMode ? 'Yes' : 'No'}</div>
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
