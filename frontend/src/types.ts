/**
 * Core Type Definitions for AI PowerPoint Generator
 *
 * This file contains all TypeScript interfaces and types used throughout the application.
 * These types ensure type safety and consistency between frontend and backend.
 */

/**
 * Represents a single slide specification with all its content and styling options
 */
export interface SlideSpec {
  /** The main title of the slide (1-120 characters) */
  title: string;

  /** The layout type that determines how content is arranged on the slide */
  layout: 'title' | 'title-bullets' | 'title-paragraph' | 'two-column' | 'image-right' | 'quote' | 'chart' | 'timeline' | 'process-flow' | 'comparison-table' | 'before-after' | 'problem-solution';

  /** Bullet points for scannable, list-based content */
  bullets?: string[];

  /** Paragraph text for narrative or explanatory content */
  paragraph?: string;

  /** Left column content for two-column layouts */
  left?: {
    heading?: string;
    bullets?: string[];
    paragraph?: string;
  };

  /** Right column content for two-column layouts */
  right?: {
    heading?: string;
    bullets?: string[];
    paragraph?: string;
    imagePrompt?: string;
  };

  /** Timeline configuration for chronological content */
  timeline?: Array<{
    date: string;
    title: string;
    description?: string;
    milestone?: boolean;
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

  /** Design and layout preferences */
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
