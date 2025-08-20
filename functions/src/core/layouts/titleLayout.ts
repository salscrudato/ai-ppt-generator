/*
 * Title layout implementation
 * Simple title-only slide
 */

import type pptxgen from 'pptxgenjs';
import type { SlideSpec } from '../../schema';
import { addTitle, addAccentBar, sanitizeText } from '../primitives';

export function createTitleLayout(slide: pptxgen.Slide, spec: SlideSpec, colors: any) {
  const title = sanitizeText(spec.title);
  
  // Add title
  addTitle(slide, title, colors, {
    x: 0.5,
    y: 2,
    w: 9,
    h: 1.5,
    fontSize: 36,
    align: 'center',
    valign: 'middle',
  });
  
  // Add accent bar below title
  addAccentBar(slide, colors, {
    x: 4,
    y: 3.8,
    w: 2,
    h: 0.1,
  });
}
