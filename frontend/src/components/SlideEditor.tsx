import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SlideSpec } from '../types';
import {
  HiPencil,
  HiPlus,
  HiXMark,
  HiArrowLeft,
  HiSparkles,
  HiArrowPath,
  HiExclamationTriangle,
  HiRectangleStack,
  HiCog6Tooth,
  HiDocumentText,
  HiInformationCircle,
  HiEye
} from 'react-icons/hi2';
import clsx from 'clsx';

interface SlideEditorProps {
  spec: SlideSpec;
  loading: boolean;
  error?: string;
  onSpecChange: (spec: SlideSpec) => void;
  onGenerate: () => void;
  onBack: () => void;
}

export default function SlideEditor({ 
  spec, 
  loading, 
  error, 
  onSpecChange, 
  onGenerate, 
  onBack 
}: SlideEditorProps) {
  const [localSpec, setLocalSpec] = useState(spec);

  const updateSpec = (updates: Partial<SlideSpec>) => {
    const updated = { ...localSpec, ...updates };
    setLocalSpec(updated);
    onSpecChange(updated);
  };

  const updateBullet = (index: number, value: string) => {
    const bullets = [...(localSpec.bullets || [])];
    bullets[index] = value;
    updateSpec({ bullets });
  };

  const addBullet = () => {
    const bullets = [...(localSpec.bullets || []), ''];
    updateSpec({ bullets });
  };

  const removeBullet = (index: number) => {
    const bullets = (localSpec.bullets || []).filter((_, i) => i !== index);
    updateSpec({ bullets });
  };

  const renderLayoutEditor = () => {
    switch (localSpec.layout) {
      case 'title':
        return (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm">
              <HiInformationCircle className="w-4 h-4" />
              This is a title-only slide. The title will be prominently displayed.
            </div>
          </div>
        );

      case 'title-bullets':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">Bullet Points</h4>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {(localSpec.bullets || []).length} items
              </span>
            </div>

            <AnimatePresence>
              {(localSpec.bullets || []).map((bullet, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex gap-3 items-start"
                >
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-3 flex-shrink-0"></div>
                  <input
                    type="text"
                    value={bullet}
                    onChange={(e) => updateBullet(index, e.target.value)}
                    placeholder={`Bullet point ${index + 1}`}
                    className="input flex-1"
                  />
                  <button
                    onClick={() => removeBullet(index)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    type="button"
                  >
                    <HiXMark className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            <motion.button
              onClick={addBullet}
              className="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 flex items-center justify-center gap-2"
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <HiPlus className="w-4 h-4" />
              Add Bullet Point
            </motion.button>
          </div>
        );

      case 'title-paragraph':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">Paragraph Content</h4>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {(localSpec.paragraph || '').length}/800 chars
              </span>
            </div>
            <textarea
              value={localSpec.paragraph || ''}
              onChange={(e) => updateSpec({ paragraph: e.target.value })}
              placeholder="Enter paragraph content that explains, tells a story, or provides context..."
              rows={6}
              maxLength={800}
              className="input resize-none"
            />
            <div className="text-xs text-gray-500">
              Use paragraph format for narrative explanations, stories, or complex concepts that need flowing text.
            </div>
          </div>
        );



      case 'two-column':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column Editor */}
              <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 border-b pb-2">Left Column</h4>

                <input
                  type="text"
                  value={localSpec.left?.heading || ''}
                  onChange={(e) => updateSpec({
                    left: { ...localSpec.left, heading: e.target.value }
                  })}
                  placeholder="Left column heading (optional)"
                  className="input"
                />

                <div className="space-y-2">
                  <label className="text-xs text-gray-600">Paragraph Content:</label>
                  <textarea
                    value={localSpec.left?.paragraph || ''}
                    onChange={(e) => updateSpec({
                      left: { ...localSpec.left, paragraph: e.target.value }
                    })}
                    placeholder="Enter paragraph content for left column..."
                    rows={3}
                    className="input resize-none text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-gray-600">Bullet Points:</label>
                  {(localSpec.left?.bullets || []).map((bullet, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => {
                          const bullets = [...(localSpec.left?.bullets || [])];
                          bullets[index] = e.target.value;
                          updateSpec({
                            left: { ...localSpec.left, bullets }
                          });
                        }}
                        placeholder={`Left bullet ${index + 1}`}
                        className="input flex-1 text-sm"
                      />
                      <button
                        onClick={() => {
                          const bullets = [...(localSpec.left?.bullets || [])];
                          bullets.splice(index, 1);
                          updateSpec({
                            left: { ...localSpec.left, bullets }
                          });
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 rounded"
                        type="button"
                      >
                        <HiXMark className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const bullets = [...(localSpec.left?.bullets || []), ''];
                      updateSpec({
                        left: { ...localSpec.left, bullets }
                      });
                    }}
                    className="text-xs text-primary-600 hover:text-primary-700"
                    type="button"
                  >
                    + Add Left Bullet
                  </button>
                </div>
              </div>

              {/* Right Column Editor */}
              <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 border-b pb-2">Right Column</h4>

                <input
                  type="text"
                  value={localSpec.right?.heading || ''}
                  onChange={(e) => updateSpec({
                    right: { ...localSpec.right, heading: e.target.value }
                  })}
                  placeholder="Right column heading (optional)"
                  className="input"
                />

                <div className="space-y-2">
                  <label className="text-xs text-gray-600">Paragraph Content:</label>
                  <textarea
                    value={localSpec.right?.paragraph || ''}
                    onChange={(e) => updateSpec({
                      right: { ...localSpec.right, paragraph: e.target.value }
                    })}
                    placeholder="Enter paragraph content for right column..."
                    rows={3}
                    className="input resize-none text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-gray-600">Bullet Points:</label>
                  {(localSpec.right?.bullets || []).map((bullet, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => {
                          const bullets = [...(localSpec.right?.bullets || [])];
                          bullets[index] = e.target.value;
                          updateSpec({
                            right: { ...localSpec.right, bullets }
                          });
                        }}
                        placeholder={`Right bullet ${index + 1}`}
                        className="input flex-1 text-sm"
                      />
                      <button
                        onClick={() => {
                          const bullets = [...(localSpec.right?.bullets || [])];
                          bullets.splice(index, 1);
                          updateSpec({
                            right: { ...localSpec.right, bullets }
                          });
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 rounded"
                        type="button"
                      >
                        <HiXMark className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const bullets = [...(localSpec.right?.bullets || []), ''];
                      updateSpec({
                        right: { ...localSpec.right, bullets }
                      });
                    }}
                    className="text-xs text-primary-600 hover:text-primary-700"
                    type="button"
                  >
                    + Add Right Bullet
                  </button>
                </div>
                {localSpec.right?.imagePrompt && (
                  <div className="form-group">
                    <label>Image Description</label>
                    <input
                      type="text"
                      value={localSpec.right.imagePrompt}
                      onChange={(e) => updateSpec({
                        right: { ...localSpec.right, imagePrompt: e.target.value }
                      })}
                      placeholder="Describe the image to generate"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'quote':
        return (
          <div className="layout-editor">
            <h4>Quote Text</h4>
            <textarea
              value={localSpec.bullets?.[0] || ''}
              onChange={(e) => updateSpec({ bullets: [e.target.value] })}
              placeholder="Enter the quote text"
              rows={3}
            />
          </div>
        );

      case 'chart':
        return (
          <div className="layout-editor">
            <h4>Chart Configuration</h4>
            <div className="form-group">
              <label>Chart Title</label>
              <input
                type="text"
                value={localSpec.chart?.title || ''}
                onChange={(e) => updateSpec({
                  chart: { ...localSpec.chart!, title: e.target.value }
                })}
                placeholder="Chart title"
              />
            </div>
            <div className="form-group">
              <label>Chart Type</label>
              <select
                value={localSpec.chart?.type || 'bar'}
                onChange={(e) => updateSpec({
                  chart: { ...localSpec.chart!, type: e.target.value as any }
                })}
              >
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="pie">Pie Chart</option>
              </select>
            </div>
            <p>Chart data editing coming soon...</p>
          </div>
        );

      default:
        return <div>Unknown layout</div>;
    }
  };

  return (
    <div className="p-10 space-y-10">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-4 mb-6">
          <motion.div
            className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl border border-purple-200"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <HiPencil className="w-7 h-7 text-purple-600" />
          </motion.div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Edit Your Slide</h2>
        </div>
        <p className="text-lg text-slate-600 leading-relaxed">
          Fine-tune every detail to match your vision perfectly.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Editor Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Basic Settings */}
          <div className="card p-6 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <HiCog6Tooth className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Basic Settings</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Slide Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={localSpec.title}
                  onChange={(e) => updateSpec({ title: e.target.value })}
                  placeholder="Enter slide title"
                  className="input"
                />
              </div>


            </div>
          </div>

          {/* Layout-Specific Editor */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <HiRectangleStack className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Content Editor</h3>
            </div>
            {renderLayoutEditor()}
          </div>

          {/* Speaker Notes */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <HiDocumentText className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Speaker Notes</h3>
            </div>
            <textarea
              id="notes"
              value={localSpec.notes || ''}
              onChange={(e) => updateSpec({ notes: e.target.value })}
              placeholder="Add speaker notes (optional)"
              rows={4}
              className="input resize-none"
            />
          </div>
        </motion.div>

        {/* Live Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:sticky lg:top-8"
        >
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <HiEye className="w-5 h-5 text-blue-500" />
              Live Preview
            </h3>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 aspect-video border border-gray-200">
              <div className="h-full flex flex-col">
                <h4 className="text-lg font-bold text-gray-900 text-center mb-4 truncate">
                  {localSpec.title || 'Slide Title'}
                </h4>
                <div className="flex-1 text-sm text-gray-700">
                  {localSpec.layout === 'title-bullets' && localSpec.bullets && (
                    <div className="space-y-2">
                      {localSpec.bullets.slice(0, 4).map((bullet, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="truncate">{bullet}</span>
                        </div>
                      ))}
                      {localSpec.bullets.length > 4 && (
                        <div className="text-gray-500 text-xs">+{localSpec.bullets.length - 4} more...</div>
                      )}
                    </div>
                  )}
                  {localSpec.layout === 'title' && (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Title-only layout
                    </div>
                  )}
                  {localSpec.layout === 'quote' && localSpec.bullets?.[0] && (
                    <div className="flex items-center justify-center h-full">
                      <blockquote className="text-center italic text-gray-700">
                        "{localSpec.bullets[0].slice(0, 100)}..."
                      </blockquote>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

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

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="flex flex-col sm:flex-row gap-4 justify-between pt-6 border-t border-gray-200"
      >
        <button
          onClick={onBack}
          className="btn-secondary order-2 sm:order-1"
        >
          <HiArrowLeft className="w-4 h-4" />
          Back to Preview
        </button>

        <button
          onClick={onGenerate}
          disabled={loading || !localSpec.title.trim()}
          className={clsx(
            'btn-primary px-8 py-4 text-lg font-semibold rounded-2xl shadow-large order-1 sm:order-2',
            'hover:shadow-glow-lg transform transition-all duration-300',
            loading && 'animate-pulse'
          )}
        >
          {loading ? (
            <>
              <HiArrowPath className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <HiSparkles className="w-5 h-5" />
              Generate PowerPoint
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
