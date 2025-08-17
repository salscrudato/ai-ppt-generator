/**
 * AI PowerPoint Generator - Firebase Cloud Functions Backend
 *
 * CORE FUNCTIONALITY:
 * This is the main backend service that provides RESTful API endpoints for AI-powered
 * PowerPoint slide generation. The service uses OpenAI's GPT-4 for content generation
 * and DALL-E 3 for image creation, with comprehensive error handling and performance monitoring.
 *
 * KEY FEATURES:
 * - Multi-step AI generation pipeline: content → layout → images → refinement
 * - Professional PowerPoint (.pptx) file creation using PptxGenJS
 * - Advanced styling with theme system and brand customization
 * - Comprehensive input validation using Zod schemas
 * - Performance monitoring and detailed logging
 * - Rate limiting and security headers for production use
 *
 * API ENDPOINTS:
 * - GET /health - Service health check
 * - POST /generate - Create final PowerPoint file from slide specification
 * - POST /validate-content - Validate slide content quality
 * - POST /themes - Get theme recommendations based on content
 * - GET /metrics - Performance metrics (admin only)
 *
 * ARCHITECTURE:
 * - Express.js application wrapped in Firebase Cloud Function
 * - Stateless design with no database dependencies
 * - OpenAI API integration with retry logic and fallback strategies
 * - Comprehensive error handling with typed error classes
 * - Memory-efficient caching for theme recommendations
 *
 * @version 3.3.2-enhanced-fixed
 * @author AI PowerPoint Generator Team
 */

import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";
import { logger as firebaseLogger } from "firebase-functions";
import { defineSecret } from "firebase-functions/params";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import compression from "compression";
import { apiKeyValidator } from "./config/apiKeyValidator";

// Import enhanced core modules with error types
import { AIGenerationError, ValidationError, TimeoutError, RateLimitError, ContentFilterError, NetworkError } from "./llm";
import { PROFESSIONAL_THEMES, selectThemeForContent } from "./professionalThemes";
import { logger } from "./utils/smartLogger";
import { env } from "./config/environment";
import { generatePpt } from "./pptGenerator-simple";
// Modern design system removed for simplification

// Import new modular services
import { aiService } from "./services/aiService";
import { powerPointService } from "./services/powerPointService";
import { validationService } from "./services/validationService";
import { type SlideSpec, safeValidateSlideSpec } from "./schema";

// Enhanced services removed for simplification


// Production-ready configuration constants
const CONFIG = {
  maxInstances: 20,
  requestSizeLimit: '20mb',
  timeout: 540,
  memory: "2GiB" as const,
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    // Skip rate limiting in Firebase Functions environment
    skip: (req: any) => {
      // Skip if in development or if running in Firebase Functions
      return process.env.NODE_ENV === 'development' ||
             process.env.FUNCTIONS_EMULATOR === 'true' ||
             !req.ip;
    },
    // Custom key generator for Firebase Functions
    keyGenerator: (req: any) => {
      return req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
    }
  },
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? ['https://your-domain.com', 'https://ai-ppt-gen.web.app']
      : true,
    credentials: true,
    optionsSuccessStatus: 200
  },
  security: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.openai.com"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
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
  qualityScore?: number;
  qualityGrade?: 'A' | 'B' | 'C' | 'D' | 'F';
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

// Note: API key validation will be performed at runtime, not during deployment
// Firebase secrets are only available when the function is actually invoked

// Create Express application with production-ready middleware
const app = express();

// Compression middleware for better performance
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req: any, res: any) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Security middleware
app.use(helmet({
  contentSecurityPolicy: CONFIG.security.contentSecurityPolicy,
  hsts: CONFIG.security.hsts,
  crossOriginEmbedderPolicy: false // Allow embedding for iframe usage
}));

// Enhanced CORS configuration
app.use(cors(CONFIG.cors));

// Rate limiting (disabled in Firebase Functions environment due to IP detection issues)
if (process.env.NODE_ENV === 'production' && !process.env.FUNCTIONS_EMULATOR) {
  app.use(rateLimit(CONFIG.rateLimit));
}

// Body parsing with size limits
app.use(express.json({
  limit: CONFIG.requestSizeLimit,
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));

app.use(express.urlencoded({
  extended: true,
  limit: CONFIG.requestSizeLimit
}));

// Environment setup middleware
app.use((_req, _res, next) => {
  if (!process.env.OPENAI_API_KEY && openaiApiKey.value()) {
    process.env.OPENAI_API_KEY = openaiApiKey.value();
  }
  next();
});

/**
 * Health check endpoint with API key validation
 */
app.get('/health', (_req, res) => {
  // Perform runtime API key validation
  let apiKeyStatus = 'unknown';
  try {
    const validation = apiKeyValidator.validateConfiguration();
    apiKeyStatus = validation.isValid ? 'configured' : 'missing';

    if (!validation.isValid) {
      logger.warn('⚠️ OpenAI API key not properly configured', {
        source: validation.source,
        environment: validation.environment
      });
    }
  } catch (error) {
    logger.error('API key validation error:', {}, error);
    apiKeyStatus = 'error';
  }

  return res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '3.3.2-enhanced-fixed',
    service: 'AI PowerPoint Generator',
    environment: process.env.NODE_ENV || 'development',
    apiKeyStatus
  });
});

/**
 * Configuration status endpoint (admin only)
 */
app.get('/config/status', (req, res) => {
  // Simple admin authentication
  if (req.query.adminKey !== 'config-check-2024') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const validation = apiKeyValidator.validateConfiguration();
    const statusReport = apiKeyValidator.generateStatusReport();

    return res.json({
      validation,
      statusReport,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Configuration status check failed:', {}, error);
    return res.status(500).json({
      error: 'Configuration check failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * API key test endpoint (admin only)
 */
app.post('/config/test-api-key', async (req, res) => {
  // Simple admin authentication
  if (req.query.adminKey !== 'config-check-2024') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const testResult = await apiKeyValidator.testAPIKey();

    return res.json({
      ...testResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('API key test failed:', {}, error);
    return res.status(500).json({
      error: 'API key test failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
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
 * Theme presets endpoint: return full theme catalog with metadata
 */
app.get('/theme-presets', (_req, res) => {
  const themes = PROFESSIONAL_THEMES.map(t => ({
    id: t.id,
    name: t.name,
    category: t.category,
    // backend theme type has no description; send empty string for compatibility
    description: '',
    colors: t.colors,
    typography: t.typography,
    effects: t.effects,
    spacing: t.spacing
  }));
  return res.json({ themes, count: themes.length });
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
 * Draft generation endpoint - Generate slide content from user parameters
 */
app.post('/draft', async (req, res) => {
  const performanceMetric = startPerformanceTracking('/draft', req);

  try {
    logger.info('Draft generation request', {
      prompt: req.body.prompt?.substring(0, 100),
      audience: req.body.audience,
      tone: req.body.tone,
      contentLength: req.body.contentLength,
      withImage: req.body.withImage,
      timestamp: new Date().toISOString()
    });

    // Validate generation parameters
    const paramValidation = validationService.validateGenerationParams(req.body);
    if (!paramValidation.success) {
      logger.warn('Invalid generation parameters', { errors: paramValidation.errors });
      endPerformanceTracking(performanceMetric, false, 'INVALID_PARAMS_ERROR');
      return res.status(400).json({
        error: 'Invalid generation parameters',
        code: 'INVALID_PARAMS_ERROR',
        details: paramValidation.errors
      });
    }

    // Use the AI service to generate slide content
    const slideSpec = await aiService.generateSlideContent(req.body);

    // Validate the generated content
    const contentValidation = validationService.validateSlideSpec(slideSpec);
    if (!contentValidation.success) {
      logger.warn('Generated content failed validation', { errors: contentValidation.errors });
      endPerformanceTracking(performanceMetric, false, 'CONTENT_VALIDATION_ERROR');
      return res.status(422).json({
        error: 'Generated content failed validation',
        code: 'CONTENT_VALIDATION_ERROR',
        details: contentValidation.errors
      });
    }

    // Assess content quality
    const qualityAssessment = validationService.assessContentQuality(slideSpec);

    endPerformanceTracking(performanceMetric, true, undefined, {
      qualityScore: qualityAssessment.score,
      qualityGrade: qualityAssessment.grade
    });

    return res.json({
      spec: slideSpec,
      quality: {
        score: qualityAssessment.score,
        grade: qualityAssessment.grade,
        issues: qualityAssessment.issues,
        strengths: qualityAssessment.strengths,
        suggestions: qualityAssessment.suggestions
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    let status = 500;
    let code = 'DRAFT_GENERATION_ERROR';
    let message = 'Failed to generate slide draft. Please try again.';

    if (error instanceof AIGenerationError) {
      status = 503;
      code = 'AI_SERVICE_ERROR';
      message = 'AI service temporarily unavailable. Please try again in a moment.';
      logger.error('AI service error during draft generation', {
        message: error.message,
        step: error.step,
        attempt: error.attempt
      });
    } else if (error instanceof ValidationError) {
      status = 422;
      code = 'CONTENT_VALIDATION_ERROR';
      message = 'Generated content failed validation. Please try different parameters.';
      logger.error('Content validation failed during draft generation', {
        message: error.message,
        validationErrors: error.validationErrors
      });
    } else if (error instanceof TimeoutError) {
      status = 504;
      code = 'TIMEOUT_ERROR';
      message = 'Request timed out. Please try again.';
      logger.error('Timeout during draft generation', {
        message: error.message,
        timeoutMs: error.timeoutMs
      });
    } else if (error instanceof RateLimitError) {
      status = 429;
      code = 'RATE_LIMIT_ERROR';
      message = error.message;
      logger.warn('Rate limit exceeded during draft generation', {
        message: error.message,
        retryAfter: error.retryAfter
      });
    } else {
      logger.error('Unexpected error during draft generation', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    }

    endPerformanceTracking(performanceMetric, false, code);
    return res.status(status).json({
      error: message,
      code: code
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
    // Use the new validation service for comprehensive validation
    const validationResult = validationService.validateSlideArray(specsToValidate);

    if (!validationResult.success) {
      logger.warn('Slide validation failed', {
        errors: validationResult.errors,
        warnings: validationResult.warnings
      });

      endPerformanceTracking(performanceMetric, false, 'VALIDATION_ERROR');
      return res.status(400).json({
        error: 'Slide validation failed',
        code: 'VALIDATION_ERROR',
        details: validationResult.errors,
        warnings: validationResult.warnings
      });
    }

    // Generate quality assessments for each validated slide
    const validationResults = validationResult.data!.map(spec => {
      const qualityAssessment = validationService.assessContentQuality(spec);
      return {
        spec,
        quality: {
          score: qualityAssessment.score,
          grade: qualityAssessment.grade,
          issues: qualityAssessment.issues,
          strengths: qualityAssessment.strengths
        },
        improvements: qualityAssessment.suggestions
      };
    });

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
 * Enhanced PowerPoint file generation endpoint with professional design system
 */
app.post('/generate/professional', async (req, res) => {
  const performanceMetric = startPerformanceTracking('/generate/professional', req);

  try {
    logger.info('Professional PowerPoint generation request', {
      hasSpec: !!req.body.spec,
      colorPalette: req.body.colorPalette || 'corporate',
      metadata: req.body.metadata,
      timestamp: new Date().toISOString()
    });

    let spec: SlideSpec[];
    let slideCount = 1;
    const colorPalette = req.body.colorPalette || 'corporate';

    // Validate color palette
    // Color palette validation simplified
    const validPalettes = ['corporate', 'creative', 'finance', 'tech', 'ocean'];
    if (!validPalettes.includes(colorPalette)) {
      logger.warn('Invalid color palette provided', { colorPalette });
      endPerformanceTracking(performanceMetric, false, 'INVALID_PALETTE_ERROR');
      return res.status(400).json({
        error: 'Invalid color palette provided',
        code: 'INVALID_PALETTE_ERROR',
        availablePalettes: validPalettes
      });
    }

    // Handle slide generation from parameters or direct spec
    if (!req.body.spec && req.body.prompt) {
      // Generate slides from parameters using AI service
      const paramValidation = validationService.validateGenerationParams(req.body);
      if (!paramValidation.success) {
        logger.warn('Invalid generation parameters provided', { errors: paramValidation.errors });
        endPerformanceTracking(performanceMetric, false, 'INVALID_PARAMS_ERROR');
        return res.status(400).json({
          error: 'Invalid generation parameters provided',
          code: 'INVALID_PARAMS_ERROR',
          details: paramValidation.errors
        });
      }

      try {
        const generatedSpec = await aiService.generateSlideContent(paramValidation.data!);
        spec = [generatedSpec];
        logger.info('Successfully generated slide from parameters');
      } catch (error) {
        logger.error('Failed to generate slide from parameters', { error: error instanceof Error ? error.message : 'Unknown error' });
        endPerformanceTracking(performanceMetric, false, 'AI_GENERATION_ERROR');
        return res.status(500).json({
          error: 'Failed to generate slide content',
          code: 'AI_GENERATION_ERROR',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    } else if (req.body.spec) {
      // Use provided specification
      if (Array.isArray(req.body.spec)) {
        const specArray = req.body.spec as unknown[];
        const validatedSpecs: SlideSpec[] = [];
        const validationErrors: string[][] = [];

        for (const s of specArray) {
          const v = safeValidateSlideSpec(s);
          if (!v.success) {
            validationErrors.push(v.errors || ['Unknown validation error']);
          } else if (v.data) {
            if (Array.isArray(v.data)) {
              validatedSpecs.push(...v.data);
            } else {
              validatedSpecs.push(v.data);
            }
          }
        }

        if (validationErrors.length > 0) {
          logger.warn('Some slide specifications failed validation', { validationErrors });
          endPerformanceTracking(performanceMetric, false, 'VALIDATION_ERROR');
          return res.status(400).json({
            error: 'Some slide specifications failed validation',
            code: 'VALIDATION_ERROR',
            details: validationErrors
          });
        }

        spec = validatedSpecs;
      } else {
        const validation = safeValidateSlideSpec(req.body.spec);
        if (!validation.success) {
          logger.warn('Slide specification validation failed', { errors: validation.errors });
          endPerformanceTracking(performanceMetric, false, 'VALIDATION_ERROR');
          return res.status(400).json({
            error: 'Slide specification validation failed',
            code: 'VALIDATION_ERROR',
            details: validation.errors
          });
        }
        if (validation.data) {
          spec = Array.isArray(validation.data) ? validation.data : [validation.data];
        } else {
          spec = [];
        }
      }
    } else {
      logger.warn('No slide specification or generation parameters provided');
      endPerformanceTracking(performanceMetric, false, 'MISSING_INPUT_ERROR');
      return res.status(400).json({
        error: 'Either slide specification or generation parameters (prompt) must be provided',
        code: 'MISSING_INPUT_ERROR',
        details: ['Provide either "spec" with slide specifications or "prompt" with generation parameters']
      });
    }

    slideCount = spec.length;

    // Guard against undefined or empty spec
    if (!spec || spec.length === 0) {
      logger.error('Internal error: spec not defined or empty');
      endPerformanceTracking(performanceMetric, false, 'INTERNAL_ERROR');
      return res.status(500).json({
        error: 'Internal error: No valid specification provided',
        code: 'INTERNAL_ERROR'
      });
    }

    // Generate PowerPoint using simplified generator
    const requestId = logger.generateRequestId();
    const context = { requestId, operation: 'ppt-generation' };

    logger.startPerf(`ppt-gen-${requestId}`, context);
    logger.info('Starting PowerPoint generation', context, {
      slideCount: Array.isArray(spec) ? spec.length : 1,
      withValidation: req.body.withValidation ?? true,
      firstSlideTitle: Array.isArray(spec) ? spec[0]?.title : (spec as SlideSpec).title,
      firstSlideLayout: Array.isArray(spec) ? spec[0]?.layout : (spec as SlideSpec).layout
    });

    const pptBuffer = await generatePpt(spec, req.body.withValidation ?? true);

    const duration = logger.endPerf(`ppt-gen-${requestId}`, context, {
      bufferSize: pptBuffer.length,
      sizeKB: Math.round(pptBuffer.length / 1024)
    });

    // Configure response headers
    const firstSpec = spec[0];
    const sanitizedTitle = firstSpec.title?.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') || 'presentation';
    const filename = `${sanitizedTitle}_professional.pptx`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Length', pptBuffer.length.toString());

    endPerformanceTracking(performanceMetric, true);
    logger.info('Professional PowerPoint generated successfully', {
      slideCount,
      colorPalette,
      bufferSize: pptBuffer.length,
      filename
    });

    return res.send(pptBuffer);

  } catch (error) {
    logger.error('Professional PowerPoint generation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    endPerformanceTracking(performanceMetric, false, 'GENERATION_ERROR');

    if (error instanceof AIGenerationError) {
      return res.status(503).json({
        error: 'AI service temporarily unavailable',
        code: 'AI_SERVICE_ERROR',
        details: error.message
      });
    }

    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: 'Content validation failed',
        code: 'VALIDATION_ERROR',
        details: error.message
      });
    }

    return res.status(500).json({
      error: 'PowerPoint generation failed',
      code: 'GENERATION_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
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

    // Check if we need to generate slides from parameters
    if (!req.body.spec && req.body.prompt) {
      logger.info('Generating slides from parameters', { prompt: req.body.prompt });

      // Validate generation parameters
      const paramValidation = validationService.validateGenerationParams(req.body);
      if (!paramValidation.success) {
        logger.warn('Invalid generation parameters provided', { errors: paramValidation.errors });
        endPerformanceTracking(performanceMetric, false, 'INVALID_PARAMS_ERROR');
        return res.status(400).json({
          error: 'Invalid generation parameters provided',
          code: 'INVALID_PARAMS_ERROR',
          details: paramValidation.errors
        });
      }

      // Generate slide content using AI service
      try {
        spec = await aiService.generateSlideContent(paramValidation.data!);
        logger.info('Successfully generated slide from parameters');
      } catch (error) {
        logger.error('Failed to generate slide from parameters', { error: error instanceof Error ? error.message : 'Unknown error' });
        endPerformanceTracking(performanceMetric, false, 'AI_GENERATION_ERROR');
        return res.status(500).json({
          error: 'Failed to generate slide content',
          code: 'AI_GENERATION_ERROR',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    } else if (Array.isArray(req.body.spec)) {
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
    } else if (req.body.spec) {
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
    } else {
      // Neither spec nor prompt provided
      logger.warn('No slide specification or generation parameters provided');
      endPerformanceTracking(performanceMetric, false, 'MISSING_INPUT_ERROR');
      return res.status(400).json({
        error: 'Either slide specification or generation parameters (prompt) must be provided',
        code: 'MISSING_INPUT_ERROR',
        details: ['Provide either "spec" with slide specifications or "prompt" with generation parameters']
      });
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

    // Use the new PowerPoint service for generation
    const slides = Array.isArray(spec) ? spec : [spec];
    const theme = PROFESSIONAL_THEMES.find(t => t.id === themeUsed) || PROFESSIONAL_THEMES[0];

    const powerPointResult = await powerPointService.generatePresentation(slides, {
      theme,
      includeImages: true,
      includeNotes: true,
      includeMetadata: true,
      quality: 'standard',
      compactMode: Boolean(req.body.compactMode),
      typographyScale: (req.body.typographyScale as any) || 'auto'
    });

    const pptBuffer = powerPointResult.buffer;

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
    } else if (error instanceof RateLimitError) {
      status = 429;
      code = 'RATE_LIMIT_ERROR';
      message = 'Too many requests. Please wait a moment and try again.';
      logger.warn('Rate limit exceeded during PPT generation', {
        message: error.message,
        retryAfter: error.retryAfter
      });
    } else if (error instanceof ContentFilterError) {
      status = 400;
      code = 'CONTENT_FILTER_ERROR';
      message = 'Content was filtered due to policy violations. Please try different wording.';
      logger.warn('Content filtered during PPT generation', {
        message: error.message,
        filteredContent: error.filteredContent
      });
    } else if (error instanceof NetworkError) {
      status = 502;
      code = 'NETWORK_ERROR';
      message = 'Network error occurred. Please check your connection and try again.';
      logger.error('Network error during PPT generation', {
        message: error.message,
        statusCode: error.statusCode
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

// Enhanced API endpoints removed for simplification

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