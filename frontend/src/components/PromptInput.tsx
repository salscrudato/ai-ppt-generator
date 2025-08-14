import { useState } from 'react';
import { motion } from 'framer-motion';
import type { GenerationParams, SlideSpec } from '../types';
import {
  HiPencilSquare,
  HiArrowPath,
  HiExclamationTriangle,
  HiSparkles,
  HiUsers,
  HiChatBubbleLeftRight,
  HiPhoto,
  HiRectangleStack,
  HiEye,
  HiEyeSlash
} from 'react-icons/hi2';
import clsx from 'clsx';
import ThemeGallery from './ThemeGallery';
import LiveSlidePreview from './LiveSlidePreview';

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
  const [charCount, setCharCount] = useState(params.prompt.length);
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [enablePreviewEditing, setEnablePreviewEditing] = useState(false);

  const updateParam = <K extends keyof GenerationParams>(
    key: K,
    value: GenerationParams[K]
  ) => {
    const updated = { ...localParams, [key]: value };
    setLocalParams(updated);
    onParamsChange(updated);
  };



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Only proceed if this is an explicit form submission
    if (localParams.prompt.trim()) {
      onGenerate(localParams);
    }
  };

  const handleGenerateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (localParams.prompt.trim()) {
      onGenerate(localParams);
    }
  };

  const handlePreviewContentEdit = (updatedSpec: Partial<SlideSpec>) => {
    // When content is edited in preview, we could update the params
    // For now, we'll just log it - in a full implementation, you might want to
    // sync this back to the form or store it separately
    console.log('Preview content edited:', updatedSpec);
  };

  // Prevent accidental form submission from select elements
  const handleSelectKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Handle textarea key events - only prevent form submission on Ctrl+Enter
  const handleTextareaKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      e.stopPropagation();
      // Optionally trigger generation on Ctrl+Enter
      if (localParams.prompt.trim()) {
        handleGenerateClick(e as any);
      }
    }
  };

  return (
    <div className="min-h-screen">
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

        {/* Live Preview Controls */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            type="button"
            onClick={() => setShowLivePreview(!showLivePreview)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              showLivePreview
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {showLivePreview ? <HiEye className="w-4 h-4" /> : <HiEyeSlash className="w-4 h-4" />}
            {showLivePreview ? 'Hide Live Preview' : 'Show Live Preview'}
          </button>

          {showLivePreview && (
            <button
              type="button"
              onClick={() => setEnablePreviewEditing(!enablePreviewEditing)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                enablePreviewEditing
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              <HiPencilSquare className="w-4 h-4" />
              {enablePreviewEditing ? 'Editing Enabled' : 'Enable Editing'}
            </button>
          )}
        </div>
      </motion.div>

      {/* Two-Column Layout */}
      <div className={clsx(
        'flex flex-col lg:flex-row min-h-[calc(100vh-200px)]',
        showLivePreview ? 'lg:grid lg:grid-cols-2' : ''
      )}>
        {/* Left Column - Input Form */}
        <div className={clsx(
          'flex-1 p-6 lg:p-10 overflow-y-auto',
          showLivePreview ? 'lg:border-r lg:border-gray-200' : 'max-w-4xl mx-auto'
        )}>
          <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto lg:max-w-none">
        {/* Enhanced Main Prompt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          <label htmlFor="prompt" className="block text-lg font-bold text-slate-900 mb-2">
            What would you like to present about?
          </label>
          <div className="relative">
            <textarea
              id="prompt"
              value={localParams.prompt}
              onChange={(e) => {
                const newValue = e.target.value;
                setCharCount(newValue.length);
                updateParam('prompt', newValue);
              }}
              onKeyDown={handleTextareaKeyDown}
              placeholder="Describe your presentation topic here...

• Include specific data and metrics
• Mention your key message
• Consider your audience
• Keep it concise and focused

Example: Quarterly sales results showing 25% growth, key challenges in Q3, and strategic initiatives for Q4..."
              rows={5}
              required
              maxLength={1000}
              className={clsx(
                'input resize-none text-lg leading-relaxed pr-20 py-4 min-h-[140px]',
                charCount > 800 && 'border-amber-300 focus:border-amber-500 focus:ring-amber-500',
                charCount >= 1000 && 'border-red-300 focus:border-red-500 focus:ring-red-500'
              )}
            />
            <div className={clsx(
              'absolute bottom-4 right-4 text-sm font-semibold px-2 py-1 rounded-lg',
              charCount < 800 ? 'text-slate-400 bg-slate-100' :
              charCount < 1000 ? 'text-amber-600 bg-amber-100' : 'text-red-600 bg-red-100'
            )}>
              {charCount}/1000
            </div>

            {/* Character count indicator */}
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
              <motion.div
                className={clsx(
                  'h-1 rounded-full transition-colors',
                  charCount < 800 ? 'bg-primary-500' :
                  charCount < 1000 ? 'bg-warning-500' : 'bg-error-500'
                )}
                initial={{ width: 0 }}
                animate={{ width: `${(charCount / 1000) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Parameters Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Audience Selection */}
          <div className="space-y-3">
            <label htmlFor="audience" className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <HiUsers className="w-4 h-4 text-primary-500" />
              Target Audience
            </label>
            <select
              id="audience"
              value={localParams.audience || 'general'}
              onChange={(e) => updateParam('audience', e.target.value as any)}
              onKeyDown={handleSelectKeyDown}
              className="input"
            >
              <option value="general">General Audience</option>
              <option value="executives">Executives</option>
              <option value="technical">Technical Team</option>
              <option value="sales">Sales Team</option>
              <option value="investors">Investors</option>
              <option value="students">Students</option>
            </select>
          </div>

          {/* Tone Selection */}
          <div className="space-y-3">
            <label htmlFor="tone" className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <HiChatBubbleLeftRight className="w-4 h-4 text-primary-500" />
              Presentation Tone
            </label>
            <select
              id="tone"
              value={localParams.tone || 'professional'}
              onChange={(e) => updateParam('tone', e.target.value as any)}
              onKeyDown={handleSelectKeyDown}
              className="input"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="persuasive">Persuasive</option>
              <option value="educational">Educational</option>
              <option value="inspiring">Inspiring</option>
            </select>
          </div>
        </motion.div>

        {/* Layout and Image Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Layout Selection */}
          <div className="space-y-3">
            <label htmlFor="layout" className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <HiRectangleStack className="w-4 h-4 text-primary-500" />
              Slide Layout
            </label>
            <select
              id="layout"
              value={localParams.layout || ''}
              onChange={(e) => updateParam('layout', e.target.value as any)}
              onKeyDown={handleSelectKeyDown}
              className="input"
            >
              <option value="">Auto-select (Recommended)</option>
              <option value="title">Title Only</option>
              <option value="title-bullets">Title with Bullet Points</option>
              <option value="title-paragraph">Title with Paragraph</option>
              <option value="two-column">Two Column Layout</option>
              <option value="image-right">Image on Right</option>
              <option value="image-left">Image on Left</option>
              <option value="quote">Quote/Testimonial</option>
              <option value="chart">Chart/Data Visualization</option>
              <option value="timeline">Timeline</option>
              <option value="process-flow">Process Flow</option>
              <option value="comparison-table">Comparison Table</option>
              <option value="before-after">Before & After</option>
              <option value="problem-solution">Problem & Solution</option>
            </select>
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
              <HiSparkles className={clsx(
                "w-5 h-5 transition-colors",
                localParams.withImage ? "text-primary-500" : "text-gray-400"
              )} />
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-8"
        >
          <ThemeGallery
            selectedId={localParams.design?.theme}
            onSelect={(themeId) => updateParam('design', { ...(localParams.design || {}), theme: themeId })}
            title="Choose Your Theme"
            showCategories={true}
            compact={false}
          />
        </motion.div>









        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 p-4 bg-error-50 border border-error-200 rounded-xl text-error-700"
          >
            <HiExclamationTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </motion.div>
        )}

        {/* Enhanced Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex justify-center pt-8"
        >
          <motion.button
            type="button"
            onClick={handleGenerateClick}
            disabled={loading || !localParams.prompt.trim()}
            className={clsx(
              'btn-primary px-12 py-5 text-xl font-bold rounded-3xl shadow-xl',
              'hover:shadow-glow-lg transform transition-all duration-300',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg',
              loading && 'animate-pulse'
            )}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <HiArrowPath className="w-6 h-6 animate-spin" />
                Generating Draft...
              </>
            ) : (
              <>
                <HiSparkles className="w-6 h-6" />
                Generate Draft
              </>
            )}
          </motion.button>
        </motion.div>
          </form>
        </div>

        {/* Right Column - Live Preview */}
        {showLivePreview && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 bg-gray-50 lg:min-h-[calc(100vh-200px)]"
          >
            <LiveSlidePreview
              params={localParams}
              isVisible={showLivePreview}
              editable={enablePreviewEditing}
              onContentEdit={handlePreviewContentEdit}
              theme={localParams.design?.theme || 'corporate-blue'}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
