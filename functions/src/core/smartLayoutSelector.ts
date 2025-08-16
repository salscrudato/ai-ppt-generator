/**
 * Smart Layout Selector
 * 
 * Intelligent layout selection system that analyzes content characteristics
 * and matches them to optimal slide layouts for maximum impact and clarity.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import type { SlideSpec } from '../schema';
import type { ContentAnalysis } from './aiOrchestrator';

export interface LayoutScore {
  layoutId: string;
  score: number;
  confidence: number;
  reasoning: string[];
  visualPriority: 'text' | 'visual' | 'balanced';
}

export interface ContentCharacteristics {
  hasNumericData: boolean;
  hasComparisons: boolean;
  hasSequentialSteps: boolean;
  hasQuotes: boolean;
  textDensity: 'low' | 'medium' | 'high';
  visualComplexity: 'simple' | 'moderate' | 'complex';
  primaryIntent: 'inform' | 'persuade' | 'explain' | 'showcase';
}

/**
 * Smart Layout Selector class
 */
export class SmartLayoutSelector {
  private layoutRules: LayoutRule[];
  private contentPatterns: ContentPattern[];

  constructor() {
    this.layoutRules = this.initializeLayoutRules();
    this.contentPatterns = this.initializeContentPatterns();
  }

  /**
   * Select optimal layout based on content analysis
   */
  selectOptimalLayout(
    spec: Partial<SlideSpec>,
    analysis: ContentAnalysis
  ): LayoutScore {
    console.log('🧠 Analyzing content for optimal layout selection...');

    // Extract content characteristics
    const characteristics = this.extractContentCharacteristics(spec, analysis);
    
    // Score all available layouts
    const layoutScores = this.scoreLayouts(characteristics, analysis);
    
    // Select best layout
    const bestLayout = this.selectBestLayout(layoutScores);
    
    console.log('✅ Layout selected:', {
      layout: bestLayout.layoutId,
      score: Math.round(bestLayout.score * 100),
      confidence: Math.round(bestLayout.confidence * 100) + '%'
    });

    return bestLayout;
  }

  /**
   * Extract content characteristics for analysis
   */
  private extractContentCharacteristics(
    spec: Partial<SlideSpec>,
    analysis: ContentAnalysis
  ): ContentCharacteristics {
    const allText = [
      spec.title || '',
      spec.paragraph || '',
      ...(spec.bullets || [])
    ].join(' ').toLowerCase();

    return {
      hasNumericData: this.detectNumericData(allText),
      hasComparisons: this.detectComparisons(allText, spec),
      hasSequentialSteps: this.detectSequentialContent(allText, spec),
      hasQuotes: this.detectQuotes(allText, spec),
      textDensity: this.calculateTextDensity(allText),
      visualComplexity: this.assessVisualComplexity(spec, analysis),
      primaryIntent: this.determinePrimaryIntent(allText, analysis)
    };
  }

  /**
   * Score all available layouts
   */
  private scoreLayouts(
    characteristics: ContentCharacteristics,
    analysis: ContentAnalysis
  ): LayoutScore[] {
    const layouts = [
      'title', 'title-bullets', 'title-paragraph', 'two-column',
      'timeline', 'chart', 'quote', 'comparison-table', 'mixed-content'
    ];

    return layouts.map(layoutId => {
      const score = this.calculateLayoutScore(layoutId, characteristics, analysis);
      return {
        layoutId,
        score: score.total,
        confidence: score.confidence,
        reasoning: score.reasoning,
        visualPriority: score.visualPriority
      };
    }).sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate score for a specific layout
   */
  private calculateLayoutScore(
    layoutId: string,
    characteristics: ContentCharacteristics,
    analysis: ContentAnalysis
  ): {
    total: number;
    confidence: number;
    reasoning: string[];
    visualPriority: 'text' | 'visual' | 'balanced';
  } {
    let score = 0;
    const reasoning: string[] = [];
    let confidence = 0.5;
    let visualPriority: 'text' | 'visual' | 'balanced' = 'balanced';

    // Apply layout-specific scoring rules
    switch (layoutId) {
      case 'title':
        if (characteristics.textDensity === 'low' && !characteristics.hasNumericData) {
          score += 0.8;
          reasoning.push('Simple title slide appropriate for low text density');
          confidence = 0.9;
        }
        visualPriority = 'text';
        break;

      case 'title-bullets':
        if (characteristics.textDensity === 'medium' && !characteristics.hasComparisons) {
          score += 0.9;
          reasoning.push('Bullet points ideal for structured information');
          confidence = 0.85;
        }
        if (analysis.category === 'business' || analysis.category === 'educational') {
          score += 0.2;
          reasoning.push('Bullet format suits business/educational content');
        }
        visualPriority = 'text';
        break;

      case 'two-column':
        if (characteristics.hasComparisons) {
          score += 0.95;
          reasoning.push('Two-column layout perfect for comparisons');
          confidence = 0.9;
        }
        if (characteristics.textDensity === 'high') {
          score += 0.3;
          reasoning.push('Two columns help manage high text density');
        }
        visualPriority = 'balanced';
        break;

      case 'timeline':
        if (characteristics.hasSequentialSteps) {
          score += 0.9;
          reasoning.push('Timeline layout ideal for sequential content');
          confidence = 0.85;
        }
        if (analysis.category === 'educational' || characteristics.primaryIntent === 'explain') {
          score += 0.3;
          reasoning.push('Timeline suits educational/explanatory content');
        }
        visualPriority = 'visual';
        break;

      case 'chart':
        if (characteristics.hasNumericData) {
          score += 0.95;
          reasoning.push('Chart layout perfect for numeric data');
          confidence = 0.9;
        }
        if (analysis.category === 'business' && characteristics.primaryIntent === 'inform') {
          score += 0.4;
          reasoning.push('Charts effective for business data presentation');
        }
        visualPriority = 'visual';
        break;

      case 'quote':
        if (characteristics.hasQuotes) {
          score += 0.9;
          reasoning.push('Quote layout ideal for testimonials/quotes');
          confidence = 0.85;
        }
        if (characteristics.textDensity === 'low' && characteristics.primaryIntent === 'persuade') {
          score += 0.3;
          reasoning.push('Quote format effective for persuasive content');
        }
        visualPriority = 'text';
        break;

      case 'comparison-table':
        if (characteristics.hasComparisons && characteristics.visualComplexity === 'complex') {
          score += 0.85;
          reasoning.push('Table format handles complex comparisons well');
          confidence = 0.8;
        }
        visualPriority = 'balanced';
        break;

      case 'mixed-content':
        if (characteristics.visualComplexity === 'complex' || characteristics.textDensity === 'high') {
          score += 0.7;
          reasoning.push('Mixed layout accommodates complex content');
          confidence = 0.7;
        }
        visualPriority = 'balanced';
        break;
    }

    // Apply category-specific bonuses
    if (analysis.category === 'technical' && ['two-column', 'timeline'].includes(layoutId)) {
      score += 0.2;
      reasoning.push('Layout suits technical content structure');
    }

    if (analysis.category === 'creative' && ['quote', 'mixed-content'].includes(layoutId)) {
      score += 0.2;
      reasoning.push('Layout supports creative presentation style');
    }

    return {
      total: Math.min(score, 1),
      confidence,
      reasoning,
      visualPriority
    };
  }

  /**
   * Select the best layout from scored options
   */
  private selectBestLayout(layoutScores: LayoutScore[]): LayoutScore {
    // Return the highest scoring layout
    return layoutScores[0] || {
      layoutId: 'title-bullets',
      score: 0.5,
      confidence: 0.5,
      reasoning: ['Default fallback layout'],
      visualPriority: 'text'
    };
  }

  // Content detection methods
  private detectNumericData(text: string): boolean {
    return /\d+%|\$[\d,]+|\d+x|increase|decrease|growth|revenue|metrics|statistics/.test(text);
  }

  private detectComparisons(text: string, spec: Partial<SlideSpec>): boolean {
    const hasComparisonWords = /vs|versus|compared|before|after|better|worse|pros|cons/.test(text);
    const hasTwoColumnStructure = !!(spec.left && spec.right);
    return hasComparisonWords || hasTwoColumnStructure;
  }

  private detectSequentialContent(text: string, spec: Partial<SlideSpec>): boolean {
    const hasSequenceWords = /step|phase|stage|process|workflow|timeline|first|second|third|next|then|finally/.test(text);
    const hasTimeline = !!(spec.timeline || spec.processSteps);
    return hasSequenceWords || hasTimeline;
  }

  private detectQuotes(text: string, spec: Partial<SlideSpec>): boolean {
    const hasQuoteMarkers = /"|'|testimonial|quote|said|according|feedback/.test(text);
    const hasQuoteStructure = !!(spec as any).quote;
    return hasQuoteMarkers || hasQuoteStructure;
  }

  private calculateTextDensity(text: string): 'low' | 'medium' | 'high' {
    const length = text.length;
    if (length < 200) return 'low';
    if (length < 500) return 'medium';
    return 'high';
  }

  private assessVisualComplexity(spec: Partial<SlideSpec>, analysis: ContentAnalysis): 'simple' | 'moderate' | 'complex' {
    let complexity = 0;
    
    if (spec.chart) complexity += 2;
    if (spec.table || spec.comparisonTable) complexity += 2;
    if (spec.timeline) complexity += 1;
    if (spec.left && spec.right) complexity += 1;
    if (analysis.visualElements && analysis.visualElements.length > 2) complexity += 1;
    
    if (complexity <= 1) return 'simple';
    if (complexity <= 3) return 'moderate';
    return 'complex';
  }

  private determinePrimaryIntent(text: string, analysis: ContentAnalysis): 'inform' | 'persuade' | 'explain' | 'showcase' {
    if (/learn|understand|explain|how|why|process|step/.test(text)) return 'explain';
    if (/buy|choose|best|recommend|should|must|benefit/.test(text)) return 'persuade';
    if (/showcase|feature|demo|present|introduce/.test(text)) return 'showcase';
    return 'inform';
  }

  private initializeLayoutRules(): LayoutRule[] {
    // This would contain more sophisticated rules
    return [];
  }

  private initializeContentPatterns(): ContentPattern[] {
    // This would contain content pattern definitions
    return [];
  }
}

interface LayoutRule {
  id: string;
  condition: (characteristics: ContentCharacteristics) => boolean;
  layoutPreference: string;
  weight: number;
}

interface ContentPattern {
  pattern: RegExp;
  layoutHint: string;
  confidence: number;
}

// Export singleton instance
export const smartLayoutSelector = new SmartLayoutSelector();
