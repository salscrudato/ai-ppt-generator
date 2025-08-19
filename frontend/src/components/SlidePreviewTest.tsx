/**
 * Test component to verify SlidePreview functionality with known good data
 */

import React from 'react';
import SlidePreview from './SlidePreview';
import type { SlideSpec } from '../types';

const testSlides: SlideSpec[] = [
  {
    id: 'test-1',
    title: 'Q4 Revenue: 34% Growth Drives Record $2.1M Quarter',
    layout: 'title-bullets',
    bullets: [
      'Revenue increased 34% YoY, exceeding targets by $400K',
      'Customer acquisition cost reduced 28% through digital optimization',
      'Net promoter score improved to 72 (industry average: 45)',
      'Market expansion into 3 regions generated $600K new revenue'
    ]
  },
  {
    id: 'test-2',
    title: 'Digital Transformation Strategy',
    layout: 'title-paragraph',
    paragraph: 'Our comprehensive digital transformation initiative has delivered measurable results across all key performance indicators. The implementation of cloud-based solutions has improved operational efficiency by 40% while reducing infrastructure costs by $2.3M annually.'
  },
  {
    id: 'test-3',
    title: 'Comparison Analysis',
    layout: 'two-column',
    left: {
      bullets: ['Manual processes', 'High error rates', 'Slow turnaround']
    },
    right: {
      bullets: ['Automated workflows', '95% accuracy', '3x faster delivery']
    }
  },
  {
    id: 'test-4',
    title: 'Empty Content Test',
    layout: 'title-bullets',
    bullets: []
  }
];

const defaultTheme = {
  id: 'corporate-blue',
  name: 'Corporate Blue',
  colors: {
    primary: '#1E40AF',
    secondary: '#3B82F6',
    accent: '#F59E0B',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: {
      primary: '#1F2937',
      secondary: '#6B7280'
    }
  }
};

export default function SlidePreviewTest() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">🔍 SlidePreview Test Suite</h1>
      <p className="text-gray-600 mb-8">Testing SlidePreview component with various data structures</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testSlides.map((slide, index) => (
          <div key={slide.id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Test {index + 1}: {slide.layout}</h3>
            <div className="mb-4">
              <SlidePreview
                spec={slide}
                theme={defaultTheme}
                size="medium"
                className="mx-auto"
              />
            </div>
            <details className="text-sm">
              <summary className="cursor-pointer text-blue-600">View Data</summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {JSON.stringify(slide, null, 2)}
              </pre>
            </details>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">🔍 Debug Information</h3>
        <p className="text-yellow-700 text-sm">
          Check the browser console for detailed debugging information about each slide render.
        </p>
      </div>
    </div>
  );
}
