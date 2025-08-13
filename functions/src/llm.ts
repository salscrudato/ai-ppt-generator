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
import { SYSTEM_PROMPT, generateContentPrompt, generateLayoutPrompt, generateImagePrompt, generateRefinementPrompt } from './prompts';
import { defineSecret } from 'firebase-functions/params';

// Enhanced configuration constants for AI operations with resilience settings
const AI_CONFIG = {
  model: 'gpt-4o' as const,
  fallbackModel: 'gpt-4' as const, // Fallback model if primary fails
  temperature: 0.7, // Balanced creativity and consistency
  maxTokens: 2000, // Sufficient for detailed slide content
  maxRetries: 3, // Retry failed requests
  retryDelay: 1000, // 1 second delay between retries
  timeoutMs: 30000, // 30 second timeout for API calls
  maxBackoffDelay: 10000 // Maximum backoff delay
} as const;

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

export class TimeoutError extends Error {
  constructor(message: string, public readonly timeoutMs: number) {
    super(message);
    this.name = 'TimeoutError';
  }
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
  console.log('Starting chained slide generation with GPT-4o...', {
    promptLength: input.prompt?.length,
    audience: input.audience,
    tone: input.tone,
    contentLength: input.contentLength
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
 * Enhanced helper for AI calls with comprehensive retry logic and fallback strategies
 * @param prompt - The user prompt for this step
 * @param stepName - Name of the chaining step for logging
 * @param previousSpec - Optional previous spec to build upon
 * @returns Promise<SlideSpec> - Parsed and validated spec from this step
 */
async function aiCallWithRetry(prompt: string, stepName: string, previousSpec?: Partial<SlideSpec>): Promise<SlideSpec> {
  let lastError: Error | null = null;

  // Try with primary model
  for (let attempt = 1; attempt <= AI_CONFIG.maxRetries; attempt++) {
    try {
      console.log(`${stepName} attempt ${attempt}/${AI_CONFIG.maxRetries} (model: ${AI_CONFIG.model})`);

      const result = await makeAICall(prompt, stepName, previousSpec, AI_CONFIG.model, attempt);
      return result;
    } catch (error) {
      lastError = error as Error;
      console.error(`${stepName} attempt ${attempt} failed:`, error);

      // Don't retry on validation errors - they indicate a fundamental issue
      if (error instanceof ValidationError) {
        throw new AIGenerationError(
          `Validation failed in ${stepName}: ${error.message}`,
          stepName,
          attempt,
          error
        );
      }

      if (attempt < AI_CONFIG.maxRetries) {
        const backoffDelay = Math.min(AI_CONFIG.retryDelay * Math.pow(2, attempt - 1), AI_CONFIG.maxBackoffDelay);
        console.log(`Retrying ${stepName} in ${backoffDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
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

    // If all else fails, try to create a basic fallback spec
    if (stepName === 'Content Generation') {
      return createFallbackSpec(prompt, previousSpec);
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

    // Use safe validation to get detailed error information
    const validationResult = safeValidateSlideSpec(parsed);
    if (!validationResult.success) {
      throw new ValidationError(
        'Slide specification validation failed',
        validationResult.errors || ['Unknown validation error']
      );
    }

    return validationResult.data as SlideSpec;
  } catch (error) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
      throw new TimeoutError(`${stepName} timed out after ${AI_CONFIG.timeoutMs}ms`, AI_CONFIG.timeoutMs);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Create a basic fallback specification when AI generation fails
 */
function createFallbackSpec(prompt: string, previousSpec?: Partial<SlideSpec>): SlideSpec {
  console.log('Creating fallback specification...');

  // Extract a basic title from the prompt
  const title = prompt.length > 80 ? prompt.substring(0, 77) + '...' : prompt;

  return {
    title: title || 'Presentation Slide',
    layout: 'title-paragraph',
    paragraph: previousSpec?.paragraph || 'Content generation temporarily unavailable. Please try again.',
    notes: 'This slide was generated using fallback content due to AI service issues.',
    sources: []
  };
}