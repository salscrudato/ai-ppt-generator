/**
 * Title-Bullets Layout Component
 * 
 * Renders a title with bullet points layout for the live preview.
 * Mirrors the backend 'title-bullets' layout rendering.
 */

import React from 'react';
import { Bullet } from './LayoutBase';
import type { LayoutProps } from './LayoutBase';

export function TitleBulletsLayout({ spec, theme }: LayoutProps) {
  const bullets = spec.bullets || [];
  const maxBullets = 6; // Limit for preview

  if (bullets.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-400">
          <div className="text-2xl mb-2">•</div>
          <div className="text-xs">Add bullet points to see preview</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-start space-y-2 overflow-hidden">
      {bullets.slice(0, maxBullets).map((bullet, index) => (
        <Bullet
          key={index}
          color="var(--theme-primary)"
          size="medium"
        >
          {bullet}
        </Bullet>
      ))}
      {bullets.length > maxBullets && (
        <div className="text-xs text-gray-500 italic mt-1">
          +{bullets.length - maxBullets} more items...
        </div>
      )}
    </div>
  );
}
