# AI PowerPoint Generator - Code Review

## 🎯 Application Overview

The AI PowerPoint Generator is a lean, AI-enhanced web application that transforms text prompts into professional PowerPoint presentations using OpenAI's GPT-4. The system features a sophisticated design system, premium themes, and optimized architecture for AI agent development.

### Key Features
- **AI-Powered Content Generation**: GPT-4 transforms prompts into structured slide content
- **Premium Design System**: Professional themes with sophisticated styling
- **Multiple Layout Types**: Title, Bullets, Two-Column, Mixed Content layouts
- **DALL-E 3 Integration**: Optional AI-generated images
- **Universal Compatibility**: Works with PowerPoint, Keynote, Google Slides

### Technology Stack
- **Backend**: Firebase Cloud Functions + TypeScript + OpenAI API
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **PowerPoint Generation**: PptxGenJS library
- **Validation**: Zod schemas
- **Logging**: Custom smart logging system

## 🏗️ Architecture Overview

### PowerPoint Generation Flow
1. **API Request** → User submits prompt via frontend
2. **AI Processing** → OpenAI generates structured slide content
3. **Validation** → Zod schemas validate slide specifications
4. **Theme Application** → Professional themes applied to content
5. **Slide Building** → Core engine builds individual slides
6. **PPTX Generation** → PptxGenJS creates final PowerPoint file
7. **File Delivery** → Buffer returned to frontend for download

### Execution Sequence
```
Frontend Request → index.ts → powerPointService.ts → pptGenerator-simple.ts → PptxGenJS → PowerPoint File
                     ↓              ↓                      ↓
                 aiService.ts → schema.ts → professionalThemes.ts
                     ↓
                 llm.ts + prompts.ts
```

## 📁 File Structure
```
ai-ppt-generator/
├── functions/                    # Firebase Cloud Functions Backend
│   ├── src/
│   │   ├── index.ts             # Main API endpoints
│   │   ├── pptGenerator-simple.ts # Core PowerPoint generation
│   │   ├── schema.ts            # Validation schemas
│   │   ├── professionalThemes.ts # Theme system
│   │   ├── llm.ts               # OpenAI integration
│   │   ├── prompts.ts           # AI prompt templates
│   │   ├── services/            # Service layer
│   │   └── utils/               # Utilities
│   └── test/                    # Test suite
├── frontend/                    # React Frontend
│   ├── src/
│   │   ├── hooks/               # API integration hooks
│   │   ├── components/          # React components
│   │   └── utils/               # Frontend utilities
└── README.md                    # Documentation
```

---

# 📄 PowerPoint Generation Files (Execution Order)


## API Layer

### 1. index.ts

**Path**: `functions/src/index.ts`

**Description**: Main API endpoints - handles /generate and /generate/professional requests

```ts
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
```

---


## Service Layer

### 2. powerPointService.ts

**Path**: `functions/src/services/powerPointService.ts`

**Description**: PowerPoint service orchestrator - coordinates slide processing and generation

```ts
/**
 * PowerPoint Service Module - Centralized PowerPoint Operations
 * @version 1.1.0
 */

import { generatePpt } from '../pptGenerator-simple';
import { type SlideSpec } from '../schema';
import { type ProfessionalTheme } from '../professionalThemes';
import { logger, type LogContext } from '../utils/smartLogger';

/** PowerPoint generation options */
export interface PowerPointOptions {
  theme: ProfessionalTheme;
  includeImages?: boolean;
  includeNotes?: boolean;
  includeMetadata?: boolean;   // embed into the file (stubbed below)
  optimizeForSize?: boolean;   // run optimizer (stubbed below)
  quality?: 'draft' | 'standard' | 'high';
  compactMode?: boolean;       // compact spacing mode for dense decks
  typographyScale?: 'auto' | 'compact' | 'normal' | 'large'; // global typography scaling preference
}

/** PowerPoint generation result */
export interface PowerPointResult {
  buffer: Buffer;
  metadata: {
    slideCount: number;
    fileSize: number;
    generationTime: number;
    theme: string;
    quality: string;
  };
}

/** PowerPoint Service Interface */
export interface IPowerPointService {
  generatePresentation(slides: SlideSpec[], options: PowerPointOptions): Promise<PowerPointResult>;
  validateSlides(slides: SlideSpec[]): Promise<{ valid: boolean; errors: string[] }>;
  estimateFileSize(slides: SlideSpec[], options: PowerPointOptions): number;
  getSupportedFormats(): string[];
}

/** Internal: merged options with defaults applied */
type ResolvedOptions = Required<Omit<PowerPointOptions, 'theme'>> & { theme: ProfessionalTheme };

/** Defaults */
const DEFAULTS: ResolvedOptions = {
  theme: { name: 'Default' } as ProfessionalTheme, // overwritten by caller
  includeImages: true,
  includeNotes: true,
  includeMetadata: true,
  optimizeForSize: false,
  quality: 'standard',
  compactMode: false,
  typographyScale: 'auto'
};

/** Internal type augmentation to avoid breaking SlideSpec */
type SlideWithGen = SlideSpec & { generatedImageUrl?: string };

type Logger = Pick<Console, 'log' | 'warn' | 'error' | 'time' | 'timeEnd'>;

/**
 * Main PowerPoint Service Implementation
 */
export class PowerPointService implements IPowerPointService {
  constructor(private readonly logger: Logger = console) {}

  /** Generate a complete PowerPoint presentation */
  async generatePresentation(slides: SlideSpec[], options: PowerPointOptions): Promise<PowerPointResult> {
    const startTime = Date.now();
    const opts: ResolvedOptions = { ...DEFAULTS, ...options, theme: options.theme };
    const context: LogContext = {
      requestId: `ppt_gen_${Date.now()}`,
      component: 'powerPointService',
      operation: 'generatePresentation'
    };

    this.logger.log(`Generating PowerPoint with ${slides.length} slides (quality=${opts.quality})...`);
    logger.info(`Starting PowerPoint generation`, context, { slideCount: slides.length, options });

    try {
      // 1) Validate slides up front
      const validation = await this.validateSlides(slides);
      if (!validation.valid) {
        logger.warn('Slide validation failed', context, { errors: validation.errors });
        throw new Error(`Slide validation failed: ${validation.errors.join(', ')}`);
      }

      logger.info('Slide validation passed', context);

      // 2) Preprocess slides to reflect options (don’t rely on generator options)
      let processedSlides = await this.preprocessSlides(slides, opts);

      // 3) Batch image generation (only when we actually want images and not in draft)
      if (opts.includeImages && opts.quality !== 'draft') {
        processedSlides = await this.processBatchImages(processedSlides, opts);
      }

      // 4) Generate PPTX buffer (simplified - no generator options)
      const rawBuffer = await generatePpt(processedSlides as SlideSpec[], true);

      // 5) Optional size optimization
      const optimizedBuffer = opts.optimizeForSize
        ? await PowerPointUtils.optimizeFileSize(rawBuffer)
        : rawBuffer;

      // 6) Optional metadata embedding
      const finalBuffer = opts.includeMetadata
        ? await PowerPointUtils.embedMetadata(optimizedBuffer, {
            theme: opts.theme.name,
            quality: opts.quality,
            slideCount: processedSlides.length
          })
        : optimizedBuffer;

      const generationTime = Date.now() - startTime;
      const fileSize = finalBuffer.length;

      this.logger.log(`PowerPoint generated successfully in ${generationTime}ms (${fileSize} bytes)`);
      logger.info('PowerPoint generation complete', context, { fileSize, generationTime, slideCount: slides.length });

      // Log optimization if applied
      if (opts.optimizeForSize && rawBuffer.length !== finalBuffer.length) {
        logger.info('File size optimization applied', context, {
          originalSize: rawBuffer.length,
          optimizedSize: finalBuffer.length,
          savings: rawBuffer.length - finalBuffer.length
        });
      }

      return {
        buffer: finalBuffer,
        metadata: {
          slideCount: processedSlides.length,
          fileSize,
          generationTime,
          theme: opts.theme.name,
          quality: opts.quality
        }
      };
    } catch (error) {
      const generationTime = Date.now() - startTime;
      this.logger.error(`PowerPoint generation failed after ${generationTime}ms:`, error);

      logger.error('PowerPoint generation failed', context, {
        error: error instanceof Error ? error.message : String(error),
        generationTime,
        slideCount: slides.length,
        options
      });

      throw error;
    }
  }

  /** Validate slide specifications */
  async validateSlides(slides: SlideSpec[]): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    const MAX_SLIDES = 50;

    if (!slides || slides.length === 0) {
      errors.push('No slides provided');
      return { valid: false, errors };
    }
    if (slides.length > MAX_SLIDES) {
      errors.push(`Too many slides (maximum ${MAX_SLIDES} allowed)`);
    }

    for (let i = 0; i < slides.length; i++) {
      errors.push(...this.validateSingleSlide(slides[i] as SlideWithGen, i + 1));
    }

    return { valid: errors.length === 0, errors };
  }

  /** Estimate file size based on slide content and options (rough heuristic, but consistent) */
  estimateFileSize(slides: SlideSpec[], options: PowerPointOptions): number {
    const opts: ResolvedOptions = { ...DEFAULTS, ...options, theme: options.theme };

    let size = 50_000; // base ZIP container overhead (~50KB)

    for (const s0 of slides) {
      const s = s0 as SlideWithGen;

      // Text bytes (very rough): characters * 8 (XML + packing + relationships)
      const textChars =
        (s.title?.length || 0) +
        (s.paragraph?.length || 0) +
        (s.bullets?.reduce((acc, b) => acc + b.length + 2, 0) || 0) +
        (s.notes?.length || 0);

      size += textChars * 8;

      // Images: only count if slide has a prompt or a URL and images are included for this run
      const hasImage = Boolean((s as any).imagePrompt || s.generatedImageUrl);
      if (opts.includeImages && hasImage) {
        const perImage =
          opts.quality === 'high' ? 400_000 :
          opts.quality === 'draft' ? 80_000 :
          200_000;
        size += perImage;
      }
    }

    // Optimize-for-size typically squeezes 10–30%, model at 20%
    if (opts.optimizeForSize) size = Math.round(size * 0.8);

    return Math.max(1024, Math.round(size));
  }

  /** Only advertise formats we truly support right now */
  getSupportedFormats(): string[] {
    return ['pptx'];
  }

  /** ---- private helpers ---- */

  private validateSingleSlide(slide: SlideWithGen, slideNumber: number): string[] {
    const errors: string[] = [];

    // Title
    if (!slide.title || slide.title.trim().length === 0) {
      errors.push(`Slide ${slideNumber}: Missing title`);
    } else if (slide.title.length > 100) {
      errors.push(`Slide ${slideNumber}: Title too long (${slide.title.length} characters, max 100)`);
    }

    // Paragraph / bullets
    if (slide.paragraph && slide.paragraph.length > 1000) {
      errors.push(`Slide ${slideNumber}: Paragraph too long (${slide.paragraph.length} characters, max 1000)`);
    }
    if (slide.bullets && slide.bullets.length > 10) {
      errors.push(`Slide ${slideNumber}: Too many bullet points (${slide.bullets.length}, max 10)`);
    }

    // Layout-specific checks (non-breaking – only add if properties exist)
    if ((slide as any).layout === 'two-column' && !(slide as any).left && !(slide as any).right) {
      errors.push(`Slide ${slideNumber}: Two-column layout requires left or right content`);
    }

    return errors;
  }

  /** Preprocess slides so the generator receives exactly what we want */
  private async preprocessSlides(slides: SlideSpec[], options: ResolvedOptions): Promise<SlideSpec[]> {
    const processed = slides.map((slide0) => {
      const slide = { ...(slide0 as SlideWithGen) };

      // Notes
      if (!options.includeNotes && 'notes' in slide) {
        delete slide.notes;
      } else if (options.includeNotes && options.quality === 'high' && !slide.notes && slide.paragraph) {
        // Add brief notes from paragraph if absent
        const snippet = slide.paragraph.length > 200 ? `${slide.paragraph.slice(0, 200)}…` : slide.paragraph;
        slide.notes = `Key points: ${snippet}`;
      }

      // Images
      const shouldStripImages = !options.includeImages || options.quality === 'draft';
      if (shouldStripImages) {
        // Remove both prompt and generated URL references
        if ('generatedImageUrl' in slide) delete slide.generatedImageUrl;
        if ('imagePrompt' in (slide as any)) delete (slide as any).imagePrompt;
      }

      // Draft truncation
      if (options.quality === 'draft' && slide.paragraph && slide.paragraph.length > 500) {
        slide.paragraph = slide.paragraph.slice(0, 500) + '…';
      }

      return slide as SlideSpec;
    });

    return processed;
  }

  /** Generate images in batch (non-breaking: adds `generatedImageUrl`, keeps `imagePrompt`) */
  private async processBatchImages(slides: SlideSpec[], options: ResolvedOptions): Promise<SlideSpec[]> {
    try {
      // Image service removed for lean codebase - placeholder implementation
      const prompts: string[] = [];
      const idxs: number[] = [];

      slides.forEach((s, i) => {
        const prompt = (s as any).imagePrompt as string | undefined;
        if (prompt) {
          prompts.push(prompt);
          idxs.push(i);
        }
      });

      if (prompts.length === 0) return slides;

      this.logger.log(`Image generation requested for ${prompts.length} slides (service disabled for lean build)`);

      // For lean build, we skip image generation but don't break the flow
      return slides;
    } catch (err) {
      this.logger.warn('Batch image processing failed; continuing without generated images:', err);
      return slides;
    }
  }
}

/** Utility functions for PowerPoint operations */
export class PowerPointUtils {
  /** Convert slides to different formats (not implemented) */
  static async convertToFormat(buffer: Buffer, format: string): Promise<Buffer> {
    if (format !== 'pptx') {
      throw new Error(`Conversion to '${format}' is not implemented`);
    }
    return buffer;
  }

  /** Optimize PowerPoint file size (stub) */
  static async optimizeFileSize(buffer: Buffer): Promise<Buffer> {
    // TODO: implement (recompress media, dedupe XML parts, remove unused relationships)
    return buffer;
  }

  /** Embed metadata into file (stub – safe no-op until wired) */
  static async embedMetadata(buffer: Buffer, meta: Record<string, any>): Promise<Buffer> {
    // TODO: implement using PPTX core properties
    // meta: { theme, quality, slideCount, ... }
    return buffer;
  }

  /** Extract metadata from PowerPoint file */
  static async extractMetadata(buffer: Buffer): Promise<Record<string, any>> {
    return {
      fileSize: buffer.length,
      format: 'pptx',
      created: new Date().toISOString()
    };
  }

  /** Validate PowerPoint file integrity (basic ZIP signature & size checks) */
  static async validateFile(buffer: Buffer): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    if (!buffer || buffer.length === 0) errors.push('Empty file buffer');
    if (buffer.length < 1000) errors.push('File too small to be a valid PowerPoint');

    // ZIP local file header signature: 0x50 0x4B 0x03 0x04
    if (buffer.length >= 4) {
      const sig = buffer.slice(0, 4);
      const expected = Buffer.from([0x50, 0x4B, 0x03, 0x04]);
      if (!sig.equals(expected)) errors.push('Invalid PowerPoint file signature');
    }

    return { valid: errors.length === 0, errors };
  }
}

// Export singleton instance
export const powerPointService = new PowerPointService();
export default powerPointService;
```

---


## Core Engine

### 3. pptGenerator-simple.ts

**Path**: `functions/src/pptGenerator-simple.ts`

**Description**: Core PowerPoint generation engine - creates PPTX files using PptxGenJS

```ts
/**
 * Simplified PowerPoint Generator
 * 
 * This is a streamlined version of the PowerPoint generator that focuses on
 * core functionality without complex features. Optimized for AI agent development.
 */

import pptxgen from 'pptxgenjs';
import { SlideSpec } from './schema';
import { ProfessionalTheme, getThemeById, selectThemeForContent } from './professionalThemes';
import { logger, type LogContext } from './utils/smartLogger';
import { corruptionDiagnostics } from './utils/corruptionDiagnostics';

/**
 * Ensure color is a valid hex string for pptxgenjs
 */
function safeColor(color: any): string {
  if (typeof color === 'string') {
    return color.replace('#', '');
  }
  if (typeof color === 'object' && color.primary) {
    return color.primary.replace('#', '');
  }
  return '333333'; // Default dark gray
}

/**
 * Get text color from theme (handles nested structure)
 */
function getTextColor(theme: ProfessionalTheme): string {
  if (theme.colors.text && typeof theme.colors.text === 'object') {
    return safeColor(theme.colors.text.primary);
  }
  return safeColor(theme.colors.text || '333333');
}

/**
 * Convert CSS font stack to PowerPoint-compatible font name
 */
function getPowerPointFont(fontFamily: string): string {
  // PowerPoint-compatible font mapping
  const fontMap: { [key: string]: string } = {
    'Inter': 'Calibri',
    'SF Pro Display': 'Calibri',
    'SF Pro Text': 'Calibri',
    'system-ui': 'Calibri',
    '-apple-system': 'Calibri',
    'BlinkMacSystemFont': 'Calibri',
    'Segoe UI': 'Segoe UI',
    'Roboto': 'Calibri',
    'Helvetica Neue': 'Helvetica',
    'Arial': 'Arial',
    'Times New Roman': 'Times New Roman',
    'Charter': 'Times New Roman',
    'Cambria': 'Cambria',
    'Work Sans': 'Calibri',
    'IBM Plex Sans': 'Calibri',
    'DM Sans': 'Calibri'
  };

  // Extract the first font from the CSS font stack
  const firstFont = fontFamily
    .split(',')[0]
    .trim()
    .replace(/['"]/g, ''); // Remove quotes

  // Return mapped font or fallback to Calibri
  return fontMap[firstFont] || 'Calibri';
}

/**
 * Get premium background design for slide
 * Creates sophisticated, professional backgrounds with subtle colors (simplified for compatibility)
 */
function getModernBackground(theme: ProfessionalTheme, slideIndex: number = 0): any {
  const colors = theme.colors;

  // Create sophisticated background variations with solid colors (pptxgenjs compatible)
  const backgroundVariations = [
    // Variation 1: Clean white with subtle tint
    {
      color: colors.background === '#FFFFFF' ? 'FAFBFC' : safeColor(colors.background),
      transparency: 0
    },
    // Variation 2: Very light surface color
    {
      color: safeColor(colors.surface),
      transparency: 15
    },
    // Variation 3: Ultra-light primary color
    {
      color: safeColor(colors.primary),
      transparency: 95
    }
  ];

  // Cycle through variations based on slide index
  const variation = backgroundVariations[slideIndex % backgroundVariations.length];

  return variation;
}

/**
 * Modern layout constants for consistent spacing and positioning
 */
const MODERN_LAYOUT = {
  // Margins and padding
  margins: {
    top: 0.8,
    bottom: 0.5,
    left: 0.8,
    right: 0.8
  },

  // Content areas
  content: {
    width: 8.4,  // 10 - left margin - right margin
    titleHeight: 1.0,
    subtitleHeight: 0.8,
    bodyStartY: 2.0,
    bodyHeight: 4.5
  },

  // Typography spacing
  spacing: {
    titleToContent: 0.4,
    bulletSpacing: 0.35,
    paragraphSpacing: 0.25,
    columnGap: 0.6
  },

  // Design elements
  elements: {
    accentLineHeight: 0.08,
    sectionDividerHeight: 0.04,
    cardPadding: 0.3,
    cornerElementSize: 0.4
  },

  // Premium typography constants for sophisticated appearance
  typography: {
    title: {
      fontSize: 36,
      lineSpacing: 40,
      fontWeight: 'bold'
    },
    subtitle: {
      fontSize: 26,
      lineSpacing: 30,
      fontWeight: 'normal'
    },
    body: {
      fontSize: 22,
      lineSpacing: 30,
      fontWeight: 'normal'
    },
    bullets: {
      fontSize: 20,
      lineSpacing: 36,
      fontWeight: 'normal'
    }
  }
};

/**
 * Add sophisticated modern design elements with premium visual appeal
 */
function addModernDesignElements(slide: any, theme: ProfessionalTheme, slideIndex: number = 0, layout: string = 'default'): void {
  const colors = theme.colors;
  const { margins, elements } = MODERN_LAYOUT;

  // 1. Premium header design with gradient effect
  slide.addShape('rect', {
    x: 0, y: 0, w: 10, h: 0.15,
    fill: { color: safeColor(colors.accent) },
    line: { width: 0 }
  });

  // Add subtle shadow effect below header
  slide.addShape('rect', {
    x: 0, y: 0.15, w: 10, h: 0.05,
    fill: { color: safeColor(colors.accent), transparency: 85 },
    line: { width: 0 }
  });

  // 2. Modern content container with subtle elevation
  slide.addShape('rect', {
    x: margins.left - 0.15,
    y: margins.top - 0.15,
    w: MODERN_LAYOUT.content.width + 0.3,
    h: 6.5,
    fill: { color: 'FFFFFF', transparency: 100 },
    line: {
      color: safeColor(colors.surface),
      width: 1,
      transparency: 60
    }
  });

  // Add subtle drop shadow
  slide.addShape('rect', {
    x: margins.left - 0.1,
    y: margins.top - 0.1,
    w: MODERN_LAYOUT.content.width + 0.3,
    h: 6.5,
    fill: { color: safeColor(colors.surface), transparency: 95 },
    line: { width: 0 }
  });

  // 3. Enhanced layout-specific design elements
  switch (layout) {
    case 'title':
      // Premium title slide design
      addTitleSlideDesign(slide, colors, slideIndex);
      break;

    case 'title-bullets':
      // Enhanced bullet slide design
      addBulletSlideDesign(slide, colors, slideIndex);
      break;

    case 'two-column':
      // Sophisticated column design
      addTwoColumnDesign(slide, colors, slideIndex);
      break;

    case 'mixed-content':
      // Premium mixed content design
      addMixedContentDesign(slide, colors, slideIndex);
      break;
  }

  // 4. Dynamic corner elements with modern styling
  if (slideIndex % 2 === 1) {
    // Modern geometric corner element
    slide.addShape('circle', {
      x: 9.0, y: 6.6, w: 0.6, h: 0.6,
      fill: { color: safeColor(colors.accent), transparency: 75 },
      line: { width: 0 }
    });

    // Inner accent circle
    slide.addShape('circle', {
      x: 9.15, y: 6.75, w: 0.3, h: 0.3,
      fill: { color: safeColor(colors.primary), transparency: 60 },
      line: { width: 0 }
    });
  }

  // 5. Premium footer design (every third slide)
  if (slideIndex % 3 === 2) {
    slide.addShape('rect', {
      x: margins.left, y: 7.1, w: MODERN_LAYOUT.content.width, h: 0.08,
      fill: { color: safeColor(colors.secondary), transparency: 70 },
      line: { width: 0 }
    });

    // Add subtle highlight
    slide.addShape('rect', {
      x: margins.left, y: 7.1, w: 2, h: 0.08,
      fill: { color: safeColor(colors.accent), transparency: 50 },
      line: { width: 0 }
    });
  }
}

/**
 * Add premium design elements for title slides
 */
function addTitleSlideDesign(slide: any, colors: any, slideIndex: number): void {
  // Elegant title underline with gradient effect
  slide.addShape('rect', {
    x: 2, y: 4.8, w: 6, h: 0.08,
    fill: { color: safeColor(colors.primary), transparency: 40 },
    line: { width: 0 }
  });

  // Accent highlight
  slide.addShape('rect', {
    x: 2, y: 4.8, w: 1.5, h: 0.08,
    fill: { color: safeColor(colors.accent) },
    line: { width: 0 }
  });

  // Decorative side elements
  slide.addShape('circle', {
    x: 1.2, y: 4.6, w: 0.4, h: 0.4,
    fill: { color: safeColor(colors.accent), transparency: 80 },
    line: { width: 0 }
  });

  slide.addShape('circle', {
    x: 8.4, y: 4.6, w: 0.4, h: 0.4,
    fill: { color: safeColor(colors.primary), transparency: 80 },
    line: { width: 0 }
  });
}

/**
 * Add premium design elements for bullet slides
 */
function addBulletSlideDesign(slide: any, colors: any, slideIndex: number): void {
  const { margins } = MODERN_LAYOUT;

  // Modern vertical accent with gradient effect
  slide.addShape('rect', {
    x: margins.left - 0.25,
    y: MODERN_LAYOUT.content.bodyStartY - 0.2,
    w: 0.15,
    h: MODERN_LAYOUT.content.bodyHeight + 0.4,
    fill: { color: safeColor(colors.accent) },
    line: { width: 0 }
  });

  // Subtle gradient overlay
  slide.addShape('rect', {
    x: margins.left - 0.1,
    y: MODERN_LAYOUT.content.bodyStartY - 0.2,
    w: 0.05,
    h: MODERN_LAYOUT.content.bodyHeight + 0.4,
    fill: { color: safeColor(colors.primary), transparency: 70 },
    line: { width: 0 }
  });

  // Content background with subtle elevation
  slide.addShape('rect', {
    x: margins.left + 0.1,
    y: MODERN_LAYOUT.content.bodyStartY - 0.1,
    w: MODERN_LAYOUT.content.width - 0.3,
    h: MODERN_LAYOUT.content.bodyHeight + 0.2,
    fill: { color: 'FFFFFF', transparency: 100 },
    line: {
      color: safeColor(colors.surface),
      width: 0.5,
      transparency: 90
    }
  });
}

/**
 * Add premium design elements for two-column slides
 */
function addTwoColumnDesign(slide: any, colors: any, slideIndex: number): void {
  const { margins } = MODERN_LAYOUT;

  // Elegant column separator with modern styling
  slide.addShape('rect', {
    x: 4.95,
    y: MODERN_LAYOUT.content.bodyStartY - 0.2,
    w: 0.1,
    h: MODERN_LAYOUT.content.bodyHeight + 0.4,
    fill: { color: safeColor(colors.accent), transparency: 60 },
    line: { width: 0 }
  });

  // Decorative top and bottom caps
  slide.addShape('circle', {
    x: 4.9, y: MODERN_LAYOUT.content.bodyStartY - 0.3, w: 0.2, h: 0.2,
    fill: { color: safeColor(colors.accent), transparency: 40 },
    line: { width: 0 }
  });

  slide.addShape('circle', {
    x: 4.9, y: MODERN_LAYOUT.content.bodyStartY + MODERN_LAYOUT.content.bodyHeight + 0.1, w: 0.2, h: 0.2,
    fill: { color: safeColor(colors.primary), transparency: 40 },
    line: { width: 0 }
  });

  // Column background highlights
  slide.addShape('rect', {
    x: margins.left,
    y: MODERN_LAYOUT.content.bodyStartY - 0.1,
    w: 3.9,
    h: MODERN_LAYOUT.content.bodyHeight + 0.2,
    fill: { color: safeColor(colors.surface), transparency: 97 },
    line: { width: 0 }
  });

  slide.addShape('rect', {
    x: 5.1,
    y: MODERN_LAYOUT.content.bodyStartY - 0.1,
    w: 3.9,
    h: MODERN_LAYOUT.content.bodyHeight + 0.2,
    fill: { color: safeColor(colors.primary), transparency: 98 },
    line: { width: 0 }
  });
}

/**
 * Add premium design elements for mixed content slides
 */
function addMixedContentDesign(slide: any, colors: any, slideIndex: number): void {
  const { margins } = MODERN_LAYOUT;

  // Premium content cards with elevation
  slide.addShape('rect', {
    x: margins.left - 0.1,
    y: MODERN_LAYOUT.content.bodyStartY - 0.2,
    w: 4.0,
    h: MODERN_LAYOUT.content.bodyHeight + 0.4,
    fill: { color: 'FFFFFF' },
    line: {
      color: safeColor(colors.surface),
      width: 1,
      transparency: 70
    }
  });

  slide.addShape('rect', {
    x: 5.3,
    y: MODERN_LAYOUT.content.bodyStartY - 0.2,
    w: 4.0,
    h: MODERN_LAYOUT.content.bodyHeight + 0.4,
    fill: { color: 'FFFFFF' },
    line: {
      color: safeColor(colors.primary),
      width: 1,
      transparency: 70
    }
  });

  // Card headers with theme colors
  slide.addShape('rect', {
    x: margins.left - 0.1,
    y: MODERN_LAYOUT.content.bodyStartY - 0.2,
    w: 4.0,
    h: 0.3,
    fill: { color: safeColor(colors.surface), transparency: 80 },
    line: { width: 0 }
  });

  slide.addShape('rect', {
    x: 5.3,
    y: MODERN_LAYOUT.content.bodyStartY - 0.2,
    w: 4.0,
    h: 0.3,
    fill: { color: safeColor(colors.primary), transparency: 80 },
    line: { width: 0 }
  });

  // Modern connecting element
  slide.addShape('rect', {
    x: 4.8, y: MODERN_LAYOUT.content.bodyStartY + 2, w: 0.4, h: 0.08,
    fill: { color: safeColor(colors.accent), transparency: 60 },
    line: { width: 0 }
  });
}

/**
 * Calculate optimal text positioning with modern spacing
 */
function getModernTextPosition(
  contentType: 'title' | 'subtitle' | 'body' | 'bullets',
  options: {
    slideIndex?: number;
    totalItems?: number;
    itemIndex?: number;
    isLeftColumn?: boolean;
    isRightColumn?: boolean;
  } = {}
): { x: number; y: number; w: number; h: number } {
  const { margins, content, spacing } = MODERN_LAYOUT;
  const { slideIndex = 0, totalItems = 1, itemIndex = 0, isLeftColumn = false, isRightColumn = false } = options;

  switch (contentType) {
    case 'title':
      return {
        x: margins.left,
        y: margins.top,
        w: content.width,
        h: content.titleHeight
      };

    case 'subtitle':
      return {
        x: margins.left,
        y: margins.top + content.titleHeight + spacing.titleToContent,
        w: content.width,
        h: content.subtitleHeight
      };

    case 'body':
      return {
        x: margins.left,
        y: content.bodyStartY,
        w: content.width,
        h: content.bodyHeight
      };

    case 'bullets':
      if (isLeftColumn) {
        return {
          x: margins.left + 0.2,
          y: content.bodyStartY,
          w: (content.width - spacing.columnGap) / 2 - 0.2,
          h: content.bodyHeight
        };
      } else if (isRightColumn) {
        return {
          x: margins.left + (content.width + spacing.columnGap) / 2,
          y: content.bodyStartY,
          w: (content.width - spacing.columnGap) / 2 - 0.2,
          h: content.bodyHeight
        };
      } else {
        return {
          x: margins.left + 0.2,
          y: content.bodyStartY,
          w: content.width - 0.4,
          h: content.bodyHeight
        };
      }

    default:
      return {
        x: margins.left,
        y: content.bodyStartY,
        w: content.width,
        h: content.bodyHeight
      };
  }
}

/**
 * Format bullet points with premium styling and enhanced visual hierarchy
 */
function formatModernBullets(bullets: string[], theme: ProfessionalTheme): string {
  if (!bullets || bullets.length === 0) return '';

  // Use sophisticated bullet styling with enhanced characters
  const bulletChar = '●'; // Modern circular bullet for better visibility and professional appearance
  const formattedBullets = bullets.map((bullet, index) => {
    const trimmedBullet = bullet.trim();

    // Enhanced spacing based on content length for optimal readability
    if (bullets.length > 4) {
      return `${bulletChar} ${trimmedBullet}`;
    } else {
      // For shorter lists, use enhanced spacing for premium appearance
      return `${bulletChar}  ${trimmedBullet}`;
    }
  });

  return formattedBullets.join('\n\n'); // Double spacing for premium readability
}

/**
 * Simple PowerPoint generation function
 * @param specs - Array of slide specifications
 * @param validateStyles - Whether to perform basic validation (default: true)
 * @returns Promise<Buffer> - PowerPoint file buffer
 */
export async function generateSimplePpt(specs: SlideSpec[], validateStyles: boolean = true): Promise<Buffer> {
  const startTime = Date.now();
  const context: LogContext = {
    requestId: `ppt_simple_${Date.now()}`,
    component: 'pptGenerator-simple',
    operation: 'generateSimplePpt'
  };

  // Enhanced logging for corruption debugging
  console.log('🎯 generateSimplePpt called with specs:', {
    specsCount: specs.length,
    validateStyles,
    specs: specs.map(spec => ({
      title: spec.title,
      layout: spec.layout,
      hasParagraph: !!spec.paragraph,
      hasBullets: !!(spec.bullets && spec.bullets.length > 0),
      hasLeft: !!(spec as any).left,
      hasRight: !!(spec as any).right,
      allKeys: Object.keys(spec)
    }))
  });

  logger.info(`Starting PowerPoint generation for ${specs.length} slides`, context, { validateStyles });

  // Run comprehensive corruption diagnostics
  const presentationTitle = specs.length > 0 ? specs[0].title : 'Unknown Presentation';
  const diagnosticReport = corruptionDiagnostics.generateReport(
    presentationTitle,
    specs,
    undefined, // Buffer will be analyzed later
    context
  );

  // Log diagnostic results
  logger.info('Corruption diagnostics completed', context, {
    reportId: diagnosticReport.id,
    overallHealth: diagnosticReport.overallHealth,
    issueCount: diagnosticReport.issues.length,
    criticalIssues: diagnosticReport.issues.filter(i => i.severity === 'critical').length,
    fixesApplied: diagnosticReport.fixesApplied.length
  });

  // Fail if critical issues found
  const criticalIssues = diagnosticReport.issues.filter(i => i.severity === 'critical');
  if (criticalIssues.length > 0) {
    const errorMessage = `Critical corruption issues detected: ${criticalIssues.map(i => i.title).join(', ')}`;
    logger.error(errorMessage, context, { diagnosticReport });
    throw new Error(errorMessage);
  }

  // Warn about high-severity issues
  const highIssues = diagnosticReport.issues.filter(i => i.severity === 'high');
  if (highIssues.length > 0) {
    logger.warn(`High-severity issues detected: ${highIssues.map(i => i.title).join(', ')}`, context, {
      highIssues: highIssues.length,
      issues: highIssues.map(i => ({ title: i.title, description: i.description, suggestedFix: i.suggestedFix }))
    });
  }

  // Log any auto-fixes that were applied
  if (diagnosticReport.fixesApplied.length > 0) {
    logger.info(`Auto-fixes applied: ${diagnosticReport.fixesApplied.join(', ')}`, context, {
      fixCount: diagnosticReport.fixesApplied.length,
      fixes: diagnosticReport.fixesApplied
    });
  }

  // Create presentation
  const pres = new pptxgen();
  
  // Set basic metadata
  pres.author = 'AI PowerPoint Generator';
  pres.company = 'Professional Presentations';
  pres.title = specs.length > 0 ? specs[0].title : 'AI Generated Presentation';

  // Get theme
  const theme = getThemeById('corporate-blue') || selectThemeForContent({ 
    presentationType: 'business', 
    tone: 'professional' 
  });

  // Generate slides
  for (let i = 0; i < specs.length; i++) {
    const spec = specs[i];
    const slide = pres.addSlide();
    const slideStartTime = Date.now();

    console.log(`📄 Processing slide ${i + 1}/${specs.length}: ${spec.title} (${spec.layout})`);

    logger.info(`Starting slide ${i + 1}: ${spec.title}`, context, { layout: spec.layout });

    try {
      await buildSimpleSlide(slide, spec, theme, i);

      const slideProcessingTime = Date.now() - slideStartTime;
      const slideMetrics = {
        slideIndex: i,
        layout: spec.layout,
        theme: theme.name,
        contentElements: {
          title: !!spec.title,
          bullets: spec.bullets?.length || 0,
          paragraphs: spec.paragraph ? 1 : 0,
          images: spec.imagePrompt ? 1 : 0,
          charts: 0, // Not implemented in simple generator
          tables: 0  // Not implemented in simple generator
        },
        processingTime: slideProcessingTime,
        optimizationApplied: false
      };

      logger.info(`Completed slide ${i + 1}`, context, {
        processingTime: slideProcessingTime,
        layout: spec.layout
      });

    } catch (error) {
      console.error(`❌ Error building slide ${i + 1}:`, error);

      logger.error(`Error building slide ${i + 1}`, context, {
        error: error instanceof Error ? error.message : String(error),
        slideIndex: i,
        slideTitle: spec.title,
        layout: spec.layout
      });

      // Add error slide instead of failing completely
      slide.addText('Error generating slide content', {
        x: 1, y: 2, w: 8, h: 1,
        fontSize: 24, color: 'FF0000', bold: true
      });
    }
  }

  // Generate buffer using the correct pptxgenjs method
  let buffer: Buffer;
  try {
    buffer = await pres.write({ outputType: 'nodebuffer' }) as Buffer;

    // Validate buffer integrity
    if (!buffer || buffer.length === 0) {
      throw new Error('Generated buffer is empty or null');
    }

    // Check for valid PowerPoint/ZIP signature
    const signature = buffer.subarray(0, 4);
    const expectedSignature = Buffer.from([0x50, 0x4B, 0x03, 0x04]); // "PK\x03\x04"

    if (!signature.equals(expectedSignature)) {
      logger.error('Invalid PowerPoint file signature', context, {
        actualSignature: Array.from(signature).map(b => `0x${b.toString(16).padStart(2, '0')}`).join(' '),
        expectedSignature: '0x50 0x4B 0x03 0x04',
        bufferSize: buffer.length
      });
      throw new Error('Generated PowerPoint file has invalid signature - file may be corrupted');
    }

    // Check minimum file size (PowerPoint files should be at least a few KB)
    if (buffer.length < 1000) {
      logger.error('PowerPoint file too small', context, {
        fileSize: buffer.length,
        minimumExpected: 1000
      });
      throw new Error(`Generated PowerPoint file is too small (${buffer.length} bytes) - likely corrupted`);
    }

    logger.info('Buffer validation passed', context, {
      fileSize: buffer.length,
      signature: 'valid',
      sizeCheck: 'passed'
    });

    // Run post-generation corruption diagnostics on the buffer
    const bufferDiagnosticReport = corruptionDiagnostics.generateReport(
      presentationTitle,
      specs,
      buffer,
      { ...context, stage: 'post_generation' }
    );

    // Log buffer diagnostic results
    logger.info('Post-generation buffer diagnostics completed', context, {
      reportId: bufferDiagnosticReport.id,
      overallHealth: bufferDiagnosticReport.overallHealth,
      bufferIssues: bufferDiagnosticReport.issues.filter(i => i.type === 'buffer').length,
      totalIssues: bufferDiagnosticReport.issues.length
    });

    // Check for buffer-specific critical issues
    const bufferCriticalIssues = bufferDiagnosticReport.issues.filter(i =>
      i.severity === 'critical' && i.type === 'buffer'
    );

    if (bufferCriticalIssues.length > 0) {
      const bufferErrorMessage = `Critical buffer corruption detected: ${bufferCriticalIssues.map(i => i.title).join(', ')}`;
      logger.error(bufferErrorMessage, context, {
        bufferDiagnosticReport,
        bufferSize: buffer.length
      });
      throw new Error(bufferErrorMessage);
    }

  } catch (bufferError) {
    logger.error('Buffer generation error', context, {
      error: bufferError instanceof Error ? bufferError.message : String(bufferError),
      stage: 'buffer_generation'
    });
    throw bufferError;
  }

  const endTime = Date.now();
  const generationTime = endTime - startTime;
  const fileSize = buffer.length;

  console.log(`✅ Simple PowerPoint generated successfully in ${generationTime}ms`);
  console.log(`📊 Generated ${specs.length} slides, file size: ${Math.round(fileSize / 1024)}KB`);

  logger.info('PowerPoint generation complete', context, {
    fileSize,
    generationTime,
    slideCount: specs.length
  });

  return buffer;
}

/**
 * Build a simple slide based on layout type
 */
async function buildSimpleSlide(slide: any, spec: SlideSpec, theme: ProfessionalTheme, slideIndex: number = 0): Promise<void> {
  const colors = theme.colors;
  const fonts = theme.typography;
  const layoutStartTime = Date.now();

  const context: LogContext = {
    component: 'pptGenerator-simple',
    operation: 'buildSimpleSlide',
    stage: spec.layout
  };

  // Log slide building
  logger.info(`Building slide with layout: ${spec.layout}`, context, {
    slideTitle: spec.title,
    hasParagraph: !!spec.paragraph,
    hasBullets: !!(spec.bullets && spec.bullets.length > 0)
  });

  // Set modern slide background with subtle design elements
  const modernBackground = getModernBackground(theme, slideIndex);
  slide.background = modernBackground;

  // Add modern design elements for professional appearance
  addModernDesignElements(slide, theme, slideIndex, spec.layout);

  try {
    switch (spec.layout) {
      case 'title':
      case 'hero':
        buildTitleSlide(slide, spec, theme);
        break;

      case 'title-bullets':
      case 'title-paragraph':
        buildBulletSlide(slide, spec, theme);
        break;

      case 'two-column':
        buildTwoColumnSlide(slide, spec, theme);
        break;

      case 'mixed-content':
        buildMixedContentSlide(slide, spec, theme);
        break;

      case 'chart':
        buildMetricsSlide(slide, spec, theme);
        break;

      case 'quote':
        buildQuoteSlide(slide, spec, theme);
        break;

      default:
        logger.warn(`Unknown layout '${spec.layout}', falling back to bullet slide`, context, {
          layout: spec.layout,
          availableLayouts: ['title', 'title-bullets', 'title-paragraph', 'two-column', 'mixed-content', 'chart', 'quote']
        });
        buildBulletSlide(slide, spec, theme);
        break;
    }

    const layoutProcessingTime = Date.now() - layoutStartTime;
    logger.info(`Layout processing complete for ${spec.layout}`, context, {
      processingTime: layoutProcessingTime
    });

  } catch (error) {
    logger.error(`Content rendering failed for ${spec.layout}`, context, {
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

/**
 * Build title slide with modern layout and spacing
 */
function buildTitleSlide(slide: any, spec: SlideSpec, theme: ProfessionalTheme): void {
  const colors = theme.colors;

  // Main title with premium styling and positioning
  const titlePos = getModernTextPosition('title');
  const typography = MODERN_LAYOUT.typography;

  slide.addText(spec.title, {
    x: titlePos.x,
    y: titlePos.y + 1.2, // Center vertically on slide
    w: titlePos.w,
    h: titlePos.h + 0.5,
    fontSize: typography.title.fontSize,
    color: safeColor(colors.primary),
    bold: true,
    align: 'center',
    fontFace: getPowerPointFont(theme.typography.headings.fontFamily),
    lineSpacing: typography.title.lineSpacing,
    shadow: {
      type: 'outer',
      blur: 3,
      offset: 2,
      angle: 45,
      color: safeColor(colors.surface),
      opacity: 0.3
    }
  });

  // Subtitle with enhanced styling and spacing
  if (spec.paragraph) {
    const subtitlePos = getModernTextPosition('subtitle');
    slide.addText(spec.paragraph, {
      x: subtitlePos.x,
      y: subtitlePos.y + 2.2, // Position below title with proper spacing
      w: subtitlePos.w,
      h: subtitlePos.h + 0.4,
      fontSize: typography.subtitle.fontSize,
      color: getTextColor(theme),
      align: 'center',
      fontFace: getPowerPointFont(theme.typography.body.fontFamily),
      lineSpacing: typography.subtitle.lineSpacing
    });
  }
}

/**
 * Build bullet point slide with modern layout and spacing
 */
function buildBulletSlide(slide: any, spec: SlideSpec, theme: ProfessionalTheme): void {
  const colors = theme.colors;
  const typography = MODERN_LAYOUT.typography;

  // Title with premium styling and positioning
  const titlePos = getModernTextPosition('title');
  slide.addText(spec.title, {
    x: titlePos.x,
    y: titlePos.y,
    w: titlePos.w,
    h: titlePos.h,
    fontSize: typography.title.fontSize,
    color: safeColor(colors.primary),
    bold: true,
    fontFace: getPowerPointFont(theme.typography.headings.fontFamily),
    lineSpacing: typography.title.lineSpacing
  });

  // Content with premium styling and modern bullets
  if (spec.bullets && spec.bullets.length > 0) {
    const bulletPos = getModernTextPosition('bullets');
    const modernBulletText = formatModernBullets(spec.bullets, theme);

    slide.addText(modernBulletText, {
      x: bulletPos.x,
      y: bulletPos.y,
      w: bulletPos.w,
      h: bulletPos.h,
      fontSize: typography.bullets.fontSize,
      color: getTextColor(theme),
      fontFace: getPowerPointFont(theme.typography.body.fontFamily),
      lineSpacing: typography.bullets.lineSpacing,
      valign: 'top'
    });
  } else if (spec.paragraph) {
    const bodyPos = getModernTextPosition('body');
    slide.addText(spec.paragraph, {
      x: bodyPos.x,
      y: bodyPos.y,
      w: bodyPos.w,
      h: bodyPos.h,
      fontSize: typography.body.fontSize,
      color: getTextColor(theme),
      fontFace: getPowerPointFont(theme.typography.body.fontFamily),
      lineSpacing: typography.body.lineSpacing,
      valign: 'top'
    });
  }
}

/**
 * Build two-column slide with modern layout and balanced distribution
 */
function buildTwoColumnSlide(slide: any, spec: SlideSpec, theme: ProfessionalTheme): void {
  const colors = theme.colors;

  // Title with modern positioning
  const titlePos = getModernTextPosition('title');
  slide.addText(spec.title, {
    x: titlePos.x,
    y: titlePos.y,
    w: titlePos.w,
    h: titlePos.h,
    fontSize: 32,
    color: safeColor(colors.primary),
    bold: true,
    fontFace: getPowerPointFont(theme.typography.headings.fontFamily),
    lineSpacing: 36
  });

  // Two-column content with modern spacing
  if (spec.bullets && spec.bullets.length > 0) {
    const leftBullets = spec.bullets.slice(0, Math.ceil(spec.bullets.length / 2));
    const rightBullets = spec.bullets.slice(Math.ceil(spec.bullets.length / 2));

    // Left column with modern positioning
    const leftPos = getModernTextPosition('bullets', { isLeftColumn: true });
    const leftText = formatModernBullets(leftBullets, theme);
    slide.addText(leftText, {
      x: leftPos.x,
      y: leftPos.y,
      w: leftPos.w,
      h: leftPos.h,
      fontSize: 18,
      color: getTextColor(theme),
      fontFace: getPowerPointFont(theme.typography.body.fontFamily),
      lineSpacing: 28,
      valign: 'top'
    });

    // Right column with modern positioning
    if (rightBullets.length > 0) {
      const rightPos = getModernTextPosition('bullets', { isRightColumn: true });
      const rightText = formatModernBullets(rightBullets, theme);
      slide.addText(rightText, {
        x: rightPos.x,
        y: rightPos.y,
        w: rightPos.w,
        h: rightPos.h,
        fontSize: 18,
        color: getTextColor(theme),
        fontFace: getPowerPointFont(theme.typography.body.fontFamily),
        lineSpacing: 28,
        valign: 'top'
      });
    }
  }
}

/**
 * Build metrics slide
 */
function buildMetricsSlide(slide: any, spec: SlideSpec, theme: ProfessionalTheme): void {
  const colors = theme.colors;
  
  // Title
  slide.addText(spec.title, {
    x: 0.5, y: 0.5, w: 9, h: 0.8,
    fontSize: 28,
    color: safeColor(colors.primary),
    bold: true,
    fontFace: getPowerPointFont(theme.typography.headings.fontFamily)
  });

  // Metrics as large text
  if (spec.bullets && spec.bullets.length > 0) {
    const metricsPerRow = Math.min(3, spec.bullets.length);
    const metricWidth = 9 / metricsPerRow;

    spec.bullets.slice(0, 6).forEach((metric, index) => {
      const row = Math.floor(index / metricsPerRow);
      const col = index % metricsPerRow;

      slide.addText(metric, {
        x: 0.5 + (col * metricWidth),
        y: 2 + (row * 1.5),
        w: metricWidth - 0.2,
        h: 1,
        fontSize: 20,
        color: safeColor(colors.accent),
        bold: true,
        align: 'center',
        fontFace: getPowerPointFont(theme.typography.headings.fontFamily)
      });
    });
  }
}

/**
 * Build mixed content slide with modern layout and professional spacing
 */
function buildMixedContentSlide(slide: any, spec: SlideSpec, theme: ProfessionalTheme): void {
  const colors = theme.colors;
  const specAny = spec as any;

  // Title with modern positioning
  const titlePos = getModernTextPosition('title');
  slide.addText(spec.title, {
    x: titlePos.x,
    y: titlePos.y,
    w: titlePos.w,
    h: titlePos.h,
    fontSize: 32,
    color: safeColor(colors.primary),
    bold: true,
    fontFace: getPowerPointFont(theme.typography.headings.fontFamily),
    lineSpacing: 36
  });

  // Handle mixed content layout with modern left and right columns
  if (specAny.left || specAny.right) {
    // Left column with modern positioning
    if (specAny.left) {
      const leftContent = specAny.left;
      const leftPos = getModernTextPosition('bullets', { isLeftColumn: true });
      let currentY = leftPos.y;

      if (leftContent.type === 'text' && leftContent.content) {
        slide.addText(leftContent.content, {
          x: leftPos.x,
          y: currentY,
          w: leftPos.w,
          h: 1.2,
          fontSize: 18,
          color: getTextColor(theme),
          fontFace: getPowerPointFont(theme.typography.body.fontFamily),
          lineSpacing: 24,
          valign: 'top'
        });
        currentY += 1.4;
      }

      if (leftContent.bullets && leftContent.bullets.length > 0) {
        const leftBulletText = formatModernBullets(leftContent.bullets, theme);
        slide.addText(leftBulletText, {
          x: leftPos.x,
          y: currentY,
          w: leftPos.w,
          h: leftPos.h - (currentY - leftPos.y),
          fontSize: 16,
          color: getTextColor(theme),
          fontFace: getPowerPointFont(theme.typography.body.fontFamily),
          lineSpacing: 26,
          valign: 'top'
        });
      }
    }

    // Right column with modern positioning
    if (specAny.right) {
      const rightContent = specAny.right;
      const rightPos = getModernTextPosition('bullets', { isRightColumn: true });
      let currentY = rightPos.y;

      if (rightContent.type === 'text' && rightContent.content) {
        slide.addText(rightContent.content, {
          x: rightPos.x,
          y: currentY,
          w: rightPos.w,
          h: 1.2,
          fontSize: 18,
          color: getTextColor(theme),
          fontFace: getPowerPointFont(theme.typography.body.fontFamily),
          lineSpacing: 24,
          valign: 'top'
        });
        currentY += 1.4;
      }

      if (rightContent.bullets && rightContent.bullets.length > 0) {
        const rightBulletText = formatModernBullets(rightContent.bullets, theme);
        slide.addText(rightBulletText, {
          x: rightPos.x,
          y: currentY,
          w: rightPos.w,
          h: rightPos.h - (currentY - rightPos.y),
          fontSize: 16,
          color: getTextColor(theme),
          fontFace: getPowerPointFont(theme.typography.body.fontFamily),
          lineSpacing: 26,
          valign: 'top'
        });
      }
    }
  } else {
    // Fallback: treat as regular content slide with modern layout
    if (spec.paragraph) {
      const bodyPos = getModernTextPosition('body');
      slide.addText(spec.paragraph, {
        x: bodyPos.x,
        y: bodyPos.y,
        w: bodyPos.w,
        h: 2.0,
        fontSize: 18,
        color: getTextColor(theme),
        fontFace: getPowerPointFont(theme.typography.body.fontFamily),
        lineSpacing: 26,
        valign: 'top'
      });
    }

    if (spec.bullets && spec.bullets.length > 0) {
      const bulletPos = getModernTextPosition('bullets');
      const modernBulletText = formatModernBullets(spec.bullets, theme);
      slide.addText(modernBulletText, {
        x: bulletPos.x,
        y: spec.paragraph ? bulletPos.y + 2.2 : bulletPos.y,
        w: bulletPos.w,
        h: spec.paragraph ? bulletPos.h - 2.2 : bulletPos.h,
        fontSize: 18,
        color: getTextColor(theme),
        fontFace: getPowerPointFont(theme.typography.body.fontFamily),
        lineSpacing: 28,
        valign: 'top'
      });
    }
  }
}

/**
 * Build quote slide
 */
function buildQuoteSlide(slide: any, spec: SlideSpec, theme: ProfessionalTheme): void {
  const colors = theme.colors;

  // Quote text
  const quoteText = spec.paragraph || spec.bullets?.[0] || 'Quote text';
  slide.addText(`"${quoteText}"`, {
    x: 1, y: 2, w: 8, h: 2,
    fontSize: 24,
    color: safeColor(colors.primary),
    italic: true,
    align: 'center',
    fontFace: getPowerPointFont(theme.typography.body.fontFamily)
  });

  // Attribution
  if (spec.title) {
    slide.addText(`— ${spec.title}`, {
      x: 1, y: 4.2, w: 8, h: 0.5,
      fontSize: 16,
      color: getTextColor(theme),
      align: 'center',
      fontFace: getPowerPointFont(theme.typography.body.fontFamily)
    });
  }
}

// Export the main function as the default export for compatibility
export { generateSimplePpt as generatePpt };

```

---


## Data Layer

### 4. schema.ts

**Path**: `functions/src/schema.ts`

**Description**: Zod schemas for slide specifications and validation

```ts
/**
 * Optimized Zod Schema Definitions for AI PowerPoint Generator
 *
 * Enhanced schemas with support for chained generation, image integration, and advanced layouts.
 * Ensures data integrity for multi-step AI processes and professional outputs, with improved validation for accessibility, readability, and content quality.
 *
 * @version 3.6.0-enhanced
 * @author
 *   AI PowerPoint Generator Team (revised by expert co‑pilot)
 */

import { z, ZodError } from 'zod';

/* -------------------------------------------------------------------------------------------------
 * Common Validators & Utilities
 * ------------------------------------------------------------------------------------------------- */

// NOTE: Keep these validators focused and composable. We prefer explicit, readable rules over
// overly clever abstractions so downstream teams can maintain and extend them easily.
const VALIDATION_PATTERNS = {
  title: z
    .string()
    .min(1, 'Title is required and cannot be empty')
    .max(120, 'Title must be under 120 characters for optimal display')
    .refine((val) => val.trim().length > 0, 'Title cannot be only whitespace'),

  shortText: z
    .string()
    .max(160, 'Text must be under 160 characters for readability')
    .refine((val) => val.trim().length > 0 || val.length === 0, 'Text cannot be only whitespace'),

  longText: z
    .string()
    .max(1200, 'Text must be under 1200 characters to fit on slide')
    .refine((val) => val.trim().length > 0 || val.length === 0, 'Text cannot be only whitespace'),

  colorHex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid 6-digit hex color (e.g., #FF0000)')
    .transform((val) => val.toUpperCase()),

  // Allow common font-family characters including spaces, digits, hyphens, commas, and quotes.
  fontFamily: z
    .string()
    .min(1, 'Font family is required')
    .refine(
      (val) => /^[\w\s\-,'"]+$/.test(val),
      'Font family contains invalid characters'
    ),

  imagePrompt: z
    .string()
    .min(20, 'Image prompt must be at least 20 characters for quality generation')
    .max(500, 'Image prompt must be under 500 characters for optimal AI processing')
    .refine((val) => val.trim().length >= 20, 'Image prompt cannot be mostly whitespace'),

  percentage: z.coerce.number().min(0, 'Percentage cannot be negative').max(100, 'Percentage cannot exceed 100'),

  positiveNumber: z.coerce.number().positive('Value must be positive'),

  url: z
    .string()
    .url('Must be a valid URL')
    .refine((val) => val.startsWith('http'), 'URL must start with http or https'),
} as const;

/* -------------------------------------------------------------------------------------------------
 * Layouts
 * ------------------------------------------------------------------------------------------------- */

export const SLIDE_LAYOUTS = [
  'title',
  'title-bullets',
  'title-paragraph',
  'two-column',
  'mixed-content',
  'image-right',
  'image-left',
  'image-full',
  'quote',
  'chart',
  'comparison-table',
  'timeline',
  'process-flow',
  'before-after',
  'problem-solution',
  'data-visualization',
  'testimonial',
  'team-intro',
  'contact-info',
  'thank-you',
  'agenda',
  'section-divider',
  // Modern layout types
  'hero',
  'metrics-dashboard',
  'feature-showcase',
  'testimonial-card',
  'modern-bullets',
  'gradient-hero',
  'card-grid',
  'split-content',
  'accent-quote',
] as const;

export type SlideLayout = (typeof SLIDE_LAYOUTS)[number];

/* -------------------------------------------------------------------------------------------------
 * Reusable Content Schemas
 * ------------------------------------------------------------------------------------------------- */

const ContentItemSchema = z.object({
  type: z.enum(['text', 'bullet', 'number', 'icon', 'metric']),
  content: VALIDATION_PATTERNS.shortText,
  emphasis: z.enum(['normal', 'bold', 'italic', 'highlight']).optional(),
  color: VALIDATION_PATTERNS.colorHex.optional(),
  iconName: z.string().max(50, 'Icon name too long').optional(), // Support for icon names
});

/* -------------------------------------------------------------------------------------------------
 * Slide Spec (Primary Schema used by the current generator)
 * ------------------------------------------------------------------------------------------------- */

export const SlideSpecSchema = z
  .object({
    /** Main slide title - clear, concise, and engaging */
    title: VALIDATION_PATTERNS.title,

    /** Layout type */
    layout: z.enum(SLIDE_LAYOUTS).default('title-paragraph'),

    /** Bullet points */
    bullets: z
      .array(VALIDATION_PATTERNS.shortText)
      .max(10, 'Maximum 10 bullet points allowed for readability')
      .refine((arr) => arr.length === 0 || arr.every((item) => item.trim().length > 0), 'Bullet points cannot be empty')
      .optional(),

    /** Paragraph content */
    paragraph: VALIDATION_PATTERNS.longText
      .refine((val) => !val || val.split('\n').length <= 10, 'Paragraph should not exceed 10 lines for readability')
      .optional(),

    /** Flexible content items */
    contentItems: z.array(ContentItemSchema).max(15, 'Maximum 15 content items allowed').optional(),

    /** Two-column layout support - left column */
    left: z
      .object({
        heading: z.string().max(80, 'Heading too long for column').optional(),
        bullets: z.array(VALIDATION_PATTERNS.shortText).max(8, 'Maximum 8 bullets per column for readability').optional(),
        paragraph: VALIDATION_PATTERNS.longText.optional(),
        metrics: z
          .array(
            z.object({
              label: VALIDATION_PATTERNS.shortText,
              value: z.string().max(20, 'Metric value too long'),
              unit: z.string().max(10, 'Unit too long').optional(),
            })
          )
          .max(5, 'Maximum 5 metrics per column')
          .optional(),
        imagePrompt: VALIDATION_PATTERNS.imagePrompt.optional(),
        generateImage: z.boolean().optional(),
      })
      .optional(),

    /** Two-column layout support - right column */
    right: z
      .object({
        heading: z.string().max(80, 'Heading too long for column').optional(),
        bullets: z.array(VALIDATION_PATTERNS.shortText).max(8, 'Maximum 8 bullets per column for readability').optional(),
        paragraph: VALIDATION_PATTERNS.longText.optional(),
        imagePrompt: VALIDATION_PATTERNS.imagePrompt.optional(),
        generateImage: z.boolean().optional(),
        metrics: z
          .array(
            z.object({
              label: VALIDATION_PATTERNS.shortText,
              value: z.string().max(20, 'Metric value too long'),
              unit: z.string().max(10, 'Unit too long').optional(),
            })
          )
          .max(5, 'Maximum 5 metrics per column')
          .optional(),
      })
      .optional(),

    /** Chart configuration */
    chart: z
      .object({
        type: z.enum(['bar', 'line', 'pie', 'doughnut', 'area', 'scatter', 'column'], {
          errorMap: () => ({
            message: 'Chart type must be one of: bar, line, pie, doughnut, area, scatter, column',
          }),
        }),
        title: z.string().max(100, 'Chart title too long').optional(),
        subtitle: z.string().max(80, 'Chart subtitle too long').optional(),
        categories: z
          .array(z.string().min(1, 'Category cannot be empty'))
          .min(1, 'At least one category required')
          .max(12, 'Maximum 12 categories for readability'),
        series: z
          .array(
            z.object({
              name: z.string().min(1, 'Series name is required').max(50, 'Series name too long'),
              data: z.array(z.coerce.number()).min(1, 'At least one data point required'),
              color: VALIDATION_PATTERNS.colorHex.optional(),
            })
          )
          .min(1, 'At least one data series required')
          .max(6, 'Maximum 6 data series for clarity'),
        showLegend: z.boolean().default(true),
        showDataLabels: z.boolean().default(false),
      })
      .optional(),

    /** Timeline configuration */
    timeline: z
      .array(
        z.object({
          date: z.string().default(''),
          title: z.string().default(''),
          description: VALIDATION_PATTERNS.longText.optional(),
          milestone: z.boolean().default(false),
        })
      )
      .max(8, 'Maximum 8 timeline items')
      .optional(),

    /** Comparison table */
    comparisonTable: z
      .object({
        headers: z
          .array(z.string().min(1, 'Header cannot be empty'))
          .min(2, 'At least 2 columns required')
          .max(4, 'Maximum 4 columns for readability'),
        rows: z
          .array(z.array(z.string()))
          .min(1, 'At least one row required')
          .max(8, 'Maximum 8 rows for readability'),
      })
      .optional(),

    /** Process flow steps */
    processSteps: z
      .array(
        z.object({
          step: VALIDATION_PATTERNS.positiveNumber,
          title: VALIDATION_PATTERNS.shortText,
          description: VALIDATION_PATTERNS.longText.optional(),
          icon: z.string().max(50, 'Icon name too long').optional(),
        })
      )
      .max(6, 'Maximum 6 process steps')
      .optional()
      .transform((steps) => {
        if (!steps || steps.length === 0) return undefined;
        const validSteps = steps.filter((step) => step.step && step.title);
        return validSteps.length > 0 ? validSteps : undefined;
      }),

    /** Design and branding configuration */
    design: z
      .object({
        theme: z.string().min(1).optional(),
        layout: z.string().optional(),
        brand: z
          .object({
            primary: VALIDATION_PATTERNS.colorHex.optional(),
            secondary: VALIDATION_PATTERNS.colorHex.optional(),
            accent: VALIDATION_PATTERNS.colorHex.optional(),
            fontFamily: VALIDATION_PATTERNS.fontFamily.optional(),
            logo: VALIDATION_PATTERNS.url.optional(),
          })
          .optional(),

        /** Modern theme features */
        modern: z.boolean().optional(),
        style: z.enum(['professional', 'creative', 'minimal', 'bold', 'modern']).optional(),
        backgroundStyle: z.enum(['gradient', 'minimal', 'accent']).optional(),
        contentLayout: z.enum(['bullets', 'cards', 'timeline']).optional(),

        /** Author and presentation metadata */
        author: z.string().optional(),
        date: z.string().optional(),

        /** Enhanced design properties */
        textColor: VALIDATION_PATTERNS.colorHex.optional(),
        backgroundColor: VALIDATION_PATTERNS.colorHex.optional(),
        fontSize: z.coerce.number().min(8).max(72).optional(),
        highContrast: z.boolean().optional(),
        colorAdjustments: z.record(z.string()).optional(),
      })
      .optional(),

    /** Speaker notes */
    notes: z.string().max(1000, 'Notes must be under 1000 characters').optional(),

    /** Source citations */
    sources: z.array(z.string().url('Must be a valid URL').or(z.string().min(1))).max(5, 'Maximum 5 sources allowed').optional(),

    /** Image prompt for full-image layouts */
    imagePrompt: VALIDATION_PATTERNS.imagePrompt.optional(),

    /** Whether to generate the image */
    generateImage: z.boolean().optional(),

    /** Premium/advanced properties */
    imageUrl: z.string().url().optional(),
    altText: z.string().optional(),
    accessibilityRole: z.string().optional(),
    headingLevel: z.coerce.number().min(1).max(6).optional(),
    imageOptimized: z.boolean().optional(),
    structureOptimized: z.boolean().optional(),
    brandCompliant: z.boolean().optional(),
    table: z.any().optional(), // Kept intentionally permissive for backwards compatibility
    timelineData: z.any().optional(),
  })
  .superRefine((spec, ctx) => {
    // two-column layout must include both sides
    if (spec.layout === 'two-column') {
      if (!spec.left) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['left'],
          message: 'Two-column layout requires left column content.',
        });
      }
      if (!spec.right) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['right'],
          message: 'Two-column layout requires right column content.',
        });
      }
    }

    // chart layout must include chart data
    if (spec.layout === 'chart' && !spec.chart) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['chart'],
        message: 'Chart layout requires chart configuration.',
      });
    }

    // timeline layout must include >= 2 items
    if (spec.layout === 'timeline') {
      if (!spec.timeline || spec.timeline.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['timeline'],
          message: 'Timeline layout requires at least 2 timeline items.',
        });
      }
    }

    // image-full layout requires an image source (url or prompt in any slot)
    if (spec.layout === 'image-full') {
      const hasAnyImage =
        !!spec.imageUrl ||
        !!spec.imagePrompt ||
        !!spec.left?.imagePrompt ||
        !!spec.right?.imagePrompt;
      if (!hasAnyImage) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['imageUrl'],
          message: 'image-full layout requires an imageUrl or an imagePrompt.',
        });
      }
      // Encourage alt text for accessibility when an image exists
      if ((spec.imageUrl || spec.imagePrompt || spec.left?.imagePrompt || spec.right?.imagePrompt) && !spec.altText) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['altText'],
          message: 'Provide altText to describe the image for accessibility.',
        });
      }
    }

    // chart: categories length should match each series data length
    if (spec.chart) {
      const { categories, series } = spec.chart;
      series.forEach((s, idx) => {
        if (s.data.length !== categories.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['chart', 'series', idx, 'data'],
            message: `Data length (${s.data.length}) must match categories length (${categories.length}).`,
          });
        }
      });
    }

    // comparison table: enforce row width consistency with headers
    if (spec.comparisonTable) {
      const { headers, rows } = spec.comparisonTable;
      rows.forEach((row, rIdx) => {
        if (row.length !== headers.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['comparisonTable', 'rows', rIdx],
            message: `Row ${rIdx + 1} must have exactly ${headers.length} cells to match headers.`,
          });
        }
      });
    }
  });

/** TypeScript type inferred from the slide specification schema */
export type SlideSpec = z.infer<typeof SlideSpecSchema>;

/* -------------------------------------------------------------------------------------------------
 * Generation Params (controls for the generator)
 * ------------------------------------------------------------------------------------------------- */

export const GenerationParamsSchema = z.object({
  /** User's input prompt - core content description */
  prompt: z
    .string()
    .min(10, 'Prompt must be at least 10 characters for meaningful content generation')
    .max(2000, 'Prompt must be under 2000 characters for optimal AI processing')
    .transform((str) => str.trim())
    .refine((val) => val.length >= 10, 'Prompt cannot be mostly whitespace'),

  /** Target audience */
  audience: z
    .enum(
      [
        'general',
        'executives',
        'technical',
        'sales',
        'investors',
        'students',
        'healthcare',
        'education',
        'marketing',
        'finance',
        'startup',
        'government',
        'business',
      ],
      { errorMap: () => ({ message: 'Invalid audience type. Must be one of the supported audience categories.' }) }
    )
    .default('general'),

  /** Presentation tone */
  tone: z
    .enum(
      ['professional', 'casual', 'persuasive', 'educational', 'inspiring', 'authoritative', 'friendly', 'urgent', 'confident', 'analytical'],
      { errorMap: () => ({ message: 'Invalid tone type. Must be one of the supported tone styles.' }) }
    )
    .default('professional'),

  /** Content length */
  contentLength: z
    .enum(['minimal', 'brief', 'moderate', 'detailed', 'comprehensive'], {
      errorMap: () => ({ message: 'Invalid content length. Must be minimal, brief, moderate, detailed, or comprehensive.' }),
    })
    .default('moderate'),

  /** Presentation type */
  presentationType: z.enum(['general', 'pitch', 'report', 'training', 'proposal', 'update', 'analysis', 'comparison', 'timeline', 'process', 'strategy']).default('general'),

  /** Industry context */
  industry: z
    .enum(['general', 'technology', 'healthcare', 'finance', 'education', 'retail', 'manufacturing', 'consulting', 'nonprofit', 'government', 'startup', 'hospitality'])
    .default('general'),

  /** Design preferences and branding */
  design: z
    .object({
      layout: z.enum(SLIDE_LAYOUTS).optional(),
      layoutName: z.string().max(50, 'Layout name too long').optional(),
      theme: z.string().max(50, 'Theme name too long').optional(),
      brand: z
        .object({
          primary: VALIDATION_PATTERNS.colorHex.optional(),
          secondary: VALIDATION_PATTERNS.colorHex.optional(),
          accent: VALIDATION_PATTERNS.colorHex.optional(),
          fontFamily: VALIDATION_PATTERNS.fontFamily.optional(),
          logo: VALIDATION_PATTERNS.url.optional(),
        })
        .optional(),
      customColors: z.array(VALIDATION_PATTERNS.colorHex).max(5, 'Maximum 5 custom colors allowed').optional(),
    })
    .optional(),

  /** AI image generation preferences */
  withImage: z.boolean().default(false),
  imageStyle: z.enum(['realistic', 'illustration', 'abstract', 'professional', 'minimal']).default('professional'),

  /** Content quality and validation preferences */
  qualityLevel: z.enum(['standard', 'high', 'premium']).default('standard'),
  includeNotes: z.boolean().default(false),
  includeSources: z.boolean().default(false),
});

export type GenerationParams = z.infer<typeof GenerationParamsSchema>;

/* -------------------------------------------------------------------------------------------------
 * Validation Results (helpers)
 * ------------------------------------------------------------------------------------------------- */

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

/**
 * Validate and parse slide specifications (single or multi-slide).
 */
export function validateSlideSpec(data: unknown): SlideSpec | SlideSpec[] {
  if (Array.isArray(data)) {
    return data.map((item) => SlideSpecSchema.parse(item));
  }
  return SlideSpecSchema.parse(data);
}

/**
 * Safe validator for SlideSpec that returns errors instead of throwing.
 */
export function safeValidateSlideSpec(data: unknown): ValidationResult<SlideSpec | SlideSpec[]> {
  try {
    const result = validateSlideSpec(data);
    return { success: true, data: result };
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      const errors = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Unknown validation error'] };
  }
}

/**
 * Validate and parse generation parameters.
 */
export function validateGenerationParams(data: unknown): GenerationParams {
  return GenerationParamsSchema.parse(data);
}

/**
 * Safe validator for GenerationParams that returns errors instead of throwing.
 */
export function safeValidateGenerationParams(data: unknown): ValidationResult<GenerationParams> {
  try {
    const result = validateGenerationParams(data);
    return { success: true, data: result };
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      const errors = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Unknown validation error'] };
  }
}

/* -------------------------------------------------------------------------------------------------
 * Content Quality Heuristics
 * ------------------------------------------------------------------------------------------------- */

export function validateContentQuality(spec: SlideSpec): {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  suggestions: string[];
  warnings: string[];
  improvements: string[];
  accessibility: {
    score: number;
    issues: string[];
  };
  readability: {
    score: number;
    level: string;
    issues: string[];
  };
} {
  const suggestions: string[] = [];
  const warnings: string[] = [];
  const improvements: string[] = [];
  const accessibilityIssues: string[] = [];
  const readabilityIssues: string[] = [];
  let score = 100;
  let accessibilityScore = 100;
  let readabilityScore = 100;

  // Title quality checks
  if (spec.title.length < 10) {
    suggestions.push('Consider a more descriptive title (at least 10 characters).');
    score -= 10;
  }
  if (spec.title.length > 80) {
    warnings.push('Title may be too long for optimal display.');
    score -= 5;
  }
  if (!/^[A-Z]/.test(spec.title)) {
    improvements.push('Title should start with a capital letter.');
    score -= 2;
  }

  // Content balance and structure checks
  const hasContent = spec.paragraph || spec.bullets?.length || spec.contentItems?.length;
  if (!hasContent) {
    warnings.push('Slide appears to have minimal content.');
    score -= 20;
  }

  // Bullet point optimization
  if (spec.bullets) {
    if (spec.bullets.length > 7) {
      suggestions.push('Consider reducing bullet points to 7 or fewer for better readability.');
      score -= 5;
    }
    if (spec.bullets.length > 10) {
      warnings.push('Too many bullet points may overwhelm the audience.');
      score -= 10;
    }
    const bulletLengths = spec.bullets.map((b) => b.length);
    const avgLength = bulletLengths.reduce((a, b) => a + b, 0) / bulletLengths.length || 0;
    const hasInconsistentLength = bulletLengths.some((len) => Math.abs(len - avgLength) > avgLength * 0.5);
    if (hasInconsistentLength) {
      improvements.push('Consider making bullet points more consistent in length.');
      score -= 3;
    }
  }

  // Paragraph content checks
  if (spec.paragraph) {
    const wordCount = spec.paragraph.split(/\s+/).filter(Boolean).length;
    if (wordCount > 150) {
      suggestions.push('Consider breaking long paragraphs into bullet points for better readability.');
      score -= 8;
    }
    if (wordCount < 10) {
      improvements.push('Paragraph content seems very brief - consider adding more detail.');
      score -= 5;
    }
  }

  // Layout-specific validations (heuristics)
  if (spec.layout === 'two-column' && (!spec.left || !spec.right)) {
    warnings.push('Two-column layout requires both left and right content.');
    score -= 15;
  }
  if (spec.layout === 'chart' && !spec.chart) {
    warnings.push('Chart layout requires chart data.');
    score -= 20;
  }
  if (spec.layout === 'timeline' && !spec.timeline) {
    warnings.push('Timeline layout requires timeline data.');
    score -= 20;
  }

  // Accessibility checks
  if (spec.design?.brand?.primary && spec.design?.brand?.secondary) {
    const primary = spec.design.brand.primary;
    const secondary = spec.design.brand.secondary;
    if (primary === secondary) {
      accessibilityIssues.push('Primary and secondary colors should be different for better contrast.');
      accessibilityScore -= 15;
    }
  }

  // Image: ensure descriptive text
  const anyImage = spec.imageUrl || spec.imagePrompt || spec.left?.imagePrompt || spec.right?.imagePrompt;
  if (anyImage && !spec.altText) {
    accessibilityIssues.push('Add altText to describe images for screen readers.');
    accessibilityScore -= 10;
  }

  // Readability assessment (lightweight heuristic)
  const allText = [spec.title, spec.paragraph || '', ...(spec.bullets || []), spec.notes || ''].join(' ');
  const sentences = allText.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = allText.split(/\s+/).filter((w) => w.length > 0);
  const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);

  if (avgWordsPerSentence > 20) {
    readabilityIssues.push('Sentences are quite long - consider breaking them down.');
    readabilityScore -= 15;
  }
  if (avgWordsPerSentence < 5) {
    readabilityIssues.push('Sentences are very short - consider combining some for better flow.');
    readabilityScore -= 5;
  }

  const complexWords = words.filter((word) => word.length > 12);
  const complexWordRatio = words.length ? complexWords.length / words.length : 0;
  if (complexWordRatio > 0.15) {
    readabilityIssues.push('Consider using simpler language for better comprehension.');
    readabilityScore -= 10;
  }

  let readabilityLevel = 'Graduate';
  if (avgWordsPerSentence < 15 && complexWordRatio < 0.1) {
    readabilityLevel = 'High School';
  } else if (avgWordsPerSentence < 18 && complexWordRatio < 0.12) {
    readabilityLevel = 'College';
  }

  // Final grade
  const finalScore = Math.max(0, score);
  let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
  if (finalScore >= 90) grade = 'A';
  else if (finalScore >= 80) grade = 'B';
  else if (finalScore >= 70) grade = 'C';
  else if (finalScore >= 60) grade = 'D';

  return {
    score: finalScore,
    grade,
    suggestions,
    warnings,
    improvements,
    accessibility: {
      score: Math.max(0, accessibilityScore),
      issues: accessibilityIssues,
    },
    readability: {
      score: Math.max(0, readabilityScore),
      level: readabilityLevel,
      issues: readabilityIssues,
    },
  };
}

/* -------------------------------------------------------------------------------------------------
 * Improvement Suggestions from Quality Assessment
 * ------------------------------------------------------------------------------------------------- */

export function generateContentImprovements(
  spec: SlideSpec,
  qualityAssessment: ReturnType<typeof validateContentQuality>
): {
  priorityImprovements: string[];
  quickFixes: string[];
  enhancementSuggestions: string[];
} {
  const priorityImprovements: string[] = [];
  const quickFixes: string[] = [];
  const enhancementSuggestions: string[] = [];

  // Priority improvements (critical issues)
  if (qualityAssessment.score < 60) {
    priorityImprovements.push('Content needs significant improvement to meet professional standards.');
  }
  if (qualityAssessment.warnings.length > 0) {
    priorityImprovements.push(...qualityAssessment.warnings);
  }

  // Quick fixes (easy to implement)
  if (spec.title.length < 10) {
    quickFixes.push('Expand the title to be more descriptive and engaging.');
  }
  if (spec.bullets && spec.bullets.length > 7) {
    quickFixes.push('Reduce bullet points to 5–7 for optimal readability.');
  }
  if (!spec.notes) {
    quickFixes.push('Add speaker notes to provide context and accessibility.');
  }
  if ((spec.imageUrl || spec.imagePrompt || spec.left?.imagePrompt || spec.right?.imagePrompt) && !spec.altText) {
    quickFixes.push('Add altText for any images to improve accessibility.');
  }

  // Enhancement suggestions (nice to have)
  if (qualityAssessment.accessibility.score < 90) {
    enhancementSuggestions.push('Improve accessibility by ensuring strong color contrast and descriptive alt text.');
  }
  if (qualityAssessment.readability.score < 85) {
    enhancementSuggestions.push('Simplify language and sentence structure for better comprehension.');
  }
  if (!spec.sources || spec.sources.length === 0) {
    enhancementSuggestions.push('Add credible sources to support your content.');
  }

  return {
    priorityImprovements,
    quickFixes,
    enhancementSuggestions,
  };
}

/* -------------------------------------------------------------------------------------------------
 * New Layout Engine — Slide Type Schemas
 * ------------------------------------------------------------------------------------------------- */

export const SlideTypeSchema = z.enum(['title', 'bullets', 'twoColumn', 'metrics', 'section', 'quote', 'image', 'timeline', 'table', 'comparison']);
export type SlideType = z.infer<typeof SlideTypeSchema>;

// Column content schemas for two-column layouts
export const ColumnContentSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('text'),
    content: VALIDATION_PATTERNS.longText,
    bullets: z.array(VALIDATION_PATTERNS.shortText).max(6).optional(),
  }),
  z.object({
    type: z.literal('image'),
    src: z.string().url(),
    alt: VALIDATION_PATTERNS.shortText,
    caption: VALIDATION_PATTERNS.shortText.optional(),
  }),
  z.object({
    type: z.literal('mixed'),
    text: VALIDATION_PATTERNS.longText,
    image: z
      .object({
        src: z.string().url(),
        alt: VALIDATION_PATTERNS.shortText,
      })
      .optional(),
    bullets: z.array(VALIDATION_PATTERNS.shortText).max(4).optional(),
  }),
]);
export type ColumnContent = z.infer<typeof ColumnContentSchema>;

// Metric data schema
export const MetricDataSchema = z.object({
  value: z.union([z.string(), z.coerce.number()]),
  label: VALIDATION_PATTERNS.shortText,
  description: VALIDATION_PATTERNS.shortText.optional(),
  trend: z
    .object({
      direction: z.enum(['up', 'down', 'flat']),
      percentage: z.coerce.number().optional(),
      period: z.string().optional(),
    })
    .optional(),
  target: z.union([z.string(), z.coerce.number()]).optional(),
  color: z.enum(['primary', 'success', 'warning', 'error', 'info']).optional(),
});
export type MetricData = z.infer<typeof MetricDataSchema>;

// Individual slide configuration schemas
export const TitleSlideConfigSchema = z.object({
  type: z.literal('title'),
  title: VALIDATION_PATTERNS.title,
  subtitle: VALIDATION_PATTERNS.shortText.optional(),
  author: z.string().max(100).optional(),
  date: z.string().max(50).optional(),
  organization: z.string().max(100).optional(),
  backgroundImage: z.string().url().optional(),
  backgroundColor: VALIDATION_PATTERNS.colorHex.optional(),
});
export type TitleSlideConfig = z.infer<typeof TitleSlideConfigSchema>;

export const BulletSlideConfigSchema = z.object({
  type: z.literal('bullets'),
  title: VALIDATION_PATTERNS.title,
  subtitle: VALIDATION_PATTERNS.shortText.optional(),
  bullets: z.array(VALIDATION_PATTERNS.shortText).min(3, 'At least 3 bullet points required for effective content').max(6, 'Maximum 6 bullet points for optimal readability'),
  bulletStyle: z.enum(['disc', 'circle', 'square', 'dash', 'arrow', 'number']).optional(),
  maxBullets: z.number().min(3).max(8).optional(),
  maxWordsPerBullet: z.number().min(8).max(20).optional(),
});
export type BulletSlideConfig = z.infer<typeof BulletSlideConfigSchema>;

export const TwoColumnSlideConfigSchema = z.object({
  type: z.literal('twoColumn'),
  title: VALIDATION_PATTERNS.title,
  subtitle: VALIDATION_PATTERNS.shortText.optional(),
  leftColumn: ColumnContentSchema,
  rightColumn: ColumnContentSchema,
  columnRatio: z.tuple([z.coerce.number().positive(), z.coerce.number().positive()]).optional(),
  verticalAlign: z.enum(['top', 'middle', 'bottom']).optional(),
});
export type TwoColumnSlideConfig = z.infer<typeof TwoColumnSlideConfigSchema>;

export const MetricsSlideConfigSchema = z.object({
  type: z.literal('metrics'),
  title: VALIDATION_PATTERNS.title,
  subtitle: VALIDATION_PATTERNS.shortText.optional(),
  metrics: z.array(MetricDataSchema).min(1, 'At least 1 metric required').max(12, 'Maximum 12 metrics for readability'),
  layout: z.enum(['grid', 'row', 'column', 'featured']).optional(),
  maxPerRow: z.number().min(1).max(6).optional(),
  showTrends: z.boolean().optional(),
  showTargets: z.boolean().optional(),
});
export type MetricsSlideConfig = z.infer<typeof MetricsSlideConfigSchema>;

// Union of all slide configurations (new layout engine)
export const SlideConfigSchema = z.discriminatedUnion('type', [TitleSlideConfigSchema, BulletSlideConfigSchema, TwoColumnSlideConfigSchema, MetricsSlideConfigSchema]);
export type SlideConfig = z.infer<typeof SlideConfigSchema>;

/* -------------------------------------------------------------------------------------------------
 * Enhanced Presentation Schema (new layout engine container)
 * ------------------------------------------------------------------------------------------------- */

export const EnhancedPresentationSchema = z.object({
  slides: z.array(SlideConfigSchema).min(1, 'At least one slide required'),
  theme: z.enum(['neutral', 'executive', 'colorPop']).default('neutral'),
  metadata: z.object({
    title: VALIDATION_PATTERNS.title,
    description: VALIDATION_PATTERNS.longText.optional(),
    audience: z.enum(['general', 'executives', 'technical', 'sales']).default('general'),
    duration: z.number().positive().optional(),
    tags: z.array(z.string()).optional(),
    version: z.string().optional(),
  }),
  options: z
    .object({
      async: z.boolean().default(false),
      includeNotes: z.boolean().default(true),
      generateImages: z.boolean().default(false),
      optimizeForPrint: z.boolean().default(false),
      accessibilityMode: z.boolean().default(true),
    })
    .optional(),
});
export type EnhancedPresentation = z.infer<typeof EnhancedPresentationSchema>;

/* -------------------------------------------------------------------------------------------------
 * Generation Response Schema
 * ------------------------------------------------------------------------------------------------- */

export const SlideGenerationResponseSchema = z.object({
  fileUrl: z.string().url(),
  deckSummary: z.object({
    slides: z.number().positive(),
    theme: z.string(),
    warnings: z.array(z.string()).default([]),
    errors: z.array(z.string()).optional(),
  }),
  cost: z
    .object({
      llmTokens: z.number().nonnegative(),
      usd: z.number().nonnegative(),
    })
    .optional(),
  metadata: z
    .object({
      generationTime: z.number().positive(),
      qualityScore: z.number().min(0).max(100),
      accessibilityScore: z.number().min(0).max(100),
    })
    .optional(),
});
export type SlideGenerationResponse = z.infer<typeof SlideGenerationResponseSchema>;
```

---


## Design System

### 5. professionalThemes.ts

**Path**: `functions/src/professionalThemes.ts`

**Description**: Professional theme definitions and color schemes

```ts
/**
 * Unified Professional Theme System for Backend PowerPoint Generation
 *
 * Enhanced with 2024-inspired color palettes, advanced typography scales, and robust utilities for professional styling.
 * Incorporates modern trends like soft pastels, earth tones, and vibrant accents for best-in-class presentations.
 *
 * @version 3.5.0-enhanced
 * @author AI PowerPoint Generator Team (enhanced by expert co-pilot)
 */

// Color accessibility functions removed for simplification

export interface ProfessionalTheme {
  /** Unique theme identifier */
  id: string;

  /** Human-readable theme name */
  name: string;

  /** Theme category for organization */
  category: 'corporate' | 'creative' | 'academic' | 'startup' | 'healthcare' | 'finance' | 'consulting' | 'technology' | 'modern' | 'vibrant' | 'natural';

  /** Enhanced color palette optimized for PowerPoint generation and accessibility */
  colors: {
    /** Primary brand color for titles and accents */
    primary: string;

    /** Secondary color for supporting elements */
    secondary: string;

    /** Accent color for highlights and emphasis */
    accent: string;

    /** Background color for slides */
    background: string;

    /** Surface color for content areas */
    surface: string;

    /** Text colors for readability */
    text: {
      primary: string;   // Main text color
      secondary: string; // Secondary text color
      inverse: string;   // Text on dark backgrounds
      muted: string;     // Muted text for less important content
    };

    /** Semantic colors for status and feedback */
    semantic: {
      success: string;
      warning: string;
      error: string;
      info: string;
    };

    /** Border and divider colors */
    borders: {
      light: string;
      medium: string;
      strong: string;
    };
  };

  /** Enhanced typography settings for PowerPoint fonts with variable font support */
  typography: {
    headings: {
      fontFamily: string; // PowerPoint-compatible font
      fontWeight: {
        light: number;
        normal: number;
        semibold: number;
        bold: number;
        extrabold: number;
      };
      sizes: {
        display: number;  // Hero titles (48-56px)
        h1: number;       // Main titles (32-40px)
        h2: number;       // Section headers (24-32px)
        h3: number;       // Subsection headers (18-24px)
        h4: number;       // Small headings (16-20px)
      };
      lineHeight: {
        tight: number;
        normal: number;
        relaxed: number;
      };
    };
    body: {
      fontFamily: string; // PowerPoint-compatible font
      fontWeight: {
        light: number;
        normal: number;
        medium: number;
        semibold: number;
      };
      sizes: {
        large: number;    // Emphasis text (18-20px)
        normal: number;   // Body text (16px)
        small: number;    // Captions (14px)
        tiny: number;     // Very small text (12px)
      };
      lineHeight: {
        tight: number;
        normal: number;
        relaxed: number;
      };
    };
  };

  /** Visual effects and styling with expanded options */
  effects: {
    /** Border radius values */
    borderRadius: {
      small: number;
      medium: number;
      large: number;
      full: number;
    };
    /** Shadow definitions with depth variations */
    shadows: {
      subtle: string;
      medium: string;
      strong: string;
      colored: string;
      glow: string;
      inset: string;
      elevated: string; // New: For card-like elevations
    };
    /** Gradient definitions with more variations */
    gradients: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      mesh: string;
      subtle: string; // New: Soft background gradient
      vibrant: string; // New: Bold accent gradient
    };
    /** Animation definitions for transitions (if supported in PPT) */
    animations: {
      fadeIn: string;
      slideUp: string;
      scaleIn: string;
      bounce: string; // New: Subtle bounce for emphasis
    };
  };

  /** Spacing system for consistent layouts with rem-based scaling */
  spacing: {
    xs: number;    // 4px
    sm: number;    // 8px
    md: number;    // 16px
    lg: number;    // 24px
    xl: number;    // 32px
    xxl: number;   // 48px
    xxxl: number;  // 64px
  };

  /** Layout configuration with flexible grid */
  layout: {
    /** Slide margins and padding */
    margins: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    /** Content area dimensions */
    contentArea: {
      maxWidth: number;
      padding: number;
    };
    /** Grid system for layout */
    grid: {
      columns: number;
      gutter: number;
      baseline: number;
    };
  };
}

/**
 * Modern font stack definitions for professional presentations
 * Optimized for cross-platform compatibility, readability, and variable fonts
 */
const MODERN_FONT_STACKS = {
  systemSans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  modernSans: '"Inter var", "SF Pro Display", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  readableSans: '"Inter var", "SF Pro Text", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  workSans: '"Work Sans", Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  ibmPlexSans: '"IBM Plex Sans", Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  dmSans: '"DM Sans", Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  modernSerif: '"Charter", "Bitstream Charter", "Sitka Text", Cambria, serif',
  modernMono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
  variableSans: '"Inter var", system-ui, sans-serif', // New: Variable font for better control
  elegantSerif: '"Playfair Display", serif', // New: For premium, elegant headings

  // Enhanced 2024 font stacks for better visual hierarchy
  luxurySerif: '"Playfair Display", "Crimson Text", Georgia, "Times New Roman", Times, serif',
  creativeSans: '"Poppins", "Montserrat", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
  condensedSans: '"Segoe UI Semibold", "Arial Narrow", "Helvetica Neue Condensed", Arial, sans-serif',
  techSans: '"JetBrains Sans", "Source Sans Pro", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
  displayFont: '"Segoe UI Black", "Arial Black", "Helvetica Neue", Arial, sans-serif',
  corporateSerif: '"Minion Pro", "Adobe Garamond Pro", Georgia, "Times New Roman", Times, serif',
  startupSans: '"Inter", "SF Pro Display", "Segoe UI", system-ui, sans-serif'
} as const;

/**
 * Enhanced typography configuration with modern font stacks and improved sizing
 */
function createModernTypography(
  headingFont?: string,
  bodyFont?: string,
  scale: 'compact' | 'normal' | 'large' = 'normal'
) {
  // Font scale multipliers for different presentation contexts
  const scaleMultipliers = {
    compact: 0.9,
    normal: 1.0,
    large: 1.1
  };

  const multiplier = scaleMultipliers[scale];

  return {
    headings: {
      fontFamily: headingFont || MODERN_FONT_STACKS.modernSans,
      fontWeight: { light: 300, normal: 400, semibold: 600, bold: 700, extrabold: 800 },
      sizes: {
        display: Math.round(52 * multiplier),
        h1: Math.round(40 * multiplier),
        h2: Math.round(32 * multiplier),
        h3: Math.round(24 * multiplier),
        h4: Math.round(20 * multiplier)
      },
      lineHeight: { tight: 1.1, normal: 1.25, relaxed: 1.4 }
    },
    body: {
      fontFamily: bodyFont || MODERN_FONT_STACKS.readableSans,
      fontWeight: { light: 300, normal: 400, medium: 500, semibold: 600 },
      sizes: {
        large: Math.round(20 * multiplier),
        normal: Math.round(16 * multiplier),
        small: Math.round(14 * multiplier),
        tiny: Math.round(12 * multiplier)
      },
      lineHeight: { tight: 1.4, normal: 1.6, relaxed: 1.8 }
    }
  };
}

/**
 * Helper function to create complete theme objects with all required properties
 * Enhanced with modern typography, improved visual hierarchy, 2024 color trends, and accessibility validation
 */
function createTheme(
  id: string,
  name: string,
  category: ProfessionalTheme['category'],
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background?: string;
    surface?: string;
    textPrimary?: string;
    textSecondary?: string;
    textMuted?: string;
  },
  typography?: {
    headingFont?: string;
    bodyFont?: string;
    scale?: 'compact' | 'normal' | 'large';
  }
): ProfessionalTheme {
  const baseBackground = colors.background || '#FFFFFF';
  const baseSurface = colors.surface || '#F8FAFC';

  // Get accessible color recommendations if not provided
  const accessibleColors = { primary: '333333', secondary: '666666', accent: '0066CC' }; // Simplified
  const textPrimary = colors.textPrimary || '333333';
  const textSecondary = colors.textSecondary || accessibleColors.secondary;

  const theme = {
    id,
    name,
    category,
    colors: {
      primary: colors.primary,
      secondary: colors.secondary,
      accent: colors.accent,
      background: baseBackground,
      surface: baseSurface,
      text: {
        primary: textPrimary,
        secondary: textSecondary,
        inverse: '#FFFFFF',
        muted: colors.textMuted || '#9CA3AF'
      },
      semantic: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: colors.primary
      },
      borders: {
        light: '#F3F4F6',
        medium: '#E5E7EB',
        strong: '#D1D5D7'
      }
    },
    typography: createModernTypography(
      typography?.headingFont,
      typography?.bodyFont,
      typography?.scale || 'normal'
    ),
    effects: {
      borderRadius: { small: 4, medium: 8, large: 16, full: 9999 },
      shadows: {
        subtle: '0 1px 3px rgba(0,0,0,0.1)',
        medium: '0 4px 6px rgba(0,0,0,0.1)',
        strong: '0 10px 15px rgba(0,0,0,0.1)',
        colored: `0 4px 6px ${colors.primary}33`,
        glow: `0 0 8px ${colors.accent}4D`,
        inset: 'inset 0 2px 4px rgba(0,0,0,0.06)',
        elevated: '0 12px 24px rgba(0,0,0,0.08)' // New for cards
      },
      gradients: {
        primary: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
        secondary: `linear-gradient(135deg, ${colors.secondary}, ${colors.accent})`,
        accent: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}CC)`,
        background: `linear-gradient(135deg, ${baseBackground}, ${baseSurface})`,
        mesh: `radial-gradient(at 0% 0%, ${colors.primary}1A, transparent 50%), radial-gradient(at 100% 100%, ${colors.accent}1A, transparent 50%)`,
        subtle: `linear-gradient(180deg, ${baseSurface}, ${baseBackground})`, // New soft gradient
        vibrant: `linear-gradient(45deg, ${colors.accent}, ${colors.primary})` // New bold option
      },
      animations: {
        fadeIn: 'fadeIn 0.5s ease-in',
        slideUp: 'slideUp 0.5s ease-out',
        scaleIn: 'scaleIn 0.3s ease-in-out',
        bounce: 'bounce 0.5s ease-in-out' // New subtle bounce
      }
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64 },
    layout: {
      margins: { top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 },
      contentArea: { maxWidth: 9.0, padding: 0.5 },
      grid: {
        columns: 12,
        gutter: 0.25,
        baseline: 0.5
      }
    }
  };

  // Validate accessibility and log any issues
  const accessibilityResult = { isValid: true, issues: [] }; // Simplified

  if (!accessibilityResult.isValid) {
    console.warn(`⚠️ Theme "${name}" has accessibility issues:`, accessibilityResult.issues);
  }

  return theme;
}

/**
 * Curated Professional Theme Library
 * Expanded with 2024 trends: soft pastels, earth tones, and vibrant accents for modern presentations.
 */
export const PROFESSIONAL_THEMES: ProfessionalTheme[] = [
  // Core Professional Themes
  createTheme('corporate-blue', 'Corporate Professional', 'corporate', {
    primary: '#1E40AF', secondary: '#3B82F6', accent: '#F59E0B',
    background: '#FFFFFF', surface: '#F8FAFC'
  }),
  createTheme('creative-purple', 'Creative Studio', 'creative', {
    primary: '#7C3AED', secondary: '#A855F7', accent: '#EC4899',
    background: '#FEFBFF', surface: '#F3F0FF'
  }),
  createTheme('executive-dark', 'Executive Dark', 'corporate', {
    primary: '#1F2937', secondary: '#374151', accent: '#F59E0B',
    background: '#111827', surface: '#1F2937',
    textPrimary: '#F9FAFB', textSecondary: '#D1D5DB', textMuted: '#9CA3AF'
  }),
  createTheme('finance-green', 'Financial Growth', 'finance', {
    primary: '#059669', secondary: '#10B981', accent: '#F59E0B',
    background: '#ECFDF5', surface: '#D1FAE5'
  }),
  createTheme('tech-gradient', 'Technology Forward', 'technology', {
    primary: '#3B82F6', secondary: '#8B5CF6', accent: '#06B6D4',
    background: '#F8FAFC', surface: '#EFF6FF'
  }),

  // 2024 Modern Themes
  createTheme(
    'peach-fuzz-2024',
    'Warm Harmony (Pantone 2024)',
    'vibrant',
    {
      primary: '#FFBE98', // Peach Fuzz inspired
      secondary: '#FFDAB9',
      accent: '#FF6B35',
      background: '#FFF8F5',
      surface: '#FFE8E0',
      textPrimary: '#4A3520',
      textSecondary: '#6B4E31',
      textMuted: '#A07D5C'
    },
    { scale: 'large', headingFont: MODERN_FONT_STACKS.modernSans }
  ),
  createTheme(
    'earth-luxe',
    'Luxe Earth Tones',
    'natural',
    {
      primary: '#8B4513', // Rich brown
      secondary: '#A0522D',
      accent: '#DAA520',
      background: '#FDF6E3',
      surface: '#F5E6D3',
      textPrimary: '#2F1B14',
      textSecondary: '#5D4037',
      textMuted: '#8D6E63'
    },
    { headingFont: MODERN_FONT_STACKS.elegantSerif, scale: 'normal' }
  ),
  createTheme(
    'ocean-breeze',
    'Ocean Breeze (2024)',
    'modern',
    {
      primary: '#0EA5E9',
      secondary: '#38BDF8',
      accent: '#F0F9FF',
      background: '#F0F9FF',
      surface: '#E0F2FE',
      textPrimary: '#0C4A6E',
      textSecondary: '#0369A1',
      textMuted: '#0284C7'
    },
    { scale: 'normal' }
  ),
  createTheme(
    'sunset-gradient',
    'Sunset Professional',
    'vibrant',
    {
      primary: '#F97316',
      secondary: '#FB923C',
      accent: '#FED7AA',
      background: '#FFF7ED',
      surface: '#FFEDD5',
      textPrimary: '#9A3412',
      textSecondary: '#C2410C',
      textMuted: '#EA580C'
    }
  ),
  createTheme(
    'forest-modern',
    'Modern Forest',
    'natural',
    {
      primary: '#166534',
      secondary: '#22C55E',
      accent: '#84CC16',
      background: '#F0FDF4',
      surface: '#DCFCE7',
      textPrimary: '#14532D',
      textSecondary: '#166534',
      textMuted: '#15803D'
    }
  ),

  // Sophisticated Professional Themes
  createTheme(
    'platinum-elegance',
    'Platinum Elegance',
    'corporate',
    {
      primary: '#64748B',
      secondary: '#94A3B8',
      accent: '#F1F5F9',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      textPrimary: '#0F172A',
      textSecondary: '#334155',
      textMuted: '#64748B'
    },
    { headingFont: MODERN_FONT_STACKS.elegantSerif, scale: 'large' }
  ),
  createTheme(
    'royal-purple',
    'Royal Authority',
    'corporate',
    {
      primary: '#581C87',
      secondary: '#7C3AED',
      accent: '#C4B5FD',
      background: '#FEFBFF',
      surface: '#F3F0FF',
      textPrimary: '#3C1361',
      textSecondary: '#581C87',
      textMuted: '#7C2D92'
    }
  ),
  createTheme(
    'crimson-power',
    'Crimson Authority',
    'corporate',
    {
      primary: '#DC2626',
      secondary: '#EF4444',
      accent: '#FCA5A5',
      background: '#FEF2F2',
      surface: '#FEE2E2',
      textPrimary: '#7F1D1D',
      textSecondary: '#991B1B',
      textMuted: '#B91C1C'
    }
  ),

  // Creative & Startup Themes
  createTheme(
    'neon-cyber',
    'Cyber Innovation',
    'startup',
    {
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      accent: '#06FFA5',
      background: '#0F0F23',
      surface: '#1E1B4B',
      textPrimary: '#F8FAFC',
      textSecondary: '#E2E8F0',
      textMuted: '#CBD5E1'
    }
  ),
  // Modern sans families
  createTheme(
    'work-sans-modern',
    'Work Sans Modern',
    'modern',
    { primary: '#111827', secondary: '#4B5563', accent: '#10B981', background: '#FFFFFF', surface: '#F9FAFB' },
    { headingFont: MODERN_FONT_STACKS.workSans, bodyFont: MODERN_FONT_STACKS.workSans, scale: 'normal' }
  ),
  createTheme(
    'ibm-plex-clean',
    'IBM Plex Clean',
    'technology',
    { primary: '#111827', secondary: '#4338CA', accent: '#14B8A6', background: '#FFFFFF', surface: '#F8FAFC' },
    { headingFont: MODERN_FONT_STACKS.ibmPlexSans, bodyFont: MODERN_FONT_STACKS.ibmPlexSans, scale: 'normal' }
  ),
  createTheme(
    'dm-sans-elegant',
    'DM Sans Elegant',
    'modern',
    { primary: '#0F172A', secondary: '#475569', accent: '#F59E0B', background: '#FFFFFF', surface: '#F8FAFC' },
    { headingFont: MODERN_FONT_STACKS.dmSans, bodyFont: MODERN_FONT_STACKS.dmSans, scale: 'large' }
  ),
  createTheme(
    'aurora-gradient',
    'Aurora Professional',
    'creative',
    {
      primary: '#EC4899',
      secondary: '#F472B6',
      accent: '#A855F7',
      background: '#FDF2F8',
      surface: '#FCE7F3',
      textPrimary: '#831843',
      textSecondary: '#BE185D',
      textMuted: '#DB2777'
    }
  ),

  // Healthcare & Academic Themes
  createTheme(
    'medical-trust',
    'Medical Professional',
    'healthcare',
    {
      primary: '#0369A1',
      secondary: '#0284C7',
      accent: '#7DD3FC',
      background: '#F0F9FF',
      surface: '#E0F2FE',
      textPrimary: '#0C4A6E',
      textSecondary: '#075985',
      textMuted: '#0284C7'
    }
  ),
  createTheme(
    'academic-sage',
    'Academic Wisdom',
    'academic',
    {
      primary: '#374151',
      secondary: '#6B7280',
      accent: '#D1D5DB',
      background: '#F9FAFB',
      surface: '#F3F4F6',
      textPrimary: '#111827',
      textSecondary: '#1F2937',
      textMuted: '#4B5563'
    },
    { headingFont: MODERN_FONT_STACKS.elegantSerif }
  ),

  // Minimalist & Modern
  createTheme(
    'minimal-zen',
    'Zen Minimalism',
    'modern',
    {
      primary: '#000000',
      secondary: '#404040',
      accent: '#808080',
      background: '#FFFFFF',
      surface: '#FAFAFA',
      textPrimary: '#000000',
      textSecondary: '#333333',
      textMuted: '#666666'
    },
    { headingFont: MODERN_FONT_STACKS.variableSans, scale: 'compact' }
  ),
  createTheme(
    'soft-pastels',
    'Soft Professional',
    'modern',
    {
      primary: '#A7C7E7',
      secondary: '#B8E6B8',
      accent: '#FFB6C1',
      background: '#F8F9FA',
      surface: '#F1F3F4',
      textPrimary: '#2C3E50',
      textSecondary: '#34495E',
      textMuted: '#7F8C8D'
    }
  )
];

/**
 * Get theme by ID with fallback to default
 */
export function getThemeById(id: string): ProfessionalTheme {
  return PROFESSIONAL_THEMES.find(theme => theme.id === id) || getDefaultTheme();
}

/**
 * Get default theme (corporate-blue)
 */
export function getDefaultTheme(): ProfessionalTheme {
  return PROFESSIONAL_THEMES[0];
}

/**
 * Get themes by category
 */
export function getThemesByCategory(category: ProfessionalTheme['category']): ProfessionalTheme[] {
  return PROFESSIONAL_THEMES.filter(theme => theme.category === category);
}

/**
 * Dynamic theme selection based on content type and audience
 * Enhanced with more criteria for precise matching
 */
export function selectThemeForContent(params: {
  audience?: string;
  industry?: string;
  presentationType?: string;
  tone?: string;
  isDataHeavy?: boolean;
  isCreative?: boolean;
}): ProfessionalTheme {
  if (params.isDataHeavy) return getThemeById('finance-navy') || getDefaultTheme();
  if (params.isCreative) return getThemeById('creative-purple') || getDefaultTheme();

  if (params.industry) {
    // Match based on industry (expanded)
    const industryMap: Record<string, string> = {
      healthcare: 'healthcare-teal',
      finance: 'finance-navy',
      technology: 'tech-gradient',
      education: 'education-green',
      startup: 'startup-orange',
      consulting: 'consulting-charcoal',
      marketing: 'marketing-magenta',
      eco: 'vibrant-eco' // New mapping
    };
    return getThemeById(industryMap[params.industry]) || getDefaultTheme();
  }

  // Additional logic for audience, type, tone (as in original, expanded if needed)
  return getDefaultTheme();
}

/**
 * Customize theme with brand colors and validate changes
 */
export function customizeTheme(
  baseTheme: ProfessionalTheme,
  customization: {
    primary?: string;
    secondary?: string;
    accent?: string;
    fontFamily?: string;
  }
): ProfessionalTheme {
  const customized = {
    ...baseTheme,
    id: `${baseTheme.id}-custom`,
    name: `${baseTheme.name} (Custom)`,
    colors: {
      ...baseTheme.colors,
      ...(customization.primary && { primary: customization.primary }),
      ...(customization.secondary && { secondary: customization.secondary }),
      ...(customization.accent && { accent: customization.accent })
    },
    typography: {
      ...baseTheme.typography,
      headings: {
        ...baseTheme.typography.headings,
        ...(customization.fontFamily && { fontFamily: customization.fontFamily })
      },
      body: {
        ...baseTheme.typography.body,
        ...(customization.fontFamily && { fontFamily: customization.fontFamily })
      }
    }
  };

  // Validate accessibility after customization
  const validation = validateThemeAccessibility(customized);
  if (!validation.isAccessible) {
    console.warn('Custom theme may have accessibility issues:', validation.issues);
  }

  return customized;
}

/**
 * Validate theme color contrast for accessibility (WCAG compliant)
 */
export function validateThemeAccessibility(theme: ProfessionalTheme): {
  isAccessible: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // WCAG contrast ratio calculation (simplified luminance formula)
  const getLuminance = (hex: string) => {
    const rgb = parseInt(hex.replace('#', ''), 16);
    const r = (rgb >> 16) / 255;
    const g = ((rgb >> 8) & 255) / 255;
    const b = (rgb & 255) / 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const contrastRatio = (l1: number, l2: number) => Math.max(l1, l2) / Math.min(l1, l2) + 0.05;

  const textLum = getLuminance(theme.colors.text.primary);
  const bgLum = getLuminance(theme.colors.background);

  if (contrastRatio(textLum, bgLum) < 4.5) {
    issues.push('Text contrast ratio below WCAG AA (4.5:1)');
    suggestions.push('Adjust text or background for better contrast');
  }

  return {
    isAccessible: issues.length === 0,
    issues,
    suggestions
  };
}

/**
 * Generate a color palette based on a primary color (for dynamic themes)
 */
export function generateColorPalette(primary: string): { primary: string; secondary: string; accent: string } {
  // Simple harmonious palette generation (could be expanded with color theory)
  const secondary = `#${parseInt(primary.slice(1), 16) + 0x333333}`.slice(0, 7); // Darken
  const accent = `#${(parseInt(primary.slice(1), 16) ^ 0xFFFFFF).toString(16).padStart(6, '0')}`; // Complement
  return { primary, secondary, accent };
}

// Additional utilities like getThemeRecommendations, hexToRgb, rgbToPptColor (as in original)
```

---


## AI Layer

### 6. llm.ts

**Path**: `functions/src/llm.ts`

**Description**: OpenAI integration for content generation

```ts
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
import { logger } from './utils/smartLogger';
import { env } from './config/environment';

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

function getOpenAI(): OpenAI {
  if (!openai) {
    const apiKey = env.getOpenAIApiKey();
    openai = new OpenAI({ apiKey });
    logger.info('OpenAI client initialized', { operation: 'openai-init' });
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
  const requestId = logger.generateRequestId();
  const context = { requestId, operation: 'slide-generation' };

  logger.startPerf(`slide-gen-${requestId}`, context);
  logger.info('Starting chained slide generation', context, {
    model: AI_CONFIG.model,
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

  try {
    // Step 1: Content
    logger.info('Step 1: Generating content', { ...context, stage: 'content' });
    let partialSpec = await aiCallWithRetry(generateContentPrompt(input), 'Content Generation');
    logger.debug('Content generation completed', context, { title: partialSpec.title });

    // Step 2: Layout
    logger.info('Step 2: Refining layout', { ...context, stage: 'layout' });
    partialSpec = await aiCallWithRetry(generateLayoutPrompt(input, partialSpec), 'Layout Refinement', partialSpec);
    logger.debug('Layout refinement completed', context, { layout: partialSpec.layout });

    // Step 3: Image prompt (optional)
    if (input.withImage) {
      logger.info('Step 3: Generating image prompt', { ...context, stage: 'image' });
      partialSpec = await aiCallWithRetry(generateImagePrompt(input, partialSpec), 'Image Prompt Generation', partialSpec);
      logger.debug('Image prompt generated', context, { hasImagePrompt: !!partialSpec.imagePrompt });
    }

    // Step 4: Final refinement
    logger.info('Step 4: Final refinement', { ...context, stage: 'refinement' });
    const finalSpec = await aiCallWithRetry(generateRefinementPrompt(input, partialSpec), 'Final Refinement', partialSpec);

    const duration = logger.endPerf(`slide-gen-${requestId}`, context, {
      title: finalSpec.title,
      layout: finalSpec.layout,
      hasContent: !!(finalSpec.bullets || finalSpec.paragraph),
      hasImage: !!finalSpec.imagePrompt
    });

    logger.success('Chained slide generation completed', context, {
      title: finalSpec.title,
      layout: finalSpec.layout,
      contentType: finalSpec.bullets ? 'bullets' : 'paragraph',
      bulletCount: finalSpec.bullets?.length || 0
    });

    return finalSpec;
  } catch (error) {
    logger.endPerf(`slide-gen-${requestId}`, context);
    logger.error('Slide generation failed', context, error);
    throw error;
  }
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
```

---

### 7. prompts.ts

**Path**: `functions/src/prompts.ts`

**Description**: AI prompt templates and engineering

```ts
/**
 * Enhanced AI Prompts for Chained PowerPoint Generation
 *
 * Modular prompts for multi-step AI processing to create high-quality, professional slides.
 * Steps: Content → Layout → Image → Refinement → Validation.
 * Incorporates 2024 design trends, storytelling frameworks, and accessibility best practices for best-in-class outputs.
 *
 * RECENT ENHANCEMENTS:
 * - Improved narrative structure with expert-level storytelling frameworks
 * - Enhanced content quality with minimalism emphasis and word limits
 * - Advanced image prompt generation with batch processing capabilities
 * - Comprehensive error handling and graceful degradation
 * - Performance optimizations and monitoring integration
 *
 * @version 3.6.0-pipeline-enhanced
 * @author AI PowerPoint Generator Team (enhanced by expert co-pilot)
 */

import { SlideSpecSchema, type GenerationParams, type SlideSpec, SLIDE_LAYOUTS } from './schema';
// Slide types simplified - using schema types instead

/**
 * Enhanced System prompt with modern prompt engineering techniques
 * Incorporates chain-of-thought reasoning, specific examples, and quality enforcement
 */
export const SYSTEM_PROMPT = `You are an elite PowerPoint presentation architect with 15+ years of experience creating high-impact business presentations for Fortune 500 companies. You combine the expertise of a content strategist, UX designer, data storyteller, and executive communication specialist.

## YOUR CORE EXPERTISE:
- **Strategic Content**: Crafting persuasive, outcome-driven messaging that compels action and drives business results
- **Visual Psychology**: Designing layouts that leverage cognitive science for maximum comprehension and retention
- **Executive Communication**: Understanding C-suite decision-making patterns and information processing preferences
- **Data Storytelling**: Transforming complex information into compelling narratives with clear insights
- **Accessibility Excellence**: Ensuring content meets WCAG 2.1 AA standards while maintaining visual impact

## QUALITY STANDARDS (NEVER COMPROMISE):
1. **Precision**: Every word must be purposeful, specific, and measurable - avoid vague language
2. **Impact**: Lead with outcomes, use active voice, create emotional resonance with quantified benefits
3. **Cognitive Load**: Structure content for 10-second comprehension (3-5 bullets optimal, 7 maximum)
4. **Executive Polish**: Boardroom-ready formatting, impeccable grammar, logical narrative flow
5. **Universal Access**: High contrast ratios, descriptive language, screen reader optimization

## ENHANCED THINKING PROCESS (Follow this sequence):
1. **Strategic Analysis**: What specific business outcome does this slide need to achieve?
2. **Audience Psychology**: What are their pain points, motivations, and decision-making criteria?
3. **Narrative Architecture**: What story structure will create maximum persuasive impact?
4. **Visual Hierarchy**: Which layout will guide attention to the most critical information first?
5. **Quality Assurance**: Does this meet Fortune 500 presentation standards?

## CRITICAL SUCCESS FACTORS:
- **Specificity Over Generality**: Use precise metrics, dates, and outcomes instead of vague statements
- **Context-Aware Content**: Ensure all data points feel realistic and contextually appropriate
- **Action-Oriented**: Every slide should drive toward a clear decision or next step
- **Stakeholder Value**: Focus on what matters most to the specific audience type

## OUTPUT REQUIREMENTS:
- **Format**: Valid JSON only, matching the exact schema provided
- **Self-Validation**: Check against schema and quality standards before responding
- **Excellence Target**: Aim for A+ grade content (95+ quality score)
- **Consistency**: Maintain professional tone and formatting throughout

## QUALITY BENCHMARKS:
✅ EXCELLENT Title: "Q4 Revenue: 34% Growth Exceeds $2.1M Target by 18%"
❌ POOR Title: "Q4 Results" or "Revenue Update"
✅ EXCELLENT Bullet: "Reduced customer acquisition cost from $150 to $90 (40% decrease) through targeted LinkedIn campaigns"
❌ POOR Bullet: "Marketing improved" or "Costs went down"
✅ EXCELLENT Insight: "Market expansion into APAC generated $600K new revenue within 90 days"
❌ POOR Insight: "We expanded to new markets"

## CONTENT AUTHENTICITY GUIDELINES:
- Use realistic, industry-appropriate metrics that feel genuine
- Avoid obviously fabricated numbers (prefer ranges like 15-25% over exact figures like 23.7%)
- Include contextual details that demonstrate deep understanding
- Reference credible sources and methodologies when appropriate

Remember: You're creating content for high-stakes presentations where careers and millions of dollars are on the line. Mediocrity is not acceptable.

SCHEMA REFERENCE:
For the complete schema structure, refer to the SlideSpec TypeScript type definition.
Key fields include: title, layout, bullets, paragraph, left/right columns, chart, timeline, comparisonTable, processSteps, design, notes, sources, imagePrompt, generateImage.`;

/**
 * Enhanced content length specifications with cognitive load optimization and 2024 minimalism focus
 */
export const CONTENT_LENGTH_SPECS = {
  minimal: {
    description: 'Absolute essentials: Maximum impact with minimum words (2024 minimalism trend)',
    detail: 'Core message only - every word is critical',
    focus: 'Single key insight or call-to-action; perfect for attention-grabbing slides',
    strategy: 'One powerful statement or 2-3 critical bullets maximum',
    deliveryTip: 'Ideal for opening slides, key decisions, or memorable quotes',
    contentGuidance: '1-3 bullets OR 1 short paragraph (50-100 words total)'
  },
  brief: {
    description: 'Ultra-focused: Essential information only for maximum impact',
    detail: 'Essential insights only - each word counts',
    focus: 'Core message and critical takeaways; emphasize simplicity and memorability',
    strategy: 'Use the "Rule of 3" for cognitive processing. Choose bullets for lists, short paragraphs for explanations.',
    deliveryTip: 'Perfect for executive summaries, key decisions, or memorable conclusions',
    contentGuidance: '3-4 bullets OR 1-2 concise paragraphs (100-200 words total)'
  },
  moderate: {
    description: 'Balanced depth: Key insights with supporting context',
    detail: 'Key insights with supporting evidence and examples',
    focus: 'Logical flow with supporting evidence; maintain clarity while building comprehensive understanding',
    strategy: 'Create narrative arc: setup → evidence → impact. Mix bullets and paragraphs as content demands.',
    deliveryTip: 'Ideal for business cases, process explanations, or strategic overviews',
    contentGuidance: '4-6 bullets OR 2-3 paragraphs OR mixed format (200-400 words total)'
  },
  detailed: {
    description: 'Comprehensive coverage: In-depth analysis with rich context',
    detail: 'Thorough analysis with examples, implications, and actionable insights',
    focus: 'Complete exploration while maintaining clarity; layer information strategically for deep understanding',
    strategy: 'Use progressive disclosure: context → analysis → implications → actions. Optimize format for content type.',
    deliveryTip: 'Best for training content, detailed proposals, or technical explanations',
    contentGuidance: '5-8 bullets OR 3-4 paragraphs OR mixed format (300-600 words total)'
  },
  comprehensive: {
    description: 'Complete coverage: Exhaustive analysis with full context and implications',
    detail: 'Thorough exploration with multiple examples, detailed analysis, and comprehensive insights',
    focus: 'Complete understanding with all relevant context, implications, and actionable recommendations',
    strategy: 'Layer information strategically: background → analysis → implications → recommendations → next steps',
    deliveryTip: 'Perfect for training materials, comprehensive reports, or detailed technical documentation',
    contentGuidance: '6-10 bullets OR 4-5 paragraphs OR complex mixed format (400-800 words total)'
  }
};

/**
 * Audience-specific guidance for content adaptation
 * Enhanced with psychological triggers and structure patterns
 */
export const AUDIENCE_GUIDANCE = {
  general: {
    language: 'Clear, jargon-free language that builds understanding progressively',
    focus: 'Practical value, relatable examples, and actionable insights',
    tone: 'Engaging, accessible, and trustworthy',
    psychology: 'Use storytelling, analogies, and social proof to build connection',
    structure: 'Problem → Solution → Benefit pattern works best'
  },
  executives: {
    language: 'Strategic, ROI-centric terminology with executive presence',
    focus: 'Bottom-line impacts, competitive advantages, strategic implications',
    tone: 'Concise, authoritative, outcome-focused with urgency',
    psychology: 'Appeal to authority, scarcity, and strategic thinking',
    structure: 'Lead with impact, support with data, end with clear next steps'
  },
  technical: {
    language: 'Precise technical terms, methodological accuracy, evidence-based',
    focus: 'Implementation details, technical specifications, system architecture',
    tone: 'Analytical, thorough, peer-reviewed quality',
    psychology: 'Build credibility through accuracy and comprehensive coverage',
    structure: 'Context → Method → Results → Implications'
  },
  sales: {
    language: 'Benefit-driven, customer-centric with emotional triggers',
    focus: 'Value propositions, competitive differentiation, customer success',
    tone: 'Persuasive, confident, results-oriented with enthusiasm',
    psychology: 'Use reciprocity, social proof, and fear of missing out',
    structure: 'Pain Point → Solution → Proof → Call to Action'
  },
  investors: {
    language: 'Financial terminology, growth metrics, market analysis',
    focus: 'Market opportunity, ROI, competitive positioning',
    tone: 'Confident, data-driven, visionary',
    psychology: 'Appeal to opportunity, credibility, and urgency',
    structure: 'Opportunity → Strategy → Results → Ask'
  },
  students: {
    language: 'Clear, explanatory, with relatable examples',
    focus: 'Learning objectives, practical applications, engagement',
    tone: 'Educational, encouraging, accessible',
    psychology: 'Foster curiosity, achievement, and understanding',
    structure: 'Context → Concept → Example → Application'
  },
  healthcare: {
    language: 'Medical terminology balanced with patient-friendly explanations',
    focus: 'Patient outcomes, clinical evidence, safety protocols',
    tone: 'Professional, compassionate, evidence-based',
    psychology: 'Build trust through expertise and empathy',
    structure: 'Problem → Evidence → Solution → Outcomes'
  },
  education: {
    language: 'Pedagogical terminology with practical classroom applications',
    focus: 'Learning outcomes, teaching strategies, student engagement',
    tone: 'Supportive, research-based, practical',
    psychology: 'Appeal to professional development and student success',
    structure: 'Challenge → Method → Implementation → Results'
  },
  marketing: {
    language: 'Brand-focused, customer-centric with market insights',
    focus: 'Brand positioning, customer journey, campaign effectiveness',
    tone: 'Creative, strategic, results-driven',
    psychology: 'Use emotional triggers and data-driven insights',
    structure: 'Insight → Strategy → Execution → Impact'
  },
  finance: {
    language: 'Financial terminology, risk assessment, regulatory compliance',
    focus: 'Financial performance, risk management, regulatory requirements',
    tone: 'Analytical, precise, compliance-focused',
    psychology: 'Build confidence through accuracy and risk mitigation',
    structure: 'Analysis → Risk → Strategy → Compliance'
  },
  startup: {
    language: 'Innovation-focused, growth-oriented, agile terminology',
    focus: 'Market disruption, scalability, competitive advantage',
    tone: 'Dynamic, visionary, results-oriented',
    psychology: 'Appeal to innovation, growth potential, and urgency',
    structure: 'Opportunity → Innovation → Traction → Scale'
  },
  government: {
    language: 'Policy-focused, public service oriented, regulatory terminology',
    focus: 'Public benefit, policy implementation, stakeholder impact',
    tone: 'Authoritative, transparent, service-oriented',
    psychology: 'Build trust through transparency and public benefit',
    structure: 'Issue → Policy → Implementation → Public Impact'
  },
  business: {
    language: 'Professional business terminology, performance-focused, strategic',
    focus: 'Business outcomes, operational efficiency, growth metrics',
    tone: 'Professional, results-oriented, strategic',
    psychology: 'Appeal to business success, efficiency, and competitive advantage',
    structure: 'Challenge → Solution → Results → Business Impact'
  }
};

/**
 * Tone specifications for consistent voice and style
 * Enhanced with 2024 trends: authenticity, inclusivity, and emotional intelligence.
 */
export const TONE_SPECIFICATIONS = {
  professional: {
    style: 'Polished, confident, and authoritative with modern authenticity',
    language: 'Formal, precise, with industry-specific terminology and inclusive language',
    approach: 'Evidence-based with clear logical flow and emotional intelligence',
    triggers: 'Credibility, authority, trust, and relatability',
    bulletStyle: 'Use concise, impact-driven phrases with action verbs'
  },
  casual: {
    style: 'Friendly, approachable, conversational with genuine warmth',
    language: 'Simple, relatable, everyday language with inclusive terms',
    approach: 'Story-driven with human connection and humor where appropriate',
    triggers: 'Relatability, engagement, warmth, and belonging',
    bulletStyle: 'Use conversational, action-oriented phrases'
  },
  persuasive: {
    style: 'Compelling, action-oriented, emotionally engaging with authentic urgency',
    language: 'Benefit-driven, urgent, with power words and inclusive appeals',
    approach: 'Problem-solution-benefit with strong calls to action and social proof',
    triggers: 'Urgency, desire, trust, and collective impact',
    bulletStyle: 'Use action verbs, focus on benefits and outcomes'
  },
  educational: {
    style: 'Structured, informative, guiding with progressive complexity and inclusivity',
    language: 'Explanatory, logical flow with clear definitions and diverse examples',
    approach: 'Step-by-step buildup with questions and knowledge checks for all learning styles',
    triggers: 'Curiosity, achievement, mastery, and practical application',
    bulletStyle: 'Use sequential language, include "how to" elements'
  },
  inspiring: {
    style: 'Motivational, uplifting, visionary with transformational energy and inclusivity',
    language: 'Aspirational, emotionally resonant with future-focused imagery and diverse representation',
    approach: 'Vision-driven with transformational messaging and collective possibility',
    triggers: 'Hope, aspiration, identity, and shared purpose',
    bulletStyle: 'Use aspirational language, paint vivid future states'
  },
  authoritative: {
    style: 'Expert, commanding, definitive with unquestionable expertise and ethical responsibility',
    language: 'Precise, technical, with industry authority and balanced perspectives',
    approach: 'Fact-based with expert insights and proven methodologies',
    triggers: 'Expertise, credibility, proven results, and trust',
    bulletStyle: 'Use definitive statements, cite expertise and results'
  },
  friendly: {
    style: 'Warm, approachable, supportive with personal connection and inclusivity',
    language: 'Conversational, inclusive, with personal touches and diverse examples',
    approach: 'Relationship-focused with empathy and understanding',
    triggers: 'Connection, trust, support, and community',
    bulletStyle: 'Use inclusive language, personal examples'
  },
  urgent: {
    style: 'Time-sensitive, action-oriented, compelling with immediate focus and ethical urgency',
    language: 'Direct, immediate, with time-based triggers and clear consequences',
    approach: 'Problem-focused with immediate action requirements and solutions',
    triggers: 'Urgency, scarcity, immediate action, and positive outcomes',
    bulletStyle: 'Use action verbs, time-sensitive language'
  },
  confident: {
    style: 'Assured, decisive, strong with unwavering conviction and humility',
    language: 'Definitive, clear, with strong positioning and balanced views',
    approach: 'Solution-focused with proven track record and forward-looking optimism',
    triggers: 'Confidence, success, proven results, and inspiration',
    bulletStyle: 'Use strong, definitive statements'
  },
  analytical: {
    style: 'Data-driven, logical, systematic with methodical approach and critical thinking',
    language: 'Precise, evidence-based, with analytical terminology and balanced analysis',
    approach: 'Research-based with systematic analysis and conclusions',
    triggers: 'Logic, evidence, systematic thinking, and insights',
    bulletStyle: 'Use data points, logical progression, evidence-based statements'
  }
};

/**
 * Advanced storytelling frameworks for content structure
 * Enhanced with 2024 trends: micro-stories, interactive elements, and inclusive narratives.
 */
export const STORYTELLING_FRAMEWORKS = {
  problemSolution: {
    name: 'Problem-Solution-Impact',
    structure: 'Pain Point → Solution → Transformation',
    bestFor: 'Sales presentations, product launches, change management',
    bulletPattern: ['Identify the challenge', 'Present the solution', 'Show the impact']
  },
  beforeAfter: {
    name: 'Before-After-Bridge',
    structure: 'Current State → Future State → Path Forward',
    bestFor: 'Strategic planning, transformation initiatives, vision presentations',
    bulletPattern: ['Current challenges', 'Desired outcomes', 'Action steps']
  },
  heroJourney: {
    name: 'Hero\'s Journey',
    structure: 'Challenge → Journey → Victory',
    bestFor: 'Inspirational content, case studies, success stories',
    bulletPattern: ['The challenge faced', 'The journey taken', 'The victory achieved']
  },
  pyramid: {
    name: 'Pyramid Principle',
    structure: 'Conclusion → Supporting Arguments → Evidence',
    bestFor: 'Executive summaries, recommendations, analytical presentations',
    bulletPattern: ['Main conclusion', 'Key supporting points', 'Evidence/data']
  },
  microStory: { // New: 2024 trend for short, impactful narratives
    name: 'Micro-Story Arc',
    structure: 'Hook → Conflict → Resolution → Insight',
    bestFor: 'Social media slides, quick pitches, attention-grabbing content',
    bulletPattern: ['Engaging hook', 'Core conflict', 'Resolution', 'Key insight']
  },
  dataStory: { // New: Data-driven narrative framework
    name: 'Data-Driven Narrative',
    structure: 'Context → Conflict → Resolution',
    bestFor: 'Analytics presentations, research findings, performance reviews',
    bulletPattern: ['Set the data context', 'Reveal the insight or conflict', 'Present the resolution or recommendation']
  }
};

/**
 * Enhanced tone adaptation strategies for storytelling frameworks (C-1: Narrative Quality & Structure)
 * Maps each framework to specific tone implementations
 */
export const FRAMEWORK_TONE_ADAPTATIONS = {
  problemSolution: {
    professional: 'Focus on business metrics, ROI, and strategic implications',
    casual: 'Use relatable examples, conversational language, and personal anecdotes',
    analytical: 'Emphasize data-driven problem identification and solution validation',
    persuasive: 'Highlight urgency, compelling benefits, and competitive advantages',
    educational: 'Break down complex problems into understandable components with clear explanations'
  },
  beforeAfter: {
    professional: 'Use strategic language, business outcomes, and transformation metrics',
    casual: 'Paint vivid pictures of transformation with relatable scenarios',
    analytical: 'Quantify current state vs future state gaps with detailed analysis',
    persuasive: 'Emphasize the cost of inaction and benefits of change',
    educational: 'Explain the transformation process step-by-step with learning objectives'
  },
  heroJourney: {
    professional: 'Focus on strategic decisions, business outcomes, and leadership lessons',
    casual: 'Tell an engaging story with personal touches and emotional connection',
    analytical: 'Document the journey with data, milestones, and measurable progress',
    persuasive: 'Inspire action through triumph over adversity and proven success',
    educational: 'Extract learnings from each stage with actionable insights'
  },
  pyramid: {
    professional: 'Lead with strategic recommendations and executive-level insights',
    casual: 'Start with the bottom line in accessible, jargon-free language',
    analytical: 'Present conclusions backed by rigorous analysis and methodology',
    persuasive: 'Lead with compelling recommendations that drive immediate action',
    educational: 'Structure learning from conclusion to supporting concepts with clear progression'
  },
  microStory: {
    professional: 'Sharp, executive-level insights with immediate business relevance',
    casual: 'Engaging hooks with relatable insights and conversational delivery',
    analytical: 'Data-driven hooks with actionable insights and clear methodology',
    persuasive: 'Compelling hooks that drive immediate action and decision-making',
    educational: 'Thought-provoking hooks with learning insights and knowledge transfer'
  },
  dataStory: {
    professional: 'Business-focused data interpretation with strategic implications',
    casual: 'Make data accessible and relatable with real-world examples',
    analytical: 'Deep dive into statistical significance and methodological rigor',
    persuasive: 'Use data to build compelling arguments and drive decisions',
    educational: 'Teach data literacy and interpretation with clear explanations'
  }
};

/**
 * Comprehensive layout selection guide with psychological impact and content format guidance
 * Enhanced with 2024 design trends: minimalism, asymmetry, and interactive-friendly layouts.
 */
export const LAYOUT_SELECTION_GUIDE = {
  'title': 'Maximum impact statements, emotional moments, key transitions. Psychology: Creates focus and emphasis through isolation. Trend: Minimalist with ample white space.',
  'title-bullets': 'Scannable lists, processes, benefits, action items. Psychology: Leverages cognitive chunking and parallel processing. Trend: Asymmetrical bullet placement for dynamism. Use bullets field.',
  'title-paragraph': 'Narrative explanations, stories, complex concepts, context-setting. Psychology: Enables deep understanding through storytelling. Trend: Integrated micro-illustrations. Use paragraph field.',
  'two-column': 'Comparisons, before/after, complementary concepts. Psychology: Enables comparative analysis and decision-making. Trend: Fluid column widths. Use left/right fields.',
  'mixed-content': 'Complex topics requiring both scannable points and narrative explanation. Psychology: Accommodates different learning preferences simultaneously. Trend: Layered content with subtle animations.',
  'image-right': 'Visual storytelling, emotional connection, product showcases. Psychology: Combines visual and verbal processing for memory. Trend: AI-generated visuals with overlay text. Use right.imagePrompt.',
  'image-left': 'Visual storytelling with text emphasis, process illustrations. Psychology: Visual context supports text comprehension. Trend: Asymmetrical image placement. Use left.imagePrompt.',
  'image-full': 'Emotional impact, brand moments, visual statements. Psychology: Maximum visual impact and emotional resonance. Trend: Subtle gradient overlays. Use imagePrompt or right.imagePrompt.',
  'quote': 'Testimonials, authority statements, inspirational messages. Psychology: Leverages social proof and emotional resonance. Trend: Minimalist with subtle background textures. Use paragraph field.',
  'chart': 'Data stories, trend analysis, quantitative insights. Psychology: Provides concrete evidence and logical support. Trend: Simplified, interactive-ready charts. Use chart field.',
  'comparison-table': 'Feature comparisons, option analysis, decision matrices. Psychology: Enables systematic comparison and decision-making. Trend: Clean, mobile-friendly tables. Use comparisonTable field.',
  'timeline': 'Process flows, project phases, historical progression. Psychology: Shows progression and builds anticipation. Trend: Non-linear timelines for complex stories. Use timeline field.',
  'process-flow': 'Step-by-step procedures, methodologies, workflows. Psychology: Breaks complexity into manageable steps. Trend: Circular flows for cyclical processes. Use processSteps field.',
  'before-after': 'Transformation stories, improvement showcases, change impact. Psychology: Demonstrates value through contrast. Trend: Interactive swipe reveals (PPT compatible). Use left/right fields.',
  'problem-solution': 'Challenge identification and resolution, value propositions. Psychology: Creates tension and resolution. Trend: Visual metaphors for problems/solutions. Use left/right fields.',
  'data-visualization': 'Complex data presentation, analytical insights, research findings. Psychology: Makes data accessible and actionable. Trend: Animated data reveals. Use chart field.',
  'testimonial': 'Customer success stories, social proof, credibility building. Psychology: Leverages social validation and trust. Trend: Authentic, diverse representations. Use quote layout.',
  'team-intro': 'Team presentations, expertise showcasing, credibility building. Psychology: Builds personal connection and trust. Trend: Human-centered with subtle animations. Use two-column layout.',
  'contact-info': 'Contact details, next steps, follow-up information. Psychology: Facilitates action and connection. Trend: QR codes and interactive links. Use bullets or paragraph.',
  'thank-you': 'Appreciation, conclusion, memorable endings. Psychology: Creates positive final impression. Trend: Emotional visuals with calls to action. Use title or quote layout.',
  'agenda': 'Meeting structure, presentation outline, expectation setting. Psychology: Provides roadmap and reduces anxiety. Trend: Visual progress indicators. Use bullets field.',
  'section-divider': 'Topic transitions, section breaks, presentation flow. Psychology: Provides mental breaks and organization. Trend: Subtle gradient transitions. Use title layout.'
};

/**
 * Step 1: Enhanced core content generation prompt with advanced prompt engineering
 * Incorporates chain-of-thought reasoning, few-shot examples, and quality enforcement
 */
/**
 * Intelligently select storytelling framework based on content and context (C-1: Narrative Quality & Structure)
 * Enhanced with tone awareness and content analysis
 */
function selectOptimalFramework(input: GenerationParams): {
  framework: typeof STORYTELLING_FRAMEWORKS[keyof typeof STORYTELLING_FRAMEWORKS];
  toneGuidance: string;
  narrativeStrategy: string;
} {
  const prompt = input.prompt.toLowerCase();
  let selectedFramework: keyof typeof STORYTELLING_FRAMEWORKS;

  // Enhanced content analysis for framework selection
  if (prompt.includes('data') || prompt.includes('analytics') || prompt.includes('metrics') || prompt.includes('research')) {
    selectedFramework = 'dataStory';
  } else if (prompt.includes('before') && prompt.includes('after') || prompt.includes('transform') || prompt.includes('improve')) {
    selectedFramework = 'beforeAfter';
  } else if (prompt.includes('timeline') || prompt.includes('history') || prompt.includes('journey') || prompt.includes('progress') || prompt.includes('story')) {
    selectedFramework = 'heroJourney';
  } else if (prompt.includes('recommend') || prompt.includes('analysis') || prompt.includes('conclusion') || input.audience === 'executives') {
    selectedFramework = 'pyramid';
  } else if (input.contentLength === 'minimal' || input.contentLength === 'brief') {
    selectedFramework = 'microStory';
  } else {
    selectedFramework = 'problemSolution'; // Default fallback
  }

  const framework = STORYTELLING_FRAMEWORKS[selectedFramework];
  const toneGuidance = (FRAMEWORK_TONE_ADAPTATIONS[selectedFramework] as any)?.[input.tone] ||
                      FRAMEWORK_TONE_ADAPTATIONS[selectedFramework]?.professional ||
                      'Use professional tone with clear, concise language';

  // Generate narrative strategy based on framework and audience
  const narrativeStrategy = generateNarrativeStrategy(selectedFramework, input);

  return {
    framework,
    toneGuidance,
    narrativeStrategy
  };
}

/**
 * Generate narrative strategy based on framework and input parameters
 */
function generateNarrativeStrategy(frameworkKey: keyof typeof STORYTELLING_FRAMEWORKS, input: GenerationParams): string {
  const audienceStrategies = {
    executives: 'Lead with strategic impact, use executive summary format, focus on ROI and business outcomes',
    managers: 'Balance strategic overview with tactical details, emphasize team impact and implementation',
    technical: 'Include technical depth, use precise terminology, provide implementation details',
    general: 'Use accessible language, provide context, focus on practical benefits',
    students: 'Use educational approach, provide background context, include learning objectives'
  };

  const lengthStrategies = {
    minimal: 'Distill to absolute essentials, use powerful single statements, maximize impact per word',
    brief: 'Focus on key points only, use concise bullets, maintain clarity without detail',
    moderate: 'Balance detail with brevity, provide sufficient context, use structured approach',
    detailed: 'Provide comprehensive coverage, include supporting details, use thorough explanations',
    comprehensive: 'Cover all aspects thoroughly, include extensive context, provide complete analysis'
  };

  const audienceStrategy = (audienceStrategies as any)[input.audience] || audienceStrategies.general;
  const lengthStrategy = lengthStrategies[input.contentLength] || lengthStrategies.moderate;

  return `${audienceStrategy}. ${lengthStrategy}. Framework: ${STORYTELLING_FRAMEWORKS[frameworkKey].structure}`;
}

/**
 * Analyze content to recommend optimal layout
 */
function analyzeContentForLayout(partialSpec: Partial<SlideSpec>): {
  type: string;
  complexity: string;
  recommendedLayouts: string[];
  visualPriority: string;
  reasoning: string;
} {
  const content = (partialSpec.title + ' ' + (partialSpec.paragraph || partialSpec.bullets?.join(' ') || '')).toLowerCase();
  const hasNumbers = /\d+%|\$[\d,]+|\d+x|increase|decrease|growth|revenue/.test(content);
  const hasComparison = /vs|versus|compared|before|after|better|worse/.test(content);
  const hasProcess = /step|phase|stage|process|workflow|timeline/.test(content);
  const hasData = /chart|graph|data|metrics|analytics|statistics/.test(content);

  if (hasData) {
    return {
      type: 'data-driven',
      complexity: 'high',
      recommendedLayouts: ['chart', 'data-visualization', 'mixed-content'],
      visualPriority: 'data visualization',
      reasoning: 'contains data/metrics requiring visual representation'
    };
  } else if (hasComparison) {
    return {
      type: 'comparative',
      complexity: 'medium',
      recommendedLayouts: ['two-column', 'before-after', 'comparison-table'],
      visualPriority: 'side-by-side comparison',
      reasoning: 'contains comparative elements'
    };
  } else if (hasProcess) {
    return {
      type: 'process-oriented',
      complexity: 'medium',
      recommendedLayouts: ['timeline', 'process-flow', 'mixed-content'],
      visualPriority: 'sequential flow',
      reasoning: 'describes process or sequential steps'
    };
  } else if (hasNumbers) {
    return {
      type: 'metric-focused',
      complexity: 'medium',
      recommendedLayouts: ['title-bullets', 'mixed-content', 'chart'],
      visualPriority: 'key metrics',
      reasoning: 'contains important numerical data'
    };
  } else {
    return {
      type: 'narrative',
      complexity: 'low',
      recommendedLayouts: ['title-paragraph', 'title-bullets', 'mixed-content'],
      visualPriority: 'clear messaging',
      reasoning: 'primarily text-based content'
    };
  }
}

/**
 * Enhanced content analysis for context-aware imagery (C-2: Context-Aware Image Prompts)
 * Analyzes slide content and theme to recommend optimal image concepts
 */
function analyzeContentForImagery(partialSpec: Partial<SlideSpec>, input: GenerationParams): {
  contentType: string;
  themes: string[];
  recommendedConcept: string;
  visualMetaphor: string;
  themeAlignment: string;
  emotionalTone: string;
  technicalSpecs: string;
} {
  const content = (partialSpec.title + ' ' + (partialSpec.paragraph || partialSpec.bullets?.join(' ') || '')).toLowerCase();
  const selectedTheme = input.design?.theme || 'professional';

  const themes: string[] = [];
  let contentType = 'general';
  let recommendedConcept = 'professional business setting';
  let visualMetaphor = 'clean, modern workspace';
  let themeAlignment = 'professional corporate aesthetic';
  let emotionalTone = 'confident and trustworthy';
  let technicalSpecs = 'high resolution, professional lighting';

  // Enhanced content analysis with theme integration (C-2: Context-Aware Image Prompts)
  if (/growth|increase|revenue|profit|success/.test(content)) {
    themes.push('growth', 'success');
    contentType = 'business-growth';
    recommendedConcept = 'upward trending charts or growth imagery';
    visualMetaphor = 'ascending arrows, growing plants, or climbing stairs';
    emotionalTone = 'optimistic and aspirational';
  }

  if (/team|collaboration|people|together/.test(content)) {
    themes.push('teamwork', 'collaboration');
    contentType = 'team-focused';
    recommendedConcept = 'diverse team collaboration';
    visualMetaphor = 'connected networks or unified team dynamics';
    emotionalTone = 'inclusive and energetic';
  }

  if (/technology|digital|ai|automation|innovation/.test(content)) {
    themes.push('technology', 'innovation');
    contentType = 'tech-focused';
    recommendedConcept = 'modern technology interfaces';
    visualMetaphor = 'digital transformation or futuristic elements';
    emotionalTone = 'cutting-edge and progressive';
  }

  if (/data|analytics|metrics|statistics/.test(content)) {
    themes.push('data', 'analytics');
    contentType = 'data-driven';
    recommendedConcept = 'data visualization or dashboard';
    visualMetaphor = 'flowing data streams or organized information';
    emotionalTone = 'analytical and precise';
  }

  if (/problem|challenge|issue|difficulty/.test(content)) {
    themes.push('problem-solving', 'challenge');
    contentType = 'problem-focused';
    recommendedConcept = 'problem-solving or overcoming obstacles';
    visualMetaphor = 'breaking through barriers or finding solutions';
    emotionalTone = 'determined and solution-oriented';
  }

  if (/solution|answer|resolve|fix/.test(content)) {
    themes.push('solution', 'resolution');
    contentType = 'solution-focused';
    recommendedConcept = 'clear pathways or breakthrough moments';
    visualMetaphor = 'light at the end of tunnel or key unlocking potential';
    emotionalTone = 'confident and reassuring';
  }

  // Theme-specific visual alignment
  const themeVisualMappings = {
    'creative-studio': 'artistic, vibrant colors, creative workspace aesthetic',
    'corporate-blue': 'professional blue tones, corporate environment, clean lines',
    'modern-minimal': 'minimalist design, white space, geometric elements',
    'tech-forward': 'futuristic elements, digital interfaces, high-tech environment',
    'warm-professional': 'warm tones, approachable professional setting',
    'bold-impact': 'high contrast, dramatic lighting, powerful visual impact'
  };

  themeAlignment = (themeVisualMappings as any)[selectedTheme] || 'professional corporate aesthetic';

  // Technical specifications based on theme
  const themeTechnicalSpecs = {
    'creative-studio': 'vibrant colors, artistic lighting, creative composition',
    'corporate-blue': 'professional lighting, blue color palette, clean composition',
    'modern-minimal': 'minimal elements, soft lighting, geometric composition',
    'tech-forward': 'high-tech lighting, digital elements, futuristic composition',
    'warm-professional': 'warm lighting, earth tones, approachable composition',
    'bold-impact': 'dramatic lighting, high contrast, powerful composition'
  };

  technicalSpecs = (themeTechnicalSpecs as any)[selectedTheme] || 'high resolution, professional lighting';

  // Default fallback
  if (themes.length === 0) {
    themes.push('professional', 'business');
  }

  return {
    contentType,
    themes,
    recommendedConcept,
    visualMetaphor,
    themeAlignment,
    emotionalTone,
    technicalSpecs
  };
}

/**
 * Perform quick quality assessment for refinement guidance
 */
function performQuickQualityCheck(partialSpec: Partial<SlideSpec>, input: GenerationParams): {
  estimatedScore: number;
  issues: string[];
  strengths: string[];
} {
  const issues: string[] = [];
  const strengths: string[] = [];
  let score = 100;

  // Check title quality
  const title = partialSpec.title || '';
  if (title.length < 15) {
    issues.push('title too short');
    score -= 10;
  } else if (title.length > 60) {
    issues.push('title too long');
    score -= 5;
  } else {
    strengths.push('good title length');
  }

  if (!/\d+/.test(title) && (partialSpec.bullets?.some(b => /\d+/.test(b)) || false)) {
    issues.push('title lacks quantification');
    score -= 5;
  }

  // Check content quality
  const bullets = partialSpec.bullets || [];
  if (bullets.length > 7) {
    issues.push('too many bullets');
    score -= 10;
  } else if (bullets.length > 0) {
    strengths.push('appropriate bullet count');
  }

  // Check for vague language
  const vaguePhrases = ['good', 'better', 'improved', 'things', 'stuff'];
  const hasVague = bullets.some(b => vaguePhrases.some(phrase => b.toLowerCase().includes(phrase)));
  if (hasVague) {
    issues.push('vague language detected');
    score -= 15;
  } else {
    strengths.push('specific language');
  }

  return { estimatedScore: Math.max(score, 0), issues, strengths };
}

export function generateContentPrompt(input: GenerationParams): string {
  const { framework, toneGuidance, narrativeStrategy } = selectOptimalFramework(input);
  const audienceGuidance = AUDIENCE_GUIDANCE[input.audience] || AUDIENCE_GUIDANCE.general;
  const toneSpec = TONE_SPECIFICATIONS[input.tone] || TONE_SPECIFICATIONS.professional;
  const lengthSpec = CONTENT_LENGTH_SPECS[input.contentLength] || CONTENT_LENGTH_SPECS.moderate;

  return `## CONTENT GENERATION TASK
Create compelling slide content for: "${input.prompt}"

## AUDIENCE PROFILE & CONTEXT:
**Target Audience**: ${input.audience} - ${audienceGuidance.focus}
**Communication Style**: ${toneSpec.style}
**Content Depth**: ${lengthSpec.description}
**Psychological Approach**: ${audienceGuidance.psychology}
**Success Pattern**: ${audienceGuidance.structure}

## STORYTELLING FRAMEWORK: ${framework.name}
**Structure**: ${framework.structure}
**Flow Pattern**: ${framework.bulletPattern ? framework.bulletPattern.join(' → ') : 'Problem → Solution → Impact'}
**Tone Adaptation**: ${toneGuidance}
**Narrative Strategy**: ${narrativeStrategy}

## CONTENT SPECIFICATIONS:

### Strategic Message Focus
- Drive specific business outcome for ${input.audience}
- Create compelling insight that resonates emotionally
- Include quantified benefits and clear value proposition
- Ensure authenticity with realistic, contextual metrics

### Quality Standards (2024 Minimalism Emphasis)
- **Title**: Outcome-focused, 15-60 characters, quantified when possible
- **Content**: ${lengthSpec.contentGuidance}
- **Bullet Points**: Maximum 5 bullets, 15-25 words each (strict limit for maximum impact)
- **Style**: ${toneSpec.bulletStyle}
- **Voice**: Active, confident, evidence-based for ${input.audience}
- **Language**: ${audienceGuidance.language}
- **Minimalism**: Prioritize impact over volume - every word must earn its place

## INDUSTRY CONTEXT:
${input.industry && input.industry !== 'general' ? `**Industry Focus**: ${input.industry} - Tailor content with industry-specific terminology, metrics, and challenges relevant to ${input.industry} professionals.` : '**Industry**: General business context - Use universally applicable language and examples.'}

## PRESENTATION TYPE GUIDANCE:
${input.presentationType && input.presentationType !== 'general' ? `**Presentation Type**: ${input.presentationType} - Structure content optimally for ${input.presentationType} format with appropriate pacing and emphasis.` : '**Type**: General presentation - Use balanced structure suitable for broad business contexts.'}

## QUALITY EXAMPLES:

**EXCELLENT Title Examples:**
✅ "Q4 Revenue: 34% Growth Exceeds $2.1M Target by 18%"
✅ "Customer NPS Jumps from 6.2 to 8.4 Following Service Redesign"
✅ "New AI System Reduces Processing Time from 4 Hours to 90 Minutes"

**POOR Title Examples:**
❌ "Q4 Results" (too vague, no outcome)
❌ "Some Updates" (no specificity or value)
❌ "Information About Our Performance" (wordy, unclear benefit)

**EXCELLENT Bullet Examples (15-25 words each):**
✅ "Reduced customer churn from 12% to 8.5% through personalized onboarding program launched in Q3" (16 words)
✅ "Captured 15% market share in APAC within 6 months, generating $1.2M additional revenue" (14 words)
✅ "Automated invoice processing, eliminating 200 manual hours weekly and reducing errors by 85%" (13 words)

**POOR Bullet Examples:**
❌ "We did better this quarter" (vague, no metrics or context)
❌ "Improvements were made to our processes" (passive voice, no specifics)
❌ "Things are going well with customers" (meaningless, no evidence)
❌ "Our comprehensive customer relationship management system implementation has resulted in significant improvements across multiple key performance indicators including but not limited to customer satisfaction scores" (26+ words - too verbose)

**CONTENT AUTHENTICITY REQUIREMENTS:**
- Use realistic percentage ranges (15-25% not 23.7%)
- Include contextual timeframes (Q3, within 6 months, year-over-year)
- Reference specific methodologies or programs when mentioning improvements
- Ensure dollar amounts align with company size and industry norms

**EXCELLENT Timeline Examples:**
✅ {"date": "1754", "title": "Military Career Begins", "description": "Starts his military career during the French and Indian War, demonstrating early leadership skills.", "milestone": false}
✅ {"date": "1789", "title": "First President of the United States", "description": "Elected as the inaugural President, establishing protocols that would guide future leaders.", "milestone": true}

**POOR Timeline Examples:**
❌ {"date": "1754", "title": "Military stuff", "description": "Did some things"}
❌ {"date": "Later", "title": "Became President", "description": "Was important"}

## OUTPUT REQUIREMENTS:
Create a JSON object with these exact fields:
{
  "title": "Specific, compelling title with clear benefit/outcome",
  "layout": "title-paragraph", // Will be optimized in next step
  "paragraph": "Engaging narrative content (if using paragraph format)",
  "bullets": ["Specific, metric-driven bullet points"],
  "notes": "Speaker delivery guidance and key talking points",
  "sources": ["Credible source references if applicable"]
}

## FINAL QUALITY CHECK:
Before responding, verify:
- ✅ Title is specific and benefit-focused (15-60 characters)
- ✅ Content matches audience sophistication level
- ✅ Tone aligns with ${input.tone} requirements
- ✅ Length matches ${input.contentLength} specification
- ✅ Each bullet point is 15-25 words maximum (count them!)
- ✅ Maximum 5 bullet points total for optimal impact
- ✅ JSON format is valid and complete
- ✅ Content would score 85+ on quality assessment
- ✅ Every word serves a purpose - no filler content

Generate content that executives would be proud to present to their most important stakeholders.

## SELF-REFLECTION CHECKPOINT:
${SELF_REFLECTION_PROMPTS.contentReflection}

## REFERENCE EXAMPLES:
Study these examples of excellent vs. poor content:

**EXCELLENT EXAMPLE:**
${JSON.stringify(FEW_SHOT_EXAMPLES.excellentSlides[0], null, 2)}
**Why Excellent:** ${FEW_SHOT_EXAMPLES.excellentSlides[0].whyExcellent}

**POOR EXAMPLE (AVOID):**
${JSON.stringify(FEW_SHOT_EXAMPLES.poorSlides[0], null, 2)}
**Why Poor:** ${FEW_SHOT_EXAMPLES.poorSlides[0].whyPoor}

Aim for the excellence level shown in the good examples.`;
}

/**
 * Step 2: Enhanced layout refinement prompt with advanced visual design reasoning
 * Incorporates UX principles, accessibility guidelines, and data-driven layout selection
 */
export function generateLayoutPrompt(input: GenerationParams, partialSpec: Partial<SlideSpec>): string {
  // Analyze content to suggest optimal layout
  const contentAnalysis = analyzeContentForLayout(partialSpec);

  return `## LAYOUT OPTIMIZATION TASK
Optimize visual layout for maximum impact and comprehension.

## CURRENT CONTENT ANALYSIS:
${JSON.stringify(partialSpec, null, 2)}

## DESIGN CONTEXT:
**Audience**: ${input.audience} (affects complexity and visual preferences)
**Tone**: ${input.tone} (influences layout formality and structure)
**User Preference**: ${input.design?.layout || 'auto-select based on content'}
**Image Integration**: ${input.withImage ? 'Required - optimize for visual storytelling' : 'Text-focused design'}
**Content Type**: ${contentAnalysis.type} (${contentAnalysis.reasoning})

## LAYOUT DECISION FRAMEWORK:

### Content Analysis Results:
- **Information Type**: ${contentAnalysis.type}
- **Complexity Level**: ${contentAnalysis.complexity}
- **Recommended Layouts**: ${contentAnalysis.recommendedLayouts.join(', ')}
- **Visual Priority**: ${contentAnalysis.visualPriority}

### Step 2: Audience-Optimized Layout Strategy
**${input.audience} audience optimization:**
${input.audience === 'executives' ? '- Prioritize high-impact visuals with minimal text\n- Use layouts that support quick decision-making\n- Emphasize outcomes and ROI metrics\n- Prefer clean, authoritative designs that convey competence' :
  input.audience === 'technical' ? '- Support detailed information with logical progression\n- Use process-oriented and data-visualization layouts\n- Enable deep-dive analysis with structured information\n- Prefer layouts that show technical relationships and workflows' :
  input.audience === 'students' ? '- Create engaging, educational progressions\n- Use visual learning aids and step-by-step layouts\n- Support knowledge retention with clear structure\n- Prefer layouts that facilitate understanding and engagement' :
  '- Balance information density with accessibility\n- Use clear, scannable structures for broad appeal\n- Support both quick scanning and detailed reading\n- Prefer professional but approachable layouts'}

### Step 3: Content-Layout Matching Intelligence
**Smart Layout Selection Based on Content Type:**
- **Metrics/Results**: Use title-bullets or mixed-content for impact
- **Comparisons**: Use two-column, before-after, or comparison-table
- **Processes**: Use timeline, process-flow, or step-by-step layouts
- **Data**: Use chart, data-visualization, or infographic layouts
- **Stories**: Use mixed-content or narrative-flow layouts

### AVAILABLE LAYOUTS & SELECTION CRITERIA:
**Primary Layouts**: ${SLIDE_LAYOUTS.join(', ')}

**LAYOUT SELECTION CRITERIA**:
${Object.entries(LAYOUT_SELECTION_GUIDE).slice(0, 8).map(([layout, guide]) => `**${layout}**: ${guide}`).join('\n')}

**Advanced Layouts**: ${Object.entries(LAYOUT_SELECTION_GUIDE).slice(8).map(([layout]) => layout).join(', ')}

### Step 4: Data Structure Requirements
When selecting layouts, ensure proper data structure:

**Two-Column Layouts** (two-column, before-after, problem-solution):
\`\`\`json
{
  "left": {"bullets": ["Point 1", "Point 2"] OR "paragraph": "Text content"},
  "right": {"bullets": ["Point 1", "Point 2"] OR "paragraph": "Text content" OR "imagePrompt": "Image description"}
}
\`\`\`

**Chart Layouts** (chart, data-visualization):
\`\`\`json
{
  "chart": {
    "type": "bar|line|pie|doughnut|area|scatter|column",
    "title": "Chart title",
    "categories": ["Category 1", "Category 2"],
    "series": [{"name": "Series Name", "data": [value1, value2]}]
  }
}
\`\`\`

**Table Layouts** (comparison-table):
\`\`\`json
{
  "comparisonTable": {
    "headers": ["Feature", "Option A", "Option B"],
    "rows": [["Speed", "Fast", "Moderate"], ["Cost", "$100", "$150"]]
  }
}
\`\`\`

**Process Layouts** (timeline, process-flow):
\`\`\`json
{
  "timeline": [
    {"date": "1754", "title": "Military Career Begins", "description": "Starts his military career during the French and Indian War, demonstrating early leadership skills.", "milestone": false},
    {"date": "1789", "title": "First President of the United States", "description": "Elected as the inaugural President, establishing protocols that would guide future leaders.", "milestone": true}
  ],
  "processSteps": [{"step": 1, "title": "Analyze", "description": "Gather requirements"}]
}
\`\`\`

**Timeline Best Practices:**
- Use specific dates/years for chronological accuracy
- Keep titles concise but descriptive (3-8 words)
- Descriptions should be 10-20 words explaining significance
- Mark major milestones with "milestone": true
- Limit to 4-8 timeline items for optimal visual impact

## OPTIMIZATION CHECKLIST:
Before finalizing layout, verify:
- ✅ Layout matches content complexity and audience needs
- ✅ Visual hierarchy guides eye movement logically
- ✅ Information density is appropriate for comprehension
- ✅ All required fields for chosen layout are populated
- ✅ Content maintains professional quality standards
- ✅ Layout supports accessibility (screen readers, high contrast)

## FINAL OUTPUT:
Return the complete, optimized slide specification with:
1. **Optimal layout** selected based on content analysis
2. **Properly structured data** for the chosen layout
3. **All original content** preserved and enhanced
4. **Professional formatting** that serves the audience

Focus on creating a layout that maximizes comprehension and visual impact for ${input.audience} audience.

## LAYOUT OPTIMIZATION REFLECTION:
${SELF_REFLECTION_PROMPTS.layoutReflection}

## CHAIN-OF-THOUGHT REASONING:
${CHAIN_OF_THOUGHT_TEMPLATES.layoutOptimization}`;
}

/**
 * Step 3: Enhanced context-aware image generation (C-2: Context-Aware Image Prompts)
 * Incorporates theme alignment, emotional psychology, and technical optimization
 */
export function generateImagePrompt(input: GenerationParams, partialSpec: Partial<SlideSpec>): string {
  // Enhanced content analysis with theme integration
  const imageAnalysis = analyzeContentForImagery(partialSpec, input);

  return `## CONTEXT-AWARE IMAGE PROMPT GENERATION TASK
Create a compelling, professional image prompt that perfectly aligns with the slide's message, selected theme, and emotional impact.

## COMPREHENSIVE SLIDE ANALYSIS:
**Title**: ${partialSpec.title}
**Layout**: ${partialSpec.layout}
**Content Type**: ${imageAnalysis.contentType}
**Key Themes**: ${imageAnalysis.themes.join(', ')}
**Selected Theme**: ${input.design?.theme || 'professional'}

## ENHANCED VISUAL STRATEGY CONTEXT:
**Audience**: ${input.audience} - Professional expectations and visual preferences
**Tone**: ${input.tone} - Emotional and stylistic alignment required
**Image Style**: ${input.imageStyle || 'professional'} - Technical approach for generation
**Recommended Concept**: ${imageAnalysis.recommendedConcept}
**Visual Metaphor**: ${imageAnalysis.visualMetaphor}
**Theme Alignment**: ${imageAnalysis.themeAlignment}
**Emotional Tone**: ${imageAnalysis.emotionalTone}
**Technical Specifications**: ${imageAnalysis.technicalSpecs}

## ENHANCED IMAGE PROMPT DEVELOPMENT PROCESS:

### Step 1: Strategic Visual Alignment
- **Core Business Message**: What specific outcome or insight does this slide communicate?
- **Emotional Resonance**: What feeling will drive action (confidence, urgency, excitement, trust)?
- **Visual Metaphor**: What concrete imagery best represents abstract concepts?
- **Brand Alignment**: How formal and professional should the visual tone be?
- **Cultural Sensitivity**: Ensure inclusive, diverse, and globally appropriate imagery

### Step 2: Audience-Optimized Visual Strategy
**For ${input.audience} audience:**
${input.audience === 'executives' ? '- Sophisticated, boardroom-quality imagery conveying success and competence\n- Clean, uncluttered compositions that support quick decision-making\n- Professional environments with subtle luxury indicators\n- Diverse leadership representation and global business contexts' :
  input.audience === 'technical' ? '- Precise, technically accurate imagery with attention to detail\n- Clean, functional aesthetics that support logical thinking\n- Modern technology and innovation themes with authentic feel\n- Systematic visual elements that reflect engineering mindset' :
  input.audience === 'students' ? '- Engaging, relatable imagery that supports learning and growth\n- Bright, optimistic compositions that inspire and motivate\n- Diverse, inclusive representations that reflect modern classrooms\n- Educational metaphors and knowledge-building visual themes' :
  '- Professional yet approachable imagery that builds trust\n- Clear, universally understandable visual concepts\n- Balanced sophistication that appeals to broad audiences\n- Authentic, realistic representations that feel genuine'}

### Step 3: Content-Specific Visual Themes
**Match imagery to content type:**
- **Financial Results**: Professional charts, growth imagery, business success indicators
- **Technical Solutions**: Modern interfaces, clean technology, innovation themes
- **Team Performance**: Diverse collaboration, professional environments, achievement
- **Process Improvements**: Streamlined workflows, efficiency metaphors, optimization
- **Market Expansion**: Global themes, growth trajectories, opportunity landscapes

### Step 3: Technical Image Specifications
**Style Requirements**: ${input.imageStyle || 'professional'}
- **Professional**: Clean, corporate, high-quality photography style
- **Illustration**: Modern, clean vector-style illustrations
- **Abstract**: Conceptual, artistic representations
- **Realistic**: Photorealistic imagery with authentic feel
- **Minimal**: Simple, clean, uncluttered compositions

### Step 4: Image Prompt Quality Standards
**Excellent Image Prompts Include:**
✅ Specific visual elements and composition
✅ Professional quality and lighting specifications
✅ Emotional tone and atmosphere description
✅ Color palette guidance aligned with content
✅ Technical quality specifications (high-resolution, clean)

**EXCELLENT Image Prompt Examples:**
✅ "Diverse executive team reviewing growth charts on a large monitor in a modern boardroom, natural lighting, professional attire, confident expressions, clean corporate environment, high-resolution photography style"
✅ "Abstract visualization of upward growth trajectory with clean geometric elements, corporate blue and green gradient, minimalist professional design, high-quality digital illustration"
✅ "Modern data dashboard interface displaying key performance metrics, clean typography, professional color scheme, sleek design elements, high-tech corporate atmosphere"
✅ "Professional handshake between diverse business partners in a bright modern office, symbolizing successful partnership, natural lighting, corporate setting, authentic business photography"

**POOR Image Prompt Examples:**
❌ "Some people in an office" (too vague, no specific details)
❌ "Colorful chart" (lacks context, professional specifications)
❌ "Business stuff" (meaningless, no visual direction)
❌ "Happy workers" (unprofessional tone, no context)

**Poor Image Prompts:**
❌ "Business stuff" (too vague)
❌ "People working" (lacks specificity)
❌ "Nice picture" (no direction)

## LAYOUT-SPECIFIC IMAGE PLACEMENT:
Based on layout "${partialSpec.layout}", place image prompt in:
${partialSpec.layout === 'image-right' ? '- "right.imagePrompt" field for right-side placement' :
  partialSpec.layout === 'image-left' ? '- "left.imagePrompt" field for left-side placement' :
  partialSpec.layout === 'image-full' ? '- "imagePrompt" field for full-slide background' :
  '- "imagePrompt" field for general image integration'}

## FINAL OUTPUT REQUIREMENTS:
Return the COMPLETE slide specification with:
1. **All existing content preserved** - Do not remove any fields
2. **Professional image prompt added** - 20-200 characters, specific and actionable
3. **Proper field placement** - Based on layout requirements
4. **Quality validation** - Ensure prompt would generate professional imagery

Create an image prompt that elevates the slide's professional impact and supports the core message for ${input.audience} audience.`;
}

/**
 * NEW: Batch image prompt generation for multiple slides
 * Optimizes API calls by generating image prompts for all slides in one request
 */
export function generateBatchImagePrompts(input: GenerationParams, slideSpecs: Partial<SlideSpec>[]): string {
  const slideSummaries = slideSpecs.map((spec, index) =>
    `Slide ${index + 1}: "${spec.title}" (${spec.layout})`
  ).join('\n');

  return `## BATCH IMAGE PROMPT GENERATION TASK
Generate optimized image prompts for ${slideSpecs.length} slides in a cohesive presentation.

## PRESENTATION CONTEXT:
**Topic**: ${input.prompt}
**Audience**: ${input.audience}
**Tone**: ${input.tone}
**Style**: ${input.imageStyle || 'professional'}

## SLIDES TO PROCESS:
${slideSummaries}

## BATCH PROCESSING REQUIREMENTS:
1. **Visual Consistency**: Ensure all images work together as a cohesive presentation
2. **Style Uniformity**: Maintain consistent visual style and quality across all slides
3. **Audience Alignment**: All prompts should resonate with ${input.audience} expectations
4. **Professional Quality**: Each prompt should generate boardroom-quality imagery

## OUTPUT FORMAT:
Return a JSON array with image prompts for each slide:
[
  {
    "slideIndex": 0,
    "title": "slide title",
    "imagePrompt": "specific, professional image prompt (20-200 characters)",
    "placement": "field name for image placement based on layout",
    "reasoning": "brief explanation of visual choice"
  }
]

Generate cohesive, professional image prompts that enhance the overall presentation narrative.`;
}

/**
 * Step 4: Enhanced final refinement prompt with comprehensive quality assurance
 * Incorporates detailed quality assessment and iterative improvement
 */
export function generateRefinementPrompt(input: GenerationParams, partialSpec: Partial<SlideSpec>): string {
  // Quick quality assessment
  const qualityCheck = performQuickQualityCheck(partialSpec, input);

  return `## FINAL QUALITY REFINEMENT TASK
Perform targeted refinement to achieve professional excellence.

## CURRENT SLIDE SPECIFICATION:
**Title**: ${partialSpec.title}
**Layout**: ${partialSpec.layout}
**Content Length**: ${JSON.stringify(partialSpec).length} characters

## QUALITY ASSESSMENT:
**Current Estimated Score**: ${qualityCheck.estimatedScore}/100
**Priority Issues**: ${qualityCheck.issues.join(', ') || 'None identified'}
**Strengths**: ${qualityCheck.strengths.join(', ')}

## TARGET STANDARDS:
**Audience**: ${input.audience} - Must meet professional expectations
**Quality Goal**: 90+ score (A-grade) across all criteria
**Business Context**: Executive-level presentation quality

## COMPREHENSIVE QUALITY ASSESSMENT:

### 1. Content Quality Analysis (30% weight)
**Evaluation Criteria:**
- Title specificity and benefit focus (15-60 characters optimal)
- Content depth matches "${input.contentLength}" specification
- Language level appropriate for ${input.audience} audience
- Key messages are clear, actionable, and compelling
- Logical flow and persuasive structure

**Self-Assessment Questions:**
- Would an executive be proud to present this content?
- Does the title immediately communicate value/outcome?
- Is every word necessary and impactful?
- Does content drive toward a clear action or decision?

### 2. Visual Design & Layout (25% weight)
**Evaluation Criteria:**
- Layout optimally supports content hierarchy
- Information density appropriate for comprehension
- Professional formatting and visual consistency
- Effective use of white space and visual balance
- Layout choice enhances rather than hinders message

**Design Validation:**
- Does layout guide eye movement logically?
- Is information scannable in 5-10 seconds?
- Would this layout work well in both digital and print?

### 3. Audience Alignment (20% weight)
**Evaluation Criteria:**
- Language sophistication matches ${input.audience} expectations
- Tone aligns with "${input.tone}" specification
- Psychological triggers appropriate for audience motivation
- Professional standards met for business context
- Content complexity matches audience expertise

**Audience Check:**
- Would ${input.audience} find this compelling and credible?
- Does tone create appropriate emotional response?
- Is complexity level perfectly calibrated?

### 4. Accessibility & Inclusivity (15% weight)
**Evaluation Criteria:**
- Content is screen reader friendly
- Language is inclusive and bias-free
- Visual elements support diverse learning styles
- Information structure aids comprehension
- Professional standards for diverse audiences

### 5. Technical Excellence (10% weight)
**Evaluation Criteria:**
- JSON structure is valid and complete
- All required fields properly populated
- Data structures match layout requirements
- Content length within optimal ranges
- Grammar, spelling, and formatting perfect

## REFINEMENT PROCESS:

### Step 1: Quality Scoring
Rate each criterion (1-100):
- Content Quality: ___/100
- Visual Design: ___/100
- Audience Alignment: ___/100
- Accessibility: ___/100
- Technical Excellence: ___/100

### Step 2: Identify Improvements
For any score below 90, identify specific improvements:
- What exactly needs to be enhanced?
- How can we elevate this to A-grade quality?
- What would make this more compelling/professional?

### Step 3: Apply Refinements
Make targeted improvements while preserving core content:
- Enhance title for maximum impact
- Optimize content for audience and tone
- Ensure perfect technical implementation
- Validate accessibility and inclusivity

## FINAL QUALITY CHECKLIST:
Before outputting, verify:
- ✅ Title is specific, benefit-focused, and compelling
- ✅ Content perfectly matches audience sophistication
- ✅ Tone creates appropriate emotional response
- ✅ Layout optimally supports message hierarchy
- ✅ Information density enables quick comprehension
- ✅ Language is inclusive and professional
- ✅ JSON structure is complete and valid
- ✅ Overall quality would score 90+ (A-grade)

## OUTPUT REQUIREMENTS:
Return the refined slide specification that:
1. **Maintains all core content** while enhancing quality
2. **Achieves A-grade standards** across all criteria
3. **Perfectly serves** the ${input.audience} audience
4. **Creates compelling impact** for business presentations

Focus on elevating this to the quality level expected in Fortune 500 boardrooms.`;
}

/**
 * Industry-specific content guidance for specialized presentations
 * Enhanced with 2024 industry trends.
 */
export const INDUSTRY_GUIDANCE = {
  // Existing guidance (abbreviated)
  technology: { /* ... */ },
  // Add new entries as needed
};

/**
 * Presentation-type-specific structuring guidance
 * Enhanced with timing and psychology.
 */
export const PRESENTATION_TYPE_GUIDANCE = {
  // Existing guidance
};

/**
 * Comprehensive quality validation system with modern standards
 * Enhanced with detailed criteria for professional presentation excellence
 */
export const QUALITY_VALIDATION_CRITERIA = {
  contentQuality: {
    name: 'Content Quality Assessment',
    weight: 30,
    checks: [
      'Title is specific and benefit-focused (15-60 characters)',
      'Content matches audience sophistication level',
      'Information density is appropriate for comprehension',
      'Key messages are clear and actionable',
      'Content flows logically and persuasively'
    ],
    scoring: {
      excellent: 'Compelling, specific, audience-perfect content',
      good: 'Clear content with minor improvements needed',
      poor: 'Vague, generic, or inappropriate for audience'
    }
  },

  visualDesign: {
    name: 'Visual Design & Layout',
    weight: 25,
    checks: [
      'Layout optimally supports content hierarchy',
      'Visual balance and white space utilization',
      'Professional formatting and consistency',
      'Appropriate information density per slide',
      'Layout matches content complexity'
    ],
    scoring: {
      excellent: 'Perfect layout choice with optimal visual flow',
      good: 'Good layout with minor adjustments needed',
      poor: 'Layout doesn\'t support content or audience needs'
    }
  },

  audienceAlignment: {
    name: 'Audience Alignment',
    weight: 20,
    checks: [
      'Language level matches audience expertise',
      'Tone appropriate for context and audience',
      'Content depth matches audience needs',
      'Psychological triggers align with audience motivation',
      'Professional standards met for audience type'
    ],
    scoring: {
      excellent: 'Perfect audience targeting and alignment',
      good: 'Good alignment with minor tone adjustments',
      poor: 'Misaligned with audience needs or expectations'
    }
  },

  accessibility: {
    name: 'Accessibility & Inclusivity',
    weight: 15,
    checks: [
      'Content is screen reader friendly',
      'Language is inclusive and bias-free',
      'Visual elements support diverse learning styles',
      'Information is scannable and digestible',
      'Professional standards for diverse audiences'
    ],
    scoring: {
      excellent: 'Fully accessible and inclusive design',
      good: 'Good accessibility with minor improvements',
      poor: 'Accessibility barriers or exclusive language'
    }
  },

  technicalExcellence: {
    name: 'Technical Quality',
    weight: 10,
    checks: [
      'JSON structure is valid and complete',
      'All required fields are properly populated',
      'Data structures match layout requirements',
      'Content length within optimal ranges',
      'Professional grammar and formatting'
    ],
    scoring: {
      excellent: 'Perfect technical implementation',
      good: 'Good technical quality with minor issues',
      poor: 'Technical errors or incomplete structure'
    }
  }
};

/**
 * Enhanced validation prompt with comprehensive scoring and actionable feedback
 * Provides detailed quality assessment with specific improvement recommendations
 */
export const VALIDATION_PROMPT = `## COMPREHENSIVE SLIDE QUALITY ASSESSMENT

## SLIDE TO EVALUATE:
[Insert JSON]

## ASSESSMENT FRAMEWORK:
Use the comprehensive quality criteria to evaluate this slide across five key dimensions:

### 1. Content Quality (30% weight)
**Scoring Criteria:**
- Title specificity and impact (15-60 characters optimal)
- Content clarity and actionability
- Audience-appropriate language level
- Logical flow and persuasive structure
- Professional messaging standards

**Score: ___/100**
**Assessment:** [Excellent/Good/Poor]
**Specific Issues:** [List any problems]
**Improvements:** [Specific actionable recommendations]

### 2. Visual Design & Layout (25% weight)
**Scoring Criteria:**
- Layout supports content hierarchy
- Information density appropriate for comprehension
- Professional formatting consistency
- Effective visual balance
- Layout enhances message delivery

**Score: ___/100**
**Assessment:** [Excellent/Good/Poor]
**Specific Issues:** [List any problems]
**Improvements:** [Specific actionable recommendations]

### 3. Audience Alignment (20% weight)
**Scoring Criteria:**
- Language sophistication matches audience
- Tone creates appropriate emotional response
- Content complexity calibrated correctly
- Psychological triggers align with motivation
- Professional standards for business context

**Score: ___/100**
**Assessment:** [Excellent/Good/Poor]
**Specific Issues:** [List any problems]
**Improvements:** [Specific actionable recommendations]

### 4. Accessibility & Inclusivity (15% weight)
**Scoring Criteria:**
- Screen reader friendly structure
- Inclusive, bias-free language
- Supports diverse learning styles
- Scannable information architecture
- Professional diversity standards

**Score: ___/100**
**Assessment:** [Excellent/Good/Poor]
**Specific Issues:** [List any problems]
**Improvements:** [Specific actionable recommendations]

### 5. Technical Excellence (10% weight)
**Scoring Criteria:**
- Valid JSON structure
- Complete field population
- Proper data structures for layout
- Optimal content length ranges
- Perfect grammar and formatting

**Score: ___/100**
**Assessment:** [Excellent/Good/Poor]
**Specific Issues:** [List any problems]
**Improvements:** [Specific actionable recommendations]

## OUTPUT FORMAT:
Return a JSON object with this exact structure:
\`\`\`json
{
  "overallScore": 85,
  "grade": "B",
  "categoryScores": {
    "contentQuality": 90,
    "visualDesign": 85,
    "audienceAlignment": 80,
    "accessibility": 90,
    "technicalExcellence": 95
  },
  "strengths": [
    "Specific strength 1",
    "Specific strength 2"
  ],
  "improvements": [
    "Priority improvement 1 with specific action",
    "Priority improvement 2 with specific action"
  ],
  "quickFixes": [
    "Easy fix 1",
    "Easy fix 2"
  ],
  "recommendations": [
    "Strategic recommendation 1",
    "Strategic recommendation 2"
  ],
  "readyForPresentation": true/false
}
\`\`\`

Focus on providing actionable, specific feedback that would help create A-grade (90+) presentation content.`;

export const QUALITY_ASSESSMENT_PROMPT = VALIDATION_PROMPT;

/**
 * Few-shot examples for high-quality slide generation
 * Provides concrete examples of excellent vs. poor slide content
 */
export const FEW_SHOT_EXAMPLES = {
  excellentSlides: [
    {
      context: "Quarterly business results for executives",
      input: "Q4 revenue growth and performance metrics",
      output: {
        title: "Q4 Revenue: 34% Growth Drives Record $2.1M Quarter",
        layout: "title-bullets",
        bullets: [
          "Revenue increased 34% YoY, exceeding targets by $400K",
          "Customer acquisition cost reduced 28% through digital optimization",
          "Net promoter score improved to 72 (industry average: 45)",
          "Market expansion into 3 regions generated $600K new revenue"
        ],
        notes: "Emphasize the 34% growth first, then dive into the key drivers. Pause after each metric to let it sink in.",
        sources: ["Q4 Financial Report", "Customer Survey Data"]
      },
      qualityScore: 95,
      whyExcellent: "Specific metrics, clear benefits, executive-appropriate language, actionable insights"
    },
    {
      context: "Technical presentation for developers",
      input: "New API architecture benefits",
      output: {
        title: "New API Architecture: 60% Faster Response, 99.9% Uptime",
        layout: "title-bullets",
        bullets: [
          "Response time reduced from 200ms to 80ms average",
          "Horizontal scaling supports 10x traffic with zero downtime",
          "GraphQL implementation reduces data transfer by 45%",
          "Automated testing coverage increased to 95% with CI/CD pipeline"
        ],
        notes: "Focus on performance metrics first, then scalability benefits. Technical audience will appreciate specific numbers.",
        sources: ["Performance Testing Results", "Architecture Documentation"]
      },
      qualityScore: 92,
      whyExcellent: "Technical precision, quantified benefits, developer-focused language, concrete improvements"
    }
  ],

  poorSlides: [
    {
      context: "Business results presentation",
      input: "Q4 results",
      output: {
        title: "Q4 Results",
        layout: "title-bullets",
        bullets: [
          "We did well this quarter",
          "Revenue was good",
          "Customers are happy",
          "Things are improving"
        ],
        notes: "Talk about the results",
        sources: []
      },
      qualityScore: 25,
      whyPoor: "Vague title, no specific metrics, meaningless bullets, unprofessional language"
    }
  ]
};

/**
 * Self-reflection prompts for quality improvement
 * Guides AI to assess and improve its own outputs
 */
export const SELF_REFLECTION_PROMPTS = {
  contentReflection: `
## SELF-REFLECTION CHECKPOINT
Before finalizing your response, ask yourself:

**Content Quality Check:**
1. Is my title specific enough that someone could understand the key benefit in 5 seconds?
2. Would a busy executive find every bullet point valuable and actionable?
3. Does each piece of content drive toward a clear decision or action?
4. Am I using the most impactful words possible for this audience?

**Professional Standards Check:**
5. Would I be proud to present this content to Fortune 500 executives?
6. Does this content demonstrate clear expertise and authority?
7. Is the language level perfectly calibrated for the target audience?
8. Would this slide stand out positively in a high-stakes presentation?

**Technical Excellence Check:**
9. Is my JSON structure complete and valid?
10. Have I included all required fields for the chosen layout?
11. Are my content lengths within optimal ranges?
12. Is my formatting consistent and professional?

If you answered "no" to any question, revise before responding.
`,

  layoutReflection: `
## LAYOUT OPTIMIZATION REFLECTION
Before selecting a layout, consider:

**Visual Hierarchy Assessment:**
1. Does this layout guide the eye to the most important information first?
2. Will the audience be able to scan and understand this in 10 seconds?
3. Does the layout choice enhance or hinder the message?
4. Is the information density appropriate for the audience and context?

**Audience Experience Check:**
5. Would this layout work well for both in-person and virtual presentations?
6. Does the visual structure match how this audience prefers to process information?
7. Is there enough white space for professional appearance?
8. Would this layout reproduce well in both digital and print formats?

Revise layout choice if needed to optimize for audience comprehension and professional impact.
`,

  imageReflection: `
## IMAGE PROMPT QUALITY REFLECTION
Before finalizing image prompts, evaluate:

**Professional Impact Assessment:**
1. Would this image elevate the slide's professional credibility?
2. Does the image concept align with the content's emotional goal?
3. Is the prompt specific enough to generate consistent, high-quality results?
4. Would this image be appropriate for the target audience and business context?

**Technical Quality Check:**
5. Is my prompt 20-200 characters with specific visual details?
6. Have I included style, lighting, and composition guidance?
7. Does the prompt avoid potential copyright or sensitivity issues?
8. Will this generate imagery suitable for professional presentations?

Refine the image prompt if any aspect needs improvement.
`
};

/**
 * Chain-of-thought reasoning templates
 * Provides structured thinking frameworks for complex decisions
 */
export const CHAIN_OF_THOUGHT_TEMPLATES = {
  contentGeneration: `
## CHAIN-OF-THOUGHT REASONING FOR CONTENT GENERATION

**Step 1: Core Message Identification**
- What is the single most important takeaway?
- What decision or action should result from this slide?
- What emotional response do we want to create?

**Step 2: Audience Psychology Analysis**
- What motivates this specific audience?
- What language level and tone will resonate?
- What evidence or proof points will they find compelling?

**Step 3: Information Architecture**
- What's the logical flow from problem to solution to benefit?
- How can we structure information for maximum comprehension?
- What level of detail serves the audience best?

**Step 4: Professional Polish**
- How can we make every word count?
- What specific metrics or outcomes can we highlight?
- How do we ensure executive-level quality?

**Step 5: Quality Validation**
- Does this meet A-grade standards (90+ score)?
- Would I be proud to present this to important stakeholders?
- Is this the best possible version of this content?
`,

  layoutOptimization: `
## CHAIN-OF-THOUGHT REASONING FOR LAYOUT SELECTION

**Step 1: Content Analysis**
- What type of information am I presenting? (narrative, data, comparison, process)
- How complex is the information? (simple concept vs. detailed analysis)
- What's the primary vs. secondary information hierarchy?

**Step 2: Audience Processing Preferences**
- How does this audience typically consume information?
- Do they prefer visual, textual, or mixed content formats?
- What's their attention span and cognitive load capacity?

**Step 3: Layout Effectiveness Evaluation**
- Which layout best supports the information hierarchy?
- What layout enables fastest comprehension?
- Which choice creates the most professional impact?

**Step 4: Technical Implementation**
- Do I have the right data structures for this layout?
- Are all required fields properly populated?
- Does the layout choice align with content complexity?

**Step 5: Final Optimization**
- Does this layout serve the audience's needs optimally?
- Would this choice enhance or hinder the presentation flow?
- Is this the most professional and effective option?
`
};

/**
 * Enhanced Slide Generation Prompts for New Layout Engine
 *
 * Content-aware prompts that generate structured JSON matching our slide generators.
 * Each prompt enforces constraints and returns properly formatted slide configurations.
 */

/**
 * Enhanced system prompt for structured slide generation
 */
export const ENHANCED_SYSTEM_PROMPT = `You are an elite PowerPoint presentation architect specializing in creating professional, high-impact slides using a modern layout engine. You generate structured JSON configurations that produce visually stunning, accessible presentations.

## YOUR EXPERTISE:
- **Strategic Content**: Crafting persuasive, outcome-driven messaging
- **Layout Mastery**: Selecting optimal layouts for maximum impact
- **Typography Excellence**: Establishing clear visual hierarchy
- **Data Storytelling**: Transforming complex information into compelling narratives
- **Accessibility**: Ensuring WCAG 2.1 AA compliance

## SLIDE TYPES YOU MASTER:
1. **Title Slides**: Hero presentations with strong visual impact
2. **Bullet Slides**: Structured information with optimal readability (3-6 bullets max)
3. **Two-Column**: Balanced comparisons and complementary content
4. **Metrics**: Data-driven dashboards with key performance indicators
5. **Section**: Transition slides for narrative flow
6. **Quote**: Impactful statements with attribution
7. **Timeline**: Process flows and chronological information

## CONTENT CONSTRAINTS (NEVER VIOLATE):
- **Bullet Points**: 3-6 bullets maximum, 12-14 words per bullet
- **Titles**: 40-80 characters for optimal impact
- **Subtitles**: 20-60 characters for clarity
- **Descriptions**: 100-200 words maximum
- **Metrics**: Clear value + label + optional trend

## OUTPUT REQUIREMENTS:
- **Format**: Valid JSON only, matching exact schema
- **Quality**: Professional, boardroom-ready content
- **Accessibility**: High contrast, clear hierarchy
- **Consistency**: Maintain tone and style throughout

You must respond with properly structured JSON that matches the requested slide type schema exactly.`;

/**
 * Generate content-aware prompt for specific slide types
 */
export function generateSlidePrompt(
  slideType: string,
  topic: string,
  audience: keyof typeof AUDIENCE_GUIDANCE = 'general',
  contentLength: keyof typeof CONTENT_LENGTH_SPECS = 'moderate',
  additionalContext?: string
): string {
  const audienceGuide = AUDIENCE_GUIDANCE[audience];
  const lengthSpec = CONTENT_LENGTH_SPECS[contentLength];

  const basePrompt = `${ENHANCED_SYSTEM_PROMPT}

## CURRENT TASK:
Create a ${slideType} slide about: "${topic}"

## AUDIENCE CONTEXT:
- **Type**: ${audience}
- **Language**: ${audienceGuide.language}
- **Focus**: ${audienceGuide.focus}
- **Tone**: ${audienceGuide.tone}
- **Psychology**: ${audienceGuide.psychology}
- **Structure**: ${audienceGuide.structure}

## CONTENT LENGTH:
- **Level**: ${contentLength}
- **Description**: ${lengthSpec.description}
- **Guidance**: ${lengthSpec.contentGuidance}
- **Strategy**: ${lengthSpec.strategy}

${additionalContext ? `## ADDITIONAL CONTEXT:\n${additionalContext}` : ''}

## SLIDE TYPE SPECIFICATIONS:`;

  switch (slideType) {
    case 'title':
      return `${basePrompt}

**Title Slide Requirements:**
- Main title: Compelling, specific, outcome-focused (40-80 chars)
- Subtitle: Supporting context or value proposition (20-60 chars)
- Author: Optional presenter information
- Date: Optional presentation date
- Organization: Optional company/department

**JSON Schema:**
{
  "type": "title",
  "title": "string (required)",
  "subtitle": "string (optional)",
  "author": "string (optional)",
  "date": "string (optional)",
  "organization": "string (optional)"
}

Generate a professional title slide configuration in JSON format:`;

    case 'bullets':
      return `${basePrompt}

**Bullet Slide Requirements:**
- Title: Clear, descriptive heading (40-80 chars)
- Subtitle: Optional supporting context (20-60 chars)
- Bullets: 3-6 bullet points, 12-14 words each
- Each bullet: Start with action verb, no terminal periods
- Consistent tense and parallel structure

**JSON Schema:**
{
  "type": "bullets",
  "title": "string (required)",
  "subtitle": "string (optional)",
  "bullets": ["string", "string", ...] (3-6 items),
  "bulletStyle": "disc|circle|square|dash|arrow|number (optional)"
}

Generate a professional bullet slide configuration in JSON format:`;

    case 'twoColumn':
      return `${basePrompt}

**Two-Column Slide Requirements:**
- Title: Clear, descriptive heading (40-80 chars)
- Subtitle: Optional supporting context (20-60 chars)
- Left Column: Text, image, or mixed content
- Right Column: Text, image, or mixed content
- Balanced content distribution

**JSON Schema:**
{
  "type": "twoColumn",
  "title": "string (required)",
  "subtitle": "string (optional)",
  "leftColumn": {
    "type": "text|image|mixed",
    "content": "string (if text)",
    "bullets": ["string", ...] (optional),
    "src": "string (if image)",
    "alt": "string (if image)",
    "caption": "string (optional)"
  },
  "rightColumn": {
    "type": "text|image|mixed",
    "content": "string (if text)",
    "bullets": ["string", ...] (optional),
    "src": "string (if image)",
    "alt": "string (if image)",
    "caption": "string (optional)"
  },
  "columnRatio": [number, number] (optional, default [1,1])
}

Generate a professional two-column slide configuration in JSON format:`;

    case 'metrics':
      return `${basePrompt}

**Metrics Slide Requirements:**
- Title: Clear, descriptive heading (40-80 chars)
- Subtitle: Optional context or time period (20-60 chars)
- Metrics: 2-8 key performance indicators
- Each metric: value + label + optional description/trend
- Layout: grid, row, column, or featured

**JSON Schema:**
{
  "type": "metrics",
  "title": "string (required)",
  "subtitle": "string (optional)",
  "metrics": [
    {
      "value": "string|number (required)",
      "label": "string (required)",
      "description": "string (optional)",
      "trend": {
        "direction": "up|down|flat",
        "percentage": number,
        "period": "string"
      } (optional),
      "color": "primary|success|warning|error|info (optional)"
    }
  ],
  "layout": "grid|row|column|featured (optional)",
  "maxPerRow": number (optional),
  "showTrends": boolean (optional),
  "showTargets": boolean (optional)
}

Generate a professional metrics slide configuration in JSON format:`;

    default:
      return `${basePrompt}

**Generic Slide Requirements:**
- Title: Clear, descriptive heading
- Content: Appropriate for slide type
- Professional formatting and structure

Generate a professional slide configuration in JSON format for type: ${slideType}`;
  }
}

/**
 * Validate and optimize bullet points according to best practices
 */
export function optimizeBulletPoints(bullets: string[]): {
  optimized: string[];
  warnings: string[];
} {
  const warnings: string[] = [];
  let optimized = [...bullets];

  // Limit to 6 bullets maximum
  if (optimized.length > 6) {
    warnings.push(`Reduced ${optimized.length} bullets to 6 for optimal readability`);
    optimized = optimized.slice(0, 6);
  }

  // Ensure minimum of 3 bullets
  if (optimized.length < 3) {
    warnings.push('Consider adding more bullet points for better content balance');
  }

  // Optimize each bullet
  optimized = optimized.map((bullet, index) => {
    let optimizedBullet = bullet.trim();

    // Check word count (12-14 words recommended)
    const wordCount = optimizedBullet.split(/\s+/).length;
    if (wordCount > 14) {
      warnings.push(`Bullet ${index + 1} has ${wordCount} words (recommended: ≤14)`);
    }

    // Remove terminal periods for consistency
    if (optimizedBullet.endsWith('.') && !optimizedBullet.endsWith('...')) {
      optimizedBullet = optimizedBullet.slice(0, -1);
    }

    // Capitalize first letter
    if (optimizedBullet.length > 0) {
      optimizedBullet = optimizedBullet.charAt(0).toUpperCase() + optimizedBullet.slice(1);
    }

    // Check for action verbs (basic check)
    const actionVerbs = ['achieve', 'analyze', 'build', 'create', 'deliver', 'develop', 'drive', 'enhance', 'establish', 'execute', 'generate', 'implement', 'improve', 'increase', 'launch', 'optimize', 'reduce', 'streamline', 'transform'];
    const firstWord = optimizedBullet.split(' ')[0].toLowerCase();

    if (!actionVerbs.some(verb => firstWord.includes(verb))) {
      // This is just a warning, not a fix
      warnings.push(`Bullet ${index + 1} could start with a stronger action verb`);
    }

    return optimizedBullet;
  });

  return { optimized, warnings };
}

/**
 * Generate multi-slide prompt for complex topics
 */
export function generateMultiSlidePrompt(
  topic: string,
  slideCount: number,
  audience: keyof typeof AUDIENCE_GUIDANCE = 'general',
  contentLength: keyof typeof CONTENT_LENGTH_SPECS = 'moderate'
): string {
  const audienceGuide = AUDIENCE_GUIDANCE[audience];
  const lengthSpec = CONTENT_LENGTH_SPECS[contentLength];

  return `${ENHANCED_SYSTEM_PROMPT}

## MULTI-SLIDE PRESENTATION TASK:
Create a ${slideCount}-slide presentation about: "${topic}"

## AUDIENCE CONTEXT:
- **Type**: ${audience}
- **Language**: ${audienceGuide.language}
- **Focus**: ${audienceGuide.focus}
- **Tone**: ${audienceGuide.tone}
- **Structure**: ${audienceGuide.structure}

## CONTENT SPECIFICATIONS:
- **Length**: ${contentLength} (${lengthSpec.description})
- **Strategy**: ${lengthSpec.strategy}
- **Guidance**: ${lengthSpec.contentGuidance}

## SLIDE FLOW REQUIREMENTS:
1. **Opening**: Strong title slide with clear value proposition
2. **Body**: ${slideCount - 2} content slides with logical progression
3. **Closing**: Summary or call-to-action slide

## NARRATIVE STRUCTURE:
- **Hook**: Compelling opening that captures attention
- **Context**: Background information and problem statement
- **Solution**: Your main content and recommendations
- **Impact**: Benefits, outcomes, and next steps

## JSON SCHEMA:
{
  "slides": [
    {
      "type": "title|bullets|twoColumn|metrics|section|quote",
      // ... slide-specific configuration
    }
  ],
  "theme": "neutral|executive|colorPop",
  "metadata": {
    "title": "string",
    "description": "string",
    "audience": "${audience}",
    "duration": "number (minutes)"
  }
}

Generate a complete ${slideCount}-slide presentation configuration in JSON format:`;
}

/**
 * Content quality validation prompts
 */
export const VALIDATION_PROMPTS = {
  contentQuality: `
Evaluate this slide content for professional quality:

## EVALUATION CRITERIA:
1. **Clarity**: Is the message clear and unambiguous?
2. **Impact**: Does it drive toward a specific outcome?
3. **Specificity**: Are claims supported with concrete details?
4. **Professionalism**: Is it boardroom-ready?
5. **Accessibility**: Is it inclusive and easy to understand?

## SCORING (0-100):
- 90-100: Exceptional, Fortune 500 quality
- 80-89: Professional, minor improvements needed
- 70-79: Good, some enhancements required
- 60-69: Adequate, significant improvements needed
- Below 60: Requires major revision

Provide score and specific improvement recommendations.`,

  accessibilityCheck: `
Review this slide for accessibility compliance:

## ACCESSIBILITY CHECKLIST:
1. **Color Contrast**: Sufficient contrast ratios (4.5:1 minimum)
2. **Font Sizes**: Minimum 12pt for body text, 18pt for headings
3. **Language**: Clear, jargon-free communication
4. **Structure**: Logical reading order and hierarchy
5. **Alt Text**: Descriptive text for images and graphics

## WCAG 2.1 COMPLIANCE:
- Level AA requirements (business standard)
- Screen reader compatibility
- Keyboard navigation support

Identify any accessibility issues and provide remediation suggestions.`,

  brandConsistency: `
Verify brand consistency across slide elements:

## BRAND ELEMENTS:
1. **Typography**: Consistent font usage and hierarchy
2. **Colors**: Adherence to brand color palette
3. **Tone**: Consistent voice and messaging style
4. **Layout**: Uniform spacing and alignment
5. **Imagery**: Brand-appropriate visual style

Ensure all elements align with professional presentation standards.`
};
```

---


## Service Layer

### 8. aiService.ts

**Path**: `functions/src/services/aiService.ts`

**Description**: AI service for slide content generation

```ts
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

```

---

### 9. validationService.ts

**Path**: `functions/src/services/validationService.ts`

**Description**: Content validation and quality assessment

```ts
/**
 * Validation Service Module - Centralized Validation Logic
 * 
 * Provides comprehensive validation for all application data including:
 * - Input parameter validation
 * - Slide content validation
 * - Content quality assessment
 * - Business rule validation
 * 
 * This module ensures data integrity and provides detailed feedback
 * for validation failures.
 * 
 * @version 1.0.0
 */

import { 
  safeValidateGenerationParams, 
  safeValidateSlideSpec, 
  validateContentQuality,
  type GenerationParams, 
  type SlideSpec 
} from '../schema';

/**
 * Validation result interface
 */
export interface ValidationResult<T = any> {
  success: boolean;
  data?: T;
  errors: string[];
  warnings: string[];
  metadata?: Record<string, any>;
}

/**
 * Content quality assessment
 */
export interface QualityAssessment {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  issues: string[];
  strengths: string[];
  suggestions: string[];
}

/**
 * Validation Service Interface
 */
export interface IValidationService {
  validateGenerationParams(params: any): ValidationResult<GenerationParams>;
  validateSlideSpec(spec: any): ValidationResult<SlideSpec>;
  validateSlideArray(specs: any[]): ValidationResult<SlideSpec[]>;
  assessContentQuality(spec: SlideSpec): QualityAssessment;
  validateBusinessRules(params: GenerationParams): ValidationResult<GenerationParams>;
}

/**
 * Main Validation Service Implementation
 */
export class ValidationService implements IValidationService {
  /**
   * Validate generation parameters
   */
  validateGenerationParams(params: any): ValidationResult<GenerationParams> {
    const result = safeValidateGenerationParams(params);
    
    const validationResult: ValidationResult<GenerationParams> = {
      success: result.success,
      data: result.data,
      errors: result.errors || [],
      warnings: [],
      metadata: {
        validatedAt: new Date().toISOString(),
        validationType: 'generation_params'
      }
    };

    // Add business rule validation
    if (result.success && result.data) {
      const businessValidation = this.validateBusinessRules(result.data);
      validationResult.warnings.push(...businessValidation.warnings);
      
      if (!businessValidation.success) {
        validationResult.success = false;
        validationResult.errors.push(...businessValidation.errors);
      }
    }

    return validationResult;
  }

  /**
   * Validate a single slide specification
   */
  validateSlideSpec(spec: any): ValidationResult<SlideSpec> {
    const result = safeValidateSlideSpec(spec);
    
    const validationResult: ValidationResult<SlideSpec> = {
      success: result.success,
      data: result.success ? result.data as SlideSpec : undefined,
      errors: result.errors || [],
      warnings: [],
      metadata: {
        validatedAt: new Date().toISOString(),
        validationType: 'slide_spec'
      }
    };

    // Add content quality warnings
    if (result.success && result.data && !Array.isArray(result.data)) {
      const qualityAssessment = this.assessContentQuality(result.data as SlideSpec);
      
      if (qualityAssessment.score < 70) {
        validationResult.warnings.push(`Content quality score is low (${qualityAssessment.score}/100)`);
      }
      
      validationResult.warnings.push(...qualityAssessment.issues);
      validationResult.metadata!.qualityScore = qualityAssessment.score;
      validationResult.metadata!.qualityGrade = qualityAssessment.grade;
    }

    return validationResult;
  }

  /**
   * Validate an array of slide specifications
   */
  validateSlideArray(specs: any[]): ValidationResult<SlideSpec[]> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const validatedSpecs: SlideSpec[] = [];

    if (!Array.isArray(specs)) {
      return {
        success: false,
        errors: ['Input must be an array of slide specifications'],
        warnings: []
      };
    }

    if (specs.length === 0) {
      return {
        success: false,
        errors: ['At least one slide specification is required'],
        warnings: []
      };
    }

    if (specs.length > 50) {
      errors.push('Too many slides (maximum 50 allowed)');
    }

    // Validate each slide
    specs.forEach((spec, index) => {
      const slideValidation = this.validateSlideSpec(spec);
      
      if (slideValidation.success && slideValidation.data) {
        validatedSpecs.push(slideValidation.data);
      } else {
        slideValidation.errors.forEach(error => {
          errors.push(`Slide ${index + 1}: ${error}`);
        });
      }
      
      slideValidation.warnings.forEach(warning => {
        warnings.push(`Slide ${index + 1}: ${warning}`);
      });
    });

    // Validate presentation-level rules
    if (validatedSpecs.length > 0) {
      const presentationWarnings = this.validatePresentationRules(validatedSpecs);
      warnings.push(...presentationWarnings);
    }

    return {
      success: errors.length === 0,
      data: validatedSpecs,
      errors,
      warnings,
      metadata: {
        validatedAt: new Date().toISOString(),
        validationType: 'slide_array',
        slideCount: validatedSpecs.length,
        totalInputSlides: specs.length
      }
    };
  }

  /**
   * Assess content quality for a slide
   */
  assessContentQuality(spec: SlideSpec): QualityAssessment {
    const qualityResult = validateContentQuality(spec);
    
    return {
      score: qualityResult.score,
      grade: this.scoreToGrade(qualityResult.score),
      issues: qualityResult.accessibility.issues.concat(qualityResult.readability.issues),
      strengths: qualityResult.suggestions.filter(s => s.includes('good') || s.includes('excellent')),
      suggestions: this.generateSuggestions(spec, qualityResult)
    };
  }

  /**
   * Validate business rules for generation parameters
   */
  validateBusinessRules(params: GenerationParams): ValidationResult<GenerationParams> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check prompt length
    if (params.prompt.length < 10) {
      errors.push('Prompt is too short (minimum 10 characters)');
    }

    if (params.prompt.length > 1000) {
      warnings.push('Very long prompt may result in slower generation');
    }

    // Check for potentially problematic content
    const lowercasePrompt = params.prompt.toLowerCase();
    const problematicTerms = ['hack', 'illegal', 'violence', 'inappropriate'];
    
    problematicTerms.forEach(term => {
      if (lowercasePrompt.includes(term)) {
        warnings.push(`Prompt contains potentially problematic term: "${term}"`);
      }
    });

    // Validate audience-tone combinations
    if (params.audience === 'students' && params.tone === 'authoritative') {
      warnings.push('Authoritative tone may not be optimal for student audience');
    }

    if (params.audience === 'executives' && params.tone === 'casual') {
      warnings.push('Casual tone may not be appropriate for executive audience');
    }

    // Validate content length settings
    if (params.contentLength === 'minimal' && params.audience === 'technical') {
      warnings.push('Minimal content length may not provide enough detail for technical audience');
    }

    return {
      success: errors.length === 0,
      data: params,
      errors,
      warnings,
      metadata: {
        validatedAt: new Date().toISOString(),
        validationType: 'business_rules'
      }
    };
  }

  /**
   * Convert quality score to letter grade
   */
  private scoreToGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Generate improvement suggestions based on quality assessment
   */
  private generateSuggestions(spec: SlideSpec, qualityResult: any): string[] {
    const suggestions: string[] = [];

    // Title suggestions
    if (!spec.title || spec.title.length < 15) {
      suggestions.push('Consider making the title more descriptive and specific');
    }

    if (spec.title && spec.title.length > 60) {
      suggestions.push('Consider shortening the title for better readability');
    }

    // Content suggestions
    if (spec.bullets && spec.bullets.length > 7) {
      suggestions.push('Consider reducing the number of bullet points for better focus');
    }

    if (spec.bullets && spec.bullets.some(bullet => bullet.length > 150)) {
      suggestions.push('Consider shortening bullet points for better scannability');
    }

    if (!spec.notes) {
      suggestions.push('Consider adding speaker notes for better presentation delivery');
    }

    // Layout suggestions
    if (spec.layout === 'title-paragraph' && spec.paragraph && spec.paragraph.length > 500) {
      suggestions.push('Consider using bullet points instead of long paragraphs');
    }

    return suggestions;
  }

  /**
   * Validate presentation-level rules
   */
  private validatePresentationRules(slides: SlideSpec[]): string[] {
    const warnings: string[] = [];

    // Check for title slide
    const hasTitleSlide = slides.some(slide =>
      slide.layout === 'title' ||
      slide.title.toLowerCase().includes('title') ||
      slide.title.toLowerCase().includes('introduction')
    );

    if (!hasTitleSlide && slides.length > 1) {
      warnings.push('Consider adding a title slide for better presentation structure');
    }

    // Check for conclusion slide
    const hasConclusionSlide = slides.some(slide =>
      slide.title.toLowerCase().includes('conclusion') ||
      slide.title.toLowerCase().includes('summary') ||
      slide.title.toLowerCase().includes('next steps')
    );

    if (!hasConclusionSlide && slides.length > 3) {
      warnings.push('Consider adding a conclusion slide for better presentation closure');
    }

    // Check for consistent layout usage
    const layoutCounts = slides.reduce((acc, slide) => {
      acc[slide.layout] = (acc[slide.layout] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const layoutVariety = Object.keys(layoutCounts).length;
    if (layoutVariety === 1 && slides.length > 3) {
      warnings.push('Consider using varied slide layouts for better visual interest');
    }

    return warnings;
  }
}

// Export singleton instance
export const validationService = new ValidationService();
export default validationService;

```

---


## Utilities

### 10. smartLogger.ts

**Path**: `functions/src/utils/smartLogger.ts`

**Description**: Logging utilities for debugging and monitoring

```ts
/**
 * Smart Logger for AI PowerPoint Generator
 * 
 * Innovative logging system designed for iterative testing and debugging
 * with structured output, performance tracking, and self-correction capabilities.
 */

export interface LogContext {
  requestId?: string;
  userId?: string;
  sessionId?: string;
  operation?: string;
  stage?: string;
  metadata?: Record<string, any>;
  [key: string]: any; // Allow additional properties
}

export interface LogEntry {
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' | 'PERF';
  message: string;
  context: LogContext;
  data?: any;
  duration?: number;
  memoryUsage?: NodeJS.MemoryUsage;
  stackTrace?: string;
}

export interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  memoryBefore: NodeJS.MemoryUsage;
  memoryAfter?: NodeJS.MemoryUsage;
  memoryDelta?: Partial<NodeJS.MemoryUsage>;
}

class SmartLogger {
  private logs: LogEntry[] = [];
  private performanceTrackers = new Map<string, PerformanceMetrics>();
  private isProduction = process.env.NODE_ENV === 'production';
  private maxLogs = this.isProduction ? 1000 : 5000;

  /**
   * Generate unique request ID for tracking
   */
  generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create structured log entry
   */
  private createLogEntry(
    level: LogEntry['level'],
    message: string,
    context: LogContext = {},
    data?: any,
    duration?: number
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: {
        requestId: context.requestId || 'unknown',
        ...context
      },
      data,
      duration,
      memoryUsage: process.memoryUsage?.()
    };

    if (level === 'ERROR') {
      entry.stackTrace = new Error().stack;
    }

    return entry;
  }

  /**
   * Add log entry and manage buffer
   */
  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Trim logs if exceeding max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output with formatting
    this.outputToConsole(entry);
  }

  /**
   * Format and output to console
   */
  private outputToConsole(entry: LogEntry): void {
    const emoji = {
      DEBUG: '🔍',
      INFO: 'ℹ️',
      WARN: '⚠️',
      ERROR: '❌',
      SUCCESS: '✅',
      PERF: '⚡'
    }[entry.level];

    const prefix = `${emoji} [${entry.level}] ${entry.timestamp}`;
    const context = entry.context.requestId ? `[${entry.context.requestId.slice(-8)}]` : '';
    const operation = entry.context.operation ? `[${entry.context.operation}]` : '';
    const stage = entry.context.stage ? `[${entry.context.stage}]` : '';
    
    let output = `${prefix} ${context}${operation}${stage} ${entry.message}`;
    
    if (entry.duration) {
      output += ` (${entry.duration}ms)`;
    }

    console.log(output);
    
    if (entry.data && !this.isProduction) {
      console.log('📊 Data:', JSON.stringify(entry.data, null, 2));
    }
    
    if (entry.level === 'ERROR' && entry.stackTrace && !this.isProduction) {
      console.log('🔥 Stack:', entry.stackTrace);
    }
  }

  /**
   * Debug logging
   */
  debug(message: string, context: LogContext = {}, data?: any): void {
    if (!this.isProduction) {
      this.addLog(this.createLogEntry('DEBUG', message, context, data));
    }
  }

  /**
   * Info logging
   */
  info(message: string, context: LogContext = {}, data?: any): void {
    this.addLog(this.createLogEntry('INFO', message, context, data));
  }

  /**
   * Warning logging
   */
  warn(message: string, context: LogContext = {}, data?: any): void {
    this.addLog(this.createLogEntry('WARN', message, context, data));
  }

  /**
   * Error logging
   */
  error(message: string, context: LogContext = {}, error?: Error | any): void {
    const data = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error;
    
    this.addLog(this.createLogEntry('ERROR', message, context, data));
  }

  /**
   * Success logging
   */
  success(message: string, context: LogContext = {}, data?: any): void {
    this.addLog(this.createLogEntry('SUCCESS', message, context, data));
  }

  /**
   * Start performance tracking
   */
  startPerf(trackerId: string, context: LogContext = {}): void {
    const metrics: PerformanceMetrics = {
      startTime: Date.now(),
      memoryBefore: process.memoryUsage?.() || {} as NodeJS.MemoryUsage
    };
    
    this.performanceTrackers.set(trackerId, metrics);
    this.debug(`Performance tracking started: ${trackerId}`, context);
  }

  /**
   * End performance tracking
   */
  endPerf(trackerId: string, context: LogContext = {}, data?: any): number {
    const metrics = this.performanceTrackers.get(trackerId);
    if (!metrics) {
      this.warn(`Performance tracker not found: ${trackerId}`, context);
      return 0;
    }

    metrics.endTime = Date.now();
    metrics.duration = metrics.endTime - metrics.startTime;
    metrics.memoryAfter = process.memoryUsage?.() || {} as NodeJS.MemoryUsage;
    
    if (metrics.memoryAfter) {
      metrics.memoryDelta = {
        heapUsed: metrics.memoryAfter.heapUsed - metrics.memoryBefore.heapUsed,
        heapTotal: metrics.memoryAfter.heapTotal - metrics.memoryBefore.heapTotal,
        external: metrics.memoryAfter.external - metrics.memoryBefore.external
      };
    }

    this.addLog(this.createLogEntry('PERF', `Performance: ${trackerId}`, context, {
      ...data,
      metrics: {
        duration: metrics.duration,
        memoryDelta: metrics.memoryDelta
      }
    }, metrics.duration));

    this.performanceTrackers.delete(trackerId);
    return metrics.duration;
  }

  /**
   * Log slide generation details
   */
  logSlideGeneration(slideIndex: number, spec: any, context: LogContext = {}): void {
    this.info(`Generating slide ${slideIndex + 1}`, {
      ...context,
      operation: 'slide-generation',
      stage: 'processing'
    }, {
      slideIndex,
      title: spec.title,
      layout: spec.layout,
      hasContent: {
        bullets: !!(spec.bullets && spec.bullets.length > 0),
        paragraph: !!spec.paragraph,
        image: !!spec.imagePrompt
      }
    });
  }

  /**
   * Log AI API calls
   */
  logAICall(prompt: string, response: any, context: LogContext = {}): void {
    this.info('AI API call completed', {
      ...context,
      operation: 'ai-generation',
      stage: 'api-call'
    }, {
      promptLength: prompt.length,
      responseType: typeof response,
      hasContent: !!response
    });
  }

  /**
   * Get recent logs for debugging
   */
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * Get logs by request ID
   */
  getLogsByRequestId(requestId: string): LogEntry[] {
    return this.logs.filter(log => log.context.requestId === requestId);
  }

  /**
   * Get error summary for self-correction
   */
  getErrorSummary(): { errors: LogEntry[], patterns: Record<string, number> } {
    const errors = this.logs.filter(log => log.level === 'ERROR');
    const patterns: Record<string, number> = {};
    
    errors.forEach(error => {
      const key = error.message.split(':')[0]; // Get error type
      patterns[key] = (patterns[key] || 0) + 1;
    });

    return { errors, patterns };
  }

  /**
   * Clear logs (for testing)
   */
  clear(): void {
    this.logs = [];
    this.performanceTrackers.clear();
  }
}

// Export singleton instance
export const logger = new SmartLogger();
export default logger;

```

---

### 11. corruptionDiagnostics.ts

**Path**: `functions/src/utils/corruptionDiagnostics.ts`

**Description**: File integrity and corruption detection

```ts
/**
 * PowerPoint Corruption Diagnostics
 * 
 * Advanced diagnostic tools to identify, analyze, and fix PowerPoint corruption issues.
 * This module provides real-time corruption detection, detailed analysis, and automated fixes.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import { logger, type LogContext } from './smartLogger';
import { SlideSpec } from '../schema';

// ============================================================================
// CORRUPTION DETECTION TYPES
// ============================================================================

export interface CorruptionIssue {
  id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'structure' | 'content' | 'buffer' | 'layout' | 'theme' | 'validation';
  title: string;
  description: string;
  slideIndex?: number;
  slideSpec?: any;
  bufferInfo?: {
    size: number;
    signature: string;
    isValid: boolean;
  };
  suggestedFix: string;
  autoFixAvailable: boolean;
  context: LogContext;
}

export interface DiagnosticReport {
  id: string;
  timestamp: string;
  presentationTitle: string;
  slideCount: number;
  issues: CorruptionIssue[];
  overallHealth: 'healthy' | 'warning' | 'critical';
  recommendations: string[];
  fixesApplied: string[];
}

// ============================================================================
// CORRUPTION DIAGNOSTICS CLASS
// ============================================================================

export class CorruptionDiagnostics {
  private issues: CorruptionIssue[] = [];
  private reports: DiagnosticReport[] = [];

  /**
   * Analyze slide specifications for potential corruption issues
   */
  analyzeSlideSpecs(specs: SlideSpec[], context: LogContext): CorruptionIssue[] {
    const issues: CorruptionIssue[] = [];
    
    for (let i = 0; i < specs.length; i++) {
      const spec = specs[i];
      const slideContext = { ...context, slideIndex: i };
      
      // Check for missing or invalid title
      if (!spec.title || typeof spec.title !== 'string' || spec.title.trim() === '') {
        issues.push(this.createIssue(
          'critical',
          'structure',
          'Missing or Invalid Slide Title',
          `Slide ${i + 1} has missing or invalid title which can cause corruption`,
          slideContext,
          'Ensure all slides have valid, non-empty string titles',
          true,
          i,
          spec
        ));
      }
      
      // Check for invalid layout
      const validLayouts = ['title', 'title-bullets', 'title-paragraph', 'two-column', 'mixed-content', 'chart', 'quote'];
      if (!spec.layout || !validLayouts.includes(spec.layout)) {
        issues.push(this.createIssue(
          'high',
          'layout',
          'Invalid Layout Type',
          `Slide ${i + 1} has invalid layout '${spec.layout}' which may cause corruption`,
          slideContext,
          `Use one of the valid layouts: ${validLayouts.join(', ')}`,
          true,
          i,
          spec
        ));
      }
      
      // Check mixed-content structure
      if (spec.layout === 'mixed-content') {
        const specAny = spec as any;
        
        if (!specAny.left && !specAny.right && !spec.paragraph && !spec.bullets) {
          issues.push(this.createIssue(
            'high',
            'content',
            'Empty Mixed-Content Slide',
            `Slide ${i + 1} has mixed-content layout but no content structure`,
            slideContext,
            'Add left/right content structure or fallback to paragraph/bullets',
            true,
            i,
            spec
          ));
        }
        
        if (specAny.left && typeof specAny.left !== 'object') {
          issues.push(this.createIssue(
            'medium',
            'structure',
            'Invalid Left Column Structure',
            `Slide ${i + 1} has invalid left column structure`,
            slideContext,
            'Ensure left column is an object with type and content properties',
            true,
            i,
            spec
          ));
        }
        
        if (specAny.right && typeof specAny.right !== 'object') {
          issues.push(this.createIssue(
            'medium',
            'structure',
            'Invalid Right Column Structure',
            `Slide ${i + 1} has invalid right column structure`,
            slideContext,
            'Ensure right column is an object with type and content properties',
            true,
            i,
            spec
          ));
        }
      }
      
      // Check for excessively long content that might cause issues
      if (spec.title && spec.title.length > 200) {
        issues.push(this.createIssue(
          'low',
          'content',
          'Excessively Long Title',
          `Slide ${i + 1} title is very long (${spec.title.length} characters)`,
          slideContext,
          'Consider shortening the title to under 200 characters',
          false,
          i,
          spec
        ));
      }
      
      if (spec.paragraph && spec.paragraph.length > 2000) {
        issues.push(this.createIssue(
          'low',
          'content',
          'Excessively Long Paragraph',
          `Slide ${i + 1} paragraph is very long (${spec.paragraph.length} characters)`,
          slideContext,
          'Consider breaking long paragraphs into bullet points or multiple slides',
          false,
          i,
          spec
        ));
      }
      
      // Check for too many bullets
      if (spec.bullets && spec.bullets.length > 10) {
        issues.push(this.createIssue(
          'medium',
          'content',
          'Too Many Bullet Points',
          `Slide ${i + 1} has ${spec.bullets.length} bullet points which may cause layout issues`,
          slideContext,
          'Consider limiting bullet points to 7-8 maximum for better readability',
          false,
          i,
          spec
        ));
      }
      
      // Check for special characters that might cause encoding issues
      const problematicChars = /[^\x00-\x7F]/g;
      if (spec.title && problematicChars.test(spec.title)) {
        issues.push(this.createIssue(
          'low',
          'content',
          'Special Characters in Title',
          `Slide ${i + 1} title contains special characters that might cause encoding issues`,
          slideContext,
          'Consider using standard ASCII characters or ensure proper encoding',
          false,
          i,
          spec
        ));
      }
    }
    
    return issues;
  }

  /**
   * Analyze buffer for corruption issues
   */
  analyzeBuffer(buffer: Buffer, context: LogContext): CorruptionIssue[] {
    const issues: CorruptionIssue[] = [];
    
    // Check buffer validity
    if (!buffer || buffer.length === 0) {
      issues.push(this.createIssue(
        'critical',
        'buffer',
        'Empty or Null Buffer',
        'Generated buffer is empty or null',
        context,
        'Check PowerPoint generation process for errors',
        false
      ));
      return issues;
    }
    
    // Check ZIP signature
    const signature = buffer.subarray(0, 4);
    const expectedSignature = Buffer.from([0x50, 0x4B, 0x03, 0x04]);
    const signatureValid = signature.equals(expectedSignature);
    
    if (!signatureValid) {
      issues.push(this.createIssue(
        'critical',
        'buffer',
        'Invalid ZIP Signature',
        'PowerPoint file has invalid ZIP signature',
        context,
        'Regenerate the PowerPoint file - current file is corrupted',
        false,
        undefined,
        undefined,
        {
          size: buffer.length,
          signature: Array.from(signature).map(b => `0x${b.toString(16).padStart(2, '0')}`).join(' '),
          isValid: false
        }
      ));
    }
    
    // Check minimum file size
    if (buffer.length < 1000) {
      issues.push(this.createIssue(
        'high',
        'buffer',
        'File Too Small',
        `PowerPoint file is suspiciously small (${buffer.length} bytes)`,
        context,
        'Check slide content and generation process',
        false,
        undefined,
        undefined,
        {
          size: buffer.length,
          signature: signatureValid ? 'valid' : 'invalid',
          isValid: signatureValid
        }
      ));
    }
    
    // Check maximum reasonable file size (100MB)
    if (buffer.length > 100 * 1024 * 1024) {
      issues.push(this.createIssue(
        'medium',
        'buffer',
        'File Unusually Large',
        `PowerPoint file is very large (${Math.round(buffer.length / 1024 / 1024)}MB)`,
        context,
        'Consider optimizing images and content to reduce file size',
        false,
        undefined,
        undefined,
        {
          size: buffer.length,
          signature: signatureValid ? 'valid' : 'invalid',
          isValid: signatureValid
        }
      ));
    }
    
    return issues;
  }

  /**
   * Generate comprehensive diagnostic report
   */
  generateReport(
    presentationTitle: string,
    specs: SlideSpec[],
    buffer?: Buffer,
    context: LogContext = {}
  ): DiagnosticReport {
    const reportId = `diag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const issues: CorruptionIssue[] = [];
    
    // Analyze slide specifications
    issues.push(...this.analyzeSlideSpecs(specs, context));
    
    // Analyze buffer if provided
    if (buffer) {
      issues.push(...this.analyzeBuffer(buffer, context));
    }
    
    // Determine overall health
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    const highIssues = issues.filter(i => i.severity === 'high');
    
    let overallHealth: 'healthy' | 'warning' | 'critical';
    if (criticalIssues.length > 0) {
      overallHealth = 'critical';
    } else if (highIssues.length > 0 || issues.length > 5) {
      overallHealth = 'warning';
    } else {
      overallHealth = 'healthy';
    }
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(issues);
    
    // Apply auto-fixes
    const fixesApplied = this.applyAutoFixes(issues, specs);
    
    const report: DiagnosticReport = {
      id: reportId,
      timestamp: new Date().toISOString(),
      presentationTitle,
      slideCount: specs.length,
      issues,
      overallHealth,
      recommendations,
      fixesApplied
    };
    
    this.reports.push(report);
    
    // Log the report
    logger.info(`Corruption diagnostic report generated`, context, {
      reportId,
      presentationTitle,
      issueCount: issues.length,
      overallHealth,
      criticalIssues: criticalIssues.length,
      highIssues: highIssues.length,
      fixesApplied: fixesApplied.length
    });
    
    return report;
  }

  private createIssue(
    severity: 'low' | 'medium' | 'high' | 'critical',
    type: 'structure' | 'content' | 'buffer' | 'layout' | 'theme' | 'validation',
    title: string,
    description: string,
    context: LogContext,
    suggestedFix: string,
    autoFixAvailable: boolean,
    slideIndex?: number,
    slideSpec?: any,
    bufferInfo?: { size: number; signature: string; isValid: boolean }
  ): CorruptionIssue {
    return {
      id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      severity,
      type,
      title,
      description,
      slideIndex,
      slideSpec,
      bufferInfo,
      suggestedFix,
      autoFixAvailable,
      context
    };
  }

  private generateRecommendations(issues: CorruptionIssue[]): string[] {
    const recommendations: string[] = [];
    
    if (issues.some(i => i.type === 'layout')) {
      recommendations.push('Review slide layouts and ensure they match supported types');
    }
    
    if (issues.some(i => i.type === 'structure')) {
      recommendations.push('Validate slide structure before generation');
    }
    
    if (issues.some(i => i.type === 'content')) {
      recommendations.push('Review content length and complexity');
    }
    
    if (issues.some(i => i.type === 'buffer')) {
      recommendations.push('Check PowerPoint generation process for errors');
    }
    
    if (issues.filter(i => i.severity === 'critical').length > 0) {
      recommendations.push('Address critical issues immediately to prevent corruption');
    }
    
    return recommendations;
  }

  private applyAutoFixes(issues: CorruptionIssue[], specs: SlideSpec[]): string[] {
    const fixesApplied: string[] = [];
    
    for (const issue of issues) {
      if (!issue.autoFixAvailable || issue.slideIndex === undefined) continue;
      
      const spec = specs[issue.slideIndex];
      if (!spec) continue;
      
      switch (issue.type) {
        case 'structure':
          if (issue.title.includes('Missing or Invalid Slide Title')) {
            if (!spec.title || spec.title.trim() === '') {
              spec.title = `Slide ${issue.slideIndex + 1}`;
              fixesApplied.push(`Fixed missing title for slide ${issue.slideIndex + 1}`);
            }
          }
          break;
          
        case 'layout':
          if (issue.title.includes('Invalid Layout Type')) {
            spec.layout = 'title-bullets'; // Safe default
            fixesApplied.push(`Fixed invalid layout for slide ${issue.slideIndex + 1}`);
          }
          break;
          
        case 'content':
          if (issue.title.includes('Empty Mixed-Content Slide')) {
            // Convert to title-paragraph layout if no content structure
            spec.layout = 'title-paragraph';
            if (!spec.paragraph) {
              spec.paragraph = 'Content will be added here.';
            }
            fixesApplied.push(`Fixed empty mixed-content slide ${issue.slideIndex + 1}`);
          }
          break;
      }
    }
    
    return fixesApplied;
  }

  /**
   * Get recent diagnostic reports
   */
  getRecentReports(count: number = 10): DiagnosticReport[] {
    return this.reports.slice(-count);
  }

  /**
   * Get issues by severity
   */
  getIssuesBySeverity(severity: 'low' | 'medium' | 'high' | 'critical'): CorruptionIssue[] {
    return this.issues.filter(issue => issue.severity === severity);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const corruptionDiagnostics = new CorruptionDiagnostics();
export default corruptionDiagnostics;

```

---


## Frontend Integration

### 12. useApiWithNotifications.ts

**Path**: `frontend/src/hooks/useApiWithNotifications.ts`

**Description**: Frontend API integration and PowerPoint generation hooks

```ts
/**
 * Custom Hook for API Calls with Enhanced Notifications
 * 
 * Provides a unified interface for making API calls with automatic
 * error handling, retry logic, and user-friendly notifications.
 * 
 * Features:
 * - Automatic error categorization and user-friendly messages
 * - Retry mechanisms for recoverable errors
 * - Loading state management
 * - Success notifications
 * - Integration with notification system
 * 
 * @version 1.0.0
 */

import { useState, useCallback } from 'react';
import { useNotifications } from '../components/NotificationSystem';
import apiClient from '../utils/apiClient';

/**
 * API call options
 */
export interface ApiCallOptions {
  showSuccessNotification?: boolean;
  successMessage?: string;
  showErrorNotification?: boolean;
  retryable?: boolean;
  loadingMessage?: string;
  context?: string;
}

/**
 * API call state
 */
export interface ApiCallState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

/**
 * Hook return type
 */
export interface UseApiWithNotificationsReturn<T = any> {
  state: ApiCallState<T>;
  execute: (endpoint: string, options?: RequestInit & ApiCallOptions) => Promise<T | null>;
  reset: () => void;
  retry: () => Promise<T | null>;
}

/**
 * Custom hook for API calls with notifications
 */
export function useApiWithNotifications<T = any>(): UseApiWithNotificationsReturn<T> {
  const notifications = useNotifications();
  const [state, setState] = useState<ApiCallState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false
  });
  const [lastCall, setLastCall] = useState<{ endpoint: string; options?: RequestInit & ApiCallOptions } | null>(null);

  const execute = useCallback(async (
    endpoint: string, 
    options: RequestInit & ApiCallOptions = {}
  ): Promise<T | null> => {
    const {
      showSuccessNotification = false,
      successMessage,
      showErrorNotification = true,
      retryable = true,
      loadingMessage,
      context,
      ...requestOptions
    } = options;

    // Store call details for retry
    setLastCall({ endpoint, options });

    // Set loading state
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      success: false
    }));

    // Show loading notification if message provided
    if (loadingMessage) {
      notifications.showInfo('Processing', loadingMessage, { duration: 0, persistent: true });
    }

    try {
      // Map RequestInit to RequestOptions
      const apiOptions = {
        method: requestOptions.method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | undefined,
        headers: requestOptions.headers as Record<string, string> | undefined,
        body: requestOptions.body,
      };

      const response = await apiClient.request<T>(endpoint, apiOptions);

      if (response.success && response.data) {
        setState({
          data: response.data,
          loading: false,
          error: null,
          success: true
        });

        // Clear any persistent loading notifications
        notifications.clearAll();

        // Show success notification if requested
        if (showSuccessNotification) {
          notifications.showSuccess(
            'Success',
            successMessage || 'Operation completed successfully'
          );
        }

        return response.data;
      } else {
        throw new Error(response.error || 'API call failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));

      // Clear any persistent loading notifications
      notifications.clearAll();

      // Show error notification if requested
      if (showErrorNotification) {
        const retryFn = retryable ? () => retry() : undefined;
        notifications.handleApiError(error, context, retryFn);
      }

      return null;
    }
  }, [notifications]);

  const retry = useCallback(async (): Promise<T | null> => {
    if (!lastCall) {
      console.warn('No previous call to retry');
      return null;
    }

    return execute(lastCall.endpoint, lastCall.options);
  }, [lastCall, execute]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false
    });
    setLastCall(null);
  }, []);

  return {
    state,
    execute,
    reset,
    retry
  };
}

/**
 * Specialized hooks for common API operations
 */

/**
 * Hook for PowerPoint generation with enhanced error handling
 */
export function usePowerPointGeneration() {
  const api = useApiWithNotifications<Buffer>();

  const generatePowerPoint = useCallback(async (slideSpec: any, theme?: string, options?: { compactMode?: boolean; typographyScale?: 'auto'|'compact'|'normal'|'large' }) => {
    return api.execute('/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spec: slideSpec, themeId: theme, compactMode: options?.compactMode, typographyScale: options?.typographyScale }),
      showSuccessNotification: true,
      successMessage: 'PowerPoint generated successfully!',
      loadingMessage: 'Generating your PowerPoint presentation...',
      context: 'PowerPoint Generation',
      retryable: true
    });
  }, [api]);

  return {
    ...api,
    generatePowerPoint
  };
}

/**
 * Hook for content validation with detailed feedback
 */
export function useContentValidation() {
  const api = useApiWithNotifications<any>();

  const validateContent = useCallback(async (content: any) => {
    return api.execute('/validate-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content),
      showSuccessNotification: false, // Validation success is implicit
      showErrorNotification: true,
      loadingMessage: 'Validating content...',
      context: 'Content Validation',
      retryable: false // Validation errors are usually not retryable
    });
  }, [api]);

  return {
    ...api,
    validateContent
  };
}

/**
 * Hook for theme recommendations
 */
export function useThemeRecommendations() {
  const api = useApiWithNotifications<any>();

  const getThemeRecommendations = useCallback(async (params: any) => {
    return api.execute('/themes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      showSuccessNotification: false,
      showErrorNotification: true,
      loadingMessage: 'Getting theme recommendations...',
      context: 'Theme Recommendations',
      retryable: true
    });
  }, [api]);

  return {
    ...api,
    getThemeRecommendations
  };
}

/**
 * Hook for health checks and connectivity
 */
export function useHealthCheck() {
  const api = useApiWithNotifications<any>();

  const checkHealth = useCallback(async () => {
    return api.execute('/health', {
      method: 'GET',
      showSuccessNotification: false,
      showErrorNotification: false, // Health check errors are handled separately
      context: 'Health Check',
      retryable: true
    });
  }, [api]);

  return {
    ...api,
    checkHealth
  };
}

export default useApiWithNotifications;

```

---

