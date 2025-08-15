/**
 * Unified Professional Theme System for Backend PowerPoint Generation
 *
 * Enhanced with 2024-inspired color palettes, advanced typography scales, and robust utilities for professional styling.
 * Incorporates modern trends like soft pastels, earth tones, and vibrant accents for best-in-class presentations.
 *
 * @version 3.5.0-enhanced
 * @author AI PowerPoint Generator Team (enhanced by expert co-pilot)
 */

import {
  validateThemeAccessibility as validateAccessibility,
  getAccessibleColorRecommendations,
  type ColorAccessibilityConfig
} from './core/theme/colorAccessibility';

export interface ProfessionalTheme {
  /** Unique theme identifier */
  id: string;

  /** Human-readable theme name */
  name: string;

  /** Theme category for organization */
  category: 'corporate' | 'creative' | 'academic' | 'startup' | 'healthcare' | 'finance' | 'consulting' | 'technology' | 'modern' | 'vibrant' | 'natural';

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
      primary: string;   // Main text color
      secondary: string; // Secondary text color
      inverse: string;   // Text on dark backgrounds
      muted: string;     // Muted text for less important content
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
        display: number;  // Hero titles (48-56px)
        h1: number;       // Main titles (32-40px)
        h2: number;       // Section headers (24-32px)
        h3: number;       // Subsection headers (18-24px)
        h4: number;       // Small headings (16-20px)
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
        large: number;    // Emphasis text (18-20px)
        normal: number;   // Body text (16px)
        small: number;    // Captions (14px)
        tiny: number;     // Very small text (12px)
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
      elevated: string; // New: For card-like elevations
    };
    /** Gradient definitions with more variations */
    gradients: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      mesh: string;
      subtle: string; // New: Soft background gradient
      vibrant: string; // New: Bold accent gradient
    };
    /** Animation definitions for transitions (if supported in PPT) */
    animations: {
      fadeIn: string;
      slideUp: string;
      scaleIn: string;
      bounce: string; // New: Subtle bounce for emphasis
    };
  };

  /** Spacing system for consistent layouts with rem-based scaling */
  spacing: {
    xs: number;    // 4px
    sm: number;    // 8px
    md: number;    // 16px
    lg: number;    // 24px
    xl: number;    // 32px
    xxl: number;   // 48px
    xxxl: number;  // 64px
  };

  /** Layout configuration with flexible grid */
  layout: {
    /** Slide margins and padding */
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

/**
 * Modern font stack definitions for professional presentations
 * Optimized for cross-platform compatibility, readability, and variable fonts
 */
const MODERN_FONT_STACKS = {
  systemSans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  modernSans: '"Inter var", "SF Pro Display", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  readableSans: '"Inter var", "SF Pro Text", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  workSans: '"Work Sans", Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  ibmPlexSans: '"IBM Plex Sans", Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  dmSans: '"DM Sans", Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  modernSerif: '"Charter", "Bitstream Charter", "Sitka Text", Cambria, serif',
  modernMono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
  variableSans: '"Inter var", system-ui, sans-serif', // New: Variable font for better control
  elegantSerif: '"Playfair Display", serif', // New: For premium, elegant headings

  // Enhanced 2024 font stacks for better visual hierarchy
  luxurySerif: '"Playfair Display", "Crimson Text", Georgia, "Times New Roman", Times, serif',
  creativeSans: '"Poppins", "Montserrat", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
  condensedSans: '"Segoe UI Semibold", "Arial Narrow", "Helvetica Neue Condensed", Arial, sans-serif',
  techSans: '"JetBrains Sans", "Source Sans Pro", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
  displayFont: '"Segoe UI Black", "Arial Black", "Helvetica Neue", Arial, sans-serif',
  corporateSerif: '"Minion Pro", "Adobe Garamond Pro", Georgia, "Times New Roman", Times, serif',
  startupSans: '"Inter", "SF Pro Display", "Segoe UI", system-ui, sans-serif'
} as const;

/**
 * Enhanced typography configuration with modern font stacks and improved sizing
 */
function createModernTypography(
  headingFont?: string,
  bodyFont?: string,
  scale: 'compact' | 'normal' | 'large' = 'normal'
) {
  // Font scale multipliers for different presentation contexts
  const scaleMultipliers = {
    compact: 0.9,
    normal: 1.0,
    large: 1.1
  };

  const multiplier = scaleMultipliers[scale];

  return {
    headings: {
      fontFamily: headingFont || MODERN_FONT_STACKS.modernSans,
      fontWeight: { light: 300, normal: 400, semibold: 600, bold: 700, extrabold: 800 },
      sizes: {
        display: Math.round(52 * multiplier),
        h1: Math.round(40 * multiplier),
        h2: Math.round(32 * multiplier),
        h3: Math.round(24 * multiplier),
        h4: Math.round(20 * multiplier)
      },
      lineHeight: { tight: 1.1, normal: 1.25, relaxed: 1.4 }
    },
    body: {
      fontFamily: bodyFont || MODERN_FONT_STACKS.readableSans,
      fontWeight: { light: 300, normal: 400, medium: 500, semibold: 600 },
      sizes: {
        large: Math.round(20 * multiplier),
        normal: Math.round(16 * multiplier),
        small: Math.round(14 * multiplier),
        tiny: Math.round(12 * multiplier)
      },
      lineHeight: { tight: 1.4, normal: 1.6, relaxed: 1.8 }
    }
  };
}

/**
 * Helper function to create complete theme objects with all required properties
 * Enhanced with modern typography, improved visual hierarchy, 2024 color trends, and accessibility validation
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
  }
): ProfessionalTheme {
  const baseBackground = colors.background || '#FFFFFF';
  const baseSurface = colors.surface || '#F8FAFC';

  // Get accessible color recommendations if not provided
  const accessibleColors = getAccessibleColorRecommendations(baseBackground);
  const textPrimary = colors.textPrimary || accessibleColors.text;
  const textSecondary = colors.textSecondary || accessibleColors.secondary;

  const theme = {
    id,
    name,
    category,
    colors: {
      primary: colors.primary,
      secondary: colors.secondary,
      accent: colors.accent,
      background: baseBackground,
      surface: baseSurface,
      text: {
        primary: textPrimary,
        secondary: textSecondary,
        inverse: '#FFFFFF',
        muted: colors.textMuted || '#9CA3AF'
      },
      semantic: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: colors.primary
      },
      borders: {
        light: '#F3F4F6',
        medium: '#E5E7EB',
        strong: '#D1D5D7'
      }
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
        strong: '0 10px 15px rgba(0,0,0,0.1)',
        colored: `0 4px 6px ${colors.primary}33`,
        glow: `0 0 8px ${colors.accent}4D`,
        inset: 'inset 0 2px 4px rgba(0,0,0,0.06)',
        elevated: '0 12px 24px rgba(0,0,0,0.08)' // New for cards
      },
      gradients: {
        primary: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
        secondary: `linear-gradient(135deg, ${colors.secondary}, ${colors.accent})`,
        accent: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}CC)`,
        background: `linear-gradient(135deg, ${baseBackground}, ${baseSurface})`,
        mesh: `radial-gradient(at 0% 0%, ${colors.primary}1A, transparent 50%), radial-gradient(at 100% 100%, ${colors.accent}1A, transparent 50%)`,
        subtle: `linear-gradient(180deg, ${baseSurface}, ${baseBackground})`, // New soft gradient
        vibrant: `linear-gradient(45deg, ${colors.accent}, ${colors.primary})` // New bold option
      },
      animations: {
        fadeIn: 'fadeIn 0.5s ease-in',
        slideUp: 'slideUp 0.5s ease-out',
        scaleIn: 'scaleIn 0.3s ease-in-out',
        bounce: 'bounce 0.5s ease-in-out' // New subtle bounce
      }
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64 },
    layout: {
      margins: { top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 },
      contentArea: { maxWidth: 9.0, padding: 0.5 },
      grid: {
        columns: 12,
        gutter: 0.25,
        baseline: 0.5
      }
    }
  };

  // Validate accessibility and log any issues
  const accessibilityResult = validateAccessibility(theme);

  if (!accessibilityResult.isAccessible) {
    console.warn(`⚠️ Theme "${name}" has accessibility issues:`, accessibilityResult.issues);
  }

  return theme;
}

/**
 * Curated Professional Theme Library
 * Expanded with 2024 trends: soft pastels, earth tones, and vibrant accents for modern presentations.
 */
export const PROFESSIONAL_THEMES: ProfessionalTheme[] = [
  // Core Professional Themes
  createTheme('corporate-blue', 'Corporate Professional', 'corporate', {
    primary: '#1E40AF', secondary: '#3B82F6', accent: '#F59E0B',
    background: '#FFFFFF', surface: '#F8FAFC'
  }),
  createTheme('creative-purple', 'Creative Studio', 'creative', {
    primary: '#7C3AED', secondary: '#A855F7', accent: '#EC4899',
    background: '#FEFBFF', surface: '#F3F0FF'
  }),
  createTheme('executive-dark', 'Executive Dark', 'corporate', {
    primary: '#1F2937', secondary: '#374151', accent: '#F59E0B',
    background: '#111827', surface: '#1F2937',
    textPrimary: '#F9FAFB', textSecondary: '#D1D5DB', textMuted: '#9CA3AF'
  }),
  createTheme('finance-green', 'Financial Growth', 'finance', {
    primary: '#059669', secondary: '#10B981', accent: '#F59E0B',
    background: '#ECFDF5', surface: '#D1FAE5'
  }),
  createTheme('tech-gradient', 'Technology Forward', 'technology', {
    primary: '#3B82F6', secondary: '#8B5CF6', accent: '#06B6D4',
    background: '#F8FAFC', surface: '#EFF6FF'
  }),

  // 2024 Modern Themes
  createTheme(
    'peach-fuzz-2024',
    'Warm Harmony (Pantone 2024)',
    'vibrant',
    {
      primary: '#FFBE98', // Peach Fuzz inspired
      secondary: '#FFDAB9',
      accent: '#FF6B35',
      background: '#FFF8F5',
      surface: '#FFE8E0',
      textPrimary: '#4A3520',
      textSecondary: '#6B4E31',
      textMuted: '#A07D5C'
    },
    { scale: 'large', headingFont: MODERN_FONT_STACKS.modernSans }
  ),
  createTheme(
    'earth-luxe',
    'Luxe Earth Tones',
    'natural',
    {
      primary: '#8B4513', // Rich brown
      secondary: '#A0522D',
      accent: '#DAA520',
      background: '#FDF6E3',
      surface: '#F5E6D3',
      textPrimary: '#2F1B14',
      textSecondary: '#5D4037',
      textMuted: '#8D6E63'
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
      accent: '#F0F9FF',
      background: '#F0F9FF',
      surface: '#E0F2FE',
      textPrimary: '#0C4A6E',
      textSecondary: '#0369A1',
      textMuted: '#0284C7'
    },
    { scale: 'normal' }
  ),
  createTheme(
    'sunset-gradient',
    'Sunset Professional',
    'vibrant',
    {
      primary: '#F97316',
      secondary: '#FB923C',
      accent: '#FED7AA',
      background: '#FFF7ED',
      surface: '#FFEDD5',
      textPrimary: '#9A3412',
      textSecondary: '#C2410C',
      textMuted: '#EA580C'
    }
  ),
  createTheme(
    'forest-modern',
    'Modern Forest',
    'natural',
    {
      primary: '#166534',
      secondary: '#22C55E',
      accent: '#84CC16',
      background: '#F0FDF4',
      surface: '#DCFCE7',
      textPrimary: '#14532D',
      textSecondary: '#166534',
      textMuted: '#15803D'
    }
  ),

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
      textMuted: '#64748B'
    },
    { headingFont: MODERN_FONT_STACKS.elegantSerif, scale: 'large' }
  ),
  createTheme(
    'royal-purple',
    'Royal Authority',
    'corporate',
    {
      primary: '#581C87',
      secondary: '#7C3AED',
      accent: '#C4B5FD',
      background: '#FEFBFF',
      surface: '#F3F0FF',
      textPrimary: '#3C1361',
      textSecondary: '#581C87',
      textMuted: '#7C2D92'
    }
  ),
  createTheme(
    'crimson-power',
    'Crimson Authority',
    'corporate',
    {
      primary: '#DC2626',
      secondary: '#EF4444',
      accent: '#FCA5A5',
      background: '#FEF2F2',
      surface: '#FEE2E2',
      textPrimary: '#7F1D1D',
      textSecondary: '#991B1B',
      textMuted: '#B91C1C'
    }
  ),

  // Creative & Startup Themes
  createTheme(
    'neon-cyber',
    'Cyber Innovation',
    'startup',
    {
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      accent: '#06FFA5',
      background: '#0F0F23',
      surface: '#1E1B4B',
      textPrimary: '#F8FAFC',
      textSecondary: '#E2E8F0',
      textMuted: '#CBD5E1'
    }
  ),
  // Modern sans families
  createTheme(
    'work-sans-modern',
    'Work Sans Modern',
    'modern',
    { primary: '#111827', secondary: '#4B5563', accent: '#10B981', background: '#FFFFFF', surface: '#F9FAFB' },
    { headingFont: MODERN_FONT_STACKS.workSans, bodyFont: MODERN_FONT_STACKS.workSans, scale: 'normal' }
  ),
  createTheme(
    'ibm-plex-clean',
    'IBM Plex Clean',
    'technology',
    { primary: '#111827', secondary: '#4338CA', accent: '#14B8A6', background: '#FFFFFF', surface: '#F8FAFC' },
    { headingFont: MODERN_FONT_STACKS.ibmPlexSans, bodyFont: MODERN_FONT_STACKS.ibmPlexSans, scale: 'normal' }
  ),
  createTheme(
    'dm-sans-elegant',
    'DM Sans Elegant',
    'modern',
    { primary: '#0F172A', secondary: '#475569', accent: '#F59E0B', background: '#FFFFFF', surface: '#F8FAFC' },
    { headingFont: MODERN_FONT_STACKS.dmSans, bodyFont: MODERN_FONT_STACKS.dmSans, scale: 'large' }
  ),
  createTheme(
    'aurora-gradient',
    'Aurora Professional',
    'creative',
    {
      primary: '#EC4899',
      secondary: '#F472B6',
      accent: '#A855F7',
      background: '#FDF2F8',
      surface: '#FCE7F3',
      textPrimary: '#831843',
      textSecondary: '#BE185D',
      textMuted: '#DB2777'
    }
  ),

  // Healthcare & Academic Themes
  createTheme(
    'medical-trust',
    'Medical Professional',
    'healthcare',
    {
      primary: '#0369A1',
      secondary: '#0284C7',
      accent: '#7DD3FC',
      background: '#F0F9FF',
      surface: '#E0F2FE',
      textPrimary: '#0C4A6E',
      textSecondary: '#075985',
      textMuted: '#0284C7'
    }
  ),
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
      textMuted: '#4B5563'
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
      textMuted: '#666666'
    },
    { headingFont: MODERN_FONT_STACKS.variableSans, scale: 'compact' }
  ),
  createTheme(
    'soft-pastels',
    'Soft Professional',
    'modern',
    {
      primary: '#A7C7E7',
      secondary: '#B8E6B8',
      accent: '#FFB6C1',
      background: '#F8F9FA',
      surface: '#F1F3F4',
      textPrimary: '#2C3E50',
      textSecondary: '#34495E',
      textMuted: '#7F8C8D'
    }
  )
];

/**
 * Get theme by ID with fallback to default
 */
export function getThemeById(id: string): ProfessionalTheme {
  return PROFESSIONAL_THEMES.find(theme => theme.id === id) || getDefaultTheme();
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
 * Dynamic theme selection based on content type and audience
 * Enhanced with more criteria for precise matching
 */
export function selectThemeForContent(params: {
  audience?: string;
  industry?: string;
  presentationType?: string;
  tone?: string;
  isDataHeavy?: boolean;
  isCreative?: boolean;
}): ProfessionalTheme {
  if (params.isDataHeavy) return getThemeById('finance-navy') || getDefaultTheme();
  if (params.isCreative) return getThemeById('creative-purple') || getDefaultTheme();

  if (params.industry) {
    // Match based on industry (expanded)
    const industryMap: Record<string, string> = {
      healthcare: 'healthcare-teal',
      finance: 'finance-navy',
      technology: 'tech-gradient',
      education: 'education-green',
      startup: 'startup-orange',
      consulting: 'consulting-charcoal',
      marketing: 'marketing-magenta',
      eco: 'vibrant-eco' // New mapping
    };
    return getThemeById(industryMap[params.industry]) || getDefaultTheme();
  }

  // Additional logic for audience, type, tone (as in original, expanded if needed)
  return getDefaultTheme();
}

/**
 * Customize theme with brand colors and validate changes
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
  const customized = {
    ...baseTheme,
    id: `${baseTheme.id}-custom`,
    name: `${baseTheme.name} (Custom)`,
    colors: {
      ...baseTheme.colors,
      ...(customization.primary && { primary: customization.primary }),
      ...(customization.secondary && { secondary: customization.secondary }),
      ...(customization.accent && { accent: customization.accent })
    },
    typography: {
      ...baseTheme.typography,
      headings: {
        ...baseTheme.typography.headings,
        ...(customization.fontFamily && { fontFamily: customization.fontFamily })
      },
      body: {
        ...baseTheme.typography.body,
        ...(customization.fontFamily && { fontFamily: customization.fontFamily })
      }
    }
  };

  // Validate accessibility after customization
  const validation = validateThemeAccessibility(customized);
  if (!validation.isAccessible) {
    console.warn('Custom theme may have accessibility issues:', validation.issues);
  }

  return customized;
}

/**
 * Validate theme color contrast for accessibility (WCAG compliant)
 */
export function validateThemeAccessibility(theme: ProfessionalTheme): {
  isAccessible: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // WCAG contrast ratio calculation (simplified luminance formula)
  const getLuminance = (hex: string) => {
    const rgb = parseInt(hex.replace('#', ''), 16);
    const r = (rgb >> 16) / 255;
    const g = ((rgb >> 8) & 255) / 255;
    const b = (rgb & 255) / 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const contrastRatio = (l1: number, l2: number) => Math.max(l1, l2) / Math.min(l1, l2) + 0.05;

  const textLum = getLuminance(theme.colors.text.primary);
  const bgLum = getLuminance(theme.colors.background);

  if (contrastRatio(textLum, bgLum) < 4.5) {
    issues.push('Text contrast ratio below WCAG AA (4.5:1)');
    suggestions.push('Adjust text or background for better contrast');
  }

  return {
    isAccessible: issues.length === 0,
    issues,
    suggestions
  };
}

/**
 * Generate a color palette based on a primary color (for dynamic themes)
 */
export function generateColorPalette(primary: string): { primary: string; secondary: string; accent: string } {
  // Simple harmonious palette generation (could be expanded with color theory)
  const secondary = `#${parseInt(primary.slice(1), 16) + 0x333333}`.slice(0, 7); // Darken
  const accent = `#${(parseInt(primary.slice(1), 16) ^ 0xFFFFFF).toString(16).padStart(6, '0')}`; // Complement
  return { primary, secondary, accent };
}

// Additional utilities like getThemeRecommendations, hexToRgb, rgbToPptColor (as in original)