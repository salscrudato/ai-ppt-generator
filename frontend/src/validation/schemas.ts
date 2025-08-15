/**
 * Client-side Validation Schemas
 *
 * Re-exports from clientSchema.ts for backward compatibility
 * and provides additional validation utilities.
 *
 * @version 2.0.0
 * @author AI PowerPoint Generator Team
 */

export * from './clientSchema';

// Re-export with different names for backward compatibility
export {
  ClientGenerationParamsSchema as GenerationParamsSchema,
  type ClientGenerationParams as GenerationParams,
  AUDIENCE_OPTIONS as AUDIENCE_TYPES,
  TONE_OPTIONS as TONE_TYPES,
  CONTENT_LENGTH_OPTIONS as CONTENT_LENGTH_TYPES,
  PRESENTATION_TYPE_OPTIONS as PRESENTATION_TYPES,
  INDUSTRY_OPTIONS as INDUSTRY_TYPES,
  IMAGE_STYLE_OPTIONS as IMAGE_STYLE_TYPES,
  QUALITY_LEVEL_OPTIONS as QUALITY_LEVEL_TYPES
} from './clientSchema';

// Additional validation constants for backward compatibility
export const VALIDATION_CONSTANTS = {
  PROMPT_MIN_LENGTH: 10,
  PROMPT_MAX_LENGTH: 2000,
  TITLE_MAX_LENGTH: 120,
  SHORT_TEXT_MAX_LENGTH: 160,
  LONG_TEXT_MAX_LENGTH: 1200,
  IMAGE_PROMPT_MIN_LENGTH: 20,
  IMAGE_PROMPT_MAX_LENGTH: 500,
} as const;
