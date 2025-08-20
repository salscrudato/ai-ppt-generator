/*
 * Title + Paragraph layout implementation
 */

import type pptxgen from 'pptxgenjs';
import type { SlideSpec } from '../../schema';
import { addTitle, addParagraph, addAccentBar, sanitizeText } from '../primitives';

export function createTitleParagraphLayout(slide: pptxgen.Slide, spec: SlideSpec, colors: any) {
  const title = sanitizeText(spec.title);
  const paragraph = sanitizeText(spec.paragraph);
  
  // Add title
  addTitle(slide, title, colors);
  
  // Add accent bar
  addAccentBar(slide, colors);
  
  // Add paragraph
  if (paragraph) {
    addParagraph(slide, paragraph, colors);
  }
}
