/**
 * Style Consistency Engine
 * 
 * Advanced system for ensuring visual cohesion across all images in a presentation
 * with consistent prompting, style guidelines, and automated style enforcement.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import { createHash } from 'crypto';

/**
 * Style consistency configuration
 */
export interface StyleConsistencyConfig {
  presentationType: 'business' | 'creative' | 'academic' | 'technical' | 'casual' | 'marketing';
  visualStyle: 'photographic' | 'illustration' | 'flat-design' | 'isometric' | 'minimal' | 'artistic' | 'icon';
  colorScheme: 'corporate' | 'vibrant' | 'monochrome' | 'pastel' | 'bold' | 'earth-tones' | 'neon';
  mood: 'professional' | 'friendly' | 'serious' | 'playful' | 'elegant' | 'modern' | 'classic';
  complexity: 'simple' | 'moderate' | 'detailed';
  backgroundPreference: 'transparent' | 'solid' | 'gradient' | 'textured' | 'contextual';
  brandColors?: string[];
  excludeElements?: string[];
  customStyleModifiers?: string[];
}

/**
 * Style analysis result
 */
export interface StyleAnalysis {
  dominantColors: string[];
  visualComplexity: number;
  styleCategory: string;
  consistencyScore: number;
  recommendations: string[];
}

/**
 * Prompt enhancement result
 */
export interface EnhancedPrompt {
  originalPrompt: string;
  enhancedPrompt: string;
  styleModifiers: string[];
  negativePrompts: string[];
  qualityTags: string[];
  consistencyHash: string;
}

/**
 * Style Consistency Engine
 */
export class StyleConsistencyEngine {
  private config: StyleConsistencyConfig;
  private presentationStyleHash: string;
  private generatedPrompts: Map<string, EnhancedPrompt> = new Map();
  private styleTemplates: Map<string, string[]> = new Map();

  constructor(config: StyleConsistencyConfig) {
    this.config = config;
    this.presentationStyleHash = this.generateStyleHash(config);
    this.initializeStyleTemplates();
  }

  /**
   * Enhance a DALL·E prompt for style consistency
   */
  enhancePromptForConsistency(
    originalPrompt: string, 
    slideContext?: { 
      title: string; 
      layout: string; 
      index: number; 
      totalSlides: number;
    }
  ): EnhancedPrompt {
    console.log(`🎨 Enhancing prompt for style consistency: "${originalPrompt}"`);

    // Generate base style modifiers
    const styleModifiers = this.generateStyleModifiers();
    
    // Add context-specific modifiers
    const contextModifiers = slideContext ? this.generateContextModifiers(slideContext) : [];
    
    // Generate negative prompts to avoid inconsistencies
    const negativePrompts = this.generateNegativePrompts();
    
    // Add quality and technical tags
    const qualityTags = this.generateQualityTags();
    
    // Combine all elements
    const allModifiers = [
      ...styleModifiers,
      ...contextModifiers,
      ...qualityTags
    ];

    const enhancedPrompt = this.combinePromptElements(
      originalPrompt,
      allModifiers,
      negativePrompts
    );

    const result: EnhancedPrompt = {
      originalPrompt,
      enhancedPrompt,
      styleModifiers: allModifiers,
      negativePrompts,
      qualityTags,
      consistencyHash: this.presentationStyleHash
    };

    // Cache the enhanced prompt
    const promptKey = this.generatePromptKey(originalPrompt, slideContext);
    this.generatedPrompts.set(promptKey, result);

    console.log(`✅ Enhanced prompt: "${enhancedPrompt}"`);
    
    return result;
  }

  /**
   * Analyze image style consistency
   */
  async analyzeStyleConsistency(imageBuffer: Buffer, promptUsed: string): Promise<StyleAnalysis> {
    // This would integrate with computer vision APIs or local models
    // For now, we'll provide a simplified analysis based on the prompt
    
    const analysis: StyleAnalysis = {
      dominantColors: await this.extractDominantColors(imageBuffer),
      visualComplexity: this.estimateComplexityFromPrompt(promptUsed),
      styleCategory: this.config.visualStyle,
      consistencyScore: this.calculateConsistencyScore(promptUsed),
      recommendations: this.generateStyleRecommendations(promptUsed)
    };

    return analysis;
  }

  /**
   * Generate style-specific modifiers
   */
  private generateStyleModifiers(): string[] {
    const modifiers: string[] = [];

    // Visual style modifiers
    const styleTemplates = this.styleTemplates.get(this.config.visualStyle) || [];
    modifiers.push(...styleTemplates);

    // Color scheme modifiers
    modifiers.push(...this.getColorSchemeModifiers());

    // Mood modifiers
    modifiers.push(...this.getMoodModifiers());

    // Complexity modifiers
    modifiers.push(...this.getComplexityModifiers());

    // Background preference modifiers
    modifiers.push(...this.getBackgroundModifiers());

    // Brand color integration
    if (this.config.brandColors && this.config.brandColors.length > 0) {
      modifiers.push(`using brand colors ${this.config.brandColors.join(', ')}`);
    }

    // Custom modifiers
    if (this.config.customStyleModifiers) {
      modifiers.push(...this.config.customStyleModifiers);
    }

    return modifiers;
  }

  /**
   * Generate context-specific modifiers
   */
  private generateContextModifiers(context: { title: string; layout: string; index: number; totalSlides: number }): string[] {
    const modifiers: string[] = [];

    // Layout-specific modifiers
    switch (context.layout) {
      case 'title':
      case 'hero':
        modifiers.push('hero composition', 'impactful', 'attention-grabbing');
        break;
      case 'two-column':
        modifiers.push('balanced composition', 'clear focal point');
        break;
      case 'image-full':
        modifiers.push('full-frame composition', 'immersive');
        break;
      case 'section-divider':
        modifiers.push('transitional', 'conceptual');
        break;
    }

    // Position in presentation
    if (context.index === 0) {
      modifiers.push('opening slide aesthetic', 'welcoming');
    } else if (context.index === context.totalSlides - 1) {
      modifiers.push('concluding aesthetic', 'memorable');
    } else {
      modifiers.push('supporting content aesthetic');
    }

    // Presentation type specific
    switch (this.config.presentationType) {
      case 'business':
        modifiers.push('professional setting', 'corporate environment');
        break;
      case 'academic':
        modifiers.push('educational context', 'scholarly');
        break;
      case 'marketing':
        modifiers.push('marketing material', 'persuasive');
        break;
    }

    return modifiers;
  }

  /**
   * Generate negative prompts to avoid inconsistencies
   */
  private generateNegativePrompts(): string[] {
    const negativePrompts: string[] = [
      'no text in image',
      'no watermarks',
      'no signatures',
      'no logos unless specified',
      'no random elements'
    ];

    // Add style-specific negative prompts
    switch (this.config.visualStyle) {
      case 'minimal':
        negativePrompts.push('no clutter', 'no excessive details', 'no busy backgrounds');
        break;
      case 'photographic':
        negativePrompts.push('no cartoon elements', 'no illustrations mixed in');
        break;
      case 'illustration':
        negativePrompts.push('no photographic elements', 'no realistic textures');
        break;
    }

    // Add excluded elements
    if (this.config.excludeElements) {
      negativePrompts.push(...this.config.excludeElements.map(element => `no ${element}`));
    }

    return negativePrompts;
  }

  /**
   * Generate quality and technical tags
   */
  private generateQualityTags(): string[] {
    const tags = [
      'high quality',
      'professional',
      'clean composition',
      'well-lit',
      'sharp focus'
    ];

    // Add presentation-specific quality tags
    switch (this.config.presentationType) {
      case 'business':
        tags.push('corporate quality', 'presentation-ready');
        break;
      case 'academic':
        tags.push('educational quality', 'clear and informative');
        break;
      case 'creative':
        tags.push('creative excellence', 'visually striking');
        break;
    }

    return tags;
  }

  /**
   * Get color scheme modifiers
   */
  private getColorSchemeModifiers(): string[] {
    switch (this.config.colorScheme) {
      case 'corporate':
        return ['corporate color palette', 'blue and gray tones', 'professional colors'];
      case 'vibrant':
        return ['vibrant colors', 'bright palette', 'energetic colors'];
      case 'monochrome':
        return ['monochrome', 'black and white', 'grayscale palette'];
      case 'pastel':
        return ['pastel colors', 'soft tones', 'muted palette'];
      case 'bold':
        return ['bold colors', 'high contrast', 'striking palette'];
      case 'earth-tones':
        return ['earth tones', 'natural colors', 'warm palette'];
      case 'neon':
        return ['neon colors', 'electric palette', 'glowing colors'];
      default:
        return ['balanced color palette'];
    }
  }

  /**
   * Get mood modifiers
   */
  private getMoodModifiers(): string[] {
    switch (this.config.mood) {
      case 'professional':
        return ['professional atmosphere', 'business-like', 'formal'];
      case 'friendly':
        return ['friendly atmosphere', 'approachable', 'welcoming'];
      case 'serious':
        return ['serious tone', 'formal atmosphere', 'authoritative'];
      case 'playful':
        return ['playful mood', 'fun atmosphere', 'lighthearted'];
      case 'elegant':
        return ['elegant style', 'sophisticated', 'refined'];
      case 'modern':
        return ['modern aesthetic', 'contemporary', 'current'];
      case 'classic':
        return ['classic style', 'timeless', 'traditional'];
      default:
        return ['balanced mood'];
    }
  }

  /**
   * Get complexity modifiers
   */
  private getComplexityModifiers(): string[] {
    switch (this.config.complexity) {
      case 'simple':
        return ['simple composition', 'minimal elements', 'clean design'];
      case 'moderate':
        return ['balanced complexity', 'moderate detail'];
      case 'detailed':
        return ['detailed composition', 'rich elements', 'comprehensive'];
      default:
        return ['appropriate complexity'];
    }
  }

  /**
   * Get background modifiers
   */
  private getBackgroundModifiers(): string[] {
    switch (this.config.backgroundPreference) {
      case 'transparent':
        return ['transparent background', 'no background', 'isolated subject'];
      case 'solid':
        return ['solid background', 'plain background', 'uniform background'];
      case 'gradient':
        return ['gradient background', 'smooth background transition'];
      case 'textured':
        return ['textured background', 'subtle background pattern'];
      case 'contextual':
        return ['contextual background', 'relevant environment'];
      default:
        return ['appropriate background'];
    }
  }

  /**
   * Combine prompt elements into final enhanced prompt
   */
  private combinePromptElements(
    originalPrompt: string,
    modifiers: string[],
    negativePrompts: string[]
  ): string {
    // Clean and prepare original prompt
    let enhancedPrompt = originalPrompt.trim();

    // Add style modifiers
    if (modifiers.length > 0) {
      enhancedPrompt += `, ${modifiers.join(', ')}`;
    }

    // Add negative prompts (if the API supports them)
    if (negativePrompts.length > 0) {
      enhancedPrompt += ` --no ${negativePrompts.join(', ')}`;
    }

    return enhancedPrompt;
  }

  /**
   * Initialize style templates
   */
  private initializeStyleTemplates(): void {
    this.styleTemplates.set('photographic', [
      'professional photography',
      'photorealistic',
      'high-resolution photo',
      'studio lighting'
    ]);

    this.styleTemplates.set('illustration', [
      'digital illustration',
      'vector art style',
      'illustrated design',
      'artistic rendering'
    ]);

    this.styleTemplates.set('flat-design', [
      'flat design style',
      'minimal flat illustration',
      'geometric shapes',
      'clean lines'
    ]);

    this.styleTemplates.set('isometric', [
      'isometric design',
      '3D isometric view',
      'technical illustration',
      'architectural style'
    ]);

    this.styleTemplates.set('minimal', [
      'minimal design',
      'clean composition',
      'simple elements',
      'white space'
    ]);

    this.styleTemplates.set('artistic', [
      'artistic style',
      'creative interpretation',
      'expressive design',
      'artistic flair'
    ]);

    this.styleTemplates.set('icon', [
      'icon style',
      'symbolic representation',
      'simple icon design',
      'pictographic'
    ]);
  }

  /**
   * Extract dominant colors from image (simplified)
   */
  private async extractDominantColors(imageBuffer: Buffer): Promise<string[]> {
    // This would use image analysis libraries or APIs
    // For now, return colors based on the configured color scheme
    return this.getSchemeColors();
  }

  /**
   * Get colors for the configured color scheme
   */
  private getSchemeColors(): string[] {
    switch (this.config.colorScheme) {
      case 'corporate':
        return ['#0066cc', '#666666', '#ffffff'];
      case 'vibrant':
        return ['#ff6b35', '#f7931e', '#00a8cc'];
      case 'monochrome':
        return ['#000000', '#666666', '#ffffff'];
      case 'pastel':
        return ['#ffb3ba', '#bae1ff', '#ffffba'];
      case 'bold':
        return ['#ff0000', '#00ff00', '#0000ff'];
      default:
        return ['#333333', '#666666', '#999999'];
    }
  }

  /**
   * Estimate complexity from prompt
   */
  private estimateComplexityFromPrompt(prompt: string): number {
    const words = prompt.split(' ').length;
    const complexWords = prompt.match(/detailed|complex|intricate|elaborate/gi)?.length || 0;
    
    return Math.min((words / 20) + (complexWords * 0.2), 1);
  }

  /**
   * Calculate consistency score
   */
  private calculateConsistencyScore(prompt: string): number {
    // Check if prompt contains our style modifiers
    const styleModifiers = this.generateStyleModifiers();
    const matchingModifiers = styleModifiers.filter(modifier => 
      prompt.toLowerCase().includes(modifier.toLowerCase())
    ).length;
    
    return Math.min((matchingModifiers / styleModifiers.length) * 100, 100);
  }

  /**
   * Generate style recommendations
   */
  private generateStyleRecommendations(prompt: string): string[] {
    const recommendations: string[] = [];
    
    if (!prompt.includes('high quality')) {
      recommendations.push('Add quality modifiers for better results');
    }
    
    if (!prompt.includes(this.config.visualStyle)) {
      recommendations.push(`Specify ${this.config.visualStyle} style for consistency`);
    }
    
    return recommendations;
  }

  /**
   * Generate style hash for consistency tracking
   */
  private generateStyleHash(config: StyleConsistencyConfig): string {
    const configString = JSON.stringify(config, Object.keys(config).sort());
    return createHash('md5').update(configString).digest('hex').substring(0, 16);
  }

  /**
   * Generate prompt key for caching
   */
  private generatePromptKey(prompt: string, context?: any): string {
    const keyString = prompt + JSON.stringify(context || {});
    return createHash('md5').update(keyString).digest('hex');
  }

  /**
   * Get presentation style summary
   */
  getStyleSummary(): string {
    return `${this.config.presentationType} presentation with ${this.config.visualStyle} style, ${this.config.colorScheme} colors, ${this.config.mood} mood`;
  }

  /**
   * Validate style consistency across multiple prompts
   */
  validatePresentationConsistency(prompts: EnhancedPrompt[]): {
    overallScore: number;
    inconsistencies: string[];
    recommendations: string[];
  } {
    const consistencyScores = prompts.map(p => 
      this.calculateConsistencyScore(p.enhancedPrompt)
    );
    
    const overallScore = consistencyScores.reduce((sum, score) => sum + score, 0) / consistencyScores.length;
    
    const inconsistencies: string[] = [];
    const recommendations: string[] = [];
    
    if (overallScore < 70) {
      inconsistencies.push('Low overall style consistency');
      recommendations.push('Review and standardize style modifiers across all prompts');
    }
    
    return {
      overallScore,
      inconsistencies,
      recommendations
    };
  }
}
