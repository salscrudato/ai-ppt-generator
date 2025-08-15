/**
 * Chart Slide Builder
 * 
 * Specialized builder for chart and data visualization slides.
 * Handles native chart rendering with comprehensive styling and validation.
 * 
 * Features:
 * - Native PowerPoint chart generation
 * - Support for bar, line, pie, doughnut, area, scatter, column charts
 * - Theme-aware color schemes
 * - Data validation and error handling
 * - Professional chart styling
 */

import type { SlideSpec } from '../../schema';
import type { ProfessionalTheme } from '../../professionalThemes';
import type pptxgen from 'pptxgenjs';
import { BaseSlideBuilder, type SlideBuilderOptions, type ValidationResult } from './slideBuilderRegistry';

export class ChartSlideBuilder extends BaseSlideBuilder {
  type: SlideSpec['layout'] = 'chart';
  name = 'Chart Slide';
  description = 'Creates slides with native PowerPoint charts for data visualization';

  async build(
    slide: pptxgen.Slide,
    spec: SlideSpec,
    theme: ProfessionalTheme,
    options: SlideBuilderOptions = {}
  ): Promise<void> {
    const { contentY = 1.6, maxContentWidth = 8.5 } = options;

    // Add title
    this.addTitle(slide, spec.title, theme, options);

    // Add chart if present
    if (spec.chart) {
      await this.addEnhancedChart(slide, spec.chart, theme, {
        x: 0.75,
        y: contentY + 1.0,
        w: maxContentWidth,
        h: 4.0
      });
    } else {
      // Fallback: Add placeholder
      slide.addText('Chart data not available', {
        x: 0.75,
        y: contentY + 2.0,
        w: maxContentWidth,
        h: 1.0,
        fontSize: 16,
        color: theme.colors.text?.secondary || theme.colors.secondary,
        align: 'center',
        italic: true
      });
    }

    // Add subtitle or description if available
    if (spec.paragraph) {
      slide.addText(spec.paragraph, {
        x: 0.75,
        y: contentY + 5.2,
        w: maxContentWidth,
        h: 0.8,
        fontSize: 12,
        color: theme.colors.text?.secondary || theme.colors.secondary,
        align: 'left'
      });
    }
  }

  protected validateLayoutSpecific(
    spec: SlideSpec,
    errors: string[],
    warnings: string[],
    suggestions: string[]
  ): void {
    if (!spec.chart) {
      errors.push('Chart data is required for chart layout');
      return;
    }

    const chart = spec.chart;

    // Validate chart type
    const validTypes = ['bar', 'line', 'pie', 'doughnut', 'area', 'scatter', 'column'];
    if (!validTypes.includes(chart.type)) {
      errors.push(`Invalid chart type: ${chart.type}. Must be one of: ${validTypes.join(', ')}`);
    }

    // Validate categories
    if (!chart.categories || chart.categories.length === 0) {
      errors.push('Chart must have at least one category');
    } else if (chart.categories.length > 12) {
      warnings.push('Chart has many categories (>12), consider grouping data for better readability');
    }

    // Validate series
    if (!chart.series || chart.series.length === 0) {
      errors.push('Chart must have at least one data series');
    } else {
      chart.series.forEach((series, index) => {
        if (!series.name || series.name.trim().length === 0) {
          warnings.push(`Series ${index + 1} is missing a name`);
        }
        
        if (!series.data || series.data.length === 0) {
          errors.push(`Series ${index + 1} has no data`);
        } else if (series.data.length !== chart.categories.length) {
          warnings.push(`Series ${index + 1} data length (${series.data.length}) doesn't match categories length (${chart.categories.length})`);
        }

        // Check for non-numeric data
        const hasInvalidData = series.data.some(value => typeof value !== 'number' || isNaN(value));
        if (hasInvalidData) {
          errors.push(`Series ${index + 1} contains non-numeric data`);
        }
      });
    }

    // Chart-specific suggestions
    if (chart.type === 'pie' || chart.type === 'doughnut') {
      if (chart.series.length > 1) {
        suggestions.push('Pie and doughnut charts work best with a single data series');
      }
      if (chart.categories.length > 8) {
        suggestions.push('Consider limiting pie chart categories to 8 or fewer for clarity');
      }
    }

    if (chart.title && chart.title.length > 50) {
      warnings.push('Chart title is quite long and may not display well');
    }
  }

  getRequiredFields(): string[] {
    return ['title', 'chart'];
  }

  getOptionalFields(): string[] {
    return ['paragraph', 'notes', 'sources'];
  }

  /**
   * Enhanced chart rendering with comprehensive styling
   */
  private async addEnhancedChart(
    slide: pptxgen.Slide,
    chart: NonNullable<SlideSpec['chart']>,
    theme: ProfessionalTheme,
    position: { x: number; y: number; w: number; h: number }
  ): Promise<void> {
    try {
      const { x, y, w, h } = position;

      // Add chart background
      slide.addShape('rect', {
        x: x - 0.1,
        y: y - 0.1,
        w: w + 0.2,
        h: h + 0.2,
        fill: {
          color: this.safeColorFormat(theme.colors.surface || theme.colors.background || '#FFFFFF'),
          transparency: 10
        },
        line: {
          color: this.safeColorFormat(theme.colors.borders?.light || theme.colors.text?.secondary || '#E5E7EB'),
          width: 1
        },
        rectRadius: 0.1,
        shadow: {
          type: 'outer',
          blur: 3,
          offset: 2,
          angle: 45,
          color: '00000015'
        }
      });

      // Map chart types
      const chartTypeMap: Record<string, any> = {
        'bar': 'bar',
        'column': 'column',
        'line': 'line',
        'pie': 'pie',
        'doughnut': 'doughnut',
        'area': 'area',
        'scatter': 'scatter'
      };

      const pptxChartType = chartTypeMap[chart.type] || 'column';

      // Prepare chart data
      const chartData = chart.series.map((series, index) => {
        const normalizedData = chart.categories.map((_, catIndex) => 
          series.data[catIndex] !== undefined ? series.data[catIndex] : 0
        );

        return {
          name: series.name || `Series ${index + 1}`,
          labels: chart.categories,
          values: normalizedData
        };
      });

      // Enhanced color palette
      const chartColors = [
        this.safeColorFormat(theme.colors.primary),
        this.safeColorFormat(theme.colors.secondary),
        this.safeColorFormat(theme.colors.accent),
        this.safeColorFormat('#10B981'), // Green
        this.safeColorFormat('#F59E0B'), // Amber
        this.safeColorFormat('#EF4444'), // Red
        this.safeColorFormat('#8B5CF6'), // Purple
        this.safeColorFormat('#06B6D4')  // Cyan
      ];

      // Chart configuration
      const chartOptions: any = {
        x, y, w, h,
        title: chart.title || '',
        titleFontSize: 14,
        titleColor: this.safeColorFormat(theme.colors.text?.primary || theme.colors.primary),
        showLegend: chart.showLegend !== false,
        legendPos: 'r',
        showDataTable: chart.showDataLabels === true,
        chartColors: chartColors.slice(0, chart.series.length),
        border: {
          pt: 1,
          color: this.safeColorFormat(theme.colors.text?.secondary || theme.colors.secondary)
        }
      };

      // Type-specific enhancements
      if (chart.type === 'pie' || chart.type === 'doughnut') {
        chartOptions.showPercent = true;
        chartOptions.showValue = false;
        chartOptions.showLegend = true;
        chartOptions.legendPos = 'r';
      } else {
        chartOptions.catAxisLabelFontSize = 10;
        chartOptions.valAxisLabelFontSize = 10;
        chartOptions.showValue = chart.showDataLabels === true;
      }

      // Add subtitle if provided
      if (chart.subtitle) {
        slide.addText(chart.subtitle, {
          x: x,
          y: y - 0.4,
          w: w,
          h: 0.3,
          fontSize: 11,
          color: this.safeColorFormat(theme.colors.text?.secondary || theme.colors.secondary),
          align: 'center',
          fontFace: theme.typography?.fontFamilies?.body || 'Arial'
        });
      }

      // Render the chart
      slide.addChart(pptxChartType, chartData, chartOptions);

      console.log(`✅ Successfully added ${chart.type} chart with ${chart.series.length} series and ${chart.categories.length} categories`);

    } catch (error) {
      console.error('❌ Error rendering chart:', error);
      
      // Fallback: Add error message
      slide.addText('Chart could not be displayed', {
        x: position.x,
        y: position.y + position.h/2 - 0.2,
        w: position.w,
        h: 0.4,
        fontSize: 12,
        color: this.safeColorFormat(theme.colors.text?.secondary || theme.colors.secondary),
        align: 'center',
        italic: true
      });
    }
  }

  /**
   * Safe color formatting helper
   */
  private safeColorFormat(color: string): string {
    if (!color) return '000000';
    
    // Remove # if present and ensure 6 characters
    const cleanColor = color.replace('#', '').substring(0, 6);
    
    // Pad with zeros if needed
    return cleanColor.padEnd(6, '0').toUpperCase();
  }
}
