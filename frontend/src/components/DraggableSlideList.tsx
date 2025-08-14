/**
 * DraggableSlideList Component
 * 
 * Provides drag-and-drop functionality for reordering slides in a presentation.
 * Features:
 * - Sortable slide thumbnails
 * - Keyboard accessibility
 * - Screen reader support
 * - Visual feedback during drag operations
 * - Auto-scroll during drag
 */

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import type {
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DropAnimation
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { motion, AnimatePresence } from 'framer-motion';
import SlideThumbnail from './SlideThumbnail';
import type { SlideSpec, SlideDragContext } from '../types';

interface DraggableSlideListProps {
  /** Array of slides to display */
  slides: SlideSpec[];
  /** Currently selected slide ID */
  selectedSlideId?: string;
  /** Callback when slides are reordered */
  onSlidesReorder: (slides: SlideSpec[]) => void;
  /** Callback when a slide is selected */
  onSlideSelect?: (slide: SlideSpec) => void;
  /** Callback when a slide should be edited */
  onSlideEdit?: (slide: SlideSpec) => void;
  /** Callback when a slide should be duplicated */
  onSlideDuplicate?: (slide: SlideSpec) => void;
  /** Callback when a slide should be deleted */
  onSlideDelete?: (slide: SlideSpec) => void;
  /** Callback when a slide should be previewed */
  onSlidePreview?: (slide: SlideSpec) => void;
  /** Whether the list is in a loading state */
  loading?: boolean;
  /** Custom class name */
  className?: string;
}

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.4',
      },
    },
  }),
};

export default function DraggableSlideList({
  slides,
  selectedSlideId,
  onSlidesReorder,
  onSlideSelect,
  onSlideEdit,
  onSlideDuplicate,
  onSlideDelete,
  onSlidePreview,
  loading = false,
  className = ''
}: DraggableSlideListProps) {
  const [dragContext, setDragContext] = useState<SlideDragContext>({
    activeSlide: null,
    activeIndex: null,
    overIndex: null
  });

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeSlide = slides.find(slide => slide.id === active.id);
    const activeIndex = slides.findIndex(slide => slide.id === active.id);

    setDragContext({
      activeSlide: activeSlide || null,
      activeIndex,
      overIndex: null
    });

    // Announce drag start to screen readers
    const announcement = `Started dragging slide ${activeIndex + 1}: ${activeSlide?.title}`;
    announceToScreenReader(announcement);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setDragContext(prev => ({ ...prev, overIndex: null }));
      return;
    }

    const activeIndex = slides.findIndex(slide => slide.id === active.id);
    const overIndex = slides.findIndex(slide => slide.id === over.id);

    setDragContext(prev => ({
      ...prev,
      activeIndex,
      overIndex
    }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setDragContext({
        activeSlide: null,
        activeIndex: null,
        overIndex: null
      });
      return;
    }

    const activeIndex = slides.findIndex(slide => slide.id === active.id);
    const overIndex = slides.findIndex(slide => slide.id === over.id);

    if (activeIndex !== overIndex) {
      const newSlides = arrayMove(slides, activeIndex, overIndex);
      onSlidesReorder(newSlides);

      // Announce successful reorder to screen readers
      const activeSlide = slides[activeIndex];
      const announcement = `Moved slide "${activeSlide.title}" from position ${activeIndex + 1} to position ${overIndex + 1}`;
      announceToScreenReader(announcement);
    }

    setDragContext({
      activeSlide: null,
      activeIndex: null,
      overIndex: null
    });
  };

  // Helper function to announce messages to screen readers
  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="bg-slate-200 animate-pulse rounded-lg aspect-video"
          />
        ))}
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-slate-400 text-lg mb-2">No slides yet</div>
        <div className="text-slate-500 text-sm">
          Create your first slide to get started
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
      >
        <SortableContext
          items={slides.map(slide => slide.id)}
          strategy={verticalListSortingStrategy}
        >
          <div
            className="space-y-4"
            role="listbox"
            aria-label="Slide thumbnails - use arrow keys to navigate, space to select, and drag to reorder"
          >
            <AnimatePresence>
              {slides.map((slide, index) => (
                <motion.div
                  key={slide.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <SlideThumbnail
                    slide={slide}
                    index={index}
                    isSelected={slide.id === selectedSlideId}
                    isDragging={dragContext.activeSlide?.id === slide.id}
                    onSelect={onSlideSelect}
                    onEdit={onSlideEdit}
                    onDuplicate={onSlideDuplicate}
                    onDelete={onSlideDelete}
                    onPreview={onSlidePreview}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </SortableContext>

        <DragOverlay dropAnimation={dropAnimationConfig}>
          {dragContext.activeSlide ? (
            <div className="transform rotate-3 scale-105">
              <SlideThumbnail
                slide={dragContext.activeSlide}
                index={dragContext.activeIndex || 0}
                isDragging={true}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Screen reader only instructions */}
      <div className="sr-only" aria-live="polite">
        Use arrow keys to navigate between slides. Press space to select a slide. 
        Use the drag handle or keyboard shortcuts to reorder slides.
      </div>
    </div>
  );
}
