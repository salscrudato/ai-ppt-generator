/**
 * AI PowerPoint Generator - Main Application Component
 *
 * CORE FUNCTIONALITY:
 * This is the root React component that orchestrates the complete AI-powered slide generation
 * workflow. It manages a three-step process: Input → Preview → Edit → Generate, providing
 * users with full control over their presentation creation.
 *
 * WORKFLOW STEPS:
 * 1. INPUT: User provides prompt, audience, tone, and content preferences
 * 2. PREVIEW: AI generates slide draft for user review and approval
 * 3. EDIT: User can modify title, content, layout, and styling before final generation
 * 4. GENERATE: Creates and downloads professional PowerPoint (.pptx) file
 *
 * STATE MANAGEMENT:
 * - Uses React useState for centralized application state
 * - Manages current workflow step, user parameters, AI-generated draft, and edited specifications
 * - Handles loading states and error messages throughout the process
 *
 * API INTEGRATION:
 * - Communicates with Firebase Cloud Functions backend
 * - POST /draft: Generates initial slide content using AI
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

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AppState, GenerationParams, SlideSpec } from './types';
import PromptInput from './components/PromptInput';
import SlidePreview from './components/SlidePreview';
import SlideEditor from './components/SlideEditor';
import StepIndicator from './components/StepIndicator';
import { HiPresentationChartLine } from 'react-icons/hi2';
import { API_ENDPOINTS, verifyApiConnection } from './config';
import { api } from './utils/apiClient';
import './App.css';

/**
 * Main Application Component
 *
 * Orchestrates the entire slide generation workflow with intelligent state management
 * and seamless user experience. Handles API communication, error states, and
 * provides real-time feedback throughout the generation process.
 */
export default function App() {
  // Initialize application state with optimized default values
  const [state, setState] = useState<AppState>({
    step: 'input',
    params: {
      prompt: '',
      audience: 'general',
      tone: 'professional',
      contentLength: 'moderate' // Balanced default for most use cases
      // Note: Removed design.layout - our enhanced AI now intelligently selects layouts
    },
    loading: false
  });

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
   * progression to the preview step upon success.
   *
   * @param params - User input parameters for slide generation
   */
  const generateDraft = async (params: GenerationParams) => {
    updateState({ loading: true, error: undefined });

    try {
      // Prepare request data - keep layout at top level for backend compatibility
      const requestData = {
        ...params
      };

      // Use the enhanced API client with debugging
      const result = await api.generateDraft(requestData);

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate slide draft');
      }

      const draft = result.data;
      updateState({
        draft,
        editedSpec: { ...draft }, // Create editable copy
        step: 'preview',
        loading: false
      });
    } catch (error) {
      console.error('Draft generation failed:', error);

      // Enhanced error handling with specific error types
      let errorMessage = 'Failed to generate slide draft. Please try again.';

      if (error instanceof Error) {
        if (error.message.includes('validation')) {
          errorMessage = 'Please check your input parameters and try again.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again with a shorter prompt.';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'Too many requests. Please wait a moment and try again.';
        } else {
          errorMessage = error.message;
        }
      }

      updateState({
        error: errorMessage,
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
    updateState({ loading: true, error: undefined });

    try {
      // Check if the original generation request included images
      const shouldIncludeImages = state.params.withImage || false;

      // For PowerPoint generation, we need to handle blob responses
      // Keep using fetch directly for now since our API client expects JSON
      const response = await fetch(API_ENDPOINTS.generate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spec: spec,
          withImage: shouldIncludeImages,
          themeId: state.params.design?.theme || 'corporate-blue'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate slide');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${spec.title.replace(/[^a-zA-Z0-9]/g, '_')}.pptx`;
      a.click();
      URL.revokeObjectURL(url);

      updateState({ loading: false });
    } catch (error) {
      console.error('PowerPoint generation failed:', error);

      // Enhanced error handling for PowerPoint generation
      let errorMessage = 'Failed to generate PowerPoint. Please try again.';

      if (error instanceof Error) {
        if (error.message.includes('validation')) {
          errorMessage = 'Slide specification is invalid. Please edit and try again.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'PowerPoint generation timed out. Please try again.';
        } else if (error.message.includes('size')) {
          errorMessage = 'Generated file is too large. Please simplify content.';
        } else {
          errorMessage = error.message;
        }
      }

      updateState({
        error: errorMessage,
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

      case 'preview':
        return (
          <SlidePreview
            draft={state.draft!}
            loading={state.loading}
            error={state.error}
            onEdit={() => updateState({ step: 'edit' })}
            onGenerate={() => generateSlide(state.draft!)}
            onBack={() => updateState({ step: 'input' })}
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
            onBack={() => updateState({ step: 'preview' })}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-pink-50/20 relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0">
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
        className="relative z-10 pt-16 pb-12 text-center"
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
          <h1 className="text-5xl md:text-6xl font-bold text-gradient tracking-tight">
            AI PowerPoint Generator
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-xl text-slate-600 max-w-3xl mx-auto px-4 leading-relaxed font-medium"
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
        className="relative z-10 max-w-7xl mx-auto px-4 pb-16"
      >
        <div className="glass-strong rounded-4xl border border-white/40 shadow-2xl overflow-hidden">
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
    </div>
  );
}