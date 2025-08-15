/**
 * Advanced Color Management System for Professional PowerPoint Generation
 * 
 * Provides sophisticated color application, contrast optimization, accessibility compliance,
 * and semantic color usage for professional presentations.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import type { ProfessionalTheme } from '../../professionalThemes';

/**
 * Color context for semantic usage
 */
export type ColorContext = 
  | 'primary-text' 
  | 'secondary-text' 
  | 'accent-text'
  | 'background' 
  | 'surface' 
  | 'border'
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'info'
  | 'chart-primary'
  | 'chart-secondary'
  | 'highlight'
  | 'muted';

/**
 * Color application result with accessibility information
 */
export interface ColorApplication {
  color: string;
  contrastRatio: number;
  isAccessible: boolean;
  semanticMeaning: string;
  alternatives?: string[];
}

/**
 * Advanced color palette with semantic meanings
 */
export interface EnhancedColorPalette {
  primary: {
    main: string;
    light: string;
    dark: string;
    contrast: string;
  };
  secondary: {
    main: string;
    light: string;
    dark: string;
    contrast: string;
  };
  accent: {
    main: string;
    light: string;
    dark: string;
    contrast: string;
  };
  neutral: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  semantic: {
    success: { main: string; light: string; dark: string; contrast: string; };
    warning: { main: string; light: string; dark: string; contrast: string; };
    error: { main: string; light: string; dark: string; contrast: string; };
    info: { main: string; light: string; dark: string; contrast: string; };
  };
  chart: string[];
  gradients: {
    primary: string[];
    secondary: string[];
    accent: string[];
    neutral: string[];
  };
}

/**
 * Create enhanced color palette from professional theme
 */
export function createEnhancedColorPalette(theme: ProfessionalTheme): EnhancedColorPalette {
  const primary = theme.colors.primary;
  const secondary = theme.colors.secondary;
  const accent = theme.colors.accent;

  return {
    primary: {
      main: primary,
      light: lightenColor(primary, 0.2),
      dark: darkenColor(primary, 0.2),
      contrast: getContrastColor(primary)
    },
    secondary: {
      main: secondary,
      light: lightenColor(secondary, 0.2),
      dark: darkenColor(secondary, 0.2),
      contrast: getContrastColor(secondary)
    },
    accent: {
      main: accent,
      light: lightenColor(accent, 0.2),
      dark: darkenColor(accent, 0.2),
      contrast: getContrastColor(accent)
    },
    neutral: generateNeutralScale(theme.colors.text.primary),
    semantic: {
      success: createSemanticColor(theme.colors.semantic.success),
      warning: createSemanticColor(theme.colors.semantic.warning),
      error: createSemanticColor(theme.colors.semantic.error),
      info: createSemanticColor(theme.colors.semantic.info)
    },
    chart: generateChartColors(theme),
    gradients: {
      primary: [primary, lightenColor(primary, 0.3)],
      secondary: [secondary, lightenColor(secondary, 0.3)],
      accent: [accent, lightenColor(accent, 0.3)],
      neutral: [theme.colors.surface, theme.colors.background]
    }
  };
}

/**
 * Get optimal color for specific context with accessibility compliance
 */
export function getContextualColor(
  context: ColorContext,
  palette: EnhancedColorPalette,
  backgroundColor: string = '#FFFFFF'
): ColorApplication {
  let color: string;
  let semanticMeaning: string;
  let alternatives: string[] = [];

  switch (context) {
    case 'primary-text':
      color = palette.neutral[900];
      semanticMeaning = 'Primary content text';
      alternatives = [palette.neutral[800], palette.neutral[700]];
      break;
    
    case 'secondary-text':
      color = palette.neutral[600];
      semanticMeaning = 'Secondary content text';
      alternatives = [palette.neutral[500], palette.neutral[700]];
      break;
    
    case 'accent-text':
      color = palette.primary.main;
      semanticMeaning = 'Emphasized or branded text';
      alternatives = [palette.accent.main, palette.primary.dark];
      break;
    
    case 'background':
      color = '#FFFFFF';
      semanticMeaning = 'Slide background';
      alternatives = [palette.neutral[50], '#FAFAFA'];
      break;
    
    case 'surface':
      color = palette.neutral[50];
      semanticMeaning = 'Card or container background';
      alternatives = [palette.neutral[100], '#F8F9FA'];
      break;
    
    case 'border':
      color = palette.neutral[200];
      semanticMeaning = 'Subtle borders and dividers';
      alternatives = [palette.neutral[300], palette.neutral[100]];
      break;
    
    case 'success':
      color = palette.semantic.success.main;
      semanticMeaning = 'Success states and positive indicators';
      alternatives = [palette.semantic.success.dark, palette.semantic.success.light];
      break;
    
    case 'warning':
      color = palette.semantic.warning.main;
      semanticMeaning = 'Warning states and caution indicators';
      alternatives = [palette.semantic.warning.dark, palette.semantic.warning.light];
      break;
    
    case 'error':
      color = palette.semantic.error.main;
      semanticMeaning = 'Error states and critical indicators';
      alternatives = [palette.semantic.error.dark, palette.semantic.error.light];
      break;
    
    case 'info':
      color = palette.semantic.info.main;
      semanticMeaning = 'Informational content';
      alternatives = [palette.semantic.info.dark, palette.semantic.info.light];
      break;
    
    case 'chart-primary':
      color = palette.chart[0];
      semanticMeaning = 'Primary data visualization';
      alternatives = palette.chart.slice(1, 3);
      break;
    
    case 'chart-secondary':
      color = palette.chart[1] || palette.secondary.main;
      semanticMeaning = 'Secondary data visualization';
      alternatives = palette.chart.slice(2, 4);
      break;
    
    case 'highlight':
      color = palette.accent.light;
      semanticMeaning = 'Highlighted or featured content';
      alternatives = [palette.primary.light, palette.accent.main];
      break;
    
    case 'muted':
      color = palette.neutral[400];
      semanticMeaning = 'Subdued or less important content';
      alternatives = [palette.neutral[500], palette.neutral[300]];
      break;
    
    default:
      color = palette.neutral[900];
      semanticMeaning = 'Default text color';
      alternatives = [palette.neutral[800]];
  }

  const contrastRatio = calculateContrastRatio(color, backgroundColor);
  const isAccessible = contrastRatio >= 4.5;

  // If not accessible, try alternatives
  if (!isAccessible && alternatives.length > 0) {
    for (const alt of alternatives) {
      const altContrast = calculateContrastRatio(alt, backgroundColor);
      if (altContrast >= 4.5) {
        return {
          color: alt,
          contrastRatio: altContrast,
          isAccessible: true,
          semanticMeaning,
          alternatives: alternatives.filter(a => a !== alt)
        };
      }
    }
  }

  return {
    color,
    contrastRatio,
    isAccessible,
    semanticMeaning,
    alternatives
  };
}

/**
 * Generate harmonious chart colors
 */
function generateChartColors(theme: ProfessionalTheme): string[] {
  const baseColors = [
    theme.colors.primary,
    theme.colors.secondary,
    theme.colors.accent,
    theme.colors.semantic.success,
    theme.colors.semantic.warning,
    theme.colors.semantic.error
  ];

  // Add variations for more colors
  const variations: string[] = [];
  baseColors.forEach(color => {
    variations.push(color);
    variations.push(lightenColor(color, 0.15));
    variations.push(darkenColor(color, 0.15));
  });

  return variations.slice(0, 12); // Limit to 12 colors
}

/**
 * Create semantic color variations
 */
function createSemanticColor(baseColor: string) {
  return {
    main: baseColor,
    light: lightenColor(baseColor, 0.2),
    dark: darkenColor(baseColor, 0.2),
    contrast: getContrastColor(baseColor)
  };
}

/**
 * Generate neutral color scale
 */
function generateNeutralScale(baseColor: string) {
  return {
    50: lightenColor(baseColor, 0.95),
    100: lightenColor(baseColor, 0.9),
    200: lightenColor(baseColor, 0.8),
    300: lightenColor(baseColor, 0.6),
    400: lightenColor(baseColor, 0.4),
    500: lightenColor(baseColor, 0.2),
    600: baseColor,
    700: darkenColor(baseColor, 0.1),
    800: darkenColor(baseColor, 0.2),
    900: darkenColor(baseColor, 0.3)
  };
}

/**
 * Lighten a color by a given amount
 */
function lightenColor(color: string, amount: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * amount));
  const g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * amount));
  const b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * amount));

  return rgbToHex(r, g, b);
}

/**
 * Darken a color by a given amount
 */
function darkenColor(color: string, amount: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const r = Math.max(0, Math.round(rgb.r * (1 - amount)));
  const g = Math.max(0, Math.round(rgb.g * (1 - amount)));
  const b = Math.max(0, Math.round(rgb.b * (1 - amount)));

  return rgbToHex(r, g, b);
}

/**
 * Get high contrast color (black or white)
 */
function getContrastColor(color: string): string {
  const rgb = hexToRgb(color);
  if (!rgb) return '#000000';

  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Calculate contrast ratio between two colors
 */
function calculateContrastRatio(foreground: string, background: string): number {
  const fgLum = getLuminance(foreground);
  const bgLum = getLuminance(background);
  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Get relative luminance of a color
 */
function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Convert hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
