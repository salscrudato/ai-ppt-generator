/**
 * Comprehensive PowerPoint Generation Test Suite
 * 10 End-to-End Tests with Innovative Debugging
 */

import { generatePpt } from '../pptGenerator-simple';
import { SlideSpec } from '../schema';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// Test request interface
interface TestRequest {
  topic: string;
  audience: string;
  tone: string;
  slideCount: number;
  design: { theme: string };
  includeImages?: boolean;
  includeCharts?: boolean;
}

// Enhanced debugging logger
class TestLogger {
  private testName: string;
  private logs: string[] = [];

  constructor(testName: string) {
    this.testName = testName;
  }

  log(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${this.testName}: ${message}`;
    if (data) {
      this.logs.push(`${logEntry}\n${JSON.stringify(data, null, 2)}`);
    } else {
      this.logs.push(logEntry);
    }
    console.log(logEntry, data || '');
  }

  error(message: string, error?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ❌ ${this.testName} ERROR: ${message}`;
    if (error) {
      this.logs.push(`${logEntry}\n${error.stack || error.toString()}`);
    } else {
      this.logs.push(logEntry);
    }
    console.error(logEntry, error || '');
  }

  success(message: string) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ✅ ${this.testName} SUCCESS: ${message}`;
    this.logs.push(logEntry);
    console.log(logEntry);
  }

  getLogs(): string {
    return this.logs.join('\n');
  }
}

// Test configurations with different complexity levels
const testConfigs = [
  {
    name: 'Test01_BasicTitleSlide',
    request: {
      topic: 'Company Overview',
      audience: 'executives',
      tone: 'professional',
      slideCount: 1,
      design: { theme: 'corporate-blue' }
    } as TestRequest
  },
  {
    name: 'Test02_SimpleThreeSlides',
    request: {
      topic: 'Marketing Strategy',
      audience: 'marketing team',
      tone: 'engaging',
      slideCount: 3,
      design: { theme: 'executive-dark' }
    } as TestRequest
  },
  {
    name: 'Test03_BulletsAndImages',
    request: {
      topic: 'Product Launch Plan',
      audience: 'stakeholders',
      tone: 'confident',
      slideCount: 4,
      design: { theme: 'platinum-elegance' },
      includeImages: true
    } as TestRequest
  },
  {
    name: 'Test04_ChartsAndData',
    request: {
      topic: 'Q4 Financial Results',
      audience: 'board members',
      tone: 'analytical',
      slideCount: 5,
      design: { theme: 'royal-authority' },
      includeCharts: true
    } as TestRequest
  },
  {
    name: 'Test05_TwoColumnLayout',
    request: {
      topic: 'Technology Roadmap',
      audience: 'technical team',
      tone: 'informative',
      slideCount: 3,
      design: { theme: 'ocean-breeze' }
    } as TestRequest
  },
  {
    name: 'Test06_TimelineProcess',
    request: {
      topic: 'Project Implementation Timeline',
      audience: 'project managers',
      tone: 'structured',
      slideCount: 4,
      design: { theme: 'forest-modern' }
    } as TestRequest
  },
  {
    name: 'Test07_QuoteAndComparison',
    request: {
      topic: 'Customer Success Stories',
      audience: 'sales team',
      tone: 'inspiring',
      slideCount: 3,
      design: { theme: 'peach-fuzz-2024' }
    } as TestRequest
  },
  {
    name: 'Test08_ComplexMixed',
    request: {
      topic: 'Annual Business Review',
      audience: 'all employees',
      tone: 'comprehensive',
      slideCount: 6,
      design: { theme: 'corporate-blue' },
      includeImages: true,
      includeCharts: true
    } as TestRequest
  },
  {
    name: 'Test09_MinimalDesign',
    request: {
      topic: 'Design Principles',
      audience: 'designers',
      tone: 'creative',
      slideCount: 2,
      design: { theme: 'platinum-elegance' }
    } as TestRequest
  },
  {
    name: 'Test10_StressTest',
    request: {
      topic: 'Comprehensive Company Analysis with Multiple Data Points and Complex Visualizations',
      audience: 'executive leadership team and board of directors',
      tone: 'authoritative and data-driven',
      slideCount: 8,
      design: { theme: 'executive-dark' },
      includeImages: true,
      includeCharts: true
    } as TestRequest
  }
];

// Helper function to create mock slide specs from test requests
function createMockSlideSpecs(request: TestRequest): SlideSpec[] {
  const specs: SlideSpec[] = [];

  for (let i = 0; i < request.slideCount; i++) {
    if (i === 0) {
      // Title slide
      specs.push({
        layout: 'title' as const,
        title: `${request.topic}`,
        paragraph: `A ${request.tone} presentation for ${request.audience}`
      });
    } else {
      // Content slides with different layouts
      const layouts = ['title-bullets', 'two-column', 'chart', 'quote', 'timeline'] as const;
      const layout = layouts[i % layouts.length];

      const baseSpec: any = {
        layout,
        title: `${request.topic} - Section ${i}`
      };

      // Add layout-specific content
      if (layout === 'title-bullets') {
        baseSpec.bullets = [
          `Key point about ${request.topic}`,
          `Important insight for ${request.audience}`,
          `Action item with ${request.tone} approach`
        ];
      } else if (layout === 'two-column') {
        baseSpec.left = {
          heading: 'Left Column',
          paragraph: `Left column content for ${request.topic}`
        };
        baseSpec.right = {
          heading: 'Right Column',
          paragraph: `Right column content for ${request.audience}`
        };
      } else if (layout === 'quote') {
        baseSpec.quote = `"${request.topic} is essential for success"`;
      } else if (layout === 'chart') {
        baseSpec.chartData = [
          { name: 'Q1', values: [10] },
          { name: 'Q2', values: [20] },
          { name: 'Q3', values: [30] }
        ];
      }

      specs.push(baseSpec);
    }
  }

  return specs;
}

async function runComprehensiveTests() {
  console.log('🚀 Starting Comprehensive PowerPoint Generation Tests');
  console.log('=' .repeat(80));

  // Create output directory
  const outputDir = join(process.cwd(), 'test-outputs', 'ppt-debug-tests');
  try {
    mkdirSync(outputDir, { recursive: true });
  } catch (error) {
    console.error('Failed to create output directory:', error);
  }

  const results: any[] = [];

  for (let i = 0; i < testConfigs.length; i++) {
    const config = testConfigs[i];
    const logger = new TestLogger(config.name);
    
    logger.log(`Starting test ${i + 1}/10: ${config.name}`);
    logger.log('Request configuration:', config.request);

    try {
      // Pre-generation validation
      logger.log('🔍 Pre-generation validation');
      logger.log('Theme validation:', {
        theme: config.request.design?.theme,
        slideCount: config.request.slideCount,
        hasImages: !!config.request.includeImages,
        hasCharts: !!config.request.includeCharts
      });

      // Create mock slide specs from request
      const slideSpecs = createMockSlideSpecs(config.request);
      logger.log('📋 Generated slide specs:', slideSpecs.map(spec => ({
        layout: spec.layout,
        title: spec.title?.substring(0, 30) + '...',
        hasBullets: !!spec.bullets?.length,
        hasChart: !!(spec as any).chartData
      })));

      // Start generation with timing
      const startTime = Date.now();
      logger.log('⚡ Starting PowerPoint generation');

      const buffer = await generatePpt(slideSpecs, config.request.design.theme, {
        includeMetadata: true,
        includeSpeakerNotes: true,
        optimizeFileSize: true,
        author: 'Test Suite',
        company: 'PowerPoint Test',
        subject: config.request.topic
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      logger.log('📊 Generation completed', {
        duration: `${duration}ms`,
        bufferSize: buffer?.length || 0,
        hasBuffer: !!buffer
      });

      // Validate result structure
      logger.log('🔬 Result validation');
      if (!buffer) {
        throw new Error('No buffer returned from generation');
      }

      if (buffer.length === 0) {
        throw new Error('Empty buffer returned');
      }

      // Check for PowerPoint file signature
      const signature = buffer.slice(0, 4);
      logger.log('📄 File signature check', {
        signature: signature.toString('hex'),
        expectedPK: signature[0] === 0x50 && signature[1] === 0x4B,
        bufferStart: buffer.slice(0, 20).toString('hex')
      });

      // Save file with detailed naming
      const filename = `${config.name}_${Date.now()}.pptx`;
      const filepath = join(outputDir, filename);

      writeFileSync(filepath, buffer);
      logger.success(`File saved: ${filepath}`);

      // Additional file validation
      const stats = require('fs').statSync(filepath);
      logger.log('📁 File stats', {
        size: stats.size,
        created: stats.birthtime,
        isFile: stats.isFile()
      });

      results.push({
        testName: config.name,
        status: 'SUCCESS',
        duration,
        fileSize: stats.size,
        filename,
        filepath,
        logs: logger.getLogs()
      });

      logger.success(`Test completed successfully in ${duration}ms`);

    } catch (error) {
      logger.error('Test failed', error);

      results.push({
        testName: config.name,
        status: 'FAILED',
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        logs: logger.getLogs()
      });
    }

    console.log('-'.repeat(80));
  }

  // Generate comprehensive test report
  const report = {
    timestamp: new Date().toISOString(),
    totalTests: testConfigs.length,
    passed: results.filter(r => r.status === 'SUCCESS').length,
    failed: results.filter(r => r.status === 'FAILED').length,
    results,
    summary: {
      successRate: `${(results.filter(r => r.status === 'SUCCESS').length / testConfigs.length * 100).toFixed(1)}%`,
      averageDuration: results.filter(r => r.duration).reduce((sum, r) => sum + r.duration, 0) / results.filter(r => r.duration).length,
      totalFileSize: results.filter(r => r.fileSize).reduce((sum, r) => sum + r.fileSize, 0)
    }
  };

  // Save detailed report
  const reportPath = join(outputDir, 'comprehensive-test-report.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('📋 COMPREHENSIVE TEST REPORT');
  console.log('=' .repeat(80));
  console.log(`✅ Passed: ${report.passed}/${report.totalTests}`);
  console.log(`❌ Failed: ${report.failed}/${report.totalTests}`);
  console.log(`📊 Success Rate: ${report.summary.successRate}`);
  console.log(`⏱️  Average Duration: ${report.summary.averageDuration?.toFixed(0)}ms`);
  console.log(`📁 Total File Size: ${(report.summary.totalFileSize / 1024).toFixed(1)}KB`);
  console.log(`📄 Report saved: ${reportPath}`);
  console.log(`📂 Files saved in: ${outputDir}`);

  return report;
}

// Export for use
export { runComprehensiveTests };

// Run if called directly
if (require.main === module) {
  runComprehensiveTests().catch(console.error);
}
