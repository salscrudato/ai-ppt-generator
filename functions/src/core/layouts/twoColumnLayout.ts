/*
 * Two-column layout implementation
 */

import type pptxgen from 'pptxgenjs';
import type { SlideSpec } from '../../schema';
import { addTitle, addCard, addAccentBar, sanitizeText } from '../primitives';
import { SPACING } from '../constants';

export function createTwoColumnLayout(slide: pptxgen.Slide, spec: SlideSpec, colors: any) {
  const title = sanitizeText(spec.title);
  
  // Add title
  addTitle(slide, title, colors);
  
  // Add accent bar
  addAccentBar(slide, colors);
  
  // Left column
  if (spec.left) {
    addCard(slide, {
      title: spec.left.heading,
      text: spec.left.paragraph,
      bullets: spec.left.bullets,
    }, colors, {
      x: 0.5,
      y: SPACING.contentY,
      w: SPACING.columnWidth,
      h: 3.5,
    });
  }
  
  // Right column
  if (spec.right) {
    addCard(slide, {
      title: spec.right.heading,
      text: spec.right.paragraph,
      bullets: spec.right.bullets,
    }, colors, {
      x: 0.5 + SPACING.columnWidth + SPACING.gap,
      y: SPACING.contentY,
      w: SPACING.columnWidth,
      h: 3.5,
    });
  }
}
