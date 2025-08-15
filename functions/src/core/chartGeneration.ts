/**
 * Native Chart Generation System
 * 
 * Comprehensive system for generating PowerPoint charts using PptxGenJS
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
 * Chart configuration interface
 */
export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'area' | 'scatter' | 'column';
  title?: string;
  subtitle?: string;
  data: ChartDataSeries[];
  position: { x: number; y: number; w: number; h: number };
  theme: ProfessionalTheme | ModernTheme;
  showLegend?: boolean;
  showDataLabels?: boolean;
  showTitle?: boolean;
  showAxes?: boolean;
}

/**
 * Chart data series interface
 */
export interface ChartDataSeries {
  name: string;
  labels: string[];
  values: number[];
  color?: string;
}

/**
 * Data extraction result interface
 */
export interface ExtractedData {
  hasNumericData: boolean;
  datasets: ChartDataSeries[];
  suggestedChartType: ChartConfig['type'];
  confidence: number;
}

/**
 * Add a native PowerPoint chart to a slide
 */
export function addNativeChart(slide: pptxgen.Slide, config: ChartConfig): void {
  const isModern = 'palette' in config.theme;
  
  // Get theme colors for chart styling
  const themeColors = getThemeChartColors(config.theme);
  
  // Convert chart type to PptxGenJS format
  const pptxChartType = convertChartType(config.type);
  
  // Prepare chart data in PptxGenJS format
  const chartData = config.data.map((series, index) => ({
    name: series.name,
    labels: series.labels,
    values: series.values,
    color: series.color || themeColors[index % themeColors.length]
  }));

  // Chart options with theme-aware styling
  const chartOptions: any = {
    x: config.position.x,
    y: config.position.y,
    w: config.position.w,
    h: config.position.h,
    
    // Title configuration
    title: config.showTitle !== false ? config.title : undefined,
    titleFontSize: isModern ? 18 : 16,
    titleColor: safeColorFormat(isModern 
      ? (config.theme as ModernTheme).palette.text.primary
      : (config.theme as ProfessionalTheme).colors.text.primary),
    titleFontFace: isModern
      ? (config.theme as ModernTheme).typography.fontFamilies.heading
      : (config.theme as ProfessionalTheme).typography.headings.fontFamily,
    
    // Legend configuration
    showLegend: config.showLegend !== false,
    legendPos: 'r', // Right position
    legendFontSize: 12,
    legendColor: safeColorFormat(isModern 
      ? (config.theme as ModernTheme).palette.text.secondary
      : (config.theme as ProfessionalTheme).colors.text.secondary),
    
    // Data labels
    showDataTable: config.showDataLabels || false,
    showValue: config.showDataLabels || false,
    
    // Chart colors
    chartColors: themeColors,
    
    // Axes configuration
    showCatAxisTitle: config.showAxes !== false,
    showValAxisTitle: config.showAxes !== false,
    catAxisTitleFontSize: 12,
    valAxisTitleFontSize: 12,
    
    // Grid and styling
    showMajorGridlines: true,
    majorGridlineColor: safeColorFormat(isModern 
      ? (config.theme as ModernTheme).palette.borders.light
      : (config.theme as ProfessionalTheme).colors.borders.light),
    
    // Border
    border: {
      pt: 1,
      color: safeColorFormat(isModern 
        ? (config.theme as ModernTheme).palette.borders.medium
        : (config.theme as ProfessionalTheme).colors.borders.medium)
    }
  };

  // Add chart-specific options
  if (config.type === 'pie' || config.type === 'doughnut') {
    chartOptions.showPercent = true;
    chartOptions.showLegend = true;
    chartOptions.legendPos = 'r';
  }

  // Add the chart to the slide
  slide.addChart(pptxChartType, chartData, chartOptions);
}

/**
 * Extract numeric data from slide content
 */
export function extractDataFromSlide(spec: SlideSpec): ExtractedData {
  const result: ExtractedData = {
    hasNumericData: false,
    datasets: [],
    suggestedChartType: 'bar',
    confidence: 0
  };

  // Check if slide already has chart data
  if (spec.chart) {
    result.hasNumericData = true;
    result.datasets = spec.chart.series.map(series => ({
      name: series.name,
      labels: spec.chart!.categories,
      values: series.data,
      color: series.color
    }));
    result.suggestedChartType = spec.chart.type as ChartConfig['type'];
    result.confidence = 100;
    return result;
  }

  // Extract data from bullets
  if (spec.bullets) {
    const extractedData = extractDataFromBullets(spec.bullets);
    if (extractedData.hasData) {
      result.hasNumericData = true;
      result.datasets = extractedData.datasets;
      result.suggestedChartType = extractedData.suggestedType;
      result.confidence = extractedData.confidence;
    }
  }

  // Extract data from paragraph
  if (spec.paragraph && !result.hasNumericData) {
    const extractedData = extractDataFromText(spec.paragraph);
    if (extractedData.hasData) {
      result.hasNumericData = true;
      result.datasets = extractedData.datasets;
      result.suggestedChartType = extractedData.suggestedType;
      result.confidence = extractedData.confidence;
    }
  }

  // Extract data from metrics
  if ((spec.left?.metrics || spec.right?.metrics) && !result.hasNumericData) {
    const metrics = [...(spec.left?.metrics || []), ...(spec.right?.metrics || [])];
    if (metrics.length > 0) {
      result.hasNumericData = true;
      result.datasets = [{
        name: 'Metrics',
        labels: metrics.map(m => m.label),
        values: metrics.map(m => parseFloat(m.value) || 0)
      }];
      result.suggestedChartType = 'bar';
      result.confidence = 80;
    }
  }

  return result;
}

/**
 * Extract numeric data from bullet points
 */
function extractDataFromBullets(bullets: string[]): {
  hasData: boolean;
  datasets: ChartDataSeries[];
  suggestedType: ChartConfig['type'];
  confidence: number;
} {
  const result: {
    hasData: boolean;
    datasets: ChartDataSeries[];
    suggestedType: ChartConfig['type'];
    confidence: number;
  } = { hasData: false, datasets: [], suggestedType: 'bar', confidence: 0 };
  
  // Pattern to match numbers with labels
  const numberPattern = /(\d+(?:\.\d+)?)\s*(%|k|m|million|billion|thousand)?/gi;
  const labelPattern = /^([^:]+):\s*(.+)$/;
  
  const dataPoints: { label: string; value: number }[] = [];
  
  bullets.forEach(bullet => {
    const labelMatch = bullet.match(labelPattern);
    if (labelMatch) {
      const label = labelMatch[1].trim();
      const valueText = labelMatch[2].trim();
      const numberMatch = valueText.match(numberPattern);
      
      if (numberMatch) {
        let value = parseFloat(numberMatch[0]);
        const unit = numberMatch[0].toLowerCase();
        
        // Convert units to actual numbers
        if (unit.includes('k') || unit.includes('thousand')) value *= 1000;
        else if (unit.includes('m') || unit.includes('million')) value *= 1000000;
        else if (unit.includes('billion')) value *= 1000000000;
        
        dataPoints.push({ label, value });
      }
    } else {
      // Try to extract numbers directly from bullet
      const numbers = bullet.match(numberPattern);
      if (numbers && numbers.length > 0) {
        const value = parseFloat(numbers[0]);
        const label = bullet.replace(numberPattern, '').trim() || `Item ${dataPoints.length + 1}`;
        dataPoints.push({ label, value });
      }
    }
  });
  
  if (dataPoints.length >= 2) {
    result.hasData = true;
    result.datasets = [{
      name: 'Data',
      labels: dataPoints.map(dp => dp.label),
      values: dataPoints.map(dp => dp.value)
    }];
    result.confidence = Math.min(dataPoints.length * 20, 90);
    
    // Suggest chart type based on data characteristics
    if (dataPoints.length <= 5 && dataPoints.every(dp => dp.value >= 0)) {
      result.suggestedType = 'pie';
    } else if (dataPoints.some(dp => dp.label.toLowerCase().includes('time') || dp.label.toLowerCase().includes('month'))) {
      result.suggestedType = 'line';
    } else {
      result.suggestedType = 'bar';
    }
  }
  
  return result;
}

/**
 * Extract numeric data from paragraph text
 */
function extractDataFromText(text: string): {
  hasData: boolean;
  datasets: ChartDataSeries[];
  suggestedType: ChartConfig['type'];
  confidence: number;
} {
  const result: {
    hasData: boolean;
    datasets: ChartDataSeries[];
    suggestedType: ChartConfig['type'];
    confidence: number;
  } = { hasData: false, datasets: [], suggestedType: 'line', confidence: 0 };
  
  // Look for trend patterns like "increased from X to Y"
  const trendPattern = /(increased|decreased|grew|fell|rose|dropped)\s+from\s+(\d+(?:\.\d+)?)\s*(?:to|by)\s+(\d+(?:\.\d+)?)/gi;
  const matches = text.match(trendPattern);
  
  if (matches && matches.length > 0) {
    const match = matches[0];
    const numbers = match.match(/\d+(?:\.\d+)?/g);
    
    if (numbers && numbers.length >= 2) {
      result.hasData = true;
      result.datasets = [{
        name: 'Trend',
        labels: ['Start', 'End'],
        values: [parseFloat(numbers[0]), parseFloat(numbers[1])]
      }];
      result.suggestedType = 'line';
      result.confidence = 70;
    }
  }
  
  return result;
}

/**
 * Get theme-appropriate chart colors
 */
function getThemeChartColors(theme: ProfessionalTheme | ModernTheme): string[] {
  const isModern = 'palette' in theme;
  
  if (isModern) {
    const modernTheme = theme as ModernTheme;
    return [
      safeColorFormat(modernTheme.palette.primary),
      safeColorFormat(modernTheme.palette.accent),
      safeColorFormat(modernTheme.palette.secondary),
      safeColorFormat(modernTheme.palette.semantic.success),
      safeColorFormat(modernTheme.palette.semantic.warning),
      safeColorFormat(modernTheme.palette.semantic.info)
    ];
  } else {
    const professionalTheme = theme as ProfessionalTheme;
    return [
      safeColorFormat(professionalTheme.colors.primary),
      safeColorFormat(professionalTheme.colors.secondary),
      safeColorFormat(professionalTheme.colors.accent),
      safeColorFormat(professionalTheme.colors.semantic.success),
      safeColorFormat(professionalTheme.colors.semantic.warning),
      safeColorFormat(professionalTheme.colors.semantic.info)
    ];
  }
}

/**
 * Convert chart type to PptxGenJS format
 */
function convertChartType(type: ChartConfig['type']): any {
  const typeMap: Record<string, any> = {
    'bar': 'bar',
    'column': 'column',
    'line': 'line',
    'pie': 'pie',
    'doughnut': 'doughnut',
    'area': 'area',
    'scatter': 'scatter'
  };
  
  return typeMap[type] || 'bar';
}

/**
 * Generate sample data for demonstration charts
 */
export function generateSampleData(type: ChartConfig['type'], title: string): ChartDataSeries[] {
  switch (type) {
    case 'pie':
      return [{
        name: 'Distribution',
        labels: ['Category A', 'Category B', 'Category C', 'Category D'],
        values: [35, 25, 25, 15]
      }];
    
    case 'line':
      return [{
        name: 'Trend',
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        values: [10, 15, 12, 18]
      }];
    
    default:
      return [{
        name: 'Data Series',
        labels: ['Item 1', 'Item 2', 'Item 3', 'Item 4'],
        values: [20, 35, 25, 40]
      }];
  }
}
