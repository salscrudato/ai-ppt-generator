/**
 * Two-Column Slide Generator
 *
 * Professional two-column layout for comparing content, text with images,
 * or balanced information presentation.
 *
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import { ThemeTokens } from '../core/theme/tokens';
import {
  LayoutSpec,
  SlideBuildResult,
  createTextBlock,
  createImageBlock,
  createBox
} from '../core/layout/primitives';
import {
  createGridConfig,
  createGridBox,
  LAYOUT_PRESETS
} from '../core/layout/grid';

/**
 * Column content type
 */
export type ColumnContent = {
  type: 'text';
  content: string;
  bullets?: string[];
} | {
  type: 'image';
  src: string;
  alt: string;
  caption?: string;
} | {
  type: 'mixed';
  text: string;
  image?: {
    src: string;
    alt: string;
  };
  bullets?: string[];
};

/**
 * Two-column slide configuration
 */
export interface TwoColumnSlideConfig {
  /** Slide title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Left column content */
  leftColumn: ColumnContent;
  /** Right column content */
  rightColumn: ColumnContent;
  /** Column width ratio (left:right) */
  columnRatio?: [number, number];
  /** Vertical alignment of columns */
  verticalAlign?: 'top' | 'middle' | 'bottom';
}

/**
 * Build a professional two-column slide
 */
export function buildTwoColumnSlide(
  config: TwoColumnSlideConfig,
  theme: ThemeTokens
): SlideBuildResult {
  const gridConfig = createGridConfig(theme);
  const warnings: string[] = [];
  const errors: string[] = [];

  try {
    const content: LayoutSpec['content'] = [];
    let currentY = theme.spacing.xl;

    // Create title
    const titleHeight = 0.8;
    const titleBox = createGridBox(
      LAYOUT_PRESETS.FULL,
      gridConfig,
      titleHeight,
      currentY
    );

    const titleBlock = createTextBlock(
      titleBox,
      config.title,
      theme,
      {
        fontSize: theme.typography.fontSizes.h1,
        fontWeight: theme.typography.fontWeights.bold,
        align: 'left',
        valign: 'middle',
        lineHeight: theme.typography.lineHeights.tight
      }
    );

    content.push(titleBlock);
    currentY += titleHeight + theme.spacing.lg;

    // Add subtitle if provided
    if (config.subtitle) {
      const subtitleHeight = 0.5;
      const subtitleBox = createGridBox(
        LAYOUT_PRESETS.FULL,
        gridConfig,
        subtitleHeight,
        currentY
      );

      const subtitleBlock = createTextBlock(
        subtitleBox,
        config.subtitle,
        theme,
        {
          fontSize: theme.typography.fontSizes.h3,
          fontWeight: theme.typography.fontWeights.normal,
          color: theme.palette.text.secondary.replace('#', ''),
          align: 'left',
          valign: 'middle'
        }
      );

      content.push(subtitleBlock);
      currentY += subtitleHeight + theme.spacing.md;
    }

    // Calculate column dimensions
    const availableHeight = gridConfig.containerHeight - currentY - theme.spacing.lg;
    const [leftRatio, rightRatio] = config.columnRatio || [1, 1];
    const totalRatio = leftRatio + rightRatio;

    const leftSpan = Math.round((leftRatio / totalRatio) * 11); // Leave 1 column for gutter
    const rightSpan = 11 - leftSpan;

    const leftColumn = { start: 1, span: leftSpan };
    const rightColumn = { start: leftSpan + 2, span: rightSpan };

    // Create column content
    const leftContent = createColumnContent(
      config.leftColumn,
      leftColumn,
      gridConfig,
      availableHeight,
      currentY,
      theme,
      config.verticalAlign
    );

    const rightContent = createColumnContent(
      config.rightColumn,
      rightColumn,
      gridConfig,
      availableHeight,
      currentY,
      theme,
      config.verticalAlign
    );

    content.push(...leftContent.blocks);
    content.push(...rightContent.blocks);
    warnings.push(...leftContent.warnings);
    warnings.push(...rightContent.warnings);

    // Validate layout balance
    if (Math.abs(leftContent.contentHeight - rightContent.contentHeight) > availableHeight * 0.3) {
      warnings.push('Column content heights are significantly unbalanced');
    }

    const layout: LayoutSpec = {
      content,
      background: {
        color: theme.palette.background
      }
    };

    return {
      layout,
      metadata: {
        usedText: getContentTextLength(config.leftColumn) + getContentTextLength(config.rightColumn),
        overflowText: 0,
        shapeCount: content.length,
        warnings,
        errors
      }
    };

  } catch (error) {
    errors.push(`Failed to build two-column slide: ${error instanceof Error ? error.message : 'Unknown error'}`);

    // Return minimal fallback layout
    const fallbackBox = createBox(1, 1, 8, 4);
    const fallbackContent = createTextBlock(
      fallbackBox,
      `${config.title}\n\nLeft: ${getContentText(config.leftColumn)}\nRight: ${getContentText(config.rightColumn)}`,
      theme
    );

    return {
      layout: {
        content: [fallbackContent],
        background: { color: theme.palette.background }
      },
      metadata: {
        usedText: config.title.length,
        overflowText: 0,
        shapeCount: 1,
        warnings,
        errors
      }
    };
  }
}

/**
 * Create content blocks for a column
 */
function createColumnContent(
  columnContent: ColumnContent,
  column: { start: number; span: number },
  gridConfig: any,
  availableHeight: number,
  startY: number,
  theme: ThemeTokens,
  verticalAlign: TwoColumnSlideConfig['verticalAlign'] = 'top'
): { blocks: any[]; contentHeight: number; warnings: string[] } {
  const blocks: any[] = [];
  const warnings: string[] = [];
  let contentHeight = 0;
  let currentY = startY;

  switch (columnContent.type) {
    case 'text': {
      let textContent = columnContent.content;

      // Add bullets if provided
      if (columnContent.bullets && columnContent.bullets.length > 0) {
        const bulletText = columnContent.bullets
          .slice(0, 6) // Limit bullets
          .map(bullet => `• ${bullet}`)
          .join('\n');
        textContent += textContent ? `\n\n${bulletText}` : bulletText;

        if (columnContent.bullets.length > 6) {
          warnings.push('Limited bullets to 6 for better readability');
        }
      }

      const textHeight = Math.min(availableHeight, estimateTextHeight(textContent, theme));
      const textBox = createGridBox(column, gridConfig, textHeight, currentY);

      const textBlock = createTextBlock(
        textBox,
        textContent,
        theme,
        {
          fontSize: theme.typography.fontSizes.body,
          fontWeight: theme.typography.fontWeights.normal,
          align: 'left',
          valign: 'top',
          wrap: true,
          lineHeight: theme.typography.lineHeights.normal
        }
      );

      blocks.push(textBlock);
      contentHeight = textHeight;
      break;
    }

    case 'image': {
      const imageHeight = availableHeight * 0.7; // Reserve space for caption
      const imageBox = createGridBox(column, gridConfig, imageHeight, currentY);

      const imageBlock = createImageBlock(
        imageBox,
        columnContent.src,
        columnContent.alt,
        {
          fit: 'contain',
          align: 'center',
          valign: 'middle'
        }
      );

      blocks.push(imageBlock);
      contentHeight = imageHeight;

      // Add caption if provided
      if (columnContent.caption) {
        const captionHeight = availableHeight * 0.2;
        const captionY = currentY + imageHeight + theme.spacing.sm;
        const captionBox = createGridBox(column, gridConfig, captionHeight, captionY);

        const captionBlock = createTextBlock(
          captionBox,
          columnContent.caption,
          theme,
          {
            fontSize: theme.typography.fontSizes.small,
            fontWeight: theme.typography.fontWeights.normal,
            color: theme.palette.text.muted.replace('#', ''),
            align: 'center',
            valign: 'top',
            wrap: true
          }
        );

        blocks.push(captionBlock);
        contentHeight += captionHeight + theme.spacing.sm;
      }
      break;
    }

    case 'mixed': {
      let currentColumnY = currentY;

      // Add text content
      if (columnContent.text) {
        const textHeight = availableHeight * 0.4;
        const textBox = createGridBox(column, gridConfig, textHeight, currentColumnY);

        const textBlock = createTextBlock(
          textBox,
          columnContent.text,
          theme,
          {
            fontSize: theme.typography.fontSizes.body,
            fontWeight: theme.typography.fontWeights.normal,
            align: 'left',
            valign: 'top',
            wrap: true
          }
        );

        blocks.push(textBlock);
        currentColumnY += textHeight + theme.spacing.md;
        contentHeight += textHeight + theme.spacing.md;
      }

      // Add image if provided
      if (columnContent.image) {
        const imageHeight = availableHeight * 0.4;
        const imageBox = createGridBox(column, gridConfig, imageHeight, currentColumnY);

        const imageBlock = createImageBlock(
          imageBox,
          columnContent.image.src,
          columnContent.image.alt,
          {
            fit: 'contain',
            align: 'center',
            valign: 'middle'
          }
        );

        blocks.push(imageBlock);
        currentColumnY += imageHeight + theme.spacing.md;
        contentHeight += imageHeight + theme.spacing.md;
      }

      // Add bullets if provided
      if (columnContent.bullets && columnContent.bullets.length > 0) {
        const bulletText = columnContent.bullets
          .slice(0, 4) // Fewer bullets in mixed content
          .map(bullet => `• ${bullet}`)
          .join('\n');

        const bulletHeight = availableHeight * 0.2;
        const bulletBox = createGridBox(column, gridConfig, bulletHeight, currentColumnY);

        const bulletBlock = createTextBlock(
          bulletBox,
          bulletText,
          theme,
          {
            fontSize: theme.typography.fontSizes.small,
            fontWeight: theme.typography.fontWeights.normal,
            align: 'left',
            valign: 'top',
            wrap: true
          }
        );

        blocks.push(bulletBlock);
        contentHeight += bulletHeight;

        if (columnContent.bullets.length > 4) {
          warnings.push('Limited bullets to 4 in mixed content for better layout');
        }
      }
      break;
    }
  }

  return { blocks, contentHeight, warnings };
}

/**
 * Estimate text height based on content and theme
 */
function estimateTextHeight(text: string, theme: ThemeTokens): number {
  const lines = text.split('\n').length;
  const lineHeight = theme.typography.fontSizes.body * theme.typography.lineHeights.normal / 72;
  return lines * lineHeight + theme.spacing.sm;
}

/**
 * Get text content from column content
 */
function getContentText(content: ColumnContent): string {
  switch (content.type) {
    case 'text':
      return content.content + (content.bullets ? ' ' + content.bullets.join(' ') : '');
    case 'image':
      return content.caption || content.alt;
    case 'mixed':
      return content.text + (content.bullets ? ' ' + content.bullets.join(' ') : '');
    default:
      return '';
  }
}

/**
 * Get text length from column content
 */
function getContentTextLength(content: ColumnContent): number {
  return getContentText(content).length;
}