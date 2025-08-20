/*
 * Timeline layout implementation
 */

import type pptxgen from 'pptxgenjs';
import type { SlideSpec } from '../../schema';
import { addTitle, addAccentBar, sanitizeText } from '../primitives';
import { FONT_SIZES, SPACING } from '../constants';

export function createTimelineLayout(slide: pptxgen.Slide, spec: SlideSpec, colors: any) {
  const title = sanitizeText(spec.title);
  
  // Add title
  addTitle(slide, title, colors);
  
  // Add accent bar
  addAccentBar(slide, colors);
  
  // Add timeline
  if (spec.timeline && Array.isArray(spec.timeline)) {
    const items = spec.timeline.slice(0, 6); // Limit to 6 items for layout
    const itemWidth = 8 / items.length;
    const startY = SPACING.contentY + 0.5;
    
    // Draw timeline line
    slide.addShape('line', {
      x: 1,
      y: startY,
      w: 8,
      h: 0,
      line: { width: 3, color: colors.accent },
    });
    
    // Add timeline items
    items.forEach((item, index) => {
      const x = 1 + (index * itemWidth) + (itemWidth / 2) - 0.5;
      
      // Timeline dot
      slide.addShape('ellipse' as any, {
        x: x + 0.4,
        y: startY - 0.1,
        w: 0.2,
        h: 0.2,
        fill: { color: item.milestone ? colors.primary : colors.secondary },
        line: { width: 0 },
      });
      
      // Date
      slide.addText(item.date, {
        x,
        y: startY - 0.8,
        w: 1,
        h: 0.4,
        fontSize: FONT_SIZES.small,
        fontFace: 'Segoe UI',
        color: colors.text.secondary,
        align: 'center',
        valign: 'middle',
        bold: true,
      });
      
      // Title
      slide.addText(item.title, {
        x,
        y: startY + 0.3,
        w: 1,
        h: 0.4,
        fontSize: FONT_SIZES.small,
        fontFace: 'Segoe UI',
        color: colors.text.primary,
        align: 'center',
        valign: 'top',
        bold: true,
      });
      
      // Description
      if (item.description) {
        slide.addText(item.description, {
          x,
          y: startY + 0.7,
          w: 1,
          h: 1.2,
          fontSize: FONT_SIZES.caption,
          fontFace: 'Segoe UI',
          color: colors.text.secondary,
          align: 'center',
          valign: 'top',
        });
      }
    });
  }
}
