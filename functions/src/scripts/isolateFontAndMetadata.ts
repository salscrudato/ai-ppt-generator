#!/usr/bin/env node

/**
 * Isolate Font and Metadata Issues
 * Tests specific features that might cause PowerPoint repair errors
 */

import { powerPointService } from '../services/powerPointService';
import { getThemeById } from '../professionalThemes';
import * as fs from 'fs';
import * as path from 'path';

const outputDir = './font-metadata-isolation-output';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

interface TestCase {
  name: string;
  spec: any;
  options: any;
}

const testCases: TestCase[] = [
  // Test 1: Minimal with no metadata
  {
    name: 'minimal-no-metadata',
    spec: [{
      title: 'Test',
      layout: 'title'
    }],
    options: {
      theme: getThemeById('corporate-blue'),
      includeMetadata: false
    }
  },

  // Test 2: Minimal with metadata
  {
    name: 'minimal-with-metadata',
    spec: [{
      title: 'Test',
      layout: 'title'
    }],
    options: {
      theme: getThemeById('corporate-blue'),
      includeMetadata: true
    }
  },

  // Test 3: Different quality settings
  {
    name: 'minimal-draft-quality',
    spec: [{
      title: 'Test',
      layout: 'title'
    }],
    options: {
      theme: getThemeById('corporate-blue'),
      quality: 'draft'
    }
  },

  // Test 4: High quality
  {
    name: 'minimal-high-quality',
    spec: [{
      title: 'Test',
      layout: 'title'
    }],
    options: {
      theme: getThemeById('corporate-blue'),
      quality: 'high'
    }
  },

  // Test 5: Compact mode
  {
    name: 'minimal-compact-mode',
    spec: [{
      title: 'Test',
      layout: 'title'
    }],
    options: {
      theme: getThemeById('corporate-blue'),
      compactMode: true
    }
  },

  // Test 6: Different typography scale
  {
    name: 'minimal-large-typography',
    spec: [{
      title: 'Test',
      layout: 'title'
    }],
    options: {
      theme: getThemeById('corporate-blue'),
      typographyScale: 'large'
    }
  },

  // Test 7: Executive dark theme (might have different font issues)
  {
    name: 'executive-dark-minimal',
    spec: [{
      title: 'Test',
      layout: 'title'
    }],
    options: {
      theme: getThemeById('executive-dark')
    }
  },

  // Test 8: Consulting charcoal theme
  {
    name: 'consulting-charcoal-minimal',
    spec: [{
      title: 'Test',
      layout: 'title'
    }],
    options: {
      theme: getThemeById('consulting-charcoal')
    }
  },

  // Test 9: All options disabled
  {
    name: 'minimal-all-disabled',
    spec: [{
      title: 'Test',
      layout: 'title'
    }],
    options: {
      theme: getThemeById('corporate-blue'),
      includeImages: false,
      includeNotes: false,
      includeMetadata: false,
      optimizeForSize: false,
      quality: 'draft'
    }
  },

  // Test 10: Simple text with special characters
  {
    name: 'special-characters',
    spec: [{
      title: 'Test with Special Characters: $2.5M → +28% (Q3→Q4)',
      layout: 'title'
    }],
    options: {
      theme: getThemeById('corporate-blue')
    }
  }
];

async function runFontMetadataTests() {
  console.log('🔍 Font and Metadata Issue Isolation');
  console.log('====================================\n');

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
      
      const result = await powerPointService.generatePresentation(
        testCase.spec,
        testCase.options
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
  console.log('\n📊 Font/Metadata Test Results:');
  console.log('===============================');
  
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
  console.log('🔍 Compare files with and without metadata to isolate the issue');
}

if (require.main === module) {
  runFontMetadataTests().catch(console.error);
}
