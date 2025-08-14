/**
 * Bullets Slide Generator
 *
 * Professional bullet point slides with proper hierarchy, spacing, and readability.
 * Automatically handles text overflow and enforces bullet count limits.
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
 * Bullet slide configuration
 */
export interface BulletSlideConfig {
  /** Slide title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Bullet points (3-6 recommended) */
  bullets: string[];
  /** Bullet style */
  bulletStyle?: 'disc' | 'circle' | 'square' | 'dash' | 'arrow' | 'number';
  /** Maximum bullets per slide */
  maxBullets?: number;
  /** Maximum words per bullet */
  maxWordsPerBullet?: number;
}

/**
 * Validate and optimize bullet text
 */
function optimizeBulletText(
  bullets: string[],
  maxBullets: number = 6,
  maxWords: number = 14
): { optimized: string[]; warnings: string[] } {
  const warnings: string[] = [];
  let optimized = [...bullets];

  // Limit bullet count
  if (optimized.length > maxBullets) {
    warnings.push(`Reduced ${optimized.length} bullets to ${maxBullets} for better readability`);
    optimized = optimized.slice(0, maxBullets);
  }

  // Check word count per bullet
  optimized = optimized.map((bullet, index) => {
    const wordCount = bullet.trim().split(/\s+/).length;
    if (wordCount > maxWords) {
      warnings.push(`Bullet ${index + 1} has ${wordCount} words (recommended: ≤${maxWords})`);
      // Truncate to max words with ellipsis
      const words = bullet.trim().split(/\s+/);
      return words.slice(0, maxWords).join(' ') + '...';
    }
    return bullet;
  });

  // Ensure consistent formatting
  optimized = optimized.map(bullet => {
    let formatted = bullet.trim();

    // Remove terminal periods for consistency
    if (formatted.endsWith('.') && !formatted.endsWith('...')) {
      formatted = formatted.slice(0, -1);
    }

    // Capitalize first letter
    if (formatted.length > 0) {
      formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }

    return formatted;
  });

  return { optimized, warnings };
}

/**
 * Build a professional bullet slide
 */
export function buildBulletSlide(
  config: BulletSlideConfig,
  theme: ThemeTokens
): SlideBuildResult {
  const gridConfig = createGridConfig(theme);
  const warnings: string[] = [];
  const errors: string[] = [];

  try {
    // Optimize bullet text
    const { optimized: bullets, warnings: bulletWarnings } = optimizeBulletText(
      config.bullets,
      config.maxBullets,
      config.maxWordsPerBullet
    );
    warnings.push(...bulletWarnings);

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

    // Calculate available space for bullets
    const availableHeight = gridConfig.containerHeight - currentY - theme.spacing.lg;
    const bulletSpacing = theme.spacing.sm;
    const bulletHeight = Math.min(
      0.6, // Maximum height per bullet
      (availableHeight - (bullets.length - 1) * bulletSpacing) / bullets.length
    );

    // Create bullet points
    bullets.forEach((bullet, index) => {
      const bulletBox = createGridBox(
        { start: 1, span: 11 }, // Leave space for bullet symbol
        gridConfig,
        bulletHeight,
        currentY
      );

      // Add bullet symbol based on style
      const bulletSymbol = getBulletSymbol(config.bulletStyle || 'disc', index);
      const bulletText = `${bulletSymbol} ${bullet}`;

      const bulletBlock = createTextBlock(
        bulletBox,
        bulletText,
        theme,
        {
          fontSize: theme.typography.fontSizes.body,
          fontWeight: theme.typography.fontWeights.normal,
          align: 'left',
          valign: 'top',
          lineHeight: theme.typography.lineHeights.normal,
          wrap: true,
          maxLines: Math.floor(bulletHeight / (theme.typography.fontSizes.body * theme.typography.lineHeights.normal / 72))
        }
      );

      content.push(bulletBlock);
      currentY += bulletHeight + bulletSpacing;
    });

    // Validate layout
    if (currentY > gridConfig.containerHeight) {
      warnings.push('Content may overflow slide boundaries');
    }

    if (bullets.length < 3) {
      warnings.push('Consider adding more bullet points for better content balance');
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
        usedText: config.title.length + bullets.join(' ').length,
        overflowText: config.bullets.join(' ').length - bullets.join(' ').length,
        shapeCount: content.length,
        warnings,
        errors
      }
    };

  } catch (error) {
    errors.push(`Failed to build bullet slide: ${error instanceof Error ? error.message : 'Unknown error'}`);

    // Return minimal fallback layout
    const fallbackBox = createBox(1, 1, 8, 4);
    const fallbackContent = createTextBlock(
      fallbackBox,
      `${config.title}\n\n${config.bullets.slice(0, 3).map(b => `• ${b}`).join('\n')}`,
      theme
    );

    return {
      layout: {
        content: [fallbackContent],
        background: { color: theme.palette.background }
      },
      metadata: {
        usedText: config.title.length + config.bullets.join(' ').length,
        overflowText: 0,
        shapeCount: 1,
        warnings,
        errors
      }
    };
  }
}

/**
 * Get bullet symbol based on style
 */
function getBulletSymbol(style: BulletSlideConfig['bulletStyle'], index: number): string {
  switch (style) {
    case 'circle': return '○';
    case 'square': return '■';
    case 'dash': return '–';
    case 'arrow': return '→';
    case 'number': return `${index + 1}.`;
    case 'disc':
    default: return '•';
  }
}