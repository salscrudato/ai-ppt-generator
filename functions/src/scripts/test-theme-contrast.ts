#!/usr/bin/env node
/**
 * Theme Contrast Analysis Script
 * 
 * Analyzes text contrast ratios for all themes and identifies readability issues
 */

import { PROFESSIONAL_THEMES, contrastRatio } from '../professionalThemes';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface ContrastAnalysis {
  themeId: string;
  themeName: string;
  category: string;
  contrastRatios: {
    primaryTextOnBackground: number;
    secondaryTextOnBackground: number;
    inverseTextOnPrimary: number;
    textOnSurface: number;
  };
  wcagCompliance: {
    primaryText: 'AAA' | 'AA' | 'FAIL';
    secondaryText: 'AAA' | 'AA' | 'FAIL';
    inverseText: 'AAA' | 'AA' | 'FAIL';
    surfaceText: 'AAA' | 'AA' | 'FAIL';
  };
  issues: string[];
  recommendations: string[];
  overallGrade: 'EXCELLENT' | 'GOOD' | 'POOR' | 'FAIL';
}

function getWCAGLevel(ratio: number): 'AAA' | 'AA' | 'FAIL' {
  if (ratio >= 7.0) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  return 'FAIL';
}

function analyzeThemeContrast(theme: any): ContrastAnalysis {
  const contrastRatios = {
    primaryTextOnBackground: contrastRatio(theme.colors.text.primary, theme.colors.background),
    secondaryTextOnBackground: contrastRatio(theme.colors.text.secondary, theme.colors.background),
    inverseTextOnPrimary: contrastRatio(theme.colors.text.inverse, theme.colors.primary),
    textOnSurface: contrastRatio(theme.colors.text.primary, theme.colors.surface)
  };

  const wcagCompliance = {
    primaryText: getWCAGLevel(contrastRatios.primaryTextOnBackground),
    secondaryText: getWCAGLevel(contrastRatios.secondaryTextOnBackground),
    inverseText: getWCAGLevel(contrastRatios.inverseTextOnPrimary),
    surfaceText: getWCAGLevel(contrastRatios.textOnSurface)
  };

  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check for issues and provide recommendations
  if (wcagCompliance.primaryText === 'FAIL') {
    issues.push(`Primary text contrast too low: ${contrastRatios.primaryTextOnBackground.toFixed(2)}:1`);
    recommendations.push('Darken primary text color or lighten background');
  }

  if (wcagCompliance.secondaryText === 'FAIL') {
    issues.push(`Secondary text contrast too low: ${contrastRatios.secondaryTextOnBackground.toFixed(2)}:1`);
    recommendations.push('Darken secondary text color for better readability');
  }

  if (wcagCompliance.inverseText === 'FAIL') {
    issues.push(`Inverse text on primary color contrast too low: ${contrastRatios.inverseTextOnPrimary.toFixed(2)}:1`);
    recommendations.push('Darken primary color or use darker inverse text');
  }

  if (wcagCompliance.surfaceText === 'FAIL') {
    issues.push(`Text on surface contrast too low: ${contrastRatios.textOnSurface.toFixed(2)}:1`);
    recommendations.push('Improve contrast between text and surface colors');
  }

  // Determine overall grade
  const failCount = Object.values(wcagCompliance).filter(level => level === 'FAIL').length;
  const aaCount = Object.values(wcagCompliance).filter(level => level === 'AA').length;
  const aaaCount = Object.values(wcagCompliance).filter(level => level === 'AAA').length;

  let overallGrade: 'EXCELLENT' | 'GOOD' | 'POOR' | 'FAIL';
  if (failCount > 0) {
    overallGrade = 'FAIL';
  } else if (aaaCount >= 3) {
    overallGrade = 'EXCELLENT';
  } else if (aaCount >= 3) {
    overallGrade = 'GOOD';
  } else {
    overallGrade = 'POOR';
  }

  return {
    themeId: theme.id,
    themeName: theme.name,
    category: theme.category,
    contrastRatios,
    wcagCompliance,
    issues,
    recommendations,
    overallGrade
  };
}

async function runContrastAnalysis(): Promise<void> {
  console.log('🔍 Starting Theme Contrast Analysis');
  console.log('================================================================================');
  
  const outputDir = join(__dirname, '../../test-outputs/theme-contrast-analysis');
  mkdirSync(outputDir, { recursive: true });

  const analyses: ContrastAnalysis[] = [];

  // Analyze each theme
  for (let i = 0; i < PROFESSIONAL_THEMES.length; i++) {
    const theme = PROFESSIONAL_THEMES[i];
    console.log(`\n[${i + 1}/${PROFESSIONAL_THEMES.length}] Analyzing: ${theme.name} (${theme.id})`);
    
    const analysis = analyzeThemeContrast(theme);
    analyses.push(analysis);

    // Log results
    const gradeEmoji = {
      'EXCELLENT': '🟢',
      'GOOD': '🟡', 
      'POOR': '🟠',
      'FAIL': '🔴'
    }[analysis.overallGrade];

    console.log(`${gradeEmoji} ${analysis.overallGrade} - ${theme.name}`);
    console.log(`  Primary text: ${analysis.contrastRatios.primaryTextOnBackground.toFixed(2)}:1 (${analysis.wcagCompliance.primaryText})`);
    console.log(`  Secondary text: ${analysis.contrastRatios.secondaryTextOnBackground.toFixed(2)}:1 (${analysis.wcagCompliance.secondaryText})`);
    console.log(`  Inverse text: ${analysis.contrastRatios.inverseTextOnPrimary.toFixed(2)}:1 (${analysis.wcagCompliance.inverseText})`);
    console.log(`  Surface text: ${analysis.contrastRatios.textOnSurface.toFixed(2)}:1 (${analysis.wcagCompliance.surfaceText})`);
    
    if (analysis.issues.length > 0) {
      console.log(`  Issues: ${analysis.issues.length}`);
      analysis.issues.forEach(issue => console.log(`    - ${issue}`));
    }
  }

  // Generate summary report
  generateContrastReport(analyses, outputDir);
}

function generateContrastReport(analyses: ContrastAnalysis[], outputDir: string): void {
  console.log('\n📊 THEME CONTRAST ANALYSIS REPORT');
  console.log('================================================================================');

  const excellentThemes = analyses.filter(a => a.overallGrade === 'EXCELLENT');
  const goodThemes = analyses.filter(a => a.overallGrade === 'GOOD');
  const poorThemes = analyses.filter(a => a.overallGrade === 'POOR');
  const failedThemes = analyses.filter(a => a.overallGrade === 'FAIL');

  console.log(`🟢 Excellent themes (AAA compliance): ${excellentThemes.length}/${analyses.length}`);
  console.log(`🟡 Good themes (AA compliance): ${goodThemes.length}/${analyses.length}`);
  console.log(`🟠 Poor themes (mixed compliance): ${poorThemes.length}/${analyses.length}`);
  console.log(`🔴 Failed themes (accessibility issues): ${failedThemes.length}/${analyses.length}`);

  // Recommended core themes (Excellent + Good)
  const recommendedThemes = [...excellentThemes, ...goodThemes];
  console.log(`\n✅ RECOMMENDED CORE THEMES (${recommendedThemes.length} themes):`);
  recommendedThemes.forEach(theme => {
    console.log(`  - ${theme.themeName} (${theme.themeId}) - ${theme.overallGrade} - ${theme.category}`);
  });

  // Themes needing fixes
  const themesNeedingFixes = [...poorThemes, ...failedThemes];
  if (themesNeedingFixes.length > 0) {
    console.log(`\n⚠️  THEMES NEEDING IMPROVEMENT (${themesNeedingFixes.length} themes):`);
    themesNeedingFixes.forEach(theme => {
      console.log(`  - ${theme.themeName} (${theme.themeId}) - ${theme.overallGrade}:`);
      theme.issues.forEach(issue => console.log(`    • ${issue}`));
    });
  }

  // Save detailed JSON report
  const reportPath = join(outputDir, 'theme-contrast-analysis.json');
  writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      totalThemes: analyses.length,
      excellentThemes: excellentThemes.length,
      goodThemes: goodThemes.length,
      poorThemes: poorThemes.length,
      failedThemes: failedThemes.length,
      recommendedCoreThemes: recommendedThemes.length,
      accessibilityScore: `${(((excellentThemes.length + goodThemes.length) / analyses.length) * 100).toFixed(1)}%`
    },
    recommendations: {
      coreThemes: recommendedThemes.map(t => ({
        id: t.themeId,
        name: t.themeName,
        grade: t.overallGrade,
        category: t.category
      })),
      themesToFix: themesNeedingFixes.map(t => ({
        id: t.themeId,
        name: t.themeName,
        grade: t.overallGrade,
        issues: t.issues,
        recommendations: t.recommendations
      }))
    },
    detailedAnalysis: analyses
  }, null, 2));

  console.log(`\n📄 Detailed report saved: ${reportPath}`);
  
  // Generate simplified theme recommendations
  console.log('\n🎯 SIMPLIFIED THEME SYSTEM RECOMMENDATION:');
  console.log('================================================================================');
  console.log('Based on contrast analysis, recommend keeping these core themes:');
  
  const coreThemeIds = recommendedThemes.slice(0, 6).map(t => t.themeId);
  coreThemeIds.forEach((id, index) => {
    const theme = recommendedThemes.find(t => t.themeId === id);
    console.log(`${index + 1}. ${theme?.themeName} (${id}) - ${theme?.overallGrade}`);
  });
  
  console.log(`\nThis reduces the theme count from ${analyses.length} to ${coreThemeIds.length} themes.`);
  console.log('All recommended themes have excellent text readability and WCAG compliance.');
}

// Run the analysis
if (require.main === module) {
  runContrastAnalysis().catch(console.error);
}

export { runContrastAnalysis };
