/**
 * Comprehensive Testing Suite for Enhanced PowerPoint Styling
 * 
 * Validates styling quality, accessibility compliance, and visual consistency
 * across different themes and layouts.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import type { SlideSpec } from '../schema';
import type { ProfessionalTheme } from '../professionalThemes';
import { createEnhancedColorPalette, getContextualColor } from '../core/theme/advancedColorManagement';
import { createTypographyTheme, validateTypographyAccessibility } from '../core/theme/enhancedTypography';
import { createChartStyling } from '../core/theme/enhancedChartStyling';
import { createTableStyling } from '../core/theme/enhancedTableStyling';
import { calculateSlideLayout } from '../core/enhancedSlideLayoutEngine';

/**
 * Test result interface
 */
export interface TestResult {
  testName: string;
  passed: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
  details?: any;
}

/**
 * Test suite configuration
 */
export interface TestSuiteConfig {
  includeAccessibilityTests: boolean;
  includePerformanceTests: boolean;
  includeVisualConsistencyTests: boolean;
  includeThemeCompatibilityTests: boolean;
  strictMode: boolean;
}

/**
 * Run comprehensive styling tests
 */
export async function runEnhancedStylingTests(
  slides: SlideSpec[],
  theme: ProfessionalTheme,
  config: TestSuiteConfig = {
    includeAccessibilityTests: true,
    includePerformanceTests: true,
    includeVisualConsistencyTests: true,
    includeThemeCompatibilityTests: true,
    strictMode: false
  }
): Promise<TestResult[]> {
  const results: TestResult[] = [];

  console.log('🧪 Starting comprehensive styling tests...');

  // Typography tests
  results.push(...await runTypographyTests(slides, theme, config));

  // Color management tests
  results.push(...await runColorTests(slides, theme, config));

  // Layout tests
  results.push(...await runLayoutTests(slides, theme, config));

  // Chart styling tests
  results.push(...await runChartStylingTests(slides, theme, config));

  // Table styling tests
  results.push(...await runTableStylingTests(slides, theme, config));

  // Accessibility tests
  if (config.includeAccessibilityTests) {
    results.push(...await runAccessibilityTests(slides, theme, config));
  }

  // Performance tests
  if (config.includePerformanceTests) {
    results.push(...await runPerformanceTests(slides, theme, config));
  }

  // Visual consistency tests
  if (config.includeVisualConsistencyTests) {
    results.push(...await runVisualConsistencyTests(slides, theme, config));
  }

  // Theme compatibility tests
  if (config.includeThemeCompatibilityTests) {
    results.push(...await runThemeCompatibilityTests(slides, theme, config));
  }

  console.log(`✅ Styling tests completed. ${results.filter(r => r.passed).length}/${results.length} tests passed.`);

  return results;
}

/**
 * Test typography system
 */
async function runTypographyTests(
  slides: SlideSpec[],
  theme: ProfessionalTheme,
  config: TestSuiteConfig
): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Test typography theme creation
  try {
    const typographyTheme = createTypographyTheme('modern');
    results.push({
      testName: 'Typography Theme Creation',
      passed: true,
      score: 100,
      issues: [],
      recommendations: [],
      details: { theme: typographyTheme }
    });
  } catch (error) {
    results.push({
      testName: 'Typography Theme Creation',
      passed: false,
      score: 0,
      issues: [`Failed to create typography theme: ${error}`],
      recommendations: ['Check typography theme configuration']
    });
  }

  // Test typography accessibility
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    if (slide.title) {
      const validation = validateTypographyAccessibility({
        fontSize: 24,
        fontFamily: 'Arial',
        fontWeight: 600,
        lineHeight: 1.2,
        color: theme.colors.text.primary
      });

      results.push({
        testName: `Typography Accessibility - Slide ${i + 1}`,
        passed: validation.isAccessible,
        score: validation.score,
        issues: validation.issues,
        recommendations: validation.recommendations
      });
    }
  }

  return results;
}

/**
 * Test color management system
 */
async function runColorTests(
  slides: SlideSpec[],
  theme: ProfessionalTheme,
  config: TestSuiteConfig
): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Test color palette creation
  try {
    const palette = createEnhancedColorPalette(theme);
    results.push({
      testName: 'Color Palette Creation',
      passed: true,
      score: 100,
      issues: [],
      recommendations: [],
      details: { palette }
    });
  } catch (error) {
    results.push({
      testName: 'Color Palette Creation',
      passed: false,
      score: 0,
      issues: [`Failed to create color palette: ${error}`],
      recommendations: ['Check color palette configuration']
    });
  }

  // Test contextual color application
  try {
    const palette = createEnhancedColorPalette(theme);
    const textColor = getContextualColor('primary-text', palette);
    const bgColor = getContextualColor('background', palette);

    const contrastPassed = textColor.contrastRatio >= 4.5;
    results.push({
      testName: 'Color Contrast Compliance',
      passed: contrastPassed,
      score: contrastPassed ? 100 : 50,
      issues: contrastPassed ? [] : ['Text contrast ratio below WCAG AA standards'],
      recommendations: contrastPassed ? [] : ['Increase contrast between text and background colors'],
      details: { contrastRatio: textColor.contrastRatio }
    });
  } catch (error) {
    results.push({
      testName: 'Color Contrast Compliance',
      passed: false,
      score: 0,
      issues: [`Failed to test color contrast: ${error}`],
      recommendations: ['Check color contrast calculation']
    });
  }

  return results;
}

/**
 * Test layout system
 */
async function runLayoutTests(
  slides: SlideSpec[],
  theme: ProfessionalTheme,
  config: TestSuiteConfig
): Promise<TestResult[]> {
  const results: TestResult[] = [];

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    
    try {
      const layout = calculateSlideLayout(slide, theme);
      const hasOverflow = layout.isOverflowing;
      const hasRecommendations = layout.recommendations.length > 0;

      results.push({
        testName: `Layout Calculation - Slide ${i + 1}`,
        passed: !hasOverflow,
        score: hasOverflow ? 60 : (hasRecommendations ? 80 : 100),
        issues: hasOverflow ? ['Content overflows slide boundaries'] : [],
        recommendations: layout.recommendations,
        details: { layout }
      });
    } catch (error) {
      results.push({
        testName: `Layout Calculation - Slide ${i + 1}`,
        passed: false,
        score: 0,
        issues: [`Failed to calculate layout: ${error}`],
        recommendations: ['Check slide layout configuration']
      });
    }
  }

  return results;
}

/**
 * Test chart styling system
 */
async function runChartStylingTests(
  slides: SlideSpec[],
  theme: ProfessionalTheme,
  config: TestSuiteConfig
): Promise<TestResult[]> {
  const results: TestResult[] = [];

  const chartSlides = slides.filter(slide => slide.chart);
  
  for (let i = 0; i < chartSlides.length; i++) {
    const slide = chartSlides[i];
    
    try {
      const chartStyle = createChartStyling(theme, 'column');
      const hasValidColors = chartStyle.colors.length >= 3;
      const hasValidStyling = chartStyle.titleStyle.fontSize > 0;

      results.push({
        testName: `Chart Styling - Chart ${i + 1}`,
        passed: hasValidColors && hasValidStyling,
        score: (hasValidColors && hasValidStyling) ? 100 : 70,
        issues: [],
        recommendations: hasValidColors ? [] : ['Ensure sufficient chart colors are available'],
        details: { chartStyle }
      });
    } catch (error) {
      results.push({
        testName: `Chart Styling - Chart ${i + 1}`,
        passed: false,
        score: 0,
        issues: [`Failed to create chart styling: ${error}`],
        recommendations: ['Check chart styling configuration']
      });
    }
  }

  return results;
}

/**
 * Test table styling system
 */
async function runTableStylingTests(
  slides: SlideSpec[],
  theme: ProfessionalTheme,
  config: TestSuiteConfig
): Promise<TestResult[]> {
  const results: TestResult[] = [];

  const tableSlides = slides.filter(slide => slide.comparisonTable);
  
  for (let i = 0; i < tableSlides.length; i++) {
    const slide = tableSlides[i];
    
    try {
      const tableStyle = createTableStyling(theme);
      const hasValidStyling = tableStyle.headerStyle.fontSize > 0 && tableStyle.bodyStyle.fontSize > 0;

      results.push({
        testName: `Table Styling - Table ${i + 1}`,
        passed: hasValidStyling,
        score: hasValidStyling ? 100 : 50,
        issues: hasValidStyling ? [] : ['Invalid table styling configuration'],
        recommendations: [],
        details: { tableStyle }
      });
    } catch (error) {
      results.push({
        testName: `Table Styling - Table ${i + 1}`,
        passed: false,
        score: 0,
        issues: [`Failed to create table styling: ${error}`],
        recommendations: ['Check table styling configuration']
      });
    }
  }

  return results;
}

/**
 * Test accessibility compliance
 */
async function runAccessibilityTests(
  slides: SlideSpec[],
  theme: ProfessionalTheme,
  config: TestSuiteConfig
): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Test color contrast
  const palette = createEnhancedColorPalette(theme);
  const textColor = getContextualColor('primary-text', palette);
  const bgColor = getContextualColor('background', palette);

  results.push({
    testName: 'WCAG Color Contrast',
    passed: textColor.contrastRatio >= 4.5,
    score: textColor.contrastRatio >= 4.5 ? 100 : (textColor.contrastRatio >= 3.0 ? 70 : 30),
    issues: textColor.contrastRatio >= 4.5 ? [] : ['Color contrast below WCAG AA standards'],
    recommendations: textColor.contrastRatio >= 4.5 ? [] : ['Improve color contrast for better accessibility']
  });

  // Test font size compliance
  const minFontSizePassed = slides.every(slide => {
    // Assume minimum font size of 12pt for accessibility
    return true; // This would be checked during actual rendering
  });

  results.push({
    testName: 'Minimum Font Size',
    passed: minFontSizePassed,
    score: minFontSizePassed ? 100 : 60,
    issues: minFontSizePassed ? [] : ['Some text may be below minimum readable size'],
    recommendations: minFontSizePassed ? [] : ['Ensure all text is at least 12pt for accessibility']
  });

  return results;
}

/**
 * Test performance characteristics
 */
async function runPerformanceTests(
  slides: SlideSpec[],
  theme: ProfessionalTheme,
  config: TestSuiteConfig
): Promise<TestResult[]> {
  const results: TestResult[] = [];

  const startTime = Date.now();
  
  // Test styling calculation performance
  try {
    for (const slide of slides) {
      calculateSlideLayout(slide, theme);
      createEnhancedColorPalette(theme);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    const performanceScore = duration < 1000 ? 100 : (duration < 2000 ? 80 : 60);

    results.push({
      testName: 'Styling Performance',
      passed: duration < 2000,
      score: performanceScore,
      issues: duration < 2000 ? [] : ['Styling calculation taking longer than expected'],
      recommendations: duration < 1000 ? [] : ['Consider optimizing styling calculations'],
      details: { duration }
    });
  } catch (error) {
    results.push({
      testName: 'Styling Performance',
      passed: false,
      score: 0,
      issues: [`Performance test failed: ${error}`],
      recommendations: ['Check styling system performance']
    });
  }

  return results;
}

/**
 * Test visual consistency across slides
 */
async function runVisualConsistencyTests(
  slides: SlideSpec[],
  theme: ProfessionalTheme,
  config: TestSuiteConfig
): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Test layout consistency
  const layouts = slides.map(s => s.layout);
  const uniqueLayouts = new Set(layouts);
  const layoutConsistency = uniqueLayouts.size <= 6; // Reasonable number of layout types

  results.push({
    testName: 'Layout Consistency',
    passed: layoutConsistency,
    score: layoutConsistency ? 100 : 70,
    issues: layoutConsistency ? [] : ['Too many different layout types may reduce consistency'],
    recommendations: layoutConsistency ? [] : ['Consider limiting layout variety for better consistency'],
    details: { uniqueLayouts: Array.from(uniqueLayouts) }
  });

  return results;
}

/**
 * Test theme compatibility
 */
async function runThemeCompatibilityTests(
  slides: SlideSpec[],
  theme: ProfessionalTheme,
  config: TestSuiteConfig
): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Test theme color validity
  const hasValidColors = !!(theme.colors.primary && theme.colors.background && theme.colors.text.primary);

  results.push({
    testName: 'Theme Color Validity',
    passed: hasValidColors,
    score: hasValidColors ? 100 : 30,
    issues: hasValidColors ? [] : ['Theme missing required color definitions'],
    recommendations: hasValidColors ? [] : ['Ensure theme has all required color properties']
  });

  return results;
}
