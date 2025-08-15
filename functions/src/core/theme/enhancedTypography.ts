/**
 * Enhanced Typography System for Professional PowerPoint Generation
 *
 * Provides advanced typography utilities including responsive sizing,
 * optimal line heights, professional font combinations, and modern text styling.
 * Enhanced with better font stacks, improved spacing, and professional hierarchy.
 *
 * @version 2.0.0
 * @author AI PowerPoint Generator Team
 */

import { TYPOGRAPHY_CONSTANTS } from '../../constants/layoutConstants';

/**
 * Professional font stacks for different presentation contexts
 */
export const PROFESSIONAL_FONT_STACKS = {
  // Modern sans-serif fonts for headings
  MODERN_HEADING: 'Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", Arial, sans-serif',

  // Clean body text fonts
  MODERN_BODY: 'Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", Arial, sans-serif',

  // Professional corporate fonts
  CORPORATE_HEADING: 'Calibri, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
  CORPORATE_BODY: 'Calibri, "Segoe UI", "Helvetica Neue", Arial, sans-serif',

  // Creative presentation fonts
  CREATIVE_HEADING: 'Montserrat, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
  CREATIVE_BODY: 'Source Sans Pro, "Segoe UI", "Helvetica Neue", Arial, sans-serif',

  // Technical/data-focused fonts
  TECH_HEADING: 'Inter, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
  TECH_BODY: 'Inter, "Segoe UI", "Helvetica Neue", Arial, sans-serif',

  // Monospace for code/data
  MONOSPACE: 'Consolas, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Courier, monospace'
} as const;

/**
 * Typography scale configuration
 */
export interface TypographyScale {
  hero: number;
  title: number;
  subtitle: number;
  heading: number;
  subheading: number;
  body: number;
  small: number;
  caption: number;
}

/**
 * Text style configuration
 */
export interface TextStyle {
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  lineHeight: number;
  letterSpacing?: number;
  color: string;
  bold?: boolean;
  italic?: boolean;
}

/**
 * Typography theme configuration with enhanced professional options
 */
export interface TypographyTheme {
  scale: TypographyScale;
  fontFamilies: {
    heading: string;
    body: string;
    monospace: string;
  };
  lineHeights: {
    tight: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
  fontWeights: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
  };
  letterSpacing: {
    tight: number;
    normal: number;
    wide: number;
  };
  context: 'corporate' | 'creative' | 'tech' | 'modern';
}

/**
 * Enhanced text style configuration with professional features
 */
export interface EnhancedTextStyle extends TextStyle {
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration?: 'none' | 'underline';
  textShadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
    transparency: number;
  };
  background?: {
    color: string;
    transparency: number;
    padding: number;
  };
}

/**
 * Create typography theme for different presentation contexts
 */
export function createTypographyTheme(context: 'corporate' | 'creative' | 'tech' | 'modern' = 'modern'): TypographyTheme {
  const fontStacks = {
    corporate: {
      heading: PROFESSIONAL_FONT_STACKS.CORPORATE_HEADING,
      body: PROFESSIONAL_FONT_STACKS.CORPORATE_BODY,
      monospace: PROFESSIONAL_FONT_STACKS.MONOSPACE
    },
    creative: {
      heading: PROFESSIONAL_FONT_STACKS.CREATIVE_HEADING,
      body: PROFESSIONAL_FONT_STACKS.CREATIVE_BODY,
      monospace: PROFESSIONAL_FONT_STACKS.MONOSPACE
    },
    tech: {
      heading: PROFESSIONAL_FONT_STACKS.TECH_HEADING,
      body: PROFESSIONAL_FONT_STACKS.TECH_BODY,
      monospace: PROFESSIONAL_FONT_STACKS.MONOSPACE
    },
    modern: {
      heading: PROFESSIONAL_FONT_STACKS.MODERN_HEADING,
      body: PROFESSIONAL_FONT_STACKS.MODERN_BODY,
      monospace: PROFESSIONAL_FONT_STACKS.MONOSPACE
    }
  };

  return {
    scale: {
      hero: TYPOGRAPHY_CONSTANTS.HERO_SIZE,
      title: TYPOGRAPHY_CONSTANTS.TITLE_SIZE,
      subtitle: TYPOGRAPHY_CONSTANTS.SUBTITLE_SIZE,
      heading: TYPOGRAPHY_CONSTANTS.HEADING_SIZE,
      subheading: TYPOGRAPHY_CONSTANTS.SUBHEADING_SIZE,
      body: TYPOGRAPHY_CONSTANTS.BODY_SIZE,
      small: TYPOGRAPHY_CONSTANTS.SMALL_SIZE,
      caption: TYPOGRAPHY_CONSTANTS.CAPTION_SIZE
    },
    fontFamilies: fontStacks[context],
    lineHeights: {
      tight: TYPOGRAPHY_CONSTANTS.LINE_HEIGHTS.TIGHT,
      normal: TYPOGRAPHY_CONSTANTS.LINE_HEIGHTS.NORMAL,
      relaxed: TYPOGRAPHY_CONSTANTS.LINE_HEIGHTS.RELAXED,
      loose: TYPOGRAPHY_CONSTANTS.LINE_HEIGHTS.LOOSE
    },
    fontWeights: {
      light: TYPOGRAPHY_CONSTANTS.FONT_WEIGHTS.LIGHT,
      normal: TYPOGRAPHY_CONSTANTS.FONT_WEIGHTS.NORMAL,
      medium: TYPOGRAPHY_CONSTANTS.FONT_WEIGHTS.MEDIUM,
      semibold: TYPOGRAPHY_CONSTANTS.FONT_WEIGHTS.SEMIBOLD,
      bold: TYPOGRAPHY_CONSTANTS.FONT_WEIGHTS.BOLD,
      extrabold: TYPOGRAPHY_CONSTANTS.FONT_WEIGHTS.EXTRABOLD
    },
    letterSpacing: {
      tight: -0.025,
      normal: 0,
      wide: 0.025
    },
    context
  };
}

/**
 * Default typography theme (modern context)
 */
export const DEFAULT_TYPOGRAPHY_THEME: TypographyTheme = createTypographyTheme('modern');

/**
 * Calculate responsive font size based on content length and context
 */
export function getResponsiveFontSize(
  baseSize: number,
  contentLength: number,
  context: 'title' | 'body' | 'caption' = 'body'
): number {
  let scaleFactor = 1;
  
  // Adjust based on content length
  if (contentLength > 500) {
    scaleFactor = 0.85;
  } else if (contentLength > 300) {
    scaleFactor = 0.9;
  } else if (contentLength > 150) {
    scaleFactor = 0.95;
  }
  
  // Context-specific adjustments
  switch (context) {
    case 'title':
      // Titles should remain prominent even with long content
      scaleFactor = Math.max(scaleFactor, 0.9);
      break;
    case 'caption':
      // Captions can be smaller
      scaleFactor = Math.min(scaleFactor, 0.9);
      break;
    default:
      // Body text maintains readability
      scaleFactor = Math.max(scaleFactor, 0.85);
  }
  
  return Math.round(baseSize * scaleFactor);
}

/**
 * Get optimal line height for given font size and content type
 */
export function getOptimalLineHeight(
  fontSize: number,
  contentType: 'title' | 'heading' | 'body' | 'caption' = 'body'
): number {
  const baseLineHeight = {
    title: TYPOGRAPHY_CONSTANTS.LINE_HEIGHTS.TIGHT,
    heading: TYPOGRAPHY_CONSTANTS.LINE_HEIGHTS.NORMAL,
    body: TYPOGRAPHY_CONSTANTS.LINE_HEIGHTS.RELAXED,
    caption: TYPOGRAPHY_CONSTANTS.LINE_HEIGHTS.NORMAL
  }[contentType];
  
  // Adjust line height based on font size
  if (fontSize >= 24) {
    return baseLineHeight * 0.9; // Tighter for large text
  } else if (fontSize <= 12) {
    return baseLineHeight * 1.1; // Looser for small text
  }
  
  return baseLineHeight;
}

/**
 * Create enhanced text style configuration for PowerPoint with professional features
 */
export function createTextStyle(
  type: 'hero' | 'title' | 'subtitle' | 'heading' | 'subheading' | 'body' | 'small' | 'caption',
  theme: TypographyTheme = DEFAULT_TYPOGRAPHY_THEME,
  options: {
    color?: string;
    bold?: boolean;
    italic?: boolean;
    contentLength?: number;
    context?: 'slide-title' | 'section-header' | 'body-text' | 'caption' | 'accent';
    emphasis?: 'none' | 'subtle' | 'strong';
  } = {}
): EnhancedTextStyle {
  const fontSize = getResponsiveFontSize(
    theme.scale[type],
    options.contentLength || 0,
    type === 'hero' || type === 'title' || type === 'subtitle' ? 'title' :
    type === 'caption' ? 'caption' : 'body'
  );

  const lineHeight = getOptimalLineHeight(
    fontSize,
    type === 'hero' || type === 'title' || type === 'subtitle' ? 'title' :
    type === 'heading' || type === 'subheading' ? 'heading' :
    type === 'caption' ? 'caption' : 'body'
  );

  const fontFamily = (type === 'hero' || type === 'title' || type === 'subtitle' || type === 'heading' || type === 'subheading')
    ? theme.fontFamilies.heading
    : theme.fontFamilies.body;

  const fontWeight = options.bold ? theme.fontWeights.bold :
    (type === 'hero' || type === 'title') ? theme.fontWeights.bold :
    (type === 'subtitle' || type === 'heading') ? theme.fontWeights.semibold :
    type === 'subheading' ? theme.fontWeights.medium :
    theme.fontWeights.normal;

  // Enhanced styling based on context and emphasis
  const letterSpacing = type === 'hero' || type === 'title' ? theme.letterSpacing.tight :
    type === 'caption' ? theme.letterSpacing.normal :
    theme.letterSpacing.normal;

  const textTransform = options.context === 'section-header' && type === 'subheading' ? 'uppercase' as const : 'none' as const;

  // Add subtle text shadow for hero and title elements
  const textShadow = (type === 'hero' || (type === 'title' && options.emphasis === 'strong')) ? {
    color: '000000',
    blur: 2,
    offsetX: 1,
    offsetY: 1,
    transparency: 90
  } : undefined;

  // Add background highlight for accent text
  const background = options.context === 'accent' ? {
    color: options.color || '#3B82F6',
    transparency: 90,
    padding: 0.1
  } : undefined;

  return {
    fontSize,
    fontFamily,
    fontWeight,
    lineHeight,
    letterSpacing,
    color: options.color || '#1F2937',
    bold: options.bold,
    italic: options.italic,
    textTransform,
    textShadow,
    background
  };
}

/**
 * Convert enhanced text style to PowerPoint text options with professional features
 */
export function textStyleToPptOptions(style: EnhancedTextStyle): any {
  const options: any = {
    fontSize: style.fontSize,
    fontFace: extractPrimaryFont(style.fontFamily),
    color: style.color.replace('#', ''),
    bold: style.bold || style.fontWeight >= TYPOGRAPHY_CONSTANTS.FONT_WEIGHTS.BOLD,
    italic: style.italic,
  };

  // Add text shadow if specified
  if (style.textShadow) {
    options.shadow = {
      type: 'outer',
      color: style.textShadow.color,
      blur: style.textShadow.blur,
      offset: Math.max(style.textShadow.offsetX, style.textShadow.offsetY),
      angle: 45,
      transparency: style.textShadow.transparency
    };
  }

  // Add character spacing (letter spacing)
  if (style.letterSpacing && style.letterSpacing !== 0) {
    options.charSpacing = style.letterSpacing * 100; // Convert to percentage
  }

  return options;
}

/**
 * Extract primary font from font stack for PowerPoint compatibility
 */
function extractPrimaryFont(fontStack: string): string {
  // Extract the first font from the font stack
  const fonts = fontStack.split(',').map(f => f.trim().replace(/['"]/g, ''));

  // Prefer fonts that are commonly available in PowerPoint
  const preferredFonts = ['Segoe UI', 'Calibri', 'Arial', 'Helvetica', 'Roboto'];

  for (const preferred of preferredFonts) {
    if (fonts.includes(preferred)) {
      return preferred;
    }
  }

  // Return first font or fallback to Arial
  return fonts[0] || 'Arial';
}

/**
 * Calculate text height based on content and style
 */
export function calculateTextHeight(
  content: string,
  style: TextStyle,
  maxWidth: number
): number {
  // Estimate characters per line based on font size and width
  const avgCharWidth = style.fontSize * 0.6; // Rough estimate
  const charsPerLine = Math.floor(maxWidth * 72 / avgCharWidth); // Convert inches to points
  const lines = Math.ceil(content.length / charsPerLine);
  
  // Calculate height including line spacing
  const lineHeightInInches = (style.fontSize * style.lineHeight) / 72;
  return lines * lineHeightInInches;
}

/**
 * Get typography recommendations for different slide types
 */
export function getTypographyRecommendations(slideType: string): {
  title: TextStyle;
  body: TextStyle;
  caption: TextStyle;
} {
  const theme = DEFAULT_TYPOGRAPHY_THEME;
  
  switch (slideType) {
    case 'title':
    case 'hero':
      return {
        title: createTextStyle('hero', theme),
        body: createTextStyle('subtitle', theme),
        caption: createTextStyle('body', theme)
      };
    
    case 'section':
      return {
        title: createTextStyle('title', theme),
        body: createTextStyle('heading', theme),
        caption: createTextStyle('small', theme)
      };
    
    default:
      return {
        title: createTextStyle('title', theme),
        body: createTextStyle('body', theme),
        caption: createTextStyle('caption', theme)
      };
  }
}

/**
 * Create professional typography hierarchy for slide content
 */
export function createTypographyHierarchy(
  theme: TypographyTheme,
  slideType: 'title' | 'content' | 'section' | 'closing' = 'content'
): {
  primary: EnhancedTextStyle;
  secondary: EnhancedTextStyle;
  body: EnhancedTextStyle;
  caption: EnhancedTextStyle;
  accent: EnhancedTextStyle;
} {
  const baseColor = '#1F2937';
  const secondaryColor = '#6B7280';
  const accentColor = '#3B82F6';

  switch (slideType) {
    case 'title':
      return {
        primary: createTextStyle('hero', theme, { color: baseColor, emphasis: 'strong' }),
        secondary: createTextStyle('subtitle', theme, { color: secondaryColor }),
        body: createTextStyle('body', theme, { color: baseColor }),
        caption: createTextStyle('small', theme, { color: secondaryColor }),
        accent: createTextStyle('heading', theme, { color: accentColor, context: 'accent' })
      };

    case 'section':
      return {
        primary: createTextStyle('title', theme, { color: baseColor, emphasis: 'strong' }),
        secondary: createTextStyle('heading', theme, { color: secondaryColor, context: 'section-header' }),
        body: createTextStyle('body', theme, { color: baseColor }),
        caption: createTextStyle('small', theme, { color: secondaryColor }),
        accent: createTextStyle('subheading', theme, { color: accentColor, context: 'accent' })
      };

    default:
      return {
        primary: createTextStyle('title', theme, { color: baseColor }),
        secondary: createTextStyle('heading', theme, { color: secondaryColor }),
        body: createTextStyle('body', theme, { color: baseColor }),
        caption: createTextStyle('small', theme, { color: secondaryColor }),
        accent: createTextStyle('subheading', theme, { color: accentColor, context: 'accent' })
      };
  }
}

/**
 * Optimize text for different slide layouts
 */
export function optimizeTextForLayout(
  text: string,
  layout: 'single-column' | 'two-column' | 'three-column' | 'full-width',
  style: EnhancedTextStyle
): {
  optimizedStyle: EnhancedTextStyle;
  maxLines: number;
  recommendedHeight: number;
} {
  let scaleFactor = 1;
  let maxLines = 10;

  switch (layout) {
    case 'two-column':
      scaleFactor = 0.95;
      maxLines = 8;
      break;
    case 'three-column':
      scaleFactor = 0.9;
      maxLines = 6;
      break;
    case 'full-width':
      scaleFactor = 1.05;
      maxLines = 12;
      break;
    default:
      scaleFactor = 1;
      maxLines = 10;
  }

  const optimizedStyle: EnhancedTextStyle = {
    ...style,
    fontSize: Math.round(style.fontSize * scaleFactor),
    lineHeight: style.lineHeight * (scaleFactor < 1 ? 1.1 : 1)
  };

  const recommendedHeight = maxLines * (optimizedStyle.fontSize * optimizedStyle.lineHeight) / 72;

  return {
    optimizedStyle,
    maxLines,
    recommendedHeight
  };
}

/**
 * Validate typography accessibility with enhanced checks
 */
export function validateTypographyAccessibility(style: EnhancedTextStyle): {
  isAccessible: boolean;
  issues: string[];
  recommendations: string[];
  score: number;
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Check minimum font size
  if (style.fontSize < 12) {
    issues.push('Font size below recommended minimum (12pt)');
    recommendations.push('Increase font size to at least 12pt for better readability');
    score -= 25;
  }

  // Check line height
  if (style.lineHeight < 1.2) {
    issues.push('Line height too tight for optimal readability');
    recommendations.push('Increase line height to at least 1.2 for better text flow');
    score -= 15;
  }

  // Check font weight for small text
  if (style.fontSize <= 12 && style.fontWeight < 400) {
    issues.push('Light font weight on small text reduces readability');
    recommendations.push('Use normal or medium font weight for small text');
    score -= 10;
  }

  // Check letter spacing
  if (style.letterSpacing && Math.abs(style.letterSpacing) > 0.05) {
    issues.push('Extreme letter spacing may affect readability');
    recommendations.push('Keep letter spacing between -0.05 and 0.05 for optimal readability');
    score -= 5;
  }

  // Check text shadow contrast
  if (style.textShadow && style.textShadow.transparency < 70) {
    issues.push('Text shadow too prominent, may reduce readability');
    recommendations.push('Use subtle text shadows with high transparency (>70%)');
    score -= 10;
  }

  return {
    isAccessible: issues.length === 0,
    issues,
    recommendations,
    score: Math.max(0, score)
  };
}
