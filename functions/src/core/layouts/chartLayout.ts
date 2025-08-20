/*
 * Enhanced Chart Layout Implementation
 *
 * Professional business chart generation with:
 * - Advanced chart types (bar, column, line, pie, area, scatter, combo)
 * - Sophisticated styling with theme integration
 * - Data validation and error handling
 * - Professional formatting and legends
 * - Responsive sizing and positioning
 * - Business-grade visual design
 */

import type pptxgen from 'pptxgenjs';
import type { SlideSpec } from '../../schema';
import { addTitle, addAccentBar, sanitizeText } from '../primitives';
import { CHART_DEFAULTS } from '../constants';

export function createChartLayout(slide: pptxgen.Slide, spec: SlideSpec, colors: any) {
  const title = sanitizeText(spec.title);

  // Add title with enhanced styling
  addTitle(slide, title, colors);

  // Add accent bar for professional appearance
  addAccentBar(slide, colors);

  // Enhanced chart creation with business-grade features
  if (spec.chart) {
    const chartType = mapChartType(spec.chart.type);
    const enhancedColors = generateChartColorPalette(colors, spec.chart.series.length);

    try {
      // Enhanced chart configuration for business presentations
      const chartConfig = {
        x: CHART_DEFAULTS.x,
        y: CHART_DEFAULTS.y,
        w: CHART_DEFAULTS.width,
        h: CHART_DEFAULTS.height,
        title: spec.chart.title,
        titleFontSize: 16,
        titleFontFace: 'Segoe UI Semibold',
        titleColor: colors.text.primary,
        showLegend: spec.chart.showLegend !== false,
        legendPos: 'r' as const, // Right position for better readability
        legendFontSize: 11,
        showValue: spec.chart.showDataLabels === true,
        dataLabelFontSize: 10,
        dataLabelColor: colors.text.primary,
        chartColors: enhancedColors,
        // Enhanced styling for professional appearance
        border: { pt: 1, color: colors.borders?.medium || '#E5E7EB' },
        // Grid lines for better data reading
        catGridLine: { color: colors.borders?.light || '#F3F4F6', style: 'solid' as const, size: 0.5 },
        valGridLine: { color: colors.borders?.light || '#F3F4F6', style: 'solid' as const, size: 0.5 },
        // Professional axis styling
        catAxisLabelFontSize: 10,
        catAxisLabelColor: colors.text.secondary,
        valAxisLabelFontSize: 10,
        valAxisLabelColor: colors.text.secondary,
        // Enhanced data formatting
        valAxisLabelFormatCode: '#,##0',
      };

      // Map chart data with enhanced formatting
      const chartData = spec.chart.series.map((series, index) => ({
        name: series.name,
        labels: spec.chart!.categories,
        values: series.data,
        // Add individual series styling
        color: enhancedColors[index % enhancedColors.length],
      }));

      slide.addChart(chartType as any, chartData, chartConfig);

      // Add chart insights or summary if available
      if ((spec.chart as any).insights) {
        addChartInsights(slide, (spec.chart as any).insights, colors);
      }

    } catch (error) {
      console.warn('Chart creation failed, using fallback visualization:', error);

      // Enhanced fallback with better formatting
      createChartFallback(slide, spec.chart, colors);
    }
  }

  // Add supporting content if available
  if (spec.paragraph) {
    slide.addText(sanitizeText(spec.paragraph), {
      x: 0.5,
      y: CHART_DEFAULTS.y + CHART_DEFAULTS.height + 0.3,
      w: 9,
      h: 1,
      fontSize: 12,
      fontFace: 'Segoe UI',
      color: colors.text.secondary,
      align: 'left',
      valign: 'top',
    });
  }
}

/**
 * Enhanced chart type mapping with business chart support
 */
function mapChartType(type: string): string {
  switch (type.toLowerCase()) {
    case 'bar':
    case 'horizontal-bar': return 'bar';
    case 'column':
    case 'vertical-bar': return 'col';
    case 'line':
    case 'trend': return 'line';
    case 'pie':
    case 'donut': return 'pie';
    case 'area':
    case 'stacked-area': return 'area';
    case 'scatter':
    case 'bubble': return 'scatter';
    case 'combo':
    case 'mixed': return 'combo';
    default: return 'col'; // Default to column chart for business data
  }
}

/**
 * Generate professional color palette for charts
 */
function generateChartColorPalette(colors: any, seriesCount: number): string[] {
  const baseColors = [
    colors.primary,
    colors.secondary,
    colors.accent,
    // Additional professional colors
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
  ];

  // Ensure we have enough colors for all series
  const palette = [];
  for (let i = 0; i < seriesCount; i++) {
    palette.push(baseColors[i % baseColors.length]);
  }

  return palette;
}

/**
 * Add chart insights or key takeaways
 */
function addChartInsights(slide: pptxgen.Slide, insights: string, colors: any) {
  slide.addText(`Key Insights: ${sanitizeText(insights)}`, {
    x: 0.5,
    y: 6.5,
    w: 9,
    h: 0.8,
    fontSize: 11,
    fontFace: 'Segoe UI',
    color: colors.text.secondary,
    align: 'left',
    valign: 'top',
    italic: true,
  });
}

/**
 * Enhanced fallback visualization for chart errors
 */
function createChartFallback(slide: pptxgen.Slide, chart: any, colors: any) {
  // Create a professional-looking data table as fallback
  const tableData = [];

  // Header row
  const headerRow = ['Category', ...chart.series.map((s: any) => s.name)];
  tableData.push(headerRow);

  // Data rows
  chart.categories.forEach((category: string, index: number) => {
    const row = [category];
    chart.series.forEach((series: any) => {
      row.push(series.data[index]?.toString() || '0');
    });
    tableData.push(row);
  });

  // Add table with professional styling
  slide.addTable(tableData, {
    x: CHART_DEFAULTS.x,
    y: CHART_DEFAULTS.y,
    w: CHART_DEFAULTS.width,
    h: CHART_DEFAULTS.height,
    fontSize: 11,
    fontFace: 'Segoe UI',
    color: colors.text.primary,
    fill: { color: colors.surface || '#FFFFFF' },
    border: { pt: 1, color: colors.borders?.medium || '#E5E7EB' },
    align: 'center',
    valign: 'middle',
    // Header styling
    rowH: 0.4,
    colW: [2.0, ...Array(chart.series.length).fill((CHART_DEFAULTS.width - 2.0) / chart.series.length)],
  });

  // Add fallback notice
  slide.addText('Chart visualization unavailable - data shown in table format', {
    x: CHART_DEFAULTS.x,
    y: CHART_DEFAULTS.y + CHART_DEFAULTS.height + 0.1,
    w: CHART_DEFAULTS.width,
    h: 0.3,
    fontSize: 9,
    fontFace: 'Segoe UI',
    color: colors.text.muted || '#9CA3AF',
    align: 'center',
    italic: true,
  });
}
