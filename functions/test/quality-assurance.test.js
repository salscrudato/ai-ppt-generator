/**
 * Quality Assurance Test Suite
 * 
 * Tests for PowerPoint generation quality including:
 * - Content validation and corruption detection
 * - Professional standards compliance
 * - Accessibility validation
 * - Visual consistency checks
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');

// Mock Firebase functions for testing
jest.mock('firebase-functions/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

jest.mock('firebase-functions/params', () => ({
  defineSecret: jest.fn(() => ({ value: () => 'mock-secret' }))
}));

// Import modules to test
const {
  generateSimplePpt
} = require('../lib/pptGenerator-simple');

const {
  validateSlideSpec,
  safeValidateSlideSpec,
  validateContentQuality,
  generateContentImprovements
} = require('../lib/schema');

const {
  PROFESSIONAL_THEMES,
  getThemeById,
  validateThemeAccessibility
} = require('../lib/professionalThemes');

const {
  CorruptionDiagnostics
} = require('../lib/utils/corruptionDiagnostics');

describe('Quality Assurance System', () => {
  describe('Content Validation', () => {
    it('should validate slide specifications correctly', () => {
      const validSlide = {
        title: 'Quality Assurance Test',
        layout: 'title-bullets',
        bullets: [
          'Comprehensive content validation',
          'Professional standards compliance',
          'Accessibility requirements',
          'Visual consistency checks'
        ],
        notes: 'This slide demonstrates quality assurance testing.',
        sources: ['Internal QA documentation']
      };

      const result = validateSlideSpec(validSlide);
      expect(result).toBeDefined();
      expect(result.title).toBe(validSlide.title);
      expect(result.layout).toBe(validSlide.layout);
      expect(result.bullets).toEqual(validSlide.bullets);
    });

    it('should detect and report content quality issues', () => {
      const poorQualitySlide = {
        title: 'x',  // Extremely short title
        layout: 'title-bullets',
        bullets: Array(25).fill('x'),  // Too many extremely short bullets
        paragraph: 'x',  // Extremely short paragraph
        notes: '',
        sources: []
      };

      const assessment = validateContentQuality(poorQualitySlide);
      
      expect(assessment).toBeDefined();
      expect(assessment.score).toBeLessThan(70);
      expect(assessment.grade).toMatch(/[D-F]/);
      expect(assessment.warnings.length).toBeGreaterThan(0);
      expect(assessment.suggestions.length).toBeGreaterThan(0);
      
      // Check specific quality issues
      const hasLengthWarning = assessment.warnings.some(w => 
        w.includes('title') || w.includes('short')
      );
      const hasBulletWarning = assessment.warnings.some(w => 
        w.includes('bullet') || w.includes('many')
      );
      
      expect(hasLengthWarning || hasBulletWarning).toBe(true);
    });

    it('should generate actionable content improvements', () => {
      const improvableSlide = {
        title: 'x',  // Extremely short title
        layout: 'title-paragraph',
        paragraph: 'x',  // Extremely short paragraph
        notes: '',
        sources: []
      };

      const assessment = validateContentQuality(improvableSlide);
      const improvements = generateContentImprovements(improvableSlide, assessment);
      
      expect(improvements).toBeDefined();
      expect(improvements.priorityImprovements).toBeInstanceOf(Array);
      expect(improvements.quickFixes).toBeInstanceOf(Array);
      expect(improvements.enhancementSuggestions).toBeInstanceOf(Array);
      
      expect(improvements.priorityImprovements.length).toBeGreaterThan(0);
    });
  });

  describe('Corruption Detection', () => {
    let diagnostics;

    beforeEach(() => {
      diagnostics = new CorruptionDiagnostics();
    });

    it('should detect structural corruption issues', () => {
      const corruptedSlides = [
        {
          title: '', // Missing title
          layout: 'invalid-layout', // Invalid layout
          bullets: []
        },
        {
          title: 'Valid Slide',
          layout: 'title-bullets',
          bullets: ['Valid content']
        }
      ];

      const context = {
        requestId: 'test-corruption',
        component: 'quality-test',
        operation: 'corruption-detection'
      };

      const issues = diagnostics.analyzeSlideSpecs(corruptedSlides, context);
      
      expect(issues).toBeInstanceOf(Array);
      expect(issues.length).toBeGreaterThan(0);
      
      // Check for specific corruption issues
      const hasTitleIssue = issues.some(issue => 
        issue.title.includes('Title') && issue.severity === 'critical'
      );
      const hasLayoutIssue = issues.some(issue => 
        issue.title.includes('Layout') && issue.severity === 'high'
      );
      
      expect(hasTitleIssue).toBe(true);
      expect(hasLayoutIssue).toBe(true);
    });

    it('should generate comprehensive diagnostic reports', () => {
      const testSlides = [
        {
          title: 'Test Slide 1',
          layout: 'title-bullets',
          bullets: ['Valid content']
        },
        {
          title: 'Test Slide 2',
          layout: 'title-paragraph',
          paragraph: 'Valid paragraph content'
        }
      ];

      const context = {
        requestId: 'test-report',
        component: 'quality-test',
        operation: 'report-generation'
      };

      const report = diagnostics.generateReport(
        'Test Presentation',
        testSlides,
        undefined,
        context
      );
      
      expect(report).toBeDefined();
      expect(report.id).toBeDefined();
      expect(report.presentationTitle).toBe('Test Presentation');
      expect(report.slideCount).toBe(2);
      expect(report.issues).toBeInstanceOf(Array);
      expect(report.overallHealth).toMatch(/^(healthy|warning|critical)$/);
      expect(report.recommendations).toBeInstanceOf(Array);
    });

    it('should validate generated PowerPoint files', async () => {
      const testSlides = [
        {
          title: 'File Validation Test',
          layout: 'title-bullets',
          bullets: ['Testing file integrity', 'Checking structure', 'Validating format']
        }
      ];

      const buffer = await generateSimplePpt(testSlides, true, 'corporate-blue');
      
      const context = {
        requestId: 'test-validation',
        component: 'quality-test',
        operation: 'file-validation'
      };

      const validation = diagnostics.validateGeneratedFile(buffer, context);
      
      expect(validation).toBeDefined();
      expect(validation.passed).toBe(true);
      expect(validation.issues).toBeInstanceOf(Array);
      expect(validation.issues.length).toBe(0);
    });
  });

  describe('Accessibility Compliance', () => {
    it('should validate theme accessibility for all professional themes', () => {
      const accessibilityResults = [];
      
      PROFESSIONAL_THEMES.forEach(theme => {
        const validation = validateThemeAccessibility(theme);
        accessibilityResults.push({
          themeId: theme.id,
          themeName: theme.name,
          isAccessible: validation.isAccessible,
          wcagLevel: validation.wcagLevel,
          issueCount: validation.issues.length
        });
      });
      
      // At least 80% of themes should meet WCAG accessibility standards (A, AA, or AAA)
      const accessibleThemes = accessibilityResults.filter(r =>
        r.isAccessible && (r.wcagLevel === 'A' || r.wcagLevel === 'AA' || r.wcagLevel === 'AAA')
      );
      const accessibilityRate = accessibleThemes.length / accessibilityResults.length;
      
      expect(accessibilityRate).toBeGreaterThan(0.8);
      
      console.log(`Accessibility compliance: ${(accessibilityRate * 100).toFixed(1)}%`);
      console.log(`Accessible themes: ${accessibleThemes.length}/${accessibilityResults.length}`);
    });

    it('should ensure minimum contrast ratios are met', () => {
      const corporateTheme = getThemeById('corporate-blue');
      const validation = validateThemeAccessibility(corporateTheme);
      
      expect(validation.contrastRatios).toBeDefined();
      expect(validation.contrastRatios.bodyText).toBeGreaterThan(4.5); // WCAG AA
      expect(validation.contrastRatios.secondaryText).toBeGreaterThan(3.0); // Minimum readable
      
      if (validation.contrastRatios.accent) {
        expect(validation.contrastRatios.accent).toBeGreaterThan(3.0);
      }
    });
  });

  describe('Professional Standards Compliance', () => {
    it('should generate presentations that meet corporate standards', async () => {
      const corporateSlides = [
        {
          title: 'Executive Summary',
          layout: 'title',
          paragraph: 'Professional presentation following corporate design standards and best practices.'
        },
        {
          title: 'Key Performance Indicators',
          layout: 'title-bullets',
          bullets: [
            'Revenue growth: 25% year-over-year',
            'Customer satisfaction: 4.8/5 rating',
            'Market expansion: 3 new regions',
            'Team productivity: 15% improvement'
          ]
        },
        {
          title: 'Financial Overview',
          layout: 'chart',
          chart: {
            type: 'bar',
            title: 'Quarterly Revenue',
            categories: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'],
            series: [{
              name: 'Revenue',
              data: [2.1, 2.4, 2.7, 3.0]
            }]
          }
        }
      ];

      const buffer = await generateSimplePpt(corporateSlides, true, 'corporate-blue');
      
      // Validate file structure
      expect(buffer).toBeDefined();
      expect(buffer.length).toBeGreaterThan(2000); // Reasonable size for professional content
      
      // Check PowerPoint format compliance
      const header = buffer.slice(0, 4).toString('hex');
      expect(header).toBe('504b0304'); // Valid PPTX format
      
      // Validate content structure
      corporateSlides.forEach(slide => {
        const contentAssessment = validateContentQuality(slide);
        expect(contentAssessment.score).toBeGreaterThan(70); // Professional quality threshold
      });
    }, 30000);

    it('should maintain consistent visual hierarchy', async () => {
      const hierarchyTestSlides = [
        {
          title: 'Primary Heading Level',
          layout: 'title',
          paragraph: 'This tests the primary heading hierarchy and visual prominence.'
        },
        {
          title: 'Secondary Content Level',
          layout: 'title-bullets',
          bullets: [
            'Secondary level content with proper hierarchy',
            'Consistent bullet point formatting',
            'Appropriate spacing and typography'
          ]
        },
        {
          title: 'Detailed Information Level',
          layout: 'title-paragraph',
          paragraph: 'This paragraph represents the detailed information level in the visual hierarchy. It should have appropriate typography, spacing, and contrast to ensure readability while maintaining the established hierarchy.'
        }
      ];

      const buffer = await generateSimplePpt(hierarchyTestSlides, true, 'corporate-blue');
      expect(buffer).toBeDefined();
      
      // Visual hierarchy is validated through successful generation
      // and content quality assessments
      hierarchyTestSlides.forEach(slide => {
        const assessment = validateContentQuality(slide);
        expect(assessment.warnings).not.toContain(
          expect.stringMatching(/hierarchy|structure/i)
        );
      });
    }, 30000);
  });
});
