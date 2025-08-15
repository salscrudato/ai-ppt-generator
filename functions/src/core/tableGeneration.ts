/**
 * Native Table Generation System
 * 
 * Comprehensive system for generating PowerPoint tables using PptxGenJS
 * with automatic data extraction, theme-aware styling, and professional layouts.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import pptxgen from 'pptxgenjs';
import { SlideSpec } from '../schema';
import { ProfessionalTheme } from '../professionalThemes';
import { ModernTheme } from './theme/modernThemes';
import { safeColorFormat } from './theme/utilities';

/**
 * Table configuration interface
 */
export interface TableConfig {
  headers: string[];
  rows: string[][];
  position: { x: number; y: number; w: number; h: number };
  theme: ProfessionalTheme | ModernTheme;
  title?: string;
  showHeaders?: boolean;
  alternateRowColors?: boolean;
  borderStyle?: 'none' | 'light' | 'medium' | 'heavy';
  headerStyle?: 'default' | 'accent' | 'primary';
}

/**
 * Table data extraction result
 */
export interface ExtractedTableData {
  hasTableData: boolean;
  headers: string[];
  rows: string[][];
  confidence: number;
  suggestedTitle?: string;
}

/**
 * Add a native PowerPoint table to a slide
 */
export function addNativeTable(slide: pptxgen.Slide, config: TableConfig): void {
  const isModern = 'palette' in config.theme;
  
  // Get theme colors for table styling
  const themeColors = getThemeTableColors(config.theme);
  
  // Prepare table data
  const tableData = [];
  
  // Add headers if enabled
  if (config.showHeaders !== false && config.headers.length > 0) {
    tableData.push(config.headers);
  }
  
  // Add data rows
  tableData.push(...config.rows);
  
  // Calculate column widths
  const totalWidth = config.position.w;
  const columnWidth = totalWidth / config.headers.length;
  
  // Table styling options
  const tableOptions: any = {
    x: config.position.x,
    y: config.position.y,
    w: config.position.w,
    h: config.position.h,
    
    // Column widths
    colW: Array(config.headers.length).fill(columnWidth),
    
    // Border styling
    border: getBorderStyle(config.borderStyle || 'light', themeColors),
    
    // Font styling
    fontSize: isModern ? 12 : 11,
    fontFace: isModern
      ? (config.theme as ModernTheme).typography.fontFamilies.body
      : (config.theme as ProfessionalTheme).typography.body.fontFamily,
    color: safeColorFormat(isModern 
      ? (config.theme as ModernTheme).palette.text.primary
      : (config.theme as ProfessionalTheme).colors.text.primary),
    
    // Alignment
    align: 'center',
    valign: 'middle',
    
    // Margins
    margin: [0.1, 0.1, 0.1, 0.1]
  };

  // Apply header styling
  if (config.showHeaders !== false && config.headers.length > 0) {
    const headerStyle = getHeaderStyle(config.headerStyle || 'default', themeColors, isModern);
    tableOptions.rowH = [0.6, ...Array(config.rows.length).fill(0.5)]; // Header row taller
    
    // Apply header-specific styling to first row
    tableData[0] = tableData[0].map((cell: string) => ({
      text: cell,
      options: {
        ...headerStyle,
        bold: true,
        fontSize: (tableOptions.fontSize || 12) + 1
      }
    }));
  }

  // Apply alternating row colors
  if (config.alternateRowColors !== false) {
    const startIndex = config.showHeaders !== false ? 1 : 0;
    for (let i = startIndex; i < tableData.length; i++) {
      if ((i - startIndex) % 2 === 1) {
        // Apply alternate row styling
        if (Array.isArray(tableData[i])) {
          tableData[i] = (tableData[i] as string[]).map((cell: string) => ({
            text: cell,
            options: {
              fill: {
                color: safeColorFormat(themeColors.alternateRow),
                transparency: 10
              }
            }
          }));
        }
      }
    }
  }

  // Add title if provided
  if (config.title) {
    slide.addText(config.title, {
      x: config.position.x,
      y: config.position.y - 0.5,
      w: config.position.w,
      h: 0.4,
      fontSize: isModern ? 16 : 14,
      bold: true,
      color: safeColorFormat(isModern 
        ? (config.theme as ModernTheme).palette.text.primary
        : (config.theme as ProfessionalTheme).colors.text.primary),
      align: 'center',
      fontFace: isModern
        ? (config.theme as ModernTheme).typography.fontFamilies.heading
        : (config.theme as ProfessionalTheme).typography.headings.fontFamily
    });
  }

  // Add the table to the slide
  slide.addTable(tableData as any, tableOptions);
}

/**
 * Extract table data from slide content
 */
export function extractTableDataFromSlide(spec: SlideSpec): ExtractedTableData {
  const result: ExtractedTableData = {
    hasTableData: false,
    headers: [],
    rows: [],
    confidence: 0
  };

  // Check if slide already has table data
  if (spec.comparisonTable) {
    result.hasTableData = true;
    result.headers = spec.comparisonTable.headers;
    result.rows = spec.comparisonTable.rows;
    result.confidence = 100;
    result.suggestedTitle = `${spec.title} - Comparison`;
    return result;
  }

  // Extract table data from bullets
  if (spec.bullets && spec.bullets.length >= 3) {
    const tableData = extractTableFromBullets(spec.bullets);
    if (tableData.hasTable) {
      result.hasTableData = true;
      result.headers = tableData.headers;
      result.rows = tableData.rows;
      result.confidence = tableData.confidence;
      result.suggestedTitle = spec.title;
    }
  }

  // Extract table data from two-column layout
  if (spec.left && spec.right) {
    const tableData = extractTableFromColumns(spec.left, spec.right);
    if (tableData.hasTable) {
      result.hasTableData = true;
      result.headers = tableData.headers;
      result.rows = tableData.rows;
      result.confidence = tableData.confidence;
      result.suggestedTitle = `${spec.title} - Comparison`;
    }
  }

  // Extract table data from metrics
  if (spec.left?.metrics || spec.right?.metrics) {
    const metrics = [...(spec.left?.metrics || []), ...(spec.right?.metrics || [])];
    if (metrics.length >= 2) {
      result.hasTableData = true;
      result.headers = ['Metric', 'Value', 'Unit'];
      result.rows = metrics.map(metric => [
        metric.label,
        metric.value,
        metric.unit || ''
      ]);
      result.confidence = 90;
      result.suggestedTitle = `${spec.title} - Metrics`;
    }
  }

  return result;
}

/**
 * Extract table data from bullet points
 */
function extractTableFromBullets(bullets: string[]): {
  hasTable: boolean;
  headers: string[];
  rows: string[][];
  confidence: number;
} {
  const result: {
    hasTable: boolean;
    headers: string[];
    rows: string[][];
    confidence: number;
  } = { hasTable: false, headers: [], rows: [], confidence: 0 };
  
  // Look for patterns like "Category: Value" or "Item | Value | Description"
  const colonPattern = /^([^:]+):\s*(.+)$/;
  const pipePattern = /^([^|]+)\|([^|]+)(?:\|(.+))?$/;
  
  const colonMatches = bullets.filter(bullet => colonPattern.test(bullet));
  const pipeMatches = bullets.filter(bullet => pipePattern.test(bullet));
  
  if (colonMatches.length >= 3) {
    // Create two-column table from colon-separated data
    result.hasTable = true;
    result.headers = ['Category', 'Value'];
    result.rows = colonMatches.map(bullet => {
      const match = bullet.match(colonPattern);
      return match ? [match[1].trim(), match[2].trim()] : ['', ''];
    });
    result.confidence = Math.min(colonMatches.length * 20, 90);
  } else if (pipeMatches.length >= 2) {
    // Create table from pipe-separated data
    result.hasTable = true;
    const firstMatch = bullets[0].match(pipePattern);
    const columnCount = firstMatch ? (firstMatch[3] ? 3 : 2) : 2;
    
    result.headers = columnCount === 3 
      ? ['Item', 'Value', 'Description']
      : ['Item', 'Value'];
    
    result.rows = pipeMatches.map(bullet => {
      const match = bullet.match(pipePattern);
      if (match) {
        return columnCount === 3 
          ? [match[1].trim(), match[2].trim(), (match[3] || '').trim()]
          : [match[1].trim(), match[2].trim()];
      }
      return Array(columnCount).fill('');
    });
    result.confidence = Math.min(pipeMatches.length * 25, 95);
  }
  
  return result;
}

/**
 * Extract table data from two-column layout
 */
function extractTableFromColumns(left: any, right: any): {
  hasTable: boolean;
  headers: string[];
  rows: string[][];
  confidence: number;
} {
  const result: {
    hasTable: boolean;
    headers: string[];
    rows: string[][];
    confidence: number;
  } = { hasTable: false, headers: [], rows: [], confidence: 0 };
  
  const leftBullets = left.bullets || [];
  const rightBullets = right.bullets || [];
  
  if (leftBullets.length > 0 && rightBullets.length > 0) {
    const maxLength = Math.max(leftBullets.length, rightBullets.length);
    
    result.hasTable = true;
    result.headers = [left.heading || 'Left', right.heading || 'Right'];
    result.rows = [];
    
    for (let i = 0; i < maxLength; i++) {
      result.rows.push([
        leftBullets[i] || '',
        rightBullets[i] || ''
      ]);
    }
    
    result.confidence = 85;
  }
  
  return result;
}

/**
 * Get theme-appropriate table colors
 */
function getThemeTableColors(theme: ProfessionalTheme | ModernTheme) {
  const isModern = 'palette' in theme;
  
  if (isModern) {
    const modernTheme = theme as ModernTheme;
    return {
      headerBg: modernTheme.palette.primary,
      headerText: modernTheme.palette.background,
      border: modernTheme.palette.borders.medium,
      alternateRow: modernTheme.palette.surface,
      text: modernTheme.palette.text.primary
    };
  } else {
    const professionalTheme = theme as ProfessionalTheme;
    return {
      headerBg: professionalTheme.colors.primary,
      headerText: professionalTheme.colors.text.inverse,
      border: professionalTheme.colors.borders.medium,
      alternateRow: professionalTheme.colors.surface,
      text: professionalTheme.colors.text.primary
    };
  }
}

/**
 * Get border style configuration
 */
function getBorderStyle(style: 'none' | 'light' | 'medium' | 'heavy', colors: any) {
  const borderConfigs = {
    none: { type: 'none' },
    light: { pt: 0.5, color: safeColorFormat(colors.border) },
    medium: { pt: 1, color: safeColorFormat(colors.border) },
    heavy: { pt: 2, color: safeColorFormat(colors.border) }
  };
  
  return borderConfigs[style];
}

/**
 * Get header style configuration
 */
function getHeaderStyle(style: 'default' | 'accent' | 'primary', colors: any, isModern: boolean) {
  const styles = {
    default: {
      fill: { color: safeColorFormat(colors.alternateRow), transparency: 20 },
      color: safeColorFormat(colors.text)
    },
    accent: {
      fill: { color: safeColorFormat(colors.headerBg), transparency: 30 },
      color: safeColorFormat(colors.text)
    },
    primary: {
      fill: { color: safeColorFormat(colors.headerBg) },
      color: safeColorFormat(colors.headerText)
    }
  };
  
  return styles[style];
}
