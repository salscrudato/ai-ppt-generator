/**
 * Base Layout Components for Slide Preview
 * 
 * Shared components and utilities for all layout renderers.
 * Provides consistent styling and behavior across all layout types.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import React from 'react';
import clsx from 'clsx';
import type { SlideSpec } from '../../types';
import type { ProfessionalTheme } from '../../themes/professionalThemes';
import { PREVIEW_TYPOGRAPHY } from '../../constants/slideConstants';

/**
 * Common props for all layout components
 */
export interface LayoutProps {
  spec: SlideSpec;
  theme: ProfessionalTheme;
}

/**
 * Base text component with theme-aware styling
 */
export interface TextProps {
  children: React.ReactNode;
  variant?: 'heading' | 'body' | 'small' | 'tiny';
  color?: 'primary' | 'secondary' | 'muted' | 'accent';
  weight?: 'normal' | 'medium' | 'bold';
  align?: 'left' | 'center' | 'right';
  className?: string;
  style?: React.CSSProperties;
}

export function Text({
  children,
  variant = 'body',
  color = 'primary',
  weight = 'normal',
  align = 'left',
  className,
  style,
}: TextProps) {
  const getFontSize = () => {
    switch (variant) {
      case 'heading': return PREVIEW_TYPOGRAPHY.headingSize;
      case 'body': return PREVIEW_TYPOGRAPHY.bodySize;
      case 'small': return PREVIEW_TYPOGRAPHY.smallSize;
      case 'tiny': return PREVIEW_TYPOGRAPHY.tinySize;
      default: return PREVIEW_TYPOGRAPHY.bodySize;
    }
  };

  const getColor = () => {
    switch (color) {
      case 'primary': return 'var(--theme-text-primary)';
      case 'secondary': return 'var(--theme-text-secondary)';
      case 'muted': return 'var(--theme-text-muted)';
      case 'accent': return 'var(--theme-accent)';
      default: return 'var(--theme-text-primary)';
    }
  };

  const getFontWeight = () => {
    switch (weight) {
      case 'normal': return 400;
      case 'medium': return 500;
      case 'bold': return 700;
      default: return 400;
    }
  };

  return (
    <div
      className={clsx('leading-relaxed', className)}
      style={{
        fontSize: getFontSize(),
        color: getColor(),
        fontWeight: getFontWeight(),
        textAlign: align,
        fontFamily: variant === 'heading' ? 'var(--theme-heading-font)' : 'var(--theme-body-font)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Bullet point component
 */
export interface BulletProps {
  children: React.ReactNode;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function Bullet({ children, color = 'var(--theme-primary)', size = 'medium', className }: BulletProps) {
  const getBulletSize = () => {
    switch (size) {
      case 'small': return '4px';
      case 'medium': return '6px';
      case 'large': return '8px';
      default: return '6px';
    }
  };

  return (
    <div className={clsx('flex items-start gap-2', className)}>
      <div
        className="rounded-full flex-shrink-0 mt-1"
        style={{
          width: getBulletSize(),
          height: getBulletSize(),
          backgroundColor: color,
          marginTop: '0.4em',
        }}
      />
      <Text variant="small" className="flex-1">
        {children}
      </Text>
    </div>
  );
}

/**
 * Column container component
 */
export interface ColumnProps {
  children: React.ReactNode;
  width?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function Column({ children, width = '50%', className, style }: ColumnProps) {
  return (
    <div
      className={clsx('flex flex-col', className)}
      style={{
        width,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Section heading component
 */
export interface SectionHeadingProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export function SectionHeading({ children, color = 'var(--theme-primary)', className }: SectionHeadingProps) {
  return (
    <Text
      variant="heading"
      weight="bold"
      className={clsx('mb-2', className)}
      style={{ color }}
    >
      {children}
    </Text>
  );
}

/**
 * Card component for grouped content
 */
export interface CardProps {
  children: React.ReactNode;
  backgroundColor?: string;
  borderColor?: string;
  className?: string;
  padding?: string;
}

export function Card({
  children,
  backgroundColor = 'var(--theme-surface)',
  borderColor = 'var(--theme-border-light)',
  className,
  padding = '12px',
}: CardProps) {
  return (
    <div
      className={clsx('rounded-lg border', className)}
      style={{
        backgroundColor,
        borderColor,
        padding,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Image placeholder component
 */
export interface ImagePlaceholderProps {
  prompt?: string;
  width?: string;
  height?: string;
  className?: string;
}

export function ImagePlaceholder({
  prompt,
  width = '100%',
  height = '120px',
  className,
}: ImagePlaceholderProps) {
  return (
    <div
      className={clsx(
        'flex items-center justify-center rounded-lg border-2 border-dashed',
        className
      )}
      style={{
        width,
        height,
        borderColor: 'var(--theme-border-medium)',
        backgroundColor: 'var(--theme-surface)',
      }}
    >
      <div className="text-center">
        <div
          className="w-8 h-8 mx-auto mb-2 rounded"
          style={{ backgroundColor: 'var(--theme-primary)', opacity: 0.3 }}
        />
        <Text variant="tiny" color="muted">
          {prompt ? `Image: ${prompt.substring(0, 30)}...` : 'Image'}
        </Text>
      </div>
    </div>
  );
}

/**
 * Chart placeholder component
 */
export interface ChartPlaceholderProps {
  type?: string;
  title?: string;
  className?: string;
}

export function ChartPlaceholder({ type = 'bar', title, className }: ChartPlaceholderProps) {
  return (
    <div
      className={clsx('flex items-center justify-center rounded-lg border', className)}
      style={{
        height: '150px',
        borderColor: 'var(--theme-border-light)',
        backgroundColor: 'var(--theme-surface)',
      }}
    >
      <div className="text-center">
        <div
          className="w-16 h-12 mx-auto mb-2 rounded flex items-center justify-center"
          style={{ backgroundColor: 'var(--theme-primary)', opacity: 0.2 }}
        >
          <div
            className="w-8 h-8 rounded"
            style={{ backgroundColor: 'var(--theme-primary)', opacity: 0.6 }}
          />
        </div>
        <Text variant="small" weight="medium">
          {title || 'Chart'}
        </Text>
        <Text variant="tiny" color="muted">
          {type} chart
        </Text>
      </div>
    </div>
  );
}

/**
 * Table component
 */
export interface TableProps {
  headers?: string[];
  rows?: string[][];
  maxRows?: number;
  maxCols?: number;
  className?: string;
}

export function Table({ headers = [], rows = [], maxRows = 3, maxCols = 3, className }: TableProps) {
  const displayHeaders = headers.slice(0, maxCols);
  const displayRows = rows.slice(0, maxRows);

  return (
    <div
      className={clsx('overflow-hidden rounded border', className)}
      style={{ borderColor: 'var(--theme-border-medium)' }}
    >
      <table className="w-full text-xs">
        {displayHeaders.length > 0 && (
          <thead style={{ backgroundColor: 'var(--theme-surface)' }}>
            <tr>
              {displayHeaders.map((header, index) => (
                <th
                  key={index}
                  className="px-2 py-1 text-left font-medium border-b"
                  style={{
                    color: 'var(--theme-primary)',
                    borderColor: 'var(--theme-border-medium)',
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {displayRows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              style={{
                backgroundColor: rowIndex % 2 === 0 ? 'var(--theme-surface)' : 'transparent',
              }}
            >
              {row.slice(0, maxCols).map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-2 py-1 border-b truncate"
                  style={{
                    color: 'var(--theme-text-primary)',
                    borderColor: 'var(--theme-border-light)',
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
