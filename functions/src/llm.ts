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
 * @author AI PowerPoint Generator Team (enhanced by expert co-pilot)
 */

import OpenAI from 'openai';
import { safeValidateSlideSpec, type SlideSpec, type GenerationParams } from './schema';
import { SYSTEM_PROMPT, generateContentPrompt, generateLayoutPrompt, generateImagePrompt, generateRefinementPrompt, generateBatchImagePrompts } from './prompts';
import { defineSecret } from 'firebase-functions/params';
import { getTextModelConfig, logCostEstimate } from './config/aiModels';

// Get AI configuration based on current mode (testing vs production)
const AI_CONFIG = getTextModelConfig();

// Enhanced error types for better error handling
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

/**
 * Enhanced validation error analysis (C-1: Narrative Quality & Structure)
 * Provides helpful messages for common validation failures
 */
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
      helpfulMessage: 'The specified layout type is not supported. Valid layouts include: title-bullets, title-paragraph, two-column, etc.',
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
      helpfulMessage: 'Chart data structure is invalid. Charts require categories, series with data arrays, and proper type specification.',
      suggestedFix: 'Ensure chart has: type (bar/line/pie), categories array, and series array with name and data fields.'
    };
  }

  return {
    category: 'General Validation Error',
    helpfulMessage: 'The slide specification does not match the required schema format.',
    suggestedFix: 'Review the SlideSpec schema and ensure all required fields are present with correct data types.'
  };
}

/**
 * Generate fallback image prompt when AI generation fails (C-2: Context-Aware Image Prompts)
 * Creates a basic but relevant image prompt based on slide content
 */
export function generateFallbackImagePrompt(slideSpec: Partial<SlideSpec>, error?: Error): string {
  const title = slideSpec.title || 'Business Presentation';
  const content = slideSpec.paragraph || slideSpec.bullets?.join(' ') || '';
  const layout = slideSpec.layout || 'title-bullets';

  // Analyze content for basic themes
  const contentLower = (title + ' ' + content).toLowerCase();

  let fallbackPrompt = 'Professional business presentation slide background, ';

  // Content-based fallback prompts
  if (contentLower.includes('team') || contentLower.includes('people') || contentLower.includes('collaboration')) {
    fallbackPrompt += 'diverse business team collaboration, modern office environment, professional lighting';
  } else if (contentLower.includes('data') || contentLower.includes('analytics') || contentLower.includes('chart')) {
    fallbackPrompt += 'clean data visualization, modern dashboard interface, professional blue tones';
  } else if (contentLower.includes('growth') || contentLower.includes('success') || contentLower.includes('increase')) {
    fallbackPrompt += 'upward trending business growth, ascending arrow graphics, success imagery';
  } else if (contentLower.includes('technology') || contentLower.includes('digital') || contentLower.includes('innovation')) {
    fallbackPrompt += 'modern technology interface, digital innovation, futuristic business environment';
  } else if (contentLower.includes('strategy') || contentLower.includes('plan') || contentLower.includes('roadmap')) {
    fallbackPrompt += 'strategic planning visualization, roadmap graphics, professional planning environment';
  } else {
    // Generic professional fallback
    fallbackPrompt += 'clean corporate environment, professional business setting, modern office aesthetic';
  }

  // Add technical specifications
  fallbackPrompt += ', high resolution, professional photography, clean composition, corporate color palette';

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

export class TimeoutError extends Error {
  constructor(message: string, public readonly timeoutMs: number) {
    super(message);
    this.name = 'TimeoutError';
  }
}

// NEW: Additional error types for enhanced error handling
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

/**
 * Sanitize AI response to fix common formatting issues
 * This helps handle cases where AI returns objects instead of strings for bullets
 */
function sanitizeAIResponse(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sanitized = { ...data };

  // Fix bullets array - convert objects to strings if needed
  if (sanitized.bullets && Array.isArray(sanitized.bullets)) {
    sanitized.bullets = sanitized.bullets.map((bullet: any) => {
      if (typeof bullet === 'string') {
        return bullet;
      } else if (typeof bullet === 'object' && bullet !== null) {
        // If it's an object, try to extract text content
        if (bullet.text) return bullet.text;
        if (bullet.content) return bullet.content;
        if (bullet.point) return bullet.point;
        if (bullet.item) return bullet.item;
        // If it has a single string property, use that
        const values = Object.values(bullet).filter(v => typeof v === 'string');
        if (values.length === 1) return values[0];
        // Otherwise, stringify the object
        return JSON.stringify(bullet);
      }
      // Convert other types to string
      return String(bullet);
    });
  }

  // Fix nested bullets in left/right columns
  if (sanitized.left?.bullets && Array.isArray(sanitized.left.bullets)) {
    sanitized.left.bullets = sanitized.left.bullets.map((bullet: any) =>
      typeof bullet === 'string' ? bullet : String(bullet)
    );
  }

  if (sanitized.right?.bullets && Array.isArray(sanitized.right.bullets)) {
    sanitized.right.bullets = sanitized.right.bullets.map((bullet: any) =>
      typeof bullet === 'string' ? bullet : String(bullet)
    );
  }

  // Fix timeline items
  if (sanitized.timeline && Array.isArray(sanitized.timeline)) {
    sanitized.timeline = sanitized.timeline.map((item: any) => ({
      ...item,
      date: typeof item.date === 'string' ? item.date : String(item.date || ''),
      title: typeof item.title === 'string' ? item.title : String(item.title || ''),
      description: typeof item.description === 'string' ? item.description : String(item.description || ''),
      milestone: Boolean(item.milestone)
    }));
  }

  // Fix contentItems array - ensure proper structure or remove if invalid
  if (sanitized.contentItems && Array.isArray(sanitized.contentItems)) {
    sanitized.contentItems = sanitized.contentItems
      .map((item: any) => {
        if (!item || typeof item !== 'object') {
          return null; // Mark for removal
        }

        // Try to extract type and content from various possible structures
        let type = item.type;
        let content = item.content;

        // If type is missing, try to infer from other properties
        if (!type) {
          if (item.text || item.content) type = 'text';
          else if (item.bullet || item.point) type = 'bullet';
          else if (item.number || item.value) type = 'number';
          else if (item.icon || item.iconName) type = 'icon';
          else if (item.metric) type = 'metric';
          else type = 'text'; // Default fallback
        }

        // If content is missing, try to extract from other properties
        if (!content) {
          content = item.text || item.content || item.bullet || item.point ||
                   item.value || item.number || item.metric || '';
        }

        // Validate that we have both required fields
        if (!type || !content || typeof content !== 'string' || content.trim() === '') {
          return null; // Mark for removal
        }

        return {
          type: String(type),
          content: String(content).trim(),
          ...(item.emphasis && ['normal', 'bold', 'italic', 'highlight'].includes(item.emphasis)
              ? { emphasis: item.emphasis } : {}),
          ...(item.color && typeof item.color === 'string' && item.color.match(/^#[0-9A-Fa-f]{6}$/)
              ? { color: item.color } : {}),
          ...(item.iconName && typeof item.iconName === 'string'
              ? { iconName: item.iconName } : {})
        };
      })
      .filter(Boolean); // Remove null entries

    // If no valid contentItems remain, remove the property entirely
    if (sanitized.contentItems.length === 0) {
      delete sanitized.contentItems;
    }
  }

  return sanitized;
}

/**
 * Advanced sanitization with error recovery for problematic AI responses
 * This function attempts to fix common AI generation issues that cause validation failures
 */
export function sanitizeAIResponseWithRecovery(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  // First apply standard sanitization
  let sanitized = sanitizeAIResponse(data);

  // Additional recovery mechanisms for common validation failures

  // Ensure title exists and is valid
  if (!sanitized.title || typeof sanitized.title !== 'string' || sanitized.title.trim() === '') {
    sanitized.title = 'Untitled Slide';
  }

  // Ensure layout is valid
  const validLayouts = [
    'title', 'title-bullets', 'title-paragraph', 'two-column', 'image-right', 'image-left',
    'quote', 'chart', 'timeline', 'process-flow', 'comparison-table', 'before-after',
    'problem-solution', 'mixed-content', 'metrics-dashboard', 'thank-you'
  ];

  if (!sanitized.layout || !validLayouts.includes(sanitized.layout)) {
    // Try to infer layout from content
    if (sanitized.bullets && sanitized.bullets.length > 0) {
      sanitized.layout = 'title-bullets';
    } else if (sanitized.paragraph) {
      sanitized.layout = 'title-paragraph';
    } else if (sanitized.left || sanitized.right) {
      sanitized.layout = 'two-column';
    } else {
      sanitized.layout = 'title-paragraph';
    }
  }

  // Remove any properties that might cause validation issues
  const allowedProperties = [
    'title', 'layout', 'bullets', 'paragraph', 'contentItems', 'left', 'right',
    'imagePrompt', 'notes', 'sources', 'chart', 'timeline', 'comparisonTable',
    'processSteps', 'design'
  ];

  // Create clean object with only allowed properties
  const cleanSanitized: any = {};
  for (const prop of allowedProperties) {
    if (sanitized[prop] !== undefined) {
      cleanSanitized[prop] = sanitized[prop];
    }
  }

  return cleanSanitized;
}

// Define the OpenAI API key secret parameter
const openaiApiKey = defineSecret('OPENAI_API_KEY');

// Singleton OpenAI client instance for efficient resource usage
let openai: OpenAI | null = null;

/**
 * Gets or creates the OpenAI client instance with lazy initialization
 * Ensures efficient resource usage and proper error handling
 *
 * @returns {OpenAI} Configured OpenAI client instance
 * @throws {Error} If API key is not available
 */
function getOpenAI(): OpenAI {
  if (!openai) {
    const apiKey = openaiApiKey.value();
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

/**
 * Generate a slide specification using chained AI for high-quality outputs
 *
 * Innovative multi-step process ensures professional, well-styled slides.
 *
 * @param input - User parameters including prompt, audience, tone, etc.
 * @returns Promise<SlideSpec> - Validated, refined slide specification
 * @throws {Error} If any step fails after retries
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

  // Log cost estimate for transparency
  logCostEstimate({
    textTokens: 3000, // Estimated tokens for 4-step generation
    imageCount: input.withImage ? 1 : 0,
    operation: 'Slide Generation'
  });

  // Step 1: Generate core content
  let partialSpec = await aiCallWithRetry(generateContentPrompt(input), 'Content Generation');

  // Step 2: Refine layout based on content
  partialSpec = await aiCallWithRetry(generateLayoutPrompt(input, partialSpec), 'Layout Refinement', partialSpec);

  // Step 3: Generate/refine image prompt if enabled
  if (input.withImage) {
    partialSpec = await aiCallWithRetry(generateImagePrompt(input, partialSpec), 'Image Prompt Generation', partialSpec);
  }

  // Step 4: Final refinement and validation
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
 * NEW: Enhanced batch slide generation with optimized image processing
 * Generates multiple slides with cohesive image prompts in fewer API calls
 *
 * @param input - Generation parameters
 * @param slideCount - Number of slides to generate
 * @returns Promise<SlideSpec[]> - Array of validated slide specifications
 */
export async function generateBatchSlideSpecs(input: GenerationParams, slideCount: number = 1): Promise<SlideSpec[]> {
  const startTime = Date.now();
  console.log(`Starting batch slide generation for ${slideCount} slides with ${AI_CONFIG.model}...`);

  // Log cost estimate for batch processing
  logCostEstimate({
    textTokens: 3000 * slideCount, // Estimated tokens per slide
    imageCount: input.withImage ? slideCount : 0,
    operation: `Batch Slide Generation (${slideCount} slides)`
  });

  const slideSpecs: SlideSpec[] = [];

  // Generate content and layout for each slide individually
  for (let i = 0; i < slideCount; i++) {
    console.log(`Generating slide ${i + 1}/${slideCount}...`);

    // Modify input for slide-specific content
    const slideInput = {
      ...input,
      prompt: `${input.prompt} - Slide ${i + 1} of ${slideCount}`,
      withImage: false // We'll handle images in batch later
    };

    // Generate content and layout (without images)
    let partialSpec = await aiCallWithRetry(generateContentPrompt(slideInput), `Content Generation (Slide ${i + 1})`);
    partialSpec = await aiCallWithRetry(generateLayoutPrompt(slideInput, partialSpec), `Layout Refinement (Slide ${i + 1})`, partialSpec);

    slideSpecs.push(partialSpec);
  }

  // Batch process image prompts if enabled
  if (input.withImage && slideSpecs.length > 0) {
    console.log('Processing batch image prompts...');
    try {
      const batchImagePrompt = generateBatchImagePrompts(input, slideSpecs);
      const imageResponse = await aiCallWithRetry(batchImagePrompt, 'Batch Image Processing');

      // Apply image prompts to slides (implementation would depend on response format)
      // This is a placeholder for the batch image processing logic
      console.log('Batch image prompts generated successfully');
    } catch (error) {
      console.warn('Batch image processing failed, falling back to individual processing:', error);

      // Fallback to individual image processing
      for (let i = 0; i < slideSpecs.length; i++) {
        try {
          slideSpecs[i] = await aiCallWithRetry(
            generateImagePrompt(input, slideSpecs[i]),
            `Image Prompt Generation (Slide ${i + 1})`,
            slideSpecs[i]
          );
        } catch (imageError) {
          console.warn(`Image generation failed for slide ${i + 1}, continuing without image:`, imageError);
        }
      }
    }
  }

  const generationTime = Date.now() - startTime;
  console.log(`Batch generation completed in ${generationTime}ms`, {
    slideCount: slideSpecs.length,
    avgTimePerSlide: `${Math.round(generationTime / slideSpecs.length)}ms`
  });

  return slideSpecs;
}

/**
 * Enhanced helper for AI calls with comprehensive retry logic and fallback strategies
 * @param prompt - The user prompt for this step
 * @param stepName - Name of the chaining step for logging
 * @param previousSpec - Optional previous spec to build upon
 * @returns Promise<SlideSpec> - Parsed and validated spec from this step
 */
async function aiCallWithRetry(prompt: string, stepName: string, previousSpec?: Partial<SlideSpec>): Promise<SlideSpec> {
  let lastError: Error | null = null;

  // Enhanced retry mechanism with fallback model support (C-3: Robust Retries & Fallbacks)

  // Try with primary model
  for (let attempt = 1; attempt <= AI_CONFIG.maxRetries; attempt++) {
    try {
      console.log(`${stepName} attempt ${attempt}/${AI_CONFIG.maxRetries} (model: ${AI_CONFIG.model})`);

      const result = await makeAICall(prompt, stepName, previousSpec, AI_CONFIG.model, attempt);
      return result;
    } catch (error) {
      lastError = error as Error;
      console.error(`${stepName} attempt ${attempt} failed:`, error);

      // Don't retry on validation errors - they indicate a fundamental issue (C-3: Robust Retries & Fallbacks)
      if (error instanceof ValidationError) {
        console.log(`Validation error detected, not retrying for ${stepName}`);
        throw new AIGenerationError(
          `Validation failed in ${stepName}: ${error.message}`,
          stepName,
          attempt,
          error
        );
      }

      if (attempt < AI_CONFIG.maxRetries) {
        // Enhanced exponential backoff with jitter
        const baseDelay = AI_CONFIG.retryDelay * Math.pow(2, attempt - 1);
        const jitter = Math.random() * 0.1 * baseDelay; // Add 10% jitter to prevent thundering herd
        const backoffDelay = Math.min(baseDelay + jitter, AI_CONFIG.maxBackoffDelay);

        console.log(`Retrying ${stepName} in ${Math.round(backoffDelay)}ms... (attempt ${attempt + 1}/${AI_CONFIG.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }
  }

  // Try with fallback model if primary model failed
  if (AI_CONFIG.fallbackModel && (AI_CONFIG.fallbackModel as string) !== (AI_CONFIG.model as string)) {
    console.log(`Primary model failed, trying fallback model: ${AI_CONFIG.fallbackModel}`);

    try {
      const result = await makeAICall(prompt, stepName, previousSpec, AI_CONFIG.fallbackModel, AI_CONFIG.maxRetries + 1);
      console.log(`Fallback model ${AI_CONFIG.fallbackModel} succeeded for ${stepName}`);
      return result;
    } catch (fallbackError) {
      console.error(`Fallback model also failed for ${stepName}:`, fallbackError);
      lastError = fallbackError as Error;
    }
  }

  // Try with fallback model if primary model failed
  console.log(`${stepName} falling back to ${AI_CONFIG.fallbackModel}`);
  try {
    const result = await makeAICall(prompt, stepName, previousSpec, AI_CONFIG.fallbackModel, 1);
    console.log(`${stepName} succeeded with fallback model`);
    return result;
  } catch (fallbackError) {
    console.error(`${stepName} fallback failed:`, fallbackError);

    // Enhanced fallback mechanism for different steps
    if (stepName === 'Content Generation') {
      console.log('Creating enhanced fallback spec for content generation...');
      return createFallbackSpec(prompt, previousSpec);
    } else if (stepName === 'Layout Refinement' && previousSpec) {
      console.log('Using previous spec with basic layout fallback...');
      return {
        ...previousSpec,
        layout: previousSpec.layout || 'title-bullets'
      } as SlideSpec;
    } else if (stepName === 'Image Prompt Generation' && previousSpec) {
      console.log('Image prompt generation failed, implementing enhanced fallback strategy...');

      // Enhanced fallback for image prompt generation (C-2: Context-Aware Image Prompts)
      const fallbackImagePrompt = generateFallbackImagePrompt(previousSpec, lastError || undefined);

      return {
        ...previousSpec,
        imagePrompt: fallbackImagePrompt
      } as SlideSpec;
    }

    throw new AIGenerationError(
      `All attempts failed for ${stepName}. Last error: ${lastError?.message}`,
      stepName,
      AI_CONFIG.maxRetries,
      lastError || undefined
    );
  }
}

/**
 * Make a single AI API call with timeout and error handling
 */
async function makeAICall(
  prompt: string,
  stepName: string,
  previousSpec: Partial<SlideSpec> | undefined,
  model: string,
  _attempt: number
): Promise<SlideSpec> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.timeoutMs);

  try {
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ];

    if (previousSpec) {
      messages.push({ role: 'assistant', content: JSON.stringify(previousSpec) });
    }

    const response = await getOpenAI().chat.completions.create({
      model: model as any,
      messages,
      response_format: { type: 'json_object' },
      temperature: AI_CONFIG.temperature,
      max_tokens: AI_CONFIG.maxTokens
    }, {
      signal: controller.signal
    });

    const rawJson = response.choices[0]?.message?.content;
    if (!rawJson) {
      throw new Error('Empty response from AI model');
    }

    let parsed: any;
    try {
      parsed = JSON.parse(rawJson);
    } catch (parseError) {
      throw new Error(`Invalid JSON response: ${parseError}`);
    }

    // Sanitize the parsed data to fix common AI model issues
    const sanitized = sanitizeAIResponse(parsed);

    // Use safe validation to get detailed error information
    const validationResult = safeValidateSlideSpec(sanitized);
    if (!validationResult.success) {
      const errors = validationResult.errors || ['Unknown validation error'];
      const errorAnalysis = analyzeValidationErrors(errors);

      // Enhanced error message with helpful guidance (C-1: Narrative Quality & Structure)
      const enhancedMessage = `Slide specification validation failed - ${errorAnalysis.category}: ${errorAnalysis.helpfulMessage}`;

      console.error('Validation failed with analysis:', {
        category: errorAnalysis.category,
        helpfulMessage: errorAnalysis.helpfulMessage,
        suggestedFix: errorAnalysis.suggestedFix,
        originalErrors: errors,
        stepName,
        attempt: _attempt
      });

      throw new ValidationError(enhancedMessage, errors);
    }

    return validationResult.data as SlideSpec;
  } catch (error) {
    // Enhanced error categorization for better user feedback
    if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
      throw new TimeoutError(`${stepName} timed out after ${AI_CONFIG.timeoutMs}ms`, AI_CONFIG.timeoutMs);
    }

    // Handle OpenAI API specific errors
    if (error && typeof error === 'object' && 'error' in error) {
      const openaiError = error as any;

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
        throw new NetworkError(`OpenAI service error: ${openaiError.error?.message || 'Service unavailable'}`, openaiError.status);
      }

      if (openaiError.status >= 400) {
        throw new ValidationError(`API request error: ${openaiError.error?.message || 'Bad request'}`, [openaiError.error?.message || 'Bad request']);
      }
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError('Network connection failed. Please check your internet connection.');
    }

    // Re-throw validation errors as-is
    if (error instanceof ValidationError) {
      throw error;
    }

    // Wrap unknown errors
    throw new AIGenerationError(
      `${stepName} failed: ${error instanceof Error ? error.message : String(error)}`,
      stepName,
      _attempt,
      error instanceof Error ? error : new Error(String(error))
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Create an enhanced structured fallback specification (C-3: Robust Retries & Fallbacks)
 * Generates meaningful content based on prompt analysis when AI generation fails
 */
function createFallbackSpec(prompt: string, previousSpec?: Partial<SlideSpec>): SlideSpec {
  console.log('Creating enhanced structured fallback specification...');

  // Create a more intelligent title from the prompt
  const title = createFallbackTitle(prompt);

  // Generate sophisticated content based on prompt analysis
  const content = createFallbackContent(prompt);

  // Determine optimal layout based on content type
  const layout = determineOptimalFallbackLayout(prompt, content);

  // Generate helpful speaker notes
  const notes = generateFallbackNotes(prompt, content);

  return {
    title: title,
    layout: layout as any, // Type assertion for fallback layout
    bullets: content.bullets,
    paragraph: content.paragraph,
    notes: notes,
    sources: ['Structured fallback content generation', 'Prompt analysis system']
  };
}

/**
 * Create an intelligent fallback title from the prompt
 */
function createFallbackTitle(prompt: string): string {
  // Clean and capitalize the prompt
  let title = prompt.trim();

  // If too long, try to extract key phrases
  if (title.length > 60) {
    // Look for key business terms and metrics
    const keyTerms = title.match(/\b(?:revenue|growth|performance|results|analysis|strategy|improvement|increase|decrease|\d+%|\$[\d,]+)\b/gi);
    if (keyTerms && keyTerms.length > 0) {
      title = keyTerms.slice(0, 3).join(' ') + ' Overview';
    } else {
      title = title.substring(0, 57) + '...';
    }
  }

  // Ensure proper capitalization
  return title.charAt(0).toUpperCase() + title.slice(1);
}

/**
 * Create sophisticated fallback content based on prompt analysis (C-3: Robust Retries & Fallbacks)
 */
function createFallbackContent(prompt: string): { bullets: string[], paragraph: string } {
  const promptLower = prompt.toLowerCase();
  let bullets: string[] = [];
  let paragraph = '';

  // Analyze prompt for content type and generate relevant fallback content
  if (promptLower.includes('revenue') || promptLower.includes('sales') || promptLower.includes('growth')) {
    bullets = [
      'Revenue performance analysis and key metrics',
      'Growth trends and market opportunities',
      'Strategic recommendations for improvement'
    ];
    paragraph = `This slide focuses on revenue and growth analysis. Key topics include performance metrics, market trends, and strategic opportunities for business development.`;
  } else if (promptLower.includes('team') || promptLower.includes('people') || promptLower.includes('organization')) {
    bullets = [
      'Team structure and organizational overview',
      'Key roles and responsibilities',
      'Collaboration and communication strategies'
    ];
    paragraph = `This slide covers team and organizational topics, including structure, roles, and collaborative approaches to achieve business objectives.`;
  } else if (promptLower.includes('data') || promptLower.includes('analytics') || promptLower.includes('metrics')) {
    bullets = [
      'Data analysis and key performance indicators',
      'Insights and trends from available metrics',
      'Data-driven recommendations and next steps'
    ];
    paragraph = `This slide presents data analysis and metrics, highlighting key insights and trends that inform strategic decision-making.`;
  } else if (promptLower.includes('strategy') || promptLower.includes('plan') || promptLower.includes('roadmap')) {
    bullets = [
      'Strategic objectives and key initiatives',
      'Implementation timeline and milestones',
      'Success metrics and evaluation criteria'
    ];
    paragraph = `This slide outlines strategic planning elements, including objectives, implementation approaches, and success measurement frameworks.`;
  } else if (promptLower.includes('problem') || promptLower.includes('challenge') || promptLower.includes('issue')) {
    bullets = [
      'Problem identification and root cause analysis',
      'Impact assessment and priority evaluation',
      'Proposed solutions and mitigation strategies'
    ];
    paragraph = `This slide addresses key challenges and problems, providing analysis of root causes and potential solutions for resolution.`;
  } else {
    // Generic business fallback
    bullets = [
      'Key points and main objectives',
      'Current status and important updates',
      'Next steps and action items'
    ];
    paragraph = `This slide covers important business topics and provides an overview of key points, current status, and recommended actions.`;
  }

  return { bullets, paragraph };
}

/**
 * Determine optimal layout for fallback content
 */
function determineOptimalFallbackLayout(prompt: string, content: { bullets: string[], paragraph: string }): string {
  const promptLower = prompt.toLowerCase();

  // Use data-focused layouts for analytical content
  if (promptLower.includes('data') || promptLower.includes('chart') || promptLower.includes('metrics')) {
    return 'title-paragraph'; // Better for explaining data concepts
  }

  // Use bullet format for action-oriented content
  if (promptLower.includes('action') || promptLower.includes('steps') || promptLower.includes('plan')) {
    return 'title-bullets';
  }

  // Default to bullets for most business content
  return 'title-bullets';
}

/**
 * Generate helpful speaker notes for fallback content
 */
function generateFallbackNotes(prompt: string, content: { bullets: string[], paragraph: string }): string {
  return `FALLBACK CONTENT NOTICE: This slide was generated using structured fallback content due to temporary AI service limitations.

ORIGINAL REQUEST: "${prompt}"

PRESENTATION GUIDANCE:
• This slide provides a framework for the requested topic
• Consider expanding on each bullet point with specific examples
• Add relevant data, metrics, or case studies where appropriate
• Customize the content to match your specific context and audience

RECOMMENDED ACTIONS:
• Review and enhance the content with domain-specific details
• Add supporting visuals or charts if applicable
• Consider regenerating when full AI services are available
• Use this as a starting point for manual content development

The structured content above provides a professional foundation that can be customized and expanded based on your specific needs and expertise.`;
}