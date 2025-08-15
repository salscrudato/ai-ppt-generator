/**
 * Quote Layout Component
 * 
 * Renders a quote layout for the live preview.
 * Mirrors the backend 'quote' layout rendering.
 */

import React from 'react';
import { Text } from './LayoutBase';
import type { LayoutProps } from './LayoutBase';

export function QuoteLayout({ spec, theme }: LayoutProps) {
  const quote = spec.bullets?.[0] || spec.paragraph || '';

  if (!quote.trim()) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-400">
          <div className="text-3xl mb-2">"</div>
          <div className="text-xs">Add quote content to see preview</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center max-w-full px-4">
        <div
          className="text-4xl mb-4 opacity-30"
          style={{ color: 'var(--theme-primary)' }}
        >
          "
        </div>
        <Text
          variant="body"
          className="italic leading-relaxed mb-4"
          style={{ fontSize: '1.1rem' }}
        >
          {quote}
        </Text>
        <div
          className="text-4xl opacity-30"
          style={{ color: 'var(--theme-primary)' }}
        >
          "
        </div>
      </div>
    </div>
  );
}
