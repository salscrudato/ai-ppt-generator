import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LiveSlidePreview from './LiveSlidePreview';
import type { GenerationParams } from '../types';
import { HiSparkles, HiEye } from 'react-icons/hi2';

/**
 * Demo component to showcase the Live Slide Preview functionality
 * This can be used for testing and demonstration purposes
 */
export default function LivePreviewDemo() {
  const [demoParams, setDemoParams] = useState<GenerationParams>({
    prompt: 'Quarterly Sales Results: 25% growth in Q3, key challenges overcome, and strategic initiatives for Q4 including market expansion and product innovation.',
    audience: 'executives',
    tone: 'professional',
    contentLength: 'moderate',
    layout: 'title-bullets',
    withImage: false,
    design: {
      theme: 'corporate-blue'
    }
  });

  const [selectedTheme, setSelectedTheme] = useState('corporate-blue');

  const themes = [
    { id: 'corporate-blue', name: 'Corporate Blue', color: 'bg-blue-500' },
    { id: 'modern-green', name: 'Modern Green', color: 'bg-green-500' },
    { id: 'elegant-purple', name: 'Elegant Purple', color: 'bg-purple-500' },
    { id: 'professional-gray', name: 'Professional Gray', color: 'bg-gray-500' }
  ];

  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId);
    setDemoParams(prev => ({
      ...prev,
      design: { ...prev.design, theme: themeId }
    }));
  };

  const handlePromptChange = (newPrompt: string) => {
    setDemoParams(prev => ({ ...prev, prompt: newPrompt }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-pink-50/20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl">
              <HiSparkles className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Live Slide Preview Demo</h1>
              <p className="text-gray-600">Experience real-time slide generation as you type</p>
            </div>
          </div>

          {/* Theme Selector */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Theme:</span>
            <div className="flex gap-2">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedTheme === theme.id
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${theme.color}`}></div>
                  {theme.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px]">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Your Prompt</h3>
              <textarea
                value={demoParams.prompt}
                onChange={(e) => handlePromptChange(e.target.value)}
                placeholder="Describe your presentation topic..."
                rows={6}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              <div className="mt-4 text-sm text-gray-600">
                <p>✨ <strong>Try editing the text above</strong> - the preview will update automatically!</p>
                <p className="mt-2">Current settings:</p>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>• Audience: {demoParams.audience}</li>
                  <li>• Tone: {demoParams.tone}</li>
                  <li>• Layout: {demoParams.layout}</li>
                  <li>• Theme: {selectedTheme}</li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Features Demonstrated</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Real-time Preview:</strong> See your slide update as you type with 1.5s debouncing
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>16:9 Aspect Ratio:</strong> Professional PowerPoint-like dimensions
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Theme Integration:</strong> Dynamic styling based on selected theme
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Responsive Design:</strong> Adapts to different screen sizes
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Loading States:</strong> Smooth transitions and feedback
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Live Preview */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <HiEye className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Live Preview</h3>
              </div>
            </div>
            <div className="h-[500px]">
              <LiveSlidePreview
                params={demoParams}
                isVisible={true}
                editable={false}
                theme={selectedTheme}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
