/*
 * Core constants for PowerPoint generation
 * Extracted from pptGenerator-simple.ts for reusability
 */

export const SLIDE = {
  width: 10,
  height: 5.625, // 16:9 aspect ratio
} as const;

export const SPACING = {
  contentY: 1.6,
  columnWidth: 4.0,
  gap: 0.5,
  margin: 0.5,
  titleHeight: 0.8,
  bulletIndent: 0.3,
} as const;

export const FONT_SIZES = {
  title: 28,
  subtitle: 20,
  body: 16,
  small: 14,
  caption: 12,
} as const;

export const CHART_DEFAULTS = {
  width: 6,
  height: 3.5,
  x: 2,
  y: 1.5,
} as const;

export const TABLE_DEFAULTS = {
  width: 8,
  height: 3,
  x: 1,
  y: 1.8,
  headerHeight: 0.6,
  rowHeight: 0.5,
} as const;

export const IMAGE_DEFAULTS = {
  placeholder: {
    width: 4,
    height: 2.25, // 16:9
  },
  fullscreen: {
    width: SLIDE.width,
    height: SLIDE.height,
  },
} as const;
