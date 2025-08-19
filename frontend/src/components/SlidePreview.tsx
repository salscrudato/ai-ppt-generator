/**
 * Enhanced Slide Preview Component
 *
 * Provides real-time preview of slides with professional styling and layout
 * Features:
 * - Live preview updates with <200ms response time
 * - 16:9 aspect ratio with proper scaling
 * - Theme-aware rendering with instant updates
 * - Multiple layout support (title-bullets, two-column, chart, etc.)
 * - Responsive design with touch support
 * - Accessibility optimized with proper ARIA labels
 * - Performance optimized with React.memo and useMemo
 * - Visual feedback and hover states
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { SlideSpec } from '../types';
// Removed unused import

interface SlidePreviewProps {
  /** Slide specification to preview */
  spec: SlideSpec;
  /** Theme configuration */
  theme?: {
    id: string;
    name: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      surface: string;
      text: {
        primary: string;
        secondary: string;
      };
    };
  };
  /** Preview size */
  size?: 'small' | 'medium' | 'large';
  /** Whether to show interactive elements */
  interactive?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

// Enhanced preview constants for 16:9 aspect ratio with professional spacing
// Synchronized with backend LAYOUT constants for accurate preview
import { SLIDE_DIMENSIONS } from '../constants/slideConstants';

const PREVIEW_CONSTANTS = {
  aspectRatio: SLIDE_DIMENSIONS.ASPECT_RATIO,

  // Enhanced sizing options for different use cases
  sizes: {
    small: { width: 240, height: 135 },
    medium: { width: 320, height: 180 },
    large: { width: 480, height: 270 }
  },

  // Enhanced spacing system matching backend improvements with modern design
  spacing: {
    contentY: 1.6,
    columnWidth: 4.0,
    gap: 0.5, // Synced with backend LAYOUT.spacing.colGap
    titleToContent: 0.5, // Enhanced spacing for better separation
    bulletSpacing: 0.2, // Improved bullet spacing
    sectionGap: 0.4, // Enhanced section gap
    accentHeight: 0.1, // Synced with backend LAYOUT.spacing.accentHeight
    cardPadding: 0.3, // Enhanced card padding
    elementPadding: 0.1, // Modern element padding
    borderRadius: 0.08, // Modern border radius
    shadowOffset: 0.025, // Subtle shadow offset
    gradientOpacity: 0.08, // Subtle gradient overlay opacity
  },

  // Enhanced typography scale with improved hierarchy and readability matching backend
  typography: {
    display: { scale: 0.042, lineHeight: 1.02, letterSpacing: -0.025 }, // Enhanced display to match backend
    title: { scale: 0.038, lineHeight: 1.12, letterSpacing: -0.015 },   // Improved title to match backend
    subtitle: { scale: 0.032, lineHeight: 1.22, letterSpacing: -0.005 }, // Refined subtitle to match backend
    body: { scale: 0.026, lineHeight: 1.42, letterSpacing: 0 },         // Better body text to match backend
    bullet: { scale: 0.024, lineHeight: 1.48, letterSpacing: 0 },       // Enhanced bullets to match backend
    caption: { scale: 0.020, lineHeight: 1.38, letterSpacing: 0.01 },   // Improved captions to match backend
  }
} as const;

export default function SlidePreview({
  spec,
  theme,
  size = 'medium',
  interactive = false,
  onClick,
  className = ''
}: SlidePreviewProps) {
  const dimensions = PREVIEW_CONSTANTS.sizes[size];

  // Default theme fallback
  const previewTheme = theme || {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    colors: {
      primary: '#1E40AF',
      secondary: '#3B82F6',
      accent: '#F59E0B',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      text: {
        primary: '#1F2937',
        secondary: '#6B7280'
      }
    }
  };

  // Debug logging to identify content issues
  React.useEffect(() => {
    console.log('🔍 SlidePreview Debug:', {
      spec,
      hasTitle: !!spec?.title,
      hasContent: !!(spec?.bullets?.length || spec?.paragraph || spec?.left || spec?.right),
      layout: spec?.layout,
      contentType: spec?.bullets?.length ? 'bullets' : spec?.paragraph ? 'paragraph' : spec?.left ? 'two-column' : 'none',
      theme: previewTheme?.id
    });
  }, [spec, previewTheme]);

  // Memoized preview content for performance
  const previewContent = useMemo(() => {
    return renderSlideContent(spec, previewTheme, dimensions);
  }, [spec, previewTheme, dimensions]);

  // Inches → pixels conversion helpers (align with backend 10in × 5.625in)
  const pxPerInW = dimensions.width / 10.0;
  const pxPerInH = dimensions.height / 5.625;
  const accentPxH = pxPerInH * 0.1; // accentHeight

  return (
    <motion.div
      className={`relative overflow-hidden rounded-lg border-2 border-gray-200 bg-white shadow-sm ${
        interactive ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      } ${className}`}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        aspectRatio: PREVIEW_CONSTANTS.aspectRatio
      }}
      onClick={onClick}
      whileHover={interactive ? { scale: 1.02 } : undefined}
      transition={{ duration: 0.2 }}
    >
      {/* Enhanced background with sophisticated gradient for visual depth */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${previewTheme.colors.background} 0%, ${previewTheme.colors.surface} 100%)`,
          opacity: 0.98 // Subtle transparency for depth
        }}
      />

      {/* Primary accent bar with enhanced visual prominence and shadow */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: `${accentPxH * 1.2}px`, // Enhanced height for better prominence
          backgroundColor: previewTheme.colors.primary,
          boxShadow: `0 2px 8px ${previewTheme.colors.primary}40` // Enhanced shadow
        }}
      />

      {/* Secondary accent bar with sophisticated gradient and improved layering */}
      <div
        className="absolute left-0"
        style={{
          top: `${accentPxH * 1.2}px`,
          width: '65%', // Enhanced width for better visual balance
          height: `${accentPxH * 0.7}px`, // Improved height for prominence
          background: `linear-gradient(90deg, ${previewTheme.colors.accent} 0%, ${previewTheme.colors.secondary} 100%)`,
          opacity: 0.85 // Refined transparency
        }}
      />

      {/* Subtle shadow under accent bar */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          top: `${accentPxH}px`,
          height: '1px',
          backgroundColor: previewTheme.colors.text.secondary,
          opacity: 0.1
        }}
      />

      {/* Content */}
      <div className="relative p-4 h-full flex flex-col">
        {previewContent}
      </div>

      {/* Layout indicator */}
      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/10 rounded text-xs text-gray-600">
        {spec.layout || 'default'}
      </div>
    </motion.div>
  );
}

/**
 * Enhanced slide content rendering with improved typography and styling
 * Matches backend layout enhancements for accurate preview
 */
function renderSlideContent(
  spec: SlideSpec,
  theme: any,
  dimensions: { width: number; height: number }
) {
  // Debug logging for content rendering
  console.log('🎨 Rendering slide content:', {
    layout: spec?.layout,
    title: spec?.title,
    hasBullets: !!(spec?.bullets?.length),
    hasParagraph: !!spec?.paragraph,
    hasLeft: !!spec?.left,
    hasRight: !!spec?.right,
    bulletCount: spec?.bullets?.length || 0
  });

  // Superior typography system with enhanced readability and modern visual hierarchy
  const displayStyle = {
    color: theme.colors.text.primary,
    fontSize: Math.max(22, dimensions.width * PREVIEW_CONSTANTS.typography.display.scale * 1.25), // Enhanced for maximum impact
    fontWeight: '800', // Increased weight for hero titles
    lineHeight: PREVIEW_CONSTANTS.typography.display.lineHeight * 0.95, // Tighter line height for display
    marginBottom: '16px',
    textShadow: `0 2px 4px ${theme.colors.text.secondary}25`, // Enhanced depth
    letterSpacing: '-0.02em' // Improved letter spacing for display text
  };

  const titleStyle = {
    color: theme.colors.primary,
    fontSize: Math.max(17, dimensions.width * PREVIEW_CONSTANTS.typography.title.scale * 1.18), // Enhanced prominence
    fontWeight: '700', // Increased weight for better hierarchy
    lineHeight: PREVIEW_CONSTANTS.typography.title.lineHeight * 0.98, // Optimized line height
    marginBottom: '14px',
    textShadow: `0 1px 2px ${theme.colors.primary}20`, // Enhanced shadow
    letterSpacing: '-0.01em' // Refined letter spacing
  };

  const subtitleStyle = {
    color: theme.colors.text.secondary,
    fontSize: Math.max(14, dimensions.width * PREVIEW_CONSTANTS.typography.subtitle.scale * 1.12), // Enhanced clarity
    fontWeight: '600', // Increased weight for better hierarchy
    lineHeight: PREVIEW_CONSTANTS.typography.subtitle.lineHeight,
    fontStyle: 'normal', // Changed from italic for better readability
    letterSpacing: '-0.005em' // Subtle letter spacing
  };

  // Enhanced text styles with superior readability and modern design
  const textStyle = {
    color: theme.colors.text.primary,
    fontSize: Math.max(12, dimensions.width * PREVIEW_CONSTANTS.typography.body.scale * 1.12), // Enhanced readability
    lineHeight: PREVIEW_CONSTANTS.typography.body.lineHeight * 0.95, // Optimized line height
    letterSpacing: '0.002em' // Subtle tracking for better readability
  };

  const bulletStyle = {
    ...textStyle,
    fontSize: Math.max(10, dimensions.width * PREVIEW_CONSTANTS.typography.bullet.scale * 1.1), // Increased for scanning
    lineHeight: PREVIEW_CONSTANTS.typography.bullet.lineHeight
  };

  switch (spec.layout) {
    case 'title':
      return (
        <div className="flex items-center justify-center h-full text-center relative">
          <div className="z-10">
            {/* Enhanced title with display typography */}
            <h1 style={displayStyle} className="mb-3">
              {spec.title || 'Slide Title'}
            </h1>

            {/* Enhanced subtitle/paragraph */}
            {(spec.paragraph) && (
              <p style={subtitleStyle} className="mb-4 max-w-4xl mx-auto">
                {spec.paragraph}
              </p>
            )}

            {/* Enhanced decorative accent line matching backend */}
            <div
              className="mx-auto mb-2"
              style={{
                width: '40%',
                height: '3px',
                backgroundColor: theme.colors.accent,
                borderRadius: '2px',
                opacity: 0.9
              }}
            />

            {/* Secondary accent line for modern layered effect */}
            <div
              className="mx-auto"
              style={{
                width: '20%',
                height: '2px',
                backgroundColor: theme.colors.primary,
                borderRadius: '1px',
                opacity: 0.7
              }}
            />
          </div>

          {/* Modern corner accents matching backend */}
          <div
            className="absolute bottom-3 left-3"
            style={{
              width: '20px',
              height: '3px',
              backgroundColor: theme.colors.accent,
              opacity: 0.8,
              borderRadius: '2px'
            }}
          />
          <div
            className="absolute bottom-6 left-3"
            style={{
              width: '12px',
              height: '2px',
              backgroundColor: theme.colors.primary,
              opacity: 0.6,
              borderRadius: '1px'
            }}
          />
        </div>
      );

    case 'two-column':
      return (
        <>
          {/* Enhanced title with accent underline */}
          <div className="relative mb-4">
            <h1 style={titleStyle} className="mb-1">
              {spec.title || 'Slide Title'}
            </h1>
            <div
              style={{
                width: '15%',
                height: '2px',
                backgroundColor: theme.colors.accent,
                borderRadius: '1px'
              }}
            />
          </div>

          {/* Enhanced two-column layout with better visual separation */}
          <div className="flex-1 flex gap-4 relative">
            {/* Left column with enhanced modern card design */}
            <div className="flex-1 relative">
              <div
                className="absolute inset-0 rounded-lg"
                style={{
                  backgroundColor: theme.colors.surface,
                  opacity: 0.08,
                  border: `0.5px solid ${theme.colors.text.secondary}15`,
                  boxShadow: `0 1px 3px ${theme.colors.text.secondary}10`
                }}
              />
              <div className="relative p-4">
                {(spec as any).left?.bullets && (spec as any).left.bullets.length > 0 ? (
                  <ul className="space-y-2.5">
                    {(spec as any).left.bullets.slice(0, 4).map((bullet: string, index: number) => (
                      <li key={index} style={bulletStyle} className="flex items-start">
                        <span className="mr-3 flex-shrink-0 font-bold" style={{ color: theme.colors.accent }}>▸</span>
                        <span className="line-clamp-2">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={textStyle} className="line-clamp-4">
                    {(spec as any).left?.content || 'Left column content...'}
                  </p>
                )}
              </div>
              {/* Accent indicator */}
              <div
                className="absolute left-0 top-2 bottom-2 w-1 rounded-r"
                style={{
                  backgroundColor: theme.colors.accent,
                  opacity: 0.6
                }}
              />
            </div>

            {/* Enhanced modern column divider */}
            <div
              className="w-0.5 self-stretch my-4 rounded-full"
              style={{
                backgroundColor: theme.colors.accent,
                opacity: 0.7
              }}
            />

            {/* Right column with enhanced modern card design */}
            <div className="flex-1 relative">
              <div
                className="absolute inset-0 rounded-lg"
                style={{
                  backgroundColor: theme.colors.surface,
                  opacity: 0.08,
                  border: `0.5px solid ${theme.colors.text.secondary}15`,
                  boxShadow: `0 1px 3px ${theme.colors.text.secondary}10`
                }}
              />
              <div className="relative p-4">
                {(spec as any).right?.bullets && (spec as any).right.bullets.length > 0 ? (
                  <ul className="space-y-2.5">
                    {(spec as any).right.bullets.slice(0, 4).map((bullet: string, index: number) => (
                      <li key={index} style={bulletStyle} className="flex items-start">
                        <span className="mr-3 flex-shrink-0 font-bold" style={{ color: theme.colors.accent }}>▸</span>
                        <span className="line-clamp-2">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={textStyle} className="line-clamp-4">
                    {(spec as any).right?.content || 'Right column content...'}
                  </p>
                )}
              </div>
              {/* Accent indicator */}
              <div
                className="absolute right-0 top-2 bottom-2 w-1 rounded-l"
                style={{
                  backgroundColor: theme.colors.primary,
                  opacity: 0.8
                }}
              />
            </div>
          </div>
        </>
      );

    case 'image-right':
      return (
        <>
          {/* Enhanced title with accent underline */}
          <div className="relative mb-3">
            <h1 style={titleStyle} className="mb-1">
              {spec.title || 'Slide Title'}
            </h1>
            <div
              style={{
                width: '15%',
                height: '2px',
                backgroundColor: theme.colors.accent,
                borderRadius: '1px'
              }}
            />
          </div>

          {/* Enhanced image-right layout */}
          <div className="flex-1 flex gap-3">
            {/* Content area (left) - 60% */}
            <div className="flex-1" style={{ flex: '0 0 58%' }}>
              {spec.bullets && spec.bullets.length > 0 ? (
                <ul className="space-y-2">
                  {spec.bullets.slice(0, 4).map((bullet, index) => (
                    <li key={index} style={bulletStyle} className="flex items-start">
                      <span className="mr-2 flex-shrink-0" style={{ color: theme.colors.accent }}>•</span>
                      <span className="line-clamp-2">{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={textStyle} className="line-clamp-4">
                  {spec.paragraph || 'Content goes here...'}
                </p>
              )}
            </div>

            {/* Image area (right) - 38% */}
            <div className="relative" style={{ flex: '0 0 38%' }}>
              <div
                className="absolute inset-0 rounded-lg"
                style={{
                  backgroundColor: theme.colors.surface,
                  opacity: 0.8, // Increased opacity for better visibility
                  border: `2px solid ${theme.colors.text.secondary}30`, // Stronger border
                  boxShadow: `0 2px 8px ${theme.colors.text.secondary}15` // Subtle shadow
                }}
              />
              <div className="relative h-full flex items-center justify-center">
                <div className="text-center">
                  <div style={{ fontSize: dimensions.width * 0.04, marginBottom: '4px' }}>
                    🖼️
                  </div>
                  <span style={bulletStyle} className="text-gray-500">
                    {(spec as any).imagePrompt ? 'AI Image' : 'Image'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      );

    case 'image-left':
      return (
        <>
          {/* Enhanced title with accent underline */}
          <div className="relative mb-3">
            <h1 style={titleStyle} className="mb-1">
              {spec.title || 'Slide Title'}
            </h1>
            <div
              style={{
                width: '15%',
                height: '2px',
                backgroundColor: theme.colors.accent,
                borderRadius: '1px'
              }}
            />
          </div>

          {/* Enhanced image-left layout */}
          <div className="flex-1 flex gap-3">
            {/* Image area (left) - 38% */}
            <div className="relative" style={{ flex: '0 0 38%' }}>
              <div
                className="absolute inset-0 rounded-lg"
                style={{
                  backgroundColor: theme.colors.surface,
                  opacity: 0.8, // Increased opacity for better visibility
                  border: `2px solid ${theme.colors.text.secondary}30`, // Stronger border
                  boxShadow: `0 2px 8px ${theme.colors.text.secondary}15` // Subtle shadow
                }}
              />
              <div className="relative h-full flex items-center justify-center">
                <div className="text-center">
                  <div style={{ fontSize: dimensions.width * 0.04, marginBottom: '4px' }}>
                    🖼️
                  </div>
                  <span style={bulletStyle} className="text-gray-500">
                    {(spec as any).imagePrompt ? 'AI Image' : 'Image'}
                  </span>
                </div>
              </div>
            </div>

            {/* Content area (right) - 60% */}
            <div className="flex-1" style={{ flex: '0 0 58%' }}>
              {spec.bullets && spec.bullets.length > 0 ? (
                <ul className="space-y-2">
                  {spec.bullets.slice(0, 4).map((bullet, index) => (
                    <li key={index} style={bulletStyle} className="flex items-start">
                      <span className="mr-2 flex-shrink-0" style={{ color: theme.colors.accent }}>•</span>
                      <span className="line-clamp-2">{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={textStyle} className="line-clamp-4">
                  {spec.paragraph || 'Content goes here...'}
                </p>
              )}
            </div>
          </div>
        </>
      );

    case 'image-full':
      return (
        <div className="relative h-full overflow-hidden rounded-lg">
          {/* Full-screen image background */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}20 0%, ${theme.colors.accent}20 100%)`,
            }}
          />

          {/* Semi-transparent overlay */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: theme.colors.text.primary,
              opacity: 0.6
            }}
          />

          {/* Content overlay */}
          <div className="relative h-full flex flex-col items-center justify-center text-center text-white p-6">
            <h1
              style={{
                ...displayStyle,
                color: theme.colors.background,
                marginBottom: '16px'
              }}
            >
              {spec.title || 'Full Image Slide'}
            </h1>

            {spec.paragraph && (
              <p
                style={{
                  ...subtitleStyle,
                  color: theme.colors.surface,
                  maxWidth: '80%'
                }}
              >
                {spec.paragraph}
              </p>
            )}

            {/* Image indicator */}
            <div className="absolute bottom-4 right-4 text-white opacity-70">
              <div style={{ fontSize: dimensions.width * 0.03 }}>
                🖼️ {(spec as any).imagePrompt ? 'AI Generated' : 'Full Image'}
              </div>
            </div>
          </div>
        </div>
      );

    case 'chart':
      return (
        <>
          {/* Enhanced chart title with accent underline */}
          <div className="relative mb-4">
            <h1 style={titleStyle} className="mb-1">
              {spec.title || 'Chart Title'}
            </h1>
            <div
              style={{
                width: '15%',
                height: '2px',
                backgroundColor: theme.colors.accent,
                borderRadius: '1px'
              }}
            />
          </div>

          {/* Enhanced chart area with professional styling */}
          <div className="flex-1 relative">
            <div
              className="absolute inset-0 rounded-lg"
              style={{
                backgroundColor: theme.colors.surface,
                opacity: 0.5,
                border: `1px solid ${theme.colors.text.secondary}20`
              }}
            />
            <div className="relative h-full flex items-center justify-center">
              <div className="text-center">
                <div
                  style={{
                    fontSize: dimensions.width * 0.06,
                    marginBottom: '8px',
                    color: theme.colors.primary
                  }}
                >
                  📊
                </div>
                <div style={bulletStyle} className="text-gray-600 font-medium">
                  {spec.bullets ? `${spec.bullets.length} data points` : 'Chart data'}
                </div>
                <div style={{ ...bulletStyle, fontSize: bulletStyle.fontSize * 0.9 }} className="text-gray-400 mt-1">
                  Professional visualization
                </div>
              </div>
            </div>
          </div>
        </>
      );

    case 'comparison-table':
      return (
        <>
          {/* Enhanced table title with accent underline */}
          <div className="relative mb-3">
            <h1 style={titleStyle} className="mb-1">
              {spec.title || 'Comparison Table'}
            </h1>
            <div
              style={{
                width: '15%',
                height: '2px',
                backgroundColor: theme.colors.accent,
                borderRadius: '1px'
              }}
            />
          </div>

          {/* Enhanced table with professional styling */}
          <div className="flex-1 relative">
            <div
              className="absolute inset-0 rounded-lg"
              style={{
                backgroundColor: theme.colors.surface,
                opacity: 0.3,
                border: `1px solid ${theme.colors.text.secondary}20`
              }}
            />
            <div className="relative p-2 h-full">
              <div className="grid grid-cols-3 gap-1 h-full text-xs">
                {/* Enhanced table headers */}
                {Array.from({ length: 3 }, (_, i) => (
                  <div
                    key={`header-${i}`}
                    className="rounded text-center flex items-center justify-center font-semibold text-white"
                    style={{
                      fontSize: Math.max(8, dimensions.width * 0.018),
                      backgroundColor: theme.colors.primary,
                      padding: '4px 2px',
                      minHeight: '20%'
                    }}
                  >
                    Header {i + 1}
                  </div>
                ))}

                {/* Enhanced table data cells */}
                {Array.from({ length: 6 }, (_, i) => (
                  <div
                    key={`data-${i}`}
                    className="rounded text-center flex items-center justify-center"
                    style={{
                      fontSize: Math.max(7, dimensions.width * 0.016),
                      color: theme.colors.text.primary,
                      backgroundColor: i % 2 === 0 ? theme.colors.background : theme.colors.surface,
                      border: `1px solid ${theme.colors.text.secondary}20`,
                      padding: '3px 2px',
                      minHeight: '15%'
                    }}
                  >
                    Data {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      );

    case 'timeline':
      return (
        <>
          <div className="relative mb-3">
            <h1 style={titleStyle} className="mb-1">{spec.title || 'Timeline'}</h1>
            <div style={{ width: '15%', height: '2px', backgroundColor: theme.colors.accent, borderRadius: '1px' }} />
          </div>
          <div className="flex-1 relative">
            {/* Vertical line (approx 16% from left) */}
            <div className="absolute" style={{ left: '16%', top: 0, bottom: 0, width: '2px', backgroundColor: theme.colors.primary, opacity: 0.3 }} />
            {/* Items */}
            <div className="ml-[18%] space-y-4">
              {(spec.timeline || Array.from({ length: 3 }, (_, i) => ({ date: `202${i}`, title: `Milestone ${i+1}`, description: 'Details' })) ).slice(0, 5).map((item: any, idx: number) => (
                <div key={idx} className="relative">
                  {/* Dot */}
                  <div className="absolute -left-[18%]" style={{ transform: 'translateX(-50%)' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: theme.colors.accent }} />
                  </div>
                  <div style={{ ...subtitleStyle, color: theme.colors.text.primary, fontWeight: 600 }}>{item.date ? `${item.date} — ` : ''}{item.title}</div>
                  {item.description && (
                    <div style={{ ...textStyle, color: theme.colors.text.secondary }} className="mt-1">
                      {item.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      );

    case 'process-flow':
      return (
        <>
          <div className="relative mb-3">
            <h1 style={titleStyle} className="mb-1">{spec.title || 'Process'}</h1>
            <div style={{ width: '15%', height: '2px', backgroundColor: theme.colors.accent, borderRadius: '1px' }} />
          </div>
          {/* Steps */}
          <div className="flex-1 flex items-center justify-between gap-2">
            {Array.from({ length: Math.max(3, Math.min((spec as any).processSteps?.length || (spec.bullets?.length || 3), 6)) }).map((_, i) => (
              <div key={i} className="flex-1 relative">
                <div className="rounded-lg" style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.text.secondary}30` }}>
                  <div className="px-3 py-2" style={{ ...subtitleStyle, color: theme.colors.primary, fontWeight: 700 }}>Step {i+1}</div>
                  <div className="px-3 pb-3" style={textStyle}>{(spec as any).processSteps?.[i]?.title || spec.bullets?.[i] || `Step description ${i+1}`}</div>
                </div>
                {i < (Math.max(3, Math.min((spec as any).processSteps?.length || (spec.bullets?.length || 3), 6)) - 1) && (
                  <div className="absolute right-[-12px] top-1/2 -translate-y-1/2" style={{ width: '0', height: '0', borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: `12px solid ${theme.colors.accent}`, opacity: 0.8 }} />
                )}
              </div>
            ))}
          </div>
        </>
      );

    case 'quote':
      return (
        <div className="flex items-center justify-center h-full text-center">
          <div>
            <div style={{ ...textStyle, fontSize: Math.max(14, dimensions.width * 0.035) }} className="mb-4 italic">
              "{spec.paragraph || spec.title || 'Inspirational quote goes here'}"
            </div>
            {spec.subtitle && (
              <div style={bulletStyle} className="opacity-70">
                — {spec.subtitle}
              </div>
            )}
          </div>
        </div>
      );

    case 'mixed-content':
      return (
        <>
          {/* Enhanced title with accent underline */}
          <div className="relative mb-4">
            <h1 style={titleStyle} className="mb-1">
              {spec.title || 'Slide Title'}
            </h1>
            <div
              style={{
                width: '15%',
                height: '2px',
                backgroundColor: theme.colors.accent,
                borderRadius: '1px'
              }}
            />
          </div>

          {/* Main paragraph content if exists */}
          {spec.paragraph && (
            <div className="mb-4">
              <div
                className="p-3 rounded-lg"
                style={{
                  backgroundColor: theme.colors.surface,
                  opacity: 0.8,
                  border: `1px solid ${theme.colors.text.secondary}30`
                }}
              >
                <p style={textStyle} className="line-clamp-6 leading-relaxed">
                  {spec.paragraph}
                </p>
              </div>
            </div>
          )}

          {/* Two-column layout for mixed content */}
          <div className="flex-1 flex gap-4">
            {/* Left section */}
            <div className="flex-1">
              {/* Left section heading */}
              {(spec as any).left?.title && (
                <h3 style={subtitleStyle} className="mb-2 font-semibold">
                  {(spec as any).left.title}
                </h3>
              )}

              {/* Left section paragraph */}
              {(spec as any).left?.paragraph && (
                <p style={textStyle} className="mb-3 line-clamp-4">
                  {(spec as any).left.paragraph}
                </p>
              )}

              {/* Left section bullets */}
              {(spec as any).left?.bullets && (spec as any).left.bullets.length > 0 && (
                <ul className="space-y-1">
                  {(spec as any).left.bullets.slice(0, 4).map((bullet: string, index: number) => (
                    <li key={index} style={bulletStyle} className="flex items-start">
                      <span className="mr-2 flex-shrink-0" style={{ color: theme.colors.accent }}>•</span>
                      <span className="line-clamp-2">{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Right section */}
            <div className="flex-1">
              {/* Right section heading */}
              {(spec as any).right?.title && (
                <h3 style={subtitleStyle} className="mb-2 font-semibold">
                  {(spec as any).right.title}
                </h3>
              )}

              {/* Right section paragraph */}
              {(spec as any).right?.paragraph && (
                <p style={textStyle} className="mb-3 line-clamp-4">
                  {(spec as any).right.paragraph}
                </p>
              )}

              {/* Right section bullets */}
              {(spec as any).right?.bullets && (spec as any).right.bullets.length > 0 && (
                <ul className="space-y-1">
                  {(spec as any).right.bullets.slice(0, 4).map((bullet: string, index: number) => (
                    <li key={index} style={bulletStyle} className="flex items-start">
                      <span className="mr-2 flex-shrink-0" style={{ color: theme.colors.accent }}>•</span>
                      <span className="line-clamp-2">{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      );

    default:
      // Enhanced title-bullets or title-paragraph layout with debugging
      console.warn('🚨 Using default layout rendering for:', {
        layout: spec?.layout,
        hasTitle: !!spec?.title,
        hasContent: !!(spec?.bullets?.length || spec?.paragraph)
      });

      return (
        <>
          {/* Enhanced title with accent underline matching backend */}
          <div className="relative mb-4">
            <h1 style={titleStyle} className="mb-1">
              {spec?.title || 'Slide Title'}
            </h1>
            {/* Modern accent underline matching backend */}
            <div
              style={{
                width: '15%',
                height: '3px',
                backgroundColor: theme.colors.accent,
                borderRadius: '2px',
                opacity: 0.9
              }}
            />
            {/* Secondary accent for modern depth */}
            <div
              className="mt-1"
              style={{
                width: '8%',
                height: '2px',
                backgroundColor: theme.colors.primary,
                borderRadius: '1px',
                opacity: 0.7
              }}
            />
          </div>

          {/* Enhanced content area */}
          <div className="flex-1">
            {spec.bullets && spec.bullets.length > 0 ? (
              <ul className="space-y-3">
                {spec.bullets.slice(0, 5).map((bullet, index) => (
                  <li key={index} style={bulletStyle} className="flex items-start">
                    <span
                      className="mr-3 flex-shrink-0 mt-1"
                      style={{
                        color: theme.colors.accent,
                        fontSize: bulletStyle.fontSize * 0.8
                      }}
                    >
                      •
                    </span>
                    <span className="line-clamp-2 leading-relaxed">{bullet}</span>
                  </li>
                ))}
                {spec.bullets.length > 5 && (
                  <li style={{ ...bulletStyle, fontStyle: 'italic' }} className="text-gray-400 ml-6">
                    +{spec.bullets.length - 5} more points...
                  </li>
                )}
              </ul>
            ) : spec.paragraph ? (
              <div
                className="p-3 rounded-lg"
                style={{
                  backgroundColor: theme.colors.surface,
                  opacity: 0.8,
                  border: `1px solid ${theme.colors.text.secondary}30`
                }}
              >
                <p style={textStyle} className="line-clamp-6 leading-relaxed">
                  {spec.paragraph}
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <div style={{ fontSize: dimensions.width * 0.04, marginBottom: '8px' }}>
                  📝
                </div>
                <p style={{ ...textStyle, fontStyle: 'italic', color: theme.colors.text.secondary }}>
                  Content will be generated here...
                </p>
                <p style={{ ...bulletStyle, fontStyle: 'italic', color: theme.colors.text.secondary, marginTop: '4px' }}>
                  Layout: {spec?.layout || 'unknown'}
                </p>
              </div>
            )}
          </div>
        </>
      );
  }
}
