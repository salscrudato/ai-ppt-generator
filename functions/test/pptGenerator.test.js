/**
 * Focused Unit Test for pptGenerator.generatePpt
 * - Verifies PPTX buffer generation for common layouts
 * - Avoids external modules/network by mocking pptxgenjs, OpenAI, and secrets
 */

const { describe, it, expect } = require('@jest/globals');

// Mock Firebase secret
jest.mock('firebase-functions/params', () => ({
  defineSecret: jest.fn(() => ({ value: () => 'test-openai-key' }))
}));

// Mock OpenAI images
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    images: {
      generate: jest.fn().mockResolvedValue({ data: [{ b64_json: null }] }) // force placeholder path
    }
  }));
});

// Mock pptxgenjs to avoid dynamic import/vm-modules
jest.mock('pptxgenjs', () => {
  return jest.fn().mockImplementation(() => {
    const slides = [];
    return {
      layout: 'LAYOUT_WIDE',
      addSlide: () => {
        const slide = {
          background: undefined,
          addText: jest.fn(),
          addImage: jest.fn().mockResolvedValue(undefined),
          addNotes: jest.fn()
        };
        slides.push(slide);
        return slide;
      },
      write: jest.fn().mockResolvedValue(Buffer.from('504b0304', 'hex')) // 'PK\x03\x04'
    };
  });
});

// Load compiled generator AFTER mocks
const { generatePpt } = require('../lib/pptGenerator');

function isPptxBuffer(buf) {
  // PPTX is a zip: starts with 'PK' signature
  return Buffer.isBuffer(buf) && buf.length > 0 && buf[0] === 0x50 && buf[1] === 0x4b;
}

describe('pptGenerator.generatePpt', () => {
  it('generates a PPTX buffer for a minimal title slide', async () => {
    const slides = [
      { title: 'Professional Title', layout: 'title', design: { theme: 'corporate-blue' } }
    ];

    const buf = await generatePpt(slides, true);
    expect(isPptxBuffer(buf)).toBe(true);
  });

  it('generates a PPTX with multiple layouts and no external images', async () => {
    const slides = [
      { title: 'Overview', layout: 'title-paragraph', paragraph: 'Executive summary with key points.', design: { theme: 'platinum-elegance' } },
      { title: 'Highlights', layout: 'title-bullets', bullets: ['Growth 18% YoY', 'CAC down 22%', 'NPS 64'], design: { theme: 'tech-gradient' } },
      { title: 'Two Column', layout: 'two-column', left: { heading: 'Problem', bullets: ['Manual ops', 'High costs'] }, right: { heading: 'Solution', bullets: ['Automation', 'Optimization'] }, design: { theme: 'forest-modern' } }
    ];

    const buf = await generatePpt(slides, true);
    expect(isPptxBuffer(buf)).toBe(true);
  });
});

