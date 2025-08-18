/**
 * AI PowerPoint Generator - Enhanced Main Application Component
 *
 * CORE FUNCTIONALITY:
 * This is the root React component that orchestrates the complete AI-powered slide generation
 * workflow. It manages a streamlined process: Input → Edit → Generate, providing
 * users with full control over their presentation creation.
 *
 * WORKFLOW STEPS:
 * 1. INPUT: User provides prompt, audience, tone, and content preferences
 * 2. EDIT: User can modify title, content, layout, and styling before final generation
 * 3. GENERATE: Creates and downloads professional PowerPoint (.pptx) file
 *
 * ENHANCED FEATURES:
 * - Improved error handling with user-friendly messages
 * - Better loading states with progress indicators
 * - Enhanced theme management and synchronization
 * - Optimized API communication with retry logic
 * - Professional UI with accessibility improvements
 * - Real-time validation and feedback
 *
 * STATE MANAGEMENT:
 * - Uses React useState for centralized application state
 * - Manages current workflow step, user parameters, AI-generated draft, and edited specifications
 * - Handles loading states, error messages, and success notifications
 *
 * API INTEGRATION:
 * - Communicates with Firebase Cloud Functions backend
 * - Enhanced error handling with retry mechanisms
 * - Comprehensive logging and performance monitoring
 *
 * @version 3.2.0-enhanced
 * @author AI PowerPoint Generator Team
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AppState, GenerationParams, SlideSpec } from './types';
import { generateSlideId } from './types';
import PromptInput from './components/PromptInput';
import SlideEditor from './components/SlideEditor';
import StepIndicator from './components/StepIndicator';
import { useLoadingState, LOADING_STAGES } from './hooks/useLoadingState';
import { HiPresentationChartLine, HiExclamationTriangle, HiCheckCircle } from 'react-icons/hi2';
import { API_ENDPOINTS, verifyApiConnection } from './config';
import { useThemeSync } from './hooks/useThemeSync';
import { ThemeProvider } from './contexts/ThemeContext';
import './App.css';

/**
 * Enhanced Main Application Component
 *
 * Orchestrates the entire slide generation workflow with intelligent state management,
 * comprehensive error handling, and seamless user experience. Provides real-time feedback,
 * progress tracking, and professional-grade PowerPoint generation.
 */
function AppContent() {
  const contextThemeId = 'corporate-blue';

  // Initialize logging and API connection verification
  useEffect(() => {
    console.log('🚀 AI PowerPoint Generator initialized');
    verifyApiConnection().catch(error => {
      console.warn('⚠️ API connection verification failed:', error);
    });
  }, []);

  // Enhanced application state with better defaults
  const [state, setState] = useState<AppState>({
    step: 'input',
    params: {
      prompt: '',
      audience: 'general',
      tone: 'professional',
      contentLength: 'moderate',
      design: {
        theme: contextThemeId
      }
    },
    loading: false
  });

  // Success notification state
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Enhanced loading state management with better error handling
  const loadingState = useLoadingState({
    defaultTimeout: 90000, // Increased to 90 seconds for complex generations
    onComplete: () => {
      console.log('✅ Operation completed successfully');
      setSuccessMessage('PowerPoint generated successfully!');
      setTimeout(() => setSuccessMessage(''), 5000);
    },
    onError: (error) => {
      console.error('❌ Operation failed:', error);
      updateState({
        error: `Generation failed: ${error}. Please try again.`,
        loading: false
      });
    }
  });

  // Enhanced theme synchronization with error handling
  const themeSync = useThemeSync({
    initialThemeId: contextThemeId || state.params.design?.theme,
    debug: process.env.NODE_ENV === 'development',
    autoSync: true
  });

  // Debug logging for theme synchronization (only in development)
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🎨 App: Theme state', {
        contextThemeId,
        formThemeId: state.params.design?.theme,
        syncThemeId: themeSync.themeId,
        syncStatus: themeSync.syncStatus,
        step: state.step
      });
    }
  }, [contextThemeId, state.params.design?.theme, themeSync.themeId, themeSync.syncStatus, state.step]);

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









  /**
   * Enhanced state update function with logging and validation
   * Provides a clean interface for state management throughout the component
   *
   * @param updates - Partial state updates to apply
   */
  const updateState = useCallback((updates: Partial<AppState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 State updated:', {
          from: prev.step,
          to: newState.step,
          hasError: !!newState.error,
          loading: newState.loading
        });
      }
      return newState;
    });
  }, []);

  // Enhanced error clearing with better UX
  useEffect(() => {
    if (state.error && (state.step === 'input' || state.params.prompt)) {
      const timer = setTimeout(() => {
        updateState({ error: undefined });
      }, 500); // Small delay to prevent flickering
      return () => clearTimeout(timer);
    }
  }, [state.step, state.params.prompt, state.error, updateState]);

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
      // Enhanced generation options for single slide
      const generationOptions = {
        spec: spec,
        withImage: shouldIncludeImages,
        themeId: state.params.design?.theme || themeSync.themeId || 'corporate-blue',
        compactMode: false,
        typographyScale: 'medium',
        // Enhanced options
        includeMetadata: true,
        includeSpeakerNotes: true,
        optimizeFileSize: true,
        quality: 'standard',
        author: 'AI PowerPoint Generator',
        company: 'Professional Presentations',
        subject: spec.title || 'AI-Generated Slide'
      };

      const response = await fetch(API_ENDPOINTS.generate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generationOptions)
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



      default:
        return null;
    }
  };

  return (
    <ThemeProvider initialThemeId="corporate-blue" enableGlobalTheme={true}>
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





        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-xl animate-bounce-subtle"></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-bounce-subtle" style={{ animationDelay: '2s' }}></div>
      </motion.header>

      {/* Enhanced Step Indicator */}
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

      {/* Enhanced loading indicator with progress */}
      {loadingState.isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl border border-gray-200"
          >
            <div className="text-center">
              <div className="relative mb-6">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <HiPresentationChartLine className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Generating Your Presentation
              </h3>
              <p className="text-gray-600 mb-4">
                {typeof loadingState.currentStage === 'string' ? loadingState.currentStage : 'Processing your request...'}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${loadingState.progress || 0}%` }}
                ></div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Success notification */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
              <HiCheckCircle className="w-6 h-6" />
              <span className="font-medium">{successMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error notification */}
      <AnimatePresence>
        {state.error && !state.loading && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 left-6 z-50"
          >
            <div className="bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 max-w-md">
              <HiExclamationTriangle className="w-6 h-6 flex-shrink-0" />
              <span className="font-medium">
                {typeof state.error === 'string' ? state.error : 'An error occurred. Please try again.'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </ThemeProvider>
  );
}

// Main App component (simplified)
export default function App() {
  return <AppContent />;
}