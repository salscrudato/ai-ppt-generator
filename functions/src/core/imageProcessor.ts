/**
 * Comprehensive Image Processing Pipeline
 * 
 * Main integration module that orchestrates all image enhancement systems
 * for professional presentation-quality DALL·E image processing.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import { ImageEnhancer, type ImageEnhancementConfig, type EnhancedImageResult } from './imageEnhancement';
import { AIUpscaler, type UpscalingConfig } from './aiUpscaling';
import { AspectRatioManager, type AspectRatioConfig } from './aspectRatioManager';
import { BackgroundRemover, type BackgroundRemovalConfig } from './backgroundRemoval';
import { StyleConsistencyEngine, type StyleConsistencyConfig } from './styleConsistency';
import { ColorEnhancer, type ColorEnhancementConfig } from './colorEnhancement';
import { ImageCacheManager, type CacheConfig } from './imageCaching';

/**
 * Complete image processing configuration
 */
export interface ImageProcessingConfig {
  // Enhancement settings
  enhancement: Partial<ImageEnhancementConfig>;
  upscaling: Partial<UpscalingConfig>;
  aspectRatio: Partial<AspectRatioConfig>;
  backgroundRemoval: Partial<BackgroundRemovalConfig>;
  styleConsistency: StyleConsistencyConfig;
  colorEnhancement: Partial<ColorEnhancementConfig>;
  caching: Partial<CacheConfig>;
  
  // Processing options
  enableUpscaling: boolean;
  enableBackgroundRemoval: boolean;
  enableColorEnhancement: boolean;
  enableCaching: boolean;
  
  // Performance settings
  maxProcessingTime: number; // in seconds
  fallbackOnError: boolean;
  parallelProcessing: boolean;
}

/**
 * Complete processing result
 */
export interface ProcessingResult {
  buffer: Buffer;
  metadata: {
    originalUrl: string;
    originalSize: number;
    finalSize: number;
    dimensions: { width: number; height: number };
    processingSteps: string[];
    totalProcessingTime: number;
    cacheHit: boolean;
    qualityScore: number;
    enhancements: {
      upscaling?: any;
      aspectRatio?: any;
      backgroundRemoval?: any;
      colorEnhancement?: any;
    };
  };
  optimizedPrompt?: string;
  styleAnalysis?: any;
}

/**
 * Comprehensive Image Processor
 */
export class ImageProcessor {
  private config: ImageProcessingConfig;
  private enhancer!: ImageEnhancer;
  private upscaler!: AIUpscaler;
  private aspectRatioManager!: AspectRatioManager;
  private backgroundRemover!: BackgroundRemover;
  private styleEngine!: StyleConsistencyEngine;
  private colorEnhancer!: ColorEnhancer;
  private cacheManager!: ImageCacheManager;

  constructor(config: Partial<ImageProcessingConfig> = {}) {
    this.config = {
      enhancement: {},
      upscaling: {},
      aspectRatio: { targetRatio: '16:9', strategy: 'smart' },
      backgroundRemoval: {},
      styleConsistency: {
        presentationType: 'business',
        visualStyle: 'photographic',
        colorScheme: 'corporate',
        mood: 'professional',
        complexity: 'moderate',
        backgroundPreference: 'transparent'
      },
      colorEnhancement: { preset: 'presentation' },
      caching: {},
      enableUpscaling: true,
      enableBackgroundRemoval: false,
      enableColorEnhancement: true,
      enableCaching: true,
      maxProcessingTime: 30,
      fallbackOnError: true,
      parallelProcessing: false,
      ...config
    };

    this.initializeProcessors();
  }

  /**
   * Process DALL·E image with all enhancements
   */
  async processImage(
    imageUrl: string,
    originalPrompt?: string,
    slideContext?: { title: string; layout: string; index: number; totalSlides: number }
  ): Promise<ProcessingResult> {
    const startTime = Date.now();
    const processingSteps: string[] = [];

    console.log(`🖼️ Starting comprehensive image processing: ${imageUrl}`);

    try {
      // Generate cache key
      const cacheKey = this.cacheManager.generateKey(imageUrl, {
        config: this.config,
        slideContext
      });

      // Check cache first
      let cacheHit = false;
      if (this.config.enableCaching) {
        const cached = await this.cacheManager.get(cacheKey);
        if (cached.hit && cached.entry) {
          console.log('🎯 Using cached processed image');
          return this.createResultFromCache(cached.entry, imageUrl, startTime);
        }
      }

      // Download original image
      const originalBuffer = await this.downloadImage(imageUrl);
      const originalMetadata = await this.getImageMetadata(originalBuffer);
      processingSteps.push('downloaded');

      let processedBuffer = originalBuffer;
      const enhancements: any = {};

      // Step 1: Upscaling (if enabled)
      if (this.config.enableUpscaling) {
        console.log('🔍 Applying AI upscaling...');
        const upscaleResult = await this.upscaler.upscaleImage(processedBuffer);
        processedBuffer = upscaleResult.buffer;
        enhancements.upscaling = upscaleResult;
        processingSteps.push('upscaled');
      }

      // Step 2: Aspect ratio adjustment
      console.log('📐 Adjusting aspect ratio...');
      const aspectResult = await this.aspectRatioManager.convertAspectRatio(processedBuffer);
      processedBuffer = aspectResult.buffer;
      enhancements.aspectRatio = aspectResult;
      processingSteps.push('aspect-adjusted');

      // Step 3: Background removal (if enabled)
      if (this.config.enableBackgroundRemoval) {
        console.log('🎭 Removing background...');
        const bgResult = await this.backgroundRemover.removeBackground(processedBuffer);
        processedBuffer = bgResult.buffer;
        enhancements.backgroundRemoval = bgResult;
        processingSteps.push('background-removed');
      }

      // Step 4: Color enhancement (if enabled)
      if (this.config.enableColorEnhancement) {
        console.log('🌈 Enhancing colors...');
        const colorResult = await this.colorEnhancer.enhanceColors(processedBuffer);
        processedBuffer = colorResult.buffer;
        enhancements.colorEnhancement = colorResult;
        processingSteps.push('color-enhanced');
      }

      // Get final metadata
      const finalMetadata = await this.getImageMetadata(processedBuffer);
      const totalProcessingTime = Date.now() - startTime;

      // Calculate quality score
      const qualityScore = this.calculateQualityScore(enhancements, processingSteps);

      // Cache the result
      if (this.config.enableCaching) {
        await this.cacheManager.set(cacheKey, processedBuffer, {
          originalSize: originalBuffer.length,
          width: finalMetadata.width,
          height: finalMetadata.height,
          format: finalMetadata.format,
          processingTime: totalProcessingTime,
          enhancements: processingSteps
        });
      }

      // Generate optimized prompt if original was provided
      let optimizedPrompt: string | undefined;
      if (originalPrompt) {
        const promptResult = this.styleEngine.enhancePromptForConsistency(originalPrompt, slideContext);
        optimizedPrompt = promptResult.enhancedPrompt;
      }

      const result: ProcessingResult = {
        buffer: processedBuffer,
        metadata: {
          originalUrl: imageUrl,
          originalSize: originalBuffer.length,
          finalSize: processedBuffer.length,
          dimensions: { width: finalMetadata.width, height: finalMetadata.height },
          processingSteps,
          totalProcessingTime,
          cacheHit,
          qualityScore,
          enhancements
        },
        optimizedPrompt
      };

      console.log(`✅ Image processing complete: ${processingSteps.join(' → ')}, ${totalProcessingTime}ms, quality: ${qualityScore}%`);

      return result;

    } catch (error) {
      console.error('❌ Image processing failed:', error);
      
      if (this.config.fallbackOnError) {
        return await this.createFallbackResult(imageUrl, startTime);
      } else {
        throw error;
      }
    }
  }

  /**
   * Generate optimized DALL·E prompt
   */
  generateOptimizedPrompt(
    originalPrompt: string,
    slideContext?: { title: string; layout: string; index: number; totalSlides: number }
  ): string {
    const enhanced = this.styleEngine.enhancePromptForConsistency(originalPrompt, slideContext);
    return enhanced.enhancedPrompt;
  }

  /**
   * Batch process multiple images
   */
  async batchProcessImages(
    imageRequests: Array<{
      url: string;
      prompt?: string;
      slideContext?: { title: string; layout: string; index: number; totalSlides: number };
    }>
  ): Promise<ProcessingResult[]> {
    console.log(`🔄 Batch processing ${imageRequests.length} images...`);

    if (this.config.parallelProcessing) {
      // Process in parallel
      const promises = imageRequests.map(request => 
        this.processImage(request.url, request.prompt, request.slideContext)
      );
      return await Promise.all(promises);
    } else {
      // Process sequentially
      const results: ProcessingResult[] = [];
      for (const request of imageRequests) {
        const result = await this.processImage(request.url, request.prompt, request.slideContext);
        results.push(result);
      }
      return results;
    }
  }

  /**
   * Get processing statistics
   */
  getStatistics() {
    return {
      cache: this.cacheManager.getMetrics(),
      styleConsistency: this.styleEngine.getStyleSummary(),
      config: this.config
    };
  }

  /**
   * Initialize all processors
   */
  private initializeProcessors(): void {
    this.enhancer = new ImageEnhancer(this.config.enhancement);
    this.upscaler = new AIUpscaler(this.config.upscaling);
    this.aspectRatioManager = new AspectRatioManager(this.config.aspectRatio);
    this.backgroundRemover = new BackgroundRemover(this.config.backgroundRemoval);
    this.styleEngine = new StyleConsistencyEngine(this.config.styleConsistency);
    this.colorEnhancer = new ColorEnhancer(this.config.colorEnhancement);
    this.cacheManager = new ImageCacheManager(this.config.caching);
  }

  /**
   * Download image from URL
   */
  private async downloadImage(url: string): Promise<Buffer> {
    const axios = require('axios');
    const response = await axios.get(url, { 
      responseType: 'arraybuffer',
      timeout: 30000 
    });
    return Buffer.from(response.data);
  }

  /**
   * Get image metadata
   */
  private async getImageMetadata(buffer: Buffer): Promise<{ width: number; height: number; format: string }> {
    const sharp = require('sharp');
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'unknown'
    };
  }

  /**
   * Calculate overall quality score
   */
  private calculateQualityScore(enhancements: any, steps: string[]): number {
    let score = 70; // Base score

    // Add points for each enhancement
    if (enhancements.upscaling?.qualityScore) {
      score += enhancements.upscaling.qualityScore * 0.2;
    }
    if (enhancements.aspectRatio?.qualityScore) {
      score += enhancements.aspectRatio.qualityScore * 0.1;
    }
    if (enhancements.backgroundRemoval?.confidence) {
      score += enhancements.backgroundRemoval.confidence * 0.1;
    }
    if (enhancements.colorEnhancement?.improvementScore) {
      score += enhancements.colorEnhancement.improvementScore * 0.15;
    }

    // Bonus for comprehensive processing
    if (steps.length >= 4) score += 5;

    return Math.min(Math.round(score), 100);
  }

  /**
   * Create result from cached entry
   */
  private createResultFromCache(entry: any, originalUrl: string, startTime: number): ProcessingResult {
    return {
      buffer: entry.buffer,
      metadata: {
        originalUrl,
        originalSize: entry.metadata.originalSize,
        finalSize: entry.metadata.compressedSize,
        dimensions: { width: entry.metadata.width, height: entry.metadata.height },
        processingSteps: entry.metadata.enhancements,
        totalProcessingTime: Date.now() - startTime,
        cacheHit: true,
        qualityScore: 95, // High score for cached results
        enhancements: {}
      }
    };
  }

  /**
   * Create fallback result when processing fails
   */
  private async createFallbackResult(imageUrl: string, startTime: number): Promise<ProcessingResult> {
    try {
      const originalBuffer = await this.downloadImage(imageUrl);
      const metadata = await this.getImageMetadata(originalBuffer);

      return {
        buffer: originalBuffer,
        metadata: {
          originalUrl: imageUrl,
          originalSize: originalBuffer.length,
          finalSize: originalBuffer.length,
          dimensions: { width: metadata.width, height: metadata.height },
          processingSteps: ['fallback'],
          totalProcessingTime: Date.now() - startTime,
          cacheHit: false,
          qualityScore: 50,
          enhancements: {}
        }
      };
    } catch (error) {
      throw new Error(`Failed to create fallback result: ${error}`);
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.cacheManager.destroy();
  }
}

/**
 * Factory function for creating optimized image processor configurations
 */
export function createImageProcessorConfig(
  presentationType: 'business' | 'creative' | 'academic' | 'technical',
  quality: 'fast' | 'balanced' | 'quality' = 'balanced'
): Partial<ImageProcessingConfig> {
  const baseConfig: Partial<ImageProcessingConfig> = {
    enableUpscaling: quality !== 'fast',
    enableColorEnhancement: true,
    enableCaching: true,
    enableBackgroundRemoval: presentationType === 'creative',
    aspectRatio: {
      targetRatio: '16:9',
      strategy: quality === 'quality' ? 'smart' : 'crop'
    },
    styleConsistency: {
      presentationType,
      visualStyle: presentationType === 'creative' ? 'artistic' : 'photographic',
      colorScheme: presentationType === 'business' ? 'corporate' : 'vibrant',
      mood: presentationType === 'business' ? 'professional' : 'friendly',
      complexity: quality === 'quality' ? 'detailed' : 'moderate',
      backgroundPreference: 'transparent'
    }
  };

  // Quality-specific adjustments
  switch (quality) {
    case 'fast':
      baseConfig.upscaling = { qualityPreset: 'fast', maxUpscaleFactor: 2 };
      baseConfig.colorEnhancement = { preset: 'presentation' };
      baseConfig.parallelProcessing = true;
      break;
    case 'quality':
      baseConfig.upscaling = { qualityPreset: 'quality', maxUpscaleFactor: 4 };
      baseConfig.colorEnhancement = { preset: 'projector' };
      baseConfig.maxProcessingTime = 60;
      break;
    default: // balanced
      baseConfig.upscaling = { qualityPreset: 'balanced', maxUpscaleFactor: 2 };
      baseConfig.colorEnhancement = { preset: 'presentation' };
      break;
  }

  return baseConfig;
}
