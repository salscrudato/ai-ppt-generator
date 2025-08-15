/**
 * Theme Management System
 * 
 * Provides dynamic theme switching capabilities with CSS custom properties
 * and Tailwind class management for consistent styling across the application.
 * 
 * Features:
 * - Dynamic theme switching
 * - CSS custom property management
 * - Tailwind class utilities
 * - Theme persistence
 * - Responsive theme handling
 * 
 * @version 1.0.0
 */

import type { ProfessionalTheme } from '../themes/professionalThemes';

/**
 * Theme configuration interface
 */
export interface ThemeConfig {
  id: string;
  name: string;
  colors: Record<string, string>;
  typography: Record<string, string>;
  spacing: Record<string, string>;
  shadows: Record<string, string>;
}

/**
 * Theme manager class
 */
export class ThemeManager {
  private currentTheme: string = 'corporate';
  private themes: Map<string, ThemeConfig> = new Map();
  private cssVariables: Map<string, string> = new Map();

  constructor() {
    this.initializeDefaultThemes();
    this.loadPersistedTheme();
  }

  /**
   * Initialize default theme configurations
   */
  private initializeDefaultThemes(): void {
    const defaultThemes: ThemeConfig[] = [
      {
        id: 'corporate',
        name: 'Corporate',
        colors: {
          'theme-primary': '#1e40af',
          'theme-secondary': '#64748b',
          'theme-accent': '#0ea5e9',
          'theme-background': '#ffffff',
          'theme-surface': '#f8fafc',
          'theme-text': '#1e293b',
          'theme-text-muted': '#64748b',
          'theme-border': '#e2e8f0',
          'theme-success': '#059669',
          'theme-warning': '#d97706',
          'theme-error': '#dc2626',
        },
        typography: {
          'theme-font-primary': 'Inter, system-ui, sans-serif',
          'theme-font-secondary': 'Inter, system-ui, sans-serif',
          'theme-font-mono': 'JetBrains Mono, monospace',
        },
        spacing: {
          'theme-spacing-xs': '0.25rem',
          'theme-spacing-sm': '0.5rem',
          'theme-spacing-md': '1rem',
          'theme-spacing-lg': '1.5rem',
          'theme-spacing-xl': '2rem',
        },
        shadows: {
          'theme-shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          'theme-shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          'theme-shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        }
      },
      {
        id: 'creative',
        name: 'Creative',
        colors: {
          'theme-primary': '#7c3aed',
          'theme-secondary': '#ec4899',
          'theme-accent': '#f59e0b',
          'theme-background': '#fefefe',
          'theme-surface': '#faf5ff',
          'theme-text': '#1f2937',
          'theme-text-muted': '#6b7280',
          'theme-border': '#e5e7eb',
          'theme-success': '#059669',
          'theme-warning': '#d97706',
          'theme-error': '#dc2626',
        },
        typography: {
          'theme-font-primary': 'Inter, system-ui, sans-serif',
          'theme-font-secondary': 'Inter, system-ui, sans-serif',
          'theme-font-mono': 'JetBrains Mono, monospace',
        },
        spacing: {
          'theme-spacing-xs': '0.25rem',
          'theme-spacing-sm': '0.5rem',
          'theme-spacing-md': '1rem',
          'theme-spacing-lg': '1.5rem',
          'theme-spacing-xl': '2rem',
        },
        shadows: {
          'theme-shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          'theme-shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          'theme-shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        }
      },
      {
        id: 'academic',
        name: 'Academic',
        colors: {
          'theme-primary': '#059669',
          'theme-secondary': '#0f766e',
          'theme-accent': '#0891b2',
          'theme-background': '#ffffff',
          'theme-surface': '#f0fdf4',
          'theme-text': '#064e3b',
          'theme-text-muted': '#6b7280',
          'theme-border': '#d1fae5',
          'theme-success': '#059669',
          'theme-warning': '#d97706',
          'theme-error': '#dc2626',
        },
        typography: {
          'theme-font-primary': 'Inter, system-ui, sans-serif',
          'theme-font-secondary': 'Inter, system-ui, sans-serif',
          'theme-font-mono': 'JetBrains Mono, monospace',
        },
        spacing: {
          'theme-spacing-xs': '0.25rem',
          'theme-spacing-sm': '0.5rem',
          'theme-spacing-md': '1rem',
          'theme-spacing-lg': '1.5rem',
          'theme-spacing-xl': '2rem',
        },
        shadows: {
          'theme-shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          'theme-shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          'theme-shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        }
      }
    ];

    defaultThemes.forEach(theme => {
      this.themes.set(theme.id, theme);
    });
  }

  /**
   * Load persisted theme from localStorage
   */
  private loadPersistedTheme(): void {
    try {
      const savedTheme = localStorage.getItem('app-theme');
      if (savedTheme && this.themes.has(savedTheme)) {
        this.currentTheme = savedTheme;
      }
    } catch (error) {
      console.warn('Failed to load persisted theme:', error);
    }
  }

  /**
   * Apply theme to the document
   */
  applyTheme(themeId: string): void {
    const theme = this.themes.get(themeId);
    if (!theme) {
      console.warn(`Theme not found: ${themeId}`);
      return;
    }

    this.currentTheme = themeId;

    // Apply CSS custom properties
    this.applyCSSVariables(theme);

    // Apply theme class to document
    this.applyThemeClass(themeId);

    // Persist theme choice
    this.persistTheme(themeId);

    console.log(`Applied theme: ${theme.name}`);
  }

  /**
   * Apply CSS custom properties
   */
  private applyCSSVariables(theme: ThemeConfig): void {
    const root = document.documentElement;

    // Apply colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
      this.cssVariables.set(key, value);
    });

    // Apply typography
    Object.entries(theme.typography).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
      this.cssVariables.set(key, value);
    });

    // Apply spacing
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
      this.cssVariables.set(key, value);
    });

    // Apply shadows
    Object.entries(theme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
      this.cssVariables.set(key, value);
    });
  }

  /**
   * Apply theme class to document body
   */
  private applyThemeClass(themeId: string): void {
    const body = document.body;
    
    // Remove existing theme classes
    this.themes.forEach((_, id) => {
      body.classList.remove(`theme-${id}`);
    });

    // Add new theme class
    body.classList.add(`theme-${themeId}`);
  }

  /**
   * Persist theme choice to localStorage
   */
  private persistTheme(themeId: string): void {
    try {
      localStorage.setItem('app-theme', themeId);
    } catch (error) {
      console.warn('Failed to persist theme:', error);
    }
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): string {
    return this.currentTheme;
  }

  /**
   * Get available themes
   */
  getAvailableThemes(): ThemeConfig[] {
    return Array.from(this.themes.values());
  }

  /**
   * Get theme configuration
   */
  getThemeConfig(themeId: string): ThemeConfig | undefined {
    return this.themes.get(themeId);
  }

  /**
   * Register a new theme
   */
  registerTheme(theme: ThemeConfig): void {
    this.themes.set(theme.id, theme);
  }

  /**
   * Get CSS variable value
   */
  getCSSVariable(name: string): string | undefined {
    return this.cssVariables.get(name);
  }

  /**
   * Generate Tailwind classes for current theme
   */
  getThemeClasses(): Record<string, string> {
    const theme = this.themes.get(this.currentTheme);
    if (!theme) return {};

    return {
      primary: `bg-${this.currentTheme}-primary`,
      secondary: `bg-${this.currentTheme}-secondary`,
      accent: `bg-${this.currentTheme}-accent`,
      surface: `bg-${this.currentTheme}-surface`,
      text: `text-${this.currentTheme}-text`,
      textMuted: `text-${this.currentTheme}-text-muted`,
      border: `border-${this.currentTheme}-border`,
    };
  }

  /**
   * Initialize theme system
   */
  initialize(): void {
    // Apply initial theme
    this.applyTheme(this.currentTheme);

    // Listen for system theme changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        // Handle system theme changes if needed
        console.log('System theme changed:', e.matches ? 'dark' : 'light');
      });
    }
  }

  /**
   * Create theme from ProfessionalTheme
   */
  createThemeFromProfessional(professionalTheme: ProfessionalTheme): ThemeConfig {
    return {
      id: professionalTheme.id,
      name: professionalTheme.name,
      colors: {
        'theme-primary': professionalTheme.colors.primary,
        'theme-secondary': professionalTheme.colors.secondary,
        'theme-accent': professionalTheme.colors.accent,
        'theme-background': professionalTheme.colors.background,
        'theme-surface': professionalTheme.colors.surface,
        'theme-text': professionalTheme.colors.text.primary,
        'theme-text-muted': professionalTheme.colors.text.muted,
        'theme-border': professionalTheme.colors.borders.light,
        'theme-success': professionalTheme.colors.semantic.success,
        'theme-warning': professionalTheme.colors.semantic.warning,
        'theme-error': professionalTheme.colors.semantic.error,
      },
      typography: {
        'theme-font-primary': professionalTheme.typography.headings.fontFamily,
        'theme-font-secondary': professionalTheme.typography.body.fontFamily,
        'theme-font-mono': 'JetBrains Mono, monospace',
      },
      spacing: {
        'theme-spacing-xs': '0.25rem',
        'theme-spacing-sm': '0.5rem',
        'theme-spacing-md': '1rem',
        'theme-spacing-lg': '1.5rem',
        'theme-spacing-xl': '2rem',
      },
      shadows: {
        'theme-shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'theme-shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        'theme-shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      }
    };
  }
}

// Export singleton instance
export const themeManager = new ThemeManager();
export default themeManager;
