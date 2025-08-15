/**
 * Slide Master System for Professional PowerPoint Generation
 * 
 * Implements slide masters using PptxGenJS defineSlideMaster() for consistent
 * branding, layouts, and professional presentation quality.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import pptxgen from 'pptxgenjs';
import { ProfessionalTheme } from '../professionalThemes';
import { ModernTheme } from './theme/modernThemes';
import { safeColorFormat } from './theme/utilities';

/**
 * Helper functions for theme compatibility
 */
function getHeadingFont(theme: ProfessionalTheme | ModernTheme): string {
  const isModern = 'palette' in theme;
  return isModern
    ? (theme as ModernTheme).typography.fontFamilies.heading
    : (theme as ProfessionalTheme).typography.headings.fontFamily;
}

function getBodyFont(theme: ProfessionalTheme | ModernTheme): string {
  const isModern = 'palette' in theme;
  return isModern
    ? (theme as ModernTheme).typography.fontFamilies.body
    : (theme as ProfessionalTheme).typography.body.fontFamily;
}

/**
 * Slide master names for consistent referencing
 */
export const SLIDE_MASTER_NAMES = {
  TITLE: 'MASTER_TITLE',
  CONTENT: 'MASTER_CONTENT',
  TWO_COLUMN: 'MASTER_TWO_COLUMN',
  IMAGE_FOCUS: 'MASTER_IMAGE_FOCUS',
  IMAGE_RIGHT: 'MASTER_IMAGE_RIGHT',
  IMAGE_LEFT: 'MASTER_IMAGE_LEFT',
  SECTION: 'MASTER_SECTION',
  CLOSING: 'MASTER_CLOSING',
  QUOTE: 'MASTER_QUOTE',
  METRICS: 'MASTER_METRICS'
} as const;

export type SlideMasterName = typeof SLIDE_MASTER_NAMES[keyof typeof SLIDE_MASTER_NAMES];

/**
 * Configuration for slide master creation
 */
export interface SlideMasterConfig {
  theme: ProfessionalTheme | ModernTheme;
  includeSlideNumbers?: boolean;
  includeFooter?: boolean;
  footerText?: string;
  logoPath?: string;
  companyName?: string;
  brandColor?: string;
  includeWatermark?: boolean;
  watermarkText?: string;
  includeAccentElements?: boolean;
}

/**
 * Define all slide masters for a presentation
 */
export function defineSlideMasters(
  pres: pptxgen, 
  config: SlideMasterConfig
): void {
  const theme = config.theme;
  const isModern = 'palette' in theme;
  
  // Standard 16:9 dimensions
  const SLIDE_WIDTH = 10.0;
  const SLIDE_HEIGHT = 5.625;
  
  // Define Title Slide Master
  defineTitleMaster(pres, theme, config, SLIDE_WIDTH, SLIDE_HEIGHT);
  
  // Define Content Slide Master
  defineContentMaster(pres, theme, config, SLIDE_WIDTH, SLIDE_HEIGHT);
  
  // Define Two-Column Master
  defineTwoColumnMaster(pres, theme, config, SLIDE_WIDTH, SLIDE_HEIGHT);
  
  // Define Image Focus Master
  defineImageFocusMaster(pres, theme, config, SLIDE_WIDTH, SLIDE_HEIGHT);

  // Define Image Right Master
  defineImageRightMaster(pres, theme, config, SLIDE_WIDTH, SLIDE_HEIGHT);

  // Define Image Left Master
  defineImageLeftMaster(pres, theme, config, SLIDE_WIDTH, SLIDE_HEIGHT);

  // Define Quote Master
  defineQuoteMaster(pres, theme, config, SLIDE_WIDTH, SLIDE_HEIGHT);

  // Define Metrics Master
  defineMetricsMaster(pres, theme, config, SLIDE_WIDTH, SLIDE_HEIGHT);

  // Define Section Divider Master
  defineSectionMaster(pres, theme, config, SLIDE_WIDTH, SLIDE_HEIGHT);

  // Define Closing Slide Master
  defineClosingMaster(pres, theme, config, SLIDE_WIDTH, SLIDE_HEIGHT);
}

/**
 * Define title slide master with hero styling
 */
function defineTitleMaster(
  pres: pptxgen,
  theme: ProfessionalTheme | ModernTheme,
  config: SlideMasterConfig,
  width: number,
  height: number
): void {
  const isModern = 'palette' in theme;
  const bgColor = isModern 
    ? (theme as ModernTheme).palette.background 
    : (theme as ProfessionalTheme).colors.background;
  
  const primaryColor = isModern
    ? (theme as ModernTheme).palette.primary
    : (theme as ProfessionalTheme).colors.primary;

  pres.defineSlideMaster({
    title: SLIDE_MASTER_NAMES.TITLE,
    background: { color: safeColorFormat(bgColor) },
    objects: [
      // Background accent (modern themes)
      ...(isModern ? [{
        rect: {
          x: 0, y: 0, w: width, h: height * 0.3,
          fill: {
            color: safeColorFormat(primaryColor),
            transparency: 85
          }
        }
      }] : []),
      
      // Title placeholder
      {
        placeholder: {
          options: {
            name: 'title',
            type: 'title',
            x: 1.0, y: 1.8, w: 8.0, h: 1.2,
            fontSize: isModern ? 44 : 36,
            bold: true,
            color: safeColorFormat(primaryColor),
            align: 'center' as any as any,
            fontFace: getHeadingFont(theme)
          }
        }
      },
      
      // Subtitle placeholder
      {
        placeholder: {
          options: {
            name: 'subtitle',
            type: 'body',
            x: 1.5, y: 3.2, w: 7.0, h: 0.8,
            fontSize: isModern ? 20 : 18,
            color: safeColorFormat(isModern 
              ? (theme as ModernTheme).palette.text.secondary
              : (theme as ProfessionalTheme).colors.text.secondary),
            align: 'center' as any,
            fontFace: getBodyFont(theme)
          }
        }
      },
      
      // Company/Author info (bottom) - NO slide number on title slides
      ...(config.companyName ? [{
        text: {
          text: config.companyName,
          options: {
            x: 0.5, y: height - 0.6, w: width - 1.0, h: 0.4,
            fontSize: 14,
            color: safeColorFormat(isModern
              ? (theme as ModernTheme).palette.text.muted
              : (theme as ProfessionalTheme).colors.text.secondary),
            align: 'center' as any,
            fontFace: getBodyFont(theme)
          }
        }
      }] : [])

      // Note: Title slides intentionally exclude slide numbers for professional appearance
    ]
  });
}

/**
 * Define content slide master with consistent layout
 */
function defineContentMaster(
  pres: pptxgen,
  theme: ProfessionalTheme | ModernTheme,
  config: SlideMasterConfig,
  width: number,
  height: number
): void {
  const isModern = 'palette' in theme;
  const bgColor = isModern 
    ? (theme as ModernTheme).palette.background 
    : (theme as ProfessionalTheme).colors.background;
  
  const primaryColor = isModern
    ? (theme as ModernTheme).palette.primary
    : (theme as ProfessionalTheme).colors.primary;

  const accentColor = isModern
    ? (theme as ModernTheme).palette.accent
    : (theme as ProfessionalTheme).colors.accent;

  pres.defineSlideMaster({
    title: SLIDE_MASTER_NAMES.CONTENT,
    background: { color: safeColorFormat(bgColor) },
    objects: [
      // Subtle background pattern for visual interest
      ...(config.includeAccentElements !== false ? [{
        rect: {
          x: 0, y: 0, w: width, h: 0.1,
          fill: {
            color: safeColorFormat(accentColor),
            transparency: 90
          }
        }
      }] : []),

      // Header accent line with enhanced styling
      {
        line: {
          x: 0.75, y: 1.3, w: 8.5, h: 0,
          line: {
            color: safeColorFormat(accentColor),
            width: 3,
            transparency: 20
          }
        }
      },

      // Subtle corner accent element
      ...(config.includeAccentElements !== false ? [{
        rect: {
          x: 0, y: 0, w: 0.2, h: height,
          fill: {
            color: safeColorFormat(accentColor),
            transparency: 95
          }
        }
      }] : []),
      
      // Title placeholder
      {
        placeholder: {
          options: {
            name: 'title',
            type: 'title',
            x: 0.75, y: 0.4, w: 8.5, h: 0.8,
            fontSize: isModern ? 32 : 28,
            bold: true,
            color: safeColorFormat(primaryColor),
            align: 'left' as any,
            fontFace: getHeadingFont(theme)
          }
        }
      },
      
      // Content area placeholder
      {
        placeholder: {
          options: {
            name: 'body',
            type: 'body',
            x: 0.75, y: 1.5, w: 8.5, h: 3.5,
            fontSize: isModern ? 18 : 16,
            color: safeColorFormat(isModern 
              ? (theme as ModernTheme).palette.text.primary
              : (theme as ProfessionalTheme).colors.text.primary),
            fontFace: getBodyFont(theme)
          }
        }
      },
      
      // Slide number (if enabled)
      ...(config.includeSlideNumbers ? [{
        text: {
          text: '<%slideNumber%>',
          options: {
            x: width - 1.0, y: height - 0.4, w: 0.8, h: 0.3,
            fontSize: 12,
            color: safeColorFormat(isModern 
              ? (theme as ModernTheme).palette.text.muted
              : (theme as ProfessionalTheme).colors.text.secondary),
            align: 'right' as any as any,
            fontFace: getBodyFont(theme)
          }
        }
      }] : []),
      
      // Footer (if enabled)
      ...(config.includeFooter && config.footerText ? [{
        text: {
          text: config.footerText,
          options: {
            x: 0.5, y: height - 0.4, w: width - 2.0, h: 0.3,
            fontSize: 10,
            color: safeColorFormat(isModern
              ? (theme as ModernTheme).palette.text.muted
              : (theme as ProfessionalTheme).colors.text.secondary),
            align: 'left' as any,
            fontFace: getBodyFont(theme)
          }
        }
      }] : []),

      // Watermark (if enabled)
      ...(config.includeWatermark && config.watermarkText ? [{
        text: {
          text: config.watermarkText,
          options: {
            x: width - 3.0, y: height - 1.5, w: 2.5, h: 1.0,
            fontSize: 8,
            color: safeColorFormat(isModern
              ? (theme as ModernTheme).palette.text.muted
              : (theme as ProfessionalTheme).colors.text.secondary),
            align: 'center' as any,
            valign: 'middle' as any,
            rotate: -45,
            transparency: 80,
            fontFace: isModern
              ? (theme as ModernTheme).typography.fontFamilies.body
              : getBodyFont(theme)
          }
        }
      }] : [])
    ]
  });
}

/**
 * Add a slide using the specified master
 */
export function addSlideWithMaster(
  pres: pptxgen,
  masterName: SlideMasterName
): pptxgen.Slide {
  return pres.addSlide({ masterName });
}

/**
 * Define two-column slide master
 */
function defineTwoColumnMaster(
  pres: pptxgen,
  theme: ProfessionalTheme | ModernTheme,
  config: SlideMasterConfig,
  width: number,
  height: number
): void {
  const isModern = 'palette' in theme;
  const bgColor = isModern
    ? (theme as ModernTheme).palette.background
    : (theme as ProfessionalTheme).colors.background;

  const primaryColor = isModern
    ? (theme as ModernTheme).palette.primary
    : (theme as ProfessionalTheme).colors.primary;

  const accentColor = isModern
    ? (theme as ModernTheme).palette.accent
    : (theme as ProfessionalTheme).colors.accent;

  pres.defineSlideMaster({
    title: SLIDE_MASTER_NAMES.TWO_COLUMN,
    background: { color: safeColorFormat(bgColor) },
    objects: [
      // Header accent line
      {
        line: {
          x: 0.75, y: 1.3, w: 8.5, h: 0,
          line: {
            color: safeColorFormat(accentColor),
            width: 2,
            transparency: 30
          }
        }
      },

      // Title placeholder
      {
        placeholder: {
          options: {
            name: 'title',
            type: 'title',
            x: 0.75, y: 0.4, w: 8.5, h: 0.8,
            fontSize: isModern ? 32 : 28,
            bold: true,
            color: safeColorFormat(primaryColor),
            align: 'left' as any,
            fontFace: isModern
              ? (theme as ModernTheme).typography.fontFamilies.heading
              : getHeadingFont(theme)
          }
        }
      },

      // Left column placeholder
      {
        placeholder: {
          options: {
            name: 'leftColumn',
            type: 'body',
            x: 0.75, y: 1.5, w: 4.0, h: 3.5,
            fontSize: isModern ? 18 : 16,
            color: safeColorFormat(isModern
              ? (theme as ModernTheme).palette.text.primary
              : (theme as ProfessionalTheme).colors.text.primary),
            fontFace: isModern
              ? (theme as ModernTheme).typography.fontFamilies.body
              : getBodyFont(theme)
          }
        }
      },

      // Right column placeholder
      {
        placeholder: {
          options: {
            name: 'rightColumn',
            type: 'body',
            x: 5.25, y: 1.5, w: 4.0, h: 3.5,
            fontSize: isModern ? 18 : 16,
            color: safeColorFormat(isModern
              ? (theme as ModernTheme).palette.text.primary
              : (theme as ProfessionalTheme).colors.text.primary),
            fontFace: isModern
              ? (theme as ModernTheme).typography.fontFamilies.body
              : getBodyFont(theme)
          }
        }
      },

      // Slide number (if enabled)
      ...(config.includeSlideNumbers ? [{
        text: {
          text: '<%slideNumber%>',
          options: {
            x: width - 1.0, y: height - 0.4, w: 0.8, h: 0.3,
            fontSize: 12,
            color: safeColorFormat(isModern
              ? (theme as ModernTheme).palette.text.muted
              : (theme as ProfessionalTheme).colors.text.secondary),
            align: 'right' as any
          }
        }
      }] : [])
    ]
  });
}

/**
 * Define image focus slide master
 */
function defineImageFocusMaster(
  pres: pptxgen,
  theme: ProfessionalTheme | ModernTheme,
  config: SlideMasterConfig,
  width: number,
  height: number
): void {
  const isModern = 'palette' in theme;
  const bgColor = isModern
    ? (theme as ModernTheme).palette.background
    : (theme as ProfessionalTheme).colors.background;

  const primaryColor = isModern
    ? (theme as ModernTheme).palette.primary
    : (theme as ProfessionalTheme).colors.primary;

  pres.defineSlideMaster({
    title: SLIDE_MASTER_NAMES.IMAGE_FOCUS,
    background: { color: safeColorFormat(bgColor) },
    objects: [
      // Title placeholder (smaller for image focus)
      {
        placeholder: {
          options: {
            name: 'title',
            type: 'title',
            x: 0.75, y: 0.3, w: 8.5, h: 0.6,
            fontSize: isModern ? 28 : 24,
            bold: true,
            color: safeColorFormat(primaryColor),
            align: 'center' as any,
            fontFace: isModern
              ? (theme as ModernTheme).typography.fontFamilies.heading
              : getHeadingFont(theme)
          }
        }
      },

      // Large image area placeholder with professional positioning
      {
        placeholder: {
          options: {
            name: 'image',
            type: 'pic',
            x: 1.0, y: 1.2, w: 8.0, h: 3.2
          }
        }
      },

      // Caption area
      {
        placeholder: {
          options: {
            name: 'caption',
            type: 'body',
            x: 1.5, y: 4.8, w: 7.0, h: 0.5,
            fontSize: 14,
            color: safeColorFormat(isModern
              ? (theme as ModernTheme).palette.text.secondary
              : (theme as ProfessionalTheme).colors.text.secondary),
            align: 'center' as any,
            italic: true,
            fontFace: isModern
              ? (theme as ModernTheme).typography.fontFamilies.body
              : getBodyFont(theme)
          }
        }
      },

      // Slide number (if enabled)
      ...(config.includeSlideNumbers ? [{
        text: {
          text: '<%slideNumber%>',
          options: {
            x: width - 1.0, y: height - 0.4, w: 0.8, h: 0.3,
            fontSize: 12,
            color: safeColorFormat(isModern
              ? (theme as ModernTheme).palette.text.muted
              : (theme as ProfessionalTheme).colors.text.secondary),
            align: 'right' as any
          }
        }
      }] : [])
    ]
  });
}

/**
 * Define section divider slide master
 */
function defineSectionMaster(
  pres: pptxgen,
  theme: ProfessionalTheme | ModernTheme,
  config: SlideMasterConfig,
  width: number,
  height: number
): void {
  const isModern = 'palette' in theme;
  const bgColor = isModern
    ? (theme as ModernTheme).palette.background
    : (theme as ProfessionalTheme).colors.background;

  const primaryColor = isModern
    ? (theme as ModernTheme).palette.primary
    : (theme as ProfessionalTheme).colors.primary;

  const accentColor = isModern
    ? (theme as ModernTheme).palette.accent
    : (theme as ProfessionalTheme).colors.accent;

  pres.defineSlideMaster({
    title: SLIDE_MASTER_NAMES.SECTION,
    background: { color: safeColorFormat(bgColor) },
    objects: [
      // Large accent background
      {
        rect: {
          x: 0, y: 0, w: width, h: height,
          fill: {
            color: safeColorFormat(primaryColor),
            transparency: 90
          }
        }
      },

      // Section title placeholder
      {
        placeholder: {
          options: {
            name: 'title',
            type: 'title',
            x: 1.0, y: 2.0, w: 8.0, h: 1.5,
            fontSize: isModern ? 48 : 40,
            bold: true,
            color: safeColorFormat(primaryColor),
            align: 'center' as any,
            fontFace: isModern
              ? (theme as ModernTheme).typography.fontFamilies.heading
              : getHeadingFont(theme)
          }
        }
      }
    ]
  });
}

/**
 * Define closing slide master
 */
function defineClosingMaster(
  pres: pptxgen,
  theme: ProfessionalTheme | ModernTheme,
  config: SlideMasterConfig,
  width: number,
  height: number
): void {
  const isModern = 'palette' in theme;
  const bgColor = isModern
    ? (theme as ModernTheme).palette.background
    : (theme as ProfessionalTheme).colors.background;

  const primaryColor = isModern
    ? (theme as ModernTheme).palette.primary
    : (theme as ProfessionalTheme).colors.primary;

  pres.defineSlideMaster({
    title: SLIDE_MASTER_NAMES.CLOSING,
    background: { color: safeColorFormat(bgColor) },
    objects: [
      // Main message placeholder
      {
        placeholder: {
          options: {
            name: 'title',
            type: 'title',
            x: 1.0, y: 1.5, w: 8.0, h: 1.2,
            fontSize: isModern ? 40 : 32,
            bold: true,
            color: safeColorFormat(primaryColor),
            align: 'center' as any,
            fontFace: isModern
              ? (theme as ModernTheme).typography.fontFamilies.heading
              : getHeadingFont(theme)
          }
        }
      },

      // Contact info placeholder
      {
        placeholder: {
          options: {
            name: 'contact',
            type: 'body',
            x: 2.0, y: 3.2, w: 6.0, h: 1.5,
            fontSize: isModern ? 18 : 16,
            color: safeColorFormat(isModern
              ? (theme as ModernTheme).palette.text.primary
              : (theme as ProfessionalTheme).colors.text.primary),
            align: 'center' as any,
            fontFace: isModern
              ? (theme as ModernTheme).typography.fontFamilies.body
              : getBodyFont(theme)
          }
        }
      }
    ]
  });
}

/**
 * Define image-right slide master (text left, image right)
 */
function defineImageRightMaster(
  pres: pptxgen,
  theme: ProfessionalTheme | ModernTheme,
  config: SlideMasterConfig,
  width: number,
  height: number
): void {
  const isModern = 'palette' in theme;
  const bgColor = isModern
    ? (theme as ModernTheme).palette.background
    : (theme as ProfessionalTheme).colors.background;

  const primaryColor = isModern
    ? (theme as ModernTheme).palette.primary
    : (theme as ProfessionalTheme).colors.primary;

  const accentColor = isModern
    ? (theme as ModernTheme).palette.accent
    : (theme as ProfessionalTheme).colors.accent;

  pres.defineSlideMaster({
    title: SLIDE_MASTER_NAMES.IMAGE_RIGHT,
    background: { color: safeColorFormat(bgColor) },
    objects: [
      // Header accent line
      {
        line: {
          x: 0.75, y: 1.3, w: 8.5, h: 0,
          line: {
            color: safeColorFormat(accentColor),
            width: 2,
            transparency: 30
          }
        }
      },

      // Title placeholder
      {
        placeholder: {
          options: {
            name: 'title',
            type: 'title',
            x: 0.75, y: 0.4, w: 8.5, h: 0.8,
            fontSize: isModern ? 32 : 28,
            bold: true,
            color: safeColorFormat(primaryColor),
            align: 'left' as any,
            fontFace: isModern
              ? (theme as ModernTheme).typography.fontFamilies.heading
              : getHeadingFont(theme)
          }
        }
      },

      // Text content (left side)
      {
        placeholder: {
          options: {
            name: 'textContent',
            type: 'body',
            x: 0.75, y: 1.5, w: 4.5, h: 3.5,
            fontSize: isModern ? 18 : 16,
            color: safeColorFormat(isModern
              ? (theme as ModernTheme).palette.text.primary
              : (theme as ProfessionalTheme).colors.text.primary),
            fontFace: isModern
              ? (theme as ModernTheme).typography.fontFamilies.body
              : getBodyFont(theme)
          }
        }
      },

      // Image placeholder (right side)
      {
        placeholder: {
          options: {
            name: 'image',
            type: 'pic',
            x: 5.5, y: 1.5, w: 3.75, h: 3.5
          }
        }
      },

      // Slide number (if enabled)
      ...(config.includeSlideNumbers ? [{
        text: {
          text: '<%slideNumber%>',
          options: {
            x: width - 1.0, y: height - 0.4, w: 0.8, h: 0.3,
            fontSize: 12,
            color: safeColorFormat(isModern
              ? (theme as ModernTheme).palette.text.muted
              : (theme as ProfessionalTheme).colors.text.secondary),
            align: 'right' as any
          }
        }
      }] : [])
    ]
  });
}

/**
 * Define image-left slide master (image left, text right)
 */
function defineImageLeftMaster(
  pres: pptxgen,
  theme: ProfessionalTheme | ModernTheme,
  config: SlideMasterConfig,
  width: number,
  height: number
): void {
  const isModern = 'palette' in theme;
  const bgColor = isModern
    ? (theme as ModernTheme).palette.background
    : (theme as ProfessionalTheme).colors.background;

  const primaryColor = isModern
    ? (theme as ModernTheme).palette.primary
    : (theme as ProfessionalTheme).colors.primary;

  const accentColor = isModern
    ? (theme as ModernTheme).palette.accent
    : (theme as ProfessionalTheme).colors.accent;

  pres.defineSlideMaster({
    title: SLIDE_MASTER_NAMES.IMAGE_LEFT,
    background: { color: safeColorFormat(bgColor) },
    objects: [
      // Header accent line
      {
        line: {
          x: 0.75, y: 1.3, w: 8.5, h: 0,
          line: {
            color: safeColorFormat(accentColor),
            width: 2,
            transparency: 30
          }
        }
      },

      // Title placeholder
      {
        placeholder: {
          options: {
            name: 'title',
            type: 'title',
            x: 0.75, y: 0.4, w: 8.5, h: 0.8,
            fontSize: isModern ? 32 : 28,
            bold: true,
            color: safeColorFormat(primaryColor),
            align: 'left' as any,
            fontFace: isModern
              ? (theme as ModernTheme).typography.fontFamilies.heading
              : getHeadingFont(theme)
          }
        }
      },

      // Image placeholder (left side)
      {
        placeholder: {
          options: {
            name: 'image',
            type: 'pic',
            x: 0.75, y: 1.5, w: 3.75, h: 3.5
          }
        }
      },

      // Text content (right side)
      {
        placeholder: {
          options: {
            name: 'textContent',
            type: 'body',
            x: 4.75, y: 1.5, w: 4.5, h: 3.5,
            fontSize: isModern ? 18 : 16,
            color: safeColorFormat(isModern
              ? (theme as ModernTheme).palette.text.primary
              : (theme as ProfessionalTheme).colors.text.primary),
            fontFace: isModern
              ? (theme as ModernTheme).typography.fontFamilies.body
              : getBodyFont(theme)
          }
        }
      },

      // Slide number (if enabled)
      ...(config.includeSlideNumbers ? [{
        text: {
          text: '<%slideNumber%>',
          options: {
            x: width - 1.0, y: height - 0.4, w: 0.8, h: 0.3,
            fontSize: 12,
            color: safeColorFormat(isModern
              ? (theme as ModernTheme).palette.text.muted
              : (theme as ProfessionalTheme).colors.text.secondary),
            align: 'right' as any
          }
        }
      }] : [])
    ]
  });
}

/**
 * Define quote slide master for testimonials and quotes
 */
function defineQuoteMaster(
  pres: pptxgen,
  theme: ProfessionalTheme | ModernTheme,
  config: SlideMasterConfig,
  width: number,
  height: number
): void {
  const isModern = 'palette' in theme;
  const bgColor = isModern
    ? (theme as ModernTheme).palette.background
    : (theme as ProfessionalTheme).colors.background;

  const primaryColor = isModern
    ? (theme as ModernTheme).palette.primary
    : (theme as ProfessionalTheme).colors.primary;

  const accentColor = isModern
    ? (theme as ModernTheme).palette.accent
    : (theme as ProfessionalTheme).colors.accent;

  pres.defineSlideMaster({
    title: SLIDE_MASTER_NAMES.QUOTE,
    background: { color: safeColorFormat(bgColor) },
    objects: [
      // Large quote background
      {
        rect: {
          x: 1.0, y: 1.5, w: 8.0, h: 3.0,
          fill: {
            color: safeColorFormat(accentColor),
            transparency: 95
          },
          line: {
            color: safeColorFormat(accentColor),
            width: 3
          },
          rectRadius: 0.2
        }
      },

      // Quote text placeholder
      {
        placeholder: {
          options: {
            name: 'quote',
            type: 'body',
            x: 1.5, y: 2.0, w: 7.0, h: 2.0,
            fontSize: isModern ? 24 : 20,
            color: safeColorFormat(primaryColor),
            align: 'center' as any,
            italic: true,
            fontFace: isModern
              ? (theme as ModernTheme).typography.fontFamilies.body
              : getBodyFont(theme)
          }
        }
      },

      // Attribution placeholder
      {
        placeholder: {
          options: {
            name: 'attribution',
            type: 'body',
            x: 2.0, y: 4.2, w: 6.0, h: 0.6,
            fontSize: isModern ? 16 : 14,
            color: safeColorFormat(isModern
              ? (theme as ModernTheme).palette.text.secondary
              : (theme as ProfessionalTheme).colors.text.secondary),
            align: 'center' as any,
            fontFace: isModern
              ? (theme as ModernTheme).typography.fontFamilies.body
              : getBodyFont(theme)
          }
        }
      },

      // Slide number (if enabled)
      ...(config.includeSlideNumbers ? [{
        text: {
          text: '<%slideNumber%>',
          options: {
            x: width - 1.0, y: height - 0.4, w: 0.8, h: 0.3,
            fontSize: 12,
            color: safeColorFormat(isModern
              ? (theme as ModernTheme).palette.text.muted
              : (theme as ProfessionalTheme).colors.text.secondary),
            align: 'right' as any
          }
        }
      }] : [])
    ]
  });
}

/**
 * Define metrics dashboard slide master
 */
function defineMetricsMaster(
  pres: pptxgen,
  theme: ProfessionalTheme | ModernTheme,
  config: SlideMasterConfig,
  width: number,
  height: number
): void {
  const isModern = 'palette' in theme;
  const bgColor = isModern
    ? (theme as ModernTheme).palette.background
    : (theme as ProfessionalTheme).colors.background;

  const primaryColor = isModern
    ? (theme as ModernTheme).palette.primary
    : (theme as ProfessionalTheme).colors.primary;

  const accentColor = isModern
    ? (theme as ModernTheme).palette.accent
    : (theme as ProfessionalTheme).colors.accent;

  pres.defineSlideMaster({
    title: SLIDE_MASTER_NAMES.METRICS,
    background: { color: safeColorFormat(bgColor) },
    objects: [
      // Title placeholder
      {
        placeholder: {
          options: {
            name: 'title',
            type: 'title',
            x: 0.75, y: 0.4, w: 8.5, h: 0.8,
            fontSize: isModern ? 32 : 28,
            bold: true,
            color: safeColorFormat(primaryColor),
            align: 'center' as any,
            fontFace: isModern
              ? (theme as ModernTheme).typography.fontFamilies.heading
              : getHeadingFont(theme)
          }
        }
      },

      // Metrics grid area placeholder
      {
        placeholder: {
          options: {
            name: 'metrics',
            type: 'body',
            x: 0.75, y: 1.5, w: 8.5, h: 3.5,
            fontSize: isModern ? 18 : 16,
            color: safeColorFormat(isModern
              ? (theme as ModernTheme).palette.text.primary
              : (theme as ProfessionalTheme).colors.text.primary),
            align: 'center' as any,
            fontFace: isModern
              ? (theme as ModernTheme).typography.fontFamilies.body
              : getBodyFont(theme)
          }
        }
      },

      // Slide number (if enabled)
      ...(config.includeSlideNumbers ? [{
        text: {
          text: '<%slideNumber%>',
          options: {
            x: width - 1.0, y: height - 0.4, w: 0.8, h: 0.3,
            fontSize: 12,
            color: safeColorFormat(isModern
              ? (theme as ModernTheme).palette.text.muted
              : (theme as ProfessionalTheme).colors.text.secondary),
            align: 'right' as any
          }
        }
      }] : [])
    ]
  });
}

/**
 * Get appropriate master name based on slide layout
 */
export function getMasterForLayout(layout: string): SlideMasterName {
  switch (layout) {
    case 'title':
    case 'hero':
      return SLIDE_MASTER_NAMES.TITLE;
    case 'two-column':
      return SLIDE_MASTER_NAMES.TWO_COLUMN;
    case 'image-right':
      return SLIDE_MASTER_NAMES.IMAGE_RIGHT;
    case 'image-left':
      return SLIDE_MASTER_NAMES.IMAGE_LEFT;
    case 'image-full':
      return SLIDE_MASTER_NAMES.IMAGE_FOCUS;
    case 'quote':
      return SLIDE_MASTER_NAMES.QUOTE;
    case 'metrics-dashboard':
      return SLIDE_MASTER_NAMES.METRICS;
    case 'section-divider':
      return SLIDE_MASTER_NAMES.SECTION;
    case 'thank-you':
    case 'contact-info':
      return SLIDE_MASTER_NAMES.CLOSING;
    default:
      return SLIDE_MASTER_NAMES.CONTENT;
  }
}
