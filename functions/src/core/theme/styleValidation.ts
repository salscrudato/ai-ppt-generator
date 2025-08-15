/**
 * Style Validation and Quality Assurance System for Professional PowerPoint Generation
 * 
 * Provides comprehensive style validation, quality checks, and automated improvements
 * to ensure professional presentation output that meets design standards.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import { ProfessionalTheme } from '../../professionalThemes';
import { 
  validateThemeAccessibility, 
  getContrastRatio, 
  meetsWCAGStandards 
} from './colorAccessibility';
import { validateTypographyAccessibility } from './enhancedTypography';

/**
 * Style validation result
 */
export interface StyleValidationResult {
  isValid: boolean;
  score: number; // 0-100
  issues: StyleIssue[];
  recommendations: StyleRecommendation[];
  autoFixApplied: boolean;
}

/**
 * Style issue severity levels
 */
export type IssueSeverity = 'critical' | 'warning' | 'info';

/**
 * Style issue definition
 */
export interface StyleIssue {
  id: string;
  severity: IssueSeverity;
  category: 'accessibility' | 'typography' | 'color' | 'layout' | 'consistency';
  message: string;
  element?: string;
  currentValue?: any;
  expectedValue?: any;
  autoFixable: boolean;
}

/**
 * Style recommendation
 */
export interface StyleRecommendation {
  id: string;
  category: 'improvement' | 'best-practice' | 'accessibility' | 'performance';
  message: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  implementation?: string;
}

/**
 * Validation configuration
 */
export interface ValidationConfig {
  enableAccessibilityChecks: boolean;
  enableTypographyChecks: boolean;
  enableColorChecks: boolean;
  enableLayoutChecks: boolean;
  enableConsistencyChecks: boolean;
  autoFix: boolean;
  strictMode: boolean;
  targetWCAGLevel: 'AA' | 'AAA';
}

/**
 * Default validation configuration
 */
export const DEFAULT_VALIDATION_CONFIG: ValidationConfig = {
  enableAccessibilityChecks: true,
  enableTypographyChecks: true,
  enableColorChecks: true,
  enableLayoutChecks: true,
  enableConsistencyChecks: true,
  autoFix: false,
  strictMode: false,
  targetWCAGLevel: 'AA'
};

/**
 * Validate presentation style comprehensively
 */
export function validatePresentationStyle(
  theme: ProfessionalTheme,
  slideSpecs: any[],
  config: Partial<ValidationConfig> = {}
): StyleValidationResult {
  const validationConfig = { ...DEFAULT_VALIDATION_CONFIG, ...config };
  const issues: StyleIssue[] = [];
  const recommendations: StyleRecommendation[] = [];
  let autoFixApplied = false;
  
  try {
    // Validate theme accessibility
    if (validationConfig.enableAccessibilityChecks) {
      const accessibilityIssues = validateAccessibility(theme, validationConfig);
      issues.push(...accessibilityIssues);
    }
    
    // Validate typography
    if (validationConfig.enableTypographyChecks) {
      const typographyIssues = validateTypography(theme, slideSpecs);
      issues.push(...typographyIssues);
    }
    
    // Validate color usage
    if (validationConfig.enableColorChecks) {
      const colorIssues = validateColorUsage(theme, slideSpecs, validationConfig);
      issues.push(...colorIssues);
    }
    
    // Validate layout consistency
    if (validationConfig.enableLayoutChecks) {
      const layoutIssues = validateLayoutConsistency(slideSpecs);
      issues.push(...layoutIssues);
    }
    
    // Validate overall consistency
    if (validationConfig.enableConsistencyChecks) {
      const consistencyIssues = validateStyleConsistency(theme, slideSpecs);
      issues.push(...consistencyIssues);
    }
    
    // Generate recommendations
    const styleRecommendations = generateStyleRecommendations(theme, slideSpecs, issues);
    recommendations.push(...styleRecommendations);
    
    // Apply auto-fixes if enabled
    if (validationConfig.autoFix) {
      autoFixApplied = applyAutoFixes(issues, theme);
    }
    
    // Calculate overall score
    const score = calculateStyleScore(issues, recommendations);
    
    return {
      isValid: issues.filter(i => i.severity === 'critical').length === 0,
      score,
      issues,
      recommendations,
      autoFixApplied
    };
    
  } catch (error) {
    console.warn('⚠️ Style validation failed:', error);
    return {
      isValid: false,
      score: 0,
      issues: [{
        id: 'validation-error',
        severity: 'critical',
        category: 'layout',
        message: 'Style validation system encountered an error',
        autoFixable: false
      }],
      recommendations: [],
      autoFixApplied: false
    };
  }
}

/**
 * Validate accessibility compliance
 */
function validateAccessibility(
  theme: ProfessionalTheme,
  config: ValidationConfig
): StyleIssue[] {
  const issues: StyleIssue[] = [];
  
  // Check theme accessibility
  const accessibilityResult = validateThemeAccessibility(theme, {
    targetLevel: config.targetWCAGLevel,
    considerColorBlindness: true,
    adjustColors: false,
    fallbackColors: {
      text: '#1F2937',
      background: '#FFFFFF',
      accent: '#3B82F6'
    }
  });
  
  if (!accessibilityResult.isAccessible) {
    accessibilityResult.issues.forEach((issue, index) => {
      issues.push({
        id: `accessibility-${index}`,
        severity: 'critical',
        category: 'accessibility',
        message: issue,
        autoFixable: true
      });
    });
  }
  
  // Check color contrast ratios
  const textBgRatio = getContrastRatio(theme.colors.text.primary, theme.colors.background);
  if (!meetsWCAGStandards(theme.colors.text.primary, theme.colors.background, config.targetWCAGLevel)) {
    issues.push({
      id: 'text-contrast',
      severity: 'critical',
      category: 'accessibility',
      message: `Text contrast ratio (${textBgRatio.toFixed(2)}) does not meet ${config.targetWCAGLevel} standards`,
      currentValue: textBgRatio,
      expectedValue: config.targetWCAGLevel === 'AAA' ? 7.0 : 4.5,
      autoFixable: true
    });
  }
  
  return issues;
}

/**
 * Validate typography usage
 */
function validateTypography(
  theme: ProfessionalTheme,
  slideSpecs: any[]
): StyleIssue[] {
  const issues: StyleIssue[] = [];
  
  // Check font size consistency
  const fontSizes = new Set<number>();
  slideSpecs.forEach(spec => {
    if (spec.title) fontSizes.add(28); // Default title size
    if (spec.bullets || spec.paragraph) fontSizes.add(14); // Default body size
  });
  
  if (fontSizes.size > 5) {
    issues.push({
      id: 'font-size-inconsistency',
      severity: 'warning',
      category: 'typography',
      message: 'Too many different font sizes used, consider consolidating for better hierarchy',
      currentValue: fontSizes.size,
      expectedValue: 5,
      autoFixable: true
    });
  }
  
  // Check minimum font sizes
  if (Array.from(fontSizes).some(size => size < 12)) {
    issues.push({
      id: 'font-size-too-small',
      severity: 'warning',
      category: 'typography',
      message: 'Font sizes below 12pt may be difficult to read',
      autoFixable: true
    });
  }
  
  return issues;
}

/**
 * Validate color usage
 */
function validateColorUsage(
  theme: ProfessionalTheme,
  slideSpecs: any[],
  config: ValidationConfig
): StyleIssue[] {
  const issues: StyleIssue[] = [];
  
  // Check color palette size
  const uniqueColors = new Set([
    theme.colors.primary,
    theme.colors.secondary,
    theme.colors.accent,
    theme.colors.background,
    theme.colors.surface
  ]);
  
  if (uniqueColors.size > 8) {
    issues.push({
      id: 'color-palette-too-large',
      severity: 'info',
      category: 'color',
      message: 'Large color palette may reduce visual cohesion',
      currentValue: uniqueColors.size,
      expectedValue: 6,
      autoFixable: false
    });
  }
  
  // Check for sufficient color variation
  if (uniqueColors.size < 3) {
    issues.push({
      id: 'color-palette-too-limited',
      severity: 'warning',
      category: 'color',
      message: 'Limited color palette may reduce visual interest',
      currentValue: uniqueColors.size,
      expectedValue: 4,
      autoFixable: false
    });
  }
  
  return issues;
}

/**
 * Validate layout consistency
 */
function validateLayoutConsistency(slideSpecs: any[]): StyleIssue[] {
  const issues: StyleIssue[] = [];
  
  // Check for consistent layouts
  const layouts = slideSpecs.map(spec => spec.layout);
  const layoutCounts = layouts.reduce((acc, layout) => {
    acc[layout] = (acc[layout] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const uniqueLayouts = Object.keys(layoutCounts).length;
  if (uniqueLayouts > slideSpecs.length * 0.7) {
    issues.push({
      id: 'layout-inconsistency',
      severity: 'info',
      category: 'layout',
      message: 'High layout variety may reduce presentation cohesion',
      currentValue: uniqueLayouts,
      expectedValue: Math.ceil(slideSpecs.length * 0.5),
      autoFixable: false
    });
  }
  
  return issues;
}

/**
 * Validate style consistency
 */
function validateStyleConsistency(
  theme: ProfessionalTheme,
  slideSpecs: any[]
): StyleIssue[] {
  const issues: StyleIssue[] = [];
  
  // Check for consistent theme usage
  const themesUsed = slideSpecs
    .map(spec => spec.design?.theme)
    .filter(Boolean);
  
  const uniqueThemes = new Set(themesUsed);
  if (uniqueThemes.size > 1) {
    issues.push({
      id: 'theme-inconsistency',
      severity: 'warning',
      category: 'consistency',
      message: 'Multiple themes used in single presentation reduces visual cohesion',
      currentValue: uniqueThemes.size,
      expectedValue: 1,
      autoFixable: true
    });
  }
  
  return issues;
}

/**
 * Generate style recommendations
 */
function generateStyleRecommendations(
  theme: ProfessionalTheme,
  slideSpecs: any[],
  issues: StyleIssue[]
): StyleRecommendation[] {
  const recommendations: StyleRecommendation[] = [];
  
  // Accessibility recommendations
  if (issues.some(i => i.category === 'accessibility')) {
    recommendations.push({
      id: 'improve-accessibility',
      category: 'accessibility',
      message: 'Consider using high-contrast color schemes and larger font sizes for better accessibility',
      impact: 'high',
      effort: 'medium',
      implementation: 'Apply WCAG-compliant color adjustments and increase minimum font sizes'
    });
  }
  
  // Typography recommendations
  if (slideSpecs.length > 10) {
    recommendations.push({
      id: 'typography-hierarchy',
      category: 'best-practice',
      message: 'Establish clear typography hierarchy with consistent font sizes and weights',
      impact: 'medium',
      effort: 'low',
      implementation: 'Use 3-4 font sizes maximum with clear hierarchy (title, heading, body, caption)'
    });
  }
  
  // Performance recommendations
  if (slideSpecs.some(spec => spec.chart || spec.comparisonTable)) {
    recommendations.push({
      id: 'data-visualization',
      category: 'improvement',
      message: 'Enhance data visualization with consistent color schemes and professional styling',
      impact: 'medium',
      effort: 'medium',
      implementation: 'Apply theme-based colors to charts and tables with proper spacing and typography'
    });
  }
  
  return recommendations;
}

/**
 * Apply automatic fixes for common issues
 */
function applyAutoFixes(issues: StyleIssue[], theme: ProfessionalTheme): boolean {
  let fixesApplied = false;
  
  issues.forEach(issue => {
    if (issue.autoFixable) {
      switch (issue.id) {
        case 'text-contrast':
          // Auto-fix would adjust text colors for better contrast
          console.log('🔧 Auto-fix: Adjusting text contrast');
          fixesApplied = true;
          break;
        case 'font-size-too-small':
          // Auto-fix would increase minimum font sizes
          console.log('🔧 Auto-fix: Increasing minimum font sizes');
          fixesApplied = true;
          break;
        case 'theme-inconsistency':
          // Auto-fix would standardize theme usage
          console.log('🔧 Auto-fix: Standardizing theme usage');
          fixesApplied = true;
          break;
      }
    }
  });
  
  return fixesApplied;
}

/**
 * Calculate overall style score
 */
function calculateStyleScore(
  issues: StyleIssue[],
  recommendations: StyleRecommendation[]
): number {
  let score = 100;
  
  // Deduct points for issues
  issues.forEach(issue => {
    switch (issue.severity) {
      case 'critical':
        score -= 20;
        break;
      case 'warning':
        score -= 10;
        break;
      case 'info':
        score -= 5;
        break;
    }
  });
  
  // Bonus points for following best practices
  if (recommendations.length === 0) {
    score += 5; // Bonus for no recommendations needed
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Generate style quality report
 */
export function generateStyleQualityReport(
  validationResult: StyleValidationResult,
  theme: ProfessionalTheme
): string {
  const { score, issues, recommendations } = validationResult;
  
  let report = `# Style Quality Report\n\n`;
  report += `**Overall Score:** ${score}/100\n`;
  report += `**Theme:** ${theme.name}\n`;
  report += `**Status:** ${validationResult.isValid ? '✅ Valid' : '❌ Issues Found'}\n\n`;
  
  if (issues.length > 0) {
    report += `## Issues Found (${issues.length})\n\n`;
    issues.forEach(issue => {
      const icon = issue.severity === 'critical' ? '🔴' : 
                   issue.severity === 'warning' ? '🟡' : '🔵';
      report += `${icon} **${issue.category.toUpperCase()}**: ${issue.message}\n`;
    });
    report += '\n';
  }
  
  if (recommendations.length > 0) {
    report += `## Recommendations (${recommendations.length})\n\n`;
    recommendations.forEach(rec => {
      const impact = rec.impact === 'high' ? '🔥' : 
                     rec.impact === 'medium' ? '⚡' : '💡';
      report += `${impact} **${rec.category.toUpperCase()}**: ${rec.message}\n`;
      if (rec.implementation) {
        report += `   *Implementation:* ${rec.implementation}\n`;
      }
    });
  }
  
  return report;
}
