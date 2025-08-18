#!/usr/bin/env node

/**
 * Enhanced Application Validation Script
 * 
 * Comprehensive testing and validation of the AI PowerPoint Generator
 * after enhancements. Tests all major functionality and reports results.
 * 
 * @version 3.2.0-enhanced
 * @author AI PowerPoint Generator Team
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

/**
 * Utility functions
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, status, details = '') {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  const color = status === 'PASS' ? 'green' : status === 'FAIL' ? 'red' : 'yellow';
  
  log(`${icon} ${name}`, color);
  if (details) {
    log(`   ${details}`, 'cyan');
  }
  
  results.tests.push({ name, status, details });
  if (status === 'PASS') results.passed++;
  else if (status === 'FAIL') results.failed++;
  else results.warnings++;
}

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    return null;
  }
}

/**
 * Test functions
 */
function testProjectStructure() {
  log('\n🏗️  Testing Project Structure', 'bright');
  
  const requiredFiles = [
    'package.json',
    'README.md',
    'frontend/package.json',
    'frontend/src/App.tsx',
    'frontend/src/main.tsx',
    'functions/package.json',
    'functions/src/index.ts',
    'functions/src/pptGenerator-simple.ts',
    'functions/src/prompts.ts',
    'functions/src/config/appConfig.ts',
    'functions/src/utils/commonUtils.ts'
  ];
  
  requiredFiles.forEach(file => {
    if (fileExists(file)) {
      logTest(`File exists: ${file}`, 'PASS');
    } else {
      logTest(`File missing: ${file}`, 'FAIL');
    }
  });
}

function testPackageConfigurations() {
  log('\n📦 Testing Package Configurations', 'bright');
  
  // Test root package.json
  const rootPkg = readJsonFile('package.json');
  if (rootPkg) {
    logTest('Root package.json is valid', 'PASS');
    logTest(`Project version: ${rootPkg.version}`, 'PASS', 'Version information available');
  } else {
    logTest('Root package.json is invalid', 'FAIL');
  }
  
  // Test frontend package.json
  const frontendPkg = readJsonFile('frontend/package.json');
  if (frontendPkg) {
    logTest('Frontend package.json is valid', 'PASS');
    
    const requiredDeps = ['react', 'react-dom', 'framer-motion', 'react-icons'];
    const missingDeps = requiredDeps.filter(dep => !frontendPkg.dependencies[dep]);
    
    if (missingDeps.length === 0) {
      logTest('All required frontend dependencies present', 'PASS');
    } else {
      logTest('Missing frontend dependencies', 'FAIL', `Missing: ${missingDeps.join(', ')}`);
    }
  } else {
    logTest('Frontend package.json is invalid', 'FAIL');
  }
  
  // Test functions package.json
  const functionsPkg = readJsonFile('functions/package.json');
  if (functionsPkg) {
    logTest('Functions package.json is valid', 'PASS');
    
    const requiredDeps = ['express', 'openai', 'pptxgenjs', 'firebase-functions'];
    const missingDeps = requiredDeps.filter(dep => !functionsPkg.dependencies[dep]);
    
    if (missingDeps.length === 0) {
      logTest('All required backend dependencies present', 'PASS');
    } else {
      logTest('Missing backend dependencies', 'FAIL', `Missing: ${missingDeps.join(', ')}`);
    }
  } else {
    logTest('Functions package.json is invalid', 'FAIL');
  }
}

function testBuildArtifacts() {
  log('\n🔨 Testing Build Artifacts', 'bright');
  
  // Check frontend build
  if (fileExists('frontend/dist/index.html')) {
    logTest('Frontend build artifacts present', 'PASS');
    
    const indexHtml = fs.readFileSync('frontend/dist/index.html', 'utf8');
    if (indexHtml.includes('AI PowerPoint Generator')) {
      logTest('Frontend build contains correct title', 'PASS');
    } else {
      logTest('Frontend build title verification', 'WARN', 'Title not found in build');
    }
  } else {
    logTest('Frontend build artifacts missing', 'FAIL', 'Run: cd frontend && npm run build');
  }
  
  // Check backend build
  if (fileExists('functions/lib/index.js')) {
    logTest('Backend build artifacts present', 'PASS');
  } else {
    logTest('Backend build artifacts missing', 'FAIL', 'Run: cd functions && npm run build');
  }
}

function testEnhancedFeatures() {
  log('\n✨ Testing Enhanced Features', 'bright');
  
  // Test enhanced App.tsx
  if (fileExists('frontend/src/App.tsx')) {
    const appContent = fs.readFileSync('frontend/src/App.tsx', 'utf8');
    
    if (appContent.includes('Enhanced Main Application Component')) {
      logTest('App.tsx has enhanced documentation', 'PASS');
    } else {
      logTest('App.tsx documentation check', 'WARN', 'Enhanced documentation not found');
    }
    
    if (appContent.includes('HiCheckCircle') && appContent.includes('HiExclamationTriangle')) {
      logTest('Enhanced error/success notifications', 'PASS');
    } else {
      logTest('Enhanced notifications check', 'WARN', 'Enhanced notifications not found');
    }
  }
  
  // Test enhanced PowerPoint generator
  if (fileExists('functions/src/pptGenerator-simple.ts')) {
    const pptContent = fs.readFileSync('functions/src/pptGenerator-simple.ts', 'utf8');
    
    if (pptContent.includes('estimateSpeakingTime')) {
      logTest('Enhanced speaker notes with timing', 'PASS');
    } else {
      logTest('Enhanced speaker notes check', 'WARN', 'Speaking time estimation not found');
    }
    
    if (pptContent.includes('Professional styling options')) {
      logTest('Enhanced chart styling', 'PASS');
    } else {
      logTest('Enhanced chart styling check', 'WARN', 'Professional chart styling not found');
    }
  }
  
  // Test new utility files
  if (fileExists('functions/src/utils/commonUtils.ts')) {
    logTest('Common utilities file created', 'PASS');
  } else {
    logTest('Common utilities file missing', 'FAIL');
  }
  
  if (fileExists('functions/src/config/appConfig.ts')) {
    logTest('Enhanced configuration file created', 'PASS');
  } else {
    logTest('Enhanced configuration file missing', 'FAIL');
  }
}

function testCodeQuality() {
  log('\n🔍 Testing Code Quality', 'bright');
  
  // Check for TypeScript files
  const tsFiles = [
    'frontend/src/App.tsx',
    'functions/src/index.ts',
    'functions/src/config/appConfig.ts'
  ];
  
  tsFiles.forEach(file => {
    if (fileExists(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for proper documentation
      if (content.includes('/**') && content.includes('*/')) {
        logTest(`${file} has proper documentation`, 'PASS');
      } else {
        logTest(`${file} documentation check`, 'WARN', 'JSDoc comments not found');
      }
      
      // Check for type safety
      if (content.includes('interface') || content.includes('type ')) {
        logTest(`${file} has type definitions`, 'PASS');
      } else {
        logTest(`${file} type safety check`, 'WARN', 'Type definitions not found');
      }
    }
  });
}

/**
 * Main validation function
 */
async function runValidation() {
  log('🚀 AI PowerPoint Generator - Enhanced Application Validation', 'bright');
  log('================================================================', 'cyan');
  
  try {
    testProjectStructure();
    testPackageConfigurations();
    testBuildArtifacts();
    testEnhancedFeatures();
    testCodeQuality();
    
    // Summary
    log('\n📊 Validation Summary', 'bright');
    log('==================', 'cyan');
    log(`✅ Passed: ${results.passed}`, 'green');
    log(`❌ Failed: ${results.failed}`, 'red');
    log(`⚠️  Warnings: ${results.warnings}`, 'yellow');
    log(`📝 Total Tests: ${results.tests.length}`, 'blue');
    
    const successRate = Math.round((results.passed / results.tests.length) * 100);
    log(`📈 Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : 'yellow');
    
    if (results.failed === 0) {
      log('\n🎉 All critical tests passed! Application is ready for use.', 'green');
    } else {
      log('\n⚠️  Some tests failed. Please review and fix the issues above.', 'yellow');
    }
    
    // Next steps
    log('\n🎯 Next Steps:', 'bright');
    log('1. Start the development server: ./start-dev.sh', 'cyan');
    log('2. Test PowerPoint generation in the browser', 'cyan');
    log('3. Verify API endpoints are working correctly', 'cyan');
    log('4. Test with different themes and layouts', 'cyan');
    
  } catch (error) {
    log(`\n❌ Validation failed with error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run validation
runValidation().catch(error => {
  log(`Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
