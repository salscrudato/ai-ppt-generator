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
 * Background style types
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
  | 'modern';

/**
 * Background configuration
 */
export interface BackgroundConfig {
  style: BackgroundStyle;
  colors: {
    primary: string;
    secondary?: string;
    accent?: string;
  };
  opacity?: number;
  intensity?: 'subtle' | 'medium' | 'strong';
  pattern?: 'dots' | 'lines' | 'grid' | 'waves' | 'geometric';
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
      type: 'gradient',
      colors: [
        { color: config.colors.primary.replace('#', ''), position: 0 },
        { color: config.colors.secondary?.replace('#', '') || config.colors.primary.replace('#', ''), position: 100 }
      ],
      angle: 135
    },
    line: { width: 0 },
    transparency: Math.round((1 - opacity) * 100)
  });
  
  // Add subtle accent overlay for title slides
  if (slideType === 'title') {
    slide.addShape('rect', {
      x: 0, y: SLIDE_DIMENSIONS.HEIGHT * 0.7,
      w: SLIDE_DIMENSIONS.WIDTH,
      h: SLIDE_DIMENSIONS.HEIGHT * 0.3,
      fill: {
        color: config.colors.accent?.replace('#', '') || config.colors.primary.replace('#', '')
      },
      line: { width: 0 },
      transparency: 95
    });
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
      type: 'gradient',
      colors: [
        { color: theme.colors.background.replace('#', ''), position: 0 },
        { color: theme.colors.surface.replace('#', ''), position: 100 }
      ],
      angle: 180
    },
    line: { width: 0 }
  });
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
      transparency: element.opacity,
      rectRadius: 0.1
    });
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
          line: { width: 0 },
          transparency: 95
        });
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
      type: 'gradient',
      colors: [
        { color: theme.colors.background.replace('#', ''), position: 0 },
        { color: theme.colors.surface.replace('#', ''), position: 100 }
      ],
      angle: 45
    },
    line: { width: 0 }
  });
  
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
      line: { width: 0 },
      transparency: element.opacity
    });
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
      line: { width: 0 },
      transparency: 92
    });
  } else {
    // Subtle corner accent
    slide.addShape('rect', {
      x: 8.5, y: 0,
      w: 1.5, h: 1.5,
      fill: { color: config.colors.accent?.replace('#', '') || config.colors.primary.replace('#', '') },
      line: { width: 0 },
      transparency: 94,
      rectRadius: 0.2
    });
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
      type: 'gradient',
      colors: [
        { color: config.colors.primary.replace('#', ''), position: 0 },
        { color: config.colors.accent?.replace('#', '') || config.colors.secondary?.replace('#', '') || config.colors.primary.replace('#', ''), position: 50 },
        { color: config.colors.secondary?.replace('#', '') || config.colors.primary.replace('#', ''), position: 100 }
      ],
      angle: 45
    },
    line: { width: 0 },
    transparency: 88
  });
  
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
      transparency: 94,
      rotate: shape.rotation
    });
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
      line: { width: 0 },
      transparency: 20
    });
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
      line: { width: 0 },
      transparency: 97
    });
  }
}
