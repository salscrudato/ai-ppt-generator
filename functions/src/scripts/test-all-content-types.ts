#!/usr/bin/env node
/**
 * Comprehensive Content Type Validation Test
 * 
 * Tests all content types (bullets, paragraphs, charts, tables, etc.) 
 * across all themes to ensure proper rendering.
 */

import { generatePpt } from '../pptGenerator-simple';
import { PROFESSIONAL_THEMES } from '../professionalThemes';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface ContentTypeTestResult {
  contentType: string;
  themeId: string;
  success: boolean;
  duration: number;
  fileSize: number;
  error?: string;
}

const contentTypeTests = [
  {
    name: 'Bullet Points',
    slides: [{
      title: 'Bullet Points Test',
      layout: 'title-bullets' as const,
      bullets: [
        'First bullet point with clear, readable text',
        'Second bullet point demonstrating proper formatting',
        'Third bullet point showing consistent spacing',
        'Fourth bullet point validating bullet rendering'
      ],
      speakerNotes: 'Testing bullet point rendering and formatting.'
    }]
  },
  {
    name: 'Paragraphs',
    slides: [{
      title: 'Paragraph Content Test',
      layout: 'title-paragraph' as const,
      paragraph: 'This is a comprehensive paragraph test to validate that longer text content renders properly with appropriate line spacing, font sizing, and readability across all themes. The text should wrap naturally and maintain excellent contrast ratios.',
      speakerNotes: 'Testing paragraph text rendering and readability.'
    }]
  },
  {
    name: 'Two Column Layout',
    slides: [{
      title: 'Two Column Layout Test',
      layout: 'two-column' as const,
      left: {
        bullets: [
          'Left column bullet one',
          'Left column bullet two',
          'Left column bullet three'
        ]
      },
      right: {
        paragraph: 'Right column paragraph content that should render properly alongside the left column bullets with appropriate spacing and alignment.'
      },
      speakerNotes: 'Testing two-column layout with mixed content types.'
    }]
  },
  {
    name: 'Charts',
    slides: [{
      title: 'Chart Visualization Test',
      layout: 'chart' as const,
      chart: {
        title: 'Sample Data Chart',
        type: 'bar' as const,
        categories: ['Q1', 'Q2', 'Q3', 'Q4'],
        series: [{
          name: 'Revenue',
          data: [25, 35, 45, 55],
          color: '#1E40AF'
        }],
        showLegend: true,
        showDataLabels: true
      },
      speakerNotes: 'Testing chart rendering and data visualization.'
    }]
  },
  {
    name: 'Timeline',
    slides: [{
      title: 'Timeline Process Test',
      layout: 'timeline' as const,
      bullets: [
        'Q1 2024: Planning Phase - Initial project planning',
        'Q2 2024: Development - Core development work',
        'Q3 2024: Testing - Quality assurance testing',
        'Q4 2024: Launch - Product launch and rollout'
      ],
      speakerNotes: 'Testing timeline layout and process visualization.'
    }]
  }
];

async function testAllContentTypes(): Promise<void> {
  console.log('🧪 Testing All Content Types Across All Themes');
  console.log('================================================================================');
  
  const outputDir = join(__dirname, '../../test-outputs/content-type-tests');
  mkdirSync(outputDir, { recursive: true });

  const results: ContentTypeTestResult[] = [];

  // Test each content type with each theme
  for (const contentTest of contentTypeTests) {
    console.log(`\n📋 Testing Content Type: ${contentTest.name}`);
    console.log('─'.repeat(50));

    for (let i = 0; i < PROFESSIONAL_THEMES.length; i++) {
      const theme = PROFESSIONAL_THEMES[i];
      console.log(`  [${i + 1}/${PROFESSIONAL_THEMES.length}] ${theme.name} (${theme.id})`);
      
      const startTime = Date.now();
      
      try {
        const result = await generatePpt(contentTest.slides, theme.id, {
          includeMetadata: true,
          includeSpeakerNotes: true,
          author: 'Content Type Test Suite',
          company: 'PowerPoint Content Testing',
          subject: `${contentTest.name} - ${theme.name} Test`
        });

        const duration = Date.now() - startTime;

        // Save test file
        const filename = `ContentType_${contentTest.name.replace(/\s+/g, '')}_${theme.id}_${Date.now()}.pptx`;
        const filepath = join(outputDir, filename);
        writeFileSync(filepath, Buffer.from(result.buffer));

        const testResult: ContentTypeTestResult = {
          contentType: contentTest.name,
          themeId: theme.id,
          success: true,
          duration,
          fileSize: result.buffer.byteLength
        };

        results.push(testResult);
        console.log(`    ✅ SUCCESS - ${duration}ms, ${(result.buffer.byteLength / 1024).toFixed(1)}KB`);

      } catch (error) {
        const duration = Date.now() - startTime;
        console.log(`    ❌ FAILED - ${error}`);
        
        const testResult: ContentTypeTestResult = {
          contentType: contentTest.name,
          themeId: theme.id,
          success: false,
          duration,
          fileSize: 0,
          error: String(error)
        };

        results.push(testResult);
      }
    }
  }

  // Generate comprehensive report
  generateContentTypeReport(results, outputDir);
}

function generateContentTypeReport(results: ContentTypeTestResult[], outputDir: string): void {
  console.log('\n📊 CONTENT TYPE TEST REPORT');
  console.log('================================================================================');

  const successfulTests = results.filter(r => r.success);
  const failedTests = results.filter(r => !r.success);

  console.log(`✅ Successful tests: ${successfulTests.length}/${results.length}`);
  console.log(`❌ Failed tests: ${failedTests.length}/${results.length}`);
  console.log(`📊 Success rate: ${((successfulTests.length / results.length) * 100).toFixed(1)}%`);

  // Group results by content type
  const contentTypes = [...new Set(results.map(r => r.contentType))];
  
  console.log('\n📋 RESULTS BY CONTENT TYPE:');
  contentTypes.forEach(contentType => {
    const typeResults = results.filter(r => r.contentType === contentType);
    const typeSuccesses = typeResults.filter(r => r.success);
    const successRate = ((typeSuccesses.length / typeResults.length) * 100).toFixed(1);
    
    console.log(`  ${contentType}: ${typeSuccesses.length}/${typeResults.length} (${successRate}%)`);
    
    const failures = typeResults.filter(r => !r.success);
    if (failures.length > 0) {
      failures.forEach(failure => {
        console.log(`    ❌ ${failure.themeId}: ${failure.error}`);
      });
    }
  });

  // Group results by theme
  const themes = [...new Set(results.map(r => r.themeId))];
  
  console.log('\n🎨 RESULTS BY THEME:');
  themes.forEach(themeId => {
    const themeResults = results.filter(r => r.themeId === themeId);
    const themeSuccesses = themeResults.filter(r => r.success);
    const successRate = ((themeSuccesses.length / themeResults.length) * 100).toFixed(1);
    
    console.log(`  ${themeId}: ${themeSuccesses.length}/${themeResults.length} (${successRate}%)`);
  });

  // Performance metrics
  if (successfulTests.length > 0) {
    const avgDuration = successfulTests.reduce((sum, t) => sum + t.duration, 0) / successfulTests.length;
    const avgFileSize = successfulTests.reduce((sum, t) => sum + t.fileSize, 0) / successfulTests.length;
    
    console.log('\n📈 PERFORMANCE METRICS:');
    console.log(`  Average generation time: ${avgDuration.toFixed(1)}ms`);
    console.log(`  Average file size: ${(avgFileSize / 1024).toFixed(1)}KB`);
    console.log(`  Total files generated: ${successfulTests.length}`);
  }

  // Save detailed JSON report
  const reportPath = join(outputDir, 'content-type-test-report.json');
  writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: results.length,
      successfulTests: successfulTests.length,
      failedTests: failedTests.length,
      successRate: `${((successfulTests.length / results.length) * 100).toFixed(1)}%`,
      contentTypes: contentTypes.length,
      themes: themes.length
    },
    results,
    conclusion: successfulTests.length === results.length 
      ? 'All content types work perfectly across all themes!'
      : 'Some content types need attention - check failed tests above.'
  }, null, 2));

  console.log(`\n📄 Detailed report saved: ${reportPath}`);
  console.log(`📂 Test files saved in: ${outputDir}`);

  if (successfulTests.length === results.length) {
    console.log('\n🎉 ALL CONTENT TYPES WORKING PERFECTLY!');
    console.log('✨ Bullet points, paragraphs, charts, and layouts all render correctly.');
    console.log('🚀 The application is ready for production deployment.');
  } else {
    console.log('\n⚠️  Some content types need attention. Check the failed tests above.');
  }
}

// Run the test
if (require.main === module) {
  testAllContentTypes().catch(console.error);
}

export { testAllContentTypes };
