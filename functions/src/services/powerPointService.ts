/**
 * PowerPoint Service Module - Centralized PowerPoint Operations
 * @version 1.1.0
 */

import { generatePpt } from '../pptGenerator';
import { type SlideSpec } from '../schema';
import { type ProfessionalTheme } from '../professionalThemes';

/** PowerPoint generation options */
export interface PowerPointOptions {
  theme: ProfessionalTheme;
  includeImages?: boolean;
  includeNotes?: boolean;
  includeMetadata?: boolean;   // embed into the file (stubbed below)
  optimizeForSize?: boolean;   // run optimizer (stubbed below)
  quality?: 'draft' | 'standard' | 'high';
}

/** PowerPoint generation result */
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

/** PowerPoint Service Interface */
export interface IPowerPointService {
  generatePresentation(slides: SlideSpec[], options: PowerPointOptions): Promise<PowerPointResult>;
  validateSlides(slides: SlideSpec[]): Promise<{ valid: boolean; errors: string[] }>;
  estimateFileSize(slides: SlideSpec[], options: PowerPointOptions): number;
  getSupportedFormats(): string[];
}

/** Internal: merged options with defaults applied */
type ResolvedOptions = Required<Omit<PowerPointOptions, 'theme'>> & { theme: ProfessionalTheme };

/** Defaults */
const DEFAULTS: ResolvedOptions = {
  theme: { name: 'Default' } as ProfessionalTheme, // overwritten by caller
  includeImages: true,
  includeNotes: true,
  includeMetadata: true,
  optimizeForSize: false,
  quality: 'standard'
};

/** Internal type augmentation to avoid breaking SlideSpec */
type SlideWithGen = SlideSpec & { generatedImageUrl?: string };

type Logger = Pick<Console, 'log' | 'warn' | 'error' | 'time' | 'timeEnd'>;

/**
 * Main PowerPoint Service Implementation
 */
export class PowerPointService implements IPowerPointService {
  constructor(private readonly logger: Logger = console) {}

  /** Generate a complete PowerPoint presentation */
  async generatePresentation(slides: SlideSpec[], options: PowerPointOptions): Promise<PowerPointResult> {
    const startTime = Date.now();
    const opts: ResolvedOptions = { ...DEFAULTS, ...options, theme: options.theme };

    this.logger.log(`Generating PowerPoint with ${slides.length} slides (quality=${opts.quality})...`);

    try {
      // 1) Validate slides up front
      const validation = await this.validateSlides(slides);
      if (!validation.valid) {
        throw new Error(`Slide validation failed: ${validation.errors.join(', ')}`);
      }

      // 2) Preprocess slides to reflect options (don’t rely on generator options)
      let processedSlides = await this.preprocessSlides(slides, opts);

      // 3) Batch image generation (only when we actually want images and not in draft)
      if (opts.includeImages && opts.quality !== 'draft') {
        processedSlides = await this.processBatchImages(processedSlides, opts);
      }

      // 4) Generate PPTX buffer (keeping 2nd arg = true for backward-compat)
      const rawBuffer = await generatePpt(processedSlides as SlideSpec[], true);

      // 5) Optional size optimization
      const optimizedBuffer = opts.optimizeForSize
        ? await PowerPointUtils.optimizeFileSize(rawBuffer)
        : rawBuffer;

      // 6) Optional metadata embedding
      const finalBuffer = opts.includeMetadata
        ? await PowerPointUtils.embedMetadata(optimizedBuffer, {
            theme: opts.theme.name,
            quality: opts.quality,
            slideCount: processedSlides.length
          })
        : optimizedBuffer;

      const generationTime = Date.now() - startTime;
      const fileSize = finalBuffer.length;

      this.logger.log(`PowerPoint generated successfully in ${generationTime}ms (${fileSize} bytes)`);

      return {
        buffer: finalBuffer,
        metadata: {
          slideCount: processedSlides.length,
          fileSize,
          generationTime,
          theme: opts.theme.name,
          quality: opts.quality
        }
      };
    } catch (error) {
      const generationTime = Date.now() - startTime;
      this.logger.error(`PowerPoint generation failed after ${generationTime}ms:`, error);
      throw error;
    }
  }

  /** Validate slide specifications */
  async validateSlides(slides: SlideSpec[]): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    const MAX_SLIDES = 50;

    if (!slides || slides.length === 0) {
      errors.push('No slides provided');
      return { valid: false, errors };
    }
    if (slides.length > MAX_SLIDES) {
      errors.push(`Too many slides (maximum ${MAX_SLIDES} allowed)`);
    }

    for (let i = 0; i < slides.length; i++) {
      errors.push(...this.validateSingleSlide(slides[i] as SlideWithGen, i + 1));
    }

    return { valid: errors.length === 0, errors };
  }

  /** Estimate file size based on slide content and options (rough heuristic, but consistent) */
  estimateFileSize(slides: SlideSpec[], options: PowerPointOptions): number {
    const opts: ResolvedOptions = { ...DEFAULTS, ...options, theme: options.theme };

    let size = 50_000; // base ZIP container overhead (~50KB)

    for (const s0 of slides) {
      const s = s0 as SlideWithGen;

      // Text bytes (very rough): characters * 8 (XML + packing + relationships)
      const textChars =
        (s.title?.length || 0) +
        (s.paragraph?.length || 0) +
        (s.bullets?.reduce((acc, b) => acc + b.length + 2, 0) || 0) +
        (s.notes?.length || 0);

      size += textChars * 8;

      // Images: only count if slide has a prompt or a URL and images are included for this run
      const hasImage = Boolean((s as any).imagePrompt || s.generatedImageUrl);
      if (opts.includeImages && hasImage) {
        const perImage =
          opts.quality === 'high' ? 400_000 :
          opts.quality === 'draft' ? 80_000 :
          200_000;
        size += perImage;
      }
    }

    // Optimize-for-size typically squeezes 10–30%, model at 20%
    if (opts.optimizeForSize) size = Math.round(size * 0.8);

    return Math.max(1024, Math.round(size));
  }

  /** Only advertise formats we truly support right now */
  getSupportedFormats(): string[] {
    return ['pptx'];
  }

  /** ---- private helpers ---- */

  private validateSingleSlide(slide: SlideWithGen, slideNumber: number): string[] {
    const errors: string[] = [];

    // Title
    if (!slide.title || slide.title.trim().length === 0) {
      errors.push(`Slide ${slideNumber}: Missing title`);
    } else if (slide.title.length > 100) {
      errors.push(`Slide ${slideNumber}: Title too long (${slide.title.length} characters, max 100)`);
    }

    // Paragraph / bullets
    if (slide.paragraph && slide.paragraph.length > 1000) {
      errors.push(`Slide ${slideNumber}: Paragraph too long (${slide.paragraph.length} characters, max 1000)`);
    }
    if (slide.bullets && slide.bullets.length > 10) {
      errors.push(`Slide ${slideNumber}: Too many bullet points (${slide.bullets.length}, max 10)`);
    }

    // Layout-specific checks (non-breaking – only add if properties exist)
    if ((slide as any).layout === 'two-column' && !(slide as any).left && !(slide as any).right) {
      errors.push(`Slide ${slideNumber}: Two-column layout requires left or right content`);
    }

    return errors;
  }

  /** Preprocess slides so the generator receives exactly what we want */
  private async preprocessSlides(slides: SlideSpec[], options: ResolvedOptions): Promise<SlideSpec[]> {
    const processed = slides.map((slide0) => {
      const slide = { ...(slide0 as SlideWithGen) };

      // Notes
      if (!options.includeNotes && 'notes' in slide) {
        delete slide.notes;
      } else if (options.includeNotes && options.quality === 'high' && !slide.notes && slide.paragraph) {
        // Add brief notes from paragraph if absent
        const snippet = slide.paragraph.length > 200 ? `${slide.paragraph.slice(0, 200)}…` : slide.paragraph;
        slide.notes = `Key points: ${snippet}`;
      }

      // Images
      const shouldStripImages = !options.includeImages || options.quality === 'draft';
      if (shouldStripImages) {
        // Remove both prompt and generated URL references
        if ('generatedImageUrl' in slide) delete slide.generatedImageUrl;
        if ('imagePrompt' in (slide as any)) delete (slide as any).imagePrompt;
      }

      // Draft truncation
      if (options.quality === 'draft' && slide.paragraph && slide.paragraph.length > 500) {
        slide.paragraph = slide.paragraph.slice(0, 500) + '…';
      }

      return slide as SlideSpec;
    });

    return processed;
  }

  /** Generate images in batch (non-breaking: adds `generatedImageUrl`, keeps `imagePrompt`) */
  private async processBatchImages(slides: SlideSpec[], options: ResolvedOptions): Promise<SlideSpec[]> {
    try {
      const { imageService } = await import('./imageService');

      const prompts: string[] = [];
      const idxs: number[] = [];

      slides.forEach((s, i) => {
        const prompt = (s as any).imagePrompt as string | undefined;
        if (prompt) {
          prompts.push(prompt);
          idxs.push(i);
        }
      });

      if (prompts.length === 0) return slides;

      const batchResult = await imageService.generateBatchImages(prompts, {
        style: 'professional',
        quality: options.quality === 'high' ? 'high' : 'standard',
        aspectRatio: '16:9',
        enhanceColors: true,
        consistentStyling: true
      });

      const out = slides.map((s) => ({ ...(s as SlideWithGen) })) as SlideWithGen[];
      batchResult.images.forEach((img: { url?: string } | null, pIdx: number) => {
        const slideIndex = idxs[pIdx];
        if (!img || !img.url || slideIndex == null) return;
        out[slideIndex].generatedImageUrl = img.url; // keep prompt intact
      });

      this.logger.log(`Batch image processing: ${batchResult.successCount} success, ${batchResult.failureCount} failures`);
      return out as SlideSpec[];
    } catch (err) {
      this.logger.warn('Batch image processing failed; continuing without generated images:', err);
      return slides;
    }
  }
}

/** Utility functions for PowerPoint operations */
export class PowerPointUtils {
  /** Convert slides to different formats (not implemented) */
  static async convertToFormat(buffer: Buffer, format: string): Promise<Buffer> {
    if (format !== 'pptx') {
      throw new Error(`Conversion to '${format}' is not implemented`);
    }
    return buffer;
  }

  /** Optimize PowerPoint file size (stub) */
  static async optimizeFileSize(buffer: Buffer): Promise<Buffer> {
    // TODO: implement (recompress media, dedupe XML parts, remove unused relationships)
    return buffer;
  }

  /** Embed metadata into file (stub – safe no-op until wired) */
  static async embedMetadata(buffer: Buffer, meta: Record<string, any>): Promise<Buffer> {
    // TODO: implement using PPTX core properties
    // meta: { theme, quality, slideCount, ... }
    return buffer;
  }

  /** Extract metadata from PowerPoint file */
  static async extractMetadata(buffer: Buffer): Promise<Record<string, any>> {
    return {
      fileSize: buffer.length,
      format: 'pptx',
      created: new Date().toISOString()
    };
  }

  /** Validate PowerPoint file integrity (basic ZIP signature & size checks) */
  static async validateFile(buffer: Buffer): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    if (!buffer || buffer.length === 0) errors.push('Empty file buffer');
    if (buffer.length < 1000) errors.push('File too small to be a valid PowerPoint');

    // ZIP local file header signature: 0x50 0x4B 0x03 0x04
    if (buffer.length >= 4) {
      const sig = buffer.slice(0, 4);
      const expected = Buffer.from([0x50, 0x4B, 0x03, 0x04]);
      if (!sig.equals(expected)) errors.push('Invalid PowerPoint file signature');
    }

    return { valid: errors.length === 0, errors };
  }
}

// Export singleton instance
export const powerPointService = new PowerPointService();
export default powerPointService;