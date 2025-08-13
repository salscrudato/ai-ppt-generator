/**
 * Minimal PowerPoint Generator - Corruption-Free Version
 * 
 * This is a simplified version that removes all potentially problematic features
 * that could cause PowerPoint file corruption.
 */

import pptxgen from 'pptxgenjs';
import { SlideSpec } from './schema';
import { getThemeById, getDefaultTheme, ProfessionalTheme } from './professionalThemes';

/**
 * Generate a PowerPoint file buffer from slide specifications
 * Minimal version with only essential features to prevent corruption
 */
export async function generatePptMinimal(specs: SlideSpec[]): Promise<Buffer> {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE';

  for (const spec of specs) {
    const slide = pres.addSlide();
    const themeName = spec.design?.theme || 'corporate-blue';
    const theme = getThemeById(themeName) || getDefaultTheme();

    // No custom background - use default white
    // slide.background = {
    //   color: theme.colors.background.replace('#', '')
    // };

    // Ultra-simple title with absolute minimal properties
    slide.addText(spec.title, {
      x: 0.5, y: 0.5, w: 9.0, h: 1.0,
      fontSize: 24,
      bold: true,
      color: '1E40AF', // Hard-coded blue color without theme
      align: 'center'
    });

    // Simple content based on layout
    const contentY = 2.0;
    
    switch (spec.layout) {
      case 'title':
        // Title only - no additional content
        break;
        
      case 'title-bullets':
        if (spec.bullets) {
          addSimpleBullets(slide, spec.bullets, theme, 1.0, contentY, 8.0);
        }
        break;
        
      case 'title-paragraph':
        if (spec.paragraph) {
          addSimpleParagraph(slide, spec.paragraph, theme, 1.0, contentY, 8.0);
        }
        break;
        
      case 'two-column':
        if (spec.left?.bullets) {
          addSimpleBullets(slide, spec.left.bullets, theme, 0.5, contentY, 4.0);
        }
        if (spec.right?.bullets) {
          addSimpleBullets(slide, spec.right.bullets, theme, 5.5, contentY, 4.0);
        }
        break;
        
      default:
        // Fallback to basic content
        if (spec.bullets) {
          addSimpleBullets(slide, spec.bullets, theme, 1.0, contentY, 8.0);
        } else if (spec.paragraph) {
          addSimpleParagraph(slide, spec.paragraph, theme, 1.0, contentY, 8.0);
        }
        break;
    }

    // Simple notes
    if (spec.notes) {
      slide.addNotes(spec.notes);
    }
  }

  return await pres.write({ outputType: 'nodebuffer' }) as Buffer;
}

/**
 * Add simple bullet points without complex formatting
 */
function addSimpleBullets(slide: pptxgen.Slide, bullets: string[], theme: ProfessionalTheme, x: number, y: number, w: number) {
  bullets.forEach((bullet, i) => {
    slide.addText(bullet, {
      x, y: y + i * 0.4, w, h: 0.4,
      fontSize: 14,
      bullet: true,
      color: '374151', // Hard-coded gray color
      align: 'left'
    });
  });
}

/**
 * Add simple paragraph without complex formatting
 */
function addSimpleParagraph(slide: pptxgen.Slide, text: string, theme: ProfessionalTheme, x: number, y: number, w: number) {
  slide.addText(text, {
    x, y, w, h: 2.0,
    fontSize: 14,
    color: '374151', // Hard-coded gray color
    align: 'left'
  });
}
