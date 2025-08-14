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
 * Application state management interface
 */
export interface AppState {
  /** Current step in the slide generation workflow */
  step: 'input' | 'preview' | 'edit';

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
