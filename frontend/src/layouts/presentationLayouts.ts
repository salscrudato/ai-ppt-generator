/**
 * Optimized Layout System for AI PowerPoint Generator
 *
 * Simplified layout system focusing on AI-driven content optimization.
 * The system uses intelligent layout selection based on content type,
 * eliminating the need for complex manual layout configuration.
 *
 * @version 3.1.0-optimized
 * @author AI PowerPoint Generator Team
 */

/**
 * Simplified presentation layout interface
 * Focuses on essential properties for AI-driven layout selection
 */
export interface PresentationLayout {
  /** Unique layout identifier */
  id: string;

  /** Human-readable layout name */
  name: string;

  /** Brief description of layout purpose */
  description: string;

  /** Layout category (simplified to single category) */
  category: 'adaptive';

  /** Visual preview configuration */
  preview: {
    title: string;
    description: string;
  };

  /** Recommended use cases */
  usage: string[];

  /** Best suited for description */
  bestFor: string;
}

/**
 * Adaptive layout collection - AI-driven layout selection
 *
 * Single, intelligent layout that adapts to any content type through AI optimization.
 * Eliminates the complexity of manual layout selection while ensuring professional results.
 */
export const PRESENTATION_LAYOUTS: PresentationLayout[] = [
  {
    id: 'ai-adaptive',
    name: 'AI-Adaptive Layout',
    description: 'Intelligent layout that automatically optimizes for any content type with professional formatting',
    category: 'adaptive',
    preview: {
      title: 'AI-Adaptive Layout',
      description: 'Automatically optimizes layout based on your content type and audience'
    },
    usage: [
      'All content types and formats',
      'Automatic layout optimization',
      'Professional formatting',
      'Audience-appropriate design',
      'Flexible content arrangement'
    ],
    bestFor: 'Any presentation requiring professional, AI-optimized layout with maximum flexibility'
  }
];

/**
 * Optimized layout utility functions
 * Simplified for single adaptive layout system
 */

/**
 * Get layout by ID with fallback to default
 * @param id - Layout identifier
 * @returns PresentationLayout or undefined if not found
 */
export function getLayoutById(id: string): PresentationLayout | undefined {
  return PRESENTATION_LAYOUTS.find(layout => layout.id === id);
}

/**
 * Get layouts by category (simplified for adaptive category)
 * @param category - Layout category
 * @returns Array of matching layouts
 */
export function getLayoutsByCategory(category: 'adaptive'): PresentationLayout[] {
  return PRESENTATION_LAYOUTS.filter(layout => layout.category === category);
}

/**
 * Get the default adaptive layout
 * @returns Default PresentationLayout
 */
export function getDefaultLayout(): PresentationLayout {
  return PRESENTATION_LAYOUTS[0]; // AI-adaptive as default and primary option
}

/**
 * Recommend optimal layout based on content type
 * Since we use AI-adaptive layout, always returns the intelligent layout
 * @param _contentType - Content type (unused in adaptive system)
 * @returns Recommended PresentationLayout
 */
export function recommendLayout(_contentType: string): PresentationLayout {
  return getDefaultLayout(); // Always use AI-adaptive layout for optimal results
}

/**
 * Convert layout configuration to slide specification
 * Optimized for AI-adaptive layout system
 * @param layout - Presentation layout configuration
 * @param content - Content to be formatted
 * @returns Slide specification object
 */
export function layoutToSlideSpec(layout: PresentationLayout, content: any) {
  return {
    title: content.title || 'Slide Title',
    layout: 'title-paragraph', // Backend layout type for AI processing
    paragraph: content.content || content.paragraph || '',
    bullets: content.bullets || [],
    design: {
      layoutId: layout.id,
      layoutName: layout.name,
      adaptive: true // Flag for AI-adaptive processing
    }
  };
}