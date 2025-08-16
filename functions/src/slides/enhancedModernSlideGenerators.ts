/**
 * Enhanced Modern Slide Generators
 * 
 * Advanced slide generation with improved visual hierarchy, modern styling,
 * and professional-grade layouts for clean, contemporary presentations.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import type { ModernTheme } from '../core/theme/modernThemes';
import { LAYOUT_CONSTANTS, SLIDE_DIMENSIONS } from '../constants/layoutConstants';

/**
 * Enhanced modern title slide with sophisticated visual hierarchy
 */
export function createEnhancedTitleSlide(
  slide: any,
  config: {
    title: string;
    subtitle?: string;
    author?: string;
    date?: string;
    organization?: string;
    backgroundStyle?: 'minimal' | 'gradient' | 'accent';
  },
  theme: ModernTheme
): void {
  // Apply enhanced background
  if (config.backgroundStyle === 'gradient') {
    slide.background = {
      fill: {
        type: 'gradient',
        angle: 135,
        colors: [
          { color: theme.palette.primary, position: 0 },
          { color: theme.palette.secondary, position: 100 }
        ]
      }
    };
  } else if (config.backgroundStyle === 'accent') {
    // Subtle accent background
    slide.background = { fill: { color: theme.palette.surface } };
    
    // Add accent shape
    slide.addShape('rect', {
      x: 0,
      y: 0,
      w: 2,
      h: SLIDE_DIMENSIONS.HEIGHT,
      fill: { color: theme.palette.primary },
      line: { width: 0 }
    });
  }

  // Main title with enhanced typography
  slide.addText(config.title, {
    x: 1.5,
    y: 1.8,
    w: 7,
    h: 1.5,
    fontSize: 36,
    fontFace: theme.typography.fontFamilies.heading,
    color: theme.palette.text.primary,
    bold: true,
    align: 'left',
    lineSpacing: theme.typography.lineHeights.tight * 100
  });

  // Subtitle with refined styling
  if (config.subtitle) {
    slide.addText(config.subtitle, {
      x: 1.5,
      y: 3.5,
      w: 7,
      h: 0.8,
      fontSize: 18,
      fontFace: theme.typography.fontFamilies.body,
      color: theme.palette.text.secondary,
      align: 'left',
      lineSpacing: theme.typography.lineHeights.normal * 100
    });
  }

  // Author and organization with modern layout
  if (config.author || config.organization) {
    const authorText = [config.author, config.organization].filter(Boolean).join(' • ');
    slide.addText(authorText, {
      x: 1.5,
      y: 4.8,
      w: 7,
      h: 0.4,
      fontSize: 14,
      fontFace: theme.typography.fontFamilies.body,
      color: theme.palette.text.muted,
      align: 'left'
    });
  }

  // Date with accent styling
  if (config.date) {
    slide.addText(config.date, {
      x: 7.5,
      y: 4.8,
      w: 1.5,
      h: 0.4,
      fontSize: 14,
      fontFace: theme.typography.fontFamilies.body,
      color: theme.palette.primary,
      align: 'right',
      bold: true
    });
  }
}

/**
 * Enhanced bullet points slide with modern card-based layout
 */
export function createEnhancedBulletSlide(
  slide: any,
  config: {
    title: string;
    bullets: string[];
    accentColor?: string;
    cardStyle?: boolean;
  },
  theme: ModernTheme
): void {
  // Title with accent underline
  slide.addText(config.title, {
    x: LAYOUT_CONSTANTS.CONTENT_PADDING,
    y: 0.4,
    w: LAYOUT_CONSTANTS.MAX_CONTENT_WIDTH,
    h: 0.8,
    fontSize: theme.typography.fontSizes.h1,
    fontFace: theme.typography.fontFamilies.heading,
    color: theme.palette.text.primary,
    bold: true,
    lineSpacing: theme.typography.lineHeights.tight * 100
  });

  // Accent underline
  slide.addShape('rect', {
    x: LAYOUT_CONSTANTS.CONTENT_PADDING,
    y: 1.3,
    w: 2,
    h: 0.05,
    fill: { color: config.accentColor || theme.palette.primary },
    line: { width: 0 }
  });

  // Enhanced bullet points
  const startY = LAYOUT_CONSTANTS.CONTENT_Y;
  const itemHeight = 0.6;
  const spacing = 0.1;

  config.bullets.forEach((bullet, index) => {
    const y = startY + (index * (itemHeight + spacing));

    if (config.cardStyle) {
      // Card background
      slide.addShape('rect', {
        x: LAYOUT_CONSTANTS.CONTENT_PADDING - 0.1,
        y: y - 0.05,
        w: LAYOUT_CONSTANTS.MAX_CONTENT_WIDTH + 0.2,
        h: itemHeight,
        fill: { color: theme.palette.surface },
        line: { color: theme.palette.borders.light, width: 1 },
        rectRadius: 0.1
      });
    }

    // Modern bullet point (circle)
    slide.addShape('ellipse', {
      x: LAYOUT_CONSTANTS.CONTENT_PADDING + 0.1,
      y: y + 0.2,
      w: 0.15,
      h: 0.15,
      fill: { color: config.accentColor || theme.palette.primary },
      line: { width: 0 }
    });

    // Bullet text with enhanced typography
    slide.addText(bullet, {
      x: LAYOUT_CONSTANTS.CONTENT_PADDING + 0.4,
      y: y,
      w: LAYOUT_CONSTANTS.MAX_CONTENT_WIDTH - 0.4,
      h: itemHeight,
      fontSize: theme.typography.fontSizes.body,
      fontFace: theme.typography.fontFamilies.body,
      color: theme.palette.text.primary,
      valign: 'middle',
      lineSpacing: theme.typography.lineHeights.normal * 100
    });
  });
}

/**
 * Enhanced two-column slide with modern visual separation
 */
export function createEnhancedTwoColumnSlide(
  slide: any,
  config: {
    title: string;
    leftContent: { bullets?: string[]; paragraph?: string; };
    rightContent: { bullets?: string[]; paragraph?: string; };
    separatorStyle?: 'line' | 'gradient' | 'none';
  },
  theme: ModernTheme
): void {
  // Title
  slide.addText(config.title, {
    x: LAYOUT_CONSTANTS.CONTENT_PADDING,
    y: 0.4,
    w: LAYOUT_CONSTANTS.MAX_CONTENT_WIDTH,
    h: 0.8,
    fontSize: theme.typography.fontSizes.h1,
    fontFace: theme.typography.fontFamilies.heading,
    color: theme.palette.text.primary,
    bold: true
  });

  // Column separator
  if (config.separatorStyle === 'line') {
    slide.addShape('line', {
      x: SLIDE_DIMENSIONS.WIDTH / 2,
      y: LAYOUT_CONSTANTS.CONTENT_Y,
      w: 0,
      h: 3,
      line: { color: theme.palette.borders.medium, width: 2 }
    });
  } else if (config.separatorStyle === 'gradient') {
    slide.addShape('rect', {
      x: SLIDE_DIMENSIONS.WIDTH / 2 - 0.025,
      y: LAYOUT_CONSTANTS.CONTENT_Y,
      w: 0.05,
      h: 3,
      fill: {
        type: 'gradient',
        angle: 90,
        colors: [
          { color: theme.palette.primary, position: 0 },
          { color: theme.palette.secondary, position: 100 }
        ]
      },
      line: { width: 0 }
    });
  }

  // Left column content
  addColumnContent(slide, config.leftContent, {
    x: LAYOUT_CONSTANTS.CONTENT_PADDING,
    y: LAYOUT_CONSTANTS.CONTENT_Y,
    width: LAYOUT_CONSTANTS.COLUMN_WIDTH,
    theme
  });

  // Right column content
  addColumnContent(slide, config.rightContent, {
    x: LAYOUT_CONSTANTS.CONTENT_PADDING + LAYOUT_CONSTANTS.COLUMN_WIDTH + LAYOUT_CONSTANTS.COLUMN_GAP,
    y: LAYOUT_CONSTANTS.CONTENT_Y,
    width: LAYOUT_CONSTANTS.COLUMN_WIDTH,
    theme
  });
}

/**
 * Helper function to add content to a column
 */
function addColumnContent(
  slide: any,
  content: { bullets?: string[]; paragraph?: string; },
  layout: { x: number; y: number; width: number; theme: ModernTheme }
): void {
  let currentY = layout.y;

  // Add paragraph content
  if (content.paragraph) {
    slide.addText(content.paragraph, {
      x: layout.x,
      y: currentY,
      w: layout.width,
      h: 1.2,
      fontSize: layout.theme.typography.fontSizes.body,
      fontFace: layout.theme.typography.fontFamilies.body,
      color: layout.theme.palette.text.primary,
      lineSpacing: layout.theme.typography.lineHeights.normal * 100
    });
    currentY += 1.4;
  }

  // Add bullet points
  if (content.bullets) {
    content.bullets.forEach((bullet, index) => {
      const y = currentY + (index * 0.5);

      // Bullet point
      slide.addShape('ellipse', {
        x: layout.x + 0.05,
        y: y + 0.15,
        w: 0.1,
        h: 0.1,
        fill: { color: layout.theme.palette.primary },
        line: { width: 0 }
      });

      // Bullet text
      slide.addText(bullet, {
        x: layout.x + 0.25,
        y: y,
        w: layout.width - 0.25,
        h: 0.4,
        fontSize: layout.theme.typography.fontSizes.body,
        fontFace: layout.theme.typography.fontFamilies.body,
        color: layout.theme.palette.text.primary,
        valign: 'middle',
        lineSpacing: layout.theme.typography.lineHeights.normal * 100
      });
    });
  }
}

/**
 * Safe color formatting utility
 */
function safeColorFormat(color: string): string {
  if (!color) return '#000000';
  return color.startsWith('#') ? color : `#${color}`;
}
