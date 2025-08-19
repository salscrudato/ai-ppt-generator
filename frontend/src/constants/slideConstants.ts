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
 * Enhanced layout spacing constants with improved visual hierarchy
 * All values in inches, optimized for modern presentations and superior visual impact
 */
export const LAYOUT_CONSTANTS = {
  /** Content padding from slide edges (in.) */
  CONTENT_PADDING: 0.75,
  /** Max content width (in.) */
  MAX_CONTENT_WIDTH: 10.0 - (0.75 + 0.75),
  /** Vertical offset from top to content area start (titleH + gap) (in.) */
  CONTENT_Y: 1.6, // Aligns with backend LAYOUT.spacing.titleToContent
  /** Two-column width (in.) */
  COLUMN_WIDTH: 4.0,
  /** Gap between columns (in.) */
  COLUMN_GAP: 0.5,
  /** Spacing between elements (in.) */
  ELEMENT_SPACING: 0.25,
  /** Visual margin for cards (in.) */
  VISUAL_MARGIN: 0.15,
  /** Accent bar height (in.) */
  ACCENT_HEIGHT: 0.1
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
 * Enhanced typography scaling for superior preview accuracy
 * Optimized for better readability and modern visual hierarchy matching backend enhancements
 */
export const PREVIEW_TYPOGRAPHY = {
  /** Enhanced title font size for superior prominence */
  titleSize: '2.6rem', // Increased to match backend typography improvements
  /** Improved heading font size for better hierarchy */
  headingSize: '1.8rem', // Increased for better visual impact
  /** Enhanced body text size for superior readability */
  bodySize: '1.3rem', // Increased to match backend body text improvements
  /** Improved small text size for better legibility */
  smallSize: '1.0rem', // Increased for better visibility
  /** Enhanced tiny text size for superior legibility */
  tinySize: '0.9rem', // Increased for better readability
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
