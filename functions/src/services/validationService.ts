/**
 * Validation Service Module - Centralized Validation Logic
 * 
 * Provides comprehensive validation for all application data including:
 * - Input parameter validation
 * - Slide content validation
 * - Content quality assessment
 * - Business rule validation
 * 
 * This module ensures data integrity and provides detailed feedback
 * for validation failures.
 * 
 * @version 1.0.0
 */

import { 
  safeValidateGenerationParams, 
  safeValidateSlideSpec, 
  validateContentQuality,
  type GenerationParams, 
  type SlideSpec 
} from '../schema';

/**
 * Validation result interface
 */
export interface ValidationResult<T = any> {
  success: boolean;
  data?: T;
  errors: string[];
  warnings: string[];
  metadata?: Record<string, any>;
}

/**
 * Content quality assessment
 */
export interface QualityAssessment {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  issues: string[];
  strengths: string[];
  suggestions: string[];
}

/**
 * Validation Service Interface
 */
export interface IValidationService {
  validateGenerationParams(params: any): ValidationResult<GenerationParams>;
  validateSlideSpec(spec: any): ValidationResult<SlideSpec>;
  validateSlideArray(specs: any[]): ValidationResult<SlideSpec[]>;
  assessContentQuality(spec: SlideSpec): QualityAssessment;
  validateBusinessRules(params: GenerationParams): ValidationResult<GenerationParams>;
}

/**
 * Main Validation Service Implementation
 */
export class ValidationService implements IValidationService {
  /**
   * Validate generation parameters
   */
  validateGenerationParams(params: any): ValidationResult<GenerationParams> {
    const result = safeValidateGenerationParams(params);
    
    const validationResult: ValidationResult<GenerationParams> = {
      success: result.success,
      data: result.data,
      errors: result.errors || [],
      warnings: [],
      metadata: {
        validatedAt: new Date().toISOString(),
        validationType: 'generation_params'
      }
    };

    // Add business rule validation
    if (result.success && result.data) {
      const businessValidation = this.validateBusinessRules(result.data);
      validationResult.warnings.push(...businessValidation.warnings);
      
      if (!businessValidation.success) {
        validationResult.success = false;
        validationResult.errors.push(...businessValidation.errors);
      }
    }

    return validationResult;
  }

  /**
   * Validate a single slide specification
   */
  validateSlideSpec(spec: any): ValidationResult<SlideSpec> {
    const result = safeValidateSlideSpec(spec);
    
    const validationResult: ValidationResult<SlideSpec> = {
      success: result.success,
      data: result.success ? result.data as SlideSpec : undefined,
      errors: result.errors || [],
      warnings: [],
      metadata: {
        validatedAt: new Date().toISOString(),
        validationType: 'slide_spec'
      }
    };

    // Add content quality warnings
    if (result.success && result.data && !Array.isArray(result.data)) {
      const qualityAssessment = this.assessContentQuality(result.data as SlideSpec);
      
      if (qualityAssessment.score < 70) {
        validationResult.warnings.push(`Content quality score is low (${qualityAssessment.score}/100)`);
      }
      
      validationResult.warnings.push(...qualityAssessment.issues);
      validationResult.metadata!.qualityScore = qualityAssessment.score;
      validationResult.metadata!.qualityGrade = qualityAssessment.grade;
    }

    return validationResult;
  }

  /**
   * Validate an array of slide specifications
   */
  validateSlideArray(specs: any[]): ValidationResult<SlideSpec[]> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const validatedSpecs: SlideSpec[] = [];

    if (!Array.isArray(specs)) {
      return {
        success: false,
        errors: ['Input must be an array of slide specifications'],
        warnings: []
      };
    }

    if (specs.length === 0) {
      return {
        success: false,
        errors: ['At least one slide specification is required'],
        warnings: []
      };
    }

    if (specs.length > 50) {
      errors.push('Too many slides (maximum 50 allowed)');
    }

    // Validate each slide
    specs.forEach((spec, index) => {
      const slideValidation = this.validateSlideSpec(spec);
      
      if (slideValidation.success && slideValidation.data) {
        validatedSpecs.push(slideValidation.data);
      } else {
        slideValidation.errors.forEach(error => {
          errors.push(`Slide ${index + 1}: ${error}`);
        });
      }
      
      slideValidation.warnings.forEach(warning => {
        warnings.push(`Slide ${index + 1}: ${warning}`);
      });
    });

    // Validate presentation-level rules
    if (validatedSpecs.length > 0) {
      const presentationWarnings = this.validatePresentationRules(validatedSpecs);
      warnings.push(...presentationWarnings);
    }

    return {
      success: errors.length === 0,
      data: validatedSpecs,
      errors,
      warnings,
      metadata: {
        validatedAt: new Date().toISOString(),
        validationType: 'slide_array',
        slideCount: validatedSpecs.length,
        totalInputSlides: specs.length
      }
    };
  }

  /**
   * Assess content quality for a slide
   */
  assessContentQuality(spec: SlideSpec): QualityAssessment {
    const qualityResult = validateContentQuality(spec);
    
    return {
      score: qualityResult.score,
      grade: this.scoreToGrade(qualityResult.score),
      issues: qualityResult.accessibility.issues.concat(qualityResult.readability.issues),
      strengths: qualityResult.suggestions.filter(s => s.includes('good') || s.includes('excellent')),
      suggestions: this.generateSuggestions(spec, qualityResult)
    };
  }

  /**
   * Validate business rules for generation parameters
   */
  validateBusinessRules(params: GenerationParams): ValidationResult<GenerationParams> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check prompt length
    if (params.prompt.length < 10) {
      errors.push('Prompt is too short (minimum 10 characters)');
    }

    if (params.prompt.length > 1000) {
      warnings.push('Very long prompt may result in slower generation');
    }

    // Check for potentially problematic content
    const lowercasePrompt = params.prompt.toLowerCase();
    const problematicTerms = ['hack', 'illegal', 'violence', 'inappropriate'];
    
    problematicTerms.forEach(term => {
      if (lowercasePrompt.includes(term)) {
        warnings.push(`Prompt contains potentially problematic term: "${term}"`);
      }
    });

    // Validate audience-tone combinations
    if (params.audience === 'students' && params.tone === 'authoritative') {
      warnings.push('Authoritative tone may not be optimal for student audience');
    }

    if (params.audience === 'executives' && params.tone === 'casual') {
      warnings.push('Casual tone may not be appropriate for executive audience');
    }

    // Validate content length settings
    if (params.contentLength === 'minimal' && params.audience === 'technical') {
      warnings.push('Minimal content length may not provide enough detail for technical audience');
    }

    return {
      success: errors.length === 0,
      data: params,
      errors,
      warnings,
      metadata: {
        validatedAt: new Date().toISOString(),
        validationType: 'business_rules'
      }
    };
  }

  /**
   * Convert quality score to letter grade
   */
  private scoreToGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Generate improvement suggestions based on quality assessment
   */
  private generateSuggestions(spec: SlideSpec, qualityResult: any): string[] {
    const suggestions: string[] = [];

    // Title suggestions
    if (!spec.title || spec.title.length < 15) {
      suggestions.push('Consider making the title more descriptive and specific');
    }

    if (spec.title && spec.title.length > 60) {
      suggestions.push('Consider shortening the title for better readability');
    }

    // Content suggestions
    if (spec.bullets && spec.bullets.length > 7) {
      suggestions.push('Consider reducing the number of bullet points for better focus');
    }

    if (spec.bullets && spec.bullets.some(bullet => bullet.length > 150)) {
      suggestions.push('Consider shortening bullet points for better scannability');
    }

    if (!spec.notes) {
      suggestions.push('Consider adding speaker notes for better presentation delivery');
    }

    // Layout suggestions
    if (spec.layout === 'title-paragraph' && spec.paragraph && spec.paragraph.length > 500) {
      suggestions.push('Consider using bullet points instead of long paragraphs');
    }

    return suggestions;
  }

  /**
   * Validate presentation-level rules
   */
  private validatePresentationRules(slides: SlideSpec[]): string[] {
    const warnings: string[] = [];

    // Check for title slide
    const hasTitleSlide = slides.some(slide =>
      slide.layout === 'title' ||
      slide.title.toLowerCase().includes('title') ||
      slide.title.toLowerCase().includes('introduction')
    );

    if (!hasTitleSlide && slides.length > 1) {
      warnings.push('Consider adding a title slide for better presentation structure');
    }

    // Check for conclusion slide
    const hasConclusionSlide = slides.some(slide =>
      slide.title.toLowerCase().includes('conclusion') ||
      slide.title.toLowerCase().includes('summary') ||
      slide.title.toLowerCase().includes('next steps')
    );

    if (!hasConclusionSlide && slides.length > 3) {
      warnings.push('Consider adding a conclusion slide for better presentation closure');
    }

    // Check for consistent layout usage
    const layoutCounts = slides.reduce((acc, slide) => {
      acc[slide.layout] = (acc[slide.layout] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const layoutVariety = Object.keys(layoutCounts).length;
    if (layoutVariety === 1 && slides.length > 3) {
      warnings.push('Consider using varied slide layouts for better visual interest');
    }

    return warnings;
  }
}

// Export singleton instance
export const validationService = new ValidationService();
export default validationService;
