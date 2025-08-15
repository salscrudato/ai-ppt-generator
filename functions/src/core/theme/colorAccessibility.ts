/**
 * Color Accessibility Utilities for PowerPoint Generation
 * 
 * Implements WCAG 2.1 guidelines for color contrast and accessibility
 * to ensure presentations are readable by users with visual impairments.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

/**
 * Color contrast ratios according to WCAG 2.1
 */
export const WCAG_CONTRAST_RATIOS = {
  AA_NORMAL: 4.5,      // WCAG AA for normal text
  AA_LARGE: 3.0,       // WCAG AA for large text (18pt+ or 14pt+ bold)
  AAA_NORMAL: 7.0,     // WCAG AAA for normal text
  AAA_LARGE: 4.5,      // WCAG AAA for large text
  MINIMUM: 3.0         // Absolute minimum for any text
} as const;

/**
 * Color accessibility configuration
 */
export interface ColorAccessibilityConfig {
  targetLevel: 'AA' | 'AAA';
  considerColorBlindness: boolean;
  adjustColors: boolean;
  fallbackColors: {
    text: string;
    background: string;
    accent: string;
  };
}

/**
 * RGB color representation
 */
interface RGBColor {
  r: number;
  g: number;
  b: number;
}

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): RGBColor | null {
  const cleanHex = hex.replace('#', '');
  
  if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
    return null;
  }
  
  return {
    r: parseInt(cleanHex.substr(0, 2), 16),
    g: parseInt(cleanHex.substr(2, 2), 16),
    b: parseInt(cleanHex.substr(4, 2), 16)
  };
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(rgb: RGBColor): string {
  const toHex = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase();
}

/**
 * Calculate relative luminance according to WCAG 2.1
 */
export function getRelativeLuminance(rgb: RGBColor): number {
  const sRGB = [rgb.r, rgb.g, rgb.b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 1;
  
  const lum1 = getRelativeLuminance(rgb1);
  const lum2 = getRelativeLuminance(rgb2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if color combination meets WCAG standards
 */
export function meetsWCAGStandards(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  
  if (level === 'AAA') {
    return ratio >= (isLargeText ? WCAG_CONTRAST_RATIOS.AAA_LARGE : WCAG_CONTRAST_RATIOS.AAA_NORMAL);
  }
  
  return ratio >= (isLargeText ? WCAG_CONTRAST_RATIOS.AA_LARGE : WCAG_CONTRAST_RATIOS.AA_NORMAL);
}

/**
 * Adjust color brightness to meet contrast requirements
 */
export function adjustColorForContrast(
  color: string,
  background: string,
  targetRatio: number = WCAG_CONTRAST_RATIOS.AA_NORMAL,
  direction: 'lighter' | 'darker' | 'auto' = 'auto'
): string {
  const colorRgb = hexToRgb(color);
  const backgroundRgb = hexToRgb(background);
  
  if (!colorRgb || !backgroundRgb) return color;
  
  const currentRatio = getContrastRatio(color, background);
  if (currentRatio >= targetRatio) return color;
  
  // Determine direction if auto
  let adjustDirection = direction;
  if (direction === 'auto') {
    const backgroundLum = getRelativeLuminance(backgroundRgb);
    adjustDirection = backgroundLum > 0.5 ? 'darker' : 'lighter';
  }
  
  // Binary search for optimal color
  let low = 0;
  let high = 255;
  let bestColor = color;
  let bestRatio = currentRatio;
  
  for (let i = 0; i < 20; i++) { // Limit iterations
    const mid = Math.round((low + high) / 2);
    const factor = mid / 255;
    
    let adjustedRgb: RGBColor;
    if (adjustDirection === 'lighter') {
      adjustedRgb = {
        r: Math.round(colorRgb.r + (255 - colorRgb.r) * factor),
        g: Math.round(colorRgb.g + (255 - colorRgb.g) * factor),
        b: Math.round(colorRgb.b + (255 - colorRgb.b) * factor)
      };
    } else {
      adjustedRgb = {
        r: Math.round(colorRgb.r * (1 - factor)),
        g: Math.round(colorRgb.g * (1 - factor)),
        b: Math.round(colorRgb.b * (1 - factor))
      };
    }
    
    const adjustedHex = rgbToHex(adjustedRgb);
    const ratio = getContrastRatio(adjustedHex, background);
    
    if (ratio >= targetRatio) {
      bestColor = adjustedHex;
      bestRatio = ratio;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  
  return bestColor;
}

/**
 * Generate color-blind friendly palette
 */
export function generateColorBlindFriendlyPalette(baseColors: string[]): string[] {
  // Use colors that are distinguishable for most types of color blindness
  const colorBlindSafePalette = [
    '#1f77b4', // Blue
    '#ff7f0e', // Orange
    '#2ca02c', // Green
    '#d62728', // Red
    '#9467bd', // Purple
    '#8c564b', // Brown
    '#e377c2', // Pink
    '#7f7f7f', // Gray
    '#bcbd22', // Olive
    '#17becf'  // Cyan
  ];
  
  // Map base colors to color-blind safe alternatives
  return baseColors.map((color, index) => {
    if (index < colorBlindSafePalette.length) {
      return colorBlindSafePalette[index];
    }
    return color; // Fallback to original if we run out of safe colors
  });
}

/**
 * Validate and improve color accessibility for a theme
 */
export function validateThemeAccessibility(theme: {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      inverse: string;
    };
  };
}, config: ColorAccessibilityConfig = {
  targetLevel: 'AA',
  considerColorBlindness: true,
  adjustColors: true,
  fallbackColors: {
    text: '#1F2937',
    background: '#FFFFFF',
    accent: '#3B82F6'
  }
}): {
  isAccessible: boolean;
  issues: string[];
  adjustedColors?: any;
} {
  const issues: string[] = [];
  let adjustedColors: any = null;
  
  // Check text contrast ratios
  const textBgRatio = getContrastRatio(theme.colors.text.primary, theme.colors.background);
  const textSurfaceRatio = getContrastRatio(theme.colors.text.primary, theme.colors.surface);
  const secondaryTextRatio = getContrastRatio(theme.colors.text.secondary, theme.colors.background);
  
  const targetRatio = config.targetLevel === 'AAA' ? WCAG_CONTRAST_RATIOS.AAA_NORMAL : WCAG_CONTRAST_RATIOS.AA_NORMAL;
  
  if (textBgRatio < targetRatio) {
    issues.push(`Primary text contrast ratio (${textBgRatio.toFixed(2)}) below ${config.targetLevel} standard (${targetRatio})`);
  }
  
  if (textSurfaceRatio < targetRatio) {
    issues.push(`Text on surface contrast ratio (${textSurfaceRatio.toFixed(2)}) below ${config.targetLevel} standard`);
  }
  
  if (secondaryTextRatio < WCAG_CONTRAST_RATIOS.AA_LARGE) {
    issues.push(`Secondary text contrast ratio (${secondaryTextRatio.toFixed(2)}) below minimum standard`);
  }
  
  // Adjust colors if needed and requested
  if (config.adjustColors && issues.length > 0) {
    adjustedColors = {
      ...theme.colors,
      text: {
        ...theme.colors.text,
        primary: textBgRatio < targetRatio ? 
          adjustColorForContrast(theme.colors.text.primary, theme.colors.background, targetRatio) : 
          theme.colors.text.primary,
        secondary: secondaryTextRatio < WCAG_CONTRAST_RATIOS.AA_LARGE ? 
          adjustColorForContrast(theme.colors.text.secondary, theme.colors.background, WCAG_CONTRAST_RATIOS.AA_LARGE) : 
          theme.colors.text.secondary
      }
    };
  }
  
  return {
    isAccessible: issues.length === 0,
    issues,
    adjustedColors
  };
}

/**
 * Get accessible color recommendations
 */
export function getAccessibleColorRecommendations(backgroundColor: string): {
  text: string;
  accent: string;
  secondary: string;
} {
  const bgRgb = hexToRgb(backgroundColor);
  if (!bgRgb) {
    return {
      text: '#1F2937',
      accent: '#3B82F6',
      secondary: '#6B7280'
    };
  }
  
  const bgLuminance = getRelativeLuminance(bgRgb);
  const isDark = bgLuminance < 0.5;
  
  if (isDark) {
    return {
      text: '#F9FAFB',
      accent: '#60A5FA',
      secondary: '#D1D5DB'
    };
  } else {
    return {
      text: '#1F2937',
      accent: '#1D4ED8',
      secondary: '#6B7280'
    };
  }
}
