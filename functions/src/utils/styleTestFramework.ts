/**
 * PowerPoint Style Testing Framework
 * Systematically tests styling combinations to identify corruption sources
 */

import pptxgen from 'pptxgenjs';
import { logger } from './smartLogger';

export interface StyleTest {
  id: string;
  name: string;
  description: string;
  styleConfig: any;
  expectedResult: 'pass' | 'fail' | 'unknown';
}

export interface TestResult {
  testId: string;
  passed: boolean;
  fileSize: number;
  hasValidSignature: boolean;
  powerPointAccepts: boolean;
  errorDetails?: string;
  generationTime: number;
}

/**
 * Minimal Viable Slide Generator
 * Creates the absolute minimum slide to test specific styling
 */
export class MinimalSlideGenerator {
  
  /**
   * Generate a minimal slide with only the specified styling
   */
  static async generateMinimalSlide(styleConfig: any): Promise<Buffer> {
    const pres = new pptxgen();
    
    // Set basic layout
    pres.defineLayout({
      name: 'TEST_LAYOUT',
      width: 10,
      height: 5.625
    });
    pres.layout = 'TEST_LAYOUT';
    
    const slide = pres.addSlide();
    
    // Add minimal content with test styling
    slide.addText('Test Content', {
      x: 1,
      y: 1,
      w: 8,
      h: 1,
      ...styleConfig
    });
    
    return await pres.write({
      outputType: 'nodebuffer',
      compression: true
    }) as Buffer;
  }
  
  /**
   * Test a specific style configuration
   */
  static async testStyle(test: StyleTest): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const buffer = await this.generateMinimalSlide(test.styleConfig);
      const generationTime = Date.now() - startTime;
      
      // Validate buffer
      const hasValidSignature = this.validateZipSignature(buffer);
      const fileSize = buffer.length;
      
      return {
        testId: test.id,
        passed: hasValidSignature && fileSize > 1000,
        fileSize,
        hasValidSignature,
        powerPointAccepts: true, // Will be updated by manual testing
        generationTime
      };
      
    } catch (error) {
      return {
        testId: test.id,
        passed: false,
        fileSize: 0,
        hasValidSignature: false,
        powerPointAccepts: false,
        errorDetails: error instanceof Error ? error.message : String(error),
        generationTime: Date.now() - startTime
      };
    }
  }
  
  private static validateZipSignature(buffer: Buffer): boolean {
    if (buffer.length < 4) return false;
    const signature = buffer.subarray(0, 4);
    const expectedSignature = Buffer.from([0x50, 0x4B, 0x03, 0x04]);
    return signature.equals(expectedSignature);
  }
}

/**
 * Style Test Suite Generator
 * Creates comprehensive test cases for different styling aspects
 */
export class StyleTestSuite {
  
  /**
   * Generate font-related test cases
   */
  static getFontTests(): StyleTest[] {
    return [
      {
        id: 'font-calibri-basic',
        name: 'Calibri Basic',
        description: 'PowerPoint default font with basic styling',
        styleConfig: {
          fontSize: 16,
          fontFace: 'Calibri',
          color: '333333'
        },
        expectedResult: 'pass'
      },
      {
        id: 'font-arial-basic',
        name: 'Arial Basic',
        description: 'Common system font',
        styleConfig: {
          fontSize: 16,
          fontFace: 'Arial',
          color: '333333'
        },
        expectedResult: 'pass'
      },
      {
        id: 'font-custom-problematic',
        name: 'Custom Font Test',
        description: 'Test custom font that might cause issues',
        styleConfig: {
          fontSize: 16,
          fontFace: 'Inter var',
          color: '333333'
        },
        expectedResult: 'unknown'
      }
    ];
  }
  
  /**
   * Generate color-related test cases
   */
  static getColorTests(): StyleTest[] {
    return [
      {
        id: 'color-hex-6char',
        name: '6-Character Hex',
        description: 'Standard 6-character hex color',
        styleConfig: {
          fontSize: 16,
          fontFace: 'Calibri',
          color: '1E40AF'
        },
        expectedResult: 'pass'
      },
      {
        id: 'color-hex-3char',
        name: '3-Character Hex',
        description: 'Short 3-character hex color',
        styleConfig: {
          fontSize: 16,
          fontFace: 'Calibri',
          color: 'F00'
        },
        expectedResult: 'unknown'
      },
      {
        id: 'color-with-hash',
        name: 'Hex with Hash',
        description: 'Hex color with # prefix',
        styleConfig: {
          fontSize: 16,
          fontFace: 'Calibri',
          color: '#1E40AF'
        },
        expectedResult: 'unknown'
      }
    ];
  }
  
  /**
   * Generate formatting-related test cases
   */
  static getFormattingTests(): StyleTest[] {
    return [
      {
        id: 'format-basic',
        name: 'Basic Formatting',
        description: 'Minimal formatting options',
        styleConfig: {
          fontSize: 16,
          fontFace: 'Calibri',
          color: '333333',
          bold: false,
          italic: false
        },
        expectedResult: 'pass'
      },
      {
        id: 'format-bold-italic',
        name: 'Bold + Italic',
        description: 'Combined bold and italic',
        styleConfig: {
          fontSize: 16,
          fontFace: 'Calibri',
          color: '333333',
          bold: true,
          italic: true
        },
        expectedResult: 'pass'
      },
      {
        id: 'format-complex',
        name: 'Complex Formatting',
        description: 'Multiple formatting options',
        styleConfig: {
          fontSize: 16,
          fontFace: 'Calibri',
          color: '333333',
          bold: true,
          italic: true,
          underline: true,
          shadow: { type: 'outer', blur: 3, offset: 2, angle: 45, color: '00000020' }
        },
        expectedResult: 'unknown'
      }
    ];
  }
  
  /**
   * Generate all test cases
   */
  static getAllTests(): StyleTest[] {
    return [
      ...this.getFontTests(),
      ...this.getColorTests(),
      ...this.getFormattingTests()
    ];
  }
}
