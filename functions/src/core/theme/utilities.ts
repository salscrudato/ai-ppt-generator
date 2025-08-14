/**
 * Theme Utility Functions
 *
 * Comprehensive utility functions for color manipulation, contrast validation,
 * unit conversion, and theme operations for professional PowerPoint generation.
 *
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

/**
 * Convert pixels to inches for PowerPoint compatibility
 * PowerPoint uses inches as the primary unit
 */
export function pxToIn(pixels: number): number {
  return pixels / 72; // 72 DPI standard
}

/**
 * Convert inches to pixels for calculations
 */
export function inToPx(inches: number): number {
  return inches * 72;
}

/**
 * Safe color formatting - removes # and validates hex format
 */
export function safeColorFormat(color: string): string {
  if (!color) return '000000';

  // Remove # if present
  const cleanColor = color.replace('#', '');

  // Validate hex format (6 characters)
  if (!/^[0-9A-Fa-f]{6}$/.test(cleanColor)) {
    console.warn(`Invalid color format: ${color}, using default`);
    return '000000';
  }

  return cleanColor.toUpperCase();
}

/**
 * Convert hex color to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cleanHex);

  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

/**
 * Convert RGB values to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Calculate relative luminance for contrast calculations
 * Based on WCAG 2.1 guidelines
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 * Returns ratio from 1:1 to 21:1
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Ensure minimum contrast ratio (WCAG AA = 4.5:1, AAA = 7:1)
 */
export function ensureContrast(
  foreground: string,
  background: string,
  minRatio: number = 4.5
): { color: string; ratio: number; adjusted: boolean } {
  const currentRatio = getContrastRatio(foreground, background);

  if (currentRatio >= minRatio) {
    return { color: foreground, ratio: currentRatio, adjusted: false };
  }

  // Adjust foreground color to meet contrast requirements
  const bgLum = getLuminance(background);
  const fgRgb = hexToRgb(foreground);

  // Determine if we should lighten or darken
  const shouldLighten = bgLum < 0.5;

  let adjustedColor = foreground;
  let adjustedRatio = currentRatio;

  for (let i = 0; i < 100 && adjustedRatio < minRatio; i++) {
    const factor = shouldLighten ? 1 + (i * 0.05) : 1 - (i * 0.05);
    const newR = Math.round(Math.max(0, Math.min(255, fgRgb.r * factor)));
    const newG = Math.round(Math.max(0, Math.min(255, fgRgb.g * factor)));
    const newB = Math.round(Math.max(0, Math.min(255, fgRgb.b * factor)));

    adjustedColor = rgbToHex(newR, newG, newB);
    adjustedRatio = getContrastRatio(adjustedColor, background);
  }

  return { color: adjustedColor, ratio: adjustedRatio, adjusted: true };
}

/**
 * Lighten a color by a percentage
 */
export function lighten(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  const factor = 1 + (percent / 100);

  return rgbToHex(
    Math.min(255, rgb.r * factor),
    Math.min(255, rgb.g * factor),
    Math.min(255, rgb.b * factor)
  );
}

/**
 * Darken a color by a percentage
 */
export function darken(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  const factor = 1 - (percent / 100);

  return rgbToHex(
    Math.max(0, rgb.r * factor),
    Math.max(0, rgb.g * factor),
    Math.max(0, rgb.b * factor)
  );
}

/**
 * Create a shade variation of a color
 * Positive values lighten, negative values darken
 */
export function shade(hex: string, amount: number): string {
  return amount > 0 ? lighten(hex, amount) : darken(hex, Math.abs(amount));
}

/**
 * Generate a color palette from a base color
 */
export function generatePalette(baseColor: string): {
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
} {
  return {
    50: lighten(baseColor, 40),
    100: lighten(baseColor, 30),
    200: lighten(baseColor, 20),
    300: lighten(baseColor, 10),
    400: lighten(baseColor, 5),
    500: baseColor,
    600: darken(baseColor, 10),
    700: darken(baseColor, 20),
    800: darken(baseColor, 30),
    900: darken(baseColor, 40)
  };
}

/**
 * Validate if a color meets accessibility standards
 */
export function validateAccessibility(
  foreground: string,
  background: string
): {
  wcagAA: boolean;
  wcagAAA: boolean;
  ratio: number;
  level: 'fail' | 'aa' | 'aaa';
} {
  const ratio = getContrastRatio(foreground, background);
  const wcagAA = ratio >= 4.5;
  const wcagAAA = ratio >= 7.0;

  return {
    wcagAA,
    wcagAAA,
    ratio,
    level: wcagAAA ? 'aaa' : wcagAA ? 'aa' : 'fail'
  };
}

/**
 * Round number to specified decimal places
 */
export function roundTo(num: number, decimals: number = 2): number {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Clamp a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}