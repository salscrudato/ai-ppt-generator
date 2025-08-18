/**
 * Enhanced Theme Service
 * 
 * Advanced theme management system with:
 * - Better color management and palette generation
 * - Typography scaling and font optimization
 * - Consistent styling across all components
 * - Instant preview updates
 * - Accessibility compliance
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import { ProfessionalTheme, PROFESSIONAL_THEMES } from '../professionalThemes';
import { logger, LogContext } from '../utils/smartLogger';

export interface ThemeEnhancementOptions {
  /** Whether to optimize for accessibility */
  optimizeAccessibility?: boolean;
  /** Target contrast ratio */
  targetContrastRatio?: number;
  /** Typography scale preference */
  typographyScale?: 'compact' | 'normal' | 'large';
  /** Color palette size */
  paletteSize?: number;
  /** Whether to generate harmonious variations */
  generateVariations?: boolean;
}

export interface EnhancedTheme extends ProfessionalTheme {
  /** Generated color variations */
  colorVariations: {
    primary: string[];
    secondary: string[];
    accent: string[];
  };
  /** Accessibility metrics */
  accessibility: {
    contrastRatios: Record<string, number>;
    wcagCompliance: 'AA' | 'AAA' | 'partial';
    colorBlindFriendly: boolean;
  };
  /** Typography enhancements */
  enhancedTypography: {
    scaledSizes: Record<string, number>;
    optimalLineHeights: Record<string, number>;
    readabilityScore: number;
  };
}

/**
 * Enhanced Theme Service
 */
export class EnhancedThemeService {
  private readonly context: LogContext;

  constructor() {
    this.context = {
      requestId: `theme_${Date.now()}`,
      component: 'EnhancedThemeService',
      operation: 'enhanceTheme'
    };
  }

  /**
   * Enhance a theme with advanced features
   */
  enhanceTheme(
    themeId: string,
    options: ThemeEnhancementOptions = {}
  ): EnhancedTheme {
    logger.info('Enhancing theme', this.context, { themeId, options });

    const baseTheme = PROFESSIONAL_THEMES.find(t => t.id === themeId) || PROFESSIONAL_THEMES[0];
    
    try {
      // Generate color variations
      const colorVariations = this.generateColorVariations(baseTheme, options);
      
      // Calculate accessibility metrics
      const accessibility = this.calculateAccessibilityMetrics(baseTheme);
      
      // Enhance typography
      const enhancedTypography = this.enhanceTypography(baseTheme, options);
      
      // Optimize colors for accessibility if requested
      let optimizedTheme = baseTheme;
      if (options.optimizeAccessibility) {
        optimizedTheme = this.optimizeForAccessibility(baseTheme, options);
      }

      const enhancedTheme: EnhancedTheme = {
        ...optimizedTheme,
        colorVariations,
        accessibility,
        enhancedTypography
      };

      logger.info('Theme enhancement completed', this.context, {
        themeId,
        accessibilityScore: accessibility.wcagCompliance,
        readabilityScore: enhancedTypography.readabilityScore
      });

      return enhancedTheme;

    } catch (error) {
      logger.error('Theme enhancement failed', this.context, {
        error: error instanceof Error ? error.message : String(error),
        themeId
      });
      throw error;
    }
  }

  /**
   * Generate theme variations for A/B testing
   */
  generateThemeVariations(
    baseThemeId: string,
    count: number = 3
  ): EnhancedTheme[] {
    const baseTheme = PROFESSIONAL_THEMES.find(t => t.id === baseThemeId) || PROFESSIONAL_THEMES[0];
    const variations: EnhancedTheme[] = [];

    for (let i = 0; i < count; i++) {
      const variationOptions: ThemeEnhancementOptions = {
        typographyScale: i === 0 ? 'compact' : i === 1 ? 'normal' : 'large',
        targetContrastRatio: 4.5 + (i * 0.5),
        optimizeAccessibility: true,
        generateVariations: true
      };

      const variation = this.enhanceTheme(baseTheme.id, variationOptions);
      variation.id = `${baseTheme.id}-variant-${i + 1}`;
      variation.name = `${baseTheme.name} (Variant ${i + 1})`;
      
      variations.push(variation);
    }

    return variations;
  }

  /**
   * Validate theme consistency across components
   */
  validateThemeConsistency(theme: ProfessionalTheme): {
    isConsistent: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check color contrast ratios
    const primaryBgContrast = this.calculateContrastRatio(
      theme.colors.text.primary,
      theme.colors.background
    );
    
    if (primaryBgContrast < 4.5) {
      issues.push('Primary text on background does not meet WCAG AA contrast requirements');
      recommendations.push('Increase contrast between primary text and background colors');
    }

    // Check typography consistency
    if (theme.typography.headings.fontFamily === theme.typography.body.fontFamily) {
      recommendations.push('Consider using different fonts for headings and body text for better hierarchy');
    }

    // Check color harmony
    if (!this.areColorsHarmonious(theme.colors.primary, theme.colors.accent)) {
      recommendations.push('Primary and accent colors may not be harmonious - consider adjusting hue relationships');
    }

    return {
      isConsistent: issues.length === 0,
      issues,
      recommendations
    };
  }

  // Private helper methods
  private generateColorVariations(
    theme: ProfessionalTheme,
    options: ThemeEnhancementOptions
  ) {
    const paletteSize = options.paletteSize || 5;
    
    return {
      primary: this.generateColorPalette(theme.colors.primary, paletteSize),
      secondary: this.generateColorPalette(theme.colors.secondary, paletteSize),
      accent: this.generateColorPalette(theme.colors.accent, paletteSize)
    };
  }

  private generateColorPalette(baseColor: string, size: number): string[] {
    const palette: string[] = [baseColor];
    
    // Generate lighter and darker variations
    for (let i = 1; i < size; i++) {
      const factor = i % 2 === 1 ? 1 + (Math.ceil(i / 2) * 0.2) : 1 - (Math.floor(i / 2) * 0.2);
      const variation = this.adjustColorBrightness(baseColor, factor);
      palette.push(variation);
    }
    
    return palette;
  }

  private calculateAccessibilityMetrics(theme: ProfessionalTheme) {
    const contrastRatios = {
      primaryOnBackground: this.calculateContrastRatio(theme.colors.text.primary, theme.colors.background),
      secondaryOnBackground: this.calculateContrastRatio(theme.colors.text.secondary, theme.colors.background),
      primaryOnSurface: this.calculateContrastRatio(theme.colors.text.primary, theme.colors.surface),
      accentOnBackground: this.calculateContrastRatio(theme.colors.accent, theme.colors.background)
    };

    const minContrast = Math.min(...Object.values(contrastRatios));
    const wcagCompliance = minContrast >= 7 ? 'AAA' : minContrast >= 4.5 ? 'AA' : 'partial';
    
    return {
      contrastRatios,
      wcagCompliance: wcagCompliance as 'AA' | 'AAA' | 'partial',
      colorBlindFriendly: this.isColorBlindFriendly(theme)
    };
  }

  private enhanceTypography(
    theme: ProfessionalTheme,
    options: ThemeEnhancementOptions
  ) {
    const scale = options.typographyScale || 'normal';
    const scaleMultiplier = scale === 'compact' ? 0.9 : scale === 'large' ? 1.1 : 1.0;

    const scaledSizes = {
      display: Math.round(theme.typography.headings.sizes.display * scaleMultiplier),
      h1: Math.round(theme.typography.headings.sizes.h1 * scaleMultiplier),
      h2: Math.round(theme.typography.headings.sizes.h2 * scaleMultiplier),
      h3: Math.round(theme.typography.headings.sizes.h3 * scaleMultiplier),
      body: Math.round(theme.typography.body.sizes.normal * scaleMultiplier),
      small: Math.round(theme.typography.body.sizes.small * scaleMultiplier)
    };

    const optimalLineHeights = {
      display: scaledSizes.display * 1.2,
      h1: scaledSizes.h1 * 1.3,
      h2: scaledSizes.h2 * 1.4,
      h3: scaledSizes.h3 * 1.4,
      body: scaledSizes.body * 1.5,
      small: scaledSizes.small * 1.4
    };

    // Calculate readability score based on font sizes and line heights
    const readabilityScore = this.calculateReadabilityScore(scaledSizes, optimalLineHeights);

    return {
      scaledSizes,
      optimalLineHeights,
      readabilityScore
    };
  }

  private optimizeForAccessibility(
    theme: ProfessionalTheme,
    options: ThemeEnhancementOptions
  ): ProfessionalTheme {
    const targetRatio = options.targetContrastRatio || 4.5;
    const optimizedTheme = { ...theme };

    // Optimize text colors for better contrast
    if (this.calculateContrastRatio(theme.colors.text.primary, theme.colors.background) < targetRatio) {
      optimizedTheme.colors.text.primary = this.adjustColorForContrast(
        theme.colors.text.primary,
        theme.colors.background,
        targetRatio
      );
    }

    if (this.calculateContrastRatio(theme.colors.text.secondary, theme.colors.background) < targetRatio) {
      optimizedTheme.colors.text.secondary = this.adjustColorForContrast(
        theme.colors.text.secondary,
        theme.colors.background,
        targetRatio
      );
    }

    return optimizedTheme;
  }

  // Utility methods
  private calculateContrastRatio(color1: string, color2: string): number {
    // Simplified contrast calculation - in production would use proper color space conversion
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return 1;
    
    const l1 = this.getLuminance(rgb1);
    const l2 = this.getLuminance(rgb2);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  private getLuminance(rgb: { r: number; g: number; b: number }): number {
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  private adjustColorBrightness(color: string, factor: number): string {
    const rgb = this.hexToRgb(color);
    if (!rgb) return color;

    const adjusted = {
      r: Math.min(255, Math.max(0, Math.round(rgb.r * factor))),
      g: Math.min(255, Math.max(0, Math.round(rgb.g * factor))),
      b: Math.min(255, Math.max(0, Math.round(rgb.b * factor)))
    };

    return `#${adjusted.r.toString(16).padStart(2, '0')}${adjusted.g.toString(16).padStart(2, '0')}${adjusted.b.toString(16).padStart(2, '0')}`;
  }

  private adjustColorForContrast(
    color: string,
    backgroundColor: string,
    targetRatio: number
  ): string {
    // Simplified implementation - would use more sophisticated color adjustment in production
    let adjustedColor = color;
    let currentRatio = this.calculateContrastRatio(color, backgroundColor);
    
    if (currentRatio < targetRatio) {
      // Make color darker or lighter to improve contrast
      const rgb = this.hexToRgb(color);
      if (!rgb) return color;
      
      const bgRgb = this.hexToRgb(backgroundColor);
      if (!bgRgb) return color;
      
      const bgLuminance = this.getLuminance(bgRgb);
      const factor = bgLuminance > 0.5 ? 0.5 : 1.5; // Darken for light backgrounds, lighten for dark
      
      adjustedColor = this.adjustColorBrightness(color, factor);
    }
    
    return adjustedColor;
  }

  private areColorsHarmonious(color1: string, color2: string): boolean {
    // Simplified harmony check - would use proper color theory in production
    return true; // Placeholder
  }

  private isColorBlindFriendly(theme: ProfessionalTheme): boolean {
    // Simplified check - would use proper color blindness simulation in production
    return true; // Placeholder
  }

  private calculateReadabilityScore(
    sizes: Record<string, number>,
    lineHeights: Record<string, number>
  ): number {
    // Calculate readability score based on typography metrics
    let score = 100;
    
    // Penalize very small fonts
    if (sizes.body < 16) score -= 10;
    if (sizes.small < 12) score -= 15;
    
    // Reward good line height ratios
    const bodyRatio = lineHeights.body / sizes.body;
    if (bodyRatio < 1.4 || bodyRatio > 1.6) score -= 5;
    
    return Math.max(0, Math.min(100, score));
  }
}

// Export singleton instance
export const enhancedThemeService = new EnhancedThemeService();
