#!/usr/bin/env node

/**
 * Theme Testing Script
 * Comprehensive testing of all theme combinations
 */

import { ThemeTestRunner, ThemeTestResult } from '../utils/themeTestFramework';
import { logger } from '../utils/smartLogger';
import fs from 'fs/promises';
import path from 'path';

interface ThemeReport {
  timestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: ThemeTestResult[];
  themeAnalysis: Record<string, {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    riskLevel: string;
  }>;
  recommendations: string[];
  safeThemes: string[];
  problematicThemes: string[];
}

async function runThemeTests(): Promise<ThemeReport> {
  console.log('🎨 Theme Testing - Comprehensive Theme Compatibility');
  console.log('==================================================\n');
  
  const runner = new ThemeTestRunner('./theme-test-output');
  
  try {
    const results = await runner.runThemeTests();
    
    const passedTests = results.filter(r => r.passed).length;
    const failedTests = results.length - passedTests;
    
    console.log('\n📊 Theme Test Results Summary:');
    console.log(`Total Tests: ${results.length}`);
    console.log(`Passed: ${passedTests} ✅`);
    console.log(`Failed: ${failedTests} ❌`);
    console.log(`Success Rate: ${Math.round((passedTests / results.length) * 100)}%\n`);
    
    // Analyze by theme
    const themeAnalysis = analyzeThemeResults(results);
    
    console.log('🎯 Theme-by-Theme Analysis:');
    Object.entries(themeAnalysis).forEach(([themeId, analysis]) => {
      const successRate = Math.round((analysis.passedTests / analysis.totalTests) * 100);
      const status = successRate === 100 ? '✅' : successRate >= 50 ? '⚠️' : '❌';
      console.log(`  ${status} ${themeId}: ${analysis.passedTests}/${analysis.totalTests} passed (${successRate}%)`);
    });
    
    // Detailed results
    console.log('\n📋 Detailed Test Results:');
    const groupedResults = groupResultsByTheme(results);
    
    Object.entries(groupedResults).forEach(([themeId, themeResults]) => {
      console.log(`\n🎨 ${themeId}:`);
      themeResults.forEach(result => {
        const status = result.passed ? '✅' : '❌';
        const size = result.passed ? `${Math.round(result.fileSize / 1024)}KB` : 'N/A';
        const features = result.features.join(', ');
        console.log(`  ${status} ${result.testId} (${size}, ${result.generationTime}ms)`);
        console.log(`    Features: ${features}`);
        if (!result.passed && result.errorDetails) {
          console.log(`    Error: ${result.errorDetails}`);
        }
      });
    });
    
    // Generate recommendations
    const { recommendations, safeThemes, problematicThemes } = generateThemeRecommendations(results, themeAnalysis);
    
    console.log('\n💡 Theme Recommendations:');
    recommendations.forEach(rec => console.log(`• ${rec}`));
    
    console.log('\n✅ Safe Themes (use these):');
    safeThemes.forEach(theme => console.log(`  ✓ ${theme}`));
    
    if (problematicThemes.length > 0) {
      console.log('\n⚠️  Problematic Themes (use with caution):');
      problematicThemes.forEach(theme => console.log(`  ⚠ ${theme}`));
    }
    
    const report: ThemeReport = {
      timestamp: new Date().toISOString(),
      totalTests: results.length,
      passedTests,
      failedTests,
      results,
      themeAnalysis,
      recommendations,
      safeThemes,
      problematicThemes
    };
    
    // Save report
    await saveThemeReport(report);
    
    console.log('\n📁 Test files saved to: ./theme-test-output/');
    console.log('👀 Open these files in PowerPoint to verify theme compatibility');
    
    return report;
    
  } catch (error) {
    console.error('❌ Theme testing failed:', error);
    throw error;
  }
}

function analyzeThemeResults(results: ThemeTestResult[]): Record<string, any> {
  const analysis: Record<string, any> = {};
  
  results.forEach(result => {
    if (!analysis[result.themeId]) {
      analysis[result.themeId] = {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        riskLevel: 'unknown'
      };
    }
    
    analysis[result.themeId].totalTests++;
    if (result.passed) {
      analysis[result.themeId].passedTests++;
    } else {
      analysis[result.themeId].failedTests++;
    }
  });
  
  // Determine risk levels
  Object.keys(analysis).forEach(themeId => {
    const successRate = analysis[themeId].passedTests / analysis[themeId].totalTests;
    if (successRate === 1.0) {
      analysis[themeId].riskLevel = 'low';
    } else if (successRate >= 0.75) {
      analysis[themeId].riskLevel = 'medium';
    } else {
      analysis[themeId].riskLevel = 'high';
    }
  });
  
  return analysis;
}

function groupResultsByTheme(results: ThemeTestResult[]): Record<string, ThemeTestResult[]> {
  const grouped: Record<string, ThemeTestResult[]> = {};
  
  results.forEach(result => {
    if (!grouped[result.themeId]) {
      grouped[result.themeId] = [];
    }
    grouped[result.themeId].push(result);
  });
  
  return grouped;
}

function generateThemeRecommendations(results: ThemeTestResult[], themeAnalysis: Record<string, any>): {
  recommendations: string[];
  safeThemes: string[];
  problematicThemes: string[];
} {
  const recommendations: string[] = [];
  const safeThemes: string[] = [];
  const problematicThemes: string[] = [];
  
  // Categorize themes
  Object.entries(themeAnalysis).forEach(([themeId, analysis]) => {
    const successRate = analysis.passedTests / analysis.totalTests;
    
    if (successRate === 1.0) {
      safeThemes.push(themeId);
    } else if (successRate < 0.75) {
      problematicThemes.push(themeId);
    }
  });
  
  // Generate specific recommendations
  if (safeThemes.length > 0) {
    recommendations.push(`Use these safe themes for production: ${safeThemes.join(', ')}`);
  }
  
  if (problematicThemes.length > 0) {
    recommendations.push(`Avoid or fix these problematic themes: ${problematicThemes.join(', ')}`);
  }
  
  // Analyze failure patterns
  const failures = results.filter(r => !r.passed);
  const gradientFailures = failures.filter(f => f.errorDetails?.includes('gradient'));
  const chartFailures = failures.filter(f => f.errorDetails?.includes('chart'));
  const tableFailures = failures.filter(f => f.errorDetails?.includes('table'));
  
  if (gradientFailures.length > 0) {
    recommendations.push('Gradient-related failures detected - ensure all gradient backgrounds are removed');
  }
  
  if (chartFailures.length > 0) {
    recommendations.push('Chart-related failures in some themes - validate chart color schemes');
  }
  
  if (tableFailures.length > 0) {
    recommendations.push('Table-related failures in some themes - check table styling compatibility');
  }
  
  // Feature-specific recommendations
  const advancedFeatureFailures = failures.filter(f => 
    f.features.includes('charts') || f.features.includes('tables') || f.features.includes('shapes')
  );
  
  if (advancedFeatureFailures.length > 0) {
    recommendations.push('Some themes have issues with advanced features - test thoroughly before production use');
  }
  
  return { recommendations, safeThemes, problematicThemes };
}

async function saveThemeReport(report: ThemeReport): Promise<void> {
  const filename = `theme-test-report-${Date.now()}.json`;
  const filepath = path.join('./theme-test-output', filename);
  
  try {
    await fs.mkdir('./theme-test-output', { recursive: true });
    await fs.writeFile(filepath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved: ${filepath}`);
  } catch (error) {
    console.warn('Failed to save theme report:', error);
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'basic':
    console.log('Running basic theme tests only...');
    // Could implement basic tests only
    break;
  case 'advanced':
    console.log('Running advanced theme tests only...');
    // Could implement advanced tests only
    break;
  case 'corporate':
    console.log('Running corporate theme tests only...');
    // Could implement specific theme testing
    break;
  default:
    runThemeTests().catch(error => {
      console.error('Theme testing failed:', error);
      process.exit(1);
    });
}
