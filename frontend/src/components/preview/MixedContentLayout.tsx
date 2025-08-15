/**
 * Mixed Content Layout Component
 * 
 * Renders a mixed content layout with paragraph and two columns for the live preview.
 * Mirrors the backend 'mixed-content' layout rendering.
 */

import React from 'react';
import { Column, SectionHeading, Text, Bullet, Card } from './LayoutBase';
import { PREVIEW_LAYOUT } from '../../constants/slideConstants';
import type { LayoutProps } from './LayoutBase';

export function MixedContentLayout({ spec, theme }: LayoutProps) {
  const leftContent = spec.left;
  const rightContent = spec.right;
  const hasParagraph = spec.paragraph && spec.paragraph.trim().length > 0;

  const renderColumnContent = (content: any, isRight: boolean = false) => {
    if (!content) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <div className="text-sm mb-1">□</div>
            <div className="text-xs">{isRight ? 'Right' : 'Left'} section</div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {content.heading && (
          <SectionHeading color={isRight ? 'var(--theme-accent)' : 'var(--theme-primary)'}>
            {content.heading}
          </SectionHeading>
        )}
        
        {content.paragraph && (
          <Text variant="tiny" className="leading-relaxed">
            {content.paragraph}
          </Text>
        )}
        
        {content.bullets && content.bullets.length > 0 && (
          <div className="space-y-1">
            {content.bullets.slice(0, 3).map((bullet: string, index: number) => (
              <Bullet
                key={index}
                color={isRight ? 'var(--theme-accent)' : 'var(--theme-primary)'}
                size="small"
              >
                <Text variant="tiny">{bullet}</Text>
              </Bullet>
            ))}
            {content.bullets.length > 3 && (
              <Text variant="tiny" color="muted" className="italic">
                +{content.bullets.length - 3} more...
              </Text>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3 h-full">
      {/* Top paragraph section */}
      {hasParagraph && (
        <Card
          backgroundColor="var(--theme-surface)"
          padding="8px 12px"
          className="mb-3"
        >
          <Text variant="small" className="leading-relaxed">
            {spec.paragraph}
          </Text>
        </Card>
      )}
      
      {/* Two-column section */}
      <div className="flex flex-1" style={{ gap: `${PREVIEW_LAYOUT.columnGap}%` }}>
        <Column width={`${PREVIEW_LAYOUT.columnWidth}%`}>
          {renderColumnContent(leftContent, false)}
        </Column>
        
        <Column width={`${PREVIEW_LAYOUT.columnWidth}%`}>
          {renderColumnContent(rightContent, true)}
        </Column>
      </div>
    </div>
  );
}
