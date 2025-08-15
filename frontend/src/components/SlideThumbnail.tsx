/**
 * SlideThumbnail Component
 * 
 * Displays a thumbnail preview of a slide with drag-and-drop functionality.
 * Features:
 * - Visual preview of slide content
 * - Drag handle for reordering
 * - Selection state
 * - Accessibility support
 * - Action buttons (edit, duplicate, delete)
 */

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import {
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  HiEllipsisVertical,
  HiPencil,
  HiDocumentDuplicate,
  HiTrash,
  HiEye,
  HiPhoto,
  HiRectangleStack,
  HiChevronUp,
  HiChevronDown
} from 'react-icons/hi2';
import clsx from 'clsx';
import type { SlideSpec } from '../types';

interface SlideThumbnailProps {
  /** The slide to display */
  slide: SlideSpec;
  /** Index in the slide list */
  index: number;
  /** Whether this slide is currently selected */
  isSelected?: boolean;
  /** Whether this slide is being dragged */
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
  /** Callback when slide should be moved up/down */
  onMove?: (slideId: string, direction: 'up' | 'down') => void;
  /** Custom class name */
  className?: string;
}

const SlideThumbnail = forwardRef<HTMLDivElement, SlideThumbnailProps>(({
  slide,
  index,
  isSelected = false,
  isDragging = false,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onPreview,
  onMove,
  className = '',
  ...props
}, _ref) => {
  // Touch device detection
  const isTouchDevice = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  };
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: slide.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Render slide content preview based on layout
  const renderSlidePreview = () => {
    switch (slide.layout) {
      case 'title':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h3 className="text-xs font-semibold text-gray-800 truncate">
                {slide.title}
              </h3>
            </div>
          </div>
        );

      case 'title-bullets':
        return (
          <div className="p-2 h-full">
            <h3 className="text-xs font-semibold text-gray-800 truncate mb-1">
              {slide.title}
            </h3>
            <div className="space-y-0.5">
              {(slide.bullets || []).slice(0, 3).map((bullet, i) => (
                <div key={i} className="flex items-start gap-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full mt-1 flex-shrink-0"></div>
                  <span className="text-xs text-gray-600 truncate">{bullet}</span>
                </div>
              ))}
              {(slide.bullets || []).length > 3 && (
                <div className="text-xs text-gray-400">
                  +{(slide.bullets || []).length - 3} more
                </div>
              )}
            </div>
          </div>
        );

      case 'title-paragraph':
        return (
          <div className="p-2 h-full">
            <h3 className="text-xs font-semibold text-gray-800 truncate mb-1">
              {slide.title}
            </h3>
            <p className="text-xs text-gray-600 line-clamp-3">
              {slide.paragraph}
            </p>
          </div>
        );

      case 'two-column':
        return (
          <div className="p-2 h-full">
            <h3 className="text-xs font-semibold text-gray-800 truncate mb-1">
              {slide.title}
            </h3>
            <div className="grid grid-cols-2 gap-1 h-full">
              <div className="bg-gray-50 rounded p-1">
                <div className="text-xs text-gray-500 truncate">
                  {slide.left?.heading || 'Left'}
                </div>
              </div>
              <div className="bg-gray-50 rounded p-1">
                <div className="text-xs text-gray-500 truncate">
                  {slide.right?.heading || 'Right'}
                </div>
              </div>
            </div>
          </div>
        );

      case 'image-left':
      case 'image-right':
      case 'image-full':
        return (
          <div className="p-2 h-full">
            <h3 className="text-xs font-semibold text-gray-800 truncate mb-1">
              {slide.title}
            </h3>
            <div className="flex items-center justify-center bg-gray-100 rounded h-8">
              <HiPhoto className="w-3 h-3 text-gray-400" />
            </div>
          </div>
        );

      case 'chart':
        return (
          <div className="p-2 h-full">
            <h3 className="text-xs font-semibold text-gray-800 truncate mb-1">
              {slide.title}
            </h3>
            <div className="flex items-center justify-center bg-blue-50 rounded h-8">
              <HiRectangleStack className="w-3 h-3 text-blue-400" />
            </div>
          </div>
        );

      default:
        return (
          <div className="p-2 h-full">
            <h3 className="text-xs font-semibold text-gray-800 truncate">
              {slide.title}
            </h3>
            <div className="text-xs text-gray-500 mt-1">
              {slide.layout}
            </div>
          </div>
        );
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={clsx(
        'group relative bg-white border-2 rounded-lg shadow-sm transition-all duration-200',
        'hover:shadow-md focus-within:shadow-md',
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 hover:border-gray-300',
        isDragging || isSortableDragging
          ? 'opacity-50 shadow-lg scale-105 rotate-2'
          : '',
        className
      )}
      {...props}
    >
      {/* Slide Number */}
      <div className="absolute -top-2 -left-2 w-6 h-6 bg-gray-600 text-white text-xs font-medium rounded-full flex items-center justify-center z-10">
        {index + 1}
      </div>

      {/* Drag Handle */}
      <button
        {...listeners}
        className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded shadow-sm hover:bg-gray-50 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={`Drag to reorder slide ${index + 1}: ${slide.title}`}
        tabIndex={-1}
      >
        <HiEllipsisVertical className="w-3 h-3 text-gray-500" />
      </button>

      {/* Slide Preview */}
      <div
        className="aspect-video cursor-pointer"
        onClick={() => onSelect?.(slide)}
        role="button"
        tabIndex={0}
        aria-label={`Select slide ${index + 1}: ${slide.title}. Press Ctrl+Up/Down to reorder, Enter to select, E to edit, D to duplicate, Delete to remove.`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect?.(slide);
          } else if (e.key === 'ArrowUp' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            onMove?.(slide.id, 'up');
          } else if (e.key === 'ArrowDown' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            onMove?.(slide.id, 'down');
          } else if (e.key === 'e' || e.key === 'E') {
            e.preventDefault();
            onEdit?.(slide);
          } else if (e.key === 'd' || e.key === 'D') {
            e.preventDefault();
            onDuplicate?.(slide);
          } else if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault();
            onDelete?.(slide);
          }
        }}
      >
        {renderSlidePreview()}
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onPreview && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview(slide);
            }}
            className="p-1 bg-white rounded shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={`Preview slide ${index + 1}`}
            title="Preview"
          >
            <HiEye className="w-3 h-3 text-gray-600" />
          </button>
        )}
        
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(slide);
            }}
            className="p-1 bg-white rounded shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={`Edit slide ${index + 1}`}
            title="Edit"
          >
            <HiPencil className="w-3 h-3 text-gray-600" />
          </button>
        )}
        
        {onDuplicate && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(slide);
            }}
            className="p-1 bg-white rounded shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={`Duplicate slide ${index + 1}`}
            title="Duplicate"
          >
            <HiDocumentDuplicate className="w-3 h-3 text-gray-600" />
          </button>
        )}
        
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(slide);
            }}
            className="p-1 bg-white rounded shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label={`Delete slide ${index + 1}`}
            title="Delete"
          >
            <HiTrash className="w-3 h-3 text-red-600" />
          </button>
        )}
      </div>

      {/* Touch-friendly reorder buttons for mobile */}
      {isTouchDevice() && onMove && (
        <div className="absolute top-2 left-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMove(slide.id, 'up');
            }}
            className="p-1 bg-white rounded shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[32px] min-w-[32px] touch-target"
            aria-label={`Move slide ${index + 1} up`}
            title="Move up"
          >
            <HiChevronUp className="w-3 h-3 text-gray-600" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onMove(slide.id, 'down');
            }}
            className="p-1 bg-white rounded shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[32px] min-w-[32px] touch-target"
            aria-label={`Move slide ${index + 1} down`}
            title="Move down"
          >
            <HiChevronDown className="w-3 h-3 text-gray-600" />
          </button>
        </div>
      )}

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
        </div>
      )}
    </motion.div>
  );
});

SlideThumbnail.displayName = 'SlideThumbnail';

export default SlideThumbnail;
