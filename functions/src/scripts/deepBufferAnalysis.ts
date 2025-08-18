#!/usr/bin/env node

/**
 * Deep Buffer Analysis - Identify Exact Corruption Source
 * 
 * INNOVATIVE APPROACH:
 * 1. Hex dump analysis of generated buffers
 * 2. Comparison with known-good PowerPoint files
 * 3. Byte-by-byte corruption detection
 * 4. OOXML structure validation
 * 5. ZIP archive integrity checking
 */

import { generateSimplePpt } from '../pptGenerator-simple';
import * as fs from 'fs';
import * as path from 'path';

const outputDir = './deep-buffer-analysis';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function hexDump(buffer: Buffer, maxBytes: number = 512): string {
  const lines: string[] = [];
  for (let i = 0; i < Math.min(buffer.length, maxBytes); i += 16) {
    const chunk = buffer.subarray(i, i + 16);
    const hex = chunk.toString('hex').match(/.{2}/g)?.join(' ') || '';
    const ascii = chunk.toString('ascii').replace(/[^\x20-\x7E]/g, '.');
    lines.push(`${i.toString(16).padStart(8, '0')}: ${hex.padEnd(47)} |${ascii}|`);
  }
  return lines.join('\n');
}

function analyzeZipStructure(buffer: Buffer): any {
  const analysis = {
    hasValidZipSignature: false,
    centralDirectoryFound: false,
    endOfCentralDirectoryFound: false,
    fileEntries: [] as string[],
    corruptionIssues: [] as string[]
  };

  // Check ZIP signature
  if (buffer.length >= 4) {
    const signature = buffer.readUInt32LE(0);
    analysis.hasValidZipSignature = signature === 0x04034b50; // PK\x03\x04
  }

  // Look for central directory signature
  const centralDirSig = Buffer.from([0x50, 0x4b, 0x01, 0x02]); // PK\x01\x02
  analysis.centralDirectoryFound = buffer.includes(centralDirSig);

  // Look for end of central directory signature
  const endCentralDirSig = Buffer.from([0x50, 0x4b, 0x05, 0x06]); // PK\x05\x06
  analysis.endOfCentralDirectoryFound = buffer.includes(endCentralDirSig);

  // Look for OOXML content types
  const contentTypesStr = '[Content_Types].xml';
  if (buffer.includes(Buffer.from(contentTypesStr))) {
    analysis.fileEntries.push(contentTypesStr);
  }

  // Check for null byte sequences (corruption indicator)
  const nullSequence = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00]);
  if (buffer.includes(nullSequence)) {
    analysis.corruptionIssues.push('Long null byte sequence detected');
  }

  // Check for truncated data
  if (buffer.length < 1000) {
    analysis.corruptionIssues.push('File appears truncated (< 1KB)');
  }

  return analysis;
}

async function createKnownGoodFile(): Promise<Buffer> {
  // Create the absolute minimal PowerPoint file possible
  console.log('🔧 Creating known-good reference file...');
  
  try {
    const result = await generateSimplePpt(
      [{ title: 'Test', layout: 'title' }],
      'corporate-blue',
      {
        includeMetadata: false,
        includeSpeakerNotes: false
      }
    );
    
    const refPath = path.join(outputDir, 'reference-good.pptx');
    fs.writeFileSync(refPath, result);
    console.log(`✅ Reference file created: ${result.length} bytes`);
    
    return result;
  } catch (error) {
    console.error('❌ Failed to create reference file:', error);
    throw error;
  }
}

async function deepBufferAnalysis() {
  console.log('🔬 DEEP BUFFER ANALYSIS - CORRUPTION DETECTION');
  console.log('==============================================\n');

  // Step 1: Create reference file
  const referenceBuffer = await createKnownGoodFile();
  
  // Step 2: Analyze reference file structure
  console.log('📊 REFERENCE FILE ANALYSIS');
  console.log('---------------------------');
  console.log(`File size: ${referenceBuffer.length} bytes`);
  
  const refAnalysis = analyzeZipStructure(referenceBuffer);
  console.log('ZIP Structure:');
  console.log(`  Valid ZIP signature: ${refAnalysis.hasValidZipSignature}`);
  console.log(`  Central directory: ${refAnalysis.centralDirectoryFound}`);
  console.log(`  End of central dir: ${refAnalysis.endOfCentralDirectoryFound}`);
  console.log(`  File entries: ${refAnalysis.fileEntries.join(', ')}`);
  console.log(`  Corruption issues: ${refAnalysis.corruptionIssues.length ? refAnalysis.corruptionIssues.join(', ') : 'None'}`);
  
  // Step 3: Hex dump of first 256 bytes
  console.log('\n📝 HEX DUMP (First 256 bytes):');
  console.log('------------------------------');
  console.log(hexDump(referenceBuffer, 256));
  
  // Step 4: Save detailed analysis
  const analysis = {
    timestamp: new Date().toISOString(),
    referenceFile: {
      size: referenceBuffer.length,
      hash: require('crypto').createHash('md5').update(referenceBuffer).digest('hex'),
      structure: refAnalysis,
      hexDump: hexDump(referenceBuffer, 512)
    }
  };
  
  const reportPath = path.join(outputDir, `deep-analysis-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));
  
  // Step 5: Test the reference file
  console.log('\n🧪 TESTING REFERENCE FILE');
  console.log('--------------------------');
  console.log('Please test the reference file in PowerPoint to verify it opens without repair errors.');
  console.log(`Reference file: ${path.join(outputDir, 'reference-good.pptx')}`);
  
  // Step 6: Create comparison files with different options
  console.log('\n🔄 CREATING COMPARISON FILES');
  console.log('-----------------------------');
  
  const testCases = [
    {
      name: 'minimal-no-options',
      options: {}
    },
    {
      name: 'minimal-with-metadata',
      options: { includeMetadata: true }
    },
    {
      name: 'minimal-with-notes',
      options: { includeSpeakerNotes: true }
    },
    {
      name: 'minimal-all-options',
      options: { includeMetadata: true, includeSpeakerNotes: true }
    }
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`Creating ${testCase.name}...`);
      const result = await generateSimplePpt(
        [{ title: 'Test', layout: 'title' }],
        'corporate-blue',
        testCase.options
      );
      
      const filePath = path.join(outputDir, `${testCase.name}.pptx`);
      fs.writeFileSync(filePath, result);
      
      const analysis = analyzeZipStructure(result);
      console.log(`  ✅ ${result.length} bytes, corruption issues: ${analysis.corruptionIssues.length}`);
      
      if (analysis.corruptionIssues.length > 0) {
        console.log(`     ⚠️  Issues: ${analysis.corruptionIssues.join(', ')}`);
      }
      
    } catch (error) {
      console.log(`  ❌ Failed: ${error}`);
    }
  }
  
  console.log(`\n📄 Detailed analysis saved: ${reportPath}`);
  console.log(`📁 Test files saved to: ${outputDir}/`);
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Test each file in PowerPoint to identify which options cause corruption');
  console.log('2. Compare hex dumps of working vs corrupted files');
  console.log('3. Focus on the specific option that introduces corruption');
  console.log('4. Examine the pptGenerator-simple.ts code for that specific feature');
}

if (require.main === module) {
  deepBufferAnalysis().catch(console.error);
}
