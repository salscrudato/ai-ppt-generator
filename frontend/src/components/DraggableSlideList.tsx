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

import { useState } from 'react';
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

  // Keyboard shortcuts and touch fallback for moving slides
  const handleKeyboardReorder = (slideId: string, direction: 'up' | 'down') => {
    const currentIndex = slides.findIndex(slide => slide.id === slideId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    // Check bounds
    if (newIndex < 0 || newIndex >= slides.length) return;

    const newSlides = arrayMove(slides, currentIndex, newIndex);
    onSlidesReorder(newSlides);

    // Announce the move
    const slide = slides[currentIndex];
    const announcement = `Moved slide "${slide.title}" ${direction} to position ${newIndex + 1}`;
    announceToScreenReader(announcement);
  };

  // Touch device detection
  const isTouchDevice = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
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
      <section
        className={`text-center py-12 ${className}`}
        role="region"
        aria-label="Slide list"
      >
        <h3 className="text-slate-400 text-lg mb-2">No slides yet</h3>
        <p className="text-slate-500 text-sm">
          Create your first slide to get started
        </p>
      </section>
    );
  }

  return (
    <section
      className={className}
      role="region"
      aria-label="Slide list"
    >
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
          <ol
            className="space-y-4 list-none"
            role="listbox"
            aria-label={`Slide thumbnails, ${slides.length} slides total. Use arrow keys to navigate, space to select, and drag to reorder`}
            aria-multiselectable="false"
          >
            <AnimatePresence>
              {slides.map((slide, index) => (
                <motion.li
                  key={slide.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  role="option"
                  aria-selected={slide.id === selectedSlideId}
                  aria-posinset={index + 1}
                  aria-setsize={slides.length}
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
                    onMove={handleKeyboardReorder}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
        </SortableContext>

        <DragOverlay dropAnimation={dropAnimationConfig}>
          {dragContext.activeSlide ? (
            <motion.div
              initial={{ scale: 1, rotate: 0 }}
              animate={{
                scale: 1.05,
                rotate: 3,
                transition: { duration: 0.2, ease: 'easeOut' }
              }}
              className="shadow-2xl"
            >
              <SlideThumbnail
                slide={dragContext.activeSlide}
                index={dragContext.activeIndex || 0}
                isDragging={true}
              />
            </motion.div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Screen reader instructions */}
      <div className="sr-only" aria-live="polite" id="slide-list-instructions">
        Slide list with {slides.length} slides. Use arrow keys to navigate between slides.
        Press space or enter to select a slide. Use drag and drop or keyboard shortcuts to reorder slides.
        {dragContext.activeSlide && ` Currently dragging slide ${dragContext.activeIndex! + 1}: ${dragContext.activeSlide.title}`}
      </div>
    </section>
  );
}
