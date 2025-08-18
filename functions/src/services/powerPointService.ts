/**
 * PowerPoint Service Module - Centralized PowerPoint Operations
 * @version 1.2.0
 *
 * Enhancements in 1.2.0:
 * - Retries with exponential backoff around PPT generation
 * - Optional abort/cancel via AbortSignal
 * - Optional onProgress callback with well-defined stages
 * - Stronger validation & clearer error messages
 * - Smarter preprocessing for compactMode and typographyScale
 * - More consistent, slightly improved file size estimation
 * - Richer structured logging with context
 */

import { generatePpt } from '../pptGenerator-enhanced';
import { type SlideSpec } from '../schema';
import { type ProfessionalTheme } from '../professionalThemes';
import { logger, type LogContext } from '../utils/smartLogger';

/** Lifecycle stages for progress reporting */
type Stage =
  | 'validate'
  | 'preprocess'
  | 'images'
  | 'generate'
  | 'optimize'
  | 'metadata'
  | 'complete';

/** PowerPoint generation options */
export interface PowerPointOptions {
  theme: ProfessionalTheme;
  includeImages?: boolean;
  includeNotes?: boolean;
  includeMetadata?: boolean;   // embed into the file (stubbed below)
  optimizeForSize?: boolean;   // run optimizer (stubbed below)
  quality?: 'draft' | 'standard' | 'high';
  compactMode?: boolean;       // compact spacing mode for dense decks
  typographyScale?: 'auto' | 'compact' | 'normal' | 'large'; // global typography scaling preference
  /** Number of retries around core generation (default 0) */
  retries?: number;
  /** Abort/cancel support */
  signal?: AbortSignal;
  /** Optional progress callback */
  onProgress?: (event: { stage: Stage; progress: number; detail?: Record<string, any> }) => void;
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
    /** Number of retries that were actually performed */
    retries: number;
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
type ResolvedOptions = Required<Omit<PowerPointOptions, 'theme' | 'signal' | 'onProgress'>> & {
  theme: ProfessionalTheme;
  signal?: AbortSignal;
  onProgress?: (event: { stage: Stage; progress: number; detail?: Record<string, any> }) => void;
};

/** Defaults */
const DEFAULTS: Omit<ResolvedOptions, 'signal' | 'onProgress'> = {
  theme: { name: 'Default' } as ProfessionalTheme, // overwritten by caller
  includeImages: true,
  includeNotes: true,
  includeMetadata: true,
  optimizeForSize: false,
  quality: 'standard',
  compactMode: false,
  typographyScale: 'auto',
  retries: 0,
};

/** Internal type augmentation to avoid breaking SlideSpec */
type SlideWithGen = SlideSpec & { generatedImageUrl?: string } & Record<string, any>;

type Logger = Pick<Console, 'log' | 'warn' | 'error' | 'time' | 'timeEnd'>;

/**
 * Main PowerPoint Service Implementation
 */
export class PowerPointService implements IPowerPointService {
  static readonly MAX_SLIDES = 50;

  constructor(private readonly logger: Logger = console) {}

  /** Generate a complete PowerPoint presentation */
  async generatePresentation(slides: SlideSpec[], options: PowerPointOptions): Promise<PowerPointResult> {
    const startTime = Date.now();
    const opts: ResolvedOptions = { ...DEFAULTS, ...options, theme: options.theme };
    const context: LogContext = {
      requestId: `ppt_gen_${Date.now()}`,
      component: 'powerPointService',
      operation: 'generatePresentation'
    };

    const checkAbort = (stage: Stage) => {
      if (opts.signal?.aborted) {
        const err = new Error(`Generation aborted during '${stage}' stage`);
        (err as any).name = 'AbortError';
        throw err;
      }
    };

    const progress = (stage: Stage, value: number, detail?: Record<string, any>) => {
      try {
        opts.onProgress?.({ stage, progress: Math.min(100, Math.max(0, value)), detail });
      } catch (e) {
        // best-effort; progress handler errors must not break generation
        this.logger.warn('Progress handler threw an error; ignoring.', e);
      }
    };

    this.logger.log(`Generating PowerPoint with ${slides.length} slides (quality=${opts.quality})...`);
    logger.info(`Starting PowerPoint generation`, context, { slideCount: slides.length, options: { ...options, theme: options.theme?.name } });

    try {
      checkAbort('validate');
      progress('validate', 0, { slideCount: slides.length });

      // 1) Validate slides up front
      const validation = await this.validateSlides(slides);
      if (!validation.valid) {
        logger.warn('Slide validation failed', context, { errors: validation.errors });
        throw new Error(`Slide validation failed: ${validation.errors.join('; ')}`);
      }
      progress('validate', 100);

      logger.info('Slide validation passed', context);

      // 2) Preprocess slides to reflect options (don’t rely on generator options)
      checkAbort('preprocess');
      progress('preprocess', 10);
      let processedSlides = await this.preprocessSlides(slides, opts);
      progress('preprocess', 100, { processedCount: processedSlides.length });

      // 3) Batch image generation (only when we actually want images and not in draft)
      checkAbort('images');
      if (opts.includeImages && opts.quality !== 'draft') {
        progress('images', 5);
        processedSlides = await this.processBatchImages(processedSlides, opts);
        progress('images', 100);
      }

      // 4) Generate PPTX buffer with retry & abort checks
      checkAbort('generate');
      progress('generate', 5);
      this.logger.time?.('generatePpt');
      const { result: rawBuffer, attempts } = await this.withRetry<Buffer>(
        async () => {
          checkAbort('generate');
          return await generatePpt(processedSlides as SlideSpec[], true);
        },
        opts.retries,
        (attempt, err) => {
          logger.warn('generatePpt attempt failed; will retry', context, { attempt, error: (err as Error)?.message });
        }
      );
      this.logger.timeEnd?.('generatePpt');
      progress('generate', 100, { attempts });

      // 5) Optional size optimization
      checkAbort('optimize');
      progress('optimize', 0);
      const optimizedBuffer = opts.optimizeForSize
        ? await PowerPointUtils.optimizeFileSize(rawBuffer)
        : rawBuffer;
      progress('optimize', 100, { optimized: opts.optimizeForSize });

      // 6) Optional metadata embedding
      checkAbort('metadata');
      progress('metadata', 0);
      const finalBuffer = opts.includeMetadata
        ? await PowerPointUtils.embedMetadata(optimizedBuffer, {
            theme: opts.theme.name,
            quality: opts.quality,
            slideCount: processedSlides.length
          })
        : optimizedBuffer;
      progress('metadata', 100);

      const generationTime = Date.now() - startTime;
      const fileSize = finalBuffer.length;

      this.logger.log(`PowerPoint generated successfully in ${generationTime}ms (${fileSize} bytes)`);
      logger.info('PowerPoint generation complete', context, { fileSize, generationTime, slideCount: slides.length, attempts });

      // Log optimization if applied
      if (opts.optimizeForSize && rawBuffer.length !== finalBuffer.length) {
        logger.info('File size optimization applied', context, {
          originalSize: rawBuffer.length,
          optimizedSize: finalBuffer.length,
          savings: rawBuffer.length - finalBuffer.length
        });
      }

      progress('complete', 100, { fileSize, generationTime });

      return {
        buffer: finalBuffer,
        metadata: {
          slideCount: processedSlides.length,
          fileSize,
          generationTime,
          theme: opts.theme.name,
          quality: opts.quality,
          retries: attempts - 1
        }
      };
    } catch (error) {
      const generationTime = Date.now() - startTime;
      this.logger.error(`PowerPoint generation failed after ${generationTime}ms:`, error);

      logger.error('PowerPoint generation failed', context, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        generationTime,
        slideCount: slides.length,
        options: { ...options, theme: options.theme?.name },
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version
      });

      // Enhance error with additional context
      if (error instanceof Error) {
        const errorMessage = error.message;
        if (errorMessage.includes('timeout')) {
          error.message = `Generation timeout after ${generationTime}ms. Try reducing slide count or complexity.`;
        } else if (errorMessage.includes('memory')) {
          error.message = `Insufficient memory for generation. Try reducing slide count or image complexity.`;
        } else {
          error.message = `PowerPoint Service Error: ${errorMessage}`;
        }
      }

      throw error;
    }
  }

  /** Validate slide specifications */
  async validateSlides(slides: SlideSpec[]): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    const MAX_SLIDES = PowerPointService.MAX_SLIDES;

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

    // Base DOCX/PPTX ZIP container overhead and required parts (~50KB), plus per-slide overhead (~12KB)
    let size = 50_000 + slides.length * 12_000;

    for (const s0 of slides) {
      const s = s0 as SlideWithGen;

      // Text bytes (very rough): characters * 7 (XML + packing + relationships)
      const textChars =
        (s.title?.length || 0) +
        (s.paragraph?.length || 0) +
        (s.bullets?.reduce((acc: number, b: string) => acc + b.length + 2, 0) || 0) +
        (opts.includeNotes ? (s.notes?.length || 0) : 0);

      // Typography / compact scaling: compact reduces text payload a bit
      const scale =
        opts.typographyScale === 'compact' ? 0.9 :
        opts.typographyScale === 'large' ? 1.1 :
        1.0;
      const compactFactor = opts.compactMode ? 0.92 : 1.0;

      size += Math.round(textChars * 7 * scale * compactFactor);

      // Images: only count if slide has a prompt or a URL and images are included for this run
      const hasImage = Boolean((s as any).imagePrompt || s.generatedImageUrl);
      if (opts.includeImages && hasImage) {
        const perImage =
          opts.quality === 'high' ? 420_000 :
          opts.quality === 'draft' ? 90_000 :
          210_000;
        size += perImage;
      }
    }

    // Optimize-for-size typically squeezes 10–30%, model midpoint at ~22%
    if (opts.optimizeForSize) size = Math.round(size * 0.78);

    // Round to at least 1KB
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
    if (!slide.title || String(slide.title).trim().length === 0) {
      errors.push(`Slide ${slideNumber}: Missing title`);
    } else if (String(slide.title).length > 100) {
      errors.push(`Slide ${slideNumber}: Title too long (${String(slide.title).length} characters, max 100)`);
    }

    // Paragraph / bullets
    if (slide.paragraph && String(slide.paragraph).length > 1200) {
      errors.push(`Slide ${slideNumber}: Paragraph too long (${String(slide.paragraph).length} characters, max 1200)`);
    }
    if (slide.bullets) {
      if (!Array.isArray(slide.bullets)) {
        errors.push(`Slide ${slideNumber}: Bullets must be an array of strings`);
      } else {
        if (slide.bullets.length > 10) {
          errors.push(`Slide ${slideNumber}: Too many bullet points (${slide.bullets.length}, max 10)`);
        }
        const tooLong = slide.bullets.findIndex((b: any) => typeof b !== 'string' || b.length > 300 || b.trim().length === 0);
        if (tooLong !== -1) {
          errors.push(`Slide ${slideNumber}: Bullet ${tooLong + 1} invalid (empty or > 300 characters)`);
        }
      }
    }

    // Layout-specific checks (non-breaking – only add if properties exist)
    if ((slide as any).layout === 'two-column' && !(slide as any).left && !(slide as any).right) {
      errors.push(`Slide ${slideNumber}: Two-column layout requires left or right content`);
    }

    return errors;
  }

  /** Preprocess slides so the generator receives exactly what we want */
  private async preprocessSlides(slides: SlideSpec[], options: ResolvedOptions): Promise<SlideSpec[]> {
    const compactBulletCap = 7; // slightly stricter than validation for dense decks

    const normalizeWhitespace = (text: string) =>
      text
        .replace(/\r\n|\r/g, '\n')
        .replace(/\s+\n/g, '\n')
        .replace(/[ \t]{2,}/g, ' ')
        .trim();

    const smartTruncate = (text: string, max: number) => (text.length > max ? text.slice(0, max - 1) + '…' : text);

    const fontScale =
      options.typographyScale === 'compact' ? 0.9 :
      options.typographyScale === 'large' ? 1.1 :
      options.typographyScale === 'auto' && options.compactMode ? 0.95 :
      1.0;

    const processed = slides.map((slide0, idx) => {
      const slide = { ...(slide0 as SlideWithGen) };

      // Normalize text fields where present
      if (typeof slide.title === 'string') slide.title = smartTruncate(normalizeWhitespace(slide.title), 150);
      if (typeof slide.paragraph === 'string') slide.paragraph = normalizeWhitespace(slide.paragraph);
      if (Array.isArray(slide.bullets)) {
        slide.bullets = slide.bullets
          .map((b: any) => (typeof b === 'string' ? normalizeWhitespace(b) : b))
          .filter((b: any) => typeof b === 'string' && b.trim().length > 0);
      }

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
        slide.paragraph = smartTruncate(slide.paragraph, 500);
      }

      // Compact mode: tighten excessively long bullets
      if (options.compactMode && Array.isArray(slide.bullets) && slide.bullets.length > compactBulletCap) {
        (slide as any).__truncatedBullets = slide.bullets.length; // debug hint for downstream / logs
        slide.bullets = slide.bullets.slice(0, compactBulletCap);
      }

      // Pass font scale hint for the generator (non-breaking; ignored if unsupported)
      (slide as any).fontScale = fontScale;

      (slide as any).__index = idx + 1; // attach index for easier debugging

      return slide as SlideSpec;
    });

    return processed;
  }

  /** Generate images in batch (non-breaking: adds `generatedImageUrl`, keeps `imagePrompt`) */
  private async processBatchImages(slides: SlideSpec[], options: ResolvedOptions): Promise<SlideSpec[]> {
    try {
      // Image service removed for lean codebase - placeholder implementation
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

      this.logger.log(`Image generation requested for ${prompts.length} slides (service disabled for lean build)`);

      // For lean build, we skip image generation but don't break the flow
      return slides;
    } catch (err) {
      this.logger.warn('Batch image processing failed; continuing without generated images:', err);
      return slides;
    }
  }

  /** Retry helper with simple exponential backoff */
  private async withRetry<T>(
    fn: () => Promise<T>,
    retries: number,
    onRetry?: (attempt: number, error: unknown) => void
  ): Promise<{ result: T; attempts: number }> {
    let attempt = 0;
    let lastErr: unknown;
    const baseDelay = 200;
    while (attempt <= retries) {
      try {
        return { result: await fn(), attempts: attempt + 1 };
      } catch (err) {
        lastErr = err;
        if (attempt === retries) break;
        onRetry?.(attempt + 1, err);
        const jitter = Math.floor(Math.random() * 100);
        const delayMs = baseDelay * Math.pow(2, attempt) + jitter;
        await this.delay(delayMs);
        attempt++;
      }
    }
    throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
  }

  private async delay(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
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

  /** Embed comprehensive metadata into PowerPoint file */
  static async embedMetadata(buffer: Buffer, meta: Record<string, any>): Promise<Buffer> {
    try {
      // For now, return the buffer as-is since PptxGenJS handles metadata during generation
      // In a full implementation, we would use a library like 'node-office' or 'officegen'
      // to modify the core.xml and app.xml files within the PPTX ZIP structure

      console.log('📋 Metadata to embed:', {
        title: meta.title || 'AI-Generated Presentation',
        author: meta.author || 'AI PowerPoint Generator',
        subject: meta.subject || 'Professional Presentation',
        keywords: meta.keywords || 'AI, PowerPoint, Professional',
        description: meta.description || 'Generated with AI PowerPoint Generator',
        slideCount: meta.slideCount || 1,
        theme: meta.theme || 'professional',
        quality: meta.quality || 'standard',
        created: new Date().toISOString()
      });

      // Return buffer with metadata logged for validation
      return buffer;
    } catch (error) {
      console.warn('⚠️ Metadata embedding failed, continuing without metadata:', error);
      return buffer;
    }
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