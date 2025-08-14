/**
 * Theme Application Utilities
 * 
 * Provides utilities for applying theme styles to slide previews and components
 * in real-time, creating a consistent visual experience across the application.
 */

import type { ProfessionalTheme } from '../themes/professionalThemes';
import { getThemeById, getDefaultTheme } from '../themes/professionalThemes';

/**
 * CSS custom properties for theme application
 */
export interface ThemeCSS {
  '--theme-primary': string;
  '--theme-secondary': string;
  '--theme-accent': string;
  '--theme-background': string;
  '--theme-surface': string;
  '--theme-text-primary': string;
  '--theme-text-secondary': string;
  '--theme-text-muted': string;
  '--theme-text-inverse': string;
  '--theme-border-light': string;
  '--theme-border-medium': string;
  '--theme-border-strong': string;
  '--theme-success': string;
  '--theme-warning': string;
  '--theme-error': string;
  '--theme-info': string;
}

/**
 * Convert theme colors to CSS custom properties
 */
export function themeToCSS(theme: ProfessionalTheme): ThemeCSS {
  return {
    '--theme-primary': theme.colors.primary,
    '--theme-secondary': theme.colors.secondary,
    '--theme-accent': theme.colors.accent,
    '--theme-background': theme.colors.background,
    '--theme-surface': theme.colors.surface,
    '--theme-text-primary': theme.colors.text.primary,
    '--theme-text-secondary': theme.colors.text.secondary,
    '--theme-text-muted': theme.colors.text.muted,
    '--theme-text-inverse': theme.colors.text.inverse,
    '--theme-border-light': theme.colors.borders.light,
    '--theme-border-medium': theme.colors.borders.medium,
    '--theme-border-strong': theme.colors.borders.strong,
    '--theme-success': theme.colors.semantic.success,
    '--theme-warning': theme.colors.semantic.warning,
    '--theme-error': theme.colors.semantic.error,
    '--theme-info': theme.colors.semantic.info,
  };
}

/**
 * Generate Tailwind CSS classes for theme colors
 */
export function generateThemeClasses(theme: ProfessionalTheme) {
  return {
    // Background classes
    bgPrimary: `bg-[${theme.colors.primary}]`,
    bgSecondary: `bg-[${theme.colors.secondary}]`,
    bgAccent: `bg-[${theme.colors.accent}]`,
    bgSurface: `bg-[${theme.colors.surface}]`,
    bgBackground: `bg-[${theme.colors.background}]`,
    
    // Text classes
    textPrimary: `text-[${theme.colors.text.primary}]`,
    textSecondary: `text-[${theme.colors.text.secondary}]`,
    textMuted: `text-[${theme.colors.text.muted}]`,
    textInverse: `text-[${theme.colors.text.inverse}]`,
    
    // Border classes
    borderLight: `border-[${theme.colors.borders.light}]`,
    borderMedium: `border-[${theme.colors.borders.medium}]`,
    borderStrong: `border-[${theme.colors.borders.strong}]`,
    
    // Semantic classes
    textSuccess: `text-[${theme.colors.semantic.success}]`,
    textWarning: `text-[${theme.colors.semantic.warning}]`,
    textError: `text-[${theme.colors.semantic.error}]`,
    textInfo: `text-[${theme.colors.semantic.info}]`,
  };
}

/**
 * Apply theme to a DOM element
 */
export function applyThemeToElement(element: HTMLElement, theme: ProfessionalTheme) {
  const cssVars = themeToCSS(theme);
  Object.entries(cssVars).forEach(([property, value]) => {
    element.style.setProperty(property, value);
  });
}

/**
 * Create a theme-aware style object for inline styles
 */
export function createThemedStyles(theme: ProfessionalTheme) {
  return {
    primary: { color: theme.colors.primary },
    secondary: { color: theme.colors.secondary },
    accent: { color: theme.colors.accent },
    textPrimary: { color: theme.colors.text.primary },
    textSecondary: { color: theme.colors.text.secondary },
    textMuted: { color: theme.colors.text.muted },
    textInverse: { color: theme.colors.text.inverse },
    bgPrimary: { backgroundColor: theme.colors.primary },
    bgSecondary: { backgroundColor: theme.colors.secondary },
    bgAccent: { backgroundColor: theme.colors.accent },
    bgSurface: { backgroundColor: theme.colors.surface },
    bgBackground: { backgroundColor: theme.colors.background },
    borderLight: { borderColor: theme.colors.borders.light },
    borderMedium: { borderColor: theme.colors.borders.medium },
    borderStrong: { borderColor: theme.colors.borders.strong },
  };
}

/**
 * Get theme-aware gradient styles
 */
export function getThemeGradients(theme: ProfessionalTheme) {
  return {
    primaryToSecondary: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
    secondaryToAccent: `linear-gradient(135deg, ${theme.colors.secondary} 0%, ${theme.colors.accent} 100%)`,
    primaryToAccent: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`,
    surfaceToBackground: `linear-gradient(135deg, ${theme.colors.surface} 0%, ${theme.colors.background} 100%)`,
    subtle: `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.surface} 100%)`,
  };
}

/**
 * Generate theme-aware shadow styles
 */
export function getThemeShadows(theme: ProfessionalTheme) {
  const primaryRGB = hexToRgb(theme.colors.primary);
  const accentRGB = hexToRgb(theme.colors.accent);
  
  return {
    primary: `0 4px 14px 0 rgba(${primaryRGB}, 0.15)`,
    accent: `0 4px 14px 0 rgba(${accentRGB}, 0.15)`,
    soft: `0 2px 8px 0 rgba(0, 0, 0, 0.1)`,
    medium: `0 4px 16px 0 rgba(0, 0, 0, 0.12)`,
    strong: `0 8px 32px 0 rgba(0, 0, 0, 0.16)`,
  };
}

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `${r}, ${g}, ${b}`;
}

/**
 * Get contrast color (black or white) for a given background color
 */
export function getContrastColor(backgroundColor: string): string {
  const rgb = hexToRgb(backgroundColor);
  const [r, g, b] = rgb.split(', ').map(Number);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Theme-aware component props generator
 */
export function getThemedComponentProps(theme: ProfessionalTheme, variant: 'primary' | 'secondary' | 'accent' = 'primary') {
  const styles = createThemedStyles(theme);
  const gradients = getThemeGradients(theme);
  const shadows = getThemeShadows(theme);
  
  const variantMap = {
    primary: {
      backgroundColor: theme.colors.primary,
      color: getContrastColor(theme.colors.primary),
      borderColor: theme.colors.primary,
      gradient: gradients.primaryToSecondary,
      shadow: shadows.primary,
    },
    secondary: {
      backgroundColor: theme.colors.secondary,
      color: getContrastColor(theme.colors.secondary),
      borderColor: theme.colors.secondary,
      gradient: gradients.secondaryToAccent,
      shadow: shadows.accent,
    },
    accent: {
      backgroundColor: theme.colors.accent,
      color: getContrastColor(theme.colors.accent),
      borderColor: theme.colors.accent,
      gradient: gradients.primaryToAccent,
      shadow: shadows.accent,
    },
  };
  
  return {
    ...variantMap[variant],
    styles,
    gradients,
    shadows,
    theme,
  };
}

/**
 * Hook for using theme in components
 */
export function useTheme(themeId?: string): ProfessionalTheme {
  if (!themeId) return getDefaultTheme();
  return getThemeById(themeId) || getDefaultTheme();
}

/**
 * Generate CSS variables string for injection into style tags
 */
export function generateThemeCSSVariables(theme: ProfessionalTheme): string {
  const cssVars = themeToCSS(theme);
  return Object.entries(cssVars)
    .map(([property, value]) => `  ${property}: ${value};`)
    .join('\n');
}

/**
 * Create a complete CSS theme class
 */
export function createThemeClass(theme: ProfessionalTheme, className: string = 'theme'): string {
  const variables = generateThemeCSSVariables(theme);
  return `.${className} {\n${variables}\n}`;
}

/**
 * Apply theme globally to document root
 */
export function applyGlobalTheme(theme: ProfessionalTheme) {
  const root = document.documentElement;
  applyThemeToElement(root, theme);
}

/**
 * Remove theme from document root
 */
export function removeGlobalTheme() {
  const root = document.documentElement;
  const cssVars = themeToCSS(getDefaultTheme());
  Object.keys(cssVars).forEach(property => {
    root.style.removeProperty(property);
  });
}
