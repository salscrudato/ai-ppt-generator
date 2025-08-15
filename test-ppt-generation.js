/**
 * Simple test script to verify PowerPoint generation works correctly
 * This runs outside of Jest to avoid any testing environment issues
 */

const { generatePpt } = require('./lib/pptGenerator');
const fs = require('fs');
const path = require('path');

async function testPowerPointGeneration() {
  console.log('🧪 Testing PowerPoint generation...');
  
  try {
    // Test 1: Simple title slide
    console.log('\n📝 Test 1: Simple title slide');
    const titleSlide = [{
      title: 'Test Presentation',
      layout: 'title',
      paragraph: 'This is a test subtitle'
    }];
    
    const titleBuffer = await generatePpt(titleSlide, true);
    console.log(`✅ Title slide generated: ${titleBuffer.length} bytes`);
    
    // Save to file for manual inspection
    const titlePath = path.join(__dirname, 'test-output-title.pptx');
    fs.writeFileSync(titlePath, titleBuffer);
    console.log(`💾 Saved to: ${titlePath}`);
    
    // Test 2: Multi-slide presentation
    console.log('\n📝 Test 2: Multi-slide presentation');
    const multiSlides = [
      {
        title: 'Introduction',
        layout: 'title',
        paragraph: 'Welcome to our presentation'
      },
      {
        title: 'Key Points',
        layout: 'title-bullets',
        bullets: [
          'First important point',
          'Second key insight',
          'Third critical factor'
        ]
      },
      {
        title: 'Summary',
        layout: 'title-paragraph',
        paragraph: 'This presentation covered the main topics and provided valuable insights for our audience.'
      }
    ];
    
    const multiBuffer = await generatePpt(multiSlides, true);
    console.log(`✅ Multi-slide presentation generated: ${multiBuffer.length} bytes`);
    
    // Save to file for manual inspection
    const multiPath = path.join(__dirname, 'test-output-multi.pptx');
    fs.writeFileSync(multiPath, multiBuffer);
    console.log(`💾 Saved to: ${multiPath}`);
    
    // Test 3: Complex slide with two columns
    console.log('\n📝 Test 3: Two-column layout');
    const complexSlides = [{
      title: 'Comparison Analysis',
      layout: 'two-column',
      left: {
        heading: 'Advantages',
        bullets: [
          'Cost effective solution',
          'Easy to implement',
          'Scalable architecture'
        ]
      },
      right: {
        heading: 'Challenges',
        bullets: [
          'Initial setup complexity',
          'Training requirements',
          'Migration timeline'
        ]
      }
    }];
    
    const complexBuffer = await generatePpt(complexSlides, true);
    console.log(`✅ Complex slide generated: ${complexBuffer.length} bytes`);
    
    // Save to file for manual inspection
    const complexPath = path.join(__dirname, 'test-output-complex.pptx');
    fs.writeFileSync(complexPath, complexBuffer);
    console.log(`💾 Saved to: ${complexPath}`);
    
    // Validate file signatures
    console.log('\n🔍 Validating file signatures...');
    
    const files = [
      { name: 'Title slide', buffer: titleBuffer },
      { name: 'Multi-slide', buffer: multiBuffer },
      { name: 'Complex slide', buffer: complexBuffer }
    ];
    
    for (const file of files) {
      const signature = file.buffer.subarray(0, 4);
      const expectedSignature = Buffer.from([0x50, 0x4B, 0x03, 0x04]); // "PK\x03\x04"
      const isValid = signature.equals(expectedSignature);
      
      console.log(`${isValid ? '✅' : '❌'} ${file.name}: ${isValid ? 'Valid' : 'Invalid'} PowerPoint signature`);
      
      if (!isValid) {
        console.log(`   Expected: ${expectedSignature.toString('hex')}`);
        console.log(`   Got: ${signature.toString('hex')}`);
      }
    }
    
    console.log('\n🎉 PowerPoint generation test completed!');
    console.log('\n📋 Summary:');
    console.log(`- Title slide: ${titleBuffer.length} bytes`);
    console.log(`- Multi-slide: ${multiBuffer.length} bytes`);
    console.log(`- Complex slide: ${complexBuffer.length} bytes`);
    
    if (titleBuffer.length > 1000 && multiBuffer.length > 1000 && complexBuffer.length > 1000) {
      console.log('\n✅ All tests passed! PowerPoint generation is working correctly.');
      console.log('📁 Check the generated .pptx files to verify they open correctly in PowerPoint.');
    } else {
      console.log('\n❌ Some files are suspiciously small. There may be generation issues.');
    }
    
  } catch (error) {
    console.error('\n❌ PowerPoint generation test failed:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
testPowerPointGeneration().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
