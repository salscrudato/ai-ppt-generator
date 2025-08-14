const https = require('https');

/**
 * Comprehensive Test Suite for Enhanced PowerPoint Generation
 * 
 * Tests all new features including:
 * - Enhanced themes and typography
 * - Improved layout engine
 * - Advanced visual elements
 * - Modern color schemes
 * - Better spacing and positioning
 */

// Test configurations for different enhanced features
const testConfigurations = [
  {
    name: "Enhanced Mixed Content Layout",
    spec: {
      title: "Enhanced Mixed Content with Modern Styling",
      layout: "mixed-content",
      paragraph: "This enhanced paragraph demonstrates improved typography, better spacing, and professional visual hierarchy. The text should appear with enhanced styling and better readability.",
      bullets: [
        "Enhanced bullet points with custom styling",
        "Improved spacing and visual hierarchy",
        "Modern accent colors and typography",
        "Professional positioning and alignment"
      ],
      right: {
        imagePrompt: "A modern, professional business chart showing growth trends with clean design and vibrant colors"
      },
      design: {
        theme: "peach-fuzz-2024",
        adaptive: true
      }
    },
    themeId: "peach-fuzz-2024"
  },
  {
    name: "Enhanced Two-Column Layout",
    spec: {
      title: "Professional Two-Column Design",
      layout: "two-column",
      left: {
        heading: "Problem Analysis",
        paragraph: "Traditional presentations often lack visual appeal and professional styling.",
        bullets: [
          "Poor typography choices",
          "Inconsistent spacing",
          "Limited visual elements"
        ]
      },
      right: {
        heading: "Our Solution",
        paragraph: "Enhanced PowerPoint generation with modern design principles.",
        bullets: [
          "Professional theme system",
          "Enhanced visual hierarchy",
          "Modern color schemes"
        ]
      },
      design: {
        theme: "ocean-breeze"
      }
    },
    themeId: "ocean-breeze"
  },
  {
    name: "Enhanced Image-Right Layout",
    spec: {
      title: "Modern Image Integration",
      layout: "image-right",
      paragraph: "This layout demonstrates enhanced image integration with improved positioning, subtle shadows, and professional borders for a more polished appearance.",
      bullets: [
        "Enhanced image styling with shadows",
        "Professional border effects",
        "Improved positioning and spacing",
        "Better visual integration"
      ],
      right: {
        imagePrompt: "A sleek, modern office workspace with natural lighting, clean design, and professional atmosphere"
      },
      design: {
        theme: "platinum-elegance"
      }
    },
    themeId: "platinum-elegance"
  },
  {
    name: "Enhanced Quote Layout",
    spec: {
      title: "Professional Quote Presentation",
      layout: "quote",
      paragraph: "Innovation distinguishes between a leader and a follower. This enhanced quote layout features improved typography, subtle backgrounds, and professional accent elements.",
      design: {
        theme: "royal-purple"
      }
    },
    themeId: "royal-purple"
  },
  {
    name: "Enhanced Chart Visualization",
    spec: {
      title: "Advanced Data Visualization",
      layout: "chart",
      chart: {
        type: "column",
        title: "Quarterly Performance Growth",
        categories: ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"],
        series: [
          {
            name: "Revenue",
            data: [85, 92, 98, 105]
          },
          {
            name: "Profit",
            data: [25, 32, 38, 45]
          }
        ],
        showLegend: true,
        showDataLabels: true
      },
      design: {
        theme: "forest-modern"
      }
    },
    themeId: "forest-modern"
  }
];

// API endpoint
const apiUrl = 'https://api-rh444yt5aq-uc.a.run.app/generate';

// Function to run a single test
async function runTest(config, index) {
  return new Promise((resolve, reject) => {
    console.log(`\n🧪 Test ${index + 1}/${testConfigurations.length}: ${config.name}`);
    console.log(`📋 Theme: ${config.themeId}`);
    console.log(`📋 Layout: ${config.spec.layout}`);

    const postData = JSON.stringify({
      spec: config.spec,
      themeId: config.themeId,
      withValidation: true
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(apiUrl, options, (res) => {
      console.log(`📊 Status: ${res.statusCode}`);
      
      let data = Buffer.alloc(0);
      res.on('data', (chunk) => {
        data = Buffer.concat([data, chunk]);
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ ${config.name} - SUCCESS`);
          console.log(`📁 File size: ${data.length} bytes`);
          console.log(`📄 Content-Type: ${res.headers['content-type']}`);
          resolve({
            name: config.name,
            success: true,
            size: data.length,
            theme: config.themeId
          });
        } else {
          console.log(`❌ ${config.name} - FAILED`);
          console.log('Error:', data.toString());
          resolve({
            name: config.name,
            success: false,
            error: data.toString(),
            theme: config.themeId
          });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ ${config.name} - REQUEST ERROR:`, error);
      resolve({
        name: config.name,
        success: false,
        error: error.message,
        theme: config.themeId
      });
    });

    req.write(postData);
    req.end();
  });
}

// Run all tests sequentially
async function runAllTests() {
  console.log('🚀 Starting Enhanced PowerPoint Generation Test Suite');
  console.log(`📊 Running ${testConfigurations.length} comprehensive tests...\n`);

  const results = [];
  
  for (let i = 0; i < testConfigurations.length; i++) {
    const result = await runTest(testConfigurations[i], i);
    results.push(result);
    
    // Add delay between tests to avoid overwhelming the API
    if (i < testConfigurations.length - 1) {
      console.log('⏳ Waiting 2 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Print summary
  console.log('\n📊 TEST SUMMARY');
  console.log('================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);
  
  if (successful.length > 0) {
    console.log('\n✅ SUCCESSFUL TESTS:');
    successful.forEach(result => {
      console.log(`  • ${result.name} (${result.theme}) - ${result.size} bytes`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    failed.forEach(result => {
      console.log(`  • ${result.name} (${result.theme}) - ${result.error}`);
    });
  }

  console.log(`\n🎯 Overall Success Rate: ${Math.round((successful.length / results.length) * 100)}%`);
  
  if (successful.length === results.length) {
    console.log('🎉 All enhanced features are working correctly!');
  } else {
    console.log('⚠️  Some features need attention.');
  }
}

// Start the test suite
runAllTests().catch(console.error);
