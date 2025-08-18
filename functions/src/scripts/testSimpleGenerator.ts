#!/usr/bin/env node

/**
 * Test Simple Generator
 * Quick test to verify the simple generator works without repair errors
 */

import { powerPointService } from '../services/powerPointService';
import { getThemeById } from '../professionalThemes';
import * as fs from 'fs';
import * as path from 'path';

const outputDir = './simple-generator-test-output';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

interface TestCase {
  name: string;
  spec: any;
}

const testCases: TestCase[] = [
  // Test 1: Minimal test
  {
    name: 'simple-minimal',
    spec: [{
      title: 'Test Slide',
      layout: 'title'
    }]
  },

  // Test 2: Bullets
  {
    name: 'simple-bullets',
    spec: [{
      title: 'Test Bullets',
      layout: 'title-bullets',
      bullets: ['Bullet 1', 'Bullet 2', 'Bullet 3']
    }]
  },

  // Test 3: Table (the problematic one)
  {
    name: 'simple-table',
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

  // Test 4: Multi-slide
  {
    name: 'simple-multi-slide',
    spec: [
      {
        title: 'Title Slide',
        layout: 'title'
      },
      {
        title: 'Content Slide',
        layout: 'title-bullets',
        bullets: ['Point 1', 'Point 2']
      },
      {
        title: 'Table Slide',
        layout: 'comparison-table',
        comparisonTable: {
          headers: ['Item', 'Value'],
          rows: [
            ['Revenue', '$3.2M'],
            ['Growth', '+28%']
          ]
        }
      }
    ]
  }
];

async function testSimpleGenerator() {
  console.log('🔧 Testing Simple Generator');
  console.log('============================\n');

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
  console.log('\n📊 Simple Generator Test Results:');
  console.log('==================================');
  
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
  console.log('🎯 The simple generator should eliminate all repair issues');
}

if (require.main === module) {
  testSimpleGenerator().catch(console.error);
}
