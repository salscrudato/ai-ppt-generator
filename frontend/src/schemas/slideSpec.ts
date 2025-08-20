import { z } from 'zod';
import type { SlideSpec } from '../types';

// Frontend Zod schema mirroring backend essentials for client-side validation
// Keep conservative and focused on UX guidance rather than rejecting on minor issues

// Supported layouts aligned with backend generator and editor usage
export const SupportedLayouts = z.enum([
  'title',
  'title-bullets',
  'title-paragraph',
  'bullets',
  'paragraph',
  'two-column',
  'image-right',
  'image-left',
  'image-full',
  'chart',
  'comparison-table',
  'timeline',
  'process-flow',
  'quote',
  'mixed-content',
  'problem-solution',
]);

const ShortText = z.string().trim().min(1).max(160);
const LongText = z.string().trim().min(1).max(800);

const ColumnContentSchema = z.object({
  heading: z.string().max(160).optional(),
  paragraph: z.string().max(800).optional(),
  bullets: z.array(z.string().max(160)).max(10).optional(),
  imagePrompt: z.string().max(200).optional(),
  generateImage: z.boolean().optional(),
});

const ChartSchema = z.object({
  type: z.enum(['bar', 'line', 'pie']).default('bar'),
  title: z.string().max(120).optional(),
  categories: z.array(z.string().max(80)).optional().default([]),
  series: z
    .array(
      z.object({
        name: z.string().max(60).default('Series'),
        data: z.array(z.number()).default([]),
      })
    )
    .optional()
    .default([]),
});

const TableSchema = z.object({
  headers: z.array(z.string().max(80)).max(8).optional(),
  rows: z.array(z.array(z.string().max(120))).max(20).optional(),
});

const TimelineItemSchema = z.object({
  date: z.string().max(50).optional(),
  title: z.string().max(120).optional(),
  description: z.string().max(300).optional(),
  milestone: z.boolean().optional(),
});

const ProcessStepSchema = z.object({
  title: z.string().max(120).optional(),
  description: z.string().max(300).optional(),
});

export const FrontendSlideSpecSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1, 'Title is required').max(120, 'Title must be 120 characters or less'),
  subtitle: z.string().max(160).optional(),
  layout: SupportedLayouts.default('title-bullets'),
  bullets: z.array(ShortText).max(10, 'Maximum 10 bullet points').optional(),
  paragraph: z.string().max(800).optional(),
  chart: ChartSchema.optional(),
  table: TableSchema.optional(),
  left: ColumnContentSchema.optional(),
  right: ColumnContentSchema.optional(),
  timeline: z.array(TimelineItemSchema).max(10).optional(),
  processSteps: z.array(ProcessStepSchema).max(8).optional(),
  comparisonTable: z.object({
    headers: z.array(z.string().max(40)).max(6).optional(),
    rows: z.array(z.array(z.string().max(80))).max(20).optional(),
  }).optional(),
  notes: z.string().max(2000).optional(),
  sources: z.array(z.string().max(120)).max(10).optional(),
  design: z.any().optional(),
  accessibility: z.any().optional(),
});

export type FrontendSlideSpec = z.infer<typeof FrontendSlideSpecSchema>;

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Validate and also derive warnings useful for UX
export function validateSlideSpec(spec: SlideSpec): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const parse = FrontendSlideSpecSchema.safeParse(spec as any);
  if (!parse.success) {
    for (const issue of parse.error.issues) {
      errors.push(issue.message);
    }
  }

  // Heuristic warnings to guide better slides (non-blocking)
  if (spec.bullets && spec.bullets.length > 7) {
    warnings.push('Consider reducing bullet points to 5–7 for better readability');
  }
  if ((spec.paragraph?.length || 0) > 600) {
    warnings.push('Paragraph is quite long; consider concise phrasing');
  }
  if (spec.layout === 'two-column' && !spec.left && !spec.right) {
    errors.push('Two-column layout requires left or right content');
  }
  if (spec.layout === 'chart') {
    const hasData = !!(spec.chart && spec.chart.series && spec.chart.series.length > 0);
    if (!hasData && !(spec.bullets && spec.bullets.length)) {
      warnings.push('Chart layout works best with series data or bullets to parse');
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
}

