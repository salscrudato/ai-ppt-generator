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
    title:    { fontSize: 24, lineHeight: 1.1, letterSpacing: -0.02, fontWeight: 700 },    // Main slide titles - modern 24pt size
    subtitle: { fontSize: 28, lineHeight: 1.2, letterSpacing: -0.01, fontWeight: 600 },    // Section headers - improved hierarchy
    body:     { fontSize: 12, lineHeight: 1.4, letterSpacing: 0.003, fontWeight: 400 },    // Body text - 12pt for content
    bullet:   { fontSize: 12, lineHeight: 1.35, letterSpacing: 0.002, fontWeight: 400 },   // Bullet points - 12pt for content
    caption:  { fontSize: 16, lineHeight: 1.3, letterSpacing: 0.01, fontWeight: 500 },     // Small text - better visibility
    quote:    { fontSize: 26, lineHeight: 1.5, letterSpacing: 0.005, fontWeight: 400 },    // Quote text - enhanced emphasis
    accent:   { fontSize: 15, lineHeight: 1.25, letterSpacing: 0.015, fontWeight: 600 },   // Accent text - labels, tags
  },

  // Professional spacing system optimized for modern business presentations
  spacing: {
    titleToContent: 1.2,     // Increased spacing to prevent title-content overlap
    colGap: 0.6,             // Enhanced column separation for better readability
    bulletSpacing: 0.18,     // Optimized bullet spacing for professional appearance
    sectionGap: 0.6,         // Increased section gaps for better visual hierarchy
    cardPadding: 0.5,        // Generous padding for premium card design
    accentHeight: 0.08,      // Thin accent bar for modern professional look
    topAccentHeight: 0.08,   // Top accent bar height
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
  y: LAYOUT.spacing.topAccentHeight + LAYOUT.spacing.microSpacing, // Start below top accent bar
  width: SLIDE.width - LAYOUT.margins.left - LAYOUT.margins.right - (LAYOUT.spacing.visualMargin * 2),
  height: SLIDE.height - LAYOUT.margins.top - LAYOUT.margins.bottom - (LAYOUT.spacing.visualMargin * 2) - LAYOUT.spacing.topAccentHeight,
  titleH: 0.6, // Reduced title height for 24pt font
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
 * Add modern top accent bar with sophisticated gradient effect
 */
function addTopAccentBar(slide: pptxgen.Slide, theme: ProfessionalTheme) {
  const colors = getThemeColors(theme);

  // Create sophisticated gradient effect using multiple rectangles
  const segments = 100; // More segments for ultra-smooth gradient
  const segmentWidth = SLIDE.width / segments;

  for (let i = 0; i < segments; i++) {
    const ratio = i / (segments - 1);
    // Smooth interpolation between primary and secondary colors
    const primaryRGB = hexToRgb(colors.primary);
    const secondaryRGB = hexToRgb(colors.secondary);

    // Use smooth curve for more natural gradient
    const smoothRatio = 0.5 * (1 + Math.sin(Math.PI * (ratio - 0.5)));

    const r = Math.round(primaryRGB.r + (secondaryRGB.r - primaryRGB.r) * smoothRatio);
    const g = Math.round(primaryRGB.g + (secondaryRGB.g - primaryRGB.g) * smoothRatio);
    const b = Math.round(primaryRGB.b + (secondaryRGB.b - primaryRGB.b) * smoothRatio);

    const segmentColor = rgbToHex(r, g, b);

    slide.addShape("rect", {
      x: i * segmentWidth,
      y: 0,
      w: segmentWidth + 0.005, // Minimal overlap to prevent gaps
      h: LAYOUT.spacing.topAccentHeight,
      fill: { color: segmentColor },
      line: { width: 0 }
    });
  }
}

// Helper functions for color interpolation
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  // Remove # if present and ensure 6 characters
  const cleanHex = hex.replace('#', '').padStart(6, '0');
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cleanHex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 30, g: 64, b: 175 }; // Default to primary blue if parsing fails
}

function rgbToHex(r: number, g: number, b: number): string {
  return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}
/**
 * Enhanced title slide matching live preview exactly - modern and professional
 * Features: Bold typography, subtle gradients, modern styling, professional appearance
 */
function addTitleSlide(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme, fonts: { heading: string; body: string }) {
  const colors = getThemeColors(theme);

  // Enhanced background with sophisticated gradient overlay
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: SLIDE.width,
    h: SLIDE.height,
    fill: { color: colors.background },
    line: { width: 0 },
  });

  // Sophisticated gradient overlay for visual depth
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: SLIDE.width,
    h: SLIDE.height,
    fill: { color: colors.surface, transparency: 96 },
    line: { width: 0 },
  });

  // Add modern top accent bar with enhanced styling
  addTopAccentBar(slide, theme);

  // Enhanced secondary accent with better proportions
  slide.addShape("rect", {
    x: 0,
    y: LAYOUT.spacing.accentHeight,
    w: SLIDE.width * 0.7,
    h: LAYOUT.spacing.accentHeight * 0.8,
    fill: { color: colors.accent, transparency: 15 },
    line: { width: 0 },
  });

  // Professional main title with improved typography
  const titleText = sanitizeText(spec.title, 120) || 'Presentation';
  slide.addText(titleText, {
    x: CONTENT.x,
    y: 1.8, // Better vertical centering
    w: CONTENT.width,
    h: 1.6,
    fontFace: fonts.heading,
    fontSize: Math.min(LAYOUT.type.display.fontSize, 52), // Cap at 52pt for better fit
    color: colors.textPrimary,
    bold: true,
    align: 'center',
    valign: 'middle',
    lineSpacingMultiple: 1.1,
    wrap: true,
    shadow: {
      type: 'outer',
      blur: 6,
      offset: 3,
      angle: 315,
      color: colors.textSecondary,
      opacity: 0.25
    }
  });

  // Enhanced subtitle with better styling
  const contentText = (spec as any).subtitle || spec.paragraph || (spec as any).content;
  if (contentText) {
    slide.addText(sanitizeText(contentText, 400), {
      x: CONTENT.x + 0.5,
      y: 3.8,
      w: CONTENT.width - 1,
      h: 1.2,
      fontFace: fonts.body,
      fontSize: LAYOUT.type.subtitle.fontSize + 2, // Slightly larger for better hierarchy
      color: colors.textSecondary,
      bold: false,
      align: 'center',
      valign: 'top',
      lineSpacingMultiple: 1.3,
      wrap: true,
    });
  }

  // Modern accent line with gradient effect
  slide.addShape("rect", {
    x: SLIDE.width * 0.25,
    y: 5.3,
    w: SLIDE.width * 0.5,
    h: 0.06,
    fill: { color: colors.accent, transparency: 5 },
    line: { width: 0 },
  });

  // Secondary accent line for layered effect
  slide.addShape("rect", {
    x: SLIDE.width * 0.35,
    y: 5.42,
    w: SLIDE.width * 0.3,
    h: 0.03,
    fill: { color: colors.primary, transparency: 20 },
    line: { width: 0 },
  });

  // Enhanced corner decoration with modern styling
  slide.addShape("rect", {
    x: SLIDE.width - 0.9,
    y: SLIDE.height - 0.9,
    w: 0.7,
    h: 0.7,
    fill: { color: colors.accent, transparency: 92 },
    line: { width: 1, color: colors.primary, transparency: 80 },
  });

  slide.addShape("rect", {
    x: SLIDE.width - 0.6,
    y: SLIDE.height - 0.6,
    w: 0.4,
    h: 0.4,
    fill: { color: colors.primary, transparency: 88 },
    line: { width: 0 },
  });
}

/**
 * Modern content title with full width and professional 24pt styling
 * Features: Full width title, positioned below top accent bar, clean modern design
 */
function addContentTitle(slide: pptxgen.Slide, title: string, theme: ProfessionalTheme, fonts: { heading: string }) {
  const colors = getThemeColors(theme);

  // Add top accent bar first
  addTopAccentBar(slide, theme);

  const cleanTitle = sanitizeText(title, 120);

  // Professional title with full width and 24pt font - positioned directly below accent bar
  slide.addText(cleanTitle, {
    x: 0.3, // Small margin from edge
    y: LAYOUT.spacing.topAccentHeight + 0.1, // Position directly below accent bar
    w: SLIDE.width - 0.6, // Full width minus small margins
    h: CONTENT.titleH,
    fontFace: fonts.heading,
    fontSize: LAYOUT.type.title.fontSize, // 24pt
    color: colors.textPrimary,
    bold: true,
    align: 'left',
    valign: 'top',
    lineSpacingMultiple: LAYOUT.type.title.lineHeight,
    wrap: true
  });
}

/**
 * Enhanced bullets and paragraph rendering with improved typography and spacing
 * Features: Better bullet styling, improved readability, visual hierarchy, modern design
 */
function addBulletsOrParagraph(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme, fonts: { body: string }) {
  const colors = getThemeColors(theme);
  const bullets = sanitizeBullets(spec.bullets);
  // Adjust content positioning to account for new title position
  const y = LAYOUT.spacing.topAccentHeight + CONTENT.titleH + 0.3;
  const h = SLIDE.height - y - 0.8; // Leave space at bottom

  if (bullets.length) {
    // Modern container with subtle shadow
    slide.addShape("rect", {
      x: CONTENT.x + 0.05,
      y: y + 0.05,
      w: CONTENT.width,
      h: h,
      fill: { color: colors.textSecondary, transparency: 90 },
      line: { width: 0 },
    });

    // Main content container with modern styling
    slide.addShape("rect", {
      x: CONTENT.x,
      y: y,
      w: CONTENT.width,
      h: h,
      fill: { color: colors.background, transparency: 2 },
      line: { color: colors.primary, width: 2 },
    });

    // Top accent strip for modern look
    slide.addShape("rect", {
      x: CONTENT.x,
      y: y,
      w: CONTENT.width,
      h: 0.05,
      fill: { color: colors.primary },
      line: { width: 0 },
    });

    // Professional bullet rendering with proper PowerPoint bullet formatting
    const bulletTextArray = bullets.map(bullet => ({
      text: bullet,
      options: { bullet: true, indentLevel: 0 }
    }));
    slide.addText(bulletTextArray, {
      x: CONTENT.x + 0.3,
      y: y + 0.2,
      w: CONTENT.width - 0.6,
      h: h - 0.4,
      fontFace: fonts.body,
      fontSize: LAYOUT.type.bullet.fontSize, // 12pt
      color: colors.textPrimary,
      lineSpacingMultiple: 1.5,
      paraSpaceAfter: 8,
      valign: 'top',
      wrap: true
    });

  } else if (spec.paragraph) {
    // Modern container with subtle shadow
    slide.addShape("rect", {
      x: CONTENT.x + 0.05,
      y: y + 0.05,
      w: CONTENT.width,
      h: h,
      fill: { color: colors.textSecondary, transparency: 90 },
      line: { width: 0 },
    });

    // Main content container with modern styling
    slide.addShape("rect", {
      x: CONTENT.x,
      y: y,
      w: CONTENT.width,
      h: h,
      fill: { color: colors.background, transparency: 2 },
      line: { color: colors.primary, width: 2 },
    });

    // Top accent strip for modern look
    slide.addShape("rect", {
      x: CONTENT.x,
      y: y,
      w: CONTENT.width,
      h: 0.05,
      fill: { color: colors.primary },
      line: { width: 0 },
    });

    // Enhanced paragraph rendering with 12pt font
    const text = sanitizeText(spec.paragraph, 1200);
    slide.addText(text, {
      x: CONTENT.x + 0.3,
      y: y + 0.2,
      w: CONTENT.width - 0.6,
      h: h - 0.4,
      fontFace: fonts.body,
      fontSize: LAYOUT.type.body.fontSize, // 12pt
      color: colors.textPrimary,
      lineSpacingMultiple: 1.5,
      paraSpaceAfter: 4,
      valign: 'top',
      wrap: true
    });

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

  // Enhanced background with modern card-based design
  slide.addShape("rect", {
    x: CONTENT.x,
    y: y - LAYOUT.spacing.elementPadding,
    w: CONTENT.width,
    h: h + (LAYOUT.spacing.elementPadding * 2),
    fill: { color: colors.surface, transparency: 97 },
    line: { color: colors.borderLight, width: 1 },
  });

  // Top accent bar for visual hierarchy
  slide.addShape("rect", {
    x: CONTENT.x,
    y: y - LAYOUT.spacing.elementPadding,
    w: CONTENT.width,
    h: 0.04,
    fill: { color: colors.accent, transparency: 15 },
    line: { width: 0 },
  });

  // Left column card with enhanced styling
  slide.addShape("rect", {
    x: CONTENT.x + LAYOUT.spacing.cardPadding,
    y: y,
    w: colWidth - LAYOUT.spacing.cardPadding,
    h: h - LAYOUT.spacing.elementPadding,
    fill: { color: colors.background, transparency: 50 },
    line: { color: colors.borderMedium, width: 0.5 },
  });

  // Left column content
  if (leftBul.length) {
    const leftBulletTextArray = leftBul.map(bullet => ({
      text: bullet,
      options: { bullet: true, indentLevel: 0 }
    }));
    slide.addText(leftBulletTextArray, {
      x: CONTENT.x + LAYOUT.spacing.cardPadding + 0.1,
      y: y + 0.1,
      w: colWidth - LAYOUT.spacing.cardPadding - 0.2,
      h: h - LAYOUT.spacing.elementPadding - 0.2,
      fontFace: fonts.body,
      fontSize: LAYOUT.type.bullet.fontSize,
      color: colors.textPrimary,
      lineSpacingMultiple: LAYOUT.type.bullet.lineHeight,
      paraSpaceAfter: 12,
      valign: 'top',
    });
  } else if (spec.left?.paragraph) {
    const text = sanitizeText(spec.left.paragraph, 800);
    const fitFont = computeAdjustedFontSize(text, colWidth - LAYOUT.spacing.cardPadding - 0.2, h - LAYOUT.spacing.elementPadding - 0.2, LAYOUT.type.body.fontSize, LAYOUT.type.body.lineHeight, 12);
    slide.addText(text, {
      x: CONTENT.x + LAYOUT.spacing.cardPadding + 0.1,
      y: y + 0.1,
      w: colWidth - LAYOUT.spacing.cardPadding - 0.2,
      h: h - LAYOUT.spacing.elementPadding - 0.2,
      fontFace: fonts.body,
      fontSize: fitFont,
      color: colors.textPrimary,
      lineSpacingMultiple: LAYOUT.type.body.lineHeight,
      valign: 'top',
    });
  }

  // Enhanced column separator with modern design
  const separatorX = CONTENT.x + colWidth + (LAYOUT.spacing.colGap / 2);
  slide.addShape("rect", {
    x: separatorX - 0.015,
    y: y + 0.2,
    w: 0.03,
    h: h - LAYOUT.spacing.elementPadding - 0.4,
    fill: { color: colors.primary, transparency: 60 },
    line: { width: 0 },
  });

  // Right column card with enhanced styling
  slide.addShape("rect", {
    x: CONTENT.x + colWidth + LAYOUT.spacing.colGap,
    y: y,
    w: colWidth - LAYOUT.spacing.cardPadding,
    h: h - LAYOUT.spacing.elementPadding,
    fill: { color: colors.background, transparency: 50 },
    line: { color: colors.borderMedium, width: 0.5 },
  });

  // Right column content with enhanced styling
  if (rightBul.length) {
    const rightBulletTextArray = rightBul.map(bullet => ({
      text: bullet,
      options: { bullet: true, indentLevel: 0 }
    }));
    slide.addText(rightBulletTextArray, {
      x: CONTENT.x + colWidth + LAYOUT.spacing.colGap + 0.1,
      y: y + 0.1,
      w: colWidth - LAYOUT.spacing.cardPadding - 0.2,
      h: h - LAYOUT.spacing.elementPadding - 0.2,
      fontFace: fonts.body,
      fontSize: LAYOUT.type.bullet.fontSize,
      color: colors.textPrimary,
      lineSpacingMultiple: LAYOUT.type.bullet.lineHeight,
      paraSpaceAfter: 12,
      valign: 'top',
    });
  } else if (spec.right?.paragraph) {
    const text = sanitizeText(spec.right.paragraph, 800);
    const fitFont = computeAdjustedFontSize(text, colWidth - LAYOUT.spacing.cardPadding - 0.2, h - LAYOUT.spacing.elementPadding - 0.2, LAYOUT.type.body.fontSize, LAYOUT.type.body.lineHeight, 12);
    slide.addText(text, {
      x: CONTENT.x + colWidth + LAYOUT.spacing.colGap + 0.1,
      y: y + 0.1,
      w: colWidth - LAYOUT.spacing.cardPadding - 0.2,
      h: h - LAYOUT.spacing.elementPadding - 0.2,
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
    const bulletTextArray = bullets.map(bullet => ({
      text: bullet,
      options: { bullet: true, indentLevel: 0 }
    }));
    slide.addText(bulletTextArray, {
      x: CONTENT.x + 0.05,
      y,
      w: contentWidth - 0.05,
      h,
      fontFace: fonts.body,
      fontSize: LAYOUT.type.bullet.fontSize,
      color: colors.textPrimary,
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
    generatedImageUrl: (spec as any).generatedImageUrl || spec.imageUrl,
    generatedImageData: (spec as any).generatedImageData,
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
        const leftBulletTextArray = leftBul.map(bullet => ({
          text: bullet,
          options: { bullet: true, indentLevel: 0 }
        }));
        slide.addText(leftBulletTextArray, {
          x: CONTENT.x + 0.15,
          y: currentY + 0.1,
          w: colWidth - 0.25,
          h: remainingHeight - 0.3,
          fontFace: fonts.body,
          fontSize: LAYOUT.type.bullet.fontSize,
          color: colors.textPrimary,
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
        const rightBulletText = rightBul.map(bullet => `• ${bullet}`).join('\n');
        slide.addText(rightBulletText, {
          x: rightX + 0.15,
          y: currentY + 0.1,
          w: colWidth - 0.25,
          h: remainingHeight - 0.3,
          fontFace: fonts.body,
          fontSize: LAYOUT.type.bullet.fontSize,
          color: colors.textPrimary,
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
    generatedImageUrl: (spec as any).generatedImageUrl || spec.imageUrl,
    generatedImageData: (spec as any).generatedImageData,
  });

  // Add content (bullets or paragraph) on the right
  const bullets = sanitizeBullets(spec.bullets);
  if (bullets.length) {
    const bulletTextArray = bullets.map(bullet => ({
      text: bullet,
      options: { bullet: true, indentLevel: 0 }
    }));
    slide.addText(bulletTextArray, {
      x: contentX + 0.05,
      y,
      w: contentWidth - 0.05,
      h,
      fontFace: fonts.body,
      fontSize: LAYOUT.type.bullet.fontSize,
      color: colors.textPrimary,
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
    generatedImageData: (spec as any).generatedImageData,
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
  generatedImageData?: string; // data URL or base64
  isFullScreen?: boolean;
}) {
  const { x, y, w, h, colors, imagePrompt, generatedImageUrl, generatedImageData, isFullScreen = false } = options;

  if (generatedImageUrl || generatedImageData) {
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

      const imageOpts: any = {
        x,
        y,
        w,
        h,
        sizing: { type: 'cover', w, h },
      };
      if (generatedImageData) {
        imageOpts.data = generatedImageData;
      } else if (generatedImageUrl) {
        imageOpts.path = generatedImageUrl;
      }
      slide.addImage(imageOpts);

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

  // Enhanced card background with subtle shadow effect
  slide.addShape("rect", {
    x: CONTENT.x - LAYOUT.spacing.elementPadding,
    y: y - LAYOUT.spacing.elementPadding,
    w: CONTENT.width + (LAYOUT.spacing.elementPadding * 2),
    h: h + (LAYOUT.spacing.elementPadding * 2),
    fill: { color: colors.surface, transparency: 97 },
    line: { color: colors.borderLight, width: 1 },
  });

  // Enhanced decorative left accent with gradient effect
  slide.addShape("rect", {
    x: CONTENT.x - LAYOUT.spacing.elementPadding,
    y: y - LAYOUT.spacing.elementPadding,
    w: 0.08,
    h: h + (LAYOUT.spacing.elementPadding * 2),
    fill: { color: colors.accent, transparency: 25 },
    line: { width: 0 },
  });

  // Secondary accent for layered effect
  slide.addShape("rect", {
    x: CONTENT.x - LAYOUT.spacing.elementPadding + 0.08,
    y: y - LAYOUT.spacing.elementPadding,
    w: 0.04,
    h: h + (LAYOUT.spacing.elementPadding * 2),
    fill: { color: colors.primary, transparency: 40 },
    line: { width: 0 },
  });

  const quote = (spec as any).quote || spec.paragraph || 'Product Launch Plan is essential for success';
  const author = (spec as any).author || (spec as any).subtitle || 'Steve Jobs';

  // Large opening quotation mark for visual impact
  slide.addText('"', {
    x: CONTENT.x + 0.15,
    y: y + 0.05,
    w: 0.5,
    h: 0.6,
    fontFace: fonts.heading,
    fontSize: 72,
    color: colors.accent,
    transparency: 30,
    align: 'left',
    valign: 'top',
    bold: true,
  });

  // Enhanced quote text with better typography
  slide.addText(sanitizeText(quote, 800), {
    x: CONTENT.x + 0.4,
    y: y + 0.3,
    w: CONTENT.width - 0.7,
    h: h - 0.8,
    fontFace: fonts.body,
    fontSize: LAYOUT.type.quote.fontSize + 2, // Slightly larger for impact
    color: colors.textPrimary,
    italic: true,
    lineSpacingMultiple: 1.4, // Better line spacing
    valign: 'middle', // Center vertically for better balance
    align: 'left',
    wrap: true,
  });

  // Enhanced author attribution with better styling
  if (author) {
    slide.addText(`— ${sanitizeText(author, 60)}`, {
      x: CONTENT.x + 0.4,
      y: y + h - 0.5,
      w: CONTENT.width - 0.7,
      h: 0.4,
      fontFace: fonts.body,
      fontSize: LAYOUT.type.caption.fontSize + 1,
      color: colors.textSecondary,
      align: 'right',
      valign: 'middle',
      bold: true,
    });
  }

  // Closing quotation mark for balance
  slide.addText('"', {
    x: CONTENT.x + CONTENT.width - 0.4,
    y: y + h - 0.6,
    w: 0.3,
    h: 0.4,
    fontFace: fonts.heading,
    fontSize: 48,
    color: colors.accent,
    transparency: 40,
    align: 'right',
    valign: 'bottom',
    bold: true,
  });
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
  const centerX = CONTENT.x + CONTENT.width * 0.18; // Slightly more space for better balance

  // Enhanced vertical timeline line with gradient effect
  slide.addShape("rect", {
    x: centerX - 0.03,
    y: yTop,
    w: 0.06,
    h: availableH,
    fill: { color: colors.primary, transparency: 20 },
    line: { width: 0 },
  });

  // Add subtle shadow line for depth
  slide.addShape("rect", {
    x: centerX - 0.01,
    y: yTop,
    w: 0.02,
    h: availableH,
    fill: { color: colors.accent },
    line: { width: 0 },
  });

  const items = (spec as any).timeline || [];
  const count = Math.max(1, Math.min(items.length || 3, 6)); // Limit to 6 for better spacing
  const step = availableH / (count + 0.5); // Add padding at bottom

  for (let i = 0; i < count; i++) {
    const item = items[i] || {
      date: '',
      title: (spec.bullets && spec.bullets[i]) || `Milestone ${i + 1}`,
      description: '',
      milestone: i === 0 || i === count - 1 // First and last are milestones
    };
    const cy = yTop + (i + 0.5) * step;

    // Enhanced milestone dot with better styling
    const dotSize = item.milestone ? 0.22 : 0.18;
    const dotColor = item.milestone ? colors.accent : colors.primary;

    // Outer ring for milestone emphasis
    if (item.milestone) {
      slide.addShape("ellipse", {
        x: centerX - (dotSize + 0.04) / 2,
        y: cy - 0.02,
        w: dotSize + 0.04,
        h: dotSize + 0.04,
        fill: { color: dotColor, transparency: 80 },
        line: { width: 0 },
      });
    }

    // Main dot
    slide.addShape("ellipse", {
      x: centerX - dotSize / 2,
      y: cy,
      w: dotSize,
      h: dotSize,
      fill: { color: dotColor },
      line: { color: colors.background, width: 2 },
    });

    // Content card background for better readability
    const cardX = centerX + 0.35;
    const cardW = CONTENT.width - (centerX - CONTENT.x) - 0.4;
    const cardH = Math.min(step * 0.8, 1.2);

    slide.addShape("rect", {
      x: cardX - 0.05,
      y: cy - 0.1,
      w: cardW + 0.1,
      h: cardH,
      fill: { color: colors.surface, transparency: 95 },
      line: { color: colors.borderLight, width: 1 },
    });

    // Enhanced title text with better typography
    const titleText = item.date ? `${item.date} — ${item.title}` : item.title || '';
    slide.addText(sanitizeText(titleText, 100), {
      x: cardX,
      y: cy - 0.05,
      w: cardW,
      h: 0.35,
      fontFace: fonts.heading,
      fontSize: item.milestone ? LAYOUT.type.subtitle.fontSize + 1 : LAYOUT.type.subtitle.fontSize,
      color: colors.textPrimary,
      bold: true,
      valign: 'top',
      wrap: true,
    });

    // Description with improved styling
    if (item.description) {
      slide.addText(sanitizeText(item.description, 300), {
        x: cardX,
        y: cy + 0.25,
        w: cardW,
        h: cardH - 0.35,
        fontFace: fonts.body,
        fontSize: LAYOUT.type.body.fontSize,
        color: colors.textSecondary,
        lineSpacingMultiple: 1.2,
        valign: 'top',
        wrap: true,
      });
    }

    // Add connecting line from dot to card
    slide.addShape("line", {
      x: centerX + dotSize / 2,
      y: cy + dotSize / 2,
      w: 0.25,
      h: 0,
      line: { color: colors.borderMedium, width: 1.5, dashType: 'dash' },
    });
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

/**
 * Creates contextual chart data based on slide content and title
 */
function createContextualChartData(spec: SlideSpec) {
  const title = (spec.title || '').toLowerCase();

  // Financial/Revenue context
  if (title.includes('revenue') || title.includes('financial') || title.includes('sales') || title.includes('profit')) {
    return [{
      name: 'Revenue',
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      values: [120, 150, 180, 165]
    }];
  }

  // Growth/Performance context
  if (title.includes('growth') || title.includes('performance') || title.includes('metrics')) {
    return [{
      name: 'Growth',
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
      values: [85, 92, 98, 105, 112]
    }];
  }

  // Market/Competition context
  if (title.includes('market') || title.includes('competition') || title.includes('share')) {
    return [{
      name: 'Market Share',
      labels: ['Our Company', 'Competitor A', 'Competitor B', 'Others'],
      values: [35, 28, 22, 15]
    }];
  }

  // Technology/Roadmap context
  if (title.includes('technology') || title.includes('roadmap') || title.includes('development')) {
    return [{
      name: 'Progress',
      labels: ['Planning', 'Development', 'Testing', 'Deployment'],
      values: [100, 75, 45, 20]
    }];
  }

  // Default professional data
  return [{
    name: 'Data',
    labels: ['Category A', 'Category B', 'Category C', 'Category D'],
    values: [65, 85, 45, 75]
  }];
}

/**
 * Creates a professional chart placeholder when chart generation fails
 */
function addChartPlaceholder(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme, fonts: { heading: string; body: string }, chartY: number, chartH: number) {
  const colors = getThemeColors(theme);

  // Professional placeholder with chart-like visual elements
  slide.addText('📊 Chart Visualization', {
    x: CONTENT.x + 1,
    y: chartY + 0.5,
    w: CONTENT.width - 2,
    h: 0.8,
    fontFace: fonts.heading,
    fontSize: 24,
    color: colors.textSecondary,
    align: 'center',
    valign: 'middle',
    bold: true
  });

  // Add sample visual elements to simulate chart appearance
  const barWidth = 0.8;
  const barSpacing = 1.2;
  const startX = CONTENT.x + 1.5;
  const baseY = chartY + chartH - 1;
  const heights = [0.8, 1.2, 0.6, 1.0];

  heights.forEach((height, index) => {
    slide.addShape('rect', {
      x: startX + (index * barSpacing),
      y: baseY - height,
      w: barWidth,
      h: height,
      fill: { color: colors.primary, transparency: 20 + (index * 10) },
      line: { width: 1, color: colors.primary, transparency: 40 }
    });
  });

  slide.addText('Content will be displayed here.', {
    x: CONTENT.x + 1,
    y: chartY + chartH - 0.8,
    w: CONTENT.width - 2,
    h: 0.4,
    fontFace: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    align: 'center',
    valign: 'middle',
    italic: true
  });
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

  // Modern data visualization color palette with enhanced accessibility and visual harmony
  const chartColors = [
    colors.primary,      // Primary brand color
    colors.accent,       // Accent color for emphasis
    colors.secondary,    // Secondary brand color
    '#10B981',          // Emerald - success/positive data
    '#F59E0B',          // Amber - warning/neutral data
    '#EF4444',          // Red - error/negative data
    '#8B5CF6',          // Violet - premium accent
    '#06B6D4',          // Cyan - technology/innovation
    '#EC4899',          // Pink - creative/dynamic
    '#84CC16',          // Lime - growth/fresh
    '#6366F1',          // Indigo - trust/stability
    '#F97316',          // Orange - energy/enthusiasm
    '#14B8A6',          // Teal - balance/harmony
    '#A855F7',          // Purple - luxury/premium
    '#F43F5E',          // Rose - passion/attention
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

  // Modern chart options with sophisticated styling and enhanced visual appeal
  const opts: pptxgen.IChartOpts = {
    x: CONTENT.x + LAYOUT.spacing.cardPadding,
    y: chartY + LAYOUT.spacing.elementPadding,
    w: CONTENT.width - (LAYOUT.spacing.cardPadding * 2),
    h: chartH - (LAYOUT.spacing.elementPadding * 2),
    chartColors,
    showLegend: (data as any[])?.length > 1,
    legendPos: 'r',
    legendFontSize: 15, // Enhanced for better readability
    legendFontFace: fonts.body,
    legendColor: colors.textPrimary,
    title: '', // Remove chart title to avoid duplication
    titleFontFace: fonts.heading,
    titleFontSize: 20, // Enhanced prominence
    // Modern grid styling with subtle professional appearance
    catGridLine: { style: 'solid', size: 1.2, color: colors.borderLight }, // Refined grid lines
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





  // Enhanced chart generation with robust fallback system
  try {
    let chartData = data;

    // If no valid chart data, create meaningful fallback based on slide content
    if (!chartData || !Array.isArray(chartData) || chartData.length === 0) {
      // Try to extract data from bullets or create contextual sample data
      const fallbackData = createContextualChartData(spec);
      chartData = fallbackData;
      console.log('Using contextual fallback chart data for better presentation quality');
    }

    // Ensure chart data is properly formatted
    if (chartData && Array.isArray(chartData) && chartData.length > 0) {
      // Validate and clean chart data
      const cleanedData = chartData.map((series: any) => ({
        name: sanitizeText(series.name || 'Data', 30),
        labels: (series.labels || []).map((label: any) => sanitizeText(String(label), 20)),
        values: (series.values || []).map((value: any) => {
          const num = Number(value);
          return isNaN(num) ? 0 : num;
        })
      })).filter(series => series.labels.length > 0 && series.values.length > 0);

      if (cleanedData.length > 0) {
        slide.addChart(chartType, cleanedData as any, opts);
      } else {
        throw new Error('No valid chart data after cleaning');
      }
    } else {
      throw new Error('Invalid chart data structure');
    }
  } catch (chartError) {
    console.error('Chart creation failed, using visual placeholder:', chartError instanceof Error ? chartError.message : 'Unknown error');

    // Create a professional visual placeholder instead of error text
    addChartPlaceholder(slide, spec, theme, fonts, chartY, chartH);
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

  // Modern header row with sophisticated styling and enhanced visual hierarchy
  styled.push(
    header.map((h: string, colIndex: number) => ({
      text: h,
      options: {
        bold: true,
        fontFace: fonts.heading,
        fontSize: LAYOUT.type.body.fontSize + 2, // Enhanced header font size for superior hierarchy
        color: 'FFFFFF',
        fill: {
          type: 'gradient',
          angle: 135, // Modern diagonal gradient
          colors: [
            { color: colors.primary, position: 0 },
            { color: colors.secondary, position: 50 },
            { color: colors.accent, position: 100 }
          ]
        }, // Sophisticated three-color gradient header
        align: colIndex === 0 ? 'left' : 'center',
        valign: 'middle',
        margin: [0.15, 0.22, 0.15, 0.22], // Premium padding for superior spacing
        shadow: {
          type: 'outer',
          blur: 3,
          offset: 1,
          color: colors.textPrimary,
          opacity: 20
        }, // Subtle text shadow for depth
      },
    }))
  );

  // Modern data rows with sophisticated alternating design and enhanced visual appeal
  rows.forEach((r: string[], i: number) => {
    const isEven = i % 2 === 0;
    const fill = isEven ? colors.surface : colors.background;
    const textColor = colors.textPrimary;

    styled.push(
      r.map((c: string, colIndex: number) => ({
        text: c,
        options: {
          fontFace: fonts.body,
          fontSize: LAYOUT.type.body.fontSize + 0.5, // Slightly enhanced for better readability
          color: textColor,
          fill: {
            color: fill,
            transparency: isEven ? 88 : 96 // Enhanced contrast for better readability
          },
          align: colIndex === 0 ? 'left' : 'center',
          valign: 'middle',
          margin: [0.12, 0.22, 0.12, 0.22], // Enhanced padding for premium spacing
          border: {
            color: colors.borderLight,
            pt: 0.75 // Slightly stronger borders for better definition
          },
          // Add subtle hover effect simulation through enhanced styling
          shadow: isEven ? undefined : {
            type: 'outer',
            blur: 1,
            offset: 0.5,
            color: colors.borderMedium,
            opacity: 10
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
  // Enhanced debugging for PowerPoint generation
  const debugId = `PPT-${Date.now()}`;
  console.log(`🚀 [${debugId}] Starting PowerPoint generation`, {
    slideCount: specs?.length || 0,
    themeId,
    options,
    timestamp: new Date().toISOString()
  });

  // Validate input
  if (!Array.isArray(specs) || specs.length === 0) {
    console.error(`❌ [${debugId}] No slide specs provided`);
    throw new Error('No slide specs provided');
  }

  console.log(`📋 [${debugId}] Slide specifications:`, specs.map((spec, i) => ({
    index: i,
    layout: spec.layout,
    title: spec.title?.substring(0, 50) + '...',
    hasBullets: !!spec.bullets?.length,
    hasParagraph: !!spec.paragraph,
    hasLeft: !!spec.left,
    hasRight: !!spec.right
  })));

  specs.forEach((s, i) => {
    if (!s || typeof s !== 'object' || !sanitizeText(s.title)) {
      console.error(`❌ [${debugId}] Slide ${i + 1} missing valid title`, s);
      throw new Error(`Slide ${i + 1} missing valid title`);
    }
  });

  // Init presentation
  console.log(`🎨 [${debugId}] Initializing presentation`);
  const pres = new pptxgen();
  pres.defineLayout({ name: 'LAYOUT_16x9', width: SLIDE.width, height: SLIDE.height });
  pres.layout = 'LAYOUT_16x9';

  const theme = PROFESSIONAL_THEMES.find((t) => t.id === themeId) || PROFESSIONAL_THEMES[0];
  console.log(`🎨 [${debugId}] Theme selected:`, {
    requestedTheme: themeId,
    actualTheme: theme.id,
    themeName: theme.name,
    themeCategory: theme.category
  });

  const fonts = getFonts(theme);
  const colors = getThemeColors(theme);

  console.log(`🎨 [${debugId}] Theme configuration:`, {
    fonts: {
      heading: fonts.heading,
      body: fonts.body
    },
    colors: {
      primary: colors.primary,
      background: colors.background,
      textPrimary: colors.textPrimary
    }
  });

  // Theme defaults (fonts/language)
  pres.theme = { headFontFace: fonts.heading, bodyFontFace: fonts.body, lang: 'en-US' } as any; // documented API  [oai_citation:7‡gitbrent.github.io](https://gitbrent.github.io/PptxGenJS/docs/usage-pres-options/?utm_source=chatgpt.com)

  // Metadata
  if (options.includeMetadata !== false) {
    const metadata = {
      author: sanitizeText(options.author, 60) || 'AI PowerPoint Generator',
      company: sanitizeText(options.company, 60) || 'Professional Presentations',
      subject: sanitizeText(options.subject, 120) || 'AI-Generated Presentation',
      title: sanitizeText(specs[0].title, 80) || 'Presentation'
    };

    console.log(`📄 [${debugId}] Setting metadata:`, metadata);

    pres.author = metadata.author;
    pres.company = metadata.company;
    pres.subject = metadata.subject;
    pres.title = metadata.title;
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
        case 'mixed-content':
          // Dynamic layout for mixed content types (e.g., text + chart, bullets + chart)
          addMixedContentSlide(slide, spec, theme, fonts);
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
      console.error(`❌ [${debugId}] Slide ${i + 1} generation failed:`, {
        error: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        slideSpec: {
          layout: spec.layout,
          title: spec.title,
          hasBullets: !!spec.bullets?.length,
          hasParagraph: !!spec.paragraph
        }
      });

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

  console.log(`💾 [${debugId}] Generating PowerPoint buffer`);

  // Save
  try {
    const writeOptions = {
      outputType: 'nodebuffer' as const,
      compression: options.optimizeFileSize === true
    };

    console.log(`💾 [${debugId}] Writing presentation with options:`, writeOptions);

    const buffer = (await pres.write(writeOptions)) as Buffer;

    console.log(`✅ [${debugId}] Buffer generated successfully:`, {
      size: buffer.length,
      sizeKB: (buffer.length / 1024).toFixed(2),
      signature: buffer.slice(0, 4).toString('hex'),
      isPKZip: buffer[0] === 0x50 && buffer[1] === 0x4B
    });

    validateBuffer(buffer);

    console.log(`🎉 [${debugId}] PowerPoint generation completed successfully`);
    return buffer;

  } catch (err) {
    console.error(`❌ [${debugId}] Failed to generate buffer:`, {
      error: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined
    });
    throw err;
  }
}



// Backward-compatible alias
export const generatePpt = generateSimplePpt;