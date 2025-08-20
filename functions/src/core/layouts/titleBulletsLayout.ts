/*
 * Title + Bullets layout implementation
 */

import type pptxgen from 'pptxgenjs';
import type { SlideSpec } from '../../schema';
import { addTitle, addBullets, addAccentBar, sanitizeText, sanitizeBullets } from '../primitives';
import { SPACING } from '../constants';

export function createTitleBulletsLayout(slide: pptxgen.Slide, spec: SlideSpec, colors: any) {
  const title = sanitizeText(spec.title);
  const bullets = sanitizeBullets(spec.bullets);
  
  // Add title
  addTitle(slide, title, colors);
  
  // Add accent bar
  addAccentBar(slide, colors);
  
  // Add bullets
  if (bullets.length > 0) {
    addBullets(slide, bullets, colors, {
      y: SPACING.contentY,
      h: 3.5,
    });
  }
}
