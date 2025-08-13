import type { SlideSpec } from '../types';
import { motion } from 'framer-motion';
import {
  HiEye,
  HiPhoto,
  HiArrowLeft,
  HiPencil,
  HiSparkles,
  HiInformationCircle,
  HiDocumentText
} from 'react-icons/hi2';
import clsx from 'clsx';
import { getLayoutById } from '../layouts/presentationLayouts';

interface SlidePreviewProps {
  draft: SlideSpec;
  loading: boolean;
  error?: string;
  onEdit: () => void;
  onGenerate: () => void;
  onBack: () => void;
}

export default function SlidePreview({
  draft,
  loading,
  error,
  onEdit,
  onGenerate,
  onBack
}: SlidePreviewProps) {
  // Get the selected layout or fallback to content-bullets
  const selectedLayout = getLayoutById(draft.design?.layout || 'content-bullets');

  const renderSlideContent = () => {
    switch (draft.layout) {
      case 'title':
        return (
          <div className="flex items-center justify-center h-full">
            <h1 className="text-3xl md:text-4xl font-bold text-center text-slate-800 leading-tight">
              {draft.title}
            </h1>
          </div>
        );

      case 'title-bullets':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-center mb-8 text-slate-800">
              {draft.title}
            </h1>
            {draft.bullets && (
              <div className="space-y-3">
                {draft.bullets.map((bullet, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-indigo-500" />
                    <span className="leading-relaxed text-slate-700">
                      {bullet}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        );

      case 'title-paragraph':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              {draft.title}
            </h1>
            {draft.paragraph && (
              <p className="text-slate-700 leading-relaxed text-lg">
                {draft.paragraph}
              </p>
            )}
          </div>
        );

      case 'two-column':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              {draft.title}
            </h1>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                {draft.left?.heading && (
                  <h3 className="text-lg font-semibold text-slate-800 border-b border-indigo-200 pb-2">
                    {draft.left.heading}
                  </h3>
                )}
                {draft.left?.paragraph && (
                  <p className="text-slate-700 leading-relaxed">
                    {draft.left.paragraph}
                  </p>
                )}
                {draft.left?.bullets && (
                  <div className="space-y-2">
                    {draft.left.bullets.map((bullet, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-indigo-500" />
                        <span className="text-slate-700">{bullet}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {draft.right?.heading && (
                  <h3 className="text-lg font-semibold text-slate-800 border-b border-indigo-200 pb-2">
                    {draft.right.heading}
                  </h3>
                )}
                {draft.right?.paragraph && (
                  <p className="text-slate-700 leading-relaxed">
                    {draft.right.paragraph}
                  </p>
                )}
                {draft.right?.bullets && (
                  <div className="space-y-2">
                    {draft.right.bullets.map((bullet, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-indigo-500" />
                        <span className="text-slate-700">{bullet}</span>
                      </div>
                    ))}
                  </div>
                )}
                {draft.right?.imagePrompt && (
                  <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                    <HiPhoto className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">Image: {draft.right.imagePrompt}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'image-right':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              {draft.title}
            </h1>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                {draft.paragraph && (
                  <p className="text-slate-700 leading-relaxed">
                    {draft.paragraph}
                  </p>
                )}
                {draft.bullets && (
                  <div className="space-y-2">
                    {draft.bullets.map((bullet, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-indigo-500" />
                        <span className="text-slate-700">{bullet}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                <HiPhoto className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-sm text-slate-600">
                  {draft.right?.imagePrompt || 'Visual content will be generated here'}
                </p>
              </div>
            </div>
          </div>
        );

      case 'timeline':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              {draft.title}
            </h1>
            {draft.timeline && draft.timeline.length > 0 ? (
              <div className="space-y-6">
                {draft.timeline.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="flex flex-col items-center">
                      <div className={clsx(
                        "w-4 h-4 rounded-full flex-shrink-0",
                        item.milestone ? "bg-indigo-600" : "bg-indigo-400"
                      )} />
                      {index < (draft.timeline?.length || 0) - 1 && (
                        <div className="w-0.5 h-12 bg-indigo-200 mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={clsx(
                          "text-sm font-medium px-2 py-1 rounded",
                          item.milestone
                            ? "bg-indigo-100 text-indigo-800"
                            : "bg-slate-100 text-slate-600"
                        )}>
                          {item.date}
                        </span>
                        {item.milestone && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                            Milestone
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-800 mb-1">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                <div className="text-center text-slate-600">
                  <p className="mb-2">Timeline layout selected, but timeline data is being processed...</p>
                  <p className="text-sm">The AI generated a timeline layout but the timeline content may have been filtered during validation.</p>
                  {draft.paragraph && (
                    <div className="mt-4 text-left">
                      <p className="text-slate-700 leading-relaxed">{draft.paragraph}</p>
                    </div>
                  )}
                  {draft.bullets && draft.bullets.length > 0 && (
                    <div className="mt-4 text-left space-y-2">
                      {draft.bullets.map((bullet, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-indigo-500" />
                          <span className="text-slate-700">{bullet}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'mixed-content':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              {draft.title}
            </h1>
            <div className="grid grid-cols-2 gap-8">
              {/* Left column - text content */}
              <div className="space-y-4">
                {draft.paragraph && (
                  <p className="text-slate-700 leading-relaxed">
                    {draft.paragraph}
                  </p>
                )}
                {draft.bullets && (
                  <div className="space-y-2">
                    {draft.bullets.map((bullet, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-indigo-500" />
                        <span className="text-slate-700">{bullet}</span>
                      </div>
                    ))}
                  </div>
                )}
                {draft.left && (
                  <div className="space-y-3">
                    {draft.left.heading && (
                      <h3 className="text-lg font-semibold text-slate-800 border-b border-indigo-200 pb-2">
                        {draft.left.heading}
                      </h3>
                    )}
                    {draft.left.paragraph && (
                      <p className="text-slate-700 leading-relaxed">
                        {draft.left.paragraph}
                      </p>
                    )}
                    {draft.left.bullets && (
                      <div className="space-y-2">
                        {draft.left.bullets.map((bullet, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-indigo-500" />
                            <span className="text-slate-700">{bullet}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {draft.left.metrics && (
                      <div className="grid grid-cols-2 gap-3">
                        {draft.left.metrics.map((metric, index) => (
                          <div key={index} className="bg-slate-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-indigo-600">
                              {metric.value}{metric.unit}
                            </div>
                            <div className="text-xs text-slate-600 mt-1">
                              {metric.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right column - additional content or image */}
              <div className="space-y-4">
                {draft.right?.imagePrompt ? (
                  <div className="bg-slate-100 rounded-lg p-6 flex items-center justify-center h-48">
                    <div className="text-center text-slate-500">
                      <HiPhoto className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">AI-Generated Image</p>
                      <p className="text-xs mt-1 opacity-75">
                        {draft.right.imagePrompt.substring(0, 50)}...
                      </p>
                    </div>
                  </div>
                ) : draft.right ? (
                  <div className="space-y-3">
                    {draft.right.heading && (
                      <h3 className="text-lg font-semibold text-slate-800 border-b border-indigo-200 pb-2">
                        {draft.right.heading}
                      </h3>
                    )}
                    {draft.right.paragraph && (
                      <p className="text-slate-700 leading-relaxed">
                        {draft.right.paragraph}
                      </p>
                    )}
                    {draft.right.bullets && (
                      <div className="space-y-2">
                        {draft.right.bullets.map((bullet, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-indigo-500" />
                            <span className="text-slate-700">{bullet}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {draft.right.metrics && (
                      <div className="grid grid-cols-1 gap-3">
                        {draft.right.metrics.map((metric, index) => (
                          <div key={index} className="bg-slate-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-indigo-600">
                              {metric.value}{metric.unit}
                            </div>
                            <div className="text-xs text-slate-600 mt-1">
                              {metric.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-lg p-6 flex items-center justify-center h-48">
                    <div className="text-center text-slate-400">
                      <HiInformationCircle className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Mixed content layout</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'problem-solution':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              {draft.title}
            </h1>
            {draft.paragraph && (
              <p className="text-slate-700 leading-relaxed text-lg mb-6">
                {draft.paragraph}
              </p>
            )}
            <div className="grid grid-cols-2 gap-8">
              {/* Problem Side */}
              <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <h3 className="text-lg font-semibold text-red-800 border-b border-red-200 pb-2">
                  {draft.left?.heading || 'Challenge'}
                </h3>
                {draft.left?.paragraph && (
                  <p className="text-red-700 leading-relaxed">
                    {draft.left.paragraph}
                  </p>
                )}
                {draft.left?.bullets && (
                  <div className="space-y-2">
                    {draft.left.bullets.map((bullet, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-red-500" />
                        <span className="text-red-700">{bullet}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Solution Side */}
              <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-green-800 border-b border-green-200 pb-2">
                  {draft.right?.heading || 'Solution'}
                </h3>
                {draft.right?.paragraph && (
                  <p className="text-green-700 leading-relaxed">
                    {draft.right.paragraph}
                  </p>
                )}
                {draft.right?.bullets && (
                  <div className="space-y-2">
                    {draft.right.bullets.map((bullet, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-green-500" />
                        <span className="text-green-700">{bullet}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'comparison-table':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              {draft.title}
            </h1>
            {draft.comparisonTable && (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full">
                  <thead className="bg-indigo-50">
                    <tr>
                      {draft.comparisonTable.headers?.map((header, index) => (
                        <th key={index} className="px-4 py-3 text-left text-sm font-semibold text-indigo-900 border-b border-indigo-200">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {draft.comparisonTable.rows?.map((row, rowIndex) => (
                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-4 py-3 text-sm text-slate-700 border-b border-gray-200">
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
        );

      default:
        return (
          <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              {draft.title}
            </h1>
            {/* Show actual content instead of debug info */}
            <div className="space-y-4">
              {draft.paragraph && (
                <p className="text-slate-700 leading-relaxed">
                  {draft.paragraph}
                </p>
              )}
              {draft.bullets && (
                <div className="space-y-2">
                  {draft.bullets.map((bullet, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-indigo-500" />
                      <span className="text-slate-700">{bullet}</span>
                    </div>
                  ))}
                </div>
              )}
              {(draft.left || draft.right) && (
                <div className="grid grid-cols-2 gap-6 mt-6">
                  {draft.left && (
                    <div className="space-y-3">
                      {draft.left.heading && (
                        <h3 className="text-lg font-semibold text-slate-800">
                          {draft.left.heading}
                        </h3>
                      )}
                      {draft.left.paragraph && (
                        <p className="text-slate-700 leading-relaxed">
                          {draft.left.paragraph}
                        </p>
                      )}
                      {draft.left.bullets && (
                        <div className="space-y-2">
                          {draft.left.bullets.map((bullet, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-indigo-500" />
                              <span className="text-slate-700">{bullet}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {draft.right && (
                    <div className="space-y-3">
                      {draft.right.heading && (
                        <h3 className="text-lg font-semibold text-slate-800">
                          {draft.right.heading}
                        </h3>
                      )}
                      {draft.right.paragraph && (
                        <p className="text-slate-700 leading-relaxed">
                          {draft.right.paragraph}
                        </p>
                      )}
                      {draft.right.bullets && (
                        <div className="space-y-2">
                          {draft.right.bullets.map((bullet, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-indigo-500" />
                              <span className="text-slate-700">{bullet}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {!draft.paragraph && !draft.bullets && !draft.left && !draft.right && (
                <div className="text-slate-500 italic">
                  Content is being processed for {draft.layout} layout...
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  if (error) {
    return (
      <div className="p-10 text-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8">
          <HiInformationCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Generation Error</h3>
          <p className="text-red-700 mb-6">{error}</p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
            className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl border border-blue-200"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <HiEye className="w-7 h-7 text-blue-600" />
          </motion.div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Preview Your Slide</h2>
        </div>
        <p className="text-lg text-slate-600 leading-relaxed">
          Review the AI-generated content and make adjustments before creating your presentation.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Enhanced Slide Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-3xl blur-lg opacity-20"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden backdrop-blur-sm">
              {/* Slide Mockup */}
              <div
                className="aspect-video p-8 bg-gradient-to-br from-slate-50 to-white"
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  borderRadius: '12px'
                }}
              >
                {renderSlideContent()}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Slide Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-6"
        >
          {/* Slide Information */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <HiDocumentText className="w-5 h-5 text-indigo-500" />
              Slide Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Layout:</span>
                <span className="font-medium text-slate-900">{draft.layout}</span>
              </div>
              {selectedLayout && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Layout Type:</span>
                  <span className="font-medium text-slate-900">{selectedLayout.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-600">Content Type:</span>
                <span className="font-medium text-slate-900">
                  {draft.bullets ? 'Bullet Points' : draft.paragraph ? 'Paragraph' : 'Mixed'}
                </span>
              </div>
              {draft.right?.imagePrompt && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Includes:</span>
                  <span className="font-medium text-slate-900">AI Image</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <motion.button
              onClick={onGenerate}
              disabled={loading}
              className={clsx(
                "w-full px-6 py-4 rounded-2xl font-semibold text-white transition-all duration-300 shadow-lg",
                loading
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 hover:shadow-xl transform hover:scale-105"
              )}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <HiSparkles className="w-5 h-5" />
                  Generate PowerPoint
                </div>
              )}
            </motion.button>

            <motion.button
              onClick={onEdit}
              className="w-full px-6 py-3 rounded-2xl font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all duration-300 border border-slate-200 hover:border-slate-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-center gap-2">
                <HiPencil className="w-4 h-4" />
                Edit Content
              </div>
            </motion.button>

            <motion.button
              onClick={onBack}
              className="w-full px-6 py-3 rounded-2xl font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-center gap-2">
                <HiArrowLeft className="w-4 h-4" />
                Back to Input
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
