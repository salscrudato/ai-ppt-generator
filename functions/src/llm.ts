/**
 * Enhanced AI Language Model Service for Chained Slide Generation
 *
 * Innovative multi-step AI processing for superior slide quality:
 * - Step 1: Generate core content focused on persuasion and clarity
 * - Step 2: Refine layout for optimal UX and visual flow
 * - Step 3: Generate/refine image prompts for emotional impact (if enabled)
 * - Step 4: Final validation and styling refinement
 * - Robust error handling, retries, and performance monitoring
 *
 * @version 3.2.0-enhanced
 * @author AI PowerPoint Generator Team
 * (enhanced by expert co-pilot)
 */

/* eslint-disable no-console */

import OpenAI from 'openai';

/* =========================================================================================
 * SECTION: Types & Schema (inline drop-in replacement for ./schema)
 * =======================================================================================*/

export type Emphasis = 'normal' | 'bold' | 'italic' | 'highlight';
export type LayoutType =
  | 'title'
  | 'title-bullets'
  | 'title-paragraph'
  | 'two-column'
  | 'image-right'
  | 'image-left'
  | 'quote'
  | 'chart'
  | 'timeline'
  | 'process-flow'
  | 'comparison-table'
  | 'before-after'
  | 'problem-solution'
  | 'mixed-content'
  | 'metrics-dashboard'
  | 'thank-you';

export type ChartType = 'bar' | 'line' | 'pie';

export interface SlideSide {
  title?: string;
  bullets?: string[];
  paragraph?: string;
}

export interface ContentItem {
  type: 'text' | 'bullet' | 'number' | 'icon' | 'metric';
  content: string;
  emphasis?: Emphasis;
  color?: string; // hex
  iconName?: string;
}

export interface ChartSpec {
  type: ChartType;
  categories: string[];
  series: Array<{ name: string; data: number[] }>;
}

export interface TimelineItem {
  date: string; // freeform date label
  title: string;
  description?: string;
  milestone?: boolean;
}

export interface ComparisonTable {
  columns: string[];
  rows: string[][];
}

export interface ProcessStep {
  title: string;
  description?: string;
}

export interface DesignHints {
  theme?: string;
  accentColor?: string; // hex
  backgroundStyle?: string;
  imageStyle?: 'photo' | 'illustration' | 'isometric';
}

export interface SlideSpec {
  title: string;
  layout: LayoutType;
  bullets?: string[];
  paragraph?: string;
  left?: SlideSide;
  right?: SlideSide;
  contentItems?: ContentItem[];
  imagePrompt?: string;
  notes?: string;
  sources?: string[];
  chart?: ChartSpec;
  timeline?: TimelineItem[];
  comparisonTable?: ComparisonTable;
  processSteps?: ProcessStep[];
  design?: DesignHints;
}

export type Tone = 'professional' | 'casual' | 'friendly' | 'executive' | 'technical';
export type ContentLength = 'short' | 'medium' | 'long';

export interface GenerationParams {
  prompt: string;
  audience?: string;
  tone?: Tone;
  contentLength?: ContentLength;
  withImage?: boolean;
  brand?: {
    primaryColor?: string; // hex
    secondaryColor?: string; // hex
    font?: string;
    logoUrl?: string;
  };
  language?: string; // e.g., "en", "es"
  mode?: 'test' | 'production';
}

/** Validation result structure (drop-in replacement for safeValidateSlideSpec) */
export function safeValidateSlideSpec(
  data: any
): { success: true; data: SlideSpec } | { success: false; errors: string[] } {
  const errors: string[] = [];
  const validLayouts: LayoutType[] = [
    'title',
    'title-bullets',
    'title-paragraph',
    'two-column',
    'image-right',
    'image-left',
    'quote',
    'chart',
    'timeline',
    'process-flow',
    'comparison-table',
    'before-after',
    'problem-solution',
    'mixed-content',
    'metrics-dashboard',
    'thank-you'
  ];

  const isHex = (s: any) => typeof s === 'string' && /^#[0-9a-fA-F]{6}$/.test(s);

  const isString = (v: any) => typeof v === 'string' && v.trim().length > 0;
  const isStrArr = (a: any) => Array.isArray(a) && a.every((v) => typeof v === 'string');
  const ensureOnlyAllowedKeys = (obj: any, allowed: string[], label: string) => {
    if (!obj || typeof obj !== 'object') return;
    for (const k of Object.keys(obj)) {
      if (!allowed.includes(k)) errors.push(`${label}: unexpected property "${k}"`);
    }
  };

  if (!data || typeof data !== 'object') {
    errors.push('SlideSpec must be an object.');
    return { success: false, errors };
  }

  // Required
  if (!isString(data.title)) errors.push('title is required and must be a non-empty string.');
  if (!isString(data.layout) || !validLayouts.includes(data.layout)) {
    errors.push(`layout is required and must be one of: ${validLayouts.join(', ')}`);
  }

  // Optional basics
  if (data.bullets !== undefined && !isStrArr(data.bullets))
    errors.push('bullets must be an array of strings.');
  if (data.paragraph !== undefined && typeof data.paragraph !== 'string')
    errors.push('paragraph must be a string.');

  // Left/Right columns
  const sideAllowed = ['title', 'bullets', 'paragraph'];
  if (data.left) {
    ensureOnlyAllowedKeys(data.left, sideAllowed, 'left');
    if (data.left.title !== undefined && !isString(data.left.title)) errors.push('left.title must be a string.');
    if (data.left.bullets !== undefined && !isStrArr(data.left.bullets))
      errors.push('left.bullets must be an array of strings.');
    if (data.left.paragraph !== undefined && typeof data.left.paragraph !== 'string')
      errors.push('left.paragraph must be a string.');
  }
  if (data.right) {
    ensureOnlyAllowedKeys(data.right, sideAllowed, 'right');
    if (data.right.title !== undefined && !isString(data.right.title)) errors.push('right.title must be a string.');
    if (data.right.bullets !== undefined && !isStrArr(data.right.bullets))
      errors.push('right.bullets must be an array of strings.');
    if (data.right.paragraph !== undefined && typeof data.right.paragraph !== 'string')
      errors.push('right.paragraph must be a string.');
  }

  // contentItems
  if (data.contentItems !== undefined) {
    if (!Array.isArray(data.contentItems)) {
      errors.push('contentItems must be an array.');
    } else {
      for (const [i, item] of data.contentItems.entries()) {
        if (!item || typeof item !== 'object') {
          errors.push(`contentItems[${i}] must be an object.`);
          continue;
        }
        if (!['text', 'bullet', 'number', 'icon', 'metric'].includes(item.type)) {
          errors.push(`contentItems[${i}].type invalid.`);
        }
        if (!isString(item.content)) errors.push(`contentItems[${i}].content must be a non-empty string.`);
        if (item.emphasis !== undefined && !['normal', 'bold', 'italic', 'highlight'].includes(item.emphasis)) {
          errors.push(`contentItems[${i}].emphasis invalid.`);
        }
        if (item.color !== undefined && !isHex(item.color)) {
          errors.push(`contentItems[${i}].color must be a 6-digit hex color like #1A2B3C.`);
        }
        if (item.iconName !== undefined && typeof item.iconName !== 'string') {
          errors.push(`contentItems[${i}].iconName must be a string.`);
        }
      }
    }
  }

  // chart
  if (data.chart !== undefined) {
    const c = data.chart;
    const allowed = ['type', 'categories', 'series'];
    ensureOnlyAllowedKeys(c, allowed, 'chart');
    if (!['bar', 'line', 'pie'].includes(c?.type)) errors.push('chart.type must be bar|line|pie.');
    if (!Array.isArray(c?.categories) || !c.categories.every(isString)) {
      errors.push('chart.categories must be an array of strings.');
    }
    if (
      !Array.isArray(c?.series) ||
      !c.series.every((s: any) => isString(s?.name) && Array.isArray(s?.data) && s.data.every((n: any) => typeof n === 'number'))
    ) {
      errors.push('chart.series must be [{ name: string, data: number[] }, ...].');
    }
  }

  // timeline
  if (data.timeline !== undefined) {
    if (
      !Array.isArray(data.timeline) ||
      !data.timeline.every(
        (t: any) =>
          isString(t?.date) &&
          isString(t?.title) &&
          (t.description === undefined || typeof t.description === 'string') &&
          (t.milestone === undefined || typeof t.milestone === 'boolean')
      )
    ) {
      errors.push('timeline must be an array of { date, title, description?, milestone? }.');
    }
  }

  // comparisonTable
  if (data.comparisonTable !== undefined) {
    const ct = data.comparisonTable;
    const allowed = ['columns', 'rows'];
    ensureOnlyAllowedKeys(ct, allowed, 'comparisonTable');
    if (!Array.isArray(ct?.columns) || !ct.columns.every(isString)) errors.push('comparisonTable.columns must be string[].');
    if (!Array.isArray(ct?.rows) || !ct.rows.every((r: any) => Array.isArray(r) && r.every(isString))) {
      errors.push('comparisonTable.rows must be string[][].');
    }
    if (Array.isArray(ct?.columns) && Array.isArray(ct?.rows)) {
      const colCount = ct.columns.length;
      if (!ct.rows.every((r: string[]) => r.length === colCount)) {
        errors.push('comparisonTable.rows must have the same length as columns.');
      }
    }
  }

  // processSteps
  if (data.processSteps !== undefined) {
    if (
      !Array.isArray(data.processSteps) ||
      !data.processSteps.every((p: any) => isString(p?.title) && (p.description === undefined || typeof p.description === 'string'))
    ) {
      errors.push('processSteps must be an array of { title, description? }.');
    }
  }

  // design
  if (data.design !== undefined) {
    const d = data.design;
    const allowed = ['theme', 'accentColor', 'backgroundStyle', 'imageStyle'];
    ensureOnlyAllowedKeys(d, allowed, 'design');
    if (d.accentColor !== undefined && !isHex(d.accentColor)) errors.push('design.accentColor must be hex.');
    if (d.imageStyle !== undefined && !['photo', 'illustration', 'isometric'].includes(d.imageStyle))
      errors.push('design.imageStyle must be photo|illustration|isometric.');
  }

  // sources
  if (data.sources !== undefined && !isStrArr(data.sources)) errors.push('sources must be an array of strings.');

  // notes
  if (data.notes !== undefined && typeof data.notes !== 'string') errors.push('notes must be a string.');

  // Final allowed top-level keys
  const allowedTop = new Set([
    'title',
    'layout',
    'bullets',
    'paragraph',
    'left',
    'right',
    'contentItems',
    'imagePrompt',
    'notes',
    'sources',
    'chart',
    'timeline',
    'comparisonTable',
    'processSteps',
    'design'
  ]);
  for (const k of Object.keys(data)) {
    if (!allowedTop.has(k)) errors.push(`Unexpected top-level property "${k}".`);
  }

  if (errors.length > 0) return { success: false, errors };
  return { success: true, data: data as SlideSpec };
}

/* =========================================================================================
 * SECTION: System Prompt & Prompt Builders (inline drop-in replacement for ./prompts)
 * =======================================================================================*/

export const SYSTEM_PROMPT = `
You are a senior presentation strategist and slide architect.
You must output ONLY a single JSON object matching the SlideSpec schema provided.
Do not include markdown code fences or any prose outside JSON.
Be concise, persuasive, and audience-aware. Use clear structure, parallel phrasing, and high-signal content.
If you add colors, use 6-digit hex (e.g., #143D6B). Never invent properties outside the schema.
`.trim();

function baseSchemaHint(): string {
  return `
Return JSON of this shape (only include fields you actually use):

{
  "title": string,
  "layout": one of ["title","title-bullets","title-paragraph","two-column","image-right","image-left","quote","chart","timeline","process-flow","comparison-table","before-after","problem-solution","mixed-content","metrics-dashboard","thank-you"],
  "bullets"?: string[],
  "paragraph"?: string,
  "left"?: { "title"?: string, "bullets"?: string[], "paragraph"?: string },
  "right"?: { "title"?: string, "bullets"?: string[], "paragraph"?: string },
  "contentItems"?: [{ "type":"text|bullet|number|icon|metric","content":string,"emphasis"?: "normal|bold|italic|highlight","color"?: "#RRGGBB","iconName"?: string }],
  "imagePrompt"?: string,
  "notes"?: string,
  "sources"?: string[],
  "chart"?: { "type":"bar|line|pie","categories":string[],"series":[{"name":string,"data":number[]}] },
  "timeline"?: [{ "date":string,"title":string,"description"?:string,"milestone"?:boolean }],
  "comparisonTable"?: { "columns":string[], "rows":string[][] },
  "processSteps"?: [{ "title":string, "description"?:string }],
  "design"?: { "theme"?:string, "accentColor"?: "#RRGGBB", "backgroundStyle"?: string, "imageStyle"?: "photo|illustration|isometric" }
}
`.trim();
}

function audienceToneClause(input: GenerationParams): string {
  const parts: string[] = [];
  if (input.audience) parts.push(`Audience: ${input.audience}.`);
  if (input.tone) parts.push(`Tone: ${input.tone}.`);
  if (input.contentLength) parts.push(`Content length target: ${input.contentLength}.`);
  if (input.brand?.primaryColor) parts.push(`Prefer brand primaryColor ${input.brand.primaryColor}.`);
  if (input.brand?.secondaryColor) parts.push(`Secondary color ${input.brand.secondaryColor}.`);
  if (input.brand?.font) parts.push(`Font preference: ${input.brand.font}.`);
  if (input.language) parts.push(`Language: ${input.language}.`);

  return parts.length ? parts.join(' ') : '';
}

export function generateContentPrompt(input: GenerationParams): string {
  return [
    `Create the core content for one slide based on: "${input.prompt}".`,
    audienceToneClause(input),
    `Focus on: persuasion, clarity, actionability.`,
    `Pick an appropriate layout and include only the fields needed.`,
    baseSchemaHint()
  ]
    .filter(Boolean)
    .join('\n');
}

export function generateLayoutPrompt(input: GenerationParams, partial: Partial<SlideSpec>): string {
  return [
    `Refine this slide for optimal UX/visual flow while preserving message.`,
    audienceToneClause(input),
    `Rules:`,
    `- Choose the best layout for content density and scanning.`,
    `- Keep bullets concise (max ~6). Use parallel phrasing.`,
    `- If two-column structure makes sense, balance left/right.`,
    `- If quantitative, consider "chart" with simple, readable series.`,
    `- Only return a single JSON SlideSpec object.`,
    baseSchemaHint(),
    `Current draft (JSON):`,
    JSON.stringify(partial ?? {}, null, 2)
  ].join('\n');
}

export function generateImagePrompt(input: GenerationParams, partial: Partial<SlideSpec>): string {
  return [
    `Generate a single emotionally-resonant, safe image prompt that complements this slide.`,
    audienceToneClause(input),
    `- The prompt should be photorealistic unless "imageStyle" indicates otherwise.`,
    `- Avoid text-in-image. Focus on metaphor that reinforces the message.`,
    `- Style should match "design.accentColor" if present; otherwise neutral corporate.`,
    `Return a JSON SlideSpec including "imagePrompt".`,
    baseSchemaHint(),
    `Slide (JSON):`,
    JSON.stringify(partial ?? {}, null, 2)
  ].join('\n');
}

export function generateRefinementPrompt(input: GenerationParams, partial: Partial<SlideSpec>): string {
  return [
    `Final pass: validate schema, tighten copy, and ensure strong narrative.`,
    audienceToneClause(input),
    `- Remove unused fields.`,
    `- Ensure layout fits content.`,
    `- Keep only allowed properties.`,
    `- Return a single JSON SlideSpec.`,
    baseSchemaHint(),
    `Slide (JSON):`,
    JSON.stringify(partial ?? {}, null, 2)
  ].join('\n');
}

/** Batch prompt builder for cohesive image prompts */
export function generateBatchImagePrompts(
  input: GenerationParams,
  slideSpecs: Partial<SlideSpec>[]
): string {
  const titles = slideSpecs.map((s, i) => ({ index: i, title: s.title ?? `Slide ${i + 1}` }));
  return [
    `You will generate cohesive, emotionally-resonant image prompts for multiple slides.`,
    audienceToneClause(input),
    `Guidelines: corporate-safe, high-resolution, no text in image, aligned look & feel across slides.`,
    `Return JSON ONLY with the following shape:`,
    `{"imagePrompts": [ "prompt for slide 1", "prompt for slide 2", ... ]}`,
    `Count of imagePrompts MUST equal the number of slides provided.`,
    `Slides:`,
    JSON.stringify(titles, null, 2)
  ].join('\n');
}

/* =========================================================================================
 * SECTION: Model Config & Cost Logging (inline drop-in replacement for ./config/aiModels)
 * =======================================================================================*/

type AIModelConfig = {
  model: string;
  fallbackModel: string;
  maxRetries: number;
  retryDelay: number; // ms base
  maxBackoffDelay: number; // ms cap
  timeoutMs: number; // per call
  maxTokens: number;
  temperature: number;
};

export function getTextModelConfig(): AIModelConfig {
  const mode = (process.env.AI_MODE as 'test' | 'production' | undefined) ?? 'production';
  const model = process.env.AI_TEXT_MODEL ?? (mode === 'test' ? 'gpt-4o-mini' : 'gpt-4o-mini');
  const fallbackModel = process.env.AI_FALLBACK_MODEL ?? 'gpt-4o';

  return {
    model,
    fallbackModel,
    maxRetries: Number(process.env.AI_MAX_RETRIES ?? 3),
    retryDelay: Number(process.env.AI_RETRY_DELAY_MS ?? 400),
    maxBackoffDelay: Number(process.env.AI_MAX_BACKOFF_MS ?? 8000),
    timeoutMs: Number(process.env.AI_TIMEOUT_MS ?? 30000),
    maxTokens: Number(process.env.AI_MAX_TOKENS ?? 1400),
    temperature: Number(process.env.AI_TEMPERATURE ?? 0.7)
  };
}

export function logCostEstimate(args: { textTokens: number; imageCount: number; operation: string }) {
  const { textTokens, imageCount, operation } = args;
  console.log(`[CostEstimate] ${operation}: ~${textTokens} text tokens + ${imageCount} image(s).`);
}

/* =========================================================================================
 * SECTION: Error Types (unchanged + a few additions)
 * =======================================================================================*/

export class AIGenerationError extends Error {
  constructor(
    message: string,
    public readonly step: string,
    public readonly attempt: number,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'AIGenerationError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public readonly validationErrors: string[]) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string, public readonly timeoutMs: number) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class RateLimitError extends Error {
  constructor(message: string, public readonly retryAfter?: number) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class ContentFilterError extends Error {
  constructor(message: string, public readonly filteredContent: string) {
    super(message);
    this.name = 'ContentFilterError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public readonly statusCode?: number) {
    super(message);
    this.name = 'NetworkError';
  }
}

/* =========================================================================================
 * SECTION: Validation Error Analysis (unchanged)
 * =======================================================================================*/

export function analyzeValidationErrors(errors: string[]): {
  category: string;
  helpfulMessage: string;
  suggestedFix: string;
} {
  const errorText = errors.join(' ').toLowerCase();

  if (errorText.includes('title') && errorText.includes('required')) {
    return {
      category: 'Missing Title',
      helpfulMessage: 'The slide is missing a required title. Every slide needs a clear, descriptive title.',
      suggestedFix: 'Ensure the AI generates a title field that summarizes the slide content in 5-10 words.'
    };
  }

  if (errorText.includes('layout') && (errorText.includes('invalid') || errorText.includes('enum'))) {
    return {
      category: 'Invalid Layout',
      helpfulMessage:
        'The specified layout type is not supported. Valid layouts include: title-bullets, title-paragraph, two-column, etc.',
      suggestedFix: 'Use one of the predefined layout types from the schema. Check SLIDE_LAYOUTS for valid options.'
    };
  }

  if (errorText.includes('bullets') && errorText.includes('array')) {
    return {
      category: 'Invalid Bullets Format',
      helpfulMessage: 'Bullet points must be provided as an array of strings, not as a single text block.',
      suggestedFix: 'Format bullets as: ["First point", "Second point", "Third point"] instead of a paragraph.'
    };
  }

  if (errorText.includes('paragraph') && errorText.includes('string')) {
    return {
      category: 'Invalid Paragraph Format',
      helpfulMessage: 'Paragraph content must be a single string, not an array or object.',
      suggestedFix: 'Provide paragraph as a single text string with proper formatting.'
    };
  }

  if (errorText.includes('chart') && errorText.includes('data')) {
    return {
      category: 'Invalid Chart Data',
      helpfulMessage:
        'Chart data structure is invalid. Charts require categories, series with data arrays, and proper type specification.',
      suggestedFix:
        'Ensure chart has: type (bar/line/pie), categories array, and series array with name and data fields.'
    };
  }

  return {
    category: 'General Validation Error',
    helpfulMessage: 'The slide specification does not match the required schema format.',
    suggestedFix: 'Review the SlideSpec schema and ensure all required fields are present with correct data types.'
  };
}

/* =========================================================================================
 * SECTION: Sanitization
 * =======================================================================================*/

function sanitizeAIResponse(data: any): any {
  if (!data || typeof data !== 'object') return data;
  const sanitized = { ...data };

  // Normalize bullets arrays
  if (sanitized.bullets && Array.isArray(sanitized.bullets)) {
    sanitized.bullets = sanitized.bullets.map((bullet: any) => {
      if (typeof bullet === 'string') return bullet;
      if (bullet && typeof bullet === 'object') {
        if (bullet.text) return bullet.text;
        if (bullet.content) return bullet.content;
        if (bullet.point) return bullet.point;
        if (bullet.item) return bullet.item;
        const values = Object.values(bullet).filter((v) => typeof v === 'string');
        if (values.length === 1) return values[0];
        return JSON.stringify(bullet);
      }
      return String(bullet);
    });
  }

  // Normalize left/right bullets
  if (sanitized.left?.bullets && Array.isArray(sanitized.left.bullets)) {
    sanitized.left.bullets = sanitized.left.bullets.map((b: any) => (typeof b === 'string' ? b : String(b)));
  }
  if (sanitized.right?.bullets && Array.isArray(sanitized.right.bullets)) {
    sanitized.right.bullets = sanitized.right.bullets.map((b: any) => (typeof b === 'string' ? b : String(b)));
  }

  // Timeline
  if (sanitized.timeline && Array.isArray(sanitized.timeline)) {
    sanitized.timeline = sanitized.timeline.map((item: any) => ({
      ...item,
      date: typeof item.date === 'string' ? item.date : String(item.date || ''),
      title: typeof item.title === 'string' ? item.title : String(item.title || ''),
      description: typeof item.description === 'string' ? item.description : String(item.description || ''),
      milestone: Boolean(item.milestone)
    }));
  }

  // contentItems
  if (sanitized.contentItems && Array.isArray(sanitized.contentItems)) {
    sanitized.contentItems = sanitized.contentItems
      .map((item: any) => {
        if (!item || typeof item !== 'object') return null;
        let { type, content } = item;

        if (!type) {
          if (item.text || item.content) type = 'text';
          else if (item.bullet || item.point) type = 'bullet';
          else if (item.number || item.value) type = 'number';
          else if (item.icon || item.iconName) type = 'icon';
          else if (item.metric) type = 'metric';
          else type = 'text';
        }

        if (!content) {
          content =
            item.text ||
            item.content ||
            item.bullet ||
            item.point ||
            item.value ||
            item.number ||
            item.metric ||
            '';
        }

        if (!type || !content || typeof content !== 'string' || content.trim() === '') return null;

        const out: ContentItem = {
          type: String(type) as ContentItem['type'],
          content: String(content).trim()
        };
        if (item.emphasis && ['normal', 'bold', 'italic', 'highlight'].includes(item.emphasis)) out.emphasis = item.emphasis;
        if (item.color && typeof item.color === 'string' && /^#[0-9A-Fa-f]{6}$/.test(item.color)) out.color = item.color;
        if (item.iconName && typeof item.iconName === 'string') out.iconName = item.iconName;
        return out;
      })
      .filter(Boolean);

    if (sanitized.contentItems.length === 0) delete sanitized.contentItems;
  }

  return sanitized;
}

export function sanitizeAIResponseWithRecovery(data: any): any {
  if (!data || typeof data !== 'object') return data;

  let sanitized = sanitizeAIResponse(data);

  const validLayouts: LayoutType[] = [
    'title',
    'title-bullets',
    'title-paragraph',
    'two-column',
    'image-right',
    'image-left',
    'quote',
    'chart',
    'timeline',
    'process-flow',
    'comparison-table',
    'before-after',
    'problem-solution',
    'mixed-content',
    'metrics-dashboard',
    'thank-you'
  ];

  // Ensure title
  if (!sanitized.title || typeof sanitized.title !== 'string' || sanitized.title.trim() === '') {
    sanitized.title = 'Untitled Slide';
  }

  // Infer layout if invalid/missing
  if (!sanitized.layout || !validLayouts.includes(sanitized.layout)) {
    if (sanitized.bullets && sanitized.bullets.length > 0) sanitized.layout = 'title-bullets';
    else if (sanitized.paragraph) sanitized.layout = 'title-paragraph';
    else if (sanitized.left || sanitized.right) sanitized.layout = 'two-column';
    else sanitized.layout = 'title-paragraph';
  }

  const allowedProperties = new Set([
    'title',
    'layout',
    'bullets',
    'paragraph',
    'contentItems',
    'left',
    'right',
    'imagePrompt',
    'notes',
    'sources',
    'chart',
    'timeline',
    'comparisonTable',
    'processSteps',
    'design'
  ]);

  // Strip unknown props
  const clean: Record<string, any> = {};
  for (const key of Object.keys(sanitized)) {
    if (allowedProperties.has(key)) clean[key] = sanitized[key];
  }
  return clean;
}

/* =========================================================================================
 * SECTION: Secrets & OpenAI Client
 * =======================================================================================*/

/**
 * We prefer Firebase defineSecret('OPENAI_API_KEY') when available,
 * otherwise we fall back to process.env.OPENAI_API_KEY.
 */
type SecretLike = { value(): string | undefined };
let secretProvider: SecretLike | null = null;

try {
  // Optional: works when running in Firebase Functions environment
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const params = require('firebase-functions/params');
  if (params?.defineSecret) {
    secretProvider = params.defineSecret('OPENAI_API_KEY');
  }
} catch {
  // Not in Firebase environment. We'll rely on env var.
}

let openai: OpenAI | null = null;

function getApiKey(): string {
  const fromSecret = secretProvider?.value?.();
  const fromEnv = process.env.OPENAI_API_KEY;
  const apiKey = fromSecret || fromEnv;
  if (!apiKey) throw new Error('OpenAI API key is not configured (set Firebase Secret OPENAI_API_KEY or env var).');
  return apiKey;
}

function getOpenAI(): OpenAI {
  if (!openai) {
    openai = new OpenAI({ apiKey: getApiKey() });
  }
  return openai;
}

/* =========================================================================================
 * SECTION: Core AI Call Helpers (with robust retries/fallbacks)
 * =======================================================================================*/

const AI_CONFIG = getTextModelConfig();

/**
 * Make a single validated SlideSpec call with retries and fallbacks.
 */
async function aiCallWithRetry(
  prompt: string,
  stepName: string,
  previousSpec?: Partial<SlideSpec>
): Promise<SlideSpec> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= AI_CONFIG.maxRetries; attempt++) {
    try {
      console.log(`${stepName} attempt ${attempt}/${AI_CONFIG.maxRetries} (model: ${AI_CONFIG.model})`);
      return await makeAICallSlideSpec(prompt, stepName, previousSpec, AI_CONFIG.model, attempt);
    } catch (error: any) {
      lastError = error;
      console.error(`${stepName} attempt ${attempt} failed:`, error?.message || error);

      if (error instanceof ValidationError) {
        console.log(`Validation error in ${stepName}; not retrying further on this attempt sequence.`);
        throw new AIGenerationError(`Validation failed in ${stepName}: ${error.message}`, stepName, attempt, error);
      }

      if (attempt < AI_CONFIG.maxRetries) {
        const baseDelay = AI_CONFIG.retryDelay * Math.pow(2, attempt - 1);
        const jitter = Math.random() * 0.1 * baseDelay;
        const backoffDelay = Math.min(baseDelay + jitter, AI_CONFIG.maxBackoffDelay);
        console.log(`Retrying ${stepName} in ~${Math.round(backoffDelay)}ms...`);
        await new Promise((r) => setTimeout(r, backoffDelay));
      }
    }
  }

  // Try once with fallback model
  if (AI_CONFIG.fallbackModel && AI_CONFIG.fallbackModel !== AI_CONFIG.model) {
    console.log(`Primary model failed; trying fallback model: ${AI_CONFIG.fallbackModel}`);
    try {
      return await makeAICallSlideSpec(prompt, stepName, previousSpec, AI_CONFIG.fallbackModel, AI_CONFIG.maxRetries + 1);
    } catch (fallbackError: any) {
      lastError = fallbackError;
      console.error(`Fallback model failed for ${stepName}:`, fallbackError?.message || fallbackError);
    }
  }

  // Targeted fallbacks by step
  if (stepName === 'Content Generation') {
    console.log('Creating structured fallback spec for content generation...');
    return createFallbackSpec(prompt, previousSpec);
  } else if (stepName === 'Layout Refinement' && previousSpec) {
    console.log('Using previous spec with basic layout fallback...');
    return {
      ...(previousSpec as SlideSpec),
      layout: (previousSpec.layout as LayoutType) || 'title-bullets'
    };
  } else if (stepName === 'Image Prompt Generation' && previousSpec) {
    console.log('Image prompt generation failed; applying context-aware fallback prompt.');
    const fallbackImagePrompt = generateFallbackImagePrompt(previousSpec, lastError || undefined);
    return {
      ...(previousSpec as SlideSpec),
      imagePrompt: fallbackImagePrompt
    };
  }

  throw new AIGenerationError(
    `All attempts failed for ${stepName}. Last error: ${lastError?.message || 'unknown error'}`,
    stepName,
    AI_CONFIG.maxRetries,
    lastError || undefined
  );
}

/**
 * Make an AI call expecting a SlideSpec JSON (validated).
 */
async function makeAICallSlideSpec(
  prompt: string,
  stepName: string,
  previousSpec: Partial<SlideSpec> | undefined,
  model: string,
  attempt: number
): Promise<SlideSpec> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.timeoutMs);

  try {
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ];
    if (previousSpec) messages.push({ role: 'assistant', content: JSON.stringify(previousSpec) });

    const response = await getOpenAI().chat.completions.create(
      {
        model: model as any,
        messages,
        response_format: { type: 'json_object' },
        temperature: AI_CONFIG.temperature,
        max_tokens: AI_CONFIG.maxTokens
      },
      { signal: controller.signal }
    );

    const raw = response.choices?.[0]?.message?.content;
    if (!raw) throw new Error('Empty response from AI model.');
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      throw new Error(`Invalid JSON response: ${(e as Error).message}`);
    }

    // Sanitize then validate
    const sanitized = sanitizeAIResponse(parsed);
    const validation = safeValidateSlideSpec(sanitized);
    if (!validation.success) {
      const errorAnalysis = analyzeValidationErrors(validation.errors);
      const message = `Slide specification validation failed - ${errorAnalysis.category}: ${errorAnalysis.helpfulMessage}`;
      console.error('Validation details:', {
        category: errorAnalysis.category,
        helpfulMessage: errorAnalysis.helpfulMessage,
        suggestedFix: errorAnalysis.suggestedFix,
        originalErrors: validation.errors,
        stepName,
        attempt
      });
      throw new ValidationError(message, validation.errors);
    }

    return validation.data;
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new TimeoutError(`${stepName} timed out after ${AI_CONFIG.timeoutMs}ms`, AI_CONFIG.timeoutMs);
    }

    const oe = error as any;
    if (oe && typeof oe === 'object' && 'error' in oe) {
      const openaiError = oe;
      if (openaiError.error?.type === 'insufficient_quota') {
        throw new RateLimitError('API quota exceeded. Please try again later.');
      }
      if (openaiError.error?.type === 'rate_limit_exceeded') {
        const retryAfter = openaiError.error?.retry_after || 60;
        throw new RateLimitError(`Rate limit exceeded. Please wait ${retryAfter} seconds.`, retryAfter);
      }
      if (openaiError.error?.code === 'content_filter') {
        throw new ContentFilterError(
          'Content was filtered due to policy violations. Please try different wording.',
          openaiError.error?.message || 'Content filtered'
        );
      }
      if (openaiError.status >= 500) {
        throw new NetworkError(
          `OpenAI service error: ${openaiError.error?.message || 'Service unavailable'}`,
          openaiError.status
        );
      }
      if (openaiError.status >= 400) {
        throw new ValidationError(`API request error: ${openaiError.error?.message || 'Bad request'}`, [
          openaiError.error?.message || 'Bad request'
        ]);
      }
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError('Network connection failed. Please check your internet connection.');
    }
    if (error instanceof ValidationError) throw error;

    throw new AIGenerationError(
      `${stepName} failed: ${error instanceof Error ? error.message : String(error)}`,
      stepName,
      attempt,
      error instanceof Error ? error : new Error(String(error))
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Make an AI call expecting batch image prompts JSON: { imagePrompts: string[] }
 */
async function aiCallForBatchImagePrompts(
  prompt: string,
  slideCount: number
): Promise<{ imagePrompts: string[] }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.timeoutMs);

  try {
    const response = await getOpenAI().chat.completions.create(
      {
        model: AI_CONFIG.model as any,
        messages: [
          { role: 'system', content: `You output ONLY valid JSON. No prose.` },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: AI_CONFIG.temperature,
        max_tokens: Math.max(400, Math.min(1200, 80 * slideCount))
      },
      { signal: controller.signal }
    );

    const raw = response.choices?.[0]?.message?.content;
    if (!raw) throw new Error('Empty response for batch image prompts.');
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      throw new Error(`Invalid JSON for batch image prompts: ${(e as Error).message}`);
    }

    const prompts = parsed?.imagePrompts;
    if (!Array.isArray(prompts) || prompts.some((p) => typeof p !== 'string')) {
      throw new Error('imagePrompts must be an array of strings.');
    }
    if (prompts.length !== slideCount) {
      throw new Error(`imagePrompts length mismatch: expected ${slideCount}, got ${prompts.length}.`);
    }
    return { imagePrompts: prompts };
  } finally {
    clearTimeout(timeoutId);
  }
}

/* =========================================================================================
 * SECTION: Fallback Content Creation (structured & narrative-aware)
 * =======================================================================================*/

function createFallbackTitle(prompt: string): string {
  let title = prompt.trim();
  if (title.length > 60) {
    const keyTerms =
      title.match(/\b(?:revenue|growth|performance|results|analysis|strategy|improvement|increase|decrease|\d+%|\$[\d,]+)\b/gi) ||
      [];
    title = keyTerms.length > 0 ? `${keyTerms.slice(0, 3).join(' ')} Overview` : title.substring(0, 57) + '...';
  }
  return title.charAt(0).toUpperCase() + title.slice(1);
}

function createFallbackContent(prompt: string): { bullets: string[]; paragraph: string } {
  const p = prompt.toLowerCase();
  let bullets: string[] = [];
  let paragraph = '';

  if (p.includes('revenue') || p.includes('sales') || p.includes('growth')) {
    bullets = ['Revenue performance & key metrics', 'Growth trends & opportunities', 'Strategic recommendations'];
    paragraph =
      'This slide focuses on revenue and growth analysis: performance metrics, market trends, and strategic opportunities.';
  } else if (p.includes('team') || p.includes('people') || p.includes('organization')) {
    bullets = ['Team structure & roles', 'Core responsibilities', 'Collaboration strategies'];
    paragraph =
      'This slide outlines team structure, roles, and collaboration patterns to achieve objectives efficiently.';
  } else if (p.includes('data') || p.includes('analytics') || p.includes('metrics')) {
    bullets = ['KPIs & analysis', 'Insights and trends', 'Data-informed next steps'];
    paragraph = 'This slide presents KPIs and insights that inform strategic decision-making and prioritization.';
  } else if (p.includes('strategy') || p.includes('plan') || p.includes('roadmap')) {
    bullets = ['Objectives & initiatives', 'Timeline & milestones', 'Success metrics'];
    paragraph =
      'This slide frames strategic objectives, implementation approach, milestones, and success measurement criteria.';
  } else if (p.includes('problem') || p.includes('challenge') || p.includes('issue')) {
    bullets = ['Root-cause analysis', 'Impact assessment', 'Mitigation strategies'];
    paragraph =
      'This slide identifies key challenges, explores root causes, and proposes practical mitigation strategies.';
  } else {
    bullets = ['Key points & objectives', 'Current status updates', 'Next steps & owners'];
    paragraph =
      'This slide summarizes key points, current status, and actionable next steps to maintain momentum.';
  }
  return { bullets, paragraph };
}

function determineOptimalFallbackLayout(prompt: string, _content: { bullets: string[]; paragraph: string }): LayoutType {
  const p = prompt.toLowerCase();
  if (p.includes('data') || p.includes('chart') || p.includes('metrics')) return 'title-paragraph';
  if (p.includes('action') || p.includes('steps') || p.includes('plan')) return 'title-bullets';
  return 'title-bullets';
}

function generateFallbackNotes(prompt: string, _content: { bullets: string[]; paragraph: string }): string {
  return `FALLBACK CONTENT NOTICE: This slide was generated via structured fallback due to temporary AI service limitations.

ORIGINAL REQUEST: "${prompt}"

PRESENTATION GUIDANCE:
• Use the bullets as a scaffold; add domain examples
• Include data or proof points where possible
• Tailor to the specific audience’s priorities

RECOMMENDED ACTIONS:
• Refine messaging with concrete outcomes
• Add visuals or a chart if applicable
• Re-run when full AI services are available`;
}

function createFallbackSpec(prompt: string, previousSpec?: Partial<SlideSpec>): SlideSpec {
  const title = createFallbackTitle(prompt);
  const content = createFallbackContent(prompt);
  const layout = determineOptimalFallbackLayout(prompt, content);
  const notes = generateFallbackNotes(prompt, content);

  return {
    title,
    layout,
    bullets: content.bullets,
    paragraph: content.paragraph,
    notes,
    sources: ['Structured fallback content generation', 'Prompt analysis system'],
    ...(previousSpec?.design ? { design: previousSpec.design } : {})
  };
}

/* =========================================================================================
 * SECTION: Image Prompt Fallback
 * =======================================================================================*/

export function generateFallbackImagePrompt(slideSpec: Partial<SlideSpec>, error?: Error): string {
  const title = slideSpec.title || 'Business Presentation';
  const content = slideSpec.paragraph || slideSpec.bullets?.join(' ') || '';
  const layout = slideSpec.layout || 'title-bullets';

  const contentLower = (title + ' ' + content + ' ' + layout).toLowerCase();
  let fallbackPrompt = 'Professional business slide background, ';

  if (contentLower.includes('team') || contentLower.includes('people') || contentLower.includes('collaboration')) {
    fallbackPrompt += 'diverse team collaborating in a modern office, natural lighting, candid perspective';
  } else if (contentLower.includes('data') || contentLower.includes('analytics') || contentLower.includes('chart')) {
    fallbackPrompt += 'clean data dashboard aesthetics, subtle graphs, depth-of-field, neutral palette';
  } else if (contentLower.includes('growth') || contentLower.includes('success') || contentLower.includes('increase')) {
    fallbackPrompt += 'symbolic upward momentum, abstract ascending lines and arrows, optimistic composition';
  } else if (contentLower.includes('technology') || contentLower.includes('digital') || contentLower.includes('innovation')) {
    fallbackPrompt += 'sleek technology interface visuals, soft bokeh lights, futuristic yet business-credible';
  } else if (contentLower.includes('strategy') || contentLower.includes('plan') || contentLower.includes('roadmap')) {
    fallbackPrompt += 'strategic planning ambience, table with documents, subtle roadmap iconography';
  } else {
    fallbackPrompt += 'clean corporate environment, minimalist modern office, balanced negative space';
  }

  const accent = slideSpec.design?.accentColor ? `, hint of ${slideSpec.design.accentColor}` : '';
  fallbackPrompt += `${accent}, high resolution, editorial style, no text in image`;

  console.log('Generated fallback image prompt:', {
    originalError: error?.message,
    slideTitle: title,
    fallbackPrompt,
    contentAnalysis: {
      hasTeamContent: contentLower.includes('team'),
      hasDataContent: contentLower.includes('data'),
      hasGrowthContent: contentLower.includes('growth'),
      hasTechContent: contentLower.includes('technology')
    }
  });

  return fallbackPrompt;
}

/* =========================================================================================
 * SECTION: Public API — Chained single slide and batch generation
 * =======================================================================================*/

/**
 * Generate a slide specification using chained AI for high-quality outputs
 */
export async function generateSlideSpec(input: GenerationParams): Promise<SlideSpec> {
  const startTime = Date.now();
  console.log(`Starting chained slide generation with ${AI_CONFIG.model}...`, {
    promptLength: input.prompt?.length,
    audience: input.audience,
    tone: input.tone,
    contentLength: input.contentLength,
    withImage: input.withImage
  });

  logCostEstimate({
    textTokens: 3000,
    imageCount: input.withImage ? 1 : 0,
    operation: 'Slide Generation'
  });

  // Step 1: Content
  let partialSpec = await aiCallWithRetry(generateContentPrompt(input), 'Content Generation');

  // Step 2: Layout
  partialSpec = await aiCallWithRetry(generateLayoutPrompt(input, partialSpec), 'Layout Refinement', partialSpec);

  // Step 3: Image prompt (optional)
  if (input.withImage) {
    partialSpec = await aiCallWithRetry(generateImagePrompt(input, partialSpec), 'Image Prompt Generation', partialSpec);
  }

  // Step 4: Final refinement
  const finalSpec = await aiCallWithRetry(generateRefinementPrompt(input, partialSpec), 'Final Refinement', partialSpec);

  const generationTime = Date.now() - startTime;
  console.log('Chained generation successful', {
    title: finalSpec.title,
    layout: finalSpec.layout,
    generationTime: `${generationTime}ms`
  });

  return finalSpec;
}

/**
 * Generate multiple slides with cohesive image prompts in fewer calls.
 */
export async function generateBatchSlideSpecs(
  input: GenerationParams,
  slideCount: number = 1
): Promise<SlideSpec[]> {
  const startTime = Date.now();
  console.log(`Starting batch slide generation for ${slideCount} slides with ${AI_CONFIG.model}...`);

  logCostEstimate({
    textTokens: 3000 * slideCount,
    imageCount: input.withImage ? slideCount : 0,
    operation: `Batch Slide Generation (${slideCount} slides)`
  });

  const slideSpecs: SlideSpec[] = [];

  // Generate content+layout for each slide
  for (let i = 0; i < slideCount; i++) {
    console.log(`Generating slide ${i + 1}/${slideCount}...`);
    const slideInput: GenerationParams = {
      ...input,
      prompt: `${input.prompt} - Slide ${i + 1} of ${slideCount}`,
      withImage: false
    };

    let spec = await aiCallWithRetry(generateContentPrompt(slideInput), `Content Generation (Slide ${i + 1})`);
    spec = await aiCallWithRetry(generateLayoutPrompt(slideInput, spec), `Layout Refinement (Slide ${i + 1})`, spec);

    slideSpecs.push(spec);
  }

  // Batch image prompts if requested
  if (input.withImage && slideSpecs.length > 0) {
    console.log('Processing batch image prompts...');
    try {
      const batchPrompt = generateBatchImagePrompts(input, slideSpecs);
      const { imagePrompts } = await aiCallForBatchImagePrompts(batchPrompt, slideSpecs.length);

      for (let i = 0; i < slideSpecs.length; i++) {
        slideSpecs[i] = {
          ...slideSpecs[i],
          imagePrompt: imagePrompts[i]
        };
      }
      console.log('Batch image prompts generated and applied successfully.');
    } catch (error) {
      console.warn('Batch image processing failed, falling back to individual prompts:', (error as Error).message);
      for (let i = 0; i < slideSpecs.length; i++) {
        try {
          slideSpecs[i] = await aiCallWithRetry(
            generateImagePrompt(input, slideSpecs[i]),
            `Image Prompt Generation (Slide ${i + 1})`,
            slideSpecs[i]
          );
        } catch (imageError) {
          console.warn(`Image generation failed for slide ${i + 1}, using fallback image prompt:`, (imageError as Error).message);
          slideSpecs[i] = {
            ...slideSpecs[i],
            imagePrompt: generateFallbackImagePrompt(slideSpecs[i], imageError as Error)
          };
        }
      }
    }
  }

  const generationTime = Date.now() - startTime;
  console.log(`Batch generation completed in ${generationTime}ms`, {
    slideCount: slideSpecs.length,
    avgTimePerSlide: `${Math.round(generationTime / Math.max(1, slideSpecs.length))}ms`
  });

  return slideSpecs;
}

/* =========================================================================================
 * SECTION: Utility Exports (optional)
 * =======================================================================================*/

export { sanitizeAIResponse }; // if external callers want basic sanitization
// getTextModelConfig and logCostEstimate are already exported as function declarations above

/* =========================================================================================
 * SECTION: (Optional) Minimal usage example (comment out in production)
 * =======================================================================================*/

// async function example() {
//   const slide = await generateSlideSpec({
//     prompt: 'Q3 revenue growth and product adoption highlights',
//     audience: 'Executive leadership',
//     tone: 'executive',
//     contentLength: 'medium',
//     withImage: true,
//     brand: { primaryColor: '#143D6B' },
//     language: 'en'
//   });
//   console.log(JSON.stringify(slide, null, 2));
// }
// example().catch(console.error);