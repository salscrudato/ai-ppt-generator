/**
 * PowerPoint Service Module - Centralized PowerPoint Operations
 * 
 * Provides a clean interface for PowerPoint generation including:
 * - Slide creation and formatting
 * - Theme application
 * - Image processing and enhancement
 * - File generation and optimization
 * 
 * This module abstracts PowerPoint complexity and provides a consistent
 * interface for presentation generation.
 * 
 * @version 1.0.0
 */

import { generatePpt } from '../pptGenerator';
import { type SlideSpec } from '../schema';
import { type ProfessionalTheme } from '../professionalThemes';

/**
 * PowerPoint generation options
 */
export interface PowerPointOptions {
  theme: ProfessionalTheme;
  includeImages?: boolean;
  includeNotes?: boolean;
  includeMetadata?: boolean;
  optimizeForSize?: boolean;
  quality?: 'draft' | 'standard' | 'high';
}

/**
 * PowerPoint generation result
 */
export interface PowerPointResult {
  buffer: Buffer;
  metadata: {
    slideCount: number;
    fileSize: number;
    generationTime: number;
    theme: string;
    quality: string;
  };
}

/**
 * PowerPoint Service Interface
 */
export interface IPowerPointService {
  generatePresentation(slides: SlideSpec[], options: PowerPointOptions): Promise<PowerPointResult>;
  validateSlides(slides: SlideSpec[]): Promise<{ valid: boolean; errors: string[] }>;
  estimateFileSize(slides: SlideSpec[], options: PowerPointOptions): number;
  getSupportedFormats(): string[];
}

/**
 * Main PowerPoint Service Implementation
 */
export class PowerPointService implements IPowerPointService {
  /**
   * Generate a complete PowerPoint presentation
   */
  async generatePresentation(slides: SlideSpec[], options: PowerPointOptions): Promise<PowerPointResult> {
    const startTime = Date.now();
    console.log(`Generating PowerPoint with ${slides.length} slides...`);

    try {
      // Validate slides before generation
      const validation = await this.validateSlides(slides);
      if (!validation.valid) {
        throw new Error(`Slide validation failed: ${validation.errors.join(', ')}`);
      }

      // Apply quality settings
      const processedSlides = await this.preprocessSlides(slides, options);

      // Generate PowerPoint buffer
      const buffer = await generatePpt(processedSlides, true);

      const generationTime = Date.now() - startTime;
      const fileSize = buffer.length;

      console.log(`PowerPoint generated successfully in ${generationTime}ms (${fileSize} bytes)`);

      return {
        buffer,
        metadata: {
          slideCount: slides.length,
          fileSize,
          generationTime,
          theme: options.theme.name,
          quality: options.quality || 'standard'
        }
      };
    } catch (error) {
      const generationTime = Date.now() - startTime;
      console.error(`PowerPoint generation failed after ${generationTime}ms:`, error);
      throw error;
    }
  }

  /**
   * Validate slide specifications
   */
  async validateSlides(slides: SlideSpec[]): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!slides || slides.length === 0) {
      errors.push('No slides provided');
      return { valid: false, errors };
    }

    if (slides.length > 50) {
      errors.push('Too many slides (maximum 50 allowed)');
    }

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const slideErrors = this.validateSingleSlide(slide, i + 1);
      errors.push(...slideErrors);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Estimate file size based on slide content
   */
  estimateFileSize(slides: SlideSpec[], options: PowerPointOptions): number {
    let baseSize = 50000; // Base PowerPoint file size (~50KB)
    
    slides.forEach(slide => {
      // Text content
      const textLength = (slide.title?.length || 0) + 
                       (slide.paragraph?.length || 0) + 
                       (slide.bullets?.join('').length || 0);
      baseSize += textLength * 10; // ~10 bytes per character

      // Images
      if (slide.imagePrompt || options.includeImages) {
        baseSize += 200000; // ~200KB per image
      }

      // Notes
      if (slide.notes && options.includeNotes) {
        baseSize += slide.notes.length * 5;
      }
    });

    // Quality multiplier
    const qualityMultiplier = {
      'draft': 0.7,
      'standard': 1.0,
      'high': 1.5
    }[options.quality || 'standard'];

    return Math.round(baseSize * qualityMultiplier);
  }

  /**
   * Get supported output formats
   */
  getSupportedFormats(): string[] {
    return ['pptx', 'pdf', 'png', 'jpg'];
  }

  /**
   * Validate a single slide
   */
  private validateSingleSlide(slide: SlideSpec, slideNumber: number): string[] {
    const errors: string[] = [];

    if (!slide.title || slide.title.trim().length === 0) {
      errors.push(`Slide ${slideNumber}: Missing title`);
    }

    if (slide.title && slide.title.length > 100) {
      errors.push(`Slide ${slideNumber}: Title too long (${slide.title.length} characters, max 100)`);
    }

    if (slide.bullets && slide.bullets.length > 10) {
      errors.push(`Slide ${slideNumber}: Too many bullet points (${slide.bullets.length}, max 10)`);
    }

    if (slide.paragraph && slide.paragraph.length > 1000) {
      errors.push(`Slide ${slideNumber}: Paragraph too long (${slide.paragraph.length} characters, max 1000)`);
    }

    // Validate layout-specific requirements
    if (slide.layout === 'two-column' && !slide.left && !slide.right) {
      errors.push(`Slide ${slideNumber}: Two-column layout requires left or right content`);
    }

    return errors;
  }

  /**
   * Preprocess slides based on quality settings
   */
  private async preprocessSlides(slides: SlideSpec[], options: PowerPointOptions): Promise<SlideSpec[]> {
    console.log(`Preprocessing ${slides.length} slides with quality: ${options.quality}`);

    let processedSlides = slides.map(slide => {
      const processed = { ...slide };

      // Apply quality-specific processing
      switch (options.quality) {
        case 'draft':
          // Remove images for faster generation
          if (!options.includeImages) {
            delete processed.imagePrompt;
          }
          // Truncate long content
          if (processed.paragraph && processed.paragraph.length > 500) {
            processed.paragraph = processed.paragraph.substring(0, 500) + '...';
          }
          break;

        case 'high':
          // Ensure all content is present and well-formatted
          if (!processed.notes && processed.paragraph) {
            processed.notes = `Key points: ${processed.paragraph.substring(0, 200)}...`;
          }
          break;

        case 'standard':
        default:
          // Standard processing - no changes needed
          break;
      }

      return processed;
    });

    // Apply batch image processing if enabled and images are present
    if (options.includeImages && options.quality !== 'draft') {
      processedSlides = await this.processBatchImages(processedSlides, options);
    }

    return processedSlides;
  }

  /**
   * Process images in batch for better consistency and performance
   */
  private async processBatchImages(slides: SlideSpec[], options: PowerPointOptions): Promise<SlideSpec[]> {
    console.log('Processing batch images for consistent styling...');

    try {
      // Import image service
      const { imageService } = await import('./imageService');

      // Collect all image prompts
      const imagePrompts: string[] = [];
      const slideIndices: number[] = [];

      slides.forEach((slide, index) => {
        if (slide.imagePrompt) {
          imagePrompts.push(slide.imagePrompt);
          slideIndices.push(index);
        }
      });

      if (imagePrompts.length === 0) {
        return slides;
      }

      // Generate images in batch for consistency
      const batchResult = await imageService.generateBatchImages(imagePrompts, {
        style: 'professional',
        quality: options.quality === 'high' ? 'high' : 'standard',
        aspectRatio: '16:9',
        enhanceColors: true,
        consistentStyling: true
      });

      // Apply generated images back to slides
      const updatedSlides = [...slides];
      batchResult.images.forEach((imageResult, index) => {
        if (imageResult && slideIndices[index] !== undefined) {
          const slideIndex = slideIndices[index];
          updatedSlides[slideIndex] = {
            ...updatedSlides[slideIndex],
            imagePrompt: imageResult.url // Replace prompt with actual image URL
          };
        }
      });

      console.log(`Batch image processing completed: ${batchResult.successCount} success, ${batchResult.failureCount} failures`);
      return updatedSlides;
    } catch (error) {
      console.warn('Batch image processing failed, continuing with original slides:', error);
      return slides;
    }
  }
}

/**
 * Utility functions for PowerPoint operations
 */
export class PowerPointUtils {
  /**
   * Convert slides to different formats
   */
  static async convertToFormat(buffer: Buffer, format: string): Promise<Buffer> {
    // This would implement format conversion
    // For now, just return the original buffer
    console.log(`Converting to ${format} format...`);
    return buffer;
  }

  /**
   * Optimize PowerPoint file size
   */
  static async optimizeFileSize(buffer: Buffer): Promise<Buffer> {
    // This would implement file size optimization
    // For now, just return the original buffer
    console.log('Optimizing file size...');
    return buffer;
  }

  /**
   * Extract metadata from PowerPoint file
   */
  static async extractMetadata(buffer: Buffer): Promise<Record<string, any>> {
    // This would extract metadata from the PowerPoint file
    return {
      fileSize: buffer.length,
      format: 'pptx',
      created: new Date().toISOString()
    };
  }

  /**
   * Validate PowerPoint file integrity
   */
  static async validateFile(buffer: Buffer): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!buffer || buffer.length === 0) {
      errors.push('Empty file buffer');
    }

    if (buffer.length < 1000) {
      errors.push('File too small to be a valid PowerPoint');
    }

    // Check for PowerPoint file signature
    const signature = buffer.slice(0, 4);
    const expectedSignature = Buffer.from([0x50, 0x4B, 0x03, 0x04]); // ZIP signature
    if (!signature.equals(expectedSignature)) {
      errors.push('Invalid PowerPoint file signature');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const powerPointService = new PowerPointService();
export default powerPointService;
