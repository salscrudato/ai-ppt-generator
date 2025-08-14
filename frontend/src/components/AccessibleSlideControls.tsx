/**
 * Accessible Slide Controls
 * 
 * Provides keyboard-accessible alternatives to drag-and-drop functionality
 * for slide reordering and management.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { HiArrowUp, HiArrowDown, HiTrash, HiDocumentDuplicate, HiPencilSquare } from 'react-icons/hi2';
import { AriaLiveRegion } from '../utils/accessibility';
import type { SlideSpec } from '../types';

interface AccessibleSlideControlsProps {
  slide: SlideSpec;
  index: number;
  totalSlides: number;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  className?: string;
}

export default function AccessibleSlideControls({
  slide,
  index,
  totalSlides,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDuplicate,
  onDelete,
  className = ''
}: AccessibleSlideControlsProps) {
  const announcer = AriaLiveRegion.getInstance();

  const handleMoveUp = () => {
    if (onMoveUp && index > 0) {
      onMoveUp();
      announcer.announce(`Moved slide "${slide.title}" up to position ${index}`, 'polite');
    }
  };

  const handleMoveDown = () => {
    if (onMoveDown && index < totalSlides - 1) {
      onMoveDown();
      announcer.announce(`Moved slide "${slide.title}" down to position ${index + 2}`, 'polite');
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
      announcer.announce(`Editing slide "${slide.title}"`, 'polite');
    }
  };

  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate();
      announcer.announce(`Duplicated slide "${slide.title}"`, 'polite');
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      announcer.announce(`Deleted slide "${slide.title}"`, 'assertive');
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`} role="toolbar" aria-label={`Controls for slide ${index + 1}: ${slide.title}`}>
      {/* Move Up Button */}
      <motion.button
        onClick={handleMoveUp}
        disabled={index === 0}
        className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Move slide ${index + 1} up`}
        title={`Move slide ${index + 1} up`}
      >
        <HiArrowUp className="w-4 h-4" />
      </motion.button>

      {/* Move Down Button */}
      <motion.button
        onClick={handleMoveDown}
        disabled={index === totalSlides - 1}
        className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Move slide ${index + 1} down`}
        title={`Move slide ${index + 1} down`}
      >
        <HiArrowDown className="w-4 h-4" />
      </motion.button>

      {/* Divider */}
      <div className="w-px h-4 bg-slate-300 mx-1" role="separator" />

      {/* Edit Button */}
      {onEdit && (
        <motion.button
          onClick={handleEdit}
          className="p-1.5 rounded-md text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label={`Edit slide ${index + 1}: ${slide.title}`}
          title={`Edit slide ${index + 1}`}
        >
          <HiPencilSquare className="w-4 h-4" />
        </motion.button>
      )}

      {/* Duplicate Button */}
      {onDuplicate && (
        <motion.button
          onClick={handleDuplicate}
          className="p-1.5 rounded-md text-slate-600 hover:text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label={`Duplicate slide ${index + 1}: ${slide.title}`}
          title={`Duplicate slide ${index + 1}`}
        >
          <HiDocumentDuplicate className="w-4 h-4" />
        </motion.button>
      )}

      {/* Delete Button */}
      {onDelete && (
        <motion.button
          onClick={handleDelete}
          className="p-1.5 rounded-md text-slate-600 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label={`Delete slide ${index + 1}: ${slide.title}`}
          title={`Delete slide ${index + 1}`}
        >
          <HiTrash className="w-4 h-4" />
        </motion.button>
      )}
    </div>
  );
}

/**
 * Keyboard Shortcuts Help Component
 */
interface KeyboardShortcutsHelpProps {
  className?: string;
}

export function KeyboardShortcutsHelp({ className = '' }: KeyboardShortcutsHelpProps) {
  return (
    <div className={`bg-slate-50 border border-slate-200 rounded-lg p-4 ${className}`}>
      <h3 className="text-sm font-semibold text-slate-900 mb-3">Keyboard Shortcuts</h3>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-600">Navigate slides:</dt>
          <dd className="font-mono text-slate-900">↑ ↓ Arrow keys</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-600">Select slide:</dt>
          <dd className="font-mono text-slate-900">Space / Enter</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-600">Move slide up:</dt>
          <dd className="font-mono text-slate-900">Ctrl + ↑</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-600">Move slide down:</dt>
          <dd className="font-mono text-slate-900">Ctrl + ↓</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-600">Edit slide:</dt>
          <dd className="font-mono text-slate-900">E</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-600">Duplicate slide:</dt>
          <dd className="font-mono text-slate-900">Ctrl + D</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-600">Delete slide:</dt>
          <dd className="font-mono text-slate-900">Delete</dd>
        </div>
      </dl>
    </div>
  );
}

/**
 * Slide Navigation Component
 */
interface SlideNavigationProps {
  currentSlide: number;
  totalSlides: number;
  onSlideChange: (slideIndex: number) => void;
  className?: string;
}

export function SlideNavigation({
  currentSlide,
  totalSlides,
  onSlideChange,
  className = ''
}: SlideNavigationProps) {
  const announcer = AriaLiveRegion.getInstance();

  const handleSlideChange = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < totalSlides) {
      onSlideChange(newIndex);
      announcer.announceSlideChange(newIndex + 1, totalSlides, `Slide ${newIndex + 1}`);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        handleSlideChange(currentSlide - 1);
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        handleSlideChange(currentSlide + 1);
        break;
      case 'Home':
        event.preventDefault();
        handleSlideChange(0);
        break;
      case 'End':
        event.preventDefault();
        handleSlideChange(totalSlides - 1);
        break;
    }
  };

  return (
    <nav 
      className={`flex items-center justify-center gap-2 ${className}`}
      role="navigation"
      aria-label="Slide navigation"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <button
        onClick={() => handleSlideChange(currentSlide - 1)}
        disabled={currentSlide === 0}
        className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Previous slide"
      >
        <HiArrowUp className="w-4 h-4 rotate-[-90deg]" />
      </button>

      <span 
        className="px-3 py-1 text-sm font-medium text-slate-700 bg-slate-100 rounded-md"
        aria-live="polite"
        aria-label={`Slide ${currentSlide + 1} of ${totalSlides}`}
      >
        {currentSlide + 1} / {totalSlides}
      </span>

      <button
        onClick={() => handleSlideChange(currentSlide + 1)}
        disabled={currentSlide === totalSlides - 1}
        className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Next slide"
      >
        <HiArrowDown className="w-4 h-4 rotate-90" />
      </button>
    </nav>
  );
}
