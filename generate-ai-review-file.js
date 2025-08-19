#!/usr/bin/env node

/**
 * AI PowerPoint Generator - Comprehensive Code Review Script
 * 
 * This script combines all PowerPoint generation files into a single file
 * for AI review, including file descriptions and full code content.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Core PowerPoint generation files to include in review
const coreFiles = [
  {
    path: 'functions/src/pptGenerator-simple.ts',
    description: 'Main PowerPoint generation engine - handles all slide layouts, themes, and PPTX creation',
    purpose: 'Core generation logic with professional layouts, typography, and visual design'
  },
  {
    path: 'functions/src/professionalThemes.ts',
    description: 'Professional theme system with color palettes, typography, and visual effects',
    purpose: 'Theme definitions and color management for consistent visual design'
  },
  {
    path: 'functions/src/schema.ts',
    description: 'TypeScript schemas and validation for slide specifications and data structures',
    purpose: 'Type definitions and validation schemas for all PowerPoint generation data'
  },
  {
    path: 'functions/src/services/powerPointService.ts',
    description: 'Simplified PowerPoint service for orchestrating generation workflow',
    purpose: 'High-level service interface for PowerPoint generation with validation and error handling'
  },
  {
    path: 'functions/src/index.ts',
    description: 'Firebase Functions API endpoints for PowerPoint generation and content management',
    purpose: 'REST API endpoints that handle HTTP requests and coordinate PowerPoint generation'
  },
  {
    path: 'functions/src/llm.ts',
    description: 'AI/LLM integration for intelligent content generation and slide creation',
    purpose: 'AI service integration for generating slide content from prompts and parameters'
  },
  {
    path: 'functions/src/prompts.ts',
    description: 'AI prompt templates and content generation instructions',
    purpose: 'Structured prompts for AI content generation with consistent formatting'
  },
  {
    path: 'functions/src/utils/smartLogger.ts',
    description: 'Intelligent logging system with performance tracking and structured output',
    purpose: 'Centralized logging with performance metrics and structured data'
  },
  {
    path: 'functions/src/services/aiService.ts',
    description: 'AI service wrapper for content generation and intelligent slide creation',
    purpose: 'AI integration service for generating slide content and managing AI interactions'
  },
  {
    path: 'functions/src/config/aiModels.ts',
    description: 'AI model configurations and settings for content generation',
    purpose: 'Configuration for AI models, API keys, and generation parameters'
  },
  {
    path: 'functions/src/config/appConfig.ts',
    description: 'Application configuration and environment settings',
    purpose: 'Centralized configuration management for the entire application'
  },
  {
    path: 'functions/src/config/environment.ts',
    description: 'Environment-specific configuration and runtime settings',
    purpose: 'Environment detection and configuration loading'
  }
];

// Frontend files that are essential for understanding the complete system
const frontendFiles = [
  {
    path: 'frontend/src/components/SlidePreview.tsx',
    description: 'Live slide preview component that matches PowerPoint output exactly',
    purpose: 'Real-time slide preview with 16:9 aspect ratio and theme consistency'
  },
  {
    path: 'frontend/src/types.ts',
    description: 'Frontend TypeScript types and interfaces for slide specifications',
    purpose: 'Type definitions for frontend components and data structures'
  },
  {
    path: 'frontend/src/themes/professionalThemes.ts',
    description: 'Frontend theme definitions that mirror backend themes for consistency',
    purpose: 'Frontend theme system ensuring preview-to-export consistency'
  }
];

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

function readFileContent(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return `ERROR: Could not read file - ${error.message}`;
  }
}

function generateFileSection(file) {
  const exists = fileExists(file.path);
  const content = exists ? readFileContent(file.path) : 'FILE NOT FOUND';
  const lineCount = exists ? content.split('\n').length : 0;
  
  return `
${'='.repeat(100)}
FILE: ${file.path}
DESCRIPTION: ${file.description}
PURPOSE: ${file.purpose}
STATUS: ${exists ? 'EXISTS' : 'MISSING'}
LINES: ${lineCount}
${'='.repeat(100)}

${content}

`;
}

function generateAIReviewFile() {
  log('🤖 Generating AI PowerPoint Generator Code Review File', 'bright');
  log('📁 Analyzing codebase structure...', 'blue');
  
  let reviewContent = `# AI PowerPoint Generator - Comprehensive Code Review
Generated on: ${new Date().toISOString()}

## Overview
This document contains the complete codebase for the AI PowerPoint Generator system,
organized for comprehensive AI review and analysis.

## System Architecture
The AI PowerPoint Generator consists of:
1. **Backend (Firebase Functions)**: PowerPoint generation engine, AI integration, and API endpoints
2. **Frontend (React/TypeScript)**: User interface with live preview and theme selection
3. **Core Libraries**: Professional themes, slide layouts, and type definitions

## Code Quality Focus Areas
- **Maintainability**: Clean, well-documented code with clear separation of concerns
- **Performance**: Optimized PowerPoint generation with efficient memory usage
- **Scalability**: Modular architecture supporting future enhancements
- **Type Safety**: Comprehensive TypeScript coverage with strict validation
- **Visual Quality**: Professional-grade PowerPoint output with modern design principles

`;

  // Add core backend files
  reviewContent += `\n## CORE BACKEND FILES\n`;
  coreFiles.forEach(file => {
    log(`📄 Processing: ${file.path}`, 'cyan');
    reviewContent += generateFileSection(file);
  });

  // Add essential frontend files
  reviewContent += `\n## ESSENTIAL FRONTEND FILES\n`;
  frontendFiles.forEach(file => {
    log(`📄 Processing: ${file.path}`, 'cyan');
    reviewContent += generateFileSection(file);
  });

  // Write the review file
  const outputPath = 'AI_POWERPOINT_GENERATOR_CODE_REVIEW.md';
  fs.writeFileSync(outputPath, reviewContent);
  
  const stats = fs.statSync(outputPath);
  const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  log(`✅ AI review file generated successfully!`, 'green');
  log(`📊 File: ${outputPath}`, 'yellow');
  log(`📏 Size: ${fileSizeMB} MB`, 'yellow');
  log(`📄 Total files analyzed: ${coreFiles.length + frontendFiles.length}`, 'yellow');
  
  return outputPath;
}

// Main execution
if (require.main === module) {
  try {
    generateAIReviewFile();
    process.exit(0);
  } catch (error) {
    log(`❌ Error generating AI review file: ${error.message}`, 'red');
    console.error(error.stack);
    process.exit(1);
  }
}

module.exports = { generateAIReviewFile };
