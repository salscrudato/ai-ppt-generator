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
  // Core Professional Themes
  createTheme('corporate-blue', 'Corporate Professional', 'corporate', {
    primary: '#1E40AF',
    secondary: '#3B82F6',
    accent: '#F59E0B',
    background: '#FFFFFF',
    surface: '#F8FAFC',
  }),
  createTheme('creative-purple', 'Creative Studio', 'creative', {
    primary: '#7C3AED',
    secondary: '#A855F7',
    accent: '#EC4899',
    background: '#FEFBFF',
    surface: '#F3F0FF',
  }),
  createTheme('executive-dark', 'Executive Dark', 'corporate', {
    primary: '#3B82F6',
    secondary: '#64748B',
    accent: '#10B981',
    background: '#1E293B',
    surface: '#334155',
    textPrimary: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
  }),
  createTheme('finance-green', 'Financial Growth', 'finance', {
    primary: '#059669',
    secondary: '#10B981',
    accent: '#F59E0B',
    background: '#ECFDF5',
    surface: '#D1FAE5',
  }),
  createTheme('tech-gradient', 'Technology Forward', 'technology', {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#06B6D4',
    background: '#F8FAFC',
    surface: '#EFF6FF',
  }),

  // **Added** Themes referenced by selection logic
  createTheme('finance-navy', 'Finance Navy', 'finance', {
    primary: '#0B3954',
    secondary: '#1F7A8C',
    accent: '#F59E0B',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#64748B',
  }),
  createTheme('healthcare-teal', 'Healthcare Teal', 'healthcare', {
    primary: '#0F766E',
    secondary: '#14B8A6',
    accent: '#7DD3FC',
    background: '#F0FDFA',
    surface: '#CCFBF1',
    textPrimary: '#134E4A',
    textSecondary: '#115E59',
    textMuted: '#0F766E',
  }),
  createTheme('education-green', 'Education Green', 'academic', {
    primary: '#166534',
    secondary: '#22C55E',
    accent: '#84CC16',
    background: '#F0FDF4',
    surface: '#DCFCE7',
    textPrimary: '#14532D',
    textSecondary: '#166534',
    textMuted: '#15803D',
  }),
  createTheme('startup-orange', 'Startup Orange', 'startup', {
    primary: '#EA580C',
    secondary: '#FB923C',
    accent: '#22D3EE',
    background: '#FFF7ED',
    surface: '#FFEDD5',
    textPrimary: '#7C2D12',
    textSecondary: '#9A3412',
    textMuted: '#EA580C',
  }),
  createTheme('consulting-charcoal', 'Consulting Charcoal', 'consulting', {
    primary: '#111827',
    secondary: '#374151',
    accent: '#F59E0B',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    textPrimary: '#111827',
    textSecondary: '#374151',
    textMuted: '#6B7280',
  }),
  createTheme('marketing-magenta', 'Marketing Magenta', 'creative', {
    primary: '#BE185D',
    secondary: '#EC4899',
    accent: '#F59E0B',
    background: '#FFF1F2',
    surface: '#FCE7F3',
    textPrimary: '#831843',
    textSecondary: '#BE185D',
    textMuted: '#DB2777',
  }),
  createTheme('vibrant-eco', 'Vibrant Eco', 'natural', {
    primary: '#16A34A',
    secondary: '#22C55E',
    accent: '#10B981',
    background: '#F0FDF4',
    surface: '#DCFCE7',
    textPrimary: '#064E3B',
    textSecondary: '#065F46',
    textMuted: '#0F766E',
  }),

  // 2024 Modern Themes - ACCESSIBILITY FIXED
  createTheme(
    'peach-fuzz-2024',
    'Warm Harmony (Pantone 2024)',
    'vibrant',
    {
      primary: '#FFBE98', // Peach Fuzz inspired
      secondary: '#FFDAB9',
      accent: '#D97706', // Fixed: Better contrast ratio
      background: '#FFF8F5',
      surface: '#FFE8E0',
    },
    { scale: 'large', headingFont: MODERN_FONT_STACKS.modernSans },
    { enforceAccessibility: true } // Auto-fix accessibility issues
  ),

  // New Professional Themes for 2024
  createTheme(
    'midnight-professional',
    'Midnight Professional',
    'corporate',
    {
      primary: '#1E293B',
      secondary: '#334155',
      accent: '#3B82F6',
      background: '#0F172A',
      surface: '#1E293B',
      textPrimary: '#F8FAFC',
      textSecondary: '#CBD5E1',
      textMuted: '#94A3B8',
    },
    { headingFont: MODERN_FONT_STACKS.modernSans, scale: 'large' }
  ),

  createTheme(
    'emerald-growth',
    'Emerald Growth',
    'natural',
    {
      primary: '#059669',
      secondary: '#10B981',
      accent: '#F59E0B',
      background: '#ECFDF5',
      surface: '#D1FAE5',
    },
    { headingFont: MODERN_FONT_STACKS.modernSans, scale: 'normal' }
  ),

  createTheme(
    'royal-purple',
    'Royal Purple',
    'creative',
    {
      primary: '#6B21A8',
      secondary: '#8B5CF6',
      accent: '#F59E0B',
      background: '#FAF5FF',
      surface: '#F3E8FF',
    },
    { headingFont: MODERN_FONT_STACKS.elegantSerif, scale: 'large' }
  ),
  createTheme(
    'earth-luxe',
    'Luxe Earth Tones',
    'natural',
    {
      primary: '#8B4513',
      secondary: '#A0522D',
      accent: '#DAA520',
      background: '#FDF6E3',
      surface: '#F5E6D3',
      textPrimary: '#2F1B14',
      textSecondary: '#5D4037',
      textMuted: '#8D6E63',
    },
    { headingFont: MODERN_FONT_STACKS.elegantSerif, scale: 'normal' }
  ),
  createTheme(
    'ocean-breeze',
    'Ocean Breeze (2024)',
    'modern',
    {
      primary: '#0EA5E9',
      secondary: '#38BDF8',
      accent: '#0284C7', // Fixed: Better contrast
      background: '#F0F9FF',
      surface: '#E0F2FE',
    },
    { scale: 'normal' },
    { enforceAccessibility: true } // Auto-fix accessibility issues
  ),
  createTheme('sunset-gradient', 'Sunset Professional', 'vibrant', {
    primary: '#F97316',
    secondary: '#FB923C',
    accent: '#D97706', // Fixed: Better contrast
    background: '#FFF7ED',
    surface: '#FFEDD5',
  }, undefined, { enforceAccessibility: true }), // Auto-fix accessibility issues
  // Sophisticated Professional Themes
  createTheme(
    'platinum-elegance',
    'Platinum Elegance',
    'corporate',
    {
      primary: '#64748B',
      secondary: '#94A3B8',
      accent: '#F1F5F9',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      textPrimary: '#0F172A',
      textSecondary: '#334155',
      textMuted: '#64748B',
    },
    { headingFont: MODERN_FONT_STACKS.elegantSerif, scale: 'large' }
  ),
  createTheme('royal-authority', 'Royal Authority', 'corporate', {
    primary: '#581C87',
    secondary: '#7C3AED',
    accent: '#C4B5FD',
    background: '#FEFBFF',
    surface: '#F3F0FF',
    textPrimary: '#3C1361',
    textSecondary: '#581C87',
    textMuted: '#7C2D92',
  }),
  createTheme('crimson-power', 'Crimson Authority', 'corporate', {
    primary: '#DC2626',
    secondary: '#EF4444',
    accent: '#FCA5A5',
    background: '#FEF2F2',
    surface: '#FEE2E2',
    textPrimary: '#7F1D1D',
    textSecondary: '#991B1B',
    textMuted: '#B91C1C',
  }),

  // Creative & Startup Themes
  createTheme('neon-cyber', 'Cyber Innovation', 'startup', {
    primary: '#8B5CF6',
    secondary: '#A78BFA',
    accent: '#06FFA5',
    background: '#0F0F23',
    surface: '#1E1B4B',
    textPrimary: '#F8FAFC',
    textSecondary: '#E2E8F0',
    textMuted: '#CBD5E1',
  }),
  // Removed duplicate themes: work-sans-modern, ibm-plex-clean, dm-sans-elegant
  // These were too similar to consulting-charcoal theme
  createTheme('aurora-gradient', 'Aurora Professional', 'creative', {
    primary: '#EC4899',
    secondary: '#F472B6',
    accent: '#A855F7',
    background: '#FDF2F8',
    surface: '#FCE7F3',
    textPrimary: '#831843',
    textSecondary: '#BE185D',
    textMuted: '#DB2777',
  }),

  // Healthcare & Academic Themes
  createTheme('medical-trust', 'Medical Professional', 'healthcare', {
    primary: '#0369A1',
    secondary: '#0284C7',
    accent: '#7DD3FC',
    background: '#F0F9FF',
    surface: '#E0F2FE',
    textPrimary: '#0C4A6E',
    textSecondary: '#075985',
    textMuted: '#0284C7',
  }),
  createTheme(
    'academic-sage',
    'Academic Wisdom',
    'academic',
    {
      primary: '#374151',
      secondary: '#6B7280',
      accent: '#D1D5DB',
      background: '#F9FAFB',
      surface: '#F3F4F6',
      textPrimary: '#111827',
      textSecondary: '#1F2937',
      textMuted: '#4B5563',
    },
    { headingFont: MODERN_FONT_STACKS.elegantSerif }
  ),

  // Minimalist & Modern
  createTheme(
    'minimal-zen',
    'Zen Minimalism',
    'modern',
    {
      primary: '#000000',
      secondary: '#404040',
      accent: '#808080',
      background: '#FFFFFF',
      surface: '#FAFAFA',
      textPrimary: '#000000',
      textSecondary: '#333333',
      textMuted: '#666666',
    },
    { headingFont: MODERN_FONT_STACKS.variableSans, scale: 'compact' }
  ),
  createTheme('soft-pastels', 'Soft Professional', 'modern', {
    primary: '#A7C7E7',
    secondary: '#B8E6B8',
    accent: '#3B82F6', // Fixed: Better contrast
    background: '#F8F9FA',
    surface: '#F1F3F4',
  }, undefined, { enforceAccessibility: true }), // Auto-fix accessibility issues

  // Additional Professional Themes for Enhanced Variety
  createTheme('executive-platinum', 'Executive Platinum', 'corporate', {
    primary: '#2C3E50',
    secondary: '#34495E',
    accent: '#E74C3C',
    background: '#FFFFFF',
    surface: '#F7F9FC',
  }),
  createTheme('innovation-blue', 'Innovation Blue', 'technology', {
    primary: '#0066CC',
    secondary: '#4A90E2',
    accent: '#FF6B35',
    background: '#FFFFFF',
    surface: '#F0F7FF',
  }),
  createTheme('financial-green', 'Financial Growth', 'finance', {
    primary: '#2E7D32',
    secondary: '#4CAF50',
    accent: '#FFC107',
    background: '#FFFFFF',
    surface: '#F1F8E9',
  }),
  createTheme('consulting-elite', 'Consulting Elite', 'consulting', {
    primary: '#37474F',
    secondary: '#546E7A',
    accent: '#FF5722',
    background: '#FFFFFF',
    surface: '#FAFAFA',
  }),
  createTheme('healthcare-professional', 'Healthcare Professional', 'healthcare', {
    primary: '#00695C',
    secondary: '#26A69A',
    accent: '#FF9800',
    background: '#FFFFFF',
    surface: '#E0F2F1',
  }),

  // Enhanced 2025 Modern Themes with Advanced Design
  createTheme(
    'modern-gradient',
    'Modern Gradient',
    'modern',
    {
      primary: '#667EEA',
      secondary: '#764BA2',
      accent: '#F093FB',
      background: '#FFFFFF',
      surface: '#F8F9FF',
    },
    { headingFont: MODERN_FONT_STACKS.modernSans, scale: 'normal' },
    { enforceAccessibility: true, generateHarmonious: true }
  ),

  createTheme(
    'dark-professional',
    'Dark Professional',
    'modern',
    {
      primary: '#4F46E5',
      secondary: '#7C3AED',
      accent: '#06B6D4',
      background: '#0F172A',
      surface: '#1E293B',
      textPrimary: '#F8FAFC',
      textSecondary: '#CBD5E1',
      textMuted: '#94A3B8',
    },
    { headingFont: MODERN_FONT_STACKS.modernSans, scale: 'large' },
    { enforceAccessibility: true }
  ),

  createTheme(
    'warm-professional',
    'Warm Professional',
    'modern',
    {
      primary: '#DC2626',
      secondary: '#F59E0B',
      accent: '#10B981',
      background: '#FFFBF5',
      surface: '#FEF3E2',
    },
    { headingFont: MODERN_FONT_STACKS.elegantSerif, scale: 'normal' },
    { enforceAccessibility: true, generateHarmonious: true }
  ),

  createTheme(
    'cool-minimal',
    'Cool Minimal',
    'modern',
    {
      primary: '#0F766E',
      secondary: '#14B8A6',
      accent: '#F59E0B',
      background: '#FFFFFF',
      surface: '#F0FDFA',
    },
    { headingFont: MODERN_FONT_STACKS.variableSans, scale: 'compact' },
    { enforceAccessibility: true }
  ),

  createTheme(
    'luxury-gold',
    'Luxury Gold',
    'corporate',
    {
      primary: '#92400E',
      secondary: '#D97706',
      accent: '#FCD34D',
      background: '#FFFBEB',
      surface: '#FEF3C7',
      textPrimary: '#451A03',
      textSecondary: '#92400E',
      textMuted: '#A16207',
    },
    { headingFont: MODERN_FONT_STACKS.elegantSerif, scale: 'large' },
    { enforceAccessibility: true }
  ),

  createTheme(
    'tech-neon',
    'Tech Neon',
    'technology',
    {
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      accent: '#00D9FF',
      background: '#0A0A0F',
      surface: '#1A1A2E',
      textPrimary: '#F8FAFC',
      textSecondary: '#E2E8F0',
      textMuted: '#CBD5E1',
    },
    { headingFont: MODERN_FONT_STACKS.techSans, scale: 'normal' },
    { enforceAccessibility: true }
  ),
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
export function getThemeRecommendations(params: {
  industry?: string;
  tone?: string;
  presentationType?: string;
}): ProfessionalTheme[] {
  const picks: string[] = [];

  if (params.industry) {
    const m: Record<string, string> = {
      healthcare: 'healthcare-teal',
      finance: 'finance-navy',
      technology: 'tech-gradient',
      education: 'education-green',
      startup: 'startup-orange',
      consulting: 'consulting-charcoal',
      marketing: 'marketing-magenta',
      eco: 'vibrant-eco',
    };
    if (m[params.industry]) picks.push(m[params.industry]);
  }

  if (params.presentationType === 'report' || params.presentationType === 'analysis')
    picks.push('finance-navy');
  if (params.presentationType === 'pitch' || params.presentationType === 'strategy')
    picks.push('startup-orange');

  if (params.tone === 'professional' || params.tone === 'authoritative')
    picks.push('platinum-elegance');
  if (params.tone === 'creative' || params.tone === 'inspiring')
    picks.push('aurora-gradient');

  // ensure uniqueness
  const unique = Array.from(new Set(picks));
  return unique.map(getThemeById).slice(0, 3);
}

/**
 * Create an accessibility-compliant theme with automatic color adjustments
 */
export function createAccessibleTheme(
  id: string,
  name: string,
  category: ProfessionalTheme['category'],
  baseColors: {
    primary: string;
    secondary?: string;
    accent?: string;
    background?: string;
  }
): ProfessionalTheme {
  const palette = generateHarmoniousPalette(baseColors.primary);

  return createTheme(
    id,
    name,
    category,
    {
      primary: baseColors.primary,
      secondary: baseColors.secondary || palette.analogous[0],
      accent: baseColors.accent || palette.complementary,
      background: baseColors.background || '#FFFFFF'
    },
    undefined,
    {
      enforceAccessibility: true,
      generateHarmonious: !baseColors.secondary || !baseColors.accent
    }
  );
}

/**
 * Enhanced dynamic theme selection based on content and audience.
 * Prefers explicit industry matches; otherwise picks by tone/type; falls back to default.
 * Now includes accessibility and content-type considerations.
 */
export function selectThemeForContent(params: {
  audience?: string;
  industry?: string;
  presentationType?: string;
  tone?: string;
  isDataHeavy?: boolean;
  isCreative?: boolean;
  requireAccessibility?: boolean;
  contentComplexity?: 'simple' | 'moderate' | 'complex';
}): ProfessionalTheme {
  // Accessibility-first selection if required
  if (params.requireAccessibility) {
    const accessibleThemes = PROFESSIONAL_THEMES.filter(theme => {
      const validation = validateThemeAccessibility(theme);
      return validation.wcagLevel === 'AA' || validation.wcagLevel === 'AAA';
    });

    if (accessibleThemes.length > 0) {
      // Select from accessible themes based on other criteria
      if (params.isDataHeavy) {
        const dataTheme = accessibleThemes.find(t => t.category === 'finance' || t.id === 'corporate-blue');
        if (dataTheme) return dataTheme;
      }
      if (params.isCreative) {
        const creativeTheme = accessibleThemes.find(t => t.category === 'creative');
        if (creativeTheme) return creativeTheme;
      }
      return accessibleThemes[0];
    }
  }

  if (params.isDataHeavy) return getThemeById('finance-navy');
  if (params.isCreative) return getThemeById('creative-purple');

  if (params.industry) {
    const industryMap: Record<string, string> = {
      healthcare: 'healthcare-teal',
      finance: 'finance-navy',
      technology: 'tech-gradient',
      education: 'education-green',
      startup: 'startup-orange',
      consulting: 'consulting-charcoal',
      marketing: 'marketing-magenta',
      eco: 'vibrant-eco',
    };
    const id = industryMap[params.industry];
    if (id) return getThemeById(id);
  }

  if (params.audience === 'executives') return getThemeById('platinum-elegance');

  if (params.presentationType === 'report' || params.presentationType === 'analysis')
    return getThemeById('finance-navy');
  if (params.presentationType === 'pitch' || params.presentationType === 'strategy')
    return getThemeById('startup-orange');

  if (params.tone === 'authoritative' || params.tone === 'confident')
    return getThemeById('corporate-blue');
  if (params.tone === 'inspiring' || params.tone === 'creative')
    return getThemeById('aurora-gradient');

  return getDefaultTheme();
}

/**
 * Customize theme with brand colors and validate changes.
 * Returns the customized theme (non-destructive).
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
  const customized: ProfessionalTheme = {
    ...baseTheme,
    id: `${baseTheme.id}-custom`,
    name: `${baseTheme.name} (Custom)`,
    colors: {
      ...baseTheme.colors,
      ...(customization.primary && { primary: normalizeHex(customization.primary) }),
      ...(customization.secondary && {
        secondary: normalizeHex(customization.secondary),
      }),
      ...(customization.accent && { accent: normalizeHex(customization.accent) }),
    },
    typography: {
      ...baseTheme.typography,
      headings: {
        ...baseTheme.typography.headings,
        ...(customization.fontFamily && { fontFamily: customization.fontFamily }),
      },
      body: {
        ...baseTheme.typography.body,
        ...(customization.fontFamily && { fontFamily: customization.fontFamily }),
      },
    },
  };

  const validation = validateThemeAccessibility(customized);
  if (!validation.isAccessible) {
    // Non-fatal: warn in logs so callers can choose to adjust
    console.warn('Custom theme may have accessibility issues:', validation.issues);
  }

  return customized;
}

/**
 * Enhanced theme accessibility validation with comprehensive WCAG compliance
 * - Checks body text vs background (>= 4.5:1)
 * - Checks inverse text vs primary (>= 3:1 assumption for large type/hero)
 * - Flags low-contrast secondary text as a suggestion
 * - Validates accent colors and semantic colors
 * - Provides detailed contrast ratios and improvement suggestions
 */
export function validateThemeAccessibility(theme: ProfessionalTheme): {
  isAccessible: boolean;
  issues: string[];
  suggestions: string[];
  contrastRatios: Record<string, number>;
  wcagLevel: 'AAA' | 'AA' | 'A' | 'FAIL';
} {
  const issues: string[] = [];
  const suggestions: string[] = [];
  const contrastRatios: Record<string, number> = {};

  // Enhanced contrast ratio calculation using the new function
  const bodyContrast = calculateContrastRatio(
    theme.colors.text.primary,
    theme.colors.background
  );
  contrastRatios.bodyText = bodyContrast;

  if (bodyContrast < 4.5) {
    issues.push(
      `Body text contrast ${bodyContrast.toFixed(
        2
      )}:1 is below WCAG AA (4.5:1).`
    );
    suggestions.push('Increase contrast between primary text and background colors');
  }

  const secondaryContrast = calculateContrastRatio(
    theme.colors.text.secondary,
    theme.colors.background
  );
  contrastRatios.secondaryText = secondaryContrast;

  if (secondaryContrast < 3.0) {
    suggestions.push(
      `Secondary text contrast ${secondaryContrast.toFixed(
        2
      )}:1 may be low; consider darkening.`
    );
  }

  const inverseOnPrimary = calculateContrastRatio(
    theme.colors.text.inverse,
    theme.colors.primary
  );
  contrastRatios.inverseText = inverseOnPrimary;

  if (inverseOnPrimary < 3.0) {
    suggestions.push(
      `Inverse text on primary is ${inverseOnPrimary.toFixed(
        2
      )}:1; consider a lighter primary or different inverse.`
    );
  }

  // Check accent color contrast
  const accentContrast = calculateContrastRatio(theme.colors.accent, theme.colors.background);
  contrastRatios.accent = accentContrast;

  if (accentContrast < 3.0) {
    suggestions.push(
      `Accent color contrast ${accentContrast.toFixed(2)}:1 may be insufficient for emphasis elements.`
    );
  }

  // Check semantic colors
  const semanticColors = ['success', 'warning', 'error', 'info'] as const;
  semanticColors.forEach(colorType => {
    const semanticContrast = calculateContrastRatio(
      theme.colors.semantic[colorType],
      theme.colors.background
    );
    contrastRatios[`semantic_${colorType}`] = semanticContrast;

    if (semanticContrast < 3.0) {
      suggestions.push(
        `${colorType} color contrast ${semanticContrast.toFixed(2)}:1 may be too low for status indicators.`
      );
    }
  });

  // Determine WCAG compliance level
  const minContrast = Math.min(bodyContrast, secondaryContrast, inverseOnPrimary);
  let wcagLevel: 'AAA' | 'AA' | 'A' | 'FAIL';

  if (minContrast >= 7.0) {
    wcagLevel = 'AAA';
  } else if (minContrast >= 4.5) {
    wcagLevel = 'AA';
  } else if (minContrast >= 3.0) {
    wcagLevel = 'A';
  } else {
    wcagLevel = 'FAIL';
  }

  return {
    isAccessible: issues.length === 0 && wcagLevel !== 'FAIL',
    issues,
    suggestions,
    contrastRatios,
    wcagLevel
  };
}

/**
 * Generate a harmonious palette from a primary color.
 * Secondary = analogous (+30°); Accent = complementary (+180°), with slight lightness tweaks.
 */
export function generateColorPalette(primary: string): {
  primary: string;
  secondary: string;
  accent: string;
} {
  const p = normalizeHex(primary);
  const secondary = rotateHue(p, 30);
  const accent = rotateHue(p, 180);
  // Slight adjustments for better separation
  const secondaryAdj = adjustLightness(secondary, -0.03);
  const accentAdj = adjustLightness(accent, 0.02);
  return { primary: p, secondary: secondaryAdj, accent: accentAdj };
}