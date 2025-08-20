/*
 * Image layouts (image-left, image-right, image-full)
 */

import type pptxgen from 'pptxgenjs';
import type { SlideSpec } from '../../schema';
import { addTitle, addParagraph, addBullets, addAccentBar, sanitizeText, sanitizeBullets } from '../primitives';
import { SPACING, IMAGE_DEFAULTS } from '../constants';

export function createImageRightLayout(slide: pptxgen.Slide, spec: SlideSpec, colors: any) {
  const title = sanitizeText(spec.title);
  
  // Add title
  addTitle(slide, title, colors);
  
  // Add accent bar
  addAccentBar(slide, colors);
  
  // Add image placeholder on the right
  addImagePlaceholder(slide, {
    x: 5.5,
    y: SPACING.contentY,
    w: IMAGE_DEFAULTS.placeholder.width,
    h: IMAGE_DEFAULTS.placeholder.height,
    colors,
    imagePrompt: (spec as any).imagePrompt,
    generatedImageUrl: (spec as any).generatedImageUrl || spec.imageUrl,
    generatedImageData: (spec as any).generatedImageData,
  });
  
  // Add content on the left
  const bullets = sanitizeBullets(spec.bullets);
  const paragraph = sanitizeText(spec.paragraph);
  
  if (bullets.length > 0) {
    addBullets(slide, bullets, colors, {
      x: 0.5,
      y: SPACING.contentY,
      w: 4.5,
      h: 3.5,
    });
  } else if (paragraph) {
    addParagraph(slide, paragraph, colors, {
      x: 0.5,
      y: SPACING.contentY,
      w: 4.5,
      h: 3.5,
    });
  }
}

export function createImageLeftLayout(slide: pptxgen.Slide, spec: SlideSpec, colors: any) {
  const title = sanitizeText(spec.title);
  
  // Add title
  addTitle(slide, title, colors);
  
  // Add accent bar
  addAccentBar(slide, colors);
  
  // Add image placeholder on the left
  addImagePlaceholder(slide, {
    x: 0.5,
    y: SPACING.contentY,
    w: IMAGE_DEFAULTS.placeholder.width,
    h: IMAGE_DEFAULTS.placeholder.height,
    colors,
    imagePrompt: (spec as any).imagePrompt,
    generatedImageUrl: (spec as any).generatedImageUrl || spec.imageUrl,
    generatedImageData: (spec as any).generatedImageData,
  });
  
  // Add content on the right
  const bullets = sanitizeBullets(spec.bullets);
  const paragraph = sanitizeText(spec.paragraph);
  
  if (bullets.length > 0) {
    addBullets(slide, bullets, colors, {
      x: 5,
      y: SPACING.contentY,
      w: 4.5,
      h: 3.5,
    });
  } else if (paragraph) {
    addParagraph(slide, paragraph, colors, {
      x: 5,
      y: SPACING.contentY,
      w: 4.5,
      h: 3.5,
    });
  }
}

export function createImageFullLayout(slide: pptxgen.Slide, spec: SlideSpec, colors: any) {
  const title = sanitizeText(spec.title);
  
  // Add full-screen image
  addImagePlaceholder(slide, {
    x: 0,
    y: 0,
    w: IMAGE_DEFAULTS.fullscreen.width,
    h: IMAGE_DEFAULTS.fullscreen.height,
    colors,
    imagePrompt: (spec as any).imagePrompt,
    generatedImageUrl: (spec as any).generatedImageUrl || spec.imageUrl,
    generatedImageData: (spec as any).generatedImageData,
    isFullScreen: true,
  });
  
  // Add semi-transparent overlay for text readability
  slide.addShape('rect', {
    x: 0,
    y: 0,
    w: IMAGE_DEFAULTS.fullscreen.width,
    h: 1.5,
    fill: { color: '000000', transparency: 40 },
    line: { width: 0 },
  });
  
  // Add title over image
  slide.addText(title, {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 1,
    fontSize: 32,
    fontFace: 'Segoe UI',
    color: 'FFFFFF',
    bold: true,
    align: 'center',
    valign: 'middle',
  });
}

function addImagePlaceholder(slide: pptxgen.Slide, options: {
  x: number;
  y: number;
  w: number;
  h: number;
  colors: any;
  imagePrompt?: string;
  generatedImageUrl?: string;
  generatedImageData?: string;
  isFullScreen?: boolean;
}) {
  const { x, y, w, h, colors, imagePrompt, generatedImageUrl, generatedImageData, isFullScreen = false } = options;

  if (generatedImageUrl || generatedImageData) {
    try {
      const imageOpts: any = {
        x,
        y,
        w,
        h,
        sizing: { type: 'cover', w, h },
      };
      if (generatedImageData) {
        imageOpts.data = generatedImageData;
      } else if (generatedImageUrl) {
        imageOpts.path = generatedImageUrl;
      }
      slide.addImage(imageOpts);
      return;
    } catch (error) {
      console.warn('Failed to add image, using placeholder:', error);
    }
  }

  // Fallback: placeholder rectangle
  slide.addShape('rect', {
    x,
    y,
    w,
    h,
    fill: { color: colors.surface || 'F8F9FA' },
    line: { width: 2, color: colors.secondary },
  });

  // Placeholder text
  const placeholderText = imagePrompt ? `Image: ${imagePrompt}` : 'Image Placeholder';
  slide.addText(placeholderText, {
    x,
    y: y + h / 2 - 0.3,
    w,
    h: 0.6,
    fontSize: 14,
    fontFace: 'Segoe UI',
    color: colors.text.secondary,
    align: 'center',
    valign: 'middle',
  });
}
