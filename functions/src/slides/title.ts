/**
 * Title Slide Generator
 *
 * Professional title slide with proper hierarchy, spacing, and visual impact.
 * Supports main title, subtitle, and optional author/date information.
 *
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import { ThemeTokens } from '../core/theme/tokens';
import {
  LayoutSpec,
  SlideBuildResult,
  createTextBlock,
  createBox
} from '../core/layout/primitives';
import {
  createGridConfig,
  createGridBox,
  LAYOUT_PRESETS
} from '../core/layout/grid';
import {
  createSpacing,
  SPACING_PRESETS
} from '../core/layout/spacing';

/**
 * Title slide configuration
 */
export interface TitleSlideConfig {
  /** Main title text */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Optional author information */
  author?: string;
  /** Optional date */
  date?: string;
  /** Optional company/organization */
  organization?: string;
  /** Background image URL */
  backgroundImage?: string;
  /** Custom background color */
  backgroundColor?: string;
}

/**
 * Build a professional title slide
 */
export function buildTitleSlide(
  config: TitleSlideConfig,
  theme: ThemeTokens
): SlideBuildResult {
  const gridConfig = createGridConfig(theme);
  const warnings: string[] = [];
  const errors: string[] = [];

  try {
    // Calculate vertical spacing for centered layout
    const titleHeight = 1.2; // inches
    const subtitleHeight = config.subtitle ? 0.8 : 0;
    const authorHeight = (config.author || config.date || config.organization) ? 0.6 : 0;
    const totalContentHeight = titleHeight + subtitleHeight + authorHeight;

    // Center content vertically
    const startY = (gridConfig.containerHeight - totalContentHeight) / 2;
    let currentY = startY;

    // Create title text block
    const titleBox = createGridBox(
      LAYOUT_PRESETS.CONTENT_NARROW,
      gridConfig,
      titleHeight,
      currentY
    );

    const titleBlock = createTextBlock(
      titleBox,
      config.title,
      theme,
      {
        fontSize: theme.typography.fontSizes.display,
        fontWeight: theme.typography.fontWeights.bold,
        align: 'center',
        valign: 'middle',
        lineHeight: theme.typography.lineHeights.tight,
        letterSpacing: theme.typography.letterSpacing.tight
      }
    );

    currentY += titleHeight + (config.subtitle ? theme.spacing.lg : 0);

    const content: LayoutSpec['content'] = [titleBlock];

    // Add subtitle if provided
    let subtitleBlock;
    if (config.subtitle) {
      const subtitleBox = createGridBox(
        LAYOUT_PRESETS.CONTENT_MEDIUM,
        gridConfig,
        subtitleHeight,
        currentY
      );

      subtitleBlock = createTextBlock(
        subtitleBox,
        config.subtitle,
        theme,
        {
          fontSize: theme.typography.fontSizes.h2,
          fontWeight: theme.typography.fontWeights.normal,
          color: theme.palette.text.secondary.replace('#', ''),
          align: 'center',
          valign: 'middle',
          lineHeight: theme.typography.lineHeights.normal
        }
      );

      content.push(subtitleBlock);
      currentY += subtitleHeight + theme.spacing.xl;
    }

    // Add author/date/organization if provided
    if (config.author || config.date || config.organization) {
      const authorInfo = [
        config.author,
        config.organization,
        config.date
      ].filter(Boolean).join(' • ');

      const authorBox = createGridBox(
        LAYOUT_PRESETS.CONTENT_TIGHT,
        gridConfig,
        authorHeight,
        currentY
      );

      const authorBlock = createTextBlock(
        authorBox,
        authorInfo,
        theme,
        {
          fontSize: theme.typography.fontSizes.small,
          fontWeight: theme.typography.fontWeights.normal,
          color: theme.palette.text.muted.replace('#', ''),
          align: 'center',
          valign: 'middle'
        }
      );

      content.push(authorBlock);
    }

    // Validate title length
    if (config.title.length > 80) {
      warnings.push('Title text is very long and may not fit properly');
    }

    if (config.subtitle && config.subtitle.length > 120) {
      warnings.push('Subtitle text is very long and may not fit properly');
    }

    const layout: LayoutSpec = {
      content,
      background: {
        color: config.backgroundColor || theme.palette.background,
        image: config.backgroundImage
      }
    };

    return {
      layout,
      metadata: {
        usedText: config.title.length + (config.subtitle?.length || 0),
        overflowText: 0,
        shapeCount: content.length,
        warnings,
        errors
      }
    };

  } catch (error) {
    errors.push(`Failed to build title slide: ${error instanceof Error ? error.message : 'Unknown error'}`);

    // Return minimal fallback layout
    const fallbackBox = createBox(1, 2, 8, 1.5);
    const fallbackTitle = createTextBlock(
      fallbackBox,
      config.title,
      theme,
      { align: 'center', valign: 'middle' }
    );

    return {
      layout: {
        content: [fallbackTitle],
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