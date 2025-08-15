/**
 * AI-Powered Image Upscaling System
 * 
 * Advanced upscaling system that integrates with various AI upscaling services
 * and local algorithms to enhance image resolution for professional presentations.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import sharp from 'sharp';
import axios from 'axios';
import { createHash } from 'crypto';

/**
 * Upscaling service configuration
 */
export interface UpscalingConfig {
  service: 'local' | 'upscale-media' | 'real-esrgan' | 'waifu2x';
  apiKey?: string;
  maxUpscaleFactor: number;
  targetResolution: { width: number; height: number };
  qualityPreset: 'fast' | 'balanced' | 'quality';
  enableDenoising: boolean;
  preserveTransparency: boolean;
}

/**
 * Upscaling result interface
 */
export interface UpscalingResult {
  buffer: Buffer;
  originalDimensions: { width: number; height: number };
  upscaledDimensions: { width: number; height: number };
  upscaleFactor: number;
  processingTime: number;
  method: string;
  qualityScore?: number;
}

/**
 * AI Upscaling service class
 */
export class AIUpscaler {
  private config: UpscalingConfig;
  private cache: Map<string, UpscalingResult> = new Map();

  constructor(config: Partial<UpscalingConfig> = {}) {
    this.config = {
      service: 'local',
      maxUpscaleFactor: 4,
      targetResolution: { width: 2048, height: 2048 },
      qualityPreset: 'balanced',
      enableDenoising: true,
      preserveTransparency: true,
      ...config
    };
  }

  /**
   * Upscale image using the configured service
   */
  async upscaleImage(buffer: Buffer, targetFactor?: number): Promise<UpscalingResult> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(buffer, targetFactor);

    // Check cache first
    if (this.cache.has(cacheKey)) {
      console.log('🎯 Using cached upscaled image');
      return this.cache.get(cacheKey)!;
    }

    const metadata = await sharp(buffer).metadata();
    const originalWidth = metadata.width || 0;
    const originalHeight = metadata.height || 0;

    console.log(`🔍 Starting AI upscaling: ${originalWidth}x${originalHeight}`);

    let result: UpscalingResult;

    try {
      switch (this.config.service) {
        case 'upscale-media':
          result = await this.upscaleWithUpscaleMedia(buffer, targetFactor);
          break;
        case 'real-esrgan':
          result = await this.upscaleWithRealESRGAN(buffer, targetFactor);
          break;
        case 'waifu2x':
          result = await this.upscaleWithWaifu2x(buffer, targetFactor);
          break;
        case 'local':
        default:
          result = await this.upscaleLocally(buffer, targetFactor);
          break;
      }

      result.processingTime = Date.now() - startTime;
      
      // Cache the result
      this.cache.set(cacheKey, result);

      console.log(`✅ Upscaling complete: ${result.originalDimensions.width}x${result.originalDimensions.height} → ${result.upscaledDimensions.width}x${result.upscaledDimensions.height} (${result.upscaleFactor}x) in ${result.processingTime}ms`);

      return result;

    } catch (error) {
      console.error('❌ Upscaling failed, falling back to local method:', error);
      // Fallback to local upscaling
      result = await this.upscaleLocally(buffer, targetFactor);
      result.processingTime = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Local high-quality upscaling using Sharp
   */
  private async upscaleLocally(buffer: Buffer, targetFactor?: number): Promise<UpscalingResult> {
    const metadata = await sharp(buffer).metadata();
    const originalWidth = metadata.width || 0;
    const originalHeight = metadata.height || 0;

    // Calculate target dimensions
    const factor = targetFactor || this.calculateOptimalFactor(originalWidth, originalHeight);
    const targetWidth = Math.min(originalWidth * factor, this.config.targetResolution.width);
    const targetHeight = Math.min(originalHeight * factor, this.config.targetResolution.height);

    // Use different algorithms based on quality preset
    let kernel: keyof sharp.KernelEnum;
    let options: sharp.ResizeOptions = {
      fit: 'fill',
      withoutEnlargement: false
    };

    switch (this.config.qualityPreset) {
      case 'fast':
        kernel = sharp.kernel.nearest;
        break;
      case 'quality':
        kernel = sharp.kernel.lanczos3;
        options.fastShrinkOnLoad = false;
        break;
      case 'balanced':
      default:
        kernel = sharp.kernel.lanczos2;
        break;
    }

    let sharpInstance = sharp(buffer).resize(targetWidth, targetHeight, {
      ...options,
      kernel
    });

    // Apply denoising if enabled
    if (this.config.enableDenoising) {
      sharpInstance = sharpInstance.median(1); // Light denoising
    }

    // Apply sharpening for better quality
    if (this.config.qualityPreset === 'quality') {
      sharpInstance = sharpInstance.sharpen(1, 1, 2);
    }

    const upscaledBuffer = await sharpInstance.toBuffer();
    const upscaledMetadata = await sharp(upscaledBuffer).metadata();

    return {
      buffer: upscaledBuffer,
      originalDimensions: { width: originalWidth, height: originalHeight },
      upscaledDimensions: { 
        width: upscaledMetadata.width || 0, 
        height: upscaledMetadata.height || 0 
      },
      upscaleFactor: factor,
      processingTime: 0, // Will be set by caller
      method: 'local-sharp',
      qualityScore: this.estimateQualityScore(factor, this.config.qualityPreset)
    };
  }

  /**
   * Upscale using Upscale.media API
   */
  private async upscaleWithUpscaleMedia(buffer: Buffer, targetFactor?: number): Promise<UpscalingResult> {
    if (!this.config.apiKey) {
      throw new Error('API key required for Upscale.media service');
    }

    const metadata = await sharp(buffer).metadata();
    const originalWidth = metadata.width || 0;
    const originalHeight = metadata.height || 0;

    const factor = targetFactor || this.calculateOptimalFactor(originalWidth, originalHeight);

    // Convert buffer to base64 for API
    const base64Image = buffer.toString('base64');

    const response = await axios.post('https://api.upscale.media/v1/upscale', {
      image: base64Image,
      upscale_factor: Math.min(factor, 4), // API limit
      format: 'png',
      enhance: this.config.enableDenoising
    }, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 60000 // 60 second timeout
    });

    if (!response.data.success) {
      throw new Error(`Upscale.media API error: ${response.data.error}`);
    }

    // Download the upscaled image
    const upscaledResponse = await axios.get(response.data.url, {
      responseType: 'arraybuffer'
    });

    const upscaledBuffer = Buffer.from(upscaledResponse.data);
    const upscaledMetadata = await sharp(upscaledBuffer).metadata();

    return {
      buffer: upscaledBuffer,
      originalDimensions: { width: originalWidth, height: originalHeight },
      upscaledDimensions: { 
        width: upscaledMetadata.width || 0, 
        height: upscaledMetadata.height || 0 
      },
      upscaleFactor: factor,
      processingTime: 0,
      method: 'upscale-media-api',
      qualityScore: 95 // High quality from AI service
    };
  }

  /**
   * Upscale using Real-ESRGAN (placeholder for local deployment)
   */
  private async upscaleWithRealESRGAN(buffer: Buffer, targetFactor?: number): Promise<UpscalingResult> {
    // This would integrate with a local Real-ESRGAN deployment
    // For now, fall back to local upscaling
    console.log('🔄 Real-ESRGAN not available, using local upscaling');
    return this.upscaleLocally(buffer, targetFactor);
  }

  /**
   * Upscale using Waifu2x API
   */
  private async upscaleWithWaifu2x(buffer: Buffer, targetFactor?: number): Promise<UpscalingResult> {
    const metadata = await sharp(buffer).metadata();
    const originalWidth = metadata.width || 0;
    const originalHeight = metadata.height || 0;

    // Waifu2x works best with anime/illustration style images
    // For photos, we'll fall back to local upscaling
    const isPhotoLike = await this.detectImageType(buffer);
    if (isPhotoLike) {
      console.log('🔄 Image appears photographic, using local upscaling instead of Waifu2x');
      return this.upscaleLocally(buffer, targetFactor);
    }

    // Placeholder for Waifu2x integration
    // In production, you would integrate with waifu2x-caffe or similar
    console.log('🔄 Waifu2x integration placeholder, using local upscaling');
    return this.upscaleLocally(buffer, targetFactor);
  }

  /**
   * Calculate optimal upscaling factor
   */
  private calculateOptimalFactor(width: number, height: number): number {
    const targetWidth = this.config.targetResolution.width;
    const targetHeight = this.config.targetResolution.height;

    const widthFactor = targetWidth / width;
    const heightFactor = targetHeight / height;

    // Use the smaller factor to ensure we don't exceed target resolution
    const optimalFactor = Math.min(widthFactor, heightFactor);

    // Clamp to reasonable bounds
    return Math.min(Math.max(optimalFactor, 1), this.config.maxUpscaleFactor);
  }

  /**
   * Detect if image is photo-like or illustration-like
   */
  private async detectImageType(buffer: Buffer): Promise<boolean> {
    // Simple heuristic based on color complexity
    const stats = await sharp(buffer).stats();
    
    // Photos typically have more color variation
    const colorComplexity = stats.channels.reduce((sum: number, channel: any) =>
      sum + channel.stdev, 0) / stats.channels.length;

    // Threshold for photo vs illustration (this is a simple heuristic)
    return colorComplexity > 30;
  }

  /**
   * Estimate quality score based on method and factor
   */
  private estimateQualityScore(factor: number, preset: string): number {
    let baseScore = 70;

    // Adjust based on preset
    switch (preset) {
      case 'quality':
        baseScore = 85;
        break;
      case 'balanced':
        baseScore = 75;
        break;
      case 'fast':
        baseScore = 65;
        break;
    }

    // Reduce score for higher upscaling factors
    const factorPenalty = Math.max(0, (factor - 2) * 5);
    
    return Math.max(50, baseScore - factorPenalty);
  }

  /**
   * Generate cache key for upscaling parameters
   */
  private generateCacheKey(buffer: Buffer, targetFactor?: number): string {
    const bufferHash = createHash('md5').update(buffer).digest('hex').substring(0, 16);
    const configHash = createHash('md5').update(JSON.stringify({
      service: this.config.service,
      factor: targetFactor,
      preset: this.config.qualityPreset
    })).digest('hex').substring(0, 8);
    
    return `upscale_${bufferHash}_${configHash}`;
  }

  /**
   * Get optimal upscaling settings for presentation images
   */
  static getOptimalSettings(imageType: 'photo' | 'illustration' | 'icon'): Partial<UpscalingConfig> {
    switch (imageType) {
      case 'photo':
        return {
          service: 'local',
          qualityPreset: 'quality',
          enableDenoising: true,
          maxUpscaleFactor: 2
        };
      case 'illustration':
        return {
          service: 'waifu2x',
          qualityPreset: 'quality',
          enableDenoising: false,
          maxUpscaleFactor: 4
        };
      case 'icon':
        return {
          service: 'local',
          qualityPreset: 'fast',
          enableDenoising: false,
          maxUpscaleFactor: 4
        };
      default:
        return {
          service: 'local',
          qualityPreset: 'balanced',
          enableDenoising: true,
          maxUpscaleFactor: 2
        };
    }
  }
}
