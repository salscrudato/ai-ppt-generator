/**
 * Comprehensive Theme Testing Script
 * Tests PowerPoint generation with 3 different themes to ensure compatibility
 */

const { generatePpt } = require('./lib/pptGenerator');
const fs = require('fs');
const path = require('path');

async function testThemes() {
  console.log('🎨 Testing PowerPoint generation with multiple themes...\n');
  
  const testResults = [];
  
  // Test data for different slide types
  const testSlides = [
    {
      title: 'Business Presentation',
      layout: 'title',
      paragraph: 'Professional business presentation with corporate styling'
    },
    {
      title: 'Key Business Metrics',
      layout: 'title-bullets',
      bullets: [
        'Revenue growth increased by 25% this quarter',
        'Customer satisfaction scores improved to 4.8/5',
        'Market expansion into 3 new regions',
        'Team productivity enhanced through automation'
      ]
    },
    {
      title: 'Strategic Analysis',
      layout: 'two-column',
      left: {
        heading: 'Strengths',
        bullets: [
          'Strong market position',
          'Experienced leadership team',
          'Innovative product portfolio',
          'Loyal customer base'
        ]
      },
      right: {
        heading: 'Opportunities',
        bullets: [
          'Emerging market trends',
          'Digital transformation',
          'Strategic partnerships',
          'Technology advancement'
        ]
      }
    },
    {
      title: 'Executive Summary',
      layout: 'title-paragraph',
      paragraph: 'This comprehensive analysis demonstrates our company\'s strong performance across all key metrics. Our strategic initiatives have delivered exceptional results, positioning us for continued growth and market leadership in the coming quarters.'
    }
  ];

  // Theme 1: Business Professional Theme
  console.log('📊 Test 1: Business Professional Theme');
  try {
    const businessSlides = testSlides.map(slide => ({
      ...slide,
      design: {
        theme: 'business-professional',
        colorScheme: 'corporate-blue',
        style: 'professional'
      }
    }));

    const businessBuffer = await generatePpt(businessSlides, true);
    const businessPath = path.join(__dirname, 'test-theme-business.pptx');
    fs.writeFileSync(businessPath, businessBuffer);
    
    testResults.push({
      theme: 'Business Professional',
      size: businessBuffer.length,
      path: businessPath,
      success: true
    });
    
    console.log(`✅ Business theme: ${Math.round(businessBuffer.length / 1024)}KB`);
    console.log(`💾 Saved to: ${businessPath}\n`);
  } catch (error) {
    console.error(`❌ Business theme failed: ${error.message}\n`);
    testResults.push({
      theme: 'Business Professional',
      success: false,
      error: error.message
    });
  }

  // Theme 2: Academic/Educational Theme
  console.log('🎓 Test 2: Academic Educational Theme');
  try {
    const academicSlides = testSlides.map(slide => ({
      ...slide,
      title: slide.title.replace('Business', 'Academic Research'),
      design: {
        theme: 'academic-research',
        colorScheme: 'academic-blue',
        style: 'educational'
      }
    }));

    const academicBuffer = await generatePpt(academicSlides, true);
    const academicPath = path.join(__dirname, 'test-theme-academic.pptx');
    fs.writeFileSync(academicPath, academicBuffer);
    
    testResults.push({
      theme: 'Academic Educational',
      size: academicBuffer.length,
      path: academicPath,
      success: true
    });
    
    console.log(`✅ Academic theme: ${Math.round(academicBuffer.length / 1024)}KB`);
    console.log(`💾 Saved to: ${academicPath}\n`);
  } catch (error) {
    console.error(`❌ Academic theme failed: ${error.message}\n`);
    testResults.push({
      theme: 'Academic Educational',
      success: false,
      error: error.message
    });
  }

  // Theme 3: Creative/Modern Theme
  console.log('🎨 Test 3: Creative Modern Theme');
  try {
    const creativeSlides = testSlides.map(slide => ({
      ...slide,
      title: slide.title.replace('Business', 'Creative Project'),
      design: {
        theme: 'creative-modern',
        colorScheme: 'vibrant-purple',
        style: 'modern'
      }
    }));

    const creativeBuffer = await generatePpt(creativeSlides, true);
    const creativePath = path.join(__dirname, 'test-theme-creative.pptx');
    fs.writeFileSync(creativePath, creativeBuffer);
    
    testResults.push({
      theme: 'Creative Modern',
      size: creativeBuffer.length,
      path: creativePath,
      success: true
    });
    
    console.log(`✅ Creative theme: ${Math.round(creativeBuffer.length / 1024)}KB`);
    console.log(`💾 Saved to: ${creativePath}\n`);
  } catch (error) {
    console.error(`❌ Creative theme failed: ${error.message}\n`);
    testResults.push({
      theme: 'Creative Modern',
      success: false,
      error: error.message
    });
  }

  // Validate all generated files
  console.log('🔍 Validating generated files...');
  for (const result of testResults) {
    if (result.success && result.path) {
      try {
        const buffer = fs.readFileSync(result.path);
        const signature = buffer.subarray(0, 4);
        const expectedSignature = Buffer.from([0x50, 0x4B, 0x03, 0x04]); // "PK\x03\x04"
        const isValid = signature.equals(expectedSignature);
        
        console.log(`${isValid ? '✅' : '❌'} ${result.theme}: ${isValid ? 'Valid' : 'Invalid'} PowerPoint signature`);
        
        if (!isValid) {
          console.log(`   Expected: ${expectedSignature.toString('hex')}`);
          console.log(`   Got: ${signature.toString('hex')}`);
        }
      } catch (error) {
        console.log(`❌ ${result.theme}: File validation failed - ${error.message}`);
      }
    }
  }

  // Summary
  console.log('\n📋 Theme Testing Summary:');
  console.log('=' .repeat(50));
  
  const successfulTests = testResults.filter(r => r.success);
  const failedTests = testResults.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successfulTests.length}/${testResults.length} themes`);
  console.log(`❌ Failed: ${failedTests.length}/${testResults.length} themes`);
  
  if (successfulTests.length > 0) {
    console.log('\n✅ Successful Themes:');
    successfulTests.forEach(result => {
      console.log(`   • ${result.theme}: ${Math.round(result.size / 1024)}KB`);
    });
  }
  
  if (failedTests.length > 0) {
    console.log('\n❌ Failed Themes:');
    failedTests.forEach(result => {
      console.log(`   • ${result.theme}: ${result.error}`);
    });
  }
  
  console.log('\n🎉 Theme testing completed!');
  
  if (successfulTests.length === testResults.length) {
    console.log('🎯 All themes passed! PowerPoint generation is working correctly across all themes.');
    return true;
  } else {
    console.log('⚠️ Some themes failed. Please review the errors above.');
    return false;
  }
}

// Run the theme tests
testThemes().catch(error => {
  console.error('💥 Theme testing failed:', error);
  process.exit(1);
});
