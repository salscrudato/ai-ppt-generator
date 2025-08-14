/**
 * SlideThumbnail Component
 * 
 * Displays a thumbnail preview of a slide with drag-and-drop functionality.
 * Features:
 * - Drag handle for reordering
 * - Slide content preview
 * - Selection state
 * - Accessibility support
 * - Edit and delete actions
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  HiEllipsisVertical,
  HiPencil,
  HiTrash,
  HiDocumentDuplicate,
  HiEye
} from 'react-icons/hi2';
import clsx from 'clsx';
import type { SlideSpec } from '../types';


interface SlideThumbnailProps {
  /** The slide to display */
  slide: SlideSpec;
  /** Index of the slide in the presentation */
  index: number;
  /** Whether this slide is currently selected */
  isSelected?: boolean;
  /** Whether the slide is being dragged */
  isDragging?: boolean;
  /** Callback when slide is selected */
  onSelect?: (slide: SlideSpec) => void;
  /** Callback when slide should be edited */
  onEdit?: (slide: SlideSpec) => void;
  /** Callback when slide should be duplicated */
  onDuplicate?: (slide: SlideSpec) => void;
  /** Callback when slide should be deleted */
  onDelete?: (slide: SlideSpec) => void;
  /** Callback when slide should be previewed */
  onPreview?: (slide: SlideSpec) => void;
}

export default function SlideThumbnail({
  slide,
  index,
  isSelected = false,
  isDragging = false,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onPreview
}: SlideThumbnailProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging
  } = useSortable({
    id: slide.id,
    data: {
      type: 'slide',
      slide,
      index
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = () => {
    onSelect?.(slide);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(slide);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicate?.(slide);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(slide);
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview?.(slide);
  };

  // Render slide content preview based on layout
  const renderSlidePreview = () => {
    switch (slide.layout) {
      case 'title':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-2">
            <h3 className="text-xs font-bold text-slate-800 line-clamp-2">
              {slide.title}
            </h3>
            {slide.paragraph && (
              <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                {slide.paragraph}
              </p>
            )}
          </div>
        );

      case 'title-bullets':
        return (
          <div className="p-2 space-y-1">
            <h3 className="text-xs font-bold text-slate-800 line-clamp-1">
              {slide.title}
            </h3>
            {slide.bullets && slide.bullets.length > 0 && (
              <div className="space-y-0.5">
                {slide.bullets.slice(0, 3).map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-1">
                    <div className="w-1 h-1 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0" />
                    <span className="text-xs text-slate-700 line-clamp-1">{bullet}</span>
                  </div>
                ))}
                {slide.bullets.length > 3 && (
                  <div className="text-xs text-slate-500 ml-2">
                    +{slide.bullets.length - 3} more
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'two-column':
        return (
          <div className="p-2 space-y-1">
            <h3 className="text-xs font-bold text-slate-800 line-clamp-1">
              {slide.title}
            </h3>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div className="space-y-0.5">
                {slide.left?.heading && (
                  <div className="font-medium text-slate-700 line-clamp-1">
                    {slide.left.heading}
                  </div>
                )}
                {slide.left?.bullets && slide.left.bullets.slice(0, 2).map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-1">
                    <div className="w-0.5 h-0.5 bg-indigo-500 rounded-full mt-1 flex-shrink-0" />
                    <span className="text-slate-600 line-clamp-1">{bullet}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-0.5">
                {slide.right?.heading && (
                  <div className="font-medium text-slate-700 line-clamp-1">
                    {slide.right.heading}
                  </div>
                )}
                {slide.right?.bullets && slide.right.bullets.slice(0, 2).map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-1">
                    <div className="w-0.5 h-0.5 bg-indigo-500 rounded-full mt-1 flex-shrink-0" />
                    <span className="text-slate-600 line-clamp-1">{bullet}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-2">
            <h3 className="text-xs font-bold text-slate-800 line-clamp-2">
              {slide.title}
            </h3>
            <div className="text-xs text-slate-500 mt-1 capitalize">
              {slide.layout.replace('-', ' ')}
            </div>
          </div>
        );
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.3, ease: 'easeOut' }
      }}
      exit={{
        opacity: 0,
        y: -20,
        scale: 0.95,
        transition: { duration: 0.2 }
      }}
      whileHover={{
        scale: 1.02,
        y: -2,
        transition: { duration: 0.2, ease: 'easeOut' }
      }}
      whileTap={{ scale: 0.98 }}
      layout
      layoutId={`slide-${slide.id}`}
      className={clsx(
        'group relative bg-white rounded-lg border-2 transition-all duration-200 cursor-pointer',
        isSelected
          ? 'border-indigo-500 shadow-lg ring-2 ring-indigo-200'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md',
        (isDragging || isSortableDragging) && 'opacity-60 scale-95 shadow-xl z-50 rotate-2'
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Slide ${index + 1}: ${slide.title}`}
      aria-selected={isSelected}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Slide Number */}
      <div className="absolute -top-2 -left-2 w-6 h-6 bg-indigo-500 text-white text-xs font-bold rounded-full flex items-center justify-center z-10">
        {index + 1}
      </div>

      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing bg-white/80 backdrop-blur-sm rounded border border-slate-200 hover:bg-slate-50"
        aria-label="Drag to reorder slide"
      >
        <HiEllipsisVertical className="w-3 h-3 text-slate-600" />
      </div>

      {/* Slide Preview */}
      <div className="aspect-video bg-gradient-to-br from-slate-50 to-white rounded-lg overflow-hidden">
        {renderSlidePreview()}
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handlePreview}
          className="p-1 bg-white/90 backdrop-blur-sm rounded border border-slate-200 hover:bg-slate-50 transition-colors"
          aria-label="Preview slide"
          title="Preview"
        >
          <HiEye className="w-3 h-3 text-slate-600" />
        </button>
        <button
          onClick={handleEdit}
          className="p-1 bg-white/90 backdrop-blur-sm rounded border border-slate-200 hover:bg-slate-50 transition-colors"
          aria-label="Edit slide"
          title="Edit"
        >
          <HiPencil className="w-3 h-3 text-slate-600" />
        </button>
        <button
          onClick={handleDuplicate}
          className="p-1 bg-white/90 backdrop-blur-sm rounded border border-slate-200 hover:bg-slate-50 transition-colors"
          aria-label="Duplicate slide"
          title="Duplicate"
        >
          <HiDocumentDuplicate className="w-3 h-3 text-slate-600" />
        </button>
        <button
          onClick={handleDelete}
          className="p-1 bg-white/90 backdrop-blur-sm rounded border border-slate-200 hover:bg-red-50 hover:text-red-600 transition-colors"
          aria-label="Delete slide"
          title="Delete"
        >
          <HiTrash className="w-3 h-3 text-slate-600 hover:text-red-600" />
        </button>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute inset-0 bg-indigo-500/10 rounded-lg pointer-events-none" />
      )}
    </motion.div>
  );
}
