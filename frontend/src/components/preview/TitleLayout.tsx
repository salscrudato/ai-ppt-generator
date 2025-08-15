/**
 * Title Layout Component
 * 
 * Renders a title-only slide layout for the live preview.
 * Mirrors the backend 'title' layout rendering.
 */

import React from 'react';
import { Text } from './LayoutBase';
import type { LayoutProps } from './LayoutBase';

export function TitleLayout({ spec, theme }: LayoutProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div
          className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: 'var(--theme-primary)',
            opacity: 0.1,
          }}
        >
          <div
            className="w-6 h-6 rounded-full"
            style={{
              backgroundColor: 'var(--theme-primary)',
              opacity: 0.6,
            }}
          />
        </div>
        <Text variant="small" color="muted">
          Title-only slide
        </Text>
      </div>
    </div>
  );
}
