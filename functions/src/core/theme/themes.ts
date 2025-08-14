/**
 * Professional Theme Definitions
 *
 * Comprehensive theme system with three professional themes optimized
 * for different presentation contexts and brand requirements.
 *
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import {
  ThemeTokens,
  SLIDE_DIMENSIONS,
  TYPOGRAPHY_SCALE,
  SPACING_SCALE,
  FONT_STACKS,
  LINE_HEIGHTS
} from './tokens';

/**
 * Base theme configuration shared across all themes
 */
const baseTheme: Omit<ThemeTokens, 'palette'> = {
  typography: {
    fontFamilies: {
      heading: FONT_STACKS.HEADING,
      body: FONT_STACKS.BODY,
      mono: FONT_STACKS.MONO
    },
    fontWeights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    },
    fontSizes: {
      display: TYPOGRAPHY_SCALE.DISPLAY,
      h1: TYPOGRAPHY_SCALE.H1,
      h2: TYPOGRAPHY_SCALE.H2,
      h3: TYPOGRAPHY_SCALE.H3,
      h4: TYPOGRAPHY_SCALE.H4,
      body: TYPOGRAPHY_SCALE.BODY,
      small: TYPOGRAPHY_SCALE.SMALL,
      tiny: TYPOGRAPHY_SCALE.TINY
    },
    lineHeights: {
      tight: LINE_HEIGHTS.TIGHT,
      normal: LINE_HEIGHTS.NORMAL,
      relaxed: LINE_HEIGHTS.RELAXED
    },
    letterSpacing: {
      tight: -0.5,
      normal: 0,
      wide: 0.5
    }
  },
  spacing: {
    xs: SPACING_SCALE.XS,
    sm: SPACING_SCALE.SM,
    md: SPACING_SCALE.MD,
    lg: SPACING_SCALE.LG,
    xl: SPACING_SCALE.XL,
    xxl: SPACING_SCALE.XXL,
    xxxl: SPACING_SCALE.XXXL
  },
  radii: {
    none: 0,
    sm: 0.028,  // 2px
    md: 0.056,  // 4px
    lg: 0.111,  // 8px
    full: 999
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.15)'
  },
  layout: {
    slideWidth: SLIDE_DIMENSIONS.WIDTH,
    slideHeight: SLIDE_DIMENSIONS.HEIGHT,
    safeMargin: SLIDE_DIMENSIONS.SAFE_MARGIN,
    contentWidth: SLIDE_DIMENSIONS.CONTENT_WIDTH,
    contentHeight: SLIDE_DIMENSIONS.CONTENT_HEIGHT,
    gridColumns: SLIDE_DIMENSIONS.GRID_COLUMNS,
    gridGutter: SLIDE_DIMENSIONS.GRID_GUTTER
  }
};

/**
 * Neutral Professional Theme
 * Clean, minimal design suitable for corporate presentations
 */
export const neutralTheme: ThemeTokens = {
  ...baseTheme,
  palette: {
    primary: '#2563EB',      // Professional blue
    secondary: '#64748B',    // Slate gray
    accent: '#0EA5E9',       // Sky blue
    background: '#FFFFFF',   // Pure white
    surface: '#F8FAFC',      // Light gray surface
    text: {
      primary: '#0F172A',    // Near black
      secondary: '#475569',  // Medium gray
      inverse: '#FFFFFF',    // White on dark
      muted: '#94A3B8'       // Light gray
    },
    semantic: {
      success: '#10B981',    // Emerald
      warning: '#F59E0B',    // Amber
      error: '#EF4444',      // Red
      info: '#3B82F6'        // Blue
    },
    borders: {
      light: '#E2E8F0',      // Very light gray
      medium: '#CBD5E1',     // Light gray
      strong: '#94A3B8'      // Medium gray
    },
    chart: [
      '#2563EB', '#10B981', '#F59E0B', '#EF4444',
      '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
    ],
    status: {
      active: '#10B981',
      inactive: '#94A3B8',
      pending: '#F59E0B'
    }
  }
};

/**
 * Executive Theme
 * Sophisticated dark theme for high-level presentations
 */
export const executiveTheme: ThemeTokens = {
  ...baseTheme,
  palette: {
    primary: '#F8FAFC',      // Light text on dark
    secondary: '#94A3B8',    // Medium gray
    accent: '#3B82F6',       // Professional blue accent
    background: '#0F172A',   // Dark navy
    surface: '#1E293B',      // Lighter dark surface
    text: {
      primary: '#F8FAFC',    // Light gray
      secondary: '#CBD5E1',  // Medium light gray
      inverse: '#0F172A',    // Dark on light
      muted: '#64748B'       // Muted gray
    },
    semantic: {
      success: '#22C55E',    // Bright green
      warning: '#FCD34D',    // Bright yellow
      error: '#F87171',      // Bright red
      info: '#60A5FA'        // Bright blue
    },
    borders: {
      light: '#334155',      // Dark gray
      medium: '#475569',     // Medium dark gray
      strong: '#64748B'      // Lighter gray
    },
    chart: [
      '#3B82F6', '#22C55E', '#FCD34D', '#F87171',
      '#A78BFA', '#06B6D4', '#84CC16', '#FB923C'
    ],
    status: {
      active: '#22C55E',
      inactive: '#64748B',
      pending: '#FCD34D'
    }
  }
};

/**
 * Color Pop Theme
 * Vibrant, modern theme for creative presentations
 */
export const colorPopTheme: ThemeTokens = {
  ...baseTheme,
  palette: {
    primary: '#7C3AED',      // Vibrant purple
    secondary: '#EC4899',    // Hot pink
    accent: '#06B6D4',       // Cyan
    background: '#FFFFFF',   // Pure white
    surface: '#FAFAFA',      // Off-white surface
    text: {
      primary: '#111827',    // Near black
      secondary: '#374151',  // Dark gray
      inverse: '#FFFFFF',    // White
      muted: '#9CA3AF'       // Light gray
    },
    semantic: {
      success: '#059669',    // Emerald
      warning: '#D97706',    // Orange
      error: '#DC2626',      // Red
      info: '#2563EB'        // Blue
    },
    borders: {
      light: '#F3F4F6',      // Very light gray
      medium: '#D1D5DB',     // Light gray
      strong: '#9CA3AF'      // Medium gray
    },
    chart: [
      '#7C3AED', '#EC4899', '#06B6D4', '#10B981',
      '#F59E0B', '#EF4444', '#8B5CF6', '#14B8A6'
    ],
    status: {
      active: '#10B981',
      inactive: '#9CA3AF',
      pending: '#F59E0B'
    }
  }
};

/**
 * Theme registry for easy access
 */
export const themes = {
  neutral: neutralTheme,
  executive: executiveTheme,
  colorPop: colorPopTheme
} as const;

/**
 * Theme names type for validation
 */
export type ThemeName = keyof typeof themes;

/**
 * Get theme by name with fallback to neutral
 */
export function getTheme(name: string): ThemeTokens {
  return themes[name as ThemeName] || themes.neutral;
}

/**
 * Validate theme name
 */
export function isValidThemeName(name: string): name is ThemeName {
  return name in themes;
}