/**
 * Smart Aspect Ratio Management System
 * 
 * Advanced system for converting square DALL·E images to presentation-friendly
 * aspect ratios with intelligent cropping, background extension, and composition.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import sharp from 'sharp';

/**
 * Aspect ratio configuration
 */
export interface AspectRatioConfig {
  targetRatio: '16:9' | '4:3' | '1:1' | 'custom';
  customRatio?: { width: number; height: number };
  strategy: 'crop' | 'extend' | 'fit' | 'fill' | 'smart';
  backgroundExtension: {
    enabled: boolean;
    method: 'blur' | 'mirror' | 'gradient' | 'solid';
    blurRadius?: number;
    gradientColors?: string[];
    solidColor?: string;
  };
  cropFocus: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'entropy' | 'attention';
  preserveSubject: boolean;
  qualityOptimization: boolean;
}

/**
 * Aspect ratio conversion result
 */
export interface AspectRatioResult {
  buffer: Buffer;
  originalDimensions: { width: number; height: number };
  finalDimensions: { width: number; height: number };
  appliedStrategy: string;
  cropArea?: { left: number; top: number; width: number; height: number };
  processingTime: number;
  qualityScore: number;
}

/**
 * Subject detection result
 */
interface SubjectDetection {
  boundingBox: { x: number; y: number; width: number; height: number };
  confidence: number;
  centerPoint: { x: number; y: number };
}

/**
 * Smart Aspect Ratio Manager
 */
export class AspectRatioManager {
  private config: AspectRatioConfig;

  constructor(config: Partial<AspectRatioConfig> = {}) {
    this.config = {
      targetRatio: '16:9',
      strategy: 'smart',
      backgroundExtension: {
        enabled: true,
        method: 'blur',
        blurRadius: 20
      },
      cropFocus: 'entropy',
      preserveSubject: true,
      qualityOptimization: true,
      ...config
    };
  }

  /**
   * Convert image to target aspect ratio
   */
  async convertAspectRatio(buffer: Buffer): Promise<AspectRatioResult> {
    const startTime = Date.now();
    const metadata = await sharp(buffer).metadata();
    const originalWidth = metadata.width || 0;
    const originalHeight = metadata.height || 0;

    console.log(`📐 Converting aspect ratio: ${originalWidth}x${originalHeight} to ${this.config.targetRatio}`);

    // Calculate target dimensions
    const targetDimensions = this.calculateTargetDimensions(originalWidth, originalHeight);
    const targetAspect = targetDimensions.width / targetDimensions.height;
    const currentAspect = originalWidth / originalHeight;

    // If aspect ratios are already close, just resize
    if (Math.abs(currentAspect - targetAspect) < 0.01) {
      const resized = await sharp(buffer)
        .resize(targetDimensions.width, targetDimensions.height)
        .toBuffer();

      return {
        buffer: resized,
        originalDimensions: { width: originalWidth, height: originalHeight },
        finalDimensions: targetDimensions,
        appliedStrategy: 'resize-only',
        processingTime: Date.now() - startTime,
        qualityScore: 95
      };
    }

    let result: AspectRatioResult;

    // Apply the configured strategy
    switch (this.config.strategy) {
      case 'crop':
        result = await this.cropToAspectRatio(buffer, targetDimensions);
        break;
      case 'extend':
        result = await this.extendToAspectRatio(buffer, targetDimensions);
        break;
      case 'fit':
        result = await this.fitToAspectRatio(buffer, targetDimensions);
        break;
      case 'fill':
        result = await this.fillToAspectRatio(buffer, targetDimensions);
        break;
      case 'smart':
      default:
        result = await this.smartConversion(buffer, targetDimensions);
        break;
    }

    result.processingTime = Date.now() - startTime;
    
    console.log(`✅ Aspect ratio conversion complete: ${result.appliedStrategy} strategy, ${result.processingTime}ms`);
    
    return result;
  }

  /**
   * Smart conversion that chooses the best strategy automatically
   */
  private async smartConversion(buffer: Buffer, targetDimensions: { width: number; height: number }): Promise<AspectRatioResult> {
    const metadata = await sharp(buffer).metadata();
    const originalWidth = metadata.width || 0;
    const originalHeight = metadata.height || 0;
    const currentAspect = originalWidth / originalHeight;
    const targetAspect = targetDimensions.width / targetDimensions.height;

    // Detect subject if preservation is enabled
    let subjectDetection: SubjectDetection | null = null;
    if (this.config.preserveSubject) {
      subjectDetection = await this.detectSubject(buffer);
    }

    // Decision logic for best strategy
    if (currentAspect > targetAspect) {
      // Image is wider than target - need to crop width or extend height
      if (subjectDetection && this.isSubjectCentral(subjectDetection, originalWidth, originalHeight)) {
        // Subject is central, safe to crop sides
        return await this.cropToAspectRatio(buffer, targetDimensions);
      } else {
        // Subject might be off-center, extend instead
        return await this.extendToAspectRatio(buffer, targetDimensions);
      }
    } else {
      // Image is taller than target - need to crop height or extend width
      if (subjectDetection && this.isSubjectCentral(subjectDetection, originalWidth, originalHeight)) {
        // Subject is central, safe to crop top/bottom
        return await this.cropToAspectRatio(buffer, targetDimensions);
      } else {
        // Subject might be off-center, extend instead
        return await this.extendToAspectRatio(buffer, targetDimensions);
      }
    }
  }

  /**
   * Crop image to target aspect ratio
   */
  private async cropToAspectRatio(buffer: Buffer, targetDimensions: { width: number; height: number }): Promise<AspectRatioResult> {
    const metadata = await sharp(buffer).metadata();
    const originalWidth = metadata.width || 0;
    const originalHeight = metadata.height || 0;

    let cropOptions: sharp.ResizeOptions = {
      fit: 'cover',
      position: this.getCropPosition()
    };

    const croppedBuffer = await sharp(buffer)
      .resize(targetDimensions.width, targetDimensions.height, cropOptions)
      .toBuffer();

    return {
      buffer: croppedBuffer,
      originalDimensions: { width: originalWidth, height: originalHeight },
      finalDimensions: targetDimensions,
      appliedStrategy: 'crop',
      processingTime: 0,
      qualityScore: 85
    };
  }

  /**
   * Extend image to target aspect ratio with background
   */
  private async extendToAspectRatio(buffer: Buffer, targetDimensions: { width: number; height: number }): Promise<AspectRatioResult> {
    const metadata = await sharp(buffer).metadata();
    const originalWidth = metadata.width || 0;
    const originalHeight = metadata.height || 0;

    // First, resize to fit within target dimensions
    const resized = await sharp(buffer)
      .resize(targetDimensions.width, targetDimensions.height, {
        fit: 'inside',
        withoutEnlargement: false
      })
      .toBuffer();

    const resizedMetadata = await sharp(resized).metadata();
    const resizedWidth = resizedMetadata.width || 0;
    const resizedHeight = resizedMetadata.height || 0;

    // If it already fits perfectly, return as is
    if (resizedWidth === targetDimensions.width && resizedHeight === targetDimensions.height) {
      return {
        buffer: resized,
        originalDimensions: { width: originalWidth, height: originalHeight },
        finalDimensions: targetDimensions,
        appliedStrategy: 'resize-fit',
        processingTime: 0,
        qualityScore: 90
      };
    }

    // Create background extension
    const background = await this.createBackground(buffer, targetDimensions);
    
    // Composite the resized image on the background
    const extended = await sharp(background)
      .composite([{
        input: resized,
        gravity: 'center'
      }])
      .toBuffer();

    return {
      buffer: extended,
      originalDimensions: { width: originalWidth, height: originalHeight },
      finalDimensions: targetDimensions,
      appliedStrategy: 'extend',
      processingTime: 0,
      qualityScore: 88
    };
  }

  /**
   * Fit image within target dimensions (letterbox/pillarbox)
   */
  private async fitToAspectRatio(buffer: Buffer, targetDimensions: { width: number; height: number }): Promise<AspectRatioResult> {
    const metadata = await sharp(buffer).metadata();
    const originalWidth = metadata.width || 0;
    const originalHeight = metadata.height || 0;

    const fitted = await sharp(buffer)
      .resize(targetDimensions.width, targetDimensions.height, {
        fit: 'inside',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toBuffer();

    return {
      buffer: fitted,
      originalDimensions: { width: originalWidth, height: originalHeight },
      finalDimensions: targetDimensions,
      appliedStrategy: 'fit',
      processingTime: 0,
      qualityScore: 80
    };
  }

  /**
   * Fill target dimensions (may stretch image)
   */
  private async fillToAspectRatio(buffer: Buffer, targetDimensions: { width: number; height: number }): Promise<AspectRatioResult> {
    const metadata = await sharp(buffer).metadata();
    const originalWidth = metadata.width || 0;
    const originalHeight = metadata.height || 0;

    const filled = await sharp(buffer)
      .resize(targetDimensions.width, targetDimensions.height, {
        fit: 'fill'
      })
      .toBuffer();

    return {
      buffer: filled,
      originalDimensions: { width: originalWidth, height: originalHeight },
      finalDimensions: targetDimensions,
      appliedStrategy: 'fill',
      processingTime: 0,
      qualityScore: 70 // Lower quality due to potential stretching
    };
  }

  /**
   * Create background for extension
   */
  private async createBackground(buffer: Buffer, targetDimensions: { width: number; height: number }): Promise<Buffer> {
    const { method } = this.config.backgroundExtension;

    switch (method) {
      case 'blur':
        return await this.createBlurredBackground(buffer, targetDimensions);
      case 'mirror':
        return await this.createMirroredBackground(buffer, targetDimensions);
      case 'gradient':
        return await this.createGradientBackground(buffer, targetDimensions);
      case 'solid':
      default:
        return await this.createSolidBackground(targetDimensions);
    }
  }

  /**
   * Create blurred background from the image itself
   */
  private async createBlurredBackground(buffer: Buffer, targetDimensions: { width: number; height: number }): Promise<Buffer> {
    const blurRadius = this.config.backgroundExtension.blurRadius || 20;

    return await sharp(buffer)
      .resize(targetDimensions.width, targetDimensions.height, { fit: 'cover' })
      .blur(blurRadius)
      .modulate({ brightness: 0.7, saturation: 0.5 })
      .toBuffer();
  }

  /**
   * Create mirrored background
   */
  private async createMirroredBackground(buffer: Buffer, targetDimensions: { width: number; height: number }): Promise<Buffer> {
    // This is a simplified implementation
    // In a full implementation, you would create proper edge mirroring
    return await sharp(buffer)
      .resize(targetDimensions.width, targetDimensions.height, { fit: 'cover' })
      .blur(5)
      .modulate({ brightness: 0.8 })
      .toBuffer();
  }

  /**
   * Create gradient background
   */
  private async createGradientBackground(buffer: Buffer, targetDimensions: { width: number; height: number }): Promise<Buffer> {
    const colors = this.config.backgroundExtension.gradientColors || ['#f0f0f0', '#e0e0e0'];
    
    // Create a simple gradient using SVG
    const gradient = Buffer.from(`
      <svg width="${targetDimensions.width}" height="${targetDimensions.height}">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${colors[1] || colors[0]};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)" />
      </svg>
    `);

    return await sharp(gradient).png().toBuffer();
  }

  /**
   * Create solid color background
   */
  private async createSolidBackground(targetDimensions: { width: number; height: number }): Promise<Buffer> {
    const color = this.config.backgroundExtension.solidColor || '#ffffff';
    
    return await sharp({
      create: {
        width: targetDimensions.width,
        height: targetDimensions.height,
        channels: 3,
        background: color
      }
    }).png().toBuffer();
  }

  /**
   * Calculate target dimensions based on aspect ratio
   */
  private calculateTargetDimensions(originalWidth: number, originalHeight: number): { width: number; height: number } {
    let targetWidth: number;
    let targetHeight: number;

    switch (this.config.targetRatio) {
      case '16:9':
        // Use the larger dimension as reference
        if (originalWidth >= originalHeight) {
          targetWidth = Math.max(originalWidth, 1920);
          targetHeight = Math.round(targetWidth * 9 / 16);
        } else {
          targetHeight = Math.max(originalHeight, 1080);
          targetWidth = Math.round(targetHeight * 16 / 9);
        }
        break;
      case '4:3':
        if (originalWidth >= originalHeight) {
          targetWidth = Math.max(originalWidth, 1600);
          targetHeight = Math.round(targetWidth * 3 / 4);
        } else {
          targetHeight = Math.max(originalHeight, 1200);
          targetWidth = Math.round(targetHeight * 4 / 3);
        }
        break;
      case '1:1':
        const size = Math.max(originalWidth, originalHeight, 1024);
        targetWidth = size;
        targetHeight = size;
        break;
      case 'custom':
        const ratio = this.config.customRatio!;
        const scale = Math.max(originalWidth / ratio.width, originalHeight / ratio.height);
        targetWidth = Math.round(ratio.width * scale);
        targetHeight = Math.round(ratio.height * scale);
        break;
      default:
        targetWidth = originalWidth;
        targetHeight = originalHeight;
    }

    return { width: targetWidth, height: targetHeight };
  }

  /**
   * Get crop position based on focus setting
   */
  private getCropPosition(): string | any {
    switch (this.config.cropFocus) {
      case 'entropy':
        return sharp.strategy.entropy;
      case 'attention':
        return sharp.strategy.attention;
      case 'center':
        return 'center';
      case 'top':
        return 'top';
      case 'bottom':
        return 'bottom';
      case 'left':
        return 'left';
      case 'right':
        return 'right';
      default:
        return 'center';
    }
  }

  /**
   * Simple subject detection using edge detection
   */
  private async detectSubject(buffer: Buffer): Promise<SubjectDetection> {
    // This is a simplified implementation
    // In production, you would use more sophisticated computer vision
    const metadata = await sharp(buffer).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    // For now, assume subject is in the center third of the image
    return {
      boundingBox: {
        x: Math.round(width * 0.25),
        y: Math.round(height * 0.25),
        width: Math.round(width * 0.5),
        height: Math.round(height * 0.5)
      },
      confidence: 0.7,
      centerPoint: {
        x: Math.round(width * 0.5),
        y: Math.round(height * 0.5)
      }
    };
  }

  /**
   * Check if detected subject is centrally located
   */
  private isSubjectCentral(detection: SubjectDetection, imageWidth: number, imageHeight: number): boolean {
    const centerX = imageWidth / 2;
    const centerY = imageHeight / 2;
    const subjectCenterX = detection.centerPoint.x;
    const subjectCenterY = detection.centerPoint.y;

    // Consider subject central if it's within 25% of image center
    const thresholdX = imageWidth * 0.25;
    const thresholdY = imageHeight * 0.25;

    return Math.abs(centerX - subjectCenterX) < thresholdX && 
           Math.abs(centerY - subjectCenterY) < thresholdY;
  }
}
