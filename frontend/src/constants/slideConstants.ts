/**
 * Slide Layout Constants
 * 
 * Centralized constants for consistent spacing and dimensions across
 * preview components and PowerPoint export functionality.
 * 
 * These constants ensure pixel-perfect alignment between what users see
 * in the preview and the final exported PowerPoint presentation.
 */

// 16:9 Aspect Ratio Dimensions
export const SLIDE_DIMENSIONS = {
  width: 10, // inches
  height: 5.625, // inches (16:9 ratio)
  aspectRatio: 16 / 9
} as const;

// Content positioning constants (in inches)
export const SPACING_CONSTANTS = {
  contentY: 1.6,      // Top margin for main content
  columnWidth: 4.0,   // Width of each column in two-column layouts
  gap: 0.5,           // Gap between columns and elements
  sideMargin: 0.75,   // Left/right margins
  bottomMargin: 0.5   // Bottom margin
} as const;

// Preview dimensions (in pixels, maintaining 16:9 ratio)
export const PREVIEW_DIMENSIONS = {
  width: 640,
  height: 360,
  scale: 0.8 // Scale factor for thumbnails
} as const;

// Layout-specific spacing
export const LAYOUT_SPACING = {
  titleSlide: {
    titleY: 2.0,
    subtitleY: 3.2,
    authorY: 4.8
  },
  contentSlide: {
    titleY: 0.8,
    contentY: SPACING_CONSTANTS.contentY,
    bulletIndent: 0.3,
    bulletSpacing: 0.4
  },
  twoColumn: {
    leftX: SPACING_CONSTANTS.sideMargin,
    rightX: SPACING_CONSTANTS.sideMargin + SPACING_CONSTANTS.columnWidth + SPACING_CONSTANTS.gap,
    columnWidth: SPACING_CONSTANTS.columnWidth
  }
} as const;

// Typography constants
export const TYPOGRAPHY_CONSTANTS = {
  title: {
    fontSize: 32,
    lineHeight: 1.2,
    fontWeight: 700
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 1.4,
    fontWeight: 400
  },
  body: {
    fontSize: 16,
    lineHeight: 1.5,
    fontWeight: 400
  },
  bullet: {
    fontSize: 14,
    lineHeight: 1.6,
    fontWeight: 400
  }
} as const;

// Animation constants for smooth transitions
export const ANIMATION_CONSTANTS = {
  debounceMs: 150,        // Optimized for <200ms updates
  transitionDuration: 200, // CSS transition duration
  staggerDelay: 50        // Stagger delay for list animations
} as const;

// Supported layout types with their display names
export const LAYOUT_TYPES = {
  'title': 'Title Slide',
  'title-bullets': 'Title with Bullets',
  'title-paragraph': 'Title with Paragraph',
  'two-column': 'Two Column',
  'image-right': 'Image Right',
  'image-left': 'Image Left',
  'image-full': 'Full Image',
  'quote': 'Quote',
  'chart': 'Chart',
  'timeline': 'Timeline',
  'process-flow': 'Process Flow',
  'comparison-table': 'Comparison Table',
  'before-after': 'Before & After',
  'problem-solution': 'Problem & Solution',
  'mixed-content': 'Mixed Content'
} as const;

export type LayoutType = keyof typeof LAYOUT_TYPES;

// Progress stages for loading states
export const PROGRESS_STAGES = {
  preparing: {
    label: 'Preparing content...',
    description: 'Analyzing your input and setting up generation',
    progress: 10
  },
  generating: {
    label: 'Generating content...',
    description: 'AI is creating your slide content',
    progress: 30
  },
  refining: {
    label: 'Refining layout...',
    description: 'Optimizing layout and structure',
    progress: 60
  },
  images: {
    label: 'Creating images...',
    description: 'Generating AI images for your slides',
    progress: 80
  },
  building: {
    label: 'Building presentation...',
    description: 'Finalizing your PowerPoint file',
    progress: 95
  },
  complete: {
    label: 'Complete!',
    description: 'Your presentation is ready',
    progress: 100
  }
} as const;

export type ProgressStage = keyof typeof PROGRESS_STAGES;

// Theme categories for organization
export const THEME_CATEGORIES = {
  corporate: 'Corporate',
  creative: 'Creative',
  tech: 'Technology',
  minimal: 'Minimal',
  luxury: 'Luxury',
  startup: 'Startup'
} as const;

// Accessibility constants
export const A11Y_CONSTANTS = {
  focusRingWidth: 2,
  focusRingColor: '#3b82f6',
  minTouchTarget: 44, // pixels
  contrastRatio: 4.5  // WCAG AA standard
} as const;
