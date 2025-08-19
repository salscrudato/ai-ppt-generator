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
 * @version 4.0.0-enhanced
 * @author AI PowerPoint Generator Team
 */

import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import compression from "compression";
import { apiKeyValidator } from "./config/apiKeyValidator";

// Import enhanced core modules with error types
import {
  AIGenerationError,
  ValidationError,
  TimeoutError,
  RateLimitError,
  ContentFilterError,
  NetworkError
} from "./llm";
import { PROFESSIONAL_THEMES, selectThemeForContent } from "./professionalThemes";
import { logger } from "./utils/smartLogger";
import { generatePpt } from "./pptGenerator-simple";

// Import new modular services
import { aiService } from "./services/aiService";
// Removed validation service - simplified codebase
import { type SlideSpec, safeValidateSlideSpec } from "./schema";

/* ============================================================================
 * CONFIGURATION & TYPE DEFINITIONS
 * ============================================================================
 *
 * This section contains all configuration constants, type definitions, and
 * interfaces used throughout the application. It includes:
 * - Admin authentication keys
 * - Production configuration settings
 * - Performance monitoring types
 * - Security and CORS configuration
 * ============================================================================ */

const ADMIN_KEYS = {
  configCheck: process.env.ADMIN_CONFIG_KEY || "config-check-2024",
  metrics: process.env.METRICS_ADMIN_KEY || "secret"
} as const;

// Production-ready configuration constants
const CONFIG = {
  maxInstances: 20,
  requestSizeLimit: "20mb",
  timeout: 540,
  memory: "2GiB" as const,
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: "Too many requests from this IP, please try again later.",
      retryAfter: "15 minutes"
    },
    // Skip rate limiting in Firebase Functions environment
    skip: (req: any) => {
      // Skip if in development or if running in Firebase Functions
      return (
        process.env.NODE_ENV === "development" ||
        process.env.FUNCTIONS_EMULATOR === "true" ||
        !req.ip
      );
    },
    // Custom key generator for Firebase Functions
    keyGenerator: (req: any) => {
      return (
        req.ip ||
        req.headers["x-forwarded-for"] ||
        (req.connection?.remoteAddress as string | undefined) ||
        "unknown"
      );
    }
  },
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-domain.com", "https://ai-ppt-gen.web.app"]
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
type Grade = "A" | "B" | "C" | "D" | "F";

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
  averageGrade?: Grade;
  qualityScore?: number;
  qualityGrade?: Grade;
  memoryMB?: number;
}

const performanceMetrics: PerformanceMetrics[] = [];

// Simple in-memory cache
const cache = new Map<string, any>();

/* ============================================================================
 * PERFORMANCE MONITORING & UTILITIES
 * ============================================================================
 *
 * This section provides comprehensive performance monitoring capabilities:
 * - Request/response timing measurement
 * - Memory usage tracking
 * - Error classification and reporting
 * - Quality metrics collection
 * - Cache management utilities
 * ============================================================================ */

function startPerformanceTracking(endpoint: string, req: Request): PerformanceMetrics {
  const existingId = (req as any).requestId as string | undefined;
  const metric: PerformanceMetrics = {
    requestId:
      existingId || `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    endpoint,
    startTime: Date.now(),
    success: false,
    userAgent: req.headers["user-agent"],
    contentLength: req.headers["content-length"]
      ? parseInt(String(req.headers["content-length"]))
      : undefined
  };

  performanceMetrics.push(metric);
  return metric;
}

function endPerformanceTracking(
  metric: PerformanceMetrics,
  success: boolean,
  errorType?: string,
  extra?: Partial<PerformanceMetrics>
): void {
  metric.endTime = Date.now();
  metric.duration = metric.endTime - metric.startTime;
  metric.success = success;
  metric.errorType = errorType;
  // lightweight memory usage snapshot
  try {
    const heapUsed = (process as any)?.memoryUsage?.().heapUsed;
    if (typeof heapUsed === "number") {
      metric.memoryMB = Math.round(heapUsed / 1_000_000);
    }
  } catch {
    // ignore memory sampling failures
  }
  Object.assign(metric, extra);

  logger.info("Performance metric", metric);

  if (performanceMetrics.length > 1000) {
    performanceMetrics.splice(0, performanceMetrics.length - 1000);
  }
}

// Helper function for grade calculation
function getMostCommonGrade(grades: Grade[]): Grade {
  const counts = grades.reduce((acc, grade) => {
    acc[grade] = (acc[grade] || 0) + 1;
    return acc;
  }, {} as Record<Grade, number>);

  return (Object.entries(counts).reduce((a, b) =>
    counts[a[0] as Grade] > counts[b[0] as Grade] ? a : b
  )[0] || "A") as Grade;
}

// Define the OpenAI API key secret
const openaiApiKey = defineSecret("OPENAI_API_KEY");

// Configure Firebase Functions for optimal performance
setGlobalOptions({ maxInstances: CONFIG.maxInstances });

// Create Express application with production-ready middleware
const app = express();

// Harden Express
app.disable("x-powered-by");
app.set("trust proxy", 1); // accurate req.ip behind Google Front End (GFE)

/* --------------------------- Security & Performance ----------------------- */

app.use(
  compression({
    level: 6,
    threshold: 1024,
    filter: (req: any, res: any) => {
      if (req.headers["x-no-compression"]) return false;
      return compression.filter(req, res);
    }
  })
);

app.use(
  helmet({
    contentSecurityPolicy: CONFIG.security.contentSecurityPolicy,
    hsts: CONFIG.security.hsts,
    crossOriginEmbedderPolicy: false, // Allow embedding for iframe usage
    referrerPolicy: { policy: "no-referrer" },
    xssFilter: true
  }) as any
);

app.use(cors(CONFIG.cors));

// Request correlation (accept or assign X-Request-Id)
app.use((req: Request, res: Response, next: NextFunction) => {
  const incoming = String(req.headers["x-request-id"] || "") || undefined;
  const requestId = incoming || logger.generateRequestId();
  (req as any).requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
});

// Rate limiting (disabled in Firebase Functions environment due to IP detection issues)
if (process.env.NODE_ENV === "production" && !process.env.FUNCTIONS_EMULATOR) {
  app.use(rateLimit(CONFIG.rateLimit));
}

// Enforce JSON for mutating requests
app.use((req: Request, res: Response, next: NextFunction): void => {
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    const ct = String(req.headers["content-type"] || "");
    if (!ct.includes("application/json")) {
      res.status(415).json({
        error: "Content-Type must be application/json",
        code: "UNSUPPORTED_MEDIA_TYPE"
      });
      return;
    }
  }
  next();
});

// Body parsing with size limits
app.use(
  express.json({
    limit: CONFIG.requestSizeLimit,
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    }
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: CONFIG.requestSizeLimit
  })
);

// Handle malformed JSON early
app.use(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (err: any, req: Request, res: Response, _next: NextFunction) => {
    if (err && err instanceof SyntaxError && "body" in err) {
      return res.status(400).json({
        error: "Malformed JSON in request body",
        code: "INVALID_JSON",
        requestId: (req as any).requestId
      });
    }
    return res.status(500).json({
      error: "Unhandled error during request parsing",
      code: "REQUEST_PARSING_ERROR",
      requestId: (req as any).requestId
    });
  }
);

// Environment setup middleware (make secret available at runtime)
app.use((_req, _res, next) => {
  if (!process.env.OPENAI_API_KEY && openaiApiKey.value()) {
    process.env.OPENAI_API_KEY = openaiApiKey.value();
  }
  next();
});

/* -------------------------------------------------------------------------- */
/*                                   ROUTES                                    */
/* -------------------------------------------------------------------------- */

/**
 * Enhanced health check endpoint with comprehensive system validation
 */
app.get("/health", async (_req, res) => {
  const healthCheck = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "4.0.0-enhanced",
    service: "AI PowerPoint Generator - Enhanced",
    environment: process.env.NODE_ENV || "development",
    apiKeyStatus: "unknown",
    systemChecks: {
      openai: false,
      pptxGeneration: false,
      memory: false,
      themes: false
    }
  };

  // Perform runtime API key validation and expose diagnostics
  try {
    const validation = apiKeyValidator.validateConfiguration();
    healthCheck.apiKeyStatus = validation.isValid ? "configured" : "missing";
    healthCheck.systemChecks.openai = validation.isValid;

    (healthCheck as any).openaiDiagnostics = validation;

    if (!validation.isValid) {
      logger.warn("⚠️ OpenAI API key not properly configured", {
        source: validation.source,
        environment: validation.environment
      });
    }
  } catch (error) {
    logger.error("API key validation error:", {}, error as Error);
    healthCheck.apiKeyStatus = "error";
  }

  // Check memory usage
  try {
    const memUsage = process.memoryUsage();
    healthCheck.systemChecks.memory = memUsage.heapUsed < 500 * 1024 * 1024; // 500MB threshold
  } catch (error) {
    logger.warn("Memory check failed:", {}, error as Error);
  }

  // Test PowerPoint generation capability
  try {
    // Quick test to ensure PptxGenJS is working
    const PptxGenJS = require('pptxgenjs');
    const testPres = new PptxGenJS();
    healthCheck.systemChecks.pptxGeneration = true;
  } catch (error) {
    logger.error("PowerPoint generation test failed:", {}, error as Error);
  }

  // Determine overall health status
  const allChecksPass = Object.values(healthCheck.systemChecks).every(check => check);
  if (!allChecksPass) {
    healthCheck.status = "degraded";
  }

  const statusCode = healthCheck.status === "healthy" ? 200 : 503;

  return res.status(statusCode).json({
    ...healthCheck,
    uptimeSec: Math.round(process.uptime()),
    memoryMB: Math.round(process.memoryUsage().heapUsed / 1_000_000)
  });
});

/**
 * Configuration status endpoint (admin only)
 */
app.get("/config/status", (req, res) => {
  const keyFromQuery = req.query.adminKey as string | undefined;
  const keyFromHeader = (req.headers["x-admin-key"] as string | undefined) || undefined;
  if (keyFromQuery !== ADMIN_KEYS.configCheck && keyFromHeader !== ADMIN_KEYS.configCheck) {
    return res.status(403).json({ error: "Unauthorized" });
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
    logger.error("Configuration status check failed:", {}, error as Error);
    return res.status(500).json({
      error: "Configuration check failed",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * API key test endpoint (admin only)
 */
app.post("/config/test-api-key", async (req, res) => {
  const keyFromQuery = req.query.adminKey as string | undefined;
  const keyFromHeader = (req.headers["x-admin-key"] as string | undefined) || undefined;
  if (keyFromQuery !== ADMIN_KEYS.configCheck && keyFromHeader !== ADMIN_KEYS.configCheck) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const testResult = await apiKeyValidator.testAPIKey();

    return res.json({
      ...testResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error("API key test failed:", {}, error as Error);
    return res.status(500).json({
      error: "API key test failed",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Themes recommendation endpoint
 */
app.post("/themes", (req, res) => {
  const cacheKey = JSON.stringify(req.body);
  if (cache.has(cacheKey)) {
    return res.json(cache.get(cacheKey));
  }

  // Simple theme recommendation based on content type
  const { tone, audience } = req.body as { tone?: string; audience?: string };
  const recommendations: string[] = [];

  if (tone === "professional" || audience === "executives") {
    recommendations.push("corporate-blue", "finance-navy", "consulting-charcoal");
  } else if (tone === "creative") {
    recommendations.push("creative-purple", "marketing-magenta", "vibrant-coral");
  } else if (audience === "students") {
    recommendations.push("education-green", "academic-indigo");
  } else {
    recommendations.push("modern-slate", "corporate-blue", "creative-purple");
  }

  cache.set(cacheKey, recommendations);
  return res.json(recommendations);
});

/**
 * Theme presets endpoint: return full theme catalog with metadata
 */
app.get("/theme-presets", (_req, res) => {
  const themes = PROFESSIONAL_THEMES.map((t) => ({
    id: t.id,
    name: t.name,
    category: t.category,
    // backend theme type has no description; send empty string for compatibility
    description: "",
    colors: t.colors,
    typography: t.typography,
    effects: t.effects,
    spacing: t.spacing
  }));

  // Cache aggressively — static catalog
  res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400, immutable");

  return res.json({ themes, count: themes.length });
});

/**
 * Metrics endpoint (secured)
 */
app.get("/metrics", (req, res) => {
  const keyFromQuery = req.query.adminKey as string | undefined;
  const keyFromHeader = (req.headers["x-admin-key"] as string | undefined) || undefined;
  if (keyFromQuery !== ADMIN_KEYS.metrics && keyFromHeader !== ADMIN_KEYS.metrics) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  return res.json(performanceMetrics.slice(-100));
});

/**
 * Draft generation endpoint - Generate slide content from user parameters
 * Enhanced with better error handling and performance monitoring
 */
app.post("/draft", async (req, res) => {
  const performanceMetric = startPerformanceTracking("/draft", req);

  try {
    logger.info("Draft generation request", {
      prompt: (req.body.prompt as string | undefined)?.substring(0, 100),
      audience: req.body.audience,
      tone: req.body.tone,
      contentLength: req.body.contentLength,
      withImage: req.body.withImage,
      timestamp: new Date().toISOString()
    });

    // Simple parameter validation
    if (!req.body.prompt || typeof req.body.prompt !== 'string') {
      logger.warn("Invalid generation parameters: missing prompt");
      endPerformanceTracking(performanceMetric, false, "INVALID_PARAMS_ERROR");
      return res.status(400).json({
        error: "Invalid generation parameters: prompt is required",
        code: "INVALID_PARAMS_ERROR"
      });
    }

    // Use the AI service to generate slide content
    const slideSpec = await aiService.generateSlideContent(req.body);

    // Simple content validation
    if (!slideSpec || !Array.isArray(slideSpec) || slideSpec.length === 0) {
      logger.warn("Generated content failed validation: no slides generated");
      endPerformanceTracking(performanceMetric, false, "CONTENT_VALIDATION_ERROR");
      return res.status(422).json({
        error: "Generated content failed validation: no slides generated",
        code: "CONTENT_VALIDATION_ERROR"
      });
    }

    endPerformanceTracking(performanceMetric, true);

    return res.json({
      spec: slideSpec,
      quality: {
        score: 85,
        grade: 'B',
        issues: [],
        strengths: ['AI-generated content'],
        suggestions: []
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    let status = 500;
    let code = "DRAFT_GENERATION_ERROR";
    let message = "Failed to generate slide draft. Please try again.";

    if (error instanceof AIGenerationError) {
      status = 503;
      code = "AI_SERVICE_ERROR";
      message = "AI service temporarily unavailable. Please try again in a moment.";
      logger.error("AI service error during draft generation", {
        message: error.message,
        step: error.step,
        attempt: error.attempt
      });
    } else if (error instanceof ValidationError) {
      status = 422;
      code = "CONTENT_VALIDATION_ERROR";
      message = "Generated content failed validation. Please try different parameters.";
      logger.error("Content validation failed during draft generation", {
        message: error.message,
        validationErrors: (error as ValidationError).validationErrors
      });
    } else if (error instanceof TimeoutError) {
      status = 504;
      code = "TIMEOUT_ERROR";
      message = "Request timed out. Please try again.";
      logger.error("Timeout during draft generation", {
        message: error.message,
        timeoutMs: (error as TimeoutError).timeoutMs
      });
    } else if (error instanceof RateLimitError) {
      status = 429;
      code = "RATE_LIMIT_ERROR";
      message = error.message;
      logger.warn("Rate limit exceeded during draft generation", {
        message: error.message,
        retryAfter: (error as RateLimitError).retryAfter
      });
    } else {
      logger.error("Unexpected error during draft generation", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    }

    endPerformanceTracking(performanceMetric, false, code);
    return res.status(status).json({
      error: message,
      code
    });
  }
});

/**
 * Content validation endpoint
 */
app.post("/validate-content", async (req, res) => {
  const performanceMetric = startPerformanceTracking("/validate-content", req);
  const specsToValidate = Array.isArray(req.body) ? req.body : [req.body];

  try {
    // Simple validation
    const errors: string[] = [];
    const validationResults = specsToValidate.map((spec, index) => {
      const specErrors = [];

      if (!spec.title || typeof spec.title !== 'string') {
        specErrors.push(`Slide ${index + 1}: Missing or invalid title`);
      }

      if (!spec.layout) {
        specErrors.push(`Slide ${index + 1}: Missing layout`);
      }

      errors.push(...specErrors);

      return {
        spec,
        quality: {
          score: specErrors.length === 0 ? 85 : 60,
          grade: (specErrors.length === 0 ? 'B' : 'C') as 'A' | 'B' | 'C' | 'D' | 'F',
          issues: specErrors,
          strengths: specErrors.length === 0 ? ['Valid structure'] : []
        },
        improvements: specErrors.length > 0 ? ['Fix validation errors'] : []
      };
    });

    if (errors.length > 0) {
      logger.warn("Slide validation failed", { errors });
      endPerformanceTracking(performanceMetric, false, "VALIDATION_ERROR");
      return res.status(400).json({
        error: "Slide validation failed",
        code: "VALIDATION_ERROR",
        details: errors
      });
    }

    endPerformanceTracking(performanceMetric, true, undefined, {
      slideCount: validationResults.length,
      averageScore:
        validationResults.reduce((sum, result) => sum + result.quality.score, 0) /
        validationResults.length,
      averageGrade: getMostCommonGrade(validationResults.map((r) => r.quality.grade))
    });

    return res.json({
      results: validationResults,
      summary: {
        totalSlides: specsToValidate.length,
        averageScore:
          validationResults.reduce((sum, result) => sum + result.quality.score, 0) /
          validationResults.length,
        averageGrade: getMostCommonGrade(validationResults.map((r) => r.quality.grade))
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error("Content validation failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    endPerformanceTracking(performanceMetric, false, "VALIDATION_SERVICE_ERROR");
    return res.status(500).json({
      error: "Content validation failed. Please try again.",
      code: "VALIDATION_SERVICE_ERROR"
    });
  }
});

/**
 * Enhanced PowerPoint file generation endpoint with professional design system
 */
app.post("/generate/professional", async (req, res) => {
  const performanceMetric = startPerformanceTracking("/generate/professional", req);

  try {
    // Initialize context for error handling
    const requestId = logger.generateRequestId();
    const context = { requestId, operation: "ppt-generation" };

    logger.info("Professional PowerPoint generation request", {
      hasSpec: !!req.body.spec,
      colorPalette: req.body.colorPalette || "corporate",
      metadata: req.body.metadata,
      timestamp: new Date().toISOString()
    });

    let spec: SlideSpec[];
    let slideCount = 1;
    const colorPalette = req.body.colorPalette || "corporate";

    // Validate color palette
    const validPalettes = ["corporate", "creative", "finance", "tech", "ocean"];
    if (!validPalettes.includes(colorPalette)) {
      logger.warn("Invalid color palette provided", { colorPalette });
      endPerformanceTracking(performanceMetric, false, "INVALID_PALETTE_ERROR");
      return res.status(400).json({
        error: "Invalid color palette provided",
        code: "INVALID_PALETTE_ERROR",
        availablePalettes: validPalettes
      });
    }

    // Handle slide generation from parameters or direct spec
    if (!req.body.spec && req.body.prompt) {
      // Generate slides from parameters using AI service
      if (!req.body.prompt || typeof req.body.prompt !== 'string') {
        logger.warn("Invalid generation parameters provided: missing prompt");
        endPerformanceTracking(performanceMetric, false, "INVALID_PARAMS_ERROR");
        return res.status(400).json({
          error: "Invalid generation parameters: prompt is required",
          code: "INVALID_PARAMS_ERROR"
        });
      }

      try {
        const generatedSpec = await aiService.generateSlideContent(req.body);
        spec = [generatedSpec];
        logger.info("Successfully generated slide from parameters");
      } catch (error) {
        logger.error("Failed to generate slide from parameters", {
          error: error instanceof Error ? error.message : "Unknown error"
        });
        endPerformanceTracking(performanceMetric, false, "AI_GENERATION_ERROR");
        return res.status(500).json({
          error: "Failed to generate slide content",
          code: "AI_GENERATION_ERROR",
          details: error instanceof Error ? error.message : "Unknown error"
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
            validationErrors.push(v.errors || ["Unknown validation error"]);
          } else if (v.data) {
            if (Array.isArray(v.data)) {
              validatedSpecs.push(...(v.data as SlideSpec[]));
            } else {
              validatedSpecs.push(v.data as SlideSpec);
            }
          }
        }

        if (validationErrors.length > 0) {
          logger.warn("Some slide specifications failed validation", { validationErrors });
          endPerformanceTracking(performanceMetric, false, "VALIDATION_ERROR");
          return res.status(400).json({
            error: "Some slide specifications failed validation",
            code: "VALIDATION_ERROR",
            details: validationErrors
          });
        }

        spec = validatedSpecs;
      } else {
        const validation = safeValidateSlideSpec(req.body.spec);
        if (!validation.success) {
          logger.warn("Slide specification validation failed", { errors: validation.errors });
          endPerformanceTracking(performanceMetric, false, "VALIDATION_ERROR");
          return res.status(400).json({
            error: "Slide specification validation failed",
            code: "VALIDATION_ERROR",
            details: validation.errors
          });
        }
        if (validation.data) {
          spec = Array.isArray(validation.data) ? (validation.data as SlideSpec[]) : [validation.data as SlideSpec];
        } else {
          spec = [];
        }
      }
    } else {
      logger.warn("No slide specification or generation parameters provided");
      endPerformanceTracking(performanceMetric, false, "MISSING_INPUT_ERROR");
      return res.status(400).json({
        error: 'Either slide specification or generation parameters (prompt) must be provided',
        code: "MISSING_INPUT_ERROR",
        details: ['Provide either "spec" with slide specifications or "prompt" with generation parameters']
      });
    }

    slideCount = spec.length;

    // Guard against undefined or empty spec
    if (!spec || spec.length === 0) {
      logger.error("Internal error: spec not defined or empty");
      endPerformanceTracking(performanceMetric, false, "INTERNAL_ERROR");
      return res.status(500).json({
        error: "Internal error: No valid specification provided",
        code: "INTERNAL_ERROR"
      });
    }

    // Generate PowerPoint using enhanced generator

    logger.startPerf(`ppt-gen-${requestId}`, context);
    logger.info("Starting enhanced PowerPoint generation", context, {
      slideCount: Array.isArray(spec) ? spec.length : 1,
      withValidation: req.body.withValidation ?? true,
      firstSlideTitle: spec[0]?.title,
      firstSlideLayout: spec[0]?.layout,
      themeId: req.body.themeId,
      quality: req.body.quality || 'standard'
    });

    // Enhanced generation options
    const generationOptions = {
      includeMetadata: true,
      includeSpeakerNotes: true,
      optimizeFileSize: req.body.optimizeFileSize ?? true,
      quality: (req.body.quality as 'draft' | 'standard' | 'high') || 'standard',
      author: req.body.author || 'AI PowerPoint Generator',
      company: req.body.company || 'Professional Presentations',
      subject: req.body.subject || 'AI-Generated Presentation'
    };

    const pptBuffer = await generatePpt(
      spec,
      req.body.themeId,
      generationOptions
    );

    logger.endPerf(`ppt-gen-${requestId}`, context, {
      bufferSize: pptBuffer.length,
      sizeKB: Math.round(pptBuffer.length / 1024)
    });

    // Validate buffer before sending
    if (!pptBuffer || pptBuffer.length === 0) {
      throw new Error('Generated PowerPoint buffer is empty or invalid');
    }

    // Check for valid ZIP signature (PowerPoint files are ZIP archives)
    const zipSignature = pptBuffer.subarray(0, 4);
    const expectedSignature = Buffer.from([0x50, 0x4B, 0x03, 0x04]); // "PK\x03\x04"
    if (!zipSignature.equals(expectedSignature)) {
      logger.error('Invalid PowerPoint file signature detected', context, {
        actualSignature: Array.from(zipSignature).map(b => `0x${b.toString(16).padStart(2, '0')}`).join(' '),
        expectedSignature: Array.from(expectedSignature).map(b => `0x${b.toString(16).padStart(2, '0')}`).join(' '),
        bufferSize: pptBuffer.length
      });
      throw new Error('Generated PowerPoint file has invalid format signature');
    }

    // Configure response headers with proper encoding
    const firstSpec = spec[0];
    const sanitizedTitle =
      firstSpec.title?.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_") || "presentation";
    const filename = `${sanitizedTitle}_professional.pptx`;

    // Set headers in correct order and format
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pptBuffer.length.toString());
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    endPerformanceTracking(performanceMetric, true);
    logger.info("Professional PowerPoint generated successfully", {
      slideCount,
      colorPalette,
      bufferSize: pptBuffer.length,
      filename,
      signatureValid: true
    });

    // Send buffer directly without any encoding transformations
    res.end(pptBuffer);
    return;
  } catch (error) {
    logger.error("Professional PowerPoint generation failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });

    endPerformanceTracking(performanceMetric, false, "GENERATION_ERROR");

    if (error instanceof AIGenerationError) {
      return res.status(503).json({
        error: "AI service temporarily unavailable",
        code: "AI_SERVICE_ERROR",
        details: error.message
      });
    }

    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: "Content validation failed",
        code: "VALIDATION_ERROR",
        details: error.message
      });
    }

    return res.status(500).json({
      error: "PowerPoint generation failed",
      code: "GENERATION_ERROR",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
      requestId: logger.generateRequestId(),
      suggestions: [
        'Check your slide content for any formatting issues',
        'Try reducing the number of slides if you have many',
        'Ensure your theme selection is valid',
        'Contact support if the issue persists'
      ],
      supportInfo: {
        documentation: 'https://docs.ai-ppt-generator.com/troubleshooting',
        contact: 'support@ai-ppt-generator.com'
      }
    });
  }
});

/**
 * PowerPoint file generation endpoint
 * Enhanced with better performance monitoring and error handling
 */
app.post("/generate", async (req, res) => {
  const performanceMetric = startPerformanceTracking("/generate", req);

  try {
    logger.info("PowerPoint generation request", {
      hasSpec: !!req.body.spec,
      directGeneration: !req.body.spec,
      themeId: req.body.themeId,
      withValidation: req.body.withValidation ?? true,
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent']?.substring(0, 100)
    });

    // Validate theme ID if provided
    if (req.body.themeId) {
      const themeExists = PROFESSIONAL_THEMES.some(t => t.id === req.body.themeId);
      if (!themeExists) {
        logger.warn("Invalid theme ID provided", {
          themeId: req.body.themeId,
          availableThemes: PROFESSIONAL_THEMES.map(t => t.id)
        });
      } else {
        const selectedTheme = PROFESSIONAL_THEMES.find(t => t.id === req.body.themeId);
        logger.info("Theme validation passed", {
          themeId: req.body.themeId,
          themeName: selectedTheme?.name,
          themeCategory: selectedTheme?.category
        });
      }
    }

    let spec: SlideSpec | SlideSpec[];
    let slideCount = 1;
    let themeUsed: string = req.body.themeId || "default";

    // Check if we need to generate slides from parameters
    if (!req.body.spec && req.body.prompt) {
      logger.info("Generating slides from parameters", { prompt: req.body.prompt });

      // Validate generation parameters
      if (!req.body.prompt || typeof req.body.prompt !== 'string') {
        logger.warn("Invalid generation parameters provided: missing prompt");
        endPerformanceTracking(performanceMetric, false, "INVALID_PARAMS_ERROR");
        return res.status(400).json({
          error: "Invalid generation parameters: prompt is required",
          code: "INVALID_PARAMS_ERROR"
        });
      }

      // Generate slide content using AI service
      try {
        spec = await aiService.generateSlideContent(req.body);
        logger.info("Successfully generated slide from parameters");
      } catch (error) {
        logger.error("Failed to generate slide from parameters", {
          error: error instanceof Error ? error.message : "Unknown error"
        });
        endPerformanceTracking(performanceMetric, false, "AI_GENERATION_ERROR");
        return res.status(500).json({
          error: "Failed to generate slide content",
          code: "AI_GENERATION_ERROR",
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
    } else if (Array.isArray(req.body.spec)) {
      const specArray = req.body.spec as unknown[]; // Safe cast from any
      const validatedSpecs: SlideSpec[] = [];
      const validationErrors: string[][] = [];

      for (const s of specArray) {
        const v = safeValidateSlideSpec(s);
        if (!v.success) {
          validationErrors.push(v.errors || ["Unknown validation error"]);
        } else {
          validatedSpecs.push(v.data as SlideSpec);
        }
      }

      if (validationErrors.length > 0) {
        logger.warn("Invalid slide specifications provided", { errors: validationErrors });
        endPerformanceTracking(performanceMetric, false, "INVALID_SPEC_ERROR");
        return res.status(400).json({
          error: "Invalid slide specifications provided",
          code: "INVALID_SPEC_ERROR",
          details: validationErrors
        });
      }

      spec = validatedSpecs;
    } else if (req.body.spec) {
      const validation = safeValidateSlideSpec(req.body.spec);
      if (!validation.success) {
        logger.warn("Invalid slide specification provided", { errors: validation.errors });
        endPerformanceTracking(performanceMetric, false, "INVALID_SPEC_ERROR");
        return res.status(400).json({
          error: "Invalid slide specification provided",
          code: "INVALID_SPEC_ERROR",
          details: validation.errors
        });
      }

      spec = validation.data as SlideSpec;
    } else {
      // Neither spec nor prompt provided
      logger.warn("No slide specification or generation parameters provided");
      endPerformanceTracking(performanceMetric, false, "MISSING_INPUT_ERROR");
      return res.status(400).json({
        error: 'Either slide specification or generation parameters (prompt) must be provided',
        code: "MISSING_INPUT_ERROR",
        details: ['Provide either "spec" with slide specifications or "prompt" with generation parameters']
      });
    }

    slideCount = Array.isArray(spec) ? spec.length : 1;

    // Guard against undefined or empty spec
    if (!spec || (Array.isArray(spec) && spec.length === 0)) {
      logger.error("Internal error: spec not defined or empty");
      endPerformanceTracking(performanceMetric, false, "INTERNAL_ERROR");
      return res.status(500).json({
        error: "Internal error: No valid specification provided",
        code: "INTERNAL_ERROR"
      });
    }

    // Auto-select theme if not provided or invalid
    if (!req.body.themeId) {
      const firstSpec = Array.isArray(spec) ? (spec as SlideSpec[])[0] : (spec as SlideSpec);
      const contentForAnalysis = `${firstSpec.title || ''} ${firstSpec.paragraph || ''} ${firstSpec.layout || ''}`;
      themeUsed = selectThemeForContent(contentForAnalysis).id;
      logger.info(`Auto-selected theme: ${themeUsed}`);
    } else {
      const exists = PROFESSIONAL_THEMES.some((t) => t.id === req.body.themeId);
      if (!exists) {
        logger.warn("Provided themeId not found. Falling back to auto-selection.", {
          themeId: req.body.themeId
        });
        const firstSpec = Array.isArray(spec) ? (spec as SlideSpec[])[0] : (spec as SlideSpec);
        const contentForAnalysis = `${firstSpec.title || ''} ${firstSpec.paragraph || ''} ${firstSpec.layout || ''}`;
        themeUsed = selectThemeForContent(contentForAnalysis).id;
      } else {
        themeUsed = req.body.themeId;
      }
    }

    // Use the simplified PowerPoint service for generation
    const slides = Array.isArray(spec) ? (spec as SlideSpec[]) : [spec as SlideSpec];
    const theme = PROFESSIONAL_THEMES.find((t) => t.id === themeUsed) || PROFESSIONAL_THEMES[0];

    // Use the existing PowerPoint service
    const { PowerPointService } = await import('./services/powerPointService');
    const powerPointService = new PowerPointService();

    const powerPointResult = await powerPointService.generatePresentation(slides, {
      theme,
      includeNotes: true,
      includeMetadata: true,
      quality: (req.body.quality as any) || "standard",
      optimizeForSize: Boolean(req.body.optimizeFileSize ?? true),
      author: req.body.author,
      company: req.body.company,
      subject: req.body.subject
    });

    // Log comprehensive theme verification results
    logger.info("🎨 PowerPoint generation completed with theme verification", {
      requestedTheme: req.body.themeId,
      appliedTheme: theme.id,
      themeMatched: req.body.themeId === theme.id,
      themeDetails: {
        id: theme.id,
        name: theme.name,
        category: theme.category,
        colors: {
          primary: theme.colors.primary,
          secondary: theme.colors.secondary,
          accent: theme.colors.accent,
          background: theme.colors.background,
          textPrimary: theme.colors.text.primary
        }
      },
      generationResult: {
        success: true,
        fileSize: powerPointResult.buffer.length,
        slideCount: slides.length,
        generationTime: powerPointResult.metadata.generationTime,
        theme: powerPointResult.metadata.theme,
        quality: powerPointResult.metadata.quality
      }
    });

    const pptBuffer = powerPointResult.buffer;

    // Configure response headers
    const firstSpec = Array.isArray(spec) ? (spec as SlideSpec[])[0] : (spec as SlideSpec);
    const sanitizedTitle =
      firstSpec.title?.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_") || "presentation";
    const filename = `${sanitizedTitle}.pptx`;

    // Validate buffer before sending
    if (!pptBuffer || pptBuffer.length === 0) {
      throw new Error('Generated PowerPoint buffer is empty or invalid');
    }

    // Check for valid ZIP signature (PowerPoint files are ZIP archives)
    const zipSignature = pptBuffer.subarray(0, 4);
    const expectedSignature = Buffer.from([0x50, 0x4B, 0x03, 0x04]); // "PK\x03\x04"
    if (!zipSignature.equals(expectedSignature)) {
      logger.error('Invalid PowerPoint file signature detected', {
        actualSignature: Array.from(zipSignature).map(b => `0x${b.toString(16).padStart(2, '0')}`).join(' '),
        expectedSignature: Array.from(expectedSignature).map(b => `0x${b.toString(16).padStart(2, '0')}`).join(' '),
        bufferSize: pptBuffer.length
      });
      throw new Error('Generated PowerPoint file has invalid format signature');
    }

    // Set headers in correct order and format
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pptBuffer.length.toString());
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    logger.info("PowerPoint generation successful", {
      filename,
      fileSize: pptBuffer.length,
      slideTitle: sanitizedTitle,
      slideCount,
      themeUsed,
      signatureValid: true
    });

    endPerformanceTracking(performanceMetric, true, undefined, { slideCount, themeUsed, aiSteps: 4 });

    // Send buffer directly without any encoding transformations
    res.end(pptBuffer);
    return;
  } catch (error) {
    let status = 500;
    let code = "PPT_GENERATION_ERROR";
    let message = "Failed to generate PowerPoint file. Please check your slide content and try again.";

    if (error instanceof AIGenerationError) {
      status = 503;
      code = "AI_SERVICE_ERROR";
      message = "AI service temporarily unavailable during PowerPoint generation.";
      logger.error("AI generation failed during PPT creation", {
        step: error.step,
        attempt: error.attempt,
        message: error.message
      });
    } else if (error instanceof ValidationError) {
      status = 422;
      code = "CONTENT_VALIDATION_ERROR";
      message = "Generated content failed validation during PowerPoint creation.";
      logger.error("Content validation failed during PPT creation", {
        message: error.message,
        validationErrors: (error as ValidationError).validationErrors
      });
    } else if (error instanceof TimeoutError) {
      status = 408;
      code = "TIMEOUT_ERROR";
      message = "PowerPoint generation timed out. Please try again.";
      logger.error("Timeout during PPT generation", {
        message: error.message,
        timeoutMs: (error as TimeoutError).timeoutMs
      });
    } else if (error instanceof RateLimitError) {
      status = 429;
      code = "RATE_LIMIT_ERROR";
      message = "Too many requests. Please wait a moment and try again.";
      logger.warn("Rate limit exceeded during PPT generation", {
        message: error.message,
        retryAfter: (error as RateLimitError).retryAfter
      });
    } else if (error instanceof ContentFilterError) {
      status = 400;
      code = "CONTENT_FILTER_ERROR";
      message = "Content was filtered due to policy violations. Please try different wording.";
      logger.warn("Content filtered during PPT generation", {
        message: error.message,
        filteredContent: (error as ContentFilterError).filteredContent
      });
    } else if (error instanceof NetworkError) {
      status = 502;
      code = "NETWORK_ERROR";
      message = "Network error occurred. Please check your connection and try again.";
      logger.error("Network error during PPT generation", {
        message: error.message,
        statusCode: (error as NetworkError).statusCode
      });
    } else {
      logger.error("PowerPoint generation failed", {
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

/* ------------------------------- 404 & ERRORS ------------------------------ */

// 404 for unknown routes
app.use((req, res) => {
  return res.status(404).json({
    error: "Route not found",
    code: "NOT_FOUND",
    method: req.method,
    path: req.path
  });
});

// Global error handler (final safety net)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  logger.error("Unhandled error", {
    message: err?.message,
    stack: err?.stack,
    requestId: (req as any).requestId
  });
  return res.status(500).json({
    error: "Internal server error",
    code: "INTERNAL_SERVER_ERROR",
    requestId: (req as any).requestId
  });
});

/* -------------------------------------------------------------------------- */
/*                                   EXPORT                                    */
/* -------------------------------------------------------------------------- */

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