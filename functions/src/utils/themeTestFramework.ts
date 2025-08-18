/**
 * Theme-Specific Testing Framework
 * Investigates theme combinations that might cause corruption
 */

import { generateSimplePpt } from '../pptGenerator-simple';
import { logger } from './smartLogger';
import fs from 'fs/promises';
import path from 'path';

export interface ThemeTest {
  id: string;
  name: string;
  description: string;
  themeId: string;
  features: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ThemeTestResult {
  testId: string;
  themeId: string;
  passed: boolean;
  fileSize: number;
  hasValidSignature: boolean;
  generationTime: number;
  features: string[];
  errorDetails?: string;
}

export class ThemeTestRunner {
  private outputDir: string;
  
  constructor(outputDir: string = './theme-test-output') {
    this.outputDir = outputDir;
  }

  /**
   * Get all available theme tests
   */
  static getAllThemeTests(): ThemeTest[] {
    const baseFeatures = ['title-slide', 'bullet-points', 'speaker-notes'];
    const advancedFeatures = ['charts', 'tables', 'shapes', 'backgrounds'];
    
    return [
      // Basic theme tests
      {
        id: 'theme-corporate-basic',
        name: 'Corporate Blue - Basic Features',
        description: 'Test corporate-blue theme with basic features',
        themeId: 'corporate-blue',
        features: baseFeatures,
        riskLevel: 'low'
      },
      {
        id: 'theme-corporate-advanced',
        name: 'Corporate Blue - Advanced Features',
        description: 'Test corporate-blue theme with all features',
        themeId: 'corporate-blue',
        features: [...baseFeatures, ...advancedFeatures],
        riskLevel: 'medium'
      },
      
      // Modern theme tests (potential gradient issues)
      {
        id: 'theme-modern-basic',
        name: 'Modern Gradient - Basic Features',
        description: 'Test modern-gradient theme with basic features',
        themeId: 'modern-gradient',
        features: baseFeatures,
        riskLevel: 'high'
      },
      {
        id: 'theme-modern-advanced',
        name: 'Modern Gradient - Advanced Features',
        description: 'Test modern-gradient theme with all features',
        themeId: 'modern-gradient',
        features: [...baseFeatures, ...advancedFeatures],
        riskLevel: 'high'
      },
      
      // Tech theme tests
      {
        id: 'theme-tech-basic',
        name: 'Tech Innovation - Basic Features',
        description: 'Test tech-innovation theme with basic features',
        themeId: 'tech-innovation',
        features: baseFeatures,
        riskLevel: 'medium'
      },
      {
        id: 'theme-tech-advanced',
        name: 'Tech Innovation - Advanced Features',
        description: 'Test tech-innovation theme with all features',
        themeId: 'tech-innovation',
        features: [...baseFeatures, ...advancedFeatures],
        riskLevel: 'medium'
      },
      
      // Consulting theme tests
      {
        id: 'theme-consulting-basic',
        name: 'Consulting Charcoal - Basic Features',
        description: 'Test consulting-charcoal theme with basic features',
        themeId: 'consulting-charcoal',
        features: baseFeatures,
        riskLevel: 'low'
      },
      {
        id: 'theme-consulting-advanced',
        name: 'Consulting Charcoal - Advanced Features',
        description: 'Test consulting-charcoal theme with all features',
        themeId: 'consulting-charcoal',
        features: [...baseFeatures, ...advancedFeatures],
        riskLevel: 'medium'
      },
      
      // Creative theme tests
      {
        id: 'theme-creative-basic',
        name: 'Creative Teal - Basic Features',
        description: 'Test creative-teal theme with basic features',
        themeId: 'creative-teal',
        features: baseFeatures,
        riskLevel: 'medium'
      },
      {
        id: 'theme-creative-advanced',
        name: 'Creative Teal - Advanced Features',
        description: 'Test creative-teal theme with all features',
        themeId: 'creative-teal',
        features: [...baseFeatures, ...advancedFeatures],
        riskLevel: 'high'
      },
      
      // Financial theme tests
      {
        id: 'theme-financial-basic',
        name: 'Financial Green - Basic Features',
        description: 'Test financial-green theme with basic features',
        themeId: 'financial-green',
        features: baseFeatures,
        riskLevel: 'low'
      },
      {
        id: 'theme-financial-advanced',
        name: 'Financial Green - Advanced Features',
        description: 'Test financial-green theme with all features',
        themeId: 'financial-green',
        features: [...baseFeatures, ...advancedFeatures],
        riskLevel: 'medium'
      }
    ];
  }

  /**
   * Run comprehensive theme testing
   */
  async runThemeTests(): Promise<ThemeTestResult[]> {
    logger.info('Starting comprehensive theme testing');
    
    await this.ensureOutputDir();
    const tests = ThemeTestRunner.getAllThemeTests();
    const results: ThemeTestResult[] = [];
    
    for (const test of tests) {
      logger.info(`Testing theme: ${test.themeId} with features: ${test.features.join(', ')}`);
      
      try {
        const result = await this.runSingleThemeTest(test);
        results.push(result);
        
        if (result.passed) {
          await this.saveThemeTestFile(test, result);
        }
        
        const status = result.passed ? '✅ PASSED' : '❌ FAILED';
        logger.info(`Theme test ${test.id}: ${status} (${result.generationTime}ms, ${Math.round(result.fileSize/1024)}KB)`);
        
        if (!result.passed && result.errorDetails) {
          logger.warn(`Theme test failure details:`, { error: result.errorDetails });
        }
        
      } catch (error) {
        logger.error(`Theme test ${test.id} failed with error:`, { error });
        results.push({
          testId: test.id,
          themeId: test.themeId,
          passed: false,
          fileSize: 0,
          hasValidSignature: false,
          generationTime: 0,
          features: test.features,
          errorDetails: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    return results;
  }

  private async runSingleThemeTest(test: ThemeTest): Promise<ThemeTestResult> {
    const startTime = Date.now();
    
    try {
      // Create test slides based on features
      const specs = this.createTestSlides(test.features);
      
      const options = {
        themeId: test.themeId,
        includeSpeakerNotes: test.features.includes('speaker-notes'),
        includeCharts: test.features.includes('charts'),
        includeTables: test.features.includes('tables')
      };
      
      // Generate presentation using actual generator
      const buffer = await generateSimplePpt(specs, options.themeId, {
        includeSpeakerNotes: options.includeSpeakerNotes,
        includeMetadata: true
      });
      
      const generationTime = Date.now() - startTime;
      const hasValidSignature = this.validateZipSignature(buffer);
      
      return {
        testId: test.id,
        themeId: test.themeId,
        passed: hasValidSignature && buffer.length > 1000,
        fileSize: buffer.length,
        hasValidSignature,
        generationTime,
        features: test.features
      };
      
    } catch (error) {
      return {
        testId: test.id,
        themeId: test.themeId,
        passed: false,
        fileSize: 0,
        hasValidSignature: false,
        generationTime: Date.now() - startTime,
        features: test.features,
        errorDetails: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private createTestSlides(features: string[]): any[] {
    const slides = [];
    
    // Title slide
    if (features.includes('title-slide')) {
      slides.push({
        title: 'Theme Testing Presentation',
        layout: 'title',
        paragraph: 'Comprehensive theme compatibility testing',
        notes: features.includes('speaker-notes') ? 'This is a test presentation to validate theme compatibility and identify potential corruption issues.' : undefined
      });
    }
    
    // Bullet points slide
    if (features.includes('bullet-points')) {
      slides.push({
        title: 'Key Features Testing',
        layout: 'title-bullets',
        bullets: [
          'Theme color scheme validation',
          'Typography and font rendering',
          'Layout consistency and spacing',
          'Background and accent elements',
          'Professional design standards'
        ],
        notes: features.includes('speaker-notes') ? 'This slide tests bullet point formatting and theme-specific styling elements.' : undefined
      });
    }
    
    // Chart slide
    if (features.includes('charts')) {
      slides.push({
        title: 'Performance Metrics',
        layout: 'chart',
        chartData: {
          type: 'bar',
          title: 'Theme Performance Test',
          data: [
            { name: 'Compatibility', value: 95 },
            { name: 'Performance', value: 88 },
            { name: 'Design Quality', value: 92 },
            { name: 'User Experience', value: 90 }
          ]
        },
        notes: features.includes('speaker-notes') ? 'Chart testing validates theme color application and data visualization compatibility.' : undefined
      });
    }
    
    // Table slide
    if (features.includes('tables')) {
      slides.push({
        title: 'Detailed Analysis',
        layout: 'comparison-table',
        tableData: {
          headers: ['Feature', 'Status', 'Performance', 'Notes'],
          rows: [
            ['Color Scheme', 'Validated', '95%', 'All colors render correctly'],
            ['Typography', 'Validated', '92%', 'Fonts display properly'],
            ['Layouts', 'Validated', '88%', 'Spacing and alignment good'],
            ['Backgrounds', 'Testing', '90%', 'Background elements stable']
          ]
        },
        notes: features.includes('speaker-notes') ? 'Table testing ensures proper theme application to structured data presentation.' : undefined
      });
    }
    
    return slides;
  }

  private validateZipSignature(buffer: Buffer): boolean {
    if (buffer.length < 4) return false;
    const signature = buffer.subarray(0, 4);
    const expectedSignature = Buffer.from([0x50, 0x4B, 0x03, 0x04]);
    return signature.equals(expectedSignature);
  }

  private async ensureOutputDir(): Promise<void> {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  private async saveThemeTestFile(test: ThemeTest, result: ThemeTestResult): Promise<void> {
    try {
      const specs = this.createTestSlides(test.features);
      const options = {
        themeId: test.themeId,
        includeSpeakerNotes: test.features.includes('speaker-notes'),
        includeCharts: test.features.includes('charts'),
        includeTables: test.features.includes('tables')
      };
      
      const buffer = await generateSimplePpt(specs, options.themeId, {
        includeSpeakerNotes: options.includeSpeakerNotes,
        includeMetadata: true
      });
      
      const filename = `${test.id}.pptx`;
      const filepath = path.join(this.outputDir, filename);
      await fs.writeFile(filepath, buffer);
      
      logger.debug(`Saved theme test file: ${filepath}`);
    } catch (error) {
      logger.warn(`Failed to save theme test file for ${test.id}:`, { error });
    }
  }
}
