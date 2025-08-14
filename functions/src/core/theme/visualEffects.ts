/**
 * Visual Effects System for Modern PowerPoint Generation
 *
 * Advanced visual design elements including gradients, shadows, borders,
 * and modern styling effects for professional presentations.
 *
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import { ThemeTokens } from './tokens';

/**
 * Safe color formatting utility to prevent PowerPoint corruption
 */
function safeColorFormat(color: string): string {
  if (!color) return '000000';

  // Remove # if present and ensure 6 characters
  const cleanColor = color.replace('#', '').toUpperCase();

  // Validate hex format
  if (!/^[0-9A-F]{6}$/.test(cleanColor)) {
    console.warn(`Invalid color format: ${color}, using default black`);
    return '000000';
  }

  return cleanColor;
}

/**
 * Gradient configuration for modern backgrounds and elements
 */
export interface GradientConfig {
  type: 'linear' | 'radial' | 'conic';
  colors: readonly string[] | string[];
  direction?: number; // degrees for linear gradients
  stops?: readonly number[] | number[]; // color stop positions (0-100)
  centerX?: number; // center point for radial gradients (0-100)
  centerY?: number; // center point for radial gradients (0-100)
}

/**
 * Shadow configuration for depth and elevation
 */
export interface ShadowConfig {
  offsetX: number; // horizontal offset in inches
  offsetY: number; // vertical offset in inches
  blur: number; // blur radius in inches
  spread?: number; // spread radius in inches
  color: string; // shadow color
  opacity?: number; // shadow opacity (0-1)
}

/**
 * Border configuration with modern styling options
 */
export interface BorderConfig {
  width: number; // border width in points
  color: string; // border color
  style: 'solid' | 'dashed' | 'dotted' | 'double';
  radius?: number; // border radius in inches
}

/**
 * Modern visual effect presets
 */
export interface VisualEffectPreset {
  name: string;
  description: string;
  gradient?: GradientConfig;
  shadow?: ShadowConfig;
  border?: BorderConfig;
  opacity?: number;
}

/**
 * Predefined gradient collections for modern aesthetics
 */
export const MODERN_GRADIENTS = {
  // Subtle professional gradients
  CORPORATE_BLUE: {
    type: 'linear' as const,
    colors: ['#1E40AF', '#3B82F6'],
    direction: 135,
    stops: [0, 100]
  },
  
  EXECUTIVE_DARK: {
    type: 'linear' as const,
    colors: ['#0F172A', '#1E293B'],
    direction: 180,
    stops: [0, 100]
  },
  
  CREATIVE_PURPLE: {
    type: 'linear' as const,
    colors: ['#7C3AED', '#A855F7', '#EC4899'],
    direction: 45,
    stops: [0, 50, 100]
  },
  
  // Modern tech gradients
  TECH_GRADIENT: {
    type: 'linear' as const,
    colors: ['#06B6D4', '#3B82F6', '#8B5CF6'],
    direction: 135,
    stops: [0, 50, 100]
  },
  
  INNOVATION_FLOW: {
    type: 'radial' as const,
    colors: ['#F59E0B', '#EF4444', '#DC2626'],
    centerX: 30,
    centerY: 70,
    stops: [0, 70, 100]
  },
  
  // Soft modern gradients
  SOFT_MINT: {
    type: 'linear' as const,
    colors: ['#ECFDF5', '#D1FAE5', '#A7F3D0'],
    direction: 120,
    stops: [0, 50, 100]
  },
  
  WARM_SUNSET: {
    type: 'linear' as const,
    colors: ['#FEF3C7', '#FDE68A', '#F59E0B'],
    direction: 45,
    stops: [0, 60, 100]
  },
  
  COOL_BREEZE: {
    type: 'linear' as const,
    colors: ['#F0F9FF', '#E0F2FE', '#BAE6FD'],
    direction: 180,
    stops: [0, 50, 100]
  }
} as const;

/**
 * Professional shadow presets for depth and elevation
 */
export const SHADOW_PRESETS = {
  // Subtle shadows for cards and elements
  CARD_SUBTLE: {
    offsetX: 0,
    offsetY: 0.02,
    blur: 0.04,
    spread: 0,
    color: '#000000',
    opacity: 0.1
  },
  
  CARD_MEDIUM: {
    offsetX: 0,
    offsetY: 0.04,
    blur: 0.08,
    spread: 0,
    color: '#000000',
    opacity: 0.15
  },
  
  CARD_STRONG: {
    offsetX: 0,
    offsetY: 0.06,
    blur: 0.12,
    spread: 0,
    color: '#000000',
    opacity: 0.2
  },
  
  // Floating element shadows
  FLOATING_LIGHT: {
    offsetX: 0,
    offsetY: 0.08,
    blur: 0.16,
    spread: 0,
    color: '#000000',
    opacity: 0.12
  },
  
  FLOATING_MEDIUM: {
    offsetX: 0,
    offsetY: 0.12,
    blur: 0.24,
    spread: 0,
    color: '#000000',
    opacity: 0.15
  },
  
  // Inset shadows for depth
  INSET_SUBTLE: {
    offsetX: 0,
    offsetY: 0.02,
    blur: 0.04,
    spread: -0.01,
    color: '#000000',
    opacity: 0.08
  }
} as const;

/**
 * Modern border radius presets
 */
export const BORDER_RADIUS = {
  NONE: 0,
  SMALL: 0.04, // ~3px
  MEDIUM: 0.08, // ~6px
  LARGE: 0.12, // ~9px
  EXTRA_LARGE: 0.16, // ~12px
  ROUNDED: 0.5, // Fully rounded for small elements
  PILL: 999 // Pill shape
} as const;

/**
 * Generate gradient CSS for PowerPoint elements
 */
export function createGradientFill(gradient: GradientConfig): any {
  const colors = gradient.colors.map(safeColorFormat);
  
  if (gradient.type === 'linear') {
    return {
      type: 'gradient',
      colors: colors,
      angle: gradient.direction || 0,
      stops: gradient.stops || colors.map((_, i) => (i / (colors.length - 1)) * 100)
    };
  }
  
  if (gradient.type === 'radial') {
    return {
      type: 'radialGradient',
      colors: colors,
      centerX: gradient.centerX || 50,
      centerY: gradient.centerY || 50,
      stops: gradient.stops || colors.map((_, i) => (i / (colors.length - 1)) * 100)
    };
  }
  
  // Fallback to solid color
  return { color: colors[0] };
}

/**
 * Create shadow configuration for PowerPoint elements
 */
export function createShadowEffect(shadow: ShadowConfig): any {
  return {
    type: 'outer',
    blur: Math.max(shadow.blur * 72, 1), // Convert to points
    offsetX: shadow.offsetX * 72, // Convert to points
    offsetY: shadow.offsetY * 72, // Convert to points
    color: safeColorFormat(shadow.color),
    transparency: Math.round((1 - (shadow.opacity || 1)) * 100)
  };
}

/**
 * Modern visual effect presets combining gradients, shadows, and borders
 */
export const VISUAL_EFFECT_PRESETS: Record<string, VisualEffectPreset> = {
  // Card styles
  MODERN_CARD: {
    name: 'Modern Card',
    description: 'Clean card with subtle shadow and rounded corners',
    shadow: SHADOW_PRESETS.CARD_MEDIUM,
    border: {
      width: 0,
      color: 'transparent',
      style: 'solid',
      radius: BORDER_RADIUS.MEDIUM
    }
  },
  
  ELEVATED_CARD: {
    name: 'Elevated Card',
    description: 'Floating card with strong shadow',
    shadow: SHADOW_PRESETS.FLOATING_MEDIUM,
    border: {
      width: 0,
      color: 'transparent',
      style: 'solid',
      radius: BORDER_RADIUS.LARGE
    }
  },
  
  // Gradient backgrounds
  HERO_GRADIENT: {
    name: 'Hero Gradient',
    description: 'Bold gradient for hero sections',
    gradient: MODERN_GRADIENTS.TECH_GRADIENT,
    shadow: SHADOW_PRESETS.CARD_SUBTLE
  },
  
  SUBTLE_BACKGROUND: {
    name: 'Subtle Background',
    description: 'Soft gradient background',
    gradient: MODERN_GRADIENTS.COOL_BREEZE,
    opacity: 0.3
  },
  
  // Accent elements
  ACCENT_PILL: {
    name: 'Accent Pill',
    description: 'Rounded pill-shaped accent',
    gradient: MODERN_GRADIENTS.CREATIVE_PURPLE,
    border: {
      width: 0,
      color: 'transparent',
      style: 'solid',
      radius: BORDER_RADIUS.PILL
    },
    shadow: SHADOW_PRESETS.CARD_SUBTLE
  }
};

/**
 * Apply visual effects to PowerPoint shape options
 */
export function applyVisualEffects(
  baseOptions: any,
  effects: VisualEffectPreset,
  theme: ThemeTokens
): any {
  const options = { ...baseOptions };
  
  // Apply gradient fill
  if (effects.gradient) {
    options.fill = createGradientFill(effects.gradient);
  }
  
  // Apply shadow
  if (effects.shadow) {
    options.shadow = createShadowEffect(effects.shadow);
  }
  
  // Apply border and radius
  if (effects.border) {
    if (effects.border.width > 0) {
      options.line = {
        color: safeColorFormat(effects.border.color),
        width: effects.border.width,
        dashType: effects.border.style === 'dashed' ? 'dash' : 
                  effects.border.style === 'dotted' ? 'dot' : 'solid'
      };
    }
    
    if (effects.border.radius) {
      options.rectRadius = effects.border.radius;
    }
  }
  
  // Apply opacity
  if (effects.opacity !== undefined) {
    options.transparency = Math.round((1 - effects.opacity) * 100);
  }
  
  return options;
}

/**
 * Create theme-aware gradient based on theme colors
 */
export function createThemeGradient(
  theme: ThemeTokens,
  style: 'primary' | 'secondary' | 'accent' | 'subtle'
): GradientConfig {
  switch (style) {
    case 'primary':
      return {
        type: 'linear',
        colors: [theme.palette.primary, theme.palette.secondary],
        direction: 135,
        stops: [0, 100]
      };

    case 'secondary':
      return {
        type: 'linear',
        colors: [theme.palette.secondary, theme.palette.accent],
        direction: 45,
        stops: [0, 100]
      };

    case 'accent':
      return {
        type: 'radial',
        colors: [theme.palette.accent, theme.palette.primary],
        centerX: 30,
        centerY: 70,
        stops: [0, 100]
      };

    case 'subtle':
      return {
        type: 'linear',
        colors: [theme.palette.background, theme.palette.surface],
        direction: 180,
        stops: [0, 100]
      };

    default:
      return MODERN_GRADIENTS.CORPORATE_BLUE;
  }
}

/**
 * Create modern card background with gradient and shadow
 */
export function createModernCardBackground(
  x: number,
  y: number,
  width: number,
  height: number,
  theme: ThemeTokens,
  style: 'subtle' | 'elevated' | 'hero' = 'subtle'
): any {
  const baseOptions = { x, y, w: width, h: height };

  switch (style) {
    case 'elevated':
      return applyVisualEffects(baseOptions, VISUAL_EFFECT_PRESETS.ELEVATED_CARD, theme);
    case 'hero':
      return applyVisualEffects(baseOptions, VISUAL_EFFECT_PRESETS.HERO_GRADIENT, theme);
    default:
      return applyVisualEffects(baseOptions, VISUAL_EFFECT_PRESETS.MODERN_CARD, theme);
  }
}

/**
 * Create decorative accent elements
 */
export function createAccentElement(
  x: number,
  y: number,
  width: number,
  height: number,
  theme: ThemeTokens,
  type: 'pill' | 'circle' | 'square' = 'pill'
): any {
  const baseOptions = { x, y, w: width, h: height };

  if (type === 'circle') {
    return {
      ...baseOptions,
      fill: createGradientFill(createThemeGradient(theme, 'accent')),
      shadow: createShadowEffect(SHADOW_PRESETS.CARD_SUBTLE)
    };
  }

  return applyVisualEffects(baseOptions, VISUAL_EFFECT_PRESETS.ACCENT_PILL, theme);
}

/**
 * Modern progress bar with gradient fill
 */
export function createProgressBar(
  x: number,
  y: number,
  width: number,
  height: number,
  progress: number, // 0-100
  theme: ThemeTokens
): { background: any; fill: any } {
  const backgroundOptions = {
    x, y, w: width, h: height,
    fill: { color: safeColorFormat(theme.palette.surface) },
    line: { width: 0 },
    rectRadius: height / 2
  };

  const fillWidth = (width * progress) / 100;
  const fillOptions = {
    x, y, w: fillWidth, h: height,
    fill: createGradientFill(createThemeGradient(theme, 'primary')),
    line: { width: 0 },
    rectRadius: height / 2,
    shadow: createShadowEffect(SHADOW_PRESETS.CARD_SUBTLE)
  };

  return { background: backgroundOptions, fill: fillOptions };
}

/**
 * Create modern badge/tag element
 */
export function createBadge(
  x: number,
  y: number,
  text: string,
  theme: ThemeTokens,
  variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error' = 'primary'
): { background: any; text: any } {
  const padding = 0.1;
  const height = 0.3;
  const textWidth = Math.max(text.length * 0.08, 0.5); // Estimate text width
  const width = textWidth + (padding * 2);

  let backgroundColor: string;
  let textColor: string;

  switch (variant) {
    case 'success':
      backgroundColor = theme.palette.semantic.success;
      textColor = theme.palette.text.inverse;
      break;
    case 'warning':
      backgroundColor = theme.palette.semantic.warning;
      textColor = theme.palette.text.inverse;
      break;
    case 'error':
      backgroundColor = theme.palette.semantic.error;
      textColor = theme.palette.text.inverse;
      break;
    case 'secondary':
      backgroundColor = theme.palette.secondary;
      textColor = theme.palette.text.inverse;
      break;
    default:
      backgroundColor = theme.palette.primary;
      textColor = theme.palette.text.inverse;
  }

  const backgroundOptions = {
    x, y, w: width, h: height,
    fill: { color: safeColorFormat(backgroundColor) },
    line: { width: 0 },
    rectRadius: height / 2,
    shadow: createShadowEffect(SHADOW_PRESETS.CARD_SUBTLE)
  };

  const textOptions = {
    x: x + padding,
    y,
    w: textWidth,
    h: height,
    text,
    fontSize: 10,
    color: safeColorFormat(textColor),
    align: 'center' as const,
    valign: 'middle' as const,
    bold: true
  };

  return { background: backgroundOptions, text: textOptions };
}
