/**
 * Comparison Table Layout Component
 * 
 * Renders a comparison table layout for the live preview.
 * Mirrors the backend 'comparison-table' layout rendering.
 */

import React from 'react';
import { Table, Text } from './LayoutBase';
import type { LayoutProps } from './LayoutBase';

export function ComparisonTableLayout({ spec, theme }: LayoutProps) {
  const table = spec.comparisonTable;

  if (!table || !table.headers || !table.rows) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-400">
          <div className="text-lg mb-2">⊞</div>
          <div className="text-xs">Add table data to see preview</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <Table
        headers={table.headers}
        rows={table.rows}
        maxRows={4}
        maxCols={4}
        className="w-full"
      />
      {table.rows.length > 4 && (
        <Text variant="tiny" color="muted" className="italic mt-2 text-center">
          +{table.rows.length - 4} more rows...
        </Text>
      )}
    </div>
  );
}
