/**
 * Intelligent Data Detection System
 * 
 * Comprehensive system for analyzing slide content and automatically
 * suggesting appropriate visualizations (charts, tables, or enhanced text).
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import { SlideSpec } from '../schema';
import { extractDataFromSlide, type ChartConfig } from './chartGeneration';
import { extractTableDataFromSlide, type TableConfig } from './tableGeneration';

/**
 * Data visualization recommendation
 */
export interface VisualizationRecommendation {
  type: 'chart' | 'table' | 'text' | 'mixed';
  confidence: number;
  reasoning: string;
  chartConfig?: Partial<ChartConfig>;
  tableConfig?: Partial<TableConfig>;
  enhancedTextSuggestions?: string[];
}

/**
 * Content analysis result
 */
export interface ContentAnalysis {
  hasNumericData: boolean;
  hasStructuredData: boolean;
  hasComparativeData: boolean;
  hasTimeSeriesData: boolean;
  hasMetrics: boolean;
  dataComplexity: 'simple' | 'moderate' | 'complex';
  recommendedVisualization: VisualizationRecommendation;
  contentType: 'narrative' | 'analytical' | 'comparative' | 'procedural' | 'mixed';
}

/**
 * Analyze slide content and recommend visualizations
 */
export function analyzeSlideContent(spec: SlideSpec): ContentAnalysis {
  // Extract data using existing systems
  const chartData = extractDataFromSlide(spec);
  const tableData = extractTableDataFromSlide(spec);
  
  // Analyze content characteristics
  const analysis: ContentAnalysis = {
    hasNumericData: chartData.hasNumericData,
    hasStructuredData: tableData.hasTableData,
    hasComparativeData: detectComparativeContent(spec),
    hasTimeSeriesData: detectTimeSeriesContent(spec),
    hasMetrics: detectMetricsContent(spec),
    dataComplexity: assessDataComplexity(spec, chartData, tableData),
    recommendedVisualization: generateVisualizationRecommendation(spec, chartData, tableData),
    contentType: determineContentType(spec)
  };
  
  return analysis;
}

/**
 * Detect comparative content patterns
 */
function detectComparativeContent(spec: SlideSpec): boolean {
  const indicators = [
    'vs', 'versus', 'compared to', 'comparison', 'before and after',
    'pros and cons', 'advantages', 'disadvantages', 'benefits', 'drawbacks'
  ];
  
  const allText = [
    spec.title,
    spec.paragraph || '',
    ...(spec.bullets || [])
  ].join(' ').toLowerCase();
  
  return indicators.some(indicator => allText.includes(indicator)) ||
         !!(spec.left && spec.right) ||
         !!spec.comparisonTable;
}

/**
 * Detect time series content patterns
 */
function detectTimeSeriesContent(spec: SlideSpec): boolean {
  const timeIndicators = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december',
    'q1', 'q2', 'q3', 'q4', 'quarter', 'monthly', 'yearly', 'annual',
    'week', 'day', 'hour', 'timeline', 'over time', 'trend', 'growth'
  ];
  
  const allText = [
    spec.title,
    spec.paragraph || '',
    ...(spec.bullets || [])
  ].join(' ').toLowerCase();
  
  return timeIndicators.some(indicator => allText.includes(indicator)) ||
         !!spec.timeline ||
         !!spec.processSteps;
}

/**
 * Detect metrics and KPI content
 */
function detectMetricsContent(spec: SlideSpec): boolean {
  const metricIndicators = [
    'kpi', 'metric', 'performance', 'roi', 'revenue', 'profit', 'cost',
    'efficiency', 'productivity', 'conversion', 'rate', 'percentage',
    'score', 'rating', 'benchmark', 'target', 'goal', 'achievement'
  ];
  
  const allText = [
    spec.title,
    spec.paragraph || '',
    ...(spec.bullets || [])
  ].join(' ').toLowerCase();
  
  return metricIndicators.some(indicator => allText.includes(indicator)) ||
         !!(spec.left?.metrics || spec.right?.metrics) ||
         spec.layout === 'metrics-dashboard';
}

/**
 * Assess data complexity level
 */
function assessDataComplexity(
  spec: SlideSpec, 
  chartData: any, 
  tableData: any
): 'simple' | 'moderate' | 'complex' {
  let complexityScore = 0;
  
  // Content volume
  const totalContent = (spec.bullets?.length || 0) + 
                      (spec.paragraph?.length || 0) / 100 +
                      (spec.left?.bullets?.length || 0) +
                      (spec.right?.bullets?.length || 0);
  
  if (totalContent > 10) complexityScore += 2;
  else if (totalContent > 5) complexityScore += 1;
  
  // Data richness
  if (chartData.hasNumericData) complexityScore += 2;
  if (tableData.hasTableData) complexityScore += 2;
  if (spec.chart) complexityScore += 3;
  if (spec.comparisonTable) complexityScore += 2;
  
  // Layout complexity
  if (spec.layout === 'two-column') complexityScore += 1;
  if (spec.layout === 'data-visualization') complexityScore += 3;
  if (spec.timeline || spec.processSteps) complexityScore += 2;
  
  if (complexityScore >= 6) return 'complex';
  if (complexityScore >= 3) return 'moderate';
  return 'simple';
}

/**
 * Generate visualization recommendation
 */
function generateVisualizationRecommendation(
  spec: SlideSpec,
  chartData: any,
  tableData: any
): VisualizationRecommendation {
  const recommendations: VisualizationRecommendation[] = [];
  
  // Chart recommendation
  if (chartData.hasNumericData && chartData.confidence > 60) {
    recommendations.push({
      type: 'chart',
      confidence: chartData.confidence,
      reasoning: `Detected ${chartData.datasets.length} numeric dataset(s) suitable for ${chartData.suggestedChartType} chart`,
      chartConfig: {
        type: chartData.suggestedChartType,
        data: chartData.datasets,
        showLegend: chartData.datasets.length > 1,
        showDataLabels: chartData.datasets[0]?.values.length <= 5
      }
    });
  }
  
  // Table recommendation
  if (tableData.hasTableData && tableData.confidence > 70) {
    recommendations.push({
      type: 'table',
      confidence: tableData.confidence,
      reasoning: `Detected structured data with ${tableData.headers.length} columns and ${tableData.rows.length} rows`,
      tableConfig: {
        headers: tableData.headers,
        rows: tableData.rows,
        showHeaders: true,
        alternateRowColors: tableData.rows.length > 3,
        borderStyle: tableData.rows.length > 5 ? 'light' : 'medium'
      }
    });
  }
  
  // Enhanced text recommendation
  const textEnhancements = generateTextEnhancements(spec);
  if (textEnhancements.length > 0) {
    recommendations.push({
      type: 'text',
      confidence: 80,
      reasoning: 'Content would benefit from enhanced text formatting and structure',
      enhancedTextSuggestions: textEnhancements
    });
  }
  
  // Mixed recommendation for complex content
  if (recommendations.length > 1) {
    const avgConfidence = recommendations.reduce((sum, rec) => sum + rec.confidence, 0) / recommendations.length;
    recommendations.push({
      type: 'mixed',
      confidence: avgConfidence,
      reasoning: 'Content contains multiple data types that would benefit from combined visualization approaches',
      chartConfig: recommendations.find(r => r.type === 'chart')?.chartConfig,
      tableConfig: recommendations.find(r => r.type === 'table')?.tableConfig,
      enhancedTextSuggestions: recommendations.find(r => r.type === 'text')?.enhancedTextSuggestions
    });
  }
  
  // Return highest confidence recommendation
  return recommendations.length > 0 
    ? recommendations.reduce((best, current) => current.confidence > best.confidence ? current : best)
    : {
        type: 'text',
        confidence: 50,
        reasoning: 'Standard text presentation is most appropriate for this content',
        enhancedTextSuggestions: ['Use bullet points for better readability', 'Consider adding visual emphasis to key points']
      };
}

/**
 * Generate text enhancement suggestions
 */
function generateTextEnhancements(spec: SlideSpec): string[] {
  const suggestions: string[] = [];
  
  // Bullet point analysis
  if (spec.bullets) {
    if (spec.bullets.length > 7) {
      suggestions.push('Consider grouping bullet points into categories');
    }
    if (spec.bullets.some(bullet => bullet.length > 100)) {
      suggestions.push('Break down long bullet points into shorter, more digestible items');
    }
    if (spec.bullets.some(bullet => bullet.match(/\d+/))) {
      suggestions.push('Highlight numeric values with bold formatting or callout boxes');
    }
  }
  
  // Paragraph analysis
  if (spec.paragraph) {
    const sentences = spec.paragraph.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length > 5) {
      suggestions.push('Consider breaking long paragraphs into bullet points');
    }
    if (spec.paragraph.match(/\d+%|\$\d+|\d+k|\d+m/gi)) {
      suggestions.push('Extract key metrics into a separate metrics section');
    }
  }
  
  // Layout suggestions
  if (spec.left && spec.right) {
    suggestions.push('Use visual separators or different background colors to distinguish columns');
  }
  
  return suggestions;
}

/**
 * Determine primary content type
 */
function determineContentType(spec: SlideSpec): ContentAnalysis['contentType'] {
  const title = spec.title.toLowerCase();
  const allText = [spec.title, spec.paragraph || '', ...(spec.bullets || [])].join(' ').toLowerCase();
  
  // Analytical content
  if (allText.match(/\d+%|\$\d+|analysis|data|metrics|performance|results/gi)) {
    return 'analytical';
  }
  
  // Comparative content
  if (allText.includes('vs') || allText.includes('comparison') || spec.comparisonTable || (spec.left && spec.right)) {
    return 'comparative';
  }
  
  // Procedural content
  if (spec.processSteps || spec.timeline || allText.match(/step|process|workflow|procedure/gi)) {
    return 'procedural';
  }
  
  // Mixed content
  if ((spec.bullets?.length || 0) > 5 && spec.paragraph && (spec.chart || spec.comparisonTable)) {
    return 'mixed';
  }
  
  // Default to narrative
  return 'narrative';
}

/**
 * Get visualization priority score
 */
export function getVisualizationPriority(analysis: ContentAnalysis): number {
  let priority = 0;
  
  if (analysis.hasNumericData) priority += 30;
  if (analysis.hasStructuredData) priority += 25;
  if (analysis.hasComparativeData) priority += 20;
  if (analysis.hasTimeSeriesData) priority += 15;
  if (analysis.hasMetrics) priority += 10;
  
  // Adjust for complexity
  switch (analysis.dataComplexity) {
    case 'complex': priority += 20; break;
    case 'moderate': priority += 10; break;
    case 'simple': priority += 5; break;
  }
  
  return Math.min(priority, 100);
}

/**
 * Generate content improvement suggestions
 */
export function generateContentSuggestions(analysis: ContentAnalysis): string[] {
  const suggestions: string[] = [];
  
  if (analysis.recommendedVisualization.confidence > 80) {
    suggestions.push(`Strong recommendation: Use ${analysis.recommendedVisualization.type} visualization`);
  }
  
  if (analysis.dataComplexity === 'complex') {
    suggestions.push('Consider splitting complex content across multiple slides');
  }
  
  if (analysis.hasNumericData && analysis.recommendedVisualization.type === 'text') {
    suggestions.push('Numeric data detected - consider adding charts for better impact');
  }
  
  if (analysis.hasStructuredData && analysis.recommendedVisualization.type === 'text') {
    suggestions.push('Structured data detected - consider using tables for clarity');
  }
  
  return suggestions;
}
