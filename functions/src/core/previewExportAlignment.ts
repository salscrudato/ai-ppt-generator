/**
 * Preview-Export Alignment System
 * 
 * Ensures perfect visual consistency between slide preview and exported PowerPoint files
 * by standardizing measurements, fonts, colors, and layout calculations.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import type { SlideSpec } from '../schema';
import type { ProfessionalTheme } from '../professionalThemes';
import { LAYOUT_CONSTANTS } from '../constants/layoutConstants';

/**
 * Standardized measurement system for preview-export consistency
 */
export interface StandardizedMeasurements {
  slideWidth: number;
  slideHeight: number;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  typography: {
    titleSize: number;
    bodySize: number;
    smallSize: number;
    lineHeight: number;
    letterSpacing: number;
  };
  spacing: {
    elementGap: number;
    sectionGap: number;
    columnGap: number;
    bulletIndent: number;
  };
}

/**
 * Font mapping for cross-platform consistency
 */
export interface FontMapping {
  preview: string;
  export: string;
  fallbacks: string[];
  metrics: {
    characterWidth: number;
    lineHeight: number;
    ascender: number;
    descender: number;
  };
}

/**
 * Color consistency configuration
 */
export interface ColorConsistency {
  preview: string;
  export: string;
  accessibility: {
    contrastRatio: number;
    wcagLevel: 'AA' | 'AAA';
  };
}

/**
 * Layout alignment configuration
 */
export interface LayoutAlignment {
  preview: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  export: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  tolerance: number; // Acceptable difference in pixels
}

/**
 * Create standardized measurements for consistent preview-export alignment
 */
export function createStandardizedMeasurements(): StandardizedMeasurements {
  return {
    slideWidth: 10.0, // PowerPoint standard width in inches
    slideHeight: 5.625, // 16:9 aspect ratio height in inches
    margins: {
      top: 0.5,
      right: 0.5,
      bottom: 0.5,
      left: 0.5
    },
    typography: {
      titleSize: 24, // Points
      bodySize: 14, // Points
      smallSize: 11, // Points
      lineHeight: 1.4, // Multiplier
      letterSpacing: 0 // Points
    },
    spacing: {
      elementGap: 0.25, // Inches
      sectionGap: 0.5, // Inches
      columnGap: 0.3, // Inches
      bulletIndent: 0.25 // Inches
    }
  };
}

/**
 * Create font mapping for consistent rendering across preview and export
 */
export function createFontMapping(): Record<string, FontMapping> {
  return {
    'primary': {
      preview: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      export: 'Calibri',
      fallbacks: ['Arial', 'Helvetica', 'sans-serif'],
      metrics: {
        characterWidth: 0.6, // Average character width ratio
        lineHeight: 1.4,
        ascender: 0.8,
        descender: 0.2
      }
    },
    'heading': {
      preview: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      export: 'Calibri',
      fallbacks: ['Arial', 'Helvetica', 'sans-serif'],
      metrics: {
        characterWidth: 0.65,
        lineHeight: 1.2,
        ascender: 0.8,
        descender: 0.2
      }
    },
    'monospace': {
      preview: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace',
      export: 'Consolas',
      fallbacks: ['Courier New', 'monospace'],
      metrics: {
        characterWidth: 0.6,
        lineHeight: 1.4,
        ascender: 0.8,
        descender: 0.2
      }
    }
  };
}

/**
 * Calculate precise layout positions for preview-export alignment
 */
export function calculateAlignedLayout(
  spec: SlideSpec,
  theme: ProfessionalTheme,
  measurements: StandardizedMeasurements
): Record<string, LayoutAlignment> {
  const layouts: Record<string, LayoutAlignment> = {};
  
  // Title positioning
  const titleY = measurements.margins.top;
  const titleHeight = measurements.typography.titleSize * measurements.typography.lineHeight / 72; // Convert points to inches
  
  layouts.title = {
    preview: {
      x: measurements.margins.left,
      y: titleY,
      width: measurements.slideWidth - measurements.margins.left - measurements.margins.right,
      height: titleHeight
    },
    export: {
      x: measurements.margins.left,
      y: titleY,
      width: measurements.slideWidth - measurements.margins.left - measurements.margins.right,
      height: titleHeight
    },
    tolerance: 0.01 // 1/100th inch tolerance
  };
  
  // Content positioning
  const contentY = titleY + titleHeight + measurements.spacing.sectionGap;
  const contentHeight = measurements.slideHeight - contentY - measurements.margins.bottom;
  
  layouts.content = {
    preview: {
      x: measurements.margins.left,
      y: contentY,
      width: measurements.slideWidth - measurements.margins.left - measurements.margins.right,
      height: contentHeight
    },
    export: {
      x: measurements.margins.left,
      y: contentY,
      width: measurements.slideWidth - measurements.margins.left - measurements.margins.right,
      height: contentHeight
    },
    tolerance: 0.01
  };
  
  // Two-column layout positioning
  if (spec.layout === 'two-column' || spec.left || spec.right) {
    const columnWidth = (layouts.content.preview.width - measurements.spacing.columnGap) / 2;
    
    layouts.leftColumn = {
      preview: {
        x: measurements.margins.left,
        y: contentY,
        width: columnWidth,
        height: contentHeight
      },
      export: {
        x: measurements.margins.left,
        y: contentY,
        width: columnWidth,
        height: contentHeight
      },
      tolerance: 0.01
    };
    
    layouts.rightColumn = {
      preview: {
        x: measurements.margins.left + columnWidth + measurements.spacing.columnGap,
        y: contentY,
        width: columnWidth,
        height: contentHeight
      },
      export: {
        x: measurements.margins.left + columnWidth + measurements.spacing.columnGap,
        y: contentY,
        width: columnWidth,
        height: contentHeight
      },
      tolerance: 0.01
    };
  }
  
  return layouts;
}

/**
 * Validate alignment between preview and export measurements
 */
export function validateAlignment(
  previewMeasurements: any,
  exportMeasurements: any,
  tolerance: number = 0.01
): {
  isAligned: boolean;
  discrepancies: string[];
  recommendations: string[];
} {
  const discrepancies: string[] = [];
  const recommendations: string[] = [];
  
  // Check position alignment
  if (Math.abs(previewMeasurements.x - exportMeasurements.x) > tolerance) {
    discrepancies.push(`X position mismatch: preview ${previewMeasurements.x}, export ${exportMeasurements.x}`);
    recommendations.push('Adjust X positioning calculation');
  }
  
  if (Math.abs(previewMeasurements.y - exportMeasurements.y) > tolerance) {
    discrepancies.push(`Y position mismatch: preview ${previewMeasurements.y}, export ${exportMeasurements.y}`);
    recommendations.push('Adjust Y positioning calculation');
  }
  
  // Check size alignment
  if (Math.abs(previewMeasurements.width - exportMeasurements.width) > tolerance) {
    discrepancies.push(`Width mismatch: preview ${previewMeasurements.width}, export ${exportMeasurements.width}`);
    recommendations.push('Adjust width calculation');
  }
  
  if (Math.abs(previewMeasurements.height - exportMeasurements.height) > tolerance) {
    discrepancies.push(`Height mismatch: preview ${previewMeasurements.height}, export ${exportMeasurements.height}`);
    recommendations.push('Adjust height calculation');
  }
  
  return {
    isAligned: discrepancies.length === 0,
    discrepancies,
    recommendations
  };
}

/**
 * Generate CSS styles for preview that match PowerPoint export
 */
export function generatePreviewCSS(
  measurements: StandardizedMeasurements,
  fontMapping: Record<string, FontMapping>,
  theme: ProfessionalTheme
): string {
  const dpi = 96; // Standard web DPI
  const inchesToPixels = (inches: number) => Math.round(inches * dpi);
  const pointsToPixels = (points: number) => Math.round(points * dpi / 72);
  
  return `
    .slide-preview {
      width: ${inchesToPixels(measurements.slideWidth)}px;
      height: ${inchesToPixels(measurements.slideHeight)}px;
      position: relative;
      background: ${theme.colors.background};
      font-family: ${fontMapping.primary.preview};
      box-sizing: border-box;
    }
    
    .slide-title {
      position: absolute;
      left: ${inchesToPixels(measurements.margins.left)}px;
      top: ${inchesToPixels(measurements.margins.top)}px;
      width: ${inchesToPixels(measurements.slideWidth - measurements.margins.left - measurements.margins.right)}px;
      font-size: ${pointsToPixels(measurements.typography.titleSize)}px;
      line-height: ${measurements.typography.lineHeight};
      font-family: ${fontMapping.heading.preview};
      color: ${theme.colors.text.primary};
      margin: 0;
      padding: 0;
    }
    
    .slide-content {
      position: absolute;
      left: ${inchesToPixels(measurements.margins.left)}px;
      top: ${inchesToPixels(measurements.margins.top + measurements.typography.titleSize * measurements.typography.lineHeight / 72 + measurements.spacing.sectionGap)}px;
      width: ${inchesToPixels(measurements.slideWidth - measurements.margins.left - measurements.margins.right)}px;
      font-size: ${pointsToPixels(measurements.typography.bodySize)}px;
      line-height: ${measurements.typography.lineHeight};
      color: ${theme.colors.text.primary};
    }
    
    .slide-column {
      width: ${inchesToPixels((measurements.slideWidth - measurements.margins.left - measurements.margins.right - measurements.spacing.columnGap) / 2)}px;
      display: inline-block;
      vertical-align: top;
    }
    
    .slide-column + .slide-column {
      margin-left: ${inchesToPixels(measurements.spacing.columnGap)}px;
    }
  `;
}

/**
 * Convert preview measurements to PowerPoint coordinates
 */
export function convertToPowerPointCoordinates(
  previewMeasurements: { x: number; y: number; width: number; height: number },
  measurements: StandardizedMeasurements
): { x: number; y: number; w: number; h: number } {
  return {
    x: previewMeasurements.x,
    y: previewMeasurements.y,
    w: previewMeasurements.width,
    h: previewMeasurements.height
  };
}
