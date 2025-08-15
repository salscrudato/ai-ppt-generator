/**
 * Enhanced Slide Layout Engine for Professional PowerPoint Generation
 * 
 * Provides advanced layout management with better spacing, alignment, visual hierarchy,
 * and responsive positioning for different content types.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import type { SlideSpec } from '../schema';
import type { ProfessionalTheme } from '../professionalThemes';
import { createEnhancedColorPalette, getContextualColor } from './theme/advancedColorManagement';
import { createTypographyHierarchy, optimizeTextForLayout } from './theme/enhancedTypography';

/**
 * Layout configuration for different slide types
 */
export interface LayoutConfig {
  slideWidth: number;
  slideHeight: number;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  contentArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  spacing: {
    titleToContent: number;
    elementSpacing: number;
    columnGap: number;
    sectionSpacing: number;
  };
  grid: {
    columns: number;
    rows: number;
    gutterWidth: number;
    gutterHeight: number;
  };
}

/**
 * Element positioning information
 */
export interface ElementPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex?: number;
  alignment?: 'left' | 'center' | 'right';
  verticalAlignment?: 'top' | 'middle' | 'bottom';
}

/**
 * Layout calculation result
 */
export interface LayoutResult {
  title: ElementPosition;
  content: ElementPosition[];
  background?: ElementPosition;
  decorative?: ElementPosition[];
  totalHeight: number;
  isOverflowing: boolean;
  recommendations: string[];
}

/**
 * Create layout configuration for 16:9 slides
 */
export function createLayoutConfig(
  layout: SlideSpec['layout'],
  theme: ProfessionalTheme
): LayoutConfig {
  const slideWidth = 10;
  const slideHeight = 5.625; // 16:9 aspect ratio
  
  // Professional margins based on layout type
  const margins = {
    top: layout === 'title' ? 0.8 : 0.6,
    right: 0.5,
    bottom: 0.5,
    left: 0.5
  };

  const contentArea = {
    x: margins.left,
    y: margins.top,
    width: slideWidth - margins.left - margins.right,
    height: slideHeight - margins.top - margins.bottom
  };

  // Spacing based on theme and layout
  const spacing = {
    titleToContent: layout === 'title' ? 0.8 : 0.4,
    elementSpacing: 0.25,
    columnGap: 0.3,
    sectionSpacing: 0.5
  };

  // Grid system for precise alignment
  const grid = {
    columns: 12,
    rows: 8,
    gutterWidth: spacing.columnGap,
    gutterHeight: spacing.elementSpacing
  };

  return {
    slideWidth,
    slideHeight,
    margins,
    contentArea,
    spacing,
    grid
  };
}

/**
 * Calculate optimal layout for slide content
 */
export function calculateSlideLayout(
  slide: SlideSpec,
  theme: ProfessionalTheme
): LayoutResult {
  const config = createLayoutConfig(slide.layout, theme);
  const palette = createEnhancedColorPalette(theme);
  
  let currentY = config.contentArea.y;
  const content: ElementPosition[] = [];
  const recommendations: string[] = [];

  // Title positioning
  const titleHeight = slide.layout === 'title' ? 1.2 : 0.8;
  const title: ElementPosition = {
    x: config.contentArea.x,
    y: currentY,
    width: config.contentArea.width,
    height: titleHeight,
    alignment: slide.layout === 'title' ? 'center' : 'left'
  };
  
  currentY += titleHeight + config.spacing.titleToContent;

  // Layout-specific content positioning
  switch (slide.layout) {
    case 'title':
      // Title slide - center everything
      if (slide.paragraph) {
        content.push({
          x: config.contentArea.x + config.contentArea.width * 0.1,
          y: currentY,
          width: config.contentArea.width * 0.8,
          height: 0.6,
          alignment: 'center'
        });
      }
      break;

    case 'title-bullets':
      content.push(...calculateBulletsLayout(slide.bullets || [], config, currentY));
      break;

    case 'title-paragraph':
      if (slide.paragraph) {
        const optimizedText = optimizeTextForLayout(
          slide.paragraph,
          'single-column',
          { fontSize: 16, fontFamily: 'Arial', fontWeight: 400, lineHeight: 1.4, color: '#000000' }
        );
        
        content.push({
          x: config.contentArea.x,
          y: currentY,
          width: config.contentArea.width,
          height: optimizedText.recommendedHeight,
          alignment: 'left'
        });
      }
      break;

    case 'two-column':
      content.push(...calculateTwoColumnLayout(slide, config, currentY));
      break;

    case 'image-left':
    case 'image-right':
      content.push(...calculateImageLayout(slide, config, currentY));
      break;

    case 'chart':
      if (slide.chart) {
        content.push({
          x: config.contentArea.x + config.contentArea.width * 0.1,
          y: currentY,
          width: config.contentArea.width * 0.8,
          height: config.contentArea.height - (currentY - config.contentArea.y) - 0.5,
          alignment: 'center'
        });
      }
      break;

    case 'comparison-table':
      if (slide.comparisonTable) {
        content.push(...calculateTableLayout(slide.comparisonTable, config, currentY));
      }
      break;

    default:
      // Default single-column layout
      content.push(...calculateSingleColumnLayout(slide, config, currentY));
  }

  // Calculate total height and check for overflow
  const totalHeight = Math.max(...content.map(c => c.y + c.height), currentY);
  const isOverflowing = totalHeight > config.slideHeight - config.margins.bottom;

  if (isOverflowing) {
    recommendations.push('Content exceeds slide boundaries - consider reducing content or splitting into multiple slides');
  }

  // Add layout quality recommendations
  if (content.length > 5) {
    recommendations.push('Consider simplifying layout - too many elements may reduce readability');
  }

  return {
    title,
    content,
    totalHeight,
    isOverflowing,
    recommendations
  };
}

/**
 * Calculate bullets layout with proper spacing
 */
function calculateBulletsLayout(
  bullets: string[],
  config: LayoutConfig,
  startY: number
): ElementPosition[] {
  const positions: ElementPosition[] = [];
  const bulletHeight = 0.4;
  const bulletSpacing = 0.1;
  
  bullets.forEach((bullet, index) => {
    positions.push({
      x: config.contentArea.x,
      y: startY + (index * (bulletHeight + bulletSpacing)),
      width: config.contentArea.width,
      height: bulletHeight,
      alignment: 'left'
    });
  });

  return positions;
}

/**
 * Calculate two-column layout
 */
function calculateTwoColumnLayout(
  slide: SlideSpec,
  config: LayoutConfig,
  startY: number
): ElementPosition[] {
  const positions: ElementPosition[] = [];
  const columnWidth = (config.contentArea.width - config.spacing.columnGap) / 2;
  
  // Left column
  if (slide.left) {
    positions.push({
      x: config.contentArea.x,
      y: startY,
      width: columnWidth,
      height: config.contentArea.height - (startY - config.contentArea.y),
      alignment: 'left'
    });
  }

  // Right column
  if (slide.right) {
    positions.push({
      x: config.contentArea.x + columnWidth + config.spacing.columnGap,
      y: startY,
      width: columnWidth,
      height: config.contentArea.height - (startY - config.contentArea.y),
      alignment: 'left'
    });
  }

  return positions;
}

/**
 * Calculate image layout with text
 */
function calculateImageLayout(
  slide: SlideSpec,
  config: LayoutConfig,
  startY: number
): ElementPosition[] {
  const positions: ElementPosition[] = [];
  const imageWidth = config.contentArea.width * 0.45;
  const textWidth = config.contentArea.width * 0.5;
  const availableHeight = config.contentArea.height - (startY - config.contentArea.y);

  if (slide.layout === 'image-left') {
    // Image on left
    positions.push({
      x: config.contentArea.x,
      y: startY,
      width: imageWidth,
      height: availableHeight * 0.8,
      alignment: 'left'
    });

    // Text on right
    positions.push({
      x: config.contentArea.x + imageWidth + config.spacing.columnGap,
      y: startY,
      width: textWidth,
      height: availableHeight,
      alignment: 'left'
    });
  } else {
    // Text on left
    positions.push({
      x: config.contentArea.x,
      y: startY,
      width: textWidth,
      height: availableHeight,
      alignment: 'left'
    });

    // Image on right
    positions.push({
      x: config.contentArea.x + textWidth + config.spacing.columnGap,
      y: startY,
      width: imageWidth,
      height: availableHeight * 0.8,
      alignment: 'right'
    });
  }

  return positions;
}

/**
 * Calculate table layout
 */
function calculateTableLayout(
  table: NonNullable<SlideSpec['comparisonTable']>,
  config: LayoutConfig,
  startY: number
): ElementPosition[] {
  const tableHeight = (table.rows.length + 1) * 0.4 + 0.2; // Header + rows + padding
  
  return [{
    x: config.contentArea.x,
    y: startY,
    width: config.contentArea.width,
    height: Math.min(tableHeight, config.contentArea.height - (startY - config.contentArea.y)),
    alignment: 'center'
  }];
}

/**
 * Calculate single-column layout
 */
function calculateSingleColumnLayout(
  slide: SlideSpec,
  config: LayoutConfig,
  startY: number
): ElementPosition[] {
  const positions: ElementPosition[] = [];
  let currentY = startY;

  // Add paragraph if present
  if (slide.paragraph) {
    positions.push({
      x: config.contentArea.x,
      y: currentY,
      width: config.contentArea.width,
      height: 1.0,
      alignment: 'left'
    });
    currentY += 1.0 + config.spacing.elementSpacing;
  }

  // Add bullets if present
  if (slide.bullets) {
    positions.push(...calculateBulletsLayout(slide.bullets, config, currentY));
  }

  return positions;
}

/**
 * Apply responsive adjustments based on content density
 */
export function applyResponsiveAdjustments(
  layout: LayoutResult,
  contentDensity: 'low' | 'medium' | 'high'
): LayoutResult {
  const adjustedLayout = { ...layout };

  switch (contentDensity) {
    case 'high':
      // Reduce spacing and font sizes for dense content
      adjustedLayout.content = adjustedLayout.content.map(pos => ({
        ...pos,
        height: pos.height * 0.9
      }));
      adjustedLayout.recommendations.push('Consider reducing content density for better readability');
      break;

    case 'low':
      // Increase spacing for sparse content
      adjustedLayout.content = adjustedLayout.content.map(pos => ({
        ...pos,
        height: pos.height * 1.1
      }));
      break;

    default:
      // Medium density - no adjustments needed
      break;
  }

  return adjustedLayout;
}
