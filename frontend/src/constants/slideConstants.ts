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
 * Enhanced layout spacing constants with modern design principles
 * All values in inches, optimized for contemporary presentations and superior visual impact
 */
export const LAYOUT_CONSTANTS = {
  /** Content padding from slide edges (in.) - Enhanced for modern spacing */
  CONTENT_PADDING: 0.75,
  /** Max content width (in.) - Optimized for readability */
  MAX_CONTENT_WIDTH: 10.0 - (0.75 + 0.75),
  /** Vertical offset from top to content area start (titleH + gap) (in.) */
  CONTENT_Y: 2.0, // Increased to match backend LAYOUT.spacing.titleToContent (1.2) + title height
  /** Two-column width (in.) - Enhanced for better proportions */
  COLUMN_WIDTH: 4.0,
  /** Gap between columns (in.) - Improved for visual separation */
  COLUMN_GAP: 0.6, // Increased for better visual separation
  /** Spacing between elements (in.) - Enhanced for modern hierarchy */
  ELEMENT_SPACING: 0.3, // Increased for better breathing room
  /** Visual margin for cards (in.) - Enhanced for premium feel */
  VISUAL_MARGIN: 0.2, // Increased for better visual balance
  /** Accent bar height (in.) - Optimized for modern design */
  ACCENT_HEIGHT: 0.08, // Slightly reduced for more subtle appearance
  /** Card padding (in.) - Enhanced for premium spacing */
  CARD_PADDING: 0.5,
  /** Border radius (in.) - Modern rounded corners */
  BORDER_RADIUS: 0.15,
  /** Shadow offset (in.) - Enhanced depth perception */
  SHADOW_OFFSET: 0.06
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
 * Modern typography scaling for superior preview accuracy
 * Optimized for contemporary design and enhanced readability matching backend improvements
 */
export const PREVIEW_TYPOGRAPHY = {
  /** Enhanced display font size for maximum impact */
  displaySize: '3.2rem', // New display size for hero titles
  /** Enhanced title font size for superior prominence */
  titleSize: '2.8rem', // Increased for better visual hierarchy
  /** Improved heading font size for better hierarchy */
  headingSize: '2.0rem', // Enhanced for modern design
  /** Enhanced body text size for superior readability */
  bodySize: '1.4rem', // Increased for better readability
  /** Improved small text size for better legibility */
  smallSize: '1.1rem', // Enhanced for better visibility
  /** Enhanced tiny text size for superior legibility */
  tinySize: '1.0rem', // Increased for better accessibility
  /** Line height multipliers for optimal reading */
  lineHeights: {
    display: 1.1,
    title: 1.15,
    heading: 1.2,
    body: 1.6,
    small: 1.5
  }
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
/**
 * Enhanced preview constants that match backend PowerPoint generation
 * Ensures accurate preview-to-output consistency
 */
export const PREVIEW_CONSTANTS = {
  /** Slide aspect ratio (16:9) */
  aspectRatio: SLIDE_DIMENSIONS.ASPECT_RATIO,

  /** Preview sizes for different contexts */
  sizes: {
    small: { width: 240, height: 135 },
    medium: { width: 400, height: 225 },
    large: { width: 640, height: 360 },
    xlarge: { width: 800, height: 450 }
  },

  /** Typography scaling that matches backend font sizes */
  typography: {
    display: { scale: 0.08, lineHeight: 1.1 },
    title: { scale: 0.06, lineHeight: 1.15 },
    subtitle: { scale: 0.045, lineHeight: 1.4 },
    body: { scale: 0.035, lineHeight: 1.6 },
    bullet: { scale: 0.032, lineHeight: 1.5 },
    caption: { scale: 0.028, lineHeight: 1.4 }
  },

  /** Color opacity values for consistent theming */
  opacity: {
    background: 0.95,
    surface: 0.12,
    accent: 0.8,
    shadow: 0.15,
    overlay: 0.6
  }
} as const;

/**
 * Animation constants for modern slide transitions and interactions
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
