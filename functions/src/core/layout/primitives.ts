/**
 * Layout Primitives for Professional PowerPoint Generation
 *
 * Core layout building blocks providing consistent positioning, spacing,
 * and visual hierarchy across all slide types.
 *
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import { ThemeTokens } from '../theme/tokens';

/**
 * Base box model for all layout elements
 */
export interface Box {
  /** X position in inches */
  x: number;
  /** Y position in inches */
  y: number;
  /** Width in inches */
  width: number;
  /** Height in inches */
  height: number;
  /** Padding inside the box */
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  /** Margin outside the box */
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

/**
 * Text block configuration
 */
export interface TextBlock extends Box {
  /** Text content */
  text: string;
  /** Font family */
  fontFamily: string;
  /** Font size in points */
  fontSize: number;
  /** Font weight */
  fontWeight: number;
  /** Text color (hex without #) */
  color: string;
  /** Line height multiplier */
  lineHeight: number;
  /** Text alignment */
  align: 'left' | 'center' | 'right' | 'justify';
  /** Vertical alignment */
  valign: 'top' | 'middle' | 'bottom';
  /** Whether text can wrap */
  wrap: boolean;
  /** Maximum lines before truncation */
  maxLines?: number;
  /** Letter spacing */
  letterSpacing?: number;
  /** Text decoration */
  decoration?: 'none' | 'underline' | 'bold' | 'italic';
}

/**
 * Image block configuration
 */
export interface ImageBlock extends Box {
  /** Image source URL or base64 */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** How image should fit in the box */
  fit: 'cover' | 'contain' | 'fill' | 'none';
  /** Image alignment within box */
  align: 'left' | 'center' | 'right';
  /** Vertical alignment */
  valign: 'top' | 'middle' | 'bottom';
  /** Border radius */
  borderRadius?: number;
  /** Border configuration */
  border?: {
    width: number;
    color: string;
    style: 'solid' | 'dashed' | 'dotted';
  };
}

/**
 * Shape block for geometric elements
 */
export interface ShapeBlock extends Box {
  /** Shape type */
  type: 'rectangle' | 'circle' | 'triangle' | 'line' | 'arrow';
  /** Fill color */
  fillColor?: string;
  /** Border configuration */
  border?: {
    width: number;
    color: string;
    style: 'solid' | 'dashed' | 'dotted';
  };
  /** Border radius for rectangles */
  borderRadius?: number;
  /** Shadow configuration */
  shadow?: {
    offsetX: number;
    offsetY: number;
    blur: number;
    color: string;
  };
}

/**
 * Metric card for displaying key numbers
 */
export interface MetricCard extends Box {
  /** Main metric value */
  value: string | number;
  /** Metric label */
  label: string;
  /** Optional description */
  description?: string;
  /** Card background color */
  backgroundColor: string;
  /** Text color */
  textColor: string;
  /** Accent color for highlights */
  accentColor?: string;
  /** Border radius */
  borderRadius: number;
  /** Shadow configuration */
  shadow?: {
    offsetX: number;
    offsetY: number;
    blur: number;
    color: string;
  };
}

/**
 * Table configuration
 */
export interface TableBlock extends Box {
  /** Table headers */
  headers: string[];
  /** Table rows */
  rows: string[][];
  /** Header styling */
  headerStyle: {
    backgroundColor: string;
    textColor: string;
    fontSize: number;
    fontWeight: number;
  };
  /** Cell styling */
  cellStyle: {
    backgroundColor: string;
    textColor: string;
    fontSize: number;
    fontWeight: number;
  };
  /** Border configuration */
  border: {
    width: number;
    color: string;
    style: 'solid' | 'dashed' | 'dotted';
  };
  /** Alternating row colors */
  alternateRows?: boolean;
  /** Alternate row color */
  alternateColor?: string;
}

/**
 * Layout specification for slide composition
 */
export interface LayoutSpec {
  /** Slide title area */
  title?: TextBlock;
  /** Subtitle area */
  subtitle?: TextBlock;
  /** Main content areas */
  content: (TextBlock | ImageBlock | ShapeBlock | MetricCard | TableBlock)[];
  /** Footer area */
  footer?: TextBlock;
  /** Background configuration */
  background?: {
    color?: string;
    image?: string;
    gradient?: {
      type: 'linear' | 'radial';
      colors: string[];
      direction?: number;
    };
  };
}

/**
 * Slide build result with metadata
 */
export interface SlideBuildResult {
  /** Generated layout specification */
  layout: LayoutSpec;
  /** Metadata about the build process */
  metadata: {
    /** Text that was used */
    usedText: number;
    /** Text that overflowed */
    overflowText: number;
    /** Number of shapes created */
    shapeCount: number;
    /** Build warnings */
    warnings: string[];
    /** Build errors */
    errors: string[];
  };
}

/**
 * Create a box with default padding and margin
 */
export function createBox(
  x: number,
  y: number,
  width: number,
  height: number,
  padding?: Partial<Box['padding']>,
  margin?: Partial<Box['margin']>
): Box {
  return {
    x,
    y,
    width,
    height,
    padding: padding ? {
      top: padding.top ?? 0,
      right: padding.right ?? 0,
      bottom: padding.bottom ?? 0,
      left: padding.left ?? 0
    } : undefined,
    margin: margin ? {
      top: margin.top ?? 0,
      right: margin.right ?? 0,
      bottom: margin.bottom ?? 0,
      left: margin.left ?? 0
    } : undefined
  };
}

/**
 * Create a text block with theme-aware defaults
 */
export function createTextBlock(
  box: Box,
  text: string,
  theme: ThemeTokens,
  options: Partial<Omit<TextBlock, keyof Box | 'text'>> = {}
): TextBlock {
  return {
    ...box,
    text,
    fontFamily: options.fontFamily ?? theme.typography.fontFamilies.body,
    fontSize: options.fontSize ?? theme.typography.fontSizes.body,
    fontWeight: options.fontWeight ?? theme.typography.fontWeights.normal,
    color: options.color ?? theme.palette.text.primary.replace('#', ''),
    lineHeight: options.lineHeight ?? theme.typography.lineHeights.normal,
    align: options.align ?? 'left',
    valign: options.valign ?? 'top',
    wrap: options.wrap ?? true,
    maxLines: options.maxLines,
    letterSpacing: options.letterSpacing ?? theme.typography.letterSpacing.normal,
    decoration: options.decoration ?? 'none'
  };
}

/**
 * Create an image block with defaults
 */
export function createImageBlock(
  box: Box,
  src: string,
  alt: string,
  options: Partial<Omit<ImageBlock, keyof Box | 'src' | 'alt'>> = {}
): ImageBlock {
  return {
    ...box,
    src,
    alt,
    fit: options.fit ?? 'cover',
    align: options.align ?? 'center',
    valign: options.valign ?? 'middle',
    borderRadius: options.borderRadius,
    border: options.border
  };
}

/**
 * Create a metric card with theme-aware styling
 */
export function createMetricCard(
  box: Box,
  value: string | number,
  label: string,
  theme: ThemeTokens,
  options: Partial<Omit<MetricCard, keyof Box | 'value' | 'label'>> = {}
): MetricCard {
  return {
    ...box,
    value,
    label,
    description: options.description,
    backgroundColor: options.backgroundColor ?? theme.palette.surface,
    textColor: options.textColor ?? theme.palette.text.primary,
    accentColor: options.accentColor ?? theme.palette.accent,
    borderRadius: options.borderRadius ?? theme.radii.md,
    shadow: options.shadow
  };
}