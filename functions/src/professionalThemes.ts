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
    compact: 0.9,
    normal: 1.0,
    large: 1.1,
  } as const;

  const m = scaleMultipliers[scale];

  return {
    headings: {
      fontFamily: headingFont || MODERN_FONT_STACKS.modernSans,
      fontWeight: {
        light: 300,
        normal: 400,
        semibold: 600,
        bold: 700,
        extrabold: 800,
      },
      sizes: {
        display: Math.round(52 * m),
        h1: Math.round(40 * m),
        h2: Math.round(32 * m),
        h3: Math.round(24 * m),
        h4: Math.round(20 * m),
      },
      lineHeight: { tight: 1.1, normal: 1.25, relaxed: 1.4 },
    },
    body: {
      fontFamily: bodyFont || MODERN_FONT_STACKS.readableSans,
      fontWeight: { light: 300, normal: 400, medium: 500, semibold: 600 },
      sizes: {
        large: Math.round(20 * m),
        normal: Math.round(16 * m),
        small: Math.round(14 * m),
        tiny: Math.round(12 * m),
      },
      lineHeight: { tight: 1.4, normal: 1.6, relaxed: 1.8 },
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
        strong: '#D1D5DB', // fixed typo
      },
    },
    typography: createModernTypography(
      typography?.headingFont,
      typography?.bodyFont,
      typography?.scale || 'normal'
    ),
    effects: {
      borderRadius: { small: 4, medium: 8, large: 16, full: 9999 },
      shadows: {
        subtle: '0 1px 3px rgba(0,0,0,0.1)',
        medium: '0 4px 6px rgba(0,0,0,0.1)',
        strong: '0 10px 15px rgba(0,0,0,0.12)',
        colored: `0 4px 6px ${primary}33`,
        glow: `0 0 8px ${accent}4D`,
        inset: 'inset 0 2px 4px rgba(0,0,0,0.06)',
        elevated: '0 12px 24px rgba(0,0,0,0.08)',
      },
      gradients: {
        primary: `linear-gradient(135deg, ${primary}, ${secondary})`,
        secondary: `linear-gradient(135deg, ${secondary}, ${accent})`,
        accent: `linear-gradient(135deg, ${accent}, ${accent}CC)`,
        background: `linear-gradient(135deg, ${baseBackground}, ${baseSurface})`,
        mesh: `radial-gradient(at 0% 0%, ${primary}1A, transparent 50%), radial-gradient(at 100% 100%, ${accent}1A, transparent 50%)`,
        subtle: `linear-gradient(180deg, ${baseSurface}, ${baseBackground})`,
        vibrant: `linear-gradient(45deg, ${accent}, ${primary})`,
      },
      animations: {
        fadeIn: 'fadeIn 0.5s ease-in',
        slideUp: 'slideUp 0.5s ease-out',
        scaleIn: 'scaleIn 0.3s ease-in-out',
        bounce: 'bounce 0.5s ease-in-out',
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
  // TOP 3 MOST AESTHETICALLY PLEASING THEMES

  // 1. Corporate Professional - Clean, trustworthy, universally appealing
  createTheme('corporate-blue', 'Corporate Professional', 'corporate', {
    primary: '#1E40AF',
    secondary: '#3B82F6',
    accent: '#F59E0B',
    background: '#FFFFFF',
    surface: '#F8FAFC',
  }),

  // 2. Modern Executive - Sophisticated dark theme with excellent contrast
  createTheme('executive-dark', 'Modern Executive', 'corporate', {
    primary: '#3B82F6',
    secondary: '#64748B',
    accent: '#10B981',
    background: '#1E293B',
    surface: '#334155',
    textPrimary: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
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
export function selectThemeForContent(content: string): ProfessionalTheme {
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
