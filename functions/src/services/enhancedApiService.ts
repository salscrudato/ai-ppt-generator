/**
 * Enhanced API Service
 * 
 * Comprehensive API service that integrates all enhanced features
 * including AI orchestration, dynamic themes, intelligent layouts,
 * premium features, and performance optimization.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import { Request, Response } from 'express';
import { SlideSpec, GenerationParams } from '../schema';
import { aiOrchestrator, ContentAnalysis, GenerationContext } from '../core/aiOrchestrator';
import { dynamicThemeGenerator, DynamicThemeConfig } from '../core/theme/dynamicThemeGenerator';
import { intelligentLayoutEngine } from '../core/intelligentLayoutEngine';
import { EnhancedSlideComponents } from '../core/enhancedSlideComponents';
import { premiumFeaturesManager } from '../core/premiumFeatures';
import { performanceOptimizer } from '../core/performanceOptimizer';
import { selectOptimalFramework, generateStoryStructure } from '../core/storytellingFrameworks';

/**
 * Enhanced generation request interface
 */
export interface EnhancedGenerationRequest extends GenerationParams {
  features?: {
    useIntelligentLayout?: boolean;
    useDynamicTheme?: boolean;
    useStorytellingFramework?: boolean;
    enablePerformanceOptimization?: boolean;
    enableQualityAssessment?: boolean;
  };
  customizations?: {
    themeConfig?: Partial<DynamicThemeConfig>;
    brandConfig?: any;
    accessibilityConfig?: any;
  };
  collaboration?: {
    sessionId?: string;
    participantId?: string;
  };
}

/**
 * Enhanced generation response interface
 */
export interface EnhancedGenerationResponse {
  slide: SlideSpec;
  metadata: {
    contentAnalysis: ContentAnalysis;
    layoutRecommendation: any;
    themeInfo: any;
    qualityScore: number;
    performanceMetrics: any;
    storyFramework?: any;
  };
  recommendations: {
    improvements: string[];
    alternatives: string[];
    optimizations: string[];
  };
  collaboration?: {
    sessionId: string;
    changeId: string;
  };
}

/**
 * Enhanced API Service class
 */
export class EnhancedApiService {
  /**
   * Generate enhanced slide with all premium features
   */
  static async generateEnhancedSlide(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('🚀 Starting enhanced slide generation...');
      
      const request = req.body as EnhancedGenerationRequest;
      
      // Validate request
      if (!request.prompt) {
        res.status(400).json({ error: 'Prompt is required' });
        return;
      }

      // Step 1: Performance optimization
      let optimizedParams = request;
      if (request.features?.enablePerformanceOptimization) {
        const optimization = await performanceOptimizer.optimizeGeneration(request, {
          useCache: true,
          parallel: true,
          priority: 'balanced'
        });
        optimizedParams = optimization.optimizedParams;
      }

      // Step 2: Content analysis with AI orchestrator
      const contentAnalysis = await aiOrchestrator.analyzeContent(
        optimizedParams.prompt,
        optimizedParams
      );

      // Step 3: Generate dynamic theme if enabled
      let theme;
      if (request.features?.useDynamicTheme) {
        theme = await dynamicThemeGenerator.generateTheme(
          optimizedParams,
          contentAnalysis,
          request.customizations?.themeConfig
        );
      }

      // Step 4: Select storytelling framework if enabled
      let storyFramework;
      if (request.features?.useStorytellingFramework) {
        storyFramework = selectOptimalFramework(optimizedParams, contentAnalysis);
      }

      // Step 5: Generate content with enhanced AI
      const generationContext: GenerationContext = {
        userInput: optimizedParams,
        contentAnalysis,
        presentationTheme: theme,
        constraints: {
          maxSlides: 1,
          timeLimit: 30000,
          accessibilityLevel: 'enhanced'
        }
      };

      const slideSpec = await aiOrchestrator.generateEnhancedContent(generationContext);

      // Step 6: Intelligent layout optimization
      let layoutRecommendation;
      if (request.features?.useIntelligentLayout && theme) {
        layoutRecommendation = await intelligentLayoutEngine.recommendLayout(
          slideSpec,
          contentAnalysis,
          theme,
          {
            accessibilityLevel: 'enhanced',
            preferredAspectRatio: '16:9'
          }
        );
        
        // Apply layout recommendation
        slideSpec.layout = layoutRecommendation.layoutId as any;
      }

      // Step 7: Quality assessment
      let qualityScore = 85; // Default score
      let qualityRecommendations: string[] = [];
      if (request.features?.enableQualityAssessment && theme) {
        const qualityAssessment = await performanceOptimizer.assessQuality(
          [slideSpec],
          theme,
          optimizedParams
        );
        qualityScore = qualityAssessment.score;
        qualityRecommendations = qualityAssessment.recommendations.map(r => r.message);
      }

      // Step 8: Handle collaboration if enabled
      let collaborationInfo;
      if (request.collaboration?.sessionId) {
        await premiumFeaturesManager.trackChange(request.collaboration.sessionId, {
          type: 'create',
          target: 'slide',
          before: null,
          after: slideSpec,
          author: request.collaboration.participantId || 'anonymous'
        });
        
        collaborationInfo = {
          sessionId: request.collaboration.sessionId,
          changeId: `change_${Date.now()}`
        };
      }

      // Step 9: Record performance metrics
      const duration = Date.now() - startTime;
      await performanceOptimizer.recordMetrics('enhanced-generation', duration, {
        apiCalls: 1,
        errors: 0,
        quality: { score: qualityScore, issues: [], recommendations: qualityRecommendations }
      });

      // Prepare response
      const response: EnhancedGenerationResponse = {
        slide: slideSpec,
        metadata: {
          contentAnalysis,
          layoutRecommendation,
          themeInfo: theme ? {
            id: theme.id,
            name: theme.name,
            category: theme.category
          } : null,
          qualityScore,
          performanceMetrics: {
            duration,
            cacheUsed: false // Would be determined by actual cache usage
          },
          storyFramework: storyFramework ? {
            id: storyFramework.id,
            name: storyFramework.name
          } : null
        },
        recommendations: {
          improvements: qualityRecommendations,
          alternatives: layoutRecommendation?.alternatives.map(a => a.reason) || [],
          optimizations: layoutRecommendation?.optimizations.map(o => o.description) || []
        },
        collaboration: collaborationInfo
      };

      console.log('✅ Enhanced slide generation completed:', {
        duration: `${duration}ms`,
        qualityScore: Math.round(qualityScore),
        layout: slideSpec.layout
      });

      res.json(response);
    } catch (error) {
      console.error('❌ Enhanced generation failed:', error);
      
      // Record error metrics
      const duration = Date.now() - startTime;
      await performanceOptimizer.recordMetrics('enhanced-generation', duration, {
        apiCalls: 1,
        errors: 1
      });

      res.status(500).json({
        error: 'Enhanced generation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Generate slide prompt for specific position in presentation
   */
  private static generateSlidePrompt(
    basePrompt: string,
    slideIndex: number,
    totalSlides: number,
    storyStructure: any[]
  ): string {
    const storyElement = storyStructure[slideIndex % storyStructure.length];
    
    if (slideIndex === 0) {
      return `Create a compelling title slide for: ${basePrompt}`;
    } else if (slideIndex === totalSlides - 1) {
      return `Create a strong conclusion slide that summarizes: ${basePrompt}`;
    } else {
      return `Create slide ${slideIndex + 1} of ${totalSlides} focusing on ${storyElement.name}: ${basePrompt}`;
    }
  }

  /**
   * Get performance analytics
   */
  static async getPerformanceAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const timeRange = req.query.timeRange ? {
        start: new Date(req.query.start as string),
        end: new Date(req.query.end as string)
      } : undefined;

      const analytics = performanceOptimizer.getPerformanceAnalytics(timeRange);
      
      res.json(analytics);
    } catch (error) {
      console.error('❌ Failed to get analytics:', error);
      res.status(500).json({
        error: 'Failed to get performance analytics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Generate presentation with multiple enhanced slides
   */
  static async generateEnhancedPresentation(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();

    try {
      console.log('📊 Starting enhanced presentation generation...');

      const request = req.body as EnhancedGenerationRequest & { slideCount: number };

      if (!request.prompt || !request.slideCount) {
        res.status(400).json({ error: 'Prompt and slideCount are required' });
        return;
      }

      const slides: SlideSpec[] = [];
      const metadata: any[] = [];

      // Generate content analysis once for the entire presentation
      const contentAnalysis = await aiOrchestrator.analyzeContent(
        request.prompt,
        request
      );

      // Generate dynamic theme for consistency
      const theme = await dynamicThemeGenerator.generateTheme(
        request,
        contentAnalysis,
        request.customizations?.themeConfig
      );

      // Select storytelling framework
      const storyFramework = selectOptimalFramework(request, contentAnalysis);
      const storyStructure = generateStoryStructure(storyFramework, {
        userInput: request,
        contentAnalysis,
        targetFramework: storyFramework,
        customizations: {}
      });

      // Generate slides based on story structure
      for (let i = 0; i < request.slideCount; i++) {
        const slidePrompt = this.generateSlidePrompt(request.prompt, i, request.slideCount, storyStructure);

        const slideParams = {
          ...request,
          prompt: slidePrompt
        };

        const generationContext: GenerationContext = {
          userInput: slideParams,
          contentAnalysis,
          presentationTheme: theme,
          previousSlides: slides,
          constraints: {
            maxSlides: request.slideCount,
            timeLimit: 30000,
            accessibilityLevel: 'enhanced'
          }
        };

        const slideSpec = await aiOrchestrator.generateEnhancedContent(generationContext);

        // Apply intelligent layout
        const layoutRecommendation = await intelligentLayoutEngine.recommendLayout(
          slideSpec,
          contentAnalysis,
          theme
        );
        slideSpec.layout = layoutRecommendation.layoutId as any;

        slides.push(slideSpec);
        metadata.push({
          slideIndex: i,
          layoutRecommendation,
          storyElement: storyStructure[i % storyStructure.length]
        });
      }

      // Apply brand consistency if configured
      let finalSlides = slides;
      if (request.customizations?.brandConfig) {
        finalSlides = await premiumFeaturesManager.applyBrandConsistency(
          slides,
          request.customizations.brandConfig
        );
      }

      // Apply accessibility enhancements
      if (request.customizations?.accessibilityConfig) {
        finalSlides = await premiumFeaturesManager.applyAccessibilityEnhancements(
          finalSlides,
          request.customizations.accessibilityConfig
        );
      }

      // Perform quality assessment on the entire presentation
      const qualityAssessment = await performanceOptimizer.assessQuality(
        finalSlides,
        theme,
        request
      );

      const duration = Date.now() - startTime;
      await performanceOptimizer.recordMetrics('enhanced-presentation', duration, {
        apiCalls: request.slideCount,
        errors: 0,
        quality: qualityAssessment
      });

      console.log('✅ Enhanced presentation generation completed:', {
        slides: finalSlides.length,
        duration: `${duration}ms`,
        qualityScore: Math.round(qualityAssessment.score)
      });

      res.json({
        slides: finalSlides,
        metadata: {
          theme: {
            id: theme.id,
            name: theme.name,
            category: theme.category
          },
          storyFramework: {
            id: storyFramework.id,
            name: storyFramework.name,
            structure: storyStructure.map(s => s.name)
          },
          qualityAssessment,
          performanceMetrics: {
            duration,
            slidesGenerated: finalSlides.length
          },
          slideMetadata: metadata
        }
      });
    } catch (error) {
      console.error('❌ Enhanced presentation generation failed:', error);

      const duration = Date.now() - startTime;
      await performanceOptimizer.recordMetrics('enhanced-presentation', duration, {
        apiCalls: 0,
        errors: 1
      });

      res.status(500).json({
        error: 'Enhanced presentation generation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get template recommendations
   */
  static async getTemplateRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const { prompt, audience, tone, industry } = req.body;

      if (!prompt) {
        res.status(400).json({ error: 'Prompt is required' });
        return;
      }

      // Analyze content for recommendations
      const params = {
        prompt,
        audience: audience || 'general',
        tone: tone || 'professional',
        industry,
        contentLength: 'moderate' as const,
        withImage: false,
        presentationType: 'general' as const,
        imageStyle: 'professional' as const,
        qualityLevel: 'standard' as const,
        includeNotes: false,
        includeSources: false
      };

      const contentAnalysis = await aiOrchestrator.analyzeContent(prompt, params);

      const recommendations = await premiumFeaturesManager.getTemplateRecommendations(
        contentAnalysis,
        params,
        5
      );

      res.json({
        recommendations,
        analysis: contentAnalysis
      });
    } catch (error) {
      console.error('❌ Failed to get template recommendations:', error);
      res.status(500).json({
        error: 'Failed to get template recommendations',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create collaboration session
   */
  static async createCollaborationSession(req: Request, res: Response): Promise<void> {
    try {
      const { presentationId, owner, permissions } = req.body;

      if (!presentationId || !owner) {
        res.status(400).json({ error: 'presentationId and owner are required' });
        return;
      }

      const session = await premiumFeaturesManager.createCollaborationSession(
        presentationId,
        owner,
        permissions || {
          allowEdit: true,
          allowComment: true,
          allowExport: false,
          allowShare: false,
          allowThemeChange: false,
          allowSlideReorder: true
        }
      );

      res.json(session);
    } catch (error) {
      console.error('❌ Failed to create collaboration session:', error);
      res.status(500).json({
        error: 'Failed to create collaboration session',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Export presentation with advanced options
   */
  static async exportPresentation(req: Request, res: Response): Promise<void> {
    try {
      const { slides, exportConfig } = req.body;

      if (!slides || !Array.isArray(slides)) {
        res.status(400).json({ error: 'slides array is required' });
        return;
      }

      const result = await premiumFeaturesManager.exportPresentation(
        slides,
        exportConfig || {
          format: 'pptx',
          quality: 'standard',
          options: {
            includeNotes: true,
            includeAnimations: true,
            optimizeForWeb: false,
            compressImages: true,
            embedFonts: true
          },
          customizations: {
            slideNumbers: true,
            handoutMode: false
          }
        }
      );

      // Set appropriate headers for file download
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="presentation.${exportConfig?.format || 'pptx'}"`);
      res.setHeader('Content-Length', result.buffer.length);

      res.send(result.buffer);
    } catch (error) {
      console.error('❌ Failed to export presentation:', error);
      res.status(500).json({
        error: 'Failed to export presentation',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
