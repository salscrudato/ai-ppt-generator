/**
 * PresentationManager Component
 * 
 * Main component for managing multi-slide presentations with drag-and-drop functionality.
 * Features:
 * - Slide thumbnail view with reordering
 * - Add, edit, duplicate, and delete slides
 * - Presentation-wide settings
 * - Export to PowerPoint
 * - Responsive layout
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiPlus,
  HiArrowDownTray,
  HiPresentationChartLine,
  HiArrowLeft,
  HiEye,
  HiPaintBrush
} from 'react-icons/hi2';
import DraggableSlideList from './DraggableSlideList';
import SlideEditor from './SlideEditor';

import ThemeCarousel from './ThemeCarousel';

import type { Presentation, SlideSpec } from '../types';

// Simple placeholder components
const SlidePreviewPlaceholder = ({ draft, onEdit, onBack }: any) => (
  <div className="p-8 text-center">
    <h3 className="text-lg font-semibold mb-4">Slide Preview</h3>
    <div className="bg-gray-100 p-6 rounded-lg mb-4">
      <h4 className="font-medium">{draft.title}</h4>
      <p className="text-sm text-gray-600 mt-2">Preview functionality removed</p>
    </div>
    <div className="flex gap-2 justify-center">
      <button onClick={onEdit} className="px-4 py-2 bg-blue-500 text-white rounded">Edit</button>
      <button onClick={onBack} className="px-4 py-2 bg-gray-500 text-white rounded">Back</button>
    </div>
  </div>
);

const ThemePreviewPlaceholder = ({ theme }: any) => (
  <div className="bg-gray-100 p-4 rounded-lg">
    <div className="text-sm text-gray-600">Theme Preview: {theme?.name || 'Default'}</div>
    <div className="text-xs text-gray-500 mt-1">Preview functionality removed</div>
  </div>
);
import { createNewSlide, generateSlideId } from '../types';
import { useTheme } from '../utils/themeUtils';
import { useThemeContext } from '../contexts/ThemeContext';
import { useThemeSync } from '../hooks/useThemeSync';

interface PresentationManagerProps {
  /** The presentation to manage */
  presentation: Presentation;
  /** Callback when presentation is updated */
  onPresentationUpdate: (presentation: Presentation) => void;
  /** Callback when returning to single slide mode */
  onBackToSingle?: () => void;
  /** Callback when generating the presentation */
  onGenerate?: (presentation: Presentation) => void;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string;
}

type ViewMode = 'overview' | 'edit' | 'preview' | 'themes';

export default function PresentationManager({
  presentation,
  onPresentationUpdate,
  onBackToSingle,
  onGenerate,
  loading = false,
  error
}: PresentationManagerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedSlideId, setSelectedSlideId] = useState<string | undefined>(
    presentation.slides[0]?.id
  );
  const [editingSlide, setEditingSlide] = useState<SlideSpec | null>(null);
  const [previewingSlide, setPreviewingSlide] = useState<SlideSpec | null>(null);

  // Get the currently selected slide
  const selectedSlide = presentation.slides.find(slide => slide.id === selectedSlideId);

  // Enhanced theme synchronization
  const themeSync = useThemeSync({
    mode: 'presentation',
    initialThemeId: presentation.settings.theme,
    debug: false // Disabled to reduce console spam
  });

  // Get current theme using the enhanced system
  const currentTheme = useTheme(themeSync.themeId);

  // Sync presentation theme with the enhanced system
  useEffect(() => {
    const presentationTheme = presentation.settings.theme;
    if (presentationTheme && presentationTheme !== themeSync.themeId) {
      themeSync.setTheme(presentationTheme, 'presentation-settings');
      console.log('🔄 PresentationManager: Synced presentation theme', {
        theme: presentationTheme,
        presentationId: presentation.id,
        previous: themeSync.themeId
      });
    }
  }, [presentation.settings.theme, presentation.id, themeSync]);

  // Update presentation helper
  const updatePresentation = (updates: Partial<Presentation>) => {
    const updatedPresentation = {
      ...presentation,
      ...updates,
      metadata: {
        ...presentation.metadata,
        updatedAt: new Date()
      }
    };
    onPresentationUpdate(updatedPresentation);
  };

  // Slide management functions
  const handleSlidesReorder = (newSlides: SlideSpec[]) => {
    updatePresentation({ slides: newSlides });
  };

  const handleSlideSelect = (slide: SlideSpec) => {
    setSelectedSlideId(slide.id);
  };

  const handleSlideEdit = (slide: SlideSpec) => {
    setEditingSlide(slide);
    setViewMode('edit');
  };

  const handleSlidePreview = (slide: SlideSpec) => {
    setPreviewingSlide(slide);
    setViewMode('preview');
  };

  const handleSlideDuplicate = (slide: SlideSpec) => {
    const newSlide: SlideSpec = {
      ...slide,
      id: generateSlideId(),
      title: `${slide.title} (Copy)`
    };
    
    const slideIndex = presentation.slides.findIndex(s => s.id === slide.id);
    const newSlides = [...presentation.slides];
    newSlides.splice(slideIndex + 1, 0, newSlide);
    
    updatePresentation({ slides: newSlides });
    setSelectedSlideId(newSlide.id);
  };

  const handleSlideDelete = (slide: SlideSpec) => {
    if (presentation.slides.length <= 1) {
      alert('Cannot delete the last slide in the presentation.');
      return;
    }

    const newSlides = presentation.slides.filter(s => s.id !== slide.id);
    updatePresentation({ slides: newSlides });

    // Update selection if deleted slide was selected
    if (selectedSlideId === slide.id) {
      setSelectedSlideId(newSlides[0]?.id);
    }
  };

  const handleAddSlide = () => {
    const newSlide = createNewSlide({
      title: `Slide ${presentation.slides.length + 1}`
    });
    
    const newSlides = [...presentation.slides, newSlide];
    updatePresentation({ slides: newSlides });
    setSelectedSlideId(newSlide.id);
  };

  const handleSlideUpdate = (updatedSlide: SlideSpec) => {
    const newSlides = presentation.slides.map(slide =>
      slide.id === updatedSlide.id ? updatedSlide : slide
    );
    updatePresentation({ slides: newSlides });
    setEditingSlide(null);
    setViewMode('overview');
  };

  const handleBackToOverview = () => {
    setEditingSlide(null);
    setPreviewingSlide(null);
    setViewMode('overview');
  };

  const handleThemeSelect = (themeId: string) => {
    // Ensure only one theme is selected at a time
    // If empty string is passed (deselection), use default theme
    const selectedThemeId = themeId && themeId.trim() !== '' ? themeId : 'corporate-blue';

    // Update presentation settings
    updatePresentation({
      settings: {
        ...presentation.settings,
        theme: selectedThemeId
      }
    });

    // Use enhanced theme sync to ensure consistency across all components
    themeSync.setTheme(selectedThemeId, 'theme-selection');

    // Save theme for presentation mode
    themeSync.setThemeForMode('presentation', selectedThemeId);

    // Log for debugging
    console.log('🎨 PresentationManager: Theme synchronized', {
      selected: selectedThemeId,
      previous: presentation.settings.theme,
      syncState: themeSync.isSyncing
    });
  };

  const handleShowThemes = () => {
    setViewMode('themes');
  };

  const handleGenerate = () => {
    onGenerate?.(presentation);
  };

  // Render different view modes
  const renderContent = () => {
    switch (viewMode) {
      case 'edit':
        if (!editingSlide) return null;
        return (
          <SlideEditor
            spec={editingSlide}
            loading={loading}
            error={error}
            onSpecChange={handleSlideUpdate}
            onGenerate={() => handleSlideUpdate(editingSlide)}
            onBack={handleBackToOverview}
            theme={currentTheme}
          />
        );

      case 'preview':
        if (!previewingSlide) return null;
        return (
          <SlidePreviewPlaceholder
            draft={previewingSlide}
            onEdit={() => {
              setEditingSlide(previewingSlide);
              setViewMode('edit');
            }}
            onBack={handleBackToOverview}
          />
        );

      case 'themes':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToOverview}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <HiArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                    <HiPaintBrush className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Choose Presentation Theme</h2>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Theme Carousel */}
              <div className="lg:col-span-3">
                <ThemeCarousel
                  selectedId={themeSync.themeId}
                  onSelect={handleThemeSelect}
                  title="Available Themes"
                  showCategories={true}
                />
              </div>

              {/* Theme Preview */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Preview</h3>
                {selectedSlide && (
                  <ThemePreviewPlaceholder
                    theme={currentTheme}
                    sampleSlide={selectedSlide}
                  />
                )}
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-medium text-slate-900 mb-2">{currentTheme.name}</h4>
                  <p className="text-sm text-slate-600 mb-3">{currentTheme.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-700">Colors:</span>
                    <div className="flex gap-1">
                      <div
                        className="w-4 h-4 rounded border border-slate-200"
                        style={{ backgroundColor: currentTheme.colors.primary }}
                        title="Primary"
                      />
                      <div
                        className="w-4 h-4 rounded border border-slate-200"
                        style={{ backgroundColor: currentTheme.colors.secondary }}
                        title="Secondary"
                      />
                      <div
                        className="w-4 h-4 rounded border border-slate-200"
                        style={{ backgroundColor: currentTheme.colors.accent }}
                        title="Accent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            {/* Slide List */}
            <div className="lg:col-span-1 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  Slides ({presentation.slides.length})
                </h3>
                <button
                  onClick={handleAddSlide}
                  className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                  disabled={loading}
                >
                  <HiPlus className="w-4 h-4" />
                  Add Slide
                </button>
              </div>

              <DraggableSlideList
                slides={presentation.slides}
                selectedSlideId={selectedSlideId}
                onSlidesReorder={handleSlidesReorder}
                onSlideSelect={handleSlideSelect}
                onSlideEdit={handleSlideEdit}
                onSlideDuplicate={handleSlideDuplicate}
                onSlideDelete={handleSlideDelete}
                onSlidePreview={handleSlidePreview}
                loading={loading}
                className="max-h-[calc(100vh-300px)] overflow-y-auto"
              />
            </div>

            {/* Selected Slide Preview */}
            <div className="lg:col-span-2">
              {selectedSlide ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Preview: {selectedSlide.title}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSlidePreview(selectedSlide)}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                      >
                        <HiEye className="w-4 h-4" />
                        Full Preview
                      </button>
                      <button
                        onClick={() => handleSlideEdit(selectedSlide)}
                        className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                      >
                        Edit Slide
                      </button>
                    </div>
                  </div>

                  {/* Large slide preview with theme */}
                  <div
                    className="rounded-xl shadow-lg border overflow-hidden"
                    style={{
                      backgroundColor: currentTheme.colors.background,
                      borderColor: currentTheme.colors.borders.medium
                    }}
                  >
                    <div
                      className="aspect-video p-8"
                      style={{
                        background: `linear-gradient(135deg, ${currentTheme.colors.background} 0%, ${currentTheme.colors.surface} 100%)`
                      }}
                    >
                      {/* Themed slide content preview */}
                      <div className="h-full flex flex-col">
                        <h1
                          className="text-2xl font-bold mb-4"
                          style={{ color: currentTheme.colors.text.primary }}
                        >
                          {selectedSlide.title}
                        </h1>
                        {selectedSlide.bullets && selectedSlide.bullets.length > 0 && (
                          <div className="space-y-2">
                            {selectedSlide.bullets.map((bullet, index) => (
                              <div key={index} className="flex items-start gap-3">
                                <div
                                  className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                                  style={{ backgroundColor: currentTheme.colors.primary }}
                                />
                                <span
                                  className="leading-relaxed"
                                  style={{ color: currentTheme.colors.text.secondary }}
                                >
                                  {bullet}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        {selectedSlide.paragraph && (
                          <p
                            className="leading-relaxed"
                            style={{ color: currentTheme.colors.text.secondary }}
                          >
                            {selectedSlide.paragraph}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-slate-500">
                  Select a slide to preview
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-10 space-y-8 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          {onBackToSingle && (
            <button
              onClick={onBackToSingle}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Back to single slide mode"
            >
              <HiArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl">
              <HiPresentationChartLine className="w-7 h-7 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {presentation.title}
              </h1>
              <p className="text-slate-600">
                {presentation.slides.length} slide{presentation.slides.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShowThemes}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
          >
            <HiPaintBrush className="w-5 h-5" />
            Themes
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading || presentation.slides.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <HiArrowDownTray className="w-5 h-5" />
            {loading ? 'Generating...' : 'Generate PowerPoint'}
          </button>
        </div>
      </motion.div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700"
        >
          {error}
        </motion.div>
      )}

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
      >
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
