/**
 * AI PowerPoint Generator - Main Application Component
 *
 * CORE FUNCTIONALITY:
 * This is the root React component that orchestrates the complete AI-powered slide generation
 * workflow. It manages a two-step process: Input → Edit → Generate, providing
 * users with full control over their presentation creation.
 *
 * WORKFLOW STEPS:
 * 1. INPUT: User provides prompt, audience, tone, and content preferences
 * 2. EDIT: User can modify title, content, layout, and styling before final generation
 * 3. GENERATE: Creates and downloads professional PowerPoint (.pptx) file
 *
 * STATE MANAGEMENT:
 * - Uses React useState for centralized application state
 * - Manages current workflow step, user parameters, AI-generated draft, and edited specifications
 * - Handles loading states and error messages throughout the process
 *
 * API INTEGRATION:
 * - Communicates with Firebase Cloud Functions backend
 * - POST /generate: Creates final PowerPoint file from slide specification
 * - Includes comprehensive error handling and user feedback
 *
 * UI/UX FEATURES:
 * - Responsive design with Tailwind CSS
 * - Smooth animations using Framer Motion
 * - Professional gradient backgrounds and glass morphism effects
 * - Step indicator showing current progress
 * - Real-time form validation and feedback
 *
 * @version 3.1.0-optimized
 * @author AI PowerPoint Generator Team
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AppState, GenerationParams, SlideSpec, Presentation } from './types';
import { generateSlideId, createNewPresentation } from './types';
import PromptInput from './components/PromptInput';
import SlideEditor from './components/SlideEditor';
import PresentationManager from './components/PresentationManager';

import StepIndicator from './components/StepIndicator';
import { useLoadingState, LOADING_STAGES } from './hooks/useLoadingState';

import { HiPresentationChartLine, HiRectangleStack, HiDocumentText } from 'react-icons/hi2';
import { API_ENDPOINTS, verifyApiConnection } from './config';
import { frontendDebugLogger } from './utils/debugLogger';

import './App.css';

/**
 * Main Application Component
 *
 * Orchestrates the entire slide generation workflow with intelligent state management
 * and seamless user experience. Handles API communication, error states, and
 * provides real-time feedback throughout the generation process.
 */
function AppContent() {
  const contextThemeId = 'corporate-blue';

  // Initialize logging
  useEffect(() => {
    console.log('App initialized');
  }, []);

  // Initialize application state with optimized default values
  const [state, setState] = useState<AppState>({
    step: 'input',
    mode: 'single', // Start in single slide mode
    params: {
      prompt: '',
      audience: 'general',
      tone: 'professional',
      contentLength: 'moderate' // Balanced default for most use cases
      // Note: Removed design.layout - our enhanced AI now intelligently selects layouts
    },
    loading: false
  });

  // Simplified loading state management
  const loadingState = useLoadingState({
    defaultTimeout: 60000, // 60 seconds for slide generation
    onComplete: () => {
      console.log('✅ Operation completed successfully');
    },
    onError: (error) => {
      console.error('❌ Operation failed:', error);
      updateState({ error, loading: false });
    }
  });

  // Simplified theme handling (theme sync removed)
  const themeSync = { themeId: contextThemeId || 'corporate-blue' };

  // Debug logging for theme synchronization (only in development)
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🎨 App: Theme state', {
        contextThemeId,
        formThemeId: state.params.design?.theme,
        step: state.step
      });
    }
  }, [contextThemeId, state.params.design?.theme, state.step]);

  // Verify API connection on component mount for debugging
  useEffect(() => {
    const checkApiConnection = async () => {
      console.log('🔍 Verifying API connection on app startup...');
      const isConnected = await verifyApiConnection();
      if (!isConnected) {
        console.warn('⚠️ API connection verification failed. Check network and configuration.');
      }
    };

    checkApiConnection();




  }, []);





  // Sync theme when switching modes or when presentation theme changes
  useEffect(() => {
    if (state.mode === 'presentation' && state.presentation?.settings.theme) {
      const presentationTheme = state.presentation.settings.theme;

      // Use the enhanced theme sync to ensure consistency
      if (themeSync.themeId !== presentationTheme) {
        themeSync.setTheme(presentationTheme, 'presentation-mode');
        console.log('🔄 App: Synced presentation theme', {
          theme: presentationTheme,
          mode: state.mode,
          previous: themeSync.themeId
        });
      }
    }
  }, [state.mode, state.presentation?.settings.theme, themeSync]);



  /**
   * Update application state with partial updates
   * Provides a clean interface for state management throughout the component
   *
   * @param updates - Partial state updates to apply
   */
  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  /**
   * Generate slide draft from user parameters
   *
   * Calls the AI backend to create an initial slide specification based on
   * user input. Handles loading states, error management, and automatic
   * progression to the edit step upon success.
   *
   * @param params - User input parameters for slide generation
   */
  const generateDraft = async (params: GenerationParams) => {
    // Debug logging to track when generation is triggered
    console.log('🚀 App: generateDraft called', {
      params,
      currentStep: state.step,
      currentLoading: state.loading,
      stackTrace: new Error().stack?.split('\n').slice(1, 5)
    });

    // Prevent multiple simultaneous generations
    if (state.loading) {
      console.log('🚫 App: Generation already in progress, ignoring request');
      return;
    }

    updateState({ loading: true, error: undefined });
    loadingState.startLoading(LOADING_STAGES.SLIDE_GENERATION);

    try {
      // Stage 1: Analyzing input
      loadingState.setStage('analyzing');
      await new Promise(resolve => setTimeout(resolve, 800));

      // Stage 2: Generate content using AI
      loadingState.setStage('generating');

      // Call the backend API to generate the slide content
      const response = await fetch(API_ENDPOINTS.draft, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const draft: SlideSpec = result.spec;

      // Ensure the draft has an ID
      if (!draft.id) {
        draft.id = generateSlideId();
      }

      // Stage 3: Finalizing
      loadingState.setStage('finalizing');
      await new Promise(resolve => setTimeout(resolve, 400));

      loadingState.completeLoading('Slide ready!');

      // Show quality feedback if available
      if (result.quality) {
        const qualityMessage = `Content quality: ${result.quality.grade} (${result.quality.score}/100)`;
        // notifications.showSuccess('Draft Generated', qualityMessage);
        console.log('✅ Draft Generated:', qualityMessage);
      }

      updateState({
        draft: draft,
        editedSpec: { ...draft }, // Create editable copy
        step: 'edit', // Go directly to edit step
        loading: false
      });
    } catch (error) {
      console.error('Draft generation failed:', error);

      // Use simple error notification (notifications system not available)
      // notifications.handleApiError(error, 'Draft Generation', () => {
      //   // Retry function
      //   generateDraft(state.params);
      // });
      console.error('Draft generation error:', error);

      loadingState.failLoading('Draft generation failed');
      updateState({
        error: error instanceof Error ? error.message : 'Draft generation failed',
        loading: false
      });
    }
  };

  /**
   * Generate final PowerPoint file from slide specification
   *
   * Converts the slide specification into a downloadable PowerPoint file.
   * Handles file download, error states, and provides user feedback throughout
   * the generation process.
   *
   * @param spec - Complete slide specification for PowerPoint generation
   */
  const generateSlide = async (spec: SlideSpec) => {
    const context: FrontendLogContext = {
      requestId: `ppt_gen_${Date.now()}`,
      component: 'App',
      action: 'generateSlide',
      route: '/generate'
    };

    // Log PowerPoint generation start
    console.log(`Starting PowerPoint generation for: ${spec.title}`, {
      layout: spec.layout,
      hasContent: !!(spec.paragraph || (spec.bullets && spec.bullets.length > 0))
    });

    updateState({ loading: true, error: undefined });

    // Start stage-based loading for PowerPoint generation
    loadingState.startLoading(LOADING_STAGES.PRESENTATION_GENERATION, 45000);

    try {
      // Check if the original generation request included images
      const shouldIncludeImages = state.params.withImage || false;

      // Stage 1: Preparing
      loadingState.setStage('preparing');

      // For PowerPoint generation, we need to handle blob responses
      // Keep using fetch directly for now since our API client expects JSON
      const response = await fetch(API_ENDPOINTS.generate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spec: spec,
          withImage: shouldIncludeImages,
          themeId: state.params.design?.theme || themeSync.themeId || 'corporate-blue',
          compactMode: false, // previewOptions.compactMode fallback
          typographyScale: 'medium' // previewOptions.typographyScale fallback
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate slide');
      }

      // Stage 2: Building
      loadingState.setStage('building');

      const blob = await response.blob();

      // Log download process
      console.log('PowerPoint blob received', {
        blobSize: blob.size,
        blobType: blob.type
      });

      // Validate blob before download
      if (blob.size === 0) {
        throw new Error('Received empty PowerPoint file - generation may have failed');
      }

      if (blob.size < 1000) {
        console.warn('PowerPoint file suspiciously small', {
          fileSize: blob.size,
          minimumExpected: 1000
        });
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const filename = `${spec.title.replace(/[^a-zA-Z0-9]/g, '_')}.pptx`;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      // Log successful download
      console.log('PowerPoint download initiated', {
        filename,
        fileSize: blob.size,
        fileSizeKB: Math.round(blob.size / 1024)
      });

      loadingState.completeLoading('PowerPoint generated successfully!');
      // showSuccess('Download Started', 'Your PowerPoint presentation is ready!');
      console.log('✅ Download Started: Your PowerPoint presentation is ready!');
      updateState({ loading: false });
    } catch (error) {
      console.error('PowerPoint generation failed:', error);

      // Log error details
      console.error('PowerPoint generation context at failure', {
        specTitle: spec.title,
        specLayout: spec.layout,
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : String(error)
      });

      // Use enhanced notification system for better user feedback
      // notifications.handleApiError(error, 'PowerPoint Generation', () => {
      //   // Retry function
      //   generateSlide(spec);
      // });
      console.error('PowerPoint generation error:', error);

      loadingState.failLoading('PowerPoint generation failed');
      updateState({
        error: error instanceof Error ? error.message : 'PowerPoint generation failed',
        loading: false
      });
    }
  };

  /**
   * Switch to presentation mode and create a new presentation
   */
  const switchToPresentationMode = () => {
    // Get the current theme using the enhanced theme sync system
    const currentTheme = state.params.design?.theme || themeSync.themeId || 'corporate-blue';

    // Save current single mode theme before switching
    themeSync.setThemeForMode('single', themeSync.themeId);

    // Get or use the presentation mode theme
    const presentationTheme = themeSync.getThemeForMode('presentation') || currentTheme;

    const presentation = createNewPresentation('My Presentation', {
      theme: presentationTheme,
      brand: state.params.design?.brand
    });

    // If we have a current draft, add it as the first slide
    if (state.draft) {
      presentation.slides = [{
        ...state.draft,
        id: state.draft.id || generateSlideId()
      }];
    }

    updateState({
      mode: 'presentation',
      step: 'presentation',
      presentation,
      selectedSlideId: presentation.slides[0]?.id
    });

    // Set the theme for presentation mode
    themeSync.setTheme(presentationTheme, 'switch-to-presentation');

    console.log('🔄 App: Switched to presentation mode', {
      theme: presentationTheme,
      previousTheme: currentTheme,
      slideCount: presentation.slides.length
    });
  };



  // Mobile navigation handlers removed for simplification

  // Mobile primary action function removed for simplification

  /**
   * Switch back to single slide mode
   */
  const switchToSingleMode = () => {
    // Save current presentation theme before switching
    if (state.presentation?.settings.theme) {
      themeSync.setThemeForMode('presentation', state.presentation.settings.theme);
    }

    // Get the single mode theme
    const singleModeTheme = themeSync.getThemeForMode('single') || themeSync.themeId;

    updateState({
      mode: 'single',
      step: 'input',
      presentation: undefined,
      selectedSlideId: undefined
    });

    // Set the theme for single mode
    themeSync.setTheme(singleModeTheme, 'switch-to-single');

    console.log('🔄 App: Switched to single mode', {
      theme: singleModeTheme,
      previousMode: 'presentation'
    });
  };

  /**
   * Generate PowerPoint from presentation with progressive loading
   */
  const generatePresentation = async (presentation: Presentation) => {
    updateState({ loading: true, error: undefined });
    loadingState.startLoading(LOADING_STAGES.PRESENTATION_GENERATION, 90000); // 90 seconds timeout

    try {
      // Stage 1: Preparing
      loadingState.setStage('preparing');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Stage 2: Processing slides
      loadingState.setStage('processing');

      // Send array of slides to backend (backend expects 'spec' field)
      const response = await fetch(API_ENDPOINTS.generate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            spec: presentation.slides, // Send array of slides
            themeId: presentation.settings.theme || 'corporate-blue',
            withValidation: true,
            compactMode: false, // previewOptions.compactMode fallback
            typographyScale: 'medium' // previewOptions.typographyScale fallback
          })
      });

      if (!response.ok) {
        throw new Error('Failed to generate presentation');
      }

      // Stage 3: Applying theme
      loadingState.setStage('applying-theme');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Stage 4: Building PowerPoint
      loadingState.setStage('building');
      const blob = await response.blob();

      // Stage 5: Finalizing
      loadingState.setStage('finalizing');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Handle file download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${presentation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pptx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      updateState({ loading: false });

    } catch (error) {
      console.error('Presentation generation failed:', error);
      updateState({
        error: error instanceof Error ? error.message : 'Failed to generate presentation',
        loading: false
      });
    }
  };

  /**
   * Renders the appropriate component based on current workflow step
   */
  const renderCurrentStep = () => {
    switch (state.step) {
      case 'input':
        return (
          <PromptInput
            params={state.params}
            loading={state.loading}
            error={state.error}
            onParamsChange={(params) => updateState({ params })}
            onGenerate={generateDraft}
          />
        );

      case 'edit':
        return (
          <SlideEditor
            spec={state.editedSpec!}
            loading={state.loading}
            error={state.error}
            onSpecChange={(editedSpec) => updateState({ editedSpec })}
            onGenerate={() => generateSlide(state.editedSpec!)}
            onBack={() => updateState({ step: 'input' })}
          />
        );

      case 'presentation':
        return (
          <PresentationManager
            presentation={state.presentation!}
            onPresentationUpdate={(presentation) => updateState({ presentation })}
            onBackToSingle={switchToSingleMode}
            onGenerate={generatePresentation}
            loading={state.loading}
            error={state.error}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-pink-50/20 relative overflow-hidden">

      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0" aria-hidden="true">
        {/* Primary gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-pink-50/30"></div>

        {/* Geometric pattern overlay */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234f46e5' fill-opacity='0.08'%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3Ccircle cx='60' cy='20' r='1'/%3E%3Ccircle cx='20' cy='60' r='1'/%3E%3Ccircle cx='60' cy='60' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px'
        }}></div>

        {/* Floating orbs for depth */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-bounce-subtle"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-pink-400/15 to-indigo-400/15 rounded-full blur-3xl animate-bounce-subtle" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 pt-8 sm:pt-12 lg:pt-16 pb-6 sm:pb-8 lg:pb-12 text-center px-4"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center gap-6 mb-6"
        >
          <motion.div
            className="p-4 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-3xl shadow-xl"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
            style={{ boxShadow: 'var(--shadow-glow-primary)' }}
          >
            <HiPresentationChartLine className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gradient tracking-tight">
            AI PowerPoint Generator
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto px-4 leading-relaxed font-medium"
        >
          Transform your ideas into professional presentations with AI-powered design and content generation
        </motion.p>

        {/* Mode Switcher */}
        {state.step !== 'presentation' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 flex justify-center"
          >
            <div className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/40">
              <button
                onClick={() => state.mode !== 'single' && switchToSingleMode()}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 text-sm font-medium ${
                  state.mode === 'single'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <HiDocumentText className="w-4 h-4" />
                Single Slide
              </button>
              <button
                onClick={switchToPresentationMode}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 text-sm font-medium ${
                  state.mode === 'presentation'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <HiRectangleStack className="w-4 h-4" />
                Presentation
              </button>
            </div>
          </motion.div>
        )}

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-xl animate-bounce-subtle"></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-bounce-subtle" style={{ animationDelay: '2s' }}></div>
      </motion.header>

      {/* Enhanced Step Indicator - Hide in presentation mode */}
      {state.mode === 'single' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="relative z-10 mb-12 px-4"
        >
          <div className="glass-strong rounded-3xl p-8 max-w-5xl mx-auto border border-white/40 shadow-xl">
            <StepIndicator currentStep={state.step} />
          </div>
        </motion.div>
      )}

      {/* Enhanced Main Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 safe-area-inset-bottom"
        role="main"
        aria-label="AI PowerPoint Generator Application"
      >
        <div className="glass-strong rounded-2xl sm:rounded-4xl border border-white/40 shadow-2xl overflow-hidden mobile-card">
          <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/80 to-slate-50/90 backdrop-blur-2xl"></div>
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={state.step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                {renderCurrentStep()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.main>

      {/* Simplified loading indicator */}
      {loadingState.isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-900 font-medium">
                {typeof loadingState.currentStage === 'string' ? loadingState.currentStage : 'Loading...'}
              </p>
              {state.error && (
                <p className="text-red-600 text-sm mt-2">
                  {typeof state.error === 'string' ? state.error : state.error.message || 'An error occurred'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main App component (simplified)
export default function App() {
  return <AppContent />;
}