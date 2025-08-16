/**
 * Dynamic Theme Generator
 * 
 * Advanced theme generation system that creates sophisticated,
 * context-aware themes with dynamic color palettes, intelligent
 * typography pairing, and modern visual effects.
 * 
 * Features:
 * - AI-powered color palette generation
 * - Intelligent typography pairing
 * - Dynamic visual effects and gradients
 * - Brand-aware theme customization
 * - Accessibility-compliant color schemes
 * - Industry-specific theme adaptations
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import { ProfessionalTheme } from '../../professionalThemes';
import { ContentAnalysis } from '../aiOrchestrator';
import { GenerationParams } from '../../schema';

/**
 * Color harmony types for palette generation
 */
export type ColorHarmony = 
  | 'monochromatic' 
  | 'analogous' 
  | 'complementary' 
  | 'triadic' 
  | 'tetradic' 
  | 'split-complementary';

/**
 * Visual style categories
 */
export type VisualStyle = 
  | 'minimal' 
  | 'modern' 
  | 'corporate' 
  | 'creative' 
  | 'luxury' 
  | 'tech' 
  | 'organic' 
  | 'bold';

/**
 * Dynamic theme configuration
 */
export interface DynamicThemeConfig {
  baseColor: string;
  harmony: ColorHarmony;
  style: VisualStyle;
  industry?: string;
  audience?: string;
  mood?: 'energetic' | 'calm' | 'professional' | 'innovative' | 'trustworthy';
  accessibility: 'AA' | 'AAA';
  brandColors?: string[];
}

/**
 * Generated color palette
 */
export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    inverse: string;
    muted: string;
  };
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  borders: {
    light: string;
    medium: string;
    strong: string;
  };
  chart: string[];
  gradients: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
}

/**
 * Typography configuration
 */
export interface TypographyConfig {
  headingFont: string;
  bodyFont: string;
  scale: 'compact' | 'normal' | 'expanded';
  weight: 'light' | 'normal' | 'bold';
  contrast: 'low' | 'medium' | 'high';
}

/**
 * Visual effects configuration
 */
export interface VisualEffects {
  shadows: {
    subtle: string;
    medium: string;
    strong: string;
  };
  borders: {
    radius: number;
    style: 'none' | 'subtle' | 'prominent';
  };
  animations: {
    duration: 'fast' | 'normal' | 'slow';
    easing: 'linear' | 'ease' | 'bounce';
  };
  textures: {
    background: 'none' | 'subtle' | 'prominent';
    overlay: 'none' | 'light' | 'dark';
  };
}

/**
 * Dynamic Theme Generator class
 */
export class DynamicThemeGenerator {
  private colorHarmonies: Record<ColorHarmony, (base: string) => string[]>;
  private industryMappings: Record<string, Partial<DynamicThemeConfig>>;
  private audienceMappings: Record<string, Partial<DynamicThemeConfig>>;

  constructor() {
    this.colorHarmonies = this.initializeColorHarmonies();
    this.industryMappings = this.initializeIndustryMappings();
    this.audienceMappings = this.initializeAudienceMappings();
  }

  /**
   * Generate a dynamic theme based on content analysis and user preferences
   */
  async generateTheme(
    params: GenerationParams,
    analysis: ContentAnalysis,
    customConfig?: Partial<DynamicThemeConfig>
  ): Promise<ProfessionalTheme> {
    console.log('🎨 Generating dynamic theme...');

    // Determine optimal theme configuration
    const config = this.buildThemeConfig(params, analysis, customConfig);
    
    // Generate color palette
    const palette = this.generateColorPalette(config);
    
    // Generate typography configuration
    const typography = this.generateTypography(config);
    
    // Generate visual effects
    const effects = this.generateVisualEffects(config);
    
    // Combine into professional theme
    const theme = this.buildProfessionalTheme(config, palette, typography, effects);
    
    console.log('✅ Dynamic theme generated:', {
      style: config.style,
      harmony: config.harmony,
      primaryColor: palette.primary
    });

    return theme;
  }

  /**
   * Build theme configuration from inputs
   */
  private buildThemeConfig(
    params: GenerationParams,
    analysis: ContentAnalysis,
    customConfig?: Partial<DynamicThemeConfig>
  ): DynamicThemeConfig {
    // Start with intelligent defaults
    let config: DynamicThemeConfig = {
      baseColor: this.selectBaseColor(analysis, params),
      harmony: this.selectColorHarmony(analysis, params),
      style: this.selectVisualStyle(analysis, params),
      industry: params.industry,
      audience: params.audience,
      mood: this.selectMood(analysis, params),
      accessibility: 'AA' // Default to WCAG AA compliance
    };

    // Apply industry-specific overrides
    if (params.industry && this.industryMappings[params.industry]) {
      config = { ...config, ...this.industryMappings[params.industry] };
    }

    // Apply audience-specific overrides
    if (params.audience && this.audienceMappings[params.audience]) {
      config = { ...config, ...this.audienceMappings[params.audience] };
    }

    // Apply custom overrides
    if (customConfig) {
      config = { ...config, ...customConfig };
    }

    return config;
  }

  /**
   * Generate color palette based on configuration
   */
  private generateColorPalette(config: DynamicThemeConfig): ColorPalette {
    const harmonyColors = this.colorHarmonies[config.harmony](config.baseColor);
    
    // Ensure accessibility compliance
    const accessibleColors = this.ensureAccessibility(harmonyColors, config.accessibility);
    
    return {
      primary: accessibleColors[0],
      secondary: accessibleColors[1],
      accent: accessibleColors[2],
      background: this.generateBackground(config),
      surface: this.generateSurface(config),
      text: this.generateTextColors(accessibleColors, config),
      semantic: this.generateSemanticColors(config),
      borders: this.generateBorderColors(accessibleColors),
      chart: this.generateChartColors(accessibleColors),
      gradients: this.generateGradients(accessibleColors)
    };
  }

  /**
   * Generate typography configuration
   */
  private generateTypography(config: DynamicThemeConfig): TypographyConfig {
    const fontPairs = this.getOptimalFontPairing(config.style, config.mood);
    
    return {
      headingFont: fontPairs.heading,
      bodyFont: fontPairs.body,
      scale: this.selectTypographyScale(config),
      weight: this.selectTypographyWeight(config),
      contrast: this.selectTypographyContrast(config)
    };
  }

  /**
   * Generate visual effects configuration
   */
  private generateVisualEffects(config: DynamicThemeConfig): VisualEffects {
    return {
      shadows: this.generateShadows(config),
      borders: this.generateBorders(config),
      animations: this.generateAnimations(config),
      textures: this.generateTextures(config)
    };
  }

  /**
   * Select base color based on content analysis
   */
  private selectBaseColor(analysis: ContentAnalysis, params: GenerationParams): string {
    // Industry-specific color mappings
    const industryColors: Record<string, string> = {
      finance: '#1E40AF', // Professional blue
      healthcare: '#059669', // Medical green
      technology: '#7C3AED', // Tech purple
      education: '#0891B2', // Academic teal
      marketing: '#EC4899', // Creative pink
      consulting: '#374151', // Professional gray
      retail: '#F59E0B', // Retail orange
      manufacturing: '#DC2626' // Industrial red
    };

    // Mood-based color selection
    const moodColors: Record<string, string> = {
      energetic: '#EF4444', // Vibrant red
      calm: '#06B6D4', // Calming blue
      professional: '#1F2937', // Professional dark
      innovative: '#8B5CF6', // Innovation purple
      trustworthy: '#1E40AF' // Trust blue
    };

    // Check for industry-specific color
    if (params.industry && industryColors[params.industry]) {
      return industryColors[params.industry];
    }

    // Check for mood-based color
    const mood = this.selectMood(analysis, params);
    if (mood && moodColors[mood]) {
      return moodColors[mood];
    }

    // Analyze content sentiment for color selection
    switch (analysis.sentiment) {
      case 'positive':
        return '#10B981'; // Success green
      case 'negative':
        return '#EF4444'; // Alert red
      case 'mixed':
        return '#F59E0B'; // Balanced orange
      default:
        return '#1E40AF'; // Professional blue
    }
  }

  /**
   * Select color harmony based on content and style
   */
  private selectColorHarmony(analysis: ContentAnalysis, params: GenerationParams): ColorHarmony {
    // Creative content benefits from more complex harmonies
    if (analysis.category === 'creative') {
      return 'triadic';
    }

    // Technical content works well with complementary colors
    if (analysis.category === 'technical') {
      return 'complementary';
    }

    // Business content typically uses analogous or monochromatic
    if (analysis.category === 'business') {
      return params.tone === 'professional' ? 'monochromatic' : 'analogous';
    }

    // Default to analogous for balanced appeal
    return 'analogous';
  }

  /**
   * Select visual style based on analysis
   */
  private selectVisualStyle(analysis: ContentAnalysis, params: GenerationParams): VisualStyle {
    // Map content categories to visual styles
    const categoryStyles: Record<string, VisualStyle> = {
      business: 'corporate',
      technical: 'tech',
      creative: 'creative',
      educational: 'modern',
      scientific: 'minimal'
    };

    // Map audiences to visual styles
    const audienceStyles: Record<string, VisualStyle> = {
      executives: 'luxury',
      technical: 'tech',
      marketing: 'creative',
      students: 'modern',
      investors: 'corporate'
    };

    // Check audience preference first
    if (params.audience && audienceStyles[params.audience]) {
      return audienceStyles[params.audience];
    }

    // Fall back to category-based style
    return categoryStyles[analysis.category] || 'modern';
  }

  /**
   * Select mood based on content and tone
   */
  private selectMood(analysis: ContentAnalysis, params: GenerationParams): DynamicThemeConfig['mood'] {
    // Map tones to moods
    const toneMoods: Record<string, DynamicThemeConfig['mood']> = {
      professional: 'professional',
      inspiring: 'energetic',
      casual: 'calm',
      persuasive: 'innovative',
      educational: 'trustworthy'
    };

    return toneMoods[params.tone] || 'professional';
  }

  /**
   * Initialize color harmony algorithms
   */
  private initializeColorHarmonies(): Record<ColorHarmony, (base: string) => string[]> {
    return {
      monochromatic: (base: string) => this.generateMonochromatic(base),
      analogous: (base: string) => this.generateAnalogous(base),
      complementary: (base: string) => this.generateComplementary(base),
      triadic: (base: string) => this.generateTriadic(base),
      tetradic: (base: string) => this.generateTetradic(base),
      'split-complementary': (base: string) => this.generateSplitComplementary(base)
    };
  }

  /**
   * Generate monochromatic color scheme
   */
  private generateMonochromatic(base: string): string[] {
    const hsl = this.hexToHsl(base);
    return [
      base, // Primary
      this.hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 0.2, 0.1)), // Darker
      this.hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 0.2, 0.9)), // Lighter
      this.hslToHex(hsl.h, Math.max(hsl.s - 0.3, 0.1), hsl.l), // Desaturated
      this.hslToHex(hsl.h, Math.min(hsl.s + 0.2, 1), hsl.l) // More saturated
    ];
  }

  /**
   * Generate analogous color scheme
   */
  private generateAnalogous(base: string): string[] {
    const hsl = this.hexToHsl(base);
    return [
      base, // Primary
      this.hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l), // +30 degrees
      this.hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l), // -30 degrees
      this.hslToHex((hsl.h + 60) % 360, hsl.s * 0.8, hsl.l), // +60 degrees, less saturated
      this.hslToHex((hsl.h - 60 + 360) % 360, hsl.s * 0.8, hsl.l) // -60 degrees, less saturated
    ];
  }

  /**
   * Generate complementary color scheme
   */
  private generateComplementary(base: string): string[] {
    const hsl = this.hexToHsl(base);
    const complement = (hsl.h + 180) % 360;
    return [
      base, // Primary
      this.hslToHex(complement, hsl.s, hsl.l), // Complement
      this.hslToHex(hsl.h, hsl.s * 0.6, hsl.l), // Desaturated primary
      this.hslToHex(complement, hsl.s * 0.6, hsl.l), // Desaturated complement
      this.hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 0.3, 0.9)) // Lighter primary
    ];
  }

  /**
   * Generate triadic color scheme
   */
  private generateTriadic(base: string): string[] {
    const hsl = this.hexToHsl(base);
    return [
      base, // Primary
      this.hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l), // +120 degrees
      this.hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l), // +240 degrees
      this.hslToHex(hsl.h, hsl.s * 0.7, hsl.l), // Desaturated primary
      this.hslToHex((hsl.h + 120) % 360, hsl.s * 0.7, hsl.l) // Desaturated secondary
    ];
  }

  /**
   * Generate tetradic color scheme
   */
  private generateTetradic(base: string): string[] {
    const hsl = this.hexToHsl(base);
    return [
      base, // Primary
      this.hslToHex((hsl.h + 90) % 360, hsl.s, hsl.l), // +90 degrees
      this.hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l), // +180 degrees
      this.hslToHex((hsl.h + 270) % 360, hsl.s, hsl.l), // +270 degrees
      this.hslToHex(hsl.h, hsl.s * 0.5, hsl.l) // Neutral
    ];
  }

  /**
   * Generate split-complementary color scheme
   */
  private generateSplitComplementary(base: string): string[] {
    const hsl = this.hexToHsl(base);
    const complement = (hsl.h + 180) % 360;
    return [
      base, // Primary
      this.hslToHex((complement - 30 + 360) % 360, hsl.s, hsl.l), // Split complement 1
      this.hslToHex((complement + 30) % 360, hsl.s, hsl.l), // Split complement 2
      this.hslToHex(hsl.h, hsl.s * 0.6, hsl.l), // Desaturated primary
      this.hslToHex(complement, hsl.s * 0.4, hsl.l) // Muted complement
    ];
  }

  /**
   * Convert hex color to HSL
   */
  private hexToHsl(hex: string): { h: number; s: number; l: number } {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: h * 360, s, l };
  }

  /**
   * Convert HSL to hex color
   */
  private hslToHex(h: number, s: number, l: number): string {
    h = h / 360;
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  /**
   * Ensure color accessibility compliance
   */
  private ensureAccessibility(colors: string[], level: 'AA' | 'AAA'): string[] {
    const minContrast = level === 'AAA' ? 7 : 4.5;
    const backgroundColor = '#FFFFFF';

    return colors.map(color => {
      const contrast = this.calculateContrast(color, backgroundColor);
      if (contrast >= minContrast) {
        return color;
      }

      // Adjust color to meet contrast requirements
      return this.adjustColorForContrast(color, backgroundColor, minContrast);
    });
  }

  /**
   * Calculate contrast ratio between two colors
   */
  private calculateContrast(color1: string, color2: string): number {
    const lum1 = this.getLuminance(color1);
    const lum2 = this.getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  }

  /**
   * Get relative luminance of a color
   */
  private getLuminance(hex: string): number {
    const rgb = [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16)
    ].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  }

  /**
   * Adjust color to meet contrast requirements
   */
  private adjustColorForContrast(color: string, background: string, minContrast: number): string {
    const hsl = this.hexToHsl(color);
    let adjustedL = hsl.l;

    // Try darkening first
    while (adjustedL > 0.1) {
      adjustedL -= 0.05;
      const adjustedColor = this.hslToHex(hsl.h, hsl.s, adjustedL);
      if (this.calculateContrast(adjustedColor, background) >= minContrast) {
        return adjustedColor;
      }
    }

    // If darkening doesn't work, try lightening
    adjustedL = hsl.l;
    while (adjustedL < 0.9) {
      adjustedL += 0.05;
      const adjustedColor = this.hslToHex(hsl.h, hsl.s, adjustedL);
      if (this.calculateContrast(adjustedColor, background) >= minContrast) {
        return adjustedColor;
      }
    }

    // Fallback to high contrast color
    return hsl.l > 0.5 ? '#000000' : '#FFFFFF';
  }

  /**
   * Generate background color
   */
  private generateBackground(config: DynamicThemeConfig): string {
    switch (config.style) {
      case 'minimal':
      case 'modern':
        return '#FFFFFF';
      case 'corporate':
        return '#FAFAFA';
      case 'luxury':
        return '#F8F9FA';
      case 'tech':
        return '#F1F5F9';
      case 'creative':
        return '#FEFEFE';
      default:
        return '#FFFFFF';
    }
  }

  /**
   * Generate surface color
   */
  private generateSurface(config: DynamicThemeConfig): string {
    const bg = this.generateBackground(config);
    const hsl = this.hexToHsl(bg);
    return this.hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 0.05, 0));
  }

  /**
   * Generate text colors
   */
  private generateTextColors(colors: string[], config: DynamicThemeConfig): ColorPalette['text'] {
    return {
      primary: '#1F2937',
      secondary: '#6B7280',
      inverse: '#FFFFFF',
      muted: '#9CA3AF'
    };
  }

  /**
   * Generate semantic colors
   */
  private generateSemanticColors(config: DynamicThemeConfig): ColorPalette['semantic'] {
    return {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: config.baseColor
    };
  }

  /**
   * Generate border colors
   */
  private generateBorderColors(colors: string[]): ColorPalette['borders'] {
    return {
      light: '#F3F4F6',
      medium: '#E5E7EB',
      strong: '#D1D5DB'
    };
  }

  /**
   * Generate chart colors
   */
  private generateChartColors(colors: string[]): string[] {
    return colors.slice(0, 8).concat([
      '#8B5CF6', '#EC4899', '#06B6D4', '#10B981',
      '#F59E0B', '#EF4444', '#14B8A6', '#F97316'
    ]).slice(0, 8);
  }

  /**
   * Generate gradients
   */
  private generateGradients(colors: string[]): ColorPalette['gradients'] {
    const [primary, secondary, accent] = colors;
    return {
      primary: `linear-gradient(135deg, ${primary} 0%, ${this.lightenColor(primary, 0.2)} 100%)`,
      secondary: `linear-gradient(135deg, ${secondary} 0%, ${this.lightenColor(secondary, 0.2)} 100%)`,
      accent: `linear-gradient(135deg, ${accent} 0%, ${this.lightenColor(accent, 0.2)} 100%)`,
      background: `linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)`
    };
  }

  /**
   * Lighten a color by a percentage
   */
  private lightenColor(hex: string, percent: number): string {
    const hsl = this.hexToHsl(hex);
    return this.hslToHex(hsl.h, hsl.s, Math.min(hsl.l + percent, 1));
  }

  /**
   * Get optimal font pairing for style and mood
   */
  private getOptimalFontPairing(style: VisualStyle, mood?: DynamicThemeConfig['mood']): { heading: string; body: string } {
    const fontPairings: Record<VisualStyle, { heading: string; body: string }> = {
      minimal: { heading: 'Inter', body: 'Inter' },
      modern: { heading: 'Poppins', body: 'Inter' },
      corporate: { heading: 'Roboto', body: 'Open Sans' },
      creative: { heading: 'Montserrat', body: 'Source Sans Pro' },
      luxury: { heading: 'Playfair Display', body: 'Source Sans Pro' },
      tech: { heading: 'JetBrains Mono', body: 'Roboto' },
      organic: { heading: 'Nunito', body: 'Nunito Sans' },
      bold: { heading: 'Oswald', body: 'Lato' }
    };

    return fontPairings[style] || fontPairings.modern;
  }

  /**
   * Select typography scale
   */
  private selectTypographyScale(config: DynamicThemeConfig): TypographyConfig['scale'] {
    if (config.style === 'luxury' || config.style === 'bold') return 'expanded';
    if (config.style === 'minimal' || config.style === 'tech') return 'compact';
    return 'normal';
  }

  /**
   * Select typography weight
   */
  private selectTypographyWeight(config: DynamicThemeConfig): TypographyConfig['weight'] {
    if (config.style === 'bold' || config.style === 'corporate') return 'bold';
    if (config.style === 'minimal' || config.style === 'luxury') return 'light';
    return 'normal';
  }

  /**
   * Select typography contrast
   */
  private selectTypographyContrast(config: DynamicThemeConfig): TypographyConfig['contrast'] {
    if (config.accessibility === 'AAA') return 'high';
    if (config.style === 'minimal') return 'low';
    return 'medium';
  }

  /**
   * Generate shadows configuration
   */
  private generateShadows(config: DynamicThemeConfig): VisualEffects['shadows'] {
    const shadowIntensity = config.style === 'minimal' ? 'subtle' :
                           config.style === 'luxury' ? 'strong' : 'medium';

    const shadows = {
      subtle: {
        subtle: '0 1px 2px rgba(0, 0, 0, 0.05)',
        medium: '0 2px 4px rgba(0, 0, 0, 0.06)',
        strong: '0 4px 6px rgba(0, 0, 0, 0.07)'
      },
      medium: {
        subtle: '0 2px 4px rgba(0, 0, 0, 0.06)',
        medium: '0 4px 6px rgba(0, 0, 0, 0.07)',
        strong: '0 10px 15px rgba(0, 0, 0, 0.1)'
      },
      strong: {
        subtle: '0 4px 6px rgba(0, 0, 0, 0.07)',
        medium: '0 10px 15px rgba(0, 0, 0, 0.1)',
        strong: '0 20px 25px rgba(0, 0, 0, 0.15)'
      }
    };

    return shadows[shadowIntensity];
  }

  /**
   * Generate borders configuration
   */
  private generateBorders(config: DynamicThemeConfig): VisualEffects['borders'] {
    const radiusMap = {
      minimal: 0,
      modern: 0.056,
      corporate: 0.028,
      creative: 0.111,
      luxury: 0.083,
      tech: 0.028,
      organic: 0.139,
      bold: 0.056
    };

    const styleMap = {
      minimal: 'none' as const,
      modern: 'subtle' as const,
      corporate: 'subtle' as const,
      creative: 'prominent' as const,
      luxury: 'prominent' as const,
      tech: 'subtle' as const,
      organic: 'subtle' as const,
      bold: 'prominent' as const
    };

    return {
      radius: radiusMap[config.style] || 0.056,
      style: styleMap[config.style] || 'subtle'
    };
  }

  /**
   * Generate animations configuration
   */
  private generateAnimations(config: DynamicThemeConfig): VisualEffects['animations'] {
    const durationMap = {
      minimal: 'fast' as const,
      modern: 'normal' as const,
      corporate: 'normal' as const,
      creative: 'slow' as const,
      luxury: 'slow' as const,
      tech: 'fast' as const,
      organic: 'normal' as const,
      bold: 'fast' as const
    };

    const easingMap = {
      minimal: 'linear' as const,
      modern: 'ease' as const,
      corporate: 'ease' as const,
      creative: 'bounce' as const,
      luxury: 'ease' as const,
      tech: 'linear' as const,
      organic: 'ease' as const,
      bold: 'bounce' as const
    };

    return {
      duration: durationMap[config.style] || 'normal',
      easing: easingMap[config.style] || 'ease'
    };
  }

  /**
   * Generate textures configuration
   */
  private generateTextures(config: DynamicThemeConfig): VisualEffects['textures'] {
    const backgroundMap = {
      minimal: 'none' as const,
      modern: 'none' as const,
      corporate: 'subtle' as const,
      creative: 'prominent' as const,
      luxury: 'prominent' as const,
      tech: 'subtle' as const,
      organic: 'subtle' as const,
      bold: 'prominent' as const
    };

    return {
      background: backgroundMap[config.style] || 'none',
      overlay: config.style === 'luxury' || config.style === 'creative' ? 'light' : 'none'
    };
  }

  /**
   * Build final professional theme
   */
  private buildProfessionalTheme(
    config: DynamicThemeConfig,
    palette: ColorPalette,
    typography: TypographyConfig,
    effects: VisualEffects
  ): ProfessionalTheme {
    return {
      id: `dynamic-${config.style}-${Date.now()}`,
      name: `Dynamic ${config.style.charAt(0).toUpperCase() + config.style.slice(1)} Theme`,
      category: this.mapStyleToCategory(config.style),
      colors: {
        primary: palette.primary,
        secondary: palette.secondary,
        accent: palette.accent,
        background: palette.background,
        surface: palette.surface,
        text: palette.text,
        semantic: palette.semantic,
        borders: palette.borders
      },
      typography: {
        headings: {
          fontFamily: typography.headingFont,
          fontWeight: {
            light: 300,
            normal: typography.weight === 'bold' ? 700 : typography.weight === 'light' ? 300 : 400,
            semibold: 600,
            bold: 700,
            extrabold: 800
          },
          sizes: {
            display: 48,
            h1: 36,
            h2: 30,
            h3: 24,
            h4: 20
          },
          lineHeight: {
            tight: 1.1,
            normal: 1.2,
            relaxed: 1.4
          }
        },
        body: {
          fontFamily: typography.bodyFont,
          fontWeight: {
            light: 300,
            normal: 400,
            medium: 500,
            semibold: 600
          },
          sizes: {
            large: 18,
            normal: 16,
            small: 14,
            tiny: 12
          },
          lineHeight: {
            tight: 1.3,
            normal: 1.5,
            relaxed: 1.7
          }
        }
      },
      effects: {
        borderRadius: {
          small: effects.borders.radius * 0.5,
          medium: effects.borders.radius,
          large: effects.borders.radius * 2,
          full: 9999
        },
        shadows: {
          subtle: effects.shadows.subtle,
          medium: effects.shadows.medium,
          strong: effects.shadows.strong,
          colored: effects.shadows.medium,
          glow: effects.shadows.strong,
          inset: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
          elevated: effects.shadows.strong
        },
        gradients: {
          primary: palette.gradients.primary,
          secondary: palette.gradients.secondary,
          accent: palette.gradients.accent,
          background: palette.gradients.background,
          mesh: palette.gradients.primary,
          subtle: palette.gradients.background,
          vibrant: palette.gradients.accent
        },
        animations: {
          fadeIn: `opacity ${effects.animations.duration === 'fast' ? '0.15s' : effects.animations.duration === 'slow' ? '0.5s' : '0.3s'} ease`,
          slideUp: `transform ${effects.animations.duration === 'fast' ? '0.15s' : effects.animations.duration === 'slow' ? '0.5s' : '0.3s'} ease`,
          scaleIn: `transform ${effects.animations.duration === 'fast' ? '0.15s' : effects.animations.duration === 'slow' ? '0.5s' : '0.3s'} ease`,
          bounce: `transform ${effects.animations.duration === 'fast' ? '0.15s' : effects.animations.duration === 'slow' ? '0.5s' : '0.3s'} cubic-bezier(0.68, -0.55, 0.265, 1.55)`
        }
      },
      spacing: {
        xs: 0.25,
        sm: 0.5,
        md: 1,
        lg: 1.5,
        xl: 2,
        xxl: 3,
        xxxl: 4
      },
      layout: {
        margins: {
          top: 0.5,
          bottom: 0.5,
          left: 0.5,
          right: 0.5
        },
        contentArea: {
          maxWidth: 9.0,
          padding: 0.5
        },
        grid: {
          columns: 12,
          gutter: 0.5,
          baseline: 1.5
        }
      }
    };
  }

  /**
   * Map visual style to theme category
   */
  private mapStyleToCategory(style: VisualStyle): ProfessionalTheme['category'] {
    const categoryMap: Record<VisualStyle, ProfessionalTheme['category']> = {
      minimal: 'modern',
      modern: 'modern',
      corporate: 'corporate',
      creative: 'creative',
      luxury: 'corporate',
      tech: 'modern',
      organic: 'creative',
      bold: 'creative'
    };

    return categoryMap[style] || 'modern';
  }

  /**
   * Initialize industry-specific mappings
   */
  private initializeIndustryMappings(): Record<string, Partial<DynamicThemeConfig>> {
    return {
      finance: {
        style: 'corporate',
        harmony: 'monochromatic',
        mood: 'trustworthy',
        accessibility: 'AAA'
      },
      healthcare: {
        style: 'minimal',
        harmony: 'analogous',
        mood: 'calm',
        accessibility: 'AAA'
      },
      technology: {
        style: 'tech',
        harmony: 'complementary',
        mood: 'innovative',
        accessibility: 'AA'
      },
      education: {
        style: 'modern',
        harmony: 'analogous',
        mood: 'trustworthy',
        accessibility: 'AAA'
      },
      marketing: {
        style: 'creative',
        harmony: 'triadic',
        mood: 'energetic',
        accessibility: 'AA'
      },
      consulting: {
        style: 'luxury',
        harmony: 'monochromatic',
        mood: 'professional',
        accessibility: 'AAA'
      }
    };
  }

  /**
   * Initialize audience-specific mappings
   */
  private initializeAudienceMappings(): Record<string, Partial<DynamicThemeConfig>> {
    return {
      executives: {
        style: 'luxury',
        harmony: 'monochromatic',
        mood: 'professional',
        accessibility: 'AAA'
      },
      technical: {
        style: 'tech',
        harmony: 'complementary',
        mood: 'professional',
        accessibility: 'AA'
      },
      marketing: {
        style: 'creative',
        harmony: 'triadic',
        mood: 'energetic',
        accessibility: 'AA'
      },
      students: {
        style: 'modern',
        harmony: 'analogous',
        mood: 'calm',
        accessibility: 'AAA'
      },
      investors: {
        style: 'corporate',
        harmony: 'monochromatic',
        mood: 'trustworthy',
        accessibility: 'AAA'
      }
    };
  }
}

/**
 * Export singleton instance
 */
export const dynamicThemeGenerator = new DynamicThemeGenerator();
