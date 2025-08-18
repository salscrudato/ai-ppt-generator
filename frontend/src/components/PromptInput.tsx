import React, { useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { GenerationParams } from '../types';
import {
  HiPencilSquare,
  HiExclamationTriangle,
  HiSparkles,
  HiUsers,
  HiChatBubbleLeftRight,
  HiPhoto,
  HiRectangleStack,
  HiDocumentText,
  HiBriefcase
} from 'react-icons/hi2';

import ThemeCarousel from './ThemeCarousel';
import Button from './Button';
import { useThemeContext } from '../contexts/ThemeContext';
import { useThemeSync } from '../hooks/useThemeSync';


// Define options directly since validation system was removed
const AUDIENCE_OPTIONS = ['general', 'executives', 'technical', 'sales', 'investors', 'students'] as const;
const TONE_OPTIONS = ['professional', 'casual', 'persuasive', 'educational', 'inspiring'] as const;
const CONTENT_LENGTH_OPTIONS = ['brief', 'moderate', 'detailed'] as const;
const PRESENTATION_TYPE_OPTIONS = ['business', 'academic', 'sales', 'training', 'report'] as const;

interface PromptInputProps {
  params: GenerationParams;
  loading: boolean;
  error?: string;
  onParamsChange: (params: GenerationParams) => void;
  onGenerate: (params: GenerationParams) => void;
}

export default function PromptInput({
  params,
  loading,
  error,
  onParamsChange,
  onGenerate
}: PromptInputProps) {
  const [localParams, setLocalParams] = useState(params);
  const { setTheme, themeId: contextThemeId } = useThemeContext();

  // Enhanced theme synchronization for single mode
  const themeSync = useThemeSync({
    mode: 'single',
    initialThemeId: params.design?.theme,
    debug: false // Disabled to reduce console spam
  });

  // Enhanced form validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [showHints, setShowHints] = useState(false);

  // Track if generation was explicitly requested to prevent accidental triggers
  const [generationRequested, setGenerationRequested] = useState(false);

  // Character count tracking for better UX
  const [promptCharCount, setPromptCharCount] = useState(params.prompt?.length || 0);

  // Sync local params when parent params change (without theme sync to avoid conflicts)
  React.useEffect(() => {
    setLocalParams(params);
  }, [params]);

  // Enhanced theme synchronization using the new hook
  React.useEffect(() => {
    const formThemeId = localParams.design?.theme;
    const syncedThemeId = themeSync?.themeId;

    // Skip if themeSync is null or either theme is empty/invalid
    if (!themeSync || (!formThemeId && !syncedThemeId)) {
      return;
    }

    // If form has no theme, initialize with synced theme
    if (!formThemeId && syncedThemeId) {
      const updatedParams = {
        ...localParams,
        design: { ...localParams.design, theme: syncedThemeId }
      };
      setLocalParams(updatedParams);
      onParamsChange(updatedParams);
      // Reduced logging to prevent console spam
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 PromptInput: Initialized form theme from sync', {
          theme: syncedThemeId
        });
      }
    }
    // If form has theme but sync doesn't match, update sync (but only if form theme is valid)
    else if (formThemeId && formThemeId.trim() !== '' && syncedThemeId !== formThemeId) {
      themeSync?.setTheme?.(formThemeId, 'form-update');
      // Reduced logging to prevent console spam
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 PromptInput: Updated synced theme from form', {
          theme: formThemeId
        });
      }
    }
  }, [localParams.design?.theme, themeSync?.themeId, themeSync, onParamsChange]);

  // Enhanced validation with better user feedback
  const validateForm = (params: GenerationParams) => {
    const errors: Record<string, string> = {};

    // Prompt validation with helpful messages
    if (!params.prompt || params.prompt.trim().length < 10) {
      errors.prompt = 'Please provide a more detailed description (at least 10 characters)';
    } else if (params.prompt.length > 2000) {
      errors.prompt = 'Please keep your description under 2000 characters for optimal results';
    } else if (params.prompt.trim().length < 20) {
      errors.prompt = 'Consider adding more details for better AI-generated content';
    }

    setValidationErrors(errors);
    return { success: Object.keys(errors).length === 0, data: params, fieldErrors: errors };
  };

  // Get helpful suggestions based on current input
  const getPromptSuggestions = () => {
    const suggestions = [
      "Try: 'Create a sales presentation for our new product launch targeting enterprise clients'",
      "Try: 'Build a quarterly business review highlighting key metrics and achievements'",
      "Try: 'Design a training presentation on digital marketing best practices'",
      "Try: 'Generate an investor pitch deck for a fintech startup'",
      "Try: 'Create an educational presentation about climate change solutions'"
    ];

    return suggestions;
  };

  // Get character count status
  const getCharCountStatus = (count: number) => {
    if (count < 10) return { color: 'text-red-500', message: 'Too short' };
    if (count < 20) return { color: 'text-yellow-500', message: 'Could be more detailed' };
    if (count < 100) return { color: 'text-green-500', message: 'Good length' };
    if (count < 500) return { color: 'text-blue-500', message: 'Great detail' };
    if (count < 1000) return { color: 'text-indigo-500', message: 'Very detailed' };
    if (count < 2000) return { color: 'text-purple-500', message: 'Extremely detailed' };
    return { color: 'text-red-500', message: 'Too long' };
  };

  const updateParam = <K extends keyof GenerationParams>(
    key: K,
    value: GenerationParams[K]
  ) => {
    console.log('📝 PromptInput: updateParam called', { key, value, loading });

    // Prevent parameter updates during generation to avoid conflicts
    if (loading) {
      console.log('🚫 PromptInput: Parameter update blocked during generation', { key, value });
      return;
    }

    const updated = { ...localParams, [key]: value };
    setLocalParams(updated);
    onParamsChange(updated);

    // Mark field as touched
    setTouchedFields(prev => new Set(prev).add(key as string));

    // Validate the form after a short delay
    setTimeout(() => {
      validateForm(updated);
    }, 100);
  };

  // Remove the automatic validation useEffect to prevent infinite loops
  // Validation will happen on field changes and form submission



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Debug logging to track when generation is triggered
    console.log('🎯 PromptInput: handleSubmit called', {
      eventType: e.type,
      target: e.target,
      currentTarget: e.currentTarget,
      loading,
      canSubmit,
      submitter: (e.nativeEvent as SubmitEvent)?.submitter
    });

    // Prevent submission if already loading or form is invalid
    if (loading || !canSubmit) {
      console.log('🚫 PromptInput: Submission blocked', { loading, canSubmit });
      return;
    }

    // Additional check: ensure this is from the submit button or explicitly requested
    const submitter = (e.nativeEvent as SubmitEvent)?.submitter;
    if (submitter && submitter.type !== 'submit' && !generationRequested) {
      console.log('🚫 PromptInput: Submission not from submit button and not explicitly requested', { submitter, generationRequested });
      return;
    }

    // Reset the generation requested flag
    setGenerationRequested(false);

    // Ensure all required fields have defaults
    const paramsWithDefaults = {
      ...localParams,
      audience: localParams.audience || 'general',
      tone: localParams.tone || 'professional',
      contentLength: localParams.contentLength || 'moderate',
      presentationType: localParams.presentationType || 'general',
      industry: localParams.industry || 'general',
      withImage: localParams.withImage || false,
      imageStyle: localParams.imageStyle || 'professional',
      qualityLevel: localParams.qualityLevel || 'standard',
      includeNotes: localParams.includeNotes || false,
      includeSources: localParams.includeSources || false,
      design: {
        ...localParams.design,
        theme: localParams.design?.theme || themeSync?.themeId || 'corporate-blue'
      }
    };

    // Validate the form before submission
    const validationResult = validateForm(paramsWithDefaults);

    if (validationResult.success && validationResult.data) {
      console.log('✅ PromptInput: Validation passed, calling onGenerate', validationResult.data);
      onGenerate(validationResult.data);
    } else {
      console.log('❌ PromptInput: Form validation failed', validationResult.fieldErrors);
      // Mark all fields as touched to show errors
      setTouchedFields(new Set(Object.keys(paramsWithDefaults)));
    }
  };

  // Check if form can be submitted
  const canSubmit = !loading && localParams.prompt.trim().length >= 10 && Object.keys(validationErrors).length === 0;

  // Explicit button click handler for additional safety
  const handleGenerateClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('🖱️ PromptInput: Generate button clicked', { loading, canSubmit });

    if (loading || !canSubmit) {
      e.preventDefault();
      e.stopPropagation();
      console.log('🚫 PromptInput: Button click blocked', { loading, canSubmit });
      return;
    }

    // Mark that generation was explicitly requested
    setGenerationRequested(true);
    console.log('✅ PromptInput: Generation explicitly requested via button click');

    // Let the form submission handle the rest
  };

  // Handle keyboard shortcuts for form submission
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Only allow Ctrl+Enter for form submission, prevent other Enter key submissions
    if (e.key === 'Enter') {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        console.log('⌨️ PromptInput: Ctrl+Enter pressed', { canSubmit });
        // Trigger form submission on Ctrl+Enter if valid
        if (canSubmit) {
          setGenerationRequested(true);
          console.log('✅ PromptInput: Generation explicitly requested via Ctrl+Enter');
          handleSubmit(e);
        }
      } else {
        // Prevent regular Enter from submitting the form
        const target = e.target as HTMLElement;
        if (target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          console.log('🚫 PromptInput: Regular Enter blocked on', target.tagName);
        }
      }
    }
  };

  // Debug component to show theme sync status (only in development)
  const ThemeSyncDebug = () => {
    if (process.env.NODE_ENV !== 'development') return null;

    const formTheme = localParams.design?.theme;
    const isInSync = formTheme === contextThemeId;
    const [syncStatus, setSyncStatus] = React.useState<'synced' | 'syncing' | 'out-of-sync'>('synced');

    // Track sync status changes
    React.useEffect(() => {
      if (isInSync) {
        setSyncStatus('synced');
      } else {
        setSyncStatus('syncing');
        // After a brief moment, if still not synced, mark as out of sync
        const timer = setTimeout(() => {
          if (formTheme !== contextThemeId) {
            setSyncStatus('out-of-sync');
          }
        }, 100);
        return () => clearTimeout(timer);
      }
    }, [formTheme, contextThemeId, isInSync]);

    const getStatusColor = () => {
      switch (syncStatus) {
        case 'synced': return "bg-green-100 text-green-800 border border-green-200";
        case 'syncing': return "bg-yellow-100 text-yellow-800 border border-yellow-200";
        case 'out-of-sync': return "bg-red-100 text-red-800 border border-red-200";
      }
    };

    const getStatusText = () => {
      switch (syncStatus) {
        case 'synced': return '✓ Synced';
        case 'syncing': return '⏳ Syncing...';
        case 'out-of-sync': return '⚠ Out of sync';
      }
    };

    const getStatusTextColor = () => {
      switch (syncStatus) {
        case 'synced': return "text-green-600";
        case 'syncing': return "text-yellow-600";
        case 'out-of-sync': return "text-red-600";
      }
    };

    return (
      <div className={clsx(
        "fixed top-4 right-4 z-50 px-3 py-2 rounded-lg text-xs font-mono shadow-lg transition-colors duration-200",
        getStatusColor()
      )}>
        <div className="text-xs opacity-75 mb-1">Theme Sync Status</div>
        <div>Form: <span className="font-semibold">{formTheme || 'none'}</span></div>
        <div>Context: <span className="font-semibold">{contextThemeId || 'none'}</span></div>
        <div className={clsx("font-bold mt-1", getStatusTextColor())}>
          {getStatusText()}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <ThemeSyncDebug />

      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center p-6 bg-white border-b border-gray-200"
      >
        <div className="inline-flex items-center gap-4 mb-4">
          <motion.div
            className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl border border-indigo-200"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <HiPencilSquare className="w-7 h-7 text-indigo-600" />
          </motion.div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Describe Your Presentation</h2>
        </div>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Tell us what you want to present, and we'll help you create a professional slide with AI assistance.
        </p>


      </motion.div>

      {/* Main Content - Full Width */}
      <div className="min-h-[calc(100vh-200px)]">
        {/* Input Form - Full Width */}
        <div className="p-4 sm:p-6 lg:p-10 overflow-y-auto max-w-6xl mx-auto">
          <form
            onSubmit={handleSubmit}
            onKeyDown={handleKeyDown}
            className="space-y-6 sm:space-y-8"
            role="form"
            aria-label="Presentation generation form"
            noValidate
          >
        {/* Enhanced Main Prompt with Validation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <HiPencilSquare className="w-5 h-5" />
              What would you like to present about? *
            </label>
            <div className="relative">
              <textarea
                name="prompt"
                value={localParams.prompt}
                onChange={(e) => {
                  updateParam('prompt', e.target.value);
                  setPromptCharCount(e.target.value.length);
                }}
                onBlur={() => setTouchedFields(prev => new Set(prev).add('prompt'))}
                onFocus={() => setShowHints(true)}
                placeholder="Describe your presentation topic here...

• Include specific data and metrics
• Mention your key message
• Consider your audience
• Keep it concise and focused

Example: Quarterly sales results showing 25% growth, key challenges in Q3, and strategic initiatives for Q4..."
                rows={6}
                maxLength={2000}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-lg transition-all duration-200 ${
                  touchedFields.has('prompt') && validationErrors.prompt
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-300 hover:border-gray-400 focus:border-indigo-500'
                }`}
                required
              />

              {/* Character count indicator */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getCharCountStatus(promptCharCount).color} bg-white/80 backdrop-blur-sm border`}>
                  {getCharCountStatus(promptCharCount).message}
                </span>
                <span className="text-xs text-gray-400 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full border">
                  {promptCharCount}/2000
                </span>
              </div>
            </div>

            {/* Enhanced validation feedback */}
            {touchedFields.has('prompt') && validationErrors.prompt && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <HiExclamationTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{validationErrors.prompt}</p>
              </motion.div>
            )}

            {/* Helpful suggestions */}
            {showHints && promptCharCount < 20 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div className="flex items-start gap-2 mb-2">
                  <HiSparkles className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-1">Need inspiration?</h4>
                    <p className="text-xs text-blue-700 mb-2">Try one of these examples:</p>
                    <div className="space-y-1">
                      {getPromptSuggestions().slice(0, 3).map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            updateParam('prompt', suggestion.replace('Try: ', '').replace(/'/g, ''));
                            setPromptCharCount(suggestion.length - 6);
                            setShowHints(false);
                          }}
                          className="block text-xs text-blue-600 hover:text-blue-800 hover:underline text-left"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Provide a detailed description for better AI-generated content
              </p>
              <button
                type="button"
                onClick={() => setShowHints(!showHints)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                {showHints ? 'Hide tips' : 'Show tips'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Parameters Grid with Validation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {/* Audience Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <HiUsers className="w-4 h-4" />
              Target Audience *
            </label>
            <select
              name="audience"
              value={localParams.audience || 'general'}
              onChange={(e) => updateParam('audience', e.target.value as any)}
              onBlur={() => setTouchedFields(prev => new Set(prev).add('audience'))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                touchedFields.has('audience') && validationErrors.audience ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              required
            >
              {AUDIENCE_OPTIONS.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            {touchedFields.has('audience') && validationErrors.audience && (
              <p className="text-sm text-red-600">{validationErrors.audience}</p>
            )}
            <p className="text-xs text-gray-500">Who will be viewing this presentation?</p>
          </div>

          {/* Tone Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <HiChatBubbleLeftRight className="w-4 h-4" />
              Presentation Tone *
            </label>
            <select
              name="tone"
              value={localParams.tone || 'professional'}
              onChange={(e) => updateParam('tone', e.target.value as any)}
              onBlur={() => setTouchedFields(prev => new Set(prev).add('tone'))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                touchedFields.has('tone') && validationErrors.tone ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              required
            >
              {TONE_OPTIONS.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            {touchedFields.has('tone') && validationErrors.tone && (
              <p className="text-sm text-red-600">{validationErrors.tone}</p>
            )}
            <p className="text-xs text-gray-500">What tone should the content have?</p>
          </div>

          {/* Content Length Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <HiDocumentText className="w-4 h-4" />
              Content Length *
            </label>
            <select
              name="contentLength"
              value={localParams.contentLength || 'moderate'}
              onChange={(e) => updateParam('contentLength', e.target.value as any)}
              onBlur={() => setTouchedFields(prev => new Set(prev).add('contentLength'))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                touchedFields.has('contentLength') && validationErrors.contentLength ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              required
            >
              {CONTENT_LENGTH_OPTIONS.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            {touchedFields.has('contentLength') && validationErrors.contentLength && (
              <p className="text-sm text-red-600">{validationErrors.contentLength}</p>
            )}
            <p className="text-xs text-gray-500">How detailed should the content be?</p>
          </div>

          {/* Presentation Type Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <HiBriefcase className="w-4 h-4" />
              Presentation Type *
            </label>
            <select
              name="presentationType"
              value={localParams.presentationType || 'general'}
              onChange={(e) => updateParam('presentationType', e.target.value as any)}
              onBlur={() => setTouchedFields(prev => new Set(prev).add('presentationType'))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                touchedFields.has('presentationType') && validationErrors.presentationType ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              required
            >
              {PRESENTATION_TYPE_OPTIONS.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            {touchedFields.has('presentationType') && validationErrors.presentationType && (
              <p className="text-sm text-red-600">{validationErrors.presentationType}</p>
            )}
            <p className="text-xs text-gray-500">What type of presentation is this?</p>
          </div>
        </motion.div>

        {/* Theme Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
              <HiRectangleStack className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Choose Theme</h3>
          </div>

          <ThemeCarousel
            selectedId={localParams.design?.theme || themeSync?.themeId || 'corporate-blue'}
            onSelect={(themeId) => {
              console.log('🎨 PromptInput: Theme selected', {
                themeId,
                loading,
                currentFormTheme: localParams.design?.theme,
                currentSyncTheme: themeSync?.themeId
              });

              // Prevent theme changes during generation
              if (loading) {
                console.log('🚫 PromptInput: Theme change blocked during generation');
                return;
              }

              // If empty string is passed (deselection), use default theme
              const selectedThemeId = themeId && themeId.trim() !== '' ? themeId : 'corporate-blue';

              // Update form state
              const updatedDesign = { ...localParams.design, theme: selectedThemeId };
              const updatedParams = { ...localParams, design: updatedDesign };

              // Update local state first
              setLocalParams(updatedParams);

              // Update parent
              onParamsChange(updatedParams);

              // Use enhanced theme sync for consistency
              themeSync?.setTheme?.(selectedThemeId, 'theme-carousel');

              console.log('✅ PromptInput: Theme synchronized', {
                selected: selectedThemeId,
                previousForm: localParams.design?.theme,
                previousSync: themeSync?.themeId
              });
            }}
            showCategories={true}
            title=""
          />
        </motion.div>

        {/* Grid Layout Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.28 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
              <HiRectangleStack className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Grid Layout Preferences</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            {/* Columns Selection */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <HiRectangleStack className="w-4 h-4" />
                Preferred Columns
              </label>
              <select
                name="gridColumns"
                value={localParams.gridPreferences?.columns || 'auto'}
                onChange={(e) => {
                  const value = e.target.value === 'auto' ? undefined : parseInt(e.target.value);
                  updateParam('gridPreferences', {
                    ...localParams.gridPreferences,
                    columns: value
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="auto">Auto-detect</option>
                <option value="1">1 Column</option>
                <option value="2">2 Columns</option>
                <option value="3">3 Columns</option>
                <option value="4">4 Columns</option>
              </select>
              <p className="text-xs text-gray-500">Number of columns for grid layouts</p>
            </div>

            {/* Rows Selection */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <HiRectangleStack className="w-4 h-4 rotate-90" />
                Preferred Rows
              </label>
              <select
                name="gridRows"
                value={localParams.gridPreferences?.rows || 'auto'}
                onChange={(e) => {
                  const value = e.target.value === 'auto' ? undefined : parseInt(e.target.value);
                  updateParam('gridPreferences', {
                    ...localParams.gridPreferences,
                    rows: value
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="auto">Auto-detect</option>
                <option value="1">1 Row</option>
                <option value="2">2 Rows</option>
                <option value="3">3 Rows</option>
              </select>
              <p className="text-xs text-gray-500">Number of rows for grid layouts</p>
            </div>

            {/* Cell Spacing Selection */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <HiPhoto className="w-4 h-4" />
                Cell Spacing
              </label>
              <select
                name="gridSpacing"
                value={localParams.gridPreferences?.cellSpacing || 'normal'}
                onChange={(e) => {
                  updateParam('gridPreferences', {
                    ...localParams.gridPreferences,
                    cellSpacing: e.target.value as 'tight' | 'normal' | 'spacious'
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="tight">Tight</option>
                <option value="normal">Normal</option>
                <option value="spacious">Spacious</option>
              </select>
              <p className="text-xs text-gray-500">Spacing between grid cells</p>
            </div>
          </div>

          {/* Auto-format toggle */}
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <input
              type="checkbox"
              id="autoFormat"
              checked={localParams.gridPreferences?.autoFormat !== false}
              onChange={(e) => {
                updateParam('gridPreferences', {
                  ...localParams.gridPreferences,
                  autoFormat: e.target.checked
                });
              }}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="autoFormat" className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <HiSparkles className="w-4 h-4 text-blue-600" />
              Enable auto-formatting within grid cells
            </label>
          </div>
          <p className="text-xs text-gray-500 ml-7">
            When enabled, content within each grid cell will be automatically formatted for optimal readability
          </p>
        </motion.div>

        {/* Additional Parameters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
        >
          {/* Industry Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <HiBriefcase className="w-4 h-4" />
              Industry Context
            </label>
            <select
              name="industry"
              value={localParams.industry || 'general'}
              onChange={(e) => updateParam('industry', e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="general">General</option>
              <option value="technology">Technology</option>
              <option value="healthcare">Healthcare</option>
              <option value="finance">Finance</option>
              <option value="education">Education</option>
              <option value="marketing">Marketing</option>
            </select>
            <p className="text-xs text-gray-500">What industry context should be considered?</p>
          </div>
        </motion.div>

        {/* Layout and Image Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
        >
          {/* Layout Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <HiRectangleStack className="w-4 h-4" />
              Slide Layout
            </label>
            <select
              name="layout"
              value={localParams.layout || ''}
              onChange={(e) => updateParam('layout', e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Auto-select (Recommended)</option>
              <option value="title-bullets">Title with Bullets</option>
              <option value="title-paragraph">Title with Paragraph</option>
              <option value="two-column">Two Column</option>
              <option value="image-left">Image Left</option>
              <option value="image-right">Image Right</option>
            </select>
            <p className="text-xs text-gray-500">Choose a specific layout or let AI decide</p>
          </div>

          {/* AI Image Generation */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <HiPhoto className="w-4 h-4 text-primary-500" />
              AI Image Generation
            </label>
            <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50">
              <input
                type="checkbox"
                id="with-image"
                checked={localParams.withImage || false}
                onChange={(e) => updateParam('withImage', e.target.checked)}
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
              />
              <label htmlFor="with-image" className="flex-1 cursor-pointer">
                <div className="text-sm font-medium text-gray-900">
                  Generate AI image with DALL-E
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Automatically create a relevant image for your presentation using AI
                </div>
              </label>
              <HiSparkles className={`w-5 h-5 transition-colors ${
                localParams.withImage ? "text-primary-500" : "text-gray-400"
              }`} />
            </div>
            {localParams.withImage && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <HiSparkles className="w-4 h-4" />
                  <span>AI will generate a custom image based on your presentation content</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
        {/* Enhanced Theme Gallery */}










        {/* Validation Summary - Temporarily disabled for deployment */}
        {/* <ValidationSummary
          errors={validation.errors}
          show={!validation.isValid && validation.isDirty}
          title="Please fix the following errors before generating:"
        /> */}

        {/* API Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 p-4 bg-error-50 border border-error-200 rounded-xl text-error-700"
          >
            <HiExclamationTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">
              {typeof error === 'string' ? error : error?.message || 'An error occurred'}
            </span>
          </motion.div>
        )}

        {/* Enhanced Submit Button with Validation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col items-center gap-4 pt-8"
        >
          <Button
            type="submit"
            loading={loading}
            disabled={!canSubmit}
            size="lg"
            variant="primary"
            icon={<HiSparkles className="w-6 h-6" />}
            className="px-8 sm:px-12 py-4 sm:py-5 text-lg sm:text-xl font-bold rounded-3xl shadow-xl hover:shadow-glow-lg focus:ring-4 focus:ring-indigo-300 min-h-[44px] touch-target"
            aria-describedby="form-status"
            aria-label={canSubmit ? "Generate presentation draft" : "Complete the form to generate draft"}
            onClick={handleGenerateClick}
          >
            {loading ? "Generating Draft..." : "Generate Draft"}
          </Button>

          {/* Form Status Indicator */}
          <div id="form-status" className="text-center" role="status" aria-live="polite">
            {localParams.prompt ? (
              canSubmit ? (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Ready to generate
                </div>
              ) : Object.keys(validationErrors).length > 0 ? (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Please fix validation errors
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-600 text-sm">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  Prompt needs at least 10 characters
                </div>
              )
            ) : (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                Enter a prompt to get started
              </div>
            )}
          </div>
        </motion.div>
          </form>
        </div>
      </div>
    </div>
  );
}
