/**
 * Core Type Definitions for AI PowerPoint Generator
 *
 * This file contains all TypeScript interfaces and types used throughout the application.
 * These types ensure type safety and consistency between frontend and backend.
 */

/**
 * Progress tracking for multi-step AI generation
 */
export interface GenerationProgress {
  step: 'content' | 'layout' | 'image' | 'refinement' | 'complete';
  stepNumber: number;
  totalSteps: number;
  message: string;
  estimatedTimeRemaining?: number;
}

/**
 * Represents a single slide specification with all its content and styling options
 */
export interface SlideSpec {
  /** Unique identifier for the slide */
  id: string;

  /** The main title of the slide (1-120 characters) */
  title: string;

  /** The layout type that determines how content is arranged on the slide */
  layout: 'title' | 'title-bullets' | 'title-paragraph' | 'two-column' | 'image-right' | 'image-left' | 'quote' | 'chart' | 'timeline' | 'process-flow' | 'comparison-table' | 'before-after' | 'problem-solution' | 'mixed-content';

  /** Bullet points for scannable, list-based content */
  bullets?: string[];

  /** Paragraph text for narrative or explanatory content */
  paragraph?: string;

  /** Left column content for two-column layouts */
  left?: {
    heading?: string;
    bullets?: string[];
    paragraph?: string;
    metrics?: Array<{
      value: string;
      label: string;
      unit?: string;
    }>;
  };

  /** Right column content for two-column layouts */
  right?: {
    heading?: string;
    bullets?: string[];
    paragraph?: string;
    imagePrompt?: string;
    metrics?: Array<{
      value: string;
      label: string;
      unit?: string;
    }>;
  };

  /** Timeline configuration for chronological content */
  timeline?: Array<{
    date: string;
    title: string;
    description?: string;
    milestone?: boolean;
  }>;

  /** Process steps configuration for workflow and procedure layouts */
  processSteps?: Array<{
    title: string;
    description?: string;
  }>;

  /** Chart configuration for data visualization slides */
  chart?: {
    type: 'bar' | 'line' | 'pie';
    title?: string;
    categories: string[];
    series: Array<{
      name: string;
      data: number[];
    }>;
  };

  /** Comparison table configuration for feature/option comparisons */
  comparisonTable?: {
    headers?: string[];
    rows?: string[][];
  };

  /** Design and branding configuration */
  design?: {
    layout?: string;
    layoutName?: string;
    brand?: {
      primary?: string;
      secondary?: string;
      accent?: string;
      fontFamily?: string;
    };
  };

  /** Speaker notes for presentation delivery */
  notes?: string;

  /** Source citations for credibility */
  sources?: string[];

  /** Accessibility features */
  accessibility?: {
    /** Alt text for images */
    imageAltText?: string;
    /** Screen reader description of slide content */
    description?: string;
    /** Chart data description for screen readers */
    chartDescription?: string;
    /** Table summary for screen readers */
    tableSummary?: string;
  };
}

/**
 * Parameters for generating a slide specification
 */
export interface GenerationParams {
  /** The user's input prompt describing what they want in the slide */
  prompt: string;

  /** Target audience for content adaptation */
  audience?: 'general' | 'executives' | 'technical' | 'sales' | 'investors' | 'students';

  /** Tone and style for content generation */
  tone?: 'professional' | 'casual' | 'persuasive' | 'educational' | 'inspiring';

  /** Desired content length and detail level */
  contentLength?: 'brief' | 'moderate' | 'detailed';

  /** Preferred layout type for the slide */
  layout?: 'title' | 'title-bullets' | 'title-paragraph' | 'two-column' | 'image-right' | 'image-left' | 'quote' | 'chart' | 'timeline' | 'process-flow' | 'comparison-table' | 'before-after' | 'problem-solution';

  /** Whether to generate an AI image using DALL-E */
  withImage?: boolean;

  /** Design and layout preferences */
  design?: {
    theme?: string;
    layoutName?: string;
    brand?: {
      primary?: string;
      secondary?: string;
      accent?: string;
      fontFamily?: string;
    };
  };
}

/**
 * Represents a complete presentation with multiple slides
 */
export interface Presentation {
  /** Unique identifier for the presentation */
  id: string;

  /** Presentation title */
  title: string;

  /** Array of slides in order */
  slides: SlideSpec[];

  /** Presentation metadata */
  metadata: {
    /** Creation timestamp */
    createdAt: Date;
    /** Last modified timestamp */
    updatedAt: Date;
    /** Author information */
    author?: string;
    /** Presentation description */
    description?: string;
  };

  /** Global presentation settings */
  settings: {
    /** Default theme for all slides */
    theme?: string;
    /** Global brand settings */
    brand?: {
      primary?: string;
      secondary?: string;
      accent?: string;
      fontFamily?: string;
    };
  };
}

/**
 * Slide drag and drop context
 */
export interface SlideDragContext {
  /** The slide being dragged */
  activeSlide: SlideSpec | null;
  /** Index of the slide being dragged */
  activeIndex: number | null;
  /** Index where the slide will be dropped */
  overIndex: number | null;
}

/**
 * Application state management interface
 */
export interface AppState {
  /** Current step in the slide generation workflow */
  step: 'input' | 'preview' | 'edit' | 'presentation';

  /** Current mode: single slide or multi-slide presentation */
  mode: 'single' | 'presentation';

  /** User input parameters */
  params: GenerationParams;

  /** AI-generated slide draft (single slide mode) */
  draft?: SlideSpec;

  /** User-edited slide specification (single slide mode) */
  editedSpec?: SlideSpec;

  /** Current presentation (multi-slide mode) */
  presentation?: Presentation;

  /** Currently selected slide in presentation mode */
  selectedSlideId?: string;

  /** Loading state indicator */
  loading: boolean;

  /** Error message if any operation fails */
  error?: string;
}

/**
 * Utility functions for slide management
 */

/**
 * Generate a unique ID for a slide
 */
export function generateSlideId(): string {
  return `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new slide with default values
 */
export function createNewSlide(overrides: Partial<SlideSpec> = {}): SlideSpec {
  return {
    id: generateSlideId(),
    title: 'New Slide',
    layout: 'title-bullets',
    bullets: [],
    ...overrides
  };
}

/**
 * Create a new presentation with default values
 */
export function createNewPresentation(title: string = 'New Presentation'): Presentation {
  return {
    id: `presentation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title,
    slides: [createNewSlide({ title: 'Title Slide', layout: 'title' })],
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date()
    },
    settings: {}
  };
}

/**
 * Reorder slides in a presentation
 */
export function reorderSlides(slides: SlideSpec[], fromIndex: number, toIndex: number): SlideSpec[] {
  const result = Array.from(slides);
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}
