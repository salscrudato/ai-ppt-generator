/**
 * Theme Context Provider
 * 
 * Provides global theme management across the application with persistence
 * and real-time theme switching capabilities.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { ProfessionalTheme } from '../themes/simplifiedThemes';
import { getThemeById, getDefaultTheme } from '../themes/simplifiedThemes';
import { applyGlobalTheme, removeGlobalTheme } from '../utils/themeUtils';

interface ThemeContextType {
  /** Currently selected theme */
  currentTheme: ProfessionalTheme;
  /** Theme ID */
  themeId: string;
  /** Set a new theme */
  setTheme: (themeId: string) => void;
  /** Reset to default theme */
  resetTheme: () => void;
  /** Whether theme is being applied globally */
  globalThemeEnabled: boolean;
  /** Toggle global theme application */
  toggleGlobalTheme: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  /** Initial theme ID */
  initialThemeId?: string;
  /** Whether to apply theme globally to document */
  enableGlobalTheme?: boolean;
  /** Whether to persist theme selection in localStorage */
  persistTheme?: boolean;
}

const THEME_STORAGE_KEY = 'ai-ppt-ai-ppt-selected-theme';
const GLOBAL_THEME_STORAGE_KEY = 'ai-ppt-global-theme';

export function ThemeProvider({
  children,
  initialThemeId,
  enableGlobalTheme = false,
  persistTheme = true
}: ThemeProviderProps) {
  // Initialize theme from props, localStorage, or default
  const [themeId, setThemeIdState] = useState<string>(() => {
    if (initialThemeId) return initialThemeId;
    if (persistTheme && typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored) return stored;
    }
    return getDefaultTheme().id;
  });

  // Initialize global theme setting
  const [globalThemeEnabled, setGlobalThemeEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(GLOBAL_THEME_STORAGE_KEY);
      return stored ? JSON.parse(stored) : enableGlobalTheme;
    }
    return enableGlobalTheme;
  });

  // Get current theme object
  const currentTheme = getThemeById(themeId) || getDefaultTheme();

  // Apply global theme when enabled
  useEffect(() => {
    if (globalThemeEnabled) {
      applyGlobalTheme(currentTheme);
    } else {
      removeGlobalTheme();
    }

    return () => {
      if (globalThemeEnabled) {
        removeGlobalTheme();
      }
    };
  }, [currentTheme, globalThemeEnabled]);

  // Persist theme selection
  useEffect(() => {
    if (persistTheme && typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, themeId);
    }
  }, [themeId, persistTheme]);

  // Persist global theme setting
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(GLOBAL_THEME_STORAGE_KEY, JSON.stringify(globalThemeEnabled));
    }
  }, [globalThemeEnabled]);

  const setTheme = (newThemeId: string) => {
    const theme = getThemeById(newThemeId);
    if (theme) {
      setThemeIdState(newThemeId);
    }
  };

  const resetTheme = () => {
    setThemeIdState(getDefaultTheme().id);
  };

  const toggleGlobalTheme = (enabled: boolean) => {
    setGlobalThemeEnabled(enabled);
  };

  const contextValue: ThemeContextType = {
    currentTheme,
    themeId,
    setTheme,
    resetTheme,
    globalThemeEnabled,
    toggleGlobalTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to use theme context
 */
export function useThemeContext(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Hook to get current theme (works with or without context)
 */
export function useCurrentTheme(fallbackThemeId?: string): ProfessionalTheme {
  try {
    const { currentTheme } = useThemeContext();
    return currentTheme;
  } catch {
    // Fallback when not in context
    return getThemeById(fallbackThemeId || '') || getDefaultTheme();
  }
}

/**
 * Higher-order component to provide theme context
 */
export function withTheme<P extends object>(
  Component: React.ComponentType<P>,
  themeId?: string
) {
  return function ThemedComponent(props: P) {
    return (
      <ThemeProvider initialThemeId={themeId}>
        <Component {...props} />
      </ThemeProvider>
    );
  };
}

/**
 * Theme-aware component wrapper
 */
interface ThemedProps {
  children: (theme: ProfessionalTheme) => ReactNode;
  themeId?: string;
}

export function Themed({ children, themeId }: ThemedProps) {
  const theme = useCurrentTheme(themeId);
  return <>{children(theme)}</>;
}

/**
 * Theme selector component for quick theme switching
 */
interface ThemeSelectorProps {
  className?: string;
}

export function ThemeSelector({ className = '' }: ThemeSelectorProps) {
  const { themeId } = useThemeContext();

  return (
    <div className={className}>
      {/* This would integrate with ThemeGallery component */}
      <div className="text-sm text-slate-600">
        Current theme: {themeId}
      </div>
    </div>
  );
}

export default ThemeContext;
