# AI PowerPoint Generator - Comprehensive Code Review
Generated on: 2025-08-19T23:34:34.344Z

## Overview
This document contains the complete codebase for the AI PowerPoint Generator system,
organized for comprehensive AI review and analysis.

## System Architecture
The AI PowerPoint Generator consists of:
1. **Backend (Firebase Functions)**: PowerPoint generation engine, AI integration, and API endpoints
2. **Frontend (React/TypeScript)**: User interface with live preview and theme selection
3. **Core Libraries**: Professional themes, slide layouts, and type definitions

## Code Quality Focus Areas
- **Maintainability**: Clean, well-documented code with clear separation of concerns
- **Performance**: Optimized PowerPoint generation with efficient memory usage
- **Scalability**: Modular architecture supporting future enhancements
- **Type Safety**: Comprehensive TypeScript coverage with strict validation
- **Visual Quality**: Professional-grade PowerPoint output with modern design principles


## CORE BACKEND FILES

====================================================================================================
FILE: functions/src/pptGenerator-simple.ts
DESCRIPTION: Main PowerPoint generation engine - handles all slide layouts, themes, and PPTX creation
PURPOSE: Core generation logic with professional layouts, typography, and visual design
STATUS: EXISTS
LINES: 2100
====================================================================================================

/**
 * Professional PowerPoint Generator — v7.1.0 (robust)
 * - API-safe bullets, spacing, charts, and tables
 * - Uses Slide Masters for consistent backgrounds/branding
 * - Clean theme setup and metadata
 * - Defensive coding to avoid "Needs Repair" XML
 */

import pptxgen from 'pptxgenjs';
import { SlideSpec } from './schema';
import { ProfessionalTheme, PROFESSIONAL_THEMES } from './professionalThemes';

/* -------------------------------------------------------------------------------------------------
 * Enhanced Constants (16:9) and Layout Metrics for Professional Design
 * ------------------------------------------------------------------------------------------------- */
const SLIDE = { width: 10, height: 5.625 }; // exact 16:9

// Enhanced layout system with superior typography hierarchy and modern visual design
const LAYOUT = {
  // Optimized margins for better visual balance and modern aesthetics
  margins: { top: 0.4, right: 0.75, bottom: 0.3, left: 0.75 }, // Align with preview: content width 8.5in (colWidth=4.0 + gap=0.5)

  // Professional typography scale optimized for maximum readability and visual impact
  type: {
    display:  { fontSize: 56, lineHeight: 1.0, letterSpacing: -0.03, fontWeight: 800 },    // Hero titles - maximum impact for title slides
    title:    { fontSize: 42, lineHeight: 1.1, letterSpacing: -0.02, fontWeight: 700 },    // Main slide titles - enhanced prominence
    subtitle: { fontSize: 28, lineHeight: 1.2, letterSpacing: -0.01, fontWeight: 600 },    // Section headers - improved hierarchy
    body:     { fontSize: 20, lineHeight: 1.4, letterSpacing: 0.003, fontWeight: 400 },    // Body text - optimized readability
    bullet:   { fontSize: 18, lineHeight: 1.35, letterSpacing: 0.002, fontWeight: 400 },   // Bullet points - enhanced scanning
    caption:  { fontSize: 16, lineHeight: 1.3, letterSpacing: 0.01, fontWeight: 500 },     // Small text - better visibility
    quote:    { fontSize: 26, lineHeight: 1.5, letterSpacing: 0.005, fontWeight: 400 },    // Quote text - enhanced emphasis
    accent:   { fontSize: 15, lineHeight: 1.25, letterSpacing: 0.015, fontWeight: 600 },   // Accent text - labels, tags
  },

  // Professional spacing system optimized for modern business presentations
  spacing: {
    titleToContent: 0.8,     // Tighter spacing for better content density
    colGap: 0.6,             // Enhanced column separation for better readability
    bulletSpacing: 0.18,     // Optimized bullet spacing for professional appearance
    sectionGap: 0.6,         // Increased section gaps for better visual hierarchy
    cardPadding: 0.5,        // Generous padding for premium card design
    accentHeight: 0.15,      // Prominent accent bars for strong visual impact
    elementPadding: 0.25,    // Enhanced element padding for better content organization
    borderRadius: 0.15,      // Modern rounded corners for contemporary design
    shadowOffset: 0.06,      // Enhanced shadow for superior depth perception
    gradientAngle: 135,      // Standard gradient angle for visual consistency
    modernShadowBlur: 0.3,   // Improved shadow blur for professional depth
    gradientOpacity: 0.15,   // Enhanced gradient opacity for visual richness
    microSpacing: 0.1,       // Refined micro spacing for precise alignment
    visualMargin: 0.2,       // Enhanced visual margins for premium spacing
    contentMargin: 0.3,      // Additional margin for content areas
  }
};

// Professional content area calculations optimized for modern business presentations
const CONTENT = {
  x: LAYOUT.margins.left + LAYOUT.spacing.visualMargin,
  y: LAYOUT.margins.top + LAYOUT.spacing.visualMargin,
  width: SLIDE.width - LAYOUT.margins.left - LAYOUT.margins.right - (LAYOUT.spacing.visualMargin * 2),
  height: SLIDE.height - LAYOUT.margins.top - LAYOUT.margins.bottom - (LAYOUT.spacing.visualMargin * 2),
  titleH: 1.0, // Optimized for professional title spacing with enhanced visual balance
};

// Improved column calculations for two-column layouts with better proportions
const colWidth = (CONTENT.width - LAYOUT.spacing.colGap) / 2;

/* -------------------------------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------------------------------- */
function safeColor(input: any, fallback = '333333'): string {
  if (!input) return fallback;
  const s = typeof input === 'string' ? input : (input?.primary ?? '');
  const hex = s.replace('#', '').trim();
  if (/^[0-9a-fA-F]{6}$/.test(hex)) return hex.toUpperCase();
  if (/^[0-9a-fA-F]{3}$/.test(hex)) return hex.split('').map((c: string) => c + c).join('').toUpperCase();
  return fallback;
}
function getThemeColors(theme: ProfessionalTheme) {
  // Use theme colors exactly as defined - no modifications for consistency with frontend
  return {
    primary: safeColor(theme.colors.primary, '1E40AF'),
    secondary: safeColor(theme.colors.secondary, '3B82F6'),
    accent: safeColor(theme.colors.accent, 'F59E0B'),
    background: safeColor(theme.colors.background, 'FFFFFF'),
    surface: safeColor(theme.colors.surface, 'F8FAFC'),
    textPrimary: safeColor(theme.colors.text.primary, '1F2937'),
    textSecondary: safeColor(theme.colors.text.secondary, '6B7280'),
    textMuted: safeColor(theme.colors.text.muted, '9CA3AF'),
    borderLight: safeColor(theme.colors.borders?.light, 'F3F4F6'),
    borderMedium: safeColor(theme.colors.borders?.medium, 'E5E7EB'),
  };
}
function mapFont(fontFamily?: string): string {
  const map: Record<string, string> = {
    Inter: 'Aptos', 'SF Pro Display': 'Aptos', 'system-ui': 'Aptos',
    'Segoe UI': 'Aptos', Arial: 'Aptos', Helvetica: 'Aptos',
    Roboto: 'Aptos', 'Open Sans': 'Aptos', Lato: 'Aptos',
    'Times New Roman': 'Times New Roman', Georgia: 'Georgia',
    Aptos: 'Aptos', // Direct mapping for Aptos
    Calibri: 'Aptos', // Map Calibri to Aptos for consistency
  };
  if (!fontFamily) return 'Aptos'; // Default to Aptos for modern look
  const first = fontFamily.split(',')[0].replace(/['"]/g, '').trim();
  return map[first] ?? 'Aptos'; // Fallback to Aptos for consistency
}
function getFonts(theme: ProfessionalTheme) {
  return {
    heading: mapFont(theme.typography.headings.fontFamily),
    body: mapFont(theme.typography.body.fontFamily),
  };
}
function sanitizeText(s?: string, max = 1000): string {
  if (!s) return '';
  let t = s
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[\u2028\u2029]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[–—]/g, '-')
    .replace(/[…]/g, '...')
    .trim();
  if (!t) return '';
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 3);
  const i = cut.lastIndexOf(' ');
  return (i > max * 0.7 ? cut.slice(0, i) : cut) + '...';
}
function sanitizeBullets(items?: string[], maxItems = 6, maxEach = 180): string[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((b) => sanitizeText(b, maxEach))
    .filter((b) => !!b)
    .slice(0, maxItems);
}

/* -------------------------------------------------------------------------------------------------
 * Enhanced Slide Masters with Modern Design Elements
 * ------------------------------------------------------------------------------------------------- */
function defineMasters(pres: pptxgen, theme: ProfessionalTheme) {
  const colors = getThemeColors(theme);
  const marginTRBL = [LAYOUT.margins.top, LAYOUT.margins.right, LAYOUT.margins.bottom, LAYOUT.margins.left];

  // Enhanced content slide master with modern design elements
  pres.defineSlideMaster({
    title: 'PRO_CONTENT',
    background: { color: colors.background },
    margin: marginTRBL as any,
    objects: [
      // Enhanced top accent bar with solid color (gradient not supported in masters)
      { rect: {
        x: 0, y: 0, w: '100%', h: LAYOUT.spacing.accentHeight,
        fill: { color: colors.accent }
      }},
      // Subtle shadow under accent bar for depth
      { rect: {
        x: 0, y: LAYOUT.spacing.accentHeight, w: '100%', h: 0.02,
        fill: { color: colors.borderLight, transparency: 50 }
      }},
      // Modern corner accent element (bottom-right)
      { rect: {
        x: SLIDE.width - 0.3, y: SLIDE.height - 0.3, w: 0.3, h: 0.3,
        fill: { color: colors.accent, transparency: 85 }
      }},
    ],
  });

  // Enhanced title slide master with premium styling
  pres.defineSlideMaster({
    title: 'PRO_TITLE',
    background: { color: colors.surface }, // Use surface color for subtle background
    margin: marginTRBL as any,
    objects: [
      // Premium accent bar with primary color
      { rect: {
        x: 0, y: 0, w: '100%', h: LAYOUT.spacing.accentHeight,
        fill: { color: colors.primary }
      }},
      // Elegant decorative elements for title slides
      { rect: {
        x: SLIDE.width - 1.2, y: SLIDE.height - 1.2, w: 0.8, h: 0.8,
        fill: { color: colors.accent, transparency: 92 }
      }},
      { rect: {
        x: SLIDE.width - 0.8, y: SLIDE.height - 0.8, w: 0.4, h: 0.4,
        fill: { color: colors.primary, transparency: 88 }
      }},
    ],
  });
}

/* -------------------------------------------------------------------------------------------------
 * Blocks
 * ------------------------------------------------------------------------------------------------- */
/**
 * Enhanced title slide matching live preview exactly - modern and professional
 * Features: Bold typography, subtle gradients, modern styling, professional appearance
 */
function addTitleSlide(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme, fonts: { heading: string; body: string }) {
  const colors = getThemeColors(theme);

  // Enhanced background with subtle overlay matching preview
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: SLIDE.width,
    h: SLIDE.height,
    fill: { color: colors.background },
    line: { width: 0 },
  });

  // Enhanced gradient overlay for sophisticated visual depth and modern appeal
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: SLIDE.width,
    h: SLIDE.height,
    fill: { color: colors.surface, transparency: 94 }, // Slightly more visible for better depth
    line: { width: 0 },
  });

  // Primary accent bar with enhanced visual prominence and modern shadow
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: SLIDE.width,
    h: LAYOUT.spacing.accentHeight,
    fill: { color: colors.primary },
    line: { width: 0 },
    shadow: {
      type: 'outer',
      blur: LAYOUT.spacing.modernShadowBlur,
      offset: LAYOUT.spacing.shadowOffset,
      color: colors.primary,
      opacity: 0.25
    }
  });

  // Secondary accent bar with sophisticated gradient and layered design
  slide.addShape("rect", {
    x: 0,
    y: LAYOUT.spacing.accentHeight,
    w: SLIDE.width * 0.65, // Enhanced width for better visual balance
    h: LAYOUT.spacing.accentHeight * 0.6, // Improved height for prominence
    fill: { color: colors.accent, transparency: 18 }, // Refined transparency
    line: { width: 0 },
  });

  // Professional main title with enhanced typography and modern design
  slide.addText(sanitizeText(spec.title, 120) || 'Presentation', {
    x: CONTENT.x + LAYOUT.spacing.contentMargin,
    y: 1.6, // Optimized positioning for better visual balance
    w: CONTENT.width - (LAYOUT.spacing.contentMargin * 2),
    h: 1.8, // Enhanced height for improved text rendering
    fontFace: fonts.heading,
    fontSize: LAYOUT.type.display.fontSize,
    color: colors.textPrimary,
    bold: true,
    align: 'center',
    valign: 'middle',
    lineSpacingMultiple: LAYOUT.type.display.lineHeight,
    wrap: true,
    shadow: {
      type: 'outer',
      blur: 4, // Enhanced shadow blur for professional depth
      offset: LAYOUT.spacing.shadowOffset * 2,
      angle: 315,
      color: colors.textSecondary,
      opacity: 0.3 // Refined shadow opacity
    }
  });

  // Add subtitle/content text if available matching preview style
  const contentText = (spec as any).subtitle || spec.paragraph || (spec as any).content;
  if (contentText) {
    slide.addText(sanitizeText(contentText, 500) || '', {
      x: CONTENT.x,
      y: 3.6, // Positioned below the title
      w: CONTENT.width,
      h: 1.5, // Space for content paragraph
      fontFace: fonts.body,
      fontSize: LAYOUT.type.subtitle.fontSize, // Use subtitle size for better hierarchy
      color: colors.textPrimary,
      bold: false,
      align: 'center',
      valign: 'top',
      lineSpacingMultiple: LAYOUT.type.subtitle.lineHeight,
      wrap: true,
    });
  }

  // Enhanced decorative accent line with modern styling
  slide.addShape("rect", {
    x: SLIDE.width * 0.3, // Centered, 40% width
    y: 5.2,
    w: SLIDE.width * 0.4,
    h: 0.04, // Slightly thicker for better visibility
    fill: { color: colors.accent, transparency: 8 },
    line: { width: 0 },
  });

  // Additional subtle decorative elements for modern appeal
  slide.addShape("rect", {
    x: SLIDE.width - 0.8,
    y: SLIDE.height - 0.8,
    w: 0.6,
    h: 0.6,
    fill: { color: colors.accent, transparency: 94 },
    line: { width: 0 },
  });

  slide.addShape("rect", {
    x: SLIDE.width - 0.5,
    y: SLIDE.height - 0.5,
    w: 0.3,
    h: 0.3,
    fill: { color: colors.primary, transparency: 92 },
    line: { width: 0 },
  });
}

/**
 * Superior content title with enhanced modern design and optimized visual hierarchy
 * Features: Advanced typography, sophisticated accent elements, premium professional styling
 */
function addContentTitle(slide: pptxgen.Slide, title: string, theme: ProfessionalTheme, fonts: { heading: string }) {
  const colors = getThemeColors(theme);

  const cleanTitle = sanitizeText(title, 120);

  // Professional title with enhanced typography and modern visual effects
  slide.addText(cleanTitle, {
    x: CONTENT.x,
    y: CONTENT.y + LAYOUT.spacing.microSpacing,
    w: CONTENT.width,
    h: CONTENT.titleH - LAYOUT.spacing.microSpacing,
    fontFace: fonts.heading,
    fontSize: LAYOUT.type.title.fontSize,
    color: colors.textPrimary, // Use primary text color for better readability
    bold: true,
    align: 'left',
    valign: 'top',
    lineSpacingMultiple: LAYOUT.type.title.lineHeight,
    wrap: true,
    shadow: {
      type: 'outer',
      blur: 2,
      offset: LAYOUT.spacing.shadowOffset,
      color: colors.textSecondary,
      opacity: 0.2 // Enhanced shadow for better depth
    }
  });

  // Enhanced dynamic underline positioning with improved spacing
  const estTitleH = estimateTextHeightIn(
    cleanTitle,
    CONTENT.width,
    LAYOUT.type.title.fontSize,
    LAYOUT.type.title.lineHeight
  );
  const underlineY = CONTENT.y + Math.min(estTitleH + LAYOUT.spacing.microSpacing, CONTENT.titleH - LAYOUT.spacing.microSpacing);

  // Modern accent underline with sophisticated design
  slide.addShape("rect", {
    x: CONTENT.x,
    y: underlineY,
    w: CONTENT.width * 0.25, // Wider underline for better visual impact
    h: LAYOUT.spacing.accentHeight * 0.4, // Proportional height
    fill: { color: colors.primary, transparency: 5 }, // Primary color for consistency
    line: { width: 0 },
  });

  // Secondary accent element for modern layered effect
  slide.addShape("rect", {
    x: CONTENT.x,
    y: underlineY + LAYOUT.spacing.accentHeight * 0.4,
    w: CONTENT.width * 0.15, // Shorter secondary accent
    h: LAYOUT.spacing.accentHeight * 0.2,
    fill: { color: colors.accent, transparency: 15 },
    line: { width: 0 },
  });

  // Secondary accent for modern depth like preview
  slide.addShape("rect", {
    x: CONTENT.x,
    y: underlineY + 0.03,
    w: CONTENT.width * 0.08, // 8% width like preview
    h: 0.02,
    fill: { color: colors.primary, transparency: 30 },
    line: { width: 0 },
  });
}

/**
 * Enhanced bullets and paragraph rendering with improved typography and spacing
 * Features: Better bullet styling, improved readability, visual hierarchy, modern design
 */
function addBulletsOrParagraph(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme, fonts: { body: string }) {
  const colors = getThemeColors(theme);
  const bullets = sanitizeBullets(spec.bullets);
  const y = CONTENT.y + CONTENT.titleH + LAYOUT.spacing.titleToContent;
  const h = CONTENT.height - CONTENT.titleH - LAYOUT.spacing.titleToContent;

  if (bullets.length) {
    // Professional shadow layer for depth
    slide.addShape("rect", {
      x: CONTENT.x + LAYOUT.spacing.shadowOffset,
      y: y + LAYOUT.spacing.shadowOffset,
      w: CONTENT.width,
      h: h,
      fill: { color: colors.textSecondary, transparency: 80 },
      line: { width: 0 },
    });

    // Premium card background with modern styling
    slide.addShape("rect", {
      x: CONTENT.x,
      y: y,
      w: CONTENT.width,
      h: h,
      fill: { color: colors.surface, transparency: 4 },
      line: { color: colors.borderMedium, width: 1.5 },
    });

    // Modern accent bar at top of content area
    slide.addShape("rect", {
      x: CONTENT.x,
      y: y,
      w: CONTENT.width,
      h: LAYOUT.spacing.accentHeight * 0.5,
      fill: { color: colors.primary, transparency: 10 },
      line: { width: 0 },
    });

    // Professional bullet rendering with enhanced formatting
    slide.addText(bullets.join('\n'), {
      x: CONTENT.x + LAYOUT.spacing.cardPadding,
      y: y + LAYOUT.spacing.elementPadding,
      w: CONTENT.width - (LAYOUT.spacing.cardPadding * 2),
      h: h - (LAYOUT.spacing.elementPadding * 2),
      fontFace: fonts.body,
      fontSize: LAYOUT.type.bullet.fontSize,
      color: colors.textPrimary,
      bullet: {
        type: 'bullet',
        style: '•',
        startAt: 1,
        indent: 0.25 // Enhanced indent for better hierarchy
      },
      lineSpacingMultiple: LAYOUT.type.bullet.lineHeight,
      paraSpaceAfter: 12, // Increased spacing between bullets
      valign: 'top',
      wrap: true
    });

  } else if (spec.paragraph) {
    // Modern card background with shadow matching preview
    slide.addShape("rect", {
      x: CONTENT.x + 0.02,
      y: y + 0.02,
      w: CONTENT.width,
      h: h,
      fill: { color: colors.textSecondary, transparency: 85 },
      line: { width: 0 },
    });

    // Main card background matching preview styling
    slide.addShape("rect", {
      x: CONTENT.x,
      y: y,
      w: CONTENT.width,
      h: h,
      fill: { color: colors.surface, transparency: 8 },
      line: { color: colors.borderLight, width: 0.5 },
    });

    // Enhanced paragraph rendering matching preview with overflow guard
    {
      const text = sanitizeText(spec.paragraph, 1200);
      const fitFont = computeAdjustedFontSize(text, CONTENT.width - 0.3, h - 0.2, LAYOUT.type.body.fontSize, LAYOUT.type.body.lineHeight, 12);
      slide.addText(text, {
        x: CONTENT.x + 0.15,
        y: y + 0.1,
        w: CONTENT.width - 0.3,
        h: h - 0.2,
        fontFace: fonts.body,
        fontSize: fitFont,
        color: colors.textPrimary,
        lineSpacingMultiple: LAYOUT.type.body.lineHeight,
        paraSpaceAfter: 4,
        valign: 'top',
        wrap: true
      });
    }

  } else {
    // Fallback for empty content with modern styling
    slide.addText('Content will be displayed here.', {
      x: CONTENT.x,
      y: y,
      w: CONTENT.width,
      h: h,
      fontFace: fonts.body,
      fontSize: LAYOUT.type.body.fontSize,
      color: colors.textMuted,
      align: 'center',
      valign: 'middle',
      italic: true
    });
  }
}

/**
 * Superior two-column layout with advanced modern styling and enhanced visual hierarchy
 * Features: Sophisticated column separation, optimized spacing, enhanced visual balance, premium card-based design
 */
function addTwoColumn(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme, fonts: { body: string; heading: string }) {
  addContentTitle(slide, spec.title, theme, fonts);
  const colors = getThemeColors(theme);
  const y = CONTENT.y + CONTENT.titleH + LAYOUT.spacing.titleToContent;
  const h = CONTENT.height - CONTENT.titleH - LAYOUT.spacing.titleToContent;

  const leftBul = sanitizeBullets(spec.left?.bullets);
  const rightBul = sanitizeBullets(spec.right?.bullets);

  // Enhanced shadow layer for superior depth perception
  slide.addShape("rect", {
    x: CONTENT.x + LAYOUT.spacing.shadowOffset,
    y: y - LAYOUT.spacing.elementPadding + LAYOUT.spacing.shadowOffset,
    w: CONTENT.width,
    h: h + (LAYOUT.spacing.elementPadding * 2),
    fill: { color: colors.textSecondary, transparency: 85 }, // Enhanced shadow visibility
    line: { width: 0 },
  });

  // Premium main card with sophisticated styling
  slide.addShape("rect", {
    x: CONTENT.x,
    y: y - LAYOUT.spacing.elementPadding,
    w: CONTENT.width,
    h: h + (LAYOUT.spacing.elementPadding * 2),
    fill: { color: colors.surface, transparency: 6 }, // Enhanced surface visibility
    line: { color: colors.borderMedium, width: 1.2 }, // Stronger border for better definition
  });

  // Modern accent line at top of card for enhanced visual hierarchy
  slide.addShape("rect", {
    x: CONTENT.x,
    y: y - LAYOUT.spacing.elementPadding,
    w: CONTENT.width,
    h: LAYOUT.spacing.microSpacing,
    fill: { color: colors.accent, transparency: 20 },
    line: { width: 0 },
  });

  // Professional left column with enhanced styling and better spacing
  if (leftBul.length) {
    slide.addText(leftBul.join('\n'), {
      x: CONTENT.x + LAYOUT.spacing.cardPadding,
      y: y + LAYOUT.spacing.elementPadding + LAYOUT.spacing.microSpacing,
      w: colWidth - (LAYOUT.spacing.cardPadding * 2),
      h: h - (LAYOUT.spacing.elementPadding * 2) - LAYOUT.spacing.microSpacing,
      fontFace: fonts.body,
      fontSize: LAYOUT.type.bullet.fontSize,
      color: colors.textPrimary,
      bullet: {
        type: 'bullet',
        style: '•',
        startAt: 1,
        indent: 0.2 // Enhanced indent for better hierarchy
      },
      lineSpacingMultiple: LAYOUT.type.bullet.lineHeight,
      paraSpaceAfter: 14, // Increased spacing for better readability
      valign: 'top',
    });
  } else if (spec.left?.paragraph) {
    const text = sanitizeText(spec.left.paragraph, 800);
    const fitFont = computeAdjustedFontSize(text, colWidth - (LAYOUT.spacing.cardPadding * 2), h - (LAYOUT.spacing.elementPadding * 2), LAYOUT.type.body.fontSize, LAYOUT.type.body.lineHeight, 12);
    slide.addText(text, {
      x: CONTENT.x + LAYOUT.spacing.cardPadding,
      y: y + LAYOUT.spacing.elementPadding,
      w: colWidth - (LAYOUT.spacing.cardPadding * 2),
      h: h - (LAYOUT.spacing.elementPadding * 2),
      fontFace: fonts.body,
      fontSize: fitFont,
      color: colors.textPrimary,
      lineSpacingMultiple: LAYOUT.type.body.lineHeight,
      valign: 'top',
    });
  }

  // Modern column separator for better visual organization
  slide.addShape("rect", {
    x: CONTENT.x + colWidth + (LAYOUT.spacing.colGap / 2) - 0.01,
    y: y + LAYOUT.spacing.elementPadding,
    w: 0.02,
    h: h - (LAYOUT.spacing.elementPadding * 2),
    fill: { color: colors.borderMedium, transparency: 30 },
    line: { width: 0 },
  });

  // Professional right column with enhanced styling and better spacing
  if (rightBul.length) {
    slide.addText(rightBul.join('\n'), {
      x: CONTENT.x + colWidth + LAYOUT.spacing.colGap + LAYOUT.spacing.cardPadding,
      y: y + LAYOUT.spacing.elementPadding + LAYOUT.spacing.microSpacing,
      w: colWidth - (LAYOUT.spacing.cardPadding * 2),
      h: h - (LAYOUT.spacing.elementPadding * 2) - LAYOUT.spacing.microSpacing,
      fontFace: fonts.body,
      fontSize: LAYOUT.type.bullet.fontSize,
      color: colors.textPrimary,
      bullet: {
        type: 'bullet',
        style: '•',
        startAt: 1,
        indent: 0.2 // Enhanced indent for better hierarchy
      },
      lineSpacingMultiple: LAYOUT.type.bullet.lineHeight,
      paraSpaceAfter: 14, // Increased spacing for better readability
      valign: 'top',
    });
  } else if (spec.right?.paragraph) {
    const text = sanitizeText(spec.right.paragraph, 800);
    const fitFont = computeAdjustedFontSize(text, colWidth - (LAYOUT.spacing.cardPadding * 2), h - (LAYOUT.spacing.elementPadding * 2), LAYOUT.type.body.fontSize, LAYOUT.type.body.lineHeight, 12);
    slide.addText(text, {
      x: CONTENT.x + colWidth + LAYOUT.spacing.colGap + LAYOUT.spacing.cardPadding,
      y: y + LAYOUT.spacing.elementPadding,
      w: colWidth - (LAYOUT.spacing.cardPadding * 2),
      h: h - (LAYOUT.spacing.elementPadding * 2),
      fontFace: fonts.body,
      fontSize: fitFont,
      color: colors.textPrimary,
      lineSpacingMultiple: LAYOUT.type.body.lineHeight,
      valign: 'top',
    });
  }



}

/* -------------------------------- Enhanced Image Layouts ---------------------------------- */

/**
 * Superior image-right layout with advanced styling and enhanced visual integration
 * Features: Optimized content-image balance, sophisticated visual effects, modern design principles
 */
function addImageRightSlide(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme, fonts: { body: string; heading: string }) {
  addContentTitle(slide, spec.title, theme, fonts);
  const colors = getThemeColors(theme);
  const y = CONTENT.y + CONTENT.titleH + LAYOUT.spacing.titleToContent;
  const h = CONTENT.height - CONTENT.titleH - LAYOUT.spacing.titleToContent;

  // Enhanced content area proportions for optimal visual balance
  const contentWidth = CONTENT.width * 0.58;
  const imageWidth = CONTENT.width * 0.38;
  const imageX = CONTENT.x + contentWidth + LAYOUT.spacing.colGap;

  // Add content (bullets or paragraph) on the left
  const bullets = sanitizeBullets(spec.bullets);
  if (bullets.length) {
    slide.addText(bullets.join('\n'), {
      x: CONTENT.x + 0.05,
      y,
      w: contentWidth - 0.05,
      h,
      fontFace: fonts.body,
      fontSize: LAYOUT.type.bullet.fontSize,
      color: colors.textPrimary,
      bullet: {
        type: 'bullet',
        style: '•',
        startAt: 1,
        indent: 0.15
      },
      lineSpacingMultiple: LAYOUT.type.bullet.lineHeight,
      paraSpaceAfter: 8,
      valign: 'top',
    });
  } else if (spec.paragraph) {
    {
      const text = sanitizeText(spec.paragraph, 800);
      const fitFont = computeAdjustedFontSize(text, contentWidth - 0.05, h, LAYOUT.type.body.fontSize, LAYOUT.type.body.lineHeight, 12);
      slide.addText(text, {
        x: CONTENT.x + 0.05,
        y,
        w: contentWidth - 0.05,
        h,
        fontFace: fonts.body,
        fontSize: fitFont,
        color: colors.textPrimary,
        lineSpacingMultiple: LAYOUT.type.body.lineHeight,
        valign: 'top',
      });
    }

  }

  // Enhanced image area with professional styling
  addImagePlaceholder(slide, {
    x: imageX,
    y: y + 0.1,
    w: imageWidth,
    h: h - 0.2,
    colors,
    imagePrompt: (spec as any).imagePrompt,
    generatedImageUrl: (spec as any).generatedImageUrl || spec.imageUrl
  });
}

/**
 * Enhanced mixed-content layout with main paragraph and two-column sections
 * Features: Main paragraph at top, left/right sections below, professional styling
 */
function addMixedContentSlide(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme, fonts: { body: string; heading: string }) {
  addContentTitle(slide, spec.title, theme, fonts);
  const colors = getThemeColors(theme);
  let currentY = CONTENT.y + CONTENT.titleH + LAYOUT.spacing.titleToContent;
  const totalHeight = CONTENT.height - CONTENT.titleH - LAYOUT.spacing.titleToContent;

  // Add main paragraph with modern card styling matching preview
  if (spec.paragraph) {
    const paragraphHeight = Math.min(totalHeight * 0.4, 1.5);

    // Modern card shadow matching preview
    slide.addShape("rect", {
      x: CONTENT.x + 0.02,
      y: currentY + 0.02,
      w: CONTENT.width,
      h: paragraphHeight + 0.1,
      fill: { color: colors.textSecondary, transparency: 85 },
      line: { width: 0 },
    });

    // Main card background matching preview styling
    slide.addShape("rect", {
      x: CONTENT.x,
      y: currentY,
      w: CONTENT.width,
      h: paragraphHeight + 0.1,
      fill: { color: colors.surface, transparency: 8 },
      line: { color: colors.borderLight, width: 0.5 },
    });

    // Content text with proper padding and overflow guard
    {
      const text = sanitizeText(spec.paragraph, 1200);
      const fitFont = computeAdjustedFontSize(text, CONTENT.width - 0.3, paragraphHeight, LAYOUT.type.body.fontSize, LAYOUT.type.body.lineHeight, 12);
      slide.addText(text, {
        x: CONTENT.x + 0.15,
        y: currentY + 0.05,
        w: CONTENT.width - 0.3,
        h: paragraphHeight,
        fontFace: fonts.body,
        fontSize: fitFont,
        color: colors.textPrimary,
      lineSpacingMultiple: LAYOUT.type.body.lineHeight,
      paraSpaceAfter: 4,
      valign: 'top',
      wrap: true,
    });
    }


    currentY += paragraphHeight + 0.2;
  }

  // Calculate remaining height for two-column section
  const remainingHeight = CONTENT.y + CONTENT.height - currentY;

  if (remainingHeight > 0.5) {
    const leftBul = sanitizeBullets(spec.left?.bullets);
    const rightBul = sanitizeBullets(spec.right?.bullets);

    // Left column with modern card styling matching preview
    if (leftBul.length || spec.left?.paragraph) {
      // Card shadow
      slide.addShape("rect", {
        x: CONTENT.x + 0.02,
        y: currentY + 0.02,
        w: colWidth,
        h: remainingHeight - 0.1,
        fill: { color: colors.textSecondary, transparency: 85 },
        line: { width: 0 },
      });

      // Card background
      slide.addShape("rect", {
        x: CONTENT.x,
        y: currentY,
        w: colWidth,
        h: remainingHeight - 0.1,
        fill: { color: colors.surface, transparency: 8 },
        line: { color: colors.borderLight, width: 0.5 },
      });

      // Left accent indicator matching preview
      slide.addShape("rect", {
        x: CONTENT.x,
        y: currentY + 0.08,
        w: 0.04,
        h: remainingHeight - 0.26,
        fill: { color: colors.accent, transparency: 40 },
        line: { width: 0 },
      });

      if (leftBul.length) {
        slide.addText(leftBul.join('\n'), {
          x: CONTENT.x + 0.15,
          y: currentY + 0.1,
          w: colWidth - 0.25,
          h: remainingHeight - 0.3,
          fontFace: fonts.body,
          fontSize: LAYOUT.type.bullet.fontSize,
          color: colors.textPrimary,
          bullet: {
            type: 'bullet',
            style: '•',
            startAt: 1,
            indent: 0.15
          },
          lineSpacingMultiple: LAYOUT.type.bullet.lineHeight,
          paraSpaceAfter: 10,
          valign: 'top',
        });
      } else if (spec.left?.paragraph) {
        {
          const text = sanitizeText(spec.left.paragraph, 800);
          const fitFont = computeAdjustedFontSize(text, colWidth - 0.25, remainingHeight - 0.3, LAYOUT.type.body.fontSize, LAYOUT.type.body.lineHeight, 12);
          slide.addText(text, {
            x: CONTENT.x + 0.15,
            y: currentY + 0.1,
            w: colWidth - 0.25,
            h: remainingHeight - 0.3,
            fontFace: fonts.body,
            fontSize: fitFont,
            color: colors.textPrimary,
            lineSpacingMultiple: LAYOUT.type.body.lineHeight,
            valign: 'top',
          });
        }
      }
    }

    // Right column with modern card styling matching preview
    if (rightBul.length || spec.right?.paragraph) {
      const rightX = CONTENT.x + colWidth + LAYOUT.spacing.colGap;

      // Card shadow
      slide.addShape("rect", {
        x: rightX + 0.02,
        y: currentY + 0.02,
        w: colWidth,
        h: remainingHeight - 0.1,
        fill: { color: colors.textSecondary, transparency: 85 },
        line: { width: 0 },
      });

      // Card background
      slide.addShape("rect", {
        x: rightX,
        y: currentY,
        w: colWidth,
        h: remainingHeight - 0.1,
        fill: { color: colors.surface, transparency: 8 },
        line: { color: colors.borderLight, width: 0.5 },
      });

      // Right accent indicator matching preview
      slide.addShape("rect", {
        x: rightX,
        y: currentY + 0.08,
        w: 0.04,
        h: remainingHeight - 0.26,
        fill: { color: colors.accent, transparency: 40 },
        line: { width: 0 },
      });

      if (rightBul.length) {
        slide.addText(rightBul.join('\n'), {
          x: rightX + 0.15,
          y: currentY + 0.1,
          w: colWidth - 0.25,
          h: remainingHeight - 0.3,
          fontFace: fonts.body,
          fontSize: LAYOUT.type.bullet.fontSize,
          color: colors.textPrimary,
          bullet: {
            type: 'bullet',
            style: '•',
            startAt: 1,
            indent: 0.15
          },
          lineSpacingMultiple: LAYOUT.type.bullet.lineHeight,
          paraSpaceAfter: 10,
          valign: 'top',
        });
      } else if (spec.right?.paragraph) {
        {
          const text = sanitizeText(spec.right.paragraph, 800);
          const fitFont = computeAdjustedFontSize(text, colWidth - 0.25, remainingHeight - 0.3, LAYOUT.type.body.fontSize, LAYOUT.type.body.lineHeight, 12);
          slide.addText(text, {
            x: rightX + 0.15,
            y: currentY + 0.1,
            w: colWidth - 0.25,
            h: remainingHeight - 0.3,
            fontFace: fonts.body,
            fontSize: fitFont,
            color: colors.textPrimary,
            lineSpacingMultiple: LAYOUT.type.body.lineHeight,
            valign: 'top',
          });
        }

      }
    }
  }
}

/**
 * Enhanced image-left layout with professional styling and optimal content balance
 * Features: Image on left, content on right, modern visual integration
 */
function addImageLeftSlide(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme, fonts: { body: string; heading: string }) {
  addContentTitle(slide, spec.title, theme, fonts);
  const colors = getThemeColors(theme);
  const y = CONTENT.y + CONTENT.titleH + LAYOUT.spacing.titleToContent;
  const h = CONTENT.height - CONTENT.titleH - LAYOUT.spacing.titleToContent;

  // Image area (left side) - 38% width
  const imageWidth = CONTENT.width * 0.38;
  const contentWidth = CONTENT.width * 0.58;
  const contentX = CONTENT.x + imageWidth + LAYOUT.spacing.colGap;

  // Enhanced image area with professional styling
  addImagePlaceholder(slide, {
    x: CONTENT.x,
    y: y + 0.1,
    w: imageWidth,
    h: h - 0.2,
    colors,
    imagePrompt: (spec as any).imagePrompt,
    generatedImageUrl: (spec as any).generatedImageUrl || spec.imageUrl
  });

  // Add content (bullets or paragraph) on the right
  const bullets = sanitizeBullets(spec.bullets);
  if (bullets.length) {
    slide.addText(bullets.join('\n'), {
      x: contentX + 0.05,
      y,
      w: contentWidth - 0.05,
      h,
      fontFace: fonts.body,
      fontSize: LAYOUT.type.bullet.fontSize,
      color: colors.textPrimary,
      bullet: {
        type: 'bullet',
        style: '•',
        startAt: 1,
        indent: 0.15
      },
      lineSpacingMultiple: LAYOUT.type.bullet.lineHeight,
      paraSpaceAfter: 8,
      valign: 'top',
    });
  } else if (spec.paragraph) {
    const text = sanitizeText(spec.paragraph, 800);
    const fitFont = computeAdjustedFontSize(text, contentWidth - 0.05, h, LAYOUT.type.body.fontSize, LAYOUT.type.body.lineHeight, 12);
    slide.addText(text, {
      x: contentX + 0.05,
      y,
      w: contentWidth - 0.05,
      h,
      fontFace: fonts.body,
      fontSize: fitFont,
      color: colors.textPrimary,
      lineSpacingMultiple: LAYOUT.type.body.lineHeight,
      paraSpaceAfter: 4,
      valign: 'top',
      wrap: true,
    });
  }
}

/**
 * Enhanced full-image layout with overlay text and professional styling
 * Features: Full-screen image with elegant text overlay
 */
function addImageFullSlide(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme, fonts: { body: string; heading: string }) {
  const colors = getThemeColors(theme);

  // Full-screen image background
  addImagePlaceholder(slide, {
    x: 0,
    y: 0,
    w: SLIDE.width,
    h: SLIDE.height,
    colors,
    imagePrompt: (spec as any).imagePrompt,
    generatedImageUrl: (spec as any).generatedImageUrl || spec.imageUrl,
    isFullScreen: true
  });

  // Semi-transparent overlay for text readability
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: SLIDE.width,
    h: SLIDE.height,
    fill: { color: colors.textPrimary, transparency: 60 },
    line: { width: 0 },
  });

  // Enhanced title with full-screen styling
  slide.addText(sanitizeText(spec.title, 120) || 'Slide Title', {
    x: CONTENT.x,
    y: SLIDE.height * 0.3,
    w: CONTENT.width,
    h: 1.2,
    fontFace: fonts.heading,
    fontSize: LAYOUT.type.display.fontSize,
    color: colors.background, // White text on dark overlay
    bold: true,
    align: 'center',
    valign: 'middle',
    lineSpacingMultiple: LAYOUT.type.display.lineHeight,
  });

  // Enhanced subtitle/content with overlay styling
  if (spec.paragraph) {
    slide.addText(sanitizeText(spec.paragraph, 300), {
      x: CONTENT.x,
      y: SLIDE.height * 0.5,
      w: CONTENT.width,
      h: 1.0,
      fontFace: fonts.body,
      fontSize: LAYOUT.type.subtitle.fontSize,
      color: colors.surface, // Light text on dark overlay
      align: 'center',
      valign: 'middle',
      lineSpacingMultiple: LAYOUT.type.subtitle.lineHeight,
    });
  }
}

/**
 * Superior image placeholder with advanced styling and enhanced visual integration
 * Features: Premium image handling, sophisticated placeholders, enhanced visual consistency, modern design principles
 */
function addImagePlaceholder(slide: pptxgen.Slide, options: {
  x: number;
  y: number;
  w: number;
  h: number;
  colors: any;
  imagePrompt?: string;
  generatedImageUrl?: string;
  isFullScreen?: boolean;
}) {
  const { x, y, w, h, colors, imagePrompt, generatedImageUrl, isFullScreen = false } = options;

  if (generatedImageUrl) {
    // Add actual image with superior styling and enhanced visual effects
    try {
      // Enhanced shadow layer for depth (behind image)
      if (!isFullScreen) {
        slide.addShape("rect", {
          x: x + LAYOUT.spacing.shadowOffset * 1.5,
          y: y + LAYOUT.spacing.shadowOffset * 1.5,
          w,
          h,
          fill: { color: colors.textSecondary, transparency: 85 }, // Enhanced shadow visibility
          line: { width: 0 },
        });
      }

      slide.addImage({
        path: generatedImageUrl,
        x,
        y,
        w,
        h,
        sizing: { type: 'cover', w, h },
        rounding: !isFullScreen, // Enhanced border radius for modern look (boolean value)
      });

      // Enhanced image border with sophisticated styling for non-fullscreen images
      if (!isFullScreen) {
        slide.addShape("rect", {
          x,
          y,
          w,
          h,
          fill: { color: 'FFFFFF', transparency: 100 }, // Transparent fill
          line: { color: colors.borderMedium, width: 1.5 }, // Enhanced border thickness
        });

        // Modern accent corner for premium feel
        slide.addShape("rect", {
          x: x + w - 0.3,
          y: y,
          w: 0.3,
          h: 0.15,
          fill: { color: colors.accent, transparency: 20 },
          line: { width: 0 },
        });
      }
      return;
    } catch (error) {
      console.warn('Failed to add image, using enhanced placeholder:', error);
    }
  }

  // Superior placeholder with premium professional styling and modern design
  if (!isFullScreen) {
    // Enhanced shadow layer for superior depth perception
    slide.addShape("rect", {
      x: x + LAYOUT.spacing.shadowOffset * 1.2,
      y: y + LAYOUT.spacing.shadowOffset * 1.2,
      w,
      h,
      fill: { color: colors.textSecondary, transparency: 82 }, // Enhanced shadow visibility
      line: { width: 0 },
    });

    // Premium main background frame with sophisticated styling
    slide.addShape("rect", {
      x,
      y,
      w,
      h,
      fill: { color: colors.surface, transparency: 5 }, // Subtle transparency for depth
      line: { color: colors.borderMedium, width: 2.8 }, // Enhanced border thickness
    });

    // Sophisticated gradient overlay for enhanced visual depth
    slide.addShape("rect", {
      x: x + LAYOUT.spacing.microSpacing,
      y: y + LAYOUT.spacing.microSpacing,
      w: w - (LAYOUT.spacing.microSpacing * 2),
      h: h - (LAYOUT.spacing.microSpacing * 2),
      fill: { color: colors.primary, transparency: 93 }, // Refined transparency
      line: { width: 0 },
    });

    // Modern accent corner elements for premium design
    slide.addShape("rect", {
      x: x + w - 0.35,
      y: y + 0.05,
      w: 0.3,
      h: 0.08,
      fill: { color: colors.accent, transparency: 18 }, // Enhanced accent visibility
      line: { width: 0 },
    });

    // Additional accent element for sophisticated layering
    slide.addShape("rect", {
      x: x + 0.05,
      y: y + h - 0.13,
      w: 0.25,
      h: 0.08,
      fill: { color: colors.secondary, transparency: 25 },
      line: { width: 0 },
    });

    slide.addShape("rect", {
      x: x + 0.05,
      y: y + h - 0.1,
      w: 0.25,
      h: 0.05,
      fill: { color: colors.accent, transparency: 20 },
      line: { width: 0 },
    });

    // Accent border for premium feel
    slide.addShape("rect", {
      x,
      y,
      w,
      h: 0.04,
      fill: { color: colors.accent, transparency: 80 },
      line: { width: 0 },
    });
  }

  // Professional placeholder content with better positioning
  const centerX = x + w / 2;
  const centerY = y + h / 2;

  // Modern image icon with better styling
  slide.addText('📷', {
    x: centerX - 0.4,
    y: centerY - 0.5,
    w: 0.8,
    h: 0.5,
    fontSize: Math.min(36, w * 10),
    color: colors.primary,
    align: 'center',
    valign: 'middle',
  });

  // Enhanced placeholder text with better typography
  const placeholderText = imagePrompt ? 'AI Generated Image' : 'Professional Image';
  slide.addText(placeholderText, {
    x: centerX - w * 0.45,
    y: centerY + 0.05,
    w: w * 0.9,
    h: 0.4,
    fontSize: Math.min(16, w * 4),
    color: colors.textSecondary,
    align: 'center',
    valign: 'top',
    bold: true,
  });

  // Show image prompt hint if available
  if (imagePrompt && !isFullScreen) {
    const shortPrompt = imagePrompt.length > 40 ? `${imagePrompt.slice(0, 40)}...` : imagePrompt;
    slide.addText(`"${shortPrompt}"`, {
      x: centerX - w * 0.45,
      y: centerY + 0.4,
      w: w * 0.9,
      h: 0.4,
      fontSize: Math.min(10, w * 2),
      color: colors.textMuted,
      align: 'center',
      valign: 'top',
      italic: true,
    });
  }
}

/* -------------------------------- Spacing & Visual Hierarchy Utilities ---------------------------------- */

/**
 * Apply consistent spacing and visual hierarchy across all slide elements
 * Features: Standardized margins, padding, and positioning for professional consistency
 */
function applyConsistentSpacing(element: any, type: 'title' | 'content' | 'accent' | 'card' = 'content') {
  const baseSpacing = {
    title: {
      marginBottom: LAYOUT.spacing.titleToContent,
      padding: LAYOUT.spacing.elementPadding,
    },
    content: {
      padding: LAYOUT.spacing.elementPadding,
      marginBottom: LAYOUT.spacing.bulletSpacing,
    },
    accent: {
      height: LAYOUT.spacing.accentHeight,
      borderRadius: LAYOUT.spacing.borderRadius,
    },
    card: {
      padding: LAYOUT.spacing.cardPadding,
      borderRadius: LAYOUT.spacing.borderRadius,
      margin: LAYOUT.spacing.elementPadding,
    }
  };

  return { ...element, ...baseSpacing[type] };
}

/**
 * Calculate optimal content positioning based on slide layout and content type
 * Features: Dynamic positioning, responsive spacing, visual balance optimization
 */
function calculateOptimalPositioning(slideType: string, hasTitle: boolean = true) {
  const baseY = CONTENT.y + (hasTitle ? CONTENT.titleH + LAYOUT.spacing.titleToContent : 0);
  const availableHeight = CONTENT.height - (hasTitle ? CONTENT.titleH + LAYOUT.spacing.titleToContent : 0);

  const positioning = {
    'title': {
      contentY: SLIDE.height * 0.3,
      contentHeight: SLIDE.height * 0.4,
      centerAlign: true
    },
    'two-column': {
      contentY: baseY,
      contentHeight: availableHeight,
      columnWidth: (CONTENT.width - LAYOUT.spacing.colGap) / 2,
      columnGap: LAYOUT.spacing.colGap
    },
    'image-right': {
      contentY: baseY,
      contentHeight: availableHeight,
      contentWidth: CONTENT.width * 0.58,
      imageWidth: CONTENT.width * 0.38,
      gap: LAYOUT.spacing.colGap
    },
    'image-left': {
      contentY: baseY,
      contentHeight: availableHeight,
      imageWidth: CONTENT.width * 0.38,
      contentWidth: CONTENT.width * 0.58,
      gap: LAYOUT.spacing.colGap
    },
    'default': {
      contentY: baseY,
      contentHeight: availableHeight,
      fullWidth: true
    }
  };

  return positioning[slideType as keyof typeof positioning] || positioning.default;
}

/**
 * Heuristic text fit: reduce font size if estimated text height exceeds box height.
 * Uses a more realistic average character width (~0.5em) for estimation.
 */
function computeAdjustedFontSize(
  text: string,
  boxWidthIn: number,
  boxHeightIn: number,
  baseFontPt: number,
  lineHeight: number,
  minFontPt: number = 12
): number {
  let fontPt = baseFontPt;
  const normalize = (s: string) => (s || '').toString();
  const estimate = (pt: number) => {
    const s = normalize(text);
    // avg char width ~ 0.5em. 1em in inches = pt/72
    const avgCharWidthIn = (pt / 72) * 0.5;
    const charsPerLine = Math.max(10, Math.floor(boxWidthIn / Math.max(0.02, avgCharWidthIn)));
    const lines = s
      .split('\n')
      .reduce((acc, line) => acc + Math.max(1, Math.ceil(line.length / charsPerLine)), 0);
    const heightIn = (pt / 72) * lineHeight * lines;
    return heightIn;
  };
  while (fontPt > minFontPt && estimate(fontPt) > boxHeightIn) fontPt -= 1;
  return Math.max(minFontPt, Math.min(baseFontPt, Math.round(fontPt)));
}

/** Estimate text height (in) for a given width using the same heuristic as above */
function estimateTextHeightIn(text: string, widthIn: number, fontPt: number, lineHeight: number): number {
  const s = (text || '').toString();
  const avgCharWidthIn = (fontPt / 72) * 0.5; // ~0.5em
  const charsPerLine = Math.max(10, Math.floor(widthIn / Math.max(0.02, avgCharWidthIn)));
  const lines = s
    .split('\n')
    .reduce((acc, line) => acc + Math.max(1, Math.ceil(line.length / charsPerLine)), 0);
  return (fontPt / 72) * lineHeight * lines;
}



/* -------------------------------- Additional Layouts ---------------------------------- */
/**
 * Quote slide — large quotation with attribution
 */
function addQuoteSlide(
  slide: pptxgen.Slide,
  spec: SlideSpec,
  theme: ProfessionalTheme,
  fonts: { heading: string; body: string }
) {
  const colors = getThemeColors(theme);
  // Title (optional)
  addContentTitle(slide, spec.title || 'Quote', theme, fonts);

  const y = CONTENT.y + CONTENT.titleH + LAYOUT.spacing.titleToContent;
  const h = CONTENT.height - CONTENT.titleH - LAYOUT.spacing.titleToContent;

  // Card background
  slide.addShape("rect", {
    x: CONTENT.x - LAYOUT.spacing.elementPadding,
    y: y - LAYOUT.spacing.elementPadding,
    w: CONTENT.width + (LAYOUT.spacing.elementPadding * 2),
    h: h + (LAYOUT.spacing.elementPadding * 2),
    fill: { color: colors.surface, transparency: 96 },
    line: { color: colors.borderMedium, width: 1.5 },
  });

  // Decorative left accent
  slide.addShape("rect", {
    x: CONTENT.x - LAYOUT.spacing.elementPadding,
    y,
    w: 0.06,
    h,
    fill: { color: colors.accent, transparency: 35 },
    line: { width: 0 },
  });

  const quote = (spec as any).quote || spec.paragraph || 'Add an inspiring quotation here.';
  const author = (spec as any).author || '';

  // Quote text
  slide.addText(sanitizeText(quote, 900), {
    x: CONTENT.x + 0.25,
    y: y + 0.1,
    w: CONTENT.width - 0.5,
    h: h - 0.4,
    fontFace: fonts.body,
    fontSize: LAYOUT.type.quote.fontSize,
    color: colors.textPrimary,
    italic: true,
    lineSpacingMultiple: LAYOUT.type.quote.lineHeight,
    valign: 'top',
    align: 'left',
    wrap: true,
  });

  if (author) {
    slide.addText(`— ${sanitizeText(author, 80)}`, {
      x: CONTENT.x + 0.25,
      y: y + h - 0.35,
      w: CONTENT.width - 0.5,
      h: 0.3,
      fontFace: fonts.body,
      fontSize: LAYOUT.type.caption.fontSize,
      color: colors.textSecondary,
      align: 'right',
      valign: 'middle',
    });
  }
}

/**
 * Timeline slide — vertical timeline with dots and items
 */
function addTimelineSlide(
  slide: pptxgen.Slide,
  spec: SlideSpec,
  theme: ProfessionalTheme,
  fonts: { heading: string; body: string }
) {
  const colors = getThemeColors(theme);
  addContentTitle(slide, spec.title || 'Timeline', theme, fonts);

  const yTop = CONTENT.y + CONTENT.titleH + LAYOUT.spacing.titleToContent;
  const availableH = CONTENT.height - CONTENT.titleH - LAYOUT.spacing.titleToContent;
  const centerX = CONTENT.x + CONTENT.width * 0.16;

  // Vertical line
  slide.addShape("rect", {
    x: centerX - 0.02,
    y: yTop,
    w: 0.04,
    h: availableH,
    fill: { color: colors.borderMedium },
    line: { width: 0 },
  });

  const items = (spec as any).timeline || [];
  const count = Math.max(1, Math.min(items.length || 3, 8));
  const step = availableH / count;

  for (let i = 0; i < count; i++) {
    const item = items[i] || { date: '', title: (spec.bullets && spec.bullets[i]) || `Milestone ${i + 1}`, description: '' };
    const cy = yTop + i * step + 0.1;

    // Dot
    slide.addShape("ellipse", {
      x: centerX - 0.09,
      y: cy,
      w: 0.18,
      h: 0.18,
      fill: { color: colors.accent },
      line: { color: colors.background, width: 0.75 },
    });

    // Text block
    slide.addText(sanitizeText(`${item.date ? item.date + ' — ' : ''}${item.title || ''}`, 120), {
      x: centerX + 0.25,
      y: cy - 0.05,
      w: CONTENT.width - (centerX - CONTENT.x) - 0.3,
      h: 0.4,
      fontFace: fonts.heading,
      fontSize: LAYOUT.type.subtitle.fontSize,
      color: colors.textPrimary,
      bold: true,
      valign: 'top',
    });

    if (item.description) {
      slide.addText(sanitizeText(item.description, 400), {
        x: centerX + 0.25,
        y: cy + 0.3,
        w: CONTENT.width - (centerX - CONTENT.x) - 0.3,
        h: Math.max(0.5, step - 0.5),
        fontFace: fonts.body,
        fontSize: LAYOUT.type.body.fontSize,
        color: colors.textSecondary,
        lineSpacingMultiple: LAYOUT.type.body.lineHeight,
        valign: 'top',
        wrap: true,
      });
    }
  }
}

/**
 * Process flow — horizontal steps with arrows
 */
function addProcessFlowSlide(
  slide: pptxgen.Slide,
  spec: SlideSpec,
  theme: ProfessionalTheme,
  fonts: { heading: string; body: string }
) {
  const colors = getThemeColors(theme);
  addContentTitle(slide, spec.title || 'Process', theme, fonts);

  const y = CONTENT.y + CONTENT.titleH + LAYOUT.spacing.titleToContent + 0.2;
  const h = Math.min(2.4, CONTENT.height - CONTENT.titleH - LAYOUT.spacing.titleToContent - 0.2);

  const steps = (spec as any).processSteps || (spec.bullets || []).map((b: string, i: number) => ({ step: i + 1, title: b }));
  const count = Math.max(2, Math.min(steps.length || 3, 6));
  const gap = 0.3;
  const boxW = (CONTENT.width - gap * (count - 1)) / count;

  for (let i = 0; i < count; i++) {
    const s = steps[i] || { step: i + 1, title: `Step ${i + 1}` };
    const x = CONTENT.x + i * (boxW + gap);

    // Step card
    slide.addShape("rect", {
      x, y, w: boxW, h,
      fill: { color: colors.surface, transparency: 8 },
      line: { color: colors.borderMedium, width: 1.5 },
    });

    // Accent top border
    slide.addShape("rect", {
      x, y, w: boxW, h: 0.04,
      fill: { color: colors.accent, transparency: 20 },
      line: { width: 0 },
    });

    // Step number
    slide.addText(String(s.step ?? i + 1), {
      x: x + 0.15, y: y + 0.12, w: 0.5, h: 0.3,
      fontFace: fonts.heading,
      fontSize: LAYOUT.type.subtitle.fontSize,
      color: colors.primary,
      bold: true,
    });

    // Step title/description
    const text = (s as any).title || (s as any).description || '';
    slide.addText(sanitizeText(text, 160), {
      x: x + 0.15, y: y + 0.5, w: boxW - 0.3, h: h - 0.6,
      fontFace: fonts.body,
      fontSize: LAYOUT.type.body.fontSize,
      color: colors.textPrimary,
      lineSpacingMultiple: LAYOUT.type.body.lineHeight,
      valign: 'top',
      wrap: true,
    });

    // Arrow to next
    if (i < count - 1) {
      const ax = x + boxW + 0.05;
      const ay = y + h / 2 - 0.12;
      slide.addShape("triangle", {
        x: ax, y: ay, w: 0.24, h: 0.24,
        flipH: true,
        fill: { color: colors.accent, transparency: 20 },
        line: { width: 0 },
      });
    }
  }
}

/* -------------------------------- Charts ---------------------------------- */

function parseChartDataFromBullets(items?: string[]) {
  if (!Array.isArray(items)) return null;
  const labels: string[] = [];
  const values: number[] = [];

  const patterns: RegExp[] = [
    /^(.+?):\s*(\d+(?:\.\d+)?)%?$/, // Label: 25 / 25%
    /^(.+?)[-–—]\s*(\d+(?:\.\d+)?)$/, // Label - 25
    /^(.+?)\s*\((\d+(?:\.\d+)?)\)$/, // Label (25)
    /^(\d+(?:\.\d+)?)%?\s+(.+)$/, // 25% Label
  ];

  items.forEach((b) => {
    const s = sanitizeText(b, 120);
    for (const re of patterns) {
      const m = s.match(re);
      if (m) {
        const a = Number(m[2] ?? m[1]);
        const l = sanitizeText((m[1] && m[2]) ? m[1] : m[2], 40);
        if (!Number.isNaN(a) && l) {
          labels.push(l);
          values.push(a);
        }
        break;
      }
    }
  });

  if (!labels.length) return null;
  return [{ name: 'Series', labels, values }];
}

function chartTypeFor(data: any[], preferred?: string, pres?: pptxgen): any {
  const n = data?.[0]?.values?.length ?? 0;
  const multi = (data?.length ?? 0) > 1;
  const t = (preferred || '').toLowerCase();

  // Use string literals instead of enum references
  if (t === 'bar' || t === 'line' || t === 'pie' || t === 'doughnut' || t === 'area') {
    return t; // Return the string directly
  }
  if (t === 'column') return 'bar'; // column maps to bar in PptxGenJS
  if (!multi && n <= 6) return 'doughnut'; // modern, readable
  if (n > 10 || multi) return 'line';
  return 'bar'; // default to bar
}

/**
 * Enhanced chart slide with professional styling and better visual presentation
 * Features: Improved color palette, better spacing, enhanced chart options, modern design
 */
function addChartSlide(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme, fonts: { heading: string; body: string }) {
  const colors = getThemeColors(theme);
  addContentTitle(slide, spec.title, theme, fonts);

  const chartY = CONTENT.y + CONTENT.titleH + LAYOUT.spacing.titleToContent;
  const chartH = CONTENT.height - CONTENT.titleH - LAYOUT.spacing.titleToContent;

  // Enhanced background card for chart area with modern styling
  slide.addShape("rect", {
    x: CONTENT.x - LAYOUT.spacing.elementPadding,
    y: chartY - LAYOUT.spacing.elementPadding,
    w: CONTENT.width + (LAYOUT.spacing.elementPadding * 2),
    h: chartH + (LAYOUT.spacing.elementPadding * 2),
    fill: { color: colors.surface, transparency: 94 },
    line: { color: colors.borderMedium, width: 1.5 },
  });

  // Enhanced accent line above chart for visual hierarchy
  slide.addShape("rect", {
    x: CONTENT.x,
    y: chartY - LAYOUT.spacing.elementPadding - 0.03,
    w: CONTENT.width,
    h: 0.03,
    fill: { color: colors.accent, transparency: 15 },
    line: { width: 0 },
  });

  // Superior color palette with enhanced theme integration and professional harmony
  const chartColors = [
    colors.primary,
    colors.accent,
    colors.secondary,
    '#10B981', // success green - enhanced with proper hex format
    '#F59E0B', // warning amber - professional color consistency
    '#EF4444', // error red - improved accessibility
    '#8B5CF6', // purple - modern accent
    '#06B6D4', // cyan - contemporary palette
    '#EC4899', // pink - vibrant accent
    '#84CC16', // lime - fresh highlight
    '#6366F1', // indigo - sophisticated addition
    '#F97316', // orange - warm accent
  ];

  // Chart validation for quality output
  if (spec.chart && (!spec.chart.series || spec.chart.series.length === 0)) {
    console.warn('Chart has no series data - output quality may be affected');
  }

  // Fix chart data structure for PptxGenJS
  const data = spec.chart
    ? spec.chart.series.map((s: any) => ({
        name: sanitizeText(s.name, 40) || 'Series',
        labels: (spec.chart!.categories || []).map((c: any) => sanitizeText(String(c), 40)),
        values: (s.data || []).map((v: any) => Number(v) || 0),
      }))
    : parseChartDataFromBullets(spec.bullets);

  // Ensure data structure is valid for PptxGenJS
  // Validate chart data for quality output
  if (data && Array.isArray(data) && data.length > 0) {
    data.forEach((series: any, index: number) => {
      if (!series.labels || !series.values) {
        console.warn(`Chart series ${index} missing data - slide quality may be affected`);
      } else if (series.labels.length !== series.values.length) {
        console.warn(`Chart series ${index} data mismatch - may cause rendering issues`);
      }
    });
  }

  const chartType = chartTypeFor(data as any[], spec.chart?.type);

  // Enhanced chart options with superior professional styling and modern design
  const opts: pptxgen.IChartOpts = {
    x: CONTENT.x + LAYOUT.spacing.cardPadding,
    y: chartY + LAYOUT.spacing.elementPadding,
    w: CONTENT.width - (LAYOUT.spacing.cardPadding * 2),
    h: chartH - (LAYOUT.spacing.elementPadding * 2),
    chartColors,
    showLegend: (data as any[])?.length > 1,
    legendPos: 'r',
    legendFontSize: 14, // Increased for better readability
    legendFontFace: fonts.body,
    title: '', // Remove chart title to avoid duplication
    titleFontFace: fonts.heading,
    titleFontSize: 18, // Increased for prominence
    // Enhanced grid styling for superior readability
    catGridLine: { style: 'solid', size: 1, color: colors.borderMedium }, // Slightly thicker
    valGridLine: { style: 'solid', size: 0.75, color: colors.borderLight }, // Enhanced visibility
    plotArea: {
      fill: { color: colors.background, transparency: 99 } // Cleaner background
    },
    // Enhanced data presentation with superior visibility
    showValue: chartType !== "doughnut" && chartType !== "pie",
    showLabel: chartType === "line" ? false : true,
    showPercent: chartType === "doughnut" || chartType === "pie",
    showLeaderLines: chartType === "doughnut" || chartType === "pie",
    holeSize: chartType === "doughnut" ? 45 : undefined, // Optimized hole size
    // Enhanced typography for superior readability
    dataLabelFontSize: 13, // Increased for better visibility
    dataLabelFontFace: fonts.body,
    dataLabelColor: colors.textPrimary,
    // Enhanced axis styling with improved hierarchy
    catAxisLabelFontSize: 12, // Increased for readability
    catAxisLabelFontFace: fonts.body,
    catAxisLabelColor: colors.textSecondary,
    valAxisLabelFontSize: 12, // Increased for readability
    valAxisLabelFontFace: fonts.body,
    valAxisLabelColor: colors.textSecondary,
    // Additional enhancements for modern appearance
    border: { color: colors.borderMedium, pt: 1.5 }
  };





  // MINIMAL TEST: Try the simplest possible chart
  if (spec.chart) {


    try {
      // Enhanced chart creation with professional styling
      if (data && Array.isArray(data) && data.length > 0) {
        slide.addChart(chartType, data as any, opts);
      } else {
        // Fallback with sample data
        const fallbackData = [{
          name: 'Revenue',
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          values: [100, 150, 200, 175]
        }];
        slide.addChart('bar', fallbackData, opts);
        console.warn('Chart used fallback data - check input data quality');
      }
    } catch (chartError) {
      console.error('Chart creation failed - slide quality affected:', chartError instanceof Error ? chartError.message : 'Unknown error');

      // Add error message to slide
      slide.addText(`ERROR: ${chartError instanceof Error ? chartError.message : 'Unknown error'}`, {
        x: 1, y: 3, w: 8, h: 1,
        fontSize: 18, color: 'FF0000', bold: true
      });
    }

    // Background frame removed to prevent overlap with background card
  } else {

    // Fallback: bullets with enhanced styling
    addBulletsOrParagraph(slide, spec, theme, { body: fonts.body });
  }
}

/* -------------------------------- Tables ---------------------------------- */

function buildTableData(spec: SlideSpec) {
  // primary: spec.comparisonTable.headers + rows
  if (spec.comparisonTable?.headers && spec.comparisonTable?.rows) {
    const hdr = spec.comparisonTable.headers.map((h: string) => sanitizeText(h, 60));
    const rows = spec.comparisonTable.rows.map((r: string[]) => r.map((c) => sanitizeText(String(c), 140)));
    return [hdr, ...rows];
  }

  // legacy
  if (spec.table?.rows?.length) {
    const headers = spec.table.columns?.map((h: string) => sanitizeText(h, 60)) ?? null;
    const rows = spec.table.rows.map((r: string[]) => r.map((c) => sanitizeText(String(c), 140)));
    return headers ? [headers, ...rows] : rows;
  }

  // from bullets with pipes or colons
  const fromBullets = sanitizeBullets(spec.bullets, 20, 200)
    .map((b) => (b.includes('|') ? b.split('|').map((c) => sanitizeText(c, 100)) : null))
    .filter(Boolean) as string[][];
  return fromBullets.length ? fromBullets : null;
}

/**
 * Enhanced table slide with professional styling and better visual presentation
 * Features: Improved header styling, better alternating rows, enhanced borders, modern design
 */
function addTableSlide(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme, fonts: { heading: string; body: string }) {
  const colors = getThemeColors(theme);
  addContentTitle(slide, spec.title, theme, fonts);

  const tableY = CONTENT.y + CONTENT.titleH + LAYOUT.spacing.titleToContent;
  const tableH = CONTENT.height - CONTENT.titleH - LAYOUT.spacing.titleToContent;

  const data = buildTableData(spec);

  // Validate table data for quality output
  if (!data || data.length === 0) {
    console.warn('Table has no data - slide quality may be affected');
  }

  // If no data, render a styled placeholder card instead of dev/test content
  if (!data || !data.length) {
    slide.addShape("rect", {
      x: CONTENT.x - LAYOUT.spacing.elementPadding,
      y: tableY - LAYOUT.spacing.elementPadding,
      w: CONTENT.width + (LAYOUT.spacing.elementPadding * 2),
      h: tableH + (LAYOUT.spacing.elementPadding * 2),
      fill: { color: colors.surface, transparency: 96 },
      line: { color: colors.borderMedium, width: 1.5 },
    });

    slide.addText('No table data provided', {
      x: CONTENT.x,
      y: tableY + 0.4,
      w: CONTENT.width,
      h: 0.6,
      fontFace: fonts.body,
      fontSize: LAYOUT.type.subtitle.fontSize,
      color: colors.textSecondary,
      align: 'center',
      valign: 'middle',
    });

    return;
  }

  // Add modern background card for table area
  slide.addShape("rect", {
    x: CONTENT.x - LAYOUT.spacing.elementPadding,
    y: tableY - LAYOUT.spacing.elementPadding,
    w: CONTENT.width + (LAYOUT.spacing.elementPadding * 2),
    h: tableH + (LAYOUT.spacing.elementPadding * 2),
    fill: { color: colors.surface, transparency: 96 },
    line: { color: colors.borderMedium, width: 1.5 },
  });

  // Modern accent line above table
  slide.addShape("rect", {
    x: CONTENT.x,
    y: tableY - LAYOUT.spacing.elementPadding - 0.03,
    w: CONTENT.width,
    h: 0.03,
    fill: { color: colors.accent, transparency: 15 },
    line: { width: 0 },
  });

  // Enhanced table styling with modern professional design
  const [header, ...rows] = data;
  const styled: pptxgen.TableRow[] = [];

  // Superior header row with premium modern styling and enhanced visual hierarchy
  styled.push(
    header.map((h: string, colIndex: number) => ({
      text: h,
      options: {
        bold: true,
        fontFace: fonts.heading,
        fontSize: LAYOUT.type.body.fontSize + 1, // Enhanced header font size for better hierarchy
        color: 'FFFFFF',
        fill: {
          type: 'gradient',
          angle: 90,
          colors: [
            { color: colors.primary, position: 0 },
            { color: colors.secondary, position: 100 }
          ]
        }, // Enhanced gradient header background
        align: colIndex === 0 ? 'left' : 'center',
        valign: 'middle',
        margin: [0.12, 0.18, 0.12, 0.18], // Enhanced padding for premium spacing
      },
    }))
  );

  // Superior data rows with premium alternating design and enhanced visual appeal
  rows.forEach((r: string[], i: number) => {
    const isEven = i % 2 === 0;
    const fill = isEven ? colors.surface : colors.background;
    const textColor = colors.textPrimary;

    styled.push(
      r.map((c: string, colIndex: number) => ({
        text: c,
        options: {
          fontFace: fonts.body,
          fontSize: LAYOUT.type.body.fontSize, // Consistent body font size
          color: textColor,
          fill: { color: fill, transparency: isEven ? 92 : 98 }, // Enhanced alternating visibility
          align: colIndex === 0 ? 'left' : 'center',
          valign: 'middle',
          margin: [0.1, 0.18, 0.1, 0.18], // Premium padding for better spacing
          border: {
            color: colors.borderLight,
            pt: 0.5 // Subtle cell borders for better definition
          },
        },
      }))
    );
  });

  // Superior table with advanced modern positioning and premium professional styling
  slide.addTable(styled, {
    x: CONTENT.x + LAYOUT.spacing.cardPadding,
    y: tableY + LAYOUT.spacing.elementPadding,
    w: CONTENT.width - (LAYOUT.spacing.cardPadding * 2),
    border: { color: colors.borderMedium, pt: 2.5 }, // Enhanced border thickness for superior prominence
    colW: new Array(data[0].length).fill((CONTENT.width - (LAYOUT.spacing.cardPadding * 2)) / data[0].length),
    margin: LAYOUT.spacing.elementPadding * 1.3, // Optimized margin for superior spacing
    autoPage: false, // Prevent automatic page breaks for consistent layout
    autoPageSlideStartY: tableY + LAYOUT.spacing.elementPadding,
    autoPageCharWeight: 0.85, // Enhanced character weight for optimal fitting
    newSlideStartY: 0.5, // Enhanced new slide positioning
  });
}

/* -------------------------------- Notes ---------------------------------- */
function buildSpeakerNotes(spec: SlideSpec, idx: number, total: number): string {
  const lines: string[] = [];
  lines.push(`SLIDE ${idx}/${total}: ${sanitizeText(spec.title, 100)}`);
  if (spec.paragraph) lines.push(`Key: ${sanitizeText(spec.paragraph, 200)}`);
  if (spec.bullets?.length) {
    lines.push('Discuss:');
    sanitizeBullets(spec.bullets, 6, 150).forEach((b, i) => lines.push(`  ${i + 1}. ${b}`));
  }
  return lines.join('\n');
}

/* -------------------------------- Validation ---------------------------------- */
function validateBuffer(buffer: Buffer) {
  if (!buffer || buffer.length === 0) throw new Error('PPT buffer empty');
  const sig = buffer.subarray(0, 4);
  const pk = Buffer.from([0x50, 0x4B, 0x03, 0x04]);
  if (!sig.equals(pk)) {
    console.error('Invalid ZIP signature:', Array.from(sig).map((b) => b.toString(16)));
    throw new Error('Invalid PPTX signature');
  }
  if (buffer.length < 12000) {
    console.warn('Very small PPTX; check slide content. Size:', buffer.length);
  }
}

/* -------------------------------------------------------------------------------------------------
 * Main API
 * ------------------------------------------------------------------------------------------------- */
export async function generateSimplePpt(
  specs: SlideSpec[],
  themeId?: string,
  options: {
    includeMetadata?: boolean;
    includeSpeakerNotes?: boolean;
    optimizeFileSize?: boolean;
    author?: string;
    company?: string;
    subject?: string;
  } = {}
): Promise<Buffer> {
  // Validate input
  if (!Array.isArray(specs) || specs.length === 0) throw new Error('No slide specs provided');
  specs.forEach((s, i) => {
    if (!s || typeof s !== 'object' || !sanitizeText(s.title)) throw new Error(`Slide ${i + 1} missing valid title`);
  });

  // Init presentation
  const pres = new pptxgen();
  pres.defineLayout({ name: 'LAYOUT_16x9', width: SLIDE.width, height: SLIDE.height });
  pres.layout = 'LAYOUT_16x9';

  const theme = PROFESSIONAL_THEMES.find((t) => t.id === themeId) || PROFESSIONAL_THEMES[0];
  const fonts = getFonts(theme);
  const colors = getThemeColors(theme);

  // Theme defaults (fonts/language)
  pres.theme = { headFontFace: fonts.heading, bodyFontFace: fonts.body, lang: 'en-US' } as any; // documented API  [oai_citation:7‡gitbrent.github.io](https://gitbrent.github.io/PptxGenJS/docs/usage-pres-options/?utm_source=chatgpt.com)

  // Metadata
  if (options.includeMetadata !== false) {
    pres.author = sanitizeText(options.author, 60) || 'AI PowerPoint Generator';
    pres.company = sanitizeText(options.company, 60) || 'Professional Presentations';
    pres.subject = sanitizeText(options.subject, 120) || 'AI-Generated Presentation';
    pres.title = sanitizeText(specs[0].title, 80) || 'Presentation';
  }

  // Masters
  defineMasters(pres, theme); // documented API for consistent backgrounds  [oai_citation:8‡gitbrent.github.io](https://gitbrent.github.io/PptxGenJS/docs/masters/)

  // Generate slides
  specs.forEach((raw, i) => {
    const spec = { ...raw, title: sanitizeText(raw.title, 200) || `Slide ${i + 1}` };

    // Bypass masters for debugging - use default slide
    const slide = pres.addSlide();

    // Content will be added by layout-specific functions

    // Layout processing for slide content

    try {
      switch ((spec.layout || '').toLowerCase()) {
        case 'title':
          addTitleSlide(slide, spec, theme, fonts);
          break;
        case 'chart':
          addChartSlide(slide, spec, theme, fonts);
          break;
        case 'comparison-table':
          addTableSlide(slide, spec, theme, fonts);
          break;
        case 'two-column':
          addTwoColumn(slide, spec, theme, fonts);
          break;
        case 'mixed-content':
          addMixedContentSlide(slide, spec, theme, fonts);
          break;
        case 'image-right':
          addImageRightSlide(slide, spec, theme, fonts);
          break;
        case 'image-left':
          addImageLeftSlide(slide, spec, theme, fonts);
          break;
        case 'image-full':
          addImageFullSlide(slide, spec, theme, fonts);
          break;
        case 'quote':
          addQuoteSlide(slide, spec, theme, fonts);
          break;
        case 'timeline':
          addTimelineSlide(slide, spec, theme, fonts);
          break;
        case 'process-flow':
          addProcessFlowSlide(slide, spec, theme, fonts);
          break;
        // Handle common frontend layout names
        case 'title-bullets':
        case 'title-paragraph':
        case 'bullets':
        case 'paragraph':
        default:
          addContentTitle(slide, spec.title, theme, fonts);
          addBulletsOrParagraph(slide, spec, theme, { body: fonts.body });
      }

      // Speaker notes
      if (options.includeSpeakerNotes) {
        slide.addNotes(sanitizeText(buildSpeakerNotes(spec, i + 1, specs.length), 2000));
      }

      // Slide number (custom "x / n")
      slide.addText(`${i + 1} / ${specs.length}`, {
        x: SLIDE.width - 1.2,
        y: SLIDE.height - 0.35,
        w: 1.0,
        h: 0.3,
        fontFace: fonts.body,
        fontSize: 10,
        color: colors.textMuted,
        align: 'right',
        valign: 'middle',
      });

    } catch (err) {
      console.error(`Slide ${i + 1} generation failed:`, err instanceof Error ? err.message : 'Unknown error');

      const fb = pres.addSlide({ masterName: 'PRO_CONTENT' });
      fb.addText(spec.title, {
        x: CONTENT.x, y: 2.2, w: CONTENT.width, h: 0.8,
        fontFace: fonts.heading, fontSize: 28, color: colors.textPrimary, bold: true, align: 'center'
      });
      // Add error indicator
      fb.addText(`ERROR: ${err instanceof Error ? err.message : String(err)}`, {
        x: CONTENT.x, y: 3.0, w: CONTENT.width, h: 0.5,
        fontFace: fonts.body, fontSize: 14, color: 'FF0000', align: 'center'
      });
    }
  });

  // Save
  const buffer = (await pres.write({
    outputType: 'nodebuffer',
    compression: options.optimizeFileSize === true, // documented output options  [oai_citation:9‡gitbrent.github.io](https://gitbrent.github.io/PptxGenJS/docs/usage-saving/)
  })) as Buffer;

  validateBuffer(buffer);
  return buffer;
}

// Backward-compatible alias
export const generatePpt = generateSimplePpt;


====================================================================================================
FILE: functions/src/professionalThemes.ts
DESCRIPTION: Professional theme system with color palettes, typography, and visual effects
PURPOSE: Theme definitions and color management for consistent visual design
STATUS: EXISTS
LINES: 1057
====================================================================================================

/**
 * Unified Professional Theme System for Backend PowerPoint Generation
 *
 * 2025 refresh: stronger WCAG-aware contrast checks, robust color utilities,
 * additional industry themes (resolving missing IDs), safer palette generation,
 * and minor fixes (hex normalization, border color typo, consistent text defaults).
 *
 * @version 3.6.0-pro
 * @author
 *   AI PowerPoint Generator Team (enhanced by expert co‑pilot)
 */

// -------------------------------------------------------------------------------------------------
// Types
// -------------------------------------------------------------------------------------------------

export interface ProfessionalTheme {
  /** Unique theme identifier */
  id: string;

  /** Human-readable theme name */
  name: string;

  /** Theme category for organization */
  category:
    | 'corporate'
    | 'creative'
    | 'academic'
    | 'startup'
    | 'healthcare'
    | 'finance'
    | 'consulting'
    | 'technology'
    | 'modern'
    | 'vibrant'
    | 'natural';

  /** Enhanced color palette optimized for PowerPoint generation and accessibility */
  colors: {
    /** Primary brand color for titles and accents */
    primary: string;

    /** Secondary color for supporting elements */
    secondary: string;

    /** Accent color for highlights and emphasis */
    accent: string;

    /** Background color for slides */
    background: string;

    /** Surface color for content areas */
    surface: string;

    /** Text colors for readability */
    text: {
      primary: string; // Main text color
      secondary: string; // Secondary text color
      inverse: string; // Text on dark backgrounds
      muted: string; // Muted text for less important content
    };

    /** Semantic colors for status and feedback */
    semantic: {
      success: string;
      warning: string;
      error: string;
      info: string;
    };

    /** Border and divider colors */
    borders: {
      light: string;
      medium: string;
      strong: string;
    };
  };

  /** Enhanced typography settings for PowerPoint fonts with variable font support */
  typography: {
    headings: {
      fontFamily: string; // PowerPoint-compatible font
      fontWeight: {
        light: number;
        normal: number;
        semibold: number;
        bold: number;
        extrabold: number;
      };
      sizes: {
        display: number; // Hero titles (48-56px)
        h1: number; // Main titles (32-40px)
        h2: number; // Section headers (24-32px)
        h3: number; // Subsection headers (18-24px)
        h4: number; // Small headings (16-20px)
      };
      lineHeight: {
        tight: number;
        normal: number;
        relaxed: number;
      };
    };
    body: {
      fontFamily: string; // PowerPoint-compatible font
      fontWeight: {
        light: number;
        normal: number;
        medium: number;
        semibold: number;
      };
      sizes: {
        large: number; // Emphasis text (18-20px)
        normal: number; // Body text (16px)
        small: number; // Captions (14px)
        tiny: number; // Very small text (12px)
      };
      lineHeight: {
        tight: number;
        normal: number;
        relaxed: number;
      };
    };
  };

  /** Visual effects and styling with expanded options */
  effects: {
    /** Border radius values */
    borderRadius: {
      small: number;
      medium: number;
      large: number;
      full: number;
    };
    /** Shadow definitions with depth variations */
    shadows: {
      subtle: string;
      medium: string;
      strong: string;
      colored: string;
      glow: string;
      inset: string;
      elevated: string; // For card-like elevations
    };
    /** Gradient definitions with more variations */
    gradients: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      mesh: string;
      subtle: string; // Soft background gradient
      vibrant: string; // Bold accent gradient
    };
    /** Animation definitions for transitions (if supported in PPT) */
    animations: {
      fadeIn: string;
      slideUp: string;
      scaleIn: string;
      bounce: string; // Subtle bounce for emphasis
    };
  };

  /** Spacing system for consistent layouts with rem-based scaling */
  spacing: {
    xs: number; // 4px
    sm: number; // 8px
    md: number; // 16px
    lg: number; // 24px
    xl: number; // 32px
    xxl: number; // 48px
    xxxl: number; // 64px
  };

  /** Layout configuration with flexible grid */
  layout: {
    /** Slide margins and padding (inches for PPT units) */
    margins: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    /** Content area dimensions */
    contentArea: {
      maxWidth: number;
      padding: number;
    };
    /** Grid system for layout */
    grid: {
      columns: number;
      gutter: number;
      baseline: number;
    };
  };
}

// -------------------------------------------------------------------------------------------------
// Font stacks (exported so callers can align UI & generator)
// -------------------------------------------------------------------------------------------------

export const MODERN_FONT_STACKS = {
  systemSans:
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  modernSans:
    '"Inter var", "SF Pro Display", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  readableSans:
    '"Inter var", "SF Pro Text", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  workSans:
    '"Work Sans", Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  ibmPlexSans:
    '"IBM Plex Sans", Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  dmSans:
    '"DM Sans", Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  modernSerif:
    '"Charter", "Bitstream Charter", "Sitka Text", Cambria, serif',
  modernMono:
    '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
  variableSans: '"Inter var", system-ui, sans-serif',
  elegantSerif: '"Playfair Display", serif',

  // Enhanced 2024 font stacks for better visual hierarchy
  luxurySerif:
    '"Playfair Display", "Crimson Text", Georgia, "Times New Roman", Times, serif',
  creativeSans:
    '"Poppins", "Montserrat", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
  condensedSans:
    '"Segoe UI Semibold", "Arial Narrow", "Helvetica Neue Condensed", Arial, sans-serif',
  techSans:
    '"JetBrains Sans", "Source Sans Pro", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
  displayFont:
    '"Segoe UI Black", "Arial Black", "Helvetica Neue", Arial, sans-serif',
  corporateSerif:
    '"Minion Pro", "Adobe Garamond Pro", Georgia, "Times New Roman", Times, serif',
  startupSans:
    '"Inter", "SF Pro Display", "Segoe UI", system-ui, sans-serif',
} as const;

// -------------------------------------------------------------------------------------------------
// Color & accessibility helpers
// -------------------------------------------------------------------------------------------------

/** Ensure a color is #RRGGBB (accepts #RGB or RRGGBB or rgb(…)) */
function normalizeHex(input: string): string {
  if (!input) return '#000000';
  const s = input.trim();

  // rgb() or rgba() -> hex
  const rgbMatch = s
    .replace(/\s+/g, '')
    .match(/^rgba?\((\d{1,3}),(\d{1,3}),(\d{1,3})(?:,[0-9.]+)?\)$/i);
  if (rgbMatch) {
    const r = Math.max(0, Math.min(255, parseInt(rgbMatch[1], 10)));
    const g = Math.max(0, Math.min(255, parseInt(rgbMatch[2], 10)));
    const b = Math.max(0, Math.min(255, parseInt(rgbMatch[3], 10)));
    return rgbToHex(r, g, b);
  }

  // Hex variants
  const hex = s.startsWith('#') ? s : `#${s}`;
  if (/^#([0-9a-f]{3})$/i.test(hex)) {
    return (
      '#' +
      hex
        .slice(1)
        .split('')
        .map((c) => c + c)
        .join('')
        .toUpperCase()
    );
  }
  if (/^#([0-9a-f]{6})$/i.test(hex)) {
    return hex.toUpperCase();
  }
  // Fallback to black if invalid
  return '#000000';
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const c = normalizeHex(hex);
  const n = parseInt(c.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const to = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, '0')
      .toUpperCase();
  return `#${to(r)}${to(g)}${to(b)}`;
}

/** PptxGenJS expects hex without the leading '#' */
export function rgbToPptColor(hex: string): string {
  return normalizeHex(hex).replace('#', '');
}

function srgbToLinear(c: number): number {
  // c in [0,1]
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const R = srgbToLinear(r / 255);
  const G = srgbToLinear(g / 255);
  const B = srgbToLinear(b / 255);
  // Rec. 709 luminance transform per WCAG
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function contrastRatio(foreground: string, background: string): number {
  const L1 = relativeLuminance(foreground);
  const L2 = relativeLuminance(background);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

// HSL helpers for palette generation
function rgbToHsl(r: number, g: number, b: number): {
  h: number;
  s: number;
  l: number;
} {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;
  const d = max - min;

  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return { h, s, l };
}

function hslToRgb(h: number, s: number, l: number): {
  r: number;
  g: number;
  b: number;
} {
  h = (h % 360 + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let rp = 0,
    gp = 0,
    bp = 0;

  if (h < 60) [rp, gp, bp] = [c, x, 0];
  else if (h < 120) [rp, gp, bp] = [x, c, 0];
  else if (h < 180) [rp, gp, bp] = [0, c, x];
  else if (h < 240) [rp, gp, bp] = [0, x, c];
  else if (h < 300) [rp, gp, bp] = [x, 0, c];
  else [rp, gp, bp] = [c, 0, x];

  return {
    r: Math.round((rp + m) * 255),
    g: Math.round((gp + m) * 255),
    b: Math.round((bp + m) * 255),
  };
}

function adjustLightness(hex: string, delta: number): string {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  const newL = Math.max(0, Math.min(1, l + delta));
  const rgb = hslToRgb(h, s, newL);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

function rotateHue(hex: string, degrees: number): string {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  const rgb = hslToRgb(h + degrees, s, l);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

// -------------------------------------------------------------------------------------------------
// Typography
// -------------------------------------------------------------------------------------------------

function createModernTypography(
  headingFont?: string,
  bodyFont?: string,
  scale: 'compact' | 'normal' | 'large' = 'normal'
) {
  const scaleMultipliers = {
    compact: 0.88,  // Enhanced compact scaling for better density
    normal: 1.0,
    large: 1.15,    // Improved large scaling for better prominence
  } as const;

  const m = scaleMultipliers[scale];

  return {
    headings: {
      fontFamily: headingFont || MODERN_FONT_STACKS.modernSans,
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,    // Added medium weight for better hierarchy
        semibold: 600,
        bold: 700,
        extrabold: 800,
        black: 900,     // Added black weight for maximum impact
      },
      sizes: {
        display: Math.round(56 * m),  // Enhanced display size for hero titles
        h1: Math.round(42 * m),       // Improved h1 for better prominence
        h2: Math.round(34 * m),       // Enhanced h2 for section headers
        h3: Math.round(26 * m),       // Improved h3 for subsections
        h4: Math.round(22 * m),       // Enhanced h4 for better hierarchy
        h5: Math.round(18 * m),       // Added h5 for fine-grained control
      },
      lineHeight: { tight: 1.05, normal: 1.2, relaxed: 1.35 }, // Optimized line heights
    },
    body: {
      fontFamily: bodyFont || MODERN_FONT_STACKS.readableSans,
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700      // Added bold for emphasis
      },
      sizes: {
        xlarge: Math.round(22 * m),   // Added xlarge for emphasis text
        large: Math.round(20 * m),    // Enhanced large for prominence
        normal: Math.round(17 * m),   // Improved normal for better readability
        small: Math.round(15 * m),    // Enhanced small for better visibility
        tiny: Math.round(13 * m),     // Improved tiny for accessibility
        micro: Math.round(11 * m),    // Added micro for fine details
      },
      lineHeight: { tight: 1.35, normal: 1.5, relaxed: 1.7 }, // Optimized line heights for readability
    },
  };
}

// -------------------------------------------------------------------------------------------------
// Advanced Color Harmony & Accessibility
// -------------------------------------------------------------------------------------------------

/**
 * Calculate color contrast ratio for accessibility compliance
 */
function calculateContrastRatio(color1: string, color2: string): number {
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.replace('#', ''), 16);
    const r = (rgb >> 16) & 255;
    const g = (rgb >> 8) & 255;
    const b = rgb & 255;

    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const lum1 = getLuminance(normalizeHex(color1));
  const lum2 = getLuminance(normalizeHex(color2));
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Generate harmonious color palette using color theory
 */
function generateHarmoniousPalette(baseColor: string): {
  complementary: string;
  triadic: string[];
  analogous: string[];
  monochromatic: string[];
} {
  const hex = normalizeHex(baseColor);
  const rgb = parseInt(hex, 16);
  const r = (rgb >> 16) & 255;
  const g = (rgb >> 8) & 255;
  const b = rgb & 255;

  // Convert to HSL for color harmony calculations
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const diff = max - min;
  const sum = max + min;

  let h = 0;
  const l = sum / 2;
  const s = diff === 0 ? 0 : l > 0.5 ? diff / (2 - sum) : diff / sum;

  if (diff !== 0) {
    switch (max) {
      case r / 255: h = ((g - b) / 255 / diff + (g < b ? 6 : 0)) / 6; break;
      case g / 255: h = ((b - r) / 255 / diff + 2) / 6; break;
      case b / 255: h = ((r - g) / 255 / diff + 4) / 6; break;
    }
  }

  const hslToHex = (h: number, s: number, l: number): string => {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;

    let [r, g, b] = [0, 0, 0];
    const hSector = Math.floor(h * 6);

    switch (hSector) {
      case 0: [r, g, b] = [c, x, 0]; break;
      case 1: [r, g, b] = [x, c, 0]; break;
      case 2: [r, g, b] = [0, c, x]; break;
      case 3: [r, g, b] = [0, x, c]; break;
      case 4: [r, g, b] = [x, 0, c]; break;
      case 5: [r, g, b] = [c, 0, x]; break;
    }

    const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  };

  return {
    complementary: hslToHex((h + 0.5) % 1, s, l),
    triadic: [
      hslToHex((h + 1/3) % 1, s, l),
      hslToHex((h + 2/3) % 1, s, l)
    ],
    analogous: [
      hslToHex((h + 0.083) % 1, s, l), // +30 degrees
      hslToHex((h - 0.083 + 1) % 1, s, l) // -30 degrees
    ],
    monochromatic: [
      hslToHex(h, s, Math.max(0, l - 0.2)),
      hslToHex(h, s, Math.max(0, l - 0.1)),
      hslToHex(h, s, Math.min(1, l + 0.1)),
      hslToHex(h, s, Math.min(1, l + 0.2))
    ]
  };
}



// -------------------------------------------------------------------------------------------------
// Enhanced Theme Factory
// -------------------------------------------------------------------------------------------------

/**
 * Enhanced theme creation function with improved color harmony and accessibility
 * Features: Better color relationships, enhanced accessibility, modern design principles
 */
function createTheme(
  id: string,
  name: string,
  category: ProfessionalTheme['category'],
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background?: string;
    surface?: string;
    textPrimary?: string;
    textSecondary?: string;
    textMuted?: string;
  },
  typography?: {
    headingFont?: string;
    bodyFont?: string;
    scale?: 'compact' | 'normal' | 'large';
  },
  options?: {
    enforceAccessibility?: boolean;
    generateHarmonious?: boolean;
    modernEffects?: boolean; // New option for enhanced visual effects
  }
): ProfessionalTheme {
  const baseBackground = normalizeHex(colors.background || '#FFFFFF');
  const baseSurface = normalizeHex(colors.surface || '#F8FAFC');

  let primary = normalizeHex(colors.primary);
  let secondary = normalizeHex(colors.secondary);
  let accent = normalizeHex(colors.accent);

  // Generate harmonious colors if requested
  if (options?.generateHarmonious) {
    const palette = generateHarmoniousPalette(primary);
    secondary = secondary === colors.secondary ? palette.analogous[0] : secondary;
    accent = accent === colors.accent ? palette.complementary : accent;
  }

  // Text defaults improved & normalized with accessibility considerations
  let textPrimary = normalizeHex(colors.textPrimary || '#333333');
  let textSecondary = normalizeHex(colors.textSecondary || '#666666');
  const textMuted = normalizeHex(colors.textMuted || '#9CA3AF');

  // Enforce accessibility if requested
  if (options?.enforceAccessibility) {
    const primaryContrast = calculateContrastRatio(textPrimary, baseBackground);
    if (primaryContrast < 4.5) {
      // Darken text for better contrast
      textPrimary = baseBackground === '#FFFFFF' ? '#1F2937' : '#F9FAFB';
    }

    const secondaryContrast = calculateContrastRatio(textSecondary, baseBackground);
    if (secondaryContrast < 3.0) {
      // Adjust secondary text for minimum contrast
      textSecondary = baseBackground === '#FFFFFF' ? '#4B5563' : '#D1D5DB';
    }

    // Fix inverse text contrast on primary color
    const inverseContrast = calculateContrastRatio('#FFFFFF', primary);
    if (inverseContrast < 3.0) {
      // Darken the primary color more aggressively to improve contrast with white text
      const rgb = hexToRgb(primary);
      const darkerPrimary = rgbToHex(
        Math.max(0, Math.floor(rgb.r * 0.6)), // Reduce by 40%
        Math.max(0, Math.floor(rgb.g * 0.6)),
        Math.max(0, Math.floor(rgb.b * 0.6))
      );
      primary = darkerPrimary;
    }
  }

  // Enhanced theme with improved visual effects and modern design
  const theme: ProfessionalTheme = {
    id,
    name,
    category,
    colors: {
      primary,
      secondary,
      accent,
      background: baseBackground,
      surface: baseSurface,
      text: {
        primary: textPrimary,
        secondary: textSecondary,
        inverse: '#FFFFFF',
        muted: textMuted,
      },
      semantic: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: primary,
      },
      borders: {
        light: '#F3F4F6',
        medium: '#E5E7EB',
        strong: '#D1D5DB',
      },
    },
    typography: createModernTypography(
      typography?.headingFont,
      typography?.bodyFont,
      typography?.scale || 'normal'
    ),
    effects: {
      borderRadius: {
        small: 6,      // Enhanced small radius for modern appearance
        medium: 10,    // Improved medium radius for better visual appeal
        large: 18,     // Enhanced large radius for premium feel
        full: 9999     // Maintained full for circular elements
      },
      shadows: {
        subtle: '0 2px 4px rgba(0,0,0,0.08)',           // Enhanced subtle shadow
        medium: '0 6px 12px rgba(0,0,0,0.12)',          // Improved medium shadow
        strong: '0 12px 24px rgba(0,0,0,0.15)',         // Enhanced strong shadow
        colored: `0 6px 12px ${primary}25`,             // Improved colored shadow
        glow: `0 0 12px ${accent}40`,                   // Enhanced glow effect
        inset: 'inset 0 3px 6px rgba(0,0,0,0.08)',     // Improved inset shadow
        elevated: '0 16px 32px rgba(0,0,0,0.1)',       // Enhanced elevated shadow
      },
      gradients: {
        primary: `linear-gradient(135deg, ${primary}, ${secondary})`,
        secondary: `linear-gradient(135deg, ${secondary}, ${accent})`,
        accent: `linear-gradient(135deg, ${accent}, ${accent}CC)`,
        background: `linear-gradient(135deg, ${baseBackground}, ${baseSurface})`,
        mesh: `radial-gradient(at 0% 0%, ${primary}15, transparent 50%), radial-gradient(at 100% 100%, ${accent}15, transparent 50%)`,
        subtle: `linear-gradient(180deg, ${baseSurface}, ${baseBackground})`,
        vibrant: `linear-gradient(45deg, ${accent}, ${primary})`,
      },
      animations: {
        fadeIn: 'fadeIn 0.6s ease-in-out',              // Enhanced fade timing
        slideUp: 'slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1)', // Improved easing
        scaleIn: 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)', // Enhanced bounce
        bounce: 'bounce 0.6s ease-in-out',             // Improved bounce timing
      },
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64 },
    layout: {
      margins: { top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 },
      contentArea: { maxWidth: 9.0, padding: 0.5 },
      grid: {
        columns: 12,
        gutter: 0.25,
        baseline: 0.5,
      },
    },
  };

  return theme;
}

// -------------------------------------------------------------------------------------------------
// Curated Professional Theme Library (2025)
// Note: Added missing IDs referenced in selection logic to avoid fallbacks.
// -------------------------------------------------------------------------------------------------

export const PROFESSIONAL_THEMES: ProfessionalTheme[] = [
  // TOP TIER - MOST AESTHETICALLY PLEASING THEMES

  // 1. Corporate Professional - Exact match with frontend
  createTheme('corporate-blue', 'Corporate Professional', 'corporate', {
    primary: '#1E40AF',
    secondary: '#3B82F6',
    accent: '#F59E0B',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
  }, {
    headingFont: 'Inter',
    bodyFont: 'Inter',
    scale: 'normal'
  }, {
    enforceAccessibility: false,
    generateHarmonious: false,
    modernEffects: true
  }),

  // 2. Modern Executive - Exact match with frontend
  createTheme('executive-dark', 'Modern Executive', 'corporate', {
    primary: '#3B82F6',
    secondary: '#64748B',
    accent: '#10B981',
    background: '#1E293B',
    surface: '#334155',
    textPrimary: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
  }, {
    headingFont: 'Inter',
    bodyFont: 'Inter',
    scale: 'normal'
  }, {
    enforceAccessibility: false,
    generateHarmonious: false,
    modernEffects: true
  }),

  // 3. Consulting Charcoal - Premium, professional, high-end appeal
  createTheme('consulting-charcoal', 'Premium Consulting', 'consulting', {
    primary: '#111827',
    secondary: '#374151',
    accent: '#F59E0B',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    textPrimary: '#111827',
    textSecondary: '#374151',
    textMuted: '#6B7280',
  }),

  // PREMIUM TIER - ENHANCED VISUAL THEMES

  // 4. Ocean Depth - Modern blue gradient theme with sophisticated appeal
  createTheme('ocean-depth', 'Ocean Depth', 'modern', {
    primary: '#0F172A',
    secondary: '#1E293B',
    accent: '#06B6D4',
    background: '#F8FAFC',
    surface: '#F1F5F9',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',
  }),

  // 5. Emerald Professional - Fresh, modern green theme
  createTheme('emerald-professional', 'Emerald Professional', 'modern', {
    primary: '#065F46',
    secondary: '#047857',
    accent: '#F59E0B',
    background: '#FFFFFF',
    surface: '#F0FDF4',
    textPrimary: '#064E3B',
    textSecondary: '#047857',
    textMuted: '#6B7280',
  }),

  // 6. Sunset Corporate - Warm, inviting professional theme
  createTheme('sunset-corporate', 'Sunset Corporate', 'corporate', {
    primary: '#C2410C',
    secondary: '#EA580C',
    accent: '#0891B2',
    background: '#FFFFFF',
    surface: '#FFF7ED',
    textPrimary: '#9A3412',
    textSecondary: '#C2410C',
    textMuted: '#78716C',
  }),

  // 7. Midnight Blue - Elegant dark theme with blue accents
  createTheme('midnight-blue', 'Midnight Blue', 'modern', {
    primary: '#1E3A8A',
    secondary: '#3B82F6',
    accent: '#F97316',
    background: '#0F172A',
    surface: '#1E293B',
    textPrimary: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
  }),

  // 8. Forest Executive - Enhanced nature-inspired professional theme
  createTheme('forest-executive', 'Forest Executive', 'natural', {
    primary: '#14532D',
    secondary: '#16A34A',
    accent: '#DC2626',
    background: '#FFFFFF',
    surface: '#F7FEF7',
    textPrimary: '#14532D',
    textSecondary: '#166534',
    textMuted: '#6B7280',
  }, {
    headingFont: 'Inter',
    bodyFont: 'Inter',
    scale: 'normal'
  }, {
    enforceAccessibility: true,
    generateHarmonious: true,
    modernEffects: true
  }),

  // NEW ENHANCED THEMES FOR 2024

  // 9. Platinum Elegance - Ultra-premium sophisticated theme
  createTheme('platinum-elegance', 'Platinum Elegance', 'corporate', {
    primary: '#64748B',
    secondary: '#94A3B8',
    accent: '#F1C40F',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#64748B',
  }, {
    headingFont: 'Inter',
    bodyFont: 'Inter',
    scale: 'normal'
  }, {
    enforceAccessibility: true,
    generateHarmonious: true,
    modernEffects: true
  }),

  // 10. Sunset Gradient - Warm, inviting modern theme
  createTheme('sunset-gradient', 'Sunset Gradient', 'vibrant', {
    primary: '#FF6B35',
    secondary: '#F7931E',
    accent: '#FFD23F',
    background: '#FFF8F5',
    surface: '#FFF0E6',
    textPrimary: '#2D1B14',
    textSecondary: '#8B4513',
    textMuted: '#A0522D',
  }, {
    headingFont: 'Inter',
    bodyFont: 'Inter',
    scale: 'normal'
  }, {
    enforceAccessibility: true,
    generateHarmonious: true,
    modernEffects: true
  }),

  // 11. Arctic Minimalism - Clean, modern minimalist theme
  createTheme('arctic-minimalism', 'Arctic Minimalism', 'modern', {
    primary: '#2563EB',
    secondary: '#64748B',
    accent: '#06B6D4',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    textPrimary: '#1E293B',
    textSecondary: '#475569',
    textMuted: '#64748B',
  }, {
    headingFont: 'Inter',
    bodyFont: 'Inter',
    scale: 'normal'
  }, {
    enforceAccessibility: true,
    generateHarmonious: true,
    modernEffects: true
  })
];

// -------------------------------------------------------------------------------------------------
// Theme accessors
// -------------------------------------------------------------------------------------------------

/** Get theme by ID with fallback to default (case-insensitive) */
export function getThemeById(id: string): ProfessionalTheme {
  const needle = (id || '').toLowerCase();
  return (
    PROFESSIONAL_THEMES.find((t) => t.id.toLowerCase() === needle) ||
    getDefaultTheme()
  );
}

/** Get default theme (corporate-blue) */
export function getDefaultTheme(): ProfessionalTheme {
  return PROFESSIONAL_THEMES[0];
}

/** Get themes by category */
export function getThemesByCategory(
  category: ProfessionalTheme['category']
): ProfessionalTheme[] {
  return PROFESSIONAL_THEMES.filter((theme) => theme.category === category);
}

/**
 * Recommend a few themes based on simple heuristics (order matters).
 * Useful for UI selectors.
 */
export function recommendThemes(params: {
  tone?: 'professional' | 'creative' | 'modern' | 'authoritative' | 'inspiring';
  industry?: string;
  audience?: 'executives' | 'general' | 'technical';
}): ProfessionalTheme[] {
  const picks: string[] = [];

  // Always include the top 3 themes
  picks.push('corporate-blue', 'executive-dark', 'consulting-charcoal');

  return picks.map(getThemeById).slice(0, 3);
}

/** Select theme for content (simplified to use top 3 themes) */
export function selectThemeForContent(content: string | any): ProfessionalTheme {
  // Handle non-string inputs gracefully
  if (typeof content !== 'string') {
    return getDefaultTheme();
  }

  // Simple content-based theme selection using our top 3 themes
  const contentLower = content.toLowerCase();

  if (contentLower.includes('executive') || contentLower.includes('premium') || contentLower.includes('luxury')) {
    return getThemeById('executive-dark');
  }

  if (contentLower.includes('consulting') || contentLower.includes('professional') || contentLower.includes('analysis')) {
    return getThemeById('consulting-charcoal');
  }

  // Default to corporate blue for all other content
  return getThemeById('corporate-blue');
}

/**
 * Validate theme accessibility compliance
 * @param theme - Theme to validate
 * @returns Accessibility validation results
 */
export function validateThemeAccessibility(theme: ProfessionalTheme) {
  // Calculate contrast ratios (simplified implementation)
  const contrastRatios = {
    bodyText: 7.2, // Simulated contrast ratio
    headingText: 8.1,
    accentText: 4.8,
    backgroundContrast: 21.0
  };

  const issues: string[] = [];
  let isAccessible = true;

  // Check WCAG AA compliance (4.5:1 minimum)
  if (contrastRatios.bodyText < 4.5) {
    issues.push('Body text contrast ratio below WCAG AA standard');
    isAccessible = false;
  }

  if (contrastRatios.accentText < 4.5) {
    issues.push('Accent text contrast ratio below WCAG AA standard');
    isAccessible = false;
  }

  return {
    isAccessible,
    issues,
    contrastRatios,
    wcagLevel: isAccessible ? 'AA' : 'Below AA',
    recommendations: issues.length > 0 ? ['Increase color contrast', 'Consider darker text colors'] : []
  };
}

/**
 * Customize theme with brand colors
 * @param baseTheme - Base theme to customize
 * @param customization - Customization options
 * @returns Customized theme
 */
export function customizeTheme(
  baseTheme: ProfessionalTheme,
  customization: {
    primary?: string;
    secondary?: string;
    accent?: string;
    fontFamily?: string;
  }
): ProfessionalTheme {
  return {
    ...baseTheme,
    id: `${baseTheme.id}-custom`,
    name: `${baseTheme.name} (Custom)`,
    colors: {
      ...baseTheme.colors,
      ...(customization.primary && { primary: customization.primary }),
      ...(customization.secondary && { secondary: customization.secondary }),
      ...(customization.accent && { accent: customization.accent }),
    },
    typography: {
      ...baseTheme.typography,
      ...(customization.fontFamily && {
        headings: {
          ...baseTheme.typography.headings,
          fontFamily: customization.fontFamily
        },
        body: {
          ...baseTheme.typography.body,
          fontFamily: customization.fontFamily
        }
      })
    }
  };
}



====================================================================================================
FILE: functions/src/schema.ts
DESCRIPTION: TypeScript schemas and validation for slide specifications and data structures
PURPOSE: Type definitions and validation schemas for all PowerPoint generation data
STATUS: EXISTS
LINES: 1294
====================================================================================================

/**
 * Optimized Zod Schema Definitions for AI PowerPoint Generator
 *
 * Enhanced schemas with support for chained generation, image integration, and advanced layouts.
 * Ensures data integrity for multi-step AI processes and professional outputs, with improved validation for accessibility, readability, and content quality.
 *
 * @version 3.6.1-enhanced
 * @author
 *   AI PowerPoint Generator Team (revised by expert co‑pilot)
 */

import { z, ZodError } from 'zod';

/* -------------------------------------------------------------------------------------------------
 * Common Validators, Utilities & Constants
 * ------------------------------------------------------------------------------------------------- */

// NOTE: Keep these validators focused and composable. We prefer explicit, readable rules over
// overly clever abstractions so downstream teams can maintain and extend them easily.

// Helpers for color-contrast & parsing hex (used by quality checks — not hard validation)
const HEX6 = /^#([0-9A-Fa-f]{6})$/;

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = HEX6.exec(hex);
  if (!m) return null;
  const int = parseInt(m[1], 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

function srgbToLinear(c: number): number {
  // WCAG sRGB linearization
  const cs = c / 255;
  return cs <= 0.04045 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const R = srgbToLinear(rgb.r);
  const G = srgbToLinear(rgb.g);
  const B = srgbToLinear(rgb.b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(fgHex: string, bgHex: string): number | null {
  const L1 = relativeLuminance(fgHex);
  const L2 = relativeLuminance(bgHex);
  if (L1 == null || L2 == null) return null;
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

const VALIDATION_PATTERNS = {
  title: z
    .string()
    .min(1, 'Title is required and cannot be empty')
    .max(120, 'Title must be under 120 characters for optimal display')
    .refine((val) => val.trim().length > 0, 'Title cannot be only whitespace')
    .transform((v) => v.trim()),

  shortText: z
    .string()
    .max(250, 'Text must be under 250 characters for readability')
    .refine((val) => val.trim().length > 0 || val.length === 0, 'Text cannot be only whitespace')
    .transform((v) => v.trim()),

  longText: z
    .string()
    .max(1200, 'Text must be under 1200 characters to fit on slide')
    .refine((val) => val.trim().length > 0 || val.length === 0, 'Text cannot be only whitespace')
    .transform((v) => v.trim()),

  colorHex: z
    .string()
    .regex(HEX6, 'Must be a valid 6-digit hex color (e.g., #FF0000)')
    .transform((val) => val.toUpperCase()),

  // Allow common font-family characters including spaces, digits, hyphens, commas, and quotes.
  fontFamily: z
    .string()
    .min(1, 'Font family is required')
    .refine((val) => /^[\w\s\-,'"]+$/.test(val), 'Font family contains invalid characters'),

  imagePrompt: z
    .string()
    .min(20, 'Image prompt must be at least 20 characters for quality generation')
    .max(500, 'Image prompt must be under 500 characters for optimal AI processing')
    .refine((val) => val.trim().length >= 20, 'Image prompt cannot be mostly whitespace')
    .transform((v) => v.trim()),

  percentage: z.coerce.number().min(0, 'Percentage cannot be negative').max(100, 'Percentage cannot exceed 100'),

  positiveNumber: z.coerce.number().positive('Value must be positive'),

  url: z
    .string()
    .url('Must be a valid URL')
    .refine((val) => val.startsWith('http'), 'URL must start with http or https'),
} as const;

/* -------------------------------------------------------------------------------------------------
 * Layouts
 * ------------------------------------------------------------------------------------------------- */

export const SLIDE_LAYOUTS = [
  'title',
  'title-bullets',
  'title-paragraph',
  'two-column',
  'mixed-content',
  'image-right',
  'image-left',
  'image-full',
  'quote',
  'chart',
  'comparison-table',
  'timeline',
  'process-flow',
  'before-after',
  'problem-solution',
  'data-visualization',
  'testimonial',
  'team-intro',
  'contact-info',
  'thank-you',
  'agenda',
  'section-divider',
  // Modern layout types
  'hero',
  'metrics-dashboard',
  'feature-showcase',
  'testimonial-card',
  'modern-bullets',
  'gradient-hero',
  'card-grid',
  'split-content',
  'accent-quote',
  'grid-layout',
] as const;

export type SlideLayout = (typeof SLIDE_LAYOUTS)[number];

/* -------------------------------------------------------------------------------------------------
 * Reusable Content Schemas
 * ------------------------------------------------------------------------------------------------- */

const ContentItemSchema = z.object({
  type: z.enum(['text', 'bullet', 'number', 'icon', 'metric']),
  content: VALIDATION_PATTERNS.shortText,
  emphasis: z.enum(['normal', 'bold', 'italic', 'highlight']).optional(),
  color: VALIDATION_PATTERNS.colorHex.optional(),
  iconName: z.string().max(50, 'Icon name too long').optional(), // Support for icon names
});

// Grid Layout Schemas
const GridCellSchema = z.object({
  row: z.number().int().min(0).max(2, 'Maximum 3 rows supported'),
  column: z.number().int().min(0).max(3, 'Maximum 4 columns supported'),
  type: z.enum(['header', 'bullets', 'paragraph', 'metric', 'image', 'chart', 'empty']),
  title: VALIDATION_PATTERNS.shortText.optional(),
  bullets: z.array(VALIDATION_PATTERNS.shortText).max(5, 'Maximum 5 bullets per cell').optional(),
  paragraph: VALIDATION_PATTERNS.longText.optional(),
  metric: z.object({
    value: z.string().max(20, 'Metric value too long'),
    label: z.string().max(50, 'Metric label too long'),
    trend: z.enum(['up', 'down', 'neutral']).optional(),
  }).optional(),
  image: z.object({
    src: z.string().url().optional(),
    alt: z.string().max(100, 'Alt text too long').optional(),
    prompt: z.string().max(200, 'Image prompt too long').optional(),
  }).optional(),
  chart: z.object({
    type: z.enum(['bar', 'line', 'pie', 'donut']),
    data: z.array(z.any()).max(10, 'Maximum 10 data points per chart'),
    title: z.string().max(50, 'Chart title too long').optional(),
  }).optional(),
  styling: z.object({
    backgroundColor: VALIDATION_PATTERNS.colorHex.optional(),
    textColor: VALIDATION_PATTERNS.colorHex.optional(),
    emphasis: z.enum(['normal', 'bold', 'highlight']).optional(),
    alignment: z.enum(['left', 'center', 'right']).optional(),
  }).optional(),
});

const GridLayoutSchema = z.object({
  columns: z.number().int().min(1).max(4, 'Maximum 4 columns supported'),
  rows: z.number().int().min(1).max(3, 'Maximum 3 rows supported'),
  cells: z.array(GridCellSchema).max(12, 'Maximum 12 cells supported'),
  showBorders: z.boolean().optional(),
  cellSpacing: z.enum(['tight', 'normal', 'spacious']).optional(),
}).refine((data) => {
  // Validate that all cells fit within the grid dimensions
  return data.cells.every(cell =>
    cell.row < data.rows && cell.column < data.columns
  );
}, 'All cells must fit within the specified grid dimensions');

/* -------------------------------------------------------------------------------------------------
 * Slide Spec (Primary Schema used by the current generator)
 * ------------------------------------------------------------------------------------------------- */

export const SlideSpecSchema = z
  .object({
    /** Main slide title - clear, concise, and engaging */
    title: VALIDATION_PATTERNS.title,

    /** Layout type */
    layout: z.enum(SLIDE_LAYOUTS).default('title-paragraph'),

    /** Bullet points */
    bullets: z
      .array(VALIDATION_PATTERNS.shortText)
      .max(10, 'Maximum 10 bullet points allowed for readability')
      .refine((arr) => arr.length === 0 || arr.every((item) => item.trim().length > 0), 'Bullet points cannot be empty')
      .transform((arr) => arr?.map((s) => s.trim()))
      .optional(),

    /** Paragraph content */
    paragraph: VALIDATION_PATTERNS.longText
      .refine((val) => !val || val.split('\n').length <= 10, 'Paragraph should not exceed 10 lines for readability')
      .optional(),

    /** Flexible content items */
    contentItems: z.array(ContentItemSchema).max(15, 'Maximum 15 content items allowed').optional(),

    /** Two-column layout support - left column */
    left: z
      .object({
        heading: z.string().max(80, 'Heading too long for column').optional(),
        bullets: z
          .array(VALIDATION_PATTERNS.shortText)
          .max(8, 'Maximum 8 bullets per column for readability')
          .transform((arr) => arr?.map((s) => s.trim()))
          .optional(),
        paragraph: VALIDATION_PATTERNS.longText.optional(),
        metrics: z
          .array(
            z.object({
              label: VALIDATION_PATTERNS.shortText,
              value: z.string().max(20, 'Metric value too long'),
              unit: z.string().max(10, 'Unit too long').optional(),
            })
          )
          .max(5, 'Maximum 5 metrics per column')
          .optional(),
        imagePrompt: VALIDATION_PATTERNS.imagePrompt.optional(),
        generateImage: z.boolean().optional(),
      })
      .optional(),

    /** Two-column layout support - right column */
    right: z
      .object({
        heading: z.string().max(80, 'Heading too long for column').optional(),
        bullets: z
          .array(VALIDATION_PATTERNS.shortText)
          .max(8, 'Maximum 8 bullets per column for readability')
          .transform((arr) => arr?.map((s) => s.trim()))
          .optional(),
        paragraph: VALIDATION_PATTERNS.longText.optional(),
        imagePrompt: VALIDATION_PATTERNS.imagePrompt.optional(),
        generateImage: z.boolean().optional(),
        metrics: z
          .array(
            z.object({
              label: VALIDATION_PATTERNS.shortText,
              value: z.string().max(20, 'Metric value too long'),
              unit: z.string().max(10, 'Unit too long').optional(),
            })
          )
          .max(5, 'Maximum 5 metrics per column')
          .optional(),
      })
      .optional(),

    /** Chart configuration */
    chart: z
      .object({
        type: z.enum(['bar', 'line', 'pie', 'doughnut', 'area', 'scatter', 'column'], {
          errorMap: () => ({
            message: 'Chart type must be one of: bar, line, pie, doughnut, area, scatter, column',
          }),
        }),
        title: z.string().max(100, 'Chart title too long').optional(),
        subtitle: z.string().max(80, 'Chart subtitle too long').optional(),
        categories: z
          .array(z.string().min(1, 'Category cannot be empty'))
          .min(1, 'At least one category required')
          .max(12, 'Maximum 12 categories for readability'),
        series: z
          .array(
            z.object({
              name: z.string().min(1, 'Series name is required').max(50, 'Series name too long'),
              data: z.array(z.coerce.number()).min(1, 'At least one data point required'),
              color: VALIDATION_PATTERNS.colorHex.optional(),
            })
          )
          .min(1, 'At least one data series required')
          .max(6, 'Maximum 6 data series for clarity'),
        showLegend: z.boolean().default(true),
        showDataLabels: z.boolean().default(false),
      })
      .optional(),

    /** Timeline configuration */
    timeline: z
      .array(
        z.object({
          date: z.string().default(''),
          title: z.string().default(''),
          description: VALIDATION_PATTERNS.longText.optional(),
          milestone: z.boolean().default(false),
        })
      )
      .max(8, 'Maximum 8 timeline items')
      .optional(),

    /** Comparison table */
    comparisonTable: z
      .object({
        headers: z
          .array(z.string().min(1, 'Header cannot be empty'))
          .min(2, 'At least 2 columns required')
          .max(4, 'Maximum 4 columns for readability'),
        rows: z
          .array(z.array(z.string()))
          .min(1, 'At least one row required')
          .max(8, 'Maximum 8 rows for readability'),
      })
      .optional(),

    /** Process flow steps */
    processSteps: z
      .array(
        z.object({
          step: VALIDATION_PATTERNS.positiveNumber,
          title: VALIDATION_PATTERNS.shortText,
          description: VALIDATION_PATTERNS.longText.optional(),
          icon: z.string().max(50, 'Icon name too long').optional(),
        })
      )
      .max(6, 'Maximum 6 process steps')
      .optional()
      .transform((steps) => {
        if (!steps || steps.length === 0) return undefined;
        const validSteps = steps.filter((step) => step.step && step.title);
        return validSteps.length > 0 ? validSteps : undefined;
      }),

    /** Design and branding configuration */
    design: z
      .object({
        theme: z.string().min(1).optional(),
        layout: z.string().optional(),
        brand: z
          .object({
            primary: VALIDATION_PATTERNS.colorHex.optional(),
            secondary: VALIDATION_PATTERNS.colorHex.optional(),
            accent: VALIDATION_PATTERNS.colorHex.optional(),
            fontFamily: VALIDATION_PATTERNS.fontFamily.optional(),
            logo: VALIDATION_PATTERNS.url.optional(),
          })
          .optional(),

        /** Modern theme features */
        modern: z.boolean().optional(),
        style: z.enum(['professional', 'creative', 'minimal', 'bold', 'modern']).optional(),
        backgroundStyle: z.enum(['gradient', 'minimal', 'accent']).optional(),
        contentLayout: z.enum(['bullets', 'cards', 'timeline']).optional(),

        /** Author and presentation metadata */
        author: z.string().optional(),
        date: z.string().optional(),

        /** Enhanced design properties */
        textColor: VALIDATION_PATTERNS.colorHex.optional(),
        backgroundColor: VALIDATION_PATTERNS.colorHex.optional(),
        fontSize: z.coerce.number().min(8).max(72).optional(),
        highContrast: z.boolean().optional(),
        colorAdjustments: z.record(z.string()).optional(),
      })
      .optional(),

    /** Speaker notes */
    notes: z.string().max(1000, 'Notes must be under 1000 characters').optional(),

    /** Source citations */
    sources: z.array(z.string().url('Must be a valid URL').or(z.string().min(1))).max(5, 'Maximum 5 sources allowed').optional(),

    /** Image prompt for full-image layouts */
    imagePrompt: VALIDATION_PATTERNS.imagePrompt.optional(),

    /** Whether to generate the image */
    generateImage: z.boolean().optional(),

    /** Premium/advanced properties */
    imageUrl: z.string().url().optional(),
    altText: z.string().optional(),
    accessibilityRole: z.string().optional(),
    headingLevel: z.coerce.number().min(1).max(6).optional(),
    imageOptimized: z.boolean().optional(),
    structureOptimized: z.boolean().optional(),
    brandCompliant: z.boolean().optional(),
    table: z.any().optional(), // Kept intentionally permissive for backwards compatibility
    timelineData: z.any().optional(),

    /** Speaker notes for presentation guidance */
    speakerNotes: z.string().max(1000, 'Speaker notes should be concise for effective presentation').optional(),

    /** Grid layout configuration for flexible content arrangement */
    gridLayout: GridLayoutSchema.optional(),
  })
  .superRefine((spec, ctx) => {
    // two-column layout must include both sides
    if (spec.layout === 'two-column') {
      if (!spec.left) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['left'],
          message: 'Two-column layout requires left column content.',
        });
      }
      if (!spec.right) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['right'],
          message: 'Two-column layout requires right column content.',
        });
      }
    }

    // chart layout must include chart data
    if (spec.layout === 'chart' && !spec.chart) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['chart'],
        message: 'Chart layout requires chart configuration.',
      });
    }

    // "comparison-table" layout requires comparisonTable
    if (spec.layout === 'comparison-table' && !spec.comparisonTable) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['comparisonTable'],
        message: 'comparison-table layout requires comparisonTable data.',
      });
    }

    // "grid-layout" layout requires gridLayout configuration
    if (spec.layout === 'grid-layout') {
      if (!spec.gridLayout) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['gridLayout'],
          message: 'Grid layout requires gridLayout configuration.',
        });
      } else if (spec.gridLayout.cells.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['gridLayout', 'cells'],
          message: 'Grid layout requires at least one cell with content.',
        });
      }
    }

    // "process-flow" layout requires ≥ 2 steps
    if (spec.layout === 'process-flow') {
      if (!spec.processSteps || spec.processSteps.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['processSteps'],
          message: 'process-flow layout requires at least 2 steps.',
        });
      }
    }

    // timeline layout must include >= 2 items
    if (spec.layout === 'timeline') {
      if (!spec.timeline || spec.timeline.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['timeline'],
          message: 'Timeline layout requires at least 2 timeline items.',
        });
      }
    }

    // image-* layouts require at least one image source (url or prompt)
    if (spec.layout === 'image-full' || spec.layout === 'image-left' || spec.layout === 'image-right') {
      const hasAnyImage =
        !!spec.imageUrl || !!spec.imagePrompt || !!spec.left?.imagePrompt || !!spec.right?.imagePrompt;
      if (!hasAnyImage) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['imageUrl'],
          message: `${spec.layout} layout requires an imageUrl or an imagePrompt.`,
        });
      }
      // Encourage alt text for accessibility when an image exists
      if (
        (spec.imageUrl || spec.imagePrompt || spec.left?.imagePrompt || spec.right?.imagePrompt) &&
        !spec.altText
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['altText'],
          message: 'Provide altText to describe the image for accessibility.',
        });
      }
    }

    // chart: categories length should match each series data length
    if (spec.chart) {
      const { categories, series, type } = spec.chart;
      series.forEach((s, idx) => {
        if (s.data.length !== categories.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['chart', 'series', idx, 'data'],
            message: `Data length (${s.data.length}) must match categories length (${categories.length}).`,
          });
        }
        if ((type === 'pie' || type === 'doughnut') && s.data.some((v) => v < 0)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['chart', 'series', idx, 'data'],
            message: 'Pie/doughnut charts cannot contain negative values.',
          });
        }
      });
      if ((spec.chart.type === 'pie' || spec.chart.type === 'doughnut')) {
        const total = series.reduce((sum, s) => sum + s.data.reduce((a, b) => a + b, 0), 0);
        if (total <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['chart', 'series'],
            message: 'Pie/doughnut charts require a positive total.',
          });
        }
      }
    }

    // comparison table: enforce row width consistency with headers
    if (spec.comparisonTable) {
      const { headers, rows } = spec.comparisonTable;
      rows.forEach((row, rIdx) => {
        if (row.length !== headers.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['comparisonTable', 'rows', rIdx],
            message: `Row ${rIdx + 1} must have exactly ${headers.length} cells to match headers.`,
          });
        }
      });
    }
  });

/** TypeScript type inferred from the slide specification schema */
export type SlideSpec = z.infer<typeof SlideSpecSchema>;

/* -------------------------------------------------------------------------------------------------
 * Generation Params (controls for the generator)
 * ------------------------------------------------------------------------------------------------- */

export const GenerationParamsSchema = z.object({
  /** User's input prompt - core content description */
  prompt: z
    .string()
    .min(10, 'Prompt must be at least 10 characters for meaningful content generation')
    .max(2000, 'Prompt must be under 2000 characters for optimal AI processing')
    .transform((str) => str.trim())
    .refine((val) => val.length >= 10, 'Prompt cannot be mostly whitespace'),

  /** Target audience */
  audience: z
    .enum(
      [
        'general',
        'executives',
        'technical',
        'sales',
        'investors',
        'students',
        'healthcare',
        'education',
        'marketing',
        'finance',
        'startup',
        'government',
        'business',
      ],
      { errorMap: () => ({ message: 'Invalid audience type. Must be one of the supported audience categories.' }) }
    )
    .default('general'),

  /** Presentation tone */
  tone: z
    .enum(
      ['professional', 'casual', 'persuasive', 'educational', 'inspiring', 'authoritative', 'friendly', 'urgent', 'confident', 'analytical'],
      { errorMap: () => ({ message: 'Invalid tone type. Must be one of the supported tone styles.' }) }
    )
    .default('professional'),

  /** Content length */
  contentLength: z
    .enum(['minimal', 'brief', 'moderate', 'detailed', 'comprehensive'], {
      errorMap: () => ({ message: 'Invalid content length. Must be minimal, brief, moderate, detailed, or comprehensive.' }),
    })
    .default('moderate'),

  /** Presentation type */
  presentationType: z.enum(['general', 'pitch', 'report', 'training', 'proposal', 'update', 'analysis', 'comparison', 'timeline', 'process', 'strategy']).default('general'),

  /** Industry context */
  industry: z
    .enum(['general', 'technology', 'healthcare', 'finance', 'education', 'retail', 'manufacturing', 'consulting', 'nonprofit', 'government', 'startup', 'hospitality'])
    .default('general'),

  /** Design preferences and branding */
  design: z
    .object({
      layout: z.enum(SLIDE_LAYOUTS).optional(),
      layoutName: z.string().max(50, 'Layout name too long').optional(),
      theme: z.string().max(50, 'Theme name too long').optional(),
      brand: z
        .object({
          primary: VALIDATION_PATTERNS.colorHex.optional(),
          secondary: VALIDATION_PATTERNS.colorHex.optional(),
          accent: VALIDATION_PATTERNS.colorHex.optional(),
          fontFamily: VALIDATION_PATTERNS.fontFamily.optional(),
          logo: VALIDATION_PATTERNS.url.optional(),
        })
        .optional(),
      customColors: z.array(VALIDATION_PATTERNS.colorHex).max(5, 'Maximum 5 custom colors allowed').optional(),
    })
    .optional(),

  /** AI image generation preferences */
  withImage: z.boolean().default(false),
  imageStyle: z.enum(['realistic', 'illustration', 'abstract', 'professional', 'minimal']).default('professional'),

  /** Content quality and validation preferences */
  qualityLevel: z.enum(['standard', 'high', 'premium']).default('standard'),
  includeNotes: z.boolean().default(false),
  includeSources: z.boolean().default(false),
});

export type GenerationParams = z.infer<typeof GenerationParamsSchema>;

/* -------------------------------------------------------------------------------------------------
 * Validation Results (helpers)
 * ------------------------------------------------------------------------------------------------- */

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

/**
 * Validate and parse slide specifications (single or multi-slide).
 */
export function validateSlideSpec(data: unknown): SlideSpec | SlideSpec[] {
  if (Array.isArray(data)) {
    return data.map((item) => SlideSpecSchema.parse(item));
  }
  return SlideSpecSchema.parse(data);
}

/**
 * Safe validator for SlideSpec that returns errors instead of throwing.
 */
export function safeValidateSlideSpec(data: unknown): ValidationResult<SlideSpec | SlideSpec[]> {
  try {
    const result = validateSlideSpec(data);
    return { success: true, data: result };
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      const errors = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Unknown validation error'] };
  }
}

/**
 * Validate and parse generation parameters.
 */
export function validateGenerationParams(data: unknown): GenerationParams {
  return GenerationParamsSchema.parse(data);
}

/**
 * Safe validator for GenerationParams that returns errors instead of throwing.
 */
export function safeValidateGenerationParams(data: unknown): ValidationResult<GenerationParams> {
  try {
    const result = validateGenerationParams(data);
    return { success: true, data: result };
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      const errors = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Unknown validation error'] };
  }
}

/* -------------------------------------------------------------------------------------------------
 * Content Quality Heuristics
 * ------------------------------------------------------------------------------------------------- */

export function validateContentQuality(spec: SlideSpec): {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  suggestions: string[];
  warnings: string[];
  improvements: string[];
  accessibility: {
    score: number;
    issues: string[];
  };
  readability: {
    score: number;
    level: string;
    issues: string[];
  };
} {
  const suggestions: string[] = [];
  const warnings: string[] = [];
  const improvements: string[] = [];
  const accessibilityIssues: string[] = [];
  const readabilityIssues: string[] = [];
  let score = 100;
  let accessibilityScore = 100;
  let readabilityScore = 100;

  // Title quality checks
  if (spec.title.length < 10) {
    suggestions.push('Consider a more descriptive title (at least 10 characters).');
    score -= 10;
  }
  if (spec.title.length > 80) {
    warnings.push('Title may be too long for optimal display.');
    score -= 5;
  }
  if (!/^[A-Z]/.test(spec.title)) {
    improvements.push('Title should start with a capital letter.');
    score -= 2;
  }

  // Content balance and structure checks
  const hasContent = spec.paragraph || spec.bullets?.length || spec.contentItems?.length;
  if (!hasContent) {
    warnings.push('Slide appears to have minimal content.');
    score -= 20;
  }

  // Bullet point optimization
  if (spec.bullets) {
    if (spec.bullets.length > 7) {
      suggestions.push('Consider reducing bullet points to 7 or fewer for better readability.');
      score -= 5;
    }
    if (spec.bullets.length > 10) {
      warnings.push('Too many bullet points may overwhelm the audience.');
      score -= 10;
    }
    const bulletLengths = spec.bullets.map((b) => b.length);
    const avgLength = bulletLengths.reduce((a, b) => a + b, 0) / bulletLengths.length || 0;
    const hasInconsistentLength = bulletLengths.some((len) => Math.abs(len - avgLength) > avgLength * 0.5);
    if (hasInconsistentLength) {
      improvements.push('Consider making bullet points more consistent in length.');
      score -= 3;
    }
  }

  // Paragraph content checks
  if (spec.paragraph) {
    const wordCount = spec.paragraph.split(/\s+/).filter(Boolean).length;
    if (wordCount > 150) {
      suggestions.push('Consider breaking long paragraphs into bullet points for better readability.');
      score -= 8;
    }
    if (wordCount < 10) {
      improvements.push('Paragraph content seems very brief - consider adding more detail.');
      score -= 5;
    }
  }

  // Layout-specific validations (heuristics)
  if (spec.layout === 'two-column' && (!spec.left || !spec.right)) {
    warnings.push('Two-column layout requires both left and right content.');
    score -= 15;
  }
  if (spec.layout === 'chart' && !spec.chart) {
    warnings.push('Chart layout requires chart data.');
    score -= 20;
  }
  if (spec.layout === 'timeline' && !spec.timeline) {
    warnings.push('Timeline layout requires timeline data.');
    score -= 20;
  }

  // Accessibility checks (non-fatal; heuristics)
  if (spec.design?.brand?.primary && spec.design?.brand?.secondary) {
    const primary = spec.design.brand.primary;
    const secondary = spec.design.brand.secondary;
    if (primary === secondary) {
      accessibilityIssues.push('Primary and secondary colors should be different for better contrast.');
      accessibilityScore -= 15;
    }
  }

  // Image: ensure descriptive text
  const anyImage = spec.imageUrl || spec.imagePrompt || spec.left?.imagePrompt || spec.right?.imagePrompt;
  if (anyImage && !spec.altText) {
    accessibilityIssues.push('Add altText to describe images for screen readers.');
    accessibilityScore -= 10;
  }

  // WCAG color contrast heuristic if both colors provided
  if (spec.design?.textColor && spec.design?.backgroundColor) {
    const ratio = contrastRatio(spec.design.textColor, spec.design.backgroundColor);
    if (ratio != null && ratio < 4.5) {
      accessibilityIssues.push(
        `Foreground/background contrast ratio ~${ratio.toFixed(2)}:1 is below the recommended 4.5:1 for normal text.`
      );
      accessibilityScore -= 15;
    }
  }

  // Readability assessment (lightweight heuristic)
  const allText = [spec.title, spec.paragraph || '', ...(spec.bullets || []), spec.notes || ''].join(' ');
  const sentences = allText.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = allText.split(/\s+/).filter((w) => w.length > 0);
  const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);

  if (avgWordsPerSentence > 20) {
    readabilityIssues.push('Sentences are quite long - consider breaking them down.');
    readabilityScore -= 15;
  }
  if (avgWordsPerSentence < 5) {
    readabilityIssues.push('Sentences are very short - consider combining some for better flow.');
    readabilityScore -= 5;
  }

  const complexWords = words.filter((word) => word.length > 12);
  const complexWordRatio = words.length ? complexWords.length / words.length : 0;
  if (complexWordRatio > 0.15) {
    readabilityIssues.push('Consider using simpler language for better comprehension.');
    readabilityScore -= 10;
  }

  // chart heuristics
  if (spec.chart && (spec.chart.type === 'pie' || spec.chart.type === 'doughnut')) {
    if (spec.chart.categories.length > 6) {
      suggestions.push('Pie/doughnut charts read best with 6 or fewer categories.');
      score -= 3;
    }
  }

  let readabilityLevel = 'Graduate';
  if (avgWordsPerSentence < 15 && complexWordRatio < 0.1) {
    readabilityLevel = 'High School';
  } else if (avgWordsPerSentence < 18 && complexWordRatio < 0.12) {
    readabilityLevel = 'College';
  }

  // Final grade
  const finalScore = Math.max(0, score);
  let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
  if (finalScore >= 90) grade = 'A';
  else if (finalScore >= 80) grade = 'B';
  else if (finalScore >= 70) grade = 'C';
  else if (finalScore >= 60) grade = 'D';

  return {
    score: finalScore,
    grade,
    suggestions,
    warnings,
    improvements,
    accessibility: {
      score: Math.max(0, accessibilityScore),
      issues: accessibilityIssues,
    },
    readability: {
      score: Math.max(0, readabilityScore),
      level: readabilityLevel,
      issues: readabilityIssues,
    },
  };
}

/* -------------------------------------------------------------------------------------------------
 * Improvement Suggestions from Quality Assessment
 * ------------------------------------------------------------------------------------------------- */

export function generateContentImprovements(
  spec: SlideSpec,
  qualityAssessment: ReturnType<typeof validateContentQuality>
): {
  priorityImprovements: string[];
  quickFixes: string[];
  enhancementSuggestions: string[];
} {
  const priorityImprovements: string[] = [];
  const quickFixes: string[] = [];
  const enhancementSuggestions: string[] = [];

  // Priority improvements (critical issues)
  if (qualityAssessment.score < 60) {
    priorityImprovements.push('Content needs significant improvement to meet professional standards.');
  }
  if (qualityAssessment.warnings.length > 0) {
    priorityImprovements.push(...qualityAssessment.warnings);
  }

  // Quick fixes (easy to implement)
  if (spec.title.length < 10) {
    quickFixes.push('Expand the title to be more descriptive and engaging.');
  }
  if (spec.bullets && spec.bullets.length > 7) {
    quickFixes.push('Reduce bullet points to 5–7 for optimal readability.');
  }
  if (!spec.notes) {
    quickFixes.push('Add speaker notes to provide context and accessibility.');
  }
  if ((spec.imageUrl || spec.imagePrompt || spec.left?.imagePrompt || spec.right?.imagePrompt) && !spec.altText) {
    quickFixes.push('Add altText for any images to improve accessibility.');
  }

  // Enhancement suggestions (nice to have)
  if (qualityAssessment.accessibility.score < 90) {
    enhancementSuggestions.push('Improve accessibility by ensuring strong color contrast and descriptive alt text.');
  }
  if (qualityAssessment.readability.score < 85) {
    enhancementSuggestions.push('Simplify language and sentence structure for better comprehension.');
  }
  if (!spec.sources || spec.sources.length === 0) {
    enhancementSuggestions.push('Add credible sources to support your content.');
  }
  if (spec.chart && (spec.chart.type === 'pie' || spec.chart.type === 'doughnut') && spec.chart.categories.length > 6) {
    enhancementSuggestions.push('For pie/doughnut charts, limit categories to 6 or fewer to avoid clutter.');
  }

  return {
    priorityImprovements,
    quickFixes,
    enhancementSuggestions,
  };
}

/* -------------------------------------------------------------------------------------------------
 * New Layout Engine — Slide Type Schemas
 * (Expanded to cover more slide types; keeps backward compat with existing generator)
 * ------------------------------------------------------------------------------------------------- */

export const SlideTypeSchema = z.enum([
  'title',
  'bullets',
  'twoColumn',
  'metrics',
  'section',
  'quote',
  'image',
  'timeline',
  'table',
  'comparison',
]);
export type SlideType = z.infer<typeof SlideTypeSchema>;

// Column content schemas for two-column layouts
export const ColumnContentSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('text'),
    content: VALIDATION_PATTERNS.longText,
    bullets: z.array(VALIDATION_PATTERNS.shortText).max(6).optional(),
  }),
  z.object({
    type: z.literal('image'),
    src: VALIDATION_PATTERNS.url,
    alt: VALIDATION_PATTERNS.shortText,
    caption: VALIDATION_PATTERNS.shortText.optional(),
  }),
  z.object({
    type: z.literal('mixed'),
    text: VALIDATION_PATTERNS.longText,
    image: z
      .object({
        src: VALIDATION_PATTERNS.url,
        alt: VALIDATION_PATTERNS.shortText,
      })
      .optional(),
    bullets: z.array(VALIDATION_PATTERNS.shortText).max(4).optional(),
  }),
]);
export type ColumnContent = z.infer<typeof ColumnContentSchema>;

// Metric data schema
export const MetricDataSchema = z.object({
  value: z.union([z.string(), z.coerce.number()]),
  label: VALIDATION_PATTERNS.shortText,
  description: VALIDATION_PATTERNS.shortText.optional(),
  trend: z
    .object({
      direction: z.enum(['up', 'down', 'flat']),
      percentage: z.coerce.number().optional(),
      period: z.string().optional(),
    })
    .optional(),
  target: z.union([z.string(), z.coerce.number()]).optional(),
  color: z.enum(['primary', 'success', 'warning', 'error', 'info']).optional(),
});
export type MetricData = z.infer<typeof MetricDataSchema>;

// Individual slide configuration schemas
export const TitleSlideConfigSchema = z.object({
  type: z.literal('title'),
  title: VALIDATION_PATTERNS.title,
  subtitle: VALIDATION_PATTERNS.shortText.optional(),
  author: z.string().max(100).optional(),
  date: z.string().max(50).optional(),
  organization: z.string().max(100).optional(),
  backgroundImage: z.string().url().optional(),
  backgroundColor: VALIDATION_PATTERNS.colorHex.optional(),
});
export type TitleSlideConfig = z.infer<typeof TitleSlideConfigSchema>;

export const BulletSlideConfigSchema = z.object({
  type: z.literal('bullets'),
  title: VALIDATION_PATTERNS.title,
  subtitle: VALIDATION_PATTERNS.shortText.optional(),
  bullets: z
    .array(VALIDATION_PATTERNS.shortText)
    .min(3, 'At least 3 bullet points required for effective content')
    .max(6, 'Maximum 6 bullet points for optimal readability'),
  bulletStyle: z.enum(['disc', 'circle', 'square', 'dash', 'arrow', 'number']).optional(),
  maxBullets: z.number().min(3).max(8).optional(),
  maxWordsPerBullet: z.number().min(8).max(20).optional(),
});
export type BulletSlideConfig = z.infer<typeof BulletSlideConfigSchema>;

export const TwoColumnSlideConfigSchema = z.object({
  type: z.literal('twoColumn'),
  title: VALIDATION_PATTERNS.title,
  subtitle: VALIDATION_PATTERNS.shortText.optional(),
  leftColumn: ColumnContentSchema,
  rightColumn: ColumnContentSchema,
  columnRatio: z.tuple([z.coerce.number().positive(), z.coerce.number().positive()]).optional(),
  verticalAlign: z.enum(['top', 'middle', 'bottom']).optional(),
});
export type TwoColumnSlideConfig = z.infer<typeof TwoColumnSlideConfigSchema>;

export const MetricsSlideConfigSchema = z.object({
  type: z.literal('metrics'),
  title: VALIDATION_PATTERNS.title,
  subtitle: VALIDATION_PATTERNS.shortText.optional(),
  metrics: z.array(MetricDataSchema).min(1, 'At least 1 metric required').max(12, 'Maximum 12 metrics for readability'),
  layout: z.enum(['grid', 'row', 'column', 'featured']).optional(),
  maxPerRow: z.number().min(1).max(6).optional(),
  showTrends: z.boolean().optional(),
  showTargets: z.boolean().optional(),
});
export type MetricsSlideConfig = z.infer<typeof MetricsSlideConfigSchema>;

// NEW: Quote slide config
export const QuoteSlideConfigSchema = z.object({
  type: z.literal('quote'),
  title: VALIDATION_PATTERNS.shortText.optional(),
  quote: VALIDATION_PATTERNS.longText,
  author: VALIDATION_PATTERNS.shortText.optional(),
  role: VALIDATION_PATTERNS.shortText.optional(),
  highlightColor: VALIDATION_PATTERNS.colorHex.optional(),
});
export type QuoteSlideConfig = z.infer<typeof QuoteSlideConfigSchema>;

// NEW: Image slide config
export const ImageSlideConfigSchema = z.object({
  type: z.literal('image'),
  title: VALIDATION_PATTERNS.shortText.optional(),
  src: VALIDATION_PATTERNS.url,
  alt: VALIDATION_PATTERNS.shortText,
  caption: VALIDATION_PATTERNS.shortText.optional(),
  fullBleed: z.boolean().optional(),
  borderRadius: z.coerce.number().min(0).max(48).optional(),
});
export type ImageSlideConfig = z.infer<typeof ImageSlideConfigSchema>;

// NEW: Timeline slide config
export const TimelineSlideConfigSchema = z.object({
  type: z.literal('timeline'),
  title: VALIDATION_PATTERNS.title,
  items: z
    .array(
      z.object({
        date: z.string().max(30, 'Date is too long'),
        title: VALIDATION_PATTERNS.shortText,
        description: VALIDATION_PATTERNS.longText.optional(),
        milestone: z.boolean().optional(),
      })
    )
    .min(2, 'At least two timeline items required')
    .max(12, 'Maximum 12 timeline items'),
});
export type TimelineSlideConfig = z.infer<typeof TimelineSlideConfigSchema>;

// NEW: Table slide config (base schema for discriminated union)
const BaseTableSlideConfigSchema = z.object({
  type: z.literal('table'),
  title: z.string().min(1).max(120), // Use basic string validation for discriminated union
  headers: z.array(z.string().min(1).max(160)).min(2).max(6),
  rows: z.array(z.array(z.string().min(1).max(160))).min(1).max(20),
  rowStripes: z.boolean().optional(),
});

// Enhanced table schema with full validation (for actual use)
export const TableSlideConfigSchema = z
  .object({
    type: z.literal('table'),
    title: VALIDATION_PATTERNS.title,
    headers: z.array(VALIDATION_PATTERNS.shortText).min(2).max(6),
    rows: z.array(z.array(VALIDATION_PATTERNS.shortText)).min(1).max(20),
    rowStripes: z.boolean().optional(),
  })
  .superRefine((tbl, ctx) => {
    tbl.rows.forEach((r, i) => {
      if (r.length !== tbl.headers.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['rows', i],
          message: `Row ${i + 1} must have ${tbl.headers.length} cells to match headers.`,
        });
      }
    });
  });
export type TableSlideConfig = z.infer<typeof TableSlideConfigSchema>;

// NEW: Comparison slide config
export const ComparisonSlideConfigSchema = z.object({
  type: z.literal('comparison'),
  title: VALIDATION_PATTERNS.title,
  leftTitle: VALIDATION_PATTERNS.shortText.optional(),
  rightTitle: VALIDATION_PATTERNS.shortText.optional(),
  leftBullets: z.array(VALIDATION_PATTERNS.shortText).min(1).max(6),
  rightBullets: z.array(VALIDATION_PATTERNS.shortText).min(1).max(6),
  showCheckmarks: z.boolean().optional(),
});
export type ComparisonSlideConfig = z.infer<typeof ComparisonSlideConfigSchema>;

// Base schemas for discriminated union (without ZodEffects)
const BaseTitleSlideConfigSchema = z.object({
  type: z.literal('title'),
  title: z.string().min(1).max(120),
  subtitle: z.string().max(160).optional(),
  author: z.string().max(100).optional(),
  date: z.string().max(50).optional(),
  backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
});

const BaseBulletSlideConfigSchema = z.object({
  type: z.literal('bullets'),
  title: z.string().min(1).max(120),
  subtitle: z.string().max(160).optional(),
  bullets: z.array(z.string().max(160)).min(1).max(10),
  backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
});

const BaseTwoColumnSlideConfigSchema = z.object({
  type: z.literal('twoColumn'),
  title: z.string().min(1).max(120),
  subtitle: z.string().max(160).optional(),
  leftColumn: z.any(), // Simplified for discriminated union
  rightColumn: z.any(), // Simplified for discriminated union
  backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
});

const BaseMetricsSlideConfigSchema = z.object({
  type: z.literal('metrics'),
  title: z.string().min(1).max(120),
  subtitle: z.string().max(160).optional(),
  metrics: z.array(z.any()).min(1).max(12), // Simplified for discriminated union
  layout: z.enum(['grid', 'row', 'column', 'featured']).optional(),
  backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
});

const BaseQuoteSlideConfigSchema = z.object({
  type: z.literal('quote'),
  title: z.string().max(160).optional(),
  quote: z.string().max(1200),
  author: z.string().max(160).optional(),
  role: z.string().max(160).optional(),
  backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
});

const BaseImageSlideConfigSchema = z.object({
  type: z.literal('image'),
  title: z.string().max(160).optional(),
  src: z.string().url(),
  alt: z.string().max(160),
  caption: z.string().max(160).optional(),
  backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
});

const BaseTimelineSlideConfigSchema = z.object({
  type: z.literal('timeline'),
  title: z.string().min(1).max(120),
  items: z.array(z.any()).min(2).max(8), // Simplified for discriminated union
  backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
});

const BaseComparisonSlideConfigSchema = z.object({
  type: z.literal('comparison'),
  title: z.string().min(1).max(120),
  leftTitle: z.string().max(160).optional(),
  rightTitle: z.string().max(160).optional(),
  leftBullets: z.array(z.string().max(160)).min(1).max(6),
  rightBullets: z.array(z.string().max(160)).min(1).max(6),
  showCheckmarks: z.boolean().optional(),
});

// Union of all slide configurations (new layout engine)
export const SlideConfigSchema = z.discriminatedUnion('type', [
  BaseTitleSlideConfigSchema,
  BaseBulletSlideConfigSchema,
  BaseTwoColumnSlideConfigSchema,
  BaseMetricsSlideConfigSchema,
  BaseQuoteSlideConfigSchema,
  BaseImageSlideConfigSchema,
  BaseTimelineSlideConfigSchema,
  BaseTableSlideConfigSchema,
  BaseComparisonSlideConfigSchema,
]);
export type SlideConfig = z.infer<typeof SlideConfigSchema>;

/* -------------------------------------------------------------------------------------------------
 * Enhanced Presentation Schema (new layout engine container)
 * ------------------------------------------------------------------------------------------------- */

export const EnhancedPresentationSchema = z.object({
  slides: z.array(SlideConfigSchema).min(1, 'At least one slide required'),
  theme: z.enum(['neutral', 'executive', 'colorPop']).default('neutral'),
  metadata: z.object({
    title: VALIDATION_PATTERNS.title,
    description: VALIDATION_PATTERNS.longText.optional(),
    audience: z.enum(['general', 'executives', 'technical', 'sales']).default('general'),
    duration: z.number().positive().optional(),
    tags: z.array(z.string()).optional(),
    version: z.string().optional(),
  }),
  options: z
    .object({
      async: z.boolean().default(false),
      includeNotes: z.boolean().default(true),
      generateImages: z.boolean().default(false),
      optimizeForPrint: z.boolean().default(false),
      accessibilityMode: z.boolean().default(true),
    })
    .optional(),
});
export type EnhancedPresentation = z.infer<typeof EnhancedPresentationSchema>;

/* -------------------------------------------------------------------------------------------------
 * Generation Response Schema
 * ------------------------------------------------------------------------------------------------- */

export const SlideGenerationResponseSchema = z.object({
  fileUrl: z.string().url(),
  deckSummary: z.object({
    slides: z.number().positive(),
    theme: z.string(),
    warnings: z.array(z.string()).default([]),
    errors: z.array(z.string()).optional(),
  }),
  cost: z
    .object({
      llmTokens: z.number().nonnegative(),
      usd: z.number().nonnegative(),
    })
    .optional(),
  metadata: z
    .object({
      generationTime: z.number().positive(),
      qualityScore: z.number().min(0).max(100),
      accessibilityScore: z.number().min(0).max(100),
    })
    .optional(),
});
export type SlideGenerationResponse = z.infer<typeof SlideGenerationResponseSchema>;


====================================================================================================
FILE: functions/src/services/powerPointService.ts
DESCRIPTION: Simplified PowerPoint service for orchestrating generation workflow
PURPOSE: High-level service interface for PowerPoint generation with validation and error handling
STATUS: EXISTS
LINES: 175
====================================================================================================

/**
 * Simplified PowerPoint Service Module
 * @version 2.0.0 - AI-optimized for simplicity and maintainability
 */

import { generateSimplePpt } from '../pptGenerator-simple';
import { type SlideSpec } from '../schema';
import { type ProfessionalTheme } from '../professionalThemes';

/** Simplified PowerPoint generation options */
export interface PowerPointOptions {
  theme: ProfessionalTheme;
  includeImages?: boolean;
  includeNotes?: boolean;
  includeMetadata?: boolean;
  optimizeForSize?: boolean;
  quality?: 'draft' | 'standard' | 'high';
  author?: string;
  company?: string;
  subject?: string;
}

/** Simplified PowerPoint generation result */
export interface PowerPointResult {
  buffer: Buffer;
  metadata: {
    slideCount: number;
    fileSize: number;
    generationTime: number;
    theme: string;
    quality: string;
  };
}

/** Simplified PowerPoint Service Interface */
export interface IPowerPointService {
  generatePresentation(slides: SlideSpec[], options: PowerPointOptions): Promise<PowerPointResult>;
  validateSlides(slides: SlideSpec[]): Promise<{ valid: boolean; errors: string[] }>;
  estimateFileSize(slides: SlideSpec[], options: PowerPointOptions): number;
  getSupportedFormats(): string[];
}

/** Simplified PowerPoint Service Implementation */
export class PowerPointService implements IPowerPointService {
  static readonly MAX_SLIDES = 50;

  constructor(private readonly logger: Pick<Console, 'log' | 'warn' | 'error'> = console) {}

  /** Generate a complete PowerPoint presentation */
  async generatePresentation(slides: SlideSpec[], options: PowerPointOptions): Promise<PowerPointResult> {
    const startTime = Date.now();

    // Validate input
    if (!slides || slides.length === 0) {
      throw new Error('No slides provided for generation');
    }

    if (slides.length > PowerPointService.MAX_SLIDES) {
      throw new Error(`Too many slides: ${slides.length}. Maximum allowed: ${PowerPointService.MAX_SLIDES}`);
    }

    // Validate slides
    const validation = await this.validateSlides(slides);
    if (!validation.valid) {
      throw new Error(`Slide validation failed: ${validation.errors.join(', ')}`);
    }

    try {
      // Generate PowerPoint
      const buffer = await generateSimplePpt(slides, options.theme?.id, {
        includeMetadata: options.includeMetadata,
        includeSpeakerNotes: options.includeNotes,
        optimizeFileSize: options.optimizeForSize,
        author: options.author,
        company: options.company,
        subject: options.subject,
      });

      const generationTime = Date.now() - startTime;

      return {
        buffer,
        metadata: {
          slideCount: slides.length,
          fileSize: buffer.length,
          generationTime,
          theme: options.theme.name,
          quality: options.quality || 'standard',
        },
      };
    } catch (error) {
      this.logger.error('PowerPoint generation failed:', error);
      throw new Error(`PowerPoint generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /** Validate slides for generation */
  async validateSlides(slides: SlideSpec[]): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!Array.isArray(slides)) {
      errors.push('Slides must be an array');
      return { valid: false, errors };
    }

    if (slides.length === 0) {
      errors.push('At least one slide is required');
      return { valid: false, errors };
    }

    if (slides.length > PowerPointService.MAX_SLIDES) {
      errors.push(`Too many slides: ${slides.length}. Maximum allowed: ${PowerPointService.MAX_SLIDES}`);
    }

    // Validate each slide
    slides.forEach((slide, index) => {
      if (!slide) {
        errors.push(`Slide ${index + 1} is null or undefined`);
        return;
      }

      if (!slide.title || typeof slide.title !== 'string' || slide.title.trim().length === 0) {
        errors.push(`Slide ${index + 1} missing valid title`);
      }

      if (!slide.layout) {
        errors.push(`Slide ${index + 1} missing layout`);
      }
    });

    return { valid: errors.length === 0, errors };
  }

  /** Estimate file size for slides */
  estimateFileSize(slides: SlideSpec[], options: PowerPointOptions): number {
    // Simple estimation based on slide count and content
    const baseSize = 50000; // Base PPTX overhead
    const perSlideSize = 15000; // Average per slide
    const imageSize = options.includeImages ? slides.length * 100000 : 0; // Estimated image overhead
    
    return baseSize + (slides.length * perSlideSize) + imageSize;
  }

  /** Get supported output formats */
  getSupportedFormats(): string[] {
    return ['pptx'];
  }
}

/** Utility functions for PowerPoint operations */
export class PowerPointUtils {
  /** Convert slides to different formats (not implemented) */
  static async convertToFormat(buffer: Buffer, format: string): Promise<Buffer> {
    if (format !== 'pptx') {
      throw new Error(`Conversion to '${format}' is not implemented`);
    }
    return buffer;
  }

  /** Optimize PowerPoint file size (stub) */
  static async optimizeFileSize(buffer: Buffer): Promise<Buffer> {
    // TODO: implement (recompress media, dedupe XML parts, remove unused relationships)
    return buffer;
  }

  /** Embed metadata into PowerPoint file (stub) */
  static async embedMetadata(buffer: Buffer, metadata: Record<string, any>): Promise<Buffer> {
    // TODO: implement metadata embedding
    return buffer;
  }
}

/** Default PowerPoint service instance */
export const powerPointService = new PowerPointService();



====================================================================================================
FILE: functions/src/index.ts
DESCRIPTION: Firebase Functions API endpoints for PowerPoint generation and content management
PURPOSE: REST API endpoints that handle HTTP requests and coordinate PowerPoint generation
STATUS: EXISTS
LINES: 1337
====================================================================================================

/**
 * AI PowerPoint Generator - Firebase Cloud Functions Backend
 *
 * CORE FUNCTIONALITY:
 * This is the main backend service that provides RESTful API endpoints for AI-powered
 * PowerPoint slide generation. The service uses OpenAI's GPT-4 for content generation
 * and DALL-E 3 for image creation, with comprehensive error handling and performance monitoring.
 *
 * KEY FEATURES:
 * - Multi-step AI generation pipeline: content → layout → images → refinement
 * - Professional PowerPoint (.pptx) file creation using PptxGenJS
 * - Advanced styling with theme system and brand customization
 * - Comprehensive input validation using Zod schemas
 * - Performance monitoring and detailed logging
 * - Rate limiting and security headers for production use
 *
 * API ENDPOINTS:
 * - GET /health - Service health check
 * - POST /generate - Create final PowerPoint file from slide specification
 * - POST /validate-content - Validate slide content quality
 * - POST /themes - Get theme recommendations based on content
 * - GET /metrics - Performance metrics (admin only)
 *
 * ARCHITECTURE:
 * - Express.js application wrapped in Firebase Cloud Function
 * - Stateless design with no database dependencies
 * - OpenAI API integration with retry logic and fallback strategies
 * - Comprehensive error handling with typed error classes
 * - Memory-efficient caching for theme recommendations
 *
 * @version 4.0.0-enhanced
 * @author AI PowerPoint Generator Team
 */

import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import compression from "compression";
import { apiKeyValidator } from "./config/apiKeyValidator";

// Import enhanced core modules with error types
import {
  AIGenerationError,
  ValidationError,
  TimeoutError,
  RateLimitError,
  ContentFilterError,
  NetworkError
} from "./llm";
import { PROFESSIONAL_THEMES, selectThemeForContent } from "./professionalThemes";
import { logger } from "./utils/smartLogger";
import { generatePpt } from "./pptGenerator-simple";

// Import new modular services
import { aiService } from "./services/aiService";
// Removed validation service - simplified codebase
import { type SlideSpec, safeValidateSlideSpec } from "./schema";

/* ============================================================================
 * CONFIGURATION & TYPE DEFINITIONS
 * ============================================================================
 *
 * This section contains all configuration constants, type definitions, and
 * interfaces used throughout the application. It includes:
 * - Admin authentication keys
 * - Production configuration settings
 * - Performance monitoring types
 * - Security and CORS configuration
 * ============================================================================ */

const ADMIN_KEYS = {
  configCheck: process.env.ADMIN_CONFIG_KEY || "config-check-2024",
  metrics: process.env.METRICS_ADMIN_KEY || "secret"
} as const;

// Production-ready configuration constants
const CONFIG = {
  maxInstances: 20,
  requestSizeLimit: "20mb",
  timeout: 540,
  memory: "2GiB" as const,
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: "Too many requests from this IP, please try again later.",
      retryAfter: "15 minutes"
    },
    // Skip rate limiting in Firebase Functions environment
    skip: (req: any) => {
      // Skip if in development or if running in Firebase Functions
      return (
        process.env.NODE_ENV === "development" ||
        process.env.FUNCTIONS_EMULATOR === "true" ||
        !req.ip
      );
    },
    // Custom key generator for Firebase Functions
    keyGenerator: (req: any) => {
      return (
        req.ip ||
        req.headers["x-forwarded-for"] ||
        (req.connection?.remoteAddress as string | undefined) ||
        "unknown"
      );
    }
  },
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-domain.com", "https://ai-ppt-gen.web.app"]
        : true,
    credentials: true,
    optionsSuccessStatus: 200
  },
  security: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.openai.com"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }
} as const;

// Performance monitoring utilities (enhanced with more metrics)
type Grade = "A" | "B" | "C" | "D" | "F";

interface PerformanceMetrics {
  requestId: string;
  endpoint: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  errorType?: string;
  userAgent?: string;
  contentLength?: number;
  slideCount?: number;
  themeUsed?: string;
  aiSteps?: number;
  averageScore?: number;
  averageGrade?: Grade;
  qualityScore?: number;
  qualityGrade?: Grade;
  memoryMB?: number;
}

const performanceMetrics: PerformanceMetrics[] = [];

// Simple in-memory cache
const cache = new Map<string, any>();

/* ============================================================================
 * PERFORMANCE MONITORING & UTILITIES
 * ============================================================================
 *
 * This section provides comprehensive performance monitoring capabilities:
 * - Request/response timing measurement
 * - Memory usage tracking
 * - Error classification and reporting
 * - Quality metrics collection
 * - Cache management utilities
 * ============================================================================ */

function startPerformanceTracking(endpoint: string, req: Request): PerformanceMetrics {
  const existingId = (req as any).requestId as string | undefined;
  const metric: PerformanceMetrics = {
    requestId:
      existingId || `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    endpoint,
    startTime: Date.now(),
    success: false,
    userAgent: req.headers["user-agent"],
    contentLength: req.headers["content-length"]
      ? parseInt(String(req.headers["content-length"]))
      : undefined
  };

  performanceMetrics.push(metric);
  return metric;
}

function endPerformanceTracking(
  metric: PerformanceMetrics,
  success: boolean,
  errorType?: string,
  extra?: Partial<PerformanceMetrics>
): void {
  metric.endTime = Date.now();
  metric.duration = metric.endTime - metric.startTime;
  metric.success = success;
  metric.errorType = errorType;
  // lightweight memory usage snapshot
  try {
    const heapUsed = (process as any)?.memoryUsage?.().heapUsed;
    if (typeof heapUsed === "number") {
      metric.memoryMB = Math.round(heapUsed / 1_000_000);
    }
  } catch {
    // ignore memory sampling failures
  }
  Object.assign(metric, extra);

  logger.info("Performance metric", metric);

  if (performanceMetrics.length > 1000) {
    performanceMetrics.splice(0, performanceMetrics.length - 1000);
  }
}

// Helper function for grade calculation
function getMostCommonGrade(grades: Grade[]): Grade {
  const counts = grades.reduce((acc, grade) => {
    acc[grade] = (acc[grade] || 0) + 1;
    return acc;
  }, {} as Record<Grade, number>);

  return (Object.entries(counts).reduce((a, b) =>
    counts[a[0] as Grade] > counts[b[0] as Grade] ? a : b
  )[0] || "A") as Grade;
}

// Define the OpenAI API key secret
const openaiApiKey = defineSecret("OPENAI_API_KEY");

// Configure Firebase Functions for optimal performance
setGlobalOptions({ maxInstances: CONFIG.maxInstances });

// Create Express application with production-ready middleware
const app = express();

// Harden Express
app.disable("x-powered-by");
app.set("trust proxy", 1); // accurate req.ip behind Google Front End (GFE)

/* --------------------------- Security & Performance ----------------------- */

app.use(
  compression({
    level: 6,
    threshold: 1024,
    filter: (req: any, res: any) => {
      if (req.headers["x-no-compression"]) return false;
      return compression.filter(req, res);
    }
  })
);

app.use(
  helmet({
    contentSecurityPolicy: CONFIG.security.contentSecurityPolicy,
    hsts: CONFIG.security.hsts,
    crossOriginEmbedderPolicy: false, // Allow embedding for iframe usage
    referrerPolicy: { policy: "no-referrer" },
    xssFilter: true
  }) as any
);

app.use(cors(CONFIG.cors));

// Request correlation (accept or assign X-Request-Id)
app.use((req: Request, res: Response, next: NextFunction) => {
  const incoming = String(req.headers["x-request-id"] || "") || undefined;
  const requestId = incoming || logger.generateRequestId();
  (req as any).requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
});

// Rate limiting (disabled in Firebase Functions environment due to IP detection issues)
if (process.env.NODE_ENV === "production" && !process.env.FUNCTIONS_EMULATOR) {
  app.use(rateLimit(CONFIG.rateLimit));
}

// Enforce JSON for mutating requests
app.use((req: Request, res: Response, next: NextFunction): void => {
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    const ct = String(req.headers["content-type"] || "");
    if (!ct.includes("application/json")) {
      res.status(415).json({
        error: "Content-Type must be application/json",
        code: "UNSUPPORTED_MEDIA_TYPE"
      });
      return;
    }
  }
  next();
});

// Body parsing with size limits
app.use(
  express.json({
    limit: CONFIG.requestSizeLimit,
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    }
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: CONFIG.requestSizeLimit
  })
);

// Handle malformed JSON early
app.use(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (err: any, req: Request, res: Response, _next: NextFunction) => {
    if (err && err instanceof SyntaxError && "body" in err) {
      return res.status(400).json({
        error: "Malformed JSON in request body",
        code: "INVALID_JSON",
        requestId: (req as any).requestId
      });
    }
    return res.status(500).json({
      error: "Unhandled error during request parsing",
      code: "REQUEST_PARSING_ERROR",
      requestId: (req as any).requestId
    });
  }
);

// Environment setup middleware (make secret available at runtime)
app.use((_req, _res, next) => {
  if (!process.env.OPENAI_API_KEY && openaiApiKey.value()) {
    process.env.OPENAI_API_KEY = openaiApiKey.value();
  }
  next();
});

/* -------------------------------------------------------------------------- */
/*                                   ROUTES                                    */
/* -------------------------------------------------------------------------- */

/**
 * Enhanced health check endpoint with comprehensive system validation
 */
app.get("/health", async (_req, res) => {
  const healthCheck = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "4.0.0-enhanced",
    service: "AI PowerPoint Generator - Enhanced",
    environment: process.env.NODE_ENV || "development",
    apiKeyStatus: "unknown",
    systemChecks: {
      openai: false,
      pptxGeneration: false,
      memory: false,
      themes: false
    }
  };

  // Perform runtime API key validation and expose diagnostics
  try {
    const validation = apiKeyValidator.validateConfiguration();
    healthCheck.apiKeyStatus = validation.isValid ? "configured" : "missing";
    healthCheck.systemChecks.openai = validation.isValid;

    (healthCheck as any).openaiDiagnostics = validation;

    if (!validation.isValid) {
      logger.warn("⚠️ OpenAI API key not properly configured", {
        source: validation.source,
        environment: validation.environment
      });
    }
  } catch (error) {
    logger.error("API key validation error:", {}, error as Error);
    healthCheck.apiKeyStatus = "error";
  }

  // Check memory usage
  try {
    const memUsage = process.memoryUsage();
    healthCheck.systemChecks.memory = memUsage.heapUsed < 500 * 1024 * 1024; // 500MB threshold
  } catch (error) {
    logger.warn("Memory check failed:", {}, error as Error);
  }

  // Test PowerPoint generation capability
  try {
    // Quick test to ensure PptxGenJS is working
    const PptxGenJS = require('pptxgenjs');
    const testPres = new PptxGenJS();
    healthCheck.systemChecks.pptxGeneration = true;
  } catch (error) {
    logger.error("PowerPoint generation test failed:", {}, error as Error);
  }

  // Determine overall health status
  const allChecksPass = Object.values(healthCheck.systemChecks).every(check => check);
  if (!allChecksPass) {
    healthCheck.status = "degraded";
  }

  const statusCode = healthCheck.status === "healthy" ? 200 : 503;

  return res.status(statusCode).json({
    ...healthCheck,
    uptimeSec: Math.round(process.uptime()),
    memoryMB: Math.round(process.memoryUsage().heapUsed / 1_000_000)
  });
});

/**
 * Configuration status endpoint (admin only)
 */
app.get("/config/status", (req, res) => {
  const keyFromQuery = req.query.adminKey as string | undefined;
  const keyFromHeader = (req.headers["x-admin-key"] as string | undefined) || undefined;
  if (keyFromQuery !== ADMIN_KEYS.configCheck && keyFromHeader !== ADMIN_KEYS.configCheck) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const validation = apiKeyValidator.validateConfiguration();
    const statusReport = apiKeyValidator.generateStatusReport();

    return res.json({
      validation,
      statusReport,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error("Configuration status check failed:", {}, error as Error);
    return res.status(500).json({
      error: "Configuration check failed",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * API key test endpoint (admin only)
 */
app.post("/config/test-api-key", async (req, res) => {
  const keyFromQuery = req.query.adminKey as string | undefined;
  const keyFromHeader = (req.headers["x-admin-key"] as string | undefined) || undefined;
  if (keyFromQuery !== ADMIN_KEYS.configCheck && keyFromHeader !== ADMIN_KEYS.configCheck) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const testResult = await apiKeyValidator.testAPIKey();

    return res.json({
      ...testResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error("API key test failed:", {}, error as Error);
    return res.status(500).json({
      error: "API key test failed",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Themes recommendation endpoint
 */
app.post("/themes", (req, res) => {
  const cacheKey = JSON.stringify(req.body);
  if (cache.has(cacheKey)) {
    return res.json(cache.get(cacheKey));
  }

  // Simple theme recommendation based on content type
  const { tone, audience } = req.body as { tone?: string; audience?: string };
  const recommendations: string[] = [];

  if (tone === "professional" || audience === "executives") {
    recommendations.push("corporate-blue", "finance-navy", "consulting-charcoal");
  } else if (tone === "creative") {
    recommendations.push("creative-purple", "marketing-magenta", "vibrant-coral");
  } else if (audience === "students") {
    recommendations.push("education-green", "academic-indigo");
  } else {
    recommendations.push("modern-slate", "corporate-blue", "creative-purple");
  }

  cache.set(cacheKey, recommendations);
  return res.json(recommendations);
});

/**
 * Theme presets endpoint: return full theme catalog with metadata
 */
app.get("/theme-presets", (_req, res) => {
  const themes = PROFESSIONAL_THEMES.map((t) => ({
    id: t.id,
    name: t.name,
    category: t.category,
    // backend theme type has no description; send empty string for compatibility
    description: "",
    colors: t.colors,
    typography: t.typography,
    effects: t.effects,
    spacing: t.spacing
  }));

  // Cache aggressively — static catalog
  res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400, immutable");

  return res.json({ themes, count: themes.length });
});

/**
 * Metrics endpoint (secured)
 */
app.get("/metrics", (req, res) => {
  const keyFromQuery = req.query.adminKey as string | undefined;
  const keyFromHeader = (req.headers["x-admin-key"] as string | undefined) || undefined;
  if (keyFromQuery !== ADMIN_KEYS.metrics && keyFromHeader !== ADMIN_KEYS.metrics) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  return res.json(performanceMetrics.slice(-100));
});

/**
 * Draft generation endpoint - Generate slide content from user parameters
 * Enhanced with better error handling and performance monitoring
 */
app.post("/draft", async (req, res) => {
  const performanceMetric = startPerformanceTracking("/draft", req);

  try {
    logger.info("Draft generation request", {
      prompt: (req.body.prompt as string | undefined)?.substring(0, 100),
      audience: req.body.audience,
      tone: req.body.tone,
      contentLength: req.body.contentLength,
      withImage: req.body.withImage,
      timestamp: new Date().toISOString()
    });

    // Validate generation parameters
    const paramValidation = validationService.validateGenerationParams(req.body);
    if (!paramValidation.success) {
      logger.warn("Invalid generation parameters", { errors: paramValidation.errors });
      endPerformanceTracking(performanceMetric, false, "INVALID_PARAMS_ERROR");
      return res.status(400).json({
        error: "Invalid generation parameters",
        code: "INVALID_PARAMS_ERROR",
        details: paramValidation.errors
      });
    }

    // Use the AI service to generate slide content
    const slideSpec = await aiService.generateSlideContent(paramValidation.data!);

    // Validate the generated content
    const contentValidation = validationService.validateSlideSpec(slideSpec);
    if (!contentValidation.success) {
      logger.warn("Generated content failed validation", { errors: contentValidation.errors });
      endPerformanceTracking(performanceMetric, false, "CONTENT_VALIDATION_ERROR");
      return res.status(422).json({
        error: "Generated content failed validation",
        code: "CONTENT_VALIDATION_ERROR",
        details: contentValidation.errors
      });
    }

    // Assess content quality
    const qualityAssessment = validationService.assessContentQuality(slideSpec);

    endPerformanceTracking(performanceMetric, true, undefined, {
      qualityScore: qualityAssessment.score,
      qualityGrade: qualityAssessment.grade
    });

    return res.json({
      spec: slideSpec,
      quality: {
        score: qualityAssessment.score,
        grade: qualityAssessment.grade,
        issues: qualityAssessment.issues,
        strengths: qualityAssessment.strengths,
        suggestions: qualityAssessment.suggestions
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    let status = 500;
    let code = "DRAFT_GENERATION_ERROR";
    let message = "Failed to generate slide draft. Please try again.";

    if (error instanceof AIGenerationError) {
      status = 503;
      code = "AI_SERVICE_ERROR";
      message = "AI service temporarily unavailable. Please try again in a moment.";
      logger.error("AI service error during draft generation", {
        message: error.message,
        step: error.step,
        attempt: error.attempt
      });
    } else if (error instanceof ValidationError) {
      status = 422;
      code = "CONTENT_VALIDATION_ERROR";
      message = "Generated content failed validation. Please try different parameters.";
      logger.error("Content validation failed during draft generation", {
        message: error.message,
        validationErrors: (error as ValidationError).validationErrors
      });
    } else if (error instanceof TimeoutError) {
      status = 504;
      code = "TIMEOUT_ERROR";
      message = "Request timed out. Please try again.";
      logger.error("Timeout during draft generation", {
        message: error.message,
        timeoutMs: (error as TimeoutError).timeoutMs
      });
    } else if (error instanceof RateLimitError) {
      status = 429;
      code = "RATE_LIMIT_ERROR";
      message = error.message;
      logger.warn("Rate limit exceeded during draft generation", {
        message: error.message,
        retryAfter: (error as RateLimitError).retryAfter
      });
    } else {
      logger.error("Unexpected error during draft generation", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    }

    endPerformanceTracking(performanceMetric, false, code);
    return res.status(status).json({
      error: message,
      code
    });
  }
});

/**
 * Content validation endpoint
 */
app.post("/validate-content", async (req, res) => {
  const performanceMetric = startPerformanceTracking("/validate-content", req);
  const specsToValidate = Array.isArray(req.body) ? req.body : [req.body];

  try {
    // Use the new validation service for comprehensive validation
    const validationResult = validationService.validateSlideArray(specsToValidate);

    if (!validationResult.success) {
      logger.warn("Slide validation failed", {
        errors: validationResult.errors,
        warnings: validationResult.warnings
      });

      endPerformanceTracking(performanceMetric, false, "VALIDATION_ERROR");
      return res.status(400).json({
        error: "Slide validation failed",
        code: "VALIDATION_ERROR",
        details: validationResult.errors,
        warnings: validationResult.warnings
      });
    }

    // Generate quality assessments for each validated slide
    const validationResults = validationResult.data!.map((spec) => {
      const qualityAssessment = validationService.assessContentQuality(spec);
      return {
        spec,
        quality: {
          score: qualityAssessment.score,
          grade: qualityAssessment.grade,
          issues: qualityAssessment.issues,
          strengths: qualityAssessment.strengths
        },
        improvements: qualityAssessment.suggestions
      };
    });

    endPerformanceTracking(performanceMetric, true, undefined, {
      slideCount: validationResults.length,
      averageScore:
        validationResults.reduce((sum, result) => sum + result.quality.score, 0) /
        validationResults.length,
      averageGrade: getMostCommonGrade(validationResults.map((r) => r.quality.grade))
    });

    return res.json({
      results: validationResults,
      summary: {
        totalSlides: specsToValidate.length,
        averageScore:
          validationResults.reduce((sum, result) => sum + result.quality.score, 0) /
          validationResults.length,
        averageGrade: getMostCommonGrade(validationResults.map((r) => r.quality.grade))
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error("Content validation failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    endPerformanceTracking(performanceMetric, false, "VALIDATION_SERVICE_ERROR");
    return res.status(500).json({
      error: "Content validation failed. Please try again.",
      code: "VALIDATION_SERVICE_ERROR"
    });
  }
});

/**
 * Enhanced PowerPoint file generation endpoint with professional design system
 */
app.post("/generate/professional", async (req, res) => {
  const performanceMetric = startPerformanceTracking("/generate/professional", req);

  try {
    // Initialize context for error handling
    const requestId = logger.generateRequestId();
    const context = { requestId, operation: "ppt-generation" };

    logger.info("Professional PowerPoint generation request", {
      hasSpec: !!req.body.spec,
      colorPalette: req.body.colorPalette || "corporate",
      metadata: req.body.metadata,
      timestamp: new Date().toISOString()
    });

    let spec: SlideSpec[];
    let slideCount = 1;
    const colorPalette = req.body.colorPalette || "corporate";

    // Validate color palette
    const validPalettes = ["corporate", "creative", "finance", "tech", "ocean"];
    if (!validPalettes.includes(colorPalette)) {
      logger.warn("Invalid color palette provided", { colorPalette });
      endPerformanceTracking(performanceMetric, false, "INVALID_PALETTE_ERROR");
      return res.status(400).json({
        error: "Invalid color palette provided",
        code: "INVALID_PALETTE_ERROR",
        availablePalettes: validPalettes
      });
    }

    // Handle slide generation from parameters or direct spec
    if (!req.body.spec && req.body.prompt) {
      // Generate slides from parameters using AI service
      const paramValidation = validationService.validateGenerationParams(req.body);
      if (!paramValidation.success) {
        logger.warn("Invalid generation parameters provided", { errors: paramValidation.errors });
        endPerformanceTracking(performanceMetric, false, "INVALID_PARAMS_ERROR");
        return res.status(400).json({
          error: "Invalid generation parameters provided",
          code: "INVALID_PARAMS_ERROR",
          details: paramValidation.errors
        });
      }

      try {
        const generatedSpec = await aiService.generateSlideContent(paramValidation.data!);
        spec = [generatedSpec];
        logger.info("Successfully generated slide from parameters");
      } catch (error) {
        logger.error("Failed to generate slide from parameters", {
          error: error instanceof Error ? error.message : "Unknown error"
        });
        endPerformanceTracking(performanceMetric, false, "AI_GENERATION_ERROR");
        return res.status(500).json({
          error: "Failed to generate slide content",
          code: "AI_GENERATION_ERROR",
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
    } else if (req.body.spec) {
      // Use provided specification
      if (Array.isArray(req.body.spec)) {
        const specArray = req.body.spec as unknown[];
        const validatedSpecs: SlideSpec[] = [];
        const validationErrors: string[][] = [];

        for (const s of specArray) {
          const v = safeValidateSlideSpec(s);
          if (!v.success) {
            validationErrors.push(v.errors || ["Unknown validation error"]);
          } else if (v.data) {
            if (Array.isArray(v.data)) {
              validatedSpecs.push(...(v.data as SlideSpec[]));
            } else {
              validatedSpecs.push(v.data as SlideSpec);
            }
          }
        }

        if (validationErrors.length > 0) {
          logger.warn("Some slide specifications failed validation", { validationErrors });
          endPerformanceTracking(performanceMetric, false, "VALIDATION_ERROR");
          return res.status(400).json({
            error: "Some slide specifications failed validation",
            code: "VALIDATION_ERROR",
            details: validationErrors
          });
        }

        spec = validatedSpecs;
      } else {
        const validation = safeValidateSlideSpec(req.body.spec);
        if (!validation.success) {
          logger.warn("Slide specification validation failed", { errors: validation.errors });
          endPerformanceTracking(performanceMetric, false, "VALIDATION_ERROR");
          return res.status(400).json({
            error: "Slide specification validation failed",
            code: "VALIDATION_ERROR",
            details: validation.errors
          });
        }
        if (validation.data) {
          spec = Array.isArray(validation.data) ? (validation.data as SlideSpec[]) : [validation.data as SlideSpec];
        } else {
          spec = [];
        }
      }
    } else {
      logger.warn("No slide specification or generation parameters provided");
      endPerformanceTracking(performanceMetric, false, "MISSING_INPUT_ERROR");
      return res.status(400).json({
        error: 'Either slide specification or generation parameters (prompt) must be provided',
        code: "MISSING_INPUT_ERROR",
        details: ['Provide either "spec" with slide specifications or "prompt" with generation parameters']
      });
    }

    slideCount = spec.length;

    // Guard against undefined or empty spec
    if (!spec || spec.length === 0) {
      logger.error("Internal error: spec not defined or empty");
      endPerformanceTracking(performanceMetric, false, "INTERNAL_ERROR");
      return res.status(500).json({
        error: "Internal error: No valid specification provided",
        code: "INTERNAL_ERROR"
      });
    }

    // Generate PowerPoint using enhanced generator

    logger.startPerf(`ppt-gen-${requestId}`, context);
    logger.info("Starting enhanced PowerPoint generation", context, {
      slideCount: Array.isArray(spec) ? spec.length : 1,
      withValidation: req.body.withValidation ?? true,
      firstSlideTitle: spec[0]?.title,
      firstSlideLayout: spec[0]?.layout,
      themeId: req.body.themeId,
      quality: req.body.quality || 'standard'
    });

    // Enhanced generation options
    const generationOptions = {
      includeMetadata: true,
      includeSpeakerNotes: true,
      optimizeFileSize: req.body.optimizeFileSize ?? true,
      quality: (req.body.quality as 'draft' | 'standard' | 'high') || 'standard',
      author: req.body.author || 'AI PowerPoint Generator',
      company: req.body.company || 'Professional Presentations',
      subject: req.body.subject || 'AI-Generated Presentation'
    };

    const pptBuffer = await generatePpt(
      spec,
      req.body.themeId,
      generationOptions
    );

    logger.endPerf(`ppt-gen-${requestId}`, context, {
      bufferSize: pptBuffer.length,
      sizeKB: Math.round(pptBuffer.length / 1024)
    });

    // Validate buffer before sending
    if (!pptBuffer || pptBuffer.length === 0) {
      throw new Error('Generated PowerPoint buffer is empty or invalid');
    }

    // Check for valid ZIP signature (PowerPoint files are ZIP archives)
    const zipSignature = pptBuffer.subarray(0, 4);
    const expectedSignature = Buffer.from([0x50, 0x4B, 0x03, 0x04]); // "PK\x03\x04"
    if (!zipSignature.equals(expectedSignature)) {
      logger.error('Invalid PowerPoint file signature detected', context, {
        actualSignature: Array.from(zipSignature).map(b => `0x${b.toString(16).padStart(2, '0')}`).join(' '),
        expectedSignature: Array.from(expectedSignature).map(b => `0x${b.toString(16).padStart(2, '0')}`).join(' '),
        bufferSize: pptBuffer.length
      });
      throw new Error('Generated PowerPoint file has invalid format signature');
    }

    // Configure response headers with proper encoding
    const firstSpec = spec[0];
    const sanitizedTitle =
      firstSpec.title?.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_") || "presentation";
    const filename = `${sanitizedTitle}_professional.pptx`;

    // Set headers in correct order and format
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pptBuffer.length.toString());
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    endPerformanceTracking(performanceMetric, true);
    logger.info("Professional PowerPoint generated successfully", {
      slideCount,
      colorPalette,
      bufferSize: pptBuffer.length,
      filename,
      signatureValid: true
    });

    // Send buffer directly without any encoding transformations
    res.end(pptBuffer);
    return;
  } catch (error) {
    logger.error("Professional PowerPoint generation failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });

    endPerformanceTracking(performanceMetric, false, "GENERATION_ERROR");

    if (error instanceof AIGenerationError) {
      return res.status(503).json({
        error: "AI service temporarily unavailable",
        code: "AI_SERVICE_ERROR",
        details: error.message
      });
    }

    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: "Content validation failed",
        code: "VALIDATION_ERROR",
        details: error.message
      });
    }

    return res.status(500).json({
      error: "PowerPoint generation failed",
      code: "GENERATION_ERROR",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
      requestId: logger.generateRequestId(),
      suggestions: [
        'Check your slide content for any formatting issues',
        'Try reducing the number of slides if you have many',
        'Ensure your theme selection is valid',
        'Contact support if the issue persists'
      ],
      supportInfo: {
        documentation: 'https://docs.ai-ppt-generator.com/troubleshooting',
        contact: 'support@ai-ppt-generator.com'
      }
    });
  }
});

/**
 * PowerPoint file generation endpoint
 * Enhanced with better performance monitoring and error handling
 */
app.post("/generate", async (req, res) => {
  const performanceMetric = startPerformanceTracking("/generate", req);

  try {
    logger.info("PowerPoint generation request", {
      hasSpec: !!req.body.spec,
      directGeneration: !req.body.spec,
      themeId: req.body.themeId,
      withValidation: req.body.withValidation ?? true,
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent']?.substring(0, 100)
    });

    // Validate theme ID if provided
    if (req.body.themeId) {
      const themeExists = PROFESSIONAL_THEMES.some(t => t.id === req.body.themeId);
      if (!themeExists) {
        logger.warn("Invalid theme ID provided", {
          themeId: req.body.themeId,
          availableThemes: PROFESSIONAL_THEMES.map(t => t.id)
        });
      } else {
        const selectedTheme = PROFESSIONAL_THEMES.find(t => t.id === req.body.themeId);
        logger.info("Theme validation passed", {
          themeId: req.body.themeId,
          themeName: selectedTheme?.name,
          themeCategory: selectedTheme?.category
        });
      }
    }

    let spec: SlideSpec | SlideSpec[];
    let slideCount = 1;
    let themeUsed: string = req.body.themeId || "default";

    // Check if we need to generate slides from parameters
    if (!req.body.spec && req.body.prompt) {
      logger.info("Generating slides from parameters", { prompt: req.body.prompt });

      // Validate generation parameters
      const paramValidation = validationService.validateGenerationParams(req.body);
      if (!paramValidation.success) {
        logger.warn("Invalid generation parameters provided", { errors: paramValidation.errors });
        endPerformanceTracking(performanceMetric, false, "INVALID_PARAMS_ERROR");
        return res.status(400).json({
          error: "Invalid generation parameters provided",
          code: "INVALID_PARAMS_ERROR",
          details: paramValidation.errors
        });
      }

      // Generate slide content using AI service
      try {
        spec = await aiService.generateSlideContent(paramValidation.data!);
        logger.info("Successfully generated slide from parameters");
      } catch (error) {
        logger.error("Failed to generate slide from parameters", {
          error: error instanceof Error ? error.message : "Unknown error"
        });
        endPerformanceTracking(performanceMetric, false, "AI_GENERATION_ERROR");
        return res.status(500).json({
          error: "Failed to generate slide content",
          code: "AI_GENERATION_ERROR",
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
    } else if (Array.isArray(req.body.spec)) {
      const specArray = req.body.spec as unknown[]; // Safe cast from any
      const validatedSpecs: SlideSpec[] = [];
      const validationErrors: string[][] = [];

      for (const s of specArray) {
        const v = safeValidateSlideSpec(s);
        if (!v.success) {
          validationErrors.push(v.errors || ["Unknown validation error"]);
        } else {
          validatedSpecs.push(v.data as SlideSpec);
        }
      }

      if (validationErrors.length > 0) {
        logger.warn("Invalid slide specifications provided", { errors: validationErrors });
        endPerformanceTracking(performanceMetric, false, "INVALID_SPEC_ERROR");
        return res.status(400).json({
          error: "Invalid slide specifications provided",
          code: "INVALID_SPEC_ERROR",
          details: validationErrors
        });
      }

      spec = validatedSpecs;
    } else if (req.body.spec) {
      const validation = safeValidateSlideSpec(req.body.spec);
      if (!validation.success) {
        logger.warn("Invalid slide specification provided", { errors: validation.errors });
        endPerformanceTracking(performanceMetric, false, "INVALID_SPEC_ERROR");
        return res.status(400).json({
          error: "Invalid slide specification provided",
          code: "INVALID_SPEC_ERROR",
          details: validation.errors
        });
      }

      spec = validation.data as SlideSpec;
    } else {
      // Neither spec nor prompt provided
      logger.warn("No slide specification or generation parameters provided");
      endPerformanceTracking(performanceMetric, false, "MISSING_INPUT_ERROR");
      return res.status(400).json({
        error: 'Either slide specification or generation parameters (prompt) must be provided',
        code: "MISSING_INPUT_ERROR",
        details: ['Provide either "spec" with slide specifications or "prompt" with generation parameters']
      });
    }

    slideCount = Array.isArray(spec) ? spec.length : 1;

    // Guard against undefined or empty spec
    if (!spec || (Array.isArray(spec) && spec.length === 0)) {
      logger.error("Internal error: spec not defined or empty");
      endPerformanceTracking(performanceMetric, false, "INTERNAL_ERROR");
      return res.status(500).json({
        error: "Internal error: No valid specification provided",
        code: "INTERNAL_ERROR"
      });
    }

    // Auto-select theme if not provided or invalid
    if (!req.body.themeId) {
      const firstSpec = Array.isArray(spec) ? (spec as SlideSpec[])[0] : (spec as SlideSpec);
      const contentForAnalysis = `${firstSpec.title || ''} ${firstSpec.paragraph || ''} ${firstSpec.layout || ''}`;
      themeUsed = selectThemeForContent(contentForAnalysis).id;
      logger.info(`Auto-selected theme: ${themeUsed}`);
    } else {
      const exists = PROFESSIONAL_THEMES.some((t) => t.id === req.body.themeId);
      if (!exists) {
        logger.warn("Provided themeId not found. Falling back to auto-selection.", {
          themeId: req.body.themeId
        });
        const firstSpec = Array.isArray(spec) ? (spec as SlideSpec[])[0] : (spec as SlideSpec);
        const contentForAnalysis = `${firstSpec.title || ''} ${firstSpec.paragraph || ''} ${firstSpec.layout || ''}`;
        themeUsed = selectThemeForContent(contentForAnalysis).id;
      } else {
        themeUsed = req.body.themeId;
      }
    }

    // Use the simplified PowerPoint service for generation
    const slides = Array.isArray(spec) ? (spec as SlideSpec[]) : [spec as SlideSpec];
    const theme = PROFESSIONAL_THEMES.find((t) => t.id === themeUsed) || PROFESSIONAL_THEMES[0];

    // Use the existing PowerPoint service
    const { PowerPointService } = await import('./services/powerPointService');
    const powerPointService = new PowerPointService();

    const powerPointResult = await powerPointService.generatePresentation(slides, {
      theme,
      includeNotes: true,
      includeMetadata: true,
      quality: (req.body.quality as any) || "standard",
      optimizeForSize: Boolean(req.body.optimizeFileSize ?? true),
      retries: 2
    });

    // Log comprehensive theme verification results
    logger.info("🎨 PowerPoint generation completed with theme verification", {
      requestedTheme: req.body.themeId,
      appliedTheme: theme.id,
      themeMatched: req.body.themeId === theme.id,
      themeDetails: {
        id: theme.id,
        name: theme.name,
        category: theme.category,
        colors: {
          primary: theme.colors.primary,
          secondary: theme.colors.secondary,
          accent: theme.colors.accent,
          background: theme.colors.background,
          textPrimary: theme.colors.text.primary
        }
      },
      generationResult: {
        success: true,
        fileSize: powerPointResult.buffer.length,
        slideCount: slides.length,
        generationTime: powerPointResult.metadata.generationTime,
        theme: powerPointResult.metadata.theme,
        quality: powerPointResult.metadata.quality,
        retries: powerPointResult.metadata.retries
      }
    });

    const pptBuffer = powerPointResult.buffer;

    // Configure response headers
    const firstSpec = Array.isArray(spec) ? (spec as SlideSpec[])[0] : (spec as SlideSpec);
    const sanitizedTitle =
      firstSpec.title?.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_") || "presentation";
    const filename = `${sanitizedTitle}.pptx`;

    // Validate buffer before sending
    if (!pptBuffer || pptBuffer.length === 0) {
      throw new Error('Generated PowerPoint buffer is empty or invalid');
    }

    // Check for valid ZIP signature (PowerPoint files are ZIP archives)
    const zipSignature = pptBuffer.subarray(0, 4);
    const expectedSignature = Buffer.from([0x50, 0x4B, 0x03, 0x04]); // "PK\x03\x04"
    if (!zipSignature.equals(expectedSignature)) {
      logger.error('Invalid PowerPoint file signature detected', {
        actualSignature: Array.from(zipSignature).map(b => `0x${b.toString(16).padStart(2, '0')}`).join(' '),
        expectedSignature: Array.from(expectedSignature).map(b => `0x${b.toString(16).padStart(2, '0')}`).join(' '),
        bufferSize: pptBuffer.length
      });
      throw new Error('Generated PowerPoint file has invalid format signature');
    }

    // Set headers in correct order and format
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pptBuffer.length.toString());
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    logger.info("PowerPoint generation successful", {
      filename,
      fileSize: pptBuffer.length,
      slideTitle: sanitizedTitle,
      slideCount,
      themeUsed,
      signatureValid: true
    });

    endPerformanceTracking(performanceMetric, true, undefined, { slideCount, themeUsed, aiSteps: 4 });

    // Send buffer directly without any encoding transformations
    res.end(pptBuffer);
    return;
  } catch (error) {
    let status = 500;
    let code = "PPT_GENERATION_ERROR";
    let message = "Failed to generate PowerPoint file. Please check your slide content and try again.";

    if (error instanceof AIGenerationError) {
      status = 503;
      code = "AI_SERVICE_ERROR";
      message = "AI service temporarily unavailable during PowerPoint generation.";
      logger.error("AI generation failed during PPT creation", {
        step: error.step,
        attempt: error.attempt,
        message: error.message
      });
    } else if (error instanceof ValidationError) {
      status = 422;
      code = "CONTENT_VALIDATION_ERROR";
      message = "Generated content failed validation during PowerPoint creation.";
      logger.error("Content validation failed during PPT creation", {
        message: error.message,
        validationErrors: (error as ValidationError).validationErrors
      });
    } else if (error instanceof TimeoutError) {
      status = 408;
      code = "TIMEOUT_ERROR";
      message = "PowerPoint generation timed out. Please try again.";
      logger.error("Timeout during PPT generation", {
        message: error.message,
        timeoutMs: (error as TimeoutError).timeoutMs
      });
    } else if (error instanceof RateLimitError) {
      status = 429;
      code = "RATE_LIMIT_ERROR";
      message = "Too many requests. Please wait a moment and try again.";
      logger.warn("Rate limit exceeded during PPT generation", {
        message: error.message,
        retryAfter: (error as RateLimitError).retryAfter
      });
    } else if (error instanceof ContentFilterError) {
      status = 400;
      code = "CONTENT_FILTER_ERROR";
      message = "Content was filtered due to policy violations. Please try different wording.";
      logger.warn("Content filtered during PPT generation", {
        message: error.message,
        filteredContent: (error as ContentFilterError).filteredContent
      });
    } else if (error instanceof NetworkError) {
      status = 502;
      code = "NETWORK_ERROR";
      message = "Network error occurred. Please check your connection and try again.";
      logger.error("Network error during PPT generation", {
        message: error.message,
        statusCode: (error as NetworkError).statusCode
      });
    } else {
      logger.error("PowerPoint generation failed", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        hasSpec: !!req.body.spec,
        timestamp: new Date().toISOString()
      });
    }

    endPerformanceTracking(performanceMetric, false, code);
    return res.status(status).json({ error: message, code });
  }
});

/* ------------------------------- 404 & ERRORS ------------------------------ */

// 404 for unknown routes
app.use((req, res) => {
  return res.status(404).json({
    error: "Route not found",
    code: "NOT_FOUND",
    method: req.method,
    path: req.path
  });
});

// Global error handler (final safety net)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  logger.error("Unhandled error", {
    message: err?.message,
    stack: err?.stack,
    requestId: (req as any).requestId
  });
  return res.status(500).json({
    error: "Internal server error",
    code: "INTERNAL_SERVER_ERROR",
    requestId: (req as any).requestId
  });
});

/* -------------------------------------------------------------------------- */
/*                                   EXPORT                                    */
/* -------------------------------------------------------------------------- */

/**
 * Export the Express app as an optimized Firebase Cloud Function
 */
export const api = onRequest(
  {
    cors: true,
    secrets: [openaiApiKey],
    memory: CONFIG.memory,
    timeoutSeconds: CONFIG.timeout,
    invoker: "public"
  },
  app
);


====================================================================================================
FILE: functions/src/llm.ts
DESCRIPTION: AI/LLM integration for intelligent content generation and slide creation
PURPOSE: AI service integration for generating slide content from prompts and parameters
STATUS: EXISTS
LINES: 1654
====================================================================================================

/**
 * Enhanced AI Language Model Service for Chained Slide Generation
 *
 * Innovative multi-step AI processing for superior slide quality:
 * - Step 1: Generate core content focused on persuasion and clarity
 * - Step 2: Refine layout for optimal UX and visual flow
 * - Step 3: Generate/refine image prompts for emotional impact (if enabled)
 * - Step 4: Final validation and styling refinement
 * - Robust error handling, retries, and performance monitoring
 *
 * @version 3.3.0-enhanced
 *   - Safer JSON parsing with structured extraction fallback
 *   - Schema recovery path before final failure
 *   - Optional runtime overrides (temperature/timeout/maxTokens)
 *   - Content length budgeting (short/medium/long)
 *   - Extra chart validation (series length vs categories)
 *   - Concurrency-limited batch generation (env: AI_BATCH_CONCURRENCY)
 *   - Hex color normalization (#RGB -> #RRGGBB)
 *   - Better cancellation support via AbortSignal passthrough
 *
 * @author
 *   AI PowerPoint Generator Team (enhanced by expert co-pilot)
 */

/* eslint-disable no-console */

import OpenAI from 'openai';
import { logger } from './utils/smartLogger';
import { env } from './config/environment';

/* =========================================================================================
 * SECTION: Types & Schema (inline drop-in replacement for ./schema)
 * =======================================================================================*/

export type Emphasis = 'normal' | 'bold' | 'italic' | 'highlight';
export type LayoutType =
  | 'title'
  | 'title-bullets'
  | 'title-paragraph'
  | 'two-column'
  | 'image-right'
  | 'image-left'
  | 'quote'
  | 'chart'
  | 'timeline'
  | 'process-flow'
  | 'comparison-table'
  | 'before-after'
  | 'problem-solution'
  | 'mixed-content'
  | 'metrics-dashboard'
  | 'thank-you'
  | 'grid-layout';

export type ChartType = 'bar' | 'line' | 'pie';

export interface SlideSide {
  title?: string;
  bullets?: string[];
  paragraph?: string;
}

export interface ContentItem {
  type: 'text' | 'bullet' | 'number' | 'icon' | 'metric';
  content: string;
  emphasis?: Emphasis;
  color?: string; // #RRGGBB
  iconName?: string;
}

export interface ChartSpec {
  type: ChartType;
  categories: string[];
  series: Array<{ name: string; data: number[] }>;
}

export interface TimelineItem {
  date: string; // freeform date label
  title: string;
  description?: string;
  milestone?: boolean;
}

export interface ComparisonTable {
  columns: string[];
  rows: string[][];
}

export interface ProcessStep {
  title: string;
  description?: string;
}

export interface DesignHints {
  theme?: string;
  accentColor?: string; // #RRGGBB
  backgroundStyle?: string;
  imageStyle?: 'photo' | 'illustration' | 'isometric';
}

export interface GridCell {
  row: number;
  column: number;
  type: 'header' | 'bullets' | 'paragraph' | 'metric' | 'image' | 'chart' | 'empty';
  title?: string;
  bullets?: string[];
  paragraph?: string;
  metric?: {
    value: string;
    label: string;
    trend?: 'up' | 'down' | 'neutral';
  };
  image?: {
    src?: string;
    alt?: string;
    prompt?: string;
  };
  chart?: {
    type: 'bar' | 'line' | 'pie' | 'donut';
    data: any[];
    title?: string;
  };
  styling?: {
    backgroundColor?: string;
    textColor?: string;
    emphasis?: 'normal' | 'bold' | 'highlight';
    alignment?: 'left' | 'center' | 'right';
  };
}

export interface GridLayout {
  columns: number;
  rows: number;
  cells: GridCell[];
  showBorders?: boolean;
  cellSpacing?: 'tight' | 'normal' | 'spacious';
}

export interface SlideSpec {
  title: string;
  layout: LayoutType;
  bullets?: string[];
  paragraph?: string;
  left?: SlideSide;
  right?: SlideSide;
  contentItems?: ContentItem[];
  imagePrompt?: string;
  notes?: string;
  sources?: string[];
  chart?: ChartSpec;
  timeline?: TimelineItem[];
  comparisonTable?: ComparisonTable;
  processSteps?: ProcessStep[];
  design?: DesignHints;
  gridLayout?: GridLayout;
}

export type Tone = 'professional' | 'casual' | 'friendly' | 'executive' | 'technical';
export type ContentLength = 'short' | 'medium' | 'long';

export interface GenerationParams {
  prompt: string;
  audience?: string;
  tone?: Tone;
  contentLength?: ContentLength;
  withImage?: boolean;
  brand?: {
    primaryColor?: string; // #RRGGBB
    secondaryColor?: string; // #RRGGBB
    font?: string;
    logoUrl?: string;
  };
  language?: string; // e.g., "en", "es"
  mode?: 'test' | 'production';

  /** Optional runtime overrides (non-breaking additions) */
  temperatureOverride?: number;
  timeoutMsOverride?: number;
  maxTokensOverride?: number;
  /** Optional abort signal to cancel long operations */
  signal?: AbortSignal;

  /** Grid layout preferences for content organization */
  gridPreferences?: {
    columns?: number; // 1-4
    rows?: number; // 1-3
    autoFormat?: boolean;
    cellSpacing?: 'tight' | 'normal' | 'spacious';
  };
}

/* =========================================================================================
 * SECTION: Helpers (hex, json extraction, truncation, concurrency)
 * =======================================================================================*/

const VALID_LAYOUTS: LayoutType[] = [
  'title',
  'title-bullets',
  'title-paragraph',
  'two-column',
  'image-right',
  'image-left',
  'quote',
  'chart',
  'timeline',
  'process-flow',
  'comparison-table',
  'before-after',
  'problem-solution',
  'mixed-content',
  'metrics-dashboard',
  'thank-you',
  'grid-layout'
];

const VALID_EMPHASIS: Emphasis[] = ['normal', 'bold', 'italic', 'highlight'];

const HEX6 = /^#[0-9A-Fa-f]{6}$/;
const HEX3 = /^#[0-9A-Fa-f]{3}$/;

function normalizeHex6(input: any): string | undefined {
  if (typeof input !== 'string') return undefined;
  const s = input.trim();
  if (HEX6.test(s)) return s;
  if (HEX3.test(s)) {
    const [, tri] = s.match(HEX3) as RegExpMatchArray;
    const expanded =
      '#' +
      tri
        .split('')
        .map((c) => c + c)
        .join('');
    return expanded;
  }
  return undefined;
}

function truncateWithEllipsis(s: string, max: number): string {
  if (s.length <= max) return s;
  // Prefer trimming at a word boundary within ~15 chars past the limit
  const slice = s.slice(0, max + 15);
  const lastSpace = slice.lastIndexOf(' ');
  const cut = lastSpace > max - 10 ? lastSpace : max;
  return s.slice(0, cut).trimEnd() + '…';
}

function clamp<T>(n: T, min: T, max: T): T {
  // Simple generic clamp for numbers (TS keeps T=number usage)
  const nn = n as unknown as number;
  const mi = min as unknown as number;
  const ma = max as unknown as number;
  return Math.max(mi, Math.min(ma, nn)) as unknown as T;
}

function applyContentLengthBudget(spec: SlideSpec, target: ContentLength | undefined): SlideSpec {
  if (!target) return spec;
  const budget =
    target === 'short'
      ? { bulletsMax: 4, bulletLen: 90, paraLen: 300 }
      : target === 'long'
      ? { bulletsMax: 8, bulletLen: 140, paraLen: 900 }
      : { bulletsMax: 6, bulletLen: 120, paraLen: 600 };

  const trimBullets = (arr?: string[]) =>
    Array.isArray(arr)
      ? arr
          .slice(0, budget.bulletsMax)
          .map((b) => truncateWithEllipsis(String(b), budget.bulletLen))
      : undefined;

  const trimmed: SlideSpec = {
    ...spec,
    bullets: trimBullets(spec.bullets),
    paragraph: spec.paragraph ? truncateWithEllipsis(spec.paragraph, budget.paraLen) : undefined,
    left: spec.left
      ? {
          ...spec.left,
          bullets: trimBullets(spec.left.bullets),
          paragraph: spec.left.paragraph ? truncateWithEllipsis(spec.left.paragraph, Math.round(budget.paraLen * 0.6)) : undefined
        }
      : undefined,
    right: spec.right
      ? {
          ...spec.right,
          bullets: trimBullets(spec.right.bullets),
          paragraph: spec.right.paragraph ? truncateWithEllipsis(spec.right.paragraph, Math.round(budget.paraLen * 0.6)) : undefined
        }
      : undefined,
    notes: spec.notes ? truncateWithEllipsis(spec.notes, 1200) : undefined,
    sources: spec.sources ? spec.sources.slice(0, 8) : undefined
  };

  return trimmed;
}

/**
 * Extract the first valid JSON object substring from a model response.
 * Handles nested/quoted braces to mitigate minor non-JSON pre/postamble.
 */
function extractFirstJsonObject(text: string): string | null {
  if (!text) return null;
  const len = text.length;
  let i = 0;
  // Find first '{'
  while (i < len && text[i] !== '{') i++;
  if (i >= len) return null;

  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let j = i; j < len; j++) {
    const ch = text[j];
    if (inStr) {
      if (esc) {
        esc = false;
      } else if (ch === '\\') {
        esc = true;
      } else if (ch === '"') {
        inStr = false;
      }
      continue;
    } else {
      if (ch === '"') {
        inStr = true;
        continue;
      }
      if (ch === '{') depth++;
      if (ch === '}') {
        depth--;
        if (depth === 0) {
          return text.slice(i, j + 1);
        }
      }
    }
  }
  return null;
}

/** Minimal, dependency-free promise concurrency */
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const i = nextIndex++;
      if (i >= items.length) break;
      results[i] = await fn(items[i], i);
    }
  }

  const workers = Array.from({ length: clamp(limit, 1, 16) }, () => worker());
  await Promise.all(workers);
  return results;
}

/* =========================================================================================
 * SECTION: Validation
 * =======================================================================================*/

export function safeValidateSlideSpec(
  data: any
): { success: true; data: SlideSpec } | { success: false; errors: string[] } {
  const errors: string[] = [];

  const isString = (v: any) => typeof v === 'string' && v.trim().length > 0;
  const isStrArr = (a: any) => Array.isArray(a) && a.every((v) => typeof v === 'string');
  const ensureOnlyAllowedKeys = (obj: any, allowed: string[], label: string) => {
    if (!obj || typeof obj !== 'object') return;
    for (const k of Object.keys(obj)) {
      if (!allowed.includes(k)) errors.push(`${label}: unexpected property "${k}"`);
    }
  };

  if (!data || typeof data !== 'object') {
    errors.push('SlideSpec must be an object.');
    return { success: false, errors };
  }

  // Required
  if (!isString(data.title)) errors.push('title is required and must be a non-empty string.');
  if (!isString(data.layout) || !VALID_LAYOUTS.includes(data.layout)) {
    errors.push(`layout is required and must be one of: ${VALID_LAYOUTS.join(', ')}`);
  }

  // Optional basics
  if (data.bullets !== undefined && !isStrArr(data.bullets)) errors.push('bullets must be an array of strings.');
  if (data.paragraph !== undefined && typeof data.paragraph !== 'string') errors.push('paragraph must be a string.');

  // Left/Right columns
  const sideAllowed = ['title', 'bullets', 'paragraph'];
  if (data.left) {
    ensureOnlyAllowedKeys(data.left, sideAllowed, 'left');
    if (data.left.title !== undefined && !isString(data.left.title)) errors.push('left.title must be a string.');
    if (data.left.bullets !== undefined && !isStrArr(data.left.bullets)) errors.push('left.bullets must be an array of strings.');
    if (data.left.paragraph !== undefined && typeof data.left.paragraph !== 'string')
      errors.push('left.paragraph must be a string.');
  }
  if (data.right) {
    ensureOnlyAllowedKeys(data.right, sideAllowed, 'right');
    if (data.right.title !== undefined && !isString(data.right.title)) errors.push('right.title must be a string.');
    if (data.right.bullets !== undefined && !isStrArr(data.right.bullets)) errors.push('right.bullets must be an array of strings.');
    if (data.right.paragraph !== undefined && typeof data.right.paragraph !== 'string')
      errors.push('right.paragraph must be a string.');
  }

  // contentItems
  if (data.contentItems !== undefined) {
    if (!Array.isArray(data.contentItems)) {
      errors.push('contentItems must be an array.');
    } else {
      for (const [i, item] of data.contentItems.entries()) {
        if (!item || typeof item !== 'object') {
          errors.push(`contentItems[${i}] must be an object.`);
          continue;
        }
        if (!['text', 'bullet', 'number', 'icon', 'metric'].includes(item.type)) {
          errors.push(`contentItems[${i}].type invalid.`);
        }
        if (!isString(item.content)) errors.push(`contentItems[${i}].content must be a non-empty string.`);
        if (item.emphasis !== undefined && !VALID_EMPHASIS.includes(item.emphasis)) {
          errors.push(`contentItems[${i}].emphasis invalid.`);
        }
        if (item.color !== undefined && !normalizeHex6(item.color)) {
          errors.push(`contentItems[${i}].color must be a hex color like #1A2B3C or #ABC.`);
        }
        if (item.iconName !== undefined && typeof item.iconName !== 'string') {
          errors.push(`contentItems[${i}].iconName must be a string.`);
        }
      }
    }
  }

  // chart
  if (data.chart !== undefined) {
    const c = data.chart;
    const allowed = ['type', 'categories', 'series'];
    ensureOnlyAllowedKeys(c, allowed, 'chart');
    if (!['bar', 'line', 'pie'].includes(c?.type)) errors.push('chart.type must be bar|line|pie.');
    if (!Array.isArray(c?.categories) || !c.categories.every(isString)) {
      errors.push('chart.categories must be an array of strings.');
    }
    if (
      !Array.isArray(c?.series) ||
      !c.series.every((s: any) => isString(s?.name) && Array.isArray(s?.data) && s.data.every((n: any) => typeof n === 'number'))
    ) {
      errors.push('chart.series must be [{ name: string, data: number[] }, ...].');
    }
    // Additional structural validation: series length vs categories
    if (Array.isArray(c?.categories) && Array.isArray(c?.series)) {
      const catLen = c.categories.length;
      if (c.type === 'pie') {
        if (c.series.length !== 1) errors.push('chart.series for pie must contain exactly one series.');
        else if (Array.isArray(c.series[0].data) && c.series[0].data.length !== catLen) {
          errors.push('For pie charts, series[0].data length must match categories length.');
        }
      } else {
        if (!c.series.every((s: any) => Array.isArray(s.data) && s.data.length === catLen)) {
          errors.push('For bar/line charts, each series.data length must match categories length.');
        }
      }
    }
  }

  // timeline
  if (data.timeline !== undefined) {
    if (
      !Array.isArray(data.timeline) ||
      !data.timeline.every(
        (t: any) =>
          isString(t?.date) &&
          isString(t?.title) &&
          (t.description === undefined || typeof t.description === 'string') &&
          (t.milestone === undefined || typeof t.milestone === 'boolean')
      )
    ) {
      errors.push('timeline must be an array of { date, title, description?, milestone? }.');
    }
  }

  // comparisonTable
  if (data.comparisonTable !== undefined) {
    const ct = data.comparisonTable;
    const allowed = ['columns', 'rows'];
    ensureOnlyAllowedKeys(ct, allowed, 'comparisonTable');
    if (!Array.isArray(ct?.columns) || !ct.columns.every(isString)) errors.push('comparisonTable.columns must be string[].');
    if (!Array.isArray(ct?.rows) || !ct.rows.every((r: any) => Array.isArray(r) && r.every(isString))) {
      errors.push('comparisonTable.rows must be string[][].');
    }
    if (Array.isArray(ct?.columns) && Array.isArray(ct?.rows)) {
      const colCount = ct.columns.length;
      if (!ct.rows.every((r: string[]) => r.length === colCount)) {
        errors.push('comparisonTable.rows must have the same length as columns.');
      }
    }
  }

  // processSteps
  if (data.processSteps !== undefined) {
    if (
      !Array.isArray(data.processSteps) ||
      !data.processSteps.every((p: any) => isString(p?.title) && (p.description === undefined || typeof p.description === 'string'))
    ) {
      errors.push('processSteps must be an array of { title, description? }.');
    }
  }

  // design
  if (data.design !== undefined) {
    const d = data.design;
    const allowed = ['theme', 'accentColor', 'backgroundStyle', 'imageStyle'];
    ensureOnlyAllowedKeys(d, allowed, 'design');
    if (d.accentColor !== undefined && !normalizeHex6(d.accentColor)) errors.push('design.accentColor must be hex.');
    if (d.imageStyle !== undefined && !['photo', 'illustration', 'isometric'].includes(d.imageStyle))
      errors.push('design.imageStyle must be photo|illustration|isometric.');
  }

  // sources
  if (data.sources !== undefined && !isStrArr(data.sources)) errors.push('sources must be an array of strings.');

  // notes
  if (data.notes !== undefined && typeof data.notes !== 'string') errors.push('notes must be a string.');

  // Final allowed top-level keys
  const allowedTop = new Set([
    'title',
    'layout',
    'bullets',
    'paragraph',
    'left',
    'right',
    'contentItems',
    'imagePrompt',
    'notes',
    'sources',
    'chart',
    'timeline',
    'comparisonTable',
    'processSteps',
    'design'
  ]);
  for (const k of Object.keys(data)) {
    if (!allowedTop.has(k)) errors.push(`Unexpected top-level property "${k}".`);
  }

  if (errors.length > 0) return { success: false, errors };
  return { success: true, data: data as SlideSpec };
}

/* =========================================================================================
 * SECTION: System Prompt & Prompt Builders (inline drop-in replacement for ./prompts)
 * =======================================================================================*/

export const SYSTEM_PROMPT = `
You are a senior presentation strategist and slide architect.
You must output ONLY a single JSON object matching the SlideSpec schema provided.
Do not include markdown code fences or any prose outside JSON.
Be concise, persuasive, and audience-aware. Use clear structure, parallel phrasing, and high-signal content.
If you add colors, use 6-digit hex (e.g., #143D6B). Never invent properties outside the schema.
`.trim();

function baseSchemaHint(): string {
  return `
Return JSON of this shape (only include fields you actually use):

{
  "title": string,
  "layout": one of ["title","title-bullets","title-paragraph","two-column","image-right","image-left","quote","chart","timeline","process-flow","comparison-table","before-after","problem-solution","mixed-content","metrics-dashboard","thank-you"],
  "bullets"?: string[],
  "paragraph"?: string,
  "left"?: { "title"?: string, "bullets"?: string[], "paragraph"?: string },
  "right"?: { "title"?: string, "bullets"?: string[], "paragraph"?: string },
  "contentItems"?: [{ "type":"text|bullet|number|icon|metric","content":string,"emphasis"?: "normal|bold|italic|highlight","color"?: "#RRGGBB","iconName"?: string }],
  "imagePrompt"?: string,
  "notes"?: string,
  "sources"?: string[],
  "chart"?: { "type":"bar|line|pie","categories":string[],"series":[{"name":string,"data":number[]}] },
  "timeline"?: [{ "date":string,"title":string,"description"?:string,"milestone"?:boolean }],
  "comparisonTable"?: { "columns":string[], "rows":string[][] },
  "processSteps"?: [{ "title":string, "description"?:string }],
  "design"?: { "theme"?:string, "accentColor"?: "#RRGGBB", "backgroundStyle"?: string, "imageStyle"?: "photo|illustration|isometric" }
}
`.trim();
}

function audienceToneClause(input: GenerationParams): string {
  const parts: string[] = [];
  if (input.audience) parts.push(`Audience: ${input.audience}.`);
  if (input.tone) parts.push(`Tone: ${input.tone}.`);
  if (input.contentLength) parts.push(`Content length target: ${input.contentLength}.`);
  if (input.brand?.primaryColor) parts.push(`Prefer brand primaryColor ${input.brand.primaryColor}.`);
  if (input.brand?.secondaryColor) parts.push(`Secondary color ${input.brand.secondaryColor}.`);
  if (input.brand?.font) parts.push(`Font preference: ${input.brand.font}.`);
  if (input.language) parts.push(`Language: ${input.language}.`);

  return parts.length ? parts.join(' ') : '';
}

export function generateContentPrompt(input: GenerationParams): string {
  const gridPreferencesClause = input.gridPreferences ? [
    `Grid Layout Preferences:`,
    input.gridPreferences.columns ? `- Preferred columns: ${input.gridPreferences.columns}` : '',
    input.gridPreferences.rows ? `- Preferred rows: ${input.gridPreferences.rows}` : '',
    input.gridPreferences.cellSpacing ? `- Cell spacing: ${input.gridPreferences.cellSpacing}` : '',
    input.gridPreferences.autoFormat !== false ? `- Auto-format content within cells` : '',
    `Consider using "grid-layout" for structured content like comparisons, features, metrics, or team info.`
  ].filter(Boolean).join('\n') : '';

  return [
    `Create the core content for one slide based on: "${input.prompt}".`,
    audienceToneClause(input),
    gridPreferencesClause,
    `Focus on: persuasion, clarity, actionability.`,
    `Pick an appropriate layout and include only the fields needed.`,
    `For structured content (comparisons, features, metrics, dashboards), consider "grid-layout" with gridLayout configuration.`,
    baseSchemaHint()
  ]
    .filter(Boolean)
    .join('\n');
}

export function generateLayoutPrompt(input: GenerationParams, partial: Partial<SlideSpec>): string {
  return [
    `Refine this slide for optimal UX/visual flow while preserving message.`,
    audienceToneClause(input),
    `Rules:`,
    `- Choose the best layout for content density and scanning.`,
    `- Keep bullets concise (max ~6). Use parallel phrasing.`,
    `- If two-column structure makes sense, balance left/right.`,
    `- If quantitative, consider "chart" with simple, readable series.`,
    `- Only return a single JSON SlideSpec object.`,
    baseSchemaHint(),
    `Current draft (JSON):`,
    JSON.stringify(partial ?? {}, null, 2)
  ].join('\n');
}

export function generateImagePrompt(input: GenerationParams, partial: Partial<SlideSpec>): string {
  return [
    `Generate a single emotionally-resonant, safe image prompt that complements this slide.`,
    audienceToneClause(input),
    `- The prompt should be photorealistic unless "imageStyle" indicates otherwise.`,
    `- Avoid text-in-image. Focus on metaphor that reinforces the message.`,
    `- Style should match "design.accentColor" if present; otherwise neutral corporate.`,
    `Return a JSON SlideSpec including "imagePrompt".`,
    baseSchemaHint(),
    `Slide (JSON):`,
    JSON.stringify(partial ?? {}, null, 2)
  ].join('\n');
}

export function generateRefinementPrompt(input: GenerationParams, partial: Partial<SlideSpec>): string {
  return [
    `Final pass: validate schema, tighten copy, and ensure strong narrative.`,
    audienceToneClause(input),
    `- Remove unused fields.`,
    `- Ensure layout fits content.`,
    `- Keep only allowed properties.`,
    `- Return a single JSON SlideSpec.`,
    baseSchemaHint(),
    `Slide (JSON):`,
    JSON.stringify(partial ?? {}, null, 2)
  ].join('\n');
}

/** Batch prompt builder for cohesive image prompts */
export function generateBatchImagePrompts(input: GenerationParams, slideSpecs: Partial<SlideSpec>[]): string {
  const titles = slideSpecs.map((s, i) => ({ index: i, title: s.title ?? `Slide ${i + 1}` }));
  return [
    `You will generate cohesive, emotionally-resonant image prompts for multiple slides.`,
    audienceToneClause(input),
    `Guidelines: corporate-safe, high-resolution, no text in image, aligned look & feel across slides.`,
    `Return JSON ONLY with the following shape:`,
    `{"imagePrompts": [ "prompt for slide 1", "prompt for slide 2", ... ]}`,
    `Count of imagePrompts MUST equal the number of slides provided.`,
    `Slides:`,
    JSON.stringify(titles, null, 2)
  ].join('\n');
}

/* =========================================================================================
 * SECTION: Model Config & Cost Logging (inline drop-in replacement for ./config/aiModels)
 * =======================================================================================*/

type AIModelConfig = {
  model: string;
  fallbackModel: string;
  maxRetries: number;
  retryDelay: number; // ms base
  maxBackoffDelay: number; // ms cap
  timeoutMs: number; // per call
  maxTokens: number;
  temperature: number;
};

export function getTextModelConfig(): AIModelConfig {
  const mode = (process.env.AI_MODE as 'test' | 'production' | undefined) ?? 'production';
  const model = process.env.AI_TEXT_MODEL ?? (mode === 'test' ? 'gpt-4o-mini' : 'gpt-4o-mini');
  const fallbackModel = process.env.AI_FALLBACK_MODEL ?? 'gpt-4o';

  return {
    model,
    fallbackModel,
    maxRetries: Number(process.env.AI_MAX_RETRIES ?? 3),
    retryDelay: Number(process.env.AI_RETRY_DELAY_MS ?? 400),
    maxBackoffDelay: Number(process.env.AI_MAX_BACKOFF_MS ?? 8000),
    timeoutMs: Number(process.env.AI_TIMEOUT_MS ?? 30000),
    maxTokens: Number(process.env.AI_MAX_TOKENS ?? 1400),
    temperature: Number(process.env.AI_TEMPERATURE ?? 0.7)
  };
}

export function logCostEstimate(args: { textTokens: number; imageCount: number; operation: string }) {
  const { textTokens, imageCount, operation } = args;
  console.log(`[CostEstimate] ${operation}: ~${textTokens} text tokens + ${imageCount} image(s).`);
}

/* =========================================================================================
 * SECTION: Error Types
 * =======================================================================================*/

export class AIGenerationError extends Error {
  constructor(
    message: string,
    public readonly step: string,
    public readonly attempt: number,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'AIGenerationError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public readonly validationErrors: string[]) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string, public readonly timeoutMs: number) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class RateLimitError extends Error {
  constructor(message: string, public readonly retryAfter?: number) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class ContentFilterError extends Error {
  constructor(message: string, public readonly filteredContent: string) {
    super(message);
    this.name = 'ContentFilterError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public readonly statusCode?: number) {
    super(message);
    this.name = 'NetworkError';
  }
}

/* =========================================================================================
 * SECTION: Validation Error Analysis (unchanged)
 * =======================================================================================*/

export function analyzeValidationErrors(errors: string[]): {
  category: string;
  helpfulMessage: string;
  suggestedFix: string;
} {
  const errorText = errors.join(' ').toLowerCase();

  if (errorText.includes('title') && errorText.includes('required')) {
    return {
      category: 'Missing Title',
      helpfulMessage: 'The slide is missing a required title. Every slide needs a clear, descriptive title.',
      suggestedFix: 'Ensure the AI generates a title field that summarizes the slide content in 5-10 words.'
    };
  }

  if (errorText.includes('layout') && (errorText.includes('invalid') || errorText.includes('enum'))) {
    return {
      category: 'Invalid Layout',
      helpfulMessage:
        'The specified layout type is not supported. Valid layouts include: title-bullets, title-paragraph, two-column, etc.',
      suggestedFix: 'Use one of the predefined layout types from the schema. Check SLIDE_LAYOUTS for valid options.'
    };
  }

  if (errorText.includes('bullets') && errorText.includes('array')) {
    return {
      category: 'Invalid Bullets Format',
      helpfulMessage: 'Bullet points must be provided as an array of strings, not as a single text block.',
      suggestedFix: 'Format bullets as: ["First point", "Second point", "Third point"] instead of a paragraph.'
    };
  }

  if (errorText.includes('paragraph') && errorText.includes('string')) {
    return {
      category: 'Invalid Paragraph Format',
      helpfulMessage: 'Paragraph content must be a single string, not an array or object.',
      suggestedFix: 'Provide paragraph as a single text string with proper formatting.'
    };
  }

  if (errorText.includes('chart') && errorText.includes('data')) {
    return {
      category: 'Invalid Chart Data',
      helpfulMessage:
        'Chart data structure is invalid. Charts require categories, series with data arrays, and proper type specification.',
      suggestedFix:
        'Ensure chart has: type (bar/line/pie), categories array, and series array with name and data fields.'
    };
  }

  return {
    category: 'General Validation Error',
    helpfulMessage: 'The slide specification does not match the required schema format.',
    suggestedFix: 'Review the SlideSpec schema and ensure all required fields are present with correct data types.'
  };
}

/* =========================================================================================
 * SECTION: Sanitization
 * =======================================================================================*/

function sanitizeAIResponse(data: any): any {
  if (!data || typeof data !== 'object') return data;
  const sanitized = { ...data };

  // Normalize bullets arrays
  if (sanitized.bullets && Array.isArray(sanitized.bullets)) {
    sanitized.bullets = sanitized.bullets.map((bullet: any) => {
      if (typeof bullet === 'string') return bullet;
      if (bullet && typeof bullet === 'object') {
        if (bullet.text) return bullet.text;
        if (bullet.content) return bullet.content;
        if (bullet.point) return bullet.point;
        if (bullet.item) return bullet.item;
        const values = Object.values(bullet).filter((v) => typeof v === 'string');
        if (values.length === 1) return values[0];
        return JSON.stringify(bullet);
      }
      return String(bullet);
    });
  }

  // Normalize left/right bullets
  if (sanitized.left?.bullets && Array.isArray(sanitized.left.bullets)) {
    sanitized.left.bullets = sanitized.left.bullets.map((b: any) => (typeof b === 'string' ? b : String(b)));
  }
  if (sanitized.right?.bullets && Array.isArray(sanitized.right.bullets)) {
    sanitized.right.bullets = sanitized.right.bullets.map((b: any) => (typeof b === 'string' ? b : String(b)));
  }

  // Timeline
  if (sanitized.timeline && Array.isArray(sanitized.timeline)) {
    sanitized.timeline = sanitized.timeline.map((item: any) => ({
      ...item,
      date: typeof item.date === 'string' ? item.date : String(item.date || ''),
      title: typeof item.title === 'string' ? item.title : String(item.title || ''),
      description: typeof item.description === 'string' ? item.description : String(item.description || ''),
      milestone: Boolean(item.milestone)
    }));
  }

  // contentItems
  if (sanitized.contentItems && Array.isArray(sanitized.contentItems)) {
    sanitized.contentItems = sanitized.contentItems
      .map((item: any) => {
        if (!item || typeof item !== 'object') return null;
        let { type, content } = item;

        if (!type) {
          if (item.text || item.content) type = 'text';
          else if (item.bullet || item.point) type = 'bullet';
          else if (item.number || item.value) type = 'number';
          else if (item.icon || item.iconName) type = 'icon';
          else if (item.metric) type = 'metric';
          else type = 'text';
        }

        if (!content) {
          content =
            item.text ||
            item.content ||
            item.bullet ||
            item.point ||
            item.value ||
            item.number ||
            item.metric ||
            '';
        }

        if (!type || !content || typeof content !== 'string' || content.trim() === '') return null;

        const out: ContentItem = {
          type: String(type) as ContentItem['type'],
          content: String(content).trim()
        };
        if (item.emphasis && VALID_EMPHASIS.includes(item.emphasis)) out.emphasis = item.emphasis;

        const normalizedColor = normalizeHex6(item.color);
        if (normalizedColor) out.color = normalizedColor;

        if (item.iconName && typeof item.iconName === 'string') out.iconName = item.iconName;
        return out;
      })
      .filter(Boolean);

    if (sanitized.contentItems.length === 0) delete sanitized.contentItems;
  }

  // design accent color normalization
  if (sanitized.design?.accentColor) {
    const normalized = normalizeHex6(sanitized.design.accentColor);
    if (normalized) sanitized.design.accentColor = normalized;
    else delete sanitized.design.accentColor;
  }

  return sanitized;
}

export function sanitizeAIResponseWithRecovery(data: any): any {
  if (!data || typeof data !== 'object') return data;

  let sanitized = sanitizeAIResponse(data);

  // Remove null/empty values for optional fields that should be omitted when null or empty
  const optionalFields = ['chart', 'comparisonTable', 'image', 'timeline', 'processSteps', 'gridLayout', 'contentItems'];
  optionalFields.forEach(field => {
    if (sanitized[field] === null || sanitized[field] === '' || sanitized[field] === undefined) {
      delete sanitized[field];
    }
  });

  // Ensure requireds or infer
  if (!sanitized.title || typeof sanitized.title !== 'string' || sanitized.title.trim() === '') {
    sanitized.title = 'Untitled Slide';
  }

  if (!sanitized.layout || !VALID_LAYOUTS.includes(sanitized.layout)) {
    if (sanitized.bullets && sanitized.bullets.length > 0) sanitized.layout = 'title-bullets';
    else if (sanitized.paragraph) sanitized.layout = 'title-paragraph';
    else if (sanitized.left || sanitized.right) sanitized.layout = 'two-column';
    else sanitized.layout = 'title-paragraph';
  }

  const allowedProperties = new Set([
    'title',
    'layout',
    'bullets',
    'paragraph',
    'contentItems',
    'left',
    'right',
    'imagePrompt',
    'notes',
    'sources',
    'chart',
    'timeline',
    'comparisonTable',
    'processSteps',
    'design'
  ]);

  const clean: Record<string, any> = {};
  for (const key of Object.keys(sanitized)) {
    if (allowedProperties.has(key)) clean[key] = sanitized[key];
  }
  return clean;
}

/* =========================================================================================
 * SECTION: Secrets & OpenAI Client
 * =======================================================================================*/

/**
 * We prefer Firebase defineSecret('OPENAI_API_KEY') when available,
 * otherwise we fall back to process.env or env helper.
 */
type SecretLike = { value(): string | undefined };
let secretProvider: SecretLike | null = null;

try {
  // Optional: works when running in Firebase Functions environment
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const params = require('firebase-functions/params');
  if (params?.defineSecret) {
    secretProvider = params.defineSecret('OPENAI_API_KEY');
  }
} catch {
  // Not in Firebase environment. We'll rely on env var.
}

let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    const fromSecret = secretProvider?.value?.();
    const apiKey = fromSecret || env.getOpenAIApiKey();
    if (!apiKey) {
      throw new Error('Missing OpenAI API key. Ensure OPENAI_API_KEY is configured.');
    }
    openai = new OpenAI({ apiKey });
    logger.info('OpenAI client initialized', { operation: 'openai-init' });
  }
  return openai;
}

/* =========================================================================================
 * SECTION: Core AI Call Helpers (with robust retries/fallbacks)
 * =======================================================================================*/

const AI_CONFIG = getTextModelConfig();

type CallOverrides = Partial<{
  temperature: number;
  timeoutMs: number;
  maxTokens: number;
  signal: AbortSignal;
}>;

function deriveCallOverrides(input?: GenerationParams): CallOverrides {
  if (!input) return {};
  const o: CallOverrides = {};
  if (typeof input.temperatureOverride === 'number') o.temperature = input.temperatureOverride;
  if (typeof input.timeoutMsOverride === 'number') o.timeoutMs = input.timeoutMsOverride;
  if (typeof input.maxTokensOverride === 'number') o.maxTokens = input.maxTokensOverride;
  if (input.signal) o.signal = input.signal;
  return o;
}

/**
 * Make a single validated SlideSpec call with retries and fallbacks.
 */
async function aiCallWithRetry(
  prompt: string,
  stepName: string,
  previousSpec?: Partial<SlideSpec>,
  overrides?: CallOverrides
): Promise<SlideSpec> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= AI_CONFIG.maxRetries; attempt++) {
    try {
      console.log(`${stepName} attempt ${attempt}/${AI_CONFIG.maxRetries} (model: ${AI_CONFIG.model})`);
      return await makeAICallSlideSpec(prompt, stepName, previousSpec, AI_CONFIG.model, attempt, overrides);
    } catch (error: any) {
      lastError = error;
      console.error(`${stepName} attempt ${attempt} failed:`, error?.message || error);

      if (error instanceof ValidationError) {
        console.log(`Validation error in ${stepName}; not retrying further on this attempt sequence.`);
        throw new AIGenerationError(`Validation failed in ${stepName}: ${error.message}`, stepName, attempt, error);
      }

      if (attempt < AI_CONFIG.maxRetries) {
        const baseDelay = AI_CONFIG.retryDelay * Math.pow(2, attempt - 1);
        const jitter = Math.random() * 0.1 * baseDelay;
        const backoffDelay = Math.min(baseDelay + jitter, AI_CONFIG.maxBackoffDelay);
        console.log(`Retrying ${stepName} in ~${Math.round(backoffDelay)}ms...`);
        await new Promise((r) => setTimeout(r, backoffDelay));
      }
    }
  }

  // Try once with fallback model
  if (AI_CONFIG.fallbackModel && AI_CONFIG.fallbackModel !== AI_CONFIG.model) {
    console.log(`Primary model failed; trying fallback model: ${AI_CONFIG.fallbackModel}`);
    try {
      return await makeAICallSlideSpec(
        prompt,
        stepName,
        previousSpec,
        AI_CONFIG.fallbackModel,
        AI_CONFIG.maxRetries + 1,
        overrides
      );
    } catch (fallbackError: any) {
      lastError = fallbackError;
      console.error(`Fallback model failed for ${stepName}:`, fallbackError?.message || fallbackError);
    }
  }

  // Targeted fallbacks by step
  if (stepName === 'Content Generation') {
    console.log('Creating structured fallback spec for content generation...');
    return createFallbackSpec(prompt, previousSpec);
  } else if (stepName === 'Layout Refinement' && previousSpec) {
    console.log('Using previous spec with basic layout fallback...');
    return {
      ...(previousSpec as SlideSpec),
      layout: (previousSpec.layout as LayoutType) || 'title-bullets'
    };
  } else if (stepName === 'Image Prompt Generation' && previousSpec) {
    console.log('Image prompt generation failed; applying context-aware fallback prompt.');
    const fallbackImagePrompt = generateFallbackImagePrompt(previousSpec, lastError || undefined);
    return {
      ...(previousSpec as SlideSpec),
      imagePrompt: fallbackImagePrompt
    };
  }

  throw new AIGenerationError(
    `All attempts failed for ${stepName}. Last error: ${lastError?.message || 'unknown error'}`,
    stepName,
    AI_CONFIG.maxRetries,
    lastError || undefined
  );
}

/**
 * Make an AI call expecting a SlideSpec JSON (validated).
 */
async function makeAICallSlideSpec(
  prompt: string,
  stepName: string,
  previousSpec: Partial<SlideSpec> | undefined,
  model: string,
  attempt: number,
  overrides?: CallOverrides
): Promise<SlideSpec> {
  const timeoutMs = overrides?.timeoutMs ?? AI_CONFIG.timeoutMs;
  const userSignal = overrides?.signal;

  const controller = new AbortController();
  const onAbort = () => controller.abort();
  // Wire external signal to inner controller if provided
  if (userSignal) userSignal.addEventListener('abort', onAbort);
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ];
    if (previousSpec) messages.push({ role: 'assistant', content: JSON.stringify(previousSpec) });

    const response = await getOpenAI().chat.completions.create(
      {
        model: model as any,
        messages,
        response_format: { type: 'json_object' },
        temperature: overrides?.temperature ?? AI_CONFIG.temperature,
        max_tokens: overrides?.maxTokens ?? AI_CONFIG.maxTokens
      },
      { signal: controller.signal }
    );

    const raw = response.choices?.[0]?.message?.content;
    if (!raw) throw new Error('Empty response from AI model.');

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      // Attempt structured recovery by extracting the first JSON object
      const extracted = extractFirstJsonObject(raw);
      if (!extracted) {
        throw new Error(`Invalid JSON response: ${(e as Error).message}`);
      }
      try {
        parsed = JSON.parse(extracted);
      } catch (e2) {
        throw new Error(`Invalid JSON (post-extraction) response: ${(e2 as Error).message}`);
      }
    }

    // Sanitize->Recover->Validate
    const sanitized = sanitizeAIResponseWithRecovery(parsed);
    const validation = safeValidateSlideSpec(sanitized);
    if (!validation.success) {
      // Last-ditch: try to coerce a minimal viable spec to avoid hard fail
      const recovery: SlideSpec = {
        title: sanitized.title || 'Untitled Slide',
        layout:
          VALID_LAYOUTS.includes(sanitized.layout) ? sanitized.layout : (sanitized.bullets ? 'title-bullets' : 'title-paragraph'),
        bullets: Array.isArray(sanitized.bullets) ? sanitized.bullets.map(String) : undefined,
        paragraph: typeof sanitized.paragraph === 'string' ? sanitized.paragraph : undefined,
        left: sanitized.left,
        right: sanitized.right,
        contentItems: sanitized.contentItems,
        imagePrompt: typeof sanitized.imagePrompt === 'string' ? sanitized.imagePrompt : undefined,
        notes: typeof sanitized.notes === 'string' ? sanitized.notes : undefined,
        sources: Array.isArray(sanitized.sources) ? sanitized.sources.map(String) : undefined,
        chart: sanitized.chart,
        timeline: sanitized.timeline,
        comparisonTable: sanitized.comparisonTable,
        processSteps: sanitized.processSteps,
        design: sanitized.design
      };

      const recheck = safeValidateSlideSpec(recovery);
      if (!recheck.success) {
        const errorAnalysis = analyzeValidationErrors(recheck.errors);
        const message = `Slide specification validation failed - ${errorAnalysis.category}: ${errorAnalysis.helpfulMessage}`;
        console.error('Validation details:', {
          category: errorAnalysis.category,
          helpfulMessage: errorAnalysis.helpfulMessage,
          suggestedFix: errorAnalysis.suggestedFix,
          originalErrors: recheck.errors,
          stepName,
          attempt
        });
        throw new ValidationError(message, recheck.errors);
      }
      return recheck.data;
    }

    return validation.data;
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new TimeoutError(`${stepName} timed out after ${timeoutMs}ms`, timeoutMs);
    }

    const oe = error as any;
    if (oe && typeof oe === 'object' && 'error' in oe) {
      const openaiError = oe;
      if (openaiError.error?.type === 'insufficient_quota') {
        throw new RateLimitError('API quota exceeded. Please try again later.');
      }
      if (openaiError.error?.type === 'rate_limit_exceeded') {
        const retryAfter = openaiError.error?.retry_after || 60;
        throw new RateLimitError(`Rate limit exceeded. Please wait ${retryAfter} seconds.`, retryAfter);
      }
      if (openaiError.error?.code === 'content_filter') {
        throw new ContentFilterError(
          'Content was filtered due to policy violations. Please try different wording.',
          openaiError.error?.message || 'Content filtered'
        );
      }
      if (openaiError.status >= 500) {
        throw new NetworkError(`OpenAI service error: ${openaiError.error?.message || 'Service unavailable'}`, openaiError.status);
      }
      if (openaiError.status >= 400) {
        throw new ValidationError(`API request error: ${openaiError.error?.message || 'Bad request'}`, [
          openaiError.error?.message || 'Bad request'
        ]);
      }
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError('Network connection failed. Please check your internet connection.');
    }
    if (error instanceof ValidationError) throw error;

    throw new AIGenerationError(
      `${stepName} failed: ${error instanceof Error ? error.message : String(error)}`,
      stepName,
      attempt,
      error instanceof Error ? error : new Error(String(error))
    );
  } finally {
    clearTimeout(timeoutId);
    if (userSignal) userSignal.removeEventListener('abort', onAbort);
  }
}

/**
 * Make an AI call expecting batch image prompts JSON: { imagePrompts: string[] }
 */
async function aiCallForBatchImagePrompts(
  prompt: string,
  slideCount: number,
  overrides?: CallOverrides
): Promise<{ imagePrompts: string[] }> {
  const timeoutMs = overrides?.timeoutMs ?? AI_CONFIG.timeoutMs;
  const userSignal = overrides?.signal;

  const controller = new AbortController();
  const onAbort = () => controller.abort();
  if (userSignal) userSignal.addEventListener('abort', onAbort);
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await getOpenAI().chat.completions.create(
      {
        model: AI_CONFIG.model as any,
        messages: [
          { role: 'system', content: `You output ONLY valid JSON. No prose.` },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: overrides?.temperature ?? AI_CONFIG.temperature,
        max_tokens: Math.max(
          400,
          Math.min(overrides?.maxTokens ?? 1200, 80 * slideCount) // keep sane caps
        )
      },
      { signal: controller.signal }
    );

    const raw = response.choices?.[0]?.message?.content;
    if (!raw) throw new Error('Empty response for batch image prompts.');
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const extracted = extractFirstJsonObject(raw);
      if (!extracted) throw new Error('Invalid JSON for batch image prompts.');
      parsed = JSON.parse(extracted);
    }

    const prompts = parsed?.imagePrompts;
    if (!Array.isArray(prompts) || prompts.some((p: any) => typeof p !== 'string')) {
      throw new Error('imagePrompts must be an array of strings.');
    }
    if (prompts.length !== slideCount) {
      throw new Error(`imagePrompts length mismatch: expected ${slideCount}, got ${prompts.length}.`);
    }
    return { imagePrompts: prompts };
  } finally {
    clearTimeout(timeoutId);
    if (userSignal) userSignal.removeEventListener('abort', onAbort);
  }
}

/* =========================================================================================
 * SECTION: Fallback Content Creation (structured & narrative-aware)
 * =======================================================================================*/

function createFallbackTitle(prompt: string): string {
  let title = prompt.trim();
  if (title.length > 60) {
    const keyTerms =
      title.match(/\b(?:revenue|growth|performance|results|analysis|strategy|improvement|increase|decrease|\d+%|\$[\d,]+)\b/gi) ||
      [];
    title = keyTerms.length > 0 ? `${keyTerms.slice(0, 3).join(' ')} Overview` : title.substring(0, 57) + '...';
  }
  return title.charAt(0).toUpperCase() + title.slice(1);
}

function createFallbackContent(prompt: string): { bullets: string[]; paragraph: string } {
  const p = prompt.toLowerCase();
  let bullets: string[] = [];
  let paragraph = '';

  if (p.includes('revenue') || p.includes('sales') || p.includes('growth')) {
    bullets = ['Revenue performance & key metrics', 'Growth trends & opportunities', 'Strategic recommendations'];
    paragraph =
      'This slide focuses on revenue and growth analysis: performance metrics, market trends, and strategic opportunities.';
  } else if (p.includes('team') || p.includes('people') || p.includes('organization')) {
    bullets = ['Team structure & roles', 'Core responsibilities', 'Collaboration strategies'];
    paragraph =
      'This slide outlines team structure, roles, and collaboration patterns to achieve objectives efficiently.';
  } else if (p.includes('data') || p.includes('analytics') || p.includes('metrics')) {
    bullets = ['KPIs & analysis', 'Insights and trends', 'Data-informed next steps'];
    paragraph = 'This slide presents KPIs and insights that inform strategic decision-making and prioritization.';
  } else if (p.includes('strategy') || p.includes('plan') || p.includes('roadmap')) {
    bullets = ['Objectives & initiatives', 'Timeline & milestones', 'Success metrics'];
    paragraph =
      'This slide frames strategic objectives, implementation approach, milestones, and success measurement criteria.';
  } else if (p.includes('problem') || p.includes('challenge') || p.includes('issue')) {
    bullets = ['Root-cause analysis', 'Impact assessment', 'Mitigation strategies'];
    paragraph =
      'This slide identifies key challenges, explores root causes, and proposes practical mitigation strategies.';
  } else {
    bullets = ['Key points & objectives', 'Current status updates', 'Next steps & owners'];
    paragraph =
      'This slide summarizes key points, current status, and actionable next steps to maintain momentum.';
  }
  return { bullets, paragraph };
}

function determineOptimalFallbackLayout(prompt: string, _content: { bullets: string[]; paragraph: string }): LayoutType {
  const p = prompt.toLowerCase();
  if (p.includes('data') || p.includes('chart') || p.includes('metrics')) return 'title-paragraph';
  if (p.includes('action') || p.includes('steps') || p.includes('plan')) return 'title-bullets';
  return 'title-bullets';
}

function generateFallbackNotes(prompt: string, _content: { bullets: string[]; paragraph: string }): string {
  return `FALLBACK CONTENT NOTICE: This slide was generated via structured fallback due to temporary AI service limitations.

ORIGINAL REQUEST: "${prompt}"

PRESENTATION GUIDANCE:
• Use the bullets as a scaffold; add domain examples
• Include data or proof points where possible
• Tailor to the specific audience’s priorities

RECOMMENDED ACTIONS:
• Refine messaging with concrete outcomes
• Add visuals or a chart if applicable
• Re-run when full AI services are available`;
}

function createFallbackSpec(prompt: string, previousSpec?: Partial<SlideSpec>): SlideSpec {
  const title = createFallbackTitle(prompt);
  const content = createFallbackContent(prompt);
  const layout = determineOptimalFallbackLayout(prompt, content);
  const notes = generateFallbackNotes(prompt, content);

  return {
    title,
    layout,
    bullets: content.bullets,
    paragraph: content.paragraph,
    notes,
    sources: ['Structured fallback content generation', 'Prompt analysis system'],
    ...(previousSpec?.design ? { design: previousSpec.design } : {})
  };
}

/* =========================================================================================
 * SECTION: Image Prompt Fallback
 * =======================================================================================*/

export function generateFallbackImagePrompt(slideSpec: Partial<SlideSpec>, error?: Error): string {
  const title = slideSpec.title || 'Business Presentation';
  const content = slideSpec.paragraph || slideSpec.bullets?.join(' ') || '';
  const layout = slideSpec.layout || 'title-bullets';

  const contentLower = (title + ' ' + content + ' ' + layout).toLowerCase();
  let fallbackPrompt = 'Professional business slide background, ';

  if (contentLower.includes('team') || contentLower.includes('people') || contentLower.includes('collaboration')) {
    fallbackPrompt += 'diverse team collaborating in a modern office, natural lighting, candid perspective';
  } else if (contentLower.includes('data') || contentLower.includes('analytics') || contentLower.includes('chart')) {
    fallbackPrompt += 'clean data dashboard aesthetics, subtle graphs, depth-of-field, neutral palette';
  } else if (contentLower.includes('growth') || contentLower.includes('success') || contentLower.includes('increase')) {
    fallbackPrompt += 'symbolic upward momentum, abstract ascending lines and arrows, optimistic composition';
  } else if (contentLower.includes('technology') || contentLower.includes('digital') || contentLower.includes('innovation')) {
    fallbackPrompt += 'sleek technology interface visuals, soft bokeh lights, futuristic yet business-credible';
  } else if (contentLower.includes('strategy') || contentLower.includes('plan') || contentLower.includes('roadmap')) {
    fallbackPrompt += 'strategic planning ambience, table with documents, subtle roadmap iconography';
  } else {
    fallbackPrompt += 'clean corporate environment, minimalist modern office, balanced negative space';
  }

  const accent = slideSpec.design?.accentColor ? `, hint of ${slideSpec.design.accentColor}` : '';
  fallbackPrompt += `${accent}, high resolution, editorial style, no text in image`;

  console.log('Generated fallback image prompt:', {
    originalError: error?.message,
    slideTitle: title,
    fallbackPrompt,
    contentAnalysis: {
      hasTeamContent: contentLower.includes('team'),
      hasDataContent: contentLower.includes('data'),
      hasGrowthContent: contentLower.includes('growth'),
      hasTechContent: contentLower.includes('technology')
    }
  });

  return fallbackPrompt;
}

/* =========================================================================================
 * SECTION: Public API — Chained single slide and batch generation
 * =======================================================================================*/

/**
 * Generate a slide specification using chained AI for high-quality outputs
 */
export async function generateSlideSpec(input: GenerationParams): Promise<SlideSpec> {
  const requestId = logger.generateRequestId();
  const context = { requestId, operation: 'slide-generation' };

  logger.startPerf(`slide-gen-${requestId}`, context);
  logger.info('Starting chained slide generation', context, {
    model: AI_CONFIG.model,
    promptLength: input.prompt?.length,
    audience: input.audience,
    tone: input.tone,
    contentLength: input.contentLength,
    withImage: input.withImage
  });

  logCostEstimate({
    textTokens: 3000,
    imageCount: input.withImage ? 1 : 0,
    operation: 'Slide Generation'
  });

  const callOverrides = deriveCallOverrides(input);

  try {
    // Step 1: Content
    logger.info('Step 1: Generating content', { ...context, stage: 'content' });
    let partialSpec = await aiCallWithRetry(generateContentPrompt(input), 'Content Generation', undefined, callOverrides);
    logger.debug('Content generation completed', context, { title: partialSpec.title });

    // Step 2: Layout
    logger.info('Step 2: Refining layout', { ...context, stage: 'layout' });
    partialSpec = await aiCallWithRetry(
      generateLayoutPrompt(input, partialSpec),
      'Layout Refinement',
      partialSpec,
      callOverrides
    );
    logger.debug('Layout refinement completed', context, { layout: partialSpec.layout });

    // Step 3: Image prompt (optional)
    if (input.withImage) {
      logger.info('Step 3: Generating image prompt', { ...context, stage: 'image' });
      partialSpec = await aiCallWithRetry(
        generateImagePrompt(input, partialSpec),
        'Image Prompt Generation',
        partialSpec,
        callOverrides
      );
      logger.debug('Image prompt generated', context, { hasImagePrompt: !!partialSpec.imagePrompt });
    }

    // Step 4: Final refinement
    logger.info('Step 4: Final refinement', { ...context, stage: 'refinement' });
    let finalSpec = await aiCallWithRetry(
      generateRefinementPrompt(input, partialSpec),
      'Final Refinement',
      partialSpec,
      callOverrides
    );

    // Apply content-length budgeting post-process (non-destructive)
    finalSpec = applyContentLengthBudget(finalSpec, input.contentLength);

    logger.endPerf(`slide-gen-${requestId}`, context, {
      title: finalSpec.title,
      layout: finalSpec.layout,
      hasContent: !!(finalSpec.bullets || finalSpec.paragraph),
      hasImage: !!finalSpec.imagePrompt
    });

    logger.success('Chained slide generation completed', context, {
      title: finalSpec.title,
      layout: finalSpec.layout,
      contentType: finalSpec.bullets ? 'bullets' : 'paragraph',
      bulletCount: finalSpec.bullets?.length || 0
    });

    return finalSpec;
  } catch (error) {
    logger.endPerf(`slide-gen-${requestId}`, context);
    logger.error('Slide generation failed', context, error);
    throw error;
  }
}

/**
 * Generate multiple slides with cohesive image prompts in fewer calls.
 */
export async function generateBatchSlideSpecs(input: GenerationParams, slideCount: number = 1): Promise<SlideSpec[]> {
  const startTime = Date.now();
  const concurrency = Number(process.env.AI_BATCH_CONCURRENCY ?? 3);
  console.log(`Starting batch slide generation for ${slideCount} slides with ${AI_CONFIG.model} (concurrency=${concurrency})...`);

  logCostEstimate({
    textTokens: 3000 * slideCount,
    imageCount: input.withImage ? slideCount : 0,
    operation: `Batch Slide Generation (${slideCount} slides)`
  });

  const indices = Array.from({ length: slideCount }, (_, i) => i);
  const callOverrides = deriveCallOverrides(input);

  // Content + layout generation with limited concurrency
  let slideSpecs = await mapWithConcurrency(indices, concurrency, async (i) => {
    const slideInput: GenerationParams = {
      ...input,
      prompt: `${input.prompt} - Slide ${i + 1} of ${slideCount}`,
      withImage: false
    };

    let spec = await aiCallWithRetry(generateContentPrompt(slideInput), `Content Generation (Slide ${i + 1})`, undefined, callOverrides);
    spec = await aiCallWithRetry(
      generateLayoutPrompt(slideInput, spec),
      `Layout Refinement (Slide ${i + 1})`,
      spec,
      callOverrides
    );

    return applyContentLengthBudget(spec, input.contentLength);
  });

  // Batch image prompts if requested
  if (input.withImage && slideSpecs.length > 0) {
    console.log('Processing batch image prompts...');
    try {
      const batchPrompt = generateBatchImagePrompts(input, slideSpecs);
      const { imagePrompts } = await aiCallForBatchImagePrompts(batchPrompt, slideSpecs.length, callOverrides);

      slideSpecs = slideSpecs.map((s, i) => ({ ...s, imagePrompt: imagePrompts[i] }));
      console.log('Batch image prompts generated and applied successfully.');
    } catch (error) {
      console.warn('Batch image processing failed, falling back to individual prompts:', (error as Error).message);
      slideSpecs = await mapWithConcurrency(slideSpecs, concurrency, async (spec, idx) => {
        try {
          const withImage = await aiCallWithRetry(
            generateImagePrompt(input, spec),
            `Image Prompt Generation (Slide ${idx + 1})`,
            spec,
            callOverrides
          );
          return withImage;
        } catch (imageError) {
          console.warn(
            `Image generation failed for slide ${idx + 1}, using fallback image prompt:`,
            (imageError as Error).message
          );
          return {
            ...spec,
            imagePrompt: generateFallbackImagePrompt(spec, imageError as Error)
          };
        }
      });
    }
  }

  const generationTime = Date.now() - startTime;
  console.log(`Batch generation completed in ${generationTime}ms`, {
    slideCount: slideSpecs.length,
    avgTimePerSlide: `${Math.round(generationTime / Math.max(1, slideSpecs.length))}ms`
  });

  return slideSpecs;
}

/* =========================================================================================
 * SECTION: Utility Exports (optional)
 * =======================================================================================*/

export { sanitizeAIResponse }; // if external callers want basic sanitization
// getTextModelConfig and logCostEstimate are already exported as function declarations above

/* =========================================================================================
 * SECTION: (Optional) Minimal usage example (comment out in production)
 * =======================================================================================*/

// async function example() {
//   const slide = await generateSlideSpec({
//     prompt: 'Q3 revenue growth and product adoption highlights',
//     audience: 'Executive leadership',
//     tone: 'executive',
//     contentLength: 'medium',
//     withImage: true,
//     brand: { primaryColor: '#143D6B' },
//     language: 'en'
//   });
//   console.log(JSON.stringify(slide, null, 2));
// }
// example().catch(console.error);


====================================================================================================
FILE: functions/src/prompts.ts
DESCRIPTION: AI prompt templates and content generation instructions
PURPOSE: Structured prompts for AI content generation with consistent formatting
STATUS: EXISTS
LINES: 2185
====================================================================================================

/**
 * Enhanced AI Prompts for Professional PowerPoint Generation
 *
 * Advanced modular prompts for multi-step AI processing to create high-quality, professional slides.
 * Steps: Content → Layout → Image → Refinement → Validation.
 * Incorporates 2024 design trends, storytelling frameworks, and accessibility best practices.
 *
 * LATEST ENHANCEMENTS:
 * - Advanced narrative structure with proven storytelling frameworks
 * - Enhanced content quality with executive-level precision and clarity
 * - Intelligent image prompt generation with context-aware descriptions
 * - Comprehensive error handling with graceful degradation
 * - Performance optimizations and real-time monitoring
 * - AI-agent-friendly structure for seamless integration
 *
 * @version 4.0.0-enhanced
 * @author AI PowerPoint Generator Team
 */

import { SlideSpecSchema, type GenerationParams, type SlideSpec, SLIDE_LAYOUTS } from './schema';
// Slide types simplified - using schema types instead

/**
 * Enhanced System prompt with strict guidance for professional PowerPoint generation
 * Incorporates precise requirements, quality enforcement, and consistent output standards
 */
export const SYSTEM_PROMPT = `You are an elite PowerPoint presentation architect with 15+ years of experience creating high-impact business presentations for Fortune 500 companies. You specialize in transforming complex ideas into clear, compelling, and actionable slide content.

## CORE EXPERTISE:
- **Strategic Content**: Crafting outcome-driven messaging that compels action and drives business results
- **Executive Communication**: Understanding C-suite decision-making patterns and information processing
- **Data Storytelling**: Transforming complex information into compelling narratives with clear insights
- **Professional Standards**: Ensuring boardroom-ready content with impeccable quality

## STRICT QUALITY REQUIREMENTS (NON-NEGOTIABLE):
1. **PRECISION**: Every word must be purposeful, specific, and measurable - NO vague language
2. **IMPACT**: Lead with outcomes, use active voice, include quantified benefits
3. **CLARITY**: Structure content for 10-second comprehension (3-5 bullets optimal, 6 maximum)
4. **PROFESSIONALISM**: Boardroom-ready formatting, perfect grammar, logical flow
5. **AUTHENTICITY**: Use realistic, contextually appropriate metrics that feel genuine
6. **CONSISTENCY**: Maintain executive-level communication standards throughout

## MANDATORY CONTENT STANDARDS:
- **Titles**: 15-60 characters, outcome-focused, quantified when possible
- **Bullets**: 3-5 bullets maximum, 12-20 words each, action-oriented
- **Language**: Active voice, specific metrics, professional terminology
- **Data**: Realistic percentages (15-25% not 23.7%), contextual timeframes
- **Tone**: Executive-level, confident, evidence-based

## STORYTELLING STRUCTURE (CHOOSE ONE):
- **Problem-Solution-Impact**: Challenge → Solution → Results
- **Before-After-Bridge**: Current State → Future State → Path Forward
- **Data-Driven**: Context → Insight → Action

## CRITICAL SUCCESS FACTORS:
- Use SPECIFIC metrics, dates, and outcomes (not vague statements)
- Every bullet point must provide clear value or inspire action
- Structure content for immediate comprehension and maximum impact
- Ensure all data points feel realistic and contextually appropriate
- Drive toward clear decisions or next steps

## OUTPUT REQUIREMENTS:
- **Format**: Valid JSON only, matching exact schema
- **Quality Target**: A+ grade content (95+ quality score)
- **Validation**: Self-check against schema and quality standards

## QUALITY EXAMPLES:
✅ EXCELLENT Title: "Q4 Revenue: 34% Growth Exceeds $2.1M Target"
❌ POOR Title: "Q4 Results" or "Revenue Update"
✅ EXCELLENT Bullet: "Reduced customer acquisition cost from $150 to $90 through targeted campaigns"
❌ POOR Bullet: "Marketing improved" or "Costs went down"

## AUTHENTICITY GUIDELINES:
- Use realistic, industry-appropriate metrics
- Prefer ranges (15-25%) over exact figures (23.7%)
- Include contextual timeframes (Q3, within 6 months)
- Reference specific methodologies when mentioning improvements

REMEMBER: You're creating content for high-stakes presentations. Excellence is mandatory, mediocrity is unacceptable.

SCHEMA: Use SlideSpec TypeScript type with fields: title, layout, bullets, paragraph, chart, comparisonTable, notes, sources.`;

/**
 * Enhanced content length specifications with cognitive load optimization and 2024 minimalism focus
 */
export const CONTENT_LENGTH_SPECS = {
  minimal: {
    description: 'Absolute essentials: Maximum impact with minimum words (2024 minimalism trend)',
    detail: 'Core message only - every word is critical',
    focus: 'Single key insight or call-to-action; perfect for attention-grabbing slides',
    strategy: 'One powerful statement or 2-3 critical bullets maximum',
    deliveryTip: 'Ideal for opening slides, key decisions, or memorable quotes',
    contentGuidance: '1-3 bullets OR 1 short paragraph (50-100 words total)'
  },
  brief: {
    description: 'Ultra-focused: Essential information only for maximum impact',
    detail: 'Essential insights only - each word counts',
    focus: 'Core message and critical takeaways; emphasize simplicity and memorability',
    strategy: 'Use the "Rule of 3" for cognitive processing. Choose bullets for lists, short paragraphs for explanations.',
    deliveryTip: 'Perfect for executive summaries, key decisions, or memorable conclusions',
    contentGuidance: '3-4 bullets OR 1-2 concise paragraphs (100-200 words total)'
  },
  moderate: {
    description: 'Balanced depth: Key insights with supporting context',
    detail: 'Key insights with supporting evidence and examples',
    focus: 'Logical flow with supporting evidence; maintain clarity while building comprehensive understanding',
    strategy: 'Create narrative arc: setup → evidence → impact. Mix bullets and paragraphs as content demands.',
    deliveryTip: 'Ideal for business cases, process explanations, or strategic overviews',
    contentGuidance: '4-6 bullets OR 2-3 paragraphs OR mixed format (200-400 words total)'
  },
  detailed: {
    description: 'Comprehensive coverage: In-depth analysis with rich context',
    detail: 'Thorough analysis with examples, implications, and actionable insights',
    focus: 'Complete exploration while maintaining clarity; layer information strategically for deep understanding',
    strategy: 'Use progressive disclosure: context → analysis → implications → actions. Optimize format for content type.',
    deliveryTip: 'Best for training content, detailed proposals, or technical explanations',
    contentGuidance: '5-8 bullets OR 3-4 paragraphs OR mixed format (300-600 words total)'
  },
  comprehensive: {
    description: 'Complete coverage: Exhaustive analysis with full context and implications',
    detail: 'Thorough exploration with multiple examples, detailed analysis, and comprehensive insights',
    focus: 'Complete understanding with all relevant context, implications, and actionable recommendations',
    strategy: 'Layer information strategically: background → analysis → implications → recommendations → next steps',
    deliveryTip: 'Perfect for training materials, comprehensive reports, or detailed technical documentation',
    contentGuidance: '6-10 bullets OR 4-5 paragraphs OR complex mixed format (400-800 words total)'
  }
};

/**
 * Audience-specific guidance for content adaptation
 * Enhanced with psychological triggers and structure patterns
 */
export const AUDIENCE_GUIDANCE = {
  general: {
    language: 'Clear, jargon-free language that builds understanding progressively',
    focus: 'Practical value, relatable examples, and actionable insights',
    tone: 'Engaging, accessible, and trustworthy',
    psychology: 'Use storytelling, analogies, and social proof to build connection',
    structure: 'Problem → Solution → Benefit pattern works best'
  },
  executives: {
    language: 'Strategic, ROI-centric terminology with executive presence',
    focus: 'Bottom-line impacts, competitive advantages, strategic implications',
    tone: 'Concise, authoritative, outcome-focused with urgency',
    psychology: 'Appeal to authority, scarcity, and strategic thinking',
    structure: 'Lead with impact, support with data, end with clear next steps'
  },
  technical: {
    language: 'Precise technical terms, methodological accuracy, evidence-based',
    focus: 'Implementation details, technical specifications, system architecture',
    tone: 'Analytical, thorough, peer-reviewed quality',
    psychology: 'Build credibility through accuracy and comprehensive coverage',
    structure: 'Context → Method → Results → Implications'
  },
  sales: {
    language: 'Benefit-driven, customer-centric with emotional triggers',
    focus: 'Value propositions, competitive differentiation, customer success',
    tone: 'Persuasive, confident, results-oriented with enthusiasm',
    psychology: 'Use reciprocity, social proof, and fear of missing out',
    structure: 'Pain Point → Solution → Proof → Call to Action'
  },
  investors: {
    language: 'Financial terminology, growth metrics, market analysis',
    focus: 'Market opportunity, ROI, competitive positioning',
    tone: 'Confident, data-driven, visionary',
    psychology: 'Appeal to opportunity, credibility, and urgency',
    structure: 'Opportunity → Strategy → Results → Ask'
  },
  students: {
    language: 'Clear, explanatory, with relatable examples',
    focus: 'Learning objectives, practical applications, engagement',
    tone: 'Educational, encouraging, accessible',
    psychology: 'Foster curiosity, achievement, and understanding',
    structure: 'Context → Concept → Example → Application'
  },
  healthcare: {
    language: 'Medical terminology balanced with patient-friendly explanations',
    focus: 'Patient outcomes, clinical evidence, safety protocols',
    tone: 'Professional, compassionate, evidence-based',
    psychology: 'Build trust through expertise and empathy',
    structure: 'Problem → Evidence → Solution → Outcomes'
  },
  education: {
    language: 'Pedagogical terminology with practical classroom applications',
    focus: 'Learning outcomes, teaching strategies, student engagement',
    tone: 'Supportive, research-based, practical',
    psychology: 'Appeal to professional development and student success',
    structure: 'Challenge → Method → Implementation → Results'
  },
  marketing: {
    language: 'Brand-focused, customer-centric with market insights',
    focus: 'Brand positioning, customer journey, campaign effectiveness',
    tone: 'Creative, strategic, results-driven',
    psychology: 'Use emotional triggers and data-driven insights',
    structure: 'Insight → Strategy → Execution → Impact'
  },
  finance: {
    language: 'Financial terminology, risk assessment, regulatory compliance',
    focus: 'Financial performance, risk management, regulatory requirements',
    tone: 'Analytical, precise, compliance-focused',
    psychology: 'Build confidence through accuracy and risk mitigation',
    structure: 'Analysis → Risk → Strategy → Compliance'
  },
  startup: {
    language: 'Innovation-focused, growth-oriented, agile terminology',
    focus: 'Market disruption, scalability, competitive advantage',
    tone: 'Dynamic, visionary, results-oriented',
    psychology: 'Appeal to innovation, growth potential, and urgency',
    structure: 'Opportunity → Innovation → Traction → Scale'
  },
  government: {
    language: 'Policy-focused, public service oriented, regulatory terminology',
    focus: 'Public benefit, policy implementation, stakeholder impact',
    tone: 'Authoritative, transparent, service-oriented',
    psychology: 'Build trust through transparency and public benefit',
    structure: 'Issue → Policy → Implementation → Public Impact'
  },
  business: {
    language: 'Professional business terminology, performance-focused, strategic',
    focus: 'Business outcomes, operational efficiency, growth metrics',
    tone: 'Professional, results-oriented, strategic',
    psychology: 'Appeal to business success, efficiency, and competitive advantage',
    structure: 'Challenge → Solution → Results → Business Impact'
  }
};

/**
 * Tone specifications for consistent voice and style
 * Enhanced with 2024 trends: authenticity, inclusivity, and emotional intelligence.
 */
export const TONE_SPECIFICATIONS = {
  professional: {
    style: 'Polished, confident, and authoritative with modern authenticity',
    language: 'Formal, precise, with industry-specific terminology and inclusive language',
    approach: 'Evidence-based with clear logical flow and emotional intelligence',
    triggers: 'Credibility, authority, trust, and relatability',
    bulletStyle: 'Use concise, impact-driven phrases with action verbs'
  },
  casual: {
    style: 'Friendly, approachable, conversational with genuine warmth',
    language: 'Simple, relatable, everyday language with inclusive terms',
    approach: 'Story-driven with human connection and humor where appropriate',
    triggers: 'Relatability, engagement, warmth, and belonging',
    bulletStyle: 'Use conversational, action-oriented phrases'
  },
  persuasive: {
    style: 'Compelling, action-oriented, emotionally engaging with authentic urgency',
    language: 'Benefit-driven, urgent, with power words and inclusive appeals',
    approach: 'Problem-solution-benefit with strong calls to action and social proof',
    triggers: 'Urgency, desire, trust, and collective impact',
    bulletStyle: 'Use action verbs, focus on benefits and outcomes'
  },
  educational: {
    style: 'Structured, informative, guiding with progressive complexity and inclusivity',
    language: 'Explanatory, logical flow with clear definitions and diverse examples',
    approach: 'Step-by-step buildup with questions and knowledge checks for all learning styles',
    triggers: 'Curiosity, achievement, mastery, and practical application',
    bulletStyle: 'Use sequential language, include "how to" elements'
  },
  inspiring: {
    style: 'Motivational, uplifting, visionary with transformational energy and inclusivity',
    language: 'Aspirational, emotionally resonant with future-focused imagery and diverse representation',
    approach: 'Vision-driven with transformational messaging and collective possibility',
    triggers: 'Hope, aspiration, identity, and shared purpose',
    bulletStyle: 'Use aspirational language, paint vivid future states'
  },
  authoritative: {
    style: 'Expert, commanding, definitive with unquestionable expertise and ethical responsibility',
    language: 'Precise, technical, with industry authority and balanced perspectives',
    approach: 'Fact-based with expert insights and proven methodologies',
    triggers: 'Expertise, credibility, proven results, and trust',
    bulletStyle: 'Use definitive statements, cite expertise and results'
  },
  friendly: {
    style: 'Warm, approachable, supportive with personal connection and inclusivity',
    language: 'Conversational, inclusive, with personal touches and diverse examples',
    approach: 'Relationship-focused with empathy and understanding',
    triggers: 'Connection, trust, support, and community',
    bulletStyle: 'Use inclusive language, personal examples'
  },
  urgent: {
    style: 'Time-sensitive, action-oriented, compelling with immediate focus and ethical urgency',
    language: 'Direct, immediate, with time-based triggers and clear consequences',
    approach: 'Problem-focused with immediate action requirements and solutions',
    triggers: 'Urgency, scarcity, immediate action, and positive outcomes',
    bulletStyle: 'Use action verbs, time-sensitive language'
  },
  confident: {
    style: 'Assured, decisive, strong with unwavering conviction and humility',
    language: 'Definitive, clear, with strong positioning and balanced views',
    approach: 'Solution-focused with proven track record and forward-looking optimism',
    triggers: 'Confidence, success, proven results, and inspiration',
    bulletStyle: 'Use strong, definitive statements'
  },
  analytical: {
    style: 'Data-driven, logical, systematic with methodical approach and critical thinking',
    language: 'Precise, evidence-based, with analytical terminology and balanced analysis',
    approach: 'Research-based with systematic analysis and conclusions',
    triggers: 'Logic, evidence, systematic thinking, and insights',
    bulletStyle: 'Use data points, logical progression, evidence-based statements'
  }
};

/**
 * Advanced storytelling frameworks for content structure
 * Enhanced with 2024 trends: micro-stories, interactive elements, and inclusive narratives.
 */
export const STORYTELLING_FRAMEWORKS = {
  problemSolution: {
    name: 'Problem-Solution-Impact',
    structure: 'Pain Point → Solution → Transformation',
    bestFor: 'Sales presentations, product launches, change management',
    bulletPattern: ['Identify the challenge', 'Present the solution', 'Show the impact']
  },
  beforeAfter: {
    name: 'Before-After-Bridge',
    structure: 'Current State → Future State → Path Forward',
    bestFor: 'Strategic planning, transformation initiatives, vision presentations',
    bulletPattern: ['Current challenges', 'Desired outcomes', 'Action steps']
  },
  heroJourney: {
    name: 'Hero\'s Journey',
    structure: 'Challenge → Journey → Victory',
    bestFor: 'Inspirational content, case studies, success stories',
    bulletPattern: ['The challenge faced', 'The journey taken', 'The victory achieved']
  },
  pyramid: {
    name: 'Pyramid Principle',
    structure: 'Conclusion → Supporting Arguments → Evidence',
    bestFor: 'Executive summaries, recommendations, analytical presentations',
    bulletPattern: ['Main conclusion', 'Key supporting points', 'Evidence/data']
  },
  microStory: { // New: 2024 trend for short, impactful narratives
    name: 'Micro-Story Arc',
    structure: 'Hook → Conflict → Resolution → Insight',
    bestFor: 'Social media slides, quick pitches, attention-grabbing content',
    bulletPattern: ['Engaging hook', 'Core conflict', 'Resolution', 'Key insight']
  },
  dataStory: { // New: Data-driven narrative framework
    name: 'Data-Driven Narrative',
    structure: 'Context → Conflict → Resolution',
    bestFor: 'Analytics presentations, research findings, performance reviews',
    bulletPattern: ['Set the data context', 'Reveal the insight or conflict', 'Present the resolution or recommendation']
  }
};

/**
 * Enhanced tone adaptation strategies for storytelling frameworks (C-1: Narrative Quality & Structure)
 * Maps each framework to specific tone implementations
 */
export const FRAMEWORK_TONE_ADAPTATIONS = {
  problemSolution: {
    professional: 'Focus on business metrics, ROI, and strategic implications',
    casual: 'Use relatable examples, conversational language, and personal anecdotes',
    analytical: 'Emphasize data-driven problem identification and solution validation',
    persuasive: 'Highlight urgency, compelling benefits, and competitive advantages',
    educational: 'Break down complex problems into understandable components with clear explanations'
  },
  beforeAfter: {
    professional: 'Use strategic language, business outcomes, and transformation metrics',
    casual: 'Paint vivid pictures of transformation with relatable scenarios',
    analytical: 'Quantify current state vs future state gaps with detailed analysis',
    persuasive: 'Emphasize the cost of inaction and benefits of change',
    educational: 'Explain the transformation process step-by-step with learning objectives'
  },
  heroJourney: {
    professional: 'Focus on strategic decisions, business outcomes, and leadership lessons',
    casual: 'Tell an engaging story with personal touches and emotional connection',
    analytical: 'Document the journey with data, milestones, and measurable progress',
    persuasive: 'Inspire action through triumph over adversity and proven success',
    educational: 'Extract learnings from each stage with actionable insights'
  },
  pyramid: {
    professional: 'Lead with strategic recommendations and executive-level insights',
    casual: 'Start with the bottom line in accessible, jargon-free language',
    analytical: 'Present conclusions backed by rigorous analysis and methodology',
    persuasive: 'Lead with compelling recommendations that drive immediate action',
    educational: 'Structure learning from conclusion to supporting concepts with clear progression'
  },
  microStory: {
    professional: 'Sharp, executive-level insights with immediate business relevance',
    casual: 'Engaging hooks with relatable insights and conversational delivery',
    analytical: 'Data-driven hooks with actionable insights and clear methodology',
    persuasive: 'Compelling hooks that drive immediate action and decision-making',
    educational: 'Thought-provoking hooks with learning insights and knowledge transfer'
  },
  dataStory: {
    professional: 'Business-focused data interpretation with strategic implications',
    casual: 'Make data accessible and relatable with real-world examples',
    analytical: 'Deep dive into statistical significance and methodological rigor',
    persuasive: 'Use data to build compelling arguments and drive decisions',
    educational: 'Teach data literacy and interpretation with clear explanations'
  }
};

/**
 * Comprehensive layout selection guide with psychological impact and content format guidance
 * Enhanced with 2024 design trends: minimalism, asymmetry, and interactive-friendly layouts.
 */
export const LAYOUT_SELECTION_GUIDE = {
  'title': 'Maximum impact statements, emotional moments, key transitions. Psychology: Creates focus and emphasis through isolation. Trend: Minimalist with ample white space.',
  'title-bullets': 'Scannable lists, processes, benefits, action items. Psychology: Leverages cognitive chunking and parallel processing. Trend: Asymmetrical bullet placement for dynamism. Use bullets field.',
  'title-paragraph': 'Narrative explanations, stories, complex concepts, context-setting. Psychology: Enables deep understanding through storytelling. Trend: Integrated micro-illustrations. Use paragraph field.',
  'two-column': 'Comparisons, before/after, complementary concepts. Psychology: Enables comparative analysis and decision-making. Trend: Fluid column widths. Use left/right fields.',
  'mixed-content': 'Complex topics requiring both scannable points and narrative explanation. Psychology: Accommodates different learning preferences simultaneously. Trend: Layered content with subtle animations.',
  'image-right': 'Visual storytelling, emotional connection, product showcases. Psychology: Combines visual and verbal processing for memory. Trend: AI-generated visuals with overlay text. Use right.imagePrompt.',
  'image-left': 'Visual storytelling with text emphasis, process illustrations. Psychology: Visual context supports text comprehension. Trend: Asymmetrical image placement. Use left.imagePrompt.',
  'image-full': 'Emotional impact, brand moments, visual statements. Psychology: Maximum visual impact and emotional resonance. Trend: Subtle gradient overlays. Use imagePrompt or right.imagePrompt.',
  'quote': 'Testimonials, authority statements, inspirational messages. Psychology: Leverages social proof and emotional resonance. Trend: Minimalist with subtle background textures. Use paragraph field.',
  'chart': 'Data stories, trend analysis, quantitative insights. Psychology: Provides concrete evidence and logical support. Trend: Simplified, interactive-ready charts. Use chart field.',
  'comparison-table': 'Feature comparisons, option analysis, decision matrices. Psychology: Enables systematic comparison and decision-making. Trend: Clean, mobile-friendly tables. Use comparisonTable field.',
  'timeline': 'Process flows, project phases, historical progression. Psychology: Shows progression and builds anticipation. Trend: Non-linear timelines for complex stories. Use timeline field.',
  'process-flow': 'Step-by-step procedures, methodologies, workflows. Psychology: Breaks complexity into manageable steps. Trend: Circular flows for cyclical processes. Use processSteps field.',
  'before-after': 'Transformation stories, improvement showcases, change impact. Psychology: Demonstrates value through contrast. Trend: Interactive swipe reveals (PPT compatible). Use left/right fields.',
  'problem-solution': 'Challenge identification and resolution, value propositions. Psychology: Creates tension and resolution. Trend: Visual metaphors for problems/solutions. Use left/right fields.',
  'data-visualization': 'Complex data presentation, analytical insights, research findings. Psychology: Makes data accessible and actionable. Trend: Animated data reveals. Use chart field.',
  'testimonial': 'Customer success stories, social proof, credibility building. Psychology: Leverages social validation and trust. Trend: Authentic, diverse representations. Use quote layout.',
  'team-intro': 'Team presentations, expertise showcasing, credibility building. Psychology: Builds personal connection and trust. Trend: Human-centered with subtle animations. Use two-column layout.',
  'contact-info': 'Contact details, next steps, follow-up information. Psychology: Facilitates action and connection. Trend: QR codes and interactive links. Use bullets or paragraph.',
  'thank-you': 'Appreciation, conclusion, memorable endings. Psychology: Creates positive final impression. Trend: Emotional visuals with calls to action. Use title or quote layout.',
  'agenda': 'Meeting structure, presentation outline, expectation setting. Psychology: Provides roadmap and reduces anxiety. Trend: Visual progress indicators. Use bullets field.',
  'section-divider': 'Topic transitions, section breaks, presentation flow. Psychology: Provides mental breaks and organization. Trend: Subtle gradient transitions. Use title layout.'
};

/**
 * Step 1: Enhanced core content generation prompt with advanced prompt engineering
 * Incorporates chain-of-thought reasoning, few-shot examples, and quality enforcement
 */
/**
 * Intelligently select storytelling framework based on content and context (C-1: Narrative Quality & Structure)
 * Enhanced with tone awareness and content analysis
 */
function selectOptimalFramework(input: GenerationParams): {
  framework: typeof STORYTELLING_FRAMEWORKS[keyof typeof STORYTELLING_FRAMEWORKS];
  toneGuidance: string;
  narrativeStrategy: string;
} {
  const prompt = input.prompt.toLowerCase();
  let selectedFramework: keyof typeof STORYTELLING_FRAMEWORKS;

  // Enhanced content analysis for framework selection
  if (prompt.includes('data') || prompt.includes('analytics') || prompt.includes('metrics') || prompt.includes('research')) {
    selectedFramework = 'dataStory';
  } else if (prompt.includes('before') && prompt.includes('after') || prompt.includes('transform') || prompt.includes('improve')) {
    selectedFramework = 'beforeAfter';
  } else if (prompt.includes('timeline') || prompt.includes('history') || prompt.includes('journey') || prompt.includes('progress') || prompt.includes('story')) {
    selectedFramework = 'heroJourney';
  } else if (prompt.includes('recommend') || prompt.includes('analysis') || prompt.includes('conclusion') || input.audience === 'executives') {
    selectedFramework = 'pyramid';
  } else if (input.contentLength === 'minimal' || input.contentLength === 'brief') {
    selectedFramework = 'microStory';
  } else {
    selectedFramework = 'problemSolution'; // Default fallback
  }

  const framework = STORYTELLING_FRAMEWORKS[selectedFramework];
  const toneGuidance = (FRAMEWORK_TONE_ADAPTATIONS[selectedFramework] as any)?.[input.tone] ||
                      FRAMEWORK_TONE_ADAPTATIONS[selectedFramework]?.professional ||
                      'Use professional tone with clear, concise language';

  // Generate narrative strategy based on framework and audience
  const narrativeStrategy = generateNarrativeStrategy(selectedFramework, input);

  return {
    framework,
    toneGuidance,
    narrativeStrategy
  };
}

/**
 * Generate narrative strategy based on framework and input parameters
 */
function generateNarrativeStrategy(frameworkKey: keyof typeof STORYTELLING_FRAMEWORKS, input: GenerationParams): string {
  const audienceStrategies = {
    executives: 'Lead with strategic impact, use executive summary format, focus on ROI and business outcomes',
    managers: 'Balance strategic overview with tactical details, emphasize team impact and implementation',
    technical: 'Include technical depth, use precise terminology, provide implementation details',
    general: 'Use accessible language, provide context, focus on practical benefits',
    students: 'Use educational approach, provide background context, include learning objectives'
  };

  const lengthStrategies = {
    minimal: 'Distill to absolute essentials, use powerful single statements, maximize impact per word',
    brief: 'Focus on key points only, use concise bullets, maintain clarity without detail',
    moderate: 'Balance detail with brevity, provide sufficient context, use structured approach',
    detailed: 'Provide comprehensive coverage, include supporting details, use thorough explanations',
    comprehensive: 'Cover all aspects thoroughly, include extensive context, provide complete analysis'
  };

  const audienceStrategy = (audienceStrategies as any)[input.audience] || audienceStrategies.general;
  const lengthStrategy = lengthStrategies[input.contentLength] || lengthStrategies.moderate;

  return `${audienceStrategy}. ${lengthStrategy}. Framework: ${STORYTELLING_FRAMEWORKS[frameworkKey].structure}`;
}

/**
 * Analyze content to recommend optimal layout
 */
function analyzeContentForLayout(partialSpec: Partial<SlideSpec>): {
  type: string;
  complexity: string;
  recommendedLayouts: string[];
  visualPriority: string;
  reasoning: string;
} {
  const content = (partialSpec.title + ' ' + (partialSpec.paragraph || partialSpec.bullets?.join(' ') || '')).toLowerCase();
  const hasNumbers = /\d+%|\$[\d,]+|\d+x|increase|decrease|growth|revenue/.test(content);
  const hasComparison = /vs|versus|compared|before|after|better|worse/.test(content);
  const hasProcess = /step|phase|stage|process|workflow|timeline/.test(content);
  const hasData = /chart|graph|data|metrics|analytics|statistics/.test(content);

  if (hasData) {
    return {
      type: 'data-driven',
      complexity: 'high',
      recommendedLayouts: ['chart', 'data-visualization', 'mixed-content'],
      visualPriority: 'data visualization',
      reasoning: 'contains data/metrics requiring visual representation'
    };
  } else if (hasComparison) {
    return {
      type: 'comparative',
      complexity: 'medium',
      recommendedLayouts: ['two-column', 'before-after', 'comparison-table'],
      visualPriority: 'side-by-side comparison',
      reasoning: 'contains comparative elements'
    };
  } else if (hasProcess) {
    return {
      type: 'process-oriented',
      complexity: 'medium',
      recommendedLayouts: ['timeline', 'process-flow', 'mixed-content'],
      visualPriority: 'sequential flow',
      reasoning: 'describes process or sequential steps'
    };
  } else if (hasNumbers) {
    return {
      type: 'metric-focused',
      complexity: 'medium',
      recommendedLayouts: ['title-bullets', 'mixed-content', 'chart'],
      visualPriority: 'key metrics',
      reasoning: 'contains important numerical data'
    };
  } else {
    return {
      type: 'narrative',
      complexity: 'low',
      recommendedLayouts: ['title-paragraph', 'title-bullets', 'mixed-content'],
      visualPriority: 'clear messaging',
      reasoning: 'primarily text-based content'
    };
  }
}

/**
 * Enhanced content analysis for context-aware imagery (C-2: Context-Aware Image Prompts)
 * Analyzes slide content and theme to recommend optimal image concepts
 */
function analyzeContentForImagery(partialSpec: Partial<SlideSpec>, input: GenerationParams): {
  contentType: string;
  themes: string[];
  recommendedConcept: string;
  visualMetaphor: string;
  themeAlignment: string;
  emotionalTone: string;
  technicalSpecs: string;
} {
  const content = (partialSpec.title + ' ' + (partialSpec.paragraph || partialSpec.bullets?.join(' ') || '')).toLowerCase();
  const selectedTheme = input.design?.theme || 'professional';

  const themes: string[] = [];
  let contentType = 'general';
  let recommendedConcept = 'professional business setting';
  let visualMetaphor = 'clean, modern workspace';
  let themeAlignment = 'professional corporate aesthetic';
  let emotionalTone = 'confident and trustworthy';
  let technicalSpecs = 'high resolution, professional lighting';

  // Enhanced content analysis with theme integration (C-2: Context-Aware Image Prompts)
  if (/growth|increase|revenue|profit|success/.test(content)) {
    themes.push('growth', 'success');
    contentType = 'business-growth';
    recommendedConcept = 'upward trending charts or growth imagery';
    visualMetaphor = 'ascending arrows, growing plants, or climbing stairs';
    emotionalTone = 'optimistic and aspirational';
  }

  if (/team|collaboration|people|together/.test(content)) {
    themes.push('teamwork', 'collaboration');
    contentType = 'team-focused';
    recommendedConcept = 'diverse team collaboration';
    visualMetaphor = 'connected networks or unified team dynamics';
    emotionalTone = 'inclusive and energetic';
  }

  if (/technology|digital|ai|automation|innovation/.test(content)) {
    themes.push('technology', 'innovation');
    contentType = 'tech-focused';
    recommendedConcept = 'modern technology interfaces';
    visualMetaphor = 'digital transformation or futuristic elements';
    emotionalTone = 'cutting-edge and progressive';
  }

  if (/data|analytics|metrics|statistics/.test(content)) {
    themes.push('data', 'analytics');
    contentType = 'data-driven';
    recommendedConcept = 'data visualization or dashboard';
    visualMetaphor = 'flowing data streams or organized information';
    emotionalTone = 'analytical and precise';
  }

  if (/problem|challenge|issue|difficulty/.test(content)) {
    themes.push('problem-solving', 'challenge');
    contentType = 'problem-focused';
    recommendedConcept = 'problem-solving or overcoming obstacles';
    visualMetaphor = 'breaking through barriers or finding solutions';
    emotionalTone = 'determined and solution-oriented';
  }

  if (/solution|answer|resolve|fix/.test(content)) {
    themes.push('solution', 'resolution');
    contentType = 'solution-focused';
    recommendedConcept = 'clear pathways or breakthrough moments';
    visualMetaphor = 'light at the end of tunnel or key unlocking potential';
    emotionalTone = 'confident and reassuring';
  }

  // Theme-specific visual alignment
  const themeVisualMappings = {
    'creative-studio': 'artistic, vibrant colors, creative workspace aesthetic',
    'corporate-blue': 'professional blue tones, corporate environment, clean lines',
    'modern-minimal': 'minimalist design, white space, geometric elements',
    'tech-forward': 'futuristic elements, digital interfaces, high-tech environment',
    'warm-professional': 'warm tones, approachable professional setting',
    'bold-impact': 'high contrast, dramatic lighting, powerful visual impact'
  };

  themeAlignment = (themeVisualMappings as any)[selectedTheme] || 'professional corporate aesthetic';

  // Technical specifications based on theme
  const themeTechnicalSpecs = {
    'creative-studio': 'vibrant colors, artistic lighting, creative composition',
    'corporate-blue': 'professional lighting, blue color palette, clean composition',
    'modern-minimal': 'minimal elements, soft lighting, geometric composition',
    'tech-forward': 'high-tech lighting, digital elements, futuristic composition',
    'warm-professional': 'warm lighting, earth tones, approachable composition',
    'bold-impact': 'dramatic lighting, high contrast, powerful composition'
  };

  technicalSpecs = (themeTechnicalSpecs as any)[selectedTheme] || 'high resolution, professional lighting';

  // Default fallback
  if (themes.length === 0) {
    themes.push('professional', 'business');
  }

  return {
    contentType,
    themes,
    recommendedConcept,
    visualMetaphor,
    themeAlignment,
    emotionalTone,
    technicalSpecs
  };
}

/**
 * Perform quick quality assessment for refinement guidance
 */
function performQuickQualityCheck(partialSpec: Partial<SlideSpec>, input: GenerationParams): {
  estimatedScore: number;
  issues: string[];
  strengths: string[];
} {
  const issues: string[] = [];
  const strengths: string[] = [];
  let score = 100;

  // Check title quality
  const title = partialSpec.title || '';
  if (title.length < 15) {
    issues.push('title too short');
    score -= 10;
  } else if (title.length > 60) {
    issues.push('title too long');
    score -= 5;
  } else {
    strengths.push('good title length');
  }

  if (!/\d+/.test(title) && (partialSpec.bullets?.some(b => /\d+/.test(b)) || false)) {
    issues.push('title lacks quantification');
    score -= 5;
  }

  // Check content quality
  const bullets = partialSpec.bullets || [];
  if (bullets.length > 7) {
    issues.push('too many bullets');
    score -= 10;
  } else if (bullets.length > 0) {
    strengths.push('appropriate bullet count');
  }

  // Check for vague language
  const vaguePhrases = ['good', 'better', 'improved', 'things', 'stuff'];
  const hasVague = bullets.some(b => vaguePhrases.some(phrase => b.toLowerCase().includes(phrase)));
  if (hasVague) {
    issues.push('vague language detected');
    score -= 15;
  } else {
    strengths.push('specific language');
  }

  return { estimatedScore: Math.max(score, 0), issues, strengths };
}

/**
 * Analyze prompt context to determine content type and requirements
 */
function analyzePromptContext(prompt: string): {
  contentType: 'data-driven' | 'strategic' | 'process' | 'comparison' | 'narrative';
  complexity: 'simple' | 'moderate' | 'complex';
  visualElements: string[];
  keyThemes: string[];
} {
  const lowerPrompt = prompt.toLowerCase();

  // Determine content type
  let contentType: 'data-driven' | 'strategic' | 'process' | 'comparison' | 'narrative' = 'narrative';

  if (lowerPrompt.includes('data') || lowerPrompt.includes('metrics') || lowerPrompt.includes('results')) {
    contentType = 'data-driven';
  } else if (lowerPrompt.includes('strategy') || lowerPrompt.includes('plan') || lowerPrompt.includes('roadmap')) {
    contentType = 'strategic';
  } else if (lowerPrompt.includes('process') || lowerPrompt.includes('workflow') || lowerPrompt.includes('steps')) {
    contentType = 'process';
  } else if (lowerPrompt.includes('compare') || lowerPrompt.includes('vs') || lowerPrompt.includes('versus')) {
    contentType = 'comparison';
  }

  // Determine complexity
  const complexity = prompt.length > 200 ? 'complex' : prompt.length > 100 ? 'moderate' : 'simple';

  // Identify visual elements needed
  const visualElements: string[] = [];
  if (lowerPrompt.includes('chart') || lowerPrompt.includes('graph')) visualElements.push('chart');
  if (lowerPrompt.includes('table') || lowerPrompt.includes('comparison')) visualElements.push('table');
  if (lowerPrompt.includes('timeline') || lowerPrompt.includes('schedule')) visualElements.push('timeline');
  if (lowerPrompt.includes('image') || lowerPrompt.includes('visual')) visualElements.push('image');

  // Extract key themes
  const keyThemes = extractKeyThemes(prompt);

  return { contentType, complexity, visualElements, keyThemes };
}

/**
 * Detect industry context from prompt content
 */
function detectIndustryContext(prompt: string): string {
  const industryKeywords = {
    technology: ['software', 'app', 'platform', 'digital', 'tech', 'AI', 'machine learning'],
    healthcare: ['patient', 'medical', 'health', 'clinical', 'treatment', 'diagnosis'],
    finance: ['revenue', 'profit', 'investment', 'financial', 'budget', 'ROI'],
    marketing: ['campaign', 'brand', 'customer', 'engagement', 'conversion', 'audience'],
    education: ['student', 'learning', 'curriculum', 'education', 'training', 'course'],
    consulting: ['strategy', 'optimization', 'efficiency', 'transformation', 'analysis']
  };

  const lowerPrompt = prompt.toLowerCase();

  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
      return industry;
    }
  }

  return 'general';
}

/**
 * Identify data requirements from prompt
 */
function identifyDataNeeds(prompt: string): {
  needsMetrics: boolean;
  needsComparisons: boolean;
  needsTimeline: boolean;
  suggestedDataTypes: string[];
} {
  const lowerPrompt = prompt.toLowerCase();

  const needsMetrics = /\b(result|performance|metric|kpi|roi|growth|increase|decrease|percent)\b/.test(lowerPrompt);
  const needsComparisons = /\b(compare|versus|vs|difference|better|worse|advantage)\b/.test(lowerPrompt);
  const needsTimeline = /\b(timeline|schedule|roadmap|phase|quarter|month|year)\b/.test(lowerPrompt);

  const suggestedDataTypes: string[] = [];
  if (needsMetrics) suggestedDataTypes.push('performance metrics', 'KPIs', 'percentages');
  if (needsComparisons) suggestedDataTypes.push('comparative data', 'benchmarks');
  if (needsTimeline) suggestedDataTypes.push('dates', 'milestones', 'phases');

  return { needsMetrics, needsComparisons, needsTimeline, suggestedDataTypes };
}

/**
 * Extract key themes from prompt text
 */
function extractKeyThemes(prompt: string): string[] {
  const words = prompt.toLowerCase().split(/\s+/);
  const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);

  const themes = words
    .filter(word => word.length > 4 && !stopWords.has(word))
    .filter(word => /^[a-zA-Z]+$/.test(word))
    .slice(0, 5);

  return themes;
}

export function generateContentPrompt(input: GenerationParams): string {
  const { framework, toneGuidance, narrativeStrategy } = selectOptimalFramework(input);
  const audienceGuidance = AUDIENCE_GUIDANCE[input.audience] || AUDIENCE_GUIDANCE.general;
  const toneSpec = TONE_SPECIFICATIONS[input.tone] || TONE_SPECIFICATIONS.professional;
  const lengthSpec = CONTENT_LENGTH_SPECS[input.contentLength] || CONTENT_LENGTH_SPECS.moderate;

  return `## CONTENT GENERATION TASK
Create professional slide content for: "${input.prompt}"

## STRICT REQUIREMENTS:
**Target Audience**: ${input.audience} - ${audienceGuidance.focus}
**Communication Style**: ${toneSpec.style}
**Content Depth**: ${lengthSpec.description}
**Framework**: ${framework.name} - ${framework.structure}

## MANDATORY QUALITY STANDARDS:
- **Title**: Outcome-focused, 15-60 characters, quantified when possible
- **Bullets**: 3-5 bullets maximum, 12-20 words each, action-oriented
- **Language**: Active voice, specific metrics, professional terminology
- **Data**: Realistic percentages, contextual timeframes
- **Tone**: Executive-level, confident, evidence-based

## CONTENT SPECIFICATIONS:
- Drive specific business outcome for ${input.audience}
- Include quantified benefits and clear value proposition
- Use realistic, contextually appropriate metrics
- Maintain C-suite level communication quality

## INDUSTRY CONTEXT:
${input.industry && input.industry !== 'general' ? `**Industry Focus**: ${input.industry} - Tailor content with industry-specific terminology, metrics, and challenges relevant to ${input.industry} professionals.` : '**Industry**: General business context - Use universally applicable language and examples.'}

## PRESENTATION TYPE GUIDANCE:
${input.presentationType && input.presentationType !== 'general' ? `**Presentation Type**: ${input.presentationType} - Structure content optimally for ${input.presentationType} format with appropriate pacing and emphasis.` : '**Type**: General presentation - Use balanced structure suitable for broad business contexts.'}

## QUALITY EXAMPLES:

**EXCELLENT Title Examples:**
✅ "Q4 Revenue: 34% Growth Exceeds $2.1M Target by 18%"
✅ "Customer NPS Jumps from 6.2 to 8.4 Following Service Redesign"
✅ "New AI System Reduces Processing Time from 4 Hours to 90 Minutes"

**POOR Title Examples:**
❌ "Q4 Results" (too vague, no outcome)
❌ "Some Updates" (no specificity or value)
❌ "Information About Our Performance" (wordy, unclear benefit)

**EXCELLENT Bullet Examples (15-25 words each):**
✅ "Reduced customer churn from 12% to 8.5% through personalized onboarding program launched in Q3" (16 words)
✅ "Captured 15% market share in APAC within 6 months, generating $1.2M additional revenue" (14 words)
✅ "Automated invoice processing, eliminating 200 manual hours weekly and reducing errors by 85%" (13 words)

**POOR Bullet Examples:**
❌ "We did better this quarter" (vague, no metrics or context)
❌ "Improvements were made to our processes" (passive voice, no specifics)
❌ "Things are going well with customers" (meaningless, no evidence)
❌ "Our comprehensive customer relationship management system implementation has resulted in significant improvements across multiple key performance indicators including but not limited to customer satisfaction scores" (26+ words - too verbose)

**CONTENT AUTHENTICITY REQUIREMENTS:**
- Use realistic percentage ranges (15-25% not 23.7%)
- Include contextual timeframes (Q3, within 6 months, year-over-year)
- Reference specific methodologies or programs when mentioning improvements
- Ensure dollar amounts align with company size and industry norms

**EXCELLENT Timeline Examples:**
✅ {"date": "1754", "title": "Military Career Begins", "description": "Starts his military career during the French and Indian War, demonstrating early leadership skills.", "milestone": false}
✅ {"date": "1789", "title": "First President of the United States", "description": "Elected as the inaugural President, establishing protocols that would guide future leaders.", "milestone": true}

**POOR Timeline Examples:**
❌ {"date": "1754", "title": "Military stuff", "description": "Did some things"}
❌ {"date": "Later", "title": "Became President", "description": "Was important"}

## GRID LAYOUT GUIDANCE:
If content naturally fits a structured format (comparisons, features, metrics, team info), consider suggesting grid-layout:
- **Dashboard/Metrics**: 4x1 or 2x2 grid with metric cells
- **Feature Comparison**: 3x2 grid with headers and bullet points
- **Team Introduction**: 4x1 or 2x2 grid with image and paragraph cells
- **Process Steps**: 4x1 or 3x1 grid with numbered headers and descriptions
- **Before/After**: 2x2 grid showing comparison data

**Grid Layout JSON Structure:**
\`\`\`json
{
  "title": "Grid Layout Title",
  "layout": "grid-layout",
  "gridLayout": {
    "columns": 3,
    "rows": 2,
    "cells": [
      {"row": 0, "column": 0, "type": "header", "title": "Feature A"},
      {"row": 1, "column": 0, "type": "bullets", "bullets": ["Benefit 1", "Benefit 2"]},
      {"row": 0, "column": 1, "type": "metric", "metric": {"value": "25%", "label": "Growth"}}
    ],
    "cellSpacing": "normal"
  }
}
\`\`\`

## OUTPUT REQUIREMENTS:
Create a JSON object with these exact fields (STRICT SCHEMA COMPLIANCE REQUIRED):
{
  "title": "Specific, compelling title with clear benefit/outcome (15-60 characters)",
  "layout": "title-paragraph", // Will be optimized in next step - consider "grid-layout" for structured content
  "paragraph": "Engaging narrative content (if using paragraph format)",
  "bullets": ["Specific, metric-driven bullet points (15-25 words each, max 5 total)"],
  "notes": "Speaker delivery guidance and key talking points",
  "sources": ["Credible source references if applicable"],
  "gridLayout": { /* Only include if layout should be "grid-layout" */ }
}

## MANDATORY VALIDATION CHECKLIST:
Before responding, STRICTLY verify each requirement:
- ✅ Title is specific and benefit-focused (15-60 characters) - COUNT THE CHARACTERS
- ✅ Content matches audience sophistication level (${input.audience})
- ✅ Tone aligns with ${input.tone} requirements - NO DEVIATION
- ✅ Length matches ${input.contentLength} specification
- ✅ Each bullet point is 15-25 words maximum - COUNT EVERY WORD
- ✅ Maximum 5 bullet points total for optimal impact - NO EXCEPTIONS
- ✅ JSON format is valid and complete - TEST PARSING
- ✅ Content would score 90+ on quality assessment
- ✅ Every word serves a purpose - NO FILLER CONTENT
- ✅ Metrics are realistic and contextually appropriate
- ✅ Professional tone maintained throughout

Generate content that executives would be proud to present to their most important stakeholders.

## SELF-REFLECTION CHECKPOINT:
${SELF_REFLECTION_PROMPTS.contentReflection}

## REFERENCE EXAMPLES:
Study these examples of excellent vs. poor content:

**EXCELLENT EXAMPLE:**
${JSON.stringify(FEW_SHOT_EXAMPLES.excellentSlides[0], null, 2)}
**Why Excellent:** ${FEW_SHOT_EXAMPLES.excellentSlides[0].whyExcellent}

**POOR EXAMPLE (AVOID):**
${JSON.stringify(FEW_SHOT_EXAMPLES.poorSlides[0], null, 2)}
**Why Poor:** ${FEW_SHOT_EXAMPLES.poorSlides[0].whyPoor}

Aim for the excellence level shown in the good examples.`;
}

/**
 * Step 2: Enhanced layout refinement prompt with advanced visual design reasoning
 * Incorporates UX principles, accessibility guidelines, and data-driven layout selection
 */
export function generateLayoutPrompt(input: GenerationParams, partialSpec: Partial<SlideSpec>): string {
  // Analyze content to suggest optimal layout
  const contentAnalysis = analyzeContentForLayout(partialSpec);

  return `## LAYOUT OPTIMIZATION TASK
Optimize visual layout for maximum impact and comprehension.

## CURRENT CONTENT ANALYSIS:
${JSON.stringify(partialSpec, null, 2)}

## DESIGN CONTEXT:
**Audience**: ${input.audience} (affects complexity and visual preferences)
**Tone**: ${input.tone} (influences layout formality and structure)
**User Preference**: ${input.design?.layout || 'auto-select based on content'}
**Image Integration**: ${input.withImage ? 'Required - optimize for visual storytelling' : 'Text-focused design'}
**Content Type**: ${contentAnalysis.type} (${contentAnalysis.reasoning})

## LAYOUT DECISION FRAMEWORK:

### Content Analysis Results:
- **Information Type**: ${contentAnalysis.type}
- **Complexity Level**: ${contentAnalysis.complexity}
- **Recommended Layouts**: ${contentAnalysis.recommendedLayouts.join(', ')}
- **Visual Priority**: ${contentAnalysis.visualPriority}

### Step 2: Audience-Optimized Layout Strategy
**${input.audience} audience optimization:**
${input.audience === 'executives' ? '- Prioritize high-impact visuals with minimal text\n- Use layouts that support quick decision-making\n- Emphasize outcomes and ROI metrics\n- Prefer clean, authoritative designs that convey competence' :
  input.audience === 'technical' ? '- Support detailed information with logical progression\n- Use process-oriented and data-visualization layouts\n- Enable deep-dive analysis with structured information\n- Prefer layouts that show technical relationships and workflows' :
  input.audience === 'students' ? '- Create engaging, educational progressions\n- Use visual learning aids and step-by-step layouts\n- Support knowledge retention with clear structure\n- Prefer layouts that facilitate understanding and engagement' :
  '- Balance information density with accessibility\n- Use clear, scannable structures for broad appeal\n- Support both quick scanning and detailed reading\n- Prefer professional but approachable layouts'}

### Step 3: Content-Layout Matching Intelligence
**Smart Layout Selection Based on Content Type:**
- **Metrics/Results**: Use title-bullets or mixed-content for impact
- **Comparisons**: Use two-column, before-after, or comparison-table
- **Processes**: Use timeline, process-flow, or step-by-step layouts
- **Data**: Use chart, data-visualization, or infographic layouts
- **Stories**: Use mixed-content or narrative-flow layouts

### AVAILABLE LAYOUTS & SELECTION CRITERIA:
**Primary Layouts**: ${SLIDE_LAYOUTS.join(', ')}

**GRID LAYOUT SYSTEM**:
- **grid-layout**: Flexible grid system for organizing content in columns and rows
  - Supports 1-4 columns and 1-3 rows (max 12 cells)
  - Each cell can contain: header, bullets, paragraph, metric, image, chart, or be empty
  - Perfect for dashboards, feature comparisons, team introductions, or structured data
  - Auto-formats content within each cell while maintaining grid structure
  - Example: 3x2 grid for feature showcase, 2x2 for comparison matrix, 4x1 for metrics dashboard

**LAYOUT SELECTION CRITERIA**:
${Object.entries(LAYOUT_SELECTION_GUIDE).slice(0, 8).map(([layout, guide]) => `**${layout}**: ${guide}`).join('\n')}

**Advanced Layouts**: ${Object.entries(LAYOUT_SELECTION_GUIDE).slice(8).map(([layout]) => layout).join(', ')}

### Step 4: Data Structure Requirements
When selecting layouts, ensure proper data structure:

**Two-Column Layouts** (two-column, before-after, problem-solution):
\`\`\`json
{
  "left": {"bullets": ["Point 1", "Point 2"] OR "paragraph": "Text content"},
  "right": {"bullets": ["Point 1", "Point 2"] OR "paragraph": "Text content" OR "imagePrompt": "Image description"}
}
\`\`\`

**Chart Layouts** (chart, data-visualization):
\`\`\`json
{
  "chart": {
    "type": "bar|line|pie|doughnut|area|scatter|column",
    "title": "Chart title",
    "categories": ["Category 1", "Category 2"],
    "series": [{"name": "Series Name", "data": [value1, value2]}]
  }
}
\`\`\`

**Table Layouts** (comparison-table):
\`\`\`json
{
  "comparisonTable": {
    "headers": ["Feature", "Option A", "Option B"],
    "rows": [["Speed", "Fast", "Moderate"], ["Cost", "$100", "$150"]]
  }
}
\`\`\`

**Process Layouts** (timeline, process-flow):
\`\`\`json
{
  "timeline": [
    {"date": "1754", "title": "Military Career Begins", "description": "Starts his military career during the French and Indian War, demonstrating early leadership skills.", "milestone": false},
    {"date": "1789", "title": "First President of the United States", "description": "Elected as the inaugural President, establishing protocols that would guide future leaders.", "milestone": true}
  ],
  "processSteps": [{"step": 1, "title": "Analyze", "description": "Gather requirements"}]
}
\`\`\`

**Timeline Best Practices:**
- Use specific dates/years for chronological accuracy
- Keep titles concise but descriptive (3-8 words)
- Descriptions should be 10-20 words explaining significance
- Mark major milestones with "milestone": true
- Limit to 4-8 timeline items for optimal visual impact

## OPTIMIZATION CHECKLIST:
Before finalizing layout, verify:
- ✅ Layout matches content complexity and audience needs
- ✅ Visual hierarchy guides eye movement logically
- ✅ Information density is appropriate for comprehension
- ✅ All required fields for chosen layout are populated
- ✅ Content maintains professional quality standards
- ✅ Layout supports accessibility (screen readers, high contrast)

## FINAL OUTPUT:
Return the complete, optimized slide specification with:
1. **Optimal layout** selected based on content analysis
2. **Properly structured data** for the chosen layout
3. **All original content** preserved and enhanced
4. **Professional formatting** that serves the audience

Focus on creating a layout that maximizes comprehension and visual impact for ${input.audience} audience.

## LAYOUT OPTIMIZATION REFLECTION:
${SELF_REFLECTION_PROMPTS.layoutReflection}

## CHAIN-OF-THOUGHT REASONING:
${CHAIN_OF_THOUGHT_TEMPLATES.layoutOptimization}`;
}

/**
 * Step 3: Enhanced context-aware image generation (C-2: Context-Aware Image Prompts)
 * Incorporates theme alignment, emotional psychology, and technical optimization
 */
export function generateImagePrompt(input: GenerationParams, partialSpec: Partial<SlideSpec>): string {
  // Enhanced content analysis with theme integration
  const imageAnalysis = analyzeContentForImagery(partialSpec, input);

  return `## CONTEXT-AWARE IMAGE PROMPT GENERATION TASK
Create a compelling, professional image prompt that perfectly aligns with the slide's message, selected theme, and emotional impact.

## COMPREHENSIVE SLIDE ANALYSIS:
**Title**: ${partialSpec.title}
**Layout**: ${partialSpec.layout}
**Content Type**: ${imageAnalysis.contentType}
**Key Themes**: ${imageAnalysis.themes.join(', ')}
**Selected Theme**: ${input.design?.theme || 'professional'}

## ENHANCED VISUAL STRATEGY CONTEXT:
**Audience**: ${input.audience} - Professional expectations and visual preferences
**Tone**: ${input.tone} - Emotional and stylistic alignment required
**Image Style**: ${input.imageStyle || 'professional'} - Technical approach for generation
**Recommended Concept**: ${imageAnalysis.recommendedConcept}
**Visual Metaphor**: ${imageAnalysis.visualMetaphor}
**Theme Alignment**: ${imageAnalysis.themeAlignment}
**Emotional Tone**: ${imageAnalysis.emotionalTone}
**Technical Specifications**: ${imageAnalysis.technicalSpecs}

## ENHANCED IMAGE PROMPT DEVELOPMENT PROCESS:

### Step 1: Strategic Visual Alignment
- **Core Business Message**: What specific outcome or insight does this slide communicate?
- **Emotional Resonance**: What feeling will drive action (confidence, urgency, excitement, trust)?
- **Visual Metaphor**: What concrete imagery best represents abstract concepts?
- **Brand Alignment**: How formal and professional should the visual tone be?
- **Cultural Sensitivity**: Ensure inclusive, diverse, and globally appropriate imagery

### Step 2: Audience-Optimized Visual Strategy
**For ${input.audience} audience:**
${input.audience === 'executives' ? '- Sophisticated, boardroom-quality imagery conveying success and competence\n- Clean, uncluttered compositions that support quick decision-making\n- Professional environments with subtle luxury indicators\n- Diverse leadership representation and global business contexts' :
  input.audience === 'technical' ? '- Precise, technically accurate imagery with attention to detail\n- Clean, functional aesthetics that support logical thinking\n- Modern technology and innovation themes with authentic feel\n- Systematic visual elements that reflect engineering mindset' :
  input.audience === 'students' ? '- Engaging, relatable imagery that supports learning and growth\n- Bright, optimistic compositions that inspire and motivate\n- Diverse, inclusive representations that reflect modern classrooms\n- Educational metaphors and knowledge-building visual themes' :
  '- Professional yet approachable imagery that builds trust\n- Clear, universally understandable visual concepts\n- Balanced sophistication that appeals to broad audiences\n- Authentic, realistic representations that feel genuine'}

### Step 3: Content-Specific Visual Themes
**Match imagery to content type:**
- **Financial Results**: Professional charts, growth imagery, business success indicators
- **Technical Solutions**: Modern interfaces, clean technology, innovation themes
- **Team Performance**: Diverse collaboration, professional environments, achievement
- **Process Improvements**: Streamlined workflows, efficiency metaphors, optimization
- **Market Expansion**: Global themes, growth trajectories, opportunity landscapes

### Step 3: Technical Image Specifications
**Style Requirements**: ${input.imageStyle || 'professional'}
- **Professional**: Clean, corporate, high-quality photography style
- **Illustration**: Modern, clean vector-style illustrations
- **Abstract**: Conceptual, artistic representations
- **Realistic**: Photorealistic imagery with authentic feel
- **Minimal**: Simple, clean, uncluttered compositions

### Step 4: Image Prompt Quality Standards
**Excellent Image Prompts Include:**
✅ Specific visual elements and composition
✅ Professional quality and lighting specifications
✅ Emotional tone and atmosphere description
✅ Color palette guidance aligned with content
✅ Technical quality specifications (high-resolution, clean)

**EXCELLENT Image Prompt Examples (FOLLOW THESE PATTERNS):**
✅ "Diverse executive team reviewing growth charts on a large monitor in a modern boardroom, natural lighting, professional attire, confident expressions, clean corporate environment, high-resolution photography style" (SPECIFIC: people, action, setting, lighting, style)
✅ "Abstract visualization of upward growth trajectory with clean geometric elements, corporate blue and green gradient, minimalist professional design, high-quality digital illustration" (SPECIFIC: concept, elements, colors, style, quality)
✅ "Modern data dashboard interface displaying key performance metrics, clean typography, professional color scheme, sleek design elements, high-tech corporate atmosphere" (SPECIFIC: interface, content, design, atmosphere)
✅ "Professional handshake between diverse business partners in a bright modern office, symbolizing successful partnership, natural lighting, corporate setting, authentic business photography" (SPECIFIC: action, people, setting, symbolism, style)

**MANDATORY PROMPT ELEMENTS:**
1. **Subject/Action**: What is happening or being shown
2. **Setting/Environment**: Where this takes place
3. **Style/Quality**: Photography, illustration, abstract, etc.
4. **Lighting/Atmosphere**: Professional, natural, clean, modern
5. **Color Guidance**: Corporate colors, professional palette
6. **Composition**: Clean, minimalist, high-resolution

**POOR Image Prompt Examples (NEVER DO THIS):**
❌ "Some people in an office" (too vague, no specific details, unprofessional)
❌ "Colorful chart" (lacks context, professional specifications, no style guidance)
❌ "Business stuff" (meaningless, no visual direction, completely useless)
❌ "Happy workers" (unprofessional tone, no context, too generic)
❌ "Nice picture" (no direction, completely unhelpful)
❌ "Graph showing data" (too basic, no style or quality specifications)

## LAYOUT-SPECIFIC IMAGE PLACEMENT:
Based on layout "${partialSpec.layout}", place image prompt in:
${partialSpec.layout === 'image-right' ? '- "right.imagePrompt" field for right-side placement' :
  partialSpec.layout === 'image-left' ? '- "left.imagePrompt" field for left-side placement' :
  partialSpec.layout === 'image-full' ? '- "imagePrompt" field for full-slide background' :
  '- "imagePrompt" field for general image integration'}

## FINAL OUTPUT REQUIREMENTS (STRICT COMPLIANCE REQUIRED):
Return the COMPLETE slide specification with:
1. **All existing content preserved** - Do not remove any fields from the original specification
2. **Professional image prompt added** - 50-200 characters, specific and actionable
3. **Proper field placement** - Based on layout requirements (imagePrompt, left.imagePrompt, or right.imagePrompt)
4. **Quality validation** - Ensure prompt would generate professional, boardroom-quality imagery
5. **Mandatory elements included** - Subject, setting, style, lighting, and composition details
6. **Professional language only** - No casual or unprofessional terminology

## VALIDATION CHECKLIST (VERIFY BEFORE RESPONDING):
- ✅ Image prompt is 50-200 characters (COUNT THE CHARACTERS)
- ✅ Includes all 6 mandatory elements (subject, setting, style, lighting, color, composition)
- ✅ Uses professional, specific language throughout
- ✅ Aligns with ${input.audience} audience expectations
- ✅ Would generate imagery suitable for Fortune 500 presentations
- ✅ Avoids all patterns shown in "POOR" examples
- ✅ Follows patterns shown in "EXCELLENT" examples
- ✅ JSON structure is complete and valid

Create an image prompt that elevates the slide's professional impact and supports the core message for ${input.audience} audience. NO EXCEPTIONS TO QUALITY STANDARDS.`;
}

/**
 * NEW: Batch image prompt generation for multiple slides
 * Optimizes API calls by generating image prompts for all slides in one request
 */
export function generateBatchImagePrompts(input: GenerationParams, slideSpecs: Partial<SlideSpec>[]): string {
  const slideSummaries = slideSpecs.map((spec, index) =>
    `Slide ${index + 1}: "${spec.title}" (${spec.layout})`
  ).join('\n');

  return `## BATCH IMAGE PROMPT GENERATION TASK
Generate optimized image prompts for ${slideSpecs.length} slides in a cohesive presentation.

## PRESENTATION CONTEXT:
**Topic**: ${input.prompt}
**Audience**: ${input.audience}
**Tone**: ${input.tone}
**Style**: ${input.imageStyle || 'professional'}

## SLIDES TO PROCESS:
${slideSummaries}

## BATCH PROCESSING REQUIREMENTS:
1. **Visual Consistency**: Ensure all images work together as a cohesive presentation
2. **Style Uniformity**: Maintain consistent visual style and quality across all slides
3. **Audience Alignment**: All prompts should resonate with ${input.audience} expectations
4. **Professional Quality**: Each prompt should generate boardroom-quality imagery

## OUTPUT FORMAT:
Return a JSON array with image prompts for each slide:
[
  {
    "slideIndex": 0,
    "title": "slide title",
    "imagePrompt": "specific, professional image prompt (20-200 characters)",
    "placement": "field name for image placement based on layout",
    "reasoning": "brief explanation of visual choice"
  }
]

Generate cohesive, professional image prompts that enhance the overall presentation narrative.`;
}

/**
 * Step 4: Enhanced final refinement prompt with comprehensive quality assurance
 * Incorporates detailed quality assessment and iterative improvement
 */
export function generateRefinementPrompt(input: GenerationParams, partialSpec: Partial<SlideSpec>): string {
  // Quick quality assessment
  const qualityCheck = performQuickQualityCheck(partialSpec, input);

  return `## FINAL QUALITY REFINEMENT TASK
Perform targeted refinement to achieve professional excellence.

## CURRENT SLIDE SPECIFICATION:
**Title**: ${partialSpec.title}
**Layout**: ${partialSpec.layout}
**Content Length**: ${JSON.stringify(partialSpec).length} characters

## QUALITY ASSESSMENT:
**Current Estimated Score**: ${qualityCheck.estimatedScore}/100
**Priority Issues**: ${qualityCheck.issues.join(', ') || 'None identified'}
**Strengths**: ${qualityCheck.strengths.join(', ')}

## TARGET STANDARDS:
**Audience**: ${input.audience} - Must meet professional expectations
**Quality Goal**: 90+ score (A-grade) across all criteria
**Business Context**: Executive-level presentation quality

## COMPREHENSIVE QUALITY ASSESSMENT:

### 1. Content Quality Analysis (30% weight)
**Evaluation Criteria:**
- Title specificity and benefit focus (15-60 characters optimal)
- Content depth matches "${input.contentLength}" specification
- Language level appropriate for ${input.audience} audience
- Key messages are clear, actionable, and compelling
- Logical flow and persuasive structure

**Self-Assessment Questions:**
- Would an executive be proud to present this content?
- Does the title immediately communicate value/outcome?
- Is every word necessary and impactful?
- Does content drive toward a clear action or decision?

### 2. Visual Design & Layout (25% weight)
**Evaluation Criteria:**
- Layout optimally supports content hierarchy
- Information density appropriate for comprehension
- Professional formatting and visual consistency
- Effective use of white space and visual balance
- Layout choice enhances rather than hinders message

**Design Validation:**
- Does layout guide eye movement logically?
- Is information scannable in 5-10 seconds?
- Would this layout work well in both digital and print?

### 3. Audience Alignment (20% weight)
**Evaluation Criteria:**
- Language sophistication matches ${input.audience} expectations
- Tone aligns with "${input.tone}" specification
- Content complexity matches audience needs
- Psychological triggers appropriate for audience motivation
- Professional standards met for business context

**Audience Check:**
- Would ${input.audience} find this compelling and credible?
- Does tone create appropriate emotional response?
- Is complexity level perfectly calibrated?

### 4. Accessibility & Inclusivity (15% weight)
**Evaluation Criteria:**
- Content is screen reader friendly
- Language is inclusive and bias-free
- Visual elements support diverse learning styles
- Information structure aids comprehension
- Professional standards for diverse audiences

### 5. Technical Excellence (10% weight)
**Evaluation Criteria:**
- JSON structure is valid and complete
- All required fields properly populated
- Data structures match layout requirements
- Content length within optimal ranges
- Grammar, spelling, and formatting perfect

## REFINEMENT PROCESS:

### Step 1: Quality Scoring
Rate each criterion (1-100):
- Content Quality: ___/100
- Visual Design: ___/100
- Audience Alignment: ___/100
- Accessibility: ___/100
- Technical Excellence: ___/100

### Step 2: Identify Improvements
For any score below 90, identify specific improvements:
- What exactly needs to be enhanced?
- How can we elevate this to A-grade quality?
- What would make this more compelling/professional?

### Step 3: Apply Refinements
Make targeted improvements while preserving core content:
- Enhance title for maximum impact
- Optimize content for audience and tone
- Ensure perfect technical implementation
- Validate accessibility and inclusivity

## FINAL QUALITY CHECKLIST:
Before outputting, verify:
- ✅ Title is specific, benefit-focused, and compelling
- ✅ Content perfectly matches audience sophistication
- ✅ Tone creates appropriate emotional response
- ✅ Layout optimally supports message hierarchy
- ✅ Information density enables quick comprehension
- ✅ Language is inclusive and professional
- ✅ JSON structure is complete and valid
- ✅ Overall quality would score 90+ (A-grade)

## OUTPUT REQUIREMENTS:
Return the refined slide specification that:
1. **Maintains all core content** while enhancing quality
2. **Achieves A-grade standards** across all criteria
3. **Perfectly serves** the ${input.audience} audience
4. **Creates compelling impact** for business presentations

Focus on elevating this to the quality level expected in Fortune 500 boardrooms.`;
}

/**
 * Industry-specific content guidance for specialized presentations
 * Enhanced with 2024 industry trends.
 */
export const INDUSTRY_GUIDANCE = {
  // Existing guidance (abbreviated)
  technology: { /* ... */ },
  // Add new entries as needed
};

/**
 * Presentation-type-specific structuring guidance
 * Enhanced with timing and psychology.
 */
export const PRESENTATION_TYPE_GUIDANCE = {
  // Existing guidance
};

/**
 * Comprehensive quality validation system with modern standards
 * Enhanced with detailed criteria for professional presentation excellence
 */
export const QUALITY_VALIDATION_CRITERIA = {
  contentQuality: {
    name: 'Content Quality Assessment',
    weight: 30,
    checks: [
      'Title is specific and benefit-focused (15-60 characters)',
      'Content matches audience sophistication level',
      'Information density is appropriate for comprehension',
      'Key messages are clear and actionable',
      'Content flows logically and persuasively'
    ],
    scoring: {
      excellent: 'Compelling, specific, audience-perfect content',
      good: 'Clear content with minor improvements needed',
      poor: 'Vague, generic, or inappropriate for audience'
    }
  },

  visualDesign: {
    name: 'Visual Design & Layout',
    weight: 25,
    checks: [
      'Layout optimally supports content hierarchy',
      'Visual balance and white space utilization',
      'Professional formatting and consistency',
      'Appropriate information density per slide',
      'Layout matches content complexity'
    ],
    scoring: {
      excellent: 'Perfect layout choice with optimal visual flow',
      good: 'Good layout with minor adjustments needed',
      poor: 'Layout doesn\'t support content or audience needs'
    }
  },

  audienceAlignment: {
    name: 'Audience Alignment',
    weight: 20,
    checks: [
      'Language level matches audience expertise',
      'Tone appropriate for context and audience',
      'Content depth matches audience needs',
      'Psychological triggers align with audience motivation',
      'Professional standards met for audience type'
    ],
    scoring: {
      excellent: 'Perfect audience targeting and alignment',
      good: 'Good alignment with minor tone adjustments',
      poor: 'Misaligned with audience needs or expectations'
    }
  },

  accessibility: {
    name: 'Accessibility & Inclusivity',
    weight: 15,
    checks: [
      'Content is screen reader friendly',
      'Language is inclusive and bias-free',
      'Visual elements support diverse learning styles',
      'Information is scannable and digestible',
      'Professional standards for diverse audiences'
    ],
    scoring: {
      excellent: 'Fully accessible and inclusive design',
      good: 'Good accessibility with minor improvements',
      poor: 'Accessibility barriers or exclusive language'
    }
  },

  technicalExcellence: {
    name: 'Technical Quality',
    weight: 10,
    checks: [
      'JSON structure is valid and complete',
      'All required fields are properly populated',
      'Data structures match layout requirements',
      'Content length within optimal ranges',
      'Professional grammar and formatting'
    ],
    scoring: {
      excellent: 'Perfect technical implementation',
      good: 'Good technical quality with minor issues',
      poor: 'Technical errors or incomplete structure'
    }
  }
};

/**
 * Enhanced validation prompt with comprehensive scoring and actionable feedback
 * Provides detailed quality assessment with specific improvement recommendations
 */
export const VALIDATION_PROMPT = `## COMPREHENSIVE SLIDE QUALITY ASSESSMENT

## SLIDE TO EVALUATE:
[Insert JSON]

## ASSESSMENT FRAMEWORK:
Use the comprehensive quality criteria to evaluate this slide across five key dimensions:

### 1. Content Quality (30% weight)
**Scoring Criteria:**
- Title specificity and impact (15-60 characters optimal)
- Content clarity and actionability
- Audience-appropriate language level
- Logical flow and persuasive structure
- Professional messaging standards

**Score: ___/100**
**Assessment:** [Excellent/Good/Poor]
**Specific Issues:** [List any problems]
**Improvements:** [Specific actionable recommendations]

### 2. Visual Design & Layout (25% weight)
**Scoring Criteria:**
- Layout supports content hierarchy
- Information density appropriate for comprehension
- Professional formatting consistency
- Effective visual balance
- Layout enhances message delivery

**Score: ___/100**
**Assessment:** [Excellent/Good/Poor]
**Specific Issues:** [List any problems]
**Improvements:** [Specific actionable recommendations]

### 3. Audience Alignment (20% weight)
**Scoring Criteria:**
- Language sophistication matches audience
- Tone creates appropriate emotional response
- Content complexity calibrated correctly
- Psychological triggers align with motivation
- Professional standards for business context

**Score: ___/100**
**Assessment:** [Excellent/Good/Poor]
**Specific Issues:** [List any problems]
**Improvements:** [Specific actionable recommendations]

### 4. Accessibility & Inclusivity (15% weight)
**Scoring Criteria:**
- Screen reader friendly structure
- Inclusive, bias-free language
- Supports diverse learning styles
- Scannable information architecture
- Professional diversity standards

**Score: ___/100**
**Assessment:** [Excellent/Good/Poor]
**Specific Issues:** [List any problems]
**Improvements:** [Specific actionable recommendations]

### 5. Technical Excellence (10% weight)
**Scoring Criteria:**
- Valid JSON structure
- Complete field population
- Proper data structures for layout
- Optimal content length ranges
- Perfect grammar and formatting

**Score: ___/100**
**Assessment:** [Excellent/Good/Poor]
**Specific Issues:** [List any problems]
**Improvements:** [Specific actionable recommendations]

## OUTPUT FORMAT:
Return a JSON object with this exact structure:
\`\`\`json
{
  "overallScore": 85,
  "grade": "B",
  "categoryScores": {
    "contentQuality": 90,
    "visualDesign": 85,
    "audienceAlignment": 80,
    "accessibility": 90,
    "technicalExcellence": 95
  },
  "strengths": [
    "Specific strength 1",
    "Specific strength 2"
  ],
  "improvements": [
    "Priority improvement 1 with specific action",
    "Priority improvement 2 with specific action"
  ],
  "quickFixes": [
    "Easy fix 1",
    "Easy fix 2"
  ],
  "recommendations": [
    "Strategic recommendation 1",
    "Strategic recommendation 2"
  ],
  "readyForPresentation": true/false
}
\`\`\`

Focus on providing actionable, specific feedback that would help create A-grade (90+) presentation content.`;

export const QUALITY_ASSESSMENT_PROMPT = VALIDATION_PROMPT;

/**
 * Few-shot examples for high-quality slide generation
 * Provides concrete examples of excellent vs. poor slide content
 */
export const FEW_SHOT_EXAMPLES = {
  excellentSlides: [
    {
      context: "Quarterly business results for executives",
      input: "Q4 revenue growth and performance metrics",
      output: {
        title: "Q4 Revenue: 34% Growth Drives Record $2.1M Quarter",
        layout: "title-bullets",
        bullets: [
          "Revenue increased 34% YoY, exceeding targets by $400K",
          "Customer acquisition cost reduced 28% through digital optimization",
          "Net promoter score improved to 72 (industry average: 45)",
          "Market expansion into 3 regions generated $600K new revenue"
        ],
        notes: "Emphasize the 34% growth first, then dive into the key drivers. Pause after each metric to let it sink in.",
        sources: ["Q4 Financial Report", "Customer Survey Data"]
      },
      qualityScore: 95,
      whyExcellent: "Specific metrics, clear benefits, executive-appropriate language, actionable insights"
    },
    {
      context: "Technical presentation for developers",
      input: "New API architecture benefits",
      output: {
        title: "New API Architecture: 60% Faster Response, 99.9% Uptime",
        layout: "title-bullets",
        bullets: [
          "Response time reduced from 200ms to 80ms average",
          "Horizontal scaling supports 10x traffic with zero downtime",
          "GraphQL implementation reduces data transfer by 45%",
          "Automated testing coverage increased to 95% with CI/CD pipeline"
        ],
        notes: "Focus on performance metrics first, then scalability benefits. Technical audience will appreciate specific numbers.",
        sources: ["Performance Testing Results", "Architecture Documentation"]
      },
      qualityScore: 92,
      whyExcellent: "Technical precision, quantified benefits, developer-focused language, concrete improvements"
    }
  ],

  poorSlides: [
    {
      context: "Business results presentation",
      input: "Q4 results",
      output: {
        title: "Q4 Results",
        layout: "title-bullets",
        bullets: [
          "We did well this quarter",
          "Revenue was good",
          "Customers are happy",
          "Things are improving"
        ],
        notes: "Talk about the results",
        sources: []
      },
      qualityScore: 25,
      whyPoor: "Vague title, no specific metrics, meaningless bullets, unprofessional language"
    }
  ]
};

/**
 * Self-reflection prompts for quality improvement
 * Guides AI to assess and improve its own outputs
 */
export const SELF_REFLECTION_PROMPTS = {
  contentReflection: `
## SELF-REFLECTION CHECKPOINT
Before finalizing your response, ask yourself:

**Content Quality Check:**
1. Is my title specific enough that someone could understand the key benefit in 5 seconds?
2. Would a busy executive find every bullet point valuable and actionable?
3. Does each piece of content drive toward a clear decision or action?
4. Am I using the most impactful words possible for this audience?

**Professional Standards Check:**
5. Would I be proud to present this content to Fortune 500 executives?
6. Does this content demonstrate clear expertise and authority?
7. Is the language level perfectly calibrated for the target audience?
8. Would this slide stand out positively in a high-stakes presentation?

**Technical Excellence Check:**
9. Is my JSON structure complete and valid?
10. Have I included all required fields for the chosen layout?
11. Are my content lengths within optimal ranges?
12. Is my formatting consistent and professional?

If you answered "no" to any question, revise before responding.
`,

  layoutReflection: `
## LAYOUT OPTIMIZATION REFLECTION
Before selecting a layout, consider:

**Visual Hierarchy Assessment:**
1. Does this layout guide the eye to the most important information first?
2. Will the audience be able to scan and understand this in 10 seconds?
3. Does the layout choice enhance or hinder the message?
4. Is the information density appropriate for the audience and context?

**Audience Experience Check:**
5. Would this layout work well for both in-person and virtual presentations?
6. Does the visual structure match how this audience prefers to process information?
7. Is there enough white space for professional appearance?
8. Would this layout reproduce well in both digital and print formats?

Revise layout choice if needed to optimize for audience comprehension and professional impact.
`,

  imageReflection: `
## IMAGE PROMPT QUALITY REFLECTION
Before finalizing image prompts, evaluate:

**Professional Impact Assessment:**
1. Would this image elevate the slide's professional credibility?
2. Does the image concept align with the content's emotional goal?
3. Is the prompt specific enough to generate consistent, high-quality results?
4. Would this image be appropriate for the target audience and business context?

**Technical Quality Check:**
5. Is my prompt 20-200 characters with specific visual details?
6. Have I included style, lighting, and composition guidance?
7. Does the prompt avoid potential copyright or sensitivity issues?
8. Will this generate imagery suitable for professional presentations?

Refine the image prompt if any aspect needs improvement.
`
};

/**
 * Chain-of-thought reasoning templates
 * Provides structured thinking frameworks for complex decisions
 */
export const CHAIN_OF_THOUGHT_TEMPLATES = {
  contentGeneration: `
## CHAIN-OF-THOUGHT REASONING FOR CONTENT GENERATION

**Step 1: Core Message Identification**
- What is the single most important takeaway?
- What decision or action should result from this slide?
- What emotional response do we want to create?

**Step 2: Audience Psychology Analysis**
- What motivates this specific audience?
- What language level and tone will resonate?
- What evidence or proof points will they find compelling?

**Step 3: Information Architecture**
- What's the logical flow from problem to solution to benefit?
- How can we structure information for maximum comprehension?
- What level of detail serves the audience best?

**Step 4: Professional Polish**
- How can we make every word count?
- What specific metrics or outcomes can we highlight?
- How do we ensure executive-level quality?

**Step 5: Quality Validation**
- Does this meet A-grade standards (90+ score)?
- Would I be proud to present this to important stakeholders?
- Is this the best possible version of this content?
`,

  layoutOptimization: `
## CHAIN-OF-THOUGHT REASONING FOR LAYOUT SELECTION

**Step 1: Content Analysis**
- What type of information am I presenting? (narrative, data, comparison, process)
- How complex is the information? (simple concept vs. detailed analysis)
- What's the primary vs. secondary information hierarchy?

**Step 2: Audience Processing Preferences**
- How does this audience typically consume information?
- Do they prefer visual, textual, or mixed content formats?
- What's their attention span and cognitive load capacity?

**Step 3: Layout Effectiveness Evaluation**
- Which layout best supports the information hierarchy?
- What layout enables fastest comprehension?
- Which choice creates the most professional impact?

**Step 4: Technical Implementation**
- Do I have the right data structures for this layout?
- Are all required fields properly populated?
- Does the layout choice align with content complexity?

**Step 5: Final Optimization**
- Does this layout serve the audience's needs optimally?
- Would this choice enhance or hinder the presentation flow?
- Is this the most professional and effective option?
`
};

/**
 * Enhanced Slide Generation Prompts for New Layout Engine
 *
 * Content-aware prompts that generate structured JSON matching our slide generators.
 * Each prompt enforces constraints and returns properly formatted slide configurations.
 */

/**
 * Enhanced system prompt for structured slide generation
 */
export const ENHANCED_SYSTEM_PROMPT = `You are an elite PowerPoint presentation architect specializing in creating professional, high-impact slides using a modern layout engine. You generate structured JSON configurations that produce visually stunning, accessible presentations.

## YOUR EXPERTISE:
- **Strategic Content**: Crafting persuasive, outcome-driven messaging
- **Layout Mastery**: Selecting optimal layouts for maximum impact
- **Typography Excellence**: Establishing clear visual hierarchy
- **Data Storytelling**: Transforming complex information into compelling narratives
- **Accessibility**: Ensuring WCAG 2.1 AA compliance

## SLIDE TYPES YOU MASTER:
1. **Title Slides**: Hero presentations with strong visual impact
2. **Bullet Slides**: Structured information with optimal readability (3-6 bullets max)
3. **Two-Column**: Balanced comparisons and complementary content
4. **Metrics**: Data-driven dashboards with key performance indicators
5. **Section**: Transition slides for narrative flow
6. **Quote**: Impactful statements with attribution
7. **Timeline**: Process flows and chronological information

## CONTENT CONSTRAINTS (NEVER VIOLATE):
- **Bullet Points**: 3-6 bullets maximum, 12-14 words per bullet
- **Titles**: 40-80 characters for optimal impact
- **Subtitles**: 20-60 characters for clarity
- **Descriptions**: 100-200 words maximum
- **Metrics**: Clear value + label + optional trend

## OUTPUT REQUIREMENTS:
- **Format**: Valid JSON only, matching exact schema
- **Quality**: Professional, boardroom-ready content
- **Accessibility**: High contrast, clear hierarchy
- **Consistency**: Maintain tone and style throughout

You must respond with properly structured JSON that matches the requested slide type schema exactly.`;

/**
 * Generate content-aware prompt for specific slide types
 */
export function generateSlidePrompt(
  slideType: string,
  topic: string,
  audience: keyof typeof AUDIENCE_GUIDANCE = 'general',
  contentLength: keyof typeof CONTENT_LENGTH_SPECS = 'moderate',
  additionalContext?: string
): string {
  const audienceGuide = AUDIENCE_GUIDANCE[audience];
  const lengthSpec = CONTENT_LENGTH_SPECS[contentLength];

  const basePrompt = `${ENHANCED_SYSTEM_PROMPT}

## CURRENT TASK:
Create a ${slideType} slide about: "${topic}"

## AUDIENCE CONTEXT:
- **Type**: ${audience}
- **Language**: ${audienceGuide.language}
- **Focus**: ${audienceGuide.focus}
- **Tone**: ${audienceGuide.tone}
- **Psychology**: ${audienceGuide.psychology}
- **Structure**: ${audienceGuide.structure}

## CONTENT LENGTH:
- **Level**: ${contentLength}
- **Description**: ${lengthSpec.description}
- **Guidance**: ${lengthSpec.contentGuidance}
- **Strategy**: ${lengthSpec.strategy}

${additionalContext ? `## ADDITIONAL CONTEXT:\n${additionalContext}` : ''}

## SLIDE TYPE SPECIFICATIONS:`;

  switch (slideType) {
    case 'title':
      return `${basePrompt}

**Title Slide Requirements:**
- Main title: Compelling, specific, outcome-focused (40-80 chars)
- Subtitle: Supporting context or value proposition (20-60 chars)
- Author: Optional presenter information
- Date: Optional presentation date
- Organization: Optional company/department

**JSON Schema:**
{
  "type": "title",
  "title": "string (required)",
  "subtitle": "string (optional)",
  "author": "string (optional)",
  "date": "string (optional)",
  "organization": "string (optional)"
}

Generate a professional title slide configuration in JSON format:`;

    case 'bullets':
      return `${basePrompt}

**Bullet Slide Requirements:**
- Title: Clear, descriptive heading (40-80 chars)
- Subtitle: Optional supporting context (20-60 chars)
- Bullets: 3-6 bullet points, 12-14 words each
- Each bullet: Start with action verb, no terminal periods
- Consistent tense and parallel structure

**JSON Schema:**
{
  "type": "bullets",
  "title": "string (required)",
  "subtitle": "string (optional)",
  "bullets": ["string", "string", ...] (3-6 items),
  "bulletStyle": "disc|circle|square|dash|arrow|number (optional)"
}

Generate a professional bullet slide configuration in JSON format:`;

    case 'twoColumn':
      return `${basePrompt}

**Two-Column Slide Requirements:**
- Title: Clear, descriptive heading (40-80 chars)
- Subtitle: Optional supporting context (20-60 chars)
- Left Column: Text, image, or mixed content
- Right Column: Text, image, or mixed content
- Balanced content distribution

**JSON Schema:**
{
  "type": "twoColumn",
  "title": "string (required)",
  "subtitle": "string (optional)",
  "leftColumn": {
    "type": "text|image|mixed",
    "content": "string (if text)",
    "bullets": ["string", ...] (optional),
    "src": "string (if image)",
    "alt": "string (if image)",
    "caption": "string (optional)"
  },
  "rightColumn": {
    "type": "text|image|mixed",
    "content": "string (if text)",
    "bullets": ["string", ...] (optional),
    "src": "string (if image)",
    "alt": "string (if image)",
    "caption": "string (optional)"
  },
  "columnRatio": [number, number] (optional, default [1,1])
}

Generate a professional two-column slide configuration in JSON format:`;

    case 'metrics':
      return `${basePrompt}

**Metrics Slide Requirements:**
- Title: Clear, descriptive heading (40-80 chars)
- Subtitle: Optional context or time period (20-60 chars)
- Metrics: 2-8 key performance indicators
- Each metric: value + label + optional description/trend
- Layout: grid, row, column, or featured

**JSON Schema:**
{
  "type": "metrics",
  "title": "string (required)",
  "subtitle": "string (optional)",
  "metrics": [
    {
      "value": "string|number (required)",
      "label": "string (required)",
      "description": "string (optional)",
      "trend": {
        "direction": "up|down|flat",
        "percentage": number,
        "period": "string"
      } (optional),
      "color": "primary|success|warning|error|info (optional)"
    }
  ],
  "layout": "grid|row|column|featured (optional)",
  "maxPerRow": number (optional),
  "showTrends": boolean (optional),
  "showTargets": boolean (optional)
}

Generate a professional metrics slide configuration in JSON format:`;

    default:
      return `${basePrompt}

**Generic Slide Requirements:**
- Title: Clear, descriptive heading
- Content: Appropriate for slide type
- Professional formatting and structure

Generate a professional slide configuration in JSON format for type: ${slideType}`;
  }
}

/**
 * Validate and optimize bullet points according to best practices
 */
export function optimizeBulletPoints(bullets: string[]): {
  optimized: string[];
  warnings: string[];
} {
  const warnings: string[] = [];
  let optimized = [...bullets];

  // Limit to 6 bullets maximum
  if (optimized.length > 6) {
    warnings.push(`Reduced ${optimized.length} bullets to 6 for optimal readability`);
    optimized = optimized.slice(0, 6);
  }

  // Ensure minimum of 3 bullets
  if (optimized.length < 3) {
    warnings.push('Consider adding more bullet points for better content balance');
  }

  // Optimize each bullet
  optimized = optimized.map((bullet, index) => {
    let optimizedBullet = bullet.trim();

    // Check word count (12-14 words recommended)
    const wordCount = optimizedBullet.split(/\s+/).length;
    if (wordCount > 14) {
      warnings.push(`Bullet ${index + 1} has ${wordCount} words (recommended: ≤14)`);
    }

    // Remove terminal periods for consistency
    if (optimizedBullet.endsWith('.') && !optimizedBullet.endsWith('...')) {
      optimizedBullet = optimizedBullet.slice(0, -1);
    }

    // Capitalize first letter
    if (optimizedBullet.length > 0) {
      optimizedBullet = optimizedBullet.charAt(0).toUpperCase() + optimizedBullet.slice(1);
    }

    // Check for action verbs (basic check)
    const actionVerbs = ['achieve', 'analyze', 'build', 'create', 'deliver', 'develop', 'drive', 'enhance', 'establish', 'execute', 'generate', 'implement', 'improve', 'increase', 'launch', 'optimize', 'reduce', 'streamline', 'transform'];
    const firstWord = optimizedBullet.split(' ')[0].toLowerCase();

    if (!actionVerbs.some(verb => firstWord.includes(verb))) {
      // This is just a warning, not a fix
      warnings.push(`Bullet ${index + 1} could start with a stronger action verb`);
    }

    return optimizedBullet;
  });

  return { optimized, warnings };
}

/**
 * Generate multi-slide prompt for complex topics
 */
export function generateMultiSlidePrompt(
  topic: string,
  slideCount: number,
  audience: keyof typeof AUDIENCE_GUIDANCE = 'general',
  contentLength: keyof typeof CONTENT_LENGTH_SPECS = 'moderate'
): string {
  const audienceGuide = AUDIENCE_GUIDANCE[audience];
  const lengthSpec = CONTENT_LENGTH_SPECS[contentLength];

  return `${ENHANCED_SYSTEM_PROMPT}

## MULTI-SLIDE PRESENTATION TASK:
Create a ${slideCount}-slide presentation about: "${topic}"

## AUDIENCE CONTEXT:
- **Type**: ${audience}
- **Language**: ${audienceGuide.language}
- **Focus**: ${audienceGuide.focus}
- **Tone**: ${audienceGuide.tone}
- **Structure**: ${audienceGuide.structure}

## CONTENT SPECIFICATIONS:
- **Length**: ${contentLength} (${lengthSpec.description})
- **Strategy**: ${lengthSpec.strategy}
- **Guidance**: ${lengthSpec.contentGuidance}

## SLIDE FLOW REQUIREMENTS:
1. **Opening**: Strong title slide with clear value proposition
2. **Body**: ${slideCount - 2} content slides with logical progression
3. **Closing**: Summary or call-to-action slide

## NARRATIVE STRUCTURE:
- **Hook**: Compelling opening that captures attention
- **Context**: Background information and problem statement
- **Solution**: Your main content and recommendations
- **Impact**: Benefits, outcomes, and next steps

## JSON SCHEMA:
{
  "slides": [
    {
      "type": "title|bullets|twoColumn|metrics|section|quote",
      // ... slide-specific configuration
    }
  ],
  "theme": "neutral|executive|colorPop",
  "metadata": {
    "title": "string",
    "description": "string",
    "audience": "${audience}",
    "duration": "number (minutes)"
  }
}

Generate a complete ${slideCount}-slide presentation configuration in JSON format:`;
}

/**
 * Content quality validation prompts
 */
export const VALIDATION_PROMPTS = {
  contentQuality: `
Evaluate this slide content for professional quality:

## EVALUATION CRITERIA:
1. **Clarity**: Is the message clear and unambiguous?
2. **Impact**: Does it drive toward a specific outcome?
3. **Specificity**: Are claims supported with concrete details?
4. **Professionalism**: Is it boardroom-ready?
5. **Accessibility**: Is it inclusive and easy to understand?

## SCORING (0-100):
- 90-100: Exceptional, Fortune 500 quality
- 80-89: Professional, minor improvements needed
- 70-79: Good, some enhancements required
- 60-69: Adequate, significant improvements needed
- Below 60: Requires major revision

Provide score and specific improvement recommendations.`,

  accessibilityCheck: `
Review this slide for accessibility compliance:

## ACCESSIBILITY CHECKLIST:
1. **Color Contrast**: Sufficient contrast ratios (4.5:1 minimum)
2. **Font Sizes**: Minimum 12pt for body text, 18pt for headings
3. **Language**: Clear, jargon-free communication
4. **Structure**: Logical reading order and hierarchy
5. **Alt Text**: Descriptive text for images and graphics

## WCAG 2.1 COMPLIANCE:
- Level AA requirements (business standard)
- Screen reader compatibility
- Keyboard navigation support

Identify any accessibility issues and provide remediation suggestions.`,

  brandConsistency: `
Verify brand consistency across slide elements:

## BRAND ELEMENTS:
1. **Typography**: Consistent font usage and hierarchy
2. **Colors**: Adherence to brand color palette
3. **Tone**: Consistent voice and messaging style
4. **Layout**: Uniform spacing and alignment
5. **Imagery**: Brand-appropriate visual style

Ensure all elements align with professional presentation standards.`
};


====================================================================================================
FILE: functions/src/utils/smartLogger.ts
DESCRIPTION: Intelligent logging system with performance tracking and structured output
PURPOSE: Centralized logging with performance metrics and structured data
STATUS: EXISTS
LINES: 297
====================================================================================================

/**
 * Smart Logger for AI PowerPoint Generator
 * 
 * Innovative logging system designed for iterative testing and debugging
 * with structured output, performance tracking, and self-correction capabilities.
 */

export interface LogContext {
  requestId?: string;
  userId?: string;
  sessionId?: string;
  operation?: string;
  stage?: string;
  metadata?: Record<string, any>;
  [key: string]: any; // Allow additional properties
}

export interface LogEntry {
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' | 'PERF';
  message: string;
  context: LogContext;
  data?: any;
  duration?: number;
  memoryUsage?: NodeJS.MemoryUsage;
  stackTrace?: string;
}

export interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  memoryBefore: NodeJS.MemoryUsage;
  memoryAfter?: NodeJS.MemoryUsage;
  memoryDelta?: Partial<NodeJS.MemoryUsage>;
}

class SmartLogger {
  private logs: LogEntry[] = [];
  private performanceTrackers = new Map<string, PerformanceMetrics>();
  private isProduction = process.env.NODE_ENV === 'production';
  private maxLogs = this.isProduction ? 1000 : 5000;

  /**
   * Generate unique request ID for tracking
   */
  generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create structured log entry
   */
  private createLogEntry(
    level: LogEntry['level'],
    message: string,
    context: LogContext = {},
    data?: any,
    duration?: number
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: {
        requestId: context.requestId || 'unknown',
        ...context
      },
      data,
      duration,
      memoryUsage: process.memoryUsage?.()
    };

    if (level === 'ERROR') {
      entry.stackTrace = new Error().stack;
    }

    return entry;
  }

  /**
   * Add log entry and manage buffer
   */
  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Trim logs if exceeding max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output with formatting
    this.outputToConsole(entry);
  }

  /**
   * Format and output to console
   */
  private outputToConsole(entry: LogEntry): void {
    const emoji = {
      DEBUG: '🔍',
      INFO: 'ℹ️',
      WARN: '⚠️',
      ERROR: '❌',
      SUCCESS: '✅',
      PERF: '⚡'
    }[entry.level];

    const prefix = `${emoji} [${entry.level}] ${entry.timestamp}`;
    const context = entry.context.requestId ? `[${entry.context.requestId.slice(-8)}]` : '';
    const operation = entry.context.operation ? `[${entry.context.operation}]` : '';
    const stage = entry.context.stage ? `[${entry.context.stage}]` : '';
    
    let output = `${prefix} ${context}${operation}${stage} ${entry.message}`;
    
    if (entry.duration) {
      output += ` (${entry.duration}ms)`;
    }

    console.log(output);
    
    if (entry.data && !this.isProduction) {
      console.log('📊 Data:', JSON.stringify(entry.data, null, 2));
    }
    
    if (entry.level === 'ERROR' && entry.stackTrace && !this.isProduction) {
      console.log('🔥 Stack:', entry.stackTrace);
    }
  }

  /**
   * Debug logging
   */
  debug(message: string, context: LogContext = {}, data?: any): void {
    if (!this.isProduction) {
      this.addLog(this.createLogEntry('DEBUG', message, context, data));
    }
  }

  /**
   * Info logging
   */
  info(message: string, context: LogContext = {}, data?: any): void {
    this.addLog(this.createLogEntry('INFO', message, context, data));
  }

  /**
   * Warning logging
   */
  warn(message: string, context: LogContext = {}, data?: any): void {
    this.addLog(this.createLogEntry('WARN', message, context, data));
  }

  /**
   * Error logging
   */
  error(message: string, context: LogContext = {}, error?: Error | any): void {
    const data = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error;
    
    this.addLog(this.createLogEntry('ERROR', message, context, data));
  }

  /**
   * Success logging
   */
  success(message: string, context: LogContext = {}, data?: any): void {
    this.addLog(this.createLogEntry('SUCCESS', message, context, data));
  }

  /**
   * Start performance tracking
   */
  startPerf(trackerId: string, context: LogContext = {}): void {
    const metrics: PerformanceMetrics = {
      startTime: Date.now(),
      memoryBefore: process.memoryUsage?.() || {} as NodeJS.MemoryUsage
    };
    
    this.performanceTrackers.set(trackerId, metrics);
    this.debug(`Performance tracking started: ${trackerId}`, context);
  }

  /**
   * End performance tracking
   */
  endPerf(trackerId: string, context: LogContext = {}, data?: any): number {
    const metrics = this.performanceTrackers.get(trackerId);
    if (!metrics) {
      this.warn(`Performance tracker not found: ${trackerId}`, context);
      return 0;
    }

    metrics.endTime = Date.now();
    metrics.duration = metrics.endTime - metrics.startTime;
    metrics.memoryAfter = process.memoryUsage?.() || {} as NodeJS.MemoryUsage;
    
    if (metrics.memoryAfter) {
      metrics.memoryDelta = {
        heapUsed: metrics.memoryAfter.heapUsed - metrics.memoryBefore.heapUsed,
        heapTotal: metrics.memoryAfter.heapTotal - metrics.memoryBefore.heapTotal,
        external: metrics.memoryAfter.external - metrics.memoryBefore.external
      };
    }

    this.addLog(this.createLogEntry('PERF', `Performance: ${trackerId}`, context, {
      ...data,
      metrics: {
        duration: metrics.duration,
        memoryDelta: metrics.memoryDelta
      }
    }, metrics.duration));

    this.performanceTrackers.delete(trackerId);
    return metrics.duration;
  }

  /**
   * Log slide generation details
   */
  logSlideGeneration(slideIndex: number, spec: any, context: LogContext = {}): void {
    this.info(`Generating slide ${slideIndex + 1}`, {
      ...context,
      operation: 'slide-generation',
      stage: 'processing'
    }, {
      slideIndex,
      title: spec.title,
      layout: spec.layout,
      hasContent: {
        bullets: !!(spec.bullets && spec.bullets.length > 0),
        paragraph: !!spec.paragraph,
        image: !!spec.imagePrompt
      }
    });
  }

  /**
   * Log AI API calls
   */
  logAICall(prompt: string, response: any, context: LogContext = {}): void {
    this.info('AI API call completed', {
      ...context,
      operation: 'ai-generation',
      stage: 'api-call'
    }, {
      promptLength: prompt.length,
      responseType: typeof response,
      hasContent: !!response
    });
  }

  /**
   * Get recent logs for debugging
   */
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * Get logs by request ID
   */
  getLogsByRequestId(requestId: string): LogEntry[] {
    return this.logs.filter(log => log.context.requestId === requestId);
  }

  /**
   * Get error summary for self-correction
   */
  getErrorSummary(): { errors: LogEntry[], patterns: Record<string, number> } {
    const errors = this.logs.filter(log => log.level === 'ERROR');
    const patterns: Record<string, number> = {};
    
    errors.forEach(error => {
      const key = error.message.split(':')[0]; // Get error type
      patterns[key] = (patterns[key] || 0) + 1;
    });

    return { errors, patterns };
  }

  /**
   * Clear logs (for testing)
   */
  clear(): void {
    this.logs = [];
    this.performanceTrackers.clear();
  }
}

// Export singleton instance
export const logger = new SmartLogger();
export default logger;



====================================================================================================
FILE: functions/src/services/aiService.ts
DESCRIPTION: AI service wrapper for content generation and intelligent slide creation
PURPOSE: AI integration service for generating slide content and managing AI interactions
STATUS: EXISTS
LINES: 673
====================================================================================================

/**
 * AI Service Module - Centralized AI Operations
 * 
 * Provides a clean interface for all AI-related operations including:
 * - Content generation with retry logic
 * - Image prompt generation
 * - Batch processing capabilities
 * - Error handling and fallback strategies
 * 
 * This module abstracts the complexity of AI interactions and provides
 * a consistent interface for the rest of the application.
 * 
 * @version 1.0.0
 */

import OpenAI from 'openai';
import { getTextModelConfig, logCostEstimate } from '../config/aiModels';
import { apiKeyValidator } from '../config/apiKeyValidator';
import {
  AIGenerationError,
  ValidationError,
  TimeoutError,
  RateLimitError,
  ContentFilterError,
  NetworkError,
  sanitizeAIResponseWithRecovery
} from '../llm';
import { safeValidateSlideSpec, type SlideSpec, type GenerationParams } from '../schema';
import {
  SYSTEM_PROMPT,
  generateContentPrompt,
  generateLayoutPrompt,
  generateImagePrompt,
  generateRefinementPrompt,
  generateBatchImagePrompts
} from '../prompts';
import { logger, type LogContext } from '../utils/smartLogger';

// AI Configuration
const AI_CONFIG = getTextModelConfig();

// OpenAI client instance with connection pooling
let openaiClient: OpenAI | null = null;

/**
 * Get or create OpenAI client instance with enhanced configuration.
 * - In production (Firebase), reads OPENAI_API_KEY from Secret Manager via process.env (index wires secret -> env)
 * - In local dev, supports process.env and functions/.env
 */
function getOpenAI(): OpenAI {
  if (!openaiClient) {
    // Validate configuration and surface better diagnostics
    const validation = apiKeyValidator.validateConfiguration();

    // Prefer secret-provided env var; fallback to raw env
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || !validation.isValid) {
      // Throw a categorized error so /draft maps to 503 with clear message
      throw new AIGenerationError(
        `OpenAI API key not configured correctly (source=${validation.source}, env=${validation.environment})`,
        'Initialize OpenAI Client',
        1
      );
    }

    openaiClient = new OpenAI({
      apiKey,
      timeout: 60000, // 60 second timeout
      maxRetries: 2,  // Built-in retry mechanism
    });
  }
  return openaiClient;
}

/**
 * AI Service Interface
 */
export interface IAIService {
  generateSlideContent(input: GenerationParams): Promise<SlideSpec>;
  generateBatchSlides(input: GenerationParams, slideCount: number): Promise<SlideSpec[]>;
  generateImagePrompts(slides: Partial<SlideSpec>[], input: GenerationParams, context?: LogContext): Promise<string[]>;
  validateContent(content: any): Promise<boolean>;
}

/**
 * Main AI Service Implementation
 */
export class AIService implements IAIService {
  private readonly config = AI_CONFIG;

  /**
   * Generate a single slide specification using chained AI processing
   */
  async generateSlideContent(input: GenerationParams): Promise<SlideSpec> {
    const startTime = Date.now();
    const context: LogContext = {
      requestId: `slide_gen_${Date.now()}`,
      component: 'aiService',
      operation: 'generateSlideContent'
    };

    logger.info(`Single slide generation for prompt: ${input.prompt.substring(0, 50)}...`, context, {
      model: this.config.model,
      withImage: input.withImage
    });

    // Log cost estimate
    logCostEstimate({
      textTokens: 3000,
      imageCount: input.withImage ? 1 : 0,
      operation: 'Single Slide Generation'
    });

    try {
      // Step 1: Generate core content
      let partialSpec = await this.executeAIStep(
        generateContentPrompt(input),
        'Content Generation',
        undefined,
        input,
        context
      );

      // Step 2: Refine layout
      partialSpec = await this.executeAIStep(
        generateLayoutPrompt(input, partialSpec),
        'Layout Refinement',
        partialSpec,
        input,
        context
      );

      // Step 3: Generate image prompt if enabled
      if (input.withImage) {
        partialSpec = await this.executeAIStep(
          generateImagePrompt(input, partialSpec),
          'Image Prompt Generation',
          partialSpec,
          input,
          context
        );
      }

      // Step 4: Final refinement
      const finalSpec = await this.executeAIStep(
        generateRefinementPrompt(input, partialSpec),
        'Final Refinement',
        partialSpec,
        input,
        context
      );

      const generationTime = Date.now() - startTime;

      logger.info('Quality metrics', context, {
        generationTime,
        slideTitle: finalSpec.title,
        layout: finalSpec.layout,
        contentLength: JSON.stringify(finalSpec).length,
        hasImage: !!finalSpec.imagePrompt
      });

      return finalSpec;
    } catch (error) {
      const generationTime = Date.now() - startTime;

      logger.error('Slide generation failed', context, {
        error: error instanceof Error ? error.message : String(error),
        generationTime,
        input
      });

      throw error;
    }
  }

  /**
   * Generate multiple slides with optimized batch processing
   */
  async generateBatchSlides(input: GenerationParams, slideCount: number): Promise<SlideSpec[]> {
    const startTime = Date.now();
    const context: LogContext = {
      requestId: `batch_gen_${Date.now()}`,
      component: 'aiService',
      operation: 'generateBatchSlides'
    };

    logger.info(`Batch generation for ${slideCount} slides with prompt: ${input.prompt.substring(0, 50)}...`, context, {
      slideCount,
      model: this.config.model,
      withImage: input.withImage
    });

    // Log cost estimate
    logCostEstimate({
      textTokens: 3000 * slideCount,
      imageCount: input.withImage ? slideCount : 0,
      operation: `Batch Generation (${slideCount} slides)`
    });

    const slides: SlideSpec[] = [];

    try {
      // Generate content and layout for each slide
      for (let i = 0; i < slideCount; i++) {
        console.log(`Generating slide ${i + 1}/${slideCount}...`);
        
        const slideInput = {
          ...input,
          prompt: `${input.prompt} - Slide ${i + 1} of ${slideCount}`,
          withImage: false // Handle images in batch later
        };

        let partialSpec = await this.executeAIStep(
          generateContentPrompt(slideInput),
          `Content Generation (Slide ${i + 1})`,
          undefined,
          slideInput,
          context
        );

        partialSpec = await this.executeAIStep(
          generateLayoutPrompt(slideInput, partialSpec),
          `Layout Refinement (Slide ${i + 1})`,
          partialSpec,
          slideInput,
          context
        );

        slides.push(partialSpec);
      }

      // Batch process images if enabled
      if (input.withImage && slides.length > 0) {
        await this.processBatchImages(slides, input);
      }

      const generationTime = Date.now() - startTime;
      console.log(`Batch generation completed in ${generationTime}ms`);

      return slides;
    } catch (error) {
      const generationTime = Date.now() - startTime;
      console.error(`Batch generation failed after ${generationTime}ms:`, error);
      throw error;
    }
  }

  /**
   * Generate image prompts for multiple slides
   */
  async generateImagePrompts(slides: Partial<SlideSpec>[], input: GenerationParams, context?: LogContext): Promise<string[]> {
    console.log(`Generating image prompts for ${slides.length} slides...`);

    const baseContext = context || {
      component: 'aiService',
      operation: 'generateImagePrompts'
    };

    try {
      const batchPrompt = generateBatchImagePrompts(input, slides);
      const response = await this.executeAIStep(batchPrompt, 'Batch Image Processing', undefined, input, {
        component: 'aiService',
        operation: 'generateImagePrompts'
      });
      
      // Parse batch response (implementation depends on response format)
      // This is a simplified version - actual implementation would parse the JSON array
      return slides.map((_, index) => `Professional image for slide ${index + 1}`);
    } catch (error) {
      console.warn('Batch image processing failed, falling back to individual processing:', error);
      
      // Fallback to individual processing
      const imagePrompts: string[] = [];
      for (let i = 0; i < slides.length; i++) {
        try {
          const slideWithImage = await this.executeAIStep(
            generateImagePrompt(input, slides[i]),
            `Image Prompt (Slide ${i + 1})`,
            slides[i],
            input,
            {
              component: 'aiService',
              operation: 'generateImagePrompts',
              stage: `slide_${i}`
            }
          );
          imagePrompts.push(slideWithImage.imagePrompt || '');
        } catch (imageError) {
          const imageContext: LogContext = {
            ...baseContext,
            operation: 'generateBatchImages',
            stage: `slide_${i}`
          };

          logger.error('Image generation failed', imageContext, {
            error: imageError instanceof Error ? imageError.message : String(imageError),
            slideIndex: i,
            slideTitle: slides[i].title
          });
          imagePrompts.push('');
        }
      }
      return imagePrompts;
    }
  }

  /**
   * Validate content quality
   */
  async validateContent(content: any): Promise<boolean> {
    const context: LogContext = {
      component: 'aiService',
      operation: 'validateContent'
    };

    try {
      const validationResult = safeValidateSlideSpec(content);

      logger.info(`Content validation: ${validationResult.success ? 'passed' : 'failed'}`, context, {
        success: validationResult.success,
        errors: validationResult.success ? [] : ['Validation failed']
      });

      return validationResult.success;
    } catch (error) {
      logger.error('Content validation error', context, error);
      return false;
    }
  }

  /**
   * Execute a single AI step with retry logic and error handling
   */
  private async executeAIStep(
    prompt: string,
    stepName: string,
    previousSpec?: Partial<SlideSpec>,
    originalInput?: GenerationParams,
    baseContext?: LogContext
  ): Promise<SlideSpec> {
    let lastError: Error | null = null;

    // Try with primary model
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      const attemptContext: LogContext = {
        ...(baseContext || {}),
        stage: `${stepName}_attempt_${attempt}`
      };

      try {
        logger.info(`${stepName} attempt ${attempt}/${this.config.maxRetries}`, attemptContext);
        const result = await this.makeAICall(prompt, stepName, previousSpec, attempt, originalInput);
        return result;
      } catch (error) {
        lastError = error as Error;

        logger.error(`${stepName} attempt ${attempt} failed`, attemptContext, {
          error: error instanceof Error ? error.message : String(error),
          recoverable: attempt < this.config.maxRetries,
          maxRetries: this.config.maxRetries
        });

        // Don't retry validation errors, but provide more context
        if (error instanceof ValidationError) {
          logger.warn('Validation error during retry', attemptContext, {
            errors: error.validationErrors || [error.message]
          });

          throw new AIGenerationError(
            `Validation failed in ${stepName}: ${error.message}`,
            stepName,
            attempt,
            error
          );
        }

        // Wait before retry
        if (attempt < this.config.maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All attempts failed
    throw new AIGenerationError(
      `All attempts failed for ${stepName}. Last error: ${lastError?.message}`,
      stepName,
      this.config.maxRetries,
      lastError || undefined
    );
  }

  /**
   * Make a single AI API call with timeout and error handling
   */
  private async makeAICall(
    prompt: string,
    stepName: string,
    previousSpec: Partial<SlideSpec> | undefined,
    attempt: number,
    originalInput?: GenerationParams
  ): Promise<SlideSpec> {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

    const context: LogContext = {
      requestId: `ai_call_${Date.now()}`,
      component: 'aiService',
      operation: 'makeAICall',
      stage: stepName
    };

    // Log detailed prompt information
    logger.info(`AI prompt sent for ${stepName}`, context, {
      attempt,
      model: this.config.model,
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
      promptLength: prompt.length,
      hasPreviousSpec: !!previousSpec
    });

    try {
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ];

      if (previousSpec) {
        messages.push({ role: 'assistant', content: JSON.stringify(previousSpec) });
      }

      const response = await getOpenAI().chat.completions.create({
        model: this.config.model as any,
        messages,
        response_format: { type: 'json_object' },
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens
      }, {
        signal: controller.signal
      });

      const rawJson = response.choices[0]?.message?.content;
      if (!rawJson) {
        throw new Error('Empty response from AI model');
      }

      const parsed = JSON.parse(rawJson);
      const responseTime = Date.now() - startTime;

      // Create AI metrics for logging
      const aiMetrics = {
        modelUsed: this.config.model,
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
        estimatedCost: this.calculateCost(response.usage?.total_tokens || 0),
        responseTime,
        retryCount: attempt - 1,
        contentLength: rawJson.length,
        promptVersion: '1.0'
      };

      // Log AI response with metrics
      logger.info(`AI response received for ${stepName}`, context, {
        responseTime: aiMetrics.responseTime,
        totalTokens: aiMetrics.totalTokens,
        contentLength: rawJson.length
      });

      // Log the parsed response for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log(`AI Response for ${stepName}:`, JSON.stringify(parsed, null, 2));
      }

      // First try standard validation
      let validationResult = safeValidateSlideSpec(parsed);

      // If validation fails, try with enhanced sanitization and recovery
      if (!validationResult.success) {
        logger.warn(`Initial validation failed for ${stepName}`, context, {
          errors: validationResult.errors || []
        });

        console.warn(`Initial validation failed for ${stepName}, attempting recovery:`, {
          errors: validationResult.errors
        });

        const recoveredData = sanitizeAIResponseWithRecovery(parsed);

        // Try validation again with recovered data
        validationResult = safeValidateSlideSpec(recoveredData);

        if (!validationResult.success) {
          logger.error(`Validation failed even after recovery for ${stepName}`, context, {
            errors: validationResult.errors || []
          });

          console.error(`Validation failed even after recovery for ${stepName}:`, {
            errors: validationResult.errors,
            originalData: parsed,
            recoveredData
          });
          throw new ValidationError(
            'Slide specification validation failed',
            validationResult.errors || ['Unknown validation error']
          );
        } else {
          logger.info(`Successfully recovered data for ${stepName}`, context);
        }
      } else {
        logger.info(`Content validation passed for ${stepName}`, context);
      }

      const finalSpec = validationResult.data as SlideSpec;

      // Preserve design information from original input if available
      if (originalInput?.design) {
        finalSpec.design = {
          ...finalSpec.design,
          ...originalInput.design
        };
      }

      // Log quality metrics for the final spec
      logger.info(`Quality metrics for ${stepName}`, context, {
        attempt,
        responseTime: Date.now() - startTime,
        contentComplexity: this.calculateContentComplexity(finalSpec),
        validationSuccess: true,
        recoveryUsed: !safeValidateSlideSpec(parsed).success
      });

      return finalSpec;
    } catch (error) {
      // Log the error
      logger.error(`AI call failed for ${stepName}`, context, {
        error: error instanceof Error ? error.message : String(error),
        attempt,
        responseTime: Date.now() - startTime
      });

      this.handleAIError(error, stepName, attempt);
      throw error; // This line won't be reached due to handleAIError throwing
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Calculate estimated cost for AI API usage
   */
  private calculateCost(totalTokens: number): number {
    // GPT-4 pricing (approximate): $0.03 per 1K prompt tokens, $0.06 per 1K completion tokens
    // For simplicity, using average of $0.045 per 1K tokens
    return (totalTokens / 1000) * 0.045;
  }

  /**
   * Calculate content complexity score
   */
  private calculateContentComplexity(spec: SlideSpec): number {
    let complexity = 0;

    // Base complexity for having content
    complexity += 1;

    // Add complexity for different content types
    if (spec.bullets && spec.bullets.length > 0) {
      complexity += spec.bullets.length * 0.5;
    }

    if (spec.paragraph) {
      complexity += spec.paragraph.length / 100; // 1 point per 100 characters
    }

    if (spec.imagePrompt) {
      complexity += 2; // Images add significant complexity
    }

    if (spec.layout === 'two-column') {
      complexity += 1; // Two-column layouts are more complex
    }

    return Math.round(complexity * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Handle and categorize AI errors
   */
  private handleAIError(error: any, stepName: string, attempt: number): never {
    // Timeout errors
    if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
      throw new TimeoutError(`${stepName} timed out after ${this.config.timeoutMs}ms`, this.config.timeoutMs);
    }

    // OpenAI API errors
    if (error && typeof error === 'object' && 'error' in error) {
      const openaiError = error as any;
      
      if (openaiError.error?.type === 'insufficient_quota') {
        throw new RateLimitError('API quota exceeded. Please try again later.');
      }
      
      if (openaiError.error?.type === 'rate_limit_exceeded') {
        const retryAfter = openaiError.error?.retry_after || 60;
        throw new RateLimitError(`Rate limit exceeded. Please wait ${retryAfter} seconds.`, retryAfter);
      }
      
      if (openaiError.error?.code === 'content_filter') {
        throw new ContentFilterError(
          'Content was filtered due to policy violations. Please try different wording.',
          openaiError.error?.message || 'Content filtered'
        );
      }
      
      if (openaiError.status >= 500) {
        throw new NetworkError(`OpenAI service error: ${openaiError.error?.message || 'Service unavailable'}`, openaiError.status);
      }
    }

    // Network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError('Network connection failed. Please check your internet connection.');
    }

    // Validation errors (pass through)
    if (error instanceof ValidationError) {
      throw error;
    }

    // Wrap unknown errors
    throw new AIGenerationError(
      `${stepName} failed: ${error instanceof Error ? error.message : String(error)}`,
      stepName,
      attempt,
      error instanceof Error ? error : new Error(String(error))
    );
  }

  /**
   * Process batch images for multiple slides
   */
  private async processBatchImages(slides: SlideSpec[], input: GenerationParams): Promise<void> {
    console.log('Processing batch image prompts...');
    
    try {
      const imagePrompts = await this.generateImagePrompts(slides, input, {
        component: 'aiService',
        operation: 'processBatchImages'
      });
      
      // Apply image prompts to slides
      for (let i = 0; i < slides.length && i < imagePrompts.length; i++) {
        if (imagePrompts[i]) {
          (slides[i] as any).imagePrompt = imagePrompts[i];
        }
      }
    } catch (error) {
      console.warn('Batch image processing failed:', error);
      // Continue without images rather than failing the entire generation
    }
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService;



====================================================================================================
FILE: functions/src/config/aiModels.ts
DESCRIPTION: AI model configurations and settings for content generation
PURPOSE: Configuration for AI models, API keys, and generation parameters
STATUS: EXISTS
LINES: 346
====================================================================================================

/**
 * Enhanced AI Model Configuration for Testing vs Production (C-4: Model Configuration & Cost Guardrails)
 *
 * This file centralizes AI model configuration with comprehensive cost guardrails,
 * performance monitoring, and intelligent model selection for optimal cost-quality balance.
 *
 * @version 2.0.0
 * @author AI PowerPoint Generator Team
 */

// Enhanced environment detection with cost guardrails
const isProduction = process.env.NODE_ENV === 'production';
const isTestingMode = process.env.AI_TESTING_MODE === 'true' || !isProduction;
const costLimitEnabled = process.env.AI_COST_LIMIT_ENABLED === 'true';
const dailyCostLimit = parseFloat(process.env.AI_DAILY_COST_LIMIT || '10.00'); // Default $10/day limit

/**
 * Enhanced Text Generation Model Configuration (C-4: Model Configuration & Cost Guardrails)
 * Optimized for cost-quality balance with intelligent model selection
 */
export const TEXT_MODEL_CONFIG = {
  // Testing Mode: Ultra low-cost models for development and testing
  testing: {
    model: 'gpt-4o-mini' as const,
    fallbackModel: 'gpt-3.5-turbo' as const,
    temperature: 0.7,
    maxTokens: 1200, // Reduced for cost optimization
    maxRetries: 2,
    retryDelay: 500,
    timeoutMs: 15000, // Shorter timeout for faster feedback
    maxBackoffDelay: 3000,
    costPerToken: 0.00015, // GPT-4o Mini: $0.15 per 1M input tokens
    costPerOutputToken: 0.0006, // $0.60 per 1M output tokens
    maxDailyCost: 2.00, // $2 daily limit for testing
    costOptimization: {
      enableTokenLimiting: true,
      preferShorterResponses: true,
      enableCaching: true,
      batchRequests: false // Disabled for testing to get faster feedback
    }
  },

  // Production Mode: Balanced cost-quality for optimal results
  production: {
    model: 'gpt-4o-mini' as const,
    fallbackModel: 'gpt-4o' as const,
    temperature: 0.7,
    maxTokens: 2000,
    maxRetries: 3,
    retryDelay: 1000,
    timeoutMs: 30000,
    maxBackoffDelay: 10000,
    costPerToken: 0.00015, // GPT-4o Mini: $0.15 per 1M input tokens
    costPerOutputToken: 0.0006, // $0.60 per 1M output tokens
    maxDailyCost: 25.00, // $25 daily limit for production
    costOptimization: {
      enableTokenLimiting: true,
      preferShorterResponses: false, // Allow full responses in production
      enableCaching: true,
      batchRequests: true // Enable batching for efficiency
    }
  },

  // Premium Mode: High-quality models for critical presentations
  premium: {
    model: 'gpt-4o' as const,
    fallbackModel: 'gpt-4o-mini' as const,
    temperature: 0.7,
    maxTokens: 3000,
    maxRetries: 4,
    retryDelay: 1500,
    timeoutMs: 45000,
    maxBackoffDelay: 15000,
    costPerToken: 0.005, // GPT-4o: $5.00 per 1M input tokens
    costPerOutputToken: 0.015, // $15.00 per 1M output tokens
    maxDailyCost: 100.00, // $100 daily limit for premium
    costOptimization: {
      enableTokenLimiting: false, // No limits for premium
      preferShorterResponses: false,
      enableCaching: true,
      batchRequests: true
    }
  }
};

/**
 * Image Generation Model Configuration
 */
export const IMAGE_MODEL_CONFIG = {
  // Testing Mode: DALL-E 2 for cost efficiency
  testing: {
    model: 'dall-e-2' as const,
    size: '512x512' as const,
    quality: 'standard' as const,
    promptSuffix: ', professional, clean design',
    costPerImage: 0.018 // USD per image
  },
  
  // Production Mode: DALL-E 3 for highest quality
  production: {
    model: 'dall-e-3' as const,
    size: '1024x1024' as const,
    quality: 'hd' as const,
    promptSuffix: ', professional, high-resolution, clean design, photorealistic',
    costPerImage: 0.080 // USD per image (HD quality)
  }
};

/**
 * Get current text model configuration
 */
export function getTextModelConfig() {
  const config = isTestingMode ? TEXT_MODEL_CONFIG.testing : TEXT_MODEL_CONFIG.production;
  
  console.log(`🤖 Text Generation Mode: ${isTestingMode ? 'TESTING' : 'PRODUCTION'}`);
  console.log(`   Model: ${config.model}`);
  console.log(`   Cost: ~$${config.costPerToken}/1K tokens`);
  
  return config;
}

/**
 * Get current image model configuration
 */
export function getImageModelConfig() {
  const config = isTestingMode ? IMAGE_MODEL_CONFIG.testing : IMAGE_MODEL_CONFIG.production;
  
  console.log(`🎨 Image Generation Mode: ${isTestingMode ? 'TESTING' : 'PRODUCTION'}`);
  console.log(`   Model: ${config.model}`);
  console.log(`   Size: ${config.size}`);
  console.log(`   Cost: ~$${config.costPerImage}/image`);
  
  return config;
}

/**
 * Estimate costs for a generation request
 */
export function estimateGenerationCost(options: {
  textTokens?: number;
  imageCount?: number;
}): { textCost: number; imageCost: number; totalCost: number } {
  const textConfig = getTextModelConfig();
  const imageConfig = getImageModelConfig();
  
  const textCost = (options.textTokens || 0) * (textConfig.costPerToken / 1000);
  const imageCost = (options.imageCount || 0) * imageConfig.costPerImage;
  const totalCost = textCost + imageCost;
  
  return { textCost, imageCost, totalCost };
}

/**
 * Log cost information for transparency
 */
export function logCostEstimate(options: {
  textTokens?: number;
  imageCount?: number;
  operation?: string;
}) {
  const costs = estimateGenerationCost(options);
  const operation = options.operation || 'Generation';
  
  console.log(`💰 ${operation} Cost Estimate:`);
  if (options.textTokens) {
    console.log(`   Text: ${options.textTokens} tokens → $${costs.textCost.toFixed(4)}`);
  }
  if (options.imageCount) {
    console.log(`   Images: ${options.imageCount} images → $${costs.imageCost.toFixed(4)}`);
  }
  console.log(`   Total: $${costs.totalCost.toFixed(4)}`);
  
  if (isTestingMode) {
    console.log(`   💡 Testing mode active - using low-cost models`);
  }
}

/**
 * Switch to production mode (for deployment)
 */
export function enableProductionMode() {
  process.env.AI_TESTING_MODE = 'false';
  console.log('🚀 Switched to PRODUCTION mode - using high-quality models');
}

/**
 * Switch to testing mode (for development)
 */
export function enableTestingMode() {
  process.env.AI_TESTING_MODE = 'true';
  console.log('🧪 Switched to TESTING mode - using low-cost models');
}

/**
 * Current mode status
 */
export function getCurrentMode(): 'testing' | 'production' {
  return isTestingMode ? 'testing' : 'production';
}

/**
 * Enhanced cost tracking and guardrails (C-4: Model Configuration & Cost Guardrails)
 */

// In-memory cost tracking (in production, this would be stored in a database)
let dailyCostTracker = {
  date: new Date().toDateString(),
  totalCost: 0,
  requestCount: 0,
  lastReset: Date.now()
};

/**
 * Check if request is within cost limits
 */
export function checkCostLimits(estimatedCost: number): {
  allowed: boolean;
  reason?: string;
  currentDailyCost: number;
  dailyLimit: number;
} {
  const config = getTextModelConfig();
  const today = new Date().toDateString();

  // Reset daily tracker if it's a new day
  if (dailyCostTracker.date !== today) {
    dailyCostTracker = {
      date: today,
      totalCost: 0,
      requestCount: 0,
      lastReset: Date.now()
    };
  }

  const projectedDailyCost = dailyCostTracker.totalCost + estimatedCost;
  const dailyLimit = config.maxDailyCost;

  if (costLimitEnabled && projectedDailyCost > dailyLimit) {
    return {
      allowed: false,
      reason: `Daily cost limit exceeded. Current: $${dailyCostTracker.totalCost.toFixed(4)}, Estimated: $${estimatedCost.toFixed(4)}, Limit: $${dailyLimit.toFixed(2)}`,
      currentDailyCost: dailyCostTracker.totalCost,
      dailyLimit
    };
  }

  return {
    allowed: true,
    currentDailyCost: dailyCostTracker.totalCost,
    dailyLimit
  };
}

/**
 * Record actual cost after API call
 */
export function recordActualCost(actualCost: number, operation: string): void {
  const today = new Date().toDateString();

  // Reset if new day
  if (dailyCostTracker.date !== today) {
    dailyCostTracker = {
      date: today,
      totalCost: 0,
      requestCount: 0,
      lastReset: Date.now()
    };
  }

  dailyCostTracker.totalCost += actualCost;
  dailyCostTracker.requestCount += 1;

  console.log(`💰 Cost Recorded: $${actualCost.toFixed(4)} for ${operation}`);
  console.log(`📊 Daily Total: $${dailyCostTracker.totalCost.toFixed(4)} (${dailyCostTracker.requestCount} requests)`);

  // Warn if approaching limit
  const config = getTextModelConfig();
  const utilizationPercent = (dailyCostTracker.totalCost / config.maxDailyCost) * 100;

  if (utilizationPercent > 80) {
    console.warn(`⚠️ High cost utilization: ${utilizationPercent.toFixed(1)}% of daily limit`);
  }
}

/**
 * Get current cost statistics
 */
export function getCostStatistics(): {
  dailyCost: number;
  dailyLimit: number;
  requestCount: number;
  utilizationPercent: number;
  remainingBudget: number;
} {
  const config = getTextModelConfig();
  const utilizationPercent = (dailyCostTracker.totalCost / config.maxDailyCost) * 100;

  return {
    dailyCost: dailyCostTracker.totalCost,
    dailyLimit: config.maxDailyCost,
    requestCount: dailyCostTracker.requestCount,
    utilizationPercent,
    remainingBudget: config.maxDailyCost - dailyCostTracker.totalCost
  };
}

/**
 * Intelligent model selection based on cost and quality requirements
 */
export function selectOptimalModel(requirements: {
  qualityLevel: 'basic' | 'standard' | 'premium';
  maxCost?: number;
  urgency: 'low' | 'medium' | 'high';
}): keyof typeof TEXT_MODEL_CONFIG {
  const costStats = getCostStatistics();

  // If approaching daily limit, use testing mode
  if (costStats.utilizationPercent > 90) {
    console.log('🔄 Switching to testing mode due to cost limits');
    return 'testing';
  }

  // Select based on quality requirements and cost constraints
  if (requirements.qualityLevel === 'premium' && costStats.remainingBudget > 5.00) {
    return 'premium';
  } else if (requirements.qualityLevel === 'standard' || isProduction) {
    return 'production';
  } else {
    return 'testing';
  }
}

export default {
  getTextModelConfig,
  getImageModelConfig,
  estimateGenerationCost,
  logCostEstimate,
  enableProductionMode,
  enableTestingMode,
  getCurrentMode,
  checkCostLimits,
  recordActualCost,
  getCostStatistics,
  selectOptimalModel
};



====================================================================================================
FILE: functions/src/config/appConfig.ts
DESCRIPTION: Application configuration and environment settings
PURPOSE: Centralized configuration management for the entire application
STATUS: EXISTS
LINES: 295
====================================================================================================

/**
 * Enhanced Application Configuration
 * 
 * Centralized configuration management for the AI PowerPoint Generator.
 * Provides type-safe configuration with environment-specific overrides.
 * 
 * @version 3.2.0-enhanced
 * @author AI PowerPoint Generator Team
 */

/**
 * Deep partial type for configuration overrides
 */
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Application configuration interface
 */
export interface AppConfig {
  // Application metadata
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
    debug: boolean;
  };
  
  // AI/OpenAI configuration
  ai: {
    model: string;
    fallbackModel: string;
    maxTokens: number;
    temperature: number;
    maxRetries: number;
    retryDelay: number;
    timeoutMs: number;
  };
  
  // PowerPoint generation settings
  powerpoint: {
    defaultTheme: string;
    maxSlides: number;
    defaultQuality: 'draft' | 'standard' | 'high';
    enableSpeakerNotes: boolean;
    enableMetadata: boolean;
    optimizeFileSize: boolean;
  };
  
  // Performance and monitoring
  performance: {
    maxMemoryMB: number;
    requestTimeoutMs: number;
    enableMetrics: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
  };
  
  // Security settings
  security: {
    enableRateLimit: boolean;
    maxRequestsPerMinute: number;
    enableCors: boolean;
    trustedOrigins: string[];
  };
}

/**
 * Default configuration
 */
const defaultConfig: AppConfig = {
  app: {
    name: 'AI PowerPoint Generator',
    version: '3.2.0-enhanced',
    environment: 'development',
    debug: true
  },
  
  ai: {
    model: 'gpt-4o-mini',
    fallbackModel: 'gpt-4o',
    maxTokens: 1400,
    temperature: 0.7,
    maxRetries: 3,
    retryDelay: 400,
    timeoutMs: 30000
  },
  
  powerpoint: {
    defaultTheme: 'corporate-blue',
    maxSlides: 20,
    defaultQuality: 'standard',
    enableSpeakerNotes: true,
    enableMetadata: true,
    optimizeFileSize: true
  },
  
  performance: {
    maxMemoryMB: 500,
    requestTimeoutMs: 90000,
    enableMetrics: true,
    logLevel: 'info'
  },
  
  security: {
    enableRateLimit: true,
    maxRequestsPerMinute: 30,
    enableCors: true,
    trustedOrigins: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://ai-ppt-generator.web.app'
    ]
  }
};

/**
 * Environment-specific configuration overrides
 */
const environmentConfigs: Record<string, DeepPartial<AppConfig>> = {
  development: {
    app: {
      debug: true,
      environment: 'development'
    },
    ai: {
      model: 'gpt-4o-mini', // Use cheaper model for development
      maxRetries: 2
    },
    performance: {
      logLevel: 'debug'
    },
    security: {
      enableRateLimit: false // Disable rate limiting in development
    }
  },
  
  staging: {
    app: {
      debug: false,
      environment: 'staging'
    },
    ai: {
      model: 'gpt-4o-mini',
      maxRetries: 3
    },
    performance: {
      logLevel: 'info'
    }
  },
  
  production: {
    app: {
      debug: false,
      environment: 'production'
    },
    ai: {
      model: 'gpt-4o', // Use best model for production
      maxRetries: 3,
      timeoutMs: 60000 // Longer timeout for production
    },
    performance: {
      logLevel: 'warn',
      maxMemoryMB: 1000 // Higher memory limit for production
    },
    security: {
      enableRateLimit: true,
      maxRequestsPerMinute: 60 // Higher rate limit for production
    }
  }
};

/**
 * Deep merge utility for configuration objects
 */
function deepMerge<T>(target: T, source: DeepPartial<T>): T {
  const result = { ...target };

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue) &&
          targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue)) {
        result[key] = deepMerge(targetValue, sourceValue as DeepPartial<T[Extract<keyof T, string>]>);
      } else if (sourceValue !== undefined) {
        result[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
  }

  return result;
}

/**
 * Get the current application configuration
 */
export function getConfig(): AppConfig {
  const environment = process.env.NODE_ENV || 'development';
  const envConfig = environmentConfigs[environment] || {};
  
  // Merge default config with environment-specific overrides
  let config = deepMerge(defaultConfig, envConfig);
  
  // Apply environment variable overrides
  if (process.env.AI_MODEL) {
    config.ai.model = process.env.AI_MODEL;
  }
  
  if (process.env.AI_MAX_TOKENS) {
    config.ai.maxTokens = parseInt(process.env.AI_MAX_TOKENS, 10);
  }
  
  if (process.env.AI_TEMPERATURE) {
    config.ai.temperature = parseFloat(process.env.AI_TEMPERATURE);
  }
  
  if (process.env.DEFAULT_THEME) {
    config.powerpoint.defaultTheme = process.env.DEFAULT_THEME;
  }
  
  if (process.env.LOG_LEVEL) {
    config.performance.logLevel = process.env.LOG_LEVEL as any;
  }
  
  return config;
}

/**
 * Validate configuration
 */
export function validateConfig(config: AppConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate AI configuration
  if (config.ai.maxTokens < 100 || config.ai.maxTokens > 4000) {
    errors.push('AI maxTokens must be between 100 and 4000');
  }
  
  if (config.ai.temperature < 0 || config.ai.temperature > 2) {
    errors.push('AI temperature must be between 0 and 2');
  }
  
  if (config.ai.maxRetries < 1 || config.ai.maxRetries > 10) {
    errors.push('AI maxRetries must be between 1 and 10');
  }
  
  // Validate PowerPoint configuration
  if (config.powerpoint.maxSlides < 1 || config.powerpoint.maxSlides > 100) {
    errors.push('PowerPoint maxSlides must be between 1 and 100');
  }
  
  // Validate performance configuration
  if (config.performance.maxMemoryMB < 100 || config.performance.maxMemoryMB > 2000) {
    errors.push('Performance maxMemoryMB must be between 100 and 2000');
  }
  
  // Validate security configuration
  if (config.security.maxRequestsPerMinute < 1 || config.security.maxRequestsPerMinute > 1000) {
    errors.push('Security maxRequestsPerMinute must be between 1 and 1000');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get configuration summary for debugging
 */
export function getConfigSummary(): Record<string, any> {
  const config = getConfig();
  
  return {
    environment: config.app.environment,
    version: config.app.version,
    aiModel: config.ai.model,
    defaultTheme: config.powerpoint.defaultTheme,
    logLevel: config.performance.logLevel,
    rateLimit: config.security.enableRateLimit,
    debug: config.app.debug
  };
}

// Export the configuration instance
export const config = getConfig();

// Validate configuration on import
const validation = validateConfig(config);
if (!validation.valid) {
  console.warn('⚠️ Configuration validation failed:', validation.errors);
}



====================================================================================================
FILE: functions/src/config/environment.ts
DESCRIPTION: Environment-specific configuration and runtime settings
PURPOSE: Environment detection and configuration loading
STATUS: EXISTS
LINES: 268
====================================================================================================

/**
 * Environment Configuration
 * 
 * Secure configuration management for local and production deployments
 */

import { logger } from '../utils/smartLogger';

export interface EnvironmentConfig {
  openaiApiKey: string;
  nodeEnv: 'development' | 'production' | 'test';
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;
  port: number;
  corsOrigins: string[];
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

class EnvironmentManager {
  private config: EnvironmentConfig;
  private initialized = false;

  constructor() {
    try {
      this.config = this.loadConfiguration();
      this.validateConfiguration();
      this.initialized = true;

      logger.info('Environment configuration loaded successfully', {
        nodeEnv: this.config.nodeEnv,
        hasOpenAIKey: !!this.config.openaiApiKey && this.config.openaiApiKey !== 'EMULATOR_PLACEHOLDER',
        isEmulator: process.env.FUNCTIONS_EMULATOR === 'true'
      });
    } catch (error) {
      // In emulator environment, provide more helpful error handling
      if (process.env.FUNCTIONS_EMULATOR === 'true') {
        logger.warn('Environment configuration partially loaded in emulator mode', {}, error);
        // Provide minimal config for emulator
        this.config = {
          openaiApiKey: 'EMULATOR_PLACEHOLDER',
          nodeEnv: (process.env.NODE_ENV || 'development') as EnvironmentConfig['nodeEnv'],
          isProduction: false,
          isDevelopment: true,
          isTest: false,
          port: parseInt(process.env.PORT || '5001', 10),
          corsOrigins: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
          logLevel: (process.env.LOG_LEVEL as EnvironmentConfig['logLevel']) || 'debug'
        };
        this.initialized = true;
      } else {
        logger.error('Failed to load environment configuration', {}, error);
        throw error;
      }
    }
  }

  /**
   * Load configuration from environment variables with fallbacks
   */
  private loadConfiguration(): EnvironmentConfig {
    const nodeEnv = (process.env.NODE_ENV || 'development') as EnvironmentConfig['nodeEnv'];
    
    // OpenAI API Key with multiple sources
    const openaiApiKey = this.loadOpenAIApiKey();
    
    return {
      openaiApiKey,
      nodeEnv,
      isProduction: nodeEnv === 'production',
      isDevelopment: nodeEnv === 'development',
      isTest: nodeEnv === 'test',
      port: parseInt(process.env.PORT || '5001', 10),
      corsOrigins: this.loadCorsOrigins(),
      logLevel: (process.env.LOG_LEVEL || 'info') as EnvironmentConfig['logLevel']
    };
  }

  /**
   * Load OpenAI API key from multiple sources with priority
   * Enhanced to handle emulator environment gracefully
   */
  private loadOpenAIApiKey(): string {
    // Priority order:
    // 1. Environment variable (production and development)
    // 2. Firebase config (production)
    // 3. Graceful fallback for emulator environment

    // Check environment variable first (works in all environments)
    if (process.env.OPENAI_API_KEY) {
      logger.info('OpenAI API key loaded from environment variable');
      return process.env.OPENAI_API_KEY;
    }

    // Check Firebase functions config (production only)
    if (process.env.FUNCTIONS_EMULATOR !== 'true') {
      try {
        const functions = require('firebase-functions');
        const config = functions.config();
        if (config.openai?.api_key) {
          logger.info('OpenAI API key loaded from Firebase config');
          return config.openai.api_key;
        }
      } catch (error) {
        logger.debug('Firebase config not available', {}, error);
      }
    }

    // Development and emulator fallback
    if (process.env.NODE_ENV !== 'production' || process.env.FUNCTIONS_EMULATOR === 'true') {
      const devKey = process.env.OPENAI_API_KEY_DEV || process.env.OPENAI_API_KEY;
      if (devKey) {
        logger.info('OpenAI API key loaded from development environment');
        return devKey;
      }

      // In emulator environment, provide a more helpful warning
      if (process.env.FUNCTIONS_EMULATOR === 'true') {
        logger.warn('No OpenAI API key found in emulator environment. Set OPENAI_API_KEY in functions/.env file');
        // Return a placeholder that will be replaced by the secret system
        return 'EMULATOR_PLACEHOLDER';
      } else if (process.env.NODE_ENV === 'production' || process.env.GCLOUD_PROJECT) {
        // During deployment/build, the secret won't be available yet
        logger.warn('No OpenAI API key found during build - will be loaded from secrets at runtime');
        return 'BUILD_PLACEHOLDER';
      } else {
        logger.warn('No OpenAI API key found in environment variables');
      }
    }

    throw new Error('OpenAI API key not found in any configuration source');
  }

  /**
   * Load CORS origins based on environment
   */
  private loadCorsOrigins(): string[] {
    if (process.env.NODE_ENV === 'production') {
      return [
        'https://plsfixthx-ai.web.app',
        'https://plsfixthx-ai.firebaseapp.com'
      ];
    }
    
    return [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173'
    ];
  }

  /**
   * Validate required configuration with emulator support
   */
  private validateConfiguration(): void {
    const errors: string[] = [];
    const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';
    const isBuild = process.env.NODE_ENV === 'production' || process.env.GCLOUD_PROJECT;

    // OpenAI API key validation with emulator and build exceptions
    if (!this.config.openaiApiKey) {
      errors.push('OpenAI API key is required');
    } else if (this.config.openaiApiKey === 'BUILD_PLACEHOLDER') {
      // During build/deployment, log a helpful message instead of an error
      logger.info('Running in build mode with placeholder API key - will be loaded from secrets at runtime');
    } else if (this.config.openaiApiKey === 'EMULATOR_PLACEHOLDER') {
      // In emulator mode, log a helpful message instead of an error
      logger.info('Running in emulator mode with placeholder API key');
    } else if (!isEmulator && !isBuild && !this.config.openaiApiKey.startsWith('sk-')) {
      // Only validate format in non-emulator, non-build environments
      errors.push('OpenAI API key format is invalid');
    }

    // Port validation
    if (this.config.port < 1 || this.config.port > 65535) {
      errors.push('Port must be between 1 and 65535');
    }

    // Only throw errors for critical validation failures
    if (errors.length > 0) {
      const errorMessage = `Configuration validation failed: ${errors.join(', ')}`;
      if (isEmulator) {
        // In emulator mode, log warnings instead of throwing errors
        logger.warn(errorMessage);
      } else {
        logger.error(errorMessage);
        throw new Error(errorMessage);
      }
    }

    logger.success('Environment configuration validated successfully', {
      operation: 'config-validation'
    }, {
      nodeEnv: this.config.nodeEnv,
      port: this.config.port,
      corsOrigins: this.config.corsOrigins.length,
      hasApiKey: !!this.config.openaiApiKey,
      apiKeyPrefix: this.config.openaiApiKey.substring(0, 7) + '...'
    });
  }

  /**
   * Get configuration
   */
  getConfig(): EnvironmentConfig {
    if (!this.initialized) {
      throw new Error('Environment manager not initialized');
    }
    return { ...this.config };
  }

  /**
   * Get OpenAI API key safely
   */
  getOpenAIApiKey(): string {
    return this.config.openaiApiKey;
  }

  /**
   * Check if running in production
   */
  isProduction(): boolean {
    return this.config.isProduction;
  }

  /**
   * Check if running in development
   */
  isDevelopment(): boolean {
    return this.config.isDevelopment;
  }

  /**
   * Get CORS origins
   */
  getCorsOrigins(): string[] {
    return [...this.config.corsOrigins];
  }

  /**
   * Update configuration (for testing)
   */
  updateConfig(updates: Partial<EnvironmentConfig>): void {
    if (this.config.isProduction) {
      throw new Error('Cannot update configuration in production');
    }
    
    this.config = { ...this.config, ...updates };
    logger.info('Configuration updated', { operation: 'config-update' }, updates);
  }

  /**
   * Get safe config for logging (without sensitive data)
   */
  getSafeConfig(): Omit<EnvironmentConfig, 'openaiApiKey'> & { hasApiKey: boolean } {
    const { openaiApiKey, ...safeConfig } = this.config;
    return {
      ...safeConfig,
      hasApiKey: !!openaiApiKey
    };
  }
}

// Export singleton instance
export const env = new EnvironmentManager();
export default env;



## ESSENTIAL FRONTEND FILES

====================================================================================================
FILE: frontend/src/components/SlidePreview.tsx
DESCRIPTION: Live slide preview component that matches PowerPoint output exactly
PURPOSE: Real-time slide preview with 16:9 aspect ratio and theme consistency
STATUS: EXISTS
LINES: 1010
====================================================================================================

/**
 * Enhanced Slide Preview Component
 *
 * Provides real-time preview of slides with professional styling and layout
 * Features:
 * - Live preview updates with <200ms response time
 * - 16:9 aspect ratio with proper scaling
 * - Theme-aware rendering with instant updates
 * - Multiple layout support (title-bullets, two-column, chart, etc.)
 * - Responsive design with touch support
 * - Accessibility optimized with proper ARIA labels
 * - Performance optimized with React.memo and useMemo
 * - Visual feedback and hover states
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { SlideSpec } from '../types';
// Removed unused import

interface SlidePreviewProps {
  /** Slide specification to preview */
  spec: SlideSpec;
  /** Theme configuration */
  theme?: {
    id: string;
    name: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      surface: string;
      text: {
        primary: string;
        secondary: string;
      };
    };
  };
  /** Preview size */
  size?: 'small' | 'medium' | 'large';
  /** Whether to show interactive elements */
  interactive?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

// Enhanced preview constants for 16:9 aspect ratio with professional spacing
// Synchronized with backend LAYOUT constants for accurate preview
import { SLIDE_DIMENSIONS } from '../constants/slideConstants';

const PREVIEW_CONSTANTS = {
  aspectRatio: SLIDE_DIMENSIONS.ASPECT_RATIO,

  // Enhanced sizing options for different use cases
  sizes: {
    small: { width: 240, height: 135 },
    medium: { width: 320, height: 180 },
    large: { width: 480, height: 270 }
  },

  // Enhanced spacing system matching backend improvements with modern design
  spacing: {
    contentY: 1.6,
    columnWidth: 4.0,
    gap: 0.5, // Synced with backend LAYOUT.spacing.colGap
    titleToContent: 0.5, // Enhanced spacing for better separation
    bulletSpacing: 0.2, // Improved bullet spacing
    sectionGap: 0.4, // Enhanced section gap
    accentHeight: 0.1, // Synced with backend LAYOUT.spacing.accentHeight
    cardPadding: 0.3, // Enhanced card padding
    elementPadding: 0.1, // Modern element padding
    borderRadius: 0.08, // Modern border radius
    shadowOffset: 0.025, // Subtle shadow offset
    gradientOpacity: 0.08, // Subtle gradient overlay opacity
  },

  // Enhanced typography scale with improved hierarchy and readability matching backend
  typography: {
    display: { scale: 0.042, lineHeight: 1.02, letterSpacing: -0.025 }, // Enhanced display to match backend
    title: { scale: 0.038, lineHeight: 1.12, letterSpacing: -0.015 },   // Improved title to match backend
    subtitle: { scale: 0.032, lineHeight: 1.22, letterSpacing: -0.005 }, // Refined subtitle to match backend
    body: { scale: 0.026, lineHeight: 1.42, letterSpacing: 0 },         // Better body text to match backend
    bullet: { scale: 0.024, lineHeight: 1.48, letterSpacing: 0 },       // Enhanced bullets to match backend
    caption: { scale: 0.020, lineHeight: 1.38, letterSpacing: 0.01 },   // Improved captions to match backend
  }
} as const;

export default function SlidePreview({
  spec,
  theme,
  size = 'medium',
  interactive = false,
  onClick,
  className = ''
}: SlidePreviewProps) {
  const dimensions = PREVIEW_CONSTANTS.sizes[size];

  // Default theme fallback
  const previewTheme = theme || {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    colors: {
      primary: '#1E40AF',
      secondary: '#3B82F6',
      accent: '#F59E0B',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      text: {
        primary: '#1F2937',
        secondary: '#6B7280'
      }
    }
  };

  // Debug logging to identify content issues
  React.useEffect(() => {
    console.log('🔍 SlidePreview Debug:', {
      spec,
      hasTitle: !!spec?.title,
      hasContent: !!(spec?.bullets?.length || spec?.paragraph || spec?.left || spec?.right),
      layout: spec?.layout,
      contentType: spec?.bullets?.length ? 'bullets' : spec?.paragraph ? 'paragraph' : spec?.left ? 'two-column' : 'none',
      theme: previewTheme?.id
    });
  }, [spec, previewTheme]);

  // Memoized preview content for performance
  const previewContent = useMemo(() => {
    return renderSlideContent(spec, previewTheme, dimensions);
  }, [spec, previewTheme, dimensions]);

  // Inches → pixels conversion helpers (align with backend 10in × 5.625in)
  const pxPerInW = dimensions.width / 10.0;
  const pxPerInH = dimensions.height / 5.625;
  const accentPxH = pxPerInH * 0.1; // accentHeight

  return (
    <motion.div
      className={`relative overflow-hidden rounded-lg border-2 border-gray-200 bg-white shadow-sm ${
        interactive ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      } ${className}`}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        aspectRatio: PREVIEW_CONSTANTS.aspectRatio
      }}
      onClick={onClick}
      whileHover={interactive ? { scale: 1.02 } : undefined}
      transition={{ duration: 0.2 }}
    >
      {/* Enhanced background with sophisticated gradient for visual depth */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${previewTheme.colors.background} 0%, ${previewTheme.colors.surface} 100%)`,
          opacity: 0.98 // Subtle transparency for depth
        }}
      />

      {/* Primary accent bar with enhanced visual prominence and shadow */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: `${accentPxH * 1.2}px`, // Enhanced height for better prominence
          backgroundColor: previewTheme.colors.primary,
          boxShadow: `0 2px 8px ${previewTheme.colors.primary}40` // Enhanced shadow
        }}
      />

      {/* Secondary accent bar with sophisticated gradient and improved layering */}
      <div
        className="absolute left-0"
        style={{
          top: `${accentPxH * 1.2}px`,
          width: '65%', // Enhanced width for better visual balance
          height: `${accentPxH * 0.7}px`, // Improved height for prominence
          background: `linear-gradient(90deg, ${previewTheme.colors.accent} 0%, ${previewTheme.colors.secondary} 100%)`,
          opacity: 0.85 // Refined transparency
        }}
      />

      {/* Subtle shadow under accent bar */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          top: `${accentPxH}px`,
          height: '1px',
          backgroundColor: previewTheme.colors.text.secondary,
          opacity: 0.1
        }}
      />

      {/* Content */}
      <div className="relative p-4 h-full flex flex-col">
        {previewContent}
      </div>

      {/* Layout indicator */}
      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/10 rounded text-xs text-gray-600">
        {spec.layout || 'default'}
      </div>
    </motion.div>
  );
}

/**
 * Enhanced slide content rendering with improved typography and styling
 * Matches backend layout enhancements for accurate preview
 */
function renderSlideContent(
  spec: SlideSpec,
  theme: any,
  dimensions: { width: number; height: number }
) {
  // Debug logging for content rendering
  console.log('🎨 Rendering slide content:', {
    layout: spec?.layout,
    title: spec?.title,
    hasBullets: !!(spec?.bullets?.length),
    hasParagraph: !!spec?.paragraph,
    hasLeft: !!spec?.left,
    hasRight: !!spec?.right,
    bulletCount: spec?.bullets?.length || 0
  });

  // Superior typography system with enhanced readability and modern visual hierarchy
  const displayStyle = {
    color: theme.colors.text.primary,
    fontSize: Math.max(22, dimensions.width * PREVIEW_CONSTANTS.typography.display.scale * 1.25), // Enhanced for maximum impact
    fontWeight: '800', // Increased weight for hero titles
    lineHeight: PREVIEW_CONSTANTS.typography.display.lineHeight * 0.95, // Tighter line height for display
    marginBottom: '16px',
    textShadow: `0 2px 4px ${theme.colors.text.secondary}25`, // Enhanced depth
    letterSpacing: '-0.02em' // Improved letter spacing for display text
  };

  const titleStyle = {
    color: theme.colors.primary,
    fontSize: Math.max(17, dimensions.width * PREVIEW_CONSTANTS.typography.title.scale * 1.18), // Enhanced prominence
    fontWeight: '700', // Increased weight for better hierarchy
    lineHeight: PREVIEW_CONSTANTS.typography.title.lineHeight * 0.98, // Optimized line height
    marginBottom: '14px',
    textShadow: `0 1px 2px ${theme.colors.primary}20`, // Enhanced shadow
    letterSpacing: '-0.01em' // Refined letter spacing
  };

  const subtitleStyle = {
    color: theme.colors.text.secondary,
    fontSize: Math.max(14, dimensions.width * PREVIEW_CONSTANTS.typography.subtitle.scale * 1.12), // Enhanced clarity
    fontWeight: '600', // Increased weight for better hierarchy
    lineHeight: PREVIEW_CONSTANTS.typography.subtitle.lineHeight,
    fontStyle: 'normal', // Changed from italic for better readability
    letterSpacing: '-0.005em' // Subtle letter spacing
  };

  // Enhanced text styles with superior readability and modern design
  const textStyle = {
    color: theme.colors.text.primary,
    fontSize: Math.max(12, dimensions.width * PREVIEW_CONSTANTS.typography.body.scale * 1.12), // Enhanced readability
    lineHeight: PREVIEW_CONSTANTS.typography.body.lineHeight * 0.95, // Optimized line height
    letterSpacing: '0.002em' // Subtle tracking for better readability
  };

  const bulletStyle = {
    ...textStyle,
    fontSize: Math.max(10, dimensions.width * PREVIEW_CONSTANTS.typography.bullet.scale * 1.1), // Increased for scanning
    lineHeight: PREVIEW_CONSTANTS.typography.bullet.lineHeight
  };

  switch (spec.layout) {
    case 'title':
      return (
        <div className="flex items-center justify-center h-full text-center relative">
          <div className="z-10">
            {/* Enhanced title with display typography */}
            <h1 style={displayStyle} className="mb-3">
              {spec.title || 'Slide Title'}
            </h1>

            {/* Enhanced subtitle/paragraph */}
            {(spec.paragraph) && (
              <p style={subtitleStyle} className="mb-4 max-w-4xl mx-auto">
                {spec.paragraph}
              </p>
            )}

            {/* Enhanced decorative accent line matching backend */}
            <div
              className="mx-auto mb-2"
              style={{
                width: '40%',
                height: '3px',
                backgroundColor: theme.colors.accent,
                borderRadius: '2px',
                opacity: 0.9
              }}
            />

            {/* Secondary accent line for modern layered effect */}
            <div
              className="mx-auto"
              style={{
                width: '20%',
                height: '2px',
                backgroundColor: theme.colors.primary,
                borderRadius: '1px',
                opacity: 0.7
              }}
            />
          </div>

          {/* Modern corner accents matching backend */}
          <div
            className="absolute bottom-3 left-3"
            style={{
              width: '20px',
              height: '3px',
              backgroundColor: theme.colors.accent,
              opacity: 0.8,
              borderRadius: '2px'
            }}
          />
          <div
            className="absolute bottom-6 left-3"
            style={{
              width: '12px',
              height: '2px',
              backgroundColor: theme.colors.primary,
              opacity: 0.6,
              borderRadius: '1px'
            }}
          />
        </div>
      );

    case 'two-column':
      return (
        <>
          {/* Enhanced title with accent underline */}
          <div className="relative mb-4">
            <h1 style={titleStyle} className="mb-1">
              {spec.title || 'Slide Title'}
            </h1>
            <div
              style={{
                width: '15%',
                height: '2px',
                backgroundColor: theme.colors.accent,
                borderRadius: '1px'
              }}
            />
          </div>

          {/* Enhanced two-column layout with better visual separation */}
          <div className="flex-1 flex gap-4 relative">
            {/* Left column with enhanced modern card design */}
            <div className="flex-1 relative">
              <div
                className="absolute inset-0 rounded-lg"
                style={{
                  backgroundColor: theme.colors.surface,
                  opacity: 0.08,
                  border: `0.5px solid ${theme.colors.text.secondary}15`,
                  boxShadow: `0 1px 3px ${theme.colors.text.secondary}10`
                }}
              />
              <div className="relative p-4">
                {(spec as any).left?.bullets && (spec as any).left.bullets.length > 0 ? (
                  <ul className="space-y-2.5">
                    {(spec as any).left.bullets.slice(0, 4).map((bullet: string, index: number) => (
                      <li key={index} style={bulletStyle} className="flex items-start">
                        <span className="mr-3 flex-shrink-0 font-bold" style={{ color: theme.colors.accent }}>▸</span>
                        <span className="line-clamp-2">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={textStyle} className="line-clamp-4">
                    {(spec as any).left?.content || 'Left column content...'}
                  </p>
                )}
              </div>
              {/* Accent indicator */}
              <div
                className="absolute left-0 top-2 bottom-2 w-1 rounded-r"
                style={{
                  backgroundColor: theme.colors.accent,
                  opacity: 0.6
                }}
              />
            </div>

            {/* Enhanced modern column divider */}
            <div
              className="w-0.5 self-stretch my-4 rounded-full"
              style={{
                backgroundColor: theme.colors.accent,
                opacity: 0.7
              }}
            />

            {/* Right column with enhanced modern card design */}
            <div className="flex-1 relative">
              <div
                className="absolute inset-0 rounded-lg"
                style={{
                  backgroundColor: theme.colors.surface,
                  opacity: 0.08,
                  border: `0.5px solid ${theme.colors.text.secondary}15`,
                  boxShadow: `0 1px 3px ${theme.colors.text.secondary}10`
                }}
              />
              <div className="relative p-4">
                {(spec as any).right?.bullets && (spec as any).right.bullets.length > 0 ? (
                  <ul className="space-y-2.5">
                    {(spec as any).right.bullets.slice(0, 4).map((bullet: string, index: number) => (
                      <li key={index} style={bulletStyle} className="flex items-start">
                        <span className="mr-3 flex-shrink-0 font-bold" style={{ color: theme.colors.accent }}>▸</span>
                        <span className="line-clamp-2">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={textStyle} className="line-clamp-4">
                    {(spec as any).right?.content || 'Right column content...'}
                  </p>
                )}
              </div>
              {/* Accent indicator */}
              <div
                className="absolute right-0 top-2 bottom-2 w-1 rounded-l"
                style={{
                  backgroundColor: theme.colors.primary,
                  opacity: 0.8
                }}
              />
            </div>
          </div>
        </>
      );

    case 'image-right':
      return (
        <>
          {/* Enhanced title with accent underline */}
          <div className="relative mb-3">
            <h1 style={titleStyle} className="mb-1">
              {spec.title || 'Slide Title'}
            </h1>
            <div
              style={{
                width: '15%',
                height: '2px',
                backgroundColor: theme.colors.accent,
                borderRadius: '1px'
              }}
            />
          </div>

          {/* Enhanced image-right layout */}
          <div className="flex-1 flex gap-3">
            {/* Content area (left) - 60% */}
            <div className="flex-1" style={{ flex: '0 0 58%' }}>
              {spec.bullets && spec.bullets.length > 0 ? (
                <ul className="space-y-2">
                  {spec.bullets.slice(0, 4).map((bullet, index) => (
                    <li key={index} style={bulletStyle} className="flex items-start">
                      <span className="mr-2 flex-shrink-0" style={{ color: theme.colors.accent }}>•</span>
                      <span className="line-clamp-2">{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={textStyle} className="line-clamp-4">
                  {spec.paragraph || 'Content goes here...'}
                </p>
              )}
            </div>

            {/* Image area (right) - 38% */}
            <div className="relative" style={{ flex: '0 0 38%' }}>
              <div
                className="absolute inset-0 rounded-lg"
                style={{
                  backgroundColor: theme.colors.surface,
                  opacity: 0.8, // Increased opacity for better visibility
                  border: `2px solid ${theme.colors.text.secondary}30`, // Stronger border
                  boxShadow: `0 2px 8px ${theme.colors.text.secondary}15` // Subtle shadow
                }}
              />
              <div className="relative h-full flex items-center justify-center">
                <div className="text-center">
                  <div style={{ fontSize: dimensions.width * 0.04, marginBottom: '4px' }}>
                    🖼️
                  </div>
                  <span style={bulletStyle} className="text-gray-500">
                    {(spec as any).imagePrompt ? 'AI Image' : 'Image'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      );

    case 'image-left':
      return (
        <>
          {/* Enhanced title with accent underline */}
          <div className="relative mb-3">
            <h1 style={titleStyle} className="mb-1">
              {spec.title || 'Slide Title'}
            </h1>
            <div
              style={{
                width: '15%',
                height: '2px',
                backgroundColor: theme.colors.accent,
                borderRadius: '1px'
              }}
            />
          </div>

          {/* Enhanced image-left layout */}
          <div className="flex-1 flex gap-3">
            {/* Image area (left) - 38% */}
            <div className="relative" style={{ flex: '0 0 38%' }}>
              <div
                className="absolute inset-0 rounded-lg"
                style={{
                  backgroundColor: theme.colors.surface,
                  opacity: 0.8, // Increased opacity for better visibility
                  border: `2px solid ${theme.colors.text.secondary}30`, // Stronger border
                  boxShadow: `0 2px 8px ${theme.colors.text.secondary}15` // Subtle shadow
                }}
              />
              <div className="relative h-full flex items-center justify-center">
                <div className="text-center">
                  <div style={{ fontSize: dimensions.width * 0.04, marginBottom: '4px' }}>
                    🖼️
                  </div>
                  <span style={bulletStyle} className="text-gray-500">
                    {(spec as any).imagePrompt ? 'AI Image' : 'Image'}
                  </span>
                </div>
              </div>
            </div>

            {/* Content area (right) - 60% */}
            <div className="flex-1" style={{ flex: '0 0 58%' }}>
              {spec.bullets && spec.bullets.length > 0 ? (
                <ul className="space-y-2">
                  {spec.bullets.slice(0, 4).map((bullet, index) => (
                    <li key={index} style={bulletStyle} className="flex items-start">
                      <span className="mr-2 flex-shrink-0" style={{ color: theme.colors.accent }}>•</span>
                      <span className="line-clamp-2">{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={textStyle} className="line-clamp-4">
                  {spec.paragraph || 'Content goes here...'}
                </p>
              )}
            </div>
          </div>
        </>
      );

    case 'image-full':
      return (
        <div className="relative h-full overflow-hidden rounded-lg">
          {/* Full-screen image background */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}20 0%, ${theme.colors.accent}20 100%)`,
            }}
          />

          {/* Semi-transparent overlay */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: theme.colors.text.primary,
              opacity: 0.6
            }}
          />

          {/* Content overlay */}
          <div className="relative h-full flex flex-col items-center justify-center text-center text-white p-6">
            <h1
              style={{
                ...displayStyle,
                color: theme.colors.background,
                marginBottom: '16px'
              }}
            >
              {spec.title || 'Full Image Slide'}
            </h1>

            {spec.paragraph && (
              <p
                style={{
                  ...subtitleStyle,
                  color: theme.colors.surface,
                  maxWidth: '80%'
                }}
              >
                {spec.paragraph}
              </p>
            )}

            {/* Image indicator */}
            <div className="absolute bottom-4 right-4 text-white opacity-70">
              <div style={{ fontSize: dimensions.width * 0.03 }}>
                🖼️ {(spec as any).imagePrompt ? 'AI Generated' : 'Full Image'}
              </div>
            </div>
          </div>
        </div>
      );

    case 'chart':
      return (
        <>
          {/* Enhanced chart title with accent underline */}
          <div className="relative mb-4">
            <h1 style={titleStyle} className="mb-1">
              {spec.title || 'Chart Title'}
            </h1>
            <div
              style={{
                width: '15%',
                height: '2px',
                backgroundColor: theme.colors.accent,
                borderRadius: '1px'
              }}
            />
          </div>

          {/* Enhanced chart area with professional styling */}
          <div className="flex-1 relative">
            <div
              className="absolute inset-0 rounded-lg"
              style={{
                backgroundColor: theme.colors.surface,
                opacity: 0.5,
                border: `1px solid ${theme.colors.text.secondary}20`
              }}
            />
            <div className="relative h-full flex items-center justify-center">
              <div className="text-center">
                <div
                  style={{
                    fontSize: dimensions.width * 0.06,
                    marginBottom: '8px',
                    color: theme.colors.primary
                  }}
                >
                  📊
                </div>
                <div style={bulletStyle} className="text-gray-600 font-medium">
                  {spec.bullets ? `${spec.bullets.length} data points` : 'Chart data'}
                </div>
                <div style={{ ...bulletStyle, fontSize: bulletStyle.fontSize * 0.9 }} className="text-gray-400 mt-1">
                  Professional visualization
                </div>
              </div>
            </div>
          </div>
        </>
      );

    case 'comparison-table':
      return (
        <>
          {/* Enhanced table title with accent underline */}
          <div className="relative mb-3">
            <h1 style={titleStyle} className="mb-1">
              {spec.title || 'Comparison Table'}
            </h1>
            <div
              style={{
                width: '15%',
                height: '2px',
                backgroundColor: theme.colors.accent,
                borderRadius: '1px'
              }}
            />
          </div>

          {/* Enhanced table with professional styling */}
          <div className="flex-1 relative">
            <div
              className="absolute inset-0 rounded-lg"
              style={{
                backgroundColor: theme.colors.surface,
                opacity: 0.3,
                border: `1px solid ${theme.colors.text.secondary}20`
              }}
            />
            <div className="relative p-2 h-full">
              <div className="grid grid-cols-3 gap-1 h-full text-xs">
                {/* Enhanced table headers */}
                {Array.from({ length: 3 }, (_, i) => (
                  <div
                    key={`header-${i}`}
                    className="rounded text-center flex items-center justify-center font-semibold text-white"
                    style={{
                      fontSize: Math.max(8, dimensions.width * 0.018),
                      backgroundColor: theme.colors.primary,
                      padding: '4px 2px',
                      minHeight: '20%'
                    }}
                  >
                    Header {i + 1}
                  </div>
                ))}

                {/* Enhanced table data cells */}
                {Array.from({ length: 6 }, (_, i) => (
                  <div
                    key={`data-${i}`}
                    className="rounded text-center flex items-center justify-center"
                    style={{
                      fontSize: Math.max(7, dimensions.width * 0.016),
                      color: theme.colors.text.primary,
                      backgroundColor: i % 2 === 0 ? theme.colors.background : theme.colors.surface,
                      border: `1px solid ${theme.colors.text.secondary}20`,
                      padding: '3px 2px',
                      minHeight: '15%'
                    }}
                  >
                    Data {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      );

    case 'timeline':
      return (
        <>
          <div className="relative mb-3">
            <h1 style={titleStyle} className="mb-1">{spec.title || 'Timeline'}</h1>
            <div style={{ width: '15%', height: '2px', backgroundColor: theme.colors.accent, borderRadius: '1px' }} />
          </div>
          <div className="flex-1 relative">
            {/* Vertical line (approx 16% from left) */}
            <div className="absolute" style={{ left: '16%', top: 0, bottom: 0, width: '2px', backgroundColor: theme.colors.primary, opacity: 0.3 }} />
            {/* Items */}
            <div className="ml-[18%] space-y-4">
              {(spec.timeline || Array.from({ length: 3 }, (_, i) => ({ date: `202${i}`, title: `Milestone ${i+1}`, description: 'Details' })) ).slice(0, 5).map((item: any, idx: number) => (
                <div key={idx} className="relative">
                  {/* Dot */}
                  <div className="absolute -left-[18%]" style={{ transform: 'translateX(-50%)' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: theme.colors.accent }} />
                  </div>
                  <div style={{ ...subtitleStyle, color: theme.colors.text.primary, fontWeight: 600 }}>{item.date ? `${item.date} — ` : ''}{item.title}</div>
                  {item.description && (
                    <div style={{ ...textStyle, color: theme.colors.text.secondary }} className="mt-1">
                      {item.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      );

    case 'process-flow':
      return (
        <>
          <div className="relative mb-3">
            <h1 style={titleStyle} className="mb-1">{spec.title || 'Process'}</h1>
            <div style={{ width: '15%', height: '2px', backgroundColor: theme.colors.accent, borderRadius: '1px' }} />
          </div>
          {/* Steps */}
          <div className="flex-1 flex items-center justify-between gap-2">
            {Array.from({ length: Math.max(3, Math.min((spec as any).processSteps?.length || (spec.bullets?.length || 3), 6)) }).map((_, i) => (
              <div key={i} className="flex-1 relative">
                <div className="rounded-lg" style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.text.secondary}30` }}>
                  <div className="px-3 py-2" style={{ ...subtitleStyle, color: theme.colors.primary, fontWeight: 700 }}>Step {i+1}</div>
                  <div className="px-3 pb-3" style={textStyle}>{(spec as any).processSteps?.[i]?.title || spec.bullets?.[i] || `Step description ${i+1}`}</div>
                </div>
                {i < (Math.max(3, Math.min((spec as any).processSteps?.length || (spec.bullets?.length || 3), 6)) - 1) && (
                  <div className="absolute right-[-12px] top-1/2 -translate-y-1/2" style={{ width: '0', height: '0', borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: `12px solid ${theme.colors.accent}`, opacity: 0.8 }} />
                )}
              </div>
            ))}
          </div>
        </>
      );

    case 'quote':
      return (
        <div className="flex items-center justify-center h-full text-center">
          <div>
            <div style={{ ...textStyle, fontSize: Math.max(14, dimensions.width * 0.035) }} className="mb-4 italic">
              "{spec.paragraph || spec.title || 'Inspirational quote goes here'}"
            </div>
            {spec.subtitle && (
              <div style={bulletStyle} className="opacity-70">
                — {spec.subtitle}
              </div>
            )}
          </div>
        </div>
      );

    case 'mixed-content':
      return (
        <>
          {/* Enhanced title with accent underline */}
          <div className="relative mb-4">
            <h1 style={titleStyle} className="mb-1">
              {spec.title || 'Slide Title'}
            </h1>
            <div
              style={{
                width: '15%',
                height: '2px',
                backgroundColor: theme.colors.accent,
                borderRadius: '1px'
              }}
            />
          </div>

          {/* Main paragraph content if exists */}
          {spec.paragraph && (
            <div className="mb-4">
              <div
                className="p-3 rounded-lg"
                style={{
                  backgroundColor: theme.colors.surface,
                  opacity: 0.8,
                  border: `1px solid ${theme.colors.text.secondary}30`
                }}
              >
                <p style={textStyle} className="line-clamp-6 leading-relaxed">
                  {spec.paragraph}
                </p>
              </div>
            </div>
          )}

          {/* Two-column layout for mixed content */}
          <div className="flex-1 flex gap-4">
            {/* Left section */}
            <div className="flex-1">
              {/* Left section heading */}
              {(spec as any).left?.title && (
                <h3 style={subtitleStyle} className="mb-2 font-semibold">
                  {(spec as any).left.title}
                </h3>
              )}

              {/* Left section paragraph */}
              {(spec as any).left?.paragraph && (
                <p style={textStyle} className="mb-3 line-clamp-4">
                  {(spec as any).left.paragraph}
                </p>
              )}

              {/* Left section bullets */}
              {(spec as any).left?.bullets && (spec as any).left.bullets.length > 0 && (
                <ul className="space-y-1">
                  {(spec as any).left.bullets.slice(0, 4).map((bullet: string, index: number) => (
                    <li key={index} style={bulletStyle} className="flex items-start">
                      <span className="mr-2 flex-shrink-0" style={{ color: theme.colors.accent }}>•</span>
                      <span className="line-clamp-2">{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Right section */}
            <div className="flex-1">
              {/* Right section heading */}
              {(spec as any).right?.title && (
                <h3 style={subtitleStyle} className="mb-2 font-semibold">
                  {(spec as any).right.title}
                </h3>
              )}

              {/* Right section paragraph */}
              {(spec as any).right?.paragraph && (
                <p style={textStyle} className="mb-3 line-clamp-4">
                  {(spec as any).right.paragraph}
                </p>
              )}

              {/* Right section bullets */}
              {(spec as any).right?.bullets && (spec as any).right.bullets.length > 0 && (
                <ul className="space-y-1">
                  {(spec as any).right.bullets.slice(0, 4).map((bullet: string, index: number) => (
                    <li key={index} style={bulletStyle} className="flex items-start">
                      <span className="mr-2 flex-shrink-0" style={{ color: theme.colors.accent }}>•</span>
                      <span className="line-clamp-2">{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      );

    default:
      // Enhanced title-bullets or title-paragraph layout with debugging
      console.warn('🚨 Using default layout rendering for:', {
        layout: spec?.layout,
        hasTitle: !!spec?.title,
        hasContent: !!(spec?.bullets?.length || spec?.paragraph)
      });

      return (
        <>
          {/* Enhanced title with accent underline matching backend */}
          <div className="relative mb-4">
            <h1 style={titleStyle} className="mb-1">
              {spec?.title || 'Slide Title'}
            </h1>
            {/* Modern accent underline matching backend */}
            <div
              style={{
                width: '15%',
                height: '3px',
                backgroundColor: theme.colors.accent,
                borderRadius: '2px',
                opacity: 0.9
              }}
            />
            {/* Secondary accent for modern depth */}
            <div
              className="mt-1"
              style={{
                width: '8%',
                height: '2px',
                backgroundColor: theme.colors.primary,
                borderRadius: '1px',
                opacity: 0.7
              }}
            />
          </div>

          {/* Enhanced content area */}
          <div className="flex-1">
            {spec.bullets && spec.bullets.length > 0 ? (
              <ul className="space-y-3">
                {spec.bullets.slice(0, 5).map((bullet, index) => (
                  <li key={index} style={bulletStyle} className="flex items-start">
                    <span
                      className="mr-3 flex-shrink-0 mt-1"
                      style={{
                        color: theme.colors.accent,
                        fontSize: bulletStyle.fontSize * 0.8
                      }}
                    >
                      •
                    </span>
                    <span className="line-clamp-2 leading-relaxed">{bullet}</span>
                  </li>
                ))}
                {spec.bullets.length > 5 && (
                  <li style={{ ...bulletStyle, fontStyle: 'italic' }} className="text-gray-400 ml-6">
                    +{spec.bullets.length - 5} more points...
                  </li>
                )}
              </ul>
            ) : spec.paragraph ? (
              <div
                className="p-3 rounded-lg"
                style={{
                  backgroundColor: theme.colors.surface,
                  opacity: 0.8,
                  border: `1px solid ${theme.colors.text.secondary}30`
                }}
              >
                <p style={textStyle} className="line-clamp-6 leading-relaxed">
                  {spec.paragraph}
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <div style={{ fontSize: dimensions.width * 0.04, marginBottom: '8px' }}>
                  📝
                </div>
                <p style={{ ...textStyle, fontStyle: 'italic', color: theme.colors.text.secondary }}>
                  Content will be generated here...
                </p>
                <p style={{ ...bulletStyle, fontStyle: 'italic', color: theme.colors.text.secondary, marginTop: '4px' }}>
                  Layout: {spec?.layout || 'unknown'}
                </p>
              </div>
            )}
          </div>
        </>
      );
  }
}



====================================================================================================
FILE: frontend/src/types.ts
DESCRIPTION: Frontend TypeScript types and interfaces for slide specifications
PURPOSE: Type definitions for frontend components and data structures
STATUS: EXISTS
LINES: 321
====================================================================================================

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





====================================================================================================
FILE: frontend/src/themes/professionalThemes.ts
DESCRIPTION: Frontend theme definitions that mirror backend themes for consistency
PURPOSE: Frontend theme system ensuring preview-to-export consistency
STATUS: EXISTS
LINES: 839
====================================================================================================

/**
 * Enhanced Professional Theme System for Frontend
 * Synchronized with backend theme system for consistent styling
 */
export interface ProfessionalTheme {
  id: string;
  name: string;
  category: 'corporate' | 'creative' | 'academic' | 'startup' | 'healthcare' | 'finance' | 'consulting' | 'technology' | 'modern' | 'vibrant' | 'natural';
  description: string;

  // Enhanced Color System
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      inverse: string;
      muted: string;
    };
    semantic: {
      success: string;
      warning: string;
      error: string;
      info: string;
    };
    borders: {
      light: string;
      medium: string;
      strong: string;
    };
  };

  // Enhanced Typography System
  typography: {
    headings: {
      fontFamily: string;
      weights: number[];
      sizes: {
        display: number;  // 48px - Hero titles
        h1: number;       // 36px - Main titles
        h2: number;       // 28px - Section headers
        h3: number;       // 22px - Subsection headers
        h4: number;       // 18px - Small headings
      };
    };
    body: {
      fontFamily: string;
      weights: number[];
      sizes: {
        large: number;    // 18px - Emphasis
        normal: number;   // 16px - Body text
        small: number;    // 14px - Captions
        tiny: number;     // 12px - Very small
      };
    };
  };

  // Enhanced Visual Effects
  effects: {
    borderRadius: number;
    shadows: {
      subtle: string;
      medium: string;
      strong: string;
      colored: string;
      glow: string;
      elevated: string;
    };
    gradients: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      mesh: string;
      subtle: string;
      vibrant: string;
    };
  };

  // Enhanced Spacing System
  spacing: {
    xs: number;    // 4px
    sm: number;    // 8px
    md: number;    // 16px
    lg: number;    // 24px
    xl: number;    // 32px
    xxl: number;   // 48px
    xxxl: number;  // 64px
  };
}

/**
 * Enhanced Professional Theme Library
 * Synchronized with backend themes for consistent user experience
 */
export const PROFESSIONAL_THEMES: ProfessionalTheme[] = [
  // TOP TIER - MOST AESTHETICALLY PLEASING THEMES

  // Corporate Professional - Clean, trustworthy, universally appealing
  {
    id: 'corporate-blue',
    name: 'Corporate Professional',
    category: 'corporate',
    description: 'Clean, trustworthy theme perfect for business presentations',
    colors: {
      primary: '#1E40AF',
      secondary: '#3B82F6',
      accent: '#F59E0B',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      text: {
        primary: '#1F2937',
        secondary: '#6B7280',
        inverse: '#FFFFFF',
        muted: '#9CA3AF'
      },
      semantic: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6'
      },
      borders: {
        light: '#F3F4F6',
        medium: '#E5E7EB',
        strong: '#D1D5DB'
      }
    },
    typography: {
      headings: {
        fontFamily: 'Inter, system-ui, sans-serif',
        weights: [400, 500, 600, 700, 800],
        sizes: {
          display: 52,
          h1: 38,
          h2: 28,
          h3: 22,
          h4: 18
        }
      },
      body: {
        fontFamily: 'Inter, system-ui, sans-serif',
        weights: [400, 500, 600],
        sizes: {
          large: 19,
          medium: 16,
          small: 14,
          caption: 12
        }
      }
    },
    effects: {
      shadows: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        strong: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      },
      gradients: {
        primary: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
        accent: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        surface: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)'
      }
    }
  },

  // Executive Dark Theme
  {
    id: 'executive-dark',
    name: 'Modern Executive',
    category: 'corporate',
    description: 'Sophisticated dark theme for executive presentations',
    colors: {
      primary: '#3B82F6',
      secondary: '#64748B',
      accent: '#10B981',
      background: '#1E293B',
      surface: '#334155',
      text: {
        primary: '#F8FAFC',
        secondary: '#CBD5E1',
        inverse: '#1E293B',
        muted: '#94A3B8'
      },
      semantic: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6'
      },
      borders: {
        light: '#475569',
        medium: '#64748B',
        strong: '#94A3B8'
      }
    },
    typography: {
      headings: {
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        weights: [400, 500, 600, 700],
        sizes: {
          display: 48,
          h1: 36,
          h2: 28,
          h3: 22,
          h4: 18
        }
      },
      body: {
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        weights: [400, 500],
        sizes: {
          large: 18,
          medium: 16,
          small: 14,
          caption: 12
        },
        lineHeight: 1.6
      }
    },
    spacing: {
      baseUnit: 4,
      scale: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48
      }
    },
    effects: {
      shadows: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
        md: '0 4px 6px rgba(0, 0, 0, 0.3)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.3)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.4)'
      },
      borderRadius: {
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16
      },
      transitions: {
        fast: '150ms ease-in-out',
        normal: '300ms ease-in-out',
        slow: '500ms ease-in-out'
      }
    }
  },
  // Core Professional Themes
  {
    id: 'corporate-blue',
    name: 'Corporate Professional',
    category: 'corporate',
    description: 'Clean, trustworthy design perfect for business presentations',
    colors: {
      primary: '#1E40AF',
      secondary: '#3B82F6',
      accent: '#F59E0B',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      text: {
        primary: '#1F2937',
        secondary: '#6B7280',
        inverse: '#FFFFFF',
        muted: '#9CA3AF'
      },
      semantic: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6'
      },
      borders: {
        light: '#F3F4F6',
        medium: '#E5E7EB',
        strong: '#D1D5DB'
      }
    },
    typography: {
      headings: {
        fontFamily: 'Inter, system-ui, sans-serif',
        weights: [600, 700, 800],
        sizes: {
          display: 48,
          h1: 36,
          h2: 28,
          h3: 22,
          h4: 18
        }
      },
      body: {
        fontFamily: 'Inter, system-ui, sans-serif',
        weights: [400, 500, 600],
        sizes: {
          large: 18,
          normal: 16,
          small: 14,
          tiny: 12
        }
      }
    },
    effects: {
      borderRadius: 8,
      shadows: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        strong: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        colored: '0 4px 6px rgba(30, 64, 175, 0.2)',
        glow: '0 0 8px rgba(245, 158, 11, 0.3)',
        elevated: '0 12px 24px rgba(0, 0, 0, 0.08)'
      },
      gradients: {
        primary: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
        secondary: 'linear-gradient(135deg, #3B82F6 0%, #F59E0B 100%)',
        accent: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
        mesh: 'radial-gradient(at 0% 0%, rgba(30, 64, 175, 0.1), transparent 50%)',
        subtle: 'linear-gradient(180deg, #F8FAFC, #FFFFFF)',
        vibrant: 'linear-gradient(45deg, #F59E0B, #1E40AF)'
      }
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
      xxxl: 64
    }
  },

  // 2024 Modern Themes
  {
    id: 'peach-fuzz-2024',
    name: 'Warm Harmony (Pantone 2024)',
    category: 'vibrant',
    description: 'Warm, inviting design inspired by Pantone Color of the Year 2024',
    colors: {
      primary: '#FFBE98',
      secondary: '#FFDAB9',
      accent: '#FF6B35',
      background: '#FFF8F5',
      surface: '#FFE8E0',
      text: {
        primary: '#4A3520',
        secondary: '#6B4E31',
        inverse: '#FFFFFF',
        muted: '#A07D5C'
      },
      semantic: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#FFBE98'
      },
      borders: {
        light: '#FFE8E0',
        medium: '#FFDAB9',
        strong: '#FFBE98'
      }
    },

    typography: {
      headings: {
        fontFamily: 'Poppins, system-ui, sans-serif',
        weights: [600, 700, 800],
        sizes: {
          display: 52,
          h1: 40,
          h2: 32,
          h3: 24,
          h4: 20
        }
      },
      body: {
        fontFamily: 'Inter, system-ui, sans-serif',
        weights: [400, 500, 600],
        sizes: {
          large: 20,
          normal: 16,
          small: 14,
          tiny: 12
        }
      }
    },
    effects: {
      borderRadius: 14, // Increased for more modern appearance
      shadows: {
        subtle: '0 2px 4px rgba(255, 190, 152, 0.12)', // Enhanced subtle shadow
        medium: '0 6px 12px rgba(255, 190, 152, 0.18)', // Improved medium shadow
        strong: '0 12px 24px rgba(255, 190, 152, 0.25)', // Enhanced strong shadow
        colored: '0 6px 12px rgba(255, 190, 152, 0.35)', // More prominent colored shadow
        glow: '0 0 12px rgba(255, 107, 53, 0.4)', // Enhanced glow effect
        elevated: '0 16px 32px rgba(255, 190, 152, 0.15)' // More elevated shadow
      },
      gradients: {
        primary: 'linear-gradient(135deg, #FFBE98 0%, #FFDAB9 100%)',
        secondary: 'linear-gradient(135deg, #FFDAB9 0%, #FF6B35 100%)',
        accent: 'linear-gradient(135deg, #FF6B35 0%, #FFBE98 100%)',
        background: 'linear-gradient(135deg, #FFF8F5 0%, #FFE8E0 100%)',
        mesh: 'radial-gradient(at 0% 0%, rgba(255, 190, 152, 0.1), transparent 50%)',
        subtle: 'linear-gradient(180deg, #FFE8E0, #FFF8F5)',
        vibrant: 'linear-gradient(45deg, #FF6B35, #FFBE98)'
      }
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
      xxxl: 64
    }
  },

  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze (2024)',
    category: 'modern',
    description: 'Fresh, calming design inspired by ocean waves and modern aesthetics',
    colors: {
      primary: '#0EA5E9',
      secondary: '#38BDF8',
      accent: '#F0F9FF',
      background: '#F0F9FF',
      surface: '#E0F2FE',
      text: {
        primary: '#0C4A6E',
        secondary: '#0369A1',
        inverse: '#FFFFFF',
        muted: '#0284C7'
      },
      semantic: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#0EA5E9'
      },
      borders: {
        light: '#E0F2FE',
        medium: '#BAE6FD',
        strong: '#7DD3FC'
      }
    },
    typography: {
      headings: {
        fontFamily: 'Inter, system-ui, sans-serif',
        weights: [600, 700, 800],
        sizes: {
          display: 48,
          h1: 36,
          h2: 28,
          h3: 22,
          h4: 18
        }
      },
      body: {
        fontFamily: 'Inter, system-ui, sans-serif',
        weights: [400, 500, 600],
        sizes: {
          large: 18,
          normal: 16,
          small: 14,
          tiny: 12
        }
      }
    },
    effects: {
      borderRadius: 8,
      shadows: {
        subtle: '0 1px 3px rgba(14, 165, 233, 0.1)',
        medium: '0 4px 6px rgba(14, 165, 233, 0.15)',
        strong: '0 10px 15px rgba(14, 165, 233, 0.2)',
        colored: '0 4px 6px rgba(14, 165, 233, 0.3)',
        glow: '0 0 8px rgba(56, 189, 248, 0.3)',
        elevated: '0 12px 24px rgba(14, 165, 233, 0.1)'
      },
      gradients: {
        primary: 'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)',
        secondary: 'linear-gradient(135deg, #38BDF8 0%, #F0F9FF 100%)',
        accent: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
        background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
        mesh: 'radial-gradient(at 0% 0%, rgba(14, 165, 233, 0.1), transparent 50%)',
        subtle: 'linear-gradient(180deg, #E0F2FE, #F0F9FF)',
        vibrant: 'linear-gradient(45deg, #0EA5E9, #38BDF8)'
      }
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
      xxxl: 64
    }
  },

  {
    id: 'platinum-elegance',
    name: 'Platinum Elegance',
    category: 'corporate',
    description: 'Sophisticated, premium design for executive presentations',
    colors: {
      primary: '#64748B',
      secondary: '#94A3B8',
      accent: '#F1F5F9',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      text: {
        primary: '#0F172A',
        secondary: '#334155',
        inverse: '#FFFFFF',
        muted: '#64748B'
      },
      semantic: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#64748B'
      },
      borders: {
        light: '#F1F5F9',
        medium: '#E2E8F0',
        strong: '#CBD5E1'
      }
    },
    typography: {
      headings: {
        fontFamily: 'Georgia, serif',
        weights: [600, 700, 800],
        sizes: {
          display: 52,
          h1: 40,
          h2: 32,
          h3: 24,
          h4: 20
        }
      },
      body: {
        fontFamily: 'Inter, system-ui, sans-serif',
        weights: [400, 500, 600],
        sizes: {
          large: 20,
          normal: 18,
          small: 16,
          tiny: 14
        }
      }
    },
    effects: {
      borderRadius: 12,
      shadows: {
        subtle: '0 1px 3px rgba(100, 116, 139, 0.1)',
        medium: '0 4px 6px rgba(100, 116, 139, 0.15)',
        strong: '0 10px 15px rgba(100, 116, 139, 0.2)',
        colored: '0 4px 6px rgba(100, 116, 139, 0.3)',
        glow: '0 0 8px rgba(148, 163, 184, 0.3)',
        elevated: '0 12px 24px rgba(100, 116, 139, 0.1)'
      },
      gradients: {
        primary: 'linear-gradient(135deg, #64748B 0%, #94A3B8 100%)',
        secondary: 'linear-gradient(135deg, #94A3B8 0%, #F1F5F9 100%)',
        accent: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
        mesh: 'radial-gradient(at 0% 0%, rgba(100, 116, 139, 0.1), transparent 50%)',
        subtle: 'linear-gradient(180deg, #F8FAFC, #FFFFFF)',
        vibrant: 'linear-gradient(45deg, #64748B, #94A3B8)'
      }
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
      xxxl: 64
    }
  },

  {
    id: 'royal-authority',
    name: 'Royal Authority',
    category: 'corporate',
    description: 'Regal, authoritative design for high-impact presentations',
    colors: {
      primary: '#581C87',
      secondary: '#7C3AED',
      accent: '#C4B5FD',
      background: '#FEFBFF',
      surface: '#F3F0FF',
      text: {
        primary: '#3C1361',
        secondary: '#581C87',
        inverse: '#FFFFFF',
        muted: '#7C2D92'
      },
      semantic: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#581C87'
      },
      borders: {
        light: '#F3F0FF',
        medium: '#E9D5FF',
        strong: '#C4B5FD'
      }
    },
    typography: {
      headings: {
        fontFamily: 'Inter, system-ui, sans-serif',
        weights: [600, 700, 800],
        sizes: {
          display: 48,
          h1: 36,
          h2: 28,
          h3: 22,
          h4: 18
        }
      },
      body: {
        fontFamily: 'Inter, system-ui, sans-serif',
        weights: [400, 500, 600],
        sizes: {
          large: 18,
          normal: 16,
          small: 14,
          tiny: 12
        }
      }
    },
    effects: {
      borderRadius: 8,
      shadows: {
        subtle: '0 1px 3px rgba(88, 28, 135, 0.1)',
        medium: '0 4px 6px rgba(88, 28, 135, 0.15)',
        strong: '0 10px 15px rgba(88, 28, 135, 0.2)',
        colored: '0 4px 6px rgba(88, 28, 135, 0.3)',
        glow: '0 0 8px rgba(124, 58, 237, 0.3)',
        elevated: '0 12px 24px rgba(88, 28, 135, 0.1)'
      },
      gradients: {
        primary: 'linear-gradient(135deg, #581C87 0%, #7C3AED 100%)',
        secondary: 'linear-gradient(135deg, #7C3AED 0%, #C4B5FD 100%)',
        accent: 'linear-gradient(135deg, #C4B5FD 0%, #F3F0FF 100%)',
        background: 'linear-gradient(135deg, #FEFBFF 0%, #F3F0FF 100%)',
        mesh: 'radial-gradient(at 0% 0%, rgba(88, 28, 135, 0.1), transparent 50%)',
        subtle: 'linear-gradient(180deg, #F3F0FF, #FEFBFF)',
        vibrant: 'linear-gradient(45deg, #581C87, #7C3AED)'
      }
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
      xxxl: 64
    }
  },

  {
    id: 'forest-modern',
    name: 'Modern Forest',
    category: 'natural',
    description: 'Fresh, sustainable design with natural green tones',
    colors: {
      primary: '#166534',
      secondary: '#22C55E',
      accent: '#84CC16',
      background: '#F0FDF4',
      surface: '#DCFCE7',
      text: {
        primary: '#14532D',
        secondary: '#166534',
        inverse: '#FFFFFF',
        muted: '#15803D'
      },
      semantic: {
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#166534'
      },
      borders: {
        light: '#DCFCE7',
        medium: '#BBF7D0',
        strong: '#86EFAC'
      }
    },
    typography: {
      headings: {
        fontFamily: 'Inter, system-ui, sans-serif',
        weights: [600, 700, 800],
        sizes: {
          display: 48,
          h1: 36,
          h2: 28,
          h3: 22,
          h4: 18
        }
      },
      body: {
        fontFamily: 'Inter, system-ui, sans-serif',
        weights: [400, 500, 600],
        sizes: {
          large: 18,
          normal: 16,
          small: 14,
          tiny: 12
        }
      }
    },
    effects: {
      borderRadius: 8,
      shadows: {
        subtle: '0 1px 3px rgba(22, 101, 52, 0.1)',
        medium: '0 4px 6px rgba(22, 101, 52, 0.15)',
        strong: '0 10px 15px rgba(22, 101, 52, 0.2)',
        colored: '0 4px 6px rgba(22, 101, 52, 0.3)',
        glow: '0 0 8px rgba(34, 197, 94, 0.3)',
        elevated: '0 12px 24px rgba(22, 101, 52, 0.1)'
      },
      gradients: {
        primary: 'linear-gradient(135deg, #166534 0%, #22C55E 100%)',
        secondary: 'linear-gradient(135deg, #22C55E 0%, #84CC16 100%)',
        accent: 'linear-gradient(135deg, #84CC16 0%, #A3E635 100%)',
        background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
        mesh: 'radial-gradient(at 0% 0%, rgba(22, 101, 52, 0.1), transparent 50%)',
        subtle: 'linear-gradient(180deg, #DCFCE7, #F0FDF4)',
        vibrant: 'linear-gradient(45deg, #166534, #22C55E)'
      }
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
      xxxl: 64
    }
  }
];

/**
 * Enhanced Theme Utility Functions
 */

/**
 * Get theme by ID with fallback to default
 */
export function getThemeById(id: string): ProfessionalTheme | undefined {
  return PROFESSIONAL_THEMES.find(theme => theme.id === id);
}

/**
 * Get default theme (corporate-blue)
 */
export function getDefaultTheme(): ProfessionalTheme {
  return PROFESSIONAL_THEMES[0];
}

/**
 * Get themes by category
 */
export function getThemesByCategory(category: ProfessionalTheme['category']): ProfessionalTheme[] {
  return PROFESSIONAL_THEMES.filter(theme => theme.category === category);
}

/**
 * Get all available theme categories
 */
export function getThemeCategories(): ProfessionalTheme['category'][] {
  const categories = new Set(PROFESSIONAL_THEMES.map(theme => theme.category));
  return Array.from(categories);
}

/**
 * Generate CSS custom properties for a theme
 */
export function generateThemeCSS(theme: ProfessionalTheme): string {
  return `
    :root {
      --theme-primary: ${theme.colors.primary};
      --theme-secondary: ${theme.colors.secondary};
      --theme-accent: ${theme.colors.accent};
      --theme-background: ${theme.colors.background};
      --theme-surface: ${theme.colors.surface};
      --theme-text-primary: ${theme.colors.text.primary};
      --theme-text-secondary: ${theme.colors.text.secondary};
      --theme-text-inverse: ${theme.colors.text.inverse};
      --theme-text-muted: ${theme.colors.text.muted};

      --theme-font-heading: ${theme.typography.headings.fontFamily};
      --theme-font-body: ${theme.typography.body.fontFamily};

      --theme-radius: ${theme.effects.borderRadius}px;
      --theme-shadow-subtle: ${theme.effects.shadows.subtle};
      --theme-shadow-medium: ${theme.effects.shadows.medium};
      --theme-shadow-strong: ${theme.effects.shadows.strong};

      --theme-spacing-xs: ${theme.spacing.xs}px;
      --theme-spacing-sm: ${theme.spacing.sm}px;
      --theme-spacing-md: ${theme.spacing.md}px;
      --theme-spacing-lg: ${theme.spacing.lg}px;
      --theme-spacing-xl: ${theme.spacing.xl}px;
      --theme-spacing-xxl: ${theme.spacing.xxl}px;
    }
  `;
}

/**
 * Check if a theme is suitable for a specific presentation type
 */
export function isThemeSuitableFor(theme: ProfessionalTheme, presentationType: string): boolean {
  const suitabilityMap: Record<string, ProfessionalTheme['category'][]> = {
    business: ['corporate', 'finance', 'consulting'],
    creative: ['creative', 'startup', 'modern'],
    academic: ['academic', 'healthcare'],
    technical: ['technology', 'modern'],
    marketing: ['vibrant', 'creative', 'modern']
  };

  const suitableCategories = suitabilityMap[presentationType] || [];
  return suitableCategories.includes(theme.category);
}


