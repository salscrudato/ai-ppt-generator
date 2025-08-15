/**
 * Unified Layout Constants for PowerPoint Generation
 * 
 * These constants ensure exact alignment between preview and exported PPT.
 * All measurements are in inches as used by pptxgenjs.
 * 
 * @version 2.0.0
 * @author AI PowerPoint Generator Team
 */

/**
 * PowerPoint slide dimensions (16:9 aspect ratio)
 * Standard dimensions used by pptxgenjs
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
 * Layout spacing constants for consistent positioning
 * All values in inches, matching preview calculations
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
  /** Title height allocation */
  TITLE_HEIGHT: 1.2,
  /** Standard line height for text */
  LINE_HEIGHT: 0.3,
  /** Bullet point indent */
  BULLET_INDENT: 0.25,
  /** Image default height */
  IMAGE_HEIGHT: 3.0,
  /** Chart default height */
  CHART_HEIGHT: 3.5,
  /** Table row height */
  TABLE_ROW_HEIGHT: 0.4,
} as const;

/**
 * Typography constants for consistent text sizing
 * Font sizes in points (pt) as used by pptxgenjs
 */
export const TYPOGRAPHY_CONSTANTS = {
  /** Title font size */
  TITLE_SIZE: 28,
  /** Subtitle font size */
  SUBTITLE_SIZE: 20,
  /** Heading font size */
  HEADING_SIZE: 18,
  /** Body text font size */
  BODY_SIZE: 14,
  /** Small text font size */
  SMALL_SIZE: 12,
  /** Tiny text font size */
  TINY_SIZE: 10,
  /** Caption font size */
  CAPTION_SIZE: 9,
} as const;

/**
 * Layout-specific positioning calculations
 * Pre-calculated positions for common layouts
 */
export const LAYOUT_POSITIONS = {
  /** Two-column layout positions */
  TWO_COLUMN: {
    leftX: LAYOUT_CONSTANTS.CONTENT_PADDING,
    rightX: LAYOUT_CONSTANTS.CONTENT_PADDING + LAYOUT_CONSTANTS.COLUMN_WIDTH + LAYOUT_CONSTANTS.COLUMN_GAP,
    columnWidth: LAYOUT_CONSTANTS.COLUMN_WIDTH,
    contentY: LAYOUT_CONSTANTS.CONTENT_Y,
  },
  
  /** Image-left layout positions */
  IMAGE_LEFT: {
    imageX: LAYOUT_CONSTANTS.CONTENT_PADDING,
    imageWidth: LAYOUT_CONSTANTS.COLUMN_WIDTH,
    textX: LAYOUT_CONSTANTS.CONTENT_PADDING + LAYOUT_CONSTANTS.COLUMN_WIDTH + LAYOUT_CONSTANTS.COLUMN_GAP,
    textWidth: LAYOUT_CONSTANTS.COLUMN_WIDTH,
    contentY: LAYOUT_CONSTANTS.CONTENT_Y,
  },
  
  /** Image-right layout positions */
  IMAGE_RIGHT: {
    textX: LAYOUT_CONSTANTS.CONTENT_PADDING,
    textWidth: LAYOUT_CONSTANTS.COLUMN_WIDTH,
    imageX: LAYOUT_CONSTANTS.CONTENT_PADDING + LAYOUT_CONSTANTS.COLUMN_WIDTH + LAYOUT_CONSTANTS.COLUMN_GAP,
    imageWidth: LAYOUT_CONSTANTS.COLUMN_WIDTH,
    contentY: LAYOUT_CONSTANTS.CONTENT_Y,
  },
  
  /** Full-width content positions */
  FULL_WIDTH: {
    contentX: LAYOUT_CONSTANTS.CONTENT_PADDING,
    contentWidth: LAYOUT_CONSTANTS.MAX_CONTENT_WIDTH,
    contentY: LAYOUT_CONSTANTS.CONTENT_Y,
  },
  
  /** Chart layout positions */
  CHART: {
    chartX: LAYOUT_CONSTANTS.CONTENT_PADDING,
    chartY: LAYOUT_CONSTANTS.CONTENT_Y,
    chartWidth: LAYOUT_CONSTANTS.MAX_CONTENT_WIDTH,
    chartHeight: LAYOUT_CONSTANTS.CHART_HEIGHT,
  },
} as const;

/**
 * Color and styling constants
 */
export const STYLE_CONSTANTS = {
  /** Default border width */
  BORDER_WIDTH: 1,
  /** Default border radius */
  BORDER_RADIUS: 4,
  /** Shadow opacity */
  SHADOW_OPACITY: 0.1,
  /** Accent line thickness */
  ACCENT_LINE_THICKNESS: 3,
  /** Card padding */
  CARD_PADDING: 0.2,
} as const;

/**
 * Animation and transition constants
 */
export const ANIMATION_CONSTANTS = {
  /** Slide transition duration */
  TRANSITION_DURATION: 0.5,
  /** Fade in duration */
  FADE_IN_DURATION: 0.3,
  /** Slide in duration */
  SLIDE_IN_DURATION: 0.4,
} as const;

/**
 * Validation constants for content limits
 */
export const CONTENT_LIMITS = {
  /** Maximum bullets per slide */
  MAX_BULLETS: 8,
  /** Maximum table rows */
  MAX_TABLE_ROWS: 10,
  /** Maximum table columns */
  MAX_TABLE_COLUMNS: 6,
  /** Maximum chart series */
  MAX_CHART_SERIES: 5,
  /** Maximum chart categories */
  MAX_CHART_CATEGORIES: 12,
} as const;

/**
 * Helper functions for layout calculations
 */
export const LayoutHelpers = {
  /**
   * Calculate right column X position
   */
  getRightColumnX(): number {
    return LAYOUT_CONSTANTS.CONTENT_PADDING + LAYOUT_CONSTANTS.COLUMN_WIDTH + LAYOUT_CONSTANTS.COLUMN_GAP;
  },

  /**
   * Calculate content area bounds
   */
  getContentBounds() {
    return {
      x: LAYOUT_CONSTANTS.CONTENT_PADDING,
      y: LAYOUT_CONSTANTS.CONTENT_Y,
      width: LAYOUT_CONSTANTS.MAX_CONTENT_WIDTH,
      height: SLIDE_DIMENSIONS.HEIGHT - LAYOUT_CONSTANTS.CONTENT_Y - LAYOUT_CONSTANTS.CONTENT_PADDING,
    };
  },

  /**
   * Calculate Y position for multiple content blocks
   */
  calculateContentY(blockIndex: number, blockHeight: number = 1.0): number {
    return LAYOUT_CONSTANTS.CONTENT_Y + (blockIndex * (blockHeight + 0.2));
  },

  /**
   * Validate if content fits within slide bounds
   */
  validateContentBounds(x: number, y: number, width: number, height: number): boolean {
    return (
      x >= 0 &&
      y >= 0 &&
      x + width <= SLIDE_DIMENSIONS.WIDTH &&
      y + height <= SLIDE_DIMENSIONS.HEIGHT
    );
  },

  /**
   * Get responsive font size based on content length
   */
  getResponsiveFontSize(contentLength: number, baseFontSize: number): number {
    if (contentLength > 500) return Math.max(baseFontSize - 2, TYPOGRAPHY_CONSTANTS.TINY_SIZE);
    if (contentLength > 300) return Math.max(baseFontSize - 1, TYPOGRAPHY_CONSTANTS.SMALL_SIZE);
    return baseFontSize;
  },

  /**
   * Calculate optimal image dimensions maintaining aspect ratio
   */
  calculateImageDimensions(
    containerWidth: number,
    containerHeight: number,
    imageAspectRatio: number = 16/9
  ): { width: number; height: number } {
    const containerAspectRatio = containerWidth / containerHeight;
    
    if (imageAspectRatio > containerAspectRatio) {
      // Image is wider than container
      return {
        width: containerWidth,
        height: containerWidth / imageAspectRatio,
      };
    } else {
      // Image is taller than container
      return {
        width: containerHeight * imageAspectRatio,
        height: containerHeight,
      };
    }
  },
};

/**
 * Export all constants as a single object for easy importing
 */
export const UNIFIED_LAYOUT_CONSTANTS = {
  SLIDE_DIMENSIONS,
  LAYOUT_CONSTANTS,
  TYPOGRAPHY_CONSTANTS,
  LAYOUT_POSITIONS,
  STYLE_CONSTANTS,
  ANIMATION_CONSTANTS,
  CONTENT_LIMITS,
  LayoutHelpers,
} as const;

export default UNIFIED_LAYOUT_CONSTANTS;
