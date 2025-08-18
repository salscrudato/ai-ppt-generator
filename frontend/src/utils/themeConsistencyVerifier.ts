/**
 * Theme Consistency Verifier
 * 
 * Innovative system to ensure theme consistency between:
 * 1. Theme selection UI
 * 2. Live preview components  
 * 3. Generated PowerPoint files
 * 
 * Uses a simple, progressive approach starting with basic color verification
 * and building up to comprehensive theme validation.
 */

import type { ProfessionalTheme } from '../themes/professionalThemes';
import type { SlideSpec } from '../types';

export interface ThemeVerificationResult {
  passed: boolean;
  score: number; // 0-100
  issues: ThemeIssue[];
  details: {
    background: ColorVerification;
    title: ColorVerification;
    text: ColorVerification;
    accent: ColorVerification;
  };
}

export interface ThemeIssue {
  severity: 'low' | 'medium' | 'high';
  component: 'preview' | 'powerpoint' | 'ui';
  property: string;
  expected: string;
  actual: string;
  message: string;
}

export interface ColorVerification {
  expected: string;
  actual: string;
  match: boolean;
  similarity: number; // 0-100
}

/**
 * Theme Consistency Verifier Class
 * 
 * Provides progressive verification from simple color checks to comprehensive validation
 */
export class ThemeConsistencyVerifier {
  private theme: ProfessionalTheme;
  private issues: ThemeIssue[] = [];

  constructor(theme: ProfessionalTheme) {
    this.theme = theme;
  }

  /**
   * Step 1: Simple Background and Title Verification
   * 
   * Verifies the most basic theme elements that users notice first
   */
  async verifyBasicThemeElements(previewElement: HTMLElement): Promise<ThemeVerificationResult> {
    console.log('🎨 Starting basic theme verification for:', this.theme.name);
    
    this.issues = []; // Reset issues
    
    // Verify background color
    const backgroundVerification = this.verifyBackgroundColor(previewElement);
    
    // Verify title color
    const titleVerification = this.verifyTitleColor(previewElement);
    
    // Verify text color
    const textVerification = this.verifyTextColor(previewElement);
    
    // Verify accent color
    const accentVerification = this.verifyAccentColor(previewElement);
    
    // Calculate overall score
    const score = this.calculateScore([
      backgroundVerification,
      titleVerification, 
      textVerification,
      accentVerification
    ]);
    
    const result: ThemeVerificationResult = {
      passed: score >= 85, // 85% threshold for passing
      score,
      issues: this.issues,
      details: {
        background: backgroundVerification,
        title: titleVerification,
        text: textVerification,
        accent: accentVerification
      }
    };
    
    console.log('✅ Basic theme verification completed:', {
      theme: this.theme.name,
      score,
      passed: result.passed,
      issues: this.issues.length
    });
    
    return result;
  }

  /**
   * Verify background color consistency
   */
  private verifyBackgroundColor(element: HTMLElement): ColorVerification {
    const computedStyle = window.getComputedStyle(element);
    const actualBg = computedStyle.backgroundColor;
    const expectedBg = this.theme.colors.background;
    
    // Convert colors to comparable format
    const actualHex = this.rgbToHex(actualBg);
    const expectedHex = this.normalizeColor(expectedBg);
    
    const similarity = this.calculateColorSimilarity(actualHex, expectedHex);
    const match = similarity >= 90; // 90% similarity threshold
    
    if (!match) {
      this.issues.push({
        severity: 'high',
        component: 'preview',
        property: 'background-color',
        expected: expectedHex,
        actual: actualHex,
        message: `Background color mismatch: expected ${expectedHex}, got ${actualHex}`
      });
    }
    
    return {
      expected: expectedHex,
      actual: actualHex,
      match,
      similarity
    };
  }

  /**
   * Verify title color consistency
   */
  private verifyTitleColor(element: HTMLElement): ColorVerification {
    // Find title element (h1, h2, or element with title-like classes)
    const titleElement = element.querySelector('h1, h2, .slide-title, [class*="title"]') as HTMLElement;
    
    if (!titleElement) {
      this.issues.push({
        severity: 'medium',
        component: 'preview',
        property: 'title-element',
        expected: 'title element',
        actual: 'not found',
        message: 'No title element found in preview'
      });
      
      return {
        expected: this.theme.colors.primary,
        actual: 'not found',
        match: false,
        similarity: 0
      };
    }
    
    const computedStyle = window.getComputedStyle(titleElement);
    const actualColor = computedStyle.color;
    const expectedColor = this.theme.colors.primary;
    
    const actualHex = this.rgbToHex(actualColor);
    const expectedHex = this.normalizeColor(expectedColor);
    
    const similarity = this.calculateColorSimilarity(actualHex, expectedHex);
    const match = similarity >= 85; // Slightly lower threshold for text colors
    
    if (!match) {
      this.issues.push({
        severity: 'high',
        component: 'preview',
        property: 'title-color',
        expected: expectedHex,
        actual: actualHex,
        message: `Title color mismatch: expected ${expectedHex}, got ${actualHex}`
      });
    }
    
    return {
      expected: expectedHex,
      actual: actualHex,
      match,
      similarity
    };
  }

  /**
   * Verify text color consistency
   */
  private verifyTextColor(element: HTMLElement): ColorVerification {
    // Find text elements (p, span, div with text content)
    const textElements = element.querySelectorAll('p, span, div:not([class*="title"])');
    
    if (textElements.length === 0) {
      return {
        expected: this.theme.colors.text.primary,
        actual: 'not found',
        match: false,
        similarity: 0
      };
    }
    
    // Check the first text element
    const textElement = textElements[0] as HTMLElement;
    const computedStyle = window.getComputedStyle(textElement);
    const actualColor = computedStyle.color;
    const expectedColor = this.theme.colors.text.primary;
    
    const actualHex = this.rgbToHex(actualColor);
    const expectedHex = this.normalizeColor(expectedColor);
    
    const similarity = this.calculateColorSimilarity(actualHex, expectedHex);
    const match = similarity >= 80; // Lower threshold for body text
    
    if (!match) {
      this.issues.push({
        severity: 'medium',
        component: 'preview',
        property: 'text-color',
        expected: expectedHex,
        actual: actualHex,
        message: `Text color mismatch: expected ${expectedHex}, got ${actualHex}`
      });
    }
    
    return {
      expected: expectedHex,
      actual: actualHex,
      match,
      similarity
    };
  }

  /**
   * Verify accent color consistency
   */
  private verifyAccentColor(element: HTMLElement): ColorVerification {
    // Find elements that should use accent color (bullets, highlights, etc.)
    const accentElements = element.querySelectorAll('[class*="accent"], .bullet-point, [style*="accent"]');
    
    if (accentElements.length === 0) {
      return {
        expected: this.theme.colors.accent,
        actual: 'not found',
        match: true, // Not finding accent elements is not necessarily an error
        similarity: 100
      };
    }
    
    const accentElement = accentElements[0] as HTMLElement;
    const computedStyle = window.getComputedStyle(accentElement);
    const actualColor = computedStyle.color;
    const expectedColor = this.theme.colors.accent;
    
    const actualHex = this.rgbToHex(actualColor);
    const expectedHex = this.normalizeColor(expectedColor);
    
    const similarity = this.calculateColorSimilarity(actualHex, expectedHex);
    const match = similarity >= 80;
    
    if (!match) {
      this.issues.push({
        severity: 'low',
        component: 'preview',
        property: 'accent-color',
        expected: expectedHex,
        actual: actualHex,
        message: `Accent color mismatch: expected ${expectedHex}, got ${actualHex}`
      });
    }
    
    return {
      expected: expectedHex,
      actual: actualHex,
      match,
      similarity
    };
  }

  /**
   * Calculate overall verification score
   */
  private calculateScore(verifications: ColorVerification[]): number {
    const weights = [0.3, 0.3, 0.25, 0.15]; // background, title, text, accent
    let totalScore = 0;
    
    verifications.forEach((verification, index) => {
      totalScore += verification.similarity * weights[index];
    });
    
    return Math.round(totalScore);
  }

  /**
   * Convert RGB color to hex
   */
  private rgbToHex(rgb: string): string {
    if (rgb.startsWith('#')) return rgb;
    
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return '#000000';
    
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
  }

  /**
   * Normalize color to hex format
   */
  private normalizeColor(color: string): string {
    if (color.startsWith('#')) {
      return color.toUpperCase();
    }
    return this.rgbToHex(color);
  }

  /**
   * Calculate color similarity percentage
   */
  private calculateColorSimilarity(color1: string, color2: string): number {
    if (color1 === color2) return 100;
    
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return 0;
    
    // Calculate Euclidean distance in RGB space
    const distance = Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
    );
    
    // Convert to similarity percentage (max distance is ~441 for RGB)
    const similarity = Math.max(0, 100 - (distance / 441) * 100);
    return Math.round(similarity);
  }

  /**
   * Convert hex to RGB object
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
}

/**
 * Convenience function to verify theme consistency
 */
export async function verifyThemeConsistency(
  theme: ProfessionalTheme,
  previewElement: HTMLElement
): Promise<ThemeVerificationResult> {
  const verifier = new ThemeConsistencyVerifier(theme);
  return await verifier.verifyBasicThemeElements(previewElement);
}
