/**
 * Client-side Validation Schema
 * 
 * Mirrors the backend Zod schema for early validation and better UX.
 * Provides immediate feedback without server round-trips.
 */

import { z } from 'zod';

// Validation patterns that mirror backend schema
const VALIDATION_PATTERNS = {
  prompt: z.string()
    .min(10, 'Prompt must be at least 10 characters for meaningful content generation')
    .max(2000, 'Prompt must be under 2000 characters for optimal AI processing')
    .transform(str => str.trim())
    .refine(val => val.length >= 10, 'Prompt cannot be mostly whitespace'),

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

  imagePrompt: z.string()
    .min(20, 'Image prompt must be at least 20 characters for quality generation')
    .max(500, 'Image prompt must be under 500 characters for optimal AI processing')
    .refine(val => val.trim().length >= 20, 'Image prompt cannot be mostly whitespace'),
} as const;

// Enum definitions that match backend
export const AUDIENCE_OPTIONS = [
  'general', 'executives', 'technical', 'sales', 'investors', 'students',
  'healthcare', 'education', 'marketing', 'finance', 'startup', 'government'
] as const;

export const TONE_OPTIONS = [
  'professional', 'casual', 'persuasive', 'educational', 'inspiring',
  'authoritative', 'friendly', 'urgent', 'confident', 'analytical'
] as const;

export const CONTENT_LENGTH_OPTIONS = [
  'minimal', 'brief', 'moderate', 'detailed', 'comprehensive'
] as const;

export const PRESENTATION_TYPE_OPTIONS = [
  'general', 'pitch', 'report', 'training', 'proposal', 'update',
  'analysis', 'comparison', 'timeline', 'process', 'strategy'
] as const;

export const INDUSTRY_OPTIONS = [
  'general', 'technology', 'healthcare', 'finance', 'education', 'retail',
  'manufacturing', 'consulting', 'nonprofit', 'government', 'startup'
] as const;

export const IMAGE_STYLE_OPTIONS = [
  'realistic', 'illustration', 'abstract', 'professional', 'minimal'
] as const;

export const QUALITY_LEVEL_OPTIONS = [
  'standard', 'high', 'premium'
] as const;

// Client-side validation schema for generation parameters
export const ClientGenerationParamsSchema = z.object({
  prompt: VALIDATION_PATTERNS.prompt,
  
  audience: z.enum(AUDIENCE_OPTIONS, {
    errorMap: () => ({ message: 'Please select a valid audience type' })
  }).default('general'),
  
  tone: z.enum(TONE_OPTIONS, {
    errorMap: () => ({ message: 'Please select a valid tone style' })
  }).default('professional'),
  
  contentLength: z.enum(CONTENT_LENGTH_OPTIONS, {
    errorMap: () => ({ message: 'Please select a valid content length' })
  }).default('moderate'),
  
  presentationType: z.enum(PRESENTATION_TYPE_OPTIONS).default('general'),
  
  industry: z.enum(INDUSTRY_OPTIONS).default('general'),
  
  withImage: z.boolean().default(false),
  
  imageStyle: z.enum(IMAGE_STYLE_OPTIONS).default('professional'),
  
  qualityLevel: z.enum(QUALITY_LEVEL_OPTIONS).default('standard'),
  
  includeNotes: z.boolean().default(false),
  
  includeSources: z.boolean().default(false),
  
  design: z.object({
    theme: z.string().max(50, 'Theme name too long').optional(),
    brand: z.object({
      primary: VALIDATION_PATTERNS.colorHex.optional(),
      secondary: VALIDATION_PATTERNS.colorHex.optional(),
      accent: VALIDATION_PATTERNS.colorHex.optional(),
    }).optional(),
  }).optional(),
});

export type ClientGenerationParams = z.infer<typeof ClientGenerationParamsSchema>;

// Validation result type for form handling
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
  fieldErrors?: Record<string, string>;
}

// Helper function to validate form data
export function validateGenerationParams(data: unknown): ValidationResult<ClientGenerationParams> {
  try {
    const result = ClientGenerationParamsSchema.safeParse(data);
    
    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    } else {
      const fieldErrors: Record<string, string> = {};
      const errors: Record<string, string[]> = {};
      
      result.error.issues.forEach(issue => {
        const path = issue.path.join('.');
        const message = issue.message;
        
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(message);
        
        // Store first error for each field for simple display
        if (!fieldErrors[path]) {
          fieldErrors[path] = message;
        }
      });
      
      return {
        success: false,
        errors,
        fieldErrors,
      };
    }
  } catch (error) {
    return {
      success: false,
      errors: { general: ['Validation failed'] },
      fieldErrors: { general: 'Validation failed' },
    };
  }
}

// Helper function to get field-specific validation
export function validateField(fieldName: keyof ClientGenerationParams, value: unknown): string | null {
  try {
    const schema = ClientGenerationParamsSchema.shape[fieldName];
    if (!schema) return null;
    
    const result = schema.safeParse(value);
    if (result.success) {
      return null;
    } else {
      return result.error.issues[0]?.message || 'Invalid value';
    }
  } catch {
    return 'Validation error';
  }
}

// Helper to get display labels for enum values
export const FIELD_LABELS = {
  audience: {
    general: 'General Audience',
    executives: 'Executives',
    technical: 'Technical Team',
    sales: 'Sales Team',
    investors: 'Investors',
    students: 'Students',
    healthcare: 'Healthcare Professionals',
    education: 'Educators',
    marketing: 'Marketing Team',
    finance: 'Finance Team',
    startup: 'Startup Team',
    government: 'Government Officials'
  },
  tone: {
    professional: 'Professional',
    casual: 'Casual',
    persuasive: 'Persuasive',
    educational: 'Educational',
    inspiring: 'Inspiring',
    authoritative: 'Authoritative',
    friendly: 'Friendly',
    urgent: 'Urgent',
    confident: 'Confident',
    analytical: 'Analytical'
  },
  contentLength: {
    minimal: 'Minimal',
    brief: 'Brief',
    moderate: 'Moderate',
    detailed: 'Detailed',
    comprehensive: 'Comprehensive'
  },
  presentationType: {
    general: 'General',
    pitch: 'Pitch',
    report: 'Report',
    training: 'Training',
    proposal: 'Proposal',
    update: 'Update',
    analysis: 'Analysis',
    comparison: 'Comparison',
    timeline: 'Timeline',
    process: 'Process',
    strategy: 'Strategy'
  }
} as const;
