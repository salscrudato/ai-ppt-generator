import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ThemeCarousel from './ThemeCarousel';
import { HiSparkles, HiCheck, HiXMark } from 'react-icons/hi2';

/**
 * Demo component to showcase the new ThemeCarousel
 * This demonstrates the fix for multiple theme selection issues
 */
export default function ThemeCarouselDemo() {
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [selectionHistory, setSelectionHistory] = useState<string[]>([]);

  const handleThemeSelect = (themeId: string) => {
    console.log('Demo: Theme selected:', themeId);
    setSelectedTheme(themeId);
    setSelectionHistory(prev => [...prev, `${new Date().toLocaleTimeString()}: ${themeId || 'deselected'}`]);
  };

  const clearHistory = () => {
    setSelectionHistory([]);
  };

  const clearSelection = () => {
    setSelectedTheme('');
    setSelectionHistory(prev => [...prev, `${new Date().toLocaleTimeString()}: cleared`]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <HiSparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900">Theme Carousel Demo</h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Modern, sleek, and innovative theme selection with carousel UI. 
            This fixes the multiple selection bug and provides an intuitive user experience.
          </p>
        </motion.div>

        {/* Current Selection Status */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Selection Status</h2>
            <div className="flex gap-2">
              <button
                onClick={clearSelection}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <HiXMark className="w-4 h-4" />
                Clear Selection
              </button>
              <button
                onClick={clearHistory}
                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors duration-200"
              >
                Clear History
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Selection */}
            <div className="space-y-3">
              <h3 className="font-medium text-slate-700">Currently Selected Theme:</h3>
              <div className="p-4 bg-slate-50 rounded-lg">
                {selectedTheme ? (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <HiCheck className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{selectedTheme}</div>
                      <div className="text-sm text-slate-500">Theme ID</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500 italic">No theme selected</div>
                )}
              </div>
            </div>

            {/* Selection History */}
            <div className="space-y-3">
              <h3 className="font-medium text-slate-700">Selection History:</h3>
              <div className="p-4 bg-slate-50 rounded-lg max-h-32 overflow-y-auto">
                {selectionHistory.length > 0 ? (
                  <div className="space-y-1">
                    {selectionHistory.slice(-5).map((entry, index) => (
                      <div key={index} className="text-sm text-slate-600 font-mono">
                        {entry}
                      </div>
                    ))}
                    {selectionHistory.length > 5 && (
                      <div className="text-xs text-slate-400 italic">
                        ... and {selectionHistory.length - 5} more entries
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-slate-500 italic">No selections yet</div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Theme Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200"
        >
          <ThemeCarousel
            selectedId={selectedTheme}
            onSelect={handleThemeSelect}
            title="Select Your Presentation Theme"
            showCategories={true}
          />
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            {
              title: "Single Selection",
              description: "Only one theme can be selected at a time, fixing the multiple selection bug",
              icon: HiCheck,
              color: "green"
            },
            {
              title: "Smooth Scrolling",
              description: "Horizontally scrollable carousel with smooth auto-scroll and touch support",
              icon: HiSparkles,
              color: "indigo"
            },
            {
              title: "Modern Design",
              description: "Sleek, innovative UI with smooth animations and responsive layout",
              icon: HiSparkles,
              color: "purple"
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className={`p-3 bg-${feature.color}-100 rounded-lg w-fit mb-4`}>
                <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-indigo-50 border border-indigo-200 rounded-xl p-6"
        >
          <h3 className="font-semibold text-indigo-900 mb-3">How to Test:</h3>
          <ul className="space-y-2 text-indigo-800">
            <li>• Click on any theme card to select it</li>
            <li>• Notice how only one theme can be selected at a time</li>
            <li>• Scroll horizontally through themes with mouse wheel or touch</li>
            <li>• Use keyboard arrows (←/→) for smooth navigation</li>
            <li>• Hover over the carousel to pause auto-scrolling</li>
            <li>• Click dots to jump to different sections</li>
            <li>• Try different categories to filter themes</li>
            <li>• Watch the selection history to verify single selection behavior</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
