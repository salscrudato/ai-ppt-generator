/**
 * Enhanced Theme Synchronization Hook
 * 
 * Provides centralized theme management that ensures consistent theme state
 * across all components and modes, eliminating race conditions and ensuring
 * proper theme propagation between single slide and presentation modes.
 * 
 * Features:
 * - Centralized theme state management
 * - Race condition prevention with debouncing
 * - Consistent localStorage management
 * - Mode-aware theme synchronization
 * - Automatic theme propagation
 * - Debug logging for troubleshooting
 * 
 * @version 2.0.0
 * @author AI PowerPoint Generator Team
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useThemeContext } from '../contexts/ThemeContext';
import { getThemeById, getDefaultTheme } from '../themes/professionalThemes';
import type { ProfessionalTheme } from '../themes/professionalThemes';

// Standardized storage keys
const THEME_STORAGE_KEYS = {
  SELECTED_THEME: 'ai-ppt-selected-theme',
  PRESENTATION_THEME: 'ai-ppt-presentation-theme',
  SINGLE_MODE_THEME: 'ai-ppt-single-mode-theme'
} as const;

// Debounce timing for theme updates
const SYNC_DEBOUNCE_MS = 100;
const STORAGE_DEBOUNCE_MS = 300;

export interface ThemeSyncState {
  /** Current active theme */
  currentTheme: ProfessionalTheme;
  /** Current theme ID */
  themeId: string;
  /** Whether theme is being synchronized */
  isSyncing: boolean;
  /** Last sync timestamp for debugging */
  lastSyncTime: number;
}

export interface ThemeSyncActions {
  /** Set theme with automatic synchronization */
  setTheme: (themeId: string, source?: string) => void;
  /** Force synchronization of theme state */
  forceSync: () => void;
  /** Reset to default theme */
  resetTheme: () => void;
  /** Get theme for specific mode */
  getThemeForMode: (mode: 'single' | 'presentation') => string;
  /** Set theme for specific mode */
  setThemeForMode: (mode: 'single' | 'presentation', themeId: string) => void;
}

export interface UseThemeSyncOptions {
  /** Current application mode */
  mode?: 'single' | 'presentation';
  /** Initial theme ID */
  initialThemeId?: string;
  /** Whether to persist theme changes */
  persistTheme?: boolean;
  /** Enable debug logging */
  debug?: boolean;
  /** Custom storage prefix */
  storagePrefix?: string;
}

export interface UseThemeSyncReturn extends ThemeSyncState, ThemeSyncActions {
  /** Whether theme sync is available */
  isAvailable: boolean;
  /** Error state if any */
  error: string | null;
}

/**
 * Enhanced theme synchronization hook
 */
export function useThemeSync(options: UseThemeSyncOptions = {}): UseThemeSyncReturn {
  const {
    mode = 'single',
    initialThemeId,
    persistTheme = true,
    debug = false,
    storagePrefix = 'ai-ppt'
  } = options;

  // Get theme context
  const { 
    currentTheme: contextTheme, 
    themeId: contextThemeId, 
    setTheme: setContextTheme 
  } = useThemeContext();

  // Internal state
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(Date.now());
  const [error, setError] = useState<string | null>(null);

  // Refs for debouncing
  const syncTimeoutRef = useRef<NodeJS.Timeout>();
  const storageTimeoutRef = useRef<NodeJS.Timeout>();
  const lastThemeRef = useRef<string>(contextThemeId);

  // Debug logging helper
  const debugLog = useCallback((message: string, data?: any) => {
    if (debug) {
      console.log(`🎨 ThemeSync [${mode}]: ${message}`, data || '');
    }
  }, [debug, mode]);

  // Get storage key for current mode
  const getStorageKey = useCallback((key: keyof typeof THEME_STORAGE_KEYS) => {
    return `${storagePrefix}-${THEME_STORAGE_KEYS[key]}`;
  }, [storagePrefix]);

  // Load theme from storage
  const loadThemeFromStorage = useCallback((): string => {
    if (typeof window === 'undefined' || !persistTheme) {
      return initialThemeId || getDefaultTheme().id;
    }

    try {
      // Try mode-specific theme first
      const modeKey = mode === 'presentation' ? 'PRESENTATION_THEME' : 'SINGLE_MODE_THEME';
      const modeTheme = localStorage.getItem(getStorageKey(modeKey));
      if (modeTheme) {
        debugLog('Loaded theme from mode-specific storage', { theme: modeTheme, mode });
        return modeTheme;
      }

      // Fall back to general selected theme
      const selectedTheme = localStorage.getItem(getStorageKey('SELECTED_THEME'));
      if (selectedTheme) {
        debugLog('Loaded theme from general storage', { theme: selectedTheme });
        return selectedTheme;
      }

      // Use initial theme or default
      const fallbackTheme = initialThemeId || getDefaultTheme().id;
      debugLog('Using fallback theme', { theme: fallbackTheme });
      return fallbackTheme;
    } catch (error) {
      debugLog('Error loading theme from storage', error);
      setError('Failed to load theme from storage');
      return getDefaultTheme().id;
    }
  }, [mode, initialThemeId, persistTheme, getStorageKey, debugLog]);

  // Save theme to storage
  const saveThemeToStorage = useCallback((themeId: string) => {
    if (typeof window === 'undefined' || !persistTheme) return;

    // Clear existing timeout
    if (storageTimeoutRef.current) {
      clearTimeout(storageTimeoutRef.current);
    }

    // Debounce storage writes
    storageTimeoutRef.current = setTimeout(() => {
      try {
        // Save to general selected theme
        localStorage.setItem(getStorageKey('SELECTED_THEME'), themeId);
        
        // Save to mode-specific storage
        const modeKey = mode === 'presentation' ? 'PRESENTATION_THEME' : 'SINGLE_MODE_THEME';
        localStorage.setItem(getStorageKey(modeKey), themeId);
        
        debugLog('Saved theme to storage', { theme: themeId, mode });
      } catch (error) {
        debugLog('Error saving theme to storage', error);
        setError('Failed to save theme to storage');
      }
    }, STORAGE_DEBOUNCE_MS);
  }, [mode, persistTheme, getStorageKey, debugLog]);

  // Synchronize theme with context
  const syncThemeWithContext = useCallback((themeId: string, source: string = 'unknown') => {
    // Clear existing timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    setIsSyncing(true);

    // Debounce sync operations
    syncTimeoutRef.current = setTimeout(() => {
      try {
        // Validate theme exists
        const theme = getThemeById(themeId);
        if (!theme) {
          debugLog('Invalid theme ID, using default', { themeId });
          themeId = getDefaultTheme().id;
        }

        // Only update context if different
        if (contextThemeId !== themeId) {
          setContextTheme(themeId);
          debugLog('Updated context theme', { 
            theme: themeId, 
            previous: contextThemeId, 
            source 
          });
        }

        // Save to storage
        saveThemeToStorage(themeId);

        // Update tracking
        lastThemeRef.current = themeId;
        setLastSyncTime(Date.now());
        setError(null);

        debugLog('Theme sync completed', { 
          theme: themeId, 
          source, 
          mode 
        });
      } catch (error) {
        debugLog('Error during theme sync', error);
        setError('Theme synchronization failed');
      } finally {
        setIsSyncing(false);
      }
    }, SYNC_DEBOUNCE_MS);
  }, [contextThemeId, setContextTheme, saveThemeToStorage, debugLog, mode]);

  // Public API: Set theme
  const setTheme = useCallback((themeId: string, source: string = 'user') => {
    debugLog('Theme change requested', { theme: themeId, source });
    
    // Validate theme
    const theme = getThemeById(themeId);
    if (!theme) {
      debugLog('Invalid theme ID provided', { themeId });
      setError(`Invalid theme ID: ${themeId}`);
      return;
    }

    // Prevent unnecessary updates
    if (themeId === lastThemeRef.current) {
      debugLog('Theme already set, skipping update', { theme: themeId });
      return;
    }

    syncThemeWithContext(themeId, source);
  }, [syncThemeWithContext, debugLog]);

  // Public API: Force sync
  const forceSync = useCallback(() => {
    debugLog('Force sync requested');
    const currentThemeId = contextThemeId || getDefaultTheme().id;
    syncThemeWithContext(currentThemeId, 'force-sync');
  }, [contextThemeId, syncThemeWithContext, debugLog]);

  // Public API: Reset theme
  const resetTheme = useCallback(() => {
    debugLog('Theme reset requested');
    const defaultThemeId = getDefaultTheme().id;
    syncThemeWithContext(defaultThemeId, 'reset');
  }, [syncThemeWithContext, debugLog]);

  // Public API: Get theme for mode
  const getThemeForMode = useCallback((targetMode: 'single' | 'presentation'): string => {
    if (typeof window === 'undefined') return getDefaultTheme().id;

    try {
      const modeKey = targetMode === 'presentation' ? 'PRESENTATION_THEME' : 'SINGLE_MODE_THEME';
      const stored = localStorage.getItem(getStorageKey(modeKey));
      return stored || getDefaultTheme().id;
    } catch {
      return getDefaultTheme().id;
    }
  }, [getStorageKey]);

  // Public API: Set theme for mode
  const setThemeForMode = useCallback((targetMode: 'single' | 'presentation', themeId: string) => {
    if (typeof window === 'undefined') return;

    try {
      const modeKey = targetMode === 'presentation' ? 'PRESENTATION_THEME' : 'SINGLE_MODE_THEME';
      localStorage.setItem(getStorageKey(modeKey), themeId);
      debugLog('Set theme for mode', { mode: targetMode, theme: themeId });
      
      // If setting for current mode, also sync
      if (targetMode === mode) {
        setTheme(themeId, `mode-${targetMode}`);
      }
    } catch (error) {
      debugLog('Error setting theme for mode', error);
    }
  }, [getStorageKey, debugLog, mode, setTheme]);

  // Initialize theme on mount and mode changes
  useEffect(() => {
    const storedTheme = loadThemeFromStorage();
    debugLog('Initializing theme sync', {
      storedTheme,
      contextTheme: contextThemeId,
      mode
    });

    // Use stored theme if different from context
    if (storedTheme && storedTheme !== contextThemeId) {
      syncThemeWithContext(storedTheme, 'initialization');
    } else if (contextThemeId) {
      // Ensure storage is updated with current context theme
      saveThemeToStorage(contextThemeId);
      lastThemeRef.current = contextThemeId;
    }
  }, [mode]); // Only re-run when mode changes

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      if (storageTimeoutRef.current) {
        clearTimeout(storageTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    currentTheme: contextTheme,
    themeId: contextThemeId,
    isSyncing,
    lastSyncTime,

    // Actions
    setTheme,
    forceSync,
    resetTheme,
    getThemeForMode,
    setThemeForMode,

    // Status
    isAvailable: true,
    error
  };
}

/**
 * Utility function to clean up conflicting theme storage
 */
export function cleanupThemeStorage(): void {
  if (typeof window === 'undefined') return;

  const keysToRemove = [
    'ai-ppt-theme',
    'theme-selection',
    'app-theme',
    'ai-ppt-selected-theme' // Old format without prefix
  ];

  keysToRemove.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove conflicting theme storage key: ${key}`, error);
    }
  });
}

/**
 * Utility function to migrate old theme storage to new format
 */
export function migrateThemeStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    // Check for old theme storage (in order of preference)
    const oldTheme = localStorage.getItem('ai-ppt-selected-theme') || // Old format without prefix
                    localStorage.getItem('ai-ppt-theme') ||
                    localStorage.getItem('theme-selection') ||
                    localStorage.getItem('app-theme');

    if (oldTheme) {
      // Migrate to new standardized format
      const newKey = `ai-ppt-${THEME_STORAGE_KEYS.SELECTED_THEME}`;
      localStorage.setItem(newKey, oldTheme);
      console.log('🔄 Migrated theme storage to new format:', { oldTheme, newKey });

      // Clean up old keys
      cleanupThemeStorage();
    }
  } catch (error) {
    console.warn('Failed to migrate theme storage:', error);
  }
}
