#!/usr/bin/env node

/**
 * Real-World Testing Script
 * Tests the actual full flow including API endpoints
 */

import { RealWorldTestRunner, RealWorldTestResult } from '../utils/realWorldTestFramework';
import { logger } from '../utils/smartLogger';
import fs from 'fs/promises';
import path from 'path';

interface RealWorldReport {
  timestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: RealWorldTestResult[];
  endpointAnalysis: Record<string, {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    averageResponseTime: number;
    averageFileSize: number;
  }>;
  themeAnalysis: Record<string, {
    totalTests: number;
    passedTests: number;
    failedTests: number;
  }>;
  recommendations: string[];
}

async function runRealWorldTests(): Promise<RealWorldReport> {
  console.log('🌍 Real-World Testing - Full PowerPoint Generation Flow');
  console.log('======================================================\n');
  
  // Check if server is running
  const baseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:5001/plsfixthx-ai/us-central1/api';
  console.log(`Testing against: ${baseUrl}`);
  
  try {
    const healthResponse = await fetch(`${baseUrl}/health`);
    if (healthResponse.status === 503) {
      // Server is degraded but functional
      console.log('⚠️  Server is running but degraded (this is OK for testing)\n');
    } else if (!healthResponse.ok) {
      throw new Error(`Server health check failed: ${healthResponse.status}`);
    } else {
      console.log('✅ Server is running and healthy\n');
    }
  } catch (error) {
    console.error('❌ Server is not accessible. Please start the server first.');
    console.error('Run: npm run dev (in functions directory)');
    process.exit(1);
  }
  
  const runner = new RealWorldTestRunner('./real-world-test-output', baseUrl);
  
  try {
    const results = await runner.runRealWorldTests();
    
    const passedTests = results.filter(r => r.passed).length;
    const failedTests = results.length - passedTests;
    
    console.log('\n📊 Real-World Test Results Summary:');
    console.log(`Total Tests: ${results.length}`);
    console.log(`Passed: ${passedTests} ✅`);
    console.log(`Failed: ${failedTests} ❌`);
    console.log(`Success Rate: ${Math.round((passedTests / results.length) * 100)}%\n`);
    
    // Analyze by endpoint
    const endpointAnalysis = analyzeByEndpoint(results);
    
    console.log('🔌 Endpoint Analysis:');
    Object.entries(endpointAnalysis).forEach(([endpoint, analysis]) => {
      const successRate = Math.round((analysis.passedTests / analysis.totalTests) * 100);
      const status = successRate === 100 ? '✅' : successRate >= 50 ? '⚠️' : '❌';
      console.log(`  ${status} ${endpoint}: ${analysis.passedTests}/${analysis.totalTests} passed (${successRate}%)`);
      console.log(`    Avg Response Time: ${analysis.averageResponseTime}ms`);
      console.log(`    Avg File Size: ${Math.round(analysis.averageFileSize / 1024)}KB`);
    });
    
    // Analyze by theme
    const themeAnalysis = analyzeByTheme(results);
    
    console.log('\n🎨 Theme Analysis:');
    Object.entries(themeAnalysis).forEach(([theme, analysis]) => {
      const successRate = Math.round((analysis.passedTests / analysis.totalTests) * 100);
      const status = successRate === 100 ? '✅' : successRate >= 50 ? '⚠️' : '❌';
      console.log(`  ${status} ${theme}: ${analysis.passedTests}/${analysis.totalTests} passed (${successRate}%)`);
    });
    
    // Detailed results
    console.log('\n📋 Detailed Test Results:');
    results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      const size = result.passed ? `${Math.round(result.fileSize / 1024)}KB` : 'N/A';
      console.log(`  ${status} ${result.testId} (${result.responseTime}ms, ${size})`);
      if (!result.passed && result.errorDetails) {
        console.log(`    Error: ${result.errorDetails}`);
      }
      if (result.statusCode !== 200) {
        console.log(`    HTTP Status: ${result.statusCode}`);
      }
    });
    
    // Generate recommendations
    const recommendations = generateRealWorldRecommendations(results, endpointAnalysis, themeAnalysis);
    
    console.log('\n💡 Real-World Recommendations:');
    recommendations.forEach(rec => console.log(`• ${rec}`));
    
    const report: RealWorldReport = {
      timestamp: new Date().toISOString(),
      totalTests: results.length,
      passedTests,
      failedTests,
      results,
      endpointAnalysis,
      themeAnalysis,
      recommendations
    };
    
    // Save report
    await saveRealWorldReport(report);
    
    console.log('\n📁 Test files saved to: ./real-world-test-output/');
    console.log('👀 Open these files in PowerPoint to verify compatibility');
    console.log('🔍 Check markup files for detailed analysis');
    
    return report;
    
  } catch (error) {
    console.error('❌ Real-world testing failed:', error);
    throw error;
  }
}

function analyzeByEndpoint(results: RealWorldTestResult[]): Record<string, any> {
  const analysis: Record<string, any> = {};
  
  // Get test data to map results to endpoints
  const tests = RealWorldTestRunner.getRealWorldTests();
  
  results.forEach(result => {
    const test = tests.find(t => t.id === result.testId);
    if (!test) return;
    
    const endpoint = test.endpoint;
    if (!analysis[endpoint]) {
      analysis[endpoint] = {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        responseTimes: [],
        fileSizes: []
      };
    }
    
    analysis[endpoint].totalTests++;
    if (result.passed) {
      analysis[endpoint].passedTests++;
      analysis[endpoint].responseTimes.push(result.responseTime);
      analysis[endpoint].fileSizes.push(result.fileSize);
    } else {
      analysis[endpoint].failedTests++;
    }
  });
  
  // Calculate averages
  Object.keys(analysis).forEach(endpoint => {
    const data = analysis[endpoint];
    data.averageResponseTime = data.responseTimes.length > 0 
      ? Math.round(data.responseTimes.reduce((a: number, b: number) => a + b, 0) / data.responseTimes.length)
      : 0;
    data.averageFileSize = data.fileSizes.length > 0
      ? Math.round(data.fileSizes.reduce((a: number, b: number) => a + b, 0) / data.fileSizes.length)
      : 0;
    delete data.responseTimes;
    delete data.fileSizes;
  });
  
  return analysis;
}

function analyzeByTheme(results: RealWorldTestResult[]): Record<string, any> {
  const analysis: Record<string, any> = {};
  
  // Get test data to map results to themes
  const tests = RealWorldTestRunner.getRealWorldTests();
  
  results.forEach(result => {
    const test = tests.find(t => t.id === result.testId);
    if (!test) return;
    
    const theme = test.themeId;
    if (!analysis[theme]) {
      analysis[theme] = {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0
      };
    }
    
    analysis[theme].totalTests++;
    if (result.passed) {
      analysis[theme].passedTests++;
    } else {
      analysis[theme].failedTests++;
    }
  });
  
  return analysis;
}

function generateRealWorldRecommendations(
  results: RealWorldTestResult[], 
  endpointAnalysis: Record<string, any>, 
  themeAnalysis: Record<string, any>
): string[] {
  const recommendations: string[] = [];
  const failures = results.filter(r => !r.passed);
  
  if (failures.length === 0) {
    recommendations.push('All real-world tests passed - your PowerPoint generator is working correctly!');
    recommendations.push('The full flow from API to PowerPoint generation is stable');
    return recommendations;
  }
  
  // Analyze failure patterns
  const endpointFailures = Object.entries(endpointAnalysis).filter(([_, analysis]) => analysis.failedTests > 0);
  const themeFailures = Object.entries(themeAnalysis).filter(([_, analysis]) => analysis.failedTests > 0);
  
  if (endpointFailures.length > 0) {
    recommendations.push('Some API endpoints are failing - check server logs for details');
    endpointFailures.forEach(([endpoint, analysis]) => {
      recommendations.push(`Fix issues with ${endpoint} endpoint (${analysis.failedTests} failures)`);
    });
  }
  
  if (themeFailures.length > 0) {
    recommendations.push('Some themes are causing failures - consider simplifying theme selection');
    const problematicThemes = themeFailures.map(([theme, _]) => theme);
    recommendations.push(`Problematic themes: ${problematicThemes.join(', ')}`);
  }
  
  // Check for specific error patterns
  const timeoutErrors = failures.filter(f => f.errorDetails?.includes('timeout'));
  const memoryErrors = failures.filter(f => f.errorDetails?.includes('memory'));
  const validationErrors = failures.filter(f => f.errorDetails?.includes('validation'));
  
  if (timeoutErrors.length > 0) {
    recommendations.push('Timeout errors detected - consider optimizing generation performance');
  }
  
  if (memoryErrors.length > 0) {
    recommendations.push('Memory errors detected - reduce slide complexity or implement pagination');
  }
  
  if (validationErrors.length > 0) {
    recommendations.push('Validation errors detected - check input data format and schema compliance');
  }
  
  return recommendations;
}

async function saveRealWorldReport(report: RealWorldReport): Promise<void> {
  const filename = `real-world-test-report-${Date.now()}.json`;
  const filepath = path.join('./real-world-test-output', filename);
  
  try {
    await fs.mkdir('./real-world-test-output', { recursive: true });
    await fs.writeFile(filepath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved: ${filepath}`);
  } catch (error) {
    console.warn('Failed to save real-world report:', error);
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'basic':
    console.log('Running basic real-world tests only...');
    // Could implement filtered testing here
    break;
  case 'endpoints':
    console.log('Running endpoint tests only...');
    // Could implement endpoint-specific testing here
    break;
  case 'themes':
    console.log('Running theme tests only...');
    // Could implement theme-specific testing here
    break;
  default:
    runRealWorldTests().catch(error => {
      console.error('Real-world testing failed:', error);
      process.exit(1);
    });
}
