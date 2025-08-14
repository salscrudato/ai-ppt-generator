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
        strong: '#D1D5D7'
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
      borderRadius: 12,
      shadows: {
        subtle: '0 1px 3px rgba(255, 190, 152, 0.1)',
        medium: '0 4px 6px rgba(255, 190, 152, 0.15)',
        strong: '0 10px 15px rgba(255, 190, 152, 0.2)',
        colored: '0 4px 6px rgba(255, 190, 152, 0.3)',
        glow: '0 0 8px rgba(255, 107, 53, 0.3)',
        elevated: '0 12px 24px rgba(255, 190, 152, 0.1)'
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
    id: 'royal-purple',
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
