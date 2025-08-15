/**
 * Style Constants and Design Tokens
 * 
 * Centralized design system constants to maintain consistency across the application.
 * This file contains all design tokens including colors, typography, spacing, shadows,
 * and component-specific styling constants.
 * 
 * Benefits:
 * - Single source of truth for design values
 * - Easy global style updates
 * - Consistent styling across components
 * - Type safety for design tokens
 * 
 * @version 1.0.0
 */

/**
 * Color palette constants
 */
export const COLORS = {
  // Primary brand colors
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b',
  },

  // Neutral colors
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },

  // Semantic colors
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },

  // Theme-specific colors
  themes: {
    corporate: {
      primary: '#1e40af',
      secondary: '#64748b',
      accent: '#0ea5e9',
      background: '#ffffff',
      surface: '#f8fafc',
    },
    creative: {
      primary: '#7c3aed',
      secondary: '#ec4899',
      accent: '#f59e0b',
      background: '#fefefe',
      surface: '#faf5ff',
    },
    academic: {
      primary: '#059669',
      secondary: '#0f766e',
      accent: '#0891b2',
      background: '#ffffff',
      surface: '#f0fdf4',
    },
    startup: {
      primary: '#dc2626',
      secondary: '#ea580c',
      accent: '#7c2d12',
      background: '#ffffff',
      surface: '#fef2f2',
    },
    technology: {
      primary: '#0f172a',
      secondary: '#334155',
      accent: '#06b6d4',
      background: '#ffffff',
      surface: '#f8fafc',
    },
  },
} as const;

/**
 * Typography constants
 */
export const TYPOGRAPHY = {
  fontFamilies: {
    sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'monospace'],
    display: ['Inter', 'system-ui', 'sans-serif'],
  },

  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
  },

  fontWeights: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  lineHeights: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

/**
 * Spacing constants
 */
export const SPACING = {
  0: '0px',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
  40: '10rem',    // 160px
  48: '12rem',    // 192px
  56: '14rem',    // 224px
  64: '16rem',    // 256px
} as const;

/**
 * Border radius constants
 */
export const BORDER_RADIUS = {
  none: '0px',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  '4xl': '2rem',    // 32px
  full: '9999px',
} as const;

/**
 * Shadow constants
 */
export const SHADOWS = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  base: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  md: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  lg: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  xl: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  '2xl': '0 50px 100px -20px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  
  // Custom shadows
  soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
  medium: '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 30px -5px rgba(0, 0, 0, 0.05)',
  large: '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 50px -10px rgba(0, 0, 0, 0.1)',
  glow: '0 0 20px rgba(79, 70, 229, 0.3)',
  glowLg: '0 0 30px rgba(79, 70, 229, 0.4)',
} as const;

/**
 * Animation constants
 */
export const ANIMATIONS = {
  durations: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  easings: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  keyframes: {
    fadeIn: 'fadeIn 0.5s ease-in-out',
    slideUp: 'slideUp 0.3s ease-out',
    slideDown: 'slideDown 0.3s ease-out',
    scaleIn: 'scaleIn 0.2s ease-out',
    bounceSubtle: 'bounceSubtle 0.6s ease-in-out',
    glowPulse: 'glowPulse 2s ease-in-out infinite alternate',
  },
} as const;

/**
 * Component-specific constants
 */
export const COMPONENTS = {
  button: {
    heights: {
      sm: '32px',
      md: '40px',
      lg: '48px',
      xl: '56px',
    },
    padding: {
      sm: '8px 12px',
      md: '12px 16px',
      lg: '16px 24px',
      xl: '20px 32px',
    },
  },

  input: {
    heights: {
      sm: '32px',
      md: '40px',
      lg: '48px',
    },
    padding: {
      sm: '8px 12px',
      md: '12px 16px',
      lg: '16px 20px',
    },
  },

  card: {
    padding: {
      sm: '16px',
      md: '24px',
      lg: '32px',
    },
    borderRadius: {
      sm: '8px',
      md: '12px',
      lg: '16px',
    },
  },

  modal: {
    maxWidths: {
      sm: '400px',
      md: '500px',
      lg: '600px',
      xl: '800px',
    },
    zIndex: {
      overlay: 50,
      content: 51,
    },
  },
} as const;

/**
 * Breakpoint constants
 */
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * Z-index constants
 */
export const Z_INDEX = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1020,
  banner: 1030,
  overlay: 1040,
  modal: 1050,
  popover: 1060,
  skipLink: 1070,
  toast: 1080,
  tooltip: 1090,
} as const;

/**
 * Utility functions for working with design tokens
 */
export const STYLE_UTILS = {
  /**
   * Get color value by path
   */
  getColor: (path: string): string => {
    const keys = path.split('.');
    let value: any = COLORS;
    
    for (const key of keys) {
      value = value?.[key];
    }
    
    return typeof value === 'string' ? value : '';
  },

  /**
   * Get spacing value
   */
  getSpacing: (key: keyof typeof SPACING): string => {
    return SPACING[key];
  },

  /**
   * Get shadow value
   */
  getShadow: (key: keyof typeof SHADOWS): string => {
    return SHADOWS[key];
  },

  /**
   * Generate responsive classes
   */
  responsive: (base: string, variants: Partial<Record<keyof typeof BREAKPOINTS, string>>): string => {
    const classes = [base];
    
    Object.entries(variants).forEach(([breakpoint, className]) => {
      if (className) {
        classes.push(`${breakpoint}:${className}`);
      }
    });
    
    return classes.join(' ');
  },

  /**
   * Combine classes with proper spacing
   */
  cn: (...classes: (string | undefined | null | false)[]): string => {
    return classes.filter(Boolean).join(' ');
  },
} as const;

export default {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  ANIMATIONS,
  COMPONENTS,
  BREAKPOINTS,
  Z_INDEX,
  STYLE_UTILS,
};
