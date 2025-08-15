/**
 * Enhanced Table Styling System for Professional PowerPoint Generation
 * 
 * Provides advanced table formatting with professional styling, theme integration,
 * and modern data presentation aesthetics.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import type { ProfessionalTheme } from '../../professionalThemes';
import { createEnhancedColorPalette, getContextualColor, type EnhancedColorPalette } from './advancedColorManagement';

/**
 * Table style configuration
 */
export interface TableStyleConfig {
  headerStyle: {
    backgroundColor: string;
    textColor: string;
    fontSize: number;
    fontWeight: number;
    fontFamily: string;
    padding: number;
    borderColor: string;
    borderWidth: number;
  };
  bodyStyle: {
    backgroundColor: string;
    alternateBackgroundColor: string;
    textColor: string;
    fontSize: number;
    fontWeight: number;
    fontFamily: string;
    padding: number;
    borderColor: string;
    borderWidth: number;
  };
  footerStyle?: {
    backgroundColor: string;
    textColor: string;
    fontSize: number;
    fontWeight: number;
    fontFamily: string;
    padding: number;
    borderColor: string;
    borderWidth: number;
  };
  containerStyle: {
    borderRadius: number;
    shadow: {
      enabled: boolean;
      color: string;
      blur: number;
      offset: number;
      transparency: number;
    };
    margin: number;
  };
  columnStyles?: {
    [columnIndex: number]: {
      width?: number;
      alignment: 'left' | 'center' | 'right';
      backgroundColor?: string;
      textColor?: string;
      fontWeight?: number;
    };
  };
}

/**
 * Table layout options
 */
export interface TableLayoutOptions {
  style: 'modern' | 'corporate' | 'minimal' | 'striped' | 'bordered';
  size: 'compact' | 'normal' | 'spacious';
  headerPosition: 'top' | 'left' | 'both' | 'none';
  showFooter: boolean;
  alternateRows: boolean;
  highlightColumns?: number[];
  responsiveBreakpoint?: number;
}

/**
 * Create professional table styling based on theme
 */
export function createTableStyling(
  theme: ProfessionalTheme,
  options: TableLayoutOptions = { 
    style: 'modern', 
    size: 'normal', 
    headerPosition: 'top', 
    showFooter: false, 
    alternateRows: true 
  }
): TableStyleConfig {
  const palette = createEnhancedColorPalette(theme);
  
  // Size-based measurements
  const sizeConfig = {
    compact: { fontSize: 10, padding: 0.05, headerFontSize: 11 },
    normal: { fontSize: 12, padding: 0.08, headerFontSize: 13 },
    spacious: { fontSize: 14, padding: 0.12, headerFontSize: 15 }
  };
  
  const config = sizeConfig[options.size];
  
  // Base styling
  const baseStyle: TableStyleConfig = {
    headerStyle: {
      backgroundColor: getContextualColor('primary-text', palette).color,
      textColor: getContextualColor('background', palette).color,
      fontSize: config.headerFontSize,
      fontWeight: 600,
      fontFamily: 'Segoe UI, Arial, sans-serif',
      padding: config.padding + 0.02,
      borderColor: getContextualColor('border', palette).color,
      borderWidth: 1
    },
    bodyStyle: {
      backgroundColor: getContextualColor('background', palette).color,
      alternateBackgroundColor: getContextualColor('surface', palette).color,
      textColor: getContextualColor('primary-text', palette).color,
      fontSize: config.fontSize,
      fontWeight: 400,
      fontFamily: 'Segoe UI, Arial, sans-serif',
      padding: config.padding,
      borderColor: getContextualColor('border', palette).color,
      borderWidth: 0.5
    },
    containerStyle: {
      borderRadius: 4,
      shadow: {
        enabled: true,
        color: '000000',
        blur: 4,
        offset: 2,
        transparency: 90
      },
      margin: 0.1
    }
  };

  // Apply style-specific modifications
  switch (options.style) {
    case 'corporate':
      return {
        ...baseStyle,
        headerStyle: {
          ...baseStyle.headerStyle,
          backgroundColor: palette.primary.main,
          borderWidth: 2
        },
        bodyStyle: {
          ...baseStyle.bodyStyle,
          borderWidth: 1
        },
        containerStyle: {
          ...baseStyle.containerStyle,
          borderRadius: 2,
          shadow: {
            ...baseStyle.containerStyle.shadow,
            enabled: false
          }
        }
      };
    
    case 'minimal':
      return {
        ...baseStyle,
        headerStyle: {
          ...baseStyle.headerStyle,
          backgroundColor: 'transparent',
          textColor: getContextualColor('primary-text', palette).color,
          borderWidth: 0,
          fontWeight: 700
        },
        bodyStyle: {
          ...baseStyle.bodyStyle,
          alternateBackgroundColor: 'transparent',
          borderWidth: 0
        },
        containerStyle: {
          ...baseStyle.containerStyle,
          borderRadius: 0,
          shadow: {
            ...baseStyle.containerStyle.shadow,
            enabled: false
          }
        }
      };
    
    case 'striped':
      return {
        ...baseStyle,
        headerStyle: {
          ...baseStyle.headerStyle,
          backgroundColor: palette.accent.main,
          borderWidth: 0
        },
        bodyStyle: {
          ...baseStyle.bodyStyle,
          borderWidth: 0,
          alternateBackgroundColor: palette.neutral[50]
        },
        containerStyle: {
          ...baseStyle.containerStyle,
          borderRadius: 6
        }
      };
    
    case 'bordered':
      return {
        ...baseStyle,
        headerStyle: {
          ...baseStyle.headerStyle,
          borderWidth: 2,
          borderColor: palette.primary.main
        },
        bodyStyle: {
          ...baseStyle.bodyStyle,
          borderWidth: 1
        },
        containerStyle: {
          ...baseStyle.containerStyle,
          borderRadius: 0
        }
      };
    
    default: // modern
      return baseStyle;
  }
}

/**
 * Convert table style to PowerPoint table options
 */
export function tableStyleToPptOptions(
  style: TableStyleConfig,
  data: string[][],
  options: TableLayoutOptions
): any {
  const pptOptions: any = {
    fontSize: style.bodyStyle.fontSize,
    fontFace: extractPrimaryFont(style.bodyStyle.fontFamily),
    color: style.bodyStyle.textColor.replace('#', ''),
    fill: {
      color: style.bodyStyle.backgroundColor.replace('#', '')
    },
    margin: style.bodyStyle.padding,
    border: style.bodyStyle.borderWidth > 0 ? {
      color: style.bodyStyle.borderColor.replace('#', ''),
      width: style.bodyStyle.borderWidth
    } : undefined,
    rowH: calculateRowHeight(style, options.size),
    colW: calculateColumnWidths(data[0]?.length || 0)
  };

  // Add header styling if present
  if (options.headerPosition === 'top' || options.headerPosition === 'both') {
    pptOptions.headerRowStyle = {
      fontSize: style.headerStyle.fontSize,
      fontFace: extractPrimaryFont(style.headerStyle.fontFamily),
      color: style.headerStyle.textColor.replace('#', ''),
      fill: {
        color: style.headerStyle.backgroundColor.replace('#', '')
      },
      bold: true,
      border: style.headerStyle.borderWidth > 0 ? {
        color: style.headerStyle.borderColor.replace('#', ''),
        width: style.headerStyle.borderWidth
      } : undefined
    };
  }

  // Add alternating row colors
  if (options.alternateRows && style.bodyStyle.alternateBackgroundColor) {
    pptOptions.alternateRowFill = {
      color: style.bodyStyle.alternateBackgroundColor.replace('#', '')
    };
  }

  return pptOptions;
}

/**
 * Create responsive table layout with advanced optimization
 */
export function createResponsiveTableLayout(
  data: string[][],
  containerWidth: number,
  style: TableStyleConfig
): {
  columnWidths: number[];
  shouldWrap: boolean;
  recommendedFontSize: number;
  optimizedRowHeight: number;
  columnAlignments: ('left' | 'center' | 'right')[];
} {
  const numColumns = data[0]?.length || 0;
  const availableWidth = containerWidth - (style.containerStyle.margin * 2);
  const minColumnWidth = 0.8; // Minimum column width in inches

  // Calculate content-based column widths
  const contentWidths = calculateContentBasedWidths(data);
  const totalContentWidth = contentWidths.reduce((sum, width) => sum + width, 0);

  let columnWidths: number[];
  let shouldWrap = false;
  let recommendedFontSize = style.bodyStyle.fontSize;
  let optimizedRowHeight = calculateRowHeight(style, 'normal');

  if (totalContentWidth <= availableWidth) {
    // Content fits, use proportional widths
    columnWidths = contentWidths.map(width =>
      (width / totalContentWidth) * availableWidth
    );
  } else {
    // Content doesn't fit, use equal widths and consider wrapping
    const equalWidth = availableWidth / numColumns;

    if (equalWidth >= minColumnWidth) {
      columnWidths = new Array(numColumns).fill(equalWidth);
    } else {
      // Need to wrap or reduce font size
      columnWidths = new Array(numColumns).fill(minColumnWidth);
      shouldWrap = true;

      // Reduce font size to fit better
      const scaleFactor = Math.min(1, availableWidth / (numColumns * minColumnWidth));
      recommendedFontSize = Math.max(8, Math.round(style.bodyStyle.fontSize * scaleFactor));
      optimizedRowHeight = optimizedRowHeight * 1.2; // Increase row height for smaller text
    }
  }

  // Determine optimal column alignments based on content
  const columnAlignments = determineColumnAlignments(data);

  return {
    columnWidths,
    shouldWrap,
    recommendedFontSize,
    optimizedRowHeight,
    columnAlignments
  };
}

/**
 * Create advanced table styling with business context optimization
 */
export function createBusinessContextTableStyle(
  theme: ProfessionalTheme,
  context: 'financial' | 'comparison' | 'data' | 'summary' | 'timeline',
  options: TableLayoutOptions = {
    style: 'modern',
    size: 'normal',
    headerPosition: 'top',
    showFooter: false,
    alternateRows: true
  }
): TableStyleConfig {
  const baseStyle = createTableStyling(theme, options);

  switch (context) {
    case 'financial':
      // Financial tables need precision and clear hierarchy
      baseStyle.headerStyle.backgroundColor = theme.colors.primary;
      baseStyle.headerStyle.fontWeight = 700;
      baseStyle.bodyStyle.fontSize = Math.max(baseStyle.bodyStyle.fontSize, 11);
      baseStyle.columnStyles = {
        0: { alignment: 'left', fontWeight: 600 }, // Labels column
        1: { alignment: 'right', fontWeight: 400 }, // Numbers column
        2: { alignment: 'right', fontWeight: 400 }  // Additional numbers
      };
      break;

    case 'comparison':
      // Comparison tables need clear visual separation
      baseStyle.headerStyle.backgroundColor = theme.colors.accent;
      baseStyle.bodyStyle.alternateBackgroundColor = theme.colors.surface;
      baseStyle.containerStyle.borderRadius = 6;
      baseStyle.columnStyles = {
        0: { alignment: 'left', fontWeight: 600 }, // Feature column
        1: { alignment: 'center', backgroundColor: theme.colors.semantic?.success + '20' },
        2: { alignment: 'center', backgroundColor: theme.colors.semantic?.warning + '20' }
      };
      break;

    case 'data':
      // Data tables need maximum readability
      baseStyle.bodyStyle.fontSize = Math.max(baseStyle.bodyStyle.fontSize, 10);
      baseStyle.bodyStyle.borderWidth = 0.5;
      baseStyle.headerStyle.borderWidth = 1;
      baseStyle.containerStyle.shadow.enabled = false; // Clean look for data
      break;

    case 'summary':
      // Summary tables should be visually prominent
      baseStyle.headerStyle.fontSize = Math.max(baseStyle.headerStyle.fontSize, 14);
      baseStyle.headerStyle.fontWeight = 700;
      baseStyle.containerStyle.shadow.enabled = true;
      baseStyle.containerStyle.borderRadius = 8;
      break;

    case 'timeline':
      // Timeline tables need chronological clarity
      baseStyle.columnStyles = {
        0: { alignment: 'center', fontWeight: 600, width: 1.5 }, // Date column
        1: { alignment: 'left', fontWeight: 400 }, // Event column
        2: { alignment: 'left', fontWeight: 300 }  // Description column
      };
      baseStyle.bodyStyle.alternateBackgroundColor = 'transparent';
      break;
  }

  return baseStyle;
}

/**
 * Determine optimal column alignments based on content analysis
 */
function determineColumnAlignments(data: string[][]): ('left' | 'center' | 'right')[] {
  if (!data.length) return [];

  const numColumns = data[0].length;
  const alignments: ('left' | 'center' | 'right')[] = [];

  for (let col = 0; col < numColumns; col++) {
    let numericCount = 0;
    let totalCells = 0;

    for (let row = 1; row < data.length; row++) { // Skip header row
      const cellContent = data[row][col] || '';
      totalCells++;

      // Check if content is numeric (including currency, percentages)
      if (/^[\d\s\$\€\£\¥\%\,\.\-\+]+$/.test(cellContent.trim())) {
        numericCount++;
      }
    }

    // Determine alignment based on content type
    if (numericCount / totalCells > 0.7) {
      alignments.push('right'); // Numeric data
    } else if (col === 0) {
      alignments.push('left'); // First column (usually labels)
    } else {
      alignments.push('center'); // Mixed or text content
    }
  }

  return alignments;
}

/**
 * Create table styling optimized for data density
 */
export function createDataDensityOptimizedTable(
  theme: ProfessionalTheme,
  rowCount: number,
  columnCount: number,
  options: TableLayoutOptions = {
    style: 'modern',
    size: 'normal',
    headerPosition: 'top',
    showFooter: false,
    alternateRows: true
  }
): TableStyleConfig {
  let optimizedOptions = { ...options };

  // Adjust based on data density
  if (rowCount > 15 || columnCount > 6) {
    optimizedOptions.size = 'compact';
    optimizedOptions.style = 'minimal';
  }

  if (rowCount > 25) {
    optimizedOptions.alternateRows = true; // Ensure alternating rows for readability
  }

  if (columnCount > 8) {
    optimizedOptions.size = 'compact';
  }

  const baseStyle = createTableStyling(theme, optimizedOptions);

  // Further optimizations for high-density tables
  if (rowCount > 20) {
    baseStyle.bodyStyle.fontSize = Math.max(9, baseStyle.bodyStyle.fontSize - 1);
    baseStyle.bodyStyle.padding = Math.max(0.03, baseStyle.bodyStyle.padding - 0.02);
  }

  if (columnCount > 6) {
    baseStyle.headerStyle.fontSize = Math.max(10, baseStyle.headerStyle.fontSize - 1);
    baseStyle.containerStyle.shadow.enabled = false; // Reduce visual complexity
  }

  return baseStyle;
}

/**
 * Utility functions
 */
function calculateRowHeight(style: TableStyleConfig, size: 'compact' | 'normal' | 'spacious'): number {
  const baseHeight = {
    compact: 0.3,
    normal: 0.4,
    spacious: 0.5
  };

  return baseHeight[size] + (style.bodyStyle.padding * 2);
}

function calculateColumnWidths(numColumns: number): number[] {
  const totalWidth = 8.5; // Available slide width
  const equalWidth = totalWidth / numColumns;
  return new Array(numColumns).fill(equalWidth);
}

function calculateContentBasedWidths(data: string[][]): number[] {
  if (!data.length) return [];

  const numColumns = data[0].length;
  const columnWidths: number[] = [];

  for (let col = 0; col < numColumns; col++) {
    let maxLength = 0;
    let hasNumericData = false;

    for (let row = 0; row < data.length; row++) {
      const cellContent = data[row][col] || '';
      maxLength = Math.max(maxLength, cellContent.length);

      // Check for numeric data to adjust width
      if (/^[\d\s\$\€\£\¥\%\,\.\-\+]+$/.test(cellContent.trim())) {
        hasNumericData = true;
      }
    }

    // Estimate width based on character count and content type
    let estimatedWidth = Math.max(0.8, Math.min(3.0, maxLength * 0.08));

    // Adjust for numeric columns (usually need less space)
    if (hasNumericData) {
      estimatedWidth = Math.max(0.6, estimatedWidth * 0.8);
    }

    columnWidths.push(estimatedWidth);
  }

  return columnWidths;
}

function extractPrimaryFont(fontStack: string): string {
  const fonts = fontStack.split(',').map(f => f.trim().replace(/['"]/g, ''));
  const preferredFonts = ['Segoe UI', 'Calibri', 'Arial', 'Helvetica'];

  for (const preferred of preferredFonts) {
    if (fonts.includes(preferred)) {
      return preferred;
    }
  }

  return fonts[0] || 'Arial';
}
