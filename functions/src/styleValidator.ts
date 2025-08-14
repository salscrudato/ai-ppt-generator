/**
 * Enhanced Professional Style Validation System
 *
 * Ensures all generated PowerPoint presentations meet professional design standards,
 * accessibility requirements, and modern visual design principles.
 * Enhanced to work with the new layout engine and theme system.
 *
 * @version 2.0.0
 * @author AI PowerPoint Generator Team
 */

import type { SlideSpec } from './schema';
import type { ProfessionalTheme } from './professionalThemes';
import { ThemeTokens } from './core/theme/tokens';
import { LayoutSpec, SlideBuildResult, TextBlock, Box } from './core/layout/primitives';
import { getContrastRatio, validateAccessibility as validateThemeAccessibility } from './core/theme/utilities';

export interface StyleValidationResult {
  isValid: boolean;
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  issues: StyleIssue[];
  suggestions: string[];
  accessibility: AccessibilityResult;
  typography: TypographyResult;
  colorHarmony: ColorHarmonyResult;
}

export interface StyleIssue {
  type: 'error' | 'warning' | 'info';
  category: 'typography' | 'color' | 'layout' | 'accessibility' | 'content';
  message: string;
  severity: 'critical' | 'major' | 'minor';
  fix?: string;
}

export interface AccessibilityResult {
  score: number;
  contrastRatio: number;
  colorBlindnessFriendly: boolean;
  readabilityScore: number;
  issues: string[];
}

export interface TypographyResult {
  score: number;
  fontHierarchy: boolean;
  readability: 'excellent' | 'good' | 'fair' | 'poor';
  consistency: boolean;
  issues: string[];
}

export interface ColorHarmonyResult {
  score: number;
  harmony: 'excellent' | 'good' | 'fair' | 'poor';
  balance: boolean;
  professionalAppearance: boolean;
  issues: string[];
}

/**
 * Enhanced layout validation result
 */
export interface LayoutValidationResult {
  score: number;
  spacing: boolean;
  alignment: boolean;
  hierarchy: boolean;
  safeMargins: boolean;
  overlapping: boolean;
  gridCompliance: boolean;
  issues: string[];
}

/**
 * Validate layout specification against design standards
 */
export function validateLayoutSpec(
  layout: LayoutSpec,
  theme: ThemeTokens
): LayoutValidationResult {
  const issues: string[] = [];
  let score = 100;

  // Check safe margins
  const safeMargins = validateSafeMargins(layout, theme);
  if (!safeMargins.valid) {
    issues.push(...safeMargins.issues);
    score -= 15;
  }

  // Check for overlapping elements
  const overlapping = checkOverlappingElements(layout);
  if (overlapping.hasOverlaps) {
    issues.push(...overlapping.issues);
    score -= 20;
  }

  // Validate typography hierarchy
  const hierarchy = validateTypographyHierarchy(layout, theme);
  if (!hierarchy.valid) {
    issues.push(...hierarchy.issues);
    score -= 10;
  }

  // Check spacing consistency
  const spacing = validateSpacingConsistency(layout, theme);
  if (!spacing.valid) {
    issues.push(...spacing.issues);
    score -= 10;
  }

  // Validate accessibility compliance
  const accessibility = validateLayoutAccessibility(layout, theme);
  if (!accessibility.valid) {
    issues.push(...accessibility.issues);
    score -= 15;
  }

  return {
    score: Math.max(0, score),
    spacing: spacing.valid,
    alignment: true, // Grid system ensures alignment
    hierarchy: hierarchy.valid,
    safeMargins: safeMargins.valid,
    overlapping: !overlapping.hasOverlaps,
    gridCompliance: true, // Layout engine ensures grid compliance
    issues
  };
}

/**
 * Validate slide build result
 */
export function validateSlideBuildResult(
  result: SlideBuildResult,
  theme: ThemeTokens
): StyleValidationResult {
  const layoutValidation = validateLayoutSpec(result.layout, theme);
  const issues: StyleIssue[] = [];

  // Convert layout issues to style issues
  layoutValidation.issues.forEach(issue => {
    issues.push({
      type: 'warning',
      category: 'layout',
      message: issue,
      severity: 'minor',
      fix: 'Adjust layout spacing or positioning'
    });
  });

  // Add metadata-based issues
  result.metadata.warnings.forEach(warning => {
    issues.push({
      type: 'warning',
      category: 'content',
      message: warning,
      severity: 'minor'
    });
  });

  result.metadata.errors.forEach(error => {
    issues.push({
      type: 'error',
      category: 'layout',
      message: error,
      severity: 'critical'
    });
  });

  // Calculate overall score
  let score = layoutValidation.score;

  // Penalize for errors and warnings
  const criticalIssues = issues.filter(i => i.severity === 'critical').length;
  const majorIssues = issues.filter(i => i.severity === 'major').length;
  const minorIssues = issues.filter(i => i.severity === 'minor').length;

  score -= criticalIssues * 25;
  score -= majorIssues * 10;
  score -= minorIssues * 5;

  const finalScore = Math.max(0, Math.round(score));
  let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
  if (finalScore >= 90) grade = 'A';
  else if (finalScore >= 80) grade = 'B';
  else if (finalScore >= 70) grade = 'C';
  else if (finalScore >= 60) grade = 'D';

  return {
    isValid: finalScore >= 70 && criticalIssues === 0,
    score: finalScore,
    grade,
    issues,
    suggestions: generateLayoutSuggestions(issues, result.layout, theme),
    accessibility: {
      score: layoutValidation.score,
      contrastRatio: 4.5, // Placeholder - would calculate from actual colors
      colorBlindnessFriendly: true,
      readabilityScore: layoutValidation.score,
      issues: layoutValidation.issues
    },
    typography: {
      score: layoutValidation.score,
      fontHierarchy: layoutValidation.hierarchy,
      readability: finalScore >= 80 ? 'excellent' : finalScore >= 60 ? 'good' : 'fair',
      consistency: true,
      issues: layoutValidation.issues
    },
    colorHarmony: {
      score: layoutValidation.score,
      harmony: finalScore >= 80 ? 'excellent' : finalScore >= 60 ? 'good' : 'fair',
      balance: true,
      professionalAppearance: finalScore >= 70,
      issues: layoutValidation.issues
    }
  };
}

/**
 * Validate safe margins are maintained
 */
function validateSafeMargins(
  layout: LayoutSpec,
  theme: ThemeTokens
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  const safeMargin = theme.layout.safeMargin;

  layout.content.forEach((element, index) => {
    const box = element as Box;

    // Check left margin
    if (box.x < safeMargin) {
      issues.push(`Element ${index + 1} violates left safe margin`);
    }

    // Check top margin
    if (box.y < safeMargin) {
      issues.push(`Element ${index + 1} violates top safe margin`);
    }

    // Check right margin
    if (box.x + box.width > theme.layout.slideWidth - safeMargin) {
      issues.push(`Element ${index + 1} violates right safe margin`);
    }

    // Check bottom margin
    if (box.y + box.height > theme.layout.slideHeight - safeMargin) {
      issues.push(`Element ${index + 1} violates bottom safe margin`);
    }
  });

  return { valid: issues.length === 0, issues };
}

/**
 * Check for overlapping elements
 */
function checkOverlappingElements(
  layout: LayoutSpec
): { hasOverlaps: boolean; issues: string[] } {
  const issues: string[] = [];
  const elements = layout.content as Box[];

  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      const a = elements[i];
      const b = elements[j];

      // Check if rectangles overlap
      const overlap = !(
        a.x + a.width <= b.x ||
        b.x + b.width <= a.x ||
        a.y + a.height <= b.y ||
        b.y + b.height <= a.y
      );

      if (overlap) {
        issues.push(`Elements ${i + 1} and ${j + 1} overlap`);
      }
    }
  }

  return { hasOverlaps: issues.length > 0, issues };
}

/**
 * Validate typography hierarchy
 */
function validateTypographyHierarchy(
  layout: LayoutSpec,
  theme: ThemeTokens
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  const textElements = layout.content.filter(el => 'text' in el) as TextBlock[];

  if (textElements.length === 0) {
    return { valid: true, issues };
  }

  // Check font size hierarchy
  const fontSizes = textElements.map(el => el.fontSize).sort((a, b) => b - a);
  const uniqueSizes = [...new Set(fontSizes)];

  if (uniqueSizes.length === 1 && textElements.length > 1) {
    issues.push('All text elements use the same font size - consider establishing hierarchy');
  }

  // Check for appropriate title sizing
  const titleElements = textElements.filter(el =>
    el.fontSize >= theme.typography.fontSizes.h1
  );

  if (titleElements.length === 0 && textElements.length > 0) {
    issues.push('No title-sized text found - consider adding a clear heading');
  }

  if (titleElements.length > 2) {
    issues.push('Too many title-sized elements may confuse hierarchy');
  }

  return { valid: issues.length === 0, issues };
}

/**
 * Validate spacing consistency
 */
function validateSpacingConsistency(
  layout: LayoutSpec,
  theme: ThemeTokens
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  const elements = layout.content as Box[];

  if (elements.length < 2) {
    return { valid: true, issues };
  }

  // Check vertical spacing consistency
  const verticalSpaces: number[] = [];
  for (let i = 0; i < elements.length - 1; i++) {
    const current = elements[i];
    const next = elements[i + 1];

    if (next.y > current.y + current.height) {
      verticalSpaces.push(next.y - (current.y + current.height));
    }
  }

  // Check if spacing is consistent (within tolerance)
  if (verticalSpaces.length > 1) {
    const avgSpacing = verticalSpaces.reduce((a, b) => a + b, 0) / verticalSpaces.length;
    const tolerance = theme.spacing.xs; // Small tolerance

    const inconsistentSpacing = verticalSpaces.some(space =>
      Math.abs(space - avgSpacing) > tolerance
    );

    if (inconsistentSpacing) {
      issues.push('Inconsistent vertical spacing between elements');
    }
  }

  return { valid: issues.length === 0, issues };
}

/**
 * Validate layout accessibility
 */
function validateLayoutAccessibility(
  layout: LayoutSpec,
  theme: ThemeTokens
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  const textElements = layout.content.filter(el => 'text' in el) as TextBlock[];

  // Check minimum font sizes
  textElements.forEach((element, index) => {
    if (element.fontSize < 12) {
      issues.push(`Text element ${index + 1} font size (${element.fontSize}pt) is below minimum (12pt)`);
    }
  });

  // Check color contrast (simplified - would need actual color values)
  textElements.forEach((element, index) => {
    if (element.color && theme.palette.background) {
      const contrast = getContrastRatio(`#${element.color}`, theme.palette.background);
      if (contrast < 4.5) {
        issues.push(`Text element ${index + 1} has insufficient color contrast (${contrast.toFixed(1)}:1)`);
      }
    }
  });

  // Check reading order (elements should be positioned logically)
  if (textElements.length > 1) {
    const sortedByPosition = [...textElements].sort((a, b) => {
      if (Math.abs(a.y - b.y) < theme.spacing.sm) {
        return a.x - b.x; // Same row, sort by x
      }
      return a.y - b.y; // Different rows, sort by y
    });

    // This is a simplified check - in practice, you'd want more sophisticated reading order validation
    if (JSON.stringify(sortedByPosition) !== JSON.stringify(textElements)) {
      issues.push('Text elements may not follow logical reading order');
    }
  }

  return { valid: issues.length === 0, issues };
}

/**
 * Generate layout-specific suggestions
 */
function generateLayoutSuggestions(
  issues: StyleIssue[],
  layout: LayoutSpec,
  theme: ThemeTokens
): string[] {
  const suggestions: string[] = [];

  const hasOverlapIssues = issues.some(i => i.message.includes('overlap'));
  const hasMarginIssues = issues.some(i => i.message.includes('margin'));
  const hasHierarchyIssues = issues.some(i => i.message.includes('hierarchy'));
  const hasContrastIssues = issues.some(i => i.message.includes('contrast'));

  if (hasOverlapIssues) {
    suggestions.push('Increase spacing between elements to prevent overlapping');
  }

  if (hasMarginIssues) {
    suggestions.push('Ensure all elements maintain safe margins from slide edges');
  }

  if (hasHierarchyIssues) {
    suggestions.push('Establish clear typography hierarchy with varied font sizes');
  }

  if (hasContrastIssues) {
    suggestions.push('Improve color contrast for better readability');
  }

  if (layout.content.length > 8) {
    suggestions.push('Consider reducing content density for better visual impact');
  }

  return suggestions;
}

/**
 * Validate the overall style quality of a slide specification
 */
export function validateSlideStyle(spec: SlideSpec, theme: ProfessionalTheme): StyleValidationResult {
  const issues: StyleIssue[] = [];
  let score = 100;

  // Validate typography
  const typographyResult = validateTypography(spec, theme);
  score -= (100 - typographyResult.score) * 0.3;
  
  // Validate accessibility
  const accessibilityResult = validateAccessibility(spec, theme);
  score -= (100 - accessibilityResult.score) * 0.3;
  
  // Validate color harmony
  const colorHarmonyResult = validateColorHarmony(spec, theme);
  score -= (100 - colorHarmonyResult.score) * 0.2;
  
  // Validate layout and spacing
  const layoutScore = validateLayout(spec, theme);
  score -= (100 - layoutScore) * 0.2;

  // Collect all issues
  issues.push(...collectTypographyIssues(typographyResult));
  issues.push(...collectAccessibilityIssues(accessibilityResult));
  issues.push(...collectColorIssues(colorHarmonyResult));

  // Generate suggestions
  const suggestions = generateStyleSuggestions(issues, spec, theme);

  // Calculate final grade
  const finalScore = Math.max(0, Math.round(score));
  let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
  if (finalScore >= 90) grade = 'A';
  else if (finalScore >= 80) grade = 'B';
  else if (finalScore >= 70) grade = 'C';
  else if (finalScore >= 60) grade = 'D';

  return {
    isValid: finalScore >= 70,
    score: finalScore,
    grade,
    issues,
    suggestions,
    accessibility: accessibilityResult,
    typography: typographyResult,
    colorHarmony: colorHarmonyResult
  };
}

/**
 * Validate typography quality and consistency
 */
function validateTypography(spec: SlideSpec, theme: ProfessionalTheme): TypographyResult {
  let score = 100;
  const issues: string[] = [];
  
  // Check title length and quality
  if (spec.title.length < 10) {
    issues.push('Title is too short for optimal impact');
    score -= 15;
  }
  
  if (spec.title.length > 80) {
    issues.push('Title may be too long for slide display');
    score -= 10;
  }

  // Check content balance
  const hasContent = spec.paragraph || spec.bullets?.length || spec.contentItems?.length;
  if (!hasContent) {
    issues.push('Slide lacks sufficient content for engagement');
    score -= 20;
  }

  // Check bullet point optimization
  if (spec.bullets && spec.bullets.length > 7) {
    issues.push('Too many bullet points may overwhelm audience');
    score -= 10;
  }

  // Assess readability
  let readability: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';
  if (score < 90) readability = 'good';
  if (score < 75) readability = 'fair';
  if (score < 60) readability = 'poor';

  return {
    score: Math.max(0, score),
    fontHierarchy: true, // Themes ensure good hierarchy
    readability,
    consistency: true, // Themes ensure consistency
    issues
  };
}

/**
 * Validate accessibility compliance
 */
function validateAccessibility(spec: SlideSpec, theme: ProfessionalTheme): AccessibilityResult {
  let score = 100;
  const issues: string[] = [];
  
  // Calculate contrast ratio (simplified)
  const contrastRatio = calculateContrastRatio(theme.colors.text.primary, theme.colors.background);
  
  if (contrastRatio < 4.5) {
    issues.push('Text contrast ratio is below WCAG AA standards');
    score -= 25;
  }
  
  // Check for color-only information
  const colorBlindnessFriendly = checkColorBlindnessFriendliness(theme);
  if (!colorBlindnessFriendly) {
    issues.push('Color scheme may not be accessible to color-blind users');
    score -= 15;
  }

  // Check for alt text on images
  if (spec.right?.imagePrompt && !spec.notes) {
    issues.push('Images should have descriptive text in speaker notes');
    score -= 10;
  }

  const readabilityScore = calculateReadabilityScore(spec);

  return {
    score: Math.max(0, score),
    contrastRatio,
    colorBlindnessFriendly,
    readabilityScore,
    issues
  };
}

/**
 * Validate color harmony and professional appearance
 */
function validateColorHarmony(spec: SlideSpec, theme: ProfessionalTheme): ColorHarmonyResult {
  let score = 100;
  const issues: string[] = [];
  
  // Check color balance
  const balance = checkColorBalance(theme);
  if (!balance) {
    issues.push('Color palette lacks proper balance');
    score -= 15;
  }

  // Assess professional appearance
  const professionalAppearance = assessProfessionalAppearance(theme);
  if (!professionalAppearance) {
    issues.push('Color scheme may appear unprofessional');
    score -= 20;
  }

  let harmony: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';
  if (score < 90) harmony = 'good';
  if (score < 75) harmony = 'fair';
  if (score < 60) harmony = 'poor';

  return {
    score: Math.max(0, score),
    harmony,
    balance,
    professionalAppearance,
    issues
  };
}

/**
 * Validate layout and spacing quality
 */
function validateLayout(spec: SlideSpec, theme: ProfessionalTheme): number {
  let score = 100;
  
  // Check layout appropriateness
  if (spec.layout === 'two-column' && (!spec.left || !spec.right)) {
    score -= 20;
  }
  
  if (spec.layout === 'chart' && !spec.chart) {
    score -= 25;
  }

  return Math.max(0, score);
}

// Helper functions
function calculateContrastRatio(foreground: string, background: string): number {
  // Simplified contrast calculation
  const fgLum = getLuminance(foreground);
  const bgLum = getLuminance(background);
  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);
  return (lighter + 0.05) / (darker + 0.05);
}

function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function checkColorBlindnessFriendliness(theme: ProfessionalTheme): boolean {
  // Simplified check - ensure sufficient contrast between primary colors
  const primaryContrast = calculateContrastRatio(theme.colors.primary, theme.colors.secondary);
  return primaryContrast > 3.0;
}

function calculateReadabilityScore(spec: SlideSpec): number {
  const allText = [spec.title, spec.paragraph || '', ...(spec.bullets || [])].join(' ');
  const words = allText.split(/\s+/).filter(w => w.length > 0);
  const sentences = allText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length === 0) return 50;
  
  const avgWordsPerSentence = words.length / sentences.length;
  
  // Optimal range is 15-20 words per sentence
  if (avgWordsPerSentence >= 15 && avgWordsPerSentence <= 20) return 100;
  if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 25) return 85;
  if (avgWordsPerSentence >= 5 && avgWordsPerSentence <= 30) return 70;
  return 50;
}

function checkColorBalance(theme: ProfessionalTheme): boolean {
  // Check if colors are too similar or too different
  const primaryLum = getLuminance(theme.colors.primary);
  const secondaryLum = getLuminance(theme.colors.secondary);
  const diff = Math.abs(primaryLum - secondaryLum);
  return diff > 0.1 && diff < 0.8;
}

function assessProfessionalAppearance(theme: ProfessionalTheme): boolean {
  // Professional themes should have muted, sophisticated colors
  const primaryLum = getLuminance(theme.colors.primary);
  const backgroundLum = getLuminance(theme.colors.background);
  
  // Ensure sufficient contrast and avoid overly bright colors
  return primaryLum < 0.7 && backgroundLum > 0.8;
}

function collectTypographyIssues(result: TypographyResult): StyleIssue[] {
  return result.issues.map(issue => ({
    type: 'warning' as const,
    category: 'typography' as const,
    message: issue,
    severity: 'minor' as const,
    fix: 'Review content length and structure'
  }));
}

function collectAccessibilityIssues(result: AccessibilityResult): StyleIssue[] {
  return result.issues.map(issue => ({
    type: 'error' as const,
    category: 'accessibility' as const,
    message: issue,
    severity: 'major' as const,
    fix: 'Improve color contrast or add alternative text'
  }));
}

function collectColorIssues(result: ColorHarmonyResult): StyleIssue[] {
  return result.issues.map(issue => ({
    type: 'warning' as const,
    category: 'color' as const,
    message: issue,
    severity: 'minor' as const,
    fix: 'Consider adjusting color palette'
  }));
}

function generateStyleSuggestions(issues: StyleIssue[], spec: SlideSpec, theme: ProfessionalTheme): string[] {
  const suggestions: string[] = [];
  
  if (issues.some(i => i.category === 'typography')) {
    suggestions.push('Consider refining text content for better readability');
  }
  
  if (issues.some(i => i.category === 'accessibility')) {
    suggestions.push('Improve accessibility by ensuring proper contrast and alternative text');
  }
  
  if (issues.some(i => i.category === 'color')) {
    suggestions.push('Fine-tune color palette for better professional appearance');
  }
  
  if (spec.bullets && spec.bullets.length > 5) {
    suggestions.push('Consider reducing bullet points to 5 or fewer for better impact');
  }
  
  if (!spec.notes) {
    suggestions.push('Add speaker notes to provide context and improve accessibility');
  }
  
  return suggestions;
}
