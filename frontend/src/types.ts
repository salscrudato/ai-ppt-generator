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
  layout: 'title' | 'title-bullets' | 'title-paragraph' | 'two-column' | 'image-right' | 'image-left' | 'image-full' | 'quote' | 'chart' | 'timeline' | 'process-flow' | 'comparison-table' | 'before-after' | 'problem-solution' | 'mixed-content' | 'agenda' | 'grid-layout';

  /** Bullet points for scannable, list-based content */
  bullets?: string[];

  /** Paragraph text for narrative or explanatory content */
  paragraph?: string;

  /** Image prompt for AI-generated images */
  imagePrompt?: string;

  /** Whether to generate the image (explicit user request) */
  generateImage?: boolean;

  /** Left column content for two-column layouts */
  left?: {
    heading?: string;
    bullets?: string[];
    paragraph?: string;
    imagePrompt?: string;
    generateImage?: boolean;
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
    generateImage?: boolean;
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

  /** Grid layout configuration for flexible content arrangement */
  gridLayout?: {
    /** Number of columns (1-4) */
    columns: number;
    /** Number of rows (1-3) */
    rows: number;
    /** Content for each grid cell */
    cells: GridCell[];
    /** Whether to show grid borders for visual separation */
    showBorders?: boolean;
    /** Spacing between grid cells */
    cellSpacing?: 'tight' | 'normal' | 'spacious';
  };

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
 * Represents content within a grid cell
 */
export interface GridCell {
  /** Row position (0-based) */
  row: number;
  /** Column position (0-based) */
  column: number;
  /** Cell content type */
  type: 'header' | 'bullets' | 'paragraph' | 'metric' | 'image' | 'chart' | 'empty';
  /** Cell title/header text */
  title?: string;
  /** Bullet points for this cell */
  bullets?: string[];
  /** Paragraph content for this cell */
  paragraph?: string;
  /** Metric value and label */
  metric?: {
    value: string;
    label: string;
    trend?: 'up' | 'down' | 'neutral';
  };
  /** Image configuration */
  image?: {
    src?: string;
    alt?: string;
    prompt?: string;
  };
  /** Chart configuration */
  chart?: {
    type: 'bar' | 'line' | 'pie' | 'donut';
    data: any[];
    title?: string;
  };
  /** Cell styling options */
  styling?: {
    backgroundColor?: string;
    textColor?: string;
    emphasis?: 'normal' | 'bold' | 'highlight';
    alignment?: 'left' | 'center' | 'right';
  };
}

/**
 * Parameters for generating a slide specification
 */
export interface GenerationParams {
  /** The user's input prompt describing what they want in the slide */
  prompt: string;

  /** Target audience for content adaptation */
  audience?: 'general' | 'executives' | 'technical' | 'sales' | 'investors' | 'students' | 'healthcare' | 'education' | 'marketing' | 'finance' | 'startup' | 'government';

  /** Tone and style for content generation */
  tone?: 'professional' | 'casual' | 'persuasive' | 'educational' | 'inspiring' | 'authoritative' | 'friendly' | 'urgent' | 'confident' | 'analytical';

  /** Desired content length and detail level */
  contentLength?: 'minimal' | 'brief' | 'moderate' | 'detailed' | 'comprehensive';

  /** Grid layout preferences for content organization */
  gridPreferences?: {
    /** Preferred number of columns (1-4) */
    columns?: number;
    /** Preferred number of rows (1-3) */
    rows?: number;
    /** Whether to allow auto-formatting within grid cells */
    autoFormat?: boolean;
    /** Preferred cell spacing */
    cellSpacing?: 'tight' | 'normal' | 'spacious';
  };

  /** Presentation type for context-aware generation */
  presentationType?: 'general' | 'pitch' | 'report' | 'training' | 'proposal' | 'update' | 'analysis' | 'comparison' | 'timeline' | 'process' | 'strategy';

  /** Industry context for specialized content */
  industry?: 'general' | 'technology' | 'healthcare' | 'finance' | 'education' | 'retail' | 'manufacturing' | 'consulting' | 'nonprofit' | 'government' | 'startup';

  /** Preferred layout type for the slide */
  layout?: 'title' | 'title-bullets' | 'title-paragraph' | 'two-column' | 'image-right' | 'image-left' | 'quote' | 'chart' | 'timeline' | 'process-flow' | 'comparison-table' | 'before-after' | 'problem-solution';

  /** Whether to generate an AI image using DALL-E */
  withImage?: boolean;

  /** Image style for AI generation */
  imageStyle?: 'realistic' | 'illustration' | 'abstract' | 'professional' | 'minimal';

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


