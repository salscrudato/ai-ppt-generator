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
 * Layout spacing constants that mirror backend generator
 * All values in inches, converted to relative units for preview
 */
export const LAYOUT_CONSTANTS = {
  /** Enhanced padding for 16:9 format */
  CONTENT_PADDING: 0.75,
  /** Optimized content width for 16:9 */
  MAX_CONTENT_WIDTH: 8.5,
  /** Optimized starting Y position below title */
  CONTENT_Y: 1.6,
  /** Optimized column width for 16:9 */
  COLUMN_WIDTH: 4.0,
  /** Standard gap between columns */
  COLUMN_GAP: 0.5,
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
 * Responsive layout measurements for preview components
 * All values as percentages for CSS compatibility
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
} as const;

/**
 * Typography scaling for preview
 * Relative to slide dimensions for responsive scaling
 */
export const PREVIEW_TYPOGRAPHY = {
  /** Title font size relative to container */
  titleSize: '1.8rem',
  /** Heading font size */
  headingSize: '1.2rem',
  /** Body text size */
  bodySize: '0.9rem',
  /** Small text size */
  smallSize: '0.75rem',
  /** Tiny text size */
  tinySize: '0.65rem',
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
