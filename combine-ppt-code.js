#!/usr/bin/env node

/**
 * PowerPoint Generation Code Combiner
 * 
 * This script combines all the core PowerPoint generation code files
 * in logical execution order for AI review and feedback.
 * 
 * Execution Flow:
 * 1. API Request (index.ts) 
 * 2. Input Validation (schema.ts)
 * 3. AI Processing (llm.ts + prompts.ts)
 * 4. Theme Selection (professionalThemes.ts)
 * 5. Slide Generation (slides/ + pptGenerator.ts)
 * 6. PowerPoint Creation (pptxgenjs integration)
 * 
 * Usage: node combine-ppt-code.js > combined-ppt-code.txt
 */

const fs = require('fs');
const path = require('path');

// Define the files in logical execution order
const FILES_TO_COMBINE = [
  // 1. API Entry Point & Request Handling
  {
    path: 'functions/src/index.ts',
    description: '🚀 API ENTRY POINT - Main Express app with endpoints (/draft, /generate)',
    sections: [
      { start: 1, end: 100, desc: 'Imports and setup' },
      { start: 500, end: 650, desc: 'PowerPoint generation endpoint' }
    ]
  },
  
  // 2. Input Validation & Schema Definitions
  {
    path: 'functions/src/schema.ts',
    description: '📋 INPUT VALIDATION - Zod schemas for request/response validation',
    sections: [
      { start: 70, end: 150, desc: 'SlideSpec schema definition' },
      { start: 220, end: 280, desc: 'GenerationParams schema' }
    ]
  },
  
  // 3. AI Processing & Prompt Engineering
  {
    path: 'functions/src/prompts.ts',
    description: '🤖 AI PROMPTS - System prompts and content generation templates',
    sections: [
      { start: 15, end: 80, desc: 'System prompt definition' },
      { start: 200, end: 300, desc: 'Content generation prompts' }
    ]
  },
  
  {
    path: 'functions/src/llm.ts',
    description: '🧠 AI PROCESSING - OpenAI integration and multi-step generation',
    sections: [
      { start: 1, end: 50, desc: 'AI service setup and configuration' },
      { start: 190, end: 320, desc: 'Core AI generation logic' }
    ]
  },
  
  // 4. Theme System
  {
    path: 'functions/src/professionalThemes.ts',
    description: '🎨 THEME SYSTEM - Professional color schemes and styling',
    sections: [
      { start: 1, end: 100, desc: 'Theme definitions and color palettes' },
      { start: 200, end: 300, desc: 'Theme selection logic' }
    ]
  },
  
  // 5. Slide Generation Logic
  {
    path: 'functions/src/slides/index.ts',
    description: '📄 SLIDE BUILDERS - Core slide generation and layout logic',
    sections: [
      { start: 100, end: 130, desc: 'Main slide building function' }
    ]
  },
  
  // 6. PowerPoint File Generation
  {
    path: 'functions/src/pptGenerator.ts',
    description: '📊 POWERPOINT GENERATOR - Final PPTX file creation using PptxGenJS',
    sections: [
      { start: 130, end: 200, desc: 'Main generatePpt function' },
      { start: 300, end: 400, desc: 'Slide creation logic' }
    ]
  },

  // 7. Modern Slide Generators (Advanced Features)
  {
    path: 'functions/src/slides/modernSlideGenerators.ts',
    description: '🎨 MODERN SLIDE GENERATORS - Advanced visual design and layouts',
    sections: [
      { start: 130, end: 180, desc: 'Modern content slide creation' }
    ]
  },

  // 8. Configuration Files
  {
    path: 'functions/src/config/aiModels.ts',
    description: '⚙️ AI CONFIGURATION - Model settings and cost tracking',
    sections: [
      { start: 1, end: 50, desc: 'AI model configuration' }
    ]
  }
];

/**
 * Read file content with line numbers
 */
function readFileSection(filePath, startLine = 1, endLine = -1) {
  try {
    const fullPath = path.join(__dirname, filePath);

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return `FILE NOT FOUND: ${filePath}\n(This file may have been moved or renamed during optimization)`;
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');

    const start = Math.max(0, startLine - 1);
    const end = endLine === -1 ? lines.length : Math.min(lines.length, endLine);

    const selectedLines = lines.slice(start, end);

    // Add file stats
    let result = `📊 FILE STATS: ${selectedLines.length} lines shown (${lines.length} total lines)\n\n`;

    result += selectedLines.map((line, index) => {
      const lineNum = start + index + 1;
      return `${lineNum.toString().padStart(4, ' ')}: ${line}`;
    }).join('\n');

    return result;
  } catch (error) {
    return `ERROR: Could not read ${filePath} - ${error.message}`;
  }
}

/**
 * Read entire file with line numbers
 */
function readEntireFile(filePath) {
  return readFileSection(filePath, 1, -1);
}

/**
 * Generate the combined code file
 */
function generateCombinedCode() {
  let output = '';
  
  // Header
  output += `
================================================================================
🎯 AI POWERPOINT GENERATOR - COMPLETE CODE REVIEW
================================================================================

This document contains all the core PowerPoint generation code in logical 
execution order, from API request to final PPTX file creation.

EXECUTION FLOW:
1. API Request → index.ts (Express endpoints)
2. Input Validation → schema.ts (Zod validation)  
3. AI Processing → llm.ts + prompts.ts (OpenAI integration)
4. Theme Selection → professionalThemes.ts (Styling)
5. Slide Generation → slides/index.ts (Layout logic)
6. PowerPoint Creation → pptGenerator.ts (PptxGenJS integration)

================================================================================

`;

  // Process each file
  FILES_TO_COMBINE.forEach((fileInfo, index) => {
    output += `\n${'='.repeat(80)}\n`;
    output += `${index + 1}. ${fileInfo.description}\n`;
    output += `FILE: ${fileInfo.path}\n`;
    output += `${'='.repeat(80)}\n\n`;
    
    if (fileInfo.sections && fileInfo.sections.length > 0) {
      // Include specific sections
      fileInfo.sections.forEach(section => {
        output += `\n${'-'.repeat(60)}\n`;
        output += `SECTION: ${section.desc} (lines ${section.start}-${section.end})\n`;
        output += `${'-'.repeat(60)}\n\n`;
        output += readFileSection(fileInfo.path, section.start, section.end);
        output += '\n\n';
      });
    } else {
      // Include entire file
      output += readFileSection(fileInfo.path);
      output += '\n\n';
    }
  });
  
  // Footer with analysis questions
  output += `\n${'='.repeat(80)}\n`;
  output += `🔍 ANALYSIS QUESTIONS FOR AI REVIEW\n`;
  output += `${'='.repeat(80)}\n\n`;
  output += `1. CODE ARCHITECTURE:\n`;
  output += `   - Is the separation of concerns clear and logical?\n`;
  output += `   - Are there any architectural improvements you'd suggest?\n\n`;
  output += `2. ERROR HANDLING:\n`;
  output += `   - Is error handling comprehensive throughout the flow?\n`;
  output += `   - Are there edge cases that aren't properly handled?\n\n`;
  output += `3. PERFORMANCE:\n`;
  output += `   - Are there any performance bottlenecks in the code?\n`;
  output += `   - Could any operations be optimized or cached?\n\n`;
  output += `4. CODE QUALITY:\n`;
  output += `   - Is the code readable and well-documented?\n`;
  output += `   - Are there any code smells or anti-patterns?\n\n`;
  output += `5. POWERPOINT GENERATION:\n`;
  output += `   - Is the PptxGenJS integration efficient and robust?\n`;
  output += `   - Are the slide layouts and styling professional?\n\n`;
  output += `6. AI INTEGRATION:\n`;
  output += `   - Are the OpenAI prompts well-engineered?\n`;
  output += `   - Is the multi-step AI processing effective?\n\n`;
  
  return output;
}

// Generate and output the combined code
console.log(generateCombinedCode());
