/**
 * Problem-Solution Layout Component
 * 
 * Renders a problem-solution layout for the live preview.
 * Mirrors the backend 'problem-solution' layout rendering.
 */

import React from 'react';
import { Column, SectionHeading, Text, Bullet, Card } from './LayoutBase';
import { PREVIEW_LAYOUT } from '../../constants/slideConstants';
import type { LayoutProps } from './LayoutBase';

export function ProblemSolutionLayout({ spec, theme }: LayoutProps) {
  const problemContent = spec.left;
  const solutionContent = spec.right;

  const renderProblemContent = () => {
    if (!problemContent) {
      return (
        <div className="flex items-center justify-center h-full text-red-400">
          <div className="text-center">
            <div className="text-lg mb-1">⚠</div>
            <div className="text-xs">Problem</div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <SectionHeading color="var(--theme-error)">
          {problemContent.heading || 'Problem'}
        </SectionHeading>
        
        {problemContent.paragraph && (
          <Text variant="small" className="leading-relaxed">
            {problemContent.paragraph}
          </Text>
        )}
        
        {problemContent.bullets && problemContent.bullets.length > 0 && (
          <div className="space-y-1">
            {problemContent.bullets.slice(0, 3).map((bullet: string, index: number) => (
              <Bullet
                key={index}
                color="var(--theme-error)"
                size="small"
              >
                <Text variant="tiny">{bullet}</Text>
              </Bullet>
            ))}
            {problemContent.bullets.length > 3 && (
              <Text variant="tiny" color="muted" className="italic">
                +{problemContent.bullets.length - 3} more...
              </Text>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderSolutionContent = () => {
    if (!solutionContent) {
      return (
        <div className="flex items-center justify-center h-full text-green-400">
          <div className="text-center">
            <div className="text-lg mb-1">✓</div>
            <div className="text-xs">Solution</div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <SectionHeading color="var(--theme-success)">
          {solutionContent.heading || 'Solution'}
        </SectionHeading>
        
        {solutionContent.paragraph && (
          <Text variant="small" className="leading-relaxed">
            {solutionContent.paragraph}
          </Text>
        )}
        
        {solutionContent.bullets && solutionContent.bullets.length > 0 && (
          <div className="space-y-1">
            {solutionContent.bullets.slice(0, 3).map((bullet: string, index: number) => (
              <Bullet
                key={index}
                color="var(--theme-success)"
                size="small"
              >
                <Text variant="tiny">{bullet}</Text>
              </Bullet>
            ))}
            {solutionContent.bullets.length > 3 && (
              <Text variant="tiny" color="muted" className="italic">
                +{solutionContent.bullets.length - 3} more...
              </Text>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full" style={{ gap: `${PREVIEW_LAYOUT.columnGap}%` }}>
      {/* Problem Column */}
      <Column width={`${PREVIEW_LAYOUT.columnWidth}%`}>
        <Card
          backgroundColor="rgba(239, 68, 68, 0.05)"
          borderColor="rgba(239, 68, 68, 0.2)"
          padding="12px"
          className="h-full"
        >
          {renderProblemContent()}
        </Card>
      </Column>
      
      {/* Solution Column */}
      <Column width={`${PREVIEW_LAYOUT.columnWidth}%`}>
        <Card
          backgroundColor="rgba(16, 185, 129, 0.05)"
          borderColor="rgba(16, 185, 129, 0.2)"
          padding="12px"
          className="h-full"
        >
          {renderSolutionContent()}
        </Card>
      </Column>
    </div>
  );
}
