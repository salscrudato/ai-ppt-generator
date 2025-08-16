/**
 * Enhanced Theme System
 * 
 * Advanced theme management with modern color palettes, sophisticated gradients,
 * and intelligent theme selection based on content and industry context.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import type { ProfessionalTheme } from '../../professionalThemes';
import type { ContentAnalysis } from '../aiOrchestrator';

export interface EnhancedTheme extends ProfessionalTheme {
  modernGradients: {
    primary: GradientDefinition;
    secondary: GradientDefinition;
    accent: GradientDefinition;
    background: GradientDefinition;
  };
  semanticColors: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  accessibility: {
    contrastRatio: number;
    colorBlindFriendly: boolean;
    highContrast: boolean;
  };
  modernEffects: {
    shadows: ShadowDefinition[];
    borders: BorderDefinition[];
    animations: AnimationDefinition[];
  };
}

export interface GradientDefinition {
  type: 'linear' | 'radial';
  angle?: number;
  colors: Array<{
    color: string;
    position: number;
    opacity?: number;
  }>;
}

export interface ShadowDefinition {
  name: string;
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
  opacity: number;
}

export interface BorderDefinition {
  name: string;
  width: number;
  style: 'solid' | 'dashed' | 'dotted';
  color: string;
  radius?: number;
}

export interface AnimationDefinition {
  name: string;
  type: 'fade' | 'slide' | 'zoom' | 'bounce';
  duration: number;
  easing: string;
}

/**
 * Enhanced Theme Manager
 */
export class EnhancedThemeManager {
  private modernThemes: Map<string, EnhancedTheme>;
  private industryMappings: Map<string, string[]>;
  private contentMappings: Map<string, string[]>;

  constructor() {
    this.modernThemes = new Map();
    this.industryMappings = new Map();
    this.contentMappings = new Map();
    this.initializeModernThemes();
    this.initializeMappings();
  }

  /**
   * Select optimal theme based on content analysis and context
   */
  selectOptimalTheme(
    analysis: ContentAnalysis,
    context: {
      industry?: string;
      audience?: string;
      tone?: string;
      brandColors?: string[];
    }
  ): EnhancedTheme {
    console.log('🎨 Selecting optimal theme based on content analysis...');

    // Score themes based on multiple factors
    const themeScores = Array.from(this.modernThemes.entries()).map(([id, theme]) => ({
      id,
      theme,
      score: this.calculateThemeScore(theme, analysis, context)
    }));

    // Sort by score and select best
    themeScores.sort((a, b) => b.score - a.score);
    const selectedTheme = themeScores[0];

    console.log('✅ Theme selected:', selectedTheme.id, 'with score:', Math.round(selectedTheme.score * 100));

    return selectedTheme.theme;
  }

  /**
   * Customize theme with brand colors
   */
  customizeTheme(
    baseTheme: EnhancedTheme,
    customization: {
      primaryColor?: string;
      secondaryColor?: string;
      accentColor?: string;
      brandColors?: string[];
      fontFamily?: string;
    }
  ): EnhancedTheme {
    const customTheme = { ...baseTheme };

    if (customization.primaryColor) {
      customTheme.colors.primary = customization.primaryColor;
      customTheme.modernGradients.primary = this.generateGradientFromColor(customization.primaryColor);
    }

    if (customization.secondaryColor) {
      customTheme.colors.secondary = customization.secondaryColor;
      customTheme.modernGradients.secondary = this.generateGradientFromColor(customization.secondaryColor);
    }

    if (customization.accentColor) {
      customTheme.colors.accent = customization.accentColor;
      customTheme.modernGradients.accent = this.generateGradientFromColor(customization.accentColor);
    }

    if (customization.fontFamily) {
      customTheme.typography.headings.fontFamily = customization.fontFamily;
      customTheme.typography.body.fontFamily = customization.fontFamily;
    }

    return customTheme;
  }

  /**
   * Generate accessible color palette
   */
  generateAccessiblePalette(baseColor: string): {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  } {
    // This would implement sophisticated color theory algorithms
    // For now, return a basic implementation
    return {
      primary: baseColor,
      secondary: this.lightenColor(baseColor, 20),
      accent: this.complementaryColor(baseColor),
      text: this.getContrastingTextColor(baseColor),
      background: '#FFFFFF'
    };
  }

  /**
   * Calculate theme score based on content and context
   */
  private calculateThemeScore(
    theme: EnhancedTheme,
    analysis: ContentAnalysis,
    context: any
  ): number {
    let score = 0;

    // Category alignment
    if (theme.category === analysis.category) {
      score += 0.4;
    }

    // Industry alignment
    if (context.industry && this.industryMappings.get(context.industry)?.includes(theme.id)) {
      score += 0.3;
    }

    // Tone alignment
    if (context.tone) {
      score += this.calculateToneAlignment(theme, context.tone) * 0.2;
    }

    // Accessibility score
    if (theme.accessibility.colorBlindFriendly) {
      score += 0.1;
    }

    return Math.min(score, 1);
  }

  private calculateToneAlignment(theme: EnhancedTheme, tone: string): number {
    const toneMap: Record<string, string[]> = {
      professional: ['corporate-blue', 'finance-navy', 'consulting-charcoal'],
      creative: ['creative-purple', 'vibrant-coral', 'aurora-gradient'],
      friendly: ['ocean-breeze', 'soft-mint', 'warm-sunset'],
      authoritative: ['deep-navy', 'executive-black', 'premium-gold']
    };

    return toneMap[tone]?.includes(theme.id) ? 1 : 0.5;
  }

  private generateGradientFromColor(color: string): GradientDefinition {
    return {
      type: 'linear',
      angle: 135,
      colors: [
        { color: color, position: 0 },
        { color: this.lightenColor(color, 15), position: 100 }
      ]
    };
  }

  private lightenColor(color: string, percent: number): string {
    // Basic color lightening implementation
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const newR = Math.min(255, Math.round(r + (255 - r) * percent / 100));
    const newG = Math.min(255, Math.round(g + (255 - g) * percent / 100));
    const newB = Math.min(255, Math.round(b + (255 - b) * percent / 100));

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  private complementaryColor(color: string): string {
    // Basic complementary color calculation
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const compR = 255 - r;
    const compG = 255 - g;
    const compB = 255 - b;

    return `#${compR.toString(16).padStart(2, '0')}${compG.toString(16).padStart(2, '0')}${compB.toString(16).padStart(2, '0')}`;
  }

  private getContrastingTextColor(backgroundColor: string): string {
    // Calculate luminance and return appropriate text color
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }

  private initializeModernThemes(): void {
    // Initialize with enhanced versions of existing themes
    // This would be expanded with full theme definitions
  }

  private initializeMappings(): void {
    // Industry mappings
    this.industryMappings.set('technology', ['tech-gradient', 'modern-blue', 'innovation-purple']);
    this.industryMappings.set('finance', ['finance-navy', 'corporate-blue', 'premium-gold']);
    this.industryMappings.set('healthcare', ['healthcare-teal', 'medical-blue', 'wellness-green']);
    this.industryMappings.set('education', ['education-green', 'academic-blue', 'learning-orange']);
    this.industryMappings.set('creative', ['creative-purple', 'vibrant-coral', 'aurora-gradient']);

    // Content type mappings
    this.contentMappings.set('business', ['corporate-blue', 'finance-navy', 'executive-black']);
    this.contentMappings.set('technical', ['tech-gradient', 'modern-blue', 'developer-dark']);
    this.contentMappings.set('creative', ['creative-purple', 'vibrant-coral', 'artistic-gradient']);
    this.contentMappings.set('educational', ['education-green', 'academic-blue', 'learning-orange']);
  }
}

// Export singleton instance
export const enhancedThemeManager = new EnhancedThemeManager();
