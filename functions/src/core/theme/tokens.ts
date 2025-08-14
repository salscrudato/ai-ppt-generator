/**
 * Design Tokens for Professional PowerPoint Generation
 *
 * Comprehensive design token system ensuring consistent spacing, typography,
 * colors, and visual hierarchy across all slide layouts.
 *
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

/**
 * Core design tokens interface for consistent theming
 */
export interface ThemeTokens {
  /** Color palette with semantic meanings */
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      inverse: string;
      muted: string;
    };
    semantic: {
      success: string;
      warning: string;
      error: string;
      info: string;
    };
    borders: {
      light: string;
      medium: string;
      strong: string;
    };
    chart: string[];
    status: {
      active: string;
      inactive: string;
      pending: string;
    };
  };

  /** Typography system with consistent scales */
  typography: {
    fontFamilies: {
      heading: string;
      body: string;
      mono: string;
    };
    fontWeights: {
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
      extrabold: number;
    };
    fontSizes: {
      display: number;  // 44-48pt
      h1: number;       // 32-40pt
      h2: number;       // 28-32pt
      h3: number;       // 24-28pt
      h4: number;       // 20-24pt
      body: number;     // 18-22pt
      small: number;    // 14-16pt
      tiny: number;     // 12-14pt
    };
    lineHeights: {
      tight: number;    // 1.15
      normal: number;   // 1.25
      relaxed: number;  // 1.4
    };
    letterSpacing: {
      tight: number;
      normal: number;
      wide: number;
    };
  };

  /** Spacing system based on 4px grid */
  spacing: {
    xs: number;    // 4px -> 0.056in
    sm: number;    // 8px -> 0.111in
    md: number;    // 12px -> 0.167in
    lg: number;    // 16px -> 0.222in
    xl: number;    // 24px -> 0.333in
    xxl: number;   // 32px -> 0.444in
    xxxl: number;  // 48px -> 0.667in
  };

  /** Border radius values */
  radii: {
    none: number;
    sm: number;
    md: number;
    lg: number;
    full: number;
  };

  /** Shadow definitions */
  shadows: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };

  /** Layout constraints for slide dimensions */
  layout: {
    slideWidth: number;   // 10in
    slideHeight: number;  // 5.625in (16:9)
    safeMargin: number;   // 0.5in minimum
    contentWidth: number; // 9in (slideWidth - 2 * safeMargin)
    contentHeight: number; // 4.625in
    gridColumns: number;  // 12
    gridGutter: number;   // 0.25in
  };
}

/**
 * Standard slide dimensions and constraints
 */
export const SLIDE_DIMENSIONS = {
  WIDTH: 10.0,      // inches
  HEIGHT: 5.625,    // inches (16:9 aspect ratio)
  SAFE_MARGIN: 0.5, // inches
  CONTENT_WIDTH: 9.0,
  CONTENT_HEIGHT: 4.625,
  GRID_COLUMNS: 12,
  GRID_GUTTER: 0.25
} as const;

/**
 * Typography scale following professional presentation standards
 */
export const TYPOGRAPHY_SCALE = {
  DISPLAY: 44,  // Hero titles
  H1: 36,       // Main slide titles
  H2: 28,       // Section headers
  H3: 24,       // Subsection headers
  H4: 20,       // Small headings
  BODY: 18,     // Body text
  SMALL: 14,    // Captions
  TINY: 12      // Fine print
} as const;

/**
 * Spacing scale based on 4px grid system
 * Converted to inches for PowerPoint compatibility
 */
export const SPACING_SCALE = {
  XS: 0.056,   // 4px
  SM: 0.111,   // 8px
  MD: 0.167,   // 12px
  LG: 0.222,   // 16px
  XL: 0.333,   // 24px
  XXL: 0.444,  // 32px
  XXXL: 0.667  // 48px
} as const;

/**
 * Professional font stacks optimized for PowerPoint
 */
export const FONT_STACKS = {
  HEADING: 'Calibri, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
  BODY: 'Calibri, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
  MONO: '"Consolas", "Courier New", monospace'
} as const;

/**
 * Line height values for optimal readability
 */
export const LINE_HEIGHTS = {
  TIGHT: 1.15,   // Titles and headings
  NORMAL: 1.25,  // Body text
  RELAXED: 1.4   // Long-form content
} as const;