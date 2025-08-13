/**
 * AI PowerPoint Generator - Firebase Cloud Functions Backend
 *
 * Enhanced backend service with chained AI processing for superior slide quality:
 * - Multi-step AI generation (content → layout → images → refinement)
 * - Professional PowerPoint creation with advanced styling and image integration
 * - RESTful API with improved error handling and performance monitoring
 * - Automatic theme selection and style validation for professional outputs
 *
 * @version 3.3.2-enhanced-fixed
 * @author AI PowerPoint Generator Team (enhanced by expert co-pilot)
 */

import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { defineSecret } from "firebase-functions/params";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";

// Import enhanced core modules with error types
import { generateSlideSpec, AIGenerationError, ValidationError, TimeoutError } from "./llm";
import { generatePpt } from "./pptGenerator";
import { safeValidateGenerationParams, safeValidateSlideSpec, validateContentQuality, generateContentImprovements, type SlideSpec } from "./schema";
import { selectThemeForContent } from "./professionalThemes";

// Configuration constants (enhanced for better performance)
const CONFIG = {
  maxInstances: 20,
  requestSizeLimit: '20mb',
  timeout: 540,
  memory: "2GiB",
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    // Disable rate limiting for Firebase Functions environment
    skip: () => true
  }
} as const;

// Performance monitoring utilities (enhanced with more metrics)
interface PerformanceMetrics {
  requestId: string;
  endpoint: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  errorType?: string;
  userAgent?: string;
  contentLength?: number;
  slideCount?: number;
  themeUsed?: string;
  aiSteps?: number;
  averageScore?: number;
  averageGrade?: 'A' | 'B' | 'C' | 'D' | 'F';
}

const performanceMetrics: PerformanceMetrics[] = [];

// Simple in-memory cache
const cache = new Map<string, any>();

function startPerformanceTracking(endpoint: string, req: any): PerformanceMetrics {
  const metric: PerformanceMetrics = {
    requestId: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    endpoint,
    startTime: Date.now(),
    success: false,
    userAgent: req.headers['user-agent'],
    contentLength: req.headers['content-length'] ? parseInt(req.headers['content-length']) : undefined
  };

  performanceMetrics.push(metric);
  return metric;
}

function endPerformanceTracking(metric: PerformanceMetrics, success: boolean, errorType?: string, extra?: Partial<PerformanceMetrics>): void {
  metric.endTime = Date.now();
  metric.duration = metric.endTime - metric.startTime;
  metric.success = success;
  metric.errorType = errorType;
  Object.assign(metric, extra);

  logger.info('Performance metric', metric);

  if (performanceMetrics.length > 1000) {
    performanceMetrics.splice(0, performanceMetrics.length - 1000);
  }
}

// Helper function for grade calculation
function getMostCommonGrade(grades: ('A' | 'B' | 'C' | 'D' | 'F')[]): 'A' | 'B' | 'C' | 'D' | 'F' {
  const counts = grades.reduce((acc, grade) => {
    acc[grade] = (acc[grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(counts).reduce((a, b) => counts[a[0]] > counts[b[0]] ? a : b)[0] as 'A' | 'B' | 'C' | 'D' | 'F';
}

// Define the OpenAI API key secret
const openaiApiKey = defineSecret("OPENAI_API_KEY");

// Configure Firebase Functions for optimal performance
setGlobalOptions({ maxInstances: CONFIG.maxInstances });

// Create Express application with optimized middleware
const app = express();

app.use(cors({ origin: true }));
app.use(express.json({ limit: CONFIG.requestSizeLimit }));
app.use(rateLimit(CONFIG.rateLimit));

// Environment setup middleware
app.use((_req, _res, next) => {
  if (!process.env.OPENAI_API_KEY && openaiApiKey.value()) {
    process.env.OPENAI_API_KEY = openaiApiKey.value();
  }
  next();
});

/**
 * Health check endpoint
 */
app.get('/health', (_req, res) => {
  return res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '3.3.2-enhanced-fixed',
    service: 'AI PowerPoint Generator',
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * Themes recommendation endpoint
 */
app.post('/themes', (req, res) => {
  const cacheKey = JSON.stringify(req.body);
  if (cache.has(cacheKey)) {
    return res.json(cache.get(cacheKey));
  }

  // Simple theme recommendation based on content type
  const { tone, audience } = req.body;
  const recommendations = [];

  if (tone === 'professional' || audience === 'executives') {
    recommendations.push('corporate-blue', 'finance-navy', 'consulting-charcoal');
  } else if (tone === 'creative') {
    recommendations.push('creative-purple', 'marketing-magenta', 'vibrant-coral');
  } else if (audience === 'students') {
    recommendations.push('education-green', 'academic-indigo');
  } else {
    recommendations.push('modern-slate', 'corporate-blue', 'creative-purple');
  }

  cache.set(cacheKey, recommendations);
  return res.json(recommendations);
});

/**
 * Metrics endpoint (secured)
 */
app.get('/metrics', (req, res) => {
  if (req.query.adminKey !== 'secret') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  return res.json(performanceMetrics.slice(-100));
});

/**
 * Slide draft generation endpoint with AI image generation support
 */
app.post('/draft', async (req, res) => {
  const performanceMetric = startPerformanceTracking('/draft', req);

  try {
    const requestData = req.body;

    logger.info('Draft generation request', {
      requestId: performanceMetric.requestId,
      promptLength: requestData.prompt?.length || 0,
      audience: requestData.audience,
      tone: requestData.tone,
      contentLength: requestData.contentLength,
      layout: requestData.layout,
      withImage: requestData.withImage,
      timestamp: new Date().toISOString()
    });

    const validationResult = safeValidateGenerationParams(requestData);
    if (!validationResult.success) {
      logger.warn('Invalid request parameters', {
        errors: validationResult.errors,
        requestBody: { ...requestData, prompt: '[REDACTED]' }
      });

      endPerformanceTracking(performanceMetric, false, 'VALIDATION_ERROR');
      return res.status(400).json({
        error: 'Invalid generation parameters',
        code: 'VALIDATION_ERROR',
        details: validationResult.errors
      });
    }

    // Enhance generation parameters with layout and image info
    const enhancedParams = {
      ...validationResult.data!,
      preferredLayout: requestData.layout,
      withImage: requestData.withImage || false
    };

    const draft = await generateSlideSpec(enhancedParams);

    endPerformanceTracking(performanceMetric, true, undefined, { slideCount: 1, aiSteps: 4 });
    return res.json(draft);
  } catch (error) {
    const errorType = error instanceof Error ? error.name : 'UNKNOWN_ERROR';
    logger.error('Draft generation failed', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    endPerformanceTracking(performanceMetric, false, errorType);
    return res.status(500).json({
      error: 'Failed to generate draft. Please try again.',
      code: 'DRAFT_GENERATION_ERROR'
    });
  }
});

/**
 * Content validation endpoint
 */
app.post('/validate-content', async (req, res) => {
  const performanceMetric = startPerformanceTracking('/validate-content', req);
  const specsToValidate = Array.isArray(req.body) ? req.body : [req.body];

  try {
    const validationResults = [];

    for (const spec of specsToValidate) {
      if (Array.isArray(spec)) {
        endPerformanceTracking(performanceMetric, false, 'INVALID_INPUT');
        return res.status(400).json({
          error: 'Nested arrays not supported for individual specifications',
          code: 'INVALID_INPUT'
        });
      }

      const paramValidation = safeValidateSlideSpec(spec);
      if (!paramValidation.success) {
        logger.warn('Invalid slide specification', {
          errors: paramValidation.errors
        });

        endPerformanceTracking(performanceMetric, false, 'VALIDATION_ERROR');
        return res.status(400).json({
          error: 'Invalid slide specification',
          code: 'INVALID_SPEC_ERROR',
          details: paramValidation.errors
        });
      }

      const validatedSpec = paramValidation.data as SlideSpec;

      const quality = validateContentQuality(validatedSpec);
      const improvements = generateContentImprovements(validatedSpec, quality);

      validationResults.push({
        spec: validatedSpec,
        quality,
        improvements
      });
    }

    endPerformanceTracking(performanceMetric, true, undefined, {
      slideCount: validationResults.length,
      averageScore: validationResults.reduce((sum, result) => sum + result.quality.score, 0) / validationResults.length,
      averageGrade: getMostCommonGrade(validationResults.map(r => r.quality.grade))
    });

    return res.json({
      results: validationResults,
      summary: {
        totalSlides: specsToValidate.length,
        averageScore: validationResults.reduce((sum, result) => sum + result.quality.score, 0) / validationResults.length,
        averageGrade: getMostCommonGrade(validationResults.map(r => r.quality.grade))
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Content validation failed', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    endPerformanceTracking(performanceMetric, false, 'VALIDATION_SERVICE_ERROR');
    return res.status(500).json({
      error: 'Content validation failed. Please try again.',
      code: 'VALIDATION_SERVICE_ERROR'
    });
  }
});

/**
 * PowerPoint file generation endpoint
 */
app.post('/generate', async (req, res) => {
  const performanceMetric = startPerformanceTracking('/generate', req);

  try {
    logger.info('PowerPoint generation request', {
      hasSpec: !!req.body.spec,
      directGeneration: !req.body.spec,
      themeId: req.body.themeId,
      withValidation: req.body.withValidation ?? true,
      timestamp: new Date().toISOString()
    });

    let spec: SlideSpec | SlideSpec[];
    let slideCount = 1;
    let themeUsed = req.body.themeId || 'default';

    if (Array.isArray(req.body.spec)) {
      const specArray = req.body.spec as unknown[]; // Safe cast from any
      const validatedSpecs: SlideSpec[] = [];
      const validationErrors: string[][] = [];

      for (const s of specArray) {
        const v = safeValidateSlideSpec(s);
        if (!v.success) {
          validationErrors.push(v.errors || ['Unknown validation error']);
        } else {
          validatedSpecs.push(v.data as SlideSpec);
        }
      }

      if (validationErrors.length > 0) {
        logger.warn('Invalid slide specifications provided', { errors: validationErrors });
        endPerformanceTracking(performanceMetric, false, 'INVALID_SPEC_ERROR');
        return res.status(400).json({
          error: 'Invalid slide specifications provided',
          code: 'INVALID_SPEC_ERROR',
          details: validationErrors
        });
      }

      spec = validatedSpecs;
    } else {
      const validation = safeValidateSlideSpec(req.body.spec);
      if (!validation.success) {
        logger.warn('Invalid slide specification provided', { errors: validation.errors });
        endPerformanceTracking(performanceMetric, false, 'INVALID_SPEC_ERROR');
        return res.status(400).json({
          error: 'Invalid slide specification provided',
          code: 'INVALID_SPEC_ERROR',
          details: validation.errors
        });
      }

      spec = validation.data as SlideSpec;
    }

    slideCount = Array.isArray(spec) ? spec.length : 1;

    // Guard against undefined or empty spec
    if (!spec || (Array.isArray(spec) && spec.length === 0)) {
      logger.error('Internal error: spec not defined or empty');
      endPerformanceTracking(performanceMetric, false, 'INTERNAL_ERROR');
      return res.status(500).json({
        error: 'Internal error: No valid specification provided',
        code: 'INTERNAL_ERROR'
      });
    }

    // Auto-select theme if not provided
    if (!req.body.themeId) {
      const firstSpec = Array.isArray(spec) ? spec[0] : spec;
      const contentAnalysis = { presentationType: firstSpec.layout };
      themeUsed = selectThemeForContent(contentAnalysis).id;
      logger.info(`Auto-selected theme: ${themeUsed}`);
    }

    // Generate PowerPoint file
    const pptBuffer = await generatePpt(Array.isArray(spec) ? spec : [spec], req.body.withValidation ?? true);

    // Configure response headers
    const firstSpec = Array.isArray(spec) ? spec[0] : spec;
    const sanitizedTitle = firstSpec.title?.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') || 'presentation';
    const filename = `${sanitizedTitle}.pptx`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Length', pptBuffer.length.toString());

    logger.info('PowerPoint generation successful', {
      filename,
      fileSize: pptBuffer.length,
      slideTitle: sanitizedTitle,
      slideCount,
      themeUsed
    });

    endPerformanceTracking(performanceMetric, true, undefined, { slideCount, themeUsed, aiSteps: 4 });
    return res.send(pptBuffer);
  } catch (error) {
    let status = 500;
    let code = 'PPT_GENERATION_ERROR';
    let message = 'Failed to generate PowerPoint file. Please check your slide content and try again.';

    if (error instanceof AIGenerationError) {
      status = 503;
      code = 'AI_SERVICE_ERROR';
      message = 'AI service temporarily unavailable during PowerPoint generation.';
      logger.error('AI generation failed during PPT creation', {
        step: error.step,
        attempt: error.attempt,
        message: error.message
      });
    } else if (error instanceof ValidationError) {
      status = 422;
      code = 'CONTENT_VALIDATION_ERROR';
      message = 'Generated content failed validation during PowerPoint creation.';
      logger.error('Content validation failed during PPT creation', {
        message: error.message,
        validationErrors: error.validationErrors
      });
    } else if (error instanceof TimeoutError) {
      status = 408;
      code = 'TIMEOUT_ERROR';
      message = 'PowerPoint generation timed out. Please try again.';
      logger.error('Timeout during PPT generation', {
        message: error.message,
        timeoutMs: error.timeoutMs
      });
    } else {
      logger.error('PowerPoint generation failed', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        hasSpec: !!req.body.spec,
        timestamp: new Date().toISOString()
      });
    }

    endPerformanceTracking(performanceMetric, false, code);
    return res.status(status).json({ error: message, code });
  }
});

/**
 * Export the Express app as an optimized Firebase Cloud Function
 */
export const api = onRequest(
  {
    cors: true,
    secrets: [openaiApiKey],
    memory: CONFIG.memory,
    timeoutSeconds: CONFIG.timeout,
    invoker: "public"
  },
  app
);