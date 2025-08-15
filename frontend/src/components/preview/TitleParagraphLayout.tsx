/**
 * Title-Paragraph Layout Component
 * 
 * Renders a title with paragraph content layout for the live preview.
 * Mirrors the backend 'title-paragraph' layout rendering.
 */

import React from 'react';
import { Text } from './LayoutBase';
import type { LayoutProps } from './LayoutBase';

export function TitleParagraphLayout({ spec, theme }: LayoutProps) {
  const paragraph = spec.paragraph;

  if (!paragraph || paragraph.trim().length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-400">
          <div className="text-lg mb-2">¶</div>
          <div className="text-xs">Add paragraph content to see preview</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <Text variant="body" className="leading-relaxed">
        {paragraph}
      </Text>
    </div>
  );
}
