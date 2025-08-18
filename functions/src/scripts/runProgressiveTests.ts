#!/usr/bin/env node

/**
 * Progressive PowerPoint Testing Script
 * Gradually adds functionality to identify corruption points
 */

import { ProgressivePowerPointTester, ProgressiveTestResult } from '../utils/progressiveTestFramework';
import { logger } from '../utils/smartLogger';
import fs from 'fs/promises';
import path from 'path';

interface LevelReport {
  level: number;
  levelName: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: ProgressiveTestResult[];
  riskAssessment: string;
}

interface ProgressiveReport {
  timestamp: string;
  levels: LevelReport[];
  recommendations: string[];
  safeFeatures: string[];
  problematicFeatures: string[];
}

async function runProgressiveTests(): Promise<ProgressiveReport> {
  console.log('🧪 Progressive PowerPoint Functionality Testing');
  console.log('===============================================\n');
  
  const tester = new ProgressivePowerPointTester('./progressive-test-output');
  const levels: LevelReport[] = [];
  
  const levelNames = [
    '', // 0 index
    'Minimal Structure',
    'Basic Text',
    'Advanced Text',
    'Layout Features',
    'Advanced Features',
    'Real-World Complexity',
    'Professional Backgrounds',
    'Advanced Shapes',
    'Professional Charts',
    'Stress Test',
    'Failing Content Tests'
  ];
  
  // Run tests level by level, stopping if we hit failures
  for (let level = 1; level <= 11; level++) {
    console.log(`\n📊 Level ${level}: ${levelNames[level]}`);
    console.log('─'.repeat(40));
    
    try {
      const results = await tester.runTestLevel(level);
      const passedTests = results.filter(r => r.passed).length;
      const failedTests = results.length - passedTests;
      
      const levelReport: LevelReport = {
        level,
        levelName: levelNames[level],
        totalTests: results.length,
        passedTests,
        failedTests,
        results,
        riskAssessment: assessRiskLevel(results)
      };
      
      levels.push(levelReport);
      
      console.log(`✅ Passed: ${passedTests}/${results.length}`);
      console.log(`❌ Failed: ${failedTests}/${results.length}`);
      console.log(`🎯 Success Rate: ${Math.round((passedTests / results.length) * 100)}%`);
      
      // Show individual test results
      results.forEach(result => {
        const status = result.passed ? '✅' : '❌';
        const size = result.passed ? `${Math.round(result.fileSize / 1024)}KB` : 'N/A';
        console.log(`  ${status} ${result.testId} (${size}, ${result.generationTime}ms)`);
        
        if (!result.passed && result.errorDetails) {
          console.log(`    Error: ${result.errorDetails}`);
        }
      });
      
      // If we have failures, analyze them
      if (failedTests > 0) {
        console.log(`\n⚠️  Level ${level} has failures - analyzing...`);
        analyzeFailures(results);
        
        // Ask if we should continue to next level
        console.log(`\n🤔 Continue to Level ${level + 1}? Some features may be problematic.`);
      }
      
    } catch (error) {
      console.error(`❌ Level ${level} failed completely:`, error);
      break;
    }
  }
  
  // Generate comprehensive report
  const report = generateProgressiveReport(levels);
  await saveProgressiveReport(report);
  
  // Show final recommendations
  console.log('\n🎯 Final Recommendations');
  console.log('========================');
  report.recommendations.forEach(rec => console.log(`• ${rec}`));
  
  console.log('\n✅ Safe Features (use these):');
  report.safeFeatures.forEach(feature => console.log(`  ✓ ${feature}`));
  
  if (report.problematicFeatures.length > 0) {
    console.log('\n⚠️  Problematic Features (avoid these):');
    report.problematicFeatures.forEach(feature => console.log(`  ✗ ${feature}`));
  }
  
  console.log('\n📁 Test files saved to: ./progressive-test-output/');
  console.log('👀 Open these files in PowerPoint to verify compatibility');
  
  return report;
}

function assessRiskLevel(results: ProgressiveTestResult[]): string {
  const passRate = results.filter(r => r.passed).length / results.length;
  
  if (passRate === 1.0) return 'LOW - All tests passed';
  if (passRate >= 0.8) return 'MEDIUM - Most tests passed';
  if (passRate >= 0.5) return 'HIGH - Many failures detected';
  return 'CRITICAL - Majority of tests failed';
}

function analyzeFailures(results: ProgressiveTestResult[]): void {
  const failures = results.filter(r => !r.passed);
  
  console.log('\n🔍 Failure Analysis:');
  failures.forEach(failure => {
    console.log(`  • ${failure.testId}: ${failure.errorDetails || 'Unknown error'}`);
    console.log(`    Features: ${failure.features.join(', ')}`);
  });
  
  // Identify common failure patterns
  const failedFeatures = failures.flatMap(f => f.features);
  const featureCounts = failedFeatures.reduce((acc, feature) => {
    acc[feature] = (acc[feature] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const problematicFeatures = Object.entries(featureCounts)
    .filter(([_, count]) => count > 1)
    .map(([feature, count]) => `${feature} (${count} failures)`);
  
  if (problematicFeatures.length > 0) {
    console.log('\n🚨 Most Problematic Features:');
    problematicFeatures.forEach(feature => console.log(`  • ${feature}`));
  }
}

function generateProgressiveReport(levels: LevelReport[]): ProgressiveReport {
  const allResults = levels.flatMap(l => l.results);
  const passedResults = allResults.filter(r => r.passed);
  const failedResults = allResults.filter(r => !r.passed);
  
  // Identify safe features (appear in passed tests)
  const safeFeatures = [...new Set(passedResults.flatMap(r => r.features))];
  
  // Identify problematic features (appear frequently in failed tests)
  const failedFeatures = failedResults.flatMap(r => r.features);
  const featureCounts = failedFeatures.reduce((acc, feature) => {
    acc[feature] = (acc[feature] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const problematicFeatures = Object.entries(featureCounts)
    .filter(([_, count]) => count >= 2)
    .map(([feature, _]) => feature);
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (levels.length > 0 && levels[0].passedTests === levels[0].totalTests) {
    recommendations.push('Basic PowerPoint structure generation is working correctly');
  }
  
  if (levels.length > 1 && levels[1].passedTests === levels[1].totalTests) {
    recommendations.push('Text content generation is safe to use');
  } else if (levels.length > 1 && levels[1].failedTests > 0) {
    recommendations.push('Text content has issues - use minimal styling only');
  }
  
  if (problematicFeatures.includes('tables')) {
    recommendations.push('Avoid table generation - causes corruption');
  }
  
  if (problematicFeatures.includes('charts')) {
    recommendations.push('Avoid chart generation - causes corruption');
  }
  
  if (problematicFeatures.includes('bullets')) {
    recommendations.push('Use simple text instead of bullet formatting');
  }
  
  if (safeFeatures.includes('text-basic') && !problematicFeatures.includes('text-basic')) {
    recommendations.push('Stick to basic text formatting for maximum compatibility');
  }
  
  return {
    timestamp: new Date().toISOString(),
    levels,
    recommendations,
    safeFeatures: safeFeatures.filter(f => !problematicFeatures.includes(f)),
    problematicFeatures
  };
}

async function saveProgressiveReport(report: ProgressiveReport): Promise<void> {
  const filename = `progressive-test-report-${Date.now()}.json`;
  const filepath = path.join('./progressive-test-output', filename);
  
  try {
    await fs.mkdir('./progressive-test-output', { recursive: true });
    await fs.writeFile(filepath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved: ${filepath}`);
  } catch (error) {
    console.warn('Failed to save report:', error);
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'level1':
    (async () => {
      const tester = new ProgressivePowerPointTester();
      const results = await tester.runTestLevel(1);
      console.log('Level 1 results:', results);
    })();
    break;
  case 'level2':
    (async () => {
      const tester = new ProgressivePowerPointTester();
      const results = await tester.runTestLevel(2);
      console.log('Level 2 results:', results);
    })();
    break;
  case 'level3':
    (async () => {
      const tester = new ProgressivePowerPointTester();
      const results = await tester.runTestLevel(3);
      console.log('Level 3 results:', results);
    })();
    break;
  case 'level4':
    (async () => {
      const tester = new ProgressivePowerPointTester();
      const results = await tester.runTestLevel(4);
      console.log('Level 4 results:', results);
    })();
    break;
  case 'level5':
    (async () => {
      const tester = new ProgressivePowerPointTester();
      const results = await tester.runTestLevel(5);
      console.log('Level 5 results:', results);
    })();
    break;
  default:
    runProgressiveTests();
}
