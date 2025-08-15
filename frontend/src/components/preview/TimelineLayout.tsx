/**
 * Timeline Layout Component
 * 
 * Renders a timeline layout for the live preview.
 * Mirrors the backend 'timeline' layout rendering.
 */

import React from 'react';
import { Text, Card } from './LayoutBase';
import type { LayoutProps } from './LayoutBase';

export function TimelineLayout({ spec, theme }: LayoutProps) {
  const timeline = spec.timeline || [];
  const maxItems = 4;

  if (timeline.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-400">
          <div className="text-lg mb-2">⟶</div>
          <div className="text-xs">Add timeline events to see preview</div>
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
      
      {timeline.slice(0, maxItems).map((item, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{
                backgroundColor: 'var(--theme-primary)',
              }}
            />
            {index < Math.min(timeline.length, maxItems) - 1 && (
              <div
                className="w-0.5 h-8 mt-1"
                style={{
                  backgroundColor: 'var(--theme-border-medium)',
                }}
              />
            )}
          </div>
          
          <Card
            backgroundColor="var(--theme-surface)"
            padding="8px 12px"
            className="flex-1"
          >
            <div className="flex items-center gap-2 mb-1">
              <Text variant="tiny" weight="medium" color="accent">
                {item.date}
              </Text>
              {item.milestone && (
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: 'var(--theme-warning)' }}
                />
              )}
            </div>
            <Text variant="small" weight="medium" className="mb-1">
              {item.title}
            </Text>
            {item.description && (
              <Text variant="tiny" color="secondary">
                {item.description}
              </Text>
            )}
          </Card>
        </div>
      ))}
      
      {timeline.length > maxItems && (
        <Text variant="tiny" color="muted" className="italic text-center">
          +{timeline.length - maxItems} more events...
        </Text>
      )}
    </div>
  );
}
