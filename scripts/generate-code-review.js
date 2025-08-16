#!/usr/bin/env node

/**
 * Code Review Generator Script
 * 
 * This script generates a comprehensive code review file containing all source code
 * files with their complete content, file paths, and detailed descriptions for
 * external AI review purposes.
 * 
 * Features:
 * - Recursively scans frontend and backend directories
 * - Includes file descriptions and purposes
 * - Filters out non-essential files (node_modules, build artifacts, etc.)
 * - Generates organized markdown output
 * - Creates timestamped review files
 * 
 * Usage: node scripts/generate-code-review.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const OUTPUT_DIR = 'code-review';
const PROJECT_ROOT = process.cwd();
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const OUTPUT_FILE = path.join(OUTPUT_DIR, `code-review-${TIMESTAMP}.md`);

// Directories to scan
const SCAN_DIRECTORIES = [
  'frontend/src',
  'functions/src',
  'scripts'
];

// File extensions to include
const INCLUDE_EXTENSIONS = [
  '.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.css', '.scss',
  '.html', '.yml', '.yaml', '.env.example'
];

// Files and directories to exclude
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'coverage',
  '.nyc_output',
  'logs',
  '*.log',
  '.DS_Store',
  'Thumbs.db',
  '.env',
  '.env.local',
  '.env.production',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml'
];

// File descriptions and purposes
const FILE_DESCRIPTIONS = {
  // Frontend Core
  'frontend/src/main.tsx': 'Application entry point - initializes React app with ThemeProvider and renders root App component',
  'frontend/src/App.tsx': 'Main application component - orchestrates slide generation workflow, manages state, and handles mode switching',
  'frontend/src/index.css': 'Global CSS styles and Tailwind CSS imports',
  
  // Hooks
  'frontend/src/hooks/useThemeSync.ts': 'Enhanced theme synchronization hook - provides centralized theme management with race condition prevention',
  'frontend/src/hooks/useTheme.ts': 'Theme utility hook for accessing theme objects',
  'frontend/src/hooks/useResponsive.ts': 'Responsive design hook for handling different screen sizes',
  'frontend/src/hooks/useLoadingState.ts': 'Loading state management hook with stage tracking',
  'frontend/src/hooks/useDebounced.ts': 'Debouncing utilities for performance optimization',
  
  // Components - Core
  'frontend/src/components/PromptInput.tsx': 'Main input form component for single slide generation with theme selection',
  'frontend/src/components/SlideEditor.tsx': 'Slide editing interface with live preview integration',
  'frontend/src/components/PresentationManager.tsx': 'Multi-slide presentation management with drag-and-drop functionality',
  'frontend/src/components/SlidePreview.tsx': 'Live slide preview component with 16:9 aspect ratio and theme integration',
  
  // Components - Theme
  'frontend/src/components/ThemeCarousel.tsx': 'Horizontal scrolling theme selector with smooth animations',
  
  // Components - UI
  'frontend/src/components/LoadingState.tsx': 'Loading spinner and progress indicators',
  'frontend/src/components/MobileNavigation.tsx': 'Mobile-responsive navigation components',
  'frontend/src/components/AccessibilityControls.tsx': 'Accessibility features and skip links',
  'frontend/src/components/NotificationSystem.tsx': 'Toast notifications and user feedback system',
  
  // Contexts
  'frontend/src/contexts/ThemeContext.tsx': 'React context for theme state management and global theme application',
  
  // Types
  'frontend/src/types.ts': 'TypeScript type definitions for slides, presentations, and application state',
  
  // Themes
  'frontend/src/themes/professionalThemes.ts': 'Professional theme definitions with color palettes and typography',
  
  // Utils
  'frontend/src/utils/apiClient.ts': 'HTTP client for backend API communication',

  'frontend/src/utils/themeUtils.ts': 'Theme utility functions for CSS variable management',
  'frontend/src/utils/responsiveUtils.ts': 'Responsive design utilities and breakpoint management',
  
  // Constants
  'frontend/src/constants/slideConstants.ts': 'Constants for slide layouts, typography, and animations',
  'frontend/src/config.ts': 'Application configuration and environment variables',
  
  // Backend Core
  'functions/src/index.ts': 'Firebase Cloud Functions entry point and API route definitions',
  'functions/src/pptGenerator.ts': 'PowerPoint generation engine with theme integration',
  'functions/src/aiService.ts': 'AI service integration for content generation',
  'functions/src/schema.ts': 'Data validation schemas and type definitions',
  
  // Backend Themes
  'functions/src/professionalThemes.ts': 'Backend theme definitions synchronized with frontend',
  'functions/src/core/theme/modernThemes.ts': 'Modern theme system for advanced styling',
  
  // Backend Utils
  'functions/src/utils/validation.ts': 'Input validation utilities',
  'functions/src/utils/errorHandling.ts': 'Centralized error handling and logging',
  
  // Configuration
  'package.json': 'Project dependencies and scripts configuration',
  'frontend/package.json': 'Frontend-specific dependencies and build scripts',
  'functions/package.json': 'Backend Cloud Functions dependencies',
  'tsconfig.json': 'TypeScript compiler configuration',
  'tailwind.config.js': 'Tailwind CSS configuration with custom theme',
  'vite.config.ts': 'Vite build tool configuration',
  
  // Documentation
  'README.md': 'Project overview and setup instructions',
  'frontend/src/docs/THEME_SYNCHRONIZATION.md': 'Comprehensive documentation of the enhanced theme synchronization system'
};

/**
 * Check if file should be excluded based on patterns
 */
function shouldExclude(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(filePath);
    }
    return filePath.includes(pattern);
  });
}

/**
 * Check if file extension should be included
 */
function shouldInclude(filePath) {
  const ext = path.extname(filePath);
  return INCLUDE_EXTENSIONS.includes(ext);
}

/**
 * Get file description from the descriptions map
 */
function getFileDescription(filePath) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  return FILE_DESCRIPTIONS[normalizedPath] || 'Source code file';
}

/**
 * Recursively scan directory for code files
 */
function scanDirectory(dirPath, basePath = '') {
  const files = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const relativePath = path.join(basePath, item).replace(/\\/g, '/');
      
      if (shouldExclude(relativePath)) {
        continue;
      }
      
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...scanDirectory(fullPath, relativePath));
      } else if (stat.isFile() && shouldInclude(fullPath)) {
        files.push({
          path: relativePath,
          fullPath: fullPath,
          size: stat.size,
          modified: stat.mtime
        });
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not scan directory ${dirPath}:`, error.message);
  }
  
  return files;
}

/**
 * Read file content safely
 */
function readFileContent(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return `Error reading file: ${error.message}`;
  }
}

/**
 * Format file size in human readable format
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Generate the code review markdown file
 */
function generateCodeReview() {
  console.log('🔍 Scanning for code files...');
  
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Scan all directories
  let allFiles = [];
  for (const dir of SCAN_DIRECTORIES) {
    const dirPath = path.join(PROJECT_ROOT, dir);
    if (fs.existsSync(dirPath)) {
      console.log(`📁 Scanning ${dir}...`);
      allFiles.push(...scanDirectory(dirPath, dir));
    } else {
      console.warn(`⚠️  Directory not found: ${dir}`);
    }
  }
  
  // Sort files by path
  allFiles.sort((a, b) => a.path.localeCompare(b.path));
  
  console.log(`📄 Found ${allFiles.length} code files`);
  
  // Generate markdown content
  let markdown = `# AI PowerPoint Generator - Code Review\n\n`;
  markdown += `**Generated:** ${new Date().toISOString()}\n`;
  markdown += `**Total Files:** ${allFiles.length}\n`;
  markdown += `**Total Size:** ${formatFileSize(allFiles.reduce((sum, f) => sum + f.size, 0))}\n\n`;
  
  markdown += `## Project Overview\n\n`;
  markdown += `This is a comprehensive code review export of the AI PowerPoint Generator application. `;
  markdown += `The project consists of a React frontend with TypeScript and a Node.js backend using Firebase Cloud Functions. `;
  markdown += `The application generates professional PowerPoint presentations using AI with advanced theme synchronization.\n\n`;
  
  markdown += `## Recent Enhancements\n\n`;
  markdown += `The codebase has been enhanced with a robust theme synchronization system that:\n`;
  markdown += `- Eliminates race conditions in theme management\n`;
  markdown += `- Provides consistent theme propagation between components\n`;
  markdown += `- Supports mode-specific theme persistence (single vs presentation mode)\n`;
  markdown += `- Includes comprehensive error handling and testing\n\n`;
  
  markdown += `## File Structure\n\n`;
  markdown += `\`\`\`\n`;
  
  // Generate file tree
  const tree = {};
  allFiles.forEach(file => {
    const parts = file.path.split('/');
    let current = tree;
    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = index === parts.length - 1 ? null : {};
      }
      if (current[part] !== null) {
        current = current[part];
      }
    });
  });
  
  function printTree(obj, indent = '') {
    let result = '';
    Object.keys(obj).sort().forEach(key => {
      result += `${indent}${key}\n`;
      if (obj[key] !== null) {
        result += printTree(obj[key], indent + '  ');
      }
    });
    return result;
  }
  
  markdown += printTree(tree);
  markdown += `\`\`\`\n\n`;
  
  markdown += `## Code Files\n\n`;
  
  // Add each file
  allFiles.forEach((file, index) => {
    const content = readFileContent(file.fullPath);
    const description = getFileDescription(file.path);
    const ext = path.extname(file.path).slice(1);
    
    markdown += `### ${index + 1}. \`${file.path}\`\n\n`;
    markdown += `**Purpose:** ${description}\n\n`;
    markdown += `**Size:** ${formatFileSize(file.size)} | **Modified:** ${file.modified.toISOString()}\n\n`;
    
    if (content.length > 0) {
      markdown += `\`\`\`${ext}\n${content}\n\`\`\`\n\n`;
    } else {
      markdown += `*File is empty or could not be read*\n\n`;
    }
    
    markdown += `---\n\n`;
  });
  
  // Write the file
  fs.writeFileSync(OUTPUT_FILE, markdown);
  
  console.log(`✅ Code review generated successfully!`);
  console.log(`📁 Output file: ${OUTPUT_FILE}`);
  console.log(`📊 File size: ${formatFileSize(fs.statSync(OUTPUT_FILE).size)}`);
  
  return OUTPUT_FILE;
}

// Run the script
if (require.main === module) {
  try {
    generateCodeReview();
  } catch (error) {
    console.error('❌ Error generating code review:', error);
    process.exit(1);
  }
}

module.exports = { generateCodeReview };
