/**
 * Enhanced AI Orchestrator
 *
 * Advanced AI processing pipeline with multi-model orchestration,
 * intelligent content analysis, and context-aware generation.
 *
 * Features:
 * - Multi-provider orchestration (OpenAI primary; optional Anthropic & Gemini)
 * - Structured JSON outputs with robust parsing and schema hints
 * - Intelligent content analysis and categorization
 * - Context-aware prompt engineering
 * - Advanced error handling, retry & fallback strategies
 * - Performance optimization (TTL cache + request de-dup)
 * - Lightweight token estimation to select optimal model sizes
 *
 * @version 2.1.0
 * @author
 *   AI PowerPoint Generator Team
 */

import OpenAI from 'openai';
import { SlideSpec, GenerationParams } from '../schema';
import { ProfessionalTheme } from '../professionalThemes';
import { getTextModelConfig, getImageModelConfig } from '../config/aiModels';
import { smartLayoutSelector } from './smartLayoutSelector';
import { industryContentEngine } from '../intelligence/industryContentEngine';
import { sourceValidationEngine } from '../intelligence/sourceValidationEngine';
import { audienceAdaptationEngine } from '../intelligence/audienceAdaptationEngine';

/* ---------- Types & Interfaces ---------- */

export interface ContentAnalysis {
  category: 'business' | 'technical' | 'creative' | 'educational' | 'scientific';
  complexity: 'simple' | 'moderate' | 'complex' | 'expert';
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  keywords: string[];
  entities: Array<{
    text: string;
    type: 'person' | 'organization' | 'location' | 'product' | 'concept';
    confidence: number;
  }>;
  suggestedLayouts: string[];
  visualElements: Array<{
    type: 'chart' | 'image' | 'diagram' | 'timeline' | 'table';
    relevance: number;
    description: string;
  }>;
  toneAlignment: number; // 0-1
  audienceAlignment: number; // 0-1
}

type Provider = 'openai' | 'anthropic' | 'google';

export interface AIModelConfig {
  primary: {
    provider: Provider;
    model: string;
    temperature: number;
    maxTokens: number;
  };
  fallback: {
    provider: Provider;
    model: string;
    temperature: number;
    maxTokens: number;
  };
  specialized: {
    contentAnalysis: string; // model id
    visualDesign: string;    // model id
    copywriting: string;     // model id
  };
}

export interface GenerationContext {
  userInput: GenerationParams;
  contentAnalysis: ContentAnalysis;
  previousSlides?: SlideSpec[];
  presentationTheme?: ProfessionalTheme;
  brandGuidelines?: {
    colors: string[];
    fonts: string[];
    logoUrl?: string;
    voiceAndTone: string;
  };
  constraints: {
    maxSlides: number;
    timeLimit: number; // ms
    accessibilityLevel: 'basic' | 'enhanced' | 'full';
  };
}

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

type CachedEntry<T> = { value: T; expiresAt: number };

/* ---------- Constants ---------- */

const DEFAULT_TIMEOUT_MS =
  parseInt(process.env.AI_ORCHESTRATOR_TIMEOUT_MS || '', 10) || 45_000;

const DEFAULT_CACHE_TTL_MS =
  parseInt(process.env.AI_ORCHESTRATOR_CACHE_TTL_MS || '', 10) || 10 * 60_000;

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const GEMINI_URL = (model: string, key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(key)}`;

/* ---------- Utility helpers ---------- */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Estimate tokens (roughly chars/4) */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/** Safe JSON parse that also extracts the largest JSON object from a text if needed */
function safeJSONParse<T = any>(raw: string, label = 'JSON'): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    // Try to extract JSON object boundaries
    const first = raw.indexOf('{');
    const last = raw.lastIndexOf('}');
    if (first >= 0 && last > first) {
      const maybe = raw.slice(first, last + 1);
      try {
        return JSON.parse(maybe) as T;
      } catch {
        // Try array
        const fa = raw.indexOf('[');
        const la = raw.lastIndexOf(']');
        if (fa >= 0 && la > fa) {
          const arrMaybe = raw.slice(fa, la + 1);
          try {
            return JSON.parse(arrMaybe) as T;
          } catch {
            // fallthrough
          }
        }
      }
    }
    throw new Error(`Failed to parse ${label} from model output.`);
  }
}

/** Normalize and cap list length with de-duplication */
function normalizeList(items: string[] | undefined, max = 6): string[] | undefined {
  if (!items) return items;
  const seen = new Set<string>();
  const out: string[] = [];
  for (const i of items) {
    const t = String(i).trim();
    if (t && !seen.has(t.toLowerCase())) {
      out.push(t);
      seen.add(t.toLowerCase());
      if (out.length >= max) break;
    }
  }
  return out;
}

/** Clamp a number between [min, max] */
function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** Create a timeout wrapper for a promise */
async function withTimeout<T>(p: Promise<T>, ms = DEFAULT_TIMEOUT_MS, label?: string): Promise<T> {
  let t: NodeJS.Timeout;
  const timeout = new Promise<T>((_, rej) => {
    t = setTimeout(() => rej(new Error(`Timed out: ${label || 'operation'}`)), ms);
  });
  try {
    const res = await Promise.race([p, timeout]);
    // @ts-ignore – t will be defined
    clearTimeout(t);
    return res as T;
  } catch (e) {
    // @ts-ignore – t will be defined
    clearTimeout(t);
    throw e;
  }
}

/** Make bullet points concise and within limits */
function tidyBullets(bullets: string[] | undefined, maxBullets = 6, maxLen = 140): string[] | undefined {
  if (!bullets) return bullets;
  const trimmed = bullets
    .map((b) => b.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .slice(0, maxBullets)
    .map((b) => (b.length > maxLen ? b.slice(0, maxLen - 1) + '…' : b));
  return normalizeList(trimmed, maxBullets);
}

/* ---------- Orchestrator ---------- */

export class AIOrchestrator {
  private openaiClient: OpenAI | null;
  private config: AIModelConfig;
  private cache = new Map<string, CachedEntry<any>>();
  private inFlight = new Map<string, Promise<any>>();

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️  OpenAI API key not configured — AI orchestrator will run in mock mode.');
      this.openaiClient = null;
    } else {
      console.log('✅ OpenAI API key configured — AI orchestrator ready.');
      this.openaiClient = new OpenAI({ apiKey });
    }

    this.config = this.getOptimalModelConfig();
  }

  /* -------- Public API -------- */

  /**
   * Analyze content to understand context and requirements.
   * Uses cache + structured JSON output.
   */
  async analyzeContent(prompt: string, params: GenerationParams): Promise<ContentAnalysis> {
    const cacheKey = `analysis:${this.hashString(JSON.stringify({ prompt, params }))}`;
    const cached = this.getFromCache<ContentAnalysis>(cacheKey);
    if (cached) return cached;

    // Mock mode (no OpenAI key)
    if (!this.openaiClient && !this.hasAnyProviderKey()) {
      const mock = this.getMockContentAnalysis(prompt, params);
      this.setCache(cacheKey, mock);
      return mock;
    }

    const analysisPrompt = this.buildContentAnalysisPrompt(prompt, params);

    // Choose model/provider (specialized contentAnalysis)
    const provider = this.config.primary.provider; // keep it simple: same provider for specialized
    const model = this.config.specialized.contentAnalysis;
    const temperature = 0.2;
    const maxTokens = 1200;

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content:
          'You are an expert content analyst specializing in presentation design, instructional design, and audience psychology. Respond ONLY with a strict JSON object matching the requested schema.',
      },
      { role: 'user', content: analysisPrompt },
    ];

    try {
      const raw = await this.callLLMJSON({
        provider,
        model,
        temperature,
        maxTokens,
        messages,
        label: 'content-analysis',
      });

      const analysis = this.coerceContentAnalysis(raw);
      this.setCache(cacheKey, analysis);
      console.log('✅ Content analysis completed:', {
        category: analysis.category,
        complexity: analysis.complexity,
        suggestedLayouts: analysis.suggestedLayouts.slice(0, 3),
      });
      return analysis;
    } catch (err) {
      console.error('❌ Content analysis failed; returning heuristic fallback:', err);
      const fb = this.getFallbackAnalysis(prompt, params);
      this.setCache(cacheKey, fb);
      return fb;
    }
  }

  /**
   * Generate enhanced slide content using the full pipeline:
   * base → copy polish → visual design → context optimization → validation.
   */
  async generateEnhancedContent(context: GenerationContext): Promise<SlideSpec> {
    console.log('🚀 Starting enhanced content generation pipeline...');
    const ctx = { ...context };

    // Ensure we have analysis
    if (!ctx.contentAnalysis) {
      ctx.contentAnalysis = await this.analyzeContent(ctx.userInput.prompt, ctx.userInput);
    }

    // Mock mode (no provider keys at all)
    if (!this.openaiClient && !this.hasAnyProviderKey()) {
      return this.getMockSlideSpec(ctx);
    }

    // Step 1: Base content (primary model with fallback)
    const base = await this.generateBaseContent(ctx);

    // Step 2: Copywriting polish (specialized)
    const polished = await this.polishCopy(base, ctx);

    // Step 3: Visual design guidance (layout & visuals)
    const withVisuals = await this.enhanceVisualDesign(polished, ctx);

    // Step 4: Optimize for theme/brand/audience/accessibility
    const optimized = await this.optimizeForContext(withVisuals, ctx);

    // Step 5: Validate and finalize
    const finalContent = await this.validateAndRefine(optimized, ctx);

    console.log('✅ Enhanced content generation completed.');
    return finalContent;
  }

  /* -------- Internal: Model Config & Providers -------- */

  private getOptimalModelConfig(): AIModelConfig {
    const textConfig = getTextModelConfig();
    const preferred: Provider =
      (process.env.AI_PRIMARY_PROVIDER as Provider) || 'openai';

    return {
      primary: {
        provider: preferred,
        model: textConfig.model, // e.g., "gpt-4o" or similar
        temperature: textConfig.temperature,
        maxTokens: textConfig.maxTokens,
      },
      fallback: {
        provider: preferred, // keep same provider; we still can swap to Anthropic/Gemini at runtime if keys exist
        model: textConfig.fallbackModel, // e.g., "gpt-4o-mini"
        temperature: textConfig.temperature,
        maxTokens: Math.floor(textConfig.maxTokens * 0.8),
      },
      specialized: {
        contentAnalysis: 'gpt-4o-mini', // fast & cost-effective
        visualDesign: 'gpt-4o',         // richer reasoning for layout/visuals
        copywriting: 'gpt-4o-mini',     // punchy copy & concise bullets
      },
    };
  }

  private hasAnyProviderKey() {
    return Boolean(
      process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.GOOGLE_API_KEY
    );
  }

  /* -------- Internal: Pipeline Steps -------- */

  private async generateBaseContent(context: GenerationContext): Promise<Partial<SlideSpec>> {
    const { userInput, contentAnalysis } = context;
    const prompt = this.buildEnhancedContentPrompt(userInput, contentAnalysis);

    const provider = this.config.primary.provider;
    const model = this.pickModelByBudget(this.config.primary.model, userInput.prompt);

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content:
          'You are an award-winning presentation designer and content strategist. Create concise, high-impact slide content. Output ONLY a strict JSON object as per schema.',
      },
      { role: 'user', content: prompt },
    ];

    const raw = await this.callLLMJSONWithFallback(
      { provider, model, messages, temperature: this.config.primary.temperature, maxTokens: this.config.primary.maxTokens, label: 'base-content' },
      { provider: this.config.fallback.provider, model: this.config.fallback.model }
    );

    return this.coerceSlidePartial(raw);
  }

  private async polishCopy(base: Partial<SlideSpec>, context: GenerationContext): Promise<Partial<SlideSpec>> {
    const { userInput } = context;
    const prompt = [
      'Polish the slide copy for clarity, brevity, and punch while preserving meaning.',
      `Audience: ${userInput.audience}`,
      `Tone: ${userInput.tone}`,
      `Length target: ${userInput.contentLength}`,
      'Return JSON with any improved fields. Only include fields that change.',
      '',
      'Current slide JSON:',
      JSON.stringify(base, null, 2),
    ].join('\n');

    const messages: ChatMessage[] = [
      { role: 'system', content: 'You are a senior copy editor for executive presentations. Output ONLY valid JSON.' },
      { role: 'user', content: prompt },
    ];

    try {
      const raw = await this.callLLMJSON({
        provider: this.config.primary.provider,
        model: this.config.specialized.copywriting,
        temperature: 0.4,
        maxTokens: 800,
        messages,
        label: 'copy-polish',
      });
      const delta = this.coerceSlidePartial(raw);
      return { ...base, ...delta };
    } catch {
      // Non-fatal: return base content if polish fails
      return base;
    }
  }

  private async enhanceVisualDesign(base: Partial<SlideSpec>, context: GenerationContext): Promise<Partial<SlideSpec>> {
    const { contentAnalysis, brandGuidelines } = context;

    const prompt = [
      'Suggest visual design improvements aligned with the analysis and brand.',
      'Return ONLY JSON with any of: layout, design.visualHints[], design.theme, design.palette[], visuals[].',
      '',
      'Content analysis:',
      JSON.stringify(contentAnalysis, null, 2),
      '',
      'Brand guidelines:',
      JSON.stringify(brandGuidelines || {}, null, 2),
      '',
      'Current slide JSON:',
      JSON.stringify(base, null, 2),
    ].join('\n');

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content:
          'You are a presentation art director and information designer. Choose layouts and visuals that maximize clarity and retention. Output ONLY valid JSON.',
      },
      { role: 'user', content: prompt },
    ];

    try {
      const raw = await this.callLLMJSON({
        provider: this.config.primary.provider,
        model: this.config.specialized.visualDesign,
        temperature: 0.5,
        maxTokens: 900,
        messages,
        label: 'visual-design',
      });

      const delta = this.coerceSlidePartial(raw);
      const merged = { ...base, ...delta };

      // Normalize helpful fields
      if ((merged as any).bullets) (merged as any).bullets = tidyBullets((merged as any).bullets);

      return merged;
    } catch {
      return base;
    }
  }

  private async optimizeForContext(
    content: Partial<SlideSpec>,
    context: GenerationContext
  ): Promise<Partial<SlideSpec>> {
    const out: any = { ...content };

    // Apply brand theme defaults if not set
    if (context.presentationTheme && !out.design?.theme) {
      out.design = out.design || {};
      out.design.theme = (context.presentationTheme as any).name || 'corporate-blue';
    }

    // Inject gentle brand cues
    if (context.brandGuidelines) {
      out.design = out.design || {};
      if (!out.design.palette && context.brandGuidelines.colors?.length) {
        out.design.palette = context.brandGuidelines.colors.slice(0, 5);
      }
      if (!out.design.fonts && context.brandGuidelines.fonts?.length) {
        out.design.fonts = context.brandGuidelines.fonts.slice(0, 2);
      }
      if (context.brandGuidelines.logoUrl) {
        out.design.logo = { url: context.brandGuidelines.logoUrl, placement: 'corner-right' };
      }
    }

    // Accessibility tweaks
    if (context.constraints?.accessibilityLevel) {
      out.accessibility = {
        contrast: context.constraints.accessibilityLevel !== 'basic' ? 'AA' : 'A',
        fontMinSizePt: context.constraints.accessibilityLevel === 'full' ? 14 : 12,
        altText: this.buildAltText(out),
      };
    }

    // Keep bullets tight & readable
    if (out.bullets) {
      out.bullets = tidyBullets(out.bullets);
    }

    return out;
  }

  private async validateAndRefine(
    content: Partial<SlideSpec>,
    context: GenerationContext
  ): Promise<SlideSpec> {
    // Use smart layout selector for better layout matching
    let selectedLayout = content.layout;
    if (!selectedLayout || selectedLayout === 'mixed-content') {
      const layoutScore = smartLayoutSelector.selectOptimalLayout(content, context.contentAnalysis);
      selectedLayout = layoutScore.layoutId as any;
      console.log('🎯 Smart layout selected:', selectedLayout, 'with confidence:', Math.round(layoutScore.confidence * 100) + '%');
    }

    let final: any = {
      title: content.title || this.makeTitleFromPrompt(context.userInput.prompt),
      layout: selectedLayout || this.pickDefaultLayout(context.contentAnalysis),
      bullets: tidyBullets(content.bullets),
      paragraph: content.paragraph?.trim(),
      imagePrompt: content.imagePrompt,
      generateImage: content.generateImage,
      design: content.design || { theme: 'corporate-blue' },
      notes: content.notes,
      accessibility: (content as any).accessibility,
    };

    // Apply industry-specific content intelligence
    try {
      final = await industryContentEngine.generateIndustryContent(
        context.userInput,
        context.contentAnalysis,
        final
      );
      console.log('🏭 Applied industry-specific adaptations');
    } catch (error) {
      console.warn('⚠️ Industry adaptation failed:', error);
    }

    // Apply audience-specific adaptations
    try {
      const audienceResult = await audienceAdaptationEngine.adaptForAudience(
        final,
        context.userInput,
        context.contentAnalysis
      );
      final = audienceResult.adaptedSlide;
      console.log('👥 Applied audience adaptations:', audienceResult.adaptationsSummary.join(', '));
    } catch (error) {
      console.warn('⚠️ Audience adaptation failed:', error);
    }

    // Apply source validation and citations
    try {
      const validationResult = await sourceValidationEngine.validateAndCiteContent(final);
      final = validationResult.enhancedSlide;
      console.log('📚 Added citations and source validation. Confidence:', Math.round(validationResult.validation.confidence * 100) + '%');
    } catch (error) {
      console.warn('⚠️ Source validation failed:', error);
    }

    // Ensure required minimal fields exist
    if (!final.layout) final.layout = 'title-bullets';

    // Truncate overly long paragraph
    if (final.paragraph && final.paragraph.length > 800) {
      final.paragraph = final.paragraph.slice(0, 799) + '…';
    }

    // Remove empties
    Object.keys(final).forEach((k) => {
      const v = final[k];
      if (
        v === undefined ||
        v === null ||
        (Array.isArray(v) && v.length === 0) ||
        (typeof v === 'string' && v.trim() === '')
      ) {
        delete final[k];
      }
    });

    return final as SlideSpec;
  }

  /* -------- Internal: Prompt Builders -------- */

  private buildContentAnalysisPrompt(prompt: string, params: GenerationParams): string {
    return `Analyze the following presentation request and provide structured insights as STRICT JSON.

CONTENT TO ANALYZE:
"""${prompt}"""

CONTEXT:
- Target Audience: ${params.audience}
- Desired Tone: ${params.tone}
- Content Length: ${params.contentLength}
- Industry: ${params.industry || 'general'}

LAYOUT SELECTION GUIDELINES:
- Use "title" for presentation titles/covers
- Use "title-bullets" for lists, key points, features
- Use "two-column" for comparisons, pros/cons, before/after
- Use "timeline" for processes, steps, chronological content
- Use "chart" for data, metrics, statistics, performance
- Use "quote" for testimonials, quotes, key messages
- Use "comparison-table" for detailed comparisons
- Use "mixed-content" for complex content with multiple elements

Return ONLY a JSON object with this exact shape:
{
  "category": "business|technical|creative|educational|scientific",
  "complexity": "simple|moderate|complex|expert",
  "sentiment": "positive|neutral|negative|mixed",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "entities": [
    { "text": "entity", "type": "person|organization|location|product|concept", "confidence": 0.95 }
  ],
  "suggestedLayouts": ["title-bullets", "two-column", "chart"],
  "visualElements": [
    { "type": "chart|image|diagram|timeline|table", "relevance": 0.85, "description": "Brief description" }
  ],
  "toneAlignment": 0.90,
  "audienceAlignment": 0.85
}`;
  }

  private buildEnhancedContentPrompt(params: GenerationParams, analysis: ContentAnalysis): string {
    const schemaHint = `Return ONLY a JSON object with optional fields: {
  "title": string,
  "layout": string, // e.g., "title-bullets", "two-column", "quote", "timeline", "comparison", "chart"
  "bullets": string[],
  "paragraph": string,
  "timeline": [{ "date": string, "title": string, "description": string }], // Required if layout is "timeline"
  "chart": { "type": string, "data": any, "title": string }, // Required if layout is "chart"
  "comparisonTable": { "headers": string[], "rows": any[][] }, // Required if layout is "comparison-table"
  "quote": { "text": string, "author": string, "context": string }, // Required if layout is "quote"
  "left": { "bullets": string[], "paragraph": string }, // For two-column layouts
  "right": { "bullets": string[], "paragraph": string }, // For two-column layouts
  "visuals": [
    { "type": "chart|image|diagram|timeline|table", "title"?: string, "description"?: string, "dataHint"?: string }
  ],
  "design": {
    "theme"?: string,
    "palette"?: string[],
    "fonts"?: string[],
    "visualHints"?: string[]
  },
  "notes": string
}`;

    return `Create compelling slide content using the analysis below.

ORIGINAL REQUEST:
"""${params.prompt}"""

CONTENT ANALYSIS (summarized):
- Category: ${analysis.category}
- Complexity: ${analysis.complexity}
- Top Keywords: ${analysis.keywords.slice(0, 6).join(', ')}
- Suggested Layouts: ${analysis.suggestedLayouts.slice(0, 4).join(', ')}
- Recommended Visuals: ${analysis.visualElements.map((v) => v.type).slice(0, 5).join(', ')}

TARGET SPECS:
- Audience: ${params.audience}
- Tone: ${params.tone}
- Length: ${params.contentLength}

Guidelines:
- Prefer clarity over jargon; match complexity level.
- If bullets are used, keep to 3–6 crisp bullets, ≤ 140 characters each.
- Provide at most one short paragraph if the layout invites it.
- Include visuals only when they add value (title/description/dataHint).
- Avoid marketing fluff; be concrete and useful.

LAYOUT-SPECIFIC REQUIREMENTS:
- If using "timeline" layout: MUST include "timeline" array with at least 2 items
- If using "chart" layout: MUST include "chart" object with data
- If using "comparison-table" layout: MUST include "comparisonTable" object
- If using "quote" layout: MUST include "quote" object with text and author
- If using "two-column" layout: MUST include both "left" and "right" objects

${schemaHint}`;
  }

  /* -------- Internal: Provider Calls -------- */

  private async callLLMJSON(args: {
    provider: Provider;
    model: string;
    messages: ChatMessage[];
    temperature: number;
    maxTokens: number;
    label?: string;
  }): Promise<any> {
    const key = `req:${this.hashString(JSON.stringify(args))}`;
    const inflight = this.inFlight.get(key);
    if (inflight) return inflight;

    const runner = (async () => {
      try {
        const res = await withTimeout(
          this._callLLMJSONCore(args),
          DEFAULT_TIMEOUT_MS,
          args.label || 'llm-call'
        );
        return res;
      } finally {
        this.inFlight.delete(key);
      }
    })();

    this.inFlight.set(key, runner);
    return runner;
  }

  private async _callLLMJSONCore({
    provider,
    model,
    messages,
    temperature,
    maxTokens,
    label,
  }: {
    provider: Provider;
    model: string;
    messages: ChatMessage[];
    temperature: number;
    maxTokens: number;
    label?: string;
  }): Promise<any> {
    const requireStrictJSON =
      'Return ONLY a valid JSON object. Do not include code fences or commentary.';
    const userTail: ChatMessage = { role: 'user', content: requireStrictJSON };
    const msgs = [...messages, userTail];

    if (provider === 'openai') {
      if (!this.openaiClient) throw new Error('OpenAI client not configured.');
      const response = await this.openaiClient.chat.completions.create({
        model,
        messages: msgs,
        temperature,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
      });
      const content = response.choices[0]?.message?.content || '{}';
      return safeJSONParse(content, label || 'OpenAI JSON');
    }

    if (provider === 'anthropic') {
      const key = process.env.ANTHROPIC_API_KEY;
      if (!key) throw new Error('Anthropic API key not configured.');
      const sys = msgs.filter((m) => m.role === 'system').map((m) => m.content).join('\n\n');
      const nonSystem = msgs.filter((m) => m.role !== 'system');

      const body = {
        model,
        max_tokens: Math.max(256, Math.min(4096, maxTokens)),
        temperature,
        system: sys || undefined,
        messages: nonSystem.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: [{ type: 'text', text: m.content }],
        })),
      };

      const resp = await fetch(ANTHROPIC_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const txt = await resp.text().catch(() => '');
        throw new Error(`Anthropic error ${resp.status}: ${txt || resp.statusText}`);
      }

      const json: any = await resp.json();
      const text = (json?.content?.[0]?.text as string) || '{}';
      return safeJSONParse(text, label || 'Anthropic JSON');
    }

    // google (Gemini)
    if (provider === 'google') {
      const key = process.env.GOOGLE_API_KEY;
      if (!key) throw new Error('Google API key not configured.');
      const sys = msgs.filter((m) => m.role === 'system').map((m) => m.content).join('\n\n');
      const user = msgs
        .filter((m) => m.role !== 'system')
        .map((m) => m.content)
        .join('\n\n');

      const body = {
        contents: [
          {
            role: 'user',
            parts: [{ text: [sys, user].filter(Boolean).join('\n\n') }],
          },
        ],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      };

      const resp = await fetch(GEMINI_URL(model, key), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const txt = await resp.text().catch(() => '');
        throw new Error(`Gemini error ${resp.status}: ${txt || resp.statusText}`);
      }

      const json: any = await resp.json();
      const text =
        json?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).join('') ||
        json?.candidates?.[0]?.content?.parts?.[0]?.text ||
        '{}';

      return safeJSONParse(text, label || 'Gemini JSON');
    }

    throw new Error(`Unsupported provider: ${provider}`);
  }

  private async callLLMJSONWithFallback(
    primary: {
      provider: Provider;
      model: string;
      messages: ChatMessage[];
      temperature: number;
      maxTokens: number;
      label?: string;
    },
    fallback: { provider: Provider; model: string }
  ): Promise<any> {
    const tries: Array<{ provider: Provider; model: string }> = [
      { provider: primary.provider, model: primary.model },
    ];

    // If primary call fails and other providers are available, try them in priority order:
    // 1) Same provider fallback model
    // 2) Anthropic (if key present)
    // 3) Google (if key present)
    tries.push({ provider: fallback.provider, model: fallback.model });

    if (process.env.ANTHROPIC_API_KEY) tries.push({ provider: 'anthropic', model: 'claude-3-5-sonnet-20240620' });
    if (process.env.GOOGLE_API_KEY) tries.push({ provider: 'google', model: 'gemini-1.5-pro' });

    let lastErr: unknown = null;

    for (let i = 0; i < tries.length; i++) {
      const t = tries[i];
      try {
        return await this.callLLMJSON({
          provider: t.provider,
          model: t.model,
          messages: primary.messages,
          temperature: primary.temperature,
          maxTokens: primary.maxTokens,
          label: primary.label ? `${primary.label}:${t.provider}` : t.provider,
        });
      } catch (err) {
        lastErr = err;
        const backoff = 300 * (i + 1);
        await sleep(backoff);
      }
    }

    throw lastErr instanceof Error
      ? lastErr
      : new Error('LLM call failed after all fallbacks.');
  }

  /* -------- Internal: Coercion/Heuristics -------- */

  private coerceContentAnalysis(raw: any): ContentAnalysis {
    const c = raw || {};
    const out: ContentAnalysis = {
      category: ['business', 'technical', 'creative', 'educational', 'scientific'].includes(
        c.category
      )
        ? c.category
        : 'business',
      complexity: ['simple', 'moderate', 'complex', 'expert'].includes(c.complexity)
        ? c.complexity
        : 'moderate',
      sentiment: ['positive', 'neutral', 'negative', 'mixed'].includes(c.sentiment)
        ? c.sentiment
        : 'neutral',
      keywords: Array.isArray(c.keywords) ? c.keywords.map(String).slice(0, 12) : [],
      entities: Array.isArray(c.entities)
        ? c.entities
            .map((e: any) => ({
              text: String(e.text || ''),
              type: ['person', 'organization', 'location', 'product', 'concept'].includes(e.type)
                ? e.type
                : 'concept',
              confidence: clamp(Number(e.confidence ?? 0.8), 0, 1),
            }))
            .filter((e: any) => e.text)
        : [],
      suggestedLayouts: normalizeList(c.suggestedLayouts || ['title-bullets', 'two-column'], 6)!,
      visualElements: Array.isArray(c.visualElements)
        ? c.visualElements
            .map((v: any) => ({
              type: ['chart', 'image', 'diagram', 'timeline', 'table'].includes(v.type)
                ? v.type
                : 'image',
              relevance: clamp(Number(v.relevance ?? 0.7), 0, 1),
              description: String(v.description || ''),
            }))
            .slice(0, 6)
        : [{ type: 'image', relevance: 0.7, description: 'Supporting visual content' }],
      toneAlignment: clamp(Number(c.toneAlignment ?? 0.85), 0, 1),
      audienceAlignment: clamp(Number(c.audienceAlignment ?? 0.85), 0, 1),
    };
    return out;
  }

  private coerceSlidePartial(raw: any): Partial<SlideSpec> {
    const r: any = raw || {};
    const out: any = {};

    if (r.title) out.title = String(r.title);
    if (r.layout) out.layout = String(r.layout);

    if (Array.isArray(r.bullets)) out.bullets = tidyBullets(r.bullets);
    if (r.paragraph) out.paragraph = String(r.paragraph);

    // Handle image-related properties
    if (r.imagePrompt) out.imagePrompt = String(r.imagePrompt);
    if (typeof r.generateImage === 'boolean') out.generateImage = r.generateImage;
    if (r.imageUrl) out.imageUrl = String(r.imageUrl);
    if (r.altText) out.altText = String(r.altText);

    if (r.design) {
      out.design = {
        theme: r.design.theme,
        palette: Array.isArray(r.design.palette) ? r.design.palette.slice(0, 6) : undefined,
        fonts: Array.isArray(r.design.fonts) ? r.design.fonts.slice(0, 3) : undefined,
        visualHints: Array.isArray(r.design.visualHints)
          ? r.design.visualHints.slice(0, 6)
          : undefined,
        logo: r.design.logo,
      };
    }

    if (r.notes) out.notes = String(r.notes);

    return out;
  }

  private pickDefaultLayout(analysis: ContentAnalysis): string {
    const preferred = analysis.suggestedLayouts?.[0];
    if (preferred) return preferred;

    // Enhanced layout selection based on content characteristics
    switch (analysis.category) {
      case 'technical':
        return analysis.complexity === 'complex' || analysis.complexity === 'expert' ? 'two-column' : 'title-bullets';
      case 'creative':
        return analysis.visualElements?.length > 0 ? 'mixed-content' : 'quote';
      case 'educational':
        // Check for timeline-related visual elements
        const hasTimeline = analysis.visualElements?.some(ve => ve.type === 'timeline');
        return hasTimeline ? 'timeline' : 'title-bullets';
      case 'business':
        // Check for chart-related visual elements
        const hasChart = analysis.visualElements?.some(ve => ve.type === 'chart');
        return hasChart ? 'chart' : 'title-bullets';
      case 'scientific':
        return analysis.complexity === 'expert' ? 'two-column' : 'title-bullets';
      default:
        return 'title-bullets';
    }
  }

  private makeTitleFromPrompt(prompt: string): string {
    const trimmed = prompt.trim().replace(/\s+/g, ' ');
    if (trimmed.length <= 60) return trimmed;
    return trimmed.slice(0, 57) + '…';
  }

  private buildAltText(content: Partial<SlideSpec>): string[] | undefined {
    const visuals: any[] = (content as any).visuals || [];
    if (!visuals.length) return undefined;
    return visuals.map((v, i) => {
      const desc = v.description || v.title || v.type;
      return `Visual ${i + 1}: ${desc}`;
    });
  }

  private pickModelByBudget(primaryModel: string, prompt: string): string {
    // If input is short, prefer smaller/cheaper model when available
    const tks = estimateTokens(prompt);
    if (tks < 1200 && /-mini/i.test(this.config.fallback.model)) return this.config.fallback.model;
    return primaryModel;
  }

  /* -------- Cache & Hash -------- */

  private getFromCache<T>(key: string): T | null {
    const ent = this.cache.get(key);
    if (!ent) return null;
    if (Date.now() > ent.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return ent.value as T;
  }

  private setCache<T>(key: string, value: T, ttl = DEFAULT_CACHE_TTL_MS) {
    this.cache.set(key, { value, expiresAt: Date.now() + ttl });
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // 32‑bit
    }
    return Math.abs(hash).toString(36);
  }

  /* -------- Heuristic Fallbacks / Mocks -------- */

  private getFallbackAnalysis(prompt: string, params: GenerationParams): ContentAnalysis {
    const words = prompt.toLowerCase().split(/\W+/);
    const category = this.inferCategory(words);
    const complexity = this.inferComplexity(words, params);
    const keywords = this.extractKeywords(words);

    return {
      category,
      complexity,
      sentiment: 'neutral',
      keywords,
      entities: [],
      suggestedLayouts: ['title-bullets', 'two-column'],
      visualElements: [
        { type: 'image', relevance: 0.7, description: 'Supporting visual content' },
      ],
      toneAlignment: 0.8,
      audienceAlignment: 0.8,
    };
  }

  private inferCategory(words: string[]): ContentAnalysis['category'] {
    const business = ['sales', 'revenue', 'profit', 'market', 'strategy', 'business'];
    const technical = ['api', 'database', 'algorithm', 'software', 'system', 'architecture'];
    const creative = ['design', 'brand', 'creative', 'visual', 'art', 'marketing'];
    const educational = ['learn', 'teach', 'education', 'training', 'course', 'lesson'];

    if (words.some((w) => business.includes(w))) return 'business';
    if (words.some((w) => technical.includes(w))) return 'technical';
    if (words.some((w) => creative.includes(w))) return 'creative';
    if (words.some((w) => educational.includes(w))) return 'educational';
    return 'business';
  }

  private inferComplexity(_words: string[], params: GenerationParams): ContentAnalysis['complexity'] {
    if ((params as any).audience === 'executives') return 'simple';
    if ((params as any).audience === 'technical') return 'complex';
    if ((params as any).contentLength === 'brief') return 'simple';
    if ((params as any).contentLength === 'comprehensive') return 'complex';
    return 'moderate';
  }

  private extractKeywords(words: string[]): string[] {
    const stop = new Set([
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
      'from',
      'that',
      'this',
      'is',
      'are',
      'be',
      'as',
      'it',
      'we',
      'you',
      'they',
    ]);
    return words
      .filter((w) => w && w.length > 3 && !stop.has(w))
      .slice(0, 8);
  }

  private getMockContentAnalysis(_prompt: string, _params: GenerationParams): ContentAnalysis {
    return {
      category: 'business',
      complexity: 'moderate',
      sentiment: 'positive',
      keywords: ['presentation', 'business', 'analysis'],
      entities: [{ text: 'Business', type: 'concept', confidence: 0.9 }],
      suggestedLayouts: ['title-bullets', 'two-column'],
      visualElements: [
        { type: 'chart', relevance: 0.8, description: 'Business metrics chart' },
      ],
      toneAlignment: 0.85,
      audienceAlignment: 0.9,
    };
  }

  private getMockSlideSpec(context: GenerationContext): SlideSpec {
    return {
      title: `Enhanced Slide: ${context.userInput.prompt.substring(0, 50)}…`,
      layout: 'title-bullets',
      bullets: [
        'This is a mock slide generated for testing',
        'Enhanced AI features are being demonstrated',
        'Real content would be generated with provider APIs',
      ],
      paragraph:
        'This slide demonstrates the enhanced AI PowerPoint generator capabilities in development mode.',
      design: { theme: 'corporate-blue' } as any,
    } as SlideSpec;
  }
}

/* ---------- Export singleton ---------- */

export const aiOrchestrator = new AIOrchestrator();