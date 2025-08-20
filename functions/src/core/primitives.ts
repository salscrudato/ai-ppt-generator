/*
 * Core primitives for PowerPoint slide construction
 * Reusable building blocks extracted from pptGenerator-simple.ts
 */

import type pptxgen from 'pptxgenjs';
import { FONT_SIZES, SPACING } from './constants';

export interface TextOptions {
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize?: number;
  fontFace?: string;
  color?: string;
  bold?: boolean;
  align?: 'left' | 'center' | 'right';
  valign?: 'top' | 'middle' | 'bottom';
}

export interface BulletOptions extends TextOptions {
  bullets: string[];
  bulletColor?: string;
  indent?: number;
}

export function addTitle(slide: pptxgen.Slide, text: string, colors: any, options: Partial<TextOptions> = {}) {
  const opts: TextOptions = {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 1,
    fontSize: FONT_SIZES.title,
    fontFace: 'Segoe UI',
    color: colors.text.primary,
    bold: true,
    align: 'left',
    valign: 'middle',
    ...options,
  };

  slide.addText(text, opts);
}

export function addParagraph(slide: pptxgen.Slide, text: string, colors: any, options: Partial<TextOptions> = {}) {
  const opts: TextOptions = {
    x: 0.5,
    y: SPACING.contentY,
    w: 9,
    h: 3,
    fontSize: FONT_SIZES.body,
    fontFace: 'Segoe UI',
    color: colors.text.primary,
    align: 'left',
    valign: 'top',
    ...options,
  };

  slide.addText(text, opts);
}

export function addBullets(slide: pptxgen.Slide, bullets: string[], colors: any, options: Partial<BulletOptions> = {}) {
  const opts: BulletOptions = {
    x: 0.5,
    y: SPACING.contentY,
    w: 9,
    h: 3.5,
    fontSize: FONT_SIZES.body,
    fontFace: 'Segoe UI',
    color: colors.text.primary,
    align: 'left',
    valign: 'top',
    bullets,
    bulletColor: colors.accent,
    indent: SPACING.bulletIndent,
    ...options,
  };

  slide.addText(opts.bullets.map(b => ({ text: b, options: { bullet: true, indentLevel: 0 } })), {
    x: opts.x,
    y: opts.y,
    w: opts.w,
    h: opts.h,
    fontSize: opts.fontSize,
    fontFace: opts.fontFace,
    color: opts.color,
    align: opts.align,
    valign: opts.valign,
  });
}

export function addAccentBar(slide: pptxgen.Slide, colors: any, options: { x?: number; y?: number; w?: number; h?: number } = {}) {
  const opts = {
    x: 0.5,
    y: 1.2,
    w: 2,
    h: 0.1,
    ...options,
  };

  slide.addShape('rect', {
    x: opts.x,
    y: opts.y,
    w: opts.w,
    h: opts.h,
    fill: { color: colors.accent },
    line: { width: 0 },
  });
}

export function addCard(slide: pptxgen.Slide, content: { title?: string; text?: string; bullets?: string[] }, colors: any, options: Partial<TextOptions> = {}) {
  const opts: TextOptions = {
    x: 0.5,
    y: 1.5,
    w: 4,
    h: 3,
    fontSize: FONT_SIZES.body,
    fontFace: 'Segoe UI',
    color: colors.text.primary,
    align: 'left',
    valign: 'top',
    ...options,
  };

  // Card background
  slide.addShape('rect', {
    x: opts.x - 0.1,
    y: opts.y - 0.1,
    w: opts.w + 0.2,
    h: opts.h + 0.2,
    fill: { color: colors.background },
    line: { width: 1, color: colors.border || colors.secondary },
    rectRadius: 0.1,
  });

  let currentY = opts.y + 0.2;

  if (content.title) {
    slide.addText(content.title, {
      x: opts.x + 0.1,
      y: currentY,
      w: opts.w - 0.2,
      h: 0.6,
      fontSize: FONT_SIZES.subtitle,
      fontFace: opts.fontFace,
      color: opts.color,
      bold: true,
      align: opts.align,
    });
    currentY += 0.7;
  }

  if (content.text) {
    slide.addText(content.text, {
      x: opts.x + 0.1,
      y: currentY,
      w: opts.w - 0.2,
      h: opts.h - (currentY - opts.y) - 0.2,
      fontSize: opts.fontSize,
      fontFace: opts.fontFace,
      color: opts.color,
      align: opts.align,
      valign: 'top',
    });
  }

  if (content.bullets && content.bullets.length > 0) {
    const bulletText = content.bullets.map(b => ({ text: b, options: { bullet: true, indentLevel: 0 } }));
    slide.addText(bulletText, {
      x: opts.x + 0.1,
      y: currentY,
      w: opts.w - 0.2,
      h: opts.h - (currentY - opts.y) - 0.2,
      fontSize: opts.fontSize,
      fontFace: opts.fontFace,
      color: opts.color,
      align: opts.align,
      valign: 'top',
    });
  }
}

export function sanitizeText(text: string | undefined, maxLength = 500): string {
  if (!text) return '';
  return text.replace(/[^\w\s\-.,!?()]/g, '').substring(0, maxLength);
}

export function sanitizeBullets(bullets: string[] | undefined, maxBullets = 8, maxLength = 100): string[] {
  if (!bullets || !Array.isArray(bullets)) return [];
  return bullets
    .slice(0, maxBullets)
    .map(b => sanitizeText(b, maxLength))
    .filter(b => b.length > 0);
}

export function buildSpeakerNotes(spec: any): string {
  if (spec.notes) return spec.notes;

  let notes = `Slide: ${spec.title || 'Untitled'}\n\n`;

  if (spec.paragraph) {
    notes += `Key message: ${spec.paragraph}\n\n`;
  }

  if (spec.bullets && spec.bullets.length > 0) {
    notes += 'Key points:\n';
    spec.bullets.forEach((bullet: string, i: number) => {
      notes += `${i + 1}. ${bullet}\n`;
    });
    notes += '\n';
  }

  if (spec.chart) {
    notes += `Chart: ${spec.chart.title || 'Data visualization'}\n`;
    notes += 'Highlight key trends and insights from the data.\n\n';
  }

  notes += 'Speaking tips:\n';
  notes += '- Pause after the title to let the audience read\n';
  notes += '- Use gestures to emphasize key points\n';
  notes += '- Ask for questions if appropriate\n';

  return notes;
}
