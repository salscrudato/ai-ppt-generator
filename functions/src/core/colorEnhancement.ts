/**
 * Advanced Color Enhancement Pipeline
 * 
 * Comprehensive color processing system for optimizing images for presentation
 * display with brightness, contrast, saturation, and professional color grading.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import sharp from 'sharp';

/**
 * Color enhancement configuration
 */
export interface ColorEnhancementConfig {
  // Basic adjustments
  brightness: number;      // -100 to 100
  contrast: number;        // -100 to 100
  saturation: number;      // -100 to 100
  vibrance: number;        // -100 to 100
  
  // Advanced adjustments
  highlights: number;      // -100 to 100
  shadows: number;         // -100 to 100
  whites: number;          // -100 to 100
  blacks: number;          // -100 to 100
  
  // Color grading
  temperature: number;     // -100 to 100 (cool to warm)
  tint: number;           // -100 to 100 (green to magenta)
  
  // Presentation optimization
  projectorOptimization: boolean;
  screenType: 'lcd' | 'oled' | 'projector' | 'print';
  ambientLighting: 'bright' | 'normal' | 'dim';
  
  // Automatic enhancements
  autoLevels: boolean;
  autoColor: boolean;
  autoContrast: boolean;
  
  // Professional presets
  preset?: 'presentation' | 'print' | 'web' | 'projector' | 'custom';
}

/**
 * Color analysis result
 */
export interface ColorAnalysis {
  histogram: {
    red: number[];
    green: number[];
    blue: number[];
  };
  dominantColors: string[];
  averageBrightness: number;
  contrast: number;
  colorfulness: number;
  temperature: 'warm' | 'neutral' | 'cool';
  recommendations: string[];
}

/**
 * Enhancement result
 */
export interface ColorEnhancementResult {
  buffer: Buffer;
  appliedAdjustments: Partial<ColorEnhancementConfig>;
  beforeAnalysis: ColorAnalysis;
  afterAnalysis: ColorAnalysis;
  improvementScore: number;
  processingTime: number;
}

/**
 * Color Enhancement Pipeline
 */
export class ColorEnhancer {
  private config: ColorEnhancementConfig;

  constructor(config: Partial<ColorEnhancementConfig> = {}) {
    this.config = {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      vibrance: 0,
      highlights: 0,
      shadows: 0,
      whites: 0,
      blacks: 0,
      temperature: 0,
      tint: 0,
      projectorOptimization: false,
      screenType: 'lcd',
      ambientLighting: 'normal',
      autoLevels: false,
      autoColor: false,
      autoContrast: false,
      ...config
    };

    // Apply preset if specified
    if (config.preset) {
      this.applyPreset(config.preset);
    }
  }

  /**
   * Enhance image colors for presentation display
   */
  async enhanceColors(buffer: Buffer): Promise<ColorEnhancementResult> {
    const startTime = Date.now();
    
    console.log('🌈 Starting color enhancement pipeline...');

    // Analyze original image
    const beforeAnalysis = await this.analyzeColors(buffer);
    
    // Determine optimal adjustments
    const optimalAdjustments = await this.calculateOptimalAdjustments(beforeAnalysis);
    
    // Apply enhancements
    let enhancedBuffer = await this.applyColorEnhancements(buffer, optimalAdjustments);
    
    // Apply presentation-specific optimizations
    if (this.config.projectorOptimization || this.config.screenType === 'projector') {
      enhancedBuffer = await this.optimizeForProjector(enhancedBuffer);
    }
    
    // Analyze enhanced image
    const afterAnalysis = await this.analyzeColors(enhancedBuffer);
    
    // Calculate improvement score
    const improvementScore = this.calculateImprovementScore(beforeAnalysis, afterAnalysis);
    
    const result: ColorEnhancementResult = {
      buffer: enhancedBuffer,
      appliedAdjustments: optimalAdjustments,
      beforeAnalysis,
      afterAnalysis,
      improvementScore,
      processingTime: Date.now() - startTime
    };

    console.log(`✅ Color enhancement complete: ${improvementScore}% improvement, ${result.processingTime}ms`);
    
    return result;
  }

  /**
   * Analyze image colors and characteristics
   */
  private async analyzeColors(buffer: Buffer): Promise<ColorAnalysis> {
    const stats = await sharp(buffer).stats();
    const metadata = await sharp(buffer).metadata();
    
    // Calculate average brightness
    const averageBrightness = stats.channels.reduce((sum: number, channel: any) =>
      sum + channel.mean, 0) / stats.channels.length;

    // Calculate contrast (simplified)
    const contrast = stats.channels.reduce((sum: number, channel: any) =>
      sum + channel.stdev, 0) / stats.channels.length;
    
    // Calculate colorfulness
    const colorfulness = this.calculateColorfulness(stats);
    
    // Determine temperature
    const temperature = this.determineTemperature(stats);
    
    // Extract dominant colors (simplified)
    const dominantColors = await this.extractDominantColors(buffer);
    
    // Generate recommendations
    const recommendations = this.generateColorRecommendations(averageBrightness, contrast, colorfulness);
    
    return {
      histogram: {
        red: Array(256).fill(0),   // Simplified - would be actual histogram
        green: Array(256).fill(0),
        blue: Array(256).fill(0)
      },
      dominantColors,
      averageBrightness: averageBrightness / 255,
      contrast: contrast / 255,
      colorfulness,
      temperature,
      recommendations
    };
  }

  /**
   * Calculate optimal color adjustments
   */
  private async calculateOptimalAdjustments(analysis: ColorAnalysis): Promise<Partial<ColorEnhancementConfig>> {
    const adjustments: Partial<ColorEnhancementConfig> = { ...this.config };
    
    // Auto-adjust brightness for presentation visibility
    if (this.config.autoLevels || analysis.averageBrightness < 0.4) {
      const brightnessBoost = Math.min((0.5 - analysis.averageBrightness) * 100, 30);
      adjustments.brightness = (adjustments.brightness || 0) + brightnessBoost;
    }
    
    // Auto-adjust contrast for better visibility
    if (this.config.autoContrast || analysis.contrast < 0.3) {
      const contrastBoost = Math.min((0.4 - analysis.contrast) * 100, 25);
      adjustments.contrast = (adjustments.contrast || 0) + contrastBoost;
    }
    
    // Adjust for screen type
    switch (this.config.screenType) {
      case 'projector':
        adjustments.brightness = (adjustments.brightness || 0) + 15;
        adjustments.contrast = (adjustments.contrast || 0) + 20;
        adjustments.saturation = (adjustments.saturation || 0) + 10;
        break;
      case 'oled':
        adjustments.contrast = (adjustments.contrast || 0) + 10;
        adjustments.blacks = (adjustments.blacks || 0) - 10;
        break;
    }
    
    // Adjust for ambient lighting
    switch (this.config.ambientLighting) {
      case 'bright':
        adjustments.brightness = (adjustments.brightness || 0) + 20;
        adjustments.contrast = (adjustments.contrast || 0) + 15;
        break;
      case 'dim':
        adjustments.brightness = (adjustments.brightness || 0) - 5;
        adjustments.contrast = (adjustments.contrast || 0) - 5;
        break;
    }
    
    return adjustments;
  }

  /**
   * Apply color enhancements to image
   */
  private async applyColorEnhancements(
    buffer: Buffer, 
    adjustments: Partial<ColorEnhancementConfig>
  ): Promise<Buffer> {
    let sharpInstance = sharp(buffer);
    
    // Apply basic adjustments
    if (adjustments.brightness || adjustments.saturation) {
      const brightness = 1 + (adjustments.brightness || 0) / 100;
      const saturation = 1 + (adjustments.saturation || 0) / 100;
      
      sharpInstance = sharpInstance.modulate({
        brightness,
        saturation
      });
    }
    
    // Apply contrast
    if (adjustments.contrast) {
      const contrast = 1 + (adjustments.contrast || 0) / 100;
      sharpInstance = sharpInstance.linear(contrast, -(128 * contrast) + 128);
    }
    
    // Apply gamma correction for better midtones
    if (adjustments.highlights || adjustments.shadows) {
      const gamma = this.calculateGammaFromAdjustments(adjustments);
      sharpInstance = sharpInstance.gamma(gamma);
    }
    
    // Apply color temperature adjustment
    if (adjustments.temperature) {
      sharpInstance = await this.applyTemperatureAdjustment(sharpInstance, adjustments.temperature);
    }
    
    // Apply tint adjustment
    if (adjustments.tint) {
      sharpInstance = await this.applyTintAdjustment(sharpInstance, adjustments.tint);
    }
    
    return await sharpInstance.toBuffer();
  }

  /**
   * Optimize image specifically for projector display
   */
  private async optimizeForProjector(buffer: Buffer): Promise<Buffer> {
    return await sharp(buffer)
      // Increase brightness and contrast for projector visibility
      .modulate({ brightness: 1.15, saturation: 1.1 })
      .linear(1.2, -25) // Increase contrast
      // Sharpen slightly for better projection clarity
      .sharpen(1, 1, 2)
      .toBuffer();
  }

  /**
   * Apply color temperature adjustment
   */
  private async applyTemperatureAdjustment(sharpInstance: sharp.Sharp, temperature: number): Promise<sharp.Sharp> {
    // Temperature adjustment using color matrix
    const tempFactor = temperature / 100;
    
    if (tempFactor > 0) {
      // Warmer (more red/yellow)
      return sharpInstance.tint({ r: 255 + tempFactor * 20, g: 255, b: 255 - tempFactor * 20 });
    } else {
      // Cooler (more blue)
      return sharpInstance.tint({ r: 255 + tempFactor * 20, g: 255, b: 255 - tempFactor * 20 });
    }
  }

  /**
   * Apply tint adjustment
   */
  private async applyTintAdjustment(sharpInstance: sharp.Sharp, tint: number): Promise<sharp.Sharp> {
    // Tint adjustment (green-magenta)
    const tintFactor = tint / 100;
    
    if (tintFactor > 0) {
      // More magenta
      return sharpInstance.tint({ r: 255 + tintFactor * 10, g: 255 - tintFactor * 10, b: 255 + tintFactor * 5 });
    } else {
      // More green
      return sharpInstance.tint({ r: 255 + tintFactor * 10, g: 255 - tintFactor * 10, b: 255 + tintFactor * 5 });
    }
  }

  /**
   * Calculate colorfulness metric
   */
  private calculateColorfulness(stats: sharp.Stats): number {
    // Simplified colorfulness calculation
    const rgbStdev = [stats.channels[0].stdev, stats.channels[1].stdev, stats.channels[2].stdev];
    const avgStdev = rgbStdev.reduce((sum, val) => sum + val, 0) / 3;
    return Math.min(avgStdev / 50, 1); // Normalize to 0-1
  }

  /**
   * Determine color temperature
   */
  private determineTemperature(stats: sharp.Stats): 'warm' | 'neutral' | 'cool' {
    const redMean = stats.channels[0].mean;
    const blueMean = stats.channels[2].mean;
    const ratio = redMean / blueMean;
    
    if (ratio > 1.1) return 'warm';
    if (ratio < 0.9) return 'cool';
    return 'neutral';
  }

  /**
   * Extract dominant colors (simplified)
   */
  private async extractDominantColors(buffer: Buffer): Promise<string[]> {
    // This would use more sophisticated color quantization
    // For now, return a simplified result
    return ['#333333', '#666666', '#999999'];
  }

  /**
   * Generate color recommendations
   */
  private generateColorRecommendations(brightness: number, contrast: number, colorfulness: number): string[] {
    const recommendations: string[] = [];
    
    if (brightness < 0.3) {
      recommendations.push('Increase brightness for better visibility');
    }
    
    if (contrast < 0.25) {
      recommendations.push('Increase contrast for better definition');
    }
    
    if (colorfulness < 0.3) {
      recommendations.push('Increase saturation for more vibrant colors');
    }
    
    return recommendations;
  }

  /**
   * Calculate gamma from highlight/shadow adjustments
   */
  private calculateGammaFromAdjustments(adjustments: Partial<ColorEnhancementConfig>): number {
    const highlights = adjustments.highlights || 0;
    const shadows = adjustments.shadows || 0;
    
    // Simplified gamma calculation
    const gammaAdjustment = (highlights - shadows) / 200;
    return Math.max(0.5, Math.min(2.0, 1.0 + gammaAdjustment));
  }

  /**
   * Calculate improvement score
   */
  private calculateImprovementScore(before: ColorAnalysis, after: ColorAnalysis): number {
    let score = 0;
    
    // Brightness improvement
    const brightnessImprovement = Math.abs(0.5 - after.averageBrightness) < Math.abs(0.5 - before.averageBrightness);
    if (brightnessImprovement) score += 25;
    
    // Contrast improvement
    if (after.contrast > before.contrast) score += 25;
    
    // Colorfulness improvement
    if (after.colorfulness > before.colorfulness) score += 25;
    
    // Overall enhancement
    if (after.averageBrightness > 0.3 && after.contrast > 0.25) score += 25;
    
    return Math.min(score, 100);
  }

  /**
   * Apply color enhancement preset
   */
  private applyPreset(preset: string): void {
    switch (preset) {
      case 'presentation':
        this.config = {
          ...this.config,
          brightness: 10,
          contrast: 15,
          saturation: 5,
          projectorOptimization: true,
          autoLevels: true,
          autoContrast: true
        };
        break;
      case 'projector':
        this.config = {
          ...this.config,
          brightness: 20,
          contrast: 25,
          saturation: 10,
          projectorOptimization: true,
          screenType: 'projector'
        };
        break;
      case 'print':
        this.config = {
          ...this.config,
          brightness: -5,
          contrast: 10,
          saturation: -5,
          projectorOptimization: false
        };
        break;
      case 'web':
        this.config = {
          ...this.config,
          brightness: 5,
          contrast: 10,
          saturation: 5,
          vibrance: 10
        };
        break;
    }
  }

  /**
   * Get optimal settings for presentation type
   */
  static getOptimalSettings(presentationType: 'business' | 'creative' | 'academic'): Partial<ColorEnhancementConfig> {
    switch (presentationType) {
      case 'business':
        return {
          preset: 'presentation',
          brightness: 10,
          contrast: 15,
          saturation: 0,
          projectorOptimization: true
        };
      case 'creative':
        return {
          brightness: 5,
          contrast: 20,
          saturation: 15,
          vibrance: 10
        };
      case 'academic':
        return {
          preset: 'presentation',
          brightness: 15,
          contrast: 20,
          saturation: 5
        };
      default:
        return { preset: 'presentation' };
    }
  }
}
