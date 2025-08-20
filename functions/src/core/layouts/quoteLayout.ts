/*
 * Quote layout implementation
 */

import type pptxgen from 'pptxgenjs';
import type { SlideSpec } from '../../schema';
import { addTitle, addAccentBar, sanitizeText } from '../primitives';
import { FONT_SIZES } from '../constants';

export function createQuoteLayout(slide: pptxgen.Slide, spec: SlideSpec, colors: any) {
  const title = sanitizeText(spec.title);
  const quote = sanitizeText(spec.quote);
  const author = sanitizeText(spec.author);
  
  // Add title
  addTitle(slide, title, colors);
  
  // Add accent bar
  addAccentBar(slide, colors);
  
  // Add quote text
  if (quote) {
    slide.addText(`"${quote}"`, {
      x: 1,
      y: 2,
      w: 8,
      h: 2.5,
      fontSize: FONT_SIZES.subtitle,
      fontFace: 'Segoe UI',
      color: colors.text.primary,
      align: 'center',
      valign: 'middle',
      italic: true,
    });
  }
  
  // Add author attribution
  if (author) {
    slide.addText(`— ${author}`, {
      x: 1,
      y: 4.5,
      w: 8,
      h: 0.8,
      fontSize: FONT_SIZES.body,
      fontFace: 'Segoe UI',
      color: colors.text.secondary,
      align: 'center',
      valign: 'middle',
    });
  }
}
