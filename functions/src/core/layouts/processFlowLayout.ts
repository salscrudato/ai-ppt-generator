/*
 * Process flow layout implementation
 */

import type pptxgen from 'pptxgenjs';
import type { SlideSpec } from '../../schema';
import { addTitle, addAccentBar, sanitizeText } from '../primitives';
import { FONT_SIZES, SPACING } from '../constants';

export function createProcessFlowLayout(slide: pptxgen.Slide, spec: SlideSpec, colors: any) {
  const title = sanitizeText(spec.title);
  
  // Add title
  addTitle(slide, title, colors);
  
  // Add accent bar
  addAccentBar(slide, colors);
  
  // Add process flow
  if (spec.processSteps && Array.isArray(spec.processSteps)) {
    const steps = spec.processSteps.slice(0, 5); // Limit to 5 steps for layout
    const stepWidth = 8 / steps.length;
    const startY = SPACING.contentY + 0.5;
    
    steps.forEach((step, index) => {
      const x = 1 + (index * stepWidth);
      const centerX = x + (stepWidth / 2);
      
      // Step box
      slide.addShape('rect', {
        x: centerX - 0.6,
        y: startY,
        w: 1.2,
        h: 0.8,
        fill: { color: colors.primary },
        line: { width: 2, color: colors.secondary },
        rectRadius: 0.1,
      });
      
      // Step number
      slide.addText(step.step.toString(), {
        x: centerX - 0.6,
        y: startY,
        w: 1.2,
        h: 0.8,
        fontSize: FONT_SIZES.subtitle,
        fontFace: 'Segoe UI',
        color: 'FFFFFF',
        align: 'center',
        valign: 'middle',
        bold: true,
      });
      
      // Step title
      slide.addText(step.title, {
        x: centerX - 0.8,
        y: startY + 1,
        w: 1.6,
        h: 0.4,
        fontSize: FONT_SIZES.small,
        fontFace: 'Segoe UI',
        color: colors.text.primary,
        align: 'center',
        valign: 'middle',
        bold: true,
      });
      
      // Step description
      if (step.description) {
        slide.addText(step.description, {
          x: centerX - 0.8,
          y: startY + 1.4,
          w: 1.6,
          h: 1.2,
          fontSize: FONT_SIZES.caption,
          fontFace: 'Segoe UI',
          color: colors.text.secondary,
          align: 'center',
          valign: 'top',
        });
      }
      
      // Arrow to next step
      if (index < steps.length - 1) {
        slide.addShape('rightArrow', {
          x: centerX + 0.7,
          y: startY + 0.3,
          w: 0.4,
          h: 0.2,
          fill: { color: colors.accent },
          line: { width: 0 },
        });
      }
    });
  }
}
