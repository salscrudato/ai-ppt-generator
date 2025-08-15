/**
 * PowerPoint Corruption Detection Tests
 * 
 * These tests specifically check for corruption issues in generated PowerPoint files
 * and validate that the fixes implemented prevent corruption.
 */

const { generatePpt } = require('../lib/pptGenerator');

describe('PowerPoint Corruption Detection', () => {
  
  /**
   * Test that generated PowerPoint files have valid ZIP signatures
   * PowerPoint files are ZIP archives and should start with 'PK'
   */
  test('should generate files with valid PowerPoint signatures', async () => {
    const slides = [
      { 
        title: 'Test Slide', 
        layout: 'title',
        paragraph: 'This is a test slide to check for corruption.'
      }
    ];

    const buffer = await generatePpt(slides, true);
    
    // Check that buffer exists and has content
    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(1000); // Should be more than 1KB for a real PowerPoint file
    
    // Check ZIP signature (PowerPoint files are ZIP archives)
    const signature = buffer.subarray(0, 4);
    const expectedSignature = Buffer.from([0x50, 0x4B, 0x03, 0x04]); // "PK\x03\x04"
    
    expect(signature.equals(expectedSignature)).toBe(true);
  });

  /**
   * Test that files with complex content don't cause corruption
   */
  test('should handle complex slides without corruption', async () => {
    const slides = [
      {
        title: 'Complex Slide with Multiple Elements',
        layout: 'two-column',
        left: {
          heading: 'Left Column',
          paragraph: 'This is a complex paragraph with special characters: áéíóú, ñ, ü, and symbols like @#$%^&*()',
          bullets: [
            'First bullet point with émojis 🚀',
            'Second bullet with numbers: 123,456.78',
            'Third bullet with quotes: "Hello World"'
          ]
        },
        right: {
          heading: 'Right Column',
          paragraph: 'Another complex paragraph with different content and formatting.',
          bullets: [
            'Right side bullet 1',
            'Right side bullet 2 with special chars: <>&"\'',
            'Right side bullet 3'
          ]
        }
      }
    ];

    const buffer = await generatePpt(slides, true);
    
    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(1000);
    
    // Validate ZIP signature
    const signature = buffer.subarray(0, 4);
    const expectedSignature = Buffer.from([0x50, 0x4B, 0x03, 0x04]);
    expect(signature.equals(expectedSignature)).toBe(true);
  });

  /**
   * Test that multiple slides don't cause memory or corruption issues
   */
  test('should handle multiple slides without corruption', async () => {
    const slides = [];
    
    // Create 10 slides with different layouts
    for (let i = 1; i <= 10; i++) {
      slides.push({
        title: `Slide ${i}`,
        layout: i % 2 === 0 ? 'title-bullets' : 'title-paragraph',
        paragraph: `This is the content for slide ${i}. It contains some text to make the slide meaningful.`,
        bullets: i % 2 === 0 ? [
          `Bullet point 1 for slide ${i}`,
          `Bullet point 2 for slide ${i}`,
          `Bullet point 3 for slide ${i}`
        ] : undefined
      });
    }

    const buffer = await generatePpt(slides, true);
    
    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(5000); // Should be larger with more content
    
    // Validate ZIP signature
    const signature = buffer.subarray(0, 4);
    const expectedSignature = Buffer.from([0x50, 0x4B, 0x03, 0x04]);
    expect(signature.equals(expectedSignature)).toBe(true);
  });

  /**
   * Test that special characters don't cause corruption
   */
  test('should handle special characters without corruption', async () => {
    const slides = [
      {
        title: 'Special Characters Test: áéíóú ñ ü ç',
        layout: 'title-bullets',
        paragraph: 'Testing special characters: àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ',
        bullets: [
          'Unicode test: 你好世界 (Hello World in Chinese)',
          'Emoji test: 🚀 🎯 ✅ ❌ ⚠️ 📊',
          'Symbol test: ©®™€£¥§¶†‡•…‰‹›""''–—',
          'Math symbols: ±×÷≠≤≥∞∑∏∫√∂∆'
        ]
      }
    ];

    const buffer = await generatePpt(slides, true);
    
    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(1000);
    
    // Validate ZIP signature
    const signature = buffer.subarray(0, 4);
    const expectedSignature = Buffer.from([0x50, 0x4B, 0x03, 0x04]);
    expect(signature.equals(expectedSignature)).toBe(true);
  });

  /**
   * Test that very long content doesn't cause corruption
   */
  test('should handle long content without corruption', async () => {
    const longText = 'This is a very long paragraph that tests the system\'s ability to handle extensive content without causing corruption. '.repeat(50);
    const longBullets = Array.from({ length: 20 }, (_, i) => 
      `This is bullet point ${i + 1} with substantial content that should not cause any corruption issues in the PowerPoint generation process.`
    );

    const slides = [
      {
        title: 'Long Content Test Slide',
        layout: 'title-bullets',
        paragraph: longText,
        bullets: longBullets
      }
    ];

    const buffer = await generatePpt(slides, true);
    
    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(2000);
    
    // Validate ZIP signature
    const signature = buffer.subarray(0, 4);
    const expectedSignature = Buffer.from([0x50, 0x4B, 0x03, 0x04]);
    expect(signature.equals(expectedSignature)).toBe(true);
  });

  /**
   * Test error handling doesn't cause corruption
   */
  test('should handle invalid input gracefully without corruption', async () => {
    // Test with minimal valid input
    const slides = [
      {
        title: '', // Empty title should be handled
        layout: 'title'
      }
    ];

    const buffer = await generatePpt(slides, true);
    
    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(500);
    
    // Validate ZIP signature
    const signature = buffer.subarray(0, 4);
    const expectedSignature = Buffer.from([0x50, 0x4B, 0x03, 0x04]);
    expect(signature.equals(expectedSignature)).toBe(true);
  });

  /**
   * Test that the buffer contains expected PowerPoint structure
   */
  test('should generate buffer with PowerPoint internal structure', async () => {
    const slides = [
      { title: 'Structure Test', layout: 'title' }
    ];

    const buffer = await generatePpt(slides, true);
    
    // Convert buffer to string to check for PowerPoint-specific content
    const bufferString = buffer.toString('binary');
    
    // PowerPoint files should contain these XML namespaces and structures
    const expectedPatterns = [
      'Content_Types', // PowerPoint content types
      'ppt/', // PowerPoint directory structure
      'slides/', // Slides directory
    ];

    // Check that at least some PowerPoint-specific patterns exist
    let foundPatterns = 0;
    expectedPatterns.forEach(pattern => {
      if (bufferString.includes(pattern)) {
        foundPatterns++;
      }
    });

    expect(foundPatterns).toBeGreaterThan(0);
  });

  /**
   * Performance test - ensure generation doesn't timeout or hang
   */
  test('should generate PowerPoint within reasonable time', async () => {
    const startTime = Date.now();
    
    const slides = [
      { title: 'Performance Test', layout: 'title-bullets', bullets: ['Test', 'Performance', 'Timing'] }
    ];

    const buffer = await generatePpt(slides, true);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(buffer).toBeDefined();
    expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
  });

});
