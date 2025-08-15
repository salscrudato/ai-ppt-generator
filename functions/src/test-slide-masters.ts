/**
 * Test Script for Slide Master System
 * 
 * Quick test to verify the slide master implementation works correctly
 * and generates professional presentations with consistent design.
 */

import { generatePpt } from './pptGenerator';
import { SlideSpec } from './schema';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Test slide master system with various layout types
 */
async function testSlideMasters() {
  console.log('🧪 Testing Slide Master System...');

  const testSlides: SlideSpec[] = [
    // Title slide
    {
      title: 'Professional Presentation with Slide Masters',
      layout: 'title',
      paragraph: 'Demonstrating modern slide master implementation with consistent branding and professional design',
      design: {
        author: 'AI PowerPoint Generator',
        date: new Date().toLocaleDateString()
      }
    },

    // Content slide with bullets (will auto-detect and enhance)
    {
      title: 'Key Features of Slide Masters',
      layout: 'title-bullets',
      bullets: [
        'Consistent branding across all slides',
        'Professional typography and spacing',
        'Automatic slide numbering (excluding title slides)',
        'Theme-based color schemes and visual elements',
        'Multiple layout patterns for different content types'
      ],
      notes: 'Emphasize the professional quality and time-saving benefits of the slide master system.'
    },

    // Auto-chart generation test
    {
      title: 'Performance Metrics - Auto Chart Generation',
      layout: 'title-bullets',
      bullets: [
        'Q1 Revenue: $2.5M',
        'Q2 Revenue: $3.2M',
        'Q3 Revenue: $3.8M',
        'Q4 Revenue: $4.1M',
        'Year-over-year growth: 25%'
      ]
    },

    // Auto-table generation test
    {
      title: 'Feature Comparison - Auto Table Generation',
      layout: 'title-bullets',
      bullets: [
        'Basic Plan: $10/month | 5 users | 10GB storage',
        'Pro Plan: $25/month | 25 users | 100GB storage',
        'Enterprise Plan: $50/month | Unlimited users | 1TB storage',
        'Custom Plan: Contact us | Custom users | Custom storage'
      ]
    },

    // Two-column layout
    {
      title: 'Benefits and Implementation',
      layout: 'two-column',
      left: {
        bullets: [
          'Reduced design inconsistencies',
          'Professional appearance out-of-the-box',
          'Scalable branding system',
          'Enhanced visual hierarchy'
        ]
      },
      right: {
        bullets: [
          'PptxGenJS defineSlideMaster() integration',
          'Theme-aware placeholder positioning',
          'Automatic metadata generation',
          'Progress indicators and accent elements'
        ]
      }
    },

    // Image-right layout
    {
      title: 'Visual Design Elements',
      layout: 'image-right',
      bullets: [
        'Subtle gradient backgrounds',
        'Accent lines and corner elements',
        'Professional color schemes',
        'Consistent spacing and margins'
      ],
      imagePrompt: 'Modern professional presentation design elements'
    },

    // Quote slide
    {
      title: 'Testimonial',
      layout: 'quote',
      paragraph: 'The slide master system has transformed our presentation quality, delivering professional results with minimal effort.',
      design: {
        author: 'Professional User'
      }
    },

    // Native chart test
    {
      title: 'Revenue Growth - Native Chart',
      layout: 'chart',
      chart: {
        type: 'line',
        title: 'Quarterly Revenue Growth',
        categories: ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 'Q1 2024'],
        series: [
          {
            name: 'Revenue',
            data: [2.5, 3.2, 3.8, 4.1, 4.8],
            color: '#0066cc'
          },
          {
            name: 'Target',
            data: [2.0, 2.8, 3.5, 4.0, 4.5],
            color: '#10b981'
          }
        ],
        showLegend: true,
        showDataLabels: true
      }
    },

    // Native table test
    {
      title: 'Feature Comparison - Native Table',
      layout: 'comparison-table',
      comparisonTable: {
        headers: ['Feature', 'Basic', 'Pro', 'Enterprise'],
        rows: [
          ['Users', '5', '25', 'Unlimited'],
          ['Storage', '10GB', '100GB', '1TB'],
          ['Support', 'Email', 'Priority', '24/7 Phone'],
          ['Analytics', 'Basic', 'Advanced', 'Custom'],
          ['Price', '$10/mo', '$25/mo', '$50/mo']
        ]
      }
    },

    // Metrics dashboard
    {
      title: 'Performance Metrics',
      layout: 'metrics-dashboard',
      bullets: [
        'Design consistency improved by 95%',
        'Time to create presentations reduced by 60%',
        'Professional quality rating: 9.5/10',
        'User satisfaction increased by 85%'
      ]
    },

    // Section divider
    {
      title: 'Advanced Features',
      layout: 'section-divider'
    },

    // Content with paragraph
    {
      title: 'Implementation Details',
      layout: 'title-paragraph',
      paragraph: 'The slide master system uses PptxGenJS\'s defineSlideMaster() functionality to create consistent templates. Each master includes theme-aware colors, typography, positioning, and visual elements. The system automatically selects the appropriate master based on slide layout and populates placeholders with content, ensuring professional quality and design consistency across all slides.'
    },

    // Closing slide
    {
      title: 'Thank You',
      layout: 'thank-you',
      paragraph: 'Questions and Discussion\n\nContact: ai-ppt-generator@example.com'
    }
  ];

  try {
    console.log(`📊 Generating presentation with ${testSlides.length} slides...`);
    
    const buffer = await generatePpt(testSlides, true);
    
    // Save test file
    const outputPath = path.join(__dirname, '../../test-output');
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }
    
    const filename = `slide-masters-test-${Date.now()}.pptx`;
    const filepath = path.join(outputPath, filename);
    
    fs.writeFileSync(filepath, buffer);
    
    console.log(`✅ Test completed successfully!`);
    console.log(`📁 File saved: ${filepath}`);
    console.log(`📏 File size: ${Math.round(buffer.length / 1024)}KB`);
    
    return {
      success: true,
      filepath,
      fileSize: buffer.length,
      slideCount: testSlides.length
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testSlideMasters()
    .then(result => {
      if (result.success) {
        console.log('🎉 Slide Master System test passed!');
        process.exit(0);
      } else {
        console.error('💥 Test failed:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Unexpected error:', error);
      process.exit(1);
    });
}

export { testSlideMasters };
