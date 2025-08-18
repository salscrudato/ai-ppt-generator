#!/usr/bin/env node

/**
 * Isolate PowerPoint Repair Issue
 * Creates minimal test cases to identify the exact cause of repair errors
 */

import { powerPointService } from '../services/powerPointService';
import { PROFESSIONAL_THEMES, getThemeById } from '../professionalThemes';
import * as fs from 'fs';
import * as path from 'path';

interface TestCase {
  name: string;
  spec: any;
  themeId?: string;
}

const outputDir = './repair-isolation-output';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const testCases: TestCase[] = [
  // Test 1: Absolute minimal
  {
    name: 'minimal-single-slide',
    spec: [{
      title: 'Test',
      layout: 'title'
    }]
  },

  // Test 2: Basic corporate (from real-world test)
  {
    name: 'basic-corporate-exact',
    spec: [
      {
        title: 'Company Overview',
        layout: 'title'
      },
      {
        title: 'Our Mission',
        layout: 'title-bullets',
        bullets: [
          'Deliver exceptional value to customers',
          'Drive innovation in our industry',
          'Build sustainable growth'
        ]
      },
      {
        title: 'Financial Summary',
        layout: 'comparison-table',
        comparisonTable: {
          headers: ['Metric', 'Q3', 'Q4', 'Growth'],
          rows: [
            ['Revenue', '$2.5M', '$3.2M', '+28%'],
            ['Customers', '1,200', '1,800', '+50%']
          ]
        }
      }
    ],
    themeId: 'corporate-blue'
  },

  // Test 3: Just the table that might be causing issues
  {
    name: 'table-only',
    spec: [{
      title: 'Financial Summary',
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

  // Test 4: Chart only
  {
    name: 'chart-only',
    spec: [{
      title: 'Revenue Performance',
      layout: 'chart',
      chart: {
        type: 'bar',
        title: 'Quarterly Revenue ($M)',
        categories: ['Q1', 'Q2', 'Q3', 'Q4'],
        series: [
          {
            name: 'Revenue ($M)',
            data: [2.1, 2.3, 2.5, 3.2]
          }
        ]
      }
    }]
  },

  // Test 5: Two-column layout
  {
    name: 'two-column-only',
    spec: [{
      title: 'Market Analysis',
      layout: 'two-column',
      left: {
        title: 'Growth Drivers',
        bullets: [
          'New product launch success',
          'Improved customer retention'
        ]
      },
      right: {
        title: 'Key Metrics',
        bullets: [
          'Customer LTV: $1,450 (+16%)',
          'CAC Ratio: 4.1:1 (+28%)'
        ]
      }
    }]
  },

  // Test 6: Theme-specific test
  {
    name: 'corporate-blue-theme',
    spec: [{
      title: 'Theme Test',
      layout: 'title-bullets',
      bullets: ['Test bullet 1', 'Test bullet 2']
    }],
    themeId: 'corporate-blue'
  },

  // Test 7: Executive dark theme
  {
    name: 'executive-dark-theme',
    spec: [{
      title: 'Theme Test',
      layout: 'title-bullets',
      bullets: ['Test bullet 1', 'Test bullet 2']
    }],
    themeId: 'executive-dark'
  },

  // Test 8: Consulting charcoal theme
  {
    name: 'consulting-charcoal-theme',
    spec: [{
      title: 'Theme Test',
      layout: 'title-bullets',
      bullets: ['Test bullet 1', 'Test bullet 2']
    }],
    themeId: 'consulting-charcoal'
  }
];

async function runIsolationTests() {
  console.log('🔍 PowerPoint Repair Issue Isolation');
  console.log('=====================================\n');

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
      
      const theme = getThemeById(testCase.themeId || 'corporate-blue');
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
  console.log('\n📊 Isolation Test Results:');
  console.log('===========================');
  
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
  console.log('👀 Open these files in PowerPoint to check for repair errors');
  console.log('🔍 Start with the minimal test and work up to identify the problematic feature');
}

if (require.main === module) {
  runIsolationTests().catch(console.error);
}
