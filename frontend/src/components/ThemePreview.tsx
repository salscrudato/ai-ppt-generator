/**
 * ThemePreview Component
 * 
 * Shows how slides will look with the selected theme applied.
 * Features:
 * - Real-time theme application
 * - Multiple slide layout previews
 * - Responsive design
 * - Smooth transitions between themes
 */

import React from 'react';
import { motion } from 'framer-motion';
import { HiSparkles, HiEye } from 'react-icons/hi2';
import type { ProfessionalTheme } from '../themes/professionalThemes';
import type { SlideSpec } from '../types';
import clsx from 'clsx';

interface ThemePreviewProps {
  /** The theme to preview */
  theme: ProfessionalTheme;
  /** Sample slide content to preview */
  sampleSlide?: SlideSpec;
  /** Size of the preview */
  size?: 'small' | 'medium' | 'large';
  /** Whether to show multiple layout examples */
  showMultipleLayouts?: boolean;
  /** Custom class name */
  className?: string;
}

export default function ThemePreview({
  theme,
  sampleSlide,
  size = 'medium',
  showMultipleLayouts = false,
  className = ''
}: ThemePreviewProps) {
  // Default sample slide if none provided
  const defaultSlide: SlideSpec = {
    id: 'preview-slide',
    title: 'Sample Presentation Title',
    layout: 'title-bullets',
    bullets: [
      'First key point with important information',
      'Second bullet highlighting main benefits',
      'Third point demonstrating value proposition'
    ],
    paragraph: 'This is a sample paragraph that demonstrates how your content will look with this theme applied.',
    ...sampleSlide
  };

  const slide = sampleSlide || defaultSlide;

  // Size configurations
  const sizeConfig = {
    small: {
      container: 'h-32',
      title: 'text-sm',
      text: 'text-xs',
      bullet: 'w-1 h-1',
      padding: 'p-3'
    },
    medium: {
      container: 'h-48',
      title: 'text-lg',
      text: 'text-sm',
      bullet: 'w-1.5 h-1.5',
      padding: 'p-4'
    },
    large: {
      container: 'h-64',
      title: 'text-xl',
      text: 'text-base',
      bullet: 'w-2 h-2',
      padding: 'p-6'
    }
  };

  const config = sizeConfig[size];

  // Apply theme colors to create CSS custom properties
  const themeStyles = {
    '--theme-primary': theme.colors.primary,
    '--theme-secondary': theme.colors.secondary,
    '--theme-accent': theme.colors.accent,
    '--theme-background': theme.colors.background,
    '--theme-surface': theme.colors.surface,
    '--theme-text-primary': theme.colors.text.primary,
    '--theme-text-secondary': theme.colors.text.secondary,
    '--theme-text-muted': theme.colors.text.muted,
    '--theme-border-light': theme.colors.borders.light,
    '--theme-border-medium': theme.colors.borders.medium,
  } as React.CSSProperties;

  const renderSlideContent = () => {
    switch (slide.layout) {
      case 'title':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 
              className={clsx(config.title, 'font-bold mb-2')}
              style={{ color: theme.colors.text.primary }}
            >
              {slide.title}
            </h1>
            {slide.paragraph && (
              <p 
                className={clsx(config.text, 'opacity-80')}
                style={{ color: theme.colors.text.secondary }}
              >
                {slide.paragraph.substring(0, 60)}...
              </p>
            )}
          </div>
        );

      case 'title-bullets':
        return (
          <div className="space-y-3">
            <h1 
              className={clsx(config.title, 'font-bold')}
              style={{ color: theme.colors.text.primary }}
            >
              {slide.title}
            </h1>
            {slide.bullets && slide.bullets.length > 0 && (
              <div className="space-y-2">
                {slide.bullets.slice(0, size === 'small' ? 2 : 3).map((bullet, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div 
                      className={clsx(config.bullet, 'rounded-full mt-1.5 flex-shrink-0')}
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <span 
                      className={clsx(config.text, 'leading-relaxed')}
                      style={{ color: theme.colors.text.secondary }}
                    >
                      {size === 'small' ? bullet.substring(0, 30) + '...' : bullet}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'two-column':
        return (
          <div className="space-y-3">
            <h1 
              className={clsx(config.title, 'font-bold')}
              style={{ color: theme.colors.text.primary }}
            >
              {slide.title}
            </h1>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 
                  className={clsx(config.text, 'font-semibold')}
                  style={{ color: theme.colors.primary }}
                >
                  Left Column
                </h3>
                <div className="space-y-1">
                  {['Point one', 'Point two'].map((point, index) => (
                    <div key={index} className="flex items-start gap-1">
                      <div 
                        className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0"
                        style={{ backgroundColor: theme.colors.accent }}
                      />
                      <span 
                        className="text-xs"
                        style={{ color: theme.colors.text.secondary }}
                      >
                        {point}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <h3 
                  className={clsx(config.text, 'font-semibold')}
                  style={{ color: theme.colors.primary }}
                >
                  Right Column
                </h3>
                <div className="space-y-1">
                  {['Point three', 'Point four'].map((point, index) => (
                    <div key={index} className="flex items-start gap-1">
                      <div 
                        className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0"
                        style={{ backgroundColor: theme.colors.accent }}
                      />
                      <span 
                        className="text-xs"
                        style={{ color: theme.colors.text.secondary }}
                      >
                        {point}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col justify-center h-full">
            <h1 
              className={clsx(config.title, 'font-bold mb-2')}
              style={{ color: theme.colors.text.primary }}
            >
              {slide.title}
            </h1>
            <p 
              className={clsx(config.text)}
              style={{ color: theme.colors.text.secondary }}
            >
              {slide.paragraph || 'Sample content for this layout type'}
            </p>
          </div>
        );
    }
  };

  if (showMultipleLayouts) {
    return (
      <div className={clsx('space-y-4', className)}>
        <div className="flex items-center gap-2 mb-4">
          <HiEye className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-slate-900">
            {theme.name} Preview
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {['title', 'title-bullets', 'two-column'].map((layout) => (
            <div key={layout} className="space-y-2">
              <div className="text-sm font-medium text-slate-700 capitalize">
                {layout.replace('-', ' ')} Layout
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={clsx(
                  'relative rounded-lg border overflow-hidden',
                  config.container,
                  config.padding
                )}
                style={{
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.borders.medium,
                  ...themeStyles
                }}
              >
                <ThemePreview
                  theme={theme}
                  sampleSlide={{ ...slide, layout: layout as any }}
                  size="small"
                />
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={clsx(
        'relative rounded-lg border overflow-hidden aspect-video',
        config.container,
        config.padding,
        className
      )}
      style={{
        backgroundColor: theme.colors.background,
        borderColor: theme.colors.borders.medium,
        ...themeStyles
      }}
    >
      {/* Theme gradient overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 50%, ${theme.colors.accent} 100%)`
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 h-full">
        {renderSlideContent()}
      </div>

      {/* Theme indicator */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1">
        <div 
          className="w-2 h-2 rounded-full" 
          style={{ backgroundColor: theme.colors.primary }} 
        />
        <div 
          className="w-2 h-2 rounded-full" 
          style={{ backgroundColor: theme.colors.secondary }} 
        />
        <div 
          className="w-2 h-2 rounded-full" 
          style={{ backgroundColor: theme.colors.accent }} 
        />
      </div>
    </motion.div>
  );
}
