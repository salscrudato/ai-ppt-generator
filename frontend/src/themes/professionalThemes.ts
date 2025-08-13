// Professional Theme System - Enhanced Visual Design
export interface ProfessionalTheme {
  id: string;
  name: string;
  category: 'corporate' | 'creative' | 'academic' | 'startup' | 'healthcare' | 'finance';
  description: string;
  
  // Color System
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
    };
    semantic: {
      success: string;
      warning: string;
      error: string;
      info: string;
    };
  };
  
  // Typography System
  typography: {
    headings: {
      fontFamily: string;
      weights: number[];
      sizes: {
        display: number;  // 48px - Hero titles
        h1: number;       // 36px - Main titles
        h2: number;       // 28px - Section headers
        h3: number;       // 22px - Subsection headers
      };
    };
    body: {
      fontFamily: string;
      weights: number[];
      sizes: {
        large: number;    // 18px - Emphasis
        normal: number;   // 16px - Body text
        small: number;    // 14px - Captions
      };
    };
  };
  
  // Visual Effects
  effects: {
    borderRadius: number;
    shadows: {
      subtle: string;
      medium: string;
      strong: string;
    };
    gradients: {
      primary: string;
      accent: string;
      background: string;
    };
  };
  
  // Spacing System
  spacing: {
    xs: number;    // 4px
    sm: number;    // 8px
    md: number;    // 16px
    lg: number;    // 24px
    xl: number;    // 32px
    xxl: number;   // 48px
  };
}

// Professional Theme Library
export const PROFESSIONAL_THEMES: ProfessionalTheme[] = [
  {
    id: 'corporate-blue',
    name: 'Corporate Professional',
    category: 'corporate',
    description: 'Clean, trustworthy design perfect for business presentations',
    colors: {
      primary: '#1E40AF',      // Deep blue
      secondary: '#3B82F6',     // Medium blue
      accent: '#F59E0B',        // Amber accent
      background: '#FFFFFF',    // Pure white
      surface: '#F8FAFC',       // Light gray surface
      text: {
        primary: '#1F2937',     // Dark gray
        secondary: '#6B7280',   // Medium gray
        inverse: '#FFFFFF'      // White text
      },
      semantic: {
        success: '#10B981',     // Emerald
        warning: '#F59E0B',     // Amber
        error: '#EF4444',       // Red
        info: '#3B82F6'         // Blue
      }
    },
    typography: {
      headings: {
        fontFamily: 'Inter',
        weights: [600, 700, 800],
        sizes: {
          display: 48,
          h1: 36,
          h2: 28,
          h3: 22
        }
      },
      body: {
        fontFamily: 'Inter',
        weights: [400, 500, 600],
        sizes: {
          large: 18,
          normal: 16,
          small: 14
        }
      }
    },
    effects: {
      borderRadius: 8,
      shadows: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        strong: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)'
      },
      gradients: {
        primary: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
        accent: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'
      }
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48
    }
  },

  {
    id: 'creative-purple',
    name: 'Creative Studio',
    category: 'creative',
    description: 'Bold, innovative design for creative and design presentations',
    colors: {
      primary: '#7C3AED',       // Purple
      secondary: '#A855F7',     // Light purple
      accent: '#EC4899',        // Pink accent
      background: '#FEFEFE',    // Off-white
      surface: '#F3F4F6',       // Light surface
      text: {
        primary: '#111827',     // Near black
        secondary: '#4B5563',   // Gray
        inverse: '#FFFFFF'
      },
      semantic: {
        success: '#059669',
        warning: '#D97706',
        error: '#DC2626',
        info: '#7C3AED'
      }
    },
    typography: {
      headings: {
        fontFamily: 'Poppins',
        weights: [600, 700, 800],
        sizes: {
          display: 52,
          h1: 40,
          h2: 32,
          h3: 24
        }
      },
      body: {
        fontFamily: 'Inter',
        weights: [400, 500, 600],
        sizes: {
          large: 20,
          normal: 18,
          small: 16
        }
      }
    },
    effects: {
      borderRadius: 12,
      shadows: {
        subtle: '0 2px 4px 0 rgba(124, 58, 237, 0.1)',
        medium: '0 8px 16px 0 rgba(124, 58, 237, 0.15)',
        strong: '0 16px 32px 0 rgba(124, 58, 237, 0.2)'
      },
      gradients: {
        primary: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
        accent: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
        background: 'linear-gradient(135deg, #FEFEFE 0%, #F9FAFB 100%)'
      }
    },
    spacing: {
      xs: 6,
      sm: 12,
      md: 20,
      lg: 32,
      xl: 40,
      xxl: 56
    }
  },

  {
    id: 'startup-green',
    name: 'Startup Growth',
    category: 'startup',
    description: 'Fresh, energetic design perfect for startups and growth companies',
    colors: {
      primary: '#059669',       // Emerald
      secondary: '#10B981',     // Light emerald
      accent: '#F59E0B',        // Amber
      background: '#FFFFFF',
      surface: '#F0FDF4',       // Light green tint
      text: {
        primary: '#064E3B',     // Dark green
        secondary: '#047857',   // Medium green
        inverse: '#FFFFFF'
      },
      semantic: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#059669'
      }
    },
    typography: {
      headings: {
        fontFamily: 'Inter',
        weights: [500, 600, 700],
        sizes: {
          display: 50,
          h1: 38,
          h2: 30,
          h3: 24
        }
      },
      body: {
        fontFamily: 'Inter',
        weights: [400, 500, 600],
        sizes: {
          large: 19,
          normal: 17,
          small: 15
        }
      }
    },
    effects: {
      borderRadius: 10,
      shadows: {
        subtle: '0 1px 3px 0 rgba(5, 150, 105, 0.1)',
        medium: '0 6px 16px 0 rgba(5, 150, 105, 0.15)',
        strong: '0 12px 24px 0 rgba(5, 150, 105, 0.2)'
      },
      gradients: {
        primary: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
        accent: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F0FDF4 100%)'
      }
    },
    spacing: {
      xs: 5,
      sm: 10,
      md: 18,
      lg: 28,
      xl: 36,
      xxl: 52
    }
  },

  {
    id: 'finance-navy',
    name: 'Financial Trust',
    category: 'finance',
    description: 'Sophisticated, trustworthy design for financial and consulting presentations',
    colors: {
      primary: '#1E3A8A',       // Navy blue
      secondary: '#3730A3',     // Indigo
      accent: '#DC2626',        // Red accent
      background: '#FFFFFF',
      surface: '#F1F5F9',       // Slate surface
      text: {
        primary: '#0F172A',     // Slate 900
        secondary: '#475569',   // Slate 600
        inverse: '#FFFFFF'
      },
      semantic: {
        success: '#16A34A',
        warning: '#CA8A04',
        error: '#DC2626',
        info: '#1E3A8A'
      }
    },
    typography: {
      headings: {
        fontFamily: 'Inter',
        weights: [600, 700, 800],
        sizes: {
          display: 46,
          h1: 34,
          h2: 26,
          h3: 20
        }
      },
      body: {
        fontFamily: 'Inter',
        weights: [400, 500, 600],
        sizes: {
          large: 17,
          normal: 15,
          small: 13
        }
      }
    },
    effects: {
      borderRadius: 6,
      shadows: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        strong: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      },
      gradients: {
        primary: 'linear-gradient(135deg, #1E3A8A 0%, #3730A3 100%)',
        accent: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F1F5F9 100%)'
      }
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48
    }
  },

  {
    id: 'healthcare-teal',
    name: 'Healthcare Care',
    category: 'healthcare',
    description: 'Calming, professional design for healthcare and wellness presentations',
    colors: {
      primary: '#0D9488',       // Teal
      secondary: '#14B8A6',     // Light teal
      accent: '#F59E0B',        // Amber
      background: '#FFFFFF',
      surface: '#F0FDFA',       // Teal tint
      text: {
        primary: '#134E4A',     // Dark teal
        secondary: '#0F766E',   // Medium teal
        inverse: '#FFFFFF'
      },
      semantic: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#0D9488'
      }
    },
    typography: {
      headings: {
        fontFamily: 'Inter',
        weights: [500, 600, 700],
        sizes: {
          display: 44,
          h1: 32,
          h2: 26,
          h3: 20
        }
      },
      body: {
        fontFamily: 'Inter',
        weights: [400, 500, 600],
        sizes: {
          large: 18,
          normal: 16,
          small: 14
        }
      }
    },
    effects: {
      borderRadius: 8,
      shadows: {
        subtle: '0 1px 3px 0 rgba(13, 148, 136, 0.1)',
        medium: '0 4px 12px 0 rgba(13, 148, 136, 0.15)',
        strong: '0 8px 25px 0 rgba(13, 148, 136, 0.2)'
      },
      gradients: {
        primary: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
        accent: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F0FDFA 100%)'
      }
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48
    }
  },

  {
    id: 'academic-indigo',
    name: 'Academic Excellence',
    category: 'academic',
    description: 'Scholarly, refined design for educational and research presentations',
    colors: {
      primary: '#4338CA',       // Indigo
      secondary: '#6366F1',     // Light indigo
      accent: '#DC2626',        // Red accent
      background: '#FFFFFF',
      surface: '#F8FAFC',       // Slate surface
      text: {
        primary: '#1E293B',     // Slate 800
        secondary: '#475569',   // Slate 600
        inverse: '#FFFFFF'
      },
      semantic: {
        success: '#059669',
        warning: '#D97706',
        error: '#DC2626',
        info: '#4338CA'
      }
    },
    typography: {
      headings: {
        fontFamily: 'Inter',
        weights: [600, 700, 800],
        sizes: {
          display: 42,
          h1: 30,
          h2: 24,
          h3: 18
        }
      },
      body: {
        fontFamily: 'Inter',
        weights: [400, 500, 600],
        sizes: {
          large: 17,
          normal: 15,
          small: 13
        }
      }
    },
    effects: {
      borderRadius: 6,
      shadows: {
        subtle: '0 1px 2px 0 rgba(67, 56, 202, 0.1)',
        medium: '0 4px 6px -1px rgba(67, 56, 202, 0.1)',
        strong: '0 10px 15px -3px rgba(67, 56, 202, 0.1)'
      },
      gradients: {
        primary: 'linear-gradient(135deg, #4338CA 0%, #6366F1 100%)',
        accent: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'
      }
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48
    }
  }
];

// Theme utility functions
export function getThemeById(id: string): ProfessionalTheme | undefined {
  return PROFESSIONAL_THEMES.find(theme => theme.id === id);
}

export function getThemesByCategory(category: ProfessionalTheme['category']): ProfessionalTheme[] {
  return PROFESSIONAL_THEMES.filter(theme => theme.category === category);
}

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
