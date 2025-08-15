/**
 * Slide Builder Registry
 * 
 * Modular slide builder system that provides a pluggable architecture for
 * different slide types. Each slide type has a dedicated builder that handles
 * layout, content positioning, and styling.
 * 
 * Features:
 * - Type-safe slide builder registration
 * - Consistent interface across all builders
 * - Error handling and fallback mechanisms
 * - Theme-aware rendering
 * - Validation and quality checks
 */

import type { SlideSpec } from '../../schema';
import type { ProfessionalTheme } from '../../professionalThemes';
import type pptxgen from 'pptxgenjs';

/**
 * Base interface for all slide builders
 */
export interface SlideBuilder {
  /** Unique identifier for the builder */
  type: SlideSpec['layout'];
  
  /** Human-readable name */
  name: string;
  
  /** Description of what this builder creates */
  description: string;
  
  /** Build the slide content */
  build(
    slide: pptxgen.Slide,
    spec: SlideSpec,
    theme: ProfessionalTheme,
    options?: SlideBuilderOptions
  ): Promise<void> | void;
  
  /** Validate slide specification for this builder */
  validate(spec: SlideSpec): ValidationResult;
  
  /** Get required content fields for this builder */
  getRequiredFields(): string[];
  
  /** Get optional content fields for this builder */
  getOptionalFields(): string[];
}

/**
 * Options passed to slide builders
 */
export interface SlideBuilderOptions {
  /** Content positioning constants */
  contentY?: number;
  contentPadding?: number;
  maxContentWidth?: number;
  
  /** Slide dimensions */
  slideWidth?: number;
  slideHeight?: number;
  
  /** Additional styling options */
  useModernStyling?: boolean;
  enableAnimations?: boolean;
  
  /** Debug mode */
  debug?: boolean;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

/**
 * Slide Builder Registry Class
 */
export class SlideBuilderRegistry {
  private builders = new Map<SlideSpec['layout'], SlideBuilder>();
  private fallbackBuilder: SlideBuilder | null = null;

  /**
   * Register a slide builder
   */
  register(builder: SlideBuilder): void {
    this.builders.set(builder.type, builder);
    console.log(`✅ Registered slide builder: ${builder.type} (${builder.name})`);
  }

  /**
   * Set fallback builder for unknown types
   */
  setFallback(builder: SlideBuilder): void {
    this.fallbackBuilder = builder;
    console.log(`✅ Set fallback slide builder: ${builder.type}`);
  }

  /**
   * Get builder for slide type
   */
  getBuilder(type: SlideSpec['layout']): SlideBuilder | null {
    return this.builders.get(type) || this.fallbackBuilder;
  }

  /**
   * Check if builder exists for type
   */
  hasBuilder(type: SlideSpec['layout']): boolean {
    return this.builders.has(type);
  }

  /**
   * Get all registered builders
   */
  getAllBuilders(): SlideBuilder[] {
    return Array.from(this.builders.values());
  }

  /**
   * Get supported slide types
   */
  getSupportedTypes(): SlideSpec['layout'][] {
    return Array.from(this.builders.keys());
  }

  /**
   * Build slide using appropriate builder
   */
  async buildSlide(
    slide: pptxgen.Slide,
    spec: SlideSpec,
    theme: ProfessionalTheme,
    options: SlideBuilderOptions = {}
  ): Promise<void> {
    const builder = this.getBuilder(spec.layout);
    
    if (!builder) {
      throw new Error(`No builder found for slide type: ${spec.layout}`);
    }

    // Validate specification
    const validation = builder.validate(spec);
    if (!validation.isValid) {
      console.warn(`Validation warnings for ${spec.layout}:`, validation.warnings);
      if (validation.errors.length > 0) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
    }

    // Build the slide
    try {
      await builder.build(slide, spec, theme, options);
      console.log(`✅ Successfully built ${spec.layout} slide: "${spec.title}"`);
    } catch (error) {
      console.error(`❌ Error building ${spec.layout} slide:`, error);
      throw error;
    }
  }

  /**
   * Validate slide specification
   */
  validateSlideSpec(spec: SlideSpec): ValidationResult {
    const builder = this.getBuilder(spec.layout);
    
    if (!builder) {
      return {
        isValid: false,
        errors: [`Unknown slide type: ${spec.layout}`],
        warnings: [],
        suggestions: [`Available types: ${this.getSupportedTypes().join(', ')}`]
      };
    }

    return builder.validate(spec);
  }

  /**
   * Get builder information
   */
  getBuilderInfo(type: SlideSpec['layout']): {
    name: string;
    description: string;
    requiredFields: string[];
    optionalFields: string[];
  } | null {
    const builder = this.getBuilder(type);
    
    if (!builder) {
      return null;
    }

    return {
      name: builder.name,
      description: builder.description,
      requiredFields: builder.getRequiredFields(),
      optionalFields: builder.getOptionalFields()
    };
  }
}

/**
 * Base slide builder class with common functionality
 */
export abstract class BaseSlideBuilder implements SlideBuilder {
  abstract type: SlideSpec['layout'];
  abstract name: string;
  abstract description: string;

  abstract build(
    slide: pptxgen.Slide,
    spec: SlideSpec,
    theme: ProfessionalTheme,
    options?: SlideBuilderOptions
  ): Promise<void> | void;

  /**
   * Default validation implementation
   */
  validate(spec: SlideSpec): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check required fields
    const requiredFields = this.getRequiredFields();
    for (const field of requiredFields) {
      if (!spec[field as keyof SlideSpec]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Check title
    if (!spec.title || spec.title.trim().length === 0) {
      errors.push('Title is required');
    } else if (spec.title.length > 120) {
      warnings.push('Title is very long and may not display well');
    }

    // Layout-specific validation
    this.validateLayoutSpecific(spec, errors, warnings, suggestions);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Override this for layout-specific validation
   */
  protected validateLayoutSpecific(
    spec: SlideSpec,
    errors: string[],
    warnings: string[],
    suggestions: string[]
  ): void {
    // Default implementation - no additional validation
  }

  /**
   * Default required fields
   */
  getRequiredFields(): string[] {
    return ['title'];
  }

  /**
   * Default optional fields
   */
  getOptionalFields(): string[] {
    return ['notes', 'sources'];
  }

  /**
   * Helper method to add title to slide
   */
  protected addTitle(
    slide: pptxgen.Slide,
    title: string,
    theme: ProfessionalTheme,
    options: SlideBuilderOptions = {}
  ): void {
    const { contentY = 0.8, maxContentWidth = 8.5 } = options;
    
    slide.addText(title, {
      x: 0.75,
      y: contentY,
      w: maxContentWidth,
      h: 0.8,
      fontSize: 28,
      fontFace: theme.typography?.fontFamilies?.heading || 'Arial',
      color: theme.colors.text?.primary || theme.colors.primary,
      bold: true,
      align: 'left',
      valign: 'top'
    });
  }

  /**
   * Helper method to add bullets to slide
   */
  protected addBullets(
    slide: pptxgen.Slide,
    bullets: string[],
    theme: ProfessionalTheme,
    x: number,
    y: number,
    w: number,
    h: number
  ): void {
    if (!bullets || bullets.length === 0) return;

    slide.addText(
      bullets.map(bullet => `• ${bullet}`).join('\n'),
      {
        x, y, w, h,
        fontSize: 16,
        fontFace: theme.typography?.fontFamilies?.body || 'Arial',
        color: theme.colors.text?.primary || theme.colors.primary,
        align: 'left',
        valign: 'top',
        lineSpacing: 24
      }
    );
  }

  /**
   * Helper method to add paragraph to slide
   */
  protected addParagraph(
    slide: pptxgen.Slide,
    paragraph: string,
    theme: ProfessionalTheme,
    x: number,
    y: number,
    w: number,
    h: number
  ): void {
    if (!paragraph) return;

    slide.addText(paragraph, {
      x, y, w, h,
      fontSize: 14,
      fontFace: theme.typography?.fontFamilies?.body || 'Arial',
      color: theme.colors.text?.primary || theme.colors.primary,
      align: 'left',
      valign: 'top',
      lineSpacing: 20
    });
  }
}

// Create and export singleton registry
export const slideBuilderRegistry = new SlideBuilderRegistry();
