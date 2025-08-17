/**
 * Slide Layout Constants for Live Preview
 * 
 * These constants mirror the exact values used in the backend PowerPoint generator
 * to ensure the preview matches the final exported presentation exactly.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

/**
 * PowerPoint slide dimensions (16:9 aspect ratio)
 * Values in inches as used by pptxgenjs
 */
export const SLIDE_DIMENSIONS = {
  /** Standard 16:9 slide width in inches */
  WIDTH: 10.0,
  /** Standard 16:9 slide height in inches */
  HEIGHT: 5.625,
  /** Aspect ratio for responsive scaling */
  ASPECT_RATIO: 16 / 9,
} as const;

/**
 * Enhanced layout spacing constants that mirror backend generator
 * All values in inches, optimized for modern presentations and full slide utilization
 */
export const LAYOUT_CONSTANTS = {
  /** Reduced padding for better space utilization */
  CONTENT_PADDING: 0.5,
  /** Maximized content width for 16:9 format */
  MAX_CONTENT_WIDTH: 9.0,
  /** Optimized starting Y position below title (aligned with backend) */
  CONTENT_Y: 1.6,
  /** Enhanced column width for better balance (aligned with backend) */
  COLUMN_WIDTH: 4.0,
  /** Refined gap between columns */
  COLUMN_GAP: 0.5,
  /** Enhanced spacing between elements */
  ELEMENT_SPACING: 0.25,
  /** Margin for visual breathing room */
  VISUAL_MARGIN: 0.15,
} as const;

/**
 * Convert inches to percentage for responsive preview
 * Based on slide width of 10 inches
 */
export const toPercentage = (inches: number): number => {
  return (inches / SLIDE_DIMENSIONS.WIDTH) * 100;
};

/**
 * Convert inches to percentage for height
 * Based on slide height of 5.625 inches
 */
export const toPercentageHeight = (inches: number): number => {
  return (inches / SLIDE_DIMENSIONS.HEIGHT) * 100;
};

/**
 * Enhanced responsive layout measurements for preview components
 * All values as percentages for CSS compatibility, optimized for modern presentations
 */
export const PREVIEW_LAYOUT = {
  /** Content padding as percentage of slide width */
  contentPadding: toPercentage(LAYOUT_CONSTANTS.CONTENT_PADDING),
  /** Max content width as percentage */
  maxContentWidth: toPercentage(LAYOUT_CONSTANTS.MAX_CONTENT_WIDTH),
  /** Content start Y position as percentage of slide height */
  contentY: toPercentageHeight(LAYOUT_CONSTANTS.CONTENT_Y),
  /** Column width as percentage */
  columnWidth: toPercentage(LAYOUT_CONSTANTS.COLUMN_WIDTH),
  /** Column gap as percentage */
  columnGap: toPercentage(LAYOUT_CONSTANTS.COLUMN_GAP),
  /** Right column X position */
  rightColumnX: toPercentage(LAYOUT_CONSTANTS.CONTENT_PADDING + LAYOUT_CONSTANTS.COLUMN_WIDTH + LAYOUT_CONSTANTS.COLUMN_GAP),
  /** Element spacing as percentage */
  elementSpacing: toPercentage(LAYOUT_CONSTANTS.ELEMENT_SPACING),
  /** Visual margin as percentage */
  visualMargin: toPercentage(LAYOUT_CONSTANTS.VISUAL_MARGIN),
} as const;

/**
 * Enhanced typography scaling for preview
 * Optimized for better readability and modern visual hierarchy
 */
export const PREVIEW_TYPOGRAPHY = {
  /** Enhanced title font size for better prominence */
  titleSize: '2.2rem',
  /** Improved heading font size */
  headingSize: '1.5rem',
  /** Enhanced body text size for better readability */
  bodySize: '1.1rem',
  /** Improved small text size */
  smallSize: '0.9rem',
  /** Enhanced tiny text size for better legibility */
  tinySize: '0.8rem',
} as const;

/**
 * Animation and interaction constants
 */
export const PREVIEW_ANIMATION = {
  /** Update debounce delay in milliseconds */
  UPDATE_DELAY: 200,
  /** Transition duration for theme changes */
  THEME_TRANSITION: '0.3s',
  /** Hover transition duration */
  HOVER_TRANSITION: '0.2s',
} as const;

/**
 * Layout type definitions matching backend schema
 */
export const SUPPORTED_LAYOUTS = [
  'title',
  'title-bullets',
  'title-paragraph',
  'two-column',
  'image-left',
  'image-right',
  'image-full',
  'quote',
  'chart',
  'comparison-table',
  'timeline',
  'process-flow',
  'mixed-content',
  'problem-solution',
  'before-after',
  'agenda',
] as const;

export type SupportedLayout = typeof SUPPORTED_LAYOUTS[number];

/**
 * Animation constants for slide transitions and interactions
 */
export const ANIMATION_CONSTANTS = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
    EXTRA_SLOW: 800
  },
  EASING: {
    EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
    EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
    EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  },
  SPRING: {
    STIFF: { tension: 300, friction: 30 },
    GENTLE: { tension: 120, friction: 14 },
    WOBBLY: { tension: 180, friction: 12 }
  }
} as const;
