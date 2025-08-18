#!/usr/bin/env node

/**
 * Comprehensive PowerPoint Repair Error Analysis
 * 
 * INNOVATIVE APPROACH:
 * 1. Binary search through features to isolate the exact corruption source
 * 2. Byte-level analysis of generated files
 * 3. Comparison with known-good PowerPoint files
 * 4. Progressive feature elimination
 * 5. Cross-platform validation
 * 6. Memory and buffer analysis
 */

import { powerPointService } from '../services/powerPointService';
import { getThemeById } from '../professionalThemes';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const outputDir = './comprehensive-repair-analysis';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

interface TestResult {
  name: string;
  success: boolean;
  fileSize: number;
  duration: number;
  hash: string;
  signature: string;
  error?: string;
  bufferAnalysis?: {
    hasValidZipSignature: boolean;
    hasValidOOXMLStructure: boolean;
    corruptionMarkers: string[];
  };
}

// PHASE 1: Absolute Minimal Tests (Binary Search Approach)
const minimalTests = [
  {
    name: 'absolute-minimal-empty',
    spec: [],
    description: 'Empty presentation - baseline test'
  },
  {
    name: 'absolute-minimal-title-only',
    spec: [{ title: 'Test', layout: 'title' }],
    description: 'Single title slide - most basic content'
  },
  {
    name: 'minimal-no-theme',
    spec: [{ title: 'Test', layout: 'title' }],
    options: { theme: null },
    description: 'No theme applied - test theme corruption'
  },
  {
    name: 'minimal-no-metadata',
    spec: [{ title: 'Test', layout: 'title' }],
    options: { includeMetadata: false },
    description: 'No metadata - test metadata corruption'
  },
  {
    name: 'minimal-ascii-only',
    spec: [{ title: 'Test', layout: 'title' }],
    description: 'ASCII characters only - test encoding issues'
  },
  {
    name: 'minimal-unicode-test',
    spec: [{ title: 'Test → ★ ♦ ◊', layout: 'title' }],
    description: 'Unicode characters - test encoding corruption'
  }
];

// PHASE 2: Feature Isolation Tests
const featureTests = [
  {
    name: 'feature-bullets-simple',
    spec: [{ title: 'Test', layout: 'title-bullets', bullets: ['A', 'B'] }],
    description: 'Simple bullets - test bullet rendering'
  },
  {
    name: 'feature-bullets-complex',
    spec: [{ title: 'Test', layout: 'title-bullets', bullets: ['Bullet with special chars: $2.5M → +28%', 'Another bullet'] }],
    description: 'Complex bullets - test special character handling'
  },
  {
    name: 'feature-paragraph-simple',
    spec: [{ title: 'Test', layout: 'title-paragraph', paragraph: 'Simple paragraph.' }],
    description: 'Simple paragraph - test paragraph rendering'
  },
  {
    name: 'feature-two-column',
    spec: [{
      title: 'Test',
      layout: 'two-column',
      left: { title: 'Left', bullets: ['L1'] },
      right: { title: 'Right', bullets: ['R1'] }
    }],
    description: 'Two-column layout - test complex layouts'
  }
];

// PHASE 3: Data Structure Tests
const dataStructureTests = [
  {
    name: 'data-table-minimal',
    spec: [{
      title: 'Test',
      layout: 'comparison-table',
      comparisonTable: {
        headers: ['A', 'B'],
        rows: [['1', '2']]
      }
    }],
    description: 'Minimal table - test table data structure'
  },
  {
    name: 'data-chart-minimal',
    spec: [{
      title: 'Test',
      layout: 'chart',
      chart: {
        type: 'bar',
        title: 'Test',
        categories: ['A'],
        series: [{ name: 'Test', data: [1] }]
      }
    }],
    description: 'Minimal chart - test chart data structure'
  }
];

function analyzeBuffer(buffer: Buffer): any {
  const analysis = {
    hasValidZipSignature: false,
    hasValidOOXMLStructure: false,
    corruptionMarkers: [] as string[]
  };

  // Check ZIP signature (OOXML files are ZIP archives)
  if (buffer.length >= 4) {
    const signature = buffer.subarray(0, 4);
    analysis.hasValidZipSignature = 
      signature[0] === 0x50 && signature[1] === 0x4B && 
      (signature[2] === 0x03 || signature[2] === 0x05 || signature[2] === 0x07);
  }

  // Look for OOXML markers
  const bufferStr = buffer.toString('utf8', 0, Math.min(1000, buffer.length));
  analysis.hasValidOOXMLStructure = bufferStr.includes('application/vnd.openxmlformats');

  // Check for corruption markers
  if (buffer.includes(Buffer.from('corrupt', 'utf8'))) {
    analysis.corruptionMarkers.push('corrupt_string');
  }
  if (buffer.includes(Buffer.from('\x00\x00\x00\x00\x00', 'binary'))) {
    analysis.corruptionMarkers.push('null_bytes');
  }

  return analysis;
}

async function runTest(test: any): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const theme = test.options?.theme === null ? null : getThemeById('corporate-blue');
    const options = {
      theme,
      includeMetadata: test.options?.includeMetadata !== false,
      ...test.options
    };

    const result = await powerPointService.generatePresentation(test.spec, options);
    
    const filePath = path.join(outputDir, `${test.name}.pptx`);
    fs.writeFileSync(filePath, result.buffer);
    
    const fileSize = fs.statSync(filePath).size;
    const duration = Date.now() - startTime;
    const hash = crypto.createHash('md5').update(result.buffer).digest('hex');
    const signature = result.buffer.subarray(0, 8).toString('hex');
    const bufferAnalysis = analyzeBuffer(result.buffer);

    return {
      name: test.name,
      success: true,
      fileSize,
      duration,
      hash,
      signature,
      bufferAnalysis
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return {
      name: test.name,
      success: false,
      fileSize: 0,
      duration,
      hash: '',
      signature: '',
      error: errorMessage
    };
  }
}

async function comprehensiveRepairAnalysis() {
  console.log('🔬 COMPREHENSIVE POWERPOINT REPAIR ERROR ANALYSIS');
  console.log('=================================================\n');
  
  const allResults: TestResult[] = [];

  // PHASE 1: Minimal Tests
  console.log('📍 PHASE 1: Absolute Minimal Tests (Binary Search)');
  console.log('---------------------------------------------------');
  
  for (const test of minimalTests) {
    console.log(`🧪 ${test.name}: ${test.description}`);
    const result = await runTest(test);
    allResults.push(result);
    
    if (result.success) {
      console.log(`  ✅ ${result.fileSize} bytes, ${result.duration}ms, hash: ${result.hash.substring(0, 8)}`);
      console.log(`  📊 ZIP: ${result.bufferAnalysis?.hasValidZipSignature}, OOXML: ${result.bufferAnalysis?.hasValidOOXMLStructure}`);
      if (result.bufferAnalysis?.corruptionMarkers.length) {
        console.log(`  ⚠️  Corruption markers: ${result.bufferAnalysis.corruptionMarkers.join(', ')}`);
      }
    } else {
      console.log(`  ❌ ${result.error}`);
    }
  }

  // PHASE 2: Feature Tests
  console.log('\n📍 PHASE 2: Feature Isolation Tests');
  console.log('------------------------------------');
  
  for (const test of featureTests) {
    console.log(`🧪 ${test.name}: ${test.description}`);
    const result = await runTest(test);
    allResults.push(result);
    
    if (result.success) {
      console.log(`  ✅ ${result.fileSize} bytes, ${result.duration}ms, hash: ${result.hash.substring(0, 8)}`);
      if (result.bufferAnalysis?.corruptionMarkers.length) {
        console.log(`  ⚠️  Corruption markers: ${result.bufferAnalysis.corruptionMarkers.join(', ')}`);
      }
    } else {
      console.log(`  ❌ ${result.error}`);
    }
  }

  // PHASE 3: Data Structure Tests
  console.log('\n📍 PHASE 3: Data Structure Tests');
  console.log('---------------------------------');
  
  for (const test of dataStructureTests) {
    console.log(`🧪 ${test.name}: ${test.description}`);
    const result = await runTest(test);
    allResults.push(result);
    
    if (result.success) {
      console.log(`  ✅ ${result.fileSize} bytes, ${result.duration}ms, hash: ${result.hash.substring(0, 8)}`);
      if (result.bufferAnalysis?.corruptionMarkers.length) {
        console.log(`  ⚠️  Corruption markers: ${result.bufferAnalysis.corruptionMarkers.join(', ')}`);
      }
    } else {
      console.log(`  ❌ ${result.error}`);
    }
  }

  // Analysis Summary
  console.log('\n📊 COMPREHENSIVE ANALYSIS SUMMARY');
  console.log('==================================');
  
  const successful = allResults.filter(r => r.success);
  const failed = allResults.filter(r => !r.success);
  
  console.log(`Total Tests: ${allResults.length}`);
  console.log(`Successful: ${successful.length} ✅`);
  console.log(`Failed: ${failed.length} ❌`);
  console.log(`Success Rate: ${Math.round((successful.length / allResults.length) * 100)}%\n`);

  // File signature analysis
  const signatures = [...new Set(successful.map(r => r.signature))];
  console.log(`📝 Unique File Signatures: ${signatures.length}`);
  signatures.forEach(sig => {
    const count = successful.filter(r => r.signature === sig).length;
    console.log(`  ${sig}: ${count} files`);
  });

  // Size analysis
  const sizes = successful.map(r => r.fileSize);
  console.log(`\n📏 File Size Analysis:`);
  console.log(`  Min: ${Math.min(...sizes)} bytes`);
  console.log(`  Max: ${Math.max(...sizes)} bytes`);
  console.log(`  Avg: ${Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length)} bytes`);

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: allResults.length,
      successful: successful.length,
      failed: failed.length,
      successRate: Math.round((successful.length / allResults.length) * 100)
    },
    results: allResults,
    analysis: {
      signatures,
      sizeStats: {
        min: Math.min(...sizes),
        max: Math.max(...sizes),
        avg: Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length)
      }
    }
  };

  const reportPath = path.join(outputDir, `comprehensive-analysis-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`\n📄 Detailed report saved: ${reportPath}`);
  console.log(`📁 Test files saved to: ${outputDir}/`);
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Open each test file in PowerPoint to identify which specific ones trigger repair errors');
  console.log('2. Compare file signatures and buffer analysis for patterns');
  console.log('3. Focus on the minimal failing case for targeted fixes');
  console.log('4. Use binary search approach to isolate the exact corruption source');
}

if (require.main === module) {
  comprehensiveRepairAnalysis().catch(console.error);
}
