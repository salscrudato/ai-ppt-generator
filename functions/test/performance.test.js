/**
 * Performance Benchmark Test Suite
 * 
 * Tests for PowerPoint generation performance including:
 * - Generation speed benchmarks
 * - Memory usage monitoring
 * - File size optimization
 * - Scalability testing
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');

// Mock Firebase functions for testing
jest.mock('firebase-functions/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

jest.mock('firebase-functions/params', () => ({
  defineSecret: jest.fn(() => ({ value: () => 'mock-secret' }))
}));

// Import modules to test
const {
  generateSimplePpt
} = require('../lib/pptGenerator-simple');

const {
  getThemeById
} = require('../lib/professionalThemes');

const {
  EnhancedPowerPointService
} = require('../lib/services/enhancedPowerPointService');

describe('PowerPoint Generation Performance', () => {
  describe('Generation Speed Benchmarks', () => {
    it('should generate small presentations quickly (< 5 seconds)', async () => {
      const slides = [
        {
          title: 'Performance Test',
          layout: 'title',
          paragraph: 'Testing generation speed for small presentations.'
        },
        {
          title: 'Key Metrics',
          layout: 'title-bullets',
          bullets: ['Speed', 'Quality', 'Reliability']
        }
      ];

      const startTime = Date.now();
      const buffer = await generateSimplePpt(slides, true, 'corporate-blue');
      const endTime = Date.now();
      
      const generationTime = endTime - startTime;
      
      expect(buffer).toBeDefined();
      expect(generationTime).toBeLessThan(5000); // Less than 5 seconds
      
      console.log(`Small presentation generation time: ${generationTime}ms`);
    }, 10000);

    it('should handle medium presentations efficiently (< 15 seconds)', async () => {
      const slides = [];
      
      // Generate 10 slides with various layouts
      for (let i = 0; i < 10; i++) {
        slides.push({
          title: `Slide ${i + 1}: Performance Testing`,
          layout: i % 2 === 0 ? 'title-bullets' : 'title-paragraph',
          paragraph: `This is slide ${i + 1} for performance testing. It contains moderate content to test generation speed.`,
          bullets: [
            `Bullet point 1 for slide ${i + 1}`,
            `Bullet point 2 for slide ${i + 1}`,
            `Bullet point 3 for slide ${i + 1}`,
            `Bullet point 4 for slide ${i + 1}`
          ]
        });
      }

      const startTime = Date.now();
      const buffer = await generateSimplePpt(slides, true, 'corporate-blue');
      const endTime = Date.now();
      
      const generationTime = endTime - startTime;
      
      expect(buffer).toBeDefined();
      expect(generationTime).toBeLessThan(15000); // Less than 15 seconds
      
      console.log(`Medium presentation (10 slides) generation time: ${generationTime}ms`);
    }, 20000);

    it('should scale reasonably for large presentations (< 30 seconds)', async () => {
      const slides = [];
      
      // Generate 25 slides with complex content
      for (let i = 0; i < 25; i++) {
        const layouts = ['title-bullets', 'title-paragraph', 'two-column', 'chart', 'quote'];
        slides.push({
          title: `Slide ${i + 1}: Scalability Test`,
          layout: layouts[i % layouts.length],
          paragraph: `This is slide ${i + 1} for scalability testing. It contains comprehensive content to test generation performance at scale.`,
          bullets: [
            `Performance metric ${i + 1}.1: Response time optimization`,
            `Performance metric ${i + 1}.2: Memory usage efficiency`,
            `Performance metric ${i + 1}.3: File size optimization`,
            `Performance metric ${i + 1}.4: Quality maintenance`,
            `Performance metric ${i + 1}.5: Error handling robustness`
          ]
        });
      }

      const startTime = Date.now();
      const buffer = await generateSimplePpt(slides, true, 'corporate-blue');
      const endTime = Date.now();
      
      const generationTime = endTime - startTime;
      
      expect(buffer).toBeDefined();
      expect(generationTime).toBeLessThan(30000); // Less than 30 seconds
      
      console.log(`Large presentation (25 slides) generation time: ${generationTime}ms`);
    }, 35000);
  });

  describe('File Size Optimization', () => {
    it('should generate reasonably sized files', async () => {
      const slides = [
        {
          title: 'File Size Test',
          layout: 'title',
          paragraph: 'Testing file size optimization.'
        },
        {
          title: 'Content Analysis',
          layout: 'title-bullets',
          bullets: [
            'File size should be optimized for web delivery',
            'Quality should be maintained despite compression',
            'Metadata should be efficiently stored'
          ]
        }
      ];

      const buffer = await generateSimplePpt(slides, true, 'corporate-blue');
      const fileSizeKB = buffer.length / 1024;
      
      expect(fileSizeKB).toBeGreaterThan(10); // Minimum viable size
      expect(fileSizeKB).toBeLessThan(500); // Maximum reasonable size for 2 slides
      
      console.log(`File size for 2 slides: ${fileSizeKB.toFixed(2)} KB`);
    });

    it('should scale file size linearly with content', async () => {
      const baseSizes = [];
      
      // Test with different slide counts
      for (const slideCount of [1, 5, 10]) {
        const slides = [];
        for (let i = 0; i < slideCount; i++) {
          slides.push({
            title: `Slide ${i + 1}`,
            layout: 'title-bullets',
            bullets: ['Point 1', 'Point 2', 'Point 3']
          });
        }
        
        const buffer = await generateSimplePpt(slides, true, 'corporate-blue');
        const sizeKB = buffer.length / 1024;
        baseSizes.push({ slides: slideCount, size: sizeKB });
        
        console.log(`${slideCount} slides: ${sizeKB.toFixed(2)} KB`);
      }
      
      // Check that file size scales reasonably
      expect(baseSizes[1].size).toBeGreaterThan(baseSizes[0].size);
      expect(baseSizes[2].size).toBeGreaterThan(baseSizes[1].size);
      
      // Size per slide should be reasonable (not exponential growth)
      const sizePerSlide = baseSizes[2].size / baseSizes[2].slides;
      expect(sizePerSlide).toBeLessThan(100); // Less than 100KB per slide
    }, 30000);
  });

  describe('Memory Usage', () => {
    it('should not cause memory leaks during generation', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Generate multiple presentations
      for (let i = 0; i < 5; i++) {
        const slides = [{
          title: `Memory Test ${i + 1}`,
          layout: 'title-bullets',
          bullets: ['Test 1', 'Test 2', 'Test 3']
        }];
        
        const buffer = await generateSimplePpt(slides, true, 'corporate-blue');
        expect(buffer).toBeDefined();
        
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      const memoryIncreaseMB = memoryIncrease / (1024 * 1024);
      
      console.log(`Memory increase after 5 generations: ${memoryIncreaseMB.toFixed(2)} MB`);
      
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncreaseMB).toBeLessThan(50);
    }, 30000);
  });

  describe('Enhanced Service Performance', () => {
    let enhancedService;

    beforeEach(() => {
      enhancedService = new EnhancedPowerPointService();
    });

    it('should maintain performance with all enhancements enabled', async () => {
      const slides = [
        {
          title: 'Enhanced Performance Test',
          layout: 'title',
          paragraph: 'Testing performance with all enhancements enabled.'
        },
        {
          title: 'Feature Set',
          layout: 'title-bullets',
          bullets: [
            'Speaker notes generation',
            'Metadata embedding',
            'Chart generation',
            'Table creation',
            'File optimization'
          ]
        }
      ];

      const theme = getThemeById('corporate-blue');
      const startTime = Date.now();
      
      const result = await enhancedService.generatePresentation(slides, {
        theme,
        includeNotes: true,
        includeMetadata: true,
        enableCharts: true,
        enableTables: true,
        quality: 'high',
        optimizeFileSize: true
      });
      
      const endTime = Date.now();
      const generationTime = endTime - startTime;
      
      expect(result).toBeDefined();
      expect(generationTime).toBeLessThan(10000); // Less than 10 seconds with all features
      
      console.log(`Enhanced service generation time: ${generationTime}ms`);
    }, 15000);
  });
});
