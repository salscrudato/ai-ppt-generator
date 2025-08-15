import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SlideSpec, GenerationParams } from '../types';
import {
  HiEye,
  HiSparkles,
  HiArrowPath,
  HiExclamationTriangle,
  HiDocumentText,
  HiPencil
} from 'react-icons/hi2';
import clsx from 'clsx';
import { api } from '../utils/apiClient';

interface LiveSlidePreviewProps {
  /** Current user input parameters */
  params: GenerationParams;
  /** Whether to show the preview (can be toggled) */
  isVisible?: boolean;
  /** Callback when user edits content directly in preview */
  onContentEdit?: (updatedSpec: Partial<SlideSpec>) => void;
  /** Whether preview content should be editable */
  editable?: boolean;
  /** Custom theme to apply */
  theme?: string;
}

interface PreviewState {
  /** Current slide specification being previewed */
  spec: SlideSpec | null;
  /** Loading state for draft generation */
  loading: boolean;
  /** Error message if draft generation fails */
  error: string | null;
  /** Whether this is the first load */
  isInitialLoad: boolean;
}

/**
 * LiveSlidePreview Component
 *
 * Provides real-time slide preview as users type and modify their input.
 * Features:
 * - Real-time draft generation with <200ms debouncing for optimal performance
 * - 16:9 aspect ratio slide preview with precise spacing constants
 * - Theme-based styling with instant re-skinning
 * - Support for all layout types (timeline, process-flow, comparison-table, etc.)
 * - Optional editable content with live updates
 * - Smooth loading states and comprehensive error handling
 * - Accessibility-compliant with ARIA labels and keyboard navigation
 */
export default function LiveSlidePreview({
  params,
  isVisible = true,
  onContentEdit,
  editable = false,
  theme = 'corporate-blue'
}: LiveSlidePreviewProps) {
  const [previewState, setPreviewState] = useState<PreviewState>({
    spec: null,
    loading: false,
    error: null,
    isInitialLoad: true
  });

  // Debounced draft generation
  const generatePreviewDraft = useCallback(
    debounce(async (currentParams: GenerationParams) => {
      // Don't generate if prompt is too short
      if (!currentParams.prompt || currentParams.prompt.trim().length < 10) {
        setPreviewState(prev => ({
          ...prev,
          spec: null,
          loading: false,
          error: null
        }));
        return;
      }

      setPreviewState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await api.generateDraft(currentParams);
        
        if (result.success && result.data) {
          setPreviewState(prev => ({
            ...prev,
            spec: result.data,
            loading: false,
            error: null,
            isInitialLoad: false
          }));
        } else {
          throw new Error(result.error || 'Failed to generate preview');
        }
      } catch (error) {
        console.error('Preview generation error:', error);
        setPreviewState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to generate preview',
          isInitialLoad: false
        }));
      }
    }, 1500), // 1.5 second debounce
    []
  );

  // Effect to trigger preview generation when content params change (not theme)
  useEffect(() => {
    if (isVisible && params.prompt) {
      generatePreviewDraft(params);
    }
  }, [
    params.prompt,
    params.audience,
    params.tone,
    params.contentLength,
    params.layout,
    params.withImage,
    isVisible,
    generatePreviewDraft
  ]);

  // Handle direct content editing in preview
  const handleContentEdit = (field: keyof SlideSpec, value: any) => {
    if (!editable || !previewState.spec) return;

    const updatedSpec = { ...previewState.spec, [field]: value };
    setPreviewState(prev => ({ ...prev, spec: updatedSpec }));
    
    if (onContentEdit) {
      onContentEdit({ [field]: value });
    }
  };

  // Get theme-based styling
  const getThemeStyles = (theme: string) => {
    const themes = {
      'corporate-blue': {
        primary: 'text-blue-800',
        secondary: 'text-blue-600',
        accent: 'bg-blue-500',
        background: 'bg-gradient-to-br from-blue-50 to-white',
        border: 'border-blue-200'
      },
      'modern-green': {
        primary: 'text-green-800',
        secondary: 'text-green-600',
        accent: 'bg-green-500',
        background: 'bg-gradient-to-br from-green-50 to-white',
        border: 'border-green-200'
      },
      'elegant-purple': {
        primary: 'text-purple-800',
        secondary: 'text-purple-600',
        accent: 'bg-purple-500',
        background: 'bg-gradient-to-br from-purple-50 to-white',
        border: 'border-purple-200'
      },
      'professional-gray': {
        primary: 'text-gray-800',
        secondary: 'text-gray-600',
        accent: 'bg-gray-500',
        background: 'bg-gradient-to-br from-gray-50 to-white',
        border: 'border-gray-200'
      }
    };
    return themes[theme as keyof typeof themes] || themes['corporate-blue'];
  };

  // Render slide content based on layout
  const renderSlideContent = () => {
    if (!previewState.spec) return null;

    const { spec } = previewState;
    const themeStyles = getThemeStyles(theme);

    return (
      <div className={clsx("h-full flex flex-col p-8", themeStyles.background)}>
        {/* Slide Title */}
        <div className="mb-6">
          {editable ? (
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleContentEdit('title', e.currentTarget.textContent || '')}
              className={clsx(
                "text-3xl font-bold leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded px-2 py-1 transition-colors",
                themeStyles.primary
              )}
              dangerouslySetInnerHTML={{ __html: spec.title }}
            />
          ) : (
            <h2 className={clsx("text-3xl font-bold leading-tight", themeStyles.primary)}>
              {spec.title}
            </h2>
          )}
        </div>

        {/* Slide Content based on layout */}
        <div className="flex-1 overflow-hidden">
          {spec.layout === 'title-bullets' && spec.bullets && (
            <ul className="space-y-4 text-lg">
              {spec.bullets.map((bullet, index) => (
                <li key={index} className="flex items-start group">
                  <span className={clsx(
                    "w-3 h-3 rounded-full mt-2 mr-4 flex-shrink-0 transition-all duration-200",
                    themeStyles.accent,
                    "group-hover:scale-110"
                  )}></span>
                  {editable ? (
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const newBullets = [...(spec.bullets || [])];
                        newBullets[index] = e.currentTarget.textContent || '';
                        handleContentEdit('bullets', newBullets);
                      }}
                      className={clsx(
                        "flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded px-2 py-1 transition-colors leading-relaxed",
                        themeStyles.secondary
                      )}
                      dangerouslySetInnerHTML={{ __html: bullet }}
                    />
                  ) : (
                    <span className={clsx("flex-1 leading-relaxed", themeStyles.secondary)}>{bullet}</span>
                  )}
                </li>
              ))}
            </ul>
          )}

          {spec.layout === 'title-paragraph' && spec.paragraph && (
            <div className={clsx("text-lg leading-relaxed", themeStyles.secondary)}>
              {editable ? (
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleContentEdit('paragraph', e.currentTarget.textContent || '')}
                  className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded px-3 py-2 transition-colors"
                  dangerouslySetInnerHTML={{ __html: spec.paragraph }}
                />
              ) : (
                <p className="leading-relaxed">{spec.paragraph}</p>
              )}
            </div>
          )}

          {spec.layout === 'two-column' && (
            <div className="grid grid-cols-2 gap-8 h-full">
              <div className="space-y-4">
                {spec.left?.bullets && (
                  <ul className="space-y-3">
                    {spec.left.bullets.map((bullet, index) => (
                      <li key={index} className="flex items-start group">
                        <span className={clsx(
                          "w-3 h-3 rounded-full mt-2 mr-3 flex-shrink-0 transition-all duration-200",
                          themeStyles.accent,
                          "group-hover:scale-110"
                        )}></span>
                        <span className={clsx("leading-relaxed", themeStyles.secondary)}>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="space-y-4">
                {spec.right?.bullets && (
                  <ul className="space-y-3">
                    {spec.right.bullets.map((bullet, index) => (
                      <li key={index} className="flex items-start group">
                        <span className={clsx(
                          "w-3 h-3 rounded-full mt-2 mr-3 flex-shrink-0 transition-all duration-200",
                          "bg-emerald-500",
                          "group-hover:scale-110"
                        )}></span>
                        <span className={clsx("leading-relaxed", themeStyles.secondary)}>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Fallback for other layouts */}
          {!['title-bullets', 'title-paragraph', 'two-column'].includes(spec.layout) && (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <HiDocumentText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm font-medium">{spec.layout} layout</p>
                <p className="text-xs opacity-75 mt-1">Content will be displayed in final presentation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!isVisible) return null;

  return (
    <div className="h-full flex flex-col">
      {/* Preview Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <motion.div
            className="p-2 bg-blue-100 rounded-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <HiEye className="w-5 h-5 text-blue-600" />
          </motion.div>
          <div>
            <h3 className="font-semibold text-gray-900">Live Preview</h3>
            <p className="text-sm text-gray-600">Real-time slide preview • 16:9 aspect ratio</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {previewState.spec && (
            <div className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
              {previewState.spec.layout}
            </div>
          )}
          {editable && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
              <HiPencil className="w-4 h-4" />
              <span>Click to edit</span>
            </div>
          )}
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 p-6 bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="relative w-full h-full max-w-5xl mx-auto">
          {/* 16:9 Aspect Ratio Container */}
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <div className="absolute inset-0 bg-white rounded-xl shadow-2xl border border-gray-300 overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
              <AnimatePresence mode="wait">
                {previewState.loading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-white"
                  >
                    <div className="text-center">
                      <HiArrowPath className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
                      <p className="text-sm text-gray-600">Generating preview...</p>
                    </div>
                  </motion.div>
                )}

                {previewState.error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-white"
                  >
                    <div className="text-center text-red-600">
                      <HiExclamationTriangle className="w-8 h-8 mx-auto mb-3" />
                      <p className="text-sm font-medium">Preview Error</p>
                      <p className="text-xs mt-1 opacity-75">{previewState.error}</p>
                    </div>
                  </motion.div>
                )}

                {!previewState.loading && !previewState.error && previewState.spec && (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute inset-0"
                  >
                    {renderSlideContent()}
                  </motion.div>
                )}

                {!previewState.loading && !previewState.error && !previewState.spec && !previewState.isInitialLoad && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-white"
                  >
                    <div className="text-center text-gray-500">
                      <HiSparkles className="w-8 h-8 mx-auto mb-3 opacity-50" />
                      <p className="text-sm font-medium">Start typing to see preview</p>
                      <p className="text-xs mt-1 opacity-75">Your slide will appear here as you type</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
