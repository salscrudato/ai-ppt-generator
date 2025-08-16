#!/usr/bin/env node

/**
 * AI Agent Code Navigator
 * 
 * Intelligent code exploration tool that helps AI agents understand
 * the codebase structure, find specific functionality, and analyze
 * dependencies with detailed insights.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  sourceDirectories: [
    'functions/src',
    'frontend/src',
    'test'
  ],
  excludePatterns: [
    'node_modules',
    'dist',
    'lib',
    '.git',
    'cache'
  ],
  fileExtensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.md']
};

/**
 * Main navigation functions
 */
class AINavigator {
  constructor() {
    this.codebase = new Map();
    this.dependencies = new Map();
    this.loadCodebase();
  }

  /**
   * Load and index the entire codebase
   */
  loadCodebase() {
    console.log('🔍 Indexing codebase...');
    
    CONFIG.sourceDirectories.forEach(dir => {
      if (fs.existsSync(dir)) {
        this.indexDirectory(dir);
      }
    });
    
    console.log(`✅ Indexed ${this.codebase.size} files`);
  }

  /**
   * Recursively index a directory
   */
  indexDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !CONFIG.excludePatterns.includes(item)) {
        this.indexDirectory(fullPath);
      } else if (stat.isFile() && this.shouldIncludeFile(fullPath)) {
        this.indexFile(fullPath);
      }
    });
  }

  /**
   * Check if file should be included in index
   */
  shouldIncludeFile(filePath) {
    const ext = path.extname(filePath);
    return CONFIG.fileExtensions.includes(ext);
  }

  /**
   * Index a single file
   */
  indexFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const metadata = this.analyzeFile(filePath, content);
      this.codebase.set(filePath, metadata);
    } catch (error) {
      console.warn(`⚠️  Could not index ${filePath}: ${error.message}`);
    }
  }

  /**
   * Analyze file content and extract metadata
   */
  analyzeFile(filePath, content) {
    const lines = content.split('\n');
    const metadata = {
      path: filePath,
      size: content.length,
      lines: lines.length,
      type: this.getFileType(filePath),
      exports: this.extractExports(content),
      imports: this.extractImports(content),
      functions: this.extractFunctions(content),
      classes: this.extractClasses(content),
      interfaces: this.extractInterfaces(content),
      comments: this.extractComments(content),
      keywords: this.extractKeywords(content)
    };
    
    return metadata;
  }

  /**
   * Determine file type based on path and content
   */
  getFileType(filePath) {
    if (filePath.includes('test')) return 'test';
    if (filePath.includes('functions/src')) return 'backend';
    if (filePath.includes('frontend/src')) return 'frontend';
    if (filePath.endsWith('.md')) return 'documentation';
    if (filePath.endsWith('.json')) return 'configuration';
    return 'other';
  }

  /**
   * Extract export statements
   */
  extractExports(content) {
    const exportRegex = /export\s+(?:default\s+)?(?:class|function|const|let|var|interface|type)\s+(\w+)/g;
    const exports = [];
    let match;
    
    while ((match = exportRegex.exec(content)) !== null) {
      exports.push(match[1]);
    }
    
    return exports;
  }

  /**
   * Extract import statements
   */
  extractImports(content) {
    const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
    const imports = [];
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }

  /**
   * Extract function definitions
   */
  extractFunctions(content) {
    const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(/g;
    const functions = [];
    let match;
    
    while ((match = functionRegex.exec(content)) !== null) {
      functions.push(match[1] || match[2]);
    }
    
    return functions;
  }

  /**
   * Extract class definitions
   */
  extractClasses(content) {
    const classRegex = /(?:export\s+)?class\s+(\w+)/g;
    const classes = [];
    let match;
    
    while ((match = classRegex.exec(content)) !== null) {
      classes.push(match[1]);
    }
    
    return classes;
  }

  /**
   * Extract TypeScript interfaces
   */
  extractInterfaces(content) {
    const interfaceRegex = /(?:export\s+)?interface\s+(\w+)/g;
    const interfaces = [];
    let match;
    
    while ((match = interfaceRegex.exec(content)) !== null) {
      interfaces.push(match[1]);
    }
    
    return interfaces;
  }

  /**
   * Extract meaningful comments
   */
  extractComments(content) {
    const commentRegex = /\/\*\*([\s\S]*?)\*\/|\/\/\s*(.+)/g;
    const comments = [];
    let match;
    
    while ((match = commentRegex.exec(content)) !== null) {
      const comment = (match[1] || match[2]).trim();
      if (comment.length > 10) { // Only meaningful comments
        comments.push(comment);
      }
    }
    
    return comments.slice(0, 5); // Limit to top 5 comments
  }

  /**
   * Extract relevant keywords for search
   */
  extractKeywords(content) {
    const keywords = new Set();
    
    // Technical keywords
    const techKeywords = [
      'slide', 'presentation', 'powerpoint', 'theme', 'layout', 'generate',
      'openai', 'ai', 'gpt', 'dalle', 'api', 'endpoint', 'schema', 'validation',
      'react', 'component', 'hook', 'state', 'props', 'typescript', 'interface'
    ];
    
    const lowerContent = content.toLowerCase();
    techKeywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) {
        keywords.add(keyword);
      }
    });
    
    return Array.from(keywords);
  }

  /**
   * Find files related to specific functionality
   */
  findFunctionality(searchTerm) {
    console.log(`🔍 Searching for: "${searchTerm}"`);
    
    const results = [];
    const searchLower = searchTerm.toLowerCase();
    
    this.codebase.forEach((metadata, filePath) => {
      let relevanceScore = 0;
      const matches = [];
      
      // Check file path
      if (filePath.toLowerCase().includes(searchLower)) {
        relevanceScore += 10;
        matches.push('File path');
      }
      
      // Check keywords
      metadata.keywords.forEach(keyword => {
        if (keyword.includes(searchLower)) {
          relevanceScore += 5;
          matches.push(`Keyword: ${keyword}`);
        }
      });
      
      // Check exports
      metadata.exports.forEach(exp => {
        if (exp.toLowerCase().includes(searchLower)) {
          relevanceScore += 8;
          matches.push(`Export: ${exp}`);
        }
      });
      
      // Check functions
      metadata.functions.forEach(func => {
        if (func.toLowerCase().includes(searchLower)) {
          relevanceScore += 6;
          matches.push(`Function: ${func}`);
        }
      });
      
      // Check comments
      metadata.comments.forEach(comment => {
        if (comment.toLowerCase().includes(searchLower)) {
          relevanceScore += 3;
          matches.push('Comment match');
        }
      });
      
      if (relevanceScore > 0) {
        results.push({
          path: filePath,
          type: metadata.type,
          relevanceScore,
          matches,
          metadata
        });
      }
    });
    
    // Sort by relevance
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    return results.slice(0, 10); // Top 10 results
  }

  /**
   * Analyze dependencies for a specific file
   */
  analyzeDependencies(filePath) {
    console.log(`🔗 Analyzing dependencies for: ${filePath}`);
    
    const metadata = this.codebase.get(filePath);
    if (!metadata) {
      console.log('❌ File not found in index');
      return null;
    }
    
    const analysis = {
      file: filePath,
      directDependencies: [],
      dependents: [],
      circularDependencies: []
    };
    
    // Find direct dependencies
    metadata.imports.forEach(importPath => {
      const resolvedPath = this.resolveImportPath(filePath, importPath);
      if (resolvedPath && this.codebase.has(resolvedPath)) {
        analysis.directDependencies.push(resolvedPath);
      }
    });
    
    // Find files that depend on this file
    this.codebase.forEach((otherMetadata, otherPath) => {
      if (otherPath !== filePath) {
        otherMetadata.imports.forEach(importPath => {
          const resolvedPath = this.resolveImportPath(otherPath, importPath);
          if (resolvedPath === filePath) {
            analysis.dependents.push(otherPath);
          }
        });
      }
    });
    
    return analysis;
  }

  /**
   * Resolve import path to actual file path
   */
  resolveImportPath(fromFile, importPath) {
    // Simple resolution - can be enhanced
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      const fromDir = path.dirname(fromFile);
      const resolved = path.resolve(fromDir, importPath);
      
      // Try different extensions
      for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
        const withExt = resolved + ext;
        if (this.codebase.has(withExt)) {
          return withExt;
        }
      }
    }
    
    return null;
  }

  /**
   * Display search results
   */
  displayResults(results) {
    if (results.length === 0) {
      console.log('❌ No results found');
      return;
    }
    
    console.log(`\n📊 Found ${results.length} relevant files:\n`);
    
    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.path}`);
      console.log(`   Type: ${result.type} | Score: ${result.relevanceScore}`);
      console.log(`   Matches: ${result.matches.join(', ')}`);
      console.log(`   Exports: ${result.metadata.exports.join(', ') || 'None'}`);
      console.log(`   Functions: ${result.metadata.functions.join(', ') || 'None'}`);
      console.log('');
    });
  }

  /**
   * Display dependency analysis
   */
  displayDependencyAnalysis(analysis) {
    if (!analysis) return;
    
    console.log(`\n📊 Dependency Analysis for ${analysis.file}:\n`);
    
    console.log(`📥 Direct Dependencies (${analysis.directDependencies.length}):`);
    analysis.directDependencies.forEach(dep => console.log(`   - ${dep}`));
    
    console.log(`\n📤 Dependents (${analysis.dependents.length}):`);
    analysis.dependents.forEach(dep => console.log(`   - ${dep}`));
    
    if (analysis.circularDependencies.length > 0) {
      console.log(`\n⚠️  Circular Dependencies (${analysis.circularDependencies.length}):`);
      analysis.circularDependencies.forEach(dep => console.log(`   - ${dep}`));
    }
  }
}

/**
 * Command line interface
 */
function main() {
  const args = process.argv.slice(2);
  const navigator = new AINavigator();
  
  if (args.includes('--find')) {
    const searchIndex = args.indexOf('--find');
    const searchTerm = args[searchIndex + 1];
    
    if (!searchTerm) {
      console.log('❌ Please provide a search term: --find "search term"');
      return;
    }
    
    const results = navigator.findFunctionality(searchTerm);
    navigator.displayResults(results);
  }
  else if (args.includes('--dependencies')) {
    const depIndex = args.indexOf('--dependencies');
    const filePath = args[depIndex + 1];
    
    if (!filePath) {
      console.log('❌ Please provide a file path: --dependencies "path/to/file.ts"');
      return;
    }
    
    const analysis = navigator.analyzeDependencies(filePath);
    navigator.displayDependencyAnalysis(analysis);
  }
  else if (args.includes('--analyze')) {
    const analyzeIndex = args.indexOf('--analyze');
    const searchTerm = args[analyzeIndex + 1];
    
    if (!searchTerm) {
      console.log('❌ Please provide a term to analyze: --analyze "theme system"');
      return;
    }
    
    const results = navigator.findFunctionality(searchTerm);
    navigator.displayResults(results);
    
    // Also show dependency info for top result
    if (results.length > 0) {
      const analysis = navigator.analyzeDependencies(results[0].path);
      navigator.displayDependencyAnalysis(analysis);
    }
  }
  else {
    console.log(`
🤖 AI Agent Code Navigator

Usage:
  node tools/ai-navigator.js --find "search term"
  node tools/ai-navigator.js --analyze "functionality"
  node tools/ai-navigator.js --dependencies "path/to/file.ts"

Examples:
  node tools/ai-navigator.js --find "slide generation"
  node tools/ai-navigator.js --analyze "theme system"
  node tools/ai-navigator.js --dependencies "functions/src/pptGenerator.ts"
    `);
  }
}

if (require.main === module) {
  main();
}

module.exports = { AINavigator };
