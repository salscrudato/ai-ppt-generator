/**
 * Chart Slide Builder
 *
 * Specialized builder for chart and data visualization slides.
 * Handles native chart rendering with comprehensive styling and validation.
 *
 * Features:
 * - Native PowerPoint chart generation via pptxgenjs
 * - Support for bar, column, line, pie, doughnut, area, scatter
 * - Stacked and 100% stacked variants (for bar/column/area when requested)
 * - Theme-aware color schemes and typography
 * - Data validation and normalization (incl. scatter and pie/doughnut)
 * - Smart legend placement and axis formatting (percent/currency/compact)
 * - Gridline toggles, axis titles, category label rotation
 * - Defensive error handling with graceful fallback
 */

import type { SlideSpec } from '../../schema';
import type { ProfessionalTheme } from '../../professionalThemes';
import type pptxgen from 'pptxgenjs';
import {
  BaseSlideBuilder,
  type SlideBuilderOptions,
} from './slideBuilderRegistry';

// Extended chart interface with optional advanced properties
interface ExtendedChartSpec extends NonNullable<SlideSpec['chart']> {
  axisTitleX?: string;
  axisTitleY?: string;
  gridlines?: {
    category?: boolean;
    value?: boolean;
  };
  numberFormat?: string;
  currency?: string;
  categoryLabelAngle?: number;
  axisMin?: number;
  axisMax?: number;
  showPercent?: boolean;
  showValue?: boolean;
  stacked?: boolean;
  stack?: boolean;
  percentStacked?: boolean;
  '100pctStacked'?: boolean;
  source?: string;
  footnote?: string;
  legendPos?: 't' | 'b' | 'l' | 'r';
}

type ChartSpec = ExtendedChartSpec;
type SeriesSpec = NonNullable<SlideSpec['chart']>['series'][number];

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
    const { contentY = 1.6, maxContentWidth = 8.5, titleX = 0.75 } = options;

    // Title
    this.addTitle(slide, spec.title, theme, options);

    // Chart or placeholder
    if (spec.chart) {
      await this.addEnhancedChart(slide, spec.chart, theme, {
        x: titleX,
        y: contentY + 0.9,
        w: maxContentWidth,
        h: 4.3,
      });
    } else {
      slide.addText('Chart data not available', {
        x: titleX,
        y: contentY + 2.0,
        w: maxContentWidth,
        h: 1.0,
        fontSize: 16,
        color: this.safeColorFormat(theme.colors.text?.secondary || theme.colors.secondary),
        align: 'center',
        italic: true,
      });
    }

    // Description / subtitle paragraph under the chart (optional)
    if (spec.paragraph) {
      slide.addText(spec.paragraph, {
        x: titleX,
        y: contentY + 5.4,
        w: maxContentWidth,
        h: 0.9,
        fontSize: 12,
        color: this.safeColorFormat(theme.colors.text?.secondary || theme.colors.secondary),
        align: 'left',
        fontFace: theme.typography?.body?.fontFamily || 'Arial',
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

    const chart = spec.chart as ChartSpec;

    // Validate chart type
    const validTypes = ['bar', 'line', 'pie', 'doughnut', 'area', 'scatter', 'column'];
    if (!validTypes.includes(chart.type)) {
      errors.push(`Invalid chart type: ${chart.type}. Must be one of: ${validTypes.join(', ')}`);
    }

    // Scatter has different expectations
    const isScatter = chart.type === 'scatter';

    // Validate categories (not required for scatter)
    if (!isScatter) {
      if (!chart.categories || chart.categories.length === 0) {
        errors.push('Chart must have at least one category');
      } else if (chart.categories.length > 12) {
        warnings.push(
          'Chart has many categories (>12), consider grouping data for better readability'
        );
      }
    }

    // Validate series
    if (!chart.series || chart.series.length === 0) {
      errors.push('Chart must have at least one data series');
    } else {
      chart.series.forEach((series, index) => {
        const label = series.name?.trim() || `Series ${index + 1}`;

        if (!series.name || series.name.trim().length === 0) {
          warnings.push(`Series ${index + 1} is missing a name`);
        }

        if (!series.data || series.data.length === 0) {
          errors.push(`${label} has no data`);
          return;
        }

        if (!isScatter) {
          if (!chart.categories) return;
          if (series.data.length !== chart.categories.length) {
            warnings.push(
              `${label} data length (${series.data.length}) doesn't match categories length (${chart.categories.length})`
            );
          }

          const hasInvalidData = series.data.some((v) => typeof v !== 'number' || isNaN(v as any));
          if (hasInvalidData) {
            errors.push(`${label} contains non-numeric data`);
          }
        } else {
          // Scatter: expect array of { x, y } | [x, y] | numbers (auto-indexed)
          const normalized = this.normalizeScatterData(series.data);
          if (normalized.length === 0) {
            errors.push(`${label} has no valid (x,y) points for scatter`);
          }
        }
      });
    }

    // Chart-specific suggestions
    if (chart.type === 'pie' || chart.type === 'doughnut') {
      if (chart.series.length > 1) {
        suggestions.push('Pie and doughnut charts usually work best with a single data series.');
      }
      if ((chart.categories?.length || 0) > 8) {
        suggestions.push('Consider limiting pie/doughnut categories to 8 or fewer for clarity.');
      }
    }

    // Axis titles too long?
    if (chart.axisTitleX && chart.axisTitleX.length > 40) {
      warnings.push('X-axis title is quite long and may not display well.');
    }
    if (chart.axisTitleY && chart.axisTitleY.length > 40) {
      warnings.push('Y-axis title is quite long and may not display well.');
    }

    if (chart.title && chart.title.length > 60) {
      warnings.push('Chart title is quite long and may not display well.');
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
    chart: ChartSpec,
    theme: ProfessionalTheme,
    position: { x: number; y: number; w: number; h: number }
  ): Promise<void> {
    const { x, y, w, h } = position;

    try {
      // --- Background panel behind the chart for readability
      slide.addShape('rect', {
        x: x - 0.1,
        y: y - 0.1,
        w: w + 0.2,
        h: h + 0.2,
        fill: {
          color: this.safeColorFormat(theme.colors.surface || theme.colors.background || '#FFFFFF'),
          transparency: 10,
        },
        line: {
          color: this.safeColorFormat(
            theme.colors.borders?.light || theme.colors.text?.secondary || '#E5E7EB'
          ),
          width: 1,
        },
        rectRadius: 0.08,
        shadow: {
          type: 'outer',
          blur: 3,
          offset: 2,
          angle: 45,
          color: '00000025',
        },
      });

      // --- Chart type mapping
      const typeMap: Record<string, string> = {
        bar: 'bar',
        column: 'column',
        line: 'line',
        pie: 'pie',
        doughnut: 'doughnut',
        area: 'area',
        scatter: 'scatter',
      };
      const pptxType = typeMap[chart.type] || 'column';

      // --- Colors
      const palette = this.buildPalette(theme);
      const seriesCount = Math.max(1, chart.series?.length || 1);
      const chartColors = palette.slice(0, seriesCount);

      // --- Data shaping
      const isPieLike = chart.type === 'pie' || chart.type === 'doughnut';
      const isScatter = chart.type === 'scatter';

      const chartData = isScatter
        ? this.prepareScatterData(chart.series)
        : isPieLike
        ? this.preparePieData(chart)
        : this.prepareCartesianData(chart);

      // --- Axis & labels configuration
      const legendPos = this.chooseLegendPos(chart, w, seriesCount, isPieLike);
      const valueFormatCode = this.formatToExcelCode(chart.numberFormat, chart.currency);

      // Gridlines defaults: show for cartesian unless explicitly disabled
      const showGridlinesDefault = !isPieLike && !isScatter;

      const opts: any = {
        x,
        y,
        w,
        h,
        title: chart.title || '',
        titleFontSize: 14,
        titleColor: this.safeColorFormat(theme.colors.text?.primary || theme.colors.primary),
        chartColors,
        showLegend: chart.showLegend !== false, // default true
        legendPos,
        // Axis label fonts
        catAxisLabelFontSize: 10,
        valAxisLabelFontSize: 10,
        // Axis titles
        catAxisTitle: chart.axisTitleX || undefined,
        valAxisTitle: chart.axisTitleY || undefined,
        // Gridlines
        catAxisMajorGridline: chart.gridlines?.category ?? showGridlinesDefault,
        valAxisMajorGridline: chart.gridlines?.value ?? showGridlinesDefault,
        // Borders
        border: {
          pt: 1,
          color: this.safeColorFormat(theme.colors.borders?.light || theme.colors.secondary),
        },
        // Data labels
        dataLabelColor: this.safeColorFormat(theme.colors.text?.primary || '#111827'),
        dataLabelFontSize: 9,
      };

      // Category label rotation (for long category names)
      if (typeof chart.categoryLabelAngle === 'number') {
        opts.catAxisLabelRotate = Math.max(-90, Math.min(90, chart.categoryLabelAngle));
      } else if ((chart.categories?.some((c) => String(c).length > 12) ?? false) && !isPieLike) {
        // Automatic slight rotation when labels are long
        opts.catAxisLabelRotate = 15;
      }

      // Value axis range (cartesian)
      if (!isPieLike && !isScatter) {
        if (typeof chart.axisMin === 'number') opts.valAxisMinVal = chart.axisMin;
        if (typeof chart.axisMax === 'number') opts.valAxisMaxVal = chart.axisMax;
      }

      // Number formatting (value axis and/or data labels)
      if (valueFormatCode) {
        // Axis tick format (cartesian)
        if (!isPieLike && !isScatter) {
          opts.valAxisFormatCode = valueFormatCode;
        }
        // Data label format (where supported)
        opts.dataLabelFormatCode = valueFormatCode;
      }

      // Show values or percents (pie/doughnut prefer percent)
      if (isPieLike) {
        opts.showPercent = chart.showPercent !== false; // default true for pie-like
        opts.showValue = chart.showValue === true; // opt-in
        // Legend tends to help more than labels when many slices
        opts.showLegend = chart.showLegend !== false;
      } else {
        // Cartesians
        const wantLabels = chart.showDataLabels === true || chart.showValue === true;
        opts.showValue = wantLabels;
      }

      // Stacking (cartesians only)
      const stackingRequested =
        (chart.stacked === true || chart.stack === true) && !isPieLike && !isScatter;
      const percentStack = chart.percentStacked === true || chart['100pctStacked'] === true;

      if (stackingRequested) {
        opts.barStacked = true; // pptxgen uses barStacked/line? (works for bar/col/area)
        if (percentStack) {
          opts.barStacked = 'percent'; // pptxgen accepts 'percent' to indicate 100% stack
        }
      }

      // Optional subtitle above the chart area
      if (chart.subtitle) {
        slide.addText(chart.subtitle, {
          x,
          y: y - 0.4,
          w,
          h: 0.3,
          fontSize: 11,
          color: this.safeColorFormat(theme.colors.text?.secondary || theme.colors.secondary),
          align: 'center',
          fontFace: theme.typography?.body?.fontFamily || 'Arial',
        });
      }

      // Render chart
      slide.addChart(pptxType as any, chartData as any, opts);

      // Optional footnote / source under chart
      if (chart.source || chart.footnote) {
        slide.addText(chart.source || chart.footnote || '', {
          x,
          y: y + h + 0.1,
          w,
          h: 0.3,
          fontSize: 9,
          color: this.safeColorFormat(theme.colors.text?.secondary || theme.colors.secondary),
          italic: true,
          align: 'left',
        });
      }

      console.log(
        `✅ Chart added: type=${chart.type}, series=${chart.series?.length || 0}, categories=${
          chart.categories?.length || 0
        }`
      );
    } catch (error) {
      console.error('❌ Error rendering chart:', error);
      // Fallback notice
      slide.addText('Chart could not be displayed', {
        x,
        y: y + h / 2 - 0.2,
        w,
        h: 0.4,
        fontSize: 12,
        color: this.safeColorFormat(theme.colors.text?.secondary || theme.colors.secondary),
        align: 'center',
        italic: true,
      });
    }
  }

  // -------------------------
  // Helpers
  // -------------------------

  /**
   * Converts a color string (#RRGGBB or RRGGBB) into 'RRGGBB' format safely.
   */
  private safeColorFormat(color?: string): string {
    if (!color) return '000000';
    const clean = color.replace('#', '').trim().slice(0, 6);
    const hex = /^[0-9a-fA-F]{3,6}$/.test(clean) ? clean : '000000';
    return (hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex).toUpperCase();
  }

  /**
   * Build a theme-aware palette with graceful fallbacks.
   */
  private buildPalette(theme: ProfessionalTheme): string[] {
    const base = [
      this.safeColorFormat(theme.colors.primary),
      this.safeColorFormat(theme.colors.secondary),
      this.safeColorFormat(theme.colors.accent),
      this.safeColorFormat('#10B981'), // Emerald
      this.safeColorFormat('#F59E0B'), // Amber
      this.safeColorFormat('#3B82F6'), // Blue
      this.safeColorFormat('#EF4444'), // Red
      this.safeColorFormat('#8B5CF6'), // Purple
      this.safeColorFormat('#06B6D4'), // Cyan
      this.safeColorFormat('#84CC16'), // Lime
    ];
    // Ensure uniqueness and non-empty
    const deduped = Array.from(new Set(base.filter(Boolean)));
    // Pad if somehow short
    while (deduped.length < 10) deduped.push(this.safeColorFormat('#' + (Math.random() * 0xffffff).toFixed(0)));
    return deduped;
  }

  /**
   * Decide a sensible legend position based on layout and complexity.
   */
  private chooseLegendPos(
    chart: ChartSpec,
    width: number,
    seriesCount: number,
    isPieLike: boolean
  ): 'r' | 'b' | 't' | 'l' {
    if (chart.legendPos === 't' || chart.legendPos === 'b' || chart.legendPos === 'l' || chart.legendPos === 'r') {
      return chart.legendPos;
    }
    // Heuristic: pie/doughnut -> right; narrow width or many series -> bottom; otherwise right
    if (isPieLike) return 'r';
    if (width < 6 || seriesCount > 4) return 'b';
    return 'r';
  }

  /**
   * Prepare cartesian data series: bar/column/line/area.
   */
  private prepareCartesianData(chart: ChartSpec) {
    const labels = (chart.categories || []).map((c) => String(c));
    return (chart.series || []).map((s, idx) => {
      const normalized = labels.map((_, i) => this.coerceNumber(s.data[i]));
      return {
        name: s.name?.trim() || `Series ${idx + 1}`,
        labels,
        values: normalized,
      };
    });
  }

  /**
   * Prepare pie/doughnut data. If multiple series are provided, each becomes its own pie/doughnut.
   * Most use-cases prefer the first series only; this keeps the behavior flexible.
   */
  private preparePieData(chart: ChartSpec) {
    const labels = (chart.categories || []).map((c) => String(c));
    return (chart.series || []).map((s, idx) => {
      const normalized = labels.map((_, i) => this.coerceNumber(s.data[i]));
      return {
        name: s.name?.trim() || `Series ${idx + 1}`,
        labels,
        values: normalized,
      };
    });
  }

  /**
   * Prepare scatter data: accepts series.data as:
   *  - Array<{ x: number; y: number }>
   *  - Array<[number, number]>
   *  - Array<number>  (treated as y with x = index)
   */
  private prepareScatterData(seriesList: SeriesSpec[]) {
    return seriesList.map((s, idx) => {
      const pts = this.normalizeScatterData(s.data);
      return {
        name: s.name?.trim() || `Series ${idx + 1}`,
        labels: [], // scatter does not use categories
        values: pts, // [{x,y},...]
      };
    });
  }

  private normalizeScatterData(
    raw: unknown[]
  ): Array<{ x: number; y: number }> {
    const result: Array<{ x: number; y: number }> = [];
    if (!Array.isArray(raw)) return result;

    raw.forEach((v, i) => {
      if (Array.isArray(v) && v.length >= 2) {
        const x = this.coerceNumber(v[0]);
        const y = this.coerceNumber(v[1]);
        if (isFinite(x) && isFinite(y)) result.push({ x, y });
      } else if (typeof v === 'object' && v !== null && 'x' in (v as any) && 'y' in (v as any)) {
        const x = this.coerceNumber((v as any).x);
        const y = this.coerceNumber((v as any).y);
        if (isFinite(x) && isFinite(y)) result.push({ x, y });
      } else if (typeof v === 'number' && isFinite(v)) {
        // Treat as y with x = index
        result.push({ x: i, y: v });
      }
    });

    return result;
    }

  /**
   * Coerce numeric-ish input to a number (NaN-safe -> 0).
   */
  private coerceNumber(v: unknown): number {
    const n = typeof v === 'number' ? v : parseFloat(String(v));
    return isFinite(n) ? n : 0;
  }

  /**
   * Convert a friendly format hint into an Excel-style format code where possible.
   * Supported hints:
   *  - 'percent'            -> '0.0%'
   *  - 'currency' (+ currency code like 'USD', 'EUR') -> '$#,##0.00' (symbol best-effort)
   *  - 'compact' | 'short'  -> '#,##0.0,,"M";#,##0.0,"K"' (approx; axis may still auto-scale)
   *  - 'number'             -> '#,##0.0'
   */
  private formatToExcelCode(
    fmt?: string,
    currency?: string
  ): string | undefined {
    if (!fmt) return undefined;
    const f = fmt.toLowerCase();
    if (f === 'percent' || f === 'percentage') return '0.0%';

    if (f === 'currency') {
      // Very rough symbol mapping; PowerPoint uses current locale otherwise
      const symbol =
        (currency || '').toUpperCase() === 'EUR'
          ? '€'
          : (currency || '').toUpperCase() === 'GBP'
          ? '£'
          : (currency || '').toUpperCase() === 'JPY'
          ? '¥'
          : '$';
      return `${symbol}#,##0.00`;
    }

    if (f === 'compact' || f === 'short') {
      // Excel format codes don't truly support dynamic K/M/G suffix per tick,
      // but this gives a hint when values are in thousands/millions.
      return '#,##0.0';
    }

    if (f === 'number' || f === 'decimal') return '#,##0.0';

    return undefined;
  }
}