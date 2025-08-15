/**
 * Integration Tests for Enhanced Slide Generation System
 *
 * End-to-end tests demonstrating the complete slide generation pipeline
 * from configuration to final presentation output.
 *
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import { describe, it, expect } from '@jest/globals';
import {
  buildSlide,
  validateSlideConfig,
  type SlideConfig
} from '../src/slides/index';
import { getTheme } from '../src/core/theme/themes';
import { validateSlideBuildResult } from '../src/styleValidator';
import {
  EnhancedPresentationSchema,
  type EnhancedPresentation
} from '../src/schema';

describe.skip('Enhanced Slide Generation Integration (skipped in unit CI)', () => {
  describe('Complete Presentation Generation', () => {
    it('should generate a complete business presentation', () => {
      const presentation: EnhancedPresentation = {
        slides: [
          {
            type: 'title',
            title: 'Digital Transformation Strategy',
            subtitle: 'Accelerating Growth Through Innovation',
            author: 'Sarah Johnson, CTO',
            organization: 'TechForward Inc.',
            date: 'March 2024'
          },
          {
            type: 'bullets',
            title: 'Strategic Objectives',
            subtitle: 'Key Focus Areas for 2024',
            bullets: [
              'Modernize legacy systems and infrastructure',
              'Implement AI-driven automation solutions',
              'Enhance customer experience platforms',
              'Strengthen cybersecurity frameworks',
              'Build data analytics capabilities'
            ]
          },
          {
            type: 'twoColumn',
            title: 'Current vs Future State',
            leftColumn: {
              type: 'text',
              content: 'Current challenges and limitations in our technology stack.',
              bullets: [
                'Manual processes slow operations',
                'Siloed data systems',
                'Limited scalability',
                'High maintenance costs'
              ]
            },
            rightColumn: {
              type: 'text',
              content: 'Vision for integrated, automated, and scalable technology ecosystem.',
              bullets: [
                'Automated workflow management',
                'Unified data platform',
                'Cloud-native architecture',
                'Reduced operational overhead'
              ]
            }
          },
          {
            type: 'metrics',
            title: 'Expected ROI and Impact',
            subtitle: 'Projected outcomes within 18 months',
            metrics: [
              {
                value: '40%',
                label: 'Cost Reduction',
                description: 'Operational efficiency gains',
                trend: { direction: 'up', percentage: 40, period: 'projected' },
                color: 'success'
              },
              {
                value: '2.5x',
                label: 'Processing Speed',
                description: 'Automation improvements',
                trend: { direction: 'up', percentage: 150, period: 'projected' },
                color: 'primary'
              },
              {
                value: '99.9%',
                label: 'System Uptime',
                description: 'Reliability target',
                color: 'info'
              },
              {
                value: '$1.2M',
                label: 'Annual Savings',
                description: 'Cost optimization',
                trend: { direction: 'up', percentage: 120, period: 'projected' },
                color: 'success'
              }
            ],
            layout: 'grid',
            maxPerRow: 2,
            showTrends: true
          }
        ],
        theme: 'executive',
        metadata: {
          title: 'Digital Transformation Strategy',
          description: 'Comprehensive strategy for modernizing technology infrastructure',
          audience: 'executives',
          duration: 15,
          tags: ['strategy', 'technology', 'transformation']
        },
        options: {
          async: false,
          includeNotes: true,
          generateImages: false,
          optimizeForPrint: false,
          accessibilityMode: true
        }
      };

      // Validate the presentation schema
      const validationResult = EnhancedPresentationSchema.safeParse(presentation);
      expect(validationResult.success).toBe(true);

      // Generate all slides
      const theme = getTheme(presentation.theme);
      const generatedSlides = presentation.slides.map((slideConfig, index) => {
        const configValidation = validateSlideConfig(slideConfig.type, slideConfig);
        expect(configValidation.valid).toBe(true);

        const slideResult = buildSlide(slideConfig.type, slideConfig, theme);
        expect(slideResult).toBeDefined();
        expect(slideResult.metadata.errors).toHaveLength(0);

        const qualityValidation = validateSlideBuildResult(slideResult, theme);
        expect(qualityValidation.score).toBeGreaterThan(70);

        return {
          index,
          config: slideConfig,
          result: slideResult,
          validation: qualityValidation
        };
      });

      // Verify presentation quality
      const averageScore = generatedSlides.reduce((sum, slide) =>
        sum + slide.validation.score, 0) / generatedSlides.length;

      expect(averageScore).toBeGreaterThan(75);
      expect(generatedSlides).toHaveLength(4);

      // Verify slide types are correctly generated
      expect(generatedSlides[0].config.type).toBe('title');
      expect(generatedSlides[1].config.type).toBe('bullets');
      expect(generatedSlides[2].config.type).toBe('twoColumn');
      expect(generatedSlides[3].config.type).toBe('metrics');
    });

    it('should handle different themes consistently', () => {
      const slideConfig: SlideConfig = {
        type: 'bullets',
        title: 'Theme Consistency Test',
        bullets: [
          'Professional typography and spacing',
          'Consistent color application',
          'Proper visual hierarchy',
          'Accessible design standards'
        ]
      };

      const themes = ['neutral', 'executive', 'colorPop'] as const;

      themes.forEach(themeName => {
        const theme = getTheme(themeName);
        const result = buildSlide(slideConfig.type, slideConfig, theme);
        const validation = validateSlideBuildResult(result, theme);

        expect(validation.isValid).toBe(true);
        expect(validation.score).toBeGreaterThan(70);
        expect(result.metadata.errors).toHaveLength(0);
      });
    });
  });

  describe('Error Handling and Validation', () => {
    it('should handle invalid slide configurations gracefully', () => {
      const invalidConfig = {
        type: 'bullets',
        title: '', // Invalid: empty title
        bullets: [] // Invalid: empty bullets array
      };

      const validation = validateSlideConfig('bullets', invalidConfig);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should provide meaningful error messages', () => {
      const invalidConfig = {
        type: 'twoColumn',
        title: 'Test',
        // Missing required columns
      };

      const validation = validateSlideConfig('twoColumn', invalidConfig);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain(
        expect.stringContaining('leftColumn and rightColumn are required')
      );
    });

    it('should handle edge cases in content length', () => {
      const extremeConfig: SlideConfig = {
        type: 'bullets',
        title: 'A'.repeat(200), // Very long title
        bullets: [
          'This is an extremely long bullet point that contains way too many words and should trigger warnings about readability and comprehension issues for the audience members who will be viewing this presentation slide',
          'Short',
          'Another reasonable bullet point'
        ]
      };

      const theme = getTheme('neutral');
      const result = buildSlide(extremeConfig.type, extremeConfig, theme);

      expect(result.metadata.warnings.length).toBeGreaterThan(0);
      expect(result.metadata.warnings).toContain(
        expect.stringContaining('long')
      );
    });
  });

  describe('Performance and Quality Benchmarks', () => {
    it('should generate slides within performance targets', () => {
      const config: SlideConfig = {
        type: 'metrics',
        title: 'Performance Test Dashboard',
        metrics: Array.from({ length: 8 }, (_, i) => ({
          value: `${(i + 1) * 100}`,
          label: `Metric ${i + 1}`,
          description: `Test metric number ${i + 1}`,
          color: 'primary' as const
        }))
      };

      const startTime = Date.now();
      const theme = getTheme('neutral');
      const result = buildSlide(config.type, config, theme);
      const endTime = Date.now();

      const generationTime = endTime - startTime;
      expect(generationTime).toBeLessThan(1000); // Should complete within 1 second
      expect(result.metadata.shapeCount).toBeGreaterThan(8); // Title + metrics
    });

    it('should maintain quality standards across slide types', () => {
      const slideConfigs: SlideConfig[] = [
        {
          type: 'title',
          title: 'Quality Assurance Test',
          subtitle: 'Ensuring Professional Standards'
        },
        {
          type: 'bullets',
          title: 'Quality Metrics',
          bullets: [
            'Typography meets professional standards',
            'Layout follows grid system principles',
            'Colors provide adequate contrast',
            'Content is accessible and readable'
          ]
        },
        {
          type: 'twoColumn',
          title: 'Quality Comparison',
          leftColumn: {
            type: 'text',
            content: 'Before quality improvements were implemented.'
          },
          rightColumn: {
            type: 'text',
            content: 'After implementing comprehensive quality standards.'
          }
        }
      ];

      const theme = getTheme('executive');
      const qualityScores = slideConfigs.map(config => {
        const result = buildSlide(config.type, config, theme);
        const validation = validateSlideBuildResult(result, theme);
        return validation.score;
      });

      const averageQuality = qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length;
      expect(averageQuality).toBeGreaterThan(80); // High quality standard

      // All slides should meet minimum quality threshold
      qualityScores.forEach(score => {
        expect(score).toBeGreaterThan(70);
      });
    });
  });
});