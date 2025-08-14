/**
 * Modern Theme Collection for Professional PowerPoint Generation
 *
 * Curated collection of contemporary themes with modern aesthetics,
 * sophisticated color palettes, and industry-specific designs.
 *
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import { ThemeTokens, TYPOGRAPHY_SCALE, SPACING_SCALE, FONT_STACKS, LINE_HEIGHTS } from './tokens';
import { MODERN_GRADIENTS, VISUAL_EFFECT_PRESETS } from './visualEffects';

/**
 * Extended theme interface with modern features
 */
export interface ModernTheme extends ThemeTokens {
  id: string;
  name: string;
  description: string;
  category: 'corporate' | 'creative' | 'tech' | 'minimal' | 'luxury' | 'startup';
  gradients: {
    primary: any;
    secondary: any;
    accent: any;
    background: any;
  };
  visualEffects: {
    cardStyle: string;
    accentStyle: string;
    heroStyle: string;
  };
  industry?: string[];
  audience?: string[];
}

/**
 * Base theme configuration with modern enhancements
 */
const createModernBaseTheme = (): Omit<ThemeTokens, 'palette'> => ({
  typography: {
    fontFamilies: {
      heading: '"Inter", "SF Pro Display", "Segoe UI", system-ui, sans-serif',
      body: '"Inter", "SF Pro Text", "Segoe UI", system-ui, sans-serif',
      mono: '"JetBrains Mono", "SF Mono", "Consolas", monospace'
    },
    fontWeights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    },
    fontSizes: {
      display: 48,  // Larger for impact
      h1: 40,       // Enhanced hierarchy
      h2: 32,
      h3: 26,
      h4: 22,
      body: 18,
      small: 14,
      tiny: 12
    },
    lineHeights: {
      tight: 1.1,   // Tighter for headings
      normal: 1.3,  // Better readability
      relaxed: 1.5  // More relaxed for body text
    },
    letterSpacing: {
      tight: -0.02,
      normal: 0,
      wide: 0.02
    }
  },
  spacing: {
    xs: SPACING_SCALE.XS,
    sm: SPACING_SCALE.SM,
    md: SPACING_SCALE.MD,
    lg: SPACING_SCALE.LG,
    xl: SPACING_SCALE.XL,
    xxl: SPACING_SCALE.XXL,
    xxxl: SPACING_SCALE.XXXL
  },
  radii: {
    none: 0,
    sm: 0.04,
    md: 0.08,
    lg: 0.12,
    full: 999
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
    xl: '0 20px 25px rgba(0,0,0,0.15)'
  },
  layout: {
    slideWidth: 10,
    slideHeight: 5.625,
    safeMargin: 0.5,
    contentWidth: 9,
    contentHeight: 4.625,
    gridColumns: 12,
    gridGutter: 0.2
  }
});

/**
 * Minimalist Professional Theme
 * Clean, modern design with subtle colors and excellent typography
 */
export const minimalistTheme: ModernTheme = {
  ...createModernBaseTheme(),
  id: 'minimalist-pro',
  name: 'Minimalist Professional',
  description: 'Clean, modern design with subtle colors and excellent typography',
  category: 'minimal',
  palette: {
    primary: '#1a1a1a',        // Near black
    secondary: '#4a4a4a',      // Medium gray
    accent: '#0066cc',         // Professional blue
    background: '#ffffff',     // Pure white
    surface: '#f8f9fa',        // Light gray
    text: {
      primary: '#1a1a1a',     // Near black
      secondary: '#4a4a4a',   // Medium gray
      inverse: '#ffffff',     // White
      muted: '#6b7280'        // Light gray
    },
    semantic: {
      success: '#10b981',     // Modern green
      warning: '#f59e0b',     // Amber
      error: '#ef4444',       // Red
      info: '#0066cc'         // Blue
    },
    borders: {
      light: '#f3f4f6',
      medium: '#e5e7eb',
      strong: '#d1d5db'
    },
    chart: ['#0066cc', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
    status: {
      active: '#10b981',
      inactive: '#9ca3af',
      pending: '#f59e0b'
    }
  },
  gradients: {
    primary: MODERN_GRADIENTS.CORPORATE_BLUE,
    secondary: MODERN_GRADIENTS.COOL_BREEZE,
    accent: MODERN_GRADIENTS.TECH_GRADIENT,
    background: MODERN_GRADIENTS.SOFT_MINT
  },
  visualEffects: {
    cardStyle: 'MODERN_CARD',
    accentStyle: 'ACCENT_PILL',
    heroStyle: 'SUBTLE_BACKGROUND'
  },
  industry: ['consulting', 'finance', 'legal', 'corporate'],
  audience: ['executives', 'professionals', 'clients']
};

/**
 * Tech Innovation Theme
 * Bold, modern design with vibrant gradients and tech-forward aesthetics
 */
export const techInnovationTheme: ModernTheme = {
  ...createModernBaseTheme(),
  id: 'tech-innovation',
  name: 'Tech Innovation',
  description: 'Bold, modern design with vibrant gradients and tech-forward aesthetics',
  category: 'tech',
  palette: {
    primary: '#6366f1',        // Indigo
    secondary: '#8b5cf6',      // Purple
    accent: '#06b6d4',         // Cyan
    background: '#ffffff',     // White
    surface: '#f8fafc',        // Light blue-gray
    text: {
      primary: '#1e293b',     // Dark blue-gray
      secondary: '#475569',   // Medium blue-gray
      inverse: '#ffffff',     // White
      muted: '#94a3b8'        // Light blue-gray
    },
    semantic: {
      success: '#22c55e',     // Bright green
      warning: '#f59e0b',     // Amber
      error: '#ef4444',       // Red
      info: '#3b82f6'         // Blue
    },
    borders: {
      light: '#f1f5f9',
      medium: '#e2e8f0',
      strong: '#cbd5e1'
    },
    chart: ['#6366f1', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444'],
    status: {
      active: '#22c55e',
      inactive: '#94a3b8',
      pending: '#f59e0b'
    }
  },
  gradients: {
    primary: MODERN_GRADIENTS.TECH_GRADIENT,
    secondary: MODERN_GRADIENTS.CREATIVE_PURPLE,
    accent: MODERN_GRADIENTS.INNOVATION_FLOW,
    background: MODERN_GRADIENTS.COOL_BREEZE
  },
  visualEffects: {
    cardStyle: 'ELEVATED_CARD',
    accentStyle: 'ACCENT_PILL',
    heroStyle: 'HERO_GRADIENT'
  },
  industry: ['technology', 'startup', 'software', 'innovation'],
  audience: ['developers', 'investors', 'tech-savvy']
};

/**
 * Luxury Executive Theme
 * Sophisticated dark theme with gold accents for high-end presentations
 */
export const luxuryExecutiveTheme: ModernTheme = {
  ...createModernBaseTheme(),
  id: 'luxury-executive',
  name: 'Luxury Executive',
  description: 'Sophisticated dark theme with gold accents for high-end presentations',
  category: 'luxury',
  palette: {
    primary: '#d4af37',        // Gold
    secondary: '#f8f9fa',      // Light gray
    accent: '#dc2626',         // Deep red
    background: '#0f172a',     // Dark navy
    surface: '#1e293b',        // Lighter navy
    text: {
      primary: '#f8f9fa',     // Light gray
      secondary: '#cbd5e1',   // Medium light gray
      inverse: '#0f172a',     // Dark navy
      muted: '#64748b'        // Muted gray
    },
    semantic: {
      success: '#22c55e',     // Bright green
      warning: '#fbbf24',     // Bright yellow
      error: '#f87171',       // Bright red
      info: '#60a5fa'         // Bright blue
    },
    borders: {
      light: '#334155',
      medium: '#475569',
      strong: '#64748b'
    },
    chart: ['#d4af37', '#f8f9fa', '#dc2626', '#22c55e', '#fbbf24', '#60a5fa'],
    status: {
      active: '#22c55e',
      inactive: '#64748b',
      pending: '#fbbf24'
    }
  },
  gradients: {
    primary: {
      type: 'linear' as const,
      colors: ['#d4af37', '#b8860b'],
      direction: 135,
      stops: [0, 100]
    },
    secondary: MODERN_GRADIENTS.EXECUTIVE_DARK,
    accent: {
      type: 'radial' as const,
      colors: ['#dc2626', '#991b1b'],
      centerX: 50,
      centerY: 50,
      stops: [0, 100]
    },
    background: MODERN_GRADIENTS.EXECUTIVE_DARK
  },
  visualEffects: {
    cardStyle: 'ELEVATED_CARD',
    accentStyle: 'ACCENT_PILL',
    heroStyle: 'HERO_GRADIENT'
  },
  industry: ['luxury', 'finance', 'real-estate', 'consulting'],
  audience: ['executives', 'high-net-worth', 'board-members']
};

/**
 * Creative Studio Theme
 * Vibrant, artistic design with bold colors and creative elements
 */
export const creativeStudioTheme: ModernTheme = {
  ...createModernBaseTheme(),
  id: 'creative-studio',
  name: 'Creative Studio',
  description: 'Vibrant, artistic design with bold colors and creative elements',
  category: 'creative',
  palette: {
    primary: '#ec4899',        // Hot pink
    secondary: '#8b5cf6',      // Purple
    accent: '#06b6d4',         // Cyan
    background: '#ffffff',     // White
    surface: '#fdf2f8',        // Light pink
    text: {
      primary: '#1f2937',     // Dark gray
      secondary: '#374151',   // Medium gray
      inverse: '#ffffff',     // White
      muted: '#9ca3af'        // Light gray
    },
    semantic: {
      success: '#10b981',     // Emerald
      warning: '#f59e0b',     // Amber
      error: '#ef4444',       // Red
      info: '#3b82f6'         // Blue
    },
    borders: {
      light: '#fce7f3',
      medium: '#f9a8d4',
      strong: '#f472b6'
    },
    chart: ['#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'],
    status: {
      active: '#10b981',
      inactive: '#9ca3af',
      pending: '#f59e0b'
    }
  },
  gradients: {
    primary: MODERN_GRADIENTS.CREATIVE_PURPLE,
    secondary: {
      type: 'linear' as const,
      colors: ['#ec4899', '#f472b6', '#fbbf24'],
      direction: 45,
      stops: [0, 50, 100]
    },
    accent: MODERN_GRADIENTS.INNOVATION_FLOW,
    background: {
      type: 'linear' as const,
      colors: ['#fdf2f8', '#fce7f3'],
      direction: 180,
      stops: [0, 100]
    }
  },
  visualEffects: {
    cardStyle: 'ELEVATED_CARD',
    accentStyle: 'ACCENT_PILL',
    heroStyle: 'HERO_GRADIENT'
  },
  industry: ['design', 'marketing', 'advertising', 'media'],
  audience: ['creatives', 'marketers', 'designers']
};

/**
 * Healthcare Professional Theme
 * Clean, trustworthy design with medical industry colors
 */
export const healthcareTheme: ModernTheme = {
  ...createModernBaseTheme(),
  id: 'healthcare-professional',
  name: 'Healthcare Professional',
  description: 'Clean, trustworthy design optimized for medical and healthcare presentations',
  category: 'corporate',
  palette: {
    primary: '#0369a1',        // Medical blue
    secondary: '#0ea5e9',      // Sky blue
    accent: '#059669',         // Medical green
    background: '#ffffff',     // Pure white
    surface: '#f0f9ff',        // Light blue tint
    text: {
      primary: '#0c4a6e',     // Dark blue
      secondary: '#0369a1',   // Medium blue
      inverse: '#ffffff',     // White
      muted: '#64748b'        // Gray
    },
    semantic: {
      success: '#059669',     // Medical green
      warning: '#d97706',     // Orange
      error: '#dc2626',       // Red
      info: '#0369a1'         // Blue
    },
    borders: {
      light: '#e0f2fe',
      medium: '#bae6fd',
      strong: '#7dd3fc'
    },
    chart: ['#0369a1', '#0ea5e9', '#059669', '#d97706', '#dc2626', '#7c3aed'],
    status: {
      active: '#059669',
      inactive: '#64748b',
      pending: '#d97706'
    }
  },
  gradients: {
    primary: {
      type: 'linear' as const,
      colors: ['#0369a1', '#0ea5e9'],
      direction: 135,
      stops: [0, 100]
    },
    secondary: {
      type: 'linear' as const,
      colors: ['#f0f9ff', '#e0f2fe'],
      direction: 180,
      stops: [0, 100]
    },
    accent: {
      type: 'radial' as const,
      colors: ['#059669', '#047857'],
      centerX: 50,
      centerY: 50,
      stops: [0, 100]
    },
    background: {
      type: 'linear' as const,
      colors: ['#ffffff', '#f0f9ff'],
      direction: 180,
      stops: [0, 100]
    }
  },
  visualEffects: {
    cardStyle: 'MODERN_CARD',
    accentStyle: 'ACCENT_PILL',
    heroStyle: 'SUBTLE_BACKGROUND'
  },
  industry: ['healthcare', 'medical', 'pharmaceutical', 'biotech'],
  audience: ['doctors', 'nurses', 'medical-professionals', 'patients']
};

/**
 * Financial Services Theme
 * Professional, trustworthy design for financial presentations
 */
export const financialTheme: ModernTheme = {
  ...createModernBaseTheme(),
  id: 'financial-services',
  name: 'Financial Services',
  description: 'Professional, trustworthy design optimized for financial and banking presentations',
  category: 'corporate',
  palette: {
    primary: '#1e40af',        // Financial blue
    secondary: '#3b82f6',      // Bright blue
    accent: '#059669',         // Success green
    background: '#ffffff',     // Pure white
    surface: '#f8fafc',        // Light gray
    text: {
      primary: '#1e293b',     // Dark slate
      secondary: '#475569',   // Medium slate
      inverse: '#ffffff',     // White
      muted: '#64748b'        // Light slate
    },
    semantic: {
      success: '#059669',     // Green
      warning: '#d97706',     // Orange
      error: '#dc2626',       // Red
      info: '#1e40af'         // Blue
    },
    borders: {
      light: '#f1f5f9',
      medium: '#e2e8f0',
      strong: '#cbd5e1'
    },
    chart: ['#1e40af', '#3b82f6', '#059669', '#d97706', '#dc2626', '#7c3aed'],
    status: {
      active: '#059669',
      inactive: '#64748b',
      pending: '#d97706'
    }
  },
  gradients: {
    primary: {
      type: 'linear' as const,
      colors: ['#1e40af', '#3b82f6'],
      direction: 135,
      stops: [0, 100]
    },
    secondary: {
      type: 'linear' as const,
      colors: ['#f8fafc', '#f1f5f9'],
      direction: 180,
      stops: [0, 100]
    },
    accent: {
      type: 'linear' as const,
      colors: ['#059669', '#047857'],
      direction: 45,
      stops: [0, 100]
    },
    background: {
      type: 'linear' as const,
      colors: ['#ffffff', '#f8fafc'],
      direction: 180,
      stops: [0, 100]
    }
  },
  visualEffects: {
    cardStyle: 'ELEVATED_CARD',
    accentStyle: 'ACCENT_PILL',
    heroStyle: 'SUBTLE_BACKGROUND'
  },
  industry: ['finance', 'banking', 'investment', 'insurance'],
  audience: ['executives', 'investors', 'financial-advisors', 'clients']
};

/**
 * Education Theme
 * Friendly, approachable design for educational presentations
 */
export const educationTheme: ModernTheme = {
  ...createModernBaseTheme(),
  id: 'education-friendly',
  name: 'Education Friendly',
  description: 'Friendly, approachable design optimized for educational and training presentations',
  category: 'creative',
  palette: {
    primary: '#7c3aed',        // Purple
    secondary: '#a855f7',      // Light purple
    accent: '#f59e0b',         // Amber
    background: '#ffffff',     // Pure white
    surface: '#faf5ff',        // Light purple tint
    text: {
      primary: '#581c87',     // Dark purple
      secondary: '#7c3aed',   // Medium purple
      inverse: '#ffffff',     // White
      muted: '#a78bfa'        // Light purple
    },
    semantic: {
      success: '#10b981',     // Green
      warning: '#f59e0b',     // Amber
      error: '#ef4444',       // Red
      info: '#7c3aed'         // Purple
    },
    borders: {
      light: '#f3f0ff',
      medium: '#e9d5ff',
      strong: '#c4b5fd'
    },
    chart: ['#7c3aed', '#a855f7', '#f59e0b', '#10b981', '#ef4444', '#06b6d4'],
    status: {
      active: '#10b981',
      inactive: '#a78bfa',
      pending: '#f59e0b'
    }
  },
  gradients: {
    primary: {
      type: 'linear' as const,
      colors: ['#7c3aed', '#a855f7'],
      direction: 135,
      stops: [0, 100]
    },
    secondary: {
      type: 'linear' as const,
      colors: ['#faf5ff', '#f3f0ff'],
      direction: 180,
      stops: [0, 100]
    },
    accent: {
      type: 'linear' as const,
      colors: ['#f59e0b', '#fbbf24'],
      direction: 45,
      stops: [0, 100]
    },
    background: {
      type: 'linear' as const,
      colors: ['#ffffff', '#faf5ff'],
      direction: 180,
      stops: [0, 100]
    }
  },
  visualEffects: {
    cardStyle: 'MODERN_CARD',
    accentStyle: 'ACCENT_PILL',
    heroStyle: 'SUBTLE_BACKGROUND'
  },
  industry: ['education', 'training', 'e-learning', 'academic'],
  audience: ['teachers', 'students', 'trainers', 'learners']
};

/**
 * Startup Theme
 * Bold, energetic design for startup and entrepreneurial presentations
 */
export const startupTheme: ModernTheme = {
  ...createModernBaseTheme(),
  id: 'startup-energy',
  name: 'Startup Energy',
  description: 'Bold, energetic design optimized for startup pitches and entrepreneurial presentations',
  category: 'creative',
  palette: {
    primary: '#f59e0b',        // Vibrant orange
    secondary: '#ef4444',      // Red
    accent: '#8b5cf6',         // Purple
    background: '#ffffff',     // Pure white
    surface: '#fffbeb',        // Light orange tint
    text: {
      primary: '#92400e',     // Dark orange
      secondary: '#d97706',   // Medium orange
      inverse: '#ffffff',     // White
      muted: '#fbbf24'        // Light orange
    },
    semantic: {
      success: '#10b981',     // Green
      warning: '#f59e0b',     // Orange
      error: '#ef4444',       // Red
      info: '#3b82f6'         // Blue
    },
    borders: {
      light: '#fef3c7',
      medium: '#fde68a',
      strong: '#fcd34d'
    },
    chart: ['#f59e0b', '#ef4444', '#8b5cf6', '#10b981', '#3b82f6', '#06b6d4'],
    status: {
      active: '#10b981',
      inactive: '#fbbf24',
      pending: '#f59e0b'
    }
  },
  gradients: {
    primary: {
      type: 'linear' as const,
      colors: ['#f59e0b', '#ef4444'],
      direction: 135,
      stops: [0, 100]
    },
    secondary: {
      type: 'linear' as const,
      colors: ['#fffbeb', '#fef3c7'],
      direction: 180,
      stops: [0, 100]
    },
    accent: {
      type: 'radial' as const,
      colors: ['#8b5cf6', '#7c3aed'],
      centerX: 30,
      centerY: 70,
      stops: [0, 100]
    },
    background: {
      type: 'linear' as const,
      colors: ['#ffffff', '#fffbeb'],
      direction: 180,
      stops: [0, 100]
    }
  },
  visualEffects: {
    cardStyle: 'ELEVATED_CARD',
    accentStyle: 'ACCENT_PILL',
    heroStyle: 'HERO_GRADIENT'
  },
  industry: ['startup', 'entrepreneurship', 'venture-capital', 'innovation'],
  audience: ['entrepreneurs', 'investors', 'startup-teams', 'accelerators']
};

/**
 * Collection of all modern themes
 */
export const MODERN_THEMES: ModernTheme[] = [
  minimalistTheme,
  techInnovationTheme,
  luxuryExecutiveTheme,
  creativeStudioTheme,
  healthcareTheme,
  financialTheme,
  educationTheme,
  startupTheme
];

/**
 * Get modern theme by ID
 */
export function getModernTheme(id: string): ModernTheme | undefined {
  return MODERN_THEMES.find(theme => theme.id === id);
}

/**
 * Get themes by category
 */
export function getThemesByCategory(category: ModernTheme['category']): ModernTheme[] {
  return MODERN_THEMES.filter(theme => theme.category === category);
}

/**
 * Get themes by industry
 */
export function getThemesByIndustry(industry: string): ModernTheme[] {
  return MODERN_THEMES.filter(theme => 
    theme.industry?.some(ind => ind.toLowerCase().includes(industry.toLowerCase()))
  );
}

/**
 * Get themes by audience
 */
export function getThemesByAudience(audience: string): ModernTheme[] {
  return MODERN_THEMES.filter(theme => 
    theme.audience?.some(aud => aud.toLowerCase().includes(audience.toLowerCase()))
  );
}
