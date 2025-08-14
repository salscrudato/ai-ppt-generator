/**
 * Slide Generators Index
 *
 * Central export point for all slide generators and their configurations.
 * Provides a unified interface for creating professional PowerPoint slides.
 *
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

// Import and re-export slide generators
import { buildTitleSlide } from './title';
import { buildBulletSlide } from './bullets';
import { buildTwoColumnSlide } from './twoColumn';
import { buildMetricsSlide } from './metrics';

// Import types from schema
import {
  TitleSlideConfig,
  BulletSlideConfig,
  TwoColumnSlideConfig,
  MetricsSlideConfig,
  ColumnContent,
  MetricData
} from '../schema';

// Re-export everything
export { buildTitleSlide, buildBulletSlide, buildTwoColumnSlide, buildMetricsSlide };
export type { TitleSlideConfig, BulletSlideConfig, TwoColumnSlideConfig, MetricsSlideConfig, ColumnContent, MetricData };

// Import and export layout primitives and utilities
import { SlideBuildResult } from '../core/layout/primitives';

export {
  type LayoutSpec,
  type SlideBuildResult,
  type Box,
  type TextBlock,
  type ImageBlock,
  type ShapeBlock,
  type MetricCard,
  type TableBlock,
  createBox,
  createTextBlock,
  createImageBlock,
  createMetricCard
} from '../core/layout/primitives';

// Export grid system
export {
  type GridConfig,
  type GridColumn,
  createGridConfig,
  createGridBox,
  LAYOUT_PRESETS
} from '../core/layout/grid';

// Export spacing utilities
export {
  type SpacingValue,
  type SpacingConfig,
  createSpacing,
  SPACING_PRESETS
} from '../core/layout/spacing';

/**
 * Supported slide types
 */
export type SlideType = 'title' | 'bullets' | 'twoColumn' | 'metrics' | 'section' | 'quote' | 'image' | 'timeline' | 'table' | 'comparison';

/**
 * Generic slide configuration union type
 */
export type SlideConfig =
  | ({ type: 'title' } & TitleSlideConfig)
  | ({ type: 'bullets' } & BulletSlideConfig)
  | ({ type: 'twoColumn' } & TwoColumnSlideConfig)
  | ({ type: 'metrics' } & MetricsSlideConfig);

/**
 * Slide generator function type
 */
export type SlideGenerator<T = any> = (config: T, theme: import('../core/theme/tokens').ThemeTokens) => SlideBuildResult;

/**
 * Registry of slide generators
 */
export const slideGenerators: Record<SlideType, SlideGenerator> = {
  title: buildTitleSlide,
  bullets: buildBulletSlide,
  twoColumn: buildTwoColumnSlide,
  metrics: buildMetricsSlide,
  // Placeholder generators for future implementation
  section: buildTitleSlide, // Use title generator as fallback
  quote: buildTitleSlide,   // Use title generator as fallback
  image: buildTitleSlide,   // Use title generator as fallback
  timeline: buildTitleSlide, // Use title generator as fallback
  table: buildTitleSlide,   // Use title generator as fallback
  comparison: buildTwoColumnSlide // Use two-column as fallback
};

/**
 * Build a slide using the appropriate generator
 */
export function buildSlide(
  type: SlideType,
  config: any,
  theme: import('../core/theme/tokens').ThemeTokens
): SlideBuildResult {
  const generator = slideGenerators[type];
  if (!generator) {
    throw new Error(`Unknown slide type: ${type}`);
  }

  return generator(config, theme);
}

/**
 * Validate slide configuration
 */
export function validateSlideConfig(type: SlideType, config: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Basic validation
  if (!config) {
    errors.push('Configuration is required');
    return { valid: false, errors };
  }

  // Type-specific validation
  switch (type) {
    case 'title':
      if (!config.title || typeof config.title !== 'string') {
        errors.push('Title is required and must be a string');
      }
      break;

    case 'bullets':
      if (!config.title || typeof config.title !== 'string') {
        errors.push('Title is required and must be a string');
      }
      if (!config.bullets || !Array.isArray(config.bullets) || config.bullets.length === 0) {
        errors.push('Bullets array is required and must not be empty');
      }
      break;

    case 'twoColumn':
      if (!config.title || typeof config.title !== 'string') {
        errors.push('Title is required and must be a string');
      }
      if (!config.leftColumn || !config.rightColumn) {
        errors.push('Both leftColumn and rightColumn are required');
      }
      break;

    case 'metrics':
      if (!config.title || typeof config.title !== 'string') {
        errors.push('Title is required and must be a string');
      }
      if (!config.metrics || !Array.isArray(config.metrics) || config.metrics.length === 0) {
        errors.push('Metrics array is required and must not be empty');
      }
      break;
  }

  return { valid: errors.length === 0, errors };
}