/**
 * Advanced Background Removal System
 * 
 * Comprehensive background removal and transparency handling system
 * for seamless slide integration with multiple removal strategies.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import sharp from 'sharp';
import axios from 'axios';

/**
 * Background removal configuration
 */
export interface BackgroundRemovalConfig {
  method: 'remove-bg' | 'local-ai' | 'color-key' | 'edge-detection' | 'auto';
  apiKey?: string;
  colorKeySettings?: {
    targetColor: string;
    tolerance: number;
    featherEdges: boolean;
  };
  edgeDetectionSettings?: {
    threshold: number;
    morphology: boolean;
    smoothing: number;
  };
  outputFormat: 'png' | 'webp';
  preserveQuality: boolean;
  fallbackStrategy: 'transparent' | 'white' | 'blur';
}

/**
 * Background removal result
 */
export interface BackgroundRemovalResult {
  buffer: Buffer;
  hasTransparency: boolean;
  confidence: number;
  method: string;
  processingTime: number;
  originalSize: number;
  finalSize: number;
  edgeQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

/**
 * Background Removal Service
 */
export class BackgroundRemover {
  private config: BackgroundRemovalConfig;
  private cache: Map<string, BackgroundRemovalResult> = new Map();

  constructor(config: Partial<BackgroundRemovalConfig> = {}) {
    this.config = {
      method: 'auto',
      outputFormat: 'png',
      preserveQuality: true,
      fallbackStrategy: 'transparent',
      colorKeySettings: {
        targetColor: '#ffffff',
        tolerance: 10,
        featherEdges: true
      },
      edgeDetectionSettings: {
        threshold: 128,
        morphology: true,
        smoothing: 2
      },
      ...config
    };
  }

  /**
   * Remove background from image
   */
  async removeBackground(buffer: Buffer): Promise<BackgroundRemovalResult> {
    const startTime = Date.now();
    const originalSize = buffer.length;

    console.log(`🎭 Starting background removal using ${this.config.method} method`);

    try {
      let result: BackgroundRemovalResult;

      switch (this.config.method) {
        case 'remove-bg':
          result = await this.removeWithRemoveBg(buffer);
          break;
        case 'local-ai':
          result = await this.removeWithLocalAI(buffer);
          break;
        case 'color-key':
          result = await this.removeWithColorKey(buffer);
          break;
        case 'edge-detection':
          result = await this.removeWithEdgeDetection(buffer);
          break;
        case 'auto':
        default:
          result = await this.autoRemoveBackground(buffer);
          break;
      }

      result.processingTime = Date.now() - startTime;
      result.originalSize = originalSize;

      console.log(`✅ Background removal complete: ${result.method}, confidence: ${result.confidence}%, ${result.processingTime}ms`);

      return result;

    } catch (error) {
      console.error('❌ Background removal failed:', error);
      
      // Fallback to transparent background
      const fallback = await this.createFallbackResult(buffer);
      fallback.processingTime = Date.now() - startTime;
      fallback.originalSize = originalSize;
      
      return fallback;
    }
  }

  /**
   * Auto-select best background removal method
   */
  private async autoRemoveBackground(buffer: Buffer): Promise<BackgroundRemovalResult> {
    // Analyze image to determine best method
    const analysis = await this.analyzeImageForBackgroundRemoval(buffer);
    
    console.log(`🔍 Image analysis: ${analysis.type}, background complexity: ${analysis.backgroundComplexity}`);

    // Choose method based on analysis
    if (analysis.hasUniformBackground && analysis.backgroundComplexity < 0.3) {
      return await this.removeWithColorKey(buffer);
    } else if (this.config.apiKey && analysis.backgroundComplexity > 0.7) {
      return await this.removeWithRemoveBg(buffer);
    } else {
      return await this.removeWithEdgeDetection(buffer);
    }
  }

  /**
   * Remove background using Remove.bg API
   */
  private async removeWithRemoveBg(buffer: Buffer): Promise<BackgroundRemovalResult> {
    if (!this.config.apiKey) {
      throw new Error('API key required for Remove.bg service');
    }

    const formData = new FormData();
    formData.append('image_file', buffer as any, 'image.jpg');
    formData.append('size', 'auto');

    const response = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
      headers: {
        'X-Api-Key': this.config.apiKey,
        'Content-Type': 'multipart/form-data'
      },
      responseType: 'arraybuffer',
      timeout: 30000
    });

    const resultBuffer = Buffer.from(response.data);
    const finalSize = resultBuffer.length;

    return {
      buffer: resultBuffer,
      hasTransparency: true,
      confidence: 95,
      method: 'remove-bg-api',
      processingTime: 0,
      originalSize: 0,
      finalSize,
      edgeQuality: 'excellent'
    };
  }

  /**
   * Remove background using local AI model (placeholder)
   */
  private async removeWithLocalAI(buffer: Buffer): Promise<BackgroundRemovalResult> {
    // This would integrate with a local AI model like U²-Net, DeepLab, etc.
    // For now, fall back to edge detection
    console.log('🔄 Local AI model not available, using edge detection');
    return await this.removeWithEdgeDetection(buffer);
  }

  /**
   * Remove background using color keying
   */
  private async removeWithColorKey(buffer: Buffer): Promise<BackgroundRemovalResult> {
    const settings = this.config.colorKeySettings!;
    
    // Convert target color to RGB
    const targetRgb = this.hexToRgb(settings.targetColor);
    
    // Create a mask based on color similarity
    const metadata = await sharp(buffer).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    // Get image data for color analysis
    const { data } = await sharp(buffer)
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Create alpha channel based on color distance
    const alphaChannel = Buffer.alloc(width * height);
    
    for (let i = 0; i < data.length; i += 3) {
      const pixelIndex = i / 3;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Calculate color distance
      const distance = Math.sqrt(
        Math.pow(r - targetRgb.r, 2) +
        Math.pow(g - targetRgb.g, 2) +
        Math.pow(b - targetRgb.b, 2)
      );
      
      // Set alpha based on distance and tolerance
      const maxDistance = Math.sqrt(3 * Math.pow(255, 2));
      const normalizedDistance = distance / maxDistance;
      const tolerance = settings.tolerance / 100;
      
      if (normalizedDistance <= tolerance) {
        alphaChannel[pixelIndex] = 0; // Transparent
      } else if (normalizedDistance <= tolerance * 2) {
        // Feather edges
        const alpha = Math.round(255 * (normalizedDistance - tolerance) / tolerance);
        alphaChannel[pixelIndex] = Math.min(255, alpha);
      } else {
        alphaChannel[pixelIndex] = 255; // Opaque
      }
    }

    // Combine RGB with alpha channel
    const rgbaBuffer = Buffer.alloc(width * height * 4);
    for (let i = 0; i < width * height; i++) {
      rgbaBuffer[i * 4] = data[i * 3];     // R
      rgbaBuffer[i * 4 + 1] = data[i * 3 + 1]; // G
      rgbaBuffer[i * 4 + 2] = data[i * 3 + 2]; // B
      rgbaBuffer[i * 4 + 3] = alphaChannel[i];  // A
    }

    // Create final image with transparency
    let resultBuffer = await sharp(rgbaBuffer, {
      raw: {
        width,
        height,
        channels: 4
      }
    }).png().toBuffer();

    // Apply edge feathering if enabled
    if (settings.featherEdges) {
      resultBuffer = await this.featherEdges(resultBuffer);
    }

    const confidence = await this.calculateRemovalConfidence(buffer, resultBuffer);

    return {
      buffer: resultBuffer,
      hasTransparency: true,
      confidence,
      method: 'color-key',
      processingTime: 0,
      originalSize: 0,
      finalSize: resultBuffer.length,
      edgeQuality: confidence > 80 ? 'good' : 'fair'
    };
  }

  /**
   * Remove background using edge detection
   */
  private async removeWithEdgeDetection(buffer: Buffer): Promise<BackgroundRemovalResult> {
    const settings = this.config.edgeDetectionSettings!;
    
    // Convert to grayscale for edge detection
    const grayscale = await sharp(buffer)
      .grayscale()
      .toBuffer();

    // Apply edge detection (simplified Sobel operator)
    const edges = await sharp(grayscale)
      .convolve({
        width: 3,
        height: 3,
        kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1]
      })
      .toBuffer();

    // Threshold the edges
    const thresholded = await sharp(edges)
      .threshold(settings.threshold)
      .toBuffer();

    // Apply morphological operations if enabled
    let mask = thresholded;
    if (settings.morphology) {
      // Dilate then erode to close gaps
      mask = await sharp(mask)
        .convolve({
          width: 3,
          height: 3,
          kernel: [1, 1, 1, 1, 1, 1, 1, 1, 1]
        })
        .threshold(128)
        .toBuffer();
    }

    // Smooth the mask if requested
    if (settings.smoothing > 0) {
      mask = await sharp(mask)
        .blur(settings.smoothing)
        .toBuffer();
    }

    // Apply mask to original image
    const result = await sharp(buffer)
      .composite([{ input: mask, blend: 'dest-in' }])
      .png()
      .toBuffer();

    const confidence = await this.calculateRemovalConfidence(buffer, result);

    return {
      buffer: result,
      hasTransparency: true,
      confidence,
      method: 'edge-detection',
      processingTime: 0,
      originalSize: 0,
      finalSize: result.length,
      edgeQuality: confidence > 70 ? 'good' : 'fair'
    };
  }

  /**
   * Analyze image for optimal background removal strategy
   */
  private async analyzeImageForBackgroundRemoval(buffer: Buffer): Promise<{
    type: 'photo' | 'illustration' | 'mixed';
    hasUniformBackground: boolean;
    backgroundComplexity: number;
    dominantColors: string[];
  }> {
    // Get image statistics
    const stats = await sharp(buffer).stats();
    
    // Analyze color complexity
    const colorComplexity = stats.channels.reduce((sum: number, channel: any) =>
      sum + channel.stdev, 0) / stats.channels.length;

    // Simple heuristics for image type
    const isPhoto = colorComplexity > 30;
    const type = isPhoto ? 'photo' : 'illustration';

    // Check for uniform background (simplified)
    const corners = await this.sampleCornerColors(buffer);
    const hasUniformBackground = this.areColorsSimilar(corners);

    // Background complexity score (0-1)
    const backgroundComplexity = Math.min(colorComplexity / 50, 1);

    return {
      type,
      hasUniformBackground,
      backgroundComplexity,
      dominantColors: ['#ffffff'] // Simplified
    };
  }

  /**
   * Sample colors from image corners
   */
  private async sampleCornerColors(buffer: Buffer): Promise<string[]> {
    const metadata = await sharp(buffer).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    // Sample 10x10 pixel areas from each corner
    const sampleSize = 10;
    const corners = [
      { left: 0, top: 0 },
      { left: width - sampleSize, top: 0 },
      { left: 0, top: height - sampleSize },
      { left: width - sampleSize, top: height - sampleSize }
    ];

    const colors: string[] = [];
    
    for (const corner of corners) {
      const sample = await sharp(buffer)
        .extract({ 
          left: corner.left, 
          top: corner.top, 
          width: sampleSize, 
          height: sampleSize 
        })
        .stats();
      
      // Convert to hex color (simplified)
      const r = Math.round(sample.channels[0].mean);
      const g = Math.round(sample.channels[1].mean);
      const b = Math.round(sample.channels[2].mean);
      colors.push(this.rgbToHex(r, g, b));
    }

    return colors;
  }

  /**
   * Check if colors are similar
   */
  private areColorsSimilar(colors: string[], tolerance: number = 20): boolean {
    if (colors.length < 2) return true;

    const firstColor = this.hexToRgb(colors[0]);
    
    return colors.every(color => {
      const rgb = this.hexToRgb(color);
      const distance = Math.sqrt(
        Math.pow(rgb.r - firstColor.r, 2) +
        Math.pow(rgb.g - firstColor.g, 2) +
        Math.pow(rgb.b - firstColor.b, 2)
      );
      return distance <= tolerance;
    });
  }

  /**
   * Calculate confidence score for background removal
   */
  private async calculateRemovalConfidence(original: Buffer, result: Buffer): Promise<number> {
    // This is a simplified confidence calculation
    // In production, you would use more sophisticated metrics
    
    const originalStats = await sharp(original).stats();
    const resultStats = await sharp(result).stats();
    
    // Compare entropy (edge information)
    const originalEntropy = originalStats.entropy || 0;
    const resultEntropy = resultStats.entropy || 0;
    
    // Higher entropy retention suggests better edge preservation
    const entropyRatio = resultEntropy / Math.max(originalEntropy, 1);
    
    return Math.min(Math.max(entropyRatio * 100, 50), 95);
  }

  /**
   * Apply edge feathering for smoother transitions
   */
  private async featherEdges(buffer: Buffer): Promise<Buffer> {
    return await sharp(buffer)
      .blur(0.5)
      .toBuffer();
  }

  /**
   * Create fallback result when removal fails
   */
  private async createFallbackResult(buffer: Buffer): Promise<BackgroundRemovalResult> {
    let fallbackBuffer: Buffer;

    switch (this.config.fallbackStrategy) {
      case 'white':
        fallbackBuffer = await sharp(buffer)
          .flatten({ background: '#ffffff' })
          .toBuffer();
        break;
      case 'blur':
        fallbackBuffer = await sharp(buffer)
          .blur(20)
          .modulate({ brightness: 1.2, saturation: 0.5 })
          .toBuffer();
        break;
      case 'transparent':
      default:
        fallbackBuffer = await sharp(buffer)
          .png()
          .toBuffer();
        break;
    }

    return {
      buffer: fallbackBuffer,
      hasTransparency: this.config.fallbackStrategy === 'transparent',
      confidence: 30,
      method: 'fallback',
      processingTime: 0,
      originalSize: 0,
      finalSize: fallbackBuffer.length,
      edgeQuality: 'poor'
    };
  }

  /**
   * Utility: Convert hex color to RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  /**
   * Utility: Convert RGB to hex color
   */
  private rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
}
