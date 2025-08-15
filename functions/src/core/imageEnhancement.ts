/**
 * AI Image Enhancement System
 * 
 * Comprehensive system for enhancing DALL·E generated images for professional
 * presentation quality including upscaling, aspect ratio adjustment, background
 * removal, and style consistency.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import sharp from 'sharp';
import axios from 'axios';
import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Image enhancement configuration
 */
export interface ImageEnhancementConfig {
  // Resolution settings
  targetWidth?: number;
  targetHeight?: number;
  upscaleEnabled?: boolean;
  upscaleFactor?: number;
  
  // Aspect ratio settings
  aspectRatio?: '16:9' | '4:3' | '1:1' | 'auto';
  cropStrategy?: 'center' | 'smart' | 'fill' | 'fit';
  backgroundExtension?: boolean;
  
  // Background processing
  removeBackground?: boolean;
  backgroundBlur?: boolean;
  transparentBackground?: boolean;
  
  // Color enhancement
  brightness?: number; // -100 to 100
  contrast?: number;   // -100 to 100
  saturation?: number; // -100 to 100
  sharpness?: number;  // 0 to 10
  
  // Style consistency
  stylePromptSuffix?: string;
  colorPalette?: string[];
  
  // Performance settings
  enableCaching?: boolean;
  cacheDirectory?: string;
  quality?: number; // 1-100
}

/**
 * Enhanced image result
 */
export interface EnhancedImageResult {
  buffer: Buffer;
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number;
    originalSize: number;
    processingTime: number;
    enhancements: string[];
  };
  cacheKey?: string;
  url?: string;
}

/**
 * Style consistency settings for presentations
 */
export interface StyleConsistencySettings {
  presentationType: 'business' | 'creative' | 'academic' | 'technical' | 'casual';
  visualStyle: 'photographic' | 'illustration' | 'icon' | 'minimal' | 'artistic';
  colorScheme: 'corporate' | 'vibrant' | 'monochrome' | 'pastel' | 'bold';
  backgroundPreference: 'transparent' | 'solid' | 'gradient' | 'textured';
}

/**
 * Main image enhancement class
 */
export class ImageEnhancer {
  private config: ImageEnhancementConfig;
  private cache: Map<string, EnhancedImageResult> = new Map();
  private styleSettings?: StyleConsistencySettings;

  constructor(config: ImageEnhancementConfig = {}) {
    this.config = {
      targetWidth: 1920,
      targetHeight: 1080,
      upscaleEnabled: true,
      upscaleFactor: 2,
      aspectRatio: '16:9',
      cropStrategy: 'smart',
      backgroundExtension: true,
      removeBackground: false,
      backgroundBlur: false,
      transparentBackground: false,
      brightness: 0,
      contrast: 10,
      saturation: 5,
      sharpness: 1,
      enableCaching: true,
      cacheDirectory: './cache/images',
      quality: 90,
      ...config
    };

    // Ensure cache directory exists
    if (this.config.enableCaching && this.config.cacheDirectory) {
      this.ensureCacheDirectory();
    }
  }

  /**
   * Set style consistency settings for the presentation
   */
  setStyleSettings(settings: StyleConsistencySettings): void {
    this.styleSettings = settings;
    this.config.stylePromptSuffix = this.generateStylePromptSuffix(settings);
  }

  /**
   * Enhance a DALL·E image with all configured improvements
   */
  async enhanceImage(
    imageUrl: string, 
    prompt?: string,
    slideContext?: { title: string; layout: string; index: number }
  ): Promise<EnhancedImageResult> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(imageUrl, this.config);

    // Check cache first
    if (this.config.enableCaching && this.cache.has(cacheKey)) {
      console.log('🎯 Using cached enhanced image');
      return this.cache.get(cacheKey)!;
    }

    console.log('🖼️ Starting image enhancement process...');
    const enhancements: string[] = [];

    try {
      // Download the original image
      const originalBuffer = await this.downloadImage(imageUrl);
      const originalMetadata = await sharp(originalBuffer).metadata();
      
      console.log(`📊 Original image: ${originalMetadata.width}x${originalMetadata.height}, ${Math.round((originalBuffer.length / 1024))}KB`);

      let processedBuffer = originalBuffer;
      let sharpInstance = sharp(processedBuffer);

      // Step 1: Upscale if enabled and needed
      if (this.config.upscaleEnabled && this.shouldUpscale(originalMetadata)) {
        console.log('🔍 Upscaling image...');
        processedBuffer = await this.upscaleImage(processedBuffer);
        sharpInstance = sharp(processedBuffer);
        enhancements.push('upscaled');
      }

      // Step 2: Aspect ratio adjustment
      if (this.config.aspectRatio !== 'auto') {
        console.log('📐 Adjusting aspect ratio...');
        processedBuffer = await this.adjustAspectRatio(processedBuffer);
        sharpInstance = sharp(processedBuffer);
        enhancements.push('aspect-adjusted');
      }

      // Step 3: Background processing
      if (this.config.removeBackground || this.config.backgroundBlur) {
        console.log('🎨 Processing background...');
        processedBuffer = await this.processBackground(processedBuffer);
        sharpInstance = sharp(processedBuffer);
        enhancements.push('background-processed');
      }

      // Step 4: Color enhancement
      if (this.needsColorEnhancement()) {
        console.log('🌈 Enhancing colors...');
        sharpInstance = this.applyColorEnhancements(sharpInstance);
        enhancements.push('color-enhanced');
      }

      // Step 5: Final quality optimization
      processedBuffer = await sharpInstance
        .jpeg({ quality: this.config.quality, progressive: true })
        .toBuffer();

      const finalMetadata = await sharp(processedBuffer).metadata();
      const processingTime = Date.now() - startTime;

      const result: EnhancedImageResult = {
        buffer: processedBuffer,
        metadata: {
          width: finalMetadata.width || 0,
          height: finalMetadata.height || 0,
          format: finalMetadata.format || 'jpeg',
          size: processedBuffer.length,
          originalSize: originalBuffer.length,
          processingTime,
          enhancements
        },
        cacheKey
      };

      // Cache the result
      if (this.config.enableCaching) {
        this.cache.set(cacheKey, result);
        await this.saveToDiskCache(cacheKey, result);
      }

      console.log(`✅ Image enhancement complete: ${finalMetadata.width}x${finalMetadata.height}, ${Math.round(processedBuffer.length / 1024)}KB, ${processingTime}ms`);
      console.log(`🔧 Applied enhancements: ${enhancements.join(', ')}`);

      return result;

    } catch (error) {
      console.error('❌ Image enhancement failed:', error);
      throw new Error(`Image enhancement failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate optimized DALL·E prompt with style consistency
   */
  generateOptimizedPrompt(originalPrompt: string, slideContext?: { title: string; layout: string; index: number }): string {
    let optimizedPrompt = originalPrompt;

    // Add style consistency suffix
    if (this.config.stylePromptSuffix) {
      optimizedPrompt += `, ${this.config.stylePromptSuffix}`;
    }

    // Add background preferences
    if (this.config.transparentBackground || this.config.removeBackground) {
      optimizedPrompt += ', no background, transparent background, isolated subject';
    }

    // Add quality modifiers
    optimizedPrompt += ', high quality, professional, clean, modern';

    // Add negative prompts to avoid common issues
    optimizedPrompt += ', no text in image, no watermarks, no signatures';

    // Add aspect ratio hint if needed
    if (this.config.aspectRatio === '16:9') {
      optimizedPrompt += ', widescreen composition, horizontal layout';
    }

    console.log(`🎨 Optimized prompt: ${optimizedPrompt}`);
    return optimizedPrompt;
  }

  /**
   * Download image from URL
   */
  private async downloadImage(url: string): Promise<Buffer> {
    const response = await axios.get(url, { 
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'AI-PPT-Generator/1.0'
      }
    });
    return Buffer.from(response.data);
  }

  /**
   * Check if image should be upscaled
   */
  private shouldUpscale(metadata: sharp.Metadata): boolean {
    const width = metadata.width || 0;
    const height = metadata.height || 0;
    const targetWidth = this.config.targetWidth || 1920;
    const targetHeight = this.config.targetHeight || 1080;
    
    return width < targetWidth || height < targetHeight;
  }

  /**
   * Generate cache key for image and config
   */
  private generateCacheKey(imageUrl: string, config: ImageEnhancementConfig): string {
    const configString = JSON.stringify(config);
    return createHash('md5').update(imageUrl + configString).digest('hex');
  }

  /**
   * Ensure cache directory exists
   */
  private ensureCacheDirectory(): void {
    if (this.config.cacheDirectory && !fs.existsSync(this.config.cacheDirectory)) {
      fs.mkdirSync(this.config.cacheDirectory, { recursive: true });
    }
  }

  /**
   * Save enhanced image to disk cache
   */
  private async saveToDiskCache(cacheKey: string, result: EnhancedImageResult): Promise<void> {
    if (!this.config.cacheDirectory) return;
    
    const cachePath = path.join(this.config.cacheDirectory, `${cacheKey}.jpg`);
    const metadataPath = path.join(this.config.cacheDirectory, `${cacheKey}.json`);
    
    await fs.promises.writeFile(cachePath, result.buffer);
    await fs.promises.writeFile(metadataPath, JSON.stringify(result.metadata, null, 2));
  }

  /**
   * Generate style prompt suffix based on settings
   */
  private generateStylePromptSuffix(settings: StyleConsistencySettings): string {
    const suffixes: string[] = [];

    // Visual style
    switch (settings.visualStyle) {
      case 'photographic':
        suffixes.push('photorealistic, professional photography style');
        break;
      case 'illustration':
        suffixes.push('digital illustration, vector art style');
        break;
      case 'icon':
        suffixes.push('flat icon style, minimalist, simple shapes');
        break;
      case 'minimal':
        suffixes.push('minimal design, clean lines, simple composition');
        break;
      case 'artistic':
        suffixes.push('artistic rendering, creative interpretation');
        break;
    }

    // Color scheme
    switch (settings.colorScheme) {
      case 'corporate':
        suffixes.push('corporate colors, professional palette, blue and gray tones');
        break;
      case 'vibrant':
        suffixes.push('vibrant colors, bright palette, energetic tones');
        break;
      case 'monochrome':
        suffixes.push('monochrome, black and white, grayscale');
        break;
      case 'pastel':
        suffixes.push('pastel colors, soft tones, muted palette');
        break;
      case 'bold':
        suffixes.push('bold colors, high contrast, striking palette');
        break;
    }

    return suffixes.join(', ');
  }

  /**
   * Check if color enhancement is needed
   */
  private needsColorEnhancement(): boolean {
    return this.config.brightness !== 0 || 
           this.config.contrast !== 0 || 
           this.config.saturation !== 0 || 
           (this.config.sharpness || 0) > 0;
  }

  /**
   * Apply color enhancements to Sharp instance
   */
  private applyColorEnhancements(sharpInstance: sharp.Sharp): sharp.Sharp {
    if (this.config.brightness !== 0) {
      sharpInstance = sharpInstance.modulate({ 
        brightness: 1 + (this.config.brightness || 0) / 100 
      });
    }

    if (this.config.saturation !== 0) {
      sharpInstance = sharpInstance.modulate({ 
        saturation: 1 + (this.config.saturation || 0) / 100 
      });
    }

    if ((this.config.sharpness || 0) > 0) {
      sharpInstance = sharpInstance.sharpen(this.config.sharpness);
    }

    return sharpInstance;
  }

  /**
   * Upscale image using AI-enhanced scaling
   */
  private async upscaleImage(buffer: Buffer): Promise<Buffer> {
    const metadata = await sharp(buffer).metadata();
    const currentWidth = metadata.width || 0;
    const currentHeight = metadata.height || 0;

    const targetWidth = Math.max(currentWidth * (this.config.upscaleFactor || 2), this.config.targetWidth || 1920);
    const targetHeight = Math.max(currentHeight * (this.config.upscaleFactor || 2), this.config.targetHeight || 1080);

    // Use Sharp's high-quality Lanczos resampling for upscaling
    return await sharp(buffer)
      .resize(targetWidth, targetHeight, {
        kernel: sharp.kernel.lanczos3,
        fit: 'inside',
        withoutEnlargement: false
      })
      .toBuffer();
  }

  /**
   * Adjust aspect ratio to target format
   */
  private async adjustAspectRatio(buffer: Buffer): Promise<Buffer> {
    const metadata = await sharp(buffer).metadata();
    const currentWidth = metadata.width || 0;
    const currentHeight = metadata.height || 0;

    let targetWidth: number;
    let targetHeight: number;

    // Calculate target dimensions based on aspect ratio
    switch (this.config.aspectRatio) {
      case '16:9':
        targetWidth = this.config.targetWidth || 1920;
        targetHeight = Math.round(targetWidth * 9 / 16);
        break;
      case '4:3':
        targetWidth = this.config.targetWidth || 1920;
        targetHeight = Math.round(targetWidth * 3 / 4);
        break;
      case '1:1':
        const size = Math.min(this.config.targetWidth || 1920, this.config.targetHeight || 1080);
        targetWidth = size;
        targetHeight = size;
        break;
      default:
        return buffer; // No adjustment needed
    }

    const currentAspect = currentWidth / currentHeight;
    const targetAspect = targetWidth / targetHeight;

    if (Math.abs(currentAspect - targetAspect) < 0.01) {
      // Aspect ratios are already close enough
      return buffer;
    }

    switch (this.config.cropStrategy) {
      case 'center':
        return await sharp(buffer)
          .resize(targetWidth, targetHeight, {
            fit: 'cover',
            position: 'center'
          })
          .toBuffer();

      case 'smart':
        return await this.smartCrop(buffer, targetWidth, targetHeight);

      case 'fill':
        return await this.fillAspectRatio(buffer, targetWidth, targetHeight);

      case 'fit':
      default:
        return await sharp(buffer)
          .resize(targetWidth, targetHeight, {
            fit: 'inside',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .toBuffer();
    }
  }

  /**
   * Smart crop using entropy-based detection
   */
  private async smartCrop(buffer: Buffer, targetWidth: number, targetHeight: number): Promise<Buffer> {
    // Use Sharp's entropy-based smart cropping
    return await sharp(buffer)
      .resize(targetWidth, targetHeight, {
        fit: 'cover',
        position: sharp.strategy.entropy
      })
      .toBuffer();
  }

  /**
   * Fill aspect ratio with background extension
   */
  private async fillAspectRatio(buffer: Buffer, targetWidth: number, targetHeight: number): Promise<Buffer> {
    const metadata = await sharp(buffer).metadata();
    const currentWidth = metadata.width || 0;
    const currentHeight = metadata.height || 0;

    // First, resize to fit within target dimensions
    const resized = await sharp(buffer)
      .resize(targetWidth, targetHeight, {
        fit: 'inside',
        withoutEnlargement: false
      })
      .toBuffer();

    const resizedMetadata = await sharp(resized).metadata();
    const resizedWidth = resizedMetadata.width || 0;
    const resizedHeight = resizedMetadata.height || 0;

    if (resizedWidth === targetWidth && resizedHeight === targetHeight) {
      return resized;
    }

    // Create background extension
    if (this.config.backgroundExtension) {
      return await this.createBackgroundExtension(resized, targetWidth, targetHeight);
    } else {
      // Simple center with transparent background
      return await sharp({
        create: {
          width: targetWidth,
          height: targetHeight,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        }
      })
      .composite([{
        input: resized,
        gravity: 'center'
      }])
      .toBuffer();
    }
  }

  /**
   * Create background extension with blurred edges
   */
  private async createBackgroundExtension(buffer: Buffer, targetWidth: number, targetHeight: number): Promise<Buffer> {
    const metadata = await sharp(buffer).metadata();
    const currentWidth = metadata.width || 0;
    const currentHeight = metadata.height || 0;

    // Create a blurred, scaled version for background
    const background = await sharp(buffer)
      .resize(targetWidth, targetHeight, { fit: 'cover' })
      .blur(20)
      .modulate({ brightness: 0.7, saturation: 0.5 })
      .toBuffer();

    // Composite the original image on top
    return await sharp(background)
      .composite([{
        input: buffer,
        gravity: 'center'
      }])
      .toBuffer();
  }

  /**
   * Process background (removal, blur, etc.)
   */
  private async processBackground(buffer: Buffer): Promise<Buffer> {
    let processedBuffer = buffer;

    if (this.config.removeBackground) {
      // Note: This is a placeholder for background removal
      // In production, you would integrate with a service like remove.bg
      // or use a local AI model for background removal
      console.log('🎭 Background removal requested (placeholder implementation)');

      // For now, we'll create a simple mask-based approach
      // This would be replaced with actual background removal logic
      processedBuffer = await this.simulateBackgroundRemoval(buffer);
    }

    if (this.config.backgroundBlur && !this.config.removeBackground) {
      processedBuffer = await this.blurBackground(processedBuffer);
    }

    return processedBuffer;
  }

  /**
   * Simulate background removal (placeholder)
   */
  private async simulateBackgroundRemoval(buffer: Buffer): Promise<Buffer> {
    // This is a placeholder implementation
    // In production, integrate with remove.bg API or similar service

    // For demonstration, we'll create a simple edge-based mask
    const metadata = await sharp(buffer).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    // Create a simple center-focused mask
    const mask = Buffer.from(
      `<svg width="${width}" height="${height}">
        <defs>
          <radialGradient id="mask" cx="50%" cy="50%" r="40%">
            <stop offset="0%" style="stop-color:white;stop-opacity:1" />
            <stop offset="70%" style="stop-color:white;stop-opacity:1" />
            <stop offset="100%" style="stop-color:white;stop-opacity:0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#mask)" />
      </svg>`
    );

    return await sharp(buffer)
      .composite([{ input: mask, blend: 'dest-in' }])
      .png()
      .toBuffer();
  }

  /**
   * Blur background while keeping subject sharp
   */
  private async blurBackground(buffer: Buffer): Promise<Buffer> {
    // Create a blurred version of the entire image
    const blurred = await sharp(buffer)
      .blur(10)
      .toBuffer();

    // In a real implementation, you would use AI to detect the subject
    // and create a proper mask. For now, we'll use a simple center mask
    const metadata = await sharp(buffer).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    const mask = Buffer.from(
      `<svg width="${width}" height="${height}">
        <defs>
          <radialGradient id="focus" cx="50%" cy="50%" r="30%">
            <stop offset="0%" style="stop-color:black;stop-opacity:1" />
            <stop offset="70%" style="stop-color:black;stop-opacity:1" />
            <stop offset="100%" style="stop-color:black;stop-opacity:0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#focus)" />
      </svg>`
    );

    // Composite original over blurred using the mask
    return await sharp(blurred)
      .composite([
        { input: buffer, blend: 'over' },
        { input: mask, blend: 'dest-in' }
      ])
      .toBuffer();
  }
}
