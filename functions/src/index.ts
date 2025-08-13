// /**
//  * AI PowerPoint Generator - Firebase Cloud Functions Backend
//  *
//  * Enhanced backend service with chained AI processing for superior slide quality:
//  * - Multi-step AI generation (content → layout → images → refinement)
//  * - Professional PowerPoint creation with advanced styling and image integration
//  * - RESTful API with improved error handling and performance monitoring
//  *
//  * @version 3.2.0-enhanced
//  * @author AI PowerPoint Generator Team (enhanced by expert co-pilot)
//  */

// import { setGlobalOptions } from "firebase-functions";
// import { onRequest } from "firebase-functions/v2/https";
// import { logger } from "firebase-functions";
// import { defineSecret } from "firebase-functions/params";
// import express from "express";
// import cors from "cors";

// // Import enhanced core modules with error types
// import { generateSlideSpec, AIGenerationError, ValidationError, TimeoutError } from "./llm";
// import { generatePptMinimal } from "./pptGeneratorMinimal";
// import { safeValidateGenerationParams, safeValidateSlideSpec, validateContentQuality, generateContentImprovements } from "./schema";
// import { PROFESSIONAL_THEMES, getThemesByCategory, selectThemeForContent, getThemeRecommendations } from "./professionalThemes";

// // Configuration constants
// const CONFIG = {
//   maxInstances: 10,
//   requestSizeLimit: '10mb',
//   timeout: 300, // 5 minutes
//   memory: "1GiB"
// } as const;

// // Performance monitoring utilities
// interface PerformanceMetrics {
//   requestId: string;
//   endpoint: string;
//   startTime: number;
//   endTime?: number;
//   duration?: number;
//   success: boolean;
//   errorType?: string;
//   userAgent?: string;
//   contentLength?: number;
// }

// const performanceMetrics: PerformanceMetrics[] = [];

// function startPerformanceTracking(endpoint: string, req: any): PerformanceMetrics {
//   const metric: PerformanceMetrics = {
//     requestId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
//     endpoint,
//     startTime: Date.now(),
//     success: false,
//     userAgent: req.headers['user-agent'],
//     contentLength: req.headers['content-length'] ? parseInt(req.headers['content-length']) : undefined
//   };

//   performanceMetrics.push(metric);
//   return metric;
// }

// function endPerformanceTracking(metric: PerformanceMetrics, success: boolean, errorType?: string): void {
//   metric.endTime = Date.now();
//   metric.duration = metric.endTime - metric.startTime;
//   metric.success = success;
//   metric.errorType = errorType;

//   // Log performance metrics
//   logger.info('Performance metric', {
//     requestId: metric.requestId,
//     endpoint: metric.endpoint,
//     duration: metric.duration,
//     success: metric.success,
//     errorType: metric.errorType
//   });

//   // Keep only last 1000 metrics to prevent memory issues
//   if (performanceMetrics.length > 1000) {
//     performanceMetrics.splice(0, performanceMetrics.length - 1000);
//   }
// }

// // Helper function for grade calculation
// function getMostCommonGrade(grades: ('A' | 'B' | 'C' | 'D' | 'F')[]): 'A' | 'B' | 'C' | 'D' | 'F' {
//   const counts = grades.reduce((acc, grade) => {
//     acc[grade] = (acc[grade] || 0) + 1;
//     return acc;
//   }, {} as Record<string, number>);

//   return Object.entries(counts).reduce((a, b) => counts[a[0]] > counts[b[0]] ? a : b)[0] as 'A' | 'B' | 'C' | 'D' | 'F';
// }

// // Define the OpenAI API key secret
// const openaiApiKey = defineSecret("OPENAI_API_KEY");

// // Configure Firebase Functions for optimal performance
// setGlobalOptions({ maxInstances: CONFIG.maxInstances });

// // Create Express application with optimized middleware
// const app = express();

// // Essential middleware configuration
// app.use(cors({ origin: true })); // Enable CORS for all origins
// app.use(express.json({ limit: CONFIG.requestSizeLimit })); // Parse JSON with size limit

// // Environment setup middleware - ensures OpenAI API key is available
// app.use((req, res, next) => {
//   if (!process.env.OPENAI_API_KEY && openaiApiKey.value()) {
//     process.env.OPENAI_API_KEY = openaiApiKey.value();
//   }
//   next();
// });

// /**
//  * Health check endpoint - provides service status and diagnostics
//  * @route GET /health
//  * @returns {Object} Service status, version, and timestamp
//  */
// app.get('/health', (req, res) => {
//   res.json({
//     status: 'healthy',
//     timestamp: new Date().toISOString(),
//     version: '3.2.0-enhanced',
//     service: 'AI PowerPoint Generator',
//     environment: process.env.NODE_ENV || 'development'
//   });
// });

// /**
//  * Slide draft generation endpoint
//  * Generates AI-powered slide specifications from user input using chained AI calls
//  *
//  * @route POST /draft
//  * @param {Object} req.body - Generation parameters (prompt, audience, tone, etc.)
//  * @returns {Object} Generated slide specification ready for editing
//  */
// app.post('/draft', async (req, res) => {
//   const performanceMetric = startPerformanceTracking('/draft', req);

//   try {
//     // Log request for monitoring (privacy-conscious)
//     logger.info('Draft generation request', {
//       requestId: performanceMetric.requestId,
//       promptLength: req.body.prompt?.length || 0,
//       audience: req.body.audience,
//       tone: req.body.tone,
//       contentLength: req.body.contentLength,
//       timestamp: new Date().toISOString()
//     });

//     // Validate input parameters with detailed error reporting
//     const validationResult = safeValidateGenerationParams(req.body);
//     if (!validationResult.success) {
//       logger.warn('Invalid request parameters', {
//         errors: validationResult.errors,
//         requestBody: { ...req.body, prompt: '[REDACTED]' }
//       });

//       return res.status(400).json({
//         error: 'Invalid request parameters',
//         code: 'VALIDATION_ERROR',
//         details: validationResult.errors
//       });
//     }

//     // Generate slide specification using chained AI
//     const spec = await generateSlideSpec(validationResult.data!);

//     logger.info('Draft generation successful', {
//       requestId: performanceMetric.requestId,
//       title: spec.title,
//       layout: spec.layout,
//       hasContent: !!(spec.bullets || spec.paragraph),
//       hasImage: !!spec.right?.imagePrompt
//     });

//     endPerformanceTracking(performanceMetric, true);
//     return res.json(spec);
//   } catch (error) {
//     // Enhanced error handling with specific error types
//     if (error instanceof AIGenerationError) {
//       logger.error('AI generation failed', {
//         requestId: performanceMetric.requestId,
//         step: error.step,
//         attempt: error.attempt,
//         message: error.message,
//         originalError: error.originalError?.message
//       });

//       endPerformanceTracking(performanceMetric, false, 'AI_SERVICE_ERROR');
//       return res.status(503).json({
//         error: 'AI service temporarily unavailable. Please try again in a moment.',
//         code: 'AI_SERVICE_ERROR',
//         step: error.step
//       });
//     }

//     if (error instanceof ValidationError) {
//       logger.error('Generated content validation failed', {
//         message: error.message,
//         validationErrors: error.validationErrors
//       });

//       return res.status(422).json({
//         error: 'Generated content failed validation. Please try again.',
//         code: 'CONTENT_VALIDATION_ERROR'
//       });
//     }

//     if (error instanceof TimeoutError) {
//       logger.error('Request timeout', {
//         message: error.message,
//         timeoutMs: error.timeoutMs
//       });

//       return res.status(408).json({
//         error: 'Request timed out. Please try again with a simpler prompt.',
//         code: 'TIMEOUT_ERROR'
//       });
//     }

//     // Generic error handling for unexpected errors
//     logger.error('Unexpected draft generation error', {
//       requestId: performanceMetric.requestId,
//       error: error instanceof Error ? error.message : String(error),
//       stack: error instanceof Error ? error.stack : undefined,
//       requestBody: { ...req.body, prompt: '[REDACTED]' }
//     });

//     endPerformanceTracking(performanceMetric, false, 'INTERNAL_ERROR');
//     return res.status(500).json({
//       error: 'An unexpected error occurred. Please try again.',
//       code: 'INTERNAL_ERROR'
//     });
//   }
// });

// /**
//  * Performance metrics endpoint
//  * @route GET /metrics
//  */
// app.get('/metrics', (req, res) => {
//   try {
//     const now = Date.now();
//     const last24Hours = now - (24 * 60 * 60 * 1000);
//     const recentMetrics = performanceMetrics.filter(m => m.startTime > last24Hours);

//     const stats = {
//       totalRequests: recentMetrics.length,
//       successfulRequests: recentMetrics.filter(m => m.success).length,
//       failedRequests: recentMetrics.filter(m => !m.success).length,
//       averageResponseTime: recentMetrics.length > 0 ?
//         recentMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / recentMetrics.length : 0,
//       endpointStats: recentMetrics.reduce((acc, m) => {
//         if (!acc[m.endpoint]) {
//           acc[m.endpoint] = { count: 0, avgDuration: 0, successRate: 0 };
//         }
//         acc[m.endpoint].count++;
//         acc[m.endpoint].avgDuration = (acc[m.endpoint].avgDuration + (m.duration || 0)) / acc[m.endpoint].count;
//         acc[m.endpoint].successRate = recentMetrics.filter(rm => rm.endpoint === m.endpoint && rm.success).length /
//                                       recentMetrics.filter(rm => rm.endpoint === m.endpoint).length;
//         return acc;
//       }, {} as Record<string, any>),
//       errorTypes: recentMetrics.filter(m => !m.success).reduce((acc, m) => {
//         const errorType = m.errorType || 'UNKNOWN';
//         acc[errorType] = (acc[errorType] || 0) + 1;
//         return acc;
//       }, {} as Record<string, number>)
//     };

//     res.json({
//       period: '24 hours',
//       timestamp: new Date().toISOString(),
//       stats,
//       systemInfo: {
//         nodeVersion: process.version,
//         platform: process.platform,
//         uptime: process.uptime(),
//         memoryUsage: process.memoryUsage()
//       }
//     });
//   } catch (error) {
//     logger.error('Metrics retrieval failed', { error });
//     res.status(500).json({ error: 'Failed to retrieve metrics' });
//   }
// });

// /**
//  * Theme management endpoints
//  */

// /**
//  * Get all available themes
//  * @route GET /themes
//  */
// app.get('/themes', (req, res) => {
//   try {
//     const category = req.query.category as string;

//     const themes = category ? getThemesByCategory(category as any) : PROFESSIONAL_THEMES;

//     res.json({
//       themes: themes.map(theme => ({
//         id: theme.id,
//         name: theme.name,
//         category: theme.category,
//         colors: theme.colors
//       })),
//       categories: ['corporate', 'creative', 'academic', 'startup', 'healthcare', 'finance'],
//       total: themes.length
//     });
//   } catch (error) {
//     logger.error('Theme listing failed', { error });
//     res.status(500).json({ error: 'Failed to retrieve themes' });
//   }
// });

// /**
//  * Get theme recommendations based on content parameters
//  * @route POST /themes/recommend
//  */
// app.post('/themes/recommend', (req, res) => {
//   try {
//     const { audience, industry, presentationType, tone, hasCharts, hasImages, isDataHeavy, isCreative } = req.body;

//     // Get theme recommendation based on content analysis
//     const contentAnalysis = {
//       hasCharts,
//       hasImages,
//       isDataHeavy,
//       isCreative,
//       audience,
//       industry
//     };

//     const recommendations = getThemeRecommendations(contentAnalysis);
//     const dynamicTheme = selectThemeForContent({ audience, industry, presentationType, tone });

//     res.json({
//       recommendations: recommendations.recommended.map(theme => ({
//         id: theme.id,
//         name: theme.name,
//         category: theme.category,
//         colors: theme.colors
//       })),
//       reasons: recommendations.reasons,
//       dynamicSelection: {
//         id: dynamicTheme.id,
//         name: dynamicTheme.name,
//         category: dynamicTheme.category,
//         colors: dynamicTheme.colors
//       },
//       timestamp: new Date().toISOString()
//     });
//   } catch (error) {
//     logger.error('Theme recommendation failed', { error });
//     res.status(500).json({ error: 'Failed to generate theme recommendations' });
//   }
// });

// /**
//  * Content validation and quality assessment endpoint
//  * Analyzes slide content and provides improvement suggestions
//  *
//  * @route POST /validate
//  * @param {Object} req.body - Slide specification to validate
//  * @returns {Object} Quality assessment and improvement suggestions
//  */
// app.post('/validate', async (req, res) => {
//   try {
//     logger.info('Content validation request', {
//       hasSpec: !!req.body,
//       timestamp: new Date().toISOString()
//     });

//     // Validate the slide specification
//     const validationResult = safeValidateSlideSpec(req.body);
//     if (!validationResult.success) {
//       return res.status(400).json({
//         error: 'Invalid slide specification',
//         code: 'VALIDATION_ERROR',
//         details: validationResult.errors
//       });
//     }

//     const spec = validationResult.data!;

//     // Handle both single spec and array of specs
//     const specsToValidate = Array.isArray(spec) ? spec : [spec];
//     const validationResults = specsToValidate.map((slideSpec, index) => {
//       const qualityAssessment = validateContentQuality(slideSpec);
//       const improvements = generateContentImprovements(slideSpec, qualityAssessment);

//       return {
//         slideIndex: index,
//         title: slideSpec.title,
//         quality: qualityAssessment,
//         improvements
//       };
//     });

//     logger.info('Content validation successful', {
//       slideCount: specsToValidate.length,
//       averageScore: validationResults.reduce((sum, result) => sum + result.quality.score, 0) / validationResults.length
//     });

//     return res.json({
//       results: validationResults,
//       summary: {
//         totalSlides: specsToValidate.length,
//         averageScore: validationResults.reduce((sum, result) => sum + result.quality.score, 0) / validationResults.length,
//         averageGrade: getMostCommonGrade(validationResults.map(r => r.quality.grade))
//       },
//       timestamp: new Date().toISOString()
//     });
//   } catch (error) {
//     logger.error('Content validation failed', {
//       error: error instanceof Error ? error.message : String(error),
//       stack: error instanceof Error ? error.stack : undefined
//     });

//     return res.status(500).json({
//       error: 'Content validation failed. Please try again.',
//       code: 'VALIDATION_SERVICE_ERROR'
//     });
//   }
// });

// /**
//  * PowerPoint file generation endpoint
//  * Creates downloadable .pptx files from slide specifications, with optional chained AI generation
//  *
//  * @route POST /generate
//  * @param {Object} req.body - Slide specification or generation parameters
//  * @returns {Buffer} PowerPoint file as binary data
//  */
// app.post('/generate', async (req, res) => {
//   try {
//     logger.info('PowerPoint generation request', {
//       hasSpec: !!req.body.spec,
//       directGeneration: !req.body.spec,
//       timestamp: new Date().toISOString()
//     });

//     let spec;
//     if (req.body.spec) {
//       // Use provided specification (from frontend editor)
//       spec = req.body.spec;
//       logger.info('Using provided slide specification');

//       // Validate provided specification
//       const validationResult = safeValidateSlideSpec(spec);
//       if (!validationResult.success) {
//         logger.warn('Invalid slide specification provided', {
//           errors: validationResult.errors
//         });

//         return res.status(400).json({
//           error: 'Invalid slide specification provided',
//           code: 'INVALID_SPEC_ERROR',
//           details: validationResult.errors
//         });
//       }
//       spec = validationResult.data;
//     } else {
//       // Validate generation parameters
//       const paramValidation = safeValidateGenerationParams(req.body);
//       if (!paramValidation.success) {
//         return res.status(400).json({
//           error: 'Invalid generation parameters',
//           code: 'VALIDATION_ERROR',
//           details: paramValidation.errors
//         });
//       }

//       // Generate new specification from parameters using chained AI
//       logger.info('Generating new slide specification with chaining');
//       spec = await generateSlideSpec(paramValidation.data!);
//     }

//     // Generate PowerPoint file from specification using minimal generator to prevent corruption
//     const pptBuffer = await generatePptMinimal(Array.isArray(spec) ? spec : [spec!]);

//     // Configure response headers for proper file download
//     const sanitizedTitle = (Array.isArray(spec) ? spec[0]?.title : spec!.title)?.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') || 'presentation';
//     const filename = `${sanitizedTitle}.pptx`;

//     res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
//     res.setHeader('Content-Length', pptBuffer.length.toString());

//     logger.info('PowerPoint generation successful', {
//       filename,
//       fileSize: pptBuffer.length,
//       slideTitle: sanitizedTitle
//     });

//     return res.send(pptBuffer);
//   } catch (error) {
//     // Enhanced error handling for PowerPoint generation
//     if (error instanceof AIGenerationError) {
//       logger.error('AI generation failed during PPT creation', {
//         step: error.step,
//         attempt: error.attempt,
//         message: error.message
//       });

//       return res.status(503).json({
//         error: 'AI service temporarily unavailable during PowerPoint generation.',
//         code: 'AI_SERVICE_ERROR',
//         step: error.step
//       });
//     }

//     if (error instanceof ValidationError) {
//       logger.error('Content validation failed during PPT creation', {
//         message: error.message,
//         validationErrors: error.validationErrors
//       });

//       return res.status(422).json({
//         error: 'Generated content failed validation during PowerPoint creation.',
//         code: 'CONTENT_VALIDATION_ERROR'
//       });
//     }

//     if (error instanceof TimeoutError) {
//       logger.error('Timeout during PPT generation', {
//         message: error.message,
//         timeoutMs: error.timeoutMs
//       });

//       return res.status(408).json({
//         error: 'PowerPoint generation timed out. Please try again.',
//         code: 'TIMEOUT_ERROR'
//       });
//     }

//     // Comprehensive error logging for PowerPoint generation failures
//     logger.error('PowerPoint generation failed', {
//       error: error instanceof Error ? error.message : String(error),
//       stack: error instanceof Error ? error.stack : undefined,
//       hasSpec: !!req.body.spec,
//       timestamp: new Date().toISOString()
//     });

//     return res.status(500).json({
//       error: 'Failed to generate PowerPoint file. Please check your slide content and try again.',
//       code: 'PPT_GENERATION_ERROR'
//     });
//   }
// });

// /**
//  * Export the Express app as an optimized Firebase Cloud Function
//  *
//  * Enhanced configuration for chained AI and image generation:
//  * - Increased memory for image processing
//  * - Extended timeout for multi-step AI calls
//  * - Public access with enhanced logging
//  */
// export const api = onRequest(
//   {
//     cors: true,
//     secrets: [openaiApiKey],
//     memory: CONFIG.memory,
//     timeoutSeconds: CONFIG.timeout,
//     invoker: "public"
//   },
//   app
// );