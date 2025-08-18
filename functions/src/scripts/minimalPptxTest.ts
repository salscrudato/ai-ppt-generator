#!/usr/bin/env node

/**
 * Minimal PPTX Test - Direct pptxgenjs Usage
 * 
 * This bypasses all our custom code and uses pptxgenjs directly
 * to determine if the issue is in our code or the library itself.
 */

import pptxgen from 'pptxgenjs';
import * as fs from 'fs';
import * as path from 'path';

const outputDir = './minimal-pptx-test';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function hexDump(buffer: Buffer, maxBytes: number = 256): string {
  const lines: string[] = [];
  for (let i = 0; i < Math.min(buffer.length, maxBytes); i += 16) {
    const chunk = buffer.subarray(i, i + 16);
    const hex = chunk.toString('hex').match(/.{2}/g)?.join(' ') || '';
    const ascii = chunk.toString('ascii').replace(/[^\x20-\x7E]/g, '.');
    lines.push(`${i.toString(16).padStart(8, '0')}: ${hex.padEnd(47)} |${ascii}|`);
  }
  return lines.join('\n');
}

async function testMinimalPptx() {
  console.log('🧪 MINIMAL PPTX TEST - Direct pptxgenjs Usage');
  console.log('==============================================\n');

  const tests = [
    {
      name: 'absolute-minimal',
      description: 'Absolute minimal PowerPoint with just one text element',
      create: async () => {
        const pres = new pptxgen();
        const slide = pres.addSlide();
        slide.addText('Hello World', { x: 1, y: 1, w: 8, h: 1 });
        return pres;
      }
    },
    {
      name: 'empty-slide',
      description: 'Empty slide with no content',
      create: async () => {
        const pres = new pptxgen();
        pres.addSlide();
        return pres;
      }
    },
    {
      name: 'with-layout',
      description: 'Slide with layout settings',
      create: async () => {
        const pres = new pptxgen();
        pres.layout = 'LAYOUT_16x9';
        const slide = pres.addSlide();
        slide.addText('Test', { x: 1, y: 1, w: 8, h: 1, fontSize: 24 });
        return pres;
      }
    },
    {
      name: 'with-background',
      description: 'Slide with background color',
      create: async () => {
        const pres = new pptxgen();
        const slide = pres.addSlide();
        slide.background = { color: 'FFFFFF' };
        slide.addText('Test', { x: 1, y: 1, w: 8, h: 1 });
        return pres;
      }
    },
    {
      name: 'with-metadata',
      description: 'Presentation with metadata',
      create: async () => {
        const pres = new pptxgen();
        pres.title = 'Test Presentation';
        pres.author = 'Test Author';
        const slide = pres.addSlide();
        slide.addText('Test', { x: 1, y: 1, w: 8, h: 1 });
        return pres;
      }
    }
  ];

  for (const test of tests) {
    console.log(`🧪 Testing: ${test.name}`);
    console.log(`   ${test.description}`);
    
    try {
      const startTime = Date.now();
      
      // Create presentation
      const pres = await test.create();
      
      // Generate buffer with minimal options
      const buffer = await pres.write({ outputType: 'nodebuffer' }) as Buffer;
      
      const duration = Date.now() - startTime;
      
      // Save file
      const filePath = path.join(outputDir, `${test.name}.pptx`);
      fs.writeFileSync(filePath, buffer);
      
      // Analyze buffer
      const hasValidZip = buffer.length >= 4 && buffer.readUInt32LE(0) === 0x04034b50;
      const hasNullBytes = buffer.includes(Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00]));
      const hasContentTypes = buffer.includes(Buffer.from('[Content_Types].xml'));
      
      console.log(`   ✅ Generated: ${buffer.length} bytes (${duration}ms)`);
      console.log(`   📊 Valid ZIP: ${hasValidZip}, Content Types: ${hasContentTypes}, Null bytes: ${hasNullBytes}`);
      
      // Show hex dump of first 128 bytes
      console.log(`   🔍 Hex dump (first 128 bytes):`);
      console.log(hexDump(buffer, 128).split('\n').map(line => `      ${line}`).join('\n'));
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error}`);
    }
    
    console.log('');
  }

  console.log('📁 Test files saved to:', outputDir);
  console.log('👀 Open these files in PowerPoint to test for repair errors');
  console.log('🎯 This will help determine if the issue is in pptxgenjs itself or our wrapper code');
}

if (require.main === module) {
  testMinimalPptx().catch(console.error);
}
