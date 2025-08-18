/**
 * Real-World Testing Framework
 * Tests the actual full flow including API endpoints and PowerPoint generation
 */

import { logger } from './smartLogger';
import fs from 'fs/promises';
import path from 'path';
import { SlideSpec } from '../schema';

export interface RealWorldTest {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  requestBody: any;
  expectedStatus: number;
  themeId: string;
  markupSlides?: boolean;
}

export interface RealWorldTestResult {
  testId: string;
  passed: boolean;
  statusCode: number;
  responseTime: number;
  fileSize: number;
  hasValidSignature: boolean;
  errorDetails?: string;
  responseHeaders?: Record<string, string>;
  markupGenerated?: boolean;
}

export class RealWorldTestRunner {
  private outputDir: string;
  private baseUrl: string;
  
  constructor(outputDir: string = './real-world-test-output', baseUrl: string = 'http://127.0.0.1:5001/plsfixthx-ai/us-central1/api') {
    this.outputDir = outputDir;
    this.baseUrl = baseUrl;
  }

  /**
   * Get comprehensive real-world test scenarios
   */
  static getRealWorldTests(): RealWorldTest[] {
    return [
      {
        id: 'real-basic-corporate',
        name: 'Basic Corporate Presentation',
        description: 'Simple 3-slide presentation with corporate theme',
        endpoint: '/generate',
        themeId: 'corporate-blue',
        markupSlides: true,
        requestBody: {
          spec: [
            {
              title: 'Q4 Business Review',
              layout: 'title',
              paragraph: 'Strategic Overview and Performance Analysis'
            },
            {
              title: 'Key Achievements',
              layout: 'title-bullets',
              bullets: [
                'Revenue growth of 28% year-over-year',
                'Customer satisfaction improved to 95%',
                'Market share increased to 18%'
              ]
            },
            {
              title: 'Financial Summary',
              layout: 'comparison-table',
              comparisonTable: {
                headers: ['Metric', 'Q3', 'Q4', 'Growth'],
                rows: [
                  ['Revenue', '$2.5M', '$3.2M', '+28%'],
                  ['Customers', '1,200', '1,800', '+50%']
                ]
              }
            }
          ],
          themeId: 'corporate-blue',
          withValidation: true
        },
        expectedStatus: 200
      },
      {
        id: 'real-complex-modern',
        name: 'Complex Modern Presentation',
        description: 'Multi-slide presentation with charts and modern theme',
        endpoint: '/generate',
        themeId: 'modern-gradient',
        markupSlides: true,
        requestBody: {
          spec: [
            {
              title: 'Launch Success: New Product Revenue Growth',
              layout: 'title',
              paragraph: 'Comprehensive Analysis of Market Performance'
            },
            {
              title: 'Revenue Performance',
              layout: 'chart',
              chart: {
                type: 'bar',
                title: 'Quarterly Revenue ($M)',
                categories: ['Q1', 'Q2', 'Q3', 'Q4'],
                series: [
                  {
                    name: 'Revenue ($M)',
                    data: [2.1, 2.3, 2.5, 3.2]
                  }
                ]
              }
            },
            {
              title: 'Market Analysis',
              layout: 'two-column',
              left: {
                title: 'Growth Drivers',
                bullets: [
                  'New product launch success',
                  'Improved customer retention',
                  'Market expansion initiatives'
                ]
              },
              right: {
                title: 'Key Metrics',
                bullets: [
                  'Customer LTV: $1,450 (+16%)',
                  'CAC Ratio: 4.1:1 (+28%)',
                  'Churn Rate: 3.8% (-27%)'
                ]
              }
            }
          ],
          themeId: 'modern-gradient',
          withValidation: true
        },
        expectedStatus: 200
      },
      {
        id: 'real-failing-content',
        name: 'Previously Failing Content',
        description: 'Content that previously caused corruption',
        endpoint: '/generate',
        themeId: 'tech-innovation',
        markupSlides: true,
        requestBody: {
          spec: [
            {
              title: 'Launch Success: New Product to Drive 25% Revenue Growth',
              layout: 'title',
              paragraph: 'Strategic Initiative Overview & Financial Impact Analysis'
            },
            {
              title: 'Q4 Review: 30% Revenue Growth Drives $3.5M Success',
              layout: 'title-bullets',
              bullets: [
                'Revenue increased by 30% year-over-year ($2.5M → $3.2M)',
                'Customer base expanded by 50% (1,200 → 1,800 customers)',
                'Market share grew from 15% to 18% (+3 percentage points)',
                'Customer satisfaction improved to 95% (industry benchmark: 87%)',
                'Employee retention rate: 92% vs industry average of 85%'
              ]
            },
            {
              title: 'Financial Performance Metrics',
              layout: 'comparison-table',
              comparisonTable: {
                headers: ['Metric', 'Q3 2023', 'Q4 2023', 'Growth %'],
                rows: [
                  ['Total Revenue', '$2.5M', '$3.2M', '+28%'],
                  ['Gross Profit', '$1.0M', '$1.4M', '+40%'],
                  ['Customer LTV', '$1,250', '$1,450', '+16%'],
                  ['CAC Ratio', '3.2:1', '4.1:1', '+28%']
                ]
              }
            }
          ],
          themeId: 'tech-innovation',
          withValidation: true
        },
        expectedStatus: 200
      },
      {
        id: 'real-professional-endpoint',
        name: 'Professional Endpoint Test',
        description: 'Test the /generate/professional endpoint',
        endpoint: '/generate/professional',
        themeId: 'consulting-charcoal',
        markupSlides: true,
        requestBody: {
          spec: [
            {
              title: 'Executive Dashboard',
              layout: 'title',
              paragraph: 'Comprehensive Business Performance Overview'
            },
            {
              title: 'Key Performance Indicators',
              layout: 'title-bullets',
              bullets: [
                'Revenue: $3.2M (+28% YoY)',
                'Profit Margin: 25% (+5pp)',
                'Customer Satisfaction: 95%',
                'Market Share: 18% (+3pp)'
              ]
            }
          ],
          themeId: 'consulting-charcoal',
          colorPalette: 'corporate',
          quality: 'high',
          withValidation: true
        },
        expectedStatus: 200
      }
    ];
  }

  /**
   * Run comprehensive real-world tests
   */
  async runRealWorldTests(): Promise<RealWorldTestResult[]> {
    logger.info('Starting real-world testing of full PowerPoint generation flow');
    
    await this.ensureOutputDir();
    const tests = RealWorldTestRunner.getRealWorldTests();
    const results: RealWorldTestResult[] = [];
    
    for (const test of tests) {
      logger.info(`Running real-world test: ${test.name}`);
      
      try {
        const result = await this.runSingleRealWorldTest(test);
        results.push(result);
        
        if (result.passed) {
          await this.saveTestFile(test, result);
          if (test.markupSlides) {
            await this.generateMarkupSlides(test);
          }
        }
        
        const status = result.passed ? '✅ PASSED' : '❌ FAILED';
        logger.info(`Real-world test ${test.id}: ${status} (${result.responseTime}ms, ${Math.round(result.fileSize/1024)}KB)`);
        
        if (!result.passed && result.errorDetails) {
          logger.warn(`Test failure details:`, { error: result.errorDetails });
        }
        
      } catch (error) {
        logger.error(`Real-world test ${test.id} failed with error:`, { error });
        results.push({
          testId: test.id,
          passed: false,
          statusCode: 0,
          responseTime: 0,
          fileSize: 0,
          hasValidSignature: false,
          errorDetails: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    return results;
  }

  private async runSingleRealWorldTest(test: RealWorldTest): Promise<RealWorldTestResult> {
    const startTime = Date.now();
    
    try {
      // Make actual HTTP request to the API
      const response = await fetch(`${this.baseUrl}${test.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(test.requestBody)
      });
      
      const responseTime = Date.now() - startTime;
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      
      if (response.status === test.expectedStatus && response.ok) {
        const buffer = Buffer.from(await response.arrayBuffer());
        const hasValidSignature = this.validateZipSignature(buffer);
        
        return {
          testId: test.id,
          passed: hasValidSignature && buffer.length > 1000,
          statusCode: response.status,
          responseTime,
          fileSize: buffer.length,
          hasValidSignature,
          responseHeaders
        };
      } else {
        const errorText = await response.text();
        return {
          testId: test.id,
          passed: false,
          statusCode: response.status,
          responseTime,
          fileSize: 0,
          hasValidSignature: false,
          errorDetails: `HTTP ${response.status}: ${errorText}`,
          responseHeaders
        };
      }
      
    } catch (error) {
      return {
        testId: test.id,
        passed: false,
        statusCode: 0,
        responseTime: Date.now() - startTime,
        fileSize: 0,
        hasValidSignature: false,
        errorDetails: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private async generateMarkupSlides(test: RealWorldTest): Promise<void> {
    try {
      // Generate marked-up slides for analysis
      const markupSpecs = test.requestBody.spec.map((slide: any, index: number) => ({
        ...slide,
        title: `[TEST-${test.id.toUpperCase()}] ${slide.title}`,
        paragraph: slide.paragraph ? `[SLIDE-${index + 1}] ${slide.paragraph}` : slide.paragraph,
        bullets: slide.bullets ? slide.bullets.map((bullet: string, i: number) => `[B${i + 1}] ${bullet}`) : slide.bullets
      }));

      const markupRequestBody = {
        ...test.requestBody,
        spec: markupSpecs
      };

      const response = await fetch(`${this.baseUrl}${test.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(markupRequestBody)
      });

      if (response.ok) {
        const buffer = Buffer.from(await response.arrayBuffer());
        const filename = `${test.id}-markup.pptx`;
        const filepath = path.join(this.outputDir, filename);
        await fs.writeFile(filepath, buffer);
        
        logger.info(`Generated markup slides for analysis: ${filepath}`);
      }
    } catch (error) {
      logger.warn(`Failed to generate markup slides for ${test.id}:`, { error });
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

  private async saveTestFile(test: RealWorldTest, result: RealWorldTestResult): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}${test.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(test.requestBody)
      });

      if (response.ok) {
        const buffer = Buffer.from(await response.arrayBuffer());
        const filename = `${test.id}.pptx`;
        const filepath = path.join(this.outputDir, filename);
        await fs.writeFile(filepath, buffer);
        
        logger.debug(`Saved real-world test file: ${filepath}`);
      }
    } catch (error) {
      logger.warn(`Failed to save test file for ${test.id}:`, { error });
    }
  }
}
