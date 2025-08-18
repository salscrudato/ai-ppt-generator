#!/usr/bin/env node

/**
 * Style Test Execution Script
 * Run this to systematically test PowerPoint styling and identify issues
 */

import { StyleTestRunner } from '../utils/styleTestRunner';
import { logger } from '../utils/smartLogger';

async function main() {
  console.log('🔬 PowerPoint Style Testing Framework');
  console.log('=====================================\n');
  
  const runner = new StyleTestRunner('./test-output');
  
  try {
    // Phase 1: Run all basic tests
    console.log('Phase 1: Running comprehensive style tests...');
    const report = await runner.runAllTests();
    
    console.log('\n📊 Test Results Summary:');
    console.log(`Total Tests: ${report.totalTests}`);
    console.log(`Passed: ${report.passedTests} ✅`);
    console.log(`Failed: ${report.failedTests} ❌`);
    console.log(`Success Rate: ${Math.round((report.passedTests / report.totalTests) * 100)}%`);
    
    console.log('\n💡 Recommendations:');
    report.recommendations.forEach(rec => console.log(`  • ${rec}`));
    
    console.log('\n🛡️ Safest Style Configuration:');
    console.log(JSON.stringify(report.safestStyles, null, 2));
    
    // Phase 2: Test specific categories if needed
    if (report.failedTests > 0) {
      console.log('\n🔍 Phase 2: Analyzing failed tests...');
      
      // Test fonts specifically
      console.log('Testing fonts...');
      const fontResults = await runner.runTestCategory('fonts');
      const passedFonts = fontResults.filter(r => r.passed);
      console.log(`Font tests: ${passedFonts.length}/${fontResults.length} passed`);
      
      // Test colors specifically
      console.log('Testing colors...');
      const colorResults = await runner.runTestCategory('colors');
      const passedColors = colorResults.filter(r => r.passed);
      console.log(`Color tests: ${passedColors.length}/${colorResults.length} passed`);
      
      // Test formatting specifically
      console.log('Testing formatting...');
      const formatResults = await runner.runTestCategory('formatting');
      const passedFormats = formatResults.filter(r => r.passed);
      console.log(`Format tests: ${passedFormats.length}/${formatResults.length} passed`);
    }
    
    // Phase 3: Manual validation instructions
    console.log('\n📋 Manual Validation Instructions:');
    console.log('1. Check the ./test-output directory for generated .pptx files');
    console.log('2. Open each file in PowerPoint to verify it opens without errors');
    console.log('3. Look for any "PowerPoint found a problem" messages');
    console.log('4. Note which specific files cause issues');
    console.log('5. Use the binary search feature to isolate problematic properties');
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Apply the safest style configuration to your generator');
    console.log('2. Run binary search on any problematic styles you identify');
    console.log('3. Gradually add back features that pass validation');
    console.log('4. Re-run tests after each change to ensure stability');
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

// Binary search example usage
async function runBinarySearch() {
  console.log('\n🔍 Binary Search Example');
  console.log('========================\n');
  
  const runner = new StyleTestRunner('./test-output');
  
  // Example: Find what's wrong with complex formatting
  const safeStyle = {
    fontSize: 16,
    fontFace: 'Calibri',
    color: '333333'
  };
  
  const problematicStyle = {
    fontSize: 16,
    fontFace: 'Inter var',
    color: '#1E40AF',
    bold: true,
    italic: true,
    underline: true,
    shadow: { type: 'outer', blur: 3, offset: 2, angle: 45, color: '00000020' }
  };
  
  try {
    const result = await runner.binarySearchProblem(safeStyle, problematicStyle);
    console.log('🎯 Found problematic property:', result);
  } catch (error) {
    console.log('Binary search could not be performed:', error);
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'binary':
    runBinarySearch();
    break;
  case 'fonts':
    (async () => {
      const runner = new StyleTestRunner('./test-output');
      const results = await runner.runTestCategory('fonts');
      console.log('Font test results:', results);
    })();
    break;
  case 'colors':
    (async () => {
      const runner = new StyleTestRunner('./test-output');
      const results = await runner.runTestCategory('colors');
      console.log('Color test results:', results);
    })();
    break;
  case 'formatting':
    (async () => {
      const runner = new StyleTestRunner('./test-output');
      const results = await runner.runTestCategory('formatting');
      console.log('Formatting test results:', results);
    })();
    break;
  default:
    main();
}
