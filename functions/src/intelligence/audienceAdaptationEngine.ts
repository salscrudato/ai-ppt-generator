/**
 * Dynamic Audience Adaptation Engine
 * 
 * Intelligent system that adapts presentation content, style, and complexity
 * based on detailed audience analysis and preferences.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import type { GenerationParams, SlideSpec } from '../schema';
import type { ContentAnalysis } from '../core/aiOrchestrator';

export interface AudienceProfile {
  id: string;
  name: string;
  description: string;
  characteristics: AudienceCharacteristics;
  preferences: AudiencePreferences;
  adaptationRules: AdaptationRule[];
  communicationStyle: CommunicationStyle;
}

export interface AudienceCharacteristics {
  expertiseLevel: 'novice' | 'intermediate' | 'expert' | 'mixed';
  attentionSpan: 'short' | 'medium' | 'long';
  decisionMakingStyle: 'analytical' | 'intuitive' | 'consensus' | 'directive';
  informationProcessing: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  culturalContext: 'western' | 'eastern' | 'global' | 'local';
  generationalCohort: 'gen-z' | 'millennial' | 'gen-x' | 'boomer' | 'mixed';
}

export interface AudiencePreferences {
  contentDepth: 'overview' | 'detailed' | 'comprehensive';
  visualComplexity: 'minimal' | 'moderate' | 'rich';
  dataPresentation: 'simplified' | 'standard' | 'detailed';
  narrativeStyle: 'story-driven' | 'fact-based' | 'problem-solution';
  interactionLevel: 'passive' | 'moderate' | 'highly-interactive';
  pacing: 'fast' | 'moderate' | 'deliberate';
}

export interface AdaptationRule {
  condition: string;
  adaptation: {
    contentModification: string;
    layoutPreference: string;
    visualAdjustment: string;
    tonalShift: string;
  };
  priority: number;
}

export interface CommunicationStyle {
  formality: 'casual' | 'business-casual' | 'formal' | 'academic';
  directness: 'indirect' | 'moderate' | 'direct';
  emotionalTone: 'neutral' | 'enthusiastic' | 'authoritative' | 'empathetic';
  technicalLanguage: 'avoid' | 'minimal' | 'moderate' | 'extensive';
}

export interface AdaptationResult {
  adaptedSlide: SlideSpec;
  adaptationsSummary: string[];
  confidenceScore: number;
  recommendations: string[];
}

/**
 * Audience Adaptation Engine
 */
export class AudienceAdaptationEngine {
  private audienceProfiles: Map<string, AudienceProfile>;
  private adaptationHistory: Map<string, AdaptationResult[]>;

  constructor() {
    this.audienceProfiles = new Map();
    this.adaptationHistory = new Map();
    this.initializeAudienceProfiles();
  }

  /**
   * Adapt content for specific audience
   */
  async adaptForAudience(
    slide: SlideSpec,
    params: GenerationParams,
    analysis: ContentAnalysis
  ): Promise<AdaptationResult> {
    console.log('👥 Adapting content for audience:', params.audience);

    const audienceProfile = this.getAudienceProfile(params.audience);
    const detailedProfile = this.enhanceProfileWithContext(audienceProfile, params, analysis);
    
    const adaptedSlide = await this.applyAdaptations(slide, detailedProfile, params);
    const adaptationsSummary = this.generateAdaptationsSummary(slide, adaptedSlide, detailedProfile);
    
    const result: AdaptationResult = {
      adaptedSlide,
      adaptationsSummary,
      confidenceScore: this.calculateAdaptationConfidence(detailedProfile, adaptationsSummary),
      recommendations: this.generateRecommendations(detailedProfile, adaptedSlide)
    };

    // Store adaptation history for learning
    this.storeAdaptationHistory(params.audience, result);

    console.log(`✅ Audience adaptation complete. Confidence: ${Math.round(result.confidenceScore * 100)}%`);
    return result;
  }

  /**
   * Get audience profile with fallback
   */
  private getAudienceProfile(audienceType: string): AudienceProfile {
    return this.audienceProfiles.get(audienceType) || this.audienceProfiles.get('general')!;
  }

  /**
   * Enhance profile with contextual information
   */
  private enhanceProfileWithContext(
    baseProfile: AudienceProfile,
    params: GenerationParams,
    analysis: ContentAnalysis
  ): AudienceProfile {
    const enhanced = { ...baseProfile };

    // Adjust expertise level based on content complexity
    if (analysis.complexity === 'expert' && enhanced.characteristics.expertiseLevel === 'intermediate') {
      enhanced.characteristics.expertiseLevel = 'expert';
    }

    // Adjust preferences based on content length
    if (params.contentLength === 'comprehensive') {
      enhanced.preferences.contentDepth = 'comprehensive';
      enhanced.characteristics.attentionSpan = 'long';
    }

    // Adjust based on tone
    if (params.tone === 'casual') {
      enhanced.communicationStyle.formality = 'casual';
    } else if (params.tone === 'authoritative') {
      enhanced.communicationStyle.formality = 'formal';
      enhanced.communicationStyle.emotionalTone = 'authoritative';
    }

    return enhanced;
  }

  /**
   * Apply audience-specific adaptations
   */
  private async applyAdaptations(
    slide: SlideSpec,
    profile: AudienceProfile,
    params: GenerationParams
  ): Promise<SlideSpec> {
    let adapted = { ...slide };

    // Apply content depth adaptations
    adapted = this.adaptContentDepth(adapted, profile.preferences.contentDepth);

    // Apply communication style adaptations
    adapted = this.adaptCommunicationStyle(adapted, profile.communicationStyle);

    // Apply expertise level adaptations
    adapted = this.adaptForExpertiseLevel(adapted, profile.characteristics.expertiseLevel);

    // Apply cultural context adaptations
    adapted = this.adaptForCulturalContext(adapted, profile.characteristics.culturalContext);

    // Apply generational adaptations
    adapted = this.adaptForGeneration(adapted, profile.characteristics.generationalCohort);

    // Apply layout preferences based on information processing style
    adapted = this.adaptLayoutForProcessingStyle(adapted, profile.characteristics.informationProcessing);

    return adapted;
  }

  /**
   * Adapt content depth
   */
  private adaptContentDepth(slide: SlideSpec, depth: 'overview' | 'detailed' | 'comprehensive'): SlideSpec {
    const adapted = { ...slide };

    switch (depth) {
      case 'overview':
        // Simplify and reduce content
        if (adapted.bullets && adapted.bullets.length > 4) {
          adapted.bullets = adapted.bullets.slice(0, 4);
        }
        if (adapted.paragraph && adapted.paragraph.length > 200) {
          adapted.paragraph = adapted.paragraph.slice(0, 197) + '...';
        }
        break;

      case 'comprehensive':
        // Add more detail and context
        if (adapted.bullets) {
          adapted.bullets = adapted.bullets.map(bullet => 
            bullet.length < 80 ? this.expandBulletPoint(bullet) : bullet
          );
        }
        break;

      case 'detailed':
      default:
        // Keep as is
        break;
    }

    return adapted;
  }

  /**
   * Adapt communication style
   */
  private adaptCommunicationStyle(slide: SlideSpec, style: CommunicationStyle): SlideSpec {
    const adapted = { ...slide };

    // Adjust formality
    if (style.formality === 'casual') {
      adapted.title = this.makeCasual(adapted.title || '');
      if (adapted.bullets) {
        adapted.bullets = adapted.bullets.map(bullet => this.makeCasual(bullet));
      }
    } else if (style.formality === 'formal') {
      adapted.title = this.makeFormal(adapted.title || '');
      if (adapted.bullets) {
        adapted.bullets = adapted.bullets.map(bullet => this.makeFormal(bullet));
      }
    }

    // Adjust directness
    if (style.directness === 'direct') {
      adapted.title = this.makeMoreDirect(adapted.title || '');
      if (adapted.bullets) {
        adapted.bullets = adapted.bullets.map(bullet => this.makeMoreDirect(bullet));
      }
    }

    // Adjust technical language
    if (style.technicalLanguage === 'avoid') {
      adapted.title = this.simplifyTechnicalLanguage(adapted.title || '');
      if (adapted.bullets) {
        adapted.bullets = adapted.bullets.map(bullet => this.simplifyTechnicalLanguage(bullet));
      }
    }

    return adapted;
  }

  /**
   * Adapt for expertise level
   */
  private adaptForExpertiseLevel(slide: SlideSpec, level: 'novice' | 'intermediate' | 'expert' | 'mixed'): SlideSpec {
    const adapted = { ...slide };

    switch (level) {
      case 'novice':
        // Add explanations and simplify
        adapted.title = this.addExplanations(adapted.title || '');
        if (adapted.bullets) {
          adapted.bullets = adapted.bullets.map(bullet => this.addExplanations(bullet));
        }
        break;

      case 'expert':
        // Use more precise terminology
        adapted.title = this.usePreciseTerminology(adapted.title || '');
        if (adapted.bullets) {
          adapted.bullets = adapted.bullets.map(bullet => this.usePreciseTerminology(bullet));
        }
        break;

      case 'mixed':
        // Balance accessibility with precision
        adapted.title = this.balanceAccessibility(adapted.title || '');
        if (adapted.bullets) {
          adapted.bullets = adapted.bullets.map(bullet => this.balanceAccessibility(bullet));
        }
        break;
    }

    return adapted;
  }

  /**
   * Adapt for cultural context
   */
  private adaptForCulturalContext(slide: SlideSpec, context: 'western' | 'eastern' | 'global' | 'local'): SlideSpec {
    const adapted = { ...slide };

    switch (context) {
      case 'eastern':
        // More indirect communication, group focus
        adapted.title = this.makeMoreIndirect(adapted.title || '');
        break;

      case 'global':
        // Avoid cultural references, use universal concepts
        adapted.title = this.makeGloballyAccessible(adapted.title || '');
        if (adapted.bullets) {
          adapted.bullets = adapted.bullets.map(bullet => this.makeGloballyAccessible(bullet));
        }
        break;
    }

    return adapted;
  }

  /**
   * Adapt for generational preferences
   */
  private adaptForGeneration(slide: SlideSpec, generation: 'gen-z' | 'millennial' | 'gen-x' | 'boomer' | 'mixed'): SlideSpec {
    const adapted = { ...slide };

    switch (generation) {
      case 'gen-z':
        // Concise, visual, authentic
        adapted.title = this.makeConciseAndAuthentic(adapted.title || '');
        break;

      case 'boomer':
        // More detailed, traditional structure
        adapted.title = this.makeTraditionallyStructured(adapted.title || '');
        break;
    }

    return adapted;
  }

  /**
   * Adapt layout for information processing style
   */
  private adaptLayoutForProcessingStyle(
    slide: SlideSpec,
    style: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
  ): SlideSpec {
    const adapted = { ...slide };

    switch (style) {
      case 'visual':
        // Prefer chart, timeline, or image layouts
        if (adapted.layout === 'title-bullets') {
          adapted.layout = 'mixed-content';
        }
        break;

      case 'reading':
        // Prefer text-heavy layouts
        if (adapted.layout === 'chart') {
          adapted.layout = 'title-bullets';
        }
        break;
    }

    return adapted;
  }

  /**
   * Content transformation helpers
   */
  private expandBulletPoint(bullet: string): string {
    return bullet + ' with detailed implementation and expected outcomes';
  }

  private makeCasual(text: string): string {
    return text.replace(/utilize/gi, 'use')
               .replace(/implement/gi, 'put in place')
               .replace(/facilitate/gi, 'help');
  }

  private makeFormal(text: string): string {
    return text.replace(/use/gi, 'utilize')
               .replace(/help/gi, 'facilitate')
               .replace(/get/gi, 'obtain');
  }

  private makeMoreDirect(text: string): string {
    return text.replace(/we believe that/gi, '')
               .replace(/it appears that/gi, '')
               .replace(/potentially/gi, '');
  }

  private simplifyTechnicalLanguage(text: string): string {
    const simplifications = {
      'optimization': 'improvement',
      'implementation': 'setup',
      'methodology': 'method',
      'infrastructure': 'system',
      'architecture': 'structure'
    };

    let simplified = text;
    Object.entries(simplifications).forEach(([technical, simple]) => {
      const regex = new RegExp(`\\b${technical}\\b`, 'gi');
      simplified = simplified.replace(regex, simple);
    });

    return simplified;
  }

  private addExplanations(text: string): string {
    // Add brief explanations for complex terms
    return text.replace(/ROI/gi, 'ROI (Return on Investment)')
               .replace(/KPI/gi, 'KPI (Key Performance Indicator)')
               .replace(/API/gi, 'API (Application Programming Interface)');
  }

  private usePreciseTerminology(text: string): string {
    return text.replace(/improve/gi, 'optimize')
               .replace(/change/gi, 'transform')
               .replace(/use/gi, 'leverage');
  }

  private balanceAccessibility(text: string): string {
    // Balance between accessibility and precision
    return text.replace(/leverage/gi, 'use effectively')
               .replace(/optimize/gi, 'improve efficiently');
  }

  private makeMoreIndirect(text: string): string {
    return text.replace(/We will/gi, 'We might consider')
               .replace(/must/gi, 'should')
               .replace(/will achieve/gi, 'may achieve');
  }

  private makeGloballyAccessible(text: string): string {
    // Remove cultural references and use universal concepts
    return text.replace(/home run/gi, 'great success')
               .replace(/touchdown/gi, 'achievement')
               .replace(/slam dunk/gi, 'certain success');
  }

  private makeConciseAndAuthentic(text: string): string {
    return text.replace(/in order to/gi, 'to')
               .replace(/at this point in time/gi, 'now')
               .replace(/due to the fact that/gi, 'because');
  }

  private makeTraditionallyStructured(text: string): string {
    // Add more formal structure and detail
    if (!text.includes(':') && text.length > 20) {
      const parts = text.split(' ');
      if (parts.length > 5) {
        return `${parts.slice(0, 3).join(' ')}: ${parts.slice(3).join(' ')}`;
      }
    }
    return text;
  }

  /**
   * Generate adaptations summary
   */
  private generateAdaptationsSummary(
    original: SlideSpec,
    adapted: SlideSpec,
    profile: AudienceProfile
  ): string[] {
    const summary: string[] = [];

    if (original.title !== adapted.title) {
      summary.push(`Adapted title for ${profile.communicationStyle.formality} communication style`);
    }

    if (original.bullets?.length !== adapted.bullets?.length) {
      summary.push(`Adjusted content depth for ${profile.preferences.contentDepth} level`);
    }

    if (original.layout !== adapted.layout) {
      summary.push(`Changed layout to match ${profile.characteristics.informationProcessing} processing style`);
    }

    summary.push(`Applied ${profile.name} audience profile adaptations`);

    return summary;
  }

  private calculateAdaptationConfidence(profile: AudienceProfile, adaptations: string[]): number {
    // Base confidence on profile completeness and number of adaptations
    const profileCompleteness = Object.values(profile.characteristics).filter(v => v !== 'mixed').length / 6;
    const adaptationScore = Math.min(adaptations.length / 3, 1);
    
    return (profileCompleteness + adaptationScore) / 2;
  }

  private generateRecommendations(profile: AudienceProfile, slide: SlideSpec): string[] {
    const recommendations: string[] = [];

    if (profile.characteristics.attentionSpan === 'short' && slide.bullets && slide.bullets.length > 5) {
      recommendations.push('Consider reducing bullet points for better attention retention');
    }

    if (profile.preferences.visualComplexity === 'rich' && slide.layout === 'title-bullets') {
      recommendations.push('Consider adding visual elements like charts or images');
    }

    if (profile.characteristics.expertiseLevel === 'expert' && !slide.notes) {
      recommendations.push('Add detailed speaker notes for expert audience');
    }

    return recommendations;
  }

  private storeAdaptationHistory(audience: string, result: AdaptationResult): void {
    if (!this.adaptationHistory.has(audience)) {
      this.adaptationHistory.set(audience, []);
    }
    
    const history = this.adaptationHistory.get(audience)!;
    history.push(result);
    
    // Keep only last 10 adaptations
    if (history.length > 10) {
      history.shift();
    }
  }

  /**
   * Initialize audience profiles
   */
  private initializeAudienceProfiles(): void {
    // Executive audience profile
    this.audienceProfiles.set('executives', {
      id: 'executives',
      name: 'Executive Leadership',
      description: 'C-level executives and senior decision makers',
      characteristics: {
        expertiseLevel: 'expert',
        attentionSpan: 'short',
        decisionMakingStyle: 'directive',
        informationProcessing: 'visual',
        culturalContext: 'western',
        generationalCohort: 'mixed'
      },
      preferences: {
        contentDepth: 'overview',
        visualComplexity: 'minimal',
        dataPresentation: 'simplified',
        narrativeStyle: 'problem-solution',
        interactionLevel: 'passive',
        pacing: 'fast'
      },
      adaptationRules: [],
      communicationStyle: {
        formality: 'formal',
        directness: 'direct',
        emotionalTone: 'authoritative',
        technicalLanguage: 'minimal'
      }
    });

    // Technical audience profile
    this.audienceProfiles.set('technical', {
      id: 'technical',
      name: 'Technical Professionals',
      description: 'Engineers, developers, and technical specialists',
      characteristics: {
        expertiseLevel: 'expert',
        attentionSpan: 'long',
        decisionMakingStyle: 'analytical',
        informationProcessing: 'reading',
        culturalContext: 'global',
        generationalCohort: 'millennial'
      },
      preferences: {
        contentDepth: 'comprehensive',
        visualComplexity: 'rich',
        dataPresentation: 'detailed',
        narrativeStyle: 'fact-based',
        interactionLevel: 'highly-interactive',
        pacing: 'deliberate'
      },
      adaptationRules: [],
      communicationStyle: {
        formality: 'business-casual',
        directness: 'direct',
        emotionalTone: 'neutral',
        technicalLanguage: 'extensive'
      }
    });

    // General audience profile (fallback)
    this.audienceProfiles.set('general', {
      id: 'general',
      name: 'General Audience',
      description: 'Mixed audience with varied backgrounds',
      characteristics: {
        expertiseLevel: 'intermediate',
        attentionSpan: 'medium',
        decisionMakingStyle: 'consensus',
        informationProcessing: 'visual',
        culturalContext: 'global',
        generationalCohort: 'mixed'
      },
      preferences: {
        contentDepth: 'detailed',
        visualComplexity: 'moderate',
        dataPresentation: 'standard',
        narrativeStyle: 'story-driven',
        interactionLevel: 'moderate',
        pacing: 'moderate'
      },
      adaptationRules: [],
      communicationStyle: {
        formality: 'business-casual',
        directness: 'moderate',
        emotionalTone: 'neutral',
        technicalLanguage: 'moderate'
      }
    });
  }
}

// Export singleton instance
export const audienceAdaptationEngine = new AudienceAdaptationEngine();
