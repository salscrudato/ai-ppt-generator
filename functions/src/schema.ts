/**
 * Optimized Zod Schema Definitions for AI PowerPoint Generator
 *
 * Enhanced schemas with support for chained generation and image integration.
 * Ensures data integrity for multi-step AI processes and professional outputs.
 *
 * @version 3.3.0-enhanced
 * @author AI PowerPoint Generator Team (enhanced by expert co-pilot)
 */

import { z } from 'zod';

// Enhanced validation patterns with better error messages and more comprehensive checks
const VALIDATION_PATTERNS = {
  title: z.string()
    .min(1, 'Title is required and cannot be empty')
    .max(120, 'Title must be under 120 characters for optimal display')
    .refine(val => val.trim().length > 0, 'Title cannot be only whitespace'),

  shortText: z.string()
    .max(160, 'Text must be under 160 characters for readability')
    .refine(val => val.trim().length > 0 || val.length === 0, 'Text cannot be only whitespace'),

  longText: z.string()
    .max(1200, 'Text must be under 1200 characters to fit on slide')
    .refine(val => val.trim().length > 0 || val.length === 0, 'Text cannot be only whitespace'),

  colorHex: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid 6-digit hex color (e.g., #FF0000)')
    .transform(val => val.toUpperCase()),

  fontFamily: z.string()
    .min(1, 'Font family is required')
    .refine(val => /^[a-zA-Z\s\-,]+$/.test(val), 'Font family contains invalid characters'),

  imagePrompt: z.string()
    .min(20, 'Image prompt must be at least 20 characters for quality generation')
    .max(500, 'Image prompt must be under 500 characters for optimal AI processing')
    .refine(val => val.trim().length >= 20, 'Image prompt cannot be mostly whitespace'),

  percentage: z.number()
    .min(0, 'Percentage cannot be negative')
    .max(100, 'Percentage cannot exceed 100'),

  positiveNumber: z.number()
    .positive('Value must be positive'),

  url: z.string()
    .url('Must be a valid URL')
    .refine(val => val.startsWith('http'), 'URL must start with http or https')
} as const;

// Enhanced layout types with comprehensive support for different presentation needs
export const SLIDE_LAYOUTS = [
  'title', 'title-bullets', 'title-paragraph', 'two-column', 'mixed-content',
  'image-right', 'image-left', 'image-full', 'quote', 'chart', 'comparison-table',
  'timeline', 'process-flow', 'before-after', 'problem-solution', 'data-visualization',
  'testimonial', 'team-intro', 'contact-info', 'thank-you', 'agenda', 'section-divider'
] as const;

export type SlideLayout = typeof SLIDE_LAYOUTS[number];

// Content type definitions for better validation
const ContentItemSchema = z.object({
  type: z.enum(['text', 'bullet', 'number', 'icon', 'metric']),
  content: VALIDATION_PATTERNS.shortText,
  emphasis: z.enum(['normal', 'bold', 'italic', 'highlight']).optional(),
  color: VALIDATION_PATTERNS.colorHex.optional()
});

/**
 * Core slide specification schema with enhanced layout and content support
 * Defines the structure for AI-generated slide content with comprehensive validation
 */
export const SlideSpecSchema = z.object({
  /** Main slide title - clear, concise, and engaging */
  title: VALIDATION_PATTERNS.title,

  /** Layout type - comprehensive support for various presentation needs */
  layout: z.enum(SLIDE_LAYOUTS)
    .default('title-paragraph'),

  /** Bullet points for structured, scannable content with enhanced validation */
  bullets: z.array(VALIDATION_PATTERNS.shortText)
    .max(10, 'Maximum 10 bullet points allowed for readability')
    .refine(arr => arr.length === 0 || arr.every(item => item.trim().length > 0), 'Bullet points cannot be empty')
    .optional(),

  /** Paragraph content for narrative or explanatory text with enhanced validation */
  paragraph: VALIDATION_PATTERNS.longText
    .refine(val => !val || val.split('\n').length <= 10, 'Paragraph should not exceed 10 lines for readability')
    .optional(),

  /** Enhanced content items for flexible content structure */
  contentItems: z.array(ContentItemSchema)
    .max(15, 'Maximum 15 content items allowed')
    .optional(),

  /** Two-column layout support - left column content with enhanced structure */
  left: z.object({
    heading: z.string().max(80, 'Heading too long for column').optional(),
    bullets: z.array(VALIDATION_PATTERNS.shortText)
      .max(8, 'Maximum 8 bullets per column for readability')
      .optional(),
    paragraph: VALIDATION_PATTERNS.longText.optional(),
    metrics: z.array(z.object({
      label: VALIDATION_PATTERNS.shortText,
      value: z.string().max(20, 'Metric value too long'),
      unit: z.string().max(10, 'Unit too long').optional()
    })).max(5, 'Maximum 5 metrics per column').optional()
  }).optional(),

  /** Two-column layout support - right column content with enhanced image and metrics support */
  right: z.object({
    heading: z.string().max(80, 'Heading too long for column').optional(),
    bullets: z.array(VALIDATION_PATTERNS.shortText)
      .max(8, 'Maximum 8 bullets per column for readability')
      .optional(),
    paragraph: VALIDATION_PATTERNS.longText.optional(),
    imagePrompt: VALIDATION_PATTERNS.imagePrompt.optional(),
    metrics: z.array(z.object({
      label: VALIDATION_PATTERNS.shortText,
      value: z.string().max(20, 'Metric value too long'),
      unit: z.string().max(10, 'Unit too long').optional()
    })).max(5, 'Maximum 5 metrics per column').optional()
  }).optional(),

  /** Enhanced chart configuration for comprehensive data visualization */
  chart: z.object({
    type: z.enum(['bar', 'line', 'pie', 'doughnut', 'area', 'scatter', 'column'], {
      errorMap: () => ({ message: 'Chart type must be one of: bar, line, pie, doughnut, area, scatter, column' })
    }),
    title: z.string().max(100, 'Chart title too long').optional(),
    subtitle: z.string().max(80, 'Chart subtitle too long').optional(),
    categories: z.array(z.string().min(1, 'Category cannot be empty'))
      .min(1, 'At least one category required')
      .max(12, 'Maximum 12 categories for readability'),
    series: z.array(z.object({
      name: z.string().min(1, 'Series name is required').max(50, 'Series name too long'),
      data: z.array(z.number()).min(1, 'At least one data point required'),
      color: VALIDATION_PATTERNS.colorHex.optional()
    })).min(1, 'At least one data series required').max(6, 'Maximum 6 data series for clarity'),
    showLegend: z.boolean().default(true),
    showDataLabels: z.boolean().default(false)
  }).optional(),

  /** Timeline configuration for process and chronological layouts */
  timeline: z.array(z.object({
    date: z.string().default(''),
    title: z.string().default(''),
    description: VALIDATION_PATTERNS.longText.optional(),
    milestone: z.boolean().default(false)
  })).max(8, 'Maximum 8 timeline items').optional(),

  /** Comparison table for side-by-side analysis */
  comparisonTable: z.object({
    headers: z.array(z.string().min(1, 'Header cannot be empty'))
      .min(2, 'At least 2 columns required')
      .max(4, 'Maximum 4 columns for readability'),
    rows: z.array(z.array(z.string()))
      .min(1, 'At least one row required')
      .max(8, 'Maximum 8 rows for readability')
  }).optional(),

  /** Process flow steps for sequential presentations */
  processSteps: z.array(z.object({
    step: VALIDATION_PATTERNS.positiveNumber,
    title: VALIDATION_PATTERNS.shortText,
    description: VALIDATION_PATTERNS.longText.optional(),
    icon: z.string().max(50, 'Icon name too long').optional()
  })).max(6, 'Maximum 6 process steps').optional()
    .transform((steps) => {
      // Filter out invalid steps and return undefined if empty
      if (!steps || steps.length === 0) return undefined;
      const validSteps = steps.filter(step => step.step && step.title);
      return validSteps.length > 0 ? validSteps : undefined;
    }),

  /** Design and branding configuration with validation */
  design: z.object({
    theme: z.string().min(1).optional(),
    layout: z.string().optional(),
    brand: z.object({
      primary: VALIDATION_PATTERNS.colorHex.optional(),
      secondary: VALIDATION_PATTERNS.colorHex.optional(),
      accent: VALIDATION_PATTERNS.colorHex.optional(),
      fontFamily: VALIDATION_PATTERNS.fontFamily.optional()
    }).optional()
  }).optional(),

  /** Speaker notes for presentation delivery and context */
  notes: z.string().max(1000, 'Notes must be under 1000 characters').optional(),

  /** Source citations for credibility and references */
  sources: z.array(z.string().url('Must be a valid URL').or(z.string().min(1)))
    .max(5, 'Maximum 5 sources allowed')
    .optional()
});

/** TypeScript type inferred from the slide specification schema */
export type SlideSpec = z.infer<typeof SlideSpecSchema>;

/**
 * Enhanced schema for slide generation parameters
 * Comprehensive validation and sanitization for AI-powered slide generation with multi-scenario support
 */
export const GenerationParamsSchema = z.object({
  /** User's input prompt - the core content description with enhanced validation */
  prompt: z.string()
    .min(10, 'Prompt must be at least 10 characters for meaningful content generation')
    .max(2000, 'Prompt must be under 2000 characters for optimal AI processing')
    .transform(str => str.trim())
    .refine(val => val.length >= 10, 'Prompt cannot be mostly whitespace'),

  /** Target audience for content adaptation and tone with expanded options */
  audience: z.enum([
    'general', 'executives', 'technical', 'sales', 'investors', 'students',
    'healthcare', 'education', 'marketing', 'finance', 'startup', 'government'
  ], {
    errorMap: () => ({ message: 'Invalid audience type. Must be one of the supported audience categories.' })
  }).default('general'),

  /** Presentation tone and style with expanded emotional range */
  tone: z.enum([
    'professional', 'casual', 'persuasive', 'educational', 'inspiring',
    'authoritative', 'friendly', 'urgent', 'confident', 'analytical'
  ], {
    errorMap: () => ({ message: 'Invalid tone type. Must be one of the supported tone styles.' })
  }).default('professional'),

  /** Content length and detail level with more granular control */
  contentLength: z.enum(['minimal', 'brief', 'moderate', 'detailed', 'comprehensive'], {
    errorMap: () => ({ message: 'Invalid content length. Must be minimal, brief, moderate, detailed, or comprehensive.' })
  }).default('moderate'),

  /** Presentation type for better content structuring */
  presentationType: z.enum([
    'general', 'pitch', 'report', 'training', 'proposal', 'update',
    'analysis', 'comparison', 'timeline', 'process', 'strategy'
  ]).default('general'),

  /** Industry context for specialized content */
  industry: z.enum([
    'general', 'technology', 'healthcare', 'finance', 'education', 'retail',
    'manufacturing', 'consulting', 'nonprofit', 'government', 'startup'
  ]).default('general'),

  /** Enhanced design preferences and branding */
  design: z.object({
    layout: z.enum(SLIDE_LAYOUTS).optional(),
    layoutName: z.string().max(50, 'Layout name too long').optional(),
    theme: z.string().max(50, 'Theme name too long').optional(),
    brand: z.object({
      primary: VALIDATION_PATTERNS.colorHex.optional(),
      secondary: VALIDATION_PATTERNS.colorHex.optional(),
      accent: VALIDATION_PATTERNS.colorHex.optional(),
      fontFamily: VALIDATION_PATTERNS.fontFamily.optional(),
      logo: VALIDATION_PATTERNS.url.optional()
    }).optional(),
    customColors: z.array(VALIDATION_PATTERNS.colorHex)
      .max(5, 'Maximum 5 custom colors allowed')
      .optional()
  }).optional(),

  /** AI image generation preferences */
  withImage: z.boolean().default(false),
  imageStyle: z.enum(['realistic', 'illustration', 'abstract', 'professional', 'minimal'])
    .default('professional'),

  /** Content quality and validation preferences */
  qualityLevel: z.enum(['standard', 'high', 'premium']).default('standard'),
  includeNotes: z.boolean().default(false),
  includeSources: z.boolean().default(false)
});

/** TypeScript type inferred from the generation parameters schema */
export type GenerationParams = z.infer<typeof GenerationParamsSchema>;

// Enhanced validation result types for better error handling
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

/**
 * Enhanced utility function to validate and parse slide specifications with detailed error reporting
 * @param data - Raw data to validate (supports single or array for multi-slide)
 * @returns Validation result with detailed error information
 */
export function validateSlideSpec(data: unknown): SlideSpec | SlideSpec[] {
  if (Array.isArray(data)) {
    return data.map(item => SlideSpecSchema.parse(item));
  }
  return SlideSpecSchema.parse(data);
}

/**
 * Safe validation function that returns detailed error information instead of throwing
 * @param data - Raw data to validate
 * @returns ValidationResult with success status and errors
 */
export function safeValidateSlideSpec(data: unknown): ValidationResult<SlideSpec | SlideSpec[]> {
  try {
    const result = validateSlideSpec(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Unknown validation error'] };
  }
}

/**
 * Enhanced utility function to validate and parse generation parameters
 * @param data - Raw data to validate
 * @returns Validated GenerationParams object
 * @throws ZodError if validation fails with detailed error messages
 */
export function validateGenerationParams(data: unknown): GenerationParams {
  return GenerationParamsSchema.parse(data);
}

/**
 * Safe validation function for generation parameters with detailed error reporting
 * @param data - Raw data to validate
 * @returns ValidationResult with success status and errors
 */
export function safeValidateGenerationParams(data: unknown): ValidationResult<GenerationParams> {
  try {
    const result = validateGenerationParams(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Unknown validation error'] };
  }
}

/**
 * Comprehensive content quality validation utility
 * @param spec - Slide specification to validate
 * @returns Detailed quality assessment with suggestions and improvements
 */
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
    suggestions.push('Consider a more descriptive title (at least 10 characters)');
    score -= 10;
  }
  if (spec.title.length > 80) {
    warnings.push('Title may be too long for optimal display');
    score -= 5;
  }
  if (!/^[A-Z]/.test(spec.title)) {
    improvements.push('Title should start with a capital letter');
    score -= 2;
  }

  // Content balance and structure checks
  const hasContent = spec.paragraph || spec.bullets?.length || spec.contentItems?.length;
  if (!hasContent) {
    warnings.push('Slide appears to have minimal content');
    score -= 20;
  }

  // Bullet point optimization
  if (spec.bullets) {
    if (spec.bullets.length > 7) {
      suggestions.push('Consider reducing bullet points to 7 or fewer for better readability');
      score -= 5;
    }
    if (spec.bullets.length > 10) {
      warnings.push('Too many bullet points may overwhelm the audience');
      score -= 10;
    }

    // Check bullet point consistency
    const bulletLengths = spec.bullets.map(b => b.length);
    const avgLength = bulletLengths.reduce((a, b) => a + b, 0) / bulletLengths.length;
    const hasInconsistentLength = bulletLengths.some(len => Math.abs(len - avgLength) > avgLength * 0.5);
    if (hasInconsistentLength) {
      improvements.push('Consider making bullet points more consistent in length');
      score -= 3;
    }
  }

  // Paragraph content checks
  if (spec.paragraph) {
    const wordCount = spec.paragraph.split(/\s+/).length;
    if (wordCount > 150) {
      suggestions.push('Consider breaking long paragraphs into bullet points for better readability');
      score -= 8;
    }
    if (wordCount < 10) {
      improvements.push('Paragraph content seems very brief - consider adding more detail');
      score -= 5;
    }
  }

  // Layout-specific validations
  if (spec.layout === 'two-column' && (!spec.left || !spec.right)) {
    warnings.push('Two-column layout requires both left and right content');
    score -= 15;
  }
  if (spec.layout === 'chart' && !spec.chart) {
    warnings.push('Chart layout requires chart data');
    score -= 20;
  }
  if (spec.layout === 'timeline' && !spec.timeline) {
    warnings.push('Timeline layout requires timeline data');
    score -= 20;
  }

  // Accessibility checks
  if (spec.design?.brand?.primary && spec.design?.brand?.secondary) {
    // Check color contrast (simplified check)
    const primary = spec.design.brand.primary;
    const secondary = spec.design.brand.secondary;
    if (primary === secondary) {
      accessibilityIssues.push('Primary and secondary colors should be different for better contrast');
      accessibilityScore -= 15;
    }
  }

  // Check for alt text on images
  if (spec.right?.imagePrompt && !spec.notes) {
    accessibilityIssues.push('Consider adding speaker notes to describe images for accessibility');
    accessibilityScore -= 10;
  }

  // Readability assessment
  const allText = [
    spec.title,
    spec.paragraph || '',
    ...(spec.bullets || []),
    spec.notes || ''
  ].join(' ');

  const sentences = allText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = allText.split(/\s+/).filter(w => w.length > 0);
  const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);

  if (avgWordsPerSentence > 20) {
    readabilityIssues.push('Sentences are quite long - consider breaking them down');
    readabilityScore -= 15;
  }
  if (avgWordsPerSentence < 5) {
    readabilityIssues.push('Sentences are very short - consider combining some for better flow');
    readabilityScore -= 5;
  }

  // Complex word detection (simplified)
  const complexWords = words.filter(word => word.length > 12);
  const complexWordRatio = complexWords.length / words.length;
  if (complexWordRatio > 0.15) {
    readabilityIssues.push('Consider using simpler language for better comprehension');
    readabilityScore -= 10;
  }

  // Determine readability level
  let readabilityLevel = 'Graduate';
  if (avgWordsPerSentence < 15 && complexWordRatio < 0.1) {
    readabilityLevel = 'High School';
  } else if (avgWordsPerSentence < 18 && complexWordRatio < 0.12) {
    readabilityLevel = 'College';
  }

  // Calculate final grade
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
      issues: accessibilityIssues
    },
    readability: {
      score: Math.max(0, readabilityScore),
      level: readabilityLevel,
      issues: readabilityIssues
    }
  };
}

/**
 * Generate content improvement suggestions based on quality assessment
 */
export function generateContentImprovements(spec: SlideSpec, qualityAssessment: ReturnType<typeof validateContentQuality>): {
  priorityImprovements: string[];
  quickFixes: string[];
  enhancementSuggestions: string[];
} {
  const priorityImprovements: string[] = [];
  const quickFixes: string[] = [];
  const enhancementSuggestions: string[] = [];

  // Priority improvements (critical issues)
  if (qualityAssessment.score < 60) {
    priorityImprovements.push('Content needs significant improvement to meet professional standards');
  }
  if (qualityAssessment.warnings.length > 0) {
    priorityImprovements.push(...qualityAssessment.warnings);
  }

  // Quick fixes (easy to implement)
  if (spec.title.length < 10) {
    quickFixes.push('Expand the title to be more descriptive and engaging');
  }
  if (spec.bullets && spec.bullets.length > 7) {
    quickFixes.push('Reduce bullet points to 5-7 for optimal readability');
  }
  if (!spec.notes) {
    quickFixes.push('Add speaker notes to provide context and accessibility');
  }

  // Enhancement suggestions (nice to have)
  if (qualityAssessment.accessibility.score < 90) {
    enhancementSuggestions.push('Improve accessibility by ensuring good color contrast and descriptive text');
  }
  if (qualityAssessment.readability.score < 85) {
    enhancementSuggestions.push('Simplify language and sentence structure for better comprehension');
  }
  if (!spec.sources || spec.sources.length === 0) {
    enhancementSuggestions.push('Add credible sources to support your content');
  }

  return {
    priorityImprovements,
    quickFixes,
    enhancementSuggestions
  };
}