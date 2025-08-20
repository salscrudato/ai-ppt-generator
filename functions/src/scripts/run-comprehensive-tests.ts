#!/usr/bin/env node
/**
 * Comprehensive PowerPoint Test Runner
 * Runs 10 end-to-end tests with innovative debugging
 */

import { runComprehensiveTests } from './comprehensive-ppt-test';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function main() {
  console.log('🚀 Starting Comprehensive PowerPoint Generation Tests');
  console.log('=' .repeat(80));
  console.log('This will generate 10 PowerPoint files with detailed debugging');
  console.log('Each test targets different layouts and complexity levels');
  console.log('');

  try {
    const startTime = Date.now();
    const report = await runComprehensiveTests();
    const endTime = Date.now();
    const totalDuration = endTime - startTime;

    console.log('');
    console.log('🎯 FINAL TEST SUMMARY');
    console.log('=' .repeat(80));
    console.log(`⏱️  Total Duration: ${totalDuration}ms (${(totalDuration / 1000).toFixed(2)}s)`);
    console.log(`✅ Successful Tests: ${report.passed}/${report.totalTests}`);
    console.log(`❌ Failed Tests: ${report.failed}/${report.totalTests}`);
    console.log(`📊 Success Rate: ${report.summary.successRate}`);
    console.log(`📁 Average File Size: ${(report.summary.totalFileSize / report.passed / 1024).toFixed(1)}KB`);
    console.log('');

    if (report.failed > 0) {
      console.log('❌ FAILED TESTS:');
      report.results
        .filter(r => r.status === 'FAILED')
        .forEach(result => {
          console.log(`  • ${result.testName}: ${result.error}`);
        });
      console.log('');
    }

    console.log('📋 DETAILED RESULTS:');
    report.results.forEach((result, i) => {
      const status = result.status === 'SUCCESS' ? '✅' : '❌';
      const duration = result.duration ? `${result.duration}ms` : 'N/A';
      const size = result.fileSize ? `${(result.fileSize / 1024).toFixed(1)}KB` : 'N/A';
      
      console.log(`  ${i + 1}. ${status} ${result.testName} (${duration}, ${size})`);
      
      if (result.status === 'FAILED') {
        console.log(`     Error: ${result.error}`);
      }
    });

    console.log('');
    console.log('📂 Files and logs saved in: test-outputs/ppt-debug-tests/');
    console.log('📄 Detailed report: test-outputs/ppt-debug-tests/comprehensive-test-report.json');
    console.log('');
    console.log('🔍 DEBUGGING INSIGHTS:');
    console.log('  • Check the console logs above for detailed generation steps');
    console.log('  • Each PowerPoint file is named with test name and timestamp');
    console.log('  • Failed tests include error details and stack traces');
    console.log('  • Buffer validation checks for proper PowerPoint file format');
    console.log('');

    if (report.passed === report.totalTests) {
      console.log('🎉 ALL TESTS PASSED! PowerPoint generation is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Check the error details above and the generated files.');
      console.log('   Send the generated PowerPoint files back for analysis.');
    }

  } catch (error) {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { main as runTests };
