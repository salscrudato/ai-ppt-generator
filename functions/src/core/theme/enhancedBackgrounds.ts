/**
 * Enhanced Background Styling System for Professional PowerPoint Generation
 * 
 * Provides sophisticated background treatments including gradients, textures,
 * patterns, and professional styling effects for presentations.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import pptxgen from 'pptxgenjs';
import { ProfessionalTheme } from '../../professionalThemes';
import { SLIDE_DIMENSIONS } from '../../constants/layoutConstants';
import { createGradientFill, MODERN_GRADIENTS } from './visualEffects';

/**
 * Enhanced background style types
 */
export type BackgroundStyle =
  | 'solid'
  | 'gradient'
  | 'subtle-gradient'
  | 'texture'
  | 'pattern'
  | 'mesh'
  | 'minimal'
  | 'professional'
  | 'creative'
  | 'modern'
  | 'executive'
  | 'data-focused'
  | 'image-overlay'
  | 'layered'
  | 'dynamic';

/**
 * Background context for different slide purposes
 */
export type BackgroundContext =
  | 'title-slide'
  | 'content-slide'
  | 'section-divider'
  | 'data-visualization'
  | 'image-focused'
  | 'text-heavy'
  | 'closing-slide'
  | 'transition-slide';

/**
 * Enhanced background configuration
 */
export interface BackgroundConfig {
  style: BackgroundStyle;
  context?: BackgroundContext;
  colors: {
    primary: string;
    secondary?: string;
    accent?: string;
    overlay?: string;
  };
  opacity?: number;
  intensity?: 'subtle' | 'medium' | 'strong';
  pattern?: 'dots' | 'lines' | 'grid' | 'waves' | 'geometric' | 'organic' | 'corporate';
  direction?: 'horizontal' | 'vertical' | 'diagonal' | 'radial' | 'conic';
  animation?: {
    enabled: boolean;
    type: 'fade' | 'slide' | 'zoom' | 'none';
    duration: number;
  };
  accessibility?: {
    highContrast: boolean;
    reducedMotion: boolean;
  };
}

/**
 * Advanced background preset configurations
 */
export const BACKGROUND_PRESETS: Record<string, BackgroundConfig> = {
  EXECUTIVE_MINIMAL: {
    style: 'minimal',
    context: 'title-slide',
    colors: { primary: '#FFFFFF', secondary: '#F8F9FA', accent: '#E5E7EB' },
    opacity: 0.95,
    intensity: 'subtle'
  },

  CORPORATE_GRADIENT: {
    style: 'gradient',
    context: 'content-slide',
    colors: { primary: '#FFFFFF', secondary: '#F1F5F9', accent: '#3B82F6' },
    opacity: 0.9,
    intensity: 'medium',
    direction: 'diagonal'
  },

  DATA_FOCUSED: {
    style: 'data-focused',
    context: 'data-visualization',
    colors: { primary: '#FAFAFA', secondary: '#F5F5F5', overlay: '#FFFFFF' },
    opacity: 0.98,
    intensity: 'subtle',
    accessibility: { highContrast: true, reducedMotion: true }
  },

  CREATIVE_DYNAMIC: {
    style: 'dynamic',
    context: 'section-divider',
    colors: { primary: '#667EEA', secondary: '#764BA2', accent: '#F093FB' },
    opacity: 0.85,
    intensity: 'strong',
    direction: 'conic',
    animation: { enabled: true, type: 'fade', duration: 1000 }
  },

  PROFESSIONAL_TEXTURE: {
    style: 'texture',
    context: 'content-slide',
    colors: { primary: '#FFFFFF', secondary: '#F8FAFC', accent: '#64748B' },
    opacity: 0.92,
    intensity: 'medium',
    pattern: 'organic'
  },

  IMAGE_OVERLAY: {
    style: 'image-overlay',
    context: 'image-focused',
    colors: { primary: '#000000', overlay: '#FFFFFF' },
    opacity: 0.3,
    intensity: 'medium'
  }
};

/**
 * Create context-aware background configuration
 */
export function createContextualBackgroundConfig(
  theme: ProfessionalTheme,
  context: BackgroundContext,
  businessType: 'corporate' | 'creative' | 'tech' | 'academic' = 'corporate'
): BackgroundConfig {
  // Select appropriate preset based on context and business type
  let presetKey = 'CORPORATE_GRADIENT';

  switch (context) {
    case 'title-slide':
      presetKey = businessType === 'creative' ? 'CREATIVE_DYNAMIC' : 'EXECUTIVE_MINIMAL';
      break;
    case 'data-visualization':
      presetKey = 'DATA_FOCUSED';
      break;
    case 'image-focused':
      presetKey = 'IMAGE_OVERLAY';
      break;
    case 'section-divider':
      presetKey = businessType === 'creative' ? 'CREATIVE_DYNAMIC' : 'PROFESSIONAL_TEXTURE';
      break;
    default:
      presetKey = 'CORPORATE_GRADIENT';
  }

  const preset = BACKGROUND_PRESETS[presetKey];

  // Customize with theme colors
  return {
    ...preset,
    colors: {
      primary: theme.colors.primary,
      secondary: theme.colors.secondary,
      accent: theme.colors.accent,
      overlay: preset.colors.overlay
    }
  };
}

/**
 * Apply enhanced background to slide based on theme and style
 */
export async function applyEnhancedBackground(
  slide: pptxgen.Slide,
  theme: ProfessionalTheme,
  style: BackgroundStyle = 'professional',
  slideType: 'title' | 'content' | 'section' = 'content'
): Promise<void> {
  try {
    // Clear any existing background
    slide.background = { color: 'FFFFFF' };
    
    const config: BackgroundConfig = {
      style,
      colors: {
        primary: theme.colors.primary,
        secondary: theme.colors.secondary,
        accent: theme.colors.accent
      },
      opacity: 0.05,
      intensity: 'subtle'
    };
    
    switch (style) {
      case 'gradient':
        await applyGradientBackground(slide, theme, config, slideType);
        break;
      case 'subtle-gradient':
        await applySubtleGradientBackground(slide, theme, config);
        break;
      case 'texture':
        await applyTextureBackground(slide, theme, config);
        break;
      case 'pattern':
        await applyPatternBackground(slide, theme, config);
        break;
      case 'mesh':
        await applyMeshBackground(slide, theme, config);
        break;
      case 'modern':
        await applyModernBackground(slide, theme, config, slideType);
        break;
      case 'creative':
        await applyCreativeBackground(slide, theme, config);
        break;
      case 'professional':
        await applyProfessionalBackground(slide, theme, config, slideType);
        break;
      case 'minimal':
        await applyMinimalBackground(slide, theme, config);
        break;
      case 'executive':
        await applyExecutiveBackground(slide, theme, config);
        break;
      case 'data-focused':
        await applyDataFocusedBackground(slide, theme, config);
        break;
      case 'image-overlay':
        await applyImageOverlayBackground(slide, theme, config);
        break;
      case 'layered':
        await applyLayeredBackground(slide, theme, config);
        break;
      case 'dynamic':
        await applyDynamicBackground(slide, theme, config);
        break;
      default:
        await applyProfessionalBackground(slide, theme, config, slideType);
    }
    
    console.log(`✅ Enhanced ${style} background applied`);
  } catch (error) {
    console.warn(`⚠️ Failed to apply enhanced background (${style}):`, error);
    // Fallback to simple background
    slide.background = { color: theme.colors.background.replace('#', '') };
  }
}

/**
 * Apply gradient background
 */
async function applyGradientBackground(
  slide: pptxgen.Slide,
  theme: ProfessionalTheme,
  config: BackgroundConfig,
  slideType: 'title' | 'content' | 'section'
): Promise<void> {
  const intensity = slideType === 'title' ? 'medium' : 'subtle';
  const opacity = slideType === 'title' ? 0.15 : 0.08;
  
  // Main gradient overlay
  slide.addShape('rect', {
    x: 0, y: 0,
    w: SLIDE_DIMENSIONS.WIDTH,
    h: SLIDE_DIMENSIONS.HEIGHT,
    fill: {
      color: config.colors.primary.replace('#', '')
    },
    line: { width: 0 }
  } as any);
  
  // Add subtle accent overlay for title slides
  if (slideType === 'title') {
    slide.addShape('rect', {
      x: 0, y: SLIDE_DIMENSIONS.HEIGHT * 0.7,
      w: SLIDE_DIMENSIONS.WIDTH,
      h: SLIDE_DIMENSIONS.HEIGHT * 0.3,
      fill: {
        color: config.colors.accent?.replace('#', '') || config.colors.primary.replace('#', '')
      },
      line: { width: 0 }
    } as any);
  }
}

/**
 * Apply subtle gradient background
 */
async function applySubtleGradientBackground(
  slide: pptxgen.Slide,
  theme: ProfessionalTheme,
  config: BackgroundConfig
): Promise<void> {
  // Very subtle gradient from background to surface color
  slide.addShape('rect', {
    x: 0, y: 0,
    w: SLIDE_DIMENSIONS.WIDTH,
    h: SLIDE_DIMENSIONS.HEIGHT,
    fill: {
      color: theme.colors.background.replace('#', '')
    },
    line: { width: 0 }
  } as any);
}

/**
 * Apply texture background
 */
async function applyTextureBackground(
  slide: pptxgen.Slide,
  theme: ProfessionalTheme,
  config: BackgroundConfig
): Promise<void> {
  // Base background
  slide.background = { color: theme.colors.background.replace('#', '') };
  
  // Add subtle texture using multiple transparent shapes
  const textureElements = [
    { x: 0, y: 0, w: 2, h: 2, opacity: 97 },
    { x: 3, y: 1, w: 1.5, h: 1.5, opacity: 98 },
    { x: 6, y: 0.5, w: 2.5, h: 2.5, opacity: 96 },
    { x: 8.5, y: 2, w: 1.5, h: 1.5, opacity: 98 },
    { x: 1, y: 3.5, w: 2, h: 2, opacity: 97 },
    { x: 4.5, y: 4, w: 1.8, h: 1.8, opacity: 97 },
    { x: 7.5, y: 3.8, w: 2.2, h: 1.8, opacity: 96 }
  ];
  
  textureElements.forEach(element => {
    slide.addShape('rect', {
      x: element.x, y: element.y,
      w: element.w, h: element.h,
      fill: { color: config.colors.primary.replace('#', '') },
      line: { width: 0 },
      rectRadius: 0.1
    } as any);
  });
}

/**
 * Apply pattern background
 */
async function applyPatternBackground(
  slide: pptxgen.Slide,
  theme: ProfessionalTheme,
  config: BackgroundConfig
): Promise<void> {
  // Base background
  slide.background = { color: theme.colors.background.replace('#', '') };
  
  // Create geometric pattern
  const patternColor = config.colors.primary.replace('#', '');
  const spacing = 0.8;
  const size = 0.1;
  
  for (let x = 0; x < SLIDE_DIMENSIONS.WIDTH; x += spacing) {
    for (let y = 0; y < SLIDE_DIMENSIONS.HEIGHT; y += spacing) {
      if ((Math.floor(x / spacing) + Math.floor(y / spacing)) % 2 === 0) {
        slide.addShape('rect', {
          x, y,
          w: size, h: size,
          fill: { color: patternColor },
          line: { width: 0 }
        } as any);
      }
    }
  }
}

/**
 * Apply mesh background
 */
async function applyMeshBackground(
  slide: pptxgen.Slide,
  theme: ProfessionalTheme,
  config: BackgroundConfig
): Promise<void> {
  // Base gradient
  slide.addShape('rect', {
    x: 0, y: 0,
    w: SLIDE_DIMENSIONS.WIDTH,
    h: SLIDE_DIMENSIONS.HEIGHT,
    fill: {
      color: theme.colors.background.replace('#', '')
    },
    line: { width: 0 }
  } as any);
  
  // Add mesh overlay elements
  const meshElements = [
    { x: 0, y: 0, w: 4, h: 3, color: config.colors.primary, opacity: 96 },
    { x: 6, y: 2.5, w: 4, h: 3, color: config.colors.accent || config.colors.primary, opacity: 97 },
    { x: 2, y: 4, w: 3, h: 2, color: config.colors.secondary || config.colors.primary, opacity: 98 }
  ];
  
  meshElements.forEach(element => {
    slide.addShape('ellipse', {
      x: element.x, y: element.y,
      w: element.w, h: element.h,
      fill: { color: element.color.replace('#', '') },
      line: { width: 0 }
    } as any);
  });
}

/**
 * Apply modern background
 */
async function applyModernBackground(
  slide: pptxgen.Slide,
  theme: ProfessionalTheme,
  config: BackgroundConfig,
  slideType: 'title' | 'content' | 'section'
): Promise<void> {
  // Modern gradient with accent elements
  await applyGradientBackground(slide, theme, config, slideType);
  
  // Add modern accent shapes
  if (slideType === 'title') {
    // Large accent circle
    slide.addShape('ellipse', {
      x: 7, y: -1,
      w: 4, h: 4,
      fill: { color: config.colors.accent?.replace('#', '') || config.colors.primary.replace('#', '') },
      line: { width: 0 }
    } as any);
  } else {
    // Subtle corner accent
    slide.addShape('rect', {
      x: 8.5, y: 0,
      w: 1.5, h: 1.5,
      fill: { color: config.colors.accent?.replace('#', '') || config.colors.primary.replace('#', '') },
      line: { width: 0 },
      rectRadius: 0.2
    } as any);
  }
}

/**
 * Apply creative background
 */
async function applyCreativeBackground(
  slide: pptxgen.Slide,
  theme: ProfessionalTheme,
  config: BackgroundConfig
): Promise<void> {
  // Creative gradient with multiple colors
  slide.addShape('rect', {
    x: 0, y: 0,
    w: SLIDE_DIMENSIONS.WIDTH,
    h: SLIDE_DIMENSIONS.HEIGHT,
    fill: {
      color: config.colors.primary.replace('#', '')
    },
    line: { width: 0 }
  } as any);
  
  // Add creative elements
  const creativeShapes = [
    { type: 'ellipse', x: 1, y: 1, w: 2, h: 1.5, rotation: 15 },
    { type: 'rect', x: 7, y: 3, w: 1.5, h: 2, rotation: -20 },
    { type: 'ellipse', x: 4, y: 4.5, w: 1.8, h: 1, rotation: 30 }
  ];
  
  creativeShapes.forEach((shape, index) => {
    const colors = [config.colors.primary, config.colors.secondary, config.colors.accent].filter(Boolean);
    const color = colors[index % colors.length] || config.colors.primary;
    
    slide.addShape(shape.type as any, {
      x: shape.x, y: shape.y,
      w: shape.w, h: shape.h,
      fill: { color: color.replace('#', '') },
      line: { width: 0 },
      rotate: shape.rotation
    } as any);
  });
}

/**
 * Apply professional background
 */
async function applyProfessionalBackground(
  slide: pptxgen.Slide,
  theme: ProfessionalTheme,
  config: BackgroundConfig,
  slideType: 'title' | 'content' | 'section'
): Promise<void> {
  // Clean professional background with subtle accents
  slide.background = { color: theme.colors.background.replace('#', '') };
  
  // Add professional accent elements
  if (slideType === 'title') {
    // Title slide accent bar
    slide.addShape('rect', {
      x: 0, y: 0,
      w: SLIDE_DIMENSIONS.WIDTH, h: 0.1,
      fill: { color: config.colors.primary.replace('#', '') },
      line: { width: 0 }
    });
    
    slide.addShape('rect', {
      x: 0, y: SLIDE_DIMENSIONS.HEIGHT - 0.1,
      w: SLIDE_DIMENSIONS.WIDTH, h: 0.1,
      fill: { color: config.colors.primary.replace('#', '') },
      line: { width: 0 }
    });
  } else {
    // Content slide side accent
    slide.addShape('rect', {
      x: 0, y: 0,
      w: 0.05, h: SLIDE_DIMENSIONS.HEIGHT,
      fill: { color: config.colors.primary.replace('#', '') },
      line: { width: 0 }
    } as any);
  }
}

/**
 * Apply minimal background
 */
async function applyMinimalBackground(
  slide: pptxgen.Slide,
  theme: ProfessionalTheme,
  config: BackgroundConfig
): Promise<void> {
  // Pure minimal - just clean background
  slide.background = { color: theme.colors.background.replace('#', '') };
  
  // Optional: very subtle surface tint
  if (theme.colors.surface !== theme.colors.background) {
    slide.addShape('rect', {
      x: 0, y: 0,
      w: SLIDE_DIMENSIONS.WIDTH,
      h: SLIDE_DIMENSIONS.HEIGHT,
      fill: { color: theme.colors.surface.replace('#', '') },
      line: { width: 0 }
    } as any);
  }
}

/**
 * Apply executive-style background for high-level presentations
 */
async function applyExecutiveBackground(
  slide: pptxgen.Slide,
  theme: ProfessionalTheme,
  config: BackgroundConfig
): Promise<void> {
  // Ultra-minimal background with subtle branding
  slide.background = { color: safeColorFormat(config.colors.primary) };

  // Add subtle brand accent line
  slide.addShape('rect', {
    x: 0, y: 5.4,
    w: 10, h: 0.2,
    fill: { color: safeColorFormat(config.colors.accent || theme.colors.accent) },
    line: { width: 0 }
  } as any);
}

/**
 * Apply data-focused background optimized for charts and tables
 */
async function applyDataFocusedBackground(
  slide: pptxgen.Slide,
  theme: ProfessionalTheme,
  config: BackgroundConfig
): Promise<void> {
  // Clean white background with subtle grid pattern
  slide.background = { color: 'FFFFFF' };

  // Add subtle grid overlay for data alignment
  const gridColor = safeColorFormat(config.colors.secondary || '#F5F5F5');

  // Vertical grid lines (subtle)
  for (let x = 2; x <= 8; x += 2) {
    slide.addShape('line', {
      x: x, y: 0,
      w: 0, h: 5.625,
      line: { color: gridColor, width: 0.25, transparency: 98 }
    } as any);
  }
}

/**
 * Apply image overlay background for image-heavy slides
 */
async function applyImageOverlayBackground(
  slide: pptxgen.Slide,
  theme: ProfessionalTheme,
  config: BackgroundConfig
): Promise<void> {
  // Dark overlay for text readability over images
  slide.background = { color: safeColorFormat(config.colors.primary) };

  // Add gradient overlay for text readability
  slide.addShape('rect', {
    x: 0, y: 0,
    w: 10, h: 5.625,
    fill: {
      color: safeColorFormat(config.colors.overlay || '#FFFFFF'),
      transparency: 70
    },
    line: { width: 0 }
  } as any);
}

/**
 * Apply layered background with multiple visual elements
 */
async function applyLayeredBackground(
  slide: pptxgen.Slide,
  theme: ProfessionalTheme,
  config: BackgroundConfig
): Promise<void> {
  // Base gradient
  await applyGradientBackground(slide, theme, config, 'content');

  // Add geometric shapes for visual interest
  slide.addShape('ellipse', {
    x: -2, y: -2,
    w: 6, h: 6,
    fill: {
      color: safeColorFormat(config.colors.accent || theme.colors.accent),
      transparency: 90
    },
    line: { width: 0 }
  } as any);

  slide.addShape('rect', {
    x: 6, y: 3,
    w: 5, h: 4,
    fill: {
      color: safeColorFormat(config.colors.secondary || theme.colors.secondary),
      transparency: 85
    },
    line: { width: 0 },
    rectRadius: 1
  } as any);
}

/**
 * Apply dynamic background with animation-ready elements
 */
async function applyDynamicBackground(
  slide: pptxgen.Slide,
  theme: ProfessionalTheme,
  config: BackgroundConfig
): Promise<void> {
  // Vibrant gradient base
  slide.background = {
    fill: {
      type: 'gradient',
      colors: [
        { color: safeColorFormat(config.colors.primary), position: 0 },
        { color: safeColorFormat(config.colors.secondary || theme.colors.secondary), position: 50 },
        { color: safeColorFormat(config.colors.accent || theme.colors.accent), position: 100 }
      ],
      angle: config.direction === 'conic' ? 0 : 45
    }
  } as any;

  // Add dynamic elements
  slide.addShape('ellipse', {
    x: 1, y: 1,
    w: 3, h: 3,
    fill: {
      color: safeColorFormat('#FFFFFF'),
      transparency: 80
    },
    line: { width: 0 }
  } as any);

  slide.addShape('ellipse', {
    x: 6, y: 2,
    w: 2, h: 2,
    fill: {
      color: safeColorFormat('#FFFFFF'),
      transparency: 85
    },
    line: { width: 0 }
  } as any);
}

/**
 * Safe color formatting helper
 */
function safeColorFormat(color: string): string {
  return color.replace('#', '').toUpperCase();
}
