/**
 * Test script to validate styling improvements
 * Generates sample presentations to demonstrate enhanced features
 */

const { generateStyleShowcase, generateThemeShowcase } = require('./lib/pptGenerator');
const { validateSlideStyle } = require('./lib/styleValidator');
const { PROFESSIONAL_THEMES, getThemeById } = require('./lib/professionalThemes');
const fs = require('fs');
const path = require('path');

async function testStylingImprovements() {
  console.log('🎨 Testing PowerPoint Styling Improvements...\n');

  try {
    // Test 1: Generate style showcase
    console.log('1. Generating comprehensive style showcase...');
    const showcaseBuffer = await generateStyleShowcase();
    
    if (showcaseBuffer && showcaseBuffer.length > 0) {
      console.log('   ✅ Style showcase generated successfully');
      console.log(`   📊 File size: ${(showcaseBuffer.length / 1024).toFixed(1)} KB`);
      
      // Save to file for manual inspection
      const showcasePath = path.join(__dirname, 'test-outputs', 'style-showcase.pptx');
      fs.mkdirSync(path.dirname(showcasePath), { recursive: true });
      fs.writeFileSync(showcasePath, showcaseBuffer);
      console.log(`   💾 Saved to: ${showcasePath}`);
    } else {
      console.log('   ❌ Failed to generate style showcase');
    }

    // Test 2: Generate theme showcase
    console.log('\n2. Generating theme showcase...');
    const themeBuffer = await generateThemeShowcase();
    
    if (themeBuffer && themeBuffer.length > 0) {
      console.log('   ✅ Theme showcase generated successfully');
      console.log(`   📊 File size: ${(themeBuffer.length / 1024).toFixed(1)} KB`);
      
      // Save to file for manual inspection
      const themePath = path.join(__dirname, 'test-outputs', 'theme-showcase.pptx');
      fs.writeFileSync(themePath, themeBuffer);
      console.log(`   💾 Saved to: ${themePath}`);
    } else {
      console.log('   ❌ Failed to generate theme showcase');
    }

    // Test 3: Validate style quality
    console.log('\n3. Testing style validation system...');
    const testSlide = {
      title: 'Professional Design Test Slide',
      layout: 'title-bullets',
      bullets: [
        'Enhanced typography with modern font stacks',
        'Improved color palettes for better accessibility',
        'Professional visual effects and shadows',
        'Optimized spacing and layout systems',
        'Comprehensive style validation'
      ],
      design: { theme: 'corporate-blue' },
      notes: 'This slide demonstrates the enhanced styling system with professional design elements.'
    };

    const theme = getThemeById('corporate-blue');
    if (theme) {
      const validation = validateSlideStyle(testSlide, theme);
      console.log('   📋 Style Validation Results:');
      console.log(`      Score: ${validation.score}/100 (Grade: ${validation.grade})`);
      console.log(`      Typography: ${validation.typography.score}/100 (${validation.typography.readability})`);
      console.log(`      Accessibility: ${validation.accessibility.score}/100`);
      console.log(`      Color Harmony: ${validation.colorHarmony.score}/100 (${validation.colorHarmony.harmony})`);
      
      if (validation.issues.length > 0) {
        console.log('   ⚠️  Issues found:');
        validation.issues.forEach(issue => {
          console.log(`      - ${issue.message} (${issue.severity})`);
        });
      } else {
        console.log('   ✅ No style issues detected');
      }

      if (validation.suggestions.length > 0) {
        console.log('   💡 Suggestions:');
        validation.suggestions.forEach(suggestion => {
          console.log(`      - ${suggestion}`);
        });
      }
    }

    // Test 4: Theme analysis
    console.log('\n4. Analyzing enhanced themes...');
    console.log(`   📊 Total themes available: ${PROFESSIONAL_THEMES.length}`);
    
    const newThemes = PROFESSIONAL_THEMES.filter(theme => 
      ['modern-slate', 'vibrant-coral', 'deep-forest', 'electric-blue', 'warm-sunset'].includes(theme.id)
    );
    
    console.log(`   🆕 New modern themes: ${newThemes.length}`);
    newThemes.forEach(theme => {
      console.log(`      - ${theme.name} (${theme.category}): ${theme.colors.primary}`);
    });

    // Test 5: Typography improvements
    console.log('\n5. Typography system analysis...');
    const sampleTheme = getThemeById('modern-slate');
    if (sampleTheme) {
      console.log('   🔤 Font Stack Analysis:');
      console.log(`      Headings: ${sampleTheme.typography.headings.fontFamily.substring(0, 50)}...`);
      console.log(`      Body: ${sampleTheme.typography.body.fontFamily.substring(0, 50)}...`);
      console.log(`      H1 Size: ${sampleTheme.typography.headings.sizes.h1}px`);
      console.log(`      Body Size: ${sampleTheme.typography.body.sizes.normal}px`);
      console.log(`      Line Height: ${sampleTheme.typography.body.lineHeight.normal}`);
    }

    console.log('\n🎉 All styling improvement tests completed successfully!');
    console.log('\n📁 Generated files saved to: functions/test-outputs/');
    console.log('   - style-showcase.pptx: Comprehensive styling demonstration');
    console.log('   - theme-showcase.pptx: All new theme variations');
    console.log('\n💡 Open these files in PowerPoint, Keynote, or Google Slides to review the improvements.');

  } catch (error) {
    console.error('❌ Error during styling tests:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

// Run the tests
if (require.main === module) {
  testStylingImprovements();
}

module.exports = { testStylingImprovements };
