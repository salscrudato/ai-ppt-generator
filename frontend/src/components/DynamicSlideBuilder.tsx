import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiRectangleStack, 
  HiListBullet, 
  HiChartBar, 
  HiPhoto, 
  HiTableCells,
  HiChatBubbleLeftRight,
  HiDocumentText,
  HiClock,
  HiArrowRight,
  HiCheck,
  HiSparkles
} from 'react-icons/hi2';
import clsx from 'clsx';
import type { ProfessionalTheme } from '../themes/professionalThemes';
import { PROFESSIONAL_THEMES } from '../themes/professionalThemes';
import SlidePreview from './SlidePreview';
import type { SlideSpec } from '../types';

/**
 * Available slide components that users can select
 */
export interface SlideComponent {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'content' | 'visual' | 'data';
  color: string;
  preview: {
    title: string;
    content: string;
  };
}

/**
 * Dynamic layout configuration based on selected components
 */
export interface DynamicLayout {
  id: string;
  name: string;
  description: string;
  components: [string, string]; // Exactly 2 components
  layout: string; // Backend layout type
  preview: {
    title: string;
    description: string;
  };
}

/**
 * Builder state interface
 */
export interface BuilderState {
  selectedComponents: SlideComponent[];
  selectedTheme: ProfessionalTheme;
  selectedLayout: DynamicLayout | null;
  slideSpec: SlideSpec | null;
}

/**
 * Props for the DynamicSlideBuilder component
 */
export interface DynamicSlideBuilderProps {
  /** Callback when slide is built */
  onSlideBuilt: (spec: SlideSpec, theme: ProfessionalTheme) => void;
  /** Initial theme (optional) */
  initialTheme?: ProfessionalTheme;
  /** Whether to show advanced options */
  showAdvanced?: boolean;
  /** Custom CSS classes */
  className?: string;
}

/**
 * Available slide components for selection
 */
const SLIDE_COMPONENTS: SlideComponent[] = [
  {
    id: 'text',
    name: 'Text Content',
    description: 'Paragraph text for detailed explanations',
    icon: HiDocumentText,
    category: 'content',
    color: '#3B82F6',
    preview: {
      title: 'Text Content',
      content: 'Rich paragraph content for detailed explanations and narrative flow.'
    }
  },
  {
    id: 'bullets',
    name: 'Bullet Points',
    description: 'Scannable list of key points',
    icon: HiListBullet,
    category: 'content',
    color: '#10B981',
    preview: {
      title: 'Key Points',
      content: '• First important point\n• Second key insight\n• Third critical item'
    }
  },
  {
    id: 'chart',
    name: 'Data Chart',
    description: 'Visual data representation',
    icon: HiChartBar,
    category: 'data',
    color: '#F59E0B',
    preview: {
      title: 'Data Visualization',
      content: 'Interactive charts and graphs for data insights.'
    }
  },
  {
    id: 'image',
    name: 'Image',
    description: 'Visual content and illustrations',
    icon: HiPhoto,
    category: 'visual',
    color: '#8B5CF6',
    preview: {
      title: 'Visual Content',
      content: 'Professional images and illustrations to enhance your message.'
    }
  },
  {
    id: 'table',
    name: 'Data Table',
    description: 'Structured data comparison',
    icon: HiTableCells,
    category: 'data',
    color: '#EF4444',
    preview: {
      title: 'Data Comparison',
      content: 'Structured tables for detailed data comparison and analysis.'
    }
  },
  {
    id: 'quote',
    name: 'Quote',
    description: 'Highlighted testimonial or quote',
    icon: HiChatBubbleLeftRight,
    category: 'content',
    color: '#06B6D4',
    preview: {
      title: 'Featured Quote',
      content: '"Inspiring quotes and testimonials to reinforce your message."'
    }
  },
  {
    id: 'timeline',
    name: 'Timeline',
    description: 'Sequential process or timeline',
    icon: HiClock,
    category: 'visual',
    color: '#84CC16',
    preview: {
      title: 'Process Timeline',
      content: 'Step-by-step processes and chronological sequences.'
    }
  }
];

/**
 * Component selection card
 */
interface ComponentCardProps {
  component: SlideComponent;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: (component: SlideComponent) => void;
}

function ComponentCard({ component, isSelected, isDisabled, onSelect }: ComponentCardProps) {
  const Icon = component.icon;
  
  return (
    <motion.button
      className={clsx(
        'relative p-6 rounded-xl border-2 text-left transition-all duration-300',
        'hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2',
        isSelected && 'ring-2 ring-offset-2',
        isDisabled && 'opacity-50 cursor-not-allowed',
        !isDisabled && 'hover:scale-105'
      )}
      style={{
        borderColor: isSelected ? component.color : '#E5E7EB',
        backgroundColor: isSelected ? `${component.color}10` : '#FFFFFF',
        boxShadow: isSelected ? `0 8px 25px ${component.color}30` : undefined,
        ringColor: component.color
      }}
      onClick={() => !isDisabled && onSelect(component)}
      whileHover={!isDisabled ? { y: -2 } : undefined}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
      disabled={isDisabled}
    >
      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: component.color }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500 }}
        >
          <HiCheck className="w-4 h-4 text-white" />
        </motion.div>
      )}
      
      {/* Icon */}
      <div 
        className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
        style={{ backgroundColor: `${component.color}20` }}
      >
        <Icon className="w-6 h-6" style={{ color: component.color }} />
      </div>
      
      {/* Content */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">{component.name}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{component.description}</p>
        
        {/* Category badge */}
        <div className="mt-3">
          <span 
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
            style={{ 
              backgroundColor: `${component.color}15`,
              color: component.color
            }}
          >
            {component.category}
          </span>
        </div>
      </div>
    </motion.button>
  );
}

/**
 * Main DynamicSlideBuilder component
 */
export default function DynamicSlideBuilder({
  onSlideBuilt,
  initialTheme,
  showAdvanced = false,
  className = ''
}: DynamicSlideBuilderProps) {
  const [builderState, setBuilderState] = useState<BuilderState>({
    selectedComponents: [],
    selectedTheme: initialTheme || PROFESSIONAL_THEMES[0],
    selectedLayout: null,
    slideSpec: null
  });
  
  const [currentStep, setCurrentStep] = useState<'components' | 'theme' | 'layout' | 'preview'>('components');

  // Handle component selection (max 2)
  const handleComponentSelect = (component: SlideComponent) => {
    setBuilderState(prev => {
      const isSelected = prev.selectedComponents.some(c => c.id === component.id);
      
      if (isSelected) {
        // Remove component
        return {
          ...prev,
          selectedComponents: prev.selectedComponents.filter(c => c.id !== component.id),
          selectedLayout: null,
          slideSpec: null
        };
      } else if (prev.selectedComponents.length < 2) {
        // Add component
        const newComponents = [...prev.selectedComponents, component];
        return {
          ...prev,
          selectedComponents: newComponents,
          selectedLayout: null,
          slideSpec: null
        };
      }
      
      return prev;
    });
  };

  // Check if we can proceed to next step
  const canProceedToTheme = builderState.selectedComponents.length === 2;
  const canProceedToLayout = canProceedToTheme && builderState.selectedTheme;
  const canProceedToPreview = canProceedToLayout && builderState.selectedLayout;

  return (
    <div className={clsx('max-w-6xl mx-auto p-6', className)}>
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 mb-4"
        >
          <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl">
            <HiSparkles className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Dynamic Slide Builder</h1>
        </motion.div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Create custom slides by selecting components, choosing a theme, and picking the perfect layout.
        </p>
      </div>

      {/* Step 1: Component Selection */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
            1
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Select Components <span className="text-sm text-gray-500">(Choose exactly 2)</span>
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {SLIDE_COMPONENTS.map(component => (
            <ComponentCard
              key={component.id}
              component={component}
              isSelected={builderState.selectedComponents.some(c => c.id === component.id)}
              isDisabled={
                builderState.selectedComponents.length >= 2 && 
                !builderState.selectedComponents.some(c => c.id === component.id)
              }
              onSelect={handleComponentSelect}
            />
          ))}
        </div>
        
        {/* Selected components summary */}
        {builderState.selectedComponents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
          >
            <h3 className="font-medium text-blue-900 mb-2">Selected Components:</h3>
            <div className="flex flex-wrap gap-2">
              {builderState.selectedComponents.map(component => (
                <span
                  key={component.id}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-blue-200"
                >
                  <component.icon className="w-4 h-4" style={{ color: component.color }} />
                  {component.name}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Step 2: Theme Selection */}
      {canProceedToTheme && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">
              2
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Choose Theme</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROFESSIONAL_THEMES.slice(0, 6).map(theme => (
              <motion.button
                key={theme.id}
                className={clsx(
                  'p-4 rounded-xl border-2 text-left transition-all duration-300',
                  'hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2',
                  builderState.selectedTheme.id === theme.id
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-offset-2'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                )}
                onClick={() => setBuilderState(prev => ({ ...prev, selectedTheme: theme }))}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Theme preview */}
                <div
                  className="h-20 rounded-lg mb-3 relative overflow-hidden"
                  style={{
                    background: theme.effects?.gradients?.background ||
                      `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.surface} 100%)`
                  }}
                >
                  {/* Accent bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-2"
                    style={{
                      background: `linear-gradient(90deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`
                    }}
                  />

                  {/* Sample content */}
                  <div className="p-3 pt-4">
                    <div
                      className="h-2 w-16 rounded mb-2"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <div
                      className="h-1 w-12 rounded"
                      style={{ backgroundColor: theme.colors.text.secondary }}
                    />
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 mb-1">{theme.name}</h3>
                <p className="text-sm text-gray-600">{theme.description}</p>

                {/* Selection indicator */}
                {builderState.selectedTheme.id === theme.id && (
                  <motion.div
                    className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <HiCheck className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Step 3: Layout Generation */}
      {canProceedToLayout && (
        <LayoutSelector
          selectedComponents={builderState.selectedComponents}
          selectedTheme={builderState.selectedTheme}
          onLayoutSelect={(layout, slideSpec) => {
            setBuilderState(prev => ({ ...prev, selectedLayout: layout, slideSpec }));
            setCurrentStep('preview');
          }}
        />
      )}

      {/* Step 4: Preview and Build */}
      {canProceedToPreview && builderState.slideSpec && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">
              4
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Preview & Build</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Preview */}
            <div>
              <h3 className="font-medium text-gray-900 mb-4">Slide Preview</h3>
              <SlidePreview
                spec={builderState.slideSpec}
                theme={builderState.selectedTheme}
                size="large"
                className="mx-auto"
              />
            </div>

            {/* Configuration */}
            <div>
              <h3 className="font-medium text-gray-900 mb-4">Configuration</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Components</h4>
                  <div className="flex gap-2">
                    {builderState.selectedComponents.map(component => (
                      <span
                        key={component.id}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded text-sm"
                      >
                        <component.icon className="w-4 h-4" style={{ color: component.color }} />
                        {component.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Theme</h4>
                  <p className="text-sm text-gray-600">{builderState.selectedTheme.name}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Layout</h4>
                  <p className="text-sm text-gray-600">{builderState.selectedLayout?.name}</p>
                </div>
              </div>

              {/* Build button */}
              <motion.button
                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                onClick={() => onSlideBuilt(builderState.slideSpec!, builderState.selectedTheme)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Build Slide
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/**
 * Layout selector component for dynamic layout generation
 */
interface LayoutSelectorProps {
  selectedComponents: SlideComponent[];
  selectedTheme: ProfessionalTheme;
  onLayoutSelect: (layout: DynamicLayout, slideSpec: SlideSpec) => void;
}

function LayoutSelector({ selectedComponents, selectedTheme, onLayoutSelect }: LayoutSelectorProps) {
  // Generate dynamic layouts based on selected components
  const dynamicLayouts = useMemo(() => {
    if (selectedComponents.length !== 2) return [];

    const [comp1, comp2] = selectedComponents;
    const layouts: DynamicLayout[] = [];

    // Generate layout combinations
    const combinations = [
      { primary: comp1, secondary: comp2, position: 'left-right' },
      { primary: comp2, secondary: comp1, position: 'left-right' },
      { primary: comp1, secondary: comp2, position: 'top-bottom' },
      { primary: comp2, secondary: comp1, position: 'top-bottom' }
    ];

    combinations.forEach((combo, index) => {
      const layoutId = `${combo.primary.id}-${combo.secondary.id}-${combo.position}`;
      const backendLayout = generateBackendLayout(combo.primary.id, combo.secondary.id, combo.position);

      layouts.push({
        id: layoutId,
        name: `${combo.primary.name} + ${combo.secondary.name}`,
        description: `${combo.primary.name} ${combo.position === 'left-right' ? 'on the left' : 'on top'}, ${combo.secondary.name} ${combo.position === 'left-right' ? 'on the right' : 'below'}`,
        components: [combo.primary.id, combo.secondary.id],
        layout: backendLayout,
        preview: {
          title: `${combo.primary.name} & ${combo.secondary.name}`,
          description: combo.position === 'left-right' ? 'Side by side layout' : 'Stacked layout'
        }
      });
    });

    return layouts;
  }, [selectedComponents]);

  const generateSlideSpec = (layout: DynamicLayout): SlideSpec => {
    const [comp1Id, comp2Id] = layout.components;
    const comp1 = selectedComponents.find(c => c.id === comp1Id)!;
    const comp2 = selectedComponents.find(c => c.id === comp2Id)!;

    // Generate appropriate slide spec based on components
    const spec: SlideSpec = {
      id: `dynamic-${Date.now()}`,
      title: `${comp1.name} & ${comp2.name} Slide`,
      layout: layout.layout as any
    };

    // Add component-specific content
    if (comp1Id === 'bullets' || comp2Id === 'bullets') {
      spec.bullets = [
        'First key point for your presentation',
        'Second important insight to highlight',
        'Third critical item for audience focus'
      ];
    }

    if (comp1Id === 'text' || comp2Id === 'text') {
      spec.paragraph = 'This is sample paragraph content that demonstrates how text will appear in your slide. You can edit this content to match your specific needs and messaging.';
    }

    if (comp1Id === 'chart' || comp2Id === 'chart') {
      spec.chart = {
        type: 'bar',
        title: 'Sample Data',
        categories: ['Q1', 'Q2', 'Q3', 'Q4'],
        series: [{
          name: 'Revenue',
          data: [100, 150, 200, 175]
        }]
      };
    }

    // Handle two-column layouts
    if (layout.layout === 'two-column') {
      spec.left = {
        title: comp1.name,
        bullets: comp1Id === 'bullets' ? spec.bullets : undefined,
        paragraph: comp1Id === 'text' ? spec.paragraph : comp1.preview.content
      };

      spec.right = {
        title: comp2.name,
        bullets: comp2Id === 'bullets' ? spec.bullets : undefined,
        paragraph: comp2Id === 'text' ? spec.paragraph : comp2.preview.content
      };
    }

    return spec;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-semibold">
          3
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Choose Layout</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dynamicLayouts.map(layout => (
          <motion.button
            key={layout.id}
            className="p-6 border-2 border-gray-200 rounded-xl text-left hover:border-orange-300 hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            onClick={() => onLayoutSelect(layout, generateSlideSpec(layout))}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <h3 className="font-semibold text-gray-900 mb-2">{layout.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{layout.description}</p>

            {/* Layout preview */}
            <div className="h-24 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {selectedComponents.map((comp, index) => (
                  <React.Fragment key={comp.id}>
                    <div className="flex items-center gap-1">
                      <comp.icon className="w-4 h-4" style={{ color: comp.color }} />
                      <span>{comp.name}</span>
                    </div>
                    {index === 0 && <span>+</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

/**
 * Generate backend layout type based on component combination
 */
function generateBackendLayout(comp1: string, comp2: string, position: string): string {
  // Map component combinations to appropriate backend layouts
  const layoutMap: Record<string, string> = {
    'text-bullets-left-right': 'two-column',
    'bullets-text-left-right': 'two-column',
    'text-chart-left-right': 'mixed-content',
    'chart-text-left-right': 'mixed-content',
    'bullets-chart-left-right': 'two-column',
    'chart-bullets-left-right': 'two-column',
    'text-image-left-right': 'image-right',
    'image-text-left-right': 'image-left',
    'bullets-image-left-right': 'image-right',
    'image-bullets-left-right': 'image-left',
    'text-table-left-right': 'comparison-table',
    'table-text-left-right': 'comparison-table',
    'text-quote-left-right': 'two-column',
    'quote-text-left-right': 'two-column',
    'text-timeline-left-right': 'timeline',
    'timeline-text-left-right': 'timeline'
  };

  const key = `${comp1}-${comp2}-${position}`;
  return layoutMap[key] || 'two-column';
}
