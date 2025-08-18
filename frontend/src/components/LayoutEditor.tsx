/**
 * Layout Editor Component
 * Simplified and reusable layout editing components
 */

import React from 'react';
import { InputField, SelectField } from '../utils/formUtils';
import type { SlideSpec } from '../types';

interface LayoutEditorProps {
  spec: SlideSpec;
  onSpecChange: (updates: Partial<SlideSpec>) => void;
}

/**
 * Two-column layout editor
 */
export const TwoColumnEditor: React.FC<LayoutEditorProps> = ({ spec, onSpecChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 border-b pb-2">Left Column</h4>
        <InputField
          label="Left Title"
          value={spec.leftTitle || ''}
          onChange={(value) => onSpecChange({ leftTitle: value })}
          placeholder="Enter left column title"
        />
        <InputField
          label="Left Content"
          type="textarea"
          value={spec.leftContent || ''}
          onChange={(value) => onSpecChange({ leftContent: value })}
          placeholder="Enter left column content"
          rows={4}
        />
      </div>

      <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 border-b pb-2">Right Column</h4>
        <InputField
          label="Right Title"
          value={spec.rightTitle || ''}
          onChange={(value) => onSpecChange({ rightTitle: value })}
          placeholder="Enter right column title"
        />
        <InputField
          label="Right Content"
          type="textarea"
          value={spec.rightContent || ''}
          onChange={(value) => onSpecChange({ rightContent: value })}
          placeholder="Enter right column content"
          rows={4}
        />
      </div>
    </div>
  );
};

/**
 * Problem-Solution layout editor
 */
export const ProblemSolutionEditor: React.FC<LayoutEditorProps> = ({ spec, onSpecChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4 p-4 border border-red-200 rounded-lg bg-red-50">
        <h4 className="text-sm font-medium text-red-700 border-b border-red-200 pb-2">Problem/Challenge</h4>
        <InputField
          label="Problem Title"
          value={spec.leftTitle || ''}
          onChange={(value) => onSpecChange({ leftTitle: value })}
          placeholder="Describe the problem"
        />
        <InputField
          label="Problem Details"
          type="textarea"
          value={spec.leftContent || ''}
          onChange={(value) => onSpecChange({ leftContent: value })}
          placeholder="Explain the challenges and pain points"
          rows={4}
        />
      </div>

      <div className="space-y-4 p-4 border border-green-200 rounded-lg bg-green-50">
        <h4 className="text-sm font-medium text-green-700 border-b border-green-200 pb-2">Solution/Impact</h4>
        <InputField
          label="Solution Title"
          value={spec.rightTitle || ''}
          onChange={(value) => onSpecChange({ rightTitle: value })}
          placeholder="Present the solution"
        />
        <InputField
          label="Solution Details"
          type="textarea"
          value={spec.rightContent || ''}
          onChange={(value) => onSpecChange({ rightContent: value })}
          placeholder="Describe the solution and expected impact"
          rows={4}
        />
      </div>
    </div>
  );
};

/**
 * Timeline editor
 */
export const TimelineEditor: React.FC<LayoutEditorProps> = ({ spec, onSpecChange }) => {
  const timelineItems = spec.timelineItems || [];

  const addTimelineItem = () => {
    const newItems = [...timelineItems, { date: '', title: '', description: '' }];
    onSpecChange({ timelineItems: newItems });
  };

  const updateTimelineItem = (index: number, field: string, value: string) => {
    const newItems = [...timelineItems];
    newItems[index] = { ...newItems[index], [field]: value };
    onSpecChange({ timelineItems: newItems });
  };

  const removeTimelineItem = (index: number) => {
    const newItems = timelineItems.filter((_, i) => i !== index);
    onSpecChange({ timelineItems: newItems });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Timeline Items</h4>
        <button
          type="button"
          onClick={addTimelineItem}
          className="btn-secondary text-sm"
        >
          Add Item
        </button>
      </div>

      {timelineItems.map((item, index) => (
        <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Item {index + 1}</span>
            <button
              type="button"
              onClick={() => removeTimelineItem(index)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Remove
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <InputField
              label="Date"
              value={item.date || ''}
              onChange={(value) => updateTimelineItem(index, 'date', value)}
              placeholder="e.g., Q1 2024"
            />
            <InputField
              label="Title"
              value={item.title || ''}
              onChange={(value) => updateTimelineItem(index, 'title', value)}
              placeholder="Milestone title"
            />
            <InputField
              label="Description"
              value={item.description || ''}
              onChange={(value) => updateTimelineItem(index, 'description', value)}
              placeholder="Brief description"
            />
          </div>
        </div>
      ))}

      {timelineItems.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No timeline items yet. Click "Add Item" to get started.</p>
        </div>
      )}
    </div>
  );
};

/**
 * Process flow editor
 */
export const ProcessFlowEditor: React.FC<LayoutEditorProps> = ({ spec, onSpecChange }) => {
  const processSteps = spec.processSteps || [];

  const addProcessStep = () => {
    const newSteps = [...processSteps, { title: '', description: '' }];
    onSpecChange({ processSteps: newSteps });
  };

  const updateProcessStep = (index: number, field: string, value: string) => {
    const newSteps = [...processSteps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    onSpecChange({ processSteps: newSteps });
  };

  const removeProcessStep = (index: number) => {
    const newSteps = processSteps.filter((_, i) => i !== index);
    onSpecChange({ processSteps: newSteps });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Process Steps</h4>
        <button
          type="button"
          onClick={addProcessStep}
          className="btn-secondary text-sm"
        >
          Add Step
        </button>
      </div>

      {processSteps.map((step, index) => (
        <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Step {index + 1}</span>
            <button
              type="button"
              onClick={() => removeProcessStep(index)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Remove
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputField
              label="Step Title"
              value={step.title || ''}
              onChange={(value) => updateProcessStep(index, 'title', value)}
              placeholder="Step name"
            />
            <InputField
              label="Description"
              value={step.description || ''}
              onChange={(value) => updateProcessStep(index, 'description', value)}
              placeholder="Step description"
            />
          </div>
        </div>
      ))}

      {processSteps.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No process steps yet. Click "Add Step" to get started.</p>
        </div>
      )}
    </div>
  );
};

/**
 * Main layout editor component that renders the appropriate editor based on layout type
 */
export const LayoutEditor: React.FC<LayoutEditorProps> = ({ spec, onSpecChange }) => {
  switch (spec.layout) {
    case 'two-column':
    case 'image-left':
    case 'image-right':
      return <TwoColumnEditor spec={spec} onSpecChange={onSpecChange} />;
    
    case 'problem-solution':
      return <ProblemSolutionEditor spec={spec} onSpecChange={onSpecChange} />;
    
    case 'timeline':
      return <TimelineEditor spec={spec} onSpecChange={onSpecChange} />;
    
    case 'process-flow':
      return <ProcessFlowEditor spec={spec} onSpecChange={onSpecChange} />;
    
    default:
      return (
        <div className="space-y-4">
          <InputField
            label="Content"
            type="textarea"
            value={spec.paragraph || ''}
            onChange={(value) => onSpecChange({ paragraph: value })}
            placeholder="Enter slide content"
            rows={6}
          />
        </div>
      );
  }
};
