/**
 * Automated Style Test Runner
 * Runs comprehensive style tests and generates detailed reports
 */

import fs from 'fs/promises';
import path from 'path';
import { MinimalSlideGenerator, StyleTestSuite, StyleTest, TestResult } from './styleTestFramework';
import { logger } from './smartLogger';

export interface TestReport {
  timestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: TestResult[];
  recommendations: string[];
  safestStyles: any;
}

export class StyleTestRunner {
  private outputDir: string;
  
  constructor(outputDir: string = './test-output') {
    this.outputDir = outputDir;
  }
  
  /**
   * Run all style tests and generate comprehensive report
   */
  async runAllTests(): Promise<TestReport> {
    logger.info('Starting comprehensive style testing');
    
    // Ensure output directory exists
    await this.ensureOutputDir();
    
    const tests = StyleTestSuite.getAllTests();
    const results: TestResult[] = [];
    
    // Run tests sequentially to avoid resource conflicts
    for (const test of tests) {
      logger.info(`Running test: ${test.name}`);
      
      try {
        const result = await MinimalSlideGenerator.testStyle(test);
        results.push(result);
        
        // Save test file for manual PowerPoint validation
        if (result.passed) {
          await this.saveTestFile(test, result);
        }
        
        logger.info(`Test ${test.id}: ${result.passed ? 'PASSED' : 'FAILED'}`);
      } catch (error) {
        logger.error(`Test ${test.id} failed with error:`, { error });
        results.push({
          testId: test.id,
          passed: false,
          fileSize: 0,
          hasValidSignature: false,
          powerPointAccepts: false,
          errorDetails: error instanceof Error ? error.message : String(error),
          generationTime: 0
        });
      }
    }
    
    // Generate comprehensive report
    const report = this.generateReport(tests, results);
    await this.saveReport(report);
    
    logger.info(`Style testing complete. ${report.passedTests}/${report.totalTests} tests passed`);
    return report;
  }
  
  /**
   * Run specific test category
   */
  async runTestCategory(category: 'fonts' | 'colors' | 'formatting'): Promise<TestResult[]> {
    let tests: StyleTest[];
    
    switch (category) {
      case 'fonts':
        tests = StyleTestSuite.getFontTests();
        break;
      case 'colors':
        tests = StyleTestSuite.getColorTests();
        break;
      case 'formatting':
        tests = StyleTestSuite.getFormattingTests();
        break;
    }
    
    const results: TestResult[] = [];
    
    for (const test of tests) {
      const result = await MinimalSlideGenerator.testStyle(test);
      results.push(result);
      
      if (result.passed) {
        await this.saveTestFile(test, result);
      }
    }
    
    return results;
  }
  
  /**
   * Generate binary search test for problematic styles
   */
  async binarySearchProblem(baseStyle: any, problematicStyle: any): Promise<any> {
    logger.info('Starting binary search for problematic style properties');
    
    const baseTest: StyleTest = {
      id: 'binary-base',
      name: 'Binary Search Base',
      description: 'Known working style',
      styleConfig: baseStyle,
      expectedResult: 'pass'
    };
    
    const problematicTest: StyleTest = {
      id: 'binary-problematic',
      name: 'Binary Search Problematic',
      description: 'Known problematic style',
      styleConfig: problematicStyle,
      expectedResult: 'fail'
    };
    
    // Verify base assumptions
    const baseResult = await MinimalSlideGenerator.testStyle(baseTest);
    const problematicResult = await MinimalSlideGenerator.testStyle(problematicTest);
    
    if (!baseResult.passed) {
      throw new Error('Base style is not working - cannot perform binary search');
    }
    
    if (problematicResult.passed) {
      throw new Error('Problematic style is actually working - no issue to find');
    }
    
    // Find the problematic property through binary search
    const problematicProperties = Object.keys(problematicStyle).filter(
      key => !(key in baseStyle) || problematicStyle[key] !== baseStyle[key]
    );
    
    return await this.binarySearchProperties(baseStyle, problematicProperties, problematicStyle);
  }
  
  private async binarySearchProperties(baseStyle: any, properties: string[], problematicStyle: any): Promise<any> {
    if (properties.length === 1) {
      // Found the problematic property
      const property = properties[0];
      logger.info(`Found problematic property: ${property} = ${problematicStyle[property]}`);
      return { property, value: problematicStyle[property] };
    }
    
    const midpoint = Math.floor(properties.length / 2);
    const firstHalf = properties.slice(0, midpoint);
    const secondHalf = properties.slice(midpoint);
    
    // Test first half
    const testStyle = { ...baseStyle };
    firstHalf.forEach(prop => {
      testStyle[prop] = problematicStyle[prop];
    });
    
    const testResult = await MinimalSlideGenerator.testStyle({
      id: 'binary-search-test',
      name: 'Binary Search Test',
      description: 'Testing subset of properties',
      styleConfig: testStyle,
      expectedResult: 'unknown'
    });
    
    if (!testResult.passed) {
      // Problem is in first half
      return await this.binarySearchProperties(baseStyle, firstHalf, problematicStyle);
    } else {
      // Problem is in second half
      return await this.binarySearchProperties(baseStyle, secondHalf, problematicStyle);
    }
  }
  
  private async ensureOutputDir(): Promise<void> {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }
  
  private async saveTestFile(test: StyleTest, result: TestResult): Promise<void> {
    try {
      const buffer = await MinimalSlideGenerator.generateMinimalSlide(test.styleConfig);
      const filename = `${test.id}.pptx`;
      const filepath = path.join(this.outputDir, filename);
      await fs.writeFile(filepath, buffer);
      logger.debug(`Saved test file: ${filepath}`);
    } catch (error) {
      logger.warn(`Failed to save test file for ${test.id}:`, { error });
    }
  }
  
  private generateReport(tests: StyleTest[], results: TestResult[]): TestReport {
    const passedTests = results.filter(r => r.passed).length;
    const failedTests = results.length - passedTests;
    
    // Generate recommendations based on results
    const recommendations = this.generateRecommendations(tests, results);
    
    // Identify safest styles
    const safestStyles = this.identifySafestStyles(tests, results);
    
    return {
      timestamp: new Date().toISOString(),
      totalTests: results.length,
      passedTests,
      failedTests,
      results,
      recommendations,
      safestStyles
    };
  }
  
  private generateRecommendations(tests: StyleTest[], results: TestResult[]): string[] {
    const recommendations: string[] = [];
    
    // Analyze font test results
    const fontResults = results.filter(r => r.testId.startsWith('font-'));
    const passedFonts = fontResults.filter(r => r.passed);
    
    if (passedFonts.length > 0) {
      const safeFonts = passedFonts.map(r => {
        const test = tests.find(t => t.id === r.testId);
        return test?.styleConfig.fontFace;
      }).filter(Boolean);
      recommendations.push(`Use safe fonts: ${safeFonts.join(', ')}`);
    }
    
    // Analyze color test results
    const colorResults = results.filter(r => r.testId.startsWith('color-'));
    const passedColors = colorResults.filter(r => r.passed);
    
    if (passedColors.length > 0) {
      recommendations.push('Use 6-character hex colors without # prefix');
    }
    
    // Analyze formatting results
    const formatResults = results.filter(r => r.testId.startsWith('format-'));
    const complexFormatPassed = formatResults.find(r => r.testId === 'format-complex')?.passed;
    
    if (!complexFormatPassed) {
      recommendations.push('Avoid complex formatting like shadows and multiple effects');
    }
    
    return recommendations;
  }
  
  private identifySafestStyles(tests: StyleTest[], results: TestResult[]): any {
    const passedResults = results.filter(r => r.passed);
    
    if (passedResults.length === 0) {
      return {
        fontSize: 16,
        fontFace: 'Calibri',
        color: '333333'
      };
    }
    
    // Find the most basic style that passed
    const basicTest = passedResults.find(r => r.testId === 'font-calibri-basic');
    if (basicTest) {
      const test = tests.find(t => t.id === basicTest.testId);
      return test?.styleConfig || {};
    }
    
    return passedResults[0];
  }
  
  private async saveReport(report: TestReport): Promise<void> {
    const filename = `style-test-report-${Date.now()}.json`;
    const filepath = path.join(this.outputDir, filename);
    await fs.writeFile(filepath, JSON.stringify(report, null, 2));
    logger.info(`Test report saved: ${filepath}`);
  }
}
