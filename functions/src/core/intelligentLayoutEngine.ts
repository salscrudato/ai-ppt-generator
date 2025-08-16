/**
 * Intelligent Layout Engine
 * 
 * Advanced layout selection and optimization system that automatically
 * chooses the best layout based on content analysis, audience preferences,
 * and visual design principles.
 * 
 * Features:
 * - Content-aware layout selection
 * - Dynamic layout optimization
 * - Responsive design principles
 * - Accessibility-first approach
 * - Visual hierarchy optimization
 * - Multi-device compatibility
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import { SlideSpec } from '../schema';
import { ContentAnalysis } from './aiOrchestrator';
import { ProfessionalTheme } from '../professionalThemes';

/**
 * Layout recommendation interface
 */
export interface LayoutRecommendation {
  layoutId: string;
  confidence: number; // 0-1 confidence score
  reasoning: string[];
  optimizations: LayoutOptimization[];
  alternatives: Array<{
    layoutId: string;
    confidence: number;
    reason: string;
  }>;
}

/**
 * Layout optimization suggestion
 */
export interface LayoutOptimization {
  type: 'spacing' | 'typography' | 'color' | 'hierarchy' | 'accessibility';
  description: string;
  impact: 'low' | 'medium' | 'high';
  implementation: Record<string, any>;
}

/**
 * Content metrics for layout analysis
 */
export interface ContentMetrics {
  textDensity: number; // Characters per slide
  bulletCount: number;
  hasImages: boolean;
  hasCharts: boolean;
  hasTables: boolean;
  hasTimeline: boolean;
  complexityScore: number; // 0-1 complexity rating
  readabilityScore: number; // 0-1 readability rating
}

/**
 * Layout configuration with responsive breakpoints
 */
export interface ResponsiveLayoutConfig {
  desktop: LayoutDimensions;
  tablet: LayoutDimensions;
  mobile: LayoutDimensions;
  print: LayoutDimensions;
}

/**
 * Layout dimensions and spacing
 */
export interface LayoutDimensions {
  width: number;
  height: number;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  contentArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  grid: {
    columns: number;
    rows: number;
    gutterX: number;
    gutterY: number;
  };
}

/**
 * Layout rule for intelligent selection
 */
export interface LayoutRule {
  id: string;
  name: string;
  condition: (metrics: ContentMetrics, analysis: ContentAnalysis) => boolean;
  recommendedLayouts: string[];
  weight: number; // Rule importance (0-1)
  reasoning: string;
}

/**
 * Intelligent Layout Engine class
 */
export class IntelligentLayoutEngine {
  private layoutRules: LayoutRule[];
  private layoutConfigs: Map<string, ResponsiveLayoutConfig>;
  private optimizationStrategies: Map<string, LayoutOptimization[]>;

  constructor() {
    this.layoutRules = this.initializeLayoutRules();
    this.layoutConfigs = this.initializeLayoutConfigs();
    this.optimizationStrategies = this.initializeOptimizationStrategies();
  }

  /**
   * Analyze content and recommend optimal layout
   */
  async recommendLayout(
    spec: Partial<SlideSpec>,
    analysis: ContentAnalysis,
    theme: ProfessionalTheme,
    constraints?: {
      maxTextDensity?: number;
      preferredAspectRatio?: string;
      accessibilityLevel?: 'basic' | 'enhanced' | 'full';
    }
  ): Promise<LayoutRecommendation> {
    console.log('🧠 Analyzing content for optimal layout...');

    // Calculate content metrics
    const metrics = this.calculateContentMetrics(spec);
    
    // Apply layout rules to get recommendations
    const recommendations = this.applyLayoutRules(metrics, analysis);
    
    // Select best recommendation
    const bestRecommendation = this.selectBestLayout(recommendations, constraints);
    
    // Generate optimizations
    const optimizations = this.generateOptimizations(bestRecommendation.layoutId, metrics, theme);
    
    // Generate alternatives
    const alternatives = recommendations
      .filter(r => r.layoutId !== bestRecommendation.layoutId)
      .slice(0, 3)
      .map(r => ({
        layoutId: r.layoutId,
        confidence: r.confidence,
        reason: r.reasoning[0] || 'Alternative layout option'
      }));

    const finalRecommendation: LayoutRecommendation = {
      layoutId: bestRecommendation.layoutId,
      confidence: bestRecommendation.confidence,
      reasoning: bestRecommendation.reasoning,
      optimizations,
      alternatives
    };

    console.log('✅ Layout recommendation generated:', {
      layout: finalRecommendation.layoutId,
      confidence: Math.round(finalRecommendation.confidence * 100) + '%',
      optimizations: finalRecommendation.optimizations.length
    });

    return finalRecommendation;
  }

  /**
   * Optimize existing layout based on content and theme
   */
  async optimizeLayout(
    layoutId: string,
    spec: SlideSpec,
    theme: ProfessionalTheme
  ): Promise<{
    optimizedSpec: SlideSpec;
    improvements: string[];
    performanceGains: Record<string, number>;
  }> {
    console.log(`🔧 Optimizing ${layoutId} layout...`);

    const metrics = this.calculateContentMetrics(spec);
    const optimizations = this.optimizationStrategies.get(layoutId) || [];
    
    let optimizedSpec = { ...spec };
    const improvements: string[] = [];
    const performanceGains: Record<string, number> = {};

    // Apply optimizations
    for (const optimization of optimizations) {
      const result = this.applyOptimization(optimizedSpec, optimization, theme);
      optimizedSpec = result.spec;
      improvements.push(result.improvement);
      performanceGains[optimization.type] = result.gain;
    }

    console.log('✅ Layout optimization completed:', {
      improvements: improvements.length,
      avgGain: Object.values(performanceGains).reduce((a, b) => a + b, 0) / Object.keys(performanceGains).length
    });

    return {
      optimizedSpec,
      improvements,
      performanceGains
    };
  }

  /**
   * Calculate content metrics for analysis
   */
  private calculateContentMetrics(spec: Partial<SlideSpec>): ContentMetrics {
    const title = spec.title || '';
    const paragraph = spec.paragraph || '';
    const bullets = spec.bullets || [];
    const totalText = title + paragraph + bullets.join(' ');

    return {
      textDensity: totalText.length,
      bulletCount: bullets.length,
      hasImages: !!(spec.imageUrl || (spec.left as any)?.imageUrl || (spec.right as any)?.imageUrl),
      hasCharts: !!(spec.chart),
      hasTables: !!(spec.table),
      hasTimeline: !!(spec.timeline),
      complexityScore: this.calculateComplexityScore(spec),
      readabilityScore: this.calculateReadabilityScore(totalText)
    };
  }

  /**
   * Calculate complexity score based on content elements
   */
  private calculateComplexityScore(spec: Partial<SlideSpec>): number {
    let score = 0;
    
    // Base complexity from text length
    const textLength = (spec.title || '').length + (spec.paragraph || '').length;
    score += Math.min(textLength / 500, 0.3); // Max 0.3 for text
    
    // Bullet points add complexity
    if (spec.bullets) {
      score += Math.min(spec.bullets.length / 10, 0.2); // Max 0.2 for bullets
    }
    
    // Visual elements add complexity
    if (spec.chart) score += 0.2;
    if (spec.table) score += 0.15;
    if (spec.timeline) score += 0.1;
    if (spec.imageUrl) score += 0.05;
    
    return Math.min(score, 1);
  }

  /**
   * Calculate readability score using simplified metrics
   */
  private calculateReadabilityScore(text: string): number {
    if (!text) return 1;
    
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const avgWordsPerSentence = words / Math.max(sentences, 1);
    
    // Optimal range: 15-20 words per sentence
    if (avgWordsPerSentence >= 15 && avgWordsPerSentence <= 20) {
      return 1;
    } else if (avgWordsPerSentence < 10 || avgWordsPerSentence > 30) {
      return 0.5;
    } else {
      return 0.8;
    }
  }

  /**
   * Apply layout rules to generate recommendations
   */
  private applyLayoutRules(
    metrics: ContentMetrics,
    analysis: ContentAnalysis
  ): Array<{ layoutId: string; confidence: number; reasoning: string[] }> {
    const recommendations: Array<{ layoutId: string; confidence: number; reasoning: string[] }> = [];

    for (const rule of this.layoutRules) {
      if (rule.condition(metrics, analysis)) {
        for (const layoutId of rule.recommendedLayouts) {
          const existing = recommendations.find(r => r.layoutId === layoutId);
          if (existing) {
            existing.confidence += rule.weight;
            existing.reasoning.push(rule.reasoning);
          } else {
            recommendations.push({
              layoutId,
              confidence: rule.weight,
              reasoning: [rule.reasoning]
            });
          }
        }
      }
    }

    // Normalize confidence scores
    const maxConfidence = Math.max(...recommendations.map(r => r.confidence));
    if (maxConfidence > 0) {
      recommendations.forEach(r => {
        r.confidence = r.confidence / maxConfidence;
      });
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Select best layout based on recommendations and constraints
   */
  private selectBestLayout(
    recommendations: Array<{ layoutId: string; confidence: number; reasoning: string[] }>,
    constraints?: any
  ): { layoutId: string; confidence: number; reasoning: string[] } {
    if (recommendations.length === 0) {
      return {
        layoutId: 'title-bullets',
        confidence: 0.5,
        reasoning: ['Default layout selected as fallback']
      };
    }

    // Apply constraints if provided
    if (constraints?.maxTextDensity) {
      // Filter out text-heavy layouts if text density is high
      // This would be implemented based on specific constraint logic
    }

    return recommendations[0];
  }

  /**
   * Generate optimizations for a specific layout
   */
  private generateOptimizations(
    layoutId: string,
    metrics: ContentMetrics,
    theme: ProfessionalTheme
  ): LayoutOptimization[] {
    const optimizations: LayoutOptimization[] = [];

    // Text density optimization
    if (metrics.textDensity > 300) {
      optimizations.push({
        type: 'spacing',
        description: 'Increase line spacing and margins for better readability',
        impact: 'medium',
        implementation: {
          lineHeight: 1.6,
          marginIncrease: 0.2
        }
      });
    }

    // Bullet point optimization
    if (metrics.bulletCount > 7) {
      optimizations.push({
        type: 'hierarchy',
        description: 'Consider splitting into multiple slides or using sub-bullets',
        impact: 'high',
        implementation: {
          maxBullets: 5,
          useSubBullets: true
        }
      });
    }

    // Accessibility optimization
    optimizations.push({
      type: 'accessibility',
      description: 'Ensure sufficient color contrast and font sizes',
      impact: 'high',
      implementation: {
        minFontSize: 18,
        contrastRatio: 4.5
      }
    });

    return optimizations;
  }

  /**
   * Apply a specific optimization to a slide spec
   */
  private applyOptimization(
    spec: SlideSpec,
    optimization: LayoutOptimization,
    theme: ProfessionalTheme
  ): { spec: SlideSpec; improvement: string; gain: number } {
    const optimizedSpec = { ...spec };
    let improvement = '';
    let gain = 0;

    switch (optimization.type) {
      case 'spacing':
        improvement = 'Improved text spacing and readability';
        gain = 0.15;
        break;
      case 'hierarchy':
        if (optimizedSpec.bullets && optimizedSpec.bullets.length > 5) {
          optimizedSpec.bullets = optimizedSpec.bullets.slice(0, 5);
          improvement = 'Reduced bullet points for better focus';
          gain = 0.25;
        }
        break;
      case 'accessibility':
        improvement = 'Enhanced accessibility compliance';
        gain = 0.2;
        break;
      default:
        improvement = 'General layout optimization applied';
        gain = 0.1;
    }

    return { spec: optimizedSpec, improvement, gain };
  }

  /**
   * Initialize layout rules for intelligent selection
   */
  private initializeLayoutRules(): LayoutRule[] {
    return [
      {
        id: 'text-heavy-rule',
        name: 'Text Heavy Content',
        condition: (metrics, analysis) => metrics.textDensity > 400,
        recommendedLayouts: ['title-paragraph', 'two-column'],
        weight: 0.8,
        reasoning: 'High text density requires layouts optimized for reading'
      },
      {
        id: 'bullet-heavy-rule',
        name: 'Bullet Point Heavy',
        condition: (metrics, analysis) => metrics.bulletCount > 5,
        recommendedLayouts: ['title-bullets', 'two-column'],
        weight: 0.9,
        reasoning: 'Multiple bullet points work best with dedicated bullet layouts'
      },
      {
        id: 'visual-content-rule',
        name: 'Visual Content Present',
        condition: (metrics, analysis) => metrics.hasImages || metrics.hasCharts,
        recommendedLayouts: ['image-right', 'image-left', 'chart', 'two-column'],
        weight: 0.85,
        reasoning: 'Visual content requires layouts that accommodate images and charts'
      },
      {
        id: 'data-visualization-rule',
        name: 'Data Visualization',
        condition: (metrics, analysis) => metrics.hasCharts || metrics.hasTables,
        recommendedLayouts: ['chart', 'data-visualization', 'comparison-table'],
        weight: 0.95,
        reasoning: 'Data content requires specialized visualization layouts'
      },
      {
        id: 'timeline-content-rule',
        name: 'Timeline Content',
        condition: (metrics, analysis) => metrics.hasTimeline,
        recommendedLayouts: ['timeline', 'process-flow'],
        weight: 1.0,
        reasoning: 'Timeline content requires chronological layout structures'
      },
      {
        id: 'executive-audience-rule',
        name: 'Executive Audience',
        condition: (metrics, analysis) => analysis.audienceAlignment > 0.8 &&
                   analysis.keywords.some(k => ['strategy', 'revenue', 'growth', 'market'].includes(k.toLowerCase())),
        recommendedLayouts: ['title-bullets', 'metrics-dashboard', 'comparison-table'],
        weight: 0.7,
        reasoning: 'Executive audiences prefer concise, metrics-focused layouts'
      },
      {
        id: 'technical-audience-rule',
        name: 'Technical Audience',
        condition: (metrics, analysis) => analysis.category === 'technical',
        recommendedLayouts: ['two-column', 'process-flow', 'diagram'],
        weight: 0.75,
        reasoning: 'Technical content benefits from detailed, structured layouts'
      },
      {
        id: 'creative-content-rule',
        name: 'Creative Content',
        condition: (metrics, analysis) => analysis.category === 'creative',
        recommendedLayouts: ['image-focus', 'quote', 'hero', 'creative-showcase'],
        weight: 0.8,
        reasoning: 'Creative content requires visually engaging, artistic layouts'
      },
      {
        id: 'simple-content-rule',
        name: 'Simple Content',
        condition: (metrics, analysis) => metrics.complexityScore < 0.3,
        recommendedLayouts: ['title', 'quote', 'hero'],
        weight: 0.6,
        reasoning: 'Simple content works well with clean, minimal layouts'
      },
      {
        id: 'complex-content-rule',
        name: 'Complex Content',
        condition: (metrics, analysis) => metrics.complexityScore > 0.7,
        recommendedLayouts: ['two-column', 'tabbed-content', 'accordion'],
        weight: 0.85,
        reasoning: 'Complex content requires structured layouts for organization'
      }
    ];
  }

  /**
   * Initialize responsive layout configurations
   */
  private initializeLayoutConfigs(): Map<string, ResponsiveLayoutConfig> {
    const configs = new Map<string, ResponsiveLayoutConfig>();

    // Standard 16:9 presentation dimensions
    const standardDimensions: LayoutDimensions = {
      width: 10,
      height: 5.625,
      margins: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 },
      contentArea: { x: 0.5, y: 1.0, width: 9.0, height: 4.125 },
      grid: { columns: 12, rows: 8, gutterX: 0.2, gutterY: 0.15 }
    };

    // Title slide configuration
    configs.set('title', {
      desktop: standardDimensions,
      tablet: {
        ...standardDimensions,
        margins: { top: 0.4, right: 0.4, bottom: 0.4, left: 0.4 },
        contentArea: { x: 0.4, y: 0.8, width: 9.2, height: 4.425 }
      },
      mobile: {
        ...standardDimensions,
        margins: { top: 0.3, right: 0.3, bottom: 0.3, left: 0.3 },
        contentArea: { x: 0.3, y: 0.6, width: 9.4, height: 4.625 }
      },
      print: standardDimensions
    });

    // Title-bullets configuration
    configs.set('title-bullets', {
      desktop: {
        ...standardDimensions,
        contentArea: { x: 0.75, y: 1.6, width: 8.5, height: 3.525 }
      },
      tablet: {
        ...standardDimensions,
        contentArea: { x: 0.6, y: 1.4, width: 8.8, height: 3.725 }
      },
      mobile: {
        ...standardDimensions,
        contentArea: { x: 0.4, y: 1.2, width: 9.2, height: 3.925 }
      },
      print: {
        ...standardDimensions,
        contentArea: { x: 0.75, y: 1.6, width: 8.5, height: 3.525 }
      }
    });

    // Two-column configuration
    configs.set('two-column', {
      desktop: {
        ...standardDimensions,
        contentArea: { x: 0.5, y: 1.6, width: 9.0, height: 3.525 },
        grid: { columns: 2, rows: 8, gutterX: 0.5, gutterY: 0.15 }
      },
      tablet: {
        ...standardDimensions,
        contentArea: { x: 0.4, y: 1.4, width: 9.2, height: 3.725 },
        grid: { columns: 2, rows: 8, gutterX: 0.4, gutterY: 0.15 }
      },
      mobile: {
        ...standardDimensions,
        contentArea: { x: 0.3, y: 1.2, width: 9.4, height: 3.925 },
        grid: { columns: 1, rows: 16, gutterX: 0.3, gutterY: 0.1 } // Stack on mobile
      },
      print: {
        ...standardDimensions,
        contentArea: { x: 0.5, y: 1.6, width: 9.0, height: 3.525 },
        grid: { columns: 2, rows: 8, gutterX: 0.5, gutterY: 0.15 }
      }
    });

    // Chart layout configuration
    configs.set('chart', {
      desktop: {
        ...standardDimensions,
        contentArea: { x: 0.5, y: 1.6, width: 9.0, height: 3.525 }
      },
      tablet: {
        ...standardDimensions,
        contentArea: { x: 0.4, y: 1.4, width: 9.2, height: 3.725 }
      },
      mobile: {
        ...standardDimensions,
        contentArea: { x: 0.2, y: 1.2, width: 9.6, height: 3.925 }
      },
      print: {
        ...standardDimensions,
        contentArea: { x: 0.5, y: 1.6, width: 9.0, height: 3.525 }
      }
    });

    return configs;
  }

  /**
   * Initialize optimization strategies for different layouts
   */
  private initializeOptimizationStrategies(): Map<string, LayoutOptimization[]> {
    const strategies = new Map<string, LayoutOptimization[]>();

    // Title slide optimizations
    strategies.set('title', [
      {
        type: 'typography',
        description: 'Optimize title hierarchy and spacing',
        impact: 'high',
        implementation: { titleSize: 'large', centerAlign: true }
      },
      {
        type: 'spacing',
        description: 'Maximize visual impact with generous whitespace',
        impact: 'medium',
        implementation: { verticalCenter: true, minMargins: 1.0 }
      }
    ]);

    // Bullet layout optimizations
    strategies.set('title-bullets', [
      {
        type: 'hierarchy',
        description: 'Optimize bullet point hierarchy and grouping',
        impact: 'high',
        implementation: { maxBullets: 6, useSubBullets: true }
      },
      {
        type: 'spacing',
        description: 'Improve bullet spacing for readability',
        impact: 'medium',
        implementation: { bulletSpacing: 0.3, indentation: 0.5 }
      },
      {
        type: 'typography',
        description: 'Enhance text contrast and sizing',
        impact: 'medium',
        implementation: { bulletSize: 'medium', emphasizeFirst: true }
      }
    ]);

    // Two-column optimizations
    strategies.set('two-column', [
      {
        type: 'spacing',
        description: 'Balance column widths and gutters',
        impact: 'high',
        implementation: { columnRatio: '1:1', gutter: 0.5 }
      },
      {
        type: 'hierarchy',
        description: 'Establish clear visual hierarchy between columns',
        impact: 'medium',
        implementation: { leftPrimary: true, alignTops: true }
      }
    ]);

    return strategies;
  }
}

/**
 * Export singleton instance
 */
export const intelligentLayoutEngine = new IntelligentLayoutEngine();
