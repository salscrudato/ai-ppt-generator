/**
 * Before-After Layout Component
 * 
 * Renders a before-after comparison layout for the live preview.
 * Mirrors the backend 'before-after' layout rendering.
 */

import React from 'react';
import { Column, SectionHeading, Text, Bullet, Card } from './LayoutBase';
import { PREVIEW_LAYOUT } from '../../constants/slideConstants';
import type { LayoutProps } from './LayoutBase';

export function BeforeAfterLayout({ spec, theme }: LayoutProps) {
  const beforeContent = spec.left;
  const afterContent = spec.right;

  const renderBeforeContent = () => {
    if (!beforeContent) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <div className="text-lg mb-1">←</div>
            <div className="text-xs">Before</div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <SectionHeading color="var(--theme-secondary)">
          {beforeContent.heading || 'Before'}
        </SectionHeading>
        
        {beforeContent.paragraph && (
          <Text variant="small" className="leading-relaxed">
            {beforeContent.paragraph}
          </Text>
        )}
        
        {beforeContent.bullets && beforeContent.bullets.length > 0 && (
          <div className="space-y-1">
            {beforeContent.bullets.slice(0, 3).map((bullet: string, index: number) => (
              <Bullet
                key={index}
                color="var(--theme-secondary)"
                size="small"
              >
                <Text variant="tiny">{bullet}</Text>
              </Bullet>
            ))}
            {beforeContent.bullets.length > 3 && (
              <Text variant="tiny" color="muted" className="italic">
                +{beforeContent.bullets.length - 3} more...
              </Text>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderAfterContent = () => {
    if (!afterContent) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <div className="text-lg mb-1">→</div>
            <div className="text-xs">After</div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <SectionHeading color="var(--theme-accent)">
          {afterContent.heading || 'After'}
        </SectionHeading>
        
        {afterContent.paragraph && (
          <Text variant="small" className="leading-relaxed">
            {afterContent.paragraph}
          </Text>
        )}
        
        {afterContent.bullets && afterContent.bullets.length > 0 && (
          <div className="space-y-1">
            {afterContent.bullets.slice(0, 3).map((bullet: string, index: number) => (
              <Bullet
                key={index}
                color="var(--theme-accent)"
                size="small"
              >
                <Text variant="tiny">{bullet}</Text>
              </Bullet>
            ))}
            {afterContent.bullets.length > 3 && (
              <Text variant="tiny" color="muted" className="italic">
                +{afterContent.bullets.length - 3} more...
              </Text>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full" style={{ gap: `${PREVIEW_LAYOUT.columnGap}%` }}>
      {/* Before Column */}
      <Column width={`${PREVIEW_LAYOUT.columnWidth}%`}>
        <Card
          backgroundColor="var(--theme-surface)"
          borderColor="var(--theme-border-medium)"
          padding="12px"
          className="h-full"
        >
          {renderBeforeContent()}
        </Card>
      </Column>
      
      {/* After Column */}
      <Column width={`${PREVIEW_LAYOUT.columnWidth}%`}>
        <Card
          backgroundColor="rgba(59, 130, 246, 0.05)"
          borderColor="rgba(59, 130, 246, 0.2)"
          padding="12px"
          className="h-full"
        >
          {renderAfterContent()}
        </Card>
      </Column>
    </div>
  );
}
