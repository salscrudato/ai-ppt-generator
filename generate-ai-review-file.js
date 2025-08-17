#!/usr/bin/env node

/**
 * AI PowerPoint Generator - Code Consolidation Script
 * 
 * This script consolidates all PowerPoint generation files in execution order
 * for external AI review. It creates a single comprehensive file containing:
 * - App description and architecture
 * - File structure overview
 * - All PowerPoint generation files in execution sequence
 * 
 * Usage: node generate-ai-review-file.js
 * Output: ai-review-powerpoint-generation.md
 */

const fs = require('fs');
const path = require('path');

// PowerPoint generation files in execution order
const POWERPOINT_FILES = [
  // 1. API Entry Points
  {
    path: 'functions/src/index.ts',
    description: 'Main API endpoints - handles /generate and /generate/professional requests',
    section: 'API Layer'
  },
  
  // 2. Service Layer
  {
    path: 'functions/src/services/powerPointService.ts',
    description: 'PowerPoint service orchestrator - coordinates slide processing and generation',
    section: 'Service Layer'
  },
  
  // 3. Core Generation Engine
  {
    path: 'functions/src/pptGenerator-simple.ts',
    description: 'Core PowerPoint generation engine - creates PPTX files using PptxGenJS',
    section: 'Core Engine'
  },
  
  // 4. Schema and Validation
  {
    path: 'functions/src/schema.ts',
    description: 'Zod schemas for slide specifications and validation',
    section: 'Data Layer'
  },
  
  // 5. Theme System
  {
    path: 'functions/src/professionalThemes.ts',
    description: 'Professional theme definitions and color schemes',
    section: 'Design System'
  },
  
  // 6. AI Integration
  {
    path: 'functions/src/llm.ts',
    description: 'OpenAI integration for content generation',
    section: 'AI Layer'
  },
  
  // 7. Prompts and Templates
  {
    path: 'functions/src/prompts.ts',
    description: 'AI prompt templates and engineering',
    section: 'AI Layer'
  },
  
  // 8. Supporting Services
  {
    path: 'functions/src/services/aiService.ts',
    description: 'AI service for slide content generation',
    section: 'Service Layer'
  },
  
  {
    path: 'functions/src/services/validationService.ts',
    description: 'Content validation and quality assessment',
    section: 'Service Layer'
  },
  
  // 9. Utilities
  {
    path: 'functions/src/utils/smartLogger.ts',
    description: 'Logging utilities for debugging and monitoring',
    section: 'Utilities'
  },
  
  {
    path: 'functions/src/utils/corruptionDiagnostics.ts',
    description: 'File integrity and corruption detection',
    section: 'Utilities'
  },
  
  // 10. Frontend Integration
  {
    path: 'frontend/src/hooks/useApiWithNotifications.ts',
    description: 'Frontend API integration and PowerPoint generation hooks',
    section: 'Frontend Integration'
  }
];

// App description and architecture
const APP_DESCRIPTION = `# AI PowerPoint Generator - Code Review

## 🎯 Application Overview

The AI PowerPoint Generator is a lean, AI-enhanced web application that transforms text prompts into professional PowerPoint presentations using OpenAI's GPT-4. The system features a sophisticated design system, premium themes, and optimized architecture for AI agent development.

### Key Features
- **AI-Powered Content Generation**: GPT-4 transforms prompts into structured slide content
- **Premium Design System**: Professional themes with sophisticated styling
- **Multiple Layout Types**: Title, Bullets, Two-Column, Mixed Content layouts
- **DALL-E 3 Integration**: Optional AI-generated images
- **Universal Compatibility**: Works with PowerPoint, Keynote, Google Slides

### Technology Stack
- **Backend**: Firebase Cloud Functions + TypeScript + OpenAI API
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **PowerPoint Generation**: PptxGenJS library
- **Validation**: Zod schemas
- **Logging**: Custom smart logging system

## 🏗️ Architecture Overview

### PowerPoint Generation Flow
1. **API Request** → User submits prompt via frontend
2. **AI Processing** → OpenAI generates structured slide content
3. **Validation** → Zod schemas validate slide specifications
4. **Theme Application** → Professional themes applied to content
5. **Slide Building** → Core engine builds individual slides
6. **PPTX Generation** → PptxGenJS creates final PowerPoint file
7. **File Delivery** → Buffer returned to frontend for download

### Execution Sequence
\`\`\`
Frontend Request → index.ts → powerPointService.ts → pptGenerator-simple.ts → PptxGenJS → PowerPoint File
                     ↓              ↓                      ↓
                 aiService.ts → schema.ts → professionalThemes.ts
                     ↓
                 llm.ts + prompts.ts
\`\`\`

## 📁 File Structure
\`\`\`
ai-ppt-generator/
├── functions/                    # Firebase Cloud Functions Backend
│   ├── src/
│   │   ├── index.ts             # Main API endpoints
│   │   ├── pptGenerator-simple.ts # Core PowerPoint generation
│   │   ├── schema.ts            # Validation schemas
│   │   ├── professionalThemes.ts # Theme system
│   │   ├── llm.ts               # OpenAI integration
│   │   ├── prompts.ts           # AI prompt templates
│   │   ├── services/            # Service layer
│   │   └── utils/               # Utilities
│   └── test/                    # Test suite
├── frontend/                    # React Frontend
│   ├── src/
│   │   ├── hooks/               # API integration hooks
│   │   ├── components/          # React components
│   │   └── utils/               # Frontend utilities
└── README.md                    # Documentation
\`\`\`

---

# 📄 PowerPoint Generation Files (Execution Order)

`;

function readFileContent(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      return `// File not found: ${filePath}`;
    }
    return fs.readFileSync(fullPath, 'utf8');
  } catch (error) {
    return `// Error reading file: ${error.message}`;
  }
}

function generateReviewFile() {
  console.log('🚀 Generating AI review file for PowerPoint generation...');
  
  let content = APP_DESCRIPTION;
  let currentSection = '';
  
  POWERPOINT_FILES.forEach((file, index) => {
    // Add section header if this is a new section
    if (file.section !== currentSection) {
      currentSection = file.section;
      content += `\n## ${currentSection}\n\n`;
    }
    
    // Add file header
    content += `### ${index + 1}. ${path.basename(file.path)}\n\n`;
    content += `**Path**: \`${file.path}\`\n\n`;
    content += `**Description**: ${file.description}\n\n`;
    
    // Add file content
    const fileContent = readFileContent(file.path);
    const fileExtension = path.extname(file.path).slice(1);
    
    content += `\`\`\`${fileExtension}\n`;
    content += fileContent;
    content += `\n\`\`\`\n\n`;
    content += '---\n\n';
  });
  
  // Write the consolidated file
  const outputPath = 'ai-review-powerpoint-generation.md';
  fs.writeFileSync(outputPath, content, 'utf8');
  
  console.log(`✅ AI review file generated: ${outputPath}`);
  console.log(`📊 File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📄 Files included: ${POWERPOINT_FILES.length}`);
  
  return outputPath;
}

// Run the script
if (require.main === module) {
  try {
    generateReviewFile();
  } catch (error) {
    console.error('❌ Error generating review file:', error);
    process.exit(1);
  }
}

module.exports = { generateReviewFile, POWERPOINT_FILES };
