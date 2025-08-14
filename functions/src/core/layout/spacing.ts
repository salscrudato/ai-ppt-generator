/**
 * Spacing Utilities for Professional PowerPoint Layouts
 *
 * Consistent spacing system for margins, padding, and element positioning
 * based on design tokens and professional presentation standards.
 *
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import { ThemeTokens } from '../theme/tokens';
import { Box } from './primitives';

/**
 * Spacing values type
 */
export type SpacingValue = keyof ThemeTokens['spacing'];

/**
 * Spacing configuration for all sides
 */
export interface SpacingConfig {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Get spacing value from theme
 */
export function getSpacing(value: SpacingValue, theme: ThemeTokens): number {
  return theme.spacing[value];
}

/**
 * Create spacing configuration from theme values
 */
export function createSpacing(
  top: SpacingValue | number,
  right?: SpacingValue | number,
  bottom?: SpacingValue | number,
  left?: SpacingValue | number,
  theme?: ThemeTokens
): SpacingConfig {
  const getValue = (val: SpacingValue | number): number => {
    if (typeof val === 'number') return val;
    if (!theme) throw new Error('Theme required for spacing value');
    return getSpacing(val, theme);
  };

  const topValue = getValue(top);
  const rightValue = getValue(right ?? top);
  const bottomValue = getValue(bottom ?? top);
  const leftValue = getValue(left ?? right ?? top);

  return {
    top: topValue,
    right: rightValue,
    bottom: bottomValue,
    left: leftValue
  };
}

/**
 * Apply padding to a box
 */
export function applyPadding(box: Box, padding: SpacingConfig): Box {
  return {
    ...box,
    x: box.x + padding.left,
    y: box.y + padding.top,
    width: box.width - padding.left - padding.right,
    height: box.height - padding.top - padding.bottom,
    padding
  };
}

/**
 * Apply margin to a box
 */
export function applyMargin(box: Box, margin: SpacingConfig): Box {
  return {
    ...box,
    x: box.x + margin.left,
    y: box.y + margin.top,
    width: box.width - margin.left - margin.right,
    height: box.height - margin.top - margin.bottom,
    margin
  };
}

/**
 * Calculate content area after padding and margin
 */
export function getContentArea(box: Box): Box {
  let contentBox = { ...box };

  if (box.margin) {
    contentBox = applyMargin(contentBox, box.margin);
  }

  if (box.padding) {
    contentBox = applyPadding(contentBox, box.padding);
  }

  return contentBox;
}

/**
 * Distribute boxes vertically with consistent spacing
 */
export function distributeVertically(
  boxes: Box[],
  containerHeight: number,
  spacing: number,
  alignment: 'start' | 'center' | 'end' | 'space-between' | 'space-around' = 'start'
): Box[] {
  if (boxes.length === 0) return [];

  const totalBoxHeight = boxes.reduce((sum, box) => sum + box.height, 0);
  const totalSpacing = (boxes.length - 1) * spacing;
  const availableSpace = containerHeight - totalBoxHeight - totalSpacing;

  let currentY = 0;

  switch (alignment) {
    case 'center':
      currentY = availableSpace / 2;
      break;
    case 'end':
      currentY = availableSpace;
      break;
    case 'space-between':
      spacing = boxes.length > 1 ? availableSpace / (boxes.length - 1) : 0;
      break;
    case 'space-around':
      const spaceAround = availableSpace / boxes.length;
      currentY = spaceAround / 2;
      spacing = spaceAround;
      break;
  }

  return boxes.map((box, index) => {
    const newBox = { ...box, y: currentY };
    currentY += box.height + spacing;
    return newBox;
  });
}

/**
 * Distribute boxes horizontally with consistent spacing
 */
export function distributeHorizontally(
  boxes: Box[],
  containerWidth: number,
  spacing: number,
  alignment: 'start' | 'center' | 'end' | 'space-between' | 'space-around' = 'start'
): Box[] {
  if (boxes.length === 0) return [];

  const totalBoxWidth = boxes.reduce((sum, box) => sum + box.width, 0);
  const totalSpacing = (boxes.length - 1) * spacing;
  const availableSpace = containerWidth - totalBoxWidth - totalSpacing;

  let currentX = 0;

  switch (alignment) {
    case 'center':
      currentX = availableSpace / 2;
      break;
    case 'end':
      currentX = availableSpace;
      break;
    case 'space-between':
      spacing = boxes.length > 1 ? availableSpace / (boxes.length - 1) : 0;
      break;
    case 'space-around':
      const spaceAround = availableSpace / boxes.length;
      currentX = spaceAround / 2;
      spacing = spaceAround;
      break;
  }

  return boxes.map((box, index) => {
    const newBox = { ...box, x: currentX };
    currentX += box.width + spacing;
    return newBox;
  });
}

/**
 * Standard spacing presets for common layouts
 */
export const SPACING_PRESETS = {
  /** Title spacing from top */
  TITLE_TOP: 'xl' as SpacingValue,
  /** Spacing between title and content */
  TITLE_CONTENT: 'lg' as SpacingValue,
  /** Spacing between content sections */
  SECTION: 'md' as SpacingValue,
  /** Spacing between list items */
  LIST_ITEM: 'sm' as SpacingValue,
  /** Card padding */
  CARD_PADDING: 'lg' as SpacingValue,
  /** Button padding */
  BUTTON_PADDING: 'md' as SpacingValue,
  /** Footer spacing from bottom */
  FOOTER_BOTTOM: 'md' as SpacingValue
} as const;