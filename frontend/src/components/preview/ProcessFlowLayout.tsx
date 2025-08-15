/**
 * Process Flow Layout Component
 * 
 * Renders a process flow layout for the live preview.
 * Mirrors the backend 'process-flow' layout rendering.
 */

import React from 'react';
import { Text, Card } from './LayoutBase';
import type { LayoutProps } from './LayoutBase';

export function ProcessFlowLayout({ spec, theme }: LayoutProps) {
  const steps = spec.processSteps || [];
  const maxSteps = 4;

  if (steps.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-400">
          <div className="text-lg mb-2">→</div>
          <div className="text-xs">Add process steps to see preview</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 h-full overflow-y-auto">
      {spec.paragraph && (
        <Card
          backgroundColor="var(--theme-surface)"
          padding="8px 12px"
          className="mb-3"
        >
          <Text variant="small">{spec.paragraph}</Text>
        </Card>
      )}
      
      {steps.slice(0, maxSteps).map((step, index) => (
        <div key={index} className="flex items-start gap-3">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{
              backgroundColor: 'var(--theme-accent)',
            }}
          >
            {index + 1}
          </div>
          
          <Card
            backgroundColor="var(--theme-surface)"
            padding="8px 12px"
            className="flex-1"
          >
            <Text variant="small" weight="medium" className="mb-1">
              {step.title}
            </Text>
            {step.description && (
              <Text variant="tiny" color="secondary">
                {step.description}
              </Text>
            )}
          </Card>
          
          {index < Math.min(steps.length, maxSteps) - 1 && (
            <div className="flex justify-center w-full">
              <div
                className="text-lg"
                style={{ color: 'var(--theme-border-medium)' }}
              >
                ↓
              </div>
            </div>
          )}
        </div>
      ))}
      
      {steps.length > maxSteps && (
        <Text variant="tiny" color="muted" className="italic text-center">
          +{steps.length - maxSteps} more steps...
        </Text>
      )}
    </div>
  );
}
