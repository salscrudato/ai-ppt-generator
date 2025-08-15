/**
 * Enhanced Chart Styling System for Professional PowerPoint Generation
 * 
 * Provides advanced chart styling with theme integration, professional formatting,
 * and modern data visualization aesthetics.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import type { ProfessionalTheme } from '../../professionalThemes';
import { createEnhancedColorPalette, getContextualColor, type EnhancedColorPalette } from './advancedColorManagement';

/**
 * Chart style configuration
 */
export interface ChartStyleConfig {
  colors: string[];
  backgroundColor: string;
  gridColor: string;
  textColor: string;
  titleStyle: {
    fontSize: number;
    fontWeight: number;
    color: string;
    fontFamily: string;
  };
  legendStyle: {
    fontSize: number;
    color: string;
    fontFamily: string;
    position: 'top' | 'bottom' | 'left' | 'right';
  };
  axisStyle: {
    fontSize: number;
    color: string;
    fontFamily: string;
    lineColor: string;
    lineWidth: number;
  };
  dataLabelStyle: {
    fontSize: number;
    color: string;
    fontFamily: string;
    showValues: boolean;
    showPercentages: boolean;
  };
  shadow: {
    enabled: boolean;
    color: string;
    blur: number;
    offset: number;
    transparency: number;
  };
  borderRadius: number;
  transparency: number;
}

/**
 * Chart type specific configurations
 */
export interface ChartTypeConfig {
  bar: ChartStyleConfig;
  column: ChartStyleConfig;
  line: ChartStyleConfig;
  pie: ChartStyleConfig;
  doughnut: ChartStyleConfig;
  area: ChartStyleConfig;
  scatter: ChartStyleConfig;
}

/**
 * Create professional chart styling based on theme
 */
export function createChartStyling(
  theme: ProfessionalTheme,
  chartType: keyof ChartTypeConfig = 'column'
): ChartStyleConfig {
  const palette = createEnhancedColorPalette(theme);
  
  // Base configuration
  const baseConfig: ChartStyleConfig = {
    colors: generateChartColorPalette(palette, chartType),
    backgroundColor: getContextualColor('background', palette).color,
    gridColor: getContextualColor('border', palette).color,
    textColor: getContextualColor('primary-text', palette).color,
    titleStyle: {
      fontSize: 16,
      fontWeight: 600,
      color: getContextualColor('primary-text', palette).color,
      fontFamily: 'Segoe UI, Arial, sans-serif'
    },
    legendStyle: {
      fontSize: 12,
      color: getContextualColor('secondary-text', palette).color,
      fontFamily: 'Segoe UI, Arial, sans-serif',
      position: 'bottom'
    },
    axisStyle: {
      fontSize: 11,
      color: getContextualColor('secondary-text', palette).color,
      fontFamily: 'Segoe UI, Arial, sans-serif',
      lineColor: getContextualColor('border', palette).color,
      lineWidth: 1
    },
    dataLabelStyle: {
      fontSize: 10,
      color: getContextualColor('primary-text', palette).color,
      fontFamily: 'Segoe UI, Arial, sans-serif',
      showValues: true,
      showPercentages: false
    },
    shadow: {
      enabled: true,
      color: '000000',
      blur: 4,
      offset: 2,
      transparency: 85
    },
    borderRadius: 4,
    transparency: 0
  };

  // Chart type specific adjustments
  switch (chartType) {
    case 'pie':
    case 'doughnut':
      return {
        ...baseConfig,
        dataLabelStyle: {
          ...baseConfig.dataLabelStyle,
          showPercentages: true,
          showValues: false
        },
        legendStyle: {
          ...baseConfig.legendStyle,
          position: 'right'
        }
      };
    
    case 'line':
    case 'area':
      return {
        ...baseConfig,
        colors: generateLineChartColors(palette),
        dataLabelStyle: {
          ...baseConfig.dataLabelStyle,
          showValues: false
        }
      };
    
    case 'scatter':
      return {
        ...baseConfig,
        colors: generateScatterChartColors(palette),
        dataLabelStyle: {
          ...baseConfig.dataLabelStyle,
          showValues: false
        }
      };
    
    default:
      return baseConfig;
  }
}

/**
 * Generate harmonious color palette for charts
 */
function generateChartColorPalette(palette: EnhancedColorPalette, chartType: string): string[] {
  const baseColors = [
    palette.primary.main,
    palette.secondary.main,
    palette.accent.main,
    palette.semantic.success.main,
    palette.semantic.warning.main,
    palette.semantic.info.main
  ];

  // Add variations for more data series
  const extendedColors: string[] = [];
  
  baseColors.forEach((color, index) => {
    extendedColors.push(color);
    
    // Add lighter and darker variations
    if (index < 3) { // Only for primary colors
      extendedColors.push(lightenColor(color, 0.2));
      extendedColors.push(darkenColor(color, 0.2));
    }
  });

  return extendedColors.slice(0, 12);
}

/**
 * Generate colors optimized for line charts
 */
function generateLineChartColors(palette: EnhancedColorPalette): string[] {
  return [
    palette.primary.main,
    palette.accent.main,
    palette.secondary.main,
    palette.semantic.success.main,
    palette.semantic.warning.main,
    palette.semantic.error.main,
    palette.primary.dark,
    palette.accent.dark
  ];
}

/**
 * Generate colors optimized for scatter charts
 */
function generateScatterChartColors(palette: EnhancedColorPalette): string[] {
  return [
    palette.primary.main,
    palette.accent.main,
    palette.secondary.main,
    palette.semantic.info.main
  ];
}

/**
 * Convert chart style to PowerPoint chart options with enhanced features
 */
export function chartStyleToPptOptions(style: ChartStyleConfig, chartData: any): any {
  const options = {
    chartColors: style.colors,
    titleColor: style.titleStyle.color.replace('#', ''),
    titleFontSize: style.titleStyle.fontSize,
    titleFontFace: extractPrimaryFont(style.titleStyle.fontFamily),
    titleBold: style.titleStyle.fontWeight >= 600,
    showLegend: true,
    legendColor: style.legendStyle.color.replace('#', ''),
    legendFontSize: style.legendStyle.fontSize,
    legendFontFace: extractPrimaryFont(style.legendStyle.fontFamily),
    legendPos: style.legendStyle.position,
    showDataTable: style.dataLabelStyle.showValues,
    dataLabelColor: style.dataLabelStyle.color.replace('#', ''),
    dataLabelFontSize: style.dataLabelStyle.fontSize,
    dataLabelFontFace: extractPrimaryFont(style.dataLabelStyle.fontFamily),
    showValue: style.dataLabelStyle.showValues,
    showPercent: style.dataLabelStyle.showPercentages,
    catAxisLabelColor: style.axisStyle.color.replace('#', ''),
    catAxisLabelFontSize: style.axisStyle.fontSize,
    catAxisLabelFontFace: extractPrimaryFont(style.axisStyle.fontFamily),
    valAxisLabelColor: style.axisStyle.color.replace('#', ''),
    valAxisLabelFontSize: style.axisStyle.fontSize,
    valAxisLabelFontFace: extractPrimaryFont(style.axisStyle.fontFamily),
    catGridLine: {
      color: style.gridColor.replace('#', ''),
      width: style.axisStyle.lineWidth,
      transparency: 70
    },
    valGridLine: {
      color: style.gridColor.replace('#', ''),
      width: style.axisStyle.lineWidth,
      transparency: 70
    },
    catAxisLineShow: true,
    valAxisLineShow: true,
    catAxisLineColor: style.axisStyle.lineColor.replace('#', ''),
    valAxisLineColor: style.axisStyle.lineColor.replace('#', ''),
    plotArea: {
      fill: {
        color: style.backgroundColor.replace('#', ''),
        transparency: style.transparency
      },
      border: {
        color: style.gridColor.replace('#', ''),
        width: 0.5
      }
    }
  };

  // Add shadow if enabled (as additional property)
  if (style.shadow.enabled) {
    (options as any).shadow = {
      type: 'outer',
      color: style.shadow.color,
      blur: style.shadow.blur,
      offset: style.shadow.offset,
      angle: 45,
      transparency: style.shadow.transparency
    };
  }

  // Add border radius for modern charts (as additional properties)
  if (style.borderRadius > 0) {
    (options as any).barGrouping = 'clustered';
    (options as any).barDir = 'col';
  }

  return options;
}

/**
 * Create data-driven chart styling with advanced optimizations
 */
export function createDataDrivenChartStyle(
  theme: ProfessionalTheme,
  dataPoints: number,
  chartType: keyof ChartTypeConfig = 'column'
): ChartStyleConfig {
  const baseStyle = createChartStyling(theme, chartType);

  // Adjust based on data complexity
  if (dataPoints > 10) {
    // Reduce visual complexity for many data points
    baseStyle.dataLabelStyle.showValues = false;
    baseStyle.legendStyle.fontSize = Math.max(10, baseStyle.legendStyle.fontSize - 1);
    baseStyle.axisStyle.fontSize = Math.max(9, baseStyle.axisStyle.fontSize - 1);
  }

  if (dataPoints > 20) {
    // Further simplification
    baseStyle.shadow.enabled = false;
    baseStyle.borderRadius = 2;
    baseStyle.legendStyle.position = 'bottom'; // Move legend to save space
  }

  if (dataPoints > 50) {
    // Extreme simplification for very dense data
    baseStyle.dataLabelStyle.showValues = false;
    baseStyle.dataLabelStyle.showPercentages = false;
    baseStyle.legendStyle.fontSize = Math.max(8, baseStyle.legendStyle.fontSize - 2);
    baseStyle.gridColor = lightenColor(baseStyle.gridColor, 0.3); // Lighter grid for less visual noise
  }

  return baseStyle;
}

/**
 * Create chart styling optimized for specific business contexts
 */
export function createBusinessContextChartStyle(
  theme: ProfessionalTheme,
  context: 'financial' | 'marketing' | 'operations' | 'executive' | 'technical',
  chartType: keyof ChartTypeConfig = 'column'
): ChartStyleConfig {
  const baseStyle = createChartStyling(theme, chartType);

  switch (context) {
    case 'financial':
      // Financial charts need precision and clarity
      baseStyle.dataLabelStyle.showValues = true;
      baseStyle.dataLabelStyle.showPercentages = chartType === 'pie' || chartType === 'doughnut';
      baseStyle.gridColor = darkenColor(baseStyle.gridColor, 0.1);
      baseStyle.axisStyle.fontSize = Math.max(baseStyle.axisStyle.fontSize, 11);
      break;

    case 'marketing':
      // Marketing charts should be visually appealing
      baseStyle.shadow.enabled = true;
      baseStyle.borderRadius = Math.max(baseStyle.borderRadius, 4);
      baseStyle.colors = generateMarketingColors(theme);
      break;

    case 'operations':
      // Operations charts need clear data visibility
      baseStyle.dataLabelStyle.showValues = true;
      baseStyle.gridColor = darkenColor(baseStyle.gridColor, 0.05);
      baseStyle.legendStyle.position = 'right';
      break;

    case 'executive':
      // Executive charts should be clean and impactful
      baseStyle.titleStyle.fontSize = Math.max(baseStyle.titleStyle.fontSize, 18);
      baseStyle.titleStyle.fontWeight = 700;
      baseStyle.dataLabelStyle.showValues = false; // Clean look
      baseStyle.shadow.enabled = true;
      break;

    case 'technical':
      // Technical charts need detailed information
      baseStyle.dataLabelStyle.showValues = true;
      baseStyle.axisStyle.fontSize = Math.max(baseStyle.axisStyle.fontSize, 10);
      baseStyle.gridColor = darkenColor(baseStyle.gridColor, 0.1);
      baseStyle.legendStyle.fontSize = Math.max(baseStyle.legendStyle.fontSize, 11);
      break;
  }

  return baseStyle;
}

/**
 * Generate marketing-optimized color palette
 */
function generateMarketingColors(theme: ProfessionalTheme): string[] {
  const palette = createEnhancedColorPalette(theme);
  return [
    palette.primary.main,
    palette.accent.main,
    palette.secondary.main,
    palette.primary.light,
    palette.accent.light,
    palette.secondary.light,
    palette.semantic.success.main,
    palette.semantic.warning.main
  ];
}

/**
 * Utility functions
 */
function lightenColor(color: string, amount: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * amount));
  const g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * amount));
  const b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * amount));

  return rgbToHex(r, g, b);
}

function darkenColor(color: string, amount: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const r = Math.max(0, Math.round(rgb.r * (1 - amount)));
  const g = Math.max(0, Math.round(rgb.g * (1 - amount)));
  const b = Math.max(0, Math.round(rgb.b * (1 - amount)));

  return rgbToHex(r, g, b);
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

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
