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

      case 'problem-solution':
        return (
          <div className="space-y-6">
            <div className="text-center py-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm">
                <HiInformationCircle className="w-4 h-4" />
                Problem-Solution Layout: Present challenges and solutions side by side
              </div>
            </div>

            {/* Main paragraph if exists */}
            {localSpec.paragraph !== undefined && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">Overview Paragraph</h4>
                </div>
                <textarea
                  value={localSpec.paragraph || ''}
                  onChange={(e) => updateSpec({ paragraph: e.target.value })}
                  placeholder="Enter overview paragraph..."
                  rows={4}
                  className="input resize-none"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column (Problem) */}
              <div className="space-y-4 p-4 border border-red-200 rounded-lg bg-red-50">
                <h4 className="text-sm font-medium text-red-700 border-b border-red-200 pb-2">Problem/Challenge</h4>

                <input
                  type="text"
                  value={localSpec.left?.heading || ''}
                  onChange={(e) => updateSpec({
                    left: { ...localSpec.left, heading: e.target.value }
                  })}
                  placeholder="Problem heading (optional)"
                  className="input"
                />

                <div className="space-y-2">
                  <label className="text-xs text-gray-600">Problem Description:</label>
                  <textarea
                    value={localSpec.left?.paragraph || ''}
                    onChange={(e) => updateSpec({
                      left: { ...localSpec.left, paragraph: e.target.value }
                    })}
                    placeholder="Describe the problem or challenge..."
                    rows={3}
                    className="input resize-none text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-gray-600">Problem Points:</label>
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
                        placeholder={`Problem point ${index + 1}`}
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
                    className="text-xs text-red-600 hover:text-red-700"
                    type="button"
                  >
                    + Add Problem Point
                  </button>
                </div>
              </div>

              {/* Right Column (Solution) */}
              <div className="space-y-4 p-4 border border-green-200 rounded-lg bg-green-50">
                <h4 className="text-sm font-medium text-green-700 border-b border-green-200 pb-2">Solution/Impact</h4>

                <input
                  type="text"
                  value={localSpec.right?.heading || ''}
                  onChange={(e) => updateSpec({
                    right: { ...localSpec.right, heading: e.target.value }
                  })}
                  placeholder="Solution heading (optional)"
                  className="input"
                />

                <div className="space-y-2">
                  <label className="text-xs text-gray-600">Solution Description:</label>
                  <textarea
                    value={localSpec.right?.paragraph || ''}
                    onChange={(e) => updateSpec({
                      right: { ...localSpec.right, paragraph: e.target.value }
                    })}
                    placeholder="Describe the solution and impact..."
                    rows={3}
                    className="input resize-none text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-gray-600">Solution Points:</label>
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
                        placeholder={`Solution point ${index + 1}`}
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
                    className="text-xs text-green-600 hover:text-green-700"
                    type="button"
                  >
                    + Add Solution Point
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'comparison-table':
        return (
          <div className="space-y-6">
            <div className="text-center py-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm">
                <HiInformationCircle className="w-4 h-4" />
                Comparison Table Layout: Compare features, options, or alternatives
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Comparison Table</h4>
              <div className="text-xs text-gray-500 bg-yellow-50 border border-yellow-200 rounded p-3">
                <strong>Note:</strong> Table editing is simplified in this editor. The full table will be properly formatted in the generated PowerPoint.
              </div>

              {localSpec.comparisonTable && (
                <div className="space-y-3">
                  <div className="text-xs text-gray-600">Table Headers:</div>
                  <div className="flex gap-2">
                    {localSpec.comparisonTable.headers?.map((header, index) => (
                      <input
                        key={index}
                        type="text"
                        value={header}
                        onChange={(e) => {
                          const headers = [...(localSpec.comparisonTable?.headers || [])];
                          headers[index] = e.target.value;
                          updateSpec({
                            comparisonTable: { ...localSpec.comparisonTable, headers }
                          });
                        }}
                        placeholder={`Header ${index + 1}`}
                        className="input flex-1 text-sm font-medium"
                      />
                    ))}
                  </div>

                  <div className="text-xs text-gray-600 mt-4">Table Rows:</div>
                  {localSpec.comparisonTable.rows?.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex gap-2 items-center">
                      {row.map((cell, cellIndex) => (
                        <input
                          key={cellIndex}
                          type="text"
                          value={cell}
                          onChange={(e) => {
                            const rows = [...(localSpec.comparisonTable?.rows || [])];
                            rows[rowIndex][cellIndex] = e.target.value;
                            updateSpec({
                              comparisonTable: { ...localSpec.comparisonTable, rows }
                            });
                          }}
                          placeholder={cellIndex === 0 ? 'Feature' : 'Value'}
                          className="input flex-1 text-sm"
                        />
                      ))}
                      <button
                        onClick={() => {
                          const rows = [...(localSpec.comparisonTable?.rows || [])];
                          rows.splice(rowIndex, 1);
                          updateSpec({
                            comparisonTable: { ...localSpec.comparisonTable, rows }
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
                      const rows = [...(localSpec.comparisonTable?.rows || [])];
                      const newRow = new Array(localSpec.comparisonTable?.headers?.length || 3).fill('');
                      rows.push(newRow);
                      updateSpec({
                        comparisonTable: { ...localSpec.comparisonTable, rows }
                      });
                    }}
                    className="text-xs text-purple-600 hover:text-purple-700"
                    type="button"
                  >
                    + Add Row
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'mixed-content':
        return (
          <div className="space-y-6">
            <div className="text-center py-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm">
                <HiInformationCircle className="w-4 h-4" />
                Mixed Content Layout: Combine paragraphs and columns for rich content
              </div>
            </div>

            {/* Main paragraph if exists */}
            {localSpec.paragraph !== undefined && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">Main Content</h4>
                </div>
                <textarea
                  value={localSpec.paragraph || ''}
                  onChange={(e) => updateSpec({ paragraph: e.target.value })}
                  placeholder="Enter main paragraph content..."
                  rows={4}
                  className="input resize-none"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 border-b pb-2">Left Section</h4>

                <input
                  type="text"
                  value={localSpec.left?.heading || ''}
                  onChange={(e) => updateSpec({
                    left: { ...localSpec.left, heading: e.target.value }
                  })}
                  placeholder="Left section heading (optional)"
                  className="input"
                />

                <div className="space-y-2">
                  <label className="text-xs text-gray-600">Paragraph Content:</label>
                  <textarea
                    value={localSpec.left?.paragraph || ''}
                    onChange={(e) => updateSpec({
                      left: { ...localSpec.left, paragraph: e.target.value }
                    })}
                    placeholder="Enter paragraph content for left section..."
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

              {/* Right Column */}
              <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 border-b pb-2">Right Section</h4>

                <input
                  type="text"
                  value={localSpec.right?.heading || ''}
                  onChange={(e) => updateSpec({
                    right: { ...localSpec.right, heading: e.target.value }
                  })}
                  placeholder="Right section heading (optional)"
                  className="input"
                />

                <div className="space-y-2">
                  <label className="text-xs text-gray-600">Paragraph Content:</label>
                  <textarea
                    value={localSpec.right?.paragraph || ''}
                    onChange={(e) => updateSpec({
                      right: { ...localSpec.right, paragraph: e.target.value }
                    })}
                    placeholder="Enter paragraph content for right section..."
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
              </div>
            </div>
          </div>
        );

      case 'timeline':
        return (
          <div className="space-y-6">
            <div className="text-center py-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm">
                <HiInformationCircle className="w-4 h-4" />
                Timeline Layout: Chronological events and milestones
              </div>
            </div>

            {/* Main paragraph if exists */}
            {localSpec.paragraph !== undefined && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">Overview</h4>
                </div>
                <textarea
                  value={localSpec.paragraph || ''}
                  onChange={(e) => updateSpec({ paragraph: e.target.value })}
                  placeholder="Enter timeline overview..."
                  rows={3}
                  className="input resize-none"
                />
              </div>
            )}

            {/* Timeline Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">Timeline Events</h4>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {(localSpec.timeline || []).length} events
                </span>
              </div>

              {(localSpec.timeline || []).map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Event {index + 1}</span>
                    <button
                      onClick={() => {
                        const timeline = [...(localSpec.timeline || [])];
                        timeline.splice(index, 1);
                        updateSpec({ timeline });
                      }}
                      className="text-xs text-red-600 hover:text-red-700"
                      type="button"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={item.date || ''}
                      onChange={(e) => {
                        const timeline = [...(localSpec.timeline || [])];
                        timeline[index] = { ...timeline[index], date: e.target.value };
                        updateSpec({ timeline });
                      }}
                      placeholder="Date/Time"
                      className="input text-sm"
                    />
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={(e) => {
                        const timeline = [...(localSpec.timeline || [])];
                        timeline[index] = { ...timeline[index], title: e.target.value };
                        updateSpec({ timeline });
                      }}
                      placeholder="Event title"
                      className="input text-sm"
                    />
                  </div>

                  <textarea
                    value={item.description || ''}
                    onChange={(e) => {
                      const timeline = [...(localSpec.timeline || [])];
                      timeline[index] = { ...timeline[index], description: e.target.value };
                      updateSpec({ timeline });
                    }}
                    placeholder="Event description..."
                    rows={2}
                    className="input resize-none text-sm"
                  />

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.milestone || false}
                      onChange={(e) => {
                        const timeline = [...(localSpec.timeline || [])];
                        timeline[index] = { ...timeline[index], milestone: e.target.checked };
                        updateSpec({ timeline });
                      }}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Major milestone</span>
                  </label>
                </div>
              ))}

              <button
                onClick={() => {
                  const timeline = [...(localSpec.timeline || []), { date: '', title: '', description: '', milestone: false }];
                  updateSpec({ timeline });
                }}
                className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-300 hover:text-primary-600 transition-colors text-sm"
                type="button"
              >
                + Add Timeline Event
              </button>
            </div>
          </div>
        );

      case 'process-flow':
        return (
          <div className="space-y-6">
            <div className="text-center py-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm">
                <HiInformationCircle className="w-4 h-4" />
                Process Flow Layout: Step-by-step procedures and workflows
              </div>
            </div>

            {/* Main paragraph if exists */}
            {localSpec.paragraph !== undefined && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">Process Overview</h4>
                </div>
                <textarea
                  value={localSpec.paragraph || ''}
                  onChange={(e) => updateSpec({ paragraph: e.target.value })}
                  placeholder="Enter process overview..."
                  rows={3}
                  className="input resize-none"
                />
              </div>
            )}

            {/* Process Steps */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">Process Steps</h4>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {(localSpec.processSteps || []).length} steps
                </span>
              </div>

              {(localSpec.processSteps || []).map((step, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Step {index + 1}</span>
                    <button
                      onClick={() => {
                        const processSteps = [...(localSpec.processSteps || [])];
                        processSteps.splice(index, 1);
                        updateSpec({ processSteps });
                      }}
                      className="text-xs text-red-600 hover:text-red-700"
                      type="button"
                    >
                      Remove
                    </button>
                  </div>

                  <input
                    type="text"
                    value={step.title || ''}
                    onChange={(e) => {
                      const processSteps = [...(localSpec.processSteps || [])];
                      processSteps[index] = { ...processSteps[index], title: e.target.value };
                      updateSpec({ processSteps });
                    }}
                    placeholder="Step title"
                    className="input text-sm"
                  />

                  <textarea
                    value={step.description || ''}
                    onChange={(e) => {
                      const processSteps = [...(localSpec.processSteps || [])];
                      processSteps[index] = { ...processSteps[index], description: e.target.value };
                      updateSpec({ processSteps });
                    }}
                    placeholder="Step description..."
                    rows={2}
                    className="input resize-none text-sm"
                  />
                </div>
              ))}

              <button
                onClick={() => {
                  const processSteps = [...(localSpec.processSteps || []), { title: '', description: '' }];
                  updateSpec({ processSteps });
                }}
                className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-300 hover:text-primary-600 transition-colors text-sm"
                type="button"
              >
                + Add Process Step
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-full text-sm mb-4">
              <HiInformationCircle className="w-4 h-4" />
              Layout: {localSpec.layout}
            </div>
            <p className="text-gray-600 text-sm mb-4">
              This layout is supported but uses a simplified editor. You can edit the basic content below.
            </p>

            {/* Generic content editor for unsupported layouts */}
            <div className="space-y-4 text-left">
              {localSpec.paragraph !== undefined && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Content</label>
                  <textarea
                    value={localSpec.paragraph || ''}
                    onChange={(e) => updateSpec({ paragraph: e.target.value })}
                    placeholder="Enter slide content..."
                    rows={4}
                    className="input resize-none"
                  />
                </div>
              )}

              {localSpec.bullets !== undefined && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Bullet Points</label>
                  {(localSpec.bullets || []).map((bullet, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => {
                          const bullets = [...(localSpec.bullets || [])];
                          bullets[index] = e.target.value;
                          updateSpec({ bullets });
                        }}
                        placeholder={`Bullet point ${index + 1}`}
                        className="input flex-1 text-sm"
                      />
                      <button
                        onClick={() => {
                          const bullets = [...(localSpec.bullets || [])];
                          bullets.splice(index, 1);
                          updateSpec({ bullets });
                        }}
                        className="text-red-600 hover:text-red-700 px-2"
                        type="button"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const bullets = [...(localSpec.bullets || []), ''];
                      updateSpec({ bullets });
                    }}
                    className="text-sm text-primary-600 hover:text-primary-700"
                    type="button"
                  >
                    + Add Bullet Point
                  </button>
                </div>
              )}
            </div>
          </div>
        );
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
                <div className="flex-1 text-sm text-gray-700 overflow-hidden">
                  {localSpec.layout === 'title' && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-gray-500">
                        <HiSparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">Title-only slide</p>
                      </div>
                    </div>
                  )}

                  {localSpec.layout === 'title-bullets' && (
                    <div className="space-y-2">
                      {(localSpec.bullets || []).slice(0, 5).map((bullet, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-xs leading-relaxed truncate">{bullet}</span>
                        </div>
                      ))}
                      {(localSpec.bullets || []).length > 5 && (
                        <div className="text-xs text-gray-500 italic">
                          +{(localSpec.bullets || []).length - 5} more items...
                        </div>
                      )}
                    </div>
                  )}

                  {localSpec.layout === 'title-paragraph' && (
                    <div className="space-y-3">
                      {localSpec.paragraph && (
                        <p className="text-xs leading-relaxed line-clamp-8">
                          {localSpec.paragraph}
                        </p>
                      )}
                    </div>
                  )}

                  {localSpec.layout === 'two-column' && (
                    <div className="grid grid-cols-2 gap-4 text-xs h-full">
                      <div className="space-y-2">
                        <div className="font-medium text-blue-600">{localSpec.left?.heading || 'Left Column'}</div>
                        {localSpec.left?.paragraph && (
                          <p className="line-clamp-3 text-xs">{localSpec.left.paragraph}</p>
                        )}
                        {localSpec.left?.bullets && (
                          <div className="space-y-1">
                            {localSpec.left.bullets.slice(0, 3).map((bullet, index) => (
                              <div key={index} className="flex items-start gap-1">
                                <div className="w-0.5 h-0.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                                <span className="truncate text-xs">{bullet}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="font-medium text-green-600">{localSpec.right?.heading || 'Right Column'}</div>
                        {localSpec.right?.paragraph && (
                          <p className="line-clamp-3 text-xs">{localSpec.right.paragraph}</p>
                        )}
                        {localSpec.right?.bullets && (
                          <div className="space-y-1">
                            {localSpec.right.bullets.slice(0, 3).map((bullet, index) => (
                              <div key={index} className="flex items-start gap-1">
                                <div className="w-0.5 h-0.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                                <span className="truncate text-xs">{bullet}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {localSpec.layout === 'problem-solution' && (
                    <div className="grid grid-cols-2 gap-3 text-xs h-full">
                      <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                        <div className="font-medium text-red-700 mb-2">{localSpec.left?.heading || 'Problem'}</div>
                        {localSpec.left?.paragraph && (
                          <p className="line-clamp-2 text-red-600 mb-2">{localSpec.left.paragraph}</p>
                        )}
                        {localSpec.left?.bullets && (
                          <div className="space-y-1">
                            {localSpec.left.bullets.slice(0, 2).map((bullet, index) => (
                              <div key={index} className="flex items-start gap-1">
                                <div className="w-0.5 h-0.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
                                <span className="truncate text-red-600">{bullet}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <div className="font-medium text-green-700 mb-2">{localSpec.right?.heading || 'Solution'}</div>
                        {localSpec.right?.paragraph && (
                          <p className="line-clamp-2 text-green-600 mb-2">{localSpec.right.paragraph}</p>
                        )}
                        {localSpec.right?.bullets && (
                          <div className="space-y-1">
                            {localSpec.right.bullets.slice(0, 2).map((bullet, index) => (
                              <div key={index} className="flex items-start gap-1">
                                <div className="w-0.5 h-0.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                                <span className="truncate text-green-600">{bullet}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {localSpec.layout === 'comparison-table' && (
                    <div className="space-y-2">
                      {localSpec.comparisonTable && (
                        <div className="overflow-hidden rounded border border-gray-300">
                          <table className="w-full text-xs">
                            <thead className="bg-blue-50">
                              <tr>
                                {localSpec.comparisonTable.headers?.slice(0, 3).map((header, index) => (
                                  <th key={index} className="px-2 py-1 text-left font-medium text-blue-700 border-b border-blue-200">
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {localSpec.comparisonTable.rows?.slice(0, 3).map((row, rowIndex) => (
                                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                  {row.slice(0, 3).map((cell, cellIndex) => (
                                    <td key={cellIndex} className="px-2 py-1 text-gray-700 border-b border-gray-200 truncate">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {localSpec.layout === 'mixed-content' && (
                    <div className="space-y-3 h-full">
                      {localSpec.paragraph && (
                        <p className="text-xs leading-relaxed line-clamp-2 bg-blue-50 p-2 rounded">
                          {localSpec.paragraph}
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-3 text-xs flex-1">
                        <div className="space-y-2">
                          <div className="font-medium text-indigo-600">{localSpec.left?.heading || 'Left Section'}</div>
                          {localSpec.left?.paragraph && (
                            <p className="line-clamp-2 text-xs">{localSpec.left.paragraph}</p>
                          )}
                          {localSpec.left?.bullets && (
                            <div className="space-y-1">
                              {localSpec.left.bullets.slice(0, 2).map((bullet, index) => (
                                <div key={index} className="flex items-start gap-1">
                                  <div className="w-0.5 h-0.5 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0" />
                                  <span className="truncate text-xs">{bullet}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="font-medium text-purple-600">{localSpec.right?.heading || 'Right Section'}</div>
                          {localSpec.right?.paragraph && (
                            <p className="line-clamp-2 text-xs">{localSpec.right.paragraph}</p>
                          )}
                          {localSpec.right?.bullets && (
                            <div className="space-y-1">
                              {localSpec.right.bullets.slice(0, 2).map((bullet, index) => (
                                <div key={index} className="flex items-start gap-1">
                                  <div className="w-0.5 h-0.5 bg-purple-500 rounded-full mt-1.5 flex-shrink-0" />
                                  <span className="truncate text-xs">{bullet}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {localSpec.layout === 'quote' && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="text-2xl text-gray-400 mb-2">"</div>
                        <p className="text-xs italic text-gray-600 line-clamp-3">
                          {localSpec.bullets?.[0] || 'Quote text will appear here'}
                        </p>
                        <div className="text-2xl text-gray-400 mt-2">"</div>
                      </div>
                    </div>
                  )}

                  {localSpec.layout === 'chart' && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-gray-500">
                        <div className="w-16 h-12 mx-auto mb-2 bg-blue-100 rounded flex items-center justify-center">
                          <div className="w-8 h-8 bg-blue-300 rounded"></div>
                        </div>
                        <p className="text-xs">{localSpec.chart?.title || 'Chart'}</p>
                        <p className="text-xs opacity-75">{localSpec.chart?.type || 'bar'} chart</p>
                      </div>
                    </div>
                  )}

                  {localSpec.layout === 'timeline' && (
                    <div className="space-y-2 h-full overflow-y-auto">
                      {localSpec.paragraph && (
                        <p className="text-xs leading-relaxed line-clamp-2 bg-blue-50 p-2 rounded mb-2">
                          {localSpec.paragraph}
                        </p>
                      )}
                      {(localSpec.timeline || []).slice(0, 4).map((item, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-blue-700">{item.date}</span>
                              {item.milestone && (
                                <span className="w-1 h-1 bg-yellow-500 rounded-full" />
                              )}
                            </div>
                            <p className="text-xs font-medium truncate">{item.title}</p>
                            {item.description && (
                              <p className="text-xs text-gray-600 line-clamp-1">{item.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                      {(localSpec.timeline || []).length > 4 && (
                        <div className="text-xs text-gray-500 italic text-center">
                          +{(localSpec.timeline || []).length - 4} more events...
                        </div>
                      )}
                    </div>
                  )}

                  {localSpec.layout === 'process-flow' && (
                    <div className="space-y-2 h-full overflow-y-auto">
                      {localSpec.paragraph && (
                        <p className="text-xs leading-relaxed line-clamp-2 bg-blue-50 p-2 rounded mb-2">
                          {localSpec.paragraph}
                        </p>
                      )}
                      {(localSpec.processSteps || []).slice(0, 4).map((step, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                          <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{step.title}</p>
                            {step.description && (
                              <p className="text-xs text-gray-600 line-clamp-2">{step.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                      {(localSpec.processSteps || []).length > 4 && (
                        <div className="text-xs text-gray-500 italic text-center">
                          +{(localSpec.processSteps || []).length - 4} more steps...
                        </div>
                      )}
                    </div>
                  )}

                  {/* Fallback for other layouts */}
                  {!['title', 'title-bullets', 'title-paragraph', 'two-column', 'problem-solution', 'comparison-table', 'mixed-content', 'quote', 'chart', 'timeline', 'process-flow'].includes(localSpec.layout) && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-gray-500">
                        <HiDocumentText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs font-medium">{localSpec.layout} layout</p>
                        <p className="text-xs opacity-75">Content will be displayed in final presentation</p>
                        {localSpec.paragraph && (
                          <p className="text-xs mt-2 line-clamp-2 bg-gray-50 p-2 rounded">{localSpec.paragraph}</p>
                        )}
                        {localSpec.bullets && localSpec.bullets.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {localSpec.bullets.slice(0, 3).map((bullet, index) => (
                              <div key={index} className="flex items-start gap-1 text-xs">
                                <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0" />
                                <span className="truncate">{bullet}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
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
