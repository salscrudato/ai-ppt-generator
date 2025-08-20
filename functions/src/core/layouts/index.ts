/*
 * Layout registry and factory
 * Central export for all layout implementations
 */

import type pptxgen from 'pptxgenjs';
import type { SlideSpec } from '../../schema';

// Layout implementations
import { createTitleLayout } from './titleLayout';
import { createTitleBulletsLayout } from './titleBulletsLayout';
import { createTitleParagraphLayout } from './titleParagraphLayout';
import { createTwoColumnLayout } from './twoColumnLayout';
import { createChartLayout } from './chartLayout';
import { createImageLeftLayout, createImageRightLayout, createImageFullLayout } from './imageLayout';
import { createQuoteLayout } from './quoteLayout';
import { createComparisonTableLayout } from './tableLayout';
import { createTimelineLayout } from './timelineLayout';
import { createProcessFlowLayout } from './processFlowLayout';

export type LayoutFunction = (slide: pptxgen.Slide, spec: SlideSpec, colors: any) => void;

export const LAYOUT_REGISTRY: Record<string, LayoutFunction> = {
  'title': createTitleLayout,
  'title-bullets': createTitleBulletsLayout,
  'title-paragraph': createTitleParagraphLayout,
  'two-column': createTwoColumnLayout,
  'chart': createChartLayout,
  'image-left': createImageLeftLayout,
  'image-right': createImageRightLayout,
  'image-full': createImageFullLayout,
  'quote': createQuoteLayout,
  'comparison-table': createComparisonTableLayout,
  'timeline': createTimelineLayout,
  'process-flow': createProcessFlowLayout,
};

export function createLayout(layout: string, slide: pptxgen.Slide, spec: SlideSpec, colors: any) {
  const layoutFn = LAYOUT_REGISTRY[layout];
  if (!layoutFn) {
    throw new Error(`Unknown layout: ${layout}`);
  }
  layoutFn(slide, spec, colors);
}

// Re-export individual layouts for direct use
export {
  createTitleLayout,
  createTitleBulletsLayout,
  createTitleParagraphLayout,
  createTwoColumnLayout,
  createChartLayout,
  createImageLeftLayout,
  createImageRightLayout,
  createImageFullLayout,
  createQuoteLayout,
  createComparisonTableLayout,
  createTimelineLayout,
  createProcessFlowLayout,
};
