/**
 * Image-Full Layout Component
 * 
 * Renders a full-width image layout for the live preview.
 * Mirrors the backend 'image-full' layout rendering.
 */

import React from 'react';
import { ImagePlaceholder } from './LayoutBase';
import type { LayoutProps } from './LayoutBase';

export function ImageFullLayout({ spec, theme }: LayoutProps) {
  const imagePrompt = spec.imagePrompt;

  return (
    <div className="h-full">
      <ImagePlaceholder
        prompt={imagePrompt}
        height="100%"
        className="h-full"
      />
    </div>
  );
}
