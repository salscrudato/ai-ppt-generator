/*
 * Chart layout implementation
 */

import type pptxgen from 'pptxgenjs';
import type { SlideSpec } from '../../schema';
import { addTitle, addAccentBar, sanitizeText } from '../primitives';
import { CHART_DEFAULTS } from '../constants';

export function createChartLayout(slide: pptxgen.Slide, spec: SlideSpec, colors: any) {
  const title = sanitizeText(spec.title);
  
  // Add title
  addTitle(slide, title, colors);
  
  // Add accent bar
  addAccentBar(slide, colors);
  
  // Add chart
  if (spec.chart) {
    const chartType = mapChartType(spec.chart.type);

    try {
      slide.addChart(chartType as any, spec.chart.series.map(s => ({
        name: s.name,
        labels: spec.chart!.categories,
        values: s.data,
      })), {
        x: CHART_DEFAULTS.x,
        y: CHART_DEFAULTS.y,
        w: CHART_DEFAULTS.width,
        h: CHART_DEFAULTS.height,
        title: spec.chart.title,
        showLegend: spec.chart.showLegend !== false,
        showValue: spec.chart.showDataLabels === true,
        chartColors: [colors.primary, colors.secondary, colors.accent],
      });
    } catch (error) {
      // Fallback: add text explaining chart data
      const chartSummary = `Chart: ${spec.chart.title || 'Data Visualization'}\n\n` +
        spec.chart.series.map(s => `${s.name}: ${s.data.join(', ')}`).join('\n');
      
      slide.addText(chartSummary, {
        x: CHART_DEFAULTS.x,
        y: CHART_DEFAULTS.y,
        w: CHART_DEFAULTS.width,
        h: CHART_DEFAULTS.height,
        fontSize: 14,
        fontFace: 'Segoe UI',
        color: colors.text.primary,
        align: 'left',
        valign: 'top',
      });
    }
  }
}

function mapChartType(type: string): string {
  switch (type.toLowerCase()) {
    case 'bar': return 'bar';
    case 'column': return 'col';
    case 'line': return 'line';
    case 'pie': return 'pie';
    case 'area': return 'area';
    case 'scatter': return 'scatter';
    default: return 'col';
  }
}
