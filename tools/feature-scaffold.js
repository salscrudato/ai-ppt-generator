#!/usr/bin/env node

/**
 * AI Agent Feature Scaffolder
 * 
 * Automatically generates complete feature implementations with proper
 * TypeScript types, tests, and documentation for the AI PowerPoint Generator.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

const fs = require('fs');
const path = require('path');

/**
 * Feature templates and generators
 */
class FeatureScaffolder {
  constructor() {
    this.templates = {
      'slide-layout': this.generateSlideLayoutTemplate,
      'theme': this.generateThemeTemplate,
      'api-endpoint': this.generateApiEndpointTemplate,
      'react-component': this.generateReactComponentTemplate,
      'utility-function': this.generateUtilityTemplate
    };
  }

  /**
   * Generate a new slide layout
   */
  generateSlideLayoutTemplate(name) {
    const className = this.toPascalCase(name);
    const fileName = this.toKebabCase(name);
    
    const slideGenerator = `/**
 * ${className} Slide Generator
 * 
 * Generates professional ${name} slides with consistent styling and layout.
 * Optimized for accessibility and visual impact.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import type { SlideSpec } from '../schema';
import type { ProfessionalTheme } from '../professionalThemes';
import { validateSlideConfig, type SlideBuildResult } from '../styleValidator';

/**
 * Configuration interface for ${className} slides
 */
export interface ${className}Config {
  title: string;
  subtitle?: string;
  content: {
    // Define your specific content structure here
    items: string[];
    metadata?: Record<string, any>;
  };
  styling?: {
    layout?: 'standard' | 'compact' | 'expanded';
    emphasis?: 'title' | 'content' | 'balanced';
  };
}

/**
 * Generate ${className} slide with professional styling
 */
export function build${className}Slide(
  config: ${className}Config,
  theme: ProfessionalTheme
): SlideBuildResult {
  // Validate configuration
  const validation = validateSlideConfig(config, '${fileName}');
  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors,
      slide: null
    };
  }

  try {
    // Build slide specification
    const slideSpec: SlideSpec = {
      title: config.title,
      layout: '${fileName}',
      // Add your specific layout implementation here
      bullets: config.content.items,
      design: {
        theme: theme.id,
        layout: config.styling?.layout || 'standard'
      },
      notes: \`Speaker notes for \${config.title} slide\`,
      accessibility: {
        description: \`${className} slide with \${config.content.items.length} items\`
      }
    };

    return {
      success: true,
      errors: [],
      slide: slideSpec,
      metadata: {
        generator: '${fileName}',
        version: '1.0.0',
        theme: theme.id,
        accessibility: true
      }
    };
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : String(error)],
      slide: null
    };
  }
}

/**
 * Validate ${className} configuration
 */
export function validate${className}Config(config: ${className}Config): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.title || config.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (config.title && config.title.length > 100) {
    errors.push('Title must be under 100 characters');
  }

  if (!config.content || !config.content.items || config.content.items.length === 0) {
    errors.push('Content items are required');
  }

  if (config.content?.items && config.content.items.length > 10) {
    errors.push('Maximum 10 content items allowed for readability');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get default configuration for ${className} slides
 */
export function getDefault${className}Config(): ${className}Config {
  return {
    title: 'Sample ${className} Title',
    subtitle: 'Professional subtitle',
    content: {
      items: [
        'First key point',
        'Second important item',
        'Third essential element'
      ]
    },
    styling: {
      layout: 'standard',
      emphasis: 'balanced'
    }
  };
}`;

    const testFile = `/**
 * Tests for ${className} Slide Generator
 */

import { describe, it, expect } from '@jest/globals';
import { 
  build${className}Slide, 
  validate${className}Config,
  getDefault${className}Config,
  type ${className}Config 
} from '../${fileName}';
import { getThemeById } from '../../professionalThemes';

describe('${className} Slide Generator', () => {
  const theme = getThemeById('corporate-blue');

  describe('build${className}Slide', () => {
    it('should generate valid slide with default config', () => {
      const config = getDefault${className}Config();
      const result = build${className}Slide(config, theme);

      expect(result.success).toBe(true);
      expect(result.slide).toBeDefined();
      expect(result.slide?.title).toBe(config.title);
      expect(result.slide?.layout).toBe('${fileName}');
    });

    it('should handle invalid configuration', () => {
      const invalidConfig: ${className}Config = {
        title: '',
        content: { items: [] }
      };

      const result = build${className}Slide(invalidConfig, theme);
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validate${className}Config', () => {
    it('should validate correct configuration', () => {
      const config = getDefault${className}Config();
      const validation = validate${className}Config(config);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject empty title', () => {
      const config = getDefault${className}Config();
      config.title = '';

      const validation = validate${className}Config(config);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Title is required');
    });
  });
});`;

    return {
      files: [
        {
          path: `functions/src/slides/${fileName}.ts`,
          content: slideGenerator
        },
        {
          path: `functions/test/slides/${fileName}.test.ts`,
          content: testFile
        }
      ],
      instructions: [
        `1. Implement the specific layout logic in build${className}Slide()`,
        `2. Add the new layout to the SLIDE_LAYOUTS enum in schema.ts`,
        `3. Register the generator in functions/src/slides/index.ts`,
        `4. Add theme-specific styling if needed`,
        `5. Test the implementation with: npm test -- ${fileName}.test.ts`
      ]
    };
  }

  /**
   * Generate a new theme
   */
  generateThemeTemplate(name) {
    const themeName = this.toKebabCase(name);
    const displayName = this.toTitleCase(name);
    
    const themeCode = `/**
 * ${displayName} Theme
 * 
 * Professional theme optimized for ${name.toLowerCase()} presentations.
 * Includes accessibility-compliant colors and modern typography.
 */

import type { ProfessionalTheme } from '../professionalThemes';

export const ${this.toCamelCase(name)}Theme: ProfessionalTheme = {
  id: '${themeName}',
  name: '${displayName}',
  category: 'professional', // or 'creative', 'specialized'
  
  colors: {
    primary: '#2563EB',      // Main brand color
    secondary: '#64748B',    // Supporting color
    accent: '#0EA5E9',       // Highlight color
    background: '#FFFFFF',   // Slide background
    surface: '#F8FAFC',      // Card/surface background
    text: {
      primary: '#0F172A',    // Main text
      secondary: '#475569',  // Secondary text
      inverse: '#FFFFFF',    // Text on dark backgrounds
      muted: '#94A3B8'       // Subtle text
    },
    status: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6'
    }
  },

  typography: {
    fontFamily: {
      primary: 'Inter, system-ui, sans-serif',
      secondary: 'Inter, system-ui, sans-serif',
      monospace: 'JetBrains Mono, Consolas, monospace'
    },
    fontSize: {
      title: 44,
      subtitle: 28,
      heading: 32,
      body: 18,
      caption: 14,
      small: 12
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75
    }
  },

  effects: {
    shadow: {
      small: '0 1px 2px rgba(0, 0, 0, 0.05)',
      medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
      large: '0 10px 15px rgba(0, 0, 0, 0.1)'
    },
    borderRadius: {
      small: 4,
      medium: 8,
      large: 12
    },
    opacity: {
      disabled: 0.5,
      hover: 0.8,
      focus: 0.9
    }
  },

  spacing: {
    slideMargin: 48,
    contentPadding: 32,
    elementSpacing: 16,
    sectionGap: 24
  }
};`;

    return {
      files: [
        {
          path: `functions/src/themes/${themeName}.ts`,
          content: themeCode
        }
      ],
      instructions: [
        `1. Customize the color palette for your specific use case`,
        `2. Add the theme to PROFESSIONAL_THEMES array in professionalThemes.ts`,
        `3. Test the theme with different slide layouts`,
        `4. Ensure accessibility compliance (contrast ratios)`,
        `5. Add theme preview generation if needed`
      ]
    };
  }

  /**
   * Generate API endpoint template
   */
  generateApiEndpointTemplate(name) {
    const endpointName = this.toKebabCase(name);
    const functionName = this.toCamelCase(name);
    
    const endpointCode = `/**
 * ${this.toTitleCase(name)} API Endpoint
 * 
 * Handles ${name} requests with proper validation and error handling.
 */

// Add this to functions/src/index.ts

/**
 * ${this.toTitleCase(name)} endpoint
 */
app.post('/${endpointName}', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Validate request
    const validation = validate${this.toPascalCase(name)}Request(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Invalid request',
        details: validation.errors
      });
    }

    // Process request
    const result = await process${this.toPascalCase(name)}(req.body);
    
    // Log performance
    const duration = Date.now() - startTime;
    logger.info(\`${functionName} completed in \${duration}ms\`);
    
    return res.json(result);
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(\`${functionName} failed after \${duration}ms\`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Validate ${name} request
 */
function validate${this.toPascalCase(name)}Request(body: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Add your validation logic here
  if (!body) {
    errors.push('Request body is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Process ${name} request
 */
async function process${this.toPascalCase(name)}(data: any): Promise<any> {
  // Add your processing logic here
  return {
    success: true,
    data: data,
    timestamp: new Date().toISOString()
  };
}`;

    return {
      files: [
        {
          path: `functions/src/endpoints/${endpointName}.ts`,
          content: endpointCode
        }
      ],
      instructions: [
        `1. Add the endpoint code to functions/src/index.ts`,
        `2. Implement the validation logic`,
        `3. Implement the processing logic`,
        `4. Add proper TypeScript types`,
        `5. Add tests for the endpoint`,
        `6. Update API documentation`
      ]
    };
  }

  /**
   * Utility functions
   */
  toPascalCase(str) {
    return str.replace(/(?:^|[\s-_]+)(\w)/g, (_, char) => char.toUpperCase());
  }

  toCamelCase(str) {
    const pascal = this.toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  }

  toKebabCase(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2')
              .replace(/[\s_]+/g, '-')
              .toLowerCase();
  }

  toTitleCase(str) {
    return str.replace(/(?:^|[\s-_]+)(\w)/g, (_, char) => char.toUpperCase())
              .replace(/[-_]/g, ' ');
  }

  /**
   * Create files and directories
   */
  createFiles(files) {
    files.forEach(file => {
      const dir = path.dirname(file.path);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Write file
      fs.writeFileSync(file.path, file.content);
      console.log(`✅ Created: ${file.path}`);
    });
  }

  /**
   * Generate feature
   */
  generateFeature(type, name) {
    if (!this.templates[type]) {
      console.log(`❌ Unknown feature type: ${type}`);
      console.log(`Available types: ${Object.keys(this.templates).join(', ')}`);
      return;
    }

    console.log(`🚀 Generating ${type}: ${name}`);
    
    const result = this.templates[type].call(this, name);
    
    // Create files
    this.createFiles(result.files);
    
    // Show instructions
    console.log(`\n📋 Next steps:`);
    result.instructions.forEach((instruction, index) => {
      console.log(`   ${index + 1}. ${instruction}`);
    });
    
    console.log(`\n✅ Feature scaffolding complete!`);
  }
}

/**
 * Command line interface
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--type') && args.includes('--name')) {
    const typeIndex = args.indexOf('--type');
    const nameIndex = args.indexOf('--name');
    
    const type = args[typeIndex + 1];
    const name = args[nameIndex + 1];
    
    if (!type || !name) {
      console.log('❌ Please provide both --type and --name');
      return;
    }
    
    const scaffolder = new FeatureScaffolder();
    scaffolder.generateFeature(type, name);
  } else {
    console.log(`
🤖 AI Agent Feature Scaffolder

Usage:
  node tools/feature-scaffold.js --type <type> --name <name>

Available Types:
  slide-layout     - Generate new slide layout with tests
  theme           - Generate new presentation theme
  api-endpoint    - Generate new API endpoint
  react-component - Generate React component
  utility-function - Generate utility function

Examples:
  node tools/feature-scaffold.js --type slide-layout --name interactive-chart
  node tools/feature-scaffold.js --type theme --name healthcare-modern
  node tools/feature-scaffold.js --type api-endpoint --name batch-generate
    `);
  }
}

if (require.main === module) {
  main();
}

module.exports = { FeatureScaffolder };
