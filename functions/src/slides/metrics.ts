/**
 * Metrics Slide Generator
 *
 * Professional metrics display with cards, charts, and key performance indicators.
 * Optimized for executive dashboards and data presentations.
 *
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import { ThemeTokens } from '../core/theme/tokens';
import {
  LayoutSpec,
  SlideBuildResult,
  createTextBlock,
  createMetricCard,
  createBox,
  ShapeBlock
} from '../core/layout/primitives';
import {
  createGridConfig,
  createGridBox,
  LAYOUT_PRESETS
} from '../core/layout/grid';
import { distributeHorizontally, distributeVertically } from '../core/layout/spacing';

/**
 * Metric data point
 */
export interface MetricData {
  /** Metric value (number or formatted string) */
  value: string | number;
  /** Metric label/name */
  label: string;
  /** Optional description */
  description?: string;
  /** Optional trend indicator */
  trend?: {
    direction: 'up' | 'down' | 'flat';
    percentage?: number;
    period?: string;
  };
  /** Optional target/goal */
  target?: string | number;
  /** Color theme for this metric */
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

/**
 * Metrics slide configuration
 */
export interface MetricsSlideConfig {
  /** Slide title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Metrics to display */
  metrics: MetricData[];
  /** Layout style */
  layout?: 'grid' | 'row' | 'column' | 'featured';
  /** Maximum metrics per row */
  maxPerRow?: number;
  /** Show trend indicators */
  showTrends?: boolean;
  /** Show targets */
  showTargets?: boolean;
}

/**
 * Build a professional metrics slide
 */
export function buildMetricsSlide(
  config: MetricsSlideConfig,
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

    // Validate metrics count
    if (config.metrics.length === 0) {
      warnings.push('No metrics provided');
      return createEmptyMetricsSlide(config, theme, warnings, errors);
    }

    if (config.metrics.length > 12) {
      warnings.push('Too many metrics may reduce readability');
    }

    // Calculate available space
    const availableHeight = gridConfig.containerHeight - currentY - theme.spacing.lg;

    // Create metric cards based on layout
    const metricCards = createMetricCards(
      config.metrics,
      config.layout || 'grid',
      config.maxPerRow || 4,
      gridConfig,
      availableHeight,
      currentY,
      theme,
      config.showTrends,
      config.showTargets
    );

    content.push(...metricCards.blocks);
    warnings.push(...metricCards.warnings);

    const layout: LayoutSpec = {
      content,
      background: {
        color: theme.palette.background
      }
    };

    return {
      layout,
      metadata: {
        usedText: config.title.length + config.metrics.reduce((sum, m) => sum + m.label.length, 0),
        overflowText: 0,
        shapeCount: content.length,
        warnings,
        errors
      }
    };

  } catch (error) {
    errors.push(`Failed to build metrics slide: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return createEmptyMetricsSlide(config, theme, warnings, errors);
  }
}

/**
 * Create metric cards based on layout configuration
 */
function createMetricCards(
  metrics: MetricData[],
  layout: MetricsSlideConfig['layout'],
  maxPerRow: number,
  gridConfig: any,
  availableHeight: number,
  startY: number,
  theme: ThemeTokens,
  showTrends?: boolean,
  showTargets?: boolean
): { blocks: any[]; warnings: string[] } {
  const blocks: any[] = [];
  const warnings: string[] = [];

  switch (layout) {
    case 'row': {
      // Single row layout
      const cardWidth = (gridConfig.containerWidth - (metrics.length - 1) * theme.spacing.md) / metrics.length;
      const cardHeight = Math.min(1.5, availableHeight * 0.8);

      metrics.forEach((metric, index) => {
        const x = gridConfig.margin.left + index * (cardWidth + theme.spacing.md);
        const cardBox = createBox(x, startY, cardWidth, cardHeight);

        const card = createMetricCard(
          cardBox,
          metric.value,
          metric.label,
          theme,
          {
            description: metric.description,
            backgroundColor: getMetricColor(metric.color, theme, 'background'),
            textColor: getMetricColor(metric.color, theme, 'text'),
            accentColor: getMetricColor(metric.color, theme, 'accent')
          }
        );

        blocks.push(card);

        // Add trend indicator if enabled
        if (showTrends && metric.trend) {
          const trendBlock = createTrendIndicator(
            metric.trend,
            cardBox,
            theme
          );
          if (trendBlock) blocks.push(trendBlock);
        }
      });
      break;
    }

    case 'column': {
      // Single column layout
      const cardWidth = gridConfig.containerWidth * 0.8;
      const cardHeight = Math.min(1.0, availableHeight / metrics.length - theme.spacing.sm);
      const x = gridConfig.margin.left + (gridConfig.containerWidth - cardWidth) / 2;

      metrics.forEach((metric, index) => {
        const y = startY + index * (cardHeight + theme.spacing.sm);
        const cardBox = createBox(x, y, cardWidth, cardHeight);

        const card = createMetricCard(
          cardBox,
          metric.value,
          metric.label,
          theme,
          {
            description: metric.description,
            backgroundColor: getMetricColor(metric.color, theme, 'background'),
            textColor: getMetricColor(metric.color, theme, 'text'),
            accentColor: getMetricColor(metric.color, theme, 'accent')
          }
        );

        blocks.push(card);
      });
      break;
    }

    case 'featured': {
      // Featured metric with supporting metrics
      if (metrics.length === 0) break;

      const [featured, ...supporting] = metrics;

      // Create featured metric (larger)
      const featuredWidth = gridConfig.containerWidth * 0.6;
      const featuredHeight = availableHeight * 0.5;
      const featuredX = gridConfig.margin.left + (gridConfig.containerWidth - featuredWidth) / 2;
      const featuredBox = createBox(featuredX, startY, featuredWidth, featuredHeight);

      const featuredCard = createMetricCard(
        featuredBox,
        featured.value,
        featured.label,
        theme,
        {
          description: featured.description,
          backgroundColor: getMetricColor(featured.color, theme, 'background'),
          textColor: getMetricColor(featured.color, theme, 'text'),
          accentColor: getMetricColor(featured.color, theme, 'accent')
        }
      );

      blocks.push(featuredCard);

      // Create supporting metrics (smaller, in a row)
      if (supporting.length > 0) {
        const supportingY = startY + featuredHeight + theme.spacing.lg;
        const supportingWidth = gridConfig.containerWidth / Math.min(supporting.length, 4);
        const supportingHeight = availableHeight * 0.3;

        supporting.slice(0, 4).forEach((metric, index) => {
          const x = gridConfig.margin.left + index * supportingWidth;
          const cardBox = createBox(x, supportingY, supportingWidth * 0.9, supportingHeight);

          const card = createMetricCard(
            cardBox,
            metric.value,
            metric.label,
            theme,
            {
              backgroundColor: theme.palette.surface,
              textColor: theme.palette.text.primary,
              accentColor: theme.palette.accent
            }
          );

          blocks.push(card);
        });

        if (supporting.length > 4) {
          warnings.push('Limited supporting metrics to 4 in featured layout');
        }
      }
      break;
    }

    case 'grid':
    default: {
      // Grid layout
      const rows = Math.ceil(metrics.length / maxPerRow);
      const cardWidth = (gridConfig.containerWidth - (maxPerRow - 1) * theme.spacing.md) / maxPerRow;
      const cardHeight = Math.min(1.2, (availableHeight - (rows - 1) * theme.spacing.md) / rows);

      metrics.forEach((metric, index) => {
        const row = Math.floor(index / maxPerRow);
        const col = index % maxPerRow;

        const x = gridConfig.margin.left + col * (cardWidth + theme.spacing.md);
        const y = startY + row * (cardHeight + theme.spacing.md);

        const cardBox = createBox(x, y, cardWidth, cardHeight);

        const card = createMetricCard(
          cardBox,
          metric.value,
          metric.label,
          theme,
          {
            description: metric.description,
            backgroundColor: getMetricColor(metric.color, theme, 'background'),
            textColor: getMetricColor(metric.color, theme, 'text'),
            accentColor: getMetricColor(metric.color, theme, 'accent')
          }
        );

        blocks.push(card);
      });
      break;
    }
  }

  return { blocks, warnings };
}

/**
 * Get color for metric based on theme and type
 */
function getMetricColor(
  colorType: MetricData['color'],
  theme: ThemeTokens,
  usage: 'background' | 'text' | 'accent'
): string {
  const colorMap = {
    primary: {
      background: theme.palette.primary,
      text: theme.palette.text.inverse,
      accent: theme.palette.primary
    },
    success: {
      background: theme.palette.semantic.success,
      text: theme.palette.text.inverse,
      accent: theme.palette.semantic.success
    },
    warning: {
      background: theme.palette.semantic.warning,
      text: theme.palette.text.inverse,
      accent: theme.palette.semantic.warning
    },
    error: {
      background: theme.palette.semantic.error,
      text: theme.palette.text.inverse,
      accent: theme.palette.semantic.error
    },
    info: {
      background: theme.palette.semantic.info,
      text: theme.palette.text.inverse,
      accent: theme.palette.semantic.info
    }
  };

  const colors = colorMap[colorType || 'primary'];
  return colors[usage].replace('#', '');
}

/**
 * Create trend indicator shape
 */
function createTrendIndicator(
  trend: MetricData['trend'],
  cardBox: any,
  theme: ThemeTokens
): ShapeBlock | null {
  if (!trend) return null;

  const indicatorSize = 0.2;
  const x = cardBox.x + cardBox.width - indicatorSize - theme.spacing.xs;
  const y = cardBox.y + theme.spacing.xs;

  let color: string;
  let shapeType: ShapeBlock['type'];

  switch (trend.direction) {
    case 'up':
      color = theme.palette.semantic.success;
      shapeType = 'triangle';
      break;
    case 'down':
      color = theme.palette.semantic.error;
      shapeType = 'triangle';
      break;
    case 'flat':
    default:
      color = theme.palette.text.muted;
      shapeType = 'rectangle';
      break;
  }

  return {
    x,
    y,
    width: indicatorSize,
    height: indicatorSize,
    type: shapeType,
    fillColor: color.replace('#', ''),
    border: {
      width: 0,
      color: '000000',
      style: 'solid'
    }
  };
}

/**
 * Create empty metrics slide fallback
 */
function createEmptyMetricsSlide(
  config: MetricsSlideConfig,
  theme: ThemeTokens,
  warnings: string[],
  errors: string[]
): SlideBuildResult {
  const fallbackBox = createBox(1, 1, 8, 4);
  const fallbackContent = createTextBlock(
    fallbackBox,
    `${config.title}\n\nNo metrics data available`,
    theme,
    { align: 'center', valign: 'middle' }
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