/**
 * Agenda Layout Component
 * 
 * Renders an agenda layout for the live preview.
 * Mirrors the backend 'agenda' layout rendering.
 */

import React from 'react';
import { Text, Bullet } from './LayoutBase';
import type { LayoutProps } from './LayoutBase';

export function AgendaLayout({ spec, theme }: LayoutProps) {
  const bullets = spec.bullets || [];
  const maxItems = 6;

  if (bullets.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-400">
          <div className="text-lg mb-2">📋</div>
          <div className="text-xs">Add agenda items to see preview</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full">
      {/* Agenda Header */}
      <div className="flex items-center">
        <Text variant="heading" weight="bold" color="primary">
          Agenda
        </Text>
        <div
          className="flex-1 h-px ml-4"
          style={{ backgroundColor: 'var(--theme-border-medium)' }}
        />
      </div>
      
      {/* Agenda Items */}
      <div className="space-y-3">
        {bullets.slice(0, maxItems).map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{
                backgroundColor: 'var(--theme-primary)',
              }}
            >
              {index + 1}
            </div>
            <Text variant="small" className="flex-1 leading-relaxed">
              {item}
            </Text>
          </div>
        ))}
        
        {bullets.length > maxItems && (
          <Text variant="tiny" color="muted" className="italic text-center">
            +{bullets.length - maxItems} more items...
          </Text>
        )}
      </div>
    </div>
  );
}
