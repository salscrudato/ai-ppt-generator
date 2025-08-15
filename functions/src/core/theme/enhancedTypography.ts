/**
 * Enhanced Typography System for Professional PowerPoint Generation
 * 
 * Provides advanced typography utilities including responsive sizing,
 * optimal line heights, and professional text styling for presentations.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import { TYPOGRAPHY_CONSTANTS } from '../../constants/layoutConstants';

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
 * Typography theme configuration
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
}

/**
 * Default typography theme
 */
export const DEFAULT_TYPOGRAPHY_THEME: TypographyTheme = {
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
  fontFamilies: {
    heading: TYPOGRAPHY_CONSTANTS.FONT_FAMILIES.HEADING,
    body: TYPOGRAPHY_CONSTANTS.FONT_FAMILIES.BODY,
    monospace: TYPOGRAPHY_CONSTANTS.FONT_FAMILIES.MONOSPACE
  },
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
  }
};

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
 * Create text style configuration for PowerPoint
 */
export function createTextStyle(
  type: 'hero' | 'title' | 'subtitle' | 'heading' | 'subheading' | 'body' | 'small' | 'caption',
  theme: TypographyTheme = DEFAULT_TYPOGRAPHY_THEME,
  options: {
    color?: string;
    bold?: boolean;
    italic?: boolean;
    contentLength?: number;
  } = {}
): TextStyle {
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
  
  return {
    fontSize,
    fontFamily,
    fontWeight,
    lineHeight,
    color: options.color || '#1F2937',
    bold: options.bold,
    italic: options.italic
  };
}

/**
 * Convert text style to PowerPoint text options
 */
export function textStyleToPptOptions(style: TextStyle): any {
  return {
    fontSize: style.fontSize,
    fontFace: style.fontFamily,
    color: style.color.replace('#', ''),
    bold: style.bold || style.fontWeight >= TYPOGRAPHY_CONSTANTS.FONT_WEIGHTS.BOLD,
    italic: style.italic,
    // Note: PowerPoint doesn't directly support line-height, but we can use it for spacing calculations
  };
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
 * Validate typography accessibility
 */
export function validateTypographyAccessibility(style: TextStyle): {
  isAccessible: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Check minimum font size
  if (style.fontSize < 12) {
    issues.push('Font size below recommended minimum (12pt)');
    recommendations.push('Increase font size to at least 12pt for better readability');
  }
  
  // Check line height
  if (style.lineHeight < 1.2) {
    issues.push('Line height too tight for optimal readability');
    recommendations.push('Increase line height to at least 1.2 for better text flow');
  }
  
  // Check font weight for small text
  if (style.fontSize <= 12 && style.fontWeight < 400) {
    issues.push('Light font weight on small text reduces readability');
    recommendations.push('Use normal or medium font weight for small text');
  }
  
  return {
    isAccessible: issues.length === 0,
    issues,
    recommendations
  };
}
