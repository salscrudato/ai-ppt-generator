#!/usr/bin/env node

/**
 * AI Agent Code Quality Analyzer
 * 
 * Analyzes code quality, identifies issues, and suggests improvements
 * specifically optimized for AI agent development workflows.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

const fs = require('fs');
const path = require('path');

/**
 * Code quality analyzer with AI-specific checks
 */
class QualityAnalyzer {
  constructor() {
    this.metrics = {
      files: 0,
      lines: 0,
      functions: 0,
      classes: 0,
      interfaces: 0,
      tests: 0,
      issues: []
    };
    
    this.rules = {
      // AI Agent specific rules
      aiCompatibility: [
        this.checkDocumentationQuality,
        this.checkTypeScriptUsage,
        this.checkErrorHandling,
        this.checkFunctionComplexity,
        this.checkNamingConventions
      ],
      
      // General code quality rules
      codeQuality: [
        this.checkFileSize,
        this.checkDuplication,
        this.checkTestCoverage,
        this.checkImportStructure,
        this.checkSecurityPatterns
      ]
    };
  }

  /**
   * Analyze files or entire codebase
   */
  analyze(files = null) {
    console.log('🔍 Starting code quality analysis...');
    
    const filesToAnalyze = files || this.getAllSourceFiles();
    
    filesToAnalyze.forEach(filePath => {
      this.analyzeFile(filePath);
    });
    
    this.generateReport();
  }

  /**
   * Get all source files
   */
  getAllSourceFiles() {
    const files = [];
    const directories = ['functions/src', 'frontend/src', 'test'];
    
    directories.forEach(dir => {
      if (fs.existsSync(dir)) {
        this.collectFiles(dir, files);
      }
    });
    
    return files;
  }

  /**
   * Recursively collect files
   */
  collectFiles(dir, files) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !['node_modules', 'dist', 'lib'].includes(item)) {
        this.collectFiles(fullPath, files);
      } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(item)) {
        files.push(fullPath);
      }
    });
  }

  /**
   * Analyze individual file
   */
  analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      this.metrics.files++;
      this.metrics.lines += lines.length;
      
      // Run all quality checks
      const context = {
        filePath,
        content,
        lines,
        isTest: filePath.includes('test'),
        isTypeScript: filePath.endsWith('.ts') || filePath.endsWith('.tsx'),
        isFrontend: filePath.includes('frontend'),
        isBackend: filePath.includes('functions')
      };
      
      // Run AI compatibility checks
      this.rules.aiCompatibility.forEach(rule => {
        rule.call(this, context);
      });
      
      // Run general quality checks
      this.rules.codeQuality.forEach(rule => {
        rule.call(this, context);
      });
      
    } catch (error) {
      this.addIssue('error', filePath, 0, `Failed to analyze file: ${error.message}`);
    }
  }

  /**
   * Check documentation quality (AI-specific)
   */
  checkDocumentationQuality(context) {
    const { filePath, content, lines } = context;
    
    // Check for JSDoc comments
    const jsdocMatches = content.match(/\/\*\*[\s\S]*?\*\//g) || [];
    const functionMatches = content.match(/(?:export\s+)?(?:async\s+)?function\s+\w+|(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?\(/g) || [];
    
    this.metrics.functions += functionMatches.length;
    
    if (functionMatches.length > 0 && jsdocMatches.length === 0) {
      this.addIssue('warning', filePath, 0, 'No JSDoc comments found - AI agents benefit from detailed documentation');
    }
    
    // Check for TODO/FIXME comments
    lines.forEach((line, index) => {
      if (line.includes('TODO') || line.includes('FIXME')) {
        this.addIssue('info', filePath, index + 1, 'TODO/FIXME comment found - consider addressing for AI clarity');
      }
    });
    
    // Check for meaningful comments
    const commentLines = lines.filter(line => line.trim().startsWith('//') || line.includes('/*'));
    const codeLines = lines.filter(line => line.trim() && !line.trim().startsWith('//') && !line.includes('/*'));
    
    if (codeLines.length > 50 && commentLines.length < codeLines.length * 0.1) {
      this.addIssue('warning', filePath, 0, 'Low comment ratio - consider adding more explanatory comments for AI agents');
    }
  }

  /**
   * Check TypeScript usage
   */
  checkTypeScriptUsage(context) {
    const { filePath, content, isTypeScript } = context;
    
    if (!isTypeScript && !filePath.includes('test') && !filePath.includes('config')) {
      this.addIssue('warning', filePath, 0, 'Consider migrating to TypeScript for better AI agent compatibility');
    }
    
    if (isTypeScript) {
      // Check for 'any' usage
      const anyMatches = content.match(/:\s*any\b/g) || [];
      if (anyMatches.length > 0) {
        this.addIssue('warning', filePath, 0, `Found ${anyMatches.length} 'any' types - consider using specific types for AI clarity`);
      }
      
      // Check for interface definitions
      const interfaceMatches = content.match(/(?:export\s+)?interface\s+\w+/g) || [];
      this.metrics.interfaces += interfaceMatches.length;
      
      // Check for class definitions
      const classMatches = content.match(/(?:export\s+)?class\s+\w+/g) || [];
      this.metrics.classes += classMatches.length;
    }
  }

  /**
   * Check error handling
   */
  checkErrorHandling(context) {
    const { filePath, content } = context;
    
    // Check for try-catch blocks
    const tryMatches = content.match(/try\s*{/g) || [];
    const asyncMatches = content.match(/async\s+function|async\s+\(/g) || [];
    
    if (asyncMatches.length > 0 && tryMatches.length === 0) {
      this.addIssue('warning', filePath, 0, 'Async functions without try-catch blocks - consider adding error handling');
    }
    
    // Check for proper error types
    if (content.includes('catch') && !content.includes('Error')) {
      this.addIssue('info', filePath, 0, 'Consider using typed error handling for better AI agent understanding');
    }
  }

  /**
   * Check function complexity
   */
  checkFunctionComplexity(context) {
    const { filePath, content } = context;
    
    // Simple complexity check based on cyclomatic complexity indicators
    const complexityIndicators = [
      /if\s*\(/g,
      /else\s*if/g,
      /while\s*\(/g,
      /for\s*\(/g,
      /switch\s*\(/g,
      /case\s+/g,
      /catch\s*\(/g,
      /&&/g,
      /\|\|/g
    ];
    
    const functions = content.match(/(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?\()/g) || [];
    
    functions.forEach(func => {
      const funcStart = content.indexOf(func);
      const funcEnd = this.findFunctionEnd(content, funcStart);
      const funcContent = content.substring(funcStart, funcEnd);
      
      let complexity = 1; // Base complexity
      complexityIndicators.forEach(indicator => {
        const matches = funcContent.match(indicator) || [];
        complexity += matches.length;
      });
      
      if (complexity > 10) {
        this.addIssue('warning', filePath, 0, `High complexity function detected (${complexity}) - consider refactoring for AI readability`);
      }
    });
  }

  /**
   * Check naming conventions
   */
  checkNamingConventions(context) {
    const { filePath, content } = context;
    
    // Check for consistent naming
    const camelCasePattern = /^[a-z][a-zA-Z0-9]*$/;
    const PascalCasePattern = /^[A-Z][a-zA-Z0-9]*$/;
    
    // Extract function names
    const functionNames = content.match(/(?:function\s+(\w+)|const\s+(\w+)\s*=)/g) || [];
    functionNames.forEach(match => {
      const name = match.match(/\w+/g)?.[1];
      if (name && !camelCasePattern.test(name) && !name.startsWith('_')) {
        this.addIssue('info', filePath, 0, `Function name '${name}' doesn't follow camelCase convention`);
      }
    });
  }

  /**
   * Check file size
   */
  checkFileSize(context) {
    const { filePath, lines } = context;
    
    if (lines.length > 500) {
      this.addIssue('warning', filePath, 0, `Large file (${lines.length} lines) - consider splitting for better maintainability`);
    }
  }

  /**
   * Check for code duplication
   */
  checkDuplication(context) {
    const { filePath, content } = context;
    
    // Simple duplication check - look for repeated function patterns
    const functions = content.match(/function\s+\w+\([^)]*\)\s*{[^}]+}/g) || [];
    const duplicates = new Map();
    
    functions.forEach(func => {
      const signature = func.substring(0, func.indexOf('{')).trim();
      if (duplicates.has(signature)) {
        duplicates.set(signature, duplicates.get(signature) + 1);
      } else {
        duplicates.set(signature, 1);
      }
    });
    
    duplicates.forEach((count, signature) => {
      if (count > 1) {
        this.addIssue('info', filePath, 0, `Potential code duplication detected: ${signature}`);
      }
    });
  }

  /**
   * Check test coverage
   */
  checkTestCoverage(context) {
    const { filePath, isTest } = context;
    
    if (isTest) {
      this.metrics.tests++;
    }
    
    // Check if source file has corresponding test
    if (!isTest && !filePath.includes('config') && !filePath.includes('types')) {
      const testPath = filePath.replace(/\.(ts|js)$/, '.test.$1');
      const altTestPath = filePath.replace('src/', 'test/').replace(/\.(ts|js)$/, '.test.$1');
      
      if (!fs.existsSync(testPath) && !fs.existsSync(altTestPath)) {
        this.addIssue('info', filePath, 0, 'No corresponding test file found - consider adding tests');
      }
    }
  }

  /**
   * Check import structure
   */
  checkImportStructure(context) {
    const { filePath, content } = context;
    
    const imports = content.match(/import\s+.*?from\s+['"][^'"]+['"]/g) || [];
    
    // Check for relative import depth
    imports.forEach(imp => {
      const relativePath = imp.match(/from\s+['"]([^'"]+)['"]/)?.[1];
      if (relativePath && relativePath.startsWith('../')) {
        const depth = (relativePath.match(/\.\.\//g) || []).length;
        if (depth > 3) {
          this.addIssue('warning', filePath, 0, `Deep relative import (${depth} levels) - consider restructuring`);
        }
      }
    });
  }

  /**
   * Check security patterns
   */
  checkSecurityPatterns(context) {
    const { filePath, content } = context;
    
    // Check for potential security issues
    const securityPatterns = [
      { pattern: /eval\s*\(/, message: 'Use of eval() detected - potential security risk' },
      { pattern: /innerHTML\s*=/, message: 'Use of innerHTML - consider using textContent or sanitization' },
      { pattern: /document\.write/, message: 'Use of document.write - potential XSS risk' },
      { pattern: /process\.env\.\w+/g, message: 'Environment variable usage - ensure proper validation' }
    ];
    
    securityPatterns.forEach(({ pattern, message }) => {
      if (pattern.test(content)) {
        this.addIssue('warning', filePath, 0, message);
      }
    });
  }

  /**
   * Helper function to find function end
   */
  findFunctionEnd(content, start) {
    let braceCount = 0;
    let inFunction = false;
    
    for (let i = start; i < content.length; i++) {
      if (content[i] === '{') {
        braceCount++;
        inFunction = true;
      } else if (content[i] === '}') {
        braceCount--;
        if (inFunction && braceCount === 0) {
          return i + 1;
        }
      }
    }
    
    return content.length;
  }

  /**
   * Add issue to metrics
   */
  addIssue(severity, file, line, message) {
    this.metrics.issues.push({
      severity,
      file,
      line,
      message
    });
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.log('\n📊 Code Quality Analysis Report\n');
    
    // Summary metrics
    console.log('📈 Summary:');
    console.log(`   Files analyzed: ${this.metrics.files}`);
    console.log(`   Total lines: ${this.metrics.lines.toLocaleString()}`);
    console.log(`   Functions: ${this.metrics.functions}`);
    console.log(`   Classes: ${this.metrics.classes}`);
    console.log(`   Interfaces: ${this.metrics.interfaces}`);
    console.log(`   Test files: ${this.metrics.tests}`);
    
    // Issues breakdown
    const issuesByType = this.metrics.issues.reduce((acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n🚨 Issues:');
    console.log(`   Errors: ${issuesByType.error || 0}`);
    console.log(`   Warnings: ${issuesByType.warning || 0}`);
    console.log(`   Info: ${issuesByType.info || 0}`);
    
    // Top issues
    if (this.metrics.issues.length > 0) {
      console.log('\n🔍 Top Issues:');
      this.metrics.issues
        .sort((a, b) => {
          const severityOrder = { error: 3, warning: 2, info: 1 };
          return severityOrder[b.severity] - severityOrder[a.severity];
        })
        .slice(0, 10)
        .forEach((issue, index) => {
          const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
          console.log(`   ${index + 1}. ${icon} ${issue.file}:${issue.line || 0}`);
          console.log(`      ${issue.message}`);
        });
    }
    
    // AI Agent compatibility score
    const totalIssues = this.metrics.issues.length;
    const errorWeight = (issuesByType.error || 0) * 3;
    const warningWeight = (issuesByType.warning || 0) * 2;
    const infoWeight = (issuesByType.info || 0) * 1;
    
    const maxScore = 100;
    const penaltyScore = Math.min(errorWeight + warningWeight + infoWeight, maxScore);
    const compatibilityScore = Math.max(0, maxScore - penaltyScore);
    
    console.log(`\n🤖 AI Agent Compatibility Score: ${compatibilityScore}/100`);
    
    if (compatibilityScore >= 90) {
      console.log('   ✅ Excellent - Highly optimized for AI agent development');
    } else if (compatibilityScore >= 75) {
      console.log('   ✅ Good - Well-suited for AI agent development');
    } else if (compatibilityScore >= 60) {
      console.log('   ⚠️  Fair - Some improvements needed for optimal AI agent compatibility');
    } else {
      console.log('   ❌ Poor - Significant improvements needed for AI agent development');
    }
    
    console.log('\n✅ Analysis complete!');
  }
}

/**
 * Command line interface
 */
function main() {
  const args = process.argv.slice(2);
  const analyzer = new QualityAnalyzer();
  
  if (args.includes('--files')) {
    const filesIndex = args.indexOf('--files');
    const filesArg = args[filesIndex + 1];
    
    if (!filesArg) {
      console.log('❌ Please provide file paths: --files "file1.ts,file2.ts"');
      return;
    }
    
    const files = filesArg.split(',').map(f => f.trim());
    analyzer.analyze(files);
  }
  else if (args.includes('--full-scan')) {
    analyzer.analyze();
  }
  else if (args.includes('--ai-compatibility')) {
    console.log('🤖 Running AI Agent compatibility analysis...');
    analyzer.analyze();
  }
  else {
    console.log(`
🤖 AI Agent Code Quality Analyzer

Usage:
  node tools/quality-analyzer.js --full-scan
  node tools/quality-analyzer.js --files "file1.ts,file2.ts"
  node tools/quality-analyzer.js --ai-compatibility

Options:
  --full-scan          Analyze entire codebase
  --files <list>       Analyze specific files (comma-separated)
  --ai-compatibility   Focus on AI agent compatibility

Examples:
  node tools/quality-analyzer.js --full-scan
  node tools/quality-analyzer.js --files "functions/src/llm.ts,functions/src/schema.ts"
    `);
  }
}

if (require.main === module) {
  main();
}

module.exports = { QualityAnalyzer };
