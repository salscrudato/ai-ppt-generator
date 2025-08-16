/**
 * Industry-Specific Content Intelligence Engine
 * 
 * Advanced content generation system that adapts terminology, templates,
 * and presentation styles based on industry context and audience analysis.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import type { GenerationParams, SlideSpec } from '../schema';
import type { ContentAnalysis } from '../core/aiOrchestrator';

export interface IndustryTemplate {
  id: string;
  name: string;
  industry: string;
  description: string;
  terminology: TerminologyMap;
  contentPatterns: ContentPattern[];
  layoutPreferences: LayoutPreference[];
  complianceRequirements: ComplianceRule[];
  audienceAdaptations: AudienceAdaptation[];
}

export interface TerminologyMap {
  [key: string]: {
    preferred: string;
    alternatives: string[];
    context: string;
    audienceLevel: 'executive' | 'technical' | 'general';
  };
}

export interface ContentPattern {
  type: 'opening' | 'problem' | 'solution' | 'metrics' | 'conclusion';
  templates: string[];
  requiredElements: string[];
  industrySpecific: boolean;
}

export interface LayoutPreference {
  contentType: string;
  preferredLayouts: string[];
  reasoning: string;
  confidence: number;
}

export interface ComplianceRule {
  requirement: string;
  description: string;
  mandatoryElements: string[];
  forbiddenElements: string[];
}

export interface AudienceAdaptation {
  audienceType: string;
  adaptations: {
    terminology: 'simplified' | 'technical' | 'executive';
    contentDepth: 'high-level' | 'detailed' | 'comprehensive';
    visualStyle: 'minimal' | 'data-rich' | 'narrative';
    pacing: 'fast' | 'moderate' | 'detailed';
  };
}

/**
 * Industry Content Intelligence Engine
 */
export class IndustryContentEngine {
  private industryTemplates: Map<string, IndustryTemplate>;
  private terminologyDatabase: Map<string, TerminologyMap>;
  private complianceRules: Map<string, ComplianceRule[]>;

  constructor() {
    this.industryTemplates = new Map();
    this.terminologyDatabase = new Map();
    this.complianceRules = new Map();
    this.initializeIndustryTemplates();
  }

  /**
   * Generate industry-adapted content
   */
  async generateIndustryContent(
    params: GenerationParams,
    analysis: ContentAnalysis,
    baseContent: Partial<SlideSpec>
  ): Promise<SlideSpec> {
    console.log('🏭 Generating industry-specific content...');

    const industry = this.detectIndustry(params, analysis);
    const template = this.getIndustryTemplate(industry);
    
    if (!template) {
      console.log('⚠️ No specific template found, using general adaptation');
      return this.applyGeneralAdaptations(baseContent, params, analysis);
    }

    console.log(`✅ Using ${template.name} template for ${industry} industry`);

    // Apply industry-specific adaptations
    const adaptedContent = await this.applyIndustryAdaptations(
      baseContent,
      template,
      params,
      analysis
    );

    return adaptedContent;
  }

  /**
   * Adapt terminology for industry and audience
   */
  adaptTerminology(
    content: string,
    industry: string,
    audience: string
  ): string {
    const terminology = this.terminologyDatabase.get(industry);
    if (!terminology) return content;

    let adaptedContent = content;

    Object.entries(terminology).forEach(([generic, industryTerm]) => {
      if (this.shouldUseIndustryTerm(industryTerm, audience)) {
        const regex = new RegExp(`\\b${generic}\\b`, 'gi');
        adaptedContent = adaptedContent.replace(regex, industryTerm.preferred);
      }
    });

    return adaptedContent;
  }

  /**
   * Get compliance requirements for industry
   */
  getComplianceRequirements(industry: string): ComplianceRule[] {
    return this.complianceRules.get(industry) || [];
  }

  /**
   * Validate content against compliance rules
   */
  validateCompliance(
    content: SlideSpec,
    industry: string
  ): {
    isCompliant: boolean;
    violations: string[];
    recommendations: string[];
  } {
    const rules = this.getComplianceRequirements(industry);
    const violations: string[] = [];
    const recommendations: string[] = [];

    rules.forEach(rule => {
      // Check for mandatory elements
      rule.mandatoryElements.forEach(element => {
        if (!this.contentContainsElement(content, element)) {
          violations.push(`Missing required element: ${element}`);
          recommendations.push(`Add ${element} to meet ${rule.requirement}`);
        }
      });

      // Check for forbidden elements
      rule.forbiddenElements.forEach(element => {
        if (this.contentContainsElement(content, element)) {
          violations.push(`Contains forbidden element: ${element}`);
          recommendations.push(`Remove ${element} to comply with ${rule.requirement}`);
        }
      });
    });

    return {
      isCompliant: violations.length === 0,
      violations,
      recommendations
    };
  }

  /**
   * Detect industry from parameters and analysis
   */
  private detectIndustry(
    params: GenerationParams,
    analysis: ContentAnalysis
  ): string {
    // Direct industry parameter
    if (params.industry && params.industry !== 'general') {
      return params.industry;
    }

    // Detect from keywords and entities
    const keywords = analysis.keywords.join(' ').toLowerCase();
    const entities = analysis.entities.map(e => e.text).join(' ').toLowerCase();
    const allText = `${keywords} ${entities}`;

    // Industry detection patterns
    const industryPatterns = {
      healthcare: /medical|health|patient|doctor|hospital|clinic|pharmaceutical|drug|treatment/,
      finance: /financial|bank|investment|trading|portfolio|risk|capital|revenue|profit/,
      technology: /software|tech|digital|ai|machine learning|cloud|data|algorithm|api/,
      education: /student|teacher|learning|curriculum|academic|university|school|training/,
      manufacturing: /production|factory|supply chain|quality|manufacturing|assembly|logistics/,
      retail: /customer|sales|product|market|brand|consumer|shopping|e-commerce/,
      consulting: /strategy|consulting|advisory|transformation|optimization|analysis|framework/,
      legal: /legal|law|compliance|regulation|contract|litigation|attorney|court/
    };

    for (const [industry, pattern] of Object.entries(industryPatterns)) {
      if (pattern.test(allText)) {
        return industry;
      }
    }

    return 'general';
  }

  /**
   * Get industry template
   */
  private getIndustryTemplate(industry: string): IndustryTemplate | undefined {
    return this.industryTemplates.get(industry);
  }

  /**
   * Apply industry-specific adaptations
   */
  private async applyIndustryAdaptations(
    baseContent: Partial<SlideSpec>,
    template: IndustryTemplate,
    params: GenerationParams,
    analysis: ContentAnalysis
  ): Promise<SlideSpec> {
    const adapted = { ...baseContent } as SlideSpec;

    // Adapt terminology
    if (adapted.title) {
      adapted.title = this.adaptTerminology(adapted.title, template.industry, params.audience);
    }

    if (adapted.bullets) {
      adapted.bullets = adapted.bullets.map(bullet =>
        this.adaptTerminology(bullet, template.industry, params.audience)
      );
    }

    if (adapted.paragraph) {
      adapted.paragraph = this.adaptTerminology(adapted.paragraph, template.industry, params.audience);
    }

    // Apply audience adaptations
    const audienceAdaptation = template.audienceAdaptations.find(
      a => a.audienceType === params.audience
    );

    if (audienceAdaptation) {
      adapted.title = this.adaptContentForAudience(adapted.title || '', audienceAdaptation);
      
      if (adapted.bullets) {
        adapted.bullets = adapted.bullets.map(bullet =>
          this.adaptContentForAudience(bullet, audienceAdaptation)
        );
      }
    }

    // Apply layout preferences
    const preferredLayout = this.getPreferredLayout(template, analysis);
    if (preferredLayout && !adapted.layout) {
      adapted.layout = preferredLayout as any;
    }

    return adapted;
  }

  /**
   * Apply general adaptations when no specific template exists
   */
  private applyGeneralAdaptations(
    baseContent: Partial<SlideSpec>,
    params: GenerationParams,
    analysis: ContentAnalysis
  ): SlideSpec {
    // Apply basic audience-level adaptations
    const adapted = { ...baseContent } as SlideSpec;

    if (params.audience === 'executives') {
      // Executive adaptations: high-level, outcome-focused
      adapted.title = this.makeExecutiveFriendly(adapted.title || '');
      if (adapted.bullets) {
        adapted.bullets = adapted.bullets.map(bullet => this.makeExecutiveFriendly(bullet));
      }
    } else if (params.audience === 'technical') {
      // Technical adaptations: detailed, precise
      adapted.title = this.makeTechnicallyPrecise(adapted.title || '');
      if (adapted.bullets) {
        adapted.bullets = adapted.bullets.map(bullet => this.makeTechnicallyPrecise(bullet));
      }
    }

    return adapted;
  }

  /**
   * Helper methods for content adaptation
   */
  private shouldUseIndustryTerm(
    industryTerm: TerminologyMap[string],
    audience: string
  ): boolean {
    return industryTerm.audienceLevel === audience || 
           industryTerm.audienceLevel === 'general';
  }

  private contentContainsElement(content: SlideSpec, element: string): boolean {
    const allText = [
      content.title,
      content.paragraph,
      ...(content.bullets || []),
      content.notes
    ].join(' ').toLowerCase();

    return allText.includes(element.toLowerCase());
  }

  private adaptContentForAudience(
    content: string,
    adaptation: AudienceAdaptation
  ): string {
    // Apply audience-specific content adaptations
    switch (adaptation.adaptations.terminology) {
      case 'simplified':
        return this.simplifyTerminology(content);
      case 'technical':
        return this.makeTechnicallyPrecise(content);
      case 'executive':
        return this.makeExecutiveFriendly(content);
      default:
        return content;
    }
  }

  private getPreferredLayout(
    template: IndustryTemplate,
    analysis: ContentAnalysis
  ): string | null {
    const preferences = template.layoutPreferences
      .filter(pref => analysis.category === pref.contentType)
      .sort((a, b) => b.confidence - a.confidence);

    return preferences.length > 0 ? preferences[0].preferredLayouts[0] : null;
  }

  private simplifyTerminology(content: string): string {
    const simplifications = {
      'utilize': 'use',
      'implement': 'put in place',
      'optimize': 'improve',
      'facilitate': 'help',
      'leverage': 'use',
      'synergize': 'work together'
    };

    let simplified = content;
    Object.entries(simplifications).forEach(([complex, simple]) => {
      const regex = new RegExp(`\\b${complex}\\b`, 'gi');
      simplified = simplified.replace(regex, simple);
    });

    return simplified;
  }

  private makeTechnicallyPrecise(content: string): string {
    // Add technical precision and specificity
    return content.replace(/improve/gi, 'optimize')
                 .replace(/use/gi, 'implement')
                 .replace(/help/gi, 'facilitate');
  }

  private makeExecutiveFriendly(content: string): string {
    // Focus on outcomes and business impact
    return content.replace(/technical/gi, 'strategic')
                 .replace(/implementation/gi, 'execution')
                 .replace(/features/gi, 'capabilities');
  }

  /**
   * Initialize industry templates
   */
  private initializeIndustryTemplates(): void {
    // Healthcare template
    this.industryTemplates.set('healthcare', {
      id: 'healthcare-template',
      name: 'Healthcare & Medical',
      industry: 'healthcare',
      description: 'HIPAA-compliant healthcare presentations',
      terminology: {
        'users': { preferred: 'patients', alternatives: ['clients'], context: 'healthcare', audienceLevel: 'general' },
        'data': { preferred: 'patient data', alternatives: ['medical records'], context: 'healthcare', audienceLevel: 'technical' },
        'improvement': { preferred: 'patient outcomes', alternatives: ['health improvements'], context: 'healthcare', audienceLevel: 'executive' }
      },
      contentPatterns: [],
      layoutPreferences: [
        { contentType: 'business', preferredLayouts: ['chart', 'two-column'], reasoning: 'Healthcare data visualization', confidence: 0.9 }
      ],
      complianceRequirements: [
        {
          requirement: 'HIPAA Compliance',
          description: 'No patient identifiable information',
          mandatoryElements: ['privacy notice'],
          forbiddenElements: ['patient names', 'specific dates', 'personal identifiers']
        }
      ],
      audienceAdaptations: [
        {
          audienceType: 'executives',
          adaptations: {
            terminology: 'executive',
            contentDepth: 'high-level',
            visualStyle: 'minimal',
            pacing: 'fast'
          }
        }
      ]
    });

    // Add more industry templates...
    this.initializeFinanceTemplate();
    this.initializeTechnologyTemplate();
  }

  private initializeFinanceTemplate(): void {
    this.industryTemplates.set('finance', {
      id: 'finance-template',
      name: 'Financial Services',
      industry: 'finance',
      description: 'SEC-compliant financial presentations',
      terminology: {
        'growth': { preferred: 'returns', alternatives: ['performance'], context: 'finance', audienceLevel: 'executive' },
        'customers': { preferred: 'clients', alternatives: ['investors'], context: 'finance', audienceLevel: 'general' }
      },
      contentPatterns: [],
      layoutPreferences: [
        { contentType: 'business', preferredLayouts: ['chart', 'comparison-table'], reasoning: 'Financial data requires charts', confidence: 0.95 }
      ],
      complianceRequirements: [
        {
          requirement: 'SEC Disclosure',
          description: 'Required financial disclaimers',
          mandatoryElements: ['risk disclosure', 'past performance disclaimer'],
          forbiddenElements: ['guaranteed returns', 'risk-free claims']
        }
      ],
      audienceAdaptations: [
        {
          audienceType: 'investors',
          adaptations: {
            terminology: 'technical',
            contentDepth: 'comprehensive',
            visualStyle: 'data-rich',
            pacing: 'detailed'
          }
        }
      ]
    });
  }

  private initializeTechnologyTemplate(): void {
    this.industryTemplates.set('technology', {
      id: 'tech-template',
      name: 'Technology & Software',
      industry: 'technology',
      description: 'Technical presentations with proper terminology',
      terminology: {
        'system': { preferred: 'platform', alternatives: ['infrastructure'], context: 'technology', audienceLevel: 'technical' },
        'users': { preferred: 'developers', alternatives: ['engineers'], context: 'technology', audienceLevel: 'technical' }
      },
      contentPatterns: [],
      layoutPreferences: [
        { contentType: 'technical', preferredLayouts: ['two-column', 'timeline'], reasoning: 'Technical content needs structure', confidence: 0.85 }
      ],
      complianceRequirements: [],
      audienceAdaptations: [
        {
          audienceType: 'technical',
          adaptations: {
            terminology: 'technical',
            contentDepth: 'detailed',
            visualStyle: 'data-rich',
            pacing: 'moderate'
          }
        }
      ]
    });
  }
}

// Export singleton instance
export const industryContentEngine = new IndustryContentEngine();
