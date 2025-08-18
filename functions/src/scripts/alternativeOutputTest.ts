#!/usr/bin/env node

/**
 * Alternative Output Test - Different pptxgenjs Output Methods
 * 
 * Test different output methods to see if the issue is with nodebuffer specifically
 */

import pptxgen from 'pptxgenjs';
import * as fs from 'fs';
import * as path from 'path';

const outputDir = './alternative-output-test';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function analyzeBuffer(buffer: Buffer): any {
  const hasValidZip = buffer.length >= 4 && buffer.readUInt32LE(0) === 0x04034b50;
  const hasNullBytes = buffer.includes(Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00]));
  const hasContentTypes = buffer.includes(Buffer.from('[Content_Types].xml'));
  
  // Check for actual content in the ZIP entries
  const hasRealContent = buffer.includes(Buffer.from('presentation.xml')) || 
                        buffer.includes(Buffer.from('<p:sld')) ||
                        buffer.includes(Buffer.from('<p:presentation'));
  
  return {
    hasValidZip,
    hasNullBytes,
    hasContentTypes,
    hasRealContent,
    size: buffer.length
  };
}

async function testAlternativeOutputs() {
  console.log('🧪 ALTERNATIVE OUTPUT TEST - Different pptxgenjs Methods');
  console.log('======================================================\n');

  // Create a simple presentation
  const createPresentation = () => {
    const pres = new pptxgen();
    pres.layout = 'LAYOUT_16x9';
    const slide = pres.addSlide();
    slide.addText('Test Slide', { 
      x: 1, 
      y: 2, 
      w: 8, 
      h: 1, 
      fontSize: 24,
      fontFace: 'Arial',
      color: '000000'
    });
    return pres;
  };

  const tests = [
    {
      name: 'nodebuffer-default',
      description: 'Default nodebuffer output (current method)',
      test: async () => {
        const pres = createPresentation();
        return await pres.write({ outputType: 'nodebuffer' }) as Buffer;
      }
    },
    {
      name: 'nodebuffer-no-compression',
      description: 'Nodebuffer without compression',
      test: async () => {
        const pres = createPresentation();
        return await pres.write({ 
          outputType: 'nodebuffer',
          compression: false 
        }) as Buffer;
      }
    },
    {
      name: 'base64',
      description: 'Base64 output converted to buffer',
      test: async () => {
        const pres = createPresentation();
        const base64 = await pres.write({ outputType: 'base64' }) as string;
        return Buffer.from(base64, 'base64');
      }
    },
    {
      name: 'uint8array',
      description: 'Uint8Array output converted to buffer',
      test: async () => {
        const pres = createPresentation();
        const uint8Array = await pres.write({ outputType: 'uint8array' }) as Uint8Array;
        return Buffer.from(uint8Array);
      }
    }
  ];

  for (const test of tests) {
    console.log(`🧪 Testing: ${test.name}`);
    console.log(`   ${test.description}`);
    
    try {
      const startTime = Date.now();
      const buffer = await test.test();
      const duration = Date.now() - startTime;
      
      // Save file
      const filePath = path.join(outputDir, `${test.name}.pptx`);
      fs.writeFileSync(filePath, buffer);
      
      // Analyze buffer
      const analysis = analyzeBuffer(buffer);
      
      console.log(`   ✅ Generated: ${analysis.size} bytes (${duration}ms)`);
      console.log(`   📊 Valid ZIP: ${analysis.hasValidZip}`);
      console.log(`   📊 Content Types: ${analysis.hasContentTypes}`);
      console.log(`   📊 Real Content: ${analysis.hasRealContent}`);
      console.log(`   📊 Null Bytes: ${analysis.hasNullBytes}`);
      
      // Show first few bytes
      const hex = buffer.subarray(0, 16).toString('hex').match(/.{2}/g)?.join(' ') || '';
      console.log(`   🔍 First 16 bytes: ${hex}`);
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error}`);
    }
    
    console.log('');
  }

  console.log('📁 Test files saved to:', outputDir);
  console.log('👀 Open these files in PowerPoint to test for repair errors');
  console.log('🎯 Focus on which output method produces files without repair errors');
  console.log('💡 If file-then-read works but nodebuffer doesn\'t, we have a solution!');
}

if (require.main === module) {
  testAlternativeOutputs().catch(console.error);
}
