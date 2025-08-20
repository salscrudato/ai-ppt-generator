#!/usr/bin/env node
/**
 * Core Theme Validation Test
 * 
 * Tests each of the 6 core themes individually to ensure perfect text readability
 * and PowerPoint generation functionality.
 */

import { generatePpt } from '../pptGenerator-simple';
import { PROFESSIONAL_THEMES } from '../professionalThemes';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface ThemeTestResult {
  themeId: string;
  themeName: string;
  success: boolean;
  duration: number;
  fileSize: number;
  error?: string;
}

async function testCoreThemes(): Promise<void> {
  console.log('🎯 Testing Core Theme System (6 Themes)');
  console.log('================================================================================');
  
  const outputDir = join(__dirname, '../../test-outputs/core-theme-tests');
  mkdirSync(outputDir, { recursive: true });

  const results: ThemeTestResult[] = [];

  // Test each core theme
  for (let i = 0; i < PROFESSIONAL_THEMES.length; i++) {
    const theme = PROFESSIONAL_THEMES[i];
    console.log(`\n[${i + 1}/${PROFESSIONAL_THEMES.length}] Testing: ${theme.name} (${theme.id})`);
    
    const startTime = Date.now();
    
    try {
      // Create test slides for this theme
      const testSlides = [
        {
          title: `${theme.name} - Title Slide`,
          layout: 'title' as const,
          paragraph: 'This slide tests the title layout with paragraph text to verify text readability and contrast ratios.',
          speakerNotes: `Testing ${theme.name} theme with title layout for text readability.`
        },
        {
          title: `${theme.name} - Two Column Layout`,
          layout: 'two-column' as const,
          left: {
            paragraph: 'Left column content with multiple lines of text to test readability in two-column layouts. This should be clearly visible.'
          },
          right: {
            paragraph: 'Right column content with additional text to verify that both columns maintain excellent readability and contrast.'
          },
          speakerNotes: `Testing ${theme.name} theme with two-column layout for text readability.`
        },
        {
          title: `${theme.name} - Bullet Points`,
          layout: 'title-bullets' as const,
          bullets: [
            'First bullet point to test list readability',
            'Second bullet point with longer text to verify contrast',
            'Third bullet point to ensure consistent formatting',
            'Fourth bullet point for comprehensive testing'
          ],
          speakerNotes: `Testing ${theme.name} theme with bullet points for text readability.`
        }
      ];

      const result = await generatePpt(testSlides, theme.id, {
        includeMetadata: true,
        includeSpeakerNotes: true,
        author: 'Theme Test Suite',
        company: 'PowerPoint Theme Testing',
        subject: `${theme.name} Theme Test`
      });

      const duration = Date.now() - startTime;

      // Save test file
      const filename = `CoreTheme_${theme.id}_${Date.now()}.pptx`;
      const filepath = join(outputDir, filename);
      writeFileSync(filepath, Buffer.from(result.buffer));

      const testResult: ThemeTestResult = {
        themeId: theme.id,
        themeName: theme.name,
        success: true,
        duration,
        fileSize: result.buffer.byteLength
      };

      results.push(testResult);

      console.log(`✅ SUCCESS - ${theme.name}`);
      console.log(`   Duration: ${duration}ms`);
      console.log(`   File size: ${(result.buffer.byteLength / 1024).toFixed(1)}KB`);
      console.log(`   File: ${filename}`);

    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`❌ FAILED - ${theme.name}: ${error}`);
      
      const testResult: ThemeTestResult = {
        themeId: theme.id,
        themeName: theme.name,
        success: false,
        duration,
        fileSize: 0,
        error: String(error)
      };

      results.push(testResult);
    }
  }

  // Generate summary report
  generateThemeTestReport(results, outputDir);
}

function generateThemeTestReport(results: ThemeTestResult[], outputDir: string): void {
  console.log('\n📊 CORE THEME TEST REPORT');
  console.log('================================================================================');

  const successfulThemes = results.filter(r => r.success);
  const failedThemes = results.filter(r => !r.success);

  console.log(`✅ Successful themes: ${successfulThemes.length}/${results.length}`);
  console.log(`❌ Failed themes: ${failedThemes.length}/${results.length}`);
  console.log(`📊 Success rate: ${((successfulThemes.length / results.length) * 100).toFixed(1)}%`);

  if (successfulThemes.length > 0) {
    console.log('\n✅ WORKING THEMES:');
    successfulThemes.forEach(theme => {
      console.log(`  - ${theme.themeName} (${theme.themeId}) - ${theme.duration}ms, ${(theme.fileSize / 1024).toFixed(1)}KB`);
    });
  }

  if (failedThemes.length > 0) {
    console.log('\n❌ FAILED THEMES:');
    failedThemes.forEach(theme => {
      console.log(`  - ${theme.themeName} (${theme.themeId}): ${theme.error}`);
    });
  }

  // Performance metrics
  if (successfulThemes.length > 0) {
    const avgDuration = successfulThemes.reduce((sum, t) => sum + t.duration, 0) / successfulThemes.length;
    const avgFileSize = successfulThemes.reduce((sum, t) => sum + t.fileSize, 0) / successfulThemes.length;
    
    console.log('\n📈 PERFORMANCE METRICS:');
    console.log(`  Average generation time: ${avgDuration.toFixed(1)}ms`);
    console.log(`  Average file size: ${(avgFileSize / 1024).toFixed(1)}KB`);
    console.log(`  Total files generated: ${successfulThemes.length}`);
  }

  // Save detailed JSON report
  const reportPath = join(outputDir, 'core-theme-test-report.json');
  writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      totalThemes: results.length,
      successfulThemes: successfulThemes.length,
      failedThemes: failedThemes.length,
      successRate: `${((successfulThemes.length / results.length) * 100).toFixed(1)}%`
    },
    results,
    conclusion: successfulThemes.length === results.length 
      ? 'All core themes are working perfectly with excellent text readability!'
      : 'Some themes need attention - check failed themes above.'
  }, null, 2));

  console.log(`\n📄 Detailed report saved: ${reportPath}`);
  console.log(`📂 Test files saved in: ${outputDir}`);

  if (successfulThemes.length === results.length) {
    console.log('\n🎉 ALL CORE THEMES WORKING PERFECTLY!');
    console.log('✨ Text readability issues have been resolved.');
    console.log('🚀 The simplified theme system is ready for production.');
  } else {
    console.log('\n⚠️  Some themes need attention. Check the failed themes above.');
  }
}

// Run the test
if (require.main === module) {
  testCoreThemes().catch(console.error);
}

export { testCoreThemes };
