/**
 * Enhanced Slide Preview Component
 * 
 * Provides real-time preview of slides with professional styling and layout
 * Features:
 * - Live preview updates with <200ms response time
 * - 16:9 aspect ratio with proper scaling
 * - Theme-aware rendering
 * - Multiple layout support
 * - Responsive design
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
const PREVIEW_CONSTANTS = {
  aspectRatio: 16 / 9,
  contentY: 1.6, // Consistent with backend LAYOUT
  columnWidth: 4.0,
  gap: 0.5,
  sizes: {
    small: { width: 240, height: 135 },
    medium: { width: 320, height: 180 },
    large: { width: 480, height: 270 }
  },
  spacing: {
    contentY: 1.6,
    columnWidth: 4.0,
    gap: 0.5
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

  // Memoized preview content for performance
  const previewContent = useMemo(() => {
    return renderSlideContent(spec, previewTheme, dimensions);
  }, [spec, previewTheme, dimensions]);

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
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${previewTheme.colors.background} 0%, ${previewTheme.colors.surface} 100%)`
        }}
      />
      
      {/* Header accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: previewTheme.colors.accent }}
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
 * Render slide content based on layout and specifications
 */
function renderSlideContent(
  spec: SlideSpec,
  theme: any,
  dimensions: { width: number; height: number }
) {
  const titleStyle = {
    color: theme.colors.primary,
    fontSize: Math.max(12, dimensions.width * 0.04),
    fontWeight: 'bold',
    lineHeight: 1.2,
    marginBottom: '8px'
  };

  const textStyle = {
    color: theme.colors.text.primary,
    fontSize: Math.max(10, dimensions.width * 0.025),
    lineHeight: 1.4
  };

  const bulletStyle = {
    ...textStyle,
    fontSize: Math.max(9, dimensions.width * 0.022)
  };

  switch (spec.layout) {
    case 'title':
      return (
        <div className="flex items-center justify-center h-full text-center">
          <div>
            <h1 style={titleStyle} className="mb-2">
              {spec.title || 'Slide Title'}
            </h1>
            {spec.subtitle && (
              <p style={textStyle} className="opacity-80">
                {spec.subtitle}
              </p>
            )}
          </div>
        </div>
      );

    case 'two-column':
      return (
        <>
          <h1 style={titleStyle} className="mb-3">
            {spec.title || 'Slide Title'}
          </h1>
          <div className="flex-1 flex gap-3">
            <div className="flex-1">
              {spec.bullets && spec.bullets.length > 0 ? (
                <ul className="space-y-1">
                  {spec.bullets.slice(0, 4).map((bullet, index) => (
                    <li key={index} style={bulletStyle} className="flex items-start">
                      <span className="mr-2 text-accent">•</span>
                      <span className="truncate">{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={textStyle} className="line-clamp-4">
                  {spec.paragraph || 'Content goes here...'}
                </p>
              )}
            </div>
            <div className="flex-1 bg-gray-100 rounded flex items-center justify-center">
              <span style={bulletStyle} className="text-gray-500">
                {spec.imagePrompt ? '🖼️ Image' : '📊 Visual'}
              </span>
            </div>
          </div>
        </>
      );

    case 'chart':
      return (
        <>
          <h1 style={titleStyle} className="mb-3">
            {spec.title || 'Chart Title'}
          </h1>
          <div className="flex-1 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div style={textStyle} className="text-gray-600 mb-2">📊</div>
              <div style={bulletStyle} className="text-gray-500">
                {spec.bullets ? `${spec.bullets.length} data points` : 'Chart data'}
              </div>
            </div>
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

    default:
      // title-bullets or title-paragraph
      return (
        <>
          <h1 style={titleStyle} className="mb-3">
            {spec.title || 'Slide Title'}
          </h1>
          <div className="flex-1">
            {spec.bullets && spec.bullets.length > 0 ? (
              <ul className="space-y-1">
                {spec.bullets.slice(0, 5).map((bullet, index) => (
                  <li key={index} style={bulletStyle} className="flex items-start">
                    <span className="mr-2" style={{ color: theme.colors.accent }}>•</span>
                    <span className="line-clamp-2">{bullet}</span>
                  </li>
                ))}
                {spec.bullets.length > 5 && (
                  <li style={bulletStyle} className="text-gray-400 italic">
                    +{spec.bullets.length - 5} more points...
                  </li>
                )}
              </ul>
            ) : spec.paragraph ? (
              <p style={textStyle} className="line-clamp-6">
                {spec.paragraph}
              </p>
            ) : (
              <p style={textStyle} className="text-gray-400 italic">
                Content will appear here...
              </p>
            )}
          </div>
        </>
      );
  }
}
