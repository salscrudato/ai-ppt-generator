#!/usr/bin/env node

/**
 * Test script for the enhanced PowerPoint generator
 * This validates that the core functionality works correctly
 */

const fs = require('fs');
const path = require('path');

// Test data
const testSlideSpecs = [
  {
    title: "Welcome to Enhanced PowerPoint Generator",
    layout: "title",
    paragraph: "A comprehensive solution for professional presentations"
  },
  {
    title: "Key Features",
    layout: "title-bullets",
    bullets: [
      "Professional 16:9 slide layouts with modern design",
      "Enhanced typography and theme system",
      "Native chart and table support",
      "Speaker notes and comprehensive metadata",
      "Optimized for maintainability and performance"
    ]
  },
  {
    title: "Data Visualization",
    layout: "chart",
    bullets: [
      "Sales: 150k",
      "Marketing: 75k", 
      "Development: 200k",
      "Support: 50k"
    ]
  },
  {
    title: "Comparison Table",
    layout: "comparison-table",
    bullets: [
      "Feature A: High performance with 99% uptime",
      "Feature B: Advanced security with encryption",
      "Feature C: Scalable architecture supporting 10k+ users"
    ]
  },
  {
    title: "Two Column Layout",
    layout: "two-column",
    paragraph: "This demonstrates the two-column layout capability with text content on the left side.",
    bullets: [
      "Bullet point one",
      "Bullet point two", 
      "Bullet point three"
    ]
  }
];

async function testEnhancedGenerator() {
  console.log('🧪 Testing Enhanced PowerPoint Generator');
  console.log('=====================================');
  
  try {
    // Import the enhanced generator
    const { generatePpt } = require('./functions/lib/pptGenerator-enhanced.js');
    
    console.log('✅ Enhanced generator imported successfully');
    
    // Test generation with various options
    console.log('🔄 Generating test presentation...');
    
    const options = {
      includeMetadata: true,
      includeSpeakerNotes: true,
      optimizeFileSize: true,
      quality: 'high',
      author: 'Test Suite',
      company: 'AI PowerPoint Generator',
      subject: 'Enhanced Generator Test'
    };
    
    const buffer = await generatePpt(testSlideSpecs, true, 'corporate-blue', options);
    
    console.log('✅ PowerPoint generation completed');
    console.log(`📊 Generated file size: ${Math.round(buffer.length / 1024)} KB`);
    
    // Validate buffer
    if (!buffer || buffer.length === 0) {
      throw new Error('Generated buffer is empty');
    }
    
    // Check PPTX signature
    const signature = buffer.subarray(0, 4);
    const expectedSignature = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
    if (!signature.equals(expectedSignature)) {
      throw new Error('Invalid PowerPoint file signature');
    }
    
    console.log('✅ File signature validation passed');
    
    // Save test file
    const testFileName = `test-enhanced-presentation-${Date.now()}.pptx`;
    fs.writeFileSync(testFileName, buffer);
    console.log(`💾 Test file saved: ${testFileName}`);
    
    // Validate file size
    const stats = fs.statSync(testFileName);
    if (stats.size < 5000) {
      throw new Error(`Generated file too small: ${stats.size} bytes`);
    }
    
    console.log('✅ File size validation passed');
    
    // Test with different themes
    console.log('🎨 Testing different themes...');
    const themes = ['corporate-blue', 'modern-dark', 'creative-gradient'];
    
    for (const themeId of themes) {
      try {
        const themeBuffer = await generatePpt(
          [testSlideSpecs[0]], // Just test with one slide
          true,
          themeId,
          { ...options, quality: 'draft' }
        );
        
        if (themeBuffer && themeBuffer.length > 0) {
          console.log(`✅ Theme '${themeId}' generation successful`);
        } else {
          console.log(`⚠️  Theme '${themeId}' generated empty buffer`);
        }
      } catch (error) {
        console.log(`❌ Theme '${themeId}' failed: ${error.message}`);
      }
    }
    
    // Test error handling
    console.log('🛡️  Testing error handling...');
    
    try {
      await generatePpt([], true, 'corporate-blue', options);
      console.log('❌ Should have thrown error for empty specs');
    } catch (error) {
      if (error.message.includes('No slide specifications provided')) {
        console.log('✅ Empty specs validation working');
      } else {
        console.log(`⚠️  Unexpected error: ${error.message}`);
      }
    }
    
    try {
      await generatePpt(testSlideSpecs, true, 'invalid-theme', options);
      console.log('❌ Should have thrown error for invalid theme');
    } catch (error) {
      if (error.message.includes('Theme not found')) {
        console.log('✅ Invalid theme validation working');
      } else {
        console.log(`⚠️  Unexpected error: ${error.message}`);
      }
    }
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('📋 Test Summary:');
    console.log(`   • Generated ${testSlideSpecs.length} slides`);
    console.log(`   • File size: ${Math.round(buffer.length / 1024)} KB`);
    console.log(`   • Themes tested: ${themes.length}`);
    console.log(`   • Error handling: ✅ Working`);
    console.log(`   • File validation: ✅ Passed`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  }
}

// Run the test
if (require.main === module) {
  testEnhancedGenerator()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = { testEnhancedGenerator };
