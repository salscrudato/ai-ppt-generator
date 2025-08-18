#!/usr/bin/env node

/**
 * Isolate Content Type Issues
 * Tests each layout type individually to find which causes corruption
 */

import { powerPointService } from '../services/powerPointService';
import { getThemeById } from '../professionalThemes';
import * as fs from 'fs';
import * as path from 'path';

const outputDir = './content-type-isolation-output';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

interface TestCase {
  name: string;
  spec: any;
}

const testCases: TestCase[] = [
  // Test 1: Title only
  {
    name: 'layout-title-only',
    spec: [{
      title: 'Test Title',
      layout: 'title'
    }]
  },

  // Test 2: Title with bullets
  {
    name: 'layout-title-bullets',
    spec: [{
      title: 'Test Title',
      layout: 'title-bullets',
      bullets: ['Bullet 1', 'Bullet 2', 'Bullet 3']
    }]
  },

  // Test 3: Title with paragraph
  {
    name: 'layout-title-paragraph',
    spec: [{
      title: 'Test Title',
      layout: 'title-paragraph',
      paragraph: 'This is a test paragraph with some content.'
    }]
  },

  // Test 4: Two column layout
  {
    name: 'layout-two-column',
    spec: [{
      title: 'Test Title',
      layout: 'two-column',
      left: {
        title: 'Left Column',
        bullets: ['Left bullet 1', 'Left bullet 2']
      },
      right: {
        title: 'Right Column',
        bullets: ['Right bullet 1', 'Right bullet 2']
      }
    }]
  },

  // Test 5: Comparison table (this might be the issue)
  {
    name: 'layout-comparison-table',
    spec: [{
      title: 'Test Table',
      layout: 'comparison-table',
      comparisonTable: {
        headers: ['Metric', 'Q3', 'Q4', 'Growth'],
        rows: [
          ['Revenue', '$2.5M', '$3.2M', '+28%'],
          ['Customers', '1,200', '1,800', '+50%']
        ]
      }
    }]
  },

  // Test 6: Chart layout
  {
    name: 'layout-chart',
    spec: [{
      title: 'Test Chart',
      layout: 'chart',
      chart: {
        type: 'bar',
        title: 'Test Chart',
        categories: ['Q1', 'Q2', 'Q3', 'Q4'],
        series: [
          {
            name: 'Revenue',
            data: [2.1, 2.3, 2.5, 3.2]
          }
        ]
      }
    }]
  },

  // Test 7: Quote layout
  {
    name: 'layout-quote',
    spec: [{
      title: 'Test Quote',
      layout: 'quote',
      quote: 'This is a test quote.',
      author: 'Test Author'
    }]
  },

  // Test 8: Image layouts
  {
    name: 'layout-image-right',
    spec: [{
      title: 'Test Image',
      layout: 'image-right',
      paragraph: 'This slide has an image on the right.',
      imageUrl: 'https://via.placeholder.com/400x300'
    }]
  },

  // Test 9: Multiple slides (combination that was failing)
  {
    name: 'multi-slide-failing-combo',
    spec: [
      {
        title: 'Title Slide',
        layout: 'title'
      },
      {
        title: 'Bullets Slide',
        layout: 'title-bullets',
        bullets: ['Bullet 1', 'Bullet 2']
      },
      {
        title: 'Table Slide',
        layout: 'comparison-table',
        comparisonTable: {
          headers: ['Metric', 'Q3', 'Q4', 'Growth'],
          rows: [
            ['Revenue', '$2.5M', '$3.2M', '+28%'],
            ['Customers', '1,200', '1,800', '+50%']
          ]
        }
      }
    ]
  },

  // Test 10: Exact failing content from real-world test
  {
    name: 'exact-failing-content',
    spec: [
      {
        title: 'Financial Performance Analysis',
        layout: 'title'
      },
      {
        title: 'Executive Summary',
        layout: 'title-bullets',
        bullets: [
          'Strong Q4 performance with 28% revenue growth',
          'Customer base expanded by 50% year-over-year',
          'Market position strengthened through strategic initiatives'
        ]
      },
      {
        title: 'Financial Performance Metrics',
        layout: 'comparison-table',
        comparisonTable: {
          headers: ['Metric', 'Q3 2023', 'Q4 2023', 'Growth %'],
          rows: [
            ['Total Revenue', '$2.5M', '$3.2M', '+28%'],
            ['Gross Profit', '$1.0M', '$1.4M', '+40%'],
            ['Customer LTV', '$1,250', '$1,450', '+16%'],
            ['CAC Ratio', '3.2:1', '4.1:1', '+28%']
          ]
        }
      }
    ]
  }
];

async function runContentTypeTests() {
  console.log('🔍 Content Type Issue Isolation');
  console.log('===============================\n');

  const results: Array<{
    name: string;
    success: boolean;
    error?: string;
    fileSize?: number;
    duration?: number;
  }> = [];

  for (const testCase of testCases) {
    const startTime = Date.now();
    
    try {
      console.log(`🧪 Testing: ${testCase.name}`);
      
      const theme = getThemeById('corporate-blue');
      const result = await powerPointService.generatePresentation(
        testCase.spec,
        { theme }
      );

      const filePath = path.join(outputDir, `${testCase.name}.pptx`);
      fs.writeFileSync(filePath, result.buffer);
      
      const fileSize = fs.statSync(filePath).size;
      const duration = Date.now() - startTime;
      
      console.log(`  ✅ Generated: ${fileSize} bytes (${duration}ms)`);
      
      results.push({
        name: testCase.name,
        success: true,
        fileSize,
        duration
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`  ❌ Failed: ${errorMessage} (${duration}ms)`);
      
      results.push({
        name: testCase.name,
        success: false,
        error: errorMessage,
        duration
      });
    }
  }

  // Summary
  console.log('\n📊 Content Type Test Results:');
  console.log('==============================');
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`Total Tests: ${results.length}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log(`Success Rate: ${Math.round((passed / results.length) * 100)}%\n`);

  results.forEach(result => {
    if (result.success) {
      console.log(`✅ ${result.name} (${result.fileSize} bytes, ${result.duration}ms)`);
    } else {
      console.log(`❌ ${result.name} - ${result.error} (${result.duration}ms)`);
    }
  });

  console.log(`\n📁 Test files saved to: ${outputDir}/`);
  console.log('👀 Open these files in PowerPoint to check which ones trigger repair errors');
  console.log('🔍 Focus on the comparison-table and multi-slide tests');
}

if (require.main === module) {
  runContentTypeTests().catch(console.error);
}
