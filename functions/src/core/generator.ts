/*
 * Modular PowerPoint generator core
 * Uses layout registry and primitives for clean, maintainable generation
 */

import pptxgen from 'pptxgenjs';
import type { SlideSpec } from '../schema';
import { PROFESSIONAL_THEMES, type ProfessionalTheme } from '../professionalThemes';
import { SLIDE } from './constants';
import { createLayout, LAYOUT_REGISTRY } from './layouts';
import { buildSpeakerNotes } from './primitives';

export interface GeneratorOptions {
  includeMetadata?: boolean;
  includeSpeakerNotes?: boolean;
  optimizeFileSize?: boolean;
  author?: string;
  company?: string;
  subject?: string;
}

export async function generatePresentation(
  slides: SlideSpec[],
  themeId?: string,
  options: GeneratorOptions = {}
): Promise<Buffer> {
  const pres = new pptxgen();
  
  // Set slide dimensions (16:9)
  pres.defineLayout({ name: 'LAYOUT_16x9', width: SLIDE.width, height: SLIDE.height });
  pres.layout = 'LAYOUT_16x9';
  
  // Get theme
  const theme = getTheme(themeId);
  const colors = theme.colors;
  
  // Set presentation properties
  if (options.includeMetadata) {
    pres.author = options.author || 'AI PowerPoint Generator';
    pres.company = options.company || 'Professional Presentations';
    pres.subject = options.subject || 'Generated Presentation';
    pres.title = slides[0]?.title || 'Presentation';
  }
  
  // Generate slides
  for (const slideSpec of slides) {
    const slide = pres.addSlide();
    
    try {
      // Apply layout
      createLayout(slideSpec.layout, slide, slideSpec, colors);
      
      // Add speaker notes if enabled
      if (options.includeSpeakerNotes) {
        const notes = buildSpeakerNotes(slideSpec);
        slide.addNotes(notes);
      }
    } catch (error) {
      console.error(`Error creating slide with layout ${slideSpec.layout}:`, error);
      
      // Fallback: create a simple error slide
      slide.addText(`Error: Could not create slide "${slideSpec.title}"`, {
        x: 1,
        y: 2,
        w: 8,
        h: 2,
        fontSize: 18,
        fontFace: 'Segoe UI',
        color: colors.text.primary,
        align: 'center',
        valign: 'middle',
      });
    }
  }
  
  // Generate buffer
  const buffer = await pres.write({
    outputType: 'nodebuffer',
    compression: options.optimizeFileSize ? true : false,
  }) as Buffer;
  
  // Validate buffer
  if (!buffer || buffer.length < 1000) {
    throw new Error('Generated PowerPoint buffer is too small or empty');
  }
  
  // Check ZIP signature
  const zipSignature = buffer.subarray(0, 4);
  const expectedSignature = Buffer.from([0x50, 0x4B, 0x03, 0x04]);
  if (!zipSignature.equals(expectedSignature)) {
    throw new Error('Generated PowerPoint does not have valid ZIP signature');
  }
  
  return buffer;
}

function getTheme(themeId?: string): ProfessionalTheme {
  if (!themeId) return PROFESSIONAL_THEMES[0];
  return PROFESSIONAL_THEMES.find(t => t.id === themeId) || PROFESSIONAL_THEMES[0];
}

// Export supported layouts for validation
export const SUPPORTED_LAYOUTS = Object.keys(LAYOUT_REGISTRY);
