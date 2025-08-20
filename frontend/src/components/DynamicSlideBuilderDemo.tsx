import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiArrowLeft, HiDownload } from 'react-icons/hi2';
import DynamicSlideBuilder from './DynamicSlideBuilder';
import SlidePreview from './SlidePreview';
import type { SlideSpec } from '../types';
import type { ProfessionalTheme } from '../themes/professionalThemes';
import { PROFESSIONAL_THEMES } from '../themes/professionalThemes';

/**
 * Demo component for the Dynamic Slide Builder
 * This shows how to integrate the builder into your application
 */
export default function DynamicSlideBuilderDemo() {
  const [currentView, setCurrentView] = useState<'builder' | 'preview'>('builder');
  const [builtSlide, setBuiltSlide] = useState<{
    spec: SlideSpec;
    theme: ProfessionalTheme;
  } | null>(null);

  const handleSlideBuilt = (spec: SlideSpec, theme: ProfessionalTheme) => {
    setBuiltSlide({ spec, theme });
    setCurrentView('preview');
  };

  const handleGeneratePowerPoint = async () => {
    if (!builtSlide) return;

    try {
      // Here you would call your PowerPoint generation API
      console.log('Generating PowerPoint with:', {
        slide: builtSlide.spec,
        theme: builtSlide.theme
      });
      
      // Example API call (replace with your actual endpoint)
      const response = await fetch('/api/generate-ppt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slides: [builtSlide.spec],
          theme: builtSlide.theme,
          title: 'Dynamic Slide Presentation'
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dynamic-slide.pptx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Failed to generate PowerPoint');
      }
    } catch (error) {
      console.error('Error generating PowerPoint:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'builder' && (
        <DynamicSlideBuilder
          onSlideBuilt={handleSlideBuilt}
          initialTheme={PROFESSIONAL_THEMES[0]}
          showAdvanced={true}
          className="py-8"
        />
      )}

      {currentView === 'preview' && builtSlide && (
        <div className="max-w-6xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <motion.button
              onClick={() => setCurrentView('builder')}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              whileHover={{ x: -2 }}
            >
              <HiArrowLeft className="w-5 h-5" />
              Back to Builder
            </motion.button>

            <motion.button
              onClick={handleGeneratePowerPoint}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <HiDownload className="w-5 h-5" />
              Download PowerPoint
            </motion.button>
          </div>

          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Dynamic Slide</h1>
            <p className="text-gray-600 mb-8">
              Preview your custom slide before generating the PowerPoint presentation
            </p>

            <div className="inline-block">
              <SlidePreview
                spec={builtSlide.spec}
                theme={builtSlide.theme}
                size="large"
                className="shadow-2xl"
              />
            </div>

            {/* Slide Details */}
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-4">Slide Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="font-medium text-gray-900 mb-1">Layout</div>
                    <div className="text-gray-600">{builtSlide.spec.layout}</div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="font-medium text-gray-900 mb-1">Theme</div>
                    <div className="text-gray-600">{builtSlide.theme.name}</div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="font-medium text-gray-900 mb-1">Components</div>
                    <div className="text-gray-600">
                      {builtSlide.spec.bullets && 'Bullets, '}
                      {builtSlide.spec.paragraph && 'Text, '}
                      {builtSlide.spec.chart && 'Chart, '}
                      {builtSlide.spec.table && 'Table, '}
                      {builtSlide.spec.left && builtSlide.spec.right && 'Two-Column'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

/**
 * Example of how to use the DynamicSlideBuilder in your own components
 */
export function DynamicSlideBuilderExample() {
  const [generatedSlides, setGeneratedSlides] = useState<Array<{
    spec: SlideSpec;
    theme: ProfessionalTheme;
  }>>([]);

  const handleSlideBuilt = (spec: SlideSpec, theme: ProfessionalTheme) => {
    setGeneratedSlides(prev => [...prev, { spec, theme }]);
  };

  return (
    <div className="space-y-8">
      {/* Builder */}
      <DynamicSlideBuilder
        onSlideBuilt={handleSlideBuilt}
        showAdvanced={false}
      />

      {/* Generated Slides */}
      {generatedSlides.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Generated Slides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generatedSlides.map((slide, index) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm border">
                <SlidePreview
                  spec={slide.spec}
                  theme={slide.theme}
                  size="medium"
                  className="mb-4"
                />
                <div className="text-sm text-gray-600">
                  <div className="font-medium">{slide.theme.name}</div>
                  <div>{slide.spec.layout}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
