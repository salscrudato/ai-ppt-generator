/**
 * Grid System for Professional PowerPoint Layouts
 *
 * 12-column grid system with consistent gutters and responsive breakpoints
 * for creating professional, aligned slide layouts.
 *
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import { ThemeTokens } from '../theme/tokens';
import { Box, createBox } from './primitives';

/**
 * Grid configuration
 */
export interface GridConfig {
  /** Total number of columns */
  columns: number;
  /** Gutter width between columns */
  gutter: number;
  /** Container width */
  containerWidth: number;
  /** Container height */
  containerHeight: number;
  /** Safe margins */
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

/**
 * Grid column specification
 */
export interface GridColumn {
  /** Starting column (1-based) */
  start: number;
  /** Column span */
  span: number;
  /** Row position */
  row?: number;
  /** Row span */
  rowSpan?: number;
}

/**
 * Create grid configuration from theme
 */
export function createGridConfig(theme: ThemeTokens): GridConfig {
  return {
    columns: theme.layout.gridColumns,
    gutter: theme.layout.gridGutter,
    containerWidth: theme.layout.contentWidth,
    containerHeight: theme.layout.contentHeight,
    margin: {
      top: theme.layout.safeMargin,
      right: theme.layout.safeMargin,
      bottom: theme.layout.safeMargin,
      left: theme.layout.safeMargin
    }
  };
}

/**
 * Calculate column width based on grid configuration
 */
export function getColumnWidth(config: GridConfig): number {
  const totalGutterWidth = (config.columns - 1) * config.gutter;
  return (config.containerWidth - totalGutterWidth) / config.columns;
}

/**
 * Calculate position for a grid column
 */
export function getColumnPosition(
  column: GridColumn,
  config: GridConfig
): { x: number; width: number } {
  const columnWidth = getColumnWidth(config);
  const startIndex = column.start - 1; // Convert to 0-based

  const x = config.margin.left +
           (startIndex * columnWidth) +
           (startIndex * config.gutter);

  const width = (column.span * columnWidth) +
                ((column.span - 1) * config.gutter);

  return { x, width };
}

/**
 * Calculate row position for vertical grid
 */
export function getRowPosition(
  row: number,
  rowHeight: number,
  rowGutter: number,
  config: GridConfig
): { y: number; height: number } {
  const rowIndex = row - 1; // Convert to 0-based

  const y = config.margin.top +
           (rowIndex * rowHeight) +
           (rowIndex * rowGutter);

  return { y, height: rowHeight };
}

/**
 * Create a box positioned on the grid
 */
export function createGridBox(
  column: GridColumn,
  config: GridConfig,
  height: number,
  yOffset: number = 0
): Box {
  const { x, width } = getColumnPosition(column, config);
  const y = config.margin.top + yOffset;

  return createBox(x, y, width, height);
}

/**
 * Create multiple boxes for a multi-column layout
 */
export function createMultiColumnLayout(
  columns: GridColumn[],
  config: GridConfig,
  height: number,
  yOffset: number = 0
): Box[] {
  return columns.map(column =>
    createGridBox(column, config, height, yOffset)
  );
}

/**
 * Standard layout presets
 */
export const LAYOUT_PRESETS = {
  /** Full width single column */
  FULL: { start: 1, span: 12 },

  /** Two equal columns */
  HALF_LEFT: { start: 1, span: 6 },
  HALF_RIGHT: { start: 7, span: 6 },

  /** Three equal columns */
  THIRD_LEFT: { start: 1, span: 4 },
  THIRD_CENTER: { start: 5, span: 4 },
  THIRD_RIGHT: { start: 9, span: 4 },

  /** Sidebar layouts */
  SIDEBAR_LEFT: { start: 1, span: 3 },
  MAIN_RIGHT: { start: 4, span: 9 },
  MAIN_LEFT: { start: 1, span: 9 },
  SIDEBAR_RIGHT: { start: 10, span: 3 },

  /** Content with margins */
  CONTENT_NARROW: { start: 2, span: 10 },
  CONTENT_MEDIUM: { start: 3, span: 8 },
  CONTENT_TIGHT: { start: 4, span: 6 }
} as const;

/**
 * Calculate responsive breakpoints for content
 */
export function getResponsiveLayout(
  contentWidth: number,
  config: GridConfig
): GridColumn {
  const columnWidth = getColumnWidth(config);
  const maxColumns = Math.floor(contentWidth / columnWidth);

  if (maxColumns >= 12) return LAYOUT_PRESETS.FULL;
  if (maxColumns >= 8) return LAYOUT_PRESETS.CONTENT_NARROW;
  if (maxColumns >= 6) return LAYOUT_PRESETS.CONTENT_MEDIUM;
  return LAYOUT_PRESETS.CONTENT_TIGHT;
}

/**
 * Validate grid column specification
 */
export function validateGridColumn(column: GridColumn, config: GridConfig): boolean {
  return column.start >= 1 &&
         column.start <= config.columns &&
         column.span >= 1 &&
         (column.start + column.span - 1) <= config.columns;
}