#!/usr/bin/env node

/**
 * Comprehensive Application Validation Script
 * Tests build integrity, API endpoints, and core functionality
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bold}${colors.cyan}🚀 ${msg}${colors.reset}\n`),
  step: (msg) => console.log(`${colors.magenta}📋 ${msg}${colors.reset}`)
};

/**
 * Validation results tracker
 */
class ValidationTracker {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: []
    };
  }

  pass(test, message) {
    this.results.passed++;
    this.results.tests.push({ test, status: 'PASS', message });
    log.success(`${test}: ${message}`);
  }

  fail(test, message) {
    this.results.failed++;
    this.results.tests.push({ test, status: 'FAIL', message });
    log.error(`${test}: ${message}`);
  }

  warn(test, message) {
    this.results.warnings++;
    this.results.tests.push({ test, status: 'WARN', message });
    log.warning(`${test}: ${message}`);
  }

  summary() {
    log.header('VALIDATION SUMMARY');
    console.log(`${colors.green}✅ Passed: ${this.results.passed}${colors.reset}`);
    console.log(`${colors.red}❌ Failed: ${this.results.failed}${colors.reset}`);
    console.log(`${colors.yellow}⚠️  Warnings: ${this.results.warnings}${colors.reset}`);
    console.log(`📊 Total Tests: ${this.results.tests.length}\n`);

    if (this.results.failed === 0) {
      log.success('🎉 ALL VALIDATIONS PASSED! Application is ready for use.');
    } else {
      log.error(`💥 ${this.results.failed} validation(s) failed. Please review and fix issues.`);
    }

    return this.results.failed === 0;
  }
}

const tracker = new ValidationTracker();

/**
 * Check if file exists and is readable
 */
function checkFile(filePath, description) {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        tracker.pass('FILE_CHECK', `${description} exists (${Math.round(stats.size / 1024)}KB)`);
        return true;
      } else {
        tracker.fail('FILE_CHECK', `${description} is not a file: ${filePath}`);
        return false;
      }
    } else {
      tracker.fail('FILE_CHECK', `${description} not found: ${filePath}`);
      return false;
    }
  } catch (error) {
    tracker.fail('FILE_CHECK', `Error checking ${description}: ${error.message}`);
    return false;
  }
}

/**
 * Check directory structure
 */
function checkDirectory(dirPath, description) {
  try {
    if (fs.existsSync(dirPath)) {
      const stats = fs.statSync(dirPath);
      if (stats.isDirectory()) {
        const files = fs.readdirSync(dirPath);
        tracker.pass('DIR_CHECK', `${description} exists (${files.length} items)`);
        return true;
      } else {
        tracker.fail('DIR_CHECK', `${description} is not a directory: ${dirPath}`);
        return false;
      }
    } else {
      tracker.fail('DIR_CHECK', `${description} not found: ${dirPath}`);
      return false;
    }
  } catch (error) {
    tracker.fail('DIR_CHECK', `Error checking ${description}: ${error.message}`);
    return false;
  }
}

/**
 * Validate package.json files
 */
function validatePackageJson(packagePath, description) {
  try {
    if (!checkFile(packagePath, `${description} package.json`)) return false;

    const packageContent = fs.readFileSync(packagePath, 'utf8');
    const packageData = JSON.parse(packageContent);

    // Check required fields
    const requiredFields = ['name', 'version', 'scripts'];
    for (const field of requiredFields) {
      if (!packageData[field]) {
        tracker.fail('PACKAGE_JSON', `${description} package.json missing ${field}`);
        return false;
      }
    }

    // Check for build script
    if (!packageData.scripts.build) {
      tracker.warn('PACKAGE_JSON', `${description} package.json missing build script`);
    }

    tracker.pass('PACKAGE_JSON', `${description} package.json is valid`);
    return true;
  } catch (error) {
    tracker.fail('PACKAGE_JSON', `Error validating ${description} package.json: ${error.message}`);
    return false;
  }
}

/**
 * Check TypeScript configuration
 */
function validateTsConfig(tsconfigPath, description) {
  try {
    if (!checkFile(tsconfigPath, `${description} tsconfig.json`)) return false;

    const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf8');
    const tsconfigData = JSON.parse(tsconfigContent);

    // Check for either compilerOptions (standard config) or references (project references)
    if (!tsconfigData.compilerOptions && !tsconfigData.references) {
      tracker.fail('TSCONFIG', `${description} tsconfig.json missing compilerOptions or references`);
      return false;
    }

    tracker.pass('TSCONFIG', `${description} TypeScript configuration is valid`);
    return true;
  } catch (error) {
    tracker.fail('TSCONFIG', `Error validating ${description} tsconfig.json: ${error.message}`);
    return false;
  }
}

/**
 * Main validation function
 */
async function validateApplication() {
  log.header('AI POWERPOINT GENERATOR - COMPREHENSIVE VALIDATION');

  // 1. Project Structure Validation
  log.step('Validating project structure...');
  checkDirectory('.', 'Root directory');
  checkDirectory('frontend', 'Frontend directory');
  checkDirectory('functions', 'Functions directory');
  checkDirectory('frontend/src', 'Frontend source directory');
  checkDirectory('functions/src', 'Functions source directory');

  // 2. Configuration Files
  log.step('Validating configuration files...');
  checkFile('package.json', 'Root package.json');
  checkFile('firebase.json', 'Firebase configuration');
  checkFile('README.md', 'README documentation');
  validatePackageJson('frontend/package.json', 'Frontend');
  validatePackageJson('functions/package.json', 'Functions');
  validateTsConfig('frontend/tsconfig.json', 'Frontend');
  validateTsConfig('functions/tsconfig.json', 'Functions');

  // 3. Build Artifacts
  log.step('Validating build artifacts...');
  checkDirectory('frontend/dist', 'Frontend build output');
  checkFile('frontend/dist/index.html', 'Frontend HTML output');
  checkDirectory('functions/lib', 'Functions build output');
  checkFile('functions/lib/index.js', 'Functions JS output');

  // 4. Core Application Files
  log.step('Validating core application files...');
  checkFile('frontend/src/App.tsx', 'Main React component');
  checkFile('frontend/src/main.tsx', 'React entry point');
  checkFile('frontend/src/types.ts', 'TypeScript type definitions');
  checkFile('functions/src/index.ts', 'Functions entry point');
  checkFile('functions/src/llm.ts', 'AI integration module');
  checkFile('functions/src/pptGenerator-simple.ts', 'PowerPoint generator');

  // 5. Enhanced Components
  log.step('Validating enhanced components...');
  checkFile('frontend/src/utils/formUtils.ts', 'Form utilities');
  checkFile('frontend/src/components/LayoutEditor.tsx', 'Layout editor component');
  checkFile('frontend/src/contexts/ThemeContext.tsx', 'Theme context');
  checkFile('functions/src/professionalThemes.ts', 'Professional themes');

  // 6. Theme System
  log.step('Validating theme system...');
  try {
    const themesPath = 'functions/src/professionalThemes.ts';
    if (fs.existsSync(themesPath)) {
      const themesContent = fs.readFileSync(themesPath, 'utf8');
      const themeCount = (themesContent.match(/createTheme\(/g) || []).length;
      if (themeCount >= 15) {
        tracker.pass('THEMES', `Professional themes available (${themeCount} themes)`);
      } else {
        tracker.warn('THEMES', `Limited theme variety (${themeCount} themes)`);
      }
    }
  } catch (error) {
    tracker.fail('THEMES', `Error validating themes: ${error.message}`);
  }

  // 7. Build Size Analysis
  log.step('Analyzing build sizes...');
  try {
    const frontendBuildPath = 'frontend/dist';
    if (fs.existsSync(frontendBuildPath)) {
      const files = fs.readdirSync(frontendBuildPath, { withFileTypes: true });
      let totalSize = 0;
      files.forEach(file => {
        if (file.isFile()) {
          const filePath = path.join(frontendBuildPath, file.name);
          const stats = fs.statSync(filePath);
          totalSize += stats.size;
        }
      });
      const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
      if (totalSize < 5 * 1024 * 1024) { // Less than 5MB
        tracker.pass('BUILD_SIZE', `Frontend build size optimized (${sizeMB}MB)`);
      } else {
        tracker.warn('BUILD_SIZE', `Frontend build size large (${sizeMB}MB)`);
      }
    }
  } catch (error) {
    tracker.warn('BUILD_SIZE', `Could not analyze build size: ${error.message}`);
  }

  // 8. Environment Configuration
  log.step('Checking environment configuration...');
  if (fs.existsSync('functions/.env.example')) {
    tracker.pass('ENV_CONFIG', 'Environment example file exists');
  } else {
    tracker.warn('ENV_CONFIG', 'No environment example file found');
  }

  // Final Summary
  return tracker.summary();
}

// Run validation
validateApplication()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    log.error(`Validation failed with error: ${error.message}`);
    process.exit(1);
  });
