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
  layout:
    | 'title'
    | 'title-bullets'
    | 'title-paragraph'
    | 'bullets'
    | 'paragraph'
    | 'two-column'
    | 'image-right'
    | 'image-left'
    | 'image-full'
    | 'chart'
    | 'comparison-table'
    | 'timeline'
    | 'process-flow'
    | 'quote'
    | 'mixed-content'
    | 'problem-solution';

  /** Bullet points for scannable, list-based content */
  bullets?: string[];

  /** Paragraph text for narrative or explanatory content */
  paragraph?: string;





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

  /** Table configuration for structured data */
  table?: {
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

  /** Slide components to include */
  components?: {
    paragraph?: boolean;
    bulletList?: boolean;
    chart?: boolean;
    table?: boolean;
    quote?: boolean;
  };













  /** Design and layout preferences */
  design?: {
    layout?: string;
    theme?: string;
    layoutName?: string;
    brand?: {
      primary?: string;
      secondary?: string;
      accent?: string;
      fontFamily?: string;
      logo?: string;
    };
    customColors?: string[];
  };

  /** Content quality and validation preferences */
  qualityLevel?: 'standard' | 'high' | 'premium';

  /** Whether to include speaker notes */
  includeNotes?: boolean;

  /** Whether to include source citations */
  includeSources?: boolean;
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
  step: 'input' | 'edit';

  /** User input parameters */
  params: GenerationParams;

  /** AI-generated slide draft */
  draft?: SlideSpec;

  /** User-edited slide specification */
  editedSpec?: SlideSpec;

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


