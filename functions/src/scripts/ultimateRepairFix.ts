#!/usr/bin/env node

/**
 * Ultimate Repair Fix - Comprehensive Solution
 * 
 * INNOVATIVE MULTI-PRONGED APPROACH:
 * 1. Test different pptxgenjs configurations
 * 2. Alternative table rendering methods
 * 3. Different compression settings
 * 4. Alternative libraries (if needed)
 * 5. Manual OOXML generation (last resort)
 */

import pptxgen from 'pptxgenjs';
import * as fs from 'fs';
import * as path from 'path';

const outputDir = './ultimate-repair-fix';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

interface TestResult {
  name: string;
  success: boolean;
  fileSize: number;
  duration: number;
  error?: string;
}

async function testConfiguration(name: string, configFn: () => Promise<Buffer>): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const buffer = await configFn();
    const duration = Date.now() - startTime;
    
    // Save file
    const filePath = path.join(outputDir, `${name}.pptx`);
    fs.writeFileSync(filePath, buffer);
    
    return {
      name,
      success: true,
      fileSize: buffer.length,
      duration
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      name,
      success: false,
      fileSize: 0,
      duration,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function ultimateRepairFix() {
  console.log('🚀 ULTIMATE REPAIR FIX - Comprehensive Solution');
  console.log('===============================================\n');

  const results: TestResult[] = [];

  // TEST 1: Different compression settings
  console.log('📍 PHASE 1: Compression Settings');
  console.log('---------------------------------');

  const compressionTests = [
    {
      name: 'no-compression',
      config: async () => {
        const pres = new pptxgen();
        const slide = pres.addSlide();
        slide.addText('Test', { x: 1, y: 1, w: 8, h: 1 });
        return await pres.write({ 
          outputType: 'nodebuffer',
          compression: false 
        }) as Buffer;
      }
    },
    {
      name: 'minimal-compression',
      config: async () => {
        const pres = new pptxgen();
        const slide = pres.addSlide();
        slide.addText('Test', { x: 1, y: 1, w: 8, h: 1 });
        return await pres.write({ 
          outputType: 'nodebuffer',
          compression: true 
        }) as Buffer;
      }
    }
  ];

  for (const test of compressionTests) {
    console.log(`🧪 Testing: ${test.name}`);
    const result = await testConfiguration(test.name, test.config);
    results.push(result);
    
    if (result.success) {
      console.log(`  ✅ ${result.fileSize} bytes (${result.duration}ms)`);
    } else {
      console.log(`  ❌ ${result.error}`);
    }
  }

  // TEST 2: Different table approaches
  console.log('\n📍 PHASE 2: Table Rendering Approaches');
  console.log('--------------------------------------');

  const tableTests = [
    {
      name: 'table-as-text-blocks',
      config: async () => {
        const pres = new pptxgen();
        const slide = pres.addSlide();
        
        // Render table as positioned text blocks instead of actual table
        slide.addText('Metric | Q3 | Q4 | Growth', { 
          x: 1, y: 2, w: 8, h: 0.5, 
          fontSize: 14, fontFace: 'Arial', bold: true 
        });
        slide.addText('Revenue | $2.5M | $3.2M | +28%', { 
          x: 1, y: 2.7, w: 8, h: 0.5, 
          fontSize: 12, fontFace: 'Arial' 
        });
        slide.addText('Customers | 1,200 | 1,800 | +50%', { 
          x: 1, y: 3.2, w: 8, h: 0.5, 
          fontSize: 12, fontFace: 'Arial' 
        });
        
        return await pres.write({ outputType: 'nodebuffer' }) as Buffer;
      }
    },
    {
      name: 'table-native-pptx',
      config: async () => {
        const pres = new pptxgen();
        const slide = pres.addSlide();

        // Use native pptxgenjs table with proper format
        const tableData = [
          [
            { text: 'Metric', options: { fontSize: 12, fontFace: 'Arial', bold: true } },
            { text: 'Q3', options: { fontSize: 12, fontFace: 'Arial', bold: true } },
            { text: 'Q4', options: { fontSize: 12, fontFace: 'Arial', bold: true } },
            { text: 'Growth', options: { fontSize: 12, fontFace: 'Arial', bold: true } }
          ],
          [
            { text: 'Revenue', options: { fontSize: 12, fontFace: 'Arial' } },
            { text: '$2.5M', options: { fontSize: 12, fontFace: 'Arial' } },
            { text: '$3.2M', options: { fontSize: 12, fontFace: 'Arial' } },
            { text: '+28%', options: { fontSize: 12, fontFace: 'Arial' } }
          ],
          [
            { text: 'Customers', options: { fontSize: 12, fontFace: 'Arial' } },
            { text: '1,200', options: { fontSize: 12, fontFace: 'Arial' } },
            { text: '1,800', options: { fontSize: 12, fontFace: 'Arial' } },
            { text: '+50%', options: { fontSize: 12, fontFace: 'Arial' } }
          ]
        ];

        slide.addTable(tableData, {
          x: 1,
          y: 2,
          w: 8,
          h: 3
        });

        return await pres.write({ outputType: 'nodebuffer' }) as Buffer;
      }
    },
    {
      name: 'table-as-bullets',
      config: async () => {
        const pres = new pptxgen();
        const slide = pres.addSlide();
        
        slide.addText('Test Table', { 
          x: 1, y: 1, w: 8, h: 1, 
          fontSize: 24, fontFace: 'Arial', bold: true 
        });
        
        // Convert table to bullet points
        const bullets = [
          'Headers: Metric | Q3 | Q4 | Growth',
          'Row 1: Revenue | $2.5M | $3.2M | +28%',
          'Row 2: Customers | 1,200 | 1,800 | +50%'
        ];
        
        bullets.forEach((bullet, index) => {
          slide.addText(`• ${bullet}`, {
            x: 1.5,
            y: 2.5 + (index * 0.6),
            w: 7,
            h: 0.5,
            fontSize: 12,
            fontFace: 'Arial'
          });
        });
        
        return await pres.write({ outputType: 'nodebuffer' }) as Buffer;
      }
    }
  ];

  for (const test of tableTests) {
    console.log(`🧪 Testing: ${test.name}`);
    const result = await testConfiguration(test.name, test.config);
    results.push(result);
    
    if (result.success) {
      console.log(`  ✅ ${result.fileSize} bytes (${result.duration}ms)`);
    } else {
      console.log(`  ❌ ${result.error}`);
    }
  }

  // TEST 3: Different output methods
  console.log('\n📍 PHASE 3: Output Method Alternatives');
  console.log('-------------------------------------');

  const outputTests = [
    {
      name: 'output-base64-converted',
      config: async () => {
        const pres = new pptxgen();
        const slide = pres.addSlide();
        slide.addText('Test', { x: 1, y: 1, w: 8, h: 1 });
        
        const base64 = await pres.write({ outputType: 'base64' }) as string;
        return Buffer.from(base64, 'base64');
      }
    },
    {
      name: 'output-uint8array-converted',
      config: async () => {
        const pres = new pptxgen();
        const slide = pres.addSlide();
        slide.addText('Test', { x: 1, y: 1, w: 8, h: 1 });
        
        const uint8Array = await pres.write({ outputType: 'uint8array' }) as Uint8Array;
        return Buffer.from(uint8Array);
      }
    }
  ];

  for (const test of outputTests) {
    console.log(`🧪 Testing: ${test.name}`);
    const result = await testConfiguration(test.name, test.config);
    results.push(result);
    
    if (result.success) {
      console.log(`  ✅ ${result.fileSize} bytes (${result.duration}ms)`);
    } else {
      console.log(`  ❌ ${result.error}`);
    }
  }

  // TEST 4: Minimal safe configuration
  console.log('\n📍 PHASE 4: Minimal Safe Configuration');
  console.log('-------------------------------------');

  const safeTests = [
    {
      name: 'ultra-minimal-safe',
      config: async () => {
        const pres = new pptxgen();
        
        // Absolute minimal settings
        pres.layout = 'LAYOUT_16x9';
        pres.rtlMode = false;
        
        const slide = pres.addSlide();
        slide.addText('Safe Test', { 
          x: 2, 
          y: 2, 
          w: 6, 
          h: 1,
          fontSize: 18,
          fontFace: 'Arial',
          color: '000000'
        });
        
        return await pres.write({ 
          outputType: 'nodebuffer',
          compression: false
        }) as Buffer;
      }
    }
  ];

  for (const test of safeTests) {
    console.log(`🧪 Testing: ${test.name}`);
    const result = await testConfiguration(test.name, test.config);
    results.push(result);
    
    if (result.success) {
      console.log(`  ✅ ${result.fileSize} bytes (${result.duration}ms)`);
    } else {
      console.log(`  ❌ ${result.error}`);
    }
  }

  // Summary
  console.log('\n📊 ULTIMATE REPAIR FIX RESULTS');
  console.log('===============================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`Total Tests: ${results.length}`);
  console.log(`Successful: ${successful.length} ✅`);
  console.log(`Failed: ${failed.length} ❌\n`);

  successful.forEach(result => {
    console.log(`✅ ${result.name} (${result.fileSize} bytes, ${result.duration}ms)`);
  });

  if (failed.length > 0) {
    console.log('\nFailed tests:');
    failed.forEach(result => {
      console.log(`❌ ${result.name} - ${result.error}`);
    });
  }

  console.log(`\n📁 Test files saved to: ${outputDir}/`);
  console.log('🎯 CRITICAL: Test each file in PowerPoint to identify which approach eliminates repair errors');
  console.log('💡 Focus on table-as-text-blocks and table-as-bullets as safer alternatives');
  console.log('🚀 Once we find a working approach, we can implement it in the main generator');
}

if (require.main === module) {
  ultimateRepairFix().catch(console.error);
}
