/**
 * Optimized Zod Schema Definitions for AI PowerPoint Generator
 *
 * Enhanced schemas with support for chained generation, image integration, and advanced layouts.
 * Ensures data integrity for multi-step AI processes and professional outputs, with improved validation for accessibility, readability, and content quality.
 *
 * @version 3.6.0-enhanced
 * @author
 *   AI PowerPoint Generator Team (revised by expert co‑pilot)
 */

import { z, ZodError } from 'zod';

/* -------------------------------------------------------------------------------------------------
 * Common Validators & Utilities
 * ------------------------------------------------------------------------------------------------- */

// NOTE: Keep these validators focused and composable. We prefer explicit, readable rules over
// overly clever abstractions so downstream teams can maintain and extend them easily.
const VALIDATION_PATTERNS = {
  title: z
    .string()
    .min(1, 'Title is required and cannot be empty')
    .max(120, 'Title must be under 120 characters for optimal display')
    .refine((val) => val.trim().length > 0, 'Title cannot be only whitespace'),

  shortText: z
    .string()
    .max(160, 'Text must be under 160 characters for readability')
    .refine((val) => val.trim().length > 0 || val.length === 0, 'Text cannot be only whitespace'),

  longText: z
    .string()
    .max(1200, 'Text must be under 1200 characters to fit on slide')
    .refine((val) => val.trim().length > 0 || val.length === 0, 'Text cannot be only whitespace'),

  colorHex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid 6-digit hex color (e.g., #FF0000)')
    .transform((val) => val.toUpperCase()),

  // Allow common font-family characters including spaces, digits, hyphens, commas, and quotes.
  fontFamily: z
    .string()
    .min(1, 'Font family is required')
    .refine(
      (val) => /^[\w\s\-,'"]+$/.test(val),
      'Font family contains invalid characters'
    ),

  imagePrompt: z
    .string()
    .min(20, 'Image prompt must be at least 20 characters for quality generation')
    .max(500, 'Image prompt must be under 500 characters for optimal AI processing')
    .refine((val) => val.trim().length >= 20, 'Image prompt cannot be mostly whitespace'),

  percentage: z.coerce.number().min(0, 'Percentage cannot be negative').max(100, 'Percentage cannot exceed 100'),

  positiveNumber: z.coerce.number().positive('Value must be positive'),

  url: z
    .string()
    .url('Must be a valid URL')
    .refine((val) => val.startsWith('http'), 'URL must start with http or https'),
} as const;

/* -------------------------------------------------------------------------------------------------
 * Layouts
 * ------------------------------------------------------------------------------------------------- */

export const SLIDE_LAYOUTS = [
  'title',
  'title-bullets',
  'title-paragraph',
  'two-column',
  'mixed-content',
  'image-right',
  'image-left',
  'image-full',
  'quote',
  'chart',
  'comparison-table',
  'timeline',
  'process-flow',
  'before-after',
  'problem-solution',
  'data-visualization',
  'testimonial',
  'team-intro',
  'contact-info',
  'thank-you',
  'agenda',
  'section-divider',
  // Modern layout types
  'hero',
  'metrics-dashboard',
  'feature-showcase',
  'testimonial-card',
  'modern-bullets',
  'gradient-hero',
  'card-grid',
  'split-content',
  'accent-quote',
] as const;

export type SlideLayout = (typeof SLIDE_LAYOUTS)[number];

/* -------------------------------------------------------------------------------------------------
 * Reusable Content Schemas
 * ------------------------------------------------------------------------------------------------- */

const ContentItemSchema = z.object({
  type: z.enum(['text', 'bullet', 'number', 'icon', 'metric']),
  content: VALIDATION_PATTERNS.shortText,
  emphasis: z.enum(['normal', 'bold', 'italic', 'highlight']).optional(),
  color: VALIDATION_PATTERNS.colorHex.optional(),
  iconName: z.string().max(50, 'Icon name too long').optional(), // Support for icon names
});

/* -------------------------------------------------------------------------------------------------
 * Slide Spec (Primary Schema used by the current generator)
 * ------------------------------------------------------------------------------------------------- */

export const SlideSpecSchema = z
  .object({
    /** Main slide title - clear, concise, and engaging */
    title: VALIDATION_PATTERNS.title,

    /** Layout type */
    layout: z.enum(SLIDE_LAYOUTS).default('title-paragraph'),

    /** Bullet points */
    bullets: z
      .array(VALIDATION_PATTERNS.shortText)
      .max(10, 'Maximum 10 bullet points allowed for readability')
      .refine((arr) => arr.length === 0 || arr.every((item) => item.trim().length > 0), 'Bullet points cannot be empty')
      .optional(),

    /** Paragraph content */
    paragraph: VALIDATION_PATTERNS.longText
      .refine((val) => !val || val.split('\n').length <= 10, 'Paragraph should not exceed 10 lines for readability')
      .optional(),

    /** Flexible content items */
    contentItems: z.array(ContentItemSchema).max(15, 'Maximum 15 content items allowed').optional(),

    /** Two-column layout support - left column */
    left: z
      .object({
        heading: z.string().max(80, 'Heading too long for column').optional(),
        bullets: z.array(VALIDATION_PATTERNS.shortText).max(8, 'Maximum 8 bullets per column for readability').optional(),
        paragraph: VALIDATION_PATTERNS.longText.optional(),
        metrics: z
          .array(
            z.object({
              label: VALIDATION_PATTERNS.shortText,
              value: z.string().max(20, 'Metric value too long'),
              unit: z.string().max(10, 'Unit too long').optional(),
            })
          )
          .max(5, 'Maximum 5 metrics per column')
          .optional(),
        imagePrompt: VALIDATION_PATTERNS.imagePrompt.optional(),
        generateImage: z.boolean().optional(),
      })
      .optional(),

    /** Two-column layout support - right column */
    right: z
      .object({
        heading: z.string().max(80, 'Heading too long for column').optional(),
        bullets: z.array(VALIDATION_PATTERNS.shortText).max(8, 'Maximum 8 bullets per column for readability').optional(),
        paragraph: VALIDATION_PATTERNS.longText.optional(),
        imagePrompt: VALIDATION_PATTERNS.imagePrompt.optional(),
        generateImage: z.boolean().optional(),
        metrics: z
          .array(
            z.object({
              label: VALIDATION_PATTERNS.shortText,
              value: z.string().max(20, 'Metric value too long'),
              unit: z.string().max(10, 'Unit too long').optional(),
            })
          )
          .max(5, 'Maximum 5 metrics per column')
          .optional(),
      })
      .optional(),

    /** Chart configuration */
    chart: z
      .object({
        type: z.enum(['bar', 'line', 'pie', 'doughnut', 'area', 'scatter', 'column'], {
          errorMap: () => ({
            message: 'Chart type must be one of: bar, line, pie, doughnut, area, scatter, column',
          }),
        }),
        title: z.string().max(100, 'Chart title too long').optional(),
        subtitle: z.string().max(80, 'Chart subtitle too long').optional(),
        categories: z
          .array(z.string().min(1, 'Category cannot be empty'))
          .min(1, 'At least one category required')
          .max(12, 'Maximum 12 categories for readability'),
        series: z
          .array(
            z.object({
              name: z.string().min(1, 'Series name is required').max(50, 'Series name too long'),
              data: z.array(z.coerce.number()).min(1, 'At least one data point required'),
              color: VALIDATION_PATTERNS.colorHex.optional(),
            })
          )
          .min(1, 'At least one data series required')
          .max(6, 'Maximum 6 data series for clarity'),
        showLegend: z.boolean().default(true),
        showDataLabels: z.boolean().default(false),
      })
      .optional(),

    /** Timeline configuration */
    timeline: z
      .array(
        z.object({
          date: z.string().default(''),
          title: z.string().default(''),
          description: VALIDATION_PATTERNS.longText.optional(),
          milestone: z.boolean().default(false),
        })
      )
      .max(8, 'Maximum 8 timeline items')
      .optional(),

    /** Comparison table */
    comparisonTable: z
      .object({
        headers: z
          .array(z.string().min(1, 'Header cannot be empty'))
          .min(2, 'At least 2 columns required')
          .max(4, 'Maximum 4 columns for readability'),
        rows: z
          .array(z.array(z.string()))
          .min(1, 'At least one row required')
          .max(8, 'Maximum 8 rows for readability'),
      })
      .optional(),

    /** Process flow steps */
    processSteps: z
      .array(
        z.object({
          step: VALIDATION_PATTERNS.positiveNumber,
          title: VALIDATION_PATTERNS.shortText,
          description: VALIDATION_PATTERNS.longText.optional(),
          icon: z.string().max(50, 'Icon name too long').optional(),
        })
      )
      .max(6, 'Maximum 6 process steps')
      .optional()
      .transform((steps) => {
        if (!steps || steps.length === 0) return undefined;
        const validSteps = steps.filter((step) => step.step && step.title);
        return validSteps.length > 0 ? validSteps : undefined;
      }),

    /** Design and branding configuration */
    design: z
      .object({
        theme: z.string().min(1).optional(),
        layout: z.string().optional(),
        brand: z
          .object({
            primary: VALIDATION_PATTERNS.colorHex.optional(),
            secondary: VALIDATION_PATTERNS.colorHex.optional(),
            accent: VALIDATION_PATTERNS.colorHex.optional(),
            fontFamily: VALIDATION_PATTERNS.fontFamily.optional(),
            logo: VALIDATION_PATTERNS.url.optional(),
          })
          .optional(),

        /** Modern theme features */
        modern: z.boolean().optional(),
        style: z.enum(['professional', 'creative', 'minimal', 'bold', 'modern']).optional(),
        backgroundStyle: z.enum(['gradient', 'minimal', 'accent']).optional(),
        contentLayout: z.enum(['bullets', 'cards', 'timeline']).optional(),

        /** Author and presentation metadata */
        author: z.string().optional(),
        date: z.string().optional(),

        /** Enhanced design properties */
        textColor: VALIDATION_PATTERNS.colorHex.optional(),
        backgroundColor: VALIDATION_PATTERNS.colorHex.optional(),
        fontSize: z.coerce.number().min(8).max(72).optional(),
        highContrast: z.boolean().optional(),
        colorAdjustments: z.record(z.string()).optional(),
      })
      .optional(),

    /** Speaker notes */
    notes: z.string().max(1000, 'Notes must be under 1000 characters').optional(),

    /** Source citations */
    sources: z.array(z.string().url('Must be a valid URL').or(z.string().min(1))).max(5, 'Maximum 5 sources allowed').optional(),

    /** Image prompt for full-image layouts */
    imagePrompt: VALIDATION_PATTERNS.imagePrompt.optional(),

    /** Whether to generate the image */
    generateImage: z.boolean().optional(),

    /** Premium/advanced properties */
    imageUrl: z.string().url().optional(),
    altText: z.string().optional(),
    accessibilityRole: z.string().optional(),
    headingLevel: z.coerce.number().min(1).max(6).optional(),
    imageOptimized: z.boolean().optional(),
    structureOptimized: z.boolean().optional(),
    brandCompliant: z.boolean().optional(),
    table: z.any().optional(), // Kept intentionally permissive for backwards compatibility
    timelineData: z.any().optional(),
  })
  .superRefine((spec, ctx) => {
    // two-column layout must include both sides
    if (spec.layout === 'two-column') {
      if (!spec.left) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['left'],
          message: 'Two-column layout requires left column content.',
        });
      }
      if (!spec.right) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['right'],
          message: 'Two-column layout requires right column content.',
        });
      }
    }

    // chart layout must include chart data
    if (spec.layout === 'chart' && !spec.chart) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['chart'],
        message: 'Chart layout requires chart configuration.',
      });
    }

    // timeline layout must include >= 2 items
    if (spec.layout === 'timeline') {
      if (!spec.timeline || spec.timeline.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['timeline'],
          message: 'Timeline layout requires at least 2 timeline items.',
        });
      }
    }

    // image-full layout requires an image source (url or prompt in any slot)
    if (spec.layout === 'image-full') {
      const hasAnyImage =
        !!spec.imageUrl ||
        !!spec.imagePrompt ||
        !!spec.left?.imagePrompt ||
        !!spec.right?.imagePrompt;
      if (!hasAnyImage) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['imageUrl'],
          message: 'image-full layout requires an imageUrl or an imagePrompt.',
        });
      }
      // Encourage alt text for accessibility when an image exists
      if ((spec.imageUrl || spec.imagePrompt || spec.left?.imagePrompt || spec.right?.imagePrompt) && !spec.altText) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['altText'],
          message: 'Provide altText to describe the image for accessibility.',
        });
      }
    }

    // chart: categories length should match each series data length
    if (spec.chart) {
      const { categories, series } = spec.chart;
      series.forEach((s, idx) => {
        if (s.data.length !== categories.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['chart', 'series', idx, 'data'],
            message: `Data length (${s.data.length}) must match categories length (${categories.length}).`,
          });
        }
      });
    }

    // comparison table: enforce row width consistency with headers
    if (spec.comparisonTable) {
      const { headers, rows } = spec.comparisonTable;
      rows.forEach((row, rIdx) => {
        if (row.length !== headers.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['comparisonTable', 'rows', rIdx],
            message: `Row ${rIdx + 1} must have exactly ${headers.length} cells to match headers.`,
          });
        }
      });
    }
  });

/** TypeScript type inferred from the slide specification schema */
export type SlideSpec = z.infer<typeof SlideSpecSchema>;

/* -------------------------------------------------------------------------------------------------
 * Generation Params (controls for the generator)
 * ------------------------------------------------------------------------------------------------- */

export const GenerationParamsSchema = z.object({
  /** User's input prompt - core content description */
  prompt: z
    .string()
    .min(10, 'Prompt must be at least 10 characters for meaningful content generation')
    .max(2000, 'Prompt must be under 2000 characters for optimal AI processing')
    .transform((str) => str.trim())
    .refine((val) => val.length >= 10, 'Prompt cannot be mostly whitespace'),

  /** Target audience */
  audience: z
    .enum(
      [
        'general',
        'executives',
        'technical',
        'sales',
        'investors',
        'students',
        'healthcare',
        'education',
        'marketing',
        'finance',
        'startup',
        'government',
        'business',
      ],
      { errorMap: () => ({ message: 'Invalid audience type. Must be one of the supported audience categories.' }) }
    )
    .default('general'),

  /** Presentation tone */
  tone: z
    .enum(
      ['professional', 'casual', 'persuasive', 'educational', 'inspiring', 'authoritative', 'friendly', 'urgent', 'confident', 'analytical'],
      { errorMap: () => ({ message: 'Invalid tone type. Must be one of the supported tone styles.' }) }
    )
    .default('professional'),

  /** Content length */
  contentLength: z
    .enum(['minimal', 'brief', 'moderate', 'detailed', 'comprehensive'], {
      errorMap: () => ({ message: 'Invalid content length. Must be minimal, brief, moderate, detailed, or comprehensive.' }),
    })
    .default('moderate'),

  /** Presentation type */
  presentationType: z.enum(['general', 'pitch', 'report', 'training', 'proposal', 'update', 'analysis', 'comparison', 'timeline', 'process', 'strategy']).default('general'),

  /** Industry context */
  industry: z
    .enum(['general', 'technology', 'healthcare', 'finance', 'education', 'retail', 'manufacturing', 'consulting', 'nonprofit', 'government', 'startup', 'hospitality'])
    .default('general'),

  /** Design preferences and branding */
  design: z
    .object({
      layout: z.enum(SLIDE_LAYOUTS).optional(),
      layoutName: z.string().max(50, 'Layout name too long').optional(),
      theme: z.string().max(50, 'Theme name too long').optional(),
      brand: z
        .object({
          primary: VALIDATION_PATTERNS.colorHex.optional(),
          secondary: VALIDATION_PATTERNS.colorHex.optional(),
          accent: VALIDATION_PATTERNS.colorHex.optional(),
          fontFamily: VALIDATION_PATTERNS.fontFamily.optional(),
          logo: VALIDATION_PATTERNS.url.optional(),
        })
        .optional(),
      customColors: z.array(VALIDATION_PATTERNS.colorHex).max(5, 'Maximum 5 custom colors allowed').optional(),
    })
    .optional(),

  /** AI image generation preferences */
  withImage: z.boolean().default(false),
  imageStyle: z.enum(['realistic', 'illustration', 'abstract', 'professional', 'minimal']).default('professional'),

  /** Content quality and validation preferences */
  qualityLevel: z.enum(['standard', 'high', 'premium']).default('standard'),
  includeNotes: z.boolean().default(false),
  includeSources: z.boolean().default(false),
});

export type GenerationParams = z.infer<typeof GenerationParamsSchema>;

/* -------------------------------------------------------------------------------------------------
 * Validation Results (helpers)
 * ------------------------------------------------------------------------------------------------- */

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

/**
 * Validate and parse slide specifications (single or multi-slide).
 */
export function validateSlideSpec(data: unknown): SlideSpec | SlideSpec[] {
  if (Array.isArray(data)) {
    return data.map((item) => SlideSpecSchema.parse(item));
  }
  return SlideSpecSchema.parse(data);
}

/**
 * Safe validator for SlideSpec that returns errors instead of throwing.
 */
export function safeValidateSlideSpec(data: unknown): ValidationResult<SlideSpec | SlideSpec[]> {
  try {
    const result = validateSlideSpec(data);
    return { success: true, data: result };
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      const errors = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Unknown validation error'] };
  }
}

/**
 * Validate and parse generation parameters.
 */
export function validateGenerationParams(data: unknown): GenerationParams {
  return GenerationParamsSchema.parse(data);
}

/**
 * Safe validator for GenerationParams that returns errors instead of throwing.
 */
export function safeValidateGenerationParams(data: unknown): ValidationResult<GenerationParams> {
  try {
    const result = validateGenerationParams(data);
    return { success: true, data: result };
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      const errors = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Unknown validation error'] };
  }
}

/* -------------------------------------------------------------------------------------------------
 * Content Quality Heuristics
 * ------------------------------------------------------------------------------------------------- */

export function validateContentQuality(spec: SlideSpec): {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  suggestions: string[];
  warnings: string[];
  improvements: string[];
  accessibility: {
    score: number;
    issues: string[];
  };
  readability: {
    score: number;
    level: string;
    issues: string[];
  };
} {
  const suggestions: string[] = [];
  const warnings: string[] = [];
  const improvements: string[] = [];
  const accessibilityIssues: string[] = [];
  const readabilityIssues: string[] = [];
  let score = 100;
  let accessibilityScore = 100;
  let readabilityScore = 100;

  // Title quality checks
  if (spec.title.length < 10) {
    suggestions.push('Consider a more descriptive title (at least 10 characters).');
    score -= 10;
  }
  if (spec.title.length > 80) {
    warnings.push('Title may be too long for optimal display.');
    score -= 5;
  }
  if (!/^[A-Z]/.test(spec.title)) {
    improvements.push('Title should start with a capital letter.');
    score -= 2;
  }

  // Content balance and structure checks
  const hasContent = spec.paragraph || spec.bullets?.length || spec.contentItems?.length;
  if (!hasContent) {
    warnings.push('Slide appears to have minimal content.');
    score -= 20;
  }

  // Bullet point optimization
  if (spec.bullets) {
    if (spec.bullets.length > 7) {
      suggestions.push('Consider reducing bullet points to 7 or fewer for better readability.');
      score -= 5;
    }
    if (spec.bullets.length > 10) {
      warnings.push('Too many bullet points may overwhelm the audience.');
      score -= 10;
    }
    const bulletLengths = spec.bullets.map((b) => b.length);
    const avgLength = bulletLengths.reduce((a, b) => a + b, 0) / bulletLengths.length || 0;
    const hasInconsistentLength = bulletLengths.some((len) => Math.abs(len - avgLength) > avgLength * 0.5);
    if (hasInconsistentLength) {
      improvements.push('Consider making bullet points more consistent in length.');
      score -= 3;
    }
  }

  // Paragraph content checks
  if (spec.paragraph) {
    const wordCount = spec.paragraph.split(/\s+/).filter(Boolean).length;
    if (wordCount > 150) {
      suggestions.push('Consider breaking long paragraphs into bullet points for better readability.');
      score -= 8;
    }
    if (wordCount < 10) {
      improvements.push('Paragraph content seems very brief - consider adding more detail.');
      score -= 5;
    }
  }

  // Layout-specific validations (heuristics)
  if (spec.layout === 'two-column' && (!spec.left || !spec.right)) {
    warnings.push('Two-column layout requires both left and right content.');
    score -= 15;
  }
  if (spec.layout === 'chart' && !spec.chart) {
    warnings.push('Chart layout requires chart data.');
    score -= 20;
  }
  if (spec.layout === 'timeline' && !spec.timeline) {
    warnings.push('Timeline layout requires timeline data.');
    score -= 20;
  }

  // Accessibility checks
  if (spec.design?.brand?.primary && spec.design?.brand?.secondary) {
    const primary = spec.design.brand.primary;
    const secondary = spec.design.brand.secondary;
    if (primary === secondary) {
      accessibilityIssues.push('Primary and secondary colors should be different for better contrast.');
      accessibilityScore -= 15;
    }
  }

  // Image: ensure descriptive text
  const anyImage = spec.imageUrl || spec.imagePrompt || spec.left?.imagePrompt || spec.right?.imagePrompt;
  if (anyImage && !spec.altText) {
    accessibilityIssues.push('Add altText to describe images for screen readers.');
    accessibilityScore -= 10;
  }

  // Readability assessment (lightweight heuristic)
  const allText = [spec.title, spec.paragraph || '', ...(spec.bullets || []), spec.notes || ''].join(' ');
  const sentences = allText.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = allText.split(/\s+/).filter((w) => w.length > 0);
  const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);

  if (avgWordsPerSentence > 20) {
    readabilityIssues.push('Sentences are quite long - consider breaking them down.');
    readabilityScore -= 15;
  }
  if (avgWordsPerSentence < 5) {
    readabilityIssues.push('Sentences are very short - consider combining some for better flow.');
    readabilityScore -= 5;
  }

  const complexWords = words.filter((word) => word.length > 12);
  const complexWordRatio = words.length ? complexWords.length / words.length : 0;
  if (complexWordRatio > 0.15) {
    readabilityIssues.push('Consider using simpler language for better comprehension.');
    readabilityScore -= 10;
  }

  let readabilityLevel = 'Graduate';
  if (avgWordsPerSentence < 15 && complexWordRatio < 0.1) {
    readabilityLevel = 'High School';
  } else if (avgWordsPerSentence < 18 && complexWordRatio < 0.12) {
    readabilityLevel = 'College';
  }

  // Final grade
  const finalScore = Math.max(0, score);
  let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
  if (finalScore >= 90) grade = 'A';
  else if (finalScore >= 80) grade = 'B';
  else if (finalScore >= 70) grade = 'C';
  else if (finalScore >= 60) grade = 'D';

  return {
    score: finalScore,
    grade,
    suggestions,
    warnings,
    improvements,
    accessibility: {
      score: Math.max(0, accessibilityScore),
      issues: accessibilityIssues,
    },
    readability: {
      score: Math.max(0, readabilityScore),
      level: readabilityLevel,
      issues: readabilityIssues,
    },
  };
}

/* -------------------------------------------------------------------------------------------------
 * Improvement Suggestions from Quality Assessment
 * ------------------------------------------------------------------------------------------------- */

export function generateContentImprovements(
  spec: SlideSpec,
  qualityAssessment: ReturnType<typeof validateContentQuality>
): {
  priorityImprovements: string[];
  quickFixes: string[];
  enhancementSuggestions: string[];
} {
  const priorityImprovements: string[] = [];
  const quickFixes: string[] = [];
  const enhancementSuggestions: string[] = [];

  // Priority improvements (critical issues)
  if (qualityAssessment.score < 60) {
    priorityImprovements.push('Content needs significant improvement to meet professional standards.');
  }
  if (qualityAssessment.warnings.length > 0) {
    priorityImprovements.push(...qualityAssessment.warnings);
  }

  // Quick fixes (easy to implement)
  if (spec.title.length < 10) {
    quickFixes.push('Expand the title to be more descriptive and engaging.');
  }
  if (spec.bullets && spec.bullets.length > 7) {
    quickFixes.push('Reduce bullet points to 5–7 for optimal readability.');
  }
  if (!spec.notes) {
    quickFixes.push('Add speaker notes to provide context and accessibility.');
  }
  if ((spec.imageUrl || spec.imagePrompt || spec.left?.imagePrompt || spec.right?.imagePrompt) && !spec.altText) {
    quickFixes.push('Add altText for any images to improve accessibility.');
  }

  // Enhancement suggestions (nice to have)
  if (qualityAssessment.accessibility.score < 90) {
    enhancementSuggestions.push('Improve accessibility by ensuring strong color contrast and descriptive alt text.');
  }
  if (qualityAssessment.readability.score < 85) {
    enhancementSuggestions.push('Simplify language and sentence structure for better comprehension.');
  }
  if (!spec.sources || spec.sources.length === 0) {
    enhancementSuggestions.push('Add credible sources to support your content.');
  }

  return {
    priorityImprovements,
    quickFixes,
    enhancementSuggestions,
  };
}

/* -------------------------------------------------------------------------------------------------
 * New Layout Engine — Slide Type Schemas
 * ------------------------------------------------------------------------------------------------- */

export const SlideTypeSchema = z.enum(['title', 'bullets', 'twoColumn', 'metrics', 'section', 'quote', 'image', 'timeline', 'table', 'comparison']);
export type SlideType = z.infer<typeof SlideTypeSchema>;

// Column content schemas for two-column layouts
export const ColumnContentSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('text'),
    content: VALIDATION_PATTERNS.longText,
    bullets: z.array(VALIDATION_PATTERNS.shortText).max(6).optional(),
  }),
  z.object({
    type: z.literal('image'),
    src: z.string().url(),
    alt: VALIDATION_PATTERNS.shortText,
    caption: VALIDATION_PATTERNS.shortText.optional(),
  }),
  z.object({
    type: z.literal('mixed'),
    text: VALIDATION_PATTERNS.longText,
    image: z
      .object({
        src: z.string().url(),
        alt: VALIDATION_PATTERNS.shortText,
      })
      .optional(),
    bullets: z.array(VALIDATION_PATTERNS.shortText).max(4).optional(),
  }),
]);
export type ColumnContent = z.infer<typeof ColumnContentSchema>;

// Metric data schema
export const MetricDataSchema = z.object({
  value: z.union([z.string(), z.coerce.number()]),
  label: VALIDATION_PATTERNS.shortText,
  description: VALIDATION_PATTERNS.shortText.optional(),
  trend: z
    .object({
      direction: z.enum(['up', 'down', 'flat']),
      percentage: z.coerce.number().optional(),
      period: z.string().optional(),
    })
    .optional(),
  target: z.union([z.string(), z.coerce.number()]).optional(),
  color: z.enum(['primary', 'success', 'warning', 'error', 'info']).optional(),
});
export type MetricData = z.infer<typeof MetricDataSchema>;

// Individual slide configuration schemas
export const TitleSlideConfigSchema = z.object({
  type: z.literal('title'),
  title: VALIDATION_PATTERNS.title,
  subtitle: VALIDATION_PATTERNS.shortText.optional(),
  author: z.string().max(100).optional(),
  date: z.string().max(50).optional(),
  organization: z.string().max(100).optional(),
  backgroundImage: z.string().url().optional(),
  backgroundColor: VALIDATION_PATTERNS.colorHex.optional(),
});
export type TitleSlideConfig = z.infer<typeof TitleSlideConfigSchema>;

export const BulletSlideConfigSchema = z.object({
  type: z.literal('bullets'),
  title: VALIDATION_PATTERNS.title,
  subtitle: VALIDATION_PATTERNS.shortText.optional(),
  bullets: z.array(VALIDATION_PATTERNS.shortText).min(3, 'At least 3 bullet points required for effective content').max(6, 'Maximum 6 bullet points for optimal readability'),
  bulletStyle: z.enum(['disc', 'circle', 'square', 'dash', 'arrow', 'number']).optional(),
  maxBullets: z.number().min(3).max(8).optional(),
  maxWordsPerBullet: z.number().min(8).max(20).optional(),
});
export type BulletSlideConfig = z.infer<typeof BulletSlideConfigSchema>;

export const TwoColumnSlideConfigSchema = z.object({
  type: z.literal('twoColumn'),
  title: VALIDATION_PATTERNS.title,
  subtitle: VALIDATION_PATTERNS.shortText.optional(),
  leftColumn: ColumnContentSchema,
  rightColumn: ColumnContentSchema,
  columnRatio: z.tuple([z.coerce.number().positive(), z.coerce.number().positive()]).optional(),
  verticalAlign: z.enum(['top', 'middle', 'bottom']).optional(),
});
export type TwoColumnSlideConfig = z.infer<typeof TwoColumnSlideConfigSchema>;

export const MetricsSlideConfigSchema = z.object({
  type: z.literal('metrics'),
  title: VALIDATION_PATTERNS.title,
  subtitle: VALIDATION_PATTERNS.shortText.optional(),
  metrics: z.array(MetricDataSchema).min(1, 'At least 1 metric required').max(12, 'Maximum 12 metrics for readability'),
  layout: z.enum(['grid', 'row', 'column', 'featured']).optional(),
  maxPerRow: z.number().min(1).max(6).optional(),
  showTrends: z.boolean().optional(),
  showTargets: z.boolean().optional(),
});
export type MetricsSlideConfig = z.infer<typeof MetricsSlideConfigSchema>;

// Union of all slide configurations (new layout engine)
export const SlideConfigSchema = z.discriminatedUnion('type', [TitleSlideConfigSchema, BulletSlideConfigSchema, TwoColumnSlideConfigSchema, MetricsSlideConfigSchema]);
export type SlideConfig = z.infer<typeof SlideConfigSchema>;

/* -------------------------------------------------------------------------------------------------
 * Enhanced Presentation Schema (new layout engine container)
 * ------------------------------------------------------------------------------------------------- */

export const EnhancedPresentationSchema = z.object({
  slides: z.array(SlideConfigSchema).min(1, 'At least one slide required'),
  theme: z.enum(['neutral', 'executive', 'colorPop']).default('neutral'),
  metadata: z.object({
    title: VALIDATION_PATTERNS.title,
    description: VALIDATION_PATTERNS.longText.optional(),
    audience: z.enum(['general', 'executives', 'technical', 'sales']).default('general'),
    duration: z.number().positive().optional(),
    tags: z.array(z.string()).optional(),
    version: z.string().optional(),
  }),
  options: z
    .object({
      async: z.boolean().default(false),
      includeNotes: z.boolean().default(true),
      generateImages: z.boolean().default(false),
      optimizeForPrint: z.boolean().default(false),
      accessibilityMode: z.boolean().default(true),
    })
    .optional(),
});
export type EnhancedPresentation = z.infer<typeof EnhancedPresentationSchema>;

/* -------------------------------------------------------------------------------------------------
 * Generation Response Schema
 * ------------------------------------------------------------------------------------------------- */

export const SlideGenerationResponseSchema = z.object({
  fileUrl: z.string().url(),
  deckSummary: z.object({
    slides: z.number().positive(),
    theme: z.string(),
    warnings: z.array(z.string()).default([]),
    errors: z.array(z.string()).optional(),
  }),
  cost: z
    .object({
      llmTokens: z.number().nonnegative(),
      usd: z.number().nonnegative(),
    })
    .optional(),
  metadata: z
    .object({
      generationTime: z.number().positive(),
      qualityScore: z.number().min(0).max(100),
      accessibilityScore: z.number().min(0).max(100),
    })
    .optional(),
});
export type SlideGenerationResponse = z.infer<typeof SlideGenerationResponseSchema>;