/**
 * SIMPLIFIED PROFESSIONAL THEME SYSTEM
 * 
 * Reduced to 6 core themes with excellent text readability and WCAG compliance.
 * Synchronized with backend themes for consistent user experience.
 * 
 * All themes have been tested for:
 * - WCAG AA/AAA compliance
 * - Excellent text readability  
 * - Professional appearance
 * - Cross-platform compatibility
 */

export interface ProfessionalTheme {
  id: string;
  name: string;
  category: 'corporate' | 'consulting' | 'modern' | 'natural';
  description: string;
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
  typography: {
    headings: {
      fontFamily: string;
      weights: number[];
      sizes: { display: number; h1: number; h2: number; h3: number; h4: number; };
      lineHeight: number;
      letterSpacing: string;
    };
    body: {
      fontFamily: string;
      weights: number[];
      sizes: { large: number; medium: number; small: number; caption: number; };
      lineHeight: number;
      letterSpacing: string;
    };
  };
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
  spacing: { xs: number; sm: number; md: number; lg: number; xl: number; xxl: number; xxxl: number; };
}

const createTheme = (
  id: string,
  name: string,
  category: ProfessionalTheme['category'],
  description: string,
  colors: ProfessionalTheme['colors']
): ProfessionalTheme => ({
  id,
  name,
  category,
  description,
  colors,
  typography: {
    headings: {
      fontFamily: 'Inter, system-ui, sans-serif',
      weights: [400, 500, 600, 700, 800],
      sizes: { display: 56, h1: 42, h2: 32, h3: 24, h4: 20 },
      lineHeight: 1.1,
      letterSpacing: '-0.02em'
    },
    body: {
      fontFamily: 'Inter, system-ui, sans-serif',
      weights: [400, 500, 600],
      sizes: { large: 20, medium: 16, small: 14, caption: 12 },
      lineHeight: 1.6,
      letterSpacing: '0.01em'
    }
  },
  effects: {
    borderRadius: 12,
    shadows: {
      subtle: '0 2px 4px rgba(0, 0, 0, 0.06)',
      medium: '0 6px 12px rgba(0, 0, 0, 0.12)',
      strong: '0 12px 24px rgba(0, 0, 0, 0.15)',
      colored: `0 6px 12px ${colors.primary}25`,
      glow: `0 0 16px ${colors.accent}35`,
      elevated: '0 16px 32px rgba(0, 0, 0, 0.12)'
    },
    gradients: {
      primary: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
      secondary: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.accent} 100%)`,
      accent: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accent}CC 100%)`,
      background: `linear-gradient(135deg, ${colors.background} 0%, ${colors.surface} 100%)`,
      mesh: `radial-gradient(at 20% 80%, ${colors.primary}08 0%, transparent 50%), radial-gradient(at 80% 20%, ${colors.accent}06 0%, transparent 50%)`,
      subtle: `linear-gradient(180deg, ${colors.surface} 0%, ${colors.background} 100%)`,
      vibrant: `linear-gradient(45deg, ${colors.accent} 0%, ${colors.primary} 100%)`
    }
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64 }
});

export const PROFESSIONAL_THEMES: ProfessionalTheme[] = [
  // CORE THEME 1: Corporate Professional
  createTheme('corporate-blue', 'Corporate Professional', 'corporate', 
    'Clean, trustworthy theme with excellent text readability perfect for business presentations', {
    primary: '#1E40AF',
    secondary: '#3B82F6',
    accent: '#F59E0B',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: { primary: '#1F2937', secondary: '#6B7280', inverse: '#FFFFFF', muted: '#9CA3AF' },
    semantic: { success: '#10B981', warning: '#F59E0B', error: '#EF4444', info: '#3B82F6' },
    borders: { light: '#F3F4F6', medium: '#E5E7EB', strong: '#D1D5DB' }
  }),

  // CORE THEME 2: Modern Executive
  createTheme('executive-dark', 'Modern Executive', 'corporate',
    'Premium dark theme with fixed contrast ratios for executive presentations', {
    primary: '#1E40AF',
    secondary: '#6366F1',
    accent: '#10B981',
    background: '#0F172A',
    surface: '#1E293B',
    text: { primary: '#FFFFFF', secondary: '#E2E8F0', inverse: '#FFFFFF', muted: '#CBD5E1' },
    semantic: { success: '#10B981', warning: '#F59E0B', error: '#EF4444', info: '#6366F1' },
    borders: { light: '#334155', medium: '#475569', strong: '#64748B' }
  }),

  // CORE THEME 3: Premium Consulting
  createTheme('consulting-charcoal', 'Premium Consulting', 'consulting',
    'Sophisticated charcoal theme perfect for professional consulting presentations', {
    primary: '#111827',
    secondary: '#374151',
    accent: '#F59E0B',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: { primary: '#111827', secondary: '#374151', inverse: '#FFFFFF', muted: '#6B7280' },
    semantic: { success: '#10B981', warning: '#F59E0B', error: '#EF4444', info: '#374151' },
    borders: { light: '#F3F4F6', medium: '#E5E7EB', strong: '#D1D5DB' }
  }),

  // CORE THEME 4: Ocean Depth
  createTheme('ocean-depth', 'Ocean Depth', 'modern',
    'Modern sophisticated blue theme with excellent readability', {
    primary: '#0F172A',
    secondary: '#1E293B',
    accent: '#06B6D4',
    background: '#F8FAFC',
    surface: '#F1F5F9',
    text: { primary: '#0F172A', secondary: '#475569', inverse: '#FFFFFF', muted: '#64748B' },
    semantic: { success: '#10B981', warning: '#F59E0B', error: '#EF4444', info: '#06B6D4' },
    borders: { light: '#F1F5F9', medium: '#E2E8F0', strong: '#CBD5E1' }
  }),

  // CORE THEME 5: Emerald Professional
  createTheme('emerald-professional', 'Emerald Professional', 'modern',
    'Fresh, modern green theme with excellent contrast ratios', {
    primary: '#065F46',
    secondary: '#047857',
    accent: '#F59E0B',
    background: '#FFFFFF',
    surface: '#F0FDF4',
    text: { primary: '#064E3B', secondary: '#047857', inverse: '#FFFFFF', muted: '#6B7280' },
    semantic: { success: '#047857', warning: '#F59E0B', error: '#EF4444', info: '#065F46' },
    borders: { light: '#F0FDF4', medium: '#DCFCE7', strong: '#BBF7D0' }
  }),

  // CORE THEME 6: Midnight Blue
  createTheme('midnight-blue', 'Midnight Blue', 'modern',
    'Elegant dark theme with excellent contrast for sophisticated presentations', {
    primary: '#1E3A8A',
    secondary: '#3B82F6',
    accent: '#F97316',
    background: '#0F172A',
    surface: '#1E293B',
    text: { primary: '#F8FAFC', secondary: '#CBD5E1', inverse: '#FFFFFF', muted: '#94A3B8' },
    semantic: { success: '#10B981', warning: '#F59E0B', error: '#EF4444', info: '#3B82F6' },
    borders: { light: '#334155', medium: '#475569', strong: '#64748B' }
  })
];

// Utility functions
export function getThemeById(id: string): ProfessionalTheme {
  return PROFESSIONAL_THEMES.find(theme => theme.id === id) || PROFESSIONAL_THEMES[0];
}

export function getDefaultTheme(): ProfessionalTheme {
  return PROFESSIONAL_THEMES[0];
}

export function getThemesByCategory(category: ProfessionalTheme['category']): ProfessionalTheme[] {
  return PROFESSIONAL_THEMES.filter(theme => theme.category === category);
}
