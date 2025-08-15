/**
 * Two-Column Layout Component
 * 
 * Renders a two-column layout for the live preview.
 * Mirrors the backend 'two-column' layout rendering with exact spacing.
 */

import React from 'react';
import { Column, SectionHeading, Text, Bullet } from './LayoutBase';
import { PREVIEW_LAYOUT } from '../../constants/slideConstants';
import type { LayoutProps } from './LayoutBase';

export function TwoColumnLayout({ spec, theme }: LayoutProps) {
  const leftContent = spec.left;
  const rightContent = spec.right;

  const renderColumnContent = (content: any, isRight: boolean = false) => {
    if (!content) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <div className="text-lg mb-1">□</div>
            <div className="text-xs">{isRight ? 'Right' : 'Left'} column</div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {content.heading && (
          <SectionHeading color={isRight ? 'var(--theme-accent)' : 'var(--theme-primary)'}>
            {content.heading}
          </SectionHeading>
        )}
        
        {content.paragraph && (
          <Text variant="small" className="leading-relaxed">
            {content.paragraph}
          </Text>
        )}
        
        {content.bullets && content.bullets.length > 0 && (
          <div className="space-y-2">
            {content.bullets.slice(0, 4).map((bullet: string, index: number) => (
              <Bullet
                key={index}
                color={isRight ? 'var(--theme-accent)' : 'var(--theme-primary)'}
                size="small"
              >
                {bullet}
              </Bullet>
            ))}
            {content.bullets.length > 4 && (
              <Text variant="tiny" color="muted" className="italic">
                +{content.bullets.length - 4} more...
              </Text>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full" style={{ gap: `${PREVIEW_LAYOUT.columnGap}%` }}>
      <Column width={`${PREVIEW_LAYOUT.columnWidth}%`}>
        {renderColumnContent(leftContent, false)}
      </Column>
      
      <Column width={`${PREVIEW_LAYOUT.columnWidth}%`}>
        {renderColumnContent(rightContent, true)}
      </Column>
    </div>
  );
}
