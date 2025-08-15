/**
 * Image-Right Layout Component
 * 
 * Renders content on the left with an image on the right for the live preview.
 * Mirrors the backend 'image-right' layout rendering.
 */

import React from 'react';
import { Column, Text, Bullet, ImagePlaceholder } from './LayoutBase';
import { PREVIEW_LAYOUT } from '../../constants/slideConstants';
import type { LayoutProps } from './LayoutBase';

export function ImageRightLayout({ spec, theme }: LayoutProps) {
  const imagePrompt = spec.right?.imagePrompt || spec.imagePrompt;
  const hasContent = spec.paragraph || (spec.bullets && spec.bullets.length > 0);

  return (
    <div className="flex h-full" style={{ gap: `${PREVIEW_LAYOUT.columnGap}%` }}>
      {/* Left Column - Content */}
      <Column width={`${PREVIEW_LAYOUT.columnWidth}%`}>
        {!hasContent ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-lg mb-1">T</div>
              <div className="text-xs">Content area</div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 h-full">
            {spec.paragraph && (
              <Text variant="small" className="leading-relaxed">
                {spec.paragraph}
              </Text>
            )}
            
            {spec.bullets && spec.bullets.length > 0 && (
              <div className="space-y-2">
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
      </Column>
      
      {/* Right Column - Image */}
      <Column width={`${PREVIEW_LAYOUT.columnWidth}%`}>
        <ImagePlaceholder
          prompt={imagePrompt}
          height="100%"
          className="h-full"
        />
      </Column>
    </div>
  );
}
