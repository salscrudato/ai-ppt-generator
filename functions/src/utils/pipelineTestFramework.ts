/**
 * Pipeline Testing Framework
 * Tests that exactly mimic the actual data processing pipeline
 */

import { generateSimplePpt } from '../pptGenerator-simple';
import { logger } from './smartLogger';
import fs from 'fs/promises';
import path from 'path';

export interface PipelineTest {
  id: string;
  name: string;
  description: string;
  inputData: any;
  options: any;
  expectedResult: 'pass' | 'fail' | 'unknown';
}

export interface PipelineTestResult {
  testId: string;
  passed: boolean;
  fileSize: number;
  hasValidSignature: boolean;
  generationTime: number;
  errorDetails?: string;
  powerPointCompatible?: boolean;
}

export class PipelineTestRunner {
  private outputDir: string;
  
  constructor(outputDir: string = './pipeline-test-output') {
    this.outputDir = outputDir;
  }

  /**
   * Test 1: Exact API Call Simulation
   */
  static getAPICallTests(): PipelineTest[] {
    return [
      {
        id: 'pipeline-api-basic',
        name: 'Basic API Call Simulation',
        description: 'Simulate exact API call with minimal data',
        inputData: {
          topic: 'Q4 Business Review',
          slides: [
            {
              title: 'Q4 Review: 30% Revenue Growth Drives $3.5M Success',
              content: 'Key achievements this quarter',
              layout: 'title-bullets',
              bullets: [
                'Revenue increased by 30% year-over-year',
                'Customer satisfaction improved to 95%',
                'Market share increased to 18%'
              ]
            }
          ]
        },
        options: {
          themeId: 'corporate-blue',
          includeSpeakerNotes: true,
          includeCharts: false,
          includeTables: false
        },
        expectedResult: 'pass'
      },
      {
        id: 'pipeline-api-complex',
        name: 'Complex API Call Simulation',
        description: 'Simulate complex API call with charts and tables',
        inputData: {
          topic: 'Launch Success: New Product to Drive 25% Revenue Growth',
          slides: [
            {
              title: 'Launch Success: New Product to Drive 25% Revenue Growth',
              content: 'Strategic Initiative Overview',
              layout: 'title',
              notes: 'Welcome to our launch success presentation covering strategic initiatives.'
            },
            {
              title: 'Revenue Performance Analysis',
              content: 'Financial metrics and growth indicators',
              layout: 'chart',
              chartData: {
                type: 'bar',
                title: 'Quarterly Revenue ($M)',
                data: [
                  { name: 'Q1', value: 2.1 },
                  { name: 'Q2', value: 2.3 },
                  { name: 'Q3', value: 2.5 },
                  { name: 'Q4', value: 3.2 }
                ]
              }
            },
            {
              title: 'Financial Summary',
              content: 'Detailed performance metrics',
              layout: 'comparison-table',
              tableData: {
                headers: ['Metric', 'Q3 2023', 'Q4 2023', 'Growth'],
                rows: [
                  ['Revenue ($M)', '2.5', '3.2', '+28%'],
                  ['Customers', '1,200', '1,800', '+50%'],
                  ['Market Share (%)', '15%', '18%', '+3pp']
                ]
              }
            }
          ]
        },
        options: {
          themeId: 'corporate-blue',
          includeSpeakerNotes: true,
          includeCharts: true,
          includeTables: true
        },
        expectedResult: 'unknown'
      }
    ];
  }

  /**
   * Test 2: Theme-Specific Pipeline Tests
   */
  static getThemePipelineTests(): PipelineTest[] {
    const baseSlides = [
      {
        title: 'Q4 Review: 30% Revenue Growth Drives $3.5M Success',
        content: 'Executive Summary',
        layout: 'title-bullets',
        bullets: [
          'Revenue exceeded targets by 28%',
          'Customer base grew by 50%',
          'Market share increased to 18%'
        ]
      }
    ];

    return [
      {
        id: 'pipeline-theme-corporate',
        name: 'Corporate Theme Pipeline',
        description: 'Test with corporate-blue theme',
        inputData: { topic: 'Corporate Presentation', slides: baseSlides },
        options: { themeId: 'corporate-blue', includeSpeakerNotes: true },
        expectedResult: 'pass'
      },
      {
        id: 'pipeline-theme-modern',
        name: 'Modern Theme Pipeline',
        description: 'Test with modern-gradient theme (potential issue)',
        inputData: { topic: 'Modern Presentation', slides: baseSlides },
        options: { themeId: 'modern-gradient', includeSpeakerNotes: true },
        expectedResult: 'unknown'
      },
      {
        id: 'pipeline-theme-tech',
        name: 'Tech Theme Pipeline',
        description: 'Test with tech-innovation theme',
        inputData: { topic: 'Tech Presentation', slides: baseSlides },
        options: { themeId: 'tech-innovation', includeSpeakerNotes: true },
        expectedResult: 'pass'
      },
      {
        id: 'pipeline-theme-consulting',
        name: 'Consulting Theme Pipeline',
        description: 'Test with consulting-charcoal theme',
        inputData: { topic: 'Consulting Presentation', slides: baseSlides },
        options: { themeId: 'consulting-charcoal', includeSpeakerNotes: true },
        expectedResult: 'pass'
      }
    ];
  }

  /**
   * Test 3: Data Volume and Complexity Tests
   */
  static getDataVolumeTests(): PipelineTest[] {
    return [
      {
        id: 'pipeline-volume-large',
        name: 'Large Data Volume Test',
        description: 'Test with large amount of content',
        inputData: {
          topic: 'Comprehensive Business Analysis with Extensive Data and Multiple Metrics',
          slides: Array.from({ length: 15 }, (_, i) => ({
            title: `Section ${i + 1}: Detailed Analysis of Performance Metrics and Strategic Initiatives`,
            content: `Comprehensive overview of business performance indicators, market analysis, competitive positioning, and strategic recommendations for sustainable growth and market expansion in the upcoming fiscal period.`,
            layout: i % 4 === 0 ? 'title' : i % 4 === 1 ? 'title-bullets' : i % 4 === 2 ? 'chart' : 'comparison-table',
            bullets: i % 4 === 1 ? [
              'Revenue growth exceeded industry benchmarks by 15-20%',
              'Customer acquisition costs decreased by 22% through optimization',
              'Market share expansion in three key geographic regions',
              'Product portfolio diversification yielded 35% increase in cross-selling',
              'Employee satisfaction scores improved to 92% (industry average: 78%)',
              'Operational efficiency gains of 18% through process automation',
              'Customer lifetime value increased by 28% through retention programs'
            ] : undefined,
            chartData: i % 4 === 2 ? {
              type: 'bar',
              title: `Performance Metrics - Quarter ${Math.floor(i/4) + 1}`,
              data: [
                { name: 'Revenue', value: 2.5 + (i * 0.3) },
                { name: 'Profit', value: 0.8 + (i * 0.1) },
                { name: 'Growth', value: 15 + (i * 2) }
              ]
            } : undefined,
            tableData: i % 4 === 3 ? {
              headers: ['Metric', 'Current', 'Target', 'Status'],
              rows: [
                [`Revenue Q${i}`, `$${2.5 + i}M`, `$${3.0 + i}M`, 'On Track'],
                [`Customers`, `${1200 + i * 100}`, `${1500 + i * 100}`, 'Exceeded'],
                [`Satisfaction`, `${85 + i}%`, `90%`, 'Achieved']
              ]
            } : undefined,
            notes: `Detailed speaker notes for slide ${i + 1} covering strategic implications, implementation timelines, resource requirements, risk mitigation strategies, and expected outcomes for this particular section of the business analysis.`
          }))
        },
        options: {
          themeId: 'corporate-blue',
          includeSpeakerNotes: true,
          includeCharts: true,
          includeTables: true
        },
        expectedResult: 'unknown'
      }
    ];
  }

  /**
   * Run pipeline tests
   */
  async runPipelineTests(): Promise<PipelineTestResult[]> {
    logger.info('Starting pipeline testing that mimics actual data processing');
    
    await this.ensureOutputDir();
    const allTests = [
      ...PipelineTestRunner.getAPICallTests(),
      ...PipelineTestRunner.getThemePipelineTests(),
      ...PipelineTestRunner.getDataVolumeTests()
    ];
    
    const results: PipelineTestResult[] = [];
    
    for (const test of allTests) {
      logger.info(`Running pipeline test: ${test.name}`);
      
      try {
        const result = await this.runSinglePipelineTest(test);
        results.push(result);
        
        if (result.passed) {
          await this.savePipelineTestFile(test, result);
        }
        
        logger.info(`Pipeline test ${test.id}: ${result.passed ? 'PASSED' : 'FAILED'} (${result.generationTime}ms)`);
      } catch (error) {
        logger.error(`Pipeline test ${test.id} failed with error:`, { error });
        results.push({
          testId: test.id,
          passed: false,
          fileSize: 0,
          hasValidSignature: false,
          generationTime: 0,
          errorDetails: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    return results;
  }

  private async runSinglePipelineTest(test: PipelineTest): Promise<PipelineTestResult> {
    const startTime = Date.now();
    
    try {
      // Convert test data to the format expected by our generator
      const specs = test.inputData.slides.map((slide: any) => ({
        title: slide.title,
        layout: slide.layout || 'title-bullets',
        paragraph: slide.content,
        bullets: slide.bullets,
        chartData: slide.chartData,
        tableData: slide.tableData,
        notes: slide.notes
      }));
      
      // Call the actual generator function
      const buffer = await generateSimplePpt(specs, test.options.themeId, {
        includeSpeakerNotes: test.options.includeSpeakerNotes,
        includeMetadata: true
      });
      
      const generationTime = Date.now() - startTime;
      const hasValidSignature = this.validateZipSignature(buffer);
      
      return {
        testId: test.id,
        passed: hasValidSignature && buffer.length > 1000,
        fileSize: buffer.length,
        hasValidSignature,
        generationTime
      };
      
    } catch (error) {
      return {
        testId: test.id,
        passed: false,
        fileSize: 0,
        hasValidSignature: false,
        generationTime: Date.now() - startTime,
        errorDetails: error instanceof Error ? error.message : String(error)
      };
    }
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

  private async savePipelineTestFile(test: PipelineTest, result: PipelineTestResult): Promise<void> {
    try {
      const specs = test.inputData.slides.map((slide: any) => ({
        title: slide.title,
        layout: slide.layout || 'title-bullets',
        paragraph: slide.content,
        bullets: slide.bullets,
        chartData: slide.chartData,
        tableData: slide.tableData,
        notes: slide.notes
      }));
      
      const buffer = await generateSimplePpt(specs, test.options.themeId, {
        includeSpeakerNotes: test.options.includeSpeakerNotes,
        includeMetadata: true
      });
      
      const filename = `${test.id}.pptx`;
      const filepath = path.join(this.outputDir, filename);
      await fs.writeFile(filepath, buffer);
      
      logger.debug(`Saved pipeline test file: ${filepath}`);
    } catch (error) {
      logger.warn(`Failed to save pipeline test file for ${test.id}:`, { error });
    }
  }
}
