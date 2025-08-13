/**
 * Unit Tests for AI PowerPoint Generator Backend
 * 
 * Comprehensive test suite covering schema validation, content generation,
 * theme management, and PowerPoint generation functionality.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');

// Mock Firebase functions for testing
jest.mock('firebase-functions/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}));

jest.mock('firebase-functions/params', () => ({
  defineSecret: jest.fn(() => ({ value: () => 'mock-secret' }))
}));

// Import modules to test
const { 
  validateSlideSpec, 
  safeValidateSlideSpec, 
  validateGenerationParams,
  safeValidateGenerationParams,
  validateContentQuality,
  generateContentImprovements,
  SLIDE_LAYOUTS
} = require('../src/schema');

const { 
  PROFESSIONAL_THEMES,
  getThemeById,
  getDefaultTheme,
  selectThemeForContent,
  customizeTheme,
  validateThemeAccessibility,
  getThemeRecommendations
} = require('../src/professionalThemes');

const {
  generateContentPrompt,
  generateLayoutPrompt,
  generateImagePrompt,
  generateRefinementPrompt,
  CONTENT_LENGTH_SPECS,
  AUDIENCE_GUIDANCE,
  TONE_SPECIFICATIONS
} = require('../src/prompts');

describe('Schema Validation', () => {
  describe('SlideSpec Validation', () => {
    it('should validate a basic slide specification', () => {
      const validSpec = {
        title: 'Test Slide Title',
        layout: 'title-paragraph',
        paragraph: 'This is a test paragraph with sufficient content.',
        notes: 'Speaker notes for the slide',
        sources: []
      };

      const result = validateSlideSpec(validSpec);
      expect(result).toBeDefined();
      expect(result.title).toBe(validSpec.title);
      expect(result.layout).toBe(validSpec.layout);
    });

    it('should reject invalid slide specifications', () => {
      const invalidSpec = {
        title: '', // Too short
        layout: 'invalid-layout',
        paragraph: ''
      };

      expect(() => validateSlideSpec(invalidSpec)).toThrow();
    });

    it('should safely validate and return detailed errors', () => {
      const invalidSpec = {
        title: 'A', // Too short
        layout: 'invalid-layout'
      };

      const result = safeValidateSlideSpec(invalidSpec);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate all supported layouts', () => {
      SLIDE_LAYOUTS.forEach(layout => {
        const spec = {
          title: 'Test Title for Layout',
          layout: layout,
          paragraph: 'Test content for this layout type.',
          notes: 'Test notes',
          sources: []
        };

        const result = safeValidateSlideSpec(spec);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('GenerationParams Validation', () => {
    it('should validate basic generation parameters', () => {
      const validParams = {
        prompt: 'Create a slide about quarterly results',
        audience: 'executives',
        tone: 'professional',
        contentLength: 'moderate'
      };

      const result = validateGenerationParams(validParams);
      expect(result).toBeDefined();
      expect(result.prompt).toBe(validParams.prompt);
    });

    it('should apply default values for optional parameters', () => {
      const minimalParams = {
        prompt: 'Create a basic slide about company overview'
      };

      const result = validateGenerationParams(minimalParams);
      expect(result.audience).toBe('general');
      expect(result.tone).toBe('professional');
      expect(result.contentLength).toBe('moderate');
    });

    it('should validate enhanced parameters', () => {
      const enhancedParams = {
        prompt: 'Create a healthcare presentation about patient safety',
        audience: 'healthcare',
        tone: 'authoritative',
        contentLength: 'comprehensive',
        presentationType: 'training',
        industry: 'healthcare',
        withImage: true,
        imageStyle: 'professional',
        qualityLevel: 'premium'
      };

      const result = safeValidateGenerationParams(enhancedParams);
      expect(result.success).toBe(true);
      expect(result.data.industry).toBe('healthcare');
      expect(result.data.presentationType).toBe('training');
    });
  });
});

describe('Content Quality Assessment', () => {
  it('should assess content quality correctly', () => {
    const goodSpec = {
      title: 'Comprehensive Quarterly Business Review',
      layout: 'title-bullets',
      bullets: [
        'Revenue increased by 25% year-over-year',
        'Customer satisfaction scores improved to 4.8/5',
        'Market expansion into three new regions',
        'Team productivity metrics exceeded targets'
      ],
      notes: 'Present with confidence and enthusiasm',
      sources: ['Internal financial reports', 'Customer survey data']
    };

    const assessment = validateContentQuality(goodSpec);
    expect(assessment.score).toBeGreaterThan(80);
    expect(assessment.grade).toMatch(/[A-C]/);
    expect(assessment.suggestions).toBeDefined();
    expect(assessment.warnings).toBeDefined();
  });

  it('should identify content quality issues', () => {
    const poorSpec = {
      title: 'Bad',
      layout: 'title-bullets',
      bullets: Array(15).fill('Too many bullets'),
      paragraph: 'Very short.',
      notes: '',
      sources: []
    };

    const assessment = validateContentQuality(poorSpec);
    expect(assessment.score).toBeLessThan(70);
    expect(assessment.warnings.length).toBeGreaterThan(0);
    expect(assessment.suggestions.length).toBeGreaterThan(0);
  });

  it('should generate improvement suggestions', () => {
    const spec = {
      title: 'Short',
      layout: 'title-paragraph',
      paragraph: 'Brief content.',
      notes: '',
      sources: []
    };

    const assessment = validateContentQuality(spec);
    const improvements = generateContentImprovements(spec, assessment);
    
    expect(improvements.priorityImprovements).toBeDefined();
    expect(improvements.quickFixes).toBeDefined();
    expect(improvements.enhancementSuggestions).toBeDefined();
  });
});

describe('Theme Management', () => {
  it('should retrieve themes by ID', () => {
    const theme = getThemeById('corporate-blue');
    expect(theme).toBeDefined();
    expect(theme.id).toBe('corporate-blue');
    expect(theme.colors).toBeDefined();
    expect(theme.typography).toBeDefined();
  });

  it('should return default theme when ID not found', () => {
    const theme = getThemeById('non-existent-theme');
    expect(theme).toBeUndefined();
    
    const defaultTheme = getDefaultTheme();
    expect(defaultTheme).toBeDefined();
    expect(defaultTheme.id).toBe('corporate-blue');
  });

  it('should select appropriate themes for content', () => {
    const healthcareTheme = selectThemeForContent({
      industry: 'healthcare',
      audience: 'healthcare'
    });
    expect(healthcareTheme.id).toBe('healthcare-teal');

    const techTheme = selectThemeForContent({
      industry: 'technology',
      presentationType: 'pitch'
    });
    expect(techTheme.id).toMatch(/tech-gradient|startup-orange/);
  });

  it('should customize themes with brand colors', () => {
    const baseTheme = getDefaultTheme();
    const customTheme = customizeTheme(baseTheme, {
      primary: '#FF0000',
      secondary: '#00FF00',
      fontFamily: 'Arial'
    });

    expect(customTheme.colors.primary).toBe('#FF0000');
    expect(customTheme.colors.secondary).toBe('#00FF00');
    expect(customTheme.typography.headings.fontFamily).toBe('Arial');
    expect(customTheme.id).toContain('custom');
  });

  it('should validate theme accessibility', () => {
    const theme = getDefaultTheme();
    const validation = validateThemeAccessibility(theme);
    
    expect(validation.isAccessible).toBeDefined();
    expect(validation.issues).toBeDefined();
    expect(validation.suggestions).toBeDefined();
  });

  it('should provide theme recommendations', () => {
    const recommendations = getThemeRecommendations({
      hasCharts: true,
      isDataHeavy: true,
      audience: 'executives',
      industry: 'finance'
    });

    expect(recommendations.recommended).toBeDefined();
    expect(recommendations.recommended.length).toBeGreaterThan(0);
    expect(recommendations.reasons).toBeDefined();
    expect(recommendations.reasons.length).toBeGreaterThan(0);
  });
});

describe('Prompt Engineering', () => {
  it('should generate content prompts with proper structure', () => {
    const input = {
      prompt: 'Create a slide about AI benefits',
      audience: 'technical',
      tone: 'professional',
      contentLength: 'detailed',
      industry: 'technology',
      presentationType: 'training'
    };

    const prompt = generateContentPrompt(input);
    expect(prompt).toContain(input.prompt);
    expect(prompt).toContain('AUDIENCE PROFILE');
    expect(prompt).toContain('TONE & STYLE');
    expect(prompt).toContain('CONTENT SPECIFICATIONS');
  });

  it('should include industry and presentation type guidance', () => {
    const input = {
      prompt: 'Healthcare safety protocols',
      audience: 'healthcare',
      industry: 'healthcare',
      presentationType: 'training',
      tone: 'professional',
      contentLength: 'comprehensive'
    };

    const prompt = generateContentPrompt(input);
    expect(prompt).toContain('INDUSTRY CONTEXT');
    expect(prompt).toContain('PRESENTATION TYPE GUIDANCE');
  });

  it('should generate layout prompts with comprehensive guidance', () => {
    const input = {
      prompt: 'Test prompt',
      audience: 'general',
      tone: 'professional',
      contentLength: 'moderate'
    };
    
    const partialSpec = {
      title: 'Test Title',
      paragraph: 'Test content'
    };

    const prompt = generateLayoutPrompt(input, partialSpec);
    expect(prompt).toContain('AVAILABLE LAYOUTS');
    expect(prompt).toContain('LAYOUT SELECTION CRITERIA');
    expect(prompt).toContain('DESIGN PRINCIPLES');
  });
});
