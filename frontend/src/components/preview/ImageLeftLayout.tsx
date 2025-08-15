/**
 * Image-Left Layout Component
 * 
 * Renders an image on the left with content on the right for the live preview.
 * Mirrors the backend 'image-left' layout rendering.
 */

import React from 'react';
import { Column, Text, Bullet, ImagePlaceholder } from './LayoutBase';
import { PREVIEW_LAYOUT } from '../../constants/slideConstants';
import type { LayoutProps } from './LayoutBase';

export function ImageLeftLayout({ spec, theme }: LayoutProps) {
  const imagePrompt = spec.left?.imagePrompt || spec.imagePrompt;
  const hasContent = spec.paragraph || (spec.bullets && spec.bullets.length > 0);

  return (
    <div className="flex h-full w-full" style={{ gap: `${PREVIEW_LAYOUT.columnGap}%` }}>
      {/* Left Column - Image */}
      <div style={{ width: `${PREVIEW_LAYOUT.columnWidth}%` }} className="h-full">
        <ImagePlaceholder
          prompt={imagePrompt}
          height="100%"
          className="h-full w-full"
        />
      </div>

      {/* Right Column - Content */}
      <div style={{ width: `${PREVIEW_LAYOUT.columnWidth}%` }} className="h-full">
        {!hasContent ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-lg mb-1">T</div>
              <div className="text-xs">Content area</div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col justify-start space-y-2 overflow-hidden">
            {spec.paragraph && (
              <Text variant="small" className="leading-relaxed">
                {spec.paragraph}
              </Text>
            )}

            {spec.bullets && spec.bullets.length > 0 && (
              <div className="space-y-1 flex-1">
                {spec.bullets.slice(0, 5).map((bullet, index) => (
                  <Bullet
                    key={index}
                    color="var(--theme-primary)"
                    size="small"
                  >
                    {bullet}
                  </Bullet>
                ))}
                {spec.bullets.length > 5 && (
                  <Text variant="tiny" color="muted" className="italic">
                    +{spec.bullets.length - 5} more...
                  </Text>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
