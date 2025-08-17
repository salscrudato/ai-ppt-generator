/**
 * AI Service Module - Centralized AI Operations
 * 
 * Provides a clean interface for all AI-related operations including:
 * - Content generation with retry logic
 * - Image prompt generation
 * - Batch processing capabilities
 * - Error handling and fallback strategies
 * 
 * This module abstracts the complexity of AI interactions and provides
 * a consistent interface for the rest of the application.
 * 
 * @version 1.0.0
 */

import OpenAI from 'openai';
import { getTextModelConfig, logCostEstimate } from '../config/aiModels';
import {
  AIGenerationError,
  ValidationError,
  TimeoutError,
  RateLimitError,
  ContentFilterError,
  NetworkError,
  sanitizeAIResponseWithRecovery
} from '../llm';
import { safeValidateSlideSpec, type SlideSpec, type GenerationParams } from '../schema';
import {
  SYSTEM_PROMPT,
  generateContentPrompt,
  generateLayoutPrompt,
  generateImagePrompt,
  generateRefinementPrompt,
  generateBatchImagePrompts
} from '../prompts';
import { logger, type LogContext } from '../utils/smartLogger';

// AI Configuration
const AI_CONFIG = getTextModelConfig();

// OpenAI client instance
let openaiClient: OpenAI | null = null;

/**
 * Get or create OpenAI client instance
 */
function getOpenAI(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

/**
 * AI Service Interface
 */
export interface IAIService {
  generateSlideContent(input: GenerationParams): Promise<SlideSpec>;
  generateBatchSlides(input: GenerationParams, slideCount: number): Promise<SlideSpec[]>;
  generateImagePrompts(slides: Partial<SlideSpec>[], input: GenerationParams, context?: LogContext): Promise<string[]>;
  validateContent(content: any): Promise<boolean>;
}

/**
 * Main AI Service Implementation
 */
export class AIService implements IAIService {
  private readonly config = AI_CONFIG;

  /**
   * Generate a single slide specification using chained AI processing
   */
  async generateSlideContent(input: GenerationParams): Promise<SlideSpec> {
    const startTime = Date.now();
    const context: LogContext = {
      requestId: `slide_gen_${Date.now()}`,
      component: 'aiService',
      operation: 'generateSlideContent'
    };

    logger.info(`Single slide generation for prompt: ${input.prompt.substring(0, 50)}...`, context, {
      model: this.config.model,
      withImage: input.withImage
    });

    // Log cost estimate
    logCostEstimate({
      textTokens: 3000,
      imageCount: input.withImage ? 1 : 0,
      operation: 'Single Slide Generation'
    });

    try {
      // Step 1: Generate core content
      let partialSpec = await this.executeAIStep(
        generateContentPrompt(input),
        'Content Generation',
        undefined,
        input,
        context
      );

      // Step 2: Refine layout
      partialSpec = await this.executeAIStep(
        generateLayoutPrompt(input, partialSpec),
        'Layout Refinement',
        partialSpec,
        input,
        context
      );

      // Step 3: Generate image prompt if enabled
      if (input.withImage) {
        partialSpec = await this.executeAIStep(
          generateImagePrompt(input, partialSpec),
          'Image Prompt Generation',
          partialSpec,
          input,
          context
        );
      }

      // Step 4: Final refinement
      const finalSpec = await this.executeAIStep(
        generateRefinementPrompt(input, partialSpec),
        'Final Refinement',
        partialSpec,
        input,
        context
      );

      const generationTime = Date.now() - startTime;

      logger.info('Quality metrics', context, {
        generationTime,
        slideTitle: finalSpec.title,
        layout: finalSpec.layout,
        contentLength: JSON.stringify(finalSpec).length,
        hasImage: !!finalSpec.imagePrompt
      });

      return finalSpec;
    } catch (error) {
      const generationTime = Date.now() - startTime;

      logger.error('Slide generation failed', context, {
        error: error instanceof Error ? error.message : String(error),
        generationTime,
        input
      });

      throw error;
    }
  }

  /**
   * Generate multiple slides with optimized batch processing
   */
  async generateBatchSlides(input: GenerationParams, slideCount: number): Promise<SlideSpec[]> {
    const startTime = Date.now();
    const context: LogContext = {
      requestId: `batch_gen_${Date.now()}`,
      component: 'aiService',
      operation: 'generateBatchSlides'
    };

    logger.info(`Batch generation for ${slideCount} slides with prompt: ${input.prompt.substring(0, 50)}...`, context, {
      slideCount,
      model: this.config.model,
      withImage: input.withImage
    });

    // Log cost estimate
    logCostEstimate({
      textTokens: 3000 * slideCount,
      imageCount: input.withImage ? slideCount : 0,
      operation: `Batch Generation (${slideCount} slides)`
    });

    const slides: SlideSpec[] = [];

    try {
      // Generate content and layout for each slide
      for (let i = 0; i < slideCount; i++) {
        console.log(`Generating slide ${i + 1}/${slideCount}...`);
        
        const slideInput = {
          ...input,
          prompt: `${input.prompt} - Slide ${i + 1} of ${slideCount}`,
          withImage: false // Handle images in batch later
        };

        let partialSpec = await this.executeAIStep(
          generateContentPrompt(slideInput),
          `Content Generation (Slide ${i + 1})`,
          undefined,
          slideInput,
          context
        );

        partialSpec = await this.executeAIStep(
          generateLayoutPrompt(slideInput, partialSpec),
          `Layout Refinement (Slide ${i + 1})`,
          partialSpec,
          slideInput,
          context
        );

        slides.push(partialSpec);
      }

      // Batch process images if enabled
      if (input.withImage && slides.length > 0) {
        await this.processBatchImages(slides, input);
      }

      const generationTime = Date.now() - startTime;
      console.log(`Batch generation completed in ${generationTime}ms`);

      return slides;
    } catch (error) {
      const generationTime = Date.now() - startTime;
      console.error(`Batch generation failed after ${generationTime}ms:`, error);
      throw error;
    }
  }

  /**
   * Generate image prompts for multiple slides
   */
  async generateImagePrompts(slides: Partial<SlideSpec>[], input: GenerationParams, context?: LogContext): Promise<string[]> {
    console.log(`Generating image prompts for ${slides.length} slides...`);

    const baseContext = context || {
      component: 'aiService',
      operation: 'generateImagePrompts'
    };

    try {
      const batchPrompt = generateBatchImagePrompts(input, slides);
      const response = await this.executeAIStep(batchPrompt, 'Batch Image Processing', undefined, input, {
        component: 'aiService',
        operation: 'generateImagePrompts'
      });
      
      // Parse batch response (implementation depends on response format)
      // This is a simplified version - actual implementation would parse the JSON array
      return slides.map((_, index) => `Professional image for slide ${index + 1}`);
    } catch (error) {
      console.warn('Batch image processing failed, falling back to individual processing:', error);
      
      // Fallback to individual processing
      const imagePrompts: string[] = [];
      for (let i = 0; i < slides.length; i++) {
        try {
          const slideWithImage = await this.executeAIStep(
            generateImagePrompt(input, slides[i]),
            `Image Prompt (Slide ${i + 1})`,
            slides[i],
            input,
            {
              component: 'aiService',
              operation: 'generateImagePrompts',
              stage: `slide_${i}`
            }
          );
          imagePrompts.push(slideWithImage.imagePrompt || '');
        } catch (imageError) {
          const imageContext: LogContext = {
            ...baseContext,
            operation: 'generateBatchImages',
            stage: `slide_${i}`
          };

          logger.error('Image generation failed', imageContext, {
            error: imageError instanceof Error ? imageError.message : String(imageError),
            slideIndex: i,
            slideTitle: slides[i].title
          });
          imagePrompts.push('');
        }
      }
      return imagePrompts;
    }
  }

  /**
   * Validate content quality
   */
  async validateContent(content: any): Promise<boolean> {
    const context: LogContext = {
      component: 'aiService',
      operation: 'validateContent'
    };

    try {
      const validationResult = safeValidateSlideSpec(content);

      logger.info(`Content validation: ${validationResult.success ? 'passed' : 'failed'}`, context, {
        success: validationResult.success,
        errors: validationResult.success ? [] : ['Validation failed']
      });

      return validationResult.success;
    } catch (error) {
      logger.error('Content validation error', context, error);
      return false;
    }
  }

  /**
   * Execute a single AI step with retry logic and error handling
   */
  private async executeAIStep(
    prompt: string,
    stepName: string,
    previousSpec?: Partial<SlideSpec>,
    originalInput?: GenerationParams,
    baseContext?: LogContext
  ): Promise<SlideSpec> {
    let lastError: Error | null = null;

    // Try with primary model
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      const attemptContext: LogContext = {
        ...(baseContext || {}),
        stage: `${stepName}_attempt_${attempt}`
      };

      try {
        logger.info(`${stepName} attempt ${attempt}/${this.config.maxRetries}`, attemptContext);
        const result = await this.makeAICall(prompt, stepName, previousSpec, attempt, originalInput);
        return result;
      } catch (error) {
        lastError = error as Error;

        logger.error(`${stepName} attempt ${attempt} failed`, attemptContext, {
          error: error instanceof Error ? error.message : String(error),
          recoverable: attempt < this.config.maxRetries,
          maxRetries: this.config.maxRetries
        });

        // Don't retry validation errors, but provide more context
        if (error instanceof ValidationError) {
          logger.warn('Validation error during retry', attemptContext, {
            errors: error.validationErrors || [error.message]
          });

          throw new AIGenerationError(
            `Validation failed in ${stepName}: ${error.message}`,
            stepName,
            attempt,
            error
          );
        }

        // Wait before retry
        if (attempt < this.config.maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All attempts failed
    throw new AIGenerationError(
      `All attempts failed for ${stepName}. Last error: ${lastError?.message}`,
      stepName,
      this.config.maxRetries,
      lastError || undefined
    );
  }

  /**
   * Make a single AI API call with timeout and error handling
   */
  private async makeAICall(
    prompt: string,
    stepName: string,
    previousSpec: Partial<SlideSpec> | undefined,
    attempt: number,
    originalInput?: GenerationParams
  ): Promise<SlideSpec> {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

    const context: LogContext = {
      requestId: `ai_call_${Date.now()}`,
      component: 'aiService',
      operation: 'makeAICall',
      stage: stepName
    };

    // Log detailed prompt information
    logger.info(`AI prompt sent for ${stepName}`, context, {
      attempt,
      model: this.config.model,
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
      promptLength: prompt.length,
      hasPreviousSpec: !!previousSpec
    });

    try {
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ];

      if (previousSpec) {
        messages.push({ role: 'assistant', content: JSON.stringify(previousSpec) });
      }

      const response = await getOpenAI().chat.completions.create({
        model: this.config.model as any,
        messages,
        response_format: { type: 'json_object' },
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens
      }, {
        signal: controller.signal
      });

      const rawJson = response.choices[0]?.message?.content;
      if (!rawJson) {
        throw new Error('Empty response from AI model');
      }

      const parsed = JSON.parse(rawJson);
      const responseTime = Date.now() - startTime;

      // Create AI metrics for logging
      const aiMetrics = {
        modelUsed: this.config.model,
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
        estimatedCost: this.calculateCost(response.usage?.total_tokens || 0),
        responseTime,
        retryCount: attempt - 1,
        contentLength: rawJson.length,
        promptVersion: '1.0'
      };

      // Log AI response with metrics
      logger.info(`AI response received for ${stepName}`, context, {
        responseTime: aiMetrics.responseTime,
        totalTokens: aiMetrics.totalTokens,
        contentLength: rawJson.length
      });

      // Log the parsed response for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log(`AI Response for ${stepName}:`, JSON.stringify(parsed, null, 2));
      }

      // First try standard validation
      let validationResult = safeValidateSlideSpec(parsed);

      // If validation fails, try with enhanced sanitization and recovery
      if (!validationResult.success) {
        logger.warn(`Initial validation failed for ${stepName}`, context, {
          errors: validationResult.errors || []
        });

        console.warn(`Initial validation failed for ${stepName}, attempting recovery:`, {
          errors: validationResult.errors
        });

        const recoveredData = sanitizeAIResponseWithRecovery(parsed);

        // Try validation again with recovered data
        validationResult = safeValidateSlideSpec(recoveredData);

        if (!validationResult.success) {
          logger.error(`Validation failed even after recovery for ${stepName}`, context, {
            errors: validationResult.errors || []
          });

          console.error(`Validation failed even after recovery for ${stepName}:`, {
            errors: validationResult.errors,
            originalData: parsed,
            recoveredData
          });
          throw new ValidationError(
            'Slide specification validation failed',
            validationResult.errors || ['Unknown validation error']
          );
        } else {
          logger.info(`Successfully recovered data for ${stepName}`, context);
        }
      } else {
        logger.info(`Content validation passed for ${stepName}`, context);
      }

      const finalSpec = validationResult.data as SlideSpec;

      // Preserve design information from original input if available
      if (originalInput?.design) {
        finalSpec.design = {
          ...finalSpec.design,
          ...originalInput.design
        };
      }

      // Log quality metrics for the final spec
      logger.info(`Quality metrics for ${stepName}`, context, {
        attempt,
        responseTime: Date.now() - startTime,
        contentComplexity: this.calculateContentComplexity(finalSpec),
        validationSuccess: true,
        recoveryUsed: !safeValidateSlideSpec(parsed).success
      });

      return finalSpec;
    } catch (error) {
      // Log the error
      logger.error(`AI call failed for ${stepName}`, context, {
        error: error instanceof Error ? error.message : String(error),
        attempt,
        responseTime: Date.now() - startTime
      });

      this.handleAIError(error, stepName, attempt);
      throw error; // This line won't be reached due to handleAIError throwing
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Calculate estimated cost for AI API usage
   */
  private calculateCost(totalTokens: number): number {
    // GPT-4 pricing (approximate): $0.03 per 1K prompt tokens, $0.06 per 1K completion tokens
    // For simplicity, using average of $0.045 per 1K tokens
    return (totalTokens / 1000) * 0.045;
  }

  /**
   * Calculate content complexity score
   */
  private calculateContentComplexity(spec: SlideSpec): number {
    let complexity = 0;

    // Base complexity for having content
    complexity += 1;

    // Add complexity for different content types
    if (spec.bullets && spec.bullets.length > 0) {
      complexity += spec.bullets.length * 0.5;
    }

    if (spec.paragraph) {
      complexity += spec.paragraph.length / 100; // 1 point per 100 characters
    }

    if (spec.imagePrompt) {
      complexity += 2; // Images add significant complexity
    }

    if (spec.layout === 'two-column') {
      complexity += 1; // Two-column layouts are more complex
    }

    return Math.round(complexity * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Handle and categorize AI errors
   */
  private handleAIError(error: any, stepName: string, attempt: number): never {
    // Timeout errors
    if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
      throw new TimeoutError(`${stepName} timed out after ${this.config.timeoutMs}ms`, this.config.timeoutMs);
    }

    // OpenAI API errors
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
    }

    // Network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError('Network connection failed. Please check your internet connection.');
    }

    // Validation errors (pass through)
    if (error instanceof ValidationError) {
      throw error;
    }

    // Wrap unknown errors
    throw new AIGenerationError(
      `${stepName} failed: ${error instanceof Error ? error.message : String(error)}`,
      stepName,
      attempt,
      error instanceof Error ? error : new Error(String(error))
    );
  }

  /**
   * Process batch images for multiple slides
   */
  private async processBatchImages(slides: SlideSpec[], input: GenerationParams): Promise<void> {
    console.log('Processing batch image prompts...');
    
    try {
      const imagePrompts = await this.generateImagePrompts(slides, input, {
        component: 'aiService',
        operation: 'processBatchImages'
      });
      
      // Apply image prompts to slides
      for (let i = 0; i < slides.length && i < imagePrompts.length; i++) {
        if (imagePrompts[i]) {
          (slides[i] as any).imagePrompt = imagePrompts[i];
        }
      }
    } catch (error) {
      console.warn('Batch image processing failed:', error);
      // Continue without images rather than failing the entire generation
    }
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService;
