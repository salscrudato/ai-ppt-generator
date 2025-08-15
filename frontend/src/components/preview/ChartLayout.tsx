/**
 * Chart Layout Component
 * 
 * Renders a chart layout for the live preview.
 * Mirrors the backend 'chart' layout rendering.
 */

import React from 'react';
import { ChartPlaceholder } from './LayoutBase';
import type { LayoutProps } from './LayoutBase';

export function ChartLayout({ spec, theme }: LayoutProps) {
  const chart = spec.chart;
  const chartType = chart?.type || 'bar';
  const chartTitle = chart?.title || 'Chart';

  return (
    <div className="h-full flex items-center justify-center">
      <ChartPlaceholder
        type={chartType}
        title={chartTitle}
        className="w-full max-w-md"
      />
    </div>
  );
}
