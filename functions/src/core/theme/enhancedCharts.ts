/**
 * Enhanced Chart and Table Styling System for Professional PowerPoint Generation
 * 
 * Provides sophisticated styling for charts, tables, and data visualizations
 * with modern design principles and accessibility considerations.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import pptxgen from 'pptxgenjs';
import { ProfessionalTheme } from '../../professionalThemes';
import { generateColorBlindFriendlyPalette } from './colorAccessibility';

/**
 * Chart style configuration
 */
export interface ChartStyleConfig {
  colorScheme: 'theme' | 'colorblind-safe' | 'monochrome' | 'vibrant';
  showDataLabels: boolean;
  showLegend: boolean;
  showGridlines: boolean;
  borderRadius: number;
  shadowIntensity: 'none' | 'subtle' | 'medium' | 'strong';
  animation: boolean;
}

/**
 * Table style configuration
 */
export interface TableStyleConfig {
  headerStyle: 'bold' | 'colored' | 'minimal';
  alternatingRows: boolean;
  borderStyle: 'none' | 'minimal' | 'full';
  cellPadding: number;
  fontSize: number;
  colorScheme: 'theme' | 'neutral' | 'accent';
}

/**
 * Default chart style configuration
 */
export const DEFAULT_CHART_STYLE: ChartStyleConfig = {
  colorScheme: 'theme',
  showDataLabels: true,
  showLegend: true,
  showGridlines: true,
  borderRadius: 4,
  shadowIntensity: 'subtle',
  animation: false // PowerPoint handles animations
};

/**
 * Default table style configuration
 */
export const DEFAULT_TABLE_STYLE: TableStyleConfig = {
  headerStyle: 'colored',
  alternatingRows: true,
  borderStyle: 'minimal',
  cellPadding: 0.1,
  fontSize: 12,
  colorScheme: 'theme'
};

/**
 * Generate theme-based color palette for charts
 */
export function generateChartColorPalette(
  theme: ProfessionalTheme,
  colorScheme: ChartStyleConfig['colorScheme'] = 'theme',
  count: number = 8
): string[] {
  const baseColors = [
    theme.colors.primary,
    theme.colors.secondary,
    theme.colors.accent,
    theme.colors.semantic.success,
    theme.colors.semantic.warning,
    theme.colors.semantic.error,
    theme.colors.semantic.info,
    theme.colors.text.secondary
  ];

  switch (colorScheme) {
    case 'colorblind-safe':
      return generateColorBlindFriendlyPalette(baseColors).slice(0, count);
    
    case 'monochrome':
      return generateMonochromeColors(theme.colors.primary, count);
    
    case 'vibrant':
      return generateVibrantColors(theme, count);
    
    case 'theme':
    default:
      return baseColors.slice(0, count);
  }
}

/**
 * Generate monochrome color variations
 */
function generateMonochromeColors(baseColor: string, count: number): string[] {
  const colors: string[] = [];
  const baseRgb = hexToRgb(baseColor);
  
  if (!baseRgb) return [baseColor];
  
  for (let i = 0; i < count; i++) {
    const factor = 0.2 + (0.8 * i) / (count - 1); // Range from 20% to 100%
    const adjustedColor = {
      r: Math.round(baseRgb.r * factor),
      g: Math.round(baseRgb.g * factor),
      b: Math.round(baseRgb.b * factor)
    };
    colors.push(rgbToHex(adjustedColor));
  }
  
  return colors;
}

/**
 * Generate vibrant color palette
 */
function generateVibrantColors(theme: ProfessionalTheme, count: number): string[] {
  const vibrantPalette = [
    '#FF6B6B', // Coral Red
    '#4ECDC4', // Turquoise
    '#45B7D1', // Sky Blue
    '#96CEB4', // Mint Green
    '#FFEAA7', // Warm Yellow
    '#DDA0DD', // Plum
    '#98D8C8', // Seafoam
    '#F7DC6F'  // Light Gold
  ];
  
  return vibrantPalette.slice(0, count);
}

/**
 * Helper functions for color manipulation
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgbToHex(rgb: { r: number; g: number; b: number }): string {
  return "#" + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1);
}

/**
 * Create enhanced chart with professional styling
 */
export function createEnhancedChart(
  slide: pptxgen.Slide,
  chartData: any,
  position: { x: number; y: number; w: number; h: number },
  theme: ProfessionalTheme,
  style: Partial<ChartStyleConfig> = {}
): void {
  const chartStyle = { ...DEFAULT_CHART_STYLE, ...style };
  const colors = generateChartColorPalette(theme, chartStyle.colorScheme, 8);
  
  try {
    // Prepare chart options
    const chartOptions: any = {
      x: position.x,
      y: position.y,
      w: position.w,
      h: position.h,
      chartColors: colors.map(color => color.replace('#', '')),
      showLegend: chartStyle.showLegend,
      showValue: chartStyle.showDataLabels,
      showTitle: true,
      titleFontSize: 16,
      titleColor: theme.colors.text.primary.replace('#', ''),
      titleFontFace: 'Segoe UI',
      legendPos: 'r', // Right position
      legendFontSize: 11,
      legendColor: theme.colors.text.secondary.replace('#', ''),
      dataLabelFontSize: 10,
      dataLabelColor: theme.colors.text.primary.replace('#', ''),
      border: {
        pt: 1,
        color: theme.colors.borders.light.replace('#', '')
      }
    };
    
    // Add gridlines styling if enabled
    if (chartStyle.showGridlines) {
      chartOptions.catGridLine = {
        color: theme.colors.borders.light.replace('#', ''),
        style: 'solid',
        size: 0.5
      };
      chartOptions.valGridLine = {
        color: theme.colors.borders.light.replace('#', ''),
        style: 'solid',
        size: 0.5
      };
    }
    
    // Add shadow if specified
    if (chartStyle.shadowIntensity !== 'none') {
      const shadowOpacity = {
        subtle: 0.1,
        medium: 0.15,
        strong: 0.2
      }[chartStyle.shadowIntensity];
      
      chartOptions.shadow = {
        type: 'outer',
        blur: 8,
        offset: 4,
        color: '000000',
        opacity: shadowOpacity
      };
    }
    
    // Create the chart
    slide.addChart(chartData.type, chartData.data, chartOptions);
    
    console.log('✅ Enhanced chart created with professional styling');
  } catch (error) {
    console.warn('⚠️ Failed to create enhanced chart:', error);
    // Fallback to basic chart
    slide.addChart(chartData.type, chartData.data, {
      x: position.x,
      y: position.y,
      w: position.w,
      h: position.h
    });
  }
}

/**
 * Create enhanced table with professional styling
 */
export function createEnhancedTable(
  slide: pptxgen.Slide,
  tableData: { headers: string[]; rows: string[][] },
  position: { x: number; y: number; w: number; h: number },
  theme: ProfessionalTheme,
  style: Partial<TableStyleConfig> = {}
): void {
  const tableStyle = { ...DEFAULT_TABLE_STYLE, ...style };
  
  try {
    // Prepare table data with styling
    const tableRows: any[] = [];
    
    // Add header row
    const headerRow = tableData.headers.map(header => ({
      text: header,
      options: {
        fontSize: tableStyle.fontSize + 1,
        fontFace: 'Segoe UI',
        bold: tableStyle.headerStyle === 'bold' || tableStyle.headerStyle === 'colored',
        color: tableStyle.headerStyle === 'colored' ? 
          theme.colors.text.inverse.replace('#', '') : 
          theme.colors.text.primary.replace('#', ''),
        fill: tableStyle.headerStyle === 'colored' ? 
          { color: theme.colors.primary.replace('#', '') } : 
          { color: theme.colors.surface.replace('#', '') },
        align: 'center',
        valign: 'middle'
      }
    }));
    tableRows.push(headerRow);
    
    // Add data rows
    tableData.rows.forEach((row, rowIndex) => {
      const isAlternating = tableStyle.alternatingRows && rowIndex % 2 === 1;
      const tableRow = row.map(cell => ({
        text: cell,
        options: {
          fontSize: tableStyle.fontSize,
          fontFace: 'Segoe UI',
          color: theme.colors.text.primary.replace('#', ''),
          fill: isAlternating ? 
            { color: theme.colors.surface.replace('#', '') } : 
            { color: theme.colors.background.replace('#', '') },
          align: 'left',
          valign: 'middle'
        }
      }));
      tableRows.push(tableRow);
    });
    
    // Table options
    const tableOptions: any = {
      x: position.x,
      y: position.y,
      w: position.w,
      h: position.h,
      margin: tableStyle.cellPadding,
      colW: Array(tableData.headers.length).fill(position.w / tableData.headers.length)
    };
    
    // Add borders if specified
    if (tableStyle.borderStyle !== 'none') {
      const borderColor = theme.colors.borders.medium.replace('#', '');
      const borderWidth = tableStyle.borderStyle === 'full' ? 1 : 0.5;
      
      tableOptions.border = {
        type: 'solid',
        color: borderColor,
        pt: borderWidth
      };
    }
    
    // Create the table
    slide.addTable(tableRows, tableOptions);
    
    console.log('✅ Enhanced table created with professional styling');
  } catch (error) {
    console.warn('⚠️ Failed to create enhanced table:', error);
    // Fallback to basic table
    const basicRows = [tableData.headers, ...tableData.rows];
    slide.addTable(basicRows, {
      x: position.x,
      y: position.y,
      w: position.w,
      h: position.h
    });
  }
}

/**
 * Create data visualization card with metrics
 */
export function createMetricsCard(
  slide: pptxgen.Slide,
  metrics: { label: string; value: string; change?: string; trend?: 'up' | 'down' | 'neutral' }[],
  position: { x: number; y: number; w: number; h: number },
  theme: ProfessionalTheme
): void {
  try {
    // Background card
    slide.addShape('rect', {
      x: position.x,
      y: position.y,
      w: position.w,
      h: position.h,
      fill: { color: theme.colors.surface.replace('#', '') },
      line: {
        color: theme.colors.borders.light.replace('#', ''),
        width: 1
      },
      rectRadius: 0.1,
      shadow: {
        type: 'outer',
        blur: 4,
        offset: 2,
        color: '000000',
        opacity: 0.1
      }
    });
    
    // Add metrics
    const metricsPerRow = Math.ceil(Math.sqrt(metrics.length));
    const cellWidth = position.w / metricsPerRow;
    const cellHeight = position.h / Math.ceil(metrics.length / metricsPerRow);
    
    metrics.forEach((metric, index) => {
      const row = Math.floor(index / metricsPerRow);
      const col = index % metricsPerRow;
      const x = position.x + col * cellWidth + 0.1;
      const y = position.y + row * cellHeight + 0.1;
      
      // Metric label
      slide.addText(metric.label, {
        x, y,
        w: cellWidth - 0.2,
        h: cellHeight * 0.3,
        fontSize: 10,
        color: theme.colors.text.secondary.replace('#', ''),
        fontFace: 'Segoe UI',
        align: 'center'
      });
      
      // Metric value
      slide.addText(metric.value, {
        x, y: y + cellHeight * 0.3,
        w: cellWidth - 0.2,
        h: cellHeight * 0.4,
        fontSize: 16,
        color: theme.colors.text.primary.replace('#', ''),
        fontFace: 'Segoe UI',
        bold: true,
        align: 'center'
      });
      
      // Trend indicator
      if (metric.change) {
        const trendColor = metric.trend === 'up' ? theme.colors.semantic.success :
                          metric.trend === 'down' ? theme.colors.semantic.error :
                          theme.colors.text.secondary;
        
        slide.addText(metric.change, {
          x, y: y + cellHeight * 0.7,
          w: cellWidth - 0.2,
          h: cellHeight * 0.3,
          fontSize: 9,
          color: trendColor.replace('#', ''),
          fontFace: 'Segoe UI',
          align: 'center'
        });
      }
    });
    
    console.log('✅ Enhanced metrics card created');
  } catch (error) {
    console.warn('⚠️ Failed to create metrics card:', error);
  }
}
