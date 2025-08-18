#!/usr/bin/env node

/**
 * Pipeline Testing Script
 * Tests that exactly mimic the actual data processing pipeline
 */

import { PipelineTestRunner, PipelineTestResult } from '../utils/pipelineTestFramework';
import { logger } from '../utils/smartLogger';
import fs from 'fs/promises';
import path from 'path';

interface PipelineReport {
  timestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: PipelineTestResult[];
  apiCallResults: PipelineTestResult[];
  themeResults: PipelineTestResult[];
  volumeResults: PipelineTestResult[];
  recommendations: string[];
}

async function runPipelineTests(): Promise<PipelineReport> {
  console.log('🔄 Pipeline Testing - Exact Data Processing Simulation');
  console.log('====================================================\n');
  
  const runner = new PipelineTestRunner('./pipeline-test-output');
  
  try {
    const results = await runner.runPipelineTests();
    
    // Categorize results
    const apiCallResults = results.filter(r => r.testId.includes('api'));
    const themeResults = results.filter(r => r.testId.includes('theme'));
    const volumeResults = results.filter(r => r.testId.includes('volume'));
    
    const passedTests = results.filter(r => r.passed).length;
    const failedTests = results.length - passedTests;
    
    console.log('\n📊 Pipeline Test Results Summary:');
    console.log(`Total Tests: ${results.length}`);
    console.log(`Passed: ${passedTests} ✅`);
    console.log(`Failed: ${failedTests} ❌`);
    console.log(`Success Rate: ${Math.round((passedTests / results.length) * 100)}%\n`);
    
    // API Call Results
    console.log('🔌 API Call Simulation Results:');
    apiCallResults.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      const size = result.passed ? `${Math.round(result.fileSize / 1024)}KB` : 'N/A';
      console.log(`  ${status} ${result.testId} (${size}, ${result.generationTime}ms)`);
      if (!result.passed && result.errorDetails) {
        console.log(`    Error: ${result.errorDetails}`);
      }
    });
    
    // Theme Results
    console.log('\n🎨 Theme Pipeline Results:');
    themeResults.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      const size = result.passed ? `${Math.round(result.fileSize / 1024)}KB` : 'N/A';
      console.log(`  ${status} ${result.testId} (${size}, ${result.generationTime}ms)`);
      if (!result.passed && result.errorDetails) {
        console.log(`    Error: ${result.errorDetails}`);
      }
    });
    
    // Volume Results
    console.log('\n📈 Data Volume Results:');
    volumeResults.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      const size = result.passed ? `${Math.round(result.fileSize / 1024)}KB` : 'N/A';
      console.log(`  ${status} ${result.testId} (${size}, ${result.generationTime}ms)`);
      if (!result.passed && result.errorDetails) {
        console.log(`    Error: ${result.errorDetails}`);
      }
    });
    
    // Generate recommendations
    const recommendations = generatePipelineRecommendations(results);
    
    console.log('\n💡 Pipeline Recommendations:');
    recommendations.forEach(rec => console.log(`• ${rec}`));
    
    const report: PipelineReport = {
      timestamp: new Date().toISOString(),
      totalTests: results.length,
      passedTests,
      failedTests,
      results,
      apiCallResults,
      themeResults,
      volumeResults,
      recommendations
    };
    
    // Save report
    await savePipelineReport(report);
    
    console.log('\n📁 Test files saved to: ./pipeline-test-output/');
    console.log('👀 Open these files in PowerPoint to verify compatibility');
    
    return report;
    
  } catch (error) {
    console.error('❌ Pipeline testing failed:', error);
    throw error;
  }
}

function generatePipelineRecommendations(results: PipelineTestResult[]): string[] {
  const recommendations: string[] = [];
  const failures = results.filter(r => !r.passed);
  
  if (failures.length === 0) {
    recommendations.push('All pipeline tests passed - your data processing is working correctly');
    return recommendations;
  }
  
  // Analyze failure patterns
  const apiFailures = failures.filter(r => r.testId.includes('api'));
  const themeFailures = failures.filter(r => r.testId.includes('theme'));
  const volumeFailures = failures.filter(r => r.testId.includes('volume'));
  
  if (apiFailures.length > 0) {
    recommendations.push('API call simulation failures detected - check input data format');
    apiFailures.forEach(failure => {
      if (failure.errorDetails?.includes('gradient')) {
        recommendations.push('Gradient-related errors found - ensure gradient backgrounds are disabled');
      }
      if (failure.errorDetails?.includes('chart')) {
        recommendations.push('Chart generation issues detected - validate chart data structure');
      }
      if (failure.errorDetails?.includes('table')) {
        recommendations.push('Table generation issues detected - validate table data format');
      }
    });
  }
  
  if (themeFailures.length > 0) {
    recommendations.push('Theme-specific failures detected - certain themes may be problematic');
    const problematicThemes = themeFailures.map(f => f.testId.split('-')[2]).filter(Boolean);
    if (problematicThemes.length > 0) {
      recommendations.push(`Avoid these themes: ${[...new Set(problematicThemes)].join(', ')}`);
    }
  }
  
  if (volumeFailures.length > 0) {
    recommendations.push('Large data volume failures detected - consider pagination or content limits');
  }
  
  return recommendations;
}

async function savePipelineReport(report: PipelineReport): Promise<void> {
  const filename = `pipeline-test-report-${Date.now()}.json`;
  const filepath = path.join('./pipeline-test-output', filename);
  
  try {
    await fs.mkdir('./pipeline-test-output', { recursive: true });
    await fs.writeFile(filepath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved: ${filepath}`);
  } catch (error) {
    console.warn('Failed to save pipeline report:', error);
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'api':
    console.log('Running API call tests only...');
    // Could implement specific test category running here
    break;
  case 'themes':
    console.log('Running theme tests only...');
    // Could implement specific test category running here
    break;
  case 'volume':
    console.log('Running volume tests only...');
    // Could implement specific test category running here
    break;
  default:
    runPipelineTests().catch(error => {
      console.error('Pipeline testing failed:', error);
      process.exit(1);
    });
}
