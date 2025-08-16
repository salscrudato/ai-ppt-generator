/**
 * Drag-and-Drop Slide Reordering System
 * 
 * Accessible drag-and-drop functionality with keyboard navigation,
 * screen reader support, and smooth animations for slide reordering.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import type { SlideSpec, ModernTheme } from '../../types';

export interface DragDropSlideReorderProps {
  slides: SlideSpec[];
  theme: ModernTheme;
  onReorder: (newOrder: SlideSpec[]) => void;
  onSlideSelect: (index: number) => void;
  selectedIndex: number;
  className?: string;
  disabled?: boolean;
}

export interface AccessibilityConfig {
  announcements: boolean;
  keyboardNavigation: boolean;
  screenReaderSupport: boolean;
  focusManagement: boolean;
}

/**
 * Drag-and-Drop Slide Reorder Component
 */
export function DragDropSlideReorder({
  slides,
  theme,
  onReorder,
  onSlideSelect,
  selectedIndex,
  className = '',
  disabled = false
}: DragDropSlideReorderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(selectedIndex);
  const [announcements, setAnnouncements] = useState<string[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  /**
   * Accessibility configuration
   */
  const accessibilityConfig: AccessibilityConfig = {
    announcements: true,
    keyboardNavigation: true,
    screenReaderSupport: true,
    focusManagement: true
  };

  /**
   * Handle slide reordering with accessibility announcements
   */
  const handleReorder = useCallback((newSlides: SlideSpec[]) => {
    if (disabled) return;

    const oldIndex = slides.findIndex(slide => slide === newSlides.find(s => s !== slides[newSlides.indexOf(s)]));
    const newIndex = newSlides.findIndex(slide => slide === slides[oldIndex]);

    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      onReorder(newSlides);
      
      // Accessibility announcement
      if (accessibilityConfig.announcements) {
        const announcement = `Slide ${oldIndex + 1} moved to position ${newIndex + 1}`;
        setAnnouncements(prev => [...prev, announcement]);
        
        // Clear announcement after delay
        setTimeout(() => {
          setAnnouncements(prev => prev.slice(1));
        }, 3000);
      }
    }
  }, [slides, onReorder, disabled, accessibilityConfig.announcements]);

  /**
   * Keyboard navigation handler
   */
  const handleKeyDown = useCallback((event: React.KeyboardEvent, index: number) => {
    if (!accessibilityConfig.keyboardNavigation || disabled) return;

    const { key, ctrlKey, metaKey, shiftKey } = event;
    const isModified = ctrlKey || metaKey;

    switch (key) {
      case 'ArrowUp':
        event.preventDefault();
        if (isModified && index > 0) {
          // Move slide up
          const newSlides = [...slides];
          [newSlides[index], newSlides[index - 1]] = [newSlides[index - 1], newSlides[index]];
          handleReorder(newSlides);
          setFocusedIndex(index - 1);
        } else if (index > 0) {
          // Navigate up
          setFocusedIndex(index - 1);
          slideRefs.current[index - 1]?.focus();
        }
        break;

      case 'ArrowDown':
        event.preventDefault();
        if (isModified && index < slides.length - 1) {
          // Move slide down
          const newSlides = [...slides];
          [newSlides[index], newSlides[index + 1]] = [newSlides[index + 1], newSlides[index]];
          handleReorder(newSlides);
          setFocusedIndex(index + 1);
        } else if (index < slides.length - 1) {
          // Navigate down
          setFocusedIndex(index + 1);
          slideRefs.current[index + 1]?.focus();
        }
        break;

      case 'Home':
        event.preventDefault();
        if (isModified && index > 0) {
          // Move slide to beginning
          const newSlides = [...slides];
          const slide = newSlides.splice(index, 1)[0];
          newSlides.unshift(slide);
          handleReorder(newSlides);
          setFocusedIndex(0);
        } else {
          // Navigate to first slide
          setFocusedIndex(0);
          slideRefs.current[0]?.focus();
        }
        break;

      case 'End':
        event.preventDefault();
        if (isModified && index < slides.length - 1) {
          // Move slide to end
          const newSlides = [...slides];
          const slide = newSlides.splice(index, 1)[0];
          newSlides.push(slide);
          handleReorder(newSlides);
          setFocusedIndex(slides.length - 1);
        } else {
          // Navigate to last slide
          setFocusedIndex(slides.length - 1);
          slideRefs.current[slides.length - 1]?.focus();
        }
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        onSlideSelect(index);
        break;
    }
  }, [slides, handleReorder, onSlideSelect, disabled, accessibilityConfig.keyboardNavigation]);

  /**
   * Focus management
   */
  useEffect(() => {
    if (accessibilityConfig.focusManagement && focusedIndex >= 0 && focusedIndex < slides.length) {
      slideRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, slides.length, accessibilityConfig.focusManagement]);

  /**
   * Drag start handler
   */
  const handleDragStart = useCallback((index: number) => {
    if (disabled) return;
    
    setIsDragging(true);
    setDraggedIndex(index);
    
    if (accessibilityConfig.announcements) {
      setAnnouncements(prev => [...prev, `Started dragging slide ${index + 1}`]);
    }
  }, [disabled, accessibilityConfig.announcements]);

  /**
   * Drag end handler
   */
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDraggedIndex(null);
    
    if (accessibilityConfig.announcements) {
      setAnnouncements(prev => [...prev, 'Finished dragging slide']);
    }
  }, [accessibilityConfig.announcements]);

  return (
    <div 
      ref={containerRef}
      className={`drag-drop-slide-reorder ${className} ${isDragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
      role="listbox"
      aria-label="Slide reorder list"
      aria-multiselectable="false"
    >
      {/* Instructions for screen readers */}
      <div className="sr-only" id="reorder-instructions">
        Use arrow keys to navigate. Hold Ctrl/Cmd and use arrow keys to reorder slides. 
        Press Enter or Space to select a slide.
      </div>

      {/* Live announcements for screen readers */}
      <div 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
        role="status"
      >
        {announcements[announcements.length - 1]}
      </div>

      {/* Reorderable slide list */}
      <Reorder.Group
        axis="y"
        values={slides}
        onReorder={handleReorder}
        className="slide-reorder-list"
      >
        <AnimatePresence>
          {slides.map((slide, index) => (
            <Reorder.Item
              key={slide.title || `slide-${index}`}
              value={slide}
              onDragStart={() => handleDragStart(index)}
              onDragEnd={handleDragEnd}
              className="slide-reorder-item"
              whileDrag={{ 
                scale: 1.05, 
                zIndex: 1000,
                boxShadow: `0 10px 30px ${theme.colors.primary}30`
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <DraggableSlideCard
                ref={(el) => (slideRefs.current[index] = el)}
                slide={slide}
                index={index}
                theme={theme}
                isSelected={index === selectedIndex}
                isFocused={index === focusedIndex}
                isDragged={index === draggedIndex}
                isDragging={isDragging}
                disabled={disabled}
                onSelect={() => onSlideSelect(index)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                onFocus={() => setFocusedIndex(index)}
              />
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>

      {/* Drop zone indicator */}
      {isDragging && (
        <motion.div
          className="drop-zone-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            borderColor: theme.colors.primary,
            backgroundColor: `${theme.colors.primary}10`
          }}
        >
          <div className="drop-zone-text">Drop here to reorder</div>
        </motion.div>
      )}
    </div>
  );
}

/**
 * Draggable Slide Card Component
 */
interface DraggableSlideCardProps {
  slide: SlideSpec;
  index: number;
  theme: ModernTheme;
  isSelected: boolean;
  isFocused: boolean;
  isDragged: boolean;
  isDragging: boolean;
  disabled: boolean;
  onSelect: () => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  onFocus: () => void;
}

const DraggableSlideCard = React.forwardRef<HTMLDivElement, DraggableSlideCardProps>(
  function DraggableSlideCard({
    slide,
    index,
    theme,
    isSelected,
    isFocused,
    isDragged,
    isDragging,
    disabled,
    onSelect,
    onKeyDown,
    onFocus
  }, ref) {
    return (
      <motion.div
        ref={ref}
        className={`draggable-slide-card ${isSelected ? 'selected' : ''} ${isFocused ? 'focused' : ''} ${isDragged ? 'dragged' : ''}`}
        role="option"
        aria-selected={isSelected}
        aria-describedby="reorder-instructions"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        style={{
          backgroundColor: theme.colors.background,
          borderColor: isSelected ? theme.colors.primary : theme.colors.borders.light,
          cursor: disabled ? 'not-allowed' : 'grab'
        }}
        whileHover={!disabled ? { 
          scale: 1.02,
          boxShadow: `0 4px 12px ${theme.colors.primary}20`
        } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
      >
        {/* Drag handle */}
        <div 
          className="drag-handle"
          style={{ color: theme.colors.text.secondary }}
          aria-hidden="true"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3 6h10v1H3V6zm0 3h10v1H3V9z"/>
          </svg>
        </div>

        {/* Slide number */}
        <div 
          className="slide-number"
          style={{ 
            backgroundColor: theme.colors.primary,
            color: theme.colors.text.inverse
          }}
        >
          {index + 1}
        </div>

        {/* Slide preview */}
        <div className="slide-preview">
          <div 
            className="slide-title"
            style={{ color: theme.colors.text.primary }}
          >
            {slide.title || `Slide ${index + 1}`}
          </div>
          
          <div 
            className="slide-content-preview"
            style={{ color: theme.colors.text.secondary }}
          >
            {slide.bullets ? (
              <div className="bullets-preview">
                {slide.bullets.slice(0, 2).map((bullet, i) => (
                  <div key={i} className="bullet-preview">
                    • {bullet.length > 40 ? `${bullet.slice(0, 37)}...` : bullet}
                  </div>
                ))}
                {slide.bullets.length > 2 && (
                  <div className="more-bullets">+{slide.bullets.length - 2} more</div>
                )}
              </div>
            ) : slide.paragraph ? (
              <div className="paragraph-preview">
                {slide.paragraph.length > 60 ? `${slide.paragraph.slice(0, 57)}...` : slide.paragraph}
              </div>
            ) : (
              <div className="layout-preview">
                {slide.layout} layout
              </div>
            )}
          </div>
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <motion.div
            className="selection-indicator"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{ backgroundColor: theme.colors.primary }}
          >
            ✓
          </motion.div>
        )}

        {/* Focus indicator */}
        {isFocused && (
          <motion.div
            className="focus-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ borderColor: theme.colors.primary }}
          />
        )}
      </motion.div>
    );
  }
);

export default DragDropSlideReorder;
