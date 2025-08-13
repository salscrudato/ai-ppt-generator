/**
 * Unified Professional Theme System for Backend PowerPoint Generation
 *
 * Enhanced with gradient support and improved color utilities for professional styling.
 *
 * @version 3.2.0-enhanced
 * @author AI PowerPoint Generator Team (enhanced by expert co-pilot)
 */

export interface ProfessionalTheme {
  /** Unique theme identifier */
  id: string;

  /** Human-readable theme name */
  name: string;

  /** Theme category for organization */
  category: 'corporate' | 'creative' | 'academic' | 'startup' | 'healthcare' | 'finance' | 'consulting' | 'technology';

  /** Enhanced color palette optimized for PowerPoint generation */
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

  /** Enhanced typography settings for PowerPoint fonts */
  typography: {
    headings: {
      fontFamily: string; // PowerPoint-compatible font
      fontWeight: {
        light: number;
        normal: number;
        semibold: number;
        bold: number;
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

  /** Visual effects and styling */
  effects: {
    /** Border radius values */
    borderRadius: {
      small: number;
      medium: number;
      large: number;
      full: number;
    };
    /** Shadow definitions */
    shadows: {
      subtle: string;
      medium: string;
      strong: string;
      colored: string;
      glow: string;
      inset: string;
    };
    /** Gradient definitions */
    gradients: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      mesh: string;
    };
    /** Animation definitions */
    animations: {
      fadeIn: string;
      slideUp: string;
      scaleIn: string;
    };
  };

  /** Spacing system for consistent layouts */
  spacing: {
    xs: number;    // 4px
    sm: number;    // 8px
    md: number;    // 16px
    lg: number;    // 24px
    xl: number;    // 32px
    xxl: number;   // 48px
    xxxl: number;  // 64px
  };

  /** Layout configuration */
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
 * Optimized for cross-platform compatibility and readability
 */
const MODERN_FONT_STACKS = {
  // Professional system fonts with excellent readability
  systemSans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',

  // Modern geometric sans-serif for headings
  modernSans: '"Inter", "SF Pro Display", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',

  // Clean, readable fonts for body text
  readableSans: '"Inter", "SF Pro Text", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',

  // Professional serif for formal presentations
  modernSerif: '"Charter", "Bitstream Charter", "Sitka Text", Cambria, serif',

  // Monospace for code and technical content
  modernMono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace'
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
        normal: Math.round(18 * multiplier),
        small: Math.round(16 * multiplier),
        tiny: Math.round(14 * multiplier)
      },
      lineHeight: { tight: 1.4, normal: 1.6, relaxed: 1.8 }
    }
  };
}

/**
 * Helper function to create complete theme objects with all required properties
 * Enhanced with modern typography and improved visual hierarchy
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
  return {
    id,
    name,
    category,
    colors: {
      primary: colors.primary,
      secondary: colors.secondary,
      accent: colors.accent,
      background: colors.background || '#FFFFFF',
      surface: colors.surface || '#F8FAFC',
      text: {
        primary: colors.textPrimary || '#1F2937',
        secondary: colors.textSecondary || '#6B7280',
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
        strong: '#D1D5DB'
      }
    },
    typography: createModernTypography(
      typography?.headingFont,
      typography?.bodyFont,
      typography?.scale || 'normal'
    ),
    effects: {
      borderRadius: { small: 6, medium: 12, large: 20, full: 9999 },
      shadows: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        medium: '0 4px 12px -2px rgba(0, 0, 0, 0.12), 0 4px 8px -2px rgba(0, 0, 0, 0.08)',
        strong: '0 12px 24px -4px rgba(0, 0, 0, 0.12), 0 8px 16px -4px rgba(0, 0, 0, 0.08)',
        colored: `0 8px 25px -5px ${colors.primary}40, 0 4px 12px -2px ${colors.primary}20`,
        glow: `0 0 20px ${colors.primary}30, 0 0 40px ${colors.primary}20`,
        inset: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
      },
      gradients: {
        primary: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
        secondary: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.accent} 100%)`,
        accent: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accent}CC 100%)`,
        background: `linear-gradient(135deg, ${colors.background || '#FFFFFF'} 0%, ${colors.surface || '#F8FAFC'} 100%)`,
        mesh: `radial-gradient(circle at 20% 80%, ${colors.primary}12 0%, transparent 50%),
               radial-gradient(circle at 80% 20%, ${colors.secondary}12 0%, transparent 50%),
               radial-gradient(circle at 40% 40%, ${colors.accent}08 0%, transparent 50%)`
      },
      animations: {
        fadeIn: 'fadeIn 0.6s ease-out',
        slideUp: 'slideUp 0.8s ease-out',
        scaleIn: 'scaleIn 0.5s ease-out'
      }
    },
    spacing: { xs: 6, sm: 12, md: 20, lg: 32, xl: 48, xxl: 64, xxxl: 96 },
    layout: {
      margins: { top: 0.6, bottom: 0.6, left: 0.7, right: 0.7 },
      contentArea: { maxWidth: 8.6, padding: 0.7 },
      grid: {
        columns: 12,
        gutter: 0.2,
        baseline: 0.25
      }
    }
  };
}

/**
 * Curated Professional Theme Library
 *
 * Optimized collection of professional themes designed for maximum impact
 * and broad compatibility with PowerPoint, Keynote, and Google Slides.
 * Each theme is carefully crafted for specific use cases and audiences.
 */
export const PROFESSIONAL_THEMES: ProfessionalTheme[] = [
  createTheme(
    'corporate-blue',
    'Corporate Professional',
    'corporate',
    {
      primary: '#1E40AF',
      secondary: '#3B82F6',
      accent: '#F59E0B',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      textPrimary: '#1F2937',
      textSecondary: '#6B7280',
      textMuted: '#9CA3AF'
    },
    {
      headingFont: MODERN_FONT_STACKS.modernSans,
      bodyFont: MODERN_FONT_STACKS.readableSans,
      scale: 'normal'
    }
  ),
  createTheme(
    'creative-purple',
    'Creative Studio',
    'creative',
    {
      primary: '#7C3AED',
      secondary: '#A855F7',
      accent: '#EC4899',
      background: '#FEFEFE',
      surface: '#F3F4F6',
      textPrimary: '#111827',
      textSecondary: '#4B5563',
      textMuted: '#9CA3AF'
    },
    {
      headingFont: MODERN_FONT_STACKS.modernSans,
      bodyFont: MODERN_FONT_STACKS.readableSans,
      scale: 'large'
    }
  ),
  createTheme(
    'startup-green',
    'Startup Growth',
    'startup',
    {
      primary: '#059669',
      secondary: '#10B981',
      accent: '#F59E0B',
      background: '#FFFFFF',
      surface: '#F0FDF4',
      textPrimary: '#064E3B',
      textSecondary: '#047857',
      textMuted: '#6B7280'
    },
    {
      headingFont: MODERN_FONT_STACKS.modernSans,
      bodyFont: MODERN_FONT_STACKS.readableSans,
      scale: 'normal'
    }
  ),
  createTheme(
    'finance-navy',
    'Financial Trust',
    'finance',
    {
      primary: '#1E3A8A',
      secondary: '#3730A3',
      accent: '#DC2626',
      background: '#FFFFFF',
      surface: '#F1F5F9',
      textPrimary: '#0F172A',
      textSecondary: '#475569',
      textMuted: '#64748B'
    },
    {
      headingFont: MODERN_FONT_STACKS.modernSans,
      bodyFont: MODERN_FONT_STACKS.readableSans,
      scale: 'compact'
    }
  ),
  createTheme(
    'healthcare-teal',
    'Healthcare Professional',
    'healthcare',
    {
      primary: '#0D9488',
      secondary: '#14B8A6',
      accent: '#F59E0B',
      background: '#FFFFFF',
      surface: '#F0FDFA',
      textPrimary: '#134E4A',
      textSecondary: '#0F766E',
      textMuted: '#6B7280'
    },
    {
      headingFont: MODERN_FONT_STACKS.modernSans,
      bodyFont: MODERN_FONT_STACKS.readableSans,
      scale: 'normal'
    }
  ),
  createTheme(
    'academic-indigo',
    'Academic Excellence',
    'academic',
    {
      primary: '#4338CA',
      secondary: '#6366F1',
      accent: '#DC2626',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      textPrimary: '#1E293B',
      textSecondary: '#475569',
      textMuted: '#64748B'
    },
    {
      headingFont: MODERN_FONT_STACKS.modernSerif,
      bodyFont: MODERN_FONT_STACKS.readableSans,
      scale: 'compact'
    }
  ),
  createTheme(
    'startup-orange',
    'Startup Energy',
    'startup',
    {
      primary: '#EA580C',
      secondary: '#FB923C',
      accent: '#8B5CF6',
      background: '#FFFFFF',
      surface: '#FFF7ED',
      textPrimary: '#1C1917',
      textSecondary: '#78716C',
      textMuted: '#A8A29E'
    },
    {
      headingFont: MODERN_FONT_STACKS.modernSans,
      bodyFont: MODERN_FONT_STACKS.readableSans,
      scale: 'large'
    }
  ),
  createTheme(
    'tech-gradient',
    'Technology Innovation',
    'technology',
    {
      primary: '#6366F1',
      secondary: '#8B5CF6',
      accent: '#06B6D4',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      textPrimary: '#0F172A',
      textSecondary: '#64748B',
      textMuted: '#94A3B8'
    },
    {
      headingFont: MODERN_FONT_STACKS.modernSans,
      bodyFont: MODERN_FONT_STACKS.systemSans,
      scale: 'normal'
    }
  ),
  createTheme(
    'education-green',
    'Educational Excellence',
    'academic',
    {
      primary: '#059669',
      secondary: '#10B981',
      accent: '#F59E0B',
      background: '#FFFFFF',
      surface: '#F0FDF4',
      textPrimary: '#064E3B',
      textSecondary: '#6B7280',
      textMuted: '#9CA3AF'
    },
    {
      headingFont: MODERN_FONT_STACKS.modernSerif,
      bodyFont: MODERN_FONT_STACKS.readableSans,
      scale: 'normal'
    }
  ),
  createTheme(
    'consulting-charcoal',
    'Professional Consulting',
    'consulting',
    {
      primary: '#374151',
      secondary: '#6B7280',
      accent: '#DC2626',
      background: '#FFFFFF',
      surface: '#F9FAFB',
      textPrimary: '#111827',
      textSecondary: '#6B7280',
      textMuted: '#9CA3AF'
    },
    {
      headingFont: MODERN_FONT_STACKS.modernSans,
      bodyFont: MODERN_FONT_STACKS.readableSans,
      scale: 'compact'
    }
  ),
  createTheme(
    'marketing-magenta',
    'Creative Marketing',
    'creative',
    {
      primary: '#DB2777',
      secondary: '#EC4899',
      accent: '#8B5CF6',
      background: '#FFFFFF',
      surface: '#FDF2F8',
      textPrimary: '#831843',
      textSecondary: '#6B7280',
      textMuted: '#9CA3AF'
    },
    {
      headingFont: MODERN_FONT_STACKS.modernSans,
      bodyFont: MODERN_FONT_STACKS.readableSans,
      scale: 'large'
    }
  ),

  // New Modern Color Themes with Contemporary Palettes
  createTheme(
    'modern-slate',
    'Modern Minimalist',
    'corporate',
    {
      primary: '#0F172A',      // Rich black
      secondary: '#475569',     // Warm gray
      accent: '#06B6D4',        // Cyan accent
      background: '#FFFFFF',
      surface: '#F8FAFC',
      textPrimary: '#0F172A',
      textSecondary: '#64748B',
      textMuted: '#94A3B8'
    },
    {
      headingFont: MODERN_FONT_STACKS.modernSans,
      bodyFont: MODERN_FONT_STACKS.readableSans,
      scale: 'normal'
    }
  ),
  createTheme(
    'vibrant-coral',
    'Creative Energy',
    'creative',
    {
      primary: '#FF6B6B',       // Vibrant coral
      secondary: '#4ECDC4',     // Turquoise
      accent: '#FFE66D',        // Sunny yellow
      background: '#FFFFFF',
      surface: '#FFF5F5',
      textPrimary: '#2D3748',
      textSecondary: '#4A5568',
      textMuted: '#718096'
    },
    {
      headingFont: MODERN_FONT_STACKS.modernSans,
      bodyFont: MODERN_FONT_STACKS.readableSans,
      scale: 'large'
    }
  ),
  createTheme(
    'deep-forest',
    'Natural Professional',
    'healthcare',
    {
      primary: '#2F855A',       // Forest green
      secondary: '#48BB78',     // Light green
      accent: '#ED8936',        // Warm orange
      background: '#FFFFFF',
      surface: '#F7FAFC',
      textPrimary: '#1A202C',
      textSecondary: '#4A5568',
      textMuted: '#718096'
    },
    {
      headingFont: MODERN_FONT_STACKS.modernSans,
      bodyFont: MODERN_FONT_STACKS.readableSans,
      scale: 'normal'
    }
  ),
  createTheme(
    'electric-blue',
    'Tech Innovation',
    'technology',
    {
      primary: '#2563EB',       // Electric blue
      secondary: '#3B82F6',     // Bright blue
      accent: '#F59E0B',        // Amber
      background: '#FFFFFF',
      surface: '#F8FAFC',
      textPrimary: '#1E293B',
      textSecondary: '#475569',
      textMuted: '#64748B'
    },
    {
      headingFont: MODERN_FONT_STACKS.modernSans,
      bodyFont: MODERN_FONT_STACKS.systemSans,
      scale: 'normal'
    }
  ),
  createTheme(
    'warm-sunset',
    'Creative Warmth',
    'creative',
    {
      primary: '#F56565',       // Warm red
      secondary: '#ED8936',     // Orange
      accent: '#38B2AC',        // Teal accent
      background: '#FFFAF0',    // Warm white
      surface: '#FED7D7',
      textPrimary: '#2D3748',
      textSecondary: '#4A5568',
      textMuted: '#718096'
    },
    {
      headingFont: MODERN_FONT_STACKS.modernSans,
      bodyFont: MODERN_FONT_STACKS.readableSans,
      scale: 'large'
    }
  )
];

// Enhanced utility functions for theme management

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
  return PROFESSIONAL_THEMES[0]; // corporate-blue
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
  return [...new Set(PROFESSIONAL_THEMES.map(theme => theme.category))];
}

/**
 * Dynamic theme selection based on content type and audience
 */
export function selectThemeForContent(params: {
  audience?: string;
  industry?: string;
  presentationType?: string;
  tone?: string;
}): ProfessionalTheme {
  const { audience, industry, presentationType, tone } = params;

  // Industry-based theme selection
  if (industry) {
    switch (industry) {
      case 'healthcare':
        return getThemeById('healthcare-teal') || getDefaultTheme();
      case 'finance':
        return getThemeById('finance-navy') || getDefaultTheme();
      case 'technology':
        return getThemeById('tech-gradient') || getDefaultTheme();
      case 'education':
        return getThemeById('education-green') || getDefaultTheme();
      case 'startup':
        return getThemeById('startup-orange') || getDefaultTheme();
      case 'consulting':
        return getThemeById('consulting-charcoal') || getDefaultTheme();
      case 'marketing':
        return getThemeById('marketing-magenta') || getDefaultTheme();
    }
  }

  // Audience-based theme selection
  if (audience) {
    switch (audience) {
      case 'executives':
        return getThemeById('corporate-blue') || getDefaultTheme();
      case 'technical':
        return getThemeById('tech-gradient') || getDefaultTheme();
      case 'students':
        return getThemeById('education-green') || getDefaultTheme();
      case 'investors':
        return getThemeById('finance-navy') || getDefaultTheme();
      case 'healthcare':
        return getThemeById('healthcare-teal') || getDefaultTheme();
    }
  }

  // Presentation type-based selection
  if (presentationType) {
    switch (presentationType) {
      case 'pitch':
        return getThemeById('startup-orange') || getDefaultTheme();
      case 'report':
        return getThemeById('corporate-blue') || getDefaultTheme();
      case 'training':
        return getThemeById('education-green') || getDefaultTheme();
      case 'proposal':
        return getThemeById('consulting-charcoal') || getDefaultTheme();
    }
  }

  // Tone-based selection
  if (tone) {
    switch (tone) {
      case 'creative':
      case 'inspiring':
        return getThemeById('creative-purple') || getDefaultTheme();
      case 'professional':
      case 'authoritative':
        return getThemeById('corporate-blue') || getDefaultTheme();
      case 'friendly':
      case 'casual':
        return getThemeById('startup-orange') || getDefaultTheme();
    }
  }

  return getDefaultTheme();
}

/**
 * Customize theme colors with brand colors
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
      ...(customization.accent && { accent: customization.accent })
    },
    typography: {
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
}

/**
 * Validate theme color contrast for accessibility
 */
export function validateThemeAccessibility(theme: ProfessionalTheme): {
  isAccessible: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Simple contrast check (simplified - in real implementation would use proper contrast ratio calculation)
  const primaryHex = theme.colors.primary.replace('#', '');
  const backgroundHex = theme.colors.background.replace('#', '');

  // Convert hex to RGB for basic brightness comparison
  const primaryBrightness = parseInt(primaryHex.slice(0, 2), 16) + parseInt(primaryHex.slice(2, 4), 16) + parseInt(primaryHex.slice(4, 6), 16);
  const backgroundBrightness = parseInt(backgroundHex.slice(0, 2), 16) + parseInt(backgroundHex.slice(2, 4), 16) + parseInt(backgroundHex.slice(4, 6), 16);

  const contrastDifference = Math.abs(primaryBrightness - backgroundBrightness);

  if (contrastDifference < 300) {
    issues.push('Primary color may not have sufficient contrast with background');
    suggestions.push('Consider using a darker primary color or lighter background');
  }

  if (theme.colors.primary === theme.colors.secondary) {
    issues.push('Primary and secondary colors are identical');
    suggestions.push('Use different colors for primary and secondary to create visual hierarchy');
  }

  return {
    isAccessible: issues.length === 0,
    issues,
    suggestions
  };
}

/**
 * Get theme recommendations based on content analysis
 */
export function getThemeRecommendations(contentAnalysis: {
  hasCharts?: boolean;
  hasImages?: boolean;
  isDataHeavy?: boolean;
  isCreative?: boolean;
  audience?: string;
  industry?: string;
}): {
  recommended: ProfessionalTheme[];
  reasons: string[];
} {
  const recommendations: ProfessionalTheme[] = [];
  const reasons: string[] = [];

  // Data-heavy presentations
  if (contentAnalysis.isDataHeavy || contentAnalysis.hasCharts) {
    recommendations.push(getThemeById('finance-navy') || getDefaultTheme());
    recommendations.push(getThemeById('corporate-blue') || getDefaultTheme());
    reasons.push('Professional themes work best for data-heavy presentations');
  }

  // Creative presentations
  if (contentAnalysis.isCreative) {
    recommendations.push(getThemeById('creative-purple') || getDefaultTheme());
    recommendations.push(getThemeById('marketing-magenta') || getDefaultTheme());
    reasons.push('Creative themes enhance visual appeal for artistic content');
  }

  // Industry-specific recommendations
  if (contentAnalysis.industry) {
    const industryTheme = selectThemeForContent({ industry: contentAnalysis.industry });
    if (!recommendations.includes(industryTheme)) {
      recommendations.push(industryTheme);
      reasons.push(`${industryTheme.name} is optimized for ${contentAnalysis.industry} industry`);
    }
  }

  // Fallback to default if no specific recommendations
  if (recommendations.length === 0) {
    recommendations.push(getDefaultTheme());
    reasons.push('Corporate Professional theme is suitable for all presentation types');
  }

  return {
    recommended: recommendations.slice(0, 3), // Limit to top 3 recommendations
    reasons
  };
}

// Convert hex color to RGB values for PowerPoint
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 255, b: 255 }; // Default to white on error
}

// Convert RGB to PowerPoint color format
export function rgbToPptColor(r: number, g: number, b: number): string {
  return `${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
}